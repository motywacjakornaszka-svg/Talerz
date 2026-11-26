/* Nawyki i Talerz 4.2 – Elastyczne nawyki + licznik kalorii Talerz w jednej aplikacji */
(function () {
"use strict";
var VER = "4.2";
var KEY = "nawyki-v3", OLD = "nawyki-v2", KEYS = "nawyki-v3-klucze";
var CATS = NAW.CATS, LV = NAW.LV, ST = NAW.ST, ET = NAW.ET, PROV = NAW.PROV;

/* ---------- narzędzia ---------- */
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function ago(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; }
function k2d(k) { var q = k.split("-"); return new Date(+q[0], +q[1] - 1, +q[2], 12); }
function offOf(k) { var t = new Date(); t.setHours(12, 0, 0, 0); return Math.round((t - k2d(k)) / 864e5); }
function $(i) { return document.getElementById(i); }
function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function uid(p) { return (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function hm(t) { var d = new Date(t); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function dlong(k) { return k2d(k).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function dshort(k) { return k2d(k).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" }); }
function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l"); }
function tagsOf(s) { var m = String(s || "").match(/#[\p{L}\d_-]+/gu) || []; return m.map(function (x) { return x.toLowerCase(); }); }
function hashN(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function toast(t, ms) { var e = document.createElement("div"); e.className = "toast"; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, ms || 3200); }
function dl(n, t, m) { var a = document.createElement("a"); a.href = URL.createObjectURL(t instanceof Blob ? t : new Blob([t], { type: m })); a.download = n; document.body.appendChild(a); a.click(); a.remove(); }
function md(t) {
  var L = esc(t || "").split(/\n/), o = "", inl = false;
  function il(s) { return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|\s)\*(\S[^*]*?)\*/g, "$1<i>$2</i>"); }
  L.forEach(function (l) {
    var m;
    if ((m = /^\s*(?:[-*•]|\d+[.)])\s+(.*)/.exec(l))) { if (!inl) { o += "<ul>"; inl = true; } o += "<li>" + il(m[1]) + "</li>"; return; }
    if (inl) { o += "</ul>"; inl = false; }
    if ((m = /^\s*#{1,6}\s*(.*)/.exec(l))) o += "<h4>" + il(m[1]) + "</h4>";
    else if (l.trim()) o += "<p>" + il(l) + "</p>";
  });
  return o + (inl ? "</ul>" : "");
}

/* ---------- stan i migracja (dane z wersji 2 zostają nietknięte) ---------- */
var S = null, migrated = false;
try { var r0 = localStorage.getItem(KEY); if (r0) S = JSON.parse(r0); } catch (e) {}
if (!S) {
  try {
    var o0 = localStorage.getItem(OLD);
    if (o0) { S = JSON.parse(o0); localStorage.setItem(OLD + "-kopia-" + key(new Date()), o0); migrated = true; }
  } catch (e) {}
}
function migrate(p) {
  p = p && typeof p === "object" ? p : {};
  p.l = p.l || {}; p.ro = p.ro || {}; p.n = p.n || {};
  if (!p.h || !p.h.length) p.h = NAW.DEF.map(function (x) { return x.concat(["", "", "", ""]); });
  if (!p.q) p.q = NAW.QD.slice();
  if ((p.qv || 0) < 2) { NAW.QN.forEach(function (x) { if (p.q.indexOf(x) < 0) p.q.push(x); }); p.qv = 2; }
  p.fs = p.fs || []; p.fg = p.fg || 16;
  p.ex = p.ex || { s: NAW.SIT.map(function (x) { return [x[0], x[1], x[2], 30]; }), t: NAW.STD.map(function (x) { return [x, "W wolnej przestrzeni", "Przy krześle, dłoń na oparciu", 30]; }) };
  p.ry = p.ry || NAW.RY.map(function (x, i) { return ["r" + i, x[0], x[1], x[2], 0]; });
  /* nowe w 3.0 */
  p.j = p.j || []; p.pa = p.pa || {}; p.hn = p.hn || {}; p.g = p.g || []; p.pj = p.pj || [];
  p.mt = p.mt || []; p.rev = p.rev || []; p.fc = p.fc || []; p.bk = p.bk || 0;
  var s = p.set = p.set || {};
  if (!s.theme) s.theme = "auto"; if (!s.prov) s.prov = "gemini"; if (!s.vprov) s.vprov = "auto";
  if (!s.tone) s.tone = "coach"; if (s.about == null) s.about = "";
  if (!s.share) s.share = { d: 1, h: 1, f: 1, p: 1 };
  if (s.share.t == null) s.share.t = 1;
  if (!s.dr) s.dr = "21:00"; if (s.drOn == null) s.drOn = 0;
  if (!s.col) s.col = {};
  p.ver = 3;
  return p;
}
S = migrate(S);
var H = S.h;
function sv() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("⚠️ Brak miejsca w pamięci – zrób kopię i usuń stare zdjęcia."); } }
sv();
var K = {}; try { K = JSON.parse(localStorage.getItem(KEYS) || "{}"); } catch (e) {}
function svK() { try { localStorage.setItem(KEYS, JSON.stringify(K)); } catch (e) {} }
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}

/* ---------- media (zdjęcia, nagrania) w IndexedDB ---------- */
var MDB = {
  db: null,
  open: function () { var t = this; if (!t.db) t.db = new Promise(function (res, rej) { var r = indexedDB.open("nawyki-media", 1); r.onupgradeneeded = function () { r.result.createObjectStore("m"); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); return t.db; },
  op: function (mode, fn) { return this.open().then(function (db) { return new Promise(function (res, rej) { var tx = db.transaction("m", mode), st = tx.objectStore("m"), rq = fn(st); tx.oncomplete = function () { res(rq && rq.result); }; tx.onerror = function () { rej(tx.error); }; }); }); },
  put: function (id, b) { return this.op("readwrite", function (s) { return s.put(b, id); }); },
  get: function (id) { return this.op("readonly", function (s) { return s.get(id); }); },
  del: function (id) { return this.op("readwrite", function (s) { return s.delete(id); }); },
  keys: function () { return this.op("readonly", function (s) { return s.getAllKeys(); }); }
};
var URLS = {};
function hydrate() {
  document.querySelectorAll("[data-mid]").forEach(function (el) {
    var id = el.getAttribute("data-mid");
    if (URLS[id]) { if (el.src !== URLS[id]) el.src = URLS[id]; return; }
    MDB.get(id).then(function (b) { if (b) { URLS[id] = URL.createObjectURL(b); el.src = URLS[id]; } }).catch(function () {});
  });
}
function b2b64(b) { return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(",")[1]); }; fr.readAsDataURL(b); }); }
function shrink(file) {
  return new Promise(function (res, rej) {
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function () {
      var m = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, m / Math.max(w, h));
      var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      c.toBlob(function (b) { b ? res(b) : rej(new Error("Nie udało się przetworzyć zdjęcia")); }, "image/jpeg", 0.82);
    };
    img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("Nie udało się odczytać zdjęcia")); };
    img.src = u;
  });
}
/* nagranie -> WAV 16 kHz mono (działa z każdym dostawcą AI) */
function toWav(blob) {
  return blob.arrayBuffer().then(function (ab) {
    var AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    return new Promise(function (res, rej) { ac.decodeAudioData(ab, res, rej); }).then(function (buf) {
      ac.close && ac.close();
      var rate = 16000, len = Math.ceil(buf.duration * rate), off = new OfflineAudioContext(1, len, rate), src = off.createBufferSource();
      src.buffer = buf; src.connect(off.destination); src.start();
      return off.startRendering();
    }).then(function (r) {
      var d = r.getChannelData(0), n = d.length, v = new DataView(new ArrayBuffer(44 + n * 2));
      function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
      ws(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); ws(8, "WAVE"); ws(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, "data"); v.setUint32(40, n * 2, true);
      for (var i = 0; i < n; i++) { var s = Math.max(-1, Math.min(1, d[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
      return new Blob([v], { type: "audio/wav" });
    });
  });
}

/* ---------- obliczenia nawyków ---------- */
/* ---------- JEDZENIE: dane z Talerza (ten sam adres = ta sama pamięć przeglądarki) ---------- */
/* Obliczenia odpowiadają funkcjom drinkStats/foodStats/totals/calc w talerz.html – przy zmianie tam, zmień też tu. */
/* napój: [kcal/100 ml, cukier/100 ml, alkohol, sok 100%, słodki] */
var TZ_DR = { kawa: [2, 0], mleko: [50, 0], sok: [45, 9, 0, 1], slodki: [42, 10.6, 0, 0, 1], nektar: [50, 11, 0, 0, 1], energ: [45, 11, 0, 0, 1], piwo: [43, 0, 1], wino: [83, 0, 1] };
var TZ_VEG = { warzywa: 1, owoce: 1, straczki: 1 };
var TZC = {};
function tzGet(k) { try { return JSON.parse(localStorage.getItem("talerz:" + k)); } catch (e) { return null; } }
function tzReset() { TZC = {}; }
function tzProf() { if (!("$p" in TZC)) TZC.$p = tzGet("profile"); return TZC.$p; }
function tzWaterGoal(steps) { var p = tzProf(); if (p && +p.waterGoal) return +p.waterGoal; var w = p && +p.weight || 70, b = Math.max(0, (steps || 0) - 4000) / 2000 * 100; return Math.round(Math.max(1500, Math.min(3500, w * 30 + b)) / 50) * 50; }
/* dzienna norma białka – jak w Talerzu: 1,6 g na kg (przy odchudzaniu liczone od średniej z wagi i celu) */
function tzProtT() { var p = tzProf(), w = p && +p.weight || 0; if (!w) return 100; return Math.round(1.6 * Math.min(w, (p.goal && +p.goal < w) ? (+p.goal + w) / 2 : w)); }
/* podsumowanie dnia z Talerza: płyny, warzywa, cukier, kalorie (z napojami), białko, limit, kroki */
function tz(k) {
  if (k in TZC) return TZC[k];
  var d = tzGet("day-" + k), r = null;
  if (d && ((d.meals || []).length || (d.drinks || []).length || d.steps || d.extra)) {
    var cust = {}; ((tzProf() || {}).customDrinks || []).forEach(function (c) { cust[c.k] = c; });
    var ml = 0, dk = 0, ds = 0, sw = 0, jui = 0, alc = 0, kcal = 0, sug = 0, veg = 0, pr = 0, cb = 0, ft = 0, late = 0, ML = [];
    (d.drinks || []).forEach(function (x) {
      var t = x.type || "woda", v = +x.ml || 0, c = cust[t], df = c ? [+c.kcal || 0, +c.sug || 0, c.alc ? 1 : 0, 0, !c.alc && +c.sug >= 2.5 ? 1 : 0] : (TZ_DR[t] || [0, 0]);
      if (df[2]) alc += v; else ml += v; dk += df[0] * v / 100; ds += df[1] * v / 100; if (df[4]) sw += v; if (df[3]) jui += v;
    });
    if (jui > 150) sw += jui - 150;
    (d.meals || []).forEach(function (m) {
      kcal += +m.kcal || 0; pr += +m.p || 0; cb += +m.c || 0; ft += +m.f || 0; if (m.time && m.time >= "20:00") late++;
      (m.items || []).forEach(function (x) { if (TZ_VEG[x.cat]) veg += +x.grams || 0; sug += +x.sug || 0; });
      ML.push((m.time ? m.time + " " : "") + (m.name || "posiłek") + " " + Math.round(+m.kcal || 0) + " kcal (B" + Math.round(+m.p || 0) + " W" + Math.round(+m.c || 0) + " T" + Math.round(+m.f || 0) + ")");
    });
    r = { ml: Math.round(ml), wg: tzWaterGoal(d.steps), veg: Math.round(veg), sug: Math.round(sug + ds), kcal: Math.round(kcal + dk), dk: Math.round(dk), p: Math.round(pr), c: Math.round(cb + ds), f: Math.round(ft),
      lim: d.limit ? Math.round(d.limit) : null, steps: +d.steps || 0, ex: +d.extra || 0, meals: (d.meals || []).length, sw: Math.round(sw), alc: Math.round(alc), late: late, ML: ML,
      names: (d.meals || []).map(function (m) { return m.name; }).filter(Boolean) };
  }
  return (TZC[k] = r);
}
function tzWeights() { var p = tzProf(); return (p && p.weights || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
function kgf(v) { return String(Math.round(v * 10) / 10).replace(".", ","); }
/* trend wagi: średnia z 7 dni i tempo (prosta dopasowana do wpisów z 28 dni) – jak na wykresie w Jedzeniu */
function tzTrend() {
  var all = tzWeights(); if (!all.length) return null;
  function tt(w) { return k2d(w.date).getTime(); }
  var t1 = tt(all[all.length - 1]), w28 = all.filter(function (w) { return t1 - tt(w) <= 28 * 864e5; }), w7 = all.filter(function (w) { return t1 - tt(w) < 7 * 864e5; });
  var r = { avg7: w7.reduce(function (s, w) { return s + +w.kg; }, 0) / w7.length, rate: null, eta: null, goal: +((tzProf() || {}).goal) || null };
  if (w28.length >= 3 && (t1 - tt(w28[0])) / 864e5 >= 7) {
    var xs = w28.map(function (w) { return (tt(w) - t1) / (7 * 864e5); }), ys = w28.map(function (w) { return +w.kg; }), mx = 0, my = 0, nu = 0, de = 0, i;
    for (i = 0; i < xs.length; i++) { mx += xs[i] / xs.length; my += ys[i] / ys.length; }
    for (i = 0; i < xs.length; i++) { nu += (xs[i] - mx) * (ys[i] - my); de += (xs[i] - mx) * (xs[i] - mx); }
    if (de > 0) r.rate = nu / de;
  }
  if (r.goal && r.rate && Math.abs(r.rate) >= 0.05 && (r.goal - r.avg7) / r.rate > 0) r.eta = Math.ceil((r.goal - r.avg7) / r.rate);
  return r;
}
function trendTxt(r) { if (!r) return ""; return (r.rate == null ? "📊" : r.rate < -0.05 ? "📉" : r.rate > 0.05 ? "📈" : "➡️") + " Średnia 7 dni: " + kgf(r.avg7) + " kg" + (r.rate != null ? " · tempo " + (r.rate > 0 ? "+" : "") + kgf(r.rate) + " kg/tydz." + (r.eta ? " · cel za ok. " + r.eta + " tyg." : "") : " · tempo pojawi się po tygodniu ważenia"); }
function pl(n, a, b, c) { return n === 1 ? a : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? b : c; }
function litr(ml) { return (Math.round(ml / 100) / 10).toFixed(1).replace(".", ",") + " l"; }
/* nawyki zaliczane automatycznie: [nazwa, jednostka, kierunek (1 – im więcej tym lepiej, -1 – im mniej), wartość, domyślne progi Mini/Plus/Elita] */
var TZM = {
  water: ["💧 Woda i płyny", "ml", 1, function (t) { return t.ml; }, [1000, 1500, 2000]],
  veg: ["🥦 Warzywa i owoce", "g", 1, function (t) { return t.veg; }, [100, 250, 400]],
  protein: ["🥩 Białko (% dziennej normy)", "% normy", 1, function (t) { return Math.round(t.p / tzProtT() * 100); }, [50, 75, 100]],
  steps: ["👟 Kroki", "kroków", 1, function (t) { return t.steps; }, [4000, 7000, 10000]],
  sugar: ["🍬 Cukry wolne (najwyżej)", "g", -1, function (t) { return t.sug; }, [50, 30, 15]],
  log: ["🍽️ Jedzenie zapisane i w limicie", "", 0, null, null]
};
var TZDEF = [["w8", "water"], ["w7", "veg"], ["w3", "steps"]];
function tzLinksInit() {
  var ch = false;
  if (!S.lk) { S.lk = {}; TZDEF.forEach(function (x) { if (H.some(function (h) { return h[0] === x[0]; })) S.lk[x[0]] = { m: x[1], t: TZM[x[1]][4].slice() }; }); ch = true; }
  if (!S.set.lkp) { /* 4.1: nawyk z białkiem zalicza się sam */
    S.set.lkp = 1; ch = true;
    var hb = H.filter(function (h) { return /białk/i.test(h[2]) && !S.lk[h[0]]; })[0];
    if (hb) S.lk[hb[0]] = { m: "protein", t: TZM.protein[4].slice() };
  }
  if (ch) sv();
}
function autoLv(k, id) {
  var L = S.lk && S.lk[id], M = L && TZM[L.m]; if (!M) return 0;
  var t = tz(k); if (!t) return 0;
  if (L.m === "log") return t.meals >= 3 && t.lim && t.kcal <= t.lim ? 3 : t.meals >= 3 ? 2 : t.meals ? 1 : 0;
  if (L.m === "protein" && !t.meals) return 0;
  var v = M[3](t), q = L.t || M[4];
  if (M[2] < 0) { if (!t.meals) return 0; return v <= q[2] ? 3 : v <= q[1] ? 2 : v <= q[0] ? 1 : 0; }
  return v >= q[2] ? 3 : v >= q[1] ? 2 : v >= q[0] ? 1 : 0;
}
function autoTxt(k, id) {
  var L = S.lk && S.lk[id], M = L && TZM[L.m]; if (!M) return "";
  var t = tz(k) || { ml: 0, veg: 0, steps: 0, sug: 0, meals: 0, kcal: 0, p: 0, lim: null };
  if (L.m === "log") return "⚡ posiłki: " + t.meals + (t.lim ? " · " + t.kcal + "/" + t.lim + " kcal" : "");
  var q = L.t || M[4], v = M[3](t);
  if (M[2] < 0) return "⚡ " + v + " " + M[1] + (t.meals ? "" : " (brak posiłków)") + " · Elita ≤ " + q[2];
  var nx = v < q[0] ? ["Mini", q[0]] : v < q[1] ? ["Plus", q[1]] : v < q[2] ? ["Elita", q[2]] : null;
  if (L.m === "protein") { var pT = tzProtT(); return "⚡ " + t.p + "/" + pT + " g białka" + (nx ? " · do " + nx[0] + ": " + Math.max(1, Math.ceil(nx[1] * pT / 100 - t.p)) + " g" : " ✓"); }
  return "⚡ " + v.toLocaleString("pl-PL") + " " + M[1] + (nx ? " · do " + nx[0] + ": " + (nx[1] - v).toLocaleString("pl-PL") : " ✓");
}

/* ---------- cel żywieniowy tygodnia (mierzony z danych Jedzenia) ---------- */
var WG = {
  veg: ["🥦 400 g warzyw i owoców", function (t) { return t.veg >= 400; }],
  water: ["💧 Cel płynów", function (t) { return t.ml >= t.wg; }],
  protein: ["🥩 Białko w normie", function (t) { return t.p >= tzProtT() * 0.9; }],
  sugar: ["🍬 Cukry wolne najwyżej 30 g", function (t) { return t.meals > 0 && t.sug <= 30; }],
  nosweet: ["🥤 Bez słodkich napojów", function (t) { return t.meals > 0 && !t.sw; }],
  limit: ["🎯 Kalorie w limicie (min. 3 posiłki)", function (t) { return t.meals >= 3 && t.lim && t.kcal <= t.lim; }],
  late: ["🌙 Bez jedzenia po 20:00", function (t) { return t.meals > 0 && !t.late; }],
  steps: ["👟 8000 kroków", function (t) { return t.steps >= 8000; }]
};
function monKey(d) { d = new Date(d || new Date()); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return key(d); }
function wgDays(wk) { var a = [], d = k2d(wk); for (var i = 0; i < 7; i++) { var x = new Date(d); x.setDate(d.getDate() + i); a.push(key(x)); } return a; }
function wgDone(g, k) { var t = tz(k); return !!(t && WG[g] && WG[g][1](t)); }
function wgCount(w) { var td = key(new Date()); return wgDays(w.wk).filter(function (k) { return k <= td && wgDone(w.g, k); }).length; }
function wgInit() {
  var mk = monKey();
  if (S.wg && !WG[S.wg.g]) S.wg = null;
  if (S.wg && S.wg.wk !== mk) { /* nowy tydzień: zapisz wynik i zostań przy tym samym celu */
    var o = S.wg; o.done = wgCount(o); S.wgh = (S.wgh || []).concat([o]).slice(-26); S.wg = { wk: mk, g: o.g, n: o.n }; sv();
  }
}
function wgDots(w) {
  var td = key(new Date());
  return '<div class="wgd">' + wgDays(w.wk).map(function (k, i) { var c = k > td ? "" : wgDone(w.g, k) ? " on" : k === td ? " td" : " no"; return '<span class="d' + c + '" title="' + dshort(k) + '">' + ["P", "W", "Ś", "C", "P", "S", "N"][i] + "</span>"; }).join("") + "</div>";
}
function wgLine() {
  if (!S.wg) return '<div class="wgl"><button class="lnk" data-a="wgset">🎯 Wybierz cel żywieniowy na ten tydzień ›</button></div>';
  var c = wgCount(S.wg);
  return '<div class="wgl"><span>🎯 <b>' + WG[S.wg.g][0] + "</b> · " + c + "/" + S.wg.n + " " + pl(S.wg.n, "dzień", "dni", "dni") + (c >= S.wg.n ? " ✅" : "") + '</span><button class="lnk" data-a="wgset">Zmień</button></div>' + wgDots(S.wg);
}
function wgSheet() {
  var cur = S.wg || { g: "", n: 5 }, h = '<div class="note" style="margin-bottom:8px">Jeden mały cel na tydzień działa lepiej niż pilnowanie wszystkiego naraz. Postęp liczy się sam z danych Jedzenia.</div>';
  h += Object.keys(WG).map(function (g) { return '<button class="opt' + (cur.g === g ? " on" : "") + '" data-a="wgpick" data-id="' + g + '">' + WG[g][0] + "</button>"; }).join("");
  h += '<div class="note" style="margin:12px 0 6px">Ile dni w tygodniu?</div><div class="btns">' + [3, 4, 5, 6, 7].map(function (n) { return '<button class="' + (cur.n === n ? "pri" : "sec") + ' sm" data-a="wgn" data-id="' + n + '">' + n + "</button>"; }).join("") + "</div>";
  var hi = (S.wgh || []).slice(-4).reverse();
  if (hi.length) h += '<div class="note" style="margin-top:12px"><b>Poprzednie tygodnie</b><br>' + hi.map(function (w) { return dshort(w.wk) + ": " + (WG[w.g] ? WG[w.g][0] : w.g) + " – " + w.done + "/" + w.n + (w.done >= w.n ? " ✅" : ""); }).join("<br>") + "</div>";
  if (S.wg) h += '<button class="lnk" data-a="wgoff" style="margin-top:10px">Bez celu w tym tygodniu</button>';
  openSheet("🎯 Cel żywieniowy tygodnia", h, function () { render(); });
}

/* ---------- wieczorny bilans i ochrona serii ---------- */
function evGaps(k) {
  var t = tz(k) || { ml: 0, wg: tzWaterGoal(0), veg: 0, sug: 0, kcal: 0, p: 0, lim: null, steps: 0, meals: 0 }, a = [], pT = tzProtT();
  if (!t.meals) a.push(["🍽️", "Brak zapisanych posiłków – dodaj je, żeby bilans był pełny", "brak posiłków"]);
  else if (t.lim) { var rem = t.lim - t.kcal; a.push(rem >= 0 ? ["🔥", "Zostało " + rem + " kcal" + (rem >= 300 ? " – starczy na normalną kolację" : rem >= 120 ? " – na lekką kolację lub przekąskę" : ""), "zostało " + rem + " kcal"] : ["🔥", "Ponad limit o " + (-rem) + " kcal – nic się nie stało, jutro zwykły dzień, bez głodzenia", "ponad limit o " + (-rem) + " kcal"]); }
  if (t.ml < t.wg) { var gl = Math.ceil((t.wg - t.ml) / 250); a.push(["💧", "Brakuje " + litr(t.wg - t.ml) + " płynów (ok. " + gl + " " + pl(gl, "szklanka", "szklanki", "szklanek") + ")", litr(t.wg - t.ml) + " płynów"]); }
  if (t.meals && t.veg < 400) a.push(["🥦", "Brakuje " + (400 - t.veg) + " g warzyw lub owoców – np. surówka albo owoc do kolacji", (400 - t.veg) + " g warzyw"]);
  if (t.meals && t.p < pT * 0.9) a.push(["🥩", "Białko " + t.p + "/" + pT + " g – dorzuć twaróg, jajka, rybę, kefir lub strączki", (pT - t.p) + " g białka"]);
  if (t.sug > 30) a.push(["🍬", "Cukry wolne " + t.sug + " g (maks. 30 g) – wieczorem już bez słodyczy", ""]);
  var sl = Object.keys(S.lk || {}).map(function (id) { return S.lk[id]; }).filter(function (l) { return l.m === "steps"; })[0], sg = sl ? (sl.t || TZM.steps[4])[1] : 7000;
  if (!t.steps) a.push(["👟", "Wpisz dzisiejsze kroki z telefonu lub zegarka", ""]);
  else if (t.steps < sg) a.push(["👟", "Do " + sg.toLocaleString("pl-PL") + " kroków brakuje " + (sg - t.steps).toLocaleString("pl-PL") + " – wystarczy krótki spacer", (sg - t.steps).toLocaleString("pl-PL") + " kroków"]);
  return a;
}
function atRisk(k) { return H.filter(function (y) { return lvl(k, y[0]) === 0; }).map(function (y) { return [y, hStreak(y[0])]; }).filter(function (x) { return x[1] >= 3; }).sort(function (a, b) { return b[1] - a[1]; }); }
function hmMin(t) { var q = pt(t); return q ? q[0] * 60 + q[1] : null; }
function evNow() { var q = hmMin(S.set.ev.t), n = new Date(); return !!(S.set.ev.on && q != null && n.getHours() * 60 + n.getMinutes() >= q); }
function evNote(k) {
  tzReset(); var g = evGaps(k), miss = g.filter(function (x) { return x[2] && x[0] !== "🔥" && x[0] !== "🍽️"; }).map(function (x) { return x[2]; }), kc = g.filter(function (x) { return x[0] === "🔥" || x[0] === "🍽️"; })[0], r = atRisk(k), b = [];
  if (kc) b.push(kc[2].charAt(0).toUpperCase() + kc[2].slice(1));
  if (miss.length) b.push("brakuje: " + miss.join(", "));
  if (r.length) b.push("🔥 " + r.length + " " + pl(r.length, "seria", "serie", "serii") + " do ochrony");
  if (dLv(k) === 0) b.push("📔 pytania dnia czekają");
  return b.length ? b.join(" · ") : "Jedzenie, płyny i ruch w normie – świetny dzień ✅";
}
function evCard(k) {
  if (off !== 0 || !evNow()) return "";
  var g = evGaps(k), r = atRisk(k), L = LL(k), done = H.filter(function (y) { return L[y[0]]; }).length;
  var h = '<div class="card ev"><h3>🌆 Wieczorny bilans</h3>';
  if (!g.length) h += '<div class="evl"><i>✅</i><span>Jedzenie, płyny i ruch w normie – dobra robota!</span></div>';
  g.forEach(function (x) { h += '<div class="evl"><i>' + x[0] + "</i><span>" + esc(x[1]) + "</span></div>"; });
  h += '<div class="evl"><i>✅</i><span>Nawyki: ' + done + "/" + H.length + " zaliczone dziś</span></div>";
  if (r.length) h += '<div class="evl"><i>🔥</i><span>Nie przerwij serii – wystarczy Mini: ' + r.slice(0, 4).map(function (x) { return "<b>" + esc(x[0][2]) + "</b> (" + x[1] + " " + pl(x[1], "dzień", "dni", "dni") + ")"; }).join(", ") + "</span></div>";
  if (dLv(k) === 0) h += '<div class="evl"><i>📔</i><span>Pamiętnik: odpowiedz na pytania dnia – wystarczy jedno zdanie</span></div>';
  h += hasAI() ? '<div class="btns" style="margin-top:10px"><button class="pri sm" data-a="tmrw">🧭 Co zjeść jutro?</button></div>' : '<div class="note" style="margin-top:8px">Dodaj klucz AI w Ustawieniach, a mentor zaproponuje jadłospis na jutro.</div>';
  return h + "</div>";
}
function on(m) { return !!(S.set.mod && S.set.mod[m]); }
function v42Init() {
  var ch = false;
  if (!S.set.tts) { S.set.tts = { mode: "voice", voice: "", rate: 1 }; ch = true; }
  if (!S.set.v42mig) { /* odpowiedzi AI z pamiętnika (podpowiedzi i analizy zdjęć) trafiają do rozmów z mentorem */
    S.set.v42mig = 1; ch = true;
    Object.keys(S.pa || {}).forEach(function (k) { var p = S.pa[k]; if (p && p.m) { var ts = p.mts || k2d(k).getTime(); S.mt.push({ r: "u", t: "🧠 Omów moje odpowiedzi w pamiętniku (" + dshort(k) + ")", ts: ts }, { r: "m", t: p.m, ts: ts + 1 }); delete p.m; delete p.mts; } });
    (S.j || []).forEach(function (e) { if (e.ai) { var im = (e.media || []).filter(function (m) { return m.k === "img"; }).map(function (m) { return m.id; }); var q = { r: "u", t: "📷 Co widzisz na moim zdjęciu z pamiętnika?" + (e.text ? " – " + e.text.slice(0, 80) : ""), ts: e.t || Date.now() }; if (im.length) q.im = im; S.mt.push(q, { r: "m", t: e.ai, ts: (e.t || Date.now()) + 1 }); delete e.ai; } });
    S.mt.sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }
  S.mt.forEach(function (m) { if (!m.ts) { m.ts = 0; } });
  if (ch) sv();
}
function v41Init() {
  var ch = false;
  if (!S.set.ev) { S.set.ev = { on: 1, t: "18:00" }; ch = true; }
  if (!S.set.sp) { S.set.sp = { on: 1, t: "21:00" }; ch = true; }
  if (!S.set.mod) { S.set.mod = { fast: 0, ryt: 0, proj: 0 }; ch = true; }
  if (ch) sv();
  wgInit();
}
function LL(k) { var l = S.l[k] || {}, o = {}, id; for (id in l) o[id] = l[id]; if (S.lk) for (id in S.lk) { var a = autoLv(k, id); if (a > (o[id] || 0)) o[id] = a; } return o; }
function lvl(k, id) { return Math.max((S.l[k] || {})[id] || 0, autoLv(k, id)); }
function cats(k) { var m = { z: 0, m: 0, r: 0, d: 0 }, l = LL(k); H.forEach(function (h) { var v = l[h[0]] || 0; if (m[h[1]] != null && v > m[h[1]]) m[h[1]] = v; }); return m; }
function pts(k) { var m = cats(k); return m.z + m.m + m.r + m.d; }
function stat(p) { return p >= 8 ? "Mistrzostwo! 🏆" : p >= 4 ? "Super! ⭐" : p >= 1 ? "Dobry dzień! 👍" : "Do dzieła! 🌱"; }
function runF(f) { var n = f(key(ago(0))) ? 0 : 1, c = 0; while (c < 3650 && f(key(ago(n)))) { c++; n++; } return c; }
function streak() { return runF(function (k) { return pts(k) > 0; }); }
function hStreak(id) { return runF(function (k) { return lvl(k, id) > 0; }); }
function firstKey() { var a = Object.keys(S.l).concat(Object.keys(S.n)).sort(); return a[0] || key(new Date()); }
function bestF(f) { var b = 0, c = 0, n = offOf(firstKey()); for (var i = n; i >= 0; i--) { if (f(key(ago(i)))) { c++; if (c > b) b = c; } else c = 0; } return b; }
/* pamiętnik */
function dEntries(k) { return S.j.filter(function (e) { return e.d === k; }).sort(function (a, b) { return a.t - b.t; }); }
function dAns(k) { var p = S.pa[k]; return p ? p.a.filter(function (x) { return x && x.trim(); }).length : 0; }
function dText(k) { var t = S.n[k] || ""; dEntries(k).forEach(function (e) { t += " " + (e.text || ""); }); var p = S.pa[k]; if (p) t += " " + p.a.join(" "); return t.trim(); }
function dLv(k) {
  var t = dText(k).length, a = dAns(k), md0 = dEntries(k).some(function (e) { return e.media && e.media.length; });
  if (t >= 500) return 3; if (a >= 3 || t >= 150) return 2; if (t > 0 || md0) return 1; return 0;
}
function dStreak() { return runF(function (k) { return dLv(k) > 0; }); }
function dayQs(k) {
  var p = S.pa[k]; if (p && p.q) return p.q;
  var h = hashN(k); return NAW.PQ.map(function (a, i) { return a[(h >> (i * 3)) % a.length]; });
}

/* ---------- widok: stan UI ---------- */
var tab = "dzis", off = 0, ed = false, edr = false, edy = false, edx = false, P = null, fired = {};
var pq = "", ptag = "", plim = 20, pexp = {}, pview = "list", pfilt = "all", rg = 30, busy = "", lastRev = null;
var TABS = [["dzis", "🏠", "Dziś"], ["jedz", "🍽️", "Jedzenie"], ["pam", "📔", "Pamiętnik"], ["post", "📈", "Postęp"], ["ment", "🧭", "Mentor"], ["wiecej", "☰", "Więcej"]];
var SUBS = { proj: "💡 Pomysły i projekty", cele: "🎯 Cele", roz: "🤸 Rozruch", ryt: "⏰ Rytm dnia", fast: "🌙 Post przerywany", rap: "📊 Raport i eksport", ust: "⚙️ Ustawienia i AI", dane: "💾 Kopie i dane" };

function qf(q) { var i = q.lastIndexOf(" — "); return i > 0 ? "„" + esc(q.slice(0, i)) + "” — " + esc(q.slice(i + 3)) : "„" + esc(q) + "”"; }
function qt() { var a = S.q.length ? S.q : NAW.QD; return a[Math.floor(Date.now() / 864e5) % a.length]; }
function micBtn(target) { return '<button class="mic" data-a="mic" data-t="' + target + '" aria-label="Dyktuj głosowo">🎤</button>'; }

/* ---------- DZIŚ ---------- */
function banners(k) {
  var h = "", hasData = Object.keys(S.l).length > 0;
  if (!hasData && !S.set.welc) h += '<div class="card hl"><b>👋 Witaj w wersji 3.0!</b><p class="note" style="font-size:13px">Masz wyniki ze starej wersji? W starej aplikacji wejdź w <b>Raport → 💾 Kopia JSON</b>, a potem tutaj wczytaj plik. Wszystkie nawyki, punkty, notatki i posty przejdą.</p><div class="btns"><button class="pri" data-a="imp">📥 Wczytaj kopię ze starej wersji</button><button class="sec" data-a="welc">Zaczynam od zera</button></div></div>';
  if (migrated && !S.set.migOk) h += '<div class="card hl"><b>✅ Dane z poprzedniej wersji zostały przeniesione.</b><div class="note">Zapisałem też ich kopię w pamięci telefonu.</div><div class="btns" style="margin-top:6px"><button class="sec sm" data-a="migok">OK</button></div></div>';
  if (hasData && Date.now() - (S.bk || 0) > 7 * 864e5) h += '<div class="card wn"><b>💾 Czas na kopię zapasową</b><div class="note">' + (S.bk ? "Ostatnia: " + new Date(S.bk).toLocaleDateString("pl-PL") : "Nie zrobiłeś jeszcze kopii w tej wersji.") + ' Kopia chroni Twoje wyniki przy zmianie telefonu lub wyczyszczeniu przeglądarki.</div><div class="btns" style="margin-top:8px"><button class="pri sm" data-a="jx">💾 Zrób kopię</button><button class="sec sm" data-a="bklater">Przypomnij później</button></div></div>';
  if (!S.set.v4ok) h += '<div class="card hl"><b>✨ Nawyki i Talerz w jednej aplikacji</b><div class="note" style="margin:4px 0 8px">Nowa zakładka 🍽️ Jedzenie to Twój Talerz. Nawyki z ⚡ zaliczają się same z jedzenia: ' + Object.keys(S.lk || {}).map(function (id) { var y = H.find(function (z) { return z[0] === id; }); return y ? "„" + esc(y[2]) + "”" : ""; }).filter(Boolean).join(", ") + '. Progi zmienisz w „✏️ Edytuj nawyki”. Mentor widzi teraz też jedzenie, wodę, kroki i wagę.</div><button class="sec sm" data-a="v4ok">Rozumiem</button></div>';
  var dw = new Date().getDay(), lr = S.rev.length ? S.rev[S.rev.length - 1].ts : 0;
  if (off === 0 && (dw === 0 || dw === 1) && Date.now() - lr > 5 * 864e5 && Object.keys(S.l).length > 3) h += '<div class="card hl"><b>🧭 Czas na przegląd tygodnia</b><div class="note">Mentor podsumuje tydzień i wskaże, nad czym popracować.</div><div class="btns" style="margin-top:8px"><button class="pri sm" data-a="rev">📊 Zrób przegląd</button></div></div>';
  return h;
}
function diaryCard(k) {
  var es = dEntries(k), lv = dLv(k), qs = dayQs(k), pa = S.pa[k] || { a: ["", "", ""] }, h = '<div class="card"><h3>📔 Wpis dnia <span class="badge">' + LV[lv] + '</span></h3>';
  h += '<div class="tw"><textarea id="dn" data-f="n" data-k="' + k + '" placeholder="Jedno zdanie wystarczy (Mini). Co się dziś wydarzyło? Co czuję? Jaki pomysł się zrodził? Dodaj #tagi">' + esc(S.n[k] || "") + '</textarea>' + micBtn("dn") + '</div>';
  h += '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="newe" data-ty="note">➕ Osobny wpis</button><button class="sec sm" data-a="newe" data-ty="note" data-m="cam">📷 Zdjęcie</button><button class="sec sm" data-a="newe" data-ty="note" data-m="rec">🎙️ Nagranie</button></div>';
  if (es.length) h += '<div style="margin-top:6px">' + es.map(entryHtml).join("") + "</div>";
  h += '<details style="margin-top:10px"' + (S.set.col.pq ? "" : " open") + ' data-col="pq"><summary>❓ Pytania dnia <span class="note">(' + dAns(k) + '/3 · trzy odpowiedzi = Plus)</span></summary>';
  qs.forEach(function (q, i) { h += '<label class="note" style="font-size:13px;color:var(--tx);margin-top:8px">' + esc(q) + '</label><div class="tw"><textarea id="pa' + i + '" data-f="pa" data-k="' + k + '" data-i="' + i + '" style="min-height:56px;padding-right:52px">' + esc(pa.a[i] || "") + '</textarea>' + micBtn("pa" + i) + '</div>'; });
  if (hasAI()) h += '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="think" data-k="' + k + '"' + (dAns(k) || (S.n[k] || "").trim() ? "" : " disabled") + ">🧭 Omów z mentorem</button></div>";
  h += '</details><div class="note" style="margin-top:6px">Pamiętnik też ma poziomy: Mini – coś zapisane, Plus – 3 odpowiedzi lub ok. 150 znaków, Elita – 500+ znaków. Seria: ' + dStreak() + ' dni.</div></div>';
  return h;
}
function foodCard(k) {
  var t = tz(k), pr = tzProf();
  if (!pr && !t) return '<div class="card food"><div class="fh"><b>🍽️ Jedzenie</b><button class="sec sm" data-a="tab" data-id="jedz">Otwórz</button></div><div class="note">Licz kalorie ze zdjęć, pij wodę i zapisuj kroki w zakładce 🍽️ Jedzenie – woda, warzywa, białko i kroki zaliczą się tu jako nawyki ⚡.</div></div>';
  t = t || { ml: 0, wg: tzWaterGoal(0), veg: 0, sug: 0, kcal: 0, dk: 0, p: 0, lim: null, steps: 0, meals: 0 };
  function pc(v, g) { return Math.max(0, Math.min(100, g ? v / g * 100 : 0)); }
  var pT = tzProtT(), over = t.lim && t.kcal > t.lim, h = '<div class="card food"><div class="fh"><b>🍽️ Jedzenie' + (off ? " · " + dshort(k) : "") + '</b><button class="lnk" data-a="tab" data-id="jedz">Szczegóły ›</button></div>';
  h += '<div class="fm fk"><span>🔥 Kalorie' + (t.dk ? " <small>(w tym napoje " + t.dk + " kcal)</small>" : "") + '</span><b' + (over ? ' style="color:var(--red)"' : "") + ">" + t.kcal + (t.lim ? "<small> / " + t.lim + " kcal</small>" : "<small> kcal</small>") + '</b><div class="bar"><i style="width:' + pc(t.kcal, t.lim) + "%" + (over ? ";background:var(--red)" : "") + '"></i></div></div><div class="fg">';
  h += '<div class="fm"><span>💧 Płyny</span><b>' + (t.ml / 1000).toFixed(1).replace(".", ",") + "<small> / " + (t.wg / 1000).toFixed(1).replace(".", ",") + ' l</small></b><div class="bar"><i style="width:' + pc(t.ml, t.wg) + '%"></i></div></div>';
  h += '<div class="fm"><span>🥦 Warzywa</span><b>' + t.veg + '<small> / 400 g</small></b><div class="bar"><i style="width:' + pc(t.veg, 400) + '%"></i></div></div>';
  h += '<div class="fm"><span>🥩 Białko</span><b>' + t.p + "<small> / " + pT + ' g</small></b><div class="bar"><i style="width:' + pc(t.p, pT) + '%"></i></div></div>';
  h += '<div class="fm"><span>👟 Kroki</span><b>' + t.steps.toLocaleString("pl-PL") + '</b><div class="bar"><i style="width:' + pc(t.steps, 10000) + '%"></i></div></div></div>';
  if (t.sug > 30) h += '<div class="note" style="margin-top:6px">🍬 Cukry wolne: ' + t.sug + " g (zalecane maks. 30 g)</div>";
  if (off === 0) h += wgLine() + '<div class="btns" style="margin-top:10px"><button class="pri sm" data-a="tzgo" data-id="posilek">📷 Posiłek</button><button class="sec sm" data-a="tzgo" data-id="woda">💧 Woda</button><button class="sec sm" data-a="tzgo" data-id="kroki">👟 Kroki</button></div>';
  return h + "</div>";
}
function nextSteps() {
  var a = []; if (!on("proj")) return a;
  S.pj.forEach(function (p) { if (p.status !== "doing") return; var s = (p.steps || []).find(function (x) { return !x.done; }); if (s) a.push([p, s]); });
  return a.slice(0, 3);
}
function focusCard() {
  var fc = S.fc.filter(function (x) { return !x.done; }), ns = nextSteps();
  if (!fc.length && !ns.length) return "";
  var h = '<div class="card">';
  if (fc.length) { h += '<h3>🎯 Do pracy (od mentora)</h3>'; fc.forEach(function (x) { h += '<div class="step"><button class="ck" data-a="fcdone" data-id="' + x.id + '"></button><span style="flex:1;font-size:14px">' + esc(x.t) + '</span></div>'; }); }
  if (ns.length) { h += '<h3>🚧 Następne kroki w projektach</h3>'; ns.forEach(function (x) { h += '<div class="step"><button class="ck" data-a="nsdone" data-id="' + x[0].id + '" data-s="' + x[1].id + '"></button><span style="flex:1;font-size:14px">' + esc(x[1].t) + '<small class="note" style="display:block">' + esc(x[0].name) + '</small></span></div>'; }); }
  return h + "</div>";
}
function cardV(i, l, k) {
  var list = H.filter(function (y) { return y[1] === i; }), done = list.filter(function (y) { return l[y[0]]; }).length;
  var x = '<details class="card" data-col="c' + i + '"' + (S.set.col["c" + i] ? "" : " open") + '><summary>' + CATS[i][1] + " " + CATS[i][0] + ' <span class="note">' + done + "/" + list.length + "</span></summary>";
  list.forEach(function (y) {
    var v = l[y[0]] || 0, g = [y[3], y[4] && "Mini: " + y[4], y[5] && "Plus: " + y[5], y[6] && "Elita: " + y[6], y[7] && "⏰ " + y[7]].filter(Boolean).join(" · ");
    var s = hStreak(y[0]), nt = (S.hn[k] || {})[y[0]], au = autoTxt(k, y[0]), al = au && autoLv(k, y[0]);
    x += '<div class="row"><div class="nm">' + esc(y[2]) + (g ? "<small>" + esc(g) + "</small>" : "") + (au ? '<small class="auto' + (al ? " on" : "") + '">' + esc(au) + "</small>" : "") + '</div>' + (s > 1 ? '<span class="fire">🔥' + s + '</span>' : "") +
      '<button class="ib' + (nt ? " has" : "") + '" data-a="hnote" data-id="' + y[0] + '" aria-label="Notatka do nawyku">💬</button><button class="lv l' + v + '" data-a="lv" data-id="' + y[0] + '">' + (al && al >= ((S.l[k] || {})[y[0]] || 0) ? "⚡" : "") + LV[v] + "</button></div>";
  });
  return x + "</details>";
}
function inp(id, f, v, ph) { return '<input data-f="' + f + '" data-id="' + id + '" value="' + esc(v) + '" placeholder="' + ph + '">'; }
function linkEd(id) {
  var L = (S.lk || {})[id], M = L && TZM[L.m];
  var h = '<div class="lk"><label class="note">⚡ Zaliczaj automatycznie z Jedzenia</label><select data-f="lkm" data-id="' + id + '"><option value="">— nie (zaznaczam ręcznie)</option>' +
    Object.keys(TZM).map(function (m) { return '<option value="' + m + '"' + (L && L.m === m ? " selected" : "") + ">" + TZM[m][0] + "</option>"; }).join("") + "</select>";
  if (M && M[4]) h += '<div class="lkt">' + ["Mini", "Plus", "Elita"].map(function (n, j) { return '<label>' + n + (M[2] < 0 ? " ≤" : " ≥") + '<input type="number" inputmode="numeric" min="0" data-f="lkt" data-id="' + id + '" data-j="' + j + '" value="' + (L.t || M[4])[j] + '"></label>'; }).join("") + '<span class="note">' + M[1] + "</span></div>";
  else if (M) h += '<div class="note">Mini – coś zapisane, Plus – co najmniej 3 posiłki, Elita – 3 posiłki i kalorie w limicie.</div>';
  return h + "</div>";
}
function cardEd(i) {
  var x = '<div class="card"><h3>' + CATS[i][1] + " " + CATS[i][0] + "</h3>";
  H.forEach(function (y) {
    if (y[1] !== i) return; var id = y[0];
    x += '<div class="ed">' + inp(id, "2", y[2], "Nazwa nawyku") + inp(id, "3", y[3], "Pora lub kotwica, np. po porannej kawie") + inp(id, "4", y[4], "Twój próg Mini") + inp(id, "5", y[5], "Twój próg Plus") + inp(id, "6", y[6], "Twój próg Elita") +
      '<input data-f="7" data-id="' + id + '" value="' + esc(y[7] || "") + '" placeholder="Przypomnienie o godzinie, np. 07:00 (opcjonalnie)">' + linkEd(id) +
      '<div class="btns"><button class="sec" data-a="up" data-id="' + id + '">↑</button><button class="sec" data-a="dn" data-id="' + id + '">↓</button><select data-f="1" data-id="' + id + '">' +
      Object.keys(CATS).map(function (c) { return '<option value="' + c + '"' + (c === i ? " selected" : "") + ">" + CATS[c][0] + "</option>"; }).join("") +
      '</select><button class="sec" data-a="rm" data-id="' + id + '">🗑</button></div></div>';
  });
  return x + '<button class="pri" data-a="add" data-id="' + i + '">+ Dodaj nawyk</button></div>';
}
function quotesEd() { return '<div class="card"><h3>💬 Moje hasła motywacyjne</h3><textarea data-f="q" placeholder="Jedno hasło w linii">' + esc(S.q.join("\n")) + '</textarea><div class="note">Jedno hasło w każdej linii. Każdego dnia aplikacja pokazuje jedno z nich.</div></div>'; }
function dzis() {
  var k = key(ago(off)), l = LL(k), c = cats(k), p = pts(k), h = "";
  var lab = off === 0 ? "Dziś" : off === 1 ? "Wczoraj" : dshort(k);
  h += '<div class="nav"><button class="sec" data-a="pd">‹</button><b data-a="today" style="cursor:pointer">' + lab + '</b><button class="sec" data-a="nd"' + (off === 0 ? " disabled" : "") + ">›</button></div>";
  h += banners(k);
  h += '<div class="card hero"><div class="ring"><svg width="88" height="88" viewBox="0 0 88 88"><circle cx="44" cy="44" r="37" fill="none" stroke="var(--ac2)" stroke-width="9"/><circle cx="44" cy="44" r="37" fill="none" stroke="var(--ac)" stroke-width="9" stroke-linecap="round" stroke-dasharray="232.5" stroke-dashoffset="' + (232.5 * (1 - p / 12)) + '"/></svg><b>' + p + '/12</b></div><div><div class="msg">' + stat(p) + '</div><div class="q">' + qf(qt()) + "</div></div></div>";
  h += '<div class="chips">'; for (var i in CATS) h += '<div class="chip">' + CATS[i][1] + "<b>" + LV[c[i]] + "</b>" + CATS[i][0] + "</div>";
  h += '<div class="chip">📔<b>' + LV[dLv(k)] + "</b>Pamiętnik</div></div>";
  if (ed) { for (var j in CATS) h += cardEd(j); h += quotesEd(); h += '<div class="btns c" style="margin-bottom:12px"><button class="pri" data-a="ed">✓ Gotowe</button></div>'; return h; }
  h += evCard(k);
  h += foodCard(k);
  h += diaryCard(k);
  if (off === 0) h += focusCard();
  for (var m in CATS) h += cardV(m, l, k);
  h += '<div class="btns c" style="margin-bottom:12px"><button class="sec" data-a="ed">✏️ Edytuj nawyki, przypomnienia i hasła</button></div>';
  return h + '<div class="note">Dotknij nawyku, aby zmienić poziom: Mini (1 pkt) → Plus (2) → Elita (3). W każdej kategorii liczy się najwyższy poziom z dnia (maks. 12 pkt). 💬 – notatka do nawyku (np. dlaczego się nie udało), 🔥 – seria dni z rzędu.</div>';
}

/* ---------- wpisy pamiętnika ---------- */
function entryHtml(e) {
  var t = ET[e.ty] || ET.note, h = '<div class="ent"><div class="meta">' + t[0] + " " + hm(e.t) + (e.tags && e.tags.length ? " · " + e.tags.map(esc).join(" ") : "") + '<span style="flex:1"></span><button class="ib" data-a="edite" data-id="' + e.id + '" aria-label="Edytuj">✏️</button></div>';
  if (e.text) h += "<p>" + esc(e.text) + "</p>";
  var im = (e.media || []).filter(function (m) { return m.k === "img"; }), au = (e.media || []).filter(function (m) { return m.k === "aud"; });
  if (im.length) h += '<div class="thumbs">' + im.map(function (m) { return '<img data-mid="' + m.id + '" data-a="full" alt="zdjęcie">'; }).join("") + "</div>";
  au.forEach(function (m) { h += '<audio controls preload="none" data-mid="' + m.id + '"></audio>'; });
  return h + "</div>";
}
function allDays() {
  var s = {}; Object.keys(S.n).forEach(function (k) { s[k] = 1; }); S.j.forEach(function (e) { s[e.d] = 1; });
  Object.keys(S.pa).forEach(function (k) { if (dAns(k)) s[k] = 1; });
  return Object.keys(s).sort().reverse();
}
function dayMatch(k) {
  var es = dEntries(k);
  if (ptag) { var tg = tagsOf(S.n[k]); es.forEach(function (e) { tg = tg.concat(e.tags || []); }); if (tg.indexOf(ptag) < 0) return false; }
  if (pq) { var t = norm(dText(k) + " " + dayQs(k).join(" ")); if (t.indexOf(norm(pq)) < 0) return false; }
  return true;
}
function pamList() {
  var ds = allDays().filter(dayMatch);
  if (!ds.length) return '<div class="card note">' + (pq || ptag ? "Nic nie znaleziono." : "Pamiętnik jest pusty. Napisz pierwszy wpis na ekranie Dziś albo przyciskiem ＋.") + "</div>";
  var h = "";
  ds.slice(0, plim).forEach(function (k) {
    var n = S.n[k] || "", long = n.length > 400 && !pexp[k], pa = S.pa[k], qs = dayQs(k);
    h += '<div class="card"><div class="btns" style="justify-content:space-between"><b>' + dlong(k) + '</b><span class="badge">' + LV[dLv(k)] + "</span></div>";
    if (n) h += '<p style="white-space:pre-wrap;margin:6px 0">' + esc(long ? n.slice(0, 400) + "…" : n) + "</p>" + (long ? '<button class="lnk" data-a="pexp" data-k="' + k + '">Pokaż całość</button>' : "");
    if (pa) pa.a.forEach(function (a, i) { if (a && a.trim()) h += '<div class="ent"><div class="meta">❓ ' + esc(qs[i]) + '</div><p>' + esc(a) + "</p></div>"; });
    dEntries(k).forEach(function (e) { h += entryHtml(e); });
    h += '<div class="btns" style="margin-top:6px"><button class="sec sm" data-a="goday" data-id="' + offOf(k) + '">Otwórz dzień</button><button class="sec sm" data-a="newe" data-ty="note" data-k="' + k + '">➕ Dopisz</button></div></div>';
  });
  if (ds.length > plim) h += '<div class="btns c"><button class="sec" data-a="pmore">Pokaż starsze (' + (ds.length - plim) + ")</button></div>";
  return h;
}
function pam() {
  var tc = {};
  function add(arr) { arr.forEach(function (t) { tc[t] = (tc[t] || 0) + 1; }); }
  Object.keys(S.n).forEach(function (k) { add(tagsOf(S.n[k])); }); S.j.forEach(function (e) { add(e.tags || []); });
  var tags = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a]; }).slice(0, 24);
  var h = '<div class="g3"><div class="st"><b>' + dStreak() + '</b><span>seria dni</span></div><div class="st"><b>' + bestF(function (k) { return dLv(k) > 0; }) + '</b><span>najdłuższa seria</span></div><div class="st"><b>' + allDays().length + '</b><span>dni z wpisami</span></div></div>';
  h += '<div class="btns" style="margin-bottom:10px"><button class="pri" data-a="newe" data-ty="note">➕ Nowy wpis</button><button class="sec" data-a="newe" data-ty="note" data-m="rec">🎙️ Nagraj</button><button class="sec" data-a="newe" data-ty="note" data-m="cam">📷 Zdjęcie</button></div>';
  h += '<input id="pq" type="search" placeholder="🔎 Szukaj w pamiętniku…" value="' + esc(pq) + '" style="margin-bottom:8px">';
  if (tags.length) h += '<div style="margin-bottom:10px">' + tags.map(function (t) { return '<span class="tag' + (ptag === t ? " on" : "") + '" data-a="ptag" data-id="' + esc(t) + '">' + esc(t) + " <small>" + tc[t] + "</small></span>"; }).join("") + "</div>";
  /* wspomnienia */
  var mem = [], tk = new Date(); [[1, "Miesiąc temu"], [12, "Rok temu"]].forEach(function (x) { var d = new Date(tk.getFullYear(), tk.getMonth() - x[0], tk.getDate(), 12), k = key(d); if (dText(k)) mem.push([x[1], k]); });
  if (mem.length && !pq && !ptag) h += mem.map(function (m) { return '<div class="card hl"><b>🕰️ ' + m[0] + " (" + dshort(m[1]) + ')</b><p style="white-space:pre-wrap;margin:6px 0">' + esc(dText(m[1]).slice(0, 280)) + '</p><button class="sec sm" data-a="goday" data-id="' + offOf(m[1]) + '">Otwórz</button></div>'; }).join("");
  return h + '<div id="plist">' + pamList() + "</div>";
}

/* ---------- arkusz (okno od dołu) ---------- */
var sheetClose = null;
function openSheet(title, body, onClose) {
  $("sheet").innerHTML = '<div class="ov" data-a="ovl"><div class="sh"><div class="top"><b>' + title + '</b><button class="sec sm" data-a="shx">✕</button></div>' + body + "</div></div>";
  sheetClose = onClose || null; addMics($("sheet")); hydrate();
}
function closeSheet(skip) { var f = sheetClose; sheetClose = null; $("sheet").innerHTML = ""; stopDict(); stopRec(true); if (f && !skip) f(); }

/* edytor wpisu */
var CE = null; /* {e, isNew, newMedia:[]} */
function entryForm() {
  var e = CE.e, h = '<div class="btns" style="margin-bottom:8px">' + Object.keys(ET).map(function (t) { return '<span class="tag' + (e.ty === t ? " on" : "") + '" data-a="ety" data-id="' + t + '">' + ET[t][0] + " " + ET[t][1] + "</span>"; }).join("") + "</div>";
  h += '<label class="note">Dzień</label><input type="date" id="edate" value="' + e.d + '" max="' + key(new Date()) + '">';
  h += '<div class="tw" style="margin-top:8px"><textarea id="etx" placeholder="Pisz albo dotknij 🎤 i mów. #tagi pomagają później znaleźć wpis." style="min-height:140px">' + esc(e.text || "") + "</textarea>" + micBtn("etx") + "</div>";
  var im = e.media.filter(function (m) { return m.k === "img"; }), au = e.media.filter(function (m) { return m.k === "aud"; });
  if (im.length) h += '<div class="thumbs">' + im.map(function (m) { return '<div class="x"><img data-mid="' + m.id + '" data-a="full"><button data-a="mrm" data-id="' + m.id + '">✕</button></div>'; }).join("") + "</div>";
  au.forEach(function (m) { h += '<div class="btns" style="flex-wrap:nowrap"><audio controls data-mid="' + m.id + '"></audio><button class="sec sm" data-a="mrm" data-id="' + m.id + '">✕</button></div><div class="btns"><button class="sec sm" data-a="trans" data-id="' + m.id + '">✨ Przepisz nagranie na tekst</button></div>'; });
  h += '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="addpic" data-m="cam">📷 Aparat</button><button class="sec sm" data-a="addpic" data-m="pic">🖼️ Galeria</button><button class="sec sm" id="recb" data-a="rec">' + (REC ? "⏹️ Zakończ nagranie" : "🎙️ Nagraj głos") + "</button></div>";
  if (REC) h += '<div class="note" id="rect">Nagrywanie…</div>';
  if (im.length && hasAI()) h += '<div class="btns" style="margin-top:6px"><button class="sec sm" data-a="aipic">🧭 Zapisz i zapytaj mentora o zdjęcie</button></div>';
  if (busy) h += '<div class="busy">⏳ ' + esc(busy) + "</div>";
  h += '<div class="btns" style="margin-top:12px;justify-content:space-between"><button class="pri" data-a="esave">💾 Zapisz</button>' + (CE.isNew ? "" : '<button class="sec dng" data-a="edel">🗑 Usuń wpis</button>') + "</div>";
  return h;
}
function readForm() { if (!CE) return; var t = $("etx"), d = $("edate"); if (t) CE.e.text = t.value; if (d && d.value) CE.e.d = d.value; }
function openEntry(e, isNew, mode) {
  CE = { e: JSON.parse(JSON.stringify(e)), isNew: isNew, newMedia: [] };
  CE.e.media = CE.e.media || [];
  showEntry();
  if (mode === "rec") startRec(); else if (mode === "cam" || mode === "pic") $(mode).click(); else setTimeout(function () { var t = $("etx"); if (t && isNew) t.focus(); }, 60);
}
function showEntry() {
  var sc = document.querySelector(".sh"), y = sc ? sc.scrollTop : 0;
  openSheet((CE.isNew ? "Nowy wpis" : "Edycja wpisu"), entryForm(), function () { if (CE && CE.newMedia.length) CE.newMedia.forEach(function (id) { MDB.del(id); }); CE = null; });
  var s2 = document.querySelector(".sh"); if (s2) s2.scrollTop = y;
}
function saveEntry() {
  readForm(); var e = CE.e; e.tags = tagsOf(e.text);
  if (!e.text.trim() && !e.media.length) { toast("Wpis jest pusty."); return; }
  if (CE.isNew) S.j.push(e); else { var i = S.j.findIndex(function (x) { return x.id === e.id; }); if (i >= 0) { var old = S.j[i]; (old.media || []).forEach(function (m) { if (!e.media.some(function (n) { return n.id === m.id; })) MDB.del(m.id); }); S.j[i] = e; } }
  CE.newMedia = []; sv(); closeSheet(true); CE = null; toast("Zapisano ✅"); render();
}
/* nagrywanie głosu */
var REC = null;
function startRec() {
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast("Ta przeglądarka nie obsługuje nagrywania."); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
    var mt = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/webm"].find(function (m) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m); });
    var mr = new MediaRecorder(st, mt ? { mimeType: mt } : undefined), ch = [], t0 = Date.now();
    REC = { mr: mr, st: st, iv: setInterval(function () { var e = $("rect"); if (e) { var s = Math.round((Date.now() - t0) / 1000); e.textContent = "🔴 Nagrywanie… " + Math.floor(s / 60) + ":" + pad(s % 60); } }, 500) };
    mr.ondataavailable = function (ev) { if (ev.data && ev.data.size) ch.push(ev.data); };
    mr.onstop = function () {
      st.getTracks().forEach(function (t) { t.stop(); });
      if (REC && REC.cancel) { REC = null; return; }
      REC = null; var b = new Blob(ch, { type: mr.mimeType || mt || "audio/webm" });
      if (!CE || !b.size) return;
      var id = uid("a"); MDB.put(id, b).then(function () { CE.e.media.push({ id: id, k: "aud", mime: b.type }); CE.newMedia.push(id); readForm(); showEntry(); if (hasVoice()) transcribeMedia(id); });
    };
    mr.start(1000); readForm(); showEntry();
  }).catch(function () { toast("Brak dostępu do mikrofonu. Zezwól w ustawieniach przeglądarki."); });
}
function stopRec(cancel) { if (!REC) return; clearInterval(REC.iv); REC.cancel = !!cancel; try { REC.mr.stop(); } catch (e) {} }
/* dyktowanie (mowa na tekst w przeglądarce, bez klucza API) */
var DICT = null;
function stopDict() { if (DICT) { try { DICT.r.stop(); } catch (e) {} if (DICT.b) DICT.b.classList.remove("rec"); DICT = null; } }
function dictate(tid, btn) {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (DICT) { var same = DICT.t === tid; stopDict(); if (same) return; }
  if (!SR) { toast("Dyktowanie nie działa w tej przeglądarce. Użyj mikrofonu na klawiaturze telefonu albo 🎙️ Nagrania."); return; }
  if (!$(tid)) return;
  if (TTS.on) ttsStop();
  if (tid === "chatin") CHATV = true;
  var r = new SR(); r.lang = "pl-PL"; r.continuous = true; r.interimResults = false;
  r.onresult = function (ev) {
    for (var i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) {
      var s = ev.results[i][0].transcript.trim(); if (!s) continue;
      var ta = $(tid); if (!ta) { stopDict(); return; }
      var v = ta.value; ta.value = v + (v && !/\s$/.test(v) ? " " : "") + s.charAt(0).toUpperCase() + s.slice(1);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      ta.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  r.onerror = function (e) { if (e.error === "not-allowed") toast("Zezwól na mikrofon, aby dyktować."); stopDict(); };
  r.onend = function () { if (DICT && DICT.r === r) { try { r.start(); } catch (e) { stopDict(); } } };
  DICT = { r: r, t: tid, b: btn }; btn.classList.add("rec");
  try { r.start(); toast("🎤 Mów – dotknij ponownie, aby zakończyć", 2200); } catch (e) { stopDict(); }
}

/* mikrofon przy każdym polu tekstowym (pomija hasła, klucze API, daty i liczby) */
var NOMIC = /^(newkey|lpw|lp0|lp1|lp2|lwc)$/, DXN = 0;
function addMics(root) {
  if (!root) return;
  root.querySelectorAll("textarea, input").forEach(function (el) {
    if (el.closest(".tw") || el.hasAttribute("data-nomic") || NOMIC.test(el.id)) return;
    if (el.tagName === "INPUT" && ["text", "search", ""].indexOf((el.getAttribute("type") || "text").toLowerCase()) < 0) return;
    if (!el.id) {
      var parts = ["f", "id", "m", "i", "j", "k"].map(function (a) { return el.getAttribute("data-" + a) || ""; }).join("_");
      el.id = parts.replace(/_/g, "") ? "dx_" + parts.replace(/[^\w-]/g, "") : "dx" + (++DXN);
    }
    var w = document.createElement("div"); w.className = "tw" + (el.tagName === "INPUT" ? " ti" : "");
    if (/flex\s*:\s*1/.test(el.getAttribute("style") || "")) w.style.cssText = "flex:1;min-width:0";
    var mg = el.style.marginBottom; if (mg) { w.style.marginBottom = mg; el.style.marginBottom = "0"; }
    el.parentNode.insertBefore(w, el); w.appendChild(el);
    w.insertAdjacentHTML("beforeend", micBtn(el.id));
  });
  if (DICT) { var b = root.querySelector('.mic[data-t="' + DICT.t + '"]'); if (b) { b.classList.add("rec"); DICT.b = b; } }
}

/* ---------- POSTĘP ---------- */
function mdays() { var n = new Date(), a = []; for (var d = 1; d <= n.getDate(); d++) a.push(key(new Date(n.getFullYear(), n.getMonth(), d, 12))); return a; }
function post() {
  var D = mdays(), tp = 0, act = 0, el = 0; D.forEach(function (k) { var p = pts(k); tp += p; if (p > 0) act++; var c = cats(k); for (var i in c) if (c[i] === 3) el++; });
  var h = '<div class="g2"><div class="st"><b>' + tp + '</b><span>punkty w miesiącu</span></div><div class="st"><b>' + Math.round(act / D.length * 100) + '%</b><span>dni z minimum Mini</span></div><div class="st"><b>' + el + '</b><span>poziomów Elita</span></div><div class="st"><b>' + streak() + '</b><span>dni z rzędu (najdłużej ' + bestF(function (k) { return pts(k) > 0; }) + ')</span></div></div>';
  var nm = ["pn", "wt", "śr", "cz", "pt", "sb", "nd"];
  h += '<h3>Ostatnie 7 dni <span style="text-transform:none;font-weight:400">(dotknij, aby edytować)</span></h3><div class="card"><div class="week">';
  for (var i = 6; i >= 0; i--) { var d = ago(i), p = pts(key(d)); h += '<div class="day" data-a="goday" data-id="' + i + '" style="cursor:pointer">' + nm[(d.getDay() + 6) % 7] + '<div class="dot ' + (p >= 8 ? "f" : p > 0 ? "p" : "") + '">' + p + "</div></div>"; }
  h += "</div></div>";
  /* siatka tygodnia */
  h += '<h3>Tydzień nawyk po nawyku</h3><div class="card" style="overflow-x:auto"><table class="grid7"><tr><th></th>';
  for (i = 6; i >= 0; i--) h += "<th>" + nm[(ago(i).getDay() + 6) % 7] + "</th>"; h += "<th>🔥</th></tr>";
  H.forEach(function (y) { h += "<tr><td title=\"" + esc(y[2]) + "\">" + CATS[y[1]][1] + " " + esc(y[2]) + "</td>"; for (var i = 6; i >= 0; i--) { var v = lvl(key(ago(i)), y[0]); h += '<td><div class="cl c' + v + '" style="border-radius:5px;padding:2px 0">' + (v ? LV[v][0] : "·") + "</div></td>"; } h += "<td>" + hStreak(y[0]) + "</td></tr>"; });
  h += '<tr><td>📔 Pamiętnik</td>'; for (i = 6; i >= 0; i--) { var dv = dLv(key(ago(i))); h += '<td><div class="c' + dv + '" style="border-radius:5px;padding:2px 0">' + (dv ? LV[dv][0] : "·") + "</div></td>"; } h += "<td>" + dStreak() + "</td></tr>";
  h += '</table><div class="note" style="margin-top:6px">M – Mini, P – Plus, E – Elita. 🔥 – obecna seria dni z rzędu.</div></div>';
  /* serie */
  var ser = H.map(function (y) { return [y, hStreak(y[0]), bestF(function (k) { return lvl(k, y[0]) > 0; })]; }).sort(function (a, b) { return b[1] - a[1] || b[2] - a[2]; });
  h += '<h3>Serie nawyków</h3><div class="card">' + ser.map(function (s) { return '<div class="row"><div class="nm">' + CATS[s[0][1]][1] + " " + esc(s[0][2]) + '<small>najdłużej: ' + s[2] + ' dni</small></div><b>' + (s[1] ? "🔥 " + s[1] : '<span class="note">0</span>') + "</b></div>"; }).join("") + "</div>";
  /* tygodnie miesiąca (kalendarzowe) */
  h += '<h3>Tygodnie miesiąca</h3><div class="card">';
  var n2 = new Date(), last = new Date(n2.getFullYear(), n2.getMonth() + 1, 0).getDate(), wk = [], cur = null;
  for (var q = 1; q <= last; q++) { var dd = new Date(n2.getFullYear(), n2.getMonth(), q, 12); if (!cur || dd.getDay() === 1) { cur = { a: q, b: q, s: 0 }; wk.push(cur); } cur.b = q; cur.s += pts(key(dd)); }
  wk.forEach(function (w, i) { h += '<div class="row"><div class="nm">Tydzień ' + (i + 1) + "<small>dni " + w.a + "–" + w.b + "</small></div><b>" + w.s + " pkt</b></div>"; });
  h += "</div>";
  h += foodWeek();
  if (S.g.length) h += '<h3>Cele</h3>' + S.g.filter(function (g) { return !g.done; }).map(goalCard).join("");
  return h + '<div class="btns c"><button class="sec" data-a="tab" data-id="rap">📊 Pełny raport i eksport</button></div>';
}

function foodWeek() {
  var D = [], i; for (i = 6; i >= 0; i--) D.push(key(ago(i)));
  var T = D.map(tz), L = T.filter(function (t) { return t && t.meals; });
  if (!L.length && !tzWeights().length) return "";
  var inl = L.filter(function (t) { return t.lim && t.kcal <= t.lim; }).length, W = T.filter(Boolean);
  function avg(a, f) { return a.length ? Math.round(a.reduce(function (s, t) { return s + f(t); }, 0) / a.length) : 0; }
  var h = '<h3>🍽️ Jedzenie – ostatnie 7 dni</h3><div class="card"><div class="g2">';
  h += '<div class="st"><b>' + inl + "/" + L.length + '</b><span>dni w limicie kalorii</span></div>';
  h += '<div class="st"><b>' + W.filter(function (t) { return t.ml >= t.wg; }).length + '/7</b><span>dni z celem płynów</span></div>';
  h += '<div class="st"><b>' + avg(L, function (t) { return t.veg; }) + ' g</b><span>średnio warzyw i owoców</span></div>';
  h += '<div class="st"><b>' + avg(W, function (t) { return t.steps; }).toLocaleString("pl-PL") + '</b><span>średnio kroków</span></div></div>';
  h += '<div style="margin-top:10px">' + wgLine() + "</div>";
  var tr = tzTrend(); if (tr) h += '<div class="note" style="margin-top:8px">' + trendTxt(tr) + "</div>";
  var ws = tzWeights(), a = ws.filter(function (w) { return w.date >= key(ago(30)); });
  if (a.length > 1) { var dv = Math.round((a[a.length - 1].kg - a[0].kg) * 10) / 10; h += '<div class="note" style="margin-top:8px">⚖️ Waga w 30 dni: ' + String(a[0].kg).replace(".", ",") + " → " + String(a[a.length - 1].kg).replace(".", ",") + " kg (" + (dv > 0 ? "+" : "") + String(dv).replace(".", ",") + " kg)</div>"; }
  return h + '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="tzgo" data-id="historia">📊 Historia w Jedzeniu</button></div></div>';
}

/* ---------- CELE ---------- */
function goalRate(g) { var ids = g.hs || []; if (!ids.length) return null; var t = 0, c = 0; for (var i = 0; i < 30; i++) { var k = key(ago(i)); ids.forEach(function (id) { t++; if (lvl(k, id)) c++; }); } return Math.round(c / t * 100); }
function goalCard(g) {
  var r = goalRate(g), left = g.due ? Math.ceil((k2d(g.due) - new Date()) / 864e5) : null;
  return '<div class="card" data-a="goal" data-id="' + g.id + '" style="cursor:pointer"><b>' + (g.done ? "✅ " : "🎯 ") + esc(g.name) + '</b><div class="note">' + (g.due ? "Termin: " + dshort(g.due) + (left != null ? (left >= 0 ? " · zostało " + left + " dni" : " · po terminie") : "") : "Bez terminu") + '</div><div class="bar"><i style="width:' + (g.pr || 0) + '%"></i></div><div class="note">Postęp: ' + (g.pr || 0) + "%" + (r != null ? " · powiązane nawyki (30 dni): " + r + "%" : "") + "</div></div>";
}
function cele() {
  var a = S.g.filter(function (g) { return !g.done; }), b = S.g.filter(function (g) { return g.done; });
  var h = '<div class="btns" style="margin-bottom:10px"><button class="pri" data-a="goal" data-id="">+ Nowy cel</button></div>';
  if (!S.g.length) h += '<div class="card note">Cel to kierunek, nawyki to droga. Dodaj cel (np. „Hiszpański A2 do czerwca”) i podepnij nawyki, które do niego prowadzą – zobaczysz, jak regularnie je wykonujesz.</div>';
  h += a.map(goalCard).join("");
  if (b.length) h += "<h3>Osiągnięte</h3>" + b.map(goalCard).join("");
  return h;
}
function goalSheet(id) {
  var g = S.g.find(function (x) { return x.id === id; }) || { id: "", name: "", due: "", pr: 0, hs: [], note: "" };
  var h = '<label class="note">Nazwa celu</label><input id="gn" value="' + esc(g.name) + '" placeholder="np. Hiszpański A2 do czerwca"><label class="note">Termin (opcjonalnie)</label><input type="date" id="gd" value="' + esc(g.due || "") + '"><label class="note">Postęp: <b id="gpv">' + (g.pr || 0) + '%</b></label><input type="range" id="gp" min="0" max="100" step="5" value="' + (g.pr || 0) + '"><label class="note">Dlaczego to ważne / plan</label><textarea id="gno">' + esc(g.note || "") + '</textarea><label class="note">Nawyki prowadzące do celu</label><div class="card" style="max-height:220px;overflow:auto;padding:8px">';
  H.forEach(function (y) { h += '<label class="sw"><input type="checkbox" class="ghs" value="' + y[0] + '"' + ((g.hs || []).indexOf(y[0]) >= 0 ? " checked" : "") + "> " + CATS[y[1]][1] + " " + esc(y[2]) + "</label>"; });
  h += '</div><div class="btns" style="justify-content:space-between"><button class="pri" data-a="gsave" data-id="' + g.id + '">💾 Zapisz</button>' + (g.id ? '<button class="sec" data-a="gdone" data-id="' + g.id + '">' + (g.done ? "↩️ Przywróć" : "✅ Osiągnięty") + '</button><button class="sec dng" data-a="gdel" data-id="' + g.id + '">🗑</button>' : "") + "</div>";
  openSheet(g.id ? "Cel" : "Nowy cel", h);
}

/* ---------- PROJEKTY ---------- */
function pjCard(p) {
  var s = p.steps || [], d = s.filter(function (x) { return x.done; }).length, nx = s.find(function (x) { return !x.done; });
  return '<div class="pc" data-a="pj" data-id="' + p.id + '"><b>' + ST[p.status][0] + " " + esc(p.name) + "</b>" + (s.length ? '<div class="bar"><i style="width:' + (d / s.length * 100) + '%"></i></div><small>' + d + "/" + s.length + " kroków" + (nx ? " · dalej: " + esc(nx.t) : "") + "</small>" : p.desc ? "<small>" + esc(p.desc.slice(0, 90)) + "</small>" : "") + "</div>";
}
function proj() {
  var h = '<div class="btns" style="margin-bottom:10px"><button class="pri" data-a="pjnew">💡 Nowy pomysł</button><button class="sec" data-a="pview">' + (pview === "list" ? "🗂️ Tablica" : "📃 Lista") + "</button></div>";
  if (!S.pj.length) return h + '<div class="card note">Tu zbierasz pomysły – na aplikacje, biznes, cokolwiek. Każdy pomysł możesz rozbić na kroki (także z pomocą mentora) i przesuwać: Pomysł → Do zrobienia → W toku → Zrobione. Szybko dodasz pomysł z każdego ekranu przyciskiem ＋.</div>';
  if (pview === "kan") {
    h += '<div class="kan">' + Object.keys(ST).map(function (s) { var a = S.pj.filter(function (p) { return p.status === s; }); return '<div class="col"><h4>' + ST[s][0] + " " + ST[s][1] + " (" + a.length + ")</h4>" + a.map(pjCard).join("") + "</div>"; }).join("") + "</div>";
    return h;
  }
  h += '<div style="margin-bottom:10px"><span class="tag' + (pfilt === "all" ? " on" : "") + '" data-a="pfilt" data-id="all">Wszystkie</span>' + Object.keys(ST).map(function (s) { var n = S.pj.filter(function (p) { return p.status === s; }).length; return n ? '<span class="tag' + (pfilt === s ? " on" : "") + '" data-a="pfilt" data-id="' + s + '">' + ST[s][0] + " " + ST[s][1] + " " + n + "</span>" : ""; }).join("") + "</div>";
  var L = S.pj.filter(function (p) { return pfilt === "all" || p.status === pfilt; }).sort(function (a, b) { var o = ["doing", "plan", "idea", "hold", "done"]; return o.indexOf(a.status) - o.indexOf(b.status) || b.up - a.up; });
  return h + L.map(pjCard).join("");
}
var CP = null;
function pjSheet() {
  var p = CP, h = '<input id="pjn" value="' + esc(p.name) + '" placeholder="Nazwa pomysłu / projektu" style="font-weight:600">';
  h += '<label class="note">Status</label><select id="pjs">' + Object.keys(ST).map(function (s) { return '<option value="' + s + '"' + (p.status === s ? " selected" : "") + ">" + ST[s][0] + " " + ST[s][1] + "</option>"; }).join("") + "</select>";
  h += '<label class="note">Opis, notatki, #tagi</label><div class="tw"><textarea id="pjd" placeholder="Na czym polega pomysł? Dla kogo? Dlaczego?">' + esc(p.desc || "") + "</textarea>" + micBtn("pjd") + "</div>";
  h += '<h3>Kroki</h3>';
  (p.steps || []).forEach(function (s, i) { h += '<div class="step' + (s.done ? " dn" : "") + '"><button class="ck' + (s.done ? " on" : "") + '" data-a="pst" data-i="' + i + '">' + (s.done ? "✓" : "") + '</button><span style="flex:1;font-size:14px">' + esc(s.t) + '</span><button class="ib" data-a="psu" data-i="' + i + '">↑</button><button class="ib" data-a="psr" data-i="' + i + '">✕</button></div>'; });
  h += '<div class="btns" style="flex-wrap:nowrap;margin-top:6px"><input id="pjns" placeholder="Nowy krok…" style="flex:1"><button class="sec" data-a="psa">+</button></div>';
  h += '<div class="btns" style="margin-top:10px"><button class="sec sm" data-a="pjai" data-m="steps">✨ Rozbij na kroki</button><button class="sec sm" data-a="pjai" data-m="eval">✨ Oceń pomysł</button></div>';
  if (p.ai) h += '<div class="ai"><b>🧭 Mentor:</b>' + md(p.ai) + "</div>";
  if (busy) h += '<div class="busy">⏳ ' + esc(busy) + "</div>";
  h += '<div class="btns" style="margin-top:12px;justify-content:space-between"><button class="pri" data-a="pjsave">💾 Zapisz</button>' + (S.pj.some(function (x) { return x.id === p.id; }) ? '<button class="sec dng" data-a="pjdel">🗑 Usuń</button>' : "") + "</div>";
  var sc = document.querySelector(".sh"), y = sc ? sc.scrollTop : 0;
  openSheet("Pomysł / projekt", h); var s2 = document.querySelector(".sh"); if (s2) s2.scrollTop = y;
}
function pjRead() { if (!CP) return; var n = $("pjn"), s = $("pjs"), d = $("pjd"); if (n) CP.name = n.value; if (s) CP.status = s.value; if (d) CP.desc = d.value; }
function pjSave(close) {
  pjRead(); if (!CP.name.trim()) CP.name = (CP.desc || "Pomysł").split("\n")[0].slice(0, 60) || "Pomysł";
  CP.up = Date.now(); var i = S.pj.findIndex(function (x) { return x.id === CP.id; });
  if (i >= 0) S.pj[i] = CP; else S.pj.push(CP); sv();
  if (close) { closeSheet(true); CP = null; toast("Zapisano ✅"); render(); }
}

/* ---------- AI: automatyczny dobór dostawcy i modelu ---------- */
/* Użytkownik wkleja tylko klucz. Aplikacja sama rozpoznaje dostawcę, pobiera listę modeli,
   wybiera najlepszy, a gdy model jest przeciążony lub wycofany – przechodzi na kolejny
   model, a potem na kolejnego dostawcę (jeśli jest drugi klucz). */
var PORDER = ["gemini", "claude", "openai", "openrouter", "groq"];
var DEFM = {
  gemini: ["gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"],
  claude: ["claude-sonnet-5-5", "claude-haiku-5-5"],
  openai: ["gpt-5.4-mini", "chat-latest"],
  groq: ["llama-3.3-70b-versatile", "openai/gpt-oss-120b"],
  openrouter: ["openrouter/auto"]
};
var DEFT = { openai: ["gpt-transcribe", "whisper-1"], groq: ["whisper-large-v3-turbo", "whisper-large-v3"] };
var RETRY = [0, 404, 408, 409, 425, 429, 500, 502, 503, 504, 529];
function cfg(p) { return K[p] || {}; }
function keyed() { var a = PORDER.filter(function (p) { return cfg(p).k; }), l = S.set.lastP; if (l && a.indexOf(l) > 0) { a.splice(a.indexOf(l), 1); a.unshift(l); } return a; }
function hasAI() { return keyed().length > 0; }
function prov() { var a = keyed(); return PROV[a[0] || "gemini"]; }
function voiceProvs() { return ["gemini", "groq", "openai"].filter(function (p) { return cfg(p).k; }); }
function voiceProv() { return voiceProvs()[0] || null; }
function hasVoice() { return voiceProvs().length > 0; }
function detectProv(k) {
  if (/^sk-ant-/.test(k)) return "claude"; if (/^gsk_/.test(k)) return "groq"; if (/^sk-or-/.test(k)) return "openrouter";
  if (/^(AIza|AQ\.)/.test(k)) return "gemini"; if (/^sk-/.test(k)) return "openai"; return null;
}
function cleanKey(k) { return String(k || "").replace(/^\s*(GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|GROQ_API_KEY|API_KEY|key)\s*[=:]\s*/i, "").replace(/["'\s]/g, ""); }
function vnum(s) { var m = /(\d+(?:\.\d+)?)/.exec(s); return m ? parseFloat(m[1]) : 0; }
function uniq(a) { var o = []; a.forEach(function (x) { if (x && o.indexOf(x) < 0) o.push(x); }); return o; }
function rankModels(p, ids) {
  var bad = /(tts|image|audio|live|realtime|embed|moderation|transcri|whisper|search|codex|cyber|instruct|guard|computer|aqa|learnlm|imagen|veo|lyria|banana|robotics|native|dall|sora|omni|customtools|thinking|deep-research|exp)/i;
  var a = ids.filter(function (x) { return !bad.test(x); }), byV = function (x, y) { return vnum(y) - vnum(x); };
  if (p === "gemini") {
    a = a.filter(function (x) { return /^gemini-/.test(x) && /flash/.test(x) && !/preview/.test(x); });
    var fl = a.filter(function (x) { return /-flash$/.test(x); }).sort(byV), li = a.filter(function (x) { return /-flash-lite$/.test(x); }).sort(byV);
    return uniq([a.indexOf("gemini-flash-latest") >= 0 && "gemini-flash-latest"].concat(fl.slice(0, 3), [a.indexOf("gemini-flash-lite-latest") >= 0 && "gemini-flash-lite-latest"], li.slice(0, 2)));
  }
  if (p === "claude") { var f = function (r) { return a.filter(function (x) { return r.test(x); }); }; return uniq(f(/sonnet/).slice(0, 2).concat(f(/haiku/).slice(0, 1), f(/opus/).slice(0, 1))); }
  if (p === "openai") {
    a = a.filter(function (x) { return /^gpt-/.test(x) && !/nano|-pro|\d{4}-\d{2}-\d{2}|oss/.test(x); });
    return uniq(a.filter(function (x) { return /mini/.test(x); }).sort(byV).slice(0, 2).concat(a.filter(function (x) { return !/mini/.test(x); }).sort(byV).slice(0, 2)));
  }
  if (p === "groq") { var pref = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]; return uniq(pref.filter(function (x) { return a.indexOf(x) >= 0; }).concat(a.filter(function (x) { return /llama|qwen|gpt-oss/.test(x); }).slice(0, 2))); }
  return [];
}
function rankTrans(p, ids) {
  if (p === "groq") return ids.filter(function (x) { return /whisper/.test(x); }).sort(function (a, b) { return /turbo/.test(b) - /turbo/.test(a); });
  if (p === "openai") return ids.filter(function (x) { return /transcribe|whisper/.test(x) && !/live|realtime|diariz/.test(x); }).sort(function (a, b) { return /mini/.test(a) - /mini/.test(b); });
  return [];
}
function fetchT(u, opt, ms) {
  var ac = window.AbortController ? new AbortController() : null, tm;
  if (ac) { opt.signal = ac.signal; tm = setTimeout(function () { ac.abort(); }, ms || 60000); }
  return fetch(u, opt).then(function (r) { clearTimeout(tm); return r; }, function (e) { clearTimeout(tm); var er = new Error(e && e.name === "AbortError" ? "Przekroczony czas odpowiedzi." : "Brak połączenia z internetem."); er.status = 0; throw er; });
}
function hErr(r, j) {
  var m = (j && (j.error && (j.error.message || j.error)) || j.message) || r.statusText || "";
  if (typeof m !== "string") m = JSON.stringify(m);
  var e = new Error(m.slice(0, 200)); e.status = r.status; return e;
}
function friendly(e, pn) {
  var s = e.status;
  if (s === 401 || s === 403) return "Klucz " + pn + " jest nieprawidłowy lub wyłączony. Utwórz nowy klucz i wklej go w Ustawieniach.";
  if (s === 402) return "Brak środków na koncie " + pn + ".";
  if (s === 429) return pn + ": wyczerpany limit zapytań. Spróbuj za kilka minut.";
  if (s === 0) return e.message + " Sprawdź internet i spróbuj ponownie.";
  if (s >= 500 || s === 404) return pn + " jest chwilowo przeciążony. Spróbuj za chwilę.";
  return pn + ": " + e.message;
}
function listModels(p, k) {
  var u, h; k = k || cfg(p).k;
  if (p === "gemini") { u = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200"; h = { "x-goog-api-key": k }; }
  else if (p === "claude") { u = "https://api.anthropic.com/v1/models?limit=100"; h = { "x-api-key": k, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }; }
  else { u = PROV[p].base + "/models"; h = { Authorization: "Bearer " + k }; }
  return fetchT(u, { headers: h }, 20000).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
    if (!r.ok) throw hErr(r, j);
    if (p === "gemini") return (j.models || []).filter(function (m) { return (m.supportedGenerationMethods || []).indexOf("generateContent") >= 0; }).map(function (m) { return m.name.replace(/^models\//, ""); });
    return (j.data || []).map(function (m) { return m.id; });
  }); });
}
/* odśwież listę modeli raz na 3 dni (w tle, błędy ignorowane) */
function ensureModels(p, force) {
  var c = cfg(p); if (!c.k) return Promise.resolve();
  if (!force && c.list && Date.now() - (c.lt || 0) < 3 * 864e5) return Promise.resolve();
  return listModels(p).then(function (ids) { c.list = rankModels(p, ids); c.tl = rankTrans(p, ids); c.lt = Date.now(); svK(); }).catch(function () {});
}
function chainOf(p) { var c = cfg(p); return uniq([c.ok].concat(c.list || [], DEFM[p])).slice(0, 7); }
function call1(p, model, o) {
  var c = cfg(p), msgs = o.msgs;
  if (p === "gemini") {
    var body = { contents: msgs.map(function (m) { var parts = []; (m.img || []).forEach(function (i) { parts.push({ inline_data: { mime_type: i.mime, data: i.b64 } }); }); if (m.aud) parts.push({ inline_data: { mime_type: m.aud.mime, data: m.aud.b64 } }); parts.push({ text: m.t || "." }); return { role: m.r === "u" ? "user" : "model", parts: parts }; }) };
    if (o.sys) body.systemInstruction = { parts: [{ text: o.sys }] };
    return fetchT("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": c.k }, body: JSON.stringify(body) }, o.aud ? 120000 : 60000)
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw hErr(r, j); var cd = j.candidates && j.candidates[0], t = cd && cd.content && (cd.content.parts || []).filter(function (x) { return !x.thought; }).map(function (x) { return x.text || ""; }).join(""); if (!t) { var e = new Error("pusta odpowiedź"); e.status = 503; throw e; } return t; }); });
  }
  if (p === "claude") {
    return fetchT("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": c.k, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: model, max_tokens: 2000, system: o.sys || undefined, messages: msgs.map(function (m) { var ct = (m.img || []).map(function (i) { return { type: "image", source: { type: "base64", media_type: i.mime, data: i.b64 } }; }); ct.push({ type: "text", text: m.t || "." }); return { role: m.r === "u" ? "user" : "assistant", content: ct }; }) }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw hErr(r, j); var t = (j.content || []).map(function (x) { return x.text || ""; }).join(""); if (!t) { var e = new Error("pusta odpowiedź"); e.status = 503; throw e; } return t; }); });
  }
  var mm = (o.sys ? [{ role: "system", content: o.sys }] : []).concat(msgs.map(function (m) { return { role: m.r === "u" ? "user" : "assistant", content: m.img && m.img.length ? [{ type: "text", text: m.t }].concat(m.img.map(function (i) { return { type: "image_url", image_url: { url: "data:" + i.mime + ";base64," + i.b64 } }; })) : m.t }; }));
  return fetchT(PROV[p].base + "/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + c.k }, body: JSON.stringify({ model: model, messages: mm }) })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw hErr(r, j); var t = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (Array.isArray(t)) t = t.map(function (x) { return x.text || ""; }).join(""); if (!t) { var e = new Error("pusta odpowiedź"); e.status = 503; throw e; } return t; }); });
}
var LASTM = "";
function ai(o) {
  var needImg = o.msgs.some(function (m) { return m.img && m.img.length; }), needAud = o.msgs.some(function (m) { return m.aud; });
  var ps = (o.prov ? [o.prov] : keyed()).filter(function (p) { return cfg(p).k && (!needImg || PROV[p].vision) && (!needAud || p === "gemini"); });
  if (!ps.length) return Promise.reject(new Error(!hasAI() ? "Mentor nie ma jeszcze klucza API. Wklej go w Więcej → Ustawienia i AI." : needImg ? "Do analizy zdjęć potrzebny jest klucz Gemini, Claude, OpenAI lub OpenRouter." : "Brak pasującego klucza API."));
  var errs = [];
  function tryP(pi, round) {
    if (pi >= ps.length) {
      var allBusy = errs.length && errs.every(function (e) { return RETRY.indexOf(e.e.status) >= 0; });
      if (allBusy && round === 0) return new Promise(function (r) { setTimeout(r, 2500); }).then(function () { errs = []; return tryP(0, 1); });
      var best = errs.filter(function (e) { return e.e.status === 401 || e.e.status === 403 || e.e.status === 402; })[0] || errs[errs.length - 1];
      return Promise.reject(new Error(best ? friendly(best.e, PROV[best.p].n) : "Nie udało się połączyć z AI."));
    }
    var p = ps[pi];
    return ensureModels(p).then(function () {
      var ch = chainOf(p);
      function tryM(mi) {
        if (mi >= ch.length) return tryP(pi + 1, round);
        return call1(p, ch[mi], o).then(function (t) {
          var c = cfg(p); if (c.ok !== ch[mi]) { c.ok = ch[mi]; svK(); } if (S.set.lastP !== p) { S.set.lastP = p; sv(); } LASTM = PROV[p].n + " · " + ch[mi]; return t;
        }, function (e) {
          errs.push({ p: p, e: e });
          if (e.status === 401 || e.status === 403 || e.status === 402) return tryP(pi + 1, round);
          if (e.status === 404 && cfg(p).ok === ch[mi]) { cfg(p).ok = ""; ensureModels(p, true); }
          return tryM(mi + 1);
        });
      }
      return tryM(0);
    });
  }
  return tryP(0, 0);
}
function transcribe(blob) {
  var ps = voiceProvs(); if (!ps.length) return Promise.reject(new Error("Do przepisywania nagrań potrzebny jest klucz Gemini, Groq lub OpenAI."));
  return toWav(blob).catch(function () { return blob; }).then(function (w) {
    var errs = [];
    function tryP(i) {
      if (i >= ps.length) { var e = errs[errs.length - 1]; return Promise.reject(new Error(e ? friendly(e.e, PROV[e.p].n) : "Nie udało się przepisać nagrania.")); }
      var p = ps[i];
      if (p === "gemini") return b2b64(w).then(function (b) { return ai({ prov: "gemini", sys: "Jesteś precyzyjnym transkrybentem. Przepisz nagranie po polsku z interpunkcją. Zwróć wyłącznie przepisany tekst.", msgs: [{ r: "u", t: "Przepisz to nagranie.", aud: { mime: (w.type || "audio/wav").split(";")[0], b64: b } }] }); }).catch(function (e) { errs.push({ p: p, e: e }); return tryP(i + 1); });
      return ensureModels(p).then(function () {
        var ch = uniq((cfg(p).tl || []).concat(DEFT[p]));
        function tryM(mi) {
          if (mi >= ch.length) return tryP(i + 1);
          var fd = new FormData(); fd.append("file", w, w.type === "audio/wav" ? "nagranie.wav" : "nagranie.webm"); fd.append("model", ch[mi]); fd.append("language", "pl");
          return fetchT(PROV[p].base + "/audio/transcriptions", { method: "POST", headers: { Authorization: "Bearer " + cfg(p).k }, body: fd }, 120000)
            .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw hErr(r, j); return j.text || ""; }); })
            .catch(function (e) { errs.push({ p: p, e: e }); if (e.status === 401 || e.status === 403) return tryP(i + 1); return tryM(mi + 1); });
        }
        return tryM(0);
      });
    }
    return tryP(0);
  });
}
/* dodanie klucza: rozpoznaj dostawcę, sprawdź, dobierz modele */
function addKey(raw) {
  var k = cleanKey(raw); if (k.length < 12) { toast("To nie wygląda na klucz API – skopiuj go jeszcze raz w całości."); return; }
  var guess = detectProv(k), cand = guess ? [guess] : PORDER.slice();
  return run("Sprawdzam klucz…", function () {
    var lastE = null;
    function next(i) {
      if (i >= cand.length) throw new Error(lastE && (lastE.status === 401 || lastE.status === 403 || lastE.status === 400) ? "Klucz nie działa (" + (guess ? PROV[guess].n : "nie rozpoznano dostawcy") + "). Skopiuj go jeszcze raz w całości lub utwórz nowy." : lastE ? friendly(lastE, guess ? PROV[guess].n : "AI") : "Nie rozpoznano klucza.");
      var p = cand[i];
      return listModels(p, k).then(function (ids) {
        K[p] = { k: k, list: rankModels(p, ids), tl: rankTrans(p, ids), lt: Date.now() }; svK();
        if (!S.set.lastP || !cfg(S.set.lastP).k) { S.set.lastP = p; sv(); }
        return ai({ prov: p, msgs: [{ r: "u", t: "Odpowiedz jednym krótkim zdaniem po polsku, że wszystko działa." }] }).then(function (t) {
          render(); toast("✅ Połączono: " + PROV[p].n + ". " + t.slice(0, 70), 6000);
        }, function (e) { render(); toast("✅ Klucz " + PROV[p].n + " zapisany. Serwery są teraz zajęte – mentor zadziała, gdy tylko się zwolnią.", 7000); });
      }, function (e) {
        lastE = e;
        if (guess && [400, 401, 403].indexOf(e.status) < 0) { K[p] = { k: k }; svK(); if (!S.set.lastP) { S.set.lastP = p; sv(); } render(); toast("✅ Klucz " + PROV[p].n + " zapisany. Nie udało się go teraz sprawdzić (" + (e.status ? "serwer zajęty" : "brak internetu") + ") – zadziała automatycznie później.", 7000); return; }
        return next(i + 1);
      });
    }
    return next(0);
  });
}

/* ---------- AI: kontekst mentora ---------- */
var TONES = { trener: ["💪 Wymagający trener", "Jesteś wymagającym trenerem: mówisz krótko, stanowczo i konkretnie, rozliczasz z deklaracji, nie pozwalasz na wymówki, ale zawsze z szacunkiem."],
  coach: ["🤝 Życzliwy coach", "Jesteś życzliwym coachem: wspierasz, doceniasz postępy, zadajesz dobre pytania i wskazujesz 1–2 najważniejsze rzeczy do poprawy."],
  spok: ["🕊️ Spokojny towarzysz", "Jesteś spokojnym, refleksyjnym towarzyszem: mówisz łagodnie, bez presji, pomagasz dostrzec sens i małe kroki."] };
function sysPrompt() {
  return "Jesteś osobistym mentorem rozwoju w aplikacji „Nawyki i Talerz”. " + TONES[S.set.tone][1] +
    " System użytkownika: każdy nawyk ma poziomy Mini (lina ratunkowa, poniżej 2 minut), Plus i Elita. W 4 kategoriach (Zdrowie, Umysł, Relacje, Duch) liczy się najwyższy poziom dnia, maks. 12 pkt. Zasada: nigdy dwa dni „Brak” pod rząd. Prowadzi też pamiętnik z trzema pytaniami dnia, cele" + (on("fast") ? ", post przerywany" : "") + (on("proj") ? ", projekty" : "") + "." +
    " Pisz po polsku, zwracaj się na „Ty”. Opieraj się na danych i podawaj konkretne obserwacje (dni, liczby, cytaty z pamiętnika). Szukaj wzorców i powiązań między nawykami, samopoczuciem i notatkami. Proponuj małe, wykonalne kroki zgodne z filozofią Mini/Plus/Elita. Gdy czegoś nie wiesz – zapytaj." +
    " Masz też dane z modułu Jedzenie (licznik kalorii Talerz): kalorie zjedzone i dzienny limit na odchudzanie, płyny, warzywa i owoce (cel 400 g), cukry wolne (maks. 30 g), kroki, trening i wagę. Łącz je z nawykami i samopoczuciem, ale nie zachęcaj do głodzenia się ani skrajnych diet." +
    " Gdy pytam, co zjeść jutro, albo proszę o jadłospis: najpierw w 2–3 punktach oceń moje ostatnie dni (czego brakowało, czego było za dużo – kalorie, białko, warzywa, cukier, słodkie napoje, alkohol, późne jedzenie). Potem podaj plan na jutro z nagłówkami Śniadanie, Drugie śniadanie lub przekąska, Obiad, Kolacja – przy każdym daniu przybliżone kcal i białko, a na końcu sumę. Suma ma wypaść blisko mojego dziennego limitu (nie mniej niż ok. 85% limitu), z białkiem w normie i 400 g warzyw i owoców. Opieraj się na daniach i produktach, które już jem (historia posiłków i ulubione), na prostej polskiej kuchni i tanich produktach; zmieniaj tylko to, co poprawi bilans. Zakończ krótką listą zakupów." +
    " Czytając pamiętnik i odpowiedzi na pytania dnia, pomagaj mi kształtować zdrowe myślenie: doceniaj to, co dobre, łagodnie nazywaj pułapki myślenia (wszystko albo nic, katastrofizowanie, czytanie w myślach, „muszę/powinienem”, surowa samokrytyka, porównywanie się), proponuj realistyczne i życzliwe spojrzenie, wdzięczność i skupienie na tym, na co mam wpływ. Nie zastępujesz terapeuty: jeśli w zapiskach widać długotrwały smutek, beznadzieję lub myśli o zrobieniu sobie krzywdy, ciepło zachęć do rozmowy z bliską osobą lub specjalistą (w Polsce bezpłatny telefon zaufania 116 123, w nagłej sytuacji 112)." +
    " Szanuj wartości i przekonania użytkownika, w tym duchowe. Nie stawiaj diagnoz medycznych; przy niepokojących sygnałach zdrowotnych lub psychicznych zachęć do kontaktu ze specjalistą. Używaj prostego formatowania: krótkie akapity, listy z „- ”, pogrubienia **tak**.";
}
function ctx(nd) {
  nd = nd || 30; var sh = S.set.share, o = [], codes = {};
  o.push("DZISIAJ: " + dlong(key(new Date())));
  if (S.set.about) o.push("O MNIE: " + S.set.about);
  if (sh.h) {
    o.push("NAWYKI (kod: nazwa [kategoria] progi):");
    H.forEach(function (y, i) { codes[y[0]] = "N" + (i + 1); o.push("N" + (i + 1) + ": " + y[2] + " [" + CATS[y[1]][0] + "]" + (y[4] ? " Mini=" + y[4] : "") + (y[5] ? " Plus=" + y[5] : "") + (y[6] ? " Elita=" + y[6] : "")); });
    o.push("SERIE (obecna/najdłuższa): " + H.map(function (y) { return codes[y[0]] + " " + hStreak(y[0]) + "/" + bestF(function (k) { return lvl(k, y[0]) > 0; }); }).join(", "));
  }
  o.push("DZIENNIK OSTATNICH " + nd + " DNI (pkt/12; poziomy nawyków 1=Mini 2=Plus 3=Elita):");
  var FH = {}; S.fs.forEach(function (f) { if (f.e) { var k = key(new Date(f.s)); FH[k] = (FH[k] || 0) + (f.e - f.s) / 36e5; } });
  for (var i = nd - 1; i >= 0; i--) {
    var k = key(ago(i)), line = k + " " + ["nd", "pn", "wt", "śr", "cz", "pt", "sb"][k2d(k).getDay()] + ":";
    if (sh.h) { var l = LL(k), z = Object.keys(l).filter(function (x) { return l[x] && codes[x]; }).map(function (x) { return codes[x] + "=" + l[x]; }); line += " " + pts(k) + "pkt" + (z.length ? " [" + z.join(" ") + "]" : " [brak]"); var hn = S.hn[k]; if (hn) Object.keys(hn).forEach(function (x) { if (hn[x] && codes[x]) line += " | notatka " + codes[x] + ": " + hn[x]; }); }
    if (sh.f && on("fast") && FH[k]) line += " | post " + FH[k].toFixed(1) + "h";
    if (sh.t) { var tq = tz(k); if (tq) line += " | jedzenie: " + tq.kcal + (tq.lim ? "/" + tq.lim : "") + " kcal, posiłki: " + tq.meals + (tq.names.length ? " (" + tq.names.slice(0, 6).join(", ").slice(0, 160) + ")" : "") + ", białko " + tq.p + " g, płyny " + tq.ml + "/" + tq.wg + " ml, warzywa " + tq.veg + " g, cukier " + tq.sug + " g, kroki " + tq.steps + (tq.ex ? ", trening " + tq.ex + " kcal" : ""); }
    if (sh.d) { var t = (S.n[k] || "").trim(); if (t) line += " | pamiętnik: " + t.slice(0, 700).replace(/\n+/g, " / ");
      var pa = S.pa[k]; if (pa) { var qs = dayQs(k); pa.a.forEach(function (a, j) { if (a && a.trim()) line += " | " + qs[j] + " → " + a.slice(0, 300); }); }
      dEntries(k).forEach(function (e) { if (e.text) line += " | wpis " + ET[e.ty][1] + " " + hm(e.t) + ": " + e.text.slice(0, 500).replace(/\n+/g, " / "); }); }
    o.push(line);
  }
  if (sh.t) {
    var fd7 = []; for (var j = Math.min(nd, 7) - 1; j >= 0; j--) { var kj = key(ago(j)), tj = tz(kj); if (tj && tj.meals) fd7.push(kj + ": " + tj.ML.join("; ") + (tj.dk ? "; napoje " + tj.dk + " kcal" : "") + (tj.sw ? "; słodkie napoje " + tj.sw + " ml" : "") + (tj.alc ? "; alkohol " + tj.alc + " ml" : "")); }
    if (fd7.length) { o.push("POSIŁKI – SZCZEGÓŁY OSTATNICH DNI (godzina, nazwa, kcal, B/W/T w g):"); fd7.forEach(function (x) { o.push(x.slice(0, 900)); }); }
    var tfv = (tzProf() || {}).fav || []; if (tfv.length) o.push("ULUBIONE POSIŁKI: " + tfv.slice(0, 15).map(function (m) { return m.name + " (" + Math.round(+m.kcal || 0) + " kcal)"; }).join(", "));
    o.push("DZIENNA NORMA BIAŁKA: ok. " + tzProtT() + " g; warzywa i owoce: 400 g; cukry wolne: maks. 30 g.");
    var ttr = tzTrend(); if (ttr) o.push("TREND WAGI: " + trendTxt(ttr).replace(/^\S+\s/, ""));
    if (S.wg) o.push("CEL ŻYWIENIOWY TYGODNIA: " + WG[S.wg.g][0] + " – " + wgCount(S.wg) + "/" + S.wg.n + " dni (tydzień od " + S.wg.wk + ")");
    (S.wgh || []).slice(-4).forEach(function (w) { o.push("- poprzedni tydzień od " + w.wk + ": " + (WG[w.g] ? WG[w.g][0] : w.g) + " – " + w.done + "/" + w.n); });
  }
  if (sh.t) { var tp = tzProf(), ws = tzWeights().filter(function (w) { return w.date >= key(ago(nd)); }); if (tp) o.push("PROFIL JEDZENIA: " + (tp.sex === "k" ? "kobieta" : "mężczyzna") + ", " + tp.age + " lat, " + tp.height + " cm, waga " + tp.weight + " kg" + (tp.goal ? ", cel wagi " + tp.goal + " kg" : "") + (tp.rate ? ", tempo " + tp.rate + " kg/tydz." : "")); if (ws.length) o.push("WAGA: " + ws.map(function (w) { return w.date + " " + w.kg + " kg"; }).join(", ")); }
  if (S.g.length) { o.push("CELE:"); S.g.forEach(function (g) { var r = goalRate(g); o.push("- " + g.name + (g.done ? " (osiągnięty)" : "") + (g.due ? ", termin " + g.due : "") + ", postęp " + (g.pr || 0) + "%" + (r != null ? ", realizacja powiązanych nawyków 30 dni " + r + "%" : "") + (g.note ? ". " + g.note.slice(0, 300) : "")); }); }
  if (sh.p && on("proj") && S.pj.length) { o.push("POMYSŁY I PROJEKTY:"); S.pj.forEach(function (p) { var s = p.steps || []; o.push("- " + p.name + " [" + ST[p.status][1] + "] kroki " + s.filter(function (x) { return x.done; }).length + "/" + s.length + (p.desc ? ": " + p.desc.slice(0, 200).replace(/\n+/g, " ") : "")); }); }
  if (S.fc.length) { o.push("LISTA „DO PRACY” (od mentora):"); S.fc.slice(-12).forEach(function (f) { o.push("- " + f.t + " (dodane " + key(new Date(f.ts)) + ", " + (f.done ? "zrobione" : "w toku") + ")"); }); }
  if (S.rev.length) o.push("POPRZEDNI PRZEGLĄD (" + S.rev[S.rev.length - 1].k + "):\n" + S.rev[S.rev.length - 1].text.slice(0, 1500));
  return o.join("\n");
}
function run(label, fn) {
  if (busy) return; busy = label; rerender();
  return fn().then(function (x) { busy = ""; rerender(); return x; }, function (e) { busy = ""; toast("⚠️ " + e.message, 6000); rerender(); throw e; }).catch(function () {});
}
function rerender() { if (CE && $("etx")) { readForm(); showEntry(); } else if (CP && $("pjn")) { pjRead(); pjSheet(); } else render(); }
function parseList(t, head) {
  var i = head ? t.search(head) : 0; if (i < 0) return [];
  return t.slice(i).split("\n").map(function (l) { var m = /^\s*(?:[-*•]|\d+[.)])\s+(.+)/.exec(l); return m ? m[1].replace(/\*\*/g, "").trim() : null; }).filter(Boolean).slice(0, 10);
}
function doReview() {
  return run("Mentor analizuje Twój tydzień…", function () {
    return ai({ sys: sysPrompt(), msgs: [{ r: "u", t: ctx(30) + "\n\nZADANIE: Przygotuj mój przegląd ostatnich 7 dni (porównaj z wcześniejszymi tygodniami). Użyj nagłówków:\n## ✅ Co poszło dobrze\n## ⚠️ Co słabnie\n## 🔍 Wzorce i powiązania\n" + (S.set.share.t ? "## 🍽️ Jedzenie (jak poszedł cel tygodnia, co poprawić; zaproponuj JEDEN cel na następny tydzień spośród: " + Object.keys(WG).map(function (g) { return WG[g][0].replace(/^\S+\s/, ""); }).join(", ") + ")\n" : "") + (S.set.share.d ? "## 🧠 Myślenie i nastawienie (na podstawie odpowiedzi w pamiętniku: co wspiera, jakie pułapki myślenia się powtarzają, jedno zdrowsze zdanie na tydzień)\n" : "") + "## 💬 Pytanie do refleksji\n## 🎯 Do pracy\nW sekcji „Do pracy” podaj 1–3 konkretne, mierzalne działania na najbliższy tydzień – każde w osobnej linii zaczynającej się od „- ”. Odnieś się do listy „Do pracy” z poprzednich tygodni (co się udało, co nie). Maks. ok. 450 słów." }] })
      .then(function (t) { S.rev.push({ k: key(new Date()), ts: Date.now(), text: t }); sv(); tab = "ment"; render(); setTimeout(function () { var rc = $("revcard"); if (rc) rc.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80); });
  });
}
/* pamiętnik → zdrowe myślenie */
function doThink(k) {
  if (!hasAI()) { go("ust"); toast("Najpierw dodaj klucz API."); return; }
  var td = k === key(new Date()), qs = dayQs(k), pa = S.pa[k] || { a: [] }, tx = ((S.n[k] || "").trim() ? "Notatka: " + S.n[k].trim() + "\n" : "") +
    qs.map(function (q, i) { return pa.a[i] && pa.a[i].trim() ? q + " → " + pa.a[i].trim() : ""; }).filter(Boolean).join("\n") +
    dEntries(k).map(function (e) { return e.text ? "\nWpis " + hm(e.t) + ": " + e.text.slice(0, 600) : ""; }).join("");
  if (!tx.trim()) { toast("Najpierw coś zapisz albo odpowiedz na pytania dnia."); return; }
  chatSend("🧠 Omów moje " + (td ? "dzisiejsze odpowiedzi" : "odpowiedzi z " + dshort(k)) + " w pamiętniku", { p: "MÓJ WPIS Z DNIA " + k + ":\n" + tx + "\n\nZADANIE: Przeczytaj mój wpis i odpowiedzi na pytania dnia (na tle ostatnich dni) i pomóż mi kształtować zdrowe myślenie. Odnoś się do moich słów, bez ogólników, maks. ok. 130 słów, w punktach:\n- **Co dobrego widzę** – jedna konkretna rzecz z moich odpowiedzi.\n- **Pułapka myślenia** – tylko jeśli naprawdę jest: nazwij ją łagodnie i zacytuj krótki fragment; jeśli jej nie ma, pomiń ten punkt.\n- **Inne spojrzenie** – jedno zdrowsze, realistyczne zdanie, które mogę sobie powiedzieć.\n- **Mały krok na jutro** – jedna rzecz." });
}
function doTmrw() {
  if (!hasAI()) { go("ust"); toast("Najpierw dodaj klucz API."); return; }
  chatSend("🍽️ Co zjeść jutro?", { p: "Co zjeść jutro? Przeanalizuj moje jedzenie z ostatnich dni i zaproponuj prosty jadłospis na jutro." });
}
function doMQ(k) {
  return run("Mentor układa pytanie…", function () {
    return ai({ sys: sysPrompt(), msgs: [{ r: "u", t: ctx(10) + "\n\nZADANIE: Na podstawie ostatnich dni zadaj mi JEDNO krótkie, osobiste pytanie do refleksji w pamiętniku na dzień " + k + " (maks. 20 słów). Zwróć wyłącznie pytanie." }] })
      .then(function (t) { var q = t.replace(/^["„\s]+|["”\s]+$/g, "").split("\n")[0]; var p = S.pa[k] || { a: ["", "", ""] }; p.q = dayQs(k).slice(); p.q[2] = q; S.pa[k] = p; sv(); render(); toast("✨ Nowe pytanie dodane jako trzecie"); });
  });
}
function chatSend(t, o) {
  t = (t || "").trim(); o = o || {}; if (!t || busy) return;
  var m = { r: "u", t: t, ts: Date.now() }; if (o.p) m.p = o.p; if (o.v) m.v = 1; if (o.im && o.im.length) m.im = o.im;
  S.mt.push(m); if (S.mt.length > 800) S.mt = S.mt.slice(-800); sv();
  chatDraft = ""; CHATV = false;
  if (tab !== "ment") go("ment");
  window.scrollTo(0, 0);
  return chatAsk();
}
/* wysyła do AI rozmowę z dzisiaj (ostatnie wiadomości) i zapisuje odpowiedź */
function chatAsk() {
  var last = S.mt[S.mt.length - 1]; if (!last || last.r !== "u" || busy) return;
  return run("Mentor myśli…", function () {
    var td = key(new Date()), hist = [];
    S.mt.filter(function (m) { return m === last || key(new Date(m.ts)) === td; }).slice(-20).forEach(function (m) {
      var r = m.r === "u" ? "u" : "m", tx = m.p || m.t;
      if (hist.length && hist[hist.length - 1].r === r) hist[hist.length - 1].t += "\n\n" + tx; else hist.push({ r: r, t: tx });
    });
    while (hist.length && hist[0].r !== "u") hist.shift();
    var imgP = last.im ? Promise.all(last.im.slice(0, 4).map(function (id) { return MDB.get(id).then(function (b) { return b ? b2b64(b).then(function (x) { return { mime: b.type || "image/jpeg", b64: x }; }) : null; }); })) : Promise.resolve([]);
    return imgP.then(function (imgs) {
      imgs = (imgs || []).filter(Boolean); if (imgs.length) hist[hist.length - 1].img = imgs;
      return ai({ sys: sysPrompt() + "\n\nDANE UŻYTKOWNIKA:\n" + ctx(30), msgs: hist });
    }).then(function (a) {
      S.mt.push({ r: "m", t: a, ts: Date.now() }); sv();
      if (tab === "ment") render();
      var md0 = S.set.tts.mode; if (md0 === "always" || (md0 === "voice" && last.v)) speak(a, S.mt.length - 1);
    });
  });
}
function transcribeMedia(id) {
  return run("Przepisuję nagranie…", function () {
    return MDB.get(id).then(function (b) { if (!b) throw new Error("Nie znaleziono nagrania."); return transcribe(b); }).then(function (t) {
      if (!CE) return; readForm(); CE.e.text = (CE.e.text ? CE.e.text.replace(/\s+$/, "") + "\n" : "") + t.trim(); showEntry(); toast("✅ Nagranie przepisane");
    });
  });
}
function aiPic() {
  readForm(); var im = CE.e.media.filter(function (m) { return m.k === "img"; });
  if (!keyed().some(function (p) { return PROV[p].vision; })) { toast("Do analizy zdjęć potrzebny jest klucz Gemini, Claude, OpenAI lub OpenRouter."); return; }
  var tx = CE.e.text || "", d = CE.e.d; saveEntry(); if (CE) return;
  var c = (S.set.about ? "O mnie: " + S.set.about + "\n" : "") + (S.g.length ? "Moje cele: " + S.g.map(function (g) { return g.name; }).join("; ") + "\n" : "");
  chatSend("📷 Co widzisz na moim zdjęciu z pamiętnika?" + (tx ? " – " + tx.slice(0, 80) + (tx.length > 80 ? "…" : "") : ""), { im: im.map(function (m) { return m.id; }),
    p: c + "ZDJĘCIE Z MOJEGO PAMIĘTNIKA (" + d + ")" + (tx ? "\nMój opis: " + tx : "") + "\nPrzeanalizuj zdjęcie jako mój mentor. Jeśli jest na nim tekst (notatka, kartka, tablica) – najpierw przepisz go dokładnie. Jeśli to posiłek – krótko oceń go pod kątem zdrowego odżywiania i nawyków. W innym przypadku opisz krótko, co widzisz i jak ma się to do moich nawyków lub celów. Maks. 150 słów." });
}
function pjAI(mode) {
  pjRead(); var p = CP, base = "POMYSŁ: " + p.name + "\nOPIS: " + (p.desc || "(brak)") + "\nOBECNE KROKI: " + ((p.steps || []).map(function (s) { return s.t + (s.done ? " (zrobione)" : ""); }).join("; ") || "brak") + (S.set.about ? "\nO MNIE: " + S.set.about : "");
  var task = mode === "steps" ? "Rozbij ten pomysł na 5–8 konkretnych, małych kroków (każdy wykonalny w 1–2 godziny), w kolejności. Zwróć wyłącznie listę – każdy krok w osobnej linii zaczynającej się od „- ”." :
    "Oceń ten pomysł: ## Mocne strony, ## Ryzyka i pytania, ## Pierwszy krok na 30 minut. Bądź konkretny i szczery, maks. 200 słów.";
  return run("Mentor myśli nad pomysłem…", function () {
    return ai({ sys: sysPrompt(), msgs: [{ r: "u", t: base + "\n\nZADANIE: " + task }] }).then(function (t) {
      if (!CP) return;
      if (mode === "steps") { var L = parseList(t); if (!L.length) { CP.ai = t; } else { CP.steps = (CP.steps || []).concat(L.map(function (x) { return { id: uid("s"), t: x, done: 0 }; })); if (CP.status === "idea") CP.status = "plan"; toast("✅ Dodano " + L.length + " kroków"); } }
      else CP.ai = t;
      pjSheet();
    });
  });
}

/* ---------- CZYTANIE ODPOWIEDZI NA GŁOS (synteza mowy w telefonie, bez klucza) ---------- */
var TTS = { on: false, i: -1, unl: false }, CHATV = false, chatDraft = "";
var FEMV = /zosia|zofia|paulina|agnieszka|ewa|maja|marta|anna|female|kobiet|żeńsk|oda|zfg|afb/i, MALEV = /marek|adam|jacek|krzysztof|male|męsk|bmg|jmk/i;
function ttsOK() { return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window; }
function plVoices() { if (!ttsOK()) return []; return speechSynthesis.getVoices().filter(function (v) { return /^pl/i.test(v.lang || ""); }); }
function pickVoice() {
  var vs = plVoices(), w = S.set.tts.voice;
  if (w) { var f = vs.filter(function (v) { return v.voiceURI === w || v.name === w; })[0]; if (f) return f; }
  return vs.filter(function (v) { return FEMV.test(v.name) && !MALEV.test(v.name); })[0] || vs.filter(function (v) { return !MALEV.test(v.name); })[0] || vs[0] || null;
}
/* tekst do czytania: bez formatowania, emoji i list */
function sayText(t) {
  return String(t || "").replace(/```[\s\S]*?```/g, " ").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/\*\*|__|`|^#+\s*/gm, "").replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, "").replace(/\s[–—]\s/g, ", ").replace(/\n+/g, ". ")
    .replace(/:\s*\./g, ":").replace(/([.!?])\s*\./g, "$1").replace(/\s{2,}/g, " ").trim();
}
function speak(t, i) {
  if (!ttsOK()) return; speechSynthesis.cancel();
  var txt = sayText(t); if (!txt) return;
  var parts = txt.match(/[^.!?…]+[.!?…]*\s*/g) || [txt], chunks = [], cur = "";
  parts.forEach(function (x) { if ((cur + x).length > 200 && cur) { chunks.push(cur); cur = ""; } cur += x; }); if (cur.trim()) chunks.push(cur);
  var v = pickVoice(), n = chunks.length; TTS.on = true; TTS.i = i == null ? -1 : i; ttsUi();
  setTimeout(function () {
    chunks.forEach(function (c, j) {
      var u = new SpeechSynthesisUtterance(c.trim()); u.lang = "pl-PL"; if (v) u.voice = v; u.rate = +S.set.tts.rate || 1; u.pitch = 1;
      u.onend = function () { if (j === n - 1) { TTS.on = false; TTS.i = -1; ttsUi(); } };
      u.onerror = function () { if (j === n - 1 || !speechSynthesis.speaking) { TTS.on = false; TTS.i = -1; ttsUi(); } };
      speechSynthesis.speak(u);
    });
  }, 60);
}
function ttsStop() { if (ttsOK()) speechSynthesis.cancel(); TTS.on = false; TTS.i = -1; ttsUi(); }
function ttsUi() {
  var b = $("ttsstop"); if (b) b.hidden = !TTS.on;
  document.querySelectorAll('[data-a="say"]').forEach(function (x) { x.textContent = TTS.on && +x.getAttribute("data-i") === TTS.i ? "⏹️" : "🔊"; });
}
/* iPhone pozwala mówić dopiero po dotknięciu – „odblokowanie” przy wysyłaniu pytania */
function ttsUnlock() { try { if (ttsOK() && !TTS.unl) { var u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); TTS.unl = true; } } catch (e) {} }
if (ttsOK()) { try { speechSynthesis.getVoices(); speechSynthesis.addEventListener("voiceschanged", function () { if (tab === "ust" && !typing()) render(); }); } catch (e) {} }

/* ---------- MENTOR ---------- */
/* wiadomości → wymiany (pytanie + odpowiedź), z numerem wiadomości do przycisków 🔊 i 📋 */
function exch(list) {
  var out = [], cur = null;
  list.forEach(function (m) { if (m.r === "u" || !cur) { cur = { u: m.r === "u" ? m : null, a: [] }; out.push(cur); if (m.r !== "u") cur.a.push(m); } else cur.a.push(m); });
  return out;
}
function exHtml(x, state) {
  var h = '<div class="chx">';
  if (x.u) h += '<div class="bub u">' + (x.u.v ? "🎤 " : "") + esc(x.u.t) + (x.u.im ? '<div class="thumbs">' + x.u.im.map(function (id) { return '<img data-mid="' + id + '" data-a="full" alt="zdjęcie">'; }).join("") + "</div>" : "") + "<small>" + hm(x.u.ts) + "</small></div>";
  x.a.forEach(function (m) { h += '<div class="bub m">' + md(m.t) + '<div class="bt"><small>' + hm(m.ts) + '</small><span style="flex:1"></span>' + (ttsOK() ? '<button class="ib" data-a="say" data-i="' + m.i + '" aria-label="Przeczytaj na głos">' + (TTS.on && TTS.i === m.i ? "⏹️" : "🔊") + "</button>" : "") + '<button class="ib" data-a="copym" data-i="' + m.i + '" aria-label="Kopiuj">📋</button></div></div>'; });
  if (!x.a.length && state === "wait") h += '<div class="bub m think"><span class="dots"><i></i><i></i><i></i></span> ' + esc(busy || "Mentor myśli…") + "</div>";
  if (!x.a.length && state === "err") h += '<div class="bub m err">⚠️ Brak odpowiedzi. <button class="sec sm" data-a="chatretry">Ponów</button></div>';
  return h + "</div>";
}
function ment() {
  var h = "", td = key(new Date()), ok = hasAI();
  if (!ok) {
    h += '<div class="card hl"><b>🧭 Połącz mentora AI</b><p style="font-size:14px;margin:6px 0">Mentor analizuje Twoje nawyki, pamiętnik i jedzenie, proponuje jadłospis na jutro, robi przegląd tygodnia, zadaje pytania i pomaga dostrzec, nad czym warto popracować. Potrzebny jest tylko jeden klucz – resztę aplikacja ustawi sama.</p></div>' + keyBox(false) + keyHelp(true);
  }
  /* pole pytania – na górze */
  h += '<div class="card chatbox"><div class="tw"><textarea id="chatin" data-f="chatd" placeholder="Zapytaj mentora – napisz albo dotknij 🎤 i mów" style="min-height:64px;padding-right:52px">' + esc(chatDraft) + "</textarea>" + micBtn("chatin") + "</div>" +
    '<div class="btns" style="margin-top:8px;align-items:center"><button class="pri" data-a="chats"' + (busy || !ok ? " disabled" : "") + ">" + (busy ? "⏳ Mentor myśli…" : "Wyślij") + "</button>" +
    '<button class="sec" id="ttsstop" data-a="ttsstop"' + (TTS.on ? "" : " hidden") + ">⏹️ Zatrzymaj czytanie</button>" +
    (ttsOK() && S.set.tts.mode !== "never" ? '<span class="note" style="margin-left:auto">🔊 ' + (S.set.tts.mode === "always" ? "czytam odpowiedzi" : "czytam, gdy pytasz głosem") + "</span>" : "") + "</div>" +
    '<div class="qa">' + [["rev", "📊 Przegląd tygodnia"], ["tmrw", "🍽️ Co zjeść jutro?"], ["think", "🧠 Omów mój pamiętnik"], ["mq", "❓ Pytanie do pamiętnika"]].map(function (x) { return '<button class="tag" data-a="' + x[0] + '" data-k="' + td + '"' + (busy || !ok ? " disabled" : "") + ">" + x[1] + "</button>"; }).join("") + "</div>" +
    '<details class="qmore"><summary class="note">💡 Inne pytania</summary><div style="margin-top:6px">' + ["Nad czym powinienem teraz popracować?", "Dlaczego odpuszczam niektóre nawyki?", "Jakie wzorce widzisz w moim pamiętniku?", "Pomóż mi zaplanować jutro", "Który nawyk ma największy wpływ na mój dzień?", "Jak moje jedzenie wpływa na nawyki i samopoczucie?", "Jakie pułapki myślenia widzisz w moich odpowiedziach w pamiętniku?"].map(function (q) { return '<span class="tag" data-a="chatq" data-id="' + esc(q) + '">' + esc(q) + "</span>"; }).join("") + "</div></details></div>";
  /* trwające zadanie, które nie jest rozmową (przegląd, pytanie do pamiętnika) */
  var lastM = S.mt[S.mt.length - 1], chatWait = busy && lastM && lastM.r === "u";
  if (busy && !chatWait) h += '<div class="card think"><span class="dots"><i></i><i></i><i></i></span> ' + esc(busy) + "</div>";
  /* dzisiejsza rozmowa – najnowsza na górze */
  var all = S.mt.map(function (m, i) { return Object.assign({}, m, { i: i }); }), today = all.filter(function (m) { return key(new Date(m.ts)) === td; }), old = all.filter(function (m) { return key(new Date(m.ts)) !== td; });
  var ex = exch(today).reverse();
  if (ex.length) h += '<h3>💬 Dzisiaj</h3>' + ex.map(function (x, j) { var st = j === 0 && !x.a.length && x.u ? (chatWait ? "wait" : "err") : ""; return exHtml(x, st); }).join("");
  else if (ok && !busy) h += '<div class="note" style="margin:4px 2px 14px">Zapytaj o cokolwiek – mentor zna Twoje nawyki, pamiętnik i jedzenie z ostatnich 30 dni. Wcześniejsze rozmowy znajdziesz w archiwum na dole.</div>';
  /* przegląd tygodnia */
  if (S.rev.length) {
    var r = S.rev[S.rev.length - 1], sug = parseList(r.text, /do pracy/i), fresh = Date.now() - r.ts < 2 * 864e5;
    h += '<details class="card" id="revcard"' + (fresh ? " open" : "") + '><summary><b>📊 Przegląd tygodnia · ' + dshort(r.k) + "</b></summary>" + '<div class="ai" style="background:none;padding:0;margin-top:8px">' + md(r.text) + "</div>";
    if (sug.length) h += '<div class="btns" style="margin-top:8px">' + sug.map(function (s, i) { var have = S.fc.some(function (f) { return f.t === s; }); return '<button class="sec sm" data-a="fcsug" data-i="' + i + '"' + (have ? " disabled" : "") + ">" + (have ? "✓ " : "➕ ") + esc(s.length > 50 ? s.slice(0, 50) + "…" : s) + "</button>"; }).join("") + "</div>";
    if (S.rev.length > 1) h += '<details style="margin-top:10px"><summary class="note">Wcześniejsze przeglądy (' + (S.rev.length - 1) + ")</summary>" + S.rev.slice(0, -1).reverse().map(function (x) { return '<div class="ent"><b>' + dshort(x.k) + "</b>" + md(x.text) + "</div>"; }).join("") + "</details>";
    h += "</details>"; lastRev = sug;
  }
  /* do pracy */
  var fc = S.fc.filter(function (x) { return !x.done; }), fd = S.fc.filter(function (x) { return x.done; });
  h += '<div class="card"><h3>🎯 Do pracy</h3>' + (fc.length ? fc.map(function (x) { return '<div class="step"><button class="ck" data-a="fcdone" data-id="' + x.id + '"></button><span style="flex:1;font-size:14px">' + esc(x.t) + '<small class="note" style="display:block">od ' + new Date(x.ts).toLocaleDateString("pl-PL") + '</small></span><button class="ib" data-a="fcrm" data-id="' + x.id + '">✕</button></div>'; }).join("") : '<div class="note">Pusto. Mentor zaproponuje rzeczy do pracy w przeglądzie tygodnia – możesz też dopisać własne.</div>') +
    '<div class="btns" style="flex-wrap:nowrap;margin-top:8px"><input id="fcn" placeholder="Nad czym chcę popracować…" style="flex:1"><button class="sec" data-a="fcadd">+</button></div>' + (fd.length ? '<div class="note" style="margin-top:6px">Zrobione: ' + fd.length + "</div>" : "") + "</div>";
  /* archiwum – wcześniejsze dni, zwinięte */
  if (old.length) {
    var byDay = {}; old.forEach(function (m) { var k = key(new Date(m.ts)); (byDay[k] = byDay[k] || []).push(m); });
    var days = Object.keys(byDay).sort().reverse();
    h += '<details class="card arch"><summary><b>🗂️ Archiwum rozmów</b> <span class="note">(' + days.length + " " + pl(days.length, "dzień", "dni", "dni") + ")</span></summary>" +
      days.map(function (k) { var ee = exch(byDay[k]), q = ee.filter(function (x) { return x.u; })[0]; return '<details class="aday"><summary>' + dshort(k) + ' <span class="note">· ' + ee.length + " · " + esc(q ? q.u.t.slice(0, 48) + (q.u.t.length > 48 ? "…" : "") : "") + "</span></summary>" + ee.reverse().map(function (x) { return exHtml(x, ""); }).join("") + "</details>"; }).join("") +
      '<button class="lnk dng" data-a="chatclr" style="margin-top:10px">🗑 Usuń całą historię rozmów</button></details>';
  }
  h += '<div class="note">Mentor: ' + TONES[S.set.tone][0] + " · " + (ok ? (LASTM || prov().n) : "brak klucza") + ". Co widzi mentor: " + [S.set.share.h && "nawyki", S.set.share.d && "pamiętnik", S.set.share.t && "jedzenie", S.set.share.f && on("fast") && "post", S.set.share.p && on("proj") && "projekty"].filter(Boolean).join(", ") + ". Zmienisz to w Ustawieniach. Dane są wysyłane do wybranego dostawcy AI tylko, gdy korzystasz z mentora.</div>";
  return h;
}

/* ---------- WIĘCEJ ---------- */
function wiecej() {
  var act = S.pj.filter(function (p) { return p.status === "doing"; }).length, ig = S.g.filter(function (g) { return !g.done; }).length;
  var t = [["proj", "💡", "Pomysły i projekty", S.pj.length + " · w toku " + act], ["cele", "🎯", "Cele", ig + " aktywnych"], ["roz", "🤸", "Rozruch", "ćwiczenia z minutnikiem"], ["ryt", "⏰", "Rytm dnia", "plan i przypomnienia"], ["fast", "🌙", "Post przerywany", actF() ? "trwa teraz" : "historia i cel"], ["rap", "📊", "Raport", "PDF, CSV, udostępnij"], ["jedz", "🍽️", "Jedzenie – profil", "dane, limit, wygląd"], ["ust", "⚙️", "Ustawienia i AI", hasAI() ? prov().n : "dodaj klucz API"], ["dane", "💾", "Kopie i dane", S.bk ? "kopia " + new Date(S.bk).toLocaleDateString("pl-PL") : "brak kopii"]];
  t = t.filter(function (x) { return x[0] === "proj" ? on("proj") : x[0] === "ryt" ? on("ryt") : x[0] === "fast" ? on("fast") : true; });
  return '<div class="g2">' + t.map(function (x) { return '<div class="tile" data-a="' + (x[0] === "jedz" ? 'tzgo" data-id="profil' : 'tab" data-id="' + x[0]) + '"><i>' + x[1] + "</i>" + x[2] + "<small>" + esc(x[3]) + "</small></div>"; }).join("") + '</div><div class="note" style="text-align:center">Nawyki i Talerz ' + VER + "</div>";
}

/* ---------- ROZRUCH (bez zmian funkcjonalnych) ---------- */
function dur(m, i) { return Math.max(5, +S.ex[m][i][3] || 30); }
function tsum(m) { var t = 0; S.ex[m].forEach(function (e, i) { t += dur(m, i); }); return t; }
function mv(a, i, d) { var j = i + d; if (j < 0 || j >= a.length) return; var x = a[i]; a[i] = a[j]; a[j] = x; }
function exIn(m, i, j, v, ph) { return '<input data-f="exf" data-m="' + m + '" data-i="' + i + '" data-j="' + j + '" value="' + esc(v) + '" placeholder="' + ph + '">'; }
function exEd(m, title) {
  var x = '<div class="card"><h3>' + title + '</h3><div class="btns" style="margin-bottom:8px"><input type="number" min="5" max="600" id="all' + m + '" placeholder="s" style="width:80px"><button class="sec" data-a="exall" data-m="' + m + '">Ustaw czas wszystkim</button></div>';
  S.ex[m].forEach(function (e, i) { var at = 'data-m="' + m + '" data-i="' + i + '"'; x += '<div class="ed">' + exIn(m, i, 0, e[0], "Nazwa ćwiczenia") + exIn(m, i, 1, e[1], "Wariant A") + exIn(m, i, 2, e[2], "Wariant B") + '<div class="btns"><input type="number" min="5" max="600" data-f="exf" ' + at + ' data-j="3" value="' + dur(m, i) + '" style="width:80px"><span class="note">s</span><button class="sec" data-a="exup" ' + at + '>↑</button><button class="sec" data-a="exdn" ' + at + '>↓</button><button class="sec" data-a="exrm" ' + at + ">🗑</button></div></div>"; });
  return x + '<button class="pri" data-a="exadd" data-m="' + m + '">+ Dodaj ćwiczenie</button></div>';
}
function roz() {
  var k = key(new Date()), ro = S.ro[k] || {}, h = "";
  if (P) {
    var L = S.ex[P.m], e = L[P.i];
    h += '<div class="card"><div class="note" style="text-align:center">Ćwiczenie ' + (P.i + 1) + " z " + L.length + '</div><div class="bar"><i style="width:' + (P.i / L.length * 100) + '%"></i></div><div class="ex" id="xn">' + esc(e[0]) + '</div><div class="var" id="xv">' + esc(P.v === "A" ? e[1] : e[2]) + '</div><div class="big" id="tm">' + P.t + ' s</div><div class="btns c"><button class="sec" data-a="var">Wariant ' + (P.v === "A" ? "B" : "A") + '</button><button class="pri" data-a="run">' + (P.run ? "Pauza" : "Start") + '</button><button class="sec" data-a="nx">Dalej ›</button></div><div class="btns c" style="margin-top:10px"><button class="sec" data-a="xed">' + (edx ? "✓ Gotowe" : "✏️ Edytuj ćwiczenie") + "</button></div>" +
      (edx ? '<div class="ed">' + exIn(P.m, P.i, 0, e[0], "Nazwa ćwiczenia") + exIn(P.m, P.i, 1, e[1], "Opis / wariant A") + exIn(P.m, P.i, 2, e[2], "Opis / wariant B") + '<div class="btns"><input type="number" min="5" max="600" data-f="exf" data-m="' + P.m + '" data-i="' + P.i + '" data-j="3" value="' + dur(P.m, P.i) + '" style="width:80px"><span class="note">s</span></div></div>' : "") +
      '<h3>Uwagi do ćwiczenia</h3><textarea style="min-height:70px" data-f="exf" data-m="' + P.m + '" data-i="' + P.i + '" data-j="4" placeholder="Twoje uwagi, np. technika, samopoczucie">' + esc(e[4] || "") + '</textarea><div class="foot"><button class="lnk" data-a="stop">Przerwij</button></div></div>';
  } else {
    h += '<div class="g2"><div class="card"><b>Siedząca</b><div class="note">' + S.ex.s.length + " ćw., ok. " + Math.round(tsum("s") / 60) + " min</div><p>" + (ro.s ? "✅ Zrobione" : "Do zrobienia") + '</p><button class="pri" data-a="go" data-m="s">Start</button></div><div class="card"><b>Stojąca</b><div class="note">' + S.ex.t.length + " ćw., ok. " + Math.round(tsum("t") / 60) + " min</div><p>" + (ro.t ? "✅ Zrobione" : "Do zrobienia") + '</p><button class="pri" data-a="go" data-m="t">Start</button></div></div><div class="btns" style="margin-bottom:12px"><button class="sec" data-a="exe">' + (edr ? "✓ Gotowe" : "✏️ Edytuj ćwiczenia i czas") + "</button></div>";
    if (edr) h += exEd("s", "Siedząca") + exEd("t", "Stojąca");
    h += '<div class="note">Jedna faza podnosi „Ćwiczenia fizyczne” do Plus, obie do Elita.</div>';
  }
  return h;
}
/* ---------- RYTM DNIA i przypomnienia ---------- */
function pt(t) { var m = /(\d{1,2}):(\d{2})/.exec(t || ""); return m ? [+m[1], +m[2]] : null; }
function ryt() {
  var ok = "Notification" in window, pm = ok ? Notification.permission : "unsupported";
  var h = '<div class="card"><div class="btns"><button class="sec" data-a="ryed">' + (edy ? "✓ Gotowe" : "✏️ Edytuj rytm dnia") + "</button>" + (ok && pm === "default" ? '<button class="pri" data-a="perm">🔔 Włącz powiadomienia</button>' : "") + (ok && pm === "granted" ? '<button class="sec" data-a="ntest">Testuj powiadomienie</button>' : "") + '<button class="sec" data-a="ics">📅 Do kalendarza (.ics)</button></div><div class="note" style="margin-top:8px">' + (!ok ? "Ta przeglądarka nie obsługuje powiadomień. " : pm === "denied" ? "Powiadomienia są zablokowane w ustawieniach przeglądarki. " : pm === "granted" ? "Powiadomienia są włączone. " : "") + "Dotknij 🔔 przy punkcie, aby dostać przypomnienie o jego godzinie. Powiadomienia działają, gdy aplikacja jest otwarta lub w tle. Najpewniejsze przypomnienia, także przy zamkniętej aplikacji, daje eksport do kalendarza: obejmuje punkty z 🔔, przypomnienia nawyków i pamiętnika.</div></div>";
  var hr = H.filter(function (y) { return pt(y[7]); });
  if (hr.length || S.set.drOn) h += '<h3>Przypomnienia nawyków i pamiętnika</h3><div class="card">' + hr.map(function (y) { return '<div class="tl"><b>' + esc(y[7]) + "</b><span>" + CATS[y[1]][1] + " " + esc(y[2]) + "</span></div>"; }).join("") + (S.set.drOn ? '<div class="tl"><b>' + esc(S.set.dr) + "</b><span>📔 Wpis do pamiętnika</span></div>" : "") + '<div class="note">Godziny nawyków ustawisz w Dziś → ✏️ Edytuj, pamiętnika w Ustawieniach.</div></div>';
  h += '<h3>Plan dnia</h3><div class="card">';
  S.ry.forEach(function (x) {
    var id = x[0];
    if (edy) h += '<div class="ed"><input data-f="ry" data-id="' + id + '" data-j="1" value="' + esc(x[1]) + '" placeholder="Godzina, np. 07:00"><input data-f="ry" data-id="' + id + '" data-j="2" value="' + esc(x[2]) + '" placeholder="Co trzeba zrobić"><input data-f="ry" data-id="' + id + '" data-j="3" value="' + esc(x[3]) + '" placeholder="Dlaczego (opcjonalnie)"><div class="btns"><button class="sec" data-a="ryup" data-id="' + id + '">↑</button><button class="sec" data-a="rydn" data-id="' + id + '">↓</button><button class="sec" data-a="ryrm" data-id="' + id + '">🗑</button></div></div>';
    else h += '<div class="tl"><b>' + esc(x[1]) + "</b><span>" + esc(x[2]) + (x[3] ? "<small>" + esc(x[3]) + "</small>" : "") + '</span><button class="sec" data-a="bell" data-id="' + id + '">' + (x[4] ? "🔔" : "🔕") + "</button></div>";
  });
  return h + (edy ? '<button class="pri" data-a="ryadd">+ Dodaj punkt</button>' : "") + "</div>";
}
function notify(t, b) { try { if (!("Notification" in window) || Notification.permission !== "granted") return; if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(function (r) { r.showNotification(t, { body: b, icon: "icon-192.png", tag: t + b }); }); else new Notification(t, { body: b, icon: "icon-192.png" }); } catch (e) {} }
function reminders() {
  var a = [];
  if (on("ryt")) S.ry.forEach(function (x) { var q = pt(x[1]); if (x[4] && q) a.push({ id: x[0], q: q, t: "Rytm dnia", b: x[2], d: x[3] || "" }); });
  H.forEach(function (y) { var q = pt(y[7]); if (q) a.push({ id: "h" + y[0], q: q, t: CATS[y[1]][1] + " Nawyk", b: y[2], d: y[4] ? "Mini: " + y[4] : "", hid: y[0] }); });
  var q2 = pt(S.set.dr); if (S.set.drOn && q2) a.push({ id: "diary", q: q2, t: "📔 Pamiętnik", b: "Jedno zdanie wystarczy. " + dayQs(key(new Date()))[0], d: "", diary: 1 });
  var q3 = S.set.ev && S.set.ev.on && pt(S.set.ev.t); if (q3) a.push({ id: "ev", q: q3, t: "🌆 Wieczorny bilans", b: "Wieczorny bilans – otwórz Nawyki i Talerz", d: "Ile zostało kalorii, czego brakuje i które serie chronić", ev: 1 });
  var q4 = S.set.sp && S.set.sp.on && pt(S.set.sp.t); if (q4) a.push({ id: "sp", q: q4, t: "🔥 Ochrona serii", b: "Ochrona serii – sprawdź nawyki (wystarczy Mini)", d: "", sp: 1 });
  return a;
}
function chk() {
  var n = new Date(), now = pad(n.getHours()) + ":" + pad(n.getMinutes()), dk = key(n);
  reminders().forEach(function (r) {
    var t = pad(r.q[0]) + ":" + pad(r.q[1]), id = r.id + dk + t; if (t !== now || fired[id]) return; fired[id] = 1;
    if (r.diary && dLv(dk) > 0) return; if (r.hid && lvl(dk, r.hid) > 0) return;
    if (r.ev) { notify(r.t, evNote(dk)); return; }
    if (r.sp) { tzReset(); var rr = atRisk(dk); if (!rr.length) return; notify(r.t, rr.slice(0, 3).map(function (x) { return x[0][2] + " (" + x[1] + " " + pl(x[1], "dzień", "dni", "dni") + ")"; }).join(", ") + " – wystarczy Mini, żeby nie przerwać serii!"); return; }
    notify(r.t + " · " + t, r.b);
  });
}
function ics() {
  var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nawyki//PL", "CALSCALE:GREGORIAN"], n = new Date(), d0 = n.getFullYear() + pad(n.getMonth() + 1) + pad(n.getDate()), A = reminders(), c = 0;
  if (on("ryt") && !S.ry.some(function (x) { return x[4] && pt(x[1]); })) S.ry.forEach(function (x) { var q = pt(x[1]); if (q) A.push({ id: x[0], q: q, b: x[2], d: x[3] || "" }); });
  function e(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  A.forEach(function (x) { c++; L.push("BEGIN:VEVENT", "UID:" + x.id + "-" + d0 + "@nawyki", "DTSTAMP:" + d0 + "T000000Z", "DTSTART:" + d0 + "T" + pad(x.q[0]) + pad(x.q[1]) + "00", "DURATION:PT15M", "RRULE:FREQ=DAILY", "SUMMARY:" + e(x.b), "DESCRIPTION:" + e(x.d), "BEGIN:VALARM", "TRIGGER:PT0S", "ACTION:DISPLAY", "DESCRIPTION:" + e(x.b), "END:VALARM", "END:VEVENT"); });
  if (!c) { toast("Dodaj godziny w formacie 07:00."); return; }
  L.push("END:VCALENDAR"); dl("nawyki-przypomnienia.ics", L.join("\r\n"), "text/calendar");
}
/* ---------- POST ---------- */
function hmd(ms) { var m = Math.floor(ms / 6e4); return Math.floor(m / 60) + " h " + pad(m % 60) + " min"; }
function fd(ms) { var d = new Date(ms); return d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }) + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
function actF() { return S.fs.filter(function (f) { return !f.e; }).pop(); }
function bars(v, mx, gl, l0, l1) {
  var Hh = 100, bw = 278 / Math.max(1, v.length), s = '<svg viewBox="0 0 300 125" width="100%" role="img">';
  [mx / 2, mx].forEach(function (g) { var y = 5 + Hh - g / mx * Hh; s += '<line x1="22" x2="300" y1="' + y + '" y2="' + y + '" class="gl"/><text x="0" y="' + (y + 3) + '" class="ax">' + Math.round(g) + "</text>"; });
  v.forEach(function (x, i) { var h = Math.min(x, mx) / mx * Hh; s += '<rect x="' + (22 + i * bw + bw * .15) + '" y="' + (5 + Hh - h) + '" width="' + bw * .7 + '" height="' + h + '" rx="1.5" class="' + (gl && x < gl ? "b3" : "b") + '"/>'; });
  if (gl) { var y = 5 + Hh - gl / mx * Hh; s += '<line x1="22" x2="300" y1="' + y + '" y2="' + y + '" class="gw"/>'; }
  return s + '<text x="22" y="122" class="ax">' + l0 + '</text><text x="300" y="122" class="ax" text-anchor="end">' + l1 + "</text></svg>";
}
function fast() {
  var a = actF(), g = S.fg, L = S.fs.filter(function (f) { return f.e; }).reverse(), h = '<div class="card" style="text-align:center">';
  if (a) { var el = Date.now() - a.s, pc = Math.min(1, el / (g * 36e5)); h += '<div class="note">Post trwa od ' + fd(a.s) + '</div><div class="big" id="fa">' + hmd(el) + '</div><div class="bar"><i style="width:' + pc * 100 + '%"></i></div><div class="note">Cel: ' + g + " h" + (pc >= 1 ? " · osiągnięty ✅" : "") + '</div><div class="btns c" style="margin-top:10px"><button class="pri" data-a="fe">🍽️ Zjadłem pierwszy posiłek</button><button class="sec" data-a="fx">Anuluj</button></div>'; }
  else h += '<div class="note">Gdy zjesz ostatni posiłek wieczorem, dotknij przycisku. Rano, po pierwszym posiłku, aplikacja policzy godziny przerwy.</div><div class="btns c" style="margin-top:10px"><button class="pri" data-a="fs">🌙 Zjadłem ostatni posiłek</button></div>';
  h += "</div>";
  if (L.length) { var r = L.slice(0, 14).reverse(); h += '<h3>Ostatnie posty (godziny)</h3><div class="card">' + bars(r.map(function (f) { return (f.e - f.s) / 36e5; }), Math.max(24, g + 2), g, fd(r[0].s).split(",")[0], fd(r[r.length - 1].s).split(",")[0]) + "</div>"; }
  h += '<h3>Historia</h3><div class="card">' + (L.length ? "" : '<div class="note">Brak zakończonych postów.</div>');
  L.slice(0, 30).forEach(function (f) { var x = (f.e - f.s) / 36e5; h += '<div class="tl"><b style="min-width:70px">' + x.toFixed(1) + " h</b><span>" + fd(f.s) + " → " + fd(f.e) + "<small>" + (x >= g ? "✅ cel osiągnięty" : "poniżej celu") + '</small></span><button class="sec" data-a="fdel" data-id="' + f.s + '">🗑</button></div>'; });
  return h + '</div><h3>Dodaj ręcznie</h3><div class="card"><div class="ed" style="border:0;padding:0"><label class="note">Ostatni posiłek</label><input type="datetime-local" id="f1"><label class="note">Pierwszy posiłek</label><input type="datetime-local" id="f2"><button class="sec" data-a="fadd">+ Dodaj post</button><label class="note">Cel postu (godziny)</label><input type="number" min="1" max="48" data-f="fg" value="' + g + '"></div></div>';
}
/* ---------- RAPORT ---------- */
function stats(D) {
  var o = { n: D.length, tp: 0, act: 0, el: 0, hb: [], ca: { z: 0, m: 0, r: 0, d: 0 }, ds: {}, dd: 0 }, w = 0, b = 0;
  D.forEach(function (k) { o.ds[k] = 1; var p = pts(k), c = cats(k); o.tp += p; if (dLv(k)) o.dd++; if (p > 0) { o.act++; w++; if (w > b) b = w; } else w = 0; for (var i in c) { o.ca[i] += c[i]; if (c[i] === 3) o.el++; } }); o.bs = b;
  H.forEach(function (h) { var x = [0, 0, 0, 0]; D.forEach(function (k) { x[lvl(k, h[0])]++; }); o.hb.push({ n: h[2], c: h[1], d: o.n - x[0], x: x }); });
  o.f = S.fs.filter(function (f) { return f.e && o.ds[key(new Date(f.s))]; });
  o.fa = o.f.length ? o.f.reduce(function (a, f) { return a + (f.e - f.s); }, 0) / o.f.length / 36e5 : 0;
  o.fg = o.f.filter(function (f) { return (f.e - f.s) / 36e5 >= S.fg; }).length; return o;
}
function days() { var D = []; for (var i = rg - 1; i >= 0; i--) D.push(key(ago(i))); return D; }
function rap() {
  var D = days(), o = stats(D), i, h = '<div class="btns noprint" style="margin-bottom:12px">';
  [7, 30, 90, 365].forEach(function (r) { h += '<button class="' + (rg === r ? "pri" : "sec") + '" data-a="rg" data-id="' + r + '">' + r + " dni</button>"; }); h += "</div>";
  h += '<div class="g2"><div class="st"><b>' + (o.tp / o.n).toFixed(1) + '</b><span>średnio pkt / dzień</span></div><div class="st"><b>' + Math.round(o.act / o.n * 100) + '%</b><span>dni aktywnych</span></div><div class="st"><b>' + o.bs + '</b><span>najdłuższa seria</span></div><div class="st"><b>' + o.dd + '</b><span>dni z pamiętnikiem</span></div></div>';
  h += '<h3>Punkty dziennie (maks. 12)</h3><div class="card">' + bars(D.map(pts), 12, 0, D[0].slice(5), D[D.length - 1].slice(5)) + '</div><h3>Średni poziom kategorii</h3><div class="card">';
  for (i in CATS) { var a = o.ca[i] / o.n; h += '<div class="nm" style="margin:6px 0">' + CATS[i][1] + " " + CATS[i][0] + " · " + a.toFixed(1) + ' / 3<div class="bar"><i style="width:' + a / 3 * 100 + '%"></i></div></div>'; }
  h += '</div><h3>Realizacja nawyków</h3><div class="card">';
  o.hb.forEach(function (x) { h += '<div class="nm" style="margin:8px 0">' + CATS[x.c][1] + " " + esc(x.n) + " · <b>" + Math.round(x.d / o.n * 100) + '%</b><div class="bar"><i style="width:' + x.d / o.n * 100 + '%"></i></div><small>' + x.d + " z " + o.n + " dni · Mini " + x.x[1] + " · Plus " + x.x[2] + " · Elita " + x.x[3] + "</small></div>"; });
  h += "</div>";
  if (o.f.length) h += '<h3>Post przerywany</h3><div class="card">' + bars(o.f.map(function (f) { return (f.e - f.s) / 36e5; }), Math.max(24, S.fg + 2), S.fg, fd(o.f[0].s).split(",")[0], fd(o.f[o.f.length - 1].s).split(",")[0]) + '<div class="note">Średnio ' + o.fa.toFixed(1) + " h · cel " + S.fg + " h osiągnięty " + o.fg + " z " + o.f.length + " razy</div></div>";
  return h + '<h3 class="noprint">Eksport</h3><div class="card noprint"><div class="btns"><button class="pri" data-a="pr">🖨️ Raport PDF</button><button class="sec" data-a="rt">📤 Raport tekstowy</button><button class="sec" data-a="csv">📊 CSV</button></div><div class="note" style="margin-top:8px">PDF: w oknie drukowania wybierz „Zapisz jako PDF”. CSV otworzysz w Excelu lub Arkuszach. Kopie zapasowe są w Więcej → Kopie i dane.</div></div>';
}
function rt() {
  var o = stats(days()), t = "Raport nawyków: ostatnie " + rg + " dni\nŚrednio punktów dziennie: " + (o.tp / o.n).toFixed(1) + "/12\nDni aktywne: " + o.act + " z " + o.n + "\nNajdłuższa seria: " + o.bs + "\nDni z pamiętnikiem: " + o.dd + "\n\n";
  o.hb.forEach(function (x) { t += x.n + ": " + Math.round(x.d / o.n * 100) + "% (" + x.d + "/" + o.n + ")\n"; });
  if (o.f.length) t += "\nPost przerywany: średnio " + o.fa.toFixed(1) + " h, cel " + S.fg + " h osiągnięty " + o.fg + "/" + o.f.length + "\n";
  if (navigator.share) navigator.share({ title: "Raport nawyków", text: t }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { toast("Raport skopiowany do schowka"); }); else alert(t);
}
function csv() {
  var ks = Object.keys(S.l).concat(Object.keys(S.n)).sort(); if (!ks.length) { toast("Brak danych do eksportu."); return; }
  var q = function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }, d = k2d(ks[0]), e = new Date(), FH = {};
  S.fs.forEach(function (f) { if (f.e) { var k = key(new Date(f.s)); FH[k] = (FH[k] || 0) + (f.e - f.s) / 36e5; } });
  var r = [["Data"].concat(H.map(function (h) { return h[2]; }), ["Zdrowie", "Umysł", "Relacje", "Duch", "Punkty", "Post (h)", "Pamiętnik (poziom)", "Notatka i wpisy"]).map(q).join(";")];
  for (; d <= e; d.setDate(d.getDate() + 1)) { var k = key(d), l = LL(k), c = cats(k); r.push([k].concat(H.map(function (h) { return l[h[0]] || 0; }), [c.z, c.m, c.r, c.d, pts(k), FH[k] ? FH[k].toFixed(1).replace(".", ",") : "", dLv(k), dText(k)]).map(q).join(";")); }
  dl("nawyki-" + key(new Date()) + ".csv", "\ufeff" + r.join("\r\n"), "text/csv");
}
/* ---------- USTAWIENIA ---------- */
function keyBox(first) {
  return '<div class="card' + (first ? " hl" : "") + '"><b>🔑 ' + (first ? "Wklej klucz API" : "Dodaj kolejny klucz") + '</b><div class="note">Aplikacja sama rozpozna dostawcę, sprawdzi klucz i dobierze najlepszy model. Nic więcej nie trzeba ustawiać.</div>' +
    '<div class="btns" style="flex-wrap:nowrap;margin-top:8px"><input id="newkey" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Wklej tutaj klucz" style="flex:1"><button class="pri" data-a="ksave"' + (busy ? " disabled" : "") + '>Zapisz</button></div>' +
    '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="kpaste"' + (busy ? " disabled" : "") + '>📋 Wklej ze schowka i zapisz</button></div>' + (busy ? '<div class="busy">⏳ ' + esc(busy) + "</div>" : "") + "</div>";
}
function keyHelp(open) {
  return '<details class="card"' + (open ? " open" : "") + '><summary>❔ Skąd wziąć klucz? (2 minuty, za darmo)</summary><ol style="font-size:14px;padding-left:20px;margin:10px 0">' +
    '<li>Dotknij przycisku poniżej i zaloguj się kontem Google.</li><li>Kliknij <b>„Create API key”</b> (Utwórz klucz).</li><li>Skopiuj klucz, wróć tutaj i dotknij <b>📋 Wklej ze schowka i zapisz</b>.</li></ol>' +
    '<a href="' + PROV.gemini.key + '" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none;padding:12px;border-radius:10px;background:var(--ac);color:#fff;font-weight:600">🔑 Odbierz darmowy klucz Google Gemini ↗</a>' +
    '<div class="note" style="margin-top:10px">Gemini polecam na start: darmowy limit, obsługuje tekst, zdjęcia i nagrania. Inni dostawcy (opcjonalnie, zwykle płatni):</div><div class="btns" style="margin-top:6px">' +
    ["claude", "openai", "groq", "openrouter"].map(function (p) { return '<a class="tag" style="text-decoration:none" href="' + PROV[p].key + '" target="_blank" rel="noopener">' + PROV[p].n + " ↗</a>"; }).join("") + "</div></details>";
}
function ust() {
  var ks = keyed(), h = "<h3>🧭 Mentor AI</h3>";
  if (ks.length) {
    h += '<div class="card">' + ks.map(function (p, i) { var c = cfg(p); return '<div class="row"><div class="nm"><b>✅ ' + PROV[p].n + "</b>" + (i === 0 ? ' <span class="badge">główny</span>' : ' <span class="badge">zapasowy</span>') + "<small>" + PROV[p].note.split(".")[0] + "." + (c.ok ? " Ostatnio działał model: " + esc(c.ok) + "." : "") + '</small></div><button class="sec sm dng" data-a="kdel" data-id="' + p + '">Usuń</button></div>'; }).join("") +
      '<div class="note" style="margin-top:6px">Model wybiera się sam. Gdy jeden jest przeciążony, aplikacja od razu używa następnego' + (ks.length > 1 ? ", a w razie potrzeby drugiego dostawcy" : "") + ". Przepisywanie nagrań: " + (hasVoice() ? "✅ działa" : "potrzebny klucz Gemini, Groq lub OpenAI") + ".</div></div>";
    h += '<details class="card"><summary>➕ Dodaj zapasowy klucz (opcjonalnie)</summary><div style="margin-top:8px">' + keyBox(false).replace('<div class="card">', "<div>") + "</div></details>";
    h += keyHelp(false);
  } else { h += keyBox(true) + keyHelp(true); }
  h += '<h3>Charakter mentora</h3><div class="card">' + Object.keys(TONES).map(function (t) { return '<label class="sw"><input type="radio" name="tone" data-f="tone" value="' + t + '"' + (S.set.tone === t ? " checked" : "") + "> " + TONES[t][0] + "</label>"; }).join("");
  h += '<label class="note">O mnie – co mentor powinien wiedzieć (cele, wartości, sytuacja)</label><div class="tw"><textarea id="about" data-f="about" placeholder="np. Pracuję przy biurku, chcę wzmocnić plecy, nauczyć się hiszpańskiego i rozwijać duchowo. Ważna jest dla mnie rodzina. Lubię konkretne rady.">' + esc(S.set.about) + "</textarea>" + micBtn("about") + "</div>";
  var tv = plVoices(), tm = S.set.tts.mode;
  h += '<div style="margin-top:12px"><b style="font-size:14px">🔊 Czytanie odpowiedzi na głos</b>' + [["voice", "Gdy pytam głosem (🎤)"], ["always", "Zawsze"], ["never", "Nigdy"]].map(function (x) { return '<label class="sw"><input type="radio" name="ttsm" data-f="ttsm" value="' + x[0] + '"' + (tm === x[0] ? " checked" : "") + "> " + x[1] + "</label>"; }).join("") +
    (!ttsOK() ? '<div class="note">Ta przeglądarka nie potrafi czytać na głos.</div>' :
      (tv.length ? '<label class="note">Głos</label><select data-f="ttsv"><option value="">Automatycznie (żeński, jeśli jest)</option>' + tv.map(function (v) { return '<option value="' + esc(v.voiceURI || v.name) + '"' + (S.set.tts.voice === (v.voiceURI || v.name) ? " selected" : "") + ">" + esc(v.name) + "</option>"; }).join("") + "</select>"
        : '<div class="note">Nie widzę polskiego głosu. Na Androidzie: Ustawienia telefonu → Zamiana tekstu na mowę → Usługi mowy Google → zainstaluj język polski.</div>') +
      '<label class="note">Tempo</label><select data-f="ttsr">' + [["0.85", "Wolniej"], ["1", "Normalnie"], ["1.15", "Szybciej"], ["1.3", "Szybko"]].map(function (x) { return '<option value="' + x[0] + '"' + (String(S.set.tts.rate) === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select>" +
      '<div class="btns" style="margin-top:8px"><button class="sec sm" data-a="ttstest">▶️ Posłuchaj</button></div>') + "</div>";
  h += '<details style="margin-top:10px"><summary class="note">🔐 Prywatność – co mentor może widzieć</summary>' + [["h", "Nawyki i serie"], ["d", "Pamiętnik i odpowiedzi"], ["t", "Jedzenie, płyny, kroki i waga"], ["f", "Post przerywany"], ["p", "Pomysły i projekty"]].filter(function (x) { return x[0] === "f" ? on("fast") : x[0] === "p" ? on("proj") : true; }).map(function (x) { return '<label class="sw"><input type="checkbox" data-f="share" value="' + x[0] + '"' + (S.set.share[x[0]] ? " checked" : "") + "> " + x[1] + "</label>"; }).join("") + '<div class="note">Dane wysyłane są do dostawcy AI tylko, gdy korzystasz z mentora.</div></details></div>';
  h += '<h3>🔒 Blokada hasłem</h3><div class="card">' + (LK ? '<div class="note" style="margin-bottom:8px">✅ Aplikacja jest chroniona hasłem. Blokuje się przy uruchomieniu i po 1 minucie w tle.</div><div class="btns"><button class="sec" data-a="lockset">Zmień hasło</button><button class="sec" data-a="locknow">🔒 Zablokuj teraz</button><button class="sec dng" data-a="lockoff">Wyłącz blokadę</button></div>' :
    '<div class="note" style="margin-bottom:8px">Ustaw hasło lub PIN – nikt nie zajrzy do Twojego pamiętnika, gdy weźmie telefon.</div><button class="pri" data-a="lockset">🔒 Ustaw hasło</button>') + "</div>";
  var nok = "Notification" in window, npm = nok ? Notification.permission : "unsupported";
  h += '<h3>🔔 Przypomnienia</h3><div class="card">' + (nok && npm === "default" ? '<button class="pri" data-a="perm" style="margin-bottom:8px">🔔 Włącz powiadomienia</button>' : "") +
    (!nok ? '<div class="note">Ta przeglądarka nie obsługuje powiadomień.</div>' : npm === "denied" ? '<div class="note">Powiadomienia są zablokowane w ustawieniach przeglądarki.</div>' : "") +
    '<label class="sw"><input type="checkbox" data-f="evOn"' + (S.set.ev.on ? " checked" : "") + '> 🌆 Wieczorny bilans – ile zostało kalorii, czego brakuje, które serie chronić</label><div class="btns"><span class="note">Godzina:</span><input type="time" data-f="evT" value="' + esc(S.set.ev.t) + '"></div>' +
    '<label class="sw" style="margin-top:8px"><input type="checkbox" data-f="spOn"' + (S.set.sp.on ? " checked" : "") + '> 🔥 Ochrona serii – gdy nawyk z serią 3+ dni nie jest jeszcze dziś zaliczony</label><div class="btns"><span class="note">Godzina:</span><input type="time" data-f="spT" value="' + esc(S.set.sp.t) + '"></div>' +
    '<label class="sw" style="margin-top:8px"><input type="checkbox" data-f="drOn"' + (S.set.drOn ? " checked" : "") + '> 📔 Pamiętnik – gdy tego dnia nic jeszcze nie zapisałeś</label><div class="btns"><span class="note">Godzina:</span><input type="time" data-f="dr" value="' + esc(S.set.dr) + '"></div>' +
    '<div class="btns" style="margin-top:10px">' + (nok && npm === "granted" ? '<button class="sec sm" data-a="ntest">Testuj powiadomienie</button>' : "") + '<button class="sec sm" data-a="ics">📅 Dodaj do kalendarza (.ics)</button></div>' +
    '<div class="note" style="margin-top:6px">Powiadomienia z aplikacji przychodzą, gdy jest otwarta lub działa w tle. Najpewniejsze są przypomnienia w kalendarzu telefonu: plik .ics doda codzienne przypomnienia (bilans, serie, pamiętnik i nawyki z godziną), a po ich dotknięciu otworzysz aplikację i zobaczysz bilans. Godzinę przypomnienia nawyku ustawisz w Dziś → ✏️ Edytuj nawyki.</div></div>';
  h += '<h3>🧩 Moduły</h3><div class="card">' + [["fast", "🌙 Post przerywany"], ["ryt", "⏰ Rytm dnia"], ["proj", "💡 Pomysły i projekty"]].map(function (x) { return '<label class="sw"><input type="checkbox" data-f="mod" value="' + x[0] + '"' + (on(x[0]) ? " checked" : "") + "> " + x[1] + "</label>"; }).join("") + '<div class="note">Wyłączone moduły znikają z menu Więcej i z rozmów z mentorem. Ich dane zostają – po włączeniu wszystko wróci.</div></div>';
  h += '<h3>Wygląd</h3><div class="card"><select data-f="theme"><option value="auto"' + (S.set.theme === "auto" ? " selected" : "") + '>Motyw systemowy</option><option value="light"' + (S.set.theme === "light" ? " selected" : "") + '>Jasny</option><option value="dark"' + (S.set.theme === "dark" ? " selected" : "") + ">Ciemny</option></select></div>";
  return h;
}
/* ---------- BLOKADA HASŁEM ---------- */
var LOCKK = "nawyki-v3-blokada", LK = null, locked = false, hiddenAt = 0, lfail = 0, lwait = 0;
try { LK = JSON.parse(localStorage.getItem(LOCKK) || "null"); } catch (e) {}
locked = !!LK;
function hashPw(pw, salt) {
  if (!window.crypto || !crypto.subtle) return Promise.reject(new Error("Blokada wymaga bezpiecznego adresu (https)."));
  var te = new TextEncoder();
  return crypto.subtle.importKey("raw", te.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (k) { return crypto.subtle.deriveBits({ name: "PBKDF2", salt: te.encode(salt), iterations: 150000, hash: "SHA-256" }, k, 256); })
    .then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return (x < 16 ? "0" : "") + x.toString(16); }).join(""); });
}
function showLock() {
  var el = $("lock"); if (!el) return;
  el.innerHTML = '<div class="lockscr"><div class="lk"><img src="icon-192.png" alt="" width="72" height="72" style="border-radius:16px"><h2>Nawyki i Talerz</h2><div class="note" style="margin-bottom:12px">Podaj hasło, aby otworzyć</div>' +
    '<input id="lpw" type="password" autocomplete="current-password" placeholder="Hasło lub PIN" style="text-align:center;font-size:18px"><button class="pri" data-a="unlock" style="width:100%;margin-top:10px;padding:13px">Odblokuj</button><div class="note" id="lerr" style="min-height:18px;margin-top:8px;color:var(--red)"></div>' +
    (LK.hint ? '<div class="note">Podpowiedź: ' + esc(LK.hint) + "</div>" : "") + '<button class="lnk" data-a="lforgot" style="margin-top:14px">Nie pamiętam hasła</button></div></div>';
  setTimeout(function () { var i = $("lpw"); if (i) i.focus(); }, 80);
}
function tryUnlock() {
  var i = $("lpw"), er = $("lerr"); if (!i) return;
  if (Date.now() < lwait) { er.textContent = "Za dużo prób. Poczekaj " + Math.ceil((lwait - Date.now()) / 1000) + " s."; return; }
  hashPw(i.value, LK.s).then(function (h) {
    if (h === LK.h) { locked = false; lfail = 0; $("lock").innerHTML = ""; render(); }
    else { lfail++; i.value = ""; if (lfail >= 5) { lwait = Date.now() + 30000; lfail = 0; er.textContent = "Za dużo prób. Poczekaj 30 s."; } else er.textContent = "Błędne hasło."; }
  }).catch(function (e) { er.textContent = e.message; });
}
function lockSheet() {
  openSheet(LK ? "Zmień hasło" : "Ustaw hasło", (LK ? '<label class="note">Obecne hasło</label><input id="lp0" type="password" autocomplete="current-password">' : "") +
    '<label class="note">Nowe hasło lub PIN (min. 4 znaki)</label><input id="lp1" type="password" autocomplete="new-password"><label class="note">Powtórz hasło</label><input id="lp2" type="password" autocomplete="new-password">' +
    '<label class="note">Podpowiedź (opcjonalnie, widoczna na ekranie blokady)</label><input id="lph" placeholder="np. data ślubu" value="' + esc(LK && LK.hint || "") + '">' +
    '<div class="card wn" style="margin-top:10px;font-size:13px">⚠️ Hasła nie da się odzyskać. Jeśli je zapomnisz, trzeba będzie wyczyścić dane i wczytać kopię zapasową – dlatego rób kopie (Więcej → Kopie i dane).</div><button class="pri" data-a="locksave" style="width:100%">💾 Zapisz hasło</button>');
}
function checkOld() { if (!LK) return Promise.resolve(true); var o = $("lp0"); return hashPw(o ? o.value : "", LK.s).then(function (h) { return h === LK.h; }); }
function dane() {
  var h = '<div class="card"><b>💾 Kopia zapasowa</b><div class="note" style="margin:4px 0 10px">Kopia obejmuje nawyki, pamiętnik, cele, projekty oraz dane Jedzenia. ' + (S.bk ? "Ostatnia kopia: " + new Date(S.bk).toLocaleString("pl-PL") : "Nie masz jeszcze kopii w tej wersji.") + ' Zapisz plik w bezpiecznym miejscu (Dysk Google, e-mail do siebie).</div><div class="btns"><button class="pri" data-a="jx">💾 Kopia (bez zdjęć)</button><button class="sec" data-a="jxf">📦 Pełna kopia ze zdjęciami i nagraniami</button></div></div>';
  h += '<div class="card"><b>📥 Wczytaj kopię</b><div class="note" style="margin:4px 0 10px">Działa z kopiami Nawyków (wersje 2, 3 i 4). Kopia z wersji 4 zawiera też dane Jedzenia (profil, posiłki, płyny, waga). Kopię samego Talerza wczytasz w Jedzenie → Profil. Wczytanie zastępuje obecne dane – przed tym aplikacja sama zapisuje kopię bieżącego stanu.</div><button class="sec" data-a="imp">📥 Wybierz plik kopii</button>' + (localStorage.getItem(KEY + "-przed-importem") ? '<button class="lnk" data-a="undoimp" style="margin-left:8px">Cofnij ostatni import</button>' : "") + "</div>";
  h += '<div class="card"><b>📦 Pamięć</b><div class="note" id="stor">Sprawdzam…</div></div>';
  h += '<div class="card"><b>⚠️ Strefa ostrożności</b><div class="note" style="margin:4px 0 10px">Usuwa punkty, notatki, pamiętnik, zdjęcia, posty, projekty i rozmowy. Nawyki, ćwiczenia, rytm dnia i hasła zostają.</div><button class="sec dng" data-a="reset">Wyczyść wszystkie postępy</button></div>';
  setTimeout(function () { var e = $("stor"); if (!e) return; var t = "Wpisów pamiętnika: " + S.j.length + " · dni z ocenami: " + Object.keys(S.l).length + " · projektów: " + S.pj.length + ". ";
    if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (x) { navigator.storage.persisted ? navigator.storage.persisted().then(function (p) { e.textContent = t + "Zajęte: " + (x.usage / 1048576).toFixed(1) + " MB. " + (p ? "Pamięć trwała włączona ✅ (przeglądarka nie usunie danych sama)." : "Pamięć nie jest oznaczona jako trwała – rób regularnie kopie."); }) : (e.textContent = t); }); else e.textContent = t; }, 50);
  return h;
}
function fullBackup() {
  toast("Przygotowuję pełną kopię…");
  var ids = []; S.j.forEach(function (e) { (e.media || []).forEach(function (m) { ids.push(m.id); }); });
  Promise.all(ids.map(function (id) { return MDB.get(id).then(function (b) { return b ? b2b64(b).then(function (x) { return [id, b.type, x]; }) : null; }); })).then(function (arr) {
    var o = JSON.parse(JSON.stringify(S)); o.media = arr.filter(Boolean); o.talerz = tzDump();
    S.bk = Date.now(); sv(); dl("nawyki-talerz-pelna-kopia-" + key(new Date()) + ".json", JSON.stringify(o), "application/json"); render();
  });
}
/* dane Jedzenia do kopii: profil i dni (bez kluczy API i dziennika AI) */
function tzDump() { var o = {}; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (/^talerz:(profile|day-|look|theme)/.test(k)) o[k.slice(7)] = localStorage.getItem(k); } } catch (e) {} return o; }
function tzRestore(o) { try { Object.keys(o).forEach(function (k) { if (/^(profile|day-\d{4}-\d\d-\d\d|look|theme)$/.test(k) && typeof o[k] === "string") localStorage.setItem("talerz:" + k, o[k]); }); } catch (e) { toast("⚠️ Nie udało się wczytać danych Jedzenia (brak miejsca)."); } tzReset(); }
function doImport(file) {
  var fr = new FileReader();
  fr.onload = function () {
    var p; try { p = JSON.parse(fr.result); if (!p || typeof p.l !== "object") throw 0; } catch (e) { toast("To nie jest poprawna kopia z aplikacji Nawyki."); return; }
    var nd = Object.keys(p.l).length, nn = Object.keys(p.n || {}).length;
    if (!confirm("Wczytać kopię? Zawiera " + nd + " dni z ocenami i " + nn + " notatek" + (p.j ? ", " + p.j.length + " wpisów pamiętnika" : "") + ".\nObecne dane zostaną zastąpione (zapiszę ich kopię).")) return;
    try { localStorage.setItem(KEY + "-przed-importem", JSON.stringify(S)); } catch (e) {}
    var media = p.media || []; delete p.media;
    if (p.talerz) { tzRestore(p.talerz); delete p.talerz; }
    Promise.all(media.map(function (m) { var bin = atob(m[2]), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return MDB.put(m[0], new Blob([u], { type: m[1] })); })).then(function () {
      p = migrate(p); p.set.welc = 1; localStorage.setItem(KEY, JSON.stringify(p)); location.reload();
    });
  };
  fr.readAsText(file);
}

/* ---------- render ---------- */
function render() {
  if (locked && LK) { $("v").innerHTML = ""; $("tabs").innerHTML = ""; tzShow(false); closeSheet(true); showLock(); return; }
  document.documentElement.setAttribute("data-theme", S.set.theme === "auto" ? "" : S.set.theme);
  tzShow(tab === "jedz");
  document.body.classList.toggle("mton", tab === "ment");
  var n = new Date(), hr = n.getHours(), sub = SUBS[tab];
  $("gr").textContent = sub ? sub : tab === "pam" ? "📔 Pamiętnik" : tab === "post" ? "📈 Postęp" : tab === "ment" ? "🧭 Mentor" : tab === "jedz" ? "🍽️ Jedzenie" : tab === "wiecej" ? "Więcej" : hr < 12 ? "Dzień dobry!" : hr < 18 ? "Miłego dnia!" : "Dobry wieczór!";
  $("dt").innerHTML = sub ? '<button class="lnk" data-a="tab" data-id="wiecej" style="font-size:13px;padding:0">‹ Więcej</button>' : n.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }) + " · 🔥 " + streak() + " · 📔 " + dStreak();
  var nt = sub ? "wiecej" : tab;
  $("tabs").innerHTML = TABS.map(function (t) { return '<button class="' + (nt === t[0] ? "on" : "") + '" data-a="tab" data-id="' + t[0] + '"><i>' + t[1] + "</i>" + t[2] + "</button>"; }).join("");
  var V = { jedz: function () { return ""; }, dzis: dzis, pam: pam, post: post, ment: ment, wiecej: wiecej, proj: proj, cele: cele, roz: roz, ryt: ryt, fast: fast, rap: rap, ust: ust, dane: dane };
  $("v").innerHTML = (V[tab] || dzis)();
  var bb = $("back"); if (bb) bb.hidden = !(navD > 0);
  addMics($("v"));
  hydrate();
}
function tick() {
  var fa = $("fa"), ac = actF(); if (fa && ac) fa.textContent = hmd(Date.now() - ac.s);
  if (!P || !P.run) return; P.t--;
  if (P.t <= 0) { P.t = 0; P.run = false; beep(); try { navigator.vibrate && navigator.vibrate(300); } catch (e) {} render(); return; }
  var t = $("tm"); if (t) t.textContent = P.t + " s";
}
function fin() { var k = key(new Date()); S.ro[k] = S.ro[k] || {}; S.ro[k][P.m] = 1; var n = (S.ro[k].s ? 1 : 0) + (S.ro[k].t ? 1 : 0); S.l[k] = S.l[k] || {}; S.l[k].w2 = Math.max(S.l[k].w2 || 0, n > 1 ? 3 : 2); sv(); P = null; edx = false; render(); }
var AC = null;
function snd() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); } catch (e) {} }
function beep() { try { snd(); if (!AC) return; [0, .3, .6].forEach(function (d, i) { var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + d; o.type = "sine"; o.frequency.value = i === 2 ? 1175 : 880; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.4, t + .02); g.gain.linearRampToValueAtTime(0, t + .22); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + .25); }); } catch (e) {} }
function setLv(id) { var k = key(ago(off)), a = autoLv(k, id), nv = (lvl(k, id) + 1) % 4; S.l[k] = S.l[k] || {}; S.l[k][id] = nv; sv(); if (a > nv) toast("⚡ " + LV[a] + " – zaliczone automatycznie z Jedzenia", 2600); var y = window.scrollY; render(); window.scrollTo(0, y); }
/* nawigacja: historia zakładek (przycisk ‹ w nagłówku i systemowy „wstecz” w telefonie) */
var navD = 0, scrollMem = {};
try { history.replaceState({ nawTab: tab, d: 0 }, ""); } catch (e) {}
function go(t) {
  tzReset();
  if (t !== tab) { scrollMem[navD] = window.scrollY; navD++; try { history.pushState({ nawTab: t, d: navD }, ""); } catch (e) {} }
  tab = t; P = P && t === "roz" ? P : null; render(); window.scrollTo(0, 0);
}
function goBack() { if (navD > 0) history.back(); }
window.addEventListener("popstate", function (ev) {
  var st = ev.state; if (!st || !st.nawTab) return;
  if ($("sheet").innerHTML) { closeSheet(); try { history.pushState({ nawTab: tab, d: navD }, ""); } catch (e) {} return; }
  if (tab === "jedz" && TZF && TZF.contentWindow && !tzBackSkip) { try { history.pushState({ nawTab: tab, d: navD }, ""); } catch (e) {} tzBackWait = 1; TZF.contentWindow.postMessage({ tz: "back" }, location.origin); setTimeout(function () { tzBackDone(false); }, 500); return; }
  tzBackSkip = false;
  if (locked && LK) { try { history.pushState({ nawTab: tab, d: navD }, ""); } catch (e) {} return; }
  stopDict(); tab = st.nawTab; navD = st.d || 0; P = P && tab === "roz" ? P : null; render();
  var y = scrollMem[navD] || 0; window.scrollTo(0, y);
});

/* ---------- zakładka Jedzenie (Talerz w ramce, ładowany raz i zachowywany) ---------- */
var TZF = null, tzPend = null, tzBackWait = null, tzBackSkip = false;
function tzShow(on) {
  document.body.classList.toggle("tzon", on);
  var w = $("tzwrap");
  if (on && !TZF) { TZF = document.createElement("iframe"); TZF.title = "Jedzenie"; TZF.src = "talerz.html" + (tzPend && /^(posilek|woda)$/.test(tzPend) ? "?akcja=" + tzPend : ""); if (tzPend && /^(posilek|woda)$/.test(tzPend)) tzPend = null; TZF.addEventListener("load", function () { tzTheme(); if (tzPend) { tzSend(tzPend); tzPend = null; } }); w.appendChild(TZF); }
  w.hidden = !on;
}
function tzSend(a) {
  if (!TZF || !TZF.contentWindow) { tzPend = a; return; }
  var m = a === "historia" ? { tz: "tab", tab: "history" } : a === "profil" ? { tz: "tab", tab: "profile" } : { tz: a };
  TZF.contentWindow.postMessage(m, location.origin);
}
/* systemowe „wstecz” na zakładce Jedzenie: najpierw zamyka okno w Talerzu, potem wraca do poprzedniej zakładki */
function tzBackDone(closed) { if (!tzBackWait) return; tzBackWait = null; if (!closed) { tzBackSkip = true; history.back(); } }
function tzGo(a) { closeSheet(true); if (TZF) { go("jedz"); tzSend(a); } else { tzPend = a; go("jedz"); } }
function tzTheme() { try { localStorage.setItem("talerz:theme", S.set.theme || "auto"); } catch (e) {} if (TZF && TZF.contentWindow) TZF.contentWindow.postMessage({ tz: "theme", v: S.set.theme || "auto" }, location.origin); }
function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $("v").contains(a); }
function tzChanged() { tzReset(); if (tab !== "jedz" && !typing() && !$("sheet").innerHTML) { var y = window.scrollY; render(); window.scrollTo(0, y); } }
window.addEventListener("message", function (ev) {
  if (ev.origin !== location.origin || !ev.data) return;
  if (ev.data.tzChanged) { tzReset(); syncKeys(); }
  if ("tzBack" in ev.data) tzBackDone(ev.data.tzBack);
});
window.addEventListener("storage", function (ev) { if (!ev.key || ev.key.indexOf("talerz:") === 0) { if (ev.key === "talerz:ai-config") syncKeys(); else tzChanged(); } else if (ev.key === KEY && ev.newValue) { /* inna karta zmieniła dane nawyków */ } });

/* ---------- wspólne klucze AI: Nawyki ⇄ Jedzenie (Gemini i Claude) ---------- */
function syncKeys() {
  var c; try { c = JSON.parse(localStorage.getItem("talerz:ai-config") || "{}"); } catch (e) { c = {}; }
  c.keys = c.keys || {}; var chT = false, chN = false, dead = S.set.kdead || [];
  ["gemini", "claude"].forEach(function (p) {
    var arr = c.keys[p] = c.keys[p] || [], mine = cfg(p).k;
    if (mine && !arr.some(function (x) { return x.key === mine; })) { arr.push({ id: uid("n").slice(0, 9), key: mine, label: "z Nawyków" }); chT = true; }
    if (!mine) { var cand = arr.filter(function (x) { return x.state !== "invalid" && dead.indexOf(x.key) < 0; })[0]; if (cand) { K[p] = { k: cand.key }; chN = true; } }
  });
  if (chT) try { localStorage.setItem("talerz:ai-config", JSON.stringify(c)); } catch (e) {}
  if (chN) { svK(); if (!S.set.lastP || !cfg(S.set.lastP).k) { S.set.lastP = keyed()[0] || ""; sv(); } }
  return chN;
}

/* ---------- zdarzenia ---------- */
document.addEventListener("click", function (ev) {
  var t = ev.target.closest("[data-a]"); if (!t) return;
  var a = t.getAttribute("data-a"), id = t.getAttribute("data-id"), y;
  if (a === "ovl") { if (ev.target === t) closeSheet(); return; }
  switch (a) {
    case "tab": closeSheet(true); go(id); break;
    case "back": closeSheet(true); goBack(); break;
    case "pd": off++; render(); break;
    case "nd": if (off > 0) off--; render(); break;
    case "today": off = 0; render(); break;
    case "goday": off = +id; ed = false; go("dzis"); break;
    case "lv": setLv(id); break;
    case "ed": ed = !ed; render(); break;
    case "add": H.push(["u" + Date.now(), id, "Nowy nawyk", "", "", "", "", ""]); sv(); render(); break;
    case "rm": if (confirm("Usunąć ten nawyk? Jego dotychczasowe zaznaczenia przestaną się liczyć w punktach.")) { for (var q = 0; q < H.length; q++) if (H[q][0] === id) { H.splice(q, 1); break; } sv(); render(); } break;
    case "up": case "dn": { var ix = H.findIndex(function (z) { return z[0] === id; }), st = a === "up" ? -1 : 1, j2 = ix + st; while (ix >= 0 && j2 >= 0 && j2 < H.length && H[j2][1] !== H[ix][1]) j2 += st; if (ix >= 0 && j2 >= 0 && j2 < H.length) { var tmp = H[ix]; H[ix] = H[j2]; H[j2] = tmp; sv(); render(); } break; }
    case "hnote": { var k = key(ago(off)), hh = H.find(function (z) { return z[0] === id; }), v = (S.hn[k] || {})[id] || "";
      openSheet("💬 " + esc(hh[2]), '<div class="note" style="margin-bottom:6px">' + dlong(k) + ' · seria: ' + hStreak(id) + ' dni, najdłużej ' + bestF(function (kk) { return lvl(kk, id) > 0; }) + '</div><div class="tw"><textarea id="hnt" placeholder="Co pomogło? Co przeszkodziło? Jak się czułem?">' + esc(v) + "</textarea>" + micBtn("hnt") + '</div><div class="btns" style="margin-top:10px"><button class="pri" data-a="hnsave" data-id="' + id + '" data-k="' + k + '">💾 Zapisz</button></div>'); break; }
    case "hnsave": { var k2 = t.getAttribute("data-k"), tx = $("hnt").value.trim(); S.hn[k2] = S.hn[k2] || {}; if (tx) S.hn[k2][id] = tx; else delete S.hn[k2][id]; sv(); closeSheet(true); render(); break; }
    case "welc": S.set.welc = 1; sv(); render(); break;
    case "v4ok": S.set.v4ok = 1; sv(); render(); break;
    case "tzgo": tzGo(id); break;
    case "tmrw": doTmrw(); break;
    case "think": doThink(t.getAttribute("data-k") || key(new Date())); break;
    case "wgset": wgSheet(); break;
    case "wgpick": S.wg = { wk: monKey(), g: id, n: (S.wg && S.wg.n) || 5 }; sv(); wgSheet(); break;
    case "wgn": if (!S.wg) { toast("Najpierw wybierz cel."); break; } S.wg.n = +id; sv(); wgSheet(); break;
    case "wgoff": S.wg = null; sv(); closeSheet(); break;
    case "migok": S.set.migOk = 1; sv(); render(); break;
    case "bklater": S.bk = Date.now() - 4 * 864e5; sv(); render(); break;
    case "mic": dictate(t.getAttribute("data-t"), t); break;
    case "fab": openSheet("Szybki wpis", '<div class="menu">' + [["meal", "🍽️", "Posiłek"], ["water", "💧", "Woda"], ["note", "📝", "Notatka"], ["rec", "🎙️", "Nagranie"], ["cam", "📷", "Zdjęcie"], ["idea", "💡", "Pomysł"], ["q", "❓", "Pytanie"], ["grat", "🙏", "Wdzięczność"]].filter(function (x) { return x[0] !== "idea" || on("proj"); }).map(function (x) { return '<div class="tile" data-a="fabgo" data-id="' + x[0] + '"><i>' + x[1] + "</i>" + x[2] + "</div>"; }).join("") + '</div><div class="note" style="margin-top:10px">Posiłek i woda trafiają do Jedzenia, reszta do pamiętnika.</div>'); break;
    case "fabgo": closeSheet(true);
      if (id === "meal" || id === "water") { tzGo(id === "meal" ? "posilek" : "woda"); break; }
      if (id === "idea") { CP = { id: uid("p"), name: "", status: "idea", desc: "", steps: [], ts: Date.now(), up: Date.now() }; pjSheet(); setTimeout(function () { var e = $("pjn"); if (e) e.focus(); }, 60); }
      else openEntry({ id: uid("e"), d: key(ago(tab === "dzis" ? off : 0)), t: Date.now(), ty: id === "rec" || id === "cam" ? "note" : id, text: "", media: [] }, true, id === "rec" || id === "cam" ? id : null);
      break;
    case "newe": { var dk = t.getAttribute("data-k") || key(ago(tab === "dzis" ? off : 0)), now = new Date(), tt = k2d(dk); tt.setHours(now.getHours(), now.getMinutes()); openEntry({ id: uid("e"), d: dk, t: tt.getTime(), ty: t.getAttribute("data-ty") || "note", text: "", media: [] }, true, t.getAttribute("data-m")); break; }
    case "edite": { var e = S.j.find(function (x) { return x.id === id; }); if (e) openEntry(e, false); break; }
    case "ety": readForm(); CE.e.ty = id; showEntry(); break;
    case "esave": saveEntry(); break;
    case "edel": if (confirm("Usunąć ten wpis razem ze zdjęciami i nagraniami?")) { var ee = S.j.find(function (x) { return x.id === CE.e.id; }); if (ee) (ee.media || []).forEach(function (m) { MDB.del(m.id); }); S.j = S.j.filter(function (x) { return x.id !== CE.e.id; }); sv(); closeSheet(); render(); } break;
    case "addpic": readForm(); $(t.getAttribute("data-m")).click(); break;
    case "rec": readForm(); if (REC) stopRec(false); else startRec(); break;
    case "mrm": readForm(); CE.e.media = CE.e.media.filter(function (m) { return m.id !== id; }); showEntry(); break;
    case "trans": readForm(); if (!hasVoice()) { toast("Dodaj klucz Gemini, Groq lub OpenAI w Ustawieniach, aby przepisywać nagrania."); break; } transcribeMedia(id); break;
    case "aipic": if (!hasAI()) { toast("Dodaj klucz API w Ustawieniach."); break; } aiPic(); break;
    case "full": if (t.src) { var f = document.createElement("div"); f.className = "full"; f.innerHTML = '<img src="' + t.src + '">'; f.onclick = function () { f.remove(); }; document.body.appendChild(f); } break;
    case "shx": closeSheet(); break;
    case "ptag": ptag = ptag === id ? "" : id; plim = 20; render(); break;
    case "pmore": plim += 20; $("plist").innerHTML = pamList(); hydrate(); break;
    case "pexp": pexp[t.getAttribute("data-k")] = 1; $("plist").innerHTML = pamList(); hydrate(); break;
    case "mq": if (!hasAI()) { go("ust"); toast("Najpierw dodaj klucz API."); break; } doMQ(t.getAttribute("data-k")); break;
    case "rev": if (!hasAI()) { go("ust"); toast("Najpierw dodaj klucz API."); break; } doReview(); break;
    case "chats": { var ci = $("chatin"); if (ci && ci.value.trim()) { var v2 = ci.value, vv = CHATV; stopDict(); if (S.set.tts.mode === "always" || (S.set.tts.mode === "voice" && vv)) ttsUnlock(); chatSend(v2, { v: vv }); } break; }
    case "chatretry": chatAsk(); break;
    case "say": { var si = +t.getAttribute("data-i"), sm = S.mt[si]; if (TTS.on && TTS.i === si) ttsStop(); else if (sm) { ttsUnlock(); speak(sm.t, si); } break; }
    case "copym": { var cm = S.mt[+t.getAttribute("data-i")]; if (cm) { try { navigator.clipboard.writeText(cm.t).then(function () { toast("📋 Skopiowano"); }, function () { toast("Nie udało się skopiować."); }); } catch (e) { toast("Nie udało się skopiować."); } } break; }
    case "ttsstop": ttsStop(); break;
    case "ttstest": ttsUnlock(); speak("Cześć! Tak będę czytać odpowiedzi mentora. Możesz zmienić głos i tempo.", -1); break;
    case "chatq": chatSend(id); break;
    case "chatclr": if (confirm("Usunąć całą historię rozmów z mentorem (także archiwum)?")) { S.mt = []; sv(); render(); } break;
    case "fcadd": { var fi = $("fcn"); if (fi && fi.value.trim()) { S.fc.push({ id: uid("f"), t: fi.value.trim(), ts: Date.now(), done: 0 }); sv(); render(); } break; }
    case "fcsug": { var s = lastRev && lastRev[+t.getAttribute("data-i")]; if (s) { S.fc.push({ id: uid("f"), t: s, ts: Date.now(), done: 0 }); sv(); render(); toast("Dodano do „Do pracy” – zobaczysz to na ekranie Dziś"); } break; }
    case "fcdone": { var fc = S.fc.find(function (x) { return x.id === id; }); if (fc) { fc.done = 1; fc.dt = Date.now(); sv(); y = window.scrollY; render(); window.scrollTo(0, y); toast("Brawo! 🎉"); } break; }
    case "fcrm": S.fc = S.fc.filter(function (x) { return x.id !== id; }); sv(); render(); break;
    case "nsdone": { var pj = S.pj.find(function (x) { return x.id === id; }), sid = t.getAttribute("data-s"); if (pj) { var stp = pj.steps.find(function (x) { return x.id === sid; }); if (stp) stp.done = 1; if (pj.steps.every(function (x) { return x.done; })) { pj.status = "done"; toast("🎉 Projekt ukończony!"); } pj.up = Date.now(); sv(); y = window.scrollY; render(); window.scrollTo(0, y); } break; }
    /* projekty */
    case "pjnew": CP = { id: uid("p"), name: "", status: "idea", desc: "", steps: [], ts: Date.now(), up: Date.now() }; pjSheet(); break;
    case "pj": CP = JSON.parse(JSON.stringify(S.pj.find(function (x) { return x.id === id; }))); pjSheet(); break;
    case "pview": pview = pview === "list" ? "kan" : "list"; render(); break;
    case "pfilt": pfilt = id; render(); break;
    case "pst": pjRead(); var si = CP.steps[+t.getAttribute("data-i")]; si.done = si.done ? 0 : 1; pjSheet(); break;
    case "psr": pjRead(); CP.steps.splice(+t.getAttribute("data-i"), 1); pjSheet(); break;
    case "psu": pjRead(); mv(CP.steps, +t.getAttribute("data-i"), -1); pjSheet(); break;
    case "psa": { pjRead(); var ns = $("pjns"); if (ns && ns.value.trim()) { CP.steps.push({ id: uid("s"), t: ns.value.trim(), done: 0 }); pjSheet(); var n2 = $("pjns"); if (n2) n2.focus(); } break; }
    case "pjai": if (!hasAI()) { toast("Dodaj klucz API w Ustawieniach."); break; } pjAI(t.getAttribute("data-m")); break;
    case "pjsave": pjSave(true); break;
    case "pjdel": if (confirm("Usunąć ten projekt?")) { S.pj = S.pj.filter(function (x) { return x.id !== CP.id; }); sv(); closeSheet(true); CP = null; render(); } break;
    /* cele */
    case "goal": goalSheet(id); break;
    case "gsave": { var gn = $("gn").value.trim(); if (!gn) { toast("Podaj nazwę celu."); break; } var g = S.g.find(function (x) { return x.id === id; }); if (!g) { g = { id: uid("g"), ts: Date.now() }; S.g.push(g); }
      g.name = gn; g.due = $("gd").value; g.pr = +$("gp").value; g.note = $("gno").value; g.hs = Array.prototype.map.call(document.querySelectorAll(".ghs:checked"), function (c) { return c.value; }); sv(); closeSheet(true); render(); break; }
    case "gdone": { var g2 = S.g.find(function (x) { return x.id === id; }); if (g2) { g2.done = g2.done ? 0 : 1; if (g2.done) { g2.pr = 100; toast("🎉 Gratulacje!"); } sv(); closeSheet(true); render(); } break; }
    case "gdel": if (confirm("Usunąć ten cel?")) { S.g = S.g.filter(function (x) { return x.id !== id; }); sv(); closeSheet(true); render(); } break;
    /* rozruch */
    case "go": { snd(); var gm = t.getAttribute("data-m"); if (S.ex[gm].length) { P = { m: gm, i: 0, t: dur(gm, 0), run: false, v: "A" }; render(); } break; }
    case "run": snd(); P.run = !P.run; if (P.t <= 0) P.t = dur(P.m, P.i); render(); break;
    case "var": P.v = P.v === "A" ? "B" : "A"; render(); break;
    case "nx": edx = false; P.i++; if (P.i >= S.ex[P.m].length) { fin(); break; } P.t = dur(P.m, P.i); render(); break;
    case "stop": P = null; edx = false; render(); break;
    case "xed": edx = !edx; render(); break;
    case "exe": edr = !edr; render(); break;
    case "exadd": S.ex[t.getAttribute("data-m")].push(["Nowe ćwiczenie", "", "", 30]); sv(); render(); break;
    case "exrm": if (confirm("Usunąć to ćwiczenie?")) { S.ex[t.getAttribute("data-m")].splice(+t.getAttribute("data-i"), 1); sv(); render(); } break;
    case "exup": case "exdn": mv(S.ex[t.getAttribute("data-m")], +t.getAttribute("data-i"), a === "exup" ? -1 : 1); sv(); render(); break;
    case "exall": { var em = t.getAttribute("data-m"), iv = $("all" + em); if (iv.value) { var ev2 = Math.max(5, Math.min(600, +iv.value || 0)); S.ex[em].forEach(function (e) { e[3] = ev2; }); sv(); render(); } break; }
    /* rytm */
    case "ryed": edy = !edy; render(); break;
    case "bell": S.ry.forEach(function (z) { if (z[0] === id) z[4] = z[4] ? 0 : 1; }); sv(); if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().then(render); else render(); break;
    case "ryadd": S.ry.push(["r" + Date.now(), "", "Nowy punkt", "", 0]); sv(); render(); break;
    case "ryrm": if (confirm("Usunąć ten punkt rytmu dnia?")) { S.ry = S.ry.filter(function (z) { return z[0] !== id; }); sv(); render(); } break;
    case "ryup": case "rydn": { var ri = S.ry.findIndex(function (z) { return z[0] === id; }); if (ri >= 0) { mv(S.ry, ri, a === "ryup" ? -1 : 1); sv(); render(); } break; }
    case "perm": Notification.requestPermission().then(render); break;
    case "ntest": notify("Nawyki i Talerz", "Powiadomienia działają ✅"); break;
    case "ics": ics(); break;
    /* post */
    case "fs": S.fs.push({ s: Date.now(), e: 0 }); sv(); render(); break;
    case "fe": { var c = actF(); if (c) c.e = Date.now(); sv(); render(); break; }
    case "fx": { var c2 = actF(); if (c2 && confirm("Anulować trwający post?")) { S.fs = S.fs.filter(function (f) { return f !== c2; }); sv(); render(); } break; }
    case "fadd": { var s1 = new Date($("f1").value).getTime(), e1 = new Date($("f2").value).getTime(); if (!(e1 > s1) || e1 - s1 > 72 * 36e5 || e1 > Date.now() + 6e4) { toast("Podaj poprawne godziny: pierwszy posiłek po ostatnim (maks. 72 h)."); break; } S.fs.push({ s: s1, e: e1 }); S.fs.sort(function (x, z) { return x.s - z.s; }); sv(); render(); break; }
    case "fdel": if (confirm("Usunąć ten wpis?")) { S.fs = S.fs.filter(function (f) { return f.s !== +id; }); sv(); render(); } break;
    /* raport i dane */
    case "rg": rg = +id; render(); break;
    case "pr": window.print(); break;
    case "rt": rt(); break;
    case "csv": csv(); break;
    case "jx": { S.bk = Date.now(); sv(); var oj = JSON.parse(JSON.stringify(S)); oj.talerz = tzDump(); dl("nawyki-talerz-kopia-" + key(new Date()) + ".json", JSON.stringify(oj), "application/json"); render(); break; }
    case "jxf": fullBackup(); break;
    case "imp": $("imp").click(); break;
    case "undoimp": if (confirm("Przywrócić stan sprzed ostatniego importu?")) { localStorage.setItem(KEY, localStorage.getItem(KEY + "-przed-importem")); localStorage.removeItem(KEY + "-przed-importem"); location.reload(); } break;
    case "reset": { var w = prompt("To usunie wszystkie postępy, pamiętnik, zdjęcia, projekty i rozmowy.\nZrób najpierw kopię!\n\nWpisz USUŃ, aby potwierdzić:"); if (w && w.trim().toUpperCase() === "USUŃ") { try { localStorage.setItem(KEY + "-przed-importem", JSON.stringify(S)); } catch (e) {} S.l = {}; S.ro = {}; S.n = {}; S.j = []; S.pa = {}; S.hn = {}; S.fs = []; S.pj = []; S.mt = []; S.rev = []; S.fc = []; sv(); MDB.keys().then(function (ks) { ks.forEach(function (x) { MDB.del(x); }); }); render(); toast("Wyczyszczono."); } break; }
    /* ustawienia AI */
    case "ksave": { var nk = $("newkey"); if (nk && nk.value.trim()) addKey(nk.value); else toast("Najpierw wklej klucz w pole."); break; }
    case "kpaste": if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(function (x) { if (!(x || "").trim()) { toast("Schowek jest pusty – skopiuj najpierw klucz."); return; } addKey(x); }).catch(function () { toast("Brak dostępu do schowka – przytrzymaj pole, wybierz Wklej i dotknij Zapisz.", 5000); var nk = $("newkey"); if (nk) nk.focus(); }); else { toast("Przytrzymaj pole, wybierz Wklej i dotknij Zapisz."); } break;
    case "kdel": if (confirm("Usunąć klucz " + PROV[id].n + " z tego telefonu?" + (id === "gemini" || id === "claude" ? "\n(Klucze używane w Jedzeniu zmienisz w Jedzenie → Profil → AI.)" : ""))) { S.set.kdead = (S.set.kdead || []).concat([cfg(id).k]).slice(-10); delete K[id]; svK(); if (S.set.lastP === id) { S.set.lastP = ""; sv(); } render(); } break;
    case "lockset": lockSheet(); break;
    case "locksave": { var p1 = $("lp1").value, p2 = $("lp2").value, hint = $("lph").value.trim();
      if (p1.length < 4) { toast("Hasło musi mieć co najmniej 4 znaki."); break; } if (p1 !== p2) { toast("Hasła się różnią."); break; }
      checkOld().then(function (ok) { if (!ok) { toast("Obecne hasło jest błędne."); return; } var salt = uid("s"); return hashPw(p1, salt).then(function (h) { LK = { s: salt, h: h, hint: hint }; localStorage.setItem(LOCKK, JSON.stringify(LK)); closeSheet(true); render(); toast("🔒 Hasło ustawione"); }); }).catch(function (e) { toast(e.message); }); break; }
    case "lockoff": openSheet("Wyłącz blokadę", '<label class="note">Podaj obecne hasło</label><input id="lp0" type="password" autocomplete="current-password"><button class="pri" data-a="lockoffok" style="width:100%;margin-top:10px">Wyłącz blokadę</button>'); break;
    case "lockoffok": checkOld().then(function (ok) { if (!ok) { toast("Błędne hasło."); return; } LK = null; localStorage.removeItem(LOCKK); closeSheet(true); render(); toast("Blokada wyłączona"); }); break;
    case "locknow": locked = true; closeSheet(true); render(); break;
    case "unlock": tryUnlock(); break;
    case "lforgot": $("lock").innerHTML = '<div class="lockscr"><div class="lk"><h2>Nie pamiętasz hasła?</h2><p style="font-size:14px">Hasła nie da się odzyskać – tak działa ochrona. Możesz wyczyścić aplikację (blokadę i wszystkie dane na tym telefonie), a potem wczytać swoją kopię zapasową.</p><label class="note">Wpisz USUŃ, aby potwierdzić</label><input id="lwc" style="text-align:center"><button class="sec dng" data-a="lwipe" style="width:100%;margin-top:10px">Wyczyść aplikację</button><button class="lnk" data-a="lback" style="margin-top:12px">‹ Wróć do wpisywania hasła</button></div></div>'; break;
    case "lback": showLock(); break;
    case "lwipe": { var wc = $("lwc"); if (!wc || wc.value.trim().toUpperCase() !== "USUŃ") { toast("Wpisz USUŃ, aby potwierdzić."); break; } [LOCKK, KEY, KEYS, KEY + "-przed-importem"].forEach(function (x) { localStorage.removeItem(x); }); try { indexedDB.deleteDatabase("nawyki-media"); } catch (e) {} location.reload(); break; }
  }
});
document.addEventListener("input", function (ev) {
  var t = ev.target, f = t.getAttribute("data-f");
  if (t.id === "pq") { pq = t.value; plim = 20; $("plist").innerHTML = pamList(); hydrate(); return; }
  if (f === "n") { var k = t.getAttribute("data-k"); if (t.value.trim()) S.n[k] = t.value; else delete S.n[k]; sv(); return; }
  if (f === "pa") { var k2 = t.getAttribute("data-k"), p = S.pa[k2] || { a: ["", "", ""] }; if (!p.q) p.q = dayQs(k2).slice(); p.a[+t.getAttribute("data-i")] = t.value; S.pa[k2] = p; sv(); return; }
  if (f === "about") { S.set.about = t.value; sv(); return; }
  if (f === "chatd") { chatDraft = t.value; if (!t.value.trim()) CHATV = false; return; }
  if (f === "exf" && t.getAttribute("data-j") === "4") { S.ex[t.getAttribute("data-m")][+t.getAttribute("data-i")][4] = t.value; sv(); return; }
  if (t.id === "gp") { $("gpv").textContent = t.value + "%"; }
});
document.addEventListener("change", function (ev) {
  var t = ev.target, f = t.getAttribute("data-f"), id = t.getAttribute("data-id");
  if (t.id === "imp") { if (t.files[0]) doImport(t.files[0]); t.value = ""; return; }
  if (t.id === "pic" || t.id === "cam") {
    var fl = Array.prototype.slice.call(t.files || []); t.value = ""; if (!fl.length || !CE) return; readForm();
    Promise.all(fl.slice(0, 6).map(function (x) { return shrink(x).then(function (b) { var mid = uid("i"); return MDB.put(mid, b).then(function () { CE.e.media.push({ id: mid, k: "img", mime: "image/jpeg" }); CE.newMedia.push(mid); }); }); })).then(showEntry).catch(function (e) { toast(e.message); });
    return;
  }
  if (!f || f === "n" || f === "pa" || f === "about") return;
  if (f === "fg") { S.fg = Math.max(1, Math.min(48, +t.value || 16)); sv(); render(); return; }
  if (f === "tone") { S.set.tone = t.value; sv(); return; }
  if (f === "ttsm") { S.set.tts.mode = t.value; sv(); if (t.value === "never") ttsStop(); return; }
  if (f === "ttsv") { S.set.tts.voice = t.value; sv(); return; }
  if (f === "ttsr") { S.set.tts.rate = +t.value || 1; sv(); return; }
  if (f === "share") { S.set.share[t.value] = t.checked ? 1 : 0; sv(); return; }
  if (f === "evOn") { S.set.ev.on = t.checked ? 1 : 0; sv(); if (t.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission(); return; }
  if (f === "evT") { S.set.ev.t = t.value || "18:00"; sv(); return; }
  if (f === "spOn") { S.set.sp.on = t.checked ? 1 : 0; sv(); if (t.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission(); return; }
  if (f === "spT") { S.set.sp.t = t.value || "21:00"; sv(); return; }
  if (f === "mod") { S.set.mod[t.value] = t.checked ? 1 : 0; sv(); return; }
  if (f === "drOn") { S.set.drOn = t.checked ? 1 : 0; sv(); if (t.checked && "Notification" in window && Notification.permission === "default") Notification.requestPermission(); return; }
  if (f === "dr") { S.set.dr = t.value || "21:00"; sv(); return; }
  if (f === "theme") { S.set.theme = t.value; sv(); tzTheme(); render(); return; }
  if (f === "lkm") { S.lk = S.lk || {}; if (t.value) S.lk[id] = { m: t.value, t: TZM[t.value][4] ? TZM[t.value][4].slice() : null }; else delete S.lk[id]; sv(); render(); return; }
  if (f === "lkt") { var lq = S.lk && S.lk[id]; if (lq && lq.t) { lq.t[+t.getAttribute("data-j")] = Math.max(0, Math.round(+t.value || 0)); sv(); } return; }
  if (f === "q") { S.q = t.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); sv(); return; }
  if (f === "exf") { var xe = S.ex[t.getAttribute("data-m")][+t.getAttribute("data-i")], xj = +t.getAttribute("data-j"); xe[xj] = xj === 3 ? Math.max(5, Math.min(600, +t.value || 30)) : t.value; if (xj === 3) t.value = xe[3];
    if (P && P.m === t.getAttribute("data-m") && P.i === +t.getAttribute("data-i")) { var a1 = $("xn"), a2 = $("xv"); if (a1) a1.textContent = xe[0]; if (a2) a2.textContent = P.v === "A" ? xe[1] : xe[2]; if (xj === 3 && !P.run) { P.t = xe[3]; var tm = $("tm"); if (tm) tm.textContent = P.t + " s"; } } sv(); return; }
  if (f === "ry") { var rj = +t.getAttribute("data-j"); S.ry.forEach(function (z) { if (z[0] === id) z[rj] = t.value; }); sv(); return; }
  if (/^[1-7]$/.test(f)) { H.forEach(function (z) { if (z[0] === id) z[+f] = t.value; }); sv(); if (f === "1") render(); }
});
document.addEventListener("toggle", function (ev) { var d = ev.target, c = d.getAttribute && d.getAttribute("data-col"); if (c) { S.set.col[c] = d.open ? 0 : 1; sv(); } }, true);
document.addEventListener("keydown", function (ev) { if (ev.key === "Enter" && !ev.shiftKey) { if (ev.target.id === "lpw") { ev.preventDefault(); tryUnlock(); return; } if (ev.target.id === "newkey") { ev.preventDefault(); document.querySelector('[data-a="ksave"]').click(); return; } if (ev.target.id === "pjns") { ev.preventDefault(); document.querySelector('[data-a="psa"]').click(); } else if (ev.target.id === "fcn") { ev.preventDefault(); document.querySelector('[data-a="fcadd"]').click(); } } if (ev.key === "Escape" && $("sheet").innerHTML) closeSheet(); });

document.addEventListener("visibilitychange", function () { if (document.hidden) hiddenAt = Date.now(); else if (LK && !locked && hiddenAt && Date.now() - hiddenAt > 60000) { locked = true; render(); } });
tzLinksInit(); v41Init(); v42Init(); syncKeys();
try { if (localStorage.getItem("talerz:theme") !== (S.set.theme || "auto")) localStorage.setItem("talerz:theme", S.set.theme || "auto"); } catch (e) {}
(function () { var a = new URLSearchParams(location.search).get("akcja"); if (a === "posilek" || a === "woda") { try { history.replaceState({ nawTab: tab, d: 0 }, "", location.pathname); } catch (e) {} tzPend = a; tab = "jedz"; } })();
document.addEventListener("visibilitychange", function () { if (!document.hidden) { wgInit(); tzChanged(); } });
setInterval(tick, 1000); setInterval(chk, 20000); render(); chk();
setTimeout(function () { keyed().forEach(function (p) { ensureModels(p); }); }, 3000);
try { if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (r) { r.update().catch(function () {}); }).catch(function () {}); } catch (e) {}
window.__nawyki = { S: function () { return S; }, ctx: ctx, tz: tz, lvl: lvl };
})();
