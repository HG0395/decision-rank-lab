(function (root) {
  'use strict';
  const ITEMS = ['분말 소화기', '구급상자', '롱패딩과 담요', '정수기 10L 생수통', '대형 비닐 쓰레기봉투', '커터칼', '모의고사 시험지 뭉치', '건전지형 라디오', '스마트폰 및 보조배터리', '고열량 에너지바 1박스', '라이터', '고카페인 에너지 드링크'];
  const identity = () => ITEMS.map((_, i) => i);
  const validOrder = a => Array.isArray(a) && a.length === 12 && new Set(a).size === 12 && a.every(v => Number.isInteger(v) && v >= 0 && v < 12);
  const ranks = a => { if (!validOrder(a)) throw new Error('1~12위가 중복 없이 모두 있어야 합니다.'); const r = []; a.forEach((id, i) => r[id] = i + 1); return r; };
  function score(order, reference) {
    const a = ranks(order), b = ranks(reference);
    const errors = a.map((v, i) => Math.abs(v - b[i]));
    const total = errors.reduce((a, b) => a + b, 0);
    return { errors, total, normalized: Math.round((1 - total / 72) * 1000) / 10 };
  }
  function move(order, from, to) {
    if (!validOrder(order) || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 11 || to < 0 || to > 11) throw new Error('올바른 순위 이동이 아닙니다.');
    const a = [...order]; a.splice(to, 0, ...a.splice(from, 1)); return a;
  }
  const fresh = () => ({version: 1, title: '과학적 의사결정 프로젝트', scenario: '', alias: '', groupName: '', personal: identity(), group: identity(), reference: identity(), confirmed: {personal: false, group: false, reference: false}, notes: {personal: Array(12).fill(''), group: Array(12).fill('')}, reflection: '', referenceLabel: '', demo: false});
  function validate(data) {
    if (!data || data.version !== 1) throw new Error('지원하는 활동 파일이 아닙니다.');
    const result = fresh();
    for (const k of ['personal', 'group', 'reference']) {
      if (!validOrder(data[k])) throw new Error(k + ': 순위 데이터가 올바르지 않습니다.');
      if (typeof data.confirmed?.[k] !== 'boolean') throw new Error('확정 상태가 올바르지 않습니다.');
      result[k] = [...data[k]]; result.confirmed[k] = data.confirmed[k];
    }
    for (const k of ['title', 'scenario', 'alias', 'groupName', 'reflection', 'referenceLabel']) {
      if (typeof data[k] !== 'string' || data[k].length > 5000) throw new Error('활동 텍스트가 올바르지 않습니다.');
      result[k] = data[k];
    }
    for (const k of ['personal', 'group']) {
      if (!Array.isArray(data.notes?.[k]) || data.notes[k].length !== 12 || data.notes[k].some(v => typeof v !== 'string' || v.length > 2000)) throw new Error('선택 근거 데이터가 올바르지 않습니다.');
      result.notes[k] = [...data.notes[k]];
    }
    result.demo = data.demo === true;
    return result;
  }
  function csvCell(value) {
    let s = String(value ?? '');
    if (/^[\s]*[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  root.RankCore = {ITEMS, identity, validOrder, ranks, score, move, fresh, validate, csvCell};
  if (typeof module !== 'undefined') module.exports = root.RankCore;
})(globalThis);
