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

---

## Architectural Decisions & Solution

1. **Applied `data-lenis-prevent="true"` Across Modal Shell & Containers**:
   - Outer backdrop overlay: `fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 ...` with `data-lenis-prevent="true"`.
   - Inner dialog shell: `h-[100dvh] sm:h-auto sm:max-h-[94vh] max-h-[100dvh]` with `data-lenis-prevent="true"`.
   - Modal scroll body: `p-4 sm:p-7 overflow-y-auto flex-1 space-y-6 overscroll-contain touch-pan-y pb-28 sm:pb-8 safe-area-pb` with `data-lenis-prevent="true"`.

2. **Poka-Yoke CSS Reinforcements in `index.css`**:
   - Expanded selectors to cover both boolean `[data-lenis-prevent]` and explicit `[data-lenis-prevent="true"]` forms.
   - Enforced `overflow-y: auto !important` on scroll containers during `html.lenis-stopped` so no cascading rule can lock modal scrolling.

3. **Preview Area Touch Passthrough**:
   - Added `touch-pan-y` to the Prescription Preview Viewport (`aspect-[4/3] sm:aspect-[1/1] max-h-[480px]`) so downward and upward thumb swipes immediately trigger smooth scrolling of the parent container.

4. **Safe-Area Mobile Bottom Clearance**:
   - Configured `pb-28 sm:pb-8 safe-area-pb` on the scroll container. On mobile devices, this provides ample clearance above bottom browser bars and device home indicators, guaranteeing full visibility and effortless tapping of the bottom Action Tray.

5. **Sub-Modal Parity**:
   - Updated the "Edit All Medicines" modal sheet and the "Lightbox Inspection" modal with `data-lenis-prevent="true"`, `overscroll-contain`, and `touch-pan-y`.

---

## Verification & Outcomes
- `npm run build` (`tsc -b && vite build`) passed with zero errors in 1.65s.
- Mobile vertical touch gestures glide smoothly across the entire prescription report from top to bottom.
- Action Tray buttons ("Save to Health Profile", "Find Medicines", "Hear Instructions") are fully accessible and unobstructed.
