const DATA_URL = 'intermezzos.json';
let allData = [];

function loadRandomFact() {
  try {
    if (!allData || allData.length === 0) {
      const el = document.getElementById('randomFact');
      if (el) el.textContent = 'Tap "🔄 Another Fact" to load!';
      return;
    }
    const random = allData[Math.floor(Math.random() * allData.length)];
    const el = document.getElementById('randomFact');
    if (el) el.textContent = random.fact;
  } catch(e) {
    console.error('loadRandomFact error:', e);
  }
}

async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error();
    const data = await res.json();
    allData = data.delivered || [];
    allData.sort((a, b) => (b.sources?.length ? 1 : 0) - (a.sources?.length ? 1 : 0));
    
    loadRandomFact();
    renderFilters();
    renderGrid(allData);
    
    document.getElementById('searchBox').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderGrid(q ? allData.filter(i => i.fact.toLowerCase().includes(q) || i.topic.toLowerCase().includes(q)) : allData);
    });
    
    setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches && localStorage.getItem('installDismissed') !== 'true') {
        document.getElementById('installBanner').classList.add('show');
      }
    }, 3000);
  } catch (e) {
    document.getElementById('randomFact').textContent = 'Pull down to refresh...';
    document.getElementById('grid').innerHTML = '<div class="loading">Failed to load. Pull down to refresh.</div>';
  }
}

function renderFilters() {
  const topics = [...new Set(allData.map(d => d.topic.split('/')[0]))];
  document.getElementById('filters').innerHTML = [`<button class="filter-btn active" onclick="filterBy('all')">All</button>`, ...topics.map(t => `<button class="filter-btn" onclick="filterBy('${t}')">${t}</button>`)].join('');
}

function filterBy(topic) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderGrid(topic === 'all' ? allData : allData.filter(d => d.topic.startsWith(topic)));
}

function renderGrid(items) {
  document.getElementById('grid').innerHTML = items.length === 0 ? '<div class="loading">No curiosities found.</div>' : items.map((item, i) => `
    <div class="card" onclick="openModal(${allData.indexOf(item)})">
      ${item.sources?.length > 0 ? '<div class="card-badge">✓ Verified</div>' : '<div class="card-badge unverified">⚠ Unverified</div>'}
      <div class="card-topic">${item.topic.split('/')[0]}</div>
      <div class="card-fact">${item.fact.substring(0, 140)}${item.fact.length > 140 ? '...' : ''}</div>
      <div class="card-footer"><span>${new Date(item.deliveredAt).toLocaleDateString('en-US', {month:'short',day:'numeric'})}</span><span class="read-more">Read story →</span></div>
    </div>
  `).join('');
}

function openModal(index) {
  const item = allData[index];
  document.getElementById('mTopic').textContent = item.topic;
  document.getElementById('mFact').textContent = item.fact;
  
  const sources = item.sources || [];
  document.getElementById('mSources').innerHTML = sources.length > 0 
    ? `<h3>Sources & References</h3>` + sources.map(s => `<a href="${s}" target="_blank" class="source-link">📖 ${s.replace(/^https?:\/\//,'').replace(/\/$/,'')}</a>`).join('')
    : '<p style="color:var(--muted);font-size:14px;">This fact needs verification from credible sources.</p>';
  
  document.getElementById('overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function showInstallGuide() {
  alert('🍎 To install:\n\n1. Tap Share button (box with arrow)\n2. Scroll and tap "Add to Home Screen"\n3. Tap "Add"\n\n✨ Done! Icon appears on home screen.');
}

function dismissInstall() {
  document.getElementById('installBanner').classList.remove('show');
  localStorage.setItem('installDismissed', 'true');
}

loadData();
