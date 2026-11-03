# Ankit Kumar Jha — Portfolio 🚀

A dark-futuristic, neon-glass portfolio with an **interactive 3D space scene** — a real textured rocket flying a ringed Quaternius planet, collectible crystals, hyperdrive warp-streaks, bloom post-processing, a draggable 3D Model Lab, and custom cursor UX.

Built with **React + Three.js (React Three Fiber)** and **Framer Motion**.

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Deploy (free)

- **Vercel / Netlify** — import the repo, framework auto-detected, done.
- **GitHub Pages** — set `base: '/<repo-name>/'` in `vite.config.js`, then `npm run build` and publish `dist/`.

## Interactive highlights

| Feature | Interaction |
|---|---|
| 3D rocket (GLB) | Flies a loop toward the ringed planet — **hover to enlarge, click for warp boost** |
| Planet | Real low-poly GLB + procedural Saturn rings + orbiting dust |
| Asteroid belt | 11 tumbling GLB rocks orbiting the planet |
| Collectible crystals | **Hover to glow, click to collect** (counter chip in hero!) |
| Hyperdrive streaks | 400 instanced light trails — **warp on rocket click or double-click** |
| Full scene | **Drag to orbit, scroll to zoom** (desktop), gentle auto-rotate |
| 3D Model Lab | Switch between Rocket / Wing Ship / Astronaut / Rover / Planet — drag, zoom, wireframe toggle |
| Post-processing | Bloom glow on all emissive elements |

## 3D models

All GLB models are from [Quaternius](https://quaternius.com)' *Ultimate Space Kit* (CC0 — free for commercial use, no attribution required) in `public/models/`.

## Model inspection scripts

`scripts/inspect-models.mjs` & `scripts/centers.mjs` parse the GLBs under Node to report mesh names, bounding boxes and orientation — handy if you tweak which models are displayed.

## Edit your content

All text, links, projects, skills, achievements and journey entries live in **one file**:

```
src/data.js
```

Design tokens (colors, fonts, spacing) live at the top of `src/index.css` in `:root`.

## Tech

React 19 · Vite · Three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing · Framer Motion
