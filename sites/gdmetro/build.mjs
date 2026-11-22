import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const origin='https://gdmetro.bunyang-alimi.com';
const source=await fs.readFile(`${root}/production-source.html`,'utf8');
const beforeForm=source.match(/<form\b[\s\S]*?<\/form>/g);
let html=source.replace(/<title>[\s\S]*?<\/title>/,'<title>GD메트로타워 | GD메트로타워 분양 상담</title>')
 .replaceAll('https://bunyang-alimi.com/gdmetro/',origin+'/')
 .replace('<meta property="og:site_name" content="분양알리미">','<meta property="og:site_name" content="GD메트로타워">')
 .replace('<meta property="og:title" content="GD메트로타워 분양정보">','<meta property="og:title" content="GD메트로타워 | GD메트로타워 분양 상담">')
 .replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g,'')
 .replace('<meta name="theme-color" content="#e6007e">','<meta name="theme-color" content="#682431"><link rel="icon" href="/favicon.svg" type="image/svg+xml">');
html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':origin+'/#website',name:'GD메트로타워',alternateName:['GD메트로타워','GD METRO TOWER'],url:origin+'/'},{'@type':'WebPage','@id':origin+'/#webpage',url:origin+'/',name:'GD메트로타워 분양 상담',isPartOf:{'@id':origin+'/#website'}}]})}</script>`);
// Assets and portal navigation continue to use the existing public site.
html=html.replace(/\b(src|href)="\/(?!\/)([^"]*)"/g,(all,attr,value)=>value==='favicon.svg'?all:`${attr}="https://bunyang-alimi.com/${value}"`);
html=html.replace('<a href="https://bunyang-alimi.com/">분양알리미</a>','<a href="/">GD메트로타워</a>');
html=html.replace(/(<a class="gd-footer-brand" href=")https:\/\/bunyang-alimi.com\/("[^>]*>[\s\S]*?<\/svg>)분양알리미<\/a>/,'$1/$2GD메트로타워</a>');
html=html.replace("if(b)location.href='/?property='+encodeURIComponent(b.dataset.register)+'#register'","if(b)document.getElementById('gd-inline-interest')?.scrollIntoView({behavior:'smooth'})");
if(JSON.stringify(beforeForm)!==JSON.stringify(html.match(/<form\b[\s\S]*?<\/form>/g)))throw Error('Lead form changed');
if(/<div[^>]*class="[^"]*detail-popup-layer/.test(html))throw Error('Automatic popup exists');
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(m[1].includes('application/ld+json'))JSON.parse(m[2]);else if(m[2].trim())new vm.Script(m[2]);}
html=html.replaceAll('지디메트로타워','GD메트로타워');
await fs.mkdir(`${root}/site`,{recursive:true});
await fs.writeFile(`${root}/site/index.html`,html);
await fs.writeFile(`${root}/site/favicon.svg`,'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#682431"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="30" fill="#fff">GD</text></svg>');
await fs.writeFile(`${root}/site/robots.txt`,`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile(`${root}/site/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const report={domain:'gdmetro.bunyang-alimi.com',sourceUrl:'https://bunyang-alimi.com/gdmetro/',sourceSha256:hash(source),indexSha256:hash(html),formsUnchanged:true,automaticPopups:0,inlineScriptsValid:true};
await fs.writeFile(`${root}/build-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
