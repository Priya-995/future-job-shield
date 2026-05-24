# TrustHire — Futuristic AI Hiring Trust Platform

A demo-quality, fully animated multi-page app with mock AI outputs. No real backend — all data is local/mock for a polished hackathon presentation.

## Tech & Setup
- TanStack Start (existing template) + React + TailwindCSS v4
- Framer Motion for animations (`bun add framer-motion`)
- shadcn/ui components (already present)
- Recharts for trust score charts (already present)
- Lucide icons

## Design System (src/styles.css)
- Dark mode default (deep navy/black background)
- Blue→purple gradient tokens: `--gradient-primary`, `--gradient-glow`
- Glass tokens: backdrop-blur surfaces with subtle borders
- Glow shadows: `--shadow-glow`, `--shadow-elegant`
- Typography: Inter / Space Grotesk via Google Fonts
- Custom keyframes: float, pulse-glow, shimmer, scan-line, fade-up, typing-cursor

## Routes (file-based, src/routes/)
1. `index.tsx` — Landing page
2. `recruiter.tsx` — Recruiter dashboard (job entry form)
3. `analysis.tsx` — AI Trust Analysis screen (results)
4. `student.tsx` — Student dashboard
5. `fit.tsx` — Honest Fit Explanation (conversational typing AI)
6. `jobs.tsx` — Verified Jobs Feed

Each route gets unique `head()` meta (title, description, og).

## Shared Components (src/components/)
- `Navbar.tsx` — sticky glass nav with TanStack `<Link>` between routes
- `Footer.tsx`
- `GlassCard.tsx` — reusable glass surface
- `GlowButton.tsx` — gradient button with animated glow
- `TrustScoreRing.tsx` — animated circular score (SVG + Framer Motion)
- `AnimatedStat.tsx` — count-up fake live stats
- `FloatingAICard.tsx` — floating cards in hero
- `LoadingScanner.tsx` — AI scanning effect with rotating status text
- `TypingText.tsx` — typewriter effect for AI responses
- `JobCard.tsx` — verified job card

## Page Details

### Landing (`/`)
- Hero: massive headline, subheadline, two glowing CTAs ("Try as Recruiter" → /recruiter, "Find Verified Jobs" → /jobs)
- Animated TrustScoreRing centerpiece with floating AI cards around it
- Fake live stats strip (Jobs Verified, Scams Blocked, Students Matched, Trust Score Avg) with count-up animation
- Features grid (6 glass cards): Fraud Detection, Domain Check, Salary Transparency, Hiring Authenticity, Honest Fit, Verified Feed
- "How it works" 3-step section
- Testimonials carousel (3 students + 1 recruiter)
- Scroll-triggered fade-up animations via Framer Motion `whileInView`

### Recruiter Dashboard (`/recruiter`)
- Form: company name, job title, salary, website URL, JD textarea
- Large glowing "Analyze Trust Score" button → navigates to `/analysis` with form data via search params or zustand store
- Sidebar with mock recent analyses

### AI Trust Analysis (`/analysis`)
- 3-second mock loading screen with rotating texts ("Analyzing hiring patterns…", "Scanning fraud signals…", "Checking company legitimacy…", "Running AI verification…") + scan-line effect
- Then animated reveal of:
  - Big TrustScoreRing (e.g. 87/100) with verdict
  - 6 metric cards with animated progress bars: Fraud Risk, Domain Credibility, Salary Transparency, Hiring Authenticity, AI Scam Detection, Language Analysis
  - Two columns: Positive Signals (green checks) / Suspicious Signals (amber warnings)
  - Recharts radar chart of dimensions
- Mock scoring deterministic-ish from input hash so same input → same score

### Student Dashboard (`/student`)
- Profile completion ring
- Resume upload dropzone (mock — just stores filename)
- Skill chip cards with mastery bars
- Verified job recommendations (3 JobCards) with AI match %
- Quick links to /jobs and /fit

### Honest Fit (`/fit`)
- Conversational AI panel with TypingText effect
- Sections: Why you match / Missing skills / Growth suggestions / Honest feedback / Final recommendation
- Animated chat-bubble reveals sequentially
- "View matching jobs" CTA → /jobs

### Verified Jobs Feed (`/jobs`)
- Filter chips (All / Top trust / High match)
- Grid of JobCards: company logo (placeholder), trust score badge, salary, AI insight one-liner, scam alert indicator (only on flagged jobs for contrast), match %, "Verified" badge
- Hover: glow + lift

## Mock Data
- `src/lib/mock-data.ts` — array of jobs, testimonials, skills, analysis results
- `src/lib/mock-analysis.ts` — function that takes form input and returns deterministic-ish scores

## State
- Lightweight `src/lib/store.ts` (zustand) to pass recruiter form input from /recruiter → /analysis without backend

## Animations Inventory
- Framer Motion variants for fade-up, stagger children
- Animated number count-up hook
- SVG circle stroke-dashoffset animation for trust ring
- CSS keyframes for floating cards, glow pulse, gradient shift, scan line, shimmer
- Page transitions via AnimatePresence on route change (in __root layout)

## Out of Scope
- Real auth, real DB, real AI calls, real file parsing — all mocked
- Lovable Cloud not enabled (user said avoid backend complexity)

Total: ~6 routes, ~10 reusable components, 1 design-system update, mock data files. Implemented in one build pass.