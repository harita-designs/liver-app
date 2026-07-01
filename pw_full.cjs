const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.goto('http://localhost:5173/login');
  await p.waitForLoadState('networkidle');
  await p.fill('input[type="email"]', 'a@b.com');
  await p.fill('input[type="password"]', 'x');
  await Promise.all([p.waitForNavigation({ timeout: 4000 }), p.click('button[type="submit"]')]);
  // Scroll to find patients button then click
  await p.evaluate(() => window.scrollTo(0, 600));
  await p.waitForTimeout(300);
  const btns = await p.locator('button').all();
  const texts = await Promise.all(btns.map(b => b.textContent()));
  console.log('buttons:', texts.map(t => t?.trim()).filter(Boolean));
  // Try clicking patients button
  const patBtn = p.locator('button').filter({ hasText: /patient/i }).first();
  if (await patBtn.isVisible({ timeout: 2000 }).catch(()=>false)) {
    await patBtn.click();
    await p.waitForTimeout(600);
    console.log('after patients click:', p.url());
  } else {
    console.log('No patients button visible');
    await p.screenshot({ path: '/tmp/home_state.png', fullPage: true });
  }
})().catch(e => console.error(e.message));
