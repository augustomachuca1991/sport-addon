const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");

const PORT = process.env.PORT || 7000;

const channels = {
  dsports: {
    name: "DSports",
    poster: "/poster/dsports",
    logo: "https://bestleague.world/img/dsportsplus.webp",
    description: "DirecTV Sports en vivo",
    streams: [],
  },
  tycsports: {
    name: "TyC Sports",
    poster: "/poster/tycsports",
    logo: "https://bestleague.world/img/tyc.webp",
    description: "TyC Sports Argentina en vivo",
    streams: [],
  },
  // tntsports: { name: "TNT Sports", poster: "/poster/tntsports", logo: "https://assets.tntsports.com.ar/__export/1717073602419/sites/tntsports/arte/logo_header_blanco_20240530.svg", description: "TNT Sports en vivo", streams: [] },
  // espnpremium: { name: "ESPN Premium", poster: "/poster/espnpremium", logo: "https://imgs.search.brave.com/BoO3XQfLmGrGe7PEeBxPtiJC-pAhy_PM-BQvFg544rY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9hL2ExL0VT/UE5fUHJlbWl1bV9s/b2dvLnN2Zy8yNTBw/eC1FU1BOX1ByZW1p/dW1fbG9nby5zdmcu/cG5n", description: "ESPN Premium en vivo", streams: [] },
  // espn1: { name: "ESPN 1", poster: "/poster/espn1", logo: "https://bestleague.world/img/espn.webp", description: "ESPN 1 en vivo", streams: [] },
  // espn2: { name: "ESPN 2", poster: "/poster/espn2", logo: "https://bestleague.world/img/espn2.webp", description: "ESPN 2 en vivo", streams: [] },
  // espn3: { name: "ESPN 3", poster: "/poster/espn3", logo: "https://bestleague.world/img/espn3.webp", description: "ESPN 3 en vivo", streams: [] },
  // foxsports1: { name: "Fox Sports 1", poster: "/poster/foxsports1", logo: "https://bestleague.world/img/foxnew.png", description: "Fox Sports 1 Argentina en vivo", streams: [] },
  // foxsports2: { name: "Fox Sports 2", poster: "/poster/foxsports2", logo: "https://bestleague.world/img/foxnew2.png", description: "Fox Sports 2 Argentina en vivo", streams: [] },
  // foxsports3: { name: "Fox Sports 3", poster: "/poster/foxsports3", logo: "https://bestleague.world/img/foxnew3.png", description: "Fox Sports 3 Argentina en vivo", streams: [] },
  // dsports2: { name: "DSports 2", poster: "/poster/dsports2", logo: "https://bestleague.world/img/dsports2.webp", description: "DirecTV Sports 2 en vivo", streams: [] },
  // dsportsplus: { name: "DSports Plus", poster: "/poster/dsportsplus", logo: "https://bestleague.world/img/dsportsplus.webp", description: "DirecTV Sports Plus en vivo", streams: [] },
  // telefe: { name: "Telefe", poster: "/poster/telefe", logo: "https://bestleague.world/img/telefe.png", description: "Telefe en vivo", streams: [] },
  // tvpublica: { name: "TV Pública", poster: "/poster/tvpublica", logo: "https://bestleague.world/img/tvpublica.webp", description: "TV Pública Argentina en vivo", streams: [] },
  // deportv: { name: "DeporTV", poster: "/poster/deportv", logo: "https://bestleague.world/img/deportv.webp", description: "DeporTV Argentina en vivo", streams: [] },
  // tudn: { name: "TUDN", poster: "/poster/tudn", logo: "https://bestleague.world/img/tudn.png", description: "TUDN en vivo", streams: [] },
};

const manifest = {
  id: "org.local.sports.autoquality",
  version: "1.2.0",
  name: "Sports Auto Quality",
  description: "Canales deportivos",
  resources: ["catalog", "meta", "stream"],
  types: ["tv"],
  idPrefixes: Object.keys(channels),
  catalogs: [
    {
      type: "tv",
      id: "sports_catalog",
      name: "Sports",
    },
  ],
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(() =>
  Promise.resolve({
    metas: Object.entries(channels).map(([id, channel]) => ({
      id,
      type: "tv",
      name: channel.name,
      poster: channel.poster,
      logo: channel?.logo,
      description: channel?.description,
    })),
  })
);

builder.defineMetaHandler(({ id }) => {
  const channel = channels[id];

  if (!channel) {
    return Promise.resolve({ meta: null });
  }

  return Promise.resolve({
    meta: {
      id,
      type: "tv",
      name: channel.name,
      poster: channel.poster,
      logo: channel?.logo,
      description: channel?.description,
    },
  });
});

builder.defineStreamHandler(({ type, id }) => {
  if (type !== "tv") {
    return Promise.resolve({ streams: [] });
  }

  const channel = channels[id];

  if (!channel) {
    return Promise.resolve({ streams: [] });
  }

  return Promise.resolve({
    streams: channel.streams,
  });
});

const app = express();

// CORS para todas las rutas
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,OPTIONS");

  res.setHeader("ngrok-skip-browser-warning", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.get("/poster/:id", (req, res) => {
  const ch = channels[req.params.id];
  if (!ch) return res.status(404).end();

  const logo = ch.logo?.startsWith("//") ? "https:" + ch.logo : ch.logo || "";

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)" rx="8"/>
  <image href="${logo}" x="40" y="90" width="220" height="220" preserveAspectRatio="xMidYMid meet"/>
  <text x="150" y="380" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="18" font-weight="bold">${ch.name}</text>
</svg>`);
});

app.post("/update", (req, res) => {
  const { channel, streams } = req.body;

  if (!channels[channel]) {
    return res.status(404).json({ error: `Canal '${channel}' no existe` });
  }

  if (!Array.isArray(streams) || streams.length === 0) {
    return res.status(400).json({ error: "streams inválidos" });
  }

  channels[channel].streams = streams;
  console.log(`✅ ${channel} actualizado con ${streams.length} stream(s)`);
  return res.json({ ok: true });
});

// Montá el addon en Express
app.use(require("stremio-addon-sdk").getRouter(builder.getInterface()));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Addon corriendo en el puerto ${PORT}`);
});
