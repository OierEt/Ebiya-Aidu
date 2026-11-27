/* Japanese practice (languages page): flashcards built from the vocabulary tables
   and a random sentence generator. Plain JS, no libraries. */
(function () {
  /* greeting: hovering a Japanese part highlights its English (or Basque) part and the other way round */
  [].forEach.call(document.querySelectorAll(".hello .hl"), function (el) {
    function mark(on) {
      [].forEach.call(document.querySelectorAll('.hello .hl[data-p="' + el.getAttribute("data-p") + '"]'), function (x) { x.classList.toggle("on", on); });
    }
    el.addEventListener("mouseenter", function () { mark(true); });
    el.addEventListener("mouseleave", function () { mark(false); });
    el.addEventListener("click", function () { mark(!el.classList.contains("on")); });
  });

  var root = document.getElementById("practice");
  if (!root) return;
  /* {kanji|reading} markup -> ruby */
  function R(t) { return t.replace(/\{([^|}]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>"); }
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
      front.setAttribute("lang", "ja"); front.innerHTML = c.jp.innerHTML;
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
    { jp: "{毎朝|まいあさ}、", rom: "maiasa, ", pre: "", suf: " every morning", eu: "goizero" },
    { jp: "{毎晩|まいばん}、", rom: "maiban, ", pre: "", suf: " every night", eu: "gauero" },
    { jp: "{毎週|まいしゅう}、", rom: "maishū, ", pre: "", suf: " every week", eu: "astero" },
    { jp: "{時々|ときどき}", rom: "tokidoki ", pre: "sometimes ", suf: "", eu: "batzuetan" },
    { jp: "よく", rom: "yoku ", pre: "often ", suf: "", eu: "askotan" },
    { jp: "いつも", rom: "itsumo ", pre: "always ", suf: "", eu: "beti" }
  ];
  var DRINK = [{ jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" }, { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" }];
  var SPORT = [
    { jp: "ヨガ", rom: "yoga", en: "do yoga", eu: "yoga egiten", like: "yoga", likeEu: "yoga" },
    { jp: "{柔道|じゅうどう}", rom: "jūdō", en: "do judo", eu: "judoa egiten", like: "judo", likeEu: "judoa" },
    { jp: "バレーボール", rom: "barēbōru", en: "play volleyball", eu: "boleibolean jolasten", like: "volleyball", likeEu: "boleibola" },
    { jp: "バスケットボール", rom: "basukettobōru", en: "play basketball", eu: "saskibaloian jolasten", like: "basketball", likeEu: "saskibaloia" },
    { jp: "{野球|やきゅう}", rom: "yakyū", en: "play baseball", eu: "beisbolean jolasten", like: "baseball", likeEu: "beisbola" },
    { jp: "サッカー", rom: "sakkā", en: "play soccer", eu: "futbolean jolasten", like: "soccer", likeEu: "futbola" }
  ];
  var WHEN = [
    { jp: "{土曜日|どようび}に", rom: "doyōbi ni", en: "on Saturday", eu: "larunbatean" },
    { jp: "{日曜日|にちようび}に", rom: "nichiyōbi ni", en: "on Sunday", eu: "igandean" },
    { jp: "{週末|しゅうまつ}に", rom: "shūmatsu ni", en: "on the weekend", eu: "asteburuan" }
  ];
  var WITH = [null, { jp: "{友達|ともだち}と", rom: "tomodachi to", en: "with a friend", eu: "lagun batekin" }, { jp: "{家族|かぞく}と", rom: "kazoku to", en: "with family", eu: "familiarekin" }];
  var HOW = [null, { jp: "{地下鉄|ちかてつ}で", rom: "chikatetsu de", en: "by subway", eu: "metroz" }];
  var PLACE = [{ jp: "ホテル", rom: "hoteru", en: "the hotel", eu: "hotelera" }, { jp: "{空港|くうこう}", rom: "kūkō", en: "the airport", eu: "aireportura" }];
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
    "new": { jp: "{新|あたら}しい", rom: "atarashii", en: "new", eu: "berria" },
    old: { jp: "{古|ふる}い", rom: "furui", en: "old", eu: "zaharra" },
    exp: { jp: "{高|たか}い", rom: "takai", en: "expensive", eu: "garestia" },
    cheap: { jp: "{安|やす}い", rom: "yasui", en: "cheap", eu: "merkea" },
    fun: { jp: "おもしろい", rom: "omoshiroi", en: "interesting", eu: "interesgarria" },
    cool: { jp: "かっこいい", rom: "kakkoii", en: "cool", eu: "dotorea" },
    pretty: { jp: "きれい", rom: "kirei", en: "pretty", eu: "ederra" },
    cute: { jp: "かわいい", rom: "kawaii", en: "cute", eu: "polita" }
  };
  var NOUN = [
    { jp: "ホテル", rom: "hoteru", en: "hotel", eu: "hotel", adj: ["new", "old", "exp", "cheap", "pretty"] },
    { jp: "{空港|くうこう}", rom: "kūkō", en: "airport", eu: "aireportu", adj: ["new", "old", "pretty"] },
    { jp: "{地下鉄|ちかてつ}", rom: "chikatetsu", en: "subway", eu: "metro", adj: ["new", "old", "cheap", "pretty"] },
    { jp: "{映画|えいが}", rom: "eiga", en: "movie", eu: "film", adj: ["new", "old", "fun", "cool"] },
    { jp: "{音楽|おんがく}", rom: "ongaku", en: "music", eu: "musika", adj: ["new", "old", "fun", "cool"] },
    { jp: "{動画|どうが}", rom: "dōga", en: "video", eu: "bideo", adj: ["new", "old", "fun", "cool"] },
    { jp: "Tシャツ", rom: "tīshatsu", en: "T-shirt", eu: "kamiseta", adj: ["new", "old", "exp", "cheap", "cute", "cool"] },
    { jp: "ジャケット", rom: "jaketto", en: "jacket", eu: "jaka", adj: ["new", "old", "exp", "cheap", "cute", "cool"] },
    { jp: "スカート", rom: "sukāto", en: "skirt", eu: "gona", adj: ["new", "old", "exp", "cheap", "cute", "pretty"] }
  ];
  var THING_ADJ = ["new", "old", "exp", "cheap", "fun", "cool", "pretty", "cute"];
  var LIKE = [
    { jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" },
    { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" },
    { jp: "{音楽|おんがく}", rom: "ongaku", en: "music", eu: "musika" },
    { jp: "{映画|えいが}", rom: "eiga", en: "movies", eu: "filmak" },
    { jp: "ヨガ", rom: "yoga", en: "yoga", eu: "yoga" },
    { jp: "{柔道|じゅうどう}", rom: "jūdō", en: "judo", eu: "judoa" },
    { jp: "バレーボール", rom: "barēbōru", en: "volleyball", eu: "boleibola" },
    { jp: "バスケットボール", rom: "basukettobōru", en: "basketball", eu: "saskibaloia" },
    { jp: "{野球|やきゅう}", rom: "yakyū", en: "baseball", eu: "beisbola" },
    { jp: "サッカー", rom: "sakkā", en: "soccer", eu: "futbola" }
  ];
  var WANT = [
    { jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" },
    { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" },
    { jp: "Tシャツ", rom: "tīshatsu", en: "a T-shirt", eu: "kamiseta bat" },
    { jp: "ジャケット", rom: "jaketto", en: "a jacket", eu: "jaka bat" },
    { jp: "スカート", rom: "sukāto", en: "a skirt", eu: "gona bat" },
    { jp: "{風船|ふうせん}", rom: "fūsen", en: "a balloon", eu: "puxika bat" }
  ];

  function make(q) {
    var kind = pick(["drink", "go", "sport", "dem", "noun", "like", "want"]);
    var f = pick(FREQ), jp, rom, enS, euS;
    if (kind === "drink") {
      var d = pick(DRINK);
      jp = f.jp + d.jp + "を{飲|の}みます"; rom = f.rom + d.rom + " o nomimasu";
      enS = f.pre + "drink " + d.en + f.suf;
      euS = f.eu + " " + d.eu + " edaten" + (q ? " al duzu" : " dut");
    } else if (kind === "go") {
      var w = pick(WHEN), wi = pick(WITH), h = pick(HOW), p = pick(PLACE);
      jp = w.jp + (wi ? wi.jp : "") + (h ? h.jp : "") + p.jp + "へ{行|い}きます";
      rom = w.rom + " " + (wi ? wi.rom + " " : "") + (h ? h.rom + " " : "") + p.rom + " e ikimasu";
      enS = "go to " + p.en + (h ? " " + h.en : "") + (wi ? " " + wi.en : "") + " " + w.en;
      euS = w.eu + " " + (wi ? wi.eu + " " : "") + (h ? h.eu + " " : "") + p.eu + " joaten" + (q ? " al zara" : " naiz");
    } else if (kind === "sport") {
      var s = pick(SPORT);
      jp = f.jp + s.jp + "をします"; rom = f.rom + s.rom + " o shimasu";
      enS = f.pre + s.en + f.suf;
      euS = f.eu + " " + s.eu + (q ? " al duzu" : " dut");
    } else if (kind === "like" || kind === "want") {
      var it = pick(kind === "like" ? LIKE : WANT);
      var kw = kind === "like" ? { jp: "{好|す}き", rom: "suki", en: "like", eu: " gustatzen" + (q ? " al zaizu" : " zait") }
                                : { jp: "{欲|ほ}しい", rom: "hoshii", en: "want", eu: " nahi" + (q ? " al duzu" : " dut") };
      return { jp: it.jp + "が" + kw.jp + "です" + (q ? "か" : "") + "。", rom: cap(it.rom + " ga " + kw.rom + " desu" + (q ? " ka?" : ".")),
        en: q ? "Do you " + kw.en + " " + it.en + "?" : "I " + kw.en + " " + it.en + ".",
        eu: cap(it.eu + kw.eu) + (q ? "?" : ".") };
    } else if (kind === "dem") {
      var dm = pick(DEM), a = ADJ[pick(THING_ADJ)];
      jp = dm.jp + "は" + a.jp + "です"; rom = dm.rom + " wa " + a.rom + " desu";
      return { jp: jp + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
        en: q ? "Is " + dm.en + " " + a.en + "?" : cap(dm.en) + " is " + a.en + ".",
        eu: cap(dm.eu + " " + a.eu + (q ? " al da?" : " da.")) };
    } else {
      var n = pick(NOUN), dn = pick(DEMN), a2 = ADJ[pick(n.adj)];
      jp = dn.jp + n.jp + "は" + a2.jp + "です"; rom = dn.rom + " " + n.rom + " wa " + a2.rom + " desu";
      var thing = dn.en + " " + n.en + dn.enx;
      return { jp: jp + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
        en: q ? "Is " + thing + " " + a2.en + "?" : cap(thing) + " is " + a2.en + ".",
        eu: cap(n.eu + " " + dn.eu + " " + a2.eu + (q ? " al da?" : " da.")) };
    }
    return { jp: jp + (q ? "か" : "") + "。", rom: cap(rom + (q ? " ka?" : ".")),
      en: q ? "Do you " + enS + "?" : "I " + enS + ".",
      eu: cap(euS) + (q ? "?" : ".") };
  }

  var gjp = document.getElementById("gen-jp"), grom = document.getElementById("gen-rom"), gtr = document.getElementById("gen-tr");
  function newSentence() {
    var s = make(Math.random() < 0.3);
    gjp.innerHTML = R(s.jp); grom.textContent = s.rom; gtr.textContent = eu ? s.eu : s.en;
    grom.hidden = true; gtr.hidden = true;
  }
  document.getElementById("gen-new").addEventListener("click", newSentence);
  document.getElementById("gen-rom-b").addEventListener("click", function () { grom.hidden = !grom.hidden; });
  document.getElementById("gen-tr-b").addEventListener("click", function () { gtr.hidden = !gtr.hidden; });
  newSentence();
})();
