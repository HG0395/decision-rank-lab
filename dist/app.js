(() => {
  'use strict';
  const C = RankCore, $ = id => document.getElementById(id), KEY = 'decision-rank-lab:v1';
  let state = C.fresh(), view = 'personal', pending = null;
  const labels = {personal: '개인', group: '모둠', reference: '기준'};
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function message(s) { $('message').textContent = s; }
  function persist() {
    if (!$('persist').checked) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); $('save-status').textContent = '현재 활동을 이 브라우저에 저장했습니다.'; }
    catch { $('save-status').textContent = '브라우저 저장 실패 · 활동 파일을 내려받으세요.'; }
  }
  function removeStored() { try { localStorage.removeItem(KEY); return true; } catch { message('저장본을 지우지 못했습니다. 브라우저 설정에서 이 사이트의 데이터를 삭제하세요.'); return false; } }
  function syncFields() {
    for (const k of ['title', 'alias', 'groupName', 'scenario', 'reflection', 'referenceLabel']) $(k).value = state[k];
    $('demo-banner').hidden = !state.demo;
  }
  function changeView(next, focus = false) {
    view = next;
    document.querySelectorAll('[data-view]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.view === view)));
    $('ranking-view').hidden = view === 'results'; $('results-view').hidden = view !== 'results';
    $('stage-label').textContent = view === 'reference' ? 'TEACHER / REFERENCE' : `ACTIVITY ${view === 'personal' ? '01' : view === 'group' ? '02' : '03'} / 03`;
    if (view === 'results') renderResults(); else renderRanking();
    if (focus) $('workspace').focus({preventScroll: true});
  }
  function updateChecks() { for (const k of ['personal', 'group']) $('check-' + k).textContent = state.confirmed[k] ? '✓' : '○'; }
  function renderRanking(focusId, focusControl = 'rank') {
    const teacher = view === 'reference';
    $('view-eyebrow').textContent = teacher ? 'SET YOUR CLASS REFERENCE' : view === 'personal' ? 'THINK FOR YOURSELF' : 'DISCUSS & DECIDE TOGETHER';
    $('view-title').textContent = teacher ? '수업의 기준 순위를 설정하세요' : view === 'personal' ? '무엇이 가장 필요할까요?' : '우리 모둠의 선택은 무엇인가요?';
    $('view-description').textContent = teacher ? '수업 상황에 맞는 기준과 그 근거를 확인한 뒤 확정하세요.' : view === 'personal' ? '생존에 중요하다고 생각하는 순서로 12개 물품을 배열하세요.' : '의견을 나누고 합의한 순서로 12개 물품을 배열하세요.';
    $('reference-info').hidden = !teacher;
    $('order-status').textContent = state.confirmed[view] ? `${labels[view]} 순위 확정됨 · 순위를 바꾸면 다시 확정해야 합니다.` : `${labels[view]} 순위 검토 중 · 중복 없이 1~12위가 유지됩니다.`;
    $('confirm-order').textContent = state.confirmed[view] ? `${labels[view]} 순위 확정 완료 ✓` : `${labels[view]} 순위 확정 →`;
    $('confirm-order').disabled = state.confirmed[view];
    $('confirmation-hint').textContent = teacher ? '확정한 기준은 결과 계산에 사용됩니다. 학생 토론이 끝난 뒤 입력해도 됩니다.' : '처음 배열은 활동지의 물품 목록 순서입니다. 검토한 뒤 순위를 확정하세요.';
    $('rank-list').innerHTML = state[view].map((id, i) => `<li class="rank-row" data-id="${id}"><div class="row-main"><span class="rank-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="item-name"><span class="item-id">물품 ${String(id + 1).padStart(2, '0')}</span>${esc(C.ITEMS[id])}</span><div class="rank-controls"><select data-action="rank" aria-label="${esc(C.ITEMS[id])} 순위">${C.ITEMS.map((_, j) => `<option value="${j}" ${i === j ? 'selected' : ''}>${j + 1}위</option>`).join('')}</select><button class="move" data-action="up" aria-label="${esc(C.ITEMS[id])} 한 순위 올리기" ${i === 0 ? 'disabled' : ''}>↑</button><button class="move" data-action="down" aria-label="${esc(C.ITEMS[id])} 한 순위 내리기" ${i === 11 ? 'disabled' : ''}>↓</button></div></div>${teacher ? '' : `<details class="note"><summary>판단 근거${state.notes[view][id] ? ' · 기록됨' : ' 기록'}</summary><textarea data-note="${id}" aria-label="${esc(C.ITEMS[id])} 판단 근거" maxlength="2000" rows="2" placeholder="어떤 상황에서, 어떤 이유로 필요한가요?">${esc(state.notes[view][id])}</textarea></details>`}</li>`).join('');
    updateChecks();
    if (focusId !== undefined) {
      const row = $('rank-list').querySelector(`[data-id="${focusId}"]`);
      const target = row.querySelector(`[data-action="${focusControl}"]`);
      (target?.disabled ? row.querySelector('select') : target)?.focus({preventScroll: true});
    }
  }
  function shift(id, to, control) {
    const from = state[view].indexOf(id); state[view] = C.move(state[view], from, to);
    state.confirmed[view] = false; persist(); renderRanking(id, control);
    $('order-status').textContent = `${C.ITEMS[id]}을(를) ${to + 1}위로 이동했습니다. 검토 후 다시 확정하세요.`;
  }
  $('rank-list').addEventListener('change', e => {
    if (e.target.matches('select')) shift(Number(e.target.closest('[data-id]').dataset.id), Number(e.target.value), 'rank');
  });
  $('rank-list').addEventListener('click', e => {
    const button = e.target.closest('button[data-action]'); if (!button) return;
    const id = Number(button.closest('[data-id]').dataset.id), from = state[view].indexOf(id);
    shift(id, from + (button.dataset.action === 'up' ? -1 : 1), button.dataset.action);
  });
  $('rank-list').addEventListener('input', e => {
    if (e.target.matches('[data-note]')) { state.notes[view][Number(e.target.dataset.note)] = e.target.value; persist(); }
  });
  document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', () => changeView(el.dataset.view, true)));
  for (const k of ['title', 'alias', 'groupName', 'scenario', 'reflection', 'referenceLabel']) $(k).addEventListener('input', e => { state[k] = e.target.value; persist(); });
  $('confirm-order').addEventListener('click', () => {
    state.confirmed[view] = true; persist(); updateChecks();
    message(`${labels[view]} 순위를 확정했습니다.`);
    changeView(view === 'personal' ? 'group' : 'results', true);
  });
  function confirmAction(text, fn) { pending = fn; $('dialog-description').textContent = text; $('confirm-dialog').showModal(); $('dialog-cancel').focus(); }
  $('dialog-cancel').addEventListener('click', () => { pending = null; $('confirm-dialog').close(); });
  $('dialog-ok').addEventListener('click', () => { const fn = pending; pending = null; $('confirm-dialog').close(); fn?.(); });
  $('confirm-dialog').addEventListener('cancel', () => { pending = null; });
  $('reset-order').addEventListener('click', () => confirmAction(`${labels[view]} 순위를 활동지 목록 순서로 되돌립니다. 기록한 근거는 유지됩니다.`, () => {state[view] = C.identity(); state.confirmed[view] = false; persist(); renderRanking(); message('현재 단계의 순위를 초기화했습니다.');}));
  function clearActivity() {
    const removed = removeStored(); state = C.fresh(); $('persist').checked = false; syncFields(); changeView('personal', true);
    $('save-status').textContent = removed ? '자동 저장 꺼짐 · 탭을 닫기 전 파일을 내려받으세요.' : '브라우저 저장본 삭제 실패 · 사이트 데이터를 직접 삭제하세요.';
    message('새 활동을 시작했습니다. 다운로드한 파일은 별도로 관리하세요.');
  }
  $('clear').addEventListener('click', () => confirmAction('현재 입력과 이 도구의 브라우저 저장본이 삭제됩니다. 필요한 활동 파일을 먼저 내려받으세요.', clearActivity));
  $('exit-demo').addEventListener('click', () => confirmAction('체험 데이터를 지우고 빈 활동을 시작합니다.', clearActivity));
  $('demo').addEventListener('click', () => confirmAction('현재 활동을 체험용 임의 데이터로 교체합니다. 중요한 기록은 먼저 활동 파일로 저장하세요. 예시 순위는 생존 정답이 아닙니다.', () => {
    state = C.fresh(); state.demo = true; state.alias = '체험 참여자'; state.groupName = '체험 모둠';
    state.personal = [8,1,3,2,9,0,7,10,4,5,6,11]; state.group = [1,3,8,2,0,9,7,4,10,5,6,11]; state.reference = [3,1,2,8,0,7,9,4,5,10,6,11];
    state.confirmed = {personal:true,group:true,reference:true}; state.referenceLabel = '체험용 임의 기준 · 실제 생존 답안 아님';
    syncFields(); persist(); changeView('results', true); message('체험 데이터를 열었습니다. 새 활동 시작으로 실제 활동을 진행하세요.');
  }));
  function renderResults() {
    const ready = state.confirmed.reference;
    const p = ready && state.confirmed.personal ? C.score(state.personal, state.reference) : null;
    const g = ready && state.confirmed.group ? C.score(state.group, state.reference) : null;
    const gain = p && g ? p.total - g.total : null;
    const status = !ready ? '교사용 기준 순위가 확정되지 않았습니다. 기준을 설정하면 오차 점수를 계산합니다.' : !p || !g ? '미확정 단계가 있습니다. 해당 순위를 확정하면 점수를 확인할 수 있습니다.' : '오차 합계가 작을수록 설정한 기준에 가깝습니다.';
    const pr = C.ranks(state.personal), gr = C.ranks(state.group), rr = C.ranks(state.reference);
    $('results-content').innerHTML = `<div class="notice">${esc(status)}${!ready ? '<button data-go-reference>기준 설정하기 →</button>' : ''}</div><div class="metrics"><article class="metric"><h3>개인 오차 점수</h3><strong>${p ? p.total : '—'} <small>점 / 72</small></strong><p>${p ? `환산 ${p.normalized} / 100점` : '개인·기준 확정 후 계산'}</p></article><article class="metric featured"><h3>모둠 오차 점수</h3><strong>${g ? g.total : '—'} <small>점 / 72</small></strong><p>${g ? `환산 ${g.normalized} / 100점` : '모둠·기준 확정 후 계산'}</p></article><article class="metric"><h3>모둠 토론 후 개선량</h3><strong>${gain === null ? '—' : gain > 0 ? '+' + gain : gain} <small>점</small></strong><p>${gain === null ? '두 점수 계산 후 비교' : gain > 0 ? '모둠이 기준에 더 가까워졌습니다.' : gain === 0 ? '개인과 모둠의 오차 합계가 같습니다.' : '개인이 기준에 더 가까웠습니다.'}</p></article></div><p class="result-note">${esc(state.title || '과학적 의사결정 프로젝트')}${state.alias ? ' · ' + esc(state.alias) : ''}${state.groupName ? ' · ' + esc(state.groupName) : ''}<br>기준: ${ready ? esc(state.referenceLabel || '사용자가 설정한 기준 (출처 미기재)') : '미설정'}</p>${state.scenario ? `<p class="result-note">상황: ${esc(state.scenario)}</p>` : ''}<div class="table-wrap" tabindex="0" role="region" aria-label="물품별 순위 비교 표. 좁은 화면에서는 가로로 스크롤하세요."><table><caption>물품별 순위와 오차 · 미확정 값은 — 표시</caption><thead><tr><th scope="col">생존 물품</th><th scope="col">개인</th><th scope="col">모둠</th><th scope="col">기준</th><th scope="col">개인 오차</th><th scope="col">모둠 오차</th></tr></thead><tbody>${C.ITEMS.map((name, id) => `<tr><th scope="row">${esc(name)}</th><td>${state.confirmed.personal ? pr[id] : '—'}</td><td>${state.confirmed.group ? gr[id] : '—'}</td><td>${ready ? rr[id] : '—'}</td><td class="error-cell">${p ? p.errors[id] : '—'}</td><td class="error-cell">${g ? g.errors[id] : '—'}</td></tr>`).join('')}</tbody></table></div><p class="result-note">오차 = |입력 순위 − 기준 순위| · 합계 0~72점 · 환산 = (1 − 합계 ÷ 72) × 100<br>이 결과는 입력한 기준과의 차이를 나타냅니다. <a href="#guide">계산식과 해석 보기</a></p>`;
    $('results-content').querySelector('[data-go-reference]')?.addEventListener('click', () => changeView('reference', true));
    $('csv-export').disabled = !p && !g;
  }
  $('persist').addEventListener('change', () => {
    if ($('persist').checked) persist(); else if(removeStored()) $('save-status').textContent = '저장본 삭제됨 · 현재 탭의 입력만 유지됩니다.';
  });
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], {type})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  $('json-export').addEventListener('click', () => {download('의사결정_활동.json', JSON.stringify(state, null, 2), 'application/json;charset=utf-8'); message('활동 파일을 내려받았습니다. 기준 순위·근거·후기가 포함됩니다.');});
  $('json-import').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      if (file.size > 200000) throw new Error('활동 파일은 200KB 이하여야 합니다.');
      const data = C.validate(JSON.parse(await file.text()));
      confirmAction('현재 활동을 이 파일의 내용으로 교체합니다. 브라우저 자동 저장이 켜져 있으면 저장본도 갱신합니다.', () => {state = data; syncFields(); persist(); changeView('personal', true); message('활동 파일을 열었습니다.');});
    } catch (error) { message('파일을 열지 못했습니다. ' + error.message); }
  });
  $('csv-export').addEventListener('click', () => {
    const p = state.confirmed.personal && state.confirmed.reference ? C.score(state.personal, state.reference) : null;
    const g = state.confirmed.group && state.confirmed.reference ? C.score(state.group, state.reference) : null;
    if (!p && !g) return;
    const pr = C.ranks(state.personal), gr = C.ranks(state.group), rr = C.ranks(state.reference);
    const rows = [['활동',state.title],['별칭',state.alias],['모둠',state.groupName],['상황',state.scenario],['기준 설명',state.referenceLabel],['체험 데이터',state.demo ? '예 · 실제 생존 답안 아님' : '아니오'],[],['물품','개인 순위','모둠 순위','기준 순위','개인 오차','모둠 오차','개인 근거','모둠 근거'], ...C.ITEMS.map((name,id) => [name,p ? pr[id] : '',g ? gr[id] : '',rr[id],p?.errors[id] ?? '',g?.errors[id] ?? '',state.notes.personal[id],state.notes.group[id]]),['오차 합계','','','',p?.total ?? '',g?.total ?? ''],['환산 점수 (100점)','','','',p?.normalized ?? '',g?.normalized ?? ''],['모둠 개선량',p && g ? p.total-g.total : ''],['활동 후기',state.reflection]];
    download('의사결정_비교결과.csv','\ufeff'+rows.map(r=>r.map(C.csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8'); message('비교 결과를 CSV로 내려받았습니다.');
  });
  $('print').addEventListener('click', () => window.print());
  try { const saved = localStorage.getItem(KEY); if (saved) {state = C.validate(JSON.parse(saved)); $('persist').checked = true; $('save-status').textContent = '이 브라우저에 저장된 활동을 복원했습니다.';} }
  catch { message('저장된 활동을 복원하지 못했습니다. 필요한 경우 활동 파일을 열어주세요.'); }
  syncFields(); changeView('personal');
})();
