import { expect, test } from "@playwright/test";

/* AeroPress, Hoffmann, Kingrinder K6, inverted override. */
test("AeroPress + Kingrinder K6 shows 64 clicks from the chart, the maker's 65-click point as reference, and the inverted option", async ({
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
  // Hoffmann's AeroPress grind sits at 0.35 of the Kingrinder AeroPress chart (38–113): 64.
  // Kingrinder's single published point (65) is shown as the maker's reference. The app must
  // never divide microns by the 16 µm-per-click travel figure.
  await expect(page.getByText("64 clicks")).toBeVisible();
  await expect(page.getByText("Kingrinder's own guide: 65")).toBeVisible();
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
