import test from 'node:test';
import assert from 'node:assert/strict';
import {games,playableGames,routeFromHash} from '../src/core/registry.js';
import {games as compatibleCatalog} from '../src/content.js';
import {passports} from '../src/content/passports.js';
test('catalog compatibility and hash routes preserve the three games',()=>{
 assert.equal(games,compatibleCatalog);
 assert.equal(new Set(games.map(g=>g.id)).size,games.length);
 assert.deepEqual(playableGames.map(g=>g.id),['safety','professions','yurt']);
 for(const g of games)assert.equal(routeFromHash('#/'+g.id),g.ready?g.id:'notfound');
 for(const hash of ['','#/'])assert.equal(routeFromHash(hash),'home');
 for(const hash of ['#main-content','#/unknown','#/safety/other'])assert.equal(routeFromHash(hash),'notfound');
});
test('every existing game has a versioned bilingual passport without invented approval',()=>{
 assert.deepEqual(Object.keys(passports).sort(),playableGames.map(g=>g.id).sort());
 for(const [id,p] of Object.entries(passports)){
  assert.equal(p.gameId,id);assert.equal(p.schemaVersion,1);assert.equal(p.version,1);
  assert.equal(p.review.language,'pending-owner');assert.equal(p.review.pedagogy,'pending');
  for(const key of ['goal','scope','format','steps','outcome','materials','adaptation','offlineFollowUp','safety'])
   for(const lang of ['kk','ru'])assert.ok(p[key][lang].trim(),`${id}.${key}.${lang}`);
 }
});
