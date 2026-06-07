// Generates PWA PNG icons from an inline SVG. Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#7c3aed"/>
  <circle cx="256" cy="256" r="92" fill="#ffd166"/>
  ${Array.from({ length: 12 })
    .map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      const x1 = 256 + Math.cos(a) * 132;
      const y1 = 256 + Math.sin(a) * 132;
      const x2 = 256 + Math.cos(a) * 172;
      const y2 = 256 + Math.sin(a) * 172;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffd166" stroke-width="22" stroke-linecap="round"/>`;
    })
    .join("")}
</svg>`;

const targets = [
  { size: 192, file: "public/icon-192.png" },
  { size: 512, file: "public/icon-512.png" },
  { size: 180, file: "public/apple-touch-icon.png" },
];

for (const { size, file } of targets) {
  const png = await sharp(Buffer.from(svg(size))).png().toBuffer();
  writeFileSync(file, png);
  console.log(`✓ ${file} (${size}px)`);
}

// Also write the raw SVG for any vector use.
writeFileSync("public/icon.svg", svg(512));
console.log("✓ public/icon.svg");
