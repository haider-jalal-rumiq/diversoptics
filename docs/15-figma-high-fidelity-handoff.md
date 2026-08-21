# Figma Gate 4 — high-fidelity handoff

Status: ready for project-owner review on 2026-08-21. Production implementation remains blocked until explicit approval is recorded.

Figma file: <https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ>

## Review order

1. [Responsive public handoff](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=84-2)
2. [CMS handoff](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-2)
3. [Motion and resilience handoff](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-2)
4. [QA, facts and approval gate](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=110-2)

## Public screens

Sixteen high-fidelity screens or route templates are included.

### Desktop — 1440 px

- [Home](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=84-10)
- [Catalog](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=84-11)
- [Product](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=84-12)

### Tablet — 834 px

- [Home](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=90-498)
- [Catalog](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=90-499)
- [Product](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=90-500)

### Mobile — 390 px

- [Home](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-820)
- [Catalog](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-821)
- [Product](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-822)
- [Shortlist](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-823)
- [Store](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-824)
- [WhatsApp transition](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=94-825)

### Shared route templates

- [Brand and collection](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=102-1173)
- [Guide and policy](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=102-1218)
- [Store](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=102-1232)
- [Safe public edge states](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=102-1252)

## CMS screens

- [Invite-only login](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-8)
- [Dashboard](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-9)
- [Product list](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-10)
- [Product editor and publish validation](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-12)
- [Media and collections](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-13)
- [Settings and access](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=103-14)

The CMS handoff covers owner/editor/viewer permissions, draft-first imports, optimistic concurrency, publish blocking, audit context, media rights/alt-text validation, private-source/public-derivative storage, and environment-specific WhatsApp settings.

## Motion contracts

- [Orbit Hero](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-21)
- [Featured carousel](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-22)
- [Hover Curtain brands](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-24)
- [Type Reveal story](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-25)
- [Grid Dive edit](https://www.figma.com/design/bTTNOsvFVrnoFczV6mFbeJ?node-id=107-27)

Each concept defines enhanced, mobile/touch, reduced-motion and load-failure behavior. Motion values beyond the approved 1.4-second Orbit entrance are labelled proposed and remain subject to review. Runtime implementation will use isolated GSAP components, scoped cleanup and static fallbacks.

## Accuracy and demo-content controls

- All product names, SKUs and media are explicitly fictional fixtures.
- Production WhatsApp is `+92 333 5777710`; `03438067821` is visibly isolated to preview/test states.
- Price-on-inquiry is used until verified prices are supplied.
- Delivery may be stated as available; coverage, cost, timing and COD remain omitted.
- Exact shop address, map pin, business hours, separate phone and policies remain pending.
- No authorization, authenticity, warranty, medical, UV/lens-performance, review, rating or scarcity claim is present.

## Validation result

- Public: 16 screen/templates, no unfinished placeholder nodes, no missing fonts.
- CMS: six screens, no unfinished placeholder nodes, no missing fonts.
- Motion: five contracts, no unfinished placeholder nodes, no missing fonts.
- Typography is limited to the approved Instrument Serif and Manrope families.
- Golden Orbit variables, text styles and existing component instances remain the visual source system.

This is a design validation result. Accessibility, browser, performance, RLS and security claims must still be verified against production code.

## Approval gate

Approval must cover the responsive public screens, CMS workflows and motion contracts. After approval, record the reviewer and date in `docs/10-decisions-and-client-inputs.md`, merge this phase into `dev`, and begin `phase/01-web-foundation`.
