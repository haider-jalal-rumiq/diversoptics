# Product content production guide

Status: working standard for website and social assets.

## Goal

One disciplined product intake and shoot should create everything needed for the CMS, product page, social feed, short video, stories, WhatsApp replies, and future campaigns without misrepresenting the item.

## Product intake sheet

Required before shooting/publishing:

- Category and subcategory.
- Brand, exact product name, model/SKU, barcode if relevant.
- Variant/color names and identifiers.
- Price mode/value and current availability.
- Verified dimensions, materials, lens/movement/nib/refill details as relevant.
- Included packaging/accessories.
- Warranty, exchange/return, delivery, and authenticity language with evidence.
- Supplier/manufacturer image usage rights.
- Staff explanation: who it suits, practical benefit, and honest limitation.

## Minimum web asset pack per product

1. Primary 4:5 or 1:1 clean hero.
2. 3/4 angle.
3. Side/profile.
4. Key functional/detail macro.
5. Scale/fit image: face, wrist, hand, or desk as appropriate.
6. Packaging/included items.
7. Model/SKU/marking evidence where useful and safe.
8. 6–12 second vertical motion clip.

High-value/featured items may add turntable video, 360 sequence, or real 3D model after approval.

## Category shot list

### Eyewear

- Front, 3/4, side/temple, folded, hinge, nose bridge/pads, lens tint/reflection, interior model markings, on-face front/3/4.
- Record lens width, bridge, temple length, total frame width if available.
- Do not imply UV, polarized, blue-light, or prescription properties without proof.

### Watches

- Dial straight-on, 3/4, crown/pushers, case side/thickness, clasp/strap, caseback, wrist scale, packaging.
- Record case diameter, thickness, lug-to-lug if available, movement, strap/bracelet, and verified water-resistance claim.
- Avoid setting the hands over the logo/date; classic display around 10:10 is useful when truthful to the product.

### Writing instruments

- Full profile, cap/clip, nib/tip, mechanism, refill, grip, branding/engraving, writing sample, hand scale, packaging.
- Record type, material, weight/dimensions if available, refill/nib compatibility, and engraving/gift options only if offered.

### Lens/contact-lens products

- Sealed packaging, exact product labeling, expiry/batch handling only where safe, pack contents, approved lifestyle/use visual.
- No altered label, medical claim, or usage instruction without qualified review and source.

## Visual production standard

- Use controlled, even product color and calibrated white balance.
- Clean dust, fingerprints, and smudges physically before capture; do not retouch away real manufacturing details.
- Control reflections to reveal shape/material without making glass or metal look fake.
- Keep consistent camera height and scale within a category.
- Shoot enough resolution for cropping, but export only the size needed by each channel.
- Maintain a neutral master image before applying campaign color grading.
- Photograph real store context separately from clean product packshots.

## Social formats

| Use | Canvas | Notes |
|---|---:|---|
| Instagram portrait/carousel | 1080 x 1350 | Keep critical type/product inside comfortable edge margins |
| Instagram/Facebook square | 1080 x 1080 | Secondary adaptation |
| Reel/TikTok/Story/Status | 1080 x 1920 | 9:16, protect interface safe zones, subtitles |
| Facebook link/share | 1200 x 630 | Landscape adaptation, minimal copy |
| Website product hero | Responsive source, usually 4:5 | Export AVIF/WebP delivery variants; preserve original |
| Google Business Profile | 720 x 720 minimum recommended | Truthful, well-lit, lightly processed |

## File organization

```text
assets/
├── source/
│   └── YYYY-MM-DD-shoot-name/
│       ├── raw/
│       ├── selects/
│       └── releases-and-rights/
├── web/
│   └── products/[sku]/
│       ├── [sku]-01-primary.ext
│       ├── [sku]-02-angle.ext
│       └── [sku]-alt-copy.txt
└── social/
    └── YYYY-MM/
        └── campaign-or-post-id/
            ├── source/
            ├── ig-1080x1350/
            ├── vertical-1080x1920/
            ├── captions/
            └── approved/
```

Do not move or overwrite the supplied `diverso1.jpeg` and `diverso2.jpeg` originals.

## Naming

```text
[sku]-[view]-[variant]-v01.[ext]
2026-09-launch-store-reel-v03-approved.mp4
2026-09-frame-size-carousel-slide-01-v02.png
```

Avoid `final-final2`. Increment versions and move only approved exports into `approved/`.

## Image and copy metadata

For each media item record:

- SKU/product/variant.
- Creator/source and usage rights.
- Capture date.
- Alt text.
- Crop/focal point.
- Approval status.
- Web/social usage restrictions.

Alt text describes the real product and useful view, for example:

> Black rectangular acetate sunglasses, front three-quarter view, showing gold temple detail.

Do not stuff brand keywords or say “image of.”

## Product copy template

### Name

`[Brand] [Model] [useful distinguishing attribute]`

### Short description

One sentence: most useful customer benefit plus one verified differentiator.

### Detail copy

1. Who/what context it suits.
2. Form/material/feature with verified specifics.
3. Fit/use/maintenance consideration.
4. Included items and approved policy/service note.

### Specifications

Use structured fields. Do not bury filterable data in prose.

### CTA

`Ask about [model/SKU] on WhatsApp` or `Reserve to try in F-11` only if reservation is operational.

## AI and retouching policy

Allowed:

- Background cleanup, dust removal, canvas extension, color-neutral set generation, layout mockups, subtitle/caption assistance, and campaign ideation with human review.
- AI-generated editorial scenes clearly used as campaign atmosphere when they do not imply a false store/product reality.

Not allowed:

- Changing product shape, color, lens tint, dial, logo, model marking, material, included packaging, scale, or condition.
- Generating a fake customer, testimonial, store interior, authenticity document, or product variant.
- Presenting an AI reconstruction as a real photograph without disclosure where disclosure is appropriate.

Retouching must preserve accurate product evaluation.

## Monthly content workflow

1. Export current/priority SKU list from CMS.
2. Verify facts and evidence.
3. Create shot list by content pillar and channel.
4. Batch capture; back up originals immediately.
5. Select and grade neutral masters.
6. Create web crops/metadata first, then campaign adaptations.
7. Draft captions/scripts from approved product data.
8. Factual, brand, and client approval.
9. Publish/schedule and attach campaign/UTM IDs.
10. Archive approved files and performance notes together.

