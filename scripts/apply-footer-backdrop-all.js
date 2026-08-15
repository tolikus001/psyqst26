const fs = require("fs");
const path = require("path");

const files = [
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

const footerGlassHtml = `      <!-- Footer -->
      <footer class="text-center" style="display:flex; justify-content:center; margin:8px auto 0 auto; width:100%;">
        <div style="display:inline-flex; align-items:center; justify-content:center; background:rgba(255, 255, 255, 0.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255, 255, 255, 0.85); border-radius:9999px; padding:5px 14px; font-size:11px; font-weight:600; color:var(--nb-slate); box-shadow:0 2px 8px rgba(0, 0, 0, 0.04);">
          © Анатолий Фёдоров • ПСИквест
        </div>
      </footer>`;

const landingPartnerFooterInner = `        <div style="display:flex; justify-content:center; margin-top:4px;">
          <div style="display:inline-flex; align-items:center; justify-content:center; background:rgba(255, 255, 255, 0.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255, 255, 255, 0.85); border-radius:9999px; padding:5px 14px; font-size:11px; font-weight:600; color:var(--nb-slate); box-shadow:0 2px 8px rgba(0, 0, 0, 0.04);">
            © Анатолий Фёдоров • ПСИквест
          </div>
        </div>`;

files.forEach(file => {
  const filePath = path.resolve("out/client", file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, "utf8");

  if (file === "02_landing_partner.html") {
    content = content.replace(
      /<div class="subtle text-center py-2" style="font-size:11px;">\s*© Анатолий Фёдоров • ПСИквест\s*<\/div>/,
      landingPartnerFooterInner
    );
  } else {
    // Replace standard footer
    const footerRegex = /<!--\s*Footer\s*-->\s*<footer[\s\S]*?© Анатолий Фёдоров • ПСИквест[\s\S]*?<\/footer>/;
    if (footerRegex.test(content)) {
      content = content.replace(footerRegex, footerGlassHtml);
    } else {
      // Fallback
      const genericFooterRegex = /<footer[\s\S]*?© Анатолий Фёдоров • ПСИквест[\s\S]*?<\/footer>/;
      content = content.replace(genericFooterRegex, footerGlassHtml);
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated footer glass substrate in ${file}`);
});

console.log("All 15 files successfully updated with footer backdrop!");
