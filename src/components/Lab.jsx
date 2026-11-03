import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { LabModel, LabLights, LabControls, LabDust } from './three/LabModel'
import { motion } from 'framer-motion'

const MODELS = [
  { id: 'rocket', label: 'Rocket', sub: 'Rae the Red Panda', url: '/models/spaceship.glb', names: ['Spaceship_RaeTheRedPanda'], radius: 1.5, yaw: 0, pitch: 0.1 },
  { id: 'wings', label: 'Wing Ship', sub: 'Fernando the Flamingo', url: '/models/spaceship.glb', names: ['Spaceship_FernandoTheFlamingo'], radius: 1.55, yaw: -Math.PI / 2, pitch: 0.05 },
  { id: 'astronaut', label: 'Astronaut', sub: 'Barbara the Bee', url: '/models/astronaut_barbarathebee.glb', names: ['BarbaraTheBee', 'Pistol'], radius: 1.35, yaw: 0, pitch: 0 },
  { id: 'rover', label: 'Rover', sub: 'Rover MK-II', url: '/models/rover.glb', names: ['Rover_2_1', 'Wheel_1_2', 'Wheel_2_2', 'Wheel_3_2', 'Wheel_4_2'], radius: 1.45, yaw: 0.7, pitch: 0 },
  { id: 'planet', label: 'Planet', sub: 'Quaternius Prime', url: '/models/planet.glb', names: ['Planet_2'], radius: 1.5, yaw: 0.9, pitch: 0.15 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function Lab() {
  const [active, setActive] = useState('rocket')
  const [spin, setSpin] = useState(true)
  const [wire, setWire] = useState(false)
  const tab = MODELS.find((m) => m.id === active)

  return (
    <section id="lab" className="section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.span className="sec-label" variants={fadeUp}>3d playground</motion.span>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Grab It. <span className="gradient-text">Spin It.</span>
          </motion.h2>
          <motion.p className="lab-lead" variants={fadeUp}>
            Real 3D models (Quaternius, CC0) rendered live in your browser.
            Drag to rotate, scroll to zoom — pure client-side WebGL.
          </motion.p>

          <div className="lab-shell">
            <motion.aside className="lab-side" variants={fadeUp}>
              <div className="lab-tabs">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    className={`lab-tab ${m.id === active ? 'active' : ''}`}
                    onClick={() => setActive(m.id)}
                  >
                    <span className="lab-tab-label">{m.label}</span>
                    <span className="lab-tab-sub">{m.sub}</span>
                  </button>
                ))}
              </div>
              <div className="lab-toggles">
                <button
                  className={`lab-toggle ${spin ? 'on' : ''}`}
                  onClick={() => setSpin(!spin)}
                  aria-pressed={spin}
                >
                  ⟳ Spin <i>{spin ? 'ON' : 'OFF'}</i>
                </button>
                <button
                  className={`lab-toggle ${wire ? 'on' : ''}`}
                  onClick={() => setWire(!wire)}
                  aria-pressed={wire}
                >
                  ▦ Wireframe <i>{wire ? 'ON' : 'OFF'}</i>
                </button>
              </div>
              <p className="lab-hint-mono">drag = rotate · scroll = zoom</p>
              <p className="lab-credit">
                Models: <a href="https://quaternius.com" target="_blank" rel="noreferrer">Quaternius</a> — CC0 license
              </p>
            </motion.aside>

            <motion.div className="lab-stage glass" variants={fadeUp}>
              <span className="lab-model-name">{tab.label} · {tab.sub}</span>
              <Canvas
                camera={{ position: [0, 0.6, 4.4], fov: 42 }}
                dpr={[1, 1.8]}
                gl={{ antialias: true, alpha: true }}
              >
                <Suspense fallback={null}>
                  <LabLights />
                  <LabDust />
                  <group key={tab.id}>
                    <LabModel tab={tab} wire={wire} />
                  </group>
                  <LabControls autoRotate={spin} />
                </Suspense>
              </Canvas>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
