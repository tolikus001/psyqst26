const fs = require("fs");
const path = require("path");

const apiConfigContent = fs.readFileSync("out/client/api-config.js", "utf8");
const apiConfigTag = "<script>\n" + apiConfigContent + "\n</script>";

const files = ["09_bonuses.html", "10_bonus1.html", "11_bonus2.html", "12_bonus3.html", "13_bonus4.html", "14_individual_offer.html"];

files.forEach(f => {
  const p = path.join("out/client", f);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("Unified API & Media Connector")) {
    c = c.replace("</head>", apiConfigTag + "\n</head>");
  }
  
  c = c.replace(/<main class="page-container py-3">/g, '<main class="app-shell"><div class="app" style="max-width:620px; width:100%;">');
  c = c.replace(/<div class="content-wrapper"[^>]*>/g, '<div style="display:flex; flex-direction:column; gap:16px; width:100%;">');
  
  fs.writeFileSync(p, c, "utf8");
  console.log("Injected API config and fixed layout for:", f);
});
