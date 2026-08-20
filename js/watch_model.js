/**
 * watch_model.js
 * Comprehensive 3D Skeleton Mechanical Watch assembly.
 * Case, Sapphire Glass, Dial, 5+ Interlocking Gears, Balance Wheel, Hands, Leather Strap, Podium.
 */

const WatchModel = {
  create: function () {
    // Style: AETHELGARD haute-horlogerie display — the watch leans back 45° from the counter, with the strap resting on a rear cradle rather than passing through a central post.
    const watchRoot = new THREE.Group();
    watchRoot.name = "WatchRoot";
    // Rotate the assembled watch around its center, then lower it so the folded strap lands on the rear saddle.
    watchRoot.rotation.x = -Math.PI / 4;
    watchRoot.position.set(0, -1.5, 0.2);

    // Sub-groups for layer separation and exploded view
    const groups = {
      rearGlass: new THREE.Group(),
      caseBack: new THREE.Group(),
      basePlate: new THREE.Group(),
      strap: new THREE.Group(),
      gears: new THREE.Group(),
      bridges: new THREE.Group(),
      dial: new THREE.Group(),
      hands: new THREE.Group(),
      bezel: new THREE.Group(),
      frontGlass: new THREE.Group(),
      crown: new THREE.Group()
    };

    // Store references for animations and exploded view
    const animatedParts = {
      gear1_barrel: null,
      gear2_center: null,
      gear3_third: null,
      gear4_fourth: null,
      gear5_escape: null,
      gear6_winding: null,
      balanceWheel: null,
      hairspring: null,
      palletFork: null,
      hourHand: null,
      minuteHand: null,
      secondHand: null
    };

    // ==========================================
    // 1. CASE & BEZEL (表壳与表圈)
    // ==========================================
    const caseRadius = 2.45;
    const caseInnerRadius = 2.05;
    const caseDepth = 0.65;

    // Mid-case (Brushed Gunmetal Titanium)
    const midCaseGeo = new THREE.CylinderGeometry(caseRadius, caseRadius, caseDepth, 64, 1, true);
    const midCaseMesh = new THREE.Mesh(midCaseGeo, Materials.brushedGunmetal);
    midCaseMesh.rotation.x = Math.PI / 2;
    groups.basePlate.add(midCaseMesh);

    // Sculpted Ergonomic Lugs (4 表耳)
    const lugPositions = [
      { x: -1.35, y: 2.2, rotZ: 0.15 },
      { x: 1.35, y: 2.2, rotZ: -0.15 },
      { x: -1.35, y: -2.2, rotZ: -0.15 },
      { x: 1.35, y: -2.2, rotZ: 0.15 }
    ];

    lugPositions.forEach((pos, idx) => {
      const lugShape = new THREE.Shape();
      lugShape.moveTo(0, 0);
      lugShape.lineTo(0.32, 0.4);
      lugShape.lineTo(0.24, 1.1);
      lugShape.quadraticCurveTo(0.12, 1.25, -0.15, 1.1);
      lugShape.lineTo(-0.25, 0.2);
      lugShape.closePath();

      const lugGeo = new THREE.ExtrudeGeometry(lugShape, {
        depth: 0.35,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
      });
      lugGeo.center();

      const lugMesh = new THREE.Mesh(lugGeo, Materials.polishedSteel);
      const isTop = idx < 2;
      lugMesh.position.set(pos.x, pos.y, 0);
      lugMesh.rotation.z = (isTop ? 0 : Math.PI) + pos.rotZ;
      lugMesh.rotation.x = isTop ? -0.15 : 0.15;
      groups.basePlate.add(lugMesh);

      // Lug screw heads
      const screwGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 16);
      screwGeo.rotateZ(Math.PI / 2);
      const screwMesh = new THREE.Mesh(screwGeo, Materials.bluedSteel);
      screwMesh.position.set(pos.x + (pos.x > 0 ? 0.22 : -0.22), pos.y + (isTop ? 0.35 : -0.35), 0);
      groups.basePlate.add(screwMesh);
    });

    // Top Polished Bezel (表圈)
    const bezelShape = new THREE.Shape();
    bezelShape.absarc(0, 0, caseRadius + 0.08, 0, Math.PI * 2, false);
    const bezelHole = new THREE.Path();
    bezelHole.absarc(0, 0, caseInnerRadius, 0, Math.PI * 2, true);
    bezelShape.holes.push(bezelHole);

    const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 4
    });
    bezelGeo.center();
    const bezelMesh = new THREE.Mesh(bezelGeo, Materials.polishedSteel);
    bezelMesh.position.z = caseDepth / 2 + 0.08;
    groups.bezel.add(bezelMesh);

    // Rose Gold Inset Ring on Bezel
    const ringGeo = new THREE.TorusGeometry(caseInnerRadius + 0.06, 0.025, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, Materials.roseGold);
    ringMesh.position.z = caseDepth / 2 + 0.14;
    groups.bezel.add(ringMesh);

    // Exhibition Caseback (透底后盖)
    const caseBackShape = new THREE.Shape();
    caseBackShape.absarc(0, 0, caseRadius, 0, Math.PI * 2, false);
    const caseBackHole = new THREE.Path();
    caseBackHole.absarc(0, 0, caseInnerRadius * 0.94, 0, Math.PI * 2, true);
    caseBackShape.holes.push(caseBackHole);

    const caseBackGeo = new THREE.ExtrudeGeometry(caseBackShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3
    });
    caseBackGeo.center();
    const caseBackMesh = new THREE.Mesh(caseBackGeo, Materials.polishedSteel);
    caseBackMesh.position.z = -caseDepth / 2 - 0.06;
    groups.caseBack.add(caseBackMesh);

    // Caseback Engraving Screws (6 screws)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const screwGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16);
      screwGeo.rotateX(Math.PI / 2);
      const screwMesh = new THREE.Mesh(screwGeo, Materials.bluedSteel);
      screwMesh.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, -caseDepth / 2 - 0.1);
      groups.caseBack.add(screwMesh);
    }

    // Rear Ultra-Clear Sapphire Glass (100% 透明透底蓝宝石表背)
    const rearGlassGeo = new THREE.CylinderGeometry(caseInnerRadius * 0.96, caseInnerRadius * 0.96, 0.03, 56);
    rearGlassGeo.rotateX(Math.PI / 2);
    const rearGlassMesh = new THREE.Mesh(rearGlassGeo, Materials.sapphireCrystal);
    rearGlassMesh.position.z = -caseDepth / 2 - 0.08;
    groups.rearGlass.add(rearGlassMesh);

    // --- SKELETONIZED 21K GOLD OSCILLATING ROTOR (透底镂空自动摆陀) ---
    const rotorGroup = new THREE.Group();
    
    // Semicircular heavy tungsten perimeter segment
    const rotorShape = new THREE.Shape();
    rotorShape.absarc(0, 0, caseInnerRadius * 0.88, 0, Math.PI, false);
    rotorShape.lineTo(-caseInnerRadius * 0.45, 0);
    rotorShape.absarc(0, 0, caseInnerRadius * 0.45, Math.PI, 0, true);
    rotorShape.closePath();

    // Cutout skeleton weight windows
    for (let w = 0; w < 3; w++) {
      const wPath = new THREE.Path();
      const a1 = 0.25 + w * 0.9;
      const a2 = a1 + 0.65;
      const r1 = caseInnerRadius * 0.52;
      const r2 = caseInnerRadius * 0.80;
      wPath.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      wPath.lineTo(Math.cos(a1) * r2, Math.sin(a1) * r2);
      wPath.absarc(0, 0, r2, a1, a2, false);
      wPath.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
      wPath.absarc(0, 0, r1, a2, a1, true);
      wPath.closePath();
      rotorShape.holes.push(wPath);
    }

    const rotorGeo = new THREE.ExtrudeGeometry(rotorShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    });
    rotorGeo.center();
    const rotorMesh = new THREE.Mesh(rotorGeo, Materials.roseGold);
    rotorGroup.add(rotorMesh);

    // Central Ball-Bearing Hub for Rotor
    const rotorHubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.06, 24);
    rotorHubGeo.rotateX(Math.PI / 2);
    const rotorHubMesh = new THREE.Mesh(rotorHubGeo, Materials.polishedSteel);
    rotorGroup.add(rotorHubMesh);

    // Center Ruby Pivot for Rotor
    const rotorRubyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 16);
    rotorRubyGeo.rotateX(Math.PI / 2);
    const rotorRuby = new THREE.Mesh(rotorRubyGeo, Materials.rubyJewel);
    rotorRuby.position.z = -0.01;
    rotorGroup.add(rotorRuby);

    rotorGroup.position.set(0, 0, -caseDepth / 2 + 0.04);
    groups.basePlate.add(rotorGroup);
    animatedParts.rotor = rotorGroup;

    // ==========================================
    // 2. SAPPHIRE CRYSTAL (双曲面防刮蓝宝石表镜)
    // ==========================================
    // Correctly-sized double-dome sapphire disc sitting inside the bezel
    // Use a flat cylinder clipped by a low-dome sphere section, not a full hemisphere
    const crystalDiscGeo = new THREE.CylinderGeometry(caseInnerRadius * 0.99, caseInnerRadius * 0.99, 0.06, 56);
    crystalDiscGeo.rotateX(Math.PI / 2);
    const crystalDiscMesh = new THREE.Mesh(crystalDiscGeo, Materials.sapphireCrystal);
    crystalDiscMesh.position.z = caseDepth / 2 + 0.02;
    groups.frontGlass.add(crystalDiscMesh);

    // Very subtle convex dome top surface (double-dome effect)
    const domeRadius = caseInnerRadius;
    const crystalDomeGeo = new THREE.SphereGeometry(domeRadius * 8.0, 48, 16, 0, Math.PI * 2, 0, 0.124);
    const crystalDomeMesh = new THREE.Mesh(crystalDomeGeo, Materials.sapphireCrystal);
    // Position the spherical cap so its flat side lines up with the disc top face
    crystalDomeMesh.position.z = caseDepth / 2 + 0.08 - domeRadius * 8.0;
    crystalDomeMesh.rotation.x = Math.PI; // flip so dome faces forward

    // ==========================================
    // 3. FLUTED CROWN (3点钟防滑精雕表冠)
    // ==========================================
    const crownKnurlGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 32);
    crownKnurlGeo.rotateZ(Math.PI / 2);
    const crownKnurlMesh = new THREE.Mesh(crownKnurlGeo, Materials.polishedSteel);

    const crownGoldRingGeo = new THREE.TorusGeometry(0.38, 0.03, 16, 32);
    crownGoldRingGeo.rotateY(Math.PI / 2);
    const crownGoldRingMesh = new THREE.Mesh(crownGoldRingGeo, Materials.roseGold);
    crownGoldRingMesh.position.x = 0.06;

    const crownCapGeo = new THREE.SphereGeometry(0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    crownCapGeo.rotateZ(-Math.PI / 2);
    const crownCapMesh = new THREE.Mesh(crownCapGeo, Materials.roseGold);
    crownCapMesh.position.x = 0.17;

    const crownStemGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.3, 16);
    crownStemGeo.rotateZ(Math.PI / 2);
    const crownStemMesh = new THREE.Mesh(crownStemGeo, Materials.polishedSteel);
    crownStemMesh.position.x = -0.2;

    groups.crown.add(crownKnurlMesh);
    groups.crown.add(crownGoldRingMesh);
    groups.crown.add(crownCapMesh);
    groups.crown.add(crownStemMesh);
    groups.crown.position.set(caseRadius + 0.24, 0, 0);

    // ==========================================
    // 4. DIAL & CHAPTER RING (刻度环与立体时标)
    // ==========================================
    const dialPlateGeo = new THREE.RingGeometry(caseInnerRadius * 0.72, caseInnerRadius + 0.02, 64);
    const dialPlateMesh = new THREE.Mesh(dialPlateGeo, Materials.dialChapterRing);
    dialPlateMesh.position.z = 0.18;
    groups.dial.add(dialPlateMesh);

    // 3D Faceted Rose Gold Hour Batons (12点位双时标立体刻度)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const isTwelve = i === 0;

      const createBaton = (offsetAngle = 0) => {
        const batonShape = new THREE.Shape();
        batonShape.moveTo(-0.035, -0.16);
        batonShape.lineTo(0.035, -0.16);
        batonShape.lineTo(0.045, 0.16);
        batonShape.lineTo(0.0, 0.22); // Triangular diamond tip
        batonShape.lineTo(-0.045, 0.16);
        batonShape.closePath();

        const batonGeo = new THREE.ExtrudeGeometry(batonShape, {
          depth: 0.06,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: 2
        });
        batonGeo.center();

        const batonMesh = new THREE.Mesh(batonGeo, Materials.roseGold);
        const r = caseInnerRadius * 0.88;
        const curA = angle + offsetAngle;
        batonMesh.position.set(Math.cos(curA - Math.PI / 2) * r, -Math.sin(curA - Math.PI / 2) * r, 0.22);
        batonMesh.rotation.z = -curA;
        return batonMesh;
      };

      if (isTwelve) {
        // Double baton at 12 o'clock
        groups.dial.add(createBaton(-0.04));
        groups.dial.add(createBaton(0.04));
      } else {
        groups.dial.add(createBaton(0));
      }
    }

    // ==========================================
    // 5. SKELETON BRIDGES & PLATES (日内瓦纹镂空夹板与红宝石)
    // ==========================================
    // Top Bridge 1 (Arching over balance wheel and center)
    const bridgeShape1 = new THREE.Shape();
    bridgeShape1.moveTo(-0.2, 0.1);
    bridgeShape1.lineTo(0.4, 0.3);
    bridgeShape1.quadraticCurveTo(1.2, -0.2, 1.4, -0.8);
    bridgeShape1.lineTo(1.1, -1.0);
    bridgeShape1.quadraticCurveTo(0.6, -0.4, 0.2, -0.1);
    bridgeShape1.lineTo(-0.2, -0.1);
    bridgeShape1.closePath();

    const bridgeGeo1 = new THREE.ExtrudeGeometry(bridgeShape1, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    });
    const bridgeMesh1 = new THREE.Mesh(bridgeGeo1, Materials.genevaPlates);
    bridgeMesh1.position.z = 0.08;
    groups.bridges.add(bridgeMesh1);

    // Barrel Top Bridge (Curved upper left plate)
    const bridgeShape2 = new THREE.Shape();
    bridgeShape2.moveTo(-0.4, -0.2);
    bridgeShape2.lineTo(-1.2, -0.2);
    bridgeShape2.quadraticCurveTo(-1.4, -0.8, -0.9, -1.2);
    bridgeShape2.lineTo(-0.5, -0.9);
    bridgeShape2.quadraticCurveTo(-0.8, -0.6, -0.4, -0.2);
    bridgeShape2.closePath();

    const bridgeGeo2 = new THREE.ExtrudeGeometry(bridgeShape2, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3
    });
    const bridgeMesh2 = new THREE.Mesh(bridgeGeo2, Materials.genevaPlates);
    bridgeMesh2.position.z = 0.08;
    groups.bridges.add(bridgeMesh2);

    // Escapement Bridge (Small cock over escape wheel)
    const bridgeShape3 = new THREE.Shape();
    bridgeShape3.moveTo(-0.3, 0.5);
    bridgeShape3.lineTo(-0.8, 0.8);
    bridgeShape3.lineTo(-0.6, 0.95);
    bridgeShape3.lineTo(-0.15, 0.65);
    bridgeShape3.closePath();

    const bridgeGeo3 = new THREE.ExtrudeGeometry(bridgeShape3, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    });
    const bridgeMesh3 = new THREE.Mesh(bridgeGeo3, Materials.genevaPlates);
    bridgeMesh3.position.z = 0.09;
    groups.bridges.add(bridgeMesh3);

    // Baseplate Structure (Bottom openwork network)
    const basePlateRingGeo = new THREE.RingGeometry(caseInnerRadius * 0.45, caseInnerRadius * 0.95, 48);
    const basePlateRing = new THREE.Mesh(basePlateRingGeo, Materials.genevaPlates);
    basePlateRing.position.z = -0.15;
    groups.basePlate.add(basePlateRing);

    // ==========================================
    // 6. KINEMATIC GEAR TRAIN (5+ 啮合齿轮轮系与摆轮)
    // ==========================================
    // Helper to create synthetic ruby pivot jewel at an axle
    const addRubyPivot = (x, y, z = 0.12) => {
      const jewelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16);
      jewelGeo.rotateX(Math.PI / 2);
      const jewelMesh = new THREE.Mesh(jewelGeo, Materials.rubyJewel);
      jewelMesh.position.set(x, y, z);
      groups.bridges.add(jewelMesh);

      // Gold chaton (setting rim around ruby)
      const chatonGeo = new THREE.TorusGeometry(0.07, 0.02, 12, 24);
      const chatonMesh = new THREE.Mesh(chatonGeo, Materials.yellowGold);
      chatonMesh.position.set(x, y, z + 0.02);
      groups.bridges.add(chatonMesh);
    };

    // --- GEAR 1: Mainspring Barrel (大发条盒, Z1=36, R1=0.82) ---
    const g1Geo = GearPhysics.createGearGeometry(36, 0.82, 0.08, 0.12, 6, 0.08);
    const g1Mesh = new THREE.Mesh(g1Geo, Materials.brushedGunmetal);
    // Center gold cap
    const g1CapGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.09, 24);
    g1CapGeo.rotateX(Math.PI / 2);
    const g1Cap = new THREE.Mesh(g1CapGeo, Materials.yellowGold);
    const g1Group = new THREE.Group();
    g1Group.add(g1Mesh);
    g1Group.add(g1Cap);
    g1Group.position.set(-0.78, -0.52, -0.04);
    groups.gears.add(g1Group);
    animatedParts.gear1_barrel = g1Group;
    addRubyPivot(-0.78, -0.52);

    // --- GEAR 2: Center Wheel (二轮/中心轮, Z2=24, R2=0.55, Meshes with G1) ---
    const g2Geo = GearPhysics.createGearGeometry(24, 0.55, 0.06, 0.10, 5, 0.07);
    const g2Mesh = new THREE.Mesh(g2Geo, Materials.roseGold);
    const g2Group = new THREE.Group();
    g2Group.add(g2Mesh);
    g2Group.position.set(0.0, 0.0, 0.01);
    groups.gears.add(g2Group);
    animatedParts.gear2_center = g2Group;
    addRubyPivot(0.0, 0.0, 0.14);

    // --- GEAR 3: Third Wheel (三轮, Z3=20, R3=0.48, Meshes with G2) ---
    const g3Geo = GearPhysics.createGearGeometry(20, 0.48, 0.05, 0.08, 4, 0.06);
    const g3Mesh = new THREE.Mesh(g3Geo, Materials.polishedSteel);
    // Pinion attached to Gear 3
    const g3PinionGeo = GearPhysics.createGearGeometry(10, 0.18, 0.06, 0.05, 0);
    const g3Pinion = new THREE.Mesh(g3PinionGeo, Materials.roseGold);
    g3Pinion.position.z = -0.04;
    const g3Group = new THREE.Group();
    g3Group.add(g3Mesh);
    g3Group.add(g3Pinion);
    g3Group.position.set(0.64, 0.50, -0.02);
    groups.gears.add(g3Group);
    animatedParts.gear3_third = g3Group;
    addRubyPivot(0.64, 0.50);

    // --- GEAR 4: Fourth / Seconds Wheel (四轮/秒轮, Z4=16, R4=0.38, Meshes with G3) ---
    const g4Geo = GearPhysics.createGearGeometry(16, 0.38, 0.04, 0.07, 3, 0.05);
    const g4Mesh = new THREE.Mesh(g4Geo, Materials.roseGold);
    const g4Group = new THREE.Group();
    g4Group.add(g4Mesh);
    g4Group.position.set(-0.06, 0.72, 0.02);
    groups.gears.add(g4Group);
    animatedParts.gear4_fourth = g4Group;
    addRubyPivot(-0.06, 0.72);

    // --- GEAR 5: Swiss Lever Escape Wheel (星形擒纵轮, Z5=15, R5=0.30, Meshes with G4) ---
    const g5Geo = GearPhysics.createGearGeometry(15, 0.30, 0.035, 0.06, 3, 0.04, true);
    const g5Mesh = new THREE.Mesh(g5Geo, Materials.polishedSteel);
    const g5Group = new THREE.Group();
    g5Group.add(g5Mesh);
    g5Group.position.set(-0.52, 0.60, -0.01);
    groups.gears.add(g5Group);
    animatedParts.gear5_escape = g5Group;
    addRubyPivot(-0.52, 0.60);

    // --- GEAR 6: Winding Intermediate Wheel (上条轮, Z6=18, R6=0.36, Meshes with G1) ---
    const g6Geo = GearPhysics.createGearGeometry(18, 0.36, 0.05, 0.08, 4, 0.06);
    const g6Mesh = new THREE.Mesh(g6Geo, Materials.roseGold);
    const g6Group = new THREE.Group();
    g6Group.add(g6Mesh);
    g6Group.position.set(-0.85, 0.22, -0.05);
    groups.gears.add(g6Group);
    animatedParts.gear6_winding = g6Group;
    addRubyPivot(-0.85, 0.22);

    // --- BALANCE WHEEL & OSCILLATING HAIRSPRING (摆轮与游丝系统) ---
    const balancePos = { x: 0.62, y: -0.58, z: 0.02 };
    const balanceWheel = GearPhysics.createBalanceWheelGroup(0.68, 0.04);
    balanceWheel.position.set(balancePos.x, balancePos.y, balancePos.z);
    groups.gears.add(balanceWheel);
    animatedParts.balanceWheel = balanceWheel;

    // Archimedean Spiral Hairspring
    const hairspring = GearPhysics.createHairspringMesh(0.12, 0.46, 8, 160);
    hairspring.position.set(balancePos.x, balancePos.y, balancePos.z + 0.04);
    groups.gears.add(hairspring);
    animatedParts.hairspring = hairspring;

    // Ruby Balance Shock Protection Cap
    addRubyPivot(balancePos.x, balancePos.y, balancePos.z + 0.08);

    // --- PALLET FORK (擒纵叉) ---
    const palletFork = GearPhysics.createPalletForkGroup();
    palletFork.position.set(0.16, -0.42, 0.0);
    groups.gears.add(palletFork);
    animatedParts.palletFork = palletFork;

    // ==========================================
    // 7. HANDS SYSTEM (立体镂空剑形时针、分针与扫秒秒针)
    // ==========================================
    // Hour Hand (Faceted Skeleton Dauphine - Rose Gold)
    const hourHandGroup = new THREE.Group();
    const hourShape = new THREE.Shape();
    hourShape.moveTo(-0.06, -0.22);
    hourShape.lineTo(0.06, -0.22);
    hourShape.lineTo(0.09, 0.6);
    hourShape.lineTo(0.0, 1.15); // Tip
    hourShape.lineTo(-0.09, 0.6);
    hourShape.closePath();

    const hourInnerCut = new THREE.Path();
    hourInnerCut.moveTo(-0.035, 0.1);
    hourInnerCut.lineTo(0.035, 0.1);
    hourInnerCut.lineTo(0.045, 0.7);
    hourInnerCut.lineTo(0.0, 0.95);
    hourInnerCut.lineTo(-0.045, 0.7);
    hourInnerCut.closePath();
    hourShape.holes.push(hourInnerCut);

    const hourGeo = new THREE.ExtrudeGeometry(hourShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    });
    hourGeo.center();
    hourGeo.translate(0, 0.45, 0);
    const hourMesh = new THREE.Mesh(hourGeo, Materials.roseGold);
    hourHandGroup.add(hourMesh);
    hourHandGroup.position.z = 0.25;
    groups.hands.add(hourHandGroup);
    animatedParts.hourHand = hourHandGroup;

    // Minute Hand (Longer Faceted Skeleton Dauphine - Rose Gold)
    const minHandGroup = new THREE.Group();
    const minShape = new THREE.Shape();
    minShape.moveTo(-0.05, -0.25);
    minShape.lineTo(0.05, -0.25);
    minShape.lineTo(0.08, 0.95);
    minShape.lineTo(0.0, 1.68); // Long tip reaching outer track
    minShape.lineTo(-0.08, 0.95);
    minShape.closePath();

    const minInnerCut = new THREE.Path();
    minInnerCut.moveTo(-0.03, 0.12);
    minInnerCut.lineTo(0.03, 0.12);
    minInnerCut.lineTo(0.04, 1.15);
    minInnerCut.lineTo(0.0, 1.45);
    minInnerCut.lineTo(-0.04, 1.15);
    minInnerCut.closePath();
    minShape.holes.push(minInnerCut);

    const minGeo = new THREE.ExtrudeGeometry(minShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2
    });
    minGeo.center();
    minGeo.translate(0, 0.7, 0);
    const minMesh = new THREE.Mesh(minGeo, Materials.roseGold);
    minHandGroup.add(minMesh);
    minHandGroup.position.z = 0.28;
    groups.hands.add(minHandGroup);
    animatedParts.minuteHand = minHandGroup;

    // Seconds Hand (Ultra-thin Needle with Counterbalance - Blued Steel + Red Tip)
    const secHandGroup = new THREE.Group();
    const secShape = new THREE.Shape();
    secShape.moveTo(-0.015, -0.65);
    secShape.lineTo(0.015, -0.65);
    secShape.lineTo(0.012, 1.95);
    secShape.lineTo(0.0, 2.05); // Needle point
    secShape.lineTo(-0.012, 1.95);
    secShape.closePath();

    // Circular counterbalance ring
    const cbHole = new THREE.Path();
    cbHole.absarc(0, -0.4, 0.08, 0, Math.PI * 2, true);
    secShape.holes.push(cbHole);

    const secGeo = new THREE.ExtrudeGeometry(secShape, {
      depth: 0.02,
      bevelEnabled: false
    });
    secGeo.center();
    secGeo.translate(0, 0.7, 0);
    const secMesh = new THREE.Mesh(secGeo, Materials.bluedSteel);
    secHandGroup.add(secMesh);

    // Crimson Tip Accent on Second hand
    const tipGeo = new THREE.BoxGeometry(0.035, 0.28, 0.025);
    tipGeo.translate(0, 1.9, 0);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xe62e2d });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    secHandGroup.add(tipMesh);

    // Center Cap Holding Hands (Rose Gold Pinion)
    const centerPinionGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 24);
    centerPinionGeo.rotateX(Math.PI / 2);
    const centerPinion = new THREE.Mesh(centerPinionGeo, Materials.roseGold);
    centerPinion.position.z = 0.02;
    secHandGroup.add(centerPinion);

    secHandGroup.position.z = 0.32;
    groups.hands.add(secHandGroup);
    animatedParts.secondHand = secHandGroup;

    // ==========================================
    // 8. LUXURY LEATHER STRAP (深棕色皮革表带与手工缝线)
    // ==========================================
    const createStrapSection = (isTop) => {
      const strapGroup = new THREE.Group();
      const width = 1.95;

      // Realistic ergonomic watch strap curve looping towards the back clasp
      // Case lugs attach at Y = ±2.15, Z = 0
      // Curve wraps back into an oval wrist loop meeting at Y = 0, Z = -3.2
      const curvePoints = isTop ? [
        new THREE.Vector3(0, 2.15, -0.05),
        new THREE.Vector3(0, 2.85, -0.5),
        new THREE.Vector3(0, 2.75, -1.6),
        new THREE.Vector3(0, 1.70, -2.7),
        new THREE.Vector3(0, 0.50, -3.15),
        new THREE.Vector3(0, 0.05, -3.20)
      ] : [
        // Preserve the visible exterior loop; the red support point is a local contact patch on its lower run.
        new THREE.Vector3(0, -2.15, -0.05),
        new THREE.Vector3(0, -2.85, -0.5),
        new THREE.Vector3(0, -2.75, -1.6),
        new THREE.Vector3(0, -1.70, -2.7),
        new THREE.Vector3(0, -0.50, -3.15),
        new THREE.Vector3(0, -0.05, -3.20)
      ];

      const curve = new THREE.CatmullRomCurve3(curvePoints);

      // Strap cross section shape (tapered padded edges)
      const strapShape = new THREE.Shape();
      const halfW = width / 2;
      strapShape.moveTo(-halfW, -0.06);
      strapShape.lineTo(halfW, -0.06);
      strapShape.quadraticCurveTo(halfW, 0.08, halfW - 0.1, 0.08);
      strapShape.lineTo(-halfW + 0.1, 0.08);
      strapShape.quadraticCurveTo(-halfW, 0.08, -halfW, -0.06);
      strapShape.closePath();

      const extrudeSettings = {
        steps: 64,
        extrudePath: curve,
        bevelEnabled: false
      };

      const strapGeo = new THREE.ExtrudeGeometry(strapShape, extrudeSettings);
      const strapMesh = new THREE.Mesh(strapGeo, Materials.leatherStrap);
      strapMesh.castShadow = true;
      strapMesh.receiveShadow = true;
      strapGroup.add(strapMesh);

      // Hand-Stitched Cream Border Lines (Left and Right seam)
      [-halfW + 0.14, halfW - 0.14].forEach(xOffset => {
        const stitchSpinePoints = curvePoints.map(p =>
          new THREE.Vector3(p.x + xOffset, p.y, p.z)
        );
        const stitchSpineCurve = new THREE.CatmullRomCurve3(stitchSpinePoints);

        const numStitches = 24;
        for (let si = 0; si < numStitches; si++) {
          const ta = (si + 0.15) / numStitches;
          const tb = (si + 0.85) / numStitches;
          const pa = stitchSpineCurve.getPoint(ta);
          const pb = stitchSpineCurve.getPoint(tb);
          const dashCurve = new THREE.LineCurve3(pa, pb);
          const dashGeo = new THREE.TubeGeometry(dashCurve, 1, 0.018, 5, false);
          const dashMesh = new THREE.Mesh(dashGeo, Materials.leatherStitch);
          strapGroup.add(dashMesh);
        }
      });

      // Strap Keeper Loops (for bottom strap)
      if (!isTop) {
        const loopGeo = new THREE.TorusGeometry(width * 0.55, 0.06, 12, 32);
        loopGeo.scale(1, 0.35, 1);
        const loop1 = new THREE.Mesh(loopGeo, Materials.leatherStrap);
                // Keeper loops follow the lower strap run and sit just before the rear closure.
        // Green-marked keeper: its hole axis follows the lower strap tangent, so the leather passes through it.
        loop1.position.set(0, -2.45, -1.15);
        loop1.rotation.x = 2.20;
        strapGroup.add(loop1);
        const loop2 = loop1.clone();
        loop2.position.set(0, -1.55, -2.35);
        loop2.rotation.x = 2.00;
        strapGroup.add(loop2);
      }

      // Deployment Clasp (折叠扣) at rear center meeting point
      if (!isTop) {
        const claspGeo = new THREE.BoxGeometry(width * 0.75, 0.45, 0.16);
        const claspMesh = new THREE.Mesh(claspGeo, Materials.polishedSteel);
        // The deployment clasp bridges the two strap halves at their common rear endpoint.
        claspMesh.position.set(0, 0, -3.28);
        claspMesh.rotation.x = -Math.PI / 2;
        strapGroup.add(claspMesh);

        const claspLogo = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16),
          Materials.roseGold
        );
        claspLogo.rotateX(Math.PI / 2);
        claspLogo.position.set(0, 0, -3.40);
        strapGroup.add(claspLogo);
      }

      return strapGroup;
    };

    groups.strap.add(createStrapSection(true));
    groups.strap.add(createStrapSection(false));

    // Assemble all groups to WatchRoot
    Object.values(groups).forEach(grp => watchRoot.add(grp));

    // Store layer references for Exploded View
    watchRoot.userData = {
      groups: groups,
      animatedParts: animatedParts,
      explodeOffsets: {
        frontGlass: 1.8,
        bezel: 1.35,
        hands: 0.95,
        dial: 0.65,
        bridges: 0.35,
        gears: 0.0,
        basePlate: -0.35,
        caseBack: -0.85,
        rearGlass: -1.25,
        strap: -0.4,
        crown: 0.0
      },
      currentExplode: 0
    };

    return watchRoot;
  },

  /**
   * Creates the luxury presentation podium & leather cushion
   */
  createPodium: function () {
    const podiumGroup = new THREE.Group();
    podiumGroup.name = "PodiumGroup";

    // 1. Bottom Dark Architectural Base
    const baseGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.6, 64);
    const baseMesh = new THREE.Mesh(baseGeo, Materials.podiumBase);
    baseMesh.position.y = -4.5;
    baseMesh.receiveShadow = true;
    podiumGroup.add(baseMesh);

    // 2. Top Brushed Metal Turntable Platter
    const topGeo = new THREE.CylinderGeometry(4.3, 4.5, 0.4, 64);
    const topMesh = new THREE.Mesh(topGeo, Materials.podiumTop);
    topMesh.position.y = -4.0;
    topMesh.receiveShadow = true;
    podiumGroup.add(topMesh);

    // 3. Golden Ambient LED Underglow Ring
    const ledRingGeo = new THREE.TorusGeometry(4.4, 0.03, 16, 64);
    ledRingGeo.rotateX(Math.PI / 2);
    const ledRing = new THREE.Mesh(ledRingGeo, Materials.podiumAccentGlow);
    ledRing.position.y = -3.8;
    podiumGroup.add(ledRing);

    // 4. Luxury Watch Display Stand / Rear Strap Cradle
    // Keep the post behind the folded strap/clasp; it must never rise through the watch body.
    const stemGeo = new THREE.CylinderGeometry(0.16, 0.20, 0.58, 24);
    const stemMesh = new THREE.Mesh(stemGeo, Materials.polishedSteel);
    // The old central stem caused the exact side-view collision this display is meant to avoid.
    // Keep a short rear neck only as a visual connection; the actual load is carried by the saddle.
    // Blue-marked seat: place it directly below the red-marked lowest strap segment after root rotation.
    stemMesh.position.set(0, -3.86, -2.03);
    stemMesh.scale.y = 0.35;
    stemMesh.castShadow = true;
    podiumGroup.add(stemMesh);

    // Sleek curved support saddle cradling the lower watch strap from underneath
        // A compact blue-marked seat directly under the red strap contact patch.
    const saddleGeo = new THREE.BoxGeometry(1.20, 0.32, 0.72);
    const saddleMesh = new THREE.Mesh(saddleGeo, Materials.polishedSteel);
    // The saddle sits below and behind the lower strap run after the 45° display tilt.
    // The leather must rest on this blue seat, not pass behind it.
    saddleMesh.position.set(0, -3.66, -2.03);
    saddleMesh.castShadow = true;
    podiumGroup.add(saddleMesh);

    // Rose gold accent badge on support saddle
    const saddleAccentGeo = new THREE.BoxGeometry(0.6, 0.04, 0.7);
    const saddleAccent = new THREE.Mesh(saddleAccentGeo, Materials.roseGold);
    saddleAccent.position.set(0, -3.84, -2.03);
    podiumGroup.add(saddleAccent);

    return podiumGroup;
  },

  /**
   * Sets exploded view separation (0.0 = normal assembled, 1.0 = fully exploded)
   */
  setExplodeProgress: function (watchRoot, progress) {
    if (!watchRoot || !watchRoot.userData || !watchRoot.userData.groups) return;
    const { groups, explodeOffsets } = watchRoot.userData;
    watchRoot.userData.currentExplode = progress;

    Object.keys(explodeOffsets).forEach(key => {
      if (groups[key]) {
        const targetZ = explodeOffsets[key] * progress * 1.8;
        groups[key].position.z = targetZ;
      }
    });

    // Side expansion for crown in exploded mode
    if (groups.crown) {
      groups.crown.position.x = 2.69 + progress * 0.8;
    }
  }
};
