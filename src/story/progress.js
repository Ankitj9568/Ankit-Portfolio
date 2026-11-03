/**
 * Scroll → story progress singleton.
 * DOM registers chapter elements; a scroll listener computes which chapter
 * the viewport is in (segment i, local t). The story canvas reads it inside
 * useFrame — no React re-renders at 60fps.
 */

const store = {
  els: [],
  anchors: [],
  /** { index, t } — index of current segment start, t in [0,1) */
  seg: { i: 0, t: 0 },
}

export function registerChapters(els) {
  store.els = els.filter(Boolean)
  recalc()
}

export function addChapter(el) {
  if (!el || store.els.includes(el)) return
  store.els.push(el)
  recalc()
}

export function recalc() {
  store.anchors = store.els.map((el) => el.getBoundingClientRect().top + window.scrollY)
}

function onScroll() {
  const scroll = window.scrollY

  const a = store.anchors
  if (a.length < 2) return
  let i = 0
  while (i < a.length - 1 && scroll >= a[i + 1]) i++
  // if we've scrolled past the final anchor, hold the last segment at t = 1
  const last = a.length - 2
  if (i > last) i = last
  const span = a[i + 1] - a[i] || 1
  const t = Math.min(Math.max((scroll - a[i]) / span, 0), 1)
  store.seg.i = i
  store.seg.t = t
}

export function initProgress() {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', () => recalc())
  recalc()
  onScroll()
  return () => window.removeEventListener('scroll', onScroll)
}

/** read the current segment: { i, t } */
export const getProgress = () => store.seg

/** smootherstep easing for cinematic interpolation */
export const smooth = (x) => x * x * x * (x * (x * 6 - 15) + 10)
