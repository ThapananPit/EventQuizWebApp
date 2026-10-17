/* ============================================================
   ENGINE — ไม่แตะ DOM ทดสอบได้แยก
   ============================================================ */
let PATHS=[],NODES={},ENDINGS={},AXES=[],START_USERS=1000,DEAD=200,MAXU=1200;
let USER=null,CURRENT_PATH_ID=null;
const NODE_ENTER={
 repeat:S=>S.rulesFixed
  ?{u:[[-90,'สินค้าถูกซื้อในราคาถูกอีกครั้ง ลูกค้าเสียความเชื่อมั่น']],trust:-10,damage:10}
  :{u:[[-180,'ออเดอร์ปลอมและข้อมูลลูกค้าถูกอ่าน ลูกค้าจำนวนมากเลิกใช้']],trust:-15,damage:30}
};
const NODE_TEXT={
 repeat:S=>S.rulesFixed
  ?'เช้าวันถัดมา ผู้โจมตีส่งคำขอชำระเงินตรงเข้า API ข้ามการตรวจฝั่งเบราว์เซอร์ที่คุณเพิ่ม และได้สินค้าในราคาถูกอีกครั้ง'
  :(S.wrongDx
   ?'สองวันต่อมา ผู้โจมตีกลับมา การเปลี่ยนรหัสผ่านไม่ช่วยอะไรเพราะเขาไม่เคยใช้รหัสผ่านใครเลย ครั้งนี้เขาไม่เพียงแก้ราคา แต่ยังเปิดอ่านข้อมูลลูกค้าผ่านช่องเดิมด้วย'
   :'สองวันต่อมา ผู้โจมตีกลับมาผ่านช่องเดิมที่คุณยังไม่ได้อุด ครั้งนี้เขาไม่เพียงแก้ราคาออเดอร์ แต่ยังเปิดอ่านข้อมูลลูกค้าด้วย ร้านเสียทั้งสต็อกและความเชื่อมั่น')
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function newState(){
  return {users:START_USERS,trust:50,damage:0,rulesFixed:false,serverMoney:false,mfa:false,
    disclosed:'none',covered:false,rewrote:false,wrongDx:false,adminWeak:false,
    axes:{sec:0,speed:0,open:0,long:0},history:[],series:[START_USERS],
    nodeId:null,enterFx:null,enterTotal:0,dead:false,forcedEnding:null,lastNext:null};
}
function applyFx(S,fx){
  let total=0;(fx.u||[]).forEach(p=>{total+=p[0];});
  S.users=Math.max(0,S.users+total);
  S.trust=clamp(S.trust+(fx.trust||0),0,100);
  S.damage=clamp(S.damage+(fx.damage||0),0,100);
  if(fx.set)Object.assign(S,fx.set);
  if(fx.axes)for(const k in fx.axes)S.axes[k]+=fx.axes[k];
  return total;
}
function enterNode(S,id){
  const n=NODES[id];S.nodeId=id;
  const fx=NODE_ENTER[id]?NODE_ENTER[id](S):(n.enter||null);
  S.enterFx=fx;S.enterTotal=fx?applyFx(S,fx):0;
  S.series.push(S.users);S.dead=S.users<DEAD;
  return n;
}
function pick(S,cid){
  const n=NODES[S.nodeId];const c=n.choices.find(x=>x.id===cid);
  const total=applyFx(S,c);
  const rec={nodeId:S.nodeId,choiceId:cid,label:c.label,q:c.q,enterTotal:S.enterTotal,total,after:S.users};
  S.history.push(rec);S.series.push(S.users);
  if(S.users<DEAD)S.dead=true;
  S.lastNext=c.next;
  return {choice:c,rec};
}
function nextOf(S){
  if(S.dead){S.forcedEnding='collapse';return 'END';}
  const nx=S.lastNext;
  if(nx.indexOf('END')===0){const p=nx.split(':');if(p[1])S.forcedEnding=p[1];return 'END';}
  return nx;
}
function endingOf(S){
  if(S.forcedEnding)return S.forcedEnding;
  const fixed=S.rulesFixed&&S.serverMoney;
  if(fixed&&S.mfa&&S.damage<=10&&S.users>=900&&!S.covered)return 'root';
  if(S.rewrote&&fixed&&S.mfa&&S.damage<30&&!S.covered)return 'rebuilder';
  if(S.covered)return 'cover';
  if(S.disclosed==='yes'&&S.damage>=30)return 'honest';
  if(S.damage>=40)return 'scarred';
  if(!S.mfa||!fixed)return 'nomfa';
  return 'survivor';
}
function scoreOf(S,endId){
  const parts=[
   {l:'ผู้ใช้ที่เหลือ',v:clamp((S.users-DEAD)/(START_USERS-DEAD),0,1)*40,max:40},
   {l:'แก้ต้นเหตุ (Rules + คิดราคาที่ Server)',v:(S.rulesFixed?10:0)+(S.serverMoney?10:0),max:20},
   {l:'ด่านที่สอง (2-step)',v:S.mfa?10:0,max:10},
   {l:'ความเชื่อใจของลูกค้า',v:clamp(S.trust,0,100)/100*15,max:15},
   {l:'ความเสียหายที่ตามมา (ยิ่งน้อยยิ่งดี)',v:(1-clamp(S.damage,0,100)/100)*15,max:15}
  ];
  let t=parts.reduce((a,p)=>a+p.v,0);
  if(S.covered)t-=10;
  if(endId==='collapse')t=Math.min(t,30);
  if(endId==='bleeding')t=Math.min(t,35);
  return {total:Math.round(clamp(t,0,100)),parts,penalty:S.covered?10:0};
}
function gradeOf(n){return n>=90?'ยอดเยี่ยม':n>=75?'ดีมาก':n>=60?'ผ่าน':n>=40?'ต้องปรับปรุง':'เสี่ยงมาก';}
function choiceTotal(){let n=0;for(const k in NODES)n+=NODES[k].choices.length;return n;}

/*__UI__*/
/* ============================================================
   UI
   ============================================================ */
const $=s=>document.querySelector(s);
const app=$('#app');
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const sgn=d=>d>0?'+'+fmtN(d):d<0?'\u2212'+fmtN(Math.abs(d)):'\u00B10';
let S=null;
const UI={screen:'select',phase:'choose',from:START_USERS,last:null,armed:false};
const KIOSK=(function(){try{return new URLSearchParams(location.search).get('kiosk')==='1';}catch(e){return false;}})();

/* storage: เก็บตอนจบ/ตัวเลือกที่เคยเจอ (ในเบราว์เซอร์นี้เท่านั้น) */
const KEY='ld.shop.v1';
function loadStore(){try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);return {endings:o.endings||[],choices:o.choices||[]};}}catch(e){}return {endings:[],choices:[]};}
function saveStore(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
let STORE=loadStore();
function remember(kind,val){if(STORE[kind].indexOf(val)<0){STORE[kind].push(val);saveStore(STORE);}}

function chips(list){
  if(!list||!list.length)return '';
  return '<ul class="chips">'+list.map(p=>`<li class="chip ${p[0]>0?'pos':p[0]<0?'neg':'zero'}"><b>${sgn(p[0])}</b><span>${p[1]}</span></li>`).join('')+'</ul>';
}
function meterHTML(){
  const u=S.users;const cls=u<400?'bar risk':'bar';
  const state=u<300?'อันตราย: ใกล้ถึงจุดที่ร้านอยู่ต่อไม่ได้':u<500?'ร้านเริ่มสั่นคลอน':u>=START_USERS?'ฐานผู้ใช้แข็งแรง':'ฐานผู้ใช้ลดลง แต่ร้านยังไปต่อได้';
  return `<section class="meter" aria-label="จำนวนผู้ใช้">
    <div class="meter-top"><span class="lbl">ผู้ใช้ร้านค้า</span><span class="num" id="usersNum">${fmtN(UI.from)}</span></div>
    <div class="${cls}"><div class="fill" id="usersFill" style="width:${Math.min(100,UI.from/MAXU*100)}%"></div>
      <div class="mark" style="left:${DEAD/MAXU*100}%"><span>${DEAD}</span></div></div>
    <div class="state">${state} (ต่ำกว่า ${DEAD} คน ร้านต้องปิด)</div></section>`;
}
function animateMeter(){
  const num=document.getElementById('usersNum'),fill=document.getElementById('usersFill');
  if(!num)return;
  const from=UI.from,to=S.users;
  const w=v=>Math.min(100,v/MAXU*100)+'%';
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||from===to){num.textContent=fmtN(to);fill.style.width=w(to);return;}
  requestAnimationFrame(()=>{fill.style.width=w(to);});
  const t0=performance.now(),dur=900;
  (function step(t){const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);num.textContent=fmtN(from+(to-from)*e);if(p<1)requestAnimationFrame(step);})(t0);
}
function topBar(){
  const n=S?S.history.length+(UI.phase==='choose'?1:0):0;
  return `<div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span>
   <span class="step">${S?'การตัดสินใจที่ '+Math.max(1,n):''}</span>
   <button class="ghost" id="btnRestart">${UI.armed?'กดอีกครั้งเพื่อเริ่มใหม่':'เริ่มใหม่'}</button></div>`;
}
function bindTop(){
  const b=$('#btnRestart');if(!b)return;
  b.onclick=()=>{
    if(!UI.armed){UI.armed=true;b.textContent='กดอีกครั้งเพื่อเริ่มใหม่';setTimeout(()=>{UI.armed=false;if(b.isConnected)b.textContent='เริ่มใหม่';},3000);return;}
    UI.armed=false;toStart();
  };
}
function go(){window.scrollTo(0,0);const f=app.querySelector('[data-focus]');if(f)f.focus({preventScroll:true});resetIdle();}

/* ---------- screens ---------- */
function loadPath(id){
  return fetch(`js/paths/${id}.b64`)
    .then(r=>r.text())
    .then(t=>{const d=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t),c=>c.charCodeAt(0))));NODES=d.NODES;ENDINGS=d.ENDINGS;AXES=d.AXES;START_USERS=d.START_USERS;DEAD=d.DEAD;MAXU=d.MAXU;});
}
function selectPath(id){CURRENT_PATH_ID=id;loadPath(id).then(()=>toStart());}
function toPathSelect(){S=null;UI.screen='select';render();}
function renderLogin(){
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step"></span></div>
  <header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">สร้างให้ฉลาด เลือกให้คิด ปกป้องระบบของคุณ</p>
  </header>
  <section class="card scn">
    <span class="tag">เริ่มต้น</span>
    <h2>เข้าสู่ระบบเพื่อเริ่มเล่น</h2>
    <p>ลงทะเบียนด้วยบัญชี Google เพื่อบันทึกคะแนนและติดตามความก้าวหน้าของคุณ</p>
  </section>
  <a class="primary" href="/auth/google" style="display:block;text-align:center;text-decoration:none">เข้าสู่ระบบด้วย Google</a>`;
}
function renderPathSelect(){
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step"></span></div>
  <header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">สร้างให้ฉลาด เลือกให้คิด ปกป้องระบบของคุณ</p>
  </header>
  <section class="card scn"><span class="tag">เลือกโจทย์</span><h2>มีกี่เส้นทางที่คุณอยากลอง?</h2></section>
  <div class="choices">`+PATHS.map((p,i)=>`<button class="choice" data-path="${p.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="ct">${p.title}</span></button>`).join('')+`</div>`;
  app.querySelectorAll('.choice').forEach(b=>{b.onclick=()=>selectPath(b.dataset.path);});
}
function toStart(){S=null;UI.screen='start';UI.phase='choose';render();}
function begin(){
  S=newState();UI.screen='play';UI.phase='choose';UI.from=S.users;UI.last=null;
  enterNode(S,'start');render();
}
function render(){
  if(UI.screen==='login')renderLogin();
  else if(UI.screen==='select')renderPathSelect();
  else if(UI.screen==='start')renderStart();
  else if(UI.screen==='play')renderPlay();
  else renderResult();
  go();
}
function renderStart(){
  STORE=loadStore();
  const got=STORE.endings.length,tot=Object.keys(ENDINGS).length;
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step">โจทย์ที่ 1</span></div>
  <header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">สร้างให้ฉลาด เลือกให้คิด ปกป้องระบบของคุณ</p>
  </header>
  <section class="card scn">
    <span class="tag">โจทย์วันนี้</span>
    <h2>ร้านค้าออนไลน์ที่คุณเขียนเอง</h2>
    <p>คุณสร้างร้านขายของออนไลน์ด้วยตัวเอง วันหนึ่งมีบางอย่างผิดปกติ คุณต้องตัดสินใจทีละขั้น ดูว่าผู้ใช้ขึ้นหรือลง และเรียนรู้ว่าแต่ละทางส่งผลอะไรตามมา</p>
    <ul class="rules">
      <li>ทุกตัวเลือกมีข้อดีข้อเสีย ไม่มีข้อไหนฟรี</li>
      <li>เรื่องแตกกิ่งตามที่คุณเลือก จำนวนรอบไม่เท่ากัน ถ้าแก้ถูกจุดจะจบเร็ว</li>
      <li>ถ้าผู้ใช้เหลือต่ำกว่า ${DEAD} คน ร้านต้องปิด</li>
    </ul>
  </section>
  <button class="primary" id="btnStart">เริ่มเล่น</button>
  <p class="foot">ใช้เวลาราว 3 ถึง 6 นาที ไม่ต้องล็อกอิน${got?` · ตอนจบที่เจอแล้ว ${got}/${tot}`:''}</p>
  <p class="foot">เป็นเกมจำลองเพื่อการเรียนรู้ ตัวเลขผู้ใช้และคะแนนไม่ใช่สถิติจริง</p>`;
  $('#btnStart').onclick=begin;
}
function renderPlay(){
  const n=NODES[S.nodeId];
  if(UI.phase==='choose')renderChoose(n);else renderConsequence(n);
  bindTop();animateMeter();
  $('#live').textContent='ผู้ใช้ '+fmtN(S.users)+' คน';
}
function renderChoose(n){
  const text=NODE_TEXT[S.nodeId]?NODE_TEXT[S.nodeId](S):n.text;
  const ev=S.enterFx?`<div class="sub">ผลจากเหตุการณ์นี้</div>${chips(S.enterFx.u)}`:'';
  let body;
  if(S.dead){
    body=`<p class="chosen"><b>ผู้ใช้เหลือน้อยกว่า ${DEAD} คน</b> ร้านอยู่ต่อไม่ได้แล้ว</p>
      <button class="primary" id="btnEnd">ดูบทสรุป</button>`;
  }else{
    body=`<div class="choices" role="group" aria-label="ตัวเลือก">`+n.choices.map((c,i)=>
      `<button class="choice" data-id="${c.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="ct">${c.label}</span></button>`).join('')+`</div>`;
  }
  app.innerHTML=topBar()+meterHTML()+`
   <section class="card"><span class="tag">${n.tag}</span><h2 data-focus tabindex="-1">${n.title}</h2>
    <p>${text}</p>${ev}</section>`+body;
  if(S.dead){$('#btnEnd').onclick=finish;}
  else app.querySelectorAll('.choice').forEach(b=>{b.onclick=()=>choose(b.dataset.id);});
}
function choose(cid){
  if(UI.phase!=='choose'||S.dead)return;
  UI.phase='busy';
  app.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  UI.from=S.users;
  UI.last=pick(S,cid);
  remember('choices',S.nodeId+':'+cid);
  UI.phase='result';render();
}
function renderConsequence(n){
  const {choice}=UI.last;
  const qt={good:['good','\u2713 ทางที่ดี'],mid:['mid','~ พอใช้ มีข้อแลกเปลี่ยน'],bad:['bad','! ควรปรับ']}[choice.q];
  const btn=S.dead?'ดูบทสรุป':'ไปต่อ';
  app.innerHTML=topBar()+meterHTML()+`
   <section class="card">
    <p class="chosen">คุณเลือก: <b>${choice.label}</b></p>
    <span class="quality ${qt[0]}">${qt[1]}</span>
    <h2 data-focus tabindex="-1">สิ่งที่เกิดขึ้น</h2>
    <p>${choice.out}</p>
    <div class="sub">ผลต่อจำนวนผู้ใช้</div>${chips(choice.u)}
    <div class="know"><strong>ความรู้ Cybersecurity</strong>${choice.lesson}</div>
   </section>
   <button class="primary" id="btnNext">${btn}</button>`;
  $('#btnNext').onclick=advance;
}
function advance(){
  const nx=nextOf(S);
  if(nx==='END'){finish();return;}
  UI.phase='choose';UI.from=S.users;enterNode(S,nx);render();
}
function finish(){
  if(!S.forcedEnding&&S.dead)S.forcedEnding='collapse';
  S.endId=endingOf(S);remember('endings',S.endId);
  STORE=loadStore();
  if(USER&&CURRENT_PATH_ID){
    const sc=scoreOf(S,S.endId);
    fetch('/api/scores',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({path_id:CURRENT_PATH_ID,score:sc.total,ending:S.endId,users_remaining:S.users})
    }).catch(()=>{});
  }
  UI.screen='result';render();
}

/* ---------- result ---------- */
function chartSVG(){
  const W=640,H=180,pl=34,pr=12,pt=12,pb=26;
  const pts=S.series,n=pts.length;
  const x=i=>pl+(n===1?0:i/(n-1))*(W-pl-pr);
  const y=v=>pt+(1-clamp(v,0,MAXU)/MAXU)*(H-pt-pb);
  const line=pts.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(v).toFixed(1)).join(' ');
  const dots=pts.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="var(--cyan)"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟจำนวนผู้ใช้ตลอดเรื่อง: ${pts.map(fmtN).join(', ')}">
   <line x1="${pl}" x2="${W-pr}" y1="${y(DEAD)}" y2="${y(DEAD)}" stroke="var(--pink)" stroke-dasharray="5 4"/>
   <text x="${pl+4}" y="${y(DEAD)-4}">จุดปิดร้าน ${DEAD}</text>
   <line x1="${pl}" x2="${W-pr}" y1="${y(START_USERS)}" y2="${y(START_USERS)}" stroke="var(--line)" stroke-dasharray="2 4"/>
   <text x="${pl+4}" y="${y(START_USERS)-4}">เริ่มต้น ${fmtN(START_USERS)}</text>
   <path d="${line}" fill="none" stroke="var(--purple)" stroke-width="3" stroke-linejoin="round"/>${dots}
   <text x="${pl}" y="${H-6}">เริ่ม</text><text x="${W-pr-24}" y="${H-6}">จบ</text></svg>`;
}
function axesHTML(){
  let code='';
  const rows=AXES.map(a=>{
    const v=S.axes[a.k];code+=v>=0?a.letR:a.letL;
    const pct=clamp(50+clamp(v,-6,6)/6*50,4,96);
    const d=v>=2?a.dR:v<=-2?a.dL:a.dM;
    return `<div class="axis"><div class="axl"><span>${a.L}</span><span>${a.R}</span></div>
      <div class="axbar" role="img" aria-label="${a.L} ถึง ${a.R}: ${v}"><i style="left:${pct}%"></i></div><p>${d}</p></div>`;
  }).join('');
  return {rows,code};
}
function reviewHTML(){
  return S.history.map(h=>{
    const n=NODES[h.nodeId];const c=n.choices.find(x=>x.id===h.choiceId);
    const qt={good:['good','\u2713 ทางที่ดี'],mid:['mid','~ พอใช้'],bad:['bad','! ควรปรับ']}[h.q];
    const best=n.choices.find(x=>x.id===n.best);
    const better=(h.q!=='good'&&best&&n.bestWhy!=='—')?`<div class="better"><b>ทางที่ดีกว่า:</b> ${best.label}<br>${n.bestWhy}</div>`:'';
    const ev=h.enterTotal?`เหตุการณ์ ${sgn(h.enterTotal)} · `:'';
    return `<div class="rev"><span class="quality ${qt[0]}">${qt[1]}</span><h3>${n.title}</h3>
      <div class="ch">คุณเลือก: ${c.label}</div>
      <div class="tot">${ev}การตัดสินใจ ${sgn(h.total)} ผู้ใช้</div>
      <div class="know"><strong>ความรู้</strong>${c.lesson}</div>${better}</div>`;
  }).join('');
}
function summaryLists(){
  const pros=[],cons=[],recs=[];
  const fixed=S.rulesFixed&&S.serverMoney;
  if(fixed)pros.push('แก้ถึงต้นเหตุทั้งสองจุด (Rules และการคิดราคาที่ Server) ช่องที่ใช้โจมตีครั้งแรกถูกปิดจริง');
  if(S.mfa)pros.push('มีด่านที่สอง (2-step) ที่ลดผลจากรหัสผ่านที่หลุดหรือถูกหลอกขอ');
  if(S.disclosed==='yes')pros.push('สื่อสารกับลูกค้าตรงไปตรงมา ช่วยให้ลูกค้าป้องกันตัวเองและรักษาความเชื่อใจระยะยาว');
  if(S.history[0]&&S.history[0].choiceId==='a')pros.push('กักกันก่อนแก้ ทำให้ได้หลักฐานที่ใช้วินิจฉัยต้นเหตุได้ถูกจุด');
  if(S.users>=900)pros.push('รักษาฐานผู้ใช้ไว้ได้เกือบเท่าเดิม');
  if(!pros.length)pros.push('คุณเล่นมาจนจบและได้เห็นผลของทุกการตัดสินใจ ซึ่งเป็นข้อมูลสำหรับปรับแผนรอบหน้า');
  if(!fixed)cons.push('ต้นเหตุยังเหลืออยู่ (Rules หรือการคิดราคาฝั่ง client) จึงมีโอกาสถูกโจมตีซ้ำ');
  if(!S.mfa)cons.push('บัญชีแอดมินยังไม่มี 2-step ถ้ารหัสผ่านหลุดหรือถูกหลอกขอ จะไม่มีด่านที่สองรองรับ');
  if(S.covered)cons.push('เคยปิดบังเหตุจากลูกค้า ทำให้เสียความเชื่อใจเมื่อความจริงถูกเปิดเผย');
  if(S.wrongDx)cons.push('วินิจฉัยผิดจุดช่วงต้น ทำให้เสียเวลาและความเชื่อมั่น');
  if(S.damage>=30)cons.push('ข้อมูลหรือทรัพย์สินของร้านเสียหายค่อนข้างมาก ผลกระทบอาจตามมาอีก');
  if(S.users<500)cons.push('สูญเสียผู้ใช้มากกว่าครึ่ง การกู้ฐานลูกค้ากลับต้องใช้เวลา');
  if(!cons.length)cons.push('ไม่มีจุดอ่อนใหญ่จากการตัดสินใจ แต่ระบบจริงยังมีความเสี่ยงที่เกมนี้ไม่ได้ครอบคลุม');
  if(!fixed)recs.push('อุดต้นเหตุที่เหลือก่อนอย่างอื่น: ให้ Server คิดราคาและตรวจสิทธิ์เสมอ และจำกัด Rules เท่าที่จำเป็น');
  if(!S.mfa)recs.push('เปิด 2-step ให้บัญชีแอดมินทุกบัญชี และจำกัดจำนวนครั้งที่ล็อกอินผิด');
  if(S.covered)recs.push('เตรียมแผนสื่อสารเหตุละเมิดข้อมูล: ใครต้องรู้ เมื่อไร และบอกอะไร แล้วแจ้งผู้ได้รับผลกระทบ');
  recs.push('ตั้งการแจ้งเตือนอัตโนมัติ เช่น ออเดอร์ราคาผิดปกติ ล็อกอินผิดซ้ำ ล็อกอินจากอุปกรณ์ใหม่ เพื่อรู้ก่อนลูกค้า');
  recs.push('สำรองข้อมูลและทดสอบกู้คืนเป็นระยะ รวมถึงซ้อมแผนรับมือเหตุ เพื่อให้เหตุถัดไปจบเร็วขึ้น');
  return {pros,cons,recs:recs.slice(0,4)};
}
function renderResult(){
  const e=ENDINGS[S.endId];const sc=scoreOf(S,S.endId);
  const col=e.tone==='good'?'var(--green)':e.tone==='bad'?'var(--pink)':'var(--amber)';
  const R=54,C=2*Math.PI*R;
  const ax=axesHTML(),sl=summaryLists();
  const totalCh=choiceTotal();
  const coll=Object.keys(ENDINGS).map(k=>STORE.endings.indexOf(k)>=0?`<div class="got">\u2713 ${ENDINGS[k].title}</div>`:`<div>??? ยังไม่เคยเจอ</div>`).join('');
  app.innerHTML=`
  <div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step">บทสรุป</span></div>
  <section class="card ending ${e.tone}">
    <div class="kicker">ตอนจบของคุณ</div>
    <h2 data-focus tabindex="-1">${e.title}</h2><p>${e.desc}</p>
  </section>
  <section class="card">
    <div class="scorebox">
      <div class="ring" role="img" aria-label="คะแนนความเหมาะสม ${sc.total} จาก 100">
        <svg width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="12"/>
        <circle cx="64" cy="64" r="${R}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(C*sc.total/100).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="v">${sc.total}</div></div>
      <div class="meta"><div class="grade" style="color:${col}">${gradeOf(sc.total)}</div>
        <p>คะแนนความเหมาะสมของแนวทางที่คุณเลือกต่อโจทย์นี้ (เต็ม 100) ผู้ใช้เหลือ <b>${fmtN(S.users)}</b> จาก ${fmtN(START_USERS)} คน</p></div>
    </div>
    <div class="parts">${sc.parts.map(p=>`<div class="part"><div class="pl"><span>${p.l}</span><span>${Math.round(p.v)}/${p.max}</span></div><div class="pb"><i style="width:${p.v/p.max*100}%"></i></div></div>`).join('')}
    ${sc.penalty?`<div class="part"><div class="pl"><span>หักคะแนนเพราะปิดบังเหตุจากลูกค้า</span><span>\u2212${sc.penalty}</span></div></div>`:''}</div>
  </section>
  <section class="card"><h2>เส้นทางผู้ใช้ตลอดเรื่อง</h2>${chartSVG()}</section>
  <section class="card"><h2>สไตล์การตัดสินใจของคุณ</h2>
    <p class="code" aria-label="รหัสสไตล์ ${ax.code}">${ax.code}</p>${ax.rows}
    <p class="note">S ความปลอดภัย / B ธุรกิจ · F เร็ว / C รอบคอบ · T โปร่งใส / I ภาพลักษณ์ · L ระยะยาว / N เฉพาะหน้า ไม่มีสไตล์ไหนถูกหรือผิด แต่แต่ละแบบมีจุดที่ต้องระวัง</p></section>
  <section class="card"><h2>ทบทวนทุกการตัดสินใจ</h2>${reviewHTML()}</section>
  <section class="card"><h2>ภาพรวมของแนวทางที่เลือก</h2>
    <div class="sub">ข้อดี</div><ul class="list pros">${sl.pros.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">จุดอ่อน</div><ul class="list cons">${sl.cons.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">ควรทำต่อ (เรียงตามความสำคัญ)</div><ol class="list recs">${sl.recs.map(x=>`<li>${x}</li>`).join('')}</ol>
  </section>
  <section class="card"><h2>ลองเส้นทางอื่น</h2>
    <p>ตอนจบที่เจอแล้ว ${STORE.endings.length}/${Object.keys(ENDINGS).length} · ตัวเลือกที่เคยลอง ${STORE.choices.length}/${totalCh}</p>
    <div class="coll">${coll}</div></section>
  <div class="row"><button class="primary" id="btnAgain">เล่นอีกครั้ง</button><button class="secondary" id="btnHome">กลับหน้าแรก</button></div>
  <p class="foot">เป็นเกมจำลองเพื่อการเรียนรู้ ตัวเลขผู้ใช้และคะแนนไม่ใช่สถิติจริง และไม่ใช่การรับรองว่าระบบจริงปลอดภัย</p>`;
  $('#btnAgain').onclick=begin;$('#btnHome').onclick=toStart;
  $('#live').textContent='บทสรุป คะแนน '+sc.total+' จาก 100';
}

/* ---------- kiosk idle reset (เปิดด้วย ?kiosk=1) ---------- */
let warnT=null,idleT=null,cdT=null;
function hideWarn(){$('#idle').classList.remove('on');}
function resetIdle(){
  clearTimeout(warnT);clearTimeout(idleT);clearInterval(cdT);hideWarn();
  if(!KIOSK||UI.screen==='start')return;
  warnT=setTimeout(()=>{
    let c=10;const m=$('#idleMsg');m.textContent='ไม่มีการใช้งาน จะกลับหน้าแรกใน '+c+' วินาที';
    $('#idle').classList.add('on');
    cdT=setInterval(()=>{c--;if(c>0)m.textContent='ไม่มีการใช้งาน จะกลับหน้าแรกใน '+c+' วินาที';},1000);
  },50000);
  idleT=setTimeout(()=>{hideWarn();toStart();},60000);
}
['pointerdown','keydown','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,()=>{if(KIOSK)resetIdle();},{passive:true}));
$('#idleBtn').onclick=resetIdle;

Promise.all([
  fetch('js/index.json').then(r=>r.json()),
  fetch('/api/me').then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([idx,user])=>{PATHS=idx.paths;USER=user;if(USER)toPathSelect();else{UI.screen='login';render();}});
