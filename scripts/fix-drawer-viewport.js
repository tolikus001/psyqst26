const fs = require('fs');
const path = require('path');

const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');

const FIXED_DRAWER_CSS = `
    /* =========================================================
       NAVIGATION HEADER & DRAWER STYLES (VIEWPORT FIXED)
       ========================================================= */
    .header-bar-nav {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      width: 100% !important;
      padding: 4px 0 2px !important;
      box-sizing: border-box !important;
    }

    .header-actions-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .nav-glass-tinted-btn {
      display: inline-flex !important;
      align-items: center !important;
      gap: 7px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      letter-spacing: -0.2px !important;
      color: #A85532 !important;
      background: rgba(196, 115, 79, 0.12) !important;
      backdrop-filter: blur(18px) !important;
      -webkit-backdrop-filter: blur(18px) !important;
      padding: 8px 14px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(196, 115, 79, 0.32) !important;
      box-shadow: 0 4px 14px rgba(196, 115, 79, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      text-decoration: none !important;
      outline: none !important;
    }

    .nav-glass-tinted-btn:hover {
      background: rgba(196, 115, 79, 0.18) !important;
      border-color: rgba(196, 115, 79, 0.45) !important;
      transform: translateY(-1px) !important;
    }

    .nav-glass-tinted-btn:active {
      transform: scale(0.96) translateY(0) !important;
      background: rgba(196, 115, 79, 0.22) !important;
    }

    .next-lesson-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      letter-spacing: -0.2px !important;
      color: #FFFFFF !important;
      background: linear-gradient(135deg, rgba(204, 122, 85, 0.96) 0%, rgba(168, 85, 50, 0.98) 100%) !important;
      padding: 8px 16px !important;
      border-radius: 9999px !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 6px 20px rgba(196, 115, 79, 0.32), inset 0 1px 1.5px rgba(255, 255, 255, 0.55) !important;
      cursor: pointer !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      white-space: nowrap !important;
      text-decoration: none !important;
      outline: none !important;
    }

    .next-lesson-btn:hover {
      background: linear-gradient(135deg, rgba(214, 132, 95, 1) 0%, rgba(178, 95, 60, 1) 100%) !important;
      box-shadow: 0 8px 24px rgba(196, 115, 79, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.7) !important;
      transform: translateY(-1px) !important;
    }

    .next-lesson-btn:active {
      transform: scale(0.96) translateY(0) !important;
    }

    .header-progress-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      padding: 0 2px !important;
    }

    .lesson-badge-sub {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #45656D !important;
    }

    .progress-percent-sub {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: rgba(31, 46, 53, 0.5) !important;
    }

    /* VIEWPORT-FIXED BOTTOM DRAWER STYLES */
    #navDrawerOverlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      z-index: 999999 !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      transition: visibility 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
    }

    #navDrawerOverlay.active {
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    #navDrawerBackdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(15, 23, 28, 0.55) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
    }

    #navDrawerOverlay.active #navDrawerBackdrop {
      opacity: 1 !important;
    }

    #navDrawerPanel {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      max-width: 500px !important;
      margin: 0 auto !important;
      background: rgba(255, 255, 255, 0.98) !important;
      backdrop-filter: blur(28px) !important;
      -webkit-backdrop-filter: blur(28px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.9) !important;
      border-radius: 28px 28px 0 0 !important;
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.28) !important;
      transform: translateY(100%) !important;
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
      display: flex !important;
      flex-direction: column !important;
      max-height: 82vh !important;
      max-height: 82dvh !important;
      height: auto !important;
      overflow: hidden !important;
      z-index: 1000000 !important;
    }

    #navDrawerOverlay.active #navDrawerPanel {
      transform: translateY(0) !important;
    }

    .drawer-handle {
      width: 44px !important;
      height: 4px !important;
      background: rgba(31, 46, 53, 0.2) !important;
      border-radius: 999px !important;
      margin: 10px auto 4px !important;
      cursor: pointer !important;
      flex-shrink: 0 !important;
    }

    .drawer-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 8px 18px 12px !important;
      border-bottom: 1px solid rgba(31, 46, 53, 0.08) !important;
      flex-shrink: 0 !important;
    }

    .drawer-title {
      font-size: 16px !important;
      font-weight: 800 !important;
      color: #1F2E35 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .drawer-close-btn {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      background: rgba(31, 46, 53, 0.07) !important;
      border: none !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #1F2E35 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: background 0.2s !important;
    }

    .drawer-close-btn:active {
      background: rgba(31, 46, 53, 0.14) !important;
    }

    .drawer-content {
      flex: 1 1 auto !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      min-height: 0 !important;
      padding: 12px 16px 36px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }

    .drawer-section-label {
      font-size: 11px !important;
      font-weight: 800 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.6px !important;
      color: rgba(31, 46, 53, 0.45) !important;
      margin-bottom: 6px !important;
      padding-left: 4px !important;
    }

    .drawer-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
    }

    .drawer-item {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 10px 12px !important;
      background: rgba(248, 250, 249, 0.9) !important;
      border: 1px solid rgba(31, 46, 53, 0.06) !important;
      border-radius: 14px !important;
      text-decoration: none !important;
      color: #1F2E35 !important;
      transition: all 0.18s ease !important;
      cursor: pointer !important;
    }

    .drawer-item:active {
      transform: scale(0.98) !important;
      background: rgba(239, 243, 241, 0.98) !important;
    }

    .drawer-item.active-current {
      background: rgba(196, 115, 79, 0.12) !important;
      border-color: rgba(196, 115, 79, 0.4) !important;
    }

    .drawer-item-left {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    }

    .drawer-item-num {
      width: 26px !important;
      height: 26px !important;
      border-radius: 7px !important;
      background: rgba(31, 46, 53, 0.07) !important;
      color: #1F2E35 !important;
      font-weight: 800 !important;
      font-size: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }

    .drawer-item.active-current .drawer-item-num {
      background: #C4734F !important;
      color: #FFFFFF !important;
    }

    .drawer-item-info {
      display: flex !important;
      flex-direction: column !important;
      gap: 1px !important;
      text-align: left !important;
    }

    .drawer-item-name {
      font-size: 13.5px !important;
      font-weight: 700 !important;
      line-height: 1.25 !important;
      color: #1F2E35 !important;
    }

    .drawer-item-sub {
      font-size: 10.5px !important;
      color: rgba(31, 46, 53, 0.55) !important;
      font-weight: 500 !important;
    }

    .drawer-item-tag {
      font-size: 10.5px !important;
      font-weight: 700 !important;
      color: #A85532 !important;
      background: rgba(255, 255, 255, 0.95) !important;
      padding: 2px 7px !important;
      border-radius: 5px !important;
      border: 1px solid rgba(196, 115, 79, 0.25) !important;
      flex-shrink: 0 !important;
    }

    .drawer-item-tag.bonus {
      color: #A85532 !important;
      border-color: rgba(196, 115, 79, 0.3) !important;
      background: #FFF8F5 !important;
    }
`;

const paidFiles = [
  '03_lesson1.html',
  '04_lesson2.html',
  '05_lesson3.html',
  '06_lesson4.html',
  '07_lesson5.html',
  '09_bonuses.html',
  '10_bonus1.html',
  '11_bonus2.html',
  '12_bonus3.html',
  '13_bonus4.html',
  '14_individual_offer.html'
];

paidFiles.forEach(file => {
  const filePath = path.join(CLIENT_DIR, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace CSS
  content = content.replace(/\/\* =========================================================\s*NAVIGATION HEADER & DRAWER STYLES[\s\S]*?\.drawer-item-tag\.bonus\s*\{[\s\S]*?\}\s*/, FIXED_DRAWER_CSS);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Applied viewport-fixed drawer CSS to:', file);
});

console.log('All paid files updated with viewport-fixed scrollable drawer!');
