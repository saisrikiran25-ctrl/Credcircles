# MASTER BUILD PROMPT: Community Credit Circles MVP (India)

You are a senior full-stack engineer and product designer. Build a complete, working, demo-ready prototype/MVP of the product described below. The business description is the single source of truth. Where this prompt and the description conflict, the description wins. Where the description is silent, choose the simplest option that fits its spirit, and list that choice in `DECISIONS.md`. Do not invent features that contradict it. Do not skip features it names (those marked Phase 1 are mandatory; others are listed under "Stretch / visible-but-stubbed").

Work autonomously from start to finish. Plan first, then build, then verify against the acceptance checklist at the end. Do not stop to ask questions unless you are truly blocked.

---

## 0. WORKING RULES

1. **Accuracy first.** Every number, rule, role, flow and label in Section 3 must appear in the product exactly as specified (interest range, approval threshold, ticket sizes, tenors, fee percentages, etc.).
2. **No real money, no real KYC.** This is a prototype. All UPI, eKYC (PAN/Aadhaar), AutoPay and NBFC-P2P partner integrations are **simulated behind clean service interfaces** (e.g. `UpiService`, `KycService`, `PartnerEscrowService`) so real providers can be swapped in later. Show a subtle "Prototype / Simulated" indicator where relevant. Never collect real Aadhaar/PAN numbers. Validate format only and store masked values.
3. **The platform is a connector + ledger, never a fund holder.** The UI, data model and copy must reinforce this: the "pool balance" is a *logical* number tracked in-app. Money stays in members' own bank accounts. There must be no wallet, no "add money to app" and no platform-held balance anywhere. Lending is lender-to-borrower via UPI payment link/QR.
4. **Seed realistic demo data** so every screen looks alive on first launch (see Section 9).
5. **Ship quality.** TypeScript strict mode, no console errors, no dead buttons, every empty/loading/error state designed, keyboard-accessible, responsive.
6. Commit in logical steps. Write a clear `README.md` with setup, run, demo-login and architecture notes.

---

## 1. RECOMMENDED TECH STACK (change only with a written reason in DECISIONS.md)

- **Next.js (App Router) + TypeScript (strict)**, built **mobile-first as an installable PWA** (manifest and icons). Desktop gets a centered phone-width app shell or a tasteful responsive layout; mobile is the primary design target (design at 390px first).
- **Tailwind CSS + shadcn/ui** for components, **Framer Motion** for motion, **lucide-react** for icons, **Recharts** (or similar) for charts, **qrcode.react** for UPI QR codes.
- **Prisma + SQLite** for the database (easy zero-config demo), with a seed script.
- **Zod** for validation. Server Actions or route handlers for mutations.
- Simple session auth: phone number + simulated OTP (any 6-digit code works in demo mode, but display "Demo OTP: 123456"). Include a "Switch demo user" menu so a reviewer can jump between seeded personas without logging out.
- All money stored as **integer paise** in the DB. Display with Indian grouping (₹1,25,000; lakh/crore formatting in summaries).

---

## 2. PRODUCT SUMMARY (from the business description)

A mobile-first platform that lets students and young adults (18-30) form trusted **"Credit Circles"** (digital SHGs), pool small contributions, lend to members and vetted outsiders, and earn modest interest. The platform acts as a **connector + ledger, not a fund holder**.

**Problem:** Young Indians need small, short-term loans (education, skills, emergencies, micro-businesses, lifestyle). Banks are slow and collateral-heavy; fintech lenders are fast but expensive and lack community accountability; existing SHGs are rural, women-focused and offline.

**Gap/Positioning:** A trusted, digital, community-based credit system for students and young professionals: cheaper than fintechs, more accessible than banks. Brand idea: **"SHG for Gen Z."** Core values: trust-first, transparency-first, community over transaction, responsible credit (not "easy money").

---

## 3. FUNCTIONAL SPECIFICATION (MUST implement exactly)

### 3.1 User signup & identity (Flow step 1)
- Sign up with **mobile number + simulated PAN/Aadhaar eKYC**.
- eKYC is a simulated multi-step flow: enter PAN (format `AAAAA9999A`) or Aadhaar (12 digits; validate format, store masked last-4 only) -> simulated OTP -> "Verified" state with a verified badge on the profile.
- Profile captures: name, mobile, city (from the supported city list), segment (see 3.9), UPI VPA (e.g. `name@upi`, format-validated), optional institution/employer.
- Unverified users cannot join a circle, lend or borrow.

### 3.2 Circle creation & onboarding (Flow A)
- A user can **create** a Circle or **join** one via **invite** (invite code and shareable link). Circles are **invite-only with verified members** only.
- Circle types offered at creation (labels from the description): *College group, Hostel group, Friend circle, Young professionals' group, Campus club/team*.
- At creation the creator sets the **Circle rules**:
  - **Max loan size per member**
  - **Interest policy** (a rate, default within **8-12% p.a.**; enforce that range in validation with clear messaging)
  - **Approval threshold** (default **70%** of members must approve a loan; adjustable by creator within a sensible range)
  - **Late-payment penalties** (configurable, simple flat or % per late instalment)
- Roles: **Circle Admin** (creator, can manage members/rules) and **Member**. Provide basic **group management & governance tools**: invite/remove member, view and edit rules (edits to rules should be proposed and affect only *new* loans), member list with verification and risk status.

### 3.3 Pooling contributions (Flow B)
- Members **contribute small amounts, e.g. ₹500-₹5,000 per month** (enforce min ₹500 / max ₹5,000 per contribution in the prototype).
- Contributions are **logged in-app as "pool balance"**. A contribution is a *commitment recorded in the ledger + a simulated UPI confirmation*, not a transfer to the platform. Surface the line "Your money stays in your bank account" wherever contributions are discussed.
- Each circle shows: pool balance, per-member contribution totals, available lending capacity (liquidity).

### 3.4 Loan request & approval (Flow C)
- A member **or a vetted external borrower** requests a loan with: **amount, purpose, tenure, proposed interest**.
- Prototype constraints from the pilot phase: **tickets ₹5,000-₹20,000, tenors 1-6 months**. Enforce and explain these limits.
- When the request is viewed, the app shows:
  - **Risk score** of the borrower (if available; show "Not enough history" state otherwise)
  - **Group's current liquidity**
  - **Recommended max exposure**
- **Group votes/approves per the circle rules.** A loan is approved only when approvals >= the circle's threshold (default 70% of members). Support approve / reject / comment, a live vote tally with progress bar toward the threshold, and a defined voting window (configurable, default 48h; allow a "close vote" action for demo).
- Support **lending within the group** and **to vetted external borrowers / other groups**. External borrowers must be vetted (verified eKYC + minimum risk score or admin vetting flag). Cross-group lending is gated by a **compliance-mode toggle** (see 3.8).

### 3.5 Disbursement via UPI (Flow D)
- On approval, the app generates a **UPI payment link / QR** (`upi://pay?pa=<lender VPA>...`) **from the lender's VPA to the borrower's VPA** with **pre-filled amount and purpose note**.
- **The lender pays directly; the app records the event.** Provide a simulated "Pay with UPI" experience (a mock UPI sheet with Success/Failure outcomes) that, on success, writes a disbursement entry to the ledger. Handle failure and retry.
- For group-funded loans, support one or multiple lenders from the circle (a simple, clear split model; document it in DECISIONS.md).

### 3.6 Repayment & tracking (Flow E)
- Borrower repays via **UPI AutoPay mandate for EMIs** *or* **manual UPI payment links** (both must exist; AutoPay is a simulated mandate setup with a visible mandate status).
- A generated **repayment schedule (EMI table)** for each loan, using simple interest in the circle's rate (document formula in DECISIONS.md; make it deterministic and unit-tested).
- On every repayment the app updates: **loan balance, interest accrued, group pool balance**.
- Overdue handling: status transitions (Upcoming -> Due -> Overdue), **late-payment penalties** per circle rules, reminders (in-app notification list), and **restructuring tools** (the group can approve a restructure: extended tenure/new schedule) plus a light **mediation/enforcement** note flow ("Social accountability").

### 3.7 Transparent ledger & dashboards
- A **transparent, append-only ledger** of: contributions, loans, disbursements, repayments, interest, penalties, group balances. Every entry has timestamp, actor, circle, type, amount, status and a reference ID. Members of a circle can see the circle's full ledger. Export to CSV.
- Dashboards (names are required):
  - **"My position"**: total lent, total borrowed, net, upcoming dues, earnings.
  - **"Circle position"**: pool, outstanding, overdue, repayment rate, interest earned by the circle.
- **Transparent portfolio performance for each circle**: chart of pool vs outstanding over time, on-time repayment rate, yield (interest earned as modest % p.a.), exposure by borrower.
- **Risk-sharing** must be clear: explain and show how losses on a defaulted loan are shared among lending members (proportional to the amount each contributed to that loan). Show an explainer in the UI.

### 3.8 Risk, nudges & regulatory strategy (critical)
- **Risk score** (0-100 with band: Low / Medium / High risk) computed from transparent factors: on-time repayment history, tenure on platform, circle approval ratio, existing outstanding vs. contribution, verification status. Show the factors (explainable, not a black box). Implement as a pure, unit-tested function.
- **Diversification nudges**: when a lender's/circle's exposure to a single borrower exceeds a threshold, or concentration is high, show a nudge. Show the **recommended max exposure** (e.g. a % of the pool per borrower).
- **Repayment tracking** with overdue flags.
- **Regulatory posture (build this in, don't ignore it).** The description recommends **Option A: partner with an NBFC-P2P** (platform is the tech/LSP; the licensed partner runs escrow and compliance), later maybe Option B (own licence), or Option C (strictly closed circles). Implement a **Compliance Mode** setting (admin/demo config):
  - **Mode A, Partnered (default):** loans route through a *simulated* `PartnerEscrowService`; show a "Processed via licensed NBFC-P2P partner (simulated)" badge and partner-compliance statuses on loan steps.
  - **Mode C, Closed circles:** only lend within a known circle; external/cross-group lending is disabled with an explanation.
  - (Mode B is shown as "Future: own licence" in a roadmap/info card only.)
- Include non-intrusive legal copy: Terms of Service and Privacy Policy placeholder pages, a loan agreement **template** generated per loan (view-as-page / printable), and risk disclosure language ("Lending carries risk of loss"). Keep tone honest and responsible, never "easy money".

### 3.8b Fees & revenue (build visibly)
- **Platform fee:** 1-2.5% of principal per facilitated loan (default 1.5%; show the fee transparently on the loan summary before approval).
- **Service fee (premium):** ₹50-₹200 per month per group for premium features (analytics, auto-invest, priority support). Implement a simple **Circle Premium** upgrade screen (simulated) that unlocks the extra analytics view.
- **Cross-sell (later):** show "Coming soon" cards only: insurance, financial-literacy courses, credit reports.
- Provide a minimal **internal revenue view** (admin demo page) showing platform fees collected and premium subscriptions, so the revenue model is demonstrable.

### 3.9 Target segments (used in onboarding, personas and seed data)
| Segment | Profile | Credit need | Lending capacity |
|---|---|---|---|
| College students | 18-24, hostels/PGs, limited income | Small emergencies, fees, gadgets | Low-moderate |
| Young professionals | 22-30, early career, gig/freelance | Lifestyle, upskilling, small business | Moderate |
| Campus clubs / teams | Formal/informal groups with treasuries | Group projects, events, member welfare | Moderate |
| Microentrepreneurs | Young sellers, freelancers, small vendors | Inventory, equipment, working capital | Moderate-high |

Supported cities: **Hyderabad, Bengaluru, Pune, Delhi NCR, Mumbai, Chennai, Ahmedabad** (initial pilot focus: **Hyderabad**, 2-3 campuses).
Loan purpose options should map to needs above: education/fees, skills/upskilling, emergency, micro-business inventory/equipment/working capital, gadgets/lifestyle, event/club.

### 3.10 Value proposition (must be visible in onboarding/marketing screens)
- **Borrowers:** cheaper than fintech lenders (community rates, not max market rates); faster than banks (peer approval, minimal paperwork); social accountability (borrowing from your circle, not a faceless app); flexible terms (group can restructure).
- **Lenders (groups):** earn modest, transparent interest on idle money; community impact; control & transparency; low entry barrier (small contributions).
- **Platform strengths** to express in brand and copy: network effects, behavioural data insights, "SHG for Gen Z" differentiation.

### 3.11 Pilot metrics (build a small admin "Pilot Metrics" page)
Show: active Circles (target 50-100 in pilot), on-time repayment rate, group retention, NPS (simulated survey widget), average pool size, total AUM facilitated, platform take rate. Include the illustrative 3-year projection table (Active Circles 100/1,000/5,000; avg pool ₹50k/₹1 lakh/₹2 lakh; AUM ₹50 lakh/₹10 cr/₹100 cr; take rate 1.5%/2%/2%; revenue ₹7.5 lakh/₹20 lakh/₹2 cr) as a static, clearly-labelled **"Illustrative"** panel on the admin page.

---

## 4. INFORMATION ARCHITECTURE & SCREENS

Bottom tab navigation on mobile (sidebar on desktop): **Home - Circles - Lend/Borrow (Loans) - Ledger - Profile**.

Required screens/flows (each must be fully designed and functional):
1. **Splash / Welcome**: brand, one-line value prop, "Get started".
2. **Sign-up**: phone -> simulated OTP -> eKYC (PAN/Aadhaar) -> profile (city, segment, VPA) -> success.
3. **Home**: greeting, "My position" summary card, upcoming dues, circle cards, pending votes, nudges, quick actions (Contribute, Request loan, Create circle).
4. **Circles list + Create Circle wizard** (type -> name/description -> rules -> invite members).
5. **Circle detail**: tabs for Overview ("Circle position"), Members, Loans, Ledger, Rules/Governance, Performance (portfolio charts), Invite.
6. **Join via invite** screen.
7. **Contribute** flow (amount within ₹500-₹5,000, simulated UPI confirmation, ledger entry).
8. **Loan request form** (amount, purpose, tenure, proposed interest, with live EMI/total-repayable preview and fee display) with risk score, liquidity and recommended exposure panel.
9. **Loan detail**: status timeline (Requested -> Voting -> Approved -> Disbursed -> Repaying -> Closed/Overdue/Restructured), vote tally, agreement template, schedule, comments.
10. **Voting UI** for members (approve/reject/comment).
11. **Disbursement screen**: UPI link + QR + simulated pay sheet, success/failure.
12. **Repayment screen**: AutoPay mandate setup and manual UPI link, schedule with statuses.
13. **Restructure / mediation** flow.
14. **Ledger** (filter by circle/type/date; CSV export).
15. **My position** dashboard and **Risk score** detail (factor breakdown).
16. **Notifications** center.
17. **Profile / Settings**: verification status, VPA, Compliance Mode (demo), demo-user switcher, legal pages, Circle Premium.
18. **Admin pages** (demo): Pilot Metrics, Revenue, Projections (illustrative).
19. **Info/explainer** screens: "How Circles work", "Risk-sharing explained", "Where your money stays" (the connector + ledger principle).

---

## 5. DATA MODEL (minimum; extend as needed)

`User`, `KycRecord` (masked), `Circle` (type, rules: maxLoan, interestPct, approvalThresholdPct, latePenalty, complianceMode), `Membership` (role, status, joinedAt), `Contribution`, `LoanRequest` (borrower, amount, purpose, tenure, interest, status, isExternal), `Vote`, `Loan`/`Disbursement` (lender splits), `RepaymentSchedule`/`Instalment`, `Repayment`, `LedgerEntry` (append-only, typed), `Mandate` (AutoPay), `RiskScoreSnapshot`, `Notification`, `Invite`, `Comment`, `RestructureProposal`, `PremiumSubscription`, `PlatformFee`.

Enforce invariants in code and tests: ledger entries are never updated/deleted (only appended; corrections are reversing entries); pool balance = sum of contributions - disbursed principal + repaid principal (+ interest, per documented rule) and must reconcile with the ledger at all times.

---

## 6. DESIGN & UX DIRECTION (high priority)

**Design goal:** clean, sleek, minimalistic yet creative and eye-catching. It must feel **trustworthy like a fintech, warm like a community, and fresh like a Gen Z product**. It should *not* look like a stiff bank app, a generic crypto dashboard, or a cluttered loan app.

**Core visual concept: "The Circle."** Use the circle motif as the product's signature: circular avatars arranged around a ring to represent members; a **ring/donut "pool" gauge** showing pool vs lent vs available; ring-shaped progress for vote thresholds and repayment; soft circular shapes and generous rounding. A circle is the shape of community, of a coin, and of the SHG "sitting in a circle."

**Palette (suggested, refine tastefully):**
- A deep, confident primary (ink/indigo or deep teal) for trust.
- One warm, energetic accent (saffron/marigold or coral) used sparingly for key actions, a nod to Indian context.
- A fresh secondary (mint/green) for positive money states, a clear amber for due/attention, and a restrained red only for overdue/risk.
- Soft off-white background, subtle warm greys; excellent contrast (WCAG AA). Provide a polished **dark mode**.

**Typography:** a modern, friendly geometric/humanist sans for UI (e.g. Inter, Plus Jakarta Sans, or Manrope) with a distinctive display face for headings and big numbers. Use tabular numerals for money. Establish a clear type scale.

**Layout & components:** generous whitespace, 8px grid, large touch targets (>=44px), card-based but light (avoid heavy borders/shadows), rounded-2xl corners, sticky bottom nav, thumb-reachable primary CTAs, bottom sheets for actions (contribute, vote, pay), skeleton loaders.

**Motion:** subtle, purposeful Framer Motion: animated ring gauges, number count-ups, a satisfying confirmation animation on successful UPI payment, smooth sheet transitions, gentle micro-interactions on voting. Respect `prefers-reduced-motion`.

**Illustration/graphics:** simple, original vector shapes and gradients built in code (no copyrighted assets, no real brand logos besides generic "UPI" text styling). Generate avatars from initials with a friendly color system. Create an original wordmark/logo for the working product name (choose a short, friendly, ownable working name, e.g. "Circlo" or similar, and make it a single config constant so it is easy to rename).

**Tone of voice:** warm, plain-English, honest, Gen-Z friendly but never flippant about money. Use phrases like "Your money stays in your bank." Always show risk honestly.

**Trust & transparency UI patterns:** show the ledger prominently; show "who voted what" (configurable), fee breakdowns before any commitment, clear risk labels with explanations, and a persistent "Simulated prototype" ribbon in non-production mode.

**Accessibility:** semantic HTML, focus states, ARIA for gauges/charts (with text alternatives), full keyboard navigation, no color-only meaning.

---

## 7. ENGINEERING REQUIREMENTS

- Clear separation: `/lib/domain` (pure business logic: EMI/interest, risk score, voting rules, exposure/nudges, pool reconciliation), `/lib/services` (simulated UPI/KYC/Escrow behind interfaces), `/app` (UI/routes), `/prisma`.
- **Unit tests (Vitest/Jest)** for: EMI schedule & interest math, risk score, approval-threshold logic (incl. 70% edge cases), rule validation (8-12%, ₹500-₹5,000, ₹5k-₹20k, 1-6 months), ledger reconciliation, late-penalty calculation, risk-sharing on default.
- Basic **e2e smoke tests** (Playwright) for the golden path: sign up -> create circle -> contribute -> request loan -> vote to threshold -> disburse -> repay.
- Input validation and error handling everywhere; no unhandled promise rejections; strict authorization (only circle members can see a circle's data; only admins can change rules).
- Performance: fast first load, optimized images/fonts, lighthouse mobile >= 90 target.
- `npm run dev`, `npm run build`, `npm run test`, `npm run seed` must all work cleanly from a fresh clone.

---

## 8. STRETCH / VISIBLE-BUT-STUBBED (build as polished "Coming soon" or light implementation; never break core)
- Cross-sell cards (insurance, financial-literacy courses, credit report).
- Auto-invest (premium) toggle.
- B2B SaaS fallback info card for SHGs/MFIs (mentioned in the description's "if metrics mixed" path).
- Option B (own NBFC-P2P licence) roadmap card.
- Multilingual hook (English first; structure strings for future Hindi/Telugu).

---

## 9. SEED DATA (realistic, Indian context)

Create **3 demo circles in Hyderabad** (e.g. a college hostel group, a young-professionals group, a campus club) plus 1 each in Bengaluru and Pune to show breadth. Seed ~10-14 users across all four segments with verified status, believable Indian names and VPAs; contribution histories in ₹500-₹5,000 range; a mix of loans in every state (voting, approved, disbursed, repaying on-time, due, overdue with penalty, restructured, closed); at least one external-borrower loan; one defaulted/at-risk loan to demonstrate risk-sharing; ledger entries consistent with everything; and risk scores that vary. Provide **3 one-click demo personas** (a Student Borrower, a Circle Admin/Lender, a Young Professional/Microentrepreneur) from the login screen.

---

## 10. DELIVERABLES

1. Complete working source code in a clean repo structure.
2. `README.md` (setup, scripts, demo logins, architecture, how simulation layers map to real integrations).
3. `DECISIONS.md` (every assumption/deviation, interest formula, lender split model, risk-score weights, risk-sharing rule).
4. `FEATURE_MAP.md`: a table mapping **each section of the business description (1-16) to the screens/files that implement it**, with status (Done / Stubbed / Out of scope + why).
5. Passing unit and smoke tests.

---

## 11. ACCEPTANCE CHECKLIST (verify each before declaring done)

- [ ] Sign-up with mobile + simulated eKYC (PAN/Aadhaar) works; unverified users are blocked from lending/borrowing.
- [ ] Create/join invite-only circles; rules: max loan, interest (8-12%), approval threshold (default 70%), late penalties.
- [ ] Contributions limited to ₹500-₹5,000; logged as logical pool balance; no wallet or platform-held funds anywhere.
- [ ] Loan request (amount, purpose, tenure, interest) within ₹5k-₹20k and 1-6 months; shows risk score, liquidity, recommended max exposure.
- [ ] Voting enforces the threshold correctly; internal and external (vetted) borrowers supported; Compliance Mode A/C behaves as described.
- [ ] Approved loans generate UPI link/QR from lender VPA to borrower VPA with pre-filled amount + note; simulated payment records to ledger.
- [ ] Repayment via AutoPay mandate and manual UPI links; loan balance, interest accrued and pool balance update correctly.
- [ ] Overdue states, penalties, restructuring and mediation flows work.
- [ ] Append-only ledger with CSV export; "My position" and "Circle position" dashboards; circle portfolio performance charts; risk-sharing explained.
- [ ] Diversification nudges and explainable risk scores present.
- [ ] Platform fee 1-2.5% shown per loan; Circle Premium ₹50-₹200/month; admin revenue and pilot metrics pages; illustrative projections labelled.
- [ ] Design matches Section 6 (circle motif, palette, typography, motion, dark mode, mobile-first, accessible).
- [ ] Seed data makes every screen look alive; 3 demo personas available.
- [ ] Tests pass; build succeeds; README, DECISIONS and FEATURE_MAP delivered.

Begin by writing a short implementation plan (architecture, data model, screen list, build order), then build the MVP end to end, and finish by running the tests and walking through the acceptance checklist, fixing anything unchecked.
