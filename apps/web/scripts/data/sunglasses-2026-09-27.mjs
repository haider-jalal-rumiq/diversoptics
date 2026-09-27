/**
 * Client-supplied sunglasses stock, reconciled against the artwork in
 * Diverso-Products-images/Sunglasses.
 *
 * This batch is unusual and reliable: the client supplied BOTH a branded studio
 * render (IMG_7790-IMG_7801) and the manufacturer's own catalogue cut-out whose
 * FILENAME carries the model reference. Each render was matched to its cut-out
 * by frame shape, hardware and lens tint, so every SKU below is read from the
 * client's own file naming rather than inferred from the render alone.
 *
 * The renders already carry the Diverso logo watermark; the importer uploads
 * them as-is and generates its own WebP derivative.
 *
 * No prices and no stock counts were supplied, so every product publishes as
 * `Price on inquiry` with `ask` availability, matching the earlier batches.
 *
 * NAMING: the client's filenames all read "SG ORIGNAL" (sic). That word is an
 * authenticity claim, and AGENTS.md forbids publishing "100% original" or
 * authorised-dealer claims without client-supplied proof and approval, so it is
 * deliberately absent from every product name and description here.
 *
 * ONE DISCREPANCY TO CONFIRM:
 *   - IMG_7798 was supplied as "versace 2199 125247", but the temple engraving
 *     legible in that render reads "MOD. 2150 1002/73". Recorded as VE2150-1002
 *     because the engraving is direct evidence and the filename is not. If the
 *     stock really is VE2199, correct the sku and re-run.
 */
export const sunglasses = [
  // --- Chopard ------------------------------------------------------------
  {
    brand: "chopard",
    sku: "SCH-D54-8FFZ",
    name: "Chopard Gold-Tone Pilot Sunglasses with Green Lenses",
    price: null,
    files: ["IMG_7790.PNG"],
  },

  // --- Salvatore Ferragamo ------------------------------------------------
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1012-001",
    name: "Salvatore Ferragamo Black Rectangular Sunglasses with Grey Gradient Lenses",
    price: null,
    files: ["IMG_7791.PNG"],
  },
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1042-001",
    name: "Salvatore Ferragamo Black Oversized Square Sunglasses with Gancini Temples",
    price: null,
    files: ["IMG_7792.PNG"],
  },
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1056S-001",
    name: "Salvatore Ferragamo Black Cat-Eye Sunglasses with Gancini Hinge",
    price: null,
    files: ["IMG_7793.PNG"],
  },
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1061S-001",
    name: "Salvatore Ferragamo Black Angular Cat-Eye Sunglasses with Gold Logo Temples",
    price: null,
    files: ["IMG_7794.PNG"],
  },
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1081-001",
    name: "Salvatore Ferragamo Black Pointed Butterfly Sunglasses with Grey Gradient Lenses",
    price: null,
    files: ["IMG_7795.PNG"],
  },
  {
    brand: "salvatore-ferragamo",
    sku: "SF-1082-219",
    name: "Salvatore Ferragamo Tortoiseshell Sunglasses with Green Lenses and Gancini Hardware",
    price: null,
    files: ["IMG_7796.PNG"],
  },

  // --- Versace ------------------------------------------------------------
  {
    brand: "versace",
    sku: "VE2216",
    name: "Versace Gold-Tone Metal Navigator Sunglasses with Grey Lenses",
    price: null,
    files: ["IMG_7797.PNG"],
  },
  {
    // Filename said 2199; the engraving in the render says 2150 -- see header.
    brand: "versace",
    sku: "VE2150-1002",
    name: "Versace Tortoiseshell Polarised Pilot Sunglasses with Brown Lenses",
    price: null,
    files: ["IMG_7798.PNG"],
  },
  {
    brand: "versace",
    sku: "VE2199",
    name: "Versace Black and Gold-Tone Polarised Pilot Sunglasses with Grey Lenses",
    price: null,
    files: ["IMG_7799.PNG"],
  },
  {
    brand: "versace",
    sku: "VE4361",
    name: "Versace Tortoiseshell Sculpted Sunglasses with Medusa Lens Detail",
    price: null,
    files: ["IMG_7800.PNG"],
  },
  {
    brand: "versace",
    sku: "VE4394",
    name: "Versace Tortoiseshell Square Sunglasses with Greca Gold-Tone Temples",
    price: null,
    files: ["IMG_7801.PNG"],
  },
];
