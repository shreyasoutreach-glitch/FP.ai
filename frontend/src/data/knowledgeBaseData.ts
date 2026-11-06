export interface KBEntry {
  name: string
  category: string
  risk_level: 'critical' | 'high' | 'medium' | 'low' | 'info'
  description: string
  legal_basis: string
  plain_english: string
  mitigation: string
  red_flag_phrases: string[]
}

export const FALLBACK_KNOWLEDGE_BASE: KBEntry[] = [
  {
    name: 'Asymmetric Termination for Convenience',
    category: 'termination',
    risk_level: 'critical',
    description: 'Allows one party (typically the enterprise or employer) to cancel at will on 3-7 days notice without cause, while locking the other party into rigid multi-year commitments.',
    legal_basis: 'Indian Contract Act §16 (undue influence); Consumer Protection Act 2019; UK Unfair Contract Terms Act 1977.',
    plain_english: 'They can fire you or drop the deal overnight with no penalty, but you are legally barred from quitting or canceling.',
    mitigation: 'Demand reciprocal notice periods (at least 60-90 days for both parties) or an early termination break-up fee.',
    red_flag_phrases: [
      'terminate for convenience',
      'terminate without cause',
      'at its sole discretion',
      'notice of 3 days',
      'without penalty',
      'sole right to terminate'
    ]
  },
  {
    name: 'Post-Employment Non-Compete Trap',
    category: 'non_compete',
    risk_level: 'critical',
    description: 'Bars former employees or contractors from working, consulting, or founding ventures in the same industry for 1-5 years post-exit.',
    legal_basis: 'Indian Contract Act 1872 Section 27 (every agreement restraining lawful profession/trade/business is void); Supreme Court in Percept D\'Mark v. Zaheer Khan.',
    plain_english: 'You are legally prohibited from practicing your craft or earning a living in your field after leaving this job.',
    mitigation: 'Delete entirely. In India, post-employment non-competes are completely void against public policy. Offer a narrow 6-month non-solicitation of active clients instead.',
    red_flag_phrases: [
      'for a period of 24 months',
      'for a period of 12 months',
      'directly or indirectly compete',
      'engage in any competing business',
      'anywhere in India',
      'post-termination restriction'
    ]
  },
  {
    name: 'Uncapped Consequential Damages & Lost Profits',
    category: 'liability',
    risk_level: 'critical',
    description: 'Strips standard liability caps and exposes the signing party to unlimited indirect, speculative, or third-party damages.',
    legal_basis: 'Indian Contract Act §73 (remote and indirect losses not recoverable); Hadley v. Baxendale doctrine.',
    plain_english: 'If anything goes wrong, you could be sued for millions in imaginary "lost profits" that exceed the total contract price.',
    mitigation: 'Strictly limit aggregate liability to the actual fees received in the preceding 12 months, and expressly exclude indirect, special, or consequential damages.',
    red_flag_phrases: [
      'without any cap',
      'consequential damages',
      'lost profits',
      'reputational harm',
      'unlimited liability',
      'jointly and severally liable'
    ]
  },
  {
    name: 'Predatory Employment Training Bond & Exit Penalty',
    category: 'penalty',
    risk_level: 'critical',
    description: 'Requires employee to pay large liquidated damages ($10,000 to $50,000) if they resign before 24-36 months of service.',
    legal_basis: 'Indian Contract Act §74 (court awards only reasonable compensation for actual proven damage); Madras HC in Toshniwal Bros.',
    plain_english: 'A financial hostage penalty designed to scare you away from resigning for a higher-paying job.',
    mitigation: 'Employers can only recoup actual documented third-party training tuition. Demand 12-month linear pro-rata amortization and exclude routine onboarding.',
    red_flag_phrases: [
      'training bond',
      'liquidated damages of',
      'reimburse company the sum of',
      'prior to 36 months',
      'repay onboarding costs'
    ]
  },
  {
    name: 'Perpetual Commercial AI Training on Customer Data',
    category: 'data_privacy',
    risk_level: 'critical',
    description: 'Grants the SaaS provider a perpetual royalty-free license to use all customer data, code, and queries to train public foundation models.',
    legal_basis: 'Digital Personal Data Protection (DPDP) Act 2023 (India); EU GDPR Article 5; US FTC Algorithmic Disgorgement rules.',
    plain_english: 'The vendor steals your proprietary customer data and prompts to improve their public AI without paying you a dime.',
    mitigation: 'Enforce Zero-Data Retention (ZDR) and append an enterprise Data Protection Agreement (DPA) explicitly prohibiting AI model weight training.',
    red_flag_phrases: [
      'perpetual, irrevocable license',
      'train foundation models',
      'neural network training',
      'incorporate customer data',
      'derivative commercial AI'
    ]
  },
  {
    name: 'Off-Duty & Weekend Personal IP Grab',
    category: 'ip_ownership',
    risk_level: 'high',
    description: 'Employer claims ownership of everything you invent or write on personal time, using personal equipment, even if completely unrelated to work.',
    legal_basis: 'Indian Copyright Act 1957 §17; California Labor Code §2870.',
    plain_english: 'The company claims they own your side projects, open-source repos, and weekend indie hacking.',
    mitigation: 'Incorporate a prior inventions carve-out schedule and explicitly exclude inventions created during non-working hours without company equipment.',
    red_flag_phrases: [
      'whether developed on company premises or not',
      'personal weekend hours',
      'all inventions conceived',
      'irrevocably assign all rights',
      'moral rights waiver'
    ]
  },
  {
    name: 'Physical Certified Mail Auto-Renewal Trap',
    category: 'auto_renewal',
    risk_level: 'high',
    description: 'Contract automatically renews for 12-24 months unless cancelled via physical certified mail in an artificially narrow time window.',
    legal_basis: 'FTC Click-to-Cancel Rule 2024; California Automatic Renewal Law (ARL); Indian Consumer Protection Act 2019.',
    plain_english: 'They make canceling intentionally impossible by forcing you to mail a paper letter 6 months ahead.',
    mitigation: 'Permit cancellation via email or web portal at any time with standard 30-day notice prior to renewal.',
    red_flag_phrases: [
      'automatically renew for successive',
      'certified physical registered mail',
      'email notice shall be null and void',
      '180 days prior to expiration'
    ]
  },
  {
    name: 'Unilateral Terms and SLA Modification',
    category: 'unilateral_modification',
    risk_level: 'high',
    description: 'Vendor reserves the right to amend pricing, service levels, or deprecate core features at any time without notification.',
    legal_basis: 'Indian Contract Act §2(a); Restatement (Second) of Contracts §205; CCPA Unfair Trade Practices.',
    plain_english: 'They can raise prices and remove features whenever they feel like it, and your only choice is to accept.',
    mitigation: 'Require at least 60 days advance written notification of material changes, and provide right to terminate with pro-rated refund.',
    red_flag_phrases: [
      'amend these terms at any time',
      'by posting revisions to its website',
      'continued access constitutes assent',
      'at our sole discretion'
    ]
  },
  {
    name: 'Offshore Forced Arbitration & Cost Frontloading',
    category: 'arbitration',
    risk_level: 'high',
    description: 'Forces disputes into foreign or offshore arbitration jurisdictions while making the individual/startup prepay 100% of tribunal retainer deposits.',
    legal_basis: 'Arbitration and Conciliation Act 1996 §31A; Consumer Protection Act 2019 §2(46).',
    plain_english: 'You have to pay hundreds of thousands of dollars to an offshore tribunal in Delaware or Cayman Islands just to have your claim heard.',
    mitigation: 'Choose neutral local courts or standard 50/50 cost sharing under standard institutional rules (e.g. MCIA, SIAC, or ICC).',
    red_flag_phrases: [
      'prepay 100% of arbitration fees',
      'exclusive jurisdiction in Delaware',
      'Cayman Islands arbitration',
      'class action waiver'
    ]
  },
  {
    name: 'Nominal ($100) Liability Cap for Data Breaches',
    category: 'limitation_of_liability',
    risk_level: 'high',
    description: 'Caps vendor payout at $100 even in events of catastrophic negligence, data destruction, or regulatory leaks.',
    legal_basis: 'Section 23 Indian Contract Act (agreements defeating provisions of law); DPDP Act 2023 §33.',
    plain_english: 'If the vendor leaks all your confidential corporate data, they pay you $100 and walk away.',
    mitigation: 'Ensure standard uncapped liability for gross negligence, willful misconduct, confidentiality breaches, and data privacy violations.',
    red_flag_phrases: [
      'aggregate liability shall not exceed $100',
      'one hundred dollars ($100.00)',
      'in no event shall provider be liable'
    ]
  },
  {
    name: 'Material Adverse Effect (MAE) Asymmetric Walkaway',
    category: 'change_of_control',
    risk_level: 'high',
    description: 'Allows an acquirer or enterprise buyer to walk away from a deal citing subjective market conditions with no breakup fee.',
    legal_basis: 'Delaware Court of Chancery MAE doctrines (Akorn v. Fresenius); SEBI (SAST) Regulations 2011.',
    plain_english: 'The buyer can cancel the deal at the 11th hour for subjective reasons with zero penalty.',
    mitigation: 'Require objective third-party quantifiable metrics for MAE, and enforce a 3-5% Reverse Break-Up Fee.',
    red_flag_phrases: [
      'material adverse effect in sole discretion',
      'terminate prior to closing without break-up fee',
      'market conditions constitute'
    ]
  },
  {
    name: 'One-Sided Uncapped Indemnification',
    category: 'indemnity',
    risk_level: 'high',
    description: 'Forces the signer to indemnify the enterprise counterparty against all third-party lawsuits and regulatory fines without reciprocity.',
    legal_basis: 'Indian Contract Act §124; Common law doctrine of unconscionability.',
    plain_english: 'If someone sues the platform, you have to pay all of their expensive lawyers and fines.',
    mitigation: 'Make indemnification strictly mutual and limited solely to direct third-party claims arising from proven willful breach.',
    red_flag_phrases: [
      'shall defend, indemnify, and hold harmless',
      'against all third-party claims',
      'without monetary limit',
      'regulatory penalties and legal costs'
    ]
  }
]
