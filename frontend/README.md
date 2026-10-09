# HealthGrid Client Application

> React 19 • TypeScript 6 • Tailwind CSS v4 • Lenis Kinetic Engine • Leaflet GIS

The frontend client for **HealthGrid**, an autonomous real-time emergency telemetry and predictive community healthcare network.

## Key Modules

- **`src/components/FindCareNearYou.tsx`**: High-performance geospatial radar with Leaflet and CARTO raster tiles for healthcare facilities.
- **`src/components/FloatingDoctorMascot.tsx` & `LiveRiggedDocBot.tsx`**: Dynamic 3D clinical avatar with gesture kinematics and speech interaction.
- **`src/components/VoiceChatModal.tsx`**: Real-time vernacular clinical triage powered by Groq LPU and Google Gemini.
- **`src/components/AmbulanceModal.tsx`**: 108 Emergency ambulance telemetry with live GPS coordinate acquisition and parametric ETA tracking.
- **`src/components/PrescriptionModal.tsx`**: Jan Aushadhi generic medicine cost-equivalence matching engine.
- **`src/components/ProfilePage.tsx`**: Local-first encrypted patient health vault and dynamic emergency contacts.
- **`src/services/lenisService.ts`**: Inertial smooth scroll engine with automatic modal suppression.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Generates optimized static output in `dist/` ready for global CDN deployment on Vercel.
