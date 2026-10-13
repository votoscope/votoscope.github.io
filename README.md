# votoscope.github.io

Site de Votoscope (https://votoscope.github.io) : accueil, tableaux de bord des modèles, méthode, à propos.

Site statique Astro. Les tableaux de bord lisent les projections publiées par les dépôts des modèles
([votoscope/quebec](https://github.com/votoscope/quebec), [votoscope/canada](https://github.com/votoscope/canada)).

```
npm install
npm run donnees-locales   # copie les données des dépôts voisins (../quebec, ../canada) pour le développement
npm run dev
npm run build
```

Publication : action GitHub `.github/workflows/deploy.yml` à chaque poussée sur `main` (Pages : source « GitHub Actions »).

Licence : GNU GPL v3 (`LICENSE`).
