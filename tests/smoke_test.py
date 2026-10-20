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
   await page.set_content((ROOT/'conch-crawl-standalone.html' if (ROOT/'conch-crawl-standalone.html').exists() else ROOT/'index.html').read_text(),wait_until='load')
   start=await page.evaluate('window.__conchTest.state()')
   assert start['total']>200 and len(start['slots'])==5
   assert await page.locator('.cell-base').count()==start['total']
   assert await page.locator('.ammo-card:not(.preview)').count()==3
   assert await page.locator('.ammo-card.preview').count()>3
   assert await page.locator('.ammo-card.preview:not([disabled])').count()==0
   assert sum(sum(card['ammo'] for card in col) for col in start['queue'])==start['total']
   assert await page.evaluate('window.__conchTest.exposed("A")')==0
   assert await page.evaluate('window.__conchTest.exposed("Y")')==0
   if w==390:
    assert start['offers'][1]['ready']==False
    before_locked=await page.evaluate('window.__conchTest.state()')
    await page.evaluate('window.__conchTest.choose(1)')
    assert (await page.evaluate('window.__conchTest.state()'))['columns']==before_locked['columns']
    await page.locator('.ammo-card:not(.preview)').first.click()
    before=await page.evaluate('window.__conchTest.state()')
    assert before['slots'][0]['c']=='X' and before['columns'][0]==start['columns'][0]-1
    assert before['queue'][0][0]['id']==3
    await page.evaluate('window.__conchTest.choose(1)')
    after=await page.evaluate('window.__conchTest.state()')
    assert sum(after['columns'])==sum(before['columns'])
    await page.wait_for_timeout(1000)
    after=await page.evaluate('window.__conchTest.state()')
    assert after['placed']>0 and after['total']-after['placed']==await page.evaluate('window.__conchTest.tileCount()')
    assert await page.locator('.worker').count()>=1
    await page.locator('#speedButton').click();await page.locator('#speedButton').click()
    assert (await page.evaluate('window.__conchTest.state()'))['speed']==3
    for lvl in [15,30]:
     await page.evaluate('(n)=>window.__conchTest.setLevel(n)',lvl)
     advanced=await page.evaluate('window.__conchTest.state()')
     assert advanced['total']>700
     print('Level',lvl,advanced['total'],'tiles: RENDER PASS')
   else: await page.screenshot(path=str(ROOT/'assets'/f'preview-{w}x{h}.png'))
   assert not errors,errors
   print('Viewport',w,h,': PASS')
   await page.close()
  await browser.close()
asyncio.run(run())