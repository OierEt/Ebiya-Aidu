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
import { feature, mesh, merge } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoCentroid, geoContains, geoArea } from "d3-geo";
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
countriesLib.registerLocale(require("i18n-iso-countries/langs/en.json"));
countriesLib.registerLocale(require("i18n-iso-countries/langs/eu.json"));
// Crimea belongs to Ukraine on this map
const inCrimea0 = ([lo, la]) => lo > 32 && lo < 37 && la > 44 && la < 46.5;
const polysOf = f => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates);
const polyMap = new Map(all.map(f => [String(f.id).replace(/^0+/, ""), polysOf(f)]));
const crimeaP = polyMap.get("643").filter(p => inCrimea0(p[0][0]));
polyMap.set("643", polyMap.get("643").filter(p => !inCrimea0(p[0][0])));
polyMap.set("804", polyMap.get("804").concat(crimeaP));
const nameOf = (f, c, lang) => {
  if (c) return title(c, lang);
  const a2 = countriesLib.numericToAlpha2(String(f.id).padStart(3, "0"));
  const n = a2 && (countriesLib.getName(a2, lang, { select: "alias" }) || countriesLib.getName(a2, lang));
  return esc(n || f.properties.name);
};
const polyFeat = ps => ({ type: "Feature", geometry: { type: "MultiPolygon", coordinates: ps } });
function land(lang) {
  let out = "";
  for (const f of all) {
    const id = String(f.id).replace(/^0+/, "");
    const c = byId.get(id);
    if (c) missing.delete(num(c));
    const cls = c ? (c.borderOnly ? "border" : "visited") : "";
    let ps = polyMap.get(id);
    if (c && c.mainlandOnly) ps = ps.filter(p => { const [lo, la] = geoCentroid({ type: "Feature", geometry: { type: "Polygon", coordinates: p } }); return lo > -6 && lo < 10 && la > 41 && la < 52; });
    if (!c) continue; // ordinary land is one merged path (baseLand): no hover name for countries I have not visited
    const d = gp(polyFeat(ps)); if (!d) continue;
    out += cls ? `<path d="${d}" class="${cls}"><title>${nameOf(f, c, lang)}</title></path>` : `<path d="${d}"/>`; // only visited countries get a hover name
  }
  return out;
}
const dots = lang => places.countries.filter(c => c.micro).map(c => { const f = all.find(f => String(f.id).replace(/^0+/, "") === num(c)); const [x, y] = proj(geoCentroid(f)); return `<g class="dot" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle class="pinscale" r="3.2"/><title>${title(c, lang)}</title></g>`; }).join("");
// Borders: solid for ordinary ones; dotted for Western Sahara, the Crimea link and the outline of Euskal Herria
const coll = { type: "GeometryCollection", geometries: topo.objects.countries.geometries.filter(g => g.id !== "010") };
const isWS = g => g.id === "732";
const isWSMor = (a, b) => (a.id === "732" && b.id === "504") || (a.id === "504" && b.id === "732");
const isCrimeaPair = (a, b) => (a.id === "804" && b.id === "643") || (a.id === "643" && b.id === "804");
const inCrimea = ([lo, la]) => lo > 32 && lo < 37 && la > 44 && la < 46.5;
const solid = mesh(topo, coll, (a, b) => a !== b && !isWSMor(a, b) && !isCrimeaPair(a, b)); // the Morocco/Western Sahara wall is not drawn
// Western Sahara: the 50m data gives Morocco the western part (up to the sand wall). We hide that wall and
// draw instead the straight northern frontier along 27°40'N, from the Atlantic coast to 8°40'W, as a dotted line.
const landGeo = merge(topo, coll.geometries);
let wsLon = -8.68; while (geoContains(landGeo, [wsLon - 0.02, 27.667]) && wsLon > -16) wsLon -= 0.02;
const wsDots = { type: "LineString", coordinates: [[-8.68, 27.667], [wsLon, 27.667]] };
const ukRu = mesh(topo, coll, (a, b) => a !== b && isCrimeaPair(a, b));
const ukRuRest = { type: "MultiLineString", coordinates: ukRu.coordinates.filter(l => !l.every(inCrimea)) }; // Crimea link not drawn: Crimea is Ukraine
const coast = mesh(topo, coll, (a, b) => a === b);
// Euskal Herria: Hego Euskal Herria from es-atlas provinces + hand-drawn northern part (approximate)
const es = require("es-atlas/es/provinces.json");
const hego = merge(es, es.objects.provinces.geometries.filter(g => ["Gipuzkoa", "Navarra", "Bizkaia", "Araba/Álava"].includes(g.properties.name)));
const ring = hego.coordinates.map(p => p[0]).sort((a, b) => b.length - a.length)[0].slice(0, -1);
const near = pt => ring.reduce((bi, p, i) => (Math.hypot(p[0] - pt[0], p[1] - pt[1]) < Math.hypot(ring[bi][0] - pt[0], ring[bi][1] - pt[1]) ? i : bi), 0);
const iA = near([-1.79, 43.39]), iB = near([-0.74, 42.93]);
const path1 = [], path2 = [];
for (let k = iA; ; k = (k + 1) % ring.length) { path1.push(ring[k]); if (k === iB) break; }
for (let k = iB; ; k = (k + 1) % ring.length) { path2.push(ring[k]); if (k === iA) break; }
const mean = p => p.reduce((s, q) => s + q[1], 0) / p.length;
const southPath = mean(path1) < mean(path2) ? path1 : path2; // the way round that is NOT the French border
const north = [[-1.78, 43.37], [-1.66, 43.39], [-1.56, 43.48], [-1.51, 43.53], [-1.40, 43.52], [-1.22, 43.50], [-1.05, 43.45], [-0.95, 43.38], [-0.90, 43.30], [-0.78, 43.26], [-0.70, 43.20], [-0.68, 43.08]];
const euskal = { type: "LineString", coordinates: (southPath[0] === ring[iB] ? southPath : southPath.slice().reverse()).concat([]).reverse().concat([]) };
// southPath runs between the two tripoints through the south; close it with the northern arc
const sp = southPath[0] === ring[iA] ? southPath : southPath.slice().reverse(); // starts at Bidasoa mouth, ends at east tripoint
euskal.coordinates = sp.concat(north.slice().reverse()).concat([sp[0]]);
const borders = `<g class="borders"><path d="${gp(solid)}${gp(ukRuRest)}"/><path d="${gp(coast)}"/><path class="dots" d="${gp(wsDots)}${gp(euskal)}"/></g>`;
const ehPoly = { type: "Polygon", coordinates: [euskal.coordinates] };
if (geoArea(ehPoly) > 2 * Math.PI) ehPoly.coordinates[0].reverse();
const ehHit = lang => `<path class="hit" d="${gp(ehPoly)}"><title>Euskal Herria</title></path>`;
const baseLand = gp(merge(topo, coll.geometries));
const pinShape = "M0 0C-4 -7 -5 -10 -5 -12.5a5 5 0 1 1 10 0c0 2.5 -1 5.5 -5 12.5z";
const pins = lang => places.cities.map(c => { const [x, y] = proj([c.lon, c.lat]); return `<g class="pin" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="pinscale"><path d="${pinShape}"/><circle cx="0" cy="-12.5" r="1.8"/></g><title>${esc(c[lang])}</title></g>`; }).join("");
fs.mkdirSync(path.join(repo, "img/flags"), { recursive: true });
for (const f of fs.readdirSync(path.join(repo, "img/flags"))) fs.unlinkSync(path.join(repo, "img/flags", f));
for (const c of places.countries) fs.copyFileSync(`node_modules/flag-icons/flags/4x3/${c.iso2}.svg`, path.join(repo, `img/flags/${c.iso2}.svg`));
const defs = `<defs><pattern id="hatch" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="2.6" style="stroke:var(--red);stroke-width:1"/></pattern></defs>`;
const TOTAL = 195; // 193 UN members + Vatican City + Palestine
const nVisited = places.countries.filter(c => !c.borderOnly).length;
const pct = (nVisited / TOTAL * 100).toFixed(1);
const T = {
  en: { aria: "World map: countries I have been to are coloured, the striped one is a country I only saw from its border, dotted lines mark Crimea, Western Sahara and Euskal Herria. Use the buttons to zoom.", cap: "Countries I have been to are coloured; the striped one (DMZ) I only saw from the border.", src: "about.html", pre: "", border: "DMZ", of: "of", countries: "countries", zi: "Zoom in", zo: "Zoom out", zr: "Reset zoom" },
  eu: { aria: "Munduko mapa: egon naizen herrialdeak koloreztatuta daude, marradunak mugatik soilik ikusi dudana da, eta puntuzko lerroek Krimea, Mendebaldeko Sahara eta Euskal Herria markatzen dituzte. Erabili botoiak zooma egiteko.", cap: "Egon naizen herrialdeak koloreztatuta daude; marradunean mugatik soilik egon naiz (DMZ).", src: "eu/about.html", pre: "../", border: "DMZ", of: "/", countries: "herrialde", zi: "Handitu", zo: "Txikitu", zr: "Berrezarri zooma" }
};
for (const lang of ["en", "eu"]) {
  const t = T[lang];
  const sorted = [...places.countries].sort((a, b) => (a.borderOnly ? 1 : 0) - (b.borderOnly ? 1 : 0) || a[lang].localeCompare(b[lang], lang));
  const flags = sorted.map(c => `<li${c.borderOnly ? ' class="border"' : ""}><img src="${t.pre}img/flags/${c.iso2}.svg" alt="" width="32" height="24"><span>${esc(c[lang])}</span>${c.visits ? `<b class="times">&times;${c.visits}</b>` : ""}${c.borderOnly ? `<em>${t.border}</em>` : ""}</li>`).join("");
  const block = `<!--map:start-->
      <figure class="travelmap" data-zi="${t.zi}" data-zo="${t.zo}" data-zr="${t.zr}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.aria}">${defs}<g class="land"><path d="${baseLand}"/>${land(lang)}</g>${borders}${ehHit(lang)}<g class="pins">${dots(lang)}${pins(lang)}</g></svg></figure>
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
