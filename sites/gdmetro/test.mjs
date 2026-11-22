import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {renderPages,sha256} from './build.mjs';
const source=await fs.readFile(new URL('./source.html',import.meta.url),'utf8');
const original=renderPages(source);
for(const html of [original.main,original.dedicated]){
 assert(!/BYC|비와이씨|gd-byc/i.test(html),'Removed constructor content must not return');
 assert(html.includes('tel:16885650'),'Consultation number preserved');
 const intro=html.match(/<section class="gd-intro-sequence"[\s\S]*?<\/section>/)?.[0];
 assert(intro,'Introduction section missing');
 const photos=[...intro.matchAll(/<img src="([^"]+)"/g)].map(m=>m[1].split('/').pop());
 assert.deepEqual(photos,['gd-intro-day-20261123.png','gd-intro-night-20261123.jpg','gd-intro-wide-20261123.jpg'],'Approved photo order');
}
const probe='동기화 확인용 문구';
assert(source.includes('</main>'));
const edited=renderPages(source.replace('</main>',`<p>${probe}</p></main>`));
for(const name of ['main','dedicated']){
 assert(edited[name].includes(probe),`${name}: single edit missing`);
 assert(!original[name].includes(probe),`${name}: original modified`);
 assert(edited[name].includes(edited.sourceSha256));
 assert.notEqual(edited.sourceSha256,original.sourceSha256);
 assert.deepEqual(original[name].match(/<form\b[\s\S]*?<\/form>/g),source.match(/<form\b[\s\S]*?<\/form>/g));
 assert(!original[name].includes('detail-popup-layer'));
}
assert.equal(original.sourceSha256,sha256(source));
assert(original.main.includes('<meta property="og:site_name" content="분양알리미">'));
assert(original.dedicated.includes('<meta property="og:site_name" content="GD메트로타워">'));
assert(original.main.includes('<link rel="canonical" href="https://bunyang-alimi.com/gdmetro/">'));
assert(original.dedicated.includes('<link rel="canonical" href="https://gdmetro.bunyang-alimi.com/">'));
assert.throws(()=>renderPages(original.main),/source.html/);
assert.throws(()=>renderPages(source.replace('</body>','<div class="detail-popup-layer"></div></body>')),/popup/);
console.log('PASS: one source edit reaches both sites; branding, canonical URLs and forms preserved; generated-source/popup guards work.');
