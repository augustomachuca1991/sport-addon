const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
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
        url: "https://iaw5b.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=c4b4961d9b4c1738c6780b7197acb1e537b3e390-5a-1778407346-1778353346",
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
        url: "https://yce5o.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=9abe3309fd60bd1a710d1369c6e98727e8e6618d-9b-1778407440-1778353440",
      },
      {
        title: "TNT Sports — Opción 2",
        url: "https://wf6kt.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=29b450de47ce1419b0bf496c4ba7611adad187a1-b0-1778407495-1778353495",
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
        url: "https://iaw5b.envivoslatam.org/espnpremium/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=352c9ac852568f2007bd469eff669724d29e1c5d-dc-1778407560-1778353560",
      },
      {
        title: "ESPN Premium — Opción 2",
        url: "https://dw5pdgvk.fubohd.com/espnpremium/mono.m3u8?token=6ce4c9e00b4c4864f077c2d3ca9ddd1a4b4322f9-8e-1778379700-1778361700",
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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  res.setHeader("ngrok-skip-browser-warning", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Montá el addon en Express
app.use(require("stremio-addon-sdk").getRouter(builder.getInterface()));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Addon corriendo en el puerto ${PORT}`);
});
