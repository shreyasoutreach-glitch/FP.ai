import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, CheckCircle2, CircleHelp, FileSearch, Save, ShieldCheck, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/utils/api'

type Profile = 'employee' | 'freelancer' | 'founder' | 'tenant' | 'general'
type Status = 'potential_conflict' | 'needs_review' | 'evidence_found' | 'not_detected'

type Evidence = {
  category: string
  risk_level: string
  text: string
  start_char?: number | null
  end_char?: number | null
  conflict_terms: string[]
}

type Check = {
  priority_id: string
  title: string
  description: string
  status: Status
  summary: string
  question_to_raise: string
  evidence: Evidence[]
  evidence_count: number
}

type CheckResponse = {
  analysis_id: string
  contract_type: string
  checks: Check[]
  counts: Record<Status, number>
  disclaimer: string
}

const STORAGE_KEY = 'fpai-personal-deal-rulebook-v1'

const PRIORITIES = [
  { id: 'exit_flexibility', label: 'A workable exit', detail: 'Notice, lock-ins, early-exit charges and termination control' },
  { id: 'protect_existing_ip', label: 'Ownership of my work', detail: 'Pre-existing IP, side projects, inventions and work product' },
  { id: 'cap_liability', label: 'A ceiling on my liability', detail: 'Indemnities, damages, liability caps and financial exposure' },
  { id: 'payment_certainty', label: 'Payment certainty', detail: 'Fees, salary, payment triggers, approval and deductions' },
  { id: 'avoid_restrictive_covenants', label: 'Freedom to work with others', detail: 'Non-competes, non-solicits and exclusivity restrictions' },
  { id: 'control_renewal', label: 'Control over renewals', detail: 'Auto-renewals, notice windows and unilateral price changes' },
] as const

const PROFILE_DEFAULTS: Record<Profile, string[]> = {
  employee: ['exit_flexibility', 'protect_existing_ip', 'cap_liability', 'avoid_restrictive_covenants'],
  freelancer: ['payment_certainty', 'protect_existing_ip', 'cap_liability', 'exit_flexibility'],
  founder: ['protect_existing_ip', 'cap_liability', 'avoid_restrictive_covenants', 'control_renewal'],
  tenant: ['exit_flexibility', 'payment_certainty', 'control_renewal', 'cap_liability'],
  general: ['exit_flexibility', 'cap_liability', 'payment_certainty', 'control_renewal'],
}

const PROFILE_LABELS: Record<Profile, string> = {
  employee: 'Employee / job offer',
  freelancer: 'Freelancer / consultant',
  founder: 'Founder / business owner',
  tenant: 'Tenant / leaseholder',
  general: 'General / custom',
}

function inferProfile(contractType: string): Profile {
  const value = contractType.toLowerCase()
  if (value.includes('employment') || value.includes('offer letter')) return 'employee'
  if (value.includes('lease') || value.includes('tenancy')) return 'tenant'
  if (value.includes('consult') || value.includes('service')) return 'freelancer'
  if (value.includes('m&a') || value.includes('merger') || value.includes('acquisition')) return 'founder'
  return 'general'
}

function statusPresentation(status: Status) {
  switch (status) {
    case 'potential_conflict':
      return { label: 'Potential conflict', className: 'text-rose-300 bg-rose-950/40 border-rose-800/60', Icon: AlertTriangle }
    case 'needs_review':
      return { label: 'Needs closer review', className: 'text-amber-300 bg-amber-950/40 border-amber-800/60', Icon: CircleHelp }
    case 'evidence_found':
      return { label: 'Relevant wording found', className: 'text-cyan-300 bg-cyan-950/40 border-cyan-800/60', Icon: FileSearch }
    default:
      return { label: 'No match detected', className: 'text-slate-300 bg-slate-800/60 border-slate-700', Icon: CircleHelp }
  }
}

export default function DealRulebook({ analysisId, contractType }: { analysisId: string; contractType: string }) {
  const inferred = useMemo(() => inferProfile(contractType), [contractType])
  const [profile, setProfile] = useState<Profile>(inferred)
  const [priorityIds, setPriorityIds] = useState<string[]>(PROFILE_DEFAULTS[inferred])
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckResponse | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as { profile?: Profile; priorityIds?: string[] }
      if (parsed.profile && parsed.profile in PROFILE_DEFAULTS) {
        setProfile(parsed.profile)
        setPriorityIds(
          Array.isArray(parsed.priorityIds)
            ? parsed.priorityIds.filter((id) => PRIORITIES.some((item) => item.id === id))
            : PROFILE_DEFAULTS[parsed.profile]
        )
        setRemember(true)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const persist = (nextProfile: Profile, nextPriorities: string[], enabled = remember) => {
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: nextProfile, priorityIds: nextPriorities }))
    }
  }

  const chooseProfile = (nextProfile: Profile) => {
    const nextPriorities = PROFILE_DEFAULTS[nextProfile]
    setProfile(nextProfile)
    setPriorityIds(nextPriorities)
    setResult(null)
    persist(nextProfile, nextPriorities)
  }

  const togglePriority = (id: string) => {
    const next = priorityIds.includes(id)
      ? priorityIds.filter((item) => item !== id)
      : [...priorityIds, id]
    setPriorityIds(next)
    setResult(null)
    persist(profile, next)
  }

  const toggleRemember = (enabled: boolean) => {
    setRemember(enabled)
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, priorityIds }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const runCheck = async () => {
    if (!priorityIds.length) {
      toast.error('Choose at least one deal priority.')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const response = await api.post(`/api/analysis/${analysisId}/decision-check`, { priority_ids: priorityIds })
      setResult(response.data as CheckResponse)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Could not run your Deal Rulebook check.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="card border border-fp-accent/30 bg-gradient-to-br from-fp-card via-fp-surface/80 to-fp-card space-y-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-fp-accent/10 border border-fp-accent/30 p-3 text-fp-accent">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-fp-accent">
              <Sparkles className="w-3.5 h-3.5" /> Personalised contract decision layer
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-fp-text mt-1">Your Deal Rulebook</h2>
            <p className="text-sm text-fp-muted mt-1 leading-relaxed">
              A generic risk score cannot know what matters to you. Choose your non-negotiables and FP.ai will test this agreement against them, showing the exact extracted wording behind each result.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs text-fp-muted font-semibold mb-1.5">Start with the side you are on</span>
            <select
              value={profile}
              onChange={(event) => chooseProfile(event.target.value as Profile)}
              className="w-full rounded-lg border border-fp-border bg-fp-bg text-fp-text text-sm px-3 py-2.5 focus:outline-none focus:border-fp-accent"
            >
              {(Object.keys(PROFILE_LABELS) as Profile[]).map((key) => (
                <option key={key} value={key}>{PROFILE_LABELS[key]}</option>
              ))}
            </select>
          </label>
          <div className="text-[10px] text-fp-muted font-mono pb-1">{priorityIds.length} priorities selected</div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {PRIORITIES.map((item) => {
            const checked = priorityIds.includes(item.id)
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${checked ? 'border-fp-accent/60 bg-fp-accent/10' : 'border-fp-border bg-fp-bg/50 hover:border-fp-border/90'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePriority(item.id)}
                  className="mt-1 accent-cyan-400"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-fp-text">{item.label}</span>
                  <span className="block text-xs text-fp-muted mt-0.5 leading-relaxed">{item.detail}</span>
                </span>
              </label>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-fp-border/70 pt-4">
          <label className="inline-flex items-center gap-2 text-xs text-fp-muted cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(event) => toggleRemember(event.target.checked)} className="accent-cyan-400" />
            <Save className="w-3.5 h-3.5" /> Remember my rulebook on this device
          </label>
          <button
            type="button"
            onClick={runCheck}
            disabled={loading || priorityIds.length === 0}
            className="btn-primary px-4 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">◌</span> : <ShieldCheck className="w-4 h-4" />}
            {loading ? 'Checking your rules…' : 'Test this contract against my rules'}
          </button>
        </div>
        <p className="text-[11px] text-fp-muted">
          Your saved rulebook stays in this browser. The selected priority IDs are sent with this request; your contract is not added to a new training set by this feature.
        </p>
      </section>

      {result && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="card p-3"><div className="text-2xl font-black text-rose-300">{result.counts.potential_conflict || 0}</div><div className="text-[10px] text-fp-muted uppercase tracking-wider">Potential conflicts</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-amber-300">{result.counts.needs_review || 0}</div><div className="text-[10px] text-fp-muted uppercase tracking-wider">Need review</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-cyan-300">{result.counts.evidence_found || 0}</div><div className="text-[10px] text-fp-muted uppercase tracking-wider">Evidence found</div></div>
            <div className="card p-3"><div className="text-2xl font-black text-slate-300">{result.counts.not_detected || 0}</div><div className="text-[10px] text-fp-muted uppercase tracking-wider">No match detected</div></div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-base font-bold text-fp-text">How this agreement aligns with your rules</h3>
              <p className="text-xs text-fp-muted mt-1">Each result is tied to text extracted from this contract.</p>
            </div>
            <span className="text-[10px] text-fp-muted font-mono">{result.checks.length} personal rules tested</span>
          </div>

          <div className="space-y-3">
            {result.checks.map((check) => {
              const visual = statusPresentation(check.status)
              const Icon = visual.Icon
              return (
                <article key={check.priority_id} className="card space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-fp-text">{check.title}</h4>
                      <p className="text-xs text-fp-muted mt-1">{check.description}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${visual.className}`}>
                      <Icon className="w-3.5 h-3.5" /> {visual.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-fp-text/90">{check.summary}</p>

                  {check.evidence.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-fp-muted font-bold">Source wording found · {check.evidence_count} match(es)</div>
                      {check.evidence.map((item, index) => (
                        <blockquote key={`${check.priority_id}-${index}`} className="border-l-2 border-fp-accent/70 bg-fp-bg/70 rounded-r-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] uppercase text-fp-accent font-mono">{item.category.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-fp-muted">Screening: {item.risk_level}</span>
                          </div>
                          <p className="text-xs text-fp-text/90 leading-relaxed">{item.text}</p>
                        </blockquote>
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg border border-fp-accent/20 bg-fp-accent/5 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-fp-accent font-bold mb-1">Question to raise</div>
                    <p className="text-xs text-fp-text leading-relaxed">{check.question_to_raise}</p>
                  </div>
                </article>
              )
            })}
          </div>
          <p className="text-[11px] text-fp-muted leading-relaxed">{result.disclaimer}</p>
        </section>
      )}
    </div>
  )
}
