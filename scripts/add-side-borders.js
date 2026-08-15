const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// 1. Fix line 886: remove inline max-width:620px so that .app uses standard mobile max-width with safe side padding
html = html.replace(
  /<main class="app-shell"><div class="app" style="max-width:620px; width:100%;">/,
  '<main class="app-shell"><div class="app">'
);

// 2. Update CSS for grid and cards with clear, distinct side borders and margins
const styleRegex = /<style>\s*\.bonuses-grid[\s\S]*?<\/style>/;

const borderedStyle = `<style>
    .bonuses-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px;
      margin: 0 auto 16px auto;
      width: 100%;
      box-sizing: border-box;
      padding: 0 2px;
    }
    @media (min-width: 480px) {
      .bonuses-grid {
        gap: 14px;
      }
    }
    .bonus-card-premium {
      position: relative;
      background: #1B2832;
      border: 1.5px solid rgba(255, 255, 255, 0.55);
      box-shadow: 0 6px 20px rgba(36, 49, 57, 0.14), 0 0 0 1px rgba(36, 49, 57, 0.1);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: center;
      aspect-ratio: 1 / 1;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 12px 28px rgba(36, 49, 57, 0.22), 0 0 0 1px rgba(217, 131, 78, 0.5);
      border-color: rgba(255, 255, 255, 0.85);
    }
    .bonus-card-premium:active {
      transform: scale(0.97);
    }
    .bonus-card-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition: transform 0.4s ease;
      z-index: 1;
    }
    .bonus-card-premium:hover .bonus-card-bg-img {
      transform: scale(1.08);
    }
    .bonus-card-overlay {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      height: 100%;
      flex: 1;
      padding: 12px 8px;
      background: linear-gradient(180deg, rgba(14, 31, 46, 0) 0%, rgba(14, 31, 46, 0.35) 45%, rgba(14, 31, 46, 0.92) 100%);
      box-sizing: border-box;
    }
    .bonus-card-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .bonus-card-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
      margin: 0;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
      letter-spacing: -0.2px;
    }
    @media (min-width: 480px) {
      .bonus-card-title {
        font-size: 14.5px;
      }
    }
  </style>`;

html = html.replace(styleRegex, borderedStyle);
fs.writeFileSync(bonusesFilePath, html, "utf8");

console.log("Successfully added side borders and margins in 09_bonuses.html!");
