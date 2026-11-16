// One-off helper (NOT part of the website): draws the travel map and the flag row of the About page.
// Edit tools/places.json, then:
//   mkdir /tmp/mapbuild && cd /tmp/mapbuild && npm init -y && npm install world-atlas topojson-client d3-geo flag-icons i18n-iso-countries
//   cp <repo>/tools/make-map.mjs <repo>/tools/places.json . && node make-map.mjs <repo>
// places.json: "countries": { iso2, en, eu, optional visits (number, shows "x3"), optional borderOnly (hatched, "DMZ"),
//   optional mainlandOnly (colour only mainland polygons, e.g. France without French Guiana) }, "cities": { en, eu, lat, lon }.
// It rewrites the block between <!--map:start--> and <!--map:end--> in about.html and eu/about.html and copies the flags to img/flags/.
// Zoom and drag are done by js/map.js (not generated).
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import countriesLib from "i18n-iso-countries";
const require = createRequire(import.meta.url);
const repo = process.argv[2];
const places = JSON.parse(fs.readFileSync(new URL("./places.json", import.meta.url)));
const topo = require("world-atlas/countries-50m.json");
const all = feature(topo, topo.objects.countries).features.filter(f => f.id !== "010"); // no Antarctica
const W = 960, H = 480;
const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: "FeatureCollection", features: all });
const gp = geoPath(proj).digits(1);
const num = c => countriesLib.alpha2ToNumeric(c.iso2.toUpperCase()).replace(/^0+/, "");
const byId = new Map(places.countries.map(c => [num(c), c]));
const missing = new Set(byId.keys());
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const title = (c, lang) => {
  let t = c[lang]; if (c.borderOnly) t += lang === "en" ? " (DMZ)" : " (DMZ)";
  if (c.visits) t += lang === "en" ? ` · ${c.visits} visit${c.visits > 1 ? "s" : ""}` : ` · ${c.visits} bisita`;
  return esc(t);
};
function land(lang) {
  let out = "";
  for (const f of all) {
    const c = byId.get(String(f.id).replace(/^0+/, ""));
    if (c) missing.delete(num(c));
    const cls = c ? (c.borderOnly ? "border" : "visited") : "";
    if (c && c.mainlandOnly && f.geometry.type === "MultiPolygon") {
      for (const poly of f.geometry.coordinates) {
        const sub = { type: "Feature", geometry: { type: "Polygon", coordinates: poly } };
        const [lo, la] = geoCentroid(sub); const main = lo > -6 && lo < 10 && la > 41 && la < 52;
        const d = gp(sub); if (!d) continue;
        out += main ? `<path d="${d}" class="${cls}"><title>${title(c, lang)}</title></path>` : `<path d="${d}"/>`;
      }
      continue;
    }
    const d = gp(f); if (!d) continue;
    out += c ? `<path d="${d}" class="${cls}"><title>${title(c, lang)}</title></path>` : `<path d="${d}"/>`;
  }
  return out;
}
const dots = lang => places.countries.filter(c => c.micro).map(c => { const f = all.find(f => String(f.id).replace(/^0+/, "") === num(c)); const [x, y] = proj(geoCentroid(f)); return `<g class="dot" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="pinscale" r="3.2"/><title>${title(c, lang)}</title></g>`; }).join("");
const pinShape = "M0 0C-4 -7 -5 -10 -5 -12.5a5 5 0 1 1 10 0c0 2.5 -1 5.5 -5 12.5z";
const pins = lang => places.cities.map(c => { const [x, y] = proj([c.lon, c.lat]); return `<g class="pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="pinscale"><path d="${pinShape}"/><circle cx="0" cy="-12.5" r="1.8"/></g><title>${esc(c[lang])}</title></g>`; }).join("");
fs.mkdirSync(path.join(repo, "img/flags"), { recursive: true });
for (const f of fs.readdirSync(path.join(repo, "img/flags"))) fs.unlinkSync(path.join(repo, "img/flags", f));
for (const c of places.countries) fs.copyFileSync(`node_modules/flag-icons/flags/4x3/${c.iso2}.svg`, path.join(repo, `img/flags/${c.iso2}.svg`));
const defs = `<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" style="stroke:var(--red);stroke-width:1.8"/></pattern></defs>`;
const TOTAL = 195; // 193 UN members + Vatican City + Palestine
const nVisited = places.countries.filter(c => !c.borderOnly).length;
const pct = (nVisited / TOTAL * 100).toFixed(1);
const T = {
  en: { aria: "World map: countries I have been to are coloured, the striped one is a country I only saw from its border, and cities are marked with pins. Use the buttons to zoom.", cap: "Countries I have been to are coloured; the striped one I only saw from the border. Pins mark cities.", src: "about.html", pre: "", border: "DMZ", of: "of", countries: "countries", zi: "Zoom in", zo: "Zoom out", zr: "Reset zoom" },
  eu: { aria: "Munduko mapa: egon naizen herrialdeak koloreztatuta daude, marradunak mugatik soilik ikusi dudana da, eta hiriak txintxetaz markatuta. Erabili botoiak zooma egiteko.", cap: "Egon naizen herrialdeak koloreztatuta daude; marradunean mugatik soilik egon naiz. Txintxetek hiriak markatzen dituzte.", src: "eu/about.html", pre: "../", border: "DMZ", of: "/", countries: "herrialde", zi: "Handitu", zo: "Txikitu", zr: "Berrezarri zooma" }
};
for (const lang of ["en", "eu"]) {
  const t = T[lang];
  const flags = places.countries.map(c => `<li${c.borderOnly ? ' class="border"' : ""}><img src="${t.pre}img/flags/${c.iso2}.svg" alt="" width="32" height="24"><span>${esc(c[lang])}</span>${c.visits ? `<b class="times">&times;${c.visits}</b>` : ""}${c.borderOnly ? `<em>${t.border}</em>` : ""}</li>`).join("");
  const block = `<!--map:start-->
      <figure class="travelmap" data-zi="${t.zi}" data-zo="${t.zo}" data-zr="${t.zr}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.aria}">${defs}<g class="land">${land(lang)}</g><g class="pins">${dots(lang)}${pins(lang)}</g></svg><figcaption>${t.cap}</figcaption></figure>
      <p class="mapstats"><b>${nVisited}</b> ${t.of} ${TOTAL} ${t.countries} · <b>${lang === "eu" ? pct.replace(".", ",") : pct}%</b></p>
      <ul class="flags">${flags}</ul>
      <!--map:end-->`;
  const file = path.join(repo, t.src);
  let s = fs.readFileSync(file, "utf8");
  if (s.includes("<!--map:start-->")) s = s.replace(/<!--map:start-->[\s\S]*?<!--map:end-->/, () => block);
  else s = s.replace(/(<section id="places">\s*<div class="section-title">.*?<\/div>\s*)/s, (m) => m + block + "\n      ");
  fs.writeFileSync(file, s);
}
if (missing.size) console.warn("Not in the 110m map (add a pin by hand):", [...missing]);
console.log("ok");
