"""Curated annotation intake. Submitted labels are stored for offline evaluation, not live model training."""
import json
import os
import logging
import secrets
from typing import List, Literal
from datetime import datetime

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger("fpai.training")
router = APIRouter()

TRAINING_FILE = "./data/training/examples.jsonl"


class TrainingExample(BaseModel):
    clause_text: str = Field(min_length=10, max_length=5000)
    category: str = Field(min_length=2, max_length=80)
    risk_level: Literal["critical", "high", "medium", "low", "info"]
    is_exploitative: bool
    notes: str = Field(default="", max_length=2000)
    source: str = Field(default="user", max_length=120)


class TrainingStats(BaseModel):
    total_examples: int
    by_risk_level: dict
    by_category: dict
    last_updated: str


@router.post("/examples", status_code=201)
async def add_training_example(
    example: TrainingExample,
    authorization: str | None = Header(default=None),
):
    """Store a bounded, admin-submitted annotation for future offline evaluation."""
    expected_key = settings.TRAINING_ADMIN_KEY.strip()
    if not expected_key:
        raise HTTPException(503, "Annotation intake is disabled until TRAINING_ADMIN_KEY is configured.")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "A valid bearer token is required.")
    supplied_key = authorization.removeprefix("Bearer ").strip()
    if not secrets.compare_digest(supplied_key, expected_key):
        raise HTTPException(401, "Invalid bearer token.")

    os.makedirs(os.path.dirname(TRAINING_FILE), exist_ok=True)
    record = {
        **example.model_dump(),
        "added_at": datetime.utcnow().isoformat(),
    }
    with open(TRAINING_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    return {"status": "added", "record": record}


@router.get("/stats", response_model=TrainingStats)
async def training_stats():
    """Return statistics about the training corpus."""
    if not os.path.exists(TRAINING_FILE):
        return TrainingStats(
            total_examples=0,
            by_risk_level={},
            by_category={},
            last_updated="never",
        )
    examples = []
    with open(TRAINING_FILE, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    examples.append(json.loads(line))
                except Exception:
                    pass

    by_risk = {}
    by_cat = {}
    last_updated = "never"
    for ex in examples:
        rl = ex.get("risk_level", "unknown")
        by_risk[rl] = by_risk.get(rl, 0) + 1
        cat = ex.get("category", "unknown")
        by_cat[cat] = by_cat.get(cat, 0) + 1
        last_updated = ex.get("added_at", last_updated)

    return TrainingStats(
        total_examples=len(examples),
        by_risk_level=by_risk,
        by_category=by_cat,
        last_updated=last_updated,
    )


@router.get("/knowledge-base")
async def get_knowledge_base():
    """Return the full built-in clause knowledge base."""
    from app.core.knowledge_base import CLAUSE_KNOWLEDGE_BASE
    return [
        {
            "name": p.name,
            "category": p.category.value,
            "risk_level": p.risk_level.value,
            "description": p.description,
            "legal_basis": p.legal_basis,
            "plain_english": p.plain_english,
            "mitigation": p.mitigation,
            "red_flag_phrases": p.red_flag_phrases,
        }
        for p in CLAUSE_KNOWLEDGE_BASE
    ]
