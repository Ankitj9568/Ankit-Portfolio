import { useEffect, useState } from 'react'
import { sound } from '../story/audio'

/*
 * Boot sequence: the page loads into a cold-start of the ship — engine
 * checklist lines type in one after another, the engine glow builds,
 * then "I'm Ankit / let's begin the journey" flashes and dissolves
 * into the solar-system hero. Skip on click.
 */
const LINES = [
  '' /* placeholder — index 0 starts instantly */,
  '> cold-start · power bus .................. ONLINE',
  '> main engines .......................... IGNITION',
  '> ignition confirmed · thrusters primed',
  '> trajectory locked · planetary exploration ready',
]

export default function BootSequence() {
  const [step, setStep] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const T = [550, 1400, 2400, 3300, 4350, 5400, 6350]
    const timers = T.map((ms, i) =>
      setTimeout(() => {
        setStep(i + 1)
        if (i === 1) sound.playThruster(1.5)
        if (i === 4) sound.playChirp(840)
      }, ms)
    )
    const end = setTimeout(() => setGone(true), 7200)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(end)
    }
  }, [])

  if (gone) return null
  const out = step >= 6

  const skip = () => {
    if (!out) {
      sound.playThruster(0.8)
      setStep(6)
      setTimeout(() => setGone(true), 900)
    }
  }

  return (
    <div
      className={`boot${out ? ' boot-out' : ''}`}
      aria-hidden="true"
      onClick={skip}
      role="presentation"
    >
      {/* engine glow rises as ignition progresses */}
      <div
        className="boot-engine"
        style={{ opacity: step >= 2 ? (step >= 4 ? 0.85 : 0.45) : 0 }}
      />
      {/* main engine i-beam flicker on ignition */}
      {step >= 2 && <div className="boot-burn" />}

      <div className="boot-term">
        {LINES.slice(1).map((line, i) => (
          step > i && (
            <p key={i} className="boot-line" style={{ animationDelay: '0s' }}>
              {line}
            </p>
          )
        ))}
        {step === 0 && <p className="boot-line boot-line-live">{'>'} initializing cold-start...</p>}
      </div>

      {step >= 4 && <div className="boot-name">I&rsquo;m Ankit</div>}
      {step >= 5 && <div className="boot-tag">&mdash; let&rsquo;s begin the journey &mdash;</div>}

      {/* ignition flash right before reveal */}
      {step >= 6 && <div className="boot-flash" />}

      <div className="boot-skip-hint">
        CLICK ANYWHERE TO BYPASS SEQUENCE [ESC / SPACE]
      </div>
    </div>
  )
}
