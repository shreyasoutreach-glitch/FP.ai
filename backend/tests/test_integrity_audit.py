import pytest

from app.services.integrity_audit import audit_document_integrity


def test_detects_unfilled_placeholder_with_exact_offsets():
    text = "EMPLOYMENT AGREEMENT\nEmployee: [INSERT NAME]\n"
    result = audit_document_integrity(text)
    finding = next(item for item in result["findings"] if item["kind"] == "unfilled_placeholder")
    assert finding["excerpt"] == "[INSERT NAME]"
    assert text[finding["start_char"]:finding["end_char"]] == "[INSERT NAME]"


def test_flags_reference_not_located_but_does_not_flag_existing_section():
    text = (
        "Section 1: Scope\n"
        "The obligations are subject to Section 9.4 of this Agreement.\n"
        "Section 1.1: Services\n"
    )
    result = audit_document_integrity(text)
    refs = [item for item in result["findings"] if item["kind"] == "unresolved_internal_reference"]
    assert len(refs) == 1
    assert "9.4" in refs[0]["excerpt"]


def test_schedule_reference_is_a_packet_gap_not_proof_of_absence():
    text = "The deliverables are listed in Schedule B."
    result = audit_document_integrity(text)
    finding = next(item for item in result["findings"] if item["kind"] == "unverified_schedule")
    assert "may be a separate attachment" in finding["explanation"]


def test_number_word_mismatch_is_detected():
    result = audit_document_integrity("Payment is due within ten (15) days.")
    finding = next(item for item in result["findings"] if item["kind"] == "number_word_mismatch")
    assert finding["excerpt"] == "ten (15)"


def test_external_policy_dependency_is_not_mislabelled_as_a_broken_reference():
    text = "This contract incorporates by reference the privacy policy as amended from time to time."
    result = audit_document_integrity(text)
    finding = next(item for item in result["findings"] if item["kind"] == "external_document_dependency")
    assert finding["severity"] == "info"


def test_no_findings_is_not_a_legal_clearance():
    result = audit_document_integrity("This agreement contains ordinary words and no detectable marker.")
    assert result["status"] == "no_flags_found"
    assert "does not prove" in result["coverage_note"]
