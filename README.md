# Circlo: Community Credit Circles MVP (India)

> **"SHG for Gen Z"** — A mobile-first platform that lets students and young adults (18–30) form trusted Credit Circles (digital Self-Help Groups), pool micro-contributions, lend to peers and vetted outsiders, and earn modest interest, with the platform operating as a **connector and immutable ledger, never a fund holder**.

---

## 🌟 Highlights & Key Principles

1. **Connector + Ledger, Never a Fund Holder**:
   - The platform never holds custody of user money.
   - Pool balances in-app are *logical commitments* tracked in an append-only ledger.
   - All monetary exchanges occur peer-to-peer via UPI (`upi://pay`) directly from the lender's bank account to the borrower's bank account.
   - Visible reminder throughout: *"Your money stays in your bank account."*

2. **Accurate Indian FinTech & SHG Domain Logic**:
   - **Interest Policy**: 8% – 12% p.a. simple interest, prorated monthly in integer paise.
   - **Ticket Sizes**: ₹5,000 – ₹20,000 for tenors of 1 – 6 months.
   - **Monthly Contributions**: ₹500 – ₹5,000 per member.
   - **Democratic Governance**: Configurable approval threshold (default 70% of members must approve loans).
   - **Proportional Risk-Sharing**: Default losses are distributed across contributing circle members based on capital commitment.
   - **Diversification & Exposure Nudges**: Real-time warnings when a loan request exceeds 35% of the circle pool or creates high concentration.

3. **Pluggable Simulation Architecture**:
   - Simulated eKYC (PAN format validation `AAAAA9999A` & 12-digit Aadhaar with masked last-4 storage).
   - Simulated UPI disbursement sheet & AutoPay EMI mandate flow.
   - Simulated NBFC-P2P Partner Escrow compliance checks.

---

## 🏗️ Architecture & Clean Separation

```
CreditCircle/
├── src/
│   ├── app/                      # Next.js App Router (Mobile-First Shell)
│   │   ├── admin/                # Pilot Metrics, Revenue, & 3-Year Projections
│   │   ├── api/                  # Route Handlers for Circles, Loans, KYC, Ledger
│   │   ├── circles/              # Circle Detail, Create Wizard, Join via Invite
│   │   ├── ledger/               # Immutable Append-Only Ledger + CSV Export
│   │   ├── loans/                # Loan Requests, Voting UI, EMI Schedule, Restructuring
│   │   ├── profile/              # eKYC Status, Compliance Toggle, Risk Breakdown
│   │   └── page.tsx              # Home Screen: "My Position", Ring Gauges, Quick Actions
│   ├── components/
│   │   ├── modals/               # KYC, Contribute, UPI Pay, Loan Agreement, Risk Explainer
│   │   ├── navigation/           # Mobile AppShell (390px phone frame), Bottom Nav, Persona Switcher
│   │   └── ui/                   # Recharts & SVG Circular Donut Gauges
│   ├── context/                  # AppContext: Global session, Dark mode, Compliance mode
│   ├── lib/
│   │   ├── domain/               # PURE BUSINESS LOGIC (100% test covered)
│   │   │   ├── currency.ts       # Integer paise formatting & Indian Lakh/Crore grouping
│   │   │   ├── emi.ts            # Simple interest formula & schedule calculation
│   │   │   ├── exposure.ts       # Concentration & liquidity diversification nudges
│   │   │   ├── ledger.ts         # Append-only balance reconciliation
│   │   │   ├── penalties.ts      # Late payment fees & status transitions
│   │   │   ├── risk.ts           # 5-factor explainable risk scoring engine (0-100)
│   │   │   ├── riskSharing.ts    # SHG proportional default loss sharing
│   │   │   ├── rules.ts          # Domain boundary constraints (8-12%, ₹5k-₹20k, etc.)
│   │   │   └── voting.ts         # 70% approval threshold evaluator & early rejection
│   │   ├── services/             # Clean Interfaces for External Integrations
│   │   │   ├── kycService.ts     # Mock eKYC (PAN / Aadhaar)
│   │   │   ├── partnerEscrowService.ts # Mock NBFC-P2P LSP integration
│   │   │   └── upiService.ts     # Mock UPI Deep Link & QR generator
│   │   └── session.ts            # Persona definitions & instant demo switcher
├── prisma/
│   ├── schema.prisma             # Comprehensive SQLite schema
│   └── seed.ts                   # Realistic seed data (5 Circles, 12 Users, Hyderabad/BLR/Pune)
├── tests/
│   ├── domain.test.ts            # Unit tests for interest, risk score, voting, ledger, penalties
│   └── goldenPath.test.ts        # End-to-end user journey simulation test
├── DECISIONS.md                  # Comprehensive architectural and product trade-offs
├── FEATURE_MAP.md                # Mapping of business description sections 1–16
└── README.md                     # Setup, demo instructions, and technical documentation
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- npm or pnpm

### Installation

```bash
# 1. Clone or navigate into repository
cd CreditCircle

# 2. Install dependencies
npm install

# 3. Initialize SQLite database and run migrations
npm run db:push

# 4. Seed realistic pilot data
npm run seed

# 5. Run development server
npm run dev
```

Open `http://localhost:3000` in your browser. The UI automatically presents a mobile-first app shell (design target 390px, centered on desktop).

---

## 🧪 Running Tests & Build Verification

The codebase includes an extensive automated test suite validating all domain rules, edge cases, and end-to-end flows.

```bash
# Run all unit and golden path tests
npm run test

# Run Next.js production build & type checks
npm run build
```

---

## 🌍 Public Deployment on GitHub Pages

This repository now includes `.github/workflows/deploy-pages.yml` to publish a static export of the Next.js app to:

- **Project site URL:** `https://saisrikiran25-ctrl.github.io/Credcircles/`

### One-time repository setup

1. Open **GitHub → Settings → Pages** for `saisrikiran25-ctrl/Credcircles`.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge/push the deployment workflow to `main`.

### Deployment flow

1. Push/merge changes to `main`.
2. GitHub Actions runs **Deploy Next.js static site to GitHub Pages**.
3. The workflow installs dependencies using `npm ci` (`package-lock.json`), runs `npm run build`, uploads `out/`, and deploys to the `github-pages` environment.
4. Open **Actions** to monitor status; after success, open the URL above.

### Static-hosting limitations for this repository

GitHub Pages only serves static files. This app's API route handlers in `src/app/api/**` depend on Prisma/database-backed server execution, so they are **not available** on Pages. As a result, server-backed features (loan voting/disbursement/repayment, circle mutations, ledger exports, admin metrics, etc.) require running the app with a Node.js server (`npm run dev` or `npm run start`) and a seeded database.

The Pages deployment is therefore a static frontend preview. The home screen now shows a clear notice when backend APIs are unavailable.

---

## 👥 Seed Data & 1-Click Demo Personas

The application includes a **1-Click Demo User Switcher** available directly in the top header and on the Profile tab. Reviewers can test different perspectives instantly without logging out:

| Persona | Name | Role & Segment | City | Profile & Purpose |
|---|---|---|---|---|
| **Persona 1 (Borrower)** | **Rohan Verma** | Student Borrower (`COLLEGE_STUDENT`) | Hyderabad | IIIT Hyderabad student. Has an active loan request for semester project equipment with pending votes. |
| **Persona 2 (Admin/Lender)** | **Aarav Sharma** | Circle Admin & Active Lender (`YOUNG_PROFESSIONAL`) | Hyderabad | Fintech dev in Hi-Tech City. Admin of *Gachibowli Hostel Fellows* and *Hi-Tech Devs Circle*. Can approve loans, manage rules, and disburse capital. |
| **Persona 3 (Pro/Entrepreneur)** | **Tanvi Patel** | Microentrepreneur (`MICROENTREPRENEUR`) | Hyderabad | Runs Studio Akshara. Creator of *Osmania E-Cell Club Treasury*. Demonstrates inventory loan repayments and AutoPay mandates. |

### Additional Seeded Circles:
- **Gachibowli Hostel Fellows** (Hyderabad, Hostel group) — ₹32,000 pool balance, 9.5% p.a., 70% approval.
- **Hi-Tech City Young Devs** (Hyderabad, Young professionals) — ₹45,000 pool balance, 10.0% p.a.
- **Osmania E-Cell Club Treasury** (Hyderabad, Campus club) — ₹24,000 pool balance, 8.5% p.a.
- **Koramangala Creators Syndicate** (Bengaluru, Friend circle) — ₹30,000 pool balance, 11.0% p.a.
- **COEP Tech Syndicate** (Pune, College group) — ₹20,000 pool balance, 9.0% p.a.

---

## 🔄 Simulation Layers vs. Real-World Implementations

Per Working Rule #2, no real money or Aadhaar credentials are collected. The code separates production-ready service contracts:

| Service | Simulation Layer (`src/lib/services/`) | Real-World Production Integration |
|---|---|---|
| **KYC / Identity** | `KycService.verifyDocument()` validates regex formats, masks characters, and accepts demo OTP `123456`. | Replace with **Digilocker**, **Setu eKYC API**, or **Signzy** for real Aadhaar OTP verification and NSDL PAN verification. |
| **Disbursement & Repayment** | `UpiService.generatePaymentLink()` creates valid `upi://pay` URI schemes and QR matrices. Mock payment modal returns simulated UTRs. | Wire to **NPCI UPI Deep Linking**, **Razorpay Smart Collect**, or **Cashfree Payment Links** for real bank callbacks. |
| **AutoPay Mandates** | `UpiService.createAutoPayMandate()` creates simulated mandate records with active status. | Connect to **NPCI UPI AutoPay 2.0** or **Razorpay Subscriptions** via recurring mandate tokens. |
| **Escrow & Compliance** | `PartnerEscrowService.auditLoanCompliance()` logs simulated escrow audit trails and enforces borrower vetting flags. | Connect to licensed **NBFC-P2P partners** (e.g. LenDenClub, Faircent, IndiaP2P) escrow nodal accounts via their LSP APIs. |

---

## ⚖️ Regulatory Compliance Modes

A dynamic toggle is available on the **Profile screen**:
- **Option A (Partnered NBFC-P2P LSP - Default)**: The platform acts as a technology LSP. Cross-group and external borrower lending is permitted under partner escrow audits.
- **Option C (Strictly Closed Circles)**: External and cross-group lending is disabled. Transactions stay strictly within closed, private group circles.
- **Option B (Proprietary NBFC-P2P License)**: Displayed on the Admin page as a Phase 3 milestone (requires ₹2 Cr Net Owned Funds).

---

## 📊 Deliverables Checklist Status

- [x] Complete working source code in a clean repo structure.
- [x] `README.md` (architecture, setup, demo logins, simulation mapping).
- [x] `DECISIONS.md` (interest formula, lender split model, risk scoring weights, risk sharing rule).
- [x] `FEATURE_MAP.md` (mapping of sections 1–16 of business description).
- [x] Passing unit tests (`tests/domain.test.ts`) and golden path simulation (`tests/goldenPath.test.ts`).
- [x] Clean Next.js 15 production build with 0 TypeScript/lint errors.
