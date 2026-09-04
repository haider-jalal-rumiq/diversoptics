import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home preview exposes the approved core journey", async ({
  page,
}, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Find the pair that feels like yours.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Featured arrivals." }),
  ).toBeVisible();
  await expect(page.getByText("DEMO-EYE-001")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /ask on whatsapp/i }).first(),
  ).toHaveAttribute("href", /wa\.me\/923438067821/);
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("home-preview.png"),
  });
});

test("home preview has no automatically detectable serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const seriousViolations = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? ""),
  );

  expect(seriousViolations).toEqual([]);
});

test("desktop mega-navigation exposes the requested catalog hierarchy", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const sunglassesTrigger = page
    .getByRole("link", { exact: true, name: "Sunglasses" })
    .first();
  await sunglassesTrigger.focus();

  const sunglassesMenu = page.getByRole("navigation", {
    name: "Sunglasses menu",
  });
  await expect(sunglassesMenu).toBeVisible();
  await expect(
    sunglassesMenu.getByRole("link", { exact: true, name: "Chopard" }),
  ).toHaveAttribute("href", /brand=chopard/);
  await expect(
    sunglassesMenu.getByRole("link", { exact: true, name: "Louis Vuitton" }),
  ).toHaveAttribute("href", /brand=louis-vuitton/);
  await page.screenshot({
    path: testInfo.outputPath("desktop-mega-menu-preview.png"),
  });
});

test("fixture product detail remains clearly fictional", async ({ page }) => {
  await page.goto("/preview/products/demo-frame-01");

  await expect(
    page.getByRole("heading", { level: 1, name: "Demo Frame 01" }),
  ).toBeVisible();
  await expect(
    page.getByText("FICTIONAL FIXTURE · NOT REAL INVENTORY"),
  ).toBeVisible();
  // The fixture now carries a placeholder amount, so the page shows a price
  // rather than the inquiry fallback. en-PK localises PKR as "Rs".
  await expect(page.getByText(/Rs\s?18,500/)).toBeVisible();
});

test("mobile reduced-motion navigation remains complete and contained", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Browse Diverso" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { exact: true, name: "Sunglasses" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { exact: true, name: "Chopard" }),
  ).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Watches" }).click();
  await expect(
    page.getByRole("link", { exact: true, name: "G-Shock" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ask on WhatsApp" }).last(),
  ).toHaveAttribute("href", /wa\.me\/923438067821/);

  const hasPageOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasPageOverflow).toBe(false);
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("mobile-menu-preview.png"),
  });
});
