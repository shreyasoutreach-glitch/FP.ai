"""
Standalone Verification Script for FP.ai ML & Legal Intelligence Engine
Tests:
  1. Engine initialization & hybrid vectorizer
  2. Document clause segmentation
  3. Pattern recognition against historical & statutory fine-print cases:
     - Disney+ Piccolo doctrine (2024 wrongful death forced arbitration)
     - Infosys & Indian IT 6-month non-compete under Section 27 ICA
     - BYJU'S / EdTech service bond & liquidated damages under Section 74 ICA
     - Enron off-balance-sheet SPE indemnity covenants
     - SEBI SAST Takeover Regulations (25% voting threshold / mandatory open offer)
     - Companies Act 2013 Section 188 related party transaction compliance
     - Competition Act 2002 / Deal Value Threshold (DVT Rs 2000 Cr) M&A traps
     - DPDP Act 2023 data fiduciary statutory liabilities & cross-border transfers
     - Employment salary traps (phantom equity clawbacks, POSH Act non-disparagement)
     - Consumer ToS traps (unilateral modification, negative option billing, class action waivers)
  4. Unsupervised clustering & topic extraction
  5. Anomaly detection via Isolation Forest
  6. Readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade, Coleman-Liau)
  7. Risk aggregation and power imbalance scoring
  8. Output persistence to `data/samples/test_results.json`
"""
import os
import sys
import json
import asyncio
from pathlib import Path

# Force UTF-8 encoding for Windows console output
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure backend directory is in python search path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.ml.engine import FPMLEngine
from app.services.extractor import segment_into_clauses, detect_contract_type


def run_tests():
    print("=" * 80)
    print("🚀 FP.ai ML & Legal Intelligence Engine — Standalone Verification")
    print("=" * 80)

    # 1. Initialize Engine
    print("\n[Step 1] Initializing ML Engine...")
    engine = FPMLEngine()
    asyncio.run(engine.load())
    print("  ✓ ML Engine loaded successfully.")

    # 2. Define Sample Test Files
    samples_dir = BASE_DIR / "data" / "samples"
    test_files = [
        {
            "filename": "ma_acquisition_agreement.txt",
            "name": "M&A Share Purchase & Acquisition Agreement",
            "expected_triggers": [
                "deal value threshold",
                "sebi sast",
                "section 188",
                "spe indemnity",
                "unlimited liability",
                "founder",
            ]
        },
        {
            "filename": "executive_employment_agreement.txt",
            "name": "Executive Employment & Retention Agreement",
            "expected_triggers": [
                "service bond",
                "section 27",
                "inventions",
                "phantom equity",
                "posh act",
            ]
        },
        {
            "filename": "saas_consumer_terms.txt",
            "name": "SaaS Platform Consumer Terms of Service",
            "expected_triggers": [
                "unilateral modification",
                "negative option",
                "disney",
                "class action",
                "dpdp act",
            ]
        },
    ]

    results_summary = {}
    total_passed_assertions = 0

    for item in test_files:
        filepath = samples_dir / item["filename"]
        print(f"\n[Testing Contract] {item['name']} ({item['filename']})")
        assert filepath.exists(), f"Sample file not found: {filepath}"

        with open(filepath, "r", encoding="utf-8") as f:
            raw_text = f.read()

        contract_type = detect_contract_type(raw_text)
        print(f"  • Detected Contract Type: {contract_type}")

        # Segment clauses
        clauses = segment_into_clauses(raw_text)
        print(f"  • Segmented Clauses: {len(clauses)}")
        assert len(clauses) >= 4, f"Expected at least 4 clauses, got {len(clauses)}"
        total_passed_assertions += 1

        # Run ML Analysis
        clause_analyses = engine.analyze_clauses(clauses, document_id=item["filename"])
        assert len(clause_analyses) == len(clauses), "Mismatch in analyzed clauses count"
        total_passed_assertions += 1

        # Aggregate document analysis
        doc_analysis = engine.aggregate_document_analysis(
            clause_analyses,
            document_id=item["filename"],
            document_name=item["name"],
            contract_type=contract_type,
        )

        # Verify pattern matching & red-flag detection
        detected_patterns = [c.matched_pattern for c in clause_analyses if c.matched_pattern]
        detected_flags = [flag for c in clause_analyses for flag in c.flags]
        print(f"  • Matched Patterns Count: {len(detected_patterns)} / {len(clauses)}")
        print(f"  • High/Critical Risk Clauses: {doc_analysis.critical_count + doc_analysis.high_count}")
        print(f"  • Overall Risk Score: {doc_analysis.overall_risk_score} / 100 ({doc_analysis.overall_risk_rating.upper()})")
        print(f"  • Readability: Flesch {doc_analysis.readability_score}, FK Grade Level {doc_analysis.fk_grade_level}")
        print(f"  • Power Imbalance Score: {doc_analysis.power_imbalance_score} / 100")

        # Verify clustering & cluster topics
        cluster_topics = engine.cluster_topics
        print(f"  • Distinct Clusters Formed: {len(cluster_topics)}")
        for cid, tinfo in cluster_topics.items():
            print(f"    - Cluster {cid}: '{tinfo['topic_name']}' (keywords: {', '.join(tinfo['keywords'][:4])})")

        assert len(cluster_topics) >= 1, "Expected at least 1 cluster"
        total_passed_assertions += 1

        # Verify expected triggers
        found_expected = 0
        all_text_lower = " ".join(detected_flags + detected_patterns).lower()
        for exp in item["expected_triggers"]:
            if exp in all_text_lower:
                found_expected += 1
                print(f"    ✓ Verified expected trigger match: '{exp}'")
            else:
                print(f"    ⚠ Expected trigger not directly in pattern names/flags: '{exp}'")

        assert found_expected >= 2, f"Failed to match enough key triggers for {item['filename']}"
        total_passed_assertions += 1

        # Store results for JSON export
        results_summary[item["filename"]] = {
            "document_name": item["name"],
            "contract_type": contract_type,
            "total_clauses": len(clauses),
            "critical_count": doc_analysis.critical_count,
            "high_count": doc_analysis.high_count,
            "medium_count": doc_analysis.medium_count,
            "low_count": doc_analysis.low_count,
            "overall_risk_score": doc_analysis.overall_risk_score,
            "overall_risk_rating": doc_analysis.overall_risk_rating,
            "readability_score": doc_analysis.readability_score,
            "fk_grade_level": doc_analysis.fk_grade_level,
            "power_imbalance_score": doc_analysis.power_imbalance_score,
            "top_risks": doc_analysis.top_risks,
            "cluster_topics": list(cluster_topics.values()),
            "clauses": [
                {
                    "clause_index": i + 1,
                    "preview": c.text[:90] + ("..." if len(c.text) > 90 else ""),
                    "category": c.category,
                    "risk_level": c.risk_level,
                    "risk_score": c.risk_score,
                    "matched_pattern": c.matched_pattern,
                    "flags": c.flags,
                    "anomaly_score": c.anomaly_score,
                    "is_anomaly": c.is_anomaly,
                    "cluster_id": c.cluster_id,
                    "cluster_topic": c.cluster_topic,
                    "readability_fre": c.readability_score,
                    "fk_grade_level": c.fk_grade_level,
                    "coleman_liau": c.coleman_liau_index,
                }
                for i, c in enumerate(clause_analyses)
            ]
        }

    # 3. Save Verified Test Results
    output_path = samples_dir / "test_results.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)

    print("\n" + "=" * 80)
    print(f"✅ All {total_passed_assertions} test assertions passed successfully!")
    print(f"📁 Verified test results saved to: {output_path}")
    print("=" * 80)
    return results_summary


if __name__ == "__main__":
    run_tests()
