import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Scale, Shield, Loader2, Sparkles, AlertTriangle,
  Play, CheckCircle2, Copy, FileText, ArrowRight, BookOpen,
  Filter, Check, Zap, HelpCircle
} from 'lucide-react'
import { api } from '@/utils/api'
import clsx from 'clsx'
import { KBEntry, FALLBACK_KNOWLEDGE_BASE } from '@/data/knowledgeBaseData'
import toast from 'react-hot-toast'

const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

const TAB_CATEGORIES = [
  { id: 'all', label: 'All Patterns', desc: 'Complete Legal Corpus' },
  { id: 'ma', label: 'M&A Deals', desc: 'Acquisition & Escrow Traps' },
  { id: 'employment', label: 'Employment', desc: 'Bonds, Non-Competes & IP' },
  { id: 'consumer', label: 'Consumer & SaaS', desc: 'Auto-Renewals & AI Rights' },
  { id: 'corporate', label: 'Corporate / SEBI', desc: 'Governance & Jurisdiction' },
  { id: 'liability', label: 'Liability & Indemnity', desc: 'Damage Caps & Escrows' },
]

const SAMPLE_SIMULATOR_SNIPPETS = [
  {
    label: '2-Year Non-Compete',
    text: 'For a period of 24 months post-termination, Employee shall not directly or indirectly engage in any competing business anywhere in India.',
  },
  {
    label: '$50k Training Bond',
    text: 'Employee agrees to reimburse company the sum of $50,000 as liquidated training damages if resigning prior to 36 months of continuous service.',
  },
  {
    label: 'AI Data Grab',
    text: 'Customer grants Provider a perpetual, irrevocable license to incorporate customer data and query logs into foundation models and neural networks.',
  },
  {
    label: 'Uncapped Liability',
    text: 'Seller shall jointly and severally indemnify Purchaser against any and all consequential damages and lost profits without any cap or monetary ceiling.',
  },
  {
    label: '180-Day Mail Renewal',
    text: 'This agreement shall automatically renew for successive 24-month terms unless notice is delivered via certified physical registered mail 180 days prior.',
  },
]

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Simulator state
  const [simulatorInput, setSimulatorInput] = useState(
    'For a period of 24 months post-termination, Employee shall not directly or indirectly engage in any competing business anywhere in India.'
  )
  const [copiedRedline, setCopiedRedline] = useState(false)

  useEffect(() => {
    api
      .get('/api/training/knowledge-base')
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setEntries(r.data)
        } else {
          setEntries(FALLBACK_KNOWLEDGE_BASE)
        }
      })
      .catch(() => {
        // Fallback to rich pre-loaded dataset
        setEntries(FALLBACK_KNOWLEDGE_BASE)
      })
      .finally(() => setLoading(false))
  }, [])

  // Tab category matching logic
  const matchesTab = (entry: KBEntry, tab: string) => {
    if (tab === 'all') return true
    const cat = entry.category.toLowerCase()
    if (tab === 'ma') {
      return (
        cat.includes('termination') ||
        cat.includes('change_of_control') ||
        cat.includes('assignment') ||
        cat.includes('escrow')
      )
    }
    if (tab === 'employment') {
      return (
        cat.includes('non_compete') ||
        cat.includes('salary') ||
        cat.includes('ip') ||
        cat.includes('penalty') ||
        cat.includes('confidentiality')
      )
    }
    if (tab === 'consumer') {
      return (
        cat.includes('auto_renewal') ||
        cat.includes('unilateral') ||
        cat.includes('data') ||
        cat.includes('privacy') ||
        cat.includes('waiver')
      )
    }
    if (tab === 'corporate') {
      return (
        cat.includes('governing') ||
        cat.includes('arbitration') ||
        cat.includes('change_of_control') ||
        cat.includes('force_majeure')
      )
    }
    if (tab === 'liability') {
      return (
        cat.includes('liability') ||
        cat.includes('indemnity') ||
        cat.includes('penalty') ||
        cat.includes('limitation')
      )
    }
    return true
  }

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        const inTab = matchesTab(e, activeCategoryTab)
        const q = search.toLowerCase().trim()
        const matchSearch =
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.legal_basis.toLowerCase().includes(q) ||
          e.plain_english.toLowerCase().includes(q) ||
          e.red_flag_phrases.some((p) => p.toLowerCase().includes(q))
        const matchRisk = filterRisk === 'all' || e.risk_level === filterRisk
        return inTab && matchSearch && matchRisk
      })
      .sort(
        (a, b) =>
          (riskOrder[a.risk_level] ?? 9) -
          (riskOrder[b.risk_level] ?? 9)
      )
  }, [entries, activeCategoryTab, search, filterRisk])

  // Real-time Clause Test Simulator Detection
  const simulationResult = useMemo(() => {
    const text = simulatorInput.trim().toLowerCase()
    if (!text) return null

    // Look for matching red flags across all entries
    const matches: Array<{
      entry: KBEntry
      matchedPhrases: string[]
      score: number
    }> = []

    entries.forEach((e) => {
      const hits = e.red_flag_phrases.filter((phrase) =>
        text.includes(phrase.toLowerCase())
      )
      if (hits.length > 0) {
        matches.push({
          entry: e,
          matchedPhrases: hits,
          score: hits.length * 35 + (e.risk_level === 'critical' ? 50 : 35),
        })
      }
    })

    if (matches.length === 0) {
      // General heuristics
      const hasStrict =
        text.includes('sole discretion') ||
        text.includes('without cause') ||
        text.includes('liquidated damages') ||
        text.includes('waive') ||
        text.includes('indemnify')

      return {
        matched: false,
        riskLevel: hasStrict ? 'medium' : 'low',
        riskScore: hasStrict ? 52 : 20,
        category: hasStrict ? 'General Risk' : 'Standard Covenant',
        matchedPattern: hasStrict ? 'Discretionary Right' : 'Standard Commercial Wording',
        statute: 'Indian Contract Act 1872 & General Commercial Principles',
        plainEnglish:
          'No severe fine-print traps detected. The clause appears relatively neutral, but verify notice periods and mutual remedies.',
        redline: 'Ensure bilateral reciprocity and add standard 30-day cure notices.',
        detectedKeywords: [],
      }
    }

    // Sort by best match
    matches.sort((a, b) => b.score - a.score)
    const top = matches[0]

    return {
      matched: true,
      riskLevel: top.entry.risk_level,
      riskScore: Math.min(top.entry.risk_level === 'critical' ? 95 : 82, 100),
      category: top.entry.category,
      matchedPattern: top.entry.name,
      statute: top.entry.legal_basis,
      plainEnglish: top.entry.plain_english,
      redline: top.entry.mitigation,
      detectedKeywords: top.matchedPhrases,
    }
  }, [simulatorInput, entries])

  const copyRedline = () => {
    if (simulationResult?.redline) {
      navigator.clipboard.writeText(simulationResult.redline)
      setCopiedRedline(true)
      toast.success('Counter-proposal copied to clipboard!')
      setTimeout(() => setCopiedRedline(false), 2000)
    }
  }

  const riskBadgeClass: Record<string, string> = {
    critical: 'bg-red-950 text-red-400 border-red-800',
    high: 'bg-orange-950 text-orange-400 border-orange-800',
    medium: 'bg-yellow-950 text-yellow-400 border-yellow-800',
    low: 'bg-green-950 text-green-400 border-green-800',
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen className="w-4 h-4 text-fp-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-fp-accent font-semibold">
            Vulnerability Taxonomy & Simulator
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-fp-text">
          Fine Print Knowledge Base
        </h1>
        <p className="text-fp-muted text-sm mt-2 max-w-3xl leading-relaxed">
          Potential clause-pattern references for further review. These matches are not legal conclusions. The knowledge base includes references to the Indian Contract Act 1872,
          SEBI disclosure regulations, DPDP Act 2023, FTC rules, and landmark common-law precedents.
        </p>
      </div>

      {/* SECTION 1: INTERACTIVE CLAUSE TEST SIMULATOR */}
      <section className="card border-fp-accent/40 bg-gradient-to-b from-fp-card via-fp-card to-fp-surface/90 shadow-xl space-y-5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-fp-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fp-accent/20 border border-fp-accent/40 flex items-center justify-center text-fp-accent">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-fp-text">Live Clause Test Simulator</h2>
              <p className="text-xs text-fp-muted">Paste a clause to preview exact phrase matches against the reference patterns</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-fp-accent bg-fp-accent/10 border border-fp-accent/30 rounded-full px-2.5 py-0.5">
            Rule-based pattern preview
          </span>
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <textarea
            value={simulatorInput}
            onChange={(e) => setSimulatorInput(e.target.value)}
            rows={3}
            placeholder="Type or paste any contract clause here to test what FP.ai flags in real-time…"
            className="w-full bg-fp-bg/80 border border-fp-border rounded-xl p-3.5 text-xs text-fp-text font-mono leading-relaxed placeholder:text-fp-muted focus:outline-none focus:border-fp-accent transition-colors resize-none"
          />

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fp-muted mr-1 shrink-0">
              Try Samples:
            </span>
            {SAMPLE_SIMULATOR_SNIPPETS.map((snip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSimulatorInput(snip.text)}
                className="text-[11px] bg-fp-surface hover:bg-fp-border border border-fp-border/70 text-fp-muted hover:text-fp-text px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer"
              >
                {snip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-Time Detection Output Card */}
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'rounded-xl border p-4 space-y-3.5 transition-all',
              simulationResult.riskLevel === 'critical'
                ? 'border-red-800/60 bg-red-950/20'
                : simulationResult.riskLevel === 'high'
                ? 'border-orange-800/60 bg-orange-950/20'
                : 'border-fp-border bg-fp-surface/60'
            )}
          >
            {/* Output header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border font-mono',
                    riskBadgeClass[simulationResult.riskLevel] || riskBadgeClass.low
                  )}
                >
                  {simulationResult.riskLevel} Risk
                </span>
                <span className="text-xs font-mono text-fp-text font-bold">
                  {simulationResult.matchedPattern}
                </span>
                <span className="text-xs text-fp-muted font-mono bg-fp-surface px-2 py-0.5 rounded border border-fp-border">
                  {simulationResult.category.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-fp-muted">Simulated Score:</span>
                <span className="text-lg font-black font-mono text-fp-text">
                  {simulationResult.riskScore}/100
                </span>
              </div>
            </div>

            {/* Highlighted Detected Keywords */}
            {simulationResult.detectedKeywords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fp-muted">
                  Flagged Triggers:
                </span>
                {simulationResult.detectedKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-red-950/50 border border-red-700/60 text-red-300 px-2 py-0.5 rounded font-mono"
                  >
                    "{k}"
                  </span>
                ))}
              </div>
            )}

            {/* Plain English Translation */}
            <div className="bg-fp-bg/60 border border-fp-border/60 rounded-lg p-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-fp-accent font-bold block mb-1">
                Plain-English Translation
              </span>
              <p className="text-xs text-fp-text leading-relaxed font-sans">
                {simulationResult.plainEnglish}
              </p>
            </div>

            {/* Legal basis + Recommended counter-proposal */}
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-fp-surface/60 border border-fp-border/60 rounded-lg p-3 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-fp-muted font-bold block flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-fp-accent" /> Legal Statutory Reference
                </span>
                <p className="text-xs text-fp-muted leading-relaxed font-sans">
                  {simulationResult.statute}
                </p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Counter-Proposal / Redline
                  </span>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                    {simulationResult.redline}
                  </p>
                </div>
                <button
                  onClick={copyRedline}
                  className="btn-ghost text-[11px] py-1 px-2.5 flex items-center gap-1 self-end mt-2 cursor-pointer"
                >
                  {copiedRedline ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRedline ? 'Copied' : 'Copy Redline'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* SECTION 2: KNOWLEDGE BASE BROWSER WITH CATEGORIZATION TABS */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fp-text flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-fp-accent" /> Clause Vulnerability Taxonomy
          </h2>
          <p className="text-xs text-fp-muted mt-1">
            Browse established fine print traps by sector or search across all statutes.
          </p>
        </div>

        {/* Categorization Tabs: All, M&A, Employment, Consumer, Corporate/SEBI, Liability */}
        <div className="flex gap-2 border-b border-fp-border/70 pb-px overflow-x-auto">
          {TAB_CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryTab(tab.id)}
              className={clsx(
                'px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer flex flex-col text-left',
                activeCategoryTab === tab.id
                  ? 'border-fp-accent text-fp-accent bg-fp-accent/5 rounded-t-lg'
                  : 'border-transparent text-fp-muted hover:text-fp-text'
              )}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-normal text-fp-muted hidden sm:inline">
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Risk Severity Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-muted" />
            <input
              type="text"
              placeholder="Search clause name, description, red-flag phrases, or statutes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-fp-card border border-fp-border rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-fp-text placeholder:text-fp-muted focus:outline-none focus:border-fp-accent transition-colors"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={clsx(
                  'px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                  filterRisk === r
                    ? 'bg-fp-accent/20 border-fp-accent/50 text-fp-accent shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                    : 'border-fp-border text-fp-muted hover:border-fp-accent/30'
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-fp-muted font-mono">
          <span>
            Showing {filtered.length} patterns in{' '}
            <strong className="text-fp-text">
              {TAB_CATEGORIES.find((t) => t.id === activeCategoryTab)?.label}
            </strong>
          </span>
          {search && <span>Filtered by: "{search}"</span>}
        </div>

        {/* Entry List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-fp-accent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="card hover:border-fp-accent/40 transition-colors cursor-pointer"
                onClick={() => setExpanded(expanded === entry.name ? null : entry.name)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border font-mono',
                          riskBadgeClass[entry.risk_level] || riskBadgeClass.low
                        )}
                      >
                        {entry.risk_level}
                      </span>
                      <span className="text-xs text-fp-muted font-mono bg-fp-surface px-2 py-0.5 rounded border border-fp-border/50">
                        {entry.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-fp-text">{entry.name}</h3>
                    <p className="text-xs text-fp-muted mt-1 leading-relaxed line-clamp-2">
                      {entry.description}
                    </p>
                  </div>
                  <span className="text-fp-muted text-xs font-mono pt-1">
                    {expanded === entry.name ? '▲ Close' : '▼ Expand'}
                  </span>
                </div>

                <AnimatePresence>
                  {expanded === entry.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-fp-border/60 space-y-4"
                    >
                      {/* Plain English Translation */}
                      <div className="bg-fp-surface/70 border border-fp-border/60 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] font-semibold text-fp-accent uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-yellow-300" /> What It Actually Means
                        </span>
                        <p className="text-xs sm:text-sm text-fp-text leading-relaxed font-sans">
                          {entry.plain_english}
                        </p>
                      </div>

                      {/* Legal basis */}
                      <div className="flex items-start gap-2.5 bg-fp-bg/50 border border-fp-border/50 p-3 rounded-xl">
                        <Scale className="w-4 h-4 text-fp-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-semibold text-fp-muted uppercase tracking-wider font-mono block mb-0.5">
                            Legal Statutory Reference & Case Law
                          </span>
                          <p className="text-xs text-fp-muted leading-relaxed font-sans">
                            {entry.legal_basis}
                          </p>
                        </div>
                      </div>

                      {/* Mitigation */}
                      <div className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                        <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider font-mono block mb-0.5">
                            Recommended Redline & Negotiation Strategy
                          </span>
                          <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                            {entry.mitigation}
                          </p>
                        </div>
                      </div>

                      {/* Red flag phrases */}
                      <div>
                        <span className="text-[10px] font-semibold text-fp-muted uppercase tracking-wider font-mono block mb-2">
                          Red-Flag Phrases FP.ai Detects:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.red_flag_phrases.map((p) => (
                            <span
                              key={p}
                              className="text-xs bg-red-950/40 border border-red-800/40 text-red-300 rounded px-2 py-0.5 font-mono"
                            >
                              "{p}"
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-fp-muted text-sm card">
                <Search className="w-8 h-8 text-fp-muted mx-auto mb-2 opacity-40" />
                <p>No clause patterns found matching your search and category filter.</p>
                <button
                  onClick={() => {
                    setActiveCategoryTab('all')
                    setSearch('')
                    setFilterRisk('all')
                  }}
                  className="btn-ghost text-xs mt-3"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="glow-line" />
    </div>
  )
}
