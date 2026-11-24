/**
 * VALKYRIE GT-R — Ultra-Luxury Automotive Scrollytelling Engine
 * Aurelia Bespoke Automobili
 * Dual-Folder Frame Detection, 120fps Cinema Canvas Engine & Live Telemetry
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. DUAL-FOLDER FRAME DETECTION & PLAYLIST ORCHESTRATION
  // =========================================================================

  let allFrameUrls = [];
  const loadedImages = [];
  let isFullyLoaded = false;
  let totalFrames = 600;

  /**
   * Automatically resolve frame URLs from ./frames 1/ and ./frames 2/.
   * Encodes folder names properly (./frames%201/ and ./frames%202/) for local & Vercel deployment.
   */
  async function resolveFramePlaylist() {
    // Priority 1: Check window.VALKYRIE_FRAMES_DATA from frames-data.js
    if (window.VALKYRIE_FRAMES_DATA && Array.isArray(window.VALKYRIE_FRAMES_DATA.allFrames) && window.VALKYRIE_FRAMES_DATA.allFrames.length > 0) {
      console.log(`[Engine] Loaded ${window.VALKYRIE_FRAMES_DATA.allFrames.length} frames from embedded manifest.`);
      return window.VALKYRIE_FRAMES_DATA.allFrames;
    }

    // Priority 2: Fetch frames-manifest.json if served via HTTP/Vercel
    try {
      const response = await fetch('./frames-manifest.json');
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.allFrames) && data.allFrames.length > 0) {
          console.log(`[Engine] Loaded ${data.allFrames.length} frames from frames-manifest.json.`);
          return data.allFrames;
        }
      }
    } catch (e) {
      console.warn('[Engine] Manifest fetch failed or skipped, running dynamic folder detection...');
    }

    // Priority 3: Dynamic probe and build algorithm
    // Dual folders: ./frames 1/ (Part 1, ~300 frames) and ./frames 2/ (Part 2, ~300 frames)
    const folder1 = './frames%201';
    const folder2 = './frames%202';
    const f1 = [];
    const f2 = [];

    for (let i = 1; i <= 300; i++) {
      const padded = String(i).padStart(3, '0');
      f1.push(`${folder1}/ezgif-frame-${padded}.jpg`);
      f2.push(`${folder2}/ezgif-frame-${padded}.jpg`);
    }

    const merged = [...f1, ...f2];
    console.log(`[Engine] Dynamically assembled ${merged.length} sequential frame URLs.`);
    return merged;
  }

  // =========================================================================
  // 2. DOM ELEMENTS & STATE
  // =========================================================================

  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloaderStatus = document.getElementById('preloader-status');
  const ignitionBtn = document.getElementById('ignition-btn');

  const scrollContainer = document.getElementById('scroll-container');
  const canvas = document.getElementById('scrolly-canvas');
  const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for high-framerate opaque canvas

  // HUD & Telemetry Elements
  const telBoost = document.getElementById('tel-boost');
  const telBoostGauge = document.getElementById('tel-boost-gauge');
  const telHp = document.getElementById('tel-hp');
  const telGear = document.getElementById('tel-gear');
  const telSpeed = document.getElementById('tel-speed');
  const telGforce = document.getElementById('tel-gforce');
  const telFrame = document.getElementById('tel-frame');
  const navLinks = document.querySelectorAll('.nav-link');
  const topAllocationBtn = document.getElementById('top-allocation-btn');
  const panelReserveBtn = document.getElementById('panel-reserve-btn');

  // Story Panels (Continuous seamless chapter coverage)
  const panels = [
    { el: document.getElementById('section-home'), start: 0.0, end: 0.19 },
    { el: document.getElementById('section-about'), start: 0.19, end: 0.39 },
    { el: document.getElementById('section-perf'), start: 0.39, end: 0.61 },
    { el: document.getElementById('section-track'), start: 0.61, end: 0.81 },
    { el: document.getElementById('section-reserve'), start: 0.81, end: 1.00 }
  ];

  // Canvas & Lerp Animation State
  let targetFrame = 0;
  let currentFrame = 0;
  let scrollProgress = 0;
  let lenisInstance = null;
  let isCanvasReady = false;

  // =========================================================================
  // 3. CANVAS ENGINE & OBJECT-FIT COVER SIZING
  // =========================================================================

  let canvasWidth = 0;
  let canvasHeight = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for silky 120fps performance
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Scale context to handle devicePixelRatio
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-draw current frame immediately
    const frameIdx = Math.min(Math.max(Math.round(currentFrame), 0), totalFrames - 1);
    if (loadedImages[frameIdx] && loadedImages[frameIdx].complete) {
      renderFrame(loadedImages[frameIdx]);
    }
  }

  /**
   * Render frame using object-fit: cover math.
   * Keeps the supercar razor-sharp, centered, and proportion-perfect across all screen sizes.
   */
  function renderFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const hRatio = canvasWidth / iw;
    const vRatio = canvasHeight / ih;
    const ratio = Math.max(hRatio, vRatio);

    const drawW = iw * ratio;
    const drawH = ih * ratio;
    const shiftX = (canvasWidth - drawW) / 2;
    const shiftY = (canvasHeight - drawH) / 2;

    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, iw, ih, shiftX, shiftY, drawW, drawH);
  }

  // =========================================================================
  // 4. PARALLEL PRELOADER ENGINE
  // =========================================================================

  async function preloadAllFrames(urls) {
    totalFrames = urls.length;
    loadedImages.length = totalFrames;
    let loadedCount = 0;

    // Helper to load single image
    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = urls[index];
        img.onload = () => {
          loadedImages[index] = img;
          loadedCount++;
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          console.warn(`[Preloader] Failed to load frame: ${urls[index]}`);
          // Attempt retry or placeholder
          loadedImages[index] = loadedImages[Math.max(0, index - 1)] || img;
          loadedCount++;
          updateProgress();
          resolve();
        };
      });
    };

    function updateProgress() {
      const pct = Math.min(Math.round((loadedCount / totalFrames) * 100), 100);
      const paddedPct = String(pct).padStart(3, '0');
      
      if (preloaderCounter) {
        preloaderCounter.textContent = `${paddedPct}%`;
      }
      if (preloaderBar) {
        preloaderBar.style.width = `${pct}%`;
      }
      
      if (pct < 30) {
        preloaderStatus.textContent = 'CALIBRATING CHASSIS & SENSORS...';
      } else if (pct < 70) {
        preloaderStatus.textContent = 'SPOOLING TWIN-TURBO FLAT-PLANE V8...';
      } else if (pct < 100) {
        preloaderStatus.textContent = 'SYNCHRONIZING 600 TELEMETRY FRAMES...';
      } else {
        preloaderStatus.textContent = 'SYSTEMS ARMED // READY FOR IGNITION';
      }

      // Draw initial frame as soon as frame 0 is ready
      if (indexReady(0) && !isCanvasReady) {
        isCanvasReady = true;
        renderFrame(loadedImages[0]);
      }
    }

    function indexReady(idx) {
      return loadedImages[idx] && loadedImages[idx].complete;
    }

    // Step A: Load first 30 essential frames at ultra-high priority
    const priorityBatch = [];
    for (let i = 0; i < Math.min(30, totalFrames); i++) {
      priorityBatch.push(loadImage(i));
    }
    await Promise.all(priorityBatch);

    // Step B: Load remaining frames in high-speed parallel batches of 16
    const concurrency = 16;
    let currentIdx = 30;

    async function loadWorker() {
      while (currentIdx < totalFrames) {
        const idx = currentIdx++;
        await loadImage(idx);
      }
    }

    const workers = [];
    for (let w = 0; w < concurrency; w++) {
      workers.push(loadWorker());
    }

    // Let the user launch immediately if priority frames are ready or once 40% loads
    // Full loading continues in background seamlessly
    const checkCanStart = setInterval(() => {
      if (loadedCount >= Math.min(60, totalFrames)) {
        clearInterval(checkCanStart);
        onPreloaderReady();
      }
    }, 100);

    await Promise.all(workers);
    isFullyLoaded = true;
    onPreloaderReady();
  }

  function onPreloaderReady() {
    if (preloader.classList.contains('loaded')) return;

    if (preloaderCounter) preloaderCounter.textContent = '100%';
    if (preloaderBar) preloaderBar.style.width = '100%';
    if (preloaderStatus) preloaderStatus.textContent = 'SYSTEMS ARMED // READY FOR IGNITION';

    // Show Ignition button or auto dismiss
    if (ignitionBtn) {
      ignitionBtn.style.display = 'inline-flex';
      ignitionBtn.addEventListener('click', dismissPreloader, { once: true });
    }

    // Auto dismiss after 700ms for seamless entrance
    setTimeout(() => {
      dismissPreloader();
    }, 700);
  }

  function dismissPreloader() {
    if (preloader.classList.contains('loaded')) return;
    preloader.classList.add('loaded');
    
    // Play initial subtle HUD entrance sound if audio unmuted
    if (audioEngine.enabled) {
      audioEngine.playIgnitionRev();
    }
    
    // Ensure initial frame is rendered
    renderFrame(loadedImages[0]);
  }

  // =========================================================================
  // 5. LENIS + GSAP SCROLLTRIGGER + 120FPS LERP LOOP
  // =========================================================================

  function initSmoothScrollAndLoop() {
    // Studio Freight Lenis Smooth Scroll
    lenisInstance = new Lenis({
      lerp: 0.07,
      duration: 1.3,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenisInstance.on('scroll', (e) => {
      ScrollTrigger.update();
      updateScrollProgress(e.scroll);
    });

    // Native scroll event listener to ensure immediate synchronization under all environments
    window.addEventListener('scroll', () => {
      updateScrollProgress(window.scrollY);
    }, { passive: true });

    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 120fps Cinema Lerp Loop
    function animationLoop() {
      // Lerp current frame towards target frame
      currentFrame += (targetFrame - currentFrame) * 0.12;

      const frameToDraw = Math.min(Math.max(Math.round(currentFrame), 0), totalFrames - 1);
      const img = loadedImages[frameToDraw];

      if (img && img.complete) {
        renderFrame(img);
      } else {
        // Fallback to nearest loaded frame
        for (let offset = 1; offset < 20; offset++) {
          const prev = loadedImages[frameToDraw - offset];
          if (prev && prev.complete) {
            renderFrame(prev);
            break;
          }
          const next = loadedImages[frameToDraw + offset];
          if (next && next.complete) {
            renderFrame(next);
            break;
          }
        }
      }

      // Update audio engine dynamic pitch based on frame movement velocity
      const velocity = Math.abs(targetFrame - currentFrame);
      audioEngine.updateEngine(scrollProgress, velocity);

      requestAnimationFrame(animationLoop);
    }

    requestAnimationFrame(animationLoop);
  }

  // =========================================================================
  // 6. SCROLL PROGRESS, TELEMETRY & CHOREOGRAPHY
  // =========================================================================

  function updateScrollProgress(scrollY) {
    const containerTop = scrollContainer.offsetTop;
    const containerHeight = scrollContainer.offsetHeight;
    const viewportH = window.innerHeight;
    const maxScroll = containerHeight - viewportH;

    if (maxScroll <= 0) return;

    // Calculate clamped normalized scroll progress (0.0 to 1.0)
    const relativeY = scrollY - containerTop;
    scrollProgress = Math.max(0, Math.min(1, relativeY / maxScroll));

    // Calculate target frame across the ~600 frames
    targetFrame = scrollProgress * (totalFrames - 1);

    // Update Telemetry Bar
    updateTelemetry(scrollProgress, Math.round(targetFrame));

    // Update Choreographed Panels
    updateStoryPanels(scrollProgress);

    // Update Active Navigation Chapter
    updateNavChapter(scrollProgress);
  }

  /**
   * Live monospace telemetry calculations
   */
  function updateTelemetry(progress, frameIdx) {
    // Frame Counter (e.g. FRAME 001 / 600)
    const currentNum = String(frameIdx + 1).padStart(3, '0');
    const totalNum = String(totalFrames).padStart(3, '0');
    if (telFrame) {
      telFrame.textContent = `FRAME ${currentNum} / ${totalNum}`;
    }

    // Dynamic Boost Pressure (0.8 to 2.4 BAR)
    let boost = 0.8;
    if (progress < 0.2) {
      boost = 0.8 + (progress / 0.2) * 0.8; // 0.8 -> 1.6
    } else if (progress < 0.5) {
      boost = 1.6 + ((progress - 0.2) / 0.3) * 0.8; // 1.6 -> 2.4
    } else if (progress < 0.8) {
      boost = 2.4; // Peak boost in drift and airborne crest
    } else {
      boost = 2.4 - ((progress - 0.8) / 0.2) * 1.0; // 2.4 -> 1.4 on landing
    }
    if (telBoost) {
      telBoost.textContent = `${boost.toFixed(1)} BAR`;
    }
    if (telBoostGauge) {
      const gaugePct = Math.min(100, (boost / 2.5) * 100);
      telBoostGauge.style.width = `${gaugePct}%`;
    }

    // Dynamic Gear (1 to 7)
    let gear = 1;
    if (progress < 0.15) gear = 2;
    else if (progress < 0.32) gear = 3;
    else if (progress < 0.55) gear = 4;
    else if (progress < 0.75) gear = 5;
    else if (progress < 0.90) gear = 6;
    else gear = 7;
    if (telGear) {
      telGear.textContent = String(gear);
    }

    // Dynamic Speed (0 to 372 KM/H)
    let speed = 0;
    if (progress < 0.18) {
      speed = Math.round(progress * 450); // 0 -> ~80 km/h
    } else if (progress < 0.38) {
      speed = Math.round(80 + (progress - 0.18) * 800); // 80 -> ~240 km/h
    } else if (progress < 0.60) {
      speed = Math.round(240 + (progress - 0.38) * 350); // Drift at 240-317 km/h
    } else if (progress < 0.80) {
      speed = Math.round(317 + (progress - 0.60) * 275); // Crest jump up to 372 km/h
    } else {
      speed = Math.round(372 - (progress - 0.80) * 1200); // Decel to settled stance 132 km/h
    }
    if (telSpeed) {
      telSpeed.textContent = `${Math.max(0, speed)} KM/H`;
    }

    // Dynamic G-Force
    let gforce = 1.0;
    if (progress >= 0.40 && progress <= 0.60) {
      gforce = 2.1; // Peak drift apex grip
    } else if (progress >= 0.65 && progress <= 0.78) {
      gforce = 0.0; // Full airborne crest jump!
    } else if (progress > 0.78 && progress <= 0.85) {
      gforce = 2.4; // Asphalt compression landing
    } else {
      gforce = (1.0 + Math.sin(progress * Math.PI) * 0.4);
    }
    if (telGforce) {
      telGforce.textContent = `${gforce.toFixed(1)} G`;
    }
  }

  /**
   * Choreograph each section's entrance (x: ±35 -> 0, opacity: 0 -> 1)
   * and exit (opacity: 1 -> 0) with GSAP
   */
  function updateStoryPanels(progress) {
    panels.forEach((p, idx) => {
      const panelEl = p.el;
      if (!panelEl) return;

      const inRange = progress >= p.start && progress <= p.end;
      const leftPanel = panelEl.querySelector('.margin-panel-left');
      const rightPanel = panelEl.querySelector('.margin-panel-right');

      if (inRange) {
        if (!panelEl.classList.contains('active')) {
          panelEl.classList.add('active');

          if (leftPanel) {
            gsap.fromTo(leftPanel, 
              { x: -35, opacity: 0 }, 
              { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' }
            );
          }
          if (rightPanel) {
            gsap.fromTo(rightPanel, 
              { x: 35, opacity: 0 }, 
              { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' }
            );
          }
        }
      } else {
        if (panelEl.classList.contains('active')) {
          panelEl.classList.remove('active');

          if (leftPanel) {
            gsap.to(leftPanel, { opacity: 0, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
          }
          if (rightPanel) {
            gsap.to(rightPanel, { opacity: 0, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
          }
        }
      }
    });

    // Special fade-out for Section 1 scroll indicator
    const scrollIndicator = document.getElementById('home-scroll-indicator');
    if (scrollIndicator) {
      if (progress > 0.05) {
        scrollIndicator.style.opacity = Math.max(0, 1 - (progress - 0.05) * 15);
      } else {
        scrollIndicator.style.opacity = '1';
      }
    }
  }

  /**
   * Update active navigation chapter pill
   */
  function updateNavChapter(progress) {
    let activeChapter = 0;
    if (progress >= 0.82) activeChapter = 4;
    else if (progress >= 0.62) activeChapter = 3;
    else if (progress >= 0.40) activeChapter = 2;
    else if (progress >= 0.20) activeChapter = 1;
    else activeChapter = 0;

    navLinks.forEach((link, idx) => {
      if (idx === activeChapter) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 7. HUD NAVIGATION & SMOOTH SCROLL JUMPS
  // =========================================================================

  function initNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPct = parseFloat(link.getAttribute('data-scroll'));
        scrollToChapter(targetPct);
      });
    });

    function scrollToChapter(pct) {
      if (!lenisInstance) return;
      const containerTop = scrollContainer.offsetTop;
      const containerH = scrollContainer.offsetHeight;
      const viewportH = window.innerHeight;
      const maxScroll = containerH - viewportH;
      const dest = containerTop + (pct * maxScroll);

      lenisInstance.scrollTo(dest, { duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }

    // Allocation buttons
    const allocationForm = document.getElementById('allocation-form-section');
    const openAllocation = (e) => {
      e.preventDefault();
      openSpecModal();
    };

    if (topAllocationBtn) topAllocationBtn.addEventListener('click', openAllocation);
    if (panelReserveBtn) panelReserveBtn.addEventListener('click', openAllocation);

    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        lenisInstance.scrollTo(0, { duration: 1.2 });
      });
    }
  }

  // =========================================================================
  // 8. INTERACTIVE SPEC MODAL & ALLOCATION FORM
  // =========================================================================

  const specModal = document.getElementById('spec-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalBookBtn = document.getElementById('modal-book-btn');
  const chassisGrid = document.getElementById('chassis-grid');
  const selectedChassisInput = document.getElementById('selected-chassis-input');
  const allocationForm = document.getElementById('allocation-form');
  const formSuccessBanner = document.getElementById('form-success-banner');
  const successDetailsText = document.getElementById('success-details-text');

  function openSpecModal() {
    if (specModal) specModal.classList.add('open');
  }

  function closeSpecModal() {
    if (specModal) specModal.classList.remove('open');
  }

  function initModalsAndForm() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSpecModal);
    if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeSpecModal);

    if (specModal) {
      specModal.addEventListener('click', (e) => {
        if (e.target === specModal) closeSpecModal();
      });
    }

    if (modalBookBtn) {
      modalBookBtn.addEventListener('click', () => {
        closeSpecModal();
        const target = document.getElementById('allocation-form-section');
        if (target && lenisInstance) {
          lenisInstance.scrollTo(target, { offset: -80, duration: 1.2 });
        }
      });
    }

    // Populate Chassis numbers 01 to 40
    if (chassisGrid) {
      const takenSlots = [1, 3, 9, 14, 18, 22, 33, 38]; // Pre-allocated chassis for exclusivity
      let defaultSelected = 7;

      for (let i = 1; i <= 40; i++) {
        const chip = document.createElement('div');
        const numStr = String(i).padStart(2, '0');
        chip.className = 'chassis-chip';
        chip.textContent = `#${numStr}`;

        if (takenSlots.includes(i)) {
          chip.classList.add('taken');
          chip.title = 'Chassis build slot reserved';
        } else {
          if (i === defaultSelected) {
            chip.classList.add('selected');
            selectedChassisInput.value = numStr;
          }

          chip.addEventListener('click', () => {
            document.querySelectorAll('.chassis-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedChassisInput.value = numStr;
          });
        }

        chassisGrid.appendChild(chip);
      }
    }

    // Handle Form Submit
    if (allocationForm) {
      allocationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const clientName = document.getElementById('client-name').value;
        const chassis = selectedChassisInput.value;
        const exterior = document.getElementById('spec-exterior').value;
        const interior = document.getElementById('spec-interior').value;

        // Animate success banner
        if (formSuccessBanner && successDetailsText) {
          successDetailsText.innerHTML = `
            Allocation reference: <strong>VALKYRIE-GT-R-CHASSIS-#${chassis}-VIP</strong><br>
            Commissioned by: <strong>${escapeHTML(clientName)}</strong><br>
            Configuration: <strong>${escapeHTML(exterior)}</strong> with <strong>${escapeHTML(interior)}</strong>.<br>
            Our Private Client Director has queued your dossier for bespoke atelier verification.
          `;
          formSuccessBanner.classList.add('active');
          formSuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // =========================================================================
  // 9. WEB AUDIO V8 ENGINE ACOUSTIC SYNTHESIZER
  // =========================================================================

  class V8AudioSynthesizer {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.masterGain = null;
      this.osc1 = null;
      this.osc2 = null;
      this.subOsc = null;
      this.noiseFilter = null;
      this.filter = null;
    }

    init() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass tone shaping filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Flat-plane V8 harmonic oscillators
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Fundamental low rumble

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // Second harmonic

      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(27.5, this.ctx.currentTime); // Sub rumble

      this.osc1.connect(this.filter);
      this.osc2.connect(this.filter);
      this.subOsc.connect(this.filter);

      this.osc1.start();
      this.osc2.start();
      this.subOsc.start();
    }

    toggle() {
      if (!this.ctx) {
        this.init();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.enabled = !this.enabled;

      if (this.enabled) {
        this.masterGain.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.15);
      } else {
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
      }

      return this.enabled;
    }

    updateEngine(progress, velocity) {
      if (!this.enabled || !this.ctx) return;

      const now = this.ctx.currentTime;
      // Fundamental pitch tied to speed and scrubbing velocity
      const baseFreq = 48 + (progress * 130) + Math.min(velocity * 8, 120);
      this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.osc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.05);
      this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

      // Filter cutoff sweeps with boost and RPM
      const cutoff = 350 + (progress * 1600) + Math.min(velocity * 40, 2000);
      this.filter.frequency.setTargetAtTime(Math.min(cutoff, 5500), now, 0.08);
    }

    playIgnitionRev() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.osc1.frequency.setValueAtTime(45, now);
      this.osc1.frequency.exponentialRampToValueAtTime(180, now + 0.3);
      this.osc1.frequency.exponentialRampToValueAtTime(55, now + 0.8);
    }
  }

  const audioEngine = new V8AudioSynthesizer();

  function initAudioToggle() {
    const audioToggle = document.getElementById('audio-toggle');
    const audioText = document.getElementById('audio-text');

    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        const isPlaying = audioEngine.toggle();
        if (isPlaying) {
          audioToggle.classList.add('playing');
          if (audioText) audioText.textContent = 'SOUND [ON]';
        } else {
          audioToggle.classList.remove('playing');
          if (audioText) audioText.textContent = 'SOUND [OFF]';
        }
      });
    }
  }

  // =========================================================================
  // 10. SYSTEM BOOTSTRAP
  // =========================================================================

  async function bootstrap() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    initAudioToggle();
    initModalsAndForm();

    // Step 1: Detect frame URLs across frames 1 and frames 2
    allFrameUrls = await resolveFramePlaylist();

    // Step 2: Initialize smooth scroll & 120fps lerp loop
    initSmoothScrollAndLoop();
    initNavigation();

    // Step 3: Launch high-speed parallel preloader
    await preloadAllFrames(allFrameUrls);
  }

  // Engage on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
