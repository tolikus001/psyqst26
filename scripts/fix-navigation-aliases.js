const fs = require("fs");
const path = require("path");

const clientDir = path.resolve("out/client");
const files = [
  "03_lesson1.html",
  "04_lesson2.html",
  "05_lesson3.html",
  "06_lesson4.html",
  "07_lesson5.html"
];

files.forEach(f => {
  const filePath = path.join(clientDir, f);
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, "utf8");

  const navCode = `
    // Seamless Screen Transitions (Aliases for full backwards compatibility)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }
`;

  // Inject or replace screen transition block
  if (html.includes("function goToVideo()")) {
    html = html.replace(/function goToVideo\(\)[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/, navCode);
  } else if (html.includes("function goToStep1()")) {
    html = html.replace(/function goToStep1\(\)[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/, navCode);
  } else {
    html = html.replace("<script>", "<script>\n" + navCode);
  }

  // Ensure button onclick matches
  html = html.replace(/onclick="goToStep1\(\)"/g, 'onclick="goToVideo()"');
  html = html.replace(/onclick="goToStep2\(\)"/g, 'onclick="goToPractice()"');
  html = html.replace(/onclick="goToInteractive\(\)"/g, 'onclick="goToPractice()"');

  fs.writeFileSync(filePath, html, "utf8");
  console.log(`Updated screen transition navigation in ${f}`);
});

console.log("Successfully updated all screen transition navigation!");
