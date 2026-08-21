/**
 * A plain GET form, so search works without JavaScript and every result set has
 * a shareable URL. docs/04 indexes name, brand, SKU and model, which is what the
 * repository query covers.
 */
export function CatalogSearchForm({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  return (
    <form
      action="/search"
      className="flex flex-wrap gap-2"
      method="get"
      role="search"
    >
      <label className="sr-only" htmlFor="catalog-search">
        Search products by name, brand or model
      </label>
      <input
        autoComplete="off"
        className="min-h-12 flex-1 rounded-full border border-smoke/60 bg-white px-5 text-base"
        defaultValue={defaultValue ?? ""}
        id="catalog-search"
        maxLength={80}
        name="q"
        placeholder="Search a name, brand or model number"
        type="search"
      />
      <button
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-obsidian px-6 text-sm font-semibold text-porcelain"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
