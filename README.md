# Ankit Kumar Jha — Portfolio 🚀

A dark-futuristic, neon-glass portfolio built as a **scrollytelling solar-system journey** — scroll to fly through space planet-by-planet: Earth is your origin, Mars the tech arsenal, **Saturn's glowing rings are the projects** (hover a ring for its story, click for links), Jupiter the hackathon glory, Neptune the mission log, and a floating station ends the trip at Mission Control.

Featuring photoreal NASA-based planet textures, real GLB spacecraft/rover/astronaut/station models, atmosphere rim-glow, warp-drive speed streaks, collectible crystals, a dedicated 3D Model Lab, and custom cursor UX.

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
| The Story | **Scroll = travel**: camera hops planet to planet as you pass each chapter |
| Saturn's rings | Each glowing orbit arc = one project — **hover to highlight, click for description + Live/GitHub links** |
| 3D rocket (GLB) | Flies an interplanetary highway through all chapters — **hover to enlarge, click for warp boost** |
| Realistic planets | Earth (day map + real cloud layer + orbiting Moon), Mars, Saturn, Jupiter, Neptune — photoreal texture maps + fresnel **atmosphere rims** |
| Chapter plaques | HTML labels anchored in 3D above each planet, gated to chapter proximity |
| Ship cameos | Quaternius ships only: a wing-ship parked at Earth, a second one patrolling Mars, both at the finale |
| Finale | Rotating neon **warp-gate beacon** with the fleet at final approach |
| Collectible crystals | **Hover to glow, click to collect** (counter chip in hero!) |
| Hyperdrive streaks | Instanced light trails that follow the camera — **warp on rocket click** |
| 3D Model Lab | Switch between Rocket / Wing Ship / Astronaut / Rover / Planet — drag, zoom, wireframe toggle |
| Post-processing | Bloom glow + vignette grading |

## 3D models

All GLB models are from [Quaternius](https://quaternius.com)' *Ultimate Space Kit* (CC0 — free for commercial use, no attribution required) in `public/models/`.

## Planet textures

Planetary texture maps in `public/textures/` are from [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0) — Earth, Mars, Jupiter, Saturn + ring alpha, Neptune, Moon, Sun and the Milky Way backdrop. Modified: none.

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
