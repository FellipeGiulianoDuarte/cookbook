# Hand grinders: Timemore, Comandante, Kingrinder, Hario (fetched 2026-09-07)

## Finding that affects the whole app

Manufacturer "µm per click" numbers are **axial burr travel**, not median particle size, and they are not comparable across brands:

- Comandante: 30 µm/click. Official V60 range 18–35 clicks → 540–1050 µm axial. This roughly matches typical pour-over particle sizes (600–900 µm).
- Kingrinder K6: 16 µm/click. Official pour-over setting is 100 clicks → 1600 µm axial, official espresso 40 clicks → 640 µm axial. Those are 2× a sensible particle size, so `target_µm / 16` would put every user far too fine.

So use a per-grinder anchor table (brew method → click range) and interpolate between anchors.

---

## Timemore Chestnut C3S Pro (owner's grinder) — fact check

| Site claim (C3S Pro) | Verdict | Corrected / supported value | Evidence |
|---|---|---|---|
| 83 µm per click | Confirmed, with a wording fix | 0.083 mm = 83 µm per click, listed by Timemore for the S2C660 grinders (C3 / Slim 3 / G3 / C3 Pro). It is burr travel (thread pitch), not particle size. | Timemore KB "How many microns per clicks?" https://www.timemore.cn/en/index.php?c=show&id=28 ; Basic Barista https://thebasicbarista.com/en-us/blogs/article/timemore-c3-grind-size-chart |
| 12 clicks per full turn | Confirmed | 12 clicks per rotation; roughly 36 clicks total from closed to fully open. "36 grind settings" in marketing is the total. | Brew Coffee Home https://www.brewcoffeehome.com/timemore-c3-review/ ; Eight Ounce Coffee https://eightouncecoffee.com/blogs/news/a-guide-to-the-timemore-c3-hand-grinder-collection ; coffee-guide.jp https://coffee-guide.jp/en/gear/timemore-chestnut-c3-vs-c3s-comparison |
| 38 mm S2C660 stainless burrs | Confirmed | 38 mm S2C 660 conical, stainless (SUS420), HRC 55–58. Not S2C 860 (that is the 42 mm Chestnut X burr). | Timemore KB; Someware https://goingsomeware.com/products/timemore-spike-2-cut-burr-set-s2c-660-stainless-steel ; Kofio https://www.kofio.co/coffee-equipment/timemore-chestnut-c3s-pro-hand-grinder-black/13574 |
| V60 = 11–18 clicks | Confirmed as the Honest Coffee Guide range | HCG: 11–18. Reviewers cluster 12–16. | HCG; The Coffee Locator https://thecoffeelocator.com/grinders/timemore-chestnut-c3-review/ V60 = 12; Brew Coffee Home pour-over 13–16; Craft Coffee Spot https://craftcoffeespot.com/grinder/timemore-c3-review/ pour-over 13–16 |
| Espresso 5–10 | Partly wrong | Timemore says never grind 1–6 clicks. Reviewers find one workable setting around 7–9. Publish 7–10 with the "do not grind below 6" warning. | Timemore KB "Why would the burrs contact?" https://www.timemore.cn/en/index.php?c=show&id=1 ; Coffee Chronicler https://www.coffeechronicler.com/timemore-c3-review/ (7 chokes, 8 works, 9 too fast); Home Coffee Expert https://homecoffeeexpert.com/timemore-c3-review/ |
| Moka 10–13 | Wrong | HCG: 10–17. Reviewers 9–11 (Craft Coffee Spot), 11–14 (BrewMark), 11–16 (coffeemaster). | HCG, BrewMark https://brewmark.io/grinders/timemore-c3s |
| Chemex 18–24 | Unsourced | HCG has no Chemex row; Pour Over row is 11–24. Reviewers: 14 (Coffee Locator), 19–20 (coffeemaster), 22–24 (BrewMark). 18–22 is closer to the reviewer centre. | |
| French press 19–25 | Confirmed as the HCG range | Timemore's own printed guide caps French press at 20; reviewers 17–20, 18–24, 24–27. | HCG, Home Coffee Expert, Craft Coffee Spot |

### Clicks per rotation and click resolution, by Timemore model

| Model | Burr | Clicks / rotation | Total clicks | Per click (burr travel) | Source |
|---|---|---|---|---|---|
| C2 / C2S | 38 mm "standard" CNC conical (pre-S2C) | 12 | ~36 | Timemore lists 0.08 mm for the older standard-burr grinders | Timemore KB; coffeemaster C2 https://coffeemaster.app/guides/timemore-c2-grind-settings (12 clicks/turn) |
| C3 / C3 Pro | 38 mm S2C660 | 12 | ~36 | 0.083 mm = 83 µm | Timemore KB, Brew Coffee Home |
| C3S / C3S Pro / C3S Max | 38 mm S2C660 | 12 | ~36 | 83 µm | Brew Coffee Home; Basic Barista https://thebasicbarista.com/en-us/blogs/reviews/timemore-c3s-vs-c3-grinder |
| C3 ESP / C3 ESP Pro | 38 mm S2C660 (same burr) | 30 (10 numbers × 3 clicks) | ~90 over 3 rotations | 0.0233 mm ≈ 23 µm | 9barbenchmark https://www.9barbenchmark.com/grinders/c3-esp-pro-review ; Coffeegeek https://coffeegeek.co/equipment/coffee-grinders/manual-grinders/test-timemore-c3-esp-pro ; iCup manual excerpt https://icup.vn/product/timemore-c3esp-manual-coffee-grinder-23-micromet-fine-adjustment-for-espresso/?lang=en |
| Chestnut X | 42 mm S2C860, 440 stainless, HRC 58.5–60 | Macro dial 24 absolute positions + micro dial 5 steps | 120 | Macro 0.08 mm = 80 µm; micro 0.015 mm = 15 µm | Timemore KB; The Coffee Folk https://thecoffeefolk.com/timemore-chestnut-x/ ; Brew Coffee Home X review https://www.brewcoffeehome.com/timemore-chestnut-x-review/ |

### Zero point and safety (Timemore)

- Manual: START POINT = turn the adjustment dial clockwise until it cannot move further; count clicks from there. Manual warning: "do not grind coffee beans at the finest settings (0-6 clicks / 0-0.4 circles)".
- Timemore KB: "never grind between 1-6 clicks" ( https://www.timemore.cn/en/index.php?c=show&id=1 ).
- HCG: "Avoid using settings below 6 clicks, as these settings may dull the burrs."

### Official Timemore recommended ranges (second-hand quotes of the printed dial guide)
- Espresso 7–8, pour-over 13–16, French press 17–20 (Brew Coffee Home); "espresso begins at seven clicks … 20 clicks are the coarsest setting Timemore recommends for French press" (Home Coffee Expert).
- C3 ESP (official, in rotations): espresso 0.6–1.0 or 0.8–1.1, pour-over 1.4–2.0, French press 2.0–2.3 (Brew Coffee Home, 9barbenchmark); retailer copy of manual: espresso 0.7–0.9, filter 1.1–1.5, French press 1.7–2.0 (iCup).
- "Pro" = foldable handle only. Burrs, thread, clicks unchanged.

### Honest Coffee Guide charts (Timemore)

C3S Pro, C3S, C3 and C3 Pro pages carry identical numbers (range 0–950 µm, avoid below 6 clicks): https://honestcoffeeguide.com/timemore-c3s-pro-grind-settings/ . Other pages: https://honestcoffeeguide.com/timemore-c2-grind-settings/ (0–950 µm), https://honestcoffeeguide.com/timemore-c3-esp-pro-grind-settings/ (0–1009 µm, rotations.number.tick), https://honestcoffeeguide.com/timemore-chestnut-x-grind-settings/ (80–980 µm, avoid below 3).

| Method | C3S Pro / C3S / C3 (clicks) | C2 (clicks) | C3 ESP Pro (rot.num.tick) | Chestnut X (macro dial) |
|---|---|---|---|---|
| Turkish | 2–5 | 2–6 | 0.1.1–0.6.1 | 0–3.6 |
| Espresso | 5–10 | 6–12 | 0.5.2–1.1.0 | 2.8–8 |
| Filter coffee machine | 8–23 | 10–28 | 0.9.0–2.6.2 | 6–21.8 |
| AeroPress | 9–25 | 11–30 | 0.9.2–2.8.1 | 6.4–23.4 |
| Moka pot | 10–17 | 12–20 | 1.1.0–1.9.1 | 7.6–15.4 |
| Siphon | 10–21 | 12–25 | 1.1.1–2.3.2 | 8–19.2 |
| V60 | 11–18 | 13–22 | 1.2.0–2.0.2 | 8.6–16.4 |
| Pour over | 11–24 | 13–29 | 1.2.1–2.7.1 | 8.8–22.6 |
| Cupping | 13–22 | 15–26 | 1.4.0–2.5.0 | 10.2–20.4 |
| French press | 19–25 | 22–30 | 2.0.2–3.0.0 | 16.4–24 |
| Cold brew | 22–25 | 26–30 | 2.4.0–3.0.0 | 19.2–24 |

(C3 ESP Pro rot.num.tick: 30 clicks per rotation, 3 clicks per number; e.g. 1.2.0 = 30 + 6 = 36 clicks.)

### Reviewer ranges (C3-family, 12-click ring)

| Source | Espresso | Moka | AeroPress | V60 / pour-over | Chemex | French press |
|---|---|---|---|---|---|---|
| Brew Coffee Home | 7–8 | — | — | 13–16 | — | 17–20 |
| Craft Coffee Spot | 8 only | 9–11 | 9–11 | 13–16 | — | 18–24 |
| The Coffee Locator | 5–8 | — | 10 | V60 12; drip 13–15 | 14 | 17–20 |
| BrewMark C3S | 8–11 | 11–14 | 14–18 | 18–21 | 22–24 | 24–27 |
| Coffee Grinder Guide C3 Pro https://coffeegrinderguide.com/timemore-c3-pro/ | 8–10 | — | 14–16 (20–22 inverted) | 18–20 | — | 28–30 |
| beeancoffee https://beeancoffee.com/timemore-c3-grind-settings/ | — | — | 13–17 | — | — | — |

Consensus: V60 12–18 (centre 14–16); AeroPress 10–17; espresso a single setting near 8; French press 18–25. coffeemaster.app's C3S Pro page is low-trust (describes a numbered dial and titanium burrs the grinder does not have).

---

## Comandante C40 MK4 (and MK3)

| Field | Value | Source |
|---|---|---|
| Type | Hand, stepped | — |
| Burr | 39 mm conical, high-nitrogen martensitic stainless ("Nitro Blade") | https://thecoffeefolk.com/comandante-c40/ , https://www.brewcoffeehome.com/comandante-coffee-grinder-review/ |
| Clicks per full rotation | 12 (Red Clix: 24) | same |
| µm per click | 30 µm standard, 15 µm Red Clix. Not stated on comandantegrinder.com; retailer copy only. | https://prima-coffee.com/equipment/comandante/1960-coman-sp , https://roguewavecoffee.ca/products/comandante-red-clix |
| Total usable range | ~35–40 clicks; HCG charts to 40 | https://honestcoffeeguide.com/comandante-c40-mk4-grind-settings/ |
| Zero procedure (official) | Hold grinder horizontally; with burrs open the handle falls to 6 o'clock. Tighten gradually; "click zero is the first available setting where the handle no longer falls". Count clicks counter-clockwise from there. | https://www.comandantegrinder.com/pages/faq |
| MK3 vs MK4 | Same burrs, same click mechanism; MK4 polymer jar adds static so some users go 1–2 clicks finer. | https://www.coffeedesk.com/blog/comparison-of-comandante-mk3-and-the-latest-mk4-grinders/ |
| Unit variance | GrindDial: "±2 clicks from zero (Red Clix)", i.e. ±1 standard click. | https://grinddial.com/grinders/comandante-c40-mk4-nitro-blade |

Click ranges (standard axle, clicks from zero):

| Method | Official (Comandante FAQ) | Honest Coffee Guide (MK4) | Coffee Chronicler (MK3) | Coffeedesk |
|---|---|---|---|---|
| Turkish/ibrik | 3–8 | 2–8 | — | — |
| Espresso | 7–13 | 7–13 | 9–12 | 10–15 |
| Moka | 14–20 | 14–24 | 12–15 | 16–21 |
| AeroPress | "depends on recipe" | 12–35 | 14–24 | 10–15 / 20–22 / 24–28 (by style) |
| V60 | 18–35 (all pour over) | 15–25 | 20–32 (pour over) | 23–32 |
| Chemex | (inside 18–35) | 16–34 (pour over) | — | 40–45 |
| French press | 25–35 | 26–40 | 30–34 | 27–32 |
| Cold brew | — | 30–40 | — | — |

Red Clix (double every standard click; HCG chart https://honestcoffeeguide.com/comandante-c40-mk4-with-red-clix-grind-settings/ ): Turkish 3–16, espresso 14–27, moka 27–48, AeroPress 24–70, V60 30–51, pour over 31–68, French press 51–80, cold brew 59–80.

---

## Kingrinder K6

| Field | Value | Source |
|---|---|---|
| Type | Hand, stepped, external adjustment nut with numbered dial (0–50 by tens) + rotation indicators 1–4 | Official manual PDF https://uploads.strikinglycdn.com/files/ee29f87e-528d-40eb-9e1d-3ac54583a9dd/KINGrinder+K6-EN.pdf |
| Burr | 48 mm heptagonal stainless conical | https://www.9barbenchmark.com/grinders/kingrinder-k6-review |
| Clicks per rotation | 60 | official manual; https://www.kingrinder.com/exterior-adjustment |
| µm per click | 16 µm (official) | https://www.kingrinder.com/exterior-adjustment |
| Total range | 4 rotations = 240 clicks | 9barbenchmark |
| Zero (official) | "turn the adjustment nut clockwise until it stops at the number 0 for the final time… The number 0 is the correct zero point. There is no need to tighten it with force." Then rotate counter-clockwise to the click count. | official manual |
| Safety | "Do not rotate the handle when the grind setting is at 0 or below 15 clicks" | official manual |
| Dial caveat | "the number on the adjustment nut may not be the same as the number of clicks" — count clicks | https://www.kingrinder.com/blog/gs-exterior |

Click ranges (clicks from zero):

| Method | Official manual | HCG (clicks) | 9barbenchmark | wearethemouth |
|---|---|---|---|---|
| Turkish | 20 | 5–26 | — | — |
| Espresso | 40 | 22–45 | 30–35 | 35–50 |
| Moka | 65 (shared row with AeroPress) | 43–78 | 25–30 | — |
| AeroPress | 65 | 38–113 | 40–50 | — |
| V60 | 100 (pour-over) | 48–82 | 60–80 | 90–110 |
| Chemex | — | (pour over 49–110) | 80–100 | — |
| French press | 120 | 82–154 | 120+ | 130+ |
| Cold brew | — | 95–160 | 140+ | — |

HCG https://honestcoffeeguide.com/kingrinder-k6-grind-settings/ (notation "2.42" = 2 rotations + 42 clicks = 162 clicks). Intelligentsia: "starting around 80 clicks" for pour over ( https://www.intelligentsia.com/products/kingrinder-k6-grinder ). completehomebarista's K6 page contradicts the manual — discard.

## Kingrinder K4 (discontinued)
- Hand, stepped, external adjustment (same mechanism as K6); titanium-coated conical burr. 60 clicks per rotation. **16 µm/click official** ( https://www.kingrinder.com/blog/comp-k4-k6 ). Zero / dial caveat same as K6. HCG publishes the identical chart to K6 ( https://honestcoffeeguide.com/kingrinder-k4-grind-settings/ ). Treat K4 = K6 anchors.

## Kingrinder K2 / K1 / K0
- Hand, stepped, internal adjustment (numbered spin dial under the burr). Official K0/K1/K2 manual PDF https://uploads.strikinglycdn.com/files/c2fe81a7-0e17-4f03-8ad5-ddcc6a52aa68/KINGrinder+K0.K1.K2-EN.pdf
- Burr: K2 48 mm hexagonal stainless conical; K0/K1 diameter not found.
- Clicks per rotation: **40**. µm per click: 18 µm (official, https://www.kingrinder.com/interior-adjustment ).
- Total range: HCG charts to 140 clicks (3.5 rotations).
- Zero (official): remove catch cup; "Turn the adjustment nut clockwise until you feel resistance. Do not overtighten." Note the number under the triangle marker as reference; turn counter-clockwise to the click count.
- Safety: "Do not rotate the handle when the grind setting is at 0 or below 16 clicks".

Official click chart (from the manual):

| Method | K0 | K1 | K2 |
|---|---|---|---|
| Turkish | Not recommended | 20 | 20 |
| Espresso | Not recommended | 40 | 40 |
| Moka / AeroPress | 60 | 60 | 60 |
| Pour-over | 100 | 100 | 100 |
| French press | 140 | 140 | 140 |

HCG (identical for K0/K1/K2): Turkish 6–29, espresso 25–51, moka 49–89, AeroPress 44–130, V60 55–95, pour over 56–126, French press 94–140, cold brew 109–140 ( https://honestcoffeeguide.com/kingrinder-k2-grind-settings/ ).

---

## Hario — general

Hario's official manuals give **no click numbers at all**; only "Rotate to the right (clockwise) for finer grounds or to the left for coarser" and a qualitative Fine / Medium-fine / Medium / Coarse chart. Warning: turning too far clockwise grinds the ceramic burrs together. Manuals: https://global.hario.com/product/MMCS-2B.pdf (Skerton Pro), https://global.hario.com/product/MSCS-2DTB.pdf (Skerton+), https://global.hario.com/product/MSS-1DTB.pdf (Mini-Slim+), https://global.hario.com/product/MMSP-1.pdf (Mini-Slim Pro). All ceramic conical; no µm/click from any source.

## Hario Skerton Pro (MMCS-2B)
- Hand, stepped (click nut under the burr). Clicks per rotation / total: not published. Homegrounds: "10 usable grind sizes… roughly 100 microns between each step". HCG: 350–1400 µm, notches 0–9 ( https://honestcoffeeguide.com/hario-skerton-pro-grind-settings/ ).
- Zero: turn adjustment nut clockwise until tight (burrs touch); count clicks counter-clockwise ( https://thecoffeefolk.com/hario-skerton-pro/ ).

| Method | HCG (notches) | Coffee Chronicler https://coffeechronicler.com/grind-size-chart/ | Homegrounds https://www.homegrounds.co/hario-skerton-hand-grinder-review/ | The Coffee Folk | Brewcoffeehome | Balance Journal |
|---|---|---|---|---|---|---|
| Espresso | 1 | 3 | 2 (pressurised) | 4 | 2 | 1–5 |
| Moka | 2–3 | 5 | 3 | 4–6 | 3 | — |
| AeroPress | 1–5 | 8 | 4–7 | 4–9 | — | varies |
| V60 | 2–3 | 10 (pour over) | 5–6 | 4–6 | 6 | 6–9 |
| Chemex | (pour over 2–5) | — | 6–7 | — | 7 | — |
| French press | 4–8 | 13 | 8–10 | 12–14 | 9+ | 10–13 |
| Cold brew | 5–9 | — | 10 | 12–16 | 9+ | — |

Caveat: HCG's Skerton Pro chart is identical to its Skerton Plus chart, so it likely was not measured on the Pro; Coffee Chronicler (Kruve-sieved) and Homegrounds are more credible. Midpoint consensus: espresso 2–3, moka 3–5, AeroPress 5–8, V60 6–9, Chemex 7–9, French press 10–13, cold brew 12+.

## Hario Skerton Plus (MSCS-2DTB) and original Skerton
- Adjustment nut under the handle with a stopper — coarse notches; requires removing handle/stopper to adjust. HCG (Plus and original identical): espresso 1, moka 2–3, AeroPress 1–5, V60 2–3, pour over 2–5, French press 4–8, cold brew 5–9 ( https://honestcoffeeguide.com/hario-skerton-plus-grind-settings/ ). Fourbarrel: V60/AeroPress 2, drip cone 3, metal filter/Clever 5, French press 7 ( https://www.tumblr.com/fourbarrel/283821195/easy-way-to-set-the-grind-on-a-hario-skerton ).
- Zero: manual: loosen fixing screw, remove handle/stopper, turn adjustment nut clockwise to tighten, reattach.

## Hario Mini Slim Plus (MSS-1DTB) and Mini Slim Pro (MMSP-1)
- Hand, stepped click nut at base of inner burr shaft. ~20 usable clicks from zero (HCG charts to 20; coffeegrinderguide counts to 24). HCG: 200–1400 µm ( https://honestcoffeeguide.com/hario-mini-mill-slim-pro-grind-settings/ ).
- Zero: tighten nut fully clockwise = zero; count clicks counter-clockwise ( https://www.beanground.com/hario-mini-mill-review/ ).

| Method | HCG (Slim / Plus / Pro identical) | Coffee Chronicler (Plus) | Howchoo https://howchoo.com/coffee/how-to-adjust-your-hario-mini-mill-coffee-grinder | Beanground | coffeegrinderguide https://coffeegrinderguide.com/hario-mini-slim/ |
|---|---|---|---|---|---|
| Turkish | 1 | — | — | — | — |
| Espresso | 1–3 | n/a | 5 | — | — |
| Moka | 4–8 | 6 | 9 | — | — |
| AeroPress | 3–13 | 7–11 | 6–8 | — | 8–12 |
| V60 | 5–8 | 12 (pour over) | 10 | 8–10 | 12–14 |
| Chemex | (pour over 5–12) | — | 9 | — | — |
| French press | 9–18 | 15 | 12–14 | 15 | 20–24 |
| Cold brew | 11–20 | — | — | — | — |

HCG's V60 5–8 is finer than every other source (10–14); Coffee Chronicler's Kruve-checked 12 is the better anchor.
