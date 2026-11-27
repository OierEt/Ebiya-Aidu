/* Kana practice charts (languages page): hide the romaji and tap a character to check it. */
(function () {
  document.querySelectorAll(".kana-toggle").forEach(function (btn) {
    var tg = btn.getAttribute("data-target"); if (!tg) return;
    function find() { return tg.split(" ").map(function (id) { return document.getElementById(id); }).filter(Boolean); }
    btn.addEventListener("click", function () {
      var grids = find(); if (!grids.length) return;
      var quiz = !grids[0].classList.contains("quiz");
      grids.forEach(function (g) {
        g.classList.toggle("quiz", quiz);
        g.querySelectorAll(".c.show").forEach(function (c) { c.classList.remove("show"); });
      });
      btn.textContent = btn.getAttribute(quiz ? "data-show" : "data-hide");
      btn.setAttribute("aria-pressed", quiz ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      var c = e.target.closest(".c"), grid = c && c.parentNode;
      if (c && grid && find().indexOf(grid) > -1 && grid.classList.contains("quiz")) c.classList.toggle("show");
    });
  });
})();
