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

  /* ---------- kanji flashcards (only the kanji he knows; the front has no furigana on purpose) ---------- */
  var KANJI = [
    { k: "人", kun: "ひと (hito)", on: "じん (jin), にん (nin)", en: "person", eu: "pertsona",
      ex: [{ jp: "{人|ひと}", rom: "hito", en: "person", eu: "pertsona" }, { jp: "{三人|さんにん}", rom: "sannin", en: "three people", eu: "hiru pertsona" }, { jp: "{日本人|にほんじん}", rom: "nihonjin", en: "Japanese person", eu: "japoniarra" }] },
    { k: "大", kun: "おお(きい) (ō-kii)", on: "だい (dai)", en: "big", eu: "handia",
      ex: [{ jp: "{大|おお}きい", rom: "ōkii", en: "big", eu: "handia" }, { jp: "{大学|だいがく}", rom: "daigaku", en: "university", eu: "unibertsitatea" }] },
    { k: "私", kun: "わたし (watashi)", on: "し (shi)", en: "I, me", eu: "ni",
      ex: [{ jp: "{私|わたし}", rom: "watashi", en: "I", eu: "ni" }, { jp: "{私|わたし}たち", rom: "watashitachi", en: "we", eu: "gu" }] },
    { k: "父", kun: "ちち (chichi)", on: "ふ (fu)", en: "father", eu: "aita", x: { en: "In お{父|とう}さん it is read とう (tō).", eu: "お{父|とう}さん-en とう (tō) irakurtzen da." },
      ex: [{ jp: "{父|ちち}", rom: "chichi", en: "my father", eu: "nire aita" }, { jp: "お{父|とう}さん", rom: "otōsan", en: "father (yours or someone else's)", eu: "aita (zurea edo besteena)" }] },
    { k: "母", kun: "はは (haha)", on: "ぼ (bo)", en: "mother", eu: "ama", x: { en: "In お{母|かあ}さん it is read かあ (kā).", eu: "お{母|かあ}さん-en かあ (kā) irakurtzen da." },
      ex: [{ jp: "{母|はは}", rom: "haha", en: "my mother", eu: "nire ama" }, { jp: "お{母|かあ}さん", rom: "okāsan", en: "mother (yours or someone else's)", eu: "ama (zurea edo besteena)" }] }
  ];
  (function () {
    var kf = document.getElementById("kc-front"), kb = document.getElementById("kc-back"), kd = document.getElementById("kc-dir"), kcur = null;
    if (!kf) return;
    function div(cls, html, ja) { var d = document.createElement("div"); d.className = cls; if (ja) d.setAttribute("lang", "ja"); d.innerHTML = html; return d; }
    function nextKanji() {
      var c = pick(KANJI);
      if (KANJI.length > 1) { var g = 0; while (c === kcur && g++ < 20) c = pick(KANJI); }
      kcur = c; kb.hidden = true; kb.innerHTML = "";
      var mean = eu ? c.eu : c.en;
      if (kd.value === "km") { kf.setAttribute("lang", "ja"); kf.textContent = c.k; }
      else { kf.removeAttribute("lang"); kf.textContent = mean; kb.appendChild(div("fc-jp", c.k, true)); }
      if (kd.value === "km") kb.appendChild(div("fc-m", mean, false));
      kb.appendChild(div("fc-r", "kun: " + c.kun + " \u00b7 on: " + c.on, false));
      if (c.x) kb.appendChild(div("fc-r", R(eu ? c.x.eu : c.x.en), false));
      c.ex.forEach(function (e) { kb.appendChild(div("fc-r", R(e.jp) + " (" + e.rom + ") " + (eu ? e.eu : e.en), false)); });
    }
    document.getElementById("kc-ans").addEventListener("click", function () { kb.hidden = false; });
    document.getElementById("kc-next").addEventListener("click", nextKanji);
    kd.addEventListener("change", nextKanji);
    nextKanji();
  })();

  /* ---------- random sentences ---------- */
  var FREQ = [
    { jp: "{毎日|まいにち}、", rom: "mainichi, ", pre: "", suf: " every day", eu: "egunero" },
    { jp: "{毎朝|まいあさ}、", rom: "maiasa, ", pre: "", suf: " every morning", eu: "goizero" },
    { jp: "{毎晩|まいばん}、", rom: "maiban, ", pre: "", suf: " every night", eu: "gauero" },
    { jp: "{毎週|まいしゅう}、", rom: "maishū, ", pre: "", suf: " every week", eu: "astero" },
    { jp: "{時々|ときどき}", rom: "tokidoki ", pre: "sometimes ", suf: "", eu: "batzuetan" },
    { jp: "よく", rom: "yoku ", pre: "often ", suf: "", eu: "askotan" },
    { jp: "いつも", rom: "itsumo ", pre: "always ", suf: "", eu: "beti" }
  ];
  var DRINK = [{ jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" }, { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" }, { jp: "コーヒー", rom: "kōhī", en: "coffee", eu: "kafea" }];
  var FOOD = [{ jp: "ピザ", rom: "piza", en: "pizza", eu: "pizza" }, { jp: "ケーキ", rom: "kēki", en: "cake", eu: "pastela" }, { jp: "サラダ", rom: "sarada", en: "salad", eu: "entsalada" }, { jp: "{弁当|べんとう}", rom: "bentō", en: "bento", eu: "bentoa" }, { jp: "サンドイッチ", rom: "sandoicchi", en: "sandwiches", eu: "ogitartekoa" }, { jp: "{卵|たまご}", rom: "tamago", en: "eggs", eu: "arrautza" }];
  var SPORT = [
    { jp: "ヨガ", rom: "yoga", en: "do yoga", eu: "yoga egiten", like: "yoga", likeEu: "yoga" },
    { jp: "{柔道|じゅうどう}", rom: "jūdō", en: "do judo", eu: "judoa egiten", like: "judo", likeEu: "judoa" },
    { jp: "バレーボール", rom: "barēbōru", en: "play volleyball", eu: "boleibolean jolasten", like: "volleyball", likeEu: "boleibola" },
    { jp: "バスケットボール", rom: "basukettobōru", en: "play basketball", eu: "saskibaloian jolasten", like: "basketball", likeEu: "saskibaloia" },
    { jp: "{野球|やきゅう}", rom: "yakyū", en: "play baseball", eu: "beisbolean jolasten", like: "baseball", likeEu: "beisbola" },
    { jp: "サッカー", rom: "sakkā", en: "play soccer", eu: "futbolean jolasten", like: "soccer", likeEu: "futbola" },
    { jp: "{空手|からて}", rom: "karate", en: "do karate", eu: "karatea egiten", like: "karate", likeEu: "karatea" }
  ];
  var WHEN = [
    { jp: "{土曜日|どようび}に", rom: "doyōbi ni", en: "on Saturday", eu: "larunbatean" },
    { jp: "{日曜日|にちようび}に", rom: "nichiyōbi ni", en: "on Sunday", eu: "igandean" },
    { jp: "{週末|しゅうまつ}に", rom: "shūmatsu ni", en: "on the weekend", eu: "asteburuan" }
  ];
  var WITH = [null, { jp: "{友達|ともだち}と", rom: "tomodachi to", en: "with a friend", eu: "lagun batekin" }, { jp: "{家族|かぞく}と", rom: "kazoku to", en: "with family", eu: "familiarekin" }];
  var HOW = [null, { jp: "{地下鉄|ちかてつ}で", rom: "chikatetsu de", en: "by subway", eu: "metroz" }, { jp: "{電車|でんしゃ}で", rom: "densha de", en: "by train", eu: "trenez" }, { jp: "{車|くるま}で", rom: "kuruma de", en: "by car", eu: "autoz" }];
  var LOCN = [{ jp: "ホテル", rom: "hoteru", en: "the hotel", eu: "hotela" }, { jp: "{空港|くうこう}", rom: "kūkō", en: "the airport", eu: "aireportua" }, { jp: "{地下鉄|ちかてつ}", rom: "chikatetsu", en: "the subway", eu: "metroa" }, { jp: "{車|くるま}", rom: "kuruma", en: "the car", eu: "autoa" }, { jp: "{店|みせ}", rom: "mise", en: "the shop", eu: "denda" }, { jp: "コンビニ", rom: "konbini", en: "the convenience store", eu: "konbinia" }, { jp: "{駅|えき}", rom: "eki", en: "the station", eu: "geltokia" }, { jp: "{大学|だいがく}", rom: "daigaku", en: "the university", eu: "unibertsitatea" }];
  var LOCW = [{ jp: "ここ", rom: "koko", en: "here", eu: "hemen" }, { jp: "そこ", rom: "soko", en: "there", eu: "hor" }, { jp: "あそこ", rom: "asoko", en: "over there", eu: "han" }];
  var READ = [{ jp: "{本|ほん}", rom: "hon", en: "books", eu: "liburuak", pl: true }, { jp: "マンガ", rom: "manga", en: "manga", eu: "manga" }];
  var JOBS = [{ jp: "{医者|いしゃ}", rom: "isha", en: "doctor", eu: "medikua" }, { jp: "{弁護士|べんごし}", rom: "bengoshi", en: "lawyer", eu: "abokatua" }, { jp: "{先生|せんせい}", rom: "sensei", en: "teacher", eu: "irakaslea" }, { jp: "{学生|がくせい}", rom: "gakusei", en: "student", eu: "ikaslea" }, { jp: "{店員|てんいん}", rom: "ten’in", en: "shop assistant", eu: "dendaria" }];
  var PLACE = [{ jp: "ホテル", rom: "hoteru", en: "the hotel", eu: "hotelera" }, { jp: "{空港|くうこう}", rom: "kūkō", en: "the airport", eu: "aireportura" }, { jp: "{店|みせ}", rom: "mise", en: "the shop", eu: "dendara" }, { jp: "コンビニ", rom: "konbini", en: "the convenience store", eu: "konbinira" }, { jp: "{駅|えき}", rom: "eki", en: "the station", eu: "geltokira" }, { jp: "{大学|だいがく}", rom: "daigaku", en: "the university", eu: "unibertsitatera" }];
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
    cute: { jp: "かわいい", rom: "kawaii", en: "cute", eu: "polita" },
    big: { jp: "{大|おお}きい", rom: "ōkii", en: "big", eu: "handia" },
    small: { jp: "{小|ちい}さい", rom: "chiisai", en: "small", eu: "txikia" },
    white: { jp: "{白|しろ}い", rom: "shiroi", en: "white", eu: "zuria" },
    black: { jp: "{黒|くろ}い", rom: "kuroi", en: "black", eu: "beltza" },
    blue: { jp: "{青|あお}い", rom: "aoi", en: "blue", eu: "urdina" },
    tasty: { jp: "おいしい", rom: "oishii", en: "delicious", eu: "goxoa" },
    wow: { jp: "すごい", rom: "sugoi", en: "amazing", eu: "harrigarria" },
    quiet: { jp: "{静|しず}か", rom: "shizuka", en: "quiet", eu: "lasaia" },
    lively: { jp: "にぎやか", rom: "nigiyaka", en: "lively", eu: "bizia" },
    famous: { jp: "{有名|ゆうめい}", rom: "yūmei", en: "famous", eu: "ospetsua" },
    hard: { jp: "{難|むずか}しい", rom: "muzukashii", en: "difficult", eu: "zaila" },
    wide: { jp: "{広|ひろ}い", rom: "hiroi", en: "spacious", eu: "zabala" },
    kind: { jp: "やさしい", rom: "yasashii", en: "kind", eu: "jatorra" }
  };
  var NOUN = [
    { jp: "{店|みせ}", rom: "mise", en: "shop", eu: "denda", adj: ["new", "old", "big", "small", "cheap", "exp", "quiet", "lively", "pretty"] },
    { jp: "コンビニ", rom: "konbini", en: "convenience store", eu: "konbini", adj: ["new", "old", "big", "small", "cheap", "lively"] },
    { jp: "{辞書|じしょ}", rom: "jisho", en: "dictionary", eu: "hiztegi", adj: ["new", "old", "exp", "cheap", "big", "small"] },
    { jp: "サンドイッチ", rom: "sandoicchi", en: "sandwich", eu: "ogitarteko", adj: ["tasty", "cheap", "exp", "big", "small"] },
    { jp: "ホテル", rom: "hoteru", en: "hotel", eu: "hotel", adj: ["new", "old", "exp", "cheap", "pretty", "quiet", "lively"] },
    { jp: "{空港|くうこう}", rom: "kūkō", en: "airport", eu: "aireportu", adj: ["new", "old", "pretty"] },
    { jp: "{地下鉄|ちかてつ}", rom: "chikatetsu", en: "subway", eu: "metro", adj: ["new", "old", "cheap", "pretty"] },
    { jp: "{映画|えいが}", rom: "eiga", en: "movie", eu: "film", adj: ["new", "old", "fun", "cool"] },
    { jp: "{音楽|おんがく}", rom: "ongaku", en: "music", eu: "musika", adj: ["new", "old", "fun", "cool"] },
    { jp: "{動画|どうが}", rom: "dōga", en: "video", eu: "bideo", adj: ["new", "old", "fun", "cool"] },
    { jp: "Tシャツ", rom: "tīshatsu", en: "T-shirt", eu: "kamiseta", adj: ["new", "old", "exp", "cheap", "cute", "cool"] },
    { jp: "ジャケット", rom: "jaketto", en: "jacket", eu: "jaka", adj: ["new", "old", "exp", "cheap", "cute", "cool"] },
    { jp: "スカート", rom: "sukāto", en: "skirt", eu: "gona", adj: ["new", "old", "exp", "cheap", "cute", "pretty"] },
    { jp: "{車|くるま}", rom: "kuruma", en: "car", eu: "auto", adj: ["new", "old", "exp", "cheap", "cool", "big", "small", "white", "black", "blue"] },
    { jp: "ピアノ", rom: "piano", en: "piano", eu: "piano", adj: ["new", "old", "exp", "cheap", "big", "white", "black"] },
    { jp: "かばん", rom: "kaban", en: "bag", eu: "poltsa", adj: ["new", "old", "exp", "cheap", "cute", "cool", "big", "small", "white", "black", "blue"] },
    { jp: "{財布|さいふ}", rom: "saifu", en: "wallet", eu: "diru-zorro", adj: ["new", "old", "exp", "cheap", "cute", "small", "white", "black", "blue"] },
    { jp: "{帽子|ぼうし}", rom: "bōshi", en: "hat", eu: "kapela", adj: ["new", "old", "exp", "cheap", "cute", "cool", "big", "small", "white", "black", "blue"] },
    { jp: "{駅|えき}", rom: "eki", en: "station", eu: "geltoki", adj: ["new", "old", "big", "small", "pretty", "quiet", "lively"] },
    { jp: "ケーキ", rom: "kēki", en: "cake", eu: "pastel", adj: ["tasty", "cheap", "exp", "big", "small", "cute"] },
    { jp: "ピザ", rom: "piza", en: "pizza", eu: "pizza", adj: ["tasty", "cheap", "exp", "big", "small"] },
    { jp: "サラダ", rom: "sarada", en: "salad", eu: "entsalada", adj: ["tasty", "cheap", "exp", "big", "small"] },
    { jp: "{弁当|べんとう}", rom: "bentō", en: "bento", eu: "bento", adj: ["tasty", "cheap", "exp", "big", "small"] },
    { jp: "コーヒー", rom: "kōhī", en: "coffee", eu: "kafe", adj: ["tasty", "cheap", "exp"] },
    { jp: "ゲーム", rom: "gēmu", en: "game", eu: "joko", adj: ["new", "old", "fun", "cool", "exp", "cheap", "wow"] },
    { jp: "ドラマ", rom: "dorama", en: "drama", eu: "drama", adj: ["new", "old", "fun", "wow"] },
    { jp: "{本|ほん}", rom: "hon", en: "book", eu: "liburu", adj: ["new", "old", "exp", "cheap", "fun", "hard", "famous"] },
    { jp: "マンガ", rom: "manga", en: "manga", eu: "manga", adj: ["new", "old", "exp", "cheap", "fun", "famous"] },
    { jp: "{地図|ちず}", rom: "chizu", en: "map", eu: "mapa", adj: ["new", "old", "big", "small", "cheap"] },
    { jp: "チケット", rom: "chiketto", en: "ticket", eu: "txartel", adj: ["exp", "cheap"] },
    { jp: "ペン", rom: "pen", en: "pen", eu: "boligrafo", adj: ["new", "old", "exp", "cheap", "cute", "cool", "small"] },
    { jp: "ラーメン", rom: "rāmen", en: "ramen", eu: "ramen", adj: ["tasty", "cheap", "exp", "big", "small", "famous"] },
    { jp: "カメラ", rom: "kamera", en: "camera", eu: "kamera", adj: ["new", "old", "exp", "cheap", "small", "big", "cool", "black", "white"] },
    { jp: "{部屋|へや}", rom: "heya", en: "room", eu: "gela", adj: ["new", "old", "big", "small", "pretty", "quiet", "wide"] },
    { jp: "{家|いえ}", rom: "ie", en: "house", eu: "etxe", adj: ["new", "old", "exp", "cheap", "big", "small", "pretty", "quiet", "wide"] },
    { jp: "{大学|だいがく}", rom: "daigaku", en: "university", eu: "unibertsitate", adj: ["new", "old", "big", "pretty", "famous", "wide"] },
    { jp: "{先生|せんせい}", rom: "sensei", en: "teacher", eu: "irakasle", adj: ["kind", "famous", "cool"] },
    { jp: "{学生|がくせい}", rom: "gakusei", en: "student", eu: "ikasle", adj: ["kind", "famous", "cool", "cute"] },
    { jp: "{店員|てんいん}", rom: "ten’in", en: "shop assistant", eu: "dendari", adj: ["kind", "cool"] }
  ];
  var THING_ADJ = ["new", "old", "exp", "cheap", "fun", "cool", "pretty", "cute", "big", "small", "white", "black", "blue", "tasty", "wow", "famous", "hard"];
  var LIKE = [
    { jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" },
    { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" },
    { jp: "{音楽|おんがく}", rom: "ongaku", en: "music", eu: "musika" },
    { jp: "{映画|えいが}", rom: "eiga", en: "movies", eu: "filmak", pl: true },
    { jp: "ヨガ", rom: "yoga", en: "yoga", eu: "yoga" },
    { jp: "{柔道|じゅうどう}", rom: "jūdō", en: "judo", eu: "judoa" },
    { jp: "バレーボール", rom: "barēbōru", en: "volleyball", eu: "boleibola" },
    { jp: "バスケットボール", rom: "basukettobōru", en: "basketball", eu: "saskibaloia" },
    { jp: "{野球|やきゅう}", rom: "yakyū", en: "baseball", eu: "beisbola" },
    { jp: "サッカー", rom: "sakkā", en: "soccer", eu: "futbola" },
    { jp: "{空手|からて}", rom: "karate", en: "karate", eu: "karatea" },
    { jp: "ピザ", rom: "piza", en: "pizza", eu: "pizza" },
    { jp: "サンドイッチ", rom: "sandoicchi", en: "sandwiches", eu: "ogitartekoa" },
    { jp: "ケーキ", rom: "kēki", en: "cake", eu: "pastela" },
    { jp: "サラダ", rom: "sarada", en: "salad", eu: "entsalada" },
    { jp: "コーヒー", rom: "kōhī", en: "coffee", eu: "kafea" },
    { jp: "ゲーム", rom: "gēmu", en: "games", eu: "jokoak", pl: true },
    { jp: "ドラマ", rom: "dorama", en: "dramas", eu: "dramak", pl: true },
    { jp: "ファンタジー", rom: "fantajī", en: "fantasy", eu: "fantasia" },
    { jp: "ホラー", rom: "horā", en: "horror", eu: "beldurrezkoa" },
    { jp: "マンガ", rom: "manga", en: "manga", eu: "manga" },
    { jp: "ラーメン", rom: "rāmen", en: "ramen", eu: "ramen" },
    { jp: "{料理|りょうり}", rom: "ryōri", en: "cooking", eu: "sukaldaritza" },
    { jp: "{本|ほん}", rom: "hon", en: "books", eu: "liburuak", pl: true }
  ];
  var WANT = [
    { jp: "{水|みず}", rom: "mizu", en: "water", eu: "ura" },
    { jp: "お{茶|ちゃ}", rom: "ocha", en: "tea", eu: "tea" },
    { jp: "Tシャツ", rom: "tīshatsu", en: "a T-shirt", eu: "kamiseta bat" },
    { jp: "ジャケット", rom: "jaketto", en: "a jacket", eu: "jaka bat" },
    { jp: "スカート", rom: "sukāto", en: "a skirt", eu: "gona bat" },
    { jp: "{風船|ふうせん}", rom: "fūsen", en: "a balloon", eu: "puxika bat" },
    { jp: "{車|くるま}", rom: "kuruma", en: "a car", eu: "auto bat" },
    { jp: "ピアノ", rom: "piano", en: "a piano", eu: "piano bat" },
    { jp: "かばん", rom: "kaban", en: "a bag", eu: "poltsa bat" },
    { jp: "{財布|さいふ}", rom: "saifu", en: "a wallet", eu: "diru-zorro bat" },
    { jp: "{帽子|ぼうし}", rom: "bōshi", en: "a hat", eu: "kapela bat" },
    { jp: "{服|ふく}", rom: "fuku", en: "clothes", eu: "arropa" },
    { jp: "{靴|くつ}", rom: "kutsu", en: "shoes", eu: "zapatak" },
    { jp: "ピザ", rom: "piza", en: "a pizza", eu: "pizza bat" },
    { jp: "ケーキ", rom: "kēki", en: "a cake", eu: "pastel bat" },
    { jp: "サラダ", rom: "sarada", en: "a salad", eu: "entsalada bat" },
    { jp: "コーヒー", rom: "kōhī", en: "coffee", eu: "kafea" },
    { jp: "{弁当|べんとう}", rom: "bentō", en: "a bento", eu: "bento bat" },
    { jp: "ゲーム", rom: "gēmu", en: "a game", eu: "joko bat" },
    { jp: "サンドイッチ", rom: "sandoicchi", en: "a sandwich", eu: "ogitarteko bat" },
    { jp: "{辞書|じしょ}", rom: "jisho", en: "a dictionary", eu: "hiztegi bat" },
    { jp: "{本|ほん}", rom: "hon", en: "a book", eu: "liburu bat" },
    { jp: "ペン", rom: "pen", en: "a pen", eu: "boligrafo bat" },
    { jp: "カメラ", rom: "kamera", en: "a camera", eu: "kamera bat" },
    { jp: "チケット", rom: "chiketto", en: "a ticket", eu: "sarrera bat" },
    { jp: "ラーメン", rom: "rāmen", en: "ramen", eu: "ramen" },
    { jp: "{家|いえ}", rom: "ie", en: "a house", eu: "etxe bat" },
    { jp: "{地図|ちず}", rom: "chizu", en: "a map", eu: "mapa bat" },
    { jp: "マンガ", rom: "manga", en: "a manga", eu: "manga bat" }
  ];

  function make(q) {
    var kind = pick(["drink", "go", "sport", "dem", "noun", "like", "want", "job", "loc", "eat", "please", "read"]);
    var f = pick(FREQ), jp, rom, enS, euS;
    if (kind === "drink") {
      var d = pick(DRINK);
      jp = f.jp + d.jp + "を{飲|の}みます"; rom = f.rom + d.rom + " o nomimasu";
      enS = f.pre + "drink " + d.en + f.suf;
      euS = f.eu + " " + d.eu + " edaten" + (q ? " al duzu" : " dut");
    } else if (kind === "please") {
      var pl = pick(DRINK.concat(FOOD)), kd = Math.random() < 0.5;
      return { jp: pl.jp + "を" + (kd ? "ください" : "お{願|ねが}いします") + "。",
        rom: cap(pl.rom + " o " + (kd ? "kudasai." : "onegaishimasu.")),
        en: cap(pl.en) + ", please.", eu: cap(pl.eu) + ", mesedez." };
    } else if (kind === "read") {
      var rd = pick(READ);
      jp = f.jp + rd.jp + "を{読|よ}みます"; rom = f.rom + rd.rom + " o yomimasu";
      enS = f.pre + "read " + rd.en + f.suf;
      euS = f.eu + " " + rd.eu + " irakurtzen" + (q ? (rd.pl ? " al dituzu" : " al duzu") : (rd.pl ? " ditut" : " dut"));
    } else if (kind === "eat") {
      var fd = pick(FOOD);
      jp = f.jp + fd.jp + "を{食|た}べます"; rom = f.rom + fd.rom + " o tabemasu";
      enS = f.pre + "eat " + fd.en + f.suf;
      euS = f.eu + " " + fd.eu + " jaten" + (q ? " al duzu" : " dut");
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
    } else if (kind === "loc") {
      var lp = pick(LOCN), lw = pick(LOCW);
      return { jp: lp.jp + "は" + (q ? "どこですか" : lw.jp + "です") + "。",
        rom: cap(lp.rom + " wa " + (q ? "doko desu ka?" : lw.rom + " desu.")),
        en: q ? "Where is " + lp.en + "?" : cap(lp.en) + " is " + lw.en + ".",
        eu: q ? "Non dago " + lp.eu + "?" : cap(lp.eu) + " " + lw.eu + " dago." };
    } else if (kind === "job") {
      var j = pick(JOBS);
      return { jp: (q ? "あなたは" : "{私|わたし}は") + j.jp + "です" + (q ? "か" : "") + "。",
        rom: q ? "Anata wa " + j.rom + " desu ka?" : "Watashi wa " + j.rom + " desu.",
        en: q ? "Are you a " + j.en + "?" : "I am a " + j.en + ".",
        eu: q ? cap(j.eu) + " al zara?" : cap(j.eu) + " naiz." };
    } else if (kind === "like" || kind === "want") {
      var it = pick(kind === "like" ? LIKE : WANT);
      var kw = kind === "like" ? { jp: "{好|す}き", rom: "suki", en: "like", eu: " gustatzen" + (q ? (it.pl ? " al zaizkizu" : " al zaizu") : (it.pl ? " zaizkit" : " zait")) }
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
  var gdir = document.getElementById("gen-dir"), btnTr = document.getElementById("gen-tr-b");
  function applyMode() {
    var rev = gdir.value === "mj"; /* mj: read the translation, try to say it in Japanese */
    gjp.hidden = rev; gtr.hidden = !rev; grom.hidden = true;
    btnTr.textContent = btnTr.getAttribute(rev ? "data-jp" : "data-tr");
  }
  function newSentence() {
    var s = make(Math.random() < 0.3);
    gjp.innerHTML = R(s.jp); grom.textContent = s.rom; gtr.textContent = eu ? s.eu : s.en;
    applyMode();
  }
  document.getElementById("gen-new").addEventListener("click", newSentence);
  document.getElementById("gen-rom-b").addEventListener("click", function () { grom.hidden = !grom.hidden; });
  btnTr.addEventListener("click", function () {
    if (gdir.value === "mj") gjp.hidden = !gjp.hidden; else gtr.hidden = !gtr.hidden;
  });
  gdir.addEventListener("change", applyMode);
  newSentence();

  /* Progress: my own word count comes from the vocabulary tables */
  var prog = document.getElementById("progress");
  if (prog) {
    var nw = document.querySelectorAll("#vocabulary tbody tr[data-cat]").length, nk = KANJI.length; /* kanji he knows: the cards above */
    [].forEach.call(prog.querySelectorAll(".bars[data-kind]"), function (ul) {
      var k = ul.getAttribute("data-kind"), v = k === "w" ? nw : nk, mx = +ul.getAttribute("data-max");
      ul.querySelector(".me .bv").textContent = v;
      ul.querySelector(".me .bf").style.width = Math.max(0.6, v * 100 / mx) + "%";
    });
    [].forEach.call(prog.querySelectorAll(".tonf li"), function (li) {
      var ul = li.parentNode, w = li.getAttribute("data-kind") === "w", v = w ? nw : nk, r = +ul.getAttribute(w ? "data-n5w" : "data-n5k");
      li.querySelector(".bf").style.width = Math.max(0.6, v * 100 / r) + "%";
      li.querySelector(".bv").textContent = v + " / " + r + " \u00b7 " + Math.min(100, Math.round(v * 100 / r)) + "%";
    });
    var lv = nw >= 800 && nk >= 100 ? "N5" : prog.getAttribute("data-lv");
    document.getElementById("lvl-sum").innerHTML = prog.getAttribute("data-sum").replace("{lv}", lv).replace("{cefr}", nw >= 800 && nk >= 100 ? "A1" : prog.getAttribute("data-cefr")).replace("{w}", nw).replace("{k}", nk);
  }

  /* Reader: colours the words that are in my lists (all in the browser, nothing is saved or sent) */
  var rdIn = document.getElementById("rd-in");
  if (rdIn) {
    var rdOut = document.getElementById("rd-out"), rdStat = document.getElementById("rd-stat"), rdBox = document.getElementById("reader");
    var CJK = /[㐀-鿿]/, KANA = /[぀-ヿ]/;
    var forms = [];
    function plainOf(cell) { var c = cell.cloneNode(true); [].forEach.call(c.querySelectorAll("rt"), function (x) { x.remove(); }); return c.textContent.replace(/[〜~\s]/g, ""); }
    function add(plain, html, tip) {
      if (!plain || (plain.length === 1 && !CJK.test(plain))) return;
      forms.push({ f: plain, html: html, tip: tip });
    }
    var rowSel = "#vocabulary tbody tr, #numbers tbody tr, #basics table.vocab:not(.ex):not(.fam):not(.parts) tbody tr, #basics table.qw tbody tr";
    [].forEach.call(document.querySelectorAll(rowSel), function (tr) {
      var jp = tr.querySelector(".jp"), rom = tr.querySelector(".rom");
      if (!jp || !rom) return;
      var meanEl = tr.querySelector(".mean"), mean = meanEl ? meanEl.textContent : tr.children[0].textContent;
      var plain = plainOf(jp), tip = rom.textContent + " · " + mean;
      if (plain.indexOf("・") > -1) { plain.split("・").forEach(function (w) { add(w, w, tip); }); return; }
      add(plain, jp.innerHTML, tip);
      var cat = tr.getAttribute("data-cat"), noteEl = tr.querySelector(".note");
      var isV = cat === "verbs", isA = cat === "adj" && noteEl && /^i-adj/.test(noteEl.textContent);
      if ((isV || isA) && plain.length > 1 && KANA.test(plain.charAt(plain.length - 1))) {
        var stem = plain.slice(0, -1);
        if (CJK.test(stem) || stem.length > 1) {
          var c = jp.cloneNode(true), w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT), last = null, n;
          while ((n = w.nextNode())) { if (!n.parentNode.closest("rt")) last = n; }
          if (last && last.textContent.length > 0) { last.textContent = last.textContent.slice(0, -1); add(stem, c.innerHTML, plain + " — " + tip); }
        }
      }
    });
    forms.sort(function (a, b) { return b.f.length - a.f.length; });
    function lone(t, i, f) { /* a single kanji inside a longer kanji word is not a match */
      return f.length === 1 && CJK.test(f) && ((i > 0 && CJK.test(t.charAt(i - 1))) || CJK.test(t.charAt(i + 1)));
    }
    function render() {
      var t = rdIn.value, i = 0, buf = "", count = 0, seen = {};
      rdOut.textContent = "";
      function flush() { if (buf) { rdOut.appendChild(document.createTextNode(buf)); buf = ""; } }
      while (i < t.length) {
        var hit = null;
        for (var k = 0; k < forms.length; k++) {
          if (t.substr(i, forms[k].f.length) === forms[k].f && !lone(t, i, forms[k].f)) { hit = forms[k]; break; }
        }
        if (hit) {
          flush();
          var sp = document.createElement("span");
          sp.className = "kw"; sp.tabIndex = 0; sp.setAttribute("data-tip", hit.tip); sp.innerHTML = hit.html;
          rdOut.appendChild(sp); count++; seen[hit.f] = 1; i += hit.f.length;
        } else { buf += t.charAt(i); i++; }
      }
      flush();
      rdStat.textContent = t ? rdBox.getAttribute("data-stat").replace("{n}", count).replace("{d}", Object.keys(seen).length) : "";
    }
    rdIn.addEventListener("input", render);
    document.getElementById("rd-clear").addEventListener("click", function () { rdIn.value = ""; render(); rdIn.focus(); });
  }
})();
