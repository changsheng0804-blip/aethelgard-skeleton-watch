/**
 * textures.js
 * Procedural canvas texture generators for high-end luxury watch details.
 * No external image assets needed - ultra reliable and fast loading.
 */

const Textures = {
  /**
   * Generates high-res dial chapter ring texture (outer track, minute ticks, gold indices)
   */
  createDialTexture: function () {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const center = 1024;
    const radius = 960;

    // Clear background (transparent inner for skeleton view)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer Dark Anthracite Chapter Ring (Using clean evenodd path)
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2, false);
    ctx.arc(center, center, radius * 0.74, 0, Math.PI * 2, true);
    const ringGrad = ctx.createRadialGradient(center, center, radius * 0.74, center, center, radius);
    ringGrad.addColorStop(0, '#101318');
    ringGrad.addColorStop(0.5, '#181c22');
    ringGrad.addColorStop(1, '#0c0e12');
    ctx.fillStyle = ringGrad;
    ctx.fill('evenodd');

    // Subtle Radial Metallic Brushing Effect on Chapter Ring
    ctx.save();
    ctx.translate(center, center);
    for (let i = 0; i < 720; i++) {
      const angle = (i / 720) * Math.PI * 2;
      const alpha = 0.03 + 0.04 * Math.sin(i * 0.5);
      ctx.strokeStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius * 0.74), Math.sin(angle) * (radius * 0.74));
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      ctx.stroke();
    }
    ctx.restore();

    // Outer & Inner Gold Accent Rim Lines
    ctx.beginPath();
    ctx.arc(center, center, radius - 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius * 0.74 + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Railway Minute Track & Hour Ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const isHour = i % 5 === 0;

      const rOuter = radius - 15;
      const rInner = isHour ? radius * 0.80 : radius * 0.88;

      const x1 = center + Math.cos(angle) * rOuter;
      const y1 = center + Math.sin(angle) * rOuter;
      const x2 = center + Math.cos(angle) * rInner;
      const y2 = center + Math.sin(angle) * rInner;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (isHour) {
        ctx.strokeStyle = '#f5d77f';
        ctx.lineWidth = 8;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Minute Numbers (05, 10, 15 ... 60)
    ctx.font = 'bold 28px "Montserrat", sans-serif';
    ctx.fillStyle = 'rgba(240, 242, 245, 0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const numRadius = radius * 0.84;
      const x = center + Math.cos(angle) * numRadius;
      const y = center + Math.sin(angle) * numRadius;
      const numStr = (i * 5 < 10 ? '0' : '') + (i * 5 === 60 ? '60' : i * 5);
      ctx.fillText(numStr, x, y);
    }

    // High-End Micro-Typography on Inner Ring with cross-browser manual character spacing
    ctx.font = '600 20px "Montserrat", sans-serif';
    ctx.fillStyle = '#d4af37';
    const text = 'SWISS   •   CHRONOMETER';
    const totalW = text.length * 14;
    let startX = center - totalW / 2;
    for (let c = 0; c < text.length; c++) {
      ctx.fillText(text[c], startX + c * 14, center + radius * 0.82);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  },

  /**
   * Generates realistic deep brown alligator / calfskin leather diffuse & bump map
   */
  createLeatherTexture: function () {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base Warm Deep Brown Leather Tone
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#2d1810');
    grad.addColorStop(0.5, '#20100a');
    grad.addColorStop(1, '#180c08');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Procedural Organic Cell / Leather Grain (Voronoi-like / Noise-like scales)
    const numCells = 160;
    const points = [];
    for (let i = 0; i < numCells; i++) {
      points.push({
        x: Math.random() * 1024,
        y: Math.random() * 1024,
        w: 30 + Math.random() * 60,
        h: 20 + Math.random() * 40,
        tilt: (Math.random() - 0.5) * 0.4
      });
    }

    // Draw embossed leather scales
    points.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);

      ctx.beginPath();
      ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 12);

      // Scale Highlight & Shadow
      const scaleGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, Math.max(p.w, p.h));
      scaleGrad.addColorStop(0, 'rgba(74, 44, 32, 0.45)');
      scaleGrad.addColorStop(0.8, 'rgba(32, 16, 10, 0.2)');
      scaleGrad.addColorStop(1, 'rgba(8, 4, 2, 0.7)');

      ctx.fillStyle = scaleGrad;
      ctx.fill();

      // Micro crease groove
      ctx.strokeStyle = 'rgba(10, 5, 3, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();
    });

    // High frequency micro pore noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.7));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.5));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    texture.anisotropy = 16;
    return texture;
  },

  /**
   * Generates leather strap bump/normal height map
   */
  createLeatherBumpMap: function () {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 25 + Math.random() * 50;
      const h = 18 + Math.random() * 35;

      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 8);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 20, 20, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 35;
      data[i] += n;
      data[i + 1] += n;
      data[i + 2] += n;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return texture;
  },

  /**
   * Generates Côtes de Genève (Geneva Stripes) texture for skeleton bridges
   */
  createGenevaStripesTexture: function () {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const stripeWidth = 32;
    for (let x = 0; x < 512; x += stripeWidth) {
      const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, 0);
      grad.addColorStop(0, '#70757d');
      grad.addColorStop(0.48, '#abb2bd');
      grad.addColorStop(0.52, '#d6dbe3');
      grad.addColorStop(1, '#5a5f66');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, stripeWidth, 512);
    }

    // Overlay fine horizontal hairline scratches
    for (let y = 0; y < 512; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, 512, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  },

  /**
   * Generates brushed radial metal bump map for watch bezel and caseback
   */
  createBrushedMetalBump: function () {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    const center = 256;
    ctx.save();
    ctx.translate(center, center);
    for (let i = 0; i < 720; i++) {
      const angle = (i / 720) * Math.PI * 2;
      const alpha = 0.08 + Math.random() * 0.12;
      ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 256, Math.sin(angle) * 256);
      ctx.stroke();
    }
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  },

  /**
   * Generates a procedural HDR-style studio environment map with softboxes and rim highlights
   */
  createStudioEnvMap: function (renderer) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Smooth dark luxury studio background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    bgGrad.addColorStop(0, '#0d1017');
    bgGrad.addColorStop(0.4, '#1a1f29');
    bgGrad.addColorStop(0.7, '#0f1218');
    bgGrad.addColorStop(1, '#050608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Overhead Large Main Softbox (Soft Warm Studio Key Light)
    const softbox1 = ctx.createRadialGradient(800, 260, 20, 800, 260, 420);
    softbox1.addColorStop(0, '#fffbf0');
    softbox1.addColorStop(0.3, '#f5e8d0');
    softbox1.addColorStop(0.7, 'rgba(180, 160, 130, 0.4)');
    softbox1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = softbox1;
    ctx.fillRect(300, 0, 1000, 600);

    // Rim Strip Light 1 (Cool High-Contrast Silver Reflection Strip - Left)
    const rim1 = ctx.createLinearGradient(160, 0, 320, 0);
    rim1.addColorStop(0, 'rgba(0,0,0,0)');
    rim1.addColorStop(0.5, '#ffffff');
    rim1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rim1;
    ctx.fillRect(160, 100, 160, 800);

    // Rim Strip Light 2 (Warm Golden Edge Glow - Right)
    const rim2 = ctx.createLinearGradient(1650, 0, 1850, 0);
    rim2.addColorStop(0, 'rgba(0,0,0,0)');
    rim2.addColorStop(0.4, '#fcdba1');
    rim2.addColorStop(0.7, '#ffffff');
    rim2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rim2;
    ctx.fillRect(1650, 120, 200, 780);

    // Secondary Accent Spot Reflector
    const spot = ctx.createRadialGradient(1400, 400, 10, 1400, 400, 250);
    spot.addColorStop(0, '#e3f2fd');
    spot.addColorStop(0.4, 'rgba(144, 202, 249, 0.35)');
    spot.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = spot;
    ctx.fillRect(1150, 150, 500, 500);

    // Subtle Floor Reflection Gradient
    const floorGrad = ctx.createLinearGradient(0, 750, 0, 1024);
    floorGrad.addColorStop(0, 'rgba(25, 30, 40, 0.3)');
    floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 750, 2048, 274);

    const equirectTexture = new THREE.CanvasTexture(canvas);
    equirectTexture.mapping = THREE.EquirectangularReflectionMapping;

    return equirectTexture;
  }
};
