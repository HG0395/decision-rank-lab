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
  assert.throws(()=>C.validate({...C.fresh(),version:3}));
});
test('file validation preserves only schema fields and copies arrays', () => {
  const original=C.fresh(); original.extra='ignored'; const restored=C.validate(original);
  assert.equal(restored.extra,undefined); assert.notEqual(original.personal,restored.personal);
  const {extra,...expected}=original;
  assert.deepEqual(restored,expected);
});
test('CSV handles quotes, newlines and spreadsheet formulas safely', () => {
  assert.equal(C.csvCell('a"b\nc'),'"a""b\nc"');
  assert.equal(C.csvCell('=1+1'),'"\'=1+1"');
  assert.equal(C.csvCell('  @SUM(A1)'),'"\'  @SUM(A1)"');
});

test('PPT slide 9 reference is fixed and fresh activities can be scored immediately', () => {
  assert.deepEqual(C.REFERENCE,[0,1,2,3,4,5,6,7,8,9,10,11]);
  assert.ok(Object.isFrozen(C.REFERENCE));
  assert.equal(C.RATIONALE.length,12);
  const data=C.fresh(); data.reference.reverse();
  assert.deepEqual(C.REFERENCE,C.identity());
  assert.equal(data.confirmed.reference,true);
  assert.equal(C.score(C.identity()).total,0);
});

test('starting and reset orders remain valid without revealing the reference', () => {
  for (const random of [()=>0,()=>0.999999,Math.random]) {
    for(let i=0;i<30;i++) {
      const order=C.shuffled(random);
      assert.ok(C.validOrder(order)); assert.notDeepEqual(order,C.REFERENCE);
    }
  }
});

test('legacy files preserve student work and move old scenarios to activity notes', () => {
  const legacy={...C.fresh(),version:1,scenario:'이전 수업 메모',reference:C.identity().reverse(),referenceLabel:'이전 임의 기준'};
  legacy.alias='참여자'; legacy.notes.personal[0]='보존할 근거'; legacy.confirmed.reference=false;
  const restored=C.validate(legacy);
  assert.equal(restored.version,2); assert.equal(restored.activityNotes,'이전 수업 메모');
  assert.equal(restored.alias,'참여자'); assert.equal(restored.notes.personal[0],'보존할 근거');
  assert.deepEqual(restored.personal,legacy.personal); assert.deepEqual(restored.reference,C.REFERENCE);
  assert.equal(restored.scenario,C.SCENARIO); assert.equal(restored.referenceLabel,C.REFERENCE_LABEL);
  assert.equal(restored.confirmed.reference,true);
});

test('imported files cannot override the fixed reference or scenario', () => {
  const file=C.fresh(); file.personal=C.move(C.identity(),0,1); file.confirmed.personal=true;
  file.reference=file.personal; file.referenceLabel='변조 기준'; file.confirmed.reference=false; file.scenario='변조 상황';
  const restored=C.validate(file);
  assert.deepEqual(restored.reference,C.REFERENCE); assert.equal(restored.scenario,C.SCENARIO);
  assert.equal(restored.referenceLabel,C.REFERENCE_LABEL); assert.equal(restored.confirmed.reference,true);
  assert.equal(C.score(restored.personal).total,2);
});

test('classroom bands follow PPT slide 7 and reject impossible odd totals', () => {
  for (const [total,grade] of [[0,'S'],[12,'S'],[14,'A'],[26,'A'],[28,'B'],[42,'B'],[44,'C'],[56,'C'],[58,'D'],[72,'D']]) assert.equal(C.band(total).grade,grade);
  for(const total of [-2,13,73,NaN]) assert.throws(()=>C.band(total));
});

test('discussion comparison distinguishes improvement, regression and equal totals with changed ranks', () => {
  const forward=C.identity(), backward=C.identity().reverse();
  const better=C.compare(backward,forward), worse=C.compare(forward,backward);
  assert.equal(better.gain,72); assert.equal(better.improved,12); assert.equal(better.worsened,0);
  assert.equal(worse.gain,-72); assert.equal(worse.worsened,12);
  const same=C.compare(forward,forward);
  assert.equal(same.gain,0); assert.equal(same.changedRanks,0);
  const different=C.compare(C.move(forward,0,1),C.move(forward,2,3));
  assert.equal(different.gain,0); assert.equal(different.changedRanks,4);
  assert.equal(different.improved,2); assert.equal(different.worsened,2);
  assert.equal(different.changes.reduce((a,b)=>a+b,0),different.gain);
});
