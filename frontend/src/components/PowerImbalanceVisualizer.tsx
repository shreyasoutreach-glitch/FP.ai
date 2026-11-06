import { BarChart3, Info } from 'lucide-react'

interface Props {
  imbalanceScore: number
  contractType: string
}

export default function PowerImbalanceVisualizer({ imbalanceScore, contractType }: Props) {
  const score = Math.max(0, Math.min(100, Math.round(imbalanceScore)))
  const label =
    score >= 80 ? 'Very high flagged-clause pressure' :
    score >= 60 ? 'Elevated flagged-clause pressure' :
    score >= 40 ? 'Moderate flagged-clause pressure' :
    'Lower flagged-clause pressure'

  return (
    <div className="card flex h-full flex-col justify-between space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-fp-accent" />
          <h3 className="text-sm font-semibold text-fp-text">Flagged-Clause Pressure</h3>
        </div>
        <span className="rounded-full border border-fp-border bg-fp-surface px-2.5 py-0.5 text-[10px] font-medium text-fp-muted">
          Heuristic index
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs text-fp-muted">{label}</p>
          <p className="text-2xl font-semibold tabular-nums text-fp-text">{score}<span className="text-sm text-fp-muted"> / 100</span></p>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full border border-fp-border bg-fp-surface"
          role="progressbar"
          aria-label="Flagged-clause pressure index"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <div
            className="h-full rounded-full bg-fp-accent transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-fp-muted">
          <span>Lower signal</span>
          <span>Higher signal</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-fp-border/60 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-fp-muted">What contributes to this index</p>
        <div className="flex items-start gap-2 text-xs text-fp-muted">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fp-accent" />
          <span>Counts of clauses classified as critical or high risk.</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-fp-muted">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fp-accent" />
          <span>Number of matched red-flag phrases across the {contractType.toLowerCase()}.</span>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-fp-border/50 bg-fp-surface/60 p-3 text-[11px] leading-relaxed text-fp-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fp-accent" />
        <span>This is a screening proxy. It does not measure bargaining power, prove contractual asymmetry, or establish legal harm.</span>
      </div>
    </div>
  )
}
