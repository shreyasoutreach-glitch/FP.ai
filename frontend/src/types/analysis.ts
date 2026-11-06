export interface Clause {
  text: string
  start_char?: number
  end_char?: number
  category: string
  risk_level: string
  risk_score: number
  matched_pattern: string | null
  plain_english: string
  mitigation: string
  legal_basis: string
  anomaly_score: number
  is_anomaly: boolean
  readability_score: number
  flags: string[]
  /** @deprecated Retained only for older precomputed demo fixtures. */
  confidence?: number
  match_strength?: number
  risk_score_breakdown?: {
    base_score: number
    anomaly_boost: number
    readability_penalty: number
    red_flag_boost: number
    total: number
  }
}

export interface GeminiAnalysis {
  readability_assessment?: {
    verdict?: string
    explanation?: string
  }
  jurisdiction_analysis?: {
    governing_law?: string
    india_specific?: string | boolean
  }
  hidden_dangers?: string[]
  red_flags_summary?: string
  must_remove_clauses?: string[]
  executive_summary?: string
  recommendations?: string[]
  top_risks?: Array<Record<string, string>>
  power_imbalance_score?: number
}

export interface AnalysisResult {
  analysis_id: string
  document_id: string
  contract_type: string
  overall_risk_score: number
  overall_risk_rating: string
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  total_clauses: number
  readability_score: number
  power_imbalance_score: number
  executive_summary: string
  clauses: Clause[]
  gemini_analysis: GeminiAnalysis | Record<string, unknown>
  recommendations: string[]
  top_risks: Array<{
    title?: string
    severity?: string
    explanation?: string
    negotiation_tip?: string
    [key: string]: string | undefined
  }>
  processing_time_ms: number
  status: string
  document_text?: string
}
