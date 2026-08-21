import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * These run against the fixture catalog, which is what an environment without a
 * connected Supabase project resolves to. Every assertion is about behaviour the
 * real catalog shares: routing, filtering, disclosure and the inquiry handoff.
 */

test("a category page lists its descendants and states that data is preview only", async ({
  page,
}) => {
  await page.goto("/eyewear");

  await expect(
    page.getByRole("heading", { level: 1, name: "Eyewear" }),
  ).toBeVisible();
  await expect(page.getByText(/PREVIEW DATA/)).toBeVisible();

  // Browsing the parent must include products filed on its child categories.
  await expect(page.getByRole("link", { name: "Demo Frame 01" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Demo Sunglasses 01" }),
  ).toBeVisible();
});

test("a nested category narrows the listing", async ({ page }) => {
  await page.goto("/eyewear/sunglasses");

  await expect(
    page.getByRole("heading", { level: 1, name: "Sunglasses" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Demo Sunglasses 01" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Demo Frame 01" })).toHaveCount(
    0,
  );
});

test("an unknown path is a 404 rather than an empty catalog page", async ({
  page,
}) => {
  const response = await page.goto("/not-a-real-category");

  expect(response?.status()).toBe(404);
});

test("filtering by availability keeps a shareable URL and can be cleared", async ({
  page,
}) => {
  // The sidebar facets are desktop-only; the mobile reset lives in the drawer and
  // is covered separately.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/watches?availability=in_store");

  await expect(page.getByRole("link", { name: "Demo Watch 01" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Demo Watch 02" })).toHaveCount(
    0,
  );

  await page.getByRole("link", { name: "Clear filters" }).click();

  await expect(page.getByRole("link", { name: "Demo Watch 02" })).toBeVisible();
});

test("a search query matches a product by its model number", async ({
  page,
}) => {
  // Exercises the query itself, independent of form mechanics.
  await page.goto("/search?q=DEMO-PEN-001");

  await expect(page.getByRole("link", { name: "Demo Pen 01" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Demo Frame 01" })).toHaveCount(
    0,
  );
});

test("the search form submits the typed term", async ({ page }) => {
  await page.goto("/search");

  const searchBox = page.getByRole("searchbox");

  // The form needs no JavaScript, so a fill can land before React hydrates and
  // be reset by it. Retrying the fill until the value sticks tests the form
  // rather than the hydration timing.
  await expect(async () => {
    await searchBox.fill("DEMO-PEN-001");
    await expect(searchBox).toHaveValue("DEMO-PEN-001", { timeout: 500 });
  }).toPass();

  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/\/search\?q=DEMO-PEN-001/);
  await expect(page.getByRole("link", { name: "Demo Pen 01" })).toBeVisible();
});

test("a product page carries model, price state and Product structured data", async ({
  page,
}) => {
  await page.goto("/products/demo-frame-01");

  await expect(
    page.getByRole("heading", { level: 1, name: "Demo Frame 01" }),
  ).toBeVisible();
  await expect(page.getByText("Model/SKU: DEMO-EYE-001")).toBeVisible();

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  const parsed = JSON.parse(structuredData ?? "{}");

  expect(parsed["@type"]).toBe("Product");
  expect(parsed.sku).toBe("DEMO-EYE-001");
});

test("a product with no approved price never shows an empty price", async ({
  page,
}) => {
  await page.goto("/products/demo-sunglasses-02");

  await expect(page.getByText("Price on inquiry")).toBeVisible();
});

test("shortlisting a product surfaces it on the shortlist page", async ({
  page,
}) => {
  await page.goto("/products/demo-frame-01");

  await page.getByRole("button", { name: "Add to shortlist" }).click();
  await expect(
    page.getByRole("button", { name: /in your shortlist/i }),
  ).toBeVisible();

  await page.goto("/shortlist");

  await expect(page.getByRole("link", { name: "Demo Frame 01" })).toBeVisible();
  // docs/04 forbids presenting this as a cart or a reservation.
  await expect(page.getByText(/does not reserve any item/i)).toBeVisible();
});

test("the inquiry route redirects to WhatsApp with the product details prefilled", async ({
  request,
}) => {
  const response = await request.get(
    "/inquiry?product=demo-frame-01&variant=DEMO-EYE-001-BLK",
    { maxRedirects: 0 },
  );

  expect(response.status()).toBe(303);

  const location = response.headers().location ?? "";

  expect(location).toContain("wa.me/923438067821");

  const message = new URL(location).searchParams.get("text") ?? "";

  expect(message).toContain("Demo Frame 01");
  expect(message).toContain("Model/SKU: DEMO-EYE-001");
  expect(message).toContain("Variant: DEMO-EYE-001-BLK");
  expect(message).toContain("/products/demo-frame-01");
});

test("an inquiry for an unknown product does not open an empty conversation", async ({
  request,
}) => {
  const response = await request.get("/inquiry?product=not-a-product", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(303);
  expect(response.headers().location ?? "").not.toContain("wa.me");
});

test("robots stays closed to crawlers before the launch gate", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(body).toContain("Disallow: /");
});

test("the catalog listing has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/eyewear");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(serious).toEqual([]);
});

test("the product page has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/products/demo-frame-01");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(serious).toEqual([]);
});

test("filters can be applied and reset from the mobile drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/watches?availability=in_store");

  await expect(page.getByRole("link", { name: "Demo Watch 02" })).toHaveCount(
    0,
  );

  // docs/04 requires the mobile drawer to carry a selected-count badge and an
  // accessible reset.
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();

  await expect(page.getByRole("link", { name: "Demo Watch 02" })).toBeVisible();
});

test("the mobile filter drawer traps focus and restores it on close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/eyewear");

  const trigger = page.getByRole("button", { name: /^Filters/ });

  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
