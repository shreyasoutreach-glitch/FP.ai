from app.ml.engine import FPMLEngine
from app.core.knowledge_base import RiskLevel


def test_risk_score_breakdown_is_transparent_and_bounded():
    engine = FPMLEngine()
    result = engine._calculate_clause_risk_breakdown(
        risk_level=RiskLevel.HIGH,
        anomaly_score=-0.25,
        readability=20.0,
        fk_grade=18.0,
        flag_count=3,
    )

    assert result["base_score"] == 65.0
    assert result["anomaly_boost"] == 5.0
    assert result["red_flag_boost"] == 7.5
    assert result["readability_penalty"] > 0
    assert result["total"] == sum(result[key] for key in (
        "base_score", "anomaly_boost", "readability_penalty", "red_flag_boost"
    ))
    assert 0.0 <= result["total"] <= 100.0


def test_unmatched_clause_has_zero_pattern_match_strength():
    engine = FPMLEngine()
    pattern, flags, match_strength = engine._pattern_match(
        "This clause describes a routine delivery timetable."
    )
    assert pattern is None
    assert flags == []
    assert match_strength == 0.0
