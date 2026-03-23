const DATA_URL = 'intermezzos.json';
let allData = [];

async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();
    allData = data.delivered || [];
    
    document.getElementById('totalCount').textContent = `${allData.length} unique facts collected`;
    
    if (allData.length > 0) {
      const latest = allData[0];
      document.getElementById('widgetFact').textContent = latest.fact.substring(0, 150) + (latest.fact.length > 150 ? '...' : '');
    }
    
    renderFilters();
    renderGrid(allData);
  } catch (e) {
    console.error(e);
    document.getElementById('grid').innerHTML = '<div class="loading">Failed to load facts. Pull to refresh.</div>';
  }
}

function renderFilters() {
  const topics = [...new Set(allData.map(d => d.topic))];
  const container = document.getElementById('filters');
  
  let html = `<button class="filter-btn active" onclick="filterBy('all')">All</button>`;
  topics.forEach(t => {
    html += `<button class="filter-btn" onclick="filterBy('${t}')">${t}</button>`;
  });
  container.innerHTML = html;
}

function filterBy(topic) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  const filtered = topic === 'all' ? allData : allData.filter(d => d.topic === topic);
  renderGrid(filtered);
}

function renderGrid(items) {
  const grid = document.getElementById('grid');
  if (items.length === 0) {
    grid.innerHTML = '<div class="loading">No facts found.</div>';
    return;
  }
  
  grid.innerHTML = items.map((item, i) => {
    const sources = item.sources || [];
    const srcCount = sources.length;
    const hasSources = srcCount > 0;
    const sourceBadge = hasSources 
      ? `<span style="color:var(--accent)">${srcCount} source${srcCount !== 1 ? 's' : ''}</span>`
      : `<span style="color:#ff9f43">⚠️ Needs validation</span>`;
    
    return `
    <div class="card" onclick="openModal(${i})" style="${!hasSources ? 'border-color:#ff9f4344;' : ''}">
      <div class="card-topic">${item.topic}${!hasSources ? ' <span style="font-size:10px;background:#ff9f43;color:#000;padding:2px 6px;border-radius:4px;margin-left:6px;">UNVERIFIED</span>' : ''}</div>
      <div class="card-fact">${item.fact.substring(0, 120)}${item.fact.length > 120 ? '...' : ''}</div>
      <div class="card-meta">
        <span>${new Date(item.deliveredAt[0]).toLocaleDateString()}</span>
        ${sourceBadge}
      </div>
    </div>
  `}).join('');
}

function openModal(index) {
  const item = allData[index];
  document.getElementById('mTopic').textContent = item.topic;
  document.getElementById('mFact').textContent = item.fact;
  
  const sources = item.sources || [];
  if (sources.length > 0) {
    document.getElementById('mSources').innerHTML = 
      `<h3>Sources</h3>` + sources.map(s => `<a href="${s}" target="_blank" rel="noopener" class="source-link">🔗 ${s.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>`).join('');
  } else {
    document.getElementById('mSources').innerHTML = 
      `<h3 style="color:#ff9f43">⚠️ No Sources Recorded</h3>
       <p style="color:var(--muted);font-size:13px;line-height:1.5;">
         This fact hasn't been verified with credible sources yet. 
         Please validate independently before trusting or sharing.
       </p>
       <p style="color:var(--muted);font-size:12px;margin-top:8px;">
         💡 Help improve this archive: submit sources via GitHub issues
       </p>`;
  }
  
  document.getElementById('mDate').textContent = `Delivered: ${new Date(item.deliveredAt[0]).toLocaleString()}`;
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

loadData();
