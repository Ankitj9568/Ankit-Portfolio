import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles, Stars, Trail, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useFamilyModel, FittedModel, preloadFamilies } from './kit'

const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/* ── planet anchor + ring tilt ──────────────── */
const PLANET = new THREE.Vector3(3.05, 0.4, -2.6)
const RING_TILT = [1.32, 0.18, 0.42]

/* shared, render-free state: warp boost + mouse parallax */
const warp = { boost: 0 }
const mouse = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'mousemove',
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

/** tell the neon cursor ring to glow (integration with our custom cursor) */
const emitHover = (on) => window.dispatchEvent(new Event(on ? 'akj-cursor-hover' : 'akj-cursor-blur'))

/* ── camera parallax rig + warp decay ───────── */
function Rig({ children }) {
  const ref = useRef()
  useFrame(({ clock }, dt) => {
    warp.boost = Math.max(0, warp.boost - dt * 0.55)
    const f = Math.min(dt * 2.6, 1)
    ref.current.rotation.y += (mouse.x * 0.1 - ref.current.rotation.y) * f
    ref.current.rotation.x += (-mouse.y * 0.06 - ref.current.rotation.x) * f
  })
  return <group ref={ref}>{children}</group>
}

/* ── ring dust: particles orbiting in the ring plane ── */
function RingDust() {
  const ref = useRef()
  const count = 150
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: 1.75 + Math.random() * 0.85,
        a: Math.random() * Math.PI * 2,
        z: (Math.random() - 0.5) * 0.07,
        s: 0.04 + Math.random() * 0.09,
        w: 0.02 + Math.random() * 0.06,
      })),
    [],
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((d, i) => {
      const a = d.a + t * d.w
      dummy.position.set(Math.cos(a) * d.r, Math.sin(a) * d.r, d.z)
      dummy.scale.setScalar(d.s)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
    </instancedMesh>
  )
}

/* ── planet: real Quaternius model + atmosphere + saturn rings ── */
function Planet() {
  const map = useFamilyModel('/models/planet.glb')
  const spin = useRef()
  const rings = useRef()
  useFrame((_, dt) => {
    spin.current.rotation.y -= dt * 0.05
    rings.current.rotation.z += dt * 0.008
  })
  return (
    <group position={PLANET}>
      <group ref={spin}>
        <FittedModel map={map} names={['Planet_2']} radius={1.15} />
      </group>
      {/* atmosphere glow */}
      <mesh scale={1.24}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* saturn rings */}
      <group ref={rings} rotation={RING_TILT}>
        <mesh>
          <torusGeometry args={[1.95, 0.018, 8, 160]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.45} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.32, 0.011, 8, 160]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
        </mesh>
        <RingDust />
      </group>
      <Sparkles count={26} scale={3.6} size={2.4} speed={0.35} color="#7dd3fc" opacity={0.6} />
    </group>
  )
}

/* ── hero rocket: real GLB model on a flight loop ── */
function Rocket({ hov }) {
  const map = useFamilyModel('/models/spaceship.glb')
  const fly = useRef()
  const inner = useRef()
  const engine = useRef()
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const hovRef = useRef(false)
  hovRef.current = hov
  const path = useMemo(() => {
    const pts = []
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      pts.push(
        new THREE.Vector3(
          PLANET.x + Math.cos(a) * 3.55,
          PLANET.y + Math.sin(a) * 1.25 + 0.15,
          PLANET.z + Math.sin(a) * 2.55 - 1.6,
        ),
      )
    }
    return new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.45)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const u = (t * (0.05 + warp.boost * 0.4)) % 1
    fly.current.position.copy(path.getPointAt(u))
    path.getPointAt((u + 0.012) % 1, ahead)
    fly.current.lookAt(ahead)
    // ship slight bank + hover scale + flickering engine
    const target = hovRef.current ? 1.14 : 1
    const s = inner.current.scale.x + (target - inner.current.scale.x) * 0.12
    inner.current.scale.setScalar(s)
    engine.current.intensity = 5 + Math.sin(t * 38) * 1.6 + warp.boost * 24
  })

  return (
    <Trail width={2.2} length={3.6} color="#22d3ee" attenuation={(w) => w * w}>
      <group ref={fly}>
        <group ref={inner}>
          <FittedModel map={map} names={['Spaceship_RaeTheRedPanda']} radius={0.62} />
          {/* engine flame core */}
          <mesh position={[0, 0, -0.62]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#22d3ee" toneMapped={false} />
          </mesh>
          <pointLight
            ref={engine}
            position={[0, 0, -0.75]}
            color="#22d3ee"
            intensity={5}
            distance={2.6}
          />
        </group>
      </group>
    </Trail>
  )
}

/* clickable wrapper for the rocket — hover & warp on click */
function SpaceshipWrapped(props) {
  const [hov, setHov] = useState(false)
  const glow = (on) => {
    setHov(on)
    emitHover(on)
  }
  const blast = (e) => {
    e.stopPropagation()
    warp.boost = 1
  }
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); glow(true) }}
      onPointerOut={() => glow(false)}
      onPointerDown={blast}
    >
      <Rocket {...props} hov={hov} />
    </group>
  )
}

/* ── asteroid belt around the planet ────────── */
const ROCKS = ['Rock_1', 'Rock_2', 'Rock_3', 'Rock_4']
function Asteroids() {
  const map = useFamilyModel('/models/rock.glb')
  const items = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        rock: ROCKS[i % ROCKS.length],
        r: 2.15 + Math.random() * 1.5,
        a: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 1.4,
        s: 0.09 + Math.random() * 0.13,
        sp: 0.02 + Math.random() * 0.05,
      })),
    [],
  )
  const group = useRef()
  useFrame((_, dt) => {
    items.forEach((it, i) => {
      it.a += it.sp * dt * (1 + warp.boost * 3) + dt * 0.012
      const g = group.current.children[i]
      g.position.set(
        PLANET.x + Math.cos(it.a) * it.r,
        PLANET.y + it.y,
        PLANET.z + Math.sin(it.a) * it.r,
      )
      g.rotation.x += dt * 0.5
      g.rotation.y += dt * 0.35
    })
  })
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i}>
          <FittedModel map={map} names={[it.rock]} radius={it.s} />
        </group>
      ))}
    </group>
  )
}

/* ── collectible crystals — hover, click to collect ── */
const CRYSTALS = [
  { pos: [4.7, 2.2, -1.4], pick: 'Pickup_Sphere', color: '#22d3ee', key: 'sphere' },
  { pos: [-3.7, -2.5, 0.8], pick: 'Pickup_Thunder', color: '#a855f7', key: 'thunder' },
  { pos: [0.6, 3.5, -3.0], pick: 'Pickup_Jar', color: '#34d399', key: 'jar' },
  { pos: [-2.4, 2.7, -1.6], pick: 'Pickup_KeyCard', color: '#facc15', key: 'keycard' },
]
function Crystal({ cfg, index }) {
  const map = useFamilyModel('/models/pickup.glb')
  const ref = useRef()
  const [hov, setHov] = useState(false)
  const st = useRef({ collected: false, until: 0, s: 1, now: 0 })
  useFrame(({ clock }, dt) => {
    const s = st.current
    s.now = clock.elapsedTime
    if (s.collected && s.now > s.until) s.collected = false
    const target = s.collected ? 0.0001 : hov ? 1.25 : 1
    s.s += (target - s.s) * Math.min(dt * 5, 1)
    ref.current.scale.setScalar(s.s)
    ref.current.visible = s.s > 0.015
    ref.current.position.set(
      cfg.pos[0],
      cfg.pos[1] + Math.sin(s.now * 1.3 + index) * 0.25,
      cfg.pos[2],
    )
    ref.current.rotation.y += dt * 1.4
  })
  const click = (e) => {
    e.stopPropagation()
    st.current.collected = true
    st.current.until = st.current.now + 6.5
    warp.boost = Math.max(warp.boost, 0.6)
    window.dispatchEvent(new CustomEvent('akj-crystal', { detail: cfg.key }))
  }
  return (
    <group
      ref={ref}
      onClick={click}
      onPointerOver={(e) => { e.stopPropagation(); setHov(true); emitHover(true) }}
      onPointerOut={() => { setHov(false); emitHover(false) }}
    >
      <FittedModel map={map} names={[cfg.pick]} radius={0.3} emissive={cfg.color} emissiveIntensity={1.4} />
      <Sparkles count={8} scale={1.1} size={1.6} speed={0.5} color={cfg.color} opacity={0.8} />
    </group>
  )
}

/* ── hyperdrive streaks (speed reacts to warp boost) ── */
function HyperDrive({ color, opacity = 0.5, seedX = 18, seedY = 9 }) {
  const ref = useRef()
  const count = 200
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const streaks = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * seedX,
        y: (Math.random() - 0.5) * seedY,
        z: (Math.random() - 0.5) * 18,
        v: 5 + Math.random() * 11,
        len: 0.5 + Math.random() * 1.7,
      })),
    [seedX, seedY],
  )
  useFrame((_, dt) => {
    streaks.forEach((s, i) => {
      s.z += s.v * dt * (1 + warp.boost * 6)
      if (s.z > 10) {
        s.z = -10
        s.x = (Math.random() - 0.5) * seedX
        s.y = (Math.random() - 0.5) * seedY
      }
      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.set(0.012, 0.012, s.len * (0.32 + warp.boost * 0.9))
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

/* ── full hero scene ────────────────────────── */
export default function HeroScene() {
  return (
    <div className="hero-canvas" onDoubleClick={() => { warp.boost = 1 }}>
      <Canvas
        camera={{ position: [0, 0.55, 7.6], fov: 50 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <fog attach="fog" args={['#04040c', 10, 26]} />
        <ambientLight intensity={0.4} />
        <hemisphereLight color="#67e8f9" groundColor="#a855f7" intensity={0.35} />
        <directionalLight position={[0, 3, 8]} intensity={1.1} />
        <pointLight position={[7, 5, 3]} intensity={70} color="#67e8f9" />
        <pointLight position={[-6, -4, 2]} intensity={45} color="#a855f7" />

        <Suspense fallback={null}>
          <Stars radius={42} depth={32} count={1600} factor={3.4} saturation={0} fade speed={0.55} />
          <Rig>
            <Planet />
            <Asteroids />
            <SpaceshipWrapped />
            {CRYSTALS.map((cfg, i) => (
              <Crystal key={cfg.key} cfg={cfg} index={i} />
            ))}
            <HyperDrive color="#7dd3fc" />
            <HyperDrive color="#c084fc" opacity={0.32} />
            <Float speed={1.5} rotationIntensity={1.4} floatIntensity={1.5}>
              <mesh position={[-3.6, 1.6, -0.6]}>
                <icosahedronGeometry args={[0.34, 0]} />
                <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.55} />
              </mesh>
            </Float>
            <Float speed={1.2} rotationIntensity={1.1} floatIntensity={1.8}>
              <mesh position={[-2.7, -1.9, 0.4]}>
                <torusKnotGeometry args={[0.24, 0.075, 90, 12]} />
                <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.45} />
              </mesh>
            </Float>
          </Rig>
        </Suspense>

        <OrbitControls
          makeDefault
          target={[1.05, 0.2, -0.5]}
          enablePan={false}
          enableZoom={!IS_TOUCH}
          enableRotate={!IS_TOUCH}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          autoRotate={!IS_TOUCH}
          autoRotateSpeed={0.35}
          minDistance={4.4}
          maxDistance={11.5}
          minPolarAngle={Math.PI * 0.22}
          maxPolarAngle={Math.PI * 0.72}
        />

        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.3}
            radius={0.75}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

preloadFamilies(['/models/spaceship.glb', '/models/planet.glb', '/models/rock.glb', '/models/pickup.glb'])
