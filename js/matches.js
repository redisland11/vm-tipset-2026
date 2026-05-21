// Matcher i omgång 1 och 2 av gruppspelet. Datum + tid i SVENSK TID (CEST, UTC+2).
// Källa: en.wikipedia.org grupp-artiklar (kickoff-tider) + venue från vm2026-schema.json.
// Många matcher börjar sent på kvällen eller efter midnatt svensk tid pga arenor i N/S-Amerika.
//
// Odds + poäng kommer från odds.csv (laddas via js/odds.js). Lägg ALDRIG hårdkodade odds här.
const MATCHES = [
  { round: 1, group: "A", date: "2026-06-11", time: "21:00", home: "Mexiko", away: "Sydafrika" },
  { round: 1, group: "A", date: "2026-06-12", time: "04:00", home: "Sydkorea", away: "Tjeckien" },
  { round: 1, group: "B", date: "2026-06-12", time: "21:00", home: "Kanada", away: "Bosnien och Hercegovina" },
  { round: 1, group: "B", date: "2026-06-13", time: "21:00", home: "Qatar", away: "Schweiz" },
  { round: 1, group: "C", date: "2026-06-14", time: "00:00", home: "Brasilien", away: "Marocko" },
  { round: 1, group: "C", date: "2026-06-14", time: "03:00", home: "Haiti", away: "Skottland" },
  { round: 1, group: "D", date: "2026-06-13", time: "03:00", home: "USA", away: "Paraguay" },
  { round: 1, group: "D", date: "2026-06-14", time: "06:00", home: "Australien", away: "Turkiet" },
  { round: 1, group: "E", date: "2026-06-14", time: "19:00", home: "Tyskland", away: "Curaçao" },
  { round: 1, group: "E", date: "2026-06-15", time: "01:00", home: "Elfenbenskusten", away: "Ecuador" },
  { round: 1, group: "F", date: "2026-06-14", time: "22:00", home: "Nederländerna", away: "Japan" },
  { round: 1, group: "F", date: "2026-06-15", time: "04:00", home: "Sverige", away: "Tunisien" },
  { round: 1, group: "G", date: "2026-06-15", time: "21:00", home: "Belgien", away: "Egypten" },
  { round: 1, group: "G", date: "2026-06-16", time: "03:00", home: "Iran", away: "Nya Zeeland" },
  { round: 1, group: "H", date: "2026-06-15", time: "18:00", home: "Spanien", away: "Kap Verde" },
  { round: 1, group: "H", date: "2026-06-16", time: "00:00", home: "Saudiarabien", away: "Uruguay" },
  { round: 1, group: "I", date: "2026-06-16", time: "21:00", home: "Frankrike", away: "Senegal" },
  { round: 1, group: "I", date: "2026-06-17", time: "00:00", home: "Irak", away: "Norge" },
  { round: 1, group: "J", date: "2026-06-17", time: "03:00", home: "Argentina", away: "Algeriet" },
  { round: 1, group: "J", date: "2026-06-17", time: "06:00", home: "Österrike", away: "Jordanien" },
  { round: 1, group: "K", date: "2026-06-17", time: "19:00", home: "Portugal", away: "Kongo-Kinshasa" },
  { round: 1, group: "K", date: "2026-06-18", time: "04:00", home: "Uzbekistan", away: "Colombia" },
  { round: 1, group: "L", date: "2026-06-17", time: "22:00", home: "England", away: "Kroatien" },
  { round: 1, group: "L", date: "2026-06-18", time: "01:00", home: "Ghana", away: "Panama" },
  { round: 2, group: "A", date: "2026-06-18", time: "18:00", home: "Tjeckien", away: "Sydafrika" },
  { round: 2, group: "A", date: "2026-06-19", time: "03:00", home: "Mexiko", away: "Sydkorea" },
  { round: 2, group: "B", date: "2026-06-18", time: "21:00", home: "Schweiz", away: "Bosnien och Hercegovina" },
  { round: 2, group: "B", date: "2026-06-19", time: "00:00", home: "Kanada", away: "Qatar" },
  { round: 2, group: "C", date: "2026-06-20", time: "00:00", home: "Skottland", away: "Marocko" },
  { round: 2, group: "C", date: "2026-06-20", time: "02:30", home: "Brasilien", away: "Haiti" },
  { round: 2, group: "D", date: "2026-06-19", time: "21:00", home: "USA", away: "Australien" },
  { round: 2, group: "D", date: "2026-06-20", time: "05:00", home: "Turkiet", away: "Paraguay" },
  { round: 2, group: "E", date: "2026-06-20", time: "22:00", home: "Tyskland", away: "Elfenbenskusten" },
  { round: 2, group: "E", date: "2026-06-21", time: "02:00", home: "Ecuador", away: "Curaçao" },
  { round: 2, group: "F", date: "2026-06-20", time: "19:00", home: "Nederländerna", away: "Sverige" },
  { round: 2, group: "F", date: "2026-06-21", time: "06:00", home: "Tunisien", away: "Japan" },
  { round: 2, group: "G", date: "2026-06-21", time: "21:00", home: "Belgien", away: "Iran" },
  { round: 2, group: "G", date: "2026-06-22", time: "03:00", home: "Nya Zeeland", away: "Egypten" },
  { round: 2, group: "H", date: "2026-06-21", time: "18:00", home: "Spanien", away: "Saudiarabien" },
  { round: 2, group: "H", date: "2026-06-22", time: "00:00", home: "Uruguay", away: "Kap Verde" },
  { round: 2, group: "I", date: "2026-06-22", time: "23:00", home: "Frankrike", away: "Irak" },
  { round: 2, group: "I", date: "2026-06-23", time: "02:00", home: "Norge", away: "Senegal" },
  { round: 2, group: "J", date: "2026-06-22", time: "19:00", home: "Argentina", away: "Österrike" },
  { round: 2, group: "J", date: "2026-06-23", time: "05:00", home: "Jordanien", away: "Algeriet" },
  { round: 2, group: "K", date: "2026-06-23", time: "19:00", home: "Portugal", away: "Uzbekistan" },
  { round: 2, group: "K", date: "2026-06-24", time: "04:00", home: "Colombia", away: "Kongo-Kinshasa" },
  { round: 2, group: "L", date: "2026-06-23", time: "22:00", home: "England", away: "Ghana" },
  { round: 2, group: "L", date: "2026-06-24", time: "01:00", home: "Panama", away: "Kroatien" },
];

function pointsFor(match) {
  const odds = oddsFor(match);
  if (!odds) return { home: 0, draw: 0, away: 0 };
  return {
    home: Math.round(odds.home * 100),
    draw: Math.round(odds.draw * 100),
    away: Math.round(odds.away * 100)
  };
}

function answerText(match, choice) {
  const p = pointsFor(match);
  if (choice === "1") return `${match.home} ${p.home} p`;
  if (choice === "X") return `Oavgjort ${p.draw} p`;
  if (choice === "2") return `${match.away} ${p.away} p`;
  return "";
}

function formatDate(isoDate) {
  const months = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  const [, m, d] = isoDate.split("-");
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]}`;
}
