const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const base64Map = {};

for (let i = 1; i <= 4; i++) {
  const inPng = path.resolve(`out/client/bonus${i}.png`);
  const outJpg = path.resolve(`out/client/bonus${i}.jpg`);
  
  execSync(`sips -s format jpeg -s formatOptions 75 --resampleWidth 440 "${inPng}" --out "${outJpg}"`);
  const buf = fs.readFileSync(outJpg);
  const b64 = `data:image/jpeg;base64,${buf.toString("base64")}`;
  base64Map[`bonus${i}`] = b64;
  console.log(`bonus${i}.jpg size: ${(buf.length / 1024).toFixed(1)} KB`);
}

// Now replace in 09_bonuses.html
let html = fs.readFileSync("out/client/09_bonuses.html", "utf8");

html = html.replace(/src="bonus1\.png"[^>]*>/g, `src="${base64Map.bonus1}" alt="Если написал человек из прошлого" class="bonus-card-img" />`);
html = html.replace(/src="bonus2\.png"[^>]*>/g, `src="${base64Map.bonus2}" alt="Экстренное заземление за 2 минуты" class="bonus-card-img" />`);
html = html.replace(/src="bonus3\.png"[^>]*>/g, `src="${base64Map.bonus3}" alt="Как завершить общение без чувства вины" class="bonus-card-img" />`);
html = html.replace(/src="bonus4\.png"[^>]*>/g, `src="${base64Map.bonus4}" alt="Чек-лист нового знакомства" class="bonus-card-img" />`);

fs.writeFileSync("out/client/09_bonuses.html", html, "utf8");
console.log("Successfully inlined all 4 bonus images as high-quality base64 into 09_bonuses.html!");
