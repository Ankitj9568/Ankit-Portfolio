import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { miniProjects, projects } from '../data'
import { ExternalIcon, GithubIcon } from './Icons'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

/* 3D-tilt glass card */
function ProjectCard({ p }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 18 })
  const sry = useSpring(ry, { stiffness: 220, damping: 18 })
  const ref = useRef(null)

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 10)
    rx.set((0.5 - py) * 10)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.article
      ref={ref}
      className="proj-card glass"
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900, '--accent': p.accent }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      variants={fadeUp}
    >
      <div className="proj-head">
        <div className="p-icon">🚀</div>
        <div className="proj-links">
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" aria-label={`${p.name} live`}>
              <ExternalIcon />
            </a>
          )}
          <a href={p.repo} target="_blank" rel="noreferrer" aria-label={`${p.name} repo`}>
            <GithubIcon />
          </a>
        </div>
      </div>
      <span className="proj-tag">{p.tagline}</span>
      <h3>{p.name}</h3>
      {p.award && <span className="proj-award">🏅 {p.award}</span>}
      <p className="desc">{p.description}</p>
      <div className="tech-row">
        {p.tech.map((t) => <span className="tag" key={t}>{t}</span>)}
      </div>
    </motion.article>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.span className="sec-label" variants={fadeUp}>chapter 03 · mission deck</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Things I've <span className="gradient-text">Built & Shipped</span>
          </motion.h2>

          <div className="projects-grid">
            {projects.map((p) => <ProjectCard key={p.name} p={p} />)}
          </div>

          <motion.span className="mini-proj-label" variants={fadeUp}>
            more experiments →
          </motion.span>
          <motion.div className="mini-proj-row" variants={fadeUp}>
            {miniProjects.map((m) => (
              <a className="mini-chip" key={m.name} href={m.repo} target="_blank" rel="noreferrer">
                <GithubIcon style={{ width: 14, height: 14 }} /> {m.name}
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
