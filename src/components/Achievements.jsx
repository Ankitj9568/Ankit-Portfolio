import { motion } from 'framer-motion'
import { achievements } from '../data'
import { ExternalIcon } from './Icons'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Achievements() {
  return (
    <section id="achievements" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.span className="sec-label" variants={fadeUp}>achievements</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Proof of <span className="gradient-text">Grind</span>
          </motion.h2>

          <div className="ach-grid">
            {achievements.map((a) => (
              <motion.article
                className="ach-card glass"
                key={a.title}
                style={{ '--accent': a.accent }}
                variants={fadeUp}
              >
                <div className="ach-top">
                  <span className="ach-icon">{a.icon}</span>
                  <span className="ach-period">{a.period}</span>
                </div>
                <h3>{a.title}</h3>
                <span className="ach-org" style={{ color: 'var(--accent)' }}>{a.org}</span>
                <p>{a.text}</p>
                {a.link && (
                  <a className="ach-link" href={a.link} target="_blank" rel="noreferrer">
                    View platform <ExternalIcon style={{ width: 15, height: 15 }} />
                  </a>
                )}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
