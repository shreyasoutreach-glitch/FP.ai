import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeftRight, CheckCircle2, FileSearch, GitCompareArrows, Loader2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/utils/api'

type DocumentItem = {
  id: string
  original_name: string
  file_size: number
  file_type: string
  contract_type: string
  status: string
  created_at: string
}

type Evidence = {
  document_id: string
  document_name: string
  value: string
  normalized_value: string
  excerpt: string
  start_char: number
  end_char: number
}

type Variation = {
  id: string
  fact_type: string
  label: string
  status: string
  explanation: string
  documents: Evidence[]
  next_step: string
}

type PacketResult = {
  documents_compared: Array<{ id: string; name: string; contract_type: string }>
  summary: {
    documents: number
    explicit_terms_found: number
    term_variations: number
    hierarchy_clauses_found: number
  }
  variations: Variation[]
  hierarchy_evidence: Array<{
    document_id: string
    document_name: string
    excerpt: string
    start_char: number
    end_char: number
    matched_language: string
  }>
  coverage: {
    method: string
    not_checked: string[]
    warning: string
  }
}

export default function PacketReviewPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<PacketResult | null>(null)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    api.get('/api/documents/').then((response) => {
      const items = (response.data || []) as DocumentItem[]
      setDocuments(items)
    }).catch((error) => {
      toast.error(error.response?.data?.detail || 'Could not load your document library.')
    }).finally(() => setLoadingDocs(false))
  }, [])

  const analysed = useMemo(() => documents.filter((doc) => doc.status === 'analyzed'), [documents])

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      setResult(null)
      return next
    })
  }

  const run = async () => {
    if (selected.length < 2 || selected.length > 8) {
      toast.error('Select between two and eight analysed documents.')
      return
    }
    setRunning(true)
    setResult(null)
    try {
      const response = await api.post('/api/packet-review/compare', { document_ids: selected })
      setResult(response.data as PacketResult)
    } catch (error: any) {
      const detail = error.response?.data?.detail
      const message = typeof detail === 'string' ? detail : detail?.message || error.message || 'Packet comparison failed.'
      toast.error(message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-fp-accent font-bold">
          <GitCompareArrows className="w-4 h-4" /> Multi-document evidence review
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-fp-text tracking-tight">Contract Packet Review</h1>
        <p className="max-w-3xl text-sm sm:text-base text-fp-muted leading-relaxed">
          Compare related agreements, schedules and side letters. FP.ai extracts a small set of explicit terms from each document and shows where their stated values differ, with the source wording beside each one.
        </p>
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-100/80">
          This is a comparison aid, not an automatic contradiction verdict. Different documents may intentionally cover different parties, periods or scopes. FP.ai will not guess which document overrides another.
        </div>
      </header>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-bold text-fp-text">Choose the related documents</h2>
            <p className="text-xs text-fp-muted mt-1">Select 2 to 8 documents that belong to the same deal or relationship.</p>
          </div>
          <span className="text-xs font-mono text-fp-muted">{selected.length}/8 selected</span>
        </div>

        {loadingDocs ? (
          <div className="flex items-center gap-2 text-sm text-fp-muted py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading document library…</div>
        ) : analysed.length === 0 ? (
          <div className="rounded-xl border border-fp-border bg-fp-bg/50 p-5 text-sm text-fp-muted">
            No analysed uploads yet. Analyse each agreement first, then return here to compare the packet.
          </div>
        ) : (
          <div className="space-y-2">
            {analysed.map((doc) => (
              <label key={doc.id} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${selected.includes(doc.id) ? 'border-fp-accent/60 bg-fp-accent/10' : 'border-fp-border bg-fp-bg/40 hover:border-fp-accent/30'}`}>
                <input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggle(doc.id)} disabled={!selected.includes(doc.id) && selected.length >= 8} className="mt-1 accent-cyan-400" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-fp-text break-words">{doc.original_name}</span>
                  <span className="block text-xs text-fp-muted mt-1">{doc.contract_type || 'Unknown type'} · {doc.file_type.toUpperCase()} · {Math.max(1, Math.round(doc.file_size / 1024))} KB</span>
                </span>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Analysed</span>
              </label>
            ))}
          </div>
        )}

        <button type="button" onClick={run} disabled={running || selected.length < 2 || selected.length > 8} className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-40">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
          {running ? 'Comparing source documents…' : 'Compare selected documents'}
        </button>
      </section>

      {result && (
        <section className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="card p-3"><div className="text-2xl font-black text-fp-text">{result.summary.documents}</div><div className="text-[10px] uppercase tracking-wider text-fp-muted">Documents</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-fp-text">{result.summary.explicit_terms_found}</div><div className="text-[10px] uppercase tracking-wider text-fp-muted">Terms extracted</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-amber-300">{result.summary.term_variations}</div><div className="text-[10px] uppercase tracking-wider text-fp-muted">Term variations</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-fp-text">{result.summary.hierarchy_clauses_found}</div><div className="text-[10px] uppercase tracking-wider text-fp-muted">Precedence references</div></div>
          </div>

          <div className="card space-y-3">
            <h2 className="font-bold text-fp-text">Documents in this packet</h2>
            <div className="flex flex-wrap gap-2">
              {result.documents_compared.map((doc) => <span key={doc.id} className="rounded-full border border-fp-border bg-fp-bg/60 px-3 py-1.5 text-xs text-fp-text">{doc.name}</span>)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-fp-text">Different terms found</h2>
              <p className="text-xs text-fp-muted mt-1">Each variation is supported by source text from at least two documents.</p>
            </div>
            {result.variations.length === 0 ? (
              <div className="card flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <div><p className="text-sm font-semibold text-fp-text">No differences detected in the terms this scan knows how to extract.</p><p className="text-xs text-fp-muted mt-1">This is not proof that the packet is consistent. The coverage limits below still apply.</p></div>
              </div>
            ) : result.variations.map((variation) => (
              <article key={variation.id} className="card space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-bold text-fp-text">{variation.label}</h3><p className="text-xs text-fp-muted mt-1">{variation.explanation}</p></div>
                  <span className="shrink-0 rounded-full border border-amber-800/50 bg-amber-950/30 px-2.5 py-1 text-[10px] font-bold text-amber-200">Variation</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {variation.documents.map((evidence) => (
                    <div key={evidence.document_id} className="rounded-xl border border-fp-border bg-fp-bg/60 p-3 space-y-2">
                      <div className="text-xs font-bold text-fp-accent break-words">{evidence.document_name}</div>
                      <div className="text-lg font-black text-fp-text">{evidence.value}</div>
                      <blockquote className="border-l-2 border-fp-accent/60 pl-3 text-xs leading-relaxed text-fp-muted">{evidence.excerpt}</blockquote>
                      <div className="text-[10px] text-fp-muted font-mono">Extracted text: {evidence.start_char}–{evidence.end_char}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-fp-accent/20 bg-fp-accent/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-fp-accent font-bold mb-1">What to verify</div>
                  <p className="text-xs leading-relaxed text-fp-text">{variation.next_step}</p>
                </div>
              </article>
            ))}
          </div>

          {result.hierarchy_evidence.length > 0 && (
            <div className="card space-y-3">
              <h2 className="font-bold text-fp-text">Precedence and amendment language</h2>
              <p className="text-xs text-fp-muted">These provisions may determine which document controls, but FP.ai does not automatically interpret their legal effect.</p>
              {result.hierarchy_evidence.map((item, index) => (
                <blockquote key={index} className="border-l-2 border-fp-accent/60 pl-3 space-y-1">
                  <div className="text-xs font-bold text-fp-accent">{item.document_name} · {item.matched_language}</div>
                  <p className="text-xs text-fp-muted leading-relaxed">{item.excerpt}</p>
                </blockquote>
              ))}
            </div>
          )}

          <div className="card space-y-2">
            <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-300" /><h2 className="text-sm font-bold text-fp-text">Coverage and limitations</h2></div>
            <p className="text-xs text-fp-muted">{result.coverage.warning}</p>
            <p className="text-[11px] text-fp-muted">Method: {result.coverage.method}.</p>
            <ul className="list-disc pl-5 text-xs text-fp-muted space-y-1">{result.coverage.not_checked.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>
      )}
    </div>
  )
}
