import { motion } from 'framer-motion'
import { Shield, Zap, Eye, Scale, ArrowRight, AlertTriangle, FileCode2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import DemoContractsSelector from '@/components/DemoContractsSelector'

const stats = [
  { label: 'Clause Patterns', value: '25+' },
  { label: 'Legal Frameworks', value: '14' },
  { label: 'Risk Categories', value: '18' },
  { label: 'Detection Speed', value: '< 2.5s' },
]

const features = [
  {
    icon: Eye,
    title: 'Invisible Clause Detection',
    desc: 'Surfaces the clauses designed to be overlooked — hidden in definitions, buried in schedules, and shrouded in dense legalese.'
  },
  {
    icon: Zap,
    title: 'Unsupervised ML + Gemini Hybrid',
    desc: 'Combines statistical anomaly modeling with Google Gemini reasoning to pinpoint unconscionable covenants without relying on brittle regex alone.'
  },
  {
    icon: Scale,
    title: 'Indian & Global Statues Cross-Referenced',
    desc: 'Audited against Indian Contract Act 1872, SEBI ICDR regulations, DPDP Act 2023, EU GDPR, US FTC rules, and landmark common-law rulings.'
  },
  {
    icon: AlertTriangle,
    title: 'Plain-English Explanations & Counter-Proposals',
    desc: 'Every trap is translated into blunt, plain-English consequences and actionable renegotiation language you can paste directly into redlines.'
  },
]

const riskTypes = [
  { label: 'Non-Compete Traps (§27 ICA)', color: 'text-red-400 border-red-800/50 bg-red-950/30' },
  { label: 'Uncapped Consequential Damages', color: 'text-red-400 border-red-800/50 bg-red-950/30' },
  { label: 'Asymmetric Termination', color: 'text-red-400 border-red-800/50 bg-red-950/30' },
  { label: 'Arbitration Fee Frontloading', color: 'text-orange-400 border-orange-800/50 bg-orange-950/30' },
  { label: 'Training Bonds & Clawbacks', color: 'text-orange-400 border-orange-800/50 bg-orange-950/30' },
  { label: 'IP Personal Project Grabs', color: 'text-orange-400 border-orange-800/50 bg-orange-950/30' },
  { label: 'AI Model Training On Private Data', color: 'text-red-400 border-red-800/50 bg-red-950/30' },
  { label: 'Physical Certified Mail Auto-Renewals', color: 'text-yellow-400 border-yellow-800/50 bg-yellow-950/30' },
  { label: 'Unilateral SLA Modifications', color: 'text-orange-400 border-orange-800/50 bg-orange-950/30' },
  { label: 'Reverse Break-Up Omission (M&A)', color: 'text-red-400 border-red-800/50 bg-red-950/30' },
  { label: 'Subjective MAE Walkaway Rights', color: 'text-orange-400 border-orange-800/50 bg-orange-950/30' },
  { label: 'Remote Offshore Jurisdiction', color: 'text-yellow-400 border-yellow-800/50 bg-yellow-950/30' },
]

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 pb-4 relative overflow-hidden">
        {/* Ambient cyber glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-fp-accent/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Shield className="w-96 h-96 text-fp-accent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-fp-accent/15 border border-fp-accent/40 rounded-full px-4 py-1.5 text-xs text-fp-accent font-medium mb-6 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <span className="w-2 h-2 rounded-full bg-fp-accent animate-pulse" />
            <span>Autonomous Fine Print Vulnerability Engine</span>
            <span className="text-[10px] bg-fp-accent/30 text-white px-1.5 py-0.2 rounded font-mono">2026 Edition</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
            Read the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">Fine Print</span>
            <br />
            before it signs your future away.
          </h1>

          <p className="text-fp-muted text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            FP.ai dissects agreements for exploitative traps, asymmetric termination triggers,
            unlawful non-competes, and indemnification landmines — in seconds.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/analysis" className="btn-primary flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(37,99,235,0.35)]">
              <Shield className="w-4 h-4" /> Analyse Any Contract <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/knowledge" className="btn-ghost text-sm flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-fp-accent" /> Knowledge Base & Simulator
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card text-center border-fp-border/60 hover:border-fp-accent/40 transition-colors"
          >
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {s.value}
            </div>
            <div className="text-xs text-fp-muted font-medium mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Demo Contracts Shelf */}
      <section className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-fp-accent font-semibold">Instant Interactive Demos</span>
        </div>
        <DemoContractsSelector showTitle={true} />
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-fp-text">How FP.ai Defends You</h2>
          <p className="text-sm text-fp-muted max-w-xl mx-auto">
            Legal contracts are deliberately asymmetric. Our multi-agent neural pipeline levels the playing field.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card flex gap-4 hover:border-fp-accent/40 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-fp-accent/15 border border-fp-accent/30 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-fp-accent/25 transition-all">
                <f.icon className="w-5 h-5 text-fp-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-fp-text group-hover:text-blue-300 transition-colors">{f.title}</h3>
                <p className="text-sm text-fp-muted leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Risk Types Detected */}
      <section className="card border-fp-border/60">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1 text-fp-text">What We Uncover In Real Time</h2>
          <p className="text-fp-muted text-xs">
            Benchmarked against standard enterprise, high-growth startup, and consumer boilerplate.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {riskTypes.map((r) => (
            <span
              key={r.label}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all hover:scale-105 ${r.color}`}
            >
              {r.label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="card text-center border-fp-accent/40 bg-gradient-to-b from-fp-card to-fp-surface relative overflow-hidden p-8 sm:p-10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-fp-accent/10 rounded-full blur-3xl pointer-events-none" />
        <Shield className="w-12 h-12 text-fp-accent mx-auto mb-4 animate-pulse-slow" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Never sign another blind agreement.</h2>
        <p className="text-fp-muted text-sm mb-6 max-w-lg mx-auto leading-relaxed">
          Upload any contract in PDF, DOCX, or TXT format. FP.ai checks every line so you never surrender your rights in the fine print.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/analysis" className="btn-primary inline-flex items-center gap-2 text-sm shadow-[0_0_25px_rgba(37,99,235,0.4)]">
            <Zap className="w-4 h-4 text-yellow-300" /> Start Contract Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <div className="glow-line" />
    </div>
  )
}
