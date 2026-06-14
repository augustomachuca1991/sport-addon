const https = require("https");
const fs = require("fs");

const MAX_OPCIONES = 5;
const BASE_URL = "https://augustomachuca1991.github.io/sport-addon";

const FUENTES = {
  la18hd: { url: (id) => `https://la18hd.com/vivo/canales.php?stream=${id}`, dominio: "la18hd.com" },
  latamvidz: { url: (id) => `https://latamvidz1.com/canal.php?stream=${id}`, dominio: "futbol-libres.su" },
};

const STREAM_IDS = {
  dsports: "dsports",
  tntsports: "tntsports",
  espnpremium: "espnpremium",
  // tycsport: "tycsports",
  // espn: "espn",
  // espn2: "espn2",
  // espn3: "espn3",
  // dsports2: "dsports2",
  // dsportsplus: "dsportsplus",
  // foxsports: "foxsports",
  // foxsports2: "foxsports2",
  // foxsports3: "foxsports3",
  // tudn: "tudn",
  // winsport: "winsports",
  // telefe: "telefe",
};

const CHANNELS = {
  dsports: { name: "DSports", poster: `${BASE_URL}/static/logos/dsports.svg`, logo: `${BASE_URL}/static/logos/dsports.svg`, description: "DirecTV Sports en vivo" },
  tntsports: { name: "TNT Sports", poster: `${BASE_URL}/static/logos/tntsports.svg`, logo: `${BASE_URL}/static/logos/tntsports.svg`, description: "TNT Sports en vivo" },
  espnpremium: { name: "ESPN Premium", poster: `${BASE_URL}/static/logos/espnpremium.svg`, logo: `${BASE_URL}/static/logos/espnpremium.svg`, description: "ESPN Premium en vivo" },
  // tycsport: { name: "TyC Sports", poster: `${BASE_URL}/static/logos/tycsport.svg`, logo: `${BASE_URL}/static/logos/tycsport.svg`, description: "TyC Sports en vivo" },
  // espn: { name: "ESPN", poster: `${BASE_URL}/static/logos/espn.svg`, logo: `${BASE_URL}/static/logos/espn.svg`, description: "ESPN en vivo" },
  // espn2: { name: "ESPN 2", poster: `${BASE_URL}/static/logos/espn2.svg`, logo: `${BASE_URL}/static/logos/espn2.svg`, description: "ESPN 2 en vivo" },
  // espn3: { name: "ESPN 3", poster: `${BASE_URL}/static/logos/espn3.svg`, logo: `${BASE_URL}/static/logos/espn3.svg`, description: "ESPN 3 en vivo" },
  // dsports2: { name: "DSports 2", poster: `${BASE_URL}/static/logos/dsports2.svg`, logo: `${BASE_URL}/static/logos/dsports2.svg`, description: "DirecTV Sports 2 en vivo" },
  // dsportsplus: { name: "DSports+", poster: `${BASE_URL}/static/logos/dsportsplus.svg`, logo: `${BASE_URL}/static/logos/dsportsplus.svg`, description: "DSports+ en vivo" },
  // foxsports: { name: "Fox Sports", poster: `${BASE_URL}/static/logos/foxsports.svg`, logo: `${BASE_URL}/static/logos/foxsports.svg`, description: "Fox Sports en vivo" },
  // foxsports2: { name: "Fox Sports 2", poster: `${BASE_URL}/static/logos/foxsports2.svg`, logo: `${BASE_URL}/static/logos/foxsports2.svg`, description: "Fox Sports 2 en vivo" },
  // foxsports3: { name: "Fox Sports 3", poster: `${BASE_URL}/static/logos/foxsports3.svg`, logo: `${BASE_URL}/static/logos/foxsports3.svg`, description: "Fox Sports 3 en vivo" },
  // tudn: { name: "TUDN", poster: `${BASE_URL}/static/logos/tudn.svg`, logo: `${BASE_URL}/static/logos/tudn.svg`, description: "TUDN en vivo" },
  // winsport: { name: "Win Sports+", poster: `${BASE_URL}/static/logos/winsport.svg`, logo: `${BASE_URL}/static/logos/winsport.svg`, description: "Win Sports+ en vivo" },
  // telefe: { name: "Telefe", poster: `${BASE_URL}/static/logos/telefe.svg`, logo: `${BASE_URL}/static/logos/telefe.svg`, description: "Telefe en vivo" },
};

function fetchFollow(url, referer, depth) {
  if (depth <= 0) return Promise.resolve({ status: 0, body: "", finalUrl: url });
  return new Promise(r => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: referer || url } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          const loc = res.headers.location;
          const abs = loc.startsWith("http") ? loc : new URL(loc, url).href;
          r(fetchFollow(abs, url, depth - 1));
        } else {
          r({ status: res.statusCode, type: res.headers["content-type"], body: d, finalUrl: url });
        }
      });
    }).on("error", () => r({ status: 0, body: "", finalUrl: url }));
  });
}

function extraerPlaybackURL(html) {
  const m = html.match(/playbackURL\s*=\s*"((?:[^"\\]|\\.)*)"/);
  if (!m) return null;
  return m[1].replace(/\\\//g, "/");
}

async function validarYMostrar(url, referer) {
  try {
    const r = await fetchFollow(url, referer, 5);
    if (r.status === 200 && r.type && r.type.includes("mpegurl")) {
      console.log(`    ✅ ${r.finalUrl}`);
      return true;
    }
    console.log(`    ❌ status ${r.status} type: ${r.type}`);
    return false;
  } catch (e) {
    console.log(`    ❌ ${e.message}`);
    return false;
  }
}

async function scrapearCanal(channelId) {
  const ch = CHANNELS[channelId];
  const streamId = STREAM_IDS[channelId];
  if (!ch || !streamId) return [];

  const results = [];

  for (const [nombre, fuente] of Object.entries(FUENTES)) {
    if (results.length >= MAX_OPCIONES) break;
    const url = fuente.url(streamId);
    const ref = `https://${fuente.dominio}/`;
    console.log(`  🔍 ${nombre} → ${url}`);

    const html = await fetchFollow(url, ref);
    const pb = extraerPlaybackURL(html.body);

    if (!pb) { console.log(`    ❌ no playbackURL`); continue; }

    console.log(`    📦 playbackURL: ${pb}`);
    if (!await validarYMostrar(pb, url)) { console.log(`    ❌ stream muerto`); continue; }

    const dominio = new URL(pb).hostname;
    results.push({
      title: `${ch.name} — ${nombre}`,
      url: pb,
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
    });
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

  fs.writeFileSync("streams.json", JSON.stringify(channelStreams, null, 2));
  fs.writeFileSync("docs/manifest.json", JSON.stringify(manifest, null, 2));

  ["docs/catalog/tv", "docs/stream/tv", "docs/meta/tv"].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  fs.writeFileSync("docs/catalog/tv/sports_catalog.json", JSON.stringify({ metas }, null, 2));

  for (const [id, data] of Object.entries(channelStreams)) {
    fs.writeFileSync(`docs/stream/tv/${id}.json`, JSON.stringify({ streams: data.streams || data }, null, 2));
  }
  for (const [id, ch] of Object.entries(CHANNELS)) {
    fs.writeFileSync(`docs/meta/tv/${id}.json`, JSON.stringify({
      meta: { id, type: "tv", name: ch.name, poster: ch.poster, logo: ch.logo, description: ch.description },
    }, null, 2));
  }

  console.log(`  ✅ streams.json — ${Object.keys(channelStreams).length} canales`);
  console.log(`  ✅ docs/`);

  // Clean up: delete old stream files for channels no longer active
  for (const file of fs.readdirSync("docs/stream/tv")) {
    const id = file.replace(".json", "");
    if (!CHANNELS[id]) fs.unlinkSync(`docs/stream/tv/${file}`);
  }
  for (const file of fs.readdirSync("docs/meta/tv")) {
    const id = file.replace(".json", "");
    if (!CHANNELS[id]) fs.unlinkSync(`docs/meta/tv/${file}`);
  }
}

async function main() {
  console.log(`🚀 Scrapeando — ${new Date().toLocaleString()}\n`);
  const channelStreams = {};

  for (const [id, ch] of Object.entries(CHANNELS)) {
    console.log(`\n📺 ${ch.name}`);
    const streams = await scrapearCanal(id);
    if (streams.length > 0) {
      channelStreams[id] = { ...ch, streams };
      console.log(`  ✅ ${streams.length} stream(s)`);
    } else {
      console.log(`  ⚠️ Sin streams`);
    }
  }

  generarJSONs(channelStreams);
  console.log("\n✅ Listo");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
