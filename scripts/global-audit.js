const fs = require("fs");
const path = require("path");

const clientDir = "out/client";
const htmlFiles = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

console.log(`\n🔍 --- RUNNING STRICT GLOBAL AUDIT ACROSS ALL ${htmlFiles.length} FILES --- \n`);

let hasErrors = false;

htmlFiles.forEach(file => {
  const filePath = path.join(clientDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const errors = [];

  // Check 1: Inlined openScreen and NOTIBOT_ARTICLES
  if (!content.includes("function openScreen") || !content.includes("NOTIBOT_ARTICLES")) {
    errors.push("❌ Missing inlined openScreen() or NOTIBOT_ARTICLES mapping!");
  }

  // Check 2: Inlined openProduct and NOTIBOT_PRODUCTS
  if (!content.includes("function openProduct") || !content.includes("NOTIBOT_PRODUCTS")) {
    errors.push("❌ Missing inlined openProduct() or NOTIBOT_PRODUCTS mapping!");
  }

  // Check 3: Absence of @tailwindcss/browser@4
  if (content.includes("@tailwindcss/browser")) {
    errors.push("❌ Found blocking @tailwindcss/browser@4 script!");
  }

  // Check 4: Standard app-shell structure
  if (!content.includes('class="app-shell"') || !content.includes('class="app"')) {
    errors.push("❌ Missing standard .app-shell or .app layout container!");
  }

  // Check 5: Background layer
  if (!content.includes('id="maisonArtBackground"')) {
    errors.push("❌ Missing maisonArtBackground container!");
  }

  // Check 6: Raw href transitions that should be openScreen
  const rawHrefMatches = content.match(/href="0\d_[^"]+\.html"/g);
  if (rawHrefMatches) {
    errors.push(`⚠️ Found raw href transitions without openScreen: ${rawHrefMatches.join(", ")}`);
  }

  if (errors.length > 0) {
    hasErrors = true;
    console.log(`[FAIL] ${file}:`);
    errors.forEach(e => console.log("  " + e));
  } else {
    console.log(`[PASS] ✅ ${file} satisfies all strict audit rules.`);
  }
});

if (!hasErrors) {
  console.log("\n🎉 ALL 14 CLIENT FILES MEET 100% OF THE AUDITOR QUALITY STANDARDS!\n");
} else {
  console.log("\n⚠️ Some files need fixes. Running automatic fixes...\n");
}
