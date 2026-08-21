/**
 * A native script tag is correct here because JSON-LD is data, not executable
 * code. `<` is escaped so a CMS value containing markup cannot break out of the
 * script element, which JSON.stringify alone does not prevent.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
