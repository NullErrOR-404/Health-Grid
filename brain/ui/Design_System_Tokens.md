---
title: HealthGrid Design System • Tokens & Responsive Guidelines
tags:
  - ui-ux
  - design-tokens
  - typography
  - spacing
  - mobile-first
created: 2026-10-02
status: active
---

# 🎨 HealthGrid Design System Tokens & Mobile Guidelines

> [!tip] Source of Truth
> All layout components, modals, and clinical cards across HealthGrid must adhere to these token constraints to guarantee a cohesive, accessible, mobile-first experience.

---

## 📏 1. Spatial Rhythm (8-Point Grid)
Every margin, padding, gap, and dimension adheres to an 8-point baseline scale (with 4px half-steps for micro-alignments):

| Token | Pixels | Tailwind Class | Recommended Application |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | `p-1`, `gap-1` | Icon-to-text micro gaps, badge padding |
| `space-2` | 8px | `p-2`, `gap-2` | Button inner padding, pill indicators |
| `space-3` | 12px | `p-3`, `gap-3` | Mobile card gutters, compact inputs |
| `space-4` | 16px | `p-4`, `gap-4` | Standard card internal padding, list gaps |
| `space-6` | 24px | `p-6`, `gap-6` | Section internal padding, modal body spacing |
| `space-8` | 32px | `p-8`, `gap-8` | Desktop container padding, major card margins |
| `space-12` | 48px | `py-12` | Mobile section vertical spacing |
| `space-16` | 64px | `py-16` | Desktop section vertical spacing |

---

## 🔤 2. Typography & Fluid Line-Heights
Text legibility requires harmonious font sizes and line-heights (`leading`) tailored for high-stress clinical readability.

| Style Role | Mobile Font Size | Desktop Font Size | Line Height | Tracking | Recommended Classes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | 2rem (32px) | 3.5rem (56px) | `leading-[1.15]` | `-0.03em` | `text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight` |
| **Section Title** | 1.5rem (24px) | 2.25rem (36px) | `leading-snug` | `-0.02em` | `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight` |
| **Card Header** | 1.125rem (18px) | 1.25rem (20px) | `leading-snug` | `-0.01em` | `text-lg sm:text-xl font-bold` |
| **Body Primary** | 0.9375rem (15px) | 1rem (16px) | `leading-relaxed` (1.625) | `normal` | `text-sm sm:text-base leading-relaxed text-slate-600` |
| **Body Secondary**| 0.8125rem (13px) | 0.875rem (14px) | `leading-normal` (1.5) | `normal` | `text-xs sm:text-sm text-slate-500` |
| **Eyebrow / Badge**| 0.6875rem (11px) | 0.75rem (12px) | `leading-none` | `0.05em` | `text-[11px] sm:text-xs font-bold uppercase tracking-wider` |

---

## 👆 3. Touch Targets & Thumb-Zone Ergonomics
According to **Fitts's Law** and Apple Human Interface Guidelines:
- **Minimum Tap Target**: `44px × 44px` (Preferred: `48px × 48px` for primary actions like 108 Emergency, Call, or Submit).
- **Hit-box Expansion**: For smaller icons, use `p-2.5` or `min-h-[44px] min-w-[44px] flex items-center justify-center` to ensure fat-finger accessibility on mobile devices.
- **Safe Area Insets**: Fixed mobile toolbars and sheets must include `safe-area-pb` or `pb-[max(0.75rem,env(safe-area-inset-bottom))]` to avoid overlapping the iOS home indicator bar or Android navigation pills.

---

## 🖼️ 4. Image & Illustration Containment Guardrails
To prevent graphics from expanding beyond viewports or spilling out:
1. **Never use unbound fixed widths** (e.g. avoid `w-[500px]`); always pair with `max-w-full`.
2. **Aspect Ratio Containers**: Encapsulate illustrations in `aspect-square`, `aspect-[4/3]`, or `aspect-[16/9]` with `overflow-hidden`.
3. **Object Fit Strategy**:
   - Mascot and transparent artwork: `object-contain object-center`.
   - Clinical photos, cards, and maps: `object-cover object-center`.
4. **Zero-Overflow Rule**: Every page parent container must enforce `overflow-x-hidden w-full`.

---

## ♿ 5. Contrast & Accessibility Ratios (WCAG AA/AAA)
- Primary text (`text-slate-900` or `text-slate-800` on white): **Contrast 12.6:1** (Exceeds WCAG AAA).
- Secondary text (`text-slate-600` on white): **Contrast 5.7:1** (Passes WCAG AA).
- Emergency Alert (`bg-rose-600` with `text-white`): **Contrast 4.8:1** (Passes WCAG AA).
- Verified Badge (`bg-teal-600` with `text-white`): **Contrast 4.6:1** (Passes WCAG AA).
