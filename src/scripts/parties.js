// Party colours and labels, shared by the dashboards and the home page.
// The palette is validated as a set (dataviz validate_palette.js, all pairs,
// light surface): same hue per party family across both elections.
export const PARTIES = {
  qc: {
    colors: { PQ: "#1d4ed8", LIB: "#d62728", PCQ: "#8b5cf6", CAQ: "#0891b2", QS: "#ea7c0c", AUTRES: "#a8a29e" },
    labels: { fr: { LIB: "PLQ", AUTRES: "Autres" }, en: { LIB: "QLP", PCQ: "CPQ", AUTRES: "Others" } },
  },
  ca: {
    colors: { LPC: "#d62728", CPC: "#1d4ed8", NDP: "#ea7c0c", BQ: "#0891b2", GPC: "#15803d", PPC: "#8b5cf6", AUTRES: "#a8a29e" },
    labels: { fr: { LPC: "PLC", CPC: "PCC", NDP: "NPD", GPC: "PV", AUTRES: "Autres" }, en: { AUTRES: "Others" } },
  },
  bc: {
    colors: { NDP: "#ea7c0c", CON: "#1d4ed8", GRN: "#15803d", BCU: "#d62728", ONEBC: "#8b5cf6", CENTRE: "#0891b2", AUTRES: "#a8a29e" },
    labels: {
      fr: { NDP: "NPD", CON: "Cons.", GRN: "Verts", BCU: "BC United", ONEBC: "OneBC", CENTRE: "CentreBC", AUTRES: "Autres" },
      en: { CON: "Con.", GRN: "Green", BCU: "BC United", ONEBC: "OneBC", CENTRE: "CentreBC", AUTRES: "Others" },
    },
  },
};

/** Data folder of a model repository: local copy in development, published repository otherwise. */
export const repoData = (repo) => (import.meta.env.DEV ? `/data/${repo}/` : `https://raw.githubusercontent.com/votovision/${repo}/main/data/`);

/** Language of the page (<html lang>) and the matching locale. */
export const LANG = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "fr";
export const LOCALE = LANG === "en" ? "en-CA" : "fr-CA";
/** Displayed label of a party in the page's language. */
export const partyLabel = (election, p) => PARTIES[election].labels[LANG][p] ?? p;
/** Number formatted for the language (decimal comma in French). */
export const formatNumber = (x, d = 0) => new Intl.NumberFormat(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
/** Percentage of a proportion: "27,1 %" in French, "27.1%" in English. */
export const formatPercent = (x, d = 0) => `${formatNumber(x * 100, d)}${LANG === "en" ? "%" : " %"}`;
