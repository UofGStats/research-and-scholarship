<script>
(() => {
  const state = { opportunities: [], status: 'OPEN', query: '', funder: 'all', type: 'all' };
  const els = {
    search: document.getElementById('funding-search'),
    funder: document.getElementById('funder-filter'),
    type: document.getElementById('type-filter'),
    reset: document.getElementById('reset-filters'),
    table: document.getElementById('desktop-results'),
    tableBody: document.getElementById('funding-table-body'),
    cards: document.getElementById('mobile-results'),
    loading: document.getElementById('finder-loading'),
    error: document.getElementById('finder-error'),
    empty: document.getElementById('finder-empty'),
    count: document.getElementById('results-count'),
    drawer: document.getElementById('detail-drawer'),
    drawerContent: document.getElementById('drawer-content'),
    drawerClose: document.getElementById('drawer-close'),
    backdrop: document.getElementById('drawer-backdrop')
  };

  // This script is included across the Quarto website, but the finder controls
  // only exist on the Funding Finder page.
  if (!els.table || !els.drawer || !els.backdrop) return;

  // Quarto wraps page content in containers that can create their own stacking
  // contexts. Move the overlay elements to the document body so the drawer
  // always sits above its backdrop and remains interactive.
  document.body.append(els.backdrop, els.drawer);

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  const statusClass = status => status === 'OPEN' ? 'status-open' : status === 'FORTHCOMING' ? 'status-forthcoming' : status === 'DEADLINE PASSED' ? 'status-passed' : 'status-monitor';
  const statusLabel = status => status === 'OPEN' ? 'Open' : status === 'FORTHCOMING' ? 'Forthcoming' : status === 'DEADLINE PASSED' ? 'Deadline passed' : status.toLowerCase().includes('monitor') ? 'Monitor' : 'Closed';
  const tags = value => String(value || '').split(';').map(item => item.trim()).filter(Boolean);
  const searchText = item => Object.values(item).join(' ').toLowerCase();

  function isRolling(item) { return item.deadline_kind === 'rolling'; }
  function isMonitor(item) { return String(item.status || '').startsWith('CLOSED') || item.status === 'DEADLINE PASSED'; }
  function matchesStatus(item) {
    if (state.status === 'all') return true;
    if (state.status === 'RESEARCH') return item.area === 'Research' || item.area === 'Research and Scholarship';
    if (state.status === 'SCHOLARSHIP') return item.area === 'Scholarship' || item.area === 'Research and Scholarship';
    if (state.status === 'ROLLING') return isRolling(item);
    if (state.status === 'MONITOR') return isMonitor(item);
    return item.status === state.status;
  }

  function filteredItems() {
    const query = state.query.trim().toLowerCase();
    return state.opportunities.filter(item => matchesStatus(item)
      && (state.funder === 'all' || item.funder === state.funder)
      && (state.type === 'all' || item.type === state.type)
      && (!query || searchText(item).includes(query)));
  }

  function rowTemplate(item) {
    return `<tr>
      <td><span class="status-badge ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td>
      <td><span class="deadline-value">${escapeHtml(item.deadline_display)}</span><span class="row-detail">${escapeHtml(item.deadline_note || '')}</span></td>
      <td><button class="opportunity-button" type="button" data-id="${escapeHtml(item.id)}">${escapeHtml(item.opportunity)}</button><span class="row-detail">${escapeHtml(tags(item.theme_tags).join(' · '))}</span></td>
      <td>${escapeHtml(item.funder)}</td><td>${escapeHtml(item.type)}</td><td>${escapeHtml(item.funding_duration)}</td>
      <td><button class="details-button" type="button" data-id="${escapeHtml(item.id)}" aria-label="View details for ${escapeHtml(item.opportunity)}">›</button></td>
    </tr>`;
  }

  function cardTemplate(item) {
    return `<article class="funding-card">
      <div class="funding-card-top"><span class="status-badge ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span><span class="deadline-value">${escapeHtml(item.deadline_display)}</span></div>
      <h2>${escapeHtml(item.opportunity)}</h2><div class="card-funder">${escapeHtml(item.funder)} · ${escapeHtml(item.type)}</div>
      <div class="funding-card-footer"><div><small>Funding / duration</small>${escapeHtml(item.funding_duration)}</div><button class="details-button" type="button" data-id="${escapeHtml(item.id)}" aria-label="View details for ${escapeHtml(item.opportunity)}">›</button></div>
    </article>`;
  }

  function render() {
    const items = filteredItems();
    els.count.textContent = `${items.length} ${items.length === 1 ? 'opportunity' : 'opportunities'}`;
    els.tableBody.innerHTML = items.map(rowTemplate).join('');
    els.cards.innerHTML = items.map(cardTemplate).join('');
    els.empty.hidden = items.length !== 0;
    els.table.hidden = items.length === 0;
    els.cards.hidden = items.length === 0;
    document.querySelectorAll('[data-id]').forEach(button => button.addEventListener('click', () => openDrawer(button.dataset.id)));
  }

  function detailSection(title, body) {
    return `<section class="detail-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></section>`;
  }

  function openDrawer(id) {
    const item = state.opportunities.find(value => value.id === id);
    if (!item) return;
    els.drawerContent.innerHTML = `
      <div class="drawer-meta"><span class="status-badge ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span><span>${escapeHtml(item.funder)}</span></div>
      <h2 id="drawer-title">${escapeHtml(item.opportunity)}</h2>
      <div class="deadline-panel"><small>Deadline</small><strong>${escapeHtml(item.deadline_display)}</strong></div>
      ${detailSection('Funding / duration', item.funding_duration)}
      ${detailSection('Who can apply', item.eligibility)}
      ${detailSection('Why it matters for Statistics', item.statistics_relevance)}
      ${detailSection('Internal action / note', item.internal_note)}
      <div class="tag-list">${tags(item.theme_tags).map(tag => `<span class="theme-tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <a class="source-button" href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">View official opportunity</a>`;
    els.drawer.classList.add('is-open');
    els.drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    els.drawerClose.focus();
  }

  function closeDrawer() {
    els.drawer.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  }

  function populateSelect(select, values) {
    values.sort((a,b) => a.localeCompare(b)).forEach(value => select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`));
  }

  function updateCounts() {
    const data = state.opportunities;
    document.getElementById('count-all').textContent = data.length;
    document.getElementById('count-open').textContent = data.filter(x => x.status === 'OPEN').length;
    document.getElementById('count-research').textContent = data.filter(x => x.area === 'Research' || x.area === 'Research and Scholarship').length;
    document.getElementById('count-scholarship').textContent = data.filter(x => x.area === 'Scholarship' || x.area === 'Research and Scholarship').length;
    document.getElementById('count-forthcoming').textContent = data.filter(x => x.status === 'FORTHCOMING').length;
    document.getElementById('count-rolling').textContent = data.filter(isRolling).length;
    document.getElementById('count-monitor').textContent = data.filter(isMonitor).length;
  }

  document.querySelectorAll('.status-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.status-tab').forEach(item => { item.classList.remove('is-active'); item.setAttribute('aria-selected','false'); });
    tab.classList.add('is-active'); tab.setAttribute('aria-selected','true'); state.status = tab.dataset.status; render();
  }));
  els.search.addEventListener('input', event => { state.query = event.target.value; render(); });
  els.funder.addEventListener('change', event => { state.funder = event.target.value; render(); });
  els.type.addEventListener('change', event => { state.type = event.target.value; render(); });
  els.reset.addEventListener('click', () => {
    state.status = 'OPEN'; state.query = ''; state.funder = 'all'; state.type = 'all';
    els.search.value = ''; els.funder.value = 'all'; els.type.value = 'all';
    document.querySelectorAll('.status-tab').forEach(item => { const active = item.dataset.status === 'OPEN'; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
    render();
  });
  els.drawerClose.addEventListener('click', closeDrawer);
  document.addEventListener('click', event => {
    if (els.drawer.classList.contains('is-open') && !els.drawer.contains(event.target)) {
      closeDrawer();
    }
  }, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });

  fetch('data/funding-opportunities.json')
    .then(response => { if (!response.ok) throw new Error('Data request failed'); return response.json(); })
    .then(payload => {
      state.opportunities = payload.opportunities.map(item => ({
        ...item,
        status: typeof item.status === 'string' && item.status ? item.status : 'CLOSED – monitor recurrence'
      }));
      document.getElementById('last-reviewed').textContent = payload.last_reviewed;
      populateSelect(els.funder, [...new Set(state.opportunities.map(x => x.funder))]);
      populateSelect(els.type, [...new Set(state.opportunities.map(x => x.type))]);
      updateCounts(); els.loading.hidden = true; render();
    })
    .catch(() => { els.loading.hidden = true; els.error.hidden = false; });
})();
</script>
