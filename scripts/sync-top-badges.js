const fs = require("fs");
const path = require("path");

const files = [
  "theme.css",
  "01_psyquest.html",
  "02_landing_partner.html",
  "03_lesson1.html",
  "04_lesson2.html",
  "05_lesson3.html",
  "06_lesson4.html",
  "07_lesson5.html",
  "08_portrait_quest.html",
  "09_bonuses.html",
  "10_bonus1.html",
  "11_bonus2.html",
  "12_bonus3.html",
  "13_bonus4.html",
  "14_individual_offer.html",
  "index.html"
];

const oldBadgeRegex = /\.strategy-badge\s*\{[\s\S]*?\}/g;

const newBadgeCss = `.strategy-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  color: var(--nb-deep);
  font-weight: 700;
  font-size: 13px;
  margin: 0 auto;
  text-align: center;
}`;

files.forEach(file => {
  const filePath = path.resolve("out/client", file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(oldBadgeRegex, newBadgeCss);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated .strategy-badge in ${file}`);
});

console.log("Successfully synchronized badge background and font color across all files!");
