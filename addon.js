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
        url: "https://yce5o.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=200.55.245.14&token=19ac11d6306c55a10c63c6843c0be4743b4aa0b8-14-1778286159-1778232159",
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
        url: "https://ng0pr.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=c82f08902879fb43eab8db9973f10130a88a6e9a-75-1778289504-1778235504",
      },
      {
        title: "TNT Sports — Opción 2",
        url: "https://edge-live32-sl.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzc4NDI3MDYxIiwic2lwIjoiMjAwLjU1LjI0NS4xNDUiLCJwYXRoIjoiL2xpdmUvYzZlZHMvVE5UX1Nwb3J0c19IRC9TQV9MaXZlX2Rhc2hfZW5jX0MvIiwic2Vzc2lvbl9jZG5faWQiOiI5Mzk2NDY5MDU1OTM3YWMyIiwic2Vzc2lvbl9pZCI6IiIsImNsaWVudF9pZCI6IiIsImRldmljZV9pZCI6IiIsIm1heF9zZXNzaW9ucyI6MCwic2Vzc2lvbl9kdXJhdGlvbiI6MCwidXJsIjoiaHR0cHM6Ly8yMDEuMjM1LjY2LjEyMiIsImF1ZCI6IjEwMCIsInNvdXJjZXMiOls4NSwxNDQsODYsODhdfQ==.YfOrA7R2lqP_ZO-Q-yLw6mNKfUDa-I399Z5ZGyqxqBgf16ygirpZhdpkYt2KqtuS7ll0kTReFe4odgUWSPbc3A==/live/c6eds/TNT_Sports_HD/SA_Live_dash_enc_C/TNT_Sports_HD.mpd",
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
        url: "https://tk0hz.envivoslatam.org/espnpremium/tracks-v1a1/mono.m3u8?ip=200.55.245.145&token=e66275eb061d0d97ff55231c8b74f572cc37a783-6b-1778296788-1778242788",
      },
      {
        title: "ESPN Premium — Opción 2",
        url: "https://edge-live15-hr.cvattv.com.ar/tok_eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNzc4NDI3MjA1Iiwic2lwIjoiMjAwLjU1LjI0NS4xNDUiLCJwYXRoIjoiL2xpdmUvYzdlZHMvRm94X1Nwb3J0c19QcmVtaXVuX0hEL1NBX0xpdmVfZGFzaF9lbmNfQy8iLCJzZXNzaW9uX2Nkbl9pZCI6IjAwNzVkNmU1NDgyZDU4MjIiLCJzZXNzaW9uX2lkIjoiIiwiY2xpZW50X2lkIjoiIiwiZGV2aWNlX2lkIjoiIiwibWF4X3Nlc3Npb25zIjowLCJzZXNzaW9uX2R1cmF0aW9uIjowLCJ1cmwiOiJodHRwczovLzIwMS4yMzUuNjYuMTE0IiwiYXVkIjoiNTgiLCJzb3VyY2VzIjpbODUsMTQ0LDg2LDg4XX0=.Ch2QiMe2XUwt-c310iCxEVD2fYeE6mAp6LOcQUVfLPeCTQzoF455YC-qy3iJFqGH00GUXcep0hZ-NCLXjv41ig==/live/c7eds/Fox_Sports_Premiun_HD/SA_Live_dash_enc_C/Fox_Sports_Premiun_HD.mpd",
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
