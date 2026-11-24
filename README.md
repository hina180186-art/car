# VALKYRIE GT-R — Ultra-Luxury Automotive Scrollytelling Experience
### Aurelia Bespoke Automobili (Sant'Agata Atelier)

An ultra-luxury, high-adrenaline single-page scrollytelling web experience for the bespoke twin-turbo flat-plane V8 supercar **VALKYRIE GT-R**.

---

## ⚡ Engineering & Architecture Highlights

1. **Dual-Folder Frame Detection & Sequencer Engine**:
   - Analyzes local frame directories `./frames 1/` (0s–10s, 300 frames) and `./frames 2/` (10s–20s, 300 frames).
   - Encodes folder paths (`./frames%201/` and `./frames%202/`) ensuring seamless compatibility locally and on Vercel.
   - Automatically merges 600 sequential Full HD (1920×1080) frames with natural numerical sorting.
   - High-speed parallel preloader with concurrent batch workers, sleek `#030303` void styling, and metallic amber-gold (`#F59E0B`) progress meter (0%–100%).

2. **120fps Cinema Canvas Engine**:
   - DevicePixelRatio-scaled `<canvas>` utilizing `object-fit: cover` math to ensure the carbon supercar remains razor-sharp and centered across all screen ratios.
   - Studio Freight **Lenis** (`lerp: 0.07, duration: 1.3`) coupled with **GSAP ScrollTrigger** and a 120fps `requestAnimationFrame` lerp loop (`currentFrame += (targetFrame - currentFrame) * 0.12`) for butter-smooth scrubbing.
   - Continuous 1100vh scroll container (`#scroll-container`) with sticky stage (`#sticky-stage`) with zero breaking overflow ancestors.

3. **Strict Anti-Overlap Margin Architecture**:
   - Left Margin Cards: `left: 2.5vw; max-width: 290px; padding: 14px 16px;`
   - Right Margin Cards: `right: 2.5vw; max-width: 265px; padding: 14px 16px;`
   - **Guaranteed Center Clearance**: Over 58% of the viewport remains 100% unobstructed for the vehicle, smoke plumes, apex drift, airborne crest jump, and wet asphalt reflections.

4. **Persistent Luxury HUD & Telemetry**:
   - **Top Navigation Bar**: Minimalist fixed header with "VALKYRIE GT-R" wordmark and Aurelia crest, smooth-scroll chapter links (`01 HOME`, `02 ABOUT`, `03 PERFORMANCE`, `04 TRACK`, `05 RESERVE`), Web Audio V8 engine acoustics toggle, and amber-bordered "ALLOCATION" button.
   - **Live Telemetry Strip**: Monospace readout updating live with scroll progress:
     - `BOOST`: 0.8 to 2.4 BAR with dynamic animated amber gauge
     - `OUTPUT`: 1,180 HP
     - `GEAR`: 1 through 7
     - `SPEED`: 0 to 372 KM/H
     - `G-FORCE`: Dynamic lateral and vertical load (2.1G drift, 0.0G airborne crest)
     - `FRAME`: Live counter (`FRAME 001 / 600` to `FRAME 600 / 600`)

5. **5 Choreographed Cinematic Beats**:
   - **01 HOME (0%–18%)**: Front amber LED headlights, heat shimmer, "FORGED IN FIRE."
   - **02 ABOUT (20%–38%)**: White tire smoke, aero streaks, 1,240 kg dry weight, 0.27 Cd drag.
   - **03 PERFORMANCE (40%–60%)**: High-speed apex drift, 2.4 bar twin-turbos, 2.2s 0–100 km/h, 2.1G lateral grip.
   - **04 TRACK (62%–80%)**: 4-wheel airborne crest jump, twin blue-and-gold exhaust flames, 920 kg downforce, 980°C exhaust temp.
   - **05 RESERVE (82%–100%)**: Wet asphalt landing, golden rear hero stance, 40 numbered chassis reserve button ($420,000).

6. **Post-Scroll Concierge & Interactive Modal**:
   - Below 1100vh scroll stage: sleek `#050505` luxury concierge footer with private client allocation inquiry form.
   - Interactive build slot selector (#01 to #40 with VIP reservation validation).
   - Interactive Spec Modal with complete technical dossiers.
   - Synthesized Web Audio API Flat-Plane Twin-Turbo V8 engine sound simulator.

---

## 🚀 Running the Experience Locally

```bash
# Start the local server
npm start
# Or
node server.js
```
Open [http://localhost:3333](http://localhost:3333) in your browser.
