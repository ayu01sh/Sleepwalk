<p align="center">
  <h1 align="center">Sleepwalk</h1>
  <p align="center">
    A quiet, cinematic 3D space museum built for the browser.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Three.js-0.160-000000?logo=three.js&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Zustand-4.4-443E38?logo=react&logoColor=white" alt="Zustand">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </a>
</p>

---

## What is Sleepwalk?

Sleepwalk is a browser-based, contemplative 3D space experience. You control an astronaut floating through a hand-crafted cosmic environment — touring a museum-like scale of the Solar System, drifting past nebulae, and discovering real space imagery. 

Instead of an intense game or overwhelming simulation, it's a **space museum you inhabit**. Drift, explore, and learn about the cosmos at your own pace.

**The core experience:**

```
Spawn near Earth → Explore the Solar System → Approach Planets for Info → Engage Warp Travel → Drift
```

---

## Features

| Module | What it does |
|--------|-------------|
| **Zero-Gravity Physics** | Experience smooth, momentum-based, 360-degree floating physics with your astronaut avatar. |
| **The Solar System Museum** | Tour all 8 fully-textured major planets in accurately sequenced orbits from the glowing Sun. |
| **Dynamic Audio Engine** | Synthesized Web Audio API soundscapes featuring muffled standard thrusters and intense warp-drive acoustic feedback. |
| **Mobile Responsiveness** | Seamlessly explore on touch-screens using a custom virtual joystick, swipe-to-look camera panning, and touch action buttons. |
| **Diegetic UI** | Facts about planets and celestial bodies appear seamlessly within the 3D world as you approach them using Three.js HTML. |
| **Warp Travel & Zoom** | Hold `Shift` (or Warp button) to traverse massive distances, and use the scroll wheel to zoom the camera dynamically. |
| **Cinematic Rendering** | Built with custom GLSL shaders, physically-based materials, Unreal Bloom, and cinematic camera tracking. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                        │
│  React 18 · Vite · Zustand · React Three Fiber          │
│                                                         │
│  src/                                                   │
│  ├── components/  (3D Models, Planets, Sun, AudioEngine)│
│  ├── ui/          (Minimap, MobileControls, Info Panels)│
│  ├── store/       (Global state, movement tracking)     │
│  ├── hooks/       (useMovement, useProximity logic)     │
│  └── App.jsx      (Main Canvas and Scene Composition)   │
├─────────────────────────────────────────────────────────┤
│                     3D Engine                           │
│  Three.js · R3F · Drei                                  │
│                                                         │
│  Layers:                                                │
│  ├── Scene Graph    (CameraRig, Meshes, Lights)         │
│  ├── Materials      (PBR Textures, Custom GLSL Shaders) │
│  ├── Physics        (Momentum loop inside useFrame)     │
│  └── PostProcessing (EffectComposer, Bloom Pass)        │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions

- **React Three Fiber**: Bridging the declarative nature of React with the imperative Three.js API allows us to build complex 3D scenes as reusable components (`<Earth />`, `<Sun />`).
- **Zustand over Context**: Used for high-frequency state updates (like movement vectors from the mobile joystick) without triggering cascading React re-renders, crucial for 60FPS.
- **Synthesized Audio**: Using the native Web Audio API to synthesize thruster noises prevents the need to load heavy `.mp3` assets, ensuring instant playback.
- **Custom Shaders**: The Sun uses a custom fractal noise vertex/fragment shader instead of a standard texture, providing a dynamic, boiling surface that interacts beautifully with post-processing bloom.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | React 18, Vite |
| **3D Engine** | Three.js, React Three Fiber (R3F), `@react-three/drei` |
| **State Management** | Zustand |
| **Post-Processing** | `EffectComposer`, `UnrealBloomPass`, Custom Vignette Shader |
| **Audio** | Native HTML5 Web Audio API |
| **Styling** | Vanilla CSS, Glassmorphism techniques |

---

## Getting Started

### Prerequisites

- Node.js 18+

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/sleepwalk.git
cd sleepwalk

npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Sleepwalk runs at **http://localhost:5173**

---

## Controls

The game automatically adapts to desktop (Keyboard/Mouse) or mobile devices (Touch).

| Action | Desktop | Mobile Touch |
| :--- | :--- | :--- |
| **Look around** | Mouse Drag / Pointer Lock | Swipe on empty screen space |
| **Move Forward/Back** | `W` / `S` | Virtual Joystick (Left zone) |
| **Strafe Left/Right** | `A` / `D` | Virtual Joystick (Left zone) |
| **Ascend/Descend** | `Space` / `Ctrl` (or `C`) | `▲` / `▼` Action Buttons |
| **Warp Travel (Boost)** | Hold `Shift` while moving | `WARP` Action Button |
| **Camera Zoom** | Mouse Scroll Wheel | N/A |
| **Toggle Minimap** | `M` | `M` |

---

## Project Roadmap

Sleepwalk is being built in distinct cinematic phases:

- [x] **Phase 1: Foundation & The Astronaut** - Zero-g controls, chase camera, cinematic intro, Earth, and basic post-processing.
- [x] **Phase 2: The Solar System Museum** - All 8 planets correctly sequenced, custom animated Sun shader, diegetic info panels, and minimap UI.
- [x] **Phase 2.5: Immersion Update** - Real-time synthesized thruster audio engine and fully responsive touchscreen mobile controls.
- [ ] **Phase 3: The Nebula Passage & Deep Space Gallery** - Volumetric dust fields and giant floating image monoliths pulling live data from NASA's APIs (Hubble/James Webb).
- [ ] **Phase 4: The Black Hole & Final Polish** - A massive raymarched black hole with gravitational lensing and performance optimization.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

*Note: The 3D astronaut model and planet textures belong to their respective creators under Creative Commons.*
