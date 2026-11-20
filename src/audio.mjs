import {bgmTrack} from './audio-config.mjs?v=bgm-live-20261121';
const read=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{}};
let volume=Number(read('acropolis-volume','35'));
if(!Number.isFinite(volume))volume=35;
volume=Math.max(0,Math.min(100,volume));
let muted=read('acropolis-muted','false')==='true',wanted=read('acropolis-bgm','on')!=='off',player,notify=()=>{},request=0;
const subscribers=new Set();
export const masterLevel=()=>muted?0:volume/100;
export const onAudioChange=fn=>subscribers.add(fn);
const speaker=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><g class="speaker-waves"><path d="M16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></g><path class="speaker-cross" d="m17 9 5 6m0-6-5 6"/></svg>`;
export function audioControls(){return `<div class="audio-controls"><button class="speaker-button" type="button" aria-label="전체 소리 음소거" aria-pressed="false" aria-describedby="audio-status">${speaker}</button><div class="volume-popover"><div class="volume-heading"><label for="master-volume">단말 볼륨</label><output id="volume-value" for="master-volume">${volume}%</output></div><input id="master-volume" type="range" min="0" max="100" step="1" value="${volume}" aria-label="단말 전체 볼륨"><div class="volume-footer"><span id="audio-status" role="status">BGM 대기</span><button class="bgm-toggle" type="button">재생</button></div><small>클릭: 음소거 · BGM start / stop</small></div></div>`;}
function sync(){
  if(player){player.volume=volume/100;player.muted=muted;}
  const silent=muted||volume===0;
  document.querySelectorAll('.speaker-button').forEach(b=>{b.classList.toggle('is-muted',silent);b.setAttribute('aria-pressed',String(muted));b.setAttribute('aria-label',muted?'전체 소리 음소거 해제':'전체 소리 음소거');});
  const slider=document.querySelector('#master-volume');if(slider)slider.value=volume;
  const output=document.querySelector('#volume-value');if(output)output.textContent=volume+'%';
  const status=document.querySelector('#audio-status');if(status)status.textContent=!bgmTrack.available?'배경음 등록 대기':muted?'전체 음소거':player?.error?'BGM 연결 오류':player&&!player.paused?'BGM 재생 중':wanted?'BGM 대기':'BGM 정지';
  const toggle=document.querySelector('.bgm-toggle');if(toggle){toggle.textContent=!bgmTrack.available?'등록 대기':player&&!player.paused?'정지':'재생';toggle.disabled=!bgmTrack.available;}
  for(const fn of subscribers)fn(masterLevel());
}
export async function startBgm(explicit=true){
  if(!player)return;if(!bgmTrack.available){notify('배경음 등록 대기 · Suno 음원 다운로드 후 활성화됩니다.');sync();return;}wanted=true;save('acropolis-bgm','on');if(explicit){muted=false;if(volume===0)volume=35;save('acropolis-muted',false);save('acropolis-volume',volume);}sync();const id=++request;
  try{await player.play();if(id===request&&wanted){sync();if(explicit)notify('BGM 재생 · Dormant Terminal');}}
  catch(error){if(id!==request)return;sync();if(explicit)notify(error.name==='NotAllowedError'?'스피커 패널의 재생 버튼을 눌러 배경음을 시작하십시오.':error.name==='AbortError'?'BGM 정지':'배경음을 불러오지 못했습니다. 다시 재생해 주세요.');}
}
export function stopBgm(){wanted=false;request++;save('acropolis-bgm','off');player?.pause();sync();notify('BGM 정지 · BGM start로 다시 재생할 수 있습니다.');}
export function mountAudio(announce){
  notify=announce;
  if(!player){player=document.createElement('audio');player.id='terminal-bgm';if(bgmTrack.available)player.src=bgmTrack.src;player.loop=true;player.preload='none';document.body.append(player);for(const event of ['play','pause','error','loadedmetadata'])player.addEventListener(event,sync);
    document.addEventListener('click',e=>{if(bgmTrack.available&&wanted&&player.paused&&!e.target.closest('.audio-controls,#command-form')&&e.target.closest('button,a'))startBgm(false);},{capture:true});
  }
  const button=document.querySelector('.speaker-button');if(button)button.onclick=()=>{muted=!muted;save('acropolis-muted',muted);sync();if(!muted&&wanted&&player.paused)startBgm(false);};
  const slider=document.querySelector('#master-volume');if(slider)slider.oninput=()=>{volume=Number(slider.value);muted=volume===0;save('acropolis-volume',volume);save('acropolis-muted',muted);sync();};
  const toggle=document.querySelector('.bgm-toggle');if(toggle)toggle.onclick=()=>{if(player.paused)startBgm();else stopBgm();};
  sync();
}
