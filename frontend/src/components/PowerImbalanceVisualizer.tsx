import { Scale, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  imbalanceScore: number
  contractType: string
}

export default function PowerImbalanceVisualizer({ imbalanceScore, contractType }: Props) {
  // Score 0-100 where >60 is severe counterparty favor, 40-60 is balanced, <40 is signer favor
  const isSevere = imbalanceScore >= 70
  const isModerate = imbalanceScore >= 45 && imbalanceScore < 70
  const isBalanced = imbalanceScore < 45

  const counterpartyPercent = Math.min(Math.max(imbalanceScore, 10), 95)
  const signerPercent = 100 - counterpartyPercent

  const getStatusLabel = () => {
    if (imbalanceScore >= 80) return 'Extreme Counterparty Favor'
    if (imbalanceScore >= 65) return 'Substantial One-Sided Asymmetry'
    if (imbalanceScore >= 45) return 'Moderate Commercial Advantage'
    return 'Balanced Reciprocal Covenants'
  }

  const getStatusColor = () => {
    if (isSevere) return 'text-red-400 border-red-800/60 bg-red-950/30'
    if (isModerate) return 'text-orange-400 border-orange-800/60 bg-orange-950/30'
    return 'text-green-400 border-green-800/60 bg-green-950/30'
  }

  return (
    <div className="card h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-fp-accent" />
          <h3 className="font-semibold text-sm text-fp-text">Power Imbalance Index</h3>
        </div>
        <span className={clsx('text-[11px] font-bold px-2.5 py-0.5 rounded-full border', getStatusColor())}>
          {getStatusLabel()}
        </span>
      </div>

      {/* Visual meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-fp-muted">Your Position ({signerPercent}%)</span>
          <span className="text-red-400 font-bold">Counterparty Advantage ({counterpartyPercent}%)</span>
        </div>

        <div className="h-3 w-full bg-fp-surface rounded-full overflow-hidden flex p-0.5 border border-fp-border">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-l-full transition-all duration-700"
            style={{ width: `${signerPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-r-full transition-all duration-700 shadow-[0_0_12px_rgba(220,38,38,0.5)]"
            style={{ width: `${counterpartyPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-fp-muted font-mono pt-0.5">
          <span>0 (Signer Dictated)</span>
          <span>50 (Reciprocal Equilibrium)</span>
          <span>100 (Unilateral Draft)</span>
        </div>
      </div>

      {/* Asymmetric vectors */}
      <div className="space-y-2 pt-2 border-t border-fp-border/50 text-xs">
        <div className="flex items-center justify-between text-fp-muted">
          <span>Exit Rights Reciprocity:</span>
          <span className={isSevere ? 'text-red-400 font-medium' : 'text-fp-text'}>
            {isSevere ? 'Asymmetric (30:1)' : 'Standard'}
          </span>
        </div>
        <div className="flex items-center justify-between text-fp-muted">
          <span>Indemnification Ceiling:</span>
          <span className={imbalanceScore > 60 ? 'text-red-400 font-medium' : 'text-fp-text'}>
            {imbalanceScore > 60 ? 'Uncapped vs Nominal' : 'Mutual Cap'}
          </span>
        </div>
        <div className="flex items-center justify-between text-fp-muted">
          <span>Dispute Resolution Forum:</span>
          <span className="text-fp-text">Foreign / Off-shore AAA</span>
        </div>
      </div>

      <div className="text-[11px] text-fp-muted bg-fp-surface/60 rounded-lg p-2.5 border border-fp-border/40 leading-relaxed flex items-start gap-2">
        {isSevere ? (
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
        )}
        <span>
          {isSevere
            ? `This ${contractType} is heavily weighted against you. Key obligations are one-directional without mutual remedies.`
            : `Clauses maintain standard commercial balance between both signing parties.`}
        </span>
      </div>
    </div>
  )
}
