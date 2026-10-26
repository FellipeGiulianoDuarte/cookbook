import { expect, test } from "@playwright/test";

/* Hario Switch: method, Kasuya's Devil Recipe, Comandante, the valve steps on the summary. */
test("Hario Switch + Kasuya Devil Recipe reaches a summary with the valve steps", async ({
  page,
}) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: /^Next/ });

  await page.getByRole("button", { name: /Hario Switch/ }).click();
  await next.click();
  await expect(
    page.getByRole("button", { name: /^Devil Recipe/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Gong Fu/ })).toBeVisible();
  await page.getByRole("button", { name: /^Devil Recipe/ }).click();
  await next.click();

  await page.getByPlaceholder("Search grinders").fill("comandante");
  await page.getByRole("button", { name: /Comandante C40/ }).click();
  // Switch reads the V60 band; Kasuya sits at its fine edge
  await expect(page.getByText("22 clicks")).toBeVisible();
  await next.click();

  await expect(page).toHaveURL(/d=20/);
  await expect(page.getByText("280", { exact: true })).toBeVisible();
  await next.click();
  await next.click();
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Devil Recipe",
  );
  await expect(
    page.getByText(/Close the valve\. Pour 160 g at 70 °C to reach 280 g/),
  ).toBeVisible();
  await expect(page.getByText("Open the valve and let it drain")).toBeVisible();
});
