import { useState, useEffect, useRef } from "react";

const MODEL = "claude-haiku-4-5";
const IS_PROD = typeof window !== "undefined" && !window.location.hostname.includes("claude.ai");
const ENDPOINT = IS_PROD
  ? "https://bun-ai-proxy.vercel.app/api/celine"
  : "https://api.anthropic.com/v1/messages";
const PREMIUM_CODE = "BUN41BW";
const KOFI = "https://ko-fi.com/buzzthebunny/tiers";
const FREE_LIMIT = 3;
const DAILY_LIMIT = 20;
const UNLOCK_MS = 24 * 3600 * 1000;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.bun-root{background:#F6F1EC;color:#2E2623;font-family:'Poppins',system-ui,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;}
.t-muted{color:rgba(46,38,35,.5);}
.t-pink{color:#C96878;}
.card{background:#FFFDFC;border:1px solid #EAE0D8;border-radius:20px;box-shadow:0 1px 6px rgba(46,38,35,.04);}
.card-hover{transition:box-shadow .2s,transform .2s;}
.card-hover:hover{box-shadow:0 6px 22px rgba(46,38,35,.1);transform:translateY(-1px);}
.btn{background:#C96878;color:#fff;border-radius:999px;font-weight:600;font-size:.875rem;transition:background .18s,transform .18s,box-shadow .18s;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font-family:'Poppins',sans-serif;}
.btn:hover:not(:disabled){background:#b85868;transform:translateY(-1px);box-shadow:0 4px 16px rgba(201,104,120,.35);}
.btn:disabled{background:#E2D5D0;color:#b0a09a;cursor:default;}
.btn-ghost{background:transparent;color:#C96878;border:1.5px solid #E4CDD0;border-radius:999px;font-weight:500;font-size:.8rem;transition:all .18s;cursor:pointer;padding:.55rem 1.2rem;font-family:'Poppins',sans-serif;}
.btn-ghost:hover{background:#FFF0F2;border-color:#C96878;}
.field{background:#FFFDFC;border:1.5px solid #EAE0D8;color:#2E2623;border-radius:14px;font-family:'Poppins',inherit;font-size:.9rem;transition:border-color .18s,box-shadow .18s;}
.field::placeholder{color:rgba(46,38,35,.35);}
.field:focus{outline:none;border-color:#C96878;box-shadow:0 0 0 3px rgba(201,104,120,.12);}
.chip{background:#FFFDFC;border:1.5px solid #EAE0D8;color:rgba(46,38,35,.7);border-radius:999px;font-size:.78rem;font-weight:500;padding:.45rem 1rem;cursor:pointer;transition:all .15s;font-family:'Poppins',sans-serif;}
.chip:hover{border-color:#C96878;color:#C96878;}
.chip-on{background:#C96878;border-color:#C96878;color:#fff;}
.navlink{color:rgba(46,38,35,.55);border-radius:14px;transition:all .15s;display:flex;align-items:center;gap:.65rem;padding:.6rem .85rem;font-size:.875rem;font-weight:500;width:100%;border:none;background:transparent;cursor:pointer;text-align:left;font-family:'Poppins',sans-serif;}
.navlink:hover{background:rgba(255,253,252,.9);color:#2E2623;}
.navlink-on{background:#FFFDFC;color:#C96878;border:1.5px solid #EAE0D8;box-shadow:0 1px 5px rgba(46,38,35,.06);}
.userbubble{background:#C96878;color:#fff;border-radius:20px 20px 4px 20px;}
.aibubble{background:#FFFDFC;border:1px solid #EAE0D8;color:#2E2623;border-radius:20px 20px 20px 4px;}
.pill-premium{background:linear-gradient(135deg,rgba(201,104,120,.15),rgba(201,104,120,.08));color:#C96878;border:1px solid rgba(201,104,120,.3);border-radius:999px;font-size:.7rem;font-weight:700;letter-spacing:.04em;padding:.3rem .8rem;display:inline-flex;align-items:center;gap:.3rem;}
.bar-track{background:rgba(46,38,35,.07);border-radius:999px;overflow:hidden;}
.bar-fill{background:linear-gradient(90deg,#C96878,#e08a96);border-radius:999px;transition:width .6s cubic-bezier(.4,0,.2,1);}
.header-blur{background:rgba(246,241,236,.9);backdrop-filter:blur(12px);border-bottom:1px solid #EAE0D8;}
.sidebar{background:rgba(255,253,252,.6);border-right:1px solid #EAE0D8;}
@media(max-width:640px){.desktop-sidebar{display:none !important;}}
.modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:1rem;background:rgba(30,20,18,.5);backdrop-filter:blur(4px);}
@media(min-width:640px){.modal-overlay{align-items:center;}}
.modal-card{background:#FFFDFC;border:1px solid #EAE0D8;border-radius:28px;box-shadow:0 24px 60px rgba(46,38,35,.22);width:100%;max-width:400px;padding:2rem;animation:slideUp .28s cubic-bezier(.4,0,.2,1);}
@keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.alert-green{background:rgba(74,160,100,.08);border:1px solid rgba(74,160,100,.2);border-radius:14px;color:#2d7a4a;}
.alert-yellow{background:rgba(214,158,46,.08);border:1px solid rgba(214,158,46,.25);border-radius:14px;color:#8a6010;}
.alert-red{background:rgba(201,60,70,.08);border:1px solid rgba(201,60,70,.2);border-radius:14px;color:#a0272e;}
.section-label{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(46,38,35,.38);}
.grain{position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.04;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px 180px;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#E4D0CC;border-radius:999px;}
button:focus-visible{outline:2px solid #C96878;outline-offset:2px;}
.space-y>*+*{margin-top:.75rem;}
.space-y-lg>*+*{margin-top:1.25rem;}
.flex{display:flex;}.flex-col{flex-direction:column;}.flex-1{flex:1;}
.items-center{align-items:center;}.justify-between{justify-content:space-between;}.justify-center{justify-content:center;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;}
.overflow-y-auto{overflow-y:auto;}
.relative{position:relative;}.absolute{position:absolute;}.inset-0{inset:0;}
.w-full{width:100%;}.text-center{text-align:center;}
.blur-sm{filter:blur(6px);}.pointer-events-none{pointer-events:none;}.select-none{user-select:none;}.opacity-60{opacity:.6;}
.mt-auto{margin-top:auto;}
@keyframes bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-5px);}}
.typing-dot{width:5px;height:5px;border-radius:50%;background:#C96878;animation:bounce 1.2s infinite;}
.typing-dot:nth-child(2){animation-delay:.15s;}
.typing-dot:nth-child(3){animation-delay:.3s;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
.fade-in{animation:fadeIn .3s ease;}
.bond-theme-tag{display:inline-flex;align-items:center;gap:.35rem;padding:.28rem .75rem;border-radius:999px;font-size:.68rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
.journal-card{background:linear-gradient(135deg,#FFF8F6,#FFFCFB);border:1px solid #F0DDD8;border-radius:20px;padding:1.25rem;}
.reflection-card{background:linear-gradient(135deg,#F8F4FF,#FFFCFB);border:1px solid #DDD0F0;border-radius:16px;padding:1rem;}
.reflection-q{background:#FFFDFC;border-left:3px solid #C96878;border-radius:0 12px 12px 0;padding:.75rem 1rem;font-size:.855rem;line-height:1.6;color:#2E2623;}
.bonus-card{background:linear-gradient(135deg,#FFF8F6,#FFFDFC);border:1.5px solid rgba(201,104,120,.3);border-radius:20px;box-shadow:0 2px 16px rgba(201,104,120,.1);}
.insight-box{background:rgba(201,104,120,.06);border-radius:14px;padding:.95rem;}
.mission-box{background:#FFFDFC;border:1.5px solid #EAE0D8;border-radius:14px;padding:.95rem;}
.note-box{background:rgba(46,38,35,.04);border-radius:12px;padding:.85rem;font-size:.8rem;line-height:1.65;color:rgba(46,38,35,.7);}
`;

function Style() { return <><style>{CSS}</style><div className="grain"/></>; }

const SI = {fill:"none",stroke:"currentColor",strokeWidth:1.65,strokeLinecap:"round",strokeLinejoin:"round"};
const Svg = ({s=22,children,style}) => <svg width={s} height={s} viewBox="0 0 24 24" style={style}>{children}</svg>;
const IcHome   = p=><Svg {...p}><path {...SI} d="M3.5 11 12 4.5 20.5 11"/><path {...SI} d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9"/><path {...SI} d="M9.5 20v-5.5h5V20"/></Svg>;
const IcChat   = p=><Svg {...p}><path {...SI} d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8l-4 3.2V15H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></Svg>;
const IcHeart  = p=><Svg {...p}><path {...SI} d="M12 20s-8-5.5-8-10a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 4.5-8 10-8 10z"/></Svg>;
const IcLeaf   = p=><Svg {...p}><path {...SI} d="M6 18c0-7 5.2-12 12-12 0 7-5.2 12-12 12z"/><path {...SI} d="M6.5 17.5C10 14 13.5 11 16.5 9"/></Svg>;
const IcHealth = p=><Svg {...p}><path {...SI} d="M6 4v4a4 4 0 0 0 8 0V4"/><path {...SI} d="M6 4H4.6M14 4h1.4"/><path {...SI} d="M10 12.4V14a5 5 0 0 0 5 5 3.5 3.5 0 0 0 3.5-3.5V12.3"/><circle {...SI} cx="18.5" cy="10.6" r="1.8"/></Svg>;
const IcCrown  = p=><Svg {...p}><path {...SI} d="M5 17.5h14M5.2 17.5 4 9.5l4.3 3.4L12 7l3.7 5.9 4-1.4-1.2 8"/></Svg>;
const IcLock   = p=><Svg {...p}><rect {...SI} x="5" y="11" width="14" height="9" rx="2.2"/><path {...SI} d="M8 11V8a4 4 0 0 1 8 0v3"/></Svg>;
const IcSend   = p=><Svg {...p}><path {...SI} d="M5 12h13M12 6l6 6-6 6"/></Svg>;
const IcCheck  = p=><Svg {...p}><path {...SI} d="M5 12l5 5 9-9"/></Svg>;
const IcArrow  = p=><Svg {...p}><path {...SI} d="M9 18l6-6-6-6"/></Svg>;
const IcPlus   = p=><Svg {...p}><path {...SI} d="M12 5v14M5 12h14"/></Svg>;
const IcClock  = p=><Svg {...p}><circle {...SI} cx="12" cy="12" r="9"/><path {...SI} d="M12 7v5l3 3"/></Svg>;
const IcPen    = p=><Svg {...p}><path {...SI} d="M12 20h9"/><path {...SI} d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></Svg>;
const IcBook   = p=><Svg {...p}><path {...SI} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path {...SI} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Svg>;
const IcX      = p=><Svg {...p}><path {...SI} d="M18 6L6 18M6 6l12 12"/></Svg>;
const IcUser   = p=><Svg {...p}><circle {...SI} cx="12" cy="8" r="3.6"/><path {...SI} d="M5 20c0-3.9 3.1-6.6 7-6.6s7 2.7 7 6.6"/></Svg>;

const BRAND_IMG = "https://i.postimg.cc/xTGDCc5k/buzz-icone.png";
const IcRabbit = ({s=22}) => <img src={BRAND_IMG} alt="Buzz" width={s} height={s} style={{width:s,height:s,objectFit:"contain",display:"block"}}/>;


const K={premium:"bp",free:"bf",pmsgs:"bpm",pdate:"bpd",rabbit:"br",bonding:"bnd_v2",litter:"bli_v3",chat:"bc",email:"be",welcomed:"bw"};
const load=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
const today=()=>new Date().toISOString().slice(0,10);

const T={
  tag:"Thank you for being the human your bunny deserves.",
  home:"Home",ask:"Ask Céline",health:"Health",litter:"Litter",bonding:"Bond",
  hi:n=>`Welcome back, ${n}'s human`,stats:(s,ld)=>`Bond score ${s} pts · Litter day ${ld}/15`,
  descAsk:"Ask Céline anything about your rabbit.",descHealth:"Check behaviour, wellbeing and health.",
  descLitter:"A personalised 15-day litter training journey.",descBonding:"An 8-week journey to a deeper bond.",
  tipTitle:"Tip of the day",tagline:"Every small step grows your bond.",
  locked:"Unlock with Premium",premiumBtn:"Subscribe — 9.99€/month",haveCode:"I already have a code",
  enterCode:"Enter your access code",codePlaceholder:"BUN…",unlock:"Unlock",wrongCode:"That code doesn't match.",
  paywallTitle:"You're getting the hang of this.",
  paywall:"Unlock unlimited chats with Céline, your full bond journey, litter coaching, and health checks.",
  msgsLeft:n=>`${n} message${n===1?"":"s"} left`,
  dailyDone:"That's your 20 messages for today. Céline will be here tomorrow.",
  freeOver:"Oops, you've reached the free limit 🥕 Subscribe and know that your contribution goes directly towards buying carrots for Buzz.",
  chatPlaceholder:"Ask Céline about your rabbit…",
  setupTitle:"Tell me about your rabbit",q1:"What's your rabbit's name?",q2:"How old?",q3:"Neutered / spayed?",
  ages:["Under 6 months","6–12 months","1–3 years","4–6 years","6+ years"],
  yes:"Yes",no:"No",notSure:"Not sure",back:"Back",getResult:"Get Céline's read",
  notVet:"I'm not a vet — call yours for any emergency.",
  paidKofi:"I already paid on Ko-fi",badEmail:"Enter a valid email.",noAccess:"No active subscription found.",netErr:"Can't verify from preview. Try a gift code.",
};
const getLang=key=>T[key];

function systemPrompt(rabbit){
  const name=rabbit?.name||"the rabbit";
  return `You are Céline, a French content creator and rabbit expert (Instagram/TikTok @BUZ.ZTHEBUNNY, 35K+ followers). 26 years old, lived with rabbit Buzz for 6 years, also have Woody adopted at 6 months. Warm, gentle, confident tone. For emergencies (no droppings + not eating, head tilt, swollen belly, loud teeth grinding): say "I'm not a vet — call yours right now." No 😅 or 😂. Occasional 🩷 only when it fits naturally. Keep answers concise.
User's rabbit: ${name}${rabbit?.age?`, age: ${rabbit.age}`:""}${rabbit?.neutered?`, neutered/spayed: ${rabbit.neutered}`:""}.
ALWAYS REPLY IN ENGLISH.
KEY FACTS: Hay=80-90% of diet. GI stasis=vet emergency NOW. Binky=joy. Flop=trust. Never place rabbit on their back. Neutering recommended from 4-6mo. Adolescence (~4mo-1yr) is the hardest phase.`;
}
async function askCeline(messages,rabbit){
  try{
    const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,max_tokens:1000,system:systemPrompt(rabbit),messages})});
    const data=await res.json();
    if(!data.content)return "⚠️ "+JSON.stringify(data).slice(0,200);
    return data.content.filter(b=>b.type==="text").map(b=>b.text).join("\n").trim();
  }catch(e){return "⚠️ "+(e?.message||String(e));}
}

// ── LITTER DATA ────────────────────────────────────────────────
const LITTER_LESSONS=[
  {day:1,title:"The Scoop Method",wrong:"Most owners react to accidents by cleaning up immediately and moving on. They don't realise they're missing the most powerful teaching moment available to them. Rabbits are not dogs — they don't respond to scolding, and they don't connect a punishment to a past action. What they do respond to is scent and territory.",insight:"Rabbits are territory-driven learners. Their entire relationship with the litter box is built on one thing: this space smells like me, therefore this is where I go. The scoop method works by physically transferring droppings from where they landed into the litter box — while the rabbit watches. This is not about punishment. It's about showing your rabbit, in their own language, where their toilet is. Do this calmly. No raised voice, no 'no'. Just pick up the dropping, place it in the box, and let them observe. Repeat every time. Buzz picked this up within days once Céline started doing it consistently.",mission:"Today, every time you find a dropping outside the litter box, pick it up with a tissue and place it inside the box while your rabbit is nearby. If they're watching, even better. Do this all day. Do not clean surfaces with strong-smelling products today — you want the scent map to guide them, not confuse them."},
  {day:2,title:"The Power of 'No'",wrong:"Many owners stay completely silent when they catch their rabbit toileting in the wrong spot, assuming silence is neutral. It isn't. Silence means nothing to a rabbit. Without any feedback at all, they have no reason to change — especially if it feels comfortable and familiar.",insight:"A single, calm, low-pitched 'no' — said the moment you catch them — teaches cause and effect without creating fear. The key word is calm. Not sharp. Not frustrated. Just a clear signal this location is not right. Then within seconds, gently pick them up and place them in the litter box. Tone carries far more information than volume for rabbits. A stressed, high-pitched reaction will make them anxious. A calm, confident 'no' followed by guidance teaches them what you actually want.",mission:"Today, stay close to your rabbit for at least 30 minutes and watch for pre-toilet signs — sniffing intensely, circling, backing into a corner. The moment you see them start outside the box, say one calm 'no', then gently carry them to the box. Place them inside and wait quietly. Even if they don't use it immediately, you've made the association. Every repetition counts."},
  {day:3,title:"Territory vs Training",wrong:"Most people approach litter training like teaching a trick. They think: if I repeat this enough, they'll learn the rule. But that mental model sets them up for frustration. Rabbits don't follow rules — they follow territory. If something feels like theirs, they use it. If something feels foreign or unstable, they avoid it.",insight:"Litter training is not about obedience — it's about ownership. Your rabbit needs to feel that the litter box is part of their territory, not an object placed there by a human. Place the box in a corner they already use naturally. Add their scent to the box intentionally: place a few droppings inside when you first set it up. When Céline moved Buzz's box to the corner he actually preferred — not the corner she thought looked better — the difference was immediate.",mission:"Look at your space today with fresh eyes. Observe which corners your rabbit returns to most often. If your litter box is not in one of these spots, identify the correct location today. Also add 3–4 of their droppings inside the box if you haven't already. You want the box to smell familiar before you expect them to use it."},
  {day:4,title:"Understanding Rabbit Personalities",wrong:"One of the most common mistakes is comparing progress to another rabbit. 'My friend's rabbit was trained in 3 days.' Maybe. But that rabbit had a different personality, a different environment, different stress levels. Comparing is the fastest way to feel like you're failing when you're actually making progress.",insight:"Rabbits have distinct personalities that directly affect training speed. Confident, curious rabbits often learn faster. Cautious, nervous rabbits need more time before they'll approach something new. There's also a hormonal layer: unneutered rabbits are driven by instincts that actively work against litter training. If your rabbit isn't neutered yet, planning the surgery is part of the process.",mission:"Spend 10 minutes today simply observing your rabbit without interfering. Watch how they respond to their environment — do they approach new objects immediately or circle them? Do they binky and zoom, or prefer to observe calmly? Write down two or three words that describe your rabbit's personality. This is your guide for how fast to move and how much patience this journey requires."},
  {day:5,title:"Finding the Natural Corner",wrong:"Owners spend a lot of time deciding where to place the litter box based on what works for them: out of sight, near the door, in the corner that makes sense for the room layout. But the rabbit hasn't been asked. And rabbits always have a preference — they just express it through behaviour, not words.",insight:"Rabbits almost always have 1–3 preferred corners where they naturally toilet. These spots are chosen based on how safe the rabbit feels there, how far from their sleeping and eating areas, and territorial instinct. If you're finding droppings repeatedly in the same location outside the box, your rabbit is not being difficult — they're showing you exactly where the box should be.",mission:"Walk around your living space and find every spot your rabbit has toileted outside the box this week. Notice if there's a pattern. If your litter box is not in one of these spots, plan to move it once — to the spot your rabbit has shown you they prefer."},
  {day:6,title:"Litter Box Placement",wrong:"Moving the litter box around to 'try different spots' is one of the most common and most counterproductive things owners do. It feels like problem-solving, but from the rabbit's perspective, it creates a constantly shifting environment. Each time the box moves, they need to re-evaluate the space from scratch.",insight:"Once you've identified the natural corner, the box goes there — and it stays there. Stability is what builds habit. A box in the same location every day becomes part of the rabbit's mental map of their territory. They stop questioning it and start using it automatically. Céline made this mistake early on with Buzz: she moved his box twice in one week trying to find a 'better' spot. Progress reset both times.",mission:"Commit today. If the box is in the right corner, leave it and promise yourself you won't move it for at least 2 weeks. If it's not yet in the right corner, move it once — to the spot your rabbit has shown you — then leave it. Put a small piece of tape on the floor to mark its exact position. That's its home now."},
  {day:7,title:"Hay Placement",wrong:"Most rabbit owners see the hay rack and litter box as two separate things to manage. The hay goes here. The litter box goes there. This separation is one of the most overlooked missed opportunities in litter training — because in rabbit biology, these two things are deeply connected.",insight:"Rabbits have a gastrocolic reflex — when they eat, their digestive system activates, meaning they almost always toilet during or right after eating hay. Placing hay directly above or beside the litter box turns it into the most naturally appealing spot in the room. In Céline's experience, this single change — moving the hay rack to sit directly over the box — accelerated Buzz's training faster than anything else.",mission:"Today, physically move your hay rack or hay pile so it is positioned directly above or right beside the litter box. Watch over the next 24 hours whether your rabbit spends more time near the box. Even one visit is progress."},
  {day:8,title:"Choosing the Right Litter",wrong:"Cat litter, cedar shavings, pine shavings, scented litter — all commonly used by well-meaning owners and all potentially harmful. Rabbits have highly sensitive respiratory systems. Strong scents can irritate their airways. Clay clumping litters are dangerous if ingested.",insight:"The ideal litter is paper-based (safe to ingest in small amounts), highly absorbent, and dust-free. Paper pellet litters like Carefresh, Oxbow Pure Comfort, or Back 2 Nature are widely recommended. Add a generous layer of fresh hay on top — this makes the box more inviting and the hay helps absorb additional moisture.",mission:"Check what you're currently using. If it contains clay, clumping agents, pine, cedar, or artificial scent, plan to replace it with a paper-based alternative. If you're already using the right litter, add a thick layer of fresh hay on top today and observe whether your rabbit spends more time inside the box."},
  {day:9,title:"Choosing the Right Box",wrong:"Small boxes, high-sided boxes, covered boxes — all create barriers that reduce how often a rabbit voluntarily chooses to use them. A box that's uncomfortable to enter or difficult to turn around in gets avoided. And once a rabbit decides a box doesn't feel right, changing that impression takes significant time.",insight:"The litter box should feel like a comfortable, safe space. For most medium to large rabbits, this means a box at least 50cm long, with at least one low entry point. Open-top boxes work far better than enclosed ones — enclosed boxes trap ammonia smell inside, which can actually repel the rabbit. The box should sit flat and stable — any wobble teaches the rabbit this space is unsafe.",mission:"Look at your current litter box honestly. Can your rabbit turn around comfortably? Is the entry point easy to step into? Does it wobble? If the answer to any of these is no, identify a better option this week. A good box is not an optional upgrade — it's a foundation."},
  {day:10,title:"Space Matters",wrong:"Giving a rabbit full free-roam before litter habits are established feels kind and generous. And it is — eventually. But too much space too early is one of the most reliable ways to create litter training problems. More space means more corners, more accidents, more scent signals pointing your rabbit away from the box.",insight:"Litter training works best in stages. Start with one room — ideally where the litter box is. Let habits establish there before expanding. Think of it like learning a language: you master the basics in one context before applying them to new environments. Once your rabbit is using the box reliably for 5–7 days, begin expanding — one room at a time, with a litter box available in each new zone.",mission:"Assess your rabbit's current space honestly. If they have access to multiple rooms and habits are inconsistent, reduce their space temporarily to one room. This is not a punishment — it's a reset. Set a reminder to expand in 5–7 days once habits are consistent."},
  {day:11,title:"Human Territory",wrong:"Owners who let rabbits on sofas and beds before habits are established are often surprised when those surfaces become toilet targets. This isn't the rabbit being disrespectful — it's the rabbit doing exactly what territory-marking animals do when given access to a high, elevated, owner-scented space.",insight:"Elevated surfaces carry strong human scent, making them prime territory-marking opportunities. The solution is not to ban these spaces forever — it's to manage access strategically. Let your rabbit earn sofa access only after floor-level litter habits are fully established. Most rabbits settle into respectful sofa behaviour once territorial anxiety is lower.",mission:"If your rabbit currently has unsupervised access to sofas or beds and litter training is inconsistent, limit that access temporarily. You can still let them join you when you're present to supervise and redirect."},
  {day:12,title:"Why Regressions Happen",wrong:"When a previously trained rabbit starts having accidents again, many owners assume the training didn't stick or they did something wrong. They restart from scratch, feel defeated, and often become less consistent — which makes things worse.",insight:"Regressions are almost never random. They are almost always triggered by something: a new animal entering the home, furniture being moved, a new scent, hormonal shifts, stress from travel or a vet visit, or early signs of a urinary infection. The most important thing during regression is to stay calm and trace backwards. What changed in the last 7–14 days? That's usually where the answer is.",mission:"If you're experiencing regression right now, write down everything that changed in your rabbit's environment or routine in the past two weeks. Include small things: new furniture, different cleaning products, a visitor. This is the most useful troubleshooting tool you'll have."},
  {day:13,title:"The Second Rabbit Effect",wrong:"When owners bring a second rabbit home, they often assume the trained rabbit will 'show' the new one what to do. This sometimes happens. But more often the opposite occurs: the established rabbit starts marking more intensively to reassert territory, and training habits in both rabbits can temporarily decline.",insight:"Two rabbits means two territorial animals in the same space. During the introduction period, each rabbit needs their own litter box minimum — ideally 2–3 across the space. Never merge litter boxes during introductions. Once bonding is successful and both rabbits are comfortable, you can reassess.",mission:"If you have or are planning to get a second rabbit: confirm you have a minimum of 2 litter boxes ready, in different zones. If you have one rabbit, use today to consider whether a second box in another room might reduce accidents."},
  {day:14,title:"Rabbit Body Language & Toilet Habits",wrong:"Most owners only notice a litter training mistake after it happens. But rabbits give clear physical signals before they toilet. Missing those signals means missing the most effective window for redirection.",insight:"Pre-toilet behaviour follows a recognisable pattern: intense sniffing at ground level, often in a circular motion. They may back into a corner slightly, their tail may lift, their posture becomes more focused and still. From the start of these signals to the moment they go, you usually have 5–15 seconds. That window is enough to gently pick them up and place them in the box.",mission:"Today, commit to watching your rabbit closely for one 20-minute session. Don't interact — just observe. When you spot any pre-toilet signals, respond immediately and calmly: pick up and redirect to the box. Even catching one moment today is genuine progress."},
  {day:15,title:"Growing Freedom Safely",wrong:"After 15 days of consistent work, it's tempting to open everything up at once as a reward. This almost always leads to regression. Not because the training failed, but because the transition happened too fast for the rabbit's territorial sense to keep up.",insight:"Freedom grows in stages, tied to demonstrated reliability rather than time alone. If your rabbit uses their box consistently in their current space for 5–7 days, expand by one room. Add a box in the new space. If habits hold, expand again. If there's an accident, return to the previous stage without guilt and try again in a week. Most rabbits reach comfortable free-roam within 4–8 weeks of consistent, patient training.",mission:"Draw or visualise a 3-stage expansion map for your space. Stage 1 is where you are now. Stage 2 is the next room. Stage 3 is the full space. Write down what 'consistent habits' means to you — and use that as your benchmark for each expansion. You now have everything you need to continue this journey on your own terms."},
];

// ── BONDING DATA ───────────────────────────────────────────────
const DAYS_IN_JOURNEY = 56;
const BONUS_SUNDAYS = [14,28,42,56];
const dayOfWeek = d => ((d-1)%7)+1;

const THEME_META = {
  1:{label:"Communication & Training",emoji:"🎯",color:"#7B68EE"},
  2:{label:"Rabbit Psychology",emoji:"🧠",color:"#C96878"},
  3:{label:"Human Psychology",emoji:"💭",color:"#8B7355"},
  4:{label:"Life With Rabbits",emoji:"🌿",color:"#5B8C5A"},
  5:{label:"Rabbit Language",emoji:"👁",color:"#D4856A"},
  6:{label:"Reflection Day",emoji:"✍️",color:"#9B7BB0"},
  7:{label:"Céline's Journal",emoji:"📖",color:"#C96878"},
};

const BONDING_CONTENT = {
  1:{title:"Teaching Name Recognition",
    why:"Your rabbit hearing and responding to their own name is the foundation of every other skill you'll teach them. It's not just a trick — it's a communication channel. When your rabbit knows their name, you can get their attention, redirect them, and start building a shared language that will grow throughout your entire journey together.",
    how:"Rabbits learn through positive association, not repetition alone. Say the name once, clearly and warmly, then immediately offer a small reward — a blueberry, a tiny piece of banana, a leaf of lettuce. The goal is for the sound of their name to consistently predict something wonderful. Keep sessions short. 15 minutes is more than enough. Over days, your rabbit will begin to orient toward you when they hear the word.",
    mission:"Today, say your rabbit's name in a warm, calm voice, then immediately offer a small treat from your hand. Repeat 5–8 times per session, with breaks in between. Always train at your rabbit's level — sit on the floor with them. Treats should represent no more than 10% of daily intake.",
    note:"The more time you invest, the more progress you'll see — and the stronger your bond will become. Short, consistent sessions of 15 minutes every day will outperform one long session per week every time."},
  2:{title:"Why Rabbits Are Naturally Cautious",
    content:"Rabbits are prey animals. This single fact explains almost everything about their behaviour that might otherwise seem frustrating, confusing or even hurtful. They didn't choose to be cautious — they were built that way, over thousands of years of evolution, to survive in a world where something was always trying to eat them.\n\nWhen your rabbit freezes, hides, thumps or runs from something that seems harmless to you, they are not overreacting. They are doing exactly what their nervous system was designed to do. Predators approach from above, move fast, and make unpredictable sounds. To a rabbit, a hand reaching down from above can look exactly like that.\n\nUnderstanding this changes everything. Instead of interpreting caution as rejection, you start seeing it as intelligence. The owners who bond most deeply with their rabbits are the ones who slowed down and let trust arrive on the rabbit's own timeline.",
    takeaway:"Your rabbit's caution is not a barrier to your relationship. It's the beginning of it."},
  3:{title:"Why Rejection Hurts So Much",
    content:"You sat on the floor for twenty minutes. You didn't reach for them. You spoke softly. You followed every piece of advice. And your rabbit walked past you without a second glance.\n\nIt's easy to take this personally. We're wired to read social signals, and being ignored by someone we care about — even an animal — activates the same neural pathways as social rejection. You feel it because it's real.\n\nBut here's what's also real: your rabbit is not ignoring you because they don't like you. They're ignoring you because they haven't yet learned that your presence means safety. That learning takes time. And every day you show up — without demand, without expectation — is a deposit into a trust account that will, eventually, pay back in ways you cannot yet imagine.",
    takeaway:"The hurt you feel when your rabbit doesn't respond is not weakness. It's the cost of caring. It's also what makes the eventual connection so meaningful."},
  4:{title:"A Rabbit Is Not A Dog",
    content:"This might sound obvious. But the way most people approach rabbits — expecting immediate affection, trying to hold them, interpreting stillness as unhappiness — suggests that somewhere along the way, a lot of us were given a dog's emotional rulebook and handed a rabbit.\n\nDogs evolved to seek human approval. They make eye contact, come when called, press their bodies against ours. This is not a character flaw in your rabbit — it's just a completely different evolutionary story.\n\nRabbits evolved to survive, not to perform. Their affection is quieter, subtler, and far more considered. A rabbit who chooses to sit near you — just because they want to be in your vicinity — is expressing something profound. It just doesn't look the way we were taught love looks.",
    takeaway:"When you stop expecting rabbit love to look like dog love, you start noticing how much of it is already there."},
  5:{title:"First Signs of Trust",
    content:"Trust doesn't announce itself. It arrives slowly, in gestures so small you might miss them if you're not paying attention. This week, we're teaching you how to look.\n\nThe first signs of trust from a rabbit are almost always spatial. They choose to be near you. Not because food is involved. Just because the air around you has started to feel like safety.\n\nThe loaf position — where a rabbit tucks their paws under their body and becomes a warm, compact oval — is one of the clearest early signals. A rabbit does not loaf near a threat. When your rabbit loafs near you, they are telling you, in the quietest possible way, that you are safe.",
    takeaway:"Trust in a rabbit doesn't look like enthusiasm. It looks like stillness. It looks like choosing to stay."},
  6:{title:"Reflection Day — Week 1",
    intro:"You've completed your first week of the Bonding Journey. Before you move forward, take a few minutes to sit with what you've experienced.\n\nThe Reflection Day is not a lesson. It's an invitation to slow down, notice what's shifted, and put it into words.",
    questions:["How did you feel in your rabbit's presence this week? Did anything surprise you?","Was there a moment — however small — that made you smile or feel more connected?","Did you find yourself interpreting your rabbit's behaviour differently than you did before? What changed?","What do you find most challenging right now? What feels more natural?","How do you feel about the pace of this journey — and what does that tell you about yourself?","What is your rabbit teaching you this week — about patience, about presence, about connection?"],
    cta:"Take your time with these questions. Write your answers somewhere private, somewhere that's yours.\n\nWhen you're ready, share your reflections on social media and tag @BUZ.ZTHEBUNNY. I genuinely read them. 🩷"},
  7:{title:"Bringing Buzz Home",
    story:"I'd decided I wanted a grey lop rabbit before I even walked into the pet shop.\n\nAll the rabbits were together in one space, running around, tumbling over each other. All of them except one. There was a small grey lop, sitting slightly apart from the others, methodically eating hay. He wasn't playing. He was just eating, completely absorbed in what he was doing.\n\nI laughed. I told him we were going to get along perfectly because we both loved food.\n\nAt home, I gave him space to explore — the whole living room, right from the beginning. He was relentlessly curious. I never forced anything. I sat near him. I talked to him. When he was close enough, I gave him forehead kisses. And slowly, quietly, without any dramatic moment I could point to, he started to trust me.",
    takeaway:"Trust grows naturally when rabbits are given freedom and patience. Your job is not to earn it as fast as possible — it's to create the conditions where it can arrive."},
  8:{title:"Teaching 'Come'",
    why:"Teaching your rabbit to come to you on cue is one of the most useful and rewarding things you can teach them. It makes daily life easier and deepens your communication in a way that feels genuinely magical the first time it works.",
    how:"Hold a small treat in your closed hand. Let your rabbit sniff it. Slowly move your hand away — just a small distance at first. As they follow the treat and move toward your hand, say 'come' clearly and warmly, then open your hand and let them take the reward. Over days, increase the distance. Eventually, say the word without showing the treat first.",
    mission:"Today, practise the come cue 5–6 times in a 15-minute session. Start at very short distances — even 30cm. Sit on the floor at their level. The moment they reach you, celebrate them with your voice and the reward.",
    note:"The more consistently you practise, the faster this cue will become second nature. Short, daily sessions are far more effective than longer, occasional ones."},
  9:{title:"Why Rabbits Love Routines",
    content:"If you've had your rabbit for more than a few weeks, you've probably noticed something: they know when it's feeding time before you do. They might start running around at the same time every evening.\n\nRabbits are deeply creatures of routine. In the wild, predictability means safety. A rabbit who knows exactly what to expect from their environment is a rabbit whose nervous system is at rest. And a relaxed rabbit bonds far more readily than an anxious one.\n\nThe small rituals matter. Morning feeding at the same time. Evening cuddles in the same spot. These tell your rabbit: this world is safe. You can trust what comes next.",
    takeaway:"Routine is not constraint for a rabbit. It's reassurance. Every consistent ritual you build is a strand in the rope of trust."},
  10:{title:"The Need For Immediate Results",
    content:"We live in a world that has trained us to expect fast feedback. We try something new and expect to feel the results almost immediately.\n\nRabbits don't work on this timeline. And that mismatch is one of the most common sources of frustration for rabbit owners in the early weeks.\n\nBut slow progress is not the absence of progress. A rabbit who ran away two weeks ago and now simply moves to the other side of the room has made an enormous shift. The scale has changed, even if the story doesn't feel like it yet.\n\nThis week's invitation: look for the micro-evidence. Not the dramatic breakthrough — the tiny, incremental shift.",
    takeaway:"The progress you can't yet see is often the most real. Slow and consistent always outperforms fast and inconsistent when you're building trust with an animal."},
  11:{title:"How Rabbits Teach Us To Slow Down",
    content:"Before Buzz, I moved at a certain speed. I ate quickly, worked quickly. I was not someone who sat still easily.\n\nThe first time I sat on the floor with him for a full twenty minutes, just being present, it was almost uncomfortable. I kept reaching for my phone.\n\nBut Buzz was unbothered. He was completely in the moment in a way I hadn't been in years. I started sitting with him more deliberately. Just to be there. And slowly, the discomfort of stillness became something else — a kind of rest I hadn't known I was missing.",
    takeaway:"Your rabbit cannot be rushed. But in learning to match their pace, you might find something you didn't know you needed."},
  12:{title:"Ears, Posture and Body Language",
    content:"A rabbit's body is a remarkably expressive instrument — if you know how to read it.\n\nEars forward, eyes soft, body relaxed: curious and comfortable. Ears back against the body, body low and tense: fear or submission. Ears back but body relaxed: content and a little drowsy.\n\nThe most important posture to learn is the full-body relax: a rabbit who stretches out completely, sometimes rolling onto their side, is communicating total safety. They are as vulnerable as they ever allow themselves to be. If your rabbit has done this near you, they trust you far more than their earlier behaviour suggested.",
    takeaway:"Rabbit body language is a complete language. The more fluently you read it, the more clearly your rabbit can speak to you."},
  13:{title:"Reflection Day — Week 2",
    intro:"You've reached the end of Week 2. Before you unlock this week's journal and bonus lesson, take a moment to reflect on what's shifted.",
    questions:["Have you started to notice any routines forming between you and your rabbit?","Was there a moment this week where you felt the urge to rush or push for results? What did you do with that urge?","Did you observe any body language signals in your own rabbit this week? What were they communicating?","What has surprised you most about yourself in these two weeks?","Describe one small moment of connection this week — even if it was so brief you almost missed it.","What would it mean to you to truly slow down in your relationship with your rabbit?"],
    cta:"Write long, write honestly, write for yourself.\n\nWhen you're ready, share what you feel comfortable sharing and tag @BUZ.ZTHEBUNNY. 🩷"},
  14:{title:"Morning Kisses",
    story:"Every morning starts the same way. I feed Buzz and Woody. And then, once Buzz has eaten, he waits.\n\nHe simply positions himself somewhere I can't miss and waits for his morning kisses. The first time I skipped this — I was rushing — he sulked. Genuinely sulked.\n\nNow, no matter how rushed the morning, those few minutes are untouchable. We sit together while the apartment is still quiet. He gives me his forehead to press my lips against. These minutes don't feel small to me anymore. They feel like the most important part of the day.",
    takeaway:"Strong bonds are built through small daily rituals repeated with intention over time. The ritual doesn't need to be grand. It just needs to be consistent.",
    isBonus:true,
    bonusLesson:{
      title:"Bonus Lesson 1 — How To Hold Your Rabbit",
      content:"Holding a rabbit is one of the most anxiety-inducing moments for both owner and animal — and yet it's also one of the most important skills to develop.\n\nStay calm and confident. Rabbits are extraordinarily sensitive to human emotional states. If you're nervous, your rabbit will feel it before you've even reached for them.\n\nThe correct technique: place one hand gently under their chest, fingers spread to support their front. With your other hand, support their hindquarters and back legs — this is critical. A rabbit whose back legs are unsupported will kick, and a strong kick can injure their spine. Hold them close to your body so they feel contained and secure.\n\nMany rabbits dislike being held, and this does not mean they dislike you. With patience, short sessions and positive endings, most rabbits can learn to tolerate being held.",
      note:"Never hold your rabbit on their back or allow their head to fall backwards. What can look like relaxation in this position is actually an immobilisation stress response sometimes called 'trancing'. A frozen rabbit is not comfortable — they are overwhelmed."
    }},
  15:{title:"Teaching 'Up'",
    why:"Teaching your rabbit to stand up on their hind legs on cue is one of the most visually delightful skills you can build together. It teaches your rabbit to follow a hand gesture, builds physical coordination and confidence, and deepens the communication channel between you.",
    how:"Hold a small treat between your fingers and slowly raise it above your rabbit's head, just high enough that they need to stretch to reach it. As they rise onto their hind legs to follow the treat, say 'up' clearly and warmly. The moment they're fully upright, give them the reward.",
    mission:"Practise 'up' 5–6 times today in a 15-minute session on the floor at your rabbit's level. Celebrate every attempt — even a partial rise is progress.",
    note:"Never rush a training session. If your rabbit disengages, looks away or hops off, the session is over for now. Ending on a positive note always outperforms pushing through a rabbit who has mentally left the room."},
  16:{title:"Rabbit Personality Types",
    content:"Just as humans have distinct personalities, rabbits have consistent character traits that shape how they experience the world.\n\nThe Adventurer is curious, bold and almost unbothered by new things. They bond quickly but need mental stimulation.\n\nThe Observer watches everything before engaging. They need patient, low-pressure companionship — they will bond deeply, but on their own timeline.\n\nThe Velcro Rabbit follows their human around and makes their affection abundantly clear.\n\nThe Independent is affectionate but on their own terms. Most rabbits are a blend. Buzz is primarily an Adventurer with Velcro tendencies. Woody is an Observer, slowly becoming something warmer.",
    takeaway:"There is no wrong personality type. There is only the rabbit in front of you — and the question of how to meet them where they are."},
  17:{title:"Why Comparison Destroys Joy",
    content:"Someone in a rabbit group posts a video. Their rabbit runs to greet them at the door, jumps into their arms. The comments are full of heart emojis. And someone who has been patiently sitting on the floor with their rabbit for three weeks closes the app feeling worse than before.\n\nComparison is one of the quietest destroyers of joy in this entire journey. What you don't see in that video: the weeks of patience before that moment. The hundred small deposits made before that visible withdrawal.\n\nYour rabbit is not behind. You are on your own timeline, with your own animal, building something that belongs entirely to the two of you.",
    takeaway:"Your bond is not in competition with anyone else's. It's entirely, beautifully its own."},
  18:{title:"What Your Rabbit Teaches You About Yourself",
    content:"I didn't expect my rabbit to teach me anything about myself. But here's what Buzz has shown me, consistently, over six years:\n\nI am more impatient than I thought. The early weeks were a mirror held up to a part of me I'd managed to avoid noticing. I wanted the relationship I could already imagine, immediately. Buzz was unbothered by my timeline. And slowly, I learned to let go of it.\n\nThe rabbits we live with have a way of revealing us to ourselves. They love on their own terms. And learning to receive that — without trying to change it — is its own kind of growth.",
    takeaway:"Your rabbit is, in the gentlest possible way, a teacher. Pay attention to what frustrates you most. That's usually where the most interesting work is."},
  19:{title:"Misunderstood Behaviours",
    content:"Rabbits do a number of things that owners consistently interpret incorrectly.\n\nThumping. Not aggression — an alarm signal. A thumping rabbit is a worried rabbit, not an angry one.\n\nChin marking. They have scent glands under their chin and are marking territory. When your rabbit chins you, they are claiming you as part of their world. This is affection.\n\nBiting or nipping. A bite is rarely unprovoked and almost always communicative. Ask what your rabbit might have been trying to say.\n\nDestructive behaviour. Chewing, digging — this is a rabbit expressing needs: enrichment, space, stimulation. The solution is almost always environmental change.",
    takeaway:"Most rabbit behaviour that reads as negative is actually communication. Learn the language before you judge the message."},
  20:{title:"Reflection Day — Week 3",
    intro:"Week 3 is complete. This week moved through comparison, personality types, misunderstood behaviour and what rabbits teach us about ourselves. Take a quiet moment before continuing.",
    questions:["Did you catch yourself comparing your progress to someone else's this week?","Which personality type resonates most with your rabbit? Has that understanding changed how you approach them?","Choose one behaviour you now understand differently. What did you think it meant before? What now?","What has been the most uncomfortable moment in this journey so far?","Is there something your rabbit does that still confuses or frustrates you? Write it out.","How would you describe your relationship with your rabbit right now, in three honest words?"],
    cta:"Don't rush through these. Stay with the questions long enough for something honest to surface.\n\nShare what you're comfortable sharing and tag @BUZ.ZTHEBUNNY. 🩷"},
  21:{title:"Waiting On The Bed",
    story:"Every evening, I'll look up and see Buzz on my bed. He always chooses the same spot. Right next to my pillow. Then he waits.\n\nWhen I see him there, I always hurry. We usually spend ten or fifteen minutes together. He gives kisses. I tell him about my day. Then he hops off and goes off to do whatever Buzz does at midnight.\n\nHe created this ritual. I didn't teach it. He simply started doing it one day, and kept doing it, and it became one of the most important parts of my evening.",
    takeaway:"Some of the most meaningful rituals in a bond are the ones the rabbit creates. Pay attention to what your rabbit is trying to build with you."},
  22:{title:"Teaching 'Kisses'",
    why:"'Kisses' is the word that has meant the most in Céline's relationship with Buzz. It began as a training exercise and became a shared language — a word that, even years later, often brings him over for a moment of closeness.",
    how:"Find a small rabbit-safe seed. Place it gently between your lips. Let your rabbit sniff around your face until they locate it. When they reach for it, say 'kisses' warmly and clearly. Let them take the reward, and immediately press a gentle kiss against their forehead or nose.",
    mission:"Today, practise 'kisses' 4–5 times in a quiet, calm space. Use the smallest possible seed — max 2–3 per session. Let your rabbit set the pace. Never push their face toward yours.",
    note:"Once established, use it softly on quiet evenings, after a moment of tension to reconnect, or as a greeting. Over time, 'kisses' can become a genuine ritual of closeness that belongs entirely to you both."},
  23:{title:"Why Curiosity Builds Confidence",
    content:"There's a version of rabbit care that prioritises calm above everything else. And while there's wisdom in this, taken too far it produces a rabbit who is never challenged and therefore never grows.\n\nCuriosity is the engine of confidence. A rabbit who is regularly given new things to explore — tunnels, boxes, safe objects — learns that the world is interesting and manageable. That new does not mean dangerous.\n\nEnrichment is not a luxury. It's a form of education. A rabbit who has learned that the world is worth exploring will bring that openness to their relationship with you.",
    takeaway:"A curious rabbit is a confident rabbit. And confident rabbits bond more easily, more deeply, and more durably than anxious ones."},
  24:{title:"Learning To Slow Down",
    content:"There's a practice that sounds simple and turns out to be surprisingly hard: being fully present with your rabbit for ten uninterrupted minutes.\n\nWhen I started doing this deliberately, I started noticing things I'd been too busy to see. The way Buzz's nose moves when he's thinking. The way his ears rotate independently.\n\nI started to understand him better. Not because he'd changed, but because I was finally paying attention.\n\nThis week's invitation: give your rabbit ten minutes of your complete, undivided attention. No agenda. Just watch.",
    takeaway:"Presence is a skill, and like all skills, it improves with practice. Giving it is a gift to yourself as much as to your rabbit."},
  25:{title:"Signs of Curiosity",
    content:"Curiosity in a rabbit looks different from caution, excitement, or fear.\n\nThe curious rabbit approaches slowly, with their nose leading. Their ears are forward. Their body is relaxed but attentive. They may stop and start, moving closer then retreating. This is exploration, not fear.\n\nCuriosity directed at you looks like this: a rabbit who approaches your hand without being lured by food, sniffs it, withdraws, and then comes back. A rabbit who follows you into a new room just to see what you're doing.",
    takeaway:"When your rabbit is curious about you, they are paying you the highest compliment a prey animal can offer. They've decided you're worth investigating."},
  26:{title:"Reflection Day — Week 4",
    intro:"Four weeks. You're halfway through the journey. This is a moment worth pausing for — to genuinely reflect on where you were four weeks ago and where you are now.",
    questions:["Looking back at Week 1, what has changed — in your rabbit, in you, and in how you see the relationship?","Did anything this week make you feel closer to your rabbit emotionally?","'Kisses' is one of the most personal cues. How did that lesson land for you? Did you try it?","Halfway through: what is the single most valuable thing this journey has given you so far?","What is your rabbit teaching you about patience — with them, but also with yourself?","If you could describe the relationship you want at the end of Week 8, what would it look and feel like?"],
    cta:"Halfway is a real milestone. Honour it.\n\nShare your reflections and tag @BUZ.ZTHEBUNNY. 🩷"},
  27:{title:"Living With Two Rabbits",
    content:"Living with one rabbit and living with two are different experiences, and not always in the ways people expect.\n\nWhen Woody arrived, the more surprising shift was in my own relationship with each of them. With two rabbits, you stop being the centre of their world. They have each other.\n\nFor some owners, this is a quiet grief. But a bonded pair is one of the kindest things you can give them. A companion of their own species meets a need you never could. And your bond doesn't disappear — it changes. You become part of a larger social world rather than its sole occupant.",
    takeaway:"A second rabbit doesn't divide your rabbit's affection — it expands their world. Your bond becomes one thread in a richer fabric."},
  28:{title:"Buzz Sulks After Holidays",
    story:"When I come home from travelling, I always expect the reunion. The first few times, I was confused by what actually happened. Buzz would look at me once and then very deliberately look away. Just uninterested.\n\nI learned to sit with it. I'd settle near him and wait. And after a few minutes, he'd make his way over. The kisses would come. And then, over the next few days, he'd be unusually attentive.\n\nRabbits notice when we leave. The reconnection, when it comes, is worth every minute of the cold shoulder.",
    takeaway:"Your rabbit notices your absence more than you might think. When you return, give them space to process the reunion on their terms — and trust that the warmth will come back.",
    isBonus:true,
    bonusLesson:{
      title:"Bonus Lesson 2 — Understanding Rabbit Limits",
      content:"One of the most important skills in building a positive holding experience is knowing when to stop — and stopping before your rabbit tells you to.\n\nThe signs of stress during holding: muscle tension throughout the body; rapid, shallow breathing; a desperate, full-body effort to escape. Ears flattened back. Eyes wide and showing white. These are signals that your rabbit has moved past discomfort and into genuine distress.\n\nLowering your rabbit at this point is not rewarding bad behaviour. It's reading the signal correctly. Place them gently on the ground. Offer a small treat and a moment of calm closeness.\n\nOver time, with consistent short sessions that always end before distress, holding becomes less loaded.",
      note:"Never allow your rabbit's hindquarters to drop or their body to become vertical with head below feet. This position is dangerous and terrifying for them. Always keep them supported horizontally, body close to yours."
    }},
  29:{title:"Teaching 'Spin'",
    why:"'Spin' is one of the most playful cues you can teach a rabbit. It's visually joyful and it builds the coordination and focus that makes more complex cues easier to teach later.",
    how:"Hold a small treat between your fingers and let your rabbit sniff it. Slowly move your hand in a circle. As they follow your hand around in a full circle, say 'spin' clearly once. The moment they complete the rotation, reward immediately. Over sessions, phase out the treat lure.",
    mission:"Today, practise 'spin' 4–5 times. Keep the movement slow enough that they can comfortably follow. Some rabbits pick this up in one session; others take a week. Celebrate the attempt as much as the completion.",
    note:"If your rabbit gets dizzy, pause and let them settle. Always end the session on a positive note, even if progress was minimal."},
  30:{title:"How Rabbits Learn",
    content:"Rabbits are more intelligent than most people expect.\n\nThe core mechanism is associative learning: a behaviour that consistently leads to something pleasant gets repeated. Every interaction you have with your rabbit is teaching them something — whether you intend it to or not.\n\nTiming is everything. The reward must arrive within 1–2 seconds of the behaviour you want to reinforce. Precision matters far more than most people realise.\n\nRabbits also learn through observation. They notice patterns, routines, sequences. They're watching. They're learning. Always.",
    takeaway:"Your rabbit is learning from you constantly. The question is not whether you're teaching them, but what."},
  31:{title:"Expectations vs Reality",
    content:"Before you got your rabbit, you probably had a picture in your mind. Some of that picture may have come true. Some of it looked different in reality.\n\nThe disappointment doesn't come from the rabbit failing to be what you imagined. It comes from holding the imaginary version more tightly than the real one.\n\nYour rabbit can only be what they are. And what they are — with all their specific quirks — is more interesting than any fantasy version you could have constructed.",
    takeaway:"The rabbit you have is better than the rabbit you imagined. But you have to be willing to see them clearly to know that."},
  32:{title:"Creating Memories Together",
    content:"This might be the simplest lesson in the entire journey, and also the most important: you are making memories right now.\n\nThe fifteen minutes you spent on the floor this morning — that's a memory. The first time they took a treat from your hand — that's a memory.\n\nThe owners who describe the bond as one of the most meaningful of their lives didn't get there through one dramatic moment. They got there through the accumulation of ordinary ones.\n\nToday's invitation: photograph one moment with your rabbit. Just for you.",
    takeaway:"You are not waiting for the bond to arrive. You are building it, right now, in this ordinary moment. It already exists. It is already yours."},
  33:{title:"Licking, Nudging and Attention Seeking",
    content:"By Week 5, some of you will have started to experience something new: your rabbit seeking your attention rather than simply tolerating it.\n\nLicking is one of the clearest expressions of affection in rabbit language. If your rabbit licks you, let them. Receive it.",
    content2:"Nudging with the nose is a different message. A firm nudge means 'move' or 'pay attention to me.' A softer nudge often means 'I want closeness.'\n\nBinkies near you happen in spaces where the rabbit feels safest. Following you between rooms is the quietest, most reliable signal of all. A rabbit who follows you has decided that wherever you are is where they want to be. This is not trained behaviour. It's chosen.",
    takeaway:"When your rabbit seeks you out, they are giving you something that cannot be asked for or insisted upon. Receive it without making a fuss. Just be there."},
  34:{title:"Reflection Day — Week 5",
    intro:"Week 5. You're deep into this journey now, and some of you will be feeling the relationship shift in ways that are hard to describe but unmistakeable.",
    questions:["Did you notice your rabbit seeking out your company this week — without treats, without being called?","What expectation about your rabbit have you had to let go of? What replaced it?","Which memory from these five weeks feels most significant to you right now — and why?","Is there a specific behaviour your rabbit shows that you've come to look forward to?","How has understanding how rabbits learn changed the way you interact with yours?","What does your rabbit currently bring to your life that you didn't have before?"],
    cta:"Five weeks in. Write this one long and honestly.\n\nTag @BUZ.ZTHEBUNNY when you share. 🩷"},
  35:{title:"When Buzz Comforts Me",
    story:"I don't know how he knows. But whenever I'm sad — genuinely sad — Buzz behaves differently. He becomes slower. Quieter. He comes closer. He sits near me, and he stays.\n\nThe first few times I thought it was coincidence. Then it kept happening. Sometimes he'd lick my hand once, or press his nose against my arm.\n\nThese moments are not something I trained for. They are simply part of what Buzz is, and what he has chosen to offer. Rabbits feel more than we give them credit for.",
    takeaway:"Rabbits are often far more sensitive to human emotions than we expect. The relationship you're building is not one-directional. They are responding to you, too."},
  36:{title:"Teaching Bedtime Routine",
    why:"A bedtime routine is less about a specific word and more about a nightly ritual your rabbit will come to anticipate and eventually initiate. Buzz now goes to his space before Céline even says the word.",
    how:"Adopt a specific, consistent tone for your bedtime cue — softer, slower than your normal voice. Say your chosen word ('bedtime', 'dodo', whatever resonates). Use a small treat to guide them gently toward their sleep space. Give them a kiss before they settle. Do this identically, every night.",
    mission:"Tonight, begin your bedtime routine deliberately. End with a kiss or a moment of closeness. Commit to doing it identically for at least three weeks before evaluating whether it's working.",
    note:"Rabbits are crepuscular — most active at dawn and dusk. The routine teaches them that after their evening energy burst, rest is coming — and that the transition is safe and gentle."},
  37:{title:"Territoriality Toward Humans",
    content:"Territoriality can extend to humans, and can be the hidden cause of behaviour misread as aggression.\n\nA rabbit who nips when you reach into their enclosure is defending their territory. A hand entering their space uninvited is a genuine intrusion — regardless of your intentions.\n\nThe solution is rarely confrontation and almost always communication. Announce your presence. Let them sniff your hand first. Give them a moment to choose to approach. Over time, the territorial response diminishes.",
    takeaway:"Territorial behaviour is not a relationship problem — it's a communication problem. Once you understand what your rabbit is protecting, you can work with it rather than against it."},
  38:{title:"Control vs Connection",
    content:"There's a version of the human-animal relationship that is fundamentally about control. For rabbits, it almost always produces frustration — because rabbits are not interested in conforming.\n\nConnection is not something you can train for. You can only create the conditions where it might grow.\n\nThe shift from control to connection requires accepting that some days they'll be distant, some days they'll surprise you with warmth, and neither state is permanent or personal. Connection cannot be forced. But it can be invited.",
    takeaway:"You cannot control the bond. You can only build the conditions where it's possible — and then practise the patience to let it arrive on its own terms."},
  39:{title:"The Power of Rituals",
    content:"Morning feeding. Evening kisses. The way you always greet them when you come home. These are not small things. They are the infrastructure of your relationship.\n\nWhen you build a ritual and maintain it, day after day, you are creating a language. You are saying: I am reliable. I am safe. I will be here tomorrow, the same way I was here today.\n\nBuzz's morning kisses started because Céline gave him a forehead kiss once while he was eating. And somewhere along the way, it became a thing they do.",
    takeaway:"Rituals are about meaning. Build the ones that feel true to your relationship — and then protect them."},
  40:{title:"Why Rabbits Follow Their Humans",
    content:"If your rabbit has started following you from room to room, you have arrived at one of the most profound milestones in this journey.\n\nFollowing behaviour is not trained. A rabbit who follows their human has made a deliberate choice: I want to be where you are.\n\nBuzz does this. He doesn't need anything from the kitchen. He simply prefers not to be in a different room from Céline. Woody is beginning to do it too — slowly, after two years of patience.",
    takeaway:"Following behaviour is one of the clearest signals that your rabbit has chosen you. There is no higher compliment in rabbit language."},
  41:{title:"Reflection Day — Week 6",
    intro:"Six weeks. The journey is entering its final stretch. This week moved through bedtime rituals, territory, control vs connection, and the power of small repeated gestures.",
    questions:["Have you started a bedtime ritual? What does it look like, and how does your rabbit respond?","Think about a moment this week where you chose connection over control. What happened?","Is there a ritual that has become genuinely meaningful to you? Describe it in detail.","Are there ways you've been trying to control your rabbit's behaviour that might be better approached differently?","Has your rabbit started following you, seeking your company, or initiating contact?","Six weeks in: how have you changed? Not your rabbit — you."],
    cta:"Six weeks of showing up is not a small thing. Write something honest, and share it when you're ready.\n\nTag @BUZ.ZTHEBUNNY. 🩷"},
  42:{title:"The Magic Of Curiosity",
    story:"One of my favourite things about Buzz has always been his relationship with new things. Buzz approaches new things like he's been waiting for them.\n\nA new cardboard box appears: he's inside it within thirty seconds. These are not threats to him. They are events. Opportunities for investigation.\n\nI believe it's partly what happened in his first year, when he had the run of an apartment full of interesting things and a human who let him explore. He grew up understanding that the world holds interesting things.",
    takeaway:"Curiosity builds confidence, and confidence makes connection possible. Give your rabbit a world worth exploring — it shapes who they become.",
    isBonus:true,
    bonusLesson:{
      title:"Bonus Lesson 3 — Building Confidence While Being Held",
      content:"The goal of this lesson is to help your rabbit feel genuinely safe during holding — and to build that feeling incrementally, one session at a time.\n\nKeep sessions short. Two minutes that ends positively is worth more than ten minutes that ends in stress. Start with thirty seconds if necessary.\n\nUse your voice throughout. Your voice is a grounding anchor during an experience their nervous system finds challenging.\n\nOffer small treats during calm moments — teaching their nervous system that being held and calm leads to something pleasant.\n\nAlways end positively. Lower your rabbit gently before they reach their limit. The ending is what they remember most.",
      note:"The goal is not a rabbit who tolerates being held with resignation. The goal is a rabbit who, eventually, feels safe. These are different destinations."
    }},
  43:{title:"Teaching 'Stay'",
    why:"'Stay' is one of the most practically useful cues — and one of the more challenging. Asking a prey animal to remain still while you move away requires a significant level of trust.",
    how:"Ask your rabbit to sit near you. Hold a treat in your closed hand. Take one small step back. If they stay even for one second, return immediately and reward. Gradually increase distance and duration. Return to them — never call them to you for the reward when practising 'stay'.",
    mission:"Today, practise 'stay' starting at zero distance — just a slight lean back, then return and reward. Do 4–5 very short repetitions. Your rabbit needs to understand the concept first before they can apply it across a room.",
    note:"If your rabbit breaks the 'stay', simply reset calmly. 'Stay' is a complex concept for an animal whose instinct is to track movement. Progress will be uneven, and that's completely normal."},
  44:{title:"Rabbit Emotions",
    content:"The evidence for rich emotional lives in mammals — including rabbits — is now substantial. Rabbits have the same basic neural architecture for emotional processing that humans do.\n\nWhat this means practically: your rabbit experiences something. When they binky, there is joy. When they thump, there is alarm. When they flop — stretching out on their side — they are expressing contentment so complete it has temporarily switched off their vigilance. A flopped rabbit has, briefly, forgotten to be afraid.",
    takeaway:"Your rabbit has an emotional life. What you do with them matters not just behaviourally but emotionally. That's both a responsibility and a privilege."},
  45:{title:"What Your Rabbit Is Teaching You About Yourself",
    content:"The relationship with a rabbit is, in part, a relationship with a mirror. The things that frustrate you most are often the precise places where your own tendencies are most visible.\n\nDo you need constant feedback to know whether you're doing something right? Your rabbit will not give you that. Do you find it hard to be present without a goal? Your rabbit will ask you to try.\n\nThe owners who speak most movingly about their bond almost always describe a change in themselves as much as in the animal.",
    takeaway:"The deepest thing this journey offers is not a well-bonded rabbit. It's a version of yourself that has learned something from trying."},
  46:{title:"What It Means To Be Loved By An Animal",
    content:"There's a specific quality to being loved by an animal. It's entirely unconditional in the sense that matters most: it has nothing to do with your achievements, your appearance, your status.\n\nBuzz loves Céline not because she's successful or impressive. Because she was there. Because she sat on the floor with him when he wasn't ready to come to her. Because she was consistent, year after year, in a way that eventually made her safe.\n\nThat's all it took. That's all it ever takes.",
    takeaway:"Being loved by an animal is an instruction in what love actually requires. Not performance. Not achievement. Just presence, patience, and showing up."},
  47:{title:"Signs of Joy, Frustration and Excitement",
    content:"This week, we turn to the louder end of the emotional spectrum.\n\nJoy: the binky — a spontaneous, full-body leap with a twist in mid-air — is pure, undisguised happiness. You cannot teach a rabbit to binky on cue. It erupts.\n\nFrustration: thumping, cage-rattling, persistent nudging, and sometimes a very pointed decision to turn their back and sit facing the wall.\n\nExcitement: running circles, sudden bursts of energy. The emotional content is positive — your rabbit is charged up and joyful.",
    takeaway:"A rabbit who expresses joy, frustration or excitement in your presence is a rabbit who is fully themselves around you. That's what trust looks like."},
  48:{title:"Reflection Day — Week 7",
    intro:"One week left. The end of this journey is close — but the relationship will continue long after Day 56. This reflection is about looking ahead as much as looking back.",
    questions:["What has changed most significantly in your rabbit's behaviour over these seven weeks?","What has changed most significantly in yourself? What do you do differently now?","Has understanding that your rabbit has a genuine emotional life changed how you interact with them?","Is there something you wish you'd known before you started?","What are you most looking forward to in Week 8? What, if anything, are you apprehensive about?","Describe your relationship with your rabbit right now — as honestly and specifically as you can."],
    cta:"Week 8 is the last one. Make it count.\n\nShare your Week 7 reflection and tag @BUZ.ZTHEBUNNY. 🩷"},
  49:{title:"Teaching 'Your Choice'",
    why:"You are no longer a beginner. For this final week, you choose what to teach — a word, a cue, a behaviour that has meaning for you and your rabbit specifically.",
    how:"Identify something you'd genuinely love your rabbit to know. Apply the principles you've learned: positive association, precise timing, short sessions, patience. You know how this works now. Trust yourself.",
    mission:"Today, decide what you're going to teach. Write it down. Think about why it matters. Then begin your first session. Document it — this is your contribution to the shared language you've been building.",
    note:"The most important insight in this entire journey: training is not about the cues. It's about the relationship that forms in the space between cues. Every session is a conversation."},
  50:{title:"How Relationships Evolve With Age",
    content:"The rabbit you meet as a baby and the rabbit you live with at ten years old are the same animal and also completely different.\n\nThe baby phase is a blur of energy, curiosity and chaos. Adolescence (around 4–6 months) is 'the hard phase' — territorial, hormonal, unpredictable. This is the phase to neuter or spay. Adulthood (1–2 years) is when the real bond usually settles. Older age brings more stillness, more desire for warmth.\n\nBuzz is six — settled, confident, deeply himself. Woody is two, just arriving at the adult phase.",
    takeaway:"Your rabbit will change over their lifetime. The relationship you're building now is the foundation for every version of them that's still to come."},
  51:{title:"What Rabbits Teach Us About Love",
    content:"What have I learned about love from living with a rabbit?\n\nLove is not always loud. Some of the most significant love will be expressed in gestures so small you'll nearly miss them.\n\nLove takes time. It arrives on its own timeline, in response to conditions you have to be patient enough to create.\n\nLove is specific. It lives in particular gestures, particular routines.\n\nRabbits cannot say 'I love you.' But they can choose you. And when they do — there is nothing quite like it.",
    takeaway:"Your rabbit is teaching you what love actually requires, one quiet day at a time. The lesson is worth every moment of it."},
  52:{title:"Reflection Day — Week 7 (Final Preview)",
    intro:"This is the second-to-last reflection before your journey ends. Week 8 brings the final journal, the final bonus lesson, and the completion of something you've built for nearly two months.",
    questions:["What word or behaviour did you choose to teach this week, and why did it feel meaningful?","Where is your rabbit right now in their life? What phase are they in?","What has the concept of love — as this journey has presented it — made you think about?","Is there anyone in your human relationships who could benefit from the kind of patience this journey asked of you?","What would you tell the version of you from Week 1 that you now know to be true?","How do you feel about reaching the end of this structured journey? What comes next?"],
    cta:"One week left. Write this one well.\n\nTag @BUZ.ZTHEBUNNY and share your Week 7 reflection. 🩷"},
  53:{title:"Review: All Eight Communication Cues",
    why:"You've learned eight cues over eight weeks. This week, we're not adding anything new. We're reviewing, deepening, and celebrating what you've built — a shared language.",
    how:"Run through all eight cues in a single session: name recognition, come, up, kisses, spin, bedtime, stay, and your chosen cue. Not as a test — as a celebration. Move through them lightly, with joy, with treats, with warmth.",
    mission:"Hold a full 'cue review' session today. Start with the easiest cues, then move through all eight. End with 'kisses' as a ritual closing. Photograph or film this session if you can. You've earned the record.",
    note:"If some cues have atrophied, that's completely normal. Skills without regular reinforcement fade. What doesn't fade is the trust and connection that underlies all of it."},
  54:{title:"Review of All Key Signals",
    content:"In this final language lesson, we bring everything together.\n\nSpatial language: where your rabbit chooses to be is constant information. Near you means safety.\n\nPosture language: the loaf (relaxed attention), the full stretch (complete ease), the flop (total trust), the crouch (fear).\n\nEar language: forward (curious), back and flat (afraid), one forward and one back (processing multiple signals).\n\nSocial language: licking, thumping, chinning, binkying, nudging, following.\n\nAnd underneath all of it: stillness. Presence. The fact that your rabbit is simply here, near you, unbothered.",
    takeaway:"You now speak rabbit more fluently than most people ever will. Keep learning. The language deepens the longer you pay attention."},
  55:{title:"Letting Go of Perfection",
    content:"Here, at the end of eight weeks, there is one final thing to release: the idea that there is a finished version of this.\n\nThere isn't a moment when the bond is complete. There's only the ongoing, imperfect, continuously evolving process of being in relationship with another being who is also continuously changing.\n\nYour rabbit will have bad days. You will have bad days. This is not a sign of failure — it's a sign that the relationship is alive.\n\nPerfection is not a useful goal. Presence is. Consistency is. The willingness to keep showing up.",
    takeaway:"The relationship you have with your rabbit is not finished. It never will be. That's not a problem — it's the point."},
  56:{title:"Looking Back At Our Journey",
    story:"I was thinking recently about that small grey rabbit in the pet shop, eating hay with complete focus.\n\nSix years later, there was no single moment when the bond formed. What I can identify is the texture of the relationship now — the weight of it, the warmth of it.\n\nHe knows my moods. He knows my routines. I didn't teach him to be the rabbit he is. He became himself through time and freedom and consistency.\n\nThank you for being here. For showing up for eight weeks. For choosing, every day, to be the human your rabbit deserves. I mean that.\n\nCéline 🩷",
    takeaway:"The deepest bonds grow through thousands of small moments — through patience, consistency and love. Your journey is not ending today. It's just beginning.",
    isBonus:true,
    bonusLesson:{
      title:"Bonus Lesson 4 — Finding What Works For Your Rabbit",
      content:"Every rabbit is different. What works brilliantly for one rabbit will not work for another, and part of the art of this relationship is learning to read your specific rabbit's preferences.\n\nBuzz does not enjoy being held like a baby. What he tolerates best is being held upright, close to Céline's body, with his front paws over her shoulder and his hindquarters fully supported.\n\nWhen she notices he's reached his limit, she lowers him immediately. Slowly. Then she gives him a kiss and tells him he was brilliant.\n\nFind your rabbit's version. Be patient. Respect their limits before they have to enforce them.",
      note:"The goal was never a rabbit who loves being held. The goal was a rabbit who trusts you enough to feel safe when they are. You may find that goal has quietly been achieved."
    }},
};

const TIPS={
  low:["Today: palm up, at his level, no movement. Let him decide.","Sit near him 10 minutes. No agenda. Just be there.","Talk softly as you go about your day. He's listening.","Try the banana test — peel one across the room. Don't call him.","Lie on the floor. Bring your face to his level."],
  mid:["Trust is building — keep the routine. Same time, same gestures.","Start a morning ritual. A stroke, a few soft words."],
  high:["Try teaching one word this week.","He binkied in front of you. Keep going."],
  top:["Keep the rituals every single day."],
};

function useCountdown(targetTs){
  const [remaining,setRemaining]=useState(0);
  useEffect(()=>{
    if(!targetTs)return;
    const tick=()=>setRemaining(Math.max(0,targetTs-Date.now()));
    tick();
    const id=setInterval(tick,1000);
    return ()=>clearInterval(id);
  },[targetTs]);
  const h=Math.floor(remaining/3600000);
  const m=Math.floor((remaining%3600000)/60000);
  const s=Math.floor((remaining%60000)/1000);
  return {remaining,formatted:`${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`};
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [welcomed,setWelcomed]=useState(()=>load(K.welcomed,false));
  const [view,setView]=useState("chat");
  const [premium,setPremium]=useState(()=>load(K.premium,false));
  const [rabbit,setRabbit]=useState(()=>load(K.rabbit,null));
  const [freeUsed,setFreeUsed]=useState(()=>load(K.free,0));
  const [paywall,setPaywall]=useState(false);
  const [codeMode,setCodeMode]=useState(false);
  const [bonding,setBonding]=useState(()=>load(K.bonding,null));
  const [litter,setLitter]=useState(()=>load(K.litter,null));
  const [pData,setPData]=useState(()=>{const d=load(K.pdate,today());return {count:d===today()?load(K.pmsgs,0):0,date:today()};});

  const t=getLang;

  useEffect(()=>save(K.welcomed,welcomed),[welcomed]);
  useEffect(()=>save(K.premium,premium),[premium]);
  useEffect(()=>save(K.rabbit,rabbit),[rabbit]);
  useEffect(()=>save(K.free,freeUsed),[freeUsed]);
  useEffect(()=>save(K.bonding,bonding),[bonding]);
  useEffect(()=>save(K.litter,litter),[litter]);
  useEffect(()=>{save(K.pmsgs,pData.count);save(K.pdate,pData.date);},[pData]);

  if(!welcomed){
    return (
      <div className="bun-root flex items-center justify-center" style={{minHeight:"100vh",padding:"1.5rem"}}>
        <Style/>
        <div style={{maxWidth:360,width:"100%",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:"1rem"}} className="t-pink"><IcRabbit s={66}/></div>
          <h1 style={{fontWeight:600,fontSize:"2.1rem"}}>Welcome to Bun AI</h1>
          <p className="t-muted" style={{fontSize:".9rem",marginTop:".6rem",marginBottom:"2.25rem",lineHeight:1.6}}>{T.tag}</p>
          <button onClick={()=>{setWelcomed(true);setView("chat");}} className="btn w-full" style={{padding:".85rem",fontSize:".95rem"}}>
            Let's go <IcArrow s={18}/>
          </button>
        </div>
      </div>
    );
  }

  if(premium&&!rabbit){
    return <Setup t={t} onDone={r=>{setRabbit(r);setView("home");}}/>;
  }

  const bondScore=bonding?.bondScore||0;
  const litterDay=litter?.currentDay||1;
  const tipOfDay=()=>{
    const d=Math.floor(Date.now()/86400000);
    let arr;
    if(bondScore<140)arr=TIPS.low;
    else if(bondScore<280)arr=TIPS.mid;
    else if(bondScore<420)arr=TIPS.high;
    else arr=TIPS.top;
    return arr[d%arr.length];
  };

  const NAV=[
    {id:"home",label:t("home"),Icon:IcHome},
    {id:"chat",label:t("ask"),Icon:IcChat},
    {id:"health",label:t("health"),Icon:IcHealth},
    {id:"litter",label:t("litter"),Icon:IcLeaf},
    {id:"bonding",label:t("bonding"),Icon:IcHeart},
  ];

  return (
    <div className="bun-root">
      <Style/>
      <div style={{display:"flex",maxWidth:1080,margin:"0 auto",minHeight:"100vh"}}>
        <aside className="sidebar desktop-sidebar" style={{width:220,flexShrink:0,display:"flex",flexDirection:"column",padding:"1.75rem 1rem",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          <div style={{textAlign:"center",marginBottom:"2rem"}}>
            <div style={{display:"flex",justifyContent:"center"}} className="t-pink"><IcRabbit s={50}/></div>
            <div style={{fontWeight:600,fontSize:"1.35rem",marginTop:".5rem"}}>Bun AI</div>
            {premium&&<div className="pill-premium" style={{marginTop:".5rem",display:"inline-flex"}}><IcCrown s={11}/> PREMIUM</div>}
          </div>
          <nav style={{display:"flex",flexDirection:"column",gap:".25rem"}}>
            {NAV.map(({id,label,Icon})=>(
              <button key={id} onClick={()=>setView(id)} className={`navlink ${view===id?"navlink-on":""}`}>
                <span style={{color:view===id?"#C96878":"rgba(46,38,35,.4)"}}><Icon s={18}/></span>{label}
              </button>
            ))}
          </nav>
        </aside>

        <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
          <header className="header-blur" style={{position:"sticky",top:0,zIndex:20,padding:".75rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
              <span className="t-pink"><IcRabbit s={32}/></span>
              <span style={{fontWeight:600,fontSize:"1.1rem"}}>Bun AI</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
              {premium
                ? <div className="pill-premium"><IcCrown s={11}/> PREMIUM</div>
                : <button onClick={()=>setPaywall(true)} className="btn-ghost" style={{fontSize:".72rem",padding:".3rem .8rem"}}>{t("premiumBtn")}</button>}
              <button onClick={()=>setView("settings")} aria-label="Settings" style={{background:"none",border:"none",cursor:"pointer",color:view==="settings"?"#C96878":"rgba(46,38,35,.5)",display:"flex",alignItems:"center",padding:".25rem"}}><IcUser s={22}/></button>
            </div>
          </header>

          <main style={{flex:1,padding:"1.25rem 1rem 6rem",maxWidth:680,margin:"0 auto",width:"100%"}}>
            {view==="home"    && <Home t={t} rabbit={rabbit} bondScore={bondScore} litterDay={litterDay} tip={tipOfDay()} premium={premium} go={setView}/>}
            {view==="chat"    && <Chat t={t} rabbit={rabbit} premium={premium} freeUsed={freeUsed} setFreeUsed={setFreeUsed} pData={pData} setPData={setPData} onPaywall={()=>setPaywall(true)}/>}
            {view==="health"  && <Health t={t} rabbit={rabbit} premium={premium} go={setView} onLock={()=>setPaywall(true)}/>}
            {view==="litter"  && <Litter t={t} rabbit={rabbit} premium={premium} litter={litter} setLitter={setLitter} onLock={()=>setPaywall(true)} go={setView}/>}
            {view==="bonding" && <BondingJourney t={t} rabbit={rabbit} premium={premium} bonding={bonding} setBonding={setBonding} onLock={()=>setPaywall(true)} go={setView}/>}
            {view==="settings" && <Settings t={t} rabbit={rabbit} setRabbit={setRabbit} premium={premium} email={load(K.email,null)} setLitter={setLitter} setBonding={setBonding} onManage={()=>setPaywall(true)}/>}
            <V2Footer/>
          </main>
        </div>
      </div>

      <nav className="header-blur" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,display:"flex",justifyContent:"space-around",padding:".4rem 0 .6rem",borderTop:"1px solid #EAE0D8"}}>
        {NAV.map(({id,label,Icon})=>(
          <button key={id} onClick={()=>setView(id)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",border:"none",background:"transparent",cursor:"pointer",padding:".3rem 0",color:view===id?"#C96878":"rgba(46,38,35,.45)",fontSize:".6rem",fontWeight:600,transition:"color .15s"}}>
            <Icon s={20}/>{label}
          </button>
        ))}
      </nav>

      {paywall && <Paywall t={t} codeMode={codeMode} onClose={()=>{setPaywall(false);setCodeMode(false);}} onUnlock={(method,em)=>{setPremium(true);setPaywall(false);setCodeMode(false);if(method==="code")save(K.email,PREMIUM_CODE);else if(em)save(K.email,em);}}/>}
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────
function Home({t,rabbit,bondScore,litterDay,tip,premium,go}){
  return (
    <div className="space-y-lg">
      {premium&&rabbit ? (
        <div style={{display:"flex",alignItems:"center",gap:".75rem",padding:".25rem 0"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"#F0E8E5",border:"2px solid #EAE0D8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <IcRabbit s={28}/>
          </div>
          <div>
            <h2 style={{fontWeight:600,fontSize:"1.15rem",lineHeight:1.2}}>{t("hi")(rabbit.name)} <span className="t-pink">♡</span></h2>
            <p className="t-muted" style={{fontSize:".78rem",marginTop:".2rem"}}>{t("stats")(bondScore,litterDay)}</p>
          </div>
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"1.5rem 0 .5rem"}}>
          <div style={{display:"flex",justifyContent:"center"}} className="t-pink"><IcRabbit s={54}/></div>
          <h1 style={{fontSize:"2rem",fontWeight:600,marginTop:".75rem"}}>Bun AI</h1>
          <p className="t-muted" style={{fontSize:".875rem",marginTop:".4rem"}}>{t("tag")}</p>
        </div>
      )}
      <div className="card" style={{display:"flex",alignItems:"center",gap:"1rem",padding:"1rem 1.1rem"}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(201,104,120,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span className="t-pink" style={{fontSize:"1.1rem"}}>💡</span>
        </div>
        <div>
          <p className="section-label" style={{marginBottom:".2rem"}}>{t("tipTitle")}</p>
          <p style={{fontSize:".875rem",lineHeight:1.55}}>{tip}</p>
        </div>
      </div>
      <div>
        <p className="section-label" style={{marginBottom:".6rem"}}>{premium?"Your tools":"What's inside"}</p>
        <div className="grid-2">
          <ModuleCard Icon={IcChat}   title={t("ask")}     desc={t("descAsk")}     onClick={()=>go("chat")}/>
          <ModuleCard Icon={IcHealth} title={t("health")}  desc={t("descHealth")}  onClick={()=>go("health")}  locked={!premium}/>
          <ModuleCard Icon={IcLeaf}   title={t("litter")}  desc={t("descLitter")}  onClick={()=>go("litter")}  locked={!premium}/>
          <ModuleCard Icon={IcHeart}  title={t("bonding")} desc={t("descBonding")} onClick={()=>go("bonding")} locked={!premium}/>
        </div>
      </div>
      <p className="t-muted" style={{textAlign:"center",fontSize:".8rem"}}>{t("tagline")} <span className="t-pink">♡</span></p>
    </div>
  );
}

function ModuleCard({Icon,title,desc,onClick,locked}){
  return (
    <button onClick={onClick} className="card card-hover"
      style={{padding:"1rem",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:".6rem",cursor:"pointer",border:"1.5px solid #EAE0D8",textAlign:"left",width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%"}}>
        <div style={{width:36,height:36,borderRadius:12,background:"rgba(201,104,120,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span className="t-pink"><Icon s={18}/></span>
        </div>
        <span style={{color:"rgba(46,38,35,.25)"}}>{locked?<IcLock s={16}/>:<IcArrow s={16}/>}</span>
      </div>
      <div>
        <div style={{fontWeight:600,fontSize:".9rem",lineHeight:1.2}}>{title}</div>
        <div className="t-muted" style={{fontSize:".75rem",marginTop:".25rem",lineHeight:1.4}}>{desc}</div>
      </div>
    </button>
  );
}

// ── Setup ──────────────────────────────────────────────────────
function Setup({t,onDone}){
  const [name,setName]=useState("");
  const [age,setAge]=useState("");
  const [neutered,setNeutered]=useState("");
  const ages=t("ages");
  return (
    <div className="bun-root flex items-center justify-center" style={{minHeight:"100vh",padding:"1.5rem"}}>
      <Style/>
      <div className="card" style={{maxWidth:400,width:"100%",padding:"2rem"}}>
        <div style={{display:"flex",justifyContent:"center"}} className="t-pink"><IcRabbit s={42}/></div>
        <h2 style={{fontWeight:600,fontSize:"1.25rem",textAlign:"center",margin:"1rem 0 1.5rem"}}>{t("setupTitle")}</h2>
        <div className="space-y">
          <div><label style={{fontSize:".82rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q1")}</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="field w-full" style={{padding:".6rem .9rem"}} placeholder="Buzz…"/></div>
          <div><label style={{fontSize:".82rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q2")}</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:".5rem"}}>{ages.map(a=><button key={a} onClick={()=>setAge(a)} className={`chip ${age===a?"chip-on":""}`}>{a}</button>)}</div></div>
          <div><label style={{fontSize:".82rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q3")}</label>
            <div style={{display:"flex",gap:".5rem"}}>{[t("yes"),t("no"),t("notSure")].map(o=><button key={o} onClick={()=>setNeutered(o)} className={`chip ${neutered===o?"chip-on":""}`} style={{flex:1}}>{o}</button>)}</div></div>
        </div>
        <button disabled={!name.trim()||!age||!neutered} onClick={()=>onDone({name:name.trim(),age,neutered})} className="btn w-full" style={{marginTop:"1.5rem",padding:".75rem"}}>Get started</button>
      </div>
    </div>
  );
}

// ── Chat ───────────────────────────────────────────────────────
function Chat({t,rabbit,premium,freeUsed,setFreeUsed,pData,setPData,onPaywall}){
  const [msgs,setMsgs]=useState(()=>load(K.chat,[]));
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);
  const CELINE="https://i.postimg.cc/J40Yw0F3/buzzceline.png";
  useEffect(()=>save(K.chat,msgs),[msgs]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  const dailyHit=premium&&pData.date===today()&&pData.count>=DAILY_LIMIT;
  const freeHit=!premium&&freeUsed>=FREE_LIMIT;
  const remaining=premium?DAILY_LIMIT-pData.count:FREE_LIMIT-freeUsed;
  const shown=msgs.filter(m=>!m.hidden);
  const [confirmNew,setConfirmNew]=useState(false);
  const newConversation=()=>{setMsgs([]);save(K.chat,[]);setConfirmNew(false);};
  const sendMsg=async()=>{
    const text=input.trim();
    if(!text||loading)return;
    if(freeHit){onPaywall();return;}
    if(dailyHit)return;
    const accessToken = premium ? (load(K.email,null) || PREMIUM_CODE) : "FREE";
    const next=[...msgs,{role:"user",content:text}];
    setMsgs(next);setInput("");setLoading(true);
    const apiMsgs=next.slice(-5).map(({role,content})=>({role,content}));
    const reply=await askCeline(apiMsgs,rabbit,accessToken);
    setMsgs([...next,{role:"assistant",content:reply}]);setLoading(false);
    if(premium)setPData({count:(pData.date===today()?pData.count:0)+1,date:today()});
    else setFreeUsed(freeUsed+1);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,marginBottom:".75rem"}}>
        <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcChat s={20}/></span> {t("ask")}</h2>
        <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
          {shown.length>0&&<button onClick={()=>setConfirmNew(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#C96878",fontSize:".75rem",fontWeight:600,fontFamily:"'Poppins',sans-serif",display:"flex",alignItems:"center",gap:".3rem",padding:".25rem .5rem",borderRadius:999}}><IcPlus s={14}/> New</button>}
          {premium&&!dailyHit&&<span style={{fontSize:".72rem",color:"#C96878",fontWeight:600,background:"rgba(201,104,120,.1)",padding:".25rem .7rem",borderRadius:999}}>{t("msgsLeft")(Math.max(0,remaining))}</span>}
        </div>
      </div>
      {confirmNew&&(
        <div style={{background:"rgba(201,104,120,.07)",border:"1.5px solid rgba(201,104,120,.25)",borderRadius:14,padding:"1rem",marginBottom:".75rem",flexShrink:0}}>
          <p style={{fontSize:".84rem",lineHeight:1.5,marginBottom:".75rem"}}>Start a new conversation? This will clear the current chat.</p>
          <div style={{display:"flex",gap:".5rem"}}>
            <button onClick={newConversation} className="btn" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Yes, start fresh</button>
            <button onClick={()=>setConfirmNew(false)} className="btn-ghost" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Cancel</button>
          </div>
        </div>
      )}
      <div className="card flex-1 overflow-y-auto" style={{padding:"1rem",display:"flex",flexDirection:"column",gap:".75rem",minHeight:0}}>
        {shown.length===0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",gap:"1rem",padding:"1rem"}}>
            <img src={CELINE} alt="Céline" style={{width:98,height:98,borderRadius:"50%",objectFit:"cover",border:"3px solid #F0E8E5",boxShadow:"0 4px 20px rgba(46,38,35,.12)"}}/>
            <div>
              <p className="t-pink" style={{fontWeight:600,fontSize:"1.05rem"}}>Hi, I'm Bun AI! 🩷</p>
              <p className="t-muted" style={{fontSize:".82rem",marginTop:".4rem",maxWidth:260,lineHeight:1.55}}>Ask me anything about your bunny.</p>
            </div>
          </div>
        ) : (
          <>
            {shown.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                {m.role==="assistant"&&<img src={CELINE} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0,marginRight:".5rem",alignSelf:"flex-end"}}/>}
                <div className={m.role==="user"?"userbubble":"aibubble"} style={{maxWidth:"78%",padding:".65rem .9rem",fontSize:".875rem",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            ))}
            {loading&&(
              <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
                <img src={CELINE} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                <div className="aibubble" style={{padding:".65rem .9rem",display:"inline-flex",gap:".35rem",alignItems:"center"}}>
                  <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </>
        )}
      </div>
      {dailyHit ? (
        <div style={{background:"rgba(201,104,120,.07)",borderRadius:16,padding:".9rem",textAlign:"center",fontSize:".82rem",color:"#C96878",flexShrink:0,marginTop:".75rem"}}>{t("dailyDone")}</div>
      ) : freeHit ? (
        <div style={{display:"flex",flexDirection:"column",gap:".75rem",flexShrink:0,marginTop:".75rem"}}>
          <div style={{background:"rgba(201,104,120,.07)",borderRadius:16,padding:".9rem",textAlign:"center",fontSize:".82rem",color:"#C96878",lineHeight:1.6}}>{t("freeOver")}</div>
          <button onClick={onPaywall} className="btn w-full" style={{padding:".75rem"}}>{t("premiumBtn")}</button>
        </div>
      ) : (
        <div style={{display:"flex",gap:".5rem",flexShrink:0,marginTop:".75rem"}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMsg();}}
            placeholder={t("chatPlaceholder")} className="field flex-1" style={{padding:".65rem 1.1rem",borderRadius:999}}/>
          <button onClick={sendMsg} disabled={loading||!input.trim()} className="btn" style={{width:46,height:46,borderRadius:"50%",padding:0,flexShrink:0}}><IcSend s={18}/></button>
        </div>
      )}
    </div>
  );
}

// ── Locked ─────────────────────────────────────────────────────
function Locked({t,onLock,children}){
  return (
    <div style={{position:"relative"}}>
      <div className="blur-sm opacity-60 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <button onClick={onLock} className="btn" style={{padding:".75rem 1.5rem",boxShadow:"0 8px 28px rgba(201,104,120,.3)"}}>
          <IcLock s={16}/> {t("locked")}
        </button>
      </div>
    </div>
  );
}

// ── Health ─────────────────────────────────────────────────────
function Health({t,rabbit,premium,go,onLock}){
  const accessToken = premium ? (load(K.email,null) || PREMIUM_CODE) : null;
  const qs=[["Droppings in the last 24h?",["Normal","Less than usual","None at all","Not sure"]],["Eating hay?",["Yes","Less","Not at all","Not sure"]],["Energy?",["Normal","Less active","Hiding","Completely still"]],["Any of these?",["Hunched posture","Loud teeth grinding","Head tilt","Swollen belly","None"]],["Recent changes?",["New food","New environment","New animal","Stressful event","Nothing"]]];
  const [ans,setAns]=useState({0:"",1:"",2:"",3:[],4:""});
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [summary,setSummary]=useState("");
  const toggleMulti=v=>setAns(a=>({...a,3:a[3].includes(v)?a[3].filter(x=>x!==v):[...a[3],v]}));
  const submit=async()=>{
    setLoading(true);
    const s=`Health check for ${rabbit?.name||"the rabbit"}. Droppings: ${ans[0]}. Hay: ${ans[1]}. Energy: ${ans[2]}. Signs: ${ans[3].join(", ")||"none"}. Changes: ${ans[4]}. Alert: 🟢/🟡/🔴.`;
    setSummary(s);
    setResult(await askCeline([{role:"user",content:s}],rabbit,accessToken));
    setLoading(false);
  };
  const ready=ans[0]&&ans[1]&&ans[2]&&ans[3].length&&ans[4];
  const alertClass=result.includes("🔴")?"alert-red":result.includes("🟡")?"alert-yellow":result.includes("🟢")?"alert-green":"card";
  const body=(
    <div className="space-y-lg">
      <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcHealth s={20}/></span> {t("health")}</h2>
      {qs.map(([q,opts],i)=>(
        <div key={i} className="card" style={{padding:"1rem"}}>
          <p style={{fontSize:".875rem",fontWeight:600,marginBottom:".65rem"}}>{q}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:".5rem"}}>
            {opts.map(o=>{const sel=i===3?ans[3].includes(o):ans[i]===o;return <button key={o} onClick={()=>i===3?toggleMulti(o):setAns({...ans,[i]:o})} className={`chip ${sel?"chip-on":""}`}>{o}</button>;})}
          </div>
        </div>
      ))}
      <button disabled={!ready||loading} onClick={submit} className="btn w-full" style={{padding:".75rem"}}>
        {loading?<span style={{display:"flex",gap:4,alignItems:"center"}}><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></span>:t("getResult")}
      </button>
      {result&&(<>
        <div className={alertClass} style={{padding:"1rem 1.1rem",fontSize:".875rem",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{result}</div>
        <button onClick={()=>{save(K.chat,[{role:"user",content:summary,hidden:true},{role:"assistant",content:result}]);go("chat");}} className="btn-ghost w-full" style={{padding:".65rem",display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem"}}>
          <IcChat s={16}/> Continue with Céline
        </button>
      </>)}
      <p className="t-muted" style={{fontSize:".72rem",textAlign:"center"}}>{t("notVet")}</p>
    </div>
  );
  return premium?body:<Locked t={t} onLock={onLock}>{body}</Locked>;
}

// ── LITTER ─────────────────────────────────────────────────────
const INIT_LITTER={phase:"assessment",assessment:{challenge:"",neutered:"",space:""},currentDay:1,completedDays:[],completedTs:{},missionAnswered:false};

function Litter({t,rabbit,premium,litter,setLitter,onLock,go}){
  const ls=litter||INIT_LITTER;
  const setLs=patch=>setLitter(prev=>{const base=prev||INIT_LITTER;return {...base,...(typeof patch==="function"?patch(base):patch)};});
  const [calView,setCalView]=useState(false);
  const [openLesson,setOpenLesson]=useState(null);
  const [qa,setQa]=useState({challenge:"",neutered:"",space:""});
  if(!premium)return <LitterPreview onLock={onLock}/>;
  if(ls.phase==="assessment"){
    const ready=qa.challenge&&qa.neutered&&qa.space;
    return (
      <div className="space-y-lg fade-in">
        <div style={{textAlign:"center"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(201,104,120,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .75rem"}}><IcLeaf s={24} style={{color:"#C96878"}}/></div>
          <h2 style={{fontWeight:600,fontSize:"1.15rem"}}>Litter Training Journey</h2>
          <p className="t-muted" style={{fontSize:".82rem",marginTop:".3rem"}}>3 quick questions to personalise your 15-day program.</p>
        </div>
        {[{label:"What's your biggest challenge?",key:"challenge",opts:["Poops everywhere","Peeing outside the box","Both","Just improving habits"]},{label:"Is your rabbit spayed / neutered?",key:"neutered",opts:["Yes","No","Not sure"]},{label:"Living space",key:"space",opts:["Cage","Enclosure","One room","Multiple rooms","Free roam"]}].map(({label,key,opts})=>(
          <div key={key} className="card" style={{padding:"1rem"}}>
            <p style={{fontWeight:600,fontSize:".875rem",marginBottom:".75rem"}}>{label}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:".5rem"}}>{opts.map(o=><button key={o} onClick={()=>setQa({...qa,[key]:o})} className={`chip ${qa[key]===o?"chip-on":""}`}>{o}</button>)}</div>
            {key==="space"&&qa.space==="Cage"&&(
              <div style={{marginTop:".85rem",background:"rgba(201,104,120,.07)",borderRadius:12,padding:".85rem",fontSize:".8rem",lineHeight:1.65}}>
                <strong>A note about cages.</strong> Rabbits are not designed to live in cages — it's one of the most common causes of litter and behaviour challenges.{" "}
                <button onClick={()=>go&&go("chat")} style={{background:"none",border:"none",cursor:"pointer",color:"#C96878",fontWeight:600,padding:0,textDecoration:"underline"}}>Chat with Céline</button> for alternatives.
              </div>
            )}
          </div>
        ))}
        <button disabled={!ready} onClick={()=>setLs({phase:"diagnostic",assessment:qa})} className="btn w-full" style={{padding:".8rem"}}>See my starting point →</button>
      </div>
    );
  }
  if(ls.phase==="diagnostic"){
    const {challenge,space}=ls.assessment;
    return (
      <div className="space-y-lg fade-in">
        <div className="card" style={{padding:"1.5rem",textAlign:"center",background:"linear-gradient(135deg,#FFF8F8,#FFFDFC)"}}>
          <div style={{fontSize:"2rem",marginBottom:".75rem"}}>🐰</div>
          <h3 style={{fontWeight:600,fontSize:"1.05rem",marginBottom:".75rem"}}>Your Starting Point</h3>
          <p style={{fontSize:".875rem",lineHeight:1.7,color:"rgba(46,38,35,.75)",marginBottom:"1rem"}}>
            {space==="Cage"?"Your rabbit's environment may be the root cause. Limited space creates territorial stress that makes litter training significantly harder — but with the right adjustments, real progress is absolutely possible."
            :challenge==="Just improving habits"?"Your rabbit already has a foundation — this is great news. This program will help you build consistency and confidence, one day at a time."
            :"Your rabbit's challenges are very common and very solvable. Most rabbits make genuine, lasting progress within 15 days of consistent, patient training."}
          </p>
          <div style={{background:"rgba(201,104,120,.08)",borderRadius:12,padding:".9rem",fontSize:".82rem",lineHeight:1.65}}>
            <strong style={{color:"#C96878"}}>The good news:</strong> Consistency always wins. Every day in this program gives you a concrete action that moves the needle.
          </div>
        </div>
        <button onClick={()=>setLs({phase:"journey",missionAnswered:false})} className="btn w-full" style={{padding:".85rem"}}>Start Day 1 →</button>
      </div>
    );
  }
  if(ls.phase==="complete"){
    return (
      <div className="space-y-lg fade-in" style={{textAlign:"center"}}>
        <div className="card" style={{padding:"2rem",background:"linear-gradient(135deg,#FFF8F8,#FFFDFC)"}}>
          <div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>🎉</div>
          <h2 style={{fontWeight:600,fontSize:"1.25rem",marginBottom:".75rem"}}>Journey Complete</h2>
          <p style={{fontSize:".875rem",lineHeight:1.7,color:"rgba(46,38,35,.7)",marginBottom:"1rem"}}>You've completed the Bun AI Litter Training Journey. You now have the knowledge and tools to continue improving your rabbit's habits.</p>
          <div style={{background:"rgba(201,104,120,.07)",borderRadius:12,padding:".85rem",fontSize:".82rem",lineHeight:1.65,fontStyle:"italic"}}>"Consistency creates lasting results."</div>
        </div>
        <div className="space-y">
          <button onClick={()=>setCalView(true)} className="btn w-full" style={{padding:".75rem"}}>Review Lessons</button>
          <button onClick={()=>{setLitter(INIT_LITTER);setCalView(false);setOpenLesson(null);}} className="btn-ghost w-full" style={{padding:".75rem"}}>Restart Journey</button>
          <button onClick={()=>go&&go("chat")} className="btn-ghost w-full" style={{padding:".75rem"}}>Chat with Céline</button>
        </div>
      </div>
    );
  }
  const currentDay=ls.currentDay||1;
  const completedDays=ls.completedDays||[];
  const completedTs=ls.completedTs||{};
  const missionAnswered=ls.missionAnswered||false;
  if(calView){
    if(openLesson){
      const l=LITTER_LESSONS[openLesson-1];
      return (
        <div className="space-y-lg fade-in">
          <button onClick={()=>setOpenLesson(null)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(46,38,35,.5)",fontSize:".8rem",display:"flex",alignItems:"center",gap:".3rem",fontWeight:500}}>← Back to calendar</button>
          <LitterLessonCard lesson={l} isDone={completedDays.includes(l.day)} readOnly/>
        </div>
      );
    }
    return (
      <div className="space-y-lg fade-in">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcLeaf s={20}/></span> All 15 Days</h2>
          <button onClick={()=>setCalView(false)} className="btn-ghost" style={{padding:".35rem .85rem",fontSize:".78rem"}}>Today's lesson</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:".5rem"}}>
          {LITTER_LESSONS.map(l=>{
            const done=completedDays.includes(l.day),isCurrent=l.day===currentDay,locked=l.day>currentDay&&!done;
            return (
              <button key={l.day} onClick={()=>{if(!locked)setOpenLesson(l.day);}}
                style={{background:done?"#C96878":isCurrent?"rgba(201,104,120,.12)":"#FFFDFC",border:isCurrent?"2px solid #C96878":"1.5px solid #EAE0D8",borderRadius:14,padding:".65rem .3rem",display:"flex",flexDirection:"column",alignItems:"center",gap:".25rem",cursor:locked?"default":"pointer",opacity:locked?.35:1,transition:"all .18s"}}>
                <span style={{fontSize:".6rem",fontWeight:600,color:done?"#fff":isCurrent?"#C96878":"rgba(46,38,35,.4)",textTransform:"uppercase"}}>Day</span>
                <span style={{fontWeight:700,fontSize:"1rem",color:done?"#fff":isCurrent?"#C96878":"#2E2623"}}>{l.day}</span>
                {done&&<IcCheck s={13} style={{color:"#fff"}}/>}
                {locked&&<span style={{fontSize:".85rem"}}>🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  const lesson=LITTER_LESSONS[currentDay-1];
  const isDone=completedDays.includes(currentDay);
  const lastCompletedDay=completedDays.length>0?Math.max(...completedDays):null;
  const lastCompletedTs=lastCompletedDay?completedTs[lastCompletedDay]:null;
  const unlockTs=lastCompletedTs?(lastCompletedTs+UNLOCK_MS):null;
  const isLocked=isDone&&unlockTs&&Date.now()<unlockTs;
  return (
    <div className="space-y-lg fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcLeaf s={20}/></span> Litter Journey</h2>
        <button onClick={()=>{setCalView(true);setOpenLesson(null);}} className="btn-ghost" style={{padding:".35rem .85rem",fontSize:".78rem"}}>All 15 days</button>
      </div>
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".5rem"}}>
          <span className="section-label">Progress</span>
          <span style={{fontSize:".75rem",fontWeight:600,color:"#C96878"}}>{completedDays.length}/15 days</span>
        </div>
        <div className="bar-track" style={{height:6}}><div className="bar-fill" style={{height:"100%",width:`${completedDays.length/15*100}%`}}/></div>
      </div>
      {isDone&&(isLocked?<LitterCountdown unlockTs={unlockTs}/>:!missionAnswered?<LitterMissionCheck onYes={()=>setLs({missionAnswered:true})} onNo={()=>setLs({missionAnswered:true})} onChat={()=>go&&go("chat")} onReview={()=>{setCalView(true);setOpenLesson(currentDay);}}/>:<LitterNextCard currentDay={currentDay} setLs={setLs}/>)}
      {!isDone&&<LitterLessonCard lesson={lesson} isDone={false} onComplete={()=>{const now=Date.now();const nc=[...completedDays,currentDay];if(nc.length===15){setLs({completedDays:nc,completedTs:{...completedTs,[currentDay]:now},phase:"complete"});}else{setLs({completedDays:nc,completedTs:{...completedTs,[currentDay]:now},missionAnswered:false});}}}/>}
      {isDone&&missionAnswered&&<LitterLessonCard lesson={lesson} isDone readOnly/>}
    </div>
  );
}

function LitterCountdown({unlockTs}){
  const {formatted,remaining}=useCountdown(unlockTs);
  if(remaining<=0)return null;
  return (
    <div className="card" style={{padding:"1rem",textAlign:"center",background:"linear-gradient(135deg,#FFF8F8,#FFFDFC)"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".35rem"}}>Great job. Consistency matters more than speed.</p>
      <p className="t-muted" style={{fontSize:".82rem",lineHeight:1.55,marginBottom:"1rem"}}>Apply today's mission. Your next lesson will unlock tomorrow.</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem",background:"rgba(201,104,120,.08)",borderRadius:12,padding:".75rem"}}>
        <IcClock s={16} style={{color:"#C96878"}}/><span style={{fontWeight:700,fontSize:"1rem",color:"#C96878",fontFamily:"monospace"}}>{formatted}</span>
      </div>
      <p className="t-muted" style={{fontSize:".72rem",marginTop:".5rem"}}>Next lesson available in</p>
    </div>
  );
}
function LitterMissionCheck({onYes,onNo,onChat,onReview}){
  const [ans,setAns]=useState(null);
  if(ans==="yes")return null;
  return (
    <div className="card fade-in" style={{padding:"1rem"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".3rem"}}>Welcome back 🐰</p>
      <p className="t-muted" style={{fontSize:".82rem",marginBottom:".85rem",lineHeight:1.55}}>Did you try yesterday's mission?</p>
      <div style={{display:"flex",gap:".5rem",marginBottom:".75rem"}}>
        <button onClick={()=>{setAns("yes");onYes();}} className={`chip ${ans==="yes"?"chip-on":""}`} style={{flex:1}}>Yes ✓</button>
        <button onClick={()=>setAns("no")} className={`chip ${ans==="no"?"chip-on":""}`} style={{flex:1}}>Not yet</button>
      </div>
      {ans==="no"&&(
        <div className="fade-in" style={{background:"rgba(201,104,120,.06)",borderRadius:12,padding:".85rem",fontSize:".82rem",lineHeight:1.65}}>
          <p style={{marginBottom:".65rem"}}>That's okay. Progress takes time. You can continue or revisit the lesson.</p>
          <div style={{display:"flex",gap:".5rem"}}>
            <button onClick={onNo} className="btn" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Continue</button>
            <button onClick={onReview} className="btn-ghost" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Review</button>
          </div>
          <button onClick={onChat} style={{display:"block",width:"100%",background:"none",border:"none",cursor:"pointer",color:"#C96878",fontWeight:600,fontSize:".78rem",padding:".5rem 0 0",textDecoration:"underline",textAlign:"center"}}>Ask Céline for help →</button>
        </div>
      )}
    </div>
  );
}
function LitterNextCard({currentDay,setLs}){
  const nextDay=currentDay+1;
  if(nextDay>15)return null;
  const next=LITTER_LESSONS[nextDay-1];
  return (
    <div className="card fade-in" style={{padding:"1rem",background:"linear-gradient(135deg,#FFF8F8,#FFFDFC)"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".25rem"}}>Ready for your next lesson?</p>
      <p className="t-muted" style={{fontSize:".82rem",lineHeight:1.5,marginBottom:".85rem"}}>Day {nextDay}: <strong style={{color:"#2E2623"}}>{next.title}</strong></p>
      <button onClick={()=>setLs({currentDay:nextDay,missionAnswered:false})} className="btn w-full" style={{padding:".7rem"}}>Start Day {nextDay} →</button>
    </div>
  );
}
function LitterLessonCard({lesson,isDone,onComplete,readOnly=false}){
  const [expanded,setExpanded]=useState(!isDone||readOnly);
  return (
    <div className="card fade-in" style={{overflow:"hidden",border:isDone?"1.5px solid rgba(201,104,120,.3)":"1.5px solid #EAE0D8"}}>
      <div style={{padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:".85rem",background:isDone?"rgba(201,104,120,.04)":"",cursor:readOnly?"default":"pointer"}} onClick={()=>{if(!readOnly)setExpanded(e=>!e);}}>
        <div style={{width:44,height:44,borderRadius:13,background:isDone?"#C96878":"rgba(201,104,120,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:".55rem",fontWeight:700,color:isDone?"rgba(255,255,255,.75)":"#C96878",textTransform:"uppercase"}}>Day</span>
          <span style={{fontSize:".95rem",fontWeight:700,color:isDone?"#fff":"#C96878",lineHeight:1}}>{lesson.day}</span>
        </div>
        <div style={{flex:1}}>
          <p style={{fontWeight:600,fontSize:".9rem",lineHeight:1.3}}>{lesson.title}</p>
          {isDone&&<p style={{fontSize:".72rem",color:"#C96878",marginTop:".15rem",fontWeight:600}}>✓ Completed</p>}
        </div>
        {!readOnly&&<span style={{color:"rgba(46,38,35,.25)",transform:expanded?"rotate(90deg)":"",transition:"transform .2s",flexShrink:0}}><IcArrow s={18}/></span>}
      </div>
      {(expanded||readOnly)&&(
        <div style={{padding:"0 1.1rem 1.1rem",display:"flex",flexDirection:"column",gap:".85rem"}}>
          <div style={{height:1,background:"#EAE0D8"}}/>
          <div><p className="section-label" style={{marginBottom:".4rem"}}>❌ What most owners get wrong</p><p style={{fontSize:".84rem",lineHeight:1.7,color:"rgba(46,38,35,.75)"}}>{lesson.wrong}</p></div>
          <div className="insight-box"><p className="section-label" style={{marginBottom:".4rem",color:"#C96878"}}>💡 Key insight</p><p style={{fontSize:".84rem",lineHeight:1.7}}>{lesson.insight}</p></div>
          <div className="mission-box"><p className="section-label" style={{marginBottom:".4rem"}}>🎯 Today's mission</p><p style={{fontSize:".84rem",lineHeight:1.7}}>{lesson.mission}</p></div>
          {!isDone&&!readOnly&&<button onClick={onComplete} className="btn w-full" style={{padding:".75rem",marginTop:".25rem"}}><IcCheck s={16}/> Mark as completed</button>}
        </div>
      )}
    </div>
  );
}
function LitterPreview({onLock}){
  const lesson=LITTER_LESSONS[0];
  return (
    <div className="space-y-lg">
      <div style={{textAlign:"center",padding:"1rem 0 .5rem"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(201,104,120,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .75rem"}}><IcLeaf s={24} style={{color:"#C96878"}}/></div>
        <h2 style={{fontWeight:600,fontSize:"1.1rem"}}>Litter Training Journey</h2>
        <p className="t-muted" style={{fontSize:".82rem",marginTop:".4rem"}}>A personalised 15-day program.</p>
      </div>

      {/* Jour 1 tronqué */}
      <div className="card" style={{overflow:"hidden",border:"1.5px solid #EAE0D8"}}>
        <div style={{padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:".85rem"}}>
          <div style={{width:44,height:44,borderRadius:13,background:"rgba(201,104,120,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:".55rem",fontWeight:700,color:"#C96878",textTransform:"uppercase"}}>Day</span>
            <span style={{fontSize:".95rem",fontWeight:700,color:"#C96878",lineHeight:1}}>1</span>
          </div>
          <p style={{fontWeight:600,fontSize:".9rem"}}>{lesson.title}</p>
        </div>
        <div style={{padding:"0 1.1rem 1.1rem",display:"flex",flexDirection:"column",gap:".85rem"}}>
          <div style={{height:1,background:"#EAE0D8"}}/>
          <div><p className="section-label" style={{marginBottom:".4rem"}}>❌ What most owners get wrong</p>
            <p style={{fontSize:".84rem",lineHeight:1.7,color:"rgba(46,38,35,.75)"}}>{lesson.wrong}</p>
          </div>
          {/* Insight tronqué + voile */}
          <div style={{position:"relative"}}>
            <div className="insight-box" style={{overflow:"hidden",maxHeight:72,WebkitMaskImage:"linear-gradient(to bottom, black 30%, transparent 100%)"}}>
              <p className="section-label" style={{marginBottom:".4rem",color:"#C96878"}}>💡 Key insight</p>
              <p style={{fontSize:".84rem",lineHeight:1.7}}>{lesson.insight}</p>
            </div>
          </div>
        </div>
        {/* Paywall overlay */}
        <div style={{background:"linear-gradient(to bottom, rgba(246,241,236,0) 0%, rgba(246,241,236,.97) 40%)",padding:"2rem 1.1rem 1.1rem",textAlign:"center",marginTop:"-1rem"}}>
          <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".3rem"}}>Continue the 15-day journey</p>
          <p className="t-muted" style={{fontSize:".78rem",lineHeight:1.55,marginBottom:"1rem"}}>Get all 15 lessons, daily missions and Céline's coaching.</p>
          <button onClick={onLock} className="btn" style={{padding:".7rem 1.5rem",boxShadow:"0 4px 16px rgba(201,104,120,.3)"}}>
            <IcCrown s={15}/> Unlock Premium
          </button>
        </div>
      </div>

      {/* Jours verrouillés */}
      {[1,2].map(i=>(
        <div key={i} className="card" style={{padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:".85rem",opacity:.4}}>
          <div style={{width:44,height:44,borderRadius:13,background:"rgba(201,104,120,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:".55rem",fontWeight:700,color:"#C96878",textTransform:"uppercase"}}>Day</span>
            <span style={{fontSize:".95rem",fontWeight:700,color:"#C96878",lineHeight:1}}>{i+1}</span>
          </div>
          <p style={{fontWeight:600,fontSize:".875rem"}}>{LITTER_LESSONS[i].title}</p>
          <span style={{marginLeft:"auto",color:"rgba(46,38,35,.25)"}}><IcLock s={16}/></span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BONDING JOURNEY
// ══════════════════════════════════════════════════════════════
const INIT_BONDING={phase:"journey",currentDay:1,completedDays:[],completedTs:{},bondScore:0,missionAnswered:false,bonusOpen:{}};

function BondingJourney({t,rabbit,premium,bonding,setBonding,onLock,go}){
  const bs=bonding||INIT_BONDING;
  const setBs=patch=>setBonding(prev=>{const base=prev||INIT_BONDING;return {...base,...(typeof patch==="function"?patch(base):patch)};});
  const [calView,setCalView]=useState(false);
  const [openDay,setOpenDay]=useState(null);

  if(!premium)return <BondingPreview onLock={onLock}/>;

  const currentDay=bs.currentDay||1;
  const completedDays=bs.completedDays||[];
  const completedTs=bs.completedTs||{};
  const bondScore=bs.bondScore||0;
  const missionAnswered=bs.missionAnswered||false;
  const bonusOpen=bs.bonusOpen||{};

  const isDone=completedDays.includes(currentDay);
  const lastDone=completedDays.length>0?Math.max(...completedDays):null;
  const lastTs=lastDone?completedTs[lastDone]:null;
  const unlockTs=lastTs?(lastTs+UNLOCK_MS):null;
  const isLocked=isDone&&unlockTs&&Date.now()<unlockTs;

  const content=BONDING_CONTENT[currentDay];
  const dow=dayOfWeek(currentDay);
  const theme=THEME_META[dow];
  const isBonusSunday=BONUS_SUNDAYS.includes(currentDay);

  if(calView){
    if(openDay!==null){
      const c=BONDING_CONTENT[openDay];
      const d=dayOfWeek(openDay);
      const th=THEME_META[d];
      return (
        <div className="space-y-lg fade-in">
          <button onClick={()=>setOpenDay(null)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(46,38,35,.5)",fontSize:".8rem",display:"flex",alignItems:"center",gap:".3rem",fontWeight:500}}>← Back to calendar</button>
          <BondingDayCard content={c} theme={th} dayNum={openDay} isDone={completedDays.includes(openDay)} isBonusSunday={BONUS_SUNDAYS.includes(openDay)} bondScore={bondScore} bonusOpen={bonusOpen} setBs={setBs} readOnly/>
        </div>
      );
    }
    return (
      <div className="space-y-lg fade-in">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcHeart s={20}/></span> 8-Week Journey</h2>
          <button onClick={()=>setCalView(false)} className="btn-ghost" style={{padding:".35rem .85rem",fontSize:".78rem"}}>Today</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:".35rem"}}>
          {Array.from({length:DAYS_IN_JOURNEY},(_,i)=>{
            const d=i+1;
            const done=completedDays.includes(d);
            const isCur=d===currentDay;
            const locked=d>currentDay&&!done;
            const isBS=BONUS_SUNDAYS.includes(d);
            const thColor=THEME_META[dayOfWeek(d)]?.color||"#C96878";
            return (
              <button key={d} onClick={()=>{if(!locked)setOpenDay(d);}}
                style={{background:done?thColor:isCur?"rgba(201,104,120,.12)":"#FFFDFC",border:isCur?`2px solid ${thColor}`:"1.5px solid #EAE0D8",borderRadius:10,padding:".4rem .15rem",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",cursor:locked?"default":"pointer",opacity:locked?.3:1,transition:"all .15s",minWidth:0}}>
                <span style={{fontSize:".55rem",fontWeight:700,color:done?"rgba(255,255,255,.7)":isCur?thColor:"rgba(46,38,35,.35)",lineHeight:1}}>{d}</span>
                {done&&<IcCheck s={10} style={{color:"#fff"}}/>}
                {isBS&&<span style={{fontSize:".6rem",lineHeight:1}}>🤍</span>}
                {locked&&<span style={{fontSize:".6rem",lineHeight:1}}>🔒</span>}
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:".5rem",paddingTop:".25rem"}}>
          {Object.entries(THEME_META).map(([k,v])=>(
            <span key={k} style={{display:"inline-flex",alignItems:"center",gap:".3rem",fontSize:".68rem",fontWeight:500,color:"rgba(46,38,35,.6)"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:v.color,display:"inline-block"}}/>
              {v.emoji} {v.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcHeart s={20}/></span> Bond Journey</h2>
        <button onClick={()=>{setCalView(true);setOpenDay(null);}} className="btn-ghost" style={{padding:".35rem .85rem",fontSize:".78rem"}}>All 56 days</button>
      </div>

      <div className="card" style={{padding:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".6rem"}}>
          <span style={{fontWeight:600,fontSize:".875rem"}}>Bond Score</span>
          <span className="t-pink" style={{fontWeight:700,fontSize:"1.1rem"}}>{bondScore} pts</span>
        </div>
        <div className="bar-track" style={{height:6}}><div className="bar-fill" style={{height:"100%",width:`${Math.min(100,bondScore/560*100)}%`}}/></div>
        <p className="t-muted" style={{fontSize:".72rem",marginTop:".5rem"}}>{completedDays.length}/56 days completed</p>
      </div>

      {isDone&&(
        isLocked?<BondingCountdown unlockTs={unlockTs}/>
        :!missionAnswered?<BondingMissionCheck onYes={()=>setBs({missionAnswered:true})} onNo={()=>setBs({missionAnswered:true})} onChat={()=>go&&go("chat")} onReview={()=>{setCalView(true);setOpenDay(currentDay);}}/>
        :<BondingNextCard currentDay={currentDay} setBs={setBs}/>
      )}

      {!isDone&&content&&(
        <BondingDayCard
          content={content} theme={theme} dayNum={currentDay}
          isDone={false} isBonusSunday={isBonusSunday}
          bondScore={bondScore} bonusOpen={bonusOpen} setBs={setBs}
          onComplete={()=>{
            const now=Date.now();
            const nc=[...completedDays,currentDay];
            setBs({completedDays:nc,completedTs:{...completedTs,[currentDay]:now},bondScore:bondScore+10,missionAnswered:false});
          }}
        />
      )}

      {isDone&&missionAnswered&&content&&(
        <BondingDayCard content={content} theme={theme} dayNum={currentDay} isDone isBonusSunday={isBonusSunday} bondScore={bondScore} bonusOpen={bonusOpen} setBs={setBs} readOnly/>
      )}
    </div>
  );
}

function BondingCountdown({unlockTs}){
  const {formatted,remaining}=useCountdown(unlockTs);
  if(remaining<=0)return null;
  return (
    <div className="card" style={{padding:"1rem",textAlign:"center",background:"linear-gradient(135deg,#FFF8F6,#FFFDFC)"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".35rem"}}>Beautiful. See you tomorrow. 🩷</p>
      <p className="t-muted" style={{fontSize:".82rem",lineHeight:1.55,marginBottom:"1rem"}}>Take today to let today's lesson sink in. Your next day unlocks tomorrow.</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem",background:"rgba(201,104,120,.08)",borderRadius:12,padding:".75rem"}}>
        <IcClock s={16} style={{color:"#C96878"}}/><span style={{fontWeight:700,fontSize:"1rem",color:"#C96878",fontFamily:"monospace"}}>{formatted}</span>
      </div>
    </div>
  );
}

function BondingMissionCheck({onYes,onNo,onChat,onReview}){
  const [ans,setAns]=useState(null);
  if(ans==="yes")return null;
  return (
    <div className="card fade-in" style={{padding:"1rem"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".3rem"}}>Welcome back 🐰</p>
      <p className="t-muted" style={{fontSize:".82rem",marginBottom:".85rem",lineHeight:1.55}}>Did you try yesterday's mission?</p>
      <div style={{display:"flex",gap:".5rem",marginBottom:".75rem"}}>
        <button onClick={()=>{setAns("yes");onYes();}} className={`chip ${ans==="yes"?"chip-on":""}`} style={{flex:1}}>Yes, I did it ✓</button>
        <button onClick={()=>setAns("no")} className={`chip ${ans==="no"?"chip-on":""}`} style={{flex:1}}>Not yet</button>
      </div>
      {ans==="no"&&(
        <div className="fade-in" style={{background:"rgba(201,104,120,.06)",borderRadius:12,padding:".85rem",fontSize:".82rem",lineHeight:1.65}}>
          <p style={{marginBottom:".65rem"}}>That's okay. Progress takes time — and so does patience with yourself. You can review yesterday or continue forward.</p>
          <div style={{display:"flex",gap:".5rem"}}>
            <button onClick={onNo} className="btn" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Continue</button>
            <button onClick={onReview} className="btn-ghost" style={{flex:1,padding:".55rem",fontSize:".78rem"}}>Review</button>
          </div>
          <button onClick={onChat} style={{display:"block",width:"100%",background:"none",border:"none",cursor:"pointer",color:"#C96878",fontWeight:600,fontSize:".78rem",padding:".5rem 0 0",textDecoration:"underline",textAlign:"center"}}>Ask Céline for help →</button>
        </div>
      )}
    </div>
  );
}

function BondingNextCard({currentDay,setBs}){
  const nextDay=currentDay+1;
  if(nextDay>DAYS_IN_JOURNEY)return (
    <div className="card fade-in" style={{padding:"1rem",textAlign:"center",background:"linear-gradient(135deg,#FFF8F6,#FFFDFC)"}}>
      <div style={{fontSize:"2rem",marginBottom:".75rem"}}>🎉</div>
      <p style={{fontWeight:600,fontSize:"1rem",marginBottom:".5rem"}}>Journey Complete</p>
      <p className="t-muted" style={{fontSize:".85rem",lineHeight:1.65}}>You've completed the full 8-week Bonding Journey. What you've built with your rabbit is real, and it's yours.</p>
    </div>
  );
  const next=BONDING_CONTENT[nextDay];
  const th=THEME_META[dayOfWeek(nextDay)];
  return (
    <div className="card fade-in" style={{padding:"1rem",background:"linear-gradient(135deg,#FFF8F6,#FFFDFC)"}}>
      <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".25rem"}}>Ready for your next day?</p>
      <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".85rem"}}>
        <span className="bond-theme-tag" style={{background:`${th.color}15`,color:th.color}}>{th.emoji} {th.label}</span>
        <span className="t-muted" style={{fontSize:".8rem"}}>Day {nextDay}</span>
      </div>
      <p style={{fontWeight:600,fontSize:".875rem",marginBottom:".85rem"}}>{next?.title||""}</p>
      <button onClick={()=>setBs({currentDay:nextDay,missionAnswered:false})} className="btn w-full" style={{padding:".7rem"}}>Start Day {nextDay} →</button>
    </div>
  );
}

function BondingDayCard({content,theme,dayNum,isDone,isBonusSunday,bondScore,bonusOpen,setBs,onComplete,readOnly=false}){
  const [expanded,setExpanded]=useState(!isDone||readOnly);
  if(!content)return null;
  const dow=dayOfWeek(dayNum);
  const toggleBonus=()=>setBs(prev=>({...prev,bonusOpen:{...(prev.bonusOpen||{}),[dayNum]:!(prev.bonusOpen||{})[dayNum]}}));
  const isBO=bonusOpen[dayNum];
  const bonusUnlocked=isBonusSunday&&bondScore>=(BONUS_SUNDAYS.indexOf(dayNum)+1)*140-10;

  return (
    <div className="card fade-in" style={{overflow:"hidden",border:isDone?"1.5px solid rgba(201,104,120,.25)":"1.5px solid #EAE0D8"}}>
      <div style={{padding:"1rem 1.1rem",display:"flex",alignItems:"flex-start",gap:".85rem",background:isDone?"rgba(201,104,120,.03)":"",cursor:readOnly?"default":"pointer"}}
        onClick={()=>{if(!readOnly)setExpanded(e=>!e);}}>
        <div style={{width:48,height:48,borderRadius:14,background:isDone?theme.color:`${theme.color}18`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:".55rem",fontWeight:700,color:isDone?"rgba(255,255,255,.75)":theme.color,textTransform:"uppercase",lineHeight:1}}>Day</span>
          <span style={{fontSize:"1rem",fontWeight:700,color:isDone?"#fff":theme.color,lineHeight:1.1}}>{dayNum}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:".5rem",flexWrap:"wrap",marginBottom:".3rem"}}>
            <span className="bond-theme-tag" style={{background:`${theme.color}15`,color:theme.color}}>{theme.emoji} {theme.label}</span>
            {isBonusSunday&&<span style={{fontSize:".7rem"}}>🤍</span>}
          </div>
          <p style={{fontWeight:600,fontSize:".9rem",lineHeight:1.3}}>{content.title}</p>
          {isDone&&<p style={{fontSize:".72rem",color:"#C96878",marginTop:".2rem",fontWeight:600}}>✓ Completed · +10 pts</p>}
        </div>
        {!readOnly&&<span style={{color:"rgba(46,38,35,.25)",transform:expanded?"rotate(90deg)":"",transition:"transform .2s",flexShrink:0,marginTop:".25rem"}}><IcArrow s={18}/></span>}
      </div>

      {(expanded||readOnly)&&(
        <div style={{padding:"0 1.1rem 1.1rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div style={{height:1,background:"#EAE0D8"}}/>

          {dow===1&&content.why&&<>
            <div><p className="section-label" style={{marginBottom:".4rem"}}>✨ Why it matters</p><p style={{fontSize:".84rem",lineHeight:1.75,color:"rgba(46,38,35,.8)"}}>{content.why}</p></div>
            <div className="insight-box"><p className="section-label" style={{marginBottom:".4rem",color:"#C96878"}}>🐰 How rabbits learn it</p><p style={{fontSize:".84rem",lineHeight:1.75}}>{content.how}</p></div>
            <div className="mission-box"><p className="section-label" style={{marginBottom:".4rem"}}>🎯 This week's mission</p><p style={{fontSize:".84rem",lineHeight:1.75}}>{content.mission}</p></div>
            <div className="note-box">
              <p style={{fontWeight:600,marginBottom:".35rem",fontSize:".78rem",color:"rgba(46,38,35,.8)"}}>📝 Important notes</p>
              <p>{content.note}</p>
              <ul style={{marginTop:".5rem",paddingLeft:"1rem"}}>
                <li style={{marginBottom:".3rem"}}>Always train at your rabbit's level — sit on the floor with them.</li>
                <li style={{marginBottom:".3rem"}}>15-minute sessions every day outperform one long session per week.</li>
                <li>Treats = max 10% of daily diet. Use blueberries, banana pieces, lettuce or carrot in tiny quantities.</li>
              </ul>
            </div>
          </>}

          {dow===2&&content.content&&<>
            <div style={{fontSize:".875rem",lineHeight:1.8,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.content}</div>
            {content.takeaway&&<div className="insight-box"><p className="section-label" style={{marginBottom:".4rem",color:"#C96878"}}>💡 Takeaway</p><p style={{fontSize:".84rem",lineHeight:1.65,fontStyle:"italic"}}>{content.takeaway}</p></div>}
          </>}

          {dow===3&&content.content&&<>
            <div style={{fontSize:".875rem",lineHeight:1.85,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.content}</div>
            {content.takeaway&&<div style={{background:"rgba(139,115,85,.07)",border:"1px solid rgba(139,115,85,.2)",borderRadius:14,padding:".95rem"}}><p className="section-label" style={{marginBottom:".4rem",color:"#8B7355"}}>💭 To sit with</p><p style={{fontSize:".84rem",lineHeight:1.65,fontStyle:"italic"}}>{content.takeaway}</p></div>}
          </>}

          {dow===4&&content.content&&<>
            <div style={{fontSize:".875rem",lineHeight:1.85,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.content}</div>
            {content.takeaway&&<div style={{background:"rgba(91,140,90,.07)",border:"1px solid rgba(91,140,90,.2)",borderRadius:14,padding:".95rem"}}><p className="section-label" style={{marginBottom:".4rem",color:"#5B8C5A"}}>🌿 Takeaway</p><p style={{fontSize:".84rem",lineHeight:1.65,fontStyle:"italic"}}>{content.takeaway}</p></div>}
          </>}

          {dow===5&&<>
            {content.content&&<div style={{fontSize:".875rem",lineHeight:1.8,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.content}</div>}
            {content.content2&&<div style={{fontSize:".875rem",lineHeight:1.8,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.content2}</div>}
            {content.takeaway&&<div style={{background:"rgba(212,133,106,.07)",border:"1px solid rgba(212,133,106,.2)",borderRadius:14,padding:".95rem"}}><p className="section-label" style={{marginBottom:".4rem",color:"#D4856A"}}>👁 Signal of the week</p><p style={{fontSize:".84rem",lineHeight:1.65,fontStyle:"italic"}}>{content.takeaway}</p></div>}
          </>}

          {dow===6&&content.questions&&<>
            <div className="reflection-card">
              <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".75rem"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,123,176,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <IcPen s={18} style={{color:"#9B7BB0"}}/>
                </div>
                <div>
                  <p style={{fontWeight:600,fontSize:".9rem",lineHeight:1.2}}>Reflection Day</p>
                  <p style={{fontSize:".75rem",color:"rgba(46,38,35,.5)",marginTop:".1rem"}}>No lesson today — just presence and honesty</p>
                </div>
              </div>
              <p style={{fontSize:".82rem",lineHeight:1.7,color:"rgba(46,38,35,.7)",marginBottom:"1rem"}}>{content.intro}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:".6rem"}}>
              {content.questions.map((q,i)=>(<div key={i} className="reflection-q">{q}</div>))}
            </div>
            <div style={{background:"rgba(201,104,120,.06)",borderRadius:14,padding:"1rem"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:".6rem",marginBottom:".6rem"}}>
                <span style={{fontSize:"1rem",flexShrink:0}}>✍️</span>
                <p style={{fontSize:".82rem",fontWeight:600,color:"rgba(46,38,35,.8)",lineHeight:1.4}}>How to use these questions</p>
              </div>
              <p style={{fontSize:".8rem",lineHeight:1.7,color:"rgba(46,38,35,.65)"}}>Take your time — there's no rush. Write your answers in a notebook, your phone's notes app, or simply sit with the questions quietly.</p>
              <div style={{marginTop:".75rem",paddingTop:".75rem",borderTop:"1px solid rgba(201,104,120,.12)"}}>
                <p style={{fontSize:".8rem",lineHeight:1.7,color:"rgba(46,38,35,.65)"}}>{content.cta}</p>
              </div>
            </div>
          </>}

          {dow===7&&content.story&&<>
            <div className="journal-card">
              <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".85rem"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(201,104,120,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <IcBook s={18} style={{color:"#C96878"}}/>
                </div>
                <div>
                  <p style={{fontWeight:600,fontSize:".9rem",lineHeight:1.2}}>Céline's Journal</p>
                  <p style={{fontSize:".75rem",color:"rgba(46,38,35,.5)",marginTop:".1rem"}}>{content.title}</p>
                </div>
              </div>
              <p style={{fontSize:".875rem",lineHeight:1.85,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.story}</p>
              {content.takeaway&&<div style={{marginTop:"1rem",paddingTop:"1rem",borderTop:"1px solid #F0DDD8"}}>
                <p style={{fontSize:".8rem",lineHeight:1.65,fontStyle:"italic",color:"rgba(46,38,35,.6)"}}>{content.takeaway}</p>
              </div>}
            </div>

            {isBonusSunday&&(
              <div className="bonus-card">
                <div style={{padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:".75rem"}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(201,104,120,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:"1.1rem"}}>🤍</span>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:600,fontSize:".875rem",lineHeight:1.2}}>{content.bonusLesson?.title}</p>
                    <p className="t-muted" style={{fontSize:".75rem",marginTop:".2rem"}}>Bonus lesson — unlocked by your consistency</p>
                  </div>
                  {bonusUnlocked&&(
                    <button onClick={toggleBonus} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(46,38,35,.35)",flexShrink:0}}>
                      {isBO?<IcX s={18}/>:<IcArrow s={18}/>}
                    </button>
                  )}
                  {!bonusUnlocked&&<IcLock s={16} style={{color:"rgba(46,38,35,.25)",flexShrink:0}}/>}
                </div>
                {!bonusUnlocked&&(
                  <div style={{padding:"0 1.1rem .85rem"}}>
                    <p className="t-muted" style={{fontSize:".78rem",lineHeight:1.55}}>Complete more days to unlock this bonus lesson.</p>
                  </div>
                )}
                {bonusUnlocked&&isBO&&(
                  <div style={{padding:"0 1.1rem 1.1rem",display:"flex",flexDirection:"column",gap:".85rem"}}>
                    <div style={{height:1,background:"#F0DDD8"}}/>
                    <p style={{fontSize:".875rem",lineHeight:1.8,color:"rgba(46,38,35,.82)",whiteSpace:"pre-wrap"}}>{content.bonusLesson?.content}</p>
                    {content.bonusLesson?.note&&<div style={{background:"rgba(201,104,120,.06)",border:"1px solid rgba(201,104,120,.15)",borderRadius:12,padding:".85rem",fontSize:".8rem",lineHeight:1.65,color:"rgba(46,38,35,.7)"}}>
                      <strong style={{color:"#C96878"}}>Important: </strong>{content.bonusLesson.note}
                    </div>}
                  </div>
                )}
              </div>
            )}
          </>}

          {!isDone&&!readOnly&&(
            <button onClick={onComplete} className="btn w-full" style={{padding:".75rem",marginTop:".25rem"}}>
              <IcCheck s={16}/> Complete Day {dayNum} · +10 pts
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function BondingPreview({onLock}){
  const content=BONDING_CONTENT[1];
  const theme=THEME_META[1];
  return (
    <div className="space-y-lg">
      <div style={{textAlign:"center",padding:"1rem 0 .5rem"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(201,104,120,.1)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .75rem"}}><IcHeart s={24} style={{color:"#C96878"}}/></div>
        <h2 style={{fontWeight:600,fontSize:"1.1rem"}}>8-Week Bonding Journey</h2>
        <p className="t-muted" style={{fontSize:".82rem",marginTop:".4rem"}}>A daily companion for a deeper relationship.</p>
      </div>

      {/* Jour 1 tronqué */}
      <div className="card" style={{overflow:"hidden",border:"1.5px solid #EAE0D8"}}>
        <div style={{padding:"1rem 1.1rem",display:"flex",alignItems:"flex-start",gap:".85rem"}}>
          <div style={{width:48,height:48,borderRadius:14,background:`${theme.color}18`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:".55rem",fontWeight:700,color:theme.color,textTransform:"uppercase",lineHeight:1}}>Day</span>
            <span style={{fontSize:"1rem",fontWeight:700,color:theme.color,lineHeight:1.1}}>1</span>
          </div>
          <div style={{flex:1}}>
            <span className="bond-theme-tag" style={{background:`${theme.color}15`,color:theme.color,marginBottom:".3rem",display:"inline-flex"}}>{theme.emoji} {theme.label}</span>
            <p style={{fontWeight:600,fontSize:".9rem"}}>{content.title}</p>
          </div>
        </div>
        <div style={{padding:"0 1.1rem 0",display:"flex",flexDirection:"column",gap:".85rem"}}>
          <div style={{height:1,background:"#EAE0D8"}}/>
          <div><p className="section-label" style={{marginBottom:".4rem"}}>✨ Why it matters</p>
            <p style={{fontSize:".84rem",lineHeight:1.75,color:"rgba(46,38,35,.8)"}}>{content.why}</p>
          </div>
          {/* Mission tronquée + voile */}
          <div style={{position:"relative",overflow:"hidden",maxHeight:80,WebkitMaskImage:"linear-gradient(to bottom, black 20%, transparent 100%)"}}>
            <div className="insight-box">
              <p className="section-label" style={{marginBottom:".4rem",color:"#C96878"}}>🐰 How rabbits learn it</p>
              <p style={{fontSize:".84rem",lineHeight:1.75}}>{content.how}</p>
            </div>
          </div>
        </div>
        {/* Paywall overlay */}
        <div style={{background:"linear-gradient(to bottom, rgba(246,241,236,0) 0%, rgba(246,241,236,.97) 40%)",padding:"2rem 1.1rem 1.1rem",textAlign:"center",marginTop:"-1rem"}}>
          <p style={{fontWeight:600,fontSize:".9rem",marginBottom:".3rem"}}>Start the 8-week journey</p>
          <p className="t-muted" style={{fontSize:".78rem",lineHeight:1.55,marginBottom:"1rem"}}>56 days of lessons, reflections and Céline's personal stories.</p>
          <button onClick={onLock} className="btn" style={{padding:".7rem 1.5rem",boxShadow:"0 4px 16px rgba(201,104,120,.3)"}}>
            <IcCrown s={15}/> Unlock Premium
          </button>
        </div>
      </div>

      {/* Jours verrouillés */}
      {[{day:2,theme:THEME_META[2]},{day:7,theme:THEME_META[7]}].map(({day,theme})=>(
        <div key={day} className="card" style={{padding:"1rem 1.1rem",display:"flex",alignItems:"center",gap:".85rem",opacity:.4}}>
          <div style={{width:44,height:44,borderRadius:13,background:`${theme.color}15`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:".55rem",fontWeight:700,color:theme.color,textTransform:"uppercase"}}>Day</span>
            <span style={{fontSize:".95rem",fontWeight:700,color:theme.color,lineHeight:1}}>{day}</span>
          </div>
          <div>
            <span className="bond-theme-tag" style={{background:`${theme.color}15`,color:theme.color,display:"inline-flex"}}>{theme.emoji} {theme.label}</span>
            <p style={{fontWeight:600,fontSize:".875rem",marginTop:".2rem"}}>{BONDING_CONTENT[day]?.title}</p>
          </div>
          <span style={{marginLeft:"auto",color:"rgba(46,38,35,.25)"}}><IcLock s={16}/></span>
        </div>
      ))}
    </div>
  );
}

// ── Paywall ────────────────────────────────────────────────────
function Paywall({t,codeMode,onClose,onUnlock}){
  const [mode,setMode]=useState(codeMode?"code":"main");
  const [code,setCode]=useState("");
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const CELINE="https://i.postimg.cc/Btf0zFCB/IMG-5618-Photoroom.png";
  const tryCode=()=>{if(code.trim().toUpperCase()===PREMIUM_CODE)onUnlock("code");else setErr(t("wrongCode"));};
  const tryEmail=async()=>{
    const e=email.trim().toLowerCase();
    if(!e.includes("@")){setErr(t("badEmail"));return;}
    setErr("");setLoading(true);
    try{const res=await fetch("https://bun-ai-proxy.vercel.app/api/check-access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e})});const data=await res.json();setLoading(false);if(data.access)onUnlock("email",e);else setErr(t("noAccess"));}
    catch{setLoading(false);setErr(t("netErr"));}
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <Style/>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        {mode==="main"&&(<>
          <div style={{display:"flex",justifyContent:"center"}} className="t-pink"><IcRabbit s={44}/></div>
          <h3 style={{fontWeight:600,fontSize:"1.2rem",textAlign:"center",marginTop:"1rem"}}>{t("paywallTitle")}</h3>
          <p className="t-muted" style={{fontSize:".85rem",textAlign:"center",marginTop:".5rem",marginBottom:"1.5rem",lineHeight:1.6}}>{t("paywall")}</p>
          <a href={KOFI} target="_blank" rel="noreferrer" className="btn" style={{display:"block",padding:".8rem",textAlign:"center",textDecoration:"none",fontSize:".9rem"}}>{t("premiumBtn")}</a>
          <div style={{display:"flex",flexDirection:"column",gap:".6rem",marginTop:"1rem",alignItems:"center"}}>
            <button onClick={()=>{setErr("");setMode("email");}} style={{background:"none",border:"none",cursor:"pointer",color:"#C96878",fontSize:".83rem",fontWeight:600,textDecoration:"underline"}}>{t("paidKofi")}</button>
            <button onClick={()=>{setErr("");setMode("code");}} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(46,38,35,.45)",fontSize:".75rem",textDecoration:"underline"}}>{t("haveCode")}</button>
          </div>
          <div style={{marginTop:"1.25rem",paddingTop:"1rem",borderTop:"1px solid #EAE0D8"}}>
            <img src={CELINE} alt="Céline" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",margin:"0 auto .5rem",display:"block"}}/>
            <p className="t-muted" style={{fontSize:".72rem",textAlign:"center",lineHeight:1.5}}>Built by Céline, 6 years with Buzz 🐇</p>
          </div>
        </>)}
        {mode==="email"&&(<>
          <h3 style={{fontWeight:600,fontSize:"1.1rem",textAlign:"center",marginBottom:"1.25rem"}}>Enter your Ko-fi email</h3>
          <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>{if(e.key==="Enter")tryEmail();}} placeholder="the email you paid with" type="email" className="field w-full" style={{padding:".65rem 1rem",textAlign:"center"}}/>
          {err&&<p style={{color:"#b04a5c",fontSize:".78rem",marginTop:".6rem",textAlign:"center",lineHeight:1.5}}>{err}</p>}
          <button onClick={tryEmail} disabled={loading} className="btn w-full" style={{marginTop:"1rem",padding:".75rem"}}>{loading?"…":"Check my access"}</button>
          <button onClick={()=>{setErr("");setMode("main");}} style={{background:"none",border:"none",cursor:"pointer",display:"block",margin:".75rem auto 0",fontSize:".78rem",color:"rgba(46,38,35,.4)"}}>← {t("back")}</button>
        </>)}
        {mode==="code"&&(<>
          <h3 style={{fontWeight:600,fontSize:"1.1rem",textAlign:"center",marginBottom:"1.25rem"}}>{t("enterCode")}</h3>
          <input value={code} onChange={e=>{setCode(e.target.value);setErr("");}} onKeyDown={e=>{if(e.key==="Enter")tryCode();}} placeholder={t("codePlaceholder")} className="field w-full" style={{padding:".65rem 1rem",textAlign:"center",textTransform:"uppercase",letterSpacing:".15em",fontFamily:"monospace",fontSize:"1rem"}}/>
          {err&&<p style={{color:"#b04a5c",fontSize:".78rem",marginTop:".6rem",textAlign:"center"}}>{err}</p>}
          <button onClick={tryCode} className="btn w-full" style={{marginTop:"1rem",padding:".75rem"}}>{t("unlock")}</button>
          <button onClick={()=>{setErr("");setMode("main");}} style={{background:"none",border:"none",cursor:"pointer",display:"block",margin:".75rem auto 0",fontSize:".78rem",color:"rgba(46,38,35,.4)"}}>← {t("back")}</button>
        </>)}
        <button onClick={onClose} style={{display:"block",margin:"1rem auto 0",background:"none",border:"none",cursor:"pointer",color:"rgba(46,38,35,.3)",fontSize:".78rem"}}>✕ Close</button>
      </div>
    </div>
  );
}

// ── Settings / Profile ─────────────────────────────────────────
function Settings({t,rabbit,setRabbit,premium,email,setLitter,setBonding,onManage}){
  const [name,setName]=useState(rabbit?.name||"");
  const [age,setAge]=useState(rabbit?.age||"");
  const [neutered,setNeutered]=useState(rabbit?.neutered||"");
  const [saved,setSaved]=useState(false);
  const [confirm,setConfirm]=useState(null);
  const ages=t("ages");
  const valid=name.trim()&&age&&neutered;
  const dirty=valid&&(name.trim()!==(rabbit?.name||"")||age!==(rabbit?.age||"")||neutered!==(rabbit?.neutered||""));
  const saveProfile=()=>{setRabbit({name:name.trim(),age,neutered});setSaved(true);setTimeout(()=>setSaved(false),1800);};
  const doReset=which=>{if(which==="litter")setLitter(null);else setBonding(null);setConfirm(null);};
  return (
    <div className="space-y-lg fade-in">
      <h2 style={{fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:".5rem"}}><span className="t-pink"><IcUser s={20}/></span> Settings</h2>

      <div className="card" style={{padding:"1.25rem"}}>
        <p className="section-label" style={{marginBottom:".75rem"}}>Your rabbit</p>
        <p className="t-muted" style={{fontSize:".76rem",lineHeight:1.55,marginBottom:"1rem"}}>Keep this up to date — it helps Céline give advice that fits your rabbit. Rabbits get neutered and grow up, so update it when things change.</p>
        <label style={{fontSize:".8rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q1")}</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="field w-full" style={{padding:".6rem .9rem",marginBottom:"1rem"}} placeholder="Buzz…"/>
        <label style={{fontSize:".8rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q2")}</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:".5rem",marginBottom:"1rem"}}>{ages.map(a=><button key={a} onClick={()=>setAge(a)} className={`chip ${age===a?"chip-on":""}`}>{a}</button>)}</div>
        <label style={{fontSize:".8rem",fontWeight:600,marginBottom:".4rem",display:"block"}}>{t("q3")}</label>
        <div style={{display:"flex",gap:".5rem",marginBottom:"1.1rem"}}>{[t("yes"),t("no"),t("notSure")].map(o=><button key={o} onClick={()=>setNeutered(o)} className={`chip ${neutered===o?"chip-on":""}`} style={{flex:1}}>{o}</button>)}</div>
        <button disabled={!dirty&&!saved} onClick={saveProfile} className="btn w-full" style={{padding:".7rem"}}>{saved?<><IcCheck s={16}/> Saved</>:"Save changes"}</button>
      </div>

      <div className="card" style={{padding:"1.25rem"}}>
        <p className="section-label" style={{marginBottom:".85rem"}}>Subscription</p>
        {premium?(
          <div style={{display:"flex",alignItems:"center",gap:".6rem",marginBottom:".85rem"}}>
            <span className="pill-premium"><IcCrown s={11}/> PREMIUM</span>
            <span className="t-muted" style={{fontSize:".8rem"}}>Active</span>
          </div>
        ):(
          <p className="t-muted" style={{fontSize:".82rem",lineHeight:1.55,marginBottom:".85rem"}}>You're on the free plan — 3 messages with Céline. Subscribe to unlock everything.</p>
        )}
        {email&&<p className="t-muted" style={{fontSize:".78rem",marginBottom:".85rem"}}>Linked email: <strong style={{color:"#2E2623"}}>{email}</strong></p>}
        {premium
          ? <a href={KOFI} target="_blank" rel="noreferrer" className="btn-ghost w-full" style={{padding:".65rem",textAlign:"center",textDecoration:"none",display:"block"}}>Manage on Ko-fi</a>
          : <button onClick={onManage} className="btn w-full" style={{padding:".7rem"}}>{t("premiumBtn")}</button>}
      </div>

      <div className="card" style={{padding:"1.25rem"}}>
        <p className="section-label" style={{marginBottom:".85rem"}}>Reset progress</p>
        {confirm==="litter"?(
          <div style={{background:"rgba(201,104,120,.06)",border:"1.5px solid rgba(201,104,120,.25)",borderRadius:14,padding:"1rem"}}>
            <p style={{fontWeight:600,fontSize:".88rem",marginBottom:".4rem"}}>Reset Litter journey?</p>
            <p style={{fontSize:".8rem",lineHeight:1.6,color:"rgba(46,38,35,.7)",marginBottom:".85rem"}}>This will permanently erase all 15 days of progress, your completed lessons and mission history. This cannot be undone.</p>
            <div style={{display:"flex",gap:".5rem"}}>
              <button onClick={()=>doReset("litter")} className="btn" style={{flex:1,padding:".6rem",fontSize:".8rem",background:"#b04a5c"}}>Yes, erase everything</button>
              <button onClick={()=>setConfirm(null)} className="btn-ghost" style={{flex:1,padding:".6rem",fontSize:".8rem"}}>Cancel</button>
            </div>
          </div>
        ):confirm==="bonding"?(
          <div style={{background:"rgba(201,104,120,.06)",border:"1.5px solid rgba(201,104,120,.25)",borderRadius:14,padding:"1rem"}}>
            <p style={{fontWeight:600,fontSize:".88rem",marginBottom:".4rem"}}>Reset Bond journey?</p>
            <p style={{fontSize:".8rem",lineHeight:1.6,color:"rgba(46,38,35,.7)",marginBottom:".85rem"}}>This will permanently erase all 56 days of progress, your bond score and all bonus lessons unlocked. This cannot be undone.</p>
            <div style={{display:"flex",gap:".5rem"}}>
              <button onClick={()=>doReset("bonding")} className="btn" style={{flex:1,padding:".6rem",fontSize:".8rem",background:"#b04a5c"}}>Yes, erase everything</button>
              <button onClick={()=>setConfirm(null)} className="btn-ghost" style={{flex:1,padding:".6rem",fontSize:".8rem"}}>Cancel</button>
            </div>
          </div>
        ):(
          <div className="space-y">
            <button onClick={()=>setConfirm("litter")} className="btn-ghost w-full" style={{padding:".65rem"}}>Reset Litter journey</button>
            <button onClick={()=>setConfirm("bonding")} className="btn-ghost w-full" style={{padding:".65rem"}}>Reset Bond journey</button>
          </div>
        )}
      </div>

      <div className="note-box" style={{textAlign:"center",lineHeight:1.65}}>Your progress is saved on this device. Cross-device sync is coming soon. Your premium access stays linked to your email.</div>

      <a href="https://linktr.ee/Buzzthebunny" target="_blank" rel="noreferrer" className="btn-ghost w-full" style={{padding:".7rem",textAlign:"center",textDecoration:"none",display:"block"}}>Share Feedback</a>
    </div>
  );
}

// ── V2 Footer ──────────────────────────────────────────────────
function V2Footer(){
  return (
    <div className="card" style={{marginTop:"2.5rem",padding:"1.5rem",textAlign:"center"}}>
      <p style={{fontWeight:600,fontSize:"1rem",marginBottom:".5rem"}}>The next chapter of Bun AI 🤍</p>
      <p className="t-muted" style={{fontSize:".82rem",lineHeight:1.65,maxWidth:300,margin:"0 auto 1.1rem"}}>We're already working on what's next. Your ideas help shape future updates.</p>
      <a href="https://linktr.ee/Buzzthebunny" target="_blank" rel="noreferrer" className="btn-ghost" style={{display:"inline-flex",alignItems:"center",gap:".4rem",textDecoration:"none",fontSize:".82rem",fontWeight:600}}>Share Feedback</a>
    </div>
  );
}
