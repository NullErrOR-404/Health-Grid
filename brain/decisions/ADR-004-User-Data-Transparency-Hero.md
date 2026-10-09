---
title: "ADR-004: User Data Transparency Hero Layout & 1672px Visual Canvas"
tags:
  - decision
  - adr
  - ui
  - google-oauth
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-004: User Data Transparency Hero Layout & 1672px Visual Canvas

Back to [[00_Index]]

## Context

Google requires the homepage to transparently explain why user data is collected and ensure Limited Use compliance. Initial implementations placed large white cards over the background illustration, blocking the 3D DocBot mascot's torso, blue lock shield, and Google credential cards.

## Decision

1. Redesigned `OAuthTransparencySection.tsx` to utilize the **empty left space** of the 1672x941 background graphic (`user_data_trust_bg.png`).
2. Docked a sleek, concise glassmorphism panel on the left (`max-w-2xl bg-white/95 backdrop-blur-xl border border-blue-100 rounded-3xl`) containing:
   - Clear app purpose & core features.
   - Purpose of Google Sign-In (`openid`, `email`, `profile`).
   - Google Limited Use adherence & zero-ads guarantee.
   - Direct, crawlable links to `/privacy` and `/terms`.
3. Left the entire right half of the section transparent and open, fully showcasing the 3D DocBot holding the blue shield with zero obstruction.

## Related Notes

- [[Google_OAuth_and_Verification]]
- [[Data_Sovereignty_and_Security]]
