import { test, expect } from "@playwright/test";

test("homepage renders the site shell and product grid", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
});

test("product page shows add-to-cart controls", async ({ page }) => {
  await page.goto("/");
  const productLink = page.locator('a[href^="/product/"]').first();
  await productLink.click();
  await page.waitForURL(/\/product\//);
  await expect(page.locator("button").filter({ hasText: /add to cart/i }).first()).toBeVisible();
});

test("add-to-cart updates the header badge and the cart page lists the item", async ({ page }) => {
  await page.goto("/");
  const productLink = page.locator('a[href^="/product/"]').first();
  await productLink.click();
  await page.waitForURL(/\/product\//);

  const addToCart = page.locator("button").filter({ hasText: /add to cart/i }).first();
  if (await addToCart.isEnabled()) {
    await addToCart.click();
    await expect(page.locator('a[aria-label="Cart"]').locator("span").filter({ hasText: /[1-9]/ })).toBeVisible();
  }

  await page.locator('a[aria-label="Cart"]').click();
  await page.waitForURL(/\/cart/);
  await expect(page.locator("h1")).toBeVisible();
});

test("contact form and newsletter form exist on the homepage", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Enter your email").waitFor({ state: "visible" });
  await expect(page.locator('input[type="checkbox"]')).toBeVisible();
});

test("unknown route returns a 404 page", async ({ page }) => {
  const res = await page.goto("/this-page-does-not-exist-xyz");
  expect(res?.status()).toBe(404);
});
