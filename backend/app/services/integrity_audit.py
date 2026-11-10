"""Deterministic structural integrity checks for extracted contract text.

These checks report document-internal drafting and completeness signals. They do
not infer legal validity, enforceability, or whether a separate attachment exists.
"""
import re
from typing import Any


_NUMBER_WORDS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
    "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13,
    "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17,
    "eighteen": 18, "nineteen": 19, "twenty": 20, "thirty": 30,
    "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
    "eighty": 80, "ninety": 90,
}

_PLACEHOLDER = re.compile(
    r"\[(?:\s*(?:●+|x{2,}|_+|insert\b|to be completed\b|tbd\b|tbc\b|name\b|date\b|amount\b|address\b|●)\s*)\]"
    r"|<\s*(?:insert|name|date|amount|address|company|party)[^>]*>"
    r"|\b(?:TBD|TBC|TODO|TO BE COMPLETED|INSERT (?:NAME|DATE|AMOUNT|ADDRESS|DETAILS) HERE)\b"
    r"|_{3,}",
    re.IGNORECASE,
)
_SECTION_HEADING = re.compile(
    r"^\s*(?:(?:SECTION|CLAUSE|ARTICLE)\s+)?(\d+(?:\.\d+)*)(?:\s*[:.)-]|\s+[A-Z])",
    re.IGNORECASE,
)
_NUMBERED_REFERENCE = re.compile(
    r"\b(?:section|clause|article)\s+(\d+(?:\.\d+)*)\b",
    re.IGNORECASE,
)
_SCHEDULE_REFERENCE = re.compile(
    r"\b(schedule|exhibit|annex(?:ure)?|appendix)\s+([A-Z]|\d{1,2})\b",
    re.IGNORECASE,
)
_SCHEDULE_HEADING = re.compile(
    r"^\s*(?:SCHEDULE|EXHIBIT|ANNEX(?:URE)?|APPENDIX)\s+([A-Z]|\d{1,2})\b",
    re.IGNORECASE | re.MULTILINE,
)
_NUMERIC_WORD_MISMATCH = re.compile(
    r"\b(" + "|".join(sorted(_NUMBER_WORDS, key=len, reverse=True)) +
    r")\s*\(\s*(\d{1,3})\s*\)",
    re.IGNORECASE,
)
_EXTERNAL_DEPENDENCY = re.compile(
    r"\b(?:incorporated by reference|subject to (?:the )?(?:company'?s? )?(?:standard )?(?:online )?(?:terms|policies|privacy policy)|"
    r"as set forth in (?:the )?(?:online )?(?:terms|policy)|available at https?://|"
    r"published at https?://|as amended from time to time at)\b",
    re.IGNORECASE,
)


def audit_document_integrity(text: str) -> dict[str, Any]:
    """Return evidence-backed structural checks over extracted text."""
    source = text or ""
    findings: list[dict[str, Any]] = []
    seen: set[tuple[str, int, int]] = set()

    def add_finding(
        kind: str,
        severity: str,
        title: str,
        explanation: str,
        next_step: str,
        start: int,
        end: int,
    ) -> None:
        key = (kind, start, end)
        if key in seen:
            return
        seen.add(key)
        excerpt = source[start:end].strip()
        findings.append({
            "id": f"{kind}-{len(findings) + 1}",
            "kind": kind,
            "severity": severity,
            "title": title,
            "explanation": explanation,
            "next_step": next_step,
            "excerpt": excerpt[:600],
            "start_char": start,
            "end_char": end,
        })

    # Unfilled template fields and drafting placeholders.
    for match in _PLACEHOLDER.finditer(source):
        add_finding(
            "unfilled_placeholder", "review", "Possible unfilled placeholder",
            "The extracted text contains a template marker or blank that may need completion before execution.",
            "Confirm whether this is intentional. Complete or remove the placeholder in the authoritative final copy.",
            match.start(), match.end(),
        )

    # Cross-references that do not resolve to a numbered heading in this upload.
    declared_numbers: set[str] = set()
    for line in source.splitlines():
        heading = _SECTION_HEADING.match(line)
        if heading:
            number = heading.group(1)
            declared_numbers.add(number)
            # A section 4.2 implies a parent section 4 exists in the numbering hierarchy.
            parts = number.split(".")
            for idx in range(1, len(parts)):
                declared_numbers.add(".".join(parts[:idx]))

    checked_references: set[str] = set()
    for match in _NUMBERED_REFERENCE.finditer(source):
        number = match.group(1)
        ref_key = number.casefold()
        if ref_key in checked_references:
            continue
        checked_references.add(ref_key)

        context = source[max(0, match.start() - 90):min(len(source), match.end() + 90)]
        # Statutory citations are external legal references, not agreement cross-references.
        if re.search(r"\b(?:Act|Code|Regulation|Regulations|Rules|Statute)\b", context, re.IGNORECASE):
            continue
        if number not in declared_numbers:
            add_finding(
                "unresolved_internal_reference", "review", "Cross-reference not located in this upload",
                f"The text refers to Section/Clause/Article {number}, but a matching numbered heading was not located in the extracted text. It may be a broken reference or may point to material not included in this upload.",
                "Open the authoritative agreement and verify the target section exists, has the intended number, and is part of the same version.",
                match.start(), match.end(),
            )

    # Schedules and exhibits are often separate attachments. Distinguish a missing
    # schedule heading in the uploaded text from proof that the attachment is absent.
    declared_schedules = {
        match.group(1).casefold()
        for match in _SCHEDULE_HEADING.finditer(source)
    }
    checked_schedules: set[tuple[str, str]] = set()
    for match in _SCHEDULE_REFERENCE.finditer(source):
        doc_type, identifier = match.group(1).casefold(), match.group(2).casefold()
        key = (doc_type, identifier)
        if key in checked_schedules:
            continue
        checked_schedules.add(key)
        if identifier not in declared_schedules:
            add_finding(
                "unverified_schedule", "review", "Referenced schedule or exhibit not found in this upload",
                f"The agreement text refers to {match.group(1).title()} {match.group(2)}, but no matching schedule or exhibit heading was found in the extracted file. It may be a separate attachment.",
                "Obtain the referenced schedule/exhibit and confirm it belongs to this agreement version before relying on the terms.",
                match.start(), match.end(),
            )

    # Number-as-words and number-as-digits agreement.
    for match in _NUMERIC_WORD_MISMATCH.finditer(source):
        word_value = _NUMBER_WORDS[match.group(1).casefold()]
        digit_value = int(match.group(2))
        if word_value != digit_value:
            add_finding(
                "number_word_mismatch", "review", "Number in words does not match the digits",
                f"The text spells out {word_value} but shows {digit_value} in parentheses. This is an objective drafting inconsistency that should be resolved in the signed version.",
                "Confirm the intended value against the negotiated commercial term and correct both representations consistently.",
                match.start(), match.end(),
            )

    # Reliance on online or external terms that are not part of the extracted packet.
    for match in _EXTERNAL_DEPENDENCY.finditer(source):
        add_finding(
            "external_document_dependency", "info", "External terms or policy may affect this agreement",
            "The wording appears to incorporate or depend on terms/policies outside the extracted text. Their current contents and version were not verified by this scan.",
            "Obtain a dated copy or immutable version of the referenced terms/policy and review it alongside this agreement.",
            match.start(), match.end(),
        )

    severity_order = {"review": 0, "info": 1}
    findings.sort(key=lambda item: (severity_order.get(item["severity"], 9), item["start_char"]))

    review_count = sum(1 for item in findings if item["severity"] == "review")
    info_count = sum(1 for item in findings if item["severity"] == "info")
    return {
        "version": "1.0",
        "status": "attention" if review_count else ("context_needed" if info_count else "no_flags_found"),
        "summary": {
            "findings_total": len(findings),
            "review_items": review_count,
            "context_items": info_count,
        },
        "findings": findings,
        "checks_run": [
            "template_placeholders",
            "numbered_cross_references",
            "schedule_and_exhibit_references",
            "number_word_consistency",
            "external_terms_dependencies",
        ],
        "coverage_note": (
            "This scan checks detectable drafting and document-structure signals in extracted text only. "
            "No flags does not prove the agreement is complete, accurate, enforceable or safe to sign. "
            "Scanned pages, layout-dependent terms, complex tables, embedded objects, separate attachments "
            "and material incorporated from external sources may not be fully represented."
        ),
    }
