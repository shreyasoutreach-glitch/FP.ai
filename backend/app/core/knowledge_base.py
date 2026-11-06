"""
FP.ai Clause Knowledge Base — World-Class Legal Intelligence Repository
Curated from:
  - Indian Contract Act 1872 (Sections 10, 16, 23, 27, 28, 73, 74, 124, 125)
  - SEBI (SAST) Takeover Regulations 2011 & SEBI LODR 2015
  - Companies Act 2013 (Sections 184, 186, 188, 230-232)
  - Competition Act 2002 & Competition (Amendment) Act 2023 (Deal Value Thresholds)
  - Digital Personal Data Protection Act 2023 (DPDP Act) & IT Act 2000
  - POSH Act 2013 (Sexual Harassment of Women at Workplace Act)
  - Notorious Historical Fine Print & Tort Scandals (Disney+ Piccolo 2024, Enron SPEs,
    WeWork DVRs, Infosys/NITES non-competes, BYJU'S/EdTech training bonds,
    FTC zombie subscriptions & negative option dark patterns)
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class RiskLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ClauseCategory(str, Enum):
    TERMINATION = "termination"
    LIABILITY = "liability"
    INDEMNITY = "indemnity"
    NON_COMPETE = "non_compete"
    ARBITRATION = "arbitration"
    IP_OWNERSHIP = "ip_ownership"
    SALARY_COMPENSATION = "salary_compensation"
    CHANGE_OF_CONTROL = "change_of_control"
    UNILATERAL_MODIFICATION = "unilateral_modification"
    DATA_PRIVACY = "data_privacy"
    GOVERNING_LAW = "governing_law"
    LIMITATION_OF_LIABILITY = "limitation_of_liability"
    AUTO_RENEWAL = "auto_renewal"
    CONFIDENTIALITY = "confidentiality"
    FORCE_MAJEURE = "force_majeure"
    PENALTY = "penalty"
    ASSIGNMENT = "assignment"
    WAIVER = "waiver"
    REGULATORY_COMPLIANCE = "regulatory_compliance"
    RELATED_PARTY = "related_party"
    COMPETITION_ANTITRUST = "competition_antitrust"
    GOVERNANCE_CONTROL = "governance_control"
    INDETERMINATE = "indeterminate"


@dataclass
class ClausePattern:
    category: ClauseCategory
    risk_level: RiskLevel
    name: str
    description: str
    legal_basis: str          # Statute / case precedent reference
    red_flag_phrases: List[str] = field(default_factory=list)
    plain_english: str = ""   # Plain English layman translation
    mitigation: str = ""      # Tactical negotiation advice / remedies
    historical_precedent: str = ""  # Case study or scandal reference


CLAUSE_KNOWLEDGE_BASE: List[ClausePattern] = [

    # ══════════════════════════════════════════════════════════════════════════
    # 1. NOTORIOUS HISTORICAL SCANDALS & PRECEDENT CASES
    # ══════════════════════════════════════════════════════════════════════════

    # Disney+ Arbitration Piccolo Case (2024)
    ClausePattern(
        category=ClauseCategory.ARBITRATION,
        risk_level=RiskLevel.CRITICAL,
        name="Cross-Service Forced Arbitration (Disney+ Piccolo Doctrine)",
        description=(
            "A predatory arbitration clause that purports to bind users and their estates "
            "across all unrelated corporate subsidiaries, theme parks, and physical establishments "
            "forever, stemming from a completely separate trial subscription or online sign-up."
        ),
        legal_basis=(
            "Piccolo v. Great Irish Pubs Florida, Inc. & Walt Disney Parks (2024); "
            "Federal Arbitration Act 9 U.S.C. § 2 (unconscionability defense); "
            "Indian Consumer Protection Act 2019 §2(46); Indian Contract Act §23"
        ),
        red_flag_phrases=[
            "disney terms of use",
            "disney+",
            "trial subscription",
            "all disputes arising out of or related to",
            "any affiliate or subsidiary",
            "including bodily injury and wrongful death",
            "binding on heirs, executors, administrators",
            "waive right to jury trial for any claim against",
            "past, present and future disputes across all services",
            "unrelated premises or affiliates",
            "solely through individual arbitration",
        ],
        plain_english=(
            "Signing up for a streaming trial or app account is weaponized to strip your right "
            "to sue in court if you or your loved ones suffer wrongful death or injury at one of "
            "their physical venues or unrelated businesses years later."
        ),
        mitigation=(
            "Insert explicit carve-outs: 'Arbitration shall strictly apply only to contractual "
            "disputes under this specific digital service and shall never apply to personal injury, "
            "wrongful death, or tort claims occurring at physical premises or unrelated subsidiaries.'"
        ),
        historical_precedent=(
            "Disney attempted to block a widower's wrongful death lawsuit in 2024 after his wife died "
            "from an allergic reaction at a Disney Springs restaurant, arguing a 2019 1-month Disney+ trial "
            "mandated arbitration for all future disputes against any Disney affiliate."
        ),
    ),

    # Infosys / Indian IT 6-Month Non-Compete Controversy
    ClausePattern(
        category=ClauseCategory.NON_COMPETE,
        risk_level=RiskLevel.CRITICAL,
        name="Post-Termination Non-Compete & Restraint of Trade (Section 27 ICA)",
        description=(
            "Prohibits departing software engineers or IT staff from accepting employment with "
            "competitors (e.g. TCS, Infosys, Wipro, Cognizant, HCL, Accenture) or working "
            "for any customer/client the employee serviced within 6–12 months post-exit. "
            "Post-termination non-competes are completely VOID under Section 27 of the Indian Contract Act."
        ),
        legal_basis=(
            "Section 27, Indian Contract Act 1872; "
            "Superintendence Company of India v. Krishan Murgai [AIR 1980 SC 1717]; "
            "Percept D'Mark (India) Pvt. Ltd. v. Zaheer Khan [2006 4 SCC 227]; "
            "Ministry of Labour & Employment / NITES Advisory (2022)"
        ),
        red_flag_phrases=[
            "non-compete",
            "not compete",
            "covenant not to compete",
            "shall not engage in any business",
            "shall not accept employment with any competitor",
            "for a period of 6 months following cessation",
            "following termination",
            "post-employment",
            "post-termination",
            "named competitors",
            "tcs, infosys, wipro, cognizant, hcl",
            "same client or customer",
            "customer serviced during the preceding 12 months",
            "restraint on future employment",
            "prohibited from joining competitors",
            "directly or indirectly provide services to any competitor",
            "post-employment restriction for six months",
            "shall not join",
            "shall not work for any competitor",
        ],
        plain_english=(
            "They claim you cannot join other tech companies or work with similar clients for 6 months "
            "after leaving. In India, any post-employment restriction on your right to practice your profession "
            "is legally void and unenforceable under Section 27 of the Contract Act."
        ),
        mitigation=(
            "Remind HR that post-termination non-compete covenants are void ab initio under Section 27 "
            "of the Indian Contract Act 1872 as confirmed by the Supreme Court. Request full deletion "
            "or replacement with narrow non-solicitation of active proprietary trade secrets."
        ),
        historical_precedent=(
            "Infosys and top Indian IT firms faced intense scrutiny in 2022 after inserting clauses "
            "barring staff from joining TCS, Wipro, Cognizant, HCL, or Accenture to service the same clients "
            "for 6 months post-exit, triggering Ministry of Labour notices."
        ),
    ),

    # Founder Global Non-Compete & Lock-In Trap (M&A Restraint)
    ClausePattern(
        category=ClauseCategory.NON_COMPETE,
        risk_level=RiskLevel.HIGH,
        name="Founder Global Non-Compete & Lock-In Trap (M&A Restraint)",
        description=(
            "Forces founders and selling shareholders in an M&A transaction to agree to multi-year, "
            "worldwide non-compete covenants covering any business segment currently or prospectively "
            "contemplated by the acquirer. While Section 27 Exception 1 permits reasonable goodwill non-competes, "
            "unlimited global scope or perpetual durations are treated as unreasonable restraints."
        ),
        legal_basis=(
            "Section 27 Exception 1, Indian Contract Act 1872 (Sale of Goodwill); "
            "Niranjan Shankar Golikari v. Century Spg. & Mfg. Co. [1967 SC]; "
            "Percept D'Mark v. Zaheer Khan [2006 SC]"
        ),
        red_flag_phrases=[
            "founder global non-compete",
            "founder lock-in",
            "covenants that they shall not, directly or indirectly",
            "shall not, directly or indirectly, anywhere in the world",
            "anywhere in the world",
            "invest in, advise, or join",
            "prospectively contemplated by the purchaser",
            "founding shareholder covenants",
            "for a period of five (5) years",
            "worldwide covenant not to compete",
            "founder non-compete",
            "restraint of trade",
        ],
        plain_english=(
            "The buyer wants to ban the founders from working, advising, or starting any tech company "
            "anywhere in the world for 5+ years, even in future hypothetical fields the buyer might enter."
        ),
        mitigation=(
            "Limit non-compete strictly to the exact core product line of the Target at closing, "
            "cap duration to a reasonable market period (e.g. 18-24 months), and restrict geography to specific active markets."
        ),
        historical_precedent=(
            "Indian courts uphold sale of goodwill non-competes under Exception 1 to Section 27 only if "
            "reasonable in duration, territory, and product scope; worldwide or overly speculative bans are routinely struck down."
        ),
    ),

    # BYJU'S / EdTech / IT Service Bond & Liquidated Damages Trap
    ClausePattern(
        category=ClauseCategory.PENALTY,
        risk_level=RiskLevel.CRITICAL,
        name="Service Bond & Training Cost Liquidated Damages Trap (Section 74 ICA)",
        description=(
            "Forces employees, sales associates, or trainees to sign a mandatory service bond (1–3 years) "
            "backed by exorbitant liquidated damages (₹2,00,000 to ₹5,00,000+) or salary forfeiture for early "
            "resignation, falsely labelled as training cost reimbursement without proof of actual expenses."
        ),
        legal_basis=(
            "Section 74, Indian Contract Act 1872 (compensation for breach where penalty stipulated); "
            "Fateh Chand v. Balkishan Dass [1964 1 SCR 515]; "
            "Kailash Nath Associates v. DDA [(2015) 4 SCC 136]; "
            "Sicpa India Ltd. v. Manas Pratim Deb [2012 Del HC]"
        ),
        red_flag_phrases=[
            "service bond",
            "training cost recovery",
            "liquidated damages of rs",
            "serve a minimum period of",
            "bond period of",
            "repay training expenses",
            "penalty for early exit",
            "pay rupees 2,00,000",
            "pay rupees 5,00,000",
            "forfeit security deposit",
            "reimburse onboarding expenses",
            "indemnity bond of rs",
            "withholding of experience letter",
        ],
        plain_english=(
            "If you quit before their lock-in period (e.g. 1 or 2 years), they demand you pay hundreds "
            "of thousands of rupees for 'training'. Under Indian law, companies cannot impose arbitrary penalties; "
            "they can only claim actual, reasonable, documented expenses incurred specifically on you."
        ),
        mitigation=(
            "Section 74 ICA permits only reasonable compensation for proven actual losses, never in terrorem "
            "punitive bonds. Demand proof of third-party external training costs, ensure proration over time, "
            "and eliminate any retention of educational certificates or experience letters."
        ),
        historical_precedent=(
            "EdTech giant BYJU'S and several IT body-shops faced widespread labour complaints for enforcing "
            "onerous employment bonds of ₹2-3 Lakhs on entry-level Business Development Associates (BDAs) "
            "who resigned during toxic sales sprints."
        ),
    ),

    # Enron Off-Balance-Sheet SPE Indemnity Trap
    ClausePattern(
        category=ClauseCategory.INDEMNITY,
        risk_level=RiskLevel.CRITICAL,
        name="Off-Balance Sheet SPE / Shadow Guarantee Indemnity (Enron SPE Trap)",
        description=(
            "Hidden covenants indemnifying special purpose entities (SPEs/SPVs), off-balance-sheet vehicles, "
            "or executive-controlled partnerships against debt defaults, asset devaluations, or financing shortfalls, "
            "obscuring actual corporate liabilities from balance sheets and due diligence."
        ),
        legal_basis=(
            "Sarbanes-Oxley Act 2002 §401(a) (Disclosures in periodic reports of off-balance sheet arrangements); "
            "Companies Act 2013 §186 (Loans and investments by company); "
            "SEBI (LODR) Regulations 2015 Reg. 23 & Reg. 30; "
            "Indian Accounting Standard Ind AS 110 / Ind AS 112"
        ),
        red_flag_phrases=[
            "special purpose entity",
            "off-balance sheet",
            "spe indemnity",
            "shadow guarantee",
            "make-whole guarantee for affiliate debt",
            "synthetic lease obligation",
            "indemnify the general partner",
            "undisclosed debt obligation",
            "special purpose vehicle liabilities",
            "defend and indemnify financing vehicle",
            "keep-well agreement",
            "deficiency guarantee for spv",
        ],
        plain_english=(
            "The company is secretly promising to pay all the debts and losses of a separate shell company "
            "or partnership. If that entity fails, catastrophic debt floods onto the parent company without "
            "warning to investors, buyers, or executives."
        ),
        mitigation=(
            "Conduct forensic review of all SPVs, side letters, and off-balance sheet commitments. "
            "Mandate full disclosure in financial statements under Ind AS 110/112 and require board/audit "
            "committee approval for all corporate guarantees under Section 186 of Companies Act 2013."
        ),
        historical_precedent=(
            "Enron hid billions of dollars in toxic debts inside off-balance-sheet SPEs (Chewco, LJM, Raptors) "
            "backed by secret Enron stock indemnities and guarantees, triggering the largest corporate collapse in US history."
        ),
    ),

    # WeWork Founder Super-Voting & Golden Handcuffs Trap
    ClausePattern(
        category=ClauseCategory.GOVERNANCE_CONTROL,
        risk_level=RiskLevel.CRITICAL,
        name="Founder Super-Voting Rights & Asymmetric Golden Handcuffs (WeWork Trap)",
        description=(
            "Multi-class equity structure granting founders 10:1 or 20:1 super-voting rights, vetoes over M&A, "
            "and massive golden handcuff buyouts or consulting fees upon change of control, leaving minority "
            "common shareholders and employees completely unprotected and diluted."
        ),
        legal_basis=(
            "Companies Act 2013 §43 (Differential Voting Rights); "
            "SEBI Circular on Framework for Issuance of Differential Voting Rights Shares (2019); "
            "Delaware General Corporation Law (DGCL) §212; "
            "Fiduciary Duty of Controlling Shareholders (Weinberger v. UOP, Inc.)"
        ),
        red_flag_phrases=[
            "super-voting shares",
            "20 votes per share",
            "10 votes per share",
            "class b common stock voting rights",
            "founder buyout package",
            "golden handcuffs",
            "consulting fee upon change of control",
            "founder consent required for merger",
            "disproportionate liquidation preference",
            "founder extraction upon exit",
            "irrevocable proxy to founder",
            "unilateral board removal power",
        ],
        plain_english=(
            "The founder holds all the real voting power (e.g. 20 votes per share) and has guaranteed themselves "
            "a multi-million exit payout or consulting contract even if the company fails, while common employees "
            "and investors absorb all losses."
        ),
        mitigation=(
            "Sunset super-voting rights upon departure, disability, or acquisition. Ensure tag-along and equal "
            "per-share consideration for all equity holders on exit without carve-out consulting packages for founders."
        ),
        historical_precedent=(
            "WeWork founder Adam Neumann held 20:1 super-voting Class B shares and extracted a $1.7 billion "
            "exit package (including a $185 million consulting fee) from SoftBank while thousands of employees "
            "saw their stock options wiped out."
        ),
    ),

    # ══════════════════════════════════════════════════════════════════════════
    # 2. STATUTORY REGULATIONS & REGULATORY TRAPS
    # ══════════════════════════════════════════════════════════════════════════

    # SEBI SAST Takeover Regulations 2011 Trigger Threshold Trap
    ClausePattern(
        category=ClauseCategory.CHANGE_OF_CONTROL,
        risk_level=RiskLevel.CRITICAL,
        name="SEBI SAST Mandatory Open Offer Trigger (Takeover Threshold Trap)",
        description=(
            "M&A or investment agreement granting voting rights, call options, affirmative voting covenants, "
            "tag/drag along rights, or board nomination rights that cross the 25% threshold or confer 'control' "
            "under SEBI SAST Regulations, inadvertently triggering a mandatory public tender offer for 26% shares."
        ),
        legal_basis=(
            "SEBI (Substantial Acquisition of Shares and Takeovers) Regulations 2011 (Reg. 3(1), Reg. 4, Reg. 10); "
            "SEBI v. Subhkam Ventures (I) Private Limited [2011]; "
            "Jet Airways - Etihad SEBI Takeover Order (2014); "
            "Securities Contracts (Regulation) Act 1956"
        ),
        red_flag_phrases=[
            "sebi sast",
            "substantial acquisition of shares",
            "mandatory open offer",
            "25% voting rights",
            "acquisition of control",
            "drag-along triggering open offer",
            "call option for majority stake",
            "right to appoint majority of directors",
            "negative control veto rights",
            "tender offer for 26%",
            "takeover regulations trigger",
            "creeping acquisition limit",
        ],
        plain_english=(
            "If an investor acquires 25% voting power or contractual rights to control board decisions or key operations "
            "of a listed Indian company, Indian securities law forces them to spend massive capital making a cash tender "
            "offer to buy another 26% of the company from the public."
        ),
        mitigation=(
            "Carefully structure covenants, negative vetoes, and call options so they do not constitute de facto 'control' "
            "under Regulation 4 of SEBI SAST. Cap combined direct and indirect voting entitlement below 24.99%."
        ),
        historical_precedent=(
            "SEBI scrutinized the Jet-Etihad transaction and Subhkam Ventures deal over whether negative protective "
            "veto covenants constituted acquisition of 'control' triggering mandatory open offers."
        ),
    ),

    # Companies Act 2013 Section 188 Related Party Transaction Trap
    ClausePattern(
        category=ClauseCategory.RELATED_PARTY,
        risk_level=RiskLevel.CRITICAL,
        name="Undisclosed Related Party Transaction & Section 188 Compliance Trap",
        description=(
            "Contract entered into with a related party (entity where a director, promoter, or key manager has an "
            "interest) without prior Audit Committee approval, Board resolution, or shareholder approval under Section 188. "
            "Renders the contract voidable at the company's option and imposes severe penalties and director disqualification."
        ),
        legal_basis=(
            "Section 188 & Section 184, Companies Act 2013; "
            "Rule 15, Companies (Meetings of Board and its Powers) Rules 2014; "
            "SEBI (LODR) Regulations 2015 Reg. 23; "
            "Section 164(2) Companies Act 2013 (Director Disqualification)"
        ),
        red_flag_phrases=[
            "related party transaction",
            "section 188",
            "section 188 of the companies act",
            "section 188 companies act",
            "related party",
            "related party asset",
            "interested director",
            "audit committee approval",
            "audit committee review",
            "audit committee",
            "contract with affiliate of director",
            "promoter-owned entity",
            "arm's length transaction waiver",
            "voidable at the option of the company",
            "director conflict of interest",
            "material related party contract",
            "disqualification of directors",
            "special shareholder resolution under section 188",
        ],
        plain_english=(
            "If a company signs a deal with a firm owned by a director or their family without formal audit committee "
            "and shareholder approvals, the entire deal can be declared void, and directors can be disqualified or fined."
        ),
        mitigation=(
            "Require explicit representation and warranty that the contract is entered on an arm's length basis in the "
            "ordinary course of business, supported by transfer pricing benchmark and Audit Committee pre-approval."
        ),
        historical_precedent=(
            "Dozens of Indian listed companies have faced SEBI forensic audits and MCA show-cause notices for routing "
            "funds to promoter-controlled shell vendors without Section 188 and LODR Reg 23 approvals."
        ),
    ),

    # Competition Act 2002 / Deal Value Threshold (DVT ₹2000 Cr) M&A Trap
    ClausePattern(
        category=ClauseCategory.COMPETITION_ANTITRUST,
        risk_level=RiskLevel.CRITICAL,
        name="Competition Act Deal Value Threshold (DVT ₹2000 Cr) Gun-Jumping Trap",
        description=(
            "M&A transaction exceeding the Deal Value Threshold (DVT) of ₹2,000 Crore (~$240M) where the target enterprise "
            "has Substantial Business Operations (SBO) in India, closing without prior merger clearance from the "
            "Competition Commission of India (CCI), triggering severe gun-jumping penalties under Section 43A."
        ),
        legal_basis=(
            "Competition Act 2002 §5(d) (Deal Value Threshold) & §6 (Regulation of Combinations); "
            "Competition (Amendment) Act 2023; "
            "Competition Act 2002 §43A (Penalty for failure to give notice — up to 1% of total turnover/assets); "
            "CCI (Combinations) Regulations 2024"
        ),
        red_flag_phrases=[
            "deal value threshold",
            "dvt of rs. 2,000 crore",
            "competition commission of india",
            "cci approval condition precedent",
            "gun-jumping penalty",
            "substantial business operations in india",
            "section 5 competition act",
            "merger clearance requirement",
            "closing prior to antitrust approval",
            "statutory waiting period under cci",
            "standstill obligation pending cci clearance",
        ],
        plain_english=(
            "If an acquisition deal is valued at ₹2,000 Crore or more and the target does substantial business in India "
            "(even digital/data businesses with low physical assets), closing the deal before CCI approves it is illegal "
            "gun-jumping that triggers fines up to 1% of global turnover."
        ),
        mitigation=(
            "Include mandatory Condition Precedent (CP) prohibiting closing or sharing competitively sensitive info until "
            "unconditional CCI approval is secured or the statutory 150-day clock expires."
        ),
        historical_precedent=(
            "CCI introduced the ₹2,000 Cr DVT rule under the 2023 Amendment to capture asset-light tech and digital M&A "
            "deals (like Facebook/WhatsApp) that previously bypassed asset/turnover de minimis thresholds."
        ),
    ),

    # DPDP Act 2023 Data Fiduciary Statutory Liability & Cross-Border Trap
    ClausePattern(
        category=ClauseCategory.DATA_PRIVACY,
        risk_level=RiskLevel.CRITICAL,
        name="DPDP Act 2023 Data Fiduciary Statutory Liability & Cross-Border Trap",
        description=(
            "Clause attempting to shift statutory personal data breach fines (up to ₹250 Crore) from the Data Fiduciary "
            "onto the Data Processor via unlimited indemnification, or permitting cross-border transfer of sensitive "
            "personal data to restricted/blacklisted jurisdictions without compliant safeguards."
        ),
        legal_basis=(
            "Digital Personal Data Protection Act 2023 (DPDP Act) §§ 8, 9, 16 & Schedule (Penalties up to ₹250 Crore); "
            "Data Protection Board of India (DPBI) powers; "
            "Information Technology Act 2000 §43A; "
            "GDPR Articles 28 & 83"
        ),
        red_flag_phrases=[
            "dpdp act 2023",
            "digital personal data protection",
            "data fiduciary liability",
            "penalty up to rs 250 crore",
            "cross-border data transfer",
            "personal data breach notification",
            "data processor indemnity for statutory fines",
            "unrestricted processing of personal data",
            "transfer of data outside india without restriction",
            "shift statutory fines under dpdp",
            "data principal rights waiver",
        ],
        plain_english=(
            "The company is trying to make you or your service pay for any government privacy fines (up to ₹250 Crore) "
            "if there's a data leak, or illegally shipping user personal data to foreign countries without legal protections."
        ),
        mitigation=(
            "Statutory penalties imposed by the Data Protection Board of India cannot be fully shifted via indemnity "
            "as a matter of public policy. Cap processor liability, require bilateral data security protocols, and mandate "
            "compliance with Section 16 cross-border transfer negative lists."
        ),
        historical_precedent=(
            "Under India's landmark DPDP Act 2023, failures to prevent personal data breaches carry catastrophic statutory "
            "penalties of up to ₹250 Crore ($30M) per incident."
        ),
    ),

    # POSH Act 2013 vs Perpetual Non-Disparagement Gag Clauses
    ClausePattern(
        category=ClauseCategory.CONFIDENTIALITY,
        risk_level=RiskLevel.CRITICAL,
        name="Perpetual Non-Disparagement Gag Clause vs POSH Act 2013",
        description=(
            "Broad gag order or perpetual non-disparagement clause prohibiting the employee from ever making negative "
            "statements, reporting workplace misconduct, or filing harassment complaints, violating statutory rights under "
            "the POSH Act 2013 and public policy under Section 23 of the Indian Contract Act."
        ),
        legal_basis=(
            "Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 (POSH Act); "
            "Section 23, Indian Contract Act 1872 (agreements contrary to public policy void); "
            "Speak Out Act (US Pub. L. 117-224); "
            "National Labor Relations Act §7 & McLaren Macomb [2023 NLRB]"
        ),
        red_flag_phrases=[
            "perpetual non-disparagement",
            "shall never disparage the company",
            "refrain from making any derogatory statements",
            "gag on workplace misconduct",
            "waive right to file complaint under posh",
            "non-disparagement survives termination indefinitely",
            "prohibited from disclosing any misconduct",
            "never make any adverse remarks against directors",
            "waives right to approach internal complaints committee",
        ],
        plain_english=(
            "This clause tries to silence you forever from speaking out about mistreatment, toxic conduct, or sexual "
            "harassment. Under Indian law (POSH Act), you cannot be legally silenced or penalized for reporting harassment "
            "to authorities or internal committees."
        ),
        mitigation=(
            "Insert mandatory whistleblower and statutory carve-outs: 'Nothing in this agreement shall restrict or impede "
            "the employee from reporting sexual harassment under the POSH Act 2013, filing whistleblower complaints, or "
            "testifying truthfully before legal or regulatory authorities.'"
        ),
        historical_precedent=(
            "High-profile workplace settlements historically used perpetual non-disparagement agreements to conceal serial "
            "harassment until laws like India's POSH Act and US Speak Out Act rendered NDAs silencing harassment victims void."
        ),
    ),

    # Phantom Equity Clawbacks & Discretionary Retention Traps
    ClausePattern(
        category=ClauseCategory.SALARY_COMPENSATION,
        risk_level=RiskLevel.HIGH,
        name="Phantom Equity Clawback & Retention Bonus Forfeiture Trap",
        description=(
            "Clause allowing the company to claw back vested equity-linked bonuses, SARs (Stock Appreciation Rights), "
            "or signing bonuses if the employee resigns within 12–36 months, combined with broad negative covenants "
            "forfeiting earned compensation upon departure."
        ),
        legal_basis=(
            "Payment of Wages Act 1936 §7 (authorized deductions); "
            "Indian Contract Act 1872 §27; "
            "State of Punjab v. Labour Court [1981 SC]; "
            "US FTC Non-Compete / Compensation Clawback Guidelines"
        ),
        red_flag_phrases=[
            "phantom equity clawback",
            "retention bonus repayment",
            "forfeiture of vested units",
            "clawback of previously paid bonuses",
            "repay signing bonus upon resignation",
            "negative covenant forfeiture",
            "forfeiture of accrued remuneration",
            "repay incentive upon departure",
            "vested units cancelled upon cessation",
        ],
        plain_english=(
            "If you leave the company, they can take back bonuses or stock rewards you already earned and worked for. "
            "You end up subsidizing the company's retention through financial penalties."
        ),
        mitigation=(
            "Ensure vested units are fully non-forfeitable except in proven cases of gross willful misconduct or fraud. "
            "Require signing bonus repayment to prorate monthly over max 12 months."
        ),
        historical_precedent=(
            "Startups and finance firms routinely use phantom equity clawbacks to trap talent, making it financially "
            "impossible for senior leaders to depart without forfeiting earned deferred pay."
        ),
    ),

    # Consumer ToS: Negative Option Billing & Zombie Subscription Trap
    ClausePattern(
        category=ClauseCategory.AUTO_RENEWAL,
        risk_level=RiskLevel.HIGH,
        name="Negative Option Billing & Zombie Subscription Trap",
        description=(
            "Auto-renewal trap where a free trial or recurring subscription automatically renews perpetually with "
            "intentionally cumbersome cancellation flows (dark patterns), requiring certified physical mail or phone calls "
            "during limited hours to cancel."
        ),
        legal_basis=(
            "Consumer Protection Act 2019 (India) §2(46); "
            "Guidelines for Prevention and Regulation of Dark Patterns 2023 (CCPA India); "
            "FTC Negative Option Rule (16 CFR Part 425); "
            "California Auto-Renewal Law (ARL §17602)"
        ),
        red_flag_phrases=[
            "negative option billing",
            "zombie subscription",
            "continuous renewal until cancelled",
            "recurring monthly charge automatically",
            "cancellation must be made by registered post",
            "non-refundable subscription fee",
            "dark pattern subscription renewal",
            "recurring billing without confirmation",
            "cancel by written notice 60 days before",
            "in-app cancellation unavailable",
        ],
        plain_english=(
            "They make it one click to subscribe, but make it nearly impossible to cancel (requiring physical letters or "
            "confusing multi-step hoops), quietly billing your card every month indefinitely."
        ),
        mitigation=(
            "Under Indian CCPA Dark Pattern Guidelines 2023 and global FTC rules, cancellation must be as easy and quick as "
            "subscribing (click-to-cancel). Demand explicit renewal reminders and self-serve online cancellation."
        ),
        historical_precedent=(
            "FTC and Indian CCPA actions against fitness chains, dating apps, and SaaS platforms for deceptive negative "
            "option billing and 'forced subscription traps'."
        ),
    ),

    # Consumer ToS: Unilateral Terms & Price Escalation Trap
    ClausePattern(
        category=ClauseCategory.UNILATERAL_MODIFICATION,
        risk_level=RiskLevel.CRITICAL,
        name="Unilateral Terms & Price Escalation (Continuous Modification Trap)",
        description=(
            "Service provider reserves the unfettered right to modify terms, service tiers, or recurring subscription prices "
            "at any time, with continued use deemed irrevocable acceptance without affirmative consent or pro-rated refunds."
        ),
        legal_basis=(
            "Indian Contract Act 1872 §10 (free consent) & §16 (undue influence); "
            "Indian Consumer Protection Act 2019 §2(46) (unfair contracts); "
            "EU Directive 93/13/EEC Art. 3; "
            "CMA UK Unfair Terms Guidance"
        ),
        red_flag_phrases=[
            "unilateral modification",
            "reserve the right to modify",
            "reserve the right to modify pricing at any time",
            "modify these terms",
            "modify at any time",
            "at any time without notice",
            "without prior notice",
            "without notice at any time",
            "terms subject to change",
            "amend this agreement at our discretion",
            "deemed acceptance by continued use",
            "without prior written consent",
            "change terms without notice",
            "price increase effective immediately",
            "we may alter or discontinue features at discretion",
            "binding upon posting to our website",
            "continued access constitutes agreement to revised",
        ],
        plain_english=(
            "They can change what you pay or change the rules of the service whenever they want, and if you keep using "
            "the account, they claim you automatically agreed to the higher price or worse terms."
        ),
        mitigation=(
            "Require at least 30-day advance email notice for material changes or price hikes, accompanied by the right "
            "to cancel immediately with a pro-rata refund of unused prepaid fees."
        ),
        historical_precedent=(
            "Streaming services, food delivery apps, and utility platforms faced class actions for sneaking price increases "
            "into buried terms of service updates without affirmative opt-in."
        ),
    ),

    # Consumer ToS: Forced Class Action Waiver & Collective Redress Ban
    ClausePattern(
        category=ClauseCategory.WAIVER,
        risk_level=RiskLevel.HIGH,
        name="Forced Class Action Waiver & Collective Redress Ban",
        description=(
            "Strips consumers and employees of the right to participate in class actions, representative public interest "
            "litigation, or consolidated arbitrations, requiring every customer to litigate separately at prohibitive individual cost."
        ),
        legal_basis=(
            "Consumer Protection Act 2019 §35(1)(c) (Class Actions in India); "
            "Rule 23, US Federal Rules of Civil Procedure; "
            "AT&T Mobility LLC v. Concepcion [563 U.S. 333 (2011)]; "
            "European Union Collective Redress Directive (2020/1828)"
        ),
        red_flag_phrases=[
            "class action waiver",
            "waive right to participate in a class",
            "individual capacity and not as a plaintiff or class member",
            "no consolidated arbitration",
            "prohibition of class arbitration",
            "waive collective action",
            "class action or representative proceeding",
            "no private attorney general",
            "consolidated with claims of any other party",
        ],
        plain_english=(
            "If the company overcharges 100,000 customers ₹100 each, this clause stops everyone from banding together in a "
            "single lawsuit. Because hiring a lawyer for ₹100 is pointless, the company gets away with keeping the stolen money."
        ),
        mitigation=(
            "In India, consumer forums recognize collective class complaints under CPA 2019 Section 35(1)(c) notwithstanding "
            "private waivers. For corporate B2B contracts, strike class waivers that shield deceptive systemic breaches."
        ),
        historical_precedent=(
            "Corporations adopted forced class action waivers following the 2011 AT&T Concepcion ruling to effectively insulate "
            "themselves against multi-million consumer claims for hidden surcharges."
        ),
    ),

    # ══════════════════════════════════════════════════════════════════════════
    # 3. CLASSIC ESSENTIAL CONTRACT RISK PATTERNS
    # ══════════════════════════════════════════════════════════════════════════

    # Termination for Convenience
    ClausePattern(
        category=ClauseCategory.TERMINATION,
        risk_level=RiskLevel.HIGH,
        name="Termination for Convenience (Short Notice)",
        description=(
            "Allows the counterparty to terminate the contract without cause on extremely short notice (< 30 days), "
            "stripping revenue predictability and project security."
        ),
        legal_basis="Indian Contract Act §§ 73–74; UK Unfair Contract Terms Act 1977; Restatement (Second) of Contracts §205",
        red_flag_phrases=[
            "terminate for convenience",
            "terminate without cause",
            "terminate at any time",
            "notice of 7 days",
            "notice of 14 days",
            "notice of 15 days",
            "terminate upon written notice",
            "without penalty",
            "at our sole discretion",
            "with immediate effect without assigning any reason",
        ],
        plain_english=(
            "They can walk away from this contract at almost any time on short notice without giving any valid reason."
        ),
        mitigation="Negotiate minimum notice periods (90–180 days), wind-down fees, or kill fees.",
    ),

    # Asymmetric Termination Rights
    ClausePattern(
        category=ClauseCategory.TERMINATION,
        risk_level=RiskLevel.CRITICAL,
        name="Asymmetric Termination Rights",
        description=(
            "Only one party holds termination rights, leaving the counterparty locked in with zero exit options."
        ),
        legal_basis="Indian Contract Act §16 (undue influence); Consumer Protection Act 2019; EU Directive 93/13/EEC",
        red_flag_phrases=[
            "company may terminate",
            "employer reserves the right to terminate",
            "we may terminate your account",
            "without notice at our discretion",
            "you may not terminate",
            "non-cancelable",
            "customer shall have no right to cancel",
        ],
        plain_english="They can end the contract whenever they want, but you are completely locked in.",
        mitigation="Demand strictly bilateral and mutual termination triggers and equal notice periods.",
    ),

    # Uncapped Unlimited Liability
    ClausePattern(
        category=ClauseCategory.LIABILITY,
        risk_level=RiskLevel.CRITICAL,
        name="Uncapped Unlimited Liability",
        description=(
            "No ceiling on damages the signing party must pay, risking catastrophic enterprise financial ruin."
        ),
        legal_basis="Indian Contract Act §74; Hadley v. Baxendale [1854]; SEBI LODR 2015 Reg. 4(2)",
        red_flag_phrases=[
            "unlimited liability",
            "without limitation",
            "all losses and damages",
            "any and all claims",
            "full indemnification",
            "consequential, indirect, special",
            "including loss of profits",
            "howsoever arising",
            "liability shall be uncapped",
            "without any financial ceiling",
        ],
        plain_english=(
            "If a dispute arises, you could owe an unlimited sum of money far exceeding the total value of the contract."
        ),
        mitigation="Cap aggregate liability at contract value (or 12 months fees) and exclude consequential losses.",
    ),

    # Asymmetric Limitation of Liability
    ClausePattern(
        category=ClauseCategory.LIMITATION_OF_LIABILITY,
        risk_level=RiskLevel.HIGH,
        name="One-Sided Limitation of Liability",
        description="Caps liability only for the drafter while leaving the other party completely exposed.",
        legal_basis="UK UCTA 1977 §2; UCC §2-719; Indian Contract Act §28",
        red_flag_phrases=[
            "our liability shall not exceed",
            "in no event will [company] be liable",
            "maximum aggregate liability of [company]",
            "sole remedy",
            "exclusive remedy",
            "aggregate liability under this agreement shall be limited to $100",
            "total liability shall not exceed the amounts paid in the prior month",
        ],
        plain_english="Their financial exposure is capped to pocket change, but you remain exposed to unlimited damages.",
        mitigation="Ensure liability limits apply symmetrically to both contracting parties.",
    ),

    # Broad Third-Party Indemnification
    ClausePattern(
        category=ClauseCategory.INDEMNITY,
        risk_level=RiskLevel.CRITICAL,
        name="Broad Third-Party Indemnification",
        description="Obligates you to pay for any third-party claims against the company, even if only tangentially related.",
        legal_basis="Indian Contract Act §§ 124–125; UK Civil Liability (Contribution) Act 1978",
        red_flag_phrases=[
            "indemnify and hold harmless",
            "defend, indemnify",
            "any claims arising out of",
            "arising from your use",
            "any third-party claim",
            "including reasonable attorneys' fees",
            "arising in connection with",
            "against all losses, liabilities, costs",
        ],
        plain_english="If anyone sues the company over anything loosely connected to you, you pay all legal bills and damages.",
        mitigation="Restrict indemnity strictly to proven gross negligence or willful misconduct, with indemnity caps.",
    ),

    # Broad IP Assignment (Moonlighting Grab)
    ClausePattern(
        category=ClauseCategory.IP_OWNERSHIP,
        risk_level=RiskLevel.CRITICAL,
        name="Broad IP Assignment (Moonlighting Grab)",
        description=(
            "Company claims absolute ownership over everything you conceive or create, including personal projects "
            "built on personal time with personal equipment outside work scope."
        ),
        legal_basis="Copyright Act 1957 §17 (work for hire); Patents Act 1970 §6; California Labor Code §2870",
        red_flag_phrases=[
            "all inventions",
            "any work product",
            "works made for hire",
            "assign all right, title and interest",
            "conceived or developed",
            "during the term of employment",
            "relate to our business",
            "using company resources",
            "including personal time",
            "sole and exclusive property",
            "whether or not during working hours",
            "irrevocably assigns all proprietary rights",
        ],
        plain_english="Anything you build—even on weekends or your personal laptop—becomes their property.",
        mitigation="Attach an IP Carve-Out Schedule listing prior inventions and restrict scope to direct company tasks.",
    ),

    # Discretionary Compensation
    ClausePattern(
        category=ClauseCategory.SALARY_COMPENSATION,
        risk_level=RiskLevel.HIGH,
        name="Discretionary Bonus / At-Will Compensation",
        description="Bonuses and incentives are defined as purely discretionary, allowing company to withhold earned rewards.",
        legal_basis="Payment of Wages Act 1936; Payment of Bonus Act 1965",
        red_flag_phrases=[
            "bonus at management discretion",
            "discretionary bonus",
            "no guaranteed bonus",
            "may be modified",
            "subject to change",
            "performance-based at company's sole discretion",
            "not a contractual entitlement",
            "company reserves the right to withhold incentive",
        ],
        plain_english="Bonuses can be cancelled at will without explanation even after you hit every performance target.",
        mitigation="Define formulaic, objective bonus milestones and clear vesting schedules in writing.",
    ),

    # Hidden Change of Control Trigger
    ClausePattern(
        category=ClauseCategory.CHANGE_OF_CONTROL,
        risk_level=RiskLevel.CRITICAL,
        name="Hidden Change-of-Control Trigger (M&A Deal Breaker)",
        description="Permits counterparty to terminate or renegotiate immediately upon any ownership or restructuring change.",
        legal_basis="SEBI SAST Regulations 2011; Companies Act 2013 §§ 230–232; FEMA 20(R)/2017",
        red_flag_phrases=[
            "change of control",
            "change in ownership",
            "acquisition by",
            "majority stockholder",
            "new controlling entity",
            "consent of the other party",
            "deemed assignment",
            "ipso facto termination",
            "terminate immediately upon merger",
        ],
        plain_english="If your company is acquired or merged, this contract self-destructs unless the counterparty consents.",
        mitigation="Add standard carve-outs: 'consent not to be unreasonably withheld, delayed, or conditioned'.",
    ),

    # Broad Data License / Sharing
    ClausePattern(
        category=ClauseCategory.DATA_PRIVACY,
        risk_level=RiskLevel.HIGH,
        name="Broad Data License & Commercialization Clause",
        description="Sweeping perpetual rights to use, share, monetize, or sublicense customer proprietary or personal data.",
        legal_basis="DPDP Act 2023; GDPR Articles 6–7; IT Act 2000 §43A",
        red_flag_phrases=[
            "share your data with third parties",
            "use your data for marketing",
            "transfer data to affiliates",
            "irrevocable license to use",
            "perpetual license",
            "sublicensable",
            "worldwide license",
            "aggregate and anonymize",
            "sell or transfer",
            "commercialize customer data",
        ],
        plain_english="They can sell or license your personal or business data to third parties indefinitely.",
        mitigation="Under DPDP Act 2023, insist on purpose limitation, affirmative consent, and strict deletion upon exit.",
    ),

    # Auto-Renewal with Short Window
    ClausePattern(
        category=ClauseCategory.AUTO_RENEWAL,
        risk_level=RiskLevel.MEDIUM,
        name="Auto-Renewal with Short Cancellation Window",
        description="Contract auto-renews for another full period unless cancelled in an unreasonably narrow notice window.",
        legal_basis="Consumer Protection Act 2019; EU Consumer Rights Directive 2011/83",
        red_flag_phrases=[
            "automatically renews",
            "auto-renewal",
            "unless cancelled 30 days prior",
            "rolling contract",
            "evergreen",
            "continuous until terminated",
            "notification period",
            "automatic successive terms",
        ],
        plain_english="If you miss a tiny cancellation deadline, you are trapped paying for another full term.",
        mitigation="Mandate proactive 30-day email renewal reminders and allow cancellation up to 7 days before renewal.",
    ),

    # Distant Governing Law & Jurisdiction
    ClausePattern(
        category=ClauseCategory.GOVERNING_LAW,
        risk_level=RiskLevel.MEDIUM,
        name="Unfavourable Distant Governing Law & Jurisdiction",
        description="Forces disputes to be heard in a distant foreign jurisdiction, making enforcement prohibitively expensive.",
        legal_basis="Civil Procedure Code 1908 §20; Brussels Regulation (EU)",
        red_flag_phrases=[
            "courts of [distant jurisdiction]",
            "exclusive jurisdiction",
            "governed by the laws of",
            "delaware courts",
            "courts of england",
            "singapore courts",
            "submit to jurisdiction",
            "venue shall be",
            "courts of new york",
        ],
        plain_english="To enforce your rights or defend yourself, you must hire foreign lawyers in a distant court.",
        mitigation="Insist on mutual jurisdiction or neutral territory (e.g. courts of New Delhi / Mumbai for Indian entities).",
    ),

    # Unilateral Assignment
    ClausePattern(
        category=ClauseCategory.ASSIGNMENT,
        risk_level=RiskLevel.MEDIUM,
        name="Unilateral Assignment Right",
        description="Allows company to transfer contract rights and obligations to third parties without your consent.",
        legal_basis="Indian Contract Act §37; Transfer of Property Act §6",
        red_flag_phrases=[
            "may assign this agreement",
            "assign without consent",
            "successors and assigns",
            "transfer rights to",
            "novate this agreement",
            "assign to any third party",
        ],
        plain_english="The company can hand your contract over to a completely different corporate entity without asking.",
        mitigation="Require prior written consent for any assignment or permit immediate termination upon unwanted assignment.",
    ),

    # Disproportionate Penalty
    ClausePattern(
        category=ClauseCategory.PENALTY,
        risk_level=RiskLevel.HIGH,
        name="Disproportionate Penal Liquidated Damages",
        description="Penalties stipulated for minor infractions wildly exceed any genuine pre-estimate of loss.",
        legal_basis="Indian Contract Act §74; Dunlop Pneumatic Tyre Co v New Garage [1915 HL]",
        red_flag_phrases=[
            "penalty of",
            "liquidated damages of",
            "forfeit",
            "pay [large sum] per day",
            "punitive damages",
            "additional charges",
            "clawback",
            "failure to perform",
            "default sum of rs",
        ],
        plain_english="A small technical slip-up triggers a disproportionate financial fine far exceeding actual harm.",
        mitigation="Indian courts reduce unconscionable penalties to fair compensation; limit damages to actual proven loss.",
    ),

    # Asymmetric Force Majeure
    ClausePattern(
        category=ClauseCategory.FORCE_MAJEURE,
        risk_level=RiskLevel.MEDIUM,
        name="One-Sided Broad Force Majeure",
        description="Excessively broad force majeure definitions that excuse only the drafter's performance.",
        legal_basis="Indian Contract Act §56; Energy Watchdog v. CERC [2017 SC]",
        red_flag_phrases=[
            "force majeure",
            "acts of god",
            "circumstances beyond our control",
            "pandemic",
            "government action",
            "regulatory changes",
            "market conditions",
            "failure of suppliers",
        ],
        plain_english="They can pause or cancel their obligations at will while you remain strictly bound to pay.",
        mitigation="Make force majeure mutual and add a bilateral termination exit if suspension exceeds 60 days.",
    ),

    # Broad Rights Waiver
    ClausePattern(
        category=ClauseCategory.WAIVER,
        risk_level=RiskLevel.MEDIUM,
        name="Broad Statutory Rights Waiver",
        description="Attempts to force waiver of non-waivable statutory rights (e.g., minimum wage, POSH, consumer court access).",
        legal_basis="Indian Contract Act §23; Consumer Protection Act 2019 §49",
        red_flag_phrases=[
            "waive any right",
            "waive all claims",
            "surrender rights",
            "no right to appeal",
            "waive statutory rights",
            "irrevocably waive",
            "waive right to approach court",
        ],
        plain_english="Tries to make you give up basic legal protections that the law says cannot be contracted away.",
        mitigation="Statutory public rights cannot be waived by private contract; strike broad waiver language.",
    ),
]

# Lookup indexes
PATTERNS_BY_CATEGORY = {cat: [] for cat in ClauseCategory}
for _p in CLAUSE_KNOWLEDGE_BASE:
    PATTERNS_BY_CATEGORY[_p.category].append(_p)

PATTERNS_BY_RISK = {lvl: [] for lvl in RiskLevel}
for _p in CLAUSE_KNOWLEDGE_BASE:
    PATTERNS_BY_RISK[_p.risk_level].append(_p)


def get_pattern_by_name(name: str) -> Optional[ClausePattern]:
    """Look up a pattern by exact or case-insensitive name."""
    name_clean = name.strip().lower()
    for p in CLAUSE_KNOWLEDGE_BASE:
        if p.name.strip().lower() == name_clean:
            return p
    return None


def find_patterns_by_category(category: ClauseCategory) -> List[ClausePattern]:
    """Retrieve all patterns under a category."""
    return PATTERNS_BY_CATEGORY.get(category, [])


def find_patterns_by_risk(risk_level: RiskLevel) -> List[ClausePattern]:
    """Retrieve all patterns under a risk level."""
    return PATTERNS_BY_RISK.get(risk_level, [])


def find_patterns_by_keyword(keyword: str) -> List[ClausePattern]:
    """Search knowledge base by phrase or keyword."""
    kw = keyword.lower()
    matches = []
    for p in CLAUSE_KNOWLEDGE_BASE:
        if (
            kw in p.name.lower()
            or kw in p.description.lower()
            or kw in p.legal_basis.lower()
            or any(kw in rf.lower() for rf in p.red_flag_phrases)
        ):
            matches.append(p)
    return matches
