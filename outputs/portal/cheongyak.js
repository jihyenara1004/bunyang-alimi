// 청약일정: /cheongyak/ 페이지(#cy-list)와 홈 요약 칸(#picks 뒤)을 같은 데이터(cheongyak-data.json)로 그림.
// 데이터 칸: name, region(서울·경기·인천·기타), type(아파트·오피스텔·무순위), address, units, applyStart, applyEnd, winnerDate(YYYY-MM-DD),
//            confirmed(true=청약홈 공고 확인), rate(경쟁률 글자), source(청약홈 공고 주소), note
(function(){
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WD=['일','월','화','수','목','금','토'],DAY=864e5;
const kst=()=>{const d=new Date(Date.now()+9*3600e3);return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()))};
const parse=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(Date.UTC(+m[1],+m[2]-1,+m[3])):null};
const fmt=s=>{const d=parse(s);return d?String(d.getUTCMonth()+1).padStart(2,'0')+'.'+String(d.getUTCDate()).padStart(2,'0')+'('+WD[d.getUTCDay()]+')':''};
const safeUrl=u=>/^https:\/\//.test(u||'')?u:'';
function status(it,today){const a=parse(it.applyStart),b=parse(it.applyEnd||it.applyStart),w=parse(it.winnerDate);
 if(!a)return{key:'ready',label:'일정 확인 중'};
 if(today<a)return{key:'soon',label:'접수예정'};
 if(today<=b)return{key:'open',label:'접수중'};
 if(w&&today>w)return{key:'done',label:'발표완료'};
 return{key:'wait',label:w&&+today===+w?'오늘 발표':'접수마감'}}
const regionOf=it=>['서울','경기','인천'].includes(it.region)?it.region:'기타';
const overlap=(it,from,to)=>{const a=parse(it.applyStart),b=parse(it.applyEnd||it.applyStart);return !!a&&a<=to&&b>=from};
function weekRange(today,offset){const mon=new Date(+today-((today.getUTCDay()+6)%7)*DAY+offset*7*DAY);return[mon,new Date(+mon+6*DAY)]}
const KAKAO_ICON=`<svg class="cy-kakao-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.86 5.35 4.67 6.77-.2.75-.74 2.7-.85 3.12-.13.52.19.51.4.37.17-.11 2.62-1.78 3.68-2.5.69.1 1.39.15 2.1.15 5.52 0 10-3.58 10-8S17.52 3 12 3z"/></svg>`;
function kakao(d,label){const u=safeUrl(d.kakaoUrl);return u?`<a class="cy-kakao" href="${E(u)}" target="_blank" rel="noopener">${KAKAO_ICON}<span>${label}</span></a>`:`<span class="cy-kakao is-off">카카오톡 채널 준비 중</span>`}
const dates=it=>{const pr=it.price?`<div><dt>분양가</dt><dd>${E(it.price)}</dd></div>`:"";const a=fmt(it.applyStart),b=it.applyEnd&&it.applyEnd!==it.applyStart?' ~ '+fmt(it.applyEnd):'';return pr+`<div><dt>접수</dt><dd>${a?E(a+b):'확인 중'}</dd></div><div><dt>당첨발표</dt><dd>${it.winnerDate?E(fmt(it.winnerDate)):'확인 중'}</dd></div>`};
function card(it,today,d){const s=status(it,today);const src=safeUrl(it.source);
 return`<article class="cy-card cy-${s.key}"><div class="cy-top"><span class="cy-badge">${s.label}</span><span class="cy-confirm ${it.confirmed?'yes':'no'}">${it.confirmed?'공고 확인':'예정'}</span></div><h3>${E(it.name)}</h3><p class="cy-meta">${E([regionOf(it),it.type,it.units?it.units+(/^\d+$/.test(String(it.units))?'세대':''):''].filter(Boolean).join(' · '))}${it.address?'<br>'+E(it.address):''}</p><dl class="cy-dates">${dates(it)}${it.rate?`<div><dt>경쟁률</dt><dd>${E(it.rate)} <small>청약홈 기준 · 변동 가능</small></dd></div>`:''}</dl>${it.note?`<p class="cy-note">${E(it.note)}</p>`:''}${it.updated?`<p class="cy-upd">최종 수정 ${E(it.updated.replace(/-/g,'.'))}</p>`:''}${safeUrl(d&&d.kakaoUrl)?`<a class="cy-kakao cy-card-kakao" href="${E(d.kakaoUrl)}" target="_blank" rel="noopener">${KAKAO_ICON}<span>이 단지 청약·당첨발표 소식 받기</span></a>`:''}${src?`<a class="cy-src" href="${E(src)}" target="_blank" rel="noopener noreferrer">출처: 청약홈 공고</a>`:''}</article>`}
const order=(a,b)=>(parse(a.applyStart)||0)-(parse(b.applyStart)||0);

function pageMode(d,list){
 const today=kst(),items=(d.items||[]).slice();
 const st={region:'전체',type:'전체',period:'upcoming'};
 const upd=document.getElementById('cy-updated');if(upd)upd.textContent=d.updated?`마지막 수정 ${d.updated.replace(/-/g,'.')} · 최종 일정은 청약홈 공고로 확인해 주세요`:'청약일정 준비 중';
 const box=document.getElementById('cy-alert-btn');if(box)box.innerHTML=kakao(d,'청약일정·당첨발표 카카오톡으로 알림받기');
 const count=document.getElementById('cy-count');
 function match(it){const s=status(it,today).key;
  if(st.region!=='전체'&&regionOf(it)!==st.region)return false;
  if(st.type!=='전체'&&it.type!==st.type)return false;
  if(st.period==='upcoming')return s!=='done';
  if(st.period==='done')return s==='done';
  if(st.period==='wait')return s==='wait';
  const[f,t]=weekRange(today,st.period==='next'?1:0);return overlap(it,f,t)}
 function draw(){const rows=items.filter(match).sort(st.period==='done'?(a,b)=>order(b,a):order);
  count.textContent=rows.length?`${rows.length}건`:'';
  list.innerHTML=rows.length?rows.map(it=>card(it,today,d)).join(''):`<p class="cy-empty">${items.length?'조건에 맞는 일정이 없습니다.':'청약 일정을 준비하고 있습니다. 최신 공고는 <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer">청약홈</a>에서 먼저 확인해 주세요.'}</p>`}
 document.querySelectorAll('[data-cy-filter]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;st[g.dataset.cyFilter]=b.dataset.v;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()}));
 draw();
 const mine=document.getElementById('cy-mine');
 if(mine&&window.PORTAL_PROPERTIES){const P=window.PORTAL_PROPERTIES.slice().sort((a,b)=>(a.pinned||99)-(b.pinned||99)).slice(0,3);
  mine.innerHTML=P.map(p=>`<a class="cy-site" href="/${E(p.id)}/"><b>${E(p.name)}</b><span>${E([p.area,p.type].filter(Boolean).join(' · '))}</span>${p.tag?`<em>${E(p.tag)}</em>`:''}</a>`).join('')}}

function homeMode(d){
 const after=document.getElementById('featured'),today=kst();if(!after)return;
 const rows=(d.items||[]).filter(it=>['soon','open','wait'].includes(status(it,today).key)).sort(order).slice(0,4);
 if(!rows.length)return;
 const s=document.createElement('section');s.id='cy-home';s.className='section cy-home';
 s.innerHTML=`<div class="section-heading"><div><h2>이번 주 청약일정</h2><p class="muted">최종 일정은 청약홈 공고로 확인해 주세요.</p></div><a href="/cheongyak/" class="all-sites">전체 일정 보기</a></div><div class="cy-home-body"><ul class="cy-home-list">${rows.map(it=>{const k=status(it,today);return`<li><span class="cy-badge cy-${k.key}">${k.label}</span><b>${E(it.name)}</b><span>${E(regionOf(it))}</span><span>${E(fmt(it.applyStart))}${it.applyEnd&&it.applyEnd!==it.applyStart?' ~ '+E(fmt(it.applyEnd)):''}</span></li>`}).join('')}</ul><div class="cy-home-alert">${kakao(d,'청약일정·당첨발표<br>카카오톡으로 알림받기')}</div></div>`;
 after.insertAdjacentElement('afterend',s)}

const list=document.getElementById('cy-list');
fetch('/outputs/portal/cheongyak-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).catch(()=>({items:[]})).then(d=>{list?pageMode(d,list):homeMode(d)});
})();
