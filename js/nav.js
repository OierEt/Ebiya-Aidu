/* Shows which sub-section you are reading: highlights it in the sticky
   sub-menu and puts it in the browser tab title ("Research · Projects · Site"). */
(function () {
  var toc = document.querySelector(".toc");
  if (toc) toc.classList.add("js");
  var links = [].slice.call(document.querySelectorAll(".subnav a, .toc a"));
  if (!links.length) return;

  var parts = document.title.split(" · ");
  var page = parts[0];
  var site = parts[parts.length - 1];

  var items = links.map(function (a) {
    return { a: a, el: document.querySelector(a.getAttribute("href")), label: a.textContent.trim() };
  }).filter(function (i) { return i.el; });
  if (!items.length) return;

  var current = null;
  function show(i) {
    links.forEach(function (l) { l.removeAttribute("aria-current"); });
    i.a.setAttribute("aria-current", "true");
    if (toc) {
      var li = i.a.parentNode, g = li.getAttribute("data-group") || li.getAttribute("data-self");
      [].forEach.call(toc.querySelectorAll("li.l2"), function (x) {
        x.classList.toggle("open", !!g && x.getAttribute("data-group") === g);
      });
    }
    var same = i.label.toLowerCase() === page.toLowerCase();
    document.title = (same ? page : i.label + " · " + page) + " · " + site;
  }
  function update() {
    var line = window.innerHeight * 0.35, cur = items[0];
    items.forEach(function (i) { if (i.el.getBoundingClientRect().top <= line) cur = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = items[items.length - 1];
    if (cur !== current) { current = cur; show(cur); }
  }
  var queued = false;
  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
