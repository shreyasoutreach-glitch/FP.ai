"""Analysis endpoints — the core FP.ai engine."""
import os
import time
import logging
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.models.analysis import Analysis
from app.services.extractor import extract_text_from_bytes, segment_into_clauses, detect_contract_type
from app.services.gemini_service import analyze_with_gemini, explain_clause
from app.services.demo_data import get_demo_contract, list_demo_contracts

logger = logging.getLogger("fpai.analysis")
router = APIRouter()


class AnalysisRequest(BaseModel):
    document_id: str
    use_gemini: bool = True


class ClauseExplainRequest(BaseModel):
    clause_text: str
    context: Optional[str] = ""


class AnalysisResponse(BaseModel):
    analysis_id: str
    document_id: str
    contract_type: str
    overall_risk_score: float
    overall_risk_rating: str
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_clauses: int
    readability_score: float
    power_imbalance_score: int
    executive_summary: str
    clauses: list
    gemini_analysis: dict
    recommendations: list
    top_risks: list
    processing_time_ms: int
    status: str


async def _execute_analysis_pipeline(
    doc: Document,
    text: str,
    page_count: int,
    ml_engine: Any,
    use_gemini: bool,
    db: AsyncSession,
) -> AnalysisResponse:
    """Core analysis pipeline shared across document uploads and demo contract endpoints."""
    start_time = time.time()
    contract_type = detect_contract_type(text)
    clauses_text = segment_into_clauses(text)

    # ML clause analysis
    clause_analyses = ml_engine.analyze_clauses(clauses_text, doc.id)

    # Gemini analysis (or rule-based fallback)
    gemini_result = {}
    if use_gemini and settings.GEMINI_API_KEY.strip():
        try:
            gemini_result = await analyze_with_gemini(
                text, clause_analyses, contract_type, doc.original_name
            )
        except Exception as e:
            logger.warning(f"Gemini analysis skipped: {e}")
    elif use_gemini:
        logger.info("Gemini was requested but GEMINI_API_KEY is not configured; continuing without the optional LLM layer.")

    # Aggregate scores
    risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    total_risk = 0.0
    total_readability = 0.0
    for c in clause_analyses:
        risk_counts[c.risk_level] = risk_counts.get(c.risk_level, 0) + 1
        total_risk += c.risk_score
        total_readability += c.readability_score

    avg_risk = total_risk / max(len(clause_analyses), 1)
    avg_readability = total_readability / max(len(clause_analyses), 1)

    if risk_counts["critical"] >= 1:
        overall_rating = "critical"
    elif risk_counts["high"] >= 2:
        overall_rating = "high"
    elif risk_counts["high"] >= 1 or risk_counts["medium"] >= 3:
        overall_rating = "medium"
    else:
        overall_rating = "low"

    executive_summary = gemini_result.get(
        "executive_summary",
        f"Analysis complete. Identified {risk_counts['critical']} critical and "
        f"{risk_counts['high']} high-risk clauses in this {contract_type}."
    )
    recommendations = gemini_result.get("recommendations", [])
    top_risks = gemini_result.get("top_risks", [])
    # Keep this deterministic and grounded in the analyzed clauses; an LLM-generated
    # scalar is not used as a substitute for a documented scoring rule.
    aggregate = ml_engine.aggregate_document_analysis(
        clause_analyses,
        document_id=doc.id,
        document_name=doc.original_name,
        contract_type=contract_type,
    )
    power_imbalance = aggregate.power_imbalance_score

    # Populate top risks from ML if gemini did not provide them
    if not top_risks:
        for c in sorted(clause_analyses, key=lambda x: x.risk_score, reverse=True)[:5]:
            if c.risk_level in ("critical", "high"):
                top_risks.append({
                    "title": c.matched_pattern or c.category,
                    "severity": c.risk_level,
                    "explanation": c.plain_english,
                    "clause_excerpt": c.text[:250],
                    "legal_reference": c.legal_basis,
                    "negotiation_tip": c.mitigation,
                })

    if not recommendations:
        if risk_counts["critical"] > 0:
            recommendations.append("Strike out or renegotiate critical void restraint/uncapped liability terms.")
        if risk_counts["high"] > 0:
            recommendations.append("Add bilateral notice periods and mutual liability caps.")
        recommendations.append("Consult legal counsel in the governing jurisdiction before executing.")

    processing_ms = int((time.time() - start_time) * 1000)

    clauses_serialized = [
        {
            "text": c.text,
            "start_char": c.start_char,
            "end_char": c.end_char,
            "category": c.category,
            "risk_level": c.risk_level,
            "risk_score": c.risk_score,
            "matched_pattern": c.matched_pattern,
            "plain_english": c.plain_english,
            "mitigation": c.mitigation,
            "legal_basis": c.legal_basis,
            "anomaly_score": c.anomaly_score,
            "cluster_id": c.cluster_id,
            "is_anomaly": c.is_anomaly,
            "readability_score": c.readability_score,
            "flags": c.flags,
            "match_strength": c.match_strength,
            "risk_score_breakdown": c.risk_score_breakdown,
        }
        for c in clause_analyses
    ]

    analysis = Analysis(
        document_id=doc.id,
        contract_type=contract_type,
        overall_risk_score=round(avg_risk, 1),
        overall_risk_rating=overall_rating,
        critical_count=risk_counts["critical"],
        high_count=risk_counts["high"],
        medium_count=risk_counts["medium"],
        low_count=risk_counts.get("low", 0),
        total_clauses=len(clause_analyses),
        readability_score=round(avg_readability, 1),
        power_imbalance_score=int(power_imbalance),
        executive_summary=executive_summary,
        clauses_json=clauses_serialized,
        gemini_analysis=gemini_result,
        recommendations=recommendations,
        top_risks=top_risks,
        status="completed",
        processing_time_ms=processing_ms,
    )
    db.add(analysis)

    doc.status = "analyzed"
    doc.contract_type = contract_type
    doc.word_count = len(text.split())
    doc.page_count = page_count
    await db.commit()
    await db.refresh(analysis)

    return AnalysisResponse(
        analysis_id=analysis.id,
        document_id=doc.id,
        contract_type=contract_type,
        overall_risk_score=analysis.overall_risk_score,
        overall_risk_rating=overall_rating,
        critical_count=risk_counts["critical"],
        high_count=risk_counts["high"],
        medium_count=risk_counts["medium"],
        low_count=risk_counts.get("low", 0),
        total_clauses=len(clause_analyses),
        readability_score=round(avg_readability, 1),
        power_imbalance_score=int(power_imbalance),
        executive_summary=executive_summary,
        clauses=clauses_serialized,
        gemini_analysis=gemini_result,
        recommendations=recommendations,
        top_risks=top_risks,
        processing_time_ms=processing_ms,
        status="completed",
    )


@router.get("/demos")
@router.get("/demo")
async def list_demos():
    """List all available demo contracts ready for instant analysis."""
    return {"demos": list_demo_contracts()}


@router.api_route("/demo/{sample_id}", methods=["GET", "POST"], response_model=AnalysisResponse)
async def load_demo_analysis(
    sample_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Direct demo loading endpoint.
    Users can test the platform instantly without uploading external files.
    Accepts GET or POST.
    """
    demo = get_demo_contract(sample_id)
    if not demo:
        available = [d["id"] for d in list_demo_contracts()]
        raise HTTPException(
            status_code=404,
            detail=f"Demo sample '{sample_id}' not found. Available samples: {', '.join(available)}",
        )

    # Demo source is stored durably in Neon, not on Render's ephemeral filesystem.
    filename = demo["filename"]
    demo_bytes = demo["text"].encode("utf-8")

    # Create or update document record
    doc_id = f"demo-{demo['id']}"
    existing_doc_res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = existing_doc_res.scalar_one_or_none()

    if not doc:
        doc = Document(
            id=doc_id,
            filename=filename,
            original_name=demo["title"],
            file_size=len(demo["text"].encode("utf-8")),
            file_type="txt",
            upload_path="",
            file_data=demo_bytes,
            word_count=len(demo["text"].split()),
            page_count=max(1, len(demo["text"]) // 2500),
            contract_type=demo["contract_type"],
            status="uploaded",
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
    elif doc.file_data is None:
        # Backfill demo rows created before durable payload storage was enabled.
        doc.file_data = demo_bytes
        await db.commit()

    ml_engine = getattr(request.app.state, "ml_engine", None)
    if not ml_engine:
        from app.ml.engine import FPMLEngine
        ml_engine = FPMLEngine()
        request.app.state.ml_engine = ml_engine

    return await _execute_analysis_pipeline(
        doc=doc,
        text=demo["text"],
        page_count=doc.page_count,
        ml_engine=ml_engine,
        use_gemini=False,  # Fallback rule-based/ML analysis for instantaneous demo response
        db=db,
    )


@router.post("/run", response_model=AnalysisResponse)
async def run_analysis(
    req: AnalysisRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Run full ML + Gemini analysis on an uploaded document."""
    # Fetch document
    result = await db.execute(select(Document).where(Document.id == req.document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")

    doc.status = "processing"
    await db.commit()

    try:
        # Prefer durable database payloads. Fall back to legacy local files only
        # for records created before durable payload storage was enabled.
        if doc.file_data is not None:
            content = bytes(doc.file_data)
        elif doc.upload_path and os.path.isfile(doc.upload_path):
            with open(doc.upload_path, "rb") as legacy_file:
                content = legacy_file.read()
        else:
            raise HTTPException(404, "Stored document payload is unavailable. Please upload the contract again.")

        text, page_count = extract_text_from_bytes(content, doc.original_name)

        ml_engine = getattr(request.app.state, "ml_engine", None)
        if not ml_engine:
            from app.ml.engine import FPMLEngine
            ml_engine = FPMLEngine()
            request.app.state.ml_engine = ml_engine

        return await _execute_analysis_pipeline(
            doc=doc,
            text=text,
            page_count=page_count,
            ml_engine=ml_engine,
            use_gemini=req.use_gemini,
            db=db,
        )

    except HTTPException:
        # Preserve deliberate API errors (for example, a missing legacy payload)
        # instead of disguising them as an internal server error.
        doc.status = "error"
        await db.commit()
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        doc.status = "error"
        await db.commit()
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    return AnalysisResponse(
        analysis_id=analysis.id,
        document_id=analysis.document_id,
        contract_type=analysis.contract_type,
        overall_risk_score=analysis.overall_risk_score,
        overall_risk_rating=analysis.overall_risk_rating,
        critical_count=analysis.critical_count,
        high_count=analysis.high_count,
        medium_count=analysis.medium_count,
        low_count=analysis.low_count,
        total_clauses=analysis.total_clauses,
        readability_score=analysis.readability_score,
        power_imbalance_score=analysis.power_imbalance_score,
        executive_summary=analysis.executive_summary,
        clauses=analysis.clauses_json or [],
        gemini_analysis=analysis.gemini_analysis or {},
        recommendations=analysis.recommendations or [],
        top_risks=analysis.top_risks or [],
        processing_time_ms=analysis.processing_time_ms,
        status=analysis.status,
    )


@router.post("/explain-clause")
async def explain_clause_endpoint(req: ClauseExplainRequest):
    """Get plain-English AI explanation for any clause text."""
    result = await explain_clause(req.clause_text, req.context or "")
    return result


@router.get("/document/{document_id}")
async def get_analysis_by_document(document_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Analysis).where(Analysis.document_id == document_id)
        .order_by(Analysis.created_at.desc())
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "No analysis found for this document")
    return {"analysis_id": analysis.id, "status": analysis.status}
