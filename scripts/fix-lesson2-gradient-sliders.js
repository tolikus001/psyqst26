const fs = require("fs");
const path = require("path");

const sliderCss = `
/* Touch Slider Container & Scale Styling (Green to Red Gradient) */
.touch-slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: #FFFFFF;
  border: 1px solid rgba(14, 31, 46, 0.10);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  margin-bottom: 4px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.slider-val-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  padding: 3px 10px;
  border-radius: 9999px;
  background: #2F7D59;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(47, 125, 89, 0.3);
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.scale-labels {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-size: 12px;
  font-weight: 600;
  margin: 2px 0 4px 0;
  width: 100%;
}

.scale-labels span:first-child {
  color: #2F7D59 !important;
  text-align: left !important;
  flex: 1;
}

.scale-labels span:last-child {
  color: #B42318 !important;
  text-align: right !important;
  flex: 1;
}

/* Custom Gradient Slider Track (Green -> Amber -> Red) */
.touch-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 9999px;
  background: linear-gradient(to right, #2F7D59 0%, #E59A5A 50%, #B42318 100%) !important;
  outline: none;
  margin: 6px 0;
  cursor: pointer;
}

/* Chrome, Safari, Edge Thumb */
.touch-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3.5px solid var(--nb-deep);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.touch-range::-webkit-slider-thumb:hover,
.touch-range::-webkit-slider-thumb:active {
  transform: scale(1.18);
}

/* Firefox Thumb */
.touch-range::-moz-range-thumb {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3.5px solid var(--nb-deep);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}

/* Firefox Track */
.touch-range::-moz-range-track {
  height: 10px;
  border-radius: 9999px;
  background: linear-gradient(to right, #2F7D59 0%, #E59A5A 50%, #B42318 100%) !important;
  border: none;
}

.slider-ticks {
  display: flex !important;
  justify-content: space-between !important;
  font-size: 11px;
  font-weight: 600;
  color: var(--nb-slate);
  padding: 0 2px;
  width: 100%;
}
`;

// 1. Add to theme.css
const themeCssPath = path.resolve("out/client/theme.css");
let themeCss = fs.readFileSync(themeCssPath, "utf8");
if (!themeCss.includes(".touch-slider-container {")) {
  themeCss += "\n" + sliderCss;
  fs.writeFileSync(themeCssPath, themeCss, "utf8");
  console.log("Added slider styles to theme.css");
}

// 2. Add to 04_lesson2.html inlined theme & update interpolation logic
const lesson2Path = path.resolve("out/client/04_lesson2.html");
let lesson2Html = fs.readFileSync(lesson2Path, "utf8");

if (!lesson2Html.includes(".touch-slider-container {")) {
  lesson2Html = lesson2Html.replace("</style>", sliderCss + "\n</style>");
}

// Ensure color interpolation is perfectly tuned: Green (#2F7D59) -> Amber (#E59A5A) -> Red (#B42318)
const oldInterpolate = /function interpolateColor\(percent\) \{[\s\S]*?return `rgb\(\$\{r\}, \$\{g\}, \$\{b\}\)`;\s*\}/;

const newInterpolate = `function interpolateColor(percent) {
      const t = Math.max(0, Math.min(100, percent)) / 100;
      let r, g, b;
      if (t < 0.5) {
        const factor = t / 0.5;
        r = Math.round(47 + (229 - 47) * factor);
        g = Math.round(125 + (154 - 125) * factor);
        b = Math.round(89 + (90 - 89) * factor);
      } else {
        const factor = (t - 0.5) / 0.5;
        r = Math.round(229 + (180 - 229) * factor);
        g = Math.round(154 + (35 - 154) * factor);
        b = Math.round(90 + (24 - 90) * factor);
      }
      return \`rgb(\${r}, \${g}, \${b})\`;
    }`;

lesson2Html = lesson2Html.replace(oldInterpolate, newInterpolate);

fs.writeFileSync(lesson2Path, lesson2Html, "utf8");
console.log("Successfully updated Lesson 2 sliders to green-to-red gradient!");
