// Site pages: the same path in each language, under /fr/ or /en/.
const SLUGS = { home: "", quebec: "quebec/", bc: "british-columbia/", canada: "canada/", posts: "posts/", method: "method/", about: "about/" };
export const PAGES = Object.fromEntries(
  Object.entries(SLUGS).map(([page, slug]) => [page, { fr: `/fr/${slug}`, en: `/en/${slug}` }]),
);

export const NAV = {
  fr: [["quebec", "Québec"], ["bc", "Colombie-Britannique"], ["canada", "Canada"], ["posts", "Billets"], ["method", "Méthode"], ["about", "À propos"]],
  en: [["quebec", "Quebec"], ["bc", "British Columbia"], ["canada", "Canada"], ["posts", "Posts"], ["method", "Method"], ["about", "About"]],
};

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
