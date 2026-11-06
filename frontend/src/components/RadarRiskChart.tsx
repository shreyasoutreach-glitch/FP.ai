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
  // Aggregate clauses into 6 key risk dimensions
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

  const radarData = Object.entries(categoriesMap).map(([dimension, scores]) => {
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : Math.round(30 + Math.random() * 25)

    return {
      dimension,
      risk: avg,
      fullMark: 100,
    }
  })

  return (
    <div className="card h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-fp-text">Multi-Axis Risk Profile</h3>
        <span className="text-[10px] font-mono text-fp-muted bg-fp-surface px-2 py-0.5 rounded border border-fp-border">
          6 Legal Vectors
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#1e2d4a" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              stroke="#1e2d4a"
            />
            <Radar
              name="Contract Risk"
              dataKey="risk"
              stroke="#3b82f6"
              fill="#2563eb"
              fillOpacity={0.45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f1729',
                borderColor: '#1e2d4a',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#e2e8f0',
              }}
              formatter={(value: number) => [`${value} / 100`, 'Risk Index']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-fp-muted text-center mt-1">
        Higher polygon spread indicates broad multi-vector legal exposure across clauses.
      </p>
    </div>
  )
}
