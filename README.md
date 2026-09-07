# Cookbook

Brewing guide for Hario V60 and AeroPress. Pick a method, a recipe, your grinder, the dose and the bean; the app gives the exact recipe, the setting for your grinder, and a timer that talks you through the brew.

Every recipe number and every grinder band carries a source URL. See `data/` and the Sources page.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm check      # biome + tsc + vitest
pnpm e2e        # playwright (starts the dev server)
```

## Stack

Next.js 16 (App Router), React 19, TypeScript 7, Tailwind 4, XState 5, nuqs, next-intl, Zod, React Three Fiber, GSAP, Motion. Deployed on Vercel.

## Add a grinder or a recipe

Add one JSON file under `data/grinders/` or `data/recipes/<method>/`. The Zod schema in `lib/schema.ts` validates it at build time and the `/debug` page lists it with its computed values. Every number needs a `source` with `url` and `kind` (`primary`, `transcription` or `community`).

## Plan

The full plan (phases, data research, architecture) lives at `plans/brew-v2.html` in the author's workspace; a copy is checked in as `docs/plan.html`.
