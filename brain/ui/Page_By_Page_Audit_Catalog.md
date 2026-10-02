---
title: HealthGrid Page-by-Page UI/UX Audit & Resolution Catalog
tags:
  - audit
  - catalog
  - ui-ux
  - responsive
  - mobile-first
created: 2026-10-02
status: completed
---

# 📋 HealthGrid Page-by-Page UI/UX Audit & Resolution Catalog

This catalog documents the granular responsive, typography, image alignment, and spatial findings across every page and component, alongside the completed and verified fixes.

---

## 🌐 1. Global Layout & Shell
- **Files**: `frontend/src/App.tsx`, `frontend/src/components/Navbar.tsx`, `frontend/src/components/Footer.tsx`, `frontend/src/index.css`
- **Audit Findings**:
  - `RoamingDocBot` was mounted globally, drifting across mobile screens and covering buttons or text.
  - Mobile bottom dock had sub-optimal tap height on small phones (<360px).
  - Main container lacked explicit `overflow-x-hidden`, risking horizontal scroll if wide tables or canvas elements rendered.
  - Mobile hamburger trigger lacked standard 44px+ bounding box.
- **Implemented Resolutions**:
  - [x] **Mascot Unmounted**: Completely removed `RoamingDocBot` from `App.tsx` runtime to eliminate touch hijacking.
  - [x] **Horizontal Overflow Eliminated**: Added global `overflow-x: hidden`, `max-width: 100vw`, and `-webkit-tap-highlight-color: transparent` in `index.css`.
  - [x] **Safe-Area Insets**: Added `.safe-area-pb` and `.safe-area-pt` utility classes.
  - [x] **Mobile Bottom Quick-Dock**: Upgraded buttons to `min-h-[48px]`, added `active:scale-95`, and wrapped in `safe-area-pb`.
  - [x] **Responsive Navbar**: Avatar collapses to compact `w-9 h-9` on mobile and expands to `w-[140px]` on desktop. Hidden duplicate SOS Ambulance button on `<640px` screens. Upgraded hamburger tap area to `min-h-[44px] min-w-[44px]`.
  - [x] **Footer Clearance**: Increased mobile bottom padding to `pb-28 md:pb-12` ensuring complete clearance above fixed mobile bottom bar.

---

## 🏠 2. Landing Page
- **Files**: `HeroSection.tsx`, `ActionCards.tsx`, `OAuthTransparencySection.tsx`, `CommunityHealthSection.tsx`, `GovAlertMarquee.tsx`
- **Audit Findings**:
  - `HeroSection.tsx`: On mobile, the 3D DocBot mascot card in the right column was either pushed below the fold with weak spacing or caused awkward vertical jumping.
  - `ActionCards.tsx`: 6 action cards stacked on mobile with varying heights; needed touch-target padding and active press feedback.
  - `OAuthTransparencySection.tsx`: Background image was fixed at 1672px max-width; needed mobile focal alignment and clean vertical stacking so text panel and mascot graphic remain balanced.
  - `CommunityHealthSection.tsx`: Guide article cards and emergency banner needed harmonious typography line-heights and image aspect ratios.
- **Implemented Resolutions**:
  - [x] **Standard Ergonomic Stacking in Hero**: Headline/Eyebrow -> Aligned DocBot Mascot card with interactive hotspots -> Subtext -> Search bar -> Popular pills.
  - [x] **Image Aspect Ratio Wrappers**: Bound Hero visual to `aspect-[16/11]` on mobile with `overflow-hidden` and rounded corners.
  - [x] **ActionCards Ergonomics**: Added `min-h-[52px] sm:min-h-[56px]`, `active:scale-[0.98]`, `role="button"`, and `line-clamp-1` on subtitles.
  - [x] **OAuth Transparency Section**: Added responsive mobile visual anchor framing the 3D DocBot mascot and Google security shield between title and disclosure cards.
  - [x] **Community Health Stacking**: Applied standard ergonomic stacking (Headline -> Outbreak Map Card -> Description -> CTA button).

---

## 🤖 3. DocBot TeleClinic Consultation (`ChatbotPage.tsx`)
- **Audit Findings**:
  - Fixed-height chat view occasionally conflicted with mobile browser viewport (`100vh` vs `100dvh`), hiding the input text field beneath the mobile virtual keyboard.
  - 288px left sidebar was rendered side-by-side with chat chamber on mobile, crushing viewport width.
  - Model selection dropdown overflowed viewport on narrow phones (<360px).
- **Implemented Resolutions**:
  - [x] **Off-Canvas Sliding Drawer**: Converted 288px sidebar into off-canvas sliding drawer with dark backdrop on `<md` screens.
  - [x] **Hamburger Trigger**: Added dedicated hamburger button in chat header with 44px+ touch target.
  - [x] **Dynamic Viewport Units**: Replaced fixed heights with `h-[100dvh]` root and `safe-area-pb` on input bar.
  - [x] **Responsive Model Popover**: Changed fixed popover width to `w-[calc(100vw-2.5rem)] sm:w-96`.

---

## 💊 4. Jan Aushadhi Generic Medicine Store (`MedicineStorePage.tsx`)
- **Audit Findings**:
  - Category filter pills had visible scrollbars that overlapped card headers.
  - Search input placeholder was truncated on narrow mobile screens.
  - Checkout and Order Confirmation dialogs were centered popups with clipped contents on mobile keyboards.
- **Implemented Resolutions**:
  - [x] **Scrollbar-Free Filters**: Added `no-scrollbar` class to category filter pills container.
  - [x] **Responsive Placeholder**: Shortened search placeholder on mobile screens.
  - [x] **Fullscreen Mobile Sheets**: Converted checkout dialog and order confirmed modal to `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`, and `safe-area-pb`.

---

## 📍 5. Hospital & Bed Locator Map (`FindCareNearYou.tsx`, `FacilityMapModal.tsx`)
- **Audit Findings**:
  - Leaflet map container height on mobile was fixed, squeezing the hospital list cards below into a tiny vertical sliver.
  - Map tiles miscalculated render coordinates when toggled from hidden mobile tabs.
- **Implemented Resolutions**:
  - [x] **Mobile [List | Map] Switcher**: Added segmented view control on `<lg` screens.
  - [x] **Auto-Switch on Card Tap**: Tapping a facility card automatically flips view to Map tab with zoomed popup.
  - [x] **Leaflet InvalidateSize**: Added `useEffect` triggering `map.invalidateSize()` with a 150ms timeout on tab switch.
  - [x] **Fullscreen FacilityMapModal**: Configured `p-0 sm:p-4 md:p-6` with `rounded-none sm:rounded-3xl`.

---

## 🏥 6. Hospital Information System & ERP (`HospitalInformationSystem.tsx`, `HospitalErpDashboard.tsx`)
- **Audit Findings**:
  - HIS top tab bar squashed buttons on mobile screens.
  - Hospital ERP dashboard lacked a mobile navigation menu entirely (`hidden md:flex`), leaving mobile administrators unable to switch modules.
  - ERP quick-action dialogs clipped inputs on mobile screens.
- **Implemented Resolutions**:
  - [x] **HIS Mobile Tab Swiping**: Added `no-scrollbar`, `min-w-max`, `min-h-[44px]`, and `whitespace-nowrap md:whitespace-normal` to HIS navigation aside.
  - [x] **ERP Mobile Off-Canvas Drawer**: Added `isMobileNavOpen` state, hamburger button in ERP app bar, and full slide-over drawer with backdrop.
  - [x] **ERP Quick-Action Mobile Sheet**: Converted `quickActionModal` to `p-0 sm:p-4`, `rounded-none sm:rounded-2xl`, with min-height 44px buttons.

---

## 🪟 7. Clinical Modals & Drawers
- **Files**: `AmbulanceModal.tsx`, `VoiceChatModal.tsx`, `PrescriptionModal.tsx`, `BabyShotsModal.tsx`, `DoctorHandoverModal.tsx`, `PatientIntakeModal.tsx`, `HealthGuideModal.tsx`, `LoginModal.tsx`, `VitalsTelemetryModal.tsx`, `RegisterHospitalModal.tsx`
- **Audit Findings**:
  - Floating centered modals (`max-w-2xl mx-auto rounded-3xl`) clipped header and footer buttons on mobile screens with virtual keyboards.
  - Close buttons were occasionally placed too close to the top-right edge for thumb reach.
- **Implemented Resolutions**:
  - [x] **AmbulanceModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`, 44px close button.
  - [x] **VoiceChatModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`, `safe-area-pb` on mic control bar.
  - [x] **PrescriptionModal**: `p-0 sm:p-6`, `rounded-none sm:rounded-[28px]`.
  - [x] **BabyShotsModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`.
  - [x] **DoctorHandoverModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`.
  - [x] **PatientIntakeModal**: `p-0 sm:p-5`, `rounded-none sm:rounded-3xl`, `safe-area-pb`.
  - [x] **VitalsTelemetryModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`, `safe-area-pb`.
  - [x] **RegisterHospitalModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-[28px]`, `overflow-y-auto`.
  - [x] **HealthGuideModal**: `p-0 sm:p-4`, `rounded-none sm:rounded-3xl`.
  - [x] **LoginModal**: `p-0 sm:p-5`, `rounded-none sm:rounded-[32px]`, `overflow-y-auto`.
