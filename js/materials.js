/**
 * materials.js
 * High-precision physically based materials for luxury watch components.
 */

const Materials = {
  init: function () {
    // 1. Polished 316L Stainless Steel / Titanium
    this.polishedSteel = new THREE.MeshPhysicalMaterial({
      color: 0xe8ecf2,
      metalness: 0.96,
      roughness: 0.12,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      reflectivity: 1.0,
      envMapIntensity: 1.8
    });

    // 2. Brushed Gunmetal / Titanium Grey Mid-case
    this.brushedGunmetal = new THREE.MeshStandardMaterial({
      color: 0x363a44,
      metalness: 0.92,
      roughness: 0.38,
      bumpMap: Textures.createBrushedMetalBump(),
      bumpScale: 0.03,
      envMapIntensity: 1.4
    });

    // 3. 18K Rose Gold (Bridge bevels, center gear, hands, accents)
    this.roseGold = new THREE.MeshPhysicalMaterial({
      color: 0xdca48f,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
      reflectivity: 1.0,
      envMapIntensity: 1.9
    });

    // 4. 18K Yellow Gold (Timing screws, escape accents)
    this.yellowGold = new THREE.MeshPhysicalMaterial({
      color: 0xebc35d,
      metalness: 0.96,
      roughness: 0.14,
      clearcoat: 0.4,
      envMapIntensity: 2.0
    });

    // 5. Thermal Blued Steel (Seconds hand, movement screws)
    this.bluedSteel = new THREE.MeshPhysicalMaterial({
      color: 0x1c4485,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.2
    });

    // 6. Double-Domed Sapphire Crystal with AR Coating
    this.sapphireCrystal = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1.0,
      transparent: true,
      roughness: 0.02,
      ior: 1.77, // Authentic synthetic sapphire refractive index
      thickness: 0.8,
      specularIntensity: 1.2,
      specularColor: new THREE.Color(0xaad4ff), // AR violet-blue coating sheen
      attenuationColor: new THREE.Color(0xf0f7ff),
      attenuationDistance: 10.0,
      envMapIntensity: 1.5,
      side: THREE.FrontSide
    });

    // 7. Synthetic Ruby Pivot Jewels (Corundum)
    this.rubyJewel = new THREE.MeshPhysicalMaterial({
      color: 0xd9043d,
      transmission: 0.85,
      opacity: 1.0,
      transparent: true,
      roughness: 0.12,
      ior: 1.76,
      thickness: 0.5,
      attenuationColor: new THREE.Color(0x78001e),
      attenuationDistance: 0.3,
      specularColor: new THREE.Color(0xff88a0),
      envMapIntensity: 2.0
    });

    // 8. Côtes de Genève Skeleton Bridge Plates
    this.genevaPlates = new THREE.MeshStandardMaterial({
      map: Textures.createGenevaStripesTexture(),
      color: 0xd2d7df,
      metalness: 0.90,
      roughness: 0.28,
      envMapIntensity: 1.7
    });

    // 9. Chapter Ring (Dial Outer Track)
    this.dialChapterRing = new THREE.MeshStandardMaterial({
      map: Textures.createDialTexture(),
      transparent: true,
      alphaTest: 0.05,
      metalness: 0.7,
      roughness: 0.25,
      envMapIntensity: 1.5,
      side: THREE.DoubleSide
    });

    // 10. Deep Brown Genuine Alligator / Calfskin Leather Strap
    this.leatherStrap = new THREE.MeshStandardMaterial({
      map: Textures.createLeatherTexture(),
      bumpMap: Textures.createLeatherBumpMap(),
      bumpScale: 0.06,
      roughness: 0.72,
      metalness: 0.08,
      envMapIntensity: 0.8
    });

    // 11. Hand-stitched Cream Thread
    this.leatherStitch = new THREE.MeshStandardMaterial({
      color: 0xe2d6c0,
      roughness: 0.85,
      metalness: 0.02
    });

    // 12. Display Podium & Base
    this.podiumTop = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      metalness: 0.85,
      roughness: 0.35,
      envMapIntensity: 0.9
    });

    this.podiumBase = new THREE.MeshStandardMaterial({
      color: 0x090a0d,
      metalness: 0.9,
      roughness: 0.45,
      envMapIntensity: 0.6
    });

    this.podiumAccentGlow = new THREE.MeshBasicMaterial({
      color: 0xd4af37
    });

    // 13. Leather Cushion / Stand C-clip
    this.watchPillow = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.9,
      metalness: 0.05
    });

    // 14. Luminous Phosphor Accents (Hands and 12-hour dot)
    this.lumePhosphor = new THREE.MeshBasicMaterial({
      color: 0x88ffbb
    });
  },

  // Color Theme Switching helper
  applyTheme: function (themeName) {
    if (themeName === 'classic') {
      this.polishedSteel.color.setHex(0xe8ecf2);
      this.roseGold.color.setHex(0xdca48f);
      this.yellowGold.color.setHex(0xebc35d);
      this.brushedGunmetal.color.setHex(0x363a44);
      this.leatherStrap.color.setHex(0xffffff);
    } else if (themeName === 'platinum') {
      this.polishedSteel.color.setHex(0xf4f7fa);
      this.roseGold.color.setHex(0xd8dce4); // Silver Platinum look
      this.yellowGold.color.setHex(0xe0e4ec);
      this.brushedGunmetal.color.setHex(0x22262e);
      this.leatherStrap.color.setHex(0xd8d8d8);
    } else if (themeName === 'stealth') {
      this.polishedSteel.color.setHex(0x26282c);
      this.roseGold.color.setHex(0xc98a44); // Deep amber accent
      this.yellowGold.color.setHex(0xd4af37);
      this.brushedGunmetal.color.setHex(0x121418);
      this.leatherStrap.color.setHex(0x888888);
    }

    [this.polishedSteel, this.roseGold, this.yellowGold, this.brushedGunmetal, this.leatherStrap].forEach(m => {
      if (m) m.needsUpdate = true;
    });
  }
};
