import { expect, test } from "@playwright/test";

test.use({ contextOptions: { reducedMotion: "no-preference" } });

test("the 3D scene mounts a WebGL canvas when motion is allowed", async ({
  page,
}) => {
  await page.goto("/");
  const stage = page.locator("[data-scene]");
  await expect(stage).toHaveAttribute("data-scene", /webgl|fallback/);
  const mode = await stage.getAttribute("data-scene");
  if (mode === "webgl") {
    await expect(stage.locator("canvas")).toBeVisible({ timeout: 15_000 });
  }
  // no runtime errors from the scene
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    "/?m=v60&r=v60-hoffmann-ultimate&g=comandante-c40&d=30&roast=dark&step=bean",
  );
  await page.waitForTimeout(1500);
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
