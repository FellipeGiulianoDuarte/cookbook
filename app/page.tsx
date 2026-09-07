import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Wizard } from "@/components/wizard/Wizard";
import { loadCatalog } from "@/lib/data";
import type { ClientCatalog } from "@/lib/derive";
import { searchParamsCache } from "@/lib/url";

/** Shareable link preview: the OG image route reads the same query parameters. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const key of ["m", "r", "g", "d", "roast", "proc", "off", "nudge"]) {
    const v = sp[key];
    if (typeof v === "string" && v) qs.set(key, v);
  }
  const image = `/og${qs.size ? `?${qs.toString()}` : ""}`;
  return {
    openGraph: { images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const initial = await searchParamsCache.parse(searchParams);
  const { recipes, grinders, adjustments, microns, extraction } = loadCatalog();
  const catalog: ClientCatalog = {
    recipes,
    grinders,
    adjustments,
    microns,
    extraction,
  };
  return <Wizard catalog={catalog} initial={initial} />;
}
