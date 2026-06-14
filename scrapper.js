const puppeteer = require("puppeteer");

const RENDER_URL = "https://sport-addon.onrender.com";

const CANALES = {
  espnpremium: {
    nombre: "ESPN Premium",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94X1Nwb3J0c19QcmVtaXVuX0hE&lang=1",
      "https://nebunexa.life/cvatt.html?get=Rm94X1Nwb3J0c19QcmVtaXVuX0hE&lang=1",
      "https://la14hd.com/vivo/canales.php?stream=espnpremium",
      "https://la18hd.com/vivo/canales.php?stream=espnpremium",
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
    ],
  },
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
  espn1: {
    nombre: "ESPN 1",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjJIRA&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn",
      "https://streamtpday1.xyz/global1.php?stream=espn",
      "https://welivesports.cfd/embed/espn1arg.php",
    ],
  },
  espn2: {
    nombre: "ESPN 2",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjJfQXJn&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn2",
      "https://streamtpday1.xyz/global1.php?stream=espn2",
      "https://welivesports.cfd/embed/espn2arg.php",
    ],
  },
  espn3: {
    nombre: "ESPN 3",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RVNQTjM&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=espn3",
      "https://streamtpday1.xyz/global1.php?stream=espn3",
    ],
  },
  foxsports1: {
    nombre: "Fox Sports 1",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRz&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports",
      "https://streamtpday1.xyz/global1.php?stream=fox1ar",
      "https://welivesports.cfd/embed/foxsp1arg.php",
    ],
  },
  foxsports2: {
    nombre: "Fox Sports 2",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRzMkhE&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports2",
      "https://streamtpday1.xyz/global1.php?stream=fox2ar",
    ],
  },
  foxsports3: {
    nombre: "Fox Sports 3",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Rm94U3BvcnRzM0hE&lang=1",
      "https://la18hd.com/vivo/canales.php?stream=foxsports3",
      "https://streamtpday1.xyz/global1.php?stream=fox3ar",
    ],
  },
  dsports2: {
    nombre: "DSports 2",
    urls: [
      "https://la18hd.com/vivo/canales.php?stream=dsports2",
      "https://streamtpday1.xyz/global1.php?stream=dsports2",
    ],
  },
  dsportsplus: {
    nombre: "DSports Plus",
    urls: [
      "https://streamtpday1.xyz/global1.php?stream=dsportsplus",
      "https://canalesdeportivos.net/directvplushd.php",
    ],
  },
  telefe: {
    nombre: "Telefe",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=VGVsZWZlSEQ&lang=1",
    ],
  },
  tvpublica: {
    nombre: "TV Pública",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=Q2FuYWw3&lang=1",
      "https://streamtpday1.xyz/global1.php?stream=tv_publica",
    ],
  },
  deportv: {
    nombre: "DeporTV",
    urls: [
      "https://tvlibre-online.com/html/fl/?get=RGVwb3JUVkhE&lang=1",
    ],
  },
  tudn: {
    nombre: "TUDN",
    urls: [
      "https://streamtpday1.xyz/global1.php?stream=tudn_usa",
      "https://la18hd.com/vivo/canales.php?stream=tudn",
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
          ...(capturada.includes(".mpd") && {
            behaviorHints: {
              notWebReady: true,
              proxyHeaders: {
                request: {
                  Origin: "https://nebunexa.life",
                  Referer: "https://nebunexa.life/",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
              },
            },
          }),
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

correr();
setInterval(correr, 12 * 60 * 60 * 1000);
console.log("⏰ Scraper programado cada 12 horas");
