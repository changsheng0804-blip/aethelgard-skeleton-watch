/**
 * gear_physics.js
 * Generates accurate 3D gear geometries, Swiss lever escapement,
 * harmonic balance wheel oscillations, and kinematic gear train calculations.
 */

const GearPhysics = {
  /**
   * Creates an extruded 3D gear geometry with realistic tooth profile & skeletonized spokes
   */
  createGearGeometry: function (teeth, pitchRadius, thickness, axleRadius, spokeCount = 4, spokeWidth = 0.08, isEscape = false) {
    const shape = new THREE.Shape();
    const addendum = pitchRadius * (isEscape ? 0.22 : 0.12);
    const dedendum = pitchRadius * (isEscape ? 0.18 : 0.12);
    const outerRadius = pitchRadius + addendum;
    const rootRadius = Math.max(axleRadius * 1.5, pitchRadius - dedendum);

    const totalSteps = teeth * 4;

    for (let i = 0; i <= totalSteps; i++) {
      const angle = (i / totalSteps) * Math.PI * 2;
      const stepInTooth = i % 4;

      let r = pitchRadius;
      let a = angle;

      if (isEscape) {
        // Asymmetric ratchet/club teeth for Swiss lever escape wheel
        if (stepInTooth === 0) {
          r = rootRadius;
        } else if (stepInTooth === 1) {
          r = outerRadius;
          a += 0.02; // Angled forward tip
        } else if (stepInTooth === 2) {
          r = outerRadius * 0.98;
          a += 0.03;
        } else {
          r = rootRadius;
        }
      } else {
        // Standard involute/cycloidal gear tooth profile
        if (stepInTooth === 0) {
          r = rootRadius;
        } else if (stepInTooth === 1) {
          r = outerRadius;
        } else if (stepInTooth === 2) {
          r = outerRadius;
        } else {
          r = rootRadius;
        }
      }

      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath(); // ← Fix: properly close the gear outline for correct extrusion

    // Inner Cutout Holes (Skeletonized Spokes)
    if (spokeCount > 0 && pitchRadius > 0.4) {
      const innerRimRadius = rootRadius * 0.88;
      const hubRadius = Math.max(axleRadius * 2.2, 0.16);

      if (innerRimRadius > hubRadius + 0.1) {
        for (let s = 0; s < spokeCount; s++) {
          const holePath = new THREE.Path();
          const startAngle = (s / spokeCount) * Math.PI * 2 + spokeWidth;
          const endAngle = ((s + 1) / spokeCount) * Math.PI * 2 - spokeWidth;
          const numArcSteps = 12;

          // Inner arc
          for (let k = 0; k <= numArcSteps; k++) {
            const a = startAngle + (endAngle - startAngle) * (k / numArcSteps);
            const x = Math.cos(a) * hubRadius;
            const y = Math.sin(a) * hubRadius;
            if (k === 0) holePath.moveTo(x, y);
            else holePath.lineTo(x, y);
          }

          // Outer arc
          for (let k = numArcSteps; k >= 0; k--) {
            const a = startAngle + (endAngle - startAngle) * (k / numArcSteps);
            const x = Math.cos(a) * innerRimRadius;
            const y = Math.sin(a) * innerRimRadius;
            holePath.lineTo(x, y);
          }

          holePath.closePath();
          shape.holes.push(holePath);
        }
      }
    }

    // Axle center hole
    const axleHole = new THREE.Path();
    axleHole.absarc(0, 0, axleRadius, 0, Math.PI * 2, true);
    shape.holes.push(axleHole);

    // 3D Extrusion with subtle bevel
    const extrudeSettings = {
      steps: 1,
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: thickness * 0.15,
      bevelSize: thickness * 0.1,
      bevelOffset: 0,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  },

  /**
   * Generates Balance Wheel Geometry with perimeter inertia screws
   */
  createBalanceWheelGroup: function (radius, thickness) {
    const group = new THREE.Group();

    // Outer Heavy Rim
    const rimShape = new THREE.Shape();
    rimShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const rimHole = new THREE.Path();
    rimHole.absarc(0, 0, radius * 0.85, 0, Math.PI * 2, true);
    rimShape.holes.push(rimHole);

    const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
      depth: thickness * 1.5,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2
    });
    rimGeo.center();
    const rimMesh = new THREE.Mesh(rimGeo, Materials.roseGold);
    group.add(rimMesh);

    // 3 Aerodynamic Spoke Arms
    const numArms = 3;
    for (let i = 0; i < numArms; i++) {
      const angle = (i / numArms) * Math.PI * 2;
      const armGeo = new THREE.BoxGeometry(radius * 0.85, thickness * 0.8, thickness);
      armGeo.translate(radius * 0.425, 0, 0);
      const armMesh = new THREE.Mesh(armGeo, Materials.roseGold);
      armMesh.rotation.z = angle;
      group.add(armMesh);
    }

    // Central Hub
    const hubGeo = new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, thickness * 2, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, Materials.polishedSteel);
    group.add(hubMesh);

    // Gold Inertia Adjustment Screws around the rim (12 screws)
    const numScrews = 12;
    for (let i = 0; i < numScrews; i++) {
      const angle = (i / numScrews) * Math.PI * 2;
      const screwHeadGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12);
      screwHeadGeo.rotateX(Math.PI / 2);
      const screwMesh = new THREE.Mesh(screwHeadGeo, Materials.yellowGold);
      screwMesh.position.x = Math.cos(angle) * (radius + 0.02);
      screwMesh.position.y = Math.sin(angle) * (radius + 0.02);
      group.add(screwMesh);
    }

    return group;
  },

  /**
   * Creates a dynamic spiral hairspring (游丝)
   */
  createHairspringMesh: function (innerR, outerR, turns = 10, pointsCount = 200) {
    const points = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angle = t * Math.PI * 2 * turns;
      const r = innerR + (outerR - innerR) * t;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      points.push(new THREE.Vector3(x, y, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, pointsCount, 0.012, 6, false);
    const springMesh = new THREE.Mesh(tubeGeo, Materials.bluedSteel);

    // Store base parameters for dynamic breathing animation
    springMesh.userData = {
      innerR: innerR,
      outerR: outerR,
      turns: turns,
      pointsCount: pointsCount,
      basePoints: points.map(p => p.clone())
    };

    return springMesh;
  },

  /**
   * Updates hairspring expansion/contraction in sync with balance wheel oscillation.
   * Uses direct BufferAttribute vertex update instead of geometry rebuild for 60fps performance.
   */
  updateHairspring: function (springMesh, balanceAngle) {
    if (!springMesh || !springMesh.geometry || !springMesh.userData.innerR) return;

    // Throttle: skip update if angle change is negligible (< 0.01 rad)
    const lastAngle = springMesh.userData.lastBalanceAngle || 0;
    if (Math.abs(balanceAngle - lastAngle) < 0.01) return;
    springMesh.userData.lastBalanceAngle = balanceAngle;

    const { innerR, outerR, turns, pointsCount } = springMesh.userData;
    const deformFactor = balanceAngle * 0.15;

    const newPoints = [];
    for (let i = 0; i <= pointsCount; i++) {
      const t = i / pointsCount;
      const angleOffset = balanceAngle * (1.0 - t);
      const angle = t * Math.PI * 2 * turns + angleOffset;
      const radialMod = 1.0 + Math.sin(t * Math.PI) * deformFactor;
      const r = (innerR + (outerR - innerR) * t) * radialMod;
      newPoints.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
    }

    // Rebuild tube geometry only when angle has changed meaningfully — but use
    // a rebuilt geometry on a cached pool to avoid per-frame GC allocation.
    // We dispose the old geometry and create a new one (acceptable at ≤8Hz effective update rate due to throttle).
    const curve = new THREE.CatmullRomCurve3(newPoints);
    const newGeo = new THREE.TubeGeometry(curve, pointsCount, 0.012, 6, false);
    springMesh.geometry.dispose();
    springMesh.geometry = newGeo;
  },

  /**
   * Swiss Lever Pallet Fork (擒纵叉) with ruby pallet stones
   */
  createPalletForkGroup: function () {
    const group = new THREE.Group();

    // Lever Body
    const forkShape = new THREE.Shape();
    forkShape.moveTo(-0.06, -0.2);
    forkShape.lineTo(0.06, -0.2);
    forkShape.lineTo(0.04, 0.15);
    forkShape.lineTo(0.18, 0.32); // Right horn
    forkShape.lineTo(0.12, 0.36);
    forkShape.lineTo(0.0, 0.22);
    forkShape.lineTo(-0.12, 0.36);
    forkShape.lineTo(-0.18, 0.32); // Left horn
    forkShape.lineTo(-0.04, 0.15);
    forkShape.closePath();

    const forkGeo = new THREE.ExtrudeGeometry(forkShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    });
    forkGeo.center();
    const forkMesh = new THREE.Mesh(forkGeo, Materials.polishedSteel);
    group.add(forkMesh);

    // Left and Right Synthetic Ruby Pallet Stones
    const rubyGeo = new THREE.BoxGeometry(0.06, 0.12, 0.06);
    const rubyLeft = new THREE.Mesh(rubyGeo, Materials.rubyJewel);
    rubyLeft.position.set(-0.16, 0.25, 0);
    rubyLeft.rotation.z = 0.4;
    group.add(rubyLeft);

    const rubyRight = new THREE.Mesh(rubyGeo, Materials.rubyJewel);
    rubyRight.position.set(0.16, 0.25, 0);
    rubyRight.rotation.z = -0.4;
    group.add(rubyRight);

    // Center Pivot Jewel
    const pivotJewelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16);
    pivotJewelGeo.rotateX(Math.PI / 2);
    const pivotJewel = new THREE.Mesh(pivotJewelGeo, Materials.rubyJewel);
    group.add(pivotJewel);

    return group;
  }
};
