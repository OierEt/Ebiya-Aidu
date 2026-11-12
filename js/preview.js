/* Raw-data preview: fills the box marked data-csv with the first rows of a CSV.
   If the file does not exist yet, the placeholder text stays. Uses textContent only. */
(function () {
  var box = document.querySelector("[data-csv]");
  if (!box || !window.fetch) return;
  var MAX_ROWS = 16, MAX_COLS = 24;

  function parse(text) {
    var rows = [], row = [], cell = "", q = false, i, c;
    for (i = 0; i < text.length && rows.length < MAX_ROWS; i++) {
      c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else cell += c;
    }
    return rows;
  }

  fetch(box.getAttribute("data-csv")).then(function (r) {
    if (!r.ok) throw new Error("no file");
    return r.text();
  }).then(function (text) {
    var rows = parse(text);
    if (rows.length < 2) return;
    var table = document.createElement("table"), thead = table.createTHead(), tbody = table.createTBody();
    table.className = "tbl";
    rows.forEach(function (r, n) {
      var tr = (n === 0 ? thead : tbody).insertRow();
      r.slice(0, MAX_COLS).forEach(function (v) {
        var cell = document.createElement(n === 0 ? "th" : "td");
        cell.textContent = v;
        tr.appendChild(cell);
      });
    });
    var wrap = document.createElement("div");
    wrap.className = "tbl-scroll";
    wrap.appendChild(table);
    var note = document.createElement("p"), cols = Math.min(rows[0].length, MAX_COLS);
    note.className = "tbl-cap";
    note.textContent = (box.getAttribute("data-caption") || "%r / %c / %t")
      .replace("%r", rows.length - 1).replace("%c", cols).replace("%t", rows[0].length);
    var old = box.querySelector("p");
    if (old) box.removeChild(old);
    box.classList.remove("todo");
    box.appendChild(wrap);
    box.appendChild(note);
  }).catch(function () {});
})();
