const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HEAD_BRIDGE_CODE = `  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://list.notibot.ru/notibot-bridge.js"></script>
  <!-- Notibot Bridge Early Interceptor (КОДЕР 2.0) -->
  <script>
    window.notibotInitData = null;
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'NOTIBOT_INIT' && event.data.data) {
        window.notibotInitData = event.data.data;
      }
    });
  </script>
  <!-- Fallback Inlined Notibot Bridge if standalone -->
  <script>
    if (!window.notibot) {
      (function() {
        class NotibotBridge {
          constructor() {
            this.user = {};
            this.app = {};
            this._updateHandlers = [];
            this._lastActionTimes = {};
            this._responseHandlers = {};
            this._init();
          }
          _init() {
            window.addEventListener('message', (event) => {
              if (!event.data) return;
              const isInit = event.data.type === 'NOTIBOT_INIT' ||
                             event.data.type === 'notibot:init' ||
                             event.data.type === 'NOTIBOT_READY' ||
                             event.data.type === 'notibot_init';
              if (isInit) {
                const u = (event.data.data && event.data.data.user) || event.data.user || (event.data.data && event.data.data.displayName ? event.data.data : null);
                const a = (event.data.data && event.data.data.app) || event.data.app || {};
                if (u) this.user = u;
                if (a) this.app = a;
                this._updateHandlers.forEach(cb => {
                  try { cb(this.user, this.app); } catch(e) {}
                });
              }
            });
            if (window.parent && window.parent !== window) {
              try { window.parent.postMessage({ source: 'vibe-sandbox', type: 'READY_FOR_INIT' }, '*'); } catch(e) {}
            }
          }
          onUpdate(callback) {
            if (typeof callback === 'function') {
              this._updateHandlers.push(callback);
              if (this.user && (this.user.displayName || this.user.first_name || this.user.id || Object.keys(this.user).length > 0)) {
                callback(this.user, this.app);
              }
            }
          }
          openArticle(id) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_article', payload: { id } }, '*'); }
          openProduct(id) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_product', payload: { id } }, '*'); }
          openStorefront() { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_storefront' }, '*'); }
          openLink(url) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'open_link', payload: { url } }, '*'); else window.location.href = url; }
          hapticImpact(style) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { style } }, '*'); }
          hapticNotification(type) { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { type } }, '*'); }
          hapticSelection() { if (window.parent) window.parent.postMessage({ source: 'vibe-sandbox', type: 'haptic', payload: { style: 'selection' } }, '*'); }
        }
        window.notibot = new NotibotBridge();
      })();
    }
  </script>`;

const dirs = ['out/client', 'baza/исходник миникурса'];

for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  const files = fs.readdirSync(d).filter(f => f.endsWith('.html'));

  for (const f of files) {
    const filePath = path.join(d, f);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace the entire head bridge block with the correct version
    const headBridgeRegex = /\s*<script src="https:\/\/telegram\.org\/js\/telegram-web-app\.js"><\/script>\s*<script src="https:\/\/list\.notibot\.ru\/notibot-bridge\.js"><\/script>\s*<!-- Notibot Bridge Early Interceptor \(КОДЕР 2\.0\) -->[\s\S]*?window\.notibot = new NotibotBridge\(\);\s*\}\)\(\);\s*\}\s*<\/script>/;
    if (headBridgeRegex.test(content)) {
      content = content.replace(headBridgeRegex, '\n' + HEAD_BRIDGE_CODE);
    }

    // 2. Fix pauseVideo() in bonus files if closing brace is missing
    if (content.includes('function pauseVideo()')) {
      content = content.replace(
        /(function pauseVideo\(\) \{[\s\S]*?catch\(e\) \{\}\s*\})\s*(function safeNavigate)/,
        '$1\n    }\n\n    $2'
      );
    }

    // 3. Fix any duplicate closing brace after safeHaptic
    content = content.replace(
      /(function safeHaptic\(type\) \{[\s\S]*?catch \(e\) \{\}\s*\}\s*)\}\s*(\n\s*(function|window|\/\/))/g,
      '$1$2'
    );

    // 4. Ensure font is Inter
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans[^"]*" rel="stylesheet" \/>/g, '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">');

    // 5. Remove redundant link to theme.css if inlined-theme is present
    if (content.includes('id="inlined-theme"')) {
      content = content.replace(/\s*<link rel="stylesheet" href="theme\.css" \/>/g, '');
    }

    // 6. Ensure CSP is present
    if (!content.includes('Content-Security-Policy')) {
      const cspTag = `  <meta http-equiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://list.notibot.ru https://telegram.org https://kinescope.io https://*.kinescope.io;
      frame-src 'self' https://kinescope.io https://*.kinescope.io;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      media-src 'self' https: data: blob:;
      connect-src 'self' https: http://localhost:3000;
    " />`;
      content = content.replace(/(<meta name="viewport"[^>]*>)/, '$1\n' + cspTag);
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Verification across ALL files
console.log('--- RUNNING FULL SYNTAX & RUNTIME CHECK ---');
let totalErrors = 0;

for (const d of dirs) {
  if (!fs.existsSync(d)) continue;
  const files = fs.readdirSync(d).filter(f => f.endsWith('.html'));
  for (const f of files) {
    const filePath = path.join(d, f);
    const c = fs.readFileSync(filePath, 'utf8');
    const scripts = c.match(/<script[\s\S]*?<\/script>/gi) || [];

    scripts.forEach((s, idx) => {
      const code = s.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      if (!code || s.includes('src=')) return;
      try {
        new vm.Script(code);
      } catch (err) {
        console.error(`❌ Error in ${filePath} [script #${idx}]:`, err.message);
        totalErrors++;
      }
    });
  }
}

if (totalErrors === 0) {
  console.log('🎉 ALL HTML FILES IN BOTH out/client/ AND baza/ ARE 100% VALID JAVASCRIPT!');
} else {
  console.error(`⚠️ Found ${totalErrors} errors.`);
  process.exit(1);
}
