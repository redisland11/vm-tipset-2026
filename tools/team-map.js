// tools/team-map.js
// Mappar Expekts lagnamn → svenska namn som matchar matches.js MATCHES-arrayen.
// Lägg till nya entries när verktyget rapporterar "Hittade inte X" vid första körningen.

const TEAM_MAP = {
  // Kända avvikelser (gissning, kalibreras vid första körningen)
  "Bosnien-Hercegovina": "Bosnien och Hercegovina",
  "DR Kongo": "Kongo-Kinshasa",
  "Demokratiska republiken Kongo": "Kongo-Kinshasa",
};

function normalizeTeam(name) {
  return TEAM_MAP[String(name).trim()] || String(name).trim();
}
