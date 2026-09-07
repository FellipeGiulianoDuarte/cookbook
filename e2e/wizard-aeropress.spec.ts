import { expect, test } from "@playwright/test";

/* AeroPress, Hoffmann, Kingrinder K6, inverted override. */
test("AeroPress + Kingrinder K6 shows the official 65-click point and the inverted option", async ({
  page,
}) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: /^Next/ });

  await page.getByRole("button", { name: /AeroPress/ }).click();
  await next.click();
  await page
    .getByRole("button", { name: /Ultimate AeroPress Technique/ })
    .click();
  await next.click();

  await page.getByPlaceholder("Search grinders").fill("k6");
  await page.getByRole("button", { name: /Kingrinder K6/ }).click();
  // Kingrinder publishes a single point for AeroPress (65); the app must not divide microns by 16 µm.
  await expect(page.getByText("65 clicks")).toBeVisible();
  await next.click();

  await expect(page).toHaveURL(/d=11/);
  await next.click();
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A few more things",
  );
  await page.getByRole("button", { name: "Inverted" }).click();
  await expect(page).toHaveURL(/orient=inverted/);
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your recipe",
  );
  await expect(
    page.getByText(/Press gently for about 30 seconds/),
  ).toBeVisible();
});
