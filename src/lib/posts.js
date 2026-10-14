// Posts of one language (posts/<lang>/<slug>/index.html, Notebook Kit
// notebooks), read at build time: title, date and summary taken from the
// notebook's tags. Each post is published at /<lang>/posts/<slug>/.
export function listPosts(lang = "fr") {
  const sources = import.meta.glob("/posts/*/*/index.html", { query: "?raw", import: "default", eager: true });
  return Object.entries(sources)
    .filter(([path]) => path.split("/").at(-3) === lang)
    .map(([path, html]) => {
      const slug = path.split("/").at(-2);
      const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim() ?? slug;
      const date = /<meta\s+name="date"\s+content="([^"]+)"/.exec(html)?.[1] ?? null;
      const summary = /<meta\s+name="description"\s+content="([^"]+)"/.exec(html)?.[1] ?? null;
      const dateText = date
        ? new Intl.DateTimeFormat(lang === "en" ? "en-CA" : "fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date))
        : null;
      return { slug, title, date, dateText, summary, href: `/${lang}/posts/${slug}/` };
    })
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
