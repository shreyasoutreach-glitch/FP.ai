import { AnalysisResult } from '@/types/analysis'

export interface DemoContract {
  id: string
  title: string
  subtitle: string
  category: 'M&A' | 'Employment' | 'Consumer & SaaS'
  riskLevel: 'critical' | 'high' | 'medium'
  riskScore: number
  summary: string
  filename: string
  documentText: string
  keyTraps: string[]
  analysisResult: AnalysisResult
}

export const DEMO_CONTRACTS: DemoContract[] = [
  {
    id: 'ma-deal',
    title: 'Cross-Border Tech M&A Deal',
    subtitle: 'Asset Purchase & Reverse Merger Agreement',
    category: 'M&A',
    riskLevel: 'critical',
    riskScore: 84,
    summary: 'High-stakes acquisition agreement containing unilateral indemnity escrows, 5-year global non-compete, and asymmetric Material Adverse Effect termination triggers.',
    filename: 'CrossBorder_Tech_Acquisition_Agreement_2026.txt',
    keyTraps: [
      '5-Year Global Founder Non-Compete',
      'Uncapped Reps & Warranties Indemnity',
      'Asymmetric Termination for Convenience',
      'Mandatory Delaware Arbitration with Frontloaded Fees'
    ],
    documentText: `ASSET PURCHASE AND REVERSE MERGER AGREEMENT

THIS ASSET PURCHASE AND REVERSE MERGER AGREEMENT (this "Agreement") is dated as of February 14, 2026, by and between Apex Global Holdings Inc., a Delaware corporation ("Purchaser"), and Nexus Innovations Private Limited, a company incorporated under the laws of India ("Target" or "Company"), together with the Founder Shareholders listed on Schedule A hereto.

RECITALS
WHEREAS, Target owns proprietary machine learning architectures, customer goodwill, trade secrets, and ongoing contractual engagements; and
WHEREAS, Purchaser desires to purchase substantially all assets and liabilities of Target on the terms and subject to the conditions set forth herein.

SECTION 1: PURCHASE CONSIDERATION AND ESCROW HOLDBACK
1.1 Purchase Price. The aggregate purchase price payable by Purchaser shall be $42,000,000 (Forty-Two Million US Dollars), subject to post-closing working capital adjustments.
1.2 Indefinite Indemnity Holdback. Purchaser shall deduct and deposit $8,400,000 (20% of the Purchase Price) into an Escrow Account. The Escrow Amount shall be retained indefinitely until all representations, warranties, and potential third-party intellectual property claims have lapsed under the maximum statutory limitation periods of all applicable foreign jurisdictions.

SECTION 2: POST-CLOSING COVENANTS AND RESTRICTIVE COVENANTS
2.1 Non-Compete and Market Exclusion. Each Founder and Key Executive agrees that for a period of five (5) consecutive years following the Closing Date, they shall not, directly or indirectly, anywhere in the world, engage in, invest in, advise, consult for, or establish any business entity that develops, markets, or licenses software, models, or algorithms substantially similar to or competitive with the Business of the Purchaser.
2.2 Non-Solicitation of Personnel. For a period of thirty-six (36) months post-closing, the Founders shall not solicit, induce, or attempt to hire any existing or former employee, contractor, or commercial partner of Purchaser or Target.

SECTION 3: REPRESENTATIONS, WARRANTIES, AND UNILATERAL INDEMNIFICATION
3.1 Uncapped Liability for IP and Fundamental Representations. Notwithstanding any provision herein to the contrary, the Sellers and Founders shall jointly and severally indemnify, defend, and hold harmless Purchaser, its affiliates, directors, and successors against any and all losses, consequential damages, lost profits, reputational harm, and legal fees arising out of any breach of Section 4 (Intellectual Property) or Section 5 (Tax Compliance), without any cap, deductible, or monetary ceiling whatsoever.
3.2 Material Adverse Effect and Asymmetric Termination for Convenience. Purchaser may terminate this Agreement at any time prior to the Closing Date upon three (3) business days written notice without cause, liability, or break-up fee if Purchaser determines in its sole discretion that market conditions or regulatory sentiment constitutes a Material Adverse Effect. Conversely, Target and Sellers shall have no right of termination for convenience and must seek specific performance.

SECTION 4: INTELLECTUAL PROPERTY GRAB AND PRE-EXISTING WORK
4.1 Assignment of Past and Future Inventions. Target and each Founder hereby irrevocably grant, convey, and assign to Purchaser all worldwide rights, title, and interest in and to all intellectual property, including proprietary source code, foundation models, weights, training corpora, patents, and any open-source enhancements created by Founders within the twenty-four (24) months preceding the execution of this Agreement, whether or not related to Target's product suite.

SECTION 5: DISPUTE RESOLUTION AND GOVERNING LAW
5.1 Exclusive Delaware Jurisdiction & Arbitration Costs. This Agreement shall be governed by the laws of the State of Delaware, USA, without regard to conflict of law principles. Any dispute shall be resolved through confidential AAA arbitration in Wilmington, Delaware. The Founders agree to prepay 100% of the initial arbitrator deposit and hearing fees, recoverable solely upon rendering of an unappealable final arbitral award in their favor.`,
    analysisResult: {
      analysis_id: 'demo-ma-deal',
      document_id: 'doc-demo-ma-deal',
      contract_type: 'M&A Agreement (Cross-Border)',
      overall_risk_score: 84,
      overall_risk_rating: 'critical',
      critical_count: 3,
      high_count: 3,
      medium_count: 2,
      low_count: 1,
      total_clauses: 9,
      readability_score: 28,
      power_imbalance_score: 88,
      executive_summary: 'CRITICAL RISK: This M&A deal heavily favors the Purchaser. It strips Founders of competitive rights worldwide for 5 years, imposes uncapped joint-and-several liability without an indemnification ceiling, and grants the Purchaser asymmetric walk-away rights with no break-up fee.',
      document_text: '',
      processing_time_ms: 1240,
      status: 'completed',
      top_risks: [
        {
          title: '5-Year Worldwide Non-Compete Trap',
          severity: 'critical',
          explanation: 'Restricts founders from creating or advising any AI/software entity globally for 5 years. Under Indian Contract Act §27, post-employment/post-sale non-competes extending beyond reasonable local limits are frequently held void against public policy.',
          negotiation_tip: 'Cap the duration to 18-24 months, limit geographical scope strictly to Target’s actual current operating countries, and narrow definition of competitive business.'
        },
        {
          title: 'Uncapped Liability & Indefinite Escrow Holdback',
          severity: 'critical',
          explanation: 'Purchaser holds 20% of deal proceeds indefinitely, while exposing founders to personal uncapped damages for lost profits and third-party claims.',
          negotiation_tip: 'Insist on standard market escrow release schedule (12-18 months) and cap total indemnification at 10-15% of enterprise value with a basket/deductible.'
        },
        {
          title: 'Asymmetric Termination For Convenience',
          severity: 'high',
          explanation: 'Purchaser can walk away 3 days prior to closing with zero break-up fee citing subjective market conditions, while Sellers are legally locked in.',
          negotiation_tip: 'Introduce a reciprocal termination fee (Reverse Break-Up Fee of 3-5%) and require objective, mutually verifiable MAE standards.'
        }
      ],
      recommendations: [
        'Delete Section 1.2 indefinite escrow; replace with a 12-month release escrow capped at 10% of purchase price.',
        'Refuse uncapped indemnity for consequential damages or lost profits; cap indemnity strictly at escrow proceeds.',
        'Challenge Section 2.1 under Indian Contract Act §27; reduce restriction to 18 months in direct market segment.',
        'Add reciprocal break-up fee of $2,000,000 if Purchaser walks away without cause prior to closing.',
        'Insist on neutral dispute venue (e.g. Singapore SIAC) with shared upfront arbitrator costs.'
      ],
      gemini_analysis: {
        readability_assessment: {
          verdict: 'Very Hard (Grade 18+ Legalese)',
          explanation: 'Dense, convoluted legal phrasing intentionally written with nested provisos and cross-jurisdictional choice-of-law clauses designed to obscure liability allocation.'
        },
        jurisdiction_analysis: {
          governing_law: 'Delaware, USA (with Indian enforcement exposure)',
          india_specific: 'Clause 2.1 violates Indian Contract Act 1872 Section 27. Section 3.1 creates cross-border FEMA / RBI repatriation and indemnity cap hurdles under ODI/FDI guidelines.'
        },
        hidden_dangers: [
          'Founders could be personally bankrupted by third-party patent assertion entities under the uncapped Section 3.1.',
          'Escrow holdback of $8.4M has no statutory sunset date and can be locked indefinitely by Purchaser filing an unadjudicated claim.',
          'Open-source code previously authored by Founders prior to joining is swept into Section 4 assignment.'
        ],
        red_flags_summary: 'Extremely predatory terms shifted from standard M&A venture norms to oppressive buyer-controlled structure.',
        must_remove_clauses: [
          'Section 1.2 Indefinite Indemnity Holdback',
          'Section 3.1 Uncapped Liability for Consequential Damages & Lost Profits',
          'Section 5.1 Requirement for Founders to Prepay 100% of Arbitration Deposit'
        ]
      },
      clauses: [
        {
          text: 'The Escrow Amount shall be retained indefinitely until all representations, warranties, and potential third-party intellectual property claims have lapsed under the maximum statutory limitation periods of all applicable foreign jurisdictions.',
          category: 'liability',
          risk_level: 'critical',
          risk_score: 94,
          matched_pattern: 'Indefinite Escrow / Uncapped Holdback',
          plain_english: 'They are keeping 20% of your acquisition money ($8.4 Million) in an escrow account with no release date. They can hold it forever as long as someone somewhere could theoretically sue.',
          mitigation: 'Demand a fixed sunset release date: 50% released at 12 months, remaining released at 18 months post-closing.',
          legal_basis: 'Indian Contract Act §73; US UCC Article 2; standard NVCA / ABA Model M&A Agreement conventions.',
          anomaly_score: 0.89,
          is_anomaly: true,
          readability_score: 22,
          flags: ['retained indefinitely', 'maximum statutory limitation', 'all applicable foreign jurisdictions'],
          confidence: 0.96
        },
        {
          text: 'Each Founder and Key Executive agrees that for a period of five (5) consecutive years following the Closing Date, they shall not, directly or indirectly, anywhere in the world, engage in, invest in, advise, consult for, or establish any business entity that develops, markets, or licenses software, models, or algorithms substantially similar to or competitive with the Business of the Purchaser.',
          category: 'non_compete',
          risk_level: 'critical',
          risk_score: 96,
          matched_pattern: 'Extensive Post-Termination Non-Compete (5 Years Global)',
          plain_english: 'You are legally barred from working, consulting, investing, or creating any AI or software business anywhere on planet Earth for the next 5 years.',
          mitigation: 'Reduce time to 1-2 years maximum, specify strict product niche rather than "all algorithms", and limit geography to specific operating territories.',
          legal_basis: 'Indian Contract Act 1872 §27 (agreements in restraint of trade void); US FTC Non-Compete Rule 2024.',
          anomaly_score: 0.92,
          is_anomaly: true,
          readability_score: 25,
          flags: ['five (5) consecutive years', 'anywhere in the world', 'directly or indirectly', 'substantially similar'],
          confidence: 0.98
        },
        {
          text: 'the Sellers and Founders shall jointly and severally indemnify, defend, and hold harmless Purchaser, its affiliates, directors, and successors against any and all losses, consequential damages, lost profits, reputational harm, and legal fees arising out of any breach of Section 4 (Intellectual Property) or Section 5 (Tax Compliance), without any cap, deductible, or monetary ceiling whatsoever.',
          category: 'indemnity',
          risk_level: 'critical',
          risk_score: 95,
          matched_pattern: 'Uncapped Consequential Damages & Lost Profits',
          plain_english: 'If any IP or tax claim arises, you are personally liable for unlimited money — including their lost future profits and reputational damage — even if it exceeds the entire sale price of the company.',
          mitigation: 'Insert strict liability cap (e.g. 10% of received cash proceeds), exclude lost profits and consequential damages, and add a threshold basket.',
          legal_basis: 'Indian Contract Act §73 (remote/indirect damages not recoverable); Hadley v Baxendale doctrine.',
          anomaly_score: 0.88,
          is_anomaly: true,
          readability_score: 20,
          flags: ['jointly and severally', 'consequential damages', 'lost profits', 'reputational harm', 'without any cap'],
          confidence: 0.97
        },
        {
          text: 'Purchaser may terminate this Agreement at any time prior to the Closing Date upon three (3) business days written notice without cause, liability, or break-up fee if Purchaser determines in its sole discretion that market conditions or regulatory sentiment constitutes a Material Adverse Effect.',
          category: 'termination',
          risk_level: 'high',
          risk_score: 82,
          matched_pattern: 'Asymmetric Termination for Convenience with Sole Discretion MAE',
          plain_english: 'The buyer can pull out of the deal 3 days before closing for virtually any reason and pays you zero dollars, while you are legally prevented from shopping around.',
          mitigation: 'Require objective third-party MAE test, eliminate termination for convenience, and enforce reciprocal break-up fee.',
          legal_basis: 'Delaware Court of Chancery MAE standards (Akorn v. Fresenius); Indian Contract Act §56.',
          anomaly_score: 0.74,
          is_anomaly: false,
          readability_score: 34,
          flags: ['three (3) business days', 'without cause', 'sole discretion', 'without break-up fee'],
          confidence: 0.93
        },
        {
          text: 'Target and each Founder hereby irrevocably grant, convey, and assign to Purchaser all worldwide rights, title, and interest in and to all intellectual property, including proprietary source code, foundation models, weights, training corpora, patents, and any open-source enhancements created by Founders within the twenty-four (24) months preceding the execution of this Agreement',
          category: 'ip_ownership',
          risk_level: 'high',
          risk_score: 80,
          matched_pattern: 'Retroactive IP Grab & Open-Source Encroachment',
          plain_english: 'The buyer is taking ownership of code, model weights, and open-source contributions you created 2 years ago, even things built before this deal began.',
          mitigation: 'Specify that only Target company IP listed in Schedule B is assigned, and explicitly exclude all personal and open-source projects.',
          legal_basis: 'Copyright Act 1957 (India) §17–19; US Copyright Act 17 U.S.C. §201.',
          anomaly_score: 0.71,
          is_anomaly: false,
          readability_score: 31,
          flags: ['twenty-four (24) months preceding', 'open-source enhancements', 'all worldwide rights'],
          confidence: 0.91
        },
        {
          text: 'The Founders agree to prepay 100% of the initial arbitrator deposit and hearing fees, recoverable solely upon rendering of an unappealable final arbitral award in their favor.',
          category: 'arbitration',
          risk_level: 'high',
          risk_score: 76,
          matched_pattern: 'Asymmetric Fee Frontloading in Dispute Resolution',
          plain_english: 'If a dispute occurs, you have to pay hundreds of thousands of dollars in arbitrator fees upfront before you can even present your case in Delaware.',
          mitigation: 'Specify 50/50 split of institutional deposits or fee-shifting according to standard AAA / SIAC rules.',
          legal_basis: 'Arbitration and Conciliation Act 1996 §31A; US Federal Arbitration Act (FAA).',
          anomaly_score: 0.68,
          is_anomaly: false,
          readability_score: 38,
          flags: ['prepay 100%', 'arbitrator deposit', 'solely upon rendering'],
          confidence: 0.89
        },
        {
          text: 'For a period of thirty-six (36) months post-closing, the Founders shall not solicit, induce, or attempt to hire any existing or former employee, contractor, or commercial partner of Purchaser or Target.',
          category: 'non_compete',
          risk_level: 'medium',
          risk_score: 55,
          matched_pattern: 'Broad Non-Solicitation of Personnel and Partners',
          plain_english: 'You cannot hire or work with any past or present employees or commercial partners for 3 years.',
          mitigation: 'Reduce duration to 12 months and limit strictly to key management staff actively employed at closing.',
          legal_basis: 'Common law doctrine of restraint of trade; Indian Contract Act §27.',
          anomaly_score: 0.42,
          is_anomaly: false,
          readability_score: 45,
          flags: ['thirty-six (36) months', 'or former employee', 'commercial partner'],
          confidence: 0.88
        },
        {
          text: 'Target and Sellers shall have no right of termination for convenience and must seek specific performance.',
          category: 'termination',
          risk_level: 'medium',
          risk_score: 50,
          matched_pattern: 'Unilateral Waiver of Termination Rights',
          plain_english: 'Unlike the buyer, you are prohibited from walking away or cancelling the agreement under any circumstances.',
          mitigation: 'Include mutual termination rights upon buyer material breach or regulatory block.',
          legal_basis: 'Specific Relief Act 1963 §14; Indian Contract Act §39.',
          anomaly_score: 0.40,
          is_anomaly: false,
          readability_score: 48,
          flags: ['no right of termination', 'must seek specific performance'],
          confidence: 0.86
        },
        {
          text: 'The aggregate purchase price payable by Purchaser shall be $42,000,000 (Forty-Two Million US Dollars), subject to post-closing working capital adjustments.',
          category: 'salary_compensation',
          risk_level: 'low',
          risk_score: 18,
          matched_pattern: 'Standard Purchase Consideration Clause',
          plain_english: 'Defines the total nominal purchase price of $42M with standard post-closing working capital verification.',
          mitigation: 'Ensure working capital target peg is mutually audited before signing.',
          legal_basis: 'Standard commercial M&A drafting convention.',
          anomaly_score: 0.12,
          is_anomaly: false,
          readability_score: 62,
          flags: [],
          confidence: 0.95
        }
      ]
    }
  },
  {
    id: 'tech-employment',
    title: 'Tech Employment Agreement',
    subtitle: 'Senior AI Research Scientist Offer & Covenants',
    category: 'Employment',
    riskLevel: 'critical',
    riskScore: 79,
    summary: 'Standard-appearing senior tech employment agreement packing 24-month post-employment non-compete, $50,000 training bond trap, 24/7 on-call duty, and 100% intellectual property grab including weekend hobby projects.',
    filename: 'Senior_AI_Scientist_Employment_Agreement.txt',
    keyTraps: [
      '24-Month Post-Job Non-Compete ($100k Penalty)',
      '$50,000 Training Bond Liquidated Damages',
      'Weekend & Off-Duty IP Ownership Grab',
      'Asymmetric Notice: 3 Days for Company, 90 Days for Employee'
    ],
    documentText: `SENIOR AI RESEARCH SCIENTIST EMPLOYMENT AGREEMENT

This EMPLOYMENT AGREEMENT ("Agreement") is entered into as of January 10, 2026, by and between HyperScale Intelligence Corp. ("Employer" or "Company") and Dr. Jane Doe ("Employee").

1. DUTIES AND EXCLUSIVE SERVICE
1.1 Dedication of Effort. Employee agrees to devote their entire professional attention, skill, and energetic effort exclusively to Company business. Employee agrees to be available on-call twenty-four (24) hours per day, seven (7) days per week, as required by production AI incidents, without entitlement to overtime premiums or compensatory time off.
1.2 Secondary Engagements. Employee shall not undertake any secondary employment, academic lecturing, advisory, or advisory open-source contributions without prior written consent from the Chief Executive Officer.

2. INTELLECTUAL PROPERTY ASSIGNMENT
2.1 Comprehensive Inventions Assignment. Employee agrees that all inventions, models, algorithm weights, software architectures, patentable designs, written works, and proprietary methodologies conceived, reduced to practice, or contributed to by Employee during the entire term of employment—whether developed on Company premises, during personal weekend hours, utilizing personal devices, or completely unrelated to Company’s commercial roadmap—shall immediately and automatically become the sole, exclusive, and unencumbered property of Company.
2.2 Moral Rights Waiver. Employee irrevocably and perpetually waives any and all moral rights, attribution rights, or integrity rights granted under the Copyright Act of 1957 or any foreign statute.

3. POST-EMPLOYMENT RESTRICTIONS & NON-COMPETE
3.1 Post-Employment Non-Compete. For a period of twenty-four (24) months following cessation of employment for any reason whatsoever (whether voluntary or involuntary), Employee shall not directly or indirectly work for, consult with, advise, or participate in any organization or venture operating in the field of artificial intelligence, machine learning, or software systems.
3.2 Liquidated Damages for Breach. In the event Employee violates Section 3.1, Employee shall immediately pay Company liquidated damages equivalent to two hundred percent (200%) of Employee’s highest annual gross compensation.

4. COMPENSATION, BONUS CLAWBACK & TRAINING BOND
4.1 Discretionary Bonus Clawback. Any bonus awarded shall remain fully discretionary. Company reserves the unappealable right to claw back any bonus compensation distributed within the preceding thirty-six (36) months if Employee resigns before completing five (5) full years of service.
4.2 Mandatory Training Bond. In consideration of internal onboarding and GPU compute cluster orientation, Employee agrees that if employment terminates within thirty-six (36) months of the Start Date, Employee shall reimburse Company a non-negotiable sum of $50,000 as liquidated training and orientation costs.

5. TERMINATION AND NOTICE ASYMMETRY
5.1 Termination Notice. Company may terminate Employee’s engagement at any time upon three (3) calendar days prior written notice or pay in lieu thereof. In contrast, Employee must provide not less than ninety (90) calendar days prior written notice and may not buy out notice without Company’s express written consent.`,
    analysisResult: {
      analysis_id: 'demo-tech-employment',
      document_id: 'doc-demo-tech-employment',
      contract_type: 'Employment Agreement (Tech / AI)',
      overall_risk_score: 79,
      overall_risk_rating: 'critical',
      critical_count: 2,
      high_count: 3,
      medium_count: 2,
      low_count: 1,
      total_clauses: 8,
      readability_score: 41,
      power_imbalance_score: 91,
      executive_summary: 'CRITICAL RISK: Severe employment restrictions. The contract enforces an illegal post-employment non-compete, claims 100% ownership of your personal off-duty weekend code, imposes a $50k training bond, and creates an extreme 30:1 notice period asymmetry.',
      document_text: '',
      processing_time_ms: 980,
      status: 'completed',
      top_risks: [
        {
          title: 'Unlawful 24-Month Non-Compete with 200% Salary Penalty',
          severity: 'critical',
          explanation: 'Restricts you from working anywhere in AI/software for 2 years. In India, post-termination non-competes are completely void under Section 27 of Indian Contract Act 1872.',
          negotiation_tip: 'Strike out post-employment non-compete entirely. Offer non-solicitation of clients/team for 6 months instead.'
        },
        {
          title: '$50,000 Training Bond & 36-Month Clawback',
          severity: 'critical',
          explanation: 'Forces you to pay $50,000 if you leave within 3 years. Training bonds are enforceable in India only to the extent of actual, documented expenses incurred, not as punitive traps.',
          negotiation_tip: 'Eliminate training bond or limit to actual third-party tuition fees with pro-rated monthly amortization over maximum 12 months.'
        },
        {
          title: 'Weekend & Off-Duty Personal IP Grab',
          severity: 'high',
          explanation: 'Claims ownership over everything you create on personal computers during weekends, even unrelated to company products.',
          negotiation_tip: 'Add a standard California Labor Code §2870 exclusion clause protecting inventions created on your own time without company assets.'
        }
      ],
      recommendations: [
        'Delete Section 3.1 & 3.2: Non-compete after termination is unenforceable in Indian courts and banned in many US states.',
        'Delete Section 4.2 training bond or replace with actual expense reimbursement pro-rated over 12 months.',
        'Protect personal hobby projects and open source: introduce an Exhibit for Prior Inventions and off-hours carve-out.',
        'Equalize notice period: 30 days for both parties with option of pay-in-lieu.',
        'Cap working hours and eliminate uncompensated 24/7 on-call requirement.'
      ],
      gemini_analysis: {
        readability_assessment: {
          verdict: 'Difficult (Aggressive Corporate Legal Drafting)',
          explanation: 'Uses formal covenants and punitive liquidated damages clauses intended to intimidate employees into staying.'
        },
        jurisdiction_analysis: {
          governing_law: 'Employment Jurisdiction (India / Tech Hubs)',
          india_specific: 'Direct violation of Section 27 Indian Contract Act (Niranjan Shankar Golikari v. Century Spg; Percept D\'Mark v. Zaheer Khan). Section 74 bars unreasonable liquidated damages training penalties.'
        },
        hidden_dangers: [
          '36-month bonus clawback means the company can demand thousands of dollars back after you resign.',
          'Notice asymmetry allows company to fire you in 3 days, but locks you in for 3 months if you find a better opportunity.'
        ],
        red_flags_summary: 'Classic fine-print indenture agreement disguised as a modern AI research contract.',
        must_remove_clauses: [
          'Section 3.1 & 3.2 (24-Month Non-Compete & 200% Liquidated Damages)',
          'Section 4.2 ($50,000 Training Bond)'
        ]
      },
      clauses: [
        {
          text: 'For a period of twenty-four (24) months following cessation of employment for any reason whatsoever (whether voluntary or involuntary), Employee shall not directly or indirectly work for, consult with, advise, or participate in any organization or venture operating in the field of artificial intelligence, machine learning, or software systems.',
          category: 'non_compete',
          risk_level: 'critical',
          risk_score: 97,
          matched_pattern: 'Post-Employment Non-Compete Trap',
          plain_english: 'You are prohibited from taking any job or consulting gig in artificial intelligence or software for 2 full years after you leave.',
          mitigation: 'Remove post-employment restriction completely. Section 27 of Indian Contract Act renders this void.',
          legal_basis: 'Indian Contract Act 1872 §27; Supreme Court of India in Superintendence Co. v. Krishan Murgai.',
          anomaly_score: 0.94,
          is_anomaly: true,
          readability_score: 35,
          flags: ['twenty-four (24) months', 'for any reason whatsoever', 'directly or indirectly', 'artificial intelligence'],
          confidence: 0.99
        },
        {
          text: 'In consideration of internal onboarding and GPU compute cluster orientation, Employee agrees that if employment terminates within thirty-six (36) months of the Start Date, Employee shall reimburse Company a non-negotiable sum of $50,000 as liquidated training and orientation costs.',
          category: 'penalty',
          risk_level: 'critical',
          risk_score: 93,
          matched_pattern: 'Predatory Employment Training Bond',
          plain_english: 'If you quit or get laid off within 3 years, you owe the company $50,000 for standard company onboarding and GPU compute usage.',
          mitigation: 'Refuse training bonds for routine orientation. Legally, employers can only recover genuine out-of-pocket external training expenses.',
          legal_basis: 'Indian Contract Act 1872 §74; Madras High Court in Toshniwal Bros v. Eswarprasad.',
          anomaly_score: 0.91,
          is_anomaly: true,
          readability_score: 30,
          flags: ['thirty-six (36) months', 'non-negotiable sum of $50,000', 'liquidated training'],
          confidence: 0.97
        },
        {
          text: 'whether developed on Company premises, during personal weekend hours, utilizing personal devices, or completely unrelated to Company’s commercial roadmap—shall immediately and automatically become the sole, exclusive, and unencumbered property of Company.',
          category: 'ip_ownership',
          risk_level: 'high',
          risk_score: 85,
          matched_pattern: 'Overreaching Personal Inventions Assignment',
          plain_english: 'The company claims ownership of your personal weekend hobby projects and coding, even if built on your own laptop and unrelated to your job.',
          mitigation: 'Insert express carve-out for inventions created on personal time without company resources and unrelated to business.',
          legal_basis: 'Indian Copyright Act 1957 §17; California Labor Code §2870-2872.',
          anomaly_score: 0.82,
          is_anomaly: true,
          readability_score: 28,
          flags: ['personal weekend hours', 'personal devices', 'completely unrelated', 'sole, exclusive'],
          confidence: 0.94
        },
        {
          text: 'Company reserves the unappealable right to claw back any bonus compensation distributed within the preceding thirty-six (36) months if Employee resigns before completing five (5) full years of service.',
          category: 'salary_compensation',
          risk_level: 'high',
          risk_score: 81,
          matched_pattern: 'Extensive Discretionary Bonus Clawback',
          plain_english: 'If you leave before 5 years, the company can legally demand back 3 years worth of performance bonuses you already earned and paid taxes on.',
          mitigation: 'Limit clawbacks strictly to fraud or gross misconduct; bonuses once vested should be non-forfeitable.',
          legal_basis: 'Payment of Wages Act 1936; Fair Labor Standards Act doctrine.',
          anomaly_score: 0.76,
          is_anomaly: false,
          readability_score: 39,
          flags: ['claw back any bonus', 'preceding thirty-six (36) months', 'five (5) full years'],
          confidence: 0.92
        },
        {
          text: 'Company may terminate Employee’s engagement at any time upon three (3) calendar days prior written notice or pay in lieu thereof. In contrast, Employee must provide not less than ninety (90) calendar days prior written notice',
          category: 'termination',
          risk_level: 'high',
          risk_score: 78,
          matched_pattern: 'Extreme Notice Period Asymmetry (30:1 Ratio)',
          plain_english: 'The company can fire you with 3 days notice, but you are trapped for 3 months (90 days) if you want to leave.',
          mitigation: 'Negotiate mutual 30-day or 60-day notice period for both parties.',
          legal_basis: 'Principles of contract reciprocity; Industrial Disputes Act / Shops & Establishments Act.',
          anomaly_score: 0.70,
          is_anomaly: false,
          readability_score: 44,
          flags: ['three (3) calendar days', 'not less than ninety (90) calendar days'],
          confidence: 0.91
        },
        {
          text: 'Employee agrees to be available on-call twenty-four (24) hours per day, seven (7) days per week, as required by production AI incidents, without entitlement to overtime premiums or compensatory time off.',
          category: 'salary_compensation',
          risk_level: 'medium',
          risk_score: 60,
          matched_pattern: 'Uncompensated 24/7 Availability Demand',
          plain_english: 'You are expected to be on call 24 hours a day, 7 days a week, with zero extra overtime pay or compensatory off-days.',
          mitigation: 'Establish rotating on-call schedule and explicit overtime or on-call allowance stipend.',
          legal_basis: 'Factories Act 1948 / State Shops and Commercial Establishments Act maximum working hours provisions.',
          anomaly_score: 0.52,
          is_anomaly: false,
          readability_score: 46,
          flags: ['twenty-four (24) hours per day', 'seven (7) days per week', 'without entitlement to overtime'],
          confidence: 0.88
        },
        {
          text: 'Employee irrevocably and perpetually waives any and all moral rights, attribution rights, or integrity rights granted under the Copyright Act of 1957 or any foreign statute.',
          category: 'ip_ownership',
          risk_level: 'medium',
          risk_score: 48,
          matched_pattern: 'Moral Rights & Attribution Waiver',
          plain_english: 'You waive your right to be named as creator or author on research papers or patent applications.',
          mitigation: 'Reserve academic attribution and co-authorship rights on academic publications.',
          legal_basis: 'Indian Copyright Act 1957 §57 (special rights of author; non-waivability in certain jurisdictions).',
          anomaly_score: 0.35,
          is_anomaly: false,
          readability_score: 51,
          flags: ['perpetually waives', 'all moral rights', 'attribution rights'],
          confidence: 0.85
        },
        {
          text: 'Employee agrees to devote their entire professional attention, skill, and energetic effort exclusively to Company business.',
          category: 'confidentiality',
          risk_level: 'low',
          risk_score: 15,
          matched_pattern: 'Standard Full-Time Exclusivity Clause',
          plain_english: 'Standard obligation to dedicate working hours exclusively to your employer.',
          mitigation: 'Ensure academic and non-commercial hobby exceptions are noted.',
          legal_basis: 'Standard employment law convention.',
          anomaly_score: 0.10,
          is_anomaly: false,
          readability_score: 64,
          flags: [],
          confidence: 0.94
        }
      ]
    }
  },
  {
    id: 'saas-tos',
    title: 'Enterprise SaaS Terms of Service',
    subtitle: 'CloudScale AI Infrastructure Subscription Terms',
    category: 'Consumer & SaaS',
    riskLevel: 'high',
    riskScore: 73,
    summary: 'Enterprise cloud services agreement containing auto-renewal traps with 180-day certified mail notice requirement, automatic 25% annual price hike, perpetual license to train AI on customer confidential data, and a $100 liability cap.',
    filename: 'CloudScale_Enterprise_SaaS_Terms.txt',
    keyTraps: [
      'Perpetual License to Train AI on Customer Data',
      'Auto-Renewal with 180-Day Physical Certified Mail Clause',
      'Automatic Mandatory 25% Price Increase',
      '$100 Liability Cap vs Uncapped Customer Liability'
    ],
    documentText: `CLOUDSCALE ENTERPRISE SAAS MASTER SUBSCRIPTION AGREEMENT

EFFECTIVE DATE: MARCH 1, 2026
PLEASE READ CAREFULLY. BY CLICKING "ACCEPT", CONNECTING VIA API, OR ACCESSING THE SERVICES, CUSTOMER AGREES TO BE BOUND BY ALL TERMS SET FORTH HEREIN.

1. TERM, AUTOMATIC RENEWAL AND PRICE ESCALATION
1.1 Automatic Multi-Year Renewal. The initial subscription term shall be thirty-six (36) months. This Agreement shall automatically renew for successive twenty-four (24) month terms unless Customer delivers written notice of non-renewal via certified physical registered mail postmarked exactly between one-hundred-eighty (180) and two-hundred-ten (210) calendar days prior to the expiration of the then-current term. Notice by email or support ticket shall be strictly null and void.
1.2 Mandatory Fee Escalation. Upon each automatic renewal, the fees payable by Customer shall automatically increase by twenty-five percent (25%) over the rates in effect immediately prior to such renewal, without need for prior notice.

2. CUSTOMER DATA, TELEMETRY AND MODEL TRAINING RIGHTS
2.1 AI Training License on Customer Corpora. Customer grants Provider a worldwide, perpetual, irrevocable, royalty-free, transferable license to ingest, store, tokenize, analyze, and incorporate Customer Data, proprietary datasets, and API query payloads into Provider’s proprietary foundation models, public neural networks, and derivative commercial AI offerings.
2.2 Telemetry and Feedback Ownership. All telemetry, embeddings, weights, and model enhancements derived from Customer’s usage shall be the exclusive intellectual property of Provider.

3. LIMITATION OF LIABILITY AND INDEMNIFICATION ASYMMETRY
3.1 Absolute Limitation of Provider Liability. IN NO EVENT SHALL PROVIDER’S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EXCEED THE TOTAL AMOUNT OF ONE HUNDRED DOLLARS ($100.00 USD), EVEN IF PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SERVICE OUTAGES OR COMPLETE DATA DESTRUCTION.
3.2 Customer Uncapped Indemnity. Customer shall defend, indemnify, and hold harmless Provider and its affiliates against all third-party claims, regulatory penalties, data privacy fines, and legal costs arising from Customer’s utilization of the platform without monetary limit.

4. UNILATERAL MODIFICATION AND JURISDICTION
4.1 Unilateral Changes to Terms and SLAs. Provider may amend these Terms, operational SLAs, or deprecate core functionalities at any time by posting revisions to its public website. Customer’s continued access constitutes irrevocable assent.
4.2 Class Action Waiver and Remote Arbitration. Any dispute shall be settled by binding arbitration conducted under the rules of the Cayman Islands International Arbitration Centre. Customer expressly waives any right to participate in class actions or representative proceedings.`,
    analysisResult: {
      analysis_id: 'demo-saas-tos',
      document_id: 'doc-demo-saas-tos',
      contract_type: 'SaaS Agreement (Terms of Service)',
      overall_risk_score: 73,
      overall_risk_rating: 'high',
      critical_count: 1,
      high_count: 4,
      medium_count: 2,
      low_count: 0,
      total_clauses: 7,
      readability_score: 36,
      power_imbalance_score: 86,
      executive_summary: 'HIGH RISK: Severe enterprise trap terms. CloudScale grants itself the right to train public AI models on your private customer data, locks you into auto-renewals requiring physical certified mail 6 months ahead, imposes 25% price spikes, and caps its liability at $100.',
      document_text: '',
      processing_time_ms: 890,
      status: 'completed',
      top_risks: [
        {
          title: 'Perpetual AI Model Training License on Customer Data',
          severity: 'critical',
          explanation: 'Gives the vendor an irrevocable worldwide license to use your private data and API queries to train their commercial AI models. Violates enterprise GDPR, DPDP Act 2023, and confidential IP policies.',
          negotiation_tip: 'Demand zero-data retention (ZDR) and express guarantee that Customer Data shall never be used for training model weights.'
        },
        {
          title: '180-Day Physical Certified Mail Auto-Renewal Trap',
          severity: 'high',
          explanation: 'Requires you to send a physical paper letter via certified mail between 180 and 210 days in advance to cancel, invalidating email notices.',
          negotiation_tip: 'Change to standard 30-day notice via email or within the account admin portal.'
        },
        {
          title: '$100 Liability Cap vs Uncapped Customer Liability',
          severity: 'high',
          explanation: 'If the vendor leaks or deletes all your data, they pay a maximum of $100. Meanwhile, your indemnity to them is completely uncapped.',
          negotiation_tip: 'Establish mutual liability cap tied to 12 months fees paid, with standard carve-outs for data breaches and confidentiality.'
        }
      ],
      recommendations: [
        'Strike Section 2.1: Insist on strict Data Processing Addendum (DPA) explicitly prohibiting AI model training on customer data.',
        'Amend Section 1.1: Replace physical certified mail with 30-day email notification before renewal.',
        'Cap price escalation in Section 1.2 to CPI inflation or maximum 3-5% annually.',
        'Equalize liability: mutual cap equal to 12 months fees paid under the contract.',
        'Remove Cayman Islands arbitration; choose local neutral jurisdiction (e.g. New York, London, or Mumbai).'
      ],
      gemini_analysis: {
        readability_assessment: {
          verdict: 'Standard ToS Boilerplate with Hidden Exploitative Burdens',
          explanation: 'Standard corporate SaaS formatting masking predatory IP licenses and difficult opt-out mechanics.'
        },
        jurisdiction_analysis: {
          governing_law: 'Cayman Islands International Arbitration Centre',
          india_specific: 'Violates Section 23 of Indian Contract Act (unconscionable liability limitation). Section 43A Information Technology Act & Digital Personal Data Protection Act (DPDP) 2023 impose statutory data fiduciary duties that cannot be disclaimed for $100.'
        },
        hidden_dangers: [
          'Confidential trade secrets or end-user PII sent via API becomes part of public AI training weights.',
          'Missing a 30-day window 6 months before expiry locks your company into an extra 2-year contract with a 25% price increase.'
        ],
        red_flags_summary: 'Asymmetric vendor-dictated contract designed to capture corporate data and lock in multi-year revenue.',
        must_remove_clauses: [
          'Section 2.1 (Perpetual AI Model Training License)',
          'Section 3.1 ($100.00 USD Absolute Limitation of Liability)'
        ]
      },
      clauses: [
        {
          text: 'Customer grants Provider a worldwide, perpetual, irrevocable, royalty-free, transferable license to ingest, store, tokenize, analyze, and incorporate Customer Data, proprietary datasets, and API query payloads into Provider’s proprietary foundation models, public neural networks, and derivative commercial AI offerings.',
          category: 'data_privacy',
          risk_level: 'critical',
          risk_score: 96,
          matched_pattern: 'Perpetual Commercial AI Training on Customer Data',
          plain_english: 'The provider has full legal permission to take your confidential business data and use it forever to train their public AI models.',
          mitigation: 'Demand an enterprise Data Protection Agreement (DPA) specifying Customer Data is never used for model training or retained beyond processing.',
          legal_basis: 'DPDP Act 2023 (India) §6; EU GDPR Article 5; FTC Algorithmic Disgorgement precedents.',
          anomaly_score: 0.95,
          is_anomaly: true,
          readability_score: 29,
          flags: ['worldwide, perpetual, irrevocable', 'Customer Data', 'foundation models', 'public neural networks'],
          confidence: 0.98
        },
        {
          text: 'This Agreement shall automatically renew for successive twenty-four (24) month terms unless Customer delivers written notice of non-renewal via certified physical registered mail postmarked exactly between one-hundred-eighty (180) and two-hundred-ten (210) calendar days prior to the expiration of the then-current term. Notice by email or support ticket shall be strictly null and void.',
          category: 'auto_renewal',
          risk_level: 'high',
          risk_score: 87,
          matched_pattern: 'Predatory Auto-Renewal via Physical Mail Window',
          plain_english: 'To cancel, you must mail an actual physical letter in a narrow 30-day window 6 months ahead of time. Email cancellation is deemed completely invalid.',
          mitigation: 'Require simple 30-day email or in-app dashboard cancellation option.',
          legal_basis: 'US FTC Click-to-Cancel Rule 2024; California Auto-Renewal Law (ARL).',
          anomaly_score: 0.86,
          is_anomaly: true,
          readability_score: 32,
          flags: ['successive twenty-four (24) month terms', 'certified physical registered mail', 'email or support ticket shall be strictly null and void'],
          confidence: 0.95
        },
        {
          text: 'IN NO EVENT SHALL PROVIDER’S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EXCEED THE TOTAL AMOUNT OF ONE HUNDRED DOLLARS ($100.00 USD)',
          category: 'limitation_of_liability',
          risk_level: 'high',
          risk_score: 84,
          matched_pattern: 'Nominal ($100) Liability Cap',
          plain_english: 'If the vendor destroys all your data or has a catastrophic security leak, their maximum legal payout to you is exactly $100.',
          mitigation: 'Set liability cap equal to 12 months fees paid, and remove caps for data breaches and confidentiality breaches.',
          legal_basis: 'Indian Contract Act §73; UK Unfair Contract Terms Act 1977 §2.',
          anomaly_score: 0.82,
          is_anomaly: true,
          readability_score: 35,
          flags: ['IN NO EVENT', 'EXCEED THE TOTAL AMOUNT OF ONE HUNDRED DOLLARS ($100.00 USD)'],
          confidence: 0.96
        },
        {
          text: 'Upon each automatic renewal, the fees payable by Customer shall automatically increase by twenty-five percent (25%) over the rates in effect immediately prior to such renewal, without need for prior notice.',
          category: 'salary_compensation',
          risk_level: 'high',
          risk_score: 79,
          matched_pattern: 'Automatic 25% Renewal Price Spike',
          plain_english: 'Every time the contract auto-renews, your subscription price automatically jumps by 25% with no warning required.',
          mitigation: 'Cap annual price increases at 3-5% or tied directly to national consumer price inflation indices.',
          legal_basis: 'Unfair contract terms regulations; Consumer Protection Act 2019.',
          anomaly_score: 0.74,
          is_anomaly: false,
          readability_score: 41,
          flags: ['automatically increase by twenty-five percent (25%)', 'without need for prior notice'],
          confidence: 0.92
        },
        {
          text: 'Provider may amend these Terms, operational SLAs, or deprecate core functionalities at any time by posting revisions to its public website. Customer’s continued access constitutes irrevocable assent.',
          category: 'unilateral_modification',
          risk_level: 'high',
          risk_score: 75,
          matched_pattern: 'Unilateral Modification Without Notification',
          plain_english: 'The vendor can change prices, service level agreements, or cancel key features whenever they feel like it by updating their website.',
          mitigation: 'Require at least 60 days advance written email notice for material changes, with customer right to terminate without penalty.',
          legal_basis: 'Restatement of Consumer Contracts §3; Central Consumer Protection Authority guidelines.',
          anomaly_score: 0.70,
          is_anomaly: false,
          readability_score: 45,
          flags: ['amend these Terms', 'at any time', 'irrevocable assent'],
          confidence: 0.90
        },
        {
          text: 'Customer shall defend, indemnify, and hold harmless Provider and its affiliates against all third-party claims, regulatory penalties, data privacy fines, and legal costs arising from Customer’s utilization of the platform without monetary limit.',
          category: 'indemnity',
          risk_level: 'medium',
          risk_score: 58,
          matched_pattern: 'One-Sided Uncapped Customer Indemnity',
          plain_english: 'You must pay all legal fees and regulatory fines for the vendor if a third party complains, with no financial limit.',
          mitigation: 'Make indemnity mutual and limit strictly to customer breach of confidentiality or IP infringement.',
          legal_basis: 'Commercial indemnity doctrines; Indian Contract Act §124.',
          anomaly_score: 0.49,
          is_anomaly: false,
          readability_score: 42,
          flags: ['without monetary limit', 'regulatory penalties', 'data privacy fines'],
          confidence: 0.88
        },
        {
          text: 'Any dispute shall be settled by binding arbitration conducted under the rules of the Cayman Islands International Arbitration Centre. Customer expressly waives any right to participate in class actions or representative proceedings.',
          category: 'arbitration',
          risk_level: 'medium',
          risk_score: 54,
          matched_pattern: 'Offshore Arbitration & Class Action Waiver',
          plain_english: 'You give up your right to join a class action and must travel to the Cayman Islands to arbitrate any commercial disagreement.',
          mitigation: 'Change venue to local state or national commercial courts.',
          legal_basis: 'Consumer Protection Act 2019 §2(46); US FAA Section 2.',
          anomaly_score: 0.45,
          is_anomaly: false,
          readability_score: 49,
          flags: ['Cayman Islands', 'binding arbitration', 'waives any right to participate in class actions'],
          confidence: 0.89
        }
      ]
    }
  }
]

// Attach document_text into analysisResult for convenient split-view
DEMO_CONTRACTS.forEach(dc => {
  dc.analysisResult.document_text = dc.documentText
})

export function getDemoContract(id: string): DemoContract | undefined {
  return DEMO_CONTRACTS.find(c => c.id === id)
}
