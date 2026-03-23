const DATA_URL = 'intermezzos.json';
let allData = [];

async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();
    allData = data.delivered || [];
    
    // Sort: verified first
    allData.sort((a, b) => {
      const aVerified = (a.sources && a.sources.length > 0) ? 1 : 0;
      const bVerified = (b.sources && b.sources.length > 0) ? 1 : 0;
      return bVerified - aVerified;
    });
    
    // Update stats
    const total = allData.length;
    const topics = [...new Set(allData.map(d => d.topic.split('/')[0]))];
    const verified = allData.filter(f => f.sources && f.sources.length > 0).length;
    
    document.getElementById('totalFacts').textContent = total;
    document.getElementById('topicsCount').textContent = topics.length;
    document.getElementById('verifiedCount').textContent = verified;
    
    renderFilters();
    renderGrid(allData);
    
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      if (!query) {
        renderGrid(allData);
      } else {
        const filtered = allData.filter(item => 
          item.fact.toLowerCase().includes(query) ||
          item.topic.toLowerCase().includes(query)
        );
        renderGrid(filtered);
      }
    });
    
  } catch (e) {
    console.error(e);
    document.getElementById('grid').innerHTML = '<div class="loading">Failed to load facts. Pull to refresh.</div>';
  }
}

function renderFilters() {
  const topics = [...new Set(allData.map(d => d.topic.split('/')[0]))];
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
  
  const filtered = topic === 'all' ? allData : allData.filter(d => d.topic.startsWith(topic));
  renderGrid(filtered);
}

function renderGrid(items) {
  const grid = document.getElementById('grid');
  if (items.length === 0) {
    grid.innerHTML = '<div class="loading">No facts found matching your search.</div>';
    return;
  }
  
  grid.innerHTML = items.map((item, i) => {
    const sources = item.sources || [];
    const srcCount = sources.length;
    const hasSources = srcCount > 0;
    const badgeClass = hasSources ? 'card-verified' : 'card-unverified';
    const badgeText = hasSources ? `✅ Verified (${srcCount})` : '⚠️ Unverified';
    
    return `
    <div class="card" onclick="openModal(${i})">
      <div class="${badgeClass}">${hasSources ? '✅ Verified' : '⚠️ Unverified'}</div>
      <div class="card-topic">${item.topic.split('/')[0]}</div>
      <div class="card-fact">${item.fact.substring(0, 140)}${item.fact.length > 140 ? '...' : ''}</div>
      <div class="card-meta">
        <span>${new Date(item.deliveredAt[0]).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        <div class="sources-badge">
          ${hasSources ? '<span class="source-icon">📚</span>' : ''}
          <span>${hasSources ? srcCount + ' source' + (srcCount !== 1 ? 's' : '') : 'Needs validation'}</span>
        </div>
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
      `<h3>📚 Verified Sources (${sources.length})</h3>` + 
      sources.map(s => `<a href="${s}" target="_blank" rel="noopener" class="source-link">🔗 ${s.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>`).join('');
  } else {
    document.getElementById('mSources').innerHTML = 
      `<h3 style="color:#f59e0b">⚠️ Needs Validation</h3>
       <p style="color:var(--muted);font-size:14px;line-height:1.6;">
         This fact hasn't been verified with credible sources yet. Please validate independently before trusting or sharing.
       </p>`;
  }
  
  document.getElementById('mDate').textContent = `First shared: ${new Date(item.deliveredAt[0]).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

loadData();
