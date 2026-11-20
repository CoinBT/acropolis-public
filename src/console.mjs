import {mountAudio,startBgm,stopBgm,masterLevel,onAudioChange} from './audio.mjs?v=bgm-live-20261121';
const destinations={HOME:'/',ARCHIVE:'/archive',START:'/start',FLOORS:'/floors',COMPANIES:'/factions',LIFE:'/life',STREET:'/street-life',TIMELINE:'/timeline',GLOSSARY:'/glossary',CLASSIFIED:'/classified'};
export function parseCommand(raw){
  const [word='',...rest]=raw.trim().split(/\s+/);const verb=word.toUpperCase(),arg=rest.join(' ');
  if(destinations[verb]&&!arg)return {type:'route',path:destinations[verb]};
  if(verb==='OPEN'&&/^\d{1,2}$/.test(arg)&&+arg>=1&&+arg<=40)return {type:'route',path:'/archive/'+arg.padStart(2,'0')};
  if(verb==='COMPANY'&&['atrox','monotrix-arms','cherno-orbital','omega-paradigm','arirang','sakura-rain','omega-gol','body-buddy','obox'].includes(arg.toLowerCase()))return {type:'route',path:'/companies/'+arg.toLowerCase()};
  if(verb==='BGM'&&/^(start|stop)$/i.test(arg))return {type:'bgm',action:arg.toLowerCase()};
  if(verb==='SEARCH'&&arg)return {type:'search',query:arg};
  if(['HELP','LOCK','UNLOCK','REBOOT','CLEAR'].includes(verb)&&!arg)return {type:verb.toLowerCase()};
  return {type:'error'};
}
let host,context,lastState='',history=[],cursor=0,events=[],audioContext,bootTimer,bootFocus;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const get=(k,f)=>{try{return localStorage.getItem(k)??f;}catch{return f;}};
const save=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
let fx=get('acropolis-fx','on')==='on',sound=get('acropolis-sound','on')==='on';
const q=s=>host.querySelector(s);
function announce(message){q('#command-status').textContent=message;}
function log(message){events.unshift({time:new Date().toLocaleTimeString('en-GB'),message});events=events.slice(0,5);paintLog();}
function paintLog(){const el=document.querySelector('#session-events');if(!el)return;el.replaceChildren(...events.map(e=>{const li=document.createElement('li');const time=document.createElement('time');time.textContent=e.time;li.append(time,document.createTextNode(e.message));return li;}));}
function applyEffects(){document.documentElement.classList.toggle('terminal-fx',fx&&!reduced());q('[data-console="fx"]').setAttribute('aria-pressed',String(fx));q('[data-console="fx"]').textContent=fx?'효과 ON':'효과 OFF';}
const voices=new Set();
let signalMaster;
onAudioChange(level=>{if(signalMaster&&audioContext)signalMaster.gain.setTargetAtTime(level,audioContext.currentTime,.02);});
export function stopSignals(){for(const o of voices){try{o.stop();}catch{}}voices.clear();}
export function playSignal(kind='tap'){
  if(!sound)return;
  const patterns={tap:[[680,0,.045],[920,.045,.045]],warning:[[220,0,.16],[330,.2,.18]],access:[[440,0,.08],[660,.11,.08],[880,.22,.16]],scan:[[130,0,.35],[260,.35,.12],[390,.55,.12],[520,.8,.12],[650,1.05,.12],[780,1.3,.12],[910,1.55,.16]],ready:[[523,0,.16],[659,.13,.16],[784,.26,.28]],cancel:[[330,0,.1],[180,.1,.18]]};
  try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});const now=audioContext.currentTime;if(!signalMaster){signalMaster=audioContext.createGain();signalMaster.gain.value=masterLevel();signalMaster.connect(audioContext.destination);}
    for(const [hz,delay,duration] of patterns[kind]||patterns.tap){const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=kind==='scan'?'triangle':'sine';o.frequency.setValueAtTime(hz,now+delay);if(kind==='scan')o.frequency.exponentialRampToValueAtTime(hz*1.45,now+delay+duration);g.gain.setValueAtTime(0,now+delay);g.gain.linearRampToValueAtTime(kind==='tap'?.035:.065,now+delay+.009);g.gain.exponentialRampToValueAtTime(.0001,now+delay+duration);o.connect(g);g.connect(signalMaster);voices.add(o);o.onended=()=>{voices.delete(o);o.disconnect();g.disconnect();};o.start(now+delay);o.stop(now+delay+duration+.02);}
  }catch{sound=false;if(host){q('[data-console="sound"]').textContent='소리 OFF';q('[data-console="sound"]').setAttribute('aria-pressed','false');announce('조작음을 사용할 수 없습니다.');}}
}
function beep(){playSignal('tap');}
function boot(){
  const d=q('#boot-screen');if(d.open)return;bootFocus=document.activeElement;d.showModal();q('#boot-lines').textContent='> LOCAL STORAGE · 기록 색인 연결';q('#boot-progress').value=1;
  const lines=['> DISPLAY · 출력 패널 준비','> ARCHIVE · 40개 기록 확인','> USER · 등록 정보 없음','> PUBLIC CHANNEL · 열람 준비 완료'];let n=0;clearInterval(bootTimer);
  if(reduced()||!fx){q('#boot-lines').textContent='> PUBLIC CHANNEL · 열람 준비 완료';q('#boot-progress').value=5;return;}
  bootTimer=setInterval(()=>{q('#boot-lines').textContent+='\n'+lines[n++];q('#boot-progress').value=n+1;if(n===lines.length)clearInterval(bootTimer);},350);
}
function closeBoot(){playSignal('ready');clearInterval(bootTimer);q('#boot-screen').close();try{sessionStorage.setItem('acropolis-console-boot','yes');}catch{}log('출력 패널 준비 완료');if(bootFocus?.isConnected)bootFocus.focus();else document.querySelector('#main')?.focus({preventScroll:true});}
function run(raw){const c=parseCommand(raw);if(c.type==='error'){announce('알 수 없는 명령입니다. HELP로 명령 목록을 확인하십시오.');return;}beep();
  if(c.type==='bgm'){if(c.action==='start')startBgm();else stopBgm();}
  if(c.type==='route'){location.hash=c.path;announce('기록 경로 호출: '+c.path);}
  if(c.type==='search'){context.search(c.query);announce('검색 요청을 처리했습니다.');}
  if(c.type==='help')q('#console-help').showModal();
  if(c.type==='lock'){context.lock();announce('제한 기록을 잠갔습니다.');}
  if(c.type==='unlock'){context.unlock();announce('열람 확인 절차를 시작합니다.');}
  if(c.type==='reboot'){context.lock();boot();}
  if(c.type==='clear'){history=[];cursor=0;events=[];paintLog();announce('명령 기록을 지웠습니다.');}
}
function init(){host=document.createElement('div');host.id='terminal-hardware';host.innerHTML=`
  <div class="screen-bezel" aria-hidden="true"></div><div class="screen-texture" aria-hidden="true"></div>
  <header class="hardware-bar"><span class="hardware-id"><i></i> ACROPOLIS <b>INFORMATION TERMINAL</b></span><span class="hardware-user">USER / UNREGISTERED</span><span id="hardware-clock" aria-label="기기 시각"></span></header>
  <div class="console-dock"><div class="console-status"><span id="console-path">/</span><span id="console-access">PUBLIC ACCESS</span><span class="console-controls"><button data-console="fx" aria-pressed="true">효과 ON</button><button data-console="sound" aria-pressed="${sound}">${sound?'소리 ON':'소리 OFF'}</button><button data-console="fullscreen">전체 화면</button><button data-console="help">명령 도움말</button></span></div><form id="command-form"><label for="terminal-command">CIVIC:~<span>$</span></label><input id="terminal-command" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="HELP · OPEN 05 · SEARCH 앵커" aria-label="단말 명령 입력" aria-describedby="command-status"><button type="submit" aria-label="명령 실행">실행 ↵</button></form><p id="command-status" role="status">명령을 입력하거나 메뉴에서 조회 항목을 선택하십시오.</p></div>
  <dialog id="boot-screen" aria-labelledby="boot-heading"><div class="boot-emblem" aria-hidden="true">◎</div><span class="eyebrow">CIVIC ARCHIVE / LOCAL INITIALIZATION</span><h2 id="boot-heading">단말 초기화</h2><pre id="boot-lines"></pre><progress id="boot-progress" max="5" value="1" aria-label="출력 준비"></progress><p>사용자 식별 정보가 없습니다. 공개 열람 모드로 접속합니다.</p><button data-console="boot-close" class="primary">단말 접속 · 건너뛰기 ↵</button></dialog>
  <dialog id="console-help" aria-labelledby="help-heading"><div class="dialog-head"><h2 id="help-heading">명령어 참조</h2><button data-console="help-close" aria-label="도움말 닫기">✕</button></div><dl class="command-reference"><dt>OPEN 01 … 40</dt><dd>번호로 기록 열기</dd><dt>SEARCH 앵커</dt><dd>열람 가능한 기록 검색</dd><dt>COMPANY arirang</dt><dd>기업 식별자로 조회</dd><dt>HOME / ARCHIVE / FLOORS</dt><dd>홈 / 전체 기록 / 층별 탐색</dd><dt>START / COMPANIES / LIFE</dt><dd>정착 / 기업 / 시민 생활</dd><dt>STREET / TIMELINE / GLOSSARY</dt><dd>도시의 그늘 / 연대기 / 용어</dd><dt>CLASSIFIED / UNLOCK / LOCK</dt><dd>기밀 목록 / 열람 절차 / 재잠금</dd><dt>BGM start / BGM stop</dt><dd>배경음 재생 / 정지</dd><dt>REBOOT / CLEAR</dt><dd>재잠금 및 초기화 연출 / 입력 기록 지우기</dd></dl><p>↑ ↓ 이전 명령 · Alt+K 명령창 · / 기록 검색</p><p class="muted">기록 조회와 단말의 재생 상태를 제어합니다.</p></dialog>`;document.body.append(host);
  q('#command-form').addEventListener('submit',e=>{e.preventDefault();const input=q('#terminal-command'),raw=input.value.trim();if(!raw)return;history.push(raw);if(history.length>30)history.shift();cursor=history.length;input.value='';run(raw);});
  q('#terminal-command').addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();cursor=Math.max(0,Math.min(history.length,cursor+(e.key==='ArrowUp'?-1:1)));e.target.value=history[cursor]||'';}});
  host.addEventListener('click',async e=>{const action=e.target.closest('[data-console]')?.dataset.console;if(!action)return;if(action==='fx'){fx=!fx;save('acropolis-fx',fx?'on':'off');applyEffects();}if(action==='sound'){sound=!sound;save('acropolis-sound',sound?'on':'off');if(!sound)stopSignals();q('[data-console="sound"]').textContent=sound?'소리 ON':'소리 OFF';q('[data-console="sound"]').setAttribute('aria-pressed',String(sound));beep();}if(action==='help')q('#console-help').showModal();if(action==='help-close')q('#console-help').close();if(action==='boot-close')closeBoot();if(action==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{announce('이 환경에서는 전체 화면을 지원하지 않습니다.');}}});
  q('#boot-screen').addEventListener('close',()=>{clearInterval(bootTimer);try{sessionStorage.setItem('acropolis-console-boot','yes');}catch{}});
  document.addEventListener('keydown',e=>{if(e.altKey&&e.key.toLowerCase()==='k'&&!document.querySelector('dialog[open]')){e.preventDefault();q('#terminal-command').focus();}});
  document.addEventListener('click',e=>{if(e.target.closest('a,button')&&!e.target.closest('#terminal-hardware')&&!e.target.closest('[data-action=mode],[data-action=second-warning],[data-action=unlock],[data-action=cancel-hack],[data-feed]'))beep();});
  document.addEventListener('fullscreenchange',()=>q('[data-console="fullscreen"]').textContent=document.fullscreenElement?'화면 복귀':'전체 화면');
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',applyEffects);
  const clock=()=>q('#hardware-clock').textContent=new Date().toLocaleTimeString('en-GB');clock();setInterval(clock,1000);applyEffects();
  let seen=false;try{seen=!!sessionStorage.getItem('acropolis-console-boot');}catch{}if(!seen)boot();
}
export function mountConsole(options){context=options;if(!host)init();mountAudio(announce);q('#console-path').textContent='LOCAL:'+options.route;q('#console-access').textContent=options.unlocked?'RESTRICTED / OPEN':'PUBLIC / READ ONLY';const state=options.route+'|'+options.unlocked;if(lastState!==state){log(options.route+' · '+(options.unlocked?'제한 기록 열림':'공개 열람'));lastState=state;}paintLog();
  document.querySelectorAll('[data-feed]').forEach(b=>b.onclick=()=>{const feeds={city:['acropolis-hero-city.webp','도시 생활권'],street:['street-low-income-housing.webp','저소득 주거 구역'],workshop:['street-small-workshop.webp','소규모 작업장']};const [file,label]=feeds[b.dataset.feed];const img=document.querySelector('#monitor-image');img.src='./assets/'+file;img.alt=label+' 참고 도판';document.querySelector('#monitor-label').textContent=label+' / 참고 도판';document.querySelectorAll('[data-feed]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));log('도판 조회 · '+label);beep();});
  document.querySelector('[data-command-focus]')?.addEventListener('click',()=>q('#terminal-command').focus());
}
