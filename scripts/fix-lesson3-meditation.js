const fs = require("fs");
const path = require("path");

const lesson3Path = path.resolve("out/client/05_lesson3.html");
let html = fs.readFileSync(lesson3Path, "utf8");

// 1. Update audio sources
const oldAudioRegex = /<audio id="meditationAudio3"[\s\S]*?<\/audio>/;

const newAudioHtml = `<audio id="meditationAudio3" controls preload="metadata" style="width:100%; accent-color:var(--nb-accent);">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation2.mp3" type="audio/mpeg">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation_audio.MP3" type="audio/mpeg">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation3.mp3" type="audio/mpeg">
            <source src="https://inter01-anatolyfedorov.amvera.io/data/meditation1-3.MP3" type="audio/mpeg">
            <source src="/data/meditation2.mp3" type="audio/mpeg">
            <source src="meditation2.mp3" type="audio/mpeg">
            Ваш браузер не поддерживает аудио.
          </audio>`;

html = html.replace(oldAudioRegex, newAudioHtml);

// 2. Update smart fallback listener in script
const oldScriptRegex = /<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>\s*<\/body>/;

const newScriptHtml = `<script>
    document.addEventListener('DOMContentLoaded', function() {
      const audioEl = document.getElementById('meditationAudio3');
      if (audioEl) {
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
  </script>
</body>`;

html = html.replace(oldScriptRegex, newScriptHtml);

fs.writeFileSync(lesson3Path, html, "utf8");
console.log("Successfully updated Lesson 3 meditation audio URLs and fallback logic!");
