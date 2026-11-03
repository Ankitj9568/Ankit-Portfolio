import { sound } from './audio'

export const CHAPTER_CONFIGS = [
  {
    id: 'home',
    name: 'SOL SYSTEM // DEEP SPACE',
    planetName: 'SOL',
    side: 'center',
    sites: [
      { id: 'cockpit', label: 'FLIGHT DECK', title: 'Mission Prologue' },
    ],
  },
  {
    id: 'about',
    name: 'THE HOME PLANET',
    planetName: 'TERRA',
    side: 'left',
    color: '#38bdf8',
    sites: [
      { id: 'bio', label: 'SITE 01 // BIO', title: 'Foundation & Overview' },
      { id: 'stats', label: 'SITE 02 // STATS', title: 'Stats & University Track' },
    ],
  },
  {
    id: 'skills',
    name: 'THE ARSENAL',
    planetName: 'ARES',
    side: 'right',
    color: '#f97316',
    sites: [
      { id: 'prog', label: 'SITE 01 // CODE', title: 'Programming & Query' },
      { id: 'db', label: 'SITE 02 // DATA', title: 'Relational DBs & Schema' },
      { id: 'backend', label: 'SITE 03 // SYSTEMS', title: 'Backend & Systems' },
      { id: 'tools', label: 'SITE 04 // WEB3D', title: 'Tools & Creative 3D' },
    ],
  },
  {
    id: 'projects',
    name: 'MISSION DECK',
    planetName: 'CHRONOS',
    side: 'left',
    color: '#eab308',
    sites: [
      { id: 'roomsync', label: 'SITE 01 // ROOMSYNC', title: 'Household Platform' },
      { id: 'sentinel', label: 'SITE 02 // SENTINEL', title: 'FedEx DCA Governance' },
      { id: 'disaster', label: 'SITE 03 // DISASTER AI', title: 'Disaster Risk Predictor' },
      { id: 'greenchain', label: 'SITE 04 // GREENCHAIN', title: 'Sustainability Ledger' },
    ],
  },
  {
    id: 'achievements',
    name: 'STORM GLORY',
    planetName: 'JOVIAN',
    side: 'right',
    color: '#a855f7',
    sites: [
      { id: 'iitm', label: 'SITE 01 // IIT MADRAS', title: 'FedEx SMART Center Top 15' },
      { id: 'innovates', label: 'SITE 02 // BHARAT MANDAPAM', title: 'India Innovates Finalist' },
    ],
  },
  {
    id: 'journey',
    name: 'THE MISSION LOG',
    planetName: 'POSEIDON',
    side: 'left',
    color: '#06b6d4',
    sites: [
      { id: 'j2023', label: 'SITE 01 // 2023', title: 'Inception at TMSL' },
      { id: 'j2024', label: 'SITE 02 // 2024', title: 'Fundamentals & First Builds' },
      { id: 'j2025', label: 'SITE 03 // 2025', title: 'Sentinel Architecture' },
      { id: 'j2026', label: 'SITE 04 // 2026', title: 'National Hackathons' },
      { id: 'j2027', label: 'SITE 05 // 2027', title: '3D Web & Future Horizons' },
    ],
  },
  {
    id: 'contact',
    name: 'MISSION CONTROL',
    planetName: 'SINGULARITY',
    side: 'right',
    color: '#ec4899',
    sites: [
      { id: 'comms', label: 'TRANSMISSION DECK', title: 'Open Frequency' },
    ],
  },
]

class StageStore {
  constructor() {
    this.chapter = 0
    this.site = 0
    // Phases: 'STATIONARY' | 'ENTERING' | 'HOPPING' | 'WARPING'
    this.phase = 'STATIONARY'
    this.enterProgress = 0
    this.hopProgress = 0
    this.warpProgress = 0
    this.prevSite = 0
    this.targetChapter = 0
    this.targetSite = 0
    this.listeners = new Set()
    this.isTransitioning = false
    this.lastScrollTime = 0
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  notify() {
    const state = this.getState()
    this.listeners.forEach((fn) => fn(state))
  }

  getState() {
    const cfg = CHAPTER_CONFIGS[this.chapter] || CHAPTER_CONFIGS[0]
    const curSite = cfg.sites[this.site] || cfg.sites[0]
    return {
      chapter: this.chapter,
      site: this.site,
      phase: this.phase,
      enterProgress: this.enterProgress,
      hopProgress: this.hopProgress,
      warpProgress: this.warpProgress,
      prevSite: this.prevSite,
      targetChapter: this.targetChapter,
      targetSite: this.targetSite,
      chapterConfig: cfg,
      currentSiteConfig: curSite,
      totalSites: cfg.sites.length,
      isFirstSite: this.site === 0,
      isLastSite: this.site === cfg.sites.length - 1,
      isLastChapter: this.chapter === CHAPTER_CONFIGS.length - 1,
      isTransitioning: this.isTransitioning,
    }
  }

  /** Advance to next landing site or trigger hyperdrive to next chapter */
  next() {
    if (this.isTransitioning) return
    const cfg = CHAPTER_CONFIGS[this.chapter]
    if (this.site < cfg.sites.length - 1) {
      this.hopTo(this.site + 1)
    } else if (this.chapter < CHAPTER_CONFIGS.length - 1) {
      this.warpTo(this.chapter + 1, 0)
    }
  }

  /** Rewind to previous landing site or warp back to previous chapter */
  prev() {
    if (this.isTransitioning) return
    if (this.site > 0) {
      this.hopTo(this.site - 1)
    } else if (this.chapter > 0) {
      const prevCfg = CHAPTER_CONFIGS[this.chapter - 1]
      this.warpTo(this.chapter - 1, prevCfg.sites.length - 1)
    }
  }

  /** Surface hop animation between landing sites on current planet */
  hopTo(nextSite) {
    if (this.isTransitioning || nextSite === this.site) return
    this.isTransitioning = true
    this.phase = 'HOPPING'
    this.prevSite = this.site
    this.targetSite = nextSite
    this.hopProgress = 0
    sound.playThruster(1.2)
    sound.playChirp(720)
    this.notify()

    const startTime = performance.now()
    const duration = 1400 // ms

    const step = (now) => {
      const elapsed = now - startTime
      const p = Math.min(elapsed / duration, 1)
      this.hopProgress = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      this.notify()

      if (p < 1) {
        requestAnimationFrame(step)
      } else {
        this.site = nextSite
        this.phase = 'STATIONARY'
        this.hopProgress = 0
        this.isTransitioning = false
        sound.playThruster(0.6)
        this.notify()
      }
    }
    requestAnimationFrame(step)
  }

  /** Atmospheric entry and landing animation when arriving at a planet */
  triggerLanding(targetSite = 0) {
    this.phase = 'ENTERING'
    this.site = targetSite
    this.enterProgress = 0
    this.isTransitioning = true
    sound.playThruster(1.5)
    this.notify()

    const startTime = performance.now()
    const duration = 1500 // ms descent into touchdown

    const step = (now) => {
      const elapsed = now - startTime
      const p = Math.min(elapsed / duration, 1)
      // Ease out cubic
      this.enterProgress = 1 - Math.pow(1 - p, 3)
      this.notify()

      if (p < 1) {
        requestAnimationFrame(step)
      } else {
        this.phase = 'STATIONARY'
        this.enterProgress = 1
        this.isTransitioning = false
        sound.playThruster(0.8)
        sound.playChirp(880)
        this.notify()
      }
    }
    requestAnimationFrame(step)
  }

  /** Interplanetary Hyperdrive Jump */
  warpTo(targetChap, targetSite = 0) {
    if (this.isTransitioning || (targetChap === this.chapter && targetSite === this.site)) return
    this.isTransitioning = true
    this.phase = 'WARPING'
    this.targetChapter = targetChap
    this.targetSite = targetSite
    this.warpProgress = 0
    sound.playThruster(0.9)
    sound.playHyperdrive()
    this.notify()

    const startTime = performance.now()
    const duration = 2400 // ms for full cinematic warp transition

    const step = (now) => {
      const elapsed = now - startTime
      const p = Math.min(elapsed / duration, 1)
      this.warpProgress = p
      this.notify()

      // Switch to destination planet midway inside the whiteout/purple crack
      if (elapsed > duration * 0.52 && this.chapter !== targetChap) {
        this.chapter = targetChap
        this.site = targetSite
        this.notify()
      }

      if (p < 1) {
        requestAnimationFrame(step)
      } else {
        // As soon as hyperdrive exits, trigger the landing descent on the new planet!
        if (targetChap !== 0) {
          this.triggerLanding(targetSite)
        } else {
          this.phase = 'STATIONARY'
          this.warpProgress = 0
          this.isTransitioning = false
          this.notify()
        }
      }
    }
    requestAnimationFrame(step)
  }

  /** Direct jump by chapter ID */
  jumpToChapter(chapId) {
    const idx = CHAPTER_CONFIGS.findIndex((c) => c.id === chapId)
    if (idx !== -1) {
      if (idx === this.chapter) return
      this.warpTo(idx, 0)
    }
  }

  /** Handle mouse wheel event with debounced step-lock */
  handleWheel(e) {
    const now = performance.now()
    if (now - this.lastScrollTime < 500) return
    if (Math.abs(e.deltaY) < 25) return

    this.lastScrollTime = now
    if (e.deltaY > 0) {
      this.next()
    } else {
      this.prev()
    }
  }
}

export const stageStore = new StageStore()
