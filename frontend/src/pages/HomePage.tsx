import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Eye, FileSearch,
  FileText, Scale, ScanSearch, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import DemoContractsSelector from '@/components/DemoContractsSelector'

const stats = [
  { label: 'Clause patterns', value: '25+' },
  { label: 'Legal frameworks', value: '14' },
  { label: 'Risk categories', value: '18' },
  { label: 'Typical scan', value: 'Seconds' },
]

const features = [
  {
    icon: Eye,
    title: 'The clause you might miss',
    desc: 'Finds one-sided terms tucked into definitions, schedules and dense legal language, then brings the relevant wording into view.'
  },
  {
    icon: ScanSearch,
    title: 'More than keyword matching',
    desc: 'Statistical anomaly detection helps surface unusual clauses. Optional AI reasoning adds context where it is configured.'
  },
  {
    icon: Scale,
    title: 'Context that matters',
    desc: 'Review potential issues against relevant Indian and international legal frameworks, with jurisdiction kept in view.'
  },
  {
    icon: FileSearch,
    title: 'A useful next step',
    desc: 'Understand why a clause matters and review suggested questions or alternative wording before taking it to a lawyer.'
  },
]

const riskTypes = [
  'Uncapped liability',
  'One-sided termination',
  'Non-compete restrictions',
  'Automatic renewal',
  'IP ownership clauses',
  'Dispute resolution',
  'Training cost clawbacks',
  'Data-use permissions',
]

export default function HomePage() {
  return (
    <div className="space-y-20 sm:space-y-24">
      <section className="relative grid items-center gap-12 py-8 sm:py-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-900/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fp-border bg-fp-surface px-3 py-1.5 text-xs text-fp-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-fp-accent" />
            Contract review, made clearer
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-fp-text sm:text-6xl">
            The important part is often in the <span className="text-fp-accent">fine print.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-fp-muted sm:text-lg">
            FP.ai helps you spot unusual, one-sided and potentially risky terms before you sign. Upload an agreement, see the clauses that deserve a closer look, and understand why they matter.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/analysis" className="btn-primary inline-flex items-center gap-2">
              Review a contract <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/knowledge" className="btn-ghost inline-flex items-center gap-2">
              Explore the knowledge base
            </Link>
          </div>
          <p className="mt-5 text-xs text-fp-muted">
            PDF, DOCX and TXT · Informational review, not legal advice
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative"
          aria-label="Illustration showing how FP.ai highlights a risky contract clause and explains it"
        >
          <div className="absolute -inset-5 rounded-[2rem] bg-emerald-900/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-fp-border bg-[#101713] p-4 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-fp-accent">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Service_Agreement.pdf</p>
                  <p className="text-[11px] text-white/45">Illustrative contract excerpt</p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-800/70 bg-emerald-950/40 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                Review preview
              </span>
            </div>

            <div className="grid gap-4 pt-5 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-white/10 bg-[#f5f4ef] p-4 text-[#343a34] shadow-inner">
                <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#73796f]">Section 8 · Termination</span>
                  <span className="text-[9px] text-[#8a9087]">Page 12</span>
                </div>
                <p className="text-[11px] leading-5 text-[#73796f]">
                  8.1 Either party may terminate this Agreement by giving thirty (30) days’ written notice.
                </p>
                <div className="my-3 rounded-md border-l-[3px] border-[#a8bd9e] bg-[#e5ecdf] px-3 py-2.5">
                  <p className="text-[11px] leading-5 text-[#344332]">
                    8.2 The Company may, <span className="rounded-sm bg-[#c5d9b8] px-1 font-semibold text-[#263c2a]">at its sole discretion</span>, suspend the Services immediately without prior notice.
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#58734f]">
                    <ScanSearch className="h-3 w-3" /> Flagged for review
                  </div>
                </div>
                <p className="text-[11px] leading-5 text-[#73796f]">
                  8.3 Any outstanding fees shall remain payable following termination.
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-2 text-[9px] text-[#8a9087]">
                  <span>Agreement excerpt</span><span>12 / 24</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-emerald-900/70 bg-[#17251b] p-4">
                  <div className="mb-3 flex items-center gap-2 text-emerald-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Potential concern</span>
                  </div>
                  <p className="text-sm font-medium leading-5 text-white">Unilateral suspension right</p>
                  <p className="mt-2 text-[11px] leading-5 text-white/60">
                    The company can suspend service immediately, while the agreement does not show an equivalent right for you in this excerpt.
                  </p>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/40">Why it matters</p>
                    <p className="mt-1 text-[11px] leading-5 text-white/75">
                      You may lose access before having time to remedy a dispute or transition to another provider.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-fp-accent">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Suggested question</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-5 text-white/70">
                    Can suspension be limited to defined material breaches, with written notice and a reasonable cure period?
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10px] text-white/40">
              <span>Document → highlighted clause → plain-English context</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Example view</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-fp-border bg-fp-border sm:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="bg-fp-card px-4 py-5 text-center sm:py-6">
            <p className="text-2xl font-semibold tracking-tight text-fp-text sm:text-3xl">{item.value}</p>
            <p className="mt-1 text-xs text-fp-muted">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fp-accent">Try it with an example</p>
            <h2 className="text-2xl font-semibold tracking-tight text-fp-text sm:text-3xl">See what a closer read can uncover.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-fp-muted">Explore a sample agreement and its preloaded analysis without uploading your own document.</p>
          </div>
        </div>
        <DemoContractsSelector showTitle={true} />
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fp-accent">A clearer review process</p>
          <h2 className="text-2xl font-semibold tracking-tight text-fp-text sm:text-3xl">From dense language to decisions you can examine.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07 }}
              className="card flex gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-fp-border bg-fp-surface text-fp-accent">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 text-sm font-semibold text-fp-text">{feature.title}</h3>
                <p className="text-sm leading-6 text-fp-muted">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="mb-5 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-fp-accent">What to look for</p>
          <h2 className="text-xl font-semibold text-fp-text">Terms worth a second look.</h2>
          <p className="mt-2 text-sm leading-6 text-fp-muted">Examples of clause patterns the review experience is designed to help surface.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {riskTypes.map((item) => (
            <span key={item} className="rounded-full border border-fp-border bg-fp-surface px-3 py-1.5 text-xs text-fp-muted">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-fp-border bg-fp-card px-6 py-10 text-center sm:px-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-900/20 blur-3xl" />
        <ShieldCheck className="relative mx-auto mb-4 h-9 w-9 text-fp-accent" />
        <h2 className="relative text-2xl font-semibold tracking-tight text-fp-text sm:text-3xl">Know what you are agreeing to.</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-fp-muted">
          Give your next agreement a more careful read. FP.ai highlights issues to investigate; important decisions should still be reviewed with qualified legal counsel.
        </p>
        <Link to="/analysis" className="btn-primary relative mt-6 inline-flex items-center gap-2">
          Start a contract review <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  )
}
