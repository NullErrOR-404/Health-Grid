---
title: "ADR-008: Mobile Navbar Zero-Overflow Architecture & Drawer Emergency Card"
tags:
  - decision
  - adr
  - navbar
  - mobile-ui
  - responsive
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-008: Mobile Navbar Zero-Overflow Architecture & Drawer Emergency Card

Back to [[00_Index]]

## Context
When inspecting the deployed application on small-screen mobile devices (<640px viewport width), several horizontal overflow issues occurred:
1. The Navbar header was fixed at `h-20` (80px), occupying disproportionate vertical screen space.
2. The wide horizontal logo (`Logo.png`) combined with the language pill (`[ EN ⌵ ]`), notification bell, user profile pill, and SOS ambulance button overwhelmed narrow viewports (360px–412px), pushing the hamburger menu out of view and triggering horizontal scroll.
3. Users requiring emergency assistance had multiple competing SOS buttons that clashed in the top bar.

## Decision
1. **Zero-Overflow Compact Mobile Top Bar**:
   - Rescaled header container height from static `h-20` to responsive `h-16 sm:h-20` (64px mobile / 80px desktop).
   - Constrained mobile logo to `h-8 sm:h-11 max-w-[130px] sm:max-w-none` to guarantee left-hand breathing space.
   - Reduced right cluster gap to `gap-1.5 sm:gap-2.5 lg:gap-3`.
   - Compacted language dropdown pill to `px-2 sm:px-3 py-1 sm:py-1.5 text-xs`.
   - Replaced 140px user pill on mobile with a compact 32px circular avatar / sign-in icon button (`w-8 h-8 sm:w-[140px] sm:h-10`).
   - Hidden the notification bell and SOS button from the top navbar on mobile (`hidden sm:block` for bell, `hidden md:flex` for SOS button).
   - Standardized hamburger menu button to `w-8 h-8 sm:w-10 sm:h-10` with zero overflow.
2. **High-Priority Emergency Banner in Mobile Drawer**:
   - Added a high-contrast gradient emergency banner (`from-rose-500 to-red-600`) at the very top of the mobile drawer menu.
   - Provides instant 1-tap `Dispatch 108` ambulance trigger (`onOpenAmbulance()`) and direct `tel:104` free medical helpline calling.
3. **Synergy with Persistent Mobile Bottom Dock**:
   - Preserved the persistent thumb-zone emergency dock in `App.tsx`, ensuring `108` is always one tap away without polluting the top navbar.

## Consequences
- **Zero Horizontal Overflow**: Guaranteed fit across all modern mobile viewports (down to 320px width).
- **Flawless Aesthetic Hierarchy**: Clean, brand-focused header that smoothly transitions to the expanded desktop layout at `md` (768px).
- **Uncompromised Emergency Access**: Users can dispatch an ambulance from the bottom dock, from the hero section, or from the top of the mobile navigation drawer.

## Related Notes
- [[ADR-005-Mobile-First-Responsive-Architecture]]
- [[Design_System_Tokens]]
- [[Mobile_UI_UX_Laws_Audit]]
- [[Active_Context]]
