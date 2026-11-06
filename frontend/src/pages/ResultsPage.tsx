import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Shield, ChevronDown, ChevronUp,
  Download, FileText, ArrowLeft, Loader2, Scale,
  BookOpen, Info, Zap, Search, Columns, LayoutList,
  Copy, Bot, Sparkles, Filter, Check
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import clsx from 'clsx'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'
import { Clause, AnalysisResult, GeminiAnalysis } from '@/types/analysis'
import { getCachedAnalysisResult } from '@/utils/analysisStore'
import RadarRiskChart from '@/components/RadarRiskChart'
import PowerImbalanceVisualizer from '@/components/PowerImbalanceVisualizer'
import AskAiModal from '@/components/AskAiModal'
import ContractClauseViewer from '@/components/ContractClauseViewer'

const riskColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
}

const riskBg: Record<string, string> = {
  critical: 'clause-critical',
  high: 'clause-high',
  medium: 'clause-medium',
  low: 'clause-low',
}

function RiskBadge({ level }: { level: string }) {
  return <span className={`risk-${level}`}>{level}</span>
}

function ScoreMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? '#dc2626' : score >= 45 ? '#ea580c' : '#16a34a'
  return (
    <div className="card text-center flex flex-col justify-between">
      <ResponsiveContainer width="100%" height={110}>
        <RadialBarChart
          innerRadius="60%"
          outerRadius="80%"
          data={[{ value: score, fill: color }]}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar dataKey="value" cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-2xl font-black -mt-6" style={{ color }}>
        {score.toFixed(0)}
      </div>
      <div className="text-xs text-fp-muted mt-1">{label}</div>
    </div>
  )
}

function ClauseCard({
  clause,
  index,
  onJumpToSplitView,
}: {
  clause: Clause
  index: number
  onJumpToSplitView?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [aiExplain, setAiExplain] = useState<Record<string, string> | null>(null)
  const [loadingExplain, setLoadingExplain] = useState(false)

  const getAiExplanation = async () => {
    if (aiExplain) return
    setLoadingExplain(true)
    try {
      const res = await api.post('/api/analysis/explain-clause', {
        clause_text: clause.text,
        context: clause.category,
      })
      setAiExplain(res.data)
    } catch {
      toast.error('Could not get AI explanation')
    } finally {
      setLoadingExplain(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={clsx('rounded-xl border p-4 mb-3 transition-colors', riskBg[clause.risk_level] || 'clause-low')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <RiskBadge level={clause.risk_level} />
            <span className="text-xs text-fp-muted font-mono bg-fp-surface px-1.5 py-0.5 rounded border border-fp-border/40">
              {clause.category.replace(/_/g, ' ')}
            </span>
            {clause.is_anomaly && (
              <span className="text-xs text-purple-400 bg-purple-950/40 border border-purple-800/50 rounded-full px-2 py-0.5">
                anomaly
              </span>
            )}
            {clause.matched_pattern && (
              <span className="text-xs text-fp-accent truncate max-w-xs">{clause.matched_pattern}</span>
            )}
          </div>
          <p className="text-xs text-fp-text leading-relaxed line-clamp-2">{clause.text}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black font-mono"
            style={{ background: `${riskColors[clause.risk_level]}22`, color: riskColors[clause.risk_level] }}
          >
            {clause.risk_score.toFixed(0)}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-fp-muted hover:text-fp-text p-1 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-fp-border/50 pt-4">
              {/* Full clause text */}
              <div>
                <h4 className="text-[10px] font-semibold text-fp-muted uppercase tracking-wider mb-1 font-mono">
                  Exact Clause Text
                </h4>
                <p className="text-xs text-fp-text leading-relaxed bg-fp-bg/60 border border-fp-border/50 rounded-lg p-3 font-mono">
                  {clause.text}
                </p>
              </div>

              {/* Plain English */}
              <div className="bg-fp-surface/60 border border-fp-border/50 rounded-lg p-3">
                <h4 className="text-[10px] font-semibold text-fp-accent uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" /> Plain English Translation
                </h4>
                <p className="text-sm text-fp-text leading-relaxed">{clause.plain_english}</p>
              </div>

              {/* Mitigation */}
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
                <h4 className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1 font-mono">
                  Recommended Action / Redline
                </h4>
                <p className="text-xs text-fp-muted leading-relaxed">{clause.mitigation}</p>
              </div>

              {/* Legal basis */}
              <div className="flex items-start gap-2 bg-fp-surface/30 p-2.5 rounded-lg border border-fp-border/40">
                <Scale className="w-3.5 h-3.5 text-fp-accent shrink-0 mt-0.5" />
                <p className="text-xs text-fp-muted">{clause.legal_basis}</p>
              </div>

              {/* Red flags */}
              {clause.flags && clause.flags.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-fp-muted uppercase tracking-wider mb-1 font-mono">
                    Red-Flag Phrases Detected
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {clause.flags.map((f) => (
                      <span
                        key={f}
                        className="text-xs bg-red-950/40 border border-red-800/40 text-red-300 rounded px-1.5 py-0.5 font-mono"
                      >
                        "{f}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta metrics & Action */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-fp-border/40">
                <div className="flex gap-4 text-xs text-fp-muted font-mono">
                  <span>Readability: <strong className="text-fp-text">{clause.readability_score?.toFixed(0) || 45}</strong></span>
                  <span>Pattern match: <strong className="text-fp-text">{clause.match_strength !== undefined ? clause.match_strength.toFixed(2) : "—"}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {onJumpToSplitView && (
                    <button
                      onClick={onJumpToSplitView}
                      className="text-xs text-fp-accent hover:text-fp-accent-glow flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>View in Full Document</span>
                    </button>
                  )}
                  <button
                    onClick={getAiExplanation}
                    disabled={loadingExplain}
                    className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    {loadingExplain ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {aiExplain && (
                <div className="bg-fp-accent/10 border border-fp-accent/30 rounded-lg p-3 space-y-2 mt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-fp-accent">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> AI Deep Dive
                  </div>
                  <p className="text-xs text-fp-text leading-relaxed">{aiExplain.explanation}</p>
                  <p className="text-xs text-fp-muted"><strong>Real-world impact:</strong> {aiExplain.real_world_impact}</p>
                  <p className="text-xs text-green-400"><strong>Action:</strong> {aiExplain.action}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'gemini'>('overview')
  const [viewMode, setViewMode] = useState<'split' | 'cards'>('split')
  const [clauseFilter, setClauseFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedClauseIndex, setSelectedClauseIndex] = useState<number>(0)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    // Check cached demo first for instant responsive feel
    const cached = getCachedAnalysisResult(id)
    if (cached) {
      setResult(cached)
      setLoading(false)
      return
    }

    api
      .get(`/api/analysis/${id}`)
      .then((r) => setResult(r.data))
      .catch(() => {
        const fallback = getCachedAnalysisResult(id)
        if (fallback) {
          setResult(fallback)
        } else {
          toast.error('Failed to load contract analysis')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  // Extract unique categories from clauses for category filter
  const categories = useMemo(() => {
    if (!result?.clauses) return []
    const cats = Array.from(new Set(result.clauses.map((c) => c.category)))
    return cats.sort()
  }, [result])

  // Filter & Search Clauses
  const filteredClauses = useMemo(() => {
    if (!result?.clauses) return []
    return result.clauses
      .filter((c) => {
        const matchesRisk = clauseFilter === 'all' || c.risk_level === clauseFilter
        const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          !q ||
          c.text.toLowerCase().includes(q) ||
          c.plain_english.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.matched_pattern && c.matched_pattern.toLowerCase().includes(q)) ||
          c.legal_basis.toLowerCase().includes(q)
        return matchesRisk && matchesCategory && matchesSearch
      })
      .sort((a, b) => b.risk_score - a.risk_score)
  }, [result, clauseFilter, categoryFilter, searchQuery])

  // Quick action: Copy Plain-English Summary
  const handleCopySummary = () => {
    if (!result) return
    const textToCopy = `FP.ai Analysis Summary for ${result.contract_type}
Risk Rating: ${result.overall_risk_rating.toUpperCase()} (${result.overall_risk_score.toFixed(0)}/100)
Heuristic Imbalance Signal: ${result.power_imbalance_score}/100

Executive Summary:
${result.executive_summary}

Top Flagged Risks:
${result.top_risks.map((r, i) => `${i + 1}. [${r.severity?.toUpperCase()}] ${r.title}: ${r.explanation}`).join('\n')}

Key Recommendations:
${result.recommendations.map((rec, i) => `• ${rec}`).join('\n')}`

    navigator.clipboard.writeText(textToCopy)
    toast.success('Plain-English Summary copied to clipboard!')
  }

  // Quick action: Export JSON
  const handleExportJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `FPai_Analysis_${result.contract_type.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON export downloaded!')
  }

  // Quick action: Export PDF (backend or print fallback)
  const handleExportPdf = () => {
    if (!result) return
    // Open backend PDF endpoint or trigger browser print
    const backendUrl = `/api/reports/${result.analysis_id}/pdf`
    window.open(backendUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Shield className="w-16 h-16 text-fp-accent opacity-20" />
          <Loader2 className="w-8 h-8 text-fp-accent animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm font-mono text-fp-muted">Loading Fine Print Risk Matrix…</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-20 card max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-fp-muted mx-auto mb-3" />
        <h2 className="text-lg font-bold text-fp-text">Analysis Not Found</h2>
        <p className="text-fp-muted text-xs mt-1 mb-6">
          The requested contract report could not be located in cache or database.
        </p>
        <Link to="/analysis" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" /> Analyse New Contract
        </Link>
      </div>
    )
  }

  const ratingColor = riskColors[result.overall_risk_rating] || '#64748b'

  const barData = [
    { name: 'Critical', value: result.critical_count, color: '#dc2626' },
    { name: 'High', value: result.high_count, color: '#ea580c' },
    { name: 'Medium', value: result.medium_count, color: '#ca8a04' },
    { name: 'Low', value: result.low_count, color: '#16a34a' },
  ]

  const gemini = (result.gemini_analysis || {}) as GeminiAnalysis

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Header & Quick Actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/analysis" className="text-fp-muted hover:text-fp-text text-xs flex items-center gap-1.5 mb-2 font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Analysis Uploader
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fp-text">
              {result.contract_type}
            </h1>
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-mono"
              style={{ borderColor: `${ratingColor}80`, color: ratingColor, background: `${ratingColor}15` }}
            >
              {result.overall_risk_rating}
            </span>
          </div>
          <p className="text-fp-muted text-xs mt-1 font-mono">
            {result.total_clauses} clauses audited · {result.processing_time_ms}ms · AI Model Pipeline 2026
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-yellow-300" />
            <span>Ask AI</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted summary to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-fp-accent" />
            <span className="hidden sm:inline">Copy Summary</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Export PDF Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportJson}
            className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Export JSON Data"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Overall rating banner */}
      <div
        className="rounded-2xl border p-5 flex items-center gap-5 shadow-lg backdrop-blur-sm"
        style={{ borderColor: `${ratingColor}50`, background: `${ratingColor}10` }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner shrink-0"
          style={{ background: `${ratingColor}25`, color: ratingColor }}
        >
          {result.overall_risk_rating === 'critical' ? '☠' :
           result.overall_risk_rating === 'high' ? '⚠' :
           result.overall_risk_rating === 'medium' ? '◈' : '✓'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-extrabold text-fp-text uppercase tracking-wide text-sm">
              {result.overall_risk_rating} Risk Profile
            </span>
            <span className="text-xs text-fp-muted font-mono">
              Score: <strong className="text-fp-text">{result.overall_risk_score.toFixed(0)}</strong>/100
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fp-muted leading-relaxed font-sans">
            {result.executive_summary}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-fp-border/70 pb-px">
        {(['overview', 'clauses', 'gemini'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer',
              activeTab === tab
                ? 'border-fp-accent text-fp-accent bg-fp-accent/5 rounded-t-lg'
                : 'border-transparent text-fp-muted hover:text-fp-text'
            )}
          >
            {tab === 'overview' && '📊 Executive Overview & Risk Visualizers'}
            {tab === 'clauses' && `📋 Contract Clause Viewer (${result.total_clauses})`}
            {tab === 'gemini' && '🤖 Gemini AI Legal Intelligence'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Key Metric Gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreMeter score={result.overall_risk_score} label="Heuristic Risk Index" />
            <div className="card text-center flex flex-col justify-between">
              <div>
                <div className="text-3xl font-black font-mono" style={{ color: ratingColor }}>
                  {result.critical_count + result.high_count}
                </div>
                <div className="text-xs text-fp-muted mt-1 font-medium">Critical + High Traps</div>
              </div>
              <div className="text-[11px] text-fp-muted font-mono pt-2 border-t border-fp-border/50">
                {result.critical_count} Critical · {result.high_count} High
              </div>
            </div>
            <div className="card text-center flex flex-col justify-between">
              <div>
                <div className="text-3xl font-black text-fp-accent font-mono">
                  {result.readability_score?.toFixed(0) || 35}
                </div>
                <div className="text-xs text-fp-muted mt-1 font-medium">Flesch Readability</div>
              </div>
              <div className="text-[11px] text-fp-muted font-mono pt-2 border-t border-fp-border/50">
                {result.readability_score < 30 ? 'Obfuscated Legalese' :
                 result.readability_score < 50 ? 'Complex Drafting' : 'Standard Clarity'}
              </div>
            </div>
            <div className="card text-center flex flex-col justify-between">
              <div>
                <div
                  className="text-3xl font-black font-mono"
                  style={{ color: result.power_imbalance_score > 60 ? '#dc2626' : '#16a34a' }}
                >
                  {result.power_imbalance_score}
                </div>
                <div className="text-xs text-fp-muted mt-1 font-medium">Power Imbalance</div>
              </div>
              <div className="text-[11px] text-fp-muted font-mono pt-2 border-t border-fp-border/50">
                {result.power_imbalance_score > 70 ? 'Extreme Asymmetry' : 'Commercial Equilibrium'}
              </div>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-fp-muted">
            Risk and imbalance values are screening heuristics, not calibrated probabilities or legal determinations. Anomaly scores compare clauses within this document.
          </p>

          {/* Visual Risk Distribution & Radar & Imbalance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Radar Multi-Axis Chart */}
            <div className="lg:col-span-1">
              <RadarRiskChart clauses={result.clauses} overallScore={result.overall_risk_score} />
            </div>

            {/* Power Imbalance Visualizer */}
            <div className="lg:col-span-1">
              <PowerImbalanceVisualizer
                imbalanceScore={result.power_imbalance_score}
                contractType={result.contract_type}
              />
            </div>

            {/* Risk Distribution Bar Chart */}
            <div className="lg:col-span-1 card flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-fp-text">Clause Severity Distribution</h3>
                <span className="text-[10px] font-mono text-fp-muted bg-fp-surface px-2 py-0.5 rounded border border-fp-border">
                  {result.total_clauses} Total
                </span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8, fontSize: 12 }}
                      cursor={{ fill: '#1e2d4a40' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-fp-muted text-center mt-1">
                Immediate attention required for {result.critical_count} critical clauses.
              </p>
            </div>
          </div>

          {/* Top Identified Risks & Actionable Advice */}
          {result.top_risks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-fp-text uppercase tracking-wider font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Priority Redlines & Traps
                </h3>
                <span className="text-xs text-fp-muted">Top {Math.min(result.top_risks.length, 5)} risks</span>
              </div>
              <div className="grid gap-3">
                {result.top_risks.slice(0, 5).map((risk, i) => {
                  const severity = risk.severity || 'medium'
                  const color = riskColors[severity] || '#64748b'
                  return (
                    <div
                      key={i}
                      className="card border-l-4 space-y-2 hover:border-fp-accent/40 transition-colors"
                      style={{ borderLeftColor: color }}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <RiskBadge level={severity} />
                          <span className="font-bold text-sm text-fp-text">{risk.title}</span>
                        </div>
                      </div>
                      <p className="text-xs text-fp-muted leading-relaxed font-sans">{risk.explanation}</p>
                      {risk.negotiation_tip && (
                        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 text-xs text-emerald-300 flex items-start gap-2">
                          <span className="font-bold uppercase text-[10px] text-emerald-400 font-mono shrink-0 mt-0.5">
                            Redline Tip:
                          </span>
                          <span>{risk.negotiation_tip}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Strategic Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="card space-y-3 bg-fp-surface/40">
              <h3 className="font-bold text-sm flex items-center gap-2 text-fp-text font-mono uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-fp-accent" /> Recommended Counter-Strategy
              </h3>
              <div className="grid gap-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-fp-text/90 leading-relaxed">
                    <span className="text-fp-accent font-bold mt-0.5 shrink-0">[{i + 1}]</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLAUSES TAB: Split View / Cards + Multi-Filter & Full Text Search */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          {/* Filter, Search & View Mode Toolbar */}
          <div className="card p-4 space-y-3 bg-fp-surface/60 border-fp-border/80">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-fp-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clause text, pattern, legal basis, keywords…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-fp-card border border-fp-border rounded-lg pl-9 pr-8 py-2 text-xs text-fp-text placeholder:text-fp-muted focus:outline-none focus:border-fp-accent transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fp-muted hover:text-fp-text text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-fp-card p-1 rounded-lg border border-fp-border">
                <button
                  onClick={() => setViewMode('split')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer',
                    viewMode === 'split'
                      ? 'bg-fp-accent text-white shadow'
                      : 'text-fp-muted hover:text-fp-text'
                  )}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split Viewer</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer',
                    viewMode === 'cards'
                      ? 'bg-fp-accent text-white shadow'
                      : 'text-fp-muted hover:text-fp-text'
                  )}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Card List</span>
                </button>
              </div>
            </div>

            {/* Filter pills: Severity & Category */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-fp-border/40">
              {/* Severity filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-fp-muted uppercase tracking-wider mr-1">Severity:</span>
                {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setClauseFilter(f)}
                    className={clsx(
                      'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer',
                      clauseFilter === f
                        ? 'bg-fp-accent/20 border-fp-accent/60 text-fp-accent-glow'
                        : 'border-fp-border/60 text-fp-muted hover:border-fp-accent/30'
                    )}
                  >
                    {f === 'all'
                      ? `All (${result.clauses.length})`
                      : f === 'critical'
                      ? `Critical (${result.critical_count})`
                      : f === 'high'
                      ? `High (${result.high_count})`
                      : f === 'medium'
                      ? `Medium (${result.medium_count})`
                      : `Low (${result.low_count})`}
                  </button>
                ))}
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-fp-muted uppercase tracking-wider">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-fp-card border border-fp-border text-xs rounded-lg px-2.5 py-1 text-fp-text focus:outline-none focus:border-fp-accent cursor-pointer"
                >
                  <option value="all">All Categories ({result.clauses.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <p className="text-xs text-fp-muted font-mono">
            Showing {filteredClauses.length} of {result.total_clauses} clauses
            {clauseFilter !== 'all' && ` [Risk: ${clauseFilter}]`}
            {categoryFilter !== 'all' && ` [Category: ${categoryFilter}]`}
            {searchQuery && ` [Matching: "${searchQuery}"]`}
          </p>

          {/* VIEW MODE 1: Split View Context Viewer */}
          {viewMode === 'split' && (
            <ContractClauseViewer
              clauses={filteredClauses.length > 0 ? filteredClauses : result.clauses}
              documentText={result.document_text}
              contractType={result.contract_type}
              selectedClauseIndex={selectedClauseIndex}
              onSelectClause={(idx) => setSelectedClauseIndex(idx)}
            />
          )}

          {/* VIEW MODE 2: Card List View */}
          {viewMode === 'cards' && (
            <div className="space-y-3">
              {filteredClauses.map((clause, i) => (
                <ClauseCard
                  key={i}
                  clause={clause}
                  index={i}
                  onJumpToSplitView={() => {
                    setSelectedClauseIndex(i)
                    setViewMode('split')
                  }}
                />
              ))}

              {filteredClauses.length === 0 && (
                <div className="text-center py-16 text-fp-muted text-sm card">
                  <Search className="w-8 h-8 text-fp-muted mx-auto mb-2 opacity-40" />
                  <p>No clauses match the selected filters or search keyword.</p>
                  <button
                    onClick={() => {
                      setClauseFilter('all')
                      setCategoryFilter('all')
                      setSearchQuery('')
                    }}
                    className="btn-ghost text-xs mt-3"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GEMINI AI TAB */}
      {activeTab === 'gemini' && (
        <div className="space-y-5">
          {Object.keys(gemini).length === 0 ? (
            <div className="card text-center py-12 space-y-3">
              <Info className="w-10 h-10 text-fp-muted mx-auto" />
              <h3 className="font-bold text-fp-text text-sm">Gemini Deep Reasoning Inactive</h3>
              <p className="text-xs text-fp-muted max-w-md mx-auto">
                Gemini AI analysis was skipped for this run. Provide your GEMINI_API_KEY in the backend configuration to unlock complete multi-agent reasoning.
              </p>
              <button onClick={() => setIsAiModalOpen(true)} className="btn-primary text-xs mx-auto">
                Open AI Legal Assistant
              </button>
            </div>
          ) : (
            <>
              {gemini.readability_assessment && (
                <div className="card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-fp-muted">Readability Verdict</span>
                    <span className="risk-badge bg-fp-surface text-fp-accent border border-fp-accent/40 font-mono">
                      {String(gemini.readability_assessment.verdict || 'Complex Legalese')}
                    </span>
                  </div>
                  <p className="text-xs text-fp-muted leading-relaxed font-sans">
                    {String(gemini.readability_assessment.explanation || '')}
                  </p>
                </div>
              )}

              {gemini.jurisdiction_analysis && (
                <div className="card space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-fp-text font-mono uppercase tracking-wider">
                    <Scale className="w-4 h-4 text-fp-accent" /> Cross-Jurisdictional Analysis
                  </h3>
                  <p className="text-xs text-fp-muted font-mono">
                    <strong className="text-fp-text">Governing Law:</strong>{' '}
                    {String(gemini.jurisdiction_analysis.governing_law || 'Indian / International Law')}
                  </p>
                  {Boolean(gemini.jurisdiction_analysis.india_specific) && (
                    <p className="text-xs text-fp-muted leading-relaxed font-sans bg-fp-surface/60 p-3 rounded-lg border border-fp-border/40">
                      <strong className="text-fp-accent">Indian Law Enforceability:</strong>{' '}
                      {String(gemini.jurisdiction_analysis.india_specific)}
                    </p>
                  )}
                </div>
              )}

              {Array.isArray(gemini.hidden_dangers) && gemini.hidden_dangers.length > 0 && (
                <div className="card border-orange-800/50 bg-orange-950/15 space-y-2">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Hidden Inconspicuous Traps
                  </h3>
                  <div className="space-y-1.5">
                    {gemini.hidden_dangers.map((d, i) => (
                      <div key={i} className="text-xs text-fp-muted flex items-start gap-2">
                        <span className="text-orange-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(gemini.must_remove_clauses) && gemini.must_remove_clauses.length > 0 && (
                <div className="card border-red-800/50 bg-red-950/15 space-y-2">
                  <h3 className="font-bold text-sm text-red-400 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <Shield className="w-4 h-4" /> Non-Negotiable Deletions (Must Remove)
                  </h3>
                  <div className="space-y-1.5">
                    {gemini.must_remove_clauses.map((c, i) => (
                      <div key={i} className="text-xs text-red-300 flex items-start gap-2 font-mono">
                        <span className="text-red-500 font-bold shrink-0">✕</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Ask AI Trigger Modal */}
      <AskAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={result}
      />

      <div className="glow-line" />
      <p className="text-xs text-center text-fp-muted font-mono">
        FP.ai Fine Print Engine · For educational and informational purposes only. Consult qualified legal counsel.
      </p>
    </div>
  )
}
