import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Stars, Lightformer, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useFamilyModel, FittedModel, preloadFamilies } from '../components/three/kit'
import { stageStore, CHAPTER_CONFIGS } from '../story/stageStore'

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

/* ── atmosphere rim: fresnel halo around a planet ── */
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

/* warp drive telemetry read by DOM cockpit */
export const warpFx = { cover: 0, phase: 0, vel: 99.3, crack: 0, crackGrow: 0 }
export const travelFx = { boost: 0 }

const clamp01 = (x) => Math.min(Math.max(x, 0), 1)
const smooth01 = (x) => { x = clamp01(x); return x * x * (3 - 2 * x) }

/* ── Camera Rig ── */
function Rig() {
  const { camera } = useThree()
  const posRef = useRef(new THREE.Vector3(0, 0, 6.2))
  const tgtRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(({ clock }, dt) => {
    const st = stageStore.getState()
    const { phase, warpProgress } = st

    if (phase === 'WARPING') {
      travelFx.boost = Math.sin(warpProgress * Math.PI)
      warpFx.vel = 99.3 + travelFx.boost * 900.7

      // Whiteout flash & purple crack peak at mid-warp
      const cover = Math.sin(warpProgress * Math.PI) * 0.95
      warpFx.cover = cover
      warpFx.crack = smooth01((warpProgress - 0.35) / 0.16) * (1 - smooth01((warpProgress - 0.7) / 0.16))
      warpFx.crackGrow = smooth01((warpProgress - 0.35) / 0.35)

      // Hull shake mid-warp
      if (cover > 0.15) {
        const amp = cover * 0.09
        const tt = clock.elapsedTime
        camera.position.x = Math.sin(tt * 68) * amp
        camera.position.y = Math.cos(tt * 54) * amp * 0.7
      }
    } else {
      travelFx.boost = Math.max(0, travelFx.boost - dt * 2.5)
      warpFx.vel = 99.3 + travelFx.boost * 150
      warpFx.cover = 0
      warpFx.crack = 0
      warpFx.crackGrow = 0

      // Idle breathing
      posRef.current.set(0, Math.sin(clock.elapsedTime * 0.7) * 0.04, 6.2)
      tgtRef.current.set(0, 0, 0)
      camera.position.lerp(posRef.current, Math.min(dt * 3, 1))
      camera.lookAt(tgtRef.current)
    }

    const fov = 54 + travelFx.boost * 14
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })

  return null
}

/* ── Red Panda Spaceship: Atmospheric Landing & Surface Hops ── */
function PlanetaryLandedShip({ radius, sites }) {
  const map = useFamilyModel('/models/spaceship.glb')
  const shipRef = useRef()
  const thrusterLight = useRef()
  const beaconRef = useRef()
  const vUp = useMemo(() => new THREE.Vector3(), [])
  const vForward = useMemo(() => new THREE.Vector3(), [])
  const mRot = useMemo(() => new THREE.Matrix4(), [])

  const getSiteDir = (idx) => {
    const s = sites[idx % sites.length]
    return new THREE.Vector3(s[0], s[1], s[2]).normalize()
  }

  useFrame(({ clock }, dt) => {
    if (!shipRef.current) return
    const st = stageStore.getState()
    const { phase, site, prevSite, targetSite, hopProgress, enterProgress, warpProgress } = st

    // If in the middle of warp, hide ship while jumping through hyperspace
    if (phase === 'WARPING' && warpProgress > 0.28 && warpProgress < 0.85) {
      shipRef.current.visible = false
      return
    }
    shipRef.current.visible = true

    let normDir = new THREE.Vector3()
    let altitude = 0.14
    let bankPitch = 0
    let bankRoll = 0
    let thrusterPower = 5

    if (phase === 'ENTERING') {
      // Atmospheric entry: descends from high orbit and touches down at site 0
      const targetDir = getSiteDir(site)
      const highSky = new THREE.Vector3(targetDir.x * 1.5, targetDir.y + 1.6, targetDir.z + 2.2)
      const p = enterProgress // 0 -> 1

      // S-curve descent
      normDir.copy(highSky).lerp(targetDir, p).normalize()
      altitude = (1 - p) * 2.8 + 0.14
      thrusterPower = 8 + (1 - p) * 28 // Retro-thrusters firing hard on descent
      bankPitch = (1 - p) * 0.45 // Nose tilted slightly up for aerobraking
    } else if (phase === 'HOPPING') {
      // Sub-orbital hop arc from site A to site B
      const dirA = getSiteDir(prevSite)
      const dirB = getSiteDir(targetSite)
      normDir.copy(dirA).lerp(dirB, hopProgress).normalize()

      // High parabolic arc
      const hopHeight = Math.sin(hopProgress * Math.PI) * 0.95
      altitude += hopHeight

      // Thruster power surge & banking
      thrusterPower = 6 + Math.sin(hopProgress * Math.PI) * 26
      bankPitch = (0.5 - hopProgress) * 0.65 // Nose up on launch, nose down on descent
      bankRoll = Math.sin(hopProgress * Math.PI) * 0.4 // Bank into the turn
    } else if (phase === 'WARPING' && warpProgress <= 0.28) {
      // Initial takeoff into orbit right before warp
      const p = warpProgress / 0.28
      const currentDir = getSiteDir(site)
      normDir.copy(currentDir)
      altitude += p * 3.5
      thrusterPower = 10 + p * 35
      bankPitch = -p * 0.8 // Pull nose up towards deep space
    } else {
      // Landed & idling on the surface
      normDir.copy(getSiteDir(site))
      altitude += Math.sin(clock.elapsedTime * 2.4) * 0.015
      thrusterPower = 5 + Math.sin(clock.elapsedTime * 14) * 1.6
    }

    // Set local position relative to planet center
    shipRef.current.position.set(
      normDir.x * (radius + altitude),
      normDir.y * (radius + altitude),
      normDir.z * (radius + altitude),
    )

    // Orient landing gear to match the planet's spherical normal
    vUp.copy(normDir)
    vForward.set(0, 1, 0).cross(vUp).normalize()
    if (vForward.lengthSq() < 0.001) vForward.set(1, 0, 0).cross(vUp).normalize()
    const vRight = new THREE.Vector3().crossVectors(vUp, vForward).normalize()

    mRot.makeBasis(vRight, vUp, vForward)
    shipRef.current.quaternion.setFromRotationMatrix(mRot)
    shipRef.current.rotateZ(bankRoll)
    shipRef.current.rotateX(bankPitch)

    if (thrusterLight.current) thrusterLight.current.intensity = thrusterPower
    if (beaconRef.current) {
      beaconRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4.5) * 0.1)
    }
  })

  return (
    <group ref={shipRef}>
      {/* Red Panda Spaceship (Prominent scale radius 0.52) */}
      <FittedModel map={map} names={['Spaceship_RaeTheRedPanda']} radius={0.52} yaw={Math.PI} />

      {/* Landing Beacon Ring on planet surface */}
      <mesh ref={beaconRef} position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.26, 0.35, 32]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} toneMapped={false} />
      </mesh>

      {/* Thruster Flames */}
      <mesh position={[0, 0.02, -0.3]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
      <pointLight ref={thrusterLight} position={[0, 0.02, -0.38]} color="#38bdf8" intensity={5} distance={3.2} />
    </group>
  )
}

/* ── Isolated Planet: Only One Planet Ever Exists in the Universe at a Time ── */
function Planet({ url, pos, radius = 1.75, spin = 0.05, tilt = 0, atmo = null, clouds = null, moon = null, moonSize = 0.28, sites = [] }) {
  const bodyRef = useRef()
  const cRef = useRef()
  const moonRef = useRef()
  const texture = loadTex(url)
  const cloudTex = clouds ? loadTex(clouds) : null
  const moonTex = moon ? loadTex(moon) : null

  useFrame(({ clock }, dt) => {
    if (!bodyRef.current) return
    const st = stageStore.getState()

    // Base continuous planet rotation
    let currentSpin = spin
    if (st.phase === 'HOPPING') {
      // Counter-rotation during ship hop: the planet visibly rotates in reverse!
      currentSpin = -spin * 4.8
    }

    bodyRef.current.rotation.y += dt * currentSpin
    if (cRef.current) cRef.current.rotation.y += dt * currentSpin * 1.3

    // Companion moon orbit
    if (moonRef.current) {
      const a = clock.elapsedTime * 0.4
      moonRef.current.position.set(
        Math.cos(a) * (radius + 1.8),
        Math.sin(a * 0.8) * 0.5,
        Math.sin(a) * (radius + 1.8) * 0.6 - 0.4,
      )
      moonRef.current.rotation.y += dt * 0.1
    }
  })

  return (
    <group position={pos} rotation={[0, tilt, 0]}>
      {/* Planet Sphere */}
      <group ref={bodyRef}>
        <mesh>
          <sphereGeometry args={[radius, 56, 56]} />
          <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
        </mesh>
        {cloudTex && (
          <mesh ref={cRef}>
            <sphereGeometry args={[radius * 1.013, 48, 48]} />
            <meshStandardMaterial color="#ffffff" alphaMap={cloudTex} transparent opacity={0.85} depthWrite={false} roughness={1} />
          </mesh>
        )}

        {/* Landed Red Panda Spaceship */}
        {sites.length > 0 && <PlanetaryLandedShip radius={radius} sites={sites} />}
      </group>

      {atmo && <Atmosphere radius={radius} color={atmo} />}

      {/* Companion Moon (if present) */}
      {moonTex && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[moonSize, 32, 32]} />
          <meshStandardMaterial map={moonTex} roughness={1} />
        </mesh>
      )}
    </group>
  )
}

/* ── Saturn: Unique Ring Geometry + Project Landing Sites ── */
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

function Saturn({ pos, sites }) {
  const bodyRef = useRef()
  const titanRef = useRef()
  const ringTexture = loadTex('/textures/2k_saturn_ring_alpha.png')
  const map = loadTex('/textures/2k_saturn.jpg')
  const moonTex = loadTex('/textures/2k_moon.jpg')

  useFrame(({ clock }, dt) => {
    if (!bodyRef.current) return
    const st = stageStore.getState()
    let spin = 0.05
    if (st.phase === 'HOPPING') {
      spin = -0.22 // Counter-rotation while Red Panda ship hops between projects
    }
    bodyRef.current.rotation.y += dt * spin

    if (titanRef.current) {
      const a = clock.elapsedTime * 0.35 + 1.2
      titanRef.current.position.set(
        Math.cos(a) * 3.8,
        0.5 + Math.sin(a * 0.8) * 0.4,
        Math.sin(a) * 2.2,
      )
    }
  })

  return (
    <group position={pos} rotation={[0, -0.4, 0]}>
      {/* Body */}
      <group ref={bodyRef}>
        <mesh>
          <sphereGeometry args={[1.75, 56, 56]} />
          <meshStandardMaterial map={map} roughness={0.9} />
        </mesh>

        {/* Landed Red Panda Spaceship hopping across project landing sites */}
        <PlanetaryLandedShip radius={1.75} sites={sites} />
      </group>

      <Atmosphere radius={1.75} color="#ffe3b0" power={3.4} strength={0.8} />

      {/* Genuine alpha-mapped rings */}
      <group rotation={RING_TILT}>
        <mesh geometry={radialRingGeometry(2.1, 3.4)}>
          <meshStandardMaterial
            map={ringTexture}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
            roughness={0.85}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Titan beyond the ring plane */}
      <mesh ref={titanRef}>
        <sphereGeometry args={[0.26, 28, 28]} />
        <meshStandardMaterial map={moonTex} color="#ffb36b" roughness={1} />
      </mesh>
    </group>
  )
}

/* ── Black Hole (Singularity Station) for Chapter 6 ── */
function makeDiskTex() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 512
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, c.width, 0)
  g.addColorStop(0, 'rgba(255,248,232,1)')
  g.addColorStop(0.16, 'rgba(255,222,170,0.96)')
  g.addColorStop(0.34, 'rgba(255,142,88,0.9)')
  g.addColorStop(0.52, 'rgba(232,107,255,0.85)')
  g.addColorStop(0.72, 'rgba(120,52,200,0.62)')
  g.addColorStop(0.88, 'rgba(56,26,94,0.34)')
  g.addColorStop(1, 'rgba(30,10,56,0)')
  x.fillStyle = g
  x.fillRect(0, 0, c.width, c.height)
  for (let i = 0; i < 240; i++) {
    const yy = Math.random() * c.height
    const len = 110 + Math.random() * 320
    const x0 = Math.random() * c.width
    const slant = (yy / c.height) * 220 * (0.4 + Math.random() * 1.2)
    const bright = Math.random() < 0.36
    x.strokeStyle = bright
      ? `rgba(255,250,238,${0.05 + Math.random() * 0.13})`
      : `rgba(8,3,20,${0.1 + Math.random() * 0.22})`
    x.lineWidth = 1 + Math.random() * 3.4
    for (const off of [0, -c.height, c.height]) {
      x.beginPath()
      x.moveTo(x0, yy + off)
      x.quadraticCurveTo(x0 + len * 0.55 + slant * 0.45, yy + off + len * 0.38, x0 + len + slant, yy + off + len)
      x.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function BlackHole({ pos }) {
  const mapS = useFamilyModel('/models/spaceship.glb')
  const inner = useRef()
  const disk = useRef()
  const halo = useRef()
  const ring = useRef()
  const geoInner = useMemo(() => radialRingGeometry(1.66, 2.5, 220), [])
  const geoMid = useMemo(() => radialRingGeometry(2.1, 4.7, 220), [])
  const geoHalo = useMemo(() => radialRingGeometry(2.0, 6.6, 220), [])
  const texInner = useMemo(makeDiskTex, [])
  const texMid = useMemo(makeDiskTex, [])

  useFrame(({ clock }, dt) => {
    if (!inner.current) return
    inner.current.rotation.z += dt * 0.8
    disk.current.rotation.z -= dt * 0.32
    halo.current.rotation.z += dt * 0.12
    const p = 1 + Math.sin(clock.elapsedTime * 2.1) * 0.03
    ring.current.scale.setScalar(p)
  })

  const tilt = [-Math.PI / 2 + 0.38, 0, 0.2]
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshBasicMaterial color="#000000" toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.62, 0.09, 12, 96]} />
        <meshBasicMaterial color="#fff1ff" toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={inner} rotation={[-Math.PI / 2 + 0.3, 0, 0.12]} geometry={geoInner}>
        <meshBasicMaterial map={texInner} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={disk} rotation={tilt} geometry={geoMid}>
        <meshBasicMaterial map={texMid} transparent opacity={0.95} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <mesh ref={halo} rotation={tilt} geometry={geoHalo}>
        <meshBasicMaterial map={texMid} transparent opacity={0.3} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <pointLight intensity={300} distance={110} decay={1.5} color="#c084fc" />

      {/* Orbiting Spaceships */}
      <Float speed={1.6} rotationIntensity={0.18} floatIntensity={0.7}>
        <group position={[-3.2, 1.4, 0.8]} scale={0.5}>
          <FittedModel map={mapS} names={['Spaceship_FernandoTheFlamingo']} radius={1} yaw={-Math.PI / 2} pitch={0.1} />
        </group>
      </Float>
      <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.9}>
        <group position={[2.8, -1.4, 1.1]} scale={0.45}>
          <FittedModel map={mapS} names={['Spaceship_RaeTheRedPanda']} radius={0.5} yaw={2.2} />
        </group>
      </Float>
      <Sparkles count={26} scale={[7, 4, 3]} size={2.4} speed={0.5} color="#c084fc" opacity={0.75} />
    </group>
  )
}

/* ── HyperDrive Speed Streaks ── */
function HyperDrive({ color, opacity = 0.5 }) {
  const ref = useRef()
  const { camera } = useThree()
  const count = 220
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const streaks = useMemo(
    () => Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 9,
      z: (Math.random() - 0.5) * 12,
      v: 7 + Math.random() * 12,
      len: 0.6 + Math.random() * 2.2,
    })),
    [],
  )

  useFrame((_, dt) => {
    const drive = travelFx.boost
    const rest = 1 - smooth01((drive - 0.05) / 0.2)
    const mat = ref.current.material
    mat.opacity = opacity * (0.2 + 0.8 * (1 - rest)) + drive * 0.5

    ref.current.position.copy(camera.position)
    streaks.forEach((s, i) => {
      s.z -= s.v * dt * (0.2 + drive * 16)
      if (s.z < -6) s.z = 6
      const dim = i % 3 !== 0 ? 1 - rest * 0.95 : 1
      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.set(0.012 * dim, 0.012 * dim, s.len * (0.3 + drive * 4.2) * dim)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

/* ── Warp Breakout Shockwave ── */
const burstDir = new THREE.Vector3()
function WarpBurst() {
  const ref = useRef()
  useFrame(({ camera }) => {
    const st = stageStore.getState()
    if (st.phase === 'WARPING' && st.warpProgress > 0.65) {
      const age = (st.warpProgress - 0.65) / 0.35
      ref.current.visible = true
      camera.getWorldDirection(burstDir)
      ref.current.position.copy(camera.position).addScaledVector(burstDir, 7.5)
      ref.current.lookAt(camera.position)
      ref.current.scale.setScalar(0.5 + age * 32)
      ref.current.material.opacity = Math.max(0, 0.85 * (1 - age))
    } else {
      ref.current.visible = false
    }
  })
  return (
    <mesh ref={ref} visible={false}>
      <torusGeometry args={[1.05, 0.045, 8, 80]} />
      <meshBasicMaterial color="#eafaff" transparent toneMapped={false} />
    </mesh>
  )
}

/* ── Deep Space Stars & Prologue Sun ── */
function Backdrop() {
  const stars = loadTex('/textures/2k_stars_milky_way.jpg')
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[140, 32, 32]} />
      <meshBasicMaterial map={stars} opacity={0.35} transparent depthWrite={false} fog={false} />
    </mesh>
  )
}

function HeroSun({ pos }) {
  const texture = loadTex('/textures/2k_sun.jpg')
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[6.2, 32, 32]} />
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      </mesh>
      <pointLight intensity={320} distance={80} decay={1.5} color="#ffd9a0" />
    </group>
  )
}

/* ── Cockpit Frame HUD: Telemetry, Flash & Purple Space Fissure ── */
function CockpitFrame() {
  const flash = useRef()
  const crackRef = useRef()
  const vel = useRef()
  const targetRef = useRef()
  const statusRef = useRef()

  useEffect(() => {
    let raf
    const tick = () => {
      const st = stageStore.getState()
      if (flash.current) flash.current.style.opacity = warpFx.cover
      if (crackRef.current) {
        const g = warpFx.crackGrow
        crackRef.current.style.transform = `scale(${0.07 + Math.pow(g, 1.7) * 3.2})`
        crackRef.current.style.opacity = Math.min(1, warpFx.crack * 2.2)
      }
      if (vel.current) vel.current.textContent = warpFx.vel.toFixed(1)
      if (targetRef.current) {
        targetRef.current.textContent = `${st.chapterConfig.planetName} // ${st.chapterConfig.name}`
      }
      if (statusRef.current) {
        if (st.phase === 'WARPING') statusRef.current.textContent = 'HYPERDRIVE ACTIVE'
        else if (st.phase === 'ENTERING') statusRef.current.textContent = 'ATMOSPHERIC ENTRY'
        else if (st.phase === 'HOPPING') statusRef.current.textContent = 'SURFACE HOPPING'
        else statusRef.current.textContent = `LANDED · SITE ${st.site + 1}/${st.totalSites}`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <div className="warp-flash" ref={flash} aria-hidden="true" />
      <div className="warp-crack" ref={crackRef} aria-hidden="true">
        <svg viewBox="0 0 200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <g className="crack-glow">
            <polyline points="104,0 88,38 118,72 92,110 128,150 96,196 130,240 100,290 122,330 98,400" />
            <polyline points="92,110 60,142 46,176" />
            <polyline points="128,150 162,170 176,204" />
          </g>
          <g className="crack-core">
            <polyline points="104,0 88,38 118,72 92,110 128,150 96,196 130,240 100,290 122,330 98,400" />
            <polyline points="92,110 60,142 46,176" />
            <polyline points="128,150 162,170 176,204" />
          </g>
        </svg>
      </div>

      <div className="cockpit" aria-hidden="true">
        <i className="ck-corner tl" />
        <i className="ck-corner tr" />
        <i className="ck-corner bl" />
        <i className="ck-corner br" />
        <div className="ck-hud ck-left">
          VEL <b><span ref={vel}>99.3</span></b> <i>C</i>
        </div>
        <div className="ck-hud ck-center">
          <span ref={targetRef}>SOL // DEEP SPACE</span>
        </div>
        <div className="ck-hud ck-right">
          STATUS <b ref={statusRef}>CRUISE</b>
        </div>
      </div>
    </>
  )
}

/* ── Authored Landing Coordinates on the Front Hemisphere of the Planet ── */
const SITES_LEFT = [
  [0.85, 0.35, 1.4],   // Site 0: Front, slightly top-right
  [1.15, -0.15, 1.2],  // Site 1: Right equator
  [0.65, -0.45, 1.45], // Site 2: Lower-right
  [1.05, 0.25, 1.25],  // Site 3: Upper-right
  [0.75, 0.5, 1.3],    // Site 4: Top
]

const SITES_RIGHT = [
  [-0.85, 0.35, 1.4],  // Site 0: Front, slightly top-left
  [-1.15, -0.15, 1.2], // Site 1: Left equator
  [-0.65, -0.45, 1.45],// Site 2: Lower-left
  [-1.05, 0.25, 1.25], // Site 3: Upper-left
]

/* ── Full SolarStory 3D Canvas ── */
export default function SolarStory() {
  const [currentChapter, setCurrentChapter] = useState(stageStore.chapter)

  useEffect(() => {
    return stageStore.subscribe((st) => {
      setCurrentChapter(st.chapter)
    })
  }, [])

  // planet docks opposite the content card: card 'left' -> body right (+x), card 'right' -> body left (-x)
  const side = CHAPTER_CONFIGS[currentChapter]?.side || 'center'
  const px = side === 'left' ? 2.75 : side === 'right' ? -2.75 : 0

  return (
    <>
      <div className="story-canvas">
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 54, near: 0.1, far: 350 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.55} />
          <hemisphereLight color="#9db8ff" groundColor="#3b2d6b" intensity={0.4} />
          <directionalLight position={[4, 5, 6]} intensity={2.4} />

          <Suspense fallback={null}>
            <Environment frames={1} resolution={256}>
              <Lightformer intensity={2.4} position={[0, 6, 8]} scale={[14, 4, 1]} color="#9fd8ff" />
              <Lightformer intensity={1.6} position={[-8, 2, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#37e0ff" />
              <Lightformer intensity={1.8} position={[8, 3, 0]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#a855f7" />
              <Lightformer intensity={1.1} position={[0, -8, 2]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} color="#6d4bd8" />
              <Lightformer intensity={2.2} position={[0, 3, -10]} scale={[8, 8, 1]} color="#ffffff" />
            </Environment>

            <Backdrop />
            <Stars radius={90} depth={40} count={2800} factor={3.6} saturation={0} fade speed={0.4} />

            {/* ONLY A SINGLE PLANET (OR SUN OR BLACK HOLE) IS RENDERED AT ONCE */}
            {currentChapter === 0 && <HeroSun pos={[15, 10.5, -30]} />}

            {currentChapter === 1 && (
              <Planet
                url="/textures/2k_earth_daymap.jpg"
                clouds="/textures/2k_earth_clouds.jpg"
                pos={[px, 0.15, 0]}
                radius={1.75}
                atmo="#4d9fff"
                moon="/textures/2k_moon.jpg"
                moonSize={0.28}
                sites={SITES_LEFT}
              />
            )}

            {currentChapter === 2 && (
              <Planet
                url="/textures/2k_mars.jpg"
                pos={[px, 0.2, 0]}
                radius={1.6}
                spin={0.06}
                atmo="#ff7a55"
                moon="/textures/2k_moon.jpg"
                moonSize={0.22}
                sites={SITES_RIGHT}
              />
            )}

            {currentChapter === 3 && (
              <Saturn pos={[px, 0.2, 0]} sites={SITES_LEFT} />
            )}

            {currentChapter === 4 && (
              <Planet
                url="/textures/2k_jupiter.jpg"
                pos={[px, -0.15, 0]}
                radius={2.05}
                spin={0.05}
                atmo="#ffc98a"
                moon="/textures/2k_moon.jpg"
                moonSize={0.28}
                sites={SITES_RIGHT}
              />
            )}

            {currentChapter === 5 && (
              <Planet
                url="/textures/2k_neptune.jpg"
                pos={[px, 0.2, 0]}
                radius={1.68}
                spin={0.055}
                atmo="#5f9cff"
                moon="/textures/2k_moon.jpg"
                moonSize={0.24}
                sites={SITES_LEFT}
              />
            )}

            {currentChapter === 6 && (
              <BlackHole pos={[px, 0.2, 0]} />
            )}

            <HyperDrive color="#7dd3fc" />
            <HyperDrive color="#c084fc" opacity={0.3} />
            <WarpBurst />
          </Suspense>

          <Rig />

          <EffectComposer>
            <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.25} luminanceSmoothing={0.35} radius={0.7} />
            <Vignette eskil={false} offset={0.22} darkness={0.52} />
          </EffectComposer>
        </Canvas>
      </div>

      <CockpitFrame />
    </>
  )
}

preloadFamilies(['/models/spaceship.glb', '/models/pickup.glb'])
