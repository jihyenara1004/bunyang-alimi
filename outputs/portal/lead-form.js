(function(){const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const awaitingApproval=false;const endpoint='https://hook.eu1.make.com/p78rn0bgk2ntskkyku8vcekqrps82pgd';const privacy=`<details class="privacy-details"><summary>개인정보 수집·이용 안내</summary><p>수집·이용 주체: 태양D&amp;C (사업자등록번호 102-16-51882 · 문의 1688-5650)<br>수집 항목: 관심 현장명, 이름, 연락처<br>이용 목적: 선택한 현장의 분양 상담 및 접수 안내<br>보유·이용기간: 상담 목적 달성 시까지 (접수일로부터 최대 1년), 동의 철회 요청 시 지체 없이 파기<br>접수 알림 전송: 자동화 서비스(Make)와 카카오 알림톡 발송 서비스(SOLAPI)를 이용해 담당자에게 전달됩니다.<br>동의를 거부하실 수 있으며, 거부 시 온라인 접수가 제한됩니다. 전화 상담(1688-5650)은 이용하실 수 있습니다.</p></details><label class="check lead-consent"><input type="checkbox" name="consent" required> 개인정보 수집·이용에 동의합니다. (필수)</label>`;function form(p){return `<form class="gd-interest-form" data-lead-property="${E(p.id)}"><label>현장명<input name="propertyName" value="${E(p.name)}" readonly></label><div class="gd-fields"><label>이름 <span>*</span><input name="name" autocomplete="name" placeholder="성함을 입력해 주세요" maxlength="30" required></label><label>연락처 <span>*</span><input name="phone" type="tel" autocomplete="tel" placeholder="010-0000-0000" maxlength="20" required></label></div>${privacy}<button type="submit">관심고객등록</button><p role="status" aria-live="polite" class="gd-form-status">${awaitingApproval?'온라인 접수 시험 운영 중 · 상담 1688-5650':''}</p></form>`}const prev=window.renderProperty;window.renderProperty=function(p,opts={}){return prev(p,opts).replace(/<form class="gd-interest-form">[\s\S]*?<\/form>/,form(p))};const main=document.getElementById('registration');if(main){const field=main.querySelector('[name=message]');if(field)field.closest('label').remove();const select=main.querySelector('[name=property]');if(select){select.required=true;select.closest('label').firstChild.textContent='현장명 ';}const d=main.querySelector('.privacy-details');if(d)d.outerHTML=privacy;const old=main.querySelectorAll('.check');if(old.length>1)old[old.length-1].remove();const note=main.querySelector('.contact-note');if(note)note.textContent=awaitingApproval?'온라인 접수 시험 운영 중 · 상담 1688-5650':'접수 후 담당자가 확인하여 연락드립니다 · 상담 1688-5650';const intro=document.querySelector('.registration-heading>p:last-child');if(intro)intro.textContent='현장을 선택하고 성함과 연락처를 남겨주세요.';}

// 광고 링크로 유입된 GD메트로 문의만 구분하며, 같은 탭에서는 새로고침 후에도 유지한다.
const gdAttributionKey='bunyang-alimi:gdmetro:demandgen';
let gdDemandGen=false;
try{
 const params=new URLSearchParams(window.location.search);
 const campaign=params.get('utm_campaign');
 const hasAttribution=['utm_source','utm_medium','utm_campaign'].some(key=>params.has(key));
 if(hasAttribution){
  gdDemandGen=params.get('utm_source')==='google'&&params.get('utm_medium')==='cpc'&&campaign==='gdmetro_demandgen';
  try{if(gdDemandGen)window.sessionStorage.setItem(gdAttributionKey,'1');else window.sessionStorage.removeItem(gdAttributionKey);}catch{}
 }else{try{gdDemandGen=window.sessionStorage.getItem(gdAttributionKey)==='1';}catch{}}
}catch{}
const leadSource=id=>id==='gdmetro'&&gdDemandGen?'구글 디맨드젠 광고':'분양알리미 홈페이지';

const sending=new WeakSet();document.addEventListener('submit',async e=>{const f=e.target;if(!f.matches('.gd-interest-form,#registration'))return;e.preventDefault();e.stopImmediatePropagation();if(sending.has(f)||!f.reportValidity())return;const status=f.querySelector('[role=status]');const set=s=>{if(status)status.textContent=s};const field=n=>f.querySelector('[name="'+n+'"]');let propertyName=field('propertyName')?.value||'';const id=f.dataset.leadProperty||field('property')?.value;const p=(window.PORTAL_PROPERTIES||[]).find(x=>x.id===id);if(p)propertyName=p.name;if(!propertyName){set('현장명을 선택해 주세요.');return}const name=(field('name')?.value||'').trim(),phone=(field('phone')?.value||'').replace(/[^0-9]/g,'');if(!name||name.length>30){set('성함을 입력해 주세요.');return}if(!/^0[0-9]{8,10}$/.test(phone)){set('연락처를 확인해 주세요. 예: 010-0000-0000');field('phone')?.focus();return}if(!field('consent')?.checked){set('개인정보 수집·이용에 동의해 주세요.');return}const button=f.querySelector('button[type=submit]');sending.add(f);button.disabled=true;button.textContent='전송 중…';set('접수 요청을 전송하고 있습니다.');try{const response=await fetch(endpoint,{method:'POST',body:new URLSearchParams({propertyName,name,phone,submittedAt:new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}),source:leadSource(id)}),signal:AbortSignal.timeout(20000),credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('http');if(id==='gdmetro'&&typeof window.gtag==='function'){try{window.gtag('event','conversion',{send_to:'AW-11126873407/p82-CNym67MdEL-62rkp'});}catch(trackingError){/* 접수 성공은 측정 오류와 무관하게 유지 */}}set(awaitingApproval?'접수 요청이 전송되었습니다. 현재 온라인 접수는 시험 운영 중입니다.':'접수 요청이 전송되었습니다. 확인 후 연락드리겠습니다. 급한 문의는 1688-5650으로 연락 주세요.');f.reset();if(field('propertyName'))field('propertyName').value=propertyName;}catch{set('전송 결과를 확인하지 못했습니다. 반복 등록하기 전에 1688-5650으로 문의해 주세요.');}finally{sending.delete(f);button.disabled=false;button.textContent='관심고객등록';}},true);

// 개별 현장의 문의 버튼은 해당 페이지의 관심고객 접수로 연결한다.
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-register]');
 if(!button||!document.body.classList.contains('standalone-property'))return;
 const form=document.querySelector('.gd-interest-form[data-lead-property]');
 const section=form?.closest('[id]');
 if(!section)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 if(typeof window.gdScrollToSection==='function')window.gdScrollToSection(section);
 else section.scrollIntoView({behavior:'smooth',block:'start'});
},true);

const viewport=window.visualViewport;
if(viewport&&matchMedia('(max-width: 760px), (pointer: coarse)').matches){
 const root=document.documentElement;
 const style=document.createElement('style');
 style.textContent='.lead-keyboard-open .mobile-cta,.lead-keyboard-open .kakao-channel-shortcut{visibility:hidden}.lead-keyboard-open .gd-interest-form,.lead-keyboard-open #registration{padding-bottom:max(24px,var(--lead-keyboard-inset))}';
 document.head.append(style);
 let frame,restingHeight=viewport.height;
 const syncLeadField=()=>{
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
   const field=document.activeElement;
   const editing=field?.matches('input:not([readonly]):not([type=checkbox]),textarea')&&field.closest('.gd-interest-form,#registration');
   if(!editing){
    root.classList.remove('lead-keyboard-open');
    restingHeight=Math.max(restingHeight,viewport.height);
    return;
   }
   const inset=Math.max(restingHeight,window.innerHeight)-viewport.height;
   const keyboardOpen=inset>100;
   root.classList.toggle('lead-keyboard-open',keyboardOpen);
   root.style.setProperty('--lead-keyboard-inset',Math.max(0,inset)+'px');
   if(!keyboardOpen)return;
   const bounds=field.getBoundingClientRect();
   const top=viewport.offsetTop;
   const bottom=top+viewport.height;
   if(bounds.top>=top+24&&bounds.bottom<=bottom-24)return;
   field.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
   const positioned=field.getBoundingClientRect();
   if(positioned.top<top+24||positioned.bottom>bottom-24){
    const delta=positioned.top+positioned.height/2-(top+viewport.height/2);
    window.scrollBy({top:delta,behavior:'instant'});
   }
  });
 };
 document.addEventListener('focusin',syncLeadField);
 document.addEventListener('focusout',syncLeadField);
 viewport.addEventListener('resize',syncLeadField);
 window.addEventListener('orientationchange',()=>{restingHeight=viewport.height;syncLeadField()});
}
})();


// BEGIN GENERATED SHARED QUICK ACTIONS
/* Shared quick actions, approved by the user on 2026-11-23. */
(function(){
 'use strict';
 if(location.pathname.indexOf('/previews/')===0)return;
 const css=`.gd-floating-actions,.kakao-channel-shortcut,.mobile-cta{display:none!important}
 #shared-quick-actions{position:fixed;right:24px;top:50%;transform:translateY(-50%);z-index:1100;width:68px;overflow:hidden;border-radius:17px;background:#282b2f;box-shadow:0 5px 18px #0002;display:flex;flex-direction:column}
 #shared-quick-actions a,#shared-quick-actions button{appearance:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-height:74px;width:100%;padding:13px 3px;background:none;border:0;border-radius:0;color:white;text-decoration:none;text-align:center;font:700 12px/1.25 Arial,sans-serif;cursor:pointer;box-sizing:border-box}
 #shared-quick-actions>*+*{border-top:1px solid #ffffff24!important}
 #shared-quick-actions a:hover,#shared-quick-actions button:hover{background:#373a3e}
 #shared-quick-actions svg{width:20px;height:20px;flex:none}
 #shared-quick-actions .quick-kakao svg{width:26px;height:26px}
 #shared-quick-actions .quick-top svg{width:14px;height:14px}
 #shared-quick-actions .quick-top{min-height:63px;gap:5px}
 #shared-quick-actions :focus-visible{outline:2px solid #fee500;outline-offset:-4px}
 .lead-keyboard-open #shared-quick-actions{visibility:hidden}
 @media(max-width:600px){#shared-quick-actions{right:12px;top:auto;bottom:max(28px,env(safe-area-inset-bottom));transform:none;width:48px;border-radius:13px}
 #shared-quick-actions .quick-register{display:none!important}
 #shared-quick-actions .quick-kakao{min-height:49px;padding:11px 4px}
 #shared-quick-actions .quick-kakao span{display:none}
 #shared-quick-actions .quick-top{min-height:48px;padding:9px 4px;gap:4px;font-size:10px}
 #shared-quick-actions .quick-kakao svg{width:25px;height:25px}
 #shared-quick-actions .quick-top svg{width:12px;height:12px}}
 @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}
 @media print{#shared-quick-actions{display:none!important}}`;
 if(!document.getElementById('shared-quick-actions-style')){const style=document.createElement('style');style.id='shared-quick-actions-style';style.textContent=css;document.head.append(style);}
 function contactTarget(){
  const inline=document.getElementById('gd-inline-interest');if(inline)return inline;
  const form=[...document.querySelectorAll('.gd-interest-form,#registration,#leadForm')].find(el=>el.getClientRects().length&&!el.closest('dialog:not([open])'));
  return form?.closest('section[id]')||form?.closest('[id]')||form||document.getElementById('register');
 }
 function mount(){
  if(document.getElementById('shared-quick-actions'))return;
  const existing=[...document.querySelectorAll('a[href]')].find(a=>/^https:\/\/pf\.kakao\.com\//.test(a.href));
  const nav=document.createElement('aside');nav.id='shared-quick-actions';nav.setAttribute('aria-label','빠른 메뉴');
  nav.innerHTML='<button class="quick-register" type="button" aria-label="관심고객등록"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 12h8m-8 4h6" stroke="#282b2f" stroke-width="1.6"/></svg><span>관심고객<br>등록</span></button><a class="quick-kakao" target="_blank" rel="noopener" aria-label="카카오톡 문의하기"><svg viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="9" fill="#fee500"/><path d="M14 6.3c-4.8 0-8.7 3-8.7 6.6 0 2.4 1.7 4.5 4.2 5.6l-.9 3.1 3.7-2.5 1.7.2c4.8 0 8.7-2.9 8.7-6.5S18.8 6.3 14 6.3Z" fill="#282b2f"/></svg><span>카카오톡</span></a><button class="quick-top" type="button" aria-label="맨 위로"><svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m10 3 7 7h-4v7H7v-7H3z"/></svg><span>TOP</span></button>';
  nav.querySelector('.quick-kakao').href=existing?.href||'https://pf.kakao.com/_ERxkFX/chat';
  nav.querySelector('.quick-register').addEventListener('click',()=>{
   const homeDialog=document.getElementById('home-register-dialog');
   if(homeDialog){const trigger=document.querySelector('button[data-register=""]');if(trigger)trigger.click();else if(!homeDialog.open)homeDialog.showModal();return;}
   const target=contactTarget();
   if(!target){location.assign('https://bunyang-alimi.com/#register');return;}
   const motion=matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
   if(typeof window.gdScrollToSection==='function')window.gdScrollToSection(target);
   else{const header=document.querySelector('.gd-header,.standalone-header,header');const offset=header?.getBoundingClientRect().height||0;window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset-16),behavior:motion});}
  });
  nav.querySelector('.quick-top').addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
  document.body.append(nav);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

// END GENERATED SHARED QUICK ACTIONS

/* boraware-restore-k390: shared protection for bunyang-alimi sites. */
(function () {
  if (!/(^|\.)bunyang-alimi\.com$/i.test(location.hostname)) return;
  if (document.querySelector('script[src*="script.boraware.kr/protect_script"]')) return;
  window.protect_id = 'k390';
  var style = document.createElement('style');
  style.textContent = '#bora-message-check{top:130px!important;bottom:auto!important;}@media(max-width:767px){#bora-message-check{left:12px!important;}}';
  document.head.appendChild(style);
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://script.boraware.kr/protect_script_v2.js';
  document.head.appendChild(script);
})();
