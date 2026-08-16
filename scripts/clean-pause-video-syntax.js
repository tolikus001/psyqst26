const fs = require("fs");
const path = require("path");

const cleanPauseFn = `    // Pause Kinescope Video Player & Other Audios (Bulletproof for all browsers/webviews)
    function pauseVideo() {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe) {
          if (iframe.contentWindow) {
            try {
              iframe.contentWindow.postMessage(JSON.stringify({ event: 'pause', command: 'pause' }), '*');
              iframe.contentWindow.postMessage({ type: 'pause', command: 'pause' }, '*');
              iframe.contentWindow.postMessage({ type: 'player:pause' }, '*');
              iframe.contentWindow.postMessage(JSON.stringify({ type: 'player:pause' }), '*');
              iframe.contentWindow.postMessage({ event: 'command', command: 'pause' }, '*');
              iframe.contentWindow.postMessage('{"method":"pause"}', '*');
              iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            } catch(e) {}
          }
          try {
            const currentSrc = iframe.src;
            if (currentSrc && currentSrc.includes('kinescope.io')) {
              iframe.src = currentSrc;
            }
          } catch(e) {}
        }
      });
      const audios = document.querySelectorAll('audio');
      audios.forEach(a => { try { a.pause(); } catch(e){} });
    }`;

const clientDir = path.resolve("out/client");
const files = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

files.forEach(file => {
  const filePath = path.join(clientDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Replace any messy pauseVideo definition with cleanPauseFn
  content = content.replace(
    /\/\/ Pause Kinescope Video Player[\s\S]*?function pauseVideo\(\) \{[\s\S]*?function safeNavigate/,
    cleanPauseFn + "\n\n    function safeNavigate"
  );

  content = content.replace(
    /function pauseVideo\(\) \{[\s\S]*?const audios = document\.querySelectorAll\('audio'\);[\s\S]*?\}\s*\}/,
    cleanPauseFn
  );

  fs.writeFileSync(filePath, content, "utf8");
});

console.log("Successfully cleaned all pauseVideo definitions!");
