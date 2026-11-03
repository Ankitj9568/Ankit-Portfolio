// Inspect Quaternius GLB kits: mesh names, world bboxes, and "forward" axis
// (forward = vector from thicker end to thinner end along the longest axis)
import fs from 'node:fs'
import path from 'node:path'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import * as THREE from 'three'

const dir = 'public/models'
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.glb'))

// minimal browser polyfills so GLTFLoader runs under Node
globalThis.self = globalThis
globalThis.window = globalThis
globalThis.document = { createElementNS: () => ({}), createElement: () => ({ style: {} }) }

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)
const load = (buf) =>
  new Promise((res, rej) =>
    loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, rej),
  )

for (const f of files) {
  const buf = fs.readFileSync(path.join(dir, f))
  let gltf
  try {
    gltf = await load(buf)
  } catch (e) {
    console.log(`\n### ${f} — PARSE FAILED: ${e.message}`)
    continue
  }
  console.log(`\n### ${f}`)
  gltf.scene.updateMatrixWorld(true)
  const out = new THREE.Vector3()
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return
    const bbox = new THREE.Box3().setFromObject(o)
    const size = bbox.getSize(new THREE.Vector3())
    const pos = o.geometry.attributes.position
    const mat = Array.isArray(o.material) ? o.material[0] : o.material
    // forward heuristic along longest axis
    const axes = ['x', 'y', 'z']
    let L = 'z'
    let span = -1
    axes.forEach((a) => {
      const s = size[a]
      if (s > span) { span = s; L = a }
    })
    const perp = axes.filter((a) => a !== L)
    // vertex-weighted centroid per half along L
    let t0 = 0, t1 = 0, w0 = 0, w1 = 0, n0 = 0, n1 = 0
    const A = new THREE.Vector3()
    const arr = pos.array
    for (let i = 0; i < pos.count; i++) {
      A.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)
      const c = A[L] - (bbox.isEmpty ? 0 : bbox.min[L] + size[L] / 2)
      const r = Math.hypot(A[perp[0]], A[perp[1]])
      if (c <= 0) { t0 += r; w0 += 1; n0 = Math.max(n0, Math.abs(A[perp[0]]), Math.abs(A[perp[1]])) }
      else { t1 += r; w1 += 1; n1 = Math.max(n1, Math.abs(A[perp[0]]), Math.abs(A[perp[1]])) }
    }
    const b0 = t0 / Math.max(w0, 1), b1 = t1 / Math.max(w1, 1)
    const head = b1 < b0 ? 1 : -1 // sign along L pointing at thinner (nose) half
    out.setColorAt
    console.log(
      `  ${o.name || '(unnamed)'} | meshes=${gltf.scene.children.length} | size ${size.x.toFixed(2)},${size.y.toFixed(2)},${size.z.toFixed(2)} | tris=${(o.geometry.index ? o.geometry.index.count : pos.count) / 3} | forward~${head === 1 ? '+' : '-'}${L} | matColor=${mat?.color ? mat.color.getHexString() : 'vertex'}`,
    )
  })
}
console.log('\ndone')
