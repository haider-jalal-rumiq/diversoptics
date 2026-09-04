# Delivery backlog

Status key: `[ ]` pending, `[~]` in progress, `[x]` complete, `[!]` blocked by client input.

## Foundation

- [x] Inspect supplied logo files.
- [x] Research supplied competitors and additional local/international benchmarks.
- [x] Define two brand directions.
- [x] Define MVP UX, CMS architecture, Figma plan, and social operating model.
- [!] Confirm remaining business facts; Golden Orbit is selected.
- [x] Convert the selected direction into approved `docs/brand-guidelines.md`.
- [x] Create and validate Golden Orbit design tokens in Figma.
- [x] Produce a client-facing brand presentation in Canva comparing both directions.

## Figma

- [x] Create the Figma project, page structure, variables, foundation documentation, and naming conventions.
- [x] Produce and approve the sitemap and mobile-first low-fidelity flows.
- [x] Review and approve homepage, catalog, product detail, shortlist, store, and WhatsApp transition wireframes.
- [x] Build and validate the approved Golden Orbit token and component library in Figma.
- [x] Design responsive public screens and CMS screens; 16 public templates and six CMS screens are ready for Gate 4 review.
- [x] Complete motion storyboards for Orbit Hero and the four supplied animation references, including mobile, reduced-motion and failure behavior.
- [~] Run accessibility and five-task usability review; structural/state review is complete, while moderated task validation and runtime checks remain.
- [x] Obtain explicit high-fidelity approval.

## Implementation

- [x] Initialize and validate the Next.js/TypeScript web foundation after Figma approval.
- [x] Configure Supabase environments, migrations, Auth, RLS, and Storage policies.
- [x] Build catalog, search/filtering, product pages, shortlist, and inquiry redirect.
- [x] Build owner CMS and product media workflow.
- [!] Create the first owner Auth identity in the Supabase dashboard, then configure hosted Auth URLs, invite template, SMTP, and the server-only secret. Emails are supplied; the identity itself must be created by a human because it requires setting a password.
- [x] Add metadata, sitemap, Product/Breadcrumb/LocalBusiness structured data, and social previews.
- [x] Add analytics events and reporting definitions; see `docs/19-analytics-and-reporting.md` and the CMS Inquiries screen.
- [x] Revise the public header into the client-approved catalog mega-navigation and add the lightweight Golden Orbit site atmosphere.
- [x] Apply the two Phase 03 migrations to the cloud project and verify the generated database types.
- [x] Add business-hours editing to the CMS settings screen.
- [ ] Seed a 10–20 product pilot set and validate the schema before bulk entry.
- [ ] Complete accessibility, performance, device, content, and security QA.
- [ ] Train owner/admin and launch.

## Social and local discovery

- [!] Secure/administer official Instagram, Facebook, TikTok, WhatsApp Business, and Google Business Profile access.
- [ ] Collect profile facts, bios, links, avatars, cover images, and security ownership records.
- [ ] Complete the launch-month shoot list.
- [ ] Produce and approve the first four weeks of anchor content.
- [ ] Configure UTMs and a lead/source tracking sheet or CRM.
- [ ] Publish, engage, and review weekly.
- [ ] Deliver the first monthly performance report and next-month hypotheses.

## Later opportunities

- [ ] Virtual try-on feasibility pilot.
- [ ] 360-degree spin or real glTF model for selected hero products.
- [ ] Appointment/reserve-to-try flow.
- [ ] Google Merchant/Business Profile product synchronization feasibility for Pakistan.
- [ ] Urdu or bilingual experience after content operations are proven.
- [ ] Payment and fulfillment only if the business later chooses true ecommerce.
