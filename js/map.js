/* Zoom and pan for the travel map on the About page (.travelmap). Buttons + double click + drag + pinch; mouse wheel only with Ctrl/Cmd. */
(function () {
  var fig = document.querySelector(".travelmap");
  if (!fig) return;
  var svg = fig.querySelector("svg");
  var vb = svg.viewBox.baseVal, W0 = vb.width, H0 = vb.height;
  var MAXZ = 14, x = 0, y = 0, w = W0, h = H0;
  function apply() {
    w = Math.max(W0 / MAXZ, Math.min(W0, w)); h = w * H0 / W0;
    x = Math.max(0, Math.min(W0 - w, x)); y = Math.max(0, Math.min(H0 - h, y));
    svg.setAttribute("viewBox", x + " " + y + " " + w + " " + h);
    svg.style.setProperty("--pinscale", (w / W0).toFixed(3));
    fig.classList.toggle("zoomed", w < W0 - 0.5);
  }
  function zoomAt(f, cx, cy) { /* f > 1 zooms in; cx, cy in 0..1 of the box */
    var nw = Math.max(W0 / MAXZ, Math.min(W0, w / f)), nh = nw * H0 / W0;
    x += (w - nw) * cx; y += (h - nh) * cy; w = nw; h = nh; apply();
  }
  var bar = document.createElement("div");
  bar.className = "mapzoom";
  [["+", fig.dataset.zi, function () { zoomAt(1.6, .5, .5); }], ["−", fig.dataset.zo, function () { zoomAt(1 / 1.6, .5, .5); }], ["↺", fig.dataset.zr, function () { x = 0; y = 0; w = W0; apply(); }]].forEach(function (b) {
    var btn = document.createElement("button"); btn.type = "button"; btn.textContent = b[0]; btn.setAttribute("aria-label", b[1]); btn.title = b[1]; btn.addEventListener("click", b[2]); bar.appendChild(btn);
  });
  fig.insertBefore(bar, svg);
  svg.addEventListener("wheel", function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault(); var r = svg.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.25 : 1 / 1.25, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }, { passive: false });
  svg.addEventListener("dblclick", function (e) {
    var r = svg.getBoundingClientRect(); zoomAt(2, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  var pts = {}, last = null;
  function dist() { var k = Object.keys(pts); if (k.length < 2) return 0; var a = pts[k[0]], b = pts[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
  svg.addEventListener("pointerdown", function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; last = dist(); try { svg.setPointerCapture(e.pointerId); } catch (_) {} });
  svg.addEventListener("pointermove", function (e) {
    var p = pts[e.pointerId]; if (!p) return;
    var r = svg.getBoundingClientRect(), n = Object.keys(pts).length;
    if (n >= 2) {
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var d = dist(); if (last && d) { var k = Object.keys(pts), a = pts[k[0]], b = pts[k[1]]; zoomAt(d / last, ((a.x + b.x) / 2 - r.left) / r.width, ((a.y + b.y) / 2 - r.top) / r.height); } last = d;
    } else if (fig.classList.contains("zoomed")) {
      x -= (e.clientX - p.x) * w / r.width; y -= (e.clientY - p.y) * h / r.height; pts[e.pointerId] = { x: e.clientX, y: e.clientY }; apply();
    }
  });
  function up(e) { delete pts[e.pointerId]; last = null; }
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  apply();
})();
