/**
 * stb-finance-api — Worker Cloudflare (back/worker.js)
 *
 * Routes :
 *   POST   /api/auth/login          → Authentification, retourne JWT
 *   POST   /api/auth/logout         → Révoque le token en KV
 *   POST   /api/auth/change-password
 *
 *   GET    /api/factures            → Liste toutes les factures
 *   POST   /api/factures            → Crée une facture
 *   PUT    /api/factures/:id        → Met à jour une facture
 *   DELETE /api/factures/:id        → Supprime une facture
 *
 *   GET    /api/devis
 *   POST   /api/devis
 *   PUT    /api/devis/:id
 *   DELETE /api/devis/:id
 *   POST   /api/devis/:id/convert   → Convertit un devis accepté en facture
 *
 *   GET    /api/depenses
 *   POST   /api/depenses
 *   DELETE /api/depenses/:id
 *
 *   GET    /api/dashboard           → Agrégats pour le tableau de bord
 *
 *   POST   /api/pdf/facture/:id     → Génère un PDF et le stocke dans R2
 *   GET    /api/pdf/facture/:id     → URL présignée R2 du PDF
 *
 * Auth : JWT HMAC-SHA256 signé avec JWT_SECRET (Workers secret)
 * KV_AUTH : { "cindy:credentials" : { login, passwordHash, salt } }
 * KV_DATA : { "cindy:factures" : [...], "cindy:devis": [...], ... }
 */

/* ===========================
   CONSTANTES MÉTIER
   =========================== */
const URSSAF_TAUX = 0.256;
const CFP_TAUX    = 0.002;
const PAS_FIXE    = 40;
const USER_ID     = 'cindy'; // compte unique, extensible plus tard

/* ===========================
   POINT D'ENTRÉE PRINCIPAL
   =========================== */
export default {
  async fetch(request, env, ctx) {
    // Gestion CORS preflight
    if (request.method === 'OPTIONS') {
      return corsHeaders(new Response(null, { status: 204 }), env);
    }

    try {
      const response = await router(request, env, ctx);
      return corsHeaders(response, env);
    } catch (err) {
      return corsHeaders(jsonError(500, 'Erreur interne du serveur.'), env);
    }
  }
};

/* ===========================
   ROUTEUR PRINCIPAL
   =========================== */
async function router(request, env, ctx) {
  const url    = new URL(request.url);
  const path   = url.pathname.replace(/\/$/, ''); // supprime le slash final
  const method = request.method;

  // Routes publiques (sans JWT)
  if (method === 'POST' && path === '/api/auth/login') {
    return handleLogin(request, env);
  }

  // Toutes les autres routes nécessitent un JWT valide
  const authResult = await verifierJWT(request, env);
  if (!authResult.ok) {
    return jsonError(401, authResult.message);
  }
  const userId = authResult.userId;

  // Auth
  if (method === 'POST' && path === '/api/auth/logout') {
    return handleLogout(request, env, authResult.jti);
  }
  if (method === 'POST' && path === '/api/auth/change-password') {
    return handleChangePassword(request, env, userId);
  }

  // Dashboard
  if (method === 'GET' && path === '/api/dashboard') {
    return handleDashboard(env, userId);
  }

  // Factures
  if (method === 'GET'    && path === '/api/factures')       return handleListFactures(env, userId);
  if (method === 'POST'   && path === '/api/factures')       return handleCreateFacture(request, env, userId);
  const matchFacture = path.match(/^\/api\/factures\/([^/]+)$/);
  if (matchFacture) {
    const id = matchFacture[1];
    if (method === 'PUT')    return handleUpdateFacture(request, env, userId, id);
    if (method === 'DELETE') return handleDeleteFacture(env, userId, id);
  }

  // Devis
  if (method === 'GET'  && path === '/api/devis')           return handleListDevis(env, userId);
  if (method === 'POST' && path === '/api/devis')           return handleCreateDevis(request, env, userId);
  const matchDevis = path.match(/^\/api\/devis\/([^/]+)$/);
  if (matchDevis) {
    const id = matchDevis[1];
    if (method === 'PUT')    return handleUpdateDevis(request, env, userId, id);
    if (method === 'DELETE') return handleDeleteDevis(env, userId, id);
  }
  const matchDevisConvert = path.match(/^\/api\/devis\/([^/]+)\/convert$/);
  if (matchDevisConvert && method === 'POST') {
    return handleConvertDevis(env, userId, matchDevisConvert[1]);
  }

  // Dépenses
  if (method === 'GET'  && path === '/api/depenses')        return handleListDepenses(env, userId);
  if (method === 'POST' && path === '/api/depenses')        return handleCreateDepense(request, env, userId);
  const matchDep = path.match(/^\/api\/depenses\/([^/]+)$/);
  if (matchDep && method === 'DELETE') {
    return handleDeleteDepense(env, userId, matchDep[1]);
  }

  // PDF
  const matchPdfGet = path.match(/^\/api\/pdf\/facture\/([^/]+)$/);
  if (matchPdfGet && method === 'GET') {
    return handleGetPDF(env, userId, matchPdfGet[1]);
  }
  const matchPdfPost = path.match(/^\/api\/pdf\/facture\/([^/]+)$/);
  if (matchPdfPost && method === 'POST') {
    return handleStorePDF(request, env, userId, matchPdfPost[1]);
  }

  return jsonError(404, 'Route non trouvée.');
}

/* ===========================
   AUTHENTIFICATION — JWT WebCrypto
   =========================== */

/**
 * Importe la clé HMAC-SHA256 depuis le secret JWT_SECRET.
 * La clé est dérivée via PBKDF2 pour renforcer un secret court.
 */
async function importerCleJWT(secret) {
  const enc     = new TextEncoder();
  const keyMat  = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
  return keyMat;
}

/**
 * Signe et retourne un JWT compact (header.payload.signature en base64url).
 * Payload : { sub, jti (identifiant unique pour révocation), exp, iat }
 */
async function signerJWT(userId, env) {
  const now    = Math.floor(Date.now() / 1000);
  const ttl    = parseInt(env.JWT_TTL || '28800');
  const jti    = crypto.randomUUID();

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ sub: userId, jti, iat: now, exp: now + ttl }));

  const cle       = await importerCleJWT(env.JWT_SECRET);
  const signature = await crypto.subtle.sign(
    'HMAC',
    cle,
    new TextEncoder().encode(`${header}.${payload}`)
  );

  return `${header}.${payload}.${b64urlBytes(new Uint8Array(signature))}`;
}

/**
 * Vérifie un JWT : signature, expiration et révocation KV.
 * Retourne { ok, userId, jti, message }
 */
async function verifierJWT(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { ok: false, message: 'Token manquant.' };
  }

  const token  = authHeader.slice(7);
  const parts  = token.split('.');
  if (parts.length !== 3) return { ok: false, message: 'Token malformé.' };

  const [header, payload, sig] = parts;

  // Vérification signature
  let cle;
  try {
    cle = await importerCleJWT(env.JWT_SECRET);
  } catch {
    return { ok: false, message: 'Erreur clé.' };
  }

  const valide = await crypto.subtle.verify(
    'HMAC',
    cle,
    b64urlDecode(sig),
    new TextEncoder().encode(`${header}.${payload}`)
  );
  if (!valide) return { ok: false, message: 'Signature invalide.' };

  // Décode le payload
  let claims;
  try {
    claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
  } catch {
    return { ok: false, message: 'Payload illisible.' };
  }

  // Vérification expiration
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp < now) return { ok: false, message: 'Token expiré.' };

  // Vérification révocation (logout)
  const revoque = await env.KV_AUTH.get(`revoked:${claims.jti}`);
  if (revoque !== null) return { ok: false, message: 'Token révoqué.' };

  return { ok: true, userId: claims.sub, jti: claims.jti };
}

/* ===========================
   HASH DE MOT DE PASSE — PBKDF2
   =========================== */

/**
 * Dérive un hash PBKDF2-SHA256 du mot de passe avec un sel aléatoire.
 * Retourne { hash: hex, salt: hex }
 */
async function hasherMotDePasse(motDePasse) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(motDePasse), 'PBKDF2', false, ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMat,
    256
  );

  return {
    hash: hexEncode(new Uint8Array(bits)),
    salt: hexEncode(salt)
  };
}

/**
 * Vérifie un mot de passe contre un hash+salt PBKDF2 stocké.
 */
async function verifierMotDePasse(motDePasse, saltHex, hashHex) {
  const enc    = new TextEncoder();
  const salt   = hexDecode(saltHex);

  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(motDePasse), 'PBKDF2', false, ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 },
    keyMat,
    256
  );

  return hexEncode(new Uint8Array(bits)) === hashHex;
}

/* ===========================
   HANDLERS AUTH
   =========================== */

/** POST /api/auth/login — vérifie login/mdp, retourne JWT */
async function handleLogin(request, env) {
  const body = await parseJSON(request);
  if (!body || !body.login || !body.password) {
    return jsonError(400, 'Champs login et password requis.');
  }

  const stored = await env.KV_AUTH.get(`${USER_ID}:credentials`, 'json');

  // Premier lancement : pas encore de credentials en KV
  // → initialisation avec les valeurs de démarrage
  if (!stored) {
    return jsonError(401, 'Aucun compte configuré. Utilisez l\'initialisation.');
  }

  if (body.login !== stored.login) {
    return jsonError(401, 'Identifiants incorrects.');
  }

  const ok = await verifierMotDePasse(body.password, stored.salt, stored.hash);
  if (!ok) return jsonError(401, 'Identifiants incorrects.');

  const token = await signerJWT(USER_ID, env);
  return jsonOk({ token });
}

/** POST /api/auth/logout — révoque le JWT courant en KV */
async function handleLogout(request, env, jti) {
  const ttl = parseInt(env.JWT_TTL || '28800');
  await env.KV_AUTH.put(`revoked:${jti}`, '1', { expirationTtl: ttl });
  return jsonOk({ message: 'Déconnecté.' });
}

/** POST /api/auth/change-password */
async function handleChangePassword(request, env, userId) {
  const body = await parseJSON(request);
  if (!body || !body.currentPassword || !body.newPassword) {
    return jsonError(400, 'Champs currentPassword et newPassword requis.');
  }
  if (body.newPassword.length < 8) {
    return jsonError(400, 'Le nouveau mot de passe doit faire au moins 8 caractères.');
  }

  const stored = await env.KV_AUTH.get(`${userId}:credentials`, 'json');
  if (!stored) return jsonError(404, 'Credentials non trouvés.');

  const ok = await verifierMotDePasse(body.currentPassword, stored.salt, stored.hash);
  if (!ok) return jsonError(401, 'Mot de passe actuel incorrect.');

  const { hash, salt } = await hasherMotDePasse(body.newPassword);
  await env.KV_AUTH.put(`${userId}:credentials`, JSON.stringify({
    login: stored.login,
    hash,
    salt
  }));

  return jsonOk({ message: 'Mot de passe mis à jour.' });
}

/* ===========================
   HELPERS KV DATA
   =========================== */

/** Lit un tableau JSON depuis KV, retourne [] si absent */
async function kvLire(env, cle) {
  const raw = await env.KV_DATA.get(cle, 'json');
  return Array.isArray(raw) ? raw : [];
}

/** Écrit un tableau JSON dans KV */
async function kvEcrire(env, cle, data) {
  await env.KV_DATA.put(cle, JSON.stringify(data));
}

/** Retourne la clé KV pour une ressource d'un utilisateur */
function cleKV(userId, ressource) {
  return `${userId}:${ressource}`;
}

/** Génère un ID unique */
function genId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/* ===========================
   NUMÉROTATION AUTO
   =========================== */

/** Calcule le prochain numéro de facture F2026-XXX */
function prochainNumeroFacture(factures) {
  const nums = factures
    .map(f => parseInt((f.numero || '').split('-')[1]) || 0)
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `F2026-${String(max + 1).padStart(3, '0')}`;
}

/** Calcule le prochain numéro de devis D2026-XXX */
function prochainNumeroDevis(devis) {
  const nums = devis
    .map(d => parseInt((d.numero || '').split('-')[1]) || 0)
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `D2026-${String(max + 1).padStart(3, '0')}`;
}

/* ===========================
   HANDLERS FACTURES
   =========================== */

async function handleListFactures(env, userId) {
  const factures = await kvLire(env, cleKV(userId, 'factures'));
  return jsonOk(factures.sort((a, b) => b.numero.localeCompare(a.numero)));
}

async function handleCreateFacture(request, env, userId) {
  const body = await parseJSON(request);
  if (!validerFacture(body)) return jsonError(400, 'Données invalides.');

  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const nouvelle = {
    id:         genId(),
    numero:     prochainNumeroFacture(factures),
    client:     body.client.trim(),
    prestation: body.prestation.trim(),
    montant:    parseFloat(body.montant),
    date:       body.date,
    statut:     body.statut || 'attente',
    createdAt:  new Date().toISOString()
  };

  factures.push(nouvelle);
  await kvEcrire(env, cleKV(userId, 'factures'), factures);
  return jsonOk(nouvelle, 201);
}

async function handleUpdateFacture(request, env, userId, id) {
  const body     = await parseJSON(request);
  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const idx      = factures.findIndex(f => f.id === id);
  if (idx === -1) return jsonError(404, 'Facture non trouvée.');

  // Champs modifiables (le numéro et l'id ne changent pas)
  const champs = ['client', 'prestation', 'montant', 'date', 'statut'];
  champs.forEach(c => {
    if (body[c] !== undefined) factures[idx][c] = c === 'montant' ? parseFloat(body[c]) : body[c];
  });
  factures[idx].updatedAt = new Date().toISOString();

  await kvEcrire(env, cleKV(userId, 'factures'), factures);
  return jsonOk(factures[idx]);
}

async function handleDeleteFacture(env, userId, id) {
  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const filtered = factures.filter(f => f.id !== id);
  if (filtered.length === factures.length) return jsonError(404, 'Facture non trouvée.');
  await kvEcrire(env, cleKV(userId, 'factures'), filtered);
  return jsonOk({ deleted: id });
}

/* ===========================
   HANDLERS DEVIS
   =========================== */

async function handleListDevis(env, userId) {
  const devis = await kvLire(env, cleKV(userId, 'devis'));
  return jsonOk(devis.sort((a, b) => b.numero.localeCompare(a.numero)));
}

async function handleCreateDevis(request, env, userId) {
  const body = await parseJSON(request);
  if (!validerFacture(body)) return jsonError(400, 'Données invalides.');

  const devis    = await kvLire(env, cleKV(userId, 'devis'));
  const nouveau  = {
    id:         genId(),
    numero:     prochainNumeroDevis(devis),
    client:     body.client.trim(),
    prestation: body.prestation.trim(),
    montant:    parseFloat(body.montant),
    date:       body.date,
    statut:     body.statut || 'brouillon',
    createdAt:  new Date().toISOString()
  };

  devis.push(nouveau);
  await kvEcrire(env, cleKV(userId, 'devis'), devis);
  return jsonOk(nouveau, 201);
}

async function handleUpdateDevis(request, env, userId, id) {
  const body  = await parseJSON(request);
  const devis = await kvLire(env, cleKV(userId, 'devis'));
  const idx   = devis.findIndex(d => d.id === id);
  if (idx === -1) return jsonError(404, 'Devis non trouvé.');

  const champs = ['client', 'prestation', 'montant', 'date', 'statut'];
  champs.forEach(c => {
    if (body[c] !== undefined) devis[idx][c] = c === 'montant' ? parseFloat(body[c]) : body[c];
  });
  devis[idx].updatedAt = new Date().toISOString();

  await kvEcrire(env, cleKV(userId, 'devis'), devis);
  return jsonOk(devis[idx]);
}

async function handleDeleteDevis(env, userId, id) {
  const devis    = await kvLire(env, cleKV(userId, 'devis'));
  const filtered = devis.filter(d => d.id !== id);
  if (filtered.length === devis.length) return jsonError(404, 'Devis non trouvé.');
  await kvEcrire(env, cleKV(userId, 'devis'), filtered);
  return jsonOk({ deleted: id });
}

/**
 * POST /api/devis/:id/convert
 * Convertit un devis accepté en facture (statut → attente).
 */
async function handleConvertDevis(env, userId, id) {
  const devis    = await kvLire(env, cleKV(userId, 'devis'));
  const devisItem = devis.find(d => d.id === id);
  if (!devisItem) return jsonError(404, 'Devis non trouvé.');
  if (devisItem.statut !== 'accepte') {
    return jsonError(400, 'Seul un devis accepté peut être converti en facture.');
  }

  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const nouvelle = {
    id:          genId(),
    numero:      prochainNumeroFacture(factures),
    client:      devisItem.client,
    prestation:  devisItem.prestation,
    montant:     devisItem.montant,
    date:        new Date().toISOString().split('T')[0],
    statut:      'attente',
    devisSource: devisItem.numero,
    createdAt:   new Date().toISOString()
  };

  factures.push(nouvelle);
  await kvEcrire(env, cleKV(userId, 'factures'), factures);

  return jsonOk({ facture: nouvelle, devis: devisItem });
}

/* ===========================
   HANDLERS DÉPENSES
   =========================== */

async function handleListDepenses(env, userId) {
  const depenses = await kvLire(env, cleKV(userId, 'depenses'));
  return jsonOk(depenses.sort((a, b) => (a.date < b.date ? 1 : -1)));
}

async function handleCreateDepense(request, env, userId) {
  const body = await parseJSON(request);
  if (!body || !body.date || !body.montant || !body.description || !body.categorie) {
    return jsonError(400, 'Champs date, montant, description, categorie requis.');
  }

  const CATEGORIES = [
    'Logiciels & abonnements', 'Matériel', 'Formation',
    'Communication', 'Déplacement', 'Comptabilité', 'Autre'
  ];
  if (!CATEGORIES.includes(body.categorie)) {
    return jsonError(400, `Catégorie invalide. Valeurs : ${CATEGORIES.join(', ')}`);
  }

  const depenses = await kvLire(env, cleKV(userId, 'depenses'));
  const nouvelle = {
    id:          genId(),
    date:        body.date,
    description: body.description.trim(),
    categorie:   body.categorie,
    montant:     parseFloat(body.montant),
    createdAt:   new Date().toISOString()
  };

  depenses.push(nouvelle);
  await kvEcrire(env, cleKV(userId, 'depenses'), depenses);
  return jsonOk(nouvelle, 201);
}

async function handleDeleteDepense(env, userId, id) {
  const depenses = await kvLire(env, cleKV(userId, 'depenses'));
  const filtered = depenses.filter(d => d.id !== id);
  if (filtered.length === depenses.length) return jsonError(404, 'Dépense non trouvée.');
  await kvEcrire(env, cleKV(userId, 'depenses'), filtered);
  return jsonOk({ deleted: id });
}

/* ===========================
   HANDLER DASHBOARD
   =========================== */

/**
 * GET /api/dashboard
 * Retourne tous les agrégats nécessaires au tableau de bord
 * en une seule requête (évite les round-trips multiples).
 */
async function handleDashboard(env, userId) {
  const [factures, devis, depenses] = await Promise.all([
    kvLire(env, cleKV(userId, 'factures')),
    kvLire(env, cleKV(userId, 'devis')),
    kvLire(env, cleKV(userId, 'depenses'))
  ]);

  const today    = new Date();
  const annee    = today.getFullYear();
  const moisNum  = today.getMonth() + 1;

  // CA encaissé et en attente
  const payees   = factures.filter(f => f.statut === 'payee');
  const attentes = factures.filter(f => ['attente', 'retard'].includes(f.statut));
  const caEncaisse = round(payees.reduce((s, f) => s + f.montant, 0));
  const caAttente  = round(attentes.reduce((s, f) => s + f.montant, 0));

  // Factures du mois courant (payées)
  const factMois = payees.filter(f => {
    const [y, m] = (f.date || '').split('-').map(Number);
    return y === annee && m === moisNum;
  });
  const caMois = round(factMois.reduce((s, f) => s + f.montant, 0));

  // Dépenses du mois courant
  const depMois = depenses.filter(d => {
    const [y, m] = (d.date || '').split('-').map(Number);
    return y === annee && m === moisNum;
  });
  const totalDepMois = round(depMois.reduce((s, d) => s + d.montant, 0));

  // Charges sur le mois
  const urssaf = round(caMois * URSSAF_TAUX);
  const cfp    = round(caMois * CFP_TAUX);
  const chargesTotal = round(urssaf + cfp + totalDepMois + PAS_FIXE);

  // Résultat net et versement estimé
  const net       = round(Math.max(0, caMois - urssaf - cfp - totalDepMois - PAS_FIXE));
  const versement = round(net * 0.65);

  // CA des 6 derniers mois
  const caMensuel = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const ca = round(payees
      .filter(f => { const [fy, fm] = (f.date || '').split('-').map(Number); return fy === y && fm === m; })
      .reduce((s, f) => s + f.montant, 0));
    caMensuel.push({ annee: y, mois: m, label: d.toLocaleString('fr-FR', { month: 'short' }), ca });
  }

  // Répartition CA par client (factures payées)
  const clientMap = {};
  payees.forEach(f => { clientMap[f.client] = round((clientMap[f.client] || 0) + f.montant); });
  const caParClient = Object.entries(clientMap)
    .map(([client, ca]) => ({ client, ca }))
    .sort((a, b) => b.ca - a.ca);

  // Factures en attente (pour le widget)
  const facturesAttente = attentes
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  return jsonOk({
    kpis: {
      caEncaisse,
      caAttente,
      chargesTotal,
      versementEstime: versement
    },
    charges: { urssaf, cfp, depensesPro: totalDepMois, pas: PAS_FIXE, total: chargesTotal },
    epargne: { net, versement: round(net * 0.65), epargne: round(net * 0.15), tresorerie: round(net * 0.20) },
    caMensuel,
    caParClient,
    facturesAttente
  });
}

/* ===========================
   HANDLERS PDF (R2)
   =========================== */

/**
 * POST /api/pdf/facture/:id
 * Reçoit un Blob PDF (généré côté front via print-to-PDF ou html2canvas),
 * le stocke dans R2 sous la clé userId/pdf/facture-{numero}.pdf
 */
async function handleStorePDF(request, env, userId, id) {
  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const facture  = factures.find(f => f.id === id);
  if (!facture) return jsonError(404, 'Facture non trouvée.');

  const pdfBytes = await request.arrayBuffer();
  const cle      = `${userId}/pdf/${facture.numero}.pdf`;

  await env.R2_FINANCE.put(cle, pdfBytes, {
    httpMetadata: { contentType: 'application/pdf' },
    customMetadata: { numero: facture.numero, client: facture.client }
  });

  return jsonOk({ stored: cle, numero: facture.numero });
}

/**
 * GET /api/pdf/facture/:id
 * Retourne directement le PDF depuis R2.
 */
async function handleGetPDF(env, userId, id) {
  const factures = await kvLire(env, cleKV(userId, 'factures'));
  const facture  = factures.find(f => f.id === id);
  if (!facture) return jsonError(404, 'Facture non trouvée.');

  const cle    = `${userId}/pdf/${facture.numero}.pdf`;
  const object = await env.R2_FINANCE.get(cle);

  if (!object) return jsonError(404, 'PDF non encore généré.');

  return new Response(object.body, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${facture.numero}.pdf"`,
      'Cache-Control':       'private, max-age=3600'
    }
  });
}

/* ===========================
   VALIDATION
   =========================== */

/** Vérifie les champs obligatoires d'une facture ou d'un devis */
function validerFacture(body) {
  if (!body) return false;
  if (!body.client || typeof body.client !== 'string' || !body.client.trim()) return false;
  if (!body.prestation || typeof body.prestation !== 'string') return false;
  if (isNaN(parseFloat(body.montant)) || parseFloat(body.montant) <= 0) return false;
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return false;
  return true;
}

/* ===========================
   UTILITAIRES
   =========================== */

/** Ajoute les headers CORS à une réponse */
function corsHeaders(response, env) {
  const origin = env.CORS_ORIGIN || '*';
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(response.body, { status: response.status, headers });
}

/** Retourne une réponse JSON succès */
function jsonOk(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/** Retourne une réponse JSON erreur */
function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/** Parse le corps JSON de la requête, retourne null si échec */
async function parseJSON(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Arrondi à 2 décimales */
function round(v) {
  return Math.round(v * 100) / 100;
}

/** Encode une chaîne en base64url */
function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Encode des bytes en base64url */
function b64urlBytes(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/** Décode une chaîne base64url en Uint8Array */
function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - str.length % 4);
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

/** Encode Uint8Array en hexadécimal */
function hexEncode(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Décode une chaîne hex en Uint8Array */
function hexDecode(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
}
