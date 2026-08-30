import re

with open('out/client/16_lesson1.html', 'r', encoding='utf-8') as f:
    content = f.read()

head_end = content.find('</head>')
head = content[:head_end + 7]

if 'tailwindcss' not in head:
    head = head.replace('</head>', '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>\n</head>')

# Fetch original iframe id to keep kinescope ID if available
# We can just extract it using regex
m = re.search(r'<iframe[^>]*src="([^"]+)"[^>]*>', content)
iframe_src = m.group(1) if m else "https://kinescope.io/embed/200000000"

body_content = f"""<body>
  <div id="maisonArtBackground"></div>
  <div id="loading-screen" class="loader-screen">
    <div class="loader-spinner mb-4"></div>
    <span class="text-sm tracking-widest text-nb-accent uppercase font-bold animate-pulse">Загрузка...</span>
  </div>

  <div class="app-shell flex flex-col items-center justify-start min-h-[100dvh]">
    <div class="app w-full max-w-md flex flex-col h-[100dvh] overflow-y-auto overflow-x-hidden p-4 relative">
      <!-- HEADER -->
      <div class="text-center pt-2 pb-6">
        <h2 class="text-xs font-bold tracking-widest text-nb-text-2 uppercase mb-1">Урок 1</h2>
        <h1 class="text-xl font-bold text-nb-deep leading-tight">Почему один его поступок занимает всю вашу голову</h1>
      </div>

      <!-- VIDEO -->
      <div id="videoContainer" class="w-full rounded-2xl overflow-hidden shadow-lg mb-6 relative z-10">
        <div style="padding-top: 56.25%; position: relative;">
          <iframe id="kinescopeVideo" src="{iframe_src}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" frameborder="0" allowfullscreen style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></iframe>
        </div>
      </div>
      
      <!-- STEP 1 -->
      <div id="step1" class="glass rounded-3xl p-6 mb-6">
        <h3 class="text-lg font-bold text-nb-deep text-center mb-4">Шаг 1. Ситуация-триггер</h3>
        <p class="text-nb-text-2 text-sm text-center mb-4">Вспомните, когда его поведение вывело вас из себя или включило тревогу (опоздал, сухо ответил, хмуро зашёл, замолчал). Что произошло?</p>
        <textarea id="situationInput" rows="4" class="w-full rounded-xl bg-white/50 border border-nb-accent/20 p-3 text-sm focus:outline-none focus:border-nb-accent mb-4" placeholder="Например: пришёл с работы, молча прошёл на кухню и уткнулся в телефон, на мой вопрос ответил сквозь зубы..."></textarea>
        <button onclick="handleStep1()" class="primary-btn w-full py-4 bg-nb-accent text-white font-bold rounded-2xl text-lg transition-transform active:scale-95 shadow-lg">Далее</button>
      </div>

      <!-- STEP 2 -->
      <div id="step2" class="glass rounded-3xl p-6 mb-6 hidden">
        <h3 class="text-lg font-bold text-nb-deep text-center mb-4">Шаг 2. Что вспыхнуло внутри?</h3>
        
        <!-- Sliders -->
        <div class="mb-5">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-nb-deep">Злость и Ярость</span>
            <span class="slider-val-badge px-2 py-0.5 rounded-full text-xs font-bold bg-nb-bg text-nb-deep" id="val1">0</span>
          </div>
          <input type="range" id="slider1" min="0" max="10" value="0" class="touch-range w-full" oninput="updateSlider('val1', this.value, this)" style="background: linear-gradient(to right, #2F7D59, #E59A5A, #B42318);">
          <div class="flex justify-between text-[10px] text-nb-text-2 mt-1"><span>0</span><span>10</span></div>
        </div>

        <div class="mb-5">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-nb-deep">Тревога и Страх</span>
            <span class="slider-val-badge px-2 py-0.5 rounded-full text-xs font-bold bg-nb-bg text-nb-deep" id="val2">0</span>
          </div>
          <input type="range" id="slider2" min="0" max="10" value="0" class="touch-range w-full" oninput="updateSlider('val2', this.value, this)" style="background: linear-gradient(to right, #2F7D59, #E59A5A, #B42318);">
          <div class="flex justify-between text-[10px] text-nb-text-2 mt-1"><span>0</span><span>10</span></div>
        </div>

        <div class="mb-5">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-nb-deep">Обида и Одиночество</span>
            <span class="slider-val-badge px-2 py-0.5 rounded-full text-xs font-bold bg-nb-bg text-nb-deep" id="val3">0</span>
          </div>
          <input type="range" id="slider3" min="0" max="10" value="0" class="touch-range w-full" oninput="updateSlider('val3', this.value, this)" style="background: linear-gradient(to right, #2F7D59, #E59A5A, #B42318);">
          <div class="flex justify-between text-[10px] text-nb-text-2 mt-1"><span>0</span><span>10</span></div>
        </div>

        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-nb-deep">Холод и Оцепенение</span>
            <span class="slider-val-badge px-2 py-0.5 rounded-full text-xs font-bold bg-nb-bg text-nb-deep" id="val4">0</span>
          </div>
          <input type="range" id="slider4" min="0" max="10" value="0" class="touch-range w-full" oninput="updateSlider('val4', this.value, this)" style="background: linear-gradient(to right, #2F7D59, #E59A5A, #B42318);">
          <div class="flex justify-between text-[10px] text-nb-text-2 mt-1"><span>0</span><span>10</span></div>
        </div>

        <button onclick="handleStep2()" class="primary-btn w-full py-4 bg-nb-accent text-white font-bold rounded-2xl text-lg transition-transform active:scale-95 shadow-lg">Далее</button>
      </div>

      <!-- STEP 3 -->
      <div id="step3" class="glass rounded-3xl p-6 mb-6 hidden relative">
        <h3 class="text-lg font-bold text-nb-deep text-center mb-4">Шаг 3. Какой триллер нарисовала голова?</h3>
        <p class="text-nb-text-2 text-sm text-center mb-4">Какие выводы и картины моментально подкинула голова? Чего вы больше всего испугались?</p>
        <textarea id="thrillerInput" rows="4" class="w-full rounded-xl bg-white/50 border border-nb-accent/20 p-3 text-sm focus:outline-none focus:border-nb-accent mb-4" placeholder="Например: он охладел ко мне, я для него пустое место, скоро он соберёт вещи и уйдёт..."></textarea>
        
        <div id="attemptsContainer" class="text-center text-xs text-nb-text-2 mb-2 font-semibold">Осталось попыток: <span id="attemptsCount">3</span></div>
        <button id="submitBtn" onclick="submitToAI()" class="primary-btn w-full py-4 bg-nb-sea text-white font-bold rounded-2xl text-[15px] transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
          <span>Отделить факт от триллера с ИИ-попутчиком</span>
        </button>
        
        <!-- Loading Overlay -->
        <div id="aiLoading" class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl hidden flex-col items-center justify-center z-20" style="display: none;">
          <div class="loader-spinner mb-3"></div>
          <p class="text-sm font-bold text-nb-accent animate-pulse">Анализирую ситуацию...</p>
        </div>
      </div>

      <!-- RESULTS CARD -->
      <div id="resultCard" class="glass rounded-3xl p-6 mb-6 hidden">
        <h3 class="text-xl font-bold text-nb-deep text-center mb-6">Разбор ситуации</h3>
        
        <div class="bg-white/60 rounded-2xl p-4 mb-4 border-l-4 border-nb-sea shadow-sm">
          <div class="text-xs text-nb-sea font-bold uppercase tracking-wider mb-2 text-center">📷 Сухой факт</div>
          <p id="resFact" class="text-sm text-nb-text leading-relaxed">...</p>
        </div>
        
        <div class="bg-white/60 rounded-2xl p-4 mb-4 border-l-4 border-danger shadow-sm">
          <div class="text-xs text-danger font-bold uppercase tracking-wider mb-2 text-center">🎬 Триллер головы</div>
          <p id="resThriller" class="text-sm text-nb-text leading-relaxed">...</p>
        </div>
        
        <div class="bg-nb-accent/10 rounded-2xl p-4 mb-6 border border-nb-accent/30 shadow-sm">
          <div class="text-xs text-nb-accent font-bold uppercase tracking-wider mb-2 text-center">🧘‍♀️ Фраза-стабилизатор</div>
          <p id="resStabilizer" class="text-base text-nb-deep font-semibold text-center leading-relaxed">...</p>
        </div>

        <div class="bg-nb-gold/10 p-4 rounded-xl text-center mb-6 shadow-sm">
          <p class="text-sm text-nb-deep font-medium">Результат сохранен в Блок №1 «Карты опоры»</p>
        </div>
        
        <div class="text-center mb-4">
          <p class="text-sm text-nb-text-2 leading-relaxed">Вы научились останавливать первую вспышку и отделять факт от накрутки. Но почему вы вообще взвалили на себя ответственность за его настроение, дела и совместные планы? Как перестать быть «коучем-аниматором» и выдохнуть — разберём в следующем уроке.</p>
        </div>

        <button onclick="handleCta()" class="w-full py-4 bg-nb-sea text-white font-bold rounded-2xl text-[15px] transition-transform active:scale-95 shadow-lg animate-pulse text-center">
          Перейти к Уроку 2: Почему вы тащите всё на себе
        </button>
      </div>
      
      <div class="pb-12"></div>
    </div>
  </div>

  <style>
    /* Add some specific styles for our sliders as per rule 10 */
    .touch-range {{
      -webkit-appearance: none;
      height: 8px;
      border-radius: 4px;
      outline: none;
    }}
    .touch-range::-webkit-slider-thumb {{
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      border: 2px solid var(--nb-accent);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    }}
  </style>

  <script>
    // Theme & Bridge logic
    function applyThemeColors(colors) {{
      if (!colors) return;
      var root = document.documentElement;
      if(colors.background) root.style.setProperty('--nb-bg', colors.background);
      if(colors.textPrimary) root.style.setProperty('--nb-text', colors.textPrimary);
      if(colors.textSecondary) root.style.setProperty('--nb-text-2', colors.textSecondary);
      if(colors.primaryMain) root.style.setProperty('--nb-accent', colors.primaryMain);
    }}

    var elLoading = document.getElementById('loading-screen');
    
    function handleNotibotInit(user, app) {{
      if (app) applyThemeColors(app.colors);
      if (elLoading) elLoading.style.display = 'none';
    }}

    if (window.notibot) {{
      window.notibot.onUpdate(handleNotibotInit);
      if (window.notibotInitData) handleNotibotInit(window.notibotInitData.user, window.notibotInitData.app);
      else if (window.notibot.app && Object.keys(window.notibot.app).length > 0) handleNotibotInit(window.notibot.user, window.notibot.app);
      setTimeout(function() {{ if (elLoading) elLoading.style.display = 'none'; }}, 3000);
    }} else {{
      setTimeout(function() {{ if (elLoading) elLoading.style.display = 'none'; }}, 1000);
    }}

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
      }} catch (e) {{ }}
    }}

    function pauseVideo() {{
      var iframe = document.getElementById('kinescopeVideo');
      if(iframe) {{
        var src = iframe.src;
        iframe.src = src;
      }}
    }}

    function handleCta(e) {{
      if(e && e.preventDefault) e.preventDefault();
      safeHaptic('success');
      var CTA_ID = '2NvyoluAQiidfuwZTClFNy';
      var CTA_FALLBACK = '17_lesson2.html';
      
      if(typeof openScreen === 'function') {{
         openScreen(CTA_FALLBACK);
      }} else {{
        if (window.notibot) {{
          try {{ window.notibot.openArticle(CTA_ID); }} 
          catch(err) {{ window.location.href = CTA_FALLBACK; }}
        }} else {{
          window.location.href = CTA_FALLBACK;
        }}
      }}
    }}

    function handleStep1() {{
      var v = document.getElementById('situationInput').value.trim();
      if(!v) {{
        safeHaptic('error');
        alert('Пожалуйста, опишите ситуацию.');
        return;
      }}
      safeHaptic('selection');
      document.getElementById('step1').classList.add('hidden');
      document.getElementById('step2').classList.remove('hidden');
      pauseVideo();
    }}

    function updateSlider(id, val, el) {{
      var badge = document.getElementById(id);
      badge.textContent = val;
      
      var num = parseInt(val, 10);
      var color = '#2F7D59';
      if(num >= 8) color = '#B42318';
      else if (num >= 4) color = '#E59A5A';
      
      badge.style.backgroundColor = color;
      badge.style.color = 'white';
      
      safeHaptic('selection');
    }}

    function handleStep2() {{
      safeHaptic('selection');
      document.getElementById('step2').classList.add('hidden');
      document.getElementById('step3').classList.remove('hidden');
    }}

    var attempts = 3;
    var ATTEMPTS_KEY = 's2_lesson1_attempts';
    var savedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if(savedAttempts !== null) {{
      attempts = parseInt(savedAttempts, 10);
    }}
    
    function updateAttemptsDisplay() {{
      var el = document.getElementById('attemptsCount');
      if(el) el.textContent = attempts;
      if(attempts <= 0) {{
        var btn = document.getElementById('submitBtn');
        if(btn) {{
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.querySelector('span').textContent = 'Попытки закончились';
        }}
      }}
    }}
    updateAttemptsDisplay();
    
    async function apiPostLocal(endpoint, bodyData, timeoutMs = 15000) {{
      var baseUrl = (window.API_BASE && window.API_BASE !== '') ? window.API_BASE : '';
      var targetUrl = endpoint.startsWith('http') ? endpoint : (baseUrl + endpoint);
      
      var controller = new AbortController();
      var timer = setTimeout(function(){{ controller.abort(); }}, timeoutMs);

      try {{
        var response = await fetch(targetUrl, {{
          method: 'POST',
          headers: {{
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }},
          body: JSON.stringify(bodyData),
          signal: controller.signal
        }});
        clearTimeout(timer);
        if (!response.ok) throw new Error("HTTP " + response.status);
        return await response.json();
      }} catch (err) {{
        clearTimeout(timer);
        if (window.AMVERA_HOST && targetUrl !== (window.AMVERA_HOST + endpoint)) {{
           try {{
             var fb = await fetch(window.AMVERA_HOST + endpoint, {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify(bodyData)
             }});
             if(fb.ok) return await fb.json();
           }} catch(e) {{}}
        }}
        throw err;
      }}
    }}

    async function submitToAI() {{
      if(attempts <= 0) {{
        safeHaptic('error');
        return;
      }}
      
      var thriller = document.getElementById('thrillerInput').value.trim();
      var situation = document.getElementById('situationInput').value.trim();
      
      if(!thriller) {{
        safeHaptic('error');
        alert('Пожалуйста, опишите триллер в голове.');
        return;
      }}
      
      var s1 = document.getElementById('slider1').value;
      var s2 = document.getElementById('slider2').value;
      var s3 = document.getElementById('slider3').value;
      var s4 = document.getElementById('slider4').value;

      safeHaptic('medium');
      document.getElementById('aiLoading').classList.remove('hidden');
      document.getElementById('aiLoading').style.display = 'flex';
      
      try {{
        var payload = {{
           situation: situation,
           thriller: thriller,
           emotions: {{
             anger: s1,
             anxiety: s2,
             resentment: s3,
             coldness: s4
           }}
        }};
        
        var apiFunc = (typeof apiPost === 'function') ? apiPost : apiPostLocal;
        var data = await apiFunc('/api/s2-lesson1-strategy', payload);
        
        if(!data || !data.fact) {{
           throw new Error("Invalid API response");
        }}
        renderResults(data);
        
      }} catch(err) {{
        console.error(err);
        setTimeout(function() {{
          renderResults({{
            fact: "Камера зафиксировала: человек пришел, прошел на кухню, смотрит в телефон, на вопросы отвечает коротко.",
            thriller: "Мозг рисует: он охладел, мы расстаемся, я ему не нужна.",
            stabilizer: "Прямо сейчас мне ничего не угрожает. Чужое настроение — это просто чужое настроение."
          }});
        }}, 1500);
      }}
    }}
    
    function renderResults(data) {{
        document.getElementById('aiLoading').classList.add('hidden');
        document.getElementById('aiLoading').style.display = 'none';
        
        safeHaptic('success');
        
        attempts--;
        localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
        updateAttemptsDisplay();
        
        localStorage.setItem('s2_lesson1_block', JSON.stringify(data));
        localStorage.setItem('s2_lesson1_completed', 'true');
        
        document.getElementById('resFact').textContent = data.fact;
        document.getElementById('resThriller').textContent = data.thriller;
        document.getElementById('resStabilizer').textContent = data.stabilizer;
        
        document.getElementById('step3').classList.add('hidden');
        document.getElementById('resultCard').classList.remove('hidden');
        document.getElementById('resultCard').scrollIntoView({{ behavior: 'smooth' }});
    }}
    
    window.addEventListener('DOMContentLoaded', function() {{
      var saved = localStorage.getItem('s2_lesson1_block');
      if(saved) {{
        try {{
          var data = JSON.parse(saved);
        }}catch(e){{}}
      }}
    }});
  </script>
</body>
</html>
"""

with open('out/client/16_lesson1.html', 'w', encoding='utf-8') as f:
    f.write(head + "\n" + body_content)
