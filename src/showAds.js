const autoScroll = require('./autoScroll');
const sleep = require('./sleep');

async function showAds(page) {
  let count = 0;
  await page.evaluate(() => window.scrollTo({ top: 0 }));
  const frames = await page.$$('.adsbygoogle');
  const { height } = page.viewport();
  let flag = true;
  let timeout = 0;
  const start = Date.now();
  while (flag && timeout < 60000) {
    const all = frames.map((frame) => frame.boundingBox());
    const frameIn = (await Promise.all(all)).filter(i => i)
      .find(i => i.y > 0 && (i.y + i.height < height));
    flag = !(await Promise.all(all)).filter(i => i).every(i => (i.y <= height));
    if (frameIn) {
      count = count + 1;
      await sleep(3000);
    }
    await autoScroll(page);
    const end = Date.now()
    timeout = end - start;
  }
  await sleep(6000);
  console.log('time:', (timeout) / 1000, 'show', count);
}

module.exports = showAds;
