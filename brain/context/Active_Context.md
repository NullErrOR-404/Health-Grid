---
title: Active Working Context & Project State
tags:
  - context
  - state
  - tasks
  - active
created: 2026-10-02
last_updated: 2026-10-05
parent: "[[00_Index]]"
---

# ⚡ Active Working Context & Project State

Back to [[00_Index]]

## Current System State
- **Git Branch**: `main`- **Latest Commit**: `f5e277b` (`docs(brain): record ADR-019 Clinical Pharmacology Engine in Second Brain`)
- **Vercel Production Deployment**: Verified Live (200 OK across all 4 production aliases)
- **Deployment URL**: `https://healthgrid-p34lhsxox-sameen14nmofficial-8826s-projects.vercel.app`
- **Local Dev Server**: `http://localhost:5173/` (Vite v8.3.1 Active)
- **Live Aliases**:
  - `https://healthgrid-app.vercel.app` (200 OK)
  - `https://healthgrid-nu.vercel.app` (200 OK)
  - `https://healthgrid-live.vercel.app` (200 OK)
  - `https://healthgrid-network.vercel.app` (200 OK)

## Recent Completed Tasks
- [x] Comprehensive Mobile-First UI/UX & Responsive Redesign completed across all 11 views and 10 clinical modals.
- [x] Removed autonomous floating mascot (`RoamingDocBot`) to eliminate mobile screen clutter and touch hijacking.
- [x] Transitioned clinical modals into responsive Fullscreen Mobile Sheets (`p-0 sm:p-4`, `rounded-none sm:rounded-3xl`, `safe-area-pb`).
- [x] Solved Leaflet map sizing on mobile with responsive Segmented `[List | Map]` View Switcher and `invalidateSize()`.
- [x] Solved DocBot Consultation viewport with `100dvh` root, off-canvas sliding sidebar drawer, and hamburger toggle.
- [x] Solved Hospital ERP mobile navigation with sliding off-canvas drawer and responsive quick-action modals.
- [x] Implemented dynamic administrator credential allocation for hospitals (`HG-H002` GMCH `gmch_admin` / `GMCH#Hospital2026`).
- [x] Converted Privacy Policy & Terms buttons into crawlable semantic HTML `<a href="...">` links.
- [x] Disabled Vercel SSO protection to eliminate 302 redirects on `.vercel.app`.
- [x] Integrated concise User Data & Google OAuth Transparency section docked on the left, fully exposing the 3D DocBot mascot on the right.
- [x] Initialized and linked project-specific **Obsidian Second Brain** in `brain/` with interactive graph coloring and Map of Content (MOC).
- [x] Decommissioned legacy vibecoded `HospitalInformationSystem.tsx` (1,279 lines) and stripped all Doctor Portal / Hospital HIS CTAs; consolidated hospital management on [[Hospital_ERP_Dashboard]] (see [[ADR-006-Decommission-Legacy-HIS-Doctor-Portal]]). Preserved citizen OPD screening intake modal as `frontend/src/components/PatientIntakeModal.tsx`.
- [x] Decommissioned autonomous floating mascot (`RoamingDocBot.tsx`) and scroll-tracking thought bubbles completely from runtime and codebase (see [[ADR-007-Decommission-Roaming-Mascot]]).
- [x] Implemented Mobile Navbar Zero-Overflow Architecture (`h-16 sm:h-20`, compact logo, hidden top SOS/bell on mobile, high-contrast 108 Emergency Banner in mobile drawer) (see [[ADR-008-Mobile-Navbar-Zero-Overflow-Architecture]]).
- [x] Fixed Mobile Login Modal Scroll Trapping by hiding desktop marketing banners on mobile (`hidden lg:flex`), removing fixed minimum heights, and enabling smooth touch scrolling; overhauled ChatbotPage top header into ultra-minimal single-line pills (`[ 📹 Live ]`, `[ 🩺 Records ]`, `[ 🌐 EN ]`, `[ 👤 Sign In ]`) with zero text wrapping, and transformed in-chat suggestions, voice selectors, and docked controls into concise rounded-full pills (see [[ADR-009-Mobile-Login-Scroll-and-ChatUI-Minimal-Pills]]).
- [x] Seamlessly Aligned Mobile Hamburger Drawer Below Marquee with Unrestricted Native Touch Scrolling: Placed `<GovAlertMarquee>` inside sticky `<header className="sticky top-0 z-40 w-full">` across all views, anchored hamburger drawer at `top-[40px] sm:top-[42px]` directly touching the marquee's bottom border; built two-tier flex layout with fixed top header (`[← Back]` + `[✕ Close]`) and `flex-1 overflow-y-scroll overscroll-contain` content container; eliminated `document.documentElement.style.overflow = 'hidden'` which was freezing iOS Safari touch scrolling; enforced `touch-action: pan-y !important` and `-webkit-overflow-scrolling: touch` via `[data-lenis-prevent="true"]` in `index.css` (see [[ADR-010-Mobile-Hamburger-Drawer-Scroll-Lock-and-Navigation]]).
- [x] Architected and Implemented Family & Beneficiary Multi-Profile System (ABDM CoWIN Caregiver Model): Built `familyMemberService.ts` and `ConsultationBeneficiaryModal.tsx` allowing primary users to register dependents (Mother, Father, Child, Spouse, etc.) with unique auto-generated Health IDs (`HG-FAM-XXXX`); integrated top header patient switcher pill in `ChatbotPage.tsx`, third-person caregiver AI bedside prompting, caregiver banner in chat, hospital OPD triage token beneficiary selector in `PatientIntakeModal.tsx`, and dedicated Family & Beneficiaries management hub in `ProfilePage.tsx` and `Navbar.tsx` (see [[ADR-011-Family-and-Beneficiary-MultiProfile-System]]).
- [x] Architected and Implemented ABDM Beneficiary-to-Independent Account Porting Protocol: Resolved the dual-ID lifecycle challenge when a dependent (e.g., Mother) creates her own sovereign HealthGrid account. Implemented bidirectional 1-tap transfer authorization handshake (`ClaimBeneficiaryRecordsModal.tsx`), preserved legacy IDs as immutable verified Historical Aliases (`linkedHistoricalAliases`), re-indexed past consultations/prescriptions with clinical caregiver provenance tags, and established ABDM Delegated Co-Caregiver mode with full patient data sovereignty and access revocation under the DPDP Act 2023 (see [[ADR-012-Beneficiary-to-Independent-Account-Porting]]).
- [x] Architected and Implemented Beneficiary OTP Verification, Quota Governor, and 108 Emergency Contact Sync: Solved identity disambiguation and beneficiary legitimacy via mandatory 10-digit mobile and 6-digit OTP verification (with proxy caregiver OTP for young children/elderly); enforced strict 7-dependent quota (`MAX_BENEFICIARIES = 7`) with slot tracking; engineered two-way dynamic synchronization between beneficiaries and 108 Emergency Contacts list; and established 1-tap direct discoverability via header jump button in `ProfilePage.tsx` and auto-scrolling link in `Navbar.tsx` (see [[ADR-013-Beneficiary-OTP-Verification-and-Emergency-Sync]]).
- [x] Honed Chat Module Voice Engine & Conversational Intelligence (ADR-014): Eliminated mobile microphone hardware lock collisions by implementing Single-Pipeline Direct Capture with user permission guidance; boosted Read Aloud Text-to-Speech (TTS) to instant zero-latency native browser speech synthesis at 1.1x brisk conversational cadence with markdown punctuation scrubbing; and implemented Conversational Chameleon intent routing in `aiService.ts` to respond naturally and warmly to casual greetings (*"hi"*, *"how r u"*) without unprompted, robotic medical probing (see [[ADR-014-Conversational-Chameleon-and-Speech-Pipeline]]).
- [x] Architected Vernacular Speech Engine, Tanglish Normalization, and Multi-Turn Conversation Continuity (ADR-015): Engineered dual-stream speech recognition combining 0ms Web Speech interim visual feedback with Groq Whisper Large-v3-Turbo clinical Indic prompting; created `TanglishNormalizer` dictionary translating regional colloquialisms (*"mandai idi"*, *"udambu soodu"*, *"nenjerichal"*, *"asathi"*) to clinical entities and emergency triage flags; and enforced the Conversation Continuity Protocol banning repeated greetings (*"Hello"*, *"Vanakkam"*) in mid-consultation turns with an expanded 8-turn clinical context window (see [[ADR-015-Vernacular-Speech-and-Conversational-Continuity]]).
- [x] Architected Autonomous Hybrid Vector RAG and Ambient Clinical Automations (ADR-016): Built `vectorRagService.ts` executing <2ms continuous semantic embedding vector calculations and cosine similarity matching across 4 clinical knowledge domains (Jan Aushadhi PMBJP generic formulary with price savings, ICMR/NVBDCP clinical protocols, Tamil Nadu 24/7 casualty centers, and Patient Longitudinal Vault); integrated ambient behind-the-scenes automations in `aiService.ts` (1-click SBAR Doctor Handover brief generator, Jan Aushadhi pharmacy substitute savings slip calculator, and proactive 24h care-loop recovery tracker) with ZERO UI CLUTTER or extra buttons as mandated (see [[ADR-016-Autonomous-Hybrid-Vector-RAG-and-Ambient-Clinical-Automations]]).
- [x] Architected Clinical Pharmacology Engine, Formulary Grounding, and Patient Context Matching (ADR-019): Built `ClinicalPharmacologyEngine` in `prescriptionAiService.ts` matching prescription tokens against authentic Indian Pharmacopeia formulations and Jan Aushadhi (PMBJP) catalogues; grounds smudged dosages into registered market strengths; checks patient age (pediatric vs adult), recorded allergies, and drug-food interactions; surfaces mild passive safety advisories without blocking user checkout; and consolidates multi-page medications into a deduplicated daily regimen (see [[ADR-019-Clinical-Pharmacology-Engine-Formulary-Grounding-and-Context-Matching]]).
- [x] Deployed production build to Vercel and verified on all 4 live production aliases (`healthgrid-app.vercel.app`, `healthgrid-nu.vercel.app`, `healthgrid-live.vercel.app`, `healthgrid-network.vercel.app`) with HTTP 200 OK.

## In-Flight / Next Focus
- [ ] Submit Google Cloud Console OAuth consent screen for production branding verification.
- [ ] Monitor Google Search Console indexing and crawler telemetry.
- [ ] Real-time updates to this Second Brain whenever new clinical features or architectural modifications ship.

## Related Notes
- [[00_Index]]
- [[Hospital_ERP_Dashboard]]
- [[ADR-006-Decommission-Legacy-HIS-Doctor-Portal]]
- [[ADR-007-Decommission-Roaming-Mascot]]
- [[ADR-008-Mobile-Navbar-Zero-Overflow-Architecture]]
- [[ADR-009-Mobile-Login-Scroll-and-ChatUI-Minimal-Pills]]
- [[ADR-010-Mobile-Hamburger-Drawer-Scroll-Lock-and-Navigation]]
- [[ADR-011-Family-and-Beneficiary-MultiProfile-System]]
- [[ADR-012-Beneficiary-to-Independent-Account-Porting]]
- [[ADR-013-Beneficiary-OTP-Verification-and-Emergency-Sync]]
- [[ADR-017-Clinical-Synergy-and-Prescription-Demographic-OCR]]
- [[ADR-018-Top-Tier-Multimodal-Prescription-Vision-and-HTR-Cascade]]
- [[ADR-019-Clinical-Pharmacology-Engine-Formulary-Grounding-and-Context-Matching]]
- [[Key_Credentials_and_Environments]]
- [[Deployment_and_Domains]]
