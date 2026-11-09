"""Report generation — PDF and JSON export."""
import io
import json
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.routes.auth import require_auth
from app.models.analysis import Analysis
from app.models.document import Document
from app.services.reports_service import generate_pdf_report

logger = logging.getLogger("fpai.reports")
router = APIRouter()


@router.get("/{analysis_id}/pdf")
async def export_pdf(analysis_id: str, db: AsyncSession = Depends(get_db), _session=Depends(require_auth)):
    """Generate a clean, styled PDF vulnerability report."""
    a_result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = a_result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    d_result = await db.execute(select(Document).where(Document.id == analysis.document_id))
    doc = d_result.scalar_one_or_none()
    doc_name = doc.original_name if doc else f"Analysis-{analysis_id[:8]}"

    analysis_dict = {
        "analysis_id": analysis.id,
        "contract_type": analysis.contract_type,
        "overall_risk_score": analysis.overall_risk_score,
        "overall_risk_rating": analysis.overall_risk_rating,
        "critical_count": analysis.critical_count,
        "high_count": analysis.high_count,
        "medium_count": analysis.medium_count,
        "low_count": analysis.low_count,
        "total_clauses": analysis.total_clauses,
        "readability_score": analysis.readability_score,
        "power_imbalance_score": analysis.power_imbalance_score,
        "executive_summary": analysis.executive_summary,
        "clauses": analysis.clauses_json or [],
        "recommendations": analysis.recommendations or [],
        "top_risks": analysis.top_risks or [],
        "created_at": analysis.created_at.strftime("%B %d, %Y, %H:%M UTC") if analysis.created_at else None,
    }

    try:
        pdf_bytes = generate_pdf_report(analysis_dict, document_name=doc_name)
        buffer = io.BytesIO(pdf_bytes)
        filename = f"fpai-report-{analysis_id[:8]}.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(pdf_bytes)),
            },
        )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
        raise HTTPException(500, f"PDF generation failed: {str(e)}")


@router.get("/{analysis_id}/json")
async def export_json(analysis_id: str, db: AsyncSession = Depends(get_db), _session=Depends(require_auth)):
    """Export full analysis as JSON."""
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    d_result = await db.execute(select(Document).where(Document.id == analysis.document_id))
    doc = d_result.scalar_one_or_none()

    payload = {
        "analysis_id": analysis.id,
        "document_id": analysis.document_id,
        "document_name": doc.original_name if doc else "Unknown",
        "generated_at": datetime.utcnow().isoformat(),
        "contract_type": analysis.contract_type,
        "overall_risk_score": analysis.overall_risk_score,
        "overall_risk_rating": analysis.overall_risk_rating,
        "risk_counts": {
            "critical": analysis.critical_count,
            "high": analysis.high_count,
            "medium": analysis.medium_count,
            "low": analysis.low_count,
        },
        "total_clauses": analysis.total_clauses,
        "readability_score": analysis.readability_score,
        "power_imbalance_score": analysis.power_imbalance_score,
        "executive_summary": analysis.executive_summary,
        "top_risks": analysis.top_risks or [],
        "recommendations": analysis.recommendations or [],
        "clauses": analysis.clauses_json or [],
        "gemini_analysis": analysis.gemini_analysis or {},
        "status": analysis.status,
    }
    raw_json = json.dumps(payload, indent=2).encode("utf-8")
    buf = io.BytesIO(raw_json)
    return StreamingResponse(
        buf,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=fpai-report-{analysis_id[:8]}.json",
            "Content-Length": str(len(raw_json)),
        },
    )
