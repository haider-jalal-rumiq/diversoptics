import { describe, expect, it } from "vitest";

import { parseInline, parseMarkdown } from "./markdown";

describe("inline parsing", () => {
  it("reads bold, italic and links", () => {
    expect(parseInline("plain **bold** and *italic*")).toEqual([
      { kind: "text", value: "plain " },
      { kind: "strong", value: "bold" },
      { kind: "text", value: " and " },
      { kind: "emphasis", value: "italic" },
    ]);
  });

  it("keeps site-relative and http links", () => {
    expect(parseInline("[store](/store)")).toEqual([
      { href: "/store", kind: "link", value: "store" },
    ]);
    expect(parseInline("[docs](https://example.test/a)")).toEqual([
      { href: "https://example.test/a", kind: "link", value: "docs" },
    ]);
  });

  it("refuses a script URL and keeps it as visible text", () => {
    // A dangerous target must not become a link, and must not vanish either —
    // an editor should be able to see what they wrote. How the leftover text is
    // split into tokens does not matter, only that no link is produced.
    for (const source of [
      "[tap](javascript:alert(1))",
      "[x](data:text/html,<script>)",
      "[y](vbscript:msgbox)",
    ]) {
      const tokens = parseInline(source);

      expect(tokens.every((token) => token.kind === "text")).toBe(true);
      expect(tokens.map((token) => token.value).join("")).toBe(source);
    }
  });

  it("treats raw markup as literal text", () => {
    // Nothing is rendered as HTML, so a tag survives as characters.
    expect(parseInline("<script>alert(1)</script>")).toEqual([
      { kind: "text", value: "<script>alert(1)</script>" },
    ]);
  });
});

describe("block parsing", () => {
  it("reads headings at two levels", () => {
    const blocks = parseMarkdown("## Two\n\n### Three");

    expect(blocks).toEqual([
      { inline: [{ kind: "text", value: "Two" }], kind: "heading", level: 2 },
      { inline: [{ kind: "text", value: "Three" }], kind: "heading", level: 3 },
    ]);
  });

  it("joins wrapped lines into one paragraph", () => {
    const blocks = parseMarkdown("first line\nsecond line\n\nnext");

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      inline: [{ kind: "text", value: "first line second line" }],
      kind: "paragraph",
    });
  });

  it("reads both list styles and does not merge them", () => {
    const blocks = parseMarkdown("- one\n- two\n1. first\n2. second");

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ kind: "list", ordered: false });
    expect(blocks[1]).toMatchObject({ kind: "list", ordered: true });
  });

  it("handles carriage returns and trailing blank lines", () => {
    expect(parseMarkdown("## Title\r\n\r\nBody\r\n")).toEqual([
      { inline: [{ kind: "text", value: "Title" }], kind: "heading", level: 2 },
      { inline: [{ kind: "text", value: "Body" }], kind: "paragraph" },
    ]);
  });

  it("returns nothing for empty content", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("   \n\n  ")).toEqual([]);
  });
});
