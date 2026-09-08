import { expect, test } from "@playwright/test";

/* Full flow: V60, Hoffmann Ultimate, Comandante C40, 30 g, light roast → summary. */
test("V60 + Comandante flow reaches the summary with 24 clicks ±1", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What are you brewing with?",
  );
  const next = page.getByRole("button", { name: /^Next/ });
  await expect(next).toBeDisabled();

  await page.getByRole("button", { name: /Hario V60/ }).click();
  await next.click();
  await expect(page).toHaveURL(/m=v60/);

  await page.getByRole("button", { name: /Ultimate V60 Technique/ }).click();
  await next.click();
  await expect(page).toHaveURL(/r=v60-hoffmann-ultimate/);

  await page.getByPlaceholder("Search grinders").fill("comandante");
  await page.getByRole("button", { name: /Comandante C40/ }).click();
  await expect(page.getByText("24 clicks")).toBeVisible();
  await expect(page.getByText("±1")).toBeVisible();
  // The chart band drives the number; Comandante's own 18–35 is shown as the reference.
  await expect(page.getByText("community chart")).toBeVisible();
  await expect(page.getByText("Comandante's own guide: 18–35")).toBeVisible();
  await next.click();

  // Dose step starts from the recipe default and shows the water
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "How much coffee?",
  );
  await expect(page).toHaveURL(/d=30/);
  await expect(page.getByText(/^500/)).toBeVisible();
  await next.click();

  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.getByText("Water at 100 °C")).toBeVisible();
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A few more things",
  );
  await next.click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your recipe",
  );
  await expect(page.getByText("24 clicks")).toBeVisible();
  await expect(page.getByText("3:30").first()).toBeVisible();
  await expect(page.getByText(/Pour to 300 g/)).toBeVisible();
  await expect(page).toHaveURL(/step=summary/);
});

test("a starred grinder is remembered on the device and picked on the next visit", async ({
  page,
}) => {
  await page.goto("/?m=v60&r=v60-hoffmann-ultimate&step=grinder");
  await page.getByPlaceholder("Search grinders").fill("c3s");
  await page
    .getByRole("button", { name: "Save as my grinder" })
    .first()
    .click();
  await expect(page.getByText("18 clicks")).toBeHidden();
  await expect(page.getByText("13 clicks")).toBeVisible();

  // Fresh visit with no grinder in the link: the starred one is already selected.
  await page.goto("/");
  await expect(page).toHaveURL(/g=timemore-c3s-pro/);
  await page.getByRole("button", { name: /Hario V60/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await page.getByRole("button", { name: /Ultimate V60 Technique/ }).click();
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.getByText("My grinder", { exact: true })).toBeVisible();
  await expect(page.getByText("13 clicks")).toBeVisible();

  // A link that names another grinder still wins.
  await page.goto(
    "/?m=v60&r=v60-hoffmann-ultimate&g=comandante-c40&step=grinder",
  );
  await expect(page.getByText("24 clicks")).toBeVisible();
});
