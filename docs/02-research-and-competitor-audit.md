# Research and competitor audit

Research date: 2026-08-20  
Status: discovery input, not a substitute for usability testing or client facts.

## Executive finding

The local market already provides large product grids, brand filters, discounts, carts, and generic premium language. Diverso can be more useful and memorable by combining three things competitors rarely balance well:

1. Editorial product desire and restrained visual storytelling.
2. Specific trust and local service evidence.
3. A catalog-to-concierge flow designed around WhatsApp rather than a conventional checkout.

The strategic benchmark is not “more animated than competitors.” It is “more confident, easier to choose from, and easier to act on.”

## Supplied competitors

### 1. LifeStyle Collection

Source: [lifestyle-collection.com.pk](https://www.lifestyle-collection.com.pk/)

Observed structure:

- Watches, eyewear, and accessories with branded/model-specific product listings.
- Strong reliance on sale prices and new-arrival/featured grids.
- Category-led homepage sections for watches and eyewear.
- Location and contact entry points; traditional cart behavior remains visible.
- Captured visual system: Futura-led typography, primarily black/white UI, small radii, and several competing accent colors from plugins/widgets.

What works:

- Assortment and prices are immediately visible.
- Recognizable brand/model names support search intent.
- Long-standing retail language can create familiarity.

Opportunity for Diverso:

- Use fewer competing promotions and clearer hierarchy.
- Explain why a product is worth considering instead of relying on strike-through prices.
- Replace cart noise with a purpose-built shortlist and WhatsApp handoff.
- Put verified authenticity, service, store, and policy evidence next to the product decision.

### 2. Optic World Pakistan

Source: [opticworld.pk](https://opticworld.pk/)

Observed structure:

- Deep eyewear taxonomy spanning men, women, kids, accessories, brands, and store locator.
- Free-shipping announcement and conventional ecommerce mechanics.
- Large geographic/currency selector and a broad menu surface.
- Homepage product cards expose availability and wishlist state; multiple visible items were out of stock during retrieval.
- Captured visual system: Instrument Sans body, Barlow headings, purple/gold/cream accents, rounded search input.

What works:

- Category depth and store-locator support.
- Product availability and wishlist concepts are explicit.
- More distinctive color/type pairing than many local stores.

Opportunity for Diverso:

- Reduce header and mega-menu cognitive load.
- Hide irrelevant international/currency controls for a Pakistan-first launch.
- Make in-stock/available-to-order meanings precise.
- Prefer a small set of useful filters over exposing the entire database taxonomy at once.

### 3. Shop with Optica

Source: [shopoptica.com](https://shopoptica.com/)

Observed structure:

- Heritage message (“since 1986”), men/women collections, designer and non-branded divisions, accessories, and cart.
- Strong shape taxonomy: hexagon, rectangular, round, square, clubmaster, wayfarer, rimless, supra, and aviator.
- Long, product-dense pages with repeated card patterns and high-value designer products.
- Captured visual system: Poppins, teal/gold accents, compact 14 px body type, traditional ecommerce layout.

What works:

- Shape-based navigation maps to real eyewear shopping behavior.
- Heritage and clear designer/non-branded separation can support trust and budget decisions.
- Product/model naming is search friendly.

Opportunity for Diverso:

- Preserve shape/fit discovery but avoid an oversized menu.
- Give typography more breathing room, especially on mobile.
- Use curated collections and progressive disclosure to prevent a long wall of products.
- Make WhatsApp consultation a designed experience, not a floating afterthought.

## Additional local/Pakistan benchmarks

| Benchmark | Useful pattern | Caution / gap to avoid |
|---|---|---|
| [Akbar Optic Gallery](https://www.akbaroptic.store/) | Islamabad-specific delivery/service copy, categories, FAQs, and store location | Heavy discount language and broad unverified superlatives can weaken premium trust |
| [Eye Shop Optician](https://eyeshopoptic.com/Home/) | Virtual try-on claim, Google review proof, store details, and service benefits | Advanced features must be real and reliable; placeholder or broken local details are worse than omitting them |
| [Axor Classic](https://axorclassic.com/) | Editorial luxury pacing, craftsmanship stories, product benefits, and visible WhatsApp path | Luxury language becomes generic when every section claims exclusivity without differentiated evidence |
| [Next Level Optics](https://nextlevel-optics.com/) | Local consultation and in-store fit emphasized over anonymous ecommerce | Long SEO copy should not dominate the customer journey |
| [Ainak Mahal](https://ainakmahal.com.pk/) | Heritage, brand breadth, style categories, policies | Catalog density and conflicting price/brand signals require careful governance |

Competitor claims were recorded as page content and were not independently verified.

## International experience references

### Gentle Monster

[Gentle Monster Stories](https://www.gentlemonster.com/us/en/stories) treats campaigns, collaborations, stores, and products as one cultural system. It demonstrates that immersive storytelling works best as a distinct editorial layer; the main shop navigation remains legible.

Lesson for Diverso: use one memorable campaign/3D scene to introduce a collection, then hand the user to a fast catalog. Do not turn every page into an experiment.

### Ray-Ban virtual try-on

[Ray-Ban virtual try-on](https://www.ray-ban.com/japan/virtual-try-on) demonstrates the value of seeing frames in context. A reliable try-on feature is a later opportunity for Diverso, not an MVP promise. It requires face tracking, privacy review, device testing, and accurate frame assets.

## Experience opportunity map

| Market pattern | Diverso response |
|---|---|
| Large, noisy mega menus | Task-based navigation plus progressive filters |
| Cart/checkout conventions even when human help is needed | `Ask on WhatsApp`, `Reserve to try`, and a multi-item shortlist |
| Generic “premium/original” claims | Specific, verified evidence and clear policies |
| Sale-first merchandising | Product story, fit, material, use case, and staff curation first |
| Homepages made of repeated product grids | Editorial hero, category portals, selected products, expertise, and store proof |
| Local store details buried in the footer | Dedicated F-11 store module on home, product, and store pages |
| Heavy animation as decoration | Motion tied to reveal, material, orientation, or navigation feedback |
| Social posts disconnected from the catalog | Every approved product receives a reusable web/social content pack |

## Recommended website principles

1. **Concierge commerce:** the site prepares a better human conversation.
2. **Trust near intent:** show evidence where the customer decides, not only on an About page.
3. **Mobile thumb path:** search, filters, product details, shortlist, and WhatsApp must work comfortably one-handed.
4. **Editorial front, structured back:** expressive campaigns are powered by disciplined CMS data.
5. **Progressive spectacle:** static content is complete; motion/3D enhances it after load.
6. **Local proof:** F-11 location, real store photography, hours, reviews, and staff are conversion content.

## 3D, motion, accessibility, and performance guidance

- Core Web Vitals measure loading, responsiveness, and stability. Use the current “good” thresholds as acceptance targets: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. [web.dev Core Web Vitals](https://web.dev/articles/optimize-cwv-business)
- Layout-triggering animations can damage stability and perceived performance; prefer compositor-friendly `transform` and `opacity`. [web.dev CSS and Web Vitals](https://web.dev/articles/css-web-vitals)
- Interaction-triggered motion must be suppressible for people who enable reduced motion. Provide CSS/JavaScript `prefers-reduced-motion` handling and static equivalents. [W3C WCAG animation guidance](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- A WebGL hero must load after semantic content and its poster, use a capped device-pixel ratio, pause offscreen, and avoid continuous render when nothing changes.
- Product grids use optimized still imagery. A 360 spin or glTF viewer is allowed only for selected products with proper source assets and a measurable customer benefit.
- Never make scroll hijacking, a custom cursor, or a long intro sequence necessary to access products.

## Search and local discovery guidance

- Because the MVP cannot complete a purchase, product pages should primarily use Google’s product-snippet model, with accurate price/availability only when the CMS can maintain them. [Google Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- Use `LocalBusiness`, `Organization`, `BreadcrumbList`, and relevant `Product` data, and validate it rather than assuming eligibility. [Google ecommerce structured data](https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce)
- A verified Google Business Profile is a parallel storefront for location, hours, photos, reviews, and posts. [Google Business Profile](https://support.google.com/business/answer/16394780)
- Google recommends accurate, well-lit, minimally altered exterior, interior, staff-at-work, and product photos. [Business Profile photo guidance](https://support.google.com/business/answer/6123536)

## Social guidance used

- Meta supports full-screen 9:16 creative for Reels; safe zones and platform-native pacing should be designed from the start. [Meta Reels guidance](https://www.facebook.com/business/ads/facebook-instagram-reels-ads)
- TikTok’s business guidance emphasizes vertical full-screen video, audio, clear calls to action, product-led and story-led formats, and creative diversity. [TikTok creative guidance](https://ads.tiktok.com/business/en/blog/tiktok-short-video-best-practice)
- Platform posting times and frequency are not treated as universal facts. The launch calendar uses Pakistan-time hypotheses that must be replaced by account Insights after four weeks.

## Research trace and limitations

Successfully retrieved:

- The three supplied competitor homepages and current page structure.
- Additional local/Pakistan benchmark pages.
- Live branding extraction and full-page screenshot URLs for the three supplied competitors.
- Official Google, W3C, web.dev, Next.js, Supabase, Meta, TikTok, WhatsApp, and Google Business Profile guidance.

Limitations:

- The in-app visual browser failed because of a local permission error. Full-page captures were retrieved through the connected page-capture service, but remote screenshot pixels could not be rendered inside the local inspection tool. Visual-system values and page structure are verified; fine-grained composition judgments require a second visual pass before Figma.
- Checkout, search quality, filters, mobile breakpoints, accessibility tree, and logged-in behavior were not task-tested.
- No field research, customer interviews, sales data, analytics, or client inventory data has been provided.
- Search results and competitor claims can change. Recheck major benchmark screens at the start of high-fidelity Figma work.

