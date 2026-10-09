# 🎨 UI/UX Design Specifications

## Module 01: Design System, Tokens & Aesthetic Philosophy

---

## 1. Aesthetic Philosophy: Clinical Precision & Calming Dark Mode

HealthGrid rejects generic, flat hospital interfaces in favor of a **clinical dark mode** with glassmorphic elevation, high-contrast vital indicators, and kinetic micro-animations. Medical stress is high; interface design must instill calm, certainty, and authoritative professionalism.

```text
+=================================================================================================+
|                                  HEALTHGRID DESIGN SYSTEM SPECS                                 |
+=================================================================================================+
|                                                                                                 |
|   BACKGROUNDS & CANVASES              PRIMARY CLINICAL ACCENTS        EMERGENCY & TRIAGE ALERTS |
|   • Deep Void: #020617 (slate-950)    • Pure Teal: #0d9488 (teal-600) • Critical Red: #ef4444   |
|   • Card Slate: #0f172a (slate-900)   • Bio Emerald: #10b981 (emerald)• Urgent Amber: #f59e0b   |
|   • Glass Border: rgba(255,255,255,0.1)• Electric Cyan: #06b6d4 (cyan) • Stable Blue: #3b82f6   |
|                                                                                                 |
+=================================================================================================+
```

---

## 2. Core Color Palette Tokens

| Token Name | Hex Code | Tailwind Utility | Clinical Context & Usage |
| :--- | :--- | :--- | :--- |
| `--color-canvas-deep` | `#020617` | `bg-slate-950` | Primary app canvas and fullscreen modal backdrops. |
| `--color-canvas-surface` | `#0f172a` | `bg-slate-900` | Clinical workspace cards, ERP panels, and drawer bodies. |
| `--color-canvas-subtle` | `#1e293b` | `bg-slate-800` | Input backgrounds, inactive tabs, and table header rows. |
| `--color-accent-teal` | `#0d9488` | `text-teal-600` | Primary interactive buttons, verified doctor badges. |
| `--color-accent-emerald` | `#10b981` | `text-emerald-400` | Jan Aushadhi generic savings chips, stable vital stats. |
| `--color-alert-critical` | `#ef4444` | `text-rose-500` | ESI-1 casualty alerts, 108 SOS dispatch triggers, allergy flags. |
| `--color-alert-warning` | `#f59e0b` | `text-amber-400` | ESI-2 urgent triage, intermediate fever, confirmation modals. |
| `--color-telemetry-cyan` | `#06b6d4` | `text-cyan-400` | AI Live Clinic scanner borders, real-time WebSocket pings. |

---

## 3. Typography Architecture

* **Primary Font Family**: `Inter, system-ui, -apple-system, sans-serif`
  * High legibility at small sizes (10px–12px) for complex medication dosing and vital telemetry.
* **Display / Brand Font**: `Outfit, sans-serif`
  * Clean, modern geometry for hero banners, modal titles, and hospital names.
* **Monospace Font**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  * Used for OPD token codes (`HG-OPD-1042`), biometric Health IDs (`HG-FAM-8821`), dosages (`500mg IP`), and network latency gauges (`24ms`).

---

## 4. Glassmorphic Elevation & Surface Layers

```css
/* Glassmorphism Surface Token */
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}
```

* **Z-Index Layer Hierarchy**:
  * `z-0`: Base GIS Maps & Canvas Viewports
  * `z-10`: Interactive ERP Cards & Table Views
  * `z-20`: Floating Call Controls & Audio Indicators
  * `z-30`: Sticky Headers, Mobile Bottom Docks
  * `z-40`: Modal Backdrops & Dismiss Overlays
  * `z-50`: Fullscreen Modals (Live Clinic, Records Hub, Voice Chat)
  * `z-60`: 108 Emergency Casualty SOS Confirmation Layer

---

## 5. Kinetic Micro-Animations & Sound Visualizers

* **Kinetic Audio Equalizer (AI Live Clinic)**: 4 vertical sound wave bars with staggered CSS keyframe heights (`anim-equalizer-1` through `anim-equalizer-4`), animating exclusively when DocBot audio synthesis is active.
* **Pulsatile SOS Ring**: Concentric pinging rings (`animate-ping`) surrounding the 108 Emergency Ambulance dialer to convey urgency.
* **Lenis Smooth Scroll Physics**: Configured on web root to prevent jarring scroll jumps between hospital modules.
