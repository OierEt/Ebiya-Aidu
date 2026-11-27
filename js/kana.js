/* Kana practice charts (languages page): hide the romaji and tap a character to check it. */
(function () {
  document.querySelectorAll(".kana-toggle").forEach(function (btn) {
    var grid = document.getElementById(btn.getAttribute("data-target"));
    if (!grid) return;
    btn.addEventListener("click", function () {
      var quiz = grid.classList.toggle("quiz");
      grid.querySelectorAll(".c.show").forEach(function (c) { c.classList.remove("show"); });
      btn.textContent = btn.getAttribute(quiz ? "data-show" : "data-hide");
      btn.setAttribute("aria-pressed", quiz ? "true" : "false");
    });
    grid.addEventListener("click", function (e) {
      var c = e.target.closest(".c");
      if (c && grid.classList.contains("quiz")) c.classList.toggle("show");
    });
  });
})();
