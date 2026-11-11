from app.services.packet_review import compare_contract_packet, extract_explicit_terms


def test_detects_different_notice_periods_with_exact_evidence():
    docs = [
        {"id": "a", "name": "Employment Agreement", "text": "Either party may terminate by giving thirty (30) days written notice."},
        {"id": "b", "name": "Side Letter", "text": "The employee may resign by giving sixty (60) days prior written notice."},
    ]
    result = compare_contract_packet(docs)
    variation = next(item for item in result["variations"] if item["fact_type"] == "notice_period_days")
    assert {item["normalized_value"] for item in variation["documents"]} == {"30", "60"}
    assert all(item["excerpt"] for item in variation["documents"])
    assert "may be intentional" in variation["explanation"]


def test_does_not_flag_identical_terms_as_variations():
    docs = [
        {"id": "a", "name": "Main Agreement", "text": "Payment shall be made within 30 days of receipt of invoice."},
        {"id": "b", "name": "Schedule A", "text": "Payment shall be made within thirty days of receipt of invoice."},
    ]
    result = compare_contract_packet(docs)
    assert not any(item["fact_type"] == "payment_due_days" for item in result["variations"])


def test_normalizes_years_and_months_for_term_comparison():
    docs = [
        {"id": "a", "name": "Agreement A", "text": "The initial term shall be 1 year."},
        {"id": "b", "name": "Agreement B", "text": "The initial term shall be 12 months."},
    ]
    result = compare_contract_packet(docs)
    assert not any(item["fact_type"] == "term_months" for item in result["variations"])


def test_surfaces_precedence_language_without_auto_resolving():
    docs = [
        {"id": "a", "name": "Master Agreement", "text": "In the event of any inconsistency, this agreement shall prevail."},
        {"id": "b", "name": "NDA", "text": "Confidentiality terms apply."},
    ]
    result = compare_contract_packet(docs)
    assert len(result["hierarchy_evidence"]) == 1
    assert "shall prevail" in result["hierarchy_evidence"][0]["excerpt"]


def test_requires_two_documents_and_caps_packet_size():
    try:
        compare_contract_packet([{"id": "a", "name": "Only", "text": "Hello"}])
    except ValueError as exc:
        assert "at least two" in str(exc)
    else:
        raise AssertionError("one-document packet must be rejected")


def test_ignores_duplicate_facts_in_same_document():
    docs = [
        {"id": "a", "name": "Agreement A", "text": "Thirty days written notice. Notice of thirty days is required."},
        {"id": "b", "name": "Agreement B", "text": "Sixty days written notice."},
    ]
    result = compare_contract_packet(docs)
    variation = next(item for item in result["variations"] if item["fact_type"] == "notice_period_days")
    assert len(variation["documents"]) == 2
