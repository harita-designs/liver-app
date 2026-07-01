const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  p.on('console', m => { if(m.type()==='error') console.error('JS ERR:', m.text()); });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.goto('http://localhost:5173/login');
  await p.waitForLoadState('networkidle');
  await p.fill('input[type="email"]', 'doctor@clinic.com');
  await p.fill('input[type="password"]', 'pw');
  await p.click('button[type="submit"]');
  await p.waitForURL('**/home', { timeout: 5000 });
  // Click the patients button on home page
  await p.locator('button').filter({ hasText: /patients/i }).first().click();
  await p.waitForURL('**/patients', { timeout: 5000 });
  await p.waitForTimeout(500);
  const rows = await p.locator('table tbody tr').count();
  console.log('rows:', rows);
  if (rows > 0) await p.locator('table tbody tr').first().click();
  await p.waitForTimeout(400);
  const predBtn = p.locator('button').filter({ hasText: /predict/i }).first();
  if (await predBtn.isVisible().catch(()=>false)) {
    await predBtn.click();
    await p.waitForTimeout(1500);
  }
  await p.screenshot({ path: '/tmp/result_r2.png', fullPage: true });
  const rc = p.locator('[class*="riskCard"]').first();
  if (await rc.isVisible().catch(()=>false)) await rc.screenshot({ path: '/tmp/result_rc2.png' });
  const bg = p.locator('[class*="barGroups"]').first();
  if (await bg.isVisible().catch(()=>false)) await bg.screenshot({ path: '/tmp/result_bg2.png' });
  await b.close();
  console.log('done');
})();
