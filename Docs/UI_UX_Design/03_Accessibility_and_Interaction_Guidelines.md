# 🎨 UI/UX Design Specifications
## Module 03: Accessibility, Interaction Guidelines & Privacy UX

---

## 1. WCAG 2.1 AA Accessibility Standards

In acute clinical situations, patients and medical staff may experience visual impairment, severe stress, or motor tremors. HealthGrid mandates strict adherence to **WCAG 2.1 AA**:

* **Contrast Ratios**:
  - Normal text ($< 18\text{pt}$): Minimum contrast ratio of **$4.5:1$** against slate backgrounds.
  - Large text ($\ge 18\text{pt}$) and active UI elements: Minimum contrast ratio of **$3.0:1$**.
* **Dual-Cue Information Design**:
  - Color is never used as the sole indicator of clinical urgency.
  - An ESI Level 1 emergency alert is conveyed via:
    1. Color: Rose red (`#ef4444`)
    2. Text Label: `"CRITICAL EMERGENCY - ESI LEVEL 1"`
    3. Icon: Pulsing Alert Triangle (`AlertTriangle` icon)
    4. Audible / Haptic Feedback: Pulse vibration on mobile devices.

---

## 2. Touch Target Ergonomics & Motor Accessibility

```
+-------------------------------------------------------------------------------------------------+
|                                    TOUCH ERGONOMICS SPECIFICATIONS                              |
+-------------------------------------------------------------------------------------------------+
| • Minimum Interactive Target: 48 x 48 px / pt with minimum 8px padding gaps.                   |
| • Bottom-Thumb Zone Optimization: High-frequency actions (mic, camera flip, emergency SOS)     |
|   are anchored within the bottom 25% of the mobile viewport.                                    |
| • Accidental-Trigger Defenses: High-stakes clinical actions (Dispatching 108 Ambulance,         |
|   Refilling Chronic Medications) require 2-step confirmation with explicit cancel options.      |
+-------------------------------------------------------------------------------------------------+
```

---

## 3. Screen Privacy & Mobile Security UX

* **`FLAG_SECURE` Android Window Shield**:
  - When the app is backgrounded or switched to the Android Recent Apps view, the operating system masks the window with a solid clinical slate card, preventing sensitive health vitals or prescription scripts from being photographed or previewed by third parties.
* **Biometric Fallback UX**:
  - When accessing the confidential Health Vault in `RecordsHubScreen.tsx`:
    1. Triggers native `BiometricPrompt` (Fingerprint / FaceID).
    2. If biometric hardware is unconfigured or fails 3 times, gracefully offers device PIN/Pattern fallback without trapping the user.

---

## 4. Keyboard Navigation & ARIA Semantics

* **Modal Focus Trapping**: When modals (Live Clinic, Records Hub, Prescription Modal) open, keyboard focus is trapped within the dialog container using `tabindex` management.
* **Escape Key Dismissal**: Pressing the `Escape` key immediately closes active modal sheets, returning focus to the triggering element.
* **Live ARIA Announcements**: Screen readers receive dynamic live region announcements (`aria-live="polite"`) when:
  - DocBot begins speaking.
  - Real-time bed occupancy updates via WebSocket CDC.
  - An OPD queue token advances.
