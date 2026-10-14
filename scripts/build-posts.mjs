// Builds the posts of each language with the site template. A post is a
// folder, posts/<lang>/<slug>/, holding the Notebook Kit notebook
// (index.html, rendered by hand from source.js), its source (source.js, not
// built) and any files the notebook attaches (images, data); it is published
// at /<lang>/posts/<slug>/.
//
// A post that has a translation names it in its notebook:
//   <meta name="translation" content="/en/posts/<slug>/">
// and its language link then points to the translation instead of the list.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const LANGUAGES = { fr: "en", en: "fr" };
for (const [lang, other] of Object.entries(LANGUAGES)) {
  const output = `public/${lang}/posts`;
  rmSync(output, { recursive: true, force: true });
  const root = `posts/${lang}`;
  const slugs = existsSync(root)
    ? readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`${root}/${d.name}/index.html`)).map((d) => d.name)
    : [];
  if (slugs.length === 0) continue;
  // -o is relative to the notebook root.
  const target = "../".repeat(root.split("/").length) + output;
  const r = spawnSync("npx", ["notebooks", "build", "--root", root, "--template", `templates/post-${lang}.html`,
    "-o", target, "--empty", "--", ...slugs.map((s) => `${root}/${s}/index.html`)], { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);

  for (const slug of slugs) {
    const notebook = readFileSync(`${root}/${slug}/index.html`, "utf-8");
    const page = `${output}/${slug}/index.html`;
    let html = readFileSync(page, "utf-8");
    // Title and date of the notebook at the top of the post (the list of posts reads the same tags).
    const title = /<title>([^<]*)<\/title>/.exec(notebook)?.[1]?.trim();
    const date = /<meta\s+name="date"\s+content="([^"]+)"/.exec(notebook)?.[1];
    const dateText = date
      ? new Intl.DateTimeFormat(lang === "en" ? "en-CA" : "fr-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date))
      : "";
    if (title) {
      html = html.replace("<main>", `<main><header class="post"><h1>${title}</h1>${dateText ? `<p class="date">${dateText}</p>` : ""}</header>`)
        .replace(/<title>[^<]*<\/title>/, `<title>${title} · Votoscope</title>`);
    }
    const translation = /<meta\s+name="translation"\s+content="([^"]+)"/.exec(notebook)?.[1];
    if (translation) html = html.replace(`<a href="/${other}/posts/" hreflang="${other}"`, `<a href="${translation}" hreflang="${other}"`);
    writeFileSync(page, html);
  }
}
