const {chromium}=require('playwright');
const css=`*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;background:#fff;padding:0}
.w{width:1000px;padding:28px 30px 22px;background:#fff}
.t{font-size:30px;font-weight:900;color:#0d1b33;margin-bottom:14px;border-left:10px solid #d4af5f;padding-left:14px}
table{width:100%;border-collapse:collapse;font-size:28px}
th{background:#0d1b33;color:#fff;padding:16px 12px;border:2px solid #0d1b33;font-weight:700}
td{padding:16px 14px;border:2px solid #c9d1de;text-align:center;color:#17233a;font-weight:500}
td.k{background:#f1f4fa;font-weight:700}tr:nth-child(even) td:not(.k){background:#fafbfd}
.s{color:#b8892b;font-weight:700}
.n{margin-top:12px;font-size:21px;color:#5b6577;text-align:right}`;
const T=(title,head,rows,note,keycol=true)=>`<style>${css}</style><div class="w"><div class="t">${title}</div><table><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i==0&&keycol?'k':''}">${c}</td>`).join('')}</tr>`).join('')}</table><div class="n">${note}</div></div>`;
const pages={'roche-table-overview':T('서울원 파크로쉬 사업개요',['항목','내용'],[['현장명','서울원 파크로쉬'],['대지위치','서울 노원구 화랑로45길 145 일원'],['건축규모','지하 3층 ~ 지상 49층 · 2개동'],['세대수','총 768세대'],['전용면적','70 · 73 · 80㎡'],['시행·시공','아이파크현대산업개발(주)'],['갤러리','서울 노원구 마들로1길 45'],['상담','1688-5650']],'※ 공식 홈페이지 기준 · 분양가·입주 시기는 상담 시 안내 (2026.11.03 기준)')};
(async()=>{const b=await chromium.launch();for(const [n,h] of Object.entries(pages)){const p=await b.newPage({viewport:{width:1000,height:600}});await p.setContent('<html><body>'+h+'</body></html>');await p.waitForTimeout(200);const el=await p.$('.w');await el.screenshot({path:n+'.png'})}await b.close()})()
