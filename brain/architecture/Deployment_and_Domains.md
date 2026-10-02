---
title: Deployment, Domains & Routing Architecture
tags:
  - architecture
  - deployment
  - vercel
  - domains
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🚀 Deployment, Domains & Routing Architecture

Back to [[00_Index]]

## Production Domains & Aliases

HealthGrid is synchronized across 4 high-availability Vercel production aliases:

1. **`https://healthgrid-app.vercel.app`** (Primary Verified Production Domain)
2. **`https://healthgrid-nu.vercel.app`** (Alternate Alias)
3. **`https://healthgrid-live.vercel.app`** (Live Edge CDN Mirror)
4. **`https://healthgrid-network.vercel.app`** (Network Mirror)

> [!important] Vercel SSO / Deployment Protection Bypass
> Default Vercel Team protection causes a `302 Found` redirect to `https://vercel.com/sso-api`, breaking automated crawlers (Google Cloud OAuth Verification, SEO scrapers).
> **Status:** Permanently disabled via `vercel project protection disable frontend --sso`. All 4 domains return `HTTP 200 OK`.
> See [[ADR-002-Vercel-SSO-Bypass]].

## Client-Side Routing in Single Page Application (SPA)

`frontend/src/App.tsx` handles synchronizing browser URLs using HTML5 `pushState` and `popstate` events:

| Path | View State | Rendered Component |
| :--- | :--- | :--- |
| `/` or `/index.html` | `landing` | Main Landing Page (Hero, Shelves, Insights, Transparency Section) |
| `/privacy` | `privacy` | Dedicated [[Data_Sovereignty_and_Security]] & Privacy Policy Page |
| `/terms` | `terms` | Telemedicine clinical terms & condition disclaimers |
| `/chat` | `chat` | Fullscreen [[DocBot_TeleClinic]] Chamber |
| `/medicines` | `medicines` | [[Generic_Medicines_PMBJP]] Kendra Store |
| `/maps` | `maps` | [[Hospital_Bed_Locator]] & PHC Finder |
| `/his` | `hospital-erp` | Redirects to [[Hospital_ERP_Dashboard]] (see [[ADR-006-Decommission-Legacy-HIS-Doctor-Portal]]) |
| `/hospital-erp` | `hospital-erp` | [[Hospital_ERP_Dashboard]] (Multi-tenant) |

## Related Notes
- [[ADR-002-Vercel-SSO-Bypass]]
- [[Google_OAuth_and_Verification]]
- [[Tech_Stack]]
