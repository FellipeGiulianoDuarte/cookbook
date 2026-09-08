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

test("browser back walks the wizard backwards and keeps state and URL in step", async ({
  page,
}) => {
  await page.goto("/");
  const next = page.getByRole("button", { name: /^Next/ });
  await page.getByRole("button", { name: /Hario V60/ }).click();
  await next.click();
  await expect(page).toHaveURL(/step=recipe/);
  await page.getByRole("button", { name: /Ultimate V60 Technique/ }).click();
  // nuqs batches URL writes in a 50 ms window; wait for the recipe to land in the current
  // history entry before the step change pushes a new one.
  await expect(page).toHaveURL(/r=v60-hoffmann-ultimate/);
  await next.click();
  await expect(page).toHaveURL(/step=grinder/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Which grinder?",
  );

  await page.goBack();
  await expect(page).toHaveURL(/step=recipe/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Pick a recipe",
  );
  // the recipe chosen before is still selected
  await expect(
    page.getByRole("button", { name: /Ultimate V60 Technique/ }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.goBack();
  await expect(page).not.toHaveURL(/step=/);
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText(
    "Pick a recipe",
  );

  await page.goForward();
  await expect(page).toHaveURL(/step=recipe/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Pick a recipe",
  );
});
