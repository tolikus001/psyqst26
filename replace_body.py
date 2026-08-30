import re

with open('out/client/15_landing_partner_2.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract everything up to </head>
head_match = re.search(r'(.*?</head>)', content, flags=re.DOTALL | re.IGNORECASE)
if not head_match:
    print("Could not find </head>")
    exit(1)

head = head_match.group(1)

# Now we need the body tag and its styles. Wait, the existing file might have some styles after </head>? No, HTML spec says style is in head. But wait, inlined-theme was in head.
# Let's check where <body starts.
body_match = re.search(r'(<body.*?>)', content, flags=re.IGNORECASE)
if not body_match:
    print("Could not find <body>")
    exit(1)

body_open = body_match.group(1)

# Wait, the instruction says: "COPY the exact <head> section and inlined base64 background from the existing file. Rebuild the <body> content per the TZ spec."
# Let's extract everything up to and including `<div id="maisonArtBackground">...</div>`.
maison_match = re.search(r'(<div id="maisonArtBackground"[^>]*>.*?</div>)', content, flags=re.DOTALL)
if maison_match:
    maison_bg = maison_match.group(1)
else:
    maison_bg = '<div id="maisonArtBackground"></div>'

new_body = f"""
{body_open}
{maison_bg}
  <div id="loading-screen" class="loader-screen" style="position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--nb-bg, #F3F4F6);">
    <div class="loader-spinner mb-4" style="width: 40px; height: 40px; border: 4px solid var(--nb-accent); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
    <style>@keyframes spin {{ to {{ transform: rotate(360deg); }} }}</style>
  </div>

  <div class="app-shell relative w-full h-full min-h-[100dvh] flex flex-col justify-start items-center overflow-x-hidden">
    <div class="app w-full max-w-md flex flex-col p-4 pb-24 z-10">
      
      <!-- HEADER -->
      <div class="text-center mb-6 mt-6">
        <h4 class="text-xs uppercase tracking-widest text-nb-accent font-bold mb-2">Вводное занятие</h4>
        <h1 class="text-3xl font-black text-nb-deep leading-tight">Я остаюсь собой</h1>
      </div>

      <!-- VIDEO -->
      <div class="w-full glass rounded-3xl p-2 mb-8 shadow-lg bg-white/40 backdrop-blur-md border border-white/20">
         <div class="relative w-full rounded-2xl overflow-hidden bg-nb-deep/5" style="padding-top: 56.25%;">
            <!-- Kinescope iframe -->
            <iframe src="https://player.kinescope.io/200000000" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; xr-spatial-tracking;" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full object-cover"></iframe>
         </div>
      </div>
      
      <!-- AUDIO -->
      <div class="w-full glass rounded-3xl p-6 mb-8 shadow-lg bg-white/40 backdrop-blur-md border border-white/20">
        <h3 class="text-xl font-bold text-nb-deep text-center mb-3">Возвращение к себе (10 мин)</h3>
        <p class="text-sm text-nb-text-2 text-center mb-5 leading-relaxed font-medium">Слушайте в наушниках перед началом занятий. Практика помогает сбросить первичное напряжение и вернуться вниманием в своё тело.</p>
        <div class="w-full rounded-xl overflow-hidden shadow-inner bg-nb-bg/50 border border-nb-line">
           <audio controls class="w-full h-12 outline-none">
             <!-- Placeholder src, wait for real URL -->
             <source src="https://inter01-anatolyfedorov.amvera.io/data/audio/vozvrashchenie_k_sebe.mp3" type="audio/mpeg">
             Ваш браузер не поддерживает аудио.
           </audio>
        </div>
      </div>

      <!-- PROGRAM -->
      <div class="w-full mb-8">
        <h2 class="text-2xl font-black text-nb-deep text-center mb-6">Программа курса</h2>
        <div class="space-y-4">
          <div class="glass rounded-2xl p-5 flex items-center shadow-sm bg-white/40 backdrop-blur-md border border-white/20">
            <div class="w-12 h-12 rounded-full bg-nb-accent/20 flex items-center justify-center text-nb-accent font-bold text-xl mr-5 shrink-0 shadow-inner">1</div>
            <div>
               <h4 class="font-bold text-nb-deep text-base mb-1 text-left">Шаг 1. Первичное напряжение</h4>
               <p class="text-xs text-nb-text-2 text-left">Учимся замечать тело и реакции.</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-5 flex items-center shadow-sm bg-white/40 backdrop-blur-md border border-white/20">
            <div class="w-12 h-12 rounded-full bg-nb-accent/20 flex items-center justify-center text-nb-accent font-bold text-xl mr-5 shrink-0 shadow-inner">2</div>
            <div>
               <h4 class="font-bold text-nb-deep text-base mb-1 text-left">Шаг 2. Эмоциональный сброс</h4>
               <p class="text-xs text-nb-text-2 text-left">Работа с подавленными чувствами.</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-5 flex items-center shadow-sm bg-white/40 backdrop-blur-md border border-white/20">
            <div class="w-12 h-12 rounded-full bg-nb-accent/20 flex items-center justify-center text-nb-accent font-bold text-xl mr-5 shrink-0 shadow-inner">3</div>
            <div>
               <h4 class="font-bold text-nb-deep text-base mb-1 text-left">Шаг 3. Опора на себя</h4>
               <p class="text-xs text-nb-text-2 text-left">Где искать ресурс внутри.</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-5 flex items-center shadow-sm bg-white/40 backdrop-blur-md border border-white/20">
            <div class="w-12 h-12 rounded-full bg-nb-accent/20 flex items-center justify-center text-nb-accent font-bold text-xl mr-5 shrink-0 shadow-inner">4</div>
            <div>
               <h4 class="font-bold text-nb-deep text-base mb-1 text-left">Шаг 4. Границы</h4>
               <p class="text-xs text-nb-text-2 text-left">Как сказать "нет" и остаться собой.</p>
            </div>
          </div>
          <div class="glass rounded-2xl p-5 flex items-center shadow-sm bg-white/40 backdrop-blur-md border border-white/20">
            <div class="w-12 h-12 rounded-full bg-nb-accent/20 flex items-center justify-center text-nb-accent font-bold text-xl mr-5 shrink-0 shadow-inner">5</div>
            <div>
               <h4 class="font-bold text-nb-deep text-base mb-1 text-left">Шаг 5. Новый сценарий</h4>
               <p class="text-xs text-nb-text-2 text-left">Интеграция опыта в жизнь.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="w-full mt-4 mb-8">
        <button onclick="handleCta(event)" class="w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl relative overflow-hidden group bg-nb-accent hover:bg-nb-sea transition-colors duration-300 transform hover:scale-[1.02] active:scale-95">
          <span class="relative z-10 flex items-center justify-center gap-2">
            Перейти к Шагу 1
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </button>
      </div>

    </div>
  </div>

  <style type="text/tailwindcss">
    @theme {{
      --color-nb-bg:     var(--nb-bg, #F3F6F5);
      --color-nb-text:   var(--nb-text, #243139);
      --color-nb-text-2: var(--nb-text-2, #68767C);
      --color-nb-accent: var(--nb-accent, #7F9B8E);
      --color-nb-deep:   var(--nb-deep, #243139);
      --color-nb-sea:    var(--nb-sea, #45656D);
      --color-nb-gold:   var(--nb-gold, #C8B28F);
      --color-nb-line:   var(--nb-line, rgba(14, 31, 46, 0.10));
    }}
  </style>

  <!-- Tailwind Script -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  
  <script>
    function safeHaptic(kind) {{
      try {{
        if (window.notibot) {{
          if (kind === 'success' || kind === 'error' || kind === 'warning') {{
            if (typeof notibot.hapticNotification === 'function') {{ notibot.hapticNotification(kind); return; }}
          }} else if (kind === 'selection') {{
            if (typeof notibot.hapticSelection === 'function') {{ notibot.hapticSelection(); return; }}
          }} else {{
            if (typeof notibot.hapticImpact === 'function') {{ notibot.hapticImpact(kind || 'light'); return; }}
          }}
        }}
        if (window.Telegram && Telegram.WebApp && Telegram.WebApp.HapticFeedback) {{
          var hf = Telegram.WebApp.HapticFeedback;
          if ((kind === 'success' || kind === 'error' || kind === 'warning') && typeof hf.notificationOccurred === 'function') {{ hf.notificationOccurred(kind); return; }}
          if (kind === 'selection' && typeof hf.selectionChanged === 'function') {{ hf.selectionChanged(); return; }}
          if (typeof hf.impactOccurred === 'function') {{ hf.impactOccurred(kind === 'heavy' ? 'heavy' : (kind === 'medium' ? 'medium' : 'light')); return; }}
        }}
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {{
          navigator.vibrate(kind === 'error' ? [30, 40, 30] : 12);
        }}
      }} catch (e) {{ /* silent graceful fallback */ }}
    }}

    function applyThemeColors(colors) {{
      if (!colors) return;
      var root = document.documentElement;
      if (colors.background) root.style.setProperty('--nb-bg', colors.background);
      if (colors.textPrimary) root.style.setProperty('--nb-text', colors.textPrimary);
      if (colors.textSecondary) root.style.setProperty('--nb-text-2', colors.textSecondary);
      if (colors.primaryMain) root.style.setProperty('--nb-accent', colors.primaryMain);
    }}

    function handleNotibotInit(user, app) {{
      if (app && app.colors) applyThemeColors(app.colors);
      var elLoading = document.getElementById('loading-screen');
      if (elLoading) {{
        elLoading.style.display = 'none';
      }}
    }}

    if (window.notibot) {{
      window.notibot.onUpdate(handleNotibotInit);
      if (window.notibotInitData) {{
        handleNotibotInit(window.notibotInitData.user, window.notibotInitData.app);
      }} else if (window.notibot.app && Object.keys(window.notibot.app).length > 0) {{
        handleNotibotInit(window.notibot.user, window.notibot.app);
      }}
      setTimeout(function() {{
        var elLoading = document.getElementById('loading-screen');
        if (elLoading && elLoading.style.display !== 'none') elLoading.style.display = 'none';
      }}, 3000);
    }} else {{
      setTimeout(function() {{
        var elLoading = document.getElementById('loading-screen');
        if (elLoading) elLoading.style.display = 'none';
      }}, 1000);
    }}

    function openScreen(target) {{
      if (typeof safeHaptic === 'function') safeHaptic('selection');
      var NOTIBOT_ARTICLES = {{
        '16_lesson1': '5hR7Av3us4aIKmTZr7b6J2',
        '16_lesson1.html': '5hR7Av3us4aIKmTZr7b6J2'
      }};
      var raw = String(target || '').trim();
      var articleId = NOTIBOT_ARTICLES[raw];
      if (window.notibot && articleId && typeof window.notibot.openArticle === 'function' && window.parent && window.parent !== window) {{
        window.notibot.openArticle(articleId);
      }} else {{
        window.location.href = target;
      }}
    }}

    function handleCta(e) {{
      if (e && e.preventDefault) e.preventDefault();
      openScreen('16_lesson1.html');
    }}
    
    // Auto-pause media logic
    function pauseVideo() {{
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {{
            var src = iframes[i].src;
            iframes[i].src = src; // this resets the iframe, stopping video
        }}
        var audios = document.querySelectorAll('audio');
        for (var j = 0; j < audios.length; j++) {{
            audios[j].pause();
        }}
    }}
    
    document.addEventListener('visibilitychange', function() {{
        if (document.hidden) {{
            pauseVideo();
        }}
    }});
  </script>
</body>
</html>
"""

full_content = head + "\n" + new_body

with open('out/client/15_landing_partner_2.html', 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Done")
