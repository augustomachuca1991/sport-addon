const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const fs = require("fs");

const PORT = process.env.PORT || 7000;

const STATIC_STREAMS = {
  dsports: [{ title: "DSports — HLS", url: "https://wf6kt.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=8e18c5903d70f251fcd90b4b1e52f97544a4f383-07-1778581987-1778527987" }],
  tntsports: [{ title: "TNT Sports — HLS", url: "https://cgxheq.fubohd.com/tntsports/mono.m3u8?token=19fd22e88147484488b5b4d3a805ca5e972d428f-ec-1778556817-1778538817" }],
  espnpremium: [{ title: "ESPN Premium — HLS", url: "https://bgfuzq.fubohd.com/espnpremium/mono.m3u8?token=087d9925d50a99d6f9e4896d60aff96f1e59aeae-cd-1778556746-1778538746" }],
  tycsport: [{ title: "TyC Sports — HLS", url: "https://xrpma.vivolatamz.org/tycsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=16e01e89ffd57e5455b6362f8fba5539ed2bf4ca-26-1781465330-1781411330" }],
  espn: [{ title: "ESPN — HLS", url: "https://bdjky.vivolatamz.org/espn/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=edd1722aec6bcd5647de6f6095d899a6e301a7df-6a-1781465695-1781411695" }],
  foxsports: [{ title: "Fox Sports — HLS", url: "https://emprw.vivolatamz.org/foxsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=5cce2a4d8e984830a8b743c3921bbded6222a131-0b-1781465737-1781411737" }],
  tudn: [{ title: "TUDN — HLS", url: "https://bdjky.vivolatamz.org/tudn_usa/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=8e988d865656447279fa3cc2656c7ac84df23e1a-ab-1781465775-1781411775" }],
};

const channels = {
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
