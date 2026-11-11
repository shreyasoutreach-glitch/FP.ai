"""Evidence-first comparison of explicit terms across a related contract packet.

Only narrow, deterministic facts are compared. Different values are reported as
variations requiring human context, never automatically labelled contradictions.
"""
import re
from collections import defaultdict
from typing import Any


PATTERNS: dict[str, tuple[str, re.Pattern[str]]] = {
    "notice_period_days": (
        "Notice period",
        re.compile(r"\b(?:at least\s+|not less than\s+|minimum of\s+)?(\d{1,3})\s*(?:calendar\s+|business\s+)?days?\s*(?:['’]?\s*)?(?:prior\s+)?(?:written\s+)?notice\b", re.I),
    ),
    "payment_due_days": (
        "Payment deadline",
        re.compile(r"\b(?:within|no later than|not later than)\s+(\d{1,3})\s*days?\s+(?:of|after|from)\s+(?:receipt|submission|delivery|invoice|acceptance)\b", re.I),
    ),
    "term_months": (
        "Agreement term",
        re.compile(r"\b(?:initial\s+)?(?:term|period)\s+(?:of\s+)?(\d{1,2})\s*(months?|years?)\b", re.I),
    ),
    "confidentiality_survival_years": (
        "Confidentiality survival",
        re.compile(r"\b(?:confidentiality|confidential obligations?|obligations of confidentiality)\b.{0,100}?\b(?:survive|continues? for|remain in force for|for a period of)\s+(\d{1,2})\s*(years?)\b", re.I),
    ),
    "non_compete_years": (
        "Restrictive covenant duration",
        re.compile(r"\b(?:non[- ]compete|not compete|competing business|restraint of trade)\b.{0,140}?\b(\d{1,2})\s*(years?|months?)\b", re.I),
    ),
    "arbitration_seat": (
        "Arbitration seat",
        re.compile(r"\b(?:seat|place) of arbitration\s*(?:shall be|is|:)?\s*([A-Z][A-Za-z .'-]{1,60}?)(?:[.;,\n]|$)", re.I),
    ),
    "governing_law": (
        "Governing law",
        re.compile(r"\b(?:governed by|governing law(?: shall be)?|laws of)\s+(?:the\s+)?(?:State of\s+)?([A-Z][A-Za-z .'-]{1,60}?)(?:\s+(?:without regard|excluding conflict)|[.;,\n]|$)", re.I),
    ),
}


def _normalize(key: str, raw: str) -> str:
    value = " ".join(raw.strip().casefold().split())
    if key == "term_months":
        match = re.match(r"(\d+)\s*(month|year)", value)
        if match:
            return str(int(match.group(1)) * (12 if match.group(2).startswith("year") else 1))
    if key in {"confidentiality_survival_years", "non_compete_years"}:
        match = re.match(r"(\d+)\s*(year|month)", value)
        if match:
            return str(int(match.group(1)) * (12 if match.group(2).startswith("year") else 1))
    return value.rstrip(" .,")


def extract_explicit_terms(document_id: str, document_name: str, text: str) -> list[dict[str, Any]]:
    facts: list[dict[str, Any]] = []
    for key, (label, pattern) in PATTERNS.items():
        seen: set[str] = set()
        for match in pattern.finditer(text or ""):
            raw = match.group(1).strip()
            normalized = _normalize(key, raw)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            start = max(0, text.rfind("\n", 0, match.start()) + 1)
            end_candidates = [p for p in (text.find("\n", match.end()), text.find(".", match.end())) if p >= 0]
            end = min(end_candidates) + 1 if end_candidates else min(len(text), match.end() + 180)
            excerpt = text[start:end].strip()
            facts.append({
                "fact_type": key,
                "label": label,
                "value": raw,
                "normalized_value": normalized,
                "document_id": document_id,
                "document_name": document_name,
                "excerpt": excerpt[:700],
                "start_char": start,
                "end_char": end,
            })
    return facts


def compare_contract_packet(documents: list[dict[str, Any]]) -> dict[str, Any]:
    if len(documents) < 2:
        raise ValueError("Select at least two analysed documents.")
    if len(documents) > 8:
        raise ValueError("A packet can contain at most eight documents.")

    facts: list[dict[str, Any]] = []
    for doc in documents:
        facts.extend(extract_explicit_terms(
            str(doc["id"]), str(doc["name"]), str(doc.get("text") or "")
        ))

    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for fact in facts:
        grouped[fact["fact_type"]].append(fact)

    variations: list[dict[str, Any]] = []
    for key, group in grouped.items():
        by_document: dict[str, dict[str, Any]] = {}
        for fact in group:
            # Keep the first explicit occurrence per document and fact type.
            by_document.setdefault(fact["document_id"], fact)
        distinct_values = {fact["normalized_value"] for fact in by_document.values()}
        if len(by_document) < 2 or len(distinct_values) < 2:
            continue
        label = group[0]["label"]
        variations.append({
            "id": key,
            "fact_type": key,
            "label": label,
            "status": "different_terms_found",
            "explanation": (
                f"The uploaded packet contains different explicit {label.lower()} values. "
                "This may be intentional because the documents have different scopes, or it may need reconciliation."
            ),
            "documents": list(by_document.values()),
            "next_step": (
                "Confirm which document governs this subject, whether one document amends or supersedes another, "
                "and whether the difference is intentional. Do not assume either value overrides the other."
            ),
        })

    # Surface direct textual hierarchy language with its own evidence. It is not
    # used to auto-resolve a variation because interpreting scope still needs review.
    hierarchy_terms = re.compile(
        r"\b(?:notwithstanding anything to the contrary|prevail(?:s)? to the extent of any conflict|"
        r"in the event of any inconsistency|order of precedence|supersedes and replaces|"
        r"amends and restates|entire agreement)\b",
        re.I,
    )
    hierarchy_evidence = []
    for doc in documents:
        text = doc.get("text") or ""
        for match in hierarchy_terms.finditer(text):
            start = max(0, text.rfind("\n", 0, match.start()) + 1)
            end_candidates = [p for p in (text.find("\n", match.end()), text.find(".", match.end())) if p >= 0]
            end = min(end_candidates) + 1 if end_candidates else min(len(text), match.end() + 180)
            hierarchy_evidence.append({
                "document_id": str(doc["id"]),
                "document_name": str(doc["name"]),
                "excerpt": text[start:end].strip()[:700],
                "start_char": start,
                "end_char": end,
                "matched_language": match.group(0),
            })

    return {
        "documents_compared": [
            {"id": str(doc["id"]), "name": str(doc["name"]), "contract_type": doc.get("contract_type", "Unknown")}
            for doc in documents
        ],
        "summary": {
            "documents": len(documents),
            "explicit_terms_found": len(facts),
            "term_variations": len(variations),
            "hierarchy_clauses_found": len(hierarchy_evidence),
        },
        "variations": variations,
        "hierarchy_evidence": hierarchy_evidence,
        "coverage": {
            "method": "deterministic extraction of a limited set of explicit textual terms",
            "not_checked": [
                "semantic equivalence expressed in materially different language",
                "whether documents legally form one transaction or have the same parties",
                "whether an amendment validly supersedes another document",
                "all defined-term dependencies and cross-clause interactions",
                "handwritten, scanned, image-only or layout-dependent content",
            ],
            "warning": (
                "A difference is not automatically a contradiction. Different documents may intentionally govern "
                "different parties, periods or scopes. No legal priority or enforceability conclusion is made."
            ),
        },
    }
