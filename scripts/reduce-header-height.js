const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// Compact the header section by 20%
const oldHeaderRegex = /<!-- Main Header Section[\s\S]*?<\/section>/;

const newHeader = `<!-- Main Header Section (Compact -20% height) -->
      <section class="glass card text-center" style="max-width: 440px; width: 100%; margin: 0 auto; padding: 8px 16px; border-radius: 16px; box-sizing: border-box;">
        <div class="eyebrow" style="margin-bottom: 2px; font-size: 10.5px; padding: 1px 8px; display: inline-flex; line-height: 1.2;">
          🎁 Материалы курса
        </div>
        <h1 style="font-size: 17px; font-weight: 900; color: var(--nb-deep); margin-bottom: 2px; line-height: 1.15;">
          Ваши бонусы
        </h1>
        <p class="lead" style="font-size: 11.5px; line-height: 1.35; color: var(--nb-slate); margin: 0 auto; max-width: 380px;">
          Четыре практических инструмента, которые помогут сохранить новый сценарий в реальных ситуациях.
        </p>
      </section>`;

html = html.replace(oldHeaderRegex, newHeader);

// Also slightly reduce gap in parent container from 16px to 12px for seamless balance
html = html.replace(
  /<div style="display:flex; flex-direction:column; gap:16px; width:100%;">/,
  '<div style="display:flex; flex-direction:column; gap:12px; width:100%;">'
);

fs.writeFileSync(bonusesFilePath, html, "utf8");
console.log("Successfully reduced header section height by 20% in 09_bonuses.html!");
