import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('.',import.meta.url));
const repo=path.resolve(root,'../..');
const origin='https://gdmetro.bunyang-alimi.com';
export const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');

// The ONLY editable GD page. Both deployments are generated from this input.
export function renderPages(source){
 if(!source.startsWith('<!doctype html>')||!source.includes('id="overview-gdmetro"'))throw Error('Invalid GD source');
 if(source.includes('name="gd-source-sha256"'))throw Error('Edit source.html, not generated HTML');
 if(/<div[^>]*class="[^"]*detail-popup-layer/.test(source))throw Error('Automatic popup exists');
 const beforeForm=source.match(/<form\b[\s\S]*?<\/form>/g);
 let dedicated=source.replace(/<title>[\s\S]*?<\/title>/,'<title>GD메트로타워 | GD메트로타워 분양 상담</title>')
  .replaceAll('https://bunyang-alimi.com/gdmetro/',origin+'/')
  .replace('<meta property="og:site_name" content="분양알리미">','<meta property="og:site_name" content="GD메트로타워">')
  .replace('<meta property="og:title" content="GD메트로타워 분양정보">','<meta property="og:title" content="GD메트로타워 | GD메트로타워 분양 상담">')
  .replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g,'')
  .replace('<meta name="theme-color" content="#e6007e">','<meta name="theme-color" content="#682431"><link rel="icon" href="/favicon.svg" type="image/svg+xml">');
 dedicated=dedicated.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':origin+'/#website',name:'GD메트로타워',alternateName:['GD메트로타워','GD METRO TOWER'],url:origin+'/'},{'@type':'WebPage','@id':origin+'/#webpage',url:origin+'/',name:'GD메트로타워 분양 상담',isPartOf:{'@id':origin+'/#website'}}]})}</script>`);
 dedicated=dedicated.replace(/\b(src|href)="\/(?!\/)([^"]*)"/g,(all,attr,value)=>value==='favicon.svg'?all:`${attr}="https://bunyang-alimi.com/${value}"`)
  .replace('<a href="https://bunyang-alimi.com/">분양알리미</a>','<a href="/">GD메트로타워</a>')
  .replace(/(<a class="gd-footer-brand" href=")https:\/\/bunyang-alimi.com\/("[^>]*>[\s\S]*?<\/svg>)분양알리미<\/a>/,'$1/$2GD메트로타워</a>')
  .replace("if(b)location.href='/?property='+encodeURIComponent(b.dataset.register)+'#register'","if(b)document.getElementById('gd-inline-interest')?.scrollIntoView({behavior:'smooth'})")
  .replaceAll('지디메트로타워','GD메트로타워');
 if(JSON.stringify(beforeForm)!==JSON.stringify(dedicated.match(/<form\b[\s\S]*?<\/form>/g)))throw Error('Lead form changed');
 for(const html of [source,dedicated])for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(m[1].includes('application/ld+json'))JSON.parse(m[2]);
  else if(m[2].trim())new vm.Script(m[2]);
 }
 const sourceSha256=sha256(source);
 const stamp=html=>html.replace('</head>',`<meta name="gd-source-sha256" content="${sourceSha256}"></head>`);
 return {main:stamp(source),dedicated:stamp(dedicated),sourceSha256};
}

export async function build(){
 const source=await fs.readFile(path.join(root,'source.html'),'utf8');
 const pages=renderPages(source);
 const targets=[
  {path:'gdmetro/index.html',bucket:'bunyang-alimi-site-801178768218',key:'gdmetro/index.html',url:'https://bunyang-alimi.com/gdmetro/',body:pages.main},
  {path:'outputs/portal/properties/gdmetro.html',bucket:'bunyang-alimi-site-801178768218',key:'outputs/portal/properties/gdmetro.html',url:'https://bunyang-alimi.com/outputs/portal/properties/gdmetro.html',body:pages.main},
  {path:'sites/gdmetro/site/index.html',bucket:'gdmetro-site-801178768218',key:'index.html',url:origin+'/',body:pages.dedicated}
 ];
 for(const target of targets){await fs.mkdir(path.dirname(path.join(repo,target.path)),{recursive:true});await fs.writeFile(path.join(repo,target.path),target.body);}
 const assets=[];
 for(const name of ['gd-intro-day-20261123.png','gd-intro-night-20261123.jpg','gd-intro-wide-20261123.jpg']){
  const assetPath='outputs/portal/assets/'+name;
  const data=await fs.readFile(path.join(repo,assetPath));
  assets.push({path:assetPath,bucket:'bunyang-alimi-site-801178768218',key:assetPath,url:'https://bunyang-alimi.com/'+assetPath,kind:'image',contentType:name.endsWith('.png')?'image/png':'image/jpeg',sha256:sha256(data),bytes:data.length});
 }
 const manifest={source:'sites/gdmetro/source.html',sourceSha256:pages.sourceSha256,files:[...assets,...targets.map(({body,...t})=>({...t,kind:'html',contentType:'text/html; charset=utf-8',sha256:sha256(body),bytes:Buffer.byteLength(body)}))]};
 await fs.writeFile(path.join(root,'build-report.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await build()));
