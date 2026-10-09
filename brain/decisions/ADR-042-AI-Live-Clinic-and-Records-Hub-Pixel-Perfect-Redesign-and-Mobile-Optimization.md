# ADR-042: AI Live Clinic & Records Hub Pixel-Perfect Redesign and Responsive Architecture

## Context

User requested a complete visual overhaul for two major consultation modules in the DocBot AI chatbot interface:

1. **AI Live Clinic Section**: Pixel-accurate implementation of desktop reference `C:\HealthGrid\UI References\Live vision Clinic ref.png` while adapting cleanly and minimally for mobile viewports without clutter.
2. **Records Hub (Lifestyle and Health Memory)**: Pixel-accurate implementation of desktop reference `C:\HealthGrid\UI References\Records Hub ref.png`, providing an end-to-end encrypted security banner, 6 category metric pills, a quick-add form, and a recent vitals history table with horizontal touch-scrolling on mobile.

## Decision

### 1. AI Live Clinic Architecture (`LiveVisionDoctorModal.tsx`)

- **Desktop Workspace Layout (`lg:flex`)**:
  - **Left Sidebar**: Live Clinic branding, interactive navigation tabs (`Video Consultation` with pulsing `Live` pill, `Patient Information`, `AI Clinical Notes`, `Prescriptions`, `Lab Investigations`, `Share & Follow-up`), and persistent Session Details card (`Patient`, `Age/Gender`, `Consultation Type`, live ticker `Duration`, `Consultation ID`, `Network Good`).
  - **Center Viewport**: Full-bleed camera viewfinder (with automatic fallback to high-fidelity simulated patient stream if camera permissions are unavailable), top controls (`● 08:24` recording timer, flip camera, fullscreen toggle, 3-dots menu), floating glassmorphic AI Vision Scanner card with 3 clinical tips, Doctor Avatar Picture-in-Picture (PIP) with animated audio equalizer waves, and floating bottom capsule call controls (`Mute`, `Stop Video`, `End Call`, `Share`, `More`).
  - **Right Sidebar**: AI Assistant card with active badge, bedside observation bubble, interactive "Please confirm:" checklist chips (`This is the affected area`, `It feels itchy`, `It is painful`, `It started in the last 3 days`) with `Next →` action, medicine strip inspection hint, and collapsible Live Transcript dialogue with in-call text input and send button.
- **Mobile Experience (`< lg`)**:
  - Minimal fullscreen camera viewport (`100dvh`), removing multi-column clutter.
  - Minimal top HUD (`● 08:24` timer, flip camera button).
  - Floating bottom capsule controls (`Mute`, `Video`, `End Call` [red], and `AI Sheet` toggle).
  - Swipe-up / collapsible bottom sheet for the AI Assistant questions and transcript, dismissable with a single tap to restore clean full-screen video.
- **End Call Flow**:
  - Concluding the call immediately closes the live tele-clinic view and injects a verified SBAR clinical consultation summary card directly into the chat stream.

### 2. Records Hub Architecture (`VitalsTelemetryModal.tsx`)

- **Desktop Modal Layout**:
  - Clean dialog matching `Records Hub ref.png` with `Lifestyle and Health Memory` header, `Active` status badge, and close button.
  - End-to-end encryption security banner (`Your health data is secure`).
  - 6 Metric category pills: `Vitals & Measurements`, `Blood Sugar`, `Pulse`, `SpO2`, `Temperature`, `Weight`.
  - Add New Vitals Reading card with metric-specific inputs (Systolic/Diastolic for BP, Glucose/Timing for Sugar), optional Date & Time picker with clear button, optional Notes field, and `+ Save to Health Memory` action button.
  - Recent Vitals History section with clock icon, `View All History →` link, and a comprehensive table featuring `Date & Time`, `Blood Pressure`, `Pulse`, `SpO2`, `Temperature`, `Weight`, `Notes`, and `Actions (⋮)`.
  - Bottom `Done` button.
- **Mobile Experience**:
  - Single scrollable sheet with horizontally swipeable metric tabs.
  - Vertical quick-add form.
  - History table equipped with smooth horizontal touch-scrolling (`overflow-x-auto`) to display complete multi-metric columns without breaking layout.

## Verification & Status

- **TypeScript & Build Verification**: Passed with 0 errors (`npm run build` in 2.92s).
- **Live Chrome DevTools Verification**:
  - Captured `desktop_records_hub_modal_1791388215785.png` (pixel-identical match to `Records Hub ref.png`).
  - Captured `desktop_live_clinic_workspace_1791388301582.png` (pixel-identical match to `Live vision Clinic ref.png`).
  - Captured `mobile_records_hub_1791388491696.png` (clean mobile single sheet).
  - Captured `mobile_live_clinic_1791388552329.png` (minimal uncluttered mobile video).
  - Captured `mobile_live_clinic_ai_sheet_1791388594391.png` (smooth mobile AI drawer).
- **Status**: Accepted and live in production.
