/**
 * wBack.js — STB Finance · Worker API
 * Appelé uniquement via service binding depuis wFront.js (pas d'accès direct navigateur)
 * Bindings requis : KV_AUTH, KV_DATA, R2_FINANCE
 */

const URSSAF_TAUX = 0.256;
const CFP_TAUX    = 0.002;
const PAS_FIXE    = 40;
const USER_ID     = 'cindy';
const PLAFOND_BNC = 77700;

const ECHEANCES_URSSAF = {
  'T1-2026': { label: 'T1 (jan–mar)', echeance: '2026-04-30', mois: [1,2,3] },
  'T2-2026': { label: 'T2 (avr–jun)', echeance: '2026-07-31', mois: [4,5,6] },
  'T3-2026': { label: 'T3 (jul–sep)', echeance: '2026-10-31', mois: [7,8,9] },
  'T4-2026': { label: 'T4 (oct–déc)', echeance: '2027-01-31', mois: [10,11,12] },
};

export default {
  async fetch(request, env) {
    try {
      return await router(request, env);
    } catch (e) {
      return jsonErr(500, 'Erreur interne : ' + (e.message || ''));
    }
  }
};

async function router(request, env) {
  const url    = new URL(request.url);
  const path   = url.pathname.replace(/\/$/, '');
  const method = request.method;
  const uid    = USER_ID;

  if (method === 'GET'  && path === '/api/settings')       return settingsGet(env, uid);
  if (method === 'PUT'  && path === '/api/settings')       return settingsPut(request, env, uid);
  if (method === 'GET'  && path === '/api/dashboard')      return dashboard(env, uid);

  if (method === 'GET'  && path === '/api/factures')       return listFactures(env, uid);
  if (method === 'POST' && path === '/api/factures')       return createFacture(request, env, uid);
  const mF = path.match(/^\/api\/factures\/([^/]+)$/);
  if (mF) {
    if (method === 'GET')    return getFacture(env, uid, mF[1]);
    if (method === 'PUT')    return updateFacture(request, env, uid, mF[1]);
    if (method === 'DELETE') return deleteFacture(env, uid, mF[1]);
  }
  const mFPDF = path.match(/^\/api\/factures\/([^/]+)\/pdf$/);
  if (mFPDF) {
    if (method === 'POST') return uploadPDF(request, env, uid, mFPDF[1]);
    if (method === 'GET')  return downloadPDF(env, uid, mFPDF[1]);
  }

  if (method === 'GET'  && path === '/api/depenses')       return listDepenses(env, uid);
  if (method === 'POST' && path === '/api/depenses')       return createDepense(request, env, uid);
  const mD = path.match(/^\/api\/depenses\/([^/]+)$/);
  if (mD && method === 'PUT')    return updateDepense(request, env, uid, mD[1]);
  if (mD && method === 'DELETE') return deleteDepense(env, uid, mD[1]);

  if (method === 'GET'  && path === '/api/depenses-prevues')  return listDepensesPrevues(env, uid);
  if (method === 'POST' && path === '/api/depenses-prevues')  return createDepensePrevue(request, env, uid);
  const mDP = path.match(/^\/api\/depenses-prevues\/([^/]+)$/);
  if (mDP && method === 'PUT')    return updateDepensePrevue(request, env, uid, mDP[1]);
  if (mDP && method === 'DELETE') return deleteDepensePrevue(env, uid, mDP[1]);

  if (method === 'GET'  && path === '/api/abonnements')    return listAbo(env, uid);
  if (method === 'POST' && path === '/api/abonnements')    return createAbo(request, env, uid);
  const mA = path.match(/^\/api\/abonnements\/([^/]+)$/);
  if (mA) {
    if (method === 'PUT')    return updateAbo(request, env, uid, mA[1]);
    if (method === 'DELETE') return deleteAbo(env, uid, mA[1]);
  }

  if (method === 'GET'  && path === '/api/comptes')        return listComptes(env, uid);
  if (method === 'POST' && path === '/api/comptes')        return createCompte(request, env, uid);
  const mC = path.match(/^\/api\/comptes\/([^/]+)$/);
  if (mC && method === 'PUT')    return updateCompte(request, env, uid, mC[1]);
  if (mC && method === 'DELETE') return deleteCompte(env, uid, mC[1]);
  const mCH = path.match(/^\/api\/comptes\/([^/]+)\/historique$/);
  if (mCH && method === 'POST') return addHistoriqueCompte(request, env, uid, mCH[1]);

  if (method === 'GET'  && path === '/api/transactions')   return listTransactions(env, uid, url);
  if (method === 'POST' && path === '/api/transactions')   return createTransaction(request, env, uid);
  const mT = path.match(/^\/api\/transactions\/([^/]+)$/);
  if (mT && method === 'DELETE') return deleteTransaction(env, uid, mT[1]);

  if (method === 'GET'  && path === '/api/urssaf')         return listURSSAF(env, uid);
  const mU = path.match(/^\/api\/urssaf\/([^/]+)$/);
  if (mU) {
    if (method === 'GET') return getURSSAF(env, uid, mU[1]);
    if (method === 'PUT') return updateURSSAF(request, env, uid, mU[1]);
  }

  if (method === 'GET' && path === '/api/objectifs/ca')    return getObjectifCA(env, uid);
  if (method === 'PUT' && path === '/api/objectifs/ca')    return putObjectifCA(request, env, uid);

  if (method === 'GET'  && path === '/api/objectifs/epargne') return listObjectifsEpargne(env, uid);
  if (method === 'POST' && path === '/api/objectifs/epargne') return createObjectifEpargne(request, env, uid);
  const mOE = path.match(/^\/api\/objectifs\/epargne\/([^/]+)$/);
  if (mOE) {
    if (method === 'PUT')    return updateObjectifEpargne(request, env, uid, mOE[1]);
    if (method === 'DELETE') return deleteObjectifEpargne(env, uid, mOE[1]);
  }

  if (method === 'GET'  && path === '/api/tiers')          return listTiers(env, uid);
  if (method === 'POST' && path === '/api/tiers')          return createTiers(request, env, uid);
  const mTi = path.match(/^\/api\/tiers\/([^/]+)$/);
  if (mTi) {
    if (method === 'PUT')    return updateTiers(request, env, uid, mTi[1]);
    if (method === 'DELETE') return deleteTiers(env, uid, mTi[1]);
  }

  if (method === 'GET'  && path === '/api/devis')          return listDevis(env, uid);
  if (method === 'POST' && path === '/api/devis')          return createDevis(request, env, uid);
  const mDv = path.match(/^\/api\/devis\/([^/]+)$/);
  if (mDv) {
    if (method === 'GET')    return getDevis(env, uid, mDv[1]);
    if (method === 'PUT')    return updateDevis(request, env, uid, mDv[1]);
    if (method === 'DELETE') return deleteDevis(env, uid, mDv[1]);
  }
  const mDvPDF = path.match(/^\/api\/devis\/([^/]+)\/pdf$/);
  if (mDvPDF) {
    if (method === 'POST') return uploadDevisPDF(request, env, uid, mDvPDF[1]);
    if (method === 'GET')  return downloadDevisPDF(env, uid, mDvPDF[1]);
  }

  if (method === 'GET'  && path === '/api/projets')        return listProjets(env, uid);
  if (method === 'POST' && path === '/api/projets')        return createProjet(request, env, uid);
  const mPr = path.match(/^\/api\/projets\/([^/]+)$/);
  if (mPr) {
    if (method === 'GET')    return getProjet(env, uid, mPr[1]);
    if (method === 'PUT')    return updateProjet(request, env, uid, mPr[1]);
    if (method === 'DELETE') return deleteProjet(env, uid, mPr[1]);
  }

  if (method === 'GET' && path === '/api/repartition')    return getRepartition(env, uid);
  if (method === 'PUT' && path === '/api/repartition')    return putRepartition(request, env, uid);

  if (method === 'GET' && path === '/api/tresorerie')     return getTresorerie(env, uid);
  if (method === 'PUT' && path === '/api/tresorerie')     return putTresorerie(request, env, uid);

  if (method === 'GET' && path === '/api/rapport/mensuel') return rapportMensuel(env, uid, url);
  if (method === 'GET' && path === '/api/rapport/annuel')  return rapportAnnuel(env, uid, url);
  if (method === 'GET' && path === '/api/rapport/fiscal')  return rapportFiscal(env, uid, url);

  if (method === 'POST' && path === '/api/import/factures') return importFactures(request, env, uid);
  if (method === 'POST' && path === '/api/import/depenses') return importDepenses(request, env, uid);
  if (method === 'GET'  && path.startsWith('/api/export/')) {
    const res = path.split('/').pop();
    return exportCSV(env, uid, res);
  }

  // Qonto API proxy
  if (method === 'GET'  && path === '/api/qonto/solde')        return qontoSolde(env);
  if (method === 'GET'  && path === '/api/qonto/transactions') return qontoTransactions(env, url);
  if (method === 'POST' && path === '/api/qonto/sync')         return qontoSync(env, uid);

  return jsonErr(404, 'Route inconnue.');
}

/* ── SETTINGS ── */
const SETTINGS_DEFAUT = {
  nom:'Cindy', entreprise:'Seed to Bloom', email:'contact@seedtobloom.fr',
  tauxUrssaf:25.6, tauxCfp:0.2, pasFixe:40, cfeAnnuelle:0, objectifCA:60000,
  pctVersement:65, pctEpargne:15, pctTresorerie:20, delaiPaiement:30,
};
async function settingsGet(env, uid) {
  const s = await kvLire(env, `${uid}:settings`);
  return jsonOk(s && typeof s==='object' && !Array.isArray(s) ? {...SETTINGS_DEFAUT,...s} : SETTINGS_DEFAUT);
}
async function settingsPut(request, env, uid) {
  const body = await parseJSON(request); if(!body) return jsonErr(400,'Body invalide.');
  const existing = await kvLire(env, `${uid}:settings`) || {};
  const updated = {...SETTINGS_DEFAUT,...(Array.isArray(existing)?{}:existing),...body};
  await env.KV_DATA.put(`${uid}:settings`, JSON.stringify(updated));
  return jsonOk(updated);
}

/* ── DASHBOARD ── */
async function dashboard(env, uid) {
  const today=new Date(), annee=today.getFullYear(), mois=today.getMonth()+1;
  const settings = await settingsGet(env, uid).then(r=>r.json());
  const [factures,depenses,abonnements,treso] = await Promise.all([
    kvTableau(env,`${uid}:factures`), kvTableau(env,`${uid}:depenses`),
    kvTableau(env,`${uid}:abonnements`), env.KV_DATA.get(`${uid}:tresorerie`,'json'),
  ]);
  const payees=factures.filter(f=>f.statut==='payee');
  const attentes=factures.filter(f=>['attente','retard'].includes(f.statut));
  const factMois=payees.filter(f=>memeMA(f.datePaiement||f.date,annee,mois));
  const caMois=round(factMois.reduce((s,f)=>s+f.montant,0));
  const depMois=depenses.filter(d=>memeMA(d.date,annee,mois)).reduce((s,d)=>s+d.montant,0);
  const aboMois=abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0);
  const tauxU=(settings.tauxUrssaf||25.6)/100, tauxC=(settings.tauxCfp||0.2)/100;
  const urssafM=round(caMois*tauxU), cfpM=round(caMois*tauxC);
  const chargesTotal=round(urssafM+cfpM+depMois+aboMois+settings.pasFixe);
  const netMois=round(Math.max(0,caMois-chargesTotal));
  const caYTD=round(payees.filter(f=>(f.date||'').startsWith(String(annee))).reduce((s,f)=>s+f.montant,0));
  const objCA=await env.KV_DATA.get(`${uid}:objectif_ca`,'json');
  const montantCible=objCA?.montant||settings.objectifCA||60000;
  const progressionCA=montantCible>0?Math.min(100,Math.round(caYTD/montantCible*100)):0;
  const hist=[];
  for(let i=11;i>=0;i--){
    const d=new Date(today.getFullYear(),today.getMonth()-i,1);
    const y=d.getFullYear(),m=d.getMonth()+1;
    const caM=round(payees.filter(f=>memeMA(f.datePaiement||f.date,y,m)).reduce((s,f)=>s+f.montant,0));
    const dM=round(depenses.filter(f=>memeMA(f.date,y,m)).reduce((s,f)=>s+f.montant,0));
    const aM=round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const chM=round(caM*(tauxU+tauxC)+dM+aM+settings.pasFixe);
    hist.push({annee:y,mois:m,label:d.toLocaleString('fr-FR',{month:'short'}),ca:caM,charges:chM,net:round(Math.max(0,caM-chM))});
  }
  const allTx=await kvTableau(env,`${uid}:transactions`);
  const dernieresTx=allTx.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const prochAbo=prochainsPrelev(abonnements,today);
  return jsonOk({
    kpis:{caMois,chargesTotal,netMois,versementEstime:round(netMois*(settings.pctVersement||65)/100),
      caYTD,progressionCA,montantCible,tresoQonto:treso?.solde||0,
      tresoUpdatedAt:treso?.updatedAt||null,prochaineEcheance:prochainEcheanceURSSAF(today)},
    hist,dernieresTx,prochAbo,
    facturesAttente:attentes.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5),
    caParClient:aggregParClient(payees),
  });
}

/* ── FACTURES ── */
async function listFactures(env,uid){const list=await kvTableau(env,`${uid}:factures`);return jsonOk(list.sort((a,b)=>b.numero.localeCompare(a.numero)));}
async function getFacture(env,uid,id){const list=await kvTableau(env,`${uid}:factures`);const f=list.find(x=>x.id===id);return f?jsonOk(f):jsonErr(404,'Facture introuvable.');}
async function createFacture(request,env,uid){
  const body=await parseJSON(request);if(!validerDoc(body))return jsonErr(400,'Données invalides.');
  const list=await kvTableau(env,`${uid}:factures`);
  const f={id:uid4(),numero:prochNumF(list),client:body.client.trim(),projet:body.projet?.trim()||'',
    description:body.description?.trim()||'',montant:parseFloat(body.montant),
    date:body.date,dateEcheance:body.dateEcheance||null,datePaiement:body.datePaiement||null,
    statut:body.statut||'attente',typeFacture:body.typeFacture||'standard',projetId:body.projetId||null,
    pdfKey:null,createdAt:iso()};
  list.push(f);await kvEcrire(env,`${uid}:factures`,list);return jsonOk(f,201);
}
async function updateFacture(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:factures`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Facture introuvable.');
  ['client','projet','description','montant','date','dateEcheance','datePaiement','statut','typeFacture','projetId'].forEach(c=>{if(body[c]!==undefined)list[idx][c]=c==='montant'?parseFloat(body[c]):body[c];});
  list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:factures`,list);return jsonOk(list[idx]);
}
async function deleteFacture(env,uid,id){
  const list=await kvTableau(env,`${uid}:factures`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Facture introuvable.');
  await kvEcrire(env,`${uid}:factures`,next);return jsonOk({deleted:id});
}
async function uploadPDF(request,env,uid,id){
  const list=await kvTableau(env,`${uid}:factures`);const idx=list.findIndex(x=>x.id===id);
  if(idx<0)return jsonErr(404,'Facture introuvable.');
  const bytes=await request.arrayBuffer();
  const key=`${uid}/factures/pdf/${list[idx].numero}.pdf`;
  await env.R2_FINANCE.put(key,bytes,{httpMetadata:{contentType:'application/pdf'}});
  list[idx].pdfKey=key;list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:factures`,list);
  return jsonOk(list[idx]);
}
async function downloadPDF(env,uid,id){
  const list=await kvTableau(env,`${uid}:factures`);const f=list.find(x=>x.id===id);
  if(!f?.pdfKey)return jsonErr(404,'Aucun PDF attaché.');
  const obj=await env.R2_FINANCE.get(f.pdfKey);if(!obj)return jsonErr(404,'Fichier introuvable dans R2.');
  return new Response(obj.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${f.numero}.pdf"`}});
}

/* ── DÉPENSES ── */
async function listDepenses(env,uid){const list=await kvTableau(env,`${uid}:depenses`);return jsonOk(list.sort((a,b)=>b.date.localeCompare(a.date)));}
async function createDepense(request,env,uid){
  const body=await parseJSON(request);
  if(!body?.date||!body?.montant||!body?.description||!body?.categorie)return jsonErr(400,'Champs requis.');
  const list=await kvTableau(env,`${uid}:depenses`);
  const d={id:uid4(),date:body.date,description:body.description.trim(),categorie:body.categorie,montant:parseFloat(body.montant),createdAt:iso()};
  list.push(d);await kvEcrire(env,`${uid}:depenses`,list);return jsonOk(d,201);
}
async function deleteDepense(env,uid,id){
  const list=await kvTableau(env,`${uid}:depenses`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Dépense introuvable.');
  await kvEcrire(env,`${uid}:depenses`,next);return jsonOk({deleted:id});
}
async function updateDepense(request,env,uid,id){
  const body=await parseJSON(request);if(!body)return jsonErr(400,'Body invalide.');
  const list=await kvTableau(env,`${uid}:depenses`);
  const idx=list.findIndex(x=>x.id===id);
  if(idx<0)return jsonErr(404,'Dépense introuvable.');
  const fields=['date','categorie','description','montant'];
  fields.forEach(f=>{if(body[f]!==undefined)list[idx][f]=f==='montant'?parseFloat(body[f]):body[f];});
  list[idx].updatedAt=iso();
  await kvEcrire(env,`${uid}:depenses`,list);return jsonOk(list[idx]);
}

/* ── DÉPENSES PRÉVUES ── */
async function listDepensesPrevues(env,uid){return jsonOk(await kvTableau(env,`${uid}:depenses_prevues`));}
async function createDepensePrevue(request,env,uid){
  const body=await parseJSON(request);
  if(!body?.description||!body?.montant)return jsonErr(400,'Description et montant requis.');
  const list=await kvTableau(env,`${uid}:depenses_prevues`);
  const d={id:uid4(),type:body.type||'ponctuel',description:body.description.trim(),
    categorie:body.categorie||'Autre',montant:parseFloat(body.montant),
    dateDebut:body.dateDebut||null,dateFin:body.dateFin||null,
    statut:body.statut||'active',createdAt:iso()};
  list.push(d);await kvEcrire(env,`${uid}:depenses_prevues`,list);return jsonOk(d,201);
}
async function updateDepensePrevue(request,env,uid,id){
  const body=await parseJSON(request);if(!body)return jsonErr(400,'Body invalide.');
  const list=await kvTableau(env,`${uid}:depenses_prevues`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Introuvable.');
  ['type','description','categorie','montant','dateDebut','dateFin','statut'].forEach(f=>{
    if(body[f]!==undefined)list[idx][f]=f==='montant'?parseFloat(body[f]):body[f];
  });
  list[idx].updatedAt=iso();
  await kvEcrire(env,`${uid}:depenses_prevues`,list);return jsonOk(list[idx]);
}
async function deleteDepensePrevue(env,uid,id){
  const list=await kvTableau(env,`${uid}:depenses_prevues`);
  const next=list.filter(x=>x.id!==id);if(next.length===list.length)return jsonErr(404,'Introuvable.');
  await kvEcrire(env,`${uid}:depenses_prevues`,next);return jsonOk({deleted:id});
}

/* ── ABONNEMENTS ── */
async function listAbo(env,uid){return jsonOk(await kvTableau(env,`${uid}:abonnements`));}
async function createAbo(request,env,uid){
  const body=await parseJSON(request);if(!body?.nom||!body?.montantMensuel)return jsonErr(400,'Champs requis.');
  const list=await kvTableau(env,`${uid}:abonnements`);
  const a={id:uid4(),nom:body.nom.trim(),categorie:body.categorie||'Logiciels & abonnements',
    montantMensuel:parseFloat(body.montantMensuel),jourPrelevement:parseInt(body.jourPrelevement)||1,
    statut:body.statut||'actif',createdAt:iso()};
  list.push(a);await kvEcrire(env,`${uid}:abonnements`,list);return jsonOk(a,201);
}
async function updateAbo(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:abonnements`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Abonnement introuvable.');
  ['nom','categorie','montantMensuel','jourPrelevement','statut'].forEach(c=>{
    if(body[c]!==undefined)list[idx][c]=['montantMensuel','jourPrelevement'].includes(c)?parseFloat(body[c]):body[c];
  });
  await kvEcrire(env,`${uid}:abonnements`,list);return jsonOk(list[idx]);
}
async function deleteAbo(env,uid,id){
  const list=await kvTableau(env,`${uid}:abonnements`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Abonnement introuvable.');
  await kvEcrire(env,`${uid}:abonnements`,next);return jsonOk({deleted:id});
}

/* ── COMPTES ── */
async function listComptes(env,uid){
  return jsonOk(await kvTableau(env,`${uid}:comptes`));
}
async function createCompte(request,env,uid){
  const body=await parseJSON(request);if(!body?.nom)return jsonErr(400,'Nom requis.');
  const list=await kvTableau(env,`${uid}:comptes`);
  const c={id:uid4(),nom:body.nom,type:body.type||'autre',solde:parseFloat(body.solde)||0,updatedAt:iso(),historique:[]};
  list.push(c);await kvEcrire(env,`${uid}:comptes`,list);return jsonOk(c,201);
}
async function updateCompte(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:comptes`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Compte introuvable.');
  if(body.solde!==undefined)list[idx].solde=parseFloat(body.solde);
  if(body.nom)list[idx].nom=body.nom;if(body.type)list[idx].type=body.type;
  list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:comptes`,list);return jsonOk(list[idx]);
}
async function deleteCompte(env,uid,id){
  const list=await kvTableau(env,`${uid}:comptes`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Compte introuvable.');
  await kvEcrire(env,`${uid}:comptes`,next);return jsonOk({deleted:id});
}
async function addHistoriqueCompte(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:comptes`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Compte introuvable.');
  list[idx].historique=list[idx].historique||[];
  list[idx].historique.unshift({date:body.date||iso().split('T')[0],montant:parseFloat(body.montant)||0,libelle:body.libelle||''});
  list[idx].historique=list[idx].historique.slice(0,20);
  await kvEcrire(env,`${uid}:comptes`,list);return jsonOk(list[idx]);
}

/* ── TRANSACTIONS ── */
async function listTransactions(env,uid,url){
  const list=await kvTableau(env,`${uid}:transactions`);
  let result=list.sort((a,b)=>b.date.localeCompare(a.date));
  const compte=url.searchParams.get('compte'),mois=url.searchParams.get('mois'),annee=url.searchParams.get('annee');
  const categorie=url.searchParams.get('categorie'),q=url.searchParams.get('q');
  const page=parseInt(url.searchParams.get('page'))||1,limit=20;
  if(compte)result=result.filter(t=>t.compte===compte);
  if(annee&&mois)result=result.filter(t=>memeMA(t.date,parseInt(annee),parseInt(mois)));
  else if(annee)result=result.filter(t=>t.date?.startsWith(annee));
  if(categorie)result=result.filter(t=>t.categorie===categorie);
  if(q)result=result.filter(t=>t.libelle?.toLowerCase().includes(q.toLowerCase()));
  const total=result.length;
  result=result.slice((page-1)*limit,page*limit);
  return jsonOk({transactions:result,total,page,pages:Math.ceil(total/limit)});
}
async function createTransaction(request,env,uid){
  const body=await parseJSON(request);if(!body?.date||!body?.montant||!body?.libelle)return jsonErr(400,'Champs requis.');
  const list=await kvTableau(env,`${uid}:transactions`);
  const t={id:uid4(),date:body.date,libelle:body.libelle,montant:parseFloat(body.montant),
    type:body.type||'sortie',compte:body.compte||'',categorie:body.categorie||'',createdAt:iso()};
  list.push(t);await kvEcrire(env,`${uid}:transactions`,list);return jsonOk(t,201);
}
async function deleteTransaction(env,uid,id){
  const list=await kvTableau(env,`${uid}:transactions`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Transaction introuvable.');
  await kvEcrire(env,`${uid}:transactions`,next);return jsonOk({deleted:id});
}

/* ── URSSAF ── */
async function listURSSAF(env,uid){
  const factures=await kvTableau(env,`${uid}:factures`);
  const settings=await settingsGet(env,uid).then(r=>r.json());
  const stored=(await env.KV_DATA.get(`${uid}:urssaf`,'json'))||{};
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const result={};
  for(const [cle,meta] of Object.entries(ECHEANCES_URSSAF)){
    const caT=round(factures.filter(f=>f.statut==='payee'&&meta.mois.includes(parseInt(((f.datePaiement||f.date)||'').split('-')[1]))).reduce((s,f)=>s+f.montant,0));
    const urssafDue=round(caT*tauxU),cfpDue=round(caT*tauxC);
    const data=stored[cle]||{};
    result[cle]={...meta,cle,ca:caT,urssaf:urssafDue,cfp:cfpDue,total:round(urssafDue+cfpDue),montantPaye:data.montantPaye||0,statut:data.statut||'a_venir'};
  }
  return jsonOk(result);
}
async function getURSSAF(env,uid,cle){const all=await listURSSAF(env,uid).then(r=>r.json());return all[cle]?jsonOk(all[cle]):jsonErr(404,'Trimestre inconnu.');}
async function updateURSSAF(request,env,uid,cle){
  const body=await parseJSON(request);const stored=(await env.KV_DATA.get(`${uid}:urssaf`,'json'))||{};
  stored[cle]={...stored[cle],...body};await env.KV_DATA.put(`${uid}:urssaf`,JSON.stringify(stored));
  return getURSSAF(env,uid,cle);
}

/* ── OBJECTIFS CA ── */
async function getObjectifCA(env,uid){const data=await env.KV_DATA.get(`${uid}:objectif_ca`,'json');return jsonOk(data||{annee:new Date().getFullYear(),montant:60000});}
async function putObjectifCA(request,env,uid){const body=await parseJSON(request);await env.KV_DATA.put(`${uid}:objectif_ca`,JSON.stringify(body));return jsonOk(body);}

/* ── OBJECTIFS ÉPARGNE ── */
async function listObjectifsEpargne(env,uid){
  return jsonOk(await kvTableau(env,`${uid}:objectifs_epargne`));
}
async function createObjectifEpargne(request,env,uid){
  const body=await parseJSON(request);if(!body?.nom||!body?.montantCible)return jsonErr(400,'Champs requis.');
  const list=await kvTableau(env,`${uid}:objectifs_epargne`);
  const o={id:uid4(),nom:body.nom,montantCible:parseFloat(body.montantCible),montantActuel:parseFloat(body.montantActuel)||0,dateCible:body.dateCible||null};
  list.push(o);await kvEcrire(env,`${uid}:objectifs_epargne`,list);return jsonOk(o,201);
}
async function updateObjectifEpargne(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:objectifs_epargne`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Objectif introuvable.');
  ['nom','montantCible','montantActuel','dateCible'].forEach(c=>{if(body[c]!==undefined)list[idx][c]=body[c];});
  await kvEcrire(env,`${uid}:objectifs_epargne`,list);return jsonOk(list[idx]);
}
async function deleteObjectifEpargne(env,uid,id){
  const list=await kvTableau(env,`${uid}:objectifs_epargne`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Objectif introuvable.');
  await kvEcrire(env,`${uid}:objectifs_epargne`,next);return jsonOk({deleted:id});
}

/* ── TIERS (clients, fournisseurs, prestataires) ── */
async function listTiers(env,uid){return jsonOk(await kvTableau(env,`${uid}:tiers`));}
async function createTiers(request,env,uid){
  const body=await parseJSON(request);if(!body?.nom?.trim())return jsonErr(400,'Nom requis.');
  const list=await kvTableau(env,`${uid}:tiers`);
  const t={id:uid4(),nom:body.nom.trim(),type:body.type||'client',email:body.email||'',siret:body.siret||'',adresse:body.adresse||'',notes:body.notes||'',createdAt:iso()};
  list.push(t);await kvEcrire(env,`${uid}:tiers`,list);return jsonOk(t,201);
}
async function updateTiers(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:tiers`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Tiers introuvable.');
  ['nom','type','email','siret','adresse','notes'].forEach(c=>{if(body[c]!==undefined)list[idx][c]=body[c];});
  list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:tiers`,list);return jsonOk(list[idx]);
}
async function deleteTiers(env,uid,id){
  const list=await kvTableau(env,`${uid}:tiers`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Tiers introuvable.');
  await kvEcrire(env,`${uid}:tiers`,next);return jsonOk({deleted:id});
}

/* ── DEVIS ── */
async function listDevis(env,uid){const list=await kvTableau(env,`${uid}:devis`);return jsonOk(list.sort((a,b)=>b.numero.localeCompare(a.numero)));}
async function getDevis(env,uid,id){const list=await kvTableau(env,`${uid}:devis`);const d=list.find(x=>x.id===id);return d?jsonOk(d):jsonErr(404,'Devis introuvable.');}
async function createDevis(request,env,uid){
  const body=await parseJSON(request);
  if(!body?.client?.trim())return jsonErr(400,'Client requis.');
  if(isNaN(parseFloat(body?.montant))||parseFloat(body?.montant)<=0)return jsonErr(400,'Montant invalide.');
  if(!body?.date)return jsonErr(400,'Date requise.');
  const list=await kvTableau(env,`${uid}:devis`);
  const nums=list.map(d=>parseInt((d.numero||'').split('-')[1])||0).filter(n=>!isNaN(n));
  const numero=body.numero?.trim()||`D${new Date().getFullYear()}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,'0')}`;
  const d={id:uid4(),numero,client:body.client.trim(),description:body.description?.trim()||'',
    montant:parseFloat(body.montant),date:body.date,dateExpiration:body.dateExpiration||null,
    statut:body.statut||'brouillon',notes:body.notes||'',pdfKey:null,createdAt:iso()};
  list.push(d);await kvEcrire(env,`${uid}:devis`,list);return jsonOk(d,201);
}
async function updateDevis(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:devis`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Devis introuvable.');
  ['numero','client','description','montant','date','dateExpiration','statut','notes'].forEach(c=>{
    if(body[c]!==undefined)list[idx][c]=c==='montant'?parseFloat(body[c]):body[c];
  });
  list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:devis`,list);return jsonOk(list[idx]);
}
async function deleteDevis(env,uid,id){
  const list=await kvTableau(env,`${uid}:devis`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Devis introuvable.');
  await kvEcrire(env,`${uid}:devis`,next);return jsonOk({deleted:id});
}
async function uploadDevisPDF(request,env,uid,id){
  const list=await kvTableau(env,`${uid}:devis`);const idx=list.findIndex(x=>x.id===id);
  if(idx<0)return jsonErr(404,'Devis introuvable.');
  const bytes=await request.arrayBuffer();
  const key=`${uid}/devis/pdf/${list[idx].numero}.pdf`;
  await env.R2_FINANCE.put(key,bytes,{httpMetadata:{contentType:'application/pdf'}});
  list[idx].pdfKey=key;list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:devis`,list);
  return jsonOk(list[idx]);
}
async function downloadDevisPDF(env,uid,id){
  const list=await kvTableau(env,`${uid}:devis`);const d=list.find(x=>x.id===id);
  if(!d?.pdfKey)return jsonErr(404,'Aucun PDF attaché.');
  const obj=await env.R2_FINANCE.get(d.pdfKey);if(!obj)return jsonErr(404,'Fichier introuvable dans R2.');
  return new Response(obj.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${d.numero}.pdf"`}});
}

/* ── PROJETS ── */
async function listProjets(env,uid){return jsonOk(await kvTableau(env,`${uid}:projets`));}
async function getProjet(env,uid,id){const list=await kvTableau(env,`${uid}:projets`);const p=list.find(x=>x.id===id);return p?jsonOk(p):jsonErr(404,'Projet introuvable.');}
async function createProjet(request,env,uid){
  const body=await parseJSON(request);if(!body?.nom?.trim())return jsonErr(400,'Nom requis.');
  if(!body?.montantTotal||isNaN(parseFloat(body.montantTotal)))return jsonErr(400,'Montant requis.');
  const list=await kvTableau(env,`${uid}:projets`);
  const p={id:uid4(),nom:body.nom.trim(),client:body.client||'',type:body.type||'unique',
    montantTotal:parseFloat(body.montantTotal),
    nombreMois:body.type==='mensuel'?parseInt(body.nombreMois)||1:null,
    devisId:body.devisId||null,
    dateDebut:body.dateDebut||null,dateFin:body.dateFin||null,
    statut:body.statut||'en_cours',notes:body.notes||'',createdAt:iso()};
  list.push(p);await kvEcrire(env,`${uid}:projets`,list);return jsonOk(p,201);
}
async function updateProjet(request,env,uid,id){
  const body=await parseJSON(request);const list=await kvTableau(env,`${uid}:projets`);
  const idx=list.findIndex(x=>x.id===id);if(idx<0)return jsonErr(404,'Projet introuvable.');
  ['nom','client','type','montantTotal','nombreMois','devisId','dateDebut','dateFin','statut','notes'].forEach(c=>{
    if(body[c]!==undefined)list[idx][c]=['montantTotal','nombreMois'].includes(c)?parseFloat(body[c]):body[c];
  });
  list[idx].updatedAt=iso();await kvEcrire(env,`${uid}:projets`,list);return jsonOk(list[idx]);
}
async function deleteProjet(env,uid,id){
  const list=await kvTableau(env,`${uid}:projets`);const next=list.filter(x=>x.id!==id);
  if(next.length===list.length)return jsonErr(404,'Projet introuvable.');
  await kvEcrire(env,`${uid}:projets`,next);return jsonOk({deleted:id});
}

/* ── RÉPARTITION ── */
async function getRepartition(env,uid){const data=await env.KV_DATA.get(`${uid}:repartition`,'json');return jsonOk(data||{versement:0,epargne:0,tresorerie:0,updatedAt:null});}
async function putRepartition(request,env,uid){const body=await parseJSON(request);const data={...body,updatedAt:iso()};await env.KV_DATA.put(`${uid}:repartition`,JSON.stringify(data));return jsonOk(data);}

/* ── TRÉSORERIE ── */
async function getTresorerie(env,uid){const data=await env.KV_DATA.get(`${uid}:tresorerie`,'json');return jsonOk(data||{solde:0,updatedAt:null});}
async function putTresorerie(request,env,uid){const body=await parseJSON(request);const data={solde:parseFloat(body.solde)||0,updatedAt:iso()};await env.KV_DATA.put(`${uid}:tresorerie`,JSON.stringify(data));return jsonOk(data);}

/* ── RAPPORTS ── */
async function rapportMensuel(env,uid,url){
  const annee=parseInt(url.searchParams.get('annee'))||new Date().getFullYear();
  const mois=parseInt(url.searchParams.get('mois'))||new Date().getMonth()+1;
  const moisPrec=mois===1?12:mois-1,anneePrec=mois===1?annee-1:annee;
  const settings=await settingsGet(env,uid).then(r=>r.json());
  const [factures,depenses,abonnements,repartition]=await Promise.all([
    kvTableau(env,`${uid}:factures`),kvTableau(env,`${uid}:depenses`),
    kvTableau(env,`${uid}:abonnements`),env.KV_DATA.get(`${uid}:repartition`,'json'),
  ]);
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const calcMois=(y,m)=>{
    const payees=factures.filter(f=>f.statut==='payee'&&memeMA(f.datePaiement||f.date,y,m));
    const ca=round(payees.reduce((s,f)=>s+f.montant,0));
    const dep=round(depenses.filter(d=>memeMA(d.date,y,m)).reduce((s,d)=>s+d.montant,0));
    const abo=round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const urssaf=round(ca*tauxU),cfp=round(ca*tauxC);
    const charges=round(urssaf+cfp+dep+abo+settings.pasFixe);
    return{ca,dep,abo,urssaf,cfp,charges,net:round(Math.max(0,ca-charges))};
  };
  const actuel=calcMois(annee,mois),prec=calcMois(anneePrec,moisPrec);
  const delta=prec.ca>0?Math.round((actuel.ca-prec.ca)/prec.ca*100):null;
  const pctV=settings.pctVersement||65;
  return jsonOk({annee,mois,...actuel,versement:round(actuel.net*pctV/100),pctVersement:pctV,comparaisonPrecedent:{...prec,delta},repartitionReelle:repartition});
}
async function rapportAnnuel(env,uid,url){
  const annee=parseInt(url.searchParams.get('annee'))||new Date().getFullYear();
  const settings=await settingsGet(env,uid).then(r=>r.json());
  const [factures,depenses,abonnements]=await Promise.all([kvTableau(env,`${uid}:factures`),kvTableau(env,`${uid}:depenses`),kvTableau(env,`${uid}:abonnements`)]);
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const moisData=[];let totCA=0,totCharges=0,totNet=0;
  for(let m=1;m<=12;m++){
    const payees=factures.filter(f=>f.statut==='payee'&&memeMA(f.datePaiement||f.date,annee,m));
    const ca=round(payees.reduce((s,f)=>s+f.montant,0));
    const dep=round(depenses.filter(d=>memeMA(d.date,annee,m)).reduce((s,d)=>s+d.montant,0));
    const abo=round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const charges=round(ca*tauxU+ca*tauxC+dep+abo+settings.pasFixe);
    const net=round(Math.max(0,ca-charges));
    moisData.push({mois:m,ca,charges,net,versement:round(net*(settings.pctVersement||65)/100)});
    totCA+=ca;totCharges+=charges;totNet+=net;
  }
  const meilleur=moisData.reduce((a,b)=>b.ca>a.ca?b:a);
  return jsonOk({annee,mois:moisData,totaux:{ca:round(totCA),charges:round(totCharges),net:round(totNet)},meilleur});
}
async function rapportFiscal(env,uid,url){
  const annee=parseInt(url.searchParams.get('annee'))||new Date().getFullYear();
  const settings=await settingsGet(env,uid).then(r=>r.json());
  const factures=await kvTableau(env,`${uid}:factures`);
  const depenses=await kvTableau(env,`${uid}:depenses`);
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const caAnnuel=round(factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(String(annee))).reduce((s,f)=>s+f.montant,0));
  const depAnnuel=round(depenses.filter(d=>d.date?.startsWith(String(annee))).reduce((s,d)=>s+d.montant,0));
  const abattement=round(caAnnuel*0.34),revenuImposable=round(caAnnuel-abattement);
  const cotisations=round(caAnnuel*(tauxU+tauxC));
  const pctPlafond=caAnnuel>0?Math.min(100,Math.round(caAnnuel/PLAFOND_BNC*100)):0;
  const impotEstime=estimerImpot(revenuImposable);
  return jsonOk({annee,caAnnuel,abattement,revenuImposable,cotisations,depAnnuel,impotEstime,plafondBNC:PLAFOND_BNC,pctPlafond,alertePlafond:pctPlafond>=80});
}

/* ── IMPORT / EXPORT ── */
async function importFactures(request,env,uid){
  const body=await parseJSON(request);if(!Array.isArray(body?.lignes))return jsonErr(400,'Format invalide.');
  const list=await kvTableau(env,`${uid}:factures`);const nums=new Set(list.map(f=>f.numero));
  let importees=0,doublons=0;
  for(const ligne of body.lignes){
    if(!validerDoc(ligne))continue;
    if(nums.has(ligne.numero)){doublons++;continue;}
    const f={id:uid4(),numero:ligne.numero,client:ligne.client?.trim(),description:ligne.description?.trim()||'',
      montant:parseFloat(ligne.montant),date:ligne.date,statut:ligne.statut||'attente',pdfKey:null,createdAt:iso()};
    list.push(f);nums.add(f.numero);importees++;
  }
  await kvEcrire(env,`${uid}:factures`,list);return jsonOk({importees,doublons});
}
async function importDepenses(request,env,uid){
  const body=await parseJSON(request);if(!Array.isArray(body?.lignes))return jsonErr(400,'Format invalide.');
  const list=await kvTableau(env,`${uid}:depenses`);let importees=0;
  for(const ligne of body.lignes){
    if(!ligne.date||!ligne.montant||!ligne.description)continue;
    list.push({id:uid4(),date:ligne.date,description:ligne.description?.trim(),categorie:ligne.categorie||'Autre',montant:parseFloat(ligne.montant),createdAt:iso()});
    importees++;
  }
  await kvEcrire(env,`${uid}:depenses`,list);return jsonOk({importees});
}
async function exportCSV(env,uid,ressource){
  const ressources={factures:`${uid}:factures`,depenses:`${uid}:depenses`,transactions:`${uid}:transactions`};
  const cle=ressources[ressource];if(!cle)return jsonErr(400,'Ressource inconnue.');
  const list=await kvTableau(env,cle);
  const csv=listToCSV(list);
  return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="${ressource}.csv"`}});
}

/* ── HELPERS ── */
function aggregParClient(payees){
  const map={};payees.forEach(f=>{map[f.client]=round((map[f.client]||0)+f.montant);});
  return Object.entries(map).map(([client,ca])=>({client,ca})).sort((a,b)=>b.ca-a.ca);
}
function prochainEcheanceURSSAF(today){
  for(const [cle,meta] of Object.entries(ECHEANCES_URSSAF)){
    const e=new Date(meta.echeance);
    if(e>=today){const jours=Math.ceil((e-today)/86400000);return{cle,label:meta.label,echeance:meta.echeance,joursRestants:jours};}
  }
  return null;
}
function prochainsPrelev(abonnements,today){
  const actifs=abonnements.filter(a=>a.statut==='actif');
  const mois=today.getMonth()+1,annee=today.getFullYear();
  return actifs.map(a=>{
    let dateP=new Date(annee,mois-1,a.jourPrelevement);
    if(dateP<today)dateP=new Date(annee,mois,a.jourPrelevement);
    return{...a,prochainPrelevement:dateP.toISOString().split('T')[0],joursAvant:Math.ceil((dateP-today)/86400000)};
  }).sort((a,b)=>a.joursAvant-b.joursAvant).slice(0,3);
}
function estimerImpot(revenuImposable){
  const tranches=[[11497,0],[29315,0.11],[83823,0.30],[180294,0.41],[Infinity,0.45]];
  let impot=0,prev=0;
  for(const [limite,taux] of tranches){if(revenuImposable<=prev)break;impot+=(Math.min(revenuImposable,limite)-prev)*taux;prev=limite;}
  return round(Math.max(0,impot));
}
function prochNumF(list){
  const nums=list.map(f=>parseInt((f.numero||'').split('-')[1])||0).filter(n=>!isNaN(n));
  return `F${new Date().getFullYear()}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,'0')}`;
}
function validerDoc(b){
  if(!b?.client?.trim())return false;
  if(isNaN(parseFloat(b?.montant))||parseFloat(b?.montant)<=0)return false;
  if(!b?.date||!/^\d{4}-\d{2}-\d{2}$/.test(b.date))return false;
  return true;
}
function memeMA(dateStr,annee,mois){if(!dateStr)return false;const[y,m]=dateStr.split('-').map(Number);return y===annee&&m===mois;}
function listToCSV(list){
  if(!list.length)return '';
  const keys=Object.keys(list[0]).filter(k=>k!=='historique');
  return[keys.join(','),...list.map(r=>keys.map(k=>JSON.stringify(r[k]??'')).join(','))].join('\n');
}

/* ── KV HELPERS ── */
async function kvLire(env,cle){return env.KV_DATA.get(cle,'json');}
async function kvTableau(env,cle){const v=await env.KV_DATA.get(cle,'json');return Array.isArray(v)?v:[];}
async function kvEcrire(env,cle,data){await env.KV_DATA.put(cle,JSON.stringify(data));}

/* ── UTILS ── */
const round=v=>Math.round(v*100)/100;
const iso=()=>new Date().toISOString();
const uid4=()=>crypto.randomUUID().replace(/-/g,'').slice(0,16);
async function parseJSON(req){try{return await req.json();}catch{return null;}}
function jsonOk(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
function jsonErr(status,message){return new Response(JSON.stringify({error:message}),{status,headers:{'Content-Type':'application/json'}});}

/* ── QONTO API ─────────────────────────────────────────────────────────── */

const QONTO_BASE = 'https://thirdparty.qonto.com/v2';

function qontoHeaders(env) {
  const login  = env.QONTO_LOGIN;
  const secret = env.QONTO_SECRET_KEY;
  if (!login || !secret) return null;
  return {
    'Authorization': `${login}:${secret}`,
    'Content-Type': 'application/json',
  };
}

async function qontoSolde(env) {
  const headers = qontoHeaders(env);
  if (!headers) return jsonErr(503, 'Clé API Qonto non configurée (QONTO_LOGIN / QONTO_SECRET_KEY)');

  const res = await fetch(`${QONTO_BASE}/organization`, { headers });
  if (!res.ok) return jsonErr(res.status, `Erreur Qonto : ${res.statusText}`);
  const data = await res.json();

  const comptes = (data.organization?.bank_accounts || []).map(a => ({
    id:       a.slug,
    nom:      a.name,
    iban:     a.iban,
    solde:    a.balance / 100,         // Qonto renvoie en centimes
    devise:   a.currency,
    statut:   a.status,
  }));

  return jsonOk({ comptes });
}

async function qontoTransactions(env, url) {
  const headers = qontoHeaders(env);
  if (!headers) return jsonErr(503, 'Clé API Qonto non configurée (QONTO_LOGIN / QONTO_SECRET_KEY)');

  // Paramètres optionnels : ?from=2026-01-01&page=1&per_page=50
  const from      = url.searchParams.get('from') || '2026-01-01';
  const page      = url.searchParams.get('page') || '1';
  const per_page  = url.searchParams.get('per_page') || '100';
  const ibanParam = url.searchParams.get('iban') || '';

  // Récupère d'abord le slug du compte principal si iban non fourni
  let slug = url.searchParams.get('slug') || '';
  if (!slug) {
    const orgRes = await fetch(`${QONTO_BASE}/organization`, { headers });
    if (!orgRes.ok) return jsonErr(orgRes.status, `Erreur Qonto org : ${orgRes.statusText}`);
    const orgData = await orgRes.json();
    const accounts = orgData.organization?.bank_accounts || [];
    const main = ibanParam
      ? accounts.find(a => a.iban === ibanParam)
      : accounts.find(a => a.status === 'activated') || accounts[0];
    if (!main) return jsonErr(404, 'Aucun compte Qonto trouvé');
    slug = main.slug;
  }

  const params = new URLSearchParams({
    slug,
    settled_at_from: `${from}T00:00:00.000Z`,
    current_page: page,
    per_page,
    sort_by: 'settled_at:desc',
  });

  const txRes = await fetch(`${QONTO_BASE}/transactions?${params}`, { headers });
  if (!txRes.ok) return jsonErr(txRes.status, `Erreur Qonto tx : ${txRes.statusText}`);
  const txData = await txRes.json();

  const transactions = (txData.transactions || []).map(t => ({
    id:        t.transaction_id,
    libelle:   t.label,
    montant:   Math.abs(t.amount) / 100,
    type:      t.side === 'credit' ? 'credit' : 'debit',
    date:      (t.settled_at || t.emitted_at || '').slice(0, 10),
    categorie: t.category || '',
    note:      t.note || '',
    statut:    t.status,
    devise:    t.currency,
  }));

  return jsonOk({
    transactions,
    meta: txData.meta || {},
  });
}

// Sync : importe les transactions Qonto dans KV_DATA comme transactions locales
async function qontoSync(env, uid) {
  const headers = qontoHeaders(env);
  if (!headers) return jsonErr(503, 'Clé API Qonto non configurée (QONTO_LOGIN / QONTO_SECRET_KEY)');

  // Compte principal
  const orgRes = await fetch(`${QONTO_BASE}/organization`, { headers });
  if (!orgRes.ok) return jsonErr(orgRes.status, `Erreur Qonto : ${orgRes.statusText}`);
  const orgData = await orgRes.json();
  const accounts = orgData.organization?.bank_accounts || [];
  const main = accounts.find(a => a.status === 'activated') || accounts[0];
  if (!main) return jsonErr(404, 'Aucun compte Qonto actif');

  // Toutes les transactions depuis 2026-01-01 (jusqu'à 100)
  const params = new URLSearchParams({
    slug: main.slug,
    settled_at_from: '2026-01-01T00:00:00.000Z',
    per_page: '100',
    sort_by: 'settled_at:desc',
  });
  const txRes = await fetch(`${QONTO_BASE}/transactions?${params}`, { headers });
  if (!txRes.ok) return jsonErr(txRes.status, `Erreur Qonto tx : ${txRes.statusText}`);
  const txData = await txRes.json();

  // Charge les transactions existantes pour ne pas dupliquer
  const cle = `user:${uid}:transactions`;
  const existantes = await kvTableau(env, cle);
  const existanteIds = new Set(existantes.map(t => t.qontoId).filter(Boolean));

  let ajoutees = 0;
  for (const t of (txData.transactions || [])) {
    if (existanteIds.has(t.transaction_id)) continue;
    existantes.push({
      id:       uid4(),
      qontoId:  t.transaction_id,
      libelle:  t.label,
      montant:  Math.abs(t.amount) / 100,
      type:     t.side === 'credit' ? 'credit' : 'debit',
      date:     (t.settled_at || t.emitted_at || '').slice(0, 10),
      categorie: t.category || '',
      note:     t.note || '',
      source:   'qonto',
    });
    ajoutees++;
  }

  // Met aussi à jour le solde du compte Qonto dans comptes
  const cleComptes = `user:${uid}:comptes`;
  const comptes = await kvTableau(env, cleComptes);
  const qIdx = comptes.findIndex(c => c.type === 'professionnel' || c.type === 'courant');
  if (qIdx >= 0) {
    comptes[qIdx].solde = main.balance / 100;
    comptes[qIdx].qontoIban = main.iban;
    await kvEcrire(env, cleComptes, comptes);
  }

  await kvEcrire(env, cle, existantes);

  return jsonOk({
    message: `Sync Qonto OK — ${ajoutees} nouvelle(s) transaction(s) importée(s)`,
    solde: main.balance / 100,
    totalTransactions: txData.transactions?.length || 0,
    ajoutees,
  });
}
