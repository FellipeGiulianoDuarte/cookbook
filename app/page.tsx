import type { SearchParams } from "nuqs/server";
import { Wizard } from "@/components/wizard/Wizard";
import { loadCatalog } from "@/lib/data";
import type { ClientCatalog } from "@/lib/derive";
import { searchParamsCache } from "@/lib/url";

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
