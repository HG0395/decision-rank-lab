const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dist/core.js');
test('exact and reversed rankings cover 0 and maximum 72 error', () => {
  assert.equal(C.score(C.identity(), C.identity()).total, 0);
  assert.equal(C.score(C.identity(), C.identity()).normalized, 100);
  assert.equal(C.score(C.identity(), C.identity().reverse()).total, 72);
  assert.equal(C.score(C.identity(), C.identity().reverse()).normalized, 0);
});
test('known adjacent change has total 2; errors match item identities', () => {
  const moved = C.move(C.identity(),0,1), score = C.score(moved,C.identity());
  assert.deepEqual(score.errors,[1,1,0,0,0,0,0,0,0,0,0,0]);
  assert.equal(score.total,2); assert.equal(score.normalized,97.2);
});
test('every possible rank movement remains a unique permutation', () => {
  for(let from=0;from<12;from++) for(let to=0;to<12;to++) {
    const moved=C.move(C.identity(),from,to);
    assert.ok(C.validOrder(moved)); assert.equal(moved[to],from);
  }
});
test('invalid, duplicate and incomplete rankings cannot be scored or imported', () => {
  for(const invalid of [[],Array(12).fill(1),[...C.identity().slice(0,11),12],[...C.identity().slice(0,11),1.5]]) {
    assert.throws(()=>C.score(invalid,C.identity()));
    assert.throws(()=>C.validate({...C.fresh(),personal:invalid}));
  }
  assert.throws(()=>C.validate({...C.fresh(),notes:{personal:[],group:[]}}));
  assert.throws(()=>C.validate({...C.fresh(),version:2}));
});
test('file validation preserves only schema fields and copies arrays', () => {
  const original=C.fresh(); original.extra='ignored'; const restored=C.validate(original);
  assert.equal(restored.extra,undefined); assert.notEqual(original.personal,restored.personal);
  assert.deepEqual(restored,C.fresh());
});
test('CSV handles quotes, newlines and spreadsheet formulas safely', () => {
  assert.equal(C.csvCell('a"b\nc'),'"a""b\nc"');
  assert.equal(C.csvCell('=1+1'),'"\'=1+1"');
  assert.equal(C.csvCell('  @SUM(A1)'),'"\'  @SUM(A1)"');
});
