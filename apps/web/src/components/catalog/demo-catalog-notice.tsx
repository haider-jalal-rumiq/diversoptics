/**
 * AGENTS.md requires every unconfirmed value to be clearly labelled. When the
 * active catalog is fixture data, this states it plainly at the top of the page
 * so nothing on screen can be mistaken for real inventory, pricing or stock.
 */
export function DemoCatalogNotice({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <p
      className="rounded-lg border border-signal-red/40 bg-white px-4 py-3 text-xs font-semibold tracking-[0.04em] text-signal-red"
      role="note"
    >
      PREVIEW DATA · These products, models and prices are fictional
      placeholders and do not reflect real Diverso Optics inventory.
    </p>
  );
}
