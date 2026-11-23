import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,''));
const before=path.join(root,'before'), out=path.join(root,'after');
const main='https://bunyang-alimi.com';
const sites=[
 ['brighten','brighton','브라이튼 여의도','BR'],['luca831','luca831','루카831','LU'],
 ['byeolnae','byeolnae','별내자이 더 스타','XI'],['lewest','lewest','마곡 롯데캐슬 르웨스트','LW'],
 ['dk','dkvalleyview','DK밸리뷰 용산','DK'],['gochon','gochon','고촌센트럴자이','XI'],
 ['thegrid','thegrid','힐스테이트 송파더그리드','HG'],['insignia','insignia','인시그니아 반포','IN'],
 ['ph1603','ph1603','서초 PH1603','PH'],['vl-lewest','vl-lewest','VL 르웨스트','VL']
].map(([id,subdomain,name,icon])=>({id,subdomain,name,icon,url:`https://${subdomain}.bunyang-alimi.com/`}));
const map=Object.fromEntries(sites.map(s=>[s.id,s.url]));
function write(file,content){const dest=path.join(out,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content);}
function checkScripts(html){for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(/application\/ld\+json/.test(match[1]))JSON.parse(match[2]);else if(!/\bsrc=/.test(match[1]))new vm.Script(match[2]);}}
function address(value,id){
 if(value.startsWith('#')||/^(data:|tel:|mailto:|javascript:)/.test(value))return value;
 if(!value.startsWith('/')&&!value.startsWith('../')&&!value.startsWith('./')&&!value.startsWith(main))return value;
 const u=new URL(value,main+'/'+id+'/');
 if(u.origin!==main)return value;
 for(const s of sites){if([`/${s.id}/`,`/${s.id}/index.html`,`/properties/${s.id}.html`,`/outputs/portal/properties/${s.id}.html`].includes(u.pathname))return s.url+u.search+u.hash;}
 return u.href;
}
for(const site of sites){
 const {id,name,url,icon}=site;
 const old=fs.readFileSync(path.join(before,id,'index.html'),'utf8');let html=old;
 assert(old.includes(`id="interest-${id}"`)&&old.includes(`data-lead-property="${id}"`));
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${name} | 분양정보·방문예약</title>`)
 .replace(/(<link rel="canonical" href=")[^"]+/,`$1${url}`)
 .replace(/(<meta property="og:url" content=")[^"]+/,`$1${url}`)
 .replace(/(<meta property="og:site_name" content=")[^"]+/,`$1${name}`)
 .replace(/(<meta property="og:title" content=")[^"]+/,`$1${name} 분양정보`);
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
   const schema=JSON.parse(raw);
   const walk=o=>{if(!o||typeof o!=='object')return; if(o['@type']==='WebSite'){o.name=name;o.alternateName=[name];o.url=url;o['@id']=url+'#website';}
    for(const k of Object.keys(o)){if(typeof o[k]==='string'&&o[k].startsWith(main+'/'+id+'/'))o[k]=url+o[k].slice((main+'/'+id+'/').length);else if(typeof o[k]==='string'&&o[k]===main+'/#website')o[k]=url+'#website';else walk(o[k]);}};
   walk(schema);return '<script type="application/ld+json">'+JSON.stringify(schema)+'</script>';
 });
 html=html.replace(/<header class="standalone-header">[\s\S]*?<\/header>/,`<header class="standalone-header"><a href="${url}">${name}</a><a href="#interest-${id}">방문예약</a></header>`);
 html=html.replace(/\b(href|src|poster)="([^"]+)"/g,(_,key,value)=>`${key}="${address(value,id)}"`);
 html=html.replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g,'');
 html=html.replace('</head>',`<link rel="icon" href="/sites/dedicated/${id}/favicon.svg" type="image/svg+xml"><meta name="dedicated-property" content="${id}"></head>`);
 html=html.replace(/<script>document\.addEventListener\('click',e=>\{const b=e\.target\.closest\('\[data-register\]'\);if\(b\)location\.href=[\s\S]*?<\/script>/g,
  `<script>document.addEventListener('click',e=>{const b=e.target.closest('[data-register]');if(b){e.preventDefault();document.getElementById('interest-${id}')?.scrollIntoView({behavior:'smooth'});history.replaceState(null,'','#interest-${id}')}});if(location.hash==='#register')location.hash='#interest-${id}';</script>`);
 assert(!html.includes("if(b)location.href="));
 assert.equal(html.match(/<form[\s\S]*?<\/form>/)?.[0],old.match(/<form[\s\S]*?<\/form>/)?.[0],'reservation form changed');
 checkScripts(html);write(id+'/index.html',html);
 write(`sites/dedicated/${id}/favicon.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#272a31"/><text x="32" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#fff">${icon}</text></svg>`);
 write(`sites/dedicated/${id}/robots.txt`,`User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`);
 write(`sites/dedicated/${id}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url></urlset>`);
}
let app=fs.readFileSync(path.join(before,'outputs/portal/app.js'),'utf8');
const oldOpen="window.location.assign('/'+encodeURIComponent(p.id)+'/')";
assert(app.includes(oldOpen));app=app.replace(oldOpen,`window.location.assign((${JSON.stringify(map)})[p.id]||'/'+encodeURIComponent(p.id)+'/')`);
new vm.Script(app);write('outputs/portal/app.js',app);
for(const file of ['index.html','outputs/portal/index.html']){
 let html=fs.readFileSync(path.join(before,file),'utf8');
 html=html.replace(/\bhref="([^"]+)"/g,(_,href)=>`href="${sites.some(s=>href===`/${s.id}/`)?map[sites.find(s=>href===`/${s.id}/`).id]:href}"`);
 html=html.replace(/(src="(?:\/outputs\/portal\/)?app\.js)(?:\?[^"]*)?"/g,'$1?v=20261123-dedicated"');
 checkScripts(html);write(file,html);
}
const hostMap=Object.fromEntries(sites.map(s=>[new URL(s.url).hostname,s.id]));
const aliases={brighton:'brighten'};
const functionCode=`// Dedicated property routing; keep legacy main-site index handling below.\nfunction handler(event) {\n var req=event.request, uri=req.uri, host=req.headers.host.value.toLowerCase();\n var hosts=${JSON.stringify(hostMap)}, urls=${JSON.stringify(map)}, aliases=${JSON.stringify(aliases)};\n var qs=[]; for(var k in req.querystring){var v=req.querystring[k];if(v.multiValue){v.multiValue.forEach(function(m){qs.push(k+'='+m.value);});}else{qs.push(k+(v.value!==''?'='+v.value:''));}}\n var suffix=qs.length?'?'+qs.join('&'):'';\n function redirect(url){return {statusCode:301,statusDescription:'Moved Permanently',headers:{location:{value:url+suffix}}};}\n var match=uri.match(/^\\/(?:outputs\\/portal\\/properties\\/|properties\\/)?([a-z0-9-]+)(?:\\/index\\.html|\\/|\\.html)?$/), id=match&&(aliases[match[1]]||match[1]);\n if(hosts[host]){\n  var own=hosts[host];\n  if(uri==='/'||uri==='/index.html'){req.uri='/'+own+'/index.html';return req;}\n  if(uri==='/robots.txt'||uri==='/sitemap.xml'){req.uri='/sites/dedicated/'+own+uri;return req;}\n  if(id&&urls[id])return redirect(urls[id]);\n }else if(host==='bunyang-alimi.com'||host==='www.bunyang-alimi.com'){if(id&&urls[id])return redirect(urls[id]);}\n if(uri.endsWith('/')){req.uri=uri+'index.html';return req;}\n var last=uri.substring(uri.lastIndexOf('/')+1);if(last.indexOf('.')===-1)return redirect(uri+'/');\n return req;\n}\n`;
const ctx=vm.createContext({});vm.runInContext(functionCode,ctx);
const route=(host,uri,querystring={})=>ctx.handler({request:{uri,headers:{host:{value:host}},querystring}});
let checks=0;
for(const s of sites){const host=new URL(s.url).hostname;
 for(const uri of ['/','/index.html']){assert.equal(route(host,uri).uri,`/${s.id}/index.html`);checks++;}
 for(const uri of [`/${s.id}`,`/${s.id}/`,`/${s.id}/index.html`,`/properties/${s.id}.html`,`/outputs/portal/properties/${s.id}.html`]){assert.equal(route('bunyang-alimi.com',uri,{utm_source:{value:'naver'}}).headers.location.value,s.url+'?utm_source=naver');checks++;}
 assert.equal(route(host,'/robots.txt').uri,`/sites/dedicated/${s.id}/robots.txt`);checks++;
 assert.equal(route(host,'/outputs/portal/assets/example.jpg').uri,'/outputs/portal/assets/example.jpg');checks++;
}
assert.equal(route('bunyang-alimi.com','/gdmetro/').uri,'/gdmetro/index.html');
assert.equal(route('bunyang-alimi.com','/privacy/').uri,'/privacy/index.html');
assert.equal(route('bunyang-alimi.com','/other',{q:{multiValue:[{value:'a'},{value:'b'}]}}).headers.location.value,'/other/?q=a&q=b');
assert.equal(route('bunyang-alimi.com','/brighton/').headers.location.value,map.brighten);
write('sites/dedicated/routing.js',functionCode);write('sites/dedicated/sites.json',JSON.stringify(sites,null,2)+'\n');
fs.writeFileSync(path.join(root,'dns-zone.txt'),sites.map(s=>`${s.subdomain}.bunyang-alimi.com. 300 IN CNAME d1vx63so4nt7a.cloudfront.net.`).join('\n')+'\n');
const manifest=[];function scan(dir){for(const file of fs.readdirSync(dir)){const f=path.join(dir,file);if(fs.statSync(f).isDirectory())scan(f);else{const bytes=fs.readFileSync(f);manifest.push({path:path.relative(out,f).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});}}}scan(out);
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({sites:sites.length,routingChecks:checks+4,files:manifest.length,formPreservation:'10/10',inlineJavaScript:'passed'},null,2));
