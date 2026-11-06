"""Document text extraction — PDF, DOCX, TXT, and robust clause segmentation."""
import io
import os
import logging
import re
from typing import Tuple, List, Dict

logger = logging.getLogger("fpai.extractor")


def extract_text_from_bytes(content: bytes, filename: str) -> Tuple[str, int]:
    """
    Extract plain text from uploaded file bytes.
    Returns (cleaned_text, estimated_page_count).
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return _extract_pdf(content)
    elif ext in (".docx", ".doc"):
        return _extract_docx(content)
    elif ext == ".txt":
        return _extract_txt(content)
    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp"):
        return _extract_image_ocr(content)
    else:
        # Fallback for unrecognized text-like files
        return _extract_txt(content)


def _extract_txt(content: bytes) -> Tuple[str, int]:
    """Decode text file with multiple encoding fallbacks."""
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252", "ascii"]
    for enc in encodings:
        try:
            text = content.decode(enc)
            cleaned = _clean_text(text)
            pages = max(1, len(cleaned) // 2500)
            return cleaned, pages
        except UnicodeDecodeError:
            continue
    text = content.decode("utf-8", errors="replace")
    cleaned = _clean_text(text)
    return cleaned, max(1, len(cleaned) // 2500)


def _extract_pdf(content: bytes) -> Tuple[str, int]:
    """
    Extract text from PDF using pypdf, pdfminer, or PyPDF2 with fallbacks.
    """
    page_count = 0
    extracted_text = ""

    # 1. Try pypdf (fast, robust modern library)
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content))
        page_count = len(reader.pages)
        pages_text = [p.extract_text() or "" for p in reader.pages]
        extracted_text = "\n\n".join(pages_text).strip()
        if extracted_text:
            return _clean_text(extracted_text), max(1, page_count)
    except Exception as e:
        logger.debug(f"pypdf extraction skipped: {e}")

    # 2. Try pdfminer.six (best for complex layout text)
    try:
        from pdfminer.high_level import extract_text as pm_extract
        from pdfminer.pdfdocument import PDFDocument
        from pdfminer.pdfparser import PDFParser
        from pdfminer.pdfpage import PDFPage

        parser = PDFParser(io.BytesIO(content))
        doc = PDFDocument(parser)
        page_count = sum(1 for _ in PDFPage.create_pages(doc))
        extracted_text = pm_extract(io.BytesIO(content))
        if extracted_text and extracted_text.strip():
            return _clean_text(extracted_text), max(1, page_count)
    except Exception as e:
        logger.debug(f"pdfminer extraction skipped: {e}")

    # 3. Try PyPDF2
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        page_count = len(reader.pages)
        pages_text = [p.extract_text() or "" for p in reader.pages]
        extracted_text = "\n\n".join(pages_text).strip()
        if extracted_text:
            return _clean_text(extracted_text), max(1, page_count)
    except Exception as e:
        logger.debug(f"PyPDF2 extraction skipped: {e}")

    if extracted_text and extracted_text.strip():
        return _clean_text(extracted_text), max(1, page_count)

    # Empty or unreadable PDF
    raise RuntimeError("Unable to extract text from PDF. File may be encrypted, scanned, or empty.")


def _extract_docx(content: bytes) -> Tuple[str, int]:
    """Extract text from DOCX files including paragraphs and table contents."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        parts = []

        for p in doc.paragraphs:
            val = p.text.strip()
            if val:
                parts.append(val)

        # Process tables
        for table in doc.tables:
            for row in table.rows:
                row_vals = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                # Deduplicate consecutive identical cells from merged cells
                deduped = []
                for val in row_vals:
                    if not deduped or deduped[-1] != val:
                        deduped.append(val)
                if deduped:
                    parts.append(" | ".join(deduped))

        full_text = "\n\n".join(parts)
        pages = max(1, len(full_text) // 2500)
        return _clean_text(full_text), pages
    except Exception as e:
        raise RuntimeError(f"DOCX extraction failed: {e}")


def _extract_image_ocr(content: bytes) -> Tuple[str, int]:
    """OCR extraction using pytesseract if available."""
    try:
        from PIL import Image
        import pytesseract
        img = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(img)
        return _clean_text(text), 1
    except ImportError:
        raise RuntimeError("OCR is not available — please upload PDF, DOCX, or TXT directly.")
    except Exception as e:
        raise RuntimeError(f"OCR extraction failed: {e}")


def _clean_text(text: str) -> str:
    """Normalise whitespace and line breaks while keeping formatting integrity."""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\r", "\n", text)
    # Strip standalone page numbering like "Page 1 of 5" or "Page 2"
    text = re.sub(r"(?i)\n\s*page\s+\d+(\s+of\s+\d+)?\s*\n", "\n\n", text)
    # Reduce consecutive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Reduce horizontal whitespace
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Remove unprintable control characters except standard tabs and newlines
    text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]", "", text)
    return text.strip()


def segment_into_clauses(text: str) -> List[str]:
    """
    Robust clause segmentation supporting:
    - Numbered hierarchical sections: '1.', '1.1', '1.1.1', '1.0'
    - Bracketed numbers & letters: '(1)', '[1]', '1)', '(a)', '(b)', 'a)'
    - Roman numerals: 'ARTICLE IV', 'Section IX', 'I.', 'II.', 'IV.', '(iv)', '(v)'
    - Named headers: 'Article 1', 'Section 3.2', 'Clause 5', 'SCHEDULE A'
    - Uppercase headings / clause titles: 'CONFIDENTIALITY:', 'TERMINATION CLAUSE:'
    - Bullet points: '•', '●', '▪', '▫', '◦', '-', '*'
    - Long paragraph segmentation with fallback
    """
    if not text or not text.strip():
        return []

    # Composite regex matching common clause boundaries
    # Using lookahead (?=...) so separators remain at the start of each split segment
    clause_boundary_regex = re.compile(
        r"(?:^|\n\s*|\n{2,})"
        r"(?="
        # 1. Numbered sections: 1., 1.1, 1.1.1, 1.0 (with optional space/tab)
        r"(?:\d+\.(?:\d+\.?)*\s+)"
        # 2. Numbered parentheses / brackets: (1), (2), [1], 1), 2)
        r"|(?:\(?\d+\)[\s\.\-])"
        r"|(?:\[\d+\]\s*)"
        # 3. Roman numerals: ARTICLE I, Section IV, Article 1, Section 2.1
        r"|(?:(?:Article|Section|Clause|Schedule|Exhibit)\s+(?:[IVXLCDMivxlcdm]+|\d+(?:\.\d+)*)[\.\:\s\-]+)"
        # 4. Standalone Roman numerals at line start: I. , IV. , (i) , (iv)
        r"|(?:[IVXLCDM]+\.\s+)"
        r"|(?:\([ivxlcdm]+\)\s+)"
        # 5. Lettered subclauses: (a), (b), (A), a), b)
        r"|(?:\([a-zA-Z]\)\s+)"
        r"|(?:[a-zA-Z]\)\s+)"
        # 6. Prominent uppercase headings / titles: ARBITRATION CLAUSE, NON-COMPETE:
        r"|(?:[A-Z][A-Z\s\-_]{3,35}\s*[\:\–\-])"
        # 7. Standard bullet points: •, ●, ▪, -, *
        r"|(?:[\u2022\u25cf\u25aa\u25ab\u25e6\u2219\*\-]\s+)"
        r")",
        re.MULTILINE,
    )

    raw_segments = clause_boundary_regex.split(text)

    # Process segments
    cleaned_clauses: List[str] = []

    for seg in raw_segments:
        if not seg:
            continue
        seg_clean = seg.strip()
        if not seg_clean:
            continue

        # If a segment is very long (over 1200 characters), break it further on paragraphs
        if len(seg_clean) > 1200:
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n", seg_clean) if p.strip()]
            for p in paragraphs:
                if len(p) > 25:
                    cleaned_clauses.append(p)
        else:
            # Filter out tiny noise lines (under 25 chars with no real clause text)
            if len(seg_clean) >= 25:
                cleaned_clauses.append(seg_clean)
            elif cleaned_clauses and len(cleaned_clauses[-1]) < 300:
                # Append short heading to next or previous clause if appropriate
                cleaned_clauses[-1] = f"{cleaned_clauses[-1]}\n{seg_clean}"

    # Fallback: if regex didn't find multiple clauses (e.g. unformatted plain text contract),
    # split on double newlines
    if len(cleaned_clauses) <= 1:
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", text) if len(p.strip()) >= 25]
        if len(paragraphs) > 1:
            return paragraphs

    return cleaned_clauses if cleaned_clauses else ([text.strip()] if text.strip() else [])


def detect_contract_type(text: str) -> str:
    """
    Weighted scoring algorithm to classify contract type based on domain keywords and legal patterns.
    """
    if not text:
        return "General Contract"

    text_lower = text.lower()

    contract_categories = {
        "Employment Contract": {
            "keywords": [
                "employment agreement", "employment contract", "offer letter", "probation period",
                "employee", "employer", "salary", "remuneration", "working hours", "notice period",
                "job title", "designation", "ctc", "provident fund", "gratuity", "non-compete",
            ],
            "weight": 1.2,
        },
        "M&A Agreement": {
            "keywords": [
                "merger", "acquisition", "share purchase agreement", "asset purchase", "due diligence",
                "closing conditions", "representations and warranties", "indemnification cap", "escrow",
                "material adverse effect", "change of control", "target company", "purchase price",
            ],
            "weight": 1.3,
        },
        "Non-Disclosure Agreement (NDA)": {
            "keywords": [
                "non-disclosure agreement", "nda", "confidentiality agreement", "confidential information",
                "disclosing party", "receiving party", "proprietary information", "trade secrets",
                "non-disclosure", "perpetual confidentiality",
            ],
            "weight": 1.4,
        },
        "Software License / SaaS Agreement": {
            "keywords": [
                "software license", "end user license agreement", "eula", "saas agreement",
                "subscription agreement", "license grant", "cloud services", "service level agreement",
                "uptime", "api", "intellectual property rights", "software as a service",
            ],
            "weight": 1.2,
        },
        "Service Agreement": {
            "keywords": [
                "master services agreement", "service agreement", "statement of work", "sow",
                "contractor", "services rendered", "deliverables", "service provider", "client",
                "scope of work", "acceptance criteria",
            ],
            "weight": 1.1,
        },
        "Commercial Lease Agreement": {
            "keywords": [
                "lease agreement", "tenancy agreement", "landlord", "tenant", "leased premises",
                "monthly rent", "security deposit", "subletting", "maintenance charges", "demised premises",
            ],
            "weight": 1.3,
        },
        "Consumer Terms of Service": {
            "keywords": [
                "terms of service", "terms and conditions", "terms of use", "privacy policy",
                "user agreement", "account creation", "community guidelines", "acceptable use policy",
                "arbitration agreement", "class action waiver",
            ],
            "weight": 1.2,
        },
        "Loan Agreement": {
            "keywords": [
                "loan agreement", "facility agreement", "credit facility", "borrower", "lender",
                "interest rate", "repayment schedule", "default interest", "collateral", "promissory note",
            ],
            "weight": 1.3,
        },
        "Consulting Agreement": {
            "keywords": [
                "consulting agreement", "independent contractor", "consultant", "consultancy fees",
                "retainer", "advisory services", "statement of services",
            ],
            "weight": 1.2,
        },
        "Partnership / Joint Venture": {
            "keywords": [
                "partnership agreement", "partnership deed", "joint venture agreement", "shareholders agreement",
                "equity interest", "profit sharing", "board of directors", "capital contribution",
            ],
            "weight": 1.2,
        },
    }

    scores: Dict[str, float] = {}

    for ctype, info in contract_categories.items():
        score = 0.0
        for kw in info["keywords"]:
            # Exact phrase matches receive higher score
            count = text_lower.count(kw)
            if count > 0:
                score += (count * 2.0 if len(kw.split()) > 1 else count * 1.0)
        scores[ctype] = score * info["weight"]

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_type, best_score = sorted_scores[0]

    if best_score >= 2.0:
        return best_type
    return "General Commercial Contract"
