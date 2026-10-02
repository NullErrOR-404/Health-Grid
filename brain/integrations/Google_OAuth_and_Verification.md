---
title: Google Cloud OAuth & Brand Verification Checklist
tags:
  - integration
  - google-oauth
  - verification
  - compliance
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🛡️ Google Cloud OAuth & Brand Verification Checklist

Back to [[00_Index]]

## Overview
To move Google Sign-In out of "Testing" into "Production" and remove the unverified app warning, Google Cloud Console requires strict branding, domain ownership, and user data transparency checks.

## Verification Requirements Matrix

| Requirement | Implementation in HealthGrid | Status |
| :--- | :--- | :--- |
| **Domain Ownership** | `<meta name="google-site-verification" content="..." />` in `index.html` verified in Google Search Console. | ✅ Verified |
| **App Homepage** | Hosted on `https://healthgrid-app.vercel.app` (fully public, zero SSO login wall). | ✅ Active |
| **Data Purpose Disclosure** | Dedicated [[ADR-004-User-Data-Transparency-Hero]] on homepage explaining `openid`, `email`, and `profile` usage. | ✅ Implemented |
| **Limited Use Statement** | Verbatim adherence quote from Google API Services User Data Policy on homepage & privacy page. | ✅ Displayed |
| **Accessible Privacy Link** | Semantic HTML `<a href="/privacy">` tags in header, footer, and transparency panel. | ✅ Crawlable |
| **Accessible Terms Link** | Semantic HTML `<a href="/terms">` tags in footer and policy sections. | ✅ Crawlable |

## OAuth Scopes Requested
- `openid`: Cryptographic token verification via Supabase without storing Google passwords.
- `.../auth/userinfo.email`: Links private health vaults, doctor tokens, and prescriptions to user.
- `.../auth/userinfo.profile`: Displays user name on the medical dashboard.

> [!important] Zero Extended Permissions
> HealthGrid never requests access to Google Drive, Gmail, Google Contacts, or browsing history.

## Related Notes
- [[ADR-001-Semantic-Privacy-Links]]
- [[ADR-002-Vercel-SSO-Bypass]]
- [[ADR-004-User-Data-Transparency-Hero]]
- [[Supabase_Auth]]
