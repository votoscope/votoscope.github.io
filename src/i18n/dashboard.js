// Fixed headings and notes of the dashboards.
export const DASHBOARD = {
  fr: {
    trend: "Tendance des intentions de vote",
    forecast: (map) => `Prévision par circonscription (carte ${map})`,
    tiles: "Tuiles", geo: "Carte géographique",
    selected: "Circonscription sélectionnée",
    closest: "Circonscriptions les plus serrées",
    closestNote: "Circonscriptions classées par écart prévu entre le favori et son poursuivant. La sélection d'une ligne ou d'une case de la carte met à jour la fiche.",
    leaders: "Circonscriptions des chefs",
    seats: "Distribution des sièges",
    scenarios: "Scénarios de gouvernement",
    balance: "Balance du pouvoir",
    distortion: "Votes et sièges : la distorsion du scrutin",
  },
  en: {
    trend: "Trend in voting intentions",
    forecast: (map) => `Forecast by riding (${map} map)`,
    tiles: "Tiles", geo: "Geographic map",
    selected: "Selected riding",
    closest: "Closest races",
    closestNote: "Ridings ranked by forecast gap between the favourite and the runner-up. Selecting a row or a map cell updates the riding panel.",
    leaders: "Leaders' ridings",
    seats: "Seat distribution",
    scenarios: "Government scenarios",
    balance: "Balance of power",
    distortion: "Votes and seats: the distortion of the electoral system",
  },
};
