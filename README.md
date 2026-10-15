# votovision.github.io

Votovision site (https://votovision.github.io): home page, model dashboards, method, about and posts, in
French (`/fr/`) and English (`/en/`).

Static Astro site. The dashboards read the projections published by the model repositories
([votovision/quebec](https://github.com/votovision/quebec), [votovision/canada](https://github.com/votovision/canada)).

```
npm install
npm run local-data   # copies data from the neighbouring repositories (../quebec, ../canada) for development
npm run dev          # builds the posts, then starts the dev server
npm run build        # builds the posts, then the site
```

## Layout

- `src/pages/`: routes, the same path in each language under `/fr/` and `/en/` (`/fr/quebec/`,
  `/en/quebec/`, `/fr/posts/`, …). The root redirects to the browser's language, French by default.
- `src/components/pages/`: page bodies, one component per page, taking `lang`.
- `src/components/*Dashboard.astro` and `src/components/methodology/`: dashboards and their methodology.
- `src/i18n/`: routes and fixed strings per language.
- `src/scripts/`: client scripts (`dashboard.js`, `home.js`, `parties.js`).
- `posts/<lang>/<slug>/`: one folder per post, published at `/<lang>/posts/<slug>/`:
  `index.html` (Observable Notebook Kit notebook, `<notebook>` format, with a `<title>` and a
  `<meta name="date" content="YYYY-MM-DD">`, optionally `<meta name="author" content="…">`), `source.js` (the authoring source, not built) and any
  attached images. Data files shared by the languages of a post live in `posts/data/<slug>/` and are
  read from GitHub by absolute URL, not served by the site. Each language lists only its own posts; a post naming its
  translation (`<meta name="translation" content="/en/posts/<slug>/">`) links to it from the language switch.
- `templates/post-fr.html`, `templates/post-en.html`: the site template applied to posts.
- `scripts/render-post.mjs posts/<lang>/<slug>`: renders a post's `index.html` from its `source.js`
  (front matter `// title:`, `// date:`, optional `// author:` and `// translation:`; cells `// %% [markdown]` and
  `// %% [javascript]`).

## Publishing

GitHub Action `.github/workflows/deploy.yml` on every push to `main` (Pages source: "GitHub Actions").

Licence: GNU GPL v3 (`LICENSE`).
