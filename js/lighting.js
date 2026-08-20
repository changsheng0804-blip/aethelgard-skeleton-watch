/**
 * lighting.js
 * Cinematic studio lighting rig for luxury watch product photography.
 */

const Lighting = {
  init: function (scene) {
    this.lightGroup = new THREE.Group();
    this.lightGroup.name = "LightingRig";

    // 1. Ambient Baseline (Soft Dark Charcoal)
    this.ambientLight = new THREE.AmbientLight(0x20242e, 0.6);
    this.lightGroup.add(this.ambientLight);

    // 2. Key Light (Upper Right Warm Studio Softbox Spot)
    this.keyLight = new THREE.SpotLight(0xfff7e6, 4.5, 40, Math.PI / 4, 0.4, 1.2);
    this.keyLight.position.set(7, 10, 8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 2;
    this.keyLight.shadow.camera.far = 30;
    this.keyLight.shadow.bias = -0.0001;
    this.keyLight.shadow.radius = 3;
    this.lightGroup.add(this.keyLight);

    // 3. Rim Light (Sharp Cool Edge Glint - Traces chamfers & sapphire crystal)
    this.rimLight = new THREE.DirectionalLight(0xd9ecff, 3.8);
    this.rimLight.position.set(-8, 5, -8);
    this.lightGroup.add(this.rimLight);

    // 4. Fill Light (Soft Warm Ambient Bounce for shadow details)
    this.fillLight = new THREE.DirectionalLight(0xffeed9, 1.6);
    this.fillLight.position.set(-6, -3, 6);
    this.lightGroup.add(this.fillLight);

    // 5. Crown & Dial Accent Light (Precision Pin-spot for skeleton gears & ruby sparkle)
    this.accentSpot = new THREE.SpotLight(0xffeedd, 2.5, 25, Math.PI / 6, 0.5, 1.5);
    this.accentSpot.position.set(2, 6, 9);
    this.lightGroup.add(this.accentSpot);

    // 6. Base / Stand Underglow Accent (Subtle Golden Floor Glow)
    this.floorLight = new THREE.PointLight(0xd4af37, 1.2, 10, 2);
    this.floorLight.position.set(0, -3.5, 0);
    this.lightGroup.add(this.floorLight);

    scene.add(this.lightGroup);
    return this.lightGroup;
  },

  setPreset: function (presetName) {
    if (presetName === 'glamour') {
      this.keyLight.color.setHex(0xfff7e6);
      this.keyLight.intensity = 4.5;
      this.rimLight.color.setHex(0xd9ecff);
      this.rimLight.intensity = 3.8;
      this.fillLight.intensity = 1.6;
      this.ambientLight.intensity = 0.6;
    } else if (presetName === 'noir') {
      this.keyLight.color.setHex(0xe0e6ed);
      this.keyLight.intensity = 3.2;
      this.rimLight.color.setHex(0xffffff);
      this.rimLight.intensity = 5.5; // Razor sharp edge
      this.fillLight.intensity = 0.6;
      this.ambientLight.intensity = 0.25;
    } else if (presetName === 'warmGold') {
      this.keyLight.color.setHex(0xffe2a4);
      this.keyLight.intensity = 5.2;
      this.rimLight.color.setHex(0xffcb7d);
      this.rimLight.intensity = 4.0;
      this.fillLight.intensity = 2.2;
      this.ambientLight.intensity = 0.8;
    }
  }
};
