const fs = require("fs");
const path = require("path");

const optionChipCss = `
/* Option Chips for Interactive Practices (Lesson 4, Quizzes, etc.) */
.option-chip {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 16px;
  border: 1px solid rgba(14, 31, 46, 0.10);
  background: #FFFFFF;
  color: var(--nb-text);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.option-chip:hover {
  border-color: rgba(18, 68, 83, 0.28);
  box-shadow: 0 6px 18px rgba(14, 31, 46, 0.05);
}

.option-chip.selected {
  border-color: var(--nb-sea) !important;
  background: rgba(18, 68, 83, 0.07) !important;
  box-shadow: 0 8px 22px rgba(18, 68, 83, 0.10) !important;
  color: var(--nb-deep) !important;
  font-weight: 700 !important;
}

.check-circle {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  border-radius: 6px;
  border: 2px solid rgba(14, 31, 46, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  background: #FFFFFF;
}

.option-chip.selected .check-circle {
  border-color: var(--nb-sea) !important;
  background: var(--nb-sea) !important;
}

.option-chip.selected .check-circle:after {
  content: "";
  width: 8px;
  height: 4px;
  border-left: 2px solid #FFFFFF;
  border-bottom: 2px solid #FFFFFF;
  transform: rotate(-45deg) translateY(-1px);
}
`;

// 1. Update theme.css
const themeCssPath = path.resolve("out/client/theme.css");
let themeCss = fs.readFileSync(themeCssPath, "utf8");
if (!themeCss.includes(".option-chip {")) {
  themeCss += "\n" + optionChipCss;
  fs.writeFileSync(themeCssPath, themeCss, "utf8");
  console.log("Added .option-chip styles to theme.css");
}

// 2. Update all client HTML files with inlined theme
const clientDir = path.resolve("out/client");
const htmlFiles = fs.readdirSync(clientDir).filter(f => f.endsWith(".html"));

htmlFiles.forEach(file => {
  const filePath = path.join(clientDir, file);
  let html = fs.readFileSync(filePath, "utf8");
  
  if (html.includes("<style id=\"inlined-theme\">") && !html.includes(".option-chip {")) {
    html = html.replace("</style>", optionChipCss + "\n</style>");
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`Inlined .option-chip styles into ${file}`);
  }
});

console.log("Successfully updated all option-chip styles!");
