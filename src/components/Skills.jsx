import { motion } from 'framer-motion'
import { marqueeTech, skillGroups } from '../data'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } },
})

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.span className="sec-label" variants={fadeUp()}>skills</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp()}>
            My <span className="gradient-text">Tech Arsenal</span>
          </motion.h2>

          <div className="skills-grid">
            {skillGroups.map((g) => (
              <motion.div className="skill-card glass" key={g.title} variants={fadeUp()}>
                <div className="icon">{g.icon}</div>
                <h3>{g.title}</h3>
                <div className="tag-row">
                  {g.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* infinite tech marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-item" key={copy} style={{ minWidth: 'max-content' }}>
              {marqueeTech.map((t) => <span key={t}>{t}</span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
