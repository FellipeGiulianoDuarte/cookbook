# Electric grinders: grind-size-to-dial data (fetched 2026-09-07)

- "HCG" = honestcoffeeguide.com. Its per-grinder charts are compiled from "hands-on research and feedback from coffee enthusiasts", not manufacturer data.
- "µm/step" figures marked *computed* = (HCG max µm − HCG min µm) ÷ number of intervals.

## Reference micron ranges per brew method (HCG, https://honestcoffeeguide.com/coffee-grind-size-chart/)
Turkish 40–220 · Espresso 180–380 · Moka 360–660 · AeroPress 320–960 · Filter machine 300–900 · V60 400–700 · Pour over 410–930 · Siphon 375–800 · Cupping 460–850 · French press 690–1300 · Cold brew 800+ · Cold drip 820–1270. No Chemex row.

---

## 1. Baratza Encore
- Stepped, 40 numbered positions (1–40), hopper rotation. 40 mm conical steel (M2). HCG µm range 250–1200 ( https://honestcoffeeguide.com/baratza-encore-grind-settings/ ); ~24 µm/step computed.
- Zero / calibration: adjustable inner ring under the hopper; shim kit, one shim ≈ 5 settings finer ( https://coffeegrinderguide.com/baratza-encore-maintenance/ ).
- HCG settings: Espresso 0–5 · Moka 5–17 · AeroPress 3–29 · V60 7–18 · Pour over 7–28 · Filter machine 3–27 · Siphon 6–23 · French press 19–40 · Cold brew 24–40 · Cupping 9–25.
- Official-style single starting points (Baratza's table, same for Encore and Virtuoso+; Virtuoso+ manual p.6; https://www.frenchpresscoffee.com/blogs/perfect-cup-of-coffee/baratza-grind-size-settings ): Espresso 8 · AeroPress 12 · V60 15 · Automatic brewer 18 · Chemex 20 · French press 28.
- Blog consensus ( https://www.roastycoffee.com/baratza-encore-grind-settings/ ): Espresso 4–10, Moka 10–12, AeroPress 12–14 (short) / 20–22 (long steep), V60 14–16, Chemex 18–22, French press 20–28, Cold brew 24–30.
- Caveat: "not considered an espresso level grinder" (HCG).

## 2. Baratza Encore ESP
- Stepped, 40 positions; 1–20 are micro-steps (espresso), 21–40 macro-steps ( https://www.baratza.com/en-us/blog/product-guides/dialing-in-espresso ). 40 mm conical, M2. HCG 230–1380 µm ( https://honestcoffeeguide.com/baratza-encore-esp-grind-settings/ ). Micro ≈ 20 µm/step; macro ≈ 37 µm/step computed. Factory-calibrated for espresso.
- HCG: Espresso 0–13 · Moka 12–24 · AeroPress 8–30 · V60 15–25 · Pour over 16–30 · Filter machine 7–29 · Siphon 13–27 · French press 25–38 · Cold brew 27–40.
- Baratza-derived starting points ( https://www.frenchpresscoffee.com/blogs/perfect-cup-of-coffee/baratza-encore-esp-grind-settings ): Espresso 15 · AeroPress 22 · V60 25 · Auto brewer 28 · Chemex 30 · French press 32. Retailer ranges (Volcano Coffee Works): Espresso/Moka 1–15 · AeroPress 6–20 · Pour over 18–28 · French press 30–40 · Cold brew 35–40.
- UI note: two resolutions; do not model as one linear slope.

## 3. Baratza Virtuoso+
- Stepped, 40 positions (Virtuoso+ Operations Manual v1.6 p.5, https://assets.breville.com/ZCG587/manual-virtuosoplus-en-v1-6.pdf ). 40 mm conical steel (M3). HCG 200–1200 µm ( https://honestcoffeeguide.com/baratza-virtuoso-plus-grind-settings/ ); ~25.6 µm/step.
- Official suggested settings (manual p.6): Espresso 8 · AeroPress 12 · Hario V60 15 · Automatic brewer 18 · Chemex 20 · French press 28.
- HCG: Espresso 0–7 · Moka 7–18 · AeroPress 5–30 · V60 8–20 · Pour over 9–29 · French press 20–40 · Cold brew 24–40.

## 4. Baratza Sette 270
- 30 macro steps (A–E × 1–9) plus a stepless micro ring 1–9 → "270 settings" ( https://www.baratza.com/en-us/product/settetm-270-zcg1270 ). 40 mm conical steel. HCG 230–950 µm ( https://honestcoffeeguide.com/baratza-sette-270-grind-settings/ ); ~24 µm per macro step computed. Shim kit for calibration.
- HCG (macro 1–31): Espresso 1–7 · Moka 7–18 · AeroPress 5–31 · V60 9–20 · Pour over 9–30 · French press 21–31 · Cold brew 25–31.

## 5. Fellow Ode Brew Grinder Gen 2
- Stepped; dial 1–11 with 2 intermediate clicks per number → 31 total steps ( https://fellowproducts.com/products/ode-brew-grinder-gen-2 ). 64 mm flat stainless. Fellow: "250–300 microns and up"; HCG 275–1160 ( https://honestcoffeeguide.com/fellow-ode-brew-grinder-gen-2-grind-settings/ ); ~29.5 µm per click computed.
- Zero: set dial to 11, remove front plate and dial, run grinder, turn counter-clockwise one click at a time until burrs touch, then one click clockwise, power off: "The burrs are now set to 1" ( https://fellowproducts.com/blogs/learn/how-to-install-and-calibrate-ode-gen-2-brew-burrs-and-ssp-mp-burrs ). Ships pre-calibrated.
- Espresso: "Ode is not suitable for espresso" (Fellow).
- HCG (dial.click notation, x.1/x.2 = the two clicks after number x): Moka 2–5.1 · AeroPress 1.2–8.2 · V60 2.2–5.2 · Pour over 2.2–8.1 · Filter machine 1.1–8 · French press 6–11 · Cold brew 7–11 · Cupping 3.1–7.1.
- Retailer guide numbering clicks 1–31 ( https://www.seattlecoffeegear.com/pages/product-resources/fellow-ode-coffee-grinder-gen-2-product-guide ): AeroPress 1–8 · V60 & Chemex 10–20 · Kalita 12–18 · Drip 15–22 · French press 22–28 · Cold brew 25–31. Converted to dial (dial = 1 + (click − 1)/3): V60/Chemex ≈ 4.0–7.1, French press ≈ 8.0–10.0. Blog consensus: V60 4.0–6.0 start 5.0; AeroPress 3.0–5.0; French press start 6.0.
- Recommend UI default 4–6 for V60 (dial), HCG as the wide band.

## 6. Fellow Opus
- Stepped outer ring 1–11 with 4 minor increments (0.25) between each numbered setting → 41 positions; blue inner ring adds micro-adjustment and extends to 0 and 12 ( https://fellowproducts.com/pages/gear-guide-opus ). 40 mm conical, DLC-coated. HCG 230–1160 µm ( https://honestcoffeeguide.com/fellow-opus-grind-settings/ ); ~23 µm per outer click computed. Inner ring resolution undocumented.
- HCG: Espresso 1–2.5 · Moka 2.5–5.5 · AeroPress 2–8.75 · V60 3–6 · Pour over 3–8.5 · French press 6–11 · Cold brew 7.25–11.
- Blog starting points ( https://coffeemaster.app/guides/fellow-opus-grind-settings , notation x.0–x.3 = 4 clicks per number): Espresso 1.1–2.2 · Moka 3.3–4.1 · AeroPress 4.0–4.2 · V60 4.3–5.2 · Chemex 7.0–7.3 · French press 9.1–9.3.
- UI note: store the position index (0–40) and render both notations.

## 7. Wilfa Uniform / Uniform+
- Stepped, 41 positions (1–41), tactile click ( https://wilfa.com/pages/uniform-wsfb-use ). 58 mm flat stainless. HCG 220–1010 µm ( https://honestcoffeeguide.com/wilfa-uniform-grind-settings/ ); ~20 µm/step. No user zero procedure; Wilfa: "every grinder will vary slightly in calibration". Uniform+ = same grinder with a scale lid.
- Official (wilfa.com): Espresso 3–7, start 5 · AeroPress 14–26 · Pour over 14–28 · Filter 22–32 · French press 30–38 · Steep 39–41.
- HCG: Espresso 1–9 · Moka 9–23 · AeroPress 7–38 · V60 11–25 · Pour over 11–36 · French press 25–41 · Cold brew 31–41.

## 8. Wilfa Svart (Aroma / Precision)
- Stepped, hopper rotation; dial printed with brew-method zones (coarse→fine): STEEP, FRENCH PRESS, FILTER, AEROPRESS, MOCCA — "5 grinding degrees" with fine-tune steps between; HCG counts 18 dot positions ( https://wilfa.com/products/svart-aroma ; https://honestcoffeeguide.com/wilfa-svart-grind-settings/ ). Conical steel. HCG 310–1100 µm; ~46 µm per dot computed. Not espresso capable ("finest setting is roughly medium").
- HCG (dots 1 = finest … 18 = coarsest): Moka 3–8 · AeroPress 2–14 · V60 3–9 · Pour over 4–14 · Filter machine 1–13 · French press 10–18 · Cold brew 12–18.
- Roaster guidance keyed to the printed letters ( https://squaremileblog.com/2018/06/26/wilfa-grind-size-guide/ ): AeroPress = 'R' of AEROPRESS · V60 250 ml = 'P', 500 ml = first 'E', 750 ml = dot between FILTER and AEROPRESS · Clever = between 'O' and 'P' · French press = 'O' of AEROPRESS · Batch brewer = 'T' of FILTER.
- UI note: needs a labelled strip (letters), not numbers.

## 9. Niche Zero
- Stepless; reference numbers 0–50 on the funnel ring plus a blank zone usable past 50 ( https://www.nichecoffee.co.uk/products/niche-zero ). 63 mm conical (Mazzer). Niche: 10–20 → 200–400 µm, 35–50 → 600–800 µm ( https://www.nichecoffee.co.uk/blogs/exploring-coffee/how-to-dial-in-your-niche-zero ); ~13–20 µm/mark computed. HCG "0–1400".
- Zero (official): clean; funnel hand-tight; rotate top dial clockwise until burrs touch; rotate the black bezel until the silver ball aligns with the "Calibrate" mark; then turn counter-clockwise to your setting. Never grind at the calibrate position ( https://www.nichecoffee.co.uk/blogs/exploring-coffee/how-to-calibrate-your-grinder-for-optimum-performance ). Variance "5–7 marks between units is normal".
- Official ( https://www.nichecoffee.co.uk/blogs/exploring-coffee/the-ultimate-grind-size-guide-for-niche-grinders ): Espresso 5–20 · Moka 20–30 · AeroPress 30–35 · V60 35–45 · French press 45+. Dial-in article: espresso 10–20 start 15; V60 35–50.
- HCG (rotation.steps): Turkish 4–17 · Espresso 15–30 · Moka 30–53 · AeroPress 26–77 · V60 33–56 · Pour over 34–75 · French press 56–64 (1.14 = 64) · Cold brew 65–73.
- Blogs: Coffee Chronicler Espresso 9–24 · Moka 18–24 · AeroPress 24–40 · Pour over 40–50 · French press 55. completehomebarista Espresso 10–20 · AeroPress 20–28 · V60 30–40 · Chemex 35–45 · French press 45–55 · Cold brew 50–60.

## 10. Niche Duo
- Stepless; swappable 83 mm flat burr sets ( https://www.nichecoffee.co.uk/products/niche-duo ). Official settings: Espresso 0–10 · Moka 10–20 · AeroPress 20–30 · V60 30–45 · French press 45+. Espresso burrs can do filter; filter burrs cannot reach espresso. No HCG page; no µm data.

## 11. Turin DF64 Gen 2
- Stepless collar 0–90 (0 fine, 90 coarse) ( https://cdn.shopify.com/s/files/1/0774/3632/2009/files/1_DF64_Grind_Size_US.pdf ; https://df64coffee.com/products/df64-gen-2-single-dose-coffee-grinder ). 64 mm flat. HCG 180–1050 µm ( https://honestcoffeeguide.com/turin-df64-gen-2-grind-settings/ ); ~9.7 µm/mark.
- Zero (official): "where the grinder burrs make contact… always adjust while the grinder is running. Listen for a light 'chirping' sound" — the chart is drawn from YOUR zero point, not the printed 0. "Two DF54 or DF64 Gen 2 grinders may not use precisely the same number" ( https://www.grindlogic.com.au/blogs/articles/how-to-dial-in-df54-df64-gen-2-espresso ).
- Official DF Grinders chart (marks from your zero): Espresso 5–30 · AeroPress 10–35 · Moka 15–40 · Pour over 50–80 · French press 65–80 · Cold brew 80–90.
- Grind Logic ( https://www.grindlogic.com.au/blogs/articles/df64-coffee-grinder-grind-size-guide ): Espresso 5–18 · Moka 12–25 · AeroPress 15–45 · Pour over 30–60 · Drip 32–65 · French press/cold brew 55–85.
- HCG: Espresso 0–20 · Moka 19–49 · AeroPress 15–80 · V60 23–53 · Pour over 24–77 · French press 53–90 · Cold brew 65–90.

## 12. Turin DF64V
- Stepless, 0–90; variable speed 600–1800 RPM ( https://www.brewcoffeehome.com/df64v-coffee-grinder-review/ ). 64 mm flat DLC. HCG 110–1000 µm ( https://honestcoffeeguide.com/turin-df64v-grind-settings/ ); ~9.9 µm/mark. Zero: chirp method; printed 0 ≠ zero.
- HCG: Espresso 8–27 · Moka 26–55 · AeroPress 22–85 · V60 30–59 · Pour over 31–82 · French press 59–90 · Cold brew 70–90.

## 13. Turin DF54
- Stepless, 0–90 ( https://dfgrinders.ca/pages/df54-grind-size-guide ). 54 mm flat. HCG 110–900 µm ( https://honestcoffeeguide.com/turin-df54-grind-settings/ ); ~8.8 µm/mark. Zero: chirp with motor running.
- Grind Logic ( https://www.grindlogic.com.au/blogs/articles/df54-coffee-grinder-grind-settings ): Espresso 5–30 · AeroPress 10–35 · Moka 20–50 · Pour over 45–75 · French press 70–85 · Cold brew 80–90.
- HCG: Espresso 8–30 · Moka 29–62 · AeroPress 24–90 · V60 34–67 · Pour over 35–90 · French press 67–90 · Cold brew 79–90.

## 14. Eureka Mignon Specialità / Silenzio / Manuale
- Stepless micrometric top dial; "spins 360 degrees repeatedly, the numbers are just a reference point" (Clive Coffee https://support.clivecoffee.com/en/eureka-mignon-series-how-to-dial-in-from-the-zero-point ). Specialità and Silenzio 55 mm flat; Manuale 50 mm flat. HCG 195–1400 µm across ~4 dial rotations ( https://honestcoffeeguide.com/eureka-mignon-specialita-grind-settings/ ); ~300 µm per full turn computed. Blog: "each half-mark shifts 13 to 33 µm" in the espresso zone ( https://coffeemaster.app/guides/eureka-mignon-specialita-grind-settings ).
- Zero (Clive): hopper off, grinder running, turn clockwise (finer) until burrs chirp, back off until silent = zero; start espresso three whole numbers coarser.
- HCG notation "rotations+number" (10 numbers per rotation): Espresso 0–3.5 · Moka 3.5–1+3 · AeroPress 2.5–2+3 · V60 4.5–1+4 · Pour over 4.5–2+2.5 · Filter machine 2.5–2+2 · French press 1+4–3+4 · Cold brew 2+0.5–4+0. Blog light-roast starting points (coffeemaster): Espresso 1.5 · Moka 1+0 · AeroPress 1+0 · V60 1+1.5 · Chemex 1+3.5 · French press 2+4.
- UI: continuous dial with a rotation counter; user must set their own zero.

## 15. Varia VS3 Gen 2
- Stepless, hopper rotation; "10 μm relative vertical burr shift per increment" (Varia https://www.variabrewing.com/products/varia-vs3-grinder ); ~17 main numbers × 10 sub-marks over two rotations. Conical 48/38 mm. HCG 170–1400 µm ( https://honestcoffeeguide.com/varia-vs3-gen-2-grind-settings/ ). Zero: burr-touch method (undocumented by Varia).
- Official reference points: Espresso at "#4" (18 g in 34 s), Filter at "#10" (18 g in 25 s).
- HCG (dial numbers, decimal = sub-mark): Espresso 0.2–3.3 · Moka 3.1–7.8 · AeroPress 2.4–12.5 · V60 3.7–8.4 · Pour over 3.9–12.1 · French press 8.3–18 · Cold brew 10.1–19.6.

---

## Cross-cutting caveats
1. Zero-point offset dominates unit variance. Offer a per-user offset.
2. Stepped grinders with two resolutions: Encore ESP (1–20 fine, 21–40 coarse), Sette 270 (macro + stepless micro), Opus (outer clicks + inner ring).
3. Burr wear moves settings finer over time.
4. Variable-RPM grinders (DF64V) change particle distribution at a fixed gap.
5. HCG's espresso rows on filter-only grinders (Encore 0–5, Ode 1–2, Svart 1–2) are nominal; Fellow and Wilfa say those grinders do not do espresso.
