// Builds the posts of each language with the site template. A post is a
// folder, posts/<lang>/<slug>/, holding the Notebook Kit notebook
// (index.html, rendered by hand from source.js), its source (source.js, not
// built) and any files the notebook attaches (images, data); it is published
// at /<lang>/posts/<slug>/.
//
// A post that has a translation names it in its notebook:
//   <meta name="translation" content="/en/posts/<slug>/">
// and its language link then points to the translation instead of the list.
//
// The notebooks are written in tangent/note, which displays the last
// expression of every cell and renders arrays of objects as tables. Notebook
// Kit displays a cell's value only when the whole cell is one expression, so
// a copy of each notebook (in build/) gets its last expression wrapped in
// display(), arrays of objects in Inputs.table, and empty cells removed.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parse } from "acorn";

const LANGUAGES = { fr: "en", en: "fr" };
const LOCALES = { fr: "fr-CA", en: "en-CA" };

/** Source of a cell that displays its last expression, as tangent/note does. */
function displayLast(code, locale) {
  let program;
  try {
    program = parse(code, { ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true });
  } catch {
    return code;
  }
  const last = program.body.at(-1);
  if (last?.type !== "ExpressionStatement" || last.expression.type === "AssignmentExpression") return code;
  const callee = last.expression.type === "CallExpression" ? last.expression.callee : null;
  if (callee?.type === "Identifier" && callee.name === "display") return code;
  const value = code.slice(last.expression.start, last.expression.end);
  const shown = `((v) => Array.isArray(v) && v.length > 0 && v.every((d) => d !== null && typeof d === "object" && !(d instanceof Node))` +
    ` ? Inputs.table(v, { layout: "auto", rows: v.length + 1, select: false, locale: "${locale}" }) : v)(${value})`;
  return code.slice(0, last.start) + `display(${shown});` + code.slice(last.end);
}

/** The notebook with every module cell adapted by displayLast and empty cells removed. */
function adapt(notebook, locale) {
  // Inclusive forms such as élu.es read as web addresses (.es domain) to the
  // markdown renderer, which turns them into links; a span splits them.
  notebook = notebook.replace(/(<script\b[^>]*\btype="text\/markdown"[^>]*>)([\s\S]*?)(<\/script>)/g,
    (cell, open, text, close) => open + text.replace(/(\p{L})\.(es?)\b/gu, "$1<span>.</span>$2") + close);
  return notebook.replace(/\n?[ \t]*<script\b([^>]*)\btype="module"([^>]*)>([\s\S]*?)<\/script>/g, (cell, before, after, code) => {
    if (!code.trim()) return "";
    return cell.replace(code, () => displayLast(code, locale));
  });
}

for (const [lang, other] of Object.entries(LANGUAGES)) {
  const output = `public/${lang}/posts`;
  rmSync(output, { recursive: true, force: true });
  const source = `posts/${lang}`;
  const slugs = existsSync(source)
    ? readdirSync(source, { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`${source}/${d.name}/index.html`)).map((d) => d.name)
    : [];
  if (slugs.length === 0) continue;

  const root = `build/posts/${lang}`;
  rmSync(root, { recursive: true, force: true });
  cpSync(source, root, { recursive: true });
  for (const slug of slugs) {
    const file = `${root}/${slug}/index.html`;
    writeFileSync(file, adapt(readFileSync(file, "utf-8"), LOCALES[lang]));
  }

  // -o is relative to the notebook root.
  const target = "../".repeat(root.split("/").length) + output;
  const r = spawnSync("npx", ["notebooks", "build", "--root", root, "--template", `templates/post-${lang}.html`,
    "-o", target, "--empty", "--", ...slugs.map((s) => `${root}/${s}/index.html`)], { stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);

  for (const slug of slugs) {
    const notebook = readFileSync(`${source}/${slug}/index.html`, "utf-8");
    const page = `${output}/${slug}/index.html`;
    let html = readFileSync(page, "utf-8");
    // Title and date of the notebook at the top of the post (the list of posts reads the same tags).
    const title = /<title>([^<]*)<\/title>/.exec(notebook)?.[1]?.trim();
    const date = /<meta\s+name="date"\s+content="([^"]+)"/.exec(notebook)?.[1];
    const dateText = date
      ? new Intl.DateTimeFormat(LOCALES[lang], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date))
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
