const fs = require("fs");
const path = require("path");

const landingPath = path.resolve("out/client/02_landing_partner.html");
let html = fs.readFileSync(landingPath, "utf8");

// Add pauseVideo to 02_landing_partner.html
const pauseVideoFn = `
    // Pause Kinescope Video Player & Other Audios
    function pauseVideo() {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'pause', command: 'pause' }), '*');
            iframe.contentWindow.postMessage({ type: 'pause', command: 'pause' }, '*');
            iframe.contentWindow.postMessage({ event: 'command', command: 'pause' }, '*');
            iframe.contentWindow.postMessage('{"method":"pause"}', '*');
          } catch(e) {}
        }
      });
      const audios = document.querySelectorAll('audio');
      audios.forEach(a => { try { a.pause(); } catch(e){} });
    }

    window.addEventListener('pagehide', pauseVideo);
    window.addEventListener('beforeunload', pauseVideo);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) pauseVideo();
    });

    document.addEventListener('DOMContentLoaded', function() {
      const audioEl = document.querySelector('audio');
      if (audioEl) {
        audioEl.addEventListener('play', function() {
          pauseVideo();
        });
      }
    });
`;

if (!html.includes("function pauseVideo()")) {
  html = html.replace("<script>", "<script>" + pauseVideoFn);
  fs.writeFileSync(landingPath, html, "utf8");
  console.log("Successfully added pauseVideo to 02_landing_partner.html");
}
