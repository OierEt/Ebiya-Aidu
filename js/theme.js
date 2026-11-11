/* Style switcher: remembers the chosen look in this browser.
   Loaded in <head> so the saved style is applied before the page paints. */
(function () {
  var KEY = "siteTheme", ok = ["constructivist", "coast", "notebook", "archive"];
  var t = null;
  try { t = localStorage.getItem(KEY); } catch (e) {}
  if (ok.indexOf(t) < 0) t = "constructivist";
  function apply(name) {
    if (name === "constructivist") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", name);
  }
  apply(t);
  document.addEventListener("DOMContentLoaded", function () {
    var btns = [].slice.call(document.querySelectorAll("[data-theme-set]"));
    function mark() { btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === t)); }); }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        t = b.getAttribute("data-theme-set");
        apply(t);
        try { localStorage.setItem(KEY, t); } catch (e) {}
        mark();
      });
    });
    mark();
  });
})();
