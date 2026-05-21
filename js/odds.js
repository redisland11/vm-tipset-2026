// tippsida-webb/js/odds.js
// Läser odds.csv vid sidladdning och exponerar oddsFor(match) för matches.js.

let oddsByKey = {};

async function loadOdds() {
  const res = await fetch('odds.csv', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} — odds.csv kunde inte hämtas`);
  const lines = (await res.text()).trim().split('\n');
  if (lines.length < 2) throw new Error('odds.csv är tom');
  const header = lines.shift().split(',');
  const idx = (col) => {
    const i = header.indexOf(col);
    if (i === -1) throw new Error(`Saknad kolumn i odds.csv: ${col}`);
    return i;
  };
  const iRound = idx('round');
  const iHome = idx('home');
  const iAway = idx('away');
  const iOH = idx('oddsHome');
  const iOD = idx('oddsDraw');
  const iOA = idx('oddsAway');

  oddsByKey = {};
  for (const line of lines) {
    const c = line.split(',');
    const key = `${c[iRound]}|${c[iHome]}|${c[iAway]}`;
    oddsByKey[key] = {
      home: parseFloat(c[iOH]),
      draw: parseFloat(c[iOD]),
      away: parseFloat(c[iOA]),
    };
  }
}

function oddsFor(match) {
  return oddsByKey[`${match.round}|${match.home}|${match.away}`];
}
