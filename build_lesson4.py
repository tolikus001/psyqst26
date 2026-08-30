import re
import json

def build():
    with open('out/client/19_lesson4.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    head_match = re.search(r'(?s)(<!doctype html>.*?</head>)', content, re.IGNORECASE)
    if not head_match:
        print("Head not found")
        return
        
    head = head_match.group(1)
    
    body = """
<body>
  <div id="maisonArtBackground"></div>
  
  <div id="loadingScreen" class="fixed inset-0 bg-[var(--nb-bg)] z-50 flex flex-col items-center justify-center transition-opacity duration-300">
    <div class="w-12 h-12 border-4 border-[var(--nb-accent)] border-t-transparent rounded-full animate-spin"></div>
    <p class="mt-4 text-[var(--nb-deep)] font-medium">Загрузка...</p>
  </div>

  <div class="app-shell flex flex-col min-h-screen relative z-10 p-4 pb-24">
    <div class="app max-w-md mx-auto w-full space-y-6">
      
      <div class="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/20">
        <h1 class="text-2xl font-bold text-center text-[var(--nb-deep)] mb-4">Встреча с Мудрой Собой</h1>
        <p class="text-[var(--nb-text-2)] text-center text-sm mb-6">
          За каждым вашим тяжелым состоянием на самом деле прячется сильное, правильное и здоровое убеждение. Давайте найдем вашу опору.
        </p>

        <div id="attemptsCounter" class="hidden mb-6 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--nb-accent)]/10 text-[var(--nb-sea)]">
            Осталось попыток: <span id="attemptsLeft" class="ml-1 font-bold">3</span>
          </span>
        </div>

        <div id="resultCard" class="hidden mb-8 p-6 bg-gradient-to-br from-[#F8FAF9] to-[#E8EDE7] rounded-xl border border-[var(--nb-accent)]/20 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-[var(--nb-gold)]/10 rounded-bl-full z-0"></div>
          <div class="relative z-10" id="resultContent"></div>
        </div>

        <div id="lessonForm" class="space-y-8">
          <!-- Step 1 -->
          <div class="space-y-3">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 1. Какое состояние вы чаще всего подавляете?</h2>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step1" value="Страх ненужности" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💔 Страх ненужности (пытаюсь заслужить любовь контролем и опекой)</span>
            </label>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step1" value="Тревога от пауз и молчания" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">⏳ Тревога от пауз и молчания (не выдерживаю неизвестность, требую ответа)</span>
            </label>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step1" value="Самоедство и стыд" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🕳 Самоедство и стыд («со мной тяжело, меня слишком много, я всё порчу»)</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step1" value="Глубокая усталость" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🪫 Глубокая усталость (хочу перестать всё тащить и просто опереться)</span>
            </label>

            <div class="mt-2">
              <input type="text" id="step1_custom" placeholder="✍️ Свой вариант..." class="w-full px-4 py-3 bg-white/60 border border-[var(--nb-line)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nb-accent)]/50 focus:border-[var(--nb-accent)] transition-all">
            </div>
          </div>

          <!-- Step 2 -->
          <div class="space-y-3 pt-4 border-t border-[var(--nb-line)]">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 2. Здоровые убеждения, которые за этим стоят</h2>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step2" value="Ценность существует сама по себе" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💎 «Моя ценность в отношениях существует сама по себе. Я достойна любви и уважения просто так, а не за бесконечный контроль»</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step2" value="Право на ясность" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💎 «Я имею полное право на ясность и открытость. В близких отношениях нормально разговаривать и предупреждать»</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step2" value="Мои чувства — норма" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💎 «Мои чувства — это норма. Быть эмоциональной и искренней — это моя глубина. Со мной всё в порядке»</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step2" value="Не обязана вывозить одна" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💎 «Я не обязана вывозить всё в одиночку. Ответственность делится на двоих, и я имею полное право на отдых и поддержку»</span>
            </label>

            <div class="mt-2">
              <input type="text" id="step2_custom" placeholder="✍️ Свой вариант убеждения..." class="w-full px-4 py-3 bg-white/60 border border-[var(--nb-line)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nb-accent)]/50 focus:border-[var(--nb-accent)] transition-all">
            </div>
          </div>

          <!-- Step 3 -->
          <div class="space-y-3 pt-4 border-t border-[var(--nb-line)]">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 3. Жизнь с реализованной потребностью</h2>
            <p class="text-sm text-[var(--nb-text-2)] italic text-center mb-2">Если бы эта ваша потребность была полностью реализована — как бы вы себя чувствовали? Что бы вы умели делать в общении и как бы изменились ваши отношения?</p>
            <textarea id="step3_text" rows="4" class="w-full px-4 py-3 bg-white/60 border border-[var(--nb-line)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nb-accent)]/50 focus:border-[var(--nb-accent)] transition-all resize-none" placeholder="Например: Я чувствовала бы спокойное достоинство. Умела бы прямо сказать о том, что мне важно, без крика и без страха. А в отношениях появилось бы доверие и тепло..."></textarea>
          </div>

          <!-- Step 4 -->
          <div class="space-y-3 pt-4 border-t border-[var(--nb-line)]">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 4. Взгляд на себя через 5–10 лет</h2>
            <p class="text-sm text-[var(--nb-text-2)] italic text-center mb-2">Представьте себя старше на 5–10 лет — женщину, которая уже живёт из этого состояния и свободно владеет этими умениями. Устраивает ли вас тот образ, который вы видите?</p>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="radio" name="step4_radio" value="Да, это именно та цельная, спокойная и уверенная женщина" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🌟 Да, это именно та цельная, спокойная и уверенная женщина, которой я хочу быть</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="radio" name="step4_radio" value="Да, от этого образа веет теплом, силой и спокойным достоинством" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💫 Да, от этого образа веет теплом, силой и спокойным достоинством</span>
            </label>

            <div class="mt-2">
              <textarea id="step4_custom" rows="3" placeholder="✍️ Опишите этот образ своими словами..." class="w-full px-4 py-3 bg-white/60 border border-[var(--nb-line)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nb-accent)]/50 focus:border-[var(--nb-accent)] transition-all resize-none"></textarea>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="space-y-3 pt-4 border-t border-[var(--nb-line)]">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 5. Послание и советы от Вас из будущего</h2>
            <p class="text-sm text-[var(--nb-text-2)] italic text-center mb-2">Какие главные советы Вы из будущего даёте себе сегодняшней? Какое утешение и слова поддержки она передаёт вам прямо сейчас?</p>
            <textarea id="step5_text" rows="4" class="w-full px-4 py-3 bg-white/60 border border-[var(--nb-line)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--nb-accent)]/50 focus:border-[var(--nb-accent)] transition-all resize-none" placeholder="Например: Перестань воевать и суетиться. Ты в безопасности. Твоя ценность никуда не денется. Береги себя и доверяй себе..."></textarea>
          </div>

          <!-- Step 6 -->
          <div class="space-y-3 pt-4 border-t border-[var(--nb-line)]">
            <h2 class="text-lg font-semibold text-[var(--nb-deep)] text-center">Шаг 6. Телесная интеграция поддержки</h2>
            <p class="text-sm text-[var(--nb-text-2)] italic text-center mb-2">Где в теле прямо сейчас отзываются эти слова поддержки и утешения?</p>
            
            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step6" value="Область сердца и грудь" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🫀 Область сердца и грудь (тепло, расширение)</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step6" value="Горло и шея" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🗣 Горло и шея (расслабление, уходит ком)</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step6" value="Живот и солнечное сплетение" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🧘‍♀️ Живот и солнечное сплетение (покой, заземление)</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step6" value="Плечи и спина" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">💆‍♀️ Плечи и спина (спадает груз, опускаются плечи)</span>
            </label>

            <label class="flex items-start p-4 bg-white/60 rounded-xl border border-[var(--nb-line)] hover:border-[var(--nb-accent)] transition-colors cursor-pointer group">
              <input type="checkbox" name="step6" value="Всё тело целиком" class="mt-1 w-5 h-5 text-[var(--nb-accent)] border-gray-300 rounded focus:ring-[var(--nb-accent)]">
              <span class="ml-3 text-[var(--nb-deep)] leading-tight group-hover:text-[var(--nb-sea)]">🌊 Всё тело целиком</span>
            </label>
          </div>

          <button id="submitBtn" class="w-full mt-8 bg-[var(--nb-sea)] text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:bg-[var(--nb-deep)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Зафиксировать опору с ИИ-попутчиком</span>
            <div id="btnSpinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>

        <div id="nextLessonContainer" class="hidden mt-10 pt-8 border-t border-[var(--nb-line)]">
          <p class="text-[var(--nb-deep)] text-center font-medium mb-6">
            Вы соединились со своими сильными убеждениями и получили поддержку от Мудрой Себя. Но как собрать все эти навыки в одну понятную систему на каждый день, чтобы не бояться срывов? Встречаемся на финальном Уроке 5.
          </p>
          <button id="nextLessonBtn" class="w-full bg-[var(--nb-accent)] text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:bg-[var(--nb-sea)] active:scale-[0.98] transition-all">
            Перейти к Уроку 5: Сборка Карты опоры
          </button>
        </div>

      </div>
    </div>
  </div>

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {}
      }
    }
  </script>

  <script>
    // --- Helpers ---
    function safeHaptic(style) {
      if (window.notibot && window.notibot.hapticImpact) {
        window.notibot.hapticImpact(style);
      } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    }

    function openScreen(htmlFile) {
      safeHaptic('light');
      if (window.notibot && window.notibot.openLink) {
        window.notibot.openLink(htmlFile);
      } else {
        window.location.href = htmlFile;
      }
    }

    async function apiPost(endpoint, data) {
      if (!window.notibotInitData) {
        const fakeResp = await new Promise(r => setTimeout(() => r({
          html: '<p class="font-bold text-lg mb-2">✨ Мудрая Я:</p><p class="text-gray-700 italic">"Ты имеешь право на отдых. Отпусти контроль, мир не рухнет."</p>'
        }), 1000));
        return fakeResp;
      }
      try {
        const response = await fetch('https://app.notibot.ru' + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Init-Data': window.notibotInitData
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('API Error');
        return await response.json();
      } catch (err) {
        console.error('API Post Error:', err);
        throw err;
      }
    }

    // --- State & Initialization ---
    const ATTEMPTS_KEY = 's2_lesson4_attempts';
    const MAX_ATTEMPTS = 3;

    function getAttempts() {
      const stored = localStorage.getItem(ATTEMPTS_KEY);
      return stored !== null ? parseInt(stored, 10) : MAX_ATTEMPTS;
    }

    function decrementAttempts() {
      let current = getAttempts();
      if (current > 0) {
        current -= 1;
        localStorage.setItem(ATTEMPTS_KEY, current.toString());
      }
      return current;
    }

    function updateAttemptsUI() {
      const attempts = getAttempts();
      const container = document.getElementById('attemptsCounter');
      const span = document.getElementById('attemptsLeft');
      
      if (attempts < MAX_ATTEMPTS) {
        container.classList.remove('hidden');
        span.textContent = attempts;
      }

      if (attempts <= 0) {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('submitBtn').classList.add('opacity-50', 'cursor-not-allowed');
      }
    }

    // Check previously completed result
    function checkCompleted() {
      const completed = localStorage.getItem('s2_lesson4_completed');
      const block = localStorage.getItem('s2_lesson4_block');
      const aiResult = localStorage.getItem('s2_lesson4_ai_result');
      
      if (completed === 'true' || aiResult) {
        // Show result and next button
        if (aiResult) {
          const resCont = document.getElementById('resultContent');
          resCont.innerHTML = aiResult;
          document.getElementById('resultCard').classList.remove('hidden');
        }
        document.getElementById('nextLessonContainer').classList.remove('hidden');
        // We do NOT hide the form or block it strictly, but they might be out of attempts.
        // The TZ says: "When attempts exhausted: screen NOT blocked, last result stays visible".
        updateAttemptsUI();
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      // Hide loader
      setTimeout(() => {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
          loader.classList.add('opacity-0');
          setTimeout(() => loader.style.display = 'none', 300);
        }
      }, 500);

      updateAttemptsUI();
      checkCompleted();

      document.getElementById('nextLessonBtn').addEventListener('click', () => {
        openScreen('20_lesson5.html');
      });

      document.getElementById('submitBtn').addEventListener('click', async () => {
        const attempts = getAttempts();
        if (attempts <= 0) {
          safeHaptic('error');
          alert('У вас закончились попытки.');
          return;
        }

        safeHaptic('medium');
        
        // Gather data
        const getChecked = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
        
        const step1 = getChecked('step1');
        const step1Custom = document.getElementById('step1_custom').value.trim();
        if (step1Custom) step1.push(step1Custom);

        const step2 = getChecked('step2');
        const step2Custom = document.getElementById('step2_custom').value.trim();
        if (step2Custom) step2.push(step2Custom);

        const step3 = document.getElementById('step3_text').value.trim();
        
        const step4Radio = document.querySelector('input[name="step4_radio"]:checked');
        let step4 = step4Radio ? step4Radio.value : '';
        const step4Custom = document.getElementById('step4_custom').value.trim();
        if (step4Custom) step4 += (step4 ? ' | ' : '') + step4Custom;

        const step5 = document.getElementById('step5_text').value.trim();
        const step6 = getChecked('step6');

        if (step1.length === 0 || step2.length === 0 || !step3 || !step4 || !step5 || step6.length === 0) {
          safeHaptic('error');
          alert('Пожалуйста, заполните все шаги и выберите хотя бы один вариант в каждом из них.');
          return;
        }

        const payload = {
          state: step1.join(', '),
          belief: step2.join(', '),
          needs_realized: step3,
          future_self: step4,
          advice: step5,
          body_integration: step6.join(', ')
        };

        const btn = document.getElementById('submitBtn');
        const spinner = document.getElementById('btnSpinner');
        btn.disabled = true;
        spinner.classList.remove('hidden');
        btn.classList.add('opacity-80');

        try {
          const resp = await apiPost('/api/s2-lesson4-strategy', payload);
          
          if (resp && resp.html) {
            safeHaptic('success');
            
            // Save state
            localStorage.setItem('s2_lesson4_block', JSON.stringify({
              state: payload.state,
              belief: payload.belief,
              future_self: payload.future_self,
              advice: payload.advice
            }));
            localStorage.setItem('s2_lesson4_completed', 'true');
            localStorage.setItem('s2_lesson4_ai_result', resp.html);
            
            // Decrement attempts
            decrementAttempts();
            updateAttemptsUI();

            // Display result
            document.getElementById('resultContent').innerHTML = resp.html;
            document.getElementById('resultCard').classList.remove('hidden');
            document.getElementById('nextLessonContainer').classList.remove('hidden');

            // Scroll to result
            document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            throw new Error('No HTML in response');
          }
        } catch (e) {
          console.error(e);
          safeHaptic('error');
          alert('Произошла ошибка при обработке. Пожалуйста, попробуйте еще раз.');
        } finally {
          btn.disabled = false;
          spinner.classList.add('hidden');
          btn.classList.remove('opacity-80');
          updateAttemptsUI(); // to re-disable if attempts are 0
        }
      });
    });
  </script>
</body>
</html>
"""

    with open('out/client/19_lesson4.html', 'w', encoding='utf-8') as f:
        f.write(head + "\n" + body)

    print("File built successfully.")

if __name__ == "__main__":
    build()
