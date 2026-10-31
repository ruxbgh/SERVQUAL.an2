/**
 * Colector pentru evaluarea SERVQUAL a ASE de către studenți (răspunsuri anonime).
 * Se lipește într-un proiect Google Apps Script legat de o foaie Google Sheets (Extensii → Apps Script).
 * Instrucțiuni complete: README.md, secțiunea „Colectarea răspunsurilor”.
 *
 * Proprietăți de script (Setări proiect → Proprietăți script):
 *   TEACHER_KEY   cheia cu care profesorul citește datele (obligatorie; o creează setup() dacă lipsește)
 *   SESSION_CODE  cod de sesiune cerut studenților (opțional; dacă lipsește, nu se cere)
 */
var SHEET_NAME = 'Raspunsuri';
var PROFILES = ['ase'];
var DIMS = ['T', 'F', 'R', 'S', 'E'];

function header_() {
  var h = ['id', 'trimis_la', 'nume', 'prenume', 'grupa', 'profil', 'durata_min', 'IPCS', 'IPCS_ponderat', 'satisfactie_1_5', 'recomandare_0_10'];
  var i;
  for (i = 1; i <= 22; i++) h.push('A' + i);
  for (i = 1; i <= 22; i++) h.push('P' + i);
  DIMS.forEach(function (d) { h.push('imp_' + d); });
  h.push('cod');
  h.push('json');
  return h;
}

/** Rulează o singură dată din editor: creează foaia și, dacă lipsește, o cheie de profesor. */
function setup() {
  var sh = sheet_();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TEACHER_KEY')) {
    props.setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 10));
  }
  Logger.log('Foaia "%s" este pregătită. Cheia profesorului: %s', SHEET_NAME, props.getProperty('TEACHER_KEY'));
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    var h = header_();
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function isScale_(a) {
  if (Object.prototype.toString.call(a) !== '[object Array]' || a.length !== 22) return false;
  for (var i = 0; i < 22; i++) { if (!(a[i] >= 1 && a[i] <= 5)) return false; }
  return true;
}

function validate_(d) {
  if (!d || !d.id || typeof d.id !== 'string' || d.id.length > 40) return 'identificator invalid';
  if (!d.student || !String(d.student.grupa || '').trim()) return 'grupa lipsă';
  if (String(d.student.grupa).length > 60) return 'grupă prea lungă';
  if (PROFILES.indexOf(d.profil) < 0) return 'profil invalid';
  if (!isScale_(d.exp) || !isScale_(d.per)) return 'scale incomplete';
  var s = 0;
  DIMS.forEach(function (k) { s += Number(d.imp && d.imp[k]) || 0; });
  if (s !== 100) return 'importanța nu însumează 100';
  return null;
}

function upsert_(d) {
  var sh = sheet_();
  var row = [d.id, d.ts || new Date().toISOString(), d.student.nume, d.student.prenume, d.student.grupa || '', d.profil,
    d.dur && d.dur.total ? Math.round(d.dur.total / 60) : '',
    d.rez ? d.rez.ipcs : '', d.rez ? d.rez.ipcsW : '',
    d.global ? d.global.sat : '', d.global ? d.global.nps : ''];
  row = row.concat(d.exp, d.per);
  DIMS.forEach(function (k) { row.push(d.imp[k]); });
  row.push(String(d.code || ''));
  row.push(JSON.stringify(d));

  var last = sh.getLastRow(), target = 0;
  if (last > 1) {
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) { if (ids[i][0] === d.id) { target = i + 2; break; } }
  }
  if (!target) target = last + 1;
  sh.getRange(target, 1, 1, row.length).setValues([row]);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    if (!e || !e.postData || !e.postData.contents) return out_({ ok: false, error: 'fără date' });
    if (e.postData.contents.length > 80000) return out_({ ok: false, error: 'mesaj prea mare' });
    var d = JSON.parse(e.postData.contents);
    var code = PropertiesService.getScriptProperties().getProperty('SESSION_CODE');
    if (code && String(d.cod || '').trim() !== String(code).trim()) return out_({ ok: false, error: 'cod de sesiune invalid' });
    var err = validate_(d);
    if (err) return out_({ ok: false, error: err });
    upsert_(d);
    return out_({ ok: true });
  } catch (ex) {
    return out_({ ok: false, error: String(ex) });
  } finally {
    try { lock.releaseLock(); } catch (x) { /* ignorat */ }
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action !== 'list') return out_({ ok: true, service: 'servqual-ase' });
  var key = PropertiesService.getScriptProperties().getProperty('TEACHER_KEY');
  if (!key || String(p.key || '') !== key) return out_({ ok: false, error: 'cheie invalidă' });
  var sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return out_({ ok: true, rows: [] });
  var col = header_().length;
  var vals = sh.getRange(2, col, last - 1, 1).getValues();
  var rows = [];
  vals.forEach(function (v) {
    try { rows.push(JSON.parse(v[0])); } catch (x) { /* rând invalid, ignorat */ }
  });
  return out_({ ok: true, rows: rows });
}
