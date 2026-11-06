import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Clause } from '@/types/analysis'

interface Props {
  clauses: Clause[]
  overallScore: number
}

export default function RadarRiskChart({ clauses }: Props) {
  const categoriesMap: Record<string, number[]> = {
    'Liability & Indemnity': [],
    'Exit & Termination': [],
    'Restrictive Covenants': [],
    'IP & Data Rights': [],
    'Dispute Asymmetry': [],
    'Financial Penalties': [],
  }

  clauses.forEach((c) => {
    const cat = c.category.toLowerCase()
    const score = c.risk_score || 50

    if (cat.includes('liability') || cat.includes('indemnity')) {
      categoriesMap['Liability & Indemnity'].push(score)
    } else if (cat.includes('termination') || cat.includes('auto_renewal')) {
      categoriesMap['Exit & Termination'].push(score)
    } else if (cat.includes('non_compete') || cat.includes('confidentiality')) {
      categoriesMap['Restrictive Covenants'].push(score)
    } else if (cat.includes('ip') || cat.includes('data') || cat.includes('privacy')) {
      categoriesMap['IP & Data Rights'].push(score)
    } else if (cat.includes('arbitration') || cat.includes('governing') || cat.includes('waiver')) {
      categoriesMap['Dispute Asymmetry'].push(score)
    } else {
      categoriesMap['Financial Penalties'].push(score)
    }
  })

  const radarData = Object.entries(categoriesMap).map(([dimension, scores]) => ({
    dimension,
    risk: scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    fullMark: 100,
  }))

  return (
    <div className="card flex h-full flex-col justify-between">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fp-text">Multi-Axis Risk Profile</h3>
        <span className="rounded border border-fp-border bg-fp-surface px-2 py-0.5 text-[10px] text-fp-muted">
          6 Legal Vectors
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#34443a" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#aab5a8', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#89978a', fontSize: 9 }} stroke="#34443a" />
            <Radar name="Contract Risk" dataKey="risk" stroke="#9ab99a" fill="#78977a" fillOpacity={0.28} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#141c17',
                borderColor: '#34443a',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f0f2ed',
              }}
              formatter={(value: number) => [`${value} / 100`, 'Risk Index']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-center text-[11px] text-fp-muted">
        Higher values indicate greater exposure across the clause categories shown.
      </p>
    </div>
  )
}
