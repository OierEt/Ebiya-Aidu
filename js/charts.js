/* Play page: charts of the recorded throws (table `shots` in Supabase), drawn as plain SVG. Colours come from CSS variables. */
(function () {
  var box = document.getElementById("charts");
  if (!box) return;
  var eu = document.documentElement.lang === "eu";
  var T = eu ? {
    none: "Oraindik ez dago jaurtiketarik. Bota lauburua saskira!", few: "Grafikoak ikusteko jaurtiketa gehiago behar dira.", err: "Ezin izan dira jaurtiketak kargatu orain.",
    made: "Sartu da", miss: "Huts egin du", count: "Jaurtiketak", bins: "Zutabeen zabalera",
    viewL: "Posizio-ikuspegia", showL: "Erakutsi", both: "Biak", onlyMade: "Sartuak soilik", onlyMiss: "Hutsak soilik", mineL: "Zure jaurtiketak (gailu hau)", youC: "Zu", allC: "Denak", mineN: "Zure jaurtiketak gailu honetan eta nabigatzaile honetan bakarrik gordetzen dira, orri hau gehitu zen unetik aurrera.", axPxX: "Saskitik distantzia horizontala (px)", axPxY: "Saskiarekiko desplazamendu bertikala (px, + = behean)", axWX: "Leihoaren zabalera (%)", axWY: "Leihoaren garaiera (%)", unitC: "Kopurua", unitP: "% zutabe bakoitzean", pctOf: "Sartuak / hutsak (%)", pWin: "Leihoa", pPx: "Pixelak", bars: "Barrak", radar: "Radarra", logit: "Logistikoa", linear: "Lineala", cells: "Gelaxkak",
    sumT: "Laburpena", rows: ["Jaurtiketak", "Sartuak", "2 puntukoak", "3 puntukoak", "Sartutakoen batez besteko distantzia", "Hutsen batez besteko distantzia", "Ukipen-pantailaz", "Abiadura-mugara iritsiak"],
    posT: "Jaurtiketak nondik hasten diren", posC: "Puntu bakoitza jaurtiketa bat da. Pixelak (lehenetsia): saskitik benetan zenbat pixelera dagoen, pantaila-neurrien zuzenketarik gabe; distantziak zuzenean konparatzen dira, baina pantaila handiek urrutiago dauden puntuak dituzte. Leihoa: laukia leihoa da, eta puntu bakoitza baloia askatu zen lekuan dago, leihoaren zabaleraren eta garaieraren zati gisa; beraz, pantaila erdi-zabaleko ordenagailu batean eta zabal batean ezkerreko ertzetik jaurtitzen baduzu, biak laukiaren ezkerreko ertzean ageri dira (ez bata erdian), pantaila guztiak neurri berera luzatzen direlako. Hiru puntuak nola kalkulatzen diren: saskia 3 puntu balio du baloia saskitik leihoaren diagonalaren %30 baino urrunago askatu bada, bestela 2; muga hori pantaila bakoitzaren neurriaren araberakoa da, beraz pantaila ezberdinetan distantzia ezberdina da. Puntu handiak 3 puntukoak dira; puntu hutsak huts egindakoak. Diamante beltzak zureak dira.",
    heatT: "Non da errazago sartzea", heatC: "Leihoa gelaxka-sarean zatituta. Gelaxka bakoitzean, handik askatutako jaurtiketen artean sartutakoen ehunekoa (3 jaurtiketa baino gutxiagoko gelaxkak hutsik). Ilunagoa = errazagoa. Goiko Pixelak/Leihoa aukerari jarraitzen dio.",
    distT: "Jaurtiketen distantzia", distC: "Askatze-puntutik zerkara dagoen distantzia pixeletan. Pantaila handiek distantzia luzeagoak dituzte.",
    regT: "Sartzeko probabilitatea distantziaren arabera", regC: "Puntu bakoitza distantzia-tarte bat da (ez pixel bat): puntuaren altuera tarte horretan sartutakoen ehunekoa da, eta tamaina jaurtiketa-kopurua. Behean eta goian marra txikiek jaurtiketa bakoitza erakusten dute (goian sartuak, behean hutsak). Lerroa hautatutako ereduaren doikuntza da. Sartu/huts erantzun bitarra denez, eredu logistikoa egokiena da (probabilitatea 0 eta 100 artean gelditzen da); eredu linealak lerro zuzena doitzen du, 0tik behera edo 100etik gora joan daiteke, baina irakurtzeko errazagoa da. Zutabe-zabalerak puntuei bakarrik eragiten die; lerroa eta metrikak jaurtiketa bakoitzarekin kalkulatzen dira beti.",
    regFew: "Erregresiorako gutxienez 20 jaurtiketa behar dira, sartuak eta hutsak tartean.",
    rn: "Jaurtiketak", rOR: "Aukera-ratioa 100 px-ko", rP: "p balioa", rMcF: "McFadden R²", rAUC: "AUC", rAcc: "Asmatze-tasa (%50eko mugarekin)", rD50: "Distantzia %50eko probabilitatearekin",
    rSlope: "Malda (ehuneko-puntuak 100 px-ko)", rR2: "R²", rR: "r", rInt: "Ebakidura (%, 0 px-n)", xDist: "Distantzia (px)", yPct: "Sartuak (%)",
    spT: "Jaurtiketen abiadura", spC: "Askatzeko abiadura px/s-tan. Baloiak 2400 px/s-ko muga du; jaurtiketen", spC2: "azkarragoak izan ziren.", xSpeed: "Abiadura (px/s)",
    svdT: "Abiadura distantziaren aurka", svdC: "Jaurtiketa bakoitza puntu bat da. Distantzia handiagoan abiadura handiagoa behar da; mugan (2400) pilatzen direnek sartzeko zailtasunak dituzte.", ySpeed: "Abiadura (px/s)",
    angT: "Jaurtiketen norabidea", angC: "Graduak: 0° eskuinera, 90° zuzen gora, 180° ezkerrera, -90° behera. Radarrean, ertz bakoitzaren luzera jaurtiketa-kopurua da.", xAng: "Norabidea (°)",
    timeT: "Asmatzea denboran zehar", timeC: "Azken jaurtiketen batez bestekoa (leiho mugikorra) sartutakoen ehunekoan; lerro etena guztien batez bestekoa da. Ezkerrean zaharrenak, eskuinean berrienak.", xThrow: "Jaurtiketa zenbakia"
  } : {
    none: "No throws recorded yet. Throw the lauburu into the hoop!", few: "More throws are needed to draw the charts.", err: "The throws could not be loaded right now.",
    made: "Scored", miss: "Missed", count: "Throws", bins: "Bin width",
    viewL: "Position view", showL: "Show", both: "Both", onlyMade: "Scored only", onlyMiss: "Missed only", mineL: "Your throws (this device)", youC: "You", allC: "All", mineN: "Your throws are only kept on this device and browser, from the moment this feature was added.", axPxX: "Horizontal distance from the rim (px)", axPxY: "Vertical offset from the rim (px, + = below)", axWX: "Window width (%)", axWY: "Window height (%)", unitC: "Count", unitP: "% within bin", pctOf: "Scored / missed (%)", pWin: "Window", pPx: "Pixels", bars: "Bars", radar: "Radar", logit: "Logistic", linear: "Linear", cells: "Cells",
    sumT: "Summary", rows: ["Throws", "Scored", "2-pointers", "3-pointers", "Average distance, scored", "Average distance, missed", "On a touch screen", "Reached the speed cap"],
    posT: "Where throws start", posC: "Each dot is a throw. Pixels (default): the real distance in pixels from the hoop, with no screen correction, so distances compare directly but big screens reach further out. Window: the box is the window and each dot is where the ball was released as a share of its width and height; if you throw from the far left edge on a half-width laptop and on a wide one, both dots land on the left edge of the box (not one in the middle), because every screen is stretched to the same box. How the 3-pointer is calculated: a basket counts 3 if the ball was released farther than 30% of the window diagonal from the rim, otherwise 2; that limit depends on each screen's size, so it is a different distance on different screens. Bigger dots are 3-pointers; hollow dots are misses. Black diamonds are yours.",
    heatT: "Where it is easiest to score", heatC: "The window split into a grid. Each cell shows the share of throws released there that scored (cells with fewer than 3 throws are left empty). Darker = easier. It follows the Pixels / Window switch above.",
    distT: "Throw distance", distC: "Pixels from the release point to the rim. Big screens have longer distances.",
    regT: "Chance of scoring by distance", regC: "Each dot is a distance bin (not a pixel): its height is the share of throws in that bin that scored, its size is how many throws it has. The small ticks at the top and bottom show every single throw (top: scored, bottom: missed). The line is the chosen model. Because scored/missed is a yes/no outcome, the logistic model is the proper one (the probability stays between 0 and 100); the linear model fits a straight line, which can go below 0 or above 100, but is easier to read. The bin size only changes the dots; the line and the metrics are always fitted on every single throw.",
    regFew: "At least 20 throws are needed for the regression, with both scored and missed ones.",
    rn: "Throws", rOR: "Odds ratio per 100 px", rP: "p-value", rMcF: "McFadden R²", rAUC: "AUC", rAcc: "Accuracy (at the 50% line)", rD50: "Distance at 50% chance",
    rSlope: "Slope (percentage points per 100 px)", rR2: "R²", rR: "r", rInt: "Intercept (%, at 0 px)", xDist: "Distance (px)", yPct: "Scored (%)",
    spT: "Throw speed", spC: "Release speed in px/s. The ball is capped at 2400 px/s; the share of throws that were faster is", spC2: "", xSpeed: "Speed (px/s)",
    svdT: "Speed against distance", svdC: "Each throw is a dot. Further throws need more speed; the ones piled at the cap (2400) have a harder time scoring.", ySpeed: "Speed (px/s)",
    angT: "Throw direction", angC: "Degrees: 0° is to the right, 90° straight up, 180° to the left, -90° down. In the radar, the length of each petal is the number of throws.", xAng: "Direction (°)",
    timeT: "Accuracy over time", timeC: "Moving average of the latest throws, as % scored; the dashed line is the overall average. Oldest on the left, newest on the right.", xThrow: "Throw number"
  };
  var fmt = function (n, d) { return Number(n).toLocaleString(eu ? "eu" : "en", { maximumFractionDigits: d || 0 }); };
  var W = 600, H = 340, M = { l: 48, r: 24, t: 12, b: 42 };
  var S = { pview: "px", show: "both", unit: "count", view: "bars", model: "logit", bins: { dist: 100, reg: 100, speed: 200, angle: 15, heat: 8 } };
  var ALL = [], MINE = [];

  /* ---------- small helpers ---------- */
  var lin = function (d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); }; };
  function step(range, n) { var raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
  var mean = function (a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : 0; };
  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function ticksFor(max) { var st = step(max, 6), a = [], v; for (v = 0; v <= max + 1e-9; v += st) a.push(v); return a; }
  function svg(inner, h) { return '<svg viewBox="0 0 ' + W + ' ' + (h || H) + '" role="img" aria-hidden="true">' + inner + '</svg>'; }
  function seg(key, opts, cur) { return '<span class="seg">' + opts.map(function (o) { return '<button type="button" data-set="' + key + ':' + o[0] + '"' + (String(o[0]) === String(cur) ? ' class="on"' : '') + '>' + o[1] + '</button>'; }).join("") + '</span>'; }
  function sel(key, vals, cur, label, unit) { return '<label class="sel">' + label + ' <select data-sel="' + key + '">' + vals.map(function (v) { return '<option value="' + v + '"' + (v === cur ? ' selected' : '') + '>' + v + (unit || "") + '</option>'; }).join("") + '</select></label>'; }
  function card(title, ctrls, body, caption, extra) { return '<div class="card chart"><h3>' + title + '</h3>' + (ctrls ? '<div class="ctrls">' + ctrls + '</div>' : '') + body + (extra || "") + (caption ? '<p class="note">' + caption + '</p>' : '') + '</div>'; }
  function dl(pairs) { return '<dl class="sum">' + pairs.map(function (p) { return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>'; }).join("") + '</dl>'; }
  var legend = '<p class="legend"><i class="lg made"></i>' + T.made + ' <i class="lg miss"></i>' + T.miss + '</p>';

  /* ---------- statistics ---------- */
  function erf(x) { var s = x < 0 ? -1 : 1, t; x = Math.abs(x); t = 1 / (1 + 0.3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)); }
  var normCdf = function (z) { return 0.5 * (1 + erf(z / Math.SQRT2)); };
  function lgamma(x) { var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5], y = x, t = x + 5.5, s = 1.000000000190015, j; t -= (x + 0.5) * Math.log(t); for (j = 0; j < 6; j++) s += c[j] / ++y; return -t + Math.log(2.5066282746310005 * s / x); }
  function betacf(a, b, x) { var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap, m, h, aa, del; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; h = d; for (m = 1; m <= 200; m++) { var m2 = 2 * m; aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c; aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; del = d * c; h *= del; if (Math.abs(del - 1) < 3e-10) break; } return h; }
  function betai(a, b, x) { if (x <= 0) return 0; if (x >= 1) return 1; var bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b; }
  var pT = function (t, df) { return betai(df / 2, 0.5, df / (df + t * t)); };
  var fmtP = function (p) { return p < 0.001 ? "< 0.001" : fmt(p, 3); };

  function logit(xs, ys) {
    var n = xs.length, m = mean(xs), sd = Math.sqrt(mean(xs.map(function (x) { return (x - m) * (x - m); }))) || 1, b0 = 0, b1 = 0, it, i, h00, h01, h11, g0, g1, det, d0, d1;
    for (it = 0; it < 50; it++) {
      g0 = g1 = h01 = 0; h00 = h11 = 1e-8;
      for (i = 0; i < n; i++) { var z = (xs[i] - m) / sd, p = 1 / (1 + Math.exp(-(b0 + b1 * z))), w = p * (1 - p); g0 += ys[i] - p; g1 += (ys[i] - p) * z; h00 += w; h01 += w * z; h11 += w * z * z; }
      det = h00 * h11 - h01 * h01; if (Math.abs(det) < 1e-12) break;
      d0 = (h11 * g0 - h01 * g1) / det; d1 = (-h01 * g0 + h00 * g1) / det;
      b0 = Math.max(-30, Math.min(30, b0 + d0)); b1 = Math.max(-30, Math.min(30, b1 + d1));
      if (Math.abs(d0) + Math.abs(d1) < 1e-9) break;
    }
    var P = function (x) { return 1 / (1 + Math.exp(-(b0 + b1 * (x - m) / sd))); }, ll = 0, ll0 = 0, pbar = mean(ys), correct = 0, made = [], missd = [];
    for (i = 0; i < n; i++) { var pi = Math.min(1 - 1e-12, Math.max(1e-12, P(xs[i]))); ll += ys[i] ? Math.log(pi) : Math.log(1 - pi); ll0 += ys[i] ? Math.log(pbar) : Math.log(1 - pbar); if ((pi >= 0.5) === !!ys[i]) correct++; (ys[i] ? made : missd).push(xs[i]); }
    var se = Math.sqrt(h00 / ((h00 * h11 - h01 * h01) || 1e-12)), k = 100 / sd;
    made.sort(function (a, b) { return a - b; }); missd.sort(function (a, b) { return a - b; });
    var up = function (arr, v) { var lo = 0, hi = arr.length; while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid] <= v) lo = mid + 1; else hi = mid; } return lo; };
    var lo2 = function (arr, v) { var lo = 0, hi = arr.length; while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid] < v) lo = mid + 1; else hi = mid; } return lo; };
    var U = 0; made.forEach(function (d) { U += (missd.length - up(missd, d)) + 0.5 * (up(missd, d) - lo2(missd, d)); });
    return { p: P, or: Math.exp(b1 * k), orLo: Math.exp((b1 - 1.96 * se) * k), orHi: Math.exp((b1 + 1.96 * se) * k), pval: 2 * (1 - normCdf(Math.abs(b1 / se))),
      mcf: 1 - ll / ll0, auc: U / (made.length * missd.length), acc: correct / n, d50: b1 < 0 ? m - b0 * sd / b1 : null };
  }
  function ols(xs, ys) {
    var n = xs.length, mx = mean(xs), my = mean(ys), sxx = 0, sxy = 0, syy = 0, i;
    for (i = 0; i < n; i++) { sxx += (xs[i] - mx) * (xs[i] - mx); sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) * (ys[i] - my); }
    var b = sxy / sxx, a = my - b * mx, sse = 0; for (i = 0; i < n; i++) { var r = ys[i] - (a + b * xs[i]); sse += r * r; }
    var se = Math.sqrt(sse / (n - 2) / sxx);
    return { p: function (x) { return a + b * x; }, slope100: b * 100 * 100, lo: (b - 1.96 * se) * 10000, hi: (b + 1.96 * se) * 10000, r2: 1 - sse / syy, r: sxy / Math.sqrt(sxx * syy) , pval: pT(b / se, n - 2), a: a * 100 };
  }

  /* ---------- drawing blocks ---------- */
  function axes(x0, x1, y0, y1, xl, yl, xticks, yfmt) {
    var sx = lin(x0, x1, M.l, W - M.r), sy = lin(y0, y1, H - M.b, M.t), g = "", v, st = step(y1 - y0, 5);
    for (v = y0; v <= y1 + 1e-9; v += st) g += '<line class="gl" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + sy(v) + '" y2="' + sy(v) + '"/><text class="tx" x="' + (M.l - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + (yfmt ? yfmt(v) : fmt(v, st < 1 ? 1 : 0)) + '</text>';
    (xticks || []).forEach(function (t) { g += '<line class="tk" x1="' + sx(t) + '" x2="' + sx(t) + '" y1="' + (H - M.b) + '" y2="' + (H - M.b + 4) + '"/><text class="tx" x="' + sx(t) + '" y="' + (H - M.b + 17) + '" text-anchor="middle">' + fmt(t) + '</text>'; });
    g += '<line class="ax" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + (H - M.b) + '" y2="' + (H - M.b) + '"/><line class="ax" x1="' + M.l + '" x2="' + M.l + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>';
    g += '<text class="tx" x="' + ((M.l + W - M.r) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + xl + '</text>';
    g += '<text class="tx" transform="translate(13 ' + ((M.t + H - M.b) / 2) + ') rotate(-90)" text-anchor="middle">' + yl + '</text>';
    return { svg: g, sx: sx, sy: sy };
  }
  /* binned counts: arrays made/miss per bin */
  function bin(rows, key, lo, hi, bw) {
    var nb = Math.ceil((hi - lo) / bw), made = [], miss = [], i;
    for (i = 0; i < nb; i++) { made.push(0); miss.push(0); }
    rows.forEach(function (r) { var b = Math.min(nb - 1, Math.max(0, Math.floor((r[key] - lo) / bw))); (r.made ? made : miss)[b]++; });
    return { nb: nb, made: made, miss: miss };
  }
  function hist(rows, key, lo, hi, bw, xl, extra, xt) {
    var b = bin(rows, key, lo, hi, bw), pc = S.unit === "pct", i, max = 0, kk = function (i) { var t = b.made[i] + b.miss[i]; return pc ? (t ? 100 / t : 0) : 1; };
    for (i = 0; i < b.nb; i++) max = Math.max(max, pc ? 100 : b.made[i] + b.miss[i]);
    var st = step(max || 1, 5), top = Math.ceil((max || 1) / st) * st;
    var a = axes(lo, lo + b.nb * bw, 0, top, xl, pc ? T.pctOf : T.count, xt || ticksFor(lo + b.nb * bw)), s = a.svg;
    for (i = 0; i < b.nb; i++) {
      var x = a.sx(lo + i * bw) + 1, w = Math.max(1, a.sx(lo + (i + 1) * bw) - a.sx(lo + i * bw) - 2), mi = b.miss[i] * kk(i), ma = b.made[i] * kk(i), tt = '<title>' + b.made[i] + ' / ' + (b.made[i] + b.miss[i]) + '</title>';
      if (mi) s += '<rect class="miss" x="' + x + '" y="' + a.sy(mi) + '" width="' + w + '" height="' + (a.sy(0) - a.sy(mi)) + '">' + tt + '</rect>';
      if (ma) s += '<rect class="made" x="' + x + '" y="' + a.sy(mi + ma) + '" width="' + w + '" height="' + (a.sy(mi) - a.sy(mi + ma)) + '">' + tt + '</rect>';
    }
    if (extra) s += extra(a);
    return svg(s) + legend;
  }
  var unitCtrl = function () { return seg("unit", [["count", T.unitC], ["pct", T.unitP]], S.unit); };

  /* the hoop, drawn like the one on the page (sizes in CSS px, scaled to the chart) */
  function hoop(pw, ph, sc, yr) {
    var y = yr === undefined ? 0.36 * ph : yr, u = function (v) { return (v * sc).toFixed(1); }, g = '<g class="hoopg">';
    g += '<rect class="hb" x="' + (pw - 10 * sc) + '" y="' + (y - 50 * sc) + '" width="' + u(10) + '" height="' + u(90) + '"/>';
    g += '<path class="hn" d="M' + (pw - 91 * sc) + ' ' + (y + 8 * sc) + 'L' + (pw - 13 * sc) + ' ' + (y + 8 * sc) + 'L' + (pw - 30 * sc) + ' ' + (y + 52 * sc) + 'L' + (pw - 74 * sc) + ' ' + (y + 52 * sc) + 'Z"/>';
    g += '<path class="hn" d="M' + (pw - 71 * sc) + ' ' + (y + 8 * sc) + 'L' + (pw - 60 * sc) + ' ' + (y + 52 * sc) + 'M' + (pw - 52 * sc) + ' ' + (y + 8 * sc) + 'L' + (pw - 48 * sc) + ' ' + (y + 52 * sc) + 'M' + (pw - 33 * sc) + ' ' + (y + 8 * sc) + 'L' + (pw - 38 * sc) + ' ' + (y + 52 * sc) + 'M' + (pw - 80 * sc) + ' ' + (y + 30 * sc) + 'L' + (pw - 23 * sc) + ' ' + (y + 30 * sc) + '"/>';
    g += '<rect class="hr" x="' + (pw - 94 * sc) + '" y="' + y + '" width="' + u(84) + '" height="' + u(8) + '"/></g>';
    return g;
  }
  /* geometry of the "unit window" box for the current rows */
  /* geometry of the position plots (shared by "Where throws start" and the heat map) */
  function posGeom(rows) {
    var mvw = median(rows.map(function (r) { return r.vw; })), mvh = median(rows.map(function (r) { return r.vh; })), pw = 520, ph, sc, g, ax = "", v, st, tx = function (x, y, t, a) { return '<text class="tx" x="' + x + '" y="' + y + '" text-anchor="' + (a || "middle") + '">' + t + '</text>'; };
    if (S.pview === "px") {
      var xs = rows.map(function (r) { return r.hoop_dx; }), ys = rows.map(function (r) { return -r.hoop_dy; }), xmax = Math.max(400, Math.ceil(Math.max.apply(null, xs) / 100) * 100),
        ymin = Math.min(-100, Math.floor(Math.min.apply(null, ys) / 100) * 100), ymax = Math.max(200, Math.ceil(Math.max.apply(null, ys) / 100) * 100);
      sc = pw / (xmax + 60); ph = Math.round((ymax - ymin) * sc);
      g = { pw: pw, ph: ph, sc: sc, yr: -ymin * sc, fx: function (r) { return pw - (52 + r.hoop_dx) * sc; }, fy: function (r) { return (-r.hoop_dy - ymin) * sc; } };
      g.tcx = pw - 52 * sc; g.tcy = g.yr; g.trx = g.try_ = 0.3 * Math.hypot(mvw, mvh) * sc;
      st = step(xmax, 5);
      for (v = 0; v <= xmax + 8; v += st) { var xx = pw - 52 * sc - v * sc; ax += '<line class="tk" x1="' + xx + '" x2="' + xx + '" y1="' + ph + '" y2="' + (ph + 4) + '"/>' + tx(xx, ph + 16, fmt(v)); }
      st = step(ymax - ymin, 6);
      for (v = Math.ceil(ymin / st) * st; v <= ymax + 1e-9; v += st) { var yy = g.yr + v * sc; ax += '<line class="tk" x1="-4" x2="0" y1="' + yy + '" y2="' + yy + '"/>' + tx(-7, yy + 4, fmt(v), "end"); }
      g.xl = T.axPxX; g.yl = T.axPxY;
    } else {
      var asp = Math.min(2.2, Math.max(0.45, mvh / mvw));
      ph = Math.round(pw * asp); if (ph > 440) { ph = 440; pw = Math.round(ph / asp); }
      sc = pw / mvw * (mvw <= 600 ? 0.7 : 1);
      g = { pw: pw, ph: ph, sc: sc, fx: function (r) { return r.release_x * pw; }, fy: function (r) { return r.release_y * ph; } };
      g.tcx = pw * (1 - 52 / mvw); g.tcy = 0.36 * ph; g.trx = 0.3 * Math.hypot(mvw, mvh) / mvw * pw; g.try_ = 0.3 * Math.hypot(mvw, mvh) / mvh * ph;
      [0, 25, 50, 75, 100].forEach(function (q) { ax += '<line class="tk" x1="' + q * pw / 100 + '" x2="' + q * pw / 100 + '" y1="' + ph + '" y2="' + (ph + 4) + '"/>' + tx(q * pw / 100, ph + 16, q + "%") + '<line class="tk" x1="-4" x2="0" y1="' + q * ph / 100 + '" y2="' + q * ph / 100 + '"/>' + tx(-7, q * ph / 100 + 4, q + "%", "end"); });
      g.xl = T.axWX; g.yl = T.axWY;
    }
    g.ox = Math.round(62 + (520 - g.pw) / 2); g.axes = ax; return g;
  }
  function windowSvg(g, inner) {
    var hp = hoop(g.pw, g.ph, g.sc, g.yr);
    return '<svg viewBox="0 0 ' + W + ' ' + (g.ph + 52) + '" role="img" aria-hidden="true"><defs><clipPath id="wc"><rect x="0" y="0" width="' + g.pw + '" height="' + g.ph + '"/></clipPath></defs><g transform="translate(' + g.ox + ' 12)"><rect class="frame" x="0" y="0" width="' + g.pw + '" height="' + g.ph + '"/>' + inner +
      ''+ hp + g.axes +
      '<text class="tx" x="' + g.pw / 2 + '" y="' + (g.ph + 34) + '" text-anchor="middle">' + g.xl + '</text><text class="tx" transform="translate(-50 ' + g.ph / 2 + ') rotate(-90)" text-anchor="middle">' + g.yl + '</text></g></svg>';
  }
  var mineLeg = function () { return MINE.length ? '<p class="legend"><i class="lg mn"></i>' + T.mineL + '</p>' : ''; };

  /* ---------- the charts ---------- */
  function summ(rows) {
    var n = rows.length, made = rows.filter(function (r) { return r.made; }), miss = rows.filter(function (r) { return !r.made; }), D = function (a) { return a.length ? fmt(mean(a.map(function (r) { return r.dist; }))) + " px" : "-"; }, P = function (k) { return n ? fmt(k / n * 100) + "%" : "-"; };
    return [fmt(n), n ? fmt(made.length) + " (" + P(made.length) + ")" : "-", fmt(rows.filter(function (r) { return r.points === 2; }).length), fmt(rows.filter(function (r) { return r.points === 3; }).length), D(made), D(miss),
      P(rows.filter(function (r) { return r.touch; }).length), P(rows.filter(function (r) { return r.speed_raw > 2400; }).length)];
  }
  function cSummary(rows) {
    var a = summ(rows), m = MINE.length ? summ(MINE) : null;
    var head = m ? '<div class="hd"><dt></dt><dd>' + T.allC + '</dd><dd>' + T.youC + '</dd></div>' : '';
    var body = '<dl class="sum">' + head + T.rows.map(function (l, i) { return '<div><dt>' + l + '</dt><dd>' + a[i] + '</dd>' + (m ? '<dd class="me">' + m[i] + '</dd>' : '') + '</div>'; }).join("") + '</dl>';
    return card(T.sumT, "", body, m ? T.mineN : "");
  }
  var vis = function (r) { return S.show === "both" || (S.show === "made") === !!r.made; };
  function diamond(x, y, made) { var d = 6.5; return '<path class="' + (made ? "mn" : "mn0") + '" d="M' + (x - d).toFixed(1) + ' ' + y.toFixed(1) + 'L' + x.toFixed(1) + ' ' + (y - d).toFixed(1) + 'L' + (x + d).toFixed(1) + ' ' + y.toFixed(1) + 'L' + x.toFixed(1) + ' ' + (y + d).toFixed(1) + 'Z"/>'; }
  function cPos(rows) {
    var g = posGeom(rows), s = "";
    rows.slice().sort(function (p, q) { return (p.made ? 1 : 0) - (q.made ? 1 : 0); }).forEach(function (r) {
      if (!vis(r)) return;
      s += '<circle class="' + (r.made ? "dm" : "dx") + '" cx="' + g.fx(r).toFixed(1) + '" cy="' + g.fy(r).toFixed(1) + '" r="' + (r.points === 3 ? 5 : 3.6) + '"/>';
    });
    MINE.forEach(function (r) { if (vis(r)) { var x = g.fx(r), y = g.fy(r); if (x >= 0 && x <= g.pw && y >= 0 && y <= g.ph) s += diamond(x, y, r.made); } });
    return card(T.posT, seg("show", [["both", T.both], ["made", T.onlyMade], ["miss", T.onlyMiss]], S.show), windowSvg(g, s) + legend + mineLeg(), T.posC);
  }
  function cHeat(rows) {
    var g = posGeom(rows), nc = S.bins.heat, nr = Math.max(2, Math.round(nc * g.ph / g.pw)), cw = g.pw / nc, ch = g.ph / nr, cnt = [], mad = [], i, j, s = "";
    for (i = 0; i < nc * nr; i++) { cnt.push(0); mad.push(0); }
    rows.forEach(function (r) { var c = Math.min(nc - 1, Math.max(0, Math.floor(g.fx(r) / g.pw * nc))), q = Math.min(nr - 1, Math.max(0, Math.floor(g.fy(r) / g.ph * nr))); cnt[q * nc + c]++; if (r.made) mad[q * nc + c]++; });
    for (j = 0; j < nr; j++) for (i = 0; i < nc; i++) {
      var k = j * nc + i, n = cnt[k], pc = n ? mad[k] / n * 100 : 0;
      if (n >= 3) s += '<rect class="hc" style="fill-opacity:' + (0.12 + 0.88 * pc / 100).toFixed(2) + '" x="' + (i * cw).toFixed(1) + '" y="' + (j * ch).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '"><title>' + fmt(pc) + '% (' + n + ')</title></rect>' + (cw > 30 ? '<text class="tx ht" x="' + ((i + 0.5) * cw).toFixed(1) + '" y="' + ((j + 0.5) * ch + 4).toFixed(1) + '" text-anchor="middle">' + fmt(pc) + '</text>' : '');
      else s += '<rect class="hn0" x="' + (i * cw).toFixed(1) + '" y="' + (j * ch).toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ch.toFixed(1) + '"/>';
    }
    return card(T.heatT, sel("heat", [6, 8, 12, 16], S.bins.heat, T.cells), windowSvg(g, s), T.heatC);
  }
  function cDist(rows) {
    var hi = Math.max(300, Math.ceil(Math.max.apply(null, rows.map(function (r) { return r.dist; })) / 100) * 100);
    return card(T.distT, sel("dist", [25, 50, 100, 150, 200, 300], S.bins.dist, T.bins, " px") + unitCtrl(), hist(rows, "dist", 0, hi, S.bins.dist, T.xDist), T.distC);
  }
  function cReg(rows) {
    var n = rows.length, made = rows.filter(function (r) { return r.made; }).length, ctrls = seg("model", [["logit", T.logit], ["linear", T.linear]], S.model) + sel("reg", [25, 50, 100, 150, 200, 300], S.bins.reg, T.bins, " px");
    if (n < 20 || made < 3 || n - made < 3) return card(T.regT, "", '<p class="count-status">' + T.regFew + '</p>', "");
    var xs = rows.map(function (r) { return r.dist; }), ys = rows.map(function (r) { return r.made ? 1 : 0; }), hi = Math.max(300, Math.ceil(Math.max.apply(null, xs) / 100) * 100);
    var ax = axes(0, hi, 0, 100, T.xDist, T.yPct, ticksFor(hi)), t = '<clipPath id="rc"><rect x="' + M.l + '" y="' + M.t + '" width="' + (W - M.l - M.r) + '" height="' + (H - M.t - M.b) + '"/></clipPath>' + ax.svg, bw = S.bins.reg, bi, pts = [], rows2, fit, metrics;
    rows.forEach(function (r) { var y = ax.sy(r.made ? 100 : 0); t += '<line class="rug" x1="' + ax.sx(r.dist) + '" x2="' + ax.sx(r.dist) + '" y1="' + y + '" y2="' + (y + (r.made ? 9 : -9)) + '"/>'; });
    for (bi = 0; bi < Math.ceil(hi / bw); bi++) { var inb = rows.filter(function (r) { return r.dist >= bi * bw && r.dist < (bi + 1) * bw; }); if (inb.length >= 3) t += '<circle class="dm" cx="' + ax.sx(bi * bw + bw / 2) + '" cy="' + ax.sy(inb.filter(function (r) { return r.made; }).length / inb.length * 100) + '" r="' + Math.min(14, 3 + Math.sqrt(inb.length)) + '"/>'; }
    if (S.model === "logit") {
      fit = logit(xs, ys);
      for (bi = 0; bi <= 80; bi++) { var xv = hi * bi / 80; pts.push(ax.sx(xv).toFixed(1) + "," + ax.sy(fit.p(xv) * 100).toFixed(1)); }
      metrics = [[T.rn, fmt(n)], [T.rOR, fmt(fit.or, 2) + " (" + fmt(fit.orLo, 2) + "–" + fmt(fit.orHi, 2) + ")"], [T.rP, fmtP(fit.pval)], [T.rMcF, fmt(fit.mcf, 3)], [T.rAUC, fmt(fit.auc, 3)], [T.rAcc, fmt(fit.acc * 100) + "%"], [T.rD50, fit.d50 && fit.d50 > 0 ? fmt(fit.d50) + " px" : "-"]];
    } else {
      fit = ols(xs, ys);
      for (bi = 0; bi <= 80; bi++) { var xl = hi * bi / 80; pts.push(ax.sx(xl).toFixed(1) + "," + ax.sy(fit.p(xl) * 100).toFixed(1)); }
      metrics = [[T.rn, fmt(n)], [T.rSlope, fmt(fit.slope100, 1) + " (" + fmt(fit.lo, 1) + " – " + fmt(fit.hi, 1) + ")"], [T.rInt, fmt(fit.a, 1)], [T.rR2, fmt(fit.r2, 3)], [T.rR, fmt(fit.r, 3)], [T.rP, fmtP(fit.pval)]];
    }
    t += '<polyline class="fit" clip-path="url(#rc)" points="' + pts.join(" ") + '"/>';
    return card(T.regT, ctrls, svg(t), T.regC, dl(metrics));
  }
  function cSpeed(rows) {
    var share = fmt(rows.filter(function (r) { return r.speed_raw > 2400; }).length / rows.length * 100) + "%", bw = S.bins.speed, hi = Math.ceil(2600 / bw) * bw, ticks = [0, 600, 1200, 1800, 2400];
    return card(T.spT, sel("speed", [100, 200, 300, 400], S.bins.speed, T.bins, " px/s") + unitCtrl(), hist(rows, "speed", 0, hi, bw, T.xSpeed, function (ax) { return '<line class="capline" x1="' + ax.sx(2400) + '" x2="' + ax.sx(2400) + '" y1="' + M.t + '" y2="' + (H - M.b) + '"/>'; }, ticks), T.spC + " " + share + " " + T.spC2);
  }
  function cSvd(rows) {
    var hi = Math.max(300, Math.ceil(Math.max.apply(null, rows.map(function (r) { return r.dist; })) / 100) * 100), ax = axes(0, hi, 0, 2600, T.xDist, T.ySpeed, ticksFor(hi)), t = ax.svg;
    t += '<line class="capline" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + ax.sy(2400) + '" y2="' + ax.sy(2400) + '"/>';
    rows.slice().sort(function (p, q) { return (p.made ? 1 : 0) - (q.made ? 1 : 0); }).forEach(function (r) { t += '<circle class="' + (r.made ? "dm" : "dx") + '" cx="' + ax.sx(r.dist).toFixed(1) + '" cy="' + ax.sy(Math.min(2600, r.speed)).toFixed(1) + '" r="3.4"/>'; });
    MINE.forEach(function (r) { t += diamond(ax.sx(r.dist), ax.sy(Math.min(2600, r.speed)), r.made); });
    return card(T.svdT, "", svg(t) + legend + mineLeg(), T.svdC);
  }
  function cAngle(rows) {
    var bw = S.bins.angle, ctrls = seg("view", [["bars", T.bars], ["radar", T.radar]], S.view) + sel("angle", [10, 15, 30, 45], S.bins.angle, T.bins, "°") + unitCtrl();
    if (S.view === "bars") return card(T.angT, ctrls, hist(rows, "angle", -180, 180, bw, T.xAng, null, [-180, -90, 0, 90, 180]), T.angC);
    var b = bin(rows, "angle", -180, 180, bw), pc = S.unit === "pct", kf = function (i) { var t = b.made[i] + b.miss[i]; return pc ? (t ? 100 / t : 0) : 1; }, cx = W / 2, cy = H / 2 + 2, R = 135, i, max = 0, s = "", tot = [];
    for (i = 0; i < b.nb; i++) { tot.push((b.made[i] + b.miss[i]) * kf(i)); max = Math.max(max, tot[i]); }
    var st = pc ? 25 : step(max || 1, 3), top = pc ? 100 : Math.ceil((max || 1) / st) * st, rad = function (v) { return v / top * R; }, pt = function (r, a) { var q = a * Math.PI / 180; return [cx + r * Math.cos(q), cy - r * Math.sin(q)]; };
    for (var v = st; v <= top + 1e-9; v += st) s += '<circle class="gl2" cx="' + cx + '" cy="' + cy + '" r="' + rad(v) + '"/><text class="tx" x="' + (cx + 4) + '" y="' + (cy - rad(v) - 2) + '">' + fmt(v, st < 1 ? 1 : 0) + (S.unit === "pct" ? "%" : "") + '</text>';
    [[0, "0°", "start"], [90, "90°", "middle"], [180, "180°", "end"], [-90, "-90°", "middle"]].forEach(function (a) { var p = pt(R, a[0]), q = pt(R + 14, a[0]); s += '<line class="gl2" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/><text class="tx" x="' + q[0] + '" y="' + (q[1] + 4) + '" text-anchor="' + a[2] + '">' + a[1] + '</text>'; });
    for (i = 0; i < b.nb; i++) {
      var a1 = -180 + i * bw, a2 = a1 + bw, wedge = function (r) { if (r <= 0) return ""; var p1 = pt(r, a1), p2 = pt(r, a2); return "M" + cx + " " + cy + "L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + "A" + r.toFixed(1) + " " + r.toFixed(1) + " 0 0 0 " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + "Z"; };
      if (tot[i]) s += '<path class="miss" d="' + wedge(rad(tot[i])) + '"/>';
      if (b.made[i]) s += '<path class="made" d="' + wedge(rad(b.made[i] * kf(i))) + '"/>';
    }
    return card(T.angT, ctrls, svg(s) + legend, T.angC);
  }
  function cTime(rows) {
    var ord = rows.slice().reverse(), n = ord.length, w = Math.min(50, Math.max(10, Math.floor(n / 5))), ax = axes(1, Math.max(2, n), 0, 100, T.xThrow, T.yPct, ticksFor(n).filter(function (x) { return x >= 1 || x === 0; })), t = ax.svg, pts = [], i, acc = 0, all = ord.filter(function (r) { return r.made; }).length / n * 100;
    t += '<line class="avg" x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + ax.sy(all) + '" y2="' + ax.sy(all) + '"/>';
    for (i = 0; i < n; i++) { acc += ord[i].made ? 1 : 0; if (i >= w) acc -= ord[i - w].made ? 1 : 0; if (i >= w - 1) pts.push(ax.sx(i + 1).toFixed(1) + "," + ax.sy(acc / w * 100).toFixed(1)); }
    t += '<polyline class="fit" points="' + pts.join(" ") + '"/>';
    return card(T.timeT, "", svg(t), T.timeC + " (" + (eu ? "leihoa: " : "window: ") + w + ")");
  }

  /* ---------- draw everything ---------- */
  function draw() {
    var rows = ALL;
    var bar = '<div class="chartbar"><span class="sel">' + T.viewL + '</span>' + seg("pview", [["px", T.pPx], ["win", T.pWin]], S.pview) + '</div>';
    if (rows.length < 5) { box.innerHTML = '<p class="count-status">' + T.few + '</p>'; return; }
    box.innerHTML = cSummary(rows) + bar + cPos(rows) + cHeat(rows) + cDist(rows) + cReg(rows) + cSpeed(rows) + cSvd(rows) + cAngle(rows) + cTime(rows);
  }
  box.addEventListener("click", function (e) { var b = e.target.closest("[data-set]"); if (!b) return; var p = b.getAttribute("data-set").split(":"); S[p[0]] = p[1]; draw(); });
  box.addEventListener("change", function (e) { var s = e.target.closest("[data-sel]"); if (!s) return; S.bins[s.getAttribute("data-sel")] = +s.value; draw(); });

  function load() {
    if (!window.ebiyaCounter) return;
    MINE = window.ebiyaCounter.mine ? window.ebiyaCounter.mine() : [];
    window.ebiyaCounter.shots().then(function (rows) {
      ALL = rows;
      if (!rows.length) { box.innerHTML = '<p class="count-status">' + T.none + '</p>'; return; }
      draw();
    }).catch(function () { if (!ALL.length) box.innerHTML = '<p class="count-status">' + T.err + '</p>'; });
  }
  load();
  setInterval(function () { var a = document.activeElement; if (a && box.contains(a) && a.tagName === "SELECT") return; load(); }, 60000);
})();
