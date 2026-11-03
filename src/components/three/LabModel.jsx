import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles } from '@react-three/drei'
import { useRef } from 'react'
import { useFamilyModel, FittedModel } from './kit'

const IS_TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function LabModel({ tab, wire = false }) {
  const map = useFamilyModel(tab.url)
  return (
    <group>
      <FittedModel
        map={map}
        names={tab.names}
        radius={tab.radius}
        yaw={tab.yaw}
        pitch={tab.pitch}
        wireframe={wire}
      />
    </group>
  )
}

export function LabLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight color="#67e8f9" groundColor="#a855f7" intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={2.2} />
      <pointLight position={[-5, -2, -5]} intensity={40} color="#a855f7" />
      <pointLight position={[6, 3, 2]} intensity={28} color="#22d3ee" />
    </>
  )
}

export function LabDust() {
  return (
    <>
      <Sparkles count={50} scale={[9, 6, 5]} size={2.2} speed={0.3} color="#8be9ff" opacity={0.5} />
      <Sparkles count={24} scale={[7, 5, 4]} size={3.2} speed={0.18} color="#c084fc" opacity={0.4} />
    </>
  )
}

export function LabControls({ autoRotate }) {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableZoom={!IS_TOUCH}
      enableRotate={!IS_TOUCH}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.7}
      autoRotate={autoRotate && !IS_TOUCH}
      autoRotateSpeed={1.1}
      minDistance={2.4}
      maxDistance={8}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.85}
    />
  )
}

/* slow bobbing idle motion for the displayed model */
export function IdleBob({ children, y = 0.06, r = 0.02 }) {
  const ref = useRef(null)
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.y = Math.sin(t * 1.1) * y
    ref.current.rotation.y += dt * r
  })
  return <group ref={ref}>{children}</group>
}
