const fs = require("fs");
const path = require("path");

const apiConfigContent = fs.readFileSync("out/client/api-config.js", "utf8");
const apiConfigTag = "<script>\n" + apiConfigContent + "\n</script>";

const clientDir = "out/client";
const htmlFiles = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

htmlFiles.forEach(file => {
  const p = path.join(clientDir, file);
  let c = fs.readFileSync(p, "utf8");

  // 1. Ensure API config inlined
  if (!c.includes("Unified API & Media Connector")) {
    c = c.replace("</head>", apiConfigTag + "\n</head>");
  }

  // 2. Fix raw hrefs in bonuses and lessons
  c = c.replace(/href="09_bonuses\.html"\s+onclick="safeNavigate\('09_bonuses\.html'\);/g, 'href="javascript:void(0);" onclick="safeHaptic(\x27selection\x27); openScreen(\x2709_bonuses.html\x27);');
  c = c.replace(/onclick="safeNavigate\('09_bonuses\.html'\)"/g, 'onclick="safeHaptic(\x27selection\x27); openScreen(\x2709_bonuses.html\x27);"');

  // 3. Remove any remaining @tailwindcss/browser
  c = c.replace(/<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/@tailwindcss\/browser@4"><\/script>\s*/g, "");

  fs.writeFileSync(p, c, "utf8");
});

console.log("Fixed all audit issues across all files!");
