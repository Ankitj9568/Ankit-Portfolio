/* Cinematic walkthrough: screenshots at boot, every chapter, both sites */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

fs.mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 800 } })
page.on('pageerror', (err) => console.log('[pageerror]', String(err.stack || err).slice(0, 400)))

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 45000 })

// boot at ~2.5s and ~4.5s
await page.waitForTimeout(2500)
await page.screenshot({ path: 'shots/00-boot.png' })
await page.waitForTimeout(4200)
await page.screenshot({ path: 'shots/01-hero.png' })

// walk the story via keyboard (ArrowRight) with settle time per hop/warp
const waits = { warp: 5200, hop: 3600, boot: 0 }
for (let step = 1; step <= 16; step++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(4200) // mid-transition
  await page.screenshot({ path: `shots/w${String(step).padStart(2, '0')}-mid.png` })
  await page.waitForTimeout(2600) // settled
  await page.screenshot({ path: `shots/w${String(step).padStart(2, '0')}-set.png` })
  const done = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.scroller-nav-btn.next')]
    return btns.length && btns[0].disabled ? true : false
  })
  if (done) { console.log('mission complete reached at step', step); break }
}

// footer check
console.log('[footer]', await page.evaluate(() => ({ present: !!document.querySelector('footer'), bodyH: document.body.scrollHeight })))
await page.screenshot({ path: 'shots/99-final.png' })

await browser.close()
console.log('done')
