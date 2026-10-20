import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content((ROOT/'conch-crawl-standalone.html').read_text(), wait_until='load')
  await page.evaluate('window.__conchTest.speed(3)')
  # exercise normal user tapping until victory
  for step in range(3000):
   s=await page.evaluate('window.__conchTest.state()')
   if s['ended']:break
   free=sum(x is None for x in s['slots'])
   if free:
    for i in range(3):
     s=await page.evaluate('window.__conchTest.state()')
     if all(x is not None for x in s['slots']):break
     if s['columns'][i]: await page.locator('.supply-column').nth(i).locator('.ammo-card:not(.preview)').click()
   await page.wait_for_timeout(125)
  s=await page.evaluate('window.__conchTest.state()')
  assert s['ended'] and s['placed']==s['total'],(step,s)
  await page.wait_for_timeout(600)
  assert await page.get_by_text('Island Complete!').is_visible()
  await page.get_by_text('Play Level 2').click()
  assert (await page.evaluate('window.__conchTest.state()'))['level']==2
  assert not errors,errors
  print('REAL LEVEL COMPLETION / UNLOCK / NEXT LEVEL PASS',s['total'],'tiles in',step,'cycles')
  await page.close(); await browser.close()

asyncio.run(main())