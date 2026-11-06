"""Training data management — feed examples to improve ML."""
import json
import os
import logging
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger("fpai.training")
router = APIRouter()

TRAINING_FILE = "./data/training/examples.jsonl"


class TrainingExample(BaseModel):
    clause_text: str
    category: str
    risk_level: str
    is_exploitative: bool
    notes: str = ""
    source: str = "user"


class TrainingStats(BaseModel):
    total_examples: int
    by_risk_level: dict
    by_category: dict
    last_updated: str


@router.post("/examples", status_code=201)
async def add_training_example(example: TrainingExample):
    """Add a labelled clause example to the training corpus."""
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
