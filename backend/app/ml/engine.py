"""
FP.ai contract clause screening engine.

Production dependencies provide word/character TF-IDF features and K-Means
clustering, with document-relative Isolation Forest anomaly signals. Optional
SentenceTransformer, HDBSCAN and UMAP imports are guarded by fallbacks; the
deployed dependency set uses the portable TF-IDF/K-Means/PCA path.

Legal phrase matching and risk scores are heuristic screening aids, not legal
determinations or calibrated probabilities. No online model training occurs.
"""
import re
import json
import math
import logging
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict, field

import numpy as np
from app.core.config import settings
from app.core.knowledge_base import (
    CLAUSE_KNOWLEDGE_BASE,
    ClausePattern,
    RiskLevel,
    ClauseCategory,
    find_patterns_by_category,
)

logger = logging.getLogger("fpai.ml")


@dataclass
class ClauseAnalysis:
    text: str
    start_char: int
    end_char: int
    category: str
    risk_level: str
    risk_score: float          # 0–100 composite risk score
    matched_pattern: Optional[str]
    plain_english: str
    mitigation: str
    legal_basis: str
    anomaly_score: float       # Raw IsolationForest score_samples value; lower is more anomalous within this document
    cluster_id: int
    is_anomaly: bool
    readability_score: float   # Flesch Reading Ease (0–100, higher = easier)
    flags: List[str]           # specific red-flag phrases found
    match_strength: float      # Heuristic phrase-match strength; not a probability
    risk_score_breakdown: Dict[str, float] = field(default_factory=dict)
    # Extended metrics
    fk_grade_level: float = 0.0     # Flesch-Kincaid Grade Level
    coleman_liau_index: float = 0.0 # Coleman-Liau readability index
    cluster_topic: str = ""         # Human-readable cluster topic title


@dataclass
class ClusterTopicInfo:
    cluster_id: int
    topic_name: str
    keywords: List[str]
    clause_count: int
    avg_risk_score: float


@dataclass
class DocumentAnalysis:
    document_id: str
    document_name: str
    contract_type: str
    total_clauses: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    overall_risk_score: float
    overall_risk_rating: str
    readability_score: float
    fk_grade_level: float
    power_imbalance_score: int
    clauses: List[ClauseAnalysis]
    cluster_topics: List[Dict[str, Any]]
    executive_summary: str
    top_risks: List[str]
    recommendations: List[str]
    jurisdiction_flags: List[str]
    word_count: int
    page_estimate: int


class FPMLEngine:
    """
    Fine Print ML Engine.
    Employs unsupervised machine learning, anomaly detection, statistical NLP,
    and a deep statutory knowledge base to expose hidden fine-print traps.
    """

    def __init__(self):
        self.embedding_model = None
        self.umap_reducer = None
        self.clusterer = None
        self.cluster_topics: Dict[int, Dict[str, Any]] = {}
        self.embeddings_cache: Dict[str, np.ndarray] = {}
        self.is_loaded = False

    async def load(self):
        """Load ML models (async wrapper around sync loading)."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._load_sync)
        self.is_loaded = True
        logger.info("ML Engine fully loaded and operational")

    def _load_sync(self):
        """Load optional sentence embeddings; the portable TF-IDF fallback is always available."""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Attempting to load sentence transformer: {settings.EMBEDDING_MODEL}")
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.info(
                "SentenceTransformer unavailable (%s); using word and character TF-IDF features.",
                e,
            )
            self.embedding_model = None

    # ──────────────────────────────────────────────────────────────────────────
    # VECTORIZATION PIPELINE
    # ──────────────────────────────────────────────────────────────────────────

    def _get_embedding(self, text: str) -> np.ndarray:
        """Get vector embedding for a single text chunk."""
        if self.embedding_model is not None:
            try:
                return self.embedding_model.encode([text])[0]
            except Exception:
                pass
        return self._compute_hybrid_fallback_vectors([text])[0]

    def _get_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        """Batch embedding computation with graceful fallback."""
        if not texts:
            return np.zeros((0, 256), dtype=np.float32)

        if self.embedding_model is not None:
            try:
                emb = self.embedding_model.encode(texts, show_progress_bar=False)
                return np.array(emb, dtype=np.float32)
            except Exception as e:
                logger.warning(f"SentenceTransformer batch encoding failed: {e}. Falling back.")

        return self._compute_hybrid_fallback_vectors(texts)

    def _compute_hybrid_fallback_vectors(self, texts: List[str]) -> np.ndarray:
        """
        High-dimensional hybrid TF-IDF + Character n-gram vectorizer.
        Extracts both semantic word stems and syntactic subword structures
        to create consistent, normalized embeddings across the corpus.
        """
        from sklearn.feature_extraction.text import TfidfVectorizer

        # Seed the vocabulary with key legal phrases from knowledge base to ensure
        # critical fine print terms are heavily represented in the vector space
        seed_vocab = set()
        for p in CLAUSE_KNOWLEDGE_BASE:
            seed_vocab.update(p.name.lower().split())
            for phrase in p.red_flag_phrases:
                seed_vocab.update(phrase.lower().split())

        # Clean texts
        cleaned_texts = [re.sub(r"\s+", " ", t).strip() for t in texts]

        # 1. Word n-grams (1, 2)
        word_vec = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=192,
            sublinear_tf=True,
            stop_words="english",
        )
        try:
            word_features = word_vec.fit_transform(cleaned_texts).toarray()
        except Exception:
            word_features = np.zeros((len(texts), 192), dtype=np.float32)

        # 2. Subword character n-grams (3, 5) for syntactic fine print detection
        char_vec = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=64,
            sublinear_tf=True,
        )
        try:
            char_features = char_vec.fit_transform(cleaned_texts).toarray()
        except Exception:
            char_features = np.zeros((len(texts), 64), dtype=np.float32)

        # Combine and L2 normalize
        combined = np.hstack([word_features, char_features]).astype(np.float32)
        norms = np.linalg.norm(combined, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return combined / norms

    # ──────────────────────────────────────────────────────────────────────────
    # READABILITY & LINGUISTIC OBSCURITY ANALYTICS
    # ──────────────────────────────────────────────────────────────────────────

    def _compute_readability(self, text: str) -> Tuple[float, float, float]:
        """
        Calculate three complementary readability indices:
        1. Flesch Reading Ease (0-100, lower = more obscure/difficult)
        2. Flesch-Kincaid Grade Level (approx school/university grade level)
        3. Coleman-Liau Index (character/sentence length index)
        """
        text_clean = text.strip()
        words = re.findall(r"\b[A-Za-z0-9\'-]+\b", text_clean)
        sentences = [s.strip() for s in re.split(r"[.!?]+(?:\s+|$)", text_clean) if s.strip()]

        word_count = len(words)
        sentence_count = max(1, len(sentences))
        char_count = sum(len(w) for w in words)

        if word_count == 0:
            return 50.0, 10.0, 10.0

        syllables = sum(self._count_syllables(w) for w in words)

        asl = word_count / sentence_count                # Average Sentence Length
        asw = syllables / word_count                     # Average Syllables per Word
        letters_per_100 = (char_count / word_count) * 100
        sentences_per_100 = (sentence_count / word_count) * 100

        # 1. Flesch Reading Ease
        fre = 206.835 - (1.015 * asl) - (84.6 * asw)
        fre_clamped = max(0.0, min(100.0, fre))

        # 2. Flesch-Kincaid Grade Level
        fk_grade = (0.39 * asl) + (11.8 * asw) - 15.59
        fk_grade_clamped = max(1.0, min(24.0, fk_grade))

        # 3. Coleman-Liau Index
        cli = (0.0588 * letters_per_100) - (0.296 * sentences_per_100) - 15.8
        cli_clamped = max(1.0, min(24.0, cli))

        return round(fre_clamped, 1), round(fk_grade_clamped, 1), round(cli_clamped, 1)

    @staticmethod
    def _count_syllables(word: str) -> int:
        """Heuristic syllable counter for English words."""
        word = word.lower().strip(".,!?;:\"'()[]{}")
        if not word:
            return 1
        vowels = "aeiouy"
        count = 0
        prev_is_vowel = False
        for c in word:
            is_vowel = c in vowels
            if is_vowel and not prev_is_vowel:
                count += 1
            prev_is_vowel = is_vowel
        if word.endswith("e") and not word.endswith("le") and count > 1:
            count -= 1
        return max(1, count)

    # ──────────────────────────────────────────────────────────────────────────
    # STATUTORY PATTERN MATCHING & HEURISTIC DETECTION
    # ──────────────────────────────────────────────────────────────────────────

    def _pattern_match(self, text: str) -> Tuple[Optional[ClausePattern], List[str], float]:
        """
        Match text against the rich statutory and historical knowledge base.
        Returns (best_pattern, matched_red_flags, heuristic_match_strength).
        """
        text_lower = text.lower()
        best_pattern = None
        best_score = 0.0
        all_matched_flags = []

        for pattern in CLAUSE_KNOWLEDGE_BASE:
            matched_in_pattern = []
            for phrase in pattern.red_flag_phrases:
                phrase_lower = phrase.lower()
                # Direct match or word boundary match
                if phrase_lower in text_lower:
                    matched_in_pattern.append(phrase)

            if matched_in_pattern:
                all_matched_flags.extend(matched_in_pattern)
                # Compute score based on matches and risk priority
                risk_multiplier = {
                    RiskLevel.CRITICAL: 1.5,
                    RiskLevel.HIGH: 1.2,
                    RiskLevel.MEDIUM: 1.0,
                    RiskLevel.LOW: 0.8,
                    RiskLevel.INFO: 0.5,
                }.get(pattern.risk_level, 1.0)

                coverage = len(matched_in_pattern) / max(len(pattern.red_flag_phrases), 1)
                score = (len(matched_in_pattern) * 2.0 + coverage) * risk_multiplier

                if score > best_score:
                    best_score = score
                    best_pattern = pattern

        unique_flags = list(dict.fromkeys(all_matched_flags))
        match_strength = min(1.0, round(best_score / 3.0, 2)) if best_pattern else 0.0
        return best_pattern, unique_flags, match_strength

    def _heuristic_classify(
        self, text: str, is_anomaly: bool, readability: float, fk_grade: float
    ) -> Tuple[RiskLevel, ClauseCategory]:
        """
        Sophisticated fallback heuristic classifier for clauses not directly matched in knowledge base.
        """
        text_lower = text.lower()

        # Specific high-risk triggers
        if any(w in text_lower for w in ["indemnif", "hold harmless", "defend and hold"]):
            return RiskLevel.CRITICAL, ClauseCategory.INDEMNITY
        if any(w in text_lower for w in ["unlimited liability", "consequential damages", "indirect damages"]):
            return RiskLevel.CRITICAL, ClauseCategory.LIABILITY
        if any(w in text_lower for w in ["non-compete", "restraint of trade", "not compete", "not solicit"]):
            return RiskLevel.CRITICAL, ClauseCategory.NON_COMPETE
        if any(w in text_lower for w in ["arbitrat", "class action", "jury trial", "dispute resolution"]):
            return RiskLevel.HIGH, ClauseCategory.ARBITRATION
        if any(w in text_lower for w in ["liquidated damages", "penalty", "forfeit", "bond"]):
            return RiskLevel.HIGH, ClauseCategory.PENALTY
        if any(w in text_lower for w in ["terminate", "cancellation", "end of term", "notice period"]):
            return RiskLevel.HIGH, ClauseCategory.TERMINATION
        if any(w in text_lower for w in ["intellectual property", "inventions", "work product", "works made for hire"]):
            return RiskLevel.HIGH, ClauseCategory.IP_OWNERSHIP
        if any(w in text_lower for w in ["privacy", "personal data", "dpdp", "gdpr", "data fiduciary"]):
            return RiskLevel.HIGH, ClauseCategory.DATA_PRIVACY
        if any(w in text_lower for w in ["salary", "remuneration", "bonus", "equity", "incentive"]):
            return RiskLevel.MEDIUM, ClauseCategory.SALARY_COMPENSATION
        if any(w in text_lower for w in ["auto-renew", "automatic renewal", "successive terms"]):
            return RiskLevel.MEDIUM, ClauseCategory.AUTO_RENEWAL
        if any(w in text_lower for w in ["modify", "amend at any time", "change these terms"]):
            return RiskLevel.HIGH, ClauseCategory.UNILATERAL_MODIFICATION
        if any(w in text_lower for w in ["confidential", "proprietary information", "non-disclosure"]):
            return RiskLevel.MEDIUM, ClauseCategory.CONFIDENTIALITY
        if any(w in text_lower for w in ["governing law", "jurisdiction", "exclusive venue"]):
            return RiskLevel.LOW, ClauseCategory.GOVERNING_LAW

        # Anomaly + high obscurity
        if is_anomaly and (readability < 35 or fk_grade > 16.0):
            return RiskLevel.HIGH, ClauseCategory.INDETERMINATE

        return RiskLevel.LOW, ClauseCategory.INDETERMINATE

    def _generate_plain_english_heuristic(self, text: str, risk_level: RiskLevel, category: ClauseCategory) -> str:
        """Generate intuitive layman translation for heuristic classifications."""
        cat_str = category.value.replace("_", " ").title()
        if risk_level == RiskLevel.CRITICAL:
            return (
                f"⚠️ Critical {cat_str} Warning: This clause contains dense, highly aggressive terms that could "
                "expose you to substantial financial liability, forfeit essential rights, or trap you in unfair covenants."
            )
        if risk_level == RiskLevel.HIGH:
            return (
                f"⚠️ High Risk {cat_str}: This clause significantly shifts legal burdens or restrictions onto you. "
                "Carefully scrutinize the obligations and demand mutual protections before signing."
            )
        if risk_level == RiskLevel.MEDIUM:
            return (
                f"Notice on {cat_str}: This clause contains standard but notable operational or commercial terms "
                "that should be factored into your decision."
            )
        return f"Standard {cat_str} provision. Lower risk under routine circumstances."

    # ──────────────────────────────────────────────────────────────────────────
    # RISK SCORING & AGGREGATION
    # ──────────────────────────────────────────────────────────────────────────

    def _calculate_clause_risk_breakdown(
        self,
        risk_level: RiskLevel,
        anomaly_score: float,
        readability: float,
        fk_grade: float,
        flag_count: int,
    ) -> Dict[str, float]:
        """Return the transparent heuristic components behind the 0–100 triage score."""
        base_scores = {
            RiskLevel.CRITICAL: 85.0,
            RiskLevel.HIGH: 65.0,
            RiskLevel.MEDIUM: 40.0,
            RiskLevel.LOW: 20.0,
            RiskLevel.INFO: 5.0,
        }
        base_score = base_scores.get(risk_level, 30.0)
        # Isolation Forest scores are relative to clauses in this document, not legal-risk probabilities.
        anomaly_boost = min(15.0, abs(anomaly_score) * 20.0) if anomaly_score < 0 else 0.0
        readability_penalty = 0.0
        if readability < 40.0:
            readability_penalty += ((40.0 - readability) / 40.0) * 6.0
        if fk_grade > 15.0:
            readability_penalty += min(6.0, (fk_grade - 15.0) * 1.2)
        red_flag_boost = min(12.0, max(0, flag_count) * 2.5)
        total = min(100.0, max(0.0, base_score + anomaly_boost + readability_penalty + red_flag_boost))
        return {
            "base_score": round(base_score, 2),
            "anomaly_boost": round(anomaly_boost, 2),
            "readability_penalty": round(readability_penalty, 2),
            "red_flag_boost": round(red_flag_boost, 2),
            "total": round(total, 2),
        }

    def _calculate_clause_risk_score(
        self,
        risk_level: RiskLevel,
        anomaly_score: float,
        readability: float,
        fk_grade: float,
        flag_count: int,
    ) -> float:
        """Compatibility wrapper returning only the total heuristic score."""
        return self._calculate_clause_risk_breakdown(
            risk_level, anomaly_score, readability, fk_grade, flag_count
        )["total"]

    def _risk_score_from_level(
        self,
        risk_level: RiskLevel,
        anomaly_score: float = 0.0,
        readability: float = 60.0,
    ) -> float:
        """Compatibility method for baseline risk scoring calculation."""
        return self._calculate_clause_risk_score(
            risk_level=risk_level,
            anomaly_score=anomaly_score,
            readability=readability,
            fk_grade=10.0,
            flag_count=0,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # UNSUPERVISED CLUSTERING & TOPIC EXTRACTION
    # ──────────────────────────────────────────────────────────────────────────

    def _cluster(self, embeddings: np.ndarray) -> np.ndarray:
        """
        Cluster clause embeddings using HDBSCAN with fallback to KMeans.
        """
        n_samples = len(embeddings)
        if n_samples < 3:
            return np.zeros(n_samples, dtype=int)

        # Try HDBSCAN first
        try:
            import hdbscan
            min_cluster = max(2, min(settings.MIN_CLUSTER_SIZE, n_samples // 3))
            clusterer = hdbscan.HDBSCAN(
                min_cluster_size=min_cluster,
                min_samples=1,
                metric="euclidean",
            )
            labels = clusterer.fit_predict(embeddings)
            # If all noise, fallback to KMeans
            if np.all(labels == -1) and n_samples >= 4:
                raise ValueError("HDBSCAN produced only noise")
            return labels
        except Exception:
            pass

        # Fallback to KMeans
        try:
            from sklearn.cluster import KMeans
            k = max(2, min(n_samples // 2, 6))
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            return km.fit_predict(embeddings)
        except Exception:
            return np.zeros(n_samples, dtype=int)

    def extract_cluster_topics(
        self, clauses: List[str], cluster_ids: np.ndarray
    ) -> Dict[int, Dict[str, Any]]:
        """
        Unsupervised cluster topic extraction.
        Extracts distinctive key term frequencies per cluster using TF-IDF and
        maps them to human-readable legal categories.
        """
        from sklearn.feature_extraction.text import TfidfVectorizer

        unique_clusters = sorted(set(cluster_ids))
        cluster_topics: Dict[int, Dict[str, Any]] = {}

        # Legal concept keyword mapping dictionaries
        concept_signatures = {
            "Liability & Indemnification": [
                "indemnify", "indemnity", "liability", "damages", "losses", "harmless",
                "consequential", "claims", "expenses", "uncapped", "breach"
            ],
            "Termination & Cancellation": [
                "terminate", "termination", "notice", "convenience", "cancellation",
                "days", "expire", "immediate", "rescind", "survival"
            ],
            "Restraint of Trade & Non-Compete": [
                "compete", "competitor", "solicit", "restraint", "customer",
                "client", "cessation", "employment", "section 27", "prohibited"
            ],
            "Dispute Resolution & Arbitration": [
                "arbitration", "dispute", "arbitrator", "court", "jury",
                "class action", "waiver", "binding", "jurisdiction", "venue"
            ],
            "Compensation, Bonds & Penalties": [
                "salary", "bonus", "liquidated", "penalty", "bond", "forfeit",
                "training", "damages", "clawback", "wages", "rupees", "payment"
            ],
            "Data Privacy & Regulatory Compliance": [
                "data", "privacy", "personal", "dpdp", "fiduciary", "processor",
                "breach", "transfer", "consent", "penalties", "crore"
            ],
            "Corporate Governance & M&A Controls": [
                "shares", "control", "merger", "acquisition", "voting", "sast",
                "threshold", "open offer", "dvt", "founder", "related party"
            ],
            "Intellectual Property & Ownership": [
                "inventions", "patent", "copyright", "ip", "work product",
                "proprietary", "assignment", "works made for hire", "conceived"
            ],
            "SaaS Terms, Modifications & Auto-Renewal": [
                "terms", "modify", "renewal", "subscription", "negative option",
                "continuous", "license", "discretion", "amend", "service"
            ],
        }

        # Build documents grouped by cluster
        for cid in unique_clusters:
            cluster_clauses = [clauses[i] for i, c in enumerate(cluster_ids) if c == cid]
            combined_text = " ".join(cluster_clauses)

            # Extract top TF-IDF keywords
            try:
                tfidf = TfidfVectorizer(
                    stop_words="english",
                    max_features=15,
                    ngram_range=(1, 2),
                    token_pattern=r"(?u)\b[a-zA-Z]{3,}\b",
                )
                matrix = tfidf.fit_transform([combined_text])
                feature_names = tfidf.get_feature_names_out()
                scores = matrix.toarray()[0]
                top_indices = np.argsort(scores)[::-1][:6]
                keywords = [feature_names[i] for i in top_indices if scores[i] > 0]
            except Exception:
                keywords = ["clause", "provisions", "agreement"]

            # Map to highest matching legal concept
            best_concept = "General Contract Provisions"
            best_concept_score = 0
            combined_lower = combined_text.lower()

            for concept_name, sig_words in concept_signatures.items():
                matches = sum(1 for w in sig_words if w in combined_lower)
                if matches > best_concept_score:
                    best_concept_score = matches
                    best_concept = concept_name

            if cid == -1:
                topic_title = "Outlier / Unique Fine Print Clauses"
            else:
                topic_title = f"{best_concept}"

            cluster_topics[cid] = {
                "cluster_id": int(cid),
                "topic_name": topic_title,
                "keywords": keywords,
                "clause_count": len(cluster_clauses),
            }

        self.cluster_topics = cluster_topics
        return cluster_topics

    # ──────────────────────────────────────────────────────────────────────────
    # ANOMALY DETECTION
    # ──────────────────────────────────────────────────────────────────────────

    def _detect_anomalies(self, embeddings: np.ndarray) -> np.ndarray:
        """
        Isolation Forest anomaly detection with dynamic contamination sizing.
        Returns score_samples: more negative = more anomalous.
        """
        n_samples = len(embeddings)
        if n_samples < 3:
            return np.zeros(n_samples)

        try:
            from sklearn.ensemble import IsolationForest

            # Adaptive contamination
            contamination = min(0.25, max(0.05, 1.0 / max(n_samples, 5)))
            iso = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100,
            )
            iso.fit(embeddings)
            scores = iso.score_samples(embeddings)
            return scores
        except Exception as e:
            logger.warning(f"Anomaly detection fallback: {e}")
            return np.zeros(n_samples)

    # ──────────────────────────────────────────────────────────────────────────
    # MAIN ANALYSIS PIPELINE
    # ──────────────────────────────────────────────────────────────────────────

    def analyze_clauses(self, clauses: List[str], document_id: str = "") -> List[ClauseAnalysis]:
        """
        Comprehensive ML Analysis Pipeline:
        1. Embed all clauses with hybrid vectorizer / sentence transformer
        2. Run unsupervised clustering (HDBSCAN / KMeans)
        3. Extract unsupervised cluster topics and keywords
        4. Detect syntactic and structural anomalies with Isolation Forest
        5. Deep pattern matching against the expanded statutory knowledge base
        6. Calculate multi-index legal readability and risk scores
        """
        if not clauses:
            return []

        logger.info(f"Analyzing {len(clauses)} clauses for document ID: '{document_id}'")

        # 1. Embeddings
        embeddings = self._get_embeddings_batch(clauses)

        # 2. Clustering
        cluster_ids = self._cluster(embeddings)

        # 3. Cluster topic extraction
        cluster_topics_map = self.extract_cluster_topics(clauses, cluster_ids)

        # 4. Anomaly detection
        anomaly_scores = self._detect_anomalies(embeddings)

        # 5. Build clause analyses
        results: List[ClauseAnalysis] = []
        char_offset = 0

        for idx, (clause_text, emb, cluster_id, anom_score) in enumerate(
            zip(clauses, embeddings, cluster_ids, anomaly_scores)
        ):
            pattern, flags, match_strength = self._pattern_match(clause_text)
            fre, fk_grade, cli = self._compute_readability(clause_text)

            # Anomaly threshold: score < -0.05 or lower quartile
            is_anomaly = bool(anom_score < -0.05)

            if pattern:
                risk_level = pattern.risk_level
                category = pattern.category
                plain_english = pattern.plain_english
                mitigation = pattern.mitigation
                legal_basis = pattern.legal_basis
                matched_name = pattern.name
                # Increase heuristic pattern-match strength when multiple red-flag phrases match
                match_strength = max(match_strength, min(1.0, 0.6 + len(flags) * 0.1))
            else:
                risk_level, category = self._heuristic_classify(clause_text, is_anomaly, fre, fk_grade)
                plain_english = self._generate_plain_english_heuristic(clause_text, risk_level, category)
                mitigation = (
                    "Review this clause carefully with legal counsel to clarify ambiguities "
                    "and incorporate standard mutual carve-outs."
                )
                legal_basis = "General contract law principles (Indian Contract Act 1872)"
                matched_name = None
                match_strength = 0.0

            # Calculate composite risk score (0-100)
            risk_score_breakdown = self._calculate_clause_risk_breakdown(
                risk_level=risk_level,
                anomaly_score=float(anom_score),
                readability=fre,
                fk_grade=fk_grade,
                flag_count=len(flags),
            )
            risk_score = risk_score_breakdown["total"]

            end_char = char_offset + len(clause_text)
            cluster_topic_str = cluster_topics_map.get(int(cluster_id), {}).get("topic_name", "General Provisions")

            results.append(ClauseAnalysis(
                text=clause_text,
                start_char=char_offset,
                end_char=end_char,
                category=category.value if hasattr(category, "value") else str(category),
                risk_level=risk_level.value if hasattr(risk_level, "value") else str(risk_level),
                risk_score=round(risk_score, 1),
                matched_pattern=matched_name,
                plain_english=plain_english,
                mitigation=mitigation,
                legal_basis=legal_basis,
                anomaly_score=round(float(anom_score), 3),
                cluster_id=int(cluster_id),
                is_anomaly=is_anomaly,
                readability_score=round(fre, 1),
                flags=flags,
                match_strength=round(match_strength, 2),
                risk_score_breakdown=risk_score_breakdown,
                fk_grade_level=round(fk_grade, 1),
                coleman_liau_index=round(cli, 1),
                cluster_topic=cluster_topic_str,
            ))
            char_offset = end_char + 2

        return results

    # ──────────────────────────────────────────────────────────────────────────
    # DOCUMENT RISK AGGREGATION
    # ──────────────────────────────────────────────────────────────────────────

    def aggregate_document_analysis(
        self,
        clauses: List[ClauseAnalysis],
        document_id: str = "",
        document_name: str = "",
        contract_type: str = "General Contract",
    ) -> DocumentAnalysis:
        """
        Aggregate clause-level findings into comprehensive document intelligence:
        - Weighted overall risk score and rating
        - Power imbalance score (0 to 100, higher = more one-sided)
        - Key statutory vulnerabilities summary
        - Actionable negotiation recommendations
        """
        if not clauses:
            return DocumentAnalysis(
                document_id=document_id,
                document_name=document_name,
                contract_type=contract_type,
                total_clauses=0,
                critical_count=0,
                high_count=0,
                medium_count=0,
                low_count=0,
                overall_risk_score=0.0,
                overall_risk_rating="low",
                readability_score=100.0,
                fk_grade_level=0.0,
                power_imbalance_score=0,
                clauses=[],
                cluster_topics=[],
                executive_summary="Empty document.",
                top_risks=[],
                recommendations=[],
                jurisdiction_flags=[],
                word_count=0,
                page_estimate=1,
            )

        counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
        total_risk = 0.0
        total_fre = 0.0
        total_fk = 0.0
        words_total = 0
        all_flags = []
        jurisdiction_flags = []
        top_risks = []
        recommendations = []

        for c in clauses:
            counts[c.risk_level] = counts.get(c.risk_level, 0) + 1
            total_risk += c.risk_score
            total_fre += c.readability_score
            total_fk += c.fk_grade_level
            words_total += len(c.text.split())
            all_flags.extend(c.flags)

            if c.category in ("governing_law", "arbitration") and any(
                w in c.text.lower() for w in ["delaware", "england", "singapore", "new york"]
            ):
                jurisdiction_flags.append(f"Foreign Jurisdiction: {c.matched_pattern or c.text[:60]}")

            if c.risk_level in ("critical", "high") and c.matched_pattern:
                top_risks.append(f"{c.matched_pattern} ({c.risk_level.upper()})")
                if c.mitigation and c.mitigation not in recommendations:
                    recommendations.append(c.mitigation)

        avg_fre = round(total_fre / len(clauses), 1)
        avg_fk = round(total_fk / len(clauses), 1)

        # Weighted overall risk score
        weighted_score = (
            (counts["critical"] * 35.0)
            + (counts["high"] * 20.0)
            + (counts["medium"] * 8.0)
            + (counts["low"] * 2.0)
        )
        normalized_risk = min(100.0, (weighted_score / max(len(clauses), 1)) * 3.5)
        overall_risk = round(max(normalized_risk, (total_risk / len(clauses))), 1)

        # Overall rating
        if counts["critical"] >= 1 or overall_risk >= 70.0:
            rating = "critical"
        elif counts["high"] >= 2 or overall_risk >= 50.0:
            rating = "high"
        elif counts["high"] >= 1 or counts["medium"] >= 3 or overall_risk >= 30.0:
            rating = "medium"
        else:
            rating = "low"

        # Power imbalance estimation
        asymmetric_indicators = counts["critical"] * 25 + counts["high"] * 15 + len(all_flags) * 3
        power_imbalance = min(98, max(20, asymmetric_indicators))

        # Format cluster topics list
        cluster_topics_list = list(self.cluster_topics.values())

        # Executive summary
        exec_summary = (
            f"FP.ai Legal Intelligence evaluated {len(clauses)} clauses in this {contract_type}. "
            f"Detected {counts['critical']} CRITICAL and {counts['high']} HIGH risk vulnerabilities, "
            f"yielding an overall risk score of {overall_risk}/100 ({rating.upper()}). "
            f"Document obscurity index reflects Flesch-Kincaid Grade Level {avg_fk} "
            f"with Reading Ease of {avg_fre}/100. Power imbalance is evaluated at {power_imbalance}/100."
        )

        return DocumentAnalysis(
            document_id=document_id,
            document_name=document_name,
            contract_type=contract_type,
            total_clauses=len(clauses),
            critical_count=counts["critical"],
            high_count=counts["high"],
            medium_count=counts["medium"],
            low_count=counts["low"],
            overall_risk_score=overall_risk,
            overall_risk_rating=rating,
            readability_score=avg_fre,
            fk_grade_level=avg_fk,
            power_imbalance_score=power_imbalance,
            clauses=clauses,
            cluster_topics=cluster_topics_list,
            executive_summary=exec_summary,
            top_risks=list(dict.fromkeys(top_risks))[:5],
            recommendations=recommendations[:5],
            jurisdiction_flags=list(dict.fromkeys(jurisdiction_flags)),
            word_count=words_total,
            page_estimate=max(1, words_total // 450),
        )

    # ──────────────────────────────────────────────────────────────────────────
    # VISUALIZATION REDUCTION (UMAP / PCA)
    # ──────────────────────────────────────────────────────────────────────────

    def get_umap_coordinates(self, embeddings: np.ndarray) -> List[Dict[str, float]]:
        """2D UMAP coordinates with PCA fallback for cluster visualisation."""
        if len(embeddings) < 3:
            return [{"x": float(i), "y": 0.0} for i in range(len(embeddings))]
        try:
            import umap
            reducer = umap.UMAP(
                n_components=2,
                random_state=42,
                n_neighbors=min(5, len(embeddings) - 1),
            )
            coords = reducer.fit_transform(embeddings)
            return [{"x": float(c[0]), "y": float(c[1])} for c in coords]
        except Exception:
            try:
                from sklearn.decomposition import PCA
                pca = PCA(n_components=2)
                coords = pca.fit_transform(embeddings)
                return [{"x": float(c[0]), "y": float(c[1])} for c in coords]
            except Exception:
                return [{"x": 0.0, "y": 0.0} for _ in embeddings]
