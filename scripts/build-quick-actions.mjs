// Run from the repository root: node scripts/build-quick-actions.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const file='outputs/portal/lead-form.js';
const marker='// BEGIN GENERATED SHARED QUICK ACTIONS';
const current=fs.readFileSync(file,'utf8');
const base=current.includes(marker)?current.slice(0,current.indexOf(marker)).trimEnd():current.trimEnd();
const ui=fs.readFileSync('outputs/portal/quick-actions.js','utf8');
const result=base+'\n\n'+marker+'\n'+ui+'\n// END GENERATED SHARED QUICK ACTIONS\n';
new vm.Script(result);fs.writeFileSync(file,result);
console.log('Built shared quick actions; existing form logic retained.');
