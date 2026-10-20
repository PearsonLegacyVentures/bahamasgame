"""Browser regression: linked colour cards, queue integrity, and responsive layout."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width,height in ((320,568),(390,844),(768,1024)):
   page=await browser.new_page(viewport={'width':width,'height':height},is_mobile=width<481,has_touch=width<481)
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   await page.set_content((ROOT/'index.html').read_text(),wait_until='load')
   start=await page.evaluate('window.__conchTest.state()')
   assert start['stackCount']==3
   assert len(start['slots'])==5
   assert all(not card['pairId'] for col in start['queue'] for card in col)
   await page.evaluate('window.__conchTest.setLevel(20)')
   initial=await page.evaluate('window.__conchTest.state()')
   assert initial['stackCount']==4
   assert len(initial['offers'])==4
   assert initial['offers'][0]['pairId']==initial['offers'][1]['pairId']
   assert initial['offers'][0]['ready']
   assert await page.locator('.pair-link').count()>0
   before=sum(initial['columns'])
   await page.locator('.supply-column').first.locator('.ammo-card:not(.preview)').click()
   after=await page.evaluate('window.__conchTest.state()')
   assert before-sum(after['columns'])==2
   assert sum(slot is not None for slot in after['slots'])==2
   await page.wait_for_timeout(900)
   progress=await page.evaluate('window.__conchTest.state()')
   assert progress['placed']>0
   assert progress['total']-progress['placed']==await page.evaluate('window.__conchTest.tileCount()')
   assert not errors,errors
   print('Linked pair and mobile viewport pass',width,height)
   await page.close()
  await browser.close()

asyncio.run(main())
