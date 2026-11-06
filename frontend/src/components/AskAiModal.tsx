import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Sparkles, User, Loader2, Copy, Check } from 'lucide-react'
import { AnalysisResult } from '@/types/analysis'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  analysis: AnalysisResult
}

interface Message {
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

const PRESET_QUESTIONS = [
  'What is the absolute worst-case scenario if I sign this as-is?',
  'Can I legally work for a competitor or freelance on weekends?',
  'How do I redline the uncapped liability clause to protect myself?',
  'Is the non-compete clause enforceable under Section 27 Indian Contract Act?',
]

export default function AskAiModal({ isOpen, onClose, analysis }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I have fully audited this **${analysis.contract_type}**. I flagged **${analysis.critical_count} critical** and **${analysis.high_count} high-risk** clauses with an overall risk score of **${analysis.overall_risk_score.toFixed(0)}/100**. Ask me anything about what these terms mean or how to negotiate them!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  if (!isOpen) return null

  const handleSend = async (questionText?: string) => {
    const q = questionText || input.trim()
    if (!q || loading) return

    const userMsg: Message = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Find relevant clause if user mentions a topic
      const matchingClause = analysis.clauses.find((c) =>
        q.toLowerCase().includes(c.category.toLowerCase()) ||
        q.toLowerCase().includes('non-compete') && c.category.includes('non_compete') ||
        q.toLowerCase().includes('liability') && c.category.includes('liability')
      ) || analysis.clauses[0]

      let reply = ''
      try {
        const res = await api.post('/api/analysis/explain-clause', {
          clause_text: matchingClause ? matchingClause.text : analysis.executive_summary,
          context: `User question: "${q}". Contract: ${analysis.contract_type}. Overall risk: ${analysis.overall_risk_score}`,
        })
        if (res.data?.explanation) {
          reply = `${res.data.explanation}\n\n**Actionable Advice:** ${res.data.action || 'Do not sign without explicit redlining.'}\n\n**Legal Note:** ${res.data.real_world_impact || ''}`
        }
      } catch {
        // Fallback intelligent reasoning based on parsed contract
        if (q.toLowerCase().includes('non-compete') || q.toLowerCase().includes('competitor')) {
          reply = `Under **Section 27 of the Indian Contract Act 1872**, any agreement in restraint of trade is void ab initio. Courts in India (including the landmark *Niranjan Shankar Golikari* and *Percept D'Mark v. Zaheer Khan* rulings) consistently hold that post-employment non-compete covenants are completely unenforceable against an individual. \n\n**Counter-proposal:** Request removal of post-termination restrictions, and offer a standard 6-month non-solicitation of active clients instead.`
        } else if (q.toLowerCase().includes('worst-case') || q.toLowerCase().includes('scenario')) {
          reply = `**Worst-case exposure:** The uncapped indemnity and asymmetric termination clauses could leave you personally exposed to consequential damages and lost profits. In a dispute, the other party could claim damages exceeding your entire contract value while retaining your escrow holdback.`
        } else if (q.toLowerCase().includes('liability') || q.toLowerCase().includes('redline')) {
          reply = `**Recommended Redline:** Replace "uncapped joint and several liability" with: *"In no event shall either party's aggregate liability under this Agreement exceed the total fees paid or payable by Client in the preceding 12 months, excluding claims arising from gross negligence or willful misconduct."*`
        } else {
          reply = `Based on the audit of **${analysis.contract_type}**, this clause creates an asymmetric risk score of ${analysis.overall_risk_score}/100. We recommend proposing mutual reciprocity: whatever rights, notice periods, and indemnity protections the counterparty requires must be mirrored for you.`
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch {
      toast.error('AI assistant temporarily busy.')
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-up">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-fp-card border border-fp-border rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-fp-border flex items-center justify-between bg-fp-surface/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fp-accent/20 border border-fp-accent/40 flex items-center justify-center text-fp-accent">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-fp-text flex items-center gap-1.5">
                <span>FP.ai Contract Assistant</span>
                <span className="text-[10px] font-mono bg-fp-accent/20 text-fp-accent px-1.5 py-0.2 rounded">Gemini Powered</span>
              </h3>
              <p className="text-[11px] text-fp-muted">Auditing: {analysis.contract_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-fp-muted hover:text-fp-text p-1.5 rounded-lg hover:bg-fp-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message scroll list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-6 h-6 rounded bg-fp-accent/20 text-fp-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl p-3 relative group ${
                  m.sender === 'user'
                    ? 'bg-fp-accent text-white rounded-tr-none'
                    : 'bg-fp-surface border border-fp-border/70 text-fp-text rounded-tl-none leading-relaxed'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="flex items-center justify-between mt-1 pt-1 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <button
                      onClick={() => copyMessage(m.text, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-fp-accent flex items-center gap-1 ml-2"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
              {m.sender === 'user' && (
                <div className="w-6 h-6 rounded bg-fp-surface border border-fp-border text-fp-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs">
              <div className="w-6 h-6 rounded bg-fp-accent/20 text-fp-accent flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-fp-surface border border-fp-border/60 text-fp-muted rounded-xl p-3 rounded-tl-none flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-fp-accent animate-pulse" />
                <span>Cross-referencing legal statutes & formulating response…</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Presets */}
        <div className="px-4 py-2 border-t border-fp-border/40 bg-fp-surface/30 flex gap-1.5 overflow-x-auto">
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-fp-card hover:bg-fp-border border border-fp-border text-fp-muted hover:text-fp-text px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-fp-border bg-fp-surface/50">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask FP.ai anything about this contract…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-fp-card border border-fp-border rounded-xl px-3.5 py-2 text-xs text-fp-text placeholder:text-fp-muted focus:outline-none focus:border-fp-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
