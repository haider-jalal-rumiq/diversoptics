# Website UX and content specification

Status: proposed MVP. Brand styling remains pending; UX can be reviewed in low fidelity first.

## Experience thesis

Diverso is a curated digital showroom that helps a customer identify, compare, and ask about the right product. It should feel more considered than a marketplace and more useful than a brochure.

The conversion model is:

`Discover -> Understand -> Trust -> Shortlist -> Ask on WhatsApp / Visit F-11`

## Primary navigation

### Desktop

- New & Featured
- Eyewear
  - Optical Frames
  - Sunglasses
  - Lens Options / Services
  - Contact Lenses, only if confirmed as a retail category
  - Shop by Brand
  - Shop by Shape / Fit
- Watches
- Writing Instruments
- Brands
- Guides
- F-11 Store
- Search
- Shortlist

### Mobile

- Logo/home
- Search
- Shortlist
- Menu
- Sticky contextual `Ask on WhatsApp` on product pages

Keep the first mobile menu level limited to the main shopping tasks. Reveal brand, shape, gender/fit, and service taxonomies inside category pages rather than placing the entire database in the menu.

## Sitemap

```text
/
├── /new-and-featured
├── /eyewear
│   ├── /eyewear/optical-frames
│   ├── /eyewear/sunglasses
│   ├── /eyewear/lenses
│   └── /eyewear/contact-lenses       [only if confirmed]
├── /watches
├── /writing-instruments
├── /brands
│   └── /brands/[brand]
├── /collections/[collection]
├── /products/[slug]
├── /guides
│   └── /guides/[slug]
├── /shortlist
├── /store
├── /about
├── /contact
├── /policies/[slug]
└── /admin                         [authenticated]
```

## Core journeys

### Model seeker

1. Search brand/model/SKU.
2. Open product page.
3. Confirm model, variant, price/price-on-inquiry, availability, and evidence.
4. Ask on WhatsApp with product data prefilled.

### Style browser

1. Enter a category or curated collection.
2. Filter by brand, shape/style, color, fit/gender, budget, and availability as relevant.
3. Add 2–4 products to Shortlist.
4. Compare visually and send one WhatsApp inquiry containing the shortlist.

### Lens/service customer

1. Open lens guide or service page.
2. Understand options in plain language, with professional review and disclaimer.
3. Send prescription/need questions on WhatsApp or plan a store visit.

### Local visitor

1. See F-11 proof on home, search result, or product page.
2. Open store page.
3. Check verified hours, exterior/landmark, map, phone, and services.
4. Tap directions, call, or WhatsApp.

## Page specifications

### Homepage

1. Compact announcement only for real, current information.
2. Header with navigation, search, and shortlist.
3. Editorial hero:
   - One message.
   - One primary CTA and one secondary CTA.
   - Semantic product/category content is visible before any 3D enhancement loads.
4. Category portals for Eyewear, Watches, and Writing Instruments.
5. Selected collection or new arrivals, maximum 4–8 items.
6. “Why Diverso” proof: confirmed product/service/authenticity/policy evidence.
7. Expert guide module: frame/shape, lens, watch, or pen education.
8. F-11 store module with real image, verified details, directions and WhatsApp.
9. Real reviews or no review module.
10. Social/editorial preview and footer.

Avoid stacking multiple full product grids. The homepage should create desire and route intent.

### Category/collection page

- Clear title, short useful introduction, and optional campaign media.
- Search result count and applied filters.
- Filters relevant to the category only.
- Sort: featured, newest, price low/high when price is complete.
- Product card with real image, brand, model, short attribute, price state, availability state, quick shortlist.
- Mobile filter drawer with selected-count indicator and an accessible reset.
- Pagination or stable “Load more”; do not use an endless feed that loses footer/navigation access.
- Helpful zero-state suggestions and visible data-error state.

### Brand page

- Approved brand logo/name usage.
- Short, sourced brand summary; do not copy manufacturer marketing text.
- Available categories and current products.
- Authenticity/source/service proof only if documented.
- Related guide or collection.

### Product detail page

Above the fold:

- Image gallery with stable aspect ratio, zoom, alt text, and thumbnails.
- Brand, product name, model/SKU.
- Price or `Price on inquiry`—never an empty/zero price.
- Availability with precise meaning: `In store`, `Available to order`, `Out of stock`, or `Ask for status`.
- Variant selection where needed.
- Primary `Ask on WhatsApp` and secondary `Add to shortlist` / `Reserve to try` if operationally supported.
- One or two evidence chips: verified policy, warranty, fitting, packaging—not a wall of badges.

Below the fold:

- Why it stands out in plain language.
- Structured specifications by category.
- Fit/size information.
- Authenticity, warranty, return/exchange, and delivery information as confirmed.
- Store/service support.
- Optional 360/3D viewer for approved assets with still-image fallback.
- Related products and recently viewed products.
- Sticky mobile CTA that does not cover content or browser controls.

### Shortlist

- No account required; store initially in local browser storage.
- 1–6 products recommended, with variant and notes.
- Remove/reorder items and select which items to send.
- `Ask about shortlist` creates one readable WhatsApp message.
- Explain that availability and final price are confirmed by the store.
- Do not call it a cart or imply reservation/payment unless the store supports that operation.

### F-11 store page

- Exact verified business name, shop number/address, map pin, phone, WhatsApp, hours, and holidays.
- Exterior approach and storefront image, plus landmark/parking guidance if supplied.
- Services available at this location.
- Real review source and link.
- Directions, call, and WhatsApp actions.
- LocalBusiness structured data matching visible facts.

### Guides

Launch candidates:

- How frame size is measured.
- Choosing a frame shape without rigid face-shape rules.
- Lens options explained; reviewed by a qualified professional.
- Understanding UV/polarized claims; reviewed and sourced.
- Watch size and movement basics.
- Choosing a pen as a personal item or gift.
- How to verify a product and what Diverso can prove.

Guides support SEO, social carousels/reels, staff consultation, and trust. They must not become keyword-stuffed filler.

### Admin CMS

Core screens:

- Dashboard: drafts, incomplete products, recent changes, media warnings.
- Products: list, search, filters, bulk status/category/availability actions.
- Product editor: identity, merchandising, variants/specs, media, policies, SEO, preview.
- Brands and categories.
- Collections and homepage merchandising.
- Guides/pages and global store/contact settings.
- Inquiry event summary or analytics link.

The editor should use plain business language and show missing required fields before publish.

## WhatsApp handoff

Use the official click-to-chat URL pattern and an encoded message. The CMS stores the destination number in global settings; it is never hard-coded into components.

### Single product message

```text
Hello Diverso Optics — I’m interested in:

[Brand] [Product name]
Model/SKU: [SKU]
Variant: [selected variant or “not selected”]
Price shown: [price or “price on inquiry”]
Link: [canonical product URL]

Please confirm current availability and final price.
Ref: [short inquiry ID]
```

### Shortlist message

```text
Hello Diverso Optics — I’d like help comparing these items:

1. [Brand] [Product] — [SKU] — [variant] — [URL]
2. [Brand] [Product] — [SKU] — [variant] — [URL]

My preference/budget: [optional note]
Please confirm availability and guide me.
Ref: [short inquiry ID]
```

The link click should first create a minimal first-party inquiry event and then redirect immediately to WhatsApp. Never capture prescription or sensitive conversation text in analytics.

## Search and filters

Search indexes approved name, brand, SKU/model, category, tags, and a limited synonym list. Typo tolerance is useful but can wait until catalog size proves the need.

Suggested filters:

| Category | Filters |
|---|---|
| Optical/sunglasses | Brand, shape, frame color, material, fit/gender, size, lens color/type, price, availability |
| Lenses/contact lenses | Brand, type, replacement schedule/use, power availability only if modeled safely, price, availability |
| Watches | Brand, movement, case size, strap material, dial color, water resistance claim if verified, price, availability |
| Writing instruments | Brand, type, material, color, refill/nib, price, availability |

Do not show a filter until enough products use it consistently.

## 3D and motion placement

### Approved candidates

- One homepage/collection hero using an optimized product model or abstract orbit/lens object.
- One product viewer for a small featured set with real source assets.
- Subtle image parallax, material light sweep, category aperture transition, and card feedback.

### Not approved for MVP

- WebGL on every product card.
- Scroll-jacked page navigation.
- Mandatory loading intro.
- Custom cursor on touch/mobile or as the only interaction feedback.
- Fake 3D generated from inaccurate product geometry.

### Fallback hierarchy

`Real glTF/360 asset -> real turntable video -> multi-angle still gallery -> primary still image`

Every layer must preserve product truth and the CTA.

## Responsive and accessibility acceptance

- Design and test at 360, 390/393, 768, 1024, 1280, and 1440 px reference widths; components remain fluid between them.
- Minimum body size 16 px; labels/captions 14 px minimum for functional content.
- Touch targets at least 44 x 44 CSS px where practical.
- Keyboard access for navigation, filters, gallery, shortlist, dialogs, and WhatsApp CTA.
- Visible focus states and logical heading/order.
- Text contrast meets WCAG AA; information never relies on color alone.
- Product images have meaningful alt text; decorative/editorial media can use empty alt where appropriate.
- Motion respects reduced-motion preferences and provides no-loss static states.
- Modal/filter drawers trap focus correctly and restore it on close.
- Error, empty, loading, offline, out-of-stock, and long-title states are designed in Figma.

## MVP usability tasks

1. Find an available Ray-Ban model under a given budget, or explain accurately that the data is not available.
2. Compare two sunglasses and send both to WhatsApp.
3. Find the F-11 shop and current hours.
4. Understand whether a listed item is in store, available to order, or out of stock.
5. Add a new product with three images and publish it in the CMS without developer help.

Target: at least 4 of 5 representative users complete each customer task without assistance; the owner completes the CMS task with no critical error.

