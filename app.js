// =============================================
// CIUDAD GRIS — App Logic
// =============================================

// State
let EVENTS = [];
let activeFilter = 'all';
let activeDateFilter = 'all';

// Date helpers
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const DAYS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DAYS_SHORT = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];

const TYPE_LABELS = { musica:'Música', arte:'Arte', feria:'Feria', gastro:'Gastronomía', teatro:'Teatro' };

const ICON = {
  clock: `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  pin: `<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`
};

function getEventDate(s) { const p=s.split('-'); return new Date(p[0],p[1]-1,p[2]); }
function toDateKey(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function classifyDate(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate()+7);
  const d = getEventDate(dateStr);
  if (d.getTime()===today.getTime()) return 'hoy';
  if (d.getTime()===tomorrow.getTime()) return 'mañana';
  if (d<=weekEnd) return 'esta semana';
  return 'próximamente';
}

function formatFullDate(dateStr) {
  const d = getEventDate(dateStr);
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

// =============================================
// PLACEHOLDER SVGs
// =============================================
const PLACEHOLDERS = {
  musica: (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a1520"/><stop offset="100%" stop-color="#4a1a2a"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gm)"/><circle cx="${w*0.3}" cy="${h*0.6}" r="${h*0.18}" fill="none" stroke="#c43e2a" stroke-width="2" opacity="0.3"/><circle cx="${w*0.3}" cy="${h*0.6}" r="${h*0.06}" fill="#c43e2a" opacity="0.4"/><text x="${w*0.7}" y="${h*0.5}" font-family="serif" font-size="${h*0.12}" fill="#c43e2a" opacity="0.2" text-anchor="middle">♪</text></svg>`,
  arte: (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a2030"/><stop offset="100%" stop-color="#1a2a4a"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#ga)"/><rect x="${w*0.2}" y="${h*0.2}" width="${w*0.6}" height="${h*0.6}" rx="4" fill="none" stroke="#2a6bc4" stroke-width="1.5" opacity="0.25"/><circle cx="${w*0.4}" cy="${h*0.45}" r="${h*0.08}" fill="#2a6bc4" opacity="0.15"/></svg>`,
  feria: (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a2010"/><stop offset="100%" stop-color="#3a2a10"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gf)"/><rect x="${w*0.15}" y="${h*0.4}" width="${w*0.2}" height="${h*0.3}" rx="4" fill="#c4892a" opacity="0.15"/><rect x="${w*0.4}" y="${h*0.3}" width="${w*0.2}" height="${h*0.4}" rx="4" fill="#c4892a" opacity="0.12"/><rect x="${w*0.65}" y="${h*0.35}" width="${w*0.2}" height="${h*0.35}" rx="4" fill="#c4892a" opacity="0.18"/></svg>`,
  gastro: (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#102520"/><stop offset="100%" stop-color="#0a3020"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gg)"/><circle cx="${w*0.5}" cy="${h*0.48}" r="${h*0.22}" fill="none" stroke="#2aaa6c" stroke-width="1.5" opacity="0.2"/><ellipse cx="${w*0.5}" cy="${h*0.48}" rx="${h*0.14}" ry="${h*0.06}" fill="#2aaa6c" opacity="0.12"/></svg>`,
  teatro: (w,h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="gt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#201828"/><stop offset="100%" stop-color="#2a1838"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#gt)"/><path d="M${w*0.25} ${h*0.25}Q${w*0.25} ${h*0.6} ${w*0.42} ${h*0.6}" stroke="#8a3ec4" stroke-width="1.5" fill="none" opacity="0.2"/><path d="M${w*0.75} ${h*0.25}Q${w*0.75} ${h*0.6} ${w*0.58} ${h*0.6}" stroke="#8a3ec4" stroke-width="1.5" fill="none" opacity="0.2"/></svg>`
};

function getPlaceholder(tipo) {
  const fn = PLACEHOLDERS[tipo] || PLACEHOLDERS.arte;
  return `data:image/svg+xml,${encodeURIComponent(fn(600,400))}`;
}

// =============================================
// AIRTABLE FETCH
// =============================================
async function fetchEvents() {
  const url = `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE_TABLE)}?sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=asc&maxRecords=50`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${CONFIG.AIRTABLE_TOKEN}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error ${res.status}`);
  }

  const data = await res.json();

  return data.records.map(r => {
    const f = r.fields;
    let imageUrl = '';
    if (f.Imagen) {
      if (Array.isArray(f.Imagen) && f.Imagen[0]?.url) imageUrl = f.Imagen[0].url;
      else if (typeof f.Imagen === 'string') imageUrl = f.Imagen;
    }
    return {
      nombre: f.Nombre || '(Sin nombre)',
      tipo: f.Tipo || 'arte',
      fecha: f.Fecha || '',
      hora: f.Hora || '',
      lugar: f.Lugar || '',
      direccion: f.Direccion || f.Dirección || '',
      distrito: f.Distrito || '',
      precio: f.Precio || '',
      descripcion: f.Descripcion || f.Descripción || '',
      imagen: imageUrl,
      link: f.Link || '#',
      destacado: f.Destacado === true || f.Destacado === 'true'
    };
  }).filter(e => e.fecha); // Only events with a date
}

// =============================================
// DATE BAR
// =============================================
function buildDateBar() {
  const row = document.getElementById('dateRow');
  row.innerHTML = '';
  const eventDates = new Set(EVENTS.map(e => e.fecha));

  const allChip = document.createElement('button');
  allChip.className = 'date-chip active';
  allChip.dataset.date = 'all';
  allChip.innerHTML = `<span class="d-weekday">TODAS</span><span class="d-number">•</span>`;
  allChip.onclick = () => setDateFilter('all');
  row.appendChild(allChip);

  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const hasEvents = eventDates.has(key);
    const chip = document.createElement('button');
    chip.className = 'date-chip' + (hasEvents ? ' has-events' : '');
    chip.dataset.date = key;
    chip.innerHTML = `<span class="d-weekday">${DAYS_SHORT[d.getDay()]}</span><span class="d-number">${d.getDate()}</span>`;
    chip.onclick = () => setDateFilter(key);
    row.appendChild(chip);
  }
}

function setDateFilter(key) {
  activeDateFilter = key;
  document.querySelectorAll('.date-chip').forEach(c => c.classList.toggle('active', c.dataset.date === key));
  render();
}

// =============================================
// RENDER
// =============================================
function render() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  let filtered = EVENTS;
  if (activeFilter !== 'all') filtered = filtered.filter(e => e.tipo === activeFilter);
  if (activeDateFilter !== 'all') filtered = filtered.filter(e => e.fecha === activeDateFilter);

  if (filtered.length === 0) {
    document.getElementById('noResults').classList.add('visible');
    return;
  }
  document.getElementById('noResults').classList.remove('visible');

  if (activeDateFilter !== 'all') {
    const section = document.createElement('section');
    section.className = 'time-section';
    section.innerHTML = `<h2 class="time-label">${formatFullDate(activeDateFilter)} <span class="count">${filtered.length}</span></h2>`;
    const grid = document.createElement('div');
    grid.className = 'events-grid';
    filtered.forEach((evt, i) => grid.appendChild(buildCard(evt, i)));
    section.appendChild(grid);
    main.appendChild(section);
    return;
  }

  const groups = {};
  const order = ['hoy','mañana','esta semana','próximamente'];
  const labels = { hoy:'Hoy', mañana:'Mañana', 'esta semana':'Esta semana', próximamente:'Próximamente' };

  filtered.forEach(e => {
    const key = classifyDate(e.fecha);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });

  let idx = 0;
  order.forEach(key => {
    if (!groups[key]) return;
    const section = document.createElement('section');
    section.className = 'time-section';
    section.innerHTML = `<h2 class="time-label">${labels[key]} <span class="count">${groups[key].length}</span></h2>`;
    const grid = document.createElement('div');
    grid.className = 'events-grid';
    groups[key].forEach(evt => grid.appendChild(buildCard(evt, idx++)));
    section.appendChild(grid);
    main.appendChild(section);
  });
}

function buildCard(evt, idx) {
  const d = getEventDate(evt.fecha);
  const card = document.createElement('article');
  card.className = 'event-card' + (evt.destacado ? ' featured' : '');
  card.style.animationDelay = `${idx * 0.06}s`;
  card.onclick = () => openDetail(evt);

  const priceClass = evt.precio === 'Gratis' ? 'free' : '';
  const imgSrc = evt.imagen || getPlaceholder(evt.tipo);
  const imgError = evt.imagen ? ` onerror="this.src='${getPlaceholder(evt.tipo)}'"` : '';

  card.innerHTML = `
    <div class="card-img-wrap">
      <img class="card-img" src="${imgSrc}"${imgError} alt="${evt.nombre}" loading="lazy">
      <div class="card-date-badge">
        <span class="day">${d.getDate()}</span>
        <span class="month">${MONTHS_SHORT[d.getMonth()]}</span>
      </div>
      <div class="card-type-tag ${evt.tipo}">${TYPE_LABELS[evt.tipo] || evt.tipo}</div>
      <div class="card-price-badge ${priceClass}">${evt.precio}</div>
    </div>
    <div class="card-info">
      <h3 class="card-name">${evt.nombre}</h3>
      <div class="card-details">
        <span class="card-detail">${ICON.clock} ${evt.hora}</span>
        <span class="card-detail">${ICON.pin} ${evt.lugar}, ${evt.distrito}</span>
      </div>
    </div>
  `;
  return card;
}

// =============================================
// FILTERS
// =============================================
document.getElementById('filterBar').addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeFilter = chip.dataset.filter;
  render();
});

// =============================================
// DETAIL PANEL
// =============================================
function openDetail(evt) {
  const imgSrc = evt.imagen || getPlaceholder(evt.tipo);
  const imgError = evt.imagen ? ` onerror="this.src='${getPlaceholder(evt.tipo)}'"` : '';
  document.getElementById('detailHeroWrap').innerHTML = `<img src="${imgSrc}"${imgError} alt="${evt.nombre}">`;

  const tag = document.getElementById('detailTag');
  tag.textContent = TYPE_LABELS[evt.tipo] || evt.tipo;
  tag.style.background = `var(--${evt.tipo}, var(--accent))`;

  document.getElementById('detailTitle').textContent = evt.nombre;
  document.getElementById('detailDate').textContent = formatFullDate(evt.fecha);
  document.getElementById('detailTime').textContent = evt.hora;
  document.getElementById('detailPlace').textContent = evt.lugar;
  document.getElementById('detailDistrict').textContent = `${evt.distrito} · ${evt.direccion}`;
  document.getElementById('detailPrice').textContent = evt.precio === 'Gratis' ? 'Entrada libre' : evt.precio;

  let body = evt.descripcion;
  if (!body.includes('<p>')) body = body.split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('');
  document.getElementById('detailDesc').innerHTML = body;
  document.getElementById('detailCta').href = evt.link;

  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function shareEvent() {
  const title = document.getElementById('detailTitle').textContent;
  const date = document.getElementById('detailDate').textContent;
  const place = document.getElementById('detailPlace').textContent;
  const text = `${title} — ${date} en ${place}. Encontrado en Ciudad Gris`;
  if (navigator.share) {
    navigator.share({ title: 'Ciudad Gris', text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.querySelector('.detail-cta-secondary');
      btn.textContent = '¡Copiado!';
      setTimeout(() => { btn.textContent = 'Compartir evento'; }, 2000);
    });
  }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

// =============================================
// INIT
// =============================================
async function init() {
  const now = new Date();
  document.getElementById('headerDate').textContent =
    `${DAYS_ES[now.getDay()]} ${now.getDate()} de ${MONTHS_ES[now.getMonth()]}`.toUpperCase();

  // Show loading
  document.getElementById('loadingState').classList.add('visible');

  try {
    EVENTS = await fetchEvents();
    document.getElementById('loadingState').classList.remove('visible');

    if (EVENTS.length === 0) {
      document.getElementById('errorState').classList.add('visible');
      document.getElementById('errorMsg').textContent = 'La tabla está vacía. Agrega eventos en Airtable.';
      return;
    }

    buildDateBar();
    render();
  } catch (err) {
    document.getElementById('loadingState').classList.remove('visible');
    document.getElementById('errorState').classList.add('visible');
    document.getElementById('errorMsg').textContent =
      `${err.message}. Revisa que config.js tenga los datos correctos de Airtable.`;
  }
}

init();
