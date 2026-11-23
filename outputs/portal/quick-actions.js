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
