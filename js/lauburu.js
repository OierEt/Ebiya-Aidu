/* The lauburu: a small red mascot that wanders around the window on its own.
   You can grab it with the pointer and throw it into the basket on the right.
   Shots from far away count 3, closer shots count 2. Score is kept in this browser.
   With "reduce motion" it never moves by itself. */
(function () {
  // With "reduce motion" on, the lauburu stays still on its own but can still be grabbed and thrown.
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var eu = document.documentElement.lang === "eu";
  var TXT = eu
    ? { hint: "Eraman lauburua saskira!", pts: "Puntuak", hide: "Ezkutatu", show: "Saskia" }
    : { hint: "Drag the lauburu into the hoop!", pts: "Points", hide: "Hide", show: "Basket" };

  // ---- shared basket counter (Supabase, public key only; see backend/counter-setup.sql) ----
  var DB_URL = "https://cqwblkgghzvonxsazasm.supabase.co";
  var DB_KEY = "sb_publishable_T8zN3tIwPkcfoB3xoUV72g_-3Hi44tz";
  function dbCall(path, options) {
    options = options || {};
    options.headers = options.method === "POST" ? { apikey: DB_KEY, "Content-Type": "application/json" } : { apikey: DB_KEY };
    return fetch(DB_URL + "/rest/v1/" + path, options).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  // Used by js/play.js: resolves to { shots, twos, threes, misses } computed from the shots table
  window.ebiyaCounter = {
    stats: function () { return dbCall("rpc/shot_stats", { method: "POST", body: "{}" }); },
    shots: function () { return dbCall("shots?select=made,points,dist,release_x,release_y,hoop_dx,hoop_dy,angle,speed,speed_raw,flight_ms,vw,vh,touch,created_at&order=id.desc&limit=5000"); }
  };
  // One anonymous record per throw: where from, direction, speed, whether it scored (see backend/shots-setup.sql and shots-update.sql)
  function reportShot(sh, made, points, flightMs) {
    var body = {
      p_made: made, p_points: points, p_dist: Math.round(sh.dist), p_release_x: +sh.x.toFixed(4), p_release_y: +sh.y.toFixed(4),
      p_hoop_dx: Math.round(sh.dx), p_hoop_dy: Math.round(sh.dy), p_angle: Math.round(sh.angle), p_speed: Math.round(sh.speed),
      p_speed_raw: Math.round(sh.raw), p_flight_ms: Math.round(flightMs), p_vw: sh.vw, p_vh: sh.vh, p_touch: sh.touch
    };
    try {
      dbCall("rpc/record_shot", { method: "POST", body: JSON.stringify(body), keepalive: true }).catch(function (e) { console.warn("Throw not saved:", e); });
    } catch (e) {}
  }

  // ---- tuning ----
  var R = 14;               // ball radius (px)
  var CRUISE = 26;          // walking speed (px/s)
  var MARGIN = 60;          // distance from the edge where it turns back
  var GRAVITY = 1500;       // px/s^2
  var BOUNCE = 0.6, FLOOR_BOUNCE = 0.55;
  var MAX_THROW = 2400;     // px/s
  var MIN_SHOT_SPEED = 60;  // px/s: slower releases are drops, not throws, and are not recorded
  var STORE = "lauburuScore", STORE_HIDE = "lauburuHoopHidden";

  // ---- elements ----
  var el = document.createElement("div");
  el.className = "follower on";
  el.setAttribute("aria-hidden", "true");
  // inline SVG (not an image file) so it also works when the page is opened straight from disk
  var arm = '<path d="M50 50 C50 32 52 16 66 16 C78 16 82 30 72 36 C65 40 58 34 62 28"/>';
  el.innerHTML = '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round">' +
    arm + '<g transform="rotate(90 50 50)">' + arm + '</g><g transform="rotate(180 50 50)">' + arm + '</g><g transform="rotate(270 50 50)">' + arm + '</g></svg>';
  document.body.appendChild(el);

  var hoop = document.createElement("div");
  hoop.className = "hoop";
  hoop.setAttribute("aria-hidden", "true");
  hoop.innerHTML = '<div class="board"></div><div class="rim"></div><div class="net"></div><div class="plus"></div>';
  document.body.appendChild(hoop);

  var panel = document.createElement("div");
  panel.className = "score";
  panel.innerHTML = '<div class="score-row"><span class="s2">2&times;<b>0</b></span><span class="s3">3&times;<b>0</b></span>' +
    '<span class="st">' + TXT.pts + ' <b>0</b></span></div><div class="score-hint">' + TXT.hint + '</div>' +
    '<button type="button" class="score-toggle">' + TXT.hide + '</button>';
  document.body.appendChild(panel);
  var board = hoop.querySelector(".board"), rim = hoop.querySelector(".rim"), plus = hoop.querySelector(".plus");
  var toggle = panel.querySelector(".score-toggle");

  // ---- score ----
  var score = { two: 0, three: 0 };
  try { var saved = JSON.parse(localStorage.getItem(STORE) || "null"); if (saved) score = { two: saved.two | 0, three: saved.three | 0 }; } catch (e) {}
  function drawScore() {
    panel.querySelector(".s2 b").textContent = score.two;
    panel.querySelector(".s3 b").textContent = score.three;
    panel.querySelector(".st b").textContent = score.two * 2 + score.three * 3;
  }
  drawScore();

  var played = false;
  try { played = localStorage.getItem("lauburuPlayed") === "1"; } catch (e) {}
  document.documentElement.classList.toggle("lauburu-played", played);

  var hidden = false;
  try { hidden = localStorage.getItem(STORE_HIDE) === "1"; } catch (e) {}
  function applyHidden() {
    document.documentElement.classList.toggle("hoop-hidden", hidden);
    toggle.textContent = hidden ? TXT.show : TXT.hide;
  }
  toggle.addEventListener("click", function () {
    hidden = !hidden;
    try { localStorage.setItem(STORE_HIDE, hidden ? "1" : "0"); } catch (e) {}
    applyHidden();
  });
  applyHidden();

  // ---- state ----
  var cx = window.innerWidth * (0.45 + Math.random() * 0.3);
  var cy = window.innerHeight * (0.3 + Math.random() * 0.4);
  var vx = 0, vy = 0;
  var heading = Math.random() * Math.PI * 2, turn = 0, speed = 0, angle = 0;
  var mode = "wander";              // wander | held | flying
  var resting = false, until = performance.now() + 4000 + Math.random() * 6000;
  var last = performance.now();
  var track = [];                   // recent pointer samples while held
  var releaseDist = 0, scored = false, flyStart = 0, calmSince = 0;
  var shot = null, ptype = "mouse";   // data of the throw in the air, sent once

  function angleDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }
  function rect(node) { return node.getBoundingClientRect(); }

  // ---- grabbing ----
  var grabDX = 0, grabDY = 0;
  el.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    // grabbing the ball again: a throw that was in the air for a while without scoring counts as a miss
    if (shot && !shot.sent && performance.now() - flyStart > 600) sendShot(false, 0);
    mode = "held"; ptype = e.pointerType; shot = null;
    if (!played) { played = true; document.documentElement.classList.add("lauburu-played"); try { localStorage.setItem("lauburuPlayed", "1"); } catch (err) {} }
    grabDX = cx - e.clientX; grabDY = cy - e.clientY;
    track = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    el.classList.add("held");
    vx = vy = 0;
  });
  el.addEventListener("pointermove", function (e) {
    if (mode !== "held") return;
    cx = e.clientX + grabDX; cy = e.clientY + grabDY;
    var now = performance.now();
    track.push({ t: now, x: e.clientX, y: e.clientY });
    while (track.length > 2 && now - track[0].t > 90) track.shift();
  });
  function release() {
    if (mode !== "held") return;
    el.classList.remove("held");
    var a = track[0], b = track[track.length - 1], dt = (b.t - a.t) / 1000;
    if (dt > 0.01) { vx = (b.x - a.x) / dt; vy = (b.y - a.y) / dt; } else { vx = vy = 0; }
    var s = Math.hypot(vx, vy), rawSpeed = s;
    if (s > MAX_THROW) { vx *= MAX_THROW / s; vy *= MAX_THROW / s; }
    var r = rect(rim);
    releaseDist = Math.hypot(r.left + r.width / 2 - cx, r.top - cy);
    scored = false; mode = "flying"; flyStart = performance.now(); calmSince = 0;
    shot = null;
    if (!document.documentElement.classList.contains("hoop-hidden") && Math.hypot(vx, vy) >= MIN_SHOT_SPEED) {
      shot = { x: cx / window.innerWidth, y: cy / window.innerHeight, dx: r.left + r.width / 2 - cx, dy: r.top - cy, dist: releaseDist,
        angle: Math.atan2(-vy, vx) * 180 / Math.PI, speed: Math.hypot(vx, vy), raw: rawSpeed, vw: window.innerWidth, vh: window.innerHeight,
        touch: ptype === "touch", sent: false };
    }
  }
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);

  // ---- scoring ----
  function sendShot(made, points) {
    if (!shot) return;
    if (shot.sent) return;
    shot.sent = true;
    reportShot(shot, made, points, performance.now() - flyStart);
  }
  function addPoints(three) {
    if (three) score.three++; else score.two++;
    sendShot(true, three ? 3 : 2);
    try { localStorage.setItem(STORE, JSON.stringify(score)); } catch (e) {}
    drawScore();
    panel.classList.remove("flash"); void panel.offsetWidth; panel.classList.add("flash");
    plus.textContent = three ? "+3" : "+2";
    plus.classList.remove("go"); void plus.offsetWidth; plus.classList.add("go");
  }

  // ---- physics while flying ----
  function fly(dt, now) {
    var px = cx, py = cy;
    vy += GRAVITY * dt;
    vx *= 1 - 0.12 * dt;
    cx += vx * dt; cy += vy * dt;
    var w = window.innerWidth, h = window.innerHeight;

    if (cx < R) { cx = R; vx = -vx * BOUNCE; }
    if (cx > w - R) { cx = w - R; vx = -vx * BOUNCE; }
    if (cy < R) { cy = R; vy = -vy * BOUNCE; }
    if (cy > h - R) {
      cy = h - R; vy = -vy * FLOOR_BOUNCE; vx *= 0.88;
      if (Math.abs(vy) < 90) vy = 0;
    }

    if (!document.documentElement.classList.contains("hoop-hidden")) {
      var b = rect(board), r = rect(rim);
      var rimY = r.top + r.height / 2, rimL = r.left, rimR = r.right;
      // backboard (a vertical wall on the right of the rim)
      if (cx + R > b.left && cx - R < b.right && cy > b.top && cy < b.bottom) {
        cx = b.left - R; vx = -Math.abs(vx) * BOUNCE;
      }
      // front edge of the rim
      var dx = cx - rimL, dy = cy - rimY, d = Math.hypot(dx, dy);
      if (d < R + 2 && d > 0.001) {
        var nx = dx / d, ny = dy / d, dot = vx * nx + vy * ny;
        if (dot < 0) { vx -= (1 + BOUNCE) * dot * nx; vy -= (1 + BOUNCE) * dot * ny; }
        cx = rimL + nx * (R + 2); cy = rimY + ny * (R + 2);
      }
      // basket: centre crosses the rim line going down, inside the opening
      if (!scored && py < rimY && cy >= rimY && vy > 0 && cx > rimL + 3 && cx < rimR - 2) {
        scored = true;
        addPoints(releaseDist > 0.3 * Math.hypot(w, h));
        vx *= 0.35; vy *= 0.7;      // the net slows it down
      }
      if (cy < rimY - 50) scored = false;   // allow another score on the next shot
    }

    // done flying? it lies on the floor, or has been in the air too long
    var onFloor = cy >= h - R - 1 && Math.abs(vx) < 30 && vy === 0;
    calmSince = onFloor ? (calmSince || now) : 0;
    if ((calmSince && now - calmSince > 1500) || now - flyStart > 14000) {
      sendShot(false, 0);   // it never went in
      mode = "wander"; speed = 0; resting = true; until = now + 1500;
      heading = Math.random() * Math.PI * 2;
    }
  }

  // ---- wandering ----
  function wander(dt, now) {
    if (calm) { speed = 0; return; }
    if (now > until) {
      resting = !resting;
      until = now + (resting ? 2500 + Math.random() * 4000 : 7000 + Math.random() * 10000);
    }
    turn += (Math.random() - 0.5) * 3 * dt;
    turn *= 1 - Math.min(dt * 0.8, 1);
    heading += turn * dt * 2;

    var w = window.innerWidth, h = window.innerHeight;
    if (cx < MARGIN || cx > w - MARGIN || cy < MARGIN || cy > h - MARGIN) {
      var toCenter = Math.atan2(h / 2 - cy, w / 2 - cx);
      heading -= angleDiff(heading, toCenter) * Math.min(dt * 2.5, 1);
    }
    speed += ((resting ? 0 : CRUISE) - speed) * Math.min(dt * 1.5, 1);
    cx += Math.cos(heading) * speed * dt;
    cy += Math.sin(heading) * speed * dt;
    cx = Math.max(R + 4, Math.min(w - R - 4, cx));
    cy = Math.max(R + 4, Math.min(h - R - 4, cy));
    angle += (8 + speed * 2.2) * dt;
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (mode === "wander") wander(dt, now);
    else if (mode === "flying") { fly(dt, now); angle += (vx / 3) * dt; }
    else angle += 240 * dt;       // held: spins excitedly
    el.style.transform = "translate(" + (cx - 22).toFixed(1) + "px," + (cy - 22).toFixed(1) + "px) rotate(" + angle.toFixed(1) + "deg)";
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize", function () {
    cx = Math.min(cx, window.innerWidth - R); cy = Math.min(cy, window.innerHeight - R);
  });
  requestAnimationFrame(frame);
})();
