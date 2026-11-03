import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data'
import { ArrowIcon, GithubIcon, LinkedinIcon, MailIcon, RocketIcon } from './Icons'

/* hero crystal-collector chip: receives events from the 3D scene */
function useCrystalCount() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const h = () => setN((v) => v + 1)
    window.addEventListener('akj-crystal', h)
    return () => window.removeEventListener('akj-crystal', h)
  }, [])
  return n
}

/* typewriter hook: cycles through roles */
function useTypewriter(words, speed = 70, pause = 1600) {
  const [text, setText] = useState('')
  useEffect(() => {
    let word = 0, char = 0, deleting = false, timer
    const tick = () => {
      const current = words[word]
      if (!deleting) {
        char++
        setText(current.slice(0, char))
        if (char === current.length) {
          deleting = true
          timer = setTimeout(tick, pause)
          return
        }
        timer = setTimeout(tick, speed)
      } else {
        char--
        setText(current.slice(0, char))
        if (char === 0) {
          deleting = false
          word = (word + 1) % words.length
        }
        timer = setTimeout(tick, speed / 2)
      }
    }
    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [words, speed, pause])
  return text
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  const typed = useTypewriter(profile.roles)
  const crystals = useCrystalCount()

  return (
    <section id="home" className="hero">
      <motion.div
        className="container hero-content"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="hero-badge" variants={item}>
          <span className="dot" />
          OPEN TO INTERNSHIPS & COLLABORATIONS
        </motion.div>

        {crystals > 0 && (
          <motion.div className="hero-badge crystal-chip" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="crystal-ico">✦</span>
            {crystals} crystal{crystals > 1 ? 's' : ''} collected
          </motion.div>
        )}

        <motion.h1 variants={item}>
          Hi, I&apos;m <span className="gradient-text">Ankit<br />Kumar Jha</span>{' '}
          <span className="wave">👋</span>
        </motion.h1>

        <motion.div className="hero-typeline" variants={item}>
          <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginRight: 10 }}>&gt;_</span>
          <span className="typed">{typed}</span>
          <span className="caret" />
        </motion.div>

        <motion.p className="hero-desc" variants={item}>
          Final-year B.Tech IT student — building database-backed platforms with
          Express, PostgreSQL &amp; Supabase. Top-15 finalist, IIT Madras × FedEx.
          Now pushing into interactive 3D on the web.
        </motion.p>

        <motion.div className="hero-cta" variants={item}>
          <a className="btn btn-primary" href="#projects">
            <RocketIcon style={{ width: 18, height: 18 }} /> Explore My Work
            <ArrowIcon style={{ width: 17, height: 17 }} />
          </a>
          <a className="btn btn-ghost" href="#contact">Get in Touch</a>
        </motion.div>

        <motion.div className="hero-socials" variants={item}>
          <a className="icon-btn" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GithubIcon />
          </a>
          <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <LinkedinIcon />
          </a>
          <a className="icon-btn" href={`mailto:${profile.email}`} aria-label="Email">
            <MailIcon />
          </a>
        </motion.div>
      </motion.div>

      <div className="orbit-hint" aria-hidden="true">
        ⬆ scroll = travel the system · <b>click the rocket = warp</b> · ✦ collect crystals
      </div>

      <div className="scroll-hint">
        <div className="mouse" />
        SCROLL
      </div>
    </section>
  )
}
