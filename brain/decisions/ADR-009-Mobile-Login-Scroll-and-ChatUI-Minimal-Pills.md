---
title: "ADR-009: Mobile Login Scroll Architecture & ChatUI Minimal Pill System"
tags:
  - decision
  - adr
  - login-modal
  - chatui
  - mobile-ux
  - responsive
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-009: Mobile Login Scroll Architecture & ChatUI Minimal Pill System

Back to [[00_Index]]

## Context
1. **LoginModal Mobile Scroll Trapping**:
   - On mobile viewports (<640px and <1024px), users clicking "Sign In" encountered a locked modal card where scrolling down was blocked.
   - Root cause: Each view (`PERSONA_SELECT`, `HEALTHCARE_PROFESSIONAL`, `HOSPITAL`, `PERSONAL`) had a 600px+ marketing banner column stacked above the interactive form (`w-full`), coupled with `min-h-[660px]` and outer `flex items-center` with `h-full`, clipping forms off-screen and trapping touch momentum.
2. **ChatbotPage Header & Control Misalignment**:
   - On mobile screens, 5 disparate action items (`Live Vision Clinic`, `Health Memory`, `Dr. Meera (F) / Dr. Arvind (M)` dual toggle, `EN` language selector, and `Sign In` profile button) were crammed into a single row.
   - Because horizontal space was insufficient, text broke awkwardly onto multiple lines (e.g., `Dr. Meera \n (F)`), causing major visual misalignment and clutter.
   - Inside the chat interface, suggestion cards were bulky 2-column rectangular boxes with large icons that occupied unnecessary vertical space.

## Decision
1. **LoginModal Mobile Scroll & Direct Account Access**:
   - Hidden the desktop marketing illustration banners on mobile viewports (`hidden lg:flex lg:w-[49%]`) across all 4 modal views.
   - Replaced fixed desktop minimum heights (`min-h-[660px]`) with responsive heights (`min-h-0 lg:min-h-[660px] flex-1`).
   - Upgraded modal container to `w-full min-h-[100dvh] sm:min-h-0 sm:h-auto sm:max-h-[92vh] overflow-y-auto overscroll-contain pb-8 sm:pb-0 safe-area-pb` with top alignment on mobile (`items-start sm:items-center`).
   - Enabled smooth native touch scrolling on iOS and Android with `-webkit-overflow-scrolling: touch` and `overscroll-contain`.
2. **ChatUI Ultra-Minimal Header System**:
   - De-duplicated the doctor voice toggle from the top header (it is already docked conveniently right above the message input bar).
   - Redesigned the remaining 4 header actions into concise, minimal rounded-full pills:
     - `[ 📹 Live ]` (with live green pulse dot; expands to "Live Vision" on `md`)
     - `[ 🩺 Records ]` (compact vitals & memory hub pill)
     - `[ 🌐 EN ]` (compact language switcher pill)
     - `[ 👤 Sign In ]` / User avatar pill
   - Wrapped items in `shrink-0 whitespace-nowrap`, guaranteeing single-line alignment with zero text wrapping down to 320px screen width.
   - Hidden the secondary "Verified Assistant" text on small mobile screens (`hidden sm:flex`) to provide comfortable breathing room.
3. **In-Chat Concise Pill Component System**:
   - Converted the welcome screen voice selector from bulky boxes into an ultra-clean pill toggle (`Dr. Meera [F]` / `Dr. Arvind [M]`).
   - Converted the 4 welcome suggestion cards into sleek interactive pill chips with micro-dots and hover arrows (`[ 💊 Fever & Cold ]`, `[ 📋 Lab Report ]`, etc.).
   - Standardized input bar docked controls (AGI model selector, Doctor Voice Persona segment, and message voice indicators) to use concise `rounded-full` pill styling.

## Consequences
- **Instant Mobile Usability**: Users can immediately tap account types and scroll down through login credentials on any mobile device without trapped scrolling.
- **Zero Header Wrapping in Chat**: Header actions occupy only ~260px on mobile, perfectly coexisting with the DocBot AI brand mark.
- **Unified Pill Design Language**: The chat interface now features consistent, modern rounded-full pill micro-interactions that feel native and refined.

## Related Notes
- [[ADR-008-Mobile-Navbar-Zero-Overflow-Architecture]]
- [[ADR-005-Mobile-First-Responsive-Architecture]]
- [[Design_System_Tokens]]
- [[Active_Context]]
