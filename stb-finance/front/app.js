/* ─── STB Finance — app.js ─────────────────────────────────────────────────── */

const API = '';
const TOKEN_KEY = 'stb_jwt';
const PLAFOND_BNC = 77700;

// ─── Utils ──────────────────────────────────────────────────────────────────

const fmt = v => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.round(v * 100) / 100);
const fmtN = v => new Intl.NumberFormat('fr-FR').format(Math.round(v));
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function fmtDate(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function q(sel, ctx = document) { return ctx.querySelector(sel); }
function qa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// ─── Toast ──────────────────────────────────────────────────────────────────

let toastTimer;
function toast(msg, type = 'info') {
  const t = q('#toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ─── Confirm ────────────────────────────────────────────────────────────────

function confirm(title, msg) {
  return new Promise(resolve => {
    q('#confirm-title').textContent = title;
    q('#confirm-msg').textContent = msg;
    openModal('modal-confirm');
    const ok = q('#confirm-ok');
    const cancel = q('#confirm-cancel');
    const done = v => { closeModal('modal-confirm'); resolve(v); };
    ok.onclick = () => done(true);
    cancel.onclick = () => done(false);
  });
}

// ─── API client ─────────────────────────────────────────────────────────────

function token() { return sessionStorage.getItem(TOKEN_KEY); }

async function api(method, path, body, isFormData = false) {
  const headers = { Authorization: `Bearer ${token()}` };
  if (!isFormData && body) headers['Content-Type'] = 'application/json';
  const res = await fetch(API + path, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || 'Erreur');
  }
  if (res.status === 204) return null;
  return res.json();
}

const GET = (path) => api('GET', path);
const POST = (path, body) => api('POST', path, body);
const PUT = (path, body) => api('PUT', path, body);
const DEL = (path) => api('DELETE', path);

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login(password) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || 'Mot de passe incorrect');
  }
  const { token: t } = await res.json();
  sessionStorage.setItem(TOKEN_KEY, t);
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
}

function isLoggedIn() { return !!token(); }

// ─── Router ──────────────────────────────────────────────────────────────────

let currentSection = 'dashboard';

function navigate(section) {
  qa('.section').forEach(s => s.classList.remove('active'));
  qa('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = q(`#section-${section}`);
  if (!sec) return;
  sec.classList.add('active');
  const nav = q(`.nav-item[data-section="${section}"]`);
  if (nav) nav.classList.add('active');
  currentSection = section;
  loadSection(section);
}

function loadSection(section) {
  switch (section) {
    case 'dashboard': loadDashboard(); break;
    case 'tresorerie': loadTresorerie(); break;
    case 'repartition': loadRepartition(); break;
    case 'factures': loadFactures(); break;
    case 'depenses': loadDepenses(); break;
    case 'abonnements': loadAbonnements(); break;
    case 'comptes': loadComptes(); break;
    case 'transactions': loadTransactions(); break;
    case 'urssaf': loadURSSAF(); break;
    case 'objectifs-ca': loadObjectifsCA(); break;
    case 'objectifs-epargne': loadObjectifsEpargne(); break;
    case 'rapports': loadRapports(); break;
    case 'simulateur': loadSimulateur(); break;
    case 'import-export': /* static */ break;
    case 'options': loadOptions(); break;
  }
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function openModal(id) { q(`#${id}`).classList.remove('hidden'); }
function closeModal(id) { q(`#${id}`).classList.add('hidden'); }

function initModals() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal]');
    if (btn) closeModal(btn.dataset.modal);
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.add('hidden');
    }
  });
}

// ─── State cache ─────────────────────────────────────────────────────────────

const cache = {};
async function load(key, path) {
  if (!cache[key]) cache[key] = await GET(path);
  return cache[key] || [];
}
function invalidate(...keys) { keys.forEach(k => delete cache[k]); }

// ─── Charts ──────────────────────────────────────────────────────────────────

const COLORS = {
  navy: '#051833',
  blue: '#BAD1FD',
  violet: '#E4D1FE',
  brown: '#412F21',
  success: '#4CAF82',
  warning: '#E8A838',
  danger: '#E85454',
  muted: '#E8E8E4',
};

function drawBarChart(canvas, labels, datasets, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600;
  const H = canvas.height || 200;
  canvas.width = W;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 40, left: 56 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const allVals = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allVals, 1);
  const step = niceStep(maxVal);
  const yMax = Math.ceil(maxVal / step) * step;

  // grid
  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = 1;
  for (let v = 0; v <= yMax; v += step) {
    const y = pad.top + cH - (v / yMax) * cH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    ctx.fillStyle = '#6B6B6B';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmtShort(v), pad.left - 6, y + 4);
  }

  const groupW = cW / labels.length;
  const barCount = datasets.length;
  const barGap = 4;
  const barW = Math.max(4, (groupW - barGap * (barCount + 1)) / barCount);

  datasets.forEach((ds, di) => {
    ctx.fillStyle = ds.color || COLORS.navy;
    ds.data.forEach((v, i) => {
      const bH = (v / yMax) * cH;
      const x = pad.left + i * groupW + barGap + di * (barW + barGap);
      const y = pad.top + cH - bH;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barW, bH, 3) : ctx.rect(x, y, barW, bH);
      ctx.fill();
    });
  });

  // x labels
  ctx.fillStyle = '#6B6B6B';
  ctx.font = '11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    ctx.fillText(l, pad.left + i * groupW + groupW / 2, pad.top + cH + 18);
  });
}

function drawLineChart(canvas, labels, data, color = COLORS.navy) {
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600;
  const H = canvas.height || 200;
  canvas.width = W;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 16, bottom: 40, left: 56 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data, 1);
  const step = niceStep(maxVal);
  const yMax = Math.ceil(maxVal / step) * step;

  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = 1;
  for (let v = 0; v <= yMax; v += step) {
    const y = pad.top + cH - (v / yMax) * cH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    ctx.fillStyle = '#6B6B6B';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(fmtShort(v), pad.left - 6, y + 4);
  }

  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1 || 1)) * cW,
    y: pad.top + cH - (v / yMax) * cH,
  }));

  // fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, color + '33');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, pad.top + cH);
  ctx.lineTo(pts[0].x, pad.top + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // dots
  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.fillStyle = '#6B6B6B';
  ctx.font = '11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((l, i) => {
    ctx.fillText(l, pad.left + (i / (labels.length - 1 || 1)) * cW, pad.top + cH + 18);
  });
}

function drawDonutChart(canvas, labels, data, colors) {
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 300;
  const H = canvas.height || 280;
  canvas.width = W;
  ctx.clearRect(0, 0, W, H);

  const total = data.reduce((a, b) => a + b, 0);
  if (total === 0) return;

  const cx = W / 2;
  const cy = H / 2 - 20;
  const r = Math.min(cx, cy) - 10;
  const ir = r * 0.55;
  let angle = -Math.PI / 2;

  data.forEach((v, i) => {
    const slice = (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    angle += slice;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, ir, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '600 13px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(fmt(total), cx, cy + 5);

  const legendY = H - 30;
  const itemW = W / labels.length;
  labels.forEach((l, i) => {
    const lx = i * itemW + itemW / 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(lx - 20, legendY, 10, 10);
    ctx.fillStyle = '#6B6B6B';
    ctx.font = '11px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(l, lx - 6, legendY + 9);
  });
}

function niceStep(max) {
  const raw = max / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  if (norm < 1.5) return mag;
  if (norm < 3.5) return 2 * mag;
  if (norm < 7.5) return 5 * mag;
  return 10 * mag;
}

function fmtShort(v) {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return String(Math.round(v));
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

async function loadDashboard() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  q('#dash-period').textContent = `${month < 10 ? '0' + month : month}/${year}`;

  const [factures, depenses, comptes, urssaf] = await Promise.all([
    load('factures', '/api/factures'),
    load('depenses', '/api/depenses'),
    load('comptes', '/api/comptes'),
    load('urssaf', '/api/urssaf'),
  ]);

  const caAnnee = factures.filter(f => f.statut === 'payee' && f.date?.startsWith(year)).reduce((s, f) => s + (f.montant || 0), 0);
  const attente = factures.filter(f => f.statut === 'envoyee').reduce((s, f) => s + (f.montant || 0), 0);
  const depMois = depenses.filter(d => d.date?.startsWith(`${year}-${String(month).padStart(2, '0')}`)).reduce((s, d) => s + (d.montant || 0), 0);
  const soldeTotal = comptes.reduce((s, c) => s + (c.solde || 0), 0);

  q('#kpi-ca').textContent = fmt(caAnnee);
  q('#kpi-attente').textContent = fmt(attente);
  q('#kpi-depenses').textContent = fmt(depMois);
  q('#kpi-tresorerie').textContent = fmt(soldeTotal);

  // CA mensuel chart
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const caMois = months.map((_, mi) => {
    const key = `${year}-${String(mi + 1).padStart(2, '0')}`;
    return factures.filter(f => f.statut === 'payee' && f.date?.startsWith(key)).reduce((s, f) => s + (f.montant || 0), 0);
  });
  const cEl = q('#chart-ca-mensuel');
  if (cEl) drawBarChart(cEl, months, [{ data: caMois, color: COLORS.navy }]);

  // Répartition donut
  const urssafTotal = (caAnnee * 0.256);
  const cfpTotal = (caAnnee * 0.002);
  const pasTotal = 40 * 12;
  const depTotal = depenses.filter(d => d.date?.startsWith(year.toString())).reduce((s, d) => s + (d.montant || 0), 0);
  const net = caAnnee - urssafTotal - cfpTotal - pasTotal - depTotal;
  const rEl = q('#chart-repartition');
  if (rEl && caAnnee > 0) drawDonutChart(rEl, ['URSSAF', 'CFP', 'PAS', 'Dép.', 'Net'], [urssafTotal, cfpTotal, pasTotal, depTotal, Math.max(net, 0)], [COLORS.danger, COLORS.warning, COLORS.brown, COLORS.violet, COLORS.success]);

  // Recent factures
  const tbody = q('#dash-factures-list');
  const recent = [...factures].sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1).slice(0, 5);
  tbody.innerHTML = recent.length ? recent.map(f => `
    <div class="list-row">
      <span class="list-primary">${f.numero || '—'}</span>
      <span class="list-secondary">${f.client || '—'}</span>
      <span class="badge badge-${f.statut}">${f.statut}</span>
      <span class="list-amount">${fmt(f.montant || 0)}</span>
    </div>`).join('') : '<p class="empty">Aucune facture</p>';

  // URSSAF upcoming
  const ursEl = q('#dash-urssaf-list');
  const upcoming = (urssaf || []).filter(u => !u.paye).slice(0, 3);
  ursEl.innerHTML = upcoming.length ? upcoming.map(u => `
    <div class="list-row">
      <span class="list-primary">${u.label || u.cle}</span>
      <span class="list-secondary">Échéance ${fmtDate(u.echeance)}</span>
      <span class="list-amount ${u.alerte === 'rouge' ? 'text-danger' : ''}">${fmt(u.montant || 0)}</span>
    </div>`).join('') : '<p class="empty">Aucune échéance à venir</p>';
}

// ─── Trésorerie ──────────────────────────────────────────────────────────────

async function loadTresorerie() {
  const [comptes, factures] = await Promise.all([
    load('comptes', '/api/comptes'),
    load('factures', '/api/factures'),
  ]);

  const soldeTotal = comptes.reduce((s, c) => s + (c.solde || 0), 0);
  const principal = comptes.find(c => c.type === 'courant');
  const epargne = comptes.filter(c => c.type === 'epargne').reduce((s, c) => s + (c.solde || 0), 0);
  const aEncaisser = factures.filter(f => f.statut === 'envoyee').reduce((s, f) => s + (f.montant || 0), 0);

  q('#tres-solde-total').textContent = fmt(soldeTotal);
  q('#tres-principal').textContent = principal ? fmt(principal.solde || 0) : '—';
  q('#tres-epargne').textContent = fmt(epargne);
  q('#tres-a-encaisser').textContent = fmt(aEncaisser);

  // Evolution chart — compute running balance per month from transactions
  const txns = await load('transactions', '/api/transactions');
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const year = new Date().getFullYear();
  const balances = months.map((_, mi) => {
    const key = `${year}-${String(mi + 1).padStart(2, '0')}`;
    const credits = txns.filter(t => t.type === 'credit' && t.date?.startsWith(key)).reduce((s, t) => s + (t.montant || 0), 0);
    const debits = txns.filter(t => t.type === 'debit' && t.date?.startsWith(key)).reduce((s, t) => s + (t.montant || 0), 0);
    return credits - debits;
  });
  const running = balances.reduce((acc, v, i) => { acc.push((acc[i - 1] || 0) + v); return acc; }, []);
  const cEl = q('#chart-tresorerie');
  if (cEl) drawLineChart(cEl, months, running.map(v => Math.max(v, 0)), COLORS.navy);
}

// ─── Répartition ─────────────────────────────────────────────────────────────

async function loadRepartition() {
  const [settings, factures, depenses] = await Promise.all([
    load('settings', '/api/settings'),
    load('factures', '/api/factures'),
    load('depenses', '/api/depenses'),
  ]);

  const year = new Date().getFullYear();
  const caAnnee = factures.filter(f => f.statut === 'payee' && f.date?.startsWith(year)).reduce((s, f) => s + (f.montant || 0), 0);

  const pctV = settings.pctVersement || 65;
  const pctE = settings.pctEpargne || 15;
  const pctT = settings.pctTresorerie || 20;

  q('#rep-versement').textContent = fmt(caAnnee * pctV / 100);
  q('#rep-epargne').textContent = fmt(caAnnee * pctE / 100);
  q('#rep-tresorerie').textContent = fmt(caAnnee * pctT / 100);
  q('#rep-versement-pct').textContent = `${pctV}%`;
  q('#rep-epargne-pct').textContent = `${pctE}%`;
  q('#rep-tresorerie-pct').textContent = `${pctT}%`;

  const dEl = q('#chart-rep-donut');
  if (dEl) drawDonutChart(dEl, ['Versement', 'Épargne', 'Trésorerie'], [pctV, pctE, pctT], [COLORS.navy, COLORS.blue, COLORS.violet]);

  // Charges
  const urssaf = caAnnee * (settings.tauxUrssaf || 25.6) / 100;
  const cfp = caAnnee * (settings.tauxCfp || 0.2) / 100;
  const pas = (settings.pasFixe || 40) * 12;
  const dep = depenses.filter(d => d.date?.startsWith(year.toString())).reduce((s, d) => s + (d.montant || 0), 0);
  const cEl = q('#chart-rep-charges');
  if (cEl) drawBarChart(cEl, ['URSSAF', 'CFP', 'PAS', 'Dépenses'], [{ data: [urssaf, cfp, pas, dep], color: COLORS.brown }]);
}

// ─── Factures ────────────────────────────────────────────────────────────────

let facturesData = [];

async function loadFactures() {
  facturesData = await GET('/api/factures') || [];
  cache['factures'] = facturesData;
  renderFactures();
}

function renderFactures() {
  const search = q('#factures-search')?.value.toLowerCase() || '';
  const statut = q('#factures-filter-statut')?.value || '';
  let list = facturesData;
  if (search) list = list.filter(f => (f.numero + f.client + f.description).toLowerCase().includes(search));
  if (statut) list = list.filter(f => f.statut === statut);
  list = [...list].sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

  const tbody = q('#factures-tbody');
  tbody.innerHTML = list.length ? list.map(f => `
    <tr>
      <td class="font-mono">${f.numero || '—'}</td>
      <td>${f.client || '—'}</td>
      <td>${fmtDate(f.date)}</td>
      <td class="text-right">${fmt(f.montant || 0)}</td>
      <td><span class="badge badge-${f.statut}">${f.statut}</span></td>
      <td>
        <button class="pdf-btn ${f.pdfKey ? 'present' : 'vide'} btn-xs" onclick="viewOrUploadPdfFacture('${f.id}','${f.numero}')">
          <i class="ti ti-paperclip"></i>
        </button>
      </td>
      <td class="actions">
        <button class="btn-icon" onclick="editFacture('${f.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-icon btn-danger-icon" onclick="deleteFacture('${f.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" class="empty">Aucune facture</td></tr>';
}

function openFactureModal(data = {}) {
  q('#modal-facture-title').textContent = data.id ? 'Modifier la facture' : 'Nouvelle facture';
  q('#f-numero').value = data.numero || '';
  q('#f-statut').value = data.statut || 'brouillon';
  q('#f-client').value = data.client || '';
  q('#f-date').value = data.date || today();
  q('#f-echeance').value = data.echeance || '';
  q('#f-montant').value = data.montant || '';
  q('#f-description').value = data.description || '';
  q('#f-pdf-name').textContent = data.pdfKey ? 'PDF attaché' : '';
  q('#f-pdf-btn').className = `pdf-btn ${data.pdfKey ? 'present' : 'vide'}`;
  q('#btn-save-facture').dataset.id = data.id || '';
  q('#f-pdf-file').value = '';
  openModal('modal-facture');
}

async function saveFacture() {
  const id = q('#btn-save-facture').dataset.id;
  const body = {
    numero: q('#f-numero').value.trim(),
    statut: q('#f-statut').value,
    client: q('#f-client').value.trim(),
    date: q('#f-date').value,
    echeance: q('#f-echeance').value,
    montant: parseFloat(q('#f-montant').value) || 0,
    description: q('#f-description').value.trim(),
  };
  if (!body.numero || !body.client) { toast('Numéro et client requis', 'error'); return; }

  try {
    let saved;
    if (id) {
      saved = await PUT(`/api/factures/${id}`, body);
    } else {
      saved = await POST('/api/factures', body);
    }
    // upload PDF if selected
    const file = q('#f-pdf-file').files[0];
    if (file && saved?.id) {
      const fd = new FormData();
      fd.append('pdf', file);
      await api('POST', `/api/factures/${saved.id}/pdf`, fd, true);
    }
    invalidate('factures');
    closeModal('modal-facture');
    toast('Facture enregistrée', 'success');
    loadFactures();
  } catch (e) { toast(e.message, 'error'); }
}

async function editFacture(id) {
  const f = facturesData.find(x => x.id === id);
  if (f) openFactureModal(f);
}

async function deleteFacture(id) {
  const ok = await confirm('Supprimer la facture', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/factures/${id}`);
    invalidate('factures');
    toast('Facture supprimée');
    loadFactures();
  } catch (e) { toast(e.message, 'error'); }
}

async function viewOrUploadPdfFacture(id, numero) {
  const f = facturesData.find(x => x.id === id);
  if (f?.pdfKey) {
    const res = await GET(`/api/factures/${id}/pdf`);
    if (res?.url) window.open(res.url, '_blank');
  } else {
    q('#f-pdf-file').click();
    q('#f-pdf-file').onchange = async () => {
      const file = q('#f-pdf-file').files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('pdf', file);
      try {
        await api('POST', `/api/factures/${id}/pdf`, fd, true);
        invalidate('factures');
        toast('PDF attaché', 'success');
        loadFactures();
      } catch (e) { toast(e.message, 'error'); }
    };
  }
}

// ─── Dépenses ────────────────────────────────────────────────────────────────

let depensesData = [];

async function loadDepenses() {
  depensesData = await GET('/api/depenses') || [];
  cache['depenses'] = depensesData;

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const totalAnnee = depensesData.filter(d => d.date?.startsWith(year)).reduce((s, d) => s + (d.montant || 0), 0);
  const deductibles = depensesData.filter(d => d.deductible && d.date?.startsWith(year)).reduce((s, d) => s + (d.montant || 0), 0);
  const moisKey = `${year}-${String(month).padStart(2, '0')}`;
  const totalMois = depensesData.filter(d => d.date?.startsWith(moisKey)).reduce((s, d) => s + (d.montant || 0), 0);

  q('#dep-total-annee').textContent = fmt(totalAnnee);
  q('#dep-deductibles').textContent = fmt(deductibles);
  q('#dep-mois').textContent = fmt(totalMois);

  renderDepenses();
}

function renderDepenses() {
  const search = q('#depenses-search')?.value.toLowerCase() || '';
  const cat = q('#depenses-filter-cat')?.value || '';
  let list = depensesData;
  if (search) list = list.filter(d => (d.libelle || '').toLowerCase().includes(search));
  if (cat) list = list.filter(d => d.categorie === cat);
  list = [...list].sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

  const tbody = q('#depenses-tbody');
  tbody.innerHTML = list.length ? list.map(d => `
    <tr>
      <td>${fmtDate(d.date)}</td>
      <td>${d.libelle || '—'}</td>
      <td><span class="tag">${d.categorie || '—'}</span></td>
      <td class="text-right">${fmt(d.montant || 0)}</td>
      <td>${d.deductible ? '<i class="ti ti-check text-success"></i>' : '<i class="ti ti-x text-muted"></i>'}</td>
      <td>
        <button class="pdf-btn ${d.pdfKey ? 'present' : 'vide'} btn-xs" onclick="uploadPdfDepense('${d.id}')">
          <i class="ti ti-paperclip"></i>
        </button>
      </td>
      <td class="actions">
        <button class="btn-icon" onclick="editDepense('${d.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-icon btn-danger-icon" onclick="deleteDepense('${d.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" class="empty">Aucune dépense</td></tr>';
}

function openDepenseModal(data = {}) {
  q('#modal-depense-title').textContent = data.id ? 'Modifier la dépense' : 'Nouvelle dépense';
  q('#d-date').value = data.date || today();
  q('#d-categorie').value = data.categorie || 'logiciel';
  q('#d-libelle').value = data.libelle || '';
  q('#d-montant').value = data.montant || '';
  q('#d-deductible').checked = data.deductible !== false;
  q('#d-pdf-name').textContent = data.pdfKey ? 'PDF attaché' : '';
  q('#d-pdf-btn').className = `pdf-btn ${data.pdfKey ? 'present' : 'vide'}`;
  q('#btn-save-depense').dataset.id = data.id || '';
  q('#d-pdf-file').value = '';
  openModal('modal-depense');
}

async function saveDepense() {
  const id = q('#btn-save-depense').dataset.id;
  const body = {
    date: q('#d-date').value,
    categorie: q('#d-categorie').value,
    libelle: q('#d-libelle').value.trim(),
    montant: parseFloat(q('#d-montant').value) || 0,
    deductible: q('#d-deductible').checked,
  };
  if (!body.libelle) { toast('Libellé requis', 'error'); return; }
  try {
    let saved;
    if (id) { saved = await PUT(`/api/depenses/${id}`, body); }
    else { saved = await POST('/api/depenses', body); }
    const file = q('#d-pdf-file').files[0];
    if (file && saved?.id) {
      const fd = new FormData();
      fd.append('pdf', file);
      await api('POST', `/api/depenses/${saved.id}/pdf`, fd, true);
    }
    invalidate('depenses');
    closeModal('modal-depense');
    toast('Dépense enregistrée', 'success');
    loadDepenses();
  } catch (e) { toast(e.message, 'error'); }
}

async function editDepense(id) {
  const d = depensesData.find(x => x.id === id);
  if (d) openDepenseModal(d);
}

async function deleteDepense(id) {
  const ok = await confirm('Supprimer la dépense', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/depenses/${id}`);
    invalidate('depenses');
    toast('Dépense supprimée');
    loadDepenses();
  } catch (e) { toast(e.message, 'error'); }
}

async function uploadPdfDepense(id) {
  q('#d-pdf-file').click();
  q('#d-pdf-file').onchange = async () => {
    const file = q('#d-pdf-file').files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('pdf', file);
    try {
      await api('POST', `/api/depenses/${id}/pdf`, fd, true);
      invalidate('depenses');
      toast('PDF attaché', 'success');
      loadDepenses();
    } catch (e) { toast(e.message, 'error'); }
  };
}

// ─── Abonnements ─────────────────────────────────────────────────────────────

let abonnementsData = [];

async function loadAbonnements() {
  abonnementsData = await GET('/api/abonnements') || [];
  cache['abonnements'] = abonnementsData;
  const actifs = abonnementsData.filter(a => a.actif !== false);
  const mensuel = actifs.reduce((s, a) => {
    const m = a.periodicite === 'annuel' ? a.montant / 12 : a.periodicite === 'trimestriel' ? a.montant / 3 : a.montant;
    return s + m;
  }, 0);
  const annuel = mensuel * 12;
  q('#abo-mensuel').textContent = fmt(mensuel);
  q('#abo-annuel').textContent = fmt(annuel);
  q('#abo-count').textContent = actifs.length;
  renderAboCalendar();
  renderAboList();
}

function renderAboCalendar() {
  const cal = q('#abo-calendar');
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  cal.innerHTML = `<div class="abo-cal-title">Prélèvements par jour du mois</div>
  <div class="abo-cal-grid">${days.map(d => {
    const aboDay = abonnementsData.filter(a => a.actif !== false && a.jour === d);
    return `<div class="abo-day ${aboDay.length ? 'has-abo' : ''}">
      <span class="abo-day-num">${d}</span>
      ${aboDay.map(a => `<span class="abo-day-item" title="${a.nom}">${a.nom.slice(0, 3)}</span>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

function renderAboList() {
  const list = q('#abo-list');
  list.innerHTML = abonnementsData.length ? abonnementsData.map(a => `
    <div class="abo-row ${a.actif === false ? 'abo-inactif' : ''}">
      <span class="abo-nom">${a.nom}</span>
      <span class="tag">${a.categorie || 'autre'}</span>
      <span class="abo-period">${a.periodicite}</span>
      <span class="abo-montant">${fmt(a.montant)}</span>
      <span class="abo-jour">Jour ${a.jour || '—'}</span>
      <div class="actions">
        <button class="btn-icon" onclick="editAbonnement('${a.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-icon btn-danger-icon" onclick="deleteAbonnement('${a.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('') : '<p class="empty">Aucun abonnement</p>';
}

function openAbonnementModal(data = {}) {
  q('#modal-abonnement-title').textContent = data.id ? 'Modifier' : 'Nouvel abonnement';
  q('#abo-nom').value = data.nom || '';
  q('#abo-montant').value = data.montant || '';
  q('#abo-periodicite').value = data.periodicite || 'mensuel';
  q('#abo-jour').value = data.jour || '';
  q('#abo-categorie').value = data.categorie || 'logiciel';
  q('#abo-actif').checked = data.actif !== false;
  q('#btn-save-abonnement').dataset.id = data.id || '';
  openModal('modal-abonnement');
}

async function saveAbonnement() {
  const id = q('#btn-save-abonnement').dataset.id;
  const body = {
    nom: q('#abo-nom').value.trim(),
    montant: parseFloat(q('#abo-montant').value) || 0,
    periodicite: q('#abo-periodicite').value,
    jour: parseInt(q('#abo-jour').value) || null,
    categorie: q('#abo-categorie').value,
    actif: q('#abo-actif').checked,
  };
  if (!body.nom) { toast('Nom requis', 'error'); return; }
  try {
    if (id) await PUT(`/api/abonnements/${id}`, body);
    else await POST('/api/abonnements', body);
    invalidate('abonnements');
    closeModal('modal-abonnement');
    toast('Abonnement enregistré', 'success');
    loadAbonnements();
  } catch (e) { toast(e.message, 'error'); }
}

async function editAbonnement(id) {
  const a = abonnementsData.find(x => x.id === id);
  if (a) openAbonnementModal(a);
}

async function deleteAbonnement(id) {
  const ok = await confirm('Supprimer l\'abonnement', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/abonnements/${id}`);
    invalidate('abonnements');
    toast('Abonnement supprimé');
    loadAbonnements();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Comptes ─────────────────────────────────────────────────────────────────

let comptesData = [];

async function loadComptes() {
  comptesData = await GET('/api/comptes') || [];
  cache['comptes'] = comptesData;
  renderComptes();
}

function renderComptes() {
  const grid = q('#comptes-grid');
  grid.innerHTML = comptesData.length ? comptesData.map(c => `
    <div class="compte-card">
      <div class="compte-header">
        <span class="compte-nom">${c.nom}</span>
        <span class="tag">${c.type}</span>
      </div>
      <div class="compte-solde">${fmt(c.solde || 0)}</div>
      ${c.iban ? `<div class="compte-iban">${c.iban}</div>` : ''}
      <div class="compte-actions">
        <button class="btn-ghost btn-sm" onclick="editCompte('${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-ghost btn-sm text-danger" onclick="deleteCompte('${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('') : '<p class="empty">Aucun compte bancaire</p>';
}

function openCompteModal(data = {}) {
  q('#modal-compte-title').textContent = data.id ? 'Modifier le compte' : 'Nouveau compte';
  q('#cpt-nom').value = data.nom || '';
  q('#cpt-type').value = data.type || 'courant';
  q('#cpt-solde').value = data.solde || '';
  q('#cpt-iban').value = data.iban || '';
  q('#btn-save-compte').dataset.id = data.id || '';
  openModal('modal-compte');
}

async function saveCompte() {
  const id = q('#btn-save-compte').dataset.id;
  const body = {
    nom: q('#cpt-nom').value.trim(),
    type: q('#cpt-type').value,
    solde: parseFloat(q('#cpt-solde').value) || 0,
    iban: q('#cpt-iban').value.trim(),
  };
  if (!body.nom) { toast('Nom requis', 'error'); return; }
  try {
    if (id) await PUT(`/api/comptes/${id}`, body);
    else await POST('/api/comptes', body);
    invalidate('comptes');
    closeModal('modal-compte');
    toast('Compte enregistré', 'success');
    loadComptes();
  } catch (e) { toast(e.message, 'error'); }
}

async function editCompte(id) {
  const c = comptesData.find(x => x.id === id);
  if (c) openCompteModal(c);
}

async function deleteCompte(id) {
  const ok = await confirm('Supprimer le compte', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/comptes/${id}`);
    invalidate('comptes');
    toast('Compte supprimé');
    loadComptes();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Transactions ────────────────────────────────────────────────────────────

let txnData = [];

async function loadTransactions() {
  txnData = await GET('/api/transactions') || [];
  cache['transactions'] = txnData;
  const comptes = await load('comptes', '/api/comptes');
  // populate compte filter & modal select
  const sel = q('#txn-filter-compte');
  const selM = q('#txn-compte');
  [sel, selM].forEach(s => {
    const cur = s.value;
    s.innerHTML = s === sel ? '<option value="">Tous les comptes</option>' : '';
    comptes.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.nom;
      s.appendChild(o);
    });
    if (cur) s.value = cur;
  });
  renderTransactions();
}

function renderTransactions() {
  const search = q('#txn-search')?.value.toLowerCase() || '';
  const compte = q('#txn-filter-compte')?.value || '';
  const type = q('#txn-filter-type')?.value || '';
  let list = txnData;
  if (search) list = list.filter(t => (t.libelle || '').toLowerCase().includes(search));
  if (compte) list = list.filter(t => t.compteId === compte);
  if (type) list = list.filter(t => t.type === type);
  list = [...list].sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

  const comptes = cache['comptes'] || [];
  const getCompteNom = id => comptes.find(c => c.id === id)?.nom || '—';

  const tbody = q('#txn-tbody');
  tbody.innerHTML = list.length ? list.map(t => `
    <tr>
      <td>${fmtDate(t.date)}</td>
      <td>${t.libelle || '—'}</td>
      <td>${getCompteNom(t.compteId)}</td>
      <td><span class="badge badge-${t.type}">${t.type}</span></td>
      <td class="text-right ${t.type === 'credit' ? 'text-success' : t.type === 'debit' ? 'text-danger' : ''}">${t.type === 'debit' ? '-' : ''}${fmt(t.montant || 0)}</td>
      <td class="actions">
        <button class="btn-icon" onclick="editTxn('${t.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn-icon btn-danger-icon" onclick="deleteTxn('${t.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty">Aucune transaction</td></tr>';
}

function openTxnModal(data = {}) {
  q('#modal-txn-title').textContent = data.id ? 'Modifier' : 'Nouvelle transaction';
  q('#txn-date').value = data.date || today();
  q('#txn-type').value = data.type || 'credit';
  q('#txn-libelle').value = data.libelle || '';
  q('#txn-compte').value = data.compteId || '';
  q('#txn-montant').value = data.montant || '';
  q('#btn-save-txn').dataset.id = data.id || '';
  openModal('modal-transaction');
}

async function saveTxn() {
  const id = q('#btn-save-txn').dataset.id;
  const body = {
    date: q('#txn-date').value,
    type: q('#txn-type').value,
    libelle: q('#txn-libelle').value.trim(),
    compteId: q('#txn-compte').value,
    montant: parseFloat(q('#txn-montant').value) || 0,
  };
  if (!body.libelle || !body.compteId) { toast('Libellé et compte requis', 'error'); return; }
  try {
    if (id) await PUT(`/api/transactions/${id}`, body);
    else await POST('/api/transactions', body);
    invalidate('transactions');
    closeModal('modal-transaction');
    toast('Transaction enregistrée', 'success');
    loadTransactions();
  } catch (e) { toast(e.message, 'error'); }
}

async function editTxn(id) {
  const t = txnData.find(x => x.id === id);
  if (t) openTxnModal(t);
}

async function deleteTxn(id) {
  const ok = await confirm('Supprimer la transaction', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/transactions/${id}`);
    invalidate('transactions');
    toast('Transaction supprimée');
    loadTransactions();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── URSSAF ──────────────────────────────────────────────────────────────────

let urssafData = [];
let urssafCurrentCle = null;

async function loadURSSAF() {
  const [factures, settings] = await Promise.all([
    load('factures', '/api/factures'),
    load('settings', '/api/settings'),
  ]);

  const year = new Date().getFullYear();
  const caAnnee = factures.filter(f => f.statut === 'payee' && f.date?.startsWith(year)).reduce((s, f) => s + (f.montant || 0), 0);
  const taux = (settings.tauxUrssaf || 25.6) / 100 + (settings.tauxCfp || 0.2) / 100;
  const cotisations = caAnnee * taux;

  q('#urs-ca-annuel').textContent = fmt(caAnnee);
  q('#urs-cotisations').textContent = fmt(cotisations);

  const quarters = ['T1', 'T2', 'T3', 'T4'];
  const quarterMonths = { T1: ['01','02','03'], T2: ['04','05','06'], T3: ['07','08','09'], T4: ['10','11','12'] };
  const echeances = { T1: '2026-04-30', T2: '2026-07-31', T3: '2026-10-31', T4: '2027-01-31' };

  urssafData = await Promise.all(quarters.map(async cle => {
    const stored = await GET(`/api/urssaf/${cle}`).catch(() => null) || {};
    const caQ = factures.filter(f => f.statut === 'payee' && quarterMonths[cle].some(m => f.date?.startsWith(`${year}-${m}`))).reduce((s, f) => s + (f.montant || 0), 0);
    const montant = caQ * taux;
    const echeance = echeances[cle];
    const jours = Math.ceil((new Date(echeance) - new Date()) / 86400000);
    let alerte = 'normal';
    if (!stored.paye) {
      if (jours <= 14) alerte = 'rouge';
      else if (jours <= 30) alerte = 'orange';
    }
    return { cle, label: `URSSAF ${cle} ${year}`, caQ, montant, echeance, jours, alerte, paye: stored.paye, montantPaye: stored.montantPaye, datePaye: stored.datePaye };
  }));

  // prochain paiement
  const next = urssafData.filter(u => !u.paye).sort((a, b) => a.jours - b.jours)[0];
  q('#urs-prochain').textContent = next ? `${next.jours > 0 ? next.jours + ' j' : 'Aujourd\'hui'}` : 'À jour';

  renderURSSAFCards();
}

function renderURSSAFCards() {
  const grid = q('#urssaf-cards');
  grid.innerHTML = urssafData.map(u => `
    <div class="urssaf-card ${u.paye ? 'paye' : u.alerte === 'rouge' ? 'alerte-rouge' : u.alerte === 'orange' ? 'alerte-orange' : ''}">
      <div class="urssaf-card-header">
        <span class="urssaf-label">${u.label}</span>
        ${u.paye ? '<span class="badge badge-payee">Payé</span>' : `<span class="badge badge-envoyee">${u.jours > 0 ? u.jours + ' j' : 'Échu'}</span>`}
      </div>
      <div class="urssaf-ca">CA déclaré : <strong>${fmt(u.caQ)}</strong></div>
      <div class="urssaf-montant">${fmt(u.montant)}</div>
      <div class="urssaf-echeance">Échéance : ${fmtDate(u.echeance)}</div>
      ${u.paye ? `<div class="urssaf-paye-info">Payé le ${fmtDate(u.datePaye)} — ${fmt(u.montantPaye)}</div>` : `<button class="btn-primary btn-sm mt-sm" onclick="openURSSAFPaiement('${u.cle}')">Marquer comme payé</button>`}
    </div>`).join('');
}

function openURSSAFPaiement(cle) {
  urssafCurrentCle = cle;
  const u = urssafData.find(x => x.cle === cle);
  q('#modal-urssaf-title').textContent = `${u.label}`;
  q('#modal-urssaf-detail').textContent = `Montant estimé : ${fmt(u.montant)}`;
  q('#urs-montant-paye').value = Math.round(u.montant * 100) / 100;
  q('#urs-date-paye').value = today();
  openModal('modal-urssaf');
}

async function saveURSSAFPaiement() {
  const body = {
    paye: true,
    montantPaye: parseFloat(q('#urs-montant-paye').value) || 0,
    datePaye: q('#urs-date-paye').value,
  };
  try {
    await PUT(`/api/urssaf/${urssafCurrentCle}`, body);
    closeModal('modal-urssaf');
    toast('Paiement enregistré', 'success');
    loadURSSAF();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Objectifs CA ────────────────────────────────────────────────────────────

async function loadObjectifsCA() {
  const [settings, factures] = await Promise.all([
    load('settings', '/api/settings'),
    load('factures', '/api/factures'),
  ]);

  const year = new Date().getFullYear();
  const objectif = settings.objectifCA || 60000;
  const atteint = factures.filter(f => f.statut === 'payee' && f.date?.startsWith(year)).reduce((s, f) => s + (f.montant || 0), 0);
  const reste = Math.max(objectif - atteint, 0);

  q('#obj-ca-objectif').textContent = fmt(objectif);
  q('#obj-ca-atteint').textContent = fmt(atteint);
  q('#obj-ca-reste').textContent = fmt(reste);

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const caMois = months.map((_, mi) => {
    const key = `${year}-${String(mi + 1).padStart(2, '0')}`;
    return factures.filter(f => f.statut === 'payee' && f.date?.startsWith(key)).reduce((s, f) => s + (f.montant || 0), 0);
  });
  const targetMois = Array(12).fill(Math.round(objectif / 12));

  const cEl = q('#chart-objectif-ca');
  if (cEl) drawBarChart(cEl, months, [
    { data: caMois, color: COLORS.navy },
    { data: targetMois, color: COLORS.muted },
  ]);
}

function openObjectifCAModal() {
  const settings = cache['settings'] || {};
  q('#obj-ca-val').value = settings.objectifCA || 60000;
  openModal('modal-objectif-ca');
}

async function saveObjectifCA() {
  const val = parseFloat(q('#obj-ca-val').value) || 0;
  try {
    const settings = await GET('/api/settings');
    await PUT('/api/settings', { ...settings, objectifCA: val });
    invalidate('settings');
    closeModal('modal-objectif-ca');
    toast('Objectif mis à jour', 'success');
    loadObjectifsCA();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Objectifs Épargne ───────────────────────────────────────────────────────

let epargneGoals = [];

async function loadObjectifsEpargne() {
  epargneGoals = await GET('/api/objectifs/epargne') || [];
  renderEpargneGoals();
}

function renderEpargneGoals() {
  const grid = q('#epargne-goals-grid');
  grid.innerHTML = epargneGoals.length ? epargneGoals.map(g => {
    const pct = Math.min(Math.round((g.actuel / g.cible) * 100), 100);
    return `<div class="goal-card">
      <div class="goal-header">
        <span class="goal-nom">${g.nom}</span>
        <div class="actions">
          <button class="btn-icon" onclick="editEpargneGoal('${g.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn-icon btn-danger-icon" onclick="deleteEpargneGoal('${g.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div class="goal-amounts">
        <span>${fmt(g.actuel)}</span><span class="text-muted">/ ${fmt(g.cible)}</span>
      </div>
      <div class="goal-progress">
        <div class="goal-bar" style="width:${pct}%"></div>
      </div>
      <div class="goal-pct">${pct}%</div>
    </div>`;
  }).join('') : '<p class="empty">Aucun objectif d\'épargne</p>';
}

function openEpargneGoalModal(data = {}) {
  q('#modal-obj-epargne-title').textContent = data.id ? 'Modifier' : 'Nouvel objectif';
  q('#obj-nom').value = data.nom || '';
  q('#obj-cible').value = data.cible || '';
  q('#obj-actuel').value = data.actuel || 0;
  q('#btn-save-obj-epargne').dataset.id = data.id || '';
  openModal('modal-objectif-epargne');
}

async function saveEpargneGoal() {
  const id = q('#btn-save-obj-epargne').dataset.id;
  const body = {
    nom: q('#obj-nom').value.trim(),
    cible: parseFloat(q('#obj-cible').value) || 0,
    actuel: parseFloat(q('#obj-actuel').value) || 0,
  };
  if (!body.nom || !body.cible) { toast('Nom et objectif requis', 'error'); return; }
  try {
    if (id) await PUT(`/api/objectifs/epargne/${id}`, body);
    else await POST('/api/objectifs/epargne', body);
    closeModal('modal-objectif-epargne');
    toast('Objectif enregistré', 'success');
    loadObjectifsEpargne();
  } catch (e) { toast(e.message, 'error'); }
}

async function editEpargneGoal(id) {
  const g = epargneGoals.find(x => x.id === id);
  if (g) openEpargneGoalModal(g);
}

async function deleteEpargneGoal(id) {
  const ok = await confirm('Supprimer l\'objectif', 'Cette action est irréversible.');
  if (!ok) return;
  try {
    await DEL(`/api/objectifs/epargne/${id}`);
    toast('Objectif supprimé');
    loadObjectifsEpargne();
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Rapports ────────────────────────────────────────────────────────────────

function loadRapports() {
  // populate month/year selects
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const selMois = q('#rapport-mois');
  if (selMois && !selMois.options.length) {
    mois.forEach((m, i) => selMois.add(new Option(m, String(i + 1).padStart(2, '0'))));
    selMois.value = String(new Date().getMonth() + 1).padStart(2, '0');
  }
  const year = new Date().getFullYear();
  [q('#rapport-annee-m'), q('#rapport-annee'), q('#rapport-annee-f')].forEach(sel => {
    if (sel && !sel.options.length) {
      for (let y = year; y >= year - 3; y--) sel.add(new Option(y, y));
    }
  });
}

async function generateRapportMensuel() {
  const mois = q('#rapport-mois').value;
  const annee = q('#rapport-annee-m').value;
  try {
    const data = await GET(`/api/rapport/mensuel?mois=${mois}&annee=${annee}`);
    renderRapportMensuel(data);
  } catch (e) { toast(e.message, 'error'); }
}

function renderRapportMensuel(d) {
  const el = q('#rapport-mensuel-content');
  el.innerHTML = `
    <div class="rapport-kpis">
      <div class="rapport-kpi"><span>CA encaissé</span><strong>${fmt(d.caEncaisse)}</strong></div>
      <div class="rapport-kpi"><span>Dépenses</span><strong>${fmt(d.depenses)}</strong></div>
      <div class="rapport-kpi"><span>Résultat net</span><strong>${fmt(d.resultatNet)}</strong></div>
      <div class="rapport-kpi"><span>Factures émises</span><strong>${d.facturesEmises}</strong></div>
    </div>
    <div class="rapport-section">
      <h3>Détail des factures payées</h3>
      <table class="data-table"><thead><tr><th>Numéro</th><th>Client</th><th>Montant</th></tr></thead>
      <tbody>${(d.factures || []).map(f => `<tr><td>${f.numero}</td><td>${f.client}</td><td>${fmt(f.montant)}</td></tr>`).join('')}</tbody></table>
    </div>
    <div class="rapport-section">
      <h3>Détail des dépenses</h3>
      <table class="data-table"><thead><tr><th>Date</th><th>Libellé</th><th>Montant</th></tr></thead>
      <tbody>${(d.depensesDetail || []).map(x => `<tr><td>${fmtDate(x.date)}</td><td>${x.libelle}</td><td>${fmt(x.montant)}</td></tr>`).join('')}</tbody></table>
    </div>`;
}

async function generateRapportAnnuel() {
  const annee = q('#rapport-annee').value;
  try {
    const data = await GET(`/api/rapport/annuel?annee=${annee}`);
    renderRapportAnnuel(data);
  } catch (e) { toast(e.message, 'error'); }
}

function renderRapportAnnuel(d) {
  const el = q('#rapport-annuel-content');
  el.innerHTML = `
    <div class="rapport-kpis">
      <div class="rapport-kpi"><span>CA total</span><strong>${fmt(d.caTotal)}</strong></div>
      <div class="rapport-kpi"><span>Dépenses totales</span><strong>${fmt(d.depensesTotal)}</strong></div>
      <div class="rapport-kpi"><span>URSSAF estimées</span><strong>${fmt(d.urssafEstime)}</strong></div>
      <div class="rapport-kpi"><span>Résultat net</span><strong>${fmt(d.resultatNet)}</strong></div>
      <div class="rapport-kpi"><span>Impôt estimé</span><strong>${fmt(d.impotEstime)}</strong></div>
    </div>
    <div class="rapport-section">
      <h3>CA mensuel</h3>
      <table class="data-table"><thead><tr><th>Mois</th><th>CA</th><th>Dépenses</th></tr></thead>
      <tbody>${(d.parMois || []).map(m => `<tr><td>${m.label}</td><td>${fmt(m.ca)}</td><td>${fmt(m.depenses)}</td></tr>`).join('')}</tbody></table>
    </div>`;
}

async function generateRapportFiscal() {
  const annee = q('#rapport-annee-f').value;
  try {
    const data = await GET(`/api/rapport/fiscal?annee=${annee}`);
    renderRapportFiscal(data);
  } catch (e) { toast(e.message, 'error'); }
}

function renderRapportFiscal(d) {
  const el = q('#rapport-fiscal-content');
  el.innerHTML = `
    <div class="rapport-kpis">
      <div class="rapport-kpi"><span>CA BNC déclaré</span><strong>${fmt(d.ca)}</strong></div>
      <div class="rapport-kpi"><span>Dépenses déductibles</span><strong>${fmt(d.deductibles)}</strong></div>
      <div class="rapport-kpi"><span>URSSAF payées</span><strong>${fmt(d.urssafPaye)}</strong></div>
      <div class="rapport-kpi"><span>Résultat imposable</span><strong>${fmt(d.imposable)}</strong></div>
      <div class="rapport-kpi"><span>Impôt estimé</span><strong>${fmt(d.impotEstime)}</strong></div>
    </div>
    <p class="text-muted text-sm mt-md">Régime micro-BNC — plafond ${fmtN(PLAFOND_BNC)} €. Ces chiffres sont indicatifs, consultez un comptable.</p>`;
}

// ─── Simulateur ───────────────────────────────────────────────────────────────

async function loadSimulateur() {
  // Load settings for rates
  await load('settings', '/api/settings');
}

async function calcSimTJM() {
  const settings = cache['settings'] || {};
  const taux = (settings.tauxUrssaf || 25.6) / 100 + (settings.tauxCfp || 0.2) / 100;
  const pas = settings.pasFixe || 40;
  const tjm = parseFloat(q('#sim-tjm-val').value) || 0;
  const jours = parseFloat(q('#sim-jours').value) || 0;
  const conges = parseFloat(q('#sim-conges').value) || 0;
  const joursFactures = jours - conges;
  const ca = tjm * joursFactures;
  const urssaf = ca * taux;
  const pasTot = pas * 12;
  const net = ca - urssaf - pasTot;
  const netMensuel = net / 12;

  const res = q('#sim-tjm-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="sim-result-grid">
      <div class="sim-result-item"><span>Jours facturés</span><strong>${joursFactures} j</strong></div>
      <div class="sim-result-item"><span>CA annuel</span><strong>${fmt(ca)}</strong></div>
      <div class="sim-result-item"><span>URSSAF + CFP</span><strong class="text-danger">- ${fmt(urssaf)}</strong></div>
      <div class="sim-result-item"><span>PAS (impôt)</span><strong class="text-danger">- ${fmt(pasTot)}</strong></div>
      <div class="sim-result-item highlight"><span>Revenu net annuel</span><strong>${fmt(net)}</strong></div>
      <div class="sim-result-item highlight"><span>Revenu net mensuel</span><strong>${fmt(netMensuel)}</strong></div>
    </div>
    ${ca > PLAFOND_BNC ? `<div class="sim-alerte"><i class="ti ti-alert-triangle"></i> Attention : CA dépasse le plafond micro-BNC de ${fmtN(PLAFOND_BNC)} €</div>` : ''}`;
}

async function calcSimObjectif() {
  const settings = cache['settings'] || {};
  const taux = (settings.tauxUrssaf || 25.6) / 100 + (settings.tauxCfp || 0.2) / 100;
  const pas = settings.pasFixe || 40;
  const netSouhaite = parseFloat(q('#sim-revenu-net').value) || 0;
  const joursMois = parseFloat(q('#sim-jours-mois').value) || 18;

  const netAnnuel = netSouhaite * 12;
  const caNeeded = (netAnnuel + pas * 12) / (1 - taux);
  const tjmNeeded = caNeeded / (joursMois * 12);

  const res = q('#sim-objectif-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="sim-result-grid">
      <div class="sim-result-item"><span>Revenu net visé / an</span><strong>${fmt(netAnnuel)}</strong></div>
      <div class="sim-result-item"><span>CA nécessaire</span><strong>${fmt(caNeeded)}</strong></div>
      <div class="sim-result-item highlight"><span>TJM nécessaire</span><strong>${fmt(tjmNeeded)}</strong></div>
      <div class="sim-result-item"><span>Jours facturés / mois</span><strong>${joursMois}</strong></div>
    </div>
    ${caNeeded > PLAFOND_BNC ? `<div class="sim-alerte"><i class="ti ti-alert-triangle"></i> Attention : CA nécessaire dépasse le plafond micro-BNC de ${fmtN(PLAFOND_BNC)} €</div>` : ''}`;
}

function calcSimPlafond() {
  const actuel = parseFloat(q('#sim-ca-actuel').value) || 0;
  const projete = parseFloat(q('#sim-ca-projete').value) || 0;
  const plafond = PLAFOND_BNC;
  const margeActuel = plafond - actuel;
  const margeProjete = plafond - projete;
  const pctActuel = Math.round((actuel / plafond) * 100);
  const pctProjete = Math.round((projete / plafond) * 100);

  const res = q('#sim-plafond-result');
  res.classList.remove('hidden');
  res.innerHTML = `
    <div class="sim-result-grid">
      <div class="sim-result-item"><span>Plafond micro-BNC</span><strong>${fmtN(plafond)} €</strong></div>
      <div class="sim-result-item"><span>CA actuel (${pctActuel}%)</span><strong>${fmt(actuel)}</strong></div>
      <div class="sim-result-item"><span>Marge actuelle</span><strong>${fmt(margeActuel)}</strong></div>
      <div class="sim-result-item ${projete > plafond ? 'highlight-danger' : ''}"><span>CA projeté (${pctProjete}%)</span><strong>${fmt(projete)}</strong></div>
      <div class="sim-result-item ${margeProjete < 0 ? 'highlight-danger' : 'highlight'}"><span>Marge projetée</span><strong>${fmt(margeProjete)}</strong></div>
    </div>
    ${projete > plafond ? `<div class="sim-alerte sim-alerte-rouge"><i class="ti ti-alert-triangle"></i> Dépassement du plafond prévu ! Vous devrez basculer en régime réel.</div>` : pctProjete > 85 ? `<div class="sim-alerte"><i class="ti ti-alert-circle"></i> Vous approchez du plafond (${pctProjete}%). Anticipez.</div>` : ''}`;
}

// ─── Import / Export ─────────────────────────────────────────────────────────

let importFacturesData = null;
let importDepensesData = null;

function initImportExport() {
  // ie tabs
  document.addEventListener('click', e => {
    const pill = e.target.closest('[data-ie]');
    if (!pill) return;
    const target = pill.dataset.ie;
    qa('[data-ie]').forEach(p => p.classList.remove('active'));
    qa('.ie-panel').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    q(`#ie-${target}`)?.classList.add('active');
  });

  // export buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-export]');
    if (!btn) return;
    exportCSV(btn.dataset.export);
  });

  // file inputs
  q('#file-factures-csv')?.addEventListener('change', e => handleCSV(e.target.files[0], 'factures'));
  q('#file-depenses-csv')?.addEventListener('change', e => handleCSV(e.target.files[0], 'depenses'));

  // drag & drop
  ['factures', 'depenses'].forEach(type => {
    const drop = q(`#drop-${type}`);
    if (!drop) return;
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
    drop.addEventListener('drop', e => {
      e.preventDefault();
      drop.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleCSV(file, type);
    });
  });

  q('#btn-import-factures')?.addEventListener('click', () => doImport('factures'));
  q('#btn-import-depenses')?.addEventListener('click', () => doImport('depenses'));
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] || '');
    return obj;
  });
}

function handleCSV(file, type) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const rows = parseCSV(e.target.result);
    if (type === 'factures') {
      importFacturesData = rows.map(r => ({
        numero: r['Numéro'] || r['numero'] || '',
        client: r['Client'] || r['client'] || '',
        date: r['Date'] || r['date'] || '',
        montant: parseFloat(r['Montant'] || r['montant'] || 0),
        statut: r['Statut'] || r['statut'] || 'payee',
        description: r['Description'] || r['description'] || '',
      }));
      renderImportPreview('factures', importFacturesData, ['numero', 'client', 'date', 'montant', 'statut']);
    } else {
      importDepensesData = rows.map(r => ({
        date: r['Date'] || r['date'] || '',
        libelle: r['Libellé'] || r['libelle'] || r['label'] || '',
        categorie: r['Catégorie'] || r['categorie'] || 'autre',
        montant: parseFloat(r['Montant'] || r['montant'] || 0),
        deductible: (r['Déductible'] || r['deductible'] || 'oui').toLowerCase() !== 'non',
      }));
      renderImportPreview('depenses', importDepensesData, ['date', 'libelle', 'categorie', 'montant']);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function renderImportPreview(type, data, cols) {
  const preview = q(`#import-${type}-preview`);
  const btn = q(`#btn-import-${type}`);
  preview.classList.remove('hidden');
  btn.classList.remove('hidden');
  preview.innerHTML = `<p class="text-muted text-sm">${data.length} lignes détectées</p>
    <table class="data-table"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${data.slice(0, 5).map(r => `<tr>${cols.map(c => `<td>${r[c] || ''}</td>`).join('')}</tr>`).join('')}</tbody></table>
    ${data.length > 5 ? `<p class="text-muted text-sm">… et ${data.length - 5} autres</p>` : ''}`;
}

async function doImport(type) {
  const data = type === 'factures' ? importFacturesData : importDepensesData;
  if (!data?.length) return;
  try {
    const res = await POST(`/api/import/${type}`, { items: data });
    invalidate(type);
    toast(`${res.imported || data.length} éléments importés`, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

async function exportCSV(type) {
  try {
    const res = await fetch(`/api/export/${type}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (!res.ok) { toast('Erreur export', 'error'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `stb-${type}-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Options ─────────────────────────────────────────────────────────────────

async function loadOptions() {
  const settings = await GET('/api/settings') || {};
  cache['settings'] = settings;
  q('#opt-urssaf').value = settings.tauxUrssaf ?? 25.6;
  q('#opt-cfp').value = settings.tauxCfp ?? 0.2;
  q('#opt-pas').value = settings.pasFixe ?? 40;
  q('#opt-versement').value = settings.pctVersement ?? 65;
  q('#opt-epargne-pct').value = settings.pctEpargne ?? 15;
  q('#opt-tresorerie-pct').value = settings.pctTresorerie ?? 20;
  q('#opt-nom').value = settings.nom || '';
  q('#opt-siret').value = settings.siret || '';
  updatePctTotal();
}

function updatePctTotal() {
  const v = parseFloat(q('#opt-versement')?.value) || 0;
  const e = parseFloat(q('#opt-epargne-pct')?.value) || 0;
  const t = parseFloat(q('#opt-tresorerie-pct')?.value) || 0;
  const total = v + e + t;
  const el = q('#opt-total-pct');
  if (el) {
    el.textContent = `Total : ${total}%`;
    el.className = total === 100 ? 'text-success text-sm' : 'text-danger text-sm';
  }
}

async function saveOptions() {
  const body = {
    tauxUrssaf: parseFloat(q('#opt-urssaf').value) || 25.6,
    tauxCfp: parseFloat(q('#opt-cfp').value) || 0.2,
    pasFixe: parseFloat(q('#opt-pas').value) || 40,
    pctVersement: parseFloat(q('#opt-versement').value) || 65,
    pctEpargne: parseFloat(q('#opt-epargne-pct').value) || 15,
    pctTresorerie: parseFloat(q('#opt-tresorerie-pct').value) || 20,
    nom: q('#opt-nom').value.trim(),
    siret: q('#opt-siret').value.trim(),
  };
  const v = body.pctVersement + body.pctEpargne + body.pctTresorerie;
  if (v !== 100) { toast(`La répartition doit totaliser 100% (actuellement ${v}%)`, 'error'); return; }
  try {
    await PUT('/api/settings', body);
    invalidate('settings');
    toast('Options enregistrées', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ─── Login screen ────────────────────────────────────────────────────────────

function showLogin() {
  q('#login-screen').classList.remove('hidden');
  q('#app').classList.add('hidden');
}

function showApp() {
  q('#login-screen').classList.add('hidden');
  q('#app').classList.remove('hidden');
  navigate('dashboard');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  initModals();
  initImportExport();

  // Login form
  q('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = q('#login-btn');
    btn.disabled = true;
    btn.textContent = '…';
    try {
      await login(q('#login-password').value);
      showApp();
    } catch (err) {
      q('#login-error').textContent = err.message;
      q('#login-error').classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    }
  });

  // Logout
  q('#logout-btn').addEventListener('click', logout);

  // Nav
  document.addEventListener('click', e => {
    const item = e.target.closest('[data-section]');
    if (item && item.dataset.section) navigate(item.dataset.section);
  });

  // Factures
  q('#btn-new-facture')?.addEventListener('click', () => openFactureModal());
  q('#btn-save-facture')?.addEventListener('click', saveFacture);
  q('#factures-search')?.addEventListener('input', renderFactures);
  q('#factures-filter-statut')?.addEventListener('change', renderFactures);
  q('#f-pdf-btn')?.addEventListener('click', () => q('#f-pdf-file').click());
  q('#f-pdf-file')?.addEventListener('change', () => {
    const f = q('#f-pdf-file').files[0];
    if (f) { q('#f-pdf-name').textContent = f.name; q('#f-pdf-btn').className = 'pdf-btn present'; }
  });

  // Dépenses
  q('#btn-new-depense')?.addEventListener('click', () => openDepenseModal());
  q('#btn-save-depense')?.addEventListener('click', saveDepense);
  q('#depenses-search')?.addEventListener('input', renderDepenses);
  q('#depenses-filter-cat')?.addEventListener('change', renderDepenses);
  q('#d-pdf-btn')?.addEventListener('click', () => q('#d-pdf-file').click());
  q('#d-pdf-file')?.addEventListener('change', () => {
    const f = q('#d-pdf-file').files[0];
    if (f) { q('#d-pdf-name').textContent = f.name; q('#d-pdf-btn').className = 'pdf-btn present'; }
  });

  // Abonnements
  q('#btn-new-abonnement')?.addEventListener('click', () => openAbonnementModal());
  q('#btn-save-abonnement')?.addEventListener('click', saveAbonnement);

  // Comptes
  q('#btn-new-compte')?.addEventListener('click', () => openCompteModal());
  q('#btn-save-compte')?.addEventListener('click', saveCompte);

  // Transactions
  q('#btn-new-txn')?.addEventListener('click', () => openTxnModal());
  q('#btn-save-txn')?.addEventListener('click', saveTxn);
  q('#txn-search')?.addEventListener('input', renderTransactions);
  q('#txn-filter-compte')?.addEventListener('change', renderTransactions);
  q('#txn-filter-type')?.addEventListener('change', renderTransactions);

  // URSSAF
  q('#btn-save-urssaf')?.addEventListener('click', saveURSSAFPaiement);

  // Objectifs CA
  q('#btn-edit-objectif-ca')?.addEventListener('click', openObjectifCAModal);
  q('#btn-save-objectif-ca')?.addEventListener('click', saveObjectifCA);

  // Objectifs épargne
  q('#btn-new-objectif-epargne')?.addEventListener('click', () => openEpargneGoalModal());
  q('#btn-save-obj-epargne')?.addEventListener('click', saveEpargneGoal);

  // Rapports tabs
  document.addEventListener('click', e => {
    const pill = e.target.closest('#rapports-tabs .tab-pill');
    if (!pill) return;
    qa('#rapports-tabs .tab-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    qa('.rapport-tab').forEach(t => t.classList.remove('active'));
    q(`#rapport-${pill.dataset.tab}`)?.classList.add('active');
  });
  q('#btn-rapport-mensuel')?.addEventListener('click', generateRapportMensuel);
  q('#btn-rapport-annuel')?.addEventListener('click', generateRapportAnnuel);
  q('#btn-rapport-fiscal')?.addEventListener('click', generateRapportFiscal);

  // Simulateur tabs
  document.addEventListener('click', e => {
    const tab = e.target.closest('.sim-tab');
    if (!tab) return;
    qa('.sim-tab').forEach(t => t.classList.remove('active'));
    qa('.sim-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    q(`#sim-${tab.dataset.sim}`)?.classList.add('active');
  });
  q('#btn-sim-tjm')?.addEventListener('click', calcSimTJM);
  q('#btn-sim-objectif')?.addEventListener('click', calcSimObjectif);
  q('#btn-sim-plafond')?.addEventListener('click', calcSimPlafond);

  // Options
  q('#btn-save-options')?.addEventListener('click', saveOptions);
  ['#opt-versement', '#opt-epargne-pct', '#opt-tresorerie-pct'].forEach(sel => q(sel)?.addEventListener('input', updatePctTotal));

  // Check auth
  if (isLoggedIn()) showApp();
  else showLogin();
}

document.addEventListener('DOMContentLoaded', init);
