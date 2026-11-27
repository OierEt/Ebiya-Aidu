/* Japanese practice (languages page): flashcards built from the vocabulary tables
   and a random sentence generator. Plain JS, no libraries. */
(function () {
  var root = document.getElementById("practice");
  if (!root) return;
  var eu = root.getAttribute("data-lang") === "eu";
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- flashcards ---------- */
  var deck = [].map.call(document.querySelectorAll("#vocabulary tbody tr[data-cat]"), function (r) {
    return { cat: r.getAttribute("data-cat"), jp: r.querySelector(".jp"), rom: r.querySelector(".rom").textContent, mean: r.querySelector(".mean").textContent };
  });
  var front = document.getElementById("fc-front"), back = document.getElementById("fc-back");
  var selCat = document.getElementById("fc-cat"), selDir = document.getElementById("fc-dir");
  var cur = null;

  function plainJp(card) {
    var c = card.jp.cloneNode(true);
    [].forEach.call(c.querySelectorAll("rt"), function (x) { x.remove(); });
    return c.innerHTML;
  }
  function nextCard() {
    var pool = deck.filter(function (c) { return selCat.value === "all" || c.cat === selCat.value; });
    if (!pool.length) return;
    var c = pick(pool);
    if (pool.length > 1) { var guard = 0; while (c === cur && guard++ < 20) c = pick(pool); }
    cur = c;
    back.hidden = true;
    if (selDir.value === "jm") {
      front.setAttribute("lang", "ja"); front.innerHTML = plainJp(c);
      back.removeAttribute("lang"); back.innerHTML = "";
      var a = document.createElement("div"); a.className = "fc-jp"; a.setAttribute("lang", "ja"); a.innerHTML = c.jp.innerHTML; back.appendChild(a);
      var r = document.createElement("div"); r.className = "fc-r"; r.textContent = c.rom; back.appendChild(r);
      var m = document.createElement("div"); m.className = "fc-m"; m.textContent = c.mean; back.appendChild(m);
    } else {
      front.removeAttribute("lang"); front.textContent = c.mean;
      back.innerHTML = "";
      var a2 = document.createElement("div"); a2.className = "fc-jp"; a2.setAttribute("lang", "ja"); a2.innerHTML = c.jp.innerHTML; back.appendChild(a2);
      var r2 = document.createElement("div"); r2.className = "fc-r"; r2.textContent = c.rom; back.appendChild(r2);
    }
  }
  document.getElementById("fc-ans").addEventListener("click", function () { back.hidden = false; });
  document.getElementById("fc-next").addEventListener("click", nextCard);
  selCat.addEventListener("change", nextCard);
  selDir.addEventListener("change", nextCard);
  nextCard();

  /* ---------- random sentences ---------- */
  var FREQ = [
    { jp: "毎朝、", rom: "maiasa, ", pre: "", suf: " every morning", eu: "goizero" },
    { jp: "毎晩、", rom: "maiban, ", pre: "", suf: " every night", eu: "gauero" },
    { jp: "毎週、", rom: "maishū, ", pre: "", suf: " every week", eu: "astero" },
    { jp: "時々", rom: "tokidoki ", pre: "sometimes ", suf: "", eu: "batzuetan" },
    { jp: "よく", rom: "yoku ", pre: "often ", suf: "", eu: "askotan" },
    { jp: "いつも", rom: "itsumo ", pre: "always ", suf: "", eu: "beti" }
  ];
  var DRINK = [{ jp: "水", rom: "mizu", en: "water", eu: "ura" }, { jp: "お茶", rom: "ocha", en: "tea", eu: "tea" }];
  var SPORT = [
    { jp: "ヨガ", rom: "yoga", en: "do yoga", eu: "yoga egiten" },
    { jp: "柔道", rom: "jūdō", en: "do judo", eu: "judoa egiten" },
    { jp: "バレーボール", rom: "barēbōru", en: "play volleyball", eu: "boleibolean jolasten" },
    { jp: "バスケットボール", rom: "basukettobōru", en: "play basketball", eu: "saskibaloian jolasten" },
    { jp: "野球", rom: "yakyū", en: "play baseball", eu: "beisbolean jolasten" },
    { jp: "サッカー", rom: "sakkā", en: "play soccer", eu: "futbolean jolasten" }
  ];
  var WHEN = [
    { jp: "土曜日に", rom: "doyōbi ni", en: "on Saturday", eu: "larunbatean" },
    { jp: "日曜日に", rom: "nichiyōbi ni", en: "on Sunday", eu: "igandean" },
    { jp: "週末に", rom: "shūmatsu ni", en: "on the weekend", eu: "asteburuan" }
  ];
  var WITH = [null, { jp: "友達と", rom: "tomodachi to", en: "with a friend", eu: "lagun batekin" }, { jp: "家族と", rom: "kazoku to", en: "with family", eu: "familiarekin" }];
  var HOW = [null, { jp: "地下鉄で", rom: "chikatetsu de", en: "by subway", eu: "metroz" }];
  var PLACE = [{ jp: "ホテル", rom: "hoteru", en: "the hotel", eu: "hotelera" }, { jp: "空港", rom: "kūkō", en: "the airport", eu: "aireportura" }];
  var DEM = [
    { jp: "これ", rom: "kore", en: "this", eu: "hau" },
    { jp: "それ", rom: "sore", en: "that", eu: "hori" },
    { jp: "あれ", rom: "are", en: "that one over there", eu: "hura" }
  ];
  var DEMN = [
    { jp: "この", rom: "kono", en: "this", enx: "", eu: "hau" },
    { jp: "その", rom: "sono", en: "that", enx: "", eu: "hori" },
    { jp: "あの", rom: "ano", en: "that", enx: " over there", eu: "hura" }
  ];
  var ADJ = {
    "new": { jp: "新しい", rom: "atarashii", en: "new", eu: "berria" },
    old: { jp: "古い", rom: "furui", en: "old", eu: "zaharra" },
    exp: { jp: "高い", rom: "takai", en: "expensive", eu: "garestia" },
    cheap: { jp: "安い", rom: "yasui", en: "cheap", eu: "merkea" },
    fun: { jp: "おもしろい", rom: "omoshiroi", en: "interesting", eu: "interesgarria" },
    cool: { jp: "かっこいい", rom: "kakkoii", en: "cool", eu: "dotorea" },
    pretty: { jp: "きれい", rom: "kirei", en: "pretty", eu: "ederra" }
  };
  var NOUN = [
    { jp: "ホテル", rom: "hoteru", en: "hotel", eu: "hotel", adj: ["new", "old", "exp", "cheap", "pretty"] },
    { jp: "空港", rom: "kūkō", en: "airport", eu: "aireportu", adj: ["new", "old", "pretty"] },
    { jp: "地下鉄", rom: "chikatetsu", en: "subway", eu: "metro", adj: ["new", "old", "cheap", "pretty"] },
    { jp: "映画", rom: "eiga", en: "movie", eu: "film", adj: ["new", "old", "fun", "cool"] },
    { jp: "音楽", rom: "ongaku", en: "music", eu: "musika", adj: ["new", "old", "fun", "cool"] },
    { jp: "動画", rom: "dōga", en: "video", eu: "bideo", adj: ["new", "old", "fun", "cool"] }
  ];
  var THING_ADJ = ["new", "old", "exp", "cheap", "fun", "cool", "pretty"];

  function make(q) {
    var kind = pick(["drink", "go", "sport", "dem", "noun"]);
    var f = pick(FREQ), jp, rom, enS, euS;
    if (kind === "drink") {
      var d = pick(DRINK);
      jp = f.jp + d.jp + "を飲みます"; rom = f.rom + d.rom + " o nomimasu";
      enS = f.pre + "drink " + d.en + f.suf;
      euS = f.eu + " " + d.eu + " edaten" + (q ? " al duzu" : " dut");
    } else if (kind === "go") {
      var w = pick(WHEN), wi = pick(WITH), h = pick(HOW), p = pick(PLACE);
      jp = w.jp + (wi ? wi.jp : "") + (h ? h.jp : "") + p.jp + "へ行きます";
      rom = w.rom + " " + (wi ? wi.rom + " " : "") + (h ? h.rom + " " : "") + p.rom + " e ikimasu";
      enS = "go to " + p.en + (h ? " " + h.en : "") + (wi ? " " + wi.en : "") + " " + w.en;
      euS = w.eu + " " + (wi ? wi.eu + " " : "") + (h ? h.eu + " " : "") + p.eu + " joaten" + (q ? " al zara" : " naiz");
      f = null;
    } else if (kind === "sport") {
      var s = pick(SPORT);
      jp = f.jp + s.jp + "をします"; rom = f.rom + s.rom + " o shimasu";
      enS = f.pre + s.en + f.suf;
      euS = f.eu + " " + s.eu + (q ? " al duzu" : " dut");
    } else if (kind === "dem") {
      var dm = pick(DEM), a = ADJ[pick(THING_ADJ)];
      jp = dm.jp + "は" + a.jp + "です"; rom = dm.rom + " wa " + a.rom + " desu";
      var out = { jp: jp + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
        en: q ? "Is " + dm.en + " " + a.en + "?" : cap(dm.en) + " is " + a.en + ".",
        eu: cap(dm.eu + " " + a.eu + (q ? " al da?" : " da.")) };
      return out;
    } else {
      var n = pick(NOUN), dn = pick(DEMN), a2 = ADJ[pick(n.adj)];
      jp = dn.jp + n.jp + "は" + a2.jp + "です"; rom = dn.rom + " " + n.rom + " wa " + a2.rom + " desu";
      var thing = dn.en + " " + n.en + dn.enx;
      return { jp: jp + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
        en: q ? "Is " + thing + " " + a2.en + "?" : cap(thing) + " is " + a2.en + ".",
        eu: cap(n.eu + " " + dn.eu + " " + a2.eu + (q ? " al da?" : " da.")) };
    }
    var pre = f ? f.pre : "";
    return { jp: (f ? "" : "") + (f ? jp : jp) + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
      en: q ? "Do you " + enS + "?" : "I " + enS + ".",
      eu: cap(euS) + (q ? "?" : ".") };
  }

  var gjp = document.getElementById("gen-jp"), grom = document.getElementById("gen-rom"), gtr = document.getElementById("gen-tr");
  function newSentence() {
    var s = make(Math.random() < 0.3);
    gjp.textContent = s.jp; grom.textContent = s.rom; gtr.textContent = eu ? s.eu : s.en;
    grom.hidden = true; gtr.hidden = true;
  }
  document.getElementById("gen-new").addEventListener("click", newSentence);
  document.getElementById("gen-rom-b").addEventListener("click", function () { grom.hidden = !grom.hidden; });
  document.getElementById("gen-tr-b").addEventListener("click", function () { gtr.hidden = !gtr.hidden; });
  newSentence();
})();
