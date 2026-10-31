/* Date demonstrative (fictive) pentru a vedea cum arată zona profesorului. Nu sunt răspunsuri reale. */
window.CALITAS_DEMO = function (n) {
  'use strict';
  var C = window.CALITAS, K = window.CAL;
  var seed = 20261031;
  function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function norm() { return (rnd() + rnd() + rnd() + rnd() - 2) * 1.7; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  var grupe = ['1021', '1022', '1023'];
  var baseA = { T: 4.3, F: 4.6, R: 4.4, S: 4.5, E: 4.3 };
  var baseP = { T: 3.4, F: 3.1, R: 2.7, S: 3.6, E: 2.9 };
  var bump = { 5: -0.4, 8: 0.3, 10: -0.5, 11: -0.6, 13: -0.4, 17: 0.5, 19: -0.4, 20: 0.2 };
  var basImp = { T: 14, F: 24, R: 22, S: 20, E: 20 };
  var momBase = { a1: 2.9, a2: 2.3, a3: 3.6, a4: 2.8, a5: 3.0, a6: 3.1, a7: 2.7 };
  var exemple = { a1: 'Orarul s-a schimbat de trei ori în primele două săptămâni.', a2: 'Am așteptat o săptămână pentru o adeverință.', a3: 'La seminare profesorii au timp de întrebări.', a4: 'Anunțurile apar în trei locuri diferite.', a5: 'Nu sunt destule prize în bibliotecă.', a6: 'Notele au apărut târziu la o disciplină.', a7: 'Nu știam unde să depun dosarul de bursă.' };
  var p = C.profiles[0], out = [];
  for (var i = 0; i < n; i++) {
    var exp = [], per = [], uniform = (i === 9 || i === 33);
    C.items.forEach(function (it) {
      exp.push(uniform ? 5 : Math.round(clamp(baseA[it.d] + norm() * 0.45, 1, 5)));
      per.push(uniform ? 3 : Math.round(clamp(baseP[it.d] + (bump[it.n] || 0) + norm() * 0.75, 1, 5)));
    });
    var w = {}, tot = 0;
    K.ids.forEach(function (k) { w[k] = Math.max(1, basImp[k] + norm() * 5); tot += w[k]; });
    var imp = {}, s = 0, big = 'F';
    K.ids.forEach(function (k) { imp[k] = Math.round(w[k] / tot * 100 / 5) * 5; s += imp[k]; if (w[k] > w[big]) big = k; });
    imp[big] += 100 - s;
    var mom = {};
    p.momente.forEach(function (m) {
      var na = m.id === 'a7' ? rnd() < 0.45 : m.id === 'a2' ? rnd() < 0.15 : false;
      mom[m.id] = { r: na ? 9 : Math.round(clamp(momBase[m.id] + norm() * 0.6, 1, 5)), n: !na && rnd() < 0.15 ? exemple[m.id] : '' };
    });
    out.push({
      v: 1, id: 'demo' + (i + 1), ts: new Date(2026, 10, 4, 10, 0, i).toISOString(),
      student: { nume: '', prenume: '', grupa: grupe[i % grupe.length] }, profil: p.id, cod: '', exp: exp, per: per, imp: imp, momente: mom,
      global: { sat: Math.round(clamp(3.1 + norm() * 0.6, 1, 5)), nps: Math.round(clamp(6 + norm() * 1.6, 0, 10)), cuvant: pick(['aglomerat', 'birocrație', 'profesori buni', 'haotic', 'ok']) },
      dur: { total: (i === 14 ? 16 : 40 + Math.floor(rnd() * 16)) * 60 }
    });
  }
  return out;
};
