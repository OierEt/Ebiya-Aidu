/* Play page: shows the shared basket counter (from Supabase) and this browser's own score. */
(function () {
  var eu = document.documentElement.lang === "eu";
  var fmt = function (n) { return Number(n).toLocaleString(eu ? "eu" : "en"); };
  var $ = function (id) { return document.getElementById(id); };
  function showMine() {
  try {
    var mine = JSON.parse(localStorage.getItem("lauburuScore") || "null") || { two: 0, three: 0 };
    $("my-two").textContent = fmt(mine.two | 0);
    $("my-three").textContent = fmt(mine.three | 0);
    $("my-points").textContent = fmt((mine.two | 0) * 2 + (mine.three | 0) * 3);
  } catch (e) {}
  }
  showMine();
  window.addEventListener("lauburu-reset", showMine);
  function load() {
    if (!window.ebiyaCounter) return;
    window.ebiyaCounter.stats().then(function (t) {
      var twos = t.twos || 0, threes = t.threes || 0, shots = t.shots || 0, made = twos + threes;
      $("total-two").textContent = fmt(twos);
      $("total-three").textContent = fmt(threes);
      $("total-points").textContent = fmt(twos * 2 + threes * 3);
      $("count-status").textContent = shots ? (eu ? fmt(shots) + " jaurtiketa, " + Math.round(made / shots * 100) + "% sartuta" : fmt(shots) + " throws, " + Math.round(made / shots * 100) + "% scored") : "";
    }).catch(function () {
      $("count-status").textContent = eu ? "Kontagailu partekatua atseden hartzen ari da edo ez dago eskuragarri orain (doako datu-basea lo egiten da inor ez dabilenean). Saiatu berriro minutu batzuk barru." : "The shared counter is resting or unreachable right now (the free database sleeps when nobody uses it). Try again in a few minutes.";
    });
  }
  load();
  setInterval(load, 30000);
})();
