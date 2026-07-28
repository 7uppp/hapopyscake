import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("shows core storefront sections and product entry points", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", {
        name: /sign up today and get a free cookie/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /our paw-some cake collection/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /order 3d head cupcake/i })).toHaveAttribute(
      "href",
      "/order/head-cupcake",
    );
    await expect(page.getByRole("link", { name: /order cookies/i })).toHaveAttribute(
      "href",
      "/order/themed-cookie",
    );
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens product menu and closes when tapping outside", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /toggle mobile menu/i }).click();
    await expect(page.getByRole("link", { name: /^home/i })).toBeVisible();

    await page.getByRole("button", { name: /shop cakes/i }).click();
    await expect(page.getByRole("link", { name: /^3d head cupcake$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^cookies$/i })).toBeVisible();

    await page.mouse.click(12, 360);
    await expect(page.getByRole("link", { name: /^3d head cupcake$/i })).toBeHidden();
  });
});

test.describe("product and cart flow", () => {
  test("customises a head cupcake, adds it to cart, and stubs checkout redirect", async ({
    page,
  }) => {
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkoutUrl: "http://localhost:3000/success?session_id=cs_e2e_stub",
        }),
      });
    });

    await page.goto("/order/head-cupcake");
    await expect(page.getByRole("heading", { name: /3d head cupcake/i })).toBeVisible();
    await expect(page.getByText(/please upload a clear, front-facing photo/i)).toBeVisible();

    await page.locator("select").nth(1).selectOption("Custom");
    await expect(page.getByPlaceholder(/custom colours/i)).toBeVisible();
    await page.getByPlaceholder(/custom colours/i).fill("Blue and cream");
    await page.locator('input[type="text"]').nth(1).fill("Mochi");
    await page.locator('input[type="text"]').nth(2).fill("1");
    await page.locator('input[name="pickupDate"]').fill("2099-01-08T10:30");
    await page.locator('textarea[name="notes"]').fill("No allergies.");
    await page.getByRole("button", { name: /add to cart/i }).click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole("heading", { name: /3d head cupcake/i })).toBeVisible();
    await expect(page.getByText(/blue and cream/i)).toBeVisible();

    await page.locator('input[name="customerName"]').fill("Test Customer");
    await page.locator('input[name="email"]').fill("customer@example.com");
    await page.locator('input[name="phone"]').fill("0472707510");
    await page.getByRole("button", { name: /^checkout$/i }).click();

    await page.waitForURL(/\/success\?session_id=cs_e2e_stub$/);
  });

  test("opens larger product example preview", async ({ page }) => {
    await page.goto("/order/head-cake");

    await page.getByRole("button", { name: /view larger/i }).click();
    await expect(
      page.getByRole("dialog", { name: /product example preview/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /close product example preview/i }).click();
    await expect(
      page.getByRole("dialog", { name: /product example preview/i }),
    ).toBeHidden();
  });
});

test.describe("content pages", () => {
  test("shows gallery images and contact form", async ({ page }) => {
    await page.goto("/gallery");
    await expect(page.getByRole("heading", { name: /happy paws gallery/i })).toBeVisible();
    await expect(page.getByRole("img").first()).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /need a little help/i })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /send enquiry/i })).toBeVisible();
  });
});
