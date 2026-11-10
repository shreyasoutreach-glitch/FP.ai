import {
  AlertCircle, AlertTriangle, CheckCircle2, ExternalLink, FileSearch, Info
} from 'lucide-react'

type Finding = {
  id: string
  kind: string
  severity: 'review' | 'info' | string
  title: string
  explanation: string
  next_step: string
  excerpt: string
  start_char: number
  end_char: number
}

type IntegrityAudit = {
  version?: string
  status?: 'attention' | 'context_needed' | 'no_flags_found' | string
  summary?: {
    findings_total?: number
    review_items?: number
    context_items?: number
  }
  findings?: Finding[]
  coverage_note?: string
}

const kindLabels: Record<string, string> = {
  unfilled_placeholder: 'Template placeholder',
  unresolved_internal_reference: 'Unresolved cross-reference',
  unverified_schedule: 'Schedule / exhibit not in upload',
  number_word_mismatch: 'Number mismatch',
  external_document_dependency: 'External terms dependency',
}

function severityMeta(severity: string) {
  return severity === 'review'
    ? { label: 'Review this', Icon: AlertTriangle, style: 'text-amber-300 bg-amber-950/40 border-amber-800/50' }
    : { label: 'Context needed', Icon: Info, style: 'text-sky-300 bg-sky-950/40 border-sky-800/50' }
}

export default function IntegrityAuditPanel({ audit }: { audit?: IntegrityAudit }) {
  if (!audit || !audit.summary || !Array.isArray(audit.findings)) {
    return (
      <section className="card space-y-2">
        <h2 className="text-lg font-bold text-fp-text">Contract Integrity Scan</h2>
        <p className="text-sm text-fp-muted">
          This saved analysis predates the structural integrity scan. Re-run analysis on the document to check for placeholders, cross-reference gaps, number mismatches and external dependencies.
        </p>
      </section>
    )
  }

  const findings = audit.findings
  const reviewCount = audit.summary.review_items || 0
  const contextCount = audit.summary.context_items || 0

  return (
    <div className="space-y-5">
      <section className="card border border-fp-accent/30 bg-gradient-to-br from-fp-card via-fp-surface/80 to-fp-card space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-fp-accent/10 border border-fp-accent/30 p-3 text-fp-accent">
            <FileSearch className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-fp-accent">
              Deterministic document checks
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-fp-text mt-1">Contract Integrity Scan</h2>
            <p className="text-sm text-fp-muted mt-1 leading-relaxed">
              Before debating whether a clause is fair, check whether the uploaded agreement is structurally complete and internally consistent.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-fp-border bg-fp-bg/60 p-3">
            <div className="text-2xl font-black text-fp-text">{audit.summary.findings_total || 0}</div>
            <div className="text-[10px] uppercase tracking-wider text-fp-muted">Signals found</div>
          </div>
          <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3">
            <div className="text-2xl font-black text-amber-300">{reviewCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-fp-muted">Needs review</div>
          </div>
          <div className="rounded-xl border border-sky-900/50 bg-sky-950/20 p-3">
            <div className="text-2xl font-black text-sky-300">{contextCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-fp-muted">Context needed</div>
          </div>
        </div>

        {audit.status === 'no_flags_found' ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-emerald-200">No structural flags surfaced in the extracted text</div>
              <p className="text-xs text-fp-muted mt-1">This is not a legal clearance or proof that the uploaded packet is complete.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3">
            <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-200">
                {reviewCount > 0 ? 'Resolve or verify the structural flags before relying on this copy' : 'Check the external material referenced by this agreement'}
              </div>
              <p className="text-xs text-fp-muted mt-1">These are document-quality signals, not legal conclusions.</p>
            </div>
          </div>
        )}
      </section>

      {findings.length > 0 ? (
        <div className="space-y-3">
          {findings.map((finding) => {
            const meta = severityMeta(finding.severity)
            const Icon = meta.Icon
            return (
              <article key={finding.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-mono text-fp-accent mb-1">
                      {kindLabels[finding.kind] || finding.kind.replace(/_/g, ' ')}
                    </div>
                    <h3 className="font-bold text-sm text-fp-text">{finding.title}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${meta.style}`}>
                    <Icon className="w-3.5 h-3.5" /> {meta.label}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-fp-text/90">{finding.explanation}</p>
                <blockquote className="border-l-2 border-fp-accent/70 bg-fp-bg/70 rounded-r-lg p-3">
                  <div className="text-[10px] uppercase tracking-wider text-fp-muted font-bold mb-1">Exact extracted wording</div>
                  <p className="text-xs text-fp-text/90 leading-relaxed font-mono">{finding.excerpt}</p>
                  <div className="text-[10px] text-fp-muted mt-2 font-mono">
                    Extracted text position: {finding.start_char}–{finding.end_char}
                  </div>
                </blockquote>
                <div className="rounded-lg border border-fp-accent/20 bg-fp-accent/5 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-fp-accent font-bold mb-1">Next verification step</div>
                  <p className="text-xs text-fp-text leading-relaxed">{finding.next_step}</p>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-fp-muted">No detectable structural issues were found by the current checks.</p>
        </div>
      )}

      <div className="card border border-fp-border/70">
        <h3 className="text-xs uppercase tracking-wider text-fp-muted font-bold mb-2">What this scan can and cannot establish</h3>
        <p className="text-xs leading-relaxed text-fp-muted">{audit.coverage_note}</p>
      </div>
    </div>
  )
}
