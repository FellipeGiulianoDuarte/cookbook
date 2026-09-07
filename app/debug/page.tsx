import type { Metadata } from "next";
import { loadCatalog } from "@/lib/data";
import { adjustForBean } from "@/lib/engine/bean";
import { gridToSetting } from "@/lib/engine/grind";
import {
  buildSchedule,
  fillStepText,
  formatClock,
} from "@/lib/engine/schedule";
import type { GrindBand, Grinder } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Data check",
  robots: { index: false },
};
export const dynamic = "force-static";

/*
  Data review page. Lists every recipe at three doses and every grinder at the launch
  bands, with the source behind each number. Not linked from the app; used during
  Phase 1 review and kept as a maintenance aid.
*/

const BANDS: { band: GrindBand; pos: number; label: string }[] = [
  { band: "espresso", pos: 0.5, label: "Espresso ·5" },
  { band: "aeropress", pos: 0.35, label: "AeroPress ·35" },
  { band: "v60", pos: 0.35, label: "V60 ·35" },
  { band: "v60", pos: 0.8, label: "V60 ·80" },
  { band: "frenchpress", pos: 0.5, label: "French press ·5" },
];

function settingCell(
  g: Grinder,
  band: GrindBand,
  pos: number,
  microns: Record<string, [number, number]>,
) {
  const s = gridToSetting(g, band, pos, { microns });
  if (s.kind !== "ok") return <span className="text-fg-faint">{s.reason}</span>;
  return (
    <span className={s.unsafe || s.outOfRange ? "text-danger" : ""}>
      <span className="tabular font-medium">{s.text}</span>{" "}
      <span className="text-fg-faint">
        ±{s.tolerance} · {s.basis[0]} [{s.band[0]}–{s.band[1]}]
      </span>
    </span>
  );
}

export default function DebugPage() {
  const { recipes, grinders, adjustments, microns } = loadCatalog();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fg-faint">
        Data check
      </p>
      <h1 className="font-display text-3xl tracking-tight">
        {recipes.length} recipes · {grinders.length} grinders
      </h1>

      <h2 className="mt-10 mb-3 font-display text-2xl">Recipes</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {recipes.map((r) => {
          const doses = [r.dose.min, r.dose.default, r.dose.max].filter(
            (d, i, a) => a.indexOf(d) === i,
          );
          const light = adjustForBean(r, { roast: "light" }, adjustments);
          const dark = adjustForBean(r, { roast: "dark" }, adjustments);
          return (
            <article
              key={r.id}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">
                  {r.name} <span className="text-fg-muted">· {r.author}</span>
                </h3>
                <span className="font-mono text-xs text-fg-faint">{r.id}</span>
              </header>
              <p className="text-fg-muted">{r.summary.en}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <dt className="text-fg-faint">Method</dt>
                <dd>
                  {r.method} · {r.style}
                </dd>
                <dt className="text-fg-faint">Ratio</dt>
                <dd>1:{r.ratio}</dd>
                <dt className="text-fg-faint">Grind</dt>
                <dd>
                  {r.grind.texture} · {r.grind.band} pos {r.grind.pos}
                  {r.grind.microns ? ` · ${r.grind.microns} µm` : ""}
                </dd>
                <dt className="text-fg-faint">Temp</dt>
                <dd>
                  {r.temperature.default} °C · light {light.tempC} · dark{" "}
                  {dark.tempC} ({light.tempSource})
                </dd>
              </dl>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {doses.map((dose) => {
                  const s = buildSchedule(r, dose);
                  return (
                    <div
                      key={dose}
                      className="rounded-md bg-surface-2 p-2 text-xs"
                    >
                      <div className="mb-1 font-semibold">
                        {dose} g → {s.water} g
                        {s.bypass ? ` + ${s.bypass.grams} g bypass` : ""}
                      </div>
                      <ol className="space-y-0.5">
                        {s.steps.map((st) => (
                          <li
                            key={`${st.at}-${st.action}-${st.cumulative}`}
                            className="flex gap-2"
                          >
                            <span className="tabular w-10 shrink-0 text-fg-faint">
                              {formatClock(st.at)}
                            </span>
                            <span>
                              {fillStepText(st.text.en, st, dose)}
                              {st.water ? (
                                <b className="text-accent">
                                  {" "}
                                  {st.cumulative} g
                                </b>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-fg-faint">
                Source:{" "}
                <a className="underline" href={r.source.url}>
                  {r.source.title}
                </a>{" "}
                ({r.source.kind}){r.source.notes ? ` — ${r.source.notes}` : ""}
              </p>
            </article>
          );
        })}
      </div>

      <h2 className="mt-12 mb-3 font-display text-2xl">Grinders</h2>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-xs">
          <thead className="bg-surface-2 text-left text-fg-faint">
            <tr>
              <th className="p-2">Grinder</th>
              <th className="p-2">Notation</th>
              {BANDS.map((b) => (
                <th key={b.label} className="p-2">
                  {b.label}
                </th>
              ))}
              <th className="p-2">Zero</th>
            </tr>
          </thead>
          <tbody>
            {grinders.map((g) => (
              <tr key={g.id} className="border-t border-line align-top">
                <td className="p-2">
                  <div className="font-semibold">
                    {g.brand} {g.model}
                  </div>
                  <div className="font-mono text-fg-faint">{g.id}</div>
                </td>
                <td className="p-2 text-fg-muted">
                  {g.notation}
                  {g.clicksPerRotation ? ` · ${g.clicksPerRotation}/rot` : ""}
                  {g.travelMicronsPerClick
                    ? ` · ${g.travelMicronsPerClick} µm travel`
                    : ""}
                </td>
                {BANDS.map((b) => (
                  <td key={b.label} className="p-2">
                    {settingCell(g, b.band, b.pos, microns.bands)}
                  </td>
                ))}
                <td className="p-2 text-fg-muted">
                  ±{g.zero.toleranceClicks}
                  {g.zero.unsafeBelow !== undefined
                    ? ` · unsafe < ${g.zero.unsafeBelow}`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-fg-faint">
        Cell format: value ± zero tolerance · basis (o = official, c =
        community, e = estimated from the Honest Coffee Guide linear model)
        [band]. Red = unsafe or outside the usable range.
      </p>
    </main>
  );
}
