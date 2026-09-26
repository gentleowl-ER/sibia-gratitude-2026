/* Public activity navigation only. All registration and uploads stay in the Google web app. */
(() => {
  'use strict';
  const APP = null; // Google Form remains unpublished during setup/QA.
  const awards = window.SIBIA_AWARDS || [];
  const selected = new Set();
  let group = '全部';
  const grid = document.getElementById('award-grid');
  const search = document.getElementById('search');
  const dialog = document.getElementById('award-dialog');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const symbols = {book:'▱',globe:'◎',sun:'☼',sprout:'❧',pen:'✎',art:'✧',heart:'♡',gift:'✳',medal:'✺'};
  function applicationUrl(ids = [...selected]) {
    if (!APP) return new URL('#intake-status', window.location.href).href;
    const url = new URL(APP);
    if (ids.length) url.searchParams.set('awards', ids.filter(id => awards.some(a => a.id === id)).join(','));
    return url.href;
  }
  function updateLinks() {
    document.querySelectorAll('[data-apply]').forEach(link => { link.href = applicationUrl(); });
    document.getElementById('selection').hidden = selected.size === 0;
    document.getElementById('count').textContent = String(selected.size);
  }
  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const shown = awards.filter(a => (group === '全部' || a.group === group) && (!term || [a.name,a.en,a.audience,a.note,a.group,a.code].join(' ').toLocaleLowerCase().includes(term)));
    grid.innerHTML = shown.map(a => `<article class="award-card${selected.has(a.id) ? ' selected' : ''}" data-id="${esc(a.id)}"><div class="card-head"><span class="card-code">${esc(a.code)} · ${esc(a.group)}</span><span class="card-symbol" aria-hidden="true">${symbols[a.icon] || '✳'}</span></div><h3>${esc(a.name)}</h3><small class="card-en">${esc(a.en)}</small><p class="audience">${esc(a.audience)}</p><div class="prize"><span>${esc(a.prize)}</span><strong>${esc(a.amount)} <small>USD</small></strong></div><div class="card-actions"><button type="button" class="detail-button" data-detail="${esc(a.id)}" aria-label="查看${esc(a.name)}資格及表格">資格與表格 ↗</button><button type="button" class="select-button" data-select="${esc(a.id)}" aria-pressed="${selected.has(a.id)}" aria-label="${selected.has(a.id) ? '取消選擇' : '選擇'}${esc(a.name)}">${selected.has(a.id) ? '✓ 已選擇' : '＋ 加入申請'}</button></div></article>`).join('');
    document.getElementById('empty').hidden = shown.length > 0;
    updateLinks();
  }
  function toggle(id) {
    if (!awards.some(a => a.id === id)) return;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    render();
    grid.querySelector(`[data-select="${id}"]`)?.focus({preventScroll:true});
  }
  function details(id) {
    const a = awards.find(item => item.id === id);
    if (!a) return;
    document.getElementById('detail').innerHTML = `<p class="eyebrow muted">${esc(a.code)} / ${esc(a.group)}</p><h2 id="award-title">${esc(a.name)}</h2><small>${esc(a.en)}</small><h3>申請對象</h3><p>${esc(a.audience)}</p><h3>名額與金額</h3><p>${esc(a.prize)} · ${esc(a.amount)} 美元。實際名額及金額仍依原簡章及評審結果。</p><h3>表格與線上附件</h3><p><b>${esc(a.forms)}</b><br>${esc(a.paper)}</p><h3>重要提醒</h3><p>${esc(a.note)}</p><small>來源：2026.09.26 修訂簡章「${esc(a.source)}」。本摘要不代替資格審核。</small><br><button type="button" class="button" id="detail-select">${selected.has(id) ? '取消選擇此獎項' : '將此獎项加入申請'}</button>`;
    document.getElementById('detail-select').addEventListener('click', () => { dialog.close(); toggle(id); });
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
  }
  grid.addEventListener('click', event => {
    const select = event.target.closest('[data-select]');
    const detail = event.target.closest('[data-detail]');
    if (select) toggle(select.dataset.select);
    else if (detail) details(detail.dataset.detail);
  });
  document.querySelectorAll('[data-group]').forEach(button => button.addEventListener('click', () => {
    group = button.dataset.group;
    document.querySelectorAll('[data-group]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active',active);
      item.setAttribute('aria-pressed',String(active));
    });
    render();
  }));
  search.addEventListener('input', render);
  document.getElementById('clear').addEventListener('click', () => { selected.clear(); render(); });
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  render();
})();
