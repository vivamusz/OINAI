import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {initialProfessionSession,reduceProfessionSession,cleanCompleted} from '../src/games/professions/session.js';
import {text} from '../src/games/professions/text.js';
const data=JSON.parse(readFileSync(new URL('../src/games/professions/data.json',import.meta.url)));
const art=JSON.parse(readFileSync(new URL('../src/games/professions/answer-art.json',import.meta.url)));
const act=(state,action)=>reduceProfessionSession(state,action,data.professions);
const initial=done=>initialProfessionSession(done,data.professions);

test('professions have 35 bilingual questions and valid local illustration files',()=>{
 assert.equal(data.professions.length,7);assert.equal(data.professions.flatMap(p=>p.quiz).length,35);
 assert.deepEqual(Object.keys(text.kk).sort(),Object.keys(text.ru).sort());
 for(const t of Object.values(text))for(const value of Object.values(t))assert.ok(value.trim());
 const bilingual=v=>{assert.ok(v.kk?.trim());assert.ok(v.ru?.trim());};
 const file=path=>assert.ok(existsSync(new URL('../public/assets/professions/'+path.split('/').pop(),import.meta.url)),path);
 file(data.map.image);file(data.finale.image);
 for(const p of data.professions){
  bilingual(p.title);assert.equal(p.quiz.length,5);file(p.guide);file(p.original);
  for(const id of data.pieceOrder){const piece=p.pieces.find(x=>x.id===id);assert.ok(piece);file(piece.src);assert.ok(piece.x>=0&&piece.y>=0&&piece.w>0&&piece.h>0&&piece.x+piece.w<=1.001&&piece.y+piece.h<=1.001);}
  for(const q of p.quiz){bilingual(q.q);assert.equal(q.choices.filter(c=>c.ok).length,1);for(const c of q.choices){bilingual(c.text);file(c.image);const a=art[c.image.split('/').pop()];if(a){file(a.file);assert.ok(a.cell>=0&&a.cell<16);}}}
 }
});
test('invalid storage values never unlock professions',()=>{
 for(const v of [null,{},'fire',7])assert.deepEqual(cleanCompleted(v,data.professions),[]);
 assert.deepEqual(initial(['fire','fire','unknown',null]).done,['fire']);
 assert.equal(act(initial(),{type:'finish'}).phase,'map');
});
test('wrong or duplicate answers cannot advance or add a puzzle piece',()=>{
 let s=act(initial(),{type:'open',id:'fire'});
 assert.deepEqual(act(s,{type:'answer',index:100}),s);
 s=act(s,{type:'answer',index:1});assert.equal(s.feedback,'retry');assert.equal(s.step,0);
 assert.deepEqual(act(s,{type:'next'}),s);
 assert.deepEqual(act(s,{type:'answer',index:0}),s);
 s=act(s,{type:'retry'});s=act(s,{type:'answer',index:0});
 assert.deepEqual(act(s,{type:'answer',index:0}),s);
 s=act(s,{type:'next'});assert.equal(s.step,1);assert.deepEqual(act(s,{type:'next'}),s);
});
test('all seven professions complete once, unlock finale, replay and reset',()=>{
 let s=initial();
 for(const p of data.professions){
  s=act(s,{type:'open',id:p.id});
  for(const q of p.quiz){s=act(s,{type:'answer',index:q.choices.findIndex(c=>c.ok)});s=act(s,{type:'next'});}
  assert.equal(s.phase,'solved');s=act(s,{type:'map'});
 }
 s=act(s,{type:'finish'});assert.equal(s.phase,'finale');assert.equal(s.done.length,7);
 s=act(s,{type:'browse'});s=act(s,{type:'open',id:'fire'});
 for(const q of data.professions[0].quiz){s=act(s,{type:'answer',index:q.choices.findIndex(c=>c.ok)});s=act(s,{type:'next'});}
 assert.equal(s.done.length,7);s=act(s,{type:'reset'});assert.equal(s.phase,'map');assert.deepEqual(s.done,[]);
});
test('leaving an unfinished profession retains only completed professions',()=>{
 let s=act(initial(['doctor']),{type:'open',id:'fire'});s=act(s,{type:'answer',index:0});s=act(s,{type:'next'});
 s=act(s,{type:'map'});assert.deepEqual(s.done,['doctor']);assert.equal(s.step,0);
 assert.deepEqual(act(s,{type:'open',id:'invalid'}),s);
});

test('the map remains accessible after all professions are completed',()=>{
 const done=data.professions.map(p=>p.id);
 let s=act(initial(done),{type:'finish'});assert.equal(s.phase,'finale');
 s=act(s,{type:'map'});assert.equal(s.phase,'map');assert.equal(s.done.length,7);
});
