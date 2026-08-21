# Project operating instructions

## Approval model

- The project owner may prepare recommendations and drafts.
- The client approves business facts, claims, policies, brand direction, final copy, real product data, and publishing.
- Figma approval is a hard gate before production frontend implementation.
- Content should be reviewed in batches to reduce approval delays: brand, UX, product seed set, launch campaign, then monthly calendar.

## Source-of-truth hierarchy

1. Client-approved written facts and inventory export.
2. Approved brand guidelines and Figma components.
3. CMS data.
4. These planning documents.
5. Temporary placeholders and design exploration.

If two sources conflict, do not guess. Record the conflict in `docs/10-decisions-and-client-inputs.md`.

## Product publishing checklist

A product cannot be marked `published` until it has:

- Approved category and brand.
- Product name, model/SKU, slug, and availability status.
- Accurate price or an explicit `price on inquiry` state.
- At least one clean primary image plus meaningful alt text.
- Relevant specifications and selectable variants.
- Confirmed warranty/return/authenticity language or no claim.
- A tested WhatsApp message and canonical URL.
- Search title and description generated from approved facts.

## Social publishing checklist

- Product and price match current approved inventory.
- Product visual is faithful to the real item.
- Caption follows the selected voice and includes one clear CTA.
- Medical, authenticity, discount, scarcity, and warranty claims have proof.
- Correct platform aspect ratio, safe zones, subtitles, and cover frame are present.
- Links contain consistent UTM tags where supported.
- Client approval is recorded before scheduling.

## Change discipline

- Record major choices in the decision log.
- Keep strategy stable for one measurement cycle unless a legal, factual, or severe usability issue requires immediate correction.
- Change one major variable per content experiment when practical: hook, format, CTA, or visual style.
- Preserve raw assets and export non-destructively.

