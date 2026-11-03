import { motion } from 'framer-motion'
import { profile } from '../data'
import { ArrowIcon, GithubIcon, LinkedinIcon, MailIcon, PhoneIcon } from './Icons'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container contact-wrap">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.span className="sec-label" variants={fadeUp}>final transmission</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Let's Build Something <span className="gradient-text">Out of This World</span>
          </motion.h2>
          <motion.p variants={fadeUp}>
            Got an idea, an internship opportunity, or just want to say hi?
            My inbox is always open — I usually reply within a day.
          </motion.p>

          <motion.div variants={fadeUp}>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              <MailIcon style={{ width: 18, height: 18 }} /> Say Hello
              <ArrowIcon style={{ width: 17, height: 17 }} />
            </a>
          </motion.div>

          <div className="contact-cards">
            <motion.a
              className="contact-card glass"
              href={`mailto:${profile.email}`}
              variants={fadeUp}
            >
              <div className="c-icon"><MailIcon /></div>
              <div>
                <small>Email</small>
                <span className="c-val">{profile.email}</span>
              </div>
            </motion.a>
            <motion.a
              className="contact-card glass"
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              variants={fadeUp}
            >
              <div className="c-icon"><PhoneIcon /></div>
              <div>
                <small>Phone</small>
                <span className="c-val">{profile.phone}</span>
              </div>
            </motion.a>
            <motion.a
              className="contact-card glass"
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              variants={fadeUp}
            >
              <div className="c-icon"><GithubIcon /></div>
              <div>
                <small>GitHub</small>
                <span className="c-val">@Ankitj9568</span>
              </div>
            </motion.a>
            <motion.a
              className="contact-card glass"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              variants={fadeUp}
            >
              <div className="c-icon"><LinkedinIcon /></div>
              <div>
                <small>LinkedIn</small>
                <span className="c-val">Ankit Kumar Jha</span>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
