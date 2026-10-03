---
title: "ADR-010: Mobile Hamburger Drawer Scroll Lock and Sticky Back Navigation"
status: accepted
date: 2026-10-03
tags:
  - adr
  - architecture
  - mobile
  - ui-ux
  - navbar
  - scroll-lock
  - touch
parent: "[[00_Index]]"
---

# 📜 ADR-010: Mobile Hamburger Drawer Scroll Lock and Sticky Back Navigation

Back to [[00_Index]]

## Context
During real-device mobile audits of the production deployment (`https://healthgrid-app.vercel.app`), two severe mobile usability bugs were discovered when toggling the mobile navigation hamburger drawer:
1. **Absence of Clear "Turn Back" Affordance**:
   - Once a citizen expanded the mobile menu on a smartphone, there was no prominent back button or top dismiss control within the drawer's header. Users felt trapped, unable to navigate back to their current page without searching for the original hamburger icon or finding an obscure tap target.
2. **Scroll Bleed / Trapping**:
   - Swiping or scrolling inside the mobile menu failed to scroll the drawer contents properly on touchscreens. Instead, touch events propagated directly into the background page, causing the main webpage (`Hero`, `Map`, `ActionCards`) to scroll invisibly beneath the backdrop while the menu content remained static.
   - The root causes were twofold:
     - **Lenis Smooth Scroll**: The application utilizes `lenisService` for smooth virtual scrolling, which was never paused when the mobile menu modal opened, intercepting and misdirecting scroll events.
     - **Missing Body Overflow Lock & Touch CSS**: `document.body` and `document.documentElement` retained default scrolling (`overflow: visible`), while the drawer container lacked `overscroll-contain`, `-webkit-overflow-scrolling: touch`, `touch-action: pan-y`, and viewport-bounded height (`max-h-[calc(100dvh-4rem)]`).
     - **Non-Interactive Backdrop**: The backdrop had no click-to-dismiss handler.

## Decision
We implemented a comprehensive Mobile Drawer Scroll-Lock & Navigation Architecture in `frontend/src/components/Navbar.tsx`:

1. **Dual Scroll Lock & Smooth-Scroll Pausing**:
   - Added a `useEffect` reacting to `mobileMenuOpen`:
     - Synchronously locks `document.body.style.overflow = 'hidden'` and `document.documentElement.style.overflow = 'hidden'`.
     - Calls `lenisService.pause()` immediately to prevent smooth-scroll interference on window scroll.
     - On menu close or component unmount, restores `overflow = ''` and resumes `lenisService.resume()`.
     - Added an `Escape` key listener for accessibility and desktop/tablet keyboard users.
   - Added an automatic close listener on `activeView` route transitions to guarantee clean cleanup when navigating.

2. **Top Sticky Drawer Navigation Bar (`[← Back]` & `[✕ Close]`)**:
   - Injected a dedicated sticky header (`sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs`) at the top of the mobile drawer.
   - Features:
     - A distinct, high-contrast `[ ← Back ]` pill button with tactile touch target (`px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 active:scale-95`).
     - A subtle badge: `"Quick Navigation"`.
     - A circular `[ ✕ ]` close button (`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white`).

3. **Dynamic Viewport Height & Touch Physics Guardrails**:
   - Drawer container constrained to `max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)]` using modern Dynamic Viewport Units (`100dvh`) to account for mobile browser URL/navigation bars.
   - Configured `overflow-y-auto overscroll-contain` with explicit CSS style properties:
     - `WebkitOverflowScrolling: 'touch'` (iOS inertial momentum scrolling).
     - `touchAction: 'pan-y'` (explicit vertical gesture claim, preventing browser horizontal or pull-to-refresh gestures).
   - Generous bottom padding (`pb-14 safe-area-pb`) ensuring all links and buttons remain accessible above OS home indicators.

4. **Backdrop Tap-to-Dismiss**:
   - Attached an `onClick` listener to the semi-transparent black overlay checking `if (e.target === e.currentTarget) setMobileMenuOpen(false);` allowing users to tap anywhere outside the drawer to dismiss immediately.

## Consequences

### Positive
- **Frictionless Navigation**: Users now have three distinct, intuitive ways to exit the mobile menu: tap `[← Back]`, tap `[✕ Close]`, or tap the dark overlay backdrop.
- **Flawless Mobile Scrolling**: The background page is completely stationary while the menu is open. Inside the menu, touch gestures scroll smoothly and responsively without stutter or scroll-chaining into the page.
- **Zero Memory Leaks**: Lenis is reliably resumed and body overflow styles are restored on route transitions, unmount, or close.
- **Production Performance**: Zero impact on bundle size or frame rates.

### Negative / Trade-offs
- Requires keeping `lenisService` paused during any full-viewport overlay modal across the application, establishing this pattern as the standard for future overlays.

## Related Notes
- [[ADR-008-Mobile-Navbar-Zero-Overflow-Architecture]]
- [[ADR-009-Mobile-Login-Scroll-and-ChatUI-Minimal-Pills]]
- [[Design_System_Tokens]]
- [[Mobile_UI_UX_Laws_Audit]]
