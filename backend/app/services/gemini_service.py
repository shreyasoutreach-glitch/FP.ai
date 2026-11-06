"""
FP.ai Gemini Analysis Service
Uses Gemini API (google-genai >= 2.30.1) for deep contract analysis,
plain-English summaries, and actionable recommendations.
"""
import json
import logging
from typing import List, Optional, Dict, Any

from app.core.config import settings
from app.ml.engine import ClauseAnalysis, DocumentAnalysis

logger = logging.getLogger("fpai.gemini")


SYSTEM_PROMPT = """You are FP.ai — an elite contract analysis AI specialised in detecting 
exploitative fine print, hidden vulnerabilities, and legally dangerous clauses.

Your expertise spans:
- Indian Contract Act 1872 (Sections 10, 16, 17, 23, 27, 28, 73, 74)
- SEBI SAST/LODR/PIT Regulations
- Companies Act 2013
- Consumer Protection Act 2019 (India)
- Digital Personal Data Protection Act 2023 (India)
- POSH Act 2013 (India)
- Arbitration & Conciliation Act 1996 (India)
- Employment law including Payment of Wages Act, Payment of Bonus Act
- International law: GDPR, UK UCTA 1977, US FTC regulations
- Historical fine-print cases: M&A CoC traps, employment bond scams, 
  arbitration waivers, phantom equity schemes, unilateral amendment traps

You write for non-lawyers. Use clear, direct language. Flag dangers as a friend 
would warn another friend — not as formal legal advice, but as sharp, practical insight.

ALWAYS structure your responses as valid JSON."""


def _get_client():
    """Lazily initialise Gemini client."""
    try:
        from google import genai
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Failed to init Gemini client: {e}")
        return None


async def analyze_with_gemini(
    contract_text: str,
    ml_clauses: List[ClauseAnalysis],
    contract_type: str,
    document_name: str,
) -> Dict[str, Any]:
    """
    Deep analysis using Gemini API.
    Returns structured analysis results.
    """
    client = _get_client()
    if not client:
        return _fallback_analysis(ml_clauses, contract_type)

    # Build context from ML findings
    ml_summary = _build_ml_summary(ml_clauses)
    critical_clauses = [c for c in ml_clauses if c.risk_level in ("critical", "high")]
    clause_excerpts = "\n\n".join([
        f"[{c.category.upper()} — {c.risk_level.upper()}]\n{c.text[:600]}"
        for c in critical_clauses[:8]
    ])

    prompt = f"""Analyze this {contract_type}: "{document_name}"

ML Pre-Analysis Summary:
{ml_summary}

Top Risk Clause Excerpts:
{clause_excerpts}

Full Contract Text (first 8000 chars):
{contract_text[:8000]}

Provide a comprehensive vulnerability analysis as JSON with this exact structure:
{{
  "executive_summary": "2-3 sentence plain English summary of overall risk",
  "contract_type_confirmed": "{contract_type}",
  "overall_risk_rating": "critical|high|medium|low",
  "top_risks": [
    {{
      "title": "Risk name",
      "severity": "critical|high|medium",
      "explanation": "Plain English explanation",
      "clause_excerpt": "Relevant text from contract",
      "legal_reference": "Specific law/regulation",
      "what_it_means": "What this means for you practically",
      "negotiation_tip": "How to push back"
    }}
  ],
  "hidden_dangers": [
    "Description of non-obvious danger 1",
    "Description of non-obvious danger 2"
  ],
  "jurisdiction_analysis": {{
    "governing_law": "Identified governing law",
    "concerns": ["Jurisdiction concern 1"],
    "india_specific": "Any India-specific legal implications"
  }},
  "readability_assessment": {{
    "verdict": "plain|standard|complex|deliberately_obscure",
    "explanation": "Why this contract is or isn't reader-friendly"
  }},
  "power_imbalance_score": 75,
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "must_remove_clauses": ["Clause type that must be removed/negotiated"],
  "red_flags_summary": "Overall assessment of intentional obscurity vs complexity"
}}"""

    try:
        import asyncio
        loop = asyncio.get_event_loop()
        
        def _call_gemini():
            interaction = client.interactions.create(
                model="gemini-3.8-flash",
                system_instruction=SYSTEM_PROMPT,
                input=prompt,
                store=False,
            )
            return interaction.output_text

        result_text = await loop.run_in_executor(None, _call_gemini)

        # Parse JSON from response
        result_text = result_text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]

        return json.loads(result_text.strip())

    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        return _fallback_analysis(ml_clauses, contract_type)


async def explain_clause(clause_text: str, context: str = "") -> Dict[str, str]:
    """Get plain-English explanation of a specific clause."""
    client = _get_client()
    if not client:
        return {"explanation": "AI explanation unavailable.", "risk": "unknown", "action": "Review with legal counsel."}

    prompt = f"""Explain this contract clause in plain English for a non-lawyer:

Clause: {clause_text[:1000]}
Context: {context[:500]}

Respond as JSON:
{{
  "explanation": "What this clause means in simple terms",
  "risk": "critical|high|medium|low",
  "who_benefits": "drafter|signer|both",
  "real_world_impact": "What happens in practice",
  "action": "What you should do about this"
}}"""

    try:
        import asyncio
        loop = asyncio.get_event_loop()
        
        def _call():
            interaction = client.interactions.create(
                model="gemini-3.8-flash",
                system_instruction=SYSTEM_PROMPT,
                input=prompt,
                store=False,
            )
            return interaction.output_text

        result_text = await loop.run_in_executor(None, _call)
        result_text = result_text.strip().lstrip("```json").lstrip("```").rstrip("```")
        return json.loads(result_text.strip())
    except Exception as e:
        logger.error(f"Clause explanation failed: {e}")
        return {"explanation": "Explanation unavailable.", "risk": "unknown", "action": "Review manually."}


def _build_ml_summary(clauses: List[ClauseAnalysis]) -> str:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for c in clauses:
        counts[c.risk_level] = counts.get(c.risk_level, 0) + 1
    return (
        f"Found {len(clauses)} clauses total: "
        f"{counts['critical']} critical, {counts['high']} high, "
        f"{counts['medium']} medium, {counts['low']} low risk."
    )


def _fallback_analysis(clauses: List[ClauseAnalysis], contract_type: str) -> Dict[str, Any]:
    """Rule-based fallback when Gemini is unavailable."""
    critical = [c for c in clauses if c.risk_level == "critical"]
    high = [c for c in clauses if c.risk_level == "high"]

    if critical:
        overall = "critical"
        summary = f"⚠️ CRITICAL: This {contract_type} contains {len(critical)} clauses heuristically flagged as critical and worth qualified legal review before signing."
    elif high:
        overall = "high"
        summary = f"This {contract_type} contains {len(high)} clauses heuristically flagged as high risk and worth reviewing with qualified counsel."
    else:
        overall = "medium"
        summary = f"This {contract_type} was screened using FP.ai's rules and statistical features. The output is a triage signal, not a legal opinion."

    top_risks = []
    for c in sorted(clauses, key=lambda x: x.risk_score, reverse=True)[:5]:
        if c.matched_pattern and c.risk_level in ("critical", "high"):
            top_risks.append({
                "title": c.matched_pattern,
                "severity": c.risk_level,
                "explanation": c.plain_english,
                "clause_excerpt": c.text[:300],
                "legal_reference": c.legal_basis,
                "what_it_means": c.plain_english,
                "negotiation_tip": c.mitigation,
            })

    return {
        "executive_summary": summary,
        "contract_type_confirmed": contract_type,
        "overall_risk_rating": overall,
        "top_risks": top_risks,
        "hidden_dangers": [
            "Complex legal language may obscure additional obligations.",
            "Cross-reference all clauses — contradictions may exist.",
        ],
        "jurisdiction_analysis": {
            "governing_law": "Not determined (AI offline)",
            "concerns": [],
            "india_specific": "",
        },
        "readability_assessment": {
            "verdict": "standard",
            "explanation": "Full readability assessment requires Gemini API key.",
        },
        "power_imbalance_score": 50,
        "recommendations": [
            "Have a lawyer review critical clauses before signing.",
            "Negotiate any uncapped liability provisions.",
            "Clarify all bonus and compensation terms in writing.",
        ],
        "must_remove_clauses": [c.matched_pattern for c in critical if c.matched_pattern],
        "red_flags_summary": f"ML analysis identified {len(critical)} critical and {len(high)} high risk clauses.",
    }
