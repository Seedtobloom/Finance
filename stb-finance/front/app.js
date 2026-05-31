/**
 * app.js — Seed to Bloom Finance
 * SPA connectée à l'API back/worker.js via fetch()
 *
 * Modules :
 *   API       — client HTTP avec injection JWT et gestion d'erreurs
 *   Auth      — login, logout, gestion du token en sessionStorage
 *   Dashboard — chargement et rendu du tableau de bord
 *   Factures  — liste, rendu tableau
 *   ModalFacture — formulaire création/édition
 *   Devis / ModalDevis — idem
 *   Depenses / ModalDepense — idem
 *   Simulateur — calculs locaux, pas d'appel API
 *   Chart      — canvas 2D natif
 *   Utils      — formatage, helpers DOM
 */

'use strict';

/* ===========================
   CONSTANTES
   =========================== */
const API_BASE   = '/api';          // relatif : même domaine pour front + back via Workers Routes
const TOKEN_KEY  = 'stb_jwt';       // clé sessionStorage
const URSSAF     = 0.256;
const CFP        = 0.002;
const PAS_FIXE   = 40;

/* ===========================
   MODULE API — client fetch centralisé
   =========================== */
const API = {
  /**
   * Effectue un appel fetch vers l'API.
   * Injecte automatiquement le JWT en header Authorization.
   * Redirige vers le login si 401.
   */
  async appel(method, path, body = null) {
    const token = Auth.tokenLire();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body !== null) opts.body = JSON.stringify(body);

    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, opts);
    } catch {
      throw new Error('Impossible de contacter le serveur.');
    }

    // Token expiré ou invalide → on renvoie vers le login
    if (response.status === 401) {
      Auth.deconnecterSilencieusement();
      return null;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error((json && json.error) || `Erreur ${response.status}`);
    }

    return json;
  },

  get:    (path)        => API.appel('GET',    path),
  post:   (path, body)  => API.appel('POST',   path, body),
  put:    (path, body)  => API.appel('PUT',    path, body),
  delete: (path)        => API.appel('DELETE', path)
};

/* ===========================
   MODULE AUTH
   =========================== */
const Auth = {
  /** Lit le JWT depuis sessionStorage */
  tokenLire() {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  /** Vérifie si un token existe et n'est pas expiré côté client */
  estConnecte() {
    const token = this.tokenLire();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  },

  /** Soumet le formulaire de login */
  async login(event) {
    event.preventDefault();
    const btn = document.getElementById('login-btn');
    const err = document.getElementById('login-error');

    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Connexion…';
    err.style.display = 'none';

    const login    = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ login, password })
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        err.textContent = (json && json.error) || 'Identifiants incorrects.';
        err.style.display = 'block';
        return;
      }

      sessionStorage.setItem(TOKEN_KEY, json.token);
      demarrerApp();
    } catch {
      err.textContent = 'Impossible de contacter le serveur.';
      err.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="ti ti-login"></i> Se connecter';
    }
  },

  /** Déconnexion avec appel API pour révoquer le token */
  async logout() {
    try {
      await API.post('/auth/logout');
    } catch { /* silencieux */ }
    this.deconnecterSilencieusement();
  },

  /** Supprime le token et affiche l'écran de login sans appel API */
  deconnecterSilencieusement() {
    sessionStorage.removeItem(TOKEN_KEY);
    document.getElementById('app').style.display          = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display  = 'none';
    toast('Session terminée. Reconnectez-vous.');
  }
};

/* ===========================
   INITIALISATION
   =========================== */
/** Lance l'app si déjà connecté, sinon affiche le login */
function init() {
  if (Auth.estConnecte()) {
    demarrerApp();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

/** Affiche l'app et charge le dashboard */
function demarrerApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display          = 'flex';
  navigate('dashboard');
}

/* ===========================
   NAVIGATION
   =========================== */
function navigate(sectionId) {
  document.querySelectorAll('.section').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`section-${sectionId}`);
  if (section) section.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add('active');

  const loaders = {
    dashboard:  () => Dashboard.charger(),
    factures:   () => Factures.charger(),
    devis:      () => Devis.charger(),
    depenses:   () => Depenses.charger(),
    simulateur: () => {}
  };

  if (loaders[sectionId]) loaders[sectionId]();
}

/* ===========================
   MODALS — helpers génériques
   =========================== */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

// Fermeture en cliquant sur l'overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ===========================
   MODULE DASHBOARD
   =========================== */
const Dashboard = {
  /** Charge les données agrégées depuis GET /api/dashboard */
  async charger() {
    const today  = new Date();
    const moisNom = today.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    document.getElementById('dash-subtitle').textContent =
      moisNom.charAt(0).toUpperCase() + moisNom.slice(1);

    let data;
    try {
      data = await API.get('/dashboard');
    } catch (e) {
      toast(`Erreur tableau de bord : ${e.message}`);
      return;
    }
    if (!data) return;

    // KPIs
    document.getElementById('kpi-ca-encaisse').textContent = euros(data.kpis.caEncaisse);
    document.getElementById('kpi-ca-attente').textContent  = euros(data.kpis.caAttente);
    document.getElementById('kpi-charges').textContent     = euros(data.kpis.chargesTotal);
    document.getElementById('kpi-versement').textContent   = euros(data.kpis.versementEstime);

    // Graphique
    Chart.dessiner('chart-ca', data.caMensuel);

    // Répartition clients
    this.renderClients(data.caParClient);

    // Factures en attente
    this.renderPending(data.facturesAttente);

    // Charges détail
    this.renderCharges(data.charges);

    // Épargne
    const ep = data.epargne;
    document.getElementById('ep-versement').textContent  = euros(ep.versement);
    document.getElementById('ep-epargne').textContent    = euros(ep.epargne);
    document.getElementById('ep-tresorerie').textContent = euros(ep.tresorerie);
  },

  renderClients(clients) {
    const container = document.getElementById('dash-clients');
    const total = clients.reduce((s, c) => s + c.ca, 0);
    if (!clients.length) {
      container.innerHTML = '<p style="color:var(--muted);font-size:12px">Aucune donnée</p>';
      return;
    }
    container.innerHTML = clients.slice(0, 6).map(c => {
      const pct = total ? Math.round(c.ca / total * 100) : 0;
      return `<div class="progress-row">
        <span class="progress-label" title="${c.client}">${c.client}</span>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <span class="progress-pct">${pct}%</span>
        <span class="progress-amt">${euros(c.ca)}</span>
      </div>`;
    }).join('');
  },

  renderPending(factures) {
    const container = document.getElementById('dash-pending');
    if (!factures.length) {
      container.innerHTML = '<p style="color:var(--muted);font-size:12px;padding:8px 0">Aucune facture en attente</p>';
      return;
    }
    container.innerHTML = factures.map(f => `
      <div class="charges-row">
        <div>
          <span style="font-size:12px;color:var(--muted)">${f.numero}</span>
          <div style="font-size:13px;color:var(--cream)">${f.client}</div>
        </div>
        <div style="text-align:right">
          <span class="badge ${classBadge(f.statut)}">${libelleStatut(f.statut)}</span>
          <div class="charges-amount" style="margin-top:2px">${euros(f.montant)}</div>
        </div>
      </div>`).join('');
  },

  renderCharges(ch) {
    document.getElementById('dash-charges').innerHTML = `
      <div class="charges-row"><span class="charges-name">URSSAF (25,6%)</span><span class="charges-amount">${euros(ch.urssaf)}</span></div>
      <div class="charges-row"><span class="charges-name">CFP (0,2%)</span><span class="charges-amount">${euros(ch.cfp)}</span></div>
      <div class="charges-row"><span class="charges-name">Dépenses pro</span><span class="charges-amount">${euros(ch.depensesPro)}</span></div>
      <div class="charges-row"><span class="charges-name">PAS fixe</span><span class="charges-amount">${euros(ch.pas)}</span></div>
      <div class="charges-row total"><span>Total charges</span><span class="charges-amount" style="color:var(--red)">${euros(ch.total)}</span></div>`;
  }
};

/* ===========================
   MODULE FACTURES
   =========================== */
const Factures = {
  cache: [],

  async charger() {
    let data;
    try {
      data = await API.get('/factures');
    } catch (e) {
      toast(`Erreur : ${e.message}`); return;
    }
    if (!data) return;
    this.cache = data;
    this.render();
    majDatalistClients();
  },

  render() {
    const tbody = document.getElementById('tbody-factures');
    const empty = document.getElementById('empty-factures');
    const count = document.getElementById('fact-count');

    count.textContent = `${this.cache.length} facture${this.cache.length > 1 ? 's' : ''}`;

    if (!this.cache.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = this.cache.map(f => `
      <tr>
        <td class="td-mono">${f.numero}</td>
        <td>${echapper(f.client)}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:12px" title="${echapper(f.prestation)}">${echapper(f.prestation)}</td>
        <td class="td-amount">${euros(f.montant)}</td>
        <td class="td-mono">${datesFr(f.date)}</td>
        <td>
          <select class="select-inline badge ${classBadge(f.statut)}" onchange="Factures.changerStatut('${f.id}', this.value)">
            <option value="attente" ${f.statut==='attente'?'selected':''}>En attente</option>
            <option value="payee"   ${f.statut==='payee'  ?'selected':''}>Payée</option>
            <option value="retard"  ${f.statut==='retard' ?'selected':''}>En retard</option>
          </select>
        </td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-xs" onclick="ModalFacture.ouvrir('${f.id}')" title="Modifier"><i class="ti ti-pencil"></i></button>
            <button class="btn btn-danger btn-xs" onclick="Factures.supprimer('${f.id}')" title="Supprimer"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  },

  async changerStatut(id, statut) {
    try {
      await API.put(`/factures/${id}`, { statut });
      await this.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  },

  async supprimer(id) {
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await API.delete(`/factures/${id}`);
      toast('Facture supprimée.');
      await this.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  }
};

/* ===========================
   MODAL FACTURE
   =========================== */
const ModalFacture = {
  ouvrir(id = null) {
    const f = id ? Factures.cache.find(x => x.id === id) : null;
    document.getElementById('modal-facture-title').textContent = f ? `Modifier ${f.numero}` : 'Nouvelle facture';
    document.getElementById('fact-edit-id').value      = f ? f.id : '';
    document.getElementById('fact-client').value       = f ? f.client : '';
    document.getElementById('fact-date').value         = f ? f.date : today();
    document.getElementById('fact-montant').value      = f ? f.montant : '';
    document.getElementById('fact-prestation').value   = f ? f.prestation : '';
    document.getElementById('fact-statut').value       = f ? f.statut : 'attente';
    majDatalistClients();
    openModal('modal-facture');
  },

  async sauvegarder() {
    const id          = document.getElementById('fact-edit-id').value;
    const client      = document.getElementById('fact-client').value.trim();
    const date        = document.getElementById('fact-date').value;
    const montant     = parseFloat(document.getElementById('fact-montant').value);
    const prestation  = document.getElementById('fact-prestation').value.trim();
    const statut      = document.getElementById('fact-statut').value;

    if (!client || !date || isNaN(montant) || !prestation) {
      toast('Veuillez remplir tous les champs.');
      return;
    }

    const payload = { client, date, montant, prestation, statut };
    const btn = document.getElementById('btn-save-facture');
    btn.disabled = true;

    try {
      if (id) {
        await API.put(`/factures/${id}`, payload);
        toast('Facture mise à jour.');
      } else {
        await API.post('/factures', payload);
        toast('Facture créée.');
      }
      closeModal('modal-facture');
      await Factures.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    } finally {
      btn.disabled = false;
    }
  }
};

/* ===========================
   MODULE DEVIS
   =========================== */
const Devis = {
  cache: [],

  async charger() {
    let data;
    try {
      data = await API.get('/devis');
    } catch (e) {
      toast(`Erreur : ${e.message}`); return;
    }
    if (!data) return;
    this.cache = data;
    this.render();
    majDatalistClients();
  },

  render() {
    const tbody = document.getElementById('tbody-devis');
    const empty = document.getElementById('empty-devis');
    const count = document.getElementById('devis-count');

    count.textContent = `${this.cache.length} devis`;

    if (!this.cache.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = this.cache.map(d => `
      <tr>
        <td class="td-mono">${d.numero}</td>
        <td>${echapper(d.client)}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:12px" title="${echapper(d.prestation)}">${echapper(d.prestation)}</td>
        <td class="td-amount">${euros(d.montant)}</td>
        <td class="td-mono">${datesFr(d.date)}</td>
        <td>
          <select class="select-inline badge ${classBadge(d.statut)}" onchange="Devis.changerStatut('${d.id}', this.value)">
            <option value="brouillon" ${d.statut==='brouillon'?'selected':''}>Brouillon</option>
            <option value="envoye"    ${d.statut==='envoye'   ?'selected':''}>Envoyé</option>
            <option value="accepte"   ${d.statut==='accepte'  ?'selected':''}>Accepté</option>
            <option value="refuse"    ${d.statut==='refuse'   ?'selected':''}>Refusé</option>
          </select>
        </td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-xs" onclick="ModalDevis.ouvrir('${d.id}')" title="Modifier"><i class="ti ti-pencil"></i></button>
            ${d.statut === 'accepte' ? `<button class="btn btn-xs" style="background:var(--blue-bg);color:var(--blue);border:0.5px solid rgba(186,209,253,0.3)" onclick="Devis.convertir('${d.id}')" title="Convertir en facture"><i class="ti ti-transform"></i></button>` : ''}
            <button class="btn btn-danger btn-xs" onclick="Devis.supprimer('${d.id}')" title="Supprimer"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`).join('');
  },

  async changerStatut(id, statut) {
    try {
      await API.put(`/devis/${id}`, { statut });
      await this.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  },

  async convertir(id) {
    try {
      const res = await API.post(`/devis/${id}/convert`);
      toast(`Converti → ${res.facture.numero}`);
      navigate('factures');
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  },

  async supprimer(id) {
    if (!confirm('Supprimer ce devis ?')) return;
    try {
      await API.delete(`/devis/${id}`);
      toast('Devis supprimé.');
      await this.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  }
};

/* ===========================
   MODAL DEVIS
   =========================== */
const ModalDevis = {
  ouvrir(id = null) {
    const d = id ? Devis.cache.find(x => x.id === id) : null;
    document.getElementById('modal-devis-title').textContent = d ? `Modifier ${d.numero}` : 'Nouveau devis';
    document.getElementById('devis-edit-id').value    = d ? d.id : '';
    document.getElementById('devis-client').value     = d ? d.client : '';
    document.getElementById('devis-date').value       = d ? d.date : today();
    document.getElementById('devis-montant').value    = d ? d.montant : '';
    document.getElementById('devis-prestation').value = d ? d.prestation : '';
    document.getElementById('devis-statut').value     = d ? d.statut : 'brouillon';
    majDatalistClients();
    openModal('modal-devis');
  },

  async sauvegarder() {
    const id         = document.getElementById('devis-edit-id').value;
    const client     = document.getElementById('devis-client').value.trim();
    const date       = document.getElementById('devis-date').value;
    const montant    = parseFloat(document.getElementById('devis-montant').value);
    const prestation = document.getElementById('devis-prestation').value.trim();
    const statut     = document.getElementById('devis-statut').value;

    if (!client || !date || isNaN(montant) || !prestation) {
      toast('Veuillez remplir tous les champs.');
      return;
    }

    const payload = { client, date, montant, prestation, statut };
    const btn = document.getElementById('btn-save-devis');
    btn.disabled = true;

    try {
      if (id) {
        await API.put(`/devis/${id}`, payload);
        toast('Devis mis à jour.');
      } else {
        await API.post('/devis', payload);
        toast('Devis créé.');
      }
      closeModal('modal-devis');
      await Devis.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    } finally {
      btn.disabled = false;
    }
  }
};

/* ===========================
   MODULE DÉPENSES
   =========================== */
const Depenses = {
  cache: [],

  async charger() {
    let data;
    try {
      data = await API.get('/depenses');
    } catch (e) {
      toast(`Erreur : ${e.message}`); return;
    }
    if (!data) return;
    this.cache = data;
    this.render();
  },

  render() {
    const tbody = document.getElementById('tbody-depenses');
    const empty = document.getElementById('empty-depenses');
    const today = new Date();
    const annee = today.getFullYear();
    const mois  = today.getMonth() + 1;

    // KPIs locaux à partir du cache
    const annuelles  = this.cache.filter(d => { const [y] = (d.date||'').split('-').map(Number); return y === annee; });
    const mensuelles = annuelles.filter(d => { const [, m] = (d.date||'').split('-').map(Number); return m === mois; });
    const catMap = {};
    annuelles.forEach(d => { catMap[d.categorie] = (catMap[d.categorie]||0) + d.montant; });
    const catPrincipale = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';

    document.getElementById('dep-annuel').textContent = euros(round(annuelles.reduce((s,d) => s+d.montant, 0)));
    document.getElementById('dep-mois').textContent   = euros(round(mensuelles.reduce((s,d) => s+d.montant, 0)));
    document.getElementById('dep-cat').textContent    = catPrincipale;

    if (!this.cache.length) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = this.cache.map(d => `
      <tr>
        <td class="td-mono">${datesFr(d.date)}</td>
        <td>${echapper(d.description)}</td>
        <td><span class="badge badge-brouillon">${echapper(d.categorie)}</span></td>
        <td class="td-amount">${euros(d.montant)}</td>
        <td><button class="btn btn-danger btn-xs" onclick="Depenses.supprimer('${d.id}')"><i class="ti ti-trash"></i></button></td>
      </tr>`).join('');
  },

  async supprimer(id) {
    if (!confirm('Supprimer cette dépense ?')) return;
    try {
      await API.delete(`/depenses/${id}`);
      toast('Dépense supprimée.');
      await this.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    }
  }
};

/* ===========================
   MODAL DÉPENSE
   =========================== */
const ModalDepense = {
  ouvrir() {
    document.getElementById('dep-date').value        = today();
    document.getElementById('dep-montant').value     = '';
    document.getElementById('dep-description').value = '';
    document.getElementById('dep-categorie').value   = 'Logiciels & abonnements';
    openModal('modal-depense');
  },

  async sauvegarder() {
    const date        = document.getElementById('dep-date').value;
    const montant     = parseFloat(document.getElementById('dep-montant').value);
    const description = document.getElementById('dep-description').value.trim();
    const categorie   = document.getElementById('dep-categorie').value;

    if (!date || isNaN(montant) || !description) {
      toast('Veuillez remplir tous les champs.');
      return;
    }

    const btn = document.getElementById('btn-save-depense');
    btn.disabled = true;

    try {
      await API.post('/depenses', { date, montant, description, categorie });
      toast('Dépense enregistrée.');
      closeModal('modal-depense');
      await Depenses.charger();
    } catch (e) {
      toast(`Erreur : ${e.message}`);
    } finally {
      btn.disabled = false;
    }
  }
};

/* ===========================
   MODULE SIMULATEUR (calculs locaux)
   =========================== */
const Simulateur = {
  calculer() {
    const ca       = parseFloat(document.getElementById('sim-ca').value)        || 0;
    const dep      = parseFloat(document.getElementById('sim-dep').value)       || 0;
    const cfeAnn   = parseFloat(document.getElementById('sim-cfe').value)       || 0;
    const revPerso = parseFloat(document.getElementById('sim-rev-perso').value) || 0;
    const depPerso = parseFloat(document.getElementById('sim-dep-perso').value) || 0;
    const pctVerse = parseInt(document.getElementById('sim-slider').value) / 100;

    const cfeMens  = round(cfeAnn / 12);
    const urssaf   = round(ca * URSSAF);
    const cfp      = round(ca * CFP);
    const net      = round(Math.max(0, ca - urssaf - cfp - dep - cfeMens - PAS_FIXE));
    const verse    = round(net * pctVerse);
    const epargne  = round(net * 0.15);
    const treso    = round(net * 0.20);

    document.getElementById('sim-r-ca').textContent     = euros(ca);
    document.getElementById('sim-r-urssaf').textContent = euros(urssaf);
    document.getElementById('sim-r-cfp').textContent    = euros(cfp);
    document.getElementById('sim-r-dep').textContent    = euros(dep);
    document.getElementById('sim-r-cfe').textContent    = euros(cfeMens);
    document.getElementById('sim-r-pas').textContent    = euros(PAS_FIXE);
    document.getElementById('sim-r-net').textContent    = euros(net);

    const pct = Math.round(pctVerse * 100);
    document.getElementById('sim-r-verse-label').textContent = `Je me verse (${pct}%)`;
    document.getElementById('sim-r-verse').textContent   = euros(verse);
    document.getElementById('sim-r-epargne').textContent = euros(epargne);
    document.getElementById('sim-r-treso').textContent   = euros(treso);

    const persoVisible = revPerso > 0 || depPerso > 0;
    document.getElementById('sim-budget-perso').style.display = persoVisible ? 'block' : 'none';
    if (persoVisible) {
      const solde = round(revPerso + verse - depPerso);
      document.getElementById('sim-r-rev-perso').textContent  = euros(revPerso);
      document.getElementById('sim-r-verse2').textContent     = euros(verse);
      document.getElementById('sim-r-dep-perso').textContent  = euros(depPerso);
      const soldeEl = document.getElementById('sim-r-solde');
      soldeEl.textContent = euros(solde);
      soldeEl.style.color = solde >= 0 ? 'var(--blue)' : 'var(--red)';
    }
  }
};

/* ===========================
   GRAPHIQUE CANVAS 2D
   =========================== */
const Chart = {
  /** Dessine le graphique CA barres sur un canvas */
  dessiner(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth || 400;
    const H   = 180;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const padL = 52, padR = 10, padT = 10, padB = 36;
    const cW = W - padL - padR;
    const cH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    const maxCA = Math.max(...data.map(d => d.ca), 1);

    // Grille
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padT + cH - (cH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cW, y); ctx.stroke();
    }

    // Labels Y
    ctx.fillStyle  = 'rgba(255,255,255,0.3)';
    ctx.font       = '10px DM Sans, sans-serif';
    ctx.textAlign  = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxCA * i / 4;
      const y   = padT + cH - (cH * i / 4);
      ctx.fillText(val >= 1000 ? Math.round(val/100)/10 + 'k' : Math.round(val), padL - 6, y + 3);
    }

    // Barres
    const gap  = cW / data.length;
    const barW = Math.floor(gap * 0.55);

    data.forEach((d, i) => {
      const x = padL + gap * i + (gap - barW) / 2;
      const h = d.ca ? Math.max(4, cH * d.ca / maxCA) : 0;
      const y = padT + cH - h;

      ctx.fillStyle = d.ca ? 'rgba(186,209,253,0.8)' : 'rgba(186,209,253,0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, [3, 3, 0, 0]);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font      = '10px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label.charAt(0).toUpperCase() + d.label.slice(1), x + barW / 2, H - 10);

      if (d.ca) {
        ctx.fillStyle = 'rgba(186,209,253,0.7)';
        ctx.font      = '9px DM Sans, sans-serif';
        ctx.fillText(d.ca >= 1000 ? Math.round(d.ca/100)/10 + 'k' : d.ca, x + barW / 2, y - 4);
      }
    });
  }
};

/* ===========================
   DATALIST CLIENTS
   =========================== */
function majDatalistClients() {
  const clients = [...new Set([
    ...Factures.cache.map(f => f.client),
    ...Devis.cache.map(d => d.client)
  ])].sort();
  const dl = document.getElementById('clients-list');
  if (dl) dl.innerHTML = clients.map(c => `<option value="${echapper(c)}">`).join('');
}

/* ===========================
   UTILITAIRES
   =========================== */
/** Formatte un montant en euros (fr-FR) */
function euros(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v || 0);
}

/** Arrondi à 2 décimales */
function round(v) {
  return Math.round(v * 100) / 100;
}

/** Formatte une date ISO en JJ/MM/AAAA */
function datesFr(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Retourne la date du jour au format ISO */
function today() {
  return new Date().toISOString().split('T')[0];
}

/** Échappe les caractères HTML (XSS) */
function echapper(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Retourne la classe CSS du badge selon le statut */
function classBadge(statut) {
  const map = { payee:'badge-payee', accepte:'badge-accepte', attente:'badge-attente', envoye:'badge-envoye', retard:'badge-retard', refuse:'badge-refuse', brouillon:'badge-brouillon' };
  return map[statut] || 'badge-brouillon';
}

/** Retourne le libellé lisible d'un statut */
function libelleStatut(statut) {
  const map = { payee:'Payée', accepte:'Accepté', attente:'En attente', envoye:'Envoyé', retard:'En retard', refuse:'Refusé', brouillon:'Brouillon' };
  return map[statut] || statut;
}

/** Affiche un toast de notification */
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ===========================
   ANIMATION SPIN (loader login)
   =========================== */
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

/* ===========================
   RESIZE — redessine le graphique
   =========================== */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    const active = document.querySelector('.section.active');
    if (active && active.id === 'section-dashboard') Dashboard.charger();
  }, 150);
});

/* ===========================
   DÉMARRAGE
   =========================== */
init();
