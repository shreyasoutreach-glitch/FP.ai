import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LockKeyhole, Loader2 } from 'lucide-react'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import AnalysisPage from '@/pages/AnalysisPage'
import ResultsPage from '@/pages/ResultsPage'
import KnowledgePage from '@/pages/KnowledgePage'
import { api } from '@/utils/api'

function AccessGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'locked' | 'open'>('checking')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/api/auth/session').then(() => setStatus('open')).catch(() => setStatus('locked'))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/api/auth/login', { password })
      setStatus('open')
      setPassword('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'checking') return <div className="min-h-screen grid place-items-center bg-[#080d18] text-slate-300"><Loader2 className="animate-spin" /></div>
  if (status === 'locked') return (
    <main className="min-h-screen grid place-items-center bg-[#080d18] px-5 text-slate-100">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#101a2c] p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><LockKeyhole /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">FP.ai private workspace</p>
        <h1 className="mt-3 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Enter the workspace access password to continue.</p>
        <input autoFocus type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-6 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400" placeholder="Access password" />
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        <button disabled={busy || !password} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Unlock FP.ai</button>
      </form>
    </main>
  )
  return <>{children}</>
}

export default function App() {
  return (
    <AccessGate>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
        </Route>
      </Routes>
    </AccessGate>
  )
}
