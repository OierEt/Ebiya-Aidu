/* Play page: charts of the recorded throws (table `shots` in Supabase), drawn as plain SVG. Colours come from CSS variables. */
(function () {
  var box = document.getElementById("charts");
  if (!box) return;
  var eu = document.documentElement.lang === "eu";
  var T = eu ? {
    none: "Oraindik ez dago jaurtiketarik. Bota lauburua saskira!", few: "Grafikoak ikusteko jaurtiketa gehiago behar dira.",
    err: "Ezin izan dira jaurtiketak kargatu orain.", made: "Sartu da", miss: "Huts egin du", count: "Jaurtiketak",
    posT: "Jaurtiketak nondik hasten diren", posC: "Puntu bakoitza jaurtiketa bat da, baloia leihoan askatu zen lekuan (saskia eskuineko barra da). Beteta: sartu da. Hutsa: huts egin du. Puntu handiagoak 3 puntukoak dira.",
    distT: "Jaurtiketen distantzia", distC: "Askatze-puntutik zerkara dagoen distantzia pixeletan, 100 px-ko zutabeetan. Pantaila handiek distantzia luzeagoak dituzte.",
    regT: "Sartzeko probabilitatea distantziaren arabera", regC: "Puntuak: distantzia-tarte bakoitzean sartutako jaurtiketen ehunekoa (handiagoa = jaurtiketa gehiago). Lerroa: sartu den ala ez distantziarekiko erregresio logistikoa. 100 px gehiagok sartzeko aukeren proportzioa honekin biderkatzen du:",
    regFew: "Erregresioa kalkulatzeko gutxienez 20 jaurtiketa behar dira, sartuak eta hutsak tartean.",
    spT: "Jaurtiketen abiadura", spC: "Askatzeko abiadura px/s-tan. Baloiak 2400 px/s-ko muga du; jaurtiketen", spC2: "azkarragoak izan ziren.",
    angT: "Jaurtiketen norabidea", angC: "Graduak: 0° eskuinera, 90° zuzen gora, 180° ezkerrera.",
    sumT: "Laburpena", xDist: "Distantzia (px)", xSpeed: "Abiadura (px/s)", xAng: "Norabidea (°)", yPct: "Sartuak (%)",
    rows: ["Jaurtiketak", "Sartuak", "2 puntukoak", "3 puntukoak", "Sartutakoen batez besteko distantzia", "Hutsen batez besteko distantzia", "Ukipen-pantailaz", "Abiadura-mugara iritsiak"]
  } : {
    none: "No throws recorded yet. Throw the lauburu into the hoop!", few: "More throws are needed to draw the charts.",
    err: "The throws could not be loaded right now.", made: "Scored", miss: "Missed", count: "Throws",
    posT: "Where throws start", posC: "Each dot is a throw, placed where the ball was released in the window (the hoop is the bar on the right). Filled: scored. Hollow: missed. Bigger dots are 3-pointers.",
    distT: "Throw distance", distC: "Pixels from the release point to the rim, in bins of 100 px. Big screens have longer distances.",
    regT: "Chance of scoring by distance", regC: "Dots: share of throws that scored in each distance bin (bigger = more throws). Line: logistic regression of scored vs distance. Each extra 100 px multiplies the odds of scoring by",
    regFew: "At least 20 throws are needed for the regression, with both scored and missed ones.",
    spT: "Throw speed", spC: "Release speed in px/s. The ball is capped at 2400 px/s; the share of throws that were faster is", spC2: "",
    angT: "Throw direction", angC: "Degrees: 0° is to the right, 90° straight up, 180° to the left.",
    sumT: "Summary", xDist: "Distance (px)", xSpeed: "Speed (px/s)", xAng: "Direction (°)", yPct: "Scored (%)",
    rows: ["Throws", "Scored", "2-pointers", "3-pointers", "Average distance, scored", "Average distance, missed", "On a touch screen", "Reached the speed cap"]
  };
  var fmt = function (n, d) { return Number(n).toLocaleString(eu ? "eu" : "en", { maximumFractionDigits: d || 0 }); };
  var W = 600, H = 340, M = { l: 48, r: 24, t: 12, b: 42 };
  var lin = function (d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); }; };
  function step(range, n) { var raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  var mean = function (a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : 0; };

  /* axes with grid lines; returns { svg, sx, sy } */
  function axes(x0, x1, y0, y1, xl, yl, xticks, yfmt) {
    var sx = lin(x0, x1, M.l, W - M.r), sy = lin(y0, y1, H - M.b, M.t), g = "", i, v, st;
    st = step(y1 - y0, 5);
    for (v = y0; v <= y1 + 1e-9; v += st) g += '<line class="gl" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + sy(v) + '" y2="' + sy(v) + '"/><text class="tx" x="' + (M.l - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + (yfmt ? yfmt(v) : fmt(v)) + '</text>';
    (xticks || []).forEach(function (t) { g += '<line class="tk" x1="' + sx(t) + '" x2="' + sx(t) + '" y1="' + (H - M.b) + '" y2="' + (H - M.b + 4) + '"/><text class="tx" x="' + sx(t) + '" y="' + (H - M.b + 17) + '" text-anchor="middle">' + fmt(t) + '</text>'; });
    g += '<line class="ax" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + (H - M.b) + '" y2="' + (H - M.b) + '"/><line class="ax" x1="' + M.l + '" x2="' + M.l + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>';
    g += '<text class="tx" x="' + ((M.l + W - M.r) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + xl + '</text>';
    g += '<text class="tx" transform="translate(13 ' + ((M.t + H - M.b) / 2) + ') rotate(-90)" text-anchor="middle">' + yl + '</text>';
    return { svg: g, sx: sx, sy: sy };
  }
  function ticksFor(max) { var st = step(max, 6), a = [], v; for (v = 0; v <= max + 1e-9; v += st) a.push(v); return a; }

  /* stacked histogram: missed (hollow) under scored (red) */
  function hist(rows, key, lo, hi, bw, xl, extra, xt) {
    var nb = Math.ceil((hi - lo) / bw), made = [], miss = [], i, r, b, max = 1;
    for (i = 0; i < nb; i++) { made.push(0); miss.push(0); }
    rows.forEach(function (r) { b = Math.min(nb - 1, Math.max(0, Math.floor((r[key] - lo) / bw))); (r.made ? made : miss)[b]++; });
    for (i = 0; i < nb; i++) max = Math.max(max, made[i] + miss[i]);
    var top = Math.ceil(max / step(max, 5)) * step(max, 5);
    var a = axes(lo, lo + nb * bw, 0, top, xl, T.count, xt || ticksFor(lo + nb * bw));
    var s = a.svg;
    for (i = 0; i < nb; i++) {
      var x = a.sx(lo + i * bw) + 1, w = a.sx(lo + (i + 1) * bw) - a.sx(lo + i * bw) - 2;
      if (miss[i]) s += '<rect class="miss" x="' + x + '" y="' + a.sy(miss[i]) + '" width="' + w + '" height="' + (a.sy(0) - a.sy(miss[i])) + '"/>';
      if (made[i]) s += '<rect class="made" x="' + x + '" y="' + a.sy(miss[i] + made[i]) + '" width="' + w + '" height="' + (a.sy(miss[i]) - a.sy(miss[i] + made[i])) + '"/>';
    }
    if (extra) s += extra(a);
    return svg(s);
  }
  function svg(inner) { return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-hidden="true">' + inner + '</svg>'; }
  var legend = '<p class="legend"><i class="lg made"></i>' + T.made + ' <i class="lg miss"></i>' + T.miss + '</p>';

  /* logistic regression of scored ~ distance (Newton-Raphson on the standardised distance) */
  function logit(xs, ys) {
    var m = mean(xs), sd = Math.sqrt(mean(xs.map(function (x) { return (x - m) * (x - m); }))) || 1, b0 = 0, b1 = 0, it, i;
    for (it = 0; it < 40; it++) {
      var g0 = 0, g1 = 0, h00 = 1e-4, h01 = 0, h11 = 1e-4;
      for (i = 0; i < xs.length; i++) {
        var z = (xs[i] - m) / sd, p = 1 / (1 + Math.exp(-(b0 + b1 * z))), w = p * (1 - p);
        g0 += ys[i] - p; g1 += (ys[i] - p) * z; h00 += w; h01 += w * z; h11 += w * z * z;
      }
      var det = h00 * h11 - h01 * h01; if (Math.abs(det) < 1e-12) break;
      var d0 = (h11 * g0 - h01 * g1) / det, d1 = (-h01 * g0 + h00 * g1) / det;
      b0 = Math.max(-30, Math.min(30, b0 + d0)); b1 = Math.max(-30, Math.min(30, b1 + d1));
      if (Math.abs(d0) + Math.abs(d1) < 1e-9) break;
    }
    return { p: function (x) { return 1 / (1 + Math.exp(-(b0 + b1 * (x - m) / sd))); }, or100: Math.exp(b1 * 100 / sd) };
  }

  function card(title, body, caption) { return '<div class="card chart"><h3>' + title + '</h3>' + body + '<p class="note">' + caption + '</p></div>'; }

  function draw(rows) {
    var out = "", n = rows.length, made = rows.filter(function (r) { return r.made; });
    var maxD = Math.max.apply(null, rows.map(function (r) { return r.dist; }));
    // summary
    var miss = rows.filter(function (r) { return !r.made; });
    var vals = [fmt(n), fmt(made.length) + " (" + fmt(made.length / n * 100) + "%)", fmt(rows.filter(function (r) { return r.points === 2; }).length), fmt(rows.filter(function (r) { return r.points === 3; }).length),
      made.length ? fmt(mean(made.map(function (r) { return r.dist; }))) + " px" : "-", miss.length ? fmt(mean(miss.map(function (r) { return r.dist; }))) + " px" : "-",
      fmt(rows.filter(function (r) { return r.touch; }).length / n * 100) + "%", fmt(rows.filter(function (r) { return r.speed_raw > 2400; }).length / n * 100) + "%"];
    out += '<div class="card chart"><h3>' + T.sumT + '</h3><dl class="sum">' + T.rows.map(function (l, i) { return '<div><dt>' + l + '</dt><dd>' + vals[i] + '</dd></div>'; }).join("") + '</dl></div>';

    // 1) where throws start
    var a = { l: 14, r: 14, t: 12, b: 12 }, pw = W - a.l - a.r, ph = Math.round(pw * 0.62), s = "";
    s += '<rect class="frame" x="' + a.l + '" y="' + a.t + '" width="' + pw + '" height="' + ph + '"/>';
    rows.slice().sort(function (p, q) { return (p.made ? 1 : 0) - (q.made ? 1 : 0); }).forEach(function (r) {
      s += '<circle class="' + (r.made ? "dm" : "dx") + '" cx="' + (a.l + r.release_x * pw).toFixed(1) + '" cy="' + (a.t + r.release_y * ph).toFixed(1) + '" r="' + (r.points === 3 ? 5 : 3.6) + '"/>';
    });
    s += '<rect class="hoopbar" x="' + (a.l + pw - 5) + '" y="' + (a.t + 0.36 * ph - 3) + '" width="9" height="6"/>';
    out += card(T.posT, '<svg viewBox="0 0 ' + W + ' ' + (ph + a.t + a.b) + '" role="img" aria-hidden="true">' + s + '</svg>' + legend, T.posC);

    // 2) distance histogram
    out += card(T.distT, hist(rows, "dist", 0, Math.max(300, Math.ceil(maxD / 100) * 100), 100, T.xDist) + legend, T.distC);

    // 3) regression
    var body, cap = T.regC;
    if (n >= 20 && made.length >= 3 && miss.length >= 3) {
      var fit = logit(rows.map(function (r) { return r.dist; }), rows.map(function (r) { return r.made ? 1 : 0; }));
      var hi = Math.max(300, Math.ceil(maxD / 100) * 100), ax = axes(0, hi, 0, 100, T.xDist, T.yPct, ticksFor(hi)), t = ax.svg, bw = 100, bi, pts = [];
      for (bi = 0; bi < hi / bw; bi++) {
        var inb = rows.filter(function (r) { return r.dist >= bi * bw && r.dist < (bi + 1) * bw; });
        if (inb.length >= 3) t += '<circle class="dm" cx="' + ax.sx(bi * bw + bw / 2) + '" cy="' + ax.sy(inb.filter(function (r) { return r.made; }).length / inb.length * 100) + '" r="' + Math.min(14, 3 + Math.sqrt(inb.length)) + '"/>';
      }
      for (bi = 0; bi <= 60; bi++) { var xv = hi * bi / 60; pts.push(ax.sx(xv).toFixed(1) + "," + ax.sy(fit.p(xv) * 100).toFixed(1)); }
      t += '<polyline class="fit" points="' + pts.join(" ") + '"/>';
      body = svg(t); cap += " " + fmt(fit.or100, 2) + ".";
    } else { body = '<p class="count-status">' + T.regFew + '</p>'; cap = ""; }
    out += card(T.regT, body, cap);

    // 4) speed histogram
    var share = fmt(rows.filter(function (r) { return r.speed_raw > 2400; }).length / n * 100) + "%";
    out += card(T.spT, hist(rows, "speed", 0, 2600, 200, T.xSpeed, function (ax) { return '<line class="capline" x1="' + ax.sx(2400) + '" x2="' + ax.sx(2400) + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>'; }, [0, 600, 1200, 1800, 2400]) + legend, T.spC + " " + share + " " + T.spC2);

    // 5) direction histogram
    out += card(T.angT, hist(rows, "angle", -180, 180, 15, T.xAng, null, [-180, -90, 0, 90, 180]) + legend, T.angC);
    box.innerHTML = out;
  }

  function load() {
    if (!window.ebiyaCounter) return;
    window.ebiyaCounter.shots().then(function (rows) {
      if (!rows.length) { box.innerHTML = '<p class="count-status">' + T.none + '</p>'; return; }
      if (rows.length < 5) { box.innerHTML = '<p class="count-status">' + T.few + '</p>'; return; }
      draw(rows);
    }).catch(function () { if (!box.children.length || box.querySelector(".count-status")) box.innerHTML = '<p class="count-status">' + T.err + '</p>'; });
  }
  load();
  setInterval(load, 60000);
})();
