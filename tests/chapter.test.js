import test from 'node:test';
import assert from 'node:assert/strict';
import {chapter} from '../src/features/journey/adal-data.js';
import {createChapterSession} from '../src/features/journey/chapter-session.js';
const engine=createChapterSession(chapter),act=engine.reduce;
test('all five stations finish once; wrong answers require retry',()=>{
 let s=act(engine.initial(),{type:'start'});
 for(const station of chapter.stations){
  if(station.kind==='movement'){s=act(s,{type:'signal',index:2});s=act(s,{type:'confirm'});}
  else for(const q of station.questions){
   s=act(s,{type:'answer',index:(q.correct+1)%q.options.length});assert.equal(act(s,{type:'nextQuestion'}),s);
   s=act(s,{type:'retry'});s=act(s,{type:'answer',index:q.correct});assert.equal(act(s,{type:'answer',index:q.correct}),s);
   s=act(s,{type:'nextQuestion'});
  }
  assert.equal(s.stations[station.id].status,'completed');s=act(s,{type:'next'});
 }
 assert.equal(s.phase,'complete');assert.equal(Object.values(s.stations).filter(x=>x.status==='completed').length,5);
 assert.deepEqual(engine.restore(JSON.stringify(s)),s);
});
test('pause, early finish, skipped station and isolated storage are safe',()=>{
 let s=act(engine.initial(),{type:'start'});s=act(s,{type:'pause'});assert.equal(act(s,{type:'skip'}),s);
 s=act(s,{type:'resume'});s=act(s,{type:'skip'});assert.equal(s.stations.honesty.status,'skipped');
 s=act(s,{type:'finish'});assert.equal(s.phase,'complete');assert.equal(s.stations.rules.status,'notStarted');
 assert.notEqual(engine.storage,'oinai-journey-safe-world-v1');assert.deepEqual(act(s,{type:'reset'}),engine.initial());
});
test('restore rejects foreign chapter, invalid answers and forged completion',()=>{
 let s=act(engine.initial(),{type:'start'});s=act(s,{type:'answer',index:1});assert.deepEqual(engine.restore(JSON.stringify(s)),s);
 for(const raw of ['bad','{}',JSON.stringify({...s,chapterId:'safe-world'}),JSON.stringify({...s,stations:{...s.stations,honesty:{...s.stations.honesty,status:'completed'}}})])assert.deepEqual(engine.restore(raw),engine.initial());
});
test('all 17 questions and five stations are bilingual and valid',()=>{
 assert.equal(chapter.stations.length,5);assert.equal(chapter.stations.reduce((n,s)=>n+s.questions.length,0),17);
 for(const s of chapter.stations){for(const lang of ['kk','ru'])assert.ok(s.title[lang]&&s.instruction[lang]);for(const q of s.questions){assert.ok(q.options[q.correct]);for(const lang of ['kk','ru'])assert.ok(q.prompt[lang]&&q.explanation[lang]&&q.options.every(o=>o[lang]));}}
});
