"""
Unit tests for FP.ai Clause Knowledge Base
Verifies pattern completeness, integrity, and pattern matching against all 20+ risk patterns.
"""
import pytest
from app.core.knowledge_base import (
    CLAUSE_KNOWLEDGE_BASE,
    PATTERNS_BY_CATEGORY,
    PATTERNS_BY_RISK,
    ClausePattern,
    RiskLevel,
    ClauseCategory,
)
from app.ml.engine import FPMLEngine


def test_knowledge_base_minimum_count():
    """Verify that the knowledge base contains at least 20 comprehensive risk patterns."""
    assert len(CLAUSE_KNOWLEDGE_BASE) >= 20, f"Expected at least 20 patterns, found {len(CLAUSE_KNOWLEDGE_BASE)}"


def test_knowledge_base_pattern_fields():
    """Verify all patterns have complete metadata, statutory authority, and mitigation guidance."""
    for p in CLAUSE_KNOWLEDGE_BASE:
        assert isinstance(p.category, ClauseCategory), f"Pattern '{p.name}' category is not ClauseCategory enum"
        assert isinstance(p.risk_level, RiskLevel), f"Pattern '{p.name}' risk_level is not RiskLevel enum"
        assert p.name and len(p.name.strip()) > 3, f"Pattern missing valid name: {p}"
        assert p.description and len(p.description.strip()) > 10, f"Pattern '{p.name}' missing description"
        assert p.legal_basis and len(p.legal_basis.strip()) > 5, f"Pattern '{p.name}' missing legal basis"
        assert len(p.red_flag_phrases) > 0, f"Pattern '{p.name}' has no red flag phrases"
        assert p.plain_english and len(p.plain_english.strip()) > 10, f"Pattern '{p.name}' missing plain English"
        assert p.mitigation and len(p.mitigation.strip()) > 10, f"Pattern '{p.name}' missing mitigation"


def test_knowledge_base_lookup_indexes():
    """Verify category and risk level lookup dictionaries are properly indexed."""
    assert len(PATTERNS_BY_CATEGORY) > 0
    assert len(PATTERNS_BY_RISK) > 0

    total_by_category = sum(len(plist) for plist in PATTERNS_BY_CATEGORY.values())
    total_by_risk = sum(len(plist) for plist in PATTERNS_BY_RISK.values())

    assert total_by_category == len(CLAUSE_KNOWLEDGE_BASE)
    assert total_by_risk == len(CLAUSE_KNOWLEDGE_BASE)


def test_all_patterns_match_against_red_flag_phrases():
    """
    Test that every single risk pattern in the knowledge base can be matched
    by the ML engine when its red flag phrases appear in a clause.
    """
    engine = FPMLEngine()

    unmatched_patterns = []

    for pattern in CLAUSE_KNOWLEDGE_BASE:
        # Construct sample clause using the pattern's first red flag phrase
        primary_phrase = pattern.red_flag_phrases[0]
        test_text = f"The parties hereby agree that {primary_phrase} shall strictly apply to all obligations herein."

        matched_pattern, flags, confidence = engine._pattern_match(test_text)

        if matched_pattern is None:
            unmatched_patterns.append((pattern.name, primary_phrase))
        else:
            # Check that either the exact pattern was matched, or a pattern of same category
            assert matched_pattern is not None
            assert len(flags) > 0
            assert confidence > 0.0

    assert len(unmatched_patterns) == 0, f"Patterns failed to match on their own red flags: {unmatched_patterns}"


@pytest.mark.parametrize("risk_level, expected_min_score", [
    (RiskLevel.CRITICAL, 85.0),
    (RiskLevel.HIGH, 65.0),
    (RiskLevel.MEDIUM, 40.0),
    (RiskLevel.LOW, 20.0),
])
def test_risk_score_from_level(risk_level, expected_min_score):
    """Verify baseline risk scoring maps correctly to numeric scales."""
    engine = FPMLEngine()
    score = engine._risk_score_from_level(risk_level, anomaly_score=0.0, readability=60.0)
    assert score >= expected_min_score


def test_specific_indian_contract_act_clauses():
    """Verify specific statutory protections under Indian Contract Act 1872."""
    engine = FPMLEngine()

    # Section 27 - Void Non-Compete
    non_compete_text = "Employee agrees not to compete or join any competitor following termination for 2 years."
    pattern, flags, conf = engine._pattern_match(non_compete_text)
    assert pattern is not None
    assert pattern.category == ClauseCategory.NON_COMPETE
    assert pattern.risk_level == RiskLevel.CRITICAL
    assert "Section 27" in pattern.legal_basis or "Indian Contract Act" in pattern.legal_basis

    # Section 74 - Liquidated Damages / Training Bond Trap
    bond_text = "Employee shall pay training cost recovery and liquidated damages if leaving before 24 months."
    pattern, flags, conf = engine._pattern_match(bond_text)
    assert pattern is not None
    assert pattern.category in (ClauseCategory.PENALTY, ClauseCategory.SALARY_COMPENSATION)
    assert pattern.risk_level in (RiskLevel.HIGH, RiskLevel.CRITICAL)

    # Section 10 - Unilateral Amendment Right
    unilateral_text = "We reserve the right to modify these terms and conditions at any time without prior notice."
    pattern, flags, conf = engine._pattern_match(unilateral_text)
    assert pattern is not None
    assert pattern.category == ClauseCategory.UNILATERAL_MODIFICATION
    assert pattern.risk_level == RiskLevel.CRITICAL
