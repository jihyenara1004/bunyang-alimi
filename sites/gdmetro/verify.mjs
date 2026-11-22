import fs from 'node:fs/promises';
import {sha256,build} from './build.mjs';
const manifest=await build();
const files=[];
for(const file of manifest.files){
 const r=await fetch(file.url,{cache:'no-store'});
 const data=Buffer.from(await r.arrayBuffer());
 const item={url:file.url,status:r.status,sha256:sha256(data),matches:sha256(data)===file.sha256,sameSource:data.toString().includes(`name="gd-source-sha256" content="${manifest.sourceSha256}"`)};
 files.push(item);
 if(!r.ok||!item.matches||!item.sameSource)throw Error(JSON.stringify(item));
}
const source=await fs.readFile(new URL('./site/index.html',import.meta.url),'utf8');
const urls=[...new Set([...source.matchAll(/(?:src|href)="(https:\/\/bunyang-alimi.com\/outputs\/[^"#]+)"/g)].map(m=>m[1]))];
const assets=await Promise.all(urls.map(async url=>({url,status:(await fetch(url,{method:'HEAD'})).status})));
if(assets.some(x=>x.status!==200))throw Error('Shared asset unavailable');
const report={checkedAt:new Date().toISOString(),sourceSha256:manifest.sourceSha256,files,assets,leadSubmission:'Not submitted'};
await fs.writeFile(new URL('./verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({allPassed:true,urls:files.length,assets:assets.length,sourceSha256:manifest.sourceSha256}));
