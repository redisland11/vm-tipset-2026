// tools/team-map.js
// Mappar Expekts lagnamn → svenska namn som matchar matches.js MATCHES-arrayen.
// Lägg till nya entries när verktyget rapporterar "Hittade inte X" vid första körningen.

const TEAM_MAP = {
  // Kalibrerat mot Expekts faktiska namngivning (2026-05-21)
  "DR Kongo": "Kongo-Kinshasa",
  "Curacao": "Curaçao",
  // Behållna för säkerhet (alternativa stavningar Expekt kan börja använda)
  "Bosnien-Hercegovina": "Bosnien och Hercegovina",
  "Demokratiska republiken Kongo": "Kongo-Kinshasa",
};

function normalizeTeam(name) {
  return TEAM_MAP[String(name).trim()] || String(name).trim();
}
