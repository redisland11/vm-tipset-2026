const SHEET_ID = '1sqFUoS4R071F6EfRZxkwlcwgPrmESzZOCgxchSwa4IE';
const FORMULARSVAR_SHEET = 'Formulärsvar';
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
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(TOPPLISTAN_SHEET);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'SHEET_NOT_FOUND' });
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 3) {
      return jsonResponse({ success: true, players: [], updatedAt: new Date().toISOString() });
    }

    const values = sheet.getRange(3, 1, lastRow - 2, 6).getValues();
    const players = values
      .filter(r => r[1])
      .map(r => ({
        rank: r[0],
        name: r[1],
        teamName: r[2],
        totalPoints: r[3],
        tieBreaker: r[4],
        deviation: r[5]
      }));

    return jsonResponse({ success: true, players, updatedAt: new Date().toISOString() });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
