/* Play page: shows the shared basket counter (from Supabase) and this browser's own score. */
(function () {
  var eu = document.documentElement.lang === "eu";
  var fmt = function (n) { return Number(n).toLocaleString(eu ? "eu" : "en"); };
  var $ = function (id) { return document.getElementById(id); };
  try {
    var mine = JSON.parse(localStorage.getItem("lauburuScore") || "null") || { two: 0, three: 0 };
    $("my-baskets").textContent = fmt((mine.two | 0) + (mine.three | 0));
    $("my-points").textContent = fmt((mine.two | 0) * 2 + (mine.three | 0) * 3);
  } catch (e) {}
  function load() {
    if (!window.ebiyaCounter) return;
    window.ebiyaCounter.totals().then(function (t) {
      $("total-baskets").textContent = fmt(t.baskets || 0);
      $("total-points").textContent = fmt(t.points || 0);
      $("count-status").textContent = "";
    }).catch(function () {
      $("count-status").textContent = eu ? "Kontagailu partekatua ez dago erabilgarri orain." : "The shared counter is not available right now.";
    });
  }
  load();
  setInterval(load, 30000);
})();
