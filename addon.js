const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const fs = require("fs");

const PORT = process.env.PORT || 7000;

const STATIC_STREAMS = {
  dsports: [{ title: "DSports — HLS", url: "https://wf6kt.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=8e18c5903d70f251fcd90b4b1e52f97544a4f383-07-1778581987-1778527987" }],
  tntsports: [{ title: "TNT Sports — HLS", url: "https://cgxheq.fubohd.com/tntsports/mono.m3u8?token=19fd22e88147484488b5b4d3a805ca5e972d428f-ec-1778556817-1778538817" }],
  // espnpremium: [{ title: "ESPN Premium — HLS", url: "..." }],
  // tycsport: [{ title: "TyC Sports — HLS", url: "..." }],
  // espn: [{ title: "ESPN — HLS", url: "..." }],
  // foxsports: [{ title: "Fox Sports — HLS", url: "..." }],
  // tudn: [{ title: "TUDN — HLS", url: "..." }],
};

const BASE_URL = "https://augustomachuca1991.github.io/sport-addon";

const channels = {
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
  // espnpremium: { name: "ESPN Premium", poster: `${BASE_URL}/static/logos/espnpremium.svg`, logo: `${BASE_URL}/static/logos/espnpremium.svg`, description: "ESPN Premium en vivo" },
  // tycsport: { name: "TyC Sports", poster: `${BASE_URL}/static/logos/tycsport.svg`, logo: `${BASE_URL}/static/logos/tycsport.svg`, description: "TyC Sports en vivo" },
  // espn: { name: "ESPN", poster: `${BASE_URL}/static/logos/espn.svg`, logo: `${BASE_URL}/static/logos/espn.svg`, description: "ESPN en vivo" },
  // espn2: { name: "ESPN 2", poster: `${BASE_URL}/static/logos/espn2.svg`, logo: `${BASE_URL}/static/logos/espn2.svg`, description: "ESPN 2 en vivo" },
  // espn3: { name: "ESPN 3", poster: `${BASE_URL}/static/logos/espn3.svg`, logo: `${BASE_URL}/static/logos/espn3.svg`, description: "ESPN 3 en vivo" },
  // dsports2: { name: "DSports 2", poster: `${BASE_URL}/static/logos/dsports2.svg`, logo: `${BASE_URL}/static/logos/dsports2.svg`, description: "DirecTV Sports 2 en vivo" },
  // foxsports: { name: "Fox Sports", poster: `${BASE_URL}/static/logos/foxsports.svg`, logo: `${BASE_URL}/static/logos/foxsports.svg`, description: "Fox Sports en vivo" },
  // foxsports2: { name: "Fox Sports 2", poster: `${BASE_URL}/static/logos/foxsports2.svg`, logo: `${BASE_URL}/static/logos/foxsports2.svg`, description: "Fox Sports 2 en vivo" },
  // foxsports3: { name: "Fox Sports 3", poster: `${BASE_URL}/static/logos/foxsports3.svg`, logo: `${BASE_URL}/static/logos/foxsports3.svg`, description: "Fox Sports 3 en vivo" },
  // tudn: { name: "TUDN", poster: `${BASE_URL}/static/logos/tudn.svg`, logo: `${BASE_URL}/static/logos/tudn.svg`, description: "TUDN en vivo" },
  // winsport: { name: "Win Sports+", poster: `${BASE_URL}/static/logos/winsport.svg`, logo: `${BASE_URL}/static/logos/winsport.svg`, description: "Win Sports+ en vivo" },
  // telefe: { name: "Telefe", poster: `${BASE_URL}/static/logos/telefe.svg`, logo: `${BASE_URL}/static/logos/telefe.svg`, description: "Telefe en vivo" },
};

function cargarStreams() {
  try {
    const data = JSON.parse(fs.readFileSync("streams.json", "utf8"));
    let count = 0;
    for (const [id, ch] of Object.entries(data)) {
      if (channels[id] && ch.streams && ch.streams.length > 0) {
        channels[id].streams = ch.streams;
        count++;
      }
    }
    console.log(`📡 streams.json cargado: ${count} canales actualizados`);
  } catch (e) {
    console.log("📡 streams.json no encontrado, usando streams estáticos");
    for (const [id, streams] of Object.entries(STATIC_STREAMS)) {
      if (channels[id]) channels[id].streams = streams;
    }
  }
}

cargarStreams();

const manifest = {
  id: "org.local.sports.autoquality",
  version: "1.2.0",
  name: "Sports Auto Quality",
  description: "Canales deportivos en vivo",
  resources: ["catalog", "meta", "stream"],
  types: ["tv"],
  idPrefixes: Object.keys(channels),
  catalogs: [{ type: "tv", id: "sports_catalog", name: "Sports" }],
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(() =>
  Promise.resolve({
    metas: Object.entries(channels).map(([id, channel]) => ({
      id, type: "tv",
      name: channel.name,
      poster: channel.poster,
      logo: channel?.logo,
      description: channel?.description,
    })),
  })
);

builder.defineMetaHandler(({ id }) => {
  const channel = channels[id];
  if (!channel) return Promise.resolve({ meta: null });
  return Promise.resolve({
    meta: { id, type: "tv", name: channel.name, poster: channel.poster, logo: channel?.logo, description: channel?.description },
  });
});

builder.defineStreamHandler(({ type, id }) => {
  if (type !== "tv") return Promise.resolve({ streams: [] });
  const channel = channels[id];
  if (!channel) return Promise.resolve({ streams: [] });
  return Promise.resolve({ streams: channel.streams || [] });
});

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("ngrok-skip-browser-warning", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

app.post("/update", (req, res) => {
  const { channel, streams } = req.body;
  if (!channels[channel]) return res.status(404).json({ error: `Canal '${channel}' no existe` });
  if (!Array.isArray(streams) || streams.length === 0) return res.status(400).json({ error: "streams inválidos" });
  channels[channel].streams = streams;
  console.log(`✅ ${channel} actualizado con ${streams.length} stream(s)`);
  return res.json({ ok: true });
});

app.get("/ping", (req, res) => res.send("pong"));

app.use(require("stremio-addon-sdk").getRouter(builder.getInterface()));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Addon local corriendo en el puerto ${PORT}`);
});
