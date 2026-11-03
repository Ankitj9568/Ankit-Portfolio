import { Canvas } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'

/* Lightweight fixed background: neon sparkle dust + deep stars,
   visible behind every section. */
export default function Starfield() {
  return (
    <div className="starfield-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 6] }}
      >
        <Stars radius={34} depth={22} count={900} factor={2.6} saturation={0} fade speed={0.3} />
        <Sparkles count={90} scale={[22, 14, 5]} size={2.4} speed={0.22} color="#8be9ff" opacity={0.5} />
        <Sparkles count={55} scale={[18, 12, 4]} size={3.6} speed={0.13} color="#c084fc" opacity={0.4} />
      </Canvas>
    </div>
  )
}
