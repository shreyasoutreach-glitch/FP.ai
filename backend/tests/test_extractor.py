"""
Unit tests for document parsing, clause segmentation, and contract classification in extractor.py
"""
import pytest
from app.services.extractor import (
    extract_text_from_bytes,
    segment_into_clauses,
    detect_contract_type,
    _clean_text,
)


def test_extract_pdf_bytes(sample_pdf_bytes):
    """Test text and page count extraction from valid PDF."""
    text, pages = extract_text_from_bytes(sample_pdf_bytes, "test_employment.pdf")
    assert text is not None
    assert len(text) > 50
    assert "EMPLOYMENT AGREEMENT" in text or "PROBATION" in text or "NON-COMPETE" in text
    assert pages >= 1


def test_extract_docx_bytes(sample_docx_bytes):
    """Test text and table content extraction from valid DOCX."""
    text, pages = extract_text_from_bytes(sample_docx_bytes, "test_msa.docx")
    assert text is not None
    assert "MASTER SERVICES AGREEMENT" in text
    assert "Scope of Services" in text
    # Verify table row extraction
    assert "Sec 3.1" in text or "$100" in text
    assert pages >= 1


def test_extract_txt_bytes(sample_txt_bytes):
    """Test plain text extraction with encoding handling."""
    text, pages = extract_text_from_bytes(sample_txt_bytes, "test_nda.txt")
    assert "NON-DISCLOSURE AGREEMENT" in text
    assert "Confidential Information" in text
    assert pages >= 1


def test_extract_txt_encodings():
    """Test decoding with various non-standard encodings."""
    latin1_bytes = "Agreement with café and naïve employees: Section 1. Term".encode("latin-1")
    text, _ = extract_text_from_bytes(latin1_bytes, "contract_latin1.txt")
    assert "Agreement with" in text
    assert "Section 1" in text


def test_clause_segmentation_numbered_sections():
    """Test segmentation with 1., 1.1, 1.2 numbering."""
    raw = """
    1. Introduction and Appointment of Consultant.
    1.1 The consultant shall perform high quality engineering services.
    1.2 All deliverables shall be subject to acceptance testing by the client.
    2. Compensation and Payment Terms.
    Client shall pay Consultant within 30 days of invoice receipt.
    """
    clauses = segment_into_clauses(raw)
    assert len(clauses) >= 3
    assert any("Introduction" in c for c in clauses)
    assert any("Compensation" in c for c in clauses)


def test_clause_segmentation_roman_numerals():
    """Test segmentation with Roman numerals (e.g. Article IV, (iv))."""
    raw = """
    ARTICLE I: DEFINITIONS AND INTERPRETATION
    In this agreement all capitalized terms have the meanings assigned herein.
    ARTICLE II: CONDITIONS PRECEDENT
    Closing of the merger shall occur following regulatory approval.
    Section IV: TERMINATION RIGHTS
    Either party may terminate if closing does not occur within 90 days.
    (iv) Indemnification Obligations:
    Sellers shall indemnify buyers for any tax shortfall up to the cap.
    """
    clauses = segment_into_clauses(raw)
    assert len(clauses) >= 3
    assert any("ARTICLE I" in c for c in clauses)
    assert any("ARTICLE II" in c for c in clauses)
    assert any("Section IV" in c or "TERMINATION" in c for c in clauses)


def test_clause_segmentation_brackets_and_letters():
    """Test segmentation with (1), [1], (a), (b)."""
    raw = """
    (1) Scope of Work: The vendor will deliver software modules as per specification.
    (2) Service Levels: Vendor guarantees 99.9% uptime for cloud infrastructure.
    (a) Maintenance Windows: Scheduled downtime shall not exceed 2 hours per month.
    (b) Penalties for Breach: Service credits shall be calculated at 5% per hour of downtime.
    """
    clauses = segment_into_clauses(raw)
    assert len(clauses) >= 3
    assert any("Scope of Work" in c for c in clauses)
    assert any("Service Levels" in c for c in clauses)


def test_clause_segmentation_bullet_points():
    """Test segmentation with various bullet point styles."""
    raw = """
    GENERAL COVENANTS:
    • The parties agree to act in good faith throughout the engagement term.
    • Neither party shall disclose financial details without prior written consent.
    - Vendor shall maintain comprehensive general liability insurance of $2,000,000.
    * Contractor shall comply with all local labor regulations and safety policies.
    """
    clauses = segment_into_clauses(raw)
    assert len(clauses) >= 3
    assert any("good faith" in c for c in clauses)
    assert any("insurance" in c for c in clauses)


def test_clause_segmentation_uppercase_titles():
    """Test segmentation with prominent uppercase headings."""
    raw = """
    CONFIDENTIALITY:
    The Receiving Party shall hold and maintain all Confidential Information in strictest confidence.
    NON-COMPETE:
    Employee agrees not to engage with any competing business for a period of twelve months.
    LIMITATION OF LIABILITY:
    In no event shall Company aggregate liability exceed one hundred dollars.
    """
    clauses = segment_into_clauses(raw)
    assert len(clauses) == 3
    assert any("CONFIDENTIALITY" in c for c in clauses)
    assert any("NON-COMPETE" in c for c in clauses)
    assert any("LIMITATION OF LIABILITY" in c for c in clauses)


def test_clause_segmentation_long_paragraphs():
    """Test splitting of long unstructured paragraphs."""
    long_para1 = "This is a sentence about contract terms and conditions. " * 30
    long_para2 = "This is another sentence about obligations and representations. " * 30
    text = f"{long_para1}\n\n{long_para2}"
    clauses = segment_into_clauses(text)
    assert len(clauses) >= 2


def test_clause_segmentation_empty():
    """Test that empty or whitespace text returns an empty list."""
    assert segment_into_clauses("") == []
    assert segment_into_clauses("    \n\n  \t ") == []


def test_detect_contract_type_employment():
    text = "This Employment Agreement is entered into between Employer and Employee. Salary is 12 LPA with a 6-month probation period and non-compete."
    assert detect_contract_type(text) == "Employment Contract"


def test_detect_contract_type_ma():
    text = "Share Purchase Agreement for the acquisition of 100% shares of the target company following due diligence, closing conditions, and representations."
    assert detect_contract_type(text) == "M&A Agreement"


def test_detect_contract_type_nda():
    text = "Non-Disclosure Agreement (NDA). The Disclosing Party and Receiving Party agree that trade secrets and proprietary confidential information shall be protected."
    assert detect_contract_type(text) == "Non-Disclosure Agreement (NDA)"


def test_detect_contract_type_saas():
    text = "Cloud Platform Terms of Service and End User Software License Agreement for SaaS subscription services, APIs, and cloud services uptime SLA."
    assert detect_contract_type(text) in ("Software License / SaaS Agreement", "Consumer Terms of Service")


def test_detect_contract_type_lease():
    text = "Commercial Lease Agreement between Landlord and Tenant for the leased demised premises with monthly rent and security deposit."
    assert detect_contract_type(text) == "Commercial Lease Agreement"


def test_detect_contract_type_fallback():
    text = "The two individuals decided to meet on Tuesday afternoon for coffee in the park."
    assert detect_contract_type(text) == "General Commercial Contract"
