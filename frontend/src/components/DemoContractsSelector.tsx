import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, FileText, ChevronRight, Eye, AlertOctagon, Check } from 'lucide-react'
import { DEMO_CONTRACTS, DemoContract } from '@/data/demoContracts'
import { saveAnalysisResult } from '@/utils/analysisStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Props {
  onSelectForUpload?: (file: File) => void
  showTitle?: boolean
  compact?: boolean
}

export default function DemoContractsSelector({ onSelectForUpload, showTitle = true, compact = false }: Props) {
  const navigate = useNavigate()
  const [inspectingId, setInspectingId] = useState<string | null>(null)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

  const handleInstantAnalysis = (contract: DemoContract) => {
    setAnalyzingId(contract.id)
    saveAnalysisResult(contract.analysisResult)
    toast.success(`Loading instant analysis for ${contract.title}…`, {
      icon: '⚡',
      duration: 2500,
    })

    setTimeout(() => {
      navigate(`/results/${contract.analysisResult.analysis_id}`)
    }, 400)
  }

  const handleLoadIntoUpload = (contract: DemoContract, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelectForUpload) {
      const blob = new Blob([contract.documentText], { type: 'text/plain' })
      const file = new File([blob], contract.filename, { type: 'text/plain' })
      onSelectForUpload(file)
      toast.success(`Loaded "${contract.filename}" into uploader!`)
    } else {
      handleInstantAnalysis(contract)
    }
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fp-accent animate-ping" />
              <h2 className="text-lg font-bold text-fp-text tracking-tight flex items-center gap-2">
                Pre-Loaded Demo Contracts
              </h2>
            </div>
            <p className="text-xs text-fp-muted mt-0.5">
              Experience FP.ai in 1 click without finding or uploading your own legal files.
            </p>
          </div>
          <span className="text-xs font-mono text-fp-accent bg-fp-accent/10 border border-fp-accent/30 rounded-full px-2.5 py-1">
            3 Real-World Contracts
          </span>
        </div>
      )}

      <div className={clsx('grid gap-4', compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3')}>
        {DEMO_CONTRACTS.map((contract) => {
          const isCritical = contract.riskLevel === 'critical'
          const badgeClass = isCritical
            ? 'bg-red-950/60 text-red-400 border-red-800/60'
            : 'bg-orange-950/60 text-orange-400 border-orange-800/60'

          return (
            <motion.div
              key={contract.id}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={clsx(
                'card relative flex flex-col justify-between transition-all duration-200 border-fp-border/70 hover:border-fp-accent/60',
                analyzingId === contract.id && 'ring-2 ring-fp-accent shadow-[0_0_25px_rgba(37,99,235,0.4)]'
              )}
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-fp-muted bg-fp-surface px-2 py-0.5 rounded border border-fp-border/40">
                    {contract.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('text-[11px] font-bold px-2 py-0.5 rounded-full border', badgeClass)}>
                      {contract.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-fp-surface border border-fp-border text-fp-text">
                      {contract.riskScore}/100
                    </span>
                  </div>
                </div>

                {/* Title & subtitle */}
                <div>
                  <h3 className="font-bold text-sm text-fp-text group-hover:text-fp-accent transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-fp-accent shrink-0" />
                    <span>{contract.title}</span>
                  </h3>
                  <p className="text-xs text-fp-accent/80 font-medium mt-0.5">{contract.subtitle}</p>
                </div>

                <p className="text-xs text-fp-muted leading-relaxed line-clamp-3">
                  {contract.summary}
                </p>

                {/* Traps list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-fp-muted">Flagged Fine Print Traps</span>
                  <div className="space-y-1">
                    {contract.keyTraps.slice(0, 3).map((trap, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-fp-text/90">
                        <AlertOctagon className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{trap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 mt-4 border-t border-fp-border/50 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleInstantAnalysis(contract)}
                  disabled={analyzingId === contract.id}
                  className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span>Run 1-Click Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectingId(inspectingId === contract.id ? null : contract.id)}
                    className="text-[11px] text-fp-muted hover:text-fp-text flex items-center gap-1 py-1 px-1.5 rounded transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{inspectingId === contract.id ? 'Close Preview' : 'Inspect Text'}</span>
                  </button>

                  {onSelectForUpload && (
                    <button
                      type="button"
                      onClick={(e) => handleLoadIntoUpload(contract, e)}
                      className="text-[11px] text-fp-accent hover:text-fp-accent-glow font-medium flex items-center gap-1 py-1 px-1.5 rounded transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>Load into Uploader</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Document Text Inspector Drawer */}
              <AnimatePresence>
                {inspectingId === contract.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-fp-border/60"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-fp-muted uppercase tracking-wider">Raw Contract Snippet</span>
                      <span className="text-[10px] text-fp-muted font-mono">{contract.filename}</span>
                    </div>
                    <pre className="text-[10px] bg-fp-bg/90 border border-fp-border/50 text-fp-muted rounded-lg p-2.5 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed select-all">
                      {contract.documentText}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
