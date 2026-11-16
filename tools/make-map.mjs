// One-off helper (NOT part of the website): draws the travel map and the flag row of the About page.
// Edit tools/places.json (countries with ISO 2-letter code, cities with lat/lon), then:
//   mkdir /tmp/mapbuild && cd /tmp/mapbuild && npm init -y && npm install world-atlas topojson-client d3-geo flag-icons i18n-iso-countries
//   cp <repo>/tools/make-map.mjs <repo>/tools/places.json . && node make-map.mjs <repo>
// It rewrites the block between <!--map:start--> and <!--map:end--> in about.html and eu/about.html and copies the flags to img/flags/.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import countriesLib from "i18n-iso-countries";
const require = createRequire(import.meta.url);
const repo = process.argv[2];
const places = JSON.parse(fs.readFileSync(new URL("./places.json", import.meta.url)));
const topo = require("world-atlas/countries-110m.json");
const all = feature(topo, topo.objects.countries).features.filter(f => f.id !== "010"); // no Antarctica
const W = 960, H = 480;
const proj = geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: "FeatureCollection", features: all });
const gp = geoPath(proj).digits(1);
const visitedIds = new Map(places.countries.map(c => [countriesLib.alpha2ToNumeric(c.iso2.toUpperCase()).replace(/^0+/, ""), c]));
let land = "", missing = new Set(visitedIds.keys());
for (const f of all) {
  const key = String(f.id).replace(/^0+/, "");
  const c = visitedIds.get(key); if (c) missing.delete(key);
  const d = gp(f); if (!d) continue;
  land += `<path d="${d}"${c ? ` class="visited"><title>${c.en}</title></path>` : "/>"}`;
}
if (missing.size) console.warn("Not in the 110m map (add a marker by hand):", [...missing]);
const pinShape = "M0 0C-4 -7 -5 -10 -5 -12.5a5 5 0 1 1 10 0c0 2.5 -1 5.5 -5 12.5z";
const pins = places.cities.map(c => { const [x, y] = proj([c.lon, c.lat]); return `<g class="pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="${pinShape}"/><circle cx="0" cy="-12.5" r="1.8"/><title>${c.en}</title></g>`; }).join("");
fs.mkdirSync(path.join(repo, "img/flags"), { recursive: true });
for (const c of places.countries) fs.copyFileSync(`node_modules/flag-icons/flags/4x3/${c.iso2}.svg`, path.join(repo, `img/flags/${c.iso2}.svg`));
const T = {
  en: { aria: "World map: countries I have been to are coloured and cities are marked with pins.", cap: "Countries I have been to are coloured; pins mark cities.", src: "about.html", pre: "" },
  eu: { aria: "Munduko mapa: egon naizen herrialdeak koloreztatuta daude eta hiriak txintxetaz markatuta.", cap: "Egon naizen herrialdeak koloreztatuta daude; txintxetek hiriak markatzen dituzte.", src: "eu/about.html", pre: "../" }
};
for (const lang of ["en", "eu"]) {
  const t = T[lang];
  const flags = places.countries.map(c => `<li><img src="${t.pre}img/flags/${c.iso2}.svg" alt="" width="32" height="24"><span>${c[lang]}</span></li>`).join("");
  const block = `<!--map:start-->
      <figure class="travelmap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.aria}"><g class="land">${land}</g><g class="pins">${pins}</g></svg><figcaption>${t.cap}</figcaption></figure>
      <ul class="flags">${flags}</ul>
      <!--map:end-->`;
  const file = path.join(repo, t.src);
  let s = fs.readFileSync(file, "utf8");
  if (s.includes("<!--map:start-->")) s = s.replace(/<!--map:start-->[\s\S]*?<!--map:end-->/, () => block);
  else s = s.replace(/(<section id="places">\s*<div class="section-title">.*?<\/div>\s*)/s, (m) => m + block + "\n      ");
  fs.writeFileSync(file, s);
}
console.log("ok, svg paths:", land.length, "bytes");
