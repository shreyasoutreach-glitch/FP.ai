"""Document upload and management endpoints."""
import os
import uuid
import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.document import Document
from app.services.extractor import detect_contract_type

logger = logging.getLogger("fpai.documents")
router = APIRouter()


class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_name: str
    file_size: int
    file_type: str
    word_count: int
    page_count: int
    contract_type: str
    status: str
    created_at: str


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Validate, extract, then persist an uploaded contract."""
    original_name = (file.filename or "contract").replace("\\", "/").split("/")[-1][:255]
    ext = os.path.splitext(original_name)[1].lower()
    allowed = {".pdf", ".docx", ".txt"}
    if ext not in allowed:
        raise HTTPException(
            415,
            f"Unsupported file type: {ext or 'unknown'}. Supported formats: PDF, DOCX and TXT.",
        )

    # Read in bounded chunks so the endpoint never performs an unbounded read.
    chunks = []
    total_bytes = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        total_bytes += len(chunk)
        if total_bytes > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(413, f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB")
        chunks.append(chunk)

    content = b"".join(chunks)
    if not content:
        raise HTTPException(400, "The uploaded file is empty.")

    if ext == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(415, "The file extension is PDF but its contents are not a PDF document.")
    if ext == ".docx" and not content.startswith(b"PK\x03\x04"):
        raise HTTPException(415, "The file extension is DOCX but its contents are not a DOCX archive.")
    if ext == ".txt" and b"\x00" in content:
        raise HTTPException(415, "The TXT file contains binary data and cannot be accepted as plain text.")

    # Extract before saving so corrupt, encrypted or image-only PDFs are not retained as usable uploads.
    try:
        from app.services.extractor import extract_text_from_bytes
        extracted_text, page_count = extract_text_from_bytes(content, original_name)
    except Exception as e:
        logger.info("Upload extraction rejected for %s: %s", original_name, e)
        raise HTTPException(422, "Could not extract readable text. Check that the file is valid and that scanned PDFs have a text layer.")

    if not extracted_text or not extracted_text.strip():
        raise HTTPException(422, "No readable text was found in this document.")

    word_count = len(extracted_text.split())
    contract_type = detect_contract_type(extracted_text)

    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}{ext}"
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    upload_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(upload_path, "wb") as f:
        f.write(content)

    doc = Document(
        id=doc_id,
        filename=safe_name,
        original_name=original_name,
        file_size=len(content),
        file_type=ext.lstrip("."),
        upload_path=upload_path,
        word_count=word_count,
        page_count=page_count,
        contract_type=contract_type,
        status="uploaded",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        original_name=doc.original_name,
        file_size=doc.file_size,
        file_type=doc.file_type,
        word_count=doc.word_count,
        page_count=doc.page_count,
        contract_type=doc.contract_type,
        status=doc.status,
        created_at=doc.created_at.isoformat(),
    )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).order_by(Document.created_at.desc()).limit(50))
    docs = result.scalars().all()
    return [
        DocumentResponse(
            id=d.id, filename=d.filename, original_name=d.original_name,
            file_size=d.file_size, file_type=d.file_type, word_count=d.word_count,
            page_count=d.page_count, contract_type=d.contract_type,
            status=d.status, created_at=d.created_at.isoformat(),
        )
        for d in docs
    ]


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    if os.path.exists(doc.upload_path):
        os.remove(doc.upload_path)
    await db.delete(doc)
    await db.commit()
    return {"deleted": doc_id}
