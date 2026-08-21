import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const content = readFileSync(resolve(root, "src/lib/content.js"), "utf8");

test("brand copy is centralized and fictional", () => {
  assert.match(content, /VELMONT/);
  assert.match(content, /HORLOGERIE/);
  assert.doesNotMatch(content, /ÉLYSÉE|Élysée|MDX/i);
});

test("every referenced asset exists on disk", () => {
  const refs = [...content.matchAll(/"(\/assets\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length >= 18, `expected >= 18 assets, got ${refs.length}`);
  for (const ref of refs) {
    const file = resolve(root, "static", `.${ref}`);
    assert.ok(existsSync(file), `missing asset ${ref}`);
  }
});

test("self-hosted fonts exist", () => {
  const fonts = readdirSync(resolve(root, "static/fonts")).filter((f) =>
    f.endsWith(".woff2")
  );
  assert.ok(fonts.length >= 3, `expected >= 3 font files, got ${fonts.length}`);
  const css = readFileSync(resolve(root, "src/fonts.css"), "utf8");
  for (const f of ["bodonimoda-var-normal-latin", "bodonimoda-var-italic-latin", "inter-var-normal-latin"]) {
    assert.ok(css.includes(f), `fonts.css missing ${f}`);
  }
});

test("build output renders the brand when present", () => {
  const html = resolve(root, "build/index.html");
  if (!existsSync(html)) {
    // build not run yet; skip silently
    return;
  }
  const out = readFileSync(html, "utf8");
  assert.match(out, /VELMONT/i);
});
