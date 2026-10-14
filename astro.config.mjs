// @ts-check
import { defineConfig } from "astro/config";

// Posts are built into public/<lang>/posts/<slug>/index.html. GitHub Pages
// serves a folder's index.html; the dev server only serves public files by
// exact path, so this rule does the same in development.
const postIndex = {
  name: "post-index",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/(fr|en)\/posts\/[^/]+\/$/.test(req.url)) req.url += "index.html";
      next();
    });
  },
};

export default defineConfig({
  site: "https://votoscope.github.io",
  trailingSlash: "always",
  vite: { plugins: [postIndex] },
});
