const $ = (s) => document.querySelector(s);
const messagesEl = $('#chatMessages');
const form = $('#chatForm');
const input = $('#messageInput');
const sendBtn = $('#sendBtn');
const mascotWrap = $('#mascotWrap');
let language = localStorage.getItem('samoura-language') || 'ar';
let conversation = [];
let toastTimer;

const dailyMessages = {
  ar: [
    'كل خطوة صغيرة تخطوها اليوم تقرّبك من الشخص الذي تحلم أن تكونه.',
    'ليس عليك أن تنجز كل شيء الآن؛ يكفي أن تبدأ بما تستطيع.',
    'امنح نفسك الوقت نفسه الذي تمنحه للأشياء التي تحبها.',
    'قد يكون يومك عاديًا، لكن قدرتك على صنع شيء جميل فيه ليست عادية.',
    'تذكّر أن التقدم الهادئ يظل تقدمًا، حتى لو لم يلاحظه أحد.'
  ],
  en: [
    'Every small step you take today brings you closer to who you hope to become.',
    'You do not have to do everything now. Starting with what you can is enough.',
    'Give yourself the same patience you give to the things you love.',
    'An ordinary day can still hold the beginning of something lovely.',
    'Quiet progress is still progress, even when nobody notices it.'
  ]
};
const compliments = {
  ar: [
    'فيك رغبة جميلة في اكتشاف المزيد، والفضول الصادق بداية أشياء رائعة.',
    'تستحق أن تتحدث مع نفسك بلطف، حتى في الأيام التي لا تسير كما تريد.',
    'وجودك له قيمة لا تحتاج إلى إثباتها بإنجاز أو مقارنة.',
    'من الجميل أنك تمنح نفسك فرصة جديدة بدل أن تستسلم من أول محاولة.',
    'لديك الحق في أن تفخر بالخطوات الصغيرة؛ فهي التي تصنع الطريق الطويل.',
    'أتمنى أن ترى في نفسك بعض اللطف الذي يراه الآخرون فيك.'
  ],
  en: [
    'Your curiosity can take you to wonderful places. Keep asking and exploring.',
    'You deserve to speak to yourself kindly, even on the days that feel difficult.',
    'Your worth does not depend on proving anything or comparing yourself to anyone.',
    'There is something lovely about giving yourself another chance.',
    'You are allowed to be proud of small steps. They build the longer journey.',
    'I hope you get to see some of the kindness in yourself that others may see.'
  ]
};
const i18n = {
  ar: {yourSpace:'مساحتك',chat:'الدردشة',needCompliment:'أحتاج مجاملة',liftMood:'ارفع معنوياتي',noteToSelf:'رسالة لنفسي',sideQuote:'لا بأس أن تتقدم ببطء، المهم ألّا تتوقف عن الإيمان بنفسك.',dailyNote:'تذكير لطيف لك',hereForYou:'سمورة هنا من أجلك',welcomeEyebrow:'ركن صغير لك وحدك',welcomeTitle:'أهلًا بك، يا جميل الروح',welcomeText:'خذ نفسًا عميقًا... أنت تستحق لحظة هادئة وكلمة طيبة.',mascotCaption:'أنا سمورة، صديقتك اللطيفة',dailyDose:'جرعة التحفيز اليومية',littleBoost:'دفعة لطيفة',quickTitle:'ماذا تحتاج الآن؟',complimentSub:'كلمات لطيفة لقلبك',boostSub:'لنستعد طاقتك الجميلة',noteSub:'اكتب لنفسك بحب',talkToSamoura:'تحدث مع سمورة',alwaysHere:'موجودة هنا لتسمعك',helloMessage:'مرحبًا بك! 💗 أنا سمورة. أخبرني كيف كان يومك، أو أخبرني بما تحتاجه الآن. أنا أستمع إليك.',suggest1:'قولي لي شيئًا جميلًا ♡',suggest2:'أحتاج دفعة معنوية ✧',inputPlaceholder:'اكتب ما في قلبك...',privacyNote:'مساحتك هنا هادئة؛ لا تُحفظ المحادثة بعد إغلاق الصفحة.',footerLine:'صُنعت بحب، لتذكّرك بأنك تستحق اللطف دائمًا.',dailyReminder:'تذكير لطيف لك',copied:'تم نسخ المجاملة 💗',copyFail:'لم أتمكن من النسخ تلقائيًا.',loading:'سمورة تفكر بكلمات لطيفة...',error:'حدث خطأ غير متوقع. حاولي مرة أخرى.',empty:'اكتب رسالة أولًا.'},
  en: {yourSpace:'YOUR SPACE',chat:'Chat',needCompliment:'I need a compliment',liftMood:'Lift my mood',noteToSelf:'A note to myself',sideQuote:'It is okay to move slowly. Just do not stop believing in yourself.',dailyNote:'A gentle reminder',hereForYou:'Samoura is here for you',welcomeEyebrow:'A little corner just for you',welcomeTitle:'Welcome, lovely soul',welcomeText:'Take a deep breath... you deserve a calm moment and kind words.',mascotCaption:'I’m Samoura, your gentle little friend',dailyDose:'YOUR DAILY DOSE OF MOTIVATION',littleBoost:'A LITTLE BOOST',quickTitle:'What do you need right now?',complimentSub:'Kind words for your heart',boostSub:'Let’s bring back your spark',noteSub:'Write to yourself with love',talkToSamoura:'Talk to Samoura',alwaysHere:'Here to listen',helloMessage:'Hello, lovely human! 💗 I’m Samoura. Tell me how your day is going, or what you need right now. I’m listening.',suggest1:'Tell me something lovely ♡',suggest2:'I could use some encouragement ✧',inputPlaceholder:'Write what is on your mind...',privacyNote:'A quiet space: this conversation is not saved after you close the page.',footerLine:'Made with love, to remind you that you always deserve kindness.',dailyReminder:'A gentle reminder for you',copied:'Compliment copied 💗',copyFail:'I could not copy it automatically.',loading:'Samoura is thinking of kind words...',error:'Something went wrong. Please try again.',empty:'Write a message first.'}
};
function tr(key){return (i18n[language] && i18n[language][key]) || key;}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);}
function dayIndex(){const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);}
function renderDaily(){const key=`samoura-daily-${language}-${dayIndex()}`;let saved=localStorage.getItem(key);if(saved===null){saved=String(dayIndex()%dailyMessages[language].length);localStorage.setItem(key,saved);}$('#dailyMessage').textContent=dailyMessages[language][Number(saved)%dailyMessages[language].length];$('#dailyDate').textContent=new Intl.DateTimeFormat(language==='ar'?'ar':'en',{weekday:'long',day:'numeric',month:'long'}).format(new Date());}
function applyLanguage(){document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(i18n[language][key])el.textContent=i18n[language][key];});document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));$('#languageBtn').textContent=language==='ar'?'EN':'عربي';$('#messageInput').placeholder=tr('inputPlaceholder');renderDaily();}
function addMessage(role,text){const row=document.createElement('div');row.className=`message-row ${role==='assistant'?'bot-row':'user-row'}`;const avatar=document.createElement('div');avatar.className='mini-avatar';avatar.textContent=role==='assistant'?'♡':'✿';const bubble=document.createElement('div');bubble.className=`message ${role==='assistant'?'bot-message':'user-message'}`;bubble.textContent=text;row.append(role==='assistant'?avatar:bubble,role==='assistant'?bubble:avatar);messagesEl.appendChild(row);messagesEl.scrollTop=messagesEl.scrollHeight;return row;}
function typingIndicator(){const row=document.createElement('div');row.className='message-row bot-row';row.id='typingRow';const av=document.createElement('div');av.className='mini-avatar';av.textContent='♡';const b=document.createElement('div');b.className='message bot-message';b.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';row.append(av,b);messagesEl.append(row);messagesEl.scrollTop=messagesEl.scrollHeight;}
async function sendMessage(text){const value=(text||input.value).trim();if(!value){showToast(tr('empty'));return;}input.value='';addMessage('user',value);conversation.push({role:'user',content:value});sendBtn.disabled=true;typingIndicator();try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:conversation,language})});const data=await res.json();$('#typingRow')?.remove();if(!res.ok)throw new Error(data.error||tr('error'));const reply=data.reply||tr('error');conversation.push({role:'assistant',content:reply});addMessage('assistant',reply);}catch(err){$('#typingRow')?.remove();addMessage('assistant',err.message||tr('error'));}finally{sendBtn.disabled=false;input.focus();}}
function celebrate(){mascotWrap.classList.remove('cheer');void mascotWrap.offsetWidth;mascotWrap.classList.add('cheer');setTimeout(()=>mascotWrap.classList.remove('cheer'),1300);}
function randomCompliment(){const arr=compliments[language];let recent=JSON.parse(sessionStorage.getItem('samoura-recent')||'[]');let choices=arr.map((_,i)=>i).filter(i=>!recent.includes(i));if(!choices.length){recent=[];choices=arr.map((_,i)=>i);}const pick=choices[Math.floor(Math.random()*choices.length)];recent.push(pick);sessionStorage.setItem('samoura-recent',JSON.stringify(recent.slice(-3)));return arr[pick];}
async function quickAction(action){if(action==='compliment'){const compliment=randomCompliment();celebrate();const row=addMessage('assistant',compliment);const copy=document.createElement('button');copy.className='copy-compliment';copy.textContent=language==='ar'?'نسخ المجاملة':'Copy compliment';copy.style.cssText='margin:0 52px 5px 0;border:0;background:transparent;color:#c17f92;font:11px Tajawal;cursor:pointer';copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(compliment);showToast(tr('copied'));}catch{showToast(tr('copyFail'));}});row.insertAdjacentElement('afterend',copy);return;}
 if(action==='boost'){sendMessage(language==='ar'?'أحتاج إلى دفعة معنوية. شجعني بكلمات صادقة وعملية.':'I need a little encouragement. Please give me sincere and practical words.');return;}
 if(action==='selfnote'){sendMessage(language==='ar'?'اكتب لي رسالة قصيرة أوجهها إلى نفسي، تذكرني بقيمتي وتشجعني بلطف.':'Write a short note from me to myself, reminding me of my worth and gently encouraging me.');return;}}
form.addEventListener('submit',e=>{e.preventDefault();sendMessage();});
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>quickAction(btn.dataset.action)));
document.querySelectorAll('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>$('#'+btn.dataset.scroll).scrollIntoView({behavior:'smooth'})));
document.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>sendMessage(language==='ar'?btn.dataset.prompt:btn.dataset.prompt==='أريد مجاملة صادقة ولطيفة.'?'Give me a sincere, kind compliment.':'I feel a little discouraged. Help me find my motivation again.')));
$('#languageBtn').addEventListener('click',()=>{language=language==='ar'?'en':'ar';localStorage.setItem('samoura-language',language);applyLanguage();});
$('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('dark');const dark=document.body.classList.contains('dark');localStorage.setItem('samoura-theme',dark?'dark':'light');$('#themeBtn').textContent=dark?'☀':'☾';});
if(localStorage.getItem('samoura-theme')==='dark'){document.body.classList.add('dark');$('#themeBtn').textContent='☀';}
applyLanguage();
