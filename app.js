const DATA_URL = 'intermezzos.json';
let allData = [];

async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();
    allData = data.delivered || [];
    
    document.getElementById('totalCount').textContent = `${allData.length} unique facts collected`;
    
    // Widget: Show latest fact
    if (allData.length > 0) {
      const latest = allData[0];
      document.getElementById('widgetFact').textContent = latest.fact.substring(0, 150) + (latest.fact.length > 150 ? '...' : '');
    }
    
    renderFilters();
    renderGrid(allData);
  } catch (e) {
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
    grid.innerHTML = '<div class="loading">No facts found.</div>';
    return;
  }
  
  grid.innerHTML = items.map((item, i) => `
    <div class="card" onclick="openModal(${i})">
      <div class="card-topic">${item.topic}</div>
      <div class="card-fact">${item.fact.substring(0, 120)}${item.fact.length > 120 ? '...' : ''}</div>
      <div class="card-meta">
        <span>${new Date(item.deliveredAt[0]).toLocaleDateString()}</span>
        <span>${item.sources?.length || 0} source${(item.sources?.length || 0) !== 1 ? 's' : ''}</span>
      </div>
    </div>
  `).join('');
}

function openModal(index) {
  const item = allData[index];
  document.getElementById('mTopic').textContent = item.topic;
  document.getElementById('mFact').textContent = item.fact;
  
  const sources = item.sources || [];
  document.getElementById('mSources').innerHTML = sources.length > 0 ? 
    `<h3>Sources</h3>` + sources.map(s => `<a href="${s}" target="_blank" class="source-link">${s}</a>`).join('') : '';
  
  document.getElementById('mDate').textContent = `Delivered: ${new Date(item.deliveredAt[0]).toLocaleString()}`;
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

loadData();
