"""Personal Deal Rulebook API."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes.auth import require_auth
from app.core.database import get_db
from app.models.analysis import Analysis
from app.services.decision_rules import evaluate_decision_rules

router = APIRouter()


class DecisionCheckRequest(BaseModel):
    priority_ids: list[str] = Field(min_length=1, max_length=6)


@router.post("/{analysis_id}/decision-check")
async def run_decision_check(
    analysis_id: str,
    req: DecisionCheckRequest,
    db: AsyncSession = Depends(get_db),
    _session=Depends(require_auth),
):
    """Check a saved analysis against the user's selected personal deal priorities."""
    if len(set(req.priority_ids)) != len(req.priority_ids):
        raise HTTPException(status_code=422, detail="Duplicate priorities are not allowed.")

    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id))
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    try:
        checked = evaluate_decision_rules(analysis.clauses_json or [], req.priority_ids)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return {
        "analysis_id": analysis.id,
        "contract_type": analysis.contract_type,
        **checked,
    }
