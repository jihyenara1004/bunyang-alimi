// SEO 산출물 생성: sitemap.xml(홈 + 현장별 /id/) + 메인 HTML의 크롤러용 전체 현장 링크 목록.
// 사용: node work/gen-seo.cjs  (현장 추가/삭제 후 실행, 날짜는 오늘 기준)
const fs=require('fs');global.window={};require('../outputs/portal/properties.js');
const P=window.PORTAL_PROPERTIES.slice().sort((a,b)=>(a.sort||0)-(b.sort||0));
const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://bunyang-alimi.com/</loc><lastmod>'+today+'</lastmod></url>\n';
for(const p of P)sm+='  <url><loc>https://bunyang-alimi.com/'+p.id+'/</loc><lastmod>'+today+'</lastmod></url>\n';
fs.writeFileSync('sitemap.xml',sm+'</urlset>\n');
const list='<!--SITE-LIST-START--><section id="all-sites" class="seo-site-list" aria-labelledby="all-sites-title"><h2 id="all-sites-title">전체 분양현장 바로가기</h2><ul>'+P.map(p=>'<li><a href="/'+p.id+'/">'+E(p.name)+'</a><span>'+E([p.area,p.type].filter(Boolean).join(' · '))+'</span></li>').join('')+'</ul></section><!--SITE-LIST-END-->';
for(const f of ['index.html','outputs/portal/index.html']){let h=fs.readFileSync(f,'utf8');
 if(h.includes('<!--SITE-LIST-START-->'))h=h.replace(/<!--SITE-LIST-START-->[\s\S]*?<!--SITE-LIST-END-->/,list);
 else h=h.replace('<section id="register"',list+'<section id="register"');
 fs.writeFileSync(f,h)}
console.log('sitemap',P.length+1,'urls; list',P.length,'links; lastmod',today);
