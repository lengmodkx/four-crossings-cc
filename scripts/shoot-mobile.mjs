/**
 * shoot-mobile.mjs - 多视口截图回归
 *
 * 启动 Playwright,对 5 条核心路由 × 3 种视口(iphone/ipad/desktop)截屏,
 * 写到 screenshots/mobile/。需要先 `npm run dev`(端口 5173)。
 *
 * 用法:
 *   npm run dev           # 终端 A
 *   npm run shoot:mobile  # 终端 B
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.SHOOT_BASE_URL || 'http://localhost:5173';
const OUT = 'screenshots/mobile';

const shots = [
  { url: '/',                         name: 'landing' },
  { url: '/phase-select',             name: 'phase-select' },
  { url: '/narrative/first-crossing', name: 'narrative-first' },
  { url: '/explore/first-crossing',   name: 'explore-first' },
  { url: '/meeting/zunyi',            name: 'meeting-zunyi' },
];

const viewports = [
  { name: 'iphone',  width: 390,  height: 844,  isMobile: true,  hasTouch: true,  deviceScaleFactor: 3 },
  { name: 'ipad',    width: 768,  height: 1024, isMobile: true,  hasTouch: true,  deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900,  isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: vp.deviceScaleFactor,
      userAgent: vp.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    const page = await ctx.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log(`[console.error ${vp.name}]`, msg.text().slice(0, 200));
    });
    page.on('pageerror', (err) => {
      console.log(`[pageerror ${vp.name}]`, String(err).slice(0, 200));
    });

    for (const s of shots) {
      const url = BASE + s.url;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 });
        // 给地图/动画/数据加载一点时间
        await page.waitForTimeout(2500);
        const file = `${OUT}/${vp.name}-${s.name}.png`;
        await page.screenshot({ path: file, fullPage: false });
        console.log('shot', file);
      } catch (e) {
        console.log(`FAIL ${vp.name} ${s.url}:`, String(e).slice(0, 200));
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
