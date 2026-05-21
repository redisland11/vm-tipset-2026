const SHEET_ID = '1sqFUoS4R071F6EfRZxkwlcwgPrmESzZOCgxchSwa4IE';
const FORMULARSVAR_SHEET = 'Formulärsvar';
const MATCHDATA_SHEET = 'Matchdata';
const TOPPLISTAN_SHEET = 'Topplistan';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (!payload.name || !payload.email || !payload.teamName ||
        !Array.isArray(payload.picks) || payload.picks.length !== 48 ||
        payload.tieBreaker === undefined || payload.tieBreaker === null) {
      return jsonResponse({ success: false, error: 'INVALID_PAYLOAD' });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(FORMULARSVAR_SHEET);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'SHEET_NOT_FOUND' });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const emails = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      const incoming = payload.email.toLowerCase().trim();
      const exists = emails.some(r => r[0] && r[0].toString().toLowerCase().trim() === incoming);
      if (exists) {
        return jsonResponse({ success: false, error: 'EMAIL_EXISTS' });
      }
    }

    const row = [
      new Date(),
      payload.name,
      payload.email,
      payload.teamName,
      ...payload.picks.map(p => p.answerText),
      payload.tieBreaker
    ];

    sheet.appendRow(row);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  const callback = e && e.parameter && e.parameter.callback;
  const action = e && e.parameter && e.parameter.action;

  // Submit via GET med data i URL-parameter (JSONP-vänligt, undviker CORS-bugg)
  if (action === 'submit') {
    return handleSubmit(e, callback);
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // --- Matchdata (48 matcher, A2:P49) ---
    const md = ss.getSheetByName(MATCHDATA_SHEET);
    if (!md) return jsonResponse({ success: false, error: 'MATCHDATA_NOT_FOUND' });
    const mdValues = md.getRange(2, 1, 48, 16).getValues();
    const matches = mdValues.map(r => ({
      round: r[0],
      group: r[1],
      date: r[2] instanceof Date ? Utilities.formatDate(r[2], 'GMT', 'yyyy-MM-dd') : r[2],
      home: r[3],
      away: r[4],
      answer1: r[11],
      answerX: r[12],
      answer2: r[13],
      facit: r[14] ? String(r[14]).trim() : '',
      facitText: r[15] ? String(r[15]).trim() : ''
    }));

    // --- Formulärsvar (alla inlämningar) ---
    const fs = ss.getSheetByName(FORMULARSVAR_SHEET);
    const fsLastRow = fs.getLastRow();
    let submissions = [];
    if (fsLastRow >= 2) {
      const fsValues = fs.getRange(2, 1, fsLastRow - 1, 53).getValues();
      submissions = fsValues.filter(r => r[1]).map(r => ({
        name: String(r[1]),
        email: String(r[2]),
        teamName: String(r[3]),
        picks: r.slice(4, 52).map(v => v ? String(v) : ''),
        tieBreaker: r[52]
      }));
    }

    // --- Topplistan-rankning ---
    const tl = ss.getSheetByName(TOPPLISTAN_SHEET);
    const tlLastRow = tl.getLastRow();
    let ranking = [];
    if (tlLastRow >= 3) {
      const tlValues = tl.getRange(3, 1, tlLastRow - 2, 6).getValues();
      ranking = tlValues.filter(r => r[1]).map(r => ({
        rank: r[0],
        name: String(r[1]),
        teamName: String(r[2]),
        totalPoints: r[3],
        tieBreaker: r[4],
        deviation: r[5]
      }));
    }

    // Slå ihop ranking med picks (matcha på namn + lagnamn)
    const subByKey = {};
    submissions.forEach(s => { subByKey[s.name + '|' + s.teamName] = s; });
    const players = ranking.map(r => {
      const s = subByKey[r.name + '|' + r.teamName];
      return {
        rank: r.rank,
        name: r.name,
        teamName: r.teamName,
        totalPoints: r.totalPoints,
        tieBreaker: r.tieBreaker,
        deviation: r.deviation,
        picks: s ? s.picks : new Array(48).fill('')
      };
    });

    // --- Tipsfördelning per match (count1/X/2) ---
    const distribution = matches.map((m, i) => {
      let c1 = 0, cX = 0, c2 = 0;
      players.forEach(p => {
        const pick = p.picks[i];
        if (!pick) return;
        if (pick === m.answer1) c1++;
        else if (pick === m.answerX) cX++;
        else if (pick === m.answer2) c2++;
      });
      const total = c1 + cX + c2;
      return {
        count1: c1, countX: cX, count2: c2, total: total
      };
    });

    // --- Nästa match: första matchen utan facit ---
    let nextMatchIndex = -1;
    for (let i = 0; i < matches.length; i++) {
      if (!matches[i].facit) { nextMatchIndex = i; break; }
    }

    return jsonResponse({
      success: true,
      matches: matches,
      players: players,
      distribution: distribution,
      nextMatchIndex: nextMatchIndex,
      updatedAt: new Date().toISOString()
    }, callback);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message, stack: err.stack }, callback);
  }
}

function handleSubmit(e, callback) {
  try {
    const payload = JSON.parse(e.parameter.data || '{}');

    if (!payload.name || !payload.email || !payload.teamName ||
        !Array.isArray(payload.picks) || payload.picks.length !== 48 ||
        payload.tieBreaker === undefined || payload.tieBreaker === null) {
      return jsonResponse({ success: false, error: 'INVALID_PAYLOAD' }, callback);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(FORMULARSVAR_SHEET);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'SHEET_NOT_FOUND' }, callback);
    }

    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const emails = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
      const incoming = payload.email.toLowerCase().trim();
      const exists = emails.some(r => r[0] && r[0].toString().toLowerCase().trim() === incoming);
      if (exists) {
        return jsonResponse({ success: false, error: 'EMAIL_EXISTS' }, callback);
      }
    }

    const row = [
      new Date(),
      payload.name,
      payload.email,
      payload.teamName,
      ...payload.picks,
      payload.tieBreaker
    ];

    sheet.appendRow(row);

    return jsonResponse({ success: true, action: 'submit_ok' }, callback);
  } catch (err) {
    return jsonResponse({ success: false, action: 'submit_error', error: err.message }, callback);
  }
}

function jsonResponse(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback) {
    // JSONP-svar: kringgår Apps Scripts CORS+redirect-bugg
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
