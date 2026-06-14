const puppeteer = require("puppeteer");
const https = require("https");
const fs = require("fs");

const MAX_OPCIONES = 5;

const POST_IDS = {
  dsports: { post: 47, slug: "directv-sports" },
  tntsports: { post: 50, slug: "tnt-sports" },
  espnpremium: { post: 35, slug: "espn-premium" },
  tycsport: { post: 91, slug: "tyc-sports" },
  espn: { post: 32, slug: "espn-1" },
  espn2: { post: 33, slug: "espn-2" },
  espn3: { post: 34, slug: "espn-3" },
  dsports2: { post: 49, slug: "directv-sports-2" },
  foxsports: { post: 37, slug: "fox-sports" },
  foxsports2: { post: 38, slug: "fox-sports-2" },
  foxsports3: { post: 39, slug: "fox-sports-3" },
  tudn: { post: 89, slug: "tudn" },
  winsport: { post: 702, slug: "win-sports" },
  telefe: { post: 348, slug: "telefe" },
};

const CHANNELS = {
  dsports: {
    name: "DSports",
    poster: "https://imgs.search.brave.com/ZkIS7DI98QxJd0-A9f1zMs9X83l-7gYScPztHxYMfOk/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2xv/Z29wZWRpYS9pbWFn/ZXMvMS8xNS9EaXJl/Y1RWU3BvcnRzMjAx/OC5wbmcvcmV2aXNp/b24vbGF0ZXN0L3Nt/YXJ0L3dpZHRoLzE2/MC9oZWlnaHQvMTIw/P2NiPTIwMTgwMzAx/MjMzODA0",
    logo: "https://bestleague.world/img/dsportsplus.webp",
    description: "DirecTV Sports en vivo",
  },
  tntsports: {
    name: "TNT Sports",
    poster: "https://imgs.search.brave.com/bVoS1l-fg9Smd76bBVrKdAy07e5_9cgNhYaE4vN2_BA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9MNVFkSzZwWmVI/c2U5THo5dUc1cDdo/SjFCTWRFX3VxSU1N/N1dTeEJLVlJCaTgz/ZFRIdlVOT1lQSjRG/SWczNlpTeXBJPXcy/NDAtaDQ4MC1ydw",
    logo: "https://assets.tntsports.com.ar/__export/1717073602419/sites/tntsports/arte/logo_header_blanco_20240530.svg",
    description: "TNT Sports en vivo",
  },
  espnpremium: {
    name: "ESPN Premium",
    poster: "https://angulismo-pics.pages.dev/espn-premium.png",
    logo: "https://imgs.search.brave.com/BoO3XQfLmGrGe7PEeBxPtiJC-pAhy_PM-BQvFg544rY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9hL2ExL0VT/UE5fUHJlbWl1bV9s/b2dvLnN2Zy8yNTBw/eC1FU1BOX1ByZW1p/dW1fbG9nby5zdmcu/cG5n",
    description: "ESPN Premium en vivo",
  },
  tycsport: {
    name: "TyC Sports",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/TyC_Sports_logo.svg/512px-TyC_Sports_logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/60/TyC_Sports_logo.svg",
    description: "TyC Sports en vivo",
  },
  espn: {
    name: "ESPN",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg",
    description: "ESPN en vivo",
  },
  espn2: {
    name: "ESPN 2",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/ESPN2_logo.svg/512px-ESPN2_logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/ESPN2_logo.svg",
    description: "ESPN 2 en vivo",
  },
  espn3: {
    name: "ESPN 3",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/ESPN3_logo.svg/512px-ESPN3_logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/ESPN3_logo.svg",
    description: "ESPN 3 en vivo",
  },
  dsports2: {
    name: "DSports 2",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DIRECTV_Sports_2_Latin_America_%282018%29.svg/512px-DIRECTV_Sports_2_Latin_America_%282018%29.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/DIRECTV_Sports_2_Latin_America_%282018%29.svg",
    description: "DirecTV Sports 2 en vivo",
  },
  foxsports: {
    name: "Fox Sports",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Fox_Sports_wordmark_logo.svg/512px-Fox_Sports_wordmark_logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Fox_Sports_wordmark_logo.svg",
    description: "Fox Sports en vivo",
  },
  foxsports2: {
    name: "Fox Sports 2",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Fox_Sports_2_Argentina_2023.svg/512px-Fox_Sports_2_Argentina_2023.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Fox_Sports_2_Argentina_2023.svg",
    description: "Fox Sports 2 en vivo",
  },
  foxsports3: {
    name: "Fox Sports 3",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Fox_Sports_3_Argentina_2023.svg/512px-Fox_Sports_3_Argentina_2023.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Fox_Sports_3_Argentina_2023.svg",
    description: "Fox Sports 3 en vivo",
  },
  tudn: {
    name: "TUDN",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/TUDN_Logo.svg/512px-TUDN_Logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/TUDN_Logo.svg",
    description: "TUDN en vivo",
  },
  winsport: {
    name: "Win Sports+",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Win_Sports_nuevo_logo.svg/512px-Win_Sports_nuevo_logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Win_Sports_nuevo_logo.svg",
    description: "Win Sports+ en vivo",
  },
  telefe: {
    name: "Telefe",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Telefe-Logo.svg/512px-Telefe-Logo.svg.png",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Telefe-Logo.svg",
    description: "Telefe en vivo",
  },
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
          ...(capturada.includes(".mpd") && {
            behaviorHints: {
              notWebReady: true,
              proxyHeaders: {
                request: { Origin: `https://${dominio}`, Referer: `https://${dominio}/`, "User-Agent": "Mozilla/5.0" },
              },
            },
          }),
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

  console.log(`\n  ✅ streams.json — ${Object.keys(channelStreams).length} canales`);
  console.log(`  ✅ docs/manifest.json`);
  console.log(`  ✅ docs/catalog/tv/sports_catalog.json — ${metas.length} canales`);
  console.log(`  ✅ docs/stream/tv/ — ${Object.keys(channelStreams).length} archivos`);
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
