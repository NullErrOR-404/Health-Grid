---
title: "ADR-002: Disabling Vercel SSO Protection on Production Aliases"
tags:
  - decision
  - adr
  - vercel
  - devops
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-002: Disabling Vercel SSO Protection on Production Aliases

Back to [[00_Index]]

## Context
Google OAuth verification reported:
*"The provided homepage URL redirects to a different domain than the one listed on the OAuth consent screen"* and *"Your homepage is behind a login page"*.

## Root Cause
When projects are deployed under a Vercel Pro Team, Vercel enables **Deployment Protection** by default on preview and `.vercel.app` domains:
```json
{
  "ssoProtection": {
    "deploymentType": "all_except_custom_domains"
  }
}
```
Visiting `https://healthgrid-app.vercel.app` resulted in an immediate `HTTP/1.1 302 Found` redirecting to `https://vercel.com/sso-api`, blocking Google reviewers with a Vercel login screen.

## Decision
Execute `vercel project protection disable frontend --sso`.
Now `ssoProtection` is `false`, ensuring that:
- `https://healthgrid-app.vercel.app` returns `HTTP/1.1 200 OK` directly.
- Google's crawler and external visitors access the public landing page with zero login barriers.

## Related Notes
- [[Deployment_and_Domains]]
- [[Google_OAuth_and_Verification]]
