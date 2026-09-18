/**
 * Client-supplied watch stock, reconciled against the artwork in
 * Diverso-Products-images/Watches.
 *
 * Unlike the Montblanc batches, the renders carry NO caption panel: no model
 * number, no price, no caseback. Every SKU here comes from the client's own
 * stock list, matched to artwork by brand, case metal, dial colour and strap.
 * Where the artwork alone identifies the reference (G-Shock silhouettes, the
 * Casio VD/X300 families, AR1908, AX1327, AX1611) the match is exact. The
 * Michael Kors references are the client's assignment, not an artwork reading.
 *
 * No prices and no stock counts were supplied, so every product publishes as
 * `Price on inquiry` with `ask` availability, matching the cufflinks batch.
 *
 * `brand` selects which import pass picks the product up; import-watches.mjs
 * runs one pass per brand because runImport() takes a single brandSlug.
 *
 * TWO SKUs WERE ASSIGNED TWICE IN watches-catalog.csv. The importer throws on a
 * duplicate SKU, so both are resolved here against the client's own list, which
 * still had these references unused. CONFIRM BEFORE RUNNING WITH --apply:
 *   - IMG_7535 (rose gold Ritz chrono) was a second "MK 6438"; MK 6438 is used
 *     by IMG_7530 (gold Parker chrono). Set to MK 6356 -- the rose gold Ritz.
 *   - IMG_7748 (women's rose gold MOP T-Bar) was a second "AR11011"; AR11011 is
 *     the men's Kappa on IMG_7755. Set to AR11335 -- the only unused Armani ref.
 *
 * ONE SKU IS STILL UNVERIFIED:
 *   - IMG_7587 carries a resin strap, but the client's list says AMW710D and
 *     the "D" suffix means a steel bracelet. Recorded as AMW-870-1A, which
 *     matches the artwork. If the stock really is AMW-710D, the photo is wrong.
 */
export const watches = [
  // --- Michael Kors -------------------------------------------------------
  {
    brand: "michael-kors",
    sku: "MK 8354",
    name: "Michael Kors Cruiser Blue Dial Stainless Steel Chronograph Watch",
    price: null,
    files: ["IMG_7509.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 6238",
    name: "Michael Kors Parker Gold-Tone and Navy Acetate Chronograph Watch",
    price: null,
    files: ["IMG_7515.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 6564",
    name: "Michael Kors Gold-Tone Blush Acetate Mother-of-Pearl Watch",
    price: null,
    files: ["IMG_7524.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 5688",
    name: "Michael Kors Parker Gold-Tone and Tortoise Acetate Chronograph Watch",
    price: null,
    files: ["IMG_7525.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 3431",
    name: "Michael Kors Darci Rose Gold-Tone Pave Bezel Watch",
    price: null,
    files: ["IMG_7526.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 5799",
    name: "Michael Kors Bradshaw Rose Gold-Tone Chronograph Watch",
    price: null,
    files: ["IMG_7527.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 3726",
    name: "Michael Kors Darci Celestial Two-Tone Star Dial Watch",
    price: null,
    files: ["IMG_7528.PNG"],
  },
  // HELD BACK -- IMG_7530 (gold-tone Parker pave chronograph) has no SKU.
  // The client confirmed MK 6438 belongs to IMG_7535, so this watch needs its
  // own reference. Unused Michael Kors refs from the client stock list:
  // MK 5354, MK 3191, MK 6356, MK 5632, MK 5798, MK 3408, MK 3445.
  // MK 5354 is the likeliest match (gold Parker chronograph). Restore this
  // entry once confirmed, then re-run the importer -- it upserts, so the
  // already-published watches are untouched.
  // {
  //   brand: "michael-kors",
  //   sku: "MK ????",
  //   name: "Michael Kors Parker Gold-Tone Pave Chronograph Watch",
  //   price: null,
  //   files: ["IMG_7530.PNG"],
  // },
  {
    brand: "michael-kors",
    sku: "MK 5706",
    name: "Michael Kors Runway Gold-Tone Oversized Pave Logo Watch",
    price: null,
    files: ["IMG_7531.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 6555",
    name: "Michael Kors Gold-Tone Pave Logo Dial Watch",
    price: null,
    files: ["IMG_7532.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 3444",
    name: "Michael Kors Darci Gold-Tone Magenta Dial Watch",
    price: null,
    files: ["IMG_7533.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 3190",
    name: "Michael Kors Darci Stainless Steel Silver Dial Watch",
    price: null,
    files: ["IMG_7534.PNG"],
  },
  {
    // Client confirmed 2026-09-18: this rose gold Ritz is MK 6438.
    brand: "michael-kors",
    sku: "MK 6438",
    name: "Michael Kors Ritz Rose Gold-Tone Pave Chronograph Watch",
    price: null,
    files: ["IMG_7535.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 6683",
    name: "Michael Kors Black-Tone Studded Logo Dial Watch",
    price: null,
    files: ["IMG_7536.PNG"],
  },
  {
    brand: "michael-kors",
    sku: "MK 5626",
    name: "Michael Kors Parker Two-Tone Pave Chronograph Watch",
    price: null,
    files: ["IMG_7537.PNG"],
  },

  // --- Casio --------------------------------------------------------------
  {
    brand: "casio",
    sku: "MTP-V004L-1B",
    name: "Casio Enticer Black Dial Leather Strap Watch",
    price: null,
    files: ["IMG_7574.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-1370L-7A",
    name: "Casio Enticer Day-Date White Dial Leather Strap Watch",
    price: null,
    files: ["IMG_7575.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-1335D-2A2",
    name: "Casio Enticer Blue Dial Stainless Steel Day-Date Watch",
    price: null,
    files: ["IMG_7576.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-VT01GL-2B2",
    name: "Casio Minimalist Gold-Tone Blue Dial Leather Strap Watch",
    price: null,
    files: ["IMG_7577.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-1308L-1A",
    name: "Casio Enticer Black Dial Fluted Bezel Leather Strap Watch",
    price: null,
    files: ["IMG_7578.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-1374L-1A",
    name: "Casio Enticer Multifunction Black Dial Leather Strap Watch",
    price: null,
    files: ["IMG_7579.PNG"],
  },
  {
    brand: "casio",
    sku: "WSC-1250H-1AV",
    name: "Casio Fishing Gear Black Resin Moon Phase Watch",
    price: null,
    files: ["IMG_7580.PNG"],
  },
  {
    brand: "casio",
    sku: "WSC-1250H-2AV",
    name: "Casio Fishing Gear Navy Resin Moon Phase Watch",
    price: null,
    files: ["IMG_7581.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-C309L-3AVDF",
    name: "Casio Enticer Green Dial Black-Tone Stainless Steel Watch",
    price: null,
    files: ["IMG_7582.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-VD01BL-5B",
    name: "Casio Enticer Burgundy Dial Black-Tone Leather Strap Watch",
    price: null,
    files: ["IMG_7583.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-V004G-9E",
    name: "Casio Enticer Gold-Tone Champagne Dial Watch",
    price: null,
    files: ["IMG_7585.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-VD01G-9E",
    name: "Casio Enticer Gold-Tone Luminous Marker Watch",
    price: null,
    files: ["IMG_7586.PNG"],
  },
  {
    // Unverified -- see header note.
    brand: "casio",
    sku: "AMW-870-1A",
    name: "Casio Analogue-Digital Black Dial Resin Strap Watch",
    price: null,
    files: ["IMG_7587.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-X300D-7AV",
    name: "Casio Enticer Multifunction White Dial Stainless Steel Watch",
    price: null,
    files: ["IMG_7588.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-VD300D-2E",
    name: "Casio Enticer Blue Dial Stainless Steel Multifunction Watch",
    price: null,
    files: ["IMG_7589.PNG"],
  },
  {
    brand: "casio",
    sku: "MTP-1314L-7AV",
    name: "Casio Enticer White Dial Brown Leather Strap Watch",
    price: null,
    files: ["IMG_7590.PNG"],
  },

  // --- Casio Edifice ------------------------------------------------------
  {
    // One product, seven angles of the same watch.
    brand: "casio-edifice",
    sku: "EFV-530D-1AV",
    name: "Casio Edifice Carbon-Fibre Dial Stainless Steel Chronograph Watch",
    price: null,
    files: [
      "IMG_7602.PNG",
      "IMG_7603.PNG",
      "IMG_7604.PNG",
      "IMG_7605.PNG",
      "IMG_7606.PNG",
      "IMG_7607.PNG",
      "IMG_7608.PNG",
    ],
  },
  // The nine Edifice references below arrived 2026-09-18 as IMG_7766-IMG_7775,
  // one render each, in the same order as the client's Edifice stock list.
  // IMG_7766 is deliberately absent: it is another shot of EFV-530D-1AV, which
  // already has the seven angles above.
  {
    brand: "casio-edifice",
    sku: "ERA-600DB-1AV",
    name: "Casio Edifice Blue Bezel Analogue-Digital Bluetooth Watch",
    price: null,
    files: ["IMG_7767.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "ECB-20DC-1A",
    name: "Casio Edifice Bluetooth Blue Dial Stainless Steel Watch",
    price: null,
    files: ["IMG_7768.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EFV-510D-1AV",
    name: "Casio Edifice Black Dial Stainless Steel Chronograph Watch",
    price: null,
    files: ["IMG_7769.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EFR-559DB-1AV",
    name: "Casio Edifice Black Bezel Red Accent Chronograph Watch",
    price: null,
    files: ["IMG_7770.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EFV-530D-7AV",
    name: "Casio Edifice White Carbon-Fibre Dial Chronograph Watch",
    price: null,
    files: ["IMG_7771.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EFR-552B-1A2V",
    name: "Casio Edifice Blue Bezel Black Dial Chronograph Watch",
    price: null,
    files: ["IMG_7772.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "ERA-110-1AV",
    name: "Casio Edifice Analogue-Digital Countdown Timer Steel Watch",
    price: null,
    files: ["IMG_7773.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EF-32AD-1A5",
    name: "Casio Edifice Rose Gold-Tone Bezel Tachymeter Chronograph Watch",
    price: null,
    files: ["IMG_7774.PNG"],
  },
  {
    brand: "casio-edifice",
    sku: "EFV-540D-1AV",
    name: "Casio Edifice Black Dial Tachymeter Bezel Chronograph Watch",
    price: null,
    files: ["IMG_7775.PNG"],
  },

  // --- G-Shock ------------------------------------------------------------
  {
    brand: "g-shock",
    sku: "GW-B5600-2",
    name: "Casio G-Shock Origin Tough Solar Bluetooth Blue Bezel Watch",
    price: null,
    files: ["IMG_7709.PNG"],
  },
  {
    brand: "g-shock",
    sku: "G-5600UE-1",
    name: "Casio G-Shock Origin Tough Solar Black Square Watch",
    price: null,
    files: ["IMG_7710.PNG"],
  },
  {
    brand: "g-shock",
    sku: "GA-700SK-1A",
    name: "Casio G-Shock Skeleton Transparent Resin Analogue-Digital Watch",
    price: null,
    files: ["IMG_7711.PNG"],
  },
  {
    brand: "g-shock",
    sku: "GA-2100-1A1",
    name: "Casio G-Shock Carbon Core Octagonal Matte Black Watch",
    price: null,
    files: ["IMG_7712.PNG"],
  },
  {
    brand: "g-shock",
    sku: "GD-010-1A",
    name: "Casio G-Shock Black Resin Digital 10-Year Battery Watch",
    price: null,
    files: ["IMG_7713.PNG"],
  },

  // --- Armani (Emporio Armani + Armani Exchange) --------------------------
  {
    brand: "armani",
    sku: "AR1908",
    name: "Emporio Armani Gianni T-Bar Steel Mother-of-Pearl Watch",
    price: null,
    files: ["IMG_7745.PNG"],
  },
  {
    brand: "armani",
    sku: "AR11220",
    name: "Emporio Armani Rose Gold-Tone Navy Striped Dial Watch",
    price: null,
    files: ["IMG_7746.PNG"],
  },
  {
    brand: "armani",
    sku: "AR11245",
    name: "Emporio Armani Gianni T-Bar Rose Gold-Tone Peacock Dial Watch",
    price: null,
    files: ["IMG_7747.PNG"],
  },
  {
    // Was a duplicate "AR11011" in the CSV -- see header note.
    brand: "armani",
    sku: "AR11335",
    name: "Emporio Armani Gianni T-Bar Rose Gold-Tone Mother-of-Pearl Watch",
    price: null,
    files: ["IMG_7748.PNG"],
  },
  {
    brand: "armani",
    sku: "AR11355",
    name: "Emporio Armani Rosa Rose Gold-Tone Pave Bezel Watch",
    price: null,
    files: ["IMG_7749.PNG"],
  },
  {
    brand: "armani",
    sku: "AR60031",
    name: "Emporio Armani Meccanico Automatic Rose Gold-Tone Skeleton Watch",
    price: null,
    files: ["IMG_7750.PNG"],
  },
  {
    brand: "armani",
    sku: "AR11145",
    name: "Emporio Armani Blue Dial Small-Seconds Leather Strap Watch",
    price: null,
    files: ["IMG_7751.PNG"],
  },
  {
    brand: "armani",
    sku: "AX1327",
    name: "Armani Exchange Outerbanks Blue Silicone Chronograph Watch",
    price: null,
    files: ["IMG_7752.PNG"],
  },
  {
    brand: "armani",
    sku: "AR1924",
    name: "Emporio Armani Meccanico Automatic Skeleton Eagle Dial Watch",
    price: null,
    files: ["IMG_7753.PNG"],
  },
  {
    brand: "armani",
    sku: "AX1611",
    name: "Armani Exchange Drexler Tachymeter Leather Chronograph Watch",
    price: null,
    files: ["IMG_7754.PNG"],
  },
  {
    brand: "armani",
    sku: "AR11011",
    name: "Emporio Armani Kappa Rose Gold-Tone Brown Leather Watch",
    price: null,
    files: ["IMG_7755.PNG"],
  },

  // --- Seiko --------------------------------------------------------------
  {
    brand: "seiko",
    sku: "SUR307P1",
    name: "Seiko Essentials White Dial Stainless Steel Watch",
    price: null,
    files: ["IMG_7756.PNG"],
  },
  {
    brand: "seiko",
    sku: "SNKE63J1",
    name: "Seiko 5 Automatic Black Dial Stainless Steel Watch",
    price: null,
    files: ["IMG_7757.PNG"],
  },
  {
    brand: "seiko",
    sku: "SSB239P1",
    name: "Seiko Chronograph White Dial Tachymeter Stainless Steel Watch",
    price: null,
    files: ["IMG_7758.PNG"],
  },
  {
    brand: "seiko",
    sku: "SSB257P1",
    name: "Seiko Chronograph Black Dial Blue Accent Stainless Steel Watch",
    price: null,
    files: ["IMG_7759.PNG"],
  },
];
