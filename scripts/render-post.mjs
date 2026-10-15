// Renders a post's Notebook Kit notebook (index.html) from its tangent/note
// source (source.js). The source starts with a front matter in comments
// (// ---, // title: …, // date: …, // author: …, // translation: …, // ---) and holds
// cells introduced by // %% [markdown] or // %% [javascript] (options after
// the kind, such as #collapse-cell, are ignored). Markdown lines lose their
// leading "// "; cells are indented by four spaces; an empty pinned module
// cell closes the notebook, as Notebook Kit writes it.
//
//   node scripts/render-post.mjs posts/fr/<slug> [--date YYYY-MM-DD] [-o index.html]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const folder = args.find((a) => !a.startsWith("-") && args[args.indexOf(a) - 1] !== "--date" && args[args.indexOf(a) - 1] !== "-o");
if (!folder) throw new Error("usage: node scripts/render-post.mjs posts/<lang>/<slug> [--date YYYY-MM-DD] [-o file]");

const source = readFileSync(join(folder, "source.js"), "utf-8").split(/\r?\n/);

// front matter
const meta = {};
let i = 0;
if (source[0]?.trim() === "// ---") {
  for (i = 1; i < source.length && source[i].trim() !== "// ---"; i++) {
    const m = source[i].match(/^\/\/\s*(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  i++;
}
const title = meta.title ?? "";
const date = option("--date") ?? meta.date;
if (!date) throw new Error("date missing: add « // date: YYYY-MM-DD » to the front matter or pass --date");

// cells
const cells = [];
let current = null;
for (; i < source.length; i++) {
  const m = source[i].match(/^\/\/ %% \[(markdown|javascript)\]/);
  if (m) { current = { kind: m[1], lines: [] }; cells.push(current); continue; }
  if (current) current.lines.push(source[i]);
}
const trim = (lines) => { const l = [...lines]; while (l.length && !l[0].trim()) l.shift(); while (l.length && !l.at(-1).trim()) l.pop(); return l; };
const indent = (lines) => lines.map((l) => (l.trim() ? `    ${l}` : "")).join("\n");

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const out = ["<!doctype html>", "<notebook>", `  <title>${escape(title)}</title>`, `  <meta name="date" content="${date}">`];
if (meta.author) out.push(`  <meta name="author" content="${escape(meta.author)}">`);
if (meta.translation) out.push(`  <meta name="translation" content="${meta.translation}">`);
let id = 0;
for (const cell of cells) {
  const lines = trim(cell.kind === "markdown" ? cell.lines.map((l) => l.replace(/^\/\/ ?/, "")) : cell.lines);
  if (!lines.length) continue;
  id++;
  out.push(`  <script id="${id}" type="${cell.kind === "markdown" ? "text/markdown" : "module"}">`, indent(lines), "  </script>");
}
out.push(`  <script id="${id + 1}" type="module" pinned>`, "", "  </script>", "</notebook>", "");

const target = option("-o") ?? join(folder, "index.html");
writeFileSync(target, out.join("\n"));
console.log(`${target}: ${id} cells`);
