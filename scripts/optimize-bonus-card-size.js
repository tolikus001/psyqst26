const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// Update CSS styles for harmonious mobile sizing
const styleRegex = /<style>\s*\.bonuses-grid[\s\S]*?<\/style>/;

const optimizedStyle = `<style>
    .bonuses-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px;
      margin-bottom: 20px;
    }
    @media (min-width: 480px) {
      .bonuses-grid {
        gap: 14px;
      }
    }
    .bonus-card-premium {
      position: relative;
      background: #1B2832;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(36, 49, 57, 0.12);
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: left;
      aspect-ratio: 1 / 1.08;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 640px) {
      .bonus-card-premium {
        aspect-ratio: 1 / 1.05;
      }
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 12px 28px rgba(36, 49, 57, 0.2);
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
      height: 100%;
      flex: 1;
      padding: 12px 10px 12px 10px;
      background: linear-gradient(180deg, rgba(14, 31, 46, 0.05) 0%, rgba(14, 31, 46, 0.45) 35%, rgba(14, 31, 46, 0.94) 100%);
      box-sizing: border-box;
    }
    .bonus-card-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: auto;
    }
    .bonus-card-title {
      font-size: 13.5px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.2;
      margin: 0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      letter-spacing: -0.1px;
    }
    .bonus-card-desc {
      font-size: 10.5px;
      line-height: 1.3;
      color: rgba(255, 255, 255, 0.88);
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  </style>`;

html = html.replace(styleRegex, optimizedStyle);
fs.writeFileSync(bonusesFilePath, html, "utf8");

console.log("Successfully optimized bonus card sizing for mobile in 09_bonuses.html!");
