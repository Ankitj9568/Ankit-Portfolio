import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, Sparkles, Stars, Trail, Lightformer, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useFamilyModel, FittedModel, preloadFamilies } from '../components/three/kit'
import { getProgress, smooth } from '../story/progress'

const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/* ── premium texture helper: SRGB color space + anisotropic filtering ── */
const TEX_CACHE = new Map()
function loadTex(url) {
  if (TEX_CACHE.has(url)) return TEX_CACHE.get(url)
  const t = new THREE.TextureLoader().load(url)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  TEX_CACHE.set(url, t)
  return t
}

/* ── atmosphere rim: fresnel halo around a planet (the 'premium' look) ── */
const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vP = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPow;
  uniform float uInt;
  varying vec3 vN;
  varying vec3 vP;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), uPow);
    gl_FragColor = vec4(uColor * f * uInt, f * uInt);
  }
`
function Atmosphere({ radius = 1, color = '#6ab7ff', scale = 1.055, power = 3, strength = 1.15 }) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uPow: { value: power },
      uInt: { value: strength },
    }),
    [color, power, strength],
  )
  return (
    <mesh>
      <sphereGeometry args={[radius * scale, 48, 48]} />
      <shaderMaterial
        args={[{
          uniforms,
          vertexShader: ATMO_VERT,
          fragmentShader: ATMO_FRAG,
          transparent: true,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }]}
      />
    </mesh>
  )
}

/* warp boost shared with the cursor/chip UX */
export const warp = { boost: 0 }
const emitHover = (on) =>
  window.dispatchEvent(new Event(on ? 'akj-cursor-hover' : 'akj-cursor-blur'))

/* ── the story: one waypoint per chapter ─────────────────
   planets alternate screen-side: index odd → planet on the LEFT? no —
   here `side` refers to where the planet sits: 'left' | 'right'            */
const CHAPTERS = [
  { id: 'home', pos: [0, 0.4, 10], tgt: [0, 0.4, 4] },          // prologue: deep space
  { id: 'about', planet: [(-4.6), 0.3, 0], side: 'left' },      // Earth
  { id: 'skills', planet: [5.0, 0.9, -16], side: 'right' },     // Mars
  { id: 'projects', planet: [(-5.4), 0.5, -34], side: 'left' }, // Saturn (rings = projects)
  { id: 'lab', pos: [0.4, 0.7, -45], tgt: [0, 0.5, -52] },      // travel stretch
  { id: 'achievements', planet: [5.6, -0.4, -56], side: 'right' }, // Jupiter
  { id: 'journey', planet: [(-4.9), 0.7, -76], side: 'left' },  // Neptune
  { id: 'contact', planet: [4.8, 0.35, -94], side: 'right' },   // Station
]

function Rig() {
  const { camera } = useThree()
  const posRef = useRef(new THREE.Vector3(0, 0.5, 11))
  const tgtRef = useRef(new THREE.Vector3(0, 0.4, 6))
  const p = useMemo(() => new THREE.Vector3(), [])
  const t = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    warp.boost = Math.max(0, warp.boost - dt * 0.5)

    // reflect lab veil on <body> for a CSS fade of the story canvas
    document.body.classList.toggle('story-veiled', getProgress().veilLab)

    const { i } = getProgress()
    const A = CHAPTERS[Math.min(i, CHAPTERS.length - 1)]
    const B = CHAPTERS[Math.min(i + 1, CHAPTERS.length - 1)]
    const k = smooth(getProgress().t)

    const camOf = (c) => {
      if (!c.planet) return { pos: c.pos, tgt: c.tgt }
      const sgn = c.side === 'left' ? 1 : -1
      return {
        pos: [c.planet[0] - sgn * 1.4, c.planet[1] + 0.35, c.planet[2] + 7.4],
        tgt: [c.planet[0] + sgn * 1.5, c.planet[1], c.planet[2] - 0.4],
      }
    }
    const a = camOf(A)
    const b = camOf(B)
    p.fromArray(a.pos).lerp(new THREE.Vector3().fromArray(b.pos), k)
    t.fromArray(a.tgt).lerp(new THREE.Vector3().fromArray(b.tgt), k)

    posRef.current.lerp(p, Math.min(dt * 2.2, 1))
    tgtRef.current.lerp(t, Math.min(dt * 2.8, 1))
    camera.position.copy(posRef.current)
    camera.lookAt(tgtRef.current)
  })
  return null
}

/* ── realistic textured planet (with optional atmosphere halo) ── */
function Planet({ url, pos, radius = 1.6, spin = 0.05, tilt = 0, atmo = null }) {
  const ref = useRef()
  const texture = loadTex(url)
  useFrame((_, dt) => { ref.current.rotation.y += dt * spin })
  return (
    <group position={pos} rotation={[0, tilt, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 56, 56]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>
      {atmo && <Atmosphere radius={radius} color={atmo} />}
    </group>
  )
}

function Moon({ center }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const a = clock.elapsedTime * 0.35
    ref.current.position.set(center[0] + Math.cos(a) * 2.9, center[1] + 0.3, center[2] + Math.sin(a) * 2.9)
    ref.current.rotation.y += 0.002
  })
  const texture = loadTex('/textures/2k_moon.jpg')
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.42, 32, 32]} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  )
}

/* ── Saturn: realistic ring texture + PROJECT RINGS ── */
function radialRingGeometry(inner, outer, segs = 160) {
  const g = new THREE.RingGeometry(inner, outer, segs, 1)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const r = Math.hypot(v.x, v.y)
    const a = Math.atan2(v.y, v.x)
    uv.setXY(i, (r - inner) / (outer - inner), (a + Math.PI) / (2 * Math.PI))
  }
  return g
}

const RING_TILT = [-Math.PI / 2.35, 0, 0.18]

function Saturn({ pos }) {
  const texture = loadTex('/textures/2k_saturn_ring_alpha.png')
  return (
    <group position={pos} rotation={[0, -0.5, 0]}>
      {/* body */}
      <PlanetSpin radius={1.55} />
      <Atmosphere radius={1.55} color="#ffe3b0" power={3.4} strength={0.8} />
      {/* genuine alpha-mapped ring */}
      <group rotation={RING_TILT}>
        <mesh geometry={radialRingGeometry(1.9, 3.1)}>
          <meshStandardMaterial
            map={texture}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
            roughness={0.85}
            depthWrite={false}
          />
        </mesh>
      </group>
      {/* each project = one glowing orbit arc */}
      <ProjectRings />
    </group>
  )
}

function PlanetSpin({ radius }) {
  const map = loadTex('/textures/2k_saturn.jpg')
  const ref = useRef()
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.05 })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 56, 56]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  )
}

/* orbit arcs — one per project (data.js projects[0..3]) */
function ProjectRings() {
  const arcs = [
    { color: '#22d3ee', r: 2.05, y: 0.02, dur: 0 },
    { color: '#a855f7', r: 2.5, y: 0.06, dur: 0 },
    { color: '#34d399', r: 2.9, y: 0.1, dur: 0 },
    { color: '#facc15', r: 3.3, y: 0.15, dur: 0 },
  ]
  return (
    <group rotation={[-Math.PI / 2.35, 0, 0.18]}>
      {arcs.map((a, i) => (
        <ProjectArc key={a.color} arc={a} index={i} />
      ))}
    </group>
  )
}

function ProjectArc({ arc, index }) {
  const [hov, setHov] = useState(false)
  const ref = useRef()
  const [open, setOpen] = useState(false)
  useFrame((_, dt) => {
    const target = hov || open ? 1.02 + index * 0.02 : 1
    const s = ref.current.scale.x + (target - ref.current.scale.x) * Math.min(dt * 6, 1)
    ref.current.scale.setScalar(s)
  })
  const geo = useMemo(() => {
    const g = new THREE.TorusGeometry(arc.r, 0.014, 6, 140, Math.PI * 0.9)
    return g
  }, [arc.r])
  const projectFromData = getProject(index)
  return (
    <group rotation={[0, 0, index * 1.5]}>
      <mesh
        ref={ref}
        geometry={geo}
        rotation={[0, 0, 0]}
        position={[0, arc.y, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHov(true); emitHover(true) }}
        onPointerOut={() => { setHov(false); setOpen(false); emitHover(false) }}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
      >
        <meshBasicMaterial color={arc.color} transparent opacity={hov || open ? 1 : 0.6} toneMapped={false} />
      </mesh>
      {projectFromData && (
        <Html
          position={[Math.cos(0.2) * arc.r, arc.y + 0.14, Math.sin(0.2) * arc.r]}
          center
          distanceFactor={10}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`ring-label ${hov || open ? 'hot' : ''}`} style={{ '--c': arc.color }}>
            {projectFromData.name}
          </div>
        </Html>
      )}
      {projectFromData && open && (
        <Html position={[0, arc.y + 0.35, 0]} center distanceFactor={8} style={{ pointerEvents: 'auto' }}>
          <div className="ring-callout" style={{ '--c': arc.color }}>
            <b>{projectFromData.name}</b>
            <p>{projectFromData.description.slice(0, 120)}…</p>
            <div className="ring-links">
              {projectFromData.live && <a href={projectFromData.live} target="_blank" rel="noreferrer">Live ↗</a>}
              <a href={projectFromData.repo} target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

/* import-once accessor so ProjectArc can read real data without prop drilling */
import { projects as STORY_PROJECTS } from '../data'
const getProject = (i) => STORY_PROJECTS[i] || null

/* ── rocket on an interplanetary highway ────── */
function StoryRocket({ hov }) {
  const map = useFamilyModel('/models/spaceship.glb')
  const fly = useRef()
  const inner = useRef()
  const engine = useRef()
  const ahead = useMemo(() => new THREE.Vector3(), [])
  const path = useMemo(() => {
    const pts = [
      new THREE.Vector3(2.5, 1.8, 8),
      new THREE.Vector3(-2.2, 1.4, 2),
      new THREE.Vector3(-3.4, 1.2, -4),   // near Earth
      new THREE.Vector3(1.6, 2.4, -10),
      new THREE.Vector3(4.2, 1.6, -18),   // scoot past Mars
      new THREE.Vector3(-1.8, 2.6, -26),
      new THREE.Vector3(-2.4, 1.8, -36),  // sweep by Saturn
      new THREE.Vector3(2.2, 2.2, -46),
      new THREE.Vector3(4.4, 1.2, -58),   // wave at Jupiter
      new THREE.Vector3(-0.4, 2.4, -68),
      new THREE.Vector3(-3.6, 1.4, -78),  // Neptune flyby
      new THREE.Vector3(1.2, 2.0, -88),
      new THREE.Vector3(3.6, 1.3, -96),   // arrive at Station
    ]
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.42)
  }, [])

  useFrame(({ clock }, dt) => {
    const span = 0.8 + warp.boost * 2.2
    const u = (clock.elapsedTime * 0.008 * span) % 1
    fly.current.position.copy(path.getPointAt(u))
    path.getPointAt(Math.min(u + 0.008, 1), ahead)
    fly.current.lookAt(ahead)
    engine.current.intensity = 5 + Math.sin(clock.elapsedTime * 38) * 1.6 + warp.boost * 24
    const hs = inner.current.scale.x + ((hov ? 1.18 : 1) - inner.current.scale.x) * Math.min(dt * 6, 1)
    inner.current.scale.setScalar(hs)
  })

  return (
    <Trail width={2.2} length={4.2} color="#22d3ee" attenuation={(w) => w * w}>
      <group ref={fly}>
        <group ref={inner}>
          <FittedModel map={map} names={['Spaceship_RaeTheRedPanda']} radius={0.5} />
          <mesh position={[0, 0, -0.52]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color="#22d3ee" toneMapped={false} />
          </mesh>
          <pointLight ref={engine} position={[0, 0, -0.62]} color="#22d3ee" intensity={5} distance={2.2} />
        </group>
      </group>
    </Trail>
  )
}

function RocketHotspot() {
  const [hov, setHov] = useState(false)
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); setHov(true); emitHover(true) }}
      onPointerOut={() => { setHov(false); emitHover(false) }}
      onPointerDown={(e) => { e.stopPropagation(); warp.boost = 1 }}
    >
      <StoryRocket hov={hov} />
    </group>
  )
}

/* ── speed streaks, local to the camera ─────── */
function HyperDrive({ color, opacity = 0.5 }) {
  const ref = useRef()
  const { camera } = useThree()
  const count = 180
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const streaks = useMemo(
    () => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 9,
      z: (Math.random() - 0.5) * 12,
      v: 6 + Math.random() * 10,
      len: 0.5 + Math.random() * 1.7,
    })),
    [],
  )
  useFrame((_, dt) => {
    ref.current.position.copy(camera.position)
    streaks.forEach((s, i) => {
      s.z -= s.v * dt * (1 + warp.boost * 6)
      if (s.z < -6) { s.z = 6 }
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

/* ── chapter plaques (HTML anchored in 3D) ──── */
function Plate({ pos, num, title, sub }) {
  return (
    <Html position={pos} center distanceFactor={13} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
      <div className="planet-plate">
        <span className="pp-num">{num}</span>
        <b>{title}</b>
        {sub && <i>{sub}</i>}
      </div>
    </Html>
  )
}

/* ── quaternius cameos ──────────────────────── */
function EarthCameos() {
  const mapA = useFamilyModel('/models/astronaut_barbarathebee.glb')
  const mapR = useFamilyModel('/models/rock.glb')
  return (
    <>
      <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.6}>
        <group position={[-2.9, 2.15, 1.2]} scale={0.75}>
          <FittedModel map={mapA} names={['BarbaraTheBee', 'Pistol']} radius={1.05} yaw={0.35} />
        </group>
      </Float>
      <Float speed={1.2} rotationIntensity={1.2} floatIntensity={1.2}>
        <group position={[-6.6, -1.4, 2.4]}>
          <FittedModel map={mapR} names={['Rock_2']} radius={0.5} />
          <FittedModel map={mapR} names={['Rock_3']} radius={0.3} />
        </group>
      </Float>
    </>
  )
}

function MarsRover() {
  const map = useFamilyModel('/models/rover.glb')
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1}>
      <group position={[3.4, -0.75, -14.2]} scale={0.9}>
        <FittedModel
          map={map}
          names={['Rover_2_1', 'Wheel_1_2', 'Wheel_2_2', 'Wheel_3_2', 'Wheel_4_2']}
          radius={1.05}
          yaw={-0.6}
        />
      </group>
    </Float>
  )
}

function ContactStation({ pos }) {
  const mapB = useFamilyModel('/models/base.glb')
  const mapC = useFamilyModel('/models/connector.glb')
  const mapP = useFamilyModel('/models/solarpanel.glb')
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.12
  })
  return (
    <group ref={ref} position={pos}>
      <FittedModel map={mapB} names={['Base_Large']} radius={1.35} />
      <group position={[1.7, 0, 0]}><FittedModel map={mapC} names={['Connector']} radius={0.75} roll={Math.PI / 2} /></group>
      <group position={[-1.7, 0, 0]}><FittedModel map={mapC} names={['Connector']} radius={0.75} roll={Math.PI / 2} /></group>
      <group position={[3.3, 0, 0]}><FittedModel map={mapP} names={['SolarPanel_Structure']} radius={0.9} /></group>
      <group position={[-3.3, 0, 0]}><FittedModel map={mapP} names={['SolarPanel_Structure']} radius={0.9} /></group>
    </group>
  )
}

/* collectible crystals (same events as before) */
const CRYSTALS = [
  { pos: [-2.4, -1.9, 2.2], pick: 'Pickup_Sphere', color: '#22d3ee', key: 'sphere' },
  { pos: [-7.2, 0.4, 1.2], pick: 'Pickup_Jar', color: '#34d399', key: 'jar' },
  { pos: [3.4, 2.3, -19.4], pick: 'Pickup_Thunder', color: '#a855f7', key: 'thunder' },
  { pos: [-2.6, 2.2, -30.4], pick: 'Pickup_KeyCard', color: '#facc15', key: 'keycard' },
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
    ref.current.position.set(cfg.pos[0], cfg.pos[1] + Math.sin(s.now * 1.3 + index) * 0.25, cfg.pos[2])
    ref.current.rotation.y += dt * 1.4
  })
  const click = (e) => {
    e.stopPropagation()
    st.current.collected = true
    st.current.until = st.current.now + 6.5
    warp.boost = Math.max(warp.boost, 0.45)
    window.dispatchEvent(new CustomEvent('akj-crystal', { detail: cfg.key }))
  }
  return (
    <group
      ref={ref}
      onClick={click}
      onPointerOver={(e) => { e.stopPropagation(); setHov(true); emitHover(true) }}
      onPointerOut={() => { setHov(false); emitHover(false) }}
    >
      <FittedModel map={map} names={[cfg.pick]} radius={0.28} emissive={cfg.color} emissiveIntensity={1.4} />
      <Sparkles count={8} scale={1} size={1.6} speed={0.5} color={cfg.color} opacity={0.8} />
    </group>
  )
}

/* milky way backdrop + distant sun */
function Backdrop() {
  const stars = loadTex('/textures/2k_stars_milky_way.jpg')
  const sun = loadTex('/textures/2k_sun.jpg')
  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[140, 32, 32]} />
        <meshBasicMaterial map={stars} opacity={0.35} transparent depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[0, 8, -150]}>
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshBasicMaterial map={sun} toneMapped={false} fog={false} />
      </mesh>
      <pointLight position={[0, 8, -148]} intensity={520} distance={220} decay={1.6} color="#ffd9a0" />
    </>
  )
}

/* ── full story canvas ──────────────────────── */
export default function SolarStory() {
  return (
    <div className="story-canvas">
      <Canvas
        camera={{ position: [0, 0.5, 11], fov: 55, near: 0.1, far: 400 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <fog attach="fog" args={['#04040c', 14, 60]} />
        <ambientLight intensity={0.45} />
        <hemisphereLight color="#9db8ff" groundColor="#3b2d6b" intensity={0.4} />
        <directionalLight position={[3, 4, 6]} intensity={2.1} />

        <Suspense fallback={null}>
          {/* local reflection environment (no network) — makes GLB metals + planets catch light */}
          <Environment frames={1} resolution={256}>
            <Lightformer intensity={2.4} position={[0, 6, 8]} scale={[14, 4, 1]} color="#9fd8ff" />
            <Lightformer intensity={1.6} position={[-8, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#37e0ff" />
            <Lightformer intensity={1.8} position={[8, 3, 0]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#a855f7" />
            <Lightformer intensity={1.1} position={[0, -8, 2]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} color="#6d4bd8" />
            <Lightformer intensity={2.2} position={[0, 3, -10]} scale={[8, 8, 1]} color="#ffffff" />
          </Environment>
          <Backdrop />
          <Stars radius={90} depth={40} count={2600} factor={3.6} saturation={0} fade speed={0.4} />

          {/* CH·01 Earth — origin */}
          <Planet url="/textures/2k_earth_daymap.jpg" pos={[-4.6, 0.3, 0]} radius={1.6} atmo="#4d9fff" />
          <Moon center={[-4.6, 0.3, 0]} />
          <Plate pos={[-4.6, 3.05, 0]} num="CH·01" title="THE HOME PLANET" sub="Kolkata · B.Tech IT · TMSL" />
          <EarthCameos />

          {/* CH·02 Mars — the arsenal */}
          <Planet url="/textures/2k_mars.jpg" pos={[5.0, 0.9, -16]} radius={1.35} spin={0.07} atmo="#ff7a55" />
          <Plate pos={[5.0, 2.75, -16]} num="CH·02" title="THE ARSENAL" sub="SQL · PostgreSQL · Node/Express · Java" />
          <MarsRover />

          {/* CH·03 Saturn — rings are projects */}
          <Saturn pos={[-5.4, 0.5, -34]} />
          <Plate pos={[-5.4, 3.35, -34]} num="CH·03" title="MISSION DECK" sub="every ring = a shipped project" />

          {/* CH·04 Jupiter — storm glory */}
          <Planet url="/textures/2k_jupiter.jpg" pos={[5.6, -0.4, -56]} radius={2.0} spin={0.06} atmo="#ffc98a" />
          <Plate pos={[5.6, 2.55, -56]} num="CH·04" title="STORM GLORY" sub="IIT Madras × FedEx Top 15 · India Innovates finalist" />

          {/* CH·05 Neptune — the log */}
          <Planet url="/textures/2k_neptune.jpg" pos={[-4.9, 0.7, -76]} radius={1.35} spin={0.055} atmo="#5f9cff" />
          <Plate pos={[-4.9, 2.85, -76]} num="CH·05" title="THE LOG" sub="2023 → 2027" />

          {/* FINAL Station — mission control */}
          <ContactStation pos={[4.8, 0.35, -94]} />
          <Plate pos={[4.8, 2.6, -94]} num="FINAL" title="MISSION CONTROL" sub="open a transmission" />

          {/* the traveler */}
          <RocketHotspot />

          {/* collectibles */}
          {CRYSTALS.map((cfg, i) => (
            <Crystal key={cfg.key} cfg={cfg} index={i} />
          ))}

          <HyperDrive color="#7dd3fc" />
          <HyperDrive color="#c084fc" opacity={0.3} />
        </Suspense>

        <Rig />

        <EffectComposer>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.25} luminanceSmoothing={0.35} radius={0.7} />
          <Vignette eskil={false} offset={0.22} darkness={0.52} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

preloadFamilies(['/models/spaceship.glb', '/models/astronaut_barbarathebee.glb', '/models/rover.glb', '/models/rock.glb', '/models/pickup.glb', '/models/base.glb', '/models/connector.glb', '/models/solarpanel.glb'])
