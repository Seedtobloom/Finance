/**
 * stb-finance — back/worker.js
 * API REST complète · Cloudflare Workers + KV + R2
 *
 * Routes :
 *   POST /api/auth/login|logout|change-password
 *   GET|PUT /api/settings
 *   GET /api/dashboard
 *   GET|POST /api/factures
 *   GET|PUT|DELETE /api/factures/:id
 *   POST /api/factures/:id/pdf          → upload PDF dans R2
 *   GET  /api/factures/:id/pdf          → télécharge PDF depuis R2
 *   GET|POST /api/depenses
 *   DELETE /api/depenses/:id
 *   GET|POST|PUT|DELETE /api/abonnements
 *   GET|POST|PUT /api/comptes
 *   POST /api/comptes/:id/historique
 *   GET|POST|DELETE /api/transactions
 *   GET|PUT /api/urssaf/:cle            → ex: T1-2026
 *   GET|PUT /api/objectifs/ca
 *   GET|POST|PUT|DELETE /api/objectifs/epargne/:id
 *   GET|PUT /api/repartition
 *   GET /api/rapport/mensuel?annee=&mois=
 *   GET /api/rapport/annuel?annee=
 *   GET /api/rapport/fiscal?annee=
 *   POST /api/import/factures           → import CSV
 *   POST /api/import/depenses
 *   GET /api/export/:ressource          → export CSV
 */

/* ===========================
   CONSTANTES MÉTIER
   =========================== */
const URSSAF_TAUX = 0.256;
const CFP_TAUX    = 0.002;
const PAS_FIXE    = 40;
const USER_ID     = 'cindy';
const PLAFOND_BNC = 77700;

/* Échéances URSSAF trimestrielles 2026 */
const ECHEANCES_URSSAF = {
  'T1-2026': { label: 'T1 (jan–mar)', echeance: '2026-04-30', mois: [1,2,3] },
  'T2-2026': { label: 'T2 (avr–jun)', echeance: '2026-07-31', mois: [4,5,6] },
  'T3-2026': { label: 'T3 (jul–sep)', echeance: '2026-10-31', mois: [7,8,9] },
  'T4-2026': { label: 'T4 (oct–déc)', echeance: '2027-01-31', mois: [10,11,12] },
};

/* ===========================
   POINT D'ENTRÉE
   =========================== */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env);
    try {
      return cors(await router(request, env), env);
    } catch (e) {
      return cors(jsonErr(500, 'Erreur interne.'), env);
    }
  }
};

/* ===========================
   ROUTEUR
   =========================== */
async function router(request, env) {
  const url    = new URL(request.url);
  const path   = url.pathname.replace(/\/$/, '');
  const method = request.method;

  // Routes publiques
  if (method === 'POST' && path === '/api/auth/login')  return authLogin(request, env);

  // Vérification JWT
  const auth = await verifierJWT(request, env);
  if (!auth.ok) return jsonErr(401, auth.message);
  const uid = auth.userId;

  // Auth
  if (method === 'POST' && path === '/api/auth/logout')           return authLogout(request, env, auth.jti);
  if (method === 'POST' && path === '/api/auth/change-password')  return authChangePwd(request, env, uid);

  // Settings
  if (method === 'GET' && path === '/api/settings') return settingsGet(env, uid);
  if (method === 'PUT' && path === '/api/settings') return settingsPut(request, env, uid);

  // Dashboard
  if (method === 'GET' && path === '/api/dashboard') return dashboard(env, uid);

  // Factures
  if (method === 'GET'  && path === '/api/factures') return listFactures(env, uid);
  if (method === 'POST' && path === '/api/factures') return createFacture(request, env, uid);
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
  const mFConvert = path.match(/^\/api\/factures\/([^/]+)\/convert$/);
  if (mFConvert && method === 'POST') return convertDevis(env, uid, mFConvert[1]);

  // Dépenses
  if (method === 'GET'  && path === '/api/depenses') return listDepenses(env, uid);
  if (method === 'POST' && path === '/api/depenses') return createDepense(request, env, uid);
  const mD = path.match(/^\/api\/depenses\/([^/]+)$/);
  if (mD && method === 'DELETE') return deleteDepense(env, uid, mD[1]);

  // Abonnements
  if (method === 'GET'  && path === '/api/abonnements') return listAbo(env, uid);
  if (method === 'POST' && path === '/api/abonnements') return createAbo(request, env, uid);
  const mA = path.match(/^\/api\/abonnements\/([^/]+)$/);
  if (mA) {
    if (method === 'PUT')    return updateAbo(request, env, uid, mA[1]);
    if (method === 'DELETE') return deleteAbo(env, uid, mA[1]);
  }

  // Comptes
  if (method === 'GET'  && path === '/api/comptes') return listComptes(env, uid);
  if (method === 'POST' && path === '/api/comptes') return createCompte(request, env, uid);
  const mC = path.match(/^\/api\/comptes\/([^/]+)$/);
  if (mC && method === 'PUT')    return updateCompte(request, env, uid, mC[1]);
  if (mC && method === 'DELETE') return deleteCompte(env, uid, mC[1]);
  const mCH = path.match(/^\/api\/comptes\/([^/]+)\/historique$/);
  if (mCH && method === 'POST') return addHistoriqueCompte(request, env, uid, mCH[1]);

  // Transactions
  if (method === 'GET'  && path === '/api/transactions') return listTransactions(env, uid, url);
  if (method === 'POST' && path === '/api/transactions') return createTransaction(request, env, uid);
  const mT = path.match(/^\/api\/transactions\/([^/]+)$/);
  if (mT && method === 'DELETE') return deleteTransaction(env, uid, mT[1]);

  // URSSAF
  if (method === 'GET' && path === '/api/urssaf') return listURSSAF(env, uid);
  const mU = path.match(/^\/api\/urssaf\/([^/]+)$/);
  if (mU) {
    if (method === 'GET') return getURSSAF(env, uid, mU[1]);
    if (method === 'PUT') return updateURSSAF(request, env, uid, mU[1]);
  }

  // Objectifs CA
  if (method === 'GET' && path === '/api/objectifs/ca') return getObjectifCA(env, uid);
  if (method === 'PUT' && path === '/api/objectifs/ca') return putObjectifCA(request, env, uid);

  // Objectifs épargne
  if (method === 'GET'  && path === '/api/objectifs/epargne') return listObjectifsEpargne(env, uid);
  if (method === 'POST' && path === '/api/objectifs/epargne') return createObjectifEpargne(request, env, uid);
  const mOE = path.match(/^\/api\/objectifs\/epargne\/([^/]+)$/);
  if (mOE) {
    if (method === 'PUT')    return updateObjectifEpargne(request, env, uid, mOE[1]);
    if (method === 'DELETE') return deleteObjectifEpargne(env, uid, mOE[1]);
  }

  // Répartition
  if (method === 'GET' && path === '/api/repartition') return getRepartition(env, uid);
  if (method === 'PUT' && path === '/api/repartition') return putRepartition(request, env, uid);

  // Trésorerie Qonto
  if (method === 'GET' && path === '/api/tresorerie') return getTresorerie(env, uid);
  if (method === 'PUT' && path === '/api/tresorerie') return putTresorerie(request, env, uid);

  // Rapports
  if (method === 'GET' && path === '/api/rapport/mensuel') return rapportMensuel(env, uid, url);
  if (method === 'GET' && path === '/api/rapport/annuel')  return rapportAnnuel(env, uid, url);
  if (method === 'GET' && path === '/api/rapport/fiscal')  return rapportFiscal(env, uid, url);

  // Import / Export
  if (method === 'POST' && path === '/api/import/factures') return importFactures(request, env, uid);
  if (method === 'POST' && path === '/api/import/depenses') return importDepenses(request, env, uid);
  if (method === 'GET'  && path.startsWith('/api/export/')) {
    const res = path.split('/').pop();
    return exportCSV(env, uid, res);
  }

  return jsonErr(404, 'Route inconnue.');
}

/* ===========================
   AUTHENTIFICATION
   =========================== */
async function authLogin(request, env) {
  const body = await parseJSON(request);
  if (!body?.password) return jsonErr(400, 'Mot de passe requis.');
  let stored = await env.KV_AUTH.get(`${USER_ID}:credentials`, 'json');
  if (!stored && env.ADMIN_PASSWORD) {
    const { hash, salt } = await hasherMDP(env.ADMIN_PASSWORD);
    stored = { login: USER_ID, hash, salt };
    await env.KV_AUTH.put(`${USER_ID}:credentials`, JSON.stringify(stored));
  }
  if (!stored) return jsonErr(401, 'Compte non configuré.');
  const ok = await verifierMDP(body.password, stored.salt, stored.hash);
  if (!ok) return jsonErr(401, 'Mot de passe incorrect.');
  const token = await signerJWT(USER_ID, env);
  return jsonOk({ token });
}

async function authLogout(request, env, jti) {
  await env.KV_AUTH.put(`revoked:${jti}`, '1', { expirationTtl: parseInt(env.JWT_TTL || '28800') });
  return jsonOk({ ok: true });
}

async function authChangePwd(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.currentPassword || !body?.newPassword) return jsonErr(400, 'Champs requis.');
  if (body.newPassword.length < 8) return jsonErr(400, 'Minimum 8 caractères.');
  const stored = await env.KV_AUTH.get(`${uid}:credentials`, 'json');
  if (!stored) return jsonErr(404, 'Compte introuvable.');
  if (!await verifierMDP(body.currentPassword, stored.salt, stored.hash)) return jsonErr(401, 'Mot de passe actuel incorrect.');
  const { hash, salt } = await hasherMDP(body.newPassword);
  await env.KV_AUTH.put(`${uid}:credentials`, JSON.stringify({ login: stored.login, hash, salt }));
  return jsonOk({ ok: true });
}

/* ===========================
   SETTINGS
   =========================== */
const SETTINGS_DEFAUT = {
  nom: 'Cindy', entreprise: 'Seed to Bloom',
  email: 'contact@seedtobloom.fr',
  tauxUrssaf: 25.6, tauxCfp: 0.2, pasFixe: 40,
  cfeAnnuelle: 0, objectifCA: 60000,
  pctVersement: 65, pctEpargne: 15, pctTresorerie: 20,
};

async function settingsGet(env, uid) {
  const s = await kvLire(env, `${uid}:settings`);
  return jsonOk(s && typeof s === 'object' && !Array.isArray(s) ? { ...SETTINGS_DEFAUT, ...s } : SETTINGS_DEFAUT);
}

async function settingsPut(request, env, uid) {
  const body = await parseJSON(request);
  if (!body) return jsonErr(400, 'Body invalide.');
  const existing = await kvLire(env, `${uid}:settings`) || {};
  const updated = { ...SETTINGS_DEFAUT, ...(Array.isArray(existing) ? {} : existing), ...body };
  await env.KV_DATA.put(`${uid}:settings`, JSON.stringify(updated));
  return jsonOk(updated);
}

/* ===========================
   DASHBOARD
   =========================== */
async function dashboard(env, uid) {
  const today  = new Date();
  const annee  = today.getFullYear();
  const mois   = today.getMonth() + 1;
  const settings = await settingsGet(env, uid).then(r => r.json());

  const [factures, depenses, abonnements, treso] = await Promise.all([
    kvTableau(env, `${uid}:factures`),
    kvTableau(env, `${uid}:depenses`),
    kvTableau(env, `${uid}:abonnements`),
    env.KV_DATA.get(`${uid}:tresorerie`, 'json'),
  ]);

  const payees   = factures.filter(f => f.statut === 'payee');
  const attentes = factures.filter(f => ['attente', 'retard'].includes(f.statut));

  // CA et charges du mois
  const factMois = payees.filter(f => memeMA(f.date, annee, mois));
  const caMois   = round(factMois.reduce((s, f) => s + f.montant, 0));
  const depMois  = depenses.filter(d => memeMA(d.date, annee, mois)).reduce((s, d) => s + d.montant, 0);
  const aboMois  = abonnements.filter(a => a.statut === 'actif').reduce((s, a) => s + a.montantMensuel, 0);
  const tauxU    = (settings.tauxUrssaf || 25.6) / 100;
  const tauxC    = (settings.tauxCfp    ||  0.2) / 100;
  const urssafM  = round(caMois * tauxU);
  const cfpM     = round(caMois * tauxC);
  const chargesTotal = round(urssafM + cfpM + depMois + aboMois + settings.pasFixe);
  const netMois  = round(Math.max(0, caMois - chargesTotal));

  // CA YTD
  const caYTD    = round(payees.filter(f => { const [y] = (f.date||'').split('-').map(Number); return y === annee; }).reduce((s,f) => s+f.montant, 0));

  // Objectif CA
  const objCA = await env.KV_DATA.get(`${uid}:objectif_ca`, 'json');
  const montantCible = objCA?.montant || settings.objectifCA || 60000;
  const progressionCA = montantCible > 0 ? Math.min(100, Math.round(caYTD / montantCible * 100)) : 0;

  // 12 derniers mois — revenus vs charges
  const hist = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear(), m = d.getMonth() + 1;
    const caM  = round(payees.filter(f => memeMA(f.date, y, m)).reduce((s,f)=>s+f.montant,0));
    const dM   = round(depenses.filter(f => memeMA(f.date, y, m)).reduce((s,f)=>s+f.montant,0));
    const aM   = round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const chM  = round(caM * (tauxU + tauxC) + dM + aM + settings.pasFixe);
    hist.push({ annee: y, mois: m, label: d.toLocaleString('fr-FR',{month:'short'}), ca: caM, charges: chM, net: round(Math.max(0, caM-chM)) });
  }

  // Prochaine échéance URSSAF
  const prochaineEcheance = prochainEcheanceURSSAF(today);

  // Dernières transactions (5)
  const allTx = await kvTableau(env, `${uid}:transactions`);
  const dernieresTx = allTx.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  // Abonnements à venir (3 prochains)
  const prochAbo = prochainsPrelev(abonnements, today);

  return jsonOk({
    kpis: {
      caMois, chargesTotal, netMois,
      versementEstime: round(netMois * (settings.pctVersement||65) / 100),
      caYTD, progressionCA, montantCible,
      tresoQonto: treso?.solde || 0,
      tresoUpdatedAt: treso?.updatedAt || null,
      prochaineEcheance,
    },
    hist,
    dernieresTx,
    prochAbo,
    facturesAttente: attentes.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5),
    caParClient: aggregParClient(payees),
  });
}

/* ===========================
   FACTURES
   =========================== */
async function listFactures(env, uid) {
  const list = await kvTableau(env, `${uid}:factures`);
  return jsonOk(list.sort((a,b) => b.numero.localeCompare(a.numero)));
}

async function getFacture(env, uid, id) {
  const list = await kvTableau(env, `${uid}:factures`);
  const f = list.find(x => x.id === id);
  return f ? jsonOk(f) : jsonErr(404, 'Facture introuvable.');
}

async function createFacture(request, env, uid) {
  const body = await parseJSON(request);
  if (!validerDoc(body)) return jsonErr(400, 'Données invalides.');
  const list = await kvTableau(env, `${uid}:factures`);
  const f = { id: uid4(), numero: prochNumF(list), client: body.client.trim(),
    description: body.description?.trim() || '', montant: parseFloat(body.montant),
    date: body.date, statut: body.statut || 'attente', pdfKey: null,
    createdAt: iso() };
  list.push(f);
  await kvEcrire(env, `${uid}:factures`, list);
  return jsonOk(f, 201);
}

async function updateFacture(request, env, uid, id) {
  const body = await parseJSON(request);
  const list = await kvTableau(env, `${uid}:factures`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Facture introuvable.');
  const champs = ['client','description','montant','date','statut'];
  champs.forEach(c => { if (body[c] !== undefined) list[idx][c] = c==='montant' ? parseFloat(body[c]) : body[c]; });
  list[idx].updatedAt = iso();
  await kvEcrire(env, `${uid}:factures`, list);
  return jsonOk(list[idx]);
}

async function deleteFacture(env, uid, id) {
  const list = await kvTableau(env, `${uid}:factures`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Facture introuvable.');
  await kvEcrire(env, `${uid}:factures`, next);
  return jsonOk({ deleted: id });
}

async function uploadPDF(request, env, uid, id) {
  const list = await kvTableau(env, `${uid}:factures`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Facture introuvable.');
  const bytes = await request.arrayBuffer();
  const key   = `${uid}/factures/pdf/${list[idx].numero}.pdf`;
  await env.R2_FINANCE.put(key, bytes, { httpMetadata: { contentType: 'application/pdf' } });
  list[idx].pdfKey = key;
  list[idx].updatedAt = iso();
  await kvEcrire(env, `${uid}:factures`, list);
  return jsonOk({ pdfKey: key });
}

async function downloadPDF(env, uid, id) {
  const list = await kvTableau(env, `${uid}:factures`);
  const f    = list.find(x => x.id === id);
  if (!f?.pdfKey) return jsonErr(404, 'Aucun PDF attaché.');
  const obj  = await env.R2_FINANCE.get(f.pdfKey);
  if (!obj) return jsonErr(404, 'Fichier introuvable dans R2.');
  return new Response(obj.body, {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${f.numero}.pdf"` }
  });
}

async function convertDevis(env, uid, id) {
  const devis = await kvTableau(env, `${uid}:devis`);
  const d = devis.find(x => x.id === id);
  if (!d) return jsonErr(404, 'Devis introuvable.');
  if (d.statut !== 'accepte') return jsonErr(400, 'Seul un devis accepté peut être converti.');
  const factures = await kvTableau(env, `${uid}:factures`);
  const f = { id: uid4(), numero: prochNumF(factures), client: d.client,
    description: d.description, montant: d.montant, date: iso().split('T')[0],
    statut: 'attente', pdfKey: null, devisSource: d.numero, createdAt: iso() };
  factures.push(f);
  await kvEcrire(env, `${uid}:factures`, factures);
  return jsonOk({ facture: f });
}

/* ===========================
   DÉPENSES
   =========================== */
async function listDepenses(env, uid) {
  const list = await kvTableau(env, `${uid}:depenses`);
  return jsonOk(list.sort((a,b) => b.date.localeCompare(a.date)));
}

async function createDepense(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.date || !body?.montant || !body?.description || !body?.categorie) return jsonErr(400,'Champs requis.');
  const list = await kvTableau(env, `${uid}:depenses`);
  const d = { id: uid4(), date: body.date, description: body.description.trim(),
    categorie: body.categorie, montant: parseFloat(body.montant), createdAt: iso() };
  list.push(d);
  await kvEcrire(env, `${uid}:depenses`, list);
  return jsonOk(d, 201);
}

async function deleteDepense(env, uid, id) {
  const list = await kvTableau(env, `${uid}:depenses`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Dépense introuvable.');
  await kvEcrire(env, `${uid}:depenses`, next);
  return jsonOk({ deleted: id });
}

/* ===========================
   ABONNEMENTS
   =========================== */
async function listAbo(env, uid) {
  return jsonOk(await kvTableau(env, `${uid}:abonnements`));
}

async function createAbo(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.nom || !body?.montantMensuel) return jsonErr(400, 'Champs requis.');
  const list = await kvTableau(env, `${uid}:abonnements`);
  const a = { id: uid4(), nom: body.nom.trim(), categorie: body.categorie || 'Logiciels & abonnements',
    montantMensuel: parseFloat(body.montantMensuel), jourPrelevement: parseInt(body.jourPrelevement)||1,
    statut: body.statut || 'actif', createdAt: iso() };
  list.push(a);
  await kvEcrire(env, `${uid}:abonnements`, list);
  return jsonOk(a, 201);
}

async function updateAbo(request, env, uid, id) {
  const body = await parseJSON(request);
  const list = await kvTableau(env, `${uid}:abonnements`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Abonnement introuvable.');
  ['nom','categorie','montantMensuel','jourPrelevement','statut'].forEach(c => {
    if (body[c] !== undefined) list[idx][c] = ['montantMensuel','jourPrelevement'].includes(c) ? parseFloat(body[c]) : body[c];
  });
  await kvEcrire(env, `${uid}:abonnements`, list);
  return jsonOk(list[idx]);
}

async function deleteAbo(env, uid, id) {
  const list = await kvTableau(env, `${uid}:abonnements`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Abonnement introuvable.');
  await kvEcrire(env, `${uid}:abonnements`, next);
  return jsonOk({ deleted: id });
}

/* ===========================
   COMPTES
   =========================== */
async function listComptes(env, uid) {
  const list = await kvTableau(env, `${uid}:comptes`);
  if (!list.length) {
    const defaut = [
      { id: uid4(), nom: 'Qonto Pro', type: 'professionnel', solde: 0, updatedAt: iso(), historique: [] },
      { id: uid4(), nom: 'Crédit Agricole', type: 'personnel', solde: 0, updatedAt: iso(), historique: [] },
      { id: uid4(), nom: 'Épargne', type: 'epargne', solde: 0, updatedAt: iso(), historique: [] },
    ];
    await kvEcrire(env, `${uid}:comptes`, defaut);
    return jsonOk(defaut);
  }
  return jsonOk(list);
}

async function createCompte(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.nom) return jsonErr(400, 'Nom requis.');
  const list = await kvTableau(env, `${uid}:comptes`);
  const c = { id: uid4(), nom: body.nom, type: body.type || 'autre', solde: parseFloat(body.solde)||0, updatedAt: iso(), historique: [] };
  list.push(c);
  await kvEcrire(env, `${uid}:comptes`, list);
  return jsonOk(c, 201);
}

async function updateCompte(request, env, uid, id) {
  const body = await parseJSON(request);
  const list = await kvTableau(env, `${uid}:comptes`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Compte introuvable.');
  if (body.solde !== undefined) list[idx].solde = parseFloat(body.solde);
  if (body.nom)  list[idx].nom  = body.nom;
  if (body.type) list[idx].type = body.type;
  list[idx].updatedAt = iso();
  await kvEcrire(env, `${uid}:comptes`, list);
  return jsonOk(list[idx]);
}

async function deleteCompte(env, uid, id) {
  const list = await kvTableau(env, `${uid}:comptes`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Compte introuvable.');
  await kvEcrire(env, `${uid}:comptes`, next);
  return jsonOk({ deleted: id });
}

async function addHistoriqueCompte(request, env, uid, id) {
  const body = await parseJSON(request);
  const list = await kvTableau(env, `${uid}:comptes`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Compte introuvable.');
  list[idx].historique = list[idx].historique || [];
  list[idx].historique.unshift({ date: body.date||iso().split('T')[0], montant: parseFloat(body.montant)||0, libelle: body.libelle||'' });
  list[idx].historique = list[idx].historique.slice(0, 20); // garde les 20 derniers
  await kvEcrire(env, `${uid}:comptes`, list);
  return jsonOk(list[idx]);
}

/* ===========================
   TRANSACTIONS
   =========================== */
async function listTransactions(env, uid, url) {
  const list = await kvTableau(env, `${uid}:transactions`);
  let result = list.sort((a,b) => b.date.localeCompare(a.date));
  const compte   = url.searchParams.get('compte');
  const mois     = url.searchParams.get('mois');
  const annee    = url.searchParams.get('annee');
  const categorie = url.searchParams.get('categorie');
  const q        = url.searchParams.get('q');
  const page     = parseInt(url.searchParams.get('page')) || 1;
  const limit    = 20;
  if (compte)    result = result.filter(t => t.compte === compte);
  if (annee && mois) result = result.filter(t => memeMA(t.date, parseInt(annee), parseInt(mois)));
  else if (annee) result = result.filter(t => t.date?.startsWith(annee));
  if (categorie) result = result.filter(t => t.categorie === categorie);
  if (q)         result = result.filter(t => t.libelle?.toLowerCase().includes(q.toLowerCase()));
  const total = result.length;
  result = result.slice((page-1)*limit, page*limit);
  return jsonOk({ transactions: result, total, page, pages: Math.ceil(total/limit) });
}

async function createTransaction(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.date || !body?.montant || !body?.libelle) return jsonErr(400, 'Champs requis.');
  const list = await kvTableau(env, `${uid}:transactions`);
  const t = { id: uid4(), date: body.date, libelle: body.libelle, montant: parseFloat(body.montant),
    type: body.type || 'sortie', compte: body.compte || '', categorie: body.categorie || '', createdAt: iso() };
  list.push(t);
  await kvEcrire(env, `${uid}:transactions`, list);
  return jsonOk(t, 201);
}

async function deleteTransaction(env, uid, id) {
  const list = await kvTableau(env, `${uid}:transactions`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Transaction introuvable.');
  await kvEcrire(env, `${uid}:transactions`, next);
  return jsonOk({ deleted: id });
}

/* ===========================
   URSSAF TRIMESTRIELLE
   =========================== */
async function listURSSAF(env, uid) {
  const factures = await kvTableau(env, `${uid}:factures`);
  const settings = await settingsGet(env, uid).then(r=>r.json());
  const stored   = (await env.KV_DATA.get(`${uid}:urssaf`, 'json')) || {};
  const tauxU    = (settings.tauxUrssaf||25.6)/100;
  const tauxC    = (settings.tauxCfp||0.2)/100;
  const result   = {};
  for (const [cle, meta] of Object.entries(ECHEANCES_URSSAF)) {
    const caT = round(factures
      .filter(f => f.statut==='payee' && meta.mois.includes(parseInt((f.date||'').split('-')[1])))
      .reduce((s,f)=>s+f.montant,0));
    const urssafDue = round(caT * tauxU);
    const cfpDue    = round(caT * tauxC);
    const data      = stored[cle] || {};
    result[cle] = { ...meta, cle, ca: caT, urssaf: urssafDue, cfp: cfpDue,
      total: round(urssafDue + cfpDue), montantPaye: data.montantPaye || 0,
      statut: data.statut || 'a_venir' };
  }
  return jsonOk(result);
}

async function getURSSAF(env, uid, cle) {
  const all = await listURSSAF(env, uid).then(r=>r.json());
  return all[cle] ? jsonOk(all[cle]) : jsonErr(404, 'Trimestre inconnu.');
}

async function updateURSSAF(request, env, uid, cle) {
  const body    = await parseJSON(request);
  const stored  = (await env.KV_DATA.get(`${uid}:urssaf`, 'json')) || {};
  stored[cle]   = { ...stored[cle], ...body };
  await env.KV_DATA.put(`${uid}:urssaf`, JSON.stringify(stored));
  return getURSSAF(env, uid, cle);
}

/* ===========================
   OBJECTIFS CA
   =========================== */
async function getObjectifCA(env, uid) {
  const data = await env.KV_DATA.get(`${uid}:objectif_ca`, 'json');
  return jsonOk(data || { annee: new Date().getFullYear(), montant: 60000 });
}

async function putObjectifCA(request, env, uid) {
  const body = await parseJSON(request);
  await env.KV_DATA.put(`${uid}:objectif_ca`, JSON.stringify(body));
  return jsonOk(body);
}

/* ===========================
   OBJECTIFS ÉPARGNE
   =========================== */
async function listObjectifsEpargne(env, uid) {
  const list = await kvTableau(env, `${uid}:objectifs_epargne`);
  if (!list.length) {
    const defaut = [
      { id: uid4(), nom: 'Trésorerie tampon (3 mois)', montantCible: 9000, montantActuel: 0, dateCible: null },
      { id: uid4(), nom: 'Épargne retraite', montantCible: 5000, montantActuel: 0, dateCible: null },
      { id: uid4(), nom: 'Nouvel ordinateur', montantCible: 2500, montantActuel: 0, dateCible: null },
    ];
    await kvEcrire(env, `${uid}:objectifs_epargne`, defaut);
    return jsonOk(defaut);
  }
  return jsonOk(list);
}

async function createObjectifEpargne(request, env, uid) {
  const body = await parseJSON(request);
  if (!body?.nom || !body?.montantCible) return jsonErr(400, 'Champs requis.');
  const list = await kvTableau(env, `${uid}:objectifs_epargne`);
  const o = { id: uid4(), nom: body.nom, montantCible: parseFloat(body.montantCible),
    montantActuel: parseFloat(body.montantActuel)||0, dateCible: body.dateCible||null };
  list.push(o);
  await kvEcrire(env, `${uid}:objectifs_epargne`, list);
  return jsonOk(o, 201);
}

async function updateObjectifEpargne(request, env, uid, id) {
  const body = await parseJSON(request);
  const list = await kvTableau(env, `${uid}:objectifs_epargne`);
  const idx  = list.findIndex(x => x.id === id);
  if (idx < 0) return jsonErr(404, 'Objectif introuvable.');
  ['nom','montantCible','montantActuel','dateCible'].forEach(c => { if (body[c]!==undefined) list[idx][c]=body[c]; });
  await kvEcrire(env, `${uid}:objectifs_epargne`, list);
  return jsonOk(list[idx]);
}

async function deleteObjectifEpargne(env, uid, id) {
  const list = await kvTableau(env, `${uid}:objectifs_epargne`);
  const next = list.filter(x => x.id !== id);
  if (next.length === list.length) return jsonErr(404, 'Objectif introuvable.');
  await kvEcrire(env, `${uid}:objectifs_epargne`, next);
  return jsonOk({ deleted: id });
}

/* ===========================
   RÉPARTITION
   =========================== */
async function getRepartition(env, uid) {
  const data = await env.KV_DATA.get(`${uid}:repartition`, 'json');
  return jsonOk(data || { versement: 0, epargne: 0, tresorerie: 0, updatedAt: null });
}

async function putRepartition(request, env, uid) {
  const body = await parseJSON(request);
  const data = { ...body, updatedAt: iso() };
  await env.KV_DATA.put(`${uid}:repartition`, JSON.stringify(data));
  return jsonOk(data);
}

/* ===========================
   TRÉSORERIE QONTO
   =========================== */
async function getTresorerie(env, uid) {
  const data = await env.KV_DATA.get(`${uid}:tresorerie`, 'json');
  return jsonOk(data || { solde: 0, updatedAt: null });
}

async function putTresorerie(request, env, uid) {
  const body = await parseJSON(request);
  const data = { solde: parseFloat(body.solde)||0, updatedAt: iso() };
  await env.KV_DATA.put(`${uid}:tresorerie`, JSON.stringify(data));
  return jsonOk(data);
}

/* ===========================
   RAPPORTS
   =========================== */
async function rapportMensuel(env, uid, url) {
  const annee = parseInt(url.searchParams.get('annee')) || new Date().getFullYear();
  const mois  = parseInt(url.searchParams.get('mois'))  || new Date().getMonth()+1;
  const moisPrec = mois === 1 ? 12 : mois-1;
  const anneePrec = mois === 1 ? annee-1 : annee;
  const settings  = await settingsGet(env, uid).then(r=>r.json());
  const [factures, depenses, abonnements, repartition] = await Promise.all([
    kvTableau(env, `${uid}:factures`),
    kvTableau(env, `${uid}:depenses`),
    kvTableau(env, `${uid}:abonnements`),
    env.KV_DATA.get(`${uid}:repartition`, 'json'),
  ]);
  const tauxU = (settings.tauxUrssaf||25.6)/100;
  const tauxC = (settings.tauxCfp||0.2)/100;

  const calcMois = (y, m) => {
    const payees  = factures.filter(f => f.statut==='payee' && memeMA(f.date,y,m));
    const ca      = round(payees.reduce((s,f)=>s+f.montant,0));
    const dep     = round(depenses.filter(d=>memeMA(d.date,y,m)).reduce((s,d)=>s+d.montant,0));
    const abo     = round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const urssaf  = round(ca*tauxU);
    const cfp     = round(ca*tauxC);
    const charges = round(urssaf+cfp+dep+abo+settings.pasFixe);
    return { ca, dep, abo, urssaf, cfp, charges, net: round(Math.max(0,ca-charges)) };
  };

  const actuel = calcMois(annee, mois);
  const prec   = calcMois(anneePrec, moisPrec);
  const delta  = prec.ca > 0 ? Math.round((actuel.ca - prec.ca) / prec.ca * 100) : null;
  const pctV   = settings.pctVersement || 65;
  const versement = round(actuel.net * pctV / 100);

  return jsonOk({ annee, mois, ...actuel, versement, pctVersement: pctV,
    comparaisonPrecedent: { ...prec, delta },
    repartitionReelle: repartition });
}

async function rapportAnnuel(env, uid, url) {
  const annee = parseInt(url.searchParams.get('annee')) || new Date().getFullYear();
  const settings = await settingsGet(env, uid).then(r=>r.json());
  const [factures, depenses, abonnements] = await Promise.all([
    kvTableau(env, `${uid}:factures`),
    kvTableau(env, `${uid}:depenses`),
    kvTableau(env, `${uid}:abonnements`),
  ]);
  const tauxU = (settings.tauxUrssaf||25.6)/100;
  const tauxC = (settings.tauxCfp||0.2)/100;
  const moisData = [];
  let totCA=0, totCharges=0, totNet=0;
  for (let m = 1; m <= 12; m++) {
    const payees = factures.filter(f=>f.statut==='payee'&&memeMA(f.date,annee,m));
    const ca     = round(payees.reduce((s,f)=>s+f.montant,0));
    const dep    = round(depenses.filter(d=>memeMA(d.date,annee,m)).reduce((s,d)=>s+d.montant,0));
    const abo    = round(abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+a.montantMensuel,0));
    const charges= round(ca*tauxU + ca*tauxC + dep+abo+settings.pasFixe);
    const net    = round(Math.max(0,ca-charges));
    moisData.push({ mois:m, ca, charges, net, versement: round(net*(settings.pctVersement||65)/100) });
    totCA += ca; totCharges += charges; totNet += net;
  }
  const meilleur  = moisData.reduce((a,b)=>b.ca>a.ca?b:a);
  const moinsBon  = moisData.filter(m=>m.ca>0).reduce((a,b)=>b.ca<a.ca?b:a, moisData[0]);
  return jsonOk({ annee, mois: moisData,
    totaux: { ca: round(totCA), charges: round(totCharges), net: round(totNet) },
    meilleur, moinsBon });
}

async function rapportFiscal(env, uid, url) {
  const annee = parseInt(url.searchParams.get('annee')) || new Date().getFullYear();
  const settings = await settingsGet(env, uid).then(r=>r.json());
  const factures  = await kvTableau(env, `${uid}:factures`);
  const depenses  = await kvTableau(env, `${uid}:depenses`);
  const tauxU = (settings.tauxUrssaf||25.6)/100;
  const tauxC = (settings.tauxCfp||0.2)/100;
  const caAnnuel  = round(factures.filter(f=>f.statut==='payee'&&f.date?.startsWith(String(annee))).reduce((s,f)=>s+f.montant,0));
  const depAnnuel = round(depenses.filter(d=>d.date?.startsWith(String(annee))).reduce((s,d)=>s+d.montant,0));
  const abattement = round(caAnnuel * 0.34);
  const revenuImposable = round(caAnnuel - abattement);
  const cotisations = round(caAnnuel * (tauxU + tauxC));
  const pctPlafond  = caAnnuel > 0 ? Math.min(100, Math.round(caAnnuel/PLAFOND_BNC*100)) : 0;
  // Estimation impôt simplifié (tranches 2026 approximatives)
  const impotEstime = estimerImpot(revenuImposable);
  return jsonOk({ annee, caAnnuel, abattement, revenuImposable, cotisations, depAnnuel,
    impotEstime, plafondBNC: PLAFOND_BNC, pctPlafond,
    alertePlafond: pctPlafond >= 80 });
}

/* ===========================
   IMPORT / EXPORT
   =========================== */
async function importFactures(request, env, uid) {
  const body = await parseJSON(request);
  if (!Array.isArray(body?.lignes)) return jsonErr(400, 'Format invalide.');
  const list = await kvTableau(env, `${uid}:factures`);
  const nums  = new Set(list.map(f=>f.numero));
  let importees = 0, doublons = 0;
  for (const ligne of body.lignes) {
    if (!validerDoc(ligne)) continue;
    if (nums.has(ligne.numero)) { doublons++; continue; }
    const f = { id: uid4(), numero: ligne.numero, client: ligne.client?.trim(),
      description: ligne.description?.trim()||'', montant: parseFloat(ligne.montant),
      date: ligne.date, statut: ligne.statut||'attente', pdfKey: null, createdAt: iso() };
    list.push(f); nums.add(f.numero); importees++;
  }
  await kvEcrire(env, `${uid}:factures`, list);
  return jsonOk({ importees, doublons });
}

async function importDepenses(request, env, uid) {
  const body = await parseJSON(request);
  if (!Array.isArray(body?.lignes)) return jsonErr(400, 'Format invalide.');
  const list = await kvTableau(env, `${uid}:depenses`);
  let importees = 0;
  for (const ligne of body.lignes) {
    if (!ligne.date||!ligne.montant||!ligne.description) continue;
    list.push({ id: uid4(), date: ligne.date, description: ligne.description?.trim(),
      categorie: ligne.categorie||'Autre', montant: parseFloat(ligne.montant), createdAt: iso() });
    importees++;
  }
  await kvEcrire(env, `${uid}:depenses`, list);
  return jsonOk({ importees });
}

async function exportCSV(env, uid, ressource) {
  const ressources = { factures: `${uid}:factures`, depenses: `${uid}:depenses`, transactions: `${uid}:transactions` };
  const cle = ressources[ressource];
  if (!cle) return jsonErr(400, 'Ressource inconnue.');
  const list = await kvTableau(env, cle);
  const csv  = listToCSV(list);
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${ressource}.csv"` } });
}

/* ===========================
   HELPERS CALCULS
   =========================== */
function aggregParClient(payees) {
  const map = {};
  payees.forEach(f => { map[f.client] = round((map[f.client]||0)+f.montant); });
  return Object.entries(map).map(([client,ca])=>({client,ca})).sort((a,b)=>b.ca-a.ca);
}

function prochainEcheanceURSSAF(today) {
  for (const [cle, meta] of Object.entries(ECHEANCES_URSSAF)) {
    const e = new Date(meta.echeance);
    if (e >= today) {
      const jours = Math.ceil((e - today) / 86400000);
      return { cle, label: meta.label, echeance: meta.echeance, joursRestants: jours };
    }
  }
  return null;
}

function prochainsPrelev(abonnements, today) {
  const actifs = abonnements.filter(a => a.statut === 'actif');
  const mois   = today.getMonth()+1;
  const annee  = today.getFullYear();
  return actifs.map(a => {
    let dateP = new Date(annee, mois-1, a.jourPrelevement);
    if (dateP < today) dateP = new Date(annee, mois, a.jourPrelevement);
    return { ...a, prochainPrelevement: dateP.toISOString().split('T')[0], joursAvant: Math.ceil((dateP-today)/86400000) };
  }).sort((a,b)=>a.joursAvant-b.joursAvant).slice(0,3);
}

function estimerImpot(revenuImposable) {
  // Tranches approximatives 2026 pour 1 part
  const tranches = [[11497,0],[29315,0.11],[83823,0.30],[180294,0.41],[Infinity,0.45]];
  let impot = 0, prev = 0;
  for (const [limite,taux] of tranches) {
    if (revenuImposable <= prev) break;
    impot += (Math.min(revenuImposable, limite) - prev) * taux;
    prev = limite;
  }
  return round(Math.max(0, impot));
}

function prochNumF(list) {
  const nums = list.map(f=>parseInt((f.numero||'').split('-')[1])||0).filter(n=>!isNaN(n));
  return `F${new Date().getFullYear()}-${String((nums.length?Math.max(...nums):0)+1).padStart(3,'0')}`;
}

function validerDoc(b) {
  if (!b?.client?.trim()) return false;
  if (isNaN(parseFloat(b?.montant)) || parseFloat(b?.montant) <= 0) return false;
  if (!b?.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return false;
  return true;
}

function memeMA(dateStr, annee, mois) {
  if (!dateStr) return false;
  const [y,m] = dateStr.split('-').map(Number);
  return y===annee && m===mois;
}

function listToCSV(list) {
  if (!list.length) return '';
  const keys = Object.keys(list[0]).filter(k=>k!=='historique');
  const head = keys.join(',');
  const rows = list.map(r=>keys.map(k=>JSON.stringify(r[k]??'')).join(','));
  return [head,...rows].join('\n');
}

/* ===========================
   JWT / CRYPTO
   =========================== */
async function signerJWT(userId, env) {
  const now=Math.floor(Date.now()/1000), jti=crypto.randomUUID();
  const ttl=parseInt(env.JWT_TTL||'28800');
  const h=b64url(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const p=b64url(JSON.stringify({sub:userId,jti,iat:now,exp:now+ttl}));
  const cle=await hmacKey(env.JWT_SECRET);
  const sig=await crypto.subtle.sign('HMAC',cle,enc(`${h}.${p}`));
  return `${h}.${p}.${b64urlBytes(new Uint8Array(sig))}`;
}

async function verifierJWT(request, env) {
  const hdr=request.headers.get('Authorization')||'';
  if (!hdr.startsWith('Bearer ')) return {ok:false,message:'Token manquant.'};
  const [h,p,s]=hdr.slice(7).split('.');
  if (!h||!p||!s) return {ok:false,message:'Token malformé.'};
  const cle=await hmacKey(env.JWT_SECRET);
  const ok=await crypto.subtle.verify('HMAC',cle,b64urlDec(s),enc(`${h}.${p}`));
  if (!ok) return {ok:false,message:'Signature invalide.'};
  let claims; try { claims=JSON.parse(new TextDecoder().decode(b64urlDec(p))); } catch { return {ok:false,message:'Payload illisible.'}; }
  if (claims.exp<Math.floor(Date.now()/1000)) return {ok:false,message:'Token expiré.'};
  if (await env.KV_AUTH.get(`revoked:${claims.jti}`)) return {ok:false,message:'Token révoqué.'};
  return {ok:true,userId:claims.sub,jti:claims.jti};
}

async function hasherMDP(mdp) {
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const k=await crypto.subtle.importKey('raw',enc(mdp),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:100000},k,256);
  return {hash:hexEnc(new Uint8Array(bits)),salt:hexEnc(salt)};
}

async function verifierMDP(mdp,saltHex,hashHex) {
  const k=await crypto.subtle.importKey('raw',enc(mdp),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:hexDec(saltHex),iterations:100000},k,256);
  return hexEnc(new Uint8Array(bits))===hashHex;
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw',enc(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}

/* ===========================
   KV HELPERS
   =========================== */
async function kvLire(env, cle) {
  return env.KV_DATA.get(cle, 'json');
}

async function kvTableau(env, cle) {
  const v=await env.KV_DATA.get(cle,'json');
  return Array.isArray(v)?v:[];
}

async function kvEcrire(env, cle, data) {
  await env.KV_DATA.put(cle, JSON.stringify(data));
}

/* ===========================
   UTILITAIRES
   =========================== */
const enc     = s => new TextEncoder().encode(s);
const b64url  = s => btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const b64urlBytes = b => btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
const b64urlDec   = s => { const pad=s.length%4?'='.repeat(4-s.length%4):''; return Uint8Array.from(atob((s+pad).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)); };
const hexEnc  = b => [...b].map(x=>x.toString(16).padStart(2,'0')).join('');
const hexDec  = h => new Uint8Array(h.match(/.{2}/g).map(b=>parseInt(b,16)));
const round   = v => Math.round(v*100)/100;
const iso     = () => new Date().toISOString();
const uid4    = () => crypto.randomUUID().replace(/-/g,'').slice(0,16);

async function parseJSON(req) { try { return await req.json(); } catch { return null; } }

function jsonOk(data, status=200) {
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
}

function jsonErr(status, message) {
  return new Response(JSON.stringify({error:message}),{status,headers:{'Content-Type':'application/json'}});
}

function cors(response, env) {
  const h=new Headers(response.headers);
  h.set('Access-Control-Allow-Origin', (env.CORS_ORIGIN||'*').replace(/\/$/, ''));
  h.set('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
  h.set('Access-Control-Allow-Headers','Content-Type,Authorization');
  h.set('Access-Control-Max-Age','86400');
  return new Response(response.body,{status:response.status,headers:h});
}
