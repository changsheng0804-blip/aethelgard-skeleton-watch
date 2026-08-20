/**
 * app.js
 * Main entry point for the 3D Skeleton Mechanical Watch Showcase.
 * Handles rendering, camera transitions, kinematics loop, and UI events.
 */

window.addEventListener('DOMContentLoaded', () => {
  // 1. Scene & Engine Setup
  const container = document.getElementById('canvas-container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08090b);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.8, 9.8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 2. Orbit Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2.5;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't go deep under floor
  controls.target.set(0, 0, 0);

  // 3. Environment & Materials
  const studioEnvMap = Textures.createStudioEnvMap(renderer);
  scene.environment = studioEnvMap;
  Materials.init();

  // 4. Studio Lighting
  Lighting.init(scene);

  // 5. Watch & Podium Scene Graph
  const turntableGroup = new THREE.Group();
  scene.add(turntableGroup);

  const watchModel = WatchModel.create();
  // Set watch in an upright, slightly angled showcase posture
  watchModel.position.set(0, 0, 0);
  turntableGroup.add(watchModel);

  const podium = WatchModel.createPodium();
  turntableGroup.add(podium);

  // 6. Application State
  const state = {
    autoRotate: true,
    rotationSpeed: 0.003,
    speedFactor: 1.0,
    isExploded: false,
    explodeProgress: 0.0,
    targetExplodeProgress: 0.0,
    simTime: 0,
    baseAngularSpeed: 0.8, // Rad/s base gear speed
    isAudioOn: false,
    lastAudioBeat: 0,
    activeCameraPreset: 'overview',
    cameraLerp: {
      active: false,
      startPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      startLookAt: new THREE.Vector3(),
      targetLookAt: new THREE.Vector3(),
      progress: 0
    }
  };

  // Camera Presets
  const cameraPresets = {
    overview: {
      pos: new THREE.Vector3(0, 1.8, 9.8),
      target: new THREE.Vector3(0, 0, 0)
    },
    macro: {
      pos: new THREE.Vector3(0.5, -0.4, 3.6),
      target: new THREE.Vector3(0.4, -0.3, 0)
    },
    crown: {
      pos: new THREE.Vector3(4.6, 0.4, 4.2),
      target: new THREE.Vector3(1.8, 0, 0)
    },
    caseback: {
      pos: new THREE.Vector3(0, 1.2, -9.2),
      target: new THREE.Vector3(0, 0, 0)
    }
  };

  function switchCameraPreset(presetName) {
    if (!cameraPresets[presetName]) return;
    state.activeCameraPreset = presetName;

    state.cameraLerp.active = true;
    state.cameraLerp.progress = 0;
    state.cameraLerp.startPos.copy(camera.position);
    state.cameraLerp.targetPos.copy(cameraPresets[presetName].pos);
    state.cameraLerp.startLookAt.copy(controls.target);
    state.cameraLerp.targetLookAt.copy(cameraPresets[presetName].target);

    // Update UI active buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cam === presetName);
    });
  }

  // 7. Time & Kinematics Animation Loop
  const clock = new THREE.Clock();
  const animatedParts = watchModel.userData.animatedParts;

  // Real-time HUD Clock variables & DOM cache
  const cachedLiveTimeEl = document.getElementById('live-time-val');
  const baseTotalSeconds = 10 * 3600 + 10 * 60 + 30; // Start at 10:10:30 (Classic luxury watch display time)
  let totalSimSeconds = 0;

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const effectiveDelta = delta * state.speedFactor;
    state.simTime += effectiveDelta;

    // --- A. Smooth Camera Preset Interpolation ---
    if (state.cameraLerp.active) {
      state.cameraLerp.progress += delta * 2.2;
      const t = Math.min(1.0, state.cameraLerp.progress);
      // Smooth cubic ease out
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(state.cameraLerp.startPos, state.cameraLerp.targetPos, ease);
      controls.target.lerpVectors(state.cameraLerp.startLookAt, state.cameraLerp.targetLookAt, ease);

      if (t >= 1.0) {
        state.cameraLerp.active = false;
      }
    }

    controls.update();

    // --- B. Turntable Slow Cinematic Showcase Rotation ---
    if (state.autoRotate) {
      const rotFactor = state.cameraLerp.active ? 0.3 : 1.0;
      turntableGroup.rotation.y += state.rotationSpeed * (state.speedFactor > 0 ? 1 : 0) * rotFactor;
    }

    // --- C. Smooth Exploded View Layer Animation ---
    if (Math.abs(state.explodeProgress - state.targetExplodeProgress) > 0.001) {
      state.explodeProgress += (state.targetExplodeProgress - state.explodeProgress) * 0.08;
      WatchModel.setExplodeProgress(watchModel, state.explodeProgress);

      // Hide stand and strap when exploding to keep the dissected movement view pure and clean
      const isHiding = state.explodeProgress > 0.15;
      if (watchModel.userData.groups.strap) {
        watchModel.userData.groups.strap.visible = !isHiding;
      }
      if (podium) {
        podium.visible = !isHiding;
      }
    }

    // --- D. Kinematic Gear Train Animation (Adjacent gears strictly reverse directions) ---
    const omega0 = state.baseAngularSpeed * state.simTime;

    if (animatedParts.gear1_barrel) {
      // Gear 1 (Mainspring Barrel, Z1=36): Rotates clockwise
      animatedParts.gear1_barrel.rotation.z = omega0;
    }

    if (animatedParts.gear2_center) {
      // Gear 2 (Center Wheel, Z2=24): Meshes with Gear 1 -> Rotates counter-clockwise (-1.5 * omega0)
      animatedParts.gear2_center.rotation.z = -omega0 * (36 / 24);
    }

    if (animatedParts.gear3_third) {
      // Gear 3 (Third Wheel, Z3=20): Meshes with Gear 2 -> Rotates clockwise (+1.8 * omega0)
      animatedParts.gear3_third.rotation.z = omega0 * (36 / 24) * (24 / 20);
    }

    if (animatedParts.gear4_fourth) {
      // Gear 4 (Fourth Wheel / Seconds Pinion, Z4=16): Meshes with Gear 3 -> Rotates counter-clockwise (-2.25 * omega0)
      animatedParts.gear4_fourth.rotation.z = -omega0 * (36 / 24) * (24 / 20) * (20 / 16);
    }

    if (animatedParts.gear5_escape) {
      // Gear 5 (Swiss Lever Escape Wheel, Z5=15): Meshes with Gear 4 -> Rotates clockwise (+2.4 * omega0)
      animatedParts.gear5_escape.rotation.z = omega0 * (36 / 24) * (24 / 20) * (20 / 16) * (16 / 15);
    }

    if (animatedParts.gear6_winding) {
      // Gear 6 (Winding Intermediate Wheel, Z6=18): Meshes with Gear 1 -> Rotates counter-clockwise (-2.0 * omega0)
      animatedParts.gear6_winding.rotation.z = -omega0 * (36 / 18);
    }

    // --- E. Oscillating Automatic Rotor (21K 镂空透底摆陀运动) ---
    if (animatedParts.rotor) {
      animatedParts.rotor.rotation.z = Math.sin(state.simTime * 0.9) * 1.8 + Math.cos(state.simTime * 0.4) * 0.5;
    }

    // --- F. Balance Wheel Harmonic Oscillation & Dynamic Hairspring ---
    const balanceFreq = 4.0; // 4 Hz (28,800 vph standard high-beat)
    const balanceAmp = 2.4;  // ~138 degrees peak swing amplitude
    const currentBalanceAngle = balanceAmp * Math.sin(Math.PI * 2 * balanceFreq * state.simTime);

    if (animatedParts.balanceWheel) {
      animatedParts.balanceWheel.rotation.z = currentBalanceAngle;
    }

    if (animatedParts.hairspring) {
      GearPhysics.updateHairspring(animatedParts.hairspring, currentBalanceAngle);
    }

    // Pallet Fork ticks synchronously at peaks of balance wheel oscillation
    if (animatedParts.palletFork) {
      const palletAngle = 0.16 * Math.sign(Math.cos(Math.PI * 2 * balanceFreq * state.simTime));
      animatedParts.palletFork.rotation.z = palletAngle;
    }

    // --- G. Audio Tick Generation on Escapement Beat ---
    const beatInterval = 1.0 / (balanceFreq * 2); // 8 beats per second
    if (state.simTime - state.lastAudioBeat >= beatInterval) {
      state.lastAudioBeat = state.simTime;
      WatchAudio.playTick();
    }

    // --- G. Smooth Sweeping Hands System ---
    // Smooth mechanical sweep for second hand (1 full turn every 60 sim seconds scaled)
    const secSweepSpeed = (Math.PI * 2) / 60 * 2.0; // Scaled for elegant aesthetic movement
    const totalSecAngle = -state.simTime * secSweepSpeed;

    if (animatedParts.secondHand) {
      animatedParts.secondHand.rotation.z = totalSecAngle;
    }
    if (animatedParts.minuteHand) {
      animatedParts.minuteHand.rotation.z = totalSecAngle / 60;
    }
    if (animatedParts.hourHand) {
      animatedParts.hourHand.rotation.z = totalSecAngle / 720;
    }

    // Update Digital HUD readout smoothly with cached DOM element
    totalSimSeconds += effectiveDelta * 2.0;
    const curTotalSec = Math.floor(baseTotalSeconds + totalSimSeconds);
    const curSec = curTotalSec % 60;
    const curMin = Math.floor(curTotalSec / 60) % 60;
    const curHour = Math.floor(curTotalSec / 3600) % 24;

    if (cachedLiveTimeEl) {
      const hh = String(curHour).padStart(2, '0');
      const mm = String(curMin).padStart(2, '0');
      const ss = String(curSec).padStart(2, '0');
      cachedLiveTimeEl.textContent = `${hh}:${mm}:${ss}`;
    }

    renderer.render(scene, camera);
  }

  // 8. Bind UI Controls & Event Listeners
  // Camera buttons
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchCameraPreset(btn.dataset.cam);
    });
  });

  // Turntable Auto-Rotate toggle
  const autoRotateBtn = document.getElementById('btn-rotate');
  if (autoRotateBtn) {
    autoRotateBtn.addEventListener('click', () => {
      state.autoRotate = !state.autoRotate;
      autoRotateBtn.classList.toggle('active', state.autoRotate);
    });
  }

  // Audio Synth toggle
  const audioBtn = document.getElementById('btn-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      state.isAudioOn = WatchAudio.toggle();
      audioBtn.classList.toggle('active', state.isAudioOn);
    });
  }

  // Exploded View Button
  const explodeBtn = document.getElementById('btn-explode');
  if (explodeBtn) {
    explodeBtn.addEventListener('click', () => {
      state.isExploded = !state.isExploded;
      state.targetExplodeProgress = state.isExploded ? 1.0 : 0.0;
      explodeBtn.classList.toggle('active', state.isExploded);
      explodeBtn.innerHTML = state.isExploded
        ? `<span>✨ 合并视图</span>`
        : `<span>💥 爆炸分解</span>`;
    });
  }

  // Speed Slider
  const speedSlider = document.getElementById('speed-slider');
  const speedValLabel = document.getElementById('speed-val-label');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      state.speedFactor = parseFloat(e.target.value);
      if (speedValLabel) {
        speedValLabel.textContent = `${state.speedFactor.toFixed(2)}x`;
      }
    });
  }

  // Material Theme Switcher
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Materials.applyTheme(btn.dataset.theme);
    });
  });

  // Lighting Preset Switcher
  document.querySelectorAll('.light-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.light-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Lighting.setPreset(btn.dataset.light);
    });
  });

  // Fullscreen button
  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Remove Loader when ready
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 800);
    }
  }, 400);

  // Start Animation Loop
  animate();
});
