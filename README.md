# Ankit Kumar Jha — Portfolio 🚀

A dark-futuristic, neon-glass portfolio with real-time 3D: a ringed planet, a rocket flying toward it, hyperdrive streaks, and a global starfield — built with **React + Three.js (React Three Fiber)** and **Framer Motion**.

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

## The 3D scene (hero)

| Element | Detail |
|---|---|
| Planet | Glowing core + wireframe shell + additive atmosphere |
| Saturn rings | Two neon torus rings + 150 instanced orbiting dust particles |
| Rocket | Primitive-built mesh flying a closed Catmull-Rom loop around the planet, with a fading neon trail |
| Hyperdrive | 400 instanced light-streaks flying across the void (two colors) |
| Parallax | Camera rig gently follows your mouse |

## Edit your content

All text, links, projects, skills and journey entries live in **one file**:

```
src/data.js
```

⚠️ Two placeholders still need your real details:
1. `profile.email` — currently `ankit.jha@example.com`
2. `about.education` — currently generic `B.Tech — Computer Science & Engineering`

Design tokens (colors, fonts, spacing) live at the top of `src/index.css` in `:root`.

## Tech

React 19 · Vite · Three.js · @react-three/fiber · @react-three/drei · Framer Motion
