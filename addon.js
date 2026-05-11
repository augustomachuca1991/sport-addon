const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");

const PORT = process.env.PORT || 7000;

const channels = {
  dsports: {
    name: "DSports",
    poster:
      "https://imgs.search.brave.com/ZkIS7DI98QxJd0-A9f1zMs9X83l-7gYScPztHxYMfOk/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMud2lraWEubm9j/b29raWUubmV0L2xv/Z29wZWRpYS9pbWFn/ZXMvMS8xNS9EaXJl/Y1RWU3BvcnRzMjAx/OC5wbmcvcmV2aXNp/b24vbGF0ZXN0L3Nt/YXJ0L3dpZHRoLzE2/MC9oZWlnaHQvMTIw/P2NiPTIwMTgwMzAx/MjMzODA0",
    logo: "https://bestleague.world/img/dsportsplus.webp",
    description: "Direct TV Sports en vivo",
    streams: [
      {
        title: "DSports — Auto",
        url: "https://wf6kt.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=8e18c5903d70f251fcd90b4b1e52f97544a4f383-07-1778581987-1778527987",
      },
    ],
  },

  tntsports: {
    name: "TNT Sports",
    poster:
      "https://imgs.search.brave.com/bVoS1l-fg9Smd76bBVrKdAy07e5_9cgNhYaE4vN2_BA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbGF5/LWxoLmdvb2dsZXVz/ZXJjb250ZW50LmNv/bS9MNVFkSzZwWmVI/c2U5THo5dUc1cDdo/SjFCTWRFX3VxSU1N/N1dTeEJLVlJCaTgz/ZFRIdlVOT1lQSjRG/SWczNlpTeXBJPXcy/NDAtaDQ4MC1ydw",
    logo: "https://assets.tntsports.com.ar/__export/1717073602419/sites/tntsports/arte/logo_header_blanco_20240530.svg",
    description: "TNT Sports en vivo",
    streams: [
      {
        title: "TNT Sports — Opción 1",
        url: "https://pvtn5y.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=34916878f8c30d8c4860e388e977a2e56999b8b1-c7-1778584686-1778530686",
      },
      {
        title: "TNT Sports — Opción 2",
        url: "https://cgxheq.fubohd.com/tntsports/mono.m3u8?token=19fd22e88147484488b5b4d3a805ca5e972d428f-ec-1778556817-1778538817",
      },
    ],
  },

  espnpremium: {
    name: "ESPN Premium",
    poster: "https://angulismo-pics.pages.dev/espn-premium.png",
    logo: "https://imgs.search.brave.com/BoO3XQfLmGrGe7PEeBxPtiJC-pAhy_PM-BQvFg544rY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9hL2ExL0VT/UE5fUHJlbWl1bV9s/b2dvLnN2Zy8yNTBw/eC1FU1BOX1ByZW1p/dW1fbG9nby5zdmcu/cG5n",
    description: "ESPN Premium en vivo",
    streams: [
      {
        title: "ESPN Premium — Opción 1",
        url: "https://xky9q.envivoslatam.org/espnpremium/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=6b8af1b0712202a27c736953f17f7390b6faa84f-53-1778584587-1778530587",
      },
      {
        title: "ESPN Premium — Opción 2",
        url: "https://bgfuzq.fubohd.com/espnpremium/mono.m3u8?token=087d9925d50a99d6f9e4896d60aff96f1e59aeae-cd-1778556746-1778538746",
      },
      {
        title: "ESPN Premium HD — Opción 3",
        url: "https://edge-live15-hr.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzc4NzEyNzUxIiwic2lwIjoiMjAwLjU1LjI0NS4xNDUiLCJwYXRoIjoiL2xpdmUvYzdlZHMvRm94X1Nwb3J0c19QcmVtaXVuX0hEL1NBX0xpdmVfZGFzaF9lbmNfQy8iLCJzZXNzaW9uX2Nkbl9pZCI6Ijc1NjYzNDgxNWRjZGJmYWMiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzIwMS4yMzUuNjYuMTE0IiwiYXVkIjoiNTgiLCJzb3VyY2VzIjpbODUsMTQ0LDg2LDg4XX0=.2qY0hBxhvkT5U13TBk75gSHFyOtYWjdmh5XBTNhU7WPplv9UCyabdEQBiBvgA1qG0LCPwK95Cgi8f3Gf3kgnwg==/live/c7eds/Fox_Sports_Premiun_HD/SA_Live_dash_enc_C/Fox_Sports_Premiun_HD.mpd",
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
      },
    ],
  },
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

app.post("/update", (req, res) => {
  const { channel, streams } = req.body;

  if (!channels[channel]) {
    return res.status(404).json({ error: `Canal '${channel}' no existe` });
  }

  if (!Array.isArray(streams) || streams.length === 0) {
    return res.status(400).json({ error: "streams inválidos" });
  }

  const streamsM3U8 = channels[channel].streams.filter((s) => !s.url.includes(".mpd"));

  channels[channel].streams = [...streamsM3U8, ...streams];
  console.log(`✅ ${channel} actualizado`);
  return res.json({ ok: true });
});

// Montá el addon en Express
app.use(require("stremio-addon-sdk").getRouter(builder.getInterface()));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Addon corriendo en el puerto ${PORT}`);
});
