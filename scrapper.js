const puppeteer = require("puppeteer");
const https = require("https");
const fs = require("fs");

const MAX_OPCIONES = 5;

const POST_IDS = {
  dsports: { post: 47, slug: "directv-sports" },
  tntsports: { post: 50, slug: "tnt-sports" },
  // espnpremium: { post: 35, slug: "espn-premium" },
  // tycsport: { post: 91, slug: "tyc-sports" },
  // espn: { post: 32, slug: "espn-1" },
  // espn2: { post: 33, slug: "espn-2" },
  // espn3: { post: 34, slug: "espn-3" },
  // dsports2: { post: 49, slug: "directv-sports-2" },
  // foxsports: { post: 37, slug: "fox-sports" },
  // foxsports2: { post: 38, slug: "fox-sports-2" },
  // foxsports3: { post: 39, slug: "fox-sports-3" },
  // tudn: { post: 89, slug: "tudn" },
  // winsport: { post: 702, slug: "win-sports" },
  // telefe: { post: 348, slug: "telefe" },
};

const BASE_URL = "https://augustomachuca1991.github.io/sport-addon";

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
  // espnpremium: {
  //   name: "ESPN Premium",
  //   poster: `${BASE_URL}/static/logos/espnpremium.svg`,
  //   logo: `${BASE_URL}/static/logos/espnpremium.svg`,
  //   description: "ESPN Premium en vivo",
  // },
  // tycsport: {
  //   name: "TyC Sports",
  //   poster: `${BASE_URL}/static/logos/tycsport.svg`,
  //   logo: `${BASE_URL}/static/logos/tycsport.svg`,
  //   description: "TyC Sports en vivo",
  // },
  // espn: {
  //   name: "ESPN",
  //   poster: `${BASE_URL}/static/logos/espn.svg`,
  //   logo: `${BASE_URL}/static/logos/espn.svg`,
  //   description: "ESPN en vivo",
  // },
  // espn2: {
  //   name: "ESPN 2",
  //   poster: `${BASE_URL}/static/logos/espn2.svg`,
  //   logo: `${BASE_URL}/static/logos/espn2.svg`,
  //   description: "ESPN 2 en vivo",
  // },
  // espn3: {
  //   name: "ESPN 3",
  //   poster: `${BASE_URL}/static/logos/espn3.svg`,
  //   logo: `${BASE_URL}/static/logos/espn3.svg`,
  //   description: "ESPN 3 en vivo",
  // },
  // dsports2: {
  //   name: "DSports 2",
  //   poster: `${BASE_URL}/static/logos/dsports2.svg`,
  //   logo: `${BASE_URL}/static/logos/dsports2.svg`,
  //   description: "DirecTV Sports 2 en vivo",
  // },
  // foxsports: {
  //   name: "Fox Sports",
  //   poster: `${BASE_URL}/static/logos/foxsports.svg`,
  //   logo: `${BASE_URL}/static/logos/foxsports.svg`,
  //   description: "Fox Sports en vivo",
  // },
  // foxsports2: {
  //   name: "Fox Sports 2",
  //   poster: `${BASE_URL}/static/logos/foxsports2.svg`,
  //   logo: `${BASE_URL}/static/logos/foxsports2.svg`,
  //   description: "Fox Sports 2 en vivo",
  // },
  // foxsports3: {
  //   name: "Fox Sports 3",
  //   poster: `${BASE_URL}/static/logos/foxsports3.svg`,
  //   logo: `${BASE_URL}/static/logos/foxsports3.svg`,
  //   description: "Fox Sports 3 en vivo",
  // },
  // tudn: {
  //   name: "TUDN",
  //   poster: `${BASE_URL}/static/logos/tudn.svg`,
  //   logo: `${BASE_URL}/static/logos/tudn.svg`,
  //   description: "TUDN en vivo",
  // },
  // winsport: {
  //   name: "Win Sports+",
  //   poster: `${BASE_URL}/static/logos/winsport.svg`,
  //   logo: `${BASE_URL}/static/logos/winsport.svg`,
  //   description: "Win Sports+ en vivo",
  // },
  // telefe: {
  //   name: "Telefe",
  //   poster: `${BASE_URL}/static/logos/telefe.svg`,
  //   logo: `${BASE_URL}/static/logos/telefe.svg`,
  //   description: "Telefe en vivo",
  // },
};

function fetchJSON(url, referer) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0", Referer: referer } }, (res) => {
      let d = "";
      res.on("data", (c) => d += c);
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

async function obtenerEmbedUrls() {
  const results = {};
  for (const [canal, info] of Object.entries(POST_IDS)) {
    const urls = [];
    for (let nume = 1; nume <= MAX_OPCIONES; nume++) {
      try {
        const urlStr = `https://deporflix.net/wp-json/dooplayer/v2/${info.post}/movie/${nume}`;
        const referer = `https://deporflix.net/canales/${info.slug}/`;
        const json = await fetchJSON(urlStr, referer);
        if (!json.embed_url) continue;

        let url = json.embed_url.trim();
        if (json.type === "dtshcode") {
          const m = url.match(/src="([^"]+)"/);
          if (m) url = m[1];
          else continue;
        }
        url = url.replace(/[\t]+$/, "").trim();
        urls.push(url);
      } catch (e) {
        break;
      }
    }
    if (urls.length > 0) results[canal] = urls;
    console.log(`  📡 ${CHANNELS[canal]?.name || canal}: ${urls.length} fuente(s)`);
  }
  return results;
}

async function capturarStreams(browser, urls, nombre) {
  const streams = [];
  for (const [i, url] of urls.entries()) {
    const page = await browser.newPage();
    let capturada = null;
    let dominio;
    try { dominio = new URL(url).hostname; } catch (e) { dominio = `fuente_${i + 1}`; }

    page.on("request", (req) => {
      const u = req.url();
      if ((u.includes(".m3u8") || u.includes(".mpd")) && !capturada) capturada = u;
    });

    try {
      console.log(`    🔍 ${nombre} — ${dominio}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 8000));
      if (capturada) {
        console.log(`    ✅ ${capturada.substring(0, 80)}`);
        streams.push({
          title: `${nombre} — ${dominio}`,
          url: capturada,
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
    } catch (err) {
      console.log(`    ❌ ${err.message}`);
    }
    await page.close();
  }
  return streams;
}

function generarJSONs(channelStreams) {
  const docsDir = path => `docs/${path}`;

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

  const embedUrls = await obtenerEmbedUrls();
  const channelStreams = {};

  if (Object.keys(embedUrls).length === 0) {
    console.log("⚠️ deporflix no respondió, se genera JSON vacío");
    generarJSONs(channelStreams);
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const [canal, urls] of Object.entries(embedUrls)) {
    const ch = CHANNELS[canal];
    if (!ch) { console.log(`\n⚠️ Canal ${canal} sin metadatos, se omite`); continue; }
    console.log(`\n📺 ${ch.name} (${urls.length} fuentes)`);
    const streams = await capturarStreams(browser, urls, ch.name);
    if (streams.length > 0) {
      channelStreams[canal] = { ...ch, streams };
      console.log(`  ✅ ${streams.length} stream(s)`);
    } else {
      console.log(`  ⚠️ Sin streams`);
    }
  }

  await browser.close();
  generarJSONs(channelStreams);
  console.log("\n✅ Scraping completado");
}

main().catch((err) => {
  console.error("❌ Error fatal:", err.message);
  process.exit(1);
});
