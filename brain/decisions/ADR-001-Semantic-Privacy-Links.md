---
title: "ADR-001: Semantic Crawlable HTML Privacy & Terms Links"
tags:
  - decision
  - adr
  - seo
  - compliance
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-001: Semantic Crawlable HTML Privacy & Terms Links

Back to [[00_Index]]

## Context
Google Cloud Console OAuth review rejected HealthGrid branding with:
*"Your homepage does not include an easily accessible link to your privacy policy."*

## Root Cause Analysis
In `frontend/src/components/Footer.tsx`, links to the Privacy Policy and Terms of Service were coded as:
```tsx
<button type="button" onClick={onOpenPrivacy}>Privacy Policy</button>
```
Google's automated headless verification crawlers do not execute arbitrary React button click events. They parse the static HTML DOM for standard `<a href="...">` anchor tags.

## Decision
Convert all navigation and footer references to semantic HTML anchor tags:
```tsx
<a 
  href="/privacy" 
  onClick={(e) => {
    if (onOpenPrivacy) {
      e.preventDefault();
      onOpenPrivacy();
    }
  }}
>
  Privacy Policy
</a>
```
This ensures:
1. Automated crawlers identify `href="/privacy"` and `href="/terms"`.
2. Browser users enjoy seamless single-page application navigation without page reloads.

## Related Notes
- [[Google_OAuth_and_Verification]]
- [[Deployment_and_Domains]]
