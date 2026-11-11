/* A small red lauburu that wanders around the page on its own.
   It drifts in smooth curves, rests now and then, stays inside the window
   and ignores the mouse completely. Off for people who prefer reduced motion. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SIZE = 28;            // px
  var CRUISE = 26;          // px per second while walking
  var MARGIN = 60;          // distance from the window edge where it starts turning back

  var src = document.currentScript.src.replace("js/follower.js", "img/favicon.svg");
  var el = document.createElement("div");
  el.className = "follower on";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<img src="' + src + '" alt="">';
  document.body.appendChild(el);

  var x = window.innerWidth * (0.55 + Math.random() * 0.35);
  var y = window.innerHeight * (0.3 + Math.random() * 0.4);
  var heading = Math.random() * Math.PI * 2;
  var turn = 0, speed = 0, spin = 0, angle = 0;
  var resting = false, until = performance.now() + 4000 + Math.random() * 6000;
  var last = performance.now();

  function angleDiff(a, b) {
    var d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    if (now > until) {
      resting = !resting;
      until = now + (resting ? 2500 + Math.random() * 4000 : 7000 + Math.random() * 10000);
    }

    // smooth wandering: the turning rate itself changes slowly
    turn += (Math.random() - 0.5) * 3 * dt;
    turn *= 1 - Math.min(dt * 0.8, 1);
    heading += turn * dt * 2;

    // steer back toward the middle when close to an edge
    var w = window.innerWidth, h = window.innerHeight;
    if (x < MARGIN || x > w - MARGIN - SIZE || y < MARGIN || y > h - MARGIN - SIZE) {
      var toCenter = Math.atan2(h / 2 - y, w / 2 - x);
      heading -= angleDiff(heading, toCenter) * Math.min(dt * 2.5, 1);
    }

    var target = resting ? 0 : CRUISE;
    speed += (target - speed) * Math.min(dt * 1.5, 1);
    x += Math.cos(heading) * speed * dt;
    y += Math.sin(heading) * speed * dt;
    x = Math.max(4, Math.min(w - SIZE - 4, x));
    y = Math.max(4, Math.min(h - SIZE - 4, y));

    spin = 8 + speed * 2.2;   // degrees per second: slow when resting, faster when walking
    angle += spin * dt;
    el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + angle.toFixed(1) + "deg)";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
