// Genera docs/ sin scraping (para commit inicial)
// Los streams los llena el workflow en GitHub Actions
const fs = require("fs");

const BASE_URL = "https://augustomachuca1991.github.io/sport-addon";

const CHANNELS = {
  dsports: { name: "DSports", description: "DirecTV Sports en vivo" },
  tntsports: { name: "TNT Sports", description: "TNT Sports en vivo" },
  tycsport: { name: "TyC Sports", description: "TyC Sports en vivo" },
};

const imgUrl = (id) => `${BASE_URL}/static/logos/${id}.svg`;

const manifest = {
  id: "org.local.sports.autoquality",
  version: "1.2.0",
  name: "Sports Auto Quality",
  description: "Canales deportivos en vivo",
  resources: ["catalog", "meta", "stream"],
  types: ["tv"],
  idPrefixes: Object.keys(CHANNELS),
  catalogs: [{ type: "tv", id: "sports_catalog", name: "Sports" }],
};

const metas = Object.entries(CHANNELS).map(([id, ch]) => ({
  id, type: "tv", name: ch.name,
  poster: imgUrl(id), logo: imgUrl(id), description: ch.description,
}));

fs.writeFileSync("streams.json", "{}");
fs.writeFileSync("docs/manifest.json", JSON.stringify(manifest, null, 2));

const docsCatalogDir = "docs/catalog/tv";
fs.mkdirSync(docsCatalogDir, { recursive: true });
fs.writeFileSync(`${docsCatalogDir}/sports_catalog.json`, JSON.stringify({ metas }, null, 2));

const docsMetaDir = "docs/meta/tv";
fs.mkdirSync(docsMetaDir, { recursive: true });
for (const [id, ch] of Object.entries(CHANNELS)) {
  fs.writeFileSync(`${docsMetaDir}/${id}.json`, JSON.stringify({
    meta: { id, type: "tv", name: ch.name, poster: imgUrl(id), logo: imgUrl(id), description: ch.description },
  }, null, 2));
}

const docsStreamDir = "docs/stream/tv";
fs.mkdirSync(docsStreamDir, { recursive: true });
for (const id of Object.keys(CHANNELS)) {
  fs.writeFileSync(`${docsStreamDir}/${id}.json`, JSON.stringify({ streams: [] }, null, 2));
}

console.log("✅ docs/ generado exitosamente");
console.log(`   - manifest.json`);
console.log(`   - catalog/tv/sports_catalog.json (${metas.length} canales)`);
console.log(`   - meta/tv/ (${Object.keys(CHANNELS).length} archivos)`);
console.log(`   - stream/tv/ (${Object.keys(CHANNELS).length} archivos, vacíos para llenar con workflow)`);
