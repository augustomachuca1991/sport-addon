const RENDER_URL = "https://sport-addon.onrender.com"; // cambiá esto

const CANALES = {
  espnpremium: {
    nombre: "ESPN Premium HD",
    url_nebunexa: "https://nebunexa.life/cvatt.html?get=Rm94X1Nwb3J0c19QcmVtaXVuX0hE&lang=1",
  },
  tntsports: {
    nombre: "TNT Sports HD",
    url_nebunexa: "https://nebunexa.life/cvatt.html?get=VE5UX1Nwb3J0c19IRA&lang=1",
  },
  dsports: {
    nombre: "DSports HD",
    url_nebunexa: "https://nebunexa.life/cvatt.html?get=RFNwb3J0c0hE&lang=1",
  },
};

const puppeteer = require("puppeteer");

async function capturarMPD(urlNebunexa) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let mpdUrl = null;

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes(".mpd")) {
      mpdUrl = url;
    }
  });

  await page.goto(urlNebunexa, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 8000));
  await browser.close();

  return mpdUrl;
}

async function subirARender(channelId, channelNombre, mpdUrl) {
  if (!mpdUrl) {
    console.log(`⚠️  Sin URL para ${channelNombre}`);
    return;
  }

  const streams = [{ title: `${channelNombre}`, url: mpdUrl }];

  const res = await fetch(`${RENDER_URL}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channelId, streams }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ ${channelNombre} actualizado en Render`);
  } else {
    console.error(`❌ Error: ${data.error}`);
  }
}

async function correr() {
  console.log(`\n🚀 Iniciando — ${new Date().toLocaleString()}`);

  for (const [id, canal] of Object.entries(CANALES)) {
    console.log(`\n🔍 Capturando ${canal.nombre}...`);
    const mpdUrl = await capturarMPD(canal.url_nebunexa);
    console.log(`  URL: ${mpdUrl}`);
    await subirARender(id, canal.nombre, mpdUrl);
  }

  console.log("\n✅ Listo");
}

correr();
setInterval(correr, 12 * 60 * 60 * 1000); // cada 12 horas
console.log("⏰ Scraper programado cada 12 horas");
