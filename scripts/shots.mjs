// Screenshot helper for design review: node scripts/shots.mjs <name> <path> [mobile|desktop|both] [--dark] [--click "text"]
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';

const [name, path = '/', which = 'both', ...flags] = process.argv.slice(2);
const dark = flags.includes('--dark');
const base = process.env.BASE ?? 'http://localhost:5173';
const root = '/opt/pw-browsers';
const dir = readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().pop();
const exe = [`${root}/${dir}/chrome-linux/chrome`, `${root}/${dir}/chrome-linux64/chrome`, `${root}/chromium/chrome-linux/chrome`].find(existsSync);

const sizes = { mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
for (const key of which === 'both' ? ['mobile', 'desktop'] : [which]) {
  const ctx = await browser.newContext({ viewport: { width: sizes[key].width, height: sizes[key].height }, deviceScaleFactor: sizes[key].deviceScaleFactor, isMobile: sizes[key].isMobile, hasTouch: sizes[key].hasTouch, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log(`[${key} ${m.type()}]`, m.text().slice(0, 300)));
  page.on('pageerror', (e) => console.log(`[${key} pageerror]`, e.message.slice(0, 300)));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('#main, .gate', { timeout: 20000 }).catch(() => console.log('app did not mount'));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  const ci = flags.indexOf('--click');
  if (ci >= 0) { await page.getByText(flags[ci + 1], { exact: false }).first().click(); await page.waitForTimeout(500); }
  const full = flags.includes('--full');
  await page.screenshot({ path: `.impeccable/review/${name}-${key}${dark ? '-dark' : ''}.png`, fullPage: full });
  console.log('saved', `${name}-${key}${dark ? '-dark' : ''}.png`);
  await ctx.close();
}
await browser.close();
