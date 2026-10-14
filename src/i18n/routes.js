// Site pages: the same path in each language, under /fr/ or /en/.
const SLUGS = { home: "", quebec: "quebec/", bc: "british-columbia/", canada: "canada/", posts: "posts/", method: "method/", about: "about/" };
export const PAGES = Object.fromEntries(
  Object.entries(SLUGS).map(([page, slug]) => [page, { fr: `/fr/${slug}`, en: `/en/${slug}` }]),
);

// A [label, [group, ...]] entry is a drop-down menu; each group is a list of
// [page, name], separated by a rule (provinces in alphabetical order, then
// the federal level).
export const NAV = {
  fr: [["Prévisions", [[["bc", "Colombie-Britannique"], ["quebec", "Québec"]], [["canada", "Canada"]]]], ["posts", "Billets"], ["method", "Méthode"], ["about", "À propos"]],
  en: [["Forecasts", [[["bc", "British Columbia"], ["quebec", "Quebec"]], [["canada", "Canada"]]]], ["posts", "Posts"], ["method", "Method"], ["about", "About"]],
};

// Date of the next general election, when known: the menu marks an election
// under way (vote within 60 days).
export const ELECTION_DATES = { bc: "2026-10-24", quebec: "2030-10-07" };

export const SITE = {
  fr: {
    description: "Prévisions électorales fondées sur les sondages publics et les résultats passés, à code et données ouverts.",
    footer: "Votoscope est un projet indépendant, sans affiliation partisane ni commanditaire. Code et données ouverts :",
    otherLanguage: "English",
  },
  en: {
    description: "Election forecasts built from public polls and past results, with open code and data.",
    footer: "Votoscope is an independent project, with no partisan affiliation and no sponsor. Open code and data:",
    otherLanguage: "Français",
  },
};

/** Language of a path. */
export function langOf(path) {
  return path === "/en" || path.startsWith("/en/") ? "en" : "fr";
}

/** The same path in the other language. */
export function translationOf(path) {
  const lang = langOf(path), other = lang === "fr" ? "en" : "fr";
  return path.startsWith(`/${lang}/`) ? `/${other}/${path.slice(lang.length + 2)}` : PAGES.home[other];
}
