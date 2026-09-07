import { expect, test } from "@playwright/test";

test("Start brew runs the timer, Pause freezes it, Skip walks to Done", async ({
  page,
}) => {
  await page.goto(
    "/?m=aeropress&r=aeropress-hoffmann-ultimate&g=timemore-c3s-pro&d=11&step=summary",
  );
  await page.getByRole("button", { name: "Start brew" }).click();

  // untimed setup steps come first as a checklist; the clock starts on the second tap
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Get ready",
  );
  await expect(page.getByText(/Paper filter in the cap/)).toBeVisible();
  await page.getByRole("button", { name: "Start the timer" }).click();
  await expect(page.getByText(/Pour 200 g of water/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.waitForTimeout(1200);
  const clock = page.locator("span.font-display").first();
  await expect(clock).not.toHaveText("0:00");

  await page.getByRole("button", { name: "Pause" }).click();
  const frozen = await clock.textContent();
  await page.waitForTimeout(1100);
  await expect(clock).toHaveText(frozen ?? "");
  await page.getByRole("button", { name: "Resume" }).click();

  // Skip through the remaining timed steps (cap, wait, swirl, wait, press, serve → done)
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Skip step" }).click();
  }
  await expect(page.getByText("Enjoy")).toBeVisible();
  await page.getByRole("button", { name: "Brew again" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your recipe",
  );
});

test("Start brew is disabled until the selection is complete", async ({
  page,
}) => {
  await page.goto("/?m=v60&r=v60-hoffmann-ultimate&step=summary");
  // no grinder and no dose: the wizard clamps to the grinder step instead of showing Start
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Which grinder?",
  );
});
