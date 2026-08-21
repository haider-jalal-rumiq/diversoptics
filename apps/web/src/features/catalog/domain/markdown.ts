/**
 * A deliberately small Markdown subset for CMS guide and policy bodies.
 *
 * It parses to a token tree that React renders as elements, so no HTML string is
 * ever produced and `dangerouslySetInnerHTML` is not needed. Editor-authored
 * content therefore cannot inject markup, which a general-purpose Markdown
 * pipeline would have to be configured carefully to prevent.
 *
 * Anything outside the subset is kept as literal text rather than dropped, so a
 * page never silently loses content it was given.
 */

export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "emphasis"; value: string }
  | { kind: "link"; href: string; value: string };

export type BlockToken =
  | { kind: "heading"; level: 2 | 3; inline: readonly InlineToken[] }
  | { kind: "paragraph"; inline: readonly InlineToken[] }
  | {
      kind: "list";
      ordered: boolean;
      items: readonly (readonly InlineToken[])[];
    };

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/g;

/**
 * Only http(s), mailto and site-relative targets are allowed. A `javascript:`
 * or `data:` URL is rendered as plain text instead of becoming a link.
 */
function safeHref(href: string): string | null {
  const trimmed = href.trim();

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;

  try {
    const url = new URL(trimmed);

    return ["http:", "https:", "mailto:"].includes(url.protocol)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function parseInline(source: string): readonly InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(INLINE_PATTERN)) {
    const index = match.index;

    if (index > lastIndex) {
      tokens.push({ kind: "text", value: source.slice(lastIndex, index) });
    }

    const [raw] = match;

    if (raw.startsWith("**")) {
      tokens.push({ kind: "strong", value: raw.slice(2, -2) });
    } else if (raw.startsWith("*")) {
      tokens.push({ kind: "emphasis", value: raw.slice(1, -1) });
    } else {
      const separator = raw.indexOf("](");
      const label = raw.slice(1, separator);
      const href = safeHref(raw.slice(separator + 2, -1));

      tokens.push(
        href
          ? { href, kind: "link", value: label }
          : { kind: "text", value: raw },
      );
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < source.length) {
    tokens.push({ kind: "text", value: source.slice(lastIndex) });
  }

  return tokens;
}

export function parseMarkdown(source: string): readonly BlockToken[] {
  const blocks: BlockToken[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  let paragraph: string[] = [];
  let list: { items: string[]; ordered: boolean } | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;

    blocks.push({
      inline: parseInline(paragraph.join(" ").trim()),
      kind: "paragraph",
    });
    paragraph = [];
  }

  function flushList() {
    if (!list || list.items.length === 0) {
      list = null;

      return;
    }

    blocks.push({
      items: list.items.map((item) => parseInline(item)),
      kind: "list",
      ordered: list.ordered,
    });
    list = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();

      continue;
    }

    const heading = /^(#{2,3})\s+(.*)$/.exec(trimmed);

    if (heading?.[1] && heading[2]) {
      flushParagraph();
      flushList();
      blocks.push({
        inline: parseInline(heading[2]),
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
      });

      continue;
    }

    const unordered = /^[-*]\s+(.*)$/.exec(trimmed);
    const ordered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    const item = unordered?.[1] ?? ordered?.[1];

    if (item !== undefined) {
      flushParagraph();

      const isOrdered = unordered === null;

      // A change of list style starts a new list rather than mixing markers.
      if (list && list.ordered !== isOrdered) flushList();

      list ??= { items: [], ordered: isOrdered };
      list.items.push(item);

      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks;
}
