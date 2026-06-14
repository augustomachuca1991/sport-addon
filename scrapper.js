const https = require("https");
const fs = require("fs");

const MAX_OPCIONES = 5;
const BASE_URL = "https://augustomachuca1991.github.io/sport-addon";

const FUTBOL_LIBRE_IDS = {
  dsports: "dsports",
  tntsports: "tntsports",
  tycsport: "tycsports",
};

const TVLIBRE_SLUGS = {
  dsports: "dsports",
  tntsports: "tnt-sports",
  tycsport: "tyc-sports",
};

const CHANNELS = {
  dsports: {
    name: "DSports",
    poster: `${BASE_URL}/static/logos/dsports.svg`,
    logo: `${BASE_URL}/static/logos/dsports.svg`,
    description: "DirecTV Sports en vivo",
  },
  tntsports: {
    name: "TNT Sports",
    poster: `${BASE_URL}/static/logos/tntsports.svg`,
    logo: `${BASE_URL}/static/logos/tntsports.svg`,
    description: "TNT Sports en vivo",
  },
  tycsport: {
    name: "TyC Sports",
    poster: `${BASE_URL}/static/logos/tycsport.svg`,
    logo: `${BASE_URL}/static/logos/tycsport.svg`,
    description: "TyC Sports en vivo",
  },
};

function fetchWithRedirect(url, referer, depth) {
  if (depth <= 0) return Promise.resolve({ status: 0, body: "" });
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: referer || url,
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          const loc = res.headers.location;
          const abs = loc.startsWith("http") ? loc : new URL(loc, url).href;
          resolve(fetchWithRedirect(abs, url, depth - 1));
        } else {
          resolve({ status: res.statusCode, type: res.headers["content-type"], body: data });
        }
      });
    }).on("error", () => resolve({ status: 0, body: "" }));
  });
}

function fetchHtml(url, referer) {
  return fetchWithRedirect(url, referer, 5).then(r => r.body || "");
}

function extraerPlaybackURL(html) {
  const m = html.match(/playbackURL\s*=\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return null;
  return m[1].replace(/\\\//g, "/");
}

async function validarStream(url, referer) {
  try {
    const r = await fetchWithRedirect(url, referer, 5);
    return r.status === 200 && r.type && r.type.includes("mpegurl");
  } catch {
    return false;
  }
}

function makeStreamEntry(title, url, dominio) {
  return {
    title,
    url,
    behaviorHints: {
      notWebReady: true,
      proxyHeaders: {
        request: {
          Origin: `https://${dominio}`,
          Referer: `https://${dominio}/`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    },
  };
}

async function scrapeFutbolLibre(channelId) {
  const streamId = FUTBOL_LIBRE_IDS[channelId];
  if (!streamId) return [];

  const ch = CHANNELS[channelId];
  const url = `https://latamvidz1.com/canal.php?stream=${streamId}`;
  const ref = `https://futbol-libres.su/${streamId}/`;

  console.log(`    📡 futbol-libres → ${url}`);

  const html = await fetchHtml(url, ref);
  const pb = extraerPlaybackURL(html);
  if (!pb) {
    console.log(`    ❌ no playbackURL`);
    return [];
  }

  const dominio = new URL(pb).hostname;
  console.log(`    🔍 validando ${pb.substring(0, 80)}...`);

  if (await validarStream(pb, url)) {
    console.log(`    ✅ ${dominio}`);
    return [makeStreamEntry(`${ch.name} — futbol-libres`, pb, dominio)];
  } else {
    console.log(`    ❌ stream muerto`);
    return [];
  }
}

async function scrapeTvlibre(channelId) {
  const slug = TVLIBRE_SLUGS[channelId];
  if (!slug) return [];

  const ch = CHANNELS[channelId];
  const pageUrl = `https://tvlibre-online.com/en-vivo/${slug}/`;
  const ref = `https://tvlibre-online.com/`;

  console.log(`    📡 tvlibre-online → ${pageUrl}`);

  const html = await fetchHtml(pageUrl, ref);
  const options = [...html.matchAll(/onclick="document.getElementById\('iframe'\)\.src='([^']+)'/g)];

  if (options.length === 0) {
    console.log(`    ❌ no se encontraron opciones`);
    return [];
  }

  const results = [];
  for (const m of options) {
    const iframeUrl = m[1];
    if (!iframeUrl.includes("la18hd.com") && !iframeUrl.includes("streamtpday1.xyz")) continue;
    if (results.length >= MAX_OPCIONES) break;

    console.log(`    🔍 ${iframeUrl.substring(0, 70)}...`);
    const iframeHtml = await fetchHtml(iframeUrl, pageUrl);
    const pb = extraerPlaybackURL(iframeHtml);

    if (!pb) {
      console.log(`      ❌ no playbackURL`);
      continue;
    }

    const dominio = new URL(pb).hostname;
    if (await validarStream(pb, iframeUrl)) {
      console.log(`      ✅ ${dominio}`);
      results.push(makeStreamEntry(`${ch.name} — ${dominio}`, pb, dominio));
    } else {
      console.log(`      ❌ stream muerto`);
    }
  }

  return results;
}

function generarJSONs(channelStreams) {
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
    id, type: "tv", name: ch.name, poster: ch.poster, logo: ch.logo, description: ch.description,
  }));

  const catalogData = { metas };

  fs.writeFileSync("streams.json", JSON.stringify(channelStreams, null, 2));
  fs.writeFileSync("docs/manifest.json", JSON.stringify(manifest, null, 2));

  const docsCatalogDir = "docs/catalog/tv";
  if (!fs.existsSync(docsCatalogDir)) fs.mkdirSync(docsCatalogDir, { recursive: true });
  fs.writeFileSync(`${docsCatalogDir}/sports_catalog.json`, JSON.stringify(catalogData, null, 2));

  const docsStreamDir = "docs/stream/tv";
  if (!fs.existsSync(docsStreamDir)) fs.mkdirSync(docsStreamDir, { recursive: true });
  for (const [id, data] of Object.entries(channelStreams)) {
    fs.writeFileSync(`${docsStreamDir}/${id}.json`, JSON.stringify({ streams: data.streams || data }, null, 2));
  }

  const docsMetaDir = "docs/meta/tv";
  if (!fs.existsSync(docsMetaDir)) fs.mkdirSync(docsMetaDir, { recursive: true });
  for (const [id, ch] of Object.entries(CHANNELS)) {
    fs.writeFileSync(`${docsMetaDir}/${id}.json`, JSON.stringify({
      meta: { id, type: "tv", name: ch.name, poster: ch.poster, logo: ch.logo, description: ch.description },
    }, null, 2));
  }

  console.log(`\n  ✅ streams.json — ${Object.keys(channelStreams).length} canales`);
  console.log(`  ✅ docs/manifest.json`);
  console.log(`  ✅ docs/catalog/tv/sports_catalog.json — ${metas.length} canales`);
  console.log(`  ✅ docs/stream/tv/ — ${Object.keys(channelStreams).length} archivos`);
  console.log(`  ✅ docs/meta/tv/ — ${Object.keys(CHANNELS).length} archivos`);
}

async function main() {
  console.log(`🚀 Scrapeando streams — ${new Date().toLocaleString()}\n`);

  const channelStreams = {};

  for (const [id, ch] of Object.entries(CHANNELS)) {
    console.log(`\n📺 ${ch.name}`);

    const futbolLibreStreams = await scrapeFutbolLibre(id);
    const tvlibreStreams = await scrapeTvlibre(id);

    let allStreams = [...futbolLibreStreams, ...tvlibreStreams];

    allStreams.sort((a, b) => {
      const aLa = a.title.includes("la18hd.com") || a.title.includes("futbol-libres");
      const bLa = b.title.includes("la18hd.com") || b.title.includes("futbol-libres");
      if (aLa && !bLa) return -1;
      if (!aLa && bLa) return 1;
      return 0;
    });

    const selected = allStreams.slice(0, MAX_OPCIONES);

    if (selected.length > 0) {
      channelStreams[id] = { ...ch, streams: selected };
      console.log(`  ✅ ${selected.length} stream(s)`);
    } else {
      console.log(`  ⚠️ Sin streams`);
    }
  }

  generarJSONs(channelStreams);
  console.log("\n✅ Scraping completado");
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
