"""Authenticated related-document packet review endpoint."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import require_auth
from app.core.database import get_db
from app.models.analysis import Analysis
from app.models.document import Document
from app.services.extractor import extract_text_from_bytes
from app.services.packet_review import compare_contract_packet

router = APIRouter()


class PacketReviewRequest(BaseModel):
    document_ids: list[str] = Field(min_length=2, max_length=8)


@router.post("/compare")
async def compare_packet(
    req: PacketReviewRequest,
    db: AsyncSession = Depends(get_db),
    _session=Depends(require_auth),
):
    """Compare explicit terms across 2–8 previously analysed related documents."""
    if len(set(req.document_ids)) != len(req.document_ids):
        raise HTTPException(422, "Choose each document only once.")

    packet = []
    missing_analysis = []
    total_chars = 0

    for document_id in req.document_ids:
        doc_result = await db.execute(select(Document).where(Document.id == document_id))
        doc = doc_result.scalar_one_or_none()
        if not doc:
            raise HTTPException(404, f"Document not found: {document_id}")

        analysis_result = await db.execute(
            select(Analysis)
            .where(Analysis.document_id == document_id)
            .order_by(Analysis.created_at.desc())
            .limit(1)
        )
        analysis = analysis_result.scalar_one_or_none()
        if not analysis or analysis.status != "completed":
            missing_analysis.append(doc.original_name)
            continue

        if not doc.file_data:
            raise HTTPException(
                422,
                f"The stored source file for {doc.original_name} is unavailable. Re-upload it before packet review.",
            )

        try:
            text, _pages = extract_text_from_bytes(bytes(doc.file_data), doc.original_name)
        except Exception as exc:
            raise HTTPException(
                422, f"Could not re-read {doc.original_name}. Re-upload a readable copy."
            ) from exc

        total_chars += len(text)
        if total_chars > 1_500_000:
            raise HTTPException(413, "The selected packet is too large. Compare up to eight smaller documents.")
        packet.append({
            "id": doc.id,
            "name": doc.original_name,
            "contract_type": analysis.contract_type,
            "text": text,
        })

    if missing_analysis:
        raise HTTPException(
            409,
            {
                "message": "Every selected document must have a completed individual analysis first.",
                "documents_to_analyse": missing_analysis,
            },
        )

    try:
        return compare_contract_packet(packet)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
