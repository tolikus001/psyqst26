const fs = require("fs");
const path = require("path");

const files = [
  "out/client/03_lesson1.html",
  "out/client/04_lesson2.html",
  "out/client/05_lesson3.html",
  "out/client/06_lesson4.html",
  "out/client/07_lesson5.html"
];

const exactCleanPause = `    // Pause Kinescope Video Player & Other Audios
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

files.forEach(f => {
  let content = fs.readFileSync(f, "utf8");
  
  // Replace from start of pauseVideo to start of next function
  content = content.replace(
    /\/\/\s*Pause Kinescope Video Player[\s\S]*?function pauseVideo\(\)[\s\S]*?const audios = document\.querySelectorAll\('audio'\);[\s\S]*?(\n\s*function|\n\s*window\.addEventListener|\n\s*\/\/|\n\s*const)/,
    exactCleanPause + "\n\n$1"
  );
  
  fs.writeFileSync(f, content, "utf8");
});

console.log("Applied exact clean syntax fix!");
