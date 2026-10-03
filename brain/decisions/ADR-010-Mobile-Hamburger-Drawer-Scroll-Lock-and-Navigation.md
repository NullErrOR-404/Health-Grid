---
title: "ADR-010: Mobile Hamburger Drawer Seamless Marquee Alignment and Unrestricted Touch Scrolling"
status: accepted
date: 2026-10-03
tags:
  - adr
  - architecture
  - mobile
  - ui-ux
  - navbar
  - marquee
  - scroll-lock
  - touch
parent: "[[00_Index]]"
---

# 📜 ADR-010: Mobile Hamburger Drawer Seamless Marquee Alignment and Unrestricted Touch Scrolling

Back to [[00_Index]]

## Context
During live-device mobile testing of HealthGrid on mobile smartphones (iOS Safari, Android Chrome), two critical user experience deficiencies were discovered with the mobile hamburger navigation drawer:
1. **Vertical Disconnect from Government Marquee**:
   - The government health alert ticker (`GovAlertMarquee`) was positioned as a static bar outside the sticky header, while the hamburger drawer was rendered at an arbitrary top offset (`top-16`, 64px). This severed the visual connection between the marquee and the drawer, cutting through the navbar and preventing the drawer from blending into the top bar.
2. **Frozen / Trapped Touch Scrolling Inside Hamburger Section**:
   - When citizens opened the hamburger drawer, touch gestures inside the drawer were frozen. Swiping with a finger failed to scroll down through the service buttons.
   - Root Causes Identified:
     - **`html` Overflow Lock Freezing WebKit**: `document.documentElement.style.overflow = 'hidden'` and `html.lenis-stopped { overflow: hidden !important; }` in CSS completely halted the native iOS Safari/WebKit touch-scroll event loop across all nested child containers.
     - **Lack of Fixed Viewport Sizing**: The drawer inner element used `max-h` without being structured as a rigid flex column (`h-[calc(100dvh-40px)] flex flex-col`), causing mobile Safari to treat it as non-overflowing.
     - **Missing Lenis Touch Prevention**: Lenis event interceptors captured gestures on containers lacking `data-lenis-prevent="true"`.

## Decision

We implemented a coordinated **Seamless Marquee Alignment & Unrestricted Touch-Scrolling Architecture** across `App.tsx`, `Navbar.tsx`, and `index.css`:

1. **Sticky Header Hierarchy Unification**:
   - In `App.tsx` (across `landing`, `maps`, and `medicines` views) and `NotFoundPage.tsx`, nested `<GovAlertMarquee>` inside `<header className="sticky top-0 z-40 w-full">` directly above `<Navbar>`.
   - Result: The marquee is guaranteed to remain docked at `top: 0` (`h-[40px] sm:h-[42px]`) under all scroll conditions.

2. **Pixel-Perfect Marquee Bottom Alignment**:
   - Bounded the mobile hamburger drawer to `top-[40px] sm:top-[42px]`, anchoring its top edge directly against the dark bottom border (`border-slate-800/90`) of the Government Health Bulletin marquee with zero pixel gap.
   - Total height dynamically set to `h-[calc(100dvh-40px)] sm:h-[calc(100dvh-42px)]`, spanning from the marquee's bottom to the bottom of the device screen.
   - Injected a top dark border accent (`border-t border-slate-800/80`) on the drawer shell, seamlessly blending the dark bulletin bar into the navigation sheet.

3. **Unrestricted, Fluid Native Touch Scrolling**:
   - Structured the drawer as a two-tier flex layout:
     - **Tier 1 (Header)**: `flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs z-20` featuring `[← Back]`, `HealthGrid Menu`, and `[✕ Close]`.
     - **Tier 2 (Scrollable Body)**: `flex-1 overflow-y-scroll overscroll-contain p-4 sm:p-6 space-y-4 pb-32 safe-area-pb` with `style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}` and `data-lenis-prevent="true"`.
   - **`overflow-y-scroll` Enforcement**: Guarantees mobile Safari instantiates native momentum scrolling immediately upon mount.
   - **Eliminated `document.documentElement` Overflow Lock**: Removed `document.documentElement.style.overflow = 'hidden'`. Only `document.body.style.overflow = 'hidden'` is applied, ensuring iOS Safari does not freeze nested child scroll containers.
   - **CSS Override in `index.css`**: Explicitly enforced `touch-action: pan-y !important; overscroll-behavior: contain !important; -webkit-overflow-scrolling: touch !important;` on `[data-lenis-prevent="true"]` containers even when `html.lenis-stopped` is active.

4. **Comprehensive Mobile Service Suite**:
   - Expanded mobile drawer contents to include:
     - 24/7 Emergency Support (108 dispatch + 104 call)
     - Public Health Alerts (Dengue Outbreak radar)
     - Profile / Sign In Card
     - Language Selector (English / தமிழ்)
     - Quick Access Services (Chat, Home, Scan Prescription, Cheap PMBJP Medicines, Maps, Baby Immunization Shots)
     - Hospital OPD Citizen Intake triage link
     - Privacy Policy & DPDP 2023 compliance badge
     - Logout action (when authenticated)
     - ABDM compliance attribution footer

## Consequences

### Positive
- **100% Fluid Mobile Scrolling**: Citizens can effortlessly swipe down and up through all health services, cards, and options with native inertia.
- **Zero Gap Aesthetic**: The hamburger drawer opens cleanly flush against the government alert marquee, creating a cohesive, professional government-grade health portal interface.
- **Clear Wayfinding**: Prominent `[← Back]` and `[✕ Close]` buttons remain docked at the top of the drawer directly below the marquee for effortless dismissal.

### Negative / Trade-offs
- The marquee remains visible above the open hamburger menu; this is intentional as it maintains real-time public health broadcast awareness.

## Related Notes
- [[ADR-008-Mobile-Navbar-Zero-Overflow-Architecture]]
- [[ADR-009-Mobile-Login-Scroll-and-ChatUI-Minimal-Pills]]
- [[Design_System_Tokens]]
- [[Mobile_UI_UX_Laws_Audit]]
