// ---
// title: source
// id: distorsion-scrutin
// ---

// %% [markdown]
// *CAQ : 0*. Pas 0 % du vote, mais 0 candidat élu. Aucun complot ici, rien d'autre que le résultat attendu de la manière dont on élit nos gouvernements : le *scrutin uninominal majoritaire à un tour*. Voici comment fonctionnent les élections au Québec.
//
// 1. tu votes dans ta circonscription, avec un *x* à côté du nom de la personne que tu choisis
// 1. c'est tout.
//
// Ton vote ne dépasse pas ta circonscription. La plupart des candidat.es sont associé.es à un parti, et le parti le plus représenté forme le gouvernement. Un parti, c'est une organisation privée autorisée par le Directeur général des élections du Québec. Tu formes un parti, il y a des règles sur la manière dont tu ramasses l'argent et comment tu la dépenses. Une fois les résultats officialisés, le lieutenant-gouverneur, représentant de sa majesté (permettez la minuscule), invite à former le gouvernement la personne qui a l'appui de la majorité des élu.es. C'est normalement la cheffe ou le chef du parti qui a le plus d'élu.es (le *caucus* gagnant). Les membres du parti ont choisi cette personne, pas l'électorat. Elle reste première ministre tant que ses élu.es l'appuient, et choisit ses ministres parmi elleux. Normalement, on a une idée claire de la personne qui sera choisie. Mais non, tu ne choisis pas qui sera premier ministre. Tu choisis juste la personne qui représentera ta circonscription : ton vote s'arrête là.
//
// Un parti peut donc avoir 13 % des votes exprimés, sans avoir de député, CAQ 0 avec 13 %. Il peut aussi passer sur la fesse un peu partout, avoir 28 % du vote exprimé, et former le gouvernement avec 59 député.es sur les 127 postes disponibles (les *sièges*) : c'est le cas du PQ en 2026. Il peut aussi passer proche partout et former une grande majorité de 72 % des *sièges* avec 41 % du vote : c'était le cas de la CAQ en 2022.

// %% [javascript] #collapse-cell
const Plot = await import("https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm");
const d3 = await import("https://cdn.jsdelivr.net/npm/d3@7/+esm");

const TOTAL_SIEGES = 127;
const INSCRITS = 6495984;
const VOTES_EXERCES = 4345857;
const VOTES_VALIDES = 4282551;
const POPULATION = 9030000; // ISQ, population au 1er janvier 2026 (Le bilan démographique du Québec, édition 2026)

const partis = [
  { parti: "PQ",  votesN: 1199925, sieges: 59, couleur: "#2B50C8" },
  { parti: "PLQ", votesN: 1037051, sieges: 40, couleur: "#E01020" },
  { parti: "PCQ", votesN: 885164,  sieges: 19, couleur: "#10275A" },
  { parti: "CAQ", votesN: 571520,  sieges: 0,  couleur: "#6EC9F5" },
  { parti: "QS",  votesN: 532176,  sieges: 9,  couleur: "#F28C28" },
];

// %% [markdown]
// Ce n'est pas tout le monde qui a le droit de vote, c'est pas tout le monde parmi les personnes qui y ont droit qui votent, et (résultat du mode de scrutin) les personnes qui votent ne sont pas nécessairement bien représentées.

// %% [javascript] #collapse-cell
const sankeyMod = await import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm");

// --- palette et typographie du graphique (hors couleurs de partis) ---
const ENCRE = "#2A2E24";        // encre teintée feuille, pas de noir pur
const GRIS = "#8B887A";         // texte secondaire, chaud
const GRIS_FONCE = "#5E5B50";   // nombres absolus posés sur les bandes
const VERT_NOEUD = "#9FBA85";   // entonnoir
const VERT_FLUX = "#E3EDD3";
const SORTIE_FLUX = "#ECE8E1";  // gris-papier des sorties
const SORTIE_NOEUD = "#C8C2B8";
const F_TEXTE = "'Inter Tight', 'Segoe UI', sans-serif";

// Réglage : position horizontale de la colonne des sièges
const X_SIEGES = 820;

const NON_INSCRITS = "Sans droit de vote ou non inscrits";
const couleurParti = Object.fromEntries(partis.map((p) => [p.parti, p.couleur]));
const autresN = VOTES_VALIDES - partis.reduce((s, p) => s + p.votesN, 0);
const partisSankey = [...partis, { parti: "Autres", votesN: autresN, sieges: 0, couleur: GRIS }];

const noeudsSankey = [
  "Pop. du Québec", "Électeurs inscrits", "Votes exercés", "Votes valides",
  NON_INSCRITS, "Abstention", "Bulletins rejetés",
  ...partisSankey.map((p) => p.parti),
].map((name) => ({ name }));
const idxSankey = Object.fromEntries(noeudsSankey.map((n, i) => [n.name, i]));
const liensSankey = [
  ["Pop. du Québec", "Électeurs inscrits", INSCRITS],
  ["Pop. du Québec", NON_INSCRITS, POPULATION - INSCRITS],
  ["Électeurs inscrits", "Votes exercés", VOTES_EXERCES],
  ["Électeurs inscrits", "Abstention", INSCRITS - VOTES_EXERCES],
  ["Votes exercés", "Votes valides", VOTES_VALIDES],
  ["Votes exercés", "Bulletins rejetés", VOTES_EXERCES - VOTES_VALIDES],
  ...partisSankey.map((p) => ["Votes valides", p.parti, p.votesN]),
].map(([s, t, v]) => ({ source: idxSankey[s], target: idxSankey[t], value: v }));

const sankeyGen = sankeyMod.sankey().nodeWidth(8).nodePadding(16)
  .nodeSort(null) // garde l'ordre déclaré : partis du plus fort au plus faible
  .extent([[0, 30], [640, 470]]);
const sankeyLayout = sankeyGen({ nodes: noeudsSankey.map((d) => ({ ...d })), links: liensSankey });

// positions x des colonnes : les trois premières resserrées
const xColonnes = [0, 80, 160, 300, 640];
for (const n of sankeyLayout.nodes) {
  n.x0 = xColonnes[n.layer];
  n.x1 = n.x0 + sankeyGen.nodeWidth();
}

const gris = new Set([NON_INSCRITS, "Abstention", "Bulletins rejetés"]);
const couleurNoeud = (name) =>
  gris.has(name) ? SORTIE_NOEUD : couleurParti[name] ?? (name === "Autres" ? SORTIE_NOEUD : VERT_NOEUD);
const valeurM = (v) => (v / 1e6).toFixed(2).replace(".", ",") + " M";

const svgSankey = d3.create("svg")
  .attr("font-family", F_TEXTE).attr("font-size", 12);
svgSankey.append("style").text(
  "@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600&display=swap');"
);

// flux
svgSankey.append("g").selectAll("path").data(sankeyLayout.links).join("path")
  .attr("d", sankeyMod.sankeyLinkHorizontal())
  .attr("fill", "none")
  .attr("stroke", (d) => gris.has(d.target.name) ? SORTIE_FLUX
    : couleurParti[d.target.name] ?? VERT_FLUX)
  .attr("stroke-opacity", (d) => couleurParti[d.target.name] ? 0.5 : 1)
  .attr("stroke-width", (d) => Math.max(1, d.width));

// nœuds
svgSankey.append("g").selectAll("rect").data(sankeyLayout.nodes).join("rect")
  .attr("x", (d) => d.x0).attr("y", (d) => d.y0)
  .attr("width", (d) => d.x1 - d.x0).attr("height", (d) => Math.max(1, d.y1 - d.y0))
  .attr("fill", (d) => couleurNoeud(d.name));

// libellés des étapes (au-dessus) et des sorties (à droite)
svgSankey.append("g").selectAll("text")
  .data(sankeyLayout.nodes.filter((d) => !couleurParti[d.name] && d.name !== "Autres" && d.name !== "Votes valides"))
  .join("text")
  .attr("x", (d) => gris.has(d.name) ? d.x1 + 8 : d.x0)
  .attr("y", (d) => gris.has(d.name) ? (d.y0 + d.y1) / 2 : d.y0 - 6)
  .attr("dy", (d) => gris.has(d.name) ? "0.35em" : null)
  .attr("fill", (d) => gris.has(d.name) ? GRIS : ENCRE)
  .text((d) => `${d.name} : ${valeurM(d.value)}`);

const pct = (x) => Math.round(x * 100) + " %";

// --- colonne des sièges : même échelle que les votes valides (100 % = 100 %) ---
const nVV = sankeyLayout.nodes.find((n) => n.name === "Votes valides");
const H = nVV.y1 - nVV.y0;
const PAD = sankeyGen.nodePadding();
let yS = sankeyLayout.nodes.find((n) => n.name === partis[0].parti).y0;

const gBandes = svgSankey.append("g");
const gLbl = svgSankey.append("g")  // au-dessus des bandes, avec halo
  //.attr("paint-order", "stroke").attr("stroke", "white")
  //.attr("stroke-width", 3).attr("stroke-linejoin", "round");

gLbl.append("text")
  .attr("x", X_SIEGES).attr("y", yS - 10).attr("fill", ENCRE)
  .text(`Sièges : ${TOTAL_SIEGES}`);

for (const p of partis) {
  const n = sankeyLayout.nodes.find((nd) => nd.name === p.parti);
  const h = p.sieges / TOTAL_SIEGES * H;
  const s0 = yS, s1 = yS + h, xm = (n.x1 + X_SIEGES) / 2;
  gBandes.append("path")
    .attr("d", `M${n.x1},${n.y0}C${xm},${n.y0} ${xm},${s0} ${X_SIEGES},${s0}`
             + `L${X_SIEGES},${s1}C${xm},${s1} ${xm},${n.y1} ${n.x1},${n.y1}Z`)
    .attr("fill", p.couleur).attr("fill-opacity", 0.3);
  gBandes.append("rect")
    .attr("x", X_SIEGES).attr("y", s0)
    .attr("width", sankeyGen.nodeWidth()).attr("height", Math.max(1, h))
    .attr("fill", p.couleur);

  // colonne des votes : parti, % des votes, nombre de votes
  const tv = gLbl.append("text")
    .attr("x", n.x1 + 8).attr("y", (n.y0 + n.y1) / 2).attr("dy", "0.35em");
  tv.append("tspan").attr("font-weight", 600).attr("fill", ENCRE).text(p.parti);
  tv.append("tspan").attr("font-weight", 600).attr("fill", ENCRE)
    .text(`  ${pct(p.votesN / VOTES_VALIDES)}`);
  tv.append("tspan").attr("fill", GRIS_FONCE).text(`  ${valeurM(p.votesN)}`);

  // colonne des sièges : % des sièges, nombre de sièges
  const ts = gLbl.append("text")
    .attr("x", X_SIEGES + 16).attr("y", (s0 + s1) / 2).attr("dy", "0.35em");
  ts.append("tspan").attr("font-weight", 600).attr("fill", ENCRE)
    .text(pct(p.sieges / TOTAL_SIEGES));
  ts.append("tspan").attr("fill", GRIS)
    .text(`  ${p.sieges} siège${p.sieges > 1 ? "s" : ""}`);

  yS = s1 + PAD;
}

// « Autres », même format que les partis
const nAutres = sankeyLayout.nodes.find((n) => n.name === "Autres");
const lblAutres = gLbl.append("text")
  .attr("x", nAutres.x1 + 8).attr("y", (nAutres.y0 + nAutres.y1) / 2).attr("dy", "0.35em");
lblAutres.append("tspan").attr("font-weight", 600).attr("fill", GRIS).text("Autres");
lblAutres.append("tspan").attr("font-weight", 600).attr("fill", ENCRE)
  .text(`  ${pct(autresN / VOTES_VALIDES)}`);
lblAutres.append("tspan").attr("fill", GRIS).text(`  ${valeurM(autresN)}`);

svgSankey.attr("viewBox", [0, 0, X_SIEGES + 130, Math.max(480, yS + 10)]);

svgSankey.node();

// %% [markdown]
// ## Voter dans le vide
//
// Dans chaque circonscription, seuls les votes pour la personne gagnante servent à élire quelqu'un. Les autres votes n'ont aucun effet sur la composition de l'Assemblée nationale. En 2026, c'est le cas de 58 % des votes. Aucun des 572 000 votes de la CAQ n'a élu de député.

// %% [javascript]
const resultats = d3.csvParse(await (await fetch("https://gist.githubusercontent.com/essicolo/a524325ee67cbb45f81ff5ae6e3e14c1/raw/6582d5fb07f8a8bc7253ba508db1adbf3d008802/resultats_quebec_1970_2026.csv")).text(), d3.autoType);
const prevision = await (await fetch("https://gist.githubusercontent.com/essicolo/7783201178c93ebf0a811fd1041be91f/raw/daddbd30fb02430dbb602cdac4c7ecf4fda200d6/prevision_2030.json")).json();

const COULEURS = { PQ: "#1d4ed8", PLQ: "#d62728", PCQ: "#8b5cf6", CAQ: "#0891b2", QS: "#ea7c0c", Autres: "#a8a29e" };
// Sigles des partis. Avant 2012, les données nomment les partis au long.
const SIGLES = {
  LIB: "PLQ", AUTRES: "Autres", Parti_liberal: "PLQ", Parti_quebecois: "PQ", Union_nationale: "UN",
  Action_democratique_du_quebec: "ADQ", Coalition_avenir_quebec: "CAQ", Quebec_solidaire: "QS",
  Ralliement_creditiste: "RC", Parti_egalite: "PÉ",
};
const sigle = (p) => SIGLES[p] ?? p;
const nombre = (x, d = 0) => x.toLocaleString("fr-CA", { minimumFractionDigits: d, maximumFractionDigits: d });
// Arrondi à deux chiffres significatifs : 33 736 devient 34 000.
const arrondi = (x) => { const pas = 10 ** (Math.floor(Math.log10(x)) - 1); return Math.round(x / pas) * pas; };

// Date d'élection au format AAAA-MM-JJ.
const jour = (x) => (x instanceof Date ? x.toISOString() : String(x)).slice(0, 10);
// Résultats d'une élection par circonscription : votes de chaque parti, gagnant, écart avec le deuxième.
function circonscriptions(election) {
  const parCirc = d3.rollup(resultats.filter((r) => jour(r.election) === election),
    (v) => Object.fromEntries(d3.rollups(v, (w) => d3.sum(w, (x) => +x.votes), (x) => x.parti)),
    (r) => r.circonscription);
  return [...parCirc].map(([nom, votes]) => {
    const tri = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    return { nom, votes, gagnant: tri[0][0], ecart: tri[0][1] - (tri[1]?.[1] ?? 0), total: d3.sum(tri, (t) => t[1]) };
  });
}
const circ2026 = circonscriptions("2026-10-05");

// Votes qui ont élu quelqu'un et votes qui n'ont élu personne, par parti.
const elus2026 = ["PQ", "LIB", "PCQ", "CAQ", "QS"].map((p) => {
  const total = d3.sum(circ2026, (c) => c.votes[p] ?? 0);
  const utiles = d3.sum(circ2026.filter((c) => c.gagnant === p), (c) => c.votes[p]);
  return { parti: sigle(p), total, utiles, perdus: total - utiles };
});
const partPerdue = 1 - d3.sum(circ2026, (c) => c.votes[c.gagnant]) / d3.sum(circ2026, (c) => c.total);

// %% [javascript]
Plot.plot({
  width: 760, height: 230, marginLeft: 50, marginRight: 100,
  x: { label: "votes (millions)", transform: (x) => x / 1e6, grid: true },
  y: { label: null, domain: elus2026.map((d) => d.parti) },
  color: { domain: ["a élu une ou un député", "n'a élu personne"], range: ["#44403c", "#d6d3d1"], legend: true },
  marks: [
    Plot.barX(elus2026.flatMap((d) => [
      { parti: d.parti, type: "a élu une ou un député", votes: d.utiles },
      { parti: d.parti, type: "n'a élu personne", votes: d.perdus },
    ]), Plot.stackX({ y: "parti", x: "votes", fill: "type", inset: 1 })),
    Plot.text(elus2026, { y: "parti", x: "total", text: (d) => `${nombre(100 * d.perdus / d.total)} % sans élu`, dx: 6, textAnchor: "start", fontSize: 12 }),
  ],
  //caption: `Gris : votes pour une personne qui n'a pas été élue, soit environ ${nombre(100 * partPerdue)} % des votes de 2026.`,
})

// %% [markdown]
// Un parti perd d'autant plus de votes qu'il arrive deuxième ou troisième dans beaucoup de circonscriptions. Les trois quarts des votes de Québec solidaire n'ont élu personne, contre un peu plus du tiers de ceux du PQ.

// %% [markdown]
// ## Le Québec parmi d'autres pays

// %% [markdown]
// Les politicologues aiment bien avoir des indicateurs de distorsion du vote. L'indice de Gallagher (non, pas en l'honneur de Brendan), $\sqrt{½ Σ (vᵢ − sᵢ)²}$, mesure l'écart entre parts de votes et parts de sièges. Plus l'indice est élevé, plus il y a d'écart entre les deux. Wikipédia répertorie les indices de Gallagher un peu partout dans le monde. Comment se situe le Québec ?

// %% [javascript]
const gallagherMonde = [ // de Wikipedia
  { label: "Québec 2026",       g: 17.80, type: "qc" },
  { label: "Québec 2022",       g: 25.80, type: "qc" },
  { label: "Québec 2018",       g: 17.93, type: "qc" },
  { label: "Sainte-Lucie 2025", g: 30.22, type: "monde" },
  { label: "Royaume-Uni 2024",  g: 23.73, type: "monde" },
  { label: "Australie 2025",    g: 23.11, type: "monde" },
  { label: "France 2024",       g: 7.79,  type: "monde" },
  { label: "Allemagne 2025",    g: 6.49,  type: "monde" },
  { label: "Canada 2025",       g: 5.01,  type: "monde" },
  { label: "N.-Zélande 2023",   g: 2.63,  type: "monde" },
  { label: "États-Unis 2024",   g: 1.01,  type: "monde" },
  { label: "Suède 2022",        g: 0.64,  type: "monde" },
  { label: "Danemark 2026",     g: 0.42,  type: "monde" },
];

Plot.plot({
  height: 420,
  width: 760,
  marginLeft: 150,
  marginBottom: 55,
  style: { fontSize: "13px", fontFamily: "system-ui" },
  x: { label: "indice de Gallagher", grid: true, domain: [0, 32], labelAnchor: "center", labelOffset: 45 },
  y: {
    label: null,
    domain: gallagherMonde.slice().sort((a, b) => b.g - a.g).map((d) => d.label),
  },
  marks: [
    Plot.barX(gallagherMonde, {
      y: "label", x: "g",
      fill: (d) => d.label === "Québec 2026" ? "#2B50C8" : d.type === "qc" ? "#8FA6E0" : "#c9c9c9",
    }),
    Plot.text(gallagherMonde, {
      y: "label", x: "g", dx: 6, textAnchor: "start",
      text: (d) => d.g.toFixed(1).replace(".", ","), fill: "#444", fontSize: 11,
    }),
  ]
});

// %% [markdown]
// Les pays qui votent à la proportionnelle ont des indices plus faibles. En Allemagne, un parti n'obtient de sièges au *Bundestag* que s'il recueille au moins 5 % des votes, (sauf exceptions, me dit-on). En 2025, environ 14 % des votes sont allés à des partis sous ce seuil, d'où un indice plus élevé. Pour la *Chambre des représentants* des États-Unis, la plupart des États élisent une personne par circonscription, comme au Québec. Presque tous les votes vont à deux partis, et les sièges suivent à peu près les votes. Le Québec vit dans la zone des scrutins majoritaires les plus distordus. L'effet *CAQ : 0* n'est toutefois pas un cas exceptionnel : en 2022, le PCQ a lui aussi obtenu environ 13 % des votes, et aucun siège. Inversement, lors des élections de 2022, la CAQ a encore été davantage avantagée par la distorsion que l'a été le PQ en 2026.

// %% [markdown]
// ## L'élection de 2026 à la proportionnelle
//
// À la proportionnelle, chaque parti reçoit une part des sièges égale à sa part des votes [1]. La figure suivante montre ce qu'auraient donné les votes de 2026.

// %% [javascript] #collapse-cell
// Répartition des 127 sièges à la proportionnelle selon les votes de 2026 (méthode de Sainte-Laguë, sans seuil).
function sainteLague(votes, sieges) {
  const s = Object.fromEntries(Object.keys(votes).map((p) => [p, 0]));
  for (let i = 0; i < sieges; i++) {
    let meilleur = null, quotient = -1;
    for (const p in votes) {
      const q = votes[p] / (2 * s[p] + 1);
      if (q > quotient) { quotient = q; meilleur = p; }
    }
    s[meilleur]++;
  }
  return s;
}
// Pouvoir de pivot : part des coalitions majoritaires où le parti est indispensable.
function banzhaf(sieges, majorite) {
  const partis = Object.keys(sieges).filter((p) => sieges[p] > 0);
  const pivots = partis.map(() => 0);
  for (let m = 1; m < 1 << partis.length; m++) {
    let t = 0;
    partis.forEach((p, i) => { if (m >> i & 1) t += sieges[p]; });
    if (t < majorite) continue;
    partis.forEach((p, i) => { if (m >> i & 1 && t - sieges[p] < majorite) pivots[i]++; });
  }
  const total = d3.sum(pivots);
  return Object.fromEntries(partis.map((p, i) => [p, pivots[i] / total]));
}
const SIEGES = 127, MAJORITE = 64;
const votes2026 = Object.fromEntries(["PQ", "LIB", "PCQ", "CAQ", "QS"].map((p) => [sigle(p), d3.sum(circ2026, (c) => c.votes[p] ?? 0)]));
const siegesActuels = d3.rollup(circ2026, (v) => v.length, (c) => sigle(c.gagnant));
const siegesProportionnels = sainteLague(votes2026, SIEGES);
const pivotActuel = banzhaf(Object.fromEntries(siegesActuels), MAJORITE);
const pivotProportionnel = banzhaf(siegesProportionnels, MAJORITE);
const comparaison = Object.keys(votes2026).map((p) => ({
  parti: p,
  "votes (%)": 100 * votes2026[p] / d3.sum(circ2026, (c) => c.total),
  "sièges actuels": siegesActuels.get(p) ?? 0,
  "sièges à la proportionnelle": siegesProportionnels[p],
  "pouvoir de pivot actuel (%)": 100 * (pivotActuel[p] ?? 0),
  "pouvoir de pivot à la proportionnelle (%)": 100 * (pivotProportionnel[p] ?? 0),
}));

// %% [javascript]
Plot.plot({
  width: 760,
  height: 46 * comparaison.length + 50,
  marginLeft: 62,
  marginRight: 62,
  x: { label: "sièges", domain: [0, 70], grid: true },
  y: { domain: comparaison.map((d) => d.parti), label: null },
  marks: [
    Plot.ruleX([MAJORITE], { stroke: "#000", strokeDasharray: "3,3" }),
    Plot.arrow(comparaison, {
      x1: "sièges actuels", x2: "sièges à la proportionnelle", y1: "parti", y2: "parti",
      stroke: (d) => COULEURS[d.parti], strokeWidth: 2, headLength: 5,
    }),
    Plot.dot(comparaison, { x: "sièges actuels", y: "parti", fill: (d) => COULEURS[d.parti], r: 4 }),
    // Étiquettes : sièges actuels près du point, sièges à la proportionnelle après la pointe.
    ...(() => {
      const actuel = (r) => `${r["sièges actuels"]} sièges`;
      const prop = (r) => `${r["sièges à la proportionnelle"]} à la proportionnelle`;
      const ecart = (r) => r["sièges à la proportionnelle"] - r["sièges actuels"];
      const wide = comparaison.filter((r) => Math.abs(ecart(r)) >= 3);
      const tight = comparaison.filter((r) => Math.abs(ecart(r)) < 3);
      const right = wide.filter((r) => ecart(r) > 0);
      const left = wide.filter((r) => ecart(r) < 0);
      const rightFar = right.filter((r) => r["sièges actuels"] >= 12);
      const rightEdge = right.filter((r) => r["sièges actuels"] < 12);
      const leftFar = left.filter((r) => r["sièges à la proportionnelle"] >= 8);
      const leftEdge = left.filter((r) => r["sièges à la proportionnelle"] < 8);
      const TXT = { fontSize: 11, fill: "#333", y: "parti" };
      return [
        Plot.text(rightFar, { ...TXT, x: "sièges actuels", text: actuel, dx: -9, textAnchor: "end" }),
        Plot.text(rightEdge, { ...TXT, x: "sièges actuels", text: actuel, dx: -4, dy: -12, textAnchor: "start" }),
        Plot.text(right, { ...TXT, x: "sièges à la proportionnelle", text: prop, dx: 11, textAnchor: "start" }),
        Plot.text(left, { ...TXT, x: "sièges actuels", text: actuel, dx: 9, textAnchor: "start" }),
        Plot.text(leftFar, { ...TXT, x: "sièges à la proportionnelle", text: prop, dx: -11, textAnchor: "end" }),
        Plot.text(leftEdge, { ...TXT, x: "sièges à la proportionnelle", text: prop, dx: -4, dy: -12, textAnchor: "start" }),
        Plot.text(tight, { ...TXT, x: (r) => Math.max(r["sièges actuels"], r["sièges à la proportionnelle"]), text: prop, dx: 10, dy: -7, textAnchor: "start" }),
        Plot.text(tight, { ...TXT, x: (r) => Math.max(r["sièges actuels"], r["sièges à la proportionnelle"]), text: actuel, dx: 10, dy: 7, textAnchor: "start" }),
      ];
    })(),
  ],
  //caption: "Point : sièges obtenus en 2026. Pointe de la flèche : sièges avec les mêmes votes répartis à la proportionnelle. Pointillé : majorité de 64 sièges.",
})

// %% [javascript]
comparaison.map((d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, typeof v === "number" ? Math.round(v * 10) / 10 : v])))

// %% [markdown]
// Aucun parti n'aurait la majorité de 64 sièges. Une seule paire de partis l'atteindrait : le PQ et le PLQ, avec 67 sièges. Toutes les autres coalitions demanderaient trois partis.
//
// Le pouvoir de pivot mesure le poids d'un parti dans ces coalitions. C'est la part des coalitions majoritaires qui perdent leur majorité sans lui [2]. Avec les sièges réels, le PQ détient la moitié de ce pouvoir, puisque l'appui d'un seul autre parti lui suffit. À la proportionnelle, le PQ et le PLQ en auraient chacun un peu moins de 30 %, et la CAQ passerait de zéro à environ 14 %.

// %% [markdown]
// ## Ton vote change-t-il quelque chose ?
//
// Un vote change le résultat d'une circonscription seulement s'il brise une égalité. Depuis 1970, l'élection la plus serrée a été celle de Hull, en 1976, gagnée par 2 voix. En 2026, Vachon a été gagnée par 10 voix.

// %% [javascript] #collapse-cell
// Écart entre les deux premiers dans chaque circonscription, de 1970 à 2026.
const elections = [...new Set(resultats.map((r) => jour(r.election)))].sort();
const luttes = elections.flatMap((e) => circonscriptions(e).map((c) => ({ ...c, annee: +e.slice(0, 4) })));
// Chance d'une égalité parfaite : la part des écarts de moins de 100 voix, divisée par 100.
const serrees = luttes.filter((c) => c.ecart < 100);
const probabiliteEgalite = serrees.length / (100 * luttes.length);

// %% [javascript] #collapse-cell
d3.sort(luttes, (c) => c.ecart).slice(0, 10).map((c) => ({
  année: String(c.annee), circonscription: c.nom, gagnant: sigle(c.gagnant), "écart (voix)": c.ecart, "votes valides": c.total,
}))

// %% [javascript] #collapse-cell
Plot.plot({
  width: 640, height: 240,
  x: { type: "log", domain: [1, 50000], label: "écart entre les deux premiers (voix, échelle logarithmique)", grid: true, ticks: [1, 10, 100, 1000, 10000], tickFormat: (x) => nombre(x) },
  y: { label: "circonscriptions", grid: true },
  marks: [
    Plot.rectY(luttes.filter((c) => c.ecart >= 1), Plot.binX({ y: "count" }, {
      x: "ecart", thresholds: d3.range(0, 4.8, 0.1).map((e) => 10 ** e), fill: "#a8a29e", inset: 0.5,
    })),
    Plot.ruleX([100], { stroke: "#1c1917", strokeDasharray: "3,3" }),
    Plot.text([100], { x: (d) => d, frameAnchor: "top", dx: 6, textAnchor: "start", text: () => "100 voix", fontSize: 11 }),
    Plot.ruleY([0]),
  ],
  //caption: `Écart entre les deux premiers dans ${nombre(luttes.length)} circonscriptions, élections de 1970 à 2026. À gauche du pointillé, les ${serrees.length} gagnées par moins de 100 voix.`,
})

// %% [markdown]
// Sur près de 2 000 circonscriptions depuis 1970, 25 ont été gagnées par moins de 100 voix. Une égalité parfaite dans une circonscription arrive environ une fois sur 7 800 élections [3].
//
// La prévision Votoscope pour 2030 permet le même calcul pour chaque circonscription. La chance qu'un vote décide du gagnant dépend de l'écart prévu entre les deux premiers et du nombre d'électeurs [4].

// %% [javascript] #collapse-cell
// Chance qu'un seul vote change le gagnant de chaque circonscription en 2030.
// Méthode : note [4] à la fin du billet.
function qnorm(p) { // inverse de la loi normale
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12), r = q < 0.5 ? q : 1 - q;
  let x;
  if (r < 0.02425) { const t = Math.sqrt(-2 * Math.log(r)); x = (((((c[0] * t + c[1]) * t + c[2]) * t + c[3]) * t + c[4]) * t + c[5]) / ((((d[0] * t + d[1]) * t + d[2]) * t + d[3]) * t + 1); }
  else { const t = r - 0.5, u = t * t; x = (((((a[0] * u + a[1]) * u + a[2]) * u + a[3]) * u + a[4]) * u + a[5]) * t / (((((b[0] * u + b[1]) * u + b[2]) * u + b[3]) * u + b[4]) * u + 1); x = -x; }
  return q < 0.5 ? -x : x;
}
const deuxPremiers = prevision.circonscriptions.map((c) => {
  const [[p1], [p2]] = Object.entries(c.parts).sort((a, b) => b[1] - a[1]);
  const m = c.parts[p1] - c.parts[p2];
  const p = c.victoire[p1] / Math.max(c.victoire[p1] + c.victoire[p2], 1e-9);
  const mesurable = p > 0.02 && p < 0.98 && Math.abs(qnorm(p)) > 0.05;
  return { c, p1, p2, m, s: mesurable ? m / qnorm(p) : null };
});
const ecartTypeMedian = d3.median(deuxPremiers.filter((d) => d.s > 0), (d) => d.s);
const densite = (m, s) => Math.exp(-((m / s) ** 2) / 2) / (Math.sqrt(2 * Math.PI) * s);
const decisif = deuxPremiers.map(({ c, p1, p2, m, s }) => ({
  nom: c.nom, premier: sigle(p1), deuxieme: sigle(p2), electeurs: c.votes2026,
  probabilite: densite(m, s > 0 ? s : ecartTypeMedian) / c.votes2026,
}));
// À la proportionnelle, un siège pour environ 34 000 votes : la même chance pour tout le monde.
const proportionnel = SIEGES / d3.sum(prevision.circonscriptions, (c) => c.votes2026);
const unSur = (p) => `1 sur ${nombre(arrondi(1 / p))}`;
// Sous ce seuil, la circonscription est considérée comme sûre.
const PLANCHER = 1e-7;
const sures = decisif.filter((d) => d.probabilite < PLANCHER).length;

// %% [javascript] #collapse-cell
Plot.plot({
  width: 640, height: 300, marginTop: 30, marginLeft: 20, marginRight: 20,
  x: {
    type: "log", domain: [PLANCHER, 1e-3], label: "chance qu'un vote décide du gagnant (échelle logarithmique)",
    grid: true, ticks: [1e-7, 1e-6, 1e-5, 1e-4, 1e-3], tickFormat: (p) => (p === PLANCHER ? "< 1/10 M" : `1/${nombre(1 / p)}`),
  },
  y: { axis: null },
  marks: [
    Plot.ruleX([proportionnel], { stroke: "#1c1917", strokeDasharray: "3,3" }),
    Plot.text([proportionnel], { x: (d) => d, frameAnchor: "top", dy: -18, text: () => "proportionnelle", fontSize: 11 }),
    Plot.dot(decisif, Plot.dodgeY({
      x: (d) => Math.max(d.probabilite, PLANCHER), r: 3.5, fill: (d) => COULEURS[d.premier],
      title: (d) => `${d.nom} : ${unSur(d.probabilite)} (${d.premier} devant ${d.deuxieme})`,
    })),
  ],
  //caption: `Un point par circonscription, coloré selon le parti en tête dans la prévision pour 2030. Plus le point est à droite, plus un vote compte. La plus serrée : ${d3.greatest(decisif, (d) => d.probabilite).nom}, environ ${unSur(d3.max(decisif, (d) => d.probabilite))}. À gauche, les ${sures} circonscriptions sûres. Pointillé : à la proportionnelle, environ ${unSur(proportionnel)} pour tout le monde.`,
})

// %% [markdown]
// Dans Ungava, la circonscription la plus serrée et l'une des moins peuplées, cette chance est d'environ 1 sur 4 100. Dans la circonscription médiane, elle est d'environ 1 sur 26 000. Dans 7 circonscriptions, elle est sous 1 sur 10 millions.
//
// À la proportionnelle, un vote change la répartition des sièges environ une fois sur 34 000 [5], un peu moins qu'aujourd'hui en moyenne (environ 1 sur 24 000). Cette chance serait toutefois la même partout. Aujourd'hui, un vote pèse beaucoup plus dans une circonscription serrée que dans une circonscription sûre.

// %% [markdown]
// ## Pourquoi voter quand même
//
// Pour la même raison que le danger n'et pas le risque. Une attaque de requin, c'est dangereux. Mais c'est tellement peu probable (en particulier si en ce moment tu es dans un autobus), que le risque est pratiquement nul. Le risque, c'est la dangeurosité × la probabilité que ça arrive.
//
// Donc une chance sur 26 000 de faire la différence, c'est négligeable. L'enjeu, par contre, touche tout le Québec : des budgets, des lois, tout ça étalé sur quatre ans de gouvernement (le cas d'un gouvernement majoritaire). Plus il y a d'électeurs, plus la probabiilté d'être décisif est petite... mais plus l'enjeu est grand. Les deux effets, multipliés font que voter reste un acte démocratique *raisonnable* pour qui se soucie des autres et de la postérité (Edlin, Gelman et Kaplan, 2007).
//
// Ton vote a aussi un effet déterminé, même si ton choix perd. Chaque année, l'État verse aux partis environ 2 $ par électeur inscrit, soit près de 13 millions de dollars, répartis selon leur part des votes à la dernière élection. Un vote rapporte ainsi environ 3 $ par année à son parti, ou 12 $ sur quatre ans. Une personne peut donner au plus 100 $ par année à un parti.

// %% [javascript] #collapse-cell
const ALLOCATION_PAR_INSCRIT = 1.99;
const allocationTotale = ALLOCATION_PAR_INSCRIT * INSCRITS;
const parVote = allocationTotale / VOTES_VALIDES;
elus2026.map((d) => ({
  parti: d.parti,
  "votes 2026": d.total,
  "élu.es": siegesActuels.get(d.parti) ?? 0,
  "allocation annuelle ($)": Math.round(d.total * parVote),
  "sur quatre ans ($)": Math.round(4 * d.total * parVote),
}))

// %% [markdown]
// La CAQ n'a aucun député, mais ses votes lui rapportent environ 1 700 000 $ par année. Le score d'un parti compte aussi en dehors de l'argent : il influence sa couverture médiatique et sa capacité de recruter des candidat.es.
//
// Le vote stratégique consiste à voter pour bloquer un parti qu'on veut voir perdre. Il ne change le résultat que si ta circonscription est serrée et que ton vote brise une égalité, le même pari minuscule que le vote ordinaire. En revanche, ton parti préféré perd à coup sûr environ 3 $ par année et un peu de son score. À la proportionnelle, le vote stratégique perd presque tout son sens, puisque presque aucun vote n'est perdu.

// %% [markdown]
// ## Pourquoi le mode de scrutin ne change pas
//
// Changer le mode de scrutin demande une loi adoptée par l'Assemblée nationale, et c'est le gouvernement qui la propose. Or le parti au gouvernement est presque toujours celui que le mode de scrutin a avantagé. La proportionnelle figurait au premier programme du Parti québécois, fondé en 1968. René Lévesque n'a jamais réussi à la faire adopter. En 2018, la CAQ s'est engagée avec le PQ, Québec solidaire et le Parti vert à introduire une part de proportionnelle. Une fois au pouvoir, elle a déposé le projet de loi 39 en 2019, puis l'a abandonné en décembre 2021. Aux élections suivantes, elle a obtenu 72 % des sièges avec 41 % des votes.
//
// Le mode de scrutin actuel a de bons arguments. Chaque circonscription a sa députée ou son député, que l'électorat juge directement. Les régions peu peuplées gardent leurs élu.es, une crainte réelle avec une proportionnelle à listes. Un gouvernement qui perd l'appui de la population peut aussi perdre beaucoup de sièges d'un coup : la CAQ est passée de 90 sièges en 2022 à aucun en 2026.
//
// D'autres arguments tiennent moins. On dit que le mode actuel produit des gouvernements majoritaires stables, mais le Québec a eu des gouvernements minoritaires en 2007, en 2012 et en 2026. On dit qu'une réforme serait trop compliquée, mais les systèmes mixtes, qui gardent une personne élue par circonscription et ajoutent des sièges répartis selon les votes, fonctionnent en Allemagne, en Nouvelle-Zélande et en Écosse. Le projet de loi 39 en proposait un, avec 80 sièges de circonscription et 45 sièges régionaux. On dit enfin que la proportionnelle ouvrirait la porte aux petits partis extrêmes, mais un seuil, comme les 5 % allemands, limite l'entrée des très petits partis.
//
// Lors du débat des chefs de Radio-Canada, le candidat du Parti québécois, maintenant premier ministre élu, s'est engagé à réformer le mode de scrutin, sans donner plus de détails.

// %% [markdown]
// -----
//
// ### Notes
//
// [1] La répartition proportionnelle donne les 127 sièges aux cinq grands partis selon leurs votes de 2026, sans seuil (méthode de Sainte-Laguë). Les autres partis, environ 1 % des votes, n'ont aucun siège.
//
// [2] Le pouvoir de pivot d'un parti est la part des coalitions de 64 sièges ou plus qui perdent leur majorité sans lui (indice de Banzhaf).
//
// [3] De 1970 à 2026, 25 circonscriptions sur 1 946 ont été gagnées par moins de 100 voix. Si ces écarts se répartissent également entre 0 et 100 voix, une égalité parfaite arrive environ une fois sur 7 800.
//
// [4] La chance qu'un vote décide du gagnant en 2030 se calcule à partir de l'écart prévu entre les deux premiers et de l'incertitude sur cet écart, tirée de la probabilité de victoire. Quand la prévision est presque certaine, on prend l'incertitude typique des autres circonscriptions.
//
// [5] À la proportionnelle, 4 282 551 votes valides pour 127 sièges donnent un siège par tranche d'environ 34 000 votes. Un vote change donc un siège environ une fois sur 34 000.

// %% [markdown]
// -----
//
// ### Sources
//
// - Résultats : Élections Québec, résultats officiels des élections générales de 2018, 2022 et 2026.
// - Population : Institut de la statistique du Québec, *Le bilan démographique du Québec*, édition 2026.
// - Indices de Gallagher hors Québec : Wikipédia.
// - Allemagne 2025 : résultats officiels du Bundestag, environ 14 % des votes sans élu.
// - Chance qu'un vote soit décisif : A. Gelman, N. Silver et A. Edlin, « What is the probability your vote will make a difference? », *Economic Inquiry*, 2012.
// - Le vote comme choix rationnel pour le bien des autres : A. Edlin, A. Gelman et N. Kaplan, « Voting as a rational choice », *Rationality and Society*, 2007.
// - Le paradoxe du vote : A. Downs, *An Economic Theory of Democracy*, 1957, et W. Riker et P. Ordeshook, *American Political Science Review*, 1968.
// - Vote stratégique et mode de scrutin : M. Duverger, *Les partis politiques*, 1951, et G. Cox, *Making Votes Count*, 1997.
// - Financement des partis : Élections Québec, allocation annuelle aux partis autorisés (1,99 $ par électeur inscrit en 2026) et contribution maximale de 100 $ par parti et par année.
// - Prévision 2030 : Votoscope, prévision du 13 octobre 2026.
// - Projet de loi 39, *Loi établissant un nouveau mode de scrutin*, Assemblée nationale du Québec, 2019 : 80 sièges de circonscription et 45 sièges régionaux.
// - Réforme du mode de scrutin : la proportionnelle figurait au premier programme du Parti québécois, fondé en 1968. René Lévesque, Jean Charest et François Legault ont promis une réforme, puis reculé. Le projet de loi 39, déposé en 2019, a été abandonné en décembre 2021. Voir J. Verville, *La réforme du mode de scrutin au Québec*, 2020, et *Options politiques*, « Pour une réforme du système électoral au Québec sans référendum », février 2021.

// %% [javascript]