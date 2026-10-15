# ADR-060: Strict Auth Gating, Dynamic Feature Visibility, and Zero-Mock Identity

## Status
Accepted (Implemented)

## Context
Prior to this architectural update:
1. Visitors could access `/chat` or interact with DocBot without being authenticated. The chat interface contained pre-seeded mock sessions with a hardcoded appointment for "Sameer Ahmed" (`HG001245`), "Dr. Mohamed", and "Govt Medical College & Hospital (GMCH)" on "2025-09-29".
2. The ChatbotPage initialized `activeAppointmentDraft` with hardcoded draft values, rendering an Appointment Summary Card and Floating Mobile Summary Bar on load before any appointment was actually initiated.
3. `/profile` and `CitizenBookAppointmentModal.tsx` contained fallback assignments injecting `'Mohamed Sameen'` and `'HG-PP27BNQ'`, which caused unauthenticated visitors or newly registered accounts to inadvertently view mock records and inpatient stays.
4. The Navbar "More Services" dropdown and mobile navigation drawer displayed personal citizen actions (`Medication Cabinet & Shield`, `Book Hospital OPD Slot`, `Consult Doctor (OPD Token)`) statically to unauthenticated guests.
5. The default unauthenticated avatar initial was hardcoded to `'M'`.
6. Action cards like "Speak to Doctor" and "Book OPD Appointment" allowed guest clicks without explicit login gating.

## Decision
1. **Strict Client-Side Route Gating**:
   - Direct visits or navigations to `/chat`, `/cabinet`, and `/profile` are intercepted by `requireAuth()` in `syncRoute()` and `navigateToView()`. Unauthenticated users are redirected to the landing view and the `LoginModal` is immediately displayed with custom contextual notices.
2. **Chatbot Lock & Zero-Mock Pure Dynamic State**:
   - `activeAppointmentDraft` is strictly initialized to `null`.
   - `createInitialReferenceSessions()` initializes a pristine, empty consultation without pre-filled bookings or mock patient identifiers.
   - For visitors in the chat interface, the input capsule is covered by a Frosted Security Lock Overlay banner ("Log in to consult DocBot AI & book appointments" with a "Sign In" button), and text/voice inputs and send buttons are disabled.
   - `handleSendMessage()` enforces an `ensureAuth()` guard.
   - `renderAppointmentSummaryCard()` returns `null` unless an active draft has been legitimately initiated.
3. **Zero-Fallback Sovereign Identity**:
   - Eradicated all hardcoded fallback values for `'Mohamed Sameen'`, `'Sameer Ahmed'`, and `'HG-PP27BNQ'` across `ProfilePage.tsx`, `CitizenBookAppointmentModal.tsx`, `DoctorsOpdView.tsx`, `StartConsultationModal.tsx`, and `hospitalAlertsService.ts`.
   - In `ProfilePage.tsx`, if `profileData.healthId` is null/empty, `activeInpatientStay` is set to `null` and `patientAppointments` to `[]`.
4. **Dynamic Navigation Filtering**:
   - In `Navbar.tsx`, personal action buttons in the "More" dropdown and mobile quick tiles (`Medication Cabinet`, `My Hospital Appointments`, `Consult Doctor`) are conditioned upon `{currentUser && ( ... )}`.
   - The default `userInitial` fallback is changed from `'M'` to `'U'`.
5. **Interactive Landing Gating**:
   - "Speak to Doctor" in `ActionCards.tsx` and "Book OPD Appointment" in `FindCareNearYou.tsx` dispatch `healthgrid:require-login` to ensure login is completed before opening patient intake or booking modals.

## Consequences
- **Positive**:
  - Full DPDP 2023 compliance and strict zero-trust privacy: no personal health records or clinical intake can occur anonymously.
  - Zero mock data leakage: new users or guests see clean, authentic zero-states instead of hardcoded demo personas.
  - Consistent UX: clear call-to-actions guide unauthenticated users to sign in.
- **Verification**:
  - Automated Vite + TypeScript production build (`tsc -b && vite build`) passes with 0 errors.
  - Browser subagent verified login modal triggers on `/chat`, `/cabinet`, `/profile`, and navbar menu item hiding.
