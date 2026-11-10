"""User-defined contract guardrails with clause-level evidence.

The engine checks only for language represented in the extracted clauses. It
does not decide enforceability, legal compliance, or whether a clause is fair.
A "not_detected" result means no matching extracted evidence was found; it is
not proof that a protection is absent from the full agreement.
"""
from typing import Any


RULES: dict[str, dict[str, Any]] = {
    "exit_flexibility": {
        "title": "I need a workable exit",
        "description": "Surface notice periods, lock-ins, early-exit charges and termination control.",
        "categories": {"termination", "penalty", "auto_renewal"},
        "terms": ("termination", "terminate", "notice period", "resign", "lock-in", "lock in", "minimum service", "service bond", "training cost", "early exit", "liquidated damages", "renewal", "cancel"),
        "conflicts": ("without notice", "sole discretion", "without cause", "early termination fee", "liquidated damages", "service bond", "training cost", "minimum service period", "irrevocably", "no right to terminate", "at any time"),
        "question": "Can both sides exit on clearly defined terms, and what would I owe or lose if I leave early?",
    },
    "protect_existing_ip": {
        "title": "I keep what I already own and create independently",
        "description": "Check IP assignment, inventions, work product and possible carve-outs for pre-existing or unrelated work.",
        "categories": {"ip_ownership", "assignment"},
        "terms": ("intellectual property", "work product", "invention", "copyright", "source code", "assign", "assignment", "background ip", "pre-existing"),
        "conflicts": ("all intellectual property", "whether or not related", "whether or not", "all inventions", "conceived during", "created during the term", "irrevocably assign", "worldwide rights, title and interest"),
        "question": "Please identify the exact boundary between work created for this engagement and my pre-existing, personal or unrelated work.",
    },
    "cap_liability": {
        "title": "I need a defined ceiling on what I could owe",
        "description": "Surface liability, indemnity, damages and any explicit cap or carve-out.",
        "categories": {"liability", "indemnity", "limitation_of_liability", "penalty"},
        "terms": ("liability", "indemn", "damages", "losses", "claims", "cap", "maximum amount"),
        "conflicts": ("unlimited liability", "uncapped", "without any cap", "without limitation", "any and all losses", "lost profits", "consequential damages", "jointly and severally", "no monetary ceiling"),
        "question": "What is the aggregate monetary cap, which claims sit outside it, and does it apply equally to both parties?",
    },
    "payment_certainty": {
        "title": "I need clear and enforceable payment mechanics",
        "description": "Surface fee or salary terms, payment triggers, approval conditions, deductions and withholding rights.",
        "categories": {"salary_compensation", "payment", "fees", "remuneration"},
        "terms": ("salary", "remuneration", "compensation", "fees", "invoice", "payment", "payable", "milestone", "reimbursement", "commission"),
        "conflicts": ("sole discretion", "may withhold", "may deduct", "forfeit", "subject to sole approval", "no obligation to pay", "at its discretion", "only upon acceptance"),
        "question": "What exact event makes payment due, who decides acceptance, what is the deadline, and what happens when payment is late?",
    },
    "avoid_restrictive_covenants": {
        "title": "I need freedom to work with others",
        "description": "Surface non-competes, non-solicits, exclusivity and restrictions that may continue after the agreement ends.",
        "categories": {"non_compete"},
        "terms": ("non-compete", "noncompete", "non-solicit", "non solicit", "exclusivity", "exclusive", "competitor", "competing business", "restraint of trade", "solicit any customer"),
        "conflicts": ("anywhere in the world", "worldwide", "any business", "any competitor", "perpetual", "for a period of five", "directly or indirectly", "all customers"),
        "question": "Can the restriction be limited by activity, customers, geography and duration, and does it survive termination?",
    },
    "control_renewal": {
        "title": "I need control over renewals and price changes",
        "description": "Surface automatic renewal, notice windows and unilateral variation rights.",
        "categories": {"auto_renewal", "unilateral_modification"},
        "terms": ("auto-renew", "automatically renew", "renewal", "renew unless", "notice before expiry", "price increase", "modify the terms", "change the fees"),
        "conflicts": ("automatically renew", "auto-renew", "renew unless either party", "sole discretion", "without prior notice", "unilateral"),
        "question": "How do I stop renewal, how much advance notice is required, and can the other side change price or terms without my consent?",
    },
}


def evaluate_decision_rules(
    clauses: list[dict[str, Any]] | None,
    priority_ids: list[str],
) -> dict[str, Any]:
    """Evaluate selected personal priorities against extracted clause evidence."""
    source_clauses = clauses or []
    checks: list[dict[str, Any]] = []

    for priority_id in priority_ids:
        rule = RULES.get(priority_id)
        if rule is None:
            raise ValueError(f"Unsupported priority: {priority_id}")

        matches: list[dict[str, Any]] = []
        for clause in source_clauses:
            if not isinstance(clause, dict):
                continue
            text = str(clause.get("text") or "")
            lowered = text.casefold()
            category = str(clause.get("category") or "").casefold()
            category_match = category in rule["categories"]
            term_match = any(term in lowered for term in rule["terms"])
            if not (category_match or term_match):
                continue

            conflict_terms = [term for term in rule["conflicts"] if term in lowered]
            matches.append({
                "category": category or "unclassified",
                "risk_level": str(clause.get("risk_level") or "unknown"),
                "text": text[:900],
                "start_char": clause.get("start_char"),
                "end_char": clause.get("end_char"),
                "conflict_terms": conflict_terms,
            })

        if not matches:
            status = "not_detected"
            summary = (
                "No matching evidence was found in the extracted clauses. "
                "This is not proof that the agreement contains no such term or that you are protected."
            )
        elif any(item["conflict_terms"] for item in matches):
            status = "potential_conflict"
            summary = (
                "The extracted text contains wording that may conflict with this priority. "
                "Review the quoted provisions and clarify the practical effect before signing."
            )
        elif any(item["risk_level"] in {"critical", "high"} for item in matches):
            status = "needs_review"
            summary = (
                "Relevant provisions were found and at least one has a high or critical screening rating. "
                "The rating is a triage signal, not a legal conclusion."
            )
        else:
            status = "evidence_found"
            summary = (
                "Relevant wording was found. FP.ai has not determined that it adequately protects this priority; "
                "check its scope, exceptions and interaction with the rest of the agreement."
            )

        checks.append({
            "priority_id": priority_id,
            "title": rule["title"],
            "description": rule["description"],
            "status": status,
            "summary": summary,
            "question_to_raise": rule["question"],
            "evidence": matches[:8],
            "evidence_count": len(matches),
        })

    counts = {
        "potential_conflict": sum(1 for item in checks if item["status"] == "potential_conflict"),
        "needs_review": sum(1 for item in checks if item["status"] == "needs_review"),
        "evidence_found": sum(1 for item in checks if item["status"] == "evidence_found"),
        "not_detected": sum(1 for item in checks if item["status"] == "not_detected"),
    }
    return {
        "checks": checks,
        "counts": counts,
        "disclaimer": (
            "This is a preference-alignment screen over extracted contract text, not legal advice or an enforceability opinion. "
            "Clause extraction can miss text, and a matching phrase does not establish its legal effect."
        ),
    }
