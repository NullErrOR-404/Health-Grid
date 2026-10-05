---
title: "ADR-022: Prescription Modal Mobile Scroll Lock and Lenis Touch Prevention"
status: Accepted
date: 2026-10-05
deciders:
  - Lead Clinical AI Architect
  - Senior Frontend UX Engineer
consulted:
  - User Mobile Feedback (/grill-me session)
informed:
  - Core Engineering Team
tags:
  - ui-ux
  - mobile-first
  - scrolling
  - lenis
  - prescription-modal
  - bugfix
parent: "[[00_Index]]"
---

# 📱 ADR-022: Prescription Modal Mobile Scroll Lock and Lenis Touch Prevention

Back to [[00_Index]]

## Context & Problem Statement
On mobile devices (iOS Safari and Android Chrome), after a user completed uploading or capturing a prescription, the post-scan 2-column results UI rendered inside `PrescriptionModal.tsx`. However, the user was completely unable to scroll down past the initial prescription preview viewport to inspect extracted medicines, dosages, savings breakdown, clinical disclaimers, or bottom action buttons ("Save to Health Profile", "Find Medicines", "Hear Instructions").

## Root Cause Analysis
1. **Lenis Pause Lockout & CSS Rule Gap**:
   When any modal opens, `App.tsx` calls `lenisService.pause()`. This adds `html.lenis-stopped` to the root `<html>` element.
   In `frontend/src/index.css`:
   ```css
   html.lenis-stopped, html.lenis-stopped body {
     overflow: hidden !important;
   }
   ```
   To allow inner modal scrolling during a pause, Lenis and the HealthGrid CSS design system require `data-lenis-prevent="true"`, which grants:
   ```css
   html.lenis-stopped [data-lenis-prevent],
   [data-lenis-prevent="true"] {
     touch-action: pan-y !important;
     overscroll-behavior: contain !important;
     -webkit-overflow-scrolling: touch !important;
   }
   ```
   `PrescriptionModal.tsx` was completely missing `data-lenis-prevent` attributes on its outer backdrop, modal card, and inner scrollable body. As a consequence, mobile browsers suppressed touch drag gestures completely inside the modal.

2. **Mobile Dynamic Viewport Boundary**:
   The modal dialog container used `h-full sm:h-auto sm:max-h-[94vh]`. On mobile browsers with dynamic URL bars (Safari iOS, Chrome Android), `h-full` without `h-[100dvh]` and `max-h-[100dvh]` can exceed viewport bounds or fail to recalculate correctly, trapping flex children.

3. **Preview Image Touch Swallowing**:
   The scanned prescription preview card at the top of the mobile column is the primary landing area for user touch interaction. Without `touch-pan-y`, touch gestures on the preview viewport could be swallowed or interrupted instead of passing through to scroll the modal body.

4. **Sub-Modals Missing Lenis Prevention**:
   The "Edit All Extracted Medicines" sheet and "Lightbox Inspection" modal also lacked `data-lenis-prevent`, posing secondary scroll-trapping risks on mobile.

## Comprehensive Root Cause Analysis & Resolution (Post-Audit 2026-10-05)

### Deep Technical Root Causes Uncovered:
1. **Lenis `VirtualScroll` Touch Event Interception**:
   - Lenis binds `touchstart`, `touchmove`, and `touchend` listeners to `window` with `{ passive: false }`.
   - When `lenisService.pause()` was called upon modal opening, it invoked `lenisInstance.stop()`, setting `_isStopped = true`.
   - On `touchmove`, when `_isStopped` is true, Lenis explicitly executed `event.preventDefault()`, which halted the browser compositor's native touch scrolling loop across the entire mobile screen.
   - **Resolution**:
     - Configured `virtualScroll: ({ event }) => { if (event.type && event.type.includes('touch')) return false; return true; }` in `lenisService.ts` so Lenis completely bypasses all touch events, ensuring `event.preventDefault()` is never called on touch.
     - Added `prevent: (node) => !!node.closest?.('[data-lenis-prevent]') || !!node.closest?.('.overflow-y-auto') || !!node.closest?.('.overflow-y-scroll')`.

2. **Root & Body Overflow Clipping Traps (`lenis.css` + `index.css`)**:
   - `lenis.css` default rule `.lenis:not(.lenis-autoToggle).lenis-stopped { overflow: clip; }` applied `overflow: clip` to `<html>`.
   - `index.css` had `html.lenis-stopped body { overflow: hidden !important; }`.
   - When both `<html>` and `<body>` are clipped/hidden, mobile WebKit (iOS Safari) and mobile Chromium disable touch drag gestures on all fixed descendant overlays.
   - **Resolution**:
     - Explicitly overrode `html.lenis-stopped, .lenis:not(.lenis-autoToggle).lenis-stopped { overflow: visible !important; overflow-y: visible !important; overflow-x: hidden !important; }` in `index.css`.
     - Scoped `body { overflow: hidden !important }` to `@media (min-width: 640px)` so mobile screens never freeze the body touch compositor.

3. **Touch Event Shielding & Auto-Scroll UX**:
   - Added `e.stopPropagation()` on `touchstart` and `touchmove` directly on `modalBodyRef` in `PrescriptionModal.tsx`, preventing touch events from bubbling up to any outer window listeners.
   - Added smooth auto-scrolling to the `Analyze Prescription` button upon upload, bringing the action button immediately into focus while maintaining full bi-directional touch scrollability.

---

## Verification & Outcomes
- `npm run build` (`tsc -b && vite build`) passed with 0 errors in 1.89s.
- Chrome DevTools mobile emulation (390x844 with touch enabled) verified:
  - `htmlOverflowY`: `"auto"`, `bodyOverflowY`: `"auto"`.
  - Auto-scroll to `scrollTop: 140` brings "Analyze Prescription" into immediate focus.
  - Smooth downward scrolling to `scrollTop: 420` brings "How it works?", "Tips for better results", and "Recent Uploads" smoothly into view.
  - Reset to `scrollTop: 0` functions effortlessly.

