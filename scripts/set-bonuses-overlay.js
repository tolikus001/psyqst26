const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 1. Generate clean base64 data for all 4 bonuses
const base64Map = {};

for (let i = 1; i <= 4; i++) {
  const inPng = path.resolve(`out/client/bonus${i}.png`);
  const outJpg = path.resolve(`out/client/bonus${i}.jpg`);
  
  execSync(`sips -s format jpeg -s formatOptions 75 --resampleWidth 440 "${inPng}" --out "${outJpg}"`);
  const buf = fs.readFileSync(outJpg);
  const b64 = `data:image/jpeg;base64,${buf.toString("base64")}`;
  base64Map[`bonus${i}`] = b64;
}

// 2. Read 09_bonuses.html
const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// 3. Update CSS styling for text on picture overlay
const styleRegex = /<style>\s*\.bonuses-grid[\s\S]*?<\/style>/;

const overlayStyle = `<style>
    .bonuses-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 12px;
      margin-bottom: 20px;
    }
    @media (min-width: 640px) {
      .bonuses-grid {
        gap: 16px;
      }
    }
    .bonus-card-premium {
      position: relative;
      background: #1B2832;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 18px;
      box-shadow: 0 8px 24px rgba(36, 49, 57, 0.12);
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: left;
      min-height: 220px;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 640px) {
      .bonus-card-premium {
        min-height: 250px;
      }
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 14px 34px rgba(36, 49, 57, 0.22);
      border-color: rgba(217, 131, 78, 0.7);
    }
    .bonus-card-premium:active {
      transform: scale(0.98);
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
      justify-content: space-between;
      height: 100%;
      flex: 1;
      padding: 12px 12px 14px 12px;
      background: linear-gradient(180deg, rgba(14, 31, 46, 0.4) 0%, rgba(14, 31, 46, 0.65) 45%, rgba(14, 31, 46, 0.95) 100%);
      box-sizing: border-box;
    }
    .bonus-card-badge {
      display: inline-flex;
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.92);
      color: var(--nb-deep);
      border: 1px solid rgba(217, 131, 78, 0.4);
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.2px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
    .bonus-card-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: auto;
    }
    .bonus-card-title {
      font-size: 13px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.25;
      margin: 0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }
    .bonus-card-desc {
      font-size: 10.5px;
      line-height: 1.35;
      color: rgba(255, 255, 255, 0.88);
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
  </style>`;

html = html.replace(styleRegex, overlayStyle);

// 4. Construct clean 2x2 grid with text OVERLAID on image
const overlayGridHtml = `      <!-- 4 Bonus Cards (2 rows x 2 columns: text ON image, clickable cards) -->
      <div class="bonuses-grid">

        <!-- Bonus 1 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('10_bonus1.html'); return false;" class="bonus-card-premium">
          <img src="${base64Map.bonus1}" alt="Если написал человек из прошлого" class="bonus-card-bg-img" />
          <div class="bonus-card-overlay">
            <div class="bonus-card-badge">Бонус 1</div>
            <div class="bonus-card-content">
              <h3 class="bonus-card-title">Если написал человек из прошлого</h3>
              <p class="bonus-card-desc">
                Пять готовых ответов, которые помогут сохранить границу и не вернуться в прежний сценарий.
              </p>
            </div>
          </div>
        </a>

        <!-- Bonus 2 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('11_bonus2.html'); return false;" class="bonus-card-premium">
          <img src="${base64Map.bonus2}" alt="Экстренное заземление за 2 минуты" class="bonus-card-bg-img" />
          <div class="bonus-card-overlay">
            <div class="bonus-card-badge">Бонус 2</div>
            <div class="bonus-card-content">
              <h3 class="bonus-card-title">Экстренное заземление за 2 минуты</h3>
              <p class="bonus-card-desc">
                Техника переключения внимания из тревоги в тело, когда накрывают эмоции.
              </p>
            </div>
          </div>
        </a>

        <!-- Bonus 3 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('12_bonus3.html'); return false;" class="bonus-card-premium">
          <img src="${base64Map.bonus3}" alt="Как завершить общение без чувства вины" class="bonus-card-bg-img" />
          <div class="bonus-card-overlay">
            <div class="bonus-card-badge">Бонус 3</div>
            <div class="bonus-card-content">
              <h3 class="bonus-card-title">Как завершить общение без чувства вины</h3>
              <p class="bonus-card-desc">
                Алгоритм экологичного выхода из контакта, который перестал быть безопасным.
              </p>
            </div>
          </div>
        </a>

        <!-- Bonus 4 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('13_bonus4.html'); return false;" class="bonus-card-premium">
          <img src="${base64Map.bonus4}" alt="Чек-лист нового знакомства" class="bonus-card-bg-img" />
          <div class="bonus-card-overlay">
            <div class="bonus-card-badge">Бонус 4</div>
            <div class="bonus-card-content">
              <h3 class="bonus-card-title">Чек-лист нового знакомства</h3>
              <p class="bonus-card-desc">
                Семь маркеров в поведении партнера, на которые стоит обратить внимание на первых встречах.
              </p>
            </div>
          </div>
        </a>

      </div>`;

// Replace from the beginning of bonuses-grid up to the individual offer section
const fullGridAreaRegex = /<!--\s*4.*?Bonus Cards[\s\S]*?(?=<!-- Dedicated Individual Offer Card)/;
html = html.replace(fullGridAreaRegex, overlayGridHtml + "\n\n      ");

fs.writeFileSync(bonusesFilePath, html, "utf8");

console.log("Successfully updated 09_bonuses.html: text overlaid ON image, full card clickable!");
