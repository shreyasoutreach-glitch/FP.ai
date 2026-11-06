import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Loader2, AlertCircle, CheckCircle, X, Shield,
  Zap, Sparkles, FileCheck, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/utils/api'
import clsx from 'clsx'
import DemoContractsSelector from '@/components/DemoContractsSelector'
import { saveAnalysisResult } from '@/utils/analysisStore'
import { DEMO_CONTRACTS } from '@/data/demoContracts'

type Step = 'upload' | 'uploading' | 'analysing' | 'done' | 'error'

export default function AnalysisPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileText, setFileText] = useState<string>('')
  const [useGemini, setUseGemini] = useState(false)
  const [progress, setProgress] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    // If it's a text file, read the text for the interactive clause viewer
    if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFileText(e.target?.result as string || '')
      }
      reader.readAsText(selectedFile)
    } else {
      setFileText('')
    }
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) handleFileSelect(accepted[0])
  }, [handleFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0]?.message || 'File rejected'
      toast.error(err)
    },
  })

  const handleAnalyse = async () => {
    if (!file) return

    // Check if the uploaded file matches one of our demo contracts
    const matchedDemo = DEMO_CONTRACTS.find(
      (d) => d.filename.toLowerCase() === file.name.toLowerCase()
    )

    try {
      // 1. Upload
      setStep('uploading')
      setProgress('Uploading document to FP.ai engine…')
      const formData = new FormData()
      formData.append('file', file)

      let docId: string | null = null
      let analysisId: string | null = null

      try {
        const docRes = await api.post('/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        docId = docRes.data.id

        // 2. Analyse via backend
        setStep('analysing')
        setProgress(useGemini ? 'Running clause analysis and optional Gemini synthesis…' : 'Running clause analysis, pattern matching and document-relative anomaly detection…')
        const anaRes = await api.post('/api/analysis/run', {
          document_id: docId,
          use_gemini: useGemini,
        })
        analysisId = anaRes.data.analysis_id

        if (fileText && anaRes.data) {
          anaRes.data.document_text = fileText
          saveAnalysisResult(anaRes.data)
        }
      } catch (backendErr) {
        // Fallback for offline demo testing if backend is unreachable
        if (matchedDemo) {
          console.warn('Backend unavailable; using built-in high fidelity demo analysis', backendErr)
          await new Promise((res) => setTimeout(res, 1200)) // smooth simulated analysis
          analysisId = matchedDemo.analysisResult.analysis_id
          saveAnalysisResult(matchedDemo.analysisResult)
        } else {
          throw backendErr
        }
      }

      setStep('done')
      toast.success('Contract Vulnerability Analysis Complete!')
      navigate(`/results/${analysisId}`)
    } catch (err: unknown) {
      setStep('error')
      const msg =
        (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data
          ?.detail ||
        (err as Error)?.message ||
        'Failed to connect to FP.ai analysis server. Make sure backend is running.'
      setErrorMsg(msg)
      toast.error(`Analysis failed: ${msg}`)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setFileText('')
    setErrorMsg('')
    setProgress('')
  }

  const isLoading = step === 'uploading' || step === 'analysing'

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-fp-accent animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-fp-accent font-semibold">Contract Intake</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-fp-text">Analyse a Contract</h1>
          <p className="text-fp-muted text-sm mt-1">
            Upload your agreement or choose a pre-loaded sample. FP.ai exposes asymmetric clauses and fine-print traps.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-fp-muted bg-fp-surface border border-fp-border px-3 py-1.5 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-fp-accent" />
          <span>Backend-stored files · Delete after review</span>
        </div>
      </div>

      {/* Pre-Loaded Demo Contracts Section */}
      <div className="bg-gradient-to-r from-fp-card/90 via-fp-card to-fp-surface/90 border border-fp-border/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fp-accent/10 rounded-full blur-2xl pointer-events-none" />
        <DemoContractsSelector onSelectForUpload={handleFileSelect} showTitle={true} />
      </div>

      {/* Upload & Analysis Interface */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fp-muted font-mono flex items-center gap-2">
            <Upload className="w-4 h-4 text-fp-accent" /> Or Upload Your Own File
          </h2>
          <span className="text-xs text-fp-muted">PDF · DOCX · TXT</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card border-red-800/60 bg-red-950/20 text-center space-y-4 p-8"
            >
              <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-300 text-lg">Analysis Pipeline Interrupted</h3>
                <p className="text-xs text-fp-muted mt-1 max-w-md mx-auto">{errorMsg}</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button onClick={reset} className="btn-primary text-xs">
                  Try Again
                </button>
                <button
                  onClick={() => {
                    // Quick fallback to M&A demo if testing
                    navigate('/results/demo-ma-deal')
                  }}
                  className="btn-ghost text-xs"
                >
                  View Demo Analysis Instead
                </button>
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card text-center space-y-6 py-14 relative overflow-hidden border-fp-accent/50 shadow-[0_0_40px_rgba(37,99,235,0.15)]"
            >
              <div className="scanner-bar" />
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-fp-accent/10 border border-fp-accent/30 flex items-center justify-center mx-auto">
                  <Shield className="w-10 h-10 text-fp-accent animate-pulse" />
                </div>
                <Loader2 className="w-6 h-6 text-fp-accent-glow animate-spin absolute -bottom-2 right-1/2 translate-x-6" />
              </div>

              <div>
                <h3 className="font-bold text-lg text-fp-text">
                  {step === 'uploading' ? 'Ingesting Contract' : 'Running Fine Print Engine'}
                </h3>
                <p className="text-xs text-fp-muted mt-1.5 font-mono">{progress}</p>
              </div>

              <div className="flex justify-center flex-wrap gap-2 pt-2">
                {[
                  'Text Extraction',
                  'Clause Segmentation',
                  'Anomaly Detection',
                  'Legal pattern matching',
                  'Plain-English Synthesis',
                ].map((s, i) => (
                  <span
                    key={s}
                    className={clsx(
                      'text-[11px] px-3 py-1 rounded-full border transition-all',
                      step === 'analysing' && i <= 3
                        ? 'bg-fp-accent/20 border-fp-accent/50 text-fp-accent shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                        : 'border-fp-border/60 text-fp-muted bg-fp-surface/40'
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={clsx(
                  'card border-2 border-dashed cursor-pointer transition-all duration-200 text-center py-10 relative group',
                  isDragActive
                    ? 'border-fp-accent bg-fp-accent/15 scale-[1.01]'
                    : file
                    ? 'border-fp-accent/60 bg-fp-accent/5'
                    : 'border-fp-border hover:border-fp-accent/50 hover:bg-fp-surface/80'
                )}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center gap-4 px-4">
                    <div className="w-12 h-12 rounded-xl bg-fp-accent/20 border border-fp-accent/40 flex items-center justify-center text-fp-accent shrink-0">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-fp-text text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-3 text-xs text-fp-muted mt-0.5">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span className="text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Ready for Analysis
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        setFileText('')
                      }}
                      className="text-fp-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-950/30 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-fp-surface border border-fp-border flex items-center justify-center mx-auto mb-3 group-hover:border-fp-accent/50 transition-colors">
                      <Upload className="w-5 h-5 text-fp-muted group-hover:text-fp-accent transition-colors" />
                    </div>
                    <p className="font-semibold text-fp-text text-sm mb-1">
                      {isDragActive ? 'Drop file to ingest immediately' : 'Click to select or drag and drop your contract'}
                    </p>
                    <p className="text-xs text-fp-muted">PDF, DOCX, TXT (Maximum 50 MB)</p>
                  </>
                )}
              </div>

              {/* Options */}
              <div className="card space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-fp-muted font-mono">
                  Engine Configuration
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* AI toggle */}
                  <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-lg border border-fp-border/50 bg-fp-surface/30 hover:border-fp-accent/40 transition-colors">
                    <div
                      onClick={(e) => {
                        e.preventDefault()
                        setUseGemini(!useGemini)
                      }}
                      className={clsx(
                        'w-8 h-4.5 rounded-full transition-colors relative mt-0.5 shrink-0',
                        useGemini ? 'bg-fp-accent' : 'bg-fp-border'
                      )}
                    >
                      <span
                        className={clsx(
                          'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform',
                          useGemini ? 'translate-x-3.5' : 'translate-x-0.5'
                        )}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-fp-text flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-fp-accent" />
                        <span>Optional Gemini AI synthesis</span>
                      </div>
                      <p className="text-[11px] text-fp-muted mt-0.5">
                        Runs only when GEMINI_API_KEY is configured on the backend. Off by default.
                      </p>
                    </div>
                  </label>

                  <div className="p-2.5 rounded-lg border border-fp-border/50 bg-fp-surface/30">
                    <div className="text-xs font-semibold text-fp-text flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-fp-accent" />
                      <span>Legal context</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-fp-muted">
                      FP.ai surfaces potential clause issues. It does not yet apply jurisdiction-specific legal rules automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleAnalyse}
                disabled={!file}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(37,99,235,0.3)] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Run Complete Fine Print Analysis</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-fp-muted">
                <Info className="w-3 h-3" />
                <span>Uploaded files are stored by the backend for analysis. They are not used for live model training; delete documents after review.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
