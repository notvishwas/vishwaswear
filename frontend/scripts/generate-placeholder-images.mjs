// Generates 4:5 placeholder artwork in public/products for every product and
// category in backend/supabase/seed.sql. Replace with real photography before launch.
// Usage: node scripts/generate-placeholder-images.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const seed = readFileSync("../backend/supabase/seed.sql", "utf8");
const outDir = "public/products";
mkdirSync(outDir, { recursive: true });

const palette = {
  suits: ["#0f1b2d", "#b08d57"],
  blazers: ["#2c3d5a", "#e0cba5"],
  coats: ["#765a37", "#faf7f2"],
  trousers: ["#52627d", "#f3ede2"],
  shirts: ["#e8dfcf", "#0f1b2d"],
};

function svg(label, [bg, fg], variant) {
  const accent = variant === 1 ? 0 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="${label}">
  <rect width="800" height="1000" fill="${bg}"/>
  <rect x="40" y="40" width="720" height="920" fill="none" stroke="${fg}" stroke-opacity="0.5" stroke-width="2"/>
  <line x1="${accent ? 400 : 120}" y1="${accent ? 300 : 600}" x2="${accent ? 400 : 680}" y2="${accent ? 700 : 600}" stroke="${fg}" stroke-opacity="0.6" stroke-width="2"/>
  <text x="400" y="${accent ? 780 : 540}" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${fg}">${label}</text>
</svg>
`;
}

let count = 0;

for (const [, category, name, slug] of seed.matchAll(/\('(\w+)', '([^']+)', '([a-z0-9-]+)',/g)) {
  for (const variant of [1, 2]) {
    writeFileSync(`${outDir}/${slug}-${variant}.svg`, svg(name, palette[category], variant));
    count++;
  }
}

for (const category of Object.keys(palette)) {
  const label = category[0].toUpperCase() + category.slice(1);
  writeFileSync(`${outDir}/${category}-1.svg`, svg(label, palette[category], 1));
  count++;
}

console.log(`Wrote ${count} images to ${outDir}`);
