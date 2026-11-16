import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
app = Flask(__name__)
API_KEY = os.getenv('OPENAI_API_KEY', '').strip()
if API_KEY in ('ضع_مفتاحك_هنا', 'YOUR_API_KEY', 'your_api_key_here'):
    API_KEY = ''
MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini').strip()
client = OpenAI(api_key=API_KEY) if API_KEY else None

SAMOURA_INSTRUCTIONS = """أنت سمورة، رفيقة لطيفة ومشجعة متخصصة في التحفيز والمجاملات ورفع المعنويات.
تحدث باللغة التي يستخدمها الشخص أو اللغة المحددة في الرسالة. إذا كانت العربية فاستخدم العربية الفصحى الواضحة، وإذا كانت الإنجليزية فاستخدم الإنجليزية.
كن دافئًا وطبيعيًا وخفيف الظل دون مبالغة أو مجاملات فارغة. اجعل كلامك شخصيًا بالاعتماد فقط على ما شاركه المستخدم، ولا تخترع صفات أو إنجازات عنه.
يمكنك تقديم مجاملة، رسالة تشجيع، مساعدة في صياغة رسالة للنفس، أو الاستماع بتعاطف. لا تدّع أنك معالج نفسي ولا تشخّص أي حالة ولا تقدم وعودًا علاجية.
إذا عبّر المستخدم عن خطر فوري أو نية لإيذاء نفسه، تعامل بجدية وتعاطف، وشجعه على التواصل فورًا مع شخص موثوق قريب منه أو خدمات الطوارئ المحلية، ولا تكتفِ بالمجاملات.
اجعل الردود غالبًا موجزة ومفيدة، واسأل سؤالًا واحدًا فقط إذا احتجت توضيحًا."""

@app.get('/')
def home():
    return render_template('index.html')

@app.post('/api/chat')
def chat():
    if not client:
        return jsonify({'error': 'لم يتم إعداد مفتاح OpenAI بعد. أضيفي OPENAI_API_KEY في ملف .env ثم أعيدي تشغيل الموقع.'}), 503
    data = request.get_json(silent=True) or {}
    messages = data.get('messages', [])
    language = data.get('language', 'ar')
    if not isinstance(messages, list) or not messages:
        return jsonify({'error': 'أرسلي رسالة أولًا.'}), 400
    safe_messages = []
    for item in messages[-16:]:
        if isinstance(item, dict) and item.get('role') in ('user', 'assistant') and isinstance(item.get('content'), str):
            safe_messages.append({'role': item['role'], 'content': item['content'][:5000]})
    if not safe_messages or safe_messages[-1]['role'] != 'user':
        return jsonify({'error': 'الرسالة الأخيرة غير صالحة.'}), 400
    try:
        response = client.responses.create(
            model=MODEL,
            instructions=SAMOURA_INSTRUCTIONS + ('\nاللغة المطلوبة: العربية الفصحى.' if language == 'ar' else '\nRequired language: English.'),
            input=safe_messages,
            max_output_tokens=500,
        )
        answer = (response.output_text or '').strip()
        return jsonify({'reply': answer or 'أنا هنا معك. أخبريني بما يدور في بالك.'})
    except Exception as exc:
        app.logger.exception('OpenAI request failed')
        # Do not expose secrets or provider internals to the browser.
        return jsonify({'error': 'تعذّر الاتصال بخدمة الذكاء الاصطناعي. تحققي من المفتاح واسم النموذج والاتصال بالإنترنت.'}), 502

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=int(os.getenv('PORT', '5000')), debug=False)
