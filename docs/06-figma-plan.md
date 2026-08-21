# Figma design plan

Status: ready after client discovery facts and brand direction are approved.

## Principle

Figma is the decision surface for information architecture, conversion, responsive behavior, brand system, component states, and motion. It is not a gallery of disconnected desktop mockups.

## Required inputs before production high fidelity

- One brand direction, or explicit approval to create only the limited comparison key frames described below before selection.
- Final or interim vector logo plan.
- Confirmed categories and 10–20 representative products.
- Exact WhatsApp behavior and whether shortlist/reserve-to-try is operationally supported.
- Store details, policies, services, and authenticity language.
- English-only or bilingual scope.

Low-fidelity sitemap and flows can begin while final product photography is being collected, using explicit placeholders.

## Figma file structure

```text
00 Cover & status
01 Research & principles
02 Sitemap & user flows
03 Foundations
04 Components
05 Wireframes — public
06 High fidelity — public
07 CMS/admin
08 Motion & 3D prototypes
09 Content templates
10 QA & handoff
Archive
```

## Foundation setup

- Variables: color primitives, semantic colors, typography, spacing, radius, elevation, opacity, duration, easing.
- Modes: selected light/dark/editorial modes only if the approved direction genuinely needs them; reduced-motion is documented as behavior, not just a color mode.
- Grids: 4-column mobile, 8-column tablet, 12-column desktop with fluid margins.
- Spacing base: 4 px with a practical 8 px rhythm.
- Auto Layout for every reusable component.
- Component properties for size, state, icon, label, availability, price mode, and media ratio.
- Token names are semantic (`surface-primary`, `text-muted`, `action-primary`) rather than color names inside components.

## Stage 1 — flows and wireframes

### Deliverables

- Sitemap and category taxonomy.
- Model seeker, style browser, lens/service, gift buyer, and local visitor flows.
- Mobile-first wireframes for home, category, search, filters, product, shortlist, store, guide, and WhatsApp transition.
- CMS product creation/publish flow.
- Content hierarchy and placeholder rules.

### Gate

Stakeholders can complete the core tasks on paper/prototype before visual styling begins.

## Stage 2 — optional two-direction comparison key frames

If the client cannot choose confidently from the written brand concepts, create the same three limited key frames in each direction:

1. Mobile homepage hero/category transition.
2. Desktop product detail above the fold.
3. Instagram 4:5 launch cover or store campaign tile.

This prevents a brand choice based only on a mood board. If the written concepts are sufficient, select a direction and skip the rejected direction entirely. In either case, only the selected direction proceeds to the full design system; archive the rejected exploration.

## Stage 3 — design system

### Core components

- Announcement bar, header, mega/dropdown menu, mobile navigation.
- Search field, predictive result, filter chips, filter drawer, sort.
- Buttons/links, icon buttons, WhatsApp CTA, focus states.
- Product card, category card, brand tile, editorial story card.
- Price modes, availability, evidence/policy chips.
- Image gallery, thumbnails, zoom, video/3D poster/viewer shell.
- Variant selector, attribute/spec table, accordion.
- Shortlist tray/page and WhatsApp confirmation sheet.
- Store module, hours, map/directions, review card.
- Forms, inputs, upload, validation, toast, dialog, empty/error/loading states.
- CMS table, editor sections, media uploader, publish checklist.

### State matrix

Every interactive component includes default, hover, focus, active, disabled, loading, error, and selected states where relevant. Product components include long title, missing price, out of stock, available to order, no secondary image, and sale only if pricing rules are approved.

## Stage 4 — responsive screen set

### Public MVP screens

| Screen | Mobile | Tablet | Desktop |
|---|---:|---:|---:|
| Homepage | Full | Key layout | Full |
| Category/collection | Full | Key layout | Full |
| Search + zero results | Full | — | Full |
| Filter/sort states | Full | Key layout | Full |
| Brand landing | Key | — | Full |
| Product detail | Full | Key layout | Full |
| Shortlist | Full | — | Full |
| Store | Full | — | Full |
| Guide/article | Key | — | Full |
| Contact/policy | Key | — | Key |

### CMS screens

- Login/recovery.
- Dashboard.
- Product list and bulk actions.
- New/edit product across all steps.
- Media upload/reorder/alt text.
- Brand/category/collection management.
- Global store/settings.
- Validation, preview, publish, archive, and permission-denied states.

## Stage 5 — prototypes

### Prototype A: find and inquire

Home -> category -> filters -> product -> variant -> WhatsApp confirmation.

### Prototype B: shortlist

Search -> add three products -> open shortlist -> remove/reorder -> add note -> WhatsApp handoff.

### Prototype C: local visit

Product/home store module -> store page -> hours/details -> directions/call.

### Prototype D: CMS

Login -> create product -> upload/reorder images -> validation error -> fix -> preview -> publish.

### Prototype E: motion/3D

One hero scene and one product viewer shell, each with normal, low-power/static, loading, error, and reduced-motion states.

Figma prototypes communicate behavior; production feasibility is validated with a small code spike after high-fidelity approval, before applying 3D broadly.

## Motion specification

For every motion pattern document:

- Trigger and customer purpose.
- Start/end states.
- Duration and easing token.
- Interruption behavior.
- Mobile/low-power behavior.
- Reduced-motion replacement.
- Loading and failure fallback.

Avoid “smooth scroll” as a blanket requirement. Native scrolling remains the baseline.

## Content in Figma

- Use real representative product names, long names, PKR formats, missing-price states, and actual image ratios as soon as available.
- Keep placeholders visibly labelled.
- Add annotations for CMS source fields and character guidance.
- Include product/social crop previews so one source shoot supports web and social.
- Do not place lorem ipsum in screens presented for final approval.

## Review cadence

1. 30–45 minute discovery and brand selection.
2. Sitemap and low-fidelity flow review.
3. Directional key-frame review.
4. Design-system and first responsive flow review.
5. Full high-fidelity and CMS review.
6. Usability/accessibility fixes.
7. Explicit handoff approval.

Collect feedback against the customer task and documented principle, not isolated taste. Record accepted decisions in `10-decisions-and-client-inputs.md`.

## Usability and accessibility review

- Test the five MVP tasks from the UX specification with 5 representative people if possible.
- Review keyboard/focus order, text contrast, touch targets, headings, dialogs, error recovery, zoom at 200%, and reduced motion.
- Test with long product names, no price, out of stock, incomplete media, and slow-loading media.
- Review the WhatsApp message on iOS/Android and desktop handoff states.
- Validate that every visual filter/state has a text equivalent.

## Handoff package

- Approved Figma URL and version/date.
- Variables/tokens export.
- Component inventory and behavior notes.
- Responsive rules and content limits.
- Redlines only where variables/Auto Layout do not communicate intent.
- Media specs, crop map, and 3D budgets.
- Accessibility acceptance checklist.
- Screen-to-route and component-to-data-field mapping.
- Deferred ideas clearly separated from MVP.

## Indicative schedule

After inputs are available:

- Discovery/brand selection: 2–4 working days.
- Sitemap and wireframes: 3–5 working days.
- Directional key frames and design system: 4–6 working days.
- Responsive public/CMS screens and prototypes: 6–10 working days.
- Testing, revision, and handoff: 3–5 working days.

This is a planning range, not a delivery promise. Product data/photo readiness and client feedback speed are the main dependencies.
