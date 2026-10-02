---
title: Supabase Authentication Architecture
tags:
  - integration
  - auth
  - supabase
  - oauth
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🔐 Supabase Authentication Architecture

Back to [[00_Index]]

## Overview
HealthGrid uses Supabase as its authentication provider for patient and physician identity management.

## Technical Architecture
- **Service**: `frontend/src/services/authService.ts`
- **Component**: `frontend/src/components/LoginModal.tsx`
- **Supported Identity Providers**:
  1. **Google OAuth** (`provider: 'google'`) - Single sign-on for citizens and doctors.
  2. **Apple ID** (`provider: 'apple'`)
  3. **Email & Password** - Traditional account credentials.
  4. **Mock / Development Bypass** - Allows local testing without live Supabase keys.

## Session Subscription Pattern
`authService` implements an observable subscriber pattern:
```typescript
authService.subscribe((user: AuthUser | null) => {
  setCurrentUser(user);
});
```
This ensures reactive re-rendering across navigation bars, patient vaults, and appointment chambers whenever login state changes.

## Related Notes
- [[Google_OAuth_and_Verification]]
- [[Data_Sovereignty_and_Security]]
- [[Key_Credentials_and_Environments]]
