(function() {
  function createEucalyptusSVG() {
    const width = Math.max(window.innerWidth || 1200, 1200);
    const height = Math.max(window.innerHeight || 900, 900);

    // Color palette for watercolor eucalyptus
    const colors = [
      { fill: '#7F9B8E', dark: '#5E7D70' },
      { fill: '#6D8F81', dark: '#4E6F62' },
      { fill: '#8EAFA1', dark: '#6A8F80' },
      { fill: '#9BB8AB', dark: '#759587' },
      { fill: '#5C7C6F', dark: '#3E5E51' },
      { fill: '#A6C2B5', dark: '#809F92' }
    ];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style="position:fixed; inset:0; width:100vw; height:100vh; pointer-events:none; z-index:0;">
      <defs>
        <radialGradient id="ambience" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#EFF3EE" />
          <stop offset="60%" stop-color="#E5ECE4" />
          <stop offset="100%" stop-color="#DCE4DB" />
        </radialGradient>
        <filter id="watercolorBlur">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#ambience)" />
    `;

    // Helper to draw a eucalyptus leaf
    function drawLeaf(x, y, angle, size, colorIdx, opacity) {
      const c = colors[colorIdx % colors.length];
      const rad = (angle * Math.PI) / 180;
      const rx = size * 1.3;
      const ry = size * 0.75;

      return `
        <g transform="translate(${x}, ${y}) rotate(${angle})">
          <ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${c.fill}" opacity="${opacity || 0.72}" />
          <!-- Central vein -->
          <line x1="${-rx * 0.85}" y1="0" x2="${rx * 0.85}" y2="0" stroke="${c.dark}" stroke-width="1.2" opacity="0.45" />
          <!-- Subtle highlight -->
          <ellipse cx="${-rx * 0.2}" cy="${-ry * 0.2}" rx="${rx * 0.5}" ry="${ry * 0.4}" fill="#FFFFFF" opacity="0.22" />
        </g>
      `;
    }

    // Helper to draw a natural eucalyptus branch
    function drawBranch(startX, startY, controlX, controlY, endX, endY, leafCount, baseSize, baseAngle) {
      let branchSvg = '';
      // Main curved stem
      branchSvg += `<path d="M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}" fill="none" stroke="#5A7669" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />`;

      // Draw paired and alternating leaves along bezier curve
      for (let i = 1; i <= leafCount; i++) {
        const t = i / (leafCount + 1);
        // Quadratic bezier point: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
        const bx = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;
        const by = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;

        // Tangent angle
        const dx = 2 * (1 - t) * (controlX - startX) + 2 * t * (endX - controlX);
        const dy = 2 * (1 - t) * (controlY - startY) + 2 * t * (endY - controlY);
        const tangentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        const leafSize = baseSize * (0.8 + 0.4 * (1 - t * 0.5));

        // Left leaf
        branchSvg += drawLeaf(bx, by, tangentAngle - 40 - Math.random() * 15, leafSize, i * 2, 0.65 + Math.random() * 0.15);
        // Right leaf
        branchSvg += drawLeaf(bx, by, tangentAngle + 40 + Math.random() * 15, leafSize * 0.95, i * 2 + 1, 0.60 + Math.random() * 0.15);
      }

      return branchSvg;
    }

    // 1. Top-Left major branch sweeping downwards-inward
    svg += drawBranch(0, 0, width * 0.22, height * 0.18, width * 0.38, height * 0.42, 10, 32, 45);
    svg += drawBranch(-20, height * 0.15, width * 0.15, height * 0.35, width * 0.28, height * 0.65, 8, 28, 30);

    // 2. Top-Right major branch sweeping downwards-inward
    svg += drawBranch(width, 0, width * 0.78, height * 0.18, width * 0.62, height * 0.45, 10, 32, -45);
    svg += drawBranch(width + 20, height * 0.2, width * 0.85, height * 0.42, width * 0.72, height * 0.7, 8, 28, -30);

    // 3. Central ambient foliage (softly passing through background so there are no empty gaps)
    svg += drawBranch(width * 0.3, -30, width * 0.45, height * 0.25, width * 0.55, height * 0.5, 7, 24, 20);
    svg += drawBranch(width * 0.7, -30, width * 0.55, height * 0.25, width * 0.45, height * 0.55, 7, 24, -20);

    // 4. Bottom-Left branch climbing upward
    svg += drawBranch(0, height, width * 0.2, height * 0.78, width * 0.35, height * 0.55, 9, 30, -35);
    svg += drawBranch(width * 0.1, height + 20, width * 0.25, height * 0.85, width * 0.48, height * 0.72, 7, 26, -20);

    // 5. Bottom-Right branch climbing upward
    svg += drawBranch(width, height, width * 0.8, height * 0.78, width * 0.65, height * 0.52, 9, 30, 35);
    svg += drawBranch(width * 0.9, height + 20, width * 0.75, height * 0.85, width * 0.52, height * 0.72, 7, 26, 20);

    // 6. Floating accent leaves in open areas for seamless botanical atmosphere
    const floatingSpots = [
      { x: width * 0.18, y: height * 0.48, angle: 25, size: 22 },
      { x: width * 0.82, y: height * 0.52, angle: -30, size: 24 },
      { x: width * 0.5, y: height * 0.22, angle: 12, size: 20 },
      { x: width * 0.48, y: height * 0.68, angle: -15, size: 22 },
      { x: width * 0.52, y: height * 0.85, angle: 40, size: 20 },
      { x: width * 0.12, y: height * 0.72, angle: -60, size: 26 },
      { x: width * 0.88, y: height * 0.68, angle: 50, size: 26 }
    ];

    floatingSpots.forEach((spot, idx) => {
      svg += drawLeaf(spot.x, spot.y, spot.angle, spot.size, idx, 0.45);
    });

    svg += '</svg>';
    return svg;
  }

  function renderBackground() {
    let bg = document.getElementById('maisonArtBackground');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'maisonArtBackground';
      bg.setAttribute('aria-hidden', 'true');
      if (document.body) {
        document.body.insertBefore(bg, document.body.firstChild);
      }
    }

    if (bg) {
      bg.innerHTML = createEucalyptusSVG();
    }
  }

  function init() {
    renderBackground();
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderBackground, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.renderBotanicalBackground = renderBackground;
})();