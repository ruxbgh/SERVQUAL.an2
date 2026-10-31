/* Funcții comune: calcule SERVQUAL, grafice SVG, stocare, export. */
(function () {
  'use strict';
  var C = window.CALITAS;
  var ids = C.dimensions.map(function (d) { return d.id; });
  var dimById = {};
  C.dimensions.forEach(function (d) { dimById[d.id] = d; });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mean(a) {
    if (!a.length) return NaN;
    var s = 0; for (var i = 0; i < a.length; i++) s += a[i];
    return s / a.length;
  }
  function sd(a) {
    if (a.length < 2) return 0;
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / a.length);
  }
  function fmt(x, d) {
    if (x == null || isNaN(x)) return '–';
    var t = x.toFixed(d == null ? 2 : d);
    if (/^-0[.,]?0*$/.test(t)) t = t.slice(1);
    return t.replace('.', ',').replace('-', '−');
  }
  function fmtS(x, d) {
    if (x == null || isNaN(x)) return '–';
    var s = fmt(x, d);
    return (x > 0 && s.charAt(0) !== '−' && /[1-9]/.test(s)) ? '+' + s : s;
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  function itemText(item, mode) {
    var exp = mode === 'A';
    var o = exp ? C.org.exp : C.org.per;
    return item.t.replace(/\{S\}/g, o.S).replace(/\{s\}/g, o.s).replace(/\{G\}/g, o.G);
  }
  function profileById(id) {
    for (var i = 0; i < C.profiles.length; i++) if (C.profiles[i].id === id) return C.profiles[i];
    return null;
  }
  function pickProfile(student) {
    var key = norm(student.nume) + '|' + norm(student.prenume) + '|' + norm(student.grupa);
    return C.profiles[hash(key) % C.profiles.length].id;
  }
  function studentId(student) {
    return 's' + hash(norm(student.nume) + '|' + norm(student.prenume) + '|' + norm(student.grupa)).toString(36);
  }

  /* ---------- Calcule SERVQUAL ---------- */
  function dimMeans(arr) {
    var o = {};
    C.dimensions.forEach(function (d) {
      o[d.id] = mean(d.items.map(function (n) { return arr[n - 1]; }));
    });
    return o;
  }
  // IPCS = media diferențelor (percepție − așteptare) pe cele 5 dimensiuni.
  function analyze(rec) {
    var A = dimMeans(rec.exp), P = dimMeans(rec.per), gap = {};
    ids.forEach(function (k) { gap[k] = P[k] - A[k]; });
    var ipcs = mean(ids.map(function (k) { return gap[k]; }));
    var imp = rec.imp || {}, tot = 0;
    ids.forEach(function (k) { tot += imp[k] || 0; });
    var ipcsW = tot ? ids.reduce(function (s, k) { return s + gap[k] * (imp[k] || 0) / tot; }, 0) : ipcs;
    var itemGap = rec.per.map(function (p, i) { return p - rec.exp[i]; });
    return { A: A, P: P, gap: gap, ipcs: ipcs, ipcsW: ipcsW, itemGap: itemGap,
             sat: mean(rec.per) / mean(rec.exp) * 100 };
  }
  function band(g) {
    if (g >= 0) return { k: 'ok', t: 'Așteptări atinse sau depășite' };
    if (g > -0.5) return { k: 'low', t: 'Discrepanță redusă' };
    if (g >= -1) return { k: 'mid', t: 'Discrepanță semnificativă' };
    return { k: 'high', t: 'Discrepanță critică' };
  }
  function flags(rec) {
    var f = [];
    var sdP = sd(rec.per), sdA = sd(rec.exp);
    if (sdP < 0.35 || sdA < 0.35) f.push('răspunsuri aproape uniforme');
    var minutes = rec.dur && rec.dur.total ? rec.dur.total / 60 : null;
    if (minutes != null && minutes < 20) f.push('durată sub 20 de minute');
    return f;
  }
  function validRec(r) {
    function okArr(a) {
      if (!Array.isArray(a) || a.length !== 22) return false;
      for (var i = 0; i < 22; i++) if (!(a[i] >= 1 && a[i] <= 5)) return false;
      return true;
    }
    return r && r.student && okArr(r.exp) && okArr(r.per);
  }

  /* ---------- Culori pentru celule (hartă de căldură) ---------- */
  function heat(g) {
    if (g == null || isNaN(g)) return '';
    var a = Math.min(Math.abs(g) / 2, 1) * 0.55 + 0.05;
    return g < 0 ? 'background:rgba(180,56,43,' + a.toFixed(2) + ')'
                 : 'background:rgba(47,125,91,' + a.toFixed(2) + ')';
  }
  function heat5(v) { // scara 1–5 pentru momente
    if (v == null || isNaN(v)) return '';
    var t = (v - 1) / 4; // 0..1
    var a = (Math.abs(t - 0.5) * 2) * 0.5 + 0.08;
    return t < 0.5 ? 'background:rgba(180,56,43,' + a.toFixed(2) + ')' : 'background:rgba(47,125,91,' + a.toFixed(2) + ')';
  }

  /* ---------- Grafice SVG ---------- */
  function radar(series) {
    var W = 470, H = 380, cx = 235, cy = 192, R = 125, n = ids.length;
    function pt(i, v) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n, r = R * (v - 1) / 4;
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    }
    var s = '<svg class="chart radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafic radar: așteptări și percepții pe dimensiuni">';
    for (var ring = 1; ring <= 5; ring++) {
      var p = ids.map(function (_, i) { return pt(i, ring).join(','); }).join(' ');
      s += '<polygon class="ring" points="' + p + '"/>';
      var lp = pt(0, ring);
      s += '<text class="tick" x="' + (lp[0] + 4) + '" y="' + (lp[1] + 3) + '">' + ring + '</text>';
    }
    ids.forEach(function (id, i) {
      var e = pt(i, 5), l = pt(i, 5.75), ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      var anchor = Math.abs(Math.cos(ang)) < 0.2 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
      s += '<line class="spoke" x1="' + cx + '" y1="' + cy + '" x2="' + e[0] + '" y2="' + e[1] + '"/>';
      s += '<text class="axis" text-anchor="' + anchor + '" x="' + l[0] + '" y="' + (l[1] + 4) + '">' + esc(dimById[id].scurt) + '</text>';
    });
    series.forEach(function (sr) {
      var pts = ids.map(function (id, i) { return pt(i, sr.v[id] || 1).join(','); }).join(' ');
      s += '<polygon class="ser ' + sr.cls + '" points="' + pts + '"/>';
      ids.forEach(function (id, i) { var q = pt(i, sr.v[id] || 1); s += '<circle class="dot ' + sr.cls + '" cx="' + q[0] + '" cy="' + q[1] + '" r="3.5"/>'; });
    });
    s += '</svg>';
    s += '<div class="legend">' + series.map(function (sr) { return '<span class="lg ' + sr.cls + '">' + esc(sr.name) + '</span>'; }).join('') + '</div>';
    return s;
  }

  // Bare divergente pentru diferențe (P − A)
  function divBars(rows, o) {
    o = o || {};
    var max = o.max || 3, lw = o.labelW || 230, pw = 360, rh = 24, W = lw + pw + 70;
    var H = rows.length * rh + 28, zero = lw + pw / 2;
    var s = '<svg class="chart bars" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.aria || 'Diferențe percepție minus așteptare') + '">';
    [-max, -max / 2, 0, max / 2, max].forEach(function (t) {
      var x = zero + t / max * (pw / 2);
      s += '<line class="' + (t === 0 ? 'zero' : 'grid') + '" x1="' + x + '" y1="14" x2="' + x + '" y2="' + (H - 6) + '"/>';
      s += '<text class="tick" text-anchor="middle" x="' + x + '" y="10">' + fmt(t, t % 1 ? 1 : 0) + '</text>';
    });
    rows.forEach(function (r, i) {
      var y = 20 + i * rh, v = Math.max(-max, Math.min(max, r.v)), w = Math.abs(v) / max * (pw / 2);
      var x = v < 0 ? zero - w : zero;
      s += '<text class="lab" text-anchor="end" x="' + (lw - 8) + '" y="' + (y + 13) + '">' + esc(r.label) + '</text>';
      s += '<rect class="bar ' + (r.v < 0 ? 'neg' : 'pos') + (r.hl ? ' hl' : '') + '" x="' + x + '" y="' + (y + 2) + '" width="' + Math.max(w, 1) + '" height="' + (rh - 8) + '"/>';
      s += '<text class="val" x="' + (zero + pw / 2 + 8) + '" y="' + (y + 13) + '">' + fmtS(r.v, 2) + '</text>';
    });
    return s + '</svg>';
  }

  // Matrice de prioritizare: importanță (y) față de diferență (x)
  function matrix(points, o) {
    o = o || {};
    var W = 560, H = 380, L = 56, T = 20, Rr = 20, B = 46;
    var xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
    var xt = o.xThresh, yt = o.yThresh;
    function X(v) { return L + (v - xmin) / (xmax - xmin) * (W - L - Rr); }
    function Y(v) { return H - B - (v - ymin) / (ymax - ymin) * (H - T - B); }
    var s = '<svg class="chart matrix" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Matrice de prioritizare: importanță și diferență">';
    s += '<rect class="q-hot" x="' + L + '" y="' + T + '" width="' + (X(xt) - L) + '" height="' + (Y(yt) - T) + '"/>';
    s += '<rect class="frame" x="' + L + '" y="' + T + '" width="' + (W - L - Rr) + '" height="' + (H - T - B) + '"/>';
    s += '<line class="grid" x1="' + X(xt) + '" y1="' + T + '" x2="' + X(xt) + '" y2="' + (H - B) + '"/>';
    s += '<line class="grid" x1="' + L + '" y1="' + Y(yt) + '" x2="' + (W - Rr) + '" y2="' + Y(yt) + '"/>';
    s += '<text class="qlab" x="' + (L + 8) + '" y="' + (T + 16) + '">Prioritate maximă</text>';
    s += '<text class="qlab" text-anchor="end" x="' + (W - Rr - 8) + '" y="' + (T + 16) + '">De menținut</text>';
    s += '<text class="qlab" x="' + (L + 8) + '" y="' + (H - B - 8) + '">Prioritate secundară</text>';
    s += '<text class="qlab" text-anchor="end" x="' + (W - Rr - 8) + '" y="' + (H - B - 8) + '">Posibil exces de efort</text>';
    s += '<text class="axis" text-anchor="middle" x="' + (L + (W - L - Rr) / 2) + '" y="' + (H - 10) + '">Diferența P − A (spre stânga = deficit mai mare)</text>';
    s += '<text class="axis" text-anchor="middle" transform="translate(14,' + (T + (H - T - B) / 2) + ') rotate(-90)">Importanță (puncte din 100)</text>';
    points.forEach(function (p) {
      var x = X(Math.max(xmin, Math.min(xmax, p.x))), y = Y(Math.max(ymin, Math.min(ymax, p.y)));
      s += '<circle class="pt" cx="' + x + '" cy="' + y + '" r="9"/>';
      s += '<text class="ptl" x="' + (x + 13) + '" y="' + (y + 4) + '">' + esc(p.label) + '</text>';
    });
    return s + '</svg>';
  }

  function histogram(values, edges, labels) {
    var counts = edges.slice(0, -1).map(function () { return 0; });
    values.forEach(function (v) {
      for (var i = 0; i < counts.length; i++) {
        if (v >= edges[i] && (v < edges[i + 1] || (i === counts.length - 1 && v <= edges[i + 1]))) { counts[i]++; break; }
      }
    });
    var mx = Math.max.apply(null, counts.concat([1]));
    return '<div class="hist">' + counts.map(function (c, i) {
      return '<div class="hcol"><div class="hn">' + c + '</div><div class="hbar" style="height:' + Math.round(c / mx * 100) + 'px"></div><div class="hl">' + esc(labels[i]) + '</div></div>';
    }).join('') + '</div>';
  }

  /* ---------- Stocare, export ---------- */
  var store = {
    get: function (k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignorat */ } }
  };
  function download(name, text, mime) {
    var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvCell(v) {
    var s = v == null ? '' : String(v);
    return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(recs) {
    var head = ['nume', 'prenume', 'grupa', 'profil'];
    for (var i = 1; i <= 22; i++) head.push('A' + i);
    for (i = 1; i <= 22; i++) head.push('P' + i);
    ids.forEach(function (k) { head.push('imp_' + k); });
    head = head.concat(['IPCS', 'IPCS_ponderat', 'grad_satisfactie_%', 'satisfactie_1_5', 'recomandare_0_10', 'durata_min']);
    var lines = [head.join(';')];
    recs.forEach(function (r) {
      var a = analyze(r), row = [r.student.nume, r.student.prenume, r.student.grupa, r.profil];
      row = row.concat(r.exp, r.per);
      ids.forEach(function (k) { row.push(r.imp ? r.imp[k] : ''); });
      row.push(fmt(a.ipcs, 3), fmt(a.ipcsW, 3), fmt(a.sat, 1), r.global ? r.global.sat : '', r.global ? r.global.nps : '', r.dur && r.dur.total ? Math.round(r.dur.total / 60) : '');
      lines.push(row.map(csvCell).join(';'));
    });
    return '﻿' + lines.join('\r\n');
  }

  /* ---------- Codul de rezultat ----------
     Un text scurt pe care studentul îl copiază (de exemplu într-un Google Form), iar profesorul îl lipește
     în zona lui. Format: CAL1.<date în base64url>.<sumă de control>. Observațiile scrise nu sunt incluse. */
  function b64e(s) { return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function b64d(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }
  function clean(s) { return String(s || '').replace(/[|~]/g, ' ').trim(); }
  function encodeCode(rec) {
    var p = profileById(rec.profil), pi = C.profiles.indexOf(p);
    var mom = p ? p.momente.map(function (m) { var x = (rec.momente || {})[m.id]; return x && x.r ? x.r : 0; }).join('') : '';
    var g = rec.global || {};
    var parts = [pi, clean(rec.student.nume), clean(rec.student.prenume), clean(rec.student.grupa),
      rec.exp.join(''), rec.per.join(''), ids.map(function (k) { return rec.imp ? rec.imp[k] : 20; }).join(','),
      mom, g.sat || 0, g.nps >= 0 ? g.nps : -1, rec.dur && rec.dur.total ? Math.round(rec.dur.total / 60) : 0, clean(g.cuvant), clean(rec.id)];
    var body = b64e(parts.join('|'));
    return 'CAL1.' + body + '.' + (hash(body) % 1679616).toString(36);
  }
  function decodeCode(code) {
    var m = /^CAL1\.([A-Za-z0-9_-]+)\.([0-9a-z]{1,4})$/.exec(String(code).trim());
    if (!m) return { error: 'format' };
    if ((hash(m[1]) % 1679616).toString(36) !== m[2]) return { error: 'checksum' };
    var f;
    try { f = b64d(m[1]).split('|'); } catch (e) { return { error: 'format' }; }
    if (f.length < 12) return { error: 'format' };
    var p = C.profiles[+f[0]];
    var digits = function (s) { return s.split('').map(Number); };
    var imp = {}; f[6].split(',').forEach(function (v, i) { imp[ids[i]] = +v; });
    var momente = {};
    if (p) p.momente.forEach(function (mm, i) { var r = +(f[7].charAt(i) || 0); if (r) momente[mm.id] = { r: r, n: '' }; });
    var rec = {
      v: 1, student: { nume: f[1], prenume: f[2], grupa: f[3] }, profil: p ? p.id : null,
      exp: digits(f[4]), per: digits(f[5]), imp: imp, momente: momente,
      global: { sat: +f[8], nps: +f[9], cuvant: f[11] || '' }, dur: { total: (+f[10]) * 60 }, ts: ''
    };
    rec.id = f[12] || studentId(rec.student);
    return validRec(rec) && rec.profil ? { rec: rec } : { error: 'format' };
  }
  function findCodes(text) { return String(text || '').match(/CAL1\.[A-Za-z0-9_-]+\.[0-9a-z]{1,4}/g) || []; }

  window.CAL = {
    encodeCode: encodeCode, decodeCode: decodeCode, findCodes: findCodes,
    ids: ids, dimById: dimById, esc: esc, mean: mean, sd: sd, fmt: fmt, fmtS: fmtS, norm: norm, hash: hash,
    itemText: itemText, profileById: profileById, pickProfile: pickProfile, studentId: studentId,
    dimMeans: dimMeans, analyze: analyze, band: band, flags: flags, validRec: validRec,
    heat: heat, heat5: heat5, radar: radar, divBars: divBars, matrix: matrix, histogram: histogram,
    store: store, download: download, toCSV: toCSV
  };
})();
