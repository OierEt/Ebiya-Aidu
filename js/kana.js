/* Kana practice charts (languages page): hide the romaji and tap a character to check it. */
(function () {
  document.querySelectorAll(".kana-toggle").forEach(function (btn) {
    var tg = btn.getAttribute("data-target"); if (!tg) return;
    var grids = tg.split(" ").map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!grids.length) return;
    btn.addEventListener("click", function () {
      var quiz = !grids[0].classList.contains("quiz");
      grids.forEach(function (g) {
        g.classList.toggle("quiz", quiz);
        g.querySelectorAll(".c.show").forEach(function (c) { c.classList.remove("show"); });
      });
      btn.textContent = btn.getAttribute(quiz ? "data-show" : "data-hide");
      btn.setAttribute("aria-pressed", quiz ? "true" : "false");
    });
    grids.forEach(function (grid) {
      grid.addEventListener("click", function (e) {
        var c = e.target.closest(".c");
        if (c && grid.classList.contains("quiz")) c.classList.toggle("show");
      });
    });
  });
})();
