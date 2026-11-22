import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const base=fileURLToPath(new URL('.',import.meta.url));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=[];
for(const name of ['index.html','favicon.svg','robots.txt','sitemap.xml']){
 const url='https://gdmetro.bunyang-alimi.com/'+(name==='index.html'?'':name);
 const response=await fetch(url);
 const data=Buffer.from(await response.arrayBuffer());
 const local=await fs.readFile(`${base}/site/${name}`);
 const item={file:name,url,status:response.status,sha256:hash(data),matches:hash(data)===hash(local)};
 results.push(item);
 if(!response.ok||!item.matches)throw Error(JSON.stringify(item));
}
const html=await fs.readFile(`${base}/site/index.html`,'utf8');
const assetUrls=[...new Set([...html.matchAll(/(?:src|href)="(https:\/\/bunyang-alimi.com\/outputs\/[^"#]+)"/g)].map(m=>m[1]))];
const assets=await Promise.all(assetUrls.map(async url=>{const r=await fetch(url,{method:'HEAD'});return {url,status:r.status};}));
if(assets.some(r=>r.status!==200))throw Error('Asset unavailable');
const original=await fetch('https://bunyang-alimi.com/gdmetro/');
const unchanged=hash(Buffer.from(await original.arrayBuffer()))===(JSON.parse(await fs.readFile(`${base}/build-report.json`,'utf8'))).sourceSha256;
if(!unchanged)throw Error('Original GD page differs; investigate');
const report={checkedAt:new Date().toISOString(),files:results,assets,originalGdUnchanged:unchanged,leadSubmission:'Not submitted: no test personal data sent'};
await fs.writeFile(`${base}/verification.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({files:results.length,assets:assets.length,allPassed:true,originalGdUnchanged:unchanged}));
