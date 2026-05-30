// Generates the PWA icons by rasterizing an inline SVG to PNG at the
// sizes the manifest needs. Output goes to /public so a regular
// `next build` ships them as-is. Idempotent: re-run anytime.
//
// Usage: node scripts/generate-icons.mjs
//
// Dependency: sharp (devDependency). Sharp ships prebuilt binaries
// for darwin-arm64, darwin-x64, and linux-x64, so this works on any
// dev machine that runs `pnpm install`.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OXBLOOD = '#5B0E11';
const IVORY = '#F4EDE3';

// EB Garamond Italic lowercase 'h' — single-glyph mark, set so a
// rasterizer without the font installed still renders something
// reasonable. We use a generic 'serif' as a fallback.
function svg({ bg, fg, size, safeArea = 1 }) {
  const radius = safeArea < 1 ? 0 : size * 0.18;
  const inner = size * safeArea;
  const cx = size / 2;
  const cy = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  <text x="${cx}" y="${cy + inner * 0.06}" text-anchor="middle"
    fill="${fg}"
    font-family="EB Garamond, Garamond, Georgia, serif"
    font-style="italic"
    font-weight="700"
    font-size="${inner * 0.78}"
    dominant-baseline="middle">h</text>
</svg>`;
}

const targets = [
  { name: 'icon-192.png', size: 192, bg: OXBLOOD, fg: IVORY, safeArea: 1 },
  { name: 'icon-512.png', size: 512, bg: OXBLOOD, fg: IVORY, safeArea: 1 },
  // Maskable: keep the glyph well inside the safe zone (60%) so any
  // Android launcher shape can crop without clipping the mark.
  {
    name: 'icon-maskable.png',
    size: 512,
    bg: OXBLOOD,
    fg: IVORY,
    safeArea: 0.6,
  },
  { name: 'apple-touch-icon.png', size: 180, bg: OXBLOOD, fg: IVORY },
  { name: 'favicon-32.png', size: 32, bg: OXBLOOD, fg: IVORY },
];

const outDir = path.resolve(process.cwd(), 'public');

await mkdir(outDir, { recursive: true });

for (const t of targets) {
  const raw = svg(t);
  const png = await sharp(Buffer.from(raw), { density: 384 })
    .resize(t.size, t.size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(outDir, t.name), png);
  console.log(`wrote public/${t.name} (${png.length} bytes)`);
}

// Also write a vector favicon for browsers that prefer SVG.
await writeFile(
  path.join(outDir, 'icon.svg'),
  svg({ size: 64, bg: OXBLOOD, fg: IVORY, safeArea: 1 })
);
console.log('wrote public/icon.svg');
