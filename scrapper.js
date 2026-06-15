require("dotenv").config();

const puppeteer = require("puppeteer");

const RENDER_URL = process.env.RENDER_URL || "https://sport-addon.onrender.com";
const CONCURRENCY = parseInt(process.env.CONCURRENCY, 10) || 4;
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT, 10) || 15000;
const POST_WAIT_MS = parseInt(process.env.POST_WAIT_MS, 10) || 4000;

const CANALES = {
  dsports: {
    nombre: "DSports",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RFNwb3J0c0hE&lang=1",
      "https://nebunexa.life/cvatt.html?get=RFNwb3J0c0hE&lang=1",
      "https://la14hd.com/vivo/canales.php?stream=dsports",
      "https://la18hd.com/vivo/canales.php?stream=dsports",
      "https://streamtpday1.xyz/global1.php?stream=dsports",
      "https://skylivefu.com/live.php?stream=dsports",
    ],
  },
  tycsports: {
    nombre: "TyC Sports",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=VHlDU3BvcnQ&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=tycsports",
      "https://streamtpday1.xyz/global1.php?stream=tycsports",
      "https://welivesports.cfd/embed/tycsportarg.php",
      "https://skylivefu.com/live.php?stream=tycsports",
    ],
  },
  tntsports: {
    nombre: "TNT Sports",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=VE5UX1Nwb3J0c19IRA&lang=1",
      "https://nebunexa.life/cvatt.html?get=VE5UX1Nwb3J0c19IRA&lang=1",
      "https://la14hd.com/vivo/canales.php?stream=tntsports",
      "https://la18hd.com/vivo/canal.php?stream=tntsports",
      "https://streamtpday1.xyz/global1.php?stream=tntsports",
      "https://skylivefu.com/live.php?stream=tntsports",
    ],
  },
  espnpremium: {
    nombre: "ESPN Premium",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94X1Nwb3J0c19QcmVtaXVuX0hE&lang=1",
      "https://nebunexa.life/cvatt.html?get=Rm94X1Nwb3J0c19QcmVtaXVuX0hE&lang=1",
      "https://la14hd.com/vivo/canales.php?stream=espnpremium",
      "https://la18hd.com/vivo/canales.php?stream=espnpremium",
      "https://skylivefu.com/live.php?stream=espnpremium",
    ],
  },
  espn1: {
    nombre: "ESPN 1",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjJIRA&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn",
      "https://streamtpday1.xyz/global1.php?stream=espn",
      "https://welivesports.cfd/embed/espn1arg.php",
      "https://skylivefu.com/live.php?stream=espn",
    ],
  },
  espn2: {
    nombre: "ESPN 2",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjJfQXJn&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn2",
      "https://streamtpday1.xyz/global1.php?stream=espn2",
      "https://welivesports.cfd/embed/espn2arg.php",
      "https://skylivefu.com/live.php?stream=espn2",
    ],
  },
  espn3: {
    nombre: "ESPN 3",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjM&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn3",
      "https://streamtpday1.xyz/global1.php?stream=espn3",
      "https://skylivefu.com/live.php?stream=espn3",
    ],
  },
  foxsports1: {
    nombre: "Fox Sports 1",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRz&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports",
      "https://streamtpday1.xyz/global1.php?stream=fox1ar",
      "https://welivesports.cfd/embed/foxsp1arg.php",
      "https://skylivefu.com/live.php?stream=foxsports",
    ],
  },
  foxsports2: {
    nombre: "Fox Sports 2",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRzMkhE&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports2",
      "https://streamtpday1.xyz/global1.php?stream=fox2ar",
      "https://skylivefu.com/live.php?stream=foxsports2",
    ],
  },
  foxsports3: {
    nombre: "Fox Sports 3",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRzM0hE&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports3",
      "https://streamtpday1.xyz/global1.php?stream=fox3ar",
      "https://skylivefu.com/live.php?stream=foxsports3",
    ],
  },
  dsports2: {
    nombre: "DSports 2",
    urls: [
      "https://la18hd.com/vivo/canales.php?stream=dsports2",
      "https://streamtpday1.xyz/global1.php?stream=dsports2",
      "https://skylivefu.com/live.php?stream=dsports2",
    ],
  },
  dsportsplus: {
    nombre: "DSports Plus",
    urls: [
      "https://streamtpday1.xyz/global1.php?stream=dsportsplus",
      "https://canalesdeportivos.net/directvplushd.php",
      "https://skylivefu.com/live.php?stream=dsportsplus",
    ],
  },
  telefe: {
    nombre: "Telefe",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=VGVsZWZlSEQ&lang=1",
      "https://skylivefu.com/live.php?stream=telefe",
    ],
  },
  tvpublica: {
    nombre: "TV Pública",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Q2FuYWw3&lang=1",
      "https://streamtpday1.xyz/global1.php?stream=tv_publica",
      "https://skylivefu.com/live.php?stream=tv_publica",
    ],
  },
  deportv: {
    nombre: "DeporTV",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RGVwb3JUVkhE&lang=1",
      "https://skylivefu.com/live.php?stream=deportv",
    ],
  },
  tudn: {
    nombre: "TUDN",
    urls: [
      "https://streamtpday1.xyz/global1.php?stream=tudn_usa",
      "https://la18hd.com/vivo/canales.php?stream=tudn",
      "https://skylivefu.com/live.php?stream=tudn_usa",
    ],
  },
};

async function capturarStreams(browser, urls, nombre) {
  const streams = [];

  for (const [i, url] of urls.entries()) {
    const page = await browser.newPage();
    let capturada = null;

    page.on("request", (req) => {
      const u = req.url();
      if (u.includes(".m3u8") && !capturada) {
        capturada = u;
      }
    });

    try {
      console.log(`  🔍 Opción ${i + 1}: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: PAGE_TIMEOUT });
    } catch (err) {
      if (!capturada) {
        console.error(`  ⚠️  Timeout/error: ${err.message}`);
      }
    }

    if (!capturada) {
      await new Promise((r) => setTimeout(r, POST_WAIT_MS));
    }

    if (capturada) {
      console.log(`  ✅ Capturada: ${capturada}`);
      streams.push({
        title: `${nombre} — Opción ${i + 1}`,
        url: capturada,
        referrer: url,
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: {
            request: {
              Origin: new URL(url).origin,
              Referer: url,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          },
        },
      });
      try { await page.close(); } catch (_) {}
      if (streams.length >= (parseInt(process.env.MAX_OPTIONS, 10) || 3)) break;
    }

    console.log(`  ⚠️  Sin stream en opción ${i + 1}`);
    try { await page.close(); } catch (_) {}
  }

  return streams;
}

async function subirARender(channelId, streams) {
  if (streams.length === 0) {
    console.log(`  ⚠️  Sin streams para subir`);
    return;
  }

  try {
    const res = await fetch(`${RENDER_URL}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelId, streams }),
    });

    const data = await res.json();
    console.log(`  Render respondió: ${JSON.stringify(data)}`);
    if (res.ok) {
      console.log(`  ✅ ${streams.length} stream(s) subidos`);
    } else {
      console.error(`  ❌ Error: ${data.error}`);
    }
  } catch (err) {
    console.error(`  ❌ Error al subir: ${err.message}`);
  }
}

async function correr() {
  console.log(`\n🚀 Iniciando — ${new Date().toLocaleString()}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-certificate-errors",
    ],
  });

  const entries = Object.entries(CANALES);

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ([id, canal]) => {
        console.log(`\n📺 Procesando ${canal.nombre}...`);
        const streams = await capturarStreams(browser, canal.urls, canal.nombre);
        await subirARender(id, streams);
      })
    );
  }

  await browser.close();
  console.log("\n✅ Listo");
}

correr()
  .then(() => {
    if (process.env.CI) process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

setInterval(correr, 12 * 60 * 60 * 1000);
console.log("⏰ Scraper programado cada 12 horas");
