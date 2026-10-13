/**
 * Copie, pour le développement, les fichiers lus par les tableaux de bord
 * depuis les dépôts voisins des modèles (../quebec/data, ../canada/data)
 * vers public/donnees/ (non versionné). En production, les tableaux de bord
 * les lisent directement dans les dépôts publiés.
 *
 * Run: npm run donnees-locales
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";

const FICHIERS = {
  quebec: ["qc_projection.json", "qc_national_polls.json", "qc_ridings_2026.geojson", "qc_leaders.json", "qc_tile_layout.json", "qc_candidates.json"],
  canada: ["ca_dashboard.json", "ca_national_polls.json"],
};
for (const [depot, fichiers] of Object.entries(FICHIERS)) {
  const dest = new URL(`../public/donnees/${depot}/`, import.meta.url);
  mkdirSync(dest, { recursive: true });
  for (const f of fichiers) {
    const src = new URL(`../../${depot}/data/${f}`, import.meta.url);
    if (!existsSync(src)) { console.log(`absent : ${depot}/data/${f}`); continue; }
    copyFileSync(src, new URL(f, dest));
    console.log(`public/donnees/${depot}/${f}`);
  }
}
