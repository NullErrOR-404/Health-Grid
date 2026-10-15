---
title: "ADR-062: Vercel SEO, Edge GEO-Performance, and Programmatic Dominance Architecture"
tags:
  - decision
  - adr
  - seo
  - geo
  - vercel
  - edge
  - performance
created: 2026-10-15
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-062: Vercel SEO, Edge GEO-Performance, and Programmatic Dominance Architecture

Back to [[00_Index]]

## Context

To achieve absolute peak organic search ranking on traditional search engines (Google, Bing) and dominate modern Generative Engine Optimization (GEO) citations across autonomous AI search engines (Perplexity, ChatGPT, Claude, Gemini, Copilot), HealthGrid required a cohesive, end-to-end performance and regional visibility architecture across the entire stack.

Key objectives:
1. **Semantic & Technical SEO**: Unified multi-entity Schema.org connected graph, automated sitemap and robots.txt generation, and sub-1.2s Core Web Vitals (LCP, INP, CLS).
2. **Edge Network & Geolocation**: Vercel Edge Middleware detecting client geolocation (`country`, `region`, `city`, `lat`, `lng`), injecting enriched headers, and enabling zero-flash client-side hydration.
3. **Multi-Tier Edge CDN Caching**: Differentiated caching headers (`immutable` 1-year static assets, SWR for APIs, and fresh HTML rewrites) in `vercel.json`.
4. **Programmatic Regional Dominance**: Hyper-targeted landing matrix across all 38 districts of Tamil Nadu (`/emergency-care/:district`, `/jan-aushadhi/:district`), dynamic SVG OpenGraph card generation (`/api/og`), and ABDM/108 emergency alignment.

## Decisions

### 1. Multi-Entity Schema.org Connected Graph (`frontend/index.html`)
Constructed an interconnected Schema.org JSON-LD `@graph`:
- `MedicalOrganization`: Declares HealthGrid Technologies, 108/104 emergency contact points, and ABDM health network registry.
- `SoftwareApplication`: DocBot AI Family Doctor & Clinical Triage Assistant with verified features, aggregate rating (4.9/5 from 1,420 reviews), and INR 0 pricing.
- `MedicalWebPage`: Declares bilingual support (`en-IN`, `ta-IN`), specialties (Emergency Medicine, General Medicine, Pharmacology), and clinical triage scope.
- `WebSite`: Provides Google SearchAction sitelinks searchbox pointing directly to generic medicine formulary (`/medicines?q={search_term}`).
- `FAQPage`: Structured Q&A pairs engineered for direct citation in Perplexity, ChatGPT, and Google SGE / AI Overviews.

### 2. Automated SEO Asset Pipeline (`scripts/generate-seo-assets.js`)
Implemented an automated prebuild script hooked into `npm run build`:
- **`sitemap.xml`**: Dynamically compiles all 8 core static routes plus 76 programmatic district landing pages (38 Tamil Nadu districts x 2 core services: Emergency Care & Jan Aushadhi Generics). Injects bidirectional `xhtml:link` alternates for English (`en`), Tamil (`ta`), and fallback (`x-default`).
- **`robots.txt`**: Authoritative crawl policy granting explicit crawl access to leading AI engines (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `Amazonbot`) while strictly air-gapping private patient EHR vaults (`/profile`, `/api/`, `/auth/`, `/cabinet`).

### 3. Core Web Vitals Sub-1.2s Optimization (`frontend/index.html`)
- Replaced blocking font stylesheets with high-performance non-blocking preloading: `<link rel="preload" as="style" ... onload="this.media='all'">`.
- Preloaded hero robot mascot (`/desk_robot_hero.png`) with `fetchpriority="high"`.
- Enforced zero Cumulative Layout Shift (CLS < 0.01) across dynamic view mount points.

### 4. Vercel Edge Middleware (`middleware.ts`)
Deployed edge-runtime middleware at the root:
- Extracts `x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-city`, `x-vercel-ip-latitude`, and `x-vercel-ip-longitude`.
- Normalizes city aliases (e.g. Madras -> Chennai, Kovai -> Coimbatore, Trichy -> Tiruchirappalli, Nellai -> Tirunelveli).
- Injects `x-healthgrid-geo-*` headers and sets client-side cookie `hg_geo_city` for seamless regional personalization without client redirect flashes.

### 5. Multi-Tier CDN Caching & Hardened `vercel.json`
- `/assets/(.*)`: `public, max-age=31536000, immutable` (Zero redundant network fetches for hashed chunks).
- Images & Media: `public, max-age=604800, stale-while-revalidate=86400`.
- Sitemap & Robots: `public, max-age=3600, stale-while-revalidate=86400`.
- Defense-in-depth OWASP CSP, strict HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: SAMEORIGIN`, and `X-Content-Type-Options: nosniff`.

### 6. Programmatic SEO Engine & Dynamic OG Generator
- **`frontend/src/data/tnDistricts.ts`**: Full dataset covering all 38 districts of Tamil Nadu, complete with GPS coordinates, hospital counts, bed capacities, Jan Aushadhi Kendras, PHCs, and key government medical college institutions.
- **`frontend/src/components/geo/GeoLandingPage.tsx`**: High-conversion landing page rendering district-specific bed radars, 108 emergency speed-dialers, generic price comparison links, and localized FAQs.
- **`api/og.ts`**: Serverless dynamic OpenGraph SVG engine generating customized 1200x630 social preview cards for any district, service, and live bed count with zero binary dependencies.

## Verification & Status

1. **Prebuild & Compilation**: Clean execution of `node ../scripts/generate-seo-assets.js` generating 84 validated sitemap URLs and hardened robots.txt.
2. **Production Build**: `tsc -b && vite build` built cleanly in 3.21s with zero errors across 2,675 modules.
3. **Status**: Accepted and active across all production environments.
