import { motion } from 'framer-motion'
import { about, profile } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.span className="sec-label" variants={fadeUp}>chapter 01 · origin</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            {about.heading}
          </motion.h2>

          <div className="about-grid">
            <motion.div className="about-text" variants={fadeUp}>
              <p><strong>{about.paragraphs[0]}</strong></p>
              <p>{about.paragraphs[1]}</p>
              <div className="about-stats">
                {about.stats.map((s) => (
                  <div className="stat glass" key={s.label}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="avatar-card glass" variants={fadeUp}>
              <div className="avatar-ring">
                <img src={profile.avatar} alt={profile.name} />
              </div>
              <h3>{profile.name}</h3>
              <span className="sub">&lt;{profile.location} /&gt;</span>
              <div>
                <span className="edu-chip">🎓 {about.education}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
