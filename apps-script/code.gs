/** ChaleCoco backend: Google Sheet as database.
 * Sheet tab "Products" with header row: id | name | desc | price | tone | active
 * Set the admin password: Project Settings > Script properties > ADMIN_PW
 */
const SHEET = 'Products', COLS = ['id', 'name', 'desc', 'price', 'tone', 'active'];
const sh = () => SpreadsheetApp.getActive().getSheetByName(SHEET);
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const okPw = pw => pw && pw === PropertiesService.getScriptProperties().getProperty('ADMIN_PW');
function rows() { const v = sh().getDataRange().getValues(); v.shift();
  return v.filter(r => r[0] !== '').map(r => Object.fromEntries(COLS.map((c, i) => [c, c === 'active' ? (r[i] === true || String(r[i]).toUpperCase() === 'TRUE') : String(r[i])]))); }
function doGet(e) { const all = e.parameter.pw && okPw(e.parameter.pw); const p = rows();
  return out({ products: all ? p : p.filter(x => x.active) }); }
function doPost(e) { const b = JSON.parse(e.postData.contents); if (!okPw(b.pw)) return out({ error: 'Wrong password' });
  const s = sh(), ids = s.getRange(1, 1, s.getLastRow(), 1).getValues().map(r => String(r[0]));
  if (b.action === 'add') { s.appendRow([Utilities.getUuid().slice(0, 8), b.p.name, b.p.desc || '', b.p.price || '', b.p.tone || 'green', true]); }
  else { const i = ids.indexOf(String(b.id)); if (i < 1) return out({ error: 'Not found' });
    if (b.action === 'delete') s.deleteRow(i + 1);
    if (b.action === 'update') COLS.slice(1).forEach((c, j) => { if (c in b.p) s.getRange(i + 1, j + 2).setValue(b.p[c]); }); }
  return out({ ok: true, products: rows() }); }
