const fs = require("fs");
const path = require("path");

const lesson4Path = path.resolve("out/client/06_lesson4.html");
let html = fs.readFileSync(lesson4Path, "utf8");

// 1. Fix Kinescope Video ID from naNZuQTimmoFoUCi38tSJA to 5F77yK6x7j21aVjN2WUSX4
html = html.replace(
  /https:\/\/kinescope\.io\/embed\/naNZuQTimmoFoUCi38tSJA\?max_quality=720/g,
  "https://kinescope.io/embed/5F77yK6x7j21aVjN2WUSX4?max_quality=720"
);

// 2. Fix onclick for Practice button
html = html.replace(
  /<button onclick="goToPractice\(\)" class="secondary-btn"/g,
  '<button onclick="goToInteractive()" class="secondary-btn"'
);

// 3. Add alias in JS: window.goToPractice = goToInteractive
html = html.replace(
  /function goToInteractive\(\) \{/,
  `function goToPractice() {\n      goToInteractive();\n    }\n    window.goToPractice = goToPractice;\n\n    function goToInteractive() {`
);

fs.writeFileSync(lesson4Path, html, "utf8");
console.log("Successfully fixed Lesson 4 video and practice button!");
