const {chromium}=require('playwright');const fs=require('fs');
const b64=fs.readFileSync('hero.b64','utf8');
const font=`font-family:'Noto Sans CJK KR','Noto Sans KR','Noto Sans CJK SC',sans-serif`;
const pages={
thumb:{w:1000,h:1000,html:`<style>*{margin:0;box-sizing:border-box}body{${font};color:#fff}
.c{width:1000px;height:1000px;position:relative;overflow:hidden;background:#0b1a33}
.bg{position:absolute;inset:0;background:url(data:image/jpeg;base64,${b64}) 62% center/auto 100%;opacity:.55}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,14,30,.55),rgba(6,14,30,.85))}
.in{position:absolute;left:110px;right:110px;top:150px;bottom:150px;display:flex;flex-direction:column;justify-content:center;gap:24px}
.tag{align-self:flex-start;border:2px solid #d9b46a;color:#d9b46a;padding:10px 24px;border-radius:40px;font-size:34px;font-weight:700}
h1{font-size:112px;line-height:1.1;font-weight:900;letter-spacing:-3px}h1 span{color:#d9b46a}
.s{font-size:42px;font-weight:700;color:#eef2fa}.box{margin-top:6px;background:rgba(255,255,255,.12);border-left:8px solid #d9b46a;padding:20px 28px;font-size:38px;font-weight:700;line-height:1.5}
.f{position:absolute;bottom:52px;left:0;right:0;text-align:center;font-size:40px;color:#d9b46a;font-weight:900;letter-spacing:2px}
</style><div class="c"><div class="bg"></div><div class="sh"></div><div class="in"><div class="tag">서울 노원구 · 서울원</div><h1>서울원<br><span>파크로쉬</span></h1><div class="s">웰니스 레지던스 · 768세대</div><div class="box">전용 70 · 73 · 80㎡<br>지하 3층 ~ 지상 49층</div></div><div class="f">1688-5650</div></div>`},
banner:{w:1200,h:315,html:`<style>*{margin:0;box-sizing:border-box}body{${font}}
.c{width:1200px;height:315px;background:#fff;border-top:10px solid #d9b46a;border-bottom:10px solid #d9b46a;display:flex;align-items:center;justify-content:center;gap:34px}
.ph{width:110px;height:110px;border-radius:50%;background:#d62828;display:flex;align-items:center;justify-content:center}
.t1{font-size:62px;font-weight:900;color:#0b1a33;letter-spacing:-2px}.t1 span{color:#b8892b}.t2{font-size:36px;font-weight:700;color:#d62828;margin-top:6px}
</style><div class="c"><div class="ph"><svg width="64" height="64" viewBox="0 0 24 24" fill="#fff"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.300.2 2.500.6 3.600.1.300 0 .700-.2 1l-2.300 2.200z"/></svg></div><div><div class="t1">서울원 <span>파크로쉬</span> 24시간 문의 환영</div><div class="t2">문의: 1688-5650</div></div></div>`}};
(async()=>{const b=await chromium.launch();for(const [n,p] of Object.entries(pages)){const pg=await b.newPage({viewport:{width:p.w,height:p.h}});await pg.setContent('<html><body>'+p.html+'</body></html>');await pg.waitForTimeout(300);await pg.screenshot({path:'roche-'+n+'.png'})}await b.close()})()
