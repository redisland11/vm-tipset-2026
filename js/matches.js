const MATCHES = [
  { round: 1, group: "A", date: "2026-06-11", home: "Mexiko", away: "Sydafrika", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "A", date: "2026-06-11", home: "Sydkorea", away: "Tjeckien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "B", date: "2026-06-12", home: "Kanada", away: "Bosnien och Hercegovina", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "B", date: "2026-06-13", home: "Qatar", away: "Schweiz", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "C", date: "2026-06-13", home: "Brasilien", away: "Marocko", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "C", date: "2026-06-13", home: "Haiti", away: "Skottland", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "D", date: "2026-06-12", home: "USA", away: "Paraguay", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "D", date: "2026-06-13", home: "Australien", away: "Turkiet", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "E", date: "2026-06-14", home: "Tyskland", away: "Curaçao", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "E", date: "2026-06-14", home: "Elfenbenskusten", away: "Ecuador", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "F", date: "2026-06-14", home: "Nederländerna", away: "Japan", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "F", date: "2026-06-14", home: "Sverige", away: "Tunisien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "G", date: "2026-06-15", home: "Belgien", away: "Egypten", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "G", date: "2026-06-15", home: "Iran", away: "Nya Zeeland", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "H", date: "2026-06-15", home: "Spanien", away: "Kap Verde", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "H", date: "2026-06-15", home: "Saudiarabien", away: "Uruguay", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "I", date: "2026-06-16", home: "Frankrike", away: "Senegal", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "I", date: "2026-06-16", home: "Irak", away: "Norge", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "J", date: "2026-06-16", home: "Argentina", away: "Algeriet", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "J", date: "2026-06-16", home: "Österrike", away: "Jordanien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "K", date: "2026-06-17", home: "Portugal", away: "Kongo-Kinshasa", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "K", date: "2026-06-17", home: "Uzbekistan", away: "Colombia", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "L", date: "2026-06-17", home: "England", away: "Kroatien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 1, group: "L", date: "2026-06-17", home: "Ghana", away: "Panama", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "A", date: "2026-06-18", home: "Tjeckien", away: "Sydafrika", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "A", date: "2026-06-18", home: "Mexiko", away: "Sydkorea", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "B", date: "2026-06-18", home: "Schweiz", away: "Bosnien och Hercegovina", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "B", date: "2026-06-18", home: "Kanada", away: "Qatar", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "C", date: "2026-06-19", home: "Skottland", away: "Marocko", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "C", date: "2026-06-19", home: "Brasilien", away: "Haiti", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "D", date: "2026-06-19", home: "USA", away: "Australien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "D", date: "2026-06-19", home: "Turkiet", away: "Paraguay", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "E", date: "2026-06-20", home: "Tyskland", away: "Elfenbenskusten", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "E", date: "2026-06-20", home: "Ecuador", away: "Curaçao", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "F", date: "2026-06-20", home: "Nederländerna", away: "Sverige", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "F", date: "2026-06-20", home: "Tunisien", away: "Japan", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "G", date: "2026-06-21", home: "Belgien", away: "Iran", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "G", date: "2026-06-21", home: "Nya Zeeland", away: "Egypten", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "H", date: "2026-06-21", home: "Spanien", away: "Saudiarabien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "H", date: "2026-06-21", home: "Uruguay", away: "Kap Verde", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "I", date: "2026-06-22", home: "Frankrike", away: "Irak", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "I", date: "2026-06-22", home: "Norge", away: "Senegal", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "J", date: "2026-06-22", home: "Argentina", away: "Österrike", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "J", date: "2026-06-22", home: "Jordanien", away: "Algeriet", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "K", date: "2026-06-23", home: "Portugal", away: "Uzbekistan", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "K", date: "2026-06-23", home: "Colombia", away: "Kongo-Kinshasa", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "L", date: "2026-06-23", home: "England", away: "Ghana", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 },
  { round: 2, group: "L", date: "2026-06-23", home: "Panama", away: "Kroatien", oddsHome: 2.0, oddsDraw: 3.0, oddsAway: 3.0 }
];

function pointsFor(match) {
  return {
    home: Math.round(match.oddsHome * 100),
    draw: Math.round(match.oddsDraw * 100),
    away: Math.round(match.oddsAway * 100)
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
