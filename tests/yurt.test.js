import test from 'node:test';
import assert from 'node:assert/strict';
import {parts,lessons,text} from '../src/games/yurt/data.js';
import {initialYurt,reduceYurt,choicesFor} from '../src/games/yurt/session.js';

test('each yurt lesson finishes only after its 3, 5 or 7 correct answers',()=>{
 for(const count of [3,5,7]){
  let s=reduceYurt(initialYurt(),{type:'length',count});
  s=reduceYurt(s,{type:'start'});
  for(let step=0;step<count;step++){
   const right=lessons[count][step],choices=choicesFor(s),wrong=choices.find(id=>id!==right);
   assert.equal(new Set(choices).size,3);assert.ok(choices.includes(right));
   assert.equal(reduceYurt(s,{type:'answer',id:'unknown'}),s);
   assert.equal(reduceYurt(s,{type:'next'}),s);
   s=reduceYurt(s,{type:'answer',id:wrong});assert.equal(s.feedback,'retry');
   assert.equal(reduceYurt(s,{type:'answer',id:right}),s);
   s=reduceYurt(s,{type:'retry'});assert.equal(s.choice,null);
   s=reduceYurt(s,{type:'answer',id:right});assert.equal(s.completed,step+1);
   assert.equal(reduceYurt(s,{type:'answer',id:right}),s);
   s=reduceYurt(s,{type:'next'});
  }
  assert.equal(s.phase,'complete');assert.equal(s.completed,count);
  assert.equal(reduceYurt(s,{type:'next'}),s);
  const reset=reduceYurt(s,{type:'reset'});assert.equal(reset.phase,'intro');assert.equal(reset.completed,0);assert.equal(reset.count,count);
 }
});
test('yurt length and late actions cannot corrupt a lesson',()=>{
 const s=initialYurt();assert.equal(reduceYurt(s,{type:'length',count:99}),s);
 assert.equal(reduceYurt(s,{type:'answer',id:'kerege'}),s);
 const started=reduceYurt(s,{type:'start'});
 assert.equal(reduceYurt(started,{type:'length',count:7}),started);
 assert.equal(reduceYurt(started,{type:'start'}),started);
});
test('yurt has seven distinct bilingual parts, valid locations and lesson references',()=>{
 assert.equal(parts.length,7);assert.equal(new Set(parts.map(p=>p.id)).size,7);
 for(const p of parts){for(const field of ['name','description','place'])for(const lang of ['kk','ru'])assert.ok(p[field][lang].trim());assert.ok(p.x>0&&p.x<100&&p.y>0&&p.y<100);}
 for(const [count,ids] of Object.entries(lessons)){assert.equal(ids.length,Number(count));assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>parts.some(p=>p.id===id)));}
 assert.deepEqual(Object.keys(text.kk).sort(),Object.keys(text.ru).sort());
 for(const lang of Object.values(text))for(const value of Object.values(lang))assert.ok(value.trim());
});
