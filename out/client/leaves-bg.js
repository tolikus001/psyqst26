(function() {
  const backgrounds = {
    birch: 'leaves_birch.jpg',
    oak: 'leaves_oak.jpg'
  };

  // Alternating mapping across screens
  const pageMapping = {
    '': 'birch',
    'index.html': 'birch',
    '01_psyquest.html': 'oak',
    '02_landing_partner.html': 'birch',
    '03_lesson1.html': 'oak',
    '04_lesson2.html': 'birch',
    '05_lesson3.html': 'oak',
    '06_lesson4.html': 'birch',
    '07_lesson5.html': 'oak',
    '08_portrait_quest.html': 'birch',
    '09_bonuses.html': 'oak',
    '10_bonus1.html': 'birch',
    '11_bonus2.html': 'oak',
    '12_bonus3.html': 'birch',
    '13_bonus4.html': 'oak',
    '14_individual_offer.html': 'birch'
  };

  function setBackground(themeKey) {
    let layer = document.getElementById('maisonArtBackground');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'maisonArtBackground';
      layer.setAttribute('aria-hidden', 'true');
      if (document.body) {
        document.body.insertBefore(layer, document.body.firstChild);
      }
    }

    let bgFile = backgrounds.birch;
    if (typeof themeKey === 'number') {
      bgFile = themeKey % 2 === 0 ? backgrounds.birch : backgrounds.oak;
    } else if (typeof themeKey === 'string' && backgrounds[themeKey]) {
      bgFile = backgrounds[themeKey];
    } else {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      const mapped = pageMapping[page] || (page.match(/\d+/) && parseInt(page.match(/\d+/)[0], 10) % 2 === 1 ? 'oak' : 'birch');
      bgFile = backgrounds[mapped] || backgrounds.birch;
    }

    if (layer) {
      layer.style.backgroundImage = "url('" + bgFile + "')";
    }
  }

  function init() {
    new Image().src = backgrounds.birch;
    new Image().src = backgrounds.oak;
    setBackground();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.setLeavesBackground = setBackground;
})();