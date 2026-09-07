import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALES, type Locale, pickLocale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const fromCookie = store.get("locale")?.value;
  let locale: Locale;
  if (fromCookie && (LOCALES as readonly string[]).includes(fromCookie)) {
    locale = fromCookie as Locale;
  } else {
    const accept = (await headers()).get("accept-language") ?? "";
    locale = pickLocale(accept);
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
