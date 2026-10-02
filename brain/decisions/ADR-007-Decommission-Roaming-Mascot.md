---
title: "ADR-007: Decommission Autonomous Roaming Mascot and Scroll Speech Bubbles"
tags:
  - decision
  - adr
  - ui-ux
  - cleanup
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-007: Decommission Autonomous Roaming Mascot and Scroll Speech Bubbles

Back to [[00_Index]]

## Context
A floating 3D mascot component (`RoamingDocBot.tsx`) previously roamed autonomously around the bottom-right corner of the screen and listened to window scroll and intersection events. While scrolling, it dynamically popped up speech bubbles containing clinical facts, alerts, and quick prompts. 

However:
1. On mobile and tablet devices, the floating mascot caused interaction collisions, obscured critical touch targets (such as navigation and action buttons), and felt gimmicky or distracting for patients seeking emergency assistance.
2. The user requested its permanent removal from the runtime and codebase, while preserving the static, grounded desk robot graphic in the [[HeroSection]] for visual brand anchor.

## Decision
1. **Permanent File Deletion**:
   - Completely deleted `frontend/src/components/RoamingDocBot.tsx` from the codebase.
2. **Runtime Decoupling**:
   - Confirmed zero imports, references, or scroll listener hooks in `frontend/src/App.tsx`.
3. **Hero Graphic Preservation**:
   - Kept the static hero desk mascot graphic (`/desk_robot_hero.png`) intact in `HeroSection.tsx`, maintaining its interactive hotspots for quick voice triage and generic medicine navigation.
4. **Immediate Production Deployment**:
   - Packaged and deployed clean bundles to Vercel Production (`--prod`) across all live aliases.

## Consequences
- **Cleaner UX**: Eliminates visual clutter, unexpected animations, and touch hijacking on mobile.
- **Smaller Bundle Size**: Removed GSAP patrol tweens and hardcoded thought arrays, speeding up initial page load.
- **Frictionless Navigation**: Clinical CTAs (108 Ambulance, DocBot Tele-Clinic, Hospital Bed locator) have unobstructed screen real estate.

## Related Notes
- [[ADR-005-Mobile-First-Responsive-Architecture]]
- [[Design_System_Tokens]]
- [[Mobile_UI_UX_Laws_Audit]]
- [[Active_Context]]
