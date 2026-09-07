import { expect, test } from "@playwright/test";

test("a shared link restores every selection and lands on the summary", async ({
  page,
}) => {
  await page.goto(
    "/?m=v60&r=v60-kasuya-46&g=1zpresso-k-ultra&d=20&roast=dark&step=summary",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your recipe",
  );
  await expect(page.getByText(/4:6/).first()).toBeVisible();
  // Kasuya dark roast → 83 °C from Philocoffea
  await expect(page.getByText("83 °C")).toBeVisible();
  // K-Ultra renders rotations.numbers.ticks
  await expect(page.getByText(/^0\.\d\.\d$/)).toBeVisible();
});

test("a link with an unknown recipe id lands on the recipe step instead of dead-ending", async ({
  page,
}) => {
  await page.goto("/?m=aeropress&r=does-not-exist&step=summary");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Pick a recipe",
  );
});

test("Back keeps the selection and updates the step in the URL", async ({
  page,
}) => {
  await page.goto(
    "/?m=v60&r=v60-hoffmann-1cup&g=comandante-c40&d=15&step=options",
  );
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What's the bean?",
  );
  await expect(page).toHaveURL(/step=bean/);
  await expect(page).toHaveURL(/g=comandante-c40/);
});

test("language toggle switches the UI to Portuguese", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "PT", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Com o que você vai preparar?",
  );
});

test("a link with a dose outside the recipe range lands on the dose step", async ({
  page,
}) => {
  // Hoffmann Ultimate is written for 20–45 g; 15 g is below the minimum
  await page.goto(
    "/?m=v60&r=v60-hoffmann-ultimate&g=comandante-c40&d=15&step=summary",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "How much coffee?",
  );
  await expect(page.getByText(/written for 20–45 g/)).toBeVisible();
});
