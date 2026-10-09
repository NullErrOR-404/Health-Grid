---
title: ADR-005 • Mobile-First Responsive Architecture & Professional UI/UX Overhaul
tags:
  - adr
  - architecture
  - ui-ux
  - mobile-first
  - design-system
created: 2026-10-02
status: accepted
---

# 📜 ADR-005: Mobile-First Responsive Architecture & Professional UI/UX Overhaul

## 🧭 Context

HealthGrid serves diverse populations across India, where mobile device usage (Android and iOS smartphones with viewports between 320px and 430px) represents >85% of clinical teleconsultations and emergency requests.

A thorough UI/UX evaluation revealed several responsive pain points:

1. Floating elements (specifically the autonomous `RoamingDocBot`) could obscure interactive clinical buttons and create visual friction on narrow screens.
2. Split-column layouts (50/50 hero, features, and disclosures) lacked explicit mobile stacking hierarchy and safe padding, occasionally pushing images outside their containers or causing horizontal scroll (`overflow-x`).
3. Modals designed primarily as centered floating dialogs felt cramped and difficult to navigate on mobile devices compared to native app-style fullscreen sheets.
4. Inconsistent text leading, line-heights, and sub-44px touch targets breached Apple HIG, Google Material Design 3, and WCAG accessibility standards.

## 🎯 Architectural Decisions

### 1. Elimination of Autonomous Roaming Mascot

- **Decision**: Fully unmount and remove `RoamingDocBot` from the runtime application layout.
- **Rationale**: Eliminates touch event hijacking, accidental tap obstructions, and distraction during critical medical intake flows.

### 2. Fullscreen Mobile Modal Architecture

- **Decision**: All 9 clinical modals adapt to fullscreen sheets (`w-screen h-screen inset-0 rounded-none overflow-y-auto`) on mobile viewports (`<sm`), retaining desktop centered floating dialog presentation (`sm:rounded-3xl sm:max-w-2xl sm:inset-auto sm:my-auto`) on larger screens.
- **Ergonomics**: Sticky top header with unambiguous back/close tap targets (>= 48px) and thumb-accessible bottom action buttons.

### 3. Strict Image Containment & Zero-Overflow Guardrails

- **Decision**: Every image, illustration, and canvas is wrapped in an aspect-ratio container with explicit `object-contain` or `object-cover` and `max-w-full`.
- **Global Invariant**: Root layout enforces `overflow-x-hidden` to guarantee zero horizontal layout shift or accidental scrolling.

### 4. Standard Ergonomic Stacking in Split Layouts

- **Decision**: On mobile screens (`<lg`), split 50/50 desktop layouts stack:
  1. Eyebrow badge & Primary Headline
  2. Aligned Hero Illustration / Visual Anchor
  3. Descriptive Body Copy
  4. Primary & Secondary Call-to-Action (CTA) Buttons

### 5. Minimal Quick-Action Dock Retention

- **Decision**: Retain the high-utility 3-button bottom dock on mobile (`Consult AI`, `108 Emergency`, `PHCs`), elevated with safe-area bottom insets (`env(safe-area-inset-bottom)`), backdrop blur, and 48px touch heights.

## 🌟 Consequences

- **Positive**: Native PWA-grade mobile feel, zero horizontal scrolling bugs, predictable thumb-zone interactions, full compliance with UI/UX laws (Fitts, Hick, Miller).
- **Maintenance**: All future modals and views must adhere to the tokens defined in `[[Design_System_Tokens]]`.
