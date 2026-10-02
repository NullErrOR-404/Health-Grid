---
title: Tech Stack & System Architecture
tags:
  - architecture
  - tech-stack
  - frontend
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🛠️ Tech Stack & System Architecture

Back to [[00_Index]]

## Core Technologies

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Runtime / UI Framework** | React 19.x | Modern functional components, hooks, concurrent rendering, dynamic lazy-loading. |
| **Build Tool & Bundler** | Vite 8.3.x | Lightning-fast HMR, Rolldown / Rollup chunking, code splitting per route. |
| **Language** | TypeScript 5.9.x | Strict null checks, custom interfaces in `frontend/src/types/`. |
| **Styling** | Tailwind CSS + Vanilla CSS | Custom color palettes, glassmorphism, responsive utilities, custom CSS animations in `index.css`. |
| **Icons & Visuals** | Lucide React | Clean, scalable SVG icons across all modules. |
| **Smooth Scrolling** | Lenis Smooth Scroll | Hardware-accelerated Lenis service in `frontend/src/services/lenisService.ts`. |
| **Geospatial & Maps** | Leaflet + React Leaflet | Interactive maps in `FindCareNearYou.tsx`. |
| **Authentication** | Supabase Auth | Managed auth client with Google OAuth, Apple ID, Email & Password in `authService.ts`. |

## Key Directories

```
HealthGrid/
├── brain/                   # Obsidian Second Brain (Knowledge Graph)
├── frontend/
│   ├── public/              # Static assets (images, icons, robots.txt, sitemap.xml)
│   ├── src/
│   │   ├── components/      # Modular UI views, dialogs, modals, and sections
│   │   │   ├── erp/         # Multi-tenant Hospital ERP dashboard
│   │   │   └── his/         # Hospital Information System (doctor chamber)
│   │   ├── services/        # Business logic, AI orchestrators, auth, userspace
│   │   ├── data/            # Static datasets (hospitals, medicine catalogue)
│   │   └── types/           # Global TypeScript definitions
```

## Related Notes
- [[Deployment_and_Domains]]
- [[Multi_Tenant_State_Engine]]
- [[AI_Providers_and_LLMs]]
