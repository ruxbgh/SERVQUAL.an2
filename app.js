/* Aplicația studentului: evaluarea ASE cu instrumentul SERVQUAL (aproximativ 50 de minute, individual, anonim). */
(function () {
  'use strict';
  var C = window.CALITAS, K = window.CAL, CFG = window.CALITAS_CONFIG || {}, esc = K.esc;
  var KEY = 'servqual_ase_v1_state';
  var app = document.getElementById('app');
  var rail = document.getElementById('rail');
  var timerEl = document.getElementById('timer');

  var MACROS = [
    { t: 'Început', m: 2 }, { t: 'Modelul SERVQUAL', m: 6 }, { t: 'Rolul tău', m: 3 }, { t: 'Așteptări', m: 11 },
    { t: 'Anul universitar', m: 11 }, { t: 'Percepții', m: 10 }, { t: 'Rezultatele tale', m: 5 },
    { t: 'Trimitere', m: 2 }
  ];
  var RATING_LABELS = ['Foarte slab', 'Slab', 'Acceptabil', 'Bun', 'Foarte bun'];
  var DIM_COLORS = { T: '#6c8cf5', F: '#1f5bd8', R: '#ffb020', S: '#14946b', E: '#e2553f' };

  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function blank() {
    return {
      v: 1, step: 0, started: null, anonId: 'r' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4),
      student: { nume: '', prenume: '', grupa: '', cod: '' },
      profil: null, exp: zeros(22), per: zeros(22),
      imp: { T: 20, F: 20, R: 20, S: 20, E: 20 }, impTouched: false,
      momente: {}, global: { sat: 0, nps: -1, cuvant: '' },
      dur: { total: 0 }, sent: false, sentAt: null, sentConfirmed: false
    };
  }

  var S = K.store.get(KEY) || blank();
  var lastRendered = null;

  function save() { K.store.set(KEY, S); }
  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setPath(o, p, v) {
    var ks = p.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k) { return a[k]; }, o);
    t[last] = v;
  }
  function profile() { return S.profil ? K.profileById(S.profil) : null; }
  function fmtMin(m) {
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return h + ' h' + (r ? ' ' + r + ' min' : '');
  }
  function len(s) { return String(s || '').trim().length; }

  /* ---------- Desene mici ---------- */
  var CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function face(v) {
    var c = 23 + (v - 3) * 4.5;
    return '<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<circle cx="12" cy="14" r="1.8" fill="currentColor"/><circle cx="22" cy="14" r="1.8" fill="currentColor"/>' +
      '<path d="M10.5 ' + (v === 3 ? 23 : 23) + ' Q17 ' + c + ' 23.5 23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  function universityArt() {
    var cols = '', x, win = '';
    for (x = 112; x <= 280; x += 28) cols += '<rect x="' + x + '" y="112" width="12" height="98" fill="#ffffff"/><rect x="' + (x - 3) + '" y="106" width="18" height="7" fill="#eaf0fb"/><rect x="' + (x - 3) + '" y="208" width="18" height="6" fill="#eaf0fb"/>';
    for (x = 30; x <= 62; x += 16) win += '<rect x="' + x + '" y="124" width="9" height="16" rx="4.5" fill="#9fb8ef"/><rect x="' + x + '" y="160" width="9" height="16" rx="4.5" fill="#9fb8ef"/>';
    for (x = 331; x <= 363; x += 16) win += '<rect x="' + x + '" y="124" width="9" height="16" rx="4.5" fill="#9fb8ef"/><rect x="' + x + '" y="160" width="9" height="16" rx="4.5" fill="#9fb8ef"/>';
    return '<svg viewBox="0 0 400 270" aria-hidden="true" preserveAspectRatio="xMidYMax meet">' +
      '<rect x="20" y="104" width="360" height="126" fill="#f7f9fc"/>' + win +
      '<rect x="96" y="104" width="208" height="112" fill="#dfe7fa"/>' +
      '<polygon points="88,104 200,52 312,104" fill="#f7f9fc"/><polygon points="108,98 200,60 292,98" fill="#e2e9f3"/>' +
      '<rect x="84" y="100" width="232" height="8" fill="#1f5bd8"/>' +
      '<circle cx="200" cy="83" r="9" fill="#ffb020"/>' + cols +
      '<rect x="90" y="214" width="220" height="6" fill="#eaf0fb"/><rect x="80" y="220" width="240" height="6" fill="#dfe7fa"/><rect x="70" y="226" width="260" height="6" fill="#d3dce8"/>' +
      '<rect x="0" y="232" width="400" height="38" fill="#cbd6ee"/><rect x="0" y="232" width="400" height="3" fill="#b5c3e2"/>' +
      '<g><rect x="6" y="196" width="5" height="38" fill="#6f7f93"/><circle cx="8.5" cy="190" r="17" fill="#8fb39b"/></g>' +
      '<g><rect x="388" y="200" width="5" height="34" fill="#6f7f93"/><circle cx="390.5" cy="194" r="15" fill="#8fb39b"/></g>' +
      '<g transform="translate(150 238)"><circle cx="0" cy="-12" r="5" fill="#121a33"/><rect x="-5" y="-7" width="10" height="17" rx="4" fill="#ffb020"/><rect x="2" y="-4" width="7" height="9" rx="1.5" fill="#1f5bd8"/></g>' +
      '<g transform="translate(246 238)"><circle cx="0" cy="-12" r="5" fill="#121a33"/><rect x="-5" y="-7" width="10" height="17" rx="4" fill="#b8402f"/></g>' +
      '</svg>';
  }

  /* ---------- Lista ecranelor ---------- */
  function screens() {
    var L = [{ id: 'start', macro: 0 }];
    if (!S.profil) return L;
    var p = profile();
    L.push({ id: 'instr', macro: 1 });
    L.push({ id: 'rol', macro: 2 });
    C.dimensions.forEach(function (d, i) { L.push({ id: 'exp', macro: 3, dim: d.id, di: i }); });
    L.push({ id: 'imp', macro: 3 });
    p.momente.forEach(function (m, i) { L.push({ id: 'mom', macro: 4, idx: i }); });
    if (p.momente.some(function (m) { return m.asteptare + m.serviciu > 0; })) L.push({ id: 'fisa', macro: 4 });
    C.dimensions.forEach(function (d, i) { L.push({ id: 'per', macro: 5, dim: d.id, di: i }); });
    L.push({ id: 'glob', macro: 5 });
    L.push({ id: 'rez', macro: 6 });
    L.push({ id: 'send', macro: 7 });
    return L;
  }
  function firstIndex(L, id) { for (var i = 0; i < L.length; i++) if (L[i].id === id) return i; return -1; }
  // Blocare: după începerea parcursului nu se mai modifică așteptările; după rezultate, nici percepțiile.
  function minStep(L) {
    var iRez = firstIndex(L, 'rez'), iMom = firstIndex(L, 'mom');
    if (iRez >= 0 && S.step >= iRez) return iRez;
    if (iMom >= 0 && S.step >= iMom) return iMom;
    return 0;
  }

  /* ---------- Componente ---------- */
  function likert(arr, prefix, mode, dimId) {
    var d = K.dimById[dimId], h = '';
    d.items.forEach(function (n) {
      var it = C.items[n - 1];
      h += '<fieldset class="item" id="it-' + prefix + n + '"><legend><span class="n">' + n + '</span>' + esc(K.itemText(it, mode)) + '</legend>' +
        '<div class="scale" role="radiogroup">';
      for (var v = 1; v <= 5; v++) {
        h += '<label><input type="radio" name="' + prefix + n + '" value="' + v + '" data-arr="' + arr + '" data-i="' + n + '" aria-label="Enunțul ' + n + ', răspuns ' + v + ' din 5"' +
          (S[arr][n - 1] === v ? ' checked' : '') + '><span>' + v + '</span></label>';
      }
      h += '</div></fieldset>';
    });
    return h;
  }
  function answeredCount(arr, dimId) {
    return K.dimById[dimId].items.filter(function (n) { return S[arr][n - 1] > 0; }).length;
  }
  function field(path, label, o) {
    o = o || {};
    var v = getPath(S, path) || '';
    var min = o.min || 0, max = o.max || 0;
    var inp = o.rows === 1
      ? '<input type="text" data-path="' + path + '" value="' + esc(v) + '"' + (max ? ' maxlength="' + max + '"' : '') + ' autocomplete="off">'
      : '<textarea data-path="' + path + '" rows="' + (o.rows || 4) + '"' + (max ? ' maxlength="' + max + '"' : '') + '>' + esc(v) + '</textarea>';
    var cnt = (min || max > 100) ? '<div class="counter' + (len(v) >= min ? ' ok' : '') + '" data-cnt="' + path + '" data-min="' + min + '" data-max="' + max + '">' + cntText(len(v), min, max) + '</div>' : '';
    return '<label class="f" id="f-' + path.replace(/\./g, '-') + '">' + esc(label) + (o.hint ? '<span class="h">' + esc(o.hint) + '</span>' : '') + inp + cnt + '</label>';
  }
  function cntText(n, min, max) {
    if (min && n < min) return n + ' caractere, mai sunt necesare ' + (min - n);
    return n + (max ? ' din ' + max : '') + ' caractere';
  }
  function select(path, label, options, id) {
    var v = getPath(S, path) || '';
    return '<label class="f"' + (id ? ' id="' + id + '"' : '') + '>' + esc(label) +
      '<select data-path="' + path + '"><option value="">Alege…</option>' +
      options.map(function (o) {
        var val = typeof o === 'string' ? o : o.v, txt = typeof o === 'string' ? o : o.t;
        return '<option value="' + esc(val) + '"' + (v === val ? ' selected' : '') + '>' + esc(txt) + '</option>';
      }).join('') + '</select></label>';
  }
  function dimDots(di) {
    var h = '<div class="dimdots" aria-hidden="true">';
    for (var i = 0; i < 5; i++) h += '<i class="' + (i < di ? 'on' : i === di ? 'cur' : '') + '"></i>';
    return h + '</div>';
  }
  function scaleHint() { return '<div class="scalehint" aria-hidden="true"><span>1 = dezacord total</span><span>5 = acord total</span></div>'; }

  /* ---------- Ecrane ---------- */
  var R = {};

  R.start = function () {
    var resumed = S.started ? '<div class="infobox">Există o sesiune începută pe acest dispozitiv. Apasă butonul de mai jos pentru a continua de unde ai rămas.</div>' : '';
    return '<section class="cover"><div class="txt"><div class="kicker">Managementul calității, anul II</div>' +
      '<h1>Calitatea serviciilor ASE, evaluată de studenți</h1>' +
      '<p>Ești în al doilea an de studiu la ASE. Pe baza experienței tale, vei evalua calitatea serviciilor universității cu ajutorul modelului SERVQUAL, unul dintre cele mai utilizate instrumente de măsurare a calității serviciilor, aplicat în sănătate, servicii bancare sau transport aerian.</p>' +
      '<div class="meta"><span>aproximativ 50 de minute</span><span>individual și anonim</span><span>22 de enunțuri, 5 dimensiuni</span></div></div>' +
      '<div class="art">' + universityArt() + '<div class="ticket" aria-hidden="true">Cerere nr.<b>1247</b>Termen: 3 zile lucrătoare<span class="now">Stare: în lucru</span></div></div></section>' +
      resumed +
      '<div class="card"><h2>Cum decurge</h2><ol class="howto">' +
      '<li>Parcurgi o scurtă prezentare a modelului SERVQUAL.</li>' +
      '<li>Precizezi așteptările față de o universitate excelentă.</li>' +
      '<li>Evaluezi principalele momente ale anului universitar.</li>' +
      '<li>Evaluezi serviciile ASE pe cele 22 de enunțuri.</li>' +
      '<li>Consulți rezultatele și le transmiți profesorului.</li></ol>' +
      '<p class="small muted" style="margin:0">Răspunsurile sunt anonime: nu se colectează numele sau alte date de identificare. Rezultatele sunt analizate agregat, iar concluziile vor fi discutate la seminar.</p></div>' +
      '<div class="card signed"><h2>Grupa de studiu</h2>' +
      field('student.grupa', 'Grupă', { rows: 1, max: 30, hint: 'De exemplu: 1023. Permite compararea rezultatelor între grupe și nu te identifică.' }) +
      (CFG.cerCodSesiune ? field('student.cod', 'Cod de sesiune', { rows: 1, max: 30, hint: 'Îl primești de la profesor' }) : '') + '</div>';
  };

  R.instr = function () {
    var I = C.instrument;
    return '<div class="hero"><div class="kicker">Cadrul de evaluare</div><h1>Modelul SERVQUAL</h1>' +
      '<p>' + esc(I.intro) + '</p><p class="motto">' + esc(I.formula) + '</p></div>' +
      '<div class="card"><h2>Cele cinci dimensiuni ale calității</h2><div class="dimgrid">' +
      C.dimensions.map(function (d) {
        return '<div class="dimcard" style="border-top-color:' + DIM_COLORS[d.id] + '"><b>' + esc(d.nume) + '</b><span class="muted small">' + d.items.length + ' enunțuri</span><p>' + esc(d.desc) + '</p></div>';
      }).join('') + '</div></div>' +
      '<div class="card"><h2>Etapele evaluării</h2><ol class="charta">' + I.pasi.map(function (x) { return '<li><span>' + esc(x) + '</span></li>'; }).join('') + '</ol>' +
      '<div class="infobox" style="margin:16px 0 0"><b>Interpretarea rezultatelor:</b> pentru fiecare dimensiune se calculează diferența dintre media percepțiilor și media așteptărilor. O valoare negativă indică un serviciu situat sub nivelul așteptat; o valoare de −1 sau mai mică semnalează o discrepanță critică.</div></div>';
  };

  R.rol = function () {
    var g = S.student.grupa, I = C.instrument;
    return '<div class="kicker">Rolul tău în evaluare</div>' +
      '<div class="idcard" role="group" aria-label="Legitimația de student"><div class="idtop">Legitimație de student<span>anul universitar în curs</span></div>' +
      '<div class="idbody"><div class="avatar" aria-hidden="true">TU</div><div><h1>Student, anul II</h1>' +
      '<div class="facts"><span>Grupa <b>' + esc(g) + '</b></span><span>Beneficiar al serviciilor ASE</span></div></div>' +
      '<div class="barcode" aria-hidden="true"></div></div></div>' +
      '<div class="card signed"><h2>Evaluator din perspectiva beneficiarului</h2><p class="situatie">' + esc(profile().intro) + '</p>' +
      '<div class="infobox">' + esc(I.rol) + '</div>' +
      '<div class="thought"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#ffb020"/><path d="M15 15a5 5 0 1 1 7 4.6c-1.4.6-2 1.4-2 2.9V24" fill="none" stroke="#121a33" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="29.5" r="2" fill="#121a33"/></svg>' +
      '<div><b>Înainte de a continua:</b> reflectează la modul în care ar arăta, pentru tine, o universitate excelentă. În etapa următoare vei preciza așteptările față de o astfel de universitate, nu față de ASE.</div></div></div>';
  };

  R.exp = function (sc) {
    var d = K.dimById[sc.dim], pe = profile().persona;
    var first = sc.di === 0 ? '<div class="infobox">Nu există răspunsuri corecte sau greșite. Te raportezi la <b>o universitate excelentă</b>, în general, nu la ASE.</div>' : '';
    return '<div class="card signed"><div class="dimhead"><div class="kicker">Așteptări, dimensiunea ' + (sc.di + 1) + ' din 5</div>' + dimDots(sc.di) + '</div>' +
      '<h2>' + esc(d.nume) + '</h2><p class="muted" style="margin-bottom:6px">' + esc(d.desc) + '</p>' +
      '<div class="modepill a">Așteptări față de o universitate excelentă</div>' + first +
      '<p class="progress-line" data-prog="exp:' + sc.dim + '">' + answeredCount('exp', sc.dim) + ' din ' + d.items.length + ' enunțuri completate</p>' + scaleHint() +
      likert('exp', 'e', 'A', sc.dim) + '</div>';
  };

  R.imp = function () {
    var h = '<div class="card signed"><div class="kicker">Importanță</div><h2>Ce contează cel mai mult pentru tine?</h2>' +
      '<p>Distribuie 100 de puncte între cele cinci dimensiuni, în funcție de importanța pe care o au pentru tine ca student. Totalul trebuie să fie exact 100.</p>';
    C.dimensions.forEach(function (d) {
      h += '<div class="imp"><b>' + esc(d.nume) + '</b><span class="val" id="iv-' + d.id + '">' + S.imp[d.id] + '</span>' +
        '<input type="range" min="0" max="100" step="5" value="' + S.imp[d.id] + '" data-imp="' + d.id + '" aria-label="Importanța dimensiunii ' + esc(d.nume) + '">' +
        '<span class="d">' + esc(d.desc) + '</span></div>';
    });
    return h + '<div class="impbar" id="impbar" aria-hidden="true"></div><div class="imp-total" id="imp-total"></div></div>';
  };

  R.mom = function (sc) {
    var p = profile(), m = p.momente[sc.idx], n = p.momente.length;
    var st = S.momente[m.id] || { r: 0, n: '' };
    var journey = '<div class="journey" aria-hidden="true">' + p.momente.map(function (x, i) {
      return '<span class="' + (i < sc.idx ? 'done' : i === sc.idx ? 'cur' : '') + '">' + esc(x.titlu) + '</span>';
    }).join('') + '</div>';
    var h = '<div class="card signed moment">' + journey + '<div class="kicker">Momentul ' + (sc.idx + 1) + ' din ' + n + ' al anului universitar</div>' +
      '<div class="mhead"><span class="ora">' + CLOCK + esc(m.ora) + '</span><h2 style="margin:0">' + esc(m.titlu) + '</h2></div>' +
      '<p class="lead">' + esc(m.text) + '</p>' +
      '<div class="promis"><span class="pin" aria-hidden="true">?</span><div><b>Întrebări de reflecție</b>' + esc(m.intrebare) + '</div></div>' +
      '<div id="rate-' + m.id + '"><h3 style="margin-top:18px">Cum evaluezi acest moment, pe baza experienței tale?</h3><div class="rating six" role="radiogroup">';
    for (var v = 1; v <= 5; v++) {
      h += '<label><input type="radio" name="r-' + m.id + '" value="' + v + '" data-mom="' + m.id + '"' + (st.r === v ? ' checked' : '') + ' aria-label="' + RATING_LABELS[v - 1] + '"><span>' + face(v) + RATING_LABELS[v - 1] + '</span></label>';
    }
    h += '<label class="na"><input type="radio" name="r-' + m.id + '" value="9" data-mom="' + m.id + '"' + (st.r === 9 ? ' checked' : '') + ' aria-label="Nu am avut contact"><span><svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/><path d="M11 17h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Nu am avut contact</span></label>';
    h += '</div></div><label class="f" style="margin-top:18px">Un exemplu concret <span class="h">Opțional. Te rugăm să nu menționezi nume de persoane.</span>' +
      '<textarea rows="3" data-momnote="' + m.id + '" maxlength="400">' + esc(st.n) + '</textarea></label></div>';
    return h;
  };

  function rchip(r) { return r && r <= 5 ? '<span class="rchip" style="' + K.heat5(r) + '">' + r + '</span>' : '–'; }

  R.fisa = function () {
    var p = profile(), W = 0, Sv = 0, segs = '', rows = '', mean = [];
    p.momente.forEach(function (m) { W += m.asteptare; Sv += m.serviciu; });
    var T = W + Sv;
    p.momente.forEach(function (m) {
      if (m.asteptare) segs += '<div class="seg w" style="width:' + (m.asteptare / T * 100) + '%" title="' + esc(m.titlu) + ': așteptare ' + fmtMin(m.asteptare) + '"></div>';
      if (m.serviciu) segs += '<div class="seg s" style="width:' + (m.serviciu / T * 100) + '%" title="' + esc(m.titlu) + ': îngrijire ' + fmtMin(m.serviciu) + '"></div>';
      var r = (S.momente[m.id] || {}).r || 0; if (r) mean.push(r);
      rows += '<tr><td>' + esc(m.ora) + '</td><td>' + esc(m.titlu) + '</td><td class="num">' + (m.asteptare ? fmtMin(m.asteptare) : '–') + '</td><td class="num">' + (m.serviciu ? fmtMin(m.serviciu) : '–') + '</td><td class="num">' + rchip(r) + '</td></tr>';
    });
    return '<div class="card signed"><div class="kicker">Fișa de parcurs</div><h2>Unde s-a dus timpul tău la spital</h2>' +
      '<p>Ziua lui ' + esc(p.persona.nume) + ' în cifre: ' + fmtMin(T) + ' petrecute în spital.</p>' +
      '<div class="split"><div class="w"><b>' + fmtMin(W) + '</b><span>așteptare (' + Math.round(W / T * 100) + '% din timp)</span></div><div class="s"><b>' + fmtMin(Sv) + '</b><span>îngrijire efectivă (' + Math.round(Sv / T * 100) + '% din timp)</span></div></div>' +
      '<div class="fisa"><div class="track">' + segs + '</div><p style="margin-top:8px"><span class="lg legend-w">Așteptare</span><span class="lg legend-s">Îngrijire efectivă</span></p>' +
      '<div class="tblwrap"><table class="tbl"><thead><tr><th>Ora</th><th>Moment</th><th class="num">Așteptare</th><th class="num">Îngrijire</th><th class="num">Cum te-ai simțit</th></tr></thead><tbody>' + rows +
      '<tr><th colspan="2">Total</th><th class="num">' + fmtMin(W) + '</th><th class="num">' + fmtMin(Sv) + '</th><th class="num">' + (mean.length ? K.fmt(K.mean(mean), 1) : '–') + '</th></tr></tbody></table></div></div>' +
      '<div class="infobox" style="margin:0">Acum ai toate datele. În etapa următoare evaluezi spitalul pe aceleași 22 de enunțuri, de data aceasta pe baza a ceea ce ai trăit.</div></div>';
  };

  R.per = function (sc) {
    var d = K.dimById[sc.dim], p = profile(), pe = p.persona;
    var recap = '<details style="margin:0 0 14px"><summary style="cursor:pointer;font-weight:700;color:var(--sign)">Revezi momentele anului universitar</summary><div style="margin-top:10px">' +
      p.momente.map(function (m) { var r = (S.momente[m.id] || {}).r; return '<p><b>' + esc(m.titlu) + '.</b> ' + esc(m.intrebare) + ' <span class="muted small">(nota ta: ' + (r && r <= 5 ? r : 'nu se aplică') + ')</span></p>'; }).join('') + '</div></details>';
    var first = sc.di === 0 ? '<div class="infobox">Scala rămâne aceeași; de această dată evaluezi <b>ASE</b>, pe baza experienței tale.</div>' : '';
    return '<div class="card signed"><div class="dimhead"><div class="kicker">Percepții, dimensiunea ' + (sc.di + 1) + ' din 5</div>' + dimDots(sc.di) + '</div>' +
      '<h2>' + esc(d.nume) + '</h2><p class="muted" style="margin-bottom:6px">' + esc(d.desc) + '</p>' +
      '<div class="modepill p">Percepții privind ASE</div>' + first + recap +
      '<p class="progress-line" data-prog="per:' + sc.dim + '">' + answeredCount('per', sc.dim) + ' din ' + d.items.length + ' enunțuri completate</p>' + scaleHint() +
      likert('per', 'p', 'P', sc.dim) + '</div>';
  };

  R.glob = function () {
    var g = S.global, h = '<div class="card signed"><div class="kicker">Evaluare de ansamblu</div><h2>Două întrebări generale</h2>' +
      '<fieldset class="item" id="it-sat"><legend>În ansamblu, cât de mulțumit sau mulțumită ești de experiența ta ca student la ASE?</legend><div class="scale" role="radiogroup">';
    for (var v = 1; v <= 5; v++) h += '<label><input type="radio" name="sat" value="' + v + '" data-glob="sat"' + (g.sat === v ? ' checked' : '') + ' aria-label="Mulțumire ' + v + ' din 5"><span>' + v + '</span></label>';
    h += '</div><p class="small muted" style="margin:8px 0 0">1 = foarte nemulțumit, 5 = foarte mulțumit</p></fieldset>' +
      '<fieldset class="item" id="it-nps"><legend>Cât de probabil este să recomanzi ASE unui prieten care își alege facultatea?</legend><div class="scale nps" role="radiogroup">';
    for (v = 0; v <= 10; v++) h += '<label><input type="radio" name="nps" value="' + v + '" data-glob="nps"' + (g.nps === v ? ' checked' : '') + ' aria-label="Recomandare ' + v + ' din 10"><span>' + v + '</span></label>';
    h += '</div><p class="small muted" style="margin:8px 0 0">0 = deloc probabil, 10 = foarte probabil</p></fieldset>' +
      '<div style="margin-top:14px">' + field('global.cuvant', 'Un cuvânt sau o expresie care descrie experiența ta la ASE (opțional)', { rows: 1, max: 60, hint: 'Opțional' }) + '</div></div>';
    return h;
  };

  function gauge(v) {
    var pos = Math.max(0, Math.min(100, (v + 4) / 8 * 100));
    return '<div class="gauge" aria-hidden="true"><div class="bar"><div class="mk" style="left:' + pos + '%"></div></div><div class="ticks"><span>−4</span><span>−2</span><span>0</span><span>+2</span><span>+4</span></div></div>';
  }

  R.rez = function () {
    var a = K.analyze(S), b = K.band(a.ipcs), pe = profile().persona;
    var series = [{ name: 'Așteptări', cls: 'a', v: a.A }, { name: 'Percepții', cls: 'p', v: a.P }];
    var rows = C.dimensions.map(function (d) {
      var bd = K.band(a.gap[d.id]);
      return '<tr><td><b>' + esc(d.nume) + '</b></td><td class="num">' + K.fmt(a.A[d.id]) + '</td><td class="num">' + K.fmt(a.P[d.id]) + '</td><td class="num" style="' + K.heat(a.gap[d.id]) + '"><b>' + K.fmtS(a.gap[d.id]) + '</b></td><td class="num">' + S.imp[d.id] + '</td><td><span class="tag ' + bd.k + '">' + esc(bd.t) + '</span></td></tr>';
    }).join('');
    var order = a.itemGap.map(function (g, i) { return { n: i + 1, g: g }; }).sort(function (x, y) { return x.g - y.g; });
    var worst = order.filter(function (o) { return o.g < 0; }).slice(0, 3);
    var best = order.slice().reverse().filter(function (o) { return o.g >= 0; }).slice(0, 2);
    var li = function (o) {
      return '<li><span class="g ' + (o.g < 0 ? 'neg' : 'pos') + '">' + K.fmtS(o.g, 0) + '</span><div>' + esc(K.itemText(C.items[o.n - 1], 'P')) +
        '<br><span class="muted small">Așteptare ' + S.exp[o.n - 1] + ', percepție ' + S.per[o.n - 1] + ', dimensiunea ' + esc(K.dimById[C.items[o.n - 1].d].nume) + '</span></div></li>';
    };
    var worstD = C.dimensions.slice().sort(function (x, y) { return a.gap[x.id] - a.gap[y.id]; })[0];
    var text = a.ipcs >= 0
      ? 'În ansamblu, ASE a atins sau a depășit ce te așteptai.'
      : 'În ansamblu, experiența ta a rămas sub așteptări. Cea mai mare discrepanță este la <b>' + esc(worstD.nume) + '</b> (' + K.fmtS(a.gap[worstD.id]) + ').';
    return '<div class="card signed"><div class="kicker">Rezultatele tale</div><h2>Calitatea percepută la ASE</h2>' +
      '<div class="res-grid"><div><p class="muted" style="margin:0">Indicele de măsurare a percepției calității serviciului (IPCS)</p>' +
      '<div class="bignum ' + (a.ipcs < 0 ? 'neg' : 'pos') + '">' + K.fmtS(a.ipcs) + '</div><span class="tag ' + b.k + '">' + esc(b.t) + '</span>' + gauge(a.ipcs) +
      '<p>' + text + '</p><p class="small muted" style="margin:0">IPCS ponderat cu importanța ta: <b>' + K.fmtS(a.ipcsW) + '</b>. Grad de satisfacție (P/A): <b>' + K.fmt(a.sat, 0) + '%</b>.</p></div>' +
      '<div>' + K.radar(series) + '</div></div></div>' +
      '<div class="card"><h3>Pe dimensiuni</h3><div class="tblwrap"><table class="tbl"><thead><tr><th>Dimensiune</th><th class="num">Așteptări (A)</th><th class="num">Percepții (P)</th><th class="num">P − A</th><th class="num">Importanță</th><th>Interpretare</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<details style="margin-top:14px"><summary style="cursor:pointer;color:var(--sign);font-weight:700">Cum se calculează</summary><p class="small" style="margin-top:8px">Pentru fiecare dimensiune se face media răspunsurilor la enunțurile ei, separat pentru așteptări (A) și percepții (P). Discrepanța este P − A. IPCS este media discrepanțelor celor 5 dimensiuni; un număr negativ arată că experiența a fost sub așteptări. Varianta ponderată înmulțește fiecare discrepanță cu importanța pe care ai dat-o dimensiunii.</p></details></div>' +
      '<div class="card"><h3>Unde a rămas ASE cel mai mult sub așteptările tale</h3>' +
      (worst.length ? '<ol class="gaplist">' + worst.map(li).join('') + '</ol>' : '<p>Nu ai niciun enunț cu percepția sub așteptare.</p>') +
      (best.length ? '<h3 style="margin-top:22px">Unde ți-a răspuns la așteptări</h3><ol class="gaplist">' + best.map(li).join('') + '</ol>' : '') + '</div>' +
      '<div class="infobox">Acestea sunt rezultatele tale individuale. Ele vor fi agregate, fără date de identificare, cu cele ale colegilor, iar concluziile vor fi discutate la seminar. Din acest moment, răspunsurile nu mai pot fi modificate.</div>';
  };


  R.send = function () {
    var pe = profile().persona, miss = firstMissing();
    var mins = Math.round((S.dur.total || 0) / 60);
    var h = '<div class="card signed"><div class="kicker">Ultimul pas</div><h2>Trimite rezultatele profesorului</h2>' +
      '<p>Grupa <b>' + esc(S.student.grupa) + '</b>. Timp de lucru: ' + mins + ' minute. Răspunsurile sunt anonime.</p>';
    if (miss) {
      return h + '<div class="alertbox">Mai ai de completat: <b>' + esc(miss.msg) + '</b> <button class="btn small" data-goto="' + miss.step + '" style="margin-left:8px">Mergi acolo</button></div></div>';
    }
    var code = K.encodeCode(payload());
    var steps = '<ol class="sendsteps">' +
      '<li><b>Copiază codul tău de rezultat.</b> Conține grupa și toate răspunsurile, fără numele tău.' +
      '<textarea class="codebox" id="codebox" readonly rows="3" aria-label="Codul tău de rezultat">' + esc(code) + '</textarea>' +
      '<button class="btn primary" id="btn-copy">Copiază codul</button> <span class="copied" id="copied" role="status"></span></li>' +
      '<li><b>Lipește-l în formularul profesorului.</b> ' + (CFG.linkFormular
        ? 'Formularul are o singură întrebare: codul.<br><a class="btn go" id="btn-form" href="' + esc(CFG.linkFormular) + '" target="_blank" rel="noopener">Deschide formularul</a>'
        : 'Profesorul îți spune unde: formular, e-mail sau platforma facultății.') + '</li></ol>';
    if (CFG.endpoint) {
      if (S.sent && S.sentConfirmed) {
        h += '<div class="sentok"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="#def1e6"/><path d="M24 41l11 11 21-24" fill="none" stroke="#2c7a57" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><div><b>Rezultatele tale au ajuns la profesor.</b><br><span class="muted small">Trimise la ' + esc(S.sentAt || '') + '. Nu mai trebuie să faci nimic.</span></div></div>';
      } else {
        h += '<p>Apasă butonul de mai jos pentru a transmite rezultatele direct profesorului.</p><button class="btn go big" id="btn-send">Trimite rezultatele</button>' +
          (S.sent ? '<div class="waitbox" style="margin-top:14px">Trimiterea nu a fost confirmată. Încearcă din nou sau folosește codul de mai jos.</div>' : '');
      }
      h += '<p class="status" id="status" role="status"></p>' +
        '<details class="fallback"' + (S.sent && !S.sentConfirmed ? ' open' : '') + '><summary>Nu merge trimiterea? Folosește codul de rezultat</summary>' + steps + '</details>';
    } else {
      h += steps;
    }
    h += '<p class="small muted" style="margin:14px 0 0">Altă variantă: <a href="#" id="btn-dl">descarcă fișierul cu rezultate</a> sau <a href="#" id="btn-print">tipărește pagina</a>.</p>' +
      (CFG.endpoint ? '' : '<p class="status" id="status" role="status"></p>') + '</div>' +
      ((CFG.endpoint && !(S.sent && S.sentConfirmed)) ? '' : '<div class="card done-card"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36" fill="#def1e6"/><path d="M24 41l11 11 21-24" fill="none" stroke="#2c7a57" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h2>Îți mulțumim pentru participare!</h2><p style="margin:0 auto">Concluziile evaluării vor fi prezentate și discutate la seminar, după ce întreaga grupă își transmite rezultatele.</p></div>');
    return h;
  };

  /* ---------- Validare ---------- */
  function validate(sc) {
    var msgs = [], miss = [];
    function need(ok, msg, id) { if (!ok) { msgs.push(msg); if (id) miss.push(id); } }
    switch (sc.id) {
      case 'start':
        need(len(S.student.grupa) >= 1, 'Completează grupa.', 'f-student-grupa');
        if (CFG.cerCodSesiune) need(len(S.student.cod) >= 1, 'Introdu codul de sesiune.', 'f-student-cod');
        break;
      case 'exp': case 'per':
        var arr = sc.id, pre = sc.id === 'exp' ? 'e' : 'p', cnt = 0;
        K.dimById[sc.dim].items.forEach(function (n) { if (!S[arr][n - 1]) { cnt++; miss.push('it-' + pre + n); } });
        if (cnt) msgs.push(cnt === 1 ? 'Mai ai un enunț fără răspuns (marcat cu roșu).' : 'Mai ai ' + cnt + ' enunțuri fără răspuns (marcate cu roșu).');
        break;
      case 'imp':
        var sum = 0; K.ids.forEach(function (k) { sum += S.imp[k]; });
        need(sum === 100, 'Suma punctelor trebuie să fie exact 100 (acum: ' + sum + ').');
        need(S.impTouched, 'Confirmă distribuția mutând cel puțin un cursor (poți reveni apoi la valoarea dorită).');
        break;
      case 'mom':
        var m = profile().momente[sc.idx];
        need(((S.momente[m.id] || {}).r || 0) > 0, 'Alege cum te-ai simțit în acest moment.', 'rate-' + m.id);
        break;
      case 'glob':
        need(S.global.sat > 0, 'Alege nivelul de mulțumire.', 'it-sat');
        need(S.global.nps >= 0, 'Alege probabilitatea de recomandare.', 'it-nps');
        break;
    }
    return { ok: msgs.length === 0, msgs: msgs, miss: miss };
  }
  function firstMissing() {
    var L = screens();
    for (var i = 0; i < L.length; i++) {
      if (L[i].id === 'send') continue;
      var v = validate(L[i]);
      if (!v.ok) return { step: i, msg: MACROS[L[i].macro].t + ': ' + v.msgs[0] };
    }
    return null;
  }

  /* ---------- Randare ---------- */
  function navHtml(L, sc) {
    var back = S.step > minStep(L) && sc.id !== 'start';
    var lastMom = profile() ? profile().momente.length - 1 : 0;
    var labels = {
      start: S.started ? 'Continuă' : 'Începe', instr: 'Continuă', rol: 'Continuă cu așteptările', exp: sc.di === 4 ? 'Continuă la importanță' : 'Dimensiunea următoare',
      imp: 'Continuă cu anul universitar', mom: sc.idx === lastMom ? 'Evaluează ASE' : 'Momentul următor',
      fisa: 'Evaluează ASE', per: sc.di === 4 ? 'Continuă' : 'Dimensiunea următoare', glob: 'Vezi rezultatele mele',
      rez: 'Treci la trimitere'
    };
    var warn = (sc.id === 'imp') ? '<p class="small muted" style="flex-basis:100%;margin:0;text-align:right">După acest pas, așteptările nu mai pot fi modificate.</p>'
      : (sc.id === 'glob') ? '<p class="small muted" style="flex-basis:100%;margin:0;text-align:right">După acest pas, percepțiile nu mai pot fi modificate.</p>' : '';
    var h = '<div class="nav"><div id="navmsg" class="msg" role="alert"></div>';
    h += back ? '<button class="btn" id="btn-back">Înapoi</button>' : '<span></span>';
    if (sc.id !== 'send') h += '<button class="btn ' + (sc.id === 'start' ? 'go' : 'primary') + '" id="btn-next">' + esc(labels[sc.id] || 'Continuă') + '</button>';
    return h + warn + '</div>';
  }

  function render(keepScroll) {
    var L = screens();
    if (S.step >= L.length) S.step = L.length - 1;
    var sc = L[S.step];
    app.innerHTML = R[sc.id](sc) + navHtml(L, sc);
    lastRendered = sc;
    if (sc.id === 'imp') updateImpTotal();
    renderRail(L, sc);
    if (!keepScroll) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
    save();
  }

  function renderRail(L, sc) {
    var cur = sc.macro, pe = S.profil ? profile().persona : null;
    var h = '<ol>' + MACROS.map(function (m, i) {
      return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"' + (i === cur ? ' aria-current="step"' : '') + '>' + esc(m.t) + '<small>' + m.m + ' min</small></li>';
    }).join('') + '</ol>';
    if (pe) h += '<div class="who"><span class="muted">Răspunsuri anonime</span><b>Grupa ' + esc(S.student.grupa) + '</b>Student, anul II</div>';
    if (S.started) h += '<p class="reset"><a href="#" id="btn-reset">Student nou sau reia de la zero</a></p>';
    rail.innerHTML = h;
    var pct = Math.round(S.step / Math.max(L.length - 1, 1) * 100);
    var mp = document.getElementById('mprog');
    if (!mp) { mp = document.createElement('div'); mp.id = 'mprog'; mp.className = 'mobile-prog'; app.parentNode.insertBefore(mp, app); }
    mp.innerHTML = '<div class="bar"><i style="width:' + pct + '%"></i></div><p>Etapa ' + (cur + 1) + ' din ' + MACROS.length + ': ' + esc(MACROS[cur].t) + '</p>';
  }

  /* ---------- Cronometru ---------- */
  function showTime() {
    var s = S.dur.total || 0, mm = Math.floor(s / 60), ss = s % 60;
    timerEl.firstChild.nodeValue = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
  }
  setInterval(function () {
    if (!S.started || (S.sent && lastRendered && lastRendered.id === 'send')) return;
    if (document.visibilityState !== 'visible') return;
    S.dur.total = (S.dur.total || 0) + 1;
    var mk = 'm' + (lastRendered ? lastRendered.macro : 0);
    S.dur[mk] = (S.dur[mk] || 0) + 1;
    showTime();
    if (S.dur.total % 15 === 0) save();
  }, 1000);

  /* ---------- Evenimente ---------- */
  function updateImpTotal() {
    var sum = 0; K.ids.forEach(function (k) { sum += S.imp[k]; });
    var el = document.getElementById('imp-total'), bar = document.getElementById('impbar');
    if (bar) bar.innerHTML = C.dimensions.map(function (d) { return S.imp[d.id] ? '<i style="width:' + (S.imp[d.id] / Math.max(sum, 100) * 100) + '%;background:' + DIM_COLORS[d.id] + '" title="' + esc(d.nume) + '"></i>' : ''; }).join('');
    if (!el) return;
    el.className = 'imp-total ' + (sum === 100 ? 'ok' : 'bad');
    el.textContent = 'Total: ' + sum + ' din 100' + (sum === 100 ? '. Perfect.' : sum > 100 ? '. Ai depășit cu ' + (sum - 100) + '.' : '. Mai ai ' + (100 - sum) + ' de împărțit.');
  }

  app.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('input[data-arr]')) {
      S[t.dataset.arr][+t.dataset.i - 1] = +t.value;
      var fs = t.closest('fieldset'); if (fs) fs.classList.remove('miss');
      var sc = lastRendered, prog = app.querySelector('[data-prog]');
      if (prog && sc) prog.textContent = answeredCount(sc.id, sc.dim) + ' din ' + K.dimById[sc.dim].items.length + ' enunțuri completate';
    } else if (t.matches('input[data-mom]')) {
      var id = t.dataset.mom; S.momente[id] = S.momente[id] || { r: 0, n: '' };
      S.momente[id].r = +t.value;
      var box = document.getElementById('rate-' + id); if (box) box.classList.remove('miss');
    } else if (t.matches('input[data-glob]')) {
      S.global[t.dataset.glob] = +t.value;
      var f2 = t.closest('fieldset'); if (f2) f2.classList.remove('miss');
    } else if (t.matches('select[data-path]')) {
      setPath(S, t.dataset.path, t.value);
    }
    save();
  });

  app.addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches('[data-path]') && t.tagName !== 'SELECT') {
      setPath(S, t.dataset.path, t.value);
      var c = app.querySelector('[data-cnt="' + t.dataset.path + '"]');
      if (c) {
        var min = +c.dataset.min, max = +c.dataset.max, n = len(t.value);
        c.textContent = cntText(n, min, max);
        c.classList.toggle('ok', n >= min);
      }
    } else if (t.matches('[data-momnote]')) {
      var id = t.dataset.momnote; S.momente[id] = S.momente[id] || { r: 0, n: '' };
      S.momente[id].n = t.value;
    } else if (t.matches('input[data-imp]')) {
      S.imp[t.dataset.imp] = +t.value; S.impTouched = true;
      var lab = document.getElementById('iv-' + t.dataset.imp); if (lab) lab.textContent = t.value;
      updateImpTotal();
    }
    save();
  });

  function goNext() {
    var L = screens(), sc = L[S.step], v = validate(sc);
    var nm = document.getElementById('navmsg');
    if (!v.ok) {
      if (nm) nm.innerHTML = '<div class="alertbox"><b>Mai ai de completat:</b><ul>' + v.msgs.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>';
      v.miss.forEach(function (id) { var el = document.getElementById(id); if (el) el.classList.add('miss'); });
      var first = v.miss.length ? document.getElementById(v.miss[0]) : null;
      (first || nm || app).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (sc.id === 'start') {
      if (!S.profil) {
        var forced = (new URLSearchParams(location.search)).get('profil');
        S.profil = K.profileById(forced) ? forced : K.profileById(CFG.profilFix) ? CFG.profilFix : K.pickProfile(S.student);
      }
      if (!S.started) S.started = Date.now();
      L = screens();
    }
    S.step = Math.min(S.step + 1, L.length - 1);
    render();
  }

  app.addEventListener('click', function (e) {
    var t = e.target.closest('button, a#btn-dl, a#btn-print');
    if (!t) return;
    if (t.tagName === 'A') e.preventDefault();
    if (t.id === 'btn-next') goNext();
    else if (t.id === 'btn-back') { S.step = Math.max(S.step - 1, minStep(screens())); render(); }
    else if (t.dataset.goto) { S.step = +t.dataset.goto; render(); }
    else if (t.id === 'btn-dl') downloadCopy();
    else if (t.id === 'btn-print') window.print();
    else if (t.id === 'btn-send') send();
    else if (t.id === 'btn-copy') copyCode();
  });

  rail.addEventListener('click', function (e) {
    if (e.target.id === 'btn-reset') {
      e.preventDefault();
      if (confirm('Pornești o sesiune nouă? Răspunsurile salvate pe acest dispozitiv vor fi șterse (ce ai trimis deja rămâne la profesor).')) {
        K.store.del(KEY); S = blank(); showTime(); render();
      }
    }
  });

  /* ---------- Trimitere ---------- */
  function payload() {
    var a = K.analyze(S);
    return {
      v: 1, id: S.anonId || K.studentId(S.student), ts: new Date().toISOString(),
      student: { nume: '', prenume: '', grupa: S.student.grupa.trim() },
      cod: S.student.cod || '', profil: S.profil, exp: S.exp, per: S.per, imp: S.imp,
      momente: S.momente, global: S.global,
      dur: S.dur, rez: { ipcs: a.ipcs, ipcsW: a.ipcsW, sat: a.sat }, versiune: C.versiune
    };
  }
  function payloadWithCode() { var p = payload(); p.code = K.encodeCode(p); return p; }
  function copyCode() {
    var box = document.getElementById('codebox'), note = document.getElementById('copied');
    var done = function () { if (note) note.textContent = 'Copiat. Acum lipește-l în formular.'; };
    box.focus(); box.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(box.value).then(done, function () { try { document.execCommand('copy'); done(); } catch (e) { if (note) note.textContent = 'Selectează codul și copiază-l cu Ctrl+C.'; } });
    } else { try { document.execCommand('copy'); done(); } catch (e) { if (note) note.textContent = 'Selectează codul și copiază-l cu Ctrl+C.'; } }
  }
  function setStatus(msg) { var el = document.getElementById('status'); if (el) el.textContent = msg; }
  function downloadCopy() {
    var p = payload();
    K.download('servqual_ase_' + K.norm(p.student.grupa).replace(/\s+/g, '-') + '_' + p.id + '.json', JSON.stringify(p, null, 1), 'application/json');
    setStatus('Fișierul a fost descărcat. Trimite-l profesorului.');
  }
  function markSent(confirmed) {
    S.sent = true; S.sentConfirmed = confirmed; S.sentAt = new Date().toLocaleString('ro-RO'); save(); render(true);
  }
  function send() {
    if (firstMissing()) { render(true); return; }
    var body = JSON.stringify(payloadWithCode()), btn = document.getElementById('btn-send');
    if (btn) btn.disabled = true;
    setStatus('Se trimite…');
    fetch(CFG.endpoint, { method: 'POST', body: body, redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) { markSent(true); }
        else { if (btn) btn.disabled = false; setStatus('Serverul a respins trimiterea: ' + ((j && j.error) || 'motiv necunoscut') + '. Descarcă fișierul și trimite-l profesorului.'); }
      })
      .catch(function () {
        fetch(CFG.endpoint, { method: 'POST', body: body, mode: 'no-cors' })
          .then(function () { markSent(false); })
          .catch(function () { if (btn) btn.disabled = false; setStatus('Nu s-a putut trimite. Descarcă fișierul și trimite-l profesorului.'); });
      });
  }

  /* ---------- Pornire ---------- */
  if (S.started) showTime();
  render();
})();
