import json

file_path = '/Users/zalina/Documents/docs/coding/миникурс/out/client/18_lesson3.html'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

head_lines = []
for i, line in enumerate(lines):
    head_lines.append(line)
    if '</head>' in line:
        break

head_str = "".join(head_lines)

body_str = """
<body>
  <div id="maisonArtBackground" aria-hidden="true"></div>

  <main class="app-shell">
    <div class="app">

      <!-- Navigation Header -->
      <header class="header-bar-nav" style="display:flex; justify-content:space-between; align-items:center;">
        <div class="header-actions-row">
          <span class="eyebrow" style="margin-bottom:0;">Урок 3</span>
        </div>
      </header>

      <!-- Video Card -->
      <section class="glass card text-center">
        <h2>Как остановить мысленную жвачку и выключить суд в голове</h2>
        <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:18px; overflow:hidden; background:#000; box-shadow:0 12px 30px rgba(0,0,0,0.12); margin-top:14px;">
          <iframe id="lesson3VideoIframe" src="https://kinescope.io/embed/qYx9t8Hu9S4rEquGxYBMyP?max_quality=720" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen style="position:absolute; width:100%; height:100%; top:0; left:0;"></iframe>
        </div>
      </section>

      <!-- AI Trainer -->
      <section class="glass card text-center" id="trainer-section">
        <div class="eyebrow">Тренировка</div>
        <h3>Выгрузка мысленной жвачки</h3>
        
        <div id="trainer-form" style="text-align:left; margin-top:16px;">
            
            <!-- Step 1 -->
            <label style="display:block; font-size:14px; font-weight:600; color:var(--nb-deep); margin-bottom:6px;">Шаг 1. Опишите ситуацию откровенно</label>
            <p style="font-size:12px; color:var(--nb-text-2); margin-top:0; margin-bottom:8px;">Опишите ситуацию так, как вы её видите, не стесняясь в выражениях. Чем откровеннее вы будете, тем лучше станет вам и тем точнее поможет наш Попутчик.</p>
            <textarea id="raw_situation" rows="4" placeholder="Пишите всё как есть: что он сказал, что сделал, почему это бесит и не выходит из головы..." style="width:100%; border:1px solid rgba(14,31,46,0.12); border-radius:14px; padding:12px 14px; background:#FFFFFF; color:var(--nb-text); outline:none; font-size:14px; margin-bottom:16px;"></textarea>
            
            <!-- Step 2 -->
            <label style="display:block; font-size:14px; font-weight:600; color:var(--nb-deep); margin-bottom:6px;">Шаг 2. Где была нарушена справедливость и в чём ваша боль?</label>
            <p style="font-size:12px; color:var(--nb-text-2); margin-top:0; margin-bottom:8px;">Выделите боль: что именно вы испытываете или испытывали в моменте? Где была нарушена справедливость по отношению к вам?</p>
            <textarea id="pain_justice" rows="3" placeholder="Например: я вложила всю душу, а он обесценил это одной фразой, словно моих усилий не существует..." style="width:100%; border:1px solid rgba(14,31,46,0.12); border-radius:14px; padding:12px 14px; background:#FFFFFF; color:var(--nb-text); outline:none; font-size:14px; margin-bottom:16px;"></textarea>

            <!-- Step 3 -->
            <label style="display:block; font-size:14px; font-weight:600; color:var(--nb-deep); margin-bottom:6px;">Шаг 3. Где в теле вы чувствуете напряжение?</label>
            <div class="answers" id="body-tension-options" style="margin-bottom:16px;">
                <label class="answer" onclick="toggleCheckbox(this)">
                    <div class="answer-dot"></div>
                    <span>🗣 Горло (ком, невысказанные слова)</span>
                    <input type="checkbox" value="Горло" style="display:none;">
                </label>
                <label class="answer" onclick="toggleCheckbox(this)">
                    <div class="answer-dot"></div>
                    <span>🫀 Грудь / Солнечное сплетение (тяжесть, сжатие)</span>
                    <input type="checkbox" value="Грудь" style="display:none;">
                </label>
                <label class="answer" onclick="toggleCheckbox(this)">
                    <div class="answer-dot"></div>
                    <span>😬 Сжатые челюсти и зубы</span>
                    <input type="checkbox" value="Челюсти" style="display:none;">
                </label>
                <label class="answer" onclick="toggleCheckbox(this)">
                    <div class="answer-dot"></div>
                    <span>💆‍♀️ Плечи и шея (каменные, приподнятые)</span>
                    <input type="checkbox" value="Плечи" style="display:none;">
                </label>
                <label class="answer" onclick="toggleCheckbox(this)">
                    <div class="answer-dot"></div>
                    <span>🕳 Живот (спазм, холод)</span>
                    <input type="checkbox" value="Живот" style="display:none;">
                </label>
            </div>

            <div style="text-align:center; font-size:12px; font-weight:600; color:var(--nb-text-2); margin-bottom:8px;" id="attempts-counter">
                Осталось попыток: 3
            </div>
            
            <button id="submitBtn" onclick="submitTrainer()" class="primary-btn">
                <span>Выгрузить мысленную жвачку и получить стабилизирующую формулу</span>
            </button>
        </div>

        <div id="ai-loading" style="display:none; padding:20px; font-size:14px; color:var(--nb-text-2);">
            <div class="pulse" style="margin-bottom:10px;">🧠 AI анализирует вашу выгрузку...</div>
        </div>

        <div id="ai-result" style="display:none; text-align:left; margin-top:20px; padding:16px; background:#F8FAFC; border-radius:16px; border:1px solid rgba(14,31,46,0.1);">
            <h4 style="margin-top:0; margin-bottom:8px; color:var(--nb-sea); text-align:center;">Стабилизирующая формула</h4>
            <div id="ai-result-content" style="font-size:14px; line-height:1.5;"></div>
        </div>
      </section>

      <!-- Meditation Audio Player (hidden initially) -->
      <section class="glass card text-center" id="meditation-section" style="display:none;">
        <div class="eyebrow" style="background:rgba(47,125,89,0.1); color:var(--success); border-color:rgba(47,125,89,0.2);">
          🧘‍♀️ Медитация
        </div>
        <h3>Медитация «Штиль после шторма» (10–15 минут)</h3>
        <p class="lead" style="font-size:13px; color:var(--nb-slate); margin-bottom:16px;">Медитация глубокого расслабления тела и остановки внутреннего диалога от Анатолия Фёдорова. Наденьте наушники и закройте глаза.</p>
        
        <div style="padding:10px; border-radius:14px; background:#F8FAFC; border:1px solid rgba(36,49,57,0.08);">
          <audio id="meditationAudio" controls preload="none" style="width:100%; accent-color:var(--nb-accent);">
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>
      </section>

      <!-- Next Step Navigation -->
      <section class="glass card text-center" id="next-lesson-section" style="display:none;">
        <p style="font-size:14px; line-height:1.5; color:var(--nb-deep); font-weight:600; margin-bottom:16px;">
          Вы выгрузили мысленную жвачку и дали телу выдохнуть. Но что на самом деле раскачивает ваши эмоции изнутри и бросает из ярости в чувство вины? Как встретиться со своими настоящими чувствами — разберём в Уроке 4.
        </p>
        <button onclick="safeHaptic('selection'); openScreen('19_lesson4.html');" class="primary-btn pulse">
          <span>Перейти к Уроку 4: Встреча с собой и Мудрой Я →</span>
        </button>
      </section>

    </div>
  </main>

  <script>
    function safeHaptic(style) {
        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
            } else if (window.notibot && typeof window.notibot.hapticImpact === 'function') {
                window.notibot.hapticImpact(style || 'light');
            }
        } catch(e) {}
    }

    function toggleCheckbox(label) {
        safeHaptic('light');
        label.classList.toggle('selected');
        const checkbox = label.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
    }

    let attempts = 3;

    // Load attempts from localStorage
    const savedAttempts = localStorage.getItem('s2_lesson3_attempts');
    if (savedAttempts !== null) {
        attempts = parseInt(savedAttempts, 10);
    }
    
    // Load result if completed
    const isCompleted = localStorage.getItem('s2_lesson3_completed');
    const savedResult = localStorage.getItem('s2_lesson3_block');
    
    document.addEventListener('DOMContentLoaded', () => {
        updateAttemptsUI();
        if (isCompleted === 'true' && savedResult) {
            try {
                const resultData = JSON.parse(savedResult);
                showResult(resultData.stabilizing_formula);
                
                // Show meditation and CTA
                document.getElementById('meditation-section').style.display = 'block';
                document.getElementById('next-lesson-section').style.display = 'block';
                setupAudio();
            } catch(e) {}
        }
    });

    function updateAttemptsUI() {
        const counterEl = document.getElementById('attempts-counter');
        const submitBtn = document.getElementById('submitBtn');
        counterEl.innerText = `Осталось попыток: ${attempts}`;
        if (attempts <= 0) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = 'Попытки закончились';
        }
    }

    async function submitTrainer() {
        if (attempts <= 0) return;
        
        safeHaptic('heavy');
        
        const raw_situation = document.getElementById('raw_situation').value.trim();
        const pain_justice = document.getElementById('pain_justice').value.trim();
        
        const checkboxes = document.querySelectorAll('#body-tension-options input[type="checkbox"]:checked');
        const body_tension = Array.from(checkboxes).map(cb => cb.value);
        
        if (!raw_situation || !pain_justice) {
            alert('Пожалуйста, заполните оба текстовых поля для лучшего результата.');
            return;
        }
        
        // UI Loading
        document.getElementById('trainer-form').style.display = 'none';
        document.getElementById('ai-loading').style.display = 'block';
        document.getElementById('ai-result').style.display = 'none';

        try {
            const response = await window.apiPost('/api/s2-lesson3-strategy', {
                raw_situation,
                pain_justice,
                body_tension
            });
            
            const stabilizing_formula = response.result || response.stabilizing_formula || "Мы услышали вас. Дышите глубоко. Вы в безопасности, и ваша боль имеет право быть признанной.";
            
            // Save state
            attempts -= 1;
            localStorage.setItem('s2_lesson3_attempts', attempts);
            localStorage.setItem('s2_lesson3_block', JSON.stringify({ raw_situation, pain_justice, stabilizing_formula }));
            localStorage.setItem('s2_lesson3_completed', 'true');
            
            showResult(stabilizing_formula);
            
            document.getElementById('meditation-section').style.display = 'block';
            document.getElementById('next-lesson-section').style.display = 'block';
            
            // Scroll to result
            setTimeout(() => {
                document.getElementById('ai-result').scrollIntoView({ behavior: 'smooth', block: 'center' });
                setupAudio();
            }, 300);
            
        } catch(error) {
            console.error('API Error:', error);
            alert('Произошла ошибка при анализе. Пожалуйста, попробуйте еще раз.');
            document.getElementById('trainer-form').style.display = 'block';
            document.getElementById('ai-loading').style.display = 'none';
        }
        updateAttemptsUI();
    }
    
    function showResult(formula) {
        document.getElementById('ai-loading').style.display = 'none';
        
        // We still show the form if they have attempts, but we collapse it or just leave it above
        if (attempts > 0) {
            document.getElementById('trainer-form').style.display = 'block';
        }
        
        const resEl = document.getElementById('ai-result');
        resEl.style.display = 'block';
        if (formula) {
            document.getElementById('ai-result-content').innerHTML = formula.replace(/\\n/g, '<br>');
        }
    }

    function setupAudio() {
        const audio = document.getElementById('meditationAudio');
        if (audio && window.resolveMediaUrl && !audio.src) {
            audio.src = window.resolveMediaUrl('shtil_posle_shtorma.mp3');
        }
    }
  </script>
</body>
</html>
"""

full_html = head_str + body_str
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(full_html)
