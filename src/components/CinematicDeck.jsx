import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stageStore, CHAPTER_CONFIGS } from '../story/stageStore'
import { sound } from '../story/audio'
import { profile, about, skillGroups, projects, miniProjects, achievements, journey, marqueeTech } from '../data'
import { ArrowIcon, ExternalIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon } from './Icons'

export default function CinematicDeck() {
  const [state, setState] = useState(stageStore.getState())
  const [soundOn, setSoundOn] = useState(sound.enabled)

  useEffect(() => {
    const unsub = stageStore.subscribe(setState)
    const onWheel = (e) => stageStore.handleWheel(e)
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') stageStore.next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') stageStore.prev()
    }

    let touchStartY = 0
    let touchStartX = 0
    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
      touchStartX = e.touches[0].clientX
    }
    const onTouchEnd = (e) => {
      const dy = touchStartY - e.changedTouches[0].clientY
      const dx = touchStartX - e.changedTouches[0].clientX
      if (Math.abs(dy) > 45 || Math.abs(dx) > 45) {
        if (dy > 45 || dx > 45) stageStore.next()
        else stageStore.prev()
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      unsub()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const { chapter, site, phase, isLastSite, isLastChapter, isTransitioning, chapterConfig } = state
  const side = chapterConfig.side || 'left'

  const toggleSound = () => {
    const next = sound.toggleSound()
    setSoundOn(next)
    if (next) sound.playChirp(880)
  }

  // Render the specific detail card for the active chapter and landing site
  const renderDetailCard = () => {
    switch (chapter) {
      case 0: // Hero / Home
        return (
          <div className="deck-card hero-card">
            <div className="deck-badge">
              <span className="dot" />
              STATUS: READY FOR INTERSTELLAR EXPLORATION
            </div>
            <h1 className="deck-title">
              Hi, I&apos;m <span className="gradient-text">Ankit Kumar Jha</span> 👋
            </h1>
            <p className="deck-tagline">
              B.Tech IT Student (2027) · Backend Systems, PostgreSQL &amp; Creative 3D
            </p>
            <p className="deck-desc">
              National Top-15 Finalist at IIT Madras × FedEx. I build high-performance relational schemas,
              workflow orchestrations, and immersive 3D experiences.
            </p>
            <div className="deck-cta-row">
              <button
                className="btn btn-primary"
                onClick={() => stageStore.warpTo(3, 0)}
              >
                <span>Launch to Projects</span>
                <ArrowIcon style={{ width: 16, height: 16 }} />
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => stageStore.next()}
              >
                <span>Begin Planet Tour</span>
                <span style={{ fontSize: '1.1rem' }}>&rarr;</span>
              </button>
            </div>
          </div>
        )

      case 1: // About (Earth)
        if (site === 0) {
          return (
            <div className="deck-card">
              <span className="deck-site-tag">// SITE 01 · ORIGIN ARCHITECTURE</span>
              <h2 className="deck-title">{about.heading}</h2>
              <p className="deck-desc">{about.paragraphs[0]}</p>
              <p className="deck-desc">{about.paragraphs[1]}</p>
            </div>
          )
        }
        return (
          <div className="deck-card">
            <span className="deck-site-tag">// SITE 02 · ACADEMIC &amp; HACKATHON STATS</span>
            <h2 className="deck-title">Track Record &amp; Proof</h2>
            <div className="deck-stats-grid">
              {about.stats.map((s) => (
                <div className="stat glass" key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 22 }}>
              <span className="edu-chip">🎓 {about.education}</span>
            </div>
          </div>
        )

      case 2: // Skills (Mars)
        {
          const group = skillGroups[site] || skillGroups[0]
          return (
            <div className="deck-card">
              <span className="deck-site-tag">
                // SITE {String(site + 1).padStart(2, '0')} · {group.title.toUpperCase()}
              </span>
              <h2 className="deck-title">
                {group.icon} {group.title}
              </h2>
              <div className="tech-row" style={{ marginTop: 18, marginBottom: 20 }}>
                {group.skills.map((s) => (
                  <span className="tag" key={s} style={{ fontSize: '0.92rem', padding: '8px 16px' }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="deck-desc">
                Proficient in building production relational databases, REST APIs, enterprise workflows,
                and real-time systems.
              </p>
            </div>
          )
        }

      case 3: // Projects (Saturn)
        {
          const p = projects[site] || projects[0]
          return (
            <div className="deck-card project-deck-card" style={{ '--accent': p.accent }}>
              <div className="p-head">
                <span className="deck-site-tag">// LANDING SITE {String(site + 1).padStart(2, '0')} · SHIP TOUCHDOWN</span>
                <span className="proj-tag">{p.tagline}</span>
              </div>
              <h2 className="deck-title">{p.name}</h2>
              {p.award && <div className="proj-award" style={{ marginBottom: 12 }}>🏅 {p.award}</div>}
              <p className="deck-desc">{p.description}</p>
              <div className="tech-row" style={{ marginTop: 14, marginBottom: 20 }}>
                {p.tech.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="proj-links-row">
                {p.live && (
                  <a className="btn btn-primary btn-sm" href={p.live} target="_blank" rel="noreferrer">
                    <ExternalIcon style={{ width: 15, height: 15 }} /> Live Platform
                  </a>
                )}
                {p.repo && (
                  <a className="btn btn-ghost btn-sm" href={p.repo} target="_blank" rel="noreferrer">
                    <GithubIcon style={{ width: 15, height: 15 }} /> Source Code
                  </a>
                )}
              </div>
            </div>
          )
        }

      case 4: // Achievements (Jupiter)
        {
          const a = achievements[site] || achievements[0]
          return (
            <div className="deck-card" style={{ '--accent': a.accent }}>
              <span className="deck-site-tag">// SITE {String(site + 1).padStart(2, '0')} · NATIONAL MILESTONE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <span className="ach-icon" style={{ fontSize: '2rem' }}>{a.icon}</span>
                <div>
                  <h2 className="deck-title" style={{ margin: 0 }}>{a.title}</h2>
                  <span className="ach-org" style={{ color: a.accent }}>{a.org} · {a.period}</span>
                </div>
              </div>
              <p className="deck-desc" style={{ marginTop: 18 }}>{a.text}</p>
              {a.link && (
                <div style={{ marginTop: 18 }}>
                  <a className="btn btn-primary btn-sm" href={a.link} target="_blank" rel="noreferrer">
                    <ExternalIcon style={{ width: 14, height: 14 }} /> View Hackathon Platform
                  </a>
                </div>
              )}
            </div>
          )
        }

      case 5: // Journey (Neptune)
        {
          const j = journey[site] || journey[0]
          return (
            <div className="deck-card">
              <span className="deck-site-tag">// LOG WAYPOINT {j.period}</span>
              <h2 className="deck-title">{j.title}</h2>
              <p className="deck-desc" style={{ fontSize: '1.05rem', marginTop: 14 }}>{j.text}</p>
              <div style={{ marginTop: 18, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                WAYPOINT {site + 1} OF {journey.length}
              </div>
            </div>
          )
        }

      case 6: // Contact (Black Hole Station)
        return (
          <div className="deck-card">
            <span className="deck-site-tag">// DEEP SPACE TRANSMISSION DECK</span>
            <h2 className="deck-title">Let&apos;s Build Something Out of This World</h2>
            <p className="deck-desc">
              Open to Software Engineering internships, full-stack roles, and creative tech collaborations.
            </p>
            <div className="contact-cards-deck" style={{ marginTop: 20 }}>
              <a className="contact-card glass" href={`mailto:${profile.email}`}>
                <div className="c-icon"><MailIcon /></div>
                <div>
                  <small>Email</small>
                  <span className="c-val">{profile.email}</span>
                </div>
              </a>
              <a className="contact-card glass" href={`tel:${profile.phone.replace(/\s/g, '')}`}>
                <div className="c-icon"><PhoneIcon /></div>
                <div>
                  <small>Direct Line</small>
                  <span className="c-val">{profile.phone}</span>
                </div>
              </a>
              <a className="contact-card glass" href={profile.linkedin} target="_blank" rel="noreferrer">
                <div className="c-icon"><LinkedinIcon /></div>
                <div>
                  <small>Professional Network</small>
                  <span className="c-val">LinkedIn Profile ↗</span>
                </div>
              </a>
              <a className="contact-card glass" href={profile.github} target="_blank" rel="noreferrer">
                <div className="c-icon"><GithubIcon /></div>
                <div>
                  <small>Open Source Repos</small>
                  <span className="c-val">GitHub / Ankitj9568 ↗</span>
                </div>
              </a>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`cinematic-deck-overlay side-${side}`}>
      {/* Content area: floats opposite the 3D planet */}
      <div className="deck-viewport">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chapter}-${site}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="deck-card-wrapper"
          >
            {renderDetailCard()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer of the journey — mission complete only */}
      {chapter === CHAPTER_CONFIGS.length - 1 && (
        <footer className="deck-footer">
          <p className="deck-footer-line">
            &copy; {new Date().getFullYear()} Ankit Kumar Jha &middot; engineered among the stars
          </p>
          <div className="deck-footer-links">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub &nearr;</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn &nearr;</a>
            <a href={`mailto:${profile.email}`}>Email &nearr;</a>
          </div>
        </footer>
      )}

      {/* Planetary Scroller Controls (Bottom Bar) */}
      <div className="deck-scroller-bar">
        <div className="deck-scroller-inner glass">
          <button
            className="scroller-nav-btn prev"
            onClick={() => stageStore.prev()}
            disabled={chapter === 0 && site === 0}
            aria-label="Previous site or planet"
          >
            <span className="btn-sym">&lsaquo;</span>
            <span className="btn-label">PREV</span>
          </button>

          {/* Sub-item site pills / indicators */}
          <div className="scroller-sites">
            {chapterConfig.sites.map((st, idx) => (
              <button
                key={st.id}
                className={`site-pill ${idx === site ? 'active' : ''}`}
                onClick={() => stageStore.hopTo(idx)}
                title={st.title}
              >
                <span className="site-num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="site-name">{st.label.replace('SITE ', '')}</span>
              </button>
            ))}
          </div>

          <button
            className={`scroller-nav-btn next ${isLastSite && !isLastChapter ? 'hyperdrive-ready' : ''}`}
            onClick={() => stageStore.next()}
            disabled={isLastChapter && isLastSite}
            aria-label="Next site or hyperdrive jump"
          >
            <span className="btn-label">
              {isLastSite ? (isLastChapter ? 'MISSION COMPLETE' : 'HYPERDRIVE') : 'NEXT'}
            </span>
            <span className="btn-sym">&rsaquo;</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`sound-toggle-btn ${soundOn ? 'on' : 'off'}`}
            onClick={toggleSound}
            title={soundOn ? 'Mute Sci-Fi Audio FX' : 'Enable Sci-Fi Audio FX'}
            aria-label="Toggle Sound Effects"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="scroller-hint">
          {phase === 'WARPING'
            ? '🚀 HYPERDRIVE ACTIVE — INTERSTELLAR TRANSIT...'
            : phase === 'ENTERING'
            ? '🛬 RED PANDA SHIP ATMOSPHERIC ENTRY & TOUCHDOWN...'
            : phase === 'HOPPING'
            ? '🛸 SUB-ORBITAL HOP IN PROGRESS — PLANET ROTATING...'
            : 'Scroll wheel or use Left / Right symbols to explore planetary sites'}
        </div>
      </div>
    </div>
  )
}

