const sharp = require("sharp");

const CHANNELS = [
  { id: "dsports", name: "DSports", logo: "https://bestleague.world/img/dsportsplus.webp" },
  { id: "tycsports", name: "TyC Sports", logo: "https://bestleague.world/img/tyc.webp" },
  { id: "tntsports", name: "TNT Sports", logo: "https://assets.tntsports.com.ar/__export/1717073602419/sites/tntsports/arte/logo_header_blanco_20240530.svg" },
  { id: "espnpremium", name: "ESPN Premium", logo: "https://imgs.search.brave.com/BoO3XQfLmGrGe7PEeBxPtiJC-pAhy_PM-BQvFg544rY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9hL2ExL0VT/UE5fUHJlbWl1bV9s/b2dvLnN2Zy8yNTBw/eC1FU1BOX1ByZW1p/dW1fbG9nby5zdmcu/cG5n" },
  { id: "espn1", name: "ESPN 1", logo: "https://bestleague.world/img/espn.webp" },
  { id: "espn2", name: "ESPN 2", logo: "https://bestleague.world/img/espn2.webp" },
  { id: "espn3", name: "ESPN 3", logo: "https://bestleague.world/img/espn3.webp" },
  { id: "foxsports1", name: "Fox Sports 1", logo: "https://bestleague.world/img/foxnew.png" },
  { id: "foxsports2", name: "Fox Sports 2", logo: "https://bestleague.world/img/foxnew2.png" },
  { id: "foxsports3", name: "Fox Sports 3", logo: "https://bestleague.world/img/foxnew3.png" },
  { id: "dsports2", name: "DSports 2", logo: "https://bestleague.world/img/dsports2.webp" },
  { id: "dsportsplus", name: "DSports Plus", logo: "https://bestleague.world/img/dsportsplus.webp" },
  { id: "telefe", name: "Telefe", logo: "https://bestleague.world/img/telefe.png" },
  { id: "tvpublica", name: "TV Pública", logo: "https://bestleague.world/img/tvpublica.webp" },
  { id: "deportv", name: "DeporTV", logo: "https://bestleague.world/img/deportv.webp" },
  { id: "tudn", name: "TUDN", logo: "https://bestleague.world/img/tudn.png" },
];

async function main() {
  for (const ch of CHANNELS) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#16213e"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)" rx="8"/>
  <image href="${ch.logo}" x="40" y="90" width="220" height="220" preserveAspectRatio="xMidYMid meet"/>
  <text x="150" y="380" text-anchor="middle" fill="#ffffff" font-family="Arial,sans-serif" font-size="18" font-weight="bold">${ch.name}</text>
</svg>`;

    try {
      const buf = await sharp(Buffer.from(svg)).webp().toBuffer();
      const fs = require("fs");
      fs.writeFileSync(`static/poster/${ch.id}.webp`, buf);
      console.log(`✅ ${ch.id}.webp (${buf.length} bytes)`);
    } catch (e) {
      console.error(`❌ ${ch.id}: ${e.message}`);
    }
  }
  console.log("\\n🎉 Todos los posters generados en static/poster/");
}

main();
