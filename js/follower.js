/* A small red lauburu that trails the mouse pointer and spins as it moves.
   Disabled on touch screens and for people who prefer reduced motion. */
(function () {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var src = document.currentScript.src.replace("js/follower.js", "img/favicon.svg");
  var el = document.createElement("div");
  el.className = "follower";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<img src="' + src + '" alt="">';
  document.body.appendChild(el);

  var tx = 0, ty = 0, x = 0, y = 0, rot = 0, running = false, started = false;
  var OFFSET = 16, EASE = 0.14;

  window.addEventListener("mousemove", function (e) {
    tx = e.clientX + OFFSET;
    ty = e.clientY + OFFSET;
    if (!started) { x = tx; y = ty; started = true; el.classList.add("on"); }
    if (!running) { running = true; requestAnimationFrame(tick); }
  });
  document.addEventListener("mouseleave", function () { el.classList.remove("on"); started = false; });

  function tick() {
    var dx = tx - x, dy = ty - y;
    x += dx * EASE;
    y += dy * EASE;
    rot += (Math.abs(dx) + Math.abs(dy)) * 0.35 * (dx >= 0 ? 1 : -1);
    el.style.transform = "translate(" + x + "px," + y + "px) rotate(" + rot + "deg)";
    if (Math.abs(dx) + Math.abs(dy) > 0.3) requestAnimationFrame(tick);
    else running = false;
  }
})();
