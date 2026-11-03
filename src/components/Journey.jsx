import { motion } from 'framer-motion'
import { journey } from '../data'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }
const fadeUp = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Journey() {
  return (
    <section id="journey" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <motion.span className="sec-label" variants={fadeUp}>chapter 05 · the log</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            The <span className="gradient-text">Mission Log</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="timeline"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {journey.map((j) => (
            <motion.div className="tl-item" key={j.period} variants={fadeUp}>
              <span className="tl-period">{j.period}</span>
              <h3>{j.title}</h3>
              <p>{j.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
