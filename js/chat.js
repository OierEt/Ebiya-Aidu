/* Public chat: visitors pick an alias and leave a message.
   Talks to a Supabase table through its REST API (see backend/chat-setup.sql).
   Fill in the two values below once the Supabase project exists. */
var CHAT_URL = "";   // e.g. "https://abcdefgh.supabase.co"
var CHAT_KEY = "";   // the project's public (anon / publishable) key

(function () {
  var eu = document.documentElement.lang === "eu";
  var S = eu ? {
    empty: "Oraindik ez dago mezurik. Izan zaitez lehena!",
    sending: "Bidaltzen...", sent: "Mezua bidali da.",
    need: "Idatzi ezizen bat eta mezu bat.",
    reserved: "Ezizen hori erreserbatuta dago. Aukeratu beste bat.",
    slow: "Mezu gehiegi minutu honetan. Saiatu berriro apur bat geroago.",
    wait: "Itxaron pixka bat mezu bat eta hurrengoaren artean.",
    fail: "Ezin izan da bidali. Saiatu berriro geroago.",
    loadfail: "Ezin izan dira mezuak kargatu.", owner: "Webgunearen jabea"
  } : {
    empty: "No messages yet. Be the first!",
    sending: "Sending...", sent: "Message sent.",
    need: "Please write an alias and a message.",
    reserved: "That alias is reserved. Please pick another one.",
    slow: "Too many messages this minute. Please try again shortly.",
    wait: "Please wait a little between messages.",
    fail: "Could not send. Please try again later.",
    loadfail: "Could not load the messages.", owner: "Site owner"
  };

  var form = document.getElementById("chat-form");
  var off = document.getElementById("chat-off");
  var list = document.getElementById("chat-list");
  var status = document.getElementById("chat-status");
  if (!form) return;

  if (!CHAT_URL || !CHAT_KEY) { off.hidden = false; return; }
  form.hidden = false;

  var headers = { "apikey": CHAT_KEY, "Content-Type": "application/json" };
  if (CHAT_KEY.indexOf("eyJ") === 0) headers["Authorization"] = "Bearer " + CHAT_KEY;
  var API = CHAT_URL.replace(/\/$/, "") + "/rest/v1/messages";

  // same normalisation as the database rule: lower case, no accents, letters and digits only
  function key(a) {
    return a.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
  }

  function render(rows) {
    list.textContent = "";
    if (!rows.length) {
      var p = document.createElement("li");
      p.className = "chat-empty";
      p.textContent = S.empty;
      list.appendChild(p);
      return;
    }
    rows.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "chat-msg" + (m.is_owner ? " owner" : "");
      var head = document.createElement("div");
      head.className = "chat-head";
      var who = document.createElement("strong");
      who.textContent = m.alias;
      head.appendChild(who);
      if (m.is_owner) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = S.owner;
        head.appendChild(badge);
      }
      var when = document.createElement("time");
      when.textContent = new Date(m.created_at).toLocaleString(eu ? "eu" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
      head.appendChild(when);
      var body = document.createElement("p");
      body.textContent = m.body;          // textContent: never interpreted as HTML
      li.appendChild(head);
      li.appendChild(body);
      list.appendChild(li);
    });
  }

  function load() {
    fetch(API + "?select=id,created_at,alias,body,is_owner&order=created_at.desc&limit=100", { headers: headers })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () { list.textContent = ""; var li = document.createElement("li"); li.className = "chat-empty"; li.textContent = S.loadfail; list.appendChild(li); });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var alias = form.alias.value.trim();
    var body = form.body.value.trim();
    if (form.website.value) return;                          // honeypot: bots fill it in
    if (!alias || !body) { status.textContent = S.need; return; }
    if (key(alias).indexOf("ebiyaaidu") !== -1) { status.textContent = S.reserved; return; }
    var lastSent = Number(localStorage.getItem("chatLast") || 0);
    if (Date.now() - lastSent < 20000) { status.textContent = S.wait; return; }

    status.textContent = S.sending;
    fetch(API, {
      method: "POST",
      headers: Object.assign({ "Prefer": "return=minimal" }, headers),
      body: JSON.stringify({ alias: alias, body: body })
    }).then(function (r) {
      if (r.ok) {
        try { localStorage.setItem("chatLast", String(Date.now())); } catch (err) {}
        form.body.value = "";
        status.textContent = S.sent;
        load();
        return;
      }
      return r.text().then(function (t) {
        status.textContent = r.status === 403 || r.status === 401 ? S.reserved : (t.indexOf("rate_limited") !== -1 ? S.slow : S.fail);
      });
    }).catch(function () { status.textContent = S.fail; });
  });

  load();
  setInterval(load, 60000);
})();
