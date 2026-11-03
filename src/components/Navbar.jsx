import { useEffect, useState } from 'react'
import { profile } from '../data'

const LINKS = [
  { label: 'home', href: '#home' },
  { label: 'about', href: '#about' },
  { label: 'skills', href: '#skills' },
  { label: 'projects', href: '#projects' },
  { label: 'awards', href: '#achievements' },
  { label: 'journey', href: '#journey' },
  { label: 'contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* scroll-spy */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    LINKS.forEach(({ href }) => {
      const el = document.querySelector(href)
      el && obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#home" className="nav-logo">
            {profile.initials}<span>.</span>
          </a>
          <nav className="nav-links">
            {LINKS.map(({ label, href }) => (
              <a key={href} href={href} className={active === href ? 'active' : ''}>
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
          {LINKS.map(({ label, href }) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </div>
      )}
    </>
  )
}
