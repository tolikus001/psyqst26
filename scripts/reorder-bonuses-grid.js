const fs = require('fs');
const path = require('path');

const bonusesFilePath = path.join(__dirname, '..', 'out', 'client', '09_bonuses.html');
let content = fs.readFileSync(bonusesFilePath, 'utf8');

// 1. Update CSS styles for bonuses-grid and bonus-card-premium
const oldStyleRegex = /<style>\s*\.bonuses-grid[\s\S]*?<\/style>/;

const newStyle = `<style>
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
      background: #FFFFFF;
      border: 1px solid rgba(36, 49, 57, 0.1);
      border-radius: 18px;
      box-shadow: 0 8px 24px rgba(36, 49, 57, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      text-align: left;
      height: 100%;
    }
    .bonus-card-premium:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 32px rgba(36, 49, 57, 0.14);
      border-color: rgba(217, 131, 78, 0.45);
    }
    .bonus-card-premium:active {
      transform: scale(0.98);
    }
    .bonus-card-body {
      padding: 14px 14px 12px 14px;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 6px;
    }
    .bonus-card-badge {
      display: inline-flex;
      align-self: flex-start;
      background: rgba(217, 131, 78, 0.12);
      color: var(--nb-terracotta);
      border: 1px solid rgba(217, 131, 78, 0.25);
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
      margin-bottom: 2px;
    }
    .bonus-card-title {
      font-size: 13.5px;
      font-weight: 800;
      color: var(--nb-deep);
      line-height: 1.3;
      margin: 0;
    }
    .bonus-card-desc {
      font-size: 11.5px;
      line-height: 1.4;
      color: var(--nb-slate);
      margin: 0;
      flex: 1;
    }
    .bonus-card-link {
      font-size: 12px;
      font-weight: 800;
      color: var(--nb-terracotta);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }
    .bonus-card-premium:hover .bonus-card-link {
      text-decoration: underline;
    }
    .bonus-card-img-wrap {
      position: relative;
      width: 100%;
      height: 130px;
      overflow: hidden;
      background: #1B2832;
      border-bottom-left-radius: 17px;
      border-bottom-right-radius: 17px;
    }
    @media (min-width: 640px) {
      .bonus-card-img-wrap {
        height: 160px;
      }
    }
    .bonus-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: transform 0.35s ease;
    }
    .bonus-card-premium:hover .bonus-card-img {
      transform: scale(1.05);
    }
  </style>`;

content = content.replace(oldStyleRegex, newStyle);

// 2. Extract the base64 images from content
const imgMatches = content.match(/<img src="(data:image\/jpeg;base64,[^"]+)"/g);
if (!imgMatches || imgMatches.length < 4) {
  console.error("Could not find all 4 base64 images!");
  process.exit(1);
}

const img1 = imgMatches[0].match(/src="([^"]+)"/)[1];
const img2 = imgMatches[1].match(/src="([^"]+)"/)[1];
const img3 = imgMatches[2].match(/src="([^"]+)"/)[1];
const img4 = imgMatches[3].match(/src="([^"]+)"/)[1];

// 3. Reconstruct the 2x2 grid HTML with text ABOVE the image
const newGridHtml = `      <!-- 4 Bonus Cards (2 rows x 2 columns: text ABOVE image) -->
      <div class="bonuses-grid">

        <!-- Bonus 1 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('10_bonus1.html'); return false;" class="bonus-card-premium">
          <div class="bonus-card-body">
            <div class="bonus-card-badge">Бонус 1</div>
            <h3 class="bonus-card-title">Если написал человек из прошлого</h3>
            <p class="bonus-card-desc">
              Пять готовых ответов, которые помогут сохранить границу и не вернуться в прежний сценарий.
            </p>
            <div class="bonus-card-link">
              Открыть бонус →
            </div>
          </div>
          <div class="bonus-card-img-wrap">
            <img src="${img1}" alt="Если написал человек из прошлого" class="bonus-card-img" />
          </div>
        </a>

        <!-- Bonus 2 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('11_bonus2.html'); return false;" class="bonus-card-premium">
          <div class="bonus-card-body">
            <div class="bonus-card-badge">Бонус 2</div>
            <h3 class="bonus-card-title">Экстренное заземление за 2 минуты</h3>
            <p class="bonus-card-desc">
              Техника переключения внимания из тревоги в тело, когда накрывают эмоции.
            </p>
            <div class="bonus-card-link">
              Открыть бонус →
            </div>
          </div>
          <div class="bonus-card-img-wrap">
            <img src="${img2}" alt="Экстренное заземление за 2 минуты" class="bonus-card-img" />
          </div>
        </a>

        <!-- Bonus 3 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('12_bonus3.html'); return false;" class="bonus-card-premium">
          <div class="bonus-card-body">
            <div class="bonus-card-badge">Бонус 3</div>
            <h3 class="bonus-card-title">Как завершить общение без чувства вины</h3>
            <p class="bonus-card-desc">
              Алгоритм экологичного выхода из контакта, который перестал быть безопасным.
            </p>
            <div class="bonus-card-link">
              Открыть бонус →
            </div>
          </div>
          <div class="bonus-card-img-wrap">
            <img src="${img3}" alt="Как завершить общение без чувства вины" class="bonus-card-img" />
          </div>
        </a>

        <!-- Bonus 4 -->
        <a href="javascript:void(0);" onclick="safeHaptic('selection'); openScreen('13_bonus4.html'); return false;" class="bonus-card-premium">
          <div class="bonus-card-body">
            <div class="bonus-card-badge">Бонус 4</div>
            <h3 class="bonus-card-title">Чек-лист нового знакомства</h3>
            <p class="bonus-card-desc">
              Семь маркеров в поведении партнера, на которые стоит обратить внимание на первых встречах.
            </p>
            <div class="bonus-card-link">
              Открыть бонус →
            </div>
          </div>
          <div class="bonus-card-img-wrap">
            <img src="${img4}" alt="Чек-лист нового знакомства" class="bonus-card-img" />
          </div>
        </a>

      </div>`;

const gridRegex = /<!-- 4 Large Bonus Cards with Crystal Illustrations[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(gridRegex, newGridHtml + "\n");

fs.writeFileSync(bonusesFilePath, content, 'utf8');
console.log("Successfully reorganized 09_bonuses.html to 2x2 grid with text ABOVE images!");
