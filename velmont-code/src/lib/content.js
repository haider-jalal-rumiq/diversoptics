/**
 * VELMONT Horlogerie — central brand + content configuration.
 * All copy, media paths, and motion timings live here so the fictional
 * brand can be re-skinned without touching component code.
 */

export const brand = {
  name: "VELMONT",
  descriptor: "HORLOGERIE",
  legalLine: "© 2025 VELMONT HORLOGERIE",
  socials: ["INSTAGRAM", "PINTEREST"],
  heroWord: "VELMONT",
  heroSub: "HORLOGERIE",
  heroCountLabel: "CRAFTED PRECISION",
  footerWord: "PRECISION",
  footerWordAtelier: "PRECISION",
  footerTagline:
    "Mechanical timepieces designed, assembled and regulated by hand in our Geneva atelier. Thirty-one pieces per reference, never more.",
  footerNavTitle: "EXPLORE",
  footerNav: [
    { label: "Collections", target: "collections" },
    { label: "Atelier", target: "atelier" },
    { label: "Crafted in Detail", target: "crafted" },
    { label: "Campaign", target: "campaign" }
  ],
  footerContactTitle: "ATELIER",
  footerContact: [
    "Quai du Mont-Blanc 19",
    "1201 Genève, Suisse",
    "atelier@velmont-horlogerie.ch",
    "+41 22 908 41 19"
  ],
  footerSocialsTitle: "FOLLOW",
  footerSocials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Vimeo", href: "https://vimeo.com" }
  ],
  footerNote: "Independent haute horlogerie — a fictional brand study.",
  backToTop: "BACK TO TOP"
};

export const homeHero = {
  slides: [
    {
      src: "/assets/velmont-hero-1.webp",
      alt: "Velmont steel wristwatch with silver-white dial under a top key light"
    },
    {
      src: "/assets/velmont-hero-2.webp",
      alt: "Gold Velmont case flank and crown traced by warm rim light"
    },
    {
      src: "/assets/velmont-hero-3.webp",
      alt: "Velmont steel bracelet watch resting on dark slate under a cool light stripe"
    }
  ],
  slideMs: 3600,
  rollMs: 950
};

export const collections = {
  eyebrow: "CURATED CALIBRES",
  title: "COLLECTIONS",
  items: [
    {
      index: "01",
      name: "ARGENT LINE",
      tagline: "BRUSHED STEEL, SAPPHIRE CLARITY",
      series: "Calibre M-01 · 2026",
      src: "/assets/velmont-collection-argent.webp",
      alt: "Argent Line steel watch with white dial on a light grey backdrop"
    },
    {
      index: "02",
      name: "NOIR CALIBRE",
      tagline: "DARK PVD OVER MIDNIGHT",
      series: "Calibre M-02 · 2026",
      src: "/assets/velmont-collection-noir.webp",
      alt: "Noir Calibre black PVD watch on a dark charcoal backdrop"
    },
    {
      index: "03",
      name: "GOLDEN MERIDIAN",
      tagline: "WARM GOLD, CHAMPAGNE DIAL",
      series: "Calibre M-03 · 2026",
      src: "/assets/velmont-collection-gold.webp",
      alt: "Golden Meridian yellow-gold watch on a warm beige backdrop"
    }
  ]
};

export const atelier = {
  heroWord: "ATELIER",
  statement: ["BEHIND EVERY TICK", "LIES INTENTION"],
  badge: "02",
  cardImages: [
    "/assets/velmont-atelier-2.webp",
    "/assets/velmont-atelier-3.webp",
    "/assets/velmont-atelier-5.webp"
  ],
  cardAlt: "Inside the Velmont atelier — movement craft in progress",
  hands: {
    lines: ["THE", "HANDS", "BEHIND THE", "CRAFT"],
    paragraph:
      "Our atelier brings together master watchmakers, case finishers, and dial printers who have honed their craft across decades. Each calibre passes through dozens of skilled hands before it earns the Velmont name.",
    link: "EXPLORE THE ATELIER",
    images: [
      { src: "/assets/velmont-atelier-1.webp", alt: "Hand sketching a Velmont dial study on paper" },
      { src: "/assets/velmont-atelier-2.webp", alt: "Loupe inspection of an open mechanical movement" },
      { src: "/assets/velmont-atelier-3.webp", alt: "Tweezers setting a gear into the calibre" },
      { src: "/assets/velmont-atelier-4.webp", alt: "Hand polishing of a steel watch case" },
      { src: "/assets/velmont-atelier-5.webp", alt: "Dial crafting station with blanks and indices" },
      { src: "/assets/velmont-atelier-6.webp", alt: "Hand stitching of a leather watch strap" }
    ]
  },
  banner: {
    src: "/assets/velmont-banner.webp",
    alt: "Watchmaker's bench beside a bright atelier window"
  },
  crafted: {
    eyebrow: "CRAFTED IN DETAIL",
    title: "The Art of the Calibre",
    lead: {
      src: "/assets/velmont-crafted.webp",
      alt: "Gold Velmont watch standing on a warm ivory backdrop"
    },
    detail: {
      src: "/assets/velmont-detail.webp",
      alt: "Macro study of hand-applied indices over guilloché engraving",
      title: "PRECISION SETTING",
      body: "Hand-set indices, aligned to the micron."
    },
    side: {
      title: "FROM SKETCH TO CALIBRE",
      body: "Every reference begins as a hand-drawn study before the first bridge is milled, bevelled, and finished by hand.",
      stat: "200+ HOURS PER CALIBRE"
    }
  }
};

export const campaign = {
  heroWord: "CAMPAIGN",
  exploreLabel: "EXPLORE CAMPAIGN",
  slideMs: 4600,
  items: [
    {
      index: "01",
      name: "STEEL & SHADOW",
      body: "Brushed steel meets polished bevel in a study of contrasts — matte against mirror, shadow against light.",
      src: "/assets/velmont-campaign-1.webp",
      alt: "Steel Velmont watch half-lit against deep shadow"
    },
    {
      index: "02",
      name: "GOLDEN HOUR",
      body: "Warm gold and champagne dials capture the quiet drama of dusk — light held in metal.",
      src: "/assets/velmont-campaign-2.webp",
      alt: "Gold Velmont watch glowing in warm dusk light"
    },
    {
      index: "03",
      name: "ARGENT STRUCTURE",
      body: "Sculpted cases in steel and sapphire — precision engineering, quiet strength.",
      src: "/assets/velmont-campaign-3.webp",
      alt: "Sculptural steel and sapphire Velmont case under cool light"
    }
  ]
};

export const nav = {
  collections: "COLLECTIONS",
  atelier: "ATELIER",
  campaign: "CAMPAIGN"
};

/** Shared motion tokens (seconds). */
export const motion = {
  viewRoll: 1.1,
  heroRoll: 0.95,
  reveal: 0.9,
  stagger: 0.12
};
