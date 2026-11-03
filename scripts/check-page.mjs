/* Headless smoke test: capture console errors + pageerror from the dev server */
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()

page.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type())) {
    console.log(`[console.${msg.type()}]`, msg.text().slice(0, 500))
  }
})
page.on('pageerror', (err) => {
  console.log('[pageerror]', String(err.stack || err).slice(0, 900))
})

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 45000 })
await page.waitForTimeout(9500)

const info = await page.evaluate(() => ({
  rootChildren: document.querySelector('.app-root')?.childElementCount ?? -1,
  bootPresent: !!document.querySelector('.boot'),
  canvasPresent: !!document.querySelector('.story-canvas canvas'),
  deckPresent: !!document.querySelector('.cinematic-deck'),
  bodyOverflow: getComputedStyle(document.body).overflowY,
  bodyH: document.body.scrollHeight,
  htmlH: document.documentElement.scrollHeight,
}))
console.log('[info]', JSON.stringify(info, null, 1))

await browser.close()
