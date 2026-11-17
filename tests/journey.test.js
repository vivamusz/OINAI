import test from 'node:test';
import assert from 'node:assert/strict';
import {journey,questions} from '../src/features/journey/data.js';
import {initialJourney,reduceJourney,restoreJourney} from '../src/features/journey/session.js';
const act=(s,a)=>reduceJourney(s,a);
test('journey keeps completed and skipped distinct, requires manual confirmation',()=>{
 let s=initialJourney();s=act(s,{type:'start'});assert.equal(s.phase,'active');
 assert.equal(act(s,{type:'next'}),s);
 s=act(s,{type:'confirm'});assert.equal(s.status.welcome,'completed');
 s=act(s,{type:'next'});assert.equal(s.index,1);
 assert.equal(act(s,{type:'confirm'}),s);
 for(const q of questions){
  s=act(s,{type:'answer',choice:(q.correct+1)%q.options.length});
  assert.equal(s.quiz.feedback,'retry');assert.equal(act(s,{type:'confirm'}),s);
  s=act(s,{type:'retry'});s=act(s,{type:'answer',choice:q.correct});
  assert.equal(act(s,{type:'answer',choice:q.correct}),s);
  s=act(s,{type:'questionNext'});
 }
 assert.equal(s.status.choices,'completed');
 s=act(s,{type:'next'});s=act(s,{type:'skip'});
 assert.equal(s.status.discussion,'skipped');assert.equal(s.index,3);
 s=act(s,{type:'finish'});assert.equal(s.phase,'complete');assert.notEqual(s.status.reflection,'completed');
});
test('pause, navigation, replay and invalid events cannot corrupt progress',()=>{
 let s=act(initialJourney(),{type:'start'});s=act(s,{type:'pause'});
 assert.equal(act(s,{type:'confirm'}),s);assert.equal(act(s,{type:'jump',index:2}),s);
 s=act(s,{type:'resume'});assert.equal(act(s,{type:'jump',index:99}),s);
 s=act(s,{type:'jump',index:1});s=act(s,{type:'answer',choice:questions[0].correct});
 s=act(s,{type:'jump',index:0});s=act(s,{type:'jump',index:1});assert.equal(s.quiz.feedback,'correct');
 assert.deepEqual(act(s,{type:'reset'}),initialJourney());
});
test('restore rejects invalid version, forged progress and malformed storage',()=>{
 let s=act(initialJourney(),{type:'start'});s=act(s,{type:'confirm'});
 assert.deepEqual(restoreJourney(JSON.stringify(s)),s);
 for(const v of [null,'oops','{}',JSON.stringify({...s,version:9}),JSON.stringify({...s,index:99}),JSON.stringify({...s,status:{...s.status,choices:'completed'}})])assert.deepEqual(restoreJourney(v),initialJourney());
});
test('all journey references are bilingual and reuse existing safety questions',()=>{
 assert.equal(questions.length,3);assert.equal(journey.activities.length,6);
 assert.equal(new Set(journey.activities.map(a=>a.id)).size,6);
 for(const a of journey.activities)for(const lang of ['kk','ru']){assert.ok(a.title[lang]);assert.ok(a.instruction[lang]);}
 for(const q of questions){assert.ok(q.options[q.correct]);for(const lang of ['kk','ru'])assert.ok(q.q[lang]&&q.why[lang]);}
});

import {routeFromHash} from '../src/core/registry.js';
import {readFileSync} from 'node:fs';
test('coverage preserves 72 numbered games separately from additional scenarios',()=>{
 const c=JSON.parse(readFileSync(new URL('../docs/CONTENT_COVERAGE.json',import.meta.url),'utf8'));
 assert.deepEqual(c.games.map(g=>g.number),Array.from({length:72},(_,i)=>i+1));
 for(const g of c.games)assert.match(g.targetEngine,/^M(0[1-9]|1[0-5])$/);
 assert.ok(c.additionalMaterials.some(a=>a.title==='Безопасный мир'));
 assert.ok(c.additionalMaterials.some(a=>a.title==='Адал азамат — тәртіпті бала'));
 assert.equal(routeFromHash('#/journeys/safe-world'),'safe-world');
});
