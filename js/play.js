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
      var acc = t.shots ? Math.round((t.baskets || 0) / t.shots * 100) : null;
      $("count-status").textContent = acc === null ? "" : (eu ? fmt(t.shots) + " jaurtiketa, " + acc + "% sartuta" : fmt(t.shots) + " throws, " + acc + "% scored");
    }).catch(function () {
      $("count-status").textContent = eu ? "Kontagailu partekatua atseden hartzen ari da edo ez dago eskuragarri orain (doako datu-basea lo egiten da inor ez dabilenean). Saiatu berriro minutu batzuk barru." : "The shared counter is resting or unreachable right now (the free database sleeps when nobody uses it). Try again in a few minutes.";
    });
  }
  load();
  setInterval(load, 30000);
})();
