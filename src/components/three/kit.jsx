import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Turns a Quaternius "family" GLB (one material, many named nodes)
 * into a Map of { name → mesh }, skipping *lod1 variants etc.
 * Returns a stable map (cached by useGLTF + useMemo).
 */
export function useFamilyModel(url) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const map = new Map()
    scene.traverse((o) => {
      if (o.isMesh && !o.name.includes('lod')) map.set(o.name, o)
    })
    return map
  }, [scene])
}

/**
 * buildSubset(map, ['Rover_2_1', 'Wheel_1_2', ...]) →
 * a THREE.Group of clones that keeps the authored transforms,
 * so family assemblies (rover body + wheels) stay aligned.
 */
export function buildSubset(map, names) {
  const g = new THREE.Group()
  names.forEach((n) => {
    const m = map.get(n)
    if (m) g.add(m.clone(true))
  })
  return g
}

/** stable subset clone per (map, names) */
export function useSubset(map, names) {
  const key = names.join('|')
  return useMemo(() => buildSubset(map, names), [map, key])
}

/**
 * <FittedModel> — displays a subset scaled so its bounding sphere ≈ `radius`,
 * centered at origin, rotated (yaw/pitch/roll around Y/X/Z), with optional
 * wireframe / emissive overrides on cloned materials (never mutates the source).
 */
export function FittedModel({
  map,
  names,
  radius = 1,
  yaw = 0,
  pitch = 0,
  roll = 0,
  wireframe = false,
  emissive = null,
  emissiveIntensity = 0,
  children,
}) {
  const object = useSubset(map, names)

  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const c = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    return { scale: radius / maxDim, center: c }
  }, [object, radius])

  // clone materials ONCE per instance so any tweak stays local
  useEffect(() => {
    object.traverse((o) => {
      if (!o.isMesh) return
      if (Array.isArray(o.material)) o.material = o.material.map((m) => m.clone())
      else o.material = o.material.clone()
    })
  }, [object])

  useEffect(() => {
    object.traverse((o) => {
      if (!o.isMesh) return
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => {
        if (m.wireframe !== wireframe) m.wireframe = wireframe
        if (emissive) {
          m.emissive.set(emissive)
          m.emissiveIntensity = emissiveIntensity
        }
      })
    })
  }, [object, wireframe, emissive, emissiveIntensity])

  return (
    <group>
      <group scale={fit.scale}>
        <group rotation={[pitch, yaw, roll]}>
          <group position={[-fit.center.x, -fit.center.y, -fit.center.z]}>
            <primitive object={object} />
          </group>
        </group>
      </group>
      {children}
    </group>
  )
}

/** all real model names of a family, minus LOD variants */
export const modelNames = (map) => Array.from(map.keys())

export const preloadFamilies = (urls) => urls.forEach((u) => useGLTF.preload(u))
