/**
 * Zero-dependency procedural Web Audio sound synthesizer for sci-fi portfolio.
 * Generates thrusters, hyperdrive warp jumps, and UI chirp effects in real-time.
 */

class SoundEngine {
  constructor() {
    this.ctx = null
    this.enabled = true
    this.engineNode = null
    this.engineGain = null
  }

  init() {
    if (this.ctx) return
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    this.ctx = new AudioContext()
  }

  ensureReady() {
    this.init()
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleSound() {
    this.enabled = !this.enabled
    if (!this.enabled && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime)
    }
    return this.enabled
  }

  /** Subtle UI blip when switching sites or clicking nav */
  playChirp(freq = 640, duration = 0.08) {
    if (!this.enabled) return
    try {
      this.ensureReady()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration)

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Thruster burn sound during takeoff or touchdown */
  playThruster(duration = 1.2) {
    if (!this.enabled) return
    try {
      this.ensureReady()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // Pinkish noise via buffer
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99 * b0 + white * 0.05
        b1 = 0.95 * b1 + white * 0.08
        b2 = 0.85 * b2 + white * 0.12
        data[i] = (b0 + b1 + b2) * 0.4
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(220, now)
      filter.frequency.exponentialRampToValueAtTime(650, now + duration * 0.3)
      filter.frequency.exponentialRampToValueAtTime(140, now + duration)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.01, now)
      gain.gain.linearRampToValueAtTime(0.07, now + duration * 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start(now)
      noise.stop(now + duration)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Hyperdrive acceleration and warp boom */
  playHyperdrive() {
    if (!this.enabled) return
    try {
      this.ensureReady()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // Pitch sweep oscillator
      const osc = this.ctx.createOscillator()
      const oscGain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(65, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2)

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(180, now)
      filter.frequency.exponentialRampToValueAtTime(3200, now + 1.2)

      oscGain.gain.setValueAtTime(0.02, now)
      oscGain.gain.linearRampToValueAtTime(0.08, now + 0.9)
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

      osc.connect(filter)
      filter.connect(oscGain)
      oscGain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 1.4)

      // Warp exit boom
      const boomTimer = setTimeout(() => {
        if (!this.enabled || !this.ctx) return
        const t = this.ctx.currentTime
        const boomOsc = this.ctx.createOscillator()
        const boomGain = this.ctx.createGain()
        boomOsc.type = 'sine'
        boomOsc.frequency.setValueAtTime(140, t)
        boomOsc.frequency.exponentialRampToValueAtTime(30, t + 1.0)

        boomGain.gain.setValueAtTime(0.12, t)
        boomGain.gain.exponentialRampToValueAtTime(0.001, t + 1.0)

        boomOsc.connect(boomGain)
        boomGain.connect(this.ctx.destination)
        boomOsc.start(t)
        boomOsc.stop(t + 1.0)
      }, 950)

      return () => clearTimeout(boomTimer)
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const sound = new SoundEngine()

