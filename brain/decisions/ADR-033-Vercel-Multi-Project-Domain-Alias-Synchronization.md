# ADR-033: Vercel Multi-Project Domain Alias Synchronization

## Context
During platform verification, updates to IPD Bed Management, Emergency Casualty, and Appointments were observed on some endpoints (such as healthgrid-nu.vercel.app) but appeared absent or stale on other production domain aliases (such as healthgrid-app.vercel.app, healthgrid-live.vercel.app, and healthgrid-network.vercel.app).

Investigation revealed that two separate projects existed within the Vercel organization account:
1. Project healthgrid (ID: prj_9eWUj1uwTytmnFvszIkY4OogVVA6) directly connected to GitHub repository NullErrOR-404/Health-Grid.
2. Project frontend (ID: prj_x7OUso9wpctoolVuRTZAuo4K5Y1B) which held domain registrations for healthgrid-app.vercel.app, healthgrid-live.vercel.app, and healthgrid-network.vercel.app, pointed to an older deployment snapshot from 6 days prior.

When continuous deployment triggered from git push on branch main, the healthgrid project built and updated healthgrid-nu.vercel.app automatically, but the other three aliases remained pointing to the legacy deployment hash.

## Decision
We executed an organization-level domain synchronization strategy via the authenticated Vercel CLI:

1. Identification of Latest Production Deployment:
The authoritative production deployment was identified as healthgrid-cmaojgkz1-sameen14nmofficial-8826s-projects.vercel.app (serving current build bundle index-BsgxhCpB.js and index-V3cCV6X7.css).

2. Production Alias Reassignment:
All three detached domain aliases were dynamically reassigned using Vercel alias commands:
- vercel alias set healthgrid-cmaojgkz1-sameen14nmofficial-8826s-projects.vercel.app healthgrid-app.vercel.app
- vercel alias set healthgrid-cmaojgkz1-sameen14nmofficial-8826s-projects.vercel.app healthgrid-live.vercel.app
- vercel alias set healthgrid-cmaojgkz1-sameen14nmofficial-8826s-projects.vercel.app healthgrid-network.vercel.app

3. Live Edge CDN Validation:
Curled HTTP headers and HTML payload from all 4 production aliases:
- https://healthgrid-app.vercel.app (HTTP 200 OK, bundle index-BsgxhCpB.js)
- https://healthgrid-nu.vercel.app (HTTP 200 OK, bundle index-BsgxhCpB.js)
- https://healthgrid-live.vercel.app (HTTP 200 OK, bundle index-BsgxhCpB.js)
- https://healthgrid-network.vercel.app (HTTP 200 OK, bundle index-BsgxhCpB.js)

4. End-to-End Live Browser Verification:
Executed interactive browser verification on https://healthgrid-app.vercel.app/hospital-erp:
- IPD & Bed Ward Management: Fully loaded with 250 Total Beds, 197 Occupied, 42 Available, 11 Maintenance, live ward filters, Sameer Ahmed patient drawer, and 100% interactive bed grid.
- Emergency Casualty Department: Fully loaded with 32 Total ER Patients, 6 Critical Red, 18 In Treatment, 5 Waiting, patient Mohamed Sameen, triage badges, and shift report modal.
- Appointments Management: Fully loaded with 148 Total Appointments, 102 Checked In, 28 Waiting, 18 Cancelled, and appointment action controls.

## Status
Accepted, verified live across all 4 production edge domains with zero regressions.
