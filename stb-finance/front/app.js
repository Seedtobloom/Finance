/* ─── STB Finance — app.js — Cookie auth + service binding ──────────── */

/* ─── 0. LOGIN OVERLAY ───────────────────────────────────────────────── */
function injectLoginOverlay() {
  if (q('#login-overlay')) return;
  const div = document.createElement('div');
  div.id = 'login-overlay';
  div.style.cssText = 'position:fixed;inset:0;background:#f5f3ef;display:flex;align-items:center;justify-content:center;z-index:9999;';
  div.innerHTML = `
    <div style="background:#fff;border:1px solid #E8E8E4;border-radius:12px;padding:40px;width:360px;max-width:90vw;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <div style="font-family:'Cormorant Garamond',serif;font-size:36px;color:#051833;margin-bottom:4px;">STB Finance</div>
      <div style="font-size:13px;color:#6B6B6B;margin-bottom:32px;">Seed to Bloom</div>
      <input id="login-pwd" type="password" placeholder="Mot de passe" autocomplete="current-password"
        style="width:100%;padding:10px 14px;border:1px solid #E8E8E4;border-radius:8px;font-size:14px;margin-bottom:12px;box-sizing:border-box;outline:none;">
      <button id="login-btn"
        style="width:100%;padding:10px;background:#051833;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;">
        Se connecter
      </button>
      <div id="login-error" style="margin-top:12px;font-size:13px;color:#E85454;min-height:18px;"></div>
    </div>`;
  document.body.appendChild(div);
  q('#login-pwd').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  q('#login-btn').addEventListener('click', doLogin);
}

function showLogin() {
  injectLoginOverlay();
  const o = q('#login-overlay');
  if (o) { o.style.display = 'flex'; q('#login-pwd').value = ''; q('#login-error').textContent = ''; }
}

function hideLogin() {
  const o = q('#login-overlay');
  if (o) o.style.display = 'none';
}

async function doLogin() {
  const pwd = q('#login-pwd')?.value || '';
  if (!pwd) return;
  q('#login-btn').textContent = '…';
  q('#login-error').textContent = '';
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });
    const data = await r.json();
    if (!r.ok) { q('#login-error').textContent = data.error || 'Erreur'; q('#login-btn').textContent = 'Se connecter'; return; }
    hideLogin();
    await startApp();
  } catch(e) {
    q('#login-error').textContent = 'Connexion impossible';
    q('#login-btn').textContent = 'Se connecter';
  }
}

/* ─── 0b. API HELPER ─────────────────────────────────────────────────── */
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  if (r.status === 401) { showLogin(); throw new Error('401'); }
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || r.statusText); }
  return r.json();
}

/* ─── 0c. CACHE ──────────────────────────────────────────────────────── */
const _cache = {
  settings:{}, factures:[], depenses:[], transactions:[], abonnements:[],
  comptes:[], objectifs_epargne:[], urssaf:{}, repartition:{}, objectif_ca:{}
};

async function loadAll() {
  const [settings, factures, depenses, abonnements, comptes, oe, urssaf, repartition, objCA] = await Promise.all([
    api('GET', '/api/settings'),
    api('GET', '/api/factures'),
    api('GET', '/api/depenses'),
    api('GET', '/api/abonnements'),
    api('GET', '/api/comptes'),
    api('GET', '/api/objectifs/epargne'),
    api('GET', '/api/urssaf'),
    api('GET', '/api/repartition'),
    api('GET', '/api/objectifs/ca'),
  ]);
  _cache.settings        = settings || {};
  _cache.factures        = factures || [];
  _cache.depenses        = depenses || [];
  _cache.abonnements     = (abonnements||[]).map(a=>({...a, montant:a.montantMensuel||a.montant||0, jour:a.jourPrelevement||a.jour||1}));
  _cache.comptes         = comptes  || [];
  _cache.objectifs_epargne = (oe||[]).map(o=>({...o, cible:o.montantCible||o.cible||0, actuel:o.montantActuel||o.actuel||0}));
  _cache.urssaf          = urssaf   || {};
  _cache.repartition     = repartition || {};
  _cache.objectif_ca     = objCA    || {};
  // Transactions : on charge jusqu'à 5 pages
  try {
    const t1 = await api('GET', '/api/transactions?page=1');
    const all = [...(t1.transactions||[])];
    if (t1.pages > 1) {
      const rest = await Promise.all(
        Array.from({length: Math.min(t1.pages-1, 4)}, (_,i) =>
          api('GET', `/api/transactions?page=${i+2}`).then(r=>r.transactions||[]).catch(()=>[])
        )
      );
      rest.forEach(p => all.push(...p));
    }
    _cache.transactions = all;
  } catch { _cache.transactions = []; }
}

/* ─── 1. CONSTANTES ──────────────────────────────────────────────────── */
const PLAFOND_BNC = 77700;
const TAUX_URSSAF = 0.256;
const TAUX_CFP    = 0.002;
const PAS_FIXE    = 40;
const MOIS_COURT  = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOIS_LONG   = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const COLORS = {
  navy:'#051833', blue:'#BAD1FD', violet:'#E4D1FE',
  success:'#4CAF82', warning:'#E8A838', danger:'#E85454',
  muted:'#E8E8E4', text2:'#6B6B6B'
};
const PALETTE = ['#BAD1FD','#E4D1FE','#4CAF82','#E8A838','#E85454','#051833','#EFE1B0','#412F21'];

/* ─── 2. UTILS ───────────────────────────────────────────────────────── */
const fmt     = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Math.round((v||0)*100)/100);
const fmtN    = v => new Intl.NumberFormat('fr-FR').format(Math.round(v||0));
const today   = () => new Date().toISOString().slice(0,10);
const uid     = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
function fmtDate(s){if(!s)return'—';const[y,m,d]=s.split('-');return`${d}/${m}/${y}`;}
function q(sel,ctx=document){return ctx.querySelector(sel);}
function qa(sel,ctx=document){return[...ctx.querySelectorAll(sel)];}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}
function fmtShort(v){if(v>=1000000)return(v/1000000).toFixed(1)+'M';if(v>=1000)return(v/1000).toFixed(0)+'k';return String(Math.round(v));}
function niceStep(max){
  const raw=max/5,mag=Math.pow(10,Math.floor(Math.log10(raw||1)));
  const n=raw/mag;
  if(n<1.5)return mag;if(n<3.5)return 2*mag;if(n<7.5)return 5*mag;return 10*mag;
}

/* ─── 3. TOAST ───────────────────────────────────────────────────────── */
let _toastTimer;
function toast(msg,type='info'){
  const t=q('#toast');
  if(!t)return;
  t.textContent=msg;
  t.className=`show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.className='',3500);
}

/* ─── 4. CONFIRM DIALOG ──────────────────────────────────────────────── */
function confirmDialog(title,msg){
  return new Promise(resolve=>{
    q('#confirm-title').textContent=title;
    q('#confirm-msg').textContent=msg;
    openModal('modal-confirm');
    const ok=q('#confirm-ok'),cancel=q('#confirm-cancel');
    const done=v=>{closeModal('modal-confirm');resolve(v);};
    ok.onclick=()=>done(true);
    cancel.onclick=()=>done(false);
  });
}

/* ─── 5. DATA LAYER (cache + API) ────────────────────────────────────── */

/* Lecture synchrone depuis le cache */
function dbGet(col){return Array.isArray(_cache[col])?_cache[col]:[];}
function dbGetObj(col){return _cache[col]&&typeof _cache[col]==='object'&&!Array.isArray(_cache[col])?_cache[col]:{};}

/* Correspondance colonne → chemin API */
const _pathCreate = {
  factures:'/api/factures', depenses:'/api/depenses', abonnements:'/api/abonnements',
  comptes:'/api/comptes', transactions:'/api/transactions', objectifs_epargne:'/api/objectifs/epargne'
};
const _pathUpdate = id=>({
  factures:`/api/factures/${id}`, abonnements:`/api/abonnements/${id}`,
  comptes:`/api/comptes/${id}`, objectifs_epargne:`/api/objectifs/epargne/${id}`
});
const _pathDelete = id=>({
  factures:`/api/factures/${id}`, depenses:`/api/depenses/${id}`,
  abonnements:`/api/abonnements/${id}`, comptes:`/api/comptes/${id}`,
  transactions:`/api/transactions/${id}`, objectifs_epargne:`/api/objectifs/epargne/${id}`
});

/* Normalisation abonnements (UI ↔ API) */
function _normAbo(a){return {...a, montant:a.montantMensuel||a.montant||0, jour:a.jourPrelevement||a.jour||1};}
function _normEpargne(o){return {...o, cible:o.montantCible||o.cible||0, actuel:o.montantActuel||o.actuel||0};}

async function dbCreate(col, item){
  const path=_pathCreate[col]; if(!path)return item;
  const r = await api('POST', path, item);
  const norm = col==='abonnements'?_normAbo(r):col==='objectifs_epargne'?_normEpargne(r):r;
  _cache[col]=[...(_cache[col]||[]), norm];
  return norm;
}

async function dbUpdate(col, item){
  const path=_pathUpdate(item.id)[col]; if(!path)return item;
  const r = await api('PUT', path, item);
  const norm = col==='abonnements'?_normAbo(r):col==='objectifs_epargne'?_normEpargne(r):r;
  const list=_cache[col]||[];
  const idx=list.findIndex(x=>x.id===item.id);
  if(idx>=0)list[idx]=norm;else list.push(norm);
  _cache[col]=[...list];
  return norm;
}

async function dbDelete(col, id){
  const path=_pathDelete(id)[col]; if(!path)return;
  await api('DELETE', path);
  _cache[col]=(_cache[col]||[]).filter(x=>x.id!==id);
}

async function dbSet(col, val){
  if(col==='settings'){_cache.settings=await api('PUT','/api/settings',val);return;}
  if(col==='repartition'){_cache.repartition=await api('PUT','/api/repartition',val);return;}
  if(col==='objectif_ca'){_cache.objectif_ca=await api('PUT','/api/objectifs/ca',val);return;}
  if(col==='urssaf'){_cache.urssaf=val;return;}
  _cache[col]=val;
}

/* ─── 6. ROUTER ──────────────────────────────────────────────────────── */
let currentSection='dashboard';
function navigate(section){
  qa('.section').forEach(s=>s.classList.remove('active'));
  qa('.nav-item').forEach(n=>n.classList.remove('active'));
  const sec=q(`#section-${section}`);
  if(!sec)return;
  sec.classList.add('active');
  const nav=q(`.nav-item[data-section="${section}"]`);
  if(nav)nav.classList.add('active');
  currentSection=section;
  loadSection(section);
}
function loadSection(s){
  const map={
    'dashboard':loadDashboard,'vue-ensemble':loadVueEnsemble,
    'comptes':loadComptes,'transactions':loadTransactions,
    'factures':loadFactures,'objectifs-ca':loadObjectifsCA,
    'depenses':loadDepenses,'abonnements':loadAbonnements,
    'charges-urssaf':loadChargesURSSAF,'repartition':loadRepartition,
    'objectifs-epargne':loadObjectifsEpargne,'rapport-mensuel':loadRapportMensuel,
    'rapport-annuel':loadRapportAnnuel,'rapport-fiscal':loadRapportFiscal,
    'simulateur':loadSimulateur,'import-export':initImportExport,'options':loadOptions,
  };
  if(map[s])map[s]();
}

/* ─── 7. MODALS ──────────────────────────────────────────────────────── */
function openModal(id){const m=q(`#${id}`);if(m)m.classList.add('open');}
function closeModal(id){const m=q(`#${id}`);if(m)m.classList.remove('open');}
function initModals(){
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-close-modal]');
    if(btn)closeModal(btn.dataset.closeModal);
    if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');
  });
}

/* ─── 8. CHARTS CANVAS 2D NATIFS ─────────────────────────────────────── */
function setupCanvas(canvas){
  const W=canvas.parentElement?.offsetWidth||600;
  const H=canvas.height||200;
  canvas.width=W;canvas.height=H;
  return{ctx:canvas.getContext('2d'),W,H};
}

function drawGrid(ctx,pad,cW,cH,yMax,step){
  ctx.strokeStyle=COLORS.muted;ctx.lineWidth=1;
  for(let v=0;v<=yMax;v+=step){
    const y=pad.top+cH-(v/yMax)*cH;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cW,y);ctx.stroke();
    ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='right';
    ctx.fillText(fmtShort(v),pad.left-5,y+4);
  }
}

function drawBarChart(canvas,labels,datasets,opts={}){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const pad={top:16,right:12,bottom:36,left:52};
  const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  const allVals=datasets.flatMap(d=>d.data);
  const maxVal=Math.max(...allVals,1);
  const step=niceStep(maxVal);
  const yMax=Math.ceil(maxVal/step)*step;
  drawGrid(ctx,pad,cW,cH,yMax,step);
  const groupW=cW/labels.length;
  const bc=datasets.length,gap=3;
  const bw=Math.max(4,(groupW-gap*(bc+1))/bc);
  datasets.forEach((ds,di)=>{
    ctx.fillStyle=ds.color||COLORS.navy;
    ds.data.forEach((v,i)=>{
      if(!v)return;
      const bH=(v/yMax)*cH;
      const x=pad.left+i*groupW+gap+di*(bw+gap);
      const y=pad.top+cH-bH;
      ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(x,y,bw,bH,2);else ctx.rect(x,y,bw,bH);
      ctx.fill();
    });
  });
  ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+i*groupW+groupW/2,pad.top+cH+16));
}

function drawGroupedBarChart(canvas,labels,datasets){
  drawBarChart(canvas,labels,datasets);
}

function drawLineChart(canvas,labels,data,color=COLORS.navy,dashed=false){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const pad={top:16,right:12,bottom:36,left:52};
  const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  const maxVal=Math.max(...data,1);
  const step=niceStep(maxVal);
  const yMax=Math.ceil(maxVal/step)*step;
  drawGrid(ctx,pad,cW,cH,yMax,step);
  const n=data.length-1||1;
  const pts=data.map((v,i)=>({x:pad.left+(i/n)*cW,y:pad.top+cH-(v/yMax)*cH}));
  if(!dashed){
    const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+cH);
    grad.addColorStop(0,color+'30');grad.addColorStop(1,color+'00');
    ctx.beginPath();
    pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    ctx.lineTo(pts[pts.length-1].x,pad.top+cH);ctx.lineTo(pts[0].x,pad.top+cH);
    ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  }
  ctx.save();if(dashed)ctx.setLineDash([5,5]);
  ctx.strokeStyle=color;ctx.lineWidth=2;
  ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.stroke();ctx.restore();
  if(!dashed)pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();});
  ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+(i/n)*cW,pad.top+cH+16));
}

function drawDonutChart(canvas,labels,data,colors){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const total=data.reduce((a,b)=>a+b,0);
  if(!total)return;
  const legendW=130;
  const cx=(W-legendW)/2,cy=H/2,r=Math.min(cx-10,cy-10),ir=r*0.58;
  let angle=-Math.PI/2;
  data.forEach((v,i)=>{
    const s=(v/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+s);ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];ctx.fill();
    angle+=s;
  });
  ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  const lx=W-legendW+8;
  labels.forEach((l,i)=>{
    const ly=16+i*22;
    ctx.fillStyle=colors[i%colors.length];ctx.fillRect(lx,ly,10,10);
    ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='left';
    ctx.fillText(l.slice(0,16),lx+14,ly+9);
  });
}

function drawStackedBarChart(canvas,labels,datasets){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const pad={top:16,right:12,bottom:36,left:52};
  const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  const totals=labels.map((_,i)=>datasets.reduce((s,ds)=>s+(ds.data[i]||0),0));
  const maxVal=Math.max(...totals,1);
  const step=niceStep(maxVal);
  const yMax=Math.ceil(maxVal/step)*step;
  drawGrid(ctx,pad,cW,cH,yMax,step);
  const groupW=cW/labels.length;
  const bw=Math.max(6,groupW*0.6);
  const bx=(groupW-bw)/2;
  labels.forEach((_,i)=>{
    let base=0;
    datasets.forEach(ds=>{
      const v=ds.data[i]||0;
      if(!v)return;
      const bH=(v/yMax)*cH;
      const x=pad.left+i*groupW+bx;
      const y=pad.top+cH-(base+v)/yMax*cH;
      ctx.fillStyle=ds.color||COLORS.blue;
      ctx.beginPath();ctx.rect(x,y,bw,bH);ctx.fill();
      base+=v;
    });
  });
  ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+i*groupW+groupW/2,pad.top+cH+16));
}

/* ─── 9. MODULES ─────────────────────────────────────────────────────── */

/* --- Dashboard -------------------------------------------------------- */
function loadDashboard(){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  if(q('#dash-period'))q('#dash-period').textContent=`${MOIS_LONG[m-1]} ${y}`;

  const factures    = dbGet('factures');
  const depenses    = dbGet('depenses');
  const abonnements = dbGet('abonnements');
  const transactions= dbGet('transactions');
  const settings    = dbGetObj('settings');
  const urssafObj   = dbGetObj('urssaf');

  const tauxU=(settings.tauxUrssaf||25.6)/100;
  const tauxC=(settings.tauxCfp||0.2)/100;
  const pas  =settings.pasFixe||40;

  // CA mois courant (factures payées)
  const caMois=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  // CA YTD
  const caYTD=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(String(y))).reduce((s,f)=>s+(f.montant||0),0);
  const objectif=settings.objectifCA||60000;
  const progressionCA=objectif>0?Math.round(caYTD/objectif*100):0;

  // Charges mois courant
  const urssafM=Math.round(caMois*tauxU*100)/100;
  const cfpM   =Math.round(caMois*tauxC*100)/100;
  const depM   =depenses.filter(d=>(d.date||'').startsWith(mKey)).reduce((s,d)=>s+(d.montant||0),0);
  const aboM   =abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const chargesTotal=urssafM+cfpM+pas+depM+aboM;
  const netMois=Math.max(0,caMois-chargesTotal);
  const versementEstime=Math.round(netMois*(settings.pctVersement||65)/100);

  // Solde total comptes courants
  const comptes=dbGet('comptes');
  const tresoQonto=comptes.filter(c=>c.type==='courant').reduce((s,c)=>s+(c.solde||0),0);

  // Prochaine échéance URSSAF
  const echeances={
    'T1':`${y}-04-30`,'T2':`${y}-07-31`,
    'T3':`${y}-10-31`,'T4':`${y+1}-01-31`
  };
  const labels={'T1':'T1 (jan–mar)','T2':'T2 (avr–jun)','T3':'T3 (jul–sep)','T4':'T4 (oct–déc)'};
  let prochaineEcheance=null;
  ['T1','T2','T3','T4'].forEach(t=>{
    const cle=`${t}-${y}`;
    const d=urssafObj[cle]||{};
    if(d.statut==='paye')return;
    const ech=echeances[t];
    const jours=Math.ceil((new Date(ech)-now)/86400000);
    if(!prochaineEcheance||jours<prochaineEcheance.joursRestants){
      prochaineEcheance={label:labels[t],echeance:ech,joursRestants:jours,cle};
    }
  });

  // KPIs ligne 1
  if(q('#kpi-ca-mois'))q('#kpi-ca-mois').textContent=fmt(caMois);
  if(q('#kpi-charges-mois'))q('#kpi-charges-mois').textContent=fmt(chargesTotal);
  if(q('#kpi-charges-mois-sub'))q('#kpi-charges-mois-sub').textContent='URSSAF + dép. + PAS';
  if(q('#kpi-net-mois'))q('#kpi-net-mois').textContent=fmt(netMois);
  if(q('#kpi-versement'))q('#kpi-versement').textContent=fmt(versementEstime);

  // KPIs ligne 2
  if(q('#kpi-ca-ytd'))q('#kpi-ca-ytd').textContent=fmt(caYTD);
  if(q('#kpi-objectif-pct'))q('#kpi-objectif-pct').textContent=`${progressionCA}%`;
  if(q('#kpi-objectif-bar'))q('#kpi-objectif-bar').style.width=`${Math.min(progressionCA,100)}%`;
  if(q('#kpi-treso-qonto'))q('#kpi-treso-qonto').textContent=fmt(tresoQonto);
  if(prochaineEcheance){
    if(q('#kpi-urssaf-next'))q('#kpi-urssaf-next').textContent=prochaineEcheance.joursRestants>0?`${prochaineEcheance.joursRestants} j`:'Aujourd\'hui';
    if(q('#kpi-urssaf-sub'))q('#kpi-urssaf-sub').textContent=`${prochaineEcheance.label} · ${fmtDate(prochaineEcheance.echeance)}`;
  }

  // Graphique barres groupées 12 mois
  const caParMois=MOIS_COURT.map((_,mi)=>{
    const k=`${y}-${String(mi+1).padStart(2,'0')}`;
    return factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);
  });
  const chParMois=MOIS_COURT.map((_,mi)=>{
    const k=`${y}-${String(mi+1).padStart(2,'0')}`;
    const ca=caParMois[mi];
    const dep=depenses.filter(d=>(d.date||'').startsWith(k)).reduce((s,d)=>s+(d.montant||0),0);
    return Math.round(ca*(tauxU+tauxC)*100)/100+pas+dep;
  });
  const netParMois=caParMois.map((ca,i)=>Math.max(0,ca-chParMois[i]));

  const c1=q('#chart-dash-bar');
  if(c1)drawBarChart(c1,MOIS_COURT,[{data:caParMois,color:COLORS.blue},{data:chParMois,color:COLORS.violet}]);
  const leg=q('#chart-dash-bar-legend');
  if(leg)leg.innerHTML=`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:${COLORS.blue}"></div>CA</div><div class="chart-legend-item"><div class="chart-legend-dot" style="background:${COLORS.violet}"></div>Charges</div>`;
  const c2=q('#chart-dash-line');
  if(c2)drawLineChart(c2,MOIS_COURT,netParMois,COLORS.success);

  // Dernières transactions
  const tEl=q('#dash-transactions-list');
  if(tEl){
    const tx=[...transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    tEl.innerHTML=tx.length?tx.map(t=>`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <div><div style="font-weight:500;">${t.libelle||'—'}</div><div style="font-size:11px;color:var(--text-2);">${fmtDate(t.date)}</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:${t.type==='credit'?'var(--success)':'var(--danger)'};">${t.type==='credit'?'+':'−'}${fmt(t.montant||0)}</span>
      </div>`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucune transaction</p>';
  }

  // Prochains abonnements
  const aEl=q('#dash-abonnements-list');
  if(aEl){
    const todayD=now.getDate();
    const actifs=abonnements.filter(a=>a.statut==='actif').map(a=>{
      let j=(a.jour||1)-todayD;if(j<0)j+=31;
      return{...a,joursAvant:j};
    }).sort((a,b)=>a.joursAvant-b.joursAvant).slice(0,5);
    aEl.innerHTML=actifs.length?actifs.map(a=>`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <div><div style="font-weight:500;">${a.nom}</div><div style="font-size:11px;color:var(--text-2);">Jour ${a.jour||'—'} · dans ${a.joursAvant} j</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--navy);">${fmt(a.montant||0)}</span>
      </div>`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucun abonnement actif</p>';
  }

  // Alerte URSSAF si ≤ 30 jours
  const alEl=q('#dash-urssaf-alert');
  if(alEl){
    if(prochaineEcheance&&prochaineEcheance.joursRestants<=30){
      alEl.innerHTML=`<div class="alert danger"><i class="ti ti-alert-triangle"></i> URSSAF ${prochaineEcheance.label} à payer dans ${prochaineEcheance.joursRestants} jours (échéance ${fmtDate(prochaineEcheance.echeance)})</div>`;
    }else alEl.innerHTML='';
  }
}

/* --- Vue d'ensemble --------------------------------------------------- */
function loadVueEnsemble(){
  const factures =dbGet('factures');
  const settings =dbGetObj('settings');
  const y=new Date().getFullYear();
  const moisActuels=new Date().getMonth()+1;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;

  const caParMois=MOIS_COURT.map((_,mi)=>{
    const k=`${y}-${String(mi+1).padStart(2,'0')}`;
    return factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);
  });
  const cumul=caParMois.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);

  const c=q('#chart-ve-solde');if(c)drawLineChart(c,MOIS_COURT,cumul,COLORS.navy);

  const tbody=q('#ve-recap-tbody');
  if(tbody){
    tbody.innerHTML=MOIS_COURT.map((mLabel,mi)=>{
      const ca=caParMois[mi];
      const charges=Math.round(ca*(tauxU+tauxC)*100)/100+(settings.pasFixe||40);
      const net=Math.max(0,ca-charges);
      const vers=Math.round(net*(settings.pctVersement||65)/100*100)/100;
      return`<tr><td>${mLabel}</td><td class="td-amount">${ca?fmt(ca):'—'}</td><td class="td-amount">${ca?fmt(charges):'—'}</td><td class="td-amount">${ca?fmt(net):'—'}</td><td class="td-amount">${ca?fmt(vers):'—'}</td></tr>`;
    }).join('');
  }

  const caYTD=caParMois.slice(0,moisActuels).reduce((a,b)=>a+b,0);
  const moyenne=moisActuels>0?caYTD/moisActuels:0;
  const projection=moyenne*12;
  const vp=q('#ve-projection');
  if(vp)vp.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">CA YTD</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(caYTD)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Moyenne mensuelle</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(moyenne)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(projection)}</div></div>
    </div>`;
}

/* --- Comptes ---------------------------------------------------------- */
function loadComptes(){
  renderComptes();
}
function renderComptes(){
  const comptes=dbGet('comptes');
  const g=q('#comptes-grid');
  if(!g)return;
  g.innerHTML=comptes.length?comptes.map(c=>`
    <div class="compte-card">
      <div class="compte-card-header">
        <span class="compte-nom">${c.nom}</span>
        <span class="badge badge-neutral">${c.type}</span>
      </div>
      <div class="compte-solde">${fmt(c.solde||0)}</div>
      <div class="compte-upd">${c.updatedAt?'Mis à jour '+fmtDate(c.updatedAt.slice(0,10)):''}</div>
      <div class="compte-historique">${(c.historique||[]).slice(-5).reverse().map(h=>`<div class="compte-historique-item"><span>${fmtDate(h.date)} ${h.libelle||''}</span><span>${fmt(h.montant||0)}</span></div>`).join('')}</div>
      <div class="compte-actions">
        <button class="btn btn-secondary btn-sm" onclick="openCompteUpdateModal('${c.id}')"><i class="ti ti-refresh"></i> Mettre à jour</button>
        <button class="btn btn-ghost btn-sm" onclick="openCompteModal('${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCompte('${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join(''):'<p style="color:var(--text-2);">Aucun compte</p>';
}
function openCompteModal(idOuVide=''){
  const data=idOuVide?dbGet('comptes').find(x=>x.id===idOuVide)||{}:{};
  q('#modal-compte-title').textContent=data.id?'Modifier le compte':'Nouveau compte';
  q('#cpt-nom').value=data.nom||'';
  q('#cpt-type').value=data.type||'courant';
  q('#cpt-solde').value=data.solde||'';
  q('#btn-save-compte').dataset.id=data.id||'';
  openModal('modal-compte');
}
async function saveCompte(){
  const id=q('#btn-save-compte').dataset.id;
  const body={nom:q('#cpt-nom').value.trim(),type:q('#cpt-type').value,solde:parseFloat(q('#cpt-solde').value)||0};
  if(!body.nom){toast('Nom requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('comptes',body);}else{await dbCreate('comptes',body);}
    closeModal('modal-compte');toast('Compte enregistré','success');renderComptes();
  }catch(e){toast(e.message||'Erreur','error');}
}
let _compteUpdateId=null;
function openCompteUpdateModal(id){
  _compteUpdateId=id;
  const c=dbGet('comptes').find(x=>x.id===id);
  if(q('#modal-compte-update-title'))q('#modal-compte-update-title').textContent=`Mettre à jour — ${c?.nom}`;
  q('#cu-solde').value=c?.solde||'';
  q('#cu-libelle').value='';
  openModal('modal-compte-update');
}
async function saveCompteUpdate(){
  const solde=parseFloat(q('#cu-solde').value);
  const libelle=q('#cu-libelle').value.trim();
  if(isNaN(solde)){toast('Solde invalide','error');return;}
  try{
    await api('PUT',`/api/comptes/${_compteUpdateId}`,{solde});
    await api('POST',`/api/comptes/${_compteUpdateId}/historique`,{date:today(),montant:solde,libelle});
    // Recharger les comptes depuis l'API
    _cache.comptes = await api('GET','/api/comptes');
    closeModal('modal-compte-update');toast('Solde mis à jour','success');renderComptes();
  }catch(e){toast(e.message||'Erreur','error');}
}
function deleteCompte(id){
  confirmDialog('Supprimer le compte','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('comptes',id);toast('Compte supprimé');renderComptes();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Transactions ----------------------------------------------------- */
let txnData=[];
function loadTransactions(){
  txnData=dbGet('transactions');
  const comptes=dbGet('comptes');
  [q('#txn-filter-compte'),q('#txn-compte')].forEach(sel=>{
    if(!sel)return;
    const cur=sel.value;
    sel.innerHTML=sel.id==='txn-filter-compte'?'<option value="">Tous les comptes</option>':'';
    comptes.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.nom;sel.appendChild(o);});
    if(cur)sel.value=cur;
  });
  renderTransactions();
}
function renderTransactions(){
  const search=q('#txn-search')?.value.toLowerCase()||'';
  const compte=q('#txn-filter-compte')?.value||'';
  const type=q('#txn-filter-type')?.value||'';
  let list=[...txnData];
  if(search)list=list.filter(t=>(t.libelle||'').toLowerCase().includes(search));
  if(compte)list=list.filter(t=>t.compte===compte);
  if(type)list=list.filter(t=>t.type===type);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const comptes=dbGet('comptes');
  const getN=id=>comptes.find(c=>c.id===id)?.nom||'—';
  const tbody=q('#txn-tbody');
  if(!tbody)return;
  tbody.innerHTML=list.length?list.map(t=>`<tr>
    <td>${fmtDate(t.date)}</td><td>${t.libelle||'—'}</td>
    <td>${getN(t.compte)}</td>
    <td><span class="badge badge-${t.type==='credit'?'success':t.type==='debit'?'danger':'neutral'}">${t.type}</span></td>
    <td class="td-amount" style="color:${t.type==='credit'?'var(--success)':'var(--danger)'};">${t.type==='credit'?'+':'−'}${fmt(t.montant||0)}</td>
    <td><button class="btn btn-ghost btn-xs" onclick="deleteTxn('${t.id}')"><i class="ti ti-trash"></i></button></td>
  </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-2);">Aucune transaction</td></tr>';
}
function openTxnModal(){
  q('#txn-date').value=today();q('#txn-type').value='credit';
  q('#txn-libelle').value='';q('#txn-montant').value='';
  q('#btn-save-txn').dataset.id='';
  openModal('modal-transaction');
}
async function saveTxn(){
  const body={date:q('#txn-date').value,type:q('#txn-type').value,libelle:q('#txn-libelle').value.trim(),compte:q('#txn-compte')?.value||'',montant:parseFloat(q('#txn-montant').value)||0};
  if(!body.libelle){toast('Libellé requis','error');return;}
  try{
    await dbCreate('transactions',body);
    txnData=dbGet('transactions');
    closeModal('modal-transaction');toast('Transaction enregistrée','success');renderTransactions();
  }catch(e){toast(e.message||'Erreur','error');}
}
function deleteTxn(id){
  confirmDialog('Supprimer','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{
      await dbDelete('transactions',id);
      txnData=dbGet('transactions');
      toast('Transaction supprimée');renderTransactions();
    }catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Factures --------------------------------------------------------- */
let facturesData=[];
function loadFactures(){
  facturesData=dbGet('factures');
  const total=facturesData.reduce((s,f)=>s+(f.montant||0),0);
  const paye=facturesData.filter(f=>f.statut==='payee').reduce((s,f)=>s+(f.montant||0),0);
  const attente=facturesData.filter(f=>f.statut==='attente').reduce((s,f)=>s+(f.montant||0),0);
  const taux=total>0?Math.round(paye/total*100):0;
  if(q('#fac-kpi-total'))q('#fac-kpi-total').textContent=fmt(total);
  if(q('#fac-kpi-paye'))q('#fac-kpi-paye').textContent=fmt(paye);
  if(q('#fac-kpi-attente'))q('#fac-kpi-attente').textContent=fmt(attente);
  if(q('#fac-kpi-taux'))q('#fac-kpi-taux').textContent=`${taux}%`;
  renderFactures();
  // Graphiques
  const y=new Date().getFullYear();
  const payees=facturesData.filter(f=>f.statut==='payee');
  const byClient={};payees.forEach(f=>{byClient[f.client||'—']=(byClient[f.client||'—']||0)+(f.montant||0);});
  const topClients=Object.entries(byClient).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const c1=q('#chart-fac-client');
  if(c1&&topClients.length)drawDonutChart(c1,topClients.map(([k])=>k),topClients.map(([,v])=>v),PALETTE);
  const caMois=MOIS_COURT.map((_,mi)=>{const k=`${y}-${String(mi+1).padStart(2,'0')}`;return payees.filter(f=>(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);});
  const c2=q('#chart-fac-mois');
  if(c2)drawBarChart(c2,MOIS_COURT,[{data:caMois,color:COLORS.blue}]);
}
function renderFactures(){
  const search=q('#factures-search')?.value.toLowerCase()||'';
  const statut=q('#factures-filter-statut')?.value||'';
  let list=[...facturesData];
  if(search)list=list.filter(f=>((f.numero||'')+(f.client||'')+(f.description||'')).toLowerCase().includes(search));
  if(statut)list=list.filter(f=>f.statut===statut);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const tbody=q('#factures-tbody');
  if(!tbody)return;
  tbody.innerHTML=list.length?list.map(f=>`<tr>
    <td>${fmtDate(f.date)}</td>
    <td class="td-mono">${f.numero||'—'}</td>
    <td>${f.client||'—'}</td>
    <td class="td-muted">${f.description||'—'}</td>
    <td class="td-amount">${fmt(f.montant||0)}</td>
    <td><span class="badge badge-${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}">${f.statut==='payee'?'Payée':f.statut==='retard'?'En retard':'En attente'}</span></td>
    <td style="white-space:nowrap;">
      <button class="btn btn-ghost btn-xs" onclick="editFacture('${f.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteFacture('${f.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">Aucune facture</td></tr>';
}
function openFactureModal(data={}){
  q('#modal-facture-title').textContent=data.id?'Modifier la facture':'Nouvelle facture';
  q('#f-numero').value=data.numero||'';q('#f-statut').value=data.statut||'attente';
  q('#f-client').value=data.client||'';q('#f-description').value=data.description||'';
  q('#f-date').value=data.date||today();q('#f-montant').value=data.montant||'';
  q('#btn-save-facture').dataset.id=data.id||'';
  openModal('modal-facture');
}
async function saveFacture(){
  const id=q('#btn-save-facture').dataset.id;
  const body={numero:q('#f-numero').value.trim(),statut:q('#f-statut').value,client:q('#f-client').value.trim(),description:q('#f-description').value.trim(),date:q('#f-date').value,montant:parseFloat(q('#f-montant').value)||0};
  if(!body.client||!body.montant){toast('Client et montant requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('factures',body);}else{await dbCreate('factures',body);}
    facturesData=dbGet('factures');
    closeModal('modal-facture');toast('Facture enregistrée','success');loadFactures();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editFacture(id){const f=facturesData.find(x=>x.id===id);if(f)openFactureModal(f);}
function deleteFacture(id){
  confirmDialog('Supprimer la facture','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('factures',id);facturesData=dbGet('factures');toast('Facture supprimée');loadFactures();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Objectifs CA ----------------------------------------------------- */
function loadObjectifsCA(){
  const settings=dbGetObj('settings');
  const factures=dbGet('factures');
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const objectif=settings.objectifCA||60000;
  const payees=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(String(y)));
  const atteint=payees.reduce((s,f)=>s+(f.montant||0),0);
  const pct=objectif>0?Math.min(100,Math.round(atteint/objectif*100)):0;
  const moyenneActuel=m>0?atteint/m:0;
  const resteMois=12-m+1;
  const necessaire=resteMois>0?Math.max(0,(objectif-atteint)/resteMois):0;
  const projFin=moyenneActuel*12;

  if(q('#objca-kpi-objectif'))q('#objca-kpi-objectif').textContent=fmt(objectif);
  if(q('#objca-kpi-atteint'))q('#objca-kpi-atteint').textContent=fmt(atteint);
  if(q('#objca-kpi-moyen-actuel'))q('#objca-kpi-moyen-actuel').textContent=fmt(moyenneActuel);
  if(q('#objca-kpi-necessaire'))q('#objca-kpi-necessaire').textContent=fmt(necessaire);
  if(q('#objca-gauge-pct'))q('#objca-gauge-pct').textContent=`${pct}%`;
  if(q('#objca-gauge-fill')){q('#objca-gauge-fill').style.width=`${pct}%`;q('#objca-gauge-fill').style.background=pct>=100?COLORS.success:pct>=80?COLORS.warning:COLORS.blue;}
  if(q('#objca-gauge-label'))q('#objca-gauge-label').textContent=`${fmt(atteint)} sur ${fmt(objectif)}`;

  const al=q('#objca-alert');
  if(al)al.innerHTML=projFin<objectif?`<div class="alert warning"><i class="ti ti-alert-triangle"></i> Projection fin d'année : ${fmt(projFin)} — en dessous de l'objectif de ${fmt(objectif)}</div>`:'';

  const pr=q('#objca-projection');
  if(pr)pr.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">${fmt(projFin)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Objectif</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">${fmt(objectif)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Écart projeté</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:${projFin>=objectif?'var(--success)':'var(--danger)'};">${fmt(projFin-objectif)}</div></div>
    </div>`;

  const caMois=MOIS_COURT.map((_,mi)=>{const k=`${y}-${String(mi+1).padStart(2,'0')}`;return factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);});
  const targetMois=Array(12).fill(Math.round(objectif/12));
  const c=q('#chart-objca');
  if(c)drawBarChart(c,MOIS_COURT,[{data:caMois,color:COLORS.blue},{data:targetMois,color:COLORS.muted}]);
}
function openObjectifCAModal(){
  const s=dbGetObj('settings');
  q('#obj-ca-val').value=s.objectifCA||60000;
  openModal('modal-objectif-ca');
}
async function saveObjectifCA(){
  const val=parseFloat(q('#obj-ca-val').value)||0;
  try{
    await dbSet('objectif_ca',{annee:new Date().getFullYear(),montant:val});
    const s=dbGetObj('settings');
    await dbSet('settings',{...s,objectifCA:val});
    closeModal('modal-objectif-ca');toast('Objectif mis à jour','success');loadObjectifsCA();
  }catch(e){toast(e.message||'Erreur','error');}
}

/* --- Dépenses --------------------------------------------------------- */
let depensesData=[];
function loadDepenses(){
  depensesData=dbGet('depenses');
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const ytd=depensesData.filter(d=>(d.date||'').startsWith(String(y))).reduce((s,d)=>s+(d.montant||0),0);
  const mois=depensesData.filter(d=>(d.date||'').startsWith(mKey)).reduce((s,d)=>s+(d.montant||0),0);
  const moisAvec=new Set(depensesData.filter(d=>(d.date||'').startsWith(String(y))).map(d=>(d.date||'').slice(0,7))).size||1;
  const moyenne=ytd/moisAvec;
  const bycat={};depensesData.forEach(d=>{bycat[d.categorie||'Autre']=(bycat[d.categorie||'Autre']||0)+(d.montant||0);});
  const topCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1])[0];
  if(q('#dep-kpi-mois'))q('#dep-kpi-mois').textContent=fmt(mois);
  if(q('#dep-kpi-ytd'))q('#dep-kpi-ytd').textContent=fmt(ytd);
  if(q('#dep-kpi-moyenne'))q('#dep-kpi-moyenne').textContent=fmt(moyenne);
  if(q('#dep-kpi-cat'))q('#dep-kpi-cat').textContent=topCat?topCat[0].slice(0,12):'—';
  renderDepenses();
  const cats=Object.keys(bycat);
  const c1=q('#chart-dep-cat');
  if(c1&&cats.length)drawDonutChart(c1,cats,cats.map(k=>bycat[k]),PALETTE);
  const caMois=MOIS_COURT.map((_,mi)=>{const k=`${y}-${String(mi+1).padStart(2,'0')}`;return depensesData.filter(d=>(d.date||'').startsWith(k)).reduce((s,d)=>s+(d.montant||0),0);});
  const c2=q('#chart-dep-mois');if(c2)drawBarChart(c2,MOIS_COURT,[{data:caMois,color:COLORS.violet}]);
}
function renderDepenses(){
  const search=q('#depenses-search')?.value.toLowerCase()||'';
  const cat=q('#depenses-filter-cat')?.value||'';
  let list=[...depensesData];
  if(search)list=list.filter(d=>(d.description||d.libelle||'').toLowerCase().includes(search));
  if(cat)list=list.filter(d=>d.categorie===cat);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const tbody=q('#depenses-tbody');
  if(!tbody)return;
  tbody.innerHTML=list.length?list.map(d=>`<tr>
    <td>${fmtDate(d.date)}</td>
    <td>${d.description||d.libelle||'—'}</td>
    <td><span class="badge badge-neutral">${d.categorie||'—'}</span></td>
    <td class="td-amount">${fmt(d.montant||0)}</td>
    <td>
      <button class="btn btn-ghost btn-xs" onclick="editDepense('${d.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteDepense('${d.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-2);">Aucune dépense</td></tr>';
}
function openDepenseModal(data={}){
  q('#modal-depense-title').textContent=data.id?'Modifier la dépense':'Nouvelle dépense';
  q('#d-date').value=data.date||today();
  q('#d-categorie').value=data.categorie||'Logiciels & abonnements';
  q('#d-description').value=data.description||data.libelle||'';
  q('#d-montant').value=data.montant||'';
  q('#btn-save-depense').dataset.id=data.id||'';
  openModal('modal-depense');
}
async function saveDepense(){
  const id=q('#btn-save-depense').dataset.id;
  const body={date:q('#d-date').value,categorie:q('#d-categorie').value,description:q('#d-description').value.trim(),montant:parseFloat(q('#d-montant').value)||0};
  if(!body.description){toast('Description requise','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('depenses',body);}else{await dbCreate('depenses',body);}
    depensesData=dbGet('depenses');
    closeModal('modal-depense');toast('Dépense enregistrée','success');loadDepenses();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editDepense(id){const d=depensesData.find(x=>x.id===id);if(d)openDepenseModal(d);}
function deleteDepense(id){
  confirmDialog('Supprimer','Irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('depenses',id);depensesData=dbGet('depenses');toast('Dépense supprimée');loadDepenses();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Abonnements ------------------------------------------------------ */
let aboData=[];
function loadAbonnements(){
  aboData=dbGet('abonnements');
  const actifs=aboData.filter(a=>a.statut==='actif');
  const mensuel=actifs.reduce((s,a)=>s+(a.montant||0),0);
  const annuel=mensuel*12;
  if(q('#abo-kpi-mensuel'))q('#abo-kpi-mensuel').textContent=fmt(mensuel);
  if(q('#abo-kpi-annuel'))q('#abo-kpi-annuel').textContent=fmt(annuel);
  if(q('#abo-kpi-count'))q('#abo-kpi-count').textContent=actifs.length;
  const todayD=new Date().getDate();
  const next=actifs.map(a=>{let j=(a.jour||1)-todayD;if(j<0)j+=31;return{...a,joursAvant:j};}).sort((a,b)=>a.joursAvant-b.joursAvant)[0];
  if(q('#abo-kpi-prochain'))q('#abo-kpi-prochain').textContent=next?`${next.joursAvant} j`:'—';
  if(next&&q('#abo-kpi-prochain-sub'))q('#abo-kpi-prochain-sub').textContent=next.nom;
  renderAbonnements();
  drawAboTimeline();
}
function renderAbonnements(){
  const tbody=q('#abonnements-tbody');
  if(!tbody)return;
  tbody.innerHTML=aboData.length?aboData.map(a=>`<tr>
    <td style="font-weight:500;">${a.nom}</td>
    <td><span class="badge badge-neutral">${a.categorie||'—'}</span></td>
    <td class="td-amount">${fmt(a.montant||0)}</td>
    <td class="td-amount" style="color:var(--text-2);">${fmt((a.montant||0)*12)}</td>
    <td>Jour ${a.jour||'—'}</td>
    <td><span class="badge badge-${a.statut==='actif'?'actif':a.statut==='pause'?'pause':'annule'}">${a.statut==='actif'?'Actif':a.statut==='pause'?'Pausé':'Annulé'}</span></td>
    <td>
      <button class="btn btn-ghost btn-xs" onclick="editAbonnement('${a.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteAbonnement('${a.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">Aucun abonnement</td></tr>';
}
function drawAboTimeline(){
  const canvas=q('#chart-abo-timeline');
  if(!canvas)return;
  const actifs=aboData.filter(a=>a.statut==='actif');
  const W=canvas.parentElement?.offsetWidth||700,H=120;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const padL=8,padR=8;
  const trackY=H/2;
  const dayW=(W-padL-padR)/31;
  ctx.strokeStyle=COLORS.muted;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(padL,trackY);ctx.lineTo(W-padR,trackY);ctx.stroke();
  ctx.fillStyle=COLORS.text2;ctx.font='10px DM Sans,sans-serif';ctx.textAlign='center';
  for(let d=1;d<=31;d++){
    const x=padL+(d-1)*dayW+dayW/2;
    if(d%5===0||d===1||d===31)ctx.fillText(d,x,H-4);
    ctx.strokeStyle=COLORS.muted;ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x,trackY-4);ctx.lineTo(x,trackY+4);ctx.stroke();
  }
  actifs.forEach((a,i)=>{
    const x=padL+((a.jour||1)-1)*dayW+dayW/2;
    const col=PALETTE[i%PALETTE.length];
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,trackY,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 8px DM Sans,sans-serif';ctx.textAlign='center';
    ctx.fillText(a.nom.slice(0,2).toUpperCase(),x,trackY+3);
    ctx.fillStyle=COLORS.text2;ctx.font='9px DM Sans,sans-serif';
    ctx.fillText(a.nom.slice(0,10),x,i%2===0?trackY-18:trackY+24);
  });
}
function openAbonnementModal(data={}){
  q('#modal-abonnement-title').textContent=data.id?'Modifier':'Nouvel abonnement';
  q('#abo-nom').value=data.nom||'';
  q('#abo-montant').value=data.montant||'';
  q('#abo-jour').value=data.jour||1;
  q('#abo-categorie').value=data.categorie||'Logiciels';
  q('#abo-statut').value=data.statut||'actif';
  q('#btn-save-abonnement').dataset.id=data.id||'';
  openModal('modal-abonnement');
}
async function saveAbonnement(){
  const id=q('#btn-save-abonnement').dataset.id;
  const nom=q('#abo-nom').value.trim();
  const montantMensuel=parseFloat(q('#abo-montant').value)||0;
  const jourPrelevement=parseInt(q('#abo-jour').value)||1;
  const body={nom,montantMensuel,jourPrelevement,categorie:q('#abo-categorie').value,statut:q('#abo-statut').value};
  if(!nom){toast('Nom requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('abonnements',body);}else{await dbCreate('abonnements',body);}
    aboData=dbGet('abonnements');
    closeModal('modal-abonnement');toast('Abonnement enregistré','success');loadAbonnements();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editAbonnement(id){const a=aboData.find(x=>x.id===id);if(a)openAbonnementModal(a);}
function deleteAbonnement(id){
  confirmDialog('Supprimer','Irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('abonnements',id);aboData=dbGet('abonnements');toast('Supprimé');loadAbonnements();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Charges URSSAF --------------------------------------------------- */
let urssafCurrentCle=null;
function loadChargesURSSAF(){
  const factures    =dbGet('factures');
  const depenses    =dbGet('depenses');
  const abonnements =dbGet('abonnements');
  const settings    =dbGetObj('settings');
  const urssafObj   =dbGetObj('urssaf');
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40;
  const cfe=(settings.cfe||0)/12;

  // Calcul CA par trimestre
  const moisQ={T1:[1,2,3],T2:[4,5,6],T3:[7,8,9],T4:[10,11,12]};
  const echeances={T1:`${y}-04-30`,T2:`${y}-07-31`,T3:`${y}-10-31`,T4:`${y+1}-01-31`};
  const labelsQ={T1:'T1 (jan–mar)',T2:'T2 (avr–jun)',T3:'T3 (jul–sep)',T4:'T4 (oct–déc)'};
  const quarters=['T1','T2','T3','T4'];
  const grid=q('#urssaf-cards-grid');
  if(grid){
    grid.innerHTML=quarters.map(t=>{
      const cle=`${t}-${y}`;
      const d=urssafObj[cle]||{};
      const moisTrim=moisQ[t];
      const caT=moisTrim.reduce((s,mi)=>{
        const k=`${y}-${String(mi).padStart(2,'0')}`;
        return s+factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((ss,f)=>ss+(f.montant||0),0);
      },0);
      const urssafDue=Math.round(caT*tauxU*100)/100;
      const cfpDue   =Math.round(caT*tauxC*100)/100;
      const total    =urssafDue+cfpDue;
      const ech=echeances[t];
      const jours=Math.ceil((new Date(ech)-now)/86400000);
      const statut=d.statut==='paye'?'paye':jours<0?'a_payer':'a_venir';
      const pct=total>0?Math.min(100,Math.round((d.montantPaye||0)/total*100)):0;
      const countdown=statut==='paye'?`<span style="color:var(--success);">Payé le ${fmtDate(d.datePaye)} — ${fmt(d.montantPaye||0)}</span>`:jours<=0?`<span class="urssaf-countdown rouge">Échu</span>`:`<span class="urssaf-countdown ${jours<=30?'rouge':jours<=60?'orange':''}">${jours} jours restants</span>`;
      return`<div class="urssaf-card ${jours<=30&&statut!=='paye'?'alerte-rouge':jours<=60&&statut!=='paye'?'alerte-orange':''}">
        <div class="urssaf-header">
          <div><div class="urssaf-titre">${labelsQ[t]}</div><div class="urssaf-echeance">Échéance ${fmtDate(ech)}</div></div>
          <span class="badge badge-${statut==='paye'?'paye':statut==='a_payer'?'a-payer':'a-venir'}">${statut==='paye'?'Payé':statut==='a_payer'?'À payer':'À venir'}</span>
        </div>
        <div class="urssaf-montant">${fmt(total)}</div>
        <div class="urssaf-detail">CA ${fmt(caT)} · URSSAF ${fmt(urssafDue)} · CFP ${fmt(cfpDue)}</div>
        ${countdown}
        <div class="progress-bar" style="margin:8px 0;"><div class="fill ${pct>=100?'green':''}" style="width:${pct}%"></div></div>
        ${statut!=='paye'?`<button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="openURSSAFPaiement('${cle}')"><i class="ti ti-check"></i> Marquer payé</button>`:''}
      </div>`;
    }).join('');
  }

  // Charges mensuelles
  const caMois=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const urssafM=Math.round(caMois*tauxU*100)/100;
  const cfpM   =Math.round(caMois*tauxC*100)/100;
  const aboM   =abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const depM   =depenses.filter(d=>(d.date||'').startsWith(mKey)).reduce((s,d)=>s+(d.montant||0),0);
  const totalCharges=urssafM+cfpM+pas+cfe+aboM;
  const net=Math.max(0,caMois-totalCharges-depM);

  const rl=q('#charges-recap-list');
  if(rl)rl.innerHTML=`
    <div class="charges-recap-line"><span class="charges-recap-label">URSSAF provision (${settings.tauxUrssaf||25.6}%)</span><span class="charges-recap-amount">${fmt(urssafM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFP provision (${settings.tauxCfp||0.2}%)</span><span class="charges-recap-amount">${fmt(cfpM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">PAS fixe</span><span class="charges-recap-amount">${fmt(pas)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFE mensuelle</span><span class="charges-recap-amount">${fmt(cfe)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">Abonnements actifs</span><span class="charges-recap-amount">${fmt(aboM)}</span></div>
    <div class="charges-recap-total"><span class="label">Total charges</span><span class="amount">${fmt(totalCharges)}</span></div>
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;">Ratio charges/CA : ${caMois>0?Math.round(totalCharges/caMois*100):0}%</div>`;
  const dm=q('#charges-depenses-mois');
  if(dm)dm.innerHTML=`
    <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro ce mois</span><span class="charges-recap-amount">${fmt(depM)}</span></div>
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;"><a style="cursor:pointer;color:var(--navy);" onclick="navigate('depenses')">Voir les dépenses →</a></div>`;
  if(q('#cru-ca'))q('#cru-ca').textContent=fmt(caMois);
  if(q('#cru-charges'))q('#cru-charges').textContent=fmt(totalCharges+depM);
  if(q('#cru-net'))q('#cru-net').textContent=fmt(net);
  if(q('#cru-versement'))q('#cru-versement').textContent=fmt(net*(settings.pctVersement||65)/100);
}
function openURSSAFPaiement(cle){
  urssafCurrentCle=cle;
  if(q('#modal-urssaf-title'))q('#modal-urssaf-title').textContent=`Paiement ${cle}`;
  if(q('#modal-urssaf-detail'))q('#modal-urssaf-detail').textContent='Saisissez le montant réellement payé à l\'URSSAF.';
  q('#urs-date-paye').value=today();q('#urs-montant-paye').value='';
  openModal('modal-urssaf');
}
async function saveURSSAFPaiement(){
  const montantPaye=parseFloat(q('#urs-montant-paye').value)||0;
  const datePaye=q('#urs-date-paye').value;
  try{
    await api('PUT',`/api/urssaf/${urssafCurrentCle}`,{statut:'paye',montantPaye,datePaye});
    _cache.urssaf = await api('GET','/api/urssaf');
    closeModal('modal-urssaf');toast('Paiement enregistré','success');loadChargesURSSAF();
  }catch(e){toast(e.message||'Erreur','error');}
}

/* --- Répartition ------------------------------------------------------ */
function loadRepartition(){
  const settings   =dbGetObj('settings');
  const factures   =dbGet('factures');
  const repartition=dbGetObj('repartition');
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const caMois=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const pctV=settings.pctVersement||65,pctE=settings.pctEpargne||15,pctT=settings.pctTresorerie||20;
  const recommV=Math.round(caMois*pctV/100),recommE=Math.round(caMois*pctE/100),recommT=Math.round(caMois*pctT/100);
  if(q('#rep-recomm-versement'))q('#rep-recomm-versement').textContent=fmt(recommV);
  if(q('#rep-recomm-epargne'))q('#rep-recomm-epargne').textContent=fmt(recommE);
  if(q('#rep-recomm-tresorerie'))q('#rep-recomm-tresorerie').textContent=fmt(recommT);
  const rv=repartition.versement||0,re=repartition.epargne||0,rt=repartition.tresorerie||0;
  if(q('#rep-input-versement'))q('#rep-input-versement').value=rv||'';
  if(q('#rep-input-epargne'))q('#rep-input-epargne').value=re||'';
  if(q('#rep-input-tresorerie'))q('#rep-input-tresorerie').value=rt||'';
  const setEcart=(el,reel,recomm)=>{if(!el)return;const e=reel-recomm;el.innerHTML=e>=0?`<span class="ok">+${fmt(e)} vs recommandé</span>`:`<span class="ko">${fmt(e)} vs recommandé</span>`;};
  setEcart(q('#rep-ecart-versement'),rv,recommV);
  setEcart(q('#rep-ecart-epargne'),re,recommE);
  setEcart(q('#rep-ecart-tresorerie'),rt,recommT);
  if(q('#rep-bar-versement'))q('#rep-bar-versement').style.width=`${recommV>0?Math.min(100,Math.round(rv/recommV*100)):0}%`;
  if(q('#rep-bar-epargne'))q('#rep-bar-epargne').style.width=`${recommE>0?Math.min(100,Math.round(re/recommE*100)):0}%`;
  if(q('#rep-bar-tresorerie'))q('#rep-bar-tresorerie').style.width=`${recommT>0?Math.min(100,Math.round(rt/recommT*100)):0}%`;
  const c1=q('#chart-rep-donut');
  if(c1)drawDonutChart(c1,['Versement','Épargne','Tréso'],[pctV,pctE,pctT],[COLORS.navy,COLORS.success,COLORS.blue]);
  const c2=q('#chart-rep-bar');
  if(c2)drawBarChart(c2,['Versement','Épargne','Tréso'],[{data:[recommV,recommE,recommT],color:COLORS.muted},{data:[rv,re,rt],color:COLORS.navy}]);
}
async function saveRepartition(){
  const body={versement:parseFloat(q('#rep-input-versement').value)||0,epargne:parseFloat(q('#rep-input-epargne').value)||0,tresorerie:parseFloat(q('#rep-input-tresorerie').value)||0};
  try{await dbSet('repartition',body);toast('Répartition enregistrée','success');loadRepartition();}
  catch(e){toast(e.message||'Erreur','error');}
}

/* --- Objectifs épargne ------------------------------------------------ */
let epargneGoals=[];
function loadObjectifsEpargne(){
  epargneGoals=dbGet('objectifs_epargne');
  renderEpargneGoals();
}
function renderEpargneGoals(){
  const g=q('#epargne-goals-grid');
  if(!g)return;
  if(!epargneGoals.length){g.innerHTML='<p style="color:var(--text-2);">Aucun objectif. Cliquez sur + pour en créer.</p>';return;}
  g.innerHTML=epargneGoals.map(obj=>{
    const cible=obj.cible||0,actuel=obj.actuel||0;
    const pct=cible>0?Math.min(100,Math.round(actuel/cible*100)):0;
    return`<div class="goal-card">
      <div class="goal-card-header">
        <div class="goal-card-name">${obj.nom}</div>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="editEpargneGoal('${obj.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-ghost btn-xs" onclick="deleteEpargneGoal('${obj.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div class="goal-amounts"><div class="goal-current">${fmt(actuel)}</div><div class="goal-target">sur ${fmt(cible)}</div></div>
      <div class="goal-bar-wrap"><div class="goal-bar" style="width:${pct}%"></div></div>
      <div class="goal-pct">${pct}%</div>
      ${obj.dateCible?`<div class="goal-date"><i class="ti ti-calendar"></i> Cible ${fmtDate(obj.dateCible)}</div>`:''}
    </div>`;
  }).join('');
}
function openEpargneGoalModal(data={}){
  q('#modal-obj-epargne-title').textContent=data.id?'Modifier':'Nouvel objectif';
  q('#obj-nom').value=data.nom||'';
  q('#obj-cible').value=data.cible||'';
  q('#obj-actuel').value=data.actuel||0;
  q('#obj-date').value=data.dateCible||'';
  q('#btn-save-obj-epargne').dataset.id=data.id||'';
  openModal('modal-objectif-epargne');
}
async function saveEpargneGoal(){
  const id=q('#btn-save-obj-epargne').dataset.id;
  const nom=q('#obj-nom').value.trim();
  const montantCible=parseFloat(q('#obj-cible').value)||0;
  const montantActuel=parseFloat(q('#obj-actuel').value)||0;
  const body={nom,montantCible,montantActuel,dateCible:q('#obj-date').value||''};
  if(!nom||!montantCible){toast('Nom et cible requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('objectifs_epargne',body);}else{await dbCreate('objectifs_epargne',body);}
    epargneGoals=dbGet('objectifs_epargne');
    closeModal('modal-objectif-epargne');toast('Objectif enregistré','success');renderEpargneGoals();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editEpargneGoal(id){const g=epargneGoals.find(x=>x.id===id);if(g)openEpargneGoalModal(g);}
function deleteEpargneGoal(id){
  confirmDialog('Supprimer','Irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('objectifs_epargne',id);epargneGoals=dbGet('objectifs_epargne');toast('Supprimé');renderEpargneGoals();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Rapport mensuel -------------------------------------------------- */
function loadRapportMensuel(){
  const y=new Date().getFullYear();
  const selA=q('#rm-annee');
  if(selA&&!selA.options.length){for(let i=y;i>=y-3;i--)selA.add(new Option(i,i));selA.value=y;}
  if(q('#rm-mois'))q('#rm-mois').value=new Date().getMonth()+1;
}
function renderRapportMensuel(){
  const mois=parseInt(q('#rm-mois')?.value||new Date().getMonth()+1);
  const annee=parseInt(q('#rm-annee')?.value||new Date().getFullYear());
  const mKey=`${annee}-${String(mois).padStart(2,'0')}`;
  const prevM=mois===1?12:mois-1;
  const prevY=mois===1?annee-1:annee;
  const prevKey=`${prevY}-${String(prevM).padStart(2,'0')}`;

  const factures =dbGet('factures');
  const depenses =dbGet('depenses');
  const abonnements=dbGet('abonnements');
  const settings =dbGetObj('settings');
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40;

  const ca=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const urssaf=Math.round(ca*tauxU*100)/100,cfp=Math.round(ca*tauxC*100)/100;
  const dep=depenses.filter(d=>(d.date||'').startsWith(mKey)).reduce((s,d)=>s+(d.montant||0),0);
  const abo=abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const charges=urssaf+cfp+dep+abo+pas;
  const net=Math.max(0,ca-charges);
  const pctVersement=settings.pctVersement||65;
  const versement=Math.round(net*pctVersement/100);

  const caPrev=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(prevKey)).reduce((s,f)=>s+(f.montant||0),0);
  const delta=caPrev>0?Math.round((ca-caPrev)/caPrev*100):null;
  const phrase=`Ce mois (${MOIS_LONG[mois-1]} ${annee}), tu as encaissé ${fmt(ca)}, soit ${delta!==null?`${delta>=0?'+':''}${delta}% vs le mois précédent`:'(premier mois)'}. Ton résultat net est de ${fmt(net)}, tu peux te verser ${fmt(versement)}.`;

  const container=q('#rapport-mensuel-content');
  if(!container)return;
  container.innerHTML=`
    <div class="rapport-phrase">${phrase}</div>
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA encaissé</span><span class="kpi-value">${fmt(ca)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges</span><span class="kpi-value danger">${fmt(charges)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">${fmt(net)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Versement (${pctVersement}%)</span><span class="kpi-value">${fmt(versement)}</span></div>
    </div>
    <div class="card">
      <div class="card-title">Détail des charges</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">URSSAF</span><span class="charges-recap-amount">${fmt(urssaf)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">CFP</span><span class="charges-recap-amount">${fmt(cfp)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro</span><span class="charges-recap-amount">${fmt(dep)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Abonnements</span><span class="charges-recap-amount">${fmt(abo)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">PAS</span><span class="charges-recap-amount">${fmt(pas)}</span></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px;">
      <div class="card-title">Comparaison mois précédent</div>
      <div style="display:flex;gap:24px;font-size:13.5px;">
        <div>CA : ${fmt(caPrev)}</div>
        <div style="color:${delta>=0?'var(--success)':'var(--danger)'};">Δ CA : ${delta!==null?(delta>=0?'+':'')+delta+'%':'—'}</div>
      </div>
    </div>`;
}

/* --- Rapport annuel --------------------------------------------------- */
function loadRapportAnnuel(){
  const y=new Date().getFullYear();
  const sel=q('#ra-annee');
  if(sel&&!sel.options.length){for(let i=y;i>=y-3;i--)sel.add(new Option(i,i));sel.value=y;}
}
function renderRapportAnnuel(){
  const annee=parseInt(q('#ra-annee')?.value||new Date().getFullYear());
  const factures =dbGet('factures');
  const depenses =dbGet('depenses');
  const abonnements=dbGet('abonnements');
  const settings =dbGetObj('settings');
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40,pctV=settings.pctVersement||65;

  const moisData=MOIS_COURT.map((_,mi)=>{
    const k=`${annee}-${String(mi+1).padStart(2,'0')}`;
    const ca=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);
    const dep=depenses.filter(d=>(d.date||'').startsWith(k)).reduce((s,d)=>s+(d.montant||0),0);
    const abo=abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
    const charges=Math.round(ca*(tauxU+tauxC)*100)/100+dep+abo+pas;
    const net=Math.max(0,ca-charges);
    return{mois:mi+1,ca,charges,net,versement:Math.round(net*pctV/100)};
  });

  const totCA=moisData.reduce((s,m)=>s+m.ca,0);
  const totCharges=moisData.reduce((s,m)=>s+m.charges,0);
  const totNet=moisData.reduce((s,m)=>s+m.net,0);
  const meilleur=moisData.reduce((best,m)=>m.ca>best.ca?m:best,moisData[0]);

  const container=q('#rapport-annuel-content');
  if(!container)return;
  container.innerHTML=`
    <div class="kpi-grid kpi-grid-3 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel</span><span class="kpi-value">${fmt(totCA)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges totales</span><span class="kpi-value danger">${fmt(totCharges)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">${fmt(totNet)}</span></div>
    </div>
    ${meilleur&&meilleur.ca>0?`<div class="alert info" style="margin-bottom:16px;"><i class="ti ti-trophy"></i> Meilleur mois : ${MOIS_LONG[meilleur.mois-1]} · ${fmt(meilleur.ca)}</div>`:''}
    <div class="card mb-16">
      <div class="card-title">Tableau mensuel</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Mois</th><th>CA</th><th>Charges</th><th>Résultat</th><th>Versement</th></tr></thead>
        <tbody>${moisData.map(m=>`<tr>
          <td>${MOIS_COURT[m.mois-1]}</td>
          <td class="td-amount">${fmt(m.ca)}</td>
          <td class="td-amount" style="color:var(--danger);">${fmt(m.charges)}</td>
          <td class="td-amount" style="color:var(--success);">${fmt(m.net)}</td>
          <td class="td-amount">${fmt(m.versement)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card"><div class="card-title">Évolution annuelle</div><div class="chart-wrap"><canvas id="chart-ra" height="200"></canvas></div></div>`;
  setTimeout(()=>{
    const c=q('#chart-ra');
    if(c)drawBarChart(c,MOIS_COURT,[{data:moisData.map(m=>m.ca),color:COLORS.blue},{data:moisData.map(m=>m.charges),color:COLORS.violet}]);
  },50);
}

/* --- Rapport fiscal --------------------------------------------------- */
function loadRapportFiscal(){
  const y=new Date().getFullYear();
  const sel=q('#rf-annee');
  if(sel&&!sel.options.length){for(let i=y;i>=y-3;i--)sel.add(new Option(i,i));sel.value=y;}
}
function renderRapportFiscal(){
  const annee=parseInt(q('#rf-annee')?.value||new Date().getFullYear());
  const factures=dbGet('factures');
  const depenses=dbGet('depenses');
  const settings=dbGetObj('settings');
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;

  const caAnnuel=factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(String(annee))).reduce((s,f)=>s+(f.montant||0),0);
  const depAnnuel=depenses.filter(d=>(d.date||'').startsWith(String(annee))).reduce((s,d)=>s+(d.montant||0),0);
  const abattement=Math.round(caAnnuel*0.34*100)/100;
  const revenuImposable=Math.max(0,caAnnuel-abattement);
  const cotisations=Math.round(caAnnuel*(tauxU+tauxC)*100)/100;
  const pctPlafond=PLAFOND_BNC>0?Math.round(caAnnuel/PLAFOND_BNC*100):0;

  // Tranches IR 2026 (célibataire)
  const tranches=[
    {min:0,max:11294,taux:0},
    {min:11294,max:28797,taux:0.11},
    {min:28797,max:82341,taux:0.30},
    {min:82341,max:177106,taux:0.41},
    {min:177106,max:Infinity,taux:0.45},
  ];
  let impotEstime=0;
  const base=Math.max(0,revenuImposable-cotisations);
  tranches.forEach(tr=>{
    if(base>tr.min){
      const imposable=Math.min(base,tr.max)-tr.min;
      impotEstime+=imposable*tr.taux;
    }
  });
  impotEstime=Math.round(impotEstime);

  const barColor=pctPlafond>=90?'var(--danger)':pctPlafond>=80?'var(--warning)':'var(--success)';
  const container=q('#rapport-fiscal-content');
  if(!container)return;
  container.innerHTML=`
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel brut</span><span class="kpi-value">${fmt(caAnnuel)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Abattement 34%</span><span class="kpi-value">${fmt(abattement)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Revenu imposable</span><span class="kpi-value">${fmt(revenuImposable)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Cotisations sociales</span><span class="kpi-value danger">${fmt(cotisations)}</span></div>
    </div>
    <div class="card mb-16">
      <div class="card-title">Plafond micro-BNC · ${fmtN(PLAFOND_BNC)} €</div>
      <div class="fiscal-plafond-wrap">
        <div class="fiscal-plafond-bar"><div class="fiscal-plafond-fill ${pctPlafond>=90?'danger':pctPlafond>=80?'warning':''}" style="width:${Math.min(100,pctPlafond)}%;background:${barColor}"></div></div>
        <div class="fiscal-plafond-pct">${pctPlafond}%</div>
      </div>
      ${pctPlafond>=80?`<div class="alert danger" style="margin-top:8px;"><i class="ti ti-alert-triangle"></i> Vous avez dépassé 80% du plafond micro-BNC. Préparez un potentiel passage au régime réel.</div>`:''}
    </div>
    <div class="card mb-16">
      <div class="card-title">Estimation impôt sur le revenu ${annee}</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">Revenu imposable (après abattement)</span><span class="charges-recap-amount">${fmt(revenuImposable)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Cotisations sociales</span><span class="charges-recap-amount">${fmt(cotisations)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro YTD</span><span class="charges-recap-amount">${fmt(depAnnuel)}</span></div>
        <div class="charges-recap-total"><span class="label">Estimation impôt</span><span class="amount">${fmt(impotEstime)}</span></div>
      </div>
      <p style="font-size:11px;color:var(--text-2);margin-top:10px;">Estimation indicative basée sur les tranches ${annee}. Consultez un comptable pour votre déclaration.</p>
    </div>`;
}

/* --- Simulateur ------------------------------------------------------- */
function loadSimulateur(){
  const s=dbGetObj('settings');
  if(q('#sim-versement-slider'))q('#sim-versement-slider').value=s.pctVersement||65;
  if(q('#sim-slider-val'))q('#sim-slider-val').textContent=`${s.pctVersement||65}%`;
}
function calcSimMensuel(){
  const ca=parseFloat(q('#sim-ca-mois')?.value)||0;
  const dep=parseFloat(q('#sim-dep-pro')?.value)||0;
  const cfe=(parseFloat(q('#sim-cfe')?.value)||0)/12;
  const aides=parseFloat(q('#sim-aides')?.value)||0;
  const depPerso=parseFloat(q('#sim-dep-perso')?.value)||0;
  const pctV=parseInt(q('#sim-versement-slider')?.value)||65;
  const s=dbGetObj('settings');
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const urssaf=Math.round(ca*tU*100)/100,cfp=Math.round(ca*tC*100)/100;
  const net=Math.max(0,ca-urssaf-cfp-dep-cfe-pas);
  const versement=Math.round(net*pctV/100*100)/100;
  const epargne=Math.round(net*0.15*100)/100;
  const treso=Math.round(net*(1-pctV/100-0.15)*100)/100;
  if(q('#sr-ca'))q('#sr-ca').textContent=fmt(ca);
  if(q('#sr-urssaf'))q('#sr-urssaf').textContent=`− ${fmt(urssaf)}`;
  if(q('#sr-cfp'))q('#sr-cfp').textContent=`− ${fmt(cfp)}`;
  if(q('#sr-dep'))q('#sr-dep').textContent=`− ${fmt(dep)}`;
  if(q('#sr-cfe'))q('#sr-cfe').textContent=`− ${fmt(cfe)}`;
  if(q('#sr-net'))q('#sr-net').textContent=fmt(net);
  if(q('#sr-vers-label'))q('#sr-vers-label').textContent=`Je me verse (${pctV}%)`;
  if(q('#sr-versement'))q('#sr-versement').textContent=fmt(versement);
  if(q('#sr-epargne'))q('#sr-epargne').textContent=fmt(epargne);
  if(q('#sr-treso'))q('#sr-treso').textContent=fmt(treso);
  const panel=q('#sim-result-panel-mensuel');if(panel)panel.style.display='block';
  const bg=q('#sr-budget-perso');
  if(bg){
    if(aides>0||depPerso>0){
      bg.style.display='block';
      const entrees=versement+aides;
      if(q('#sr-bg-entrees'))q('#sr-bg-entrees').textContent=fmt(entrees);
      if(q('#sr-bg-depenses'))q('#sr-bg-depenses').textContent=`− ${fmt(depPerso)}`;
      const reste=entrees-depPerso;
      if(q('#sr-bg-reste')){q('#sr-bg-reste').textContent=fmt(reste);q('#sr-bg-reste').className=`sim-line-amount ${reste>=0?'pos':'neg'}`;}
    }else bg.style.display='none';
  }
}
function calcSimTrimestriel(){
  const m1=parseFloat(q('#sim-t-m1')?.value)||0,m2=parseFloat(q('#sim-t-m2')?.value)||0,m3=parseFloat(q('#sim-t-m3')?.value)||0;
  const dep=parseFloat(q('#sim-t-dep')?.value)||0;
  const s=dbGetObj('settings');
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const caT=m1+m2+m3;
  const cotis=Math.round(caT*(tU+tC)*100)/100;
  const pasT=pas*3;
  const net=Math.max(0,caT-cotis-dep-pasT);
  const urssafDu=Math.round(caT*tU*100)/100;
  const panel=q('#sim-result-panel-trim');if(panel)panel.style.display='block';
  if(q('#srt-ca'))q('#srt-ca').textContent=fmt(caT);
  if(q('#srt-cotis'))q('#srt-cotis').textContent=`− ${fmt(cotis)}`;
  if(q('#srt-dep'))q('#srt-dep').textContent=`− ${fmt(dep)}`;
  if(q('#srt-pas'))q('#srt-pas').textContent=`− ${fmt(pasT)}`;
  if(q('#srt-net'))q('#srt-net').textContent=fmt(net);
  if(q('#srt-urssaf-du'))q('#srt-urssaf-du').textContent=fmt(urssafDu);
  if(q('#srt-provision'))q('#srt-provision').textContent=fmt(Math.round(urssafDu/3*100)/100);
}
function calcSimAnnuel(){
  const caM=parseFloat(q('#sim-a-ca')?.value)||0;
  const depM=parseFloat(q('#sim-a-dep')?.value)||0;
  const cfe=parseFloat(q('#sim-a-cfe')?.value)||0;
  const s=dbGetObj('settings');
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const pctV=s.pctVersement||65;
  const scenarios=[{label:'Optimiste',mult:1.2,cls:'optimiste'},{label:'Réaliste',mult:1,cls:'realiste'},{label:'Pessimiste',mult:0.8,cls:'pessimiste'}];
  const html=scenarios.map(sc=>{
    const ca=Math.round(caM*12*sc.mult);
    const charges=Math.round(ca*(tU+tC)*100)/100+depM*12+pas*12+cfe;
    const net=Math.max(0,ca-charges);
    return`<div class="scenario-card ${sc.cls}">
      <div class="scenario-label">${sc.label} (×${sc.mult})</div>
      <div class="scenario-ca">${fmt(ca)}</div>
      <div class="scenario-sub">Net : ${fmt(net)} · Versement : ${fmt(Math.round(net*pctV/100))}</div>
      ${ca>PLAFOND_BNC?`<div style="font-size:11px;color:var(--danger);margin-top:6px;"><i class="ti ti-alert-triangle"></i> Dépasse le plafond micro-BNC</div>`:''}
    </div>`;
  }).join('');
  const sr=q('#sim-result-annuel');if(sr)sr.innerHTML=`<div class="scenarios-grid">${html}</div>`;
}

/* --- Import / Export -------------------------------------------------- */
let importFacturesParsed=null,importDepensesParsed=null;
function initImportExport(){
  qa('[data-ie-tab]').forEach(btn=>btn.onclick=()=>{
    qa('[data-ie-tab]').forEach(b=>b.classList.remove('active'));
    qa('.ie-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    q(`#ie-panel-${btn.dataset.ieTab}`)?.classList.add('active');
  });
  setupFileDrop('drop-factures','file-factures-csv',data=>{importFacturesParsed=data;previewImport('factures',data);});
  setupFileDrop('drop-depenses','file-depenses-csv',data=>{importDepensesParsed=data;previewImport('depenses',data);});
  qa('[data-export]').forEach(btn=>btn.onclick=()=>exportCSV(btn.dataset.export));
}
function setupFileDrop(dropId,inputId,cb){
  const drop=q(`#${dropId}`),inp=q(`#${inputId}`);
  if(!drop||!inp)return;
  drop.onclick=()=>inp.click();
  inp.onchange=()=>{if(inp.files[0])readCSV(inp.files[0],cb);};
  drop.ondragover=e=>{e.preventDefault();drop.classList.add('drag-over');};
  drop.ondragleave=()=>drop.classList.remove('drag-over');
  drop.ondrop=e=>{e.preventDefault();drop.classList.remove('drag-over');if(e.dataTransfer.files[0])readCSV(e.dataTransfer.files[0],cb);};
}
function readCSV(file,cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const lines=e.target.result.split('\n').filter(l=>l.trim());
    if(!lines.length)return;
    const headers=lines[0].split(',').map(h=>h.trim().replace(/"/g,'').toLowerCase());
    const rows=lines.slice(1).map(line=>{
      const vals=line.split(',').map(v=>v.trim().replace(/"/g,''));
      return Object.fromEntries(headers.map((h,i)=>[h,vals[i]||'']));
    }).filter(r=>Object.values(r).some(v=>v));
    cb(rows);
  };
  reader.readAsText(file);
}
function previewImport(type,rows){
  const prev=q(`#import-${type}-preview`),btn=q(`#btn-import-${type}`);
  if(!prev||!rows.length)return;
  const existingNums=type==='factures'?dbGet('factures').map(f=>f.numero):[];
  prev.style.display='block';
  prev.innerHTML=`<div class="import-row header"><span>Statut</span><span>Date</span><span>Référence</span><span>Montant</span></div>`+
    rows.slice(0,20).map(r=>{
      const isDoublon=type==='factures'&&existingNums.includes(r.numero||r['n° facture']||r.number);
      return`<div class="import-row ${isDoublon?'doublon':'new'}"><span>${isDoublon?'Doublon':'Nouveau'}</span><span>${r.date||'—'}</span><span>${r.numero||r.client||r.description||'—'}</span><span>${r.montant||'—'}</span></div>`;
    }).join('');
  if(btn)btn.style.display='inline-flex';
}
async function doImportFactures(){
  if(!importFacturesParsed)return;
  const lignes=importFacturesParsed.map(r=>({
    numero:r.numero||r['n° facture']||r.number||'',
    client:r.client||'',description:r.description||r.objet||'',
    date:r.date||today(),montant:parseFloat(r.montant)||0,statut:r.statut||'attente'
  }));
  try{
    const res=await api('POST','/api/import/factures',{lignes});
    _cache.factures=await api('GET','/api/factures');
    toast(`Importées : ${res.importees} · Doublons ignorés : ${res.doublons}`,'success');
    importFacturesParsed=null;
    const prev=q('#import-factures-preview');if(prev)prev.style.display='none';
    const btn=q('#btn-import-factures');if(btn)btn.style.display='none';
  }catch(e){toast(e.message||'Erreur','error');}
}
async function doImportDepenses(){
  if(!importDepensesParsed)return;
  const lignes=importDepensesParsed.map(r=>({
    date:r.date||today(),categorie:r.categorie||'Autre',
    description:r.description||r.libelle||'',montant:parseFloat(r.montant)||0
  }));
  try{
    const res=await api('POST','/api/import/depenses',{lignes});
    _cache.depenses=await api('GET','/api/depenses');
    toast(`Importées : ${res.importees}`,'success');
    importDepensesParsed=null;
    const prev=q('#import-depenses-preview');if(prev)prev.style.display='none';
    const btn=q('#btn-import-depenses');if(btn)btn.style.display='none';
  }catch(e){toast(e.message||'Erreur','error');}
}
async function exportCSV(type){
  try{
    const token=sessionStorage.getItem(TOKEN_KEY);
    const r=await fetch(`${API_BASE}/api/export/${type}`,{headers:{Authorization:`Bearer ${token}`}});
    if(r.status===401){showLogin();return;}
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`${type}-${today()}.csv`;a.click();
    URL.revokeObjectURL(url);
  }catch(e){toast(e.message||'Erreur export','error');}
}

/* --- Options ---------------------------------------------------------- */
function loadOptions(){
  const s=dbGetObj('settings');
  if(q('#opt-nom'))q('#opt-nom').value=s.nom||'Cindy';
  if(q('#opt-entreprise'))q('#opt-entreprise').value=s.entreprise||'Seed to Bloom';
  if(q('#opt-email'))q('#opt-email').value=s.email||'contact@seedtobloom.fr';
  if(q('#opt-objectif-ca'))q('#opt-objectif-ca').value=s.objectifCA||60000;
  if(q('#opt-urssaf'))q('#opt-urssaf').value=s.tauxUrssaf||25.6;
  if(q('#opt-cfp'))q('#opt-cfp').value=s.tauxCfp||0.2;
  if(q('#opt-pas'))q('#opt-pas').value=s.pasFixe||40;
  if(q('#opt-cfe'))q('#opt-cfe').value=s.cfe||0;
  if(q('#opt-versement'))q('#opt-versement').value=s.pctVersement||65;
  if(q('#opt-epargne-pct'))q('#opt-epargne-pct').value=s.pctEpargne||15;
  if(q('#opt-tresorerie-pct'))q('#opt-tresorerie-pct').value=s.pctTresorerie||20;
  updateOptTotal();
}
function updateOptTotal(){
  const v=parseFloat(q('#opt-versement')?.value)||0;
  const e=parseFloat(q('#opt-epargne-pct')?.value)||0;
  const t=parseFloat(q('#opt-tresorerie-pct')?.value)||0;
  const total=v+e+t;
  const alEl=q('#opt-total-alerte');
  if(alEl)alEl.innerHTML=total===100?`<span style="color:var(--success);">✓ Total : 100%</span>`:`<span style="color:var(--danger);">Total : ${total}% (doit être égal à 100%)</span>`;
}
async function saveOptions(){
  const v=parseFloat(q('#opt-versement')?.value)||65;
  const e=parseFloat(q('#opt-epargne-pct')?.value)||15;
  const t=parseFloat(q('#opt-tresorerie-pct')?.value)||20;
  if(v+e+t!==100){toast('Versement + Épargne + Trésorerie doit être égal à 100%','error');return;}
  const body={
    nom:q('#opt-nom').value.trim(),
    entreprise:q('#opt-entreprise').value.trim(),
    email:q('#opt-email').value.trim(),
    objectifCA:parseFloat(q('#opt-objectif-ca').value)||60000,
    tauxUrssaf:parseFloat(q('#opt-urssaf').value)||25.6,
    tauxCfp:parseFloat(q('#opt-cfp').value)||0.2,
    pasFixe:parseFloat(q('#opt-pas').value)||40,
    cfe:parseFloat(q('#opt-cfe').value)||0,
    pctVersement:v,pctEpargne:e,pctTresorerie:t
  };
  try{await dbSet('settings',body);toast('Options enregistrées','success');}
  catch(e){toast(e.message||'Erreur','error');}
}

/* ─── 10. INIT ───────────────────────────────────────────────────────── */
async function startApp(){
  try { await loadAll(); } catch(e) { if(e.message==='401')return; toast('Erreur chargement données','error'); }
  navigate('dashboard');
}

async function init(){
  injectLoginOverlay();
  initModals();

  // Navigation sidebar
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-section]');
    if(nav&&nav.classList.contains('nav-item'))navigate(nav.dataset.section);
  });

  // Dashboard
  q('#dash-refresh-btn')?.addEventListener('click',()=>loadDashboard());

  // Factures
  q('#btn-new-facture')?.addEventListener('click',()=>openFactureModal());
  q('#btn-save-facture')?.addEventListener('click',saveFacture);
  q('#factures-search')?.addEventListener('input',renderFactures);
  q('#factures-filter-statut')?.addEventListener('change',renderFactures);

  // Dépenses
  q('#btn-new-depense')?.addEventListener('click',()=>openDepenseModal());
  q('#btn-save-depense')?.addEventListener('click',saveDepense);
  q('#depenses-search')?.addEventListener('input',renderDepenses);
  q('#depenses-filter-cat')?.addEventListener('change',renderDepenses);

  // Abonnements
  q('#btn-new-abonnement')?.addEventListener('click',()=>openAbonnementModal());
  q('#btn-save-abonnement')?.addEventListener('click',saveAbonnement);

  // Comptes
  q('#btn-new-compte')?.addEventListener('click',()=>openCompteModal());
  q('#btn-save-compte')?.addEventListener('click',saveCompte);
  q('#btn-save-compte-update')?.addEventListener('click',saveCompteUpdate);

  // Transactions
  q('#btn-new-txn')?.addEventListener('click',openTxnModal);
  q('#btn-save-txn')?.addEventListener('click',saveTxn);
  q('#txn-search')?.addEventListener('input',renderTransactions);
  q('#txn-filter-compte')?.addEventListener('change',renderTransactions);
  q('#txn-filter-type')?.addEventListener('change',renderTransactions);

  // URSSAF
  q('#btn-save-urssaf')?.addEventListener('click',saveURSSAFPaiement);

  // Objectifs CA
  q('#btn-edit-objectif-ca')?.addEventListener('click',openObjectifCAModal);
  q('#btn-save-objectif-ca')?.addEventListener('click',saveObjectifCA);

  // Objectifs épargne
  q('#btn-new-objectif-epargne')?.addEventListener('click',()=>openEpargneGoalModal());
  q('#btn-save-obj-epargne')?.addEventListener('click',saveEpargneGoal);

  // Répartition
  q('#btn-save-repartition')?.addEventListener('click',saveRepartition);

  // Rapports
  q('#btn-rm-gen')?.addEventListener('click',renderRapportMensuel);
  q('#btn-ra-gen')?.addEventListener('click',renderRapportAnnuel);
  q('#btn-rf-gen')?.addEventListener('click',renderRapportFiscal);

  // Simulateur
  q('#sim-versement-slider')?.addEventListener('input',function(){
    if(q('#sim-slider-val'))q('#sim-slider-val').textContent=`${this.value}%`;
  });
  q('#btn-sim-calculer')?.addEventListener('click',calcSimMensuel);
  q('#btn-sim-trim')?.addEventListener('click',calcSimTrimestriel);
  q('#btn-sim-annuel')?.addEventListener('click',calcSimAnnuel);
  qa('.sim-tab').forEach(btn=>btn.addEventListener('click',function(){
    const panel=this.dataset.sim;
    qa('.sim-tab').forEach(b=>b.classList.remove('active'));
    qa('.sim-panel').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
    q(`#sim-panel-${panel}`)?.classList.add('active');
  }));

  // Import/Export
  q('#btn-import-factures')?.addEventListener('click',doImportFactures);
  q('#btn-import-depenses')?.addEventListener('click',doImportDepenses);

  // Options
  q('#btn-save-options')?.addEventListener('click',saveOptions);
  ['#opt-versement','#opt-epargne-pct','#opt-tresorerie-pct'].forEach(id=>q(id)?.addEventListener('input',updateOptTotal));

  // Démarrage : vérifier si le cookie de session est valide
  try {
    const r = await fetch('/api/settings');
    if (r.ok) { await startApp(); } else { showLogin(); }
  } catch { showLogin(); }
}

document.addEventListener('DOMContentLoaded',init);
