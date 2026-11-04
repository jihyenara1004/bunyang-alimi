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
function row(it,today){const k=status(it,today);const b=it.applyEnd&&it.applyEnd!==it.applyStart?' ~ '+fmt(it.applyEnd):'';
 return`<li><span class="cy-badge cy-${k.key}">${k.label}</span><b>${E(it.name)}${it.confirmed?'':'<small class="cy-tag">예정</small>'}</b><span class="cy-r">${E(regionOf(it))}</span><span class="cy-d">접수 ${it.applyStart?E(fmt(it.applyStart)+b):'확인 중'}</span><span class="cy-w">발표 ${it.winnerDate?E(fmt(it.winnerDate)):'확인 중'}</span></li>`}
const order=(a,b)=>(parse(a.applyStart)||0)-(parse(b.applyStart)||0);

function pageMode(d,list){
 const today=kst(),items=(d.items||[]).slice();
 const st={region:'전체',type:'전체',period:'upcoming'};
 const upd=document.getElementById('cy-updated');if(upd)upd.textContent=d.updated?`마지막 수정 ${d.updated.replace(/-/g,'.')} · 최종 일정은 청약홈 공고로 확인해 주세요`:'청약일정 준비 중';
 const side=document.getElementById('cy-alert-side');if(side)side.innerHTML=kakao(d,'카카오톡 채널 추가<br>신규 분양현장 소식 보기');
 const count=document.getElementById('cy-count');
 const search=document.getElementById('cy-search');
 const normalizeName=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 search?.addEventListener('input',draw);
 function match(it){const s=status(it,today).key;
  if(st.region!=='전체'&&regionOf(it)!==st.region)return false;
  if(st.type!=='전체'&&it.type!==st.type)return false;
  if(st.period==='upcoming')return s!=='done';
  if(st.period==='done')return s==='done';
  if(st.period==='wait')return s==='wait';
  const[f,t]=weekRange(today,st.period==='next'?1:0);return overlap(it,f,t)}
 // 처음엔 6건만, 오른쪽 "전체보기"를 누르면 전체 목록
 const SHOW=6,allBtn=document.getElementById('cy-all');
 let expanded=new URLSearchParams(window.location.search).get('view')==='all';
 if(allBtn)allBtn.addEventListener('click',()=>{expanded=!expanded;draw();if(!expanded)list.scrollIntoView({block:'nearest'})});
 function draw(){
  const query=normalizeName(search?.value);
  const all=items.filter(it=>match(it)&&(!query||(['open','soon'].includes(status(it,today).key)&&normalizeName(it.name).includes(query)))).sort(query?(a,b)=>Number(status(b,today).key==='open')-Number(status(a,today).key==='open')||order(a,b):st.period==='done'?(a,b)=>order(b,a):order);
  const rows=expanded||query?all:all.slice(0,SHOW);
  count.textContent=all.length?(all.length>SHOW&&!expanded&&!query?`${all.length}건 중 ${SHOW}건`:`${all.length}건`):'';
  if(allBtn){allBtn.hidden=!expanded&&all.length<=SHOW;allBtn.textContent=expanded?'접기':'전체보기';allBtn.setAttribute('aria-expanded',String(expanded))}
  list.innerHTML=rows.length?`<ul class="cy-home-list cy-full-list">${rows.map(it=>row(it,today)).join('')}</ul>`:`<p class="cy-empty">${items.length?'조건에 맞는 일정이 없습니다.':'청약 일정을 준비하고 있습니다. 최신 공고는 <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer">청약홈</a>에서 먼저 확인해 주세요.'}</p>`}
 document.querySelectorAll('[data-cy-filter]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;st[g.dataset.cyFilter]=b.dataset.v;g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()}));
 draw();
 renderMine();
}

// 하단 "지금 계약 가능한 추천 분양현장" 카드 (추천 순서 pinned 기준 3곳)
function renderMine(){const mine=document.getElementById('cy-mine');
 if(mine&&window.PORTAL_PROPERTIES){const P=window.PORTAL_PROPERTIES.slice().sort((a,b)=>(a.pinned||99)-(b.pinned||99)).slice(0,3);
  mine.innerHTML=P.map(p=>`<a class="cy-site" href="/${E(p.id)}/"><b>${E(p.name)}</b><span>${E([p.area,p.type].filter(Boolean).join(' · '))}</span>${p.tag?`<em>${E(p.tag)}</em>`:''}</a>`).join('')}}

// 청약 가점 계산기 단독 페이지 (/cheongyak/calculator/)
function calcMode(d,form){
 const box=document.getElementById('cy-alert-btn');if(box)box.innerHTML=kakao(d,'내 점수에 맞는 단지 소식 카카오톡으로 받기');
 renderMine();initCalc(form)}

// 가점 계산 (단독 페이지와 청약일정 페이지 공용): 입력값은 화면 안에서만 계산, 저장·전송 없음
function initCalc(form){
 const parts=[['home',32],['family',35],['account',17]];
 function draw(){let total=0;for(const[k,max]of parts){const v=+document.getElementById('cc-'+k).value;total+=v;document.getElementById('cc-bar-'+k).style.width=(v/max*100)+'%';document.getElementById('cc-v-'+k).textContent=`${v} / ${max}점`}
  document.getElementById('cc-total').textContent=total;
  document.getElementById('cc-msg').textContent=total>=60?'가점제 경쟁에 도전해 볼 만한 점수예요. 인기 단지는 단지·면적마다 당첨선이 다르니 지난 당첨 가점을 함께 확인하세요.':total>=40?'중간 점수예요. 추첨제 물량과 특별공급 자격을 함께 확인하면 기회가 넓어져요.':'가점제만으로는 쉽지 않은 점수예요. 특별공급·추첨제·무순위, 그리고 청약통장 없이 계약할 수 있는 선착순 현장을 함께 보세요.'}
 form.addEventListener('change',draw);draw()}

const list=document.getElementById('cy-list'),calc=document.getElementById('cc-form');

function homeMode(d){
 const after=document.getElementById('featured'),today=kst();if(!after)return;
 // 홈에는 6곳만 보이고, "전체보기"는 청약일정 전체 페이지(/cheongyak/)로 이동. 그 아래에 청약 가점 계산 코너.
 const SHOW=6;
 const all=(d.items||[]).filter(it=>['soon','open','wait'].includes(status(it,today).key)).sort(order);
 if(!all.length)return;
 const homeRow=it=>{const k=status(it,today);return`<li><span class="cy-badge cy-${k.key}">${k.label}</span><b>${E(it.name)}</b><span>${E(regionOf(it))}</span><span>${E(fmt(it.applyStart))}${it.applyEnd&&it.applyEnd!==it.applyStart?' ~ '+E(fmt(it.applyEnd)):''}</span></li>`};
 const rows=all.slice(0,SHOW);
 const s=document.createElement('section');s.id='cy-home';s.className='section cy-home';
 s.innerHTML=`<div class="section-heading"><div><h2><span class="cy-sq" aria-hidden="true">■</span> 이번 주 청약일정</h2><p class="muted">최종 일정은 청약홈 공고로 확인해 주세요.</p></div><a href="/cheongyak/?view=all" class="all-sites">전체보기</a></div><label class="listing-search cy-home-search" for="cy-home-search">단지 이름으로 검색<input id="cy-home-search" type="search" placeholder="예: 운정, 고덕" autocomplete="off"></label><div class="cy-group cy-home-regions" role="group" aria-label="지역"><span>지역</span><button type="button" data-cy-region="전체" aria-pressed="true">전체</button><button type="button" data-cy-region="서울" aria-pressed="false">서울</button><button type="button" data-cy-region="경기" aria-pressed="false">경기</button><button type="button" data-cy-region="인천" aria-pressed="false">인천</button><button type="button" data-cy-region="기타" aria-pressed="false">그 외</button></div><div class="cy-home-body"><ul class="cy-home-list" id="cy-home-list">${rows.map(homeRow).join('')}</ul><div class="cy-home-alert">${kakao(d,'카카오톡 채널 추가<br>신규 분양현장 소식 보기')}</div></div>`;
 after.insertAdjacentElement('afterend',s);
 // 이름으로 검색: 입력하면 6곳 제한 없이 일치하는 일정을 모두 표시, 지우면 처음 6곳
 const hs=s.querySelector('#cy-home-search'),hl=s.querySelector('#cy-home-list');
 const norm=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const sg=document.createElement('ul');sg.className='search-suggestions';sg.setAttribute('role','listbox');sg.setAttribute('aria-label','추천 청약 단지');sg.hidden=true;hs.after(sg);
 let choosing=false;
 // 지역 버튼(청약일정 페이지와 같은 모양): 전체 · 서울 · 경기 · 인천 · 그 외
 let reg='전체';
 const inReg=it=>reg==='전체'||regionOf(it)===reg;
 s.querySelectorAll('[data-cy-region]').forEach(b=>b.addEventListener('click',()=>{reg=b.dataset.cyRegion;s.querySelectorAll('[data-cy-region]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));sg.hidden=true;apply()}));
 const apply=()=>{const q=norm(hs.value);const found=q?all.filter(it=>inReg(it)&&(norm(it.name).includes(q)||norm(regionOf(it)).includes(q))):(reg!=='전체'?all.filter(inReg).slice(0,SHOW):rows);hl.innerHTML=found.length?found.map(homeRow).join(''):'<li class="cy-empty">일치하는 일정이 없습니다.</li>';return found};
 const suggest=()=>{if(choosing)return;const found=apply();sg.replaceChildren();const q=norm(hs.value);if(!q){sg.hidden=true;return}
  for(const it of found.slice(0,8)){const li=document.createElement('li');li.setAttribute('role','option');li.textContent=it.name;const sm=document.createElement('small');sm.textContent=regionOf(it);li.append(sm);
   li.addEventListener('mousedown',e=>e.preventDefault());
   li.addEventListener('click',e=>{e.preventDefault();choosing=true;setTimeout(()=>{choosing=false},400);hs.value=it.name;sg.hidden=true;apply();hs.blur()});sg.append(li)}
  sg.hidden=!sg.children.length};
 hs.addEventListener('input',suggest);hs.addEventListener('focus',suggest);
 hs.addEventListener('keydown',e=>{if(e.key==='Escape')sg.hidden=true});
 hs.addEventListener('blur',()=>setTimeout(()=>{sg.hidden=true},150));
 document.addEventListener('click',e=>{if(!s.querySelector('.cy-home-search').contains(e.target))sg.hidden=true});
}

fetch('/outputs/portal/cheongyak-data.json',{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject()).catch(()=>({items:[]})).then(d=>{if(list){
  pageMode(d,list);
  if(calc)initCalc(calc);
  if(location.hash==='#calc'){
   const section=document.getElementById('calc');
   const header=document.querySelector('.portal-header');
   if(section)requestAnimationFrame(()=>{
    if(location.hash!=='#calc')return;
    section.style.scrollMarginTop=(header?.getBoundingClientRect().height+16 || 20)+'px';
    section.scrollIntoView({block:'start'});
   });
  }
 }else if(calc)calcMode(d,calc);else homeMode(d)});
})();
