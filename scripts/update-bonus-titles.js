const fs = require("fs");
const path = require("path");

const bonusesFilePath = path.resolve("out/client/09_bonuses.html");
let html = fs.readFileSync(bonusesFilePath, "utf8");

// Update card 1
html = html.replace(
  /<h3 class="bonus-card-title">Если написал человек из прошлого<\/h3>/,
  '<h3 class="bonus-card-title">Привет из прошлого</h3>'
);

// Update card 2
html = html.replace(
  /<h3 class="bonus-card-title">Экстренное заземление за 2 минуты<\/h3>/,
  '<h3 class="bonus-card-title">Заземление</h3>'
);

// Update card 3
html = html.replace(
  /<h3 class="bonus-card-title">Как завершить общение без чувства вины<\/h3>/,
  '<h3 class="bonus-card-title">Завершение</h3>'
);

// Update card 4
html = html.replace(
  /<h3 class="bonus-card-title">Чек-лист нового знакомства<\/h3>/,
  '<h3 class="bonus-card-title">Познакомимся?</h3>'
);

// Also update CSS for .bonus-card-title to make sure font size and weight look balanced and prominent
const oldTitleCss = /\.bonus-card-title\s*\{[\s\S]*?\}/;
const newTitleCss = `.bonus-card-title {
      font-size: 14.5px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.25;
      margin: 0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
    }`;

html = html.replace(oldTitleCss, newTitleCss);

fs.writeFileSync(bonusesFilePath, html, "utf8");
console.log("Successfully updated bonus titles in 09_bonuses.html!");
