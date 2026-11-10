from app.services.decision_rules import evaluate_decision_rules


def test_personal_rulebook_flags_explicit_exit_bond_and_preserves_evidence():
    clauses = [
        {
            "category": "penalty",
            "risk_level": "critical",
            "text": "The employee shall repay training cost of INR 250000 if they resign before 24 months.",
            "start_char": 120,
            "end_char": 220,
        }
    ]

    result = evaluate_decision_rules(clauses, ["exit_flexibility"])
    check = result["checks"][0]

    assert check["status"] == "potential_conflict"
    assert check["evidence_count"] == 1
    assert "training cost" in check["evidence"][0]["conflict_terms"]
    assert check["evidence"][0]["start_char"] == 120


def test_personal_rulebook_surfaces_uncapped_indemnity():
    clauses = [{
        "category": "indemnity",
        "risk_level": "critical",
        "text": "The contractor indemnifies the company for any and all losses without any cap.",
    }]

    result = evaluate_decision_rules(clauses, ["cap_liability"])
    assert result["checks"][0]["status"] == "potential_conflict"


def test_personal_rulebook_does_not_claim_a_missing_clause_is_absent():
    result = evaluate_decision_rules([], ["protect_existing_ip"])
    check = result["checks"][0]

    assert check["status"] == "not_detected"
    assert "not proof" in check["summary"]


def test_personal_rulebook_requires_known_priority_ids():
    try:
        evaluate_decision_rules([], ["invented_rule"])
    except ValueError as exc:
        assert "Unsupported priority" in str(exc)
    else:
        raise AssertionError("Unknown priorities must be rejected.")
