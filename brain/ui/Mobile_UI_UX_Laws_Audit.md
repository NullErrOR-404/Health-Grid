---
title: HealthGrid UI/UX Laws • Mobile Experience Audit
tags:
  - ui-ux
  - audit
  - ux-laws
  - mobile-ergonomics
created: 2026-10-02
status: active
---

# 📐 HealthGrid UI/UX Laws & Mobile Experience Audit

> [!important] Professional UX Framework
> This document formalizes the fundamental psychological and interaction design laws applied across HealthGrid's mobile-first interface.

---

## 🎯 1. Fitts's Law (Target Acquisition & Touch Ergonomics)
> *"The time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target."*

### Application & Audit Findings:
- **Mobile Thumb Zone**: High-frequency interactive elements (Emergency 108, AI Consultation, and Map locator) are pinned to the bottom 20% of the viewport via the sticky mobile dock.
- **Minimum Target Dimensions**: Every clickable action button, icon trigger, and form control is enforced to `>= 48px` vertical tap height.
- **Top Header Optimization**: Infrequent navigation controls (language toggle, user profile avatar) are positioned at the top right, preventing accidental taps during one-handed scrolling.

---

## ⏳ 2. Hick's Law (Cognitive Load & Decision Time)
> *"The time it takes to make a decision increases with the number and complexity of choices."*

### Application & Audit Findings:
- **Progressive Disclosure**: Primary views reveal essential clinical data first. Advanced details (e.g. SOAP clinical notes, drug composition breakdown, hospital inventory metadata) are housed inside on-demand drawers and tabs rather than cluttering the initial mobile screen.
- **Search & Filter Defaults**: The Jan Aushadhi generic store defaults to curated chronic disease categories (Diabetes, Cardiac, Antibiotics) rather than overwhelming users with a 500-item unorganized catalog.

---

## 🧠 3. Miller's Law (Working Memory Capacity 7 ± 2)
> *"The average person can only keep 7 (plus or minus 2) items in their working memory."*

### Application & Audit Findings:
- **Form Chunking**: The `PatientIntakeModal` and `HospitalInformationSystem` admission forms break extensive clinical data into 3 distinct logical steps (Demographics -> Vitals -> Chief Complaints), eliminating cognitive fatigue.
- **Hero Stats Pill**: Key national metrics are limited to 3 high-impact stats: Active Doctors, Verified PHCs, and Ambulances Online.

---

## 📦 4. Law of Proximity & Common Region
> *"Elements tend to be perceived into groups if they are sharing a clear boundary or closer together."*

### Application & Audit Findings:
- **Glassmorphism Card Architecture**: Cards utilize subtle borders (`border-slate-200/80` or `border-teal-500/20`), backdrop blur, and generous internal padding (`p-4 sm:p-6`) to clearly demarcate clickable clinical entities from background canvases.
- **Split Layout Spacing**: Desktop 50/50 split sections maintain a clean 24px-32px gutter on mobile, ensuring image containers do not visually blend into heading text.

---

## 🚨 5. Von Restorff Effect (Isolation / Distinctiveness)
> *"When multiple similar objects are present, the one that differs from the rest is most likely to be remembered and clicked."*

### Application & Audit Findings:
- **Emergency 108 Differentiation**: While HealthGrid's palette is grounded in calming clinical teals, slates, and emeralds, the Emergency 108 trigger uses vivid crimson (`bg-rose-600 hover:bg-rose-700`) with an animated ping beacon, ensuring instantaneous identification during acute emergencies.

---

## 📱 6. Mobile Viewport Checklist
- [x] Zero horizontal overflow on 320px, 375px, 390px, 412px, 430px viewports (`overflow-x-hidden`).
- [x] Autonomous moving mascot (`RoamingDocBot`) unmounted to prevent interaction collisions.
- [x] Text line-heights adjusted to `leading-snug` for titles and `leading-relaxed` for body text.
- [x] Modals adapted to fullscreen sheets on mobile with dedicated sticky headers and back buttons.
- [x] High-resolution images wrapped in responsive aspect ratio containers with `object-contain` / `object-cover`.
