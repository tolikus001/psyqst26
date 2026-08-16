const fs = require("fs");
const path = require("path");

const lesson3Path = path.resolve("out/client/05_lesson3.html");
let html = fs.readFileSync(lesson3Path, "utf8");

// Ensure iframe has id
html = html.replace(
  /<iframe src="https:\/\/kinescope\.io\/embed\/qYx9t8Hu9S4rEquGxYBMyP\?max_quality=720"/g,
  '<iframe id="lesson3VideoIframe" src="https://kinescope.io/embed/qYx9t8Hu9S4rEquGxYBMyP?max_quality=720"'
);

// Update script to include pauseVideo, pagehide/visibilitychange listeners, and audio play listener
const newScript = `<script>
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
    }

    function safeNavigate(url) {
      safeHaptic('selection');
      pauseVideo();
      setTimeout(function() {
        openScreen(url);
      }, 30);
    }

    window.addEventListener('pagehide', pauseVideo);
    window.addEventListener('beforeunload', pauseVideo);
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) pauseVideo();
    });

    document.addEventListener('DOMContentLoaded', function() {
      const audioEl = document.getElementById('meditationAudio3');
      if (audioEl) {
        // Automatically pause video when meditation audio starts playing
        audioEl.addEventListener('play', function() {
          pauseVideo();
        });

        const fallbacks = [
          'https://inter01-anatolyfedorov.amvera.io/data/meditation2.mp3',
          'https://inter01-anatolyfedorov.amvera.io/data/meditation_audio.MP3',
          'https://inter01-anatolyfedorov.amvera.io/data/meditation3.mp3',
          'https://inter01-anatolyfedorov.amvera.io/data/meditation1-3.MP3'
        ];
        let fallbackIndex = 0;
        audioEl.addEventListener('error', function() {
          if (fallbackIndex < fallbacks.length) {
            const nextUrl = fallbacks[fallbackIndex++];
            console.log('[Audio] Trying fallback URL:', nextUrl);
            audioEl.src = nextUrl;
            audioEl.load();
          }
        }, true);
      }
    });
  </script>`;

html = html.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>\s*<\/body>/, newScript + '\n</body>');

fs.writeFileSync(lesson3Path, html, "utf8");
console.log("Successfully added pauseVideo and auto-pause on audio-play to 05_lesson3.html!");
