# ADR-044: React Native Android Architecture, OWASP Mobile Security Suite, and APK Generation

## Context

Following the web application enhancements in [[ADR-043-Dynamic-Live-Clinic-Supabase-Telemetry-and-Frontier-Model-Pipeline]], the user requested packaging HealthGrid as a real industry-standard Android application (`.apk`) equipped with comprehensive mobile security implementations mirroring and extending the web application's zero-trust security architecture.

Through `/grill-me` design alignment, the following architectural decisions were resolved:

1. **Technology Stack**: React Native (Expo SDK 57 / New Architecture) compiling to native Android views (not a simple webview wrapper), matching the mobile architecture used by frontier tech scaleups (Meta, Shopify, Discord).
2. **Repository Structure**: Dedicated `mobile/` directory at repository root (`C:\HealthGrid\mobile`), maintaining clean separation between web and mobile build artifacts.
3. **UI & Design System**: NativeWind / Tailwind CSS tokens matching HealthGrid's 8pt spatial grid, dark slate theme (`#0B1120`), and emerald accents (`#10B981`).
4. **OWASP Mobile Security Suite**: Full suite comprising Hardware-backed Android Keystore, Biometric App Lock, Screen Privacy Shield (`FLAG_SECURE`), Root/Tamper Detection, and Network Security Configuration.
5. **Screen Scope**: Complete 4-Core Mobile Suite (DocBot AI Chat, AI Live Clinic with native CameraX, Biometric Records Hub, and 108 Emergency Casualty with GPS).
6. **APK Build Channels**: Dual configuration with EAS Cloud Build (`preview` profile in `eas.json` outputting `.apk`) and local native Gradle build (`assembleDebug` via Android Studio JBR).

---

## Decision

### 1. Dedicated Mobile Architecture (`C:\HealthGrid\mobile`)

- Scaffolded Expo SDK 57 TypeScript application with React Native 0.86.3 and React 19.2.3.
- Environment variables (`EXPO_PUBLIC_*`) linked in `.env` for Supabase, Groq, Gemini, and Hugging Face.
- Root navigation in `App.tsx` featuring a 4-tab clinical bottom dock with dynamic active states.

### 2. OWASP Mobile Security Suite Implementation

- **Hardware-Backed Android Keystore (`secureStorageService.ts`)**:
  - Leverages `expo-secure-store` utilizing AES-256 GCM authenticated encryption.
  - Keys, tokens, session profiles, and clinical transcripts are stored inside Android's Hardware TEE (Trusted Execution Environment) / StrongBox Keymaster.
- **Biometric App Lock & Health Vault (`biometricService.ts`)**:
  - Leverages `expo-local-authentication` to enforce native Android BiometricPrompt (Fingerprint / Face Unlock) before unlocking confidential medical records, vitals, and consultation histories.
- **Screen Privacy Shield (`FLAG_SECURE`)**:
  - Injected `WindowManager.LayoutParams.FLAG_SECURE` into `MainActivity.kt` `onCreate`.
  - Blocks OS-level screenshots and screen recordings of patient data and blanks app previews in the Android task switcher / recent apps carousel.
- **Network Security Configuration (`network_security_config.xml`)**:
  - Explicitly configured in `res/xml/network_security_config.xml` and linked via `AndroidManifest.xml`.
  - Disallows cleartext HTTP traffic (`cleartextTrafficPermitted="false"`) and enforces TLS 1.3 certificate pinning across Supabase (`supabase.co`) and AI APIs (`api.groq.com`, `generativelanguage.googleapis.com`).
- **Anti-Exfiltration / Zero ADB Backup**:
  - Enforced `android:allowBackup="false"` in `AndroidManifest.xml` to prevent unauthorized extraction of patient databases via ADB desktop backups.
- **Device Integrity & Cryptographic Fingerprinting (`deviceIntegrityService.ts`)**:
  - Performs runtime tamper evaluation, detecting debugger attachment and unauthorized runtimes.
  - Generates deterministic hardware fingerprint hashes using SHA-256 via `expo-crypto`.

### 3. Core Mobile Clinical Screens

- **DocBot AI Doctor (`ChatScreen.tsx`)**:
  - Real-time conversational AI doctor with Groq Llama-3.3-70B and Gemini fallbacks.
  - Strict zero-asterisk sanitization, bedside empathy, dynamic option pills (`<<<OPTIONS>>>`), expandable quick vitals drawer, and native Indian English/Tamil voice read-aloud via `expo-speech`.
- **AI Live Clinic (`LiveClinicScreen.tsx`)**:
  - High-performance native CameraX feed via `expo-camera`.
  - **Zero Doctor PIP Image** (clean full-bleed viewfinder as mandated).
  - Floating `DocBot Speaking` indicator with kinetic audio equalizer bars active only during speech.
  - Dynamic verification checklist with interactive checkboxes and `Next →` action.
  - Live dialogue automatically persisted to local device storage using hardware Keystore encryption.
- **Records Hub & Vitals Vault (`RecordsHubScreen.tsx`)**:
  - Gated behind biometric fingerprint/PIN challenge.
  - 6 metric category pills (Blood Pressure, Blood Sugar, Pulse, SpO2, Temperature, Weight).
  - Quick-add form with AES-256 encrypted storage and chronological history table.
- **108 Emergency Casualty (`EmergencyScreen.tsx`)**:
  - High-contrast red trauma cockpit.
  - Live GPS coordinate fix and reverse-geocoding via `expo-location`.
  - 1-tap `CALL 108 AMBULANCE NOW` dialing `tel:108`.
  - Telemetry cards for nearest casualty trauma centers (RGGGH, Omandurar, Kilpauk).

### 4. Build Pipelines & APK Output

- **EAS Cloud Build Profile (`eas.json`)**:
  - Configured `preview` profile with `android.buildType: "apk"` for instant installable APK generation in Expo Cloud (`npx eas-cli build -p android --profile preview`).
- **Local Gradle Wrapper (`mobile/android`)**:
  - Prebuilt native Android project with Gradle 9.3.1 and Android Studio JBR (Java 25).
  - Configured `gradlew.bat assembleDebug` generating `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Status

- **TypeScript**: 100% strict compilation pass with 0 errors (`npx tsc --noEmit`).
- **Prebuild**: Native Android project successfully prebuilt with all security attributes.
- **Status**: Ready for APK generation via EAS Cloud Build or local Gradle.
