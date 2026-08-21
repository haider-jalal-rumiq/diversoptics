import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("anonymous visitors are redirected to the invite-only CMS login", async ({
  page,
}) => {
  await page.goto("/cms");

  await expect(page).toHaveURL(/\/cms\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(
    page.getByText("Public registration is not available."),
  ).toBeVisible();
});

test("CMS login has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/cms/login");
  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
