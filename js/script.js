/* ============================================================
   ENGINE
   ============================================================ */
let PATHS=[],NODES={},ENDINGS={},AXES=[],START_USERS=1000,DEAD=200,MAXU=1200;
let USER=null,CURRENT_PATH_ID=null;
let LANG='th',I18N={};

function t(k,v={}){
  let s=((I18N[LANG]||{})[k])||((I18N.th||{})[k])||k;
  for(const[a,b] of Object.entries(v))s=s.replace('{'+a+'}',b);
  return s;
}
function changeLang(l){
  LANG=l;localStorage.setItem('ld.lang',l);
  if(UI.screen==='play'||UI.screen==='result'){
    S=null;loadPath(CURRENT_PATH_ID).then(()=>toStart());
  }else render();
}

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
   {l:t('scorePart1'),v:clamp((S.users-DEAD)/(START_USERS-DEAD),0,1)*40,max:40},
   {l:t('scorePart2'),v:(S.rulesFixed?10:0)+(S.serverMoney?10:0),max:20},
   {l:t('scorePart3'),v:S.mfa?10:0,max:10},
   {l:t('scorePart4'),v:clamp(S.trust,0,100)/100*15,max:15},
   {l:t('scorePart5'),v:(1-clamp(S.damage,0,100)/100)*15,max:15}
  ];
  let tot=parts.reduce((a,p)=>a+p.v,0);
  if(S.covered)tot-=10;
  if(endId==='collapse')tot=Math.min(tot,30);
  if(endId==='bleeding')tot=Math.min(tot,35);
  return {total:Math.round(clamp(tot,0,100)),parts,penalty:S.covered?10:0};
}
function gradeOf(n){return n>=90?t('gradeExcellent'):n>=75?t('gradeGood'):n>=60?t('gradePass'):n>=40?t('gradeWeak'):t('gradeBad');}
function choiceTotal(){let n=0;for(const k in NODES)n+=NODES[k].choices.length;return n;}

/*__UI__*/
/* ============================================================
   UI
   ============================================================ */
const $=s=>document.querySelector(s);
const app=$('#app');
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const sgn=d=>d>0?'+'+fmtN(d):d<0?'−'+fmtN(Math.abs(d)):'±0';
let S=null;
const UI={screen:'select',phase:'choose',from:START_USERS,last:null,armed:false};
const KIOSK=(function(){try{return new URLSearchParams(location.search).get('kiosk')==='1';}catch(e){return false;}})();

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
  const state=u<300?t('stateDanger'):u<500?t('stateShaky'):u>=START_USERS?t('stateStrong'):t('stateDecline');
  return `<section class="meter" aria-label="${t('meterLabel')}">
    <div class="meter-top"><span class="lbl">${t('meterLabel')}</span><span class="num" id="usersNum">${fmtN(UI.from)}</span></div>
    <div class="${cls}"><div class="fill" id="usersFill" style="width:${Math.min(100,UI.from/MAXU*100)}%"></div>
      <div class="mark" style="left:${DEAD/MAXU*100}%"><span>${DEAD}</span></div></div>
    <div class="state">${state} ${t('meterNote',{dead:DEAD})}</div></section>`;
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
  (function step(ts){const p=Math.min(1,(ts-t0)/dur);const e=1-Math.pow(1-p,3);num.textContent=fmtN(from+(to-from)*e);if(p<1)requestAnimationFrame(step);})(t0);
}
function staticTop(step=''){
  return `<div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span><span class="step">${step}</span><button class="ghost" id="btnLang">${t('langToggle')}</button></div>`;
}
function topBar(){
  const n=S?S.history.length+(UI.phase==='choose'?1:0):0;
  return `<div class="top"><span class="brand">LAUNCH <b>&amp;</b> DEFEND</span>
   <span class="step">${S?t('step',{n:Math.max(1,n)}):''}  </span>
   <button class="ghost" id="btnLang">${t('langToggle')}</button>
   <button class="ghost" id="btnRestart">${UI.armed?t('restartConfirm'):t('restart')}</button></div>`;
}
function bindTop(){
  const b=$('#btnRestart');if(!b)return;
  b.onclick=()=>{
    if(!UI.armed){UI.armed=true;b.textContent=t('restartConfirm');setTimeout(()=>{UI.armed=false;if(b.isConnected)b.textContent=t('restart');},3000);return;}
    UI.armed=false;toStart();
  };
}
function go(){
  window.scrollTo(0,0);
  const f=app.querySelector('[data-focus]');if(f)f.focus({preventScroll:true});
  const bl=document.getElementById('btnLang');if(bl)bl.onclick=()=>changeLang(LANG==='th'?'en':'th');
  resetIdle();
}

/* ---------- screens ---------- */
function loadPath(id){
  return fetch(`js/paths/${LANG}/${id}.b64`)
    .then(r=>{if(!r.ok&&LANG!=='th')return fetch(`js/paths/th/${id}.b64`);return r;})
    .then(r=>r.text())
    .then(raw=>{const d=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw),c=>c.charCodeAt(0))));NODES=d.NODES;ENDINGS=d.ENDINGS;AXES=d.AXES;START_USERS=d.START_USERS;DEAD=d.DEAD;MAXU=d.MAXU;});
}
function selectPath(id){CURRENT_PATH_ID=id;loadPath(id).then(()=>toStart());}
function toPathSelect(){S=null;UI.screen='select';render();}
function renderLogin(){
  app.innerHTML=
  staticTop()+
  `<header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">${t('tagline')}</p>
  </header>
  <section class="card scn">
    <span class="tag">${t('loginTag')}</span>
    <h2>${t('loginTitle')}</h2>
    <p>${t('loginDesc')}</p>
  </section>
  <a class="primary" href="/auth/google" style="display:block;text-align:center;text-decoration:none">${t('loginBtn')}</a>`;
}
function renderQuestionnaire(){
  const REFS=[
    {id:'social',label:t('refSocial')},
    {id:'wom',label:t('refWom')},
    {id:'events',label:t('refEvents')},
    {id:'other',label:t('refOther')},
  ];
  app.innerHTML=
  staticTop(t('profileStep'))+
  `<header class="hero">
    <h1 class="logo" data-focus tabindex="-1">PLAYER <span>PROFILE</span></h1>
    <p class="tagline">${t('profileTagline')}</p>
  </header>
  <section class="card scn">
    <span class="tag">${t('profileTag')}</span>
    <h2>${t('profileCardTitle')}</h2>
    <p>${t('profileCardDesc')}</p>
  </section>
  <section class="card">
    <div class="sub">${t('profileSchoolLabel')}</div>
    <input class="field" id="qSchool" type="text" placeholder="${t('profileSchoolPlaceholder')}" autocomplete="off" maxlength="120">
    <div class="sub" style="margin-top:16px">${t('profileAgeLabel')}</div>
    <input class="field" id="qAge" type="number" min="10" max="99" placeholder="${t('profileAgePlaceholder')}">
    <div class="sub" style="margin-top:16px">${t('profileRefLabel')}</div>
    <div class="choices" id="qRef" style="margin-top:8px">`+
    REFS.map((o,i)=>`<button class="choice" data-ref="${o.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="ct">${o.label}</span></button>`).join('')+
    `</div>
  </section>
  <button class="primary" id="btnProfile" disabled>${t('profileSubmit')}</button>`;

  let selRef=null;
  const schoolEl=$('#qSchool'),ageEl=$('#qAge'),btn=$('#btnProfile');
  const check=()=>{btn.disabled=!(schoolEl.value.trim()&&ageEl.value&&selRef);};
  schoolEl.oninput=check;ageEl.oninput=check;
  app.querySelectorAll('#qRef .choice').forEach(b=>{
    b.onclick=()=>{
      app.querySelectorAll('#qRef .choice').forEach(x=>x.classList.remove('scn'));
      b.classList.add('scn');selRef=b.dataset.ref;check();
    };
  });
  btn.onclick=async()=>{
    btn.disabled=true;btn.textContent=t('profileSaving');
    try{
      const r=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({school:schoolEl.value.trim(),age:parseInt(ageEl.value),referral:selRef})});
      if(r.ok){USER.school=schoolEl.value.trim();USER.age=parseInt(ageEl.value);USER.referral=selRef;toPathSelect();}
      else{btn.disabled=false;btn.textContent=t('profileSubmit');}
    }catch{btn.disabled=false;btn.textContent=t('profileSubmit');}
  };
}
function renderPathSelect(){
  const titleOf=p=>typeof p.title==='object'?(p.title[LANG]||p.title.th):p.title;
  app.innerHTML=
  staticTop()+
  `<header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">${t('tagline')}</p>
  </header>
  <section class="card scn"><span class="tag">${t('selectTag')}</span><h2>${t('selectTitle')}</h2></section>
  <div class="choices">`+PATHS.map((p,i)=>`<button class="choice" data-path="${p.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="ct">${titleOf(p)}</span></button>`).join('')+`</div>`;
  app.querySelectorAll('.choice').forEach(b=>{b.onclick=()=>selectPath(b.dataset.path);});
}
function toStart(){S=null;UI.screen='start';UI.phase='choose';render();}
function begin(){
  S=newState();UI.screen='play';UI.phase='choose';UI.from=S.users;UI.last=null;
  enterNode(S,'start');render();
}
function render(){
  if(UI.screen==='login')renderLogin();
  else if(UI.screen==='questionnaire')renderQuestionnaire();
  else if(UI.screen==='select')renderPathSelect();
  else if(UI.screen==='start')renderStart();
  else if(UI.screen==='play')renderPlay();
  else renderResult();
  go();
}
function renderStart(){
  STORE=loadStore();
  const got=STORE.endings.length,tot=Object.keys(ENDINGS).length;
  app.innerHTML=
  staticTop(t('startStep'))+
  `<header class="hero">
    <h1 class="logo" data-focus tabindex="-1">Launch <span>&amp;</span> Defend</h1>
    <p class="tagline">${t('tagline')}</p>
  </header>
  <section class="card scn">
    <span class="tag">${t('startTag')}</span>
    <h2>${t('startCardTitle')}</h2>
    <p>${t('startCardDesc')}</p>
    <ul class="rules">
      <li>${t('ruleNoFree')}</li>
      <li>${t('ruleBranch')}</li>
      <li>${t('ruleClose',{dead:DEAD})}</li>
    </ul>
  </section>
  <button class="primary" id="btnStart">${t('startBtn')}</button>
  <p class="foot">${t('startTime')}${got?t('startEndings',{got,tot}):''}</p>
  <p class="foot">${t('startDisclaimer')}</p>`;
  $('#btnStart').onclick=begin;
}
function renderPlay(){
  const n=NODES[S.nodeId];
  if(UI.phase==='choose')renderChoose(n);else renderConsequence(n);
  bindTop();animateMeter();
  $('#live').textContent=t('liveUsers',{n:fmtN(S.users)});
}
function renderChoose(n){
  const text=NODE_TEXT[S.nodeId]?NODE_TEXT[S.nodeId](S):n.text;
  const ev=S.enterFx?`<div class="sub">${t('enterFxLabel')}</div>${chips(S.enterFx.u)}`:'';
  let body;
  if(S.dead){
    body=`<p class="chosen"><b>${t('deadMsg',{dead:DEAD})}</b></p>
      <button class="primary" id="btnEnd">${t('btnSummary')}</button>`;
  }else{
    body=`<div class="choices" role="group" aria-label="${t('choiceGroup')}">`+n.choices.map((c,i)=>
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
  const qt={good:['good',t('qualGood')],mid:['mid',t('qualMid')],bad:['bad',t('qualBad')]}[choice.q];
  const btn=S.dead?t('btnSummary'):t('btnNext');
  app.innerHTML=topBar()+meterHTML()+`
   <section class="card">
    <p class="chosen">${t('youChose')} <b>${choice.label}</b></p>
    <span class="quality ${qt[0]}">${qt[1]}</span>
    <h2 data-focus tabindex="-1">${t('happened')}</h2>
    <p>${choice.out}</p>
    <div class="sub">${t('effectLabel')}</div>${chips(choice.u)}
    <div class="know"><strong>${t('knowLabel')}</strong>${choice.lesson}</div>
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
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('chartAria',{pts:pts.map(fmtN).join(', ')})}">
   <line x1="${pl}" x2="${W-pr}" y1="${y(DEAD)}" y2="${y(DEAD)}" stroke="var(--pink)" stroke-dasharray="5 4"/>
   <text x="${pl+4}" y="${y(DEAD)-4}">${t('chartClose',{dead:DEAD})}</text>
   <line x1="${pl}" x2="${W-pr}" y1="${y(START_USERS)}" y2="${y(START_USERS)}" stroke="var(--line)" stroke-dasharray="2 4"/>
   <text x="${pl+4}" y="${y(START_USERS)-4}">${t('chartInit',{start:fmtN(START_USERS)})}</text>
   <path d="${line}" fill="none" stroke="var(--purple)" stroke-width="3" stroke-linejoin="round"/>${dots}
   <text x="${pl}" y="${H-6}">${t('chartStart')}</text><text x="${W-pr-24}" y="${H-6}">${t('chartEnd')}</text></svg>`;
}
function axesHTML(){
  let code='';
  const rows=AXES.map(a=>{
    const v=S.axes[a.k];code+=v>=0?a.letR:a.letL;
    const pct=clamp(50+clamp(v,-6,6)/6*50,4,96);
    const d=v>=2?a.dR:v<=-2?a.dL:a.dM;
    return `<div class="axis"><div class="axl"><span>${a.L}</span><span>${a.R}</span></div>
      <div class="axbar" role="img" aria-label="${a.L} / ${a.R}: ${v}"><i style="left:${pct}%"></i></div><p>${d}</p></div>`;
  }).join('');
  return {rows,code};
}
function reviewHTML(){
  return S.history.map(h=>{
    const n=NODES[h.nodeId];const c=n.choices.find(x=>x.id===h.choiceId);
    const qt={good:['good',t('reviewQualGood')],mid:['mid',t('reviewQualMid')],bad:['bad',t('reviewQualBad')]}[h.q];
    const best=n.choices.find(x=>x.id===n.best);
    const better=(h.q!=='good'&&best&&n.bestWhy!=='—')?`<div class="better"><b>${t('betterLabel')}</b> ${best.label}<br>${n.bestWhy}</div>`:'';
    const ev=h.enterTotal?t('reviewEv',{n:sgn(h.enterTotal)}):'';
    return `<div class="rev"><span class="quality ${qt[0]}">${qt[1]}</span><h3>${n.title}</h3>
      <div class="ch">${t('reviewYouChose')} ${c.label}</div>
      <div class="tot">${ev}${t('reviewDec',{n:sgn(h.total)})}</div>
      <div class="know"><strong>${t('reviewKnow')}</strong>${c.lesson}</div>${better}</div>`;
  }).join('');
}
function summaryLists(){
  const pros=[],cons=[],recs=[];
  const fixed=S.rulesFixed&&S.serverMoney;
  if(fixed)pros.push(t('sumPros1'));
  if(S.mfa)pros.push(t('sumPros2'));
  if(S.disclosed==='yes')pros.push(t('sumPros3'));
  if(S.history[0]&&S.history[0].choiceId==='a')pros.push(t('sumPros4'));
  if(S.users>=900)pros.push(t('sumPros5'));
  if(!pros.length)pros.push(t('sumPros0'));
  if(!fixed)cons.push(t('sumCons1'));
  if(!S.mfa)cons.push(t('sumCons2'));
  if(S.covered)cons.push(t('sumCons3'));
  if(S.wrongDx)cons.push(t('sumCons4'));
  if(S.damage>=30)cons.push(t('sumCons5'));
  if(S.users<500)cons.push(t('sumCons6'));
  if(!cons.length)cons.push(t('sumCons0'));
  if(!fixed)recs.push(t('sumRecs1'));
  if(!S.mfa)recs.push(t('sumRecs2'));
  if(S.covered)recs.push(t('sumRecs3'));
  recs.push(t('sumRecs4'));
  recs.push(t('sumRecs5'));
  return {pros,cons,recs:recs.slice(0,4)};
}
function renderResult(){
  const e=ENDINGS[S.endId];const sc=scoreOf(S,S.endId);
  const col=e.tone==='good'?'var(--green)':e.tone==='bad'?'var(--pink)':'var(--amber)';
  const R=54,C=2*Math.PI*R;
  const ax=axesHTML(),sl=summaryLists();
  const totalCh=choiceTotal();
  const coll=Object.keys(ENDINGS).map(k=>STORE.endings.indexOf(k)>=0?`<div class="got">✓ ${ENDINGS[k].title}</div>`:`<div>${t('unknown')}</div>`).join('');
  app.innerHTML=
  staticTop(t('resultStep'))+
  `<section class="card ending ${e.tone}">
    <div class="kicker">${t('endingKicker')}</div>
    <h2 data-focus tabindex="-1">${e.title}</h2><p>${e.desc}</p>
  </section>
  <section class="card">
    <div class="scorebox">
      <div class="ring" role="img" aria-label="${t('scoreAria',{score:sc.total})}">
        <svg width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--surface2)" stroke-width="12"/>
        <circle cx="64" cy="64" r="${R}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(C*sc.total/100).toFixed(1)} ${C.toFixed(1)}"/></svg>
        <div class="v">${sc.total}</div></div>
      <div class="meta"><div class="grade" style="color:${col}">${gradeOf(sc.total)}</div>
        <p>${t('scoreLabel',{users:fmtN(S.users),start:fmtN(START_USERS)})}</p></div>
    </div>
    <div class="parts">${sc.parts.map(p=>`<div class="part"><div class="pl"><span>${p.l}</span><span>${Math.round(p.v)}/${p.max}</span></div><div class="pb"><i style="width:${p.v/p.max*100}%"></i></div></div>`).join('')}
    ${sc.penalty?`<div class="part"><div class="pl"><span>${t('penalty')}</span><span>−${sc.penalty}</span></div></div>`:''}</div>
  </section>
  <section class="card"><h2>${t('chartTitle')}</h2>${chartSVG()}</section>
  <section class="card"><h2>${t('axesTitle')}</h2>
    <p class="code" aria-label="${t('axesTitle')} ${ax.code}">${ax.code}</p>${ax.rows}
    <p class="note">${t('axesNote')}</p></section>
  <section class="card"><h2>${t('reviewTitle')}</h2>${reviewHTML()}</section>
  <section class="card"><h2>${t('summaryTitle')}</h2>
    <div class="sub">${t('prosLabel')}</div><ul class="list pros">${sl.pros.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">${t('consLabel')}</div><ul class="list cons">${sl.cons.map(x=>`<li>${x}</li>`).join('')}</ul>
    <div class="sub">${t('recsLabel')}</div><ol class="list recs">${sl.recs.map(x=>`<li>${x}</li>`).join('')}</ol>
  </section>
  <section class="card"><h2>${t('tryAgainTitle')}</h2>
    <p>${t('tryAgainDesc',{got:STORE.endings.length,tot:Object.keys(ENDINGS).length,choices:STORE.choices.length,total:totalCh})}</p>
    <div class="coll">${coll}</div></section>
  <div class="row"><button class="primary" id="btnAgain">${t('btnAgain')}</button><button class="secondary" id="btnHome">${t('btnHome')}</button></div>
  <p class="foot">${t('disclaimer')}</p>`;
  $('#btnAgain').onclick=begin;$('#btnHome').onclick=toStart;
  $('#live').textContent=t('liveResult',{score:sc.total});
}

/* ---------- kiosk idle reset ---------- */
let warnT=null,idleT=null,cdT=null;
function hideWarn(){$('#idle').classList.remove('on');}
function resetIdle(){
  clearTimeout(warnT);clearTimeout(idleT);clearInterval(cdT);hideWarn();
  if(!KIOSK||UI.screen==='start')return;
  warnT=setTimeout(()=>{
    let c=10;const m=$('#idleMsg');m.textContent=t('idleMsg',{n:c});
    $('#idle').classList.add('on');
    cdT=setInterval(()=>{c--;if(c>0)m.textContent=t('idleMsg',{n:c});},1000);
  },50000);
  idleT=setTimeout(()=>{hideWarn();toStart();},60000);
}
['pointerdown','keydown','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,()=>{if(KIOSK)resetIdle();},{passive:true}));
$('#idleBtn').onclick=resetIdle;

/* ---------- background fx ---------- */
(function initBgfx(){
  const container=document.getElementById('bgfx');
  if(!container)return;
  const cmds=[
    'nmap -sV 192.168.1.0/24',
    'sudo iptables -L -n -v',
    'grep -r "password" /var/log/',
    'ssh -i id_rsa admin@10.0.0.1',
    'cat /etc/shadow | awk -F: \'{print $1}\'',
    'chmod 700 /etc/cron.daily/',
    'netstat -tulpn | grep LISTEN',
    'curl -X POST /api/auth --data @creds.json',
    'tcpdump -i eth0 port 443 -w capture.pcap',
    'openssl rand -hex 32 > session.key',
    'tail -f /var/log/nginx/error.log',
    'find / -perm -4000 -type f 2>/dev/null',
    'base64 -d payload.b64 | bash',
    '[+] Host 192.168.1.1 up (0.0012s latency)',
    '[-] Auth rejected: signature mismatch',
    '[*] Scanning 65535 ports...',
    '[OK] Firewall ruleset applied',
    '[WARN] 47 failed logins from 10.0.0.44',
    'ERROR: EACCES permission denied',
    'HTTP/1.1 200 OK  Content-Type: application/json',
    'JWT: sub=user_42 exp=1750000000 alg=HS256',
    'INSERT INTO scores (user_id, score) VALUES (?,?)',
    'whois 203.0.113.42 | grep OrgName',
    'dig +short TXT _dmarc.example.com',
    'sudo -l | grep "(ALL) NOPASSWD"',
    'HASH sha256:a3f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5',
    'ps aux | grep -E "root|www-data"',
    'diff config.backup config.current',
    'ufw deny from 10.0.0.44 to any',
    './exploit.py --target localhost --port 8080',
  ];
  for(let i=0;i<26;i++){
    const el=document.createElement('span');
    el.className='bgfx-item';
    el.textContent=cmds[i%cmds.length];
    el.style.left=(Math.random()*91)+'%';
    const dur=38+Math.random()*38;
    el.style.animationDuration=dur.toFixed(1)+'s';
    el.style.animationDelay=(-Math.random()*dur).toFixed(1)+'s';
    el.style.opacity=(0.032+Math.random()*0.038).toFixed(3);
    container.appendChild(el);
  }
})();

/* ---------- boot sequence ---------- */
const BOOT_LINES=[
  {c:'LAUNCH & DEFEND v1.0 // KERNEL INIT',s:null,tag:null},
  {c:'LOADING PATH MODULES ...............',s:'bok',tag:'[OK]'},
  {c:'MOUNTING THREAT SIMULATION .........',s:'bok',tag:'[OK]'},
  {c:'VERIFYING USER SESSION .............',s:'bwt',tag:'[WAIT]'},
  {c:'CALIBRATING RISK METRICS ...........',s:'bok',tag:'[OK]'},
  {c:'LOADING DECISION TREE ..............',s:'bok',tag:'[OK]'},
  {c:'ACCESS GRANTED',s:null,tag:null,flicker:true},
];
const BOOT_STEP=230;
const BOOT_MIN=200+BOOT_LINES.length*BOOT_STEP+600;

let _bootDone=false,_bootData=null;
function _finishBoot(){
  if(!_bootDone||!_bootData)return;
  const el=document.getElementById('boot');
  el.classList.add('done');
  setTimeout(()=>{el.style.display='none';},500);
  const[idx,i18n,user]=_bootData;
  PATHS=idx.paths;I18N=i18n;
  LANG=localStorage.getItem('ld.lang')||'th';
  USER=user;
  if(USER){
    if(!USER.school||!USER.age||!USER.referral){UI.screen='questionnaire';render();}
    else toPathSelect();
  }else{UI.screen='login';render();}
}

(function(){
  const log=document.getElementById('bootLog');
  const timer=document.getElementById('bootTimer');
  const t0=Date.now();
  const iv=setInterval(()=>{
    const s=((Date.now()-t0)/1000).toFixed(1);
    timer.textContent='[SYS] '+s+'s ELAPSED';
  },100);
  BOOT_LINES.forEach((l,i)=>{
    const div=document.createElement('div');
    div.className='boot-line';
    const cc=l.flicker?'bgr text-flicker':'bc';
    const tagHtml=l.tag?`<span class="${l.s}">${l.tag}</span>`:'';
    div.innerHTML=`<span class="bp">></span><span class="${cc}">${l.c}</span>${tagHtml}`;
    log.appendChild(div);
    setTimeout(()=>div.classList.add('show'),200+i*BOOT_STEP);
  });
  setTimeout(()=>{clearInterval(iv);_bootDone=true;_finishBoot();},BOOT_MIN);
})();

Promise.all([
  fetch('js/index.json').then(r=>r.json()),
  fetch('js/i18n.json').then(r=>r.json()),
  fetch('/api/me').then(r=>r.ok?r.json():null).catch(()=>null)
]).then(result=>{_bootData=result;_finishBoot();});
