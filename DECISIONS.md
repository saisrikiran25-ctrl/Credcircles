# Architecture & Product Decisions (DECISIONS.md)

This document records the foundational product and technical decisions for the **Community Credit Circles ("Circlo")** MVP, following Section 0, Section 1, and Section 10 of the Master Build Prompt.

---

## 1. Core Principle: Connector & Ledger, Never a Fund Holder

- **Decision**: Circlo never holds, pools, or intermediates fiat currency. All monetary transfers happen directly peer-to-peer via UPI (Lender VPA $\to$ Borrower VPA for disbursements, Borrower VPA $\to$ Lender/Circle VPA for repayments).
- **Logical Pool Balance**: The "pool balance" shown in-app is a virtual, logical ledger representing verified commitments and peer transactions.
- **Copy & Guardrails**: The banner *"Your money stays in your bank account"* is prominently surfaced on contribution screens, loan details, and ledger dashboards.

---

## 2. Interest Rate & Repayment Formula

- **Interest Model**: Simple Annual Interest (flat per annum prorated monthly).
  $$\text{Total Interest (Paise)} = \text{round}\left( \text{Principal} \times \frac{\text{Rate (\%)}}{100} \times \frac{\text{Tenure (Months)}}{12} \right)$$
- **Total Repayable**: $\text{Principal} + \text{Total Interest}$
- **Monthly Instalment Split**:
  $$\text{Monthly Principal} = \lfloor \text{Principal} / \text{Tenure} \rfloor$$
  $$\text{Monthly Interest} = \lfloor \text{Total Interest} / \text{Tenure} \rfloor$$
- **Rounding & Precision**: All financial amounts are stored as integer **paise** (1 INR = 100 paise). Any integer division remainder is applied to the **final instalment** ($N$-th month), guaranteeing that the sum of instalments matches the principal and interest to the exact paisa.
- **Unit Testing**: Verified in `tests/domain.test.ts`.

---

## 3. Lender Capital Allocation & Split Model

- **Decision**: In group-funded loans, capital disbursement can be funded by a single designated circle admin/treasurer or split proportionally across active contributing members.
- **Disbursement Flow**:
  1. The loan request specifies the aggregate principal (₹5,000 to ₹20,000).
  2. Approved loan requests generate a simulated UPI deep link and QR code (`upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`).
  3. In prototype mode, the simulated `UpiService` generates a valid UPI transaction reference (UTR) and records discrete disbursement entries in the append-only ledger.

---

## 4. Risk Scoring Engine & Factor Weights

The risk score (0 to 100) is an explainable, pure function evaluated from 5 transparent factors:

| Factor | Description | Weight |
|---|---|---|
| **1. Repayment History** | Ratio of on-time instalments paid vs total instalments due | 35% |
| **2. Community Approval Ratio** | Historical percentage of positive circle votes received across loan proposals | 20% |
| **3. Financial Skin-in-the-Game** | Lifetime circle contributions vs active outstanding borrow exposure | 20% |
| **4. Platform Tenure** | Active duration on platform (scaled up to 180 days) | 15% |
| **5. eKYC Verification** | Validated PAN format and simulated Aadhaar OTP verification status | 10% |

### Risk Bands
- **Low Risk (Score 75–100)**: Eligible for maximum ticket size (₹20,000), fastest approval cycle.
- **Medium Risk (Score 50–74)**: Standard limit with diversification exposure warnings.
- **High Risk (Score 0–49)**: Requires additional circle backing or restructuring; external lending blocked.
- **Insufficient History State**: If the user has 0 loan cycles, a neutral base score of 50 is displayed with an explainable *"Not enough history"* badge.

---

## 5. Proportional Risk-Sharing on Default

- **Decision**: Unlike individual P2P lending where a default causes a total loss for a single lender, Credit Circles use the digital SHG collective risk-sharing principle.
- **Mathematical Rule**:
  $$\text{Loss Borne by Member } i = \text{Defaulted Amount} \times \left( \frac{\text{Member } i \text{'s Capital Contribution}}{\text{Total Loan Principal}} \right)$$
- **Interactive Explainer**: Implemented as an interactive simulator modal (`RiskSharingExplainerModal.tsx`) on the home screen and circle detail screens.

---

## 6. Voting Threshold & Governance Rules

- **Default Approval Threshold**: 70% of active circle members must vote `APPROVE`.
- **Threshold Math**:
  $$\text{Required Approvals} = \lceil \text{Total Eligible Members} \times (\text{Threshold Percentage} / 100) \rceil$$
- **Early Rejection Rule**: If the count of `REJECT` votes makes it mathematically impossible to reach the required approval count, the loan is immediately marked `REJECTED`.
- **Voting Window**: 48 hours by default, with a one-click *"Close Vote"* action provided for demo and reviewer convenience.

---

## 7. Regulatory Compliance Modes

- **Option A (Partnered NBFC-P2P LSP - Default)**:
  - Circlo acts as a Lending Service Provider (LSP).
  - External / cross-group lending is enabled.
  - Transactions show simulated partner escrow audit tags (`PartnerEscrowService`).
- **Option C (Strictly Closed Circles)**:
  - Lending is restricted exclusively within the circle's own member roster.
  - Cross-group lending is disabled with clear regulatory compliance notices.
- **Option B (Proprietary NBFC-P2P License)**:
  - Surfaced on the Admin page as a Phase 3 roadmap milestone (requiring ₹2 Cr Net Owned Funds).

---

## 8. Platform Monetization & Take Rates

- **Platform Facilitation Fee**: 1.5% of loan principal (configurable between 1.0%–2.5%). Displayed transparently in the loan preview before vote submission.
- **Circle Pro Subscription**: ₹99/month per circle, unlocking deep portfolio analytics, exposure gauges, automated mandate reminders, and priority mediation.
- **Cross-Sell Horizons**: Visible "Coming Soon" cards for sachet accident/gadget insurance and bureau score reporting.
- **Demo Revenue Dashboard**: Implemented at `/admin` displaying real-time fee realization and 3-year financial projections.

---

## 9. Technology Stack Choices

- **Next.js 15 (App Router)** with **TypeScript strict mode**.
- **Tailwind CSS + Lucide Icons + Framer Motion** for fluid animations and micro-interactions.
- **Prisma ORM with SQLite** for zero-configuration, instant demo reproducibility.
- **Vitest** for fast unit tests and end-to-end simulation test suites.
