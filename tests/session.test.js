import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSession,reduceSession} from '../src/games/safety/session.js';
const stages=[{cards:[{correct:1},{correct:0}]},{cards:[{correct:0}]}];
const act=(s,a)=>reduceSession(s,a,stages);
test('wrong choice requires retry and cannot advance',()=>{
 let s=act(initialSession(),{type:'start'});
 s=act(s,{type:'answer',index:0});assert.equal(s.feedback,'retry');
 assert.deepEqual(act(s,{type:'next'}),s);
 s=act(s,{type:'retry'});assert.equal(s.choice,null);
 s=act(s,{type:'answer',index:1});assert.equal(s.feedback,'correct');assert.equal(s.completed,1);
});
test('duplicate answers and stale next events cannot skip a question',()=>{
 let s=act(initialSession(),{type:'start'}); s=act(s,{type:'answer',index:1});
 assert.deepEqual(act(s,{type:'answer',index:1}),s);
 s=act(s,{type:'next'});assert.equal(s.question,1);
 assert.deepEqual(act(s,{type:'next'}),s);assert.equal(s.completed,1);
});
test('all stages must complete before recap; reset clears progress',()=>{
 let s=act(initialSession(),{type:'start'});
 for(const answer of [1,0,0]){s=act(s,{type:'answer',index:answer});s=act(s,{type:'next'});}
 assert.equal(s.phase,'recap');assert.equal(s.completed,3);
 assert.deepEqual(act(s,{type:'reset'}),initialSession());
});
test('invalid or late events cannot mutate intro or recap',()=>{
 const s=initialSession();assert.deepEqual(act(s,{type:'answer',index:0}),s);
 let playing=act(s,{type:'start'});assert.deepEqual(act(playing,{type:'answer',index:99}),playing);
});
