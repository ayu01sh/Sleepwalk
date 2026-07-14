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
Spawn near Earth → Explore the Solar System → Track Deep Space Probes → Approach for Info → Engage Warp Travel
```

---

## Features

| Module | What it does |
|--------|-------------|
| **Zero-Gravity Physics** | Experience smooth, momentum-based, 360-degree floating physics with your astronaut avatar. |
| **The Solar System Museum** | Tour all 8 fully-textured major planets in accurately sequenced orbits from the glowing Sun. |
| **Dynamic Audio Engine** | Synthesized Web Audio API soundscapes featuring muffled standard thrusters and intense warp-drive acoustic feedback. |
| **Mobile Responsiveness** | Seamlessly explore on touch-screens using a custom virtual joystick, swipe-to-look camera panning, and touch action buttons. |
| **Diegetic UI** | Facts about planets and celestial bodies appear seamlessly within the 3D world as you approach them. |
| **Radar Minimap** | A circular HUD minimap that tracks the relative positions of planets and spacecraft around you in real-time. |
| **Deep Space Gallery** | Traverse a volumetric procedural nebula to discover massive monoliths displaying real-time imagery from the NASA APOD API. |
| **Warp Travel & Zoom** | Hold `Shift` (or Warp button) to traverse massive distances, and use the scroll wheel to zoom the camera dynamically. |
| **Gargantua Black Hole** | A massive, photorealistic black hole using custom raymarched shaders to simulate gravitational lensing and a glowing accretion disk. |
| **ISRO Spacecraft** | A fully 3D procedurally modeled Indian Space Research Organisation (ISRO) deep-space probe featuring interactive waypoint tracking and official decals. |
| **Pulsar Anomaly** | A terrifyingly fast-spinning neutron star with procedural radiation beams and synchronized audio. |
| **Supernova Remnant** | A colossal volumetric gas cloud generated using custom shaders and additive blending particles. |
| **Dynamic Loading Screen** | A smooth, interpolated loading screen and controls overlay built natively within the 3D rendering loop. |
| **Cinematic Rendering** | Built with custom GLSL shaders, physically-based materials, Unreal Bloom, and cinematic camera tracking. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (SPA)                        │
│  React 18 · Vite · Zustand · React Three Fiber          │
│                                                         │
│  src/                                                   │
│  ├── components/  (3D Models, Planets, ISROSpaceship)  │
│  ├── ui/          (MobileControls, Info Panels)         │
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
| **Navigation HUD** | 3D Arrow | N/A |
| **Radar Tracking** | Minimap HUD | Minimap HUD |

---



## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

*Note: The 3D astronaut model and planet textures belong to their respective creators under Creative Commons.*
