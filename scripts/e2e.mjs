// End-to-end checks against the demo adapter: node scripts/e2e.mjs  (dev server on :5173 with VITE_DEMO=true)
import { chromium } from 'playwright-core';
import { readdirSync, existsSync, writeFileSync } from 'node:fs';

const base = process.env.BASE ?? 'http://localhost:5173';
const root = '/opt/pw-browsers';
const dir = readdirSync(root).filter((d) => d.startsWith('chromium-')).sort().pop();
const exe = [`${root}/${dir}/chrome-linux/chrome`, `${root}/${dir}/chrome-linux64/chrome`].find(existsSync);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failures++; };

// a tiny PNG to upload as a "photo of a document"
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
writeFileSync('.impeccable/review/test-doc.png', png);

async function run(label, viewport, mobile, fn) {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForSelector('#main', { timeout: 20000 });
  await page.waitForSelector('.bay, .garage__empty', { timeout: 20000 });
  console.log(`\n== ${label}`);
  try { await fn(page); } catch (e) { ok(false, `${label} threw: ${e.message.split("\n").slice(0,6).join(" | ")}`); await page.screenshot({ path: `.impeccable/review/e2e-fail-${label}.png` }); }
  ok(errors.length === 0, `${label}: no console errors${errors.length ? ' -> ' + errors.join(' | ') : ''}`);
  await ctx.close();
}

await run('mobile', { width: 390, height: 844 }, true, async (page) => {
  ok((await page.locator('.bay').count()) === 4, 'garage shows four vehicles');
  ok(await page.locator('.bay', { hasText: 'Swift' }).getByText('Insurance expires in 18 days.').isVisible(), 'Swift Pit Board says insurance expires in 18 days');
  ok(await page.locator('.bay', { hasText: 'Creta' }).getByText('PUC expired 9 days ago.').isVisible(), 'Creta Pit Board says PUC expired');

  await page.locator('.bay').first().click();
  await page.waitForURL(/vehicles\/demo-swift/);

  // add an odometer reading from the docked Add button
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: /Odometer reading/ }).click();
  await page.getByLabel('Odometer (km)').fill('45300');
  await page.getByRole('button', { name: 'Save reading' }).click();
  await page.getByText('Logged. 45,300 km.').waitFor();
  ok(await page.locator('.vhead__odo').getByText('45,300').isVisible(), 'current odometer updates to the latest reading');

  // a reading below the previous one is refused
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: /Odometer reading/ }).click();
  await page.getByLabel('Odometer (km)').fill('100');
  await page.getByRole('button', { name: 'Save reading' }).click();
  ok(await page.getByText(/lower than/).isVisible(), 'a lower odometer reading is refused with a reason');
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[open]', { state: 'detached' });

  // browser back closes a sheet instead of leaving the page
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForSelector('dialog[open]');
  await page.goBack();
  await page.waitForSelector('dialog[open]', { state: 'detached', timeout: 3000 }).catch(() => {});
  ok((await page.locator('dialog[open]').count()) === 0 && /vehicles\/demo-swift/.test(page.url()), 'back gesture closes the sheet and stays on the vehicle');

  // issues: quick add, then resolve with undo available
  await page.getByRole('link', { name: /^Issues/ }).click();
  await page.getByPlaceholder('Something you noticed…').fill('Brake squeal at low speed');
  await page.keyboard.press('Enter');
  await page.getByText('Brake squeal at low speed').waitFor();
  ok(await page.getByText('Open (2)').isVisible(), 'quick-added issue appears in the open list');
  await page.getByRole('button', { name: /Mark resolved: Brake squeal/ }).click();
  await page.getByText('Open (1)').waitFor();
  ok(true, 'resolving moves it out of the open list');

  // workshop list
  await page.getByRole('button', { name: /Tell the workshop/ }).click();
  await page.locator('dialog[open] .workshop__text', { hasText: 'AC makes a rattling noise' }).waitFor({ timeout: 3000 });
  ok(true, 'workshop list shows open issues in large type');
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[open]', { state: 'detached' });

  // glovebox upload
  await page.getByRole('link', { name: /^Glovebox/ }).click();
  await page.getByRole('button', { name: /Upload/ }).click();
  await page.locator('dialog[open] input[type=file][accept*="pdf"]').setInputFiles('.impeccable/review/test-doc.png');
  await page.locator('dialog[open]').getByRole('radio', { name: 'PUC', exact: true }).check({ force: true });
  await page.locator('dialog[open]').getByLabel('Expiry date').fill('2027-04-01');
  await page.locator('dialog[open]').getByText('More details (issuer, number, notes)').click();
  await page.locator('dialog[open]').getByLabel('Issued by').fill('Test Centre');
  await page.getByRole('button', { name: 'Save to Glovebox' }).click();
  await page.getByText('Filed in the Glovebox.').waitFor();
  ok(await page.getByText('Valid until 1 Apr 2027').first().isVisible(), 'uploaded PUC shows as valid until its expiry date, as the current PUC');
  // opening a document gives the full-screen viewer
  await page.locator('.docrow', { hasText: 'RC' }).click();
  await page.waitForSelector('.docview-screen');
  ok(await page.locator('.docview-screen').getByText('From the document').count() === 0 && await page.locator('.docview-screen').getByText('Entered by you').first().isVisible(), 'viewer marks fields as "Entered by you"');
  await page.locator('.docview-screen').getByRole('button', { name: 'Back to the Glovebox' }).click();

  // service: log a record, resolve an issue, raise a new one for next time
  await page.getByRole('link', { name: /^Service/ }).click();
  await page.getByRole('button', { name: /Log service/ }).click();
  await page.locator('dialog[open]').getByLabel('Workshop or service centre').fill('Sai Auto Works, Koramangala');
  await page.locator('dialog[open]').getByLabel('Work performed').fill('Oil and filter, AC checked');
  await page.locator('dialog[open]').getByLabel(/AC makes a rattling noise/).check();
  await page.locator('dialog[open]').getByLabel('To address next time').fill('Check rear wiper');
  await page.getByRole('button', { name: 'Save service record' }).click();
  await page.getByText('Logged in the logbook.').waitFor();
  ok(await page.locator('.svc-summary').getByText(/Sai Auto Works/).first().isVisible(), 'last service shows the workshop');
  await page.getByRole('link', { name: /^Issues/ }).click();
  ok(await page.getByText('Check rear wiper').isVisible(), '"address next time" line became an open issue');
  await page.getByText('Resolved (2)').waitFor({ timeout: 5000 });
  ok(true, 'the issue the workshop fixed is marked resolved');

  // add a vehicle from the quick log
  await page.goto(base + '/');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: /Another vehicle/ }).click();
  await page.waitForURL(/vehicles\/new/);
  await page.getByText('Step 1 of 5').waitFor({ timeout: 5000 });
  ok(true, 'adding a vehicle starts as a step form');
  await page.getByRole('radio', { name: /Motorcycle/ }).check({ force: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await page.getByText('Which make is it?').isVisible(), 'required fields are named when missing, and the step does not advance');
  await page.getByLabel('Make').fill('Bajaj');
  await page.getByLabel('Model').fill('Pulsar 150');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Registration number').fill('ka05zz1234');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await page.getByText(/Enter what the odometer shows/).isVisible(), 'the odometer is required before the last step');
  await page.getByLabel('Odometer now (km)').fill('8200');
  await page.getByRole('button', { name: 'Continue' }).click();
  ok(await page.getByText('Step 5 of 5').isVisible(), 'the last step is optional extras');
  await page.locator('.formbar').getByRole('button', { name: 'Back' }).click();
  ok(await page.getByLabel('Odometer now (km)').inputValue() === '8,200', 'going back keeps what was entered');
  await page.getByRole('button', { name: 'Continue' }).click();
  // a custom colour by hex code
  await page.getByLabel('Or type a hex code').fill('12ab9c');
  ok(await page.getByText('Custom #12AB9C').isVisible(), 'a hex code sets a custom colour');
  await page.getByLabel('Or type a hex code').fill('nope');
  ok(await page.getByText(/Use a colour like/).isVisible(), 'a bad hex code says what is expected');
  // a photo is cropped before it is kept
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 900;
    const g = c.getContext('2d');
    g.fillStyle = '#3b82f6'; g.fillRect(0, 0, 1200, 900);
    g.fillStyle = '#ffffff'; g.fillRect(500, 300, 200, 200);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.locator('input[type=file]').setInputFiles({ name: 'car.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.getByRole('heading', { name: 'Crop the photo' }).waitFor({ timeout: 5000 });
  await page.getByRole('slider', { name: 'Zoom' }).fill('2');
  await page.getByRole('button', { name: 'Use this crop' }).click();
  await page.getByAltText('Vehicle photo preview').waitFor({ timeout: 5000 });
  ok(await page.getByRole('button', { name: 'Adjust crop' }).isVisible(), 'the cropped photo is previewed and can be adjusted');
  await page.getByRole('button', { name: 'Add to garage' }).click();
  await page.waitForURL(/vehicles\/(?!new)/);
  await page.locator('.vhead__board').getByText('Nothing tracked yet.').waitFor({ timeout: 5000 });
  ok(true, 'new vehicle starts with the calm "nothing tracked yet" Pit Board');
  await page.locator('.vhead__facts').getByLabel('Registration number KA 05 ZZ 1234').waitFor({ timeout: 5000 });
  ok(true, 'registration is shown grouped as on a plate');
  await page.getByRole('link', { name: /^Service/ }).click();
  await page.getByText(/5,000 km or 6 months/).waitFor({ timeout: 5000 });
  ok(true, 'a motorcycle starts with a 5,000 km / 6 month interval');
});

await run('desktop', { width: 1440, height: 900 }, false, async (page) => {
  await page.keyboard.press('Control+k');
  await page.getByPlaceholder(/Jump to a vehicle/).fill('creta');
  await page.keyboard.press('Enter');
  await page.waitForURL(/vehicles\/demo-creta/);
  ok(true, 'command palette jumps to a vehicle by name');
  await page.keyboard.press('Control+k');
  await page.getByPlaceholder(/Jump to a vehicle/).fill('insurance');
  await page.keyboard.press('Enter');
  await page.waitForURL(/glovebox\/demo-doc-/);
  await page.locator('.glovebox__pane .docview').waitFor({ timeout: 5000 });
  ok(true, 'a document opens beside the list on desktop');
  await page.getByRole('link', { name: 'Overview' }).click();
  await page.locator('.vrail').waitFor({ timeout: 5000 });
  ok(true, 'properties rail shows on wide screens');
  await page.getByRole('link', { name: /^Service/ }).click();
  await page.locator('.svc-summary').waitFor();
  ok((await page.locator('.vrail').count()) === 0, 'rail gives way to list and detail on Service');
  // tab key reaches controls with a visible focus ring
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  ok(outline !== 'none', 'focused controls show an outline');
});

await run('empty-state', { width: 390, height: 844 }, true, async (page) => {
  await page.evaluate(() => new Promise((res) => {
    const r = indexedDB.open('pitstop-demo', 1);
    r.onsuccess = () => {
      const db = r.result; const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put({ vehicles: [], readings: [], issues: [], services: [], documents: [] }, 'tables');
      tx.oncomplete = () => res();
    };
  }));
  await page.reload();
  await page.waitForSelector('.garage__empty');
  ok(await page.getByText('My Garage is empty.').isVisible(), 'first-run empty state says "My Garage is empty."');
  ok(await page.getByText('Add your first vehicle and keep the important stuff in one place.').isVisible(), 'and invites the first vehicle');
  await page.screenshot({ path: '.impeccable/review/empty-mobile.png' });
});

await browser.close();
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll end-to-end checks passed');
process.exit(failures ? 1 : 0);
