import test from 'node:test';
import assert from 'node:assert/strict';
import {stages,recap} from '../src/games/safety/data.js';
import {ui,games} from '../src/content.js';
import {initialSession,reduceSession} from '../src/games/safety/session.js';

test('all visible content has both languages and valid answer keys',()=>{
 assert.deepEqual(Object.keys(ui.kk).sort(),Object.keys(ui.ru).sort());
 for(const dictionary of Object.values(ui)) for(const text of Object.values(dictionary)) assert.ok(typeof text==='string'&&text.trim());
 const bilingual=value=>{for(const lang of ['kk','ru'])assert.ok(typeof value[lang]==='string'&&value[lang].trim());};
 assert.equal(games.length,13);assert.equal(new Set(games.map(g=>g.id)).size,13);
 games.forEach(g=>bilingual(g.title));
 assert.equal(stages.length,5);assert.equal(recap.length,5);
 assert.equal(stages.flatMap(s=>s.cards).length,18);
 for(const stage of stages){
  bilingual(stage.title);bilingual(stage.intro);
  for(const card of stage.cards){
   bilingual(card.q);bilingual(card.why);card.options.forEach(bilingual);
   assert.ok(Number.isInteger(card.correct)&&card.correct>=0&&card.correct<card.options.length);
  }
 }
 for(const panel of recap)for(const key of ['title','rule','ask'])bilingual(panel[key]);
});

test('real 18-question lesson requires retry and awards every rule exactly once',()=>{
 const act=(state,action)=>reduceSession(state,action,stages);
 let state=act(initialSession(),{type:'start'}),completed=0;
 for(const stage of stages)for(const card of stage.cards){
  state=act(state,{type:'answer',index:(card.correct+1)%card.options.length});
  assert.equal(state.feedback,'retry');assert.equal(state.completed,completed);
  assert.deepEqual(act(state,{type:'next'}),state);
  state=act(state,{type:'retry'});
  state=act(state,{type:'answer',index:card.correct});
  assert.equal(state.completed,++completed);
  assert.deepEqual(act(state,{type:'answer',index:card.correct}),state);
  state=act(state,{type:'next'});
 }
 assert.equal(state.phase,'recap');assert.equal(state.completed,18);
 assert.deepEqual(act(state,{type:'answer',index:0}),state);
 assert.deepEqual(act(state,{type:'reset'}),initialSession());
});
