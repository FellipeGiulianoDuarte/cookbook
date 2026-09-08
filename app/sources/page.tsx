import type { Metadata } from "next";
import Link from "next/link";
import { loadCatalog } from "@/lib/data";
import type { Source } from "@/lib/schema";

export const metadata: Metadata = { title: "Sources" };
export const dynamic = "force-static";

/*
  Every number in the app, with where it came from. Generated from the data files so it
  cannot drift from what the wizard shows.
*/

function SourceLine({ s }: { s: Source }) {
  return (
    <li className="text-sm text-fg-muted">
      <a
        className="text-fg underline underline-offset-2"
        href={s.url}
        target="_blank"
        rel="noreferrer"
      >
        {s.title}
      </a>
      <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] uppercase tracking-wide text-fg-faint">
        {s.kind}
      </span>
      {s.year ? <span className="ml-2 text-fg-faint">{s.year}</span> : null}
      {s.notes ? (
        <p className="mt-0.5 text-xs text-fg-faint">{s.notes}</p>
      ) : null}
    </li>
  );
}

export default function SourcesPage() {
  const { recipes, grinders, adjustments, microns, extraction } = loadCatalog();
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-fg-muted hover:text-fg">
        ← Cookbook
      </Link>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
        Sources
      </p>
      <h1 className="font-display text-4xl tracking-tight text-fg">
        Where every number comes from
      </h1>
      <p className="mt-3 text-fg-muted">
        Recipes are entered from the author's own page where one exists,
        otherwise from a written transcription of the author's video. Grinder
        settings are read off community charts, which place every grinder on one
        shared particle-size scale; the maker's own band is shown next to the
        number as a reference, because makers' bands do not cover the same range
        (Comandante's pour-over band runs medium-fine to coarse, Timemore's
        printed guide covers only the centre, and Baratza and Kingrinder publish
        a single point). "Primary" means the author's or maker's own page;
        "transcription" means a written copy of a video; "community" means a
        review site or reader-compiled chart.
      </p>

      <h2 className="mt-12 font-display text-2xl text-fg">Recipes</h2>
      <ul className="mt-4 space-y-5">
        {recipes.map((r) => (
          <li key={r.id}>
            <p className="font-semibold text-fg">
              {r.name}{" "}
              <span className="font-normal text-fg-muted">· {r.author}</span>
            </p>
            <ul className="mt-1 space-y-1">
              <SourceLine s={r.source} />
              {(r.alsoSee ?? []).map((s) => (
                <SourceLine key={s.url} s={s} />
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">Grinders</h2>
      <ul className="mt-4 space-y-5">
        {grinders.map((g) => {
          const seen = new Set<string>();
          const sources = Object.values(g.bands)
            .map((b) => b.source)
            .filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
          return (
            <li key={g.id}>
              <p className="font-semibold text-fg">
                {g.brand} {g.model}
                {g.notes ? (
                  <span className="block text-xs font-normal text-fg-faint">
                    {g.notes}
                  </span>
                ) : null}
              </p>
              <ul className="mt-1 space-y-1">
                {sources.map((s) => (
                  <SourceLine key={s.url} s={s} />
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">
        Roast, process and grind size
      </h2>
      <ul className="mt-4 space-y-1">
        {adjustments.roastTemperature.map((t) => (
          <SourceLine key={t.id} s={t.source} />
        ))}
        {Object.values(adjustments.process)
          .map((p) => p.source)
          .filter((s): s is Source => Boolean(s))
          .map((s) => (
            <SourceLine key={s.url + s.title} s={s} />
          ))}
        <SourceLine s={microns.source} />
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">
        Brewing control chart
      </h2>
      <ul className="mt-4 space-y-1">
        <SourceLine s={extraction.chart.sca.source} />
        {extraction.facts.map((f) => (
          <SourceLine
            key={f.source.url + f.text.en.slice(0, 12)}
            s={f.source}
          />
        ))}
        {extraction.sources.map((s) => (
          <SourceLine key={s.url} s={s} />
        ))}
      </ul>

      <p className="mt-12 text-xs text-fg-faint">
        Hario, V60, AeroPress and grinder brand names belong to their owners.
        The 3D objects are procedural approximations, not scans of the products.
      </p>
    </main>
  );
}
