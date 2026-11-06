import { AnalysisResult } from '@/types/analysis'
import { DEMO_CONTRACTS } from '@/data/demoContracts'

const STORAGE_PREFIX = 'fpai_analysis_'

export function saveAnalysisResult(result: AnalysisResult) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${result.analysis_id}`, JSON.stringify(result))
  } catch (e) {
    console.warn('Failed to save analysis to sessionStorage', e)
  }
}

export function getCachedAnalysisResult(id: string): AnalysisResult | null {
  // Check if it's a known demo contract
  const demo = DEMO_CONTRACTS.find(d => d.analysisResult.analysis_id === id || d.id === id)
  if (demo) {
    return demo.analysisResult
  }

  // Check sessionStorage
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`)
    if (raw) {
      return JSON.parse(raw) as AnalysisResult
    }
  } catch (e) {
    console.warn('Failed to read analysis from sessionStorage', e)
  }

  return null
}
