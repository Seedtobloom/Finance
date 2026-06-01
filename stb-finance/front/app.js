/* ─── STB Finance — app.js ─────────────────────────────────────────── */

const API = '';
const TOKEN_KEY = 'stb_jwt';
const PLAFOND_BNC = 77700;
const TAUX_URSSAF = 0.256;
const TAUX_CFP = 0.002;
const PAS_FIXE = 40;

/* ─── Utils ──────────────────────────────────────────────────────────── */
const fmt = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Math.round(v*100)/100);
const fmtN = v => new Intl.NumberFormat('fr-FR').format(Math.round(v));
const today = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
function fmtDate(s){if(!s)return'—';const[y,m,d]=s.split('-');return`${d}/${m}/${y}`;}
function q(sel,ctx=document){return ctx.querySelector(sel);}
function qa(sel,ctx=document){return[...ctx.querySelectorAll(sel)];}
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;}
const MOIS_COURT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const MOIS_LONG  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

/* ─── Toast ──────────────────────────────────────────────────────────── */
let _toastTimer;
function toast(msg,type='info'){
  const t=q('#toast');
  t.textContent=msg;
  t.className=`show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>t.className='',3500);
}

/* ─── Confirm ────────────────────────────────────────────────────────── */
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

/* ─── API client ─────────────────────────────────────────────────────── */
function token(){return sessionStorage.getItem(TOKEN_KEY);}
async function api(method,path,body,isFormData=false){
  const headers={Authorization:`Bearer ${token()}`};
  if(!isFormData&&body)headers['Content-Type']='application/json';
  const res=await fetch(API+path,{method,headers,body:isFormData?body:body?JSON.stringify(body):undefined});
  if(res.status===401){logout();return null;}
  if(!res.ok){const e=await res.json().catch(()=>({error:'Erreur serveur'}));throw new Error(e.error||'Erreur');}
  if(res.status===204)return null;
  return res.json();
}
const GET=(path)=>api('GET',path);
const POST=(path,body)=>api('POST',path,body);
const PUT=(path,body)=>api('PUT',path,body);
const DEL=(path)=>api('DELETE',path);

/* ─── Auth ───────────────────────────────────────────────────────────── */
async function login(password){
  const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:'cindy',password})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||'Mot de passe incorrect');}
  const{token:t}=await res.json();
  sessionStorage.setItem(TOKEN_KEY,t);
}
function logout(){sessionStorage.removeItem(TOKEN_KEY);showLogin();}
function isLoggedIn(){return!!token();}

/* ─── Router ─────────────────────────────────────────────────────────── */
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

/* ─── Modals ─────────────────────────────────────────────────────────── */
function openModal(id){const m=q(`#${id}`);if(m)m.classList.add('open');}
function closeModal(id){const m=q(`#${id}`);if(m)m.classList.remove('open');}
function initModals(){
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-close-modal]');
    if(btn)closeModal(btn.dataset.closeModal);
    if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');
  });
}

/* ─── State cache ────────────────────────────────────────────────────── */
const cache={};
async function load(key,path){if(!cache[key])cache[key]=await GET(path);return cache[key]||[];}
function invalidate(...keys){keys.forEach(k=>delete cache[k]);}

/* ─── Charts (Canvas 2D natif) ───────────────────────────────────────── */
const COLORS={navy:'#051833',blue:'#BAD1FD',violet:'#E4D1FE',success:'#4CAF82',warning:'#E8A838',danger:'#E85454',muted:'#E8E8E4',text2:'#6B6B6B'};
const PALETTE=['#BAD1FD','#E4D1FE','#4CAF82','#E8A838','#E85454','#051833','#EFE1B0','#412F21'];

function niceStep(max){
  const raw=max/5,mag=Math.pow(10,Math.floor(Math.log10(raw||1)));
  const n=raw/mag;
  if(n<1.5)return mag;if(n<3.5)return 2*mag;if(n<7.5)return 5*mag;return 10*mag;
}
function fmtShort(v){if(v>=1000000)return(v/1000000).toFixed(1)+'M';if(v>=1000)return(v/1000).toFixed(0)+'k';return String(Math.round(v));}

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
    if(opts.dashed){
      ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle=ds.color||COLORS.muted;ctx.lineWidth=1.5;
      ds.data.forEach((v,i)=>{
        const bH=(v/yMax)*cH;
        const x=pad.left+i*groupW+gap+di*(bw+gap);
        const y=pad.top+cH-bH;
        ctx.strokeRect(x,y,bw,bH);
      });
      ctx.restore();
    }
  });
  ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+i*groupW+groupW/2,pad.top+cH+16));
}

function drawLineChart(canvas,labels,data,color=COLORS.navy,dashed=false){
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
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const total=data.reduce((a,b)=>a+b,0);
  if(!total)return;
  // Donut à gauche, légende à droite
  const legendW=120;
  const cx=(W-legendW)/2,cy=H/2,r=Math.min(cx-10,cy-10),ir=r*0.58;
  let angle=-Math.PI/2;
  data.forEach((v,i)=>{
    const s=(v/total)*Math.PI*2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+s);ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];ctx.fill();
    angle+=s;
  });
  ctx.beginPath();ctx.arc(cx,cy,ir,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  // Légende
  const lx=W-legendW+8;
  labels.forEach((l,i)=>{
    const ly=16+i*22;
    ctx.fillStyle=colors[i%colors.length];ctx.fillRect(lx,ly,10,10);
    ctx.fillStyle=COLORS.text2;ctx.font='11px DM Sans,sans-serif';ctx.textAlign='left';
    ctx.fillText(l.slice(0,14),lx+14,ly+9);
  });
}

function drawGroupedBarChart(canvas,labels,datasets){
  drawBarChart(canvas,labels,datasets);
}

/* ─── Show/Hide ──────────────────────────────────────────────────────── */
function showLogin(){}
function showApp(){}

/* ─── Dashboard ──────────────────────────────────────────────────────── */
async function loadDashboard(){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1;
  q('#dash-period').textContent=`${MOIS_LONG[m-1]} ${y}`;

  let data;
  try{data=await GET('/api/dashboard');}catch(e){toast(e.message,'error');return;}
  if(!data)return;

  const{kpis,hist,dernieresTx,prochAbo}=data;

  // KPIs ligne 1
  q('#kpi-ca-mois').textContent=fmt(kpis.caMois||0);
  q('#kpi-charges-mois').textContent=fmt(kpis.chargesTotal||0);
  q('#kpi-charges-mois-sub').textContent=`URSSAF + dép. + PAS`;
  q('#kpi-net-mois').textContent=fmt(kpis.netMois||0);
  q('#kpi-versement').textContent=fmt(kpis.versementEstime||0);

  // KPIs ligne 2
  q('#kpi-ca-ytd').textContent=fmt(kpis.caYTD||0);
  q('#kpi-objectif-pct').textContent=`${kpis.progressionCA||0}%`;
  q('#kpi-objectif-bar').style.width=`${Math.min(kpis.progressionCA||0,100)}%`;
  q('#kpi-treso-qonto').textContent=fmt(kpis.tresoQonto||0);
  if(kpis.tresoUpdatedAt)q('#kpi-treso-upd').textContent=`Màj ${fmtDate(kpis.tresoUpdatedAt.slice(0,10))}`;

  if(kpis.prochaineEcheance){
    const pe=kpis.prochaineEcheance;
    q('#kpi-urssaf-next').textContent=pe.joursRestants>0?`${pe.joursRestants} j`:'Aujourd\'hui';
    q('#kpi-urssaf-sub').textContent=`${pe.label} · ${fmtDate(pe.echeance)}`;
  }

  // Graphique barres groupées 12 mois
  const labels12=hist.map(h=>h.label);
  const caData=hist.map(h=>h.ca);
  const chData=hist.map(h=>h.charges);
  const netData=hist.map(h=>h.net);
  const c1=q('#chart-dash-bar');
  if(c1)drawBarChart(c1,labels12,[{data:caData,color:COLORS.blue},{data:chData,color:COLORS.violet}]);
  const leg=q('#chart-dash-bar-legend');
  if(leg)leg.innerHTML=`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:${COLORS.blue}"></div>CA</div><div class="chart-legend-item"><div class="chart-legend-dot" style="background:${COLORS.violet}"></div>Charges</div>`;
  const c2=q('#chart-dash-line');
  if(c2)drawLineChart(c2,labels12,netData,COLORS.success);

  // Dernières transactions
  const tEl=q('#dash-transactions-list');
  tEl.innerHTML=(dernieresTx||[]).length?dernieresTx.map(t=>`
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
      <div><div style="font-weight:500;">${t.libelle||'—'}</div><div style="font-size:11px;color:var(--text-2);">${fmtDate(t.date)}</div></div>
      <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:${t.type==='credit'?'var(--success)':'var(--danger)'};">${t.type==='credit'?'+':'−'}${fmt(t.montant||0)}</span>
    </div>`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucune transaction</p>';

  // Prochains abonnements
  const aEl=q('#dash-abonnements-list');
  aEl.innerHTML=(prochAbo||[]).length?prochAbo.map(a=>`
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
      <div><div style="font-weight:500;">${a.nom}</div><div style="font-size:11px;color:var(--text-2);">Jour ${a.jourPrelevement} · dans ${a.joursAvant} j</div></div>
      <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--navy);">${fmt(a.montantMensuel||0)}</span>
    </div>`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucun abonnement actif</p>';

  // Alerte URSSAF si < 30 jours
  const alEl=q('#dash-urssaf-alert');
  if(kpis.prochaineEcheance&&kpis.prochaineEcheance.joursRestants<=30){
    alEl.innerHTML=`<div class="alert danger"><i class="ti ti-alert-triangle"></i> URSSAF ${kpis.prochaineEcheance.label} à payer dans ${kpis.prochaineEcheance.joursRestants} jours (échéance ${fmtDate(kpis.prochaineEcheance.echeance)})</div>`;
  } else alEl.innerHTML='';
}

/* ─── Vue d'ensemble ────────────────────────────────────────────────── */
async function loadVueEnsemble(){
  const [factures,settings]=await Promise.all([load('factures','/api/factures'),load('settings','/api/settings')]);
  const y=new Date().getFullYear();
  const moisActuels=new Date().getMonth()+1;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;

  // Graphique solde Qonto — on utilise les factures payées par mois comme proxy
  const labels=MOIS_COURT;
  const soldeMois=MOIS_COURT.map((_,mi)=>{
    const key=`${y}-${String(mi+1).padStart(2,'0')}`;
    return factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(key)).reduce((s,f)=>s+f.montant,0);
  });
  // cumul
  const cumul=soldeMois.reduce((acc,v,i)=>{acc.push((acc[i-1]||0)+v);return acc;},[]);
  const c=q('#chart-ve-solde');if(c)drawLineChart(c,labels,cumul,COLORS.navy);

  // Tableau récap mensuel
  const tbody=q('#ve-recap-tbody');
  tbody.innerHTML=MOIS_COURT.map((mLabel,mi)=>{
    const key=`${y}-${String(mi+1).padStart(2,'0')}`;
    const ca=factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(key)).reduce((s,f)=>s+f.montant,0);
    const charges=Math.round(ca*(tauxU+tauxC)*100)/100+(settings.pasFixe||40);
    const net=Math.max(0,ca-charges);
    const vers=Math.round(net*(settings.pctVersement||65)/100*100)/100;
    return`<tr><td>${mLabel}</td><td class="td-amount">${ca?fmt(ca):'—'}</td><td class="td-amount">${ca?fmt(charges):'—'}</td><td class="td-amount">${ca?fmt(net):'—'}</td><td class="td-amount">${ca?fmt(vers):'—'}</td></tr>`;
  }).join('');

  // Projection fin d'année
  const caYTD=soldeMois.slice(0,moisActuels).reduce((a,b)=>a+b,0);
  const moyenne=moisActuels>0?caYTD/moisActuels:0;
  const projection=caYTD+(12-moisActuels)*moyenne;
  q('#ve-projection').innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">CA YTD</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(caYTD)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Moyenne mensuelle</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(moyenne)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">${fmt(projection)}</div></div>
    </div>`;
}

/* ─── Comptes ────────────────────────────────────────────────────────── */
let comptesData=[];
async function loadComptes(){
  comptesData=await GET('/api/comptes')||[];
  cache['comptes']=comptesData;
  renderComptes();
}
function renderComptes(){
  const g=q('#comptes-grid');
  g.innerHTML=comptesData.length?comptesData.map(c=>`
    <div class="compte-card">
      <div class="compte-card-header">
        <span class="compte-nom">${c.nom}</span>
        <span class="badge badge-neutral">${c.type}</span>
      </div>
      <div class="compte-solde">${fmt(c.solde||0)}</div>
      <div class="compte-upd">${c.updatedAt?'Mis à jour '+fmtDate(c.updatedAt.slice(0,10)):''}</div>
      <div class="compte-historique">${(c.historique||[]).slice(0,5).map(h=>`<div class="compte-historique-item"><span>${fmtDate(h.date)} ${h.libelle||''}</span><span>${fmt(h.montant||0)}</span></div>`).join('')}</div>
      <div class="compte-actions">
        <button class="btn btn-secondary btn-sm" onclick="openCompteUpdateModal('${c.id}')"><i class="ti ti-refresh"></i> Mettre à jour</button>
        <button class="btn btn-ghost btn-sm" onclick="editCompte('${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCompte('${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join(''):'<p style="color:var(--text-2);">Aucun compte</p>';
}
function openCompteModal(data={}){
  q('#modal-compte-title').textContent=data.id?'Modifier le compte':'Nouveau compte';
  q('#cpt-nom').value=data.nom||'';
  q('#cpt-type').value=data.type||'professionnel';
  q('#cpt-solde').value=data.solde||'';
  q('#btn-save-compte').dataset.id=data.id||'';
  openModal('modal-compte');
}
async function saveCompte(){
  const id=q('#btn-save-compte').dataset.id;
  const body={nom:q('#cpt-nom').value.trim(),type:q('#cpt-type').value,solde:parseFloat(q('#cpt-solde').value)||0};
  if(!body.nom){toast('Nom requis','error');return;}
  try{
    if(id)await PUT(`/api/comptes/${id}`,body);else await POST('/api/comptes',body);
    invalidate('comptes');closeModal('modal-compte');toast('Compte enregistré','success');loadComptes();
  }catch(e){toast(e.message,'error');}
}
function editCompte(id){const c=comptesData.find(x=>x.id===id);if(c)openCompteModal(c);}
async function deleteCompte(id){
  if(!await confirmDialog('Supprimer le compte','Cette action est irréversible.'))return;
  try{await DEL(`/api/comptes/${id}`);invalidate('comptes');toast('Compte supprimé');loadComptes();}catch(e){toast(e.message,'error');}
}
let _compteUpdateId=null;
function openCompteUpdateModal(id){
  _compteUpdateId=id;
  const c=comptesData.find(x=>x.id===id);
  q('#modal-compte-update-title').textContent=`Mettre à jour — ${c?.nom}`;
  q('#cu-solde').value=c?.solde||'';
  q('#cu-libelle').value='';
  openModal('modal-compte-update');
}
async function saveCompteUpdate(){
  const solde=parseFloat(q('#cu-solde').value);
  const libelle=q('#cu-libelle').value.trim();
  if(isNaN(solde)){toast('Solde invalide','error');return;}
  try{
    await PUT(`/api/comptes/${_compteUpdateId}`,{solde});
    await POST(`/api/comptes/${_compteUpdateId}/historique`,{date:today(),montant:solde,libelle});
    invalidate('comptes');closeModal('modal-compte-update');toast('Solde mis à jour','success');loadComptes();
  }catch(e){toast(e.message,'error');}
}

/* ─── Transactions ───────────────────────────────────────────────────── */
let txnData=[];
async function loadTransactions(){
  const res=await GET('/api/transactions');
  txnData=(res?.transactions||res)||[];
  cache['transactions']=txnData;
  const comptes=await load('comptes','/api/comptes');
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
  const comptes=cache['comptes']||[];
  const getN=id=>comptes.find(c=>c.id===id)?.nom||'—';
  const tbody=q('#txn-tbody');
  tbody.innerHTML=list.length?list.map(t=>`<tr>
    <td>${fmtDate(t.date)}</td><td>${t.libelle||'—'}</td>
    <td>${getN(t.compte)}</td>
    <td><span class="badge badge-${t.type==='credit'?'success':t.type==='debit'?'danger':'neutral'}">${t.type}</span></td>
    <td class="td-amount" style="color:${t.type==='credit'?'var(--success)':'var(--danger)'};">${t.type==='credit'?'+':'−'}${fmt(t.montant||0)}</td>
    <td><button class="btn btn-ghost btn-xs" onclick="deleteTxn('${t.id}')"><i class="ti ti-trash"></i></button></td>
  </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-2);">Aucune transaction</td></tr>';
}
function openTxnModal(){
  q('#modal-txn-title').textContent='Nouvelle transaction';
  q('#txn-date').value=today();q('#txn-type').value='credit';q('#txn-libelle').value='';q('#txn-montant').value='';
  q('#btn-save-txn').dataset.id='';
  openModal('modal-transaction');
}
async function saveTxn(){
  const body={date:q('#txn-date').value,type:q('#txn-type').value,libelle:q('#txn-libelle').value.trim(),compte:q('#txn-compte').value,montant:parseFloat(q('#txn-montant').value)||0};
  if(!body.libelle){toast('Libellé requis','error');return;}
  try{await POST('/api/transactions',body);invalidate('transactions');closeModal('modal-transaction');toast('Transaction enregistrée','success');loadTransactions();}catch(e){toast(e.message,'error');}
}
async function deleteTxn(id){
  if(!await confirmDialog('Supprimer','Cette action est irréversible.'))return;
  try{await DEL(`/api/transactions/${id}`);invalidate('transactions');toast('Transaction supprimée');loadTransactions();}catch(e){toast(e.message,'error');}
}

/* ─── Factures ───────────────────────────────────────────────────────── */
let facturesData=[];
async function loadFactures(){
  facturesData=await GET('/api/factures')||[];
  cache['factures']=facturesData;
  // KPIs
  const total=facturesData.reduce((s,f)=>s+f.montant,0);
  const paye=facturesData.filter(f=>f.statut==='payee').reduce((s,f)=>s+f.montant,0);
  const attente=facturesData.filter(f=>f.statut==='attente').reduce((s,f)=>s+f.montant,0);
  const taux=total>0?Math.round(paye/total*100):0;
  q('#fac-kpi-total').textContent=fmt(total);
  q('#fac-kpi-paye').textContent=fmt(paye);
  q('#fac-kpi-attente').textContent=fmt(attente);
  q('#fac-kpi-taux').textContent=`${taux}%`;
  renderFactures();
  // Graphiques
  const y=new Date().getFullYear();
  const payees=facturesData.filter(f=>f.statut==='payee');
  // CA par client (donut)
  const byClient={};payees.forEach(f=>{byClient[f.client]=(byClient[f.client]||0)+f.montant;});
  const topClients=Object.entries(byClient).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const c1=q('#chart-fac-client');
  if(c1&&topClients.length)drawDonutChart(c1,topClients.map(([k])=>k),topClients.map(([,v])=>v),PALETTE);
  // CA par mois (barres)
  const caMois=MOIS_COURT.map((_,mi)=>{const key=`${y}-${String(mi+1).padStart(2,'0')}`;return payees.filter(f=>f.date?.startsWith(key)).reduce((s,f)=>s+f.montant,0);});
  const c2=q('#chart-fac-mois');
  if(c2)drawBarChart(c2,MOIS_COURT,[{data:caMois,color:COLORS.blue}]);
}
function renderFactures(){
  const search=q('#factures-search')?.value.toLowerCase()||'';
  const statut=q('#factures-filter-statut')?.value||'';
  let list=[...facturesData];
  if(search)list=list.filter(f=>(f.numero+f.client+f.description).toLowerCase().includes(search));
  if(statut)list=list.filter(f=>f.statut===statut);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const tbody=q('#factures-tbody');
  tbody.innerHTML=list.length?list.map(f=>`<tr>
    <td>${fmtDate(f.date)}</td>
    <td class="td-mono">${f.numero||'—'}</td>
    <td>${f.client||'—'}</td>
    <td class="td-muted">${f.description||'—'}</td>
    <td class="td-amount">${fmt(f.montant||0)}</td>
    <td><span class="badge badge-${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}">${f.statut==='payee'?'Payée':f.statut==='retard'?'En retard':'En attente'}</span></td>
    <td><button class="pdf-btn ${f.pdfKey?'present':'vide'}" onclick="handlePdfFacture('${f.id}')"><i class="ti ti-paperclip"></i></button></td>
    <td style="white-space:nowrap;">
      <button class="btn btn-ghost btn-xs" onclick="editFacture('${f.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteFacture('${f.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>`).join(''):'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-2);">Aucune facture</td></tr>';
}
function openFactureModal(data={}){
  q('#modal-facture-title').textContent=data.id?'Modifier la facture':'Nouvelle facture';
  q('#f-numero').value=data.numero||'';q('#f-statut').value=data.statut||'attente';
  q('#f-client').value=data.client||'';q('#f-description').value=data.description||'';
  q('#f-date').value=data.date||today();q('#f-montant').value=data.montant||'';
  q('#f-pdf-name').textContent=data.pdfKey?'PDF attaché':'';
  q('#f-pdf-btn').className=`pdf-btn ${data.pdfKey?'present':'vide'}`;
  q('#btn-save-facture').dataset.id=data.id||'';
  q('#f-pdf-file').value='';
  openModal('modal-facture');
}
async function saveFacture(){
  const id=q('#btn-save-facture').dataset.id;
  const body={numero:q('#f-numero').value.trim(),statut:q('#f-statut').value,client:q('#f-client').value.trim(),description:q('#f-description').value.trim(),date:q('#f-date').value,montant:parseFloat(q('#f-montant').value)||0};
  if(!body.client||!body.montant){toast('Client et montant requis','error');return;}
  try{
    let saved;
    if(id)saved=await PUT(`/api/factures/${id}`,body);else saved=await POST('/api/factures',body);
    const file=q('#f-pdf-file').files[0];
    if(file&&saved?.id){const fd=new FormData();fd.append('pdf',file);await api('POST',`/api/factures/${saved.id}/pdf`,fd,true);}
    invalidate('factures');closeModal('modal-facture');toast('Facture enregistrée','success');loadFactures();
  }catch(e){toast(e.message,'error');}
}
function editFacture(id){const f=facturesData.find(x=>x.id===id);if(f)openFactureModal(f);}
async function deleteFacture(id){
  if(!await confirmDialog('Supprimer la facture','Cette action est irréversible.'))return;
  try{await DEL(`/api/factures/${id}`);invalidate('factures');toast('Facture supprimée');loadFactures();}catch(e){toast(e.message,'error');}
}
function handlePdfFacture(id){
  const f=facturesData.find(x=>x.id===id);
  if(f?.pdfKey){window.open(`/api/factures/${id}/pdf`,'_blank');return;}
  const inp=q('#pdf-upload-input');
  inp.onchange=async()=>{
    const file=inp.files[0];if(!file)return;
    const fd=new FormData();fd.append('pdf',file);
    try{await api('POST',`/api/factures/${id}/pdf`,fd,true);invalidate('factures');toast('PDF attaché','success');loadFactures();}catch(e){toast(e.message,'error');}
  };
  inp.click();
}

/* ─── Objectifs CA ───────────────────────────────────────────────────── */
async function loadObjectifsCA(){
  const [settings,factures]=await Promise.all([load('settings','/api/settings'),load('factures','/api/factures')]);
  const y=new Date().getFullYear();
  const m=new Date().getMonth()+1;
  const objectif=settings.objectifCA||60000;
  const payees=factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(String(y)));
  const atteint=payees.reduce((s,f)=>s+f.montant,0);
  const pct=objectif>0?Math.min(100,Math.round(atteint/objectif*100)):0;
  const resteMois=12-m+1;
  const moyenneActuel=m>0?atteint/m:0;
  const necessaire=resteMois>0?(objectif-atteint)/resteMois:0;
  const projection=atteint+necessaire*resteMois;

  q('#objca-kpi-objectif').textContent=fmt(objectif);
  q('#objca-kpi-atteint').textContent=fmt(atteint);
  q('#objca-kpi-moyen-actuel').textContent=fmt(moyenneActuel);
  q('#objca-kpi-necessaire').textContent=fmt(Math.max(necessaire,0));
  q('#objca-gauge-pct').textContent=`${pct}%`;
  q('#objca-gauge-fill').style.width=`${pct}%`;
  q('#objca-gauge-fill').style.background=pct>=100?COLORS.success:pct>=80?COLORS.warning:COLORS.blue;
  q('#objca-gauge-label').textContent=`${fmt(atteint)} sur ${fmt(objectif)}`;

  // Alerte
  const projFin=moyenneActuel*12;
  const al=q('#objca-alert');
  al.innerHTML=projFin<objectif?`<div class="alert warning"><i class="ti ti-alert-triangle"></i> Projection fin d'année : ${fmt(projFin)} — en dessous de l'objectif de ${fmt(objectif)}</div>`:'';

  // Projection
  q('#objca-projection').innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">${fmt(projFin)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Objectif</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">${fmt(objectif)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Écart projeté</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:${projFin>=objectif?'var(--success)':'var(--danger)'};">${fmt(projFin-objectif)}</div></div>
    </div>`;

  // Graphique
  const caMois=MOIS_COURT.map((_,mi)=>{const key=`${y}-${String(mi+1).padStart(2,'0')}`;return factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(key)).reduce((s,f)=>s+f.montant,0);});
  const targetMois=Array(12).fill(Math.round(objectif/12));
  const c=q('#chart-objca');
  if(c)drawBarChart(c,MOIS_COURT,[{data:caMois,color:COLORS.blue},{data:targetMois,color:COLORS.muted}],{dashed:true});
}
function openObjectifCAModal(){
  const s=cache['settings']||{};q('#obj-ca-val').value=s.objectifCA||60000;openModal('modal-objectif-ca');
}
async function saveObjectifCA(){
  const val=parseFloat(q('#obj-ca-val').value)||0;
  try{const s=await GET('/api/settings');await PUT('/api/settings',{...s,objectifCA:val});invalidate('settings');closeModal('modal-objectif-ca');toast('Objectif mis à jour','success');loadObjectifsCA();}catch(e){toast(e.message,'error');}
}

/* ─── Dépenses ───────────────────────────────────────────────────────── */
let depensesData=[];
async function loadDepenses(){
  depensesData=await GET('/api/depenses')||[];
  cache['depenses']=depensesData;
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const ytd=depensesData.filter(d=>d.date?.startsWith(String(y))).reduce((s,d)=>s+d.montant,0);
  const mois=depensesData.filter(d=>d.date?.startsWith(mKey)).reduce((s,d)=>s+d.montant,0);
  const mois_avec_dep=new Set(depensesData.filter(d=>d.date?.startsWith(String(y))).map(d=>d.date?.slice(0,7))).size||1;
  const moyenne=ytd/mois_avec_dep;
  const bycat={};depensesData.forEach(d=>{bycat[d.categorie||'Autre']=(bycat[d.categorie||'Autre']||0)+d.montant;});
  const topCat=Object.entries(bycat).sort((a,b)=>b[1]-a[1])[0];
  q('#dep-kpi-mois').textContent=fmt(mois);
  q('#dep-kpi-ytd').textContent=fmt(ytd);
  q('#dep-kpi-moyenne').textContent=fmt(moyenne);
  q('#dep-kpi-cat').textContent=topCat?topCat[0].split('&')[0].slice(0,12):'—';
  renderDepenses();
  // Graphiques
  const cats=Object.keys(bycat);
  const c1=q('#chart-dep-cat');
  if(c1&&cats.length)drawDonutChart(c1,cats,cats.map(k=>bycat[k]),PALETTE);
  const caMois=MOIS_COURT.map((_,mi)=>{const key=`${y}-${String(mi+1).padStart(2,'0')}`;return depensesData.filter(d=>d.date?.startsWith(key)).reduce((s,d)=>s+d.montant,0);});
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
  q('#d-date').value=data.date||today();q('#d-categorie').value=data.categorie||'Logiciels & abonnements';
  q('#d-description').value=data.description||data.libelle||'';q('#d-montant').value=data.montant||'';
  q('#btn-save-depense').dataset.id=data.id||'';
  openModal('modal-depense');
}
async function saveDepense(){
  const id=q('#btn-save-depense').dataset.id;
  const body={date:q('#d-date').value,categorie:q('#d-categorie').value,description:q('#d-description').value.trim(),montant:parseFloat(q('#d-montant').value)||0};
  if(!body.description){toast('Description requise','error');return;}
  try{
    if(id)await PUT(`/api/depenses/${id}`,body);else await POST('/api/depenses',body);
    invalidate('depenses');closeModal('modal-depense');toast('Dépense enregistrée','success');loadDepenses();
  }catch(e){toast(e.message,'error');}
}
function editDepense(id){const d=depensesData.find(x=>x.id===id);if(d)openDepenseModal(d);}
async function deleteDepense(id){
  if(!await confirmDialog('Supprimer','Irréversible.'))return;
  try{await DEL(`/api/depenses/${id}`);invalidate('depenses');toast('Dépense supprimée');loadDepenses();}catch(e){toast(e.message,'error');}
}

/* ─── Abonnements ────────────────────────────────────────────────────── */
let aboData=[];
const ABO_DEFAUT=[
  {nom:'Adobe Creative Cloud',montantMensuel:61.99,jourPrelevement:1,categorie:'Logiciels',statut:'actif'},
  {nom:'Notion Pro',montantMensuel:16,jourPrelevement:3,categorie:'Logiciels',statut:'actif'},
  {nom:'Infomaniak hosting',montantMensuel:12,jourPrelevement:1,categorie:'Hébergement',statut:'actif'},
  {nom:'n8n cloud',montantMensuel:20,jourPrelevement:15,categorie:'Logiciels',statut:'actif'},
];
async function loadAbonnements(){
  aboData=await GET('/api/abonnements')||[];
  // Seed si vide
  if(!aboData.length){
    try{
      for(const a of ABO_DEFAUT)await POST('/api/abonnements',a);
      aboData=await GET('/api/abonnements')||[];
    }catch(_){}
  }
  cache['abonnements']=aboData;
  const actifs=aboData.filter(a=>a.statut==='actif');
  const mensuel=actifs.reduce((s,a)=>s+a.montantMensuel,0);
  const annuel=mensuel*12;
  q('#abo-kpi-mensuel').textContent=fmt(mensuel);
  q('#abo-kpi-annuel').textContent=fmt(annuel);
  q('#abo-kpi-count').textContent=actifs.length;
  // Prochain prélèvement
  const now=new Date();
  const today_d=now.getDate();
  const next=actifs.map(a=>{
    let j=a.jourPrelevement;
    let jours=j-today_d;if(jours<0)jours+=31;
    return{...a,jours};
  }).sort((a,b)=>a.jours-b.jours)[0];
  q('#abo-kpi-prochain').textContent=next?`${next.jours} j`:'—';
  if(next)q('#abo-kpi-prochain-sub').textContent=next.nom;
  renderAbonnements();
  drawAboTimeline();
}
function renderAbonnements(){
  const tbody=q('#abonnements-tbody');
  tbody.innerHTML=aboData.length?aboData.map(a=>`<tr>
    <td style="font-weight:500;">${a.nom}</td>
    <td><span class="badge badge-neutral">${a.categorie||'—'}</span></td>
    <td class="td-amount">${fmt(a.montantMensuel||0)}</td>
    <td class="td-amount" style="color:var(--text-2);">${fmt((a.montantMensuel||0)*12)}</td>
    <td>Jour ${a.jourPrelevement||'—'}</td>
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
  const padL=8,padR=8,trackH=60;
  const trackY=H/2;
  const dayW=(W-padL-padR)/31;
  // Axe
  ctx.strokeStyle=COLORS.muted;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(padL,trackY);ctx.lineTo(W-padR,trackY);ctx.stroke();
  // Jours 1-31
  ctx.fillStyle=COLORS.text2;ctx.font='10px DM Sans,sans-serif';ctx.textAlign='center';
  for(let d=1;d<=31;d++){
    const x=padL+(d-1)*dayW+dayW/2;
    if(d%5===0||d===1||d===31)ctx.fillText(d,x,H-4);
    ctx.strokeStyle=COLORS.muted;ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(x,trackY-4);ctx.lineTo(x,trackY+4);ctx.stroke();
  }
  // Abonnements
  actifs.forEach((a,i)=>{
    const x=padL+(a.jourPrelevement-1)*dayW+dayW/2;
    const col=PALETTE[i%PALETTE.length];
    ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(x,trackY,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 8px DM Sans,sans-serif';ctx.textAlign='center';
    ctx.fillText(a.nom.slice(0,2).toUpperCase(),x,trackY+3);
    // Nom en haut/bas alternant
    ctx.fillStyle=COLORS.text2;ctx.font='9px DM Sans,sans-serif';
    ctx.fillText(a.nom.slice(0,10),x,i%2===0?trackY-18:trackY+24);
  });
}
function openAbonnementModal(data={}){
  q('#modal-abonnement-title').textContent=data.id?'Modifier':'Nouvel abonnement';
  q('#abo-nom').value=data.nom||'';q('#abo-montant').value=data.montantMensuel||'';
  q('#abo-jour').value=data.jourPrelevement||1;q('#abo-categorie').value=data.categorie||'Logiciels';
  q('#abo-statut').value=data.statut||'actif';
  q('#btn-save-abonnement').dataset.id=data.id||'';
  openModal('modal-abonnement');
}
async function saveAbonnement(){
  const id=q('#btn-save-abonnement').dataset.id;
  const body={nom:q('#abo-nom').value.trim(),montantMensuel:parseFloat(q('#abo-montant').value)||0,jourPrelevement:parseInt(q('#abo-jour').value)||1,categorie:q('#abo-categorie').value,statut:q('#abo-statut').value};
  if(!body.nom){toast('Nom requis','error');return;}
  try{
    if(id)await PUT(`/api/abonnements/${id}`,body);else await POST('/api/abonnements',body);
    invalidate('abonnements');closeModal('modal-abonnement');toast('Abonnement enregistré','success');loadAbonnements();
  }catch(e){toast(e.message,'error');}
}
function editAbonnement(id){const a=aboData.find(x=>x.id===id);if(a)openAbonnementModal(a);}
async function deleteAbonnement(id){
  if(!await confirmDialog('Supprimer','Irréversible.'))return;
  try{await DEL(`/api/abonnements/${id}`);invalidate('abonnements');toast('Supprimé');loadAbonnements();}catch(e){toast(e.message,'error');}
}

/* ─── Charges & URSSAF ───────────────────────────────────────────────── */
let urssafCurrentCle=null;
async function loadChargesURSSAF(){
  const [factures,depenses,abonnements,settings]=await Promise.all([
    load('factures','/api/factures'),load('depenses','/api/depenses'),
    load('abonnements','/api/abonnements'),load('settings','/api/settings'),
  ]);
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40,cfe=(settings.cfeAnnuelle||0)/12;

  // URSSAF par trimestre
  let urssafData={};
  try{urssafData=await GET('/api/urssaf');}catch(_){}
  const quarters=['T1-2026','T2-2026','T3-2026','T4-2026'];
  const moisQ={T1:[1,2,3],T2:[4,5,6],T3:[7,8,9],T4:[10,11,12]};
  const echeances={'T1-2026':'2026-04-30','T2-2026':'2026-07-31','T3-2026':'2026-10-31','T4-2026':'2027-01-31'};
  const labels={'T1-2026':'T1 (jan–mar)','T2-2026':'T2 (avr–jun)','T3-2026':'T3 (jul–sep)','T4-2026':'T4 (oct–déc)'};
  const grid=q('#urssaf-cards-grid');
  const now=new Date();
  grid.innerHTML=quarters.map(cle=>{
    const d=urssafData[cle]||{};
    const ech=echeances[cle];
    const jours=Math.ceil((new Date(ech)-now)/86400000);
    const caT=d.ca||0,urssafDue=d.urssaf||Math.round(caT*tauxU*100)/100,cfpDue=d.cfp||Math.round(caT*tauxC*100)/100,total=d.total||urssafDue+cfpDue;
    const statut=d.statut||(d.montantPaye>0?'paye':jours<0?'a_payer':'a_venir');
    const cls=statut==='paye'?'paye':jours<=30&&statut!=='paye'?'alerte-rouge':jours<=60&&statut!=='paye'?'alerte-orange':'';
    const countdown=statut==='paye'?`<span style="color:var(--success);">Payé le ${fmtDate(d.datePaye)} — ${fmt(d.montantPaye||0)}</span>`:jours<=0?`<span class="urssaf-countdown rouge">Échu</span>`:`<span class="urssaf-countdown ${jours<=30?'rouge':jours<=60?'orange':''}">${jours} jours restants</span>`;
    const pct=total>0?Math.min(100,Math.round((d.montantPaye||0)/total*100)):0;
    return`<div class="urssaf-card ${cls}">
      <div class="urssaf-header">
        <div><div class="urssaf-titre">${labels[cle]}</div><div class="urssaf-echeance">Échéance ${fmtDate(ech)}</div></div>
        <span class="badge badge-${statut==='paye'?'paye':statut==='a_payer'?'a-payer':'a-venir'}">${statut==='paye'?'Payé':statut==='a_payer'?'À payer':'À venir'}</span>
      </div>
      <div class="urssaf-montant">${fmt(total)}</div>
      <div class="urssaf-detail">CA ${fmt(caT)} · URSSAF ${fmt(urssafDue)} · CFP ${fmt(cfpDue)}</div>
      ${countdown}
      <div class="progress-bar" style="margin:8px 0;"><div class="fill ${pct>=100?'green':''}" style="width:${pct}%"></div></div>
      ${statut!=='paye'?`<button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="openURSSAFPaiement('${cle}')"><i class="ti ti-check"></i> Marquer payé</button>`:''}
    </div>`;
  }).join('');

  // Charges mensuelles
  const caMois=factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(mKey)).reduce((s,f)=>s+f.montant,0);
  const urssafM=Math.round(caMois*tauxU*100)/100,cfpM=Math.round(caMois*tauxC*100)/100;
  const aboM=abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0);
  const depM=depenses.filter(d=>d.date?.startsWith(mKey)).reduce((s,d)=>s+d.montant,0);
  const totalCharges=urssafM+cfpM+pas+cfe+aboM;
  const net=Math.max(0,caMois-totalCharges-depM);
  q('#charges-recap-list').innerHTML=`
    <div class="charges-recap-line"><span class="charges-recap-label">URSSAF provision (25,6%)</span><span class="charges-recap-amount">${fmt(urssafM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFP provision (0,2%)</span><span class="charges-recap-amount">${fmt(cfpM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">PAS fixe</span><span class="charges-recap-amount">${fmt(pas)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFE mensuelle</span><span class="charges-recap-amount">${fmt(cfe)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">Abonnements actifs</span><span class="charges-recap-amount">${fmt(aboM)}</span></div>
    <div class="charges-recap-total"><span class="label">Total charges</span><span class="amount">${fmt(totalCharges)}</span></div>
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;">Ratio charges/CA : ${caMois>0?Math.round(totalCharges/caMois*100):0}%</div>`;
  q('#charges-depenses-mois').innerHTML=`
    <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro ce mois</span><span class="charges-recap-amount">${fmt(depM)}</span></div>
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;"><a style="cursor:pointer;color:var(--navy);" onclick="navigate('depenses')">Voir les dépenses →</a></div>`;
  q('#cru-ca').textContent=fmt(caMois);
  q('#cru-charges').textContent=fmt(totalCharges+depM);
  q('#cru-net').textContent=fmt(net);
  q('#cru-versement').textContent=fmt(net*(settings.pctVersement||65)/100);
}
function openURSSAFPaiement(cle){
  urssafCurrentCle=cle;
  q('#modal-urssaf-title').textContent=`Paiement ${cle}`;
  q('#modal-urssaf-detail').textContent='Saisissez le montant réellement payé à l\'URSSAF.';
  q('#urs-date-paye').value=today();q('#urs-montant-paye').value='';
  openModal('modal-urssaf');
}
async function saveURSSAFPaiement(){
  const body={statut:'paye',montantPaye:parseFloat(q('#urs-montant-paye').value)||0,datePaye:q('#urs-date-paye').value};
  try{await PUT(`/api/urssaf/${urssafCurrentCle}`,body);closeModal('modal-urssaf');toast('Paiement enregistré','success');loadChargesURSSAF();}catch(e){toast(e.message,'error');}
}

/* ─── Répartition ────────────────────────────────────────────────────── */
async function loadRepartition(){
  const [settings,factures,repartition]=await Promise.all([
    load('settings','/api/settings'),load('factures','/api/factures'),
    GET('/api/repartition'),
  ]);
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=`${y}-${String(m).padStart(2,'0')}`;
  const caMois=factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(mKey)).reduce((s,f)=>s+f.montant,0);
  const pctV=settings.pctVersement||65,pctE=settings.pctEpargne||15,pctT=settings.pctTresorerie||20;
  const recommV=Math.round(caMois*pctV/100),recommE=Math.round(caMois*pctE/100),recommT=Math.round(caMois*pctT/100);
  q('#rep-recomm-versement').textContent=fmt(recommV);
  q('#rep-recomm-epargne').textContent=fmt(recommE);
  q('#rep-recomm-tresorerie').textContent=fmt(recommT);
  const rv=repartition?.versement||0,re=repartition?.epargne||0,rt=repartition?.tresorerie||0;
  q('#rep-input-versement').value=rv||'';q('#rep-input-epargne').value=re||'';q('#rep-input-tresorerie').value=rt||'';
  const setEcart=(el,reel,recomm)=>{const e=reel-recomm;el.innerHTML=e>=0?`<span class="ok">+${fmt(e)} vs recommandé</span>`:`<span class="ko">${fmt(e)} vs recommandé</span>`;};
  setEcart(q('#rep-ecart-versement'),rv,recommV);setEcart(q('#rep-ecart-epargne'),re,recommE);setEcart(q('#rep-ecart-tresorerie'),rt,recommT);
  q('#rep-bar-versement').style.width=`${recommV>0?Math.min(100,Math.round(rv/recommV*100)):0}%`;
  q('#rep-bar-epargne').style.width=`${recommE>0?Math.min(100,Math.round(re/recommE*100)):0}%`;
  q('#rep-bar-tresorerie').style.width=`${recommT>0?Math.min(100,Math.round(rt/recommT*100)):0}%`;
  const c1=q('#chart-rep-donut');
  if(c1)drawDonutChart(c1,['Versement','Épargne','Tréso'],[pctV,pctE,pctT],[COLORS.navy,COLORS.success,COLORS.blue]);
  const c2=q('#chart-rep-bar');
  if(c2)drawBarChart(c2,['Versement','Épargne','Tréso'],[{data:[recommV,recommE,recommT],color:COLORS.muted},{data:[rv,re,rt],color:COLORS.navy}]);
}
async function saveRepartition(){
  const body={versement:parseFloat(q('#rep-input-versement').value)||0,epargne:parseFloat(q('#rep-input-epargne').value)||0,tresorerie:parseFloat(q('#rep-input-tresorerie').value)||0};
  try{await PUT('/api/repartition',body);toast('Répartition enregistrée','success');loadRepartition();}catch(e){toast(e.message,'error');}
}

/* ─── Objectifs épargne ──────────────────────────────────────────────── */
let epargneGoals=[];
async function loadObjectifsEpargne(){
  epargneGoals=await GET('/api/objectifs/epargne')||[];
  renderEpargneGoals();
}
function renderEpargneGoals(){
  const g=q('#epargne-goals-grid');
  if(!epargneGoals.length){g.innerHTML='<p style="color:var(--text-2);">Aucun objectif. Cliquez sur + pour en créer.</p>';return;}
  g.innerHTML=epargneGoals.map(obj=>{
    const cible=obj.montantCible||0,actuel=obj.montantActuel||0;
    const pct=cible>0?Math.min(100,Math.round(actuel/cible*100)):0;
    const moisRest=cible>actuel&&actuel>0?Math.ceil((cible-actuel)/(actuel||1)):null;
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
  q('#obj-nom').value=data.nom||'';q('#obj-cible').value=data.montantCible||'';
  q('#obj-actuel').value=data.montantActuel||0;q('#obj-date').value=data.dateCible||'';
  q('#btn-save-obj-epargne').dataset.id=data.id||'';
  openModal('modal-objectif-epargne');
}
async function saveEpargneGoal(){
  const id=q('#btn-save-obj-epargne').dataset.id;
  const body={nom:q('#obj-nom').value.trim(),montantCible:parseFloat(q('#obj-cible').value)||0,montantActuel:parseFloat(q('#obj-actuel').value)||0,dateCible:q('#obj-date').value||null};
  if(!body.nom||!body.montantCible){toast('Nom et cible requis','error');return;}
  try{
    if(id)await PUT(`/api/objectifs/epargne/${id}`,body);else await POST('/api/objectifs/epargne',body);
    closeModal('modal-objectif-epargne');toast('Objectif enregistré','success');loadObjectifsEpargne();
  }catch(e){toast(e.message,'error');}
}
function editEpargneGoal(id){const g=epargneGoals.find(x=>x.id===id);if(g)openEpargneGoalModal(g);}
async function deleteEpargneGoal(id){
  if(!await confirmDialog('Supprimer','Irréversible.'))return;
  try{await DEL(`/api/objectifs/epargne/${id}`);toast('Supprimé');loadObjectifsEpargne();}catch(e){toast(e.message,'error');}
}

/* ─── Rapport mensuel ────────────────────────────────────────────────── */
function loadRapportMensuel(){
  const y=new Date().getFullYear();
  const selA=q('#rm-annee');if(selA&&!selA.options.length){for(let i=y;i>=y-3;i--)selA.add(new Option(i,i));selA.value=y;}
  q('#rm-mois').value=new Date().getMonth()+1;
}
async function genRapportMensuel(){
  const mois=q('#rm-mois').value,annee=q('#rm-annee').value;
  try{
    const d=await GET(`/api/rapport/mensuel?mois=${mois}&annee=${annee}`);
    renderRapportMensuel(d,mois,annee);
  }catch(e){toast(e.message,'error');}
}
function renderRapportMensuel(d,mois,annee){
  const el=q('#rapport-mensuel-content');
  const comp=d.comparaisonPrecedent;
  const delta=comp?.delta;
  const phrase=`Ce mois (${MOIS_LONG[mois-1]} ${annee}), tu as encaissé ${fmt(d.ca)}, soit ${delta!==null?`${delta>=0?'+':''}${delta}% vs le mois précédent`:'(premier mois)'}. Ton résultat net est de ${fmt(d.net)}, tu peux te verser ${fmt(d.versement)}.`;
  el.innerHTML=`
    <div class="rapport-phrase">${phrase}</div>
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA encaissé</span><span class="kpi-value">${fmt(d.ca||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges</span><span class="kpi-value danger">${fmt(d.charges||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">${fmt(d.net||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Versement (${d.pctVersement||65}%)</span><span class="kpi-value">${fmt(d.versement||0)}</span></div>
    </div>
    <div class="card">
      <div class="card-title">Détail des charges</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">URSSAF</span><span class="charges-recap-amount">${fmt(d.urssaf||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">CFP</span><span class="charges-recap-amount">${fmt(d.cfp||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro</span><span class="charges-recap-amount">${fmt(d.dep||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Abonnements</span><span class="charges-recap-amount">${fmt(d.abo||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">PAS</span><span class="charges-recap-amount">${fmt(PAS_FIXE)}</span></div>
      </div>
    </div>
    ${comp?`<div class="card" style="margin-top:16px;"><div class="card-title">Comparaison mois précédent</div><div style="display:flex;gap:24px;font-size:13.5px;"><div>CA : ${fmt(comp.ca||0)}</div><div>Résultat : ${fmt(comp.net||0)}</div><div style="color:${delta>=0?'var(--success)':'var(--danger)'};">Δ CA : ${delta!==null?(delta>=0?'+':'')+delta+'%':'—'}</div></div></div>`:''}`;
}

/* ─── Rapport annuel ─────────────────────────────────────────────────── */
function loadRapportAnnuel(){
  const y=new Date().getFullYear();
  const sel=q('#ra-annee');if(sel&&!sel.options.length){for(let i=y;i>=y-3;i--)sel.add(new Option(i,i));sel.value=y;}
}
async function genRapportAnnuel(){
  const annee=q('#ra-annee').value;
  try{const d=await GET(`/api/rapport/annuel?annee=${annee}`);renderRapportAnnuel(d);}catch(e){toast(e.message,'error');}
}
function renderRapportAnnuel(d){
  const el=q('#rapport-annuel-content');
  const moisData=d.mois||[];
  el.innerHTML=`
    <div class="kpi-grid kpi-grid-3 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel</span><span class="kpi-value">${fmt(d.totaux?.ca||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges totales</span><span class="kpi-value danger">${fmt(d.totaux?.charges||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">${fmt(d.totaux?.net||0)}</span></div>
    </div>
    ${d.meilleur?`<div class="alert info" style="margin-bottom:16px;"><i class="ti ti-trophy"></i> Meilleur mois : ${MOIS_LONG[(d.meilleur.mois||1)-1]} · ${fmt(d.meilleur.ca)}</div>`:''}
    <div class="card mb-16">
      <div class="card-title">Tableau mensuel</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Mois</th><th>CA</th><th>Charges</th><th>Résultat</th><th>Versement</th></tr></thead>
        <tbody>${moisData.map(m=>`<tr>
          <td>${MOIS_COURT[m.mois-1]}</td>
          <td class="td-amount">${fmt(m.ca||0)}</td>
          <td class="td-amount" style="color:var(--danger);">${fmt(m.charges||0)}</td>
          <td class="td-amount" style="color:var(--success);">${fmt(m.net||0)}</td>
          <td class="td-amount">${fmt(m.versement||0)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card"><div class="card-title">Évolution annuelle</div><div class="chart-wrap"><canvas id="chart-ra" height="200"></canvas></div></div>`;
  setTimeout(()=>{
    const c=q('#chart-ra');
    if(c)drawBarChart(c,MOIS_COURT,[{data:moisData.map(m=>m.ca||0),color:COLORS.blue},{data:moisData.map(m=>m.charges||0),color:COLORS.violet}]);
  },50);
}

/* ─── Rapport fiscal BNC ─────────────────────────────────────────────── */
function loadRapportFiscal(){
  const y=new Date().getFullYear();
  const sel=q('#rf-annee');if(sel&&!sel.options.length){for(let i=y;i>=y-3;i--)sel.add(new Option(i,i));sel.value=y;}
}
async function genRapportFiscal(){
  const annee=q('#rf-annee').value;
  try{const d=await GET(`/api/rapport/fiscal?annee=${annee}`);renderRapportFiscal(d);}catch(e){toast(e.message,'error');}
}
function renderRapportFiscal(d){
  const el=q('#rapport-fiscal-content');
  const pct=d.pctPlafond||0;
  const barColor=pct>=90?'var(--danger)':pct>=80?'var(--warning)':'var(--success)';
  el.innerHTML=`
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel brut</span><span class="kpi-value">${fmt(d.caAnnuel||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Abattement 34%</span><span class="kpi-value">${fmt(d.abattement||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Revenu imposable</span><span class="kpi-value">${fmt(d.revenuImposable||0)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Cotisations sociales</span><span class="kpi-value danger">${fmt(d.cotisations||0)}</span></div>
    </div>
    <div class="card mb-16">
      <div class="card-title">Plafond micro-BNC · ${fmtN(PLAFOND_BNC)} €</div>
      <div class="fiscal-plafond-wrap">
        <div class="fiscal-plafond-bar"><div class="fiscal-plafond-fill ${pct>=90?'danger':pct>=80?'warning':''}" style="width:${pct}%"></div></div>
        <div class="fiscal-plafond-pct">${pct}%</div>
      </div>
      ${d.alertePlafond?`<div class="alert danger" style="margin-top:8px;"><i class="ti ti-alert-triangle"></i> Vous avez dépassé 80% du plafond micro-BNC. Préparez un potentiel passage au régime réel.</div>`:''}
    </div>
    <div class="card mb-16">
      <div class="card-title">Estimation impôt sur le revenu 2026</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">Revenu imposable (après abattement)</span><span class="charges-recap-amount">${fmt(d.revenuImposable||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Cotisations sociales</span><span class="charges-recap-amount">${fmt(d.cotisations||0)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro YTD</span><span class="charges-recap-amount">${fmt(d.depAnnuel||0)}</span></div>
        <div class="charges-recap-total"><span class="label">Estimation impôt</span><span class="amount">${fmt(d.impotEstime||0)}</span></div>
      </div>
      <p style="font-size:11px;color:var(--text-2);margin-top:10px;">Estimation indicative basée sur les tranches 2026. Consultez un comptable pour votre déclaration.</p>
    </div>`;
}

/* ─── Simulateur ─────────────────────────────────────────────────────── */
function loadSimulateur(){
  const s=cache['settings']||{};
  q('#sim-versement-slider').value=s.pctVersement||65;
  q('#sim-slider-val').textContent=`${s.pctVersement||65}%`;
  // init annee selects
  const selA=q('#rm-annee');
}
function calcSimMensuel(){
  const ca=parseFloat(q('#sim-ca-mois').value)||0;
  const dep=parseFloat(q('#sim-dep-pro').value)||0;
  const cfe=(parseFloat(q('#sim-cfe').value)||0)/12;
  const aides=parseFloat(q('#sim-aides').value)||0;
  const depPerso=parseFloat(q('#sim-dep-perso').value)||0;
  const pctV=parseInt(q('#sim-versement-slider').value)||65;
  const s=cache['settings']||{};
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const urssaf=Math.round(ca*tU*100)/100,cfp=Math.round(ca*tC*100)/100;
  const net=Math.max(0,ca-urssaf-cfp-dep-cfe-pas);
  const versement=Math.round(net*pctV/100*100)/100;
  const epargne=Math.round(net*0.15*100)/100;
  const treso=Math.round(net*(1-pctV/100-0.15)*100)/100;
  q('#sr-ca').textContent=fmt(ca);q('#sr-urssaf').textContent=`− ${fmt(urssaf)}`;
  q('#sr-cfp').textContent=`− ${fmt(cfp)}`;q('#sr-dep').textContent=`− ${fmt(dep)}`;
  q('#sr-cfe').textContent=`− ${fmt(cfe)}`;q('#sr-net').textContent=fmt(net);
  q('#sr-vers-label').textContent=`Je me verse (${pctV}%)`;
  q('#sr-versement').textContent=fmt(versement);q('#sr-epargne').textContent=fmt(epargne);q('#sr-treso').textContent=fmt(treso);
  const panel=q('#sim-result-panel-mensuel');panel.style.display='block';
  const bg=q('#sr-budget-perso');
  if(aides>0||depPerso>0){
    bg.style.display='block';
    const entrees=versement+aides;
    q('#sr-bg-entrees').textContent=fmt(entrees);q('#sr-bg-depenses').textContent=`− ${fmt(depPerso)}`;
    const reste=entrees-depPerso;
    q('#sr-bg-reste').textContent=fmt(reste);
    q('#sr-bg-reste').className=`sim-line-amount ${reste>=0?'pos':'neg'}`;
  }else bg.style.display='none';
}
function calcSimTrimestriel(){
  const m1=parseFloat(q('#sim-t-m1').value)||0,m2=parseFloat(q('#sim-t-m2').value)||0,m3=parseFloat(q('#sim-t-m3').value)||0;
  const dep=parseFloat(q('#sim-t-dep').value)||0;
  const s=cache['settings']||{};
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const caT=m1+m2+m3;
  const cotis=Math.round(caT*(tU+tC)*100)/100;
  const pasT=pas*3;
  const net=Math.max(0,caT-cotis-dep-pasT);
  const urssafDu=Math.round(caT*tU*100)/100;
  const panel=q('#sim-result-panel-trim');panel.style.display='block';
  q('#srt-ca').textContent=fmt(caT);q('#srt-cotis').textContent=`− ${fmt(cotis)}`;
  q('#srt-dep').textContent=`− ${fmt(dep)}`;q('#srt-pas').textContent=`− ${fmt(pasT)}`;
  q('#srt-net').textContent=fmt(net);q('#srt-urssaf-du').textContent=fmt(urssafDu);
  q('#srt-provision').textContent=fmt(Math.round(urssafDu/3*100)/100);
}
function calcSimAnnuel(){
  const caM=parseFloat(q('#sim-a-ca').value)||0;
  const depM=parseFloat(q('#sim-a-dep').value)||0;
  const cfe=parseFloat(q('#sim-a-cfe').value)||0;
  const s=cache['settings']||{};
  const tU=(s.tauxUrssaf||25.6)/100,tC=(s.tauxCfp||0.2)/100,pas=s.pasFixe||40;
  const scenarios=[{label:'optimiste',mult:1.2,cls:'optimiste'},{label:'réaliste',mult:1,cls:'realiste'},{label:'pessimiste',mult:0.8,cls:'pessimiste'}];
  const html=scenarios.map(sc=>{
    const ca=Math.round(caM*12*sc.mult);
    const charges=Math.round(ca*(tU+tC)*100)/100+depM*12+pas*12+cfe;
    const net=Math.max(0,ca-charges);
    const pctV=s.pctVersement||65;
    return`<div class="scenario-card ${sc.cls}">
      <div class="scenario-label">${sc.label} (×${sc.mult})</div>
      <div class="scenario-ca">${fmt(ca)}</div>
      <div class="scenario-sub">Net : ${fmt(net)} · Versement : ${fmt(Math.round(net*pctV/100))}</div>
      ${ca>PLAFOND_BNC?`<div style="font-size:11px;color:var(--danger);margin-top:6px;"><i class="ti ti-alert-triangle"></i> Dépasse le plafond micro-BNC</div>`:''}
    </div>`;
  }).join('');
  q('#sim-result-annuel').innerHTML=`<div class="scenarios-grid">${html}</div>`;
}

/* ─── Import / Export ────────────────────────────────────────────────── */
let importFacturesParsed=null,importDepensesParsed=null;
function initImportExport(){
  // Tabs IE
  qa('[data-ie-tab]').forEach(btn=>btn.onclick=()=>{
    qa('[data-ie-tab]').forEach(b=>b.classList.remove('active'));
    qa('.sim-panel[id^="ie-panel"]').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    q(`#ie-panel-${btn.dataset.ieTab}`)?.classList.add('active');
  });
  // Drag & drop factures
  setupFileDrop('drop-factures','file-factures-csv',data=>{importFacturesParsed=data;previewImport('factures',data);});
  setupFileDrop('drop-depenses','file-depenses-csv',data=>{importDepensesParsed=data;previewImport('depenses',data);});
  // Export buttons
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
  const prevId=`import-${type}-preview`;
  const btnId=`btn-import-${type}`;
  const prev=q(`#${prevId}`),btn=q(`#${btnId}`);
  if(!prev||!rows.length){return;}
  const existingNums=type==='factures'?(cache['factures']||[]).map(f=>f.numero):[];
  prev.style.display='block';
  prev.innerHTML=`<div class="import-row header"><span>Statut</span><span>Date</span><span>Référence</span><span>Montant</span></div>`+
    rows.slice(0,20).map(r=>{
      const isDoublon=type==='factures'&&existingNums.includes(r.numero||r['n° facture']||r.number);
      return`<div class="import-row ${isDoublon?'doublon':'new'}"><span>${isDoublon?'Doublon':'Nouveau'}</span><span>${r.date||'—'}</span><span>${r.numero||r.client||r.description||'—'}</span><span>${r.montant||'—'}</span></div>`;
    }).join('');
  btn.style.display='inline-flex';
}
async function doImportFactures(){
  if(!importFacturesParsed)return;
  try{
    const res=await POST('/api/import/factures',{lignes:importFacturesParsed});
    toast(`Importées : ${res.importees} · Doublons ignorés : ${res.doublons}`,'success');
    invalidate('factures');importFacturesParsed=null;
    q('#import-factures-preview').style.display='none';q('#btn-import-factures').style.display='none';
  }catch(e){toast(e.message,'error');}
}
async function doImportDepenses(){
  if(!importDepensesParsed)return;
  try{
    const res=await POST('/api/import/depenses',{lignes:importDepensesParsed});
    toast(`Importées : ${res.importees}`,'success');
    invalidate('depenses');importDepensesParsed=null;
    q('#import-depenses-preview').style.display='none';q('#btn-import-depenses').style.display='none';
  }catch(e){toast(e.message,'error');}
}
function exportCSV(type){window.open(`/api/export/${type}`,'_blank');}

/* ─── Options ────────────────────────────────────────────────────────── */
async function loadOptions(){
  const s=await GET('/api/settings')||{};
  cache['settings']=s;
  q('#opt-nom').value=s.nom||'Cindy';
  q('#opt-entreprise').value=s.entreprise||'Seed to Bloom';
  q('#opt-email').value=s.email||'contact@seedtobloom.fr';
  q('#opt-objectif-ca').value=s.objectifCA||60000;
  q('#opt-urssaf').value=s.tauxUrssaf||25.6;
  q('#opt-cfp').value=s.tauxCfp||0.2;
  q('#opt-pas').value=s.pasFixe||40;
  q('#opt-cfe').value=s.cfeAnnuelle||0;
  q('#opt-versement').value=s.pctVersement||65;
  q('#opt-epargne-pct').value=s.pctEpargne||15;
  q('#opt-tresorerie-pct').value=s.pctTresorerie||20;
  updateOptTotal();
}
function updateOptTotal(){
  const v=parseFloat(q('#opt-versement')?.value)||0;
  const e=parseFloat(q('#opt-epargne-pct')?.value)||0;
  const t=parseFloat(q('#opt-tresorerie-pct')?.value)||0;
  const total=v+e+t;
  const el=q('#opt-total-alerte');
  if(el)el.innerHTML=total===100?`<span style="color:var(--success);">✓ Total : 100%</span>`:`<span style="color:var(--danger);">Total : ${total}% (doit être égal à 100%)</span>`;
}
async function saveOptions(){
  const v=parseFloat(q('#opt-versement').value)||65;
  const e=parseFloat(q('#opt-epargne-pct').value)||15;
  const t=parseFloat(q('#opt-tresorerie-pct').value)||20;
  if(v+e+t!==100){toast('Versement + Épargne + Trésorerie doit être égal à 100%','error');return;}
  const body={nom:q('#opt-nom').value.trim(),entreprise:q('#opt-entreprise').value.trim(),email:q('#opt-email').value.trim(),objectifCA:parseFloat(q('#opt-objectif-ca').value)||60000,tauxUrssaf:parseFloat(q('#opt-urssaf').value)||25.6,tauxCfp:parseFloat(q('#opt-cfp').value)||0.2,pasFixe:parseFloat(q('#opt-pas').value)||40,cfeAnnuelle:parseFloat(q('#opt-cfe').value)||0,pctVersement:v,pctEpargne:e,pctTresorerie:t};
  try{await PUT('/api/settings',body);cache['settings']=body;toast('Options enregistrées','success');}catch(e){toast(e.message,'error');}
}
async function changePassword(){
  const actuel=q('#opt-pwd-actuel').value,nouveau=q('#opt-pwd-nouveau').value,confirm_=q('#opt-pwd-confirm').value;
  if(!actuel||!nouveau){toast('Tous les champs requis','error');return;}
  if(nouveau!==confirm_){toast('Les mots de passe ne correspondent pas','error');return;}
  if(nouveau.length<8){toast('Minimum 8 caractères','error');return;}
  try{await POST('/api/auth/change-password',{currentPassword:actuel,newPassword:nouveau});toast('Mot de passe changé','success');q('#opt-pwd-actuel').value='';q('#opt-pwd-nouveau').value='';q('#opt-pwd-confirm').value='';}catch(e){toast(e.message,'error');}
}

/* ─── Init ───────────────────────────────────────────────────────────── */
function init(){
  initModals();


  // Nav
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-section]');
    if(nav)navigate(nav.dataset.section);
  });

  // Dashboard refresh
  q('#dash-refresh-btn')?.addEventListener('click',()=>loadDashboard());

  // Sidebar active init
  qa('.nav-item').forEach(n=>n.onclick=function(){navigate(this.dataset.section);});

  // Factures
  q('#btn-new-facture')?.onclick=()=>openFactureModal();
  q('#btn-save-facture')?.onclick=saveFacture;
  q('#factures-search')?.addEventListener('input',renderFactures);
  q('#factures-filter-statut')?.addEventListener('change',renderFactures);
  q('#f-pdf-btn')?.onclick=()=>q('#f-pdf-file').click();
  q('#f-pdf-file')?.addEventListener('change',()=>{const f=q('#f-pdf-file').files[0];if(f){q('#f-pdf-name').textContent=f.name;q('#f-pdf-btn').className='pdf-btn present';}});

  // Dépenses
  q('#btn-new-depense')?.onclick=()=>openDepenseModal();
  q('#btn-save-depense')?.onclick=saveDepense;
  q('#depenses-search')?.addEventListener('input',renderDepenses);
  q('#depenses-filter-cat')?.addEventListener('change',renderDepenses);

  // Abonnements
  q('#btn-new-abonnement')?.onclick=()=>openAbonnementModal();
  q('#btn-save-abonnement')?.onclick=saveAbonnement;

  // Comptes
  q('#btn-new-compte')?.onclick=()=>openCompteModal();
  q('#btn-save-compte')?.onclick=saveCompte;
  q('#btn-save-compte-update')?.onclick=saveCompteUpdate;

  // Transactions
  q('#btn-new-txn')?.onclick=openTxnModal;
  q('#btn-save-txn')?.onclick=saveTxn;
  q('#txn-search')?.addEventListener('input',renderTransactions);
  q('#txn-filter-compte')?.addEventListener('change',renderTransactions);
  q('#txn-filter-type')?.addEventListener('change',renderTransactions);

  // URSSAF
  q('#btn-save-urssaf')?.onclick=saveURSSAFPaiement;

  // Objectifs CA
  q('#btn-edit-objectif-ca')?.onclick=openObjectifCAModal;
  q('#btn-save-objectif-ca')?.onclick=saveObjectifCA;

  // Objectifs épargne
  q('#btn-new-objectif-epargne')?.onclick=()=>openEpargneGoalModal();
  q('#btn-save-obj-epargne')?.onclick=saveEpargneGoal;

  // Répartition
  q('#btn-save-repartition')?.onclick=saveRepartition;

  // Rapports
  q('#btn-rm-gen')?.onclick=genRapportMensuel;
  q('#btn-ra-gen')?.onclick=genRapportAnnuel;
  q('#btn-rf-gen')?.onclick=genRapportFiscal;

  // Simulateur
  q('#sim-versement-slider')?.addEventListener('input',function(){q('#sim-slider-val').textContent=`${this.value}%`;});
  q('#btn-sim-calculer')?.onclick=calcSimMensuel;
  q('#btn-sim-trim')?.onclick=calcSimTrimestriel;
  q('#btn-sim-annuel')?.onclick=calcSimAnnuel;
  qa('.sim-tab').forEach(btn=>btn.onclick=function(){
    const panel=this.dataset.sim;
    qa('.sim-tab').forEach(b=>b.classList.remove('active'));
    qa('.sim-panel').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
    q(`#sim-panel-${panel}`)?.classList.add('active');
  });

  // Import/Export
  q('#btn-import-factures')?.onclick=doImportFactures;
  q('#btn-import-depenses')?.onclick=doImportDepenses;

  // Options
  q('#btn-save-options')?.onclick=saveOptions;
  q('#btn-change-pwd')?.onclick=changePassword;
  ['#opt-versement','#opt-epargne-pct','#opt-tresorerie-pct'].forEach(id=>q(id)?.addEventListener('input',updateOptTotal));

  // Démarrage direct sans connexion
  navigate('dashboard');
  if(false){
  }
}

document.addEventListener('DOMContentLoaded',init);
