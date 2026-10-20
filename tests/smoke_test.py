"""Run with Python + playwright + Chromium: python tests/smoke_test.py"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h in [(390,844),(320,568),(768,1024)]:
   page=await browser.new_page(viewport={'width':w,'height':h},is_mobile=w<481,has_touch=w<481)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.set_content((ROOT/'conch-crawl-standalone.html').read_text(),wait_until='load')
   start=await page.evaluate('window.__conchTest.state()')
   assert start['total']>200 and len(start['slots'])==5
   assert await page.locator('.cell-base').count()==start['total']
   assert await page.locator('.ammo-card:not(.preview)').count()==3
   if w==390:
    for i in [0,1,2,0,1]:await page.evaluate('(n)=>window.__conchTest.choose(n)',i)
    before=await page.evaluate('window.__conchTest.state()')
    assert all(before['slots'])
    await page.evaluate('window.__conchTest.choose(0)')
    after=await page.evaluate('window.__conchTest.state()')
    assert sum(after['columns'])==sum(before['columns'])
    await page.wait_for_timeout(900)
    after=await page.evaluate('window.__conchTest.state()')
    assert after['placed']>0 and after['total']-after['placed']==await page.evaluate('window.__conchTest.tileCount()')
    assert await page.locator('.worker').count()==5
    await page.screenshot(path=str(ROOT/'assets/gameplay-preview.png'))
    await page.locator('#speedButton').click();await page.locator('#speedButton').click()
    assert (await page.evaluate('window.__conchTest.state()'))['speed']==3
    await page.wait_for_timeout(5500)
    done=await page.evaluate('window.__conchTest.state()')
    assert all(x is None for x in done['slots']),done
    print('Queue cap, placement, worker animation, slot release and speed: PASS')
    for lvl in [15,30]:
     await page.evaluate('(n)=>window.__conchTest.setLevel(n)',lvl)
     advanced=await page.evaluate('window.__conchTest.state()')
     assert advanced['total']>700
     await page.screenshot(path=str(ROOT/'assets'/('level-'+str(lvl)+'.png')))
     print('Level',lvl,advanced['total'],'tiles: RENDER PASS')
   else: await page.screenshot(path=str(ROOT/'assets'/f'preview-{w}x{h}.png'))
   assert not errors,errors
   print('Viewport',w,h,': PASS')
   await page.close()
  await browser.close()
asyncio.run(run())