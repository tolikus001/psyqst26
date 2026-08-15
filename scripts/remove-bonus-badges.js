const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// Remove the badge HTML elements
html = html.replace(/\s*<div class="bonus-card-badge">Бонус \d+<\/div>/g, "");

// Update the overlay CSS so text sits neatly at the bottom
const oldOverlayCss = /\.bonus-card-overlay\s*\{[\s\S]*?\}/;
const newOverlayCss = `.bonus-card-overlay {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 100%;
      flex: 1;
      padding: 14px 12px 14px 12px;
      background: linear-gradient(180deg, rgba(14, 31, 46, 0.1) 0%, rgba(14, 31, 46, 0.55) 40%, rgba(14, 31, 46, 0.95) 100%);
      box-sizing: border-box;
    }`;

html = html.replace(oldOverlayCss, newOverlayCss);

fs.writeFileSync(bonusesFilePath, html, "utf8");
console.log("Successfully removed bonus badges from 09_bonuses.html!");
