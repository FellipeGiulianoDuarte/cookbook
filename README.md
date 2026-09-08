# Cookbook

Brewing guide for Hario V60 and AeroPress. Pick a method, a recipe, your grinder, the dose and the bean; the app gives the exact recipe, the setting for your grinder, and a timer that talks you through the brew. English and Portuguese.

Every recipe number and every grinder band carries a source URL. See `/sources` in the app and `docs/research/`.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm check      # biome + tsc + vitest
pnpm e2e        # playwright (starts the dev server; wizard specs run in reduced motion)
```

`/debug` lists every recipe at three doses and every grinder at the launch bands with the source behind each number.

## How it is built

- **Data** (`data/`): JSON validated by Zod (`lib/schema.ts`) at build time. Recipe steps store water as a rule (times the dose, share of the total, or grams) so scaling is data, not code. Grinders store the maker's official band per brew method plus community bands, notation, zero procedure and tolerance.
- **Engine** (`lib/engine/`): `buildSchedule` (times and cumulative grams), `gridToSetting` (interpolates inside the grinder's band; never divides microns by "microns per click", which is burr travel), `adjustForBean` (roast tables, community process nudges kept separate), `extraction` (mass balance and the SCA chart only).
- **State**: one XState machine for the wizard, one per brew for the timer (pause keeps the remaining time). Selections mirror into the URL with nuqs so a recipe is a shareable link.
- **3D**: React Three Fiber with procedural models (V60, AeroPress, kettle, grinder, beans). Static illustration under `prefers-reduced-motion` or without WebGL.
- **Stack**: Next.js 16 (App Router), React 19, TypeScript 7, Tailwind 4, next-intl, Motion, three.js, drei. Deployed on Vercel at https://duartes-cookbook.vercel.app; every push to `main` goes live, and CI then runs the Playwright suite against the live site.

## Add a grinder or a recipe

Add one JSON file under `data/grinders/` or `data/recipes/<method>/`. Copy an existing file for the shape. Every number needs a `source` with `url` and `kind` (`primary`, `transcription` or `community`). Run `pnpm vitest run`: the data tests validate the schema, monotone bands, both languages, and the schedule.

## Plan and research

`docs/plan.html` is the implementation plan (phases, architecture, decisions). `docs/research/` holds the sourced research the data was entered from.
