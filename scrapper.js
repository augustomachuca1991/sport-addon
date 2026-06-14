const puppeteer = require("puppeteer");

const RENDER_URL = "https://sport-addon.onrender.com";

const CANALES = {
  dsports: {
    nombre: "DSports",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RFNwb3J0c0hE&lang=1",
      "https://nebunexa.life/cvatt.html?get=RFNwb3J0c0hE&lang=1",
      "https://la14hd.com/vivo/canales.php?stream=dsports",
      "https://la18hd.com/vivo/canales.php?stream=dsports",
      "https://streamtpday1.xyz/global1.php?stream=dsports",
    ],
  },
  tycsports: {
    nombre: "TyC Sports",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=VHlDU3BvcnQ&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=tycsports",
      "https://streamtpday1.xyz/global1.php?stream=tycsports",
      "https://welivesports.cfd/embed/tycsportarg.php",
    ],
  },
};

async function capturarStreams(urls, nombre) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--ignore-certificate-errors",
    ],
  });

  const streams = [];

  for (const [i, url] of urls.entries()) {
    const page = await browser.newPage();
    let capturada = null;

    page.on("request", (req) => {
      const u = req.url();
      if ((u.includes(".m3u8") || u.includes(".mpd")) && !capturada) {
        capturada = u;
      }
    });

    try {
      console.log(`  🔍 Opción ${i + 1}: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 8000));

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
      } else {
        console.log(`  ⚠️  Sin stream en opción ${i + 1}`);
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
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

    const text = await res.text(); // ← texto plano primero
    console.log(`  Render respondió: ${text}`);

    const data = JSON.parse(text);
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

  for (const [id, canal] of Object.entries(CANALES)) {
    console.log(`\n📺 Procesando ${canal.nombre}...`);
    const streams = await capturarStreams(canal.urls, canal.nombre);
    await subirARender(id, streams);
  }

  console.log("\n✅ Listo");
}

correr().then(() => process.env.CI && process.exit(0));
setInterval(correr, 12 * 60 * 60 * 1000);
console.log("⏰ Scraper programado cada 12 horas");
