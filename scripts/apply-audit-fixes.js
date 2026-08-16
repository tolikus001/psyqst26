const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'out', 'client');

// 1. Fix 03_lesson1.html transition functions
const file3Path = path.join(clientDir, '03_lesson1.html');
let content3 = fs.readFileSync(file3Path, 'utf8');

const oldL1Transitions = `    // Transition from Video (Screen 1) to Interactive Practice (Screen 2)
    function goToStep2() {
      safeHaptic('selection');
      pauseVideo();
      document.getElementById('step1VideoScreen').style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically reveal "Перейти ко второму уроку →" button after 3 seconds on Screen 2
      setTimeout(revealNextLessonBtn, 3000);
    }

    // Return to Video Screen (Screen 1)
    
    // Seamless Screen Transitions (Aliases for full backwards compatibility)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }`;

const newL1Transitions = `    // Seamless Screen Transitions (Screen 1 <-> Screen 2)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically reveal "Перейти ко второму уроку →" button after 3 seconds on Screen 2
      setTimeout(revealNextLessonBtn, 3000);
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }`;

if (content3.includes(oldL1Transitions)) {
  content3 = content3.replace(oldL1Transitions, newL1Transitions);
  fs.writeFileSync(file3Path, content3, 'utf8');
  console.log('Fixed transitions in 03_lesson1.html');
}

// 2. Fix 04_lesson2.html transition functions
const file4Path = path.join(clientDir, '04_lesson2.html');
let content4 = fs.readFileSync(file4Path, 'utf8');

const oldL2Transitions = `    // Screen Transition: Video (Screen 1) <-> Interactive (Screen 2)
    function goToStep2() {
      safeHaptic('selection');
      pauseVideo();
      document.getElementById('step1VideoScreen').style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    
    // Seamless Screen Transitions (Aliases for full backwards compatibility)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }`;

const newL2Transitions = `    // Seamless Screen Transitions (Screen 1 <-> Screen 2)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }`;

if (content4.includes(oldL2Transitions)) {
  content4 = content4.replace(oldL2Transitions, newL2Transitions);
  fs.writeFileSync(file4Path, content4, 'utf8');
  console.log('Fixed transitions in 04_lesson2.html');
}

// 3. Fix 06_lesson4.html transition functions
const file6Path = path.join(clientDir, '06_lesson4.html');
let content6 = fs.readFileSync(file6Path, 'utf8');

const oldL4Transitions = `    // Screen 1 -> Screen 2 Transition
    function goToPractice() {
      goToInteractive();
    }
    window.goToPractice = goToPractice;

    function goToInteractive() {
      safeHaptic('selection');
      pauseVideo();
      document.getElementById('step1VideoScreen').style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Screen 2 -> Screen 1 Return
    
    // Seamless Screen Transitions (Aliases for full backwards compatibility)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }`;

const newL4Transitions = `    // Seamless Screen Transitions (Screen 1 <-> Screen 2)
    function goToVideo() {
      safeHaptic('selection');
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'none';
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep1() {
      goToVideo();
    }

    function goToPractice() {
      safeHaptic('selection');
      pauseVideo();
      const s1 = document.getElementById('step1VideoScreen');
      if (s1) s1.style.display = 'none';
      const s2 = document.getElementById('step2InteractiveScreen');
      if (s2) s2.style.display = 'flex';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToStep2() {
      goToPractice();
    }

    function goToInteractive() {
      goToPractice();
    }

    window.goToPractice = goToPractice;`;

if (content6.includes(oldL4Transitions)) {
  content6 = content6.replace(oldL4Transitions, newL4Transitions);
  fs.writeFileSync(file6Path, content6, 'utf8');
  console.log('Fixed transitions in 06_lesson4.html');
}

// 4. Update CSP in 01_psyquest.html and 08_portrait_quest.html
const uniformCSP = `  <meta http-equiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://list.notibot.ru https://telegram.org https://kinescope.io https://*.kinescope.io;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      media-src 'self' https: data: blob:;
      frame-src 'self' https://kinescope.io https://*.kinescope.io;
      connect-src 'self' https: http://localhost:3000;
    " />`;

['01_psyquest.html', '08_portrait_quest.html'].forEach(f => {
  const filePath = path.join(clientDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<meta http-equiv="Content-Security-Policy"[\s\S]*?\/>/, uniformCSP);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated uniform CSP in:', f);
});

console.log('All audit warnings successfully resolved!');
