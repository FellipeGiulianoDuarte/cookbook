import { expect, test } from "@playwright/test";

test("home renders the title and tokens", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Brew it",
  );
  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});
