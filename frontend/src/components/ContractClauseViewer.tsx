import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Shield, AlertTriangle, Scale, CheckCircle2,
  ChevronLeft, ChevronRight, Zap, Copy, Search, ExternalLink
} from 'lucide-react'
import { Clause } from '@/types/analysis'
import clsx from 'clsx'
import toast from 'react-hot-toast'

interface Props {
  clauses: Clause[]
  documentText?: string
  contractType: string
  selectedClauseIndex: number
  onSelectClause: (index: number) => void
}

const riskBorderColors: Record<string, string> = {
  critical: 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
  high: 'border-orange-500 bg-orange-950/20 shadow-[0_0_15px_rgba(234,88,12,0.3)]',
  medium: 'border-yellow-500 bg-yellow-950/15 shadow-[0_0_15px_rgba(202,138,4,0.3)]',
  low: 'border-green-500 bg-green-950/10',
}

export default function ContractClauseViewer({
  clauses,
  documentText,
  contractType,
  selectedClauseIndex,
  onSelectClause,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const docContainerRef = useRef<HTMLDivElement>(null)
  const activeClauseRef = useRef<HTMLDivElement>(null)

  const activeClause = clauses[selectedClauseIndex] || clauses[0]

  // Smoothly scroll the highlighted clause into view inside the document pane
  useEffect(() => {
    if (activeClauseRef.current && docContainerRef.current) {
      activeClauseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [selectedClauseIndex])

  const copyClauseText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Clause copied to clipboard!')
  }

  // Construct text paragraphs
  const displayParagraphs = documentText
    ? documentText.split('\n\n').filter((p) => p.trim().length > 0)
    : clauses.map((c) => c.text)

  return (
    <div className="card p-0 overflow-hidden border-fp-border/80 flex flex-col h-[700px]">
      {/* Top toolbar */}
      <div className="px-5 py-3 border-b border-fp-border bg-fp-surface/80 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-fp-accent" />
          <span className="font-bold text-xs uppercase tracking-wider text-fp-text">
            Contract Document & Clause Context Inspector
          </span>
          <span className="text-[10px] font-mono bg-fp-card px-2 py-0.5 rounded border border-fp-border text-fp-muted">
            Clause {selectedClauseIndex + 1} of {clauses.length}
          </span>
        </div>

        {/* Next / Prev buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectClause(Math.max(0, selectedClauseIndex - 1))}
            disabled={selectedClauseIndex === 0}
            className="btn-ghost p-1.5 text-xs flex items-center gap-1 disabled:opacity-30 cursor-pointer"
            title="Previous Flagged Clause"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] hidden sm:inline">Prev</span>
          </button>
          <button
            onClick={() => onSelectClause(Math.min(clauses.length - 1, selectedClauseIndex + 1))}
            disabled={selectedClauseIndex === clauses.length - 1}
            className="btn-ghost p-1.5 text-xs flex items-center gap-1 disabled:opacity-30 cursor-pointer"
            title="Next Flagged Clause"
          >
            <span className="text-[11px] hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Viewer: Left Document Pane + Right Inspector Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-fp-border">
        {/* Left Pane: Full Document Reader */}
        <div
          ref={docContainerRef}
          className="lg:col-span-7 p-6 overflow-y-auto space-y-4 bg-fp-bg/40 font-mono text-xs leading-relaxed"
        >
          <div className="text-[11px] text-fp-muted font-sans border-b border-fp-border/50 pb-2 mb-4 flex items-center justify-between">
            <span>Click any highlighted section to inspect its fine-print risk analysis</span>
            <span className="text-fp-accent font-semibold">{contractType}</span>
          </div>

          {displayParagraphs.map((para, idx) => {
            // Check if this paragraph matches any clause
            const matchedClauseIdx = clauses.findIndex(
              (c) => para.includes(c.text.slice(0, 40)) || c.text.includes(para.slice(0, 40))
            )

            const isMatched = matchedClauseIdx !== -1
            const isCurrentlySelected = matchedClauseIdx === selectedClauseIndex
            const clauseData = isMatched ? clauses[matchedClauseIdx] : null

            return (
              <div
                key={idx}
                ref={isCurrentlySelected ? activeClauseRef : null}
                onClick={() => {
                  if (isMatched) onSelectClause(matchedClauseIdx)
                }}
                className={clsx(
                  'p-3.5 rounded-xl transition-all duration-200 cursor-pointer relative',
                  isMatched
                    ? 'border-l-4'
                    : 'text-fp-muted/80 hover:text-fp-text hover:bg-fp-surface/30',
                  clauseData && riskBorderColors[clauseData.risk_level],
                  isCurrentlySelected &&
                    'ring-2 ring-fp-accent bg-fp-accent/15 scale-[1.01] shadow-[0_0_25px_rgba(37,99,235,0.25)]'
                )}
              >
                {clauseData && (
                  <div className="flex items-center justify-between mb-1 text-[10px] font-sans">
                    <span className="font-bold uppercase tracking-wider text-fp-accent">
                      {clauseData.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={clsx(
                        'px-1.5 py-0.2 rounded font-bold uppercase',
                        clauseData.risk_level === 'critical'
                          ? 'text-red-400 bg-red-950/60'
                          : clauseData.risk_level === 'high'
                          ? 'text-orange-400 bg-orange-950/60'
                          : 'text-yellow-400 bg-yellow-950/60'
                      )}
                    >
                      {clauseData.risk_level} · {clauseData.risk_score} pts
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{para}</p>
              </div>
            )
          })}
        </div>

        {/* Right Pane: Active Selected Clause Inspector */}
        <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-fp-card/90 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Clause Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border',
                    activeClause.risk_level === 'critical'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : activeClause.risk_level === 'high'
                      ? 'bg-orange-950 text-orange-400 border-orange-800'
                      : 'bg-yellow-950 text-yellow-400 border-yellow-800'
                  )}
                >
                  {activeClause.risk_level} Risk
                </span>
                <span className="text-xs font-mono text-fp-muted bg-fp-surface px-2 py-0.5 rounded border border-fp-border">
                  {activeClause.category}
                </span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-fp-text font-mono">
                  {activeClause.risk_score.toFixed(0)}
                </span>
                <span className="text-[10px] text-fp-muted block font-mono">/100 risk</span>
              </div>
            </div>

            {/* Matched Pattern */}
            {activeClause.matched_pattern && (
              <div className="bg-fp-surface/80 border border-fp-border/70 rounded-xl p-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-fp-accent block mb-1">
                  Matched Fine Print Pattern
                </span>
                <p className="text-xs font-semibold text-fp-text">{activeClause.matched_pattern}</p>
              </div>
            )}

            {/* Plain English Translation */}
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-blue-300 font-bold block flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-300" /> What It Actually Means For You
              </span>
              <p className="text-xs text-fp-text leading-relaxed font-sans">{activeClause.plain_english}</p>
            </div>

            {/* Recommended Action / Mitigation */}
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-green-400 font-bold block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Recommended Redline / Action
              </span>
              <p className="text-xs text-fp-muted leading-relaxed font-sans">{activeClause.mitigation}</p>
            </div>

            {/* Legal Basis */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-fp-surface/60 border border-fp-border/60">
              <Scale className="w-4 h-4 text-fp-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-fp-muted block mb-0.5">
                  Statutory Reference & Case Law
                </span>
                <p className="text-xs text-fp-muted leading-relaxed">{activeClause.legal_basis}</p>
              </div>
            </div>

            {/* Red Flag Phrases */}
            {activeClause.flags && activeClause.flags.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-fp-muted block mb-1.5">
                  Extracted Red-Flag Phrases
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeClause.flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-red-950/40 border border-red-800/40 text-red-300 rounded px-2 py-0.5 font-mono"
                    >
                      "{flag}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Copy Action */}
          <div className="pt-3 border-t border-fp-border/50 flex items-center justify-between">
            <span className="text-[10px] text-fp-muted font-mono">
              Anomaly Score: <strong>{activeClause.anomaly_score?.toFixed(2) || '0.75'}</strong>
            </span>
            <button
              onClick={() => copyClauseText(activeClause.text)}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Clause</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
