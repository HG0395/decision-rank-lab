(function (root) {
  'use strict';
  const ITEMS = ['분말 소화기', '구급상자', '롱패딩과 담요', '정수기 10L 생수통', '대형 비닐 쓰레기봉투', '커터칼', '모의고사 시험지 뭉치', '건전지형 라디오', '스마트폰 및 보조배터리', '고열량 에너지바 1박스', '라이터', '고카페인 에너지 드링크'];
  const identity = () => ITEMS.map((_, i) => i);
  const REFERENCE = Object.freeze([0,1,2,3,4,5,6,7,8,9,10,11]);
  const REFERENCE_LABEL = '과학적 의사결정 프로젝트 자료 · 9쪽 고정 수업 기준';
  const SCENARIO = '차가운 바람이 부는 11월, 밤 9시. 야간 자율학습 중 내륙 지역에 규모 7.0의 지진이 발생했습니다. 계단과 외벽 일부가 무너져 모둠은 학교 4층 교실에 고립되었습니다.\n\n정전과 단수로 조명과 수돗물을 사용할 수 없고, 통신 기지국 파손으로 전화와 인터넷도 끊겼습니다. 여진이 계속되며 아래층에서 누전으로 추정되는 매캐한 연기 냄새가 납니다.\n\n이 수업에서는 구조대가 교실에 도착하기까지 최소 48시간이 걸린다고 가정합니다. 교실에 남은 12개 물품의 중요도를 판단하고, 그 근거를 모둠과 토론하세요.';
  const RATIONALE = Object.freeze([
    {category:'보호 · 화재 위험', reason:'자료는 아래층의 누전·연기라는 즉각적 위험을 고려해 1위로 배치합니다. 화재에 대응하는 물품의 가치를 토론하는 기준입니다.', detail:'소화기는 연기를 정화하는 장비가 아닙니다. 실제 사용은 작은 초기 화재, 사용 능력, 안전한 탈출 경로 등 조건을 충족할 때에 한합니다.'},
    {category:'보호 · 부상 대응', reason:'지진으로 생긴 파편과 낙하물에 의한 부상에 대응하기 위해 높은 순위로 둡니다. 출혈 등 신체 손상을 우선 살피는 판단과 연결됩니다.', detail:''},
    {category:'보호 · 체온 유지', reason:'11월 야간의 추위와 이틀간의 고립을 고려합니다. 옷과 담요 사이에 머무는 공기층이 열 손실을 줄이는 단열 원리를 적용합니다.', detail:''},
    {category:'물 · 식수 확보', reason:'수도 공급이 끊긴 상황에서 마실 물을 확보하는 물품입니다. 자료는 장기간의 음식 부족보다 먼저 수분 확보를 고려하도록 배치합니다.', detail:'10L가 모든 모둠에 충분하다는 뜻은 아닙니다. 필요한 양은 인원, 환경, 건강 상태에 따라 달라집니다.'},
    {category:'보호 · 방풍 보조', reason:'자료는 찬 바람을 줄이는 방풍재와 틈새를 가리는 보조재로 활용할 수 있다는 점을 평가합니다.', detail:'비닐은 방독·내화 장비가 아니며 연기로부터의 안전을 보장하지 않습니다. 모든 환기구를 무조건 밀폐하라는 지침으로 해석하지 마세요.'},
    {category:'도구 · 재료 가공', reason:'비닐, 담요, 시험지 등 교실 물품을 필요한 형태로 가공하는 도구의 가치를 평가합니다. 다른 물품의 활용을 돕는다는 점이 근거입니다.', detail:''},
    {category:'보호 · 바닥 단열', reason:'종이를 구겨 공기층을 만들거나 바닥에 덧대는 단열 보조재의 역할을 생각합니다. 차가운 바닥으로 전달되는 열을 줄이는 관점입니다.', detail:''},
    {category:'신호 · 정보 수신', reason:'전화·인터넷이 끊겼다는 시나리오에서 외부 재난 방송과 구조 정보를 듣는 수단으로 평가합니다.', detail:'라디오는 방송을 수신하는 도구이며, 이 물품만으로 구조 요청을 송신할 수 있다는 뜻은 아닙니다.'},
    {category:'신호 · 빛과 시야', reason:'통신 기능을 사용할 수 없더라도 화면·플래시의 빛과 보조배터리를 조명이나 위치를 알리는 신호에 활용할 수 있다는 판단입니다.', detail:''},
    {category:'음식 · 열량 보충', reason:'에너지바의 열량 보충 가치는 인정하되, 자료의 48시간 고립 가정에서는 즉각적인 위험 대응·보온·식수 확보보다 뒤에 배치합니다.', detail:'누구나 음식 없이 일정 시간을 안전하게 버틸 수 있다는 보장은 아닙니다.'},
    {category:'불 · 실내 점화 위험', reason:'불을 피우는 기능보다 가스 누출 가능성, 산소 소모와 연소 생성물의 위험을 우선 검토하도록 낮게 배치합니다.', detail:'자료의 불(Fire) 요소가 모든 상황에서 점화를 권장한다는 뜻은 아닙니다.'},
    {category:'음료 · 고카페인 주의', reason:'자료의 12위는 유지하되, 식수 확보를 고카페인 음료보다 우선하는 수업 기준으로 해석합니다. 많은 양의 카페인은 심박 증가·불안·수면 문제 등을 일으킬 수 있습니다.', detail:'카페인 음료를 마시면 반드시 급격한 탈수가 발생한다는 단정은 사용하지 않습니다. 반응은 섭취량과 개인에 따라 다릅니다.'}
  ].map(Object.freeze));
  function shuffled(random = Math.random) {
    const order = identity();
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i],order[j]] = [order[j],order[i]]; }
    if (order.every((id,i) => id === REFERENCE[i])) [order[0],order[1]] = [order[1],order[0]];
    return order;
  }
  const validOrder = a => Array.isArray(a) && a.length === 12 && new Set(a).size === 12 && a.every(v => Number.isInteger(v) && v >= 0 && v < 12);
  const ranks = a => { if (!validOrder(a)) throw new Error('1~12위가 중복 없이 모두 있어야 합니다.'); const r = []; a.forEach((id, i) => r[id] = i + 1); return r; };
  function score(order, reference = REFERENCE) {
    const a = ranks(order), b = ranks(reference);
    const errors = a.map((v, i) => Math.abs(v - b[i]));
    const total = errors.reduce((a, b) => a + b, 0);
    return { errors, total, normalized: Math.round((1 - total / 72) * 1000) / 10 };
  }
  function move(order, from, to) {
    if (!validOrder(order) || !Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 11 || to < 0 || to > 11) throw new Error('올바른 순위 이동이 아닙니다.');
    const a = [...order]; a.splice(to, 0, ...a.splice(from, 1)); return a;
  }
  function band(total) {
    if (!Number.isInteger(total) || total < 0 || total > 72 || total % 2 !== 0) throw new Error('오차 합계가 올바르지 않습니다.');
    const bands = [{max:12,grade:'S',range:'0~12',label:'기준에 매우 가까움'},{max:26,grade:'A',range:'14~26',label:'기준에 가까움'},{max:42,grade:'B',range:'28~42',label:'차이가 있는 물품 검토'},{max:56,grade:'C',range:'44~56',label:'판단 근거 다시 비교'},{max:72,grade:'D',range:'58~72',label:'기준과 큰 차이'}];
    return bands.find(b => total <= b.max);
  }
  const fresh = () => ({version: 2, lessonId: 'earthquake-classroom-v1', title: '과학적 의사결정 프로젝트', scenario: SCENARIO, activityNotes: '', alias: '', groupName: '', personal: shuffled(), group: shuffled(), reference: [...REFERENCE], confirmed: {personal: false, group: false, reference: true}, notes: {personal: Array(12).fill(''), group: Array(12).fill('')}, reflection: '', referenceLabel: REFERENCE_LABEL, demo: false});
  function validate(data) {
    if (!data || ![1,2].includes(data.version)) throw new Error('지원하는 활동 파일이 아닙니다.');
    const result = fresh();
    for (const k of ['personal', 'group']) {
      if (!validOrder(data[k])) throw new Error(k + ': 순위 데이터가 올바르지 않습니다.');
      if (typeof data.confirmed?.[k] !== 'boolean') throw new Error('확정 상태가 올바르지 않습니다.');
      result[k] = [...data[k]]; result.confirmed[k] = data.confirmed[k];
    }
    for (const k of ['title', 'alias', 'groupName', 'reflection']) {
      if (typeof data[k] !== 'string' || data[k].length > 5000) throw new Error('활동 텍스트가 올바르지 않습니다.');
      result[k] = data[k];
    }
    const activityNotes = data.version === 1 ? data.scenario : data.activityNotes;
    if (typeof activityNotes !== 'string' || activityNotes.length > 5000) throw new Error('활동 메모가 올바르지 않습니다.');
    result.activityNotes = activityNotes;
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
  root.RankCore = {ITEMS, REFERENCE, REFERENCE_LABEL, SCENARIO, RATIONALE, identity, shuffled, validOrder, ranks, score, band, move, fresh, validate, csvCell};
  if (typeof module !== 'undefined') module.exports = root.RankCore;
})(globalThis);
