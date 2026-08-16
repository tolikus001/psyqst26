const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(clientDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Check if file has navDrawerOverlay
  if (!html.includes('id="navDrawerOverlay"')) {
    return;
  }

  console.log(`Processing ${file}...`);

  // 1. Remove any duplicate/unclosed drawer content after </navDrawerOverlay>
  // Pattern: after the first <div id="navDrawerOverlay">...</div> closing, remove any trailing drawer items before <script>
  const drawerOverlayIndex = html.indexOf('<div id="navDrawerOverlay"');
  if (drawerOverlayIndex !== -1) {
    // Find the end of this drawer overlay. The overlay contains navDrawerBackdrop and navDrawerPanel.
    // The panel has 3 closing </div>: one for drawer-content, one for navDrawerPanel, one for navDrawerOverlay.
    // Let's find the closing tag for navDrawerOverlay
    const afterOverlay = html.slice(drawerOverlayIndex);
    // Find where the script starts after drawerOverlayIndex
    const scriptTagIndex = html.indexOf('<script>', drawerOverlayIndex);
    
    if (scriptTagIndex !== -1) {
      const drawerSection = html.slice(drawerOverlayIndex, scriptTagIndex);
      
      // Check if there are duplicate "Уроки миникурса" or "Уроки курса" in this section
      // In the clean drawer, there should only be one <div id="navDrawerPanel">
      // Let's match the single clean drawer structure
      const cleanDrawerMatch = drawerSection.match(/<div id="navDrawerOverlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
      if (cleanDrawerMatch) {
        const cleanDrawer = cleanDrawerMatch[0];
        html = html.slice(0, drawerOverlayIndex) + cleanDrawer + '\n\n  ' + html.slice(scriptTagIndex);
      }
    }
  }

  // 2. Update CSS for #navDrawerOverlay and #navDrawerPanel
  html = html.replace(/#navDrawerOverlay\s*\{[\s\S]*?visibility:\s*hidden\s*!important;[\s\S]*?\}/, 
`#navDrawerOverlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      z-index: 999999 !important;
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.3s ease !important;
    }`);

  html = html.replace(/#navDrawerOverlay\.active\s*\{[\s\S]*?visibility:\s*visible\s*!important;[\s\S]*?\}/,
`#navDrawerOverlay.active {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }`);

  html = html.replace(/transform:\s*translateY\(100%\)\s*!important;/, 'transform: translateY(120%) !important;');

  // 3. Update openNavDrawer and closeNavDrawer functions
  const openFnRegex = /window\.openNavDrawer\s*=\s*function\s*\(\)\s*\{[\s\S]*?document\.body\.style\.overflow\s*=\s*'hidden';\s*\};/;
  if (openFnRegex.test(html)) {
    html = html.replace(openFnRegex, 
`window.openNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('medium'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.style.display = 'block';
        void overlay.offsetHeight; // force reflow
        overlay.classList.add('active');
      }
      document.body.style.overflow = 'hidden';
    };`);
  }

  const closeFnRegex = /window\.closeNavDrawer\s*=\s*function\s*\(\)\s*\{[\s\S]*?document\.body\.style\.overflow\s*=\s*'';\s*\};/;
  if (closeFnRegex.test(html)) {
    html = html.replace(closeFnRegex,
`window.closeNavDrawer = function() {
      try { if (typeof safeHaptic === 'function') safeHaptic('selection'); } catch(e) {}
      var overlay = document.getElementById('navDrawerOverlay');
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(function() {
          if (!overlay.classList.contains('active')) {
            overlay.style.display = 'none';
          }
        }, 320);
      }
      document.body.style.overflow = '';
    };`);
  }

  // 4. Update footer padding
  html = html.replace(/<footer class="text-center" style="display:flex; justify-content:center; margin:\d+px auto 0 auto; width:100%;">/,
    '<footer class="text-center" style="display:flex; justify-content:center; margin:12px auto 0 auto; padding-bottom:24px; width:100%;">');

  fs.writeFileSync(filePath, html, 'utf8');
});

console.log('✅ All drawer duplicates successfully removed and drawer CSS/JS cleaned up!');
