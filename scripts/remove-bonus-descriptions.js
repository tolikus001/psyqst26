const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// Remove all <p class="bonus-card-desc">...</p> elements
html = html.replace(/\s*<p class="bonus-card-desc">[\s\S]*?<\/p>/g, "");

// Update styles for titles-only cards
const styleRegex = /<style>\s*\.bonuses-grid[\s\S]*?<\/style>/;

const cleanTitleStyle = `<style>
    .bonuses-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px;
      margin-bottom: 20px;
    }
    @media (min-width: 480px) {
      .bonuses-grid {
        gap: 16px;
      }
    }
    .bonus-card-premium {
      position: relative;
      background: #1B2832;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 18px;
      box-shadow: 0 8px 24px rgba(36, 49, 57, 0.12);
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: center;
      aspect-ratio: 1 / 1;
      display: flex;
      flex-direction: column;
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 14px 32px rgba(36, 49, 57, 0.22);
      border-color: rgba(217, 131, 78, 0.7);
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
      padding: 14px 10px;
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
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
      margin: 0;
      text-align: center;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.85);
      letter-spacing: -0.2px;
    }
    @media (min-width: 480px) {
      .bonus-card-title {
        font-size: 15px;
      }
    }
  </style>`;

html = html.replace(styleRegex, cleanTitleStyle);
fs.writeFileSync(bonusesFilePath, html, "utf8");

console.log("Successfully removed all descriptions, keeping only titles on bonus cards in 09_bonuses.html!");
