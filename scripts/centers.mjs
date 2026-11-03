import fs from 'node:fs'
import path from 'node:path'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import * as THREE from 'three'

globalThis.self = globalThis
globalThis.window = globalThis
globalThis.document = { createElementNS: () => ({}), createElement: () => ({ style: {} }) }

const loader = new GLTFLoader()
loader.setMeshoptDecoder(MeshoptDecoder)
const load = (buf) =>
  new Promise((res) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', res, (e) => console.log('ERR', e.message)))

const dir = 'public/models'
for (const f of ['rover.glb', 'astronaut_barbarathebee.glb', 'pickup.glb']) {
  const gltf = await load(fs.readFileSync(path.join(dir, f)))
  gltf.scene.updateMatrixWorld(true)
  console.log(`\n### ${f}`)
  gltf.scene.traverse((o) => {
    if (!o.isMesh || o.name.includes('lod')) return
    const box = new THREE.Box3().setFromObject(o)
    const c = box.getCenter(new THREE.Vector3())
    console.log(`  ${o.name}  center=(${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)})`)
  })
}
