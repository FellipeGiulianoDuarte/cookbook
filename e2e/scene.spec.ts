import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("the 3D scene mounts a WebGL canvas when motion is allowed", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (response) => {
    if (response.url().includes("/models/") && !response.ok()) {
      errors.push(
        `Model request failed: ${response.status()} ${response.url()}`,
      );
    }
  });
  await page.goto("/");
  const stage = page.locator("[data-scene]");
  await expect(stage).toHaveAttribute("data-scene", /webgl|fallback/);
  const mode = await stage.getAttribute("data-scene");
  if (mode === "webgl") {
    await expect(stage.locator("canvas")).toBeVisible({ timeout: 15_000 });
  }
  if (
    process.env.PR_MEDIA_DIR &&
    test.info().project.name === "desktop-chromium"
  ) {
    await page.waitForTimeout(1500);
    await stage.screenshot({ path: `${process.env.PR_MEDIA_DIR}/brewers.png` });
  }
  // no runtime errors from the scene
  expect(errors).toEqual([]);
  await page.goto(
    "/?m=v60&r=v60-hoffmann-ultimate&g=comandante-c40&d=30&roast=dark&step=bean",
  );
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
  await page.goto(
    "/?m=aeropress&r=aeropress-hoffmann-ultimate&g=timemore-c3s-pro&d=11&step=grinder",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Which grinder?",
  );
  if (mode === "webgl") await expect(page.locator("canvas")).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion shows the static illustration", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute(
    "data-scene",
    "fallback",
  );
  await ctx.close();
});
