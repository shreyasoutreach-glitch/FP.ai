# FP.ai — Fine Print Engine

> **AI-powered contract vulnerability analysis.** Detects hidden risks, exploitative clauses, and legal traps across employment contracts, M&A agreements, NDAs, consumer terms, and more.

---

## What It Does

FP.ai reads contracts the way a corporate lawyer does — looking for the clauses designed to be overlooked:

| Risk Type | Examples |
|---|---|
| 🔴 **Critical** | Uncapped liability, non-compete traps, change-of-control triggers |
| 🟠 **High** | Mandatory arbitration, IP grabs, training bonds, broad indemnity |
| 🟡 **Medium** | Auto-renewal, discretionary bonuses, unilateral modification |
| 🟢 **Low** | Standard clauses worth reading |

**Legal Coverage:** Indian Contract Act 1872, SEBI (SAST/LODR/PIT), Companies Act 2013, DPDP Act 2023, GDPR, US FTC, UK UCTA 1977, Arbitration & Conciliation Act 1996, Consumer Protection Act 2019, POSH Act 2013.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy (async), SQLite |
| **ML Engine** | sentence-transformers, HDBSCAN, Isolation Forest, UMAP |
| **AI Analysis** | Google Gemini API (`gemini-3.8-flash`) via `google-genai` |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Document Parsing** | pdfminer.six, PyPDF2, python-docx |

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Download spaCy model (optional, for enhanced NLP)
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY (get one free at https://aistudio.google.com)

# Start server
python main.py
```

Backend runs at: `http://localhost:8000`  
API docs: `http://localhost:8000/api/docs`

### 2. Frontend

```bash
cd frontend
npm install        # or: pnpm install

npm run dev        # or: pnpm dev
```

Frontend runs at: `http://localhost:5173`

---

## Project Structure

```
fp.ai/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── api/routes/
│       │   ├── analysis.py          # Core analysis endpoints
│       │   ├── documents.py         # File upload/management
│       │   ├── reports.py           # PDF + JSON export
│       │   ├── training.py          # ML training data
│       │   └── health.py
│       ├── core/
│       │   ├── config.py            # Settings
│       │   ├── database.py          # Async SQLAlchemy
│       │   └── knowledge_base.py    # 20+ clause patterns with legal basis
│       ├── ml/
│       │   └── engine.py            # HDBSCAN + Isolation Forest + embeddings
│       ├── models/
│       │   ├── document.py          # Document ORM model
│       │   └── analysis.py          # Analysis ORM model
│       └── services/
│           ├── extractor.py         # PDF/DOCX text extraction + clause segmentation
│           └── gemini_service.py    # Gemini AI deep analysis
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Landing page
│   │   │   ├── AnalysisPage.tsx     # Upload + analyse
│   │   │   ├── ResultsPage.tsx      # Full results dashboard
│   │   │   └── KnowledgePage.tsx    # Clause knowledge base
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   └── utils/api.ts
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/training/                   # Training corpus (JSONL)
└── docs/
```

---

## ML Architecture

```
Contract Text
    │
    ▼
Clause Segmentation (regex + paragraph detection)
    │
    ├─► sentence-transformers/all-MiniLM-L6-v2  → Embeddings
    │       │
    │       ├─► HDBSCAN Clustering    → Cluster ID per clause
    │       └─► Isolation Forest      → Anomaly Score
    │
    ├─► Knowledge Base Pattern Match  → Category, Risk Level, Flags
    │
    ├─► Readability Analysis          → Flesch Reading Ease
    │
    └─► Gemini gemini-3.8-flash      → Executive Summary, Hidden Dangers
            │                            Jurisdiction Analysis, Recommendations
            ▼
        Risk Score (0–100) per clause
        Overall Risk Rating (critical/high/medium/low)
```

The unsupervised ML loop **learns from every contract it analyses** — the Isolation Forest is retrained on new embeddings after each document, improving anomaly detection over time without any labelled data.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload contract (PDF/DOCX/TXT) |
| `GET` | `/api/documents/` | List all documents |
| `POST` | `/api/analysis/run` | Run full analysis |
| `GET` | `/api/analysis/{id}` | Get analysis results |
| `POST` | `/api/analysis/explain-clause` | AI explanation for any clause |
| `GET` | `/api/reports/{id}/pdf` | Export PDF report |
| `GET` | `/api/reports/{id}/json` | Export JSON report |
| `GET` | `/api/training/knowledge-base` | Full knowledge base |
| `POST` | `/api/training/examples` | Add training example |
| `GET` | `/api/health` | Health check |

---

## Configuration

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key | *(required for AI analysis)* |
| `DATABASE_URL` | SQLAlchemy database URL | `sqlite+aiosqlite:///./fpai.db` |
| `MAX_FILE_SIZE_MB` | Maximum upload size | `50` |
| `EMBEDDING_MODEL` | Sentence transformer model | `sentence-transformers/all-MiniLM-L6-v2` |
| `ANOMALY_CONTAMINATION` | Expected anomaly fraction | `0.1` |
| `MIN_CLUSTER_SIZE` | HDBSCAN minimum cluster size | `3` |

---

## Supported Contract Types

- Employment Agreements & Offer Letters
- M&A / Share Purchase / Asset Purchase Agreements
- Non-Disclosure Agreements (NDAs)
- Master Service Agreements (MSAs)
- Consumer Terms of Service
- Lease/Tenancy Agreements
- Loan & Credit Agreements
- Shareholder / JV Agreements
- Consulting & Freelance Agreements
- Software License / SaaS Agreements

---

## Legal Disclaimer

> FP.ai is an AI-powered informational tool and **does not constitute legal advice**. Always consult a qualified legal professional before signing any contract. The analysis is intended to help you ask better questions, not replace a lawyer.

---

## License

MIT License — Free to use, modify, and deploy.

---

*Built with ♦ for everyone who ever signed something they didn't fully understand.*
