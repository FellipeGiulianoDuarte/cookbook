import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { loadCatalog } from "@/lib/data";
import type { Locale, Note, Source } from "@/lib/schema";

export const metadata: Metadata = { title: "Sources" };

/*
  Every number in the app, with where it came from. Generated from the data files so it
  cannot drift from what the wizard shows.
*/

const pick = (n: Note | undefined, locale: Locale) =>
  n === undefined ? "" : typeof n === "string" ? n : (n[locale] ?? n.en);

function SourceLine({
  s,
  locale,
  kind,
}: {
  s: Source;
  locale: Locale;
  kind: string;
}) {
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
        {kind}
      </span>
      {s.year ? <span className="ml-2 text-fg-faint">{s.year}</span> : null}
      {s.notes ? (
        <p className="mt-0.5 text-xs text-fg-faint">{pick(s.notes, locale)}</p>
      ) : null}
    </li>
  );
}

export default async function SourcesPage() {
  const { recipes, grinders, adjustments, microns, extraction } = loadCatalog();
  const t = await getTranslations("sources");
  const locale = (await getLocale()) as Locale;
  const line = (s: Source, key?: string) => (
    <SourceLine
      key={key ?? s.url}
      s={s}
      locale={locale}
      kind={t(`kind.${s.kind}`)}
    />
  );
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-fg-muted hover:text-fg">
        ← {t("back")}
      </Link>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
        {t("eyebrow")}
      </p>
      <h1 className="font-display text-4xl tracking-tight text-fg">
        {t("title")}
      </h1>
      <p className="mt-3 text-fg-muted">{t("intro")}</p>

      <h2 className="mt-12 font-display text-2xl text-fg">{t("recipes")}</h2>
      <ul className="mt-4 space-y-5">
        {recipes.map((r) => (
          <li key={r.id}>
            <p className="font-semibold text-fg">
              {r.name}{" "}
              <span className="font-normal text-fg-muted">· {r.author}</span>
            </p>
            <ul className="mt-1 space-y-1">
              {line(r.source)}
              {(r.alsoSee ?? []).map((s) => line(s))}
            </ul>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">{t("grinders")}</h2>
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
              <ul className="mt-1 space-y-1">{sources.map((s) => line(s))}</ul>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">{t("bean")}</h2>
      <ul className="mt-4 space-y-1">
        {adjustments.roastTemperature.map((rt) => line(rt.source, rt.id))}
        {Object.values(adjustments.process)
          .map((p) => p.source)
          .filter((s): s is Source => Boolean(s))
          .map((s) => line(s, s.url + s.title))}
        {line(microns.source)}
      </ul>

      <h2 className="mt-12 font-display text-2xl text-fg">{t("chart")}</h2>
      <ul className="mt-4 space-y-1">
        {line(extraction.chart.sca.source)}
        {extraction.facts.map((f) =>
          line(f.source, f.source.url + f.text.en.slice(0, 12)),
        )}
        {extraction.sources.map((s) => line(s))}
      </ul>

      <p className="mt-12 text-xs text-fg-faint">{t("footer")}</p>
    </main>
  );
}
