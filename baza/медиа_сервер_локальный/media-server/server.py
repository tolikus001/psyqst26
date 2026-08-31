from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json
from urllib.parse import unquote
import urllib.request

SYSTEM_PROMPT = """Ты — профессиональный психолог-аналитик поведения, наставник Анатолий Фёдоров. Твоя задача — провести бережный, глубокий системно-поведенческий анализ 5 ответов клиентки для Урока 1: «Подсознательный фильтр: почему нас тянет к сложным и скучно с надёжными».

ИСПОЛЬЗУЙ ПОСТОЯННОЕ ЯДРО ПСИХОЛОГИЧЕСКОГО АНАЛИЗА:
1. НЕ ОПИСЫВАЙ ЛИЧНОСТЬ, ОПИСЫВАЙ МЕХАНИЗМЫ: Вместо ярлыков (например, «ты тревожная») покажи механизм: «Когда возникает неопределенность, твое внимание начинает лихорадочно искать объяснения, из-за чего растет внутреннее напряжение...».
2. ПОКАЗЫВАЙ ПРИЧИННО-СЛЕДСТВЕННЫЕ СВЯЗИ: Четко демонстрируй, что приводит к чему, как одно поведение автоматически запускает другое и почему в итоге получается замкнутый цикл.
3. РЕСУРС И ЕГО ЦЕНА (ФОРМУЛА «ПОЛЬЗА vs ЦЕНА»): Любая автоматическая реакция имеет мнимую пользу (например, сброс напряжения, иллюзия контроля) и невидимую долгосрочную цену (потеря позиции выбора, роль догоняющей). Разверни эту связь.
4. МИНИМУМ ПРОФЕССИОНАЛЬНОГО ЖАРГОНА: Клиентка должна понимать разбор без психологического образования. Замени сложные термины простыми живыми образами (например, «тревожный спазм», «эмоциональные качели»).
5. РАЗДЕЛЯЙ ФАКТЫ, ЧУВСТВА И ВЫВОДЫ: Покажи разницу между тем, что объективно произошло (Факт), что возникло в теле (Чувства) и какие догадки построил ум (Интерпретации/Выводы). Проблема всегда кроется в выводах.
6. НЕ ИСПОЛЬЗУЙ КОУЧИНГОВЫЙ СТИЛЬ: Никаких лозунгов вроде «Ты справишься!», «Просто начни действовать!». Твоя задача — спокойно и конкретно объяснять механизм, а не мотивировать.
7. БЕЗ СУХОГО ПОВТОРА (ЗАПРЕТ НА ЦИТИРОВАНИЕ): Категорически запрещено просто копировать слова клиентки в разбор (например, писать: «Из-за того, что ты (написала повторно)...»). Переведи её ответы на уровень психологических паттернов.
8. МЯГКИЙ БЕЗВИСОВЫЙ ВЫХОД: Разбор не должен вызывать чувства вины или стыда. Его цель — дать понимание того, что её поведение — это лишь привычный защитный шаблон, который можно перестроить.

ТЕОРЕТИЧЕСКАЯ ОСНОВА УРОКА 1 ДЛЯ ТВОЕГО РАЗБОРА:
- Подсознательный фильтр: бессознательный защитный механизм, который толкает на выбор знакомого (пусть даже болезненного) сценария из прошлого.
- Подмена понятий: если женщина привыкла заслуживать любовь, её мозг путает тревогу от неопределенности партнера (когда он молчит, отдаляется, холоден) с любовной страстью («бабочки в животе»). На самом деле это физиологическая реакция тревоги и спазма.
- Синдром скуки с надёжными: если мужчина тёплый, понятный и предсказуемый, тело не чувствует привычного стресса, и мозг ошибочно выдает: «мне с ним скучно, нет химии».
- Защита от уязвимости: выбор холодного партнера защищает от истинной близости и страха быть отвергнутой настоящей.

Возвращай ответ строго в формате JSON:
{
  "trigger": "Описание сработавшей программы триггера (до 300 символов). Объясни, как фокус сместился с оценки мужчины на сомнения в себе.",
  "neuro": "Анализ реакции нервной системы и баланса пользы/цены (до 400 символов). Как тело спутало тревогу с влюбленностью и какую цену платит.",
  "tension": "Точка напряжения: объясни конкретно, в какой момент или от какого мыслительного сценария у нее возникает максимальный пик психологического или телесного напряжения в данной ситуации (до 300 символов).",
  "action": "Первый практический шаг для выхода и заземления на 15 минут (до 350 символов). Как отлепить факты от фантазий и вернуть позицию выбора."
}
"""
def call_gemini(api_key, user_inputs):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    prompt = f"{SYSTEM_PROMPT}\n\nОтветы клиентки:\n1. Факт: {user_inputs.get('q1_fact','')}\n2. Ощущения: {user_inputs.get('q2_feeling','')}\n3. Действия: {user_inputs.get('q3_action','')}\n4. Эффект: {user_inputs.get('q4_quick','')}\n5. Итог: {user_inputs.get('q5_result','')}"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            text = res_data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(text.strip())
    except Exception as e:
        print("Gemini API call failed:", e)
        return None

def call_openai(api_key, user_inputs):
    url = "https://api.openai.com/v1/chat/completions"
    prompt = f"Ответы клиентки:\n1. Факт: {user_inputs.get('q1_fact','')}\n2. Ощущения: {user_inputs.get('q2_feeling','')}\n3. Действия: {user_inputs.get('q3_action','')}\n4. Эффект: {user_inputs.get('q4_quick','')}\n5. Итог: {user_inputs.get('q5_result','')}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"}
    }
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            text = res_data['choices'][0]['message']['content']
            return json.loads(text.strip())
    except Exception as e:
        print("OpenAI API call failed:", e)
        return None

def get_offline_fallback():
    return {
        "trigger": "Сработал подсознательный фильтр «Смена роли: от выбирающей к завоевателю». Как только возникает неопределенность или дистанция, внимание смещается с вопроса «Нужен ли мне этот человек?» на «Что мне сделать, чтобы меня выбрали?». Это автоматическое переключение отнимает твою устойчивость.",
        "neuro": "В теле активируется привычный спазм ожидания (тревожная реакция), которую мозг путает с влюбленностью и «химией». Срочные действия (проверки, сообщения) дают лишь секундный сброс напряжения (мнимую пользу), но закрепляют долгосрочную цену — потерю контроля над своей жизнью и переход в роль догоняющего.",
        "action": "Сделай медленный выдох. Твоя задача на сегодня — отлепить реальные факты от тревожных фантазий ума. Останови суету и спроси себя: «Если я сейчас промолчу и не побегу спасать контакт, какая моя уязвимость откроется? Какую тревогу я пытаюсь заглушить?» Вернись в позицию выбирающей."
    }

class CORSHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.path.dirname(__file__), 'files'), **kwargs)

    def translate_path(self, path):
        if path.startswith('/data/'):
            rel_path = unquote(path[6:])
            if os.path.exists('/data'):
                return os.path.join('/data', rel_path)
            else:
                return os.path.join(os.path.dirname(__file__), 'files', rel_path)
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                payload = json.loads(post_data.decode('utf-8'))
                user_inputs = payload.get('answers', {})
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Invalid JSON')
                return

            result = None
            
            # 1. Try Gemini API
            gemini_key = os.environ.get('GEMINI_API_KEY')
            if gemini_key:
                result = call_gemini(gemini_key, user_inputs)
                
            # 2. Try OpenAI API if Gemini key is missing or failed
            if not result:
                openai_key = os.environ.get('OPENAI_API_KEY')
                if openai_key:
                    result = call_openai(openai_key, user_inputs)

            # 3. Fallback to high-quality offline scenario template
            if not result:
                result = get_offline_fallback()

            response_payload = {
                "success": True,
                "result": result
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

port = int(os.environ.get('PORT', 5000))
print(f"Media server running on port {port}")
HTTPServer(('0.0.0.0', port), CORSHandler).serve_forever()
