// Renders the PWA and Apple touch icons from the flag SVGs: node scripts/icons.mjs
import { chromium } from 'playwright-core';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const root = '/opt/pw-browsers';
const dir = readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().pop();
const exe = [`${root}/${dir}/chrome-linux/chrome`, `${root}/${dir}/chrome-linux64/chrome`, `${root}/chromium/chrome-linux/chrome`].find(existsSync);
const jobs = [
  ['scripts/icons/any.svg', 'public/icon-192.png', 192],
  ['scripts/icons/any.svg', 'public/icon-512.png', 512],
  ['scripts/icons/maskable.svg', 'public/icon-maskable-512.png', 512],
  ['scripts/icons/maskable.svg', 'public/apple-touch-icon.png', 180],
];
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
for (const [src, out, size] of jobs) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const svg = readFileSync(src, 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg}`);
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
  console.log('wrote', out);
}
await browser.close();
