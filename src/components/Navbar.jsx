import { useEffect, useState } from 'react'
import { profile } from '../data'
import { stageStore, CHAPTER_CONFIGS } from '../story/stageStore'

const LINKS = [
  { label: 'home', id: 'home' },
  { label: 'about', id: 'about' },
  { label: 'skills', id: 'skills' },
  { label: 'projects', id: 'projects' },
  { label: 'awards', id: 'achievements' },
  { label: 'journey', id: 'journey' },
  { label: 'contact', id: 'contact' },
]

export default function Navbar() {
  const [activeId, setActiveId] = useState('home')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsub = stageStore.subscribe((st) => {
      setActiveId(st.chapterConfig.id)
    })
    return () => unsub()
  }, [])

  const handleNavClick = (e, id) => {
    e.preventDefault()
    stageStore.jumpToChapter(id)
    setOpen(false)
  }

  return (
    <>
      <header className="nav scrolled">
        <div className="nav-inner">
          <a
            href="#home"
            className="nav-logo"
            onClick={(e) => handleNavClick(e, 'home')}
          >
            {profile.initials}<span>.</span>
          </a>
          <nav className="nav-links">
            {LINKS.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                className={activeId === id ? 'active' : ''}
                onClick={(e) => handleNavClick(e, id)}
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            className={`nav-burger ${open ? 'open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-menu" onClick={() => setOpen(false)}>
          {LINKS.map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeId === id ? 'active' : ''}
              onClick={(e) => handleNavClick(e, id)}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
