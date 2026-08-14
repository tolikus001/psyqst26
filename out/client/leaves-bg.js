(function() {
  const backgrounds = [
    'leaves_birch.png',
    'leaves_oak.png'
  ];

  function setBackground(index) {
    let layer = document.getElementById('maisonArtBackground');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'maisonArtBackground';
      layer.setAttribute('aria-hidden', 'true');
      if (document.body) {
        document.body.insertBefore(layer, document.body.firstChild);
      }
    }
    if (layer) {
      const safeIndex = Math.abs(Number(index) || 0) % backgrounds.length;
      layer.style.backgroundImage = "url('" + backgrounds[safeIndex] + "')";
    }
  }

  function init() {
    backgrounds.forEach(src => {
      const img = new Image();
      img.src = src;
    });
    setBackground(0); // Default: Birch with dewdrops
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.setLeavesBackground = setBackground;
})();