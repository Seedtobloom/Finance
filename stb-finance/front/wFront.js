/**
 * wFront.js — STB Finance · Worker Front
 * Sert l'application SPA (HTML+CSS+JS inline)
 * Gère l'auth via KV_AUTH (clé = mot de passe, valeur = {isActive, expireAt})
 * Proxifie /api/* vers le back via service binding STB_BACK
 *
 * Bindings requis :
 *   KV_AUTH   → namespace KV Auth
 *   STB_BACK  → service binding vers wBack
 *
 * Configuration KV_AUTH (à faire manuellement dans le dashboard) :
 *   Clé   : votre_mot_de_passe
 *   Valeur : {"isActive":true,"expireAt":"2027-12-31"}
 */

const COOKIE_NAME = 'stb_sid';

const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seed to Bloom — Finance</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23412F21'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-style='italic' font-weight='600' font-size='19' fill='%23F2E5C2' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter+Tight:wght@300;400;500;600;700&family=Alegreya:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
  <link rel="stylesheet" href="/style.css?v=60" />
</head>
<body>

<!-- APP SHELL -->
<div id="app">

  <!-- SIDEBAR -->
  <aside id="sidebar">
    <div class="sidebar-logo">
      <span class="logo-name">Seed to Bloom</span>
      <span class="logo-sub">finance</span>
      <span style="display:block;font-size:10px;letter-spacing:.04em;color:var(--text-2);opacity:.7;margin-top:2px;">build v60 · versement + réserve refondus build v25 · patrimoine vivant projets vivants</span>
    </div>

    <nav id="sidebar-nav">

      <!-- TABLEAU DE BORD -->
      <div class="nav-group">
        <a class="nav-item" data-section="dashboard"><i class="ti ti-layout-dashboard"></i> Tableau de bord</a>
      </div>

      <!-- PERSONNEL -->
      <div class="nav-group">
        <span class="nav-group-label"><i class="ti ti-home"></i> Personnel</span>
        <a class="nav-item" data-section="budget-perso"><i class="ti ti-home-heart"></i> Mon budget perso</a>
        <a class="nav-item" data-section="versement"><i class="ti ti-wallet"></i> Combien me verser ?</a>
        <a class="nav-item" data-section="patrimoine"><i class="ti ti-building-bank"></i> Mon patrimoine</a>
        <a class="nav-item" data-section="projets-vie"><i class="ti ti-map-pin-heart"></i> Projets de vie</a>
      </div>

      <!-- ENTREPRISE · ARGENT -->
      <div class="nav-group">
        <span class="nav-group-label"><i class="ti ti-building"></i> Argent</span>
        <a class="nav-item" data-section="enveloppes"><i class="ti ti-wallet"></i> Enveloppes</a>
        <a class="nav-item" data-section="comptes"><i class="ti ti-building-bank"></i> Comptes</a>
        <a class="nav-item" data-section="transactions"><i class="ti ti-arrows-exchange"></i> Transactions</a>
        <a class="nav-item" data-section="depenses"><i class="ti ti-receipt"></i> Dépenses</a>
        <a class="nav-item" data-section="abonnements"><i class="ti ti-repeat"></i> Charges fixes</a>
        <a class="nav-item" data-section="charges-urssaf"><i class="ti ti-calendar-due"></i> URSSAF</a>
        <a class="nav-item" data-section="reserve"><i class="ti ti-shield-half"></i> Réserve sécurité</a>
        <a class="nav-item" data-section="objectifs-epargne"><i class="ti ti-target"></i> Objectifs</a>
      </div>

      <!-- ACTIVITÉ -->
      <div class="nav-group">
        <span class="nav-group-label">Activité</span>
        <a class="nav-item" data-section="factures"><i class="ti ti-file-invoice"></i> CA &amp; Factures</a>
        <a class="nav-item" data-section="devis"><i class="ti ti-file-description"></i> Devis</a>
        <a class="nav-item" data-section="projets"><i class="ti ti-folders"></i> Projets</a>
      </div>

      <!-- CLIENTS -->
      <div class="nav-group">
        <span class="nav-group-label">Clients</span>
        <a class="nav-item" data-section="tiers"><i class="ti ti-users"></i> Clients</a>
        <a class="nav-item" data-section="crm"><i class="ti ti-address-book"></i> Développement</a>
      </div>

      <!-- RAPPORTS -->
      <div class="nav-group">
        <span class="nav-group-label">Rapports</span>
        <a class="nav-item" data-section="rapport-prevision"><i class="ti ti-chart-line"></i> Prévisions</a>
        <a class="nav-item" data-section="rapport-mensuel"><i class="ti ti-report"></i> Mensuel</a>
        <a class="nav-item" data-section="rapport-trimestriel"><i class="ti ti-calendar-stats"></i> Trimestriel</a>
        <a class="nav-item" data-section="rapport-annuel"><i class="ti ti-report-analytics"></i> Annuel</a>
        <a class="nav-item" data-section="rapport-fiscal"><i class="ti ti-report-money"></i> Fiscal BNC</a>
      </div>

      <!-- PARAMÈTRES -->
      <div class="nav-group">
        <span class="nav-group-label">Paramètres</span>
        <a class="nav-item" data-section="simulateur"><i class="ti ti-calculator"></i> Simulateur</a>
        <a class="nav-item" data-section="import-export"><i class="ti ti-database-import"></i> Import / Export</a>
        <a class="nav-item" data-section="options"><i class="ti ti-settings"></i> Options</a>
      </div>

    </nav><!-- /nav -->

    <!-- BAS SIDEBAR -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="user-avatar">C</div>
        <div class="user-info">
          <div class="user-name">Cindy</div>
          <div class="user-company">Seed to Bloom</div>
        </div>
      </div>
    </div>
  </aside>

  <div id="sidebar-overlay" onclick="closeSidebar()"></div>

  <!-- MAIN CONTENT -->
  <main id="main">

    <div id="mobile-topbar">
      <button id="mobile-menu-btn" onclick="toggleSidebar()" aria-label="Menu"><i class="ti ti-menu-2"></i></button>
      <span class="logo-name" style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--navy);">Seed to Bloom</span>
    </div>

    <!-- ═══════════════════════════
         TABLEAU DE BORD
         ═══════════════════════════ -->
    <section id="section-dashboard" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Tableau de bord</h1>
          <div class="page-subtitle" id="dash-period"></div>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary btn-sm" id="dash-refresh-btn">
            <i class="ti ti-refresh"></i> Actualiser
          </button>
        </div>
      </div>

      <!-- Copilote financier : narration complète (4 questions) -->
      <div id="dash-cockpit" style="margin-bottom:16px;"></div>

      <!-- Tendances (sparklines 12 mois) -->
      <div id="dash-trends"></div>
    </section><!-- /dashboard -->


    <!-- ═══════════════════════════
         COMPTES
         ═══════════════════════════ -->
    <section id="section-comptes" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Comptes bancaires</h1>
          <div class="page-subtitle">Soldes de tes comptes réels</div>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" id="btn-new-compte"><i class="ti ti-plus"></i> Ajouter un compte</button>
        </div>
      </div>

      <div class="comptes-grid" id="comptes-grid"></div>

      <!-- Dépenses prévues -->
      <div class="card" style="margin-top:24px;">
        <div class="card-title" style="display:flex;align-items:center;justify-content:space-between;">
          <span><i class="ti ti-calendar-stats"></i> Dépenses prévues</span>
          <button class="btn btn-primary btn-sm" onclick="openDepensePrevueModal()"><i class="ti ti-plus"></i> Ajouter</button>
        </div>
        <div id="depenses-prevues-list"></div>
      </div>
    </section><!-- /comptes -->


    <!-- ═══════════════════════════
         ENVELOPPES
         ═══════════════════════════ -->
    <section id="section-enveloppes" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Enveloppes</h1>
          <div class="page-subtitle">Ton solde Qonto réel, réparti automatiquement d'après tes vraies transactions</div>
        </div>
        <div class="page-header-right" style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="openEnvReglages()"><i class="ti ti-settings"></i> Réglages</button>
          <button class="btn btn-primary" onclick="syncQonto()"><i class="ti ti-refresh"></i> Sync Qonto</button>
        </div>
      </div>

      <div id="enveloppes-banner" style="margin-bottom:20px;"></div>
      <div id="enveloppes-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;"></div>

      <div class="card" style="margin-top:24px;">
        <div class="card-title"><i class="ti ti-inbox"></i> Catégoriser mes opérations</div>
        <div style="font-size:13px;color:var(--text-2);margin-bottom:10px;">Chaque dépense Qonto est rangée automatiquement. Change la catégorie via le menu déroulant si besoin — l'appli s'en souviendra. « Voir toutes les opérations » pour en re-catégoriser une déjà classée.</div>
        <div id="enveloppes-aranger"></div>
      </div>
    </section><!-- /enveloppes -->

    <!-- Modal réglages enveloppes -->
    <div class="modal-overlay" id="modal-env-reglages" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title">Réglages des enveloppes</div>
          <button class="modal-close" onclick="q('#modal-env-reglages').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div>
            <label class="form-label">Budget Formation (€ / an)</label>
            <input class="form-control" type="number" id="env-budget-formation" min="0" step="50" placeholder="Ex: 2000">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Le seul montant que l'appli ne peut pas deviner.</div>
          </div>
          <div>
            <label class="form-label">Budget Sous-traitance (€ / an)</label>
            <input class="form-control" type="number" id="env-budget-soustraitance" min="0" step="50" placeholder="0 = juste suivi, sans réserve">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Prestataires (prospection, offre…). Laisse 0 pour seulement suivre le dépensé.</div>
          </div>
          <div>
            <label class="form-label">Matelas de trésorerie (€)</label>
            <input class="form-control" type="number" id="env-cible-treso" min="0" step="100" placeholder="0 = désactivé">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Montant à garder en sécurité. Laisse 0 si tu n'en veux pas.</div>
          </div>
          <div>
            <label class="form-label">Charges fixes à couvrir (mois d'avance)</label>
            <input class="form-control" type="number" id="env-horizon-charges" min="0" max="12" step="1" placeholder="1">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Combien de mois d'abonnements garder de côté.</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-env-reglages').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="saveEnvReglages()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal engagement à venir -->
    <div class="modal-overlay" id="modal-engagement" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title" id="engagement-modal-title">Nouvel engagement</div>
          <button class="modal-close" onclick="q('#modal-engagement').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <input type="hidden" id="engagement-id">
          <div>
            <label class="form-label">Intitulé de l'engagement</label>
            <input class="form-control" type="text" id="engagement-nom" placeholder="Ex: Accompagnement entreprise">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">La prestation, l'accompagnement, la formation… que tu t'es engagée à payer.</div>
          </div>
          <div>
            <label class="form-label">Montant total (€)</label>
            <input class="form-control" type="number" id="engagement-total" min="0" step="10" placeholder="Ex: 3000">
          </div>
          <div>
            <label class="form-label">Déjà payé — acompte (€)</label>
            <input class="form-control" type="number" id="engagement-paye" min="0" step="10" placeholder="Ex: 900">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Ce que tu as déjà réglé. L'appli réservera le reste (total − acompte).</div>
          </div>
          <div>
            <label class="form-label">Échéance prévue (optionnel)</label>
            <input class="form-control" type="date" id="engagement-date">
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-engagement').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="saveEngagement()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>


    <!-- ═══════════════════════════
         BUDGET PERSO
         ═══════════════════════════ -->
    <section id="section-budget-perso" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Mon budget perso</h1>
          <p style="font-size:13.5px;color:var(--text-2);margin-top:2px;">De combien as-tu besoin pour vivre — et est-ce que ton activité suit&nbsp;?</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-outline" onclick="openPersoPaliersModal()"><i class="ti ti-adjustments"></i> Mes paliers</button>
          <button class="btn btn-primary" onclick="openPersoChargeModal()"><i class="ti ti-plus"></i> Ajouter une dépense</button>
        </div>
      </div>
      <div id="perso-hero" style="margin-bottom:18px;"></div>
      <div id="perso-reste" style="margin-bottom:18px;"></div>
      <div id="perso-bridge" style="margin-bottom:18px;"></div>
      <div id="perso-revenus" style="margin-bottom:18px;"></div>
      <div id="perso-epargne" style="margin-bottom:18px;"></div>
      <div id="perso-charges" style="margin-bottom:18px;"></div>
      <div id="perso-simulateur"></div>
    </section>

    <section id="section-versement" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Combien puis-je me verser ?</h1>
          <p style="font-size:13.5px;color:var(--text-2);margin-top:2px;">Ton versement dépend de l'horizon : ce que tu peux faire une fois n'est pas ce que ton activité soutient chaque mois.</p>
        </div>
      </div>
      <div id="versement-content"></div>
    </section>

    <section id="section-reserve" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Ta réserve de sécurité</h1>
          <p style="font-size:13.5px;color:var(--text-2);margin-top:2px;">De quoi tenir les mois creux, les cotisations et les factures en retard — avant de te verser quoi que ce soit.</p>
        </div>
      </div>
      <div id="reserve-content"></div>
    </section>

    <!-- Modal dépense perso -->
    <div class="modal-overlay" id="modal-perso-charge" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title" id="perso-charge-title">Nouvelle dépense perso</div>
          <button class="modal-close" onclick="q('#modal-perso-charge').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <input type="hidden" id="perso-charge-id">
          <div>
            <label class="form-label">Intitulé</label>
            <input class="form-control" type="text" id="perso-charge-nom" placeholder="Ex: Loyer, Courses, Netflix…">
          </div>
          <div>
            <label class="form-label">Catégorie</label>
            <select class="form-control" id="perso-charge-cat">
              <option value="logement">Logement</option>
              <option value="transport">Transport</option>
              <option value="quotidien">Vie quotidienne</option>
              <option value="famille">Famille</option>
              <option value="loisirs">Loisirs</option>
            </select>
          </div>
          <div>
            <label class="form-label">Montant mensuel (€)</label>
            <input class="form-control" type="number" id="perso-charge-montant" min="0" step="5" placeholder="Ex: 980">
          </div>
          <div>
            <label class="form-label">Type</label>
            <select class="form-control" id="perso-charge-type">
              <option value="fixe">Fixe (tous les mois pareil)</option>
              <option value="variable">Variable (fluctue)</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-perso-charge').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="savePersoCharge()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal épargne mensuelle -->
    <div class="modal-overlay" id="modal-perso-epargne" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title" id="perso-epargne-title">Nouveau support d'épargne</div>
          <button class="modal-close" onclick="q('#modal-perso-epargne').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <input type="hidden" id="perso-epargne-id">
          <div>
            <label class="form-label">Nom (optionnel)</label>
            <input class="form-control" type="text" id="perso-epargne-nom" placeholder="Laisse vide pour utiliser le type (ex : Livret A)">
          </div>
          <div>
            <label class="form-label">Type de support</label>
            <select class="form-control" id="perso-epargne-cat">
              <option value="livreta">Livret A</option>
              <option value="ldds">LDDS</option>
              <option value="av">Assurance vie</option>
              <option value="pea">PEA</option>
              <option value="cto">CTO</option>
              <option value="immo">Immobilier</option>
              <option value="crypto">Crypto</option>
              <option value="compte">Compte perso</option>
              <option value="autre">Autre placement</option>
            </select>
          </div>
          <div>
            <label class="form-label">À mettre de côté chaque mois (€)</label>
            <input class="form-control" type="number" id="perso-epargne-montant" min="0" step="10" placeholder="Ex: 200">
          </div>
          <div>
            <label class="form-label">Solde actuel (optionnel, €)</label>
            <input class="form-control" type="number" id="perso-epargne-solde" min="0" step="100" placeholder="Ex: 5000">
          </div>
          <div>
            <label class="form-label">Objectif (optionnel, €)</label>
            <input class="form-control" type="number" id="perso-epargne-objectif" min="0" step="500" placeholder="Ex: 10000">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Pour suivre ta progression vers ta cible sur ce support.</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-perso-epargne').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="savePersoEpargne()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal revenu perso (hors entreprise) -->
    <div class="modal-overlay" id="modal-perso-revenu" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title" id="perso-revenu-title">Nouveau revenu perso</div>
          <button class="modal-close" onclick="q('#modal-perso-revenu').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <input type="hidden" id="perso-revenu-id">
          <div>
            <label class="form-label">Intitulé</label>
            <input class="form-control" type="text" id="perso-revenu-nom" placeholder="Ex: CAF, Prime d'activité, Pension…">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Un revenu qui rentre chaque mois en dehors de ton entreprise.</div>
          </div>
          <div>
            <label class="form-label">Montant mensuel (€)</label>
            <input class="form-control" type="number" id="perso-revenu-montant" min="0" step="10" placeholder="Ex: 350">
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-perso-revenu').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="savePersoRevenu()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal paliers de salaire -->
    <div class="modal-overlay" id="modal-perso-paliers" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title">Mes paliers de salaire</div>
          <button class="modal-close" onclick="q('#modal-perso-paliers').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div style="font-size:13px;color:var(--text-2);">Le minimum vital est calculé automatiquement depuis tes dépenses. Définis ici tes paliers de confort et d'objectif.</div>
          <div>
            <label class="form-label"><i class="ti ti-circle"></i> Confort (€ / mois)</label>
            <input class="form-control" type="number" id="perso-palier-confort" min="0" step="50" placeholder="Ex: 3000">
          </div>
          <div>
            <label class="form-label"><i class="ti ti-circle-filled"></i> Objectif salaire (€ / mois)</label>
            <input class="form-control" type="number" id="perso-palier-objectif" min="0" step="50" placeholder="Ex: 3500">
          </div>
          <div>
            <label class="form-label"><i class="ti ti-target"></i> Objectif épargne total (€)</label>
            <input class="form-control" type="number" id="perso-palier-epargne" min="0" step="500" placeholder="Ex: 20000">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Le total que tu vises sur tes livrets / assurance vie (pour la jauge du tableau de bord).</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-perso-paliers').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="savePersoPaliers()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════
         PATRIMOINE
         ═══════════════════════════ -->
    <section id="section-patrimoine" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Mon patrimoine</h1>
          <p style="font-size:13.5px;color:var(--text-2);margin-top:2px;">Chaque euro a une mission — vois où va ton argent et comment ton patrimoine progresse.</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="openPersoEpargneModal()"><i class="ti ti-plus"></i> Ajouter un support</button>
        </div>
      </div>
      <div id="patrimoine-global" style="margin-bottom:18px;"></div>
      <div id="patrimoine-alim" style="margin-bottom:18px;"></div>
      <div id="patrimoine-content"></div>
    </section>

    <!-- ═══════════════════════════
         PROJETS DE VIE
         ═══════════════════════════ -->
    <section id="section-projets-vie" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Projets de vie</h1>
          <p style="font-size:13.5px;color:var(--text-2);margin-top:2px;">Donne une mission à ton épargne. Chaque mois, rapproche-toi un peu plus de tes projets de vie.</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" onclick="openProjetVieModal()"><i class="ti ti-plus"></i> Nouveau projet</button>
        </div>
      </div>
      <div id="projets-vie-grid"></div>
    </section>

    <!-- Modal projet de vie -->
    <div class="modal-overlay" id="modal-projet-vie" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title" id="projet-vie-title">Nouveau projet de vie</div>
          <button class="modal-close" onclick="q('#modal-projet-vie').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <input type="hidden" id="projet-vie-id">
          <div>
            <label class="form-label">Nom du projet</label>
            <input class="form-control" type="text" id="projet-vie-nom" placeholder="Ex: Apport immobilier">
          </div>
          <div style="display:flex;gap:12px;">
            <div style="flex:1;">
              <label class="form-label">Catégorie</label>
              <select class="form-control" id="projet-vie-cat">
                <option value="voyage">Voyages</option>
                <option value="voiture">Voiture</option>
                <option value="immo">Immobilier</option>
                <option value="mariage">Mariage</option>
                <option value="formation">Formation</option>
                <option value="materiel">Matériel</option>
                <option value="plaisir">Plaisir</option>
                <option value="sante">Santé</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div style="width:130px;">
              <label class="form-label">Priorité</label>
              <select class="form-control" id="projet-vie-priorite">
                <option value="3">Haute</option>
                <option value="2" selected>Moyenne</option>
                <option value="1">Basse</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Montant cible (€)</label>
            <input class="form-control" type="number" id="projet-vie-cible" min="0" step="100" placeholder="Ex: 35000">
          </div>
          <div>
            <label class="form-label">Déjà épargné (€)</label>
            <input class="form-control" type="number" id="projet-vie-epargne" min="0" step="100" placeholder="Ex: 8000">
          </div>
          <div>
            <label class="form-label">Épargne mensuelle prévue (€)</label>
            <input class="form-control" type="number" id="projet-vie-mensualite" min="0" step="10" placeholder="Ex: 400">
          </div>
          <div>
            <label class="form-label">Support d'épargne (optionnel)</label>
            <select class="form-control" id="projet-vie-support"><option value="">— Où est placé cet argent ? —</option></select>
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Le projet dit <em>pourquoi</em> tu épargnes, le support dit <em>où</em> est placé l'argent.</div>
          </div>
          <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;">
            <button class="btn btn-ghost" style="color:#8d2b21;" onclick="deleteProjetVie(q('#projet-vie-id').value)"><i class="ti ti-trash"></i></button>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-outline" onclick="q('#modal-projet-vie').style.display='none'">Annuler</button>
              <button class="btn btn-primary" onclick="saveProjetVie()"><i class="ti ti-check"></i> Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════
         TRANSACTIONS
         ═══════════════════════════ -->
    <section id="section-transactions" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Transactions</h1>
        </div>
        <div class="page-header-right">
          <input type="text" id="txn-search" class="form-input" style="width:200px;" placeholder="Rechercher…" />
          <select id="txn-filter-compte" class="form-select" style="width:160px;">
            <option value="">Tous les comptes</option>
          </select>
          <select id="txn-filter-type" class="form-select" style="width:130px;">
            <option value="">Tous types</option>
            <option value="credit">Crédit</option>
            <option value="debit">Débit</option>
            <option value="virement">Virement</option>
          </select>
          <button class="btn btn-primary" id="btn-new-txn"><i class="ti ti-plus"></i> Ajouter</button>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th>Compte</th>
                <th>Type</th>
                <th>Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="txn-tbody"></tbody>
          </table>
        </div>
      </div>
    </section><!-- /transactions -->


    <!-- ═══════════════════════════
         CA & FACTURES
         ═══════════════════════════ -->
    <section id="section-factures" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>CA &amp; Factures</h1>
          <div class="page-subtitle">Importées depuis Indy</div>
        </div>
        <div class="page-header-right">
          <input type="text" id="factures-search" class="form-input" style="width:160px;" placeholder="Rechercher…" />
          <select id="factures-filter-annee" class="form-select" style="width:100px;">
            <option value="">Toutes années</option>
          </select>
          <select id="factures-filter-mois" class="form-select" style="width:150px;">
            <option value="">Mois émission</option>
            <option value="01">Janv. (émission)</option>
            <option value="02">Févr. (émission)</option>
            <option value="03">Mars (émission)</option>
            <option value="04">Avr. (émission)</option>
            <option value="05">Mai (émission)</option>
            <option value="06">Juin (émission)</option>
            <option value="07">Juil. (émission)</option>
            <option value="08">Août (émission)</option>
            <option value="09">Sept. (émission)</option>
            <option value="10">Oct. (émission)</option>
            <option value="11">Nov. (émission)</option>
            <option value="12">Déc. (émission)</option>
          </select>
          <select id="factures-filter-mois-paiement" class="form-select" style="width:155px;">
            <option value="">Mois paiement</option>
            <option value="01">Janv. (paiement)</option>
            <option value="02">Févr. (paiement)</option>
            <option value="03">Mars (paiement)</option>
            <option value="04">Avr. (paiement)</option>
            <option value="05">Mai (paiement)</option>
            <option value="06">Juin (paiement)</option>
            <option value="07">Juil. (paiement)</option>
            <option value="08">Août (paiement)</option>
            <option value="09">Sept. (paiement)</option>
            <option value="10">Oct. (paiement)</option>
            <option value="11">Nov. (paiement)</option>
            <option value="12">Déc. (paiement)</option>
          </select>
          <select id="factures-filter-statut" class="form-select" style="width:140px;">
            <option value="">Tous statuts</option>
            <option value="payee">Payée</option>
            <option value="attente">En attente</option>
            <option value="retard">En retard</option>
          </select>
          <select id="factures-sort" class="form-select" style="width:180px;">
            <option value="date-desc">Date émission ↓</option>
            <option value="date-asc">Date émission ↑</option>
            <option value="paiement-desc">Date paiement ↓</option>
            <option value="paiement-asc">Date paiement ↑</option>
            <option value="montant-desc">Montant ↓</option>
            <option value="montant-asc">Montant ↑</option>
          </select>
          <select id="factures-filter-projet" class="form-select" style="width:170px;">
            <option value="">Tous projets</option>
          </select>
          <select id="factures-filter-client" class="form-select" style="width:150px;">
            <option value="">Tous clients</option>
          </select>
          <button class="btn btn-primary" id="btn-new-facture"><i class="ti ti-plus"></i> Nouvelle facture</button>
        </div>
      </div>

      <!-- 4 KPIs -->
      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-trending-up"></i></div>
          <span class="kpi-label">CA total importé</span>
          <span class="kpi-value" id="fac-kpi-total">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-check"></i></div>
          <span class="kpi-label">Montant payé</span>
          <span class="kpi-value green" id="fac-kpi-paye">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-clock"></i></div>
          <span class="kpi-label">Montant en attente</span>
          <span class="kpi-value warning" id="fac-kpi-attente">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon violet"><i class="ti ti-percentage"></i></div>
          <span class="kpi-label">Taux de recouvrement</span>
          <span class="kpi-value" id="fac-kpi-taux">—</span>
        </div>
      </div>

      <div id="factures-ca-visages" style="margin-bottom:16px;"></div>

      <!-- Tableau -->
      <div class="card mb-16">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Émission</th>
                <th>Échéance</th>
                <th>Payée le</th>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Projet</th>
                <th>Devis</th>
                <th>Montant HT</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="factures-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-donut"></i> CA par client</div>
          <div class="chart-wrap"><canvas id="chart-fac-client" height="200"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-bar"></i> CA par mois</div>
          <div class="chart-wrap"><canvas id="chart-fac-mois" height="200"></canvas></div>
        </div>
      </div>

      <!-- Input PDF caché -->
      <input type="file" id="pdf-upload-input" accept=".pdf" style="display:none;" />
    </section><!-- /factures -->


    <!-- ═══════════════════════════
         CLIENTS & TIERS
         ═══════════════════════════ -->
    <section id="section-tiers" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Clients &amp; tiers</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-2);">Clients, fournisseurs, prestataires — avec CA encaissé par client.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="tiers-search" class="form-input" style="width:190px;" placeholder="Rechercher…" />
          <select id="tiers-filter-type" class="form-select" style="width:150px;">
            <option value="">Tous types</option>
            <option value="client">Clients</option>
            <option value="fournisseur">Fournisseurs</option>
            <option value="prestataire">Prestataires</option>
          </select>
          <button class="btn btn-primary" id="btn-new-tiers"><i class="ti ti-plus"></i> Nouveau tiers</button>
        </div>
      </div>

      <div class="kpi-grid kpi-grid-3 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-users"></i></div>
          <span class="kpi-label">Clients enregistrés</span>
          <span class="kpi-value" id="tiers-kpi-clients">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-trending-up"></i></div>
          <span class="kpi-label">CA total encaissé</span>
          <span class="kpi-value" id="tiers-kpi-ca">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon violet"><i class="ti ti-star"></i></div>
          <span class="kpi-label">Meilleur client</span>
          <span class="kpi-value" style="font-size:18px;" id="tiers-kpi-top">—</span>
        </div>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Email</th>
                <th>CA encaissé</th>
                <th>Factures</th>
                <th>Dernière facture</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="tiers-tbody"></tbody>
          </table>
        </div>
      </div>
    </section><!-- /tiers -->


    <!-- ═══════════════════════════
         CRM PROSPECTION
         ═══════════════════════════ -->
    <section id="section-crm" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Développement commercial</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-2);">Ton copilote pour signer plus de clients — pipeline, relances et opportunités.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="crm-search" class="form-input" style="width:160px;" placeholder="Rechercher…" />
          <select id="crm-filter-statut" class="form-select" style="width:150px;">
            <option value="">Tous statuts</option>
            <option value="contact">Premier contact</option>
            <option value="en_attente">En attente</option>
            <option value="positif">Positif</option>
            <option value="negatif">Négatif</option>
            <option value="proposition">Proposition envoyée</option>
            <option value="converti">Converti client</option>
            <option value="sans_suite">Sans suite</option>
          </select>
          <select id="crm-filter-secteur" class="form-select" style="width:150px;">
            <option value="">Tous secteurs</option>
          </select>
          <button class="btn btn-primary" id="btn-new-prospect"><i class="ti ti-plus"></i> Nouveau prospect</button>
        </div>
      </div>

      <div id="crm-pipeline" style="margin-bottom:18px;"></div>
      <div id="crm-kpis" style="margin-bottom:18px;"></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;margin-bottom:18px;">
        <div id="crm-today"></div>
        <div id="crm-objectif"></div>
      </div>
      <div id="crm-kanban" style="margin-bottom:18px;"></div>
      <div id="crm-relations"></div>
    </section><!-- /crm -->

    <!-- Modal prospect -->
    <div id="modal-prospect" class="modal-overlay">
      <div class="modal" style="width:640px;">
        <div class="modal-header">
          <span id="modal-prospect-title">Nouveau prospect</span>
          <button class="modal-close" data-close-modal="modal-prospect"><i class="ti ti-x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="prospect-id" />
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <label class="form-group">
              <span>Nom *</span>
              <input type="text" id="prospect-nom" class="form-input" placeholder="Prénom Nom" />
            </label>
            <label class="form-group">
              <span>Entreprise</span>
              <input type="text" id="prospect-entreprise" class="form-input" placeholder="Nom entreprise" />
            </label>
            <label class="form-group">
              <span>Secteur</span>
              <input type="text" id="prospect-secteur" class="form-input" placeholder="Ex: Bien-être, Tech…" list="crm-secteur-list" />
              <datalist id="crm-secteur-list"></datalist>
            </label>
            <label class="form-group">
              <span>Statut</span>
              <select id="prospect-statut" class="form-select">
                <option value="contact">Premier contact</option>
                <option value="en_attente">En attente</option>
                <option value="positif">Positif</option>
                <option value="negatif">Négatif</option>
                <option value="proposition">Proposition envoyée</option>
                <option value="converti">Converti client</option>
                <option value="sans_suite">Sans suite</option>
              </select>
            </label>
            <label class="form-group">
              <span>Valeur estimée (€)</span>
              <input type="number" id="prospect-valeur" class="form-input" min="0" step="100" placeholder="Ex: 1800" />
            </label>
            <label class="form-group">
              <span>Email</span>
              <input type="email" id="prospect-email" class="form-input" placeholder="email@exemple.fr" />
            </label>
            <label class="form-group">
              <span>Téléphone</span>
              <input type="tel" id="prospect-telephone" class="form-input" placeholder="06 00 00 00 00" />
            </label>
            <label class="form-group">
              <span>Site web</span>
              <input type="text" id="prospect-siteweb" class="form-input" placeholder="https://…" />
            </label>
            <label class="form-group">
              <span>Date premier contact</span>
              <input type="date" id="prospect-datecontact" class="form-input" />
            </label>
          </div>
          <div style="margin-top:8px;">
            <div style="font-size:13px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Planning de relance</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
              <label class="form-group">
                <span>Date 1re relance prévue</span>
                <input type="date" id="prospect-relance1" class="form-input" />
              </label>
              <label class="form-group">
                <span>Date 2e relance prévue</span>
                <input type="date" id="prospect-relance2" class="form-input" />
              </label>
              <label class="form-group">
                <span>Date relance finale</span>
                <input type="date" id="prospect-relancefinale" class="form-input" />
              </label>
              <label class="form-group">
                <span>1re relance faite le</span>
                <input type="date" id="prospect-daterelance1" class="form-input" />
              </label>
              <label class="form-group">
                <span>2e relance faite le</span>
                <input type="date" id="prospect-daterelance2" class="form-input" />
              </label>
              <label class="form-group">
                <span>Relance finale faite le</span>
                <input type="date" id="prospect-daterelancefinale" class="form-input" />
              </label>
            </div>
          </div>
          <div style="margin-top:8px;">
            <label class="form-group">
              <span>Notes</span>
              <textarea id="prospect-notes" class="form-input" rows="3" style="resize:vertical;" placeholder="Contexte, besoins, informations utiles…"></textarea>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-close-modal="modal-prospect">Annuler</button>
          <button class="btn btn-primary" id="btn-save-prospect">Enregistrer</button>
        </div>
      </div>
    </div>
    <!-- /modal prospect -->


    <!-- ═══════════════════════════
         DEVIS
         ═══════════════════════════ -->
    <section id="section-devis" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Devis</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-2);">Devis signés = base contractuelle de tes projets et factures.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="devis-search" class="form-input" style="width:160px;" placeholder="Rechercher…" />
          <select id="devis-filter-annee" class="form-select" style="width:100px;">
            <option value="">Toutes années</option>
          </select>
          <select id="devis-filter-mois" class="form-select" style="width:120px;">
            <option value="">Tous mois</option>
            <option value="01">Janvier</option>
            <option value="02">Février</option>
            <option value="03">Mars</option>
            <option value="04">Avril</option>
            <option value="05">Mai</option>
            <option value="06">Juin</option>
            <option value="07">Juillet</option>
            <option value="08">Août</option>
            <option value="09">Septembre</option>
            <option value="10">Octobre</option>
            <option value="11">Novembre</option>
            <option value="12">Décembre</option>
          </select>
          <select id="devis-filter-statut" class="form-select" style="width:140px;">
            <option value="">Tous statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            <option value="signe">Signé</option>
            <option value="refuse">Refusé</option>
          </select>
          <button class="btn btn-primary" id="btn-new-devis"><i class="ti ti-plus"></i> Nouveau devis</button>
        </div>
      </div>
      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-signature"></i></div>
          <span class="kpi-label">Devis signés</span>
          <span class="kpi-value green" id="dv-kpi-signes">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-send"></i></div>
          <span class="kpi-label">En attente de réponse</span>
          <span class="kpi-value" id="dv-kpi-envoyes">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-trending-up"></i></div>
          <span class="kpi-label" id="dv-kpi-ca-label">CA signé total</span>
          <span class="kpi-value" id="dv-kpi-ca">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-percentage"></i></div>
          <span class="kpi-label">Taux de conversion</span>
          <span class="kpi-value" id="dv-kpi-taux">—</span>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>N° Devis</th>
                <th>Client</th>
                <th>Description</th>
                <th>Montant HT</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="devis-tbody"></tbody>
          </table>
        </div>
      </div>
    </section><!-- /devis -->


    <!-- ═══════════════════════════
         PROJETS
         ═══════════════════════════ -->
    <section id="section-projets" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Projets</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-2);" id="proj-portefeuille">Ton pipeline de chiffre d'affaires.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="projets-search" class="form-input" style="width:140px;" placeholder="Rechercher…" />
          <select id="projets-filter-client" class="form-select" style="width:160px;">
            <option value="">Tous clients</option>
          </select>
          <select id="projets-filter-annee" class="form-select" style="width:100px;">
            <option value="">Toutes années</option>
          </select>
          <select id="projets-filter-mois" class="form-select" style="width:120px;">
            <option value="">Tous mois</option>
            <option value="01">Janvier</option>
            <option value="02">Février</option>
            <option value="03">Mars</option>
            <option value="04">Avril</option>
            <option value="05">Mai</option>
            <option value="06">Juin</option>
            <option value="07">Juillet</option>
            <option value="08">Août</option>
            <option value="09">Septembre</option>
            <option value="10">Octobre</option>
            <option value="11">Novembre</option>
            <option value="12">Décembre</option>
          </select>
          <select id="projets-filter-statut" class="form-select" style="width:140px;">
            <option value="">Tous statuts</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="pause">En pause</option>
          </select>
          <button class="btn btn-primary" id="btn-new-projet"><i class="ti ti-plus"></i> Nouveau projet</button>
        </div>
      </div>
      <div class="kpi-grid kpi-grid-4 mb-16">
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-shield-check"></i></div>
          <span class="kpi-label">CA sécurisé (facturé)</span>
          <span class="kpi-value green" id="proj-kpi-actifs">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-clock"></i></div>
          <span class="kpi-label">Reste à facturer</span>
          <span class="kpi-value warning" id="proj-kpi-contrat">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-file-invoice"></i></div>
          <span class="kpi-label">Factures à émettre</span>
          <span class="kpi-value" id="proj-kpi-facture">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-hourglass"></i></div>
          <span class="kpi-label">Paiements en attente</span>
          <span class="kpi-value" id="proj-kpi-reste">—</span>
        </div>
      </div>
      <div id="proj-forecast" class="mb-24"></div>
      <div id="projets-list"></div>
    </section><!-- /projets -->


    <!-- ═══════════════════════════
         DÉPENSES PRO
         ═══════════════════════════ -->
    <section id="section-depenses" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Dépenses pro</h1>
        </div>
        <div class="page-header-right">
          <input type="text" id="depenses-search" class="form-input" style="width:190px;" placeholder="Rechercher…" />
          <select id="depenses-filter-cat" class="form-select" style="width:170px;">
            <option value="">Toutes catégories</option>
            <option value="Charges sociales">Charges sociales</option>
            <option value="Logiciels & abonnements">Logiciels &amp; abonnements</option>
            <option value="Matériel">Matériel</option>
            <option value="Formation">Formation</option>
            <option value="Communication">Communication</option>
            <option value="Déplacement">Déplacement</option>
            <option value="Comptabilité">Comptabilité</option>
            <option value="Versement perso">Versement perso</option>
            <option value="Autre">Autre</option>
          </select>
          <button class="btn btn-primary" id="btn-new-depense"><i class="ti ti-plus"></i> Ajouter</button>
        </div>
      </div>

      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon red"><i class="ti ti-receipt"></i></div>
          <span class="kpi-label">Total ce mois</span>
          <span class="kpi-value danger" id="dep-kpi-mois">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-calendar"></i></div>
          <span class="kpi-label">Total YTD</span>
          <span class="kpi-value" id="dep-kpi-ytd">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-chart-bar"></i></div>
          <span class="kpi-label">Moyenne mensuelle</span>
          <span class="kpi-value" id="dep-kpi-moyenne">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon violet"><i class="ti ti-tag"></i></div>
          <span class="kpi-label">Catégorie principale</span>
          <span class="kpi-value" style="font-size:20px;" id="dep-kpi-cat">—</span>
        </div>
      </div>

      <div class="card mb-16">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="depenses-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-donut"></i> Répartition par catégorie</div>
          <div class="chart-wrap"><canvas id="chart-dep-cat" height="200"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-bar"></i> Évolution mensuelle</div>
          <div class="chart-wrap"><canvas id="chart-dep-mois" height="200"></canvas></div>
        </div>
      </div>
    </section><!-- /depenses -->


    <!-- ═══════════════════════════
         ABONNEMENTS
         ═══════════════════════════ -->
    <section id="section-abonnements" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Charges fixes & abonnements</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-2);">Logiciels, mutuelle, loyer bureau, abonnements récurrents — tout ce qui est prélevé chaque mois.</p>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" id="btn-new-abonnement"><i class="ti ti-plus"></i> Nouvelle charge fixe</button>
        </div>
      </div>

      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon red"><i class="ti ti-calendar-repeat"></i></div>
          <span class="kpi-label">Total / mois</span>
          <span class="kpi-value danger" id="abo-kpi-mensuel">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-calendar"></i></div>
          <span class="kpi-label">Total / an</span>
          <span class="kpi-value" id="abo-kpi-annuel">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-clock"></i></div>
          <span class="kpi-label">Prochain prélèvement dans</span>
          <span class="kpi-value warning" id="abo-kpi-prochain">—</span>
          <span class="kpi-sub" id="abo-kpi-prochain-sub"></span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-check"></i></div>
          <span class="kpi-label">Abonnements actifs</span>
          <span class="kpi-value green" id="abo-kpi-count">—</span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="card mb-16">
        <div class="card-title"><i class="ti ti-timeline"></i> Timeline des prélèvements</div>
        <div class="abo-timeline">
          <canvas id="chart-abo-timeline" height="120"></canvas>
        </div>
      </div>

      <!-- Tableau -->
      <div class="card">
        <div class="card-title"><i class="ti ti-list"></i> Liste des abonnements</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Mensuel</th>
                <th>Annuel</th>
                <th>Jour prélèvement</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="abonnements-tbody"></tbody>
          </table>
        </div>
      </div>
    </section><!-- /abonnements -->


    <!-- ═══════════════════════════
         CHARGES & URSSAF
         ═══════════════════════════ -->
    <section id="section-charges-urssaf" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Charges &amp; URSSAF</h1>
          <div class="page-subtitle">Micro-BNC · 25,6% URSSAF + 0,2% CFP · PAS fixe 40€/mois</div>
        </div>
      </div>

      <div class="card-title" style="margin-bottom:12px;"><i class="ti ti-calendar-due"></i> URSSAF trimestrielle 2026</div>
      <div class="urssaf-grid mb-24" id="urssaf-cards-grid"></div>

      <!-- Charges mensuelles récap -->
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><i class="ti ti-list"></i> Charges ce mois</div>
          <div class="charges-recap" id="charges-recap-list"></div>
        </div>
        <div class="card">
          <div class="card-title"><i class="ti ti-receipt"></i> Dépenses pro ce mois</div>
          <div id="charges-depenses-mois"></div>
        </div>
      </div>

      <!-- Card totale -->
      <div class="result-card mt-lg" id="charges-result-card" style="margin-top:16px;">
        <div class="result-card-item">
          <div class="result-card-label">CA ce mois</div>
          <div class="result-card-value" id="cru-ca">—</div>
        </div>
        <div class="result-card-item">
          <div class="result-card-label">Total charges + dépenses</div>
          <div class="result-card-value" id="cru-charges">—</div>
        </div>
        <div class="result-card-item">
          <div class="result-card-label">Résultat net</div>
          <div class="result-card-value" id="cru-net">—</div>
        </div>
        <div class="result-card-item">
          <div class="result-card-label">À verser (65%)</div>
          <div class="result-card-value" id="cru-versement">—</div>
        </div>
      </div>
    </section><!-- /charges-urssaf -->


    <!-- ═══════════════════════════
         OBJECTIFS ÉPARGNE
         ═══════════════════════════ -->
    <section id="section-objectifs-epargne" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Mes objectifs</h1>
          <div class="page-subtitle">Ton cap financier, en un coup d'œil</div>
        </div>
        <div class="page-header-right" style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="openObjectifsPilotage()"><i class="ti ti-adjustments"></i> Définir mes objectifs</button>
          <button class="btn btn-primary" id="btn-new-objectif-epargne"><i class="ti ti-plus"></i> Nouvel objectif d'épargne</button>
        </div>
      </div>
      <div id="objectifs-pilotage" style="margin-bottom:22px;"></div>
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-2);margin:0 2px 12px;">Objectifs d'épargne</div>
      <div class="goals-grid" id="epargne-goals-grid"></div>
    </section><!-- /objectifs-epargne -->

    <!-- Modal définir mes objectifs -->
    <div class="modal-overlay" id="modal-objectifs-pilotage" style="display:none;">
      <div class="modal" style="max-width:420px;">
        <div class="modal-header">
          <div class="modal-title">Définir mes objectifs</div>
          <button class="modal-close" onclick="q('#modal-objectifs-pilotage').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:16px;">
          <div>
            <label class="form-label">Objectif de CA annuel (€)</label>
            <input class="form-control" type="number" id="obj-ca" min="0" step="1000" placeholder="Ex: 60000">
          </div>
          <div>
            <label class="form-label">Matelas de trésorerie visé (€)</label>
            <input class="form-control" type="number" id="obj-treso" min="0" step="500" placeholder="Ex: 10000">
          </div>
          <div>
            <label class="form-label">Mois de sécurité visés</label>
            <input class="form-control" type="number" id="obj-mois-secu" min="0" max="24" step="1" placeholder="3">
            <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Combien de mois de charges tu veux pouvoir tenir sans rentrée d'argent.</div>
          </div>
          <div>
            <label class="form-label">Revenus récurrents visés (€ / mois)</label>
            <input class="form-control" type="number" id="obj-recurrent" min="0" step="100" placeholder="Ex: 2000">
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-objectifs-pilotage').style.display='none'">Annuler</button>
            <button class="btn btn-primary" onclick="saveObjectifsPilotage()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>


    <!-- ═══════════════════════════
         PRÉVISION FIN D'ANNÉE
         ═══════════════════════════ -->
    <section id="section-rapport-prevision" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Prévisions &amp; scénarios</h1>
          <div class="page-subtitle">Ton GPS financier : où tu vas finir l'année, ce qu'il te reste à signer, et quoi faire ensuite.</div>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" id="btn-prev-gen"><i class="ti ti-refresh"></i> Recalculer</button>
        </div>
      </div>
      <div id="rapport-prevision-content"></div>
    </section><!-- /rapport-prevision -->


    <!-- ═══════════════════════════
         RAPPORT MENSUEL
         ═══════════════════════════ -->
    <section id="section-rapport-mensuel" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Rapport mensuel</h1>
        </div>
        <div class="page-header-right">
          <div class="month-selector">
            <select id="rm-mois" class="form-select" style="width:140px;">
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
            <select id="rm-annee" class="form-select" style="width:100px;"></select>
            <button class="btn btn-secondary" id="btn-rm-gen"><i class="ti ti-refresh"></i> Générer</button>
          </div>
        </div>
      </div>
      <div id="rapport-mensuel-content"></div>
    </section><!-- /rapport-mensuel -->


    <!-- ═══════════════════════════
         RAPPORT TRIMESTRIEL
         ═══════════════════════════ -->
    <section id="section-rapport-trimestriel" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Rapport trimestriel</h1>
          <div class="page-subtitle">CA, charges et URSSAF par trimestre · échéances de paiement</div>
        </div>
        <div class="page-header-right">
          <select id="rt-annee" class="form-select" style="width:100px;"></select>
          <button class="btn btn-secondary" id="btn-rt-gen"><i class="ti ti-refresh"></i> Générer</button>
        </div>
      </div>
      <div id="rapport-trimestriel-content"></div>
    </section><!-- /rapport-trimestriel -->


    <!-- ═══════════════════════════
         RAPPORT ANNUEL
         ═══════════════════════════ -->
    <section id="section-rapport-annuel" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Rapport annuel</h1>
        </div>
        <div class="page-header-right">
          <select id="ra-annee" class="form-select" style="width:100px;"></select>
          <button class="btn btn-secondary" id="btn-ra-gen"><i class="ti ti-refresh"></i> Générer</button>
        </div>
      </div>
      <div id="rapport-annuel-content"></div>
    </section><!-- /rapport-annuel -->


    <!-- ═══════════════════════════
         RAPPORT FISCAL BNC
         ═══════════════════════════ -->
    <section id="section-rapport-fiscal" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Rapport fiscal BNC</h1>
          <div class="page-subtitle">Micro-BNC · Abattement forfaitaire 34% · Plafond 77 700€</div>
        </div>
        <div class="page-header-right">
          <select id="rf-annee" class="form-select" style="width:100px;"></select>
          <button class="btn btn-secondary" id="btn-rf-gen"><i class="ti ti-refresh"></i> Générer</button>
        </div>
      </div>
      <div id="rapport-fiscal-content"></div>
    </section><!-- /rapport-fiscal -->


    <!-- ═══════════════════════════
         SIMULATEUR
         ═══════════════════════════ -->
    <section id="section-simulateur" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Simulateur</h1>
          <div class="page-subtitle">Versement net · et « Mon TJM » : ton tarif calculé sur ta vraie situation financière.</div>
        </div>
      </div>

      <div class="sim-tabs">
        <button class="sim-tab active" data-sim="mensuel">Mensuel</button>
        <button class="sim-tab" data-sim="trimestriel">Trimestriel</button>
        <button class="sim-tab" data-sim="annuel">Annuel</button>
        <button class="sim-tab" data-sim="tjm">Mon TJM</button>
        <button class="sim-tab" data-sim="renta">Rentabilité projet</button>
        <button class="sim-tab" data-sim="chiffrage">Chiffrer un devis</button>
      </div>

      <!-- Panneau Chiffrage (projet → prix) -->
      <div id="sim-panel-chiffrage" class="sim-panel">
        <div class="grid-2">
          <div id="ch-builder"></div>
          <div id="sim-chiffrage-result"></div>
        </div>
      </div>

      <!-- Panneau Rentabilité projet -->
      <div id="sim-panel-renta" class="sim-panel">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Ce projet est-il rentable ?</div>
            <div class="form-group">
              <label class="form-label">Nom du projet (optionnel)</label>
              <input type="text" id="renta-nom" class="form-input" placeholder="Ex: Identité visuelle" oninput="renderRentaProjet()" />
            </div>
            <div class="form-group">
              <label class="form-label">Prix proposé (€ HT)</label>
              <input type="number" id="renta-prix" class="form-input" min="0" step="50" placeholder="Ex: 1800" oninput="renderRentaProjet()" />
            </div>
            <div class="form-group">
              <label class="form-label">Temps estimé (jours)</label>
              <input type="number" id="renta-jours" class="form-input" min="0" step="0.5" placeholder="Ex: 5" oninput="renderRentaProjet()" />
            </div>
            <div class="form-group">
              <label class="form-label">Sous-traitance (€)</label>
              <input type="number" id="renta-st" class="form-input" min="0" step="50" placeholder="0" oninput="renderRentaProjet()" />
            </div>
            <div class="form-group">
              <label class="form-label">Frais / achats (€)</label>
              <input type="number" id="renta-frais" class="form-input" min="0" step="10" placeholder="0" oninput="renderRentaProjet()" />
            </div>
          </div>
          <div id="sim-renta-result"></div>
        </div>
      </div>

      <!-- Panneau TJM / modèle économique -->
      <div id="sim-panel-tjm" class="sim-panel">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Ton modèle économique</div>
            <div class="form-group">
              <label class="form-label">Salaire net souhaité (€ / mois)</label>
              <input type="number" id="tjm-salaire" class="form-input" min="0" step="50" oninput="renderTJM()" placeholder="Ex: 1800" />
              <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Ce que tu veux te verser pour vivre.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Épargne souhaitée (€ / mois)</label>
              <input type="number" id="tjm-epargne" class="form-input" min="0" step="50" oninput="renderTJM()" placeholder="Ex: 300" />
            </div>
            <div class="form-group">
              <label class="form-label">Jours facturables / an</label>
              <input type="number" id="tjm-jours" class="form-input" min="1" max="300" step="1" oninput="renderTJM()" value="145" />
              <div style="font-size:12px;color:var(--text-2);margin-top:4px;">Jours réellement facturés (hors congés, admin, prospection). ~220 jours ouvrés − vacances − jours non facturés.</div>
            </div>
          </div>
          <div id="sim-tjm-result"></div>
        </div>
      </div>

      <!-- Panneau Mensuel -->
      <div id="sim-panel-mensuel" class="sim-panel active">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Saisir les données du mois</div>
            <div class="form-group">
              <label class="form-label">CA du mois (€)</label>
              <input type="number" id="sim-ca-mois" class="form-input" value="3000" min="0" step="100" />
            </div>
            <div class="form-group">
              <label class="form-label">Dépenses pro (€)</label>
              <input type="number" id="sim-dep-pro" class="form-input" value="200" min="0" step="10" />
            </div>
            <div class="form-group">
              <label class="form-label">CFE annuelle (€) — divisée par 12</label>
              <input type="number" id="sim-cfe" class="form-input" value="0" min="0" />
            </div>
            <div class="divider"></div>
            <div class="card-title" style="margin-bottom:8px;">Budget personnel (optionnel)</div>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Aides (CAF, prime)</label>
                <input type="number" id="sim-aides" class="form-input" value="0" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Dépenses perso (€)</label>
                <input type="number" id="sim-dep-perso" class="form-input" value="0" min="0" />
              </div>
            </div>
            <div class="form-group" style="margin-top:8px;">
              <div class="slider-wrap">
                <div class="slider-header">
                  <span class="slider-label">% que je me verse</span>
                  <span class="slider-value" id="sim-slider-val">65%</span>
                </div>
                <input type="range" id="sim-versement-slider" min="30" max="100" value="65" step="1" />
              </div>
            </div>
            <button class="btn btn-primary" style="margin-top:12px;" id="btn-sim-calculer">
              <i class="ti ti-calculator"></i> Calculer
            </button>
          </div>

          <div id="sim-result-mensuel">
            <div class="sim-result" style="display:none;" id="sim-result-panel-mensuel">
              <span class="sim-section-label">Calcul</span>
              <div class="sim-line">
                <span class="sim-line-label strong">CA HT</span>
                <span class="sim-line-amount" id="sr-ca">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label" id="sr-urssaf-label">— URSSAF (25,6%)</span>
                <span class="sim-line-amount neg" id="sr-urssaf">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label" id="sr-cfp-label">— CFP (0,2%)</span>
                <span class="sim-line-amount neg" id="sr-cfp">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">— Dépenses pro</span>
                <span class="sim-line-amount neg" id="sr-dep">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">— CFE mensuelle</span>
                <span class="sim-line-amount neg" id="sr-cfe">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label" id="sr-pas-label">— PAS mensuel (40€)</span>
                <span class="sim-line-amount neg" id="sr-pas">—</span>
              </div>
              <div class="sim-line sim-total">
                <span class="sim-line-label">= Résultat net</span>
                <span class="sim-line-amount" id="sr-net">—</span>
              </div>
              <span class="sim-section-label">Répartition</span>
              <div class="sim-line">
                <span class="sim-line-label" id="sr-vers-label">Je me verse (65%)</span>
                <span class="sim-line-amount pos" id="sr-versement">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">Épargne (15%)</span>
                <span class="sim-line-amount" id="sr-epargne">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">Trésorerie (20%)</span>
                <span class="sim-line-amount" id="sr-treso">—</span>
              </div>
              <div id="sr-budget-perso" style="display:none;">
                <span class="sim-section-label">Budget global</span>
                <div class="sim-line">
                  <span class="sim-line-label">Versement + aides</span>
                  <span class="sim-line-amount" id="sr-bg-entrees">—</span>
                </div>
                <div class="sim-line">
                  <span class="sim-line-label">— Dépenses perso</span>
                  <span class="sim-line-amount neg" id="sr-bg-depenses">—</span>
                </div>
                <div class="sim-line sim-total">
                  <span class="sim-line-label">Reste disponible</span>
                  <span class="sim-line-amount" id="sr-bg-reste">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau Trimestriel -->
      <div id="sim-panel-trimestriel" class="sim-panel">
        <div class="grid-2">
          <div class="card">
            <div class="card-title">Données du trimestre</div>
            <div class="form-group">
              <label class="form-label">CA mois 1 (€)</label>
              <input type="number" id="sim-t-m1" class="form-input" value="3000" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">CA mois 2 (€)</label>
              <input type="number" id="sim-t-m2" class="form-input" value="3500" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">CA mois 3 (€)</label>
              <input type="number" id="sim-t-m3" class="form-input" value="3200" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Dépenses pro du trimestre (€)</label>
              <input type="number" id="sim-t-dep" class="form-input" value="600" min="0" />
            </div>
            <button class="btn btn-primary" style="margin-top:4px;" id="btn-sim-trim">
              <i class="ti ti-calculator"></i> Calculer
            </button>
          </div>
          <div id="sim-result-trim">
            <div class="sim-result" style="display:none;" id="sim-result-panel-trim">
              <div class="sim-line">
                <span class="sim-line-label strong">CA trimestriel</span>
                <span class="sim-line-amount" id="srt-ca">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">— URSSAF + CFP</span>
                <span class="sim-line-amount neg" id="srt-cotis">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">— Dépenses pro</span>
                <span class="sim-line-amount neg" id="srt-dep">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">— PAS (3 mois)</span>
                <span class="sim-line-amount neg" id="srt-pas">—</span>
              </div>
              <div class="sim-line sim-total">
                <span class="sim-line-label">= Résultat net</span>
                <span class="sim-line-amount" id="srt-net">—</span>
              </div>
              <span class="sim-section-label">URSSAF à payer ce trimestre</span>
              <div class="sim-line">
                <span class="sim-line-label">Montant URSSAF dû</span>
                <span class="sim-line-amount neg" id="srt-urssaf-du">—</span>
              </div>
              <div class="sim-line">
                <span class="sim-line-label">Provision mensuelle recommandée</span>
                <span class="sim-line-amount" id="srt-provision">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau Annuel -->
      <div id="sim-panel-annuel" class="sim-panel">
        <div class="card mb-16">
          <div class="card-title">Données de base</div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">CA mensuel moyen (€)</label>
              <input type="number" id="sim-a-ca" class="form-input" value="4000" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Dépenses mensuelles (€)</label>
              <input type="number" id="sim-a-dep" class="form-input" value="300" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">CFE annuelle (€)</label>
              <input type="number" id="sim-a-cfe" class="form-input" value="0" min="0" />
            </div>
          </div>
          <button class="btn btn-primary" id="btn-sim-annuel"><i class="ti ti-calculator"></i> Projeter</button>
        </div>
        <div id="sim-result-annuel"></div>
      </div>
    </section><!-- /simulateur -->


    <!-- ═══════════════════════════
         IMPORT / EXPORT
         ═══════════════════════════ -->
    <section id="section-import-export" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Import / Export</h1>
          <div class="page-subtitle">Format CSV Indy</div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Import -->
        <div class="card">
          <div class="card-title"><i class="ti ti-upload"></i> Import CSV</div>

          <div class="sim-tabs" style="margin-bottom:20px;">
            <button class="sim-tab active" data-ie-tab="factures">Factures</button>
            <button class="sim-tab" data-ie-tab="depenses">Dépenses</button>
          </div>

          <!-- Import factures -->
          <div id="ie-panel-factures" class="sim-panel active">
            <div class="file-drop" id="drop-factures">
              <i class="ti ti-file-upload"></i>
              <p>Glissez un fichier CSV ou
                <label for="file-factures-csv" style="color:var(--navy);cursor:pointer;text-decoration:underline;">parcourir</label>
              </p>
              <p style="font-size:12px;margin-top:6px;opacity:0.6;">Colonnes : date, numero, client, description, montant, statut</p>
            </div>
            <input type="file" id="file-factures-csv" accept=".csv" style="display:none;" />
            <div id="import-factures-preview" style="display:none;margin-top:12px;"></div>
            <button class="btn btn-primary" id="btn-import-factures" style="display:none;margin-top:10px;">
              <i class="ti ti-upload"></i> Importer
            </button>
          </div>

          <!-- Import dépenses -->
          <div id="ie-panel-depenses" class="sim-panel">
            <div class="file-drop" id="drop-depenses">
              <i class="ti ti-file-upload"></i>
              <p>Glissez un fichier CSV ou
                <label for="file-depenses-csv" style="color:var(--navy);cursor:pointer;text-decoration:underline;">parcourir</label>
              </p>
              <p style="font-size:12px;margin-top:6px;opacity:0.6;">Colonnes : date, description, categorie, montant</p>
            </div>
            <input type="file" id="file-depenses-csv" accept=".csv" style="display:none;" />
            <div id="import-depenses-preview" style="display:none;margin-top:12px;"></div>
            <button class="btn btn-primary" id="btn-import-depenses" style="display:none;margin-top:10px;">
              <i class="ti ti-upload"></i> Importer
            </button>
          </div>
        </div>

        <!-- Export -->
        <div class="card">
          <div class="card-title"><i class="ti ti-download"></i> Export CSV</div>
          <p style="font-size:14px;color:var(--text-2);margin-bottom:16px;">Télécharger vos données en CSV.</p>
          <div class="export-list">
            <button class="export-btn" data-export="factures">
              <i class="ti ti-file-spreadsheet"></i> Factures
            </button>
            <button class="export-btn" data-export="depenses">
              <i class="ti ti-file-spreadsheet"></i> Dépenses
            </button>
            <button class="export-btn" data-export="transactions">
              <i class="ti ti-file-spreadsheet"></i> Transactions
            </button>
            <button class="export-btn" data-export="rapport-mensuel">
              <i class="ti ti-file-spreadsheet"></i> Rapport mensuel
            </button>
          </div>
        </div>
      </div>
    </section><!-- /import-export -->


    <!-- ═══════════════════════════
         OPTIONS
         ═══════════════════════════ -->
    <section id="section-options" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Options</h1>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" id="btn-save-options"><i class="ti ti-check"></i> Enregistrer</button>
        </div>
      </div>

      <div class="grid-2">
        <!-- Profil -->
        <div class="card">
          <div class="card-title"><i class="ti ti-user"></i> Profil</div>
          <div class="form-group">
            <label class="form-label">Nom affiché</label>
            <input type="text" id="opt-nom" class="form-input" value="Cindy" />
          </div>
          <div class="form-group">
            <label class="form-label">Entreprise</label>
            <input type="text" id="opt-entreprise" class="form-input" value="Seed to Bloom" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="opt-email" class="form-input" value="contact@seedtobloom.fr" />
          </div>
          <div class="form-group">
            <label class="form-label">Objectif CA annuel (€)</label>
            <input type="number" id="opt-objectif-ca" class="form-input" value="60000" min="0" step="1000" />
          </div>
        </div>

        <!-- Taux -->
        <div class="card">
          <div class="card-title"><i class="ti ti-percentage"></i> Taux &amp; cotisations</div>
          <div class="form-group">
            <label class="form-label">Taux URSSAF (%)</label>
            <input type="number" id="opt-urssaf" class="form-input" value="25.6" step="0.1" min="0" />
            <span style="font-size:13px;color:var(--text-2);">Cotisations sociales micro-BNC (25,6% par défaut 2026)</span>
          </div>
          <div class="form-group">
            <label class="form-label">Taux CFP (%)</label>
            <input type="number" id="opt-cfp" class="form-input" value="0.2" step="0.01" min="0" />
            <span style="font-size:13px;color:var(--text-2);">Contribution à la Formation Professionnelle (0,2%)</span>
          </div>
          <div class="form-group">
            <label class="form-label">PAS mensuel (€)</label>
            <input type="number" id="opt-pas" class="form-input" value="40" step="1" min="0" />
            <span style="font-size:13px;color:var(--text-2);">Prélèvement à la Source — impôt prélevé automatiquement chaque mois par les impôts (montant sur ton avis d'imposition)</span>
          </div>
          <div class="form-group">
            <label class="form-label">CFE annuelle (€)</label>
            <input type="number" id="opt-cfe" class="form-input" value="0" step="10" min="0" />
            <span style="font-size:13px;color:var(--text-2);">Cotisation Foncière des Entreprises — prélevée en décembre, répartie sur 12 mois dans les calculs</span>
          </div>
          <div class="form-group">
            <label class="form-label">Délai de paiement factures (jours)</label>
            <input type="number" id="opt-delai-paiement" class="form-input" value="30" step="1" min="1" />
            <span style="font-size:13px;color:var(--text-2);">Pré-remplit automatiquement la date d'échéance à J+ ce délai lors de la création d'une facture</span>
          </div>
          <div class="form-group">
            <label class="form-label">Solde Qonto initial (€)</label>
            <input type="number" id="opt-qonto-solde-initial" class="form-input" value="0" step="0.01" />
            <span style="font-size:13px;color:var(--text-2);">Solde du compte Qonto Pro à la date de départ ci-dessous</span>
          </div>
          <div class="form-group">
            <label class="form-label">Date de départ du calcul Qonto</label>
            <input type="date" id="opt-qonto-date-debut" class="form-input" value="2026-01-01" />
          </div>
          <div class="form-group">
            <label class="form-label">Enveloppe Formation (% du net après charges)</label>
            <input type="number" id="opt-pct-formation" class="form-input" value="10" min="0" max="100" step="1" />
            <span style="font-size:13px;color:var(--text-2);">Le reste est réparti entre trésorerie, versement et épargne selon tes pourcentages ci-dessous</span>
          </div>
        </div>

        <!-- Charges fixes -->
        <div class="card">
          <div class="card-title"><i class="ti ti-repeat"></i> Charges fixes mensuelles</div>
          <p style="font-size:14px;color:var(--text-2);margin:0 0 12px;">Logiciels, mutuelle, loyer bureau, abonnements récurrents… Gère-les dans l'onglet dédié pour qu'ils soient inclus dans tes calculs.</p>
          <button class="btn btn-secondary" onclick="navigate('abonnements')"><i class="ti ti-arrow-right"></i> Gérer les charges fixes</button>
        </div>

        <!-- Répartition -->
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-pie"></i> Répartition du résultat net (%)</div>
          <div class="form-group">
            <label class="form-label">% versement (défaut 65)</label>
            <input type="number" id="opt-versement" class="form-input" value="65" min="0" max="100" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">% épargne (défaut 15)</label>
            <input type="number" id="opt-epargne-pct" class="form-input" value="15" min="0" max="100" step="1" />
          </div>
          <div class="form-group">
            <label class="form-label">% trésorerie (défaut 20)</label>
            <input type="number" id="opt-tresorerie-pct" class="form-input" value="20" min="0" max="100" step="1" />
          </div>
          <div id="opt-total-alerte" style="font-size:14px;"></div>
        </div>

        <!-- Mot de passe -->
        <div class="card">
          <div class="card-title"><i class="ti ti-lock"></i> Changer le mot de passe</div>
          <div class="form-group">
            <label class="form-label">Mot de passe actuel</label>
            <input type="password" id="opt-pwd-actuel" class="form-input" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="form-group">
            <label class="form-label">Nouveau mot de passe</label>
            <input type="password" id="opt-pwd-nouveau" class="form-input" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirmer le nouveau</label>
            <input type="password" id="opt-pwd-confirm" class="form-input" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <button class="btn btn-secondary" id="btn-change-pwd"><i class="ti ti-lock"></i> Changer le mot de passe</button>
        </div>
      </div>
    </section><!-- /options -->

  </main>
</div><!-- /app -->

<!-- ═══════════════════════════════════════
     MODALS
     ═══════════════════════════════════════ -->

<!-- Modal Facture -->
<div id="modal-facture" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-facture-title">Nouvelle facture</span>
      <button class="modal-close" data-close-modal="modal-facture"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">N° Facture *</label>
        <input type="text" id="f-numero" class="form-input" placeholder="F2026-001" />
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select id="f-statut" class="form-select">
          <option value="attente">En attente</option>
          <option value="payee">Payée</option>
          <option value="retard">En retard</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Client *</label>
      <select id="f-client" class="form-select" oninput="onFactureClientChange()">
        <option value="">— Sélectionner un client —</option>
      </select>
      <span style="font-size:13px;color:var(--text-2);">Client non listé ? <a href="#" onclick="navigate('tiers');closeModal('modal-facture');return false;">Ajouter un tiers</a></span>
    </div>
    <div class="form-group">
      <label class="form-label">Projet lié <span style="font-weight:400;color:var(--text-2);">(optionnel)</span></label>
      <select id="f-projet-id" class="form-select" oninput="onFactureProjetChange()">
        <option value="">— Aucun projet —</option>
      </select>
      <!-- Bloc contextuel devis + avancement -->
      <div id="f-projet-context" style="display:none;margin-top:8px;padding:10px 12px;background:#f5f3ef;border-radius:8px;border-left:3px solid #E4F0FF;font-size:13px;line-height:1.7;"></div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Type de facture</label>
        <select id="f-type-facture" class="form-select">
          <option value="standard">Standard</option>
          <option value="acompte">Acompte</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="solde">Solde</option>
          <option value="mensuel">Mensuel</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Montant HT (€) *</label>
        <input type="number" id="f-montant" class="form-input" step="0.01" min="0" placeholder="0.00" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input type="text" id="f-description" class="form-input" placeholder="Prestation graphique…" />
    </div>
    <input type="hidden" id="f-projet" value="" />
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date d'émission *</label>
        <input type="date" id="f-date" class="form-input" oninput="onFactureDateChange()" />
      </div>
      <div class="form-group">
        <label class="form-label">Date d'échéance</label>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px;">
          <input type="number" id="f-delai" class="form-input" style="width:72px;" min="1" placeholder="30" oninput="onFactureDelaiChange()" />
          <span style="font-size:13px;color:var(--text-2);white-space:nowrap;">jours après émission</span>
        </div>
        <input type="date" id="f-date-echeance" class="form-input" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Date de paiement réel</label>
      <input type="date" id="f-date-paiement" class="form-input" />
      <span style="font-size:12px;color:var(--text-2);">À remplir quand tu reçois le virement · utilisée pour le calcul URSSAF</span>
    </div>
    <div class="form-group">
      <label class="form-label">PDF (facture Indy)</label>
      <div style="display:flex;align-items:center;gap:10px;">
        <button type="button" class="pdf-btn vide" id="f-pdf-btn">
          <i class="ti ti-paperclip"></i> Attacher un PDF
        </button>
        <span id="f-pdf-name" style="font-size:13px;color:var(--text-2);"></span>
      </div>
      <input type="file" id="f-pdf-file" accept=".pdf" style="display:none;" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-facture">Annuler</button>
      <button class="btn btn-primary" id="btn-save-facture">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal PDF Preview -->
<div id="modal-pdf-preview" class="modal-overlay">
  <div class="modal modal-lg" style="max-height:90vh;display:flex;flex-direction:column;">
    <div class="modal-header" style="flex-shrink:0;">
      <span class="modal-title" id="modal-pdf-title">Aperçu PDF</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <a id="modal-pdf-download" class="btn btn-secondary btn-sm" download><i class="ti ti-download"></i> Télécharger</a>
        <button class="modal-close" data-close-modal="modal-pdf-preview"><i class="ti ti-x"></i></button>
      </div>
    </div>
    <iframe id="modal-pdf-frame" src="" style="flex:1;border:none;width:100%;min-height:70vh;border-radius:0 0 12px 12px;"></iframe>
  </div>
</div>

<!-- Modal Tiers -->
<div id="modal-tiers" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-tiers-title">Nouveau tiers</span>
      <button class="modal-close" data-close-modal="modal-tiers"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Nom *</label>
        <input type="text" id="ti-nom" class="form-input" placeholder="Acme Studio" />
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select id="ti-type" class="form-select">
          <option value="client">Client</option>
          <option value="fournisseur">Fournisseur</option>
          <option value="prestataire">Prestataire</option>
        </select>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" id="ti-email" class="form-input" placeholder="contact@acme.fr" />
      </div>
      <div class="form-group">
        <label class="form-label">SIRET</label>
        <input type="text" id="ti-siret" class="form-input" placeholder="XXX XXX XXX XXXXX" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Adresse</label>
      <input type="text" id="ti-adresse" class="form-input" placeholder="1 rue de la Paix, 75001 Paris" />
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea id="ti-notes" class="form-input" rows="2" placeholder="Notes libres…" style="resize:vertical;"></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-tiers">Annuler</button>
      <button class="btn btn-primary" id="btn-save-tiers">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Projet -->
<div id="modal-projet" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-projet-title">Nouveau projet</span>
      <button class="modal-close" data-close-modal="modal-projet"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Devis signé (optionnel)</label>
      <select id="pr-devis-id" class="form-select" oninput="onProjetDevisChange()">
        <option value="">— Aucun devis lié —</option>
      </select>
      <span style="font-size:13px;color:var(--text-2);">Sélectionne un devis signé pour pré-remplir le montant.</span>
    </div>
    <div class="form-group">
      <label class="form-label">Nom du projet *</label>
      <input type="text" id="pr-nom" class="form-input" placeholder="Partenaire Créative — Studio X" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Client</label>
        <select id="pr-client" class="form-select">
          <option value="">— Sélectionner —</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select id="pr-statut" class="form-select">
          <option value="en_cours">En cours</option>
          <option value="pause">En pause</option>
          <option value="termine">Terminé</option>
        </select>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Type de facturation</label>
        <select id="pr-type" class="form-select" oninput="onProjetTypeChange()">
          <option value="unique">Facture unique</option>
          <option value="echelonne">Échelonné (acompte + jalons + solde)</option>
          <option value="mensuel">Mensuel</option>
        </select>
      </div>
      <div class="form-group" id="pr-nb-mois-group" style="display:none;">
        <label class="form-label">Nombre de mois</label>
        <div style="display:flex;align-items:center;gap:12px;">
          <input type="number" id="pr-nb-mois" class="form-input" min="1" max="60" value="6" oninput="onProjetMontantChange()" style="flex:1;" />
          <label style="display:flex;align-items:center;gap:6px;white-space:nowrap;font-size:14px;cursor:pointer;">
            <input type="checkbox" id="pr-indetermine" onchange="onProjetIndetermineChange()" />
            Durée indéterminée
          </label>
        </div>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Montant total HT (€) *</label>
        <input type="number" id="pr-montant" class="form-input" step="0.01" min="0" placeholder="3000.00" oninput="onProjetMontantChange()" />
      </div>
      <div class="form-group" id="pr-montant-mois-group" style="display:none;">
        <label class="form-label">Montant mensuel</label>
        <input type="text" id="pr-montant-mois" class="form-input" readonly style="background:#f5f3ef;color:#6b533b;" placeholder="—" />
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date de début</label>
        <input type="date" id="pr-date-debut" class="form-input" oninput="onProjetMontantChange()" />
      </div>
      <div class="form-group">
        <label class="form-label">Date de fin (optionnelle)</label>
        <input type="date" id="pr-date-fin" class="form-input" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea id="pr-notes" class="form-input" rows="2" placeholder="Détails, conditions…" style="resize:vertical;"></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-projet">Annuler</button>
      <button class="btn btn-primary" id="btn-save-projet">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Devis -->
<div id="modal-devis" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-devis-title">Nouveau devis</span>
      <button class="modal-close" data-close-modal="modal-devis"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">N° Devis *</label>
        <input type="text" id="dv-numero" class="form-input" placeholder="D2026-001" />
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select id="dv-statut" class="form-select">
          <option value="brouillon">Brouillon</option>
          <option value="envoye">Envoyé</option>
          <option value="signe">Signé </option>
          <option value="refuse">Refusé</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Client *</label>
      <select id="dv-client" class="form-select">
        <option value="">— Sélectionner un client —</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Objet / description</label>
      <input type="text" id="dv-description" class="form-input" placeholder="Identité visuelle, site web…" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date d'émission *</label>
        <input type="date" id="dv-date" class="form-input" oninput="onDevisDateChange()" />
      </div>
      <div class="form-group">
        <label class="form-label">Date d'expiration</label>
        <input type="date" id="dv-date-expiration" class="form-input" />
        <span style="font-size:12px;color:var(--text-2);">Pré-remplie à J+30</span>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Montant HT (€) *</label>
      <input type="number" id="dv-montant" class="form-input" step="0.01" min="0" placeholder="0.00" />
    </div>
    <div class="form-group">
      <label class="form-label">PDF du devis</label>
      <div style="display:flex;align-items:center;gap:10px;">
        <button type="button" class="pdf-btn vide" id="dv-pdf-btn">
          <i class="ti ti-paperclip"></i> Attacher un PDF
        </button>
        <span id="dv-pdf-name" style="font-size:13px;color:var(--text-2);"></span>
      </div>
      <input type="file" id="dv-pdf-file" accept=".pdf" style="display:none;" />
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea id="dv-notes" class="form-input" rows="2" placeholder="Conditions, délais…" style="resize:vertical;"></textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-devis">Annuler</button>
      <button class="btn btn-primary" id="btn-save-devis">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Dépense -->
<div id="modal-depense" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <span class="modal-title" id="modal-depense-title">Nouvelle dépense</span>
      <button class="modal-close" data-close-modal="modal-depense"><i class="ti ti-x"></i></button>
    </div>
    <!-- Toggle ponctuel / mensuel -->
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <button id="d-type-ponctuel" class="btn btn-primary btn-sm" onclick="onDepenseTypeChange('ponctuel')">Ponctuelle</button>
      <button id="d-type-mensuel" class="btn btn-secondary btn-sm" onclick="onDepenseTypeChange('mensuel')">Mensuelle (récurrente)</button>
    </div>
    <!-- Date ponctuelle -->
    <div id="d-zone-ponctuel">
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input type="date" id="d-date" class="form-input" />
      </div>
    </div>
    <!-- Dates mensuel -->
    <div id="d-zone-mensuel" style="display:none;">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label">Date de début *</label>
          <input type="date" id="d-date-debut" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Date de fin *</label>
          <input type="date" id="d-date-fin" class="form-input" />
        </div>
      </div>
      <p style="font-size:13px;color:var(--text-2);margin-bottom:12px;">Une entrée sera créée par mois entre ces deux dates.</p>
    </div>
    <div class="form-group">
      <label class="form-label">Catégorie</label>
      <select id="d-categorie" class="form-select">
        <option>Charges sociales</option>
        <option>Logiciels &amp; abonnements</option>
        <option>Matériel</option>
        <option>Formation</option>
        <option>Sous-traitance</option>
        <option>Communication</option>
        <option>Déplacement</option>
        <option>Comptabilité</option>
        <option>Versement perso</option>
        <option>Autre</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Description *</label>
      <input type="text" id="d-description" class="form-input" placeholder="Achat Adobe CC…" />
    </div>
    <div class="form-group">
      <label class="form-label" id="d-montant-label">Montant mensuel (€) *</label>
      <input type="number" id="d-montant" class="form-input" step="0.01" min="0" placeholder="0.00" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-depense">Annuler</button>
      <button class="btn btn-primary" id="btn-save-depense">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Abonnement -->
<div id="modal-abonnement" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-abonnement-title">Nouvel abonnement</span>
      <button class="modal-close" data-close-modal="modal-abonnement"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Nom *</label>
      <input type="text" id="abo-nom" class="form-input" placeholder="Adobe Creative Cloud" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Montant mensuel (€) *</label>
        <input type="number" id="abo-montant" class="form-input" step="0.01" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Jour prélèvement</label>
        <input type="number" id="abo-jour" class="form-input" min="1" max="31" placeholder="1" />
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select id="abo-categorie" class="form-select">
          <option>Logiciels</option>
          <option>Hébergement</option>
          <option>Communication</option>
          <option>Comptabilité</option>
          <option>Autre</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select id="abo-statut" class="form-select">
          <option value="actif">Actif</option>
          <option value="pause">Pausé</option>
          <option value="annule">Annulé</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-abonnement">Annuler</button>
      <button class="btn btn-primary" id="btn-save-abonnement">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Compte -->
<div id="modal-compte" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-compte-title">Nouveau compte</span>
      <button class="modal-close" data-close-modal="modal-compte"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Nom *</label>
      <input type="text" id="cpt-nom" class="form-input" placeholder="Qonto Pro" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Type</label>
        <select id="cpt-type" class="form-select">
          <option value="professionnel">Professionnel</option>
          <option value="personnel">Personnel</option>
          <option value="epargne">Épargne</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Solde (€)</label>
        <input type="number" id="cpt-solde" class="form-input" step="0.01" placeholder="0.00" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-compte">Annuler</button>
      <button class="btn btn-primary" id="btn-save-compte">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Mise à jour solde compte -->
<div id="modal-compte-update" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-compte-update-title">Mettre à jour le solde</span>
      <button class="modal-close" data-close-modal="modal-compte-update"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Nouveau solde (€)</label>
      <input type="number" id="cu-solde" class="form-input" step="0.01" placeholder="0.00" />
    </div>
    <div class="form-group">
      <label class="form-label">Libellé (optionnel)</label>
      <input type="text" id="cu-libelle" class="form-input" placeholder="Virement salaire…" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-compte-update">Annuler</button>
      <button class="btn btn-primary" id="btn-save-compte-update">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Dépense prévue -->
<div id="modal-depense-prevue" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-dp-title">Nouvelle dépense prévue</span>
      <button class="modal-close" data-close-modal="modal-depense-prevue"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Type</label>
      <select id="dp-type" class="form-select" oninput="onDepensePrevueTypeChange()">
        <option value="ponctuel">Ponctuelle</option>
        <option value="mensuel">Mensuelle (récurrente)</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Description *</label>
      <input type="text" id="dp-description" class="form-input" placeholder="Formation Canva, Mutuelle…" />
    </div>
    <div class="form-group">
      <label class="form-label">Catégorie</label>
      <select id="dp-categorie" class="form-select">
        <option>Formation & développement</option>
        <option>Logiciels & abonnements</option>
        <option>Matériel & équipement</option>
        <option>Frais de déplacement</option>
        <option>Charges sociales</option>
        <option>Marketing & communication</option>
        <option>Autre</option>
      </select>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" id="dp-montant-label">Montant *</label>
        <input type="number" id="dp-montant" class="form-input" step="0.01" min="0" placeholder="0.00" />
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select id="dp-statut" class="form-select">
          <option value="active">Active</option>
          <option value="terminee">Terminée</option>
        </select>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label" id="dp-datedebut-label">Date prévue *</label>
        <input type="date" id="dp-datedebut" class="form-input" />
      </div>
      <div class="form-group" id="dp-datefin-group" style="display:none;">
        <label class="form-label">Date de fin</label>
        <input type="date" id="dp-datefin" class="form-input" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-depense-prevue">Annuler</button>
      <button class="btn btn-primary" id="btn-save-depense-prevue">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal Transaction -->
<div id="modal-transaction" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-txn-title">Nouvelle transaction</span>
      <button class="modal-close" data-close-modal="modal-transaction"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input type="date" id="txn-date" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select id="txn-type" class="form-select">
          <option value="credit">Crédit</option>
          <option value="debit">Débit</option>
          <option value="virement">Virement</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Libellé *</label>
      <input type="text" id="txn-libelle" class="form-input" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Compte</label>
        <select id="txn-compte" class="form-select"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Montant (€) *</label>
        <input type="number" id="txn-montant" class="form-input" step="0.01" min="0" />
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-transaction">Annuler</button>
      <button class="btn btn-primary" id="btn-save-txn">Enregistrer</button>
    </div>
  </div>
</div>

<!-- Modal URSSAF paiement -->
<div id="modal-urssaf" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-urssaf-title">Marquer comme payé</span>
      <button class="modal-close" data-close-modal="modal-urssaf"><i class="ti ti-x"></i></button>
    </div>
    <p id="modal-urssaf-detail" style="font-size:14px;color:var(--text-2);margin-bottom:16px;"></p>
    <div class="form-group">
      <label class="form-label">Montant payé (€)</label>
      <input type="number" id="urs-montant-paye" class="form-input" step="0.01" min="0" />
    </div>
    <div class="form-group">
      <label class="form-label">Date de paiement</label>
      <input type="date" id="urs-date-paye" class="form-input" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-urssaf">Annuler</button>
      <button class="btn btn-primary" id="btn-save-urssaf">Confirmer</button>
    </div>
  </div>
</div>

<!-- Modal Objectif épargne -->
<div id="modal-objectif-epargne" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="modal-obj-epargne-title">Nouvel objectif</span>
      <button class="modal-close" data-close-modal="modal-objectif-epargne"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Nom *</label>
      <input type="text" id="obj-nom" class="form-input" placeholder="Fonds d'urgence" />
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Montant cible (€) *</label>
        <input type="number" id="obj-cible" class="form-input" step="100" min="0" />
      </div>
      <div class="form-group">
        <label class="form-label">Montant actuel (€)</label>
        <input type="number" id="obj-actuel" class="form-input" step="100" min="0" value="0" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Date cible (optionnel)</label>
      <input type="date" id="obj-date" class="form-input" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-objectif-epargne">Annuler</button>
      <button class="btn btn-primary" id="btn-save-obj-epargne">Enregistrer</button>
    </div>
  </div>
</div>


<!-- Modal Confirm -->
<div id="modal-confirm" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title" id="confirm-title">Confirmer</span>
    </div>
    <p id="confirm-msg" style="font-size:14.5px;color:var(--text-2);margin-bottom:8px;"></p>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="confirm-cancel">Annuler</button>
      <button class="btn btn-danger" id="confirm-ok">Supprimer</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="toast"></div>

<script src="/app.js?v=60"></script>
</body>
</html>
`;
const CSS  = `/* =============================================
   SEED TO BLOOM FINANCE — Design System
   Thème clair, épuré
   ============================================= */

/* ===========================
   VARIABLES
   =========================== */
:root {
  /* ── DA Écrin · marron dominant ── */
  --terre:#110704; --terre-600:#5A2A11; --terre-400:#744f30; --terre-200:#d8b9a2;
  --nuit:#110704; --ivoire:#f6efe6;
  --bone:#ffffff; --card:#F7F3EC; --line:#ece3d4;

  /* ── accents : bleu clair + crème/paille ── */
  --glycine:#C5DEFF; --brume:#E4F0FF; --paille:#F0E9D6;

  /* ── sémantique [encre · fond] ── */
  --vert:#456039;  --vert-bg:#e6f0e2;
  --ambre:#a5502e; --ambre-bg:#f6e7dc;
  --rouge:#8d2b21; --rouge-bg:#f6e4de;
  --bleu:#2c4a72;  --bleu-bg:#E8F1FF;
  --violet-ink:#2c4a72; --violet-bg:#E8F1FF;

  /* ── typographie ── */
  --font-display:'Cormorant Garamond',Georgia,serif;
  --font-body:'Inter Tight',ui-sans-serif,system-ui,sans-serif;
  --font-ui:'Inter Tight',ui-sans-serif,system-ui,sans-serif;

  /* ── rayons ── */
  --r-panel:20px; --r-block:14px; --r-ctrl:12px; --r-pill:999px;

  /* ── focus ── */
  --focus:#7fa8d0;

  /* ── alias de compatibilité (mappés sur la charte) ── */
  --bg:         #ffffff;
  --surface:    #F7F3EC;
  --surface-2:  #E4D9C5;
  --cream:      #F0E9D6;
  --navy:       #110704;
  --blue:       #2c4a72;
  --violet:     #C5DEFF;
  --brown:      #110704;
  --success:    #456039;
  --warning:    #a5502e;
  --danger:     #8d2b21;
  --text:       #110704;
  --text-2:     #6b4834;
  --border:     #ece3d4;

  --blue-10:    #E8F1FF;
  --violet-10:  #E8F1FF;
  --success-10: #e6f0e2;
  --warning-10: #f6e7dc;
  --danger-10:  #f6e4de;
  --navy-10:    rgba(17,7,4,0.06);
  --cream-10:   #F0E9D6;
}

/* ===========================
   RESET
   =========================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: 'Inter Tight', sans-serif;
  font-size: 15.5px;
  line-height: 1.62;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}
/* Lisibilité : labels secondaires un peu plus soutenus */
.nav-group-label, .card-title, .kpi-label, .form-label { font-weight: 600; }

/* Scrollbar fine */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #c8b29a; }

/* ===========================
   ÉCRAN DE CONNEXION
   =========================== */
#login-screen {
  position: fixed;
  inset: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.login-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 44px 40px;
  width: 380px;
  max-width: 95vw;
}

.login-logo {
  text-align: center;
  margin-bottom: 36px;
}
.login-logo .logo-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--navy);
  display: block;
}
.login-logo .logo-sub {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-2);
  margin-top: 2px;
  display: block;
}

.login-error {
  background: var(--danger-10);
  border: 1px solid rgba(141,43,33,0.25);
  border-radius: 8px;
  color: var(--danger);
  font-size: 14px;
  padding: 10px 14px;
  margin-bottom: 16px;
  display: none;
}
.login-error.show { display: block; }

/* ===========================
   LAYOUT PRINCIPAL
   =========================== */
#app {
  display: flex;
  height: 100vh;
}

/* ===========================
   SIDEBAR
   =========================== */
#sidebar {
  width: 244px;
  min-width: 244px;
  background: var(--nuit);
  border-right: 1px solid rgba(0,0,0,0.25);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-logo {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sidebar-logo .logo-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--paille);
  display: block;
  line-height: 1.2;
}
.sidebar-logo .logo-sub {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-top: 2px;
  display: block;
}

/* Groupes de navigation */
.nav-group {
  padding: 12px 0 2px;
}
.nav-group-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  padding: 0 20px 4px;
  display: block;
}

/* Items de navigation */
.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 20px;
  cursor: pointer;
  color: rgba(255,255,255,0.82);
  font-size: 14px;
  font-weight: 400;
  border-left: 2px solid transparent;
  transition: all 0.12s ease;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}
.nav-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.07);
}
.nav-item.active {
  color: #fff;
  font-weight: 500;
  border-left-color: var(--glycine);
  background: rgba(255,255,255,0.12);
}
.nav-item .ti {
  font-size: 15px;
  flex-shrink: 0;
  opacity: 0.65;
}
.nav-item.active .ti {
  opacity: 1;
  color: var(--glycine);
}

/* Bas de sidebar — profil */
.sidebar-footer {
  margin-top: auto;
  padding: 14px 20px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--paille);
  color: var(--terre);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}
.user-info .user-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  line-height: 1.2;
}
.user-info .user-company {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
}
.btn-logout {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  font-family: 'Inter Tight', sans-serif;
  transition: all 0.12s;
  width: 100%;
}
.btn-logout:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.1);
}

/* ===========================
   CONTENU PRINCIPAL
   =========================== */
#main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
}

/* Sections */
.section {
  display: none;
  padding: 40px 48px;
  max-width: 1600px;
  width: 100%;
  animation: none;
}
.section.active {
  display: block;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* En-tête de page */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}
.page-header-left h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 500;
  color: var(--navy);
  line-height: 1.1;
}
.page-header-left .page-subtitle {
  font-size: 14px;
  color: var(--text-2);
  margin-top: 4px;
}
.page-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  flex-shrink: 0;
}

/* ===========================
   CARDS
   =========================== */
.card {
  background: var(--surface);
  border: none;
  border-radius: var(--r-panel);
  padding: 24px;
}
.card-cream {
  background: var(--paille);
  border-color: rgba(226,209,161,0.6);
}
.card-glycine { background: var(--glycine);   border-color: transparent; }
.card-paille  { background: var(--paille);    border-color: transparent; }
.card-bleu    { background: var(--bleu-bg);   border-color: transparent; }
.card-vert    { background: var(--vert-bg);   border-color: transparent; }
.card-ambre   { background: var(--ambre-bg);  border-color: transparent; }
.card-violet  { background: var(--glycine);   border-color: transparent; }
.card-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--terre);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title .ti { font-size: 17px; color: var(--violet-ink); }
.dash-sec-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--terre);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-sec-title .ti { font-size: 18px; color: var(--violet-ink); }

/* ===========================
   KPI CARDS
   =========================== */
.kpi-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}
.kpi-grid-4 { grid-template-columns: repeat(4, 1fr); }
.kpi-grid-3 { grid-template-columns: repeat(3, 1fr); }
.kpi-grid-2 { grid-template-columns: repeat(2, 1fr); }

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 22px 18px;
  position: relative;
  overflow: hidden;
}
.kpi-icon {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}
.kpi-icon.blue   { background: var(--blue-10);    color: #2c4a72; }
.kpi-icon.violet { background: var(--violet-10);  color: #8e68d5; }
.kpi-icon.green  { background: var(--success-10); color: var(--success); }
.kpi-icon.orange { background: var(--warning-10); color: var(--warning); }
.kpi-icon.red    { background: var(--danger-10);  color: var(--danger); }
.kpi-icon.navy   { background: var(--navy-10);    color: var(--navy); }
.kpi-icon.cream  { background: var(--cream-10);   color: var(--brown); }

.kpi-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-2);
  margin-bottom: 8px;
  padding-right: 44px;
  display: block;
}
.kpi-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px;
  font-weight: 500;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 4px;
  display: block;
}
.kpi-value.blue    { color: #2c4a72; }
.kpi-value.green   { color: var(--success); }
.kpi-value.danger  { color: var(--danger); }
.kpi-value.violet  { color: #7c5cbf; }
.kpi-value.warning { color: var(--warning); }

.kpi-sub {
  font-size: 13px;
  color: var(--text-2);
  display: block;
}
.kpi-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}
.kpi-badge.up   { background: var(--success-10); color: var(--success); }
.kpi-badge.down { background: var(--danger-10);  color: var(--danger); }
.kpi-badge.flat { background: var(--surface-2);  color: var(--text-2); }

/* Mini barre dans KPI */
.kpi-progress {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}
.kpi-progress-fill {
  height: 100%;
  background: var(--blue);
  border-radius: 2px;
  transition: width 0.4s ease;
}

/* ===========================
   GRILLES
   =========================== */
.grid-2     { display: grid; grid-template-columns: 1fr 1fr;    gap: 16px; margin-bottom: 20px; }
.grid-3     { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 20px; }
.grid-65-35 { display: grid; grid-template-columns: 65fr 35fr; gap: 16px; margin-bottom: 20px; }
.grid-60-40 { display: grid; grid-template-columns: 60fr 40fr; gap: 16px; margin-bottom: 20px; }
.mb-24 { margin-bottom: 24px; }
.mb-16 { margin-bottom: 16px; }
.mb-12 { margin-bottom: 12px; }

/* ===========================
   TABLEAUX
   =========================== */
.table-wrap { overflow-x: auto; }

table { width: 100%; border-collapse: collapse; }

thead { background: var(--surface-2); }
thead th {
  text-align: left;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
thead th:first-child { border-radius: 8px 0 0 0; }
thead th:last-child  { border-radius: 0 8px 0 0; }

tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 14.5px;
  vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface-2); }

.td-mono {
  font-size: 13px;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}
.td-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 500;
  color: var(--navy);
  white-space: nowrap;
}
.td-muted {
  color: var(--text-2);
  font-size: 14px;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===========================
   BADGES STATUT
   =========================== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
}
.badge::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
/* Factures */
.badge-payee     { background: var(--success-10); color: #456039; }
.badge-attente   { background: var(--warning-10); color: #a5502e; }
.badge-en-attente { background: var(--warning-10); color: #a5502e; }
.badge-retard    { background: var(--danger-10);  color: #8d2b21; }
.badge-en-retard { background: var(--danger-10);  color: #8d2b21; }
/* Abonnements */
.badge-actif     { background: var(--success-10); color: #456039; }
.badge-pause     { background: var(--warning-10); color: #a5502e; }
.badge-annule    { background: var(--surface-2);  color: var(--text-2); border: 1px solid var(--border); }
/* URSSAF */
.badge-a-venir   { background: var(--blue-10);    color: #2c4a72; }
.badge-a-payer   { background: var(--warning-10); color: #a5502e; }
.badge-paye      { background: var(--success-10); color: #456039; }
/* Génériques */
.badge-neutral   { background: var(--surface-2);  color: var(--text-2); border: 1px solid var(--border); }
.badge-blue      { background: var(--blue-10);    color: #2c4a72; }
.badge-violet    { background: var(--violet-10);  color: #7c5cbf; }
.badge-success   { background: var(--success-10); color: #456039; }
.badge-warning   { background: var(--warning-10); color: #a5502e; }
.badge-danger    { background: var(--danger-10);  color: #8d2b21; }

/* ===========================
   BOUTONS
   =========================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 17px;
  border-radius: var(--r-ctrl);
  font-size: 12.5px;
  font-family: 'Inter Tight', sans-serif;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: all 0.12s ease;
  white-space: nowrap;
  text-decoration: none;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(169,139,214,0.5);
}

.btn-primary { background: var(--nuit); color: var(--paille); }
.btn-primary:hover { background: var(--terre); }

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-secondary:hover { background: var(--surface-2); }

.btn-ghost {
  background: transparent;
  color: var(--text-2);
  padding: 7px 10px;
}
.btn-ghost:hover { background: var(--surface-2); color: var(--text); }

.btn-danger {
  background: var(--danger-10);
  color: var(--danger);
  border: 1px solid rgba(141,43,33,0.2);
}
.btn-danger:hover { background: rgba(141,43,33,0.18); }

.btn-success {
  background: var(--vert-bg);
  color: var(--vert);
  border: 1px solid rgba(69,96,57,0.2);
}

.btn-sm  { padding: 7px 13px; font-size: 11.5px; border-radius: 10px; }
.btn-xs  { padding: 4px 9px;  font-size: 10.5px;  border-radius: 8px; }
.btn-icon { padding: 6px; border-radius: 8px; letter-spacing: 0; }

/* Titres en italique (règle d'or Écrin) — les chiffres restent droits */
.login-logo .logo-name,
.sidebar-logo .logo-name,
.page-header-left h1,
.modal-title { font-style: italic; }

/* ===========================
   FORMULAIRES
   =========================== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.form-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-2);
}
.form-input,
.form-select,
.form-textarea {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: 'Inter Tight', sans-serif;
  font-size: 15px;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
  width: 100%;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(169,139,214,0.2);
}
.form-input::placeholder,
.form-textarea::placeholder { color: var(--text-2); opacity: 0.6; }
.form-select option { background: var(--surface); color: var(--text); }
.form-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

/* ===========================
   MODALS
   =========================== */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.32);
  z-index: 100;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}
.modal-overlay.open { display: flex; }

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 30px;
  width: 540px;
  max-width: 95vw;
  max-height: 92vh;
  overflow-y: auto;
  animation: modalIn 0.15s ease;
}
.modal.modal-sm { width: 420px; }
.modal.modal-lg { width: 680px; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.97) translateY(6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.modal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--navy);
}
.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-2);
  padding: 4px;
  border-radius: 6px;
  font-size: 18px;
  display: flex;
  align-items: center;
  transition: all 0.1s;
}
.modal-close:hover { background: var(--surface-2); color: var(--text); }
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

/* ===========================
   GRAPHIQUES
   =========================== */
.chart-wrap { position: relative; width: 100%; }
canvas { display: block; width: 100%; }

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-2);
}
.chart-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ===========================
   PROGRESS BARS
   =========================== */
.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.progress-label {
  font-size: 14px;
  color: var(--text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.progress-bar-wrap {
  width: 120px;
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--blue);
  transition: width 0.4s ease;
}
.progress-bar-fill.green  { background: var(--success); }
.progress-bar-fill.orange { background: var(--warning); }
.progress-bar-fill.red    { background: var(--danger); }
.progress-bar-fill.violet { background: #b09ae0; }

.progress-pct {
  font-size: 13px;
  color: var(--text-2);
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.progress-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 500;
  color: var(--navy);
  width: 90px;
  text-align: right;
  flex-shrink: 0;
}

/* Progress bar standalon */
.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}
.progress-bar .fill {
  height: 100%;
  border-radius: 3px;
  background: var(--blue);
  transition: width 0.4s ease;
}
.progress-bar .fill.green  { background: var(--success); }
.progress-bar .fill.orange { background: var(--warning); }
.progress-bar .fill.red    { background: var(--danger); }

/* Jauge */
.gauge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.gauge-fill {
  position: relative;
  width: 180px;
  height: 90px;
  overflow: hidden;
}
.gauge-fill svg { width: 100%; }

/* ===========================
   CHARGES URSSAF
   =========================== */
.urssaf-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.urssaf-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
}
.urssaf-card.alerte-rouge  {
  border-color: rgba(141,43,33,0.4);
  background: rgba(141,43,33,0.04);
}
.urssaf-card.alerte-orange {
  border-color: rgba(138,100,20,0.4);
  background: rgba(138,100,20,0.05);
}
.urssaf-card.paye {
  border-color: rgba(69,96,57,0.35);
  background: rgba(69,96,57,0.04);
}

.urssaf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.urssaf-titre {
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
}
.urssaf-echeance {
  font-size: 12px;
  color: var(--text-2);
  margin-top: 2px;
}
.urssaf-montant {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 500;
  color: var(--navy);
  margin: 6px 0 4px;
}
.urssaf-detail {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 10px;
}
.urssaf-countdown {
  font-size: 13px;
  font-weight: 500;
}
.urssaf-countdown.rouge { color: var(--danger); }
.urssaf-countdown.orange { color: var(--warning); }

/* ===========================
   ABONNEMENTS — timeline
   =========================== */
.abo-timeline {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

/* ===========================
   GOAL CARDS
   =========================== */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.goal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.goal-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.goal-card-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--navy);
  line-height: 1.3;
}
.goal-amounts {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.goal-current {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 500;
  color: var(--navy);
}
.goal-target { font-size: 13px; color: var(--text-2); }
.goal-bar-wrap {
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}
.goal-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--success);
  transition: width 0.4s ease;
}
.goal-pct { font-size: 12px; color: var(--text-2); }
.goal-date { font-size: 12px; color: var(--text-2); margin-top: 4px; }

/* ===========================
   SIMULATEUR
   =========================== */
.sim-tabs {
  display: flex;
  gap: 2px;
  background: var(--surface-2);
  border-radius: 9px;
  padding: 3px;
  width: fit-content;
  margin-bottom: 24px;
}
.sim-tab {
  padding: 7px 20px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-2);
  background: transparent;
  border: none;
  font-family: 'Inter Tight', sans-serif;
  transition: all 0.12s;
}
.sim-tab.active {
  background: var(--surface);
  color: var(--navy);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.sim-panel { display: none; }
.sim-panel.active { display: block; }

.sim-result {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 20px;
}
.sim-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 14.5px;
}
.sim-line:last-child { border-bottom: none; }
.sim-line-label { color: var(--text-2); }
.sim-line-label.strong { color: var(--text); font-weight: 500; }
.sim-line-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--navy);
}
.sim-line-amount.neg { color: var(--danger); }
.sim-line-amount.pos { color: var(--success); }
.sim-total { background: rgba(65,47,33,0.03); }
.sim-total .sim-line-label { color: var(--navy); font-weight: 600; }
.sim-total .sim-line-amount { font-size: 28px; color: var(--navy); }
.sim-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-2);
  padding: 10px 20px 2px;
  display: block;
}

/* Slider versement */
.slider-wrap { display: flex; flex-direction: column; gap: 8px; }
.slider-header { display: flex; justify-content: space-between; align-items: center; }
.slider-label { font-size: 14px; color: var(--text-2); }
.slider-value { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 500; color: var(--navy); }

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--navy);
  border-radius: 50%;
  border: 2px solid var(--surface);
}
input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--navy);
  border-radius: 50%;
  border: 2px solid var(--surface);
}

/* Scénarios annuels */
.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}
.scenario-card {
  border-radius: 10px;
  padding: 16px 18px;
  border: 1px solid var(--border);
}
.scenario-card.optimiste { border-color: rgba(69,96,57,0.3); background: var(--success-10); }
.scenario-card.realiste  { border-color: rgba(65,47,33,0.2);   background: var(--blue-10); }
.scenario-card.pessimiste{ border-color: rgba(138,100,20,0.3); background: var(--warning-10); }
.scenario-label { font-size: 13px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
.scenario-ca    { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: var(--navy); }
.scenario-sub   { font-size: 13px; color: var(--text-2); margin-top: 2px; }

/* ===========================
   RÉPARTITION
   =========================== */
.repartition-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.rep-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}
.rep-card-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2);
  margin-bottom: 10px;
}
.rep-recommande {
  font-size: 13px;
  color: var(--text-2);
  margin-bottom: 4px;
}
.rep-recommande span {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  color: var(--navy);
  font-weight: 500;
}
.rep-actuel-label { font-size: 12px; color: var(--text-2); margin-top: 10px; margin-bottom: 4px; }
.rep-ecart { font-size: 13px; margin-top: 6px; }
.rep-ecart.ok { color: var(--success); }
.rep-ecart.ko { color: var(--warning); }

/* ===========================
   IMPORT / EXPORT
   =========================== */
.file-drop {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  color: var(--text-2);
}
.file-drop:hover,
.file-drop.drag-over {
  border-color: var(--blue);
  background: var(--blue-10);
}
.file-drop .ti { font-size: 28px; display: block; margin-bottom: 10px; opacity: 0.5; }
.file-drop p { font-size: 14px; }
.file-drop label { color: var(--navy); cursor: pointer; text-decoration: underline; }

.import-preview {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}
.import-row {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}
.import-row:last-child { border-bottom: none; }
.import-row.doublon { background: var(--warning-10); color: var(--warning); }
.import-row.new { background: var(--success-10); }
.import-row.header { background: var(--surface-2); font-weight: 600; color: var(--text-2); }

.export-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.export-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  font-family: 'Inter Tight', sans-serif;
  transition: all 0.12s;
}
.export-btn:hover { background: var(--surface-2); border-color: var(--blue); }

/* ===========================
   PDF BOUTON
   =========================== */
.pdf-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: all 0.12s;
  font-family: 'Inter Tight', sans-serif;
}
.pdf-btn.vide    { color: var(--text-2); background: var(--surface-2); border: 1px solid var(--border); }
.pdf-btn.present { color: #2c4a72;       background: var(--blue-10);   border: 1px solid rgba(169,139,214,0.4); }
.pdf-btn.vide:hover    { background: var(--border); }
.pdf-btn.present:hover { background: rgba(169,139,214,0.3); }

/* ===========================
   MOIS SÉLECTEUR
   =========================== */
.month-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--navy);
}
.month-selector select {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 5px 10px;
  font-family: 'Inter Tight', sans-serif;
  font-size: 15px;
  color: var(--navy);
  outline: none;
  cursor: pointer;
}

/* ===========================
   COMPTE CARDS
   =========================== */
.comptes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.pot-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.pot-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
}
.pot-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.pot-nom { font-size: 14px; font-weight: 600; color: var(--navy); }
.pot-icon { font-size: 22px; margin-bottom: 6px; }
.pot-solde {
  font-family: 'Cormorant Garamond', serif;
  font-size: 35px;
  font-weight: 500;
  margin: 2px 0 4px;
}
.pot-sub { font-size: 12px; color: var(--text-2); margin-bottom: 10px; }
.pot-bar { height: 4px; background: var(--border); border-radius: 2px; }
.pot-bar-fill { height: 100%; border-radius: 2px; transition: width .4s; }
.compte-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 22px;
}
.compte-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.compte-nom { font-size: 15px; font-weight: 600; color: var(--navy); }
.compte-solde {
  font-family: 'Cormorant Garamond', serif;
  font-size: 39px;
  font-weight: 500;
  color: var(--navy);
  margin: 4px 0 6px;
}
.compte-upd { font-size: 12px; color: var(--text-2); }
.compte-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.compte-historique { margin-top: 12px; }
.compte-historique-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-2);
}
.compte-historique-item:last-child { border-bottom: none; }

/* ===========================
   RAPPORT MENSUEL — phrase auto
   =========================== */
.rapport-phrase {
  background: var(--cream-10);
  border: 1px solid rgba(226,209,161,0.6);
  border-radius: 10px;
  padding: 16px 20px;
  font-size: 15px;
  color: var(--brown);
  line-height: 1.6;
  margin-bottom: 20px;
}

/* ===========================
   ALERTE INLINE
   =========================== */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 16px;
}
.alert.danger  { background: var(--danger-10);  color: #8d2b21; border: 1px solid rgba(141,43,33,0.2); }
.alert.warning { background: var(--warning-10); color: #a5502e; border: 1px solid rgba(138,100,20,0.2); }
.alert.success { background: var(--success-10); color: #456039; border: 1px solid rgba(69,96,57,0.2); }
.alert.info    { background: var(--blue-10);    color: #2c4a72; border: 1px solid rgba(169,139,214,0.4); }

/* ===========================
   SKELETON LOADERS
   =========================== */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: var(--surface-2);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
.skeleton-text  { display: inline-block; height: 0.85em; vertical-align: middle; }
.skeleton-block { display: block; }

/* ===========================
   TOAST
   =========================== */
#toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--navy);
  color: #fff;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  z-index: 999;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.2s ease;
  pointer-events: none;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 8px;
}
#toast.show    { opacity: 1; transform: translateY(0); }
#toast.success { background: var(--success); }
#toast.error   { background: var(--danger); }
#toast.info    { background: var(--navy); }

/* ===========================
   DIVIDER
   =========================== */
.divider { height: 1px; background: var(--border); margin: 20px 0; }

/* ===========================
   EMPTY STATES
   =========================== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-2);
}
.empty-state .ti { font-size: 38px; display: block; margin-bottom: 12px; opacity: 0.25; }
.empty-state h3 { font-size: 15px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.empty-state p  { font-size: 14px; }

/* ===========================
   TRANSITIONS RAPIDES
   =========================== */
.fade-in { animation: fadeIn 0.15s ease; }

/* ===========================
   FISCAL BNC JAUGE
   =========================== */
.fiscal-plafond-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}
.fiscal-plafond-bar {
  flex: 1;
  height: 10px;
  background: var(--surface-2);
  border-radius: 5px;
  overflow: hidden;
}
.fiscal-plafond-fill {
  height: 100%;
  border-radius: 5px;
  background: var(--success);
  transition: width 0.4s ease;
}
.fiscal-plafond-fill.warning { background: var(--warning); }
.fiscal-plafond-fill.danger  { background: var(--danger); }
.fiscal-plafond-pct {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 500;
  color: var(--navy);
  white-space: nowrap;
}

/* ===========================
   RÉCAP CHARGES MENSUEL
   =========================== */
.charges-recap {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.charges-recap-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14.5px;
}
.charges-recap-line:last-child { border-bottom: none; }
.charges-recap-label { color: var(--text-2); }
.charges-recap-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  color: var(--navy);
}
.charges-recap-total {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 12px 14px;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.charges-recap-total .label { font-weight: 600; color: var(--navy); }
.charges-recap-total .amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--navy);
}

/* ===========================
   CARD RÉSULTAT GLOBAL
   =========================== */
.result-card {
  background: var(--navy);
  border-radius: 12px;
  padding: 24px 28px;
  color: #fff;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.result-card-item {}
.result-card-label {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 6px;
}
.result-card-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 31px;
  font-weight: 500;
}

/* ===========================
   RESPONSIVE — tablette
   =========================== */
@media (max-width: 1100px) {
  .section { padding: 28px 32px; }
  .kpi-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-65-35, .grid-60-40 { grid-template-columns: 1fr; }
  .urssaf-grid { grid-template-columns: repeat(2, 1fr); }
  .result-card { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  #sidebar { width: 200px; min-width: 200px; }
  .section { padding: 20px 22px; }
  .kpi-grid-3 { grid-template-columns: 1fr 1fr; }
  .goals-grid { grid-template-columns: 1fr; }
  .comptes-grid { grid-template-columns: 1fr; }
  .scenarios-grid { grid-template-columns: 1fr; }
}

/* ===========================
   FLUIDITÉ & MICRO-INTERACTIONS
   =========================== */
* { -webkit-tap-highlight-color: transparent; }
#main { scroll-behavior: smooth; }
.card { transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease; }
.card:hover { box-shadow: 0 3px 16px rgba(65,47,33,.06); }
.section.active { animation: sectionIn .24s cubic-bezier(.22,.61,.36,1); }
@keyframes sectionIn { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }
.nav-item:active { transform: scale(.985); }
.btn:active { transform: scale(.97); }

/* Barre mobile + tiroir */
#mobile-topbar { display: none; }
#sidebar-overlay { display: none; }
#mobile-menu-btn {
  background: none; border: 1px solid var(--border); border-radius: 8px;
  width: 36px; height: 36px; cursor: pointer; color: var(--navy);
  display: inline-flex; align-items: center; justify-content: center; font-size: 18px;
}
@media (max-width: 860px) {
  #mobile-topbar {
    display: flex; align-items: center; gap: 12px;
    position: sticky; top: 0; z-index: 40;
    background: var(--bg); border-bottom: 1px solid var(--border);
    padding: 11px 16px;
  }
  #sidebar {
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 60;
    width: 250px; min-width: 250px;
    transform: translateX(-100%);
    transition: transform .26s cubic-bezier(.22,.61,.36,1);
    box-shadow: 0 0 44px rgba(0,0,0,.16);
  }
  #sidebar.open { transform: translateX(0); }
  #sidebar-overlay {
    display: block; position: fixed; inset: 0; z-index: 55;
    background: rgba(65,47,33,.38);
    opacity: 0; pointer-events: none; transition: opacity .26s ease;
  }
  #sidebar-overlay.open { opacity: 1; pointer-events: auto; }
  .section { padding: 18px 16px 44px; }
  .kpi-grid-4, .kpi-grid-3 { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .page-header-right { width: 100%; flex-wrap: wrap; }
}
`;
const JS   = `/* ─── STB Finance — app.js — Cookie auth + service binding ──────────── */

/* ─── 0. LOGIN OVERLAY ───────────────────────────────────────────────── */
function injectLoginOverlay() {
  if (q('#login-overlay')) return;
  const div = document.createElement('div');
  div.id = 'login-overlay';
  div.style.cssText = 'position:fixed;inset:0;background:#f5f3ef;display:none;align-items:center;justify-content:center;z-index:9999;';
  div.innerHTML = \`
    <div style="background:#fff;border:1px solid #ece3d4;border-radius:12px;padding:40px;width:360px;max-width:90vw;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <div style="font-family:'Cormorant Garamond',serif;font-size:42px;color:#110704;margin-bottom:4px;">STB Finance</div>
      <div style="font-size:14px;color:#6b533b;margin-bottom:32px;">Seed to Bloom</div>
      <input id="login-pwd" type="password" placeholder="Mot de passe" autocomplete="current-password"
        style="width:100%;padding:10px 14px;border:1px solid #ece3d4;border-radius:8px;font-size:15px;margin-bottom:12px;box-sizing:border-box;outline:none;">
      <button id="login-btn"
        style="width:100%;padding:10px;background:#110704;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:inherit;">
        Se connecter
      </button>
      <div id="login-error" style="margin-top:12px;font-size:14px;color:#8d2b21;min-height:18px;"></div>
    </div>\`;
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
  comptes:[], objectifs_epargne:[], urssaf:{}, repartition:{}, objectif_ca:{}, tiers:[], projets:[], devis:[],
  depenses_prevues:[]
};

async function loadAll() {
  const [settings, factures, depenses, abonnements, comptes, oe, urssaf, repartition, objCA, tiers, projets, devis, depensesPrevues] = await Promise.all([
    api('GET', '/api/settings'),
    api('GET', '/api/factures'),
    api('GET', '/api/depenses'),
    api('GET', '/api/abonnements'),
    api('GET', '/api/comptes'),
    api('GET', '/api/objectifs/epargne'),
    api('GET', '/api/urssaf'),
    api('GET', '/api/repartition'),
    api('GET', '/api/objectifs/ca'),
    api('GET', '/api/tiers'),
    api('GET', '/api/projets'),
    api('GET', '/api/devis'),
    api('GET', '/api/depenses-prevues'),
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
  _cache.tiers           = tiers    || [];
  _cache.projets         = projets  || [];
  _cache.devis           = devis    || [];
  _cache.depenses_prevues = depensesPrevues || [];
  // Transactions : on charge jusqu'à 5 pages
  try {
    const t1 = await api('GET', '/api/transactions?page=1');
    const all = [...(t1.transactions||[])];
    if (t1.pages > 1) {
      const rest = await Promise.all(
        Array.from({length: Math.min(t1.pages-1, 4)}, (_,i) =>
          api('GET', \`/api/transactions?page=\${i+2}\`).then(r=>r.transactions||[]).catch(()=>[])
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
  navy:'#110704', blue:'#2c4a72', violet:'#2c4a72',
  success:'#456039', warning:'#a5502e', danger:'#8d2b21',
  muted:'#ece3d4', text2:'#6b533b'
};
const PALETTE = ['#2c4a72','#a5502e','#456039','#8d2b21','#110704','#744f30','#c8b29a','#a98bd6'];

/* ─── 2. UTILS ───────────────────────────────────────────────────────── */
const fmt     = v => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Math.round((v||0)*100)/100);
const fmtN    = v => new Intl.NumberFormat('fr-FR').format(Math.round(v||0));
const today   = () => new Date().toISOString().slice(0,10);
const uid     = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36);
function fmtDate(s){if(!s)return'—';const[y,m,d]=s.split('-');return\`\${d}/\${m}/\${y}\`;}
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
let _qontoSoldeCalc=null;
function toast(msg,type='info'){
  const t=q('#toast');
  if(!t)return;
  t.textContent=msg;
  t.className=\`show \${type}\`;
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
  comptes:'/api/comptes', transactions:'/api/transactions', objectifs_epargne:'/api/objectifs/epargne',
  tiers:'/api/tiers', projets:'/api/projets', devis:'/api/devis', depenses_prevues:'/api/depenses-prevues'
};
const _pathUpdate = id=>({
  factures:\`/api/factures/\${id}\`, abonnements:\`/api/abonnements/\${id}\`,
  depenses:\`/api/depenses/\${id}\`, depenses_prevues:\`/api/depenses-prevues/\${id}\`,
  comptes:\`/api/comptes/\${id}\`, objectifs_epargne:\`/api/objectifs/epargne/\${id}\`,
  tiers:\`/api/tiers/\${id}\`, projets:\`/api/projets/\${id}\`, devis:\`/api/devis/\${id}\`
});
const _pathDelete = id=>({
  factures:\`/api/factures/\${id}\`, depenses:\`/api/depenses/\${id}\`,
  depenses_prevues:\`/api/depenses-prevues/\${id}\`,
  abonnements:\`/api/abonnements/\${id}\`, comptes:\`/api/comptes/\${id}\`,
  transactions:\`/api/transactions/\${id}\`, objectifs_epargne:\`/api/objectifs/epargne/\${id}\`,
  tiers:\`/api/tiers/\${id}\`, projets:\`/api/projets/\${id}\`, devis:\`/api/devis/\${id}\`
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
  const sec=q(\`#section-\${section}\`);
  if(!sec)return;
  sec.classList.add('active');
  const nav=q(\`.nav-item[data-section="\${section}"]\`);
  if(nav)nav.classList.add('active');
  currentSection=section;
  const _main=q('#main'); if(_main)_main.scrollTop=0;
  closeSidebar();
  loadSection(section);
}
function toggleSidebar(){
  const sb=q('#sidebar'), ov=q('#sidebar-overlay');
  if(!sb)return;
  const open=sb.classList.toggle('open');
  if(ov)ov.classList.toggle('open',open);
}
function closeSidebar(){
  const sb=q('#sidebar'), ov=q('#sidebar-overlay');
  if(sb)sb.classList.remove('open');
  if(ov)ov.classList.remove('open');
}
function loadSection(s){
  const map={
    'dashboard':loadDashboard,
    'budget-perso':loadBudgetPerso,'versement':loadVersement,'reserve':loadReserve,'patrimoine':loadPatrimoine,'projets-vie':loadProjetsVie,
    'comptes':loadComptes,'enveloppes':loadEnveloppes,'transactions':loadTransactions,
    'crm':loadCrm,
    'factures':loadFactures,'devis':loadDevis,'projets':loadProjets,'tiers':loadTiers,
    'depenses':loadDepenses,'abonnements':loadAbonnements,
    'charges-urssaf':loadChargesURSSAF,
    'objectifs-epargne':loadObjectifsEpargne,'rapport-mensuel':loadRapportMensuel,
    'rapport-prevision':loadRapportPrevision,
    'rapport-trimestriel':loadRapportTrimestriel,
    'rapport-annuel':loadRapportAnnuel,'rapport-fiscal':loadRapportFiscal,
    'simulateur':loadSimulateur,'import-export':initImportExport,'options':loadOptions,
  };
  if(map[s])map[s]();
}

/* ─── 7. MODALS ──────────────────────────────────────────────────────── */
function openModal(id){const m=q(\`#\${id}\`);if(m)m.classList.add('open');}
function closeModal(id){const m=q(\`#\${id}\`);if(m)m.classList.remove('open');}
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

function roundTopRect(ctx,x,y,w,h,r){
  r=Math.max(0,Math.min(r,w/2,h));
  ctx.beginPath();
  ctx.moveTo(x,y+h);
  ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r);
  ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h);
  ctx.closePath();
}
function drawGrid(ctx,pad,cW,cH,yMax,step){
  ctx.save();
  ctx.setLineDash([2,4]);ctx.strokeStyle='#ece3d4';ctx.lineWidth=1;
  for(let v=0;v<=yMax;v+=step){
    const y=pad.top+cH-(v/yMax)*cH;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+cW,y);ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.fillStyle='#744f30';ctx.font='10px Inter Tight,sans-serif';ctx.textAlign='right';
  for(let v=0;v<=yMax;v+=step){
    const y=pad.top+cH-(v/yMax)*cH;
    ctx.fillText(fmtShort(v),pad.left-8,y+3);
  }
  ctx.strokeStyle='#ded4c2';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.left,pad.top+cH);ctx.lineTo(pad.left+cW,pad.top+cH);ctx.stroke();
  ctx.restore();
}

function drawBarChart(canvas,labels,datasets,opts={}){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  // Reserve right space for target label if needed
  const pad={top:16,right:opts.targetLine?56:12,bottom:36,left:52};
  const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  const allVals=datasets.flatMap(d=>d.data);
  const maxVal=Math.max(...allVals,opts.targetLine||0,opts.seuilLine||0,1);
  const step=niceStep(maxVal);
  const yMax=Math.ceil(maxVal/step)*step;
  drawGrid(ctx,pad,cW,cH,yMax,step);
  const groupW=cW/labels.length;
  const bc=datasets.length,gap=Math.min(6,groupW*0.12);
  const bw=Math.max(5,(groupW-gap*(bc+1))/bc);
  const single=datasets.length===1;
  // Primary dataset (index 0) gets color-coded if targetLine set
  datasets.forEach((ds,di)=>{
    ds.data.forEach((v,i)=>{
      if(!v)return;
      const bH=(v/yMax)*cH;
      const x=pad.left+i*groupW+gap+di*(bw+gap);
      const y=pad.top+cH-bH;
      let color=ds.color||COLORS.navy;
      if(di===0&&opts.targetLine){
        const ratio=v/opts.targetLine;
        color=ratio>=1?'#456039':ratio>=0.8?'#a5502e':'#8d2b21';
      }
      ctx.fillStyle=color;
      roundTopRect(ctx,x,y,bw,bH,Math.min(6,bw/2));
      ctx.fill();
      if(single&&bH>14){
        ctx.fillStyle=color;ctx.font='bold 10px Inter Tight,sans-serif';ctx.textAlign='center';
        ctx.fillText(fmtShort(v),x+bw/2,y-5);
      }
    });
  });
  // Seuil de rentabilité (ligne pointillée grise)
  if(opts.seuilLine&&opts.seuilLine>0&&opts.seuilLine<=yMax){
    const sy=pad.top+cH-(opts.seuilLine/yMax)*cH;
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle='#744f30';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad.left,sy);ctx.lineTo(pad.left+cW,sy);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    ctx.fillStyle='#744f30';ctx.font='10px Inter Tight,sans-serif';ctx.textAlign='left';
    ctx.fillText('Seuil',pad.left+cW+4,sy+4);
  }
  // Ligne objectif (pointillé bleu)
  if(opts.targetLine&&opts.targetLine>0&&opts.targetLine<=yMax){
    const ty=pad.top+cH-(opts.targetLine/yMax)*cH;
    ctx.save();ctx.setLineDash([6,3]);ctx.strokeStyle=COLORS.blue;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(pad.left,ty);ctx.lineTo(pad.left+cW,ty);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    ctx.fillStyle=COLORS.blue;ctx.font='bold 10px Inter Tight,sans-serif';ctx.textAlign='left';
    ctx.fillText('Objectif',pad.left+cW+4,ty+4);
  }
  ctx.fillStyle=COLORS.text2;ctx.font='11px Inter Tight,sans-serif';ctx.textAlign='center';
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
  const tracePath=()=>{
    ctx.beginPath();
    if(pts.length<3){pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));return;}
    ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=0;i<pts.length-1;i++){
      const mx=(pts[i].x+pts[i+1].x)/2,my=(pts[i].y+pts[i+1].y)/2;
      ctx.quadraticCurveTo(pts[i].x,pts[i].y,mx,my);
    }
    ctx.quadraticCurveTo(pts[pts.length-1].x,pts[pts.length-1].y,pts[pts.length-1].x,pts[pts.length-1].y);
  };
  if(!dashed){
    tracePath();
    ctx.lineTo(pts[pts.length-1].x,pad.top+cH);ctx.lineTo(pts[0].x,pad.top+cH);
    ctx.closePath();ctx.fillStyle=color+'1f';ctx.fill();
  }
  ctx.save();if(dashed)ctx.setLineDash([5,5]);
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.lineCap='round';
  tracePath();ctx.stroke();ctx.restore();
  if(!dashed)pts.forEach(p=>{
    ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
    ctx.lineWidth=2;ctx.strokeStyle=color;ctx.stroke();
  });
  ctx.fillStyle=COLORS.text2;ctx.font='11px Inter Tight,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+(i/n)*cW,pad.top+cH+16));
}

function drawDonutChart(canvas,labels,data,colors){
  if(!canvas)return;
  const{ctx,W,H}=setupCanvas(canvas);
  ctx.clearRect(0,0,W,H);
  const total=data.reduce((a,b)=>a+b,0);
  if(!total)return;
  const legendW=140;
  const cx=(W-legendW)/2,cy=H/2,r=Math.min(cx-10,cy-10),ir=r*0.62;
  const gap=data.filter(v=>v>0).length>1?0.02:0;
  let angle=-Math.PI/2;
  ctx.lineWidth=r-ir;
  data.forEach((v,i)=>{
    if(!v)return;
    const s=(v/total)*Math.PI*2;
    ctx.beginPath();
    ctx.strokeStyle=colors[i%colors.length];
    ctx.arc(cx,cy,(r+ir)/2,angle+gap,angle+s-gap);
    ctx.stroke();
    angle+=s;
  });
  // centre : total
  ctx.fillStyle=COLORS.navy;ctx.font="italic 600 20px 'Cormorant Garamond',serif";ctx.textAlign='center';
  ctx.fillText(fmtShort(total),cx,cy+2);
  ctx.fillStyle='#744f30';ctx.font='9px Inter Tight,sans-serif';
  ctx.fillText('TOTAL',cx,cy+15);
  const lx=W-legendW+8;
  let li=0;
  labels.forEach((l,i)=>{
    if(!data[i])return;
    const ly=14+li*20;li++;
    const pct=Math.round(data[i]/total*100);
    ctx.fillStyle=colors[i%colors.length];
    if(ctx.roundRect){ctx.beginPath();ctx.roundRect(lx,ly,9,9,2.5);ctx.fill();}else ctx.fillRect(lx,ly,9,9);
    ctx.fillStyle=COLORS.navy;ctx.font='11px Inter Tight,sans-serif';ctx.textAlign='left';
    ctx.fillText(l.slice(0,13),lx+14,ly+8);
    ctx.fillStyle='#744f30';ctx.textAlign='right';
    ctx.fillText(pct+'%',W-4,ly+8);
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
  const bw=Math.max(6,Math.min(groupW*0.6,42));
  const bx=(groupW-bw)/2;
  labels.forEach((_,i)=>{
    let base=0;
    const topIdx=datasets.reduce((t,ds,di)=>(ds.data[i]||0)>0?di:t,-1);
    datasets.forEach((ds,di)=>{
      const v=ds.data[i]||0;
      if(!v)return;
      const bH=(v/yMax)*cH;
      const x=pad.left+i*groupW+bx;
      const y=pad.top+cH-(base+v)/yMax*cH;
      ctx.fillStyle=ds.color||COLORS.blue;
      if(di===topIdx){roundTopRect(ctx,x,y,bw,bH,Math.min(5,bw/2));ctx.fill();}
      else{ctx.beginPath();ctx.rect(x,y,bw,bH);ctx.fill();}
      base+=v;
    });
  });
  ctx.fillStyle=COLORS.text2;ctx.font='11px Inter Tight,sans-serif';ctx.textAlign='center';
  labels.forEach((l,i)=>ctx.fillText(l,pad.left+i*groupW+groupW/2,pad.top+cH+16));
}

/* ─── 9. MODULES ─────────────────────────────────────────────────────── */

/* --- Dashboard -------------------------------------------------------- */
/* ═══ Tendances : sparklines épurées (SVG, sans axes ni grille) ═══ */
function sparkline(data,idn){
  const w=100,h=32,pad=3;
  const vals=(data||[]).map(v=>+v||0);
  if(!vals.length)return '';
  const min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1,n=vals.length;
  const xs=i=>n<=1?w/2:(i/(n-1))*w;
  const ys=v=>h-pad-((v-min)/span)*(h-pad*2);
  const pts=vals.map((v,i)=>xs(i).toFixed(1)+','+ys(v).toFixed(1));
  const area='M '+xs(0).toFixed(1)+','+h+' L '+pts.join(' L ')+' L '+xs(n-1).toFixed(1)+','+h+' Z';
  const lastX=xs(n-1).toFixed(1),lastY=ys(vals[n-1]).toFixed(1);
  return \`<svg viewBox="0 0 \${w} \${h}" preserveAspectRatio="none" style="width:100%;height:38px;display:block;overflow:visible;">
    <defs><linearGradient id="sg\${idn}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--navy)" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="var(--navy)" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="\${area}" fill="url(#sg\${idn})"/>
    <polyline points="\${pts.join(' ')}" fill="none" stroke="var(--navy)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <circle cx="\${lastX}" cy="\${lastY}" r="2.2" fill="var(--navy)" vector-effect="non-scaling-stroke"/>
  </svg>\`;
}

function computeTrends(){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth()+1;
  const factures=dbGet('factures'),depenses=dbGet('depenses'),abonnements=dbGet('abonnements'),settings=dbGetObj('settings');
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100,tauxC=(parseFloat(settings.tauxCfp)||0.2)/100,pas=parseFloat(settings.pasFixe)||40;
  const pctV=(parseFloat(settings.pctVersement)||65)/100;
  const abosMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const ca=[],charges=[],net=[],versement=[];
  // 12 mois clôturés (on exclut le mois en cours, encore incomplet, pour ne pas fausser la tendance)
  for(let k=12;k>=1;k--){
    let mm=m-k,yy=y;while(mm<1){mm+=12;yy--;}
    const key=yy+'-'+String(mm).padStart(2,'0');
    const c=factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(key)).reduce((s,f)=>s+(f.montant||0),0);
    const dep=depenses.filter(d=>(d.date||'').startsWith(key)&&d.categorie!=='Versement perso').reduce((s,d)=>s+(d.montant||0),0);
    const ch=Math.round(c*(tauxU+tauxC))+abosMois+pas+dep;
    const nt=Math.max(0,c-ch);
    ca.push(c);charges.push(ch);net.push(nt);versement.push(Math.round(nt*pctV));
  }
  return {ca,charges,net,versement};
}

function renderTrends(){
  const el=q('#dash-trends'); if(!el)return;
  let t; try{t=computeTrends();}catch(e){el.innerHTML='';return;}
  const delta=arr=>{const a=arr[arr.length-2]||0,b=arr[arr.length-1]||0;if(a<=0)return null;return Math.round((b-a)/a*100);};
  const tiles=[
    {lab:'CA encaissé',arr:t.ca,up:true},
    {lab:'Charges',arr:t.charges,up:false},
    {lab:'Résultat net',arr:t.net,up:true},
    {lab:'Versement possible',arr:t.versement,up:true},
  ];
  el.innerHTML=\`<div class="card" style="padding:18px 20px;">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-2);margin-bottom:16px;">Tendances · 12 mois clôturés <span style="text-transform:none;letter-spacing:0;opacity:.7;">(hors mois en cours)</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:22px;">
    \${tiles.map((ti,i)=>{
      const cur=ti.arr[ti.arr.length-1]||0, dl=delta(ti.arr);
      const good=dl==null?null:(ti.up?dl>=0:dl<=0);
      const chip=dl==null?'':\`<span style="font-size:12px;font-weight:600;color:\${good?'#456039':'#8d2b21'};">\${dl>=0?'▲':'▼'} \${Math.abs(dl)}%</span>\`;
      return \`<div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
          <span style="font-size:12px;color:var(--text-2);text-transform:uppercase;letter-spacing:.04em;">\${ti.lab}</span>
          \${chip}
        </div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:27px;font-weight:600;color:var(--navy);margin-bottom:8px;">\${fmt(cur)}</div>
        \${sparkline(ti.arr,i)}
      </div>\`;
    }).join('')}
    </div>
  </div>\`;
}

/* ═══ Copilote financier : analyse, score de santé, briefing, insights ═══ */
function computeIntel(){
  const now=new Date();
  const y=now.getFullYear(), m=now.getMonth()+1;
  const factures=dbGet('factures'), depenses=dbGet('depenses'), abonnements=dbGet('abonnements'), projets=dbGet('projets');
  const settings=dbGetObj('settings'), urssafObj=dbGetObj('urssaf');
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100, tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const pas=parseFloat(settings.pasFixe)||40, objectifCA=parseFloat(settings.objectifCA)||0;
  const PLAFOND=77700;
  const ym=(yy,mm)=>yy+'-'+String(mm).padStart(2,'0');
  const inY=ds=>((ds||'')+'').startsWith(String(y));

  // Enveloppes (réutilise le moteur pour le disponible réel)
  let env={},disponible=0,soldeReel=0,totalReserve=0;
  try{const ce=computeEnveloppes();env=ce.env;disponible=ce.disponible;soldeReel=ce.soldeReel;totalReserve=ce.totalReserve;}catch(e){}

  const caM=(yy,mm)=>factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(ym(yy,mm))).reduce((s,f)=>s+(f.montant||0),0);
  const caMois=caM(y,m);
  const pm=m===1?12:m-1, py=m===1?y-1:y;
  const caMoisPrec=caM(py,pm);
  const caYTD=factures.filter(f=>f.statut==='payee'&&inY(f.datePaiement||f.date)).reduce((s,f)=>s+(f.montant||0),0);
  const moisEcoules=m;
  const revenuMoyen=caYTD/Math.max(1,moisEcoules);
  const serie=[2,1,0].map(k=>{let mm=m-k,yy=y;while(mm<1){mm+=12;yy--;}return caM(yy,mm);});
  const caTrendUp=serie[0]<serie[1]&&serie[1]<serie[2];
  const deltaMois=caMoisPrec>0?Math.round((caMois-caMoisPrec)/caMoisPrec*100):null;

  const abosMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const depYTD=depenses.filter(d=>inY(d.date)&&d.categorie!=='Versement perso').reduce((s,d)=>s+(d.montant||0),0);
  const depMoyMois=depYTD/Math.max(1,moisEcoules);
  const chargesYTD=Math.round(caYTD*(tauxU+tauxC))+(abosMois+pas)*moisEcoules+depYTD;
  const ratioCharges=caYTD>0?chargesYTD/caYTD:0;
  const burnMensuel=Math.round(abosMois+pas+depMoyMois);
  const moisSecurite=burnMensuel>0?soldeReel/burnMensuel:0;
  const joursRupture=Math.round(moisSecurite*30);

  const attenduYTD=objectifCA>0?objectifCA*(moisEcoules/12):0;
  const ecartObjectif=Math.round(caYTD-attenduYTD);
  const projAnnuel=Math.round(revenuMoyen*12);
  const pctPlafond=Math.round(projAnnuel/PLAFOND*100);
  const pctObjectif=objectifCA>0?Math.round(caYTD/objectifCA*100):null;

  // Concentration client
  const caParClient={};
  factures.filter(f=>f.statut==='payee'&&inY(f.datePaiement||f.date)).forEach(f=>{const c=f.client||'—';caParClient[c]=(caParClient[c]||0)+(f.montant||0);});
  const clientsTri=Object.entries(caParClient).sort((a,b)=>b[1]-a[1]);
  const topClient=clientsTri[0]||['—',0];
  const topClientPct=caYTD>0?Math.round(topClient[1]/caYTD*100):0;

  // Revenus récurrents = TOUS les projets marqués « Mensuelle » encore actifs,
  // à leur montant mensuel réel (total ÷ nb de mois si durée définie), + ceux
  // déclarés à la main dans la Prévision.
  const _today=now.toISOString().slice(0,10);
  const recDetail=[];
  projets.filter(p=>p.type==='mensuel'&&p.statut!=='termine'&&p.statut!=='annule'&&(!p.dateFin||p.dateFin>=_today)).forEach(p=>{
    const mm=p.dureeIndeterminee?(p.montantTotal||0):((p.montantTotal||0)/Math.max(1,p.nombreMois||1));
    if(mm>0)recDetail.push({nom:p.nom||'Projet',montant:Math.round(mm*100)/100,src:p.dureeIndeterminee?'mensuel indéterminé':((p.nombreMois||1)+' mois')});
  });
  (settings.revenusRecurrents||[]).forEach(r=>{const mm=parseFloat(r.montant)||0;if(mm>0)recDetail.push({nom:r.nom||'Revenu',montant:mm,src:'déclaré'});});
  const recMensuel=recDetail.reduce((s,r)=>s+r.montant,0);

  // Factures en retard / en attente
  // Une facture est « en retard » si elle est explicitement marquée retard,
  // OU si elle est impayée (attente) et que son échéance est dépassée.
  const todayStr=now.toISOString().slice(0,10);
  const retard=factures.filter(f=>f.statut!=='payee'&&(f.statut==='retard'||(f.dateEcheance&&f.dateEcheance<todayStr)));
  const attente=factures.filter(f=>f.statut==='attente');
  const retardTotal=retard.reduce((s,f)=>s+(f.montant||0),0);

  // Prochaine échéance URSSAF non payée
  const echeances={T1:y+'-04-30',T2:y+'-07-31',T3:y+'-10-31',T4:(y+1)+'-01-31'};
  let urssafProchain=null;
  ['T1','T2','T3','T4'].forEach(t=>{const d=urssafObj[t+'-'+y]||{};if(d.statut==='paye')return;const ech=new Date(echeances[t]+'T23:59');const j=Math.ceil((ech-now)/86400000);if(j>=0&&(!urssafProchain||j<urssafProchain.jours))urssafProchain={t,jours:j,date:echeances[t]};});

  // Score de santé (pondéré)
  const s1=Math.max(0,Math.min(100,Math.round(moisSecurite/3*100)));
  const s2=disponible>=0?100:Math.max(0,Math.round(100+disponible/Math.max(1,totalReserve)*100));
  const s3=objectifCA>0?Math.max(0,Math.min(100,Math.round(caYTD/Math.max(1,attenduYTD)*100))):70;
  const s4=ratioCharges>0?Math.max(0,Math.min(100,Math.round(100-Math.max(0,ratioCharges-0.45)*300))):100;
  const s5=revenuMoyen>0?Math.min(100,Math.round(recMensuel/revenuMoyen*100)):0;
  const s6=topClientPct<=40?100:Math.max(0,100-(topClientPct-40)*2);
  const score=Math.round(s1*.25+s2*.25+s3*.20+s4*.15+s5*.10+s6*.05);

  const indics=[
    {ok:moisSecurite>=3,label:'Trésorerie',val:moisSecurite.toFixed(1)+' mois de sécurité'},
    {ok:disponible>=0,label:'Réserves',val:disponible>=0?'URSSAF & charges couvertes':'réserves à découvert'},
    {ok:pctObjectif==null||s3>=90,label:'Objectif CA',val:pctObjectif!=null?pctObjectif+'% (rythme '+(ecartObjectif>=0?'OK':fmt(ecartObjectif))+')':'non défini'},
    {ok:ratioCharges<=0.5,label:'Charges',val:caYTD>0?Math.round(ratioCharges*100)+'% du CA':'—'},
    {ok:recMensuel>0&&s5>=25,label:'Revenus récurrents',val:recMensuel>0?fmt(recMensuel)+'/mois':'aucun'},
    {ok:topClientPct<=40,label:'Dépendance client',val:topClient[0]!=='—'?topClient[0]+' = '+topClientPct+'%':'—'},
  ];

  // Insights automatiques
  const ins=[];
  if(disponible>0)ins.push({t:'good',txt:'Tu peux te verser jusqu\\'à '+fmt(disponible)+' aujourd\\'hui sans toucher à tes réserves (URSSAF, charges…).'});
  else if(disponible<0)ins.push({t:'warn',txt:'Tu as réservé '+fmt(-disponible)+' de plus que ton solde réel. Attends un encaissement avant de te verser quoi que ce soit.'});
  if(deltaMois!=null)ins.push({t:deltaMois>=0?'good':'warn',txt:'Ton CA de '+MOIS_LONG[m-1]+' est '+(deltaMois>=0?'en hausse de +'+deltaMois+'%':'en baisse de '+deltaMois+'%')+' vs le mois dernier.'});
  if(caTrendUp)ins.push({t:'good',txt:'Tes revenus progressent depuis 3 mois d\\'affilée. Continue comme ça.'});
  if(objectifCA>0&&ecartObjectif<0)ins.push({t:'warn',txt:'Tu es en dessous de ton rythme annuel : il te manque environ '+fmt(-ecartObjectif)+' pour rester dans l\\'objectif de '+fmt(objectifCA)+'.'});
  if(objectifCA>0&&ecartObjectif>=0&&pctObjectif!=null)ins.push({t:'good',txt:'Tu es en avance sur ton objectif de CA ('+pctObjectif+'% atteint, rythme dépassé de '+fmt(ecartObjectif)+').'});
  if(topClientPct>40)ins.push({t:'warn',txt:topClient[0]+' représente '+topClientPct+'% de ton CA. Beaucoup dépend de ce client — pense à diversifier.'});
  if(pctPlafond>=80)ins.push({t:'warn',txt:'À ce rythme, tu projettes '+fmt(projAnnuel)+' sur l\\'année, soit '+pctPlafond+'% du plafond micro-BNC (77 700 €). Surveille le dépassement.'});
  if(burnMensuel>0&&moisSecurite<3)ins.push({t:'warn',txt:'Ta trésorerie couvre '+moisSecurite.toFixed(1)+' mois de charges. Vise 3 mois de sécurité.'});
  if(retard.length)ins.push({t:'warn',txt:retard.length+' facture(s) en retard de paiement ('+fmt(retardTotal)+'). Pense à relancer.'});
  if(urssafProchain&&urssafProchain.jours<=30)ins.push({t:'info',txt:'URSSAF '+urssafProchain.t+' à déclarer d\\'ici '+urssafProchain.jours+' jours ('+fmtDate(urssafProchain.date)+').'});
  // Devis à relancer (envoyés, sans réponse depuis > 14 jours)
  const devis=dbGet('devis')||[];
  const ageJ=ds=>ds?Math.floor((now-new Date(ds+'T00:00'))/86400000):0;
  const devisRelance=devis.filter(dv=>dv.statut==='envoye'&&ageJ(dv.date)>14);
  if(devisRelance.length){const dv0=devisRelance.slice().sort((a,b)=>(a.date||'').localeCompare(b.date||''))[0];ins.push({t:'warn',nav:'devis',txt:devisRelance.length+' devis en attente de réponse ('+fmt(devisRelance.reduce((s,x)=>s+(x.montant||0),0))+'). Relance '+(dv0.client||dv0.numero||'le plus ancien')+' — sans nouvelle depuis '+ageJ(dv0.date)+' j.'});}

  // Projection de trésorerie sur 3 mois (récurrent − charges − URSSAF à venir)
  const caTrim=mois=>{const q=Math.floor((mois-1)/3),mm=[q*3+1,q*3+2,q*3+3];return factures.filter(f=>f.statut==='payee'&&(((f.datePaiement||f.date||'')+'').startsWith(String(y)))&&mm.includes(parseInt(((f.datePaiement||f.date||'')+'').slice(5,7)))).reduce((s,f)=>s+(f.montant||0),0);};
  const urssafDueMonth={4:'T1',7:'T2',10:'T3',1:'T4'};
  let bal=soldeReel,dip=null;
  for(let k=1;k<=3&&!dip;k++){
    let mm=m+k,yy=y;while(mm>12){mm-=12;yy++;}
    let out=burnMensuel;
    const tq=urssafDueMonth[mm];
    if(tq){const paye=(urssafObj[tq+'-'+(mm===1?yy-1:yy)]||{}).statut==='paye';if(!paye)out+=Math.round(caTrim(mm===1?12:mm-1)*(tauxU+tauxC));}
    bal+=recMensuel-out;
    if(bal<0)dip={mm,bal};else if(bal<burnMensuel)dip={mm,bal,tendu:true};
  }
  if(dip)ins.push({t:'warn',txt:'Trésorerie à surveiller : avec tes charges et l\\'URSSAF à venir, ton solde '+(dip.tendu?'deviendrait tendu':'passerait dans le rouge')+' vers '+MOIS_LONG[dip.mm-1]+' (~'+fmt(dip.bal)+'). Anticipe une rentrée ou mets de côté dès maintenant.'});

  // Hausse anormale de dépenses (dernier mois clôturé vs moyenne des 3 précédents)
  const depMoisF=(yy,mm)=>depenses.filter(d=>(d.date||'').startsWith(yy+'-'+String(mm).padStart(2,'0'))&&d.categorie!=='Versement perso').reduce((s,x)=>s+(x.montant||0),0);
  {let lm=m-1,ly=y;if(lm<1){lm+=12;ly--;}const dLast=depMoisF(ly,lm);const prev=[2,3,4].map(k=>{let mm=m-k,yy=y;while(mm<1){mm+=12;yy--;}return depMoisF(yy,mm);});const moy=prev.reduce((s,x)=>s+x,0)/3;if(moy>0&&dLast>moy*1.4)ins.push({t:'warn',nav:'depenses',txt:'Tes dépenses de '+MOIS_LONG[lm-1]+' ('+fmt(dLast)+') sont '+Math.round((dLast/moy-1)*100)+'% au-dessus de ta moyenne récente ('+fmt(moy)+'). Regarde ce qui a changé.'});}

  // Autonomie de trésorerie si l'activité tombe à zéro
  if(joursRupture>0&&joursRupture<60)ins.push({t:'warn',txt:'Sans nouvelle rentrée d\\'argent, ta trésorerie tiendrait environ '+joursRupture+' jours.'});

  if(!ins.length)ins.push({t:'good',txt:'Tout est au vert. Rien qui demande ton attention aujourd\\'hui.'});
  const prio={warn:0,info:1,good:2};
  ins.sort((a,b)=>(prio[a.t]||9)-(prio[b.t]||9));

  // Opérations Qonto non catégorisées (pour la todo)
  let aRanger=0; try{const ce=computeEnveloppes();aRanger=(ce.aranger||[]).length;}catch(e){}
  return {score,indics,ins,disponible,soldeReel,moisSecurite,joursRupture,burnMensuel,revenuMoyen,recMensuel,topClient,topClientPct,caMois,caMoisPrec,deltaMois,caYTD,objectifCA,pctObjectif,ecartObjectif,attenduYTD,projAnnuel,pctPlafond,retard,attente,urssafProchain,aRanger,devisRelance,recDetail};
}

function renderCockpit(){
  const el=q('#dash-cockpit'); if(!el)return;
  let M; try{M=computeMoney();}catch(e){el.innerHTML='';return;}
  const d=M.intel||{};
  const settings=dbGetObj('settings');
  const now=new Date(); const y=now.getFullYear(), m=now.getMonth()+1;
  const scoreLabel=M.score>=80?'Solide':M.score>=55?'Correct':'Fragile';
  const dotCol=M.vLevel==='vert'?'#8fbf7f':M.vLevel==='ambre'?'#d9a878':'#e0796e';
  const pbar=v=>v>=70?'#8fbf7f':v>=45?'#d9a878':'#e0796e';

  if(M.besoinMin<=0){
    el.innerHTML=\`<div style="background:var(--navy);border-radius:24px;padding:34px 38px;color:#f2e7dd;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;opacity:.55;">Tableau de bord · \${MOIS_LONG[m-1]} \${y}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:30px;margin:10px 0 6px;">Renseigne ton budget perso pour commencer.</div>
      <div style="font-size:15px;opacity:.82;max-width:60ch;">Finance a besoin de ton niveau de vie pour te dire combien te verser, combien garder et combien il te reste pour vivre.</div>
      <button class="btn btn-sm" style="margin-top:18px;background:var(--glycine);color:var(--terre);border:none;font-weight:700;" onclick="navigate('budget-perso')"><i class="ti ti-arrow-right"></i> Renseigner mon budget perso</button>
    </div>\`;
    return;
  }

  // ── niveau 1 : héros marron ──
  const fig=(k,val,s,big)=>\`<div><div style="font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:#cabf95;">\${k}</div><div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:\${big?'54px':'40px'};line-height:.95;margin-top:7px;color:\${big?'var(--glycine)':'#fff'};">\${fmt(val)}</div><div style="font-size:13px;color:#cabf95;margin-top:4px;">\${s}</div></div>\`;
  const pil=(icon,nm,v)=>\`<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(242,229,194,.9);margin-top:8px;"><span style="width:96px;display:flex;align-items:center;gap:6px;"><i class="ti \${icon}"></i>\${nm}</span><span style="flex:1;height:6px;border-radius:4px;background:rgba(242,229,194,.16);overflow:hidden;"><i style="display:block;height:100%;border-radius:4px;width:\${v}%;background:\${pbar(v)};"></i></span></div>\`;
  const hero=\`<div style="background:var(--navy);border-radius:24px;padding:32px 36px;color:#f2e7dd;display:flex;gap:32px;flex-wrap:wrap;justify-content:space-between;">
    <div style="flex:1;min-width:280px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#cabf95;">Ton mois · \${MOIS_LONG[m-1]} \${y}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:29px;line-height:1.12;margin:12px 0 24px;color:#fff;display:flex;align-items:center;gap:12px;"><span style="width:12px;height:12px;border-radius:50%;background:\${dotCol};flex:none;"></span>\${M.verdict}</div>
      <div style="display:flex;gap:34px;flex-wrap:wrap;align-items:flex-end;">
        \${fig('Versement conseillé',M.versement,'à te verser',true)}
        \${fig('Besoin',M.besoinMin,'pour vivre',false)}
        \${fig('Argent libre',M.argentLibre,'sans mission',false)}
      </div>
    </div>
    <div style="flex:none;min-width:196px;">
      <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:60px;line-height:.85;color:#fff;">\${M.score}<span style="font-family:inherit;font-style:normal;font-size:20px;color:#cabf95;font-weight:600;font-family:'Inter Tight',sans-serif;">/100</span></div>
      <div style="font-size:12px;color:#cabf95;margin:2px 0 14px;">Santé financière · \${scoreLabel}</div>
      \${pil('ti-building','Trésorerie',M.pillars.treso)}\${pil('ti-shield','Réserves',M.pillars.reserve)}\${pil('ti-trending-up','Activité',M.pillars.activite)}\${pil('ti-heart','Perso',M.pillars.perso)}\${pil('ti-plant-2','Patrimoine',M.pillars.patri)}
    </div>
  </div>\`;

  // ── soonbar (échéance URSSAF / relance) ──
  let soon='';
  if(d.urssafProchain&&d.urssafProchain.jours<=45){
    soon=\`<div style="display:flex;align-items:center;gap:14px;background:var(--ambre-bg);box-shadow:inset 0 0 0 1px #e7c3ac;border-radius:16px;padding:16px 18px;">
      <span style="width:38px;height:38px;border-radius:11px;background:var(--ambre);color:#fff;display:grid;place-items:center;flex:none;"><i class="ti ti-alert-triangle"></i></span>
      <div style="flex:1;font-size:15px;color:#3d1c0b;">URSSAF \${d.urssafProchain.t} — échéance <strong>dans \${d.urssafProchain.jours} j</strong>. Garde de côté ce qu'il faut.</div>
      <button class="btn btn-sm" style="background:var(--terre);color:var(--paille);border:none;font-weight:700;" onclick="navigate('charges-urssaf')">Voir</button>
    </div>\`;
  }

  // ── niveau 2 : le plan (crème) ──
  const supAll=Array.isArray(settings.persoEpargne)?settings.persoEpargne:[];
  const projVie=Array.isArray(settings.projetsVie)?settings.projetsVie:[];
  const detEp=supAll.filter(e=>(parseFloat(e.montant)||0)>0).map(e=>escHtml(e.nom||supType(e.cat).nom)+' '+fmt(parseFloat(e.montant)||0)).join(' · ');
  const detPr=projVie.filter(p=>(parseFloat(p.mensualite)||0)>0).map(p=>escHtml(p.nom||'Projet')+' '+fmt(parseFloat(p.mensualite)||0)).join(' · ');
  const ymC=y+'-'+String(m).padStart(2,'0');
  const canApply=supAll.some(e=>(parseFloat(e.montant)||0)>0&&e.lastVersement!==ymC)||projVie.some(p=>(parseFloat(p.mensualite)||0)>0&&p.lastVersement!==ymC);
  let prIdx=0;
  const prow=(icon,nom,det,val,hl)=>{const b=prIdx++?'border-top:1px solid var(--border);':'';return \`<div style="display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:15px;padding:17px 0;\${b}">
    <span style="width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;background:\${hl?'var(--glycine)':'var(--surface-2)'};color:\${hl?'var(--bleu)':'var(--terre-600)'};"><i class="ti \${icon}"></i></span>
    <div><div style="font-family:'Cormorant Garamond',serif;font-size:23px;color:var(--navy);line-height:1.15;">\${nom}</div>\${det?'<div style="font-size:13px;font-weight:600;color:var(--text-2);margin-top:2px;">'+det+'</div>':''}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:30px;color:\${hl?'var(--bleu)':'var(--navy)'};justify-self:end;">\${fmt(val)}</div>
  </div>\`;};
  const plan=\`<div class="card" style="padding:28px 30px;">
    <div class="dash-sec-title" style="font-size:14px;"><i class="ti ti-bulb"></i> Ton plan de \${MOIS_LONG[m-1]} — ce que Finance te recommande</div>
    \${prow('ti-wallet','Te verser','Versement personnel',M.versement,true)}
    \${M.epargnePrevue>0?prow('ti-plant-2','Mettre de côté',detEp,M.epargnePrevue,false):''}
    \${M.projetsMensuel>0?prow('ti-target','Financer tes projets',detPr,M.projetsMensuel,false):''}
    \${prow('ti-mood-smile','Garder libre','pour toi, sans mission',M.argentLibre,false)}
    <div style="margin-top:22px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      \${canApply?\`<button class="btn btn-sm" style="background:var(--terre);color:var(--paille);border:none;font-weight:700;letter-spacing:.04em;text-transform:uppercase;" onclick="appliquerEpargneMois()"><i class="ti ti-check"></i> Valider mon plan</button>\`:\`<span style="font-size:13.5px;color:#456039;"><i class="ti ti-circle-check"></i> Plan déjà appliqué ce mois.</span>\`}
      <span style="font-size:13px;color:var(--text-2);">Tu pourras ajuster chaque montant.</span>
    </div>
  </div>\`;

  // ── niveau 3 : sections ──
  const grpLbl=t=>\`<div style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--terre-600);margin:0 0 18px 4px;">\${t}</div>\`;
  const li=(lab,val,cls)=>\`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 0;font-size:14px;\${cls==='tot'?'border-top:1px solid var(--border);margin-top:3px;padding-top:11px;font-weight:700;color:var(--navy);':'color:var(--text-2);'}"><span>\${lab}</span><span style="font-family:'Cormorant Garamond',serif;font-size:\${cls==='tot'?'22px':'18px'};\${cls==='neg'?'color:var(--danger);':''}">\${val}</span></div>\`;
  const pourquoi=\`<div style="padding-top:8px;">\${grpLbl('Pourquoi ces montants')}
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px;align-items:stretch;">
      <div style="background:var(--surface);border-radius:20px;padding:26px 28px;">
        <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:16px;display:flex;align-items:center;gap:9px;"><i class="ti ti-building" style="font-style:normal;color:var(--terre-600);"></i> Ton entreprise</div>
        \${li('Disponible entreprise <span style="font-size:11px;font-weight:700;text-transform:uppercase;background:var(--surface-2);color:var(--terre-600);padding:2px 8px;border-radius:999px;">après réserves</span>',fmt(M.dispoEntreprise))}
        \${li('dont réserve de sécurité (3 mois)',fmt(M.reserveSecu))}
        \${li('Versement conseillé',fmt(M.versement),'tot')}
        \${li('Trésorerie restante',fmt(M.tresoRestante))}
      </div>
      <div style="background:var(--bleu-bg);border-radius:20px;padding:26px 28px;">
        <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:16px;display:flex;align-items:center;gap:9px;"><i class="ti ti-home" style="font-style:normal;color:var(--bleu);"></i> Ton budget perso</div>
        \${li('Versement + autres revenus',fmt(M.revenusPersoTotal),'tot')}
        \${li('− dépenses',fmt(M.depensesPerso),'neg')}
        \${(M.epargnePrevue+M.projetsMensuel)>0?li('− épargne + projets',fmt(M.epargnePrevue+M.projetsMensuel),'neg'):''}
        \${li('Argent libre',fmt(M.argentLibre),'tot')}
      </div>
    </div>
  </div>\`;

  const objCA=parseFloat(settings.objectifCA)||0;
  const pctO=objCA>0?Math.min(100,Math.round(d.caYTD/objCA*100)):0;
  const stat=(k,v)=>\`<div><div style="font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--terre-400);">\${k}</div><div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:29px;color:var(--navy);margin-top:3px;">\${v}</div></div>\`;
  const activite=\`<div style="padding-top:30px;">\${grpLbl('Activité & avenir')}
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px;align-items:stretch;">
      <div class="card" style="padding:26px 28px;">
        <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:16px;display:flex;align-items:center;gap:9px;"><i class="ti ti-trending-up" style="font-style:normal;color:var(--terre-600);"></i> Ton activité</div>
        <div style="display:flex;gap:34px;flex-wrap:wrap;">\${stat('CA encaissé · mois',fmt(d.caMois||0))}\${stat('CA encaissé · année',fmt(d.caYTD||0))}\${objCA>0?stat('Objectif',fmt(objCA)):''}</div>
        \${d.ecartObjectif<0?\`<div style="font-size:14px;color:var(--ambre);background:var(--ambre-bg);border-radius:12px;padding:12px 14px;margin-top:16px;display:flex;gap:8px;align-items:flex-start;"><i class="ti ti-alert-triangle" style="margin-top:2px;"></i><span>Retard de \${fmt(-d.ecartObjectif)} sur ton objectif. Le CA encaissé n'est pas de l'argent disponible.</span></div>\`:''}
        <button class="btn btn-outline btn-sm" style="margin-top:18px;" onclick="navigate('rapport-prevision')">Voir mes prévisions <i class="ti ti-arrow-right"></i></button>
      </div>
      <div class="card" style="padding:26px 28px;">
        <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:16px;display:flex;align-items:center;gap:9px;"><i class="ti ti-plant-2" style="font-style:normal;color:var(--bleu);"></i> Ce que tu construis</div>
        <div style="display:flex;gap:30px;flex-wrap:wrap;">\${stat('Patrimoine perso',fmt(M.patriPerso))}\${stat('Trésorerie pro',fmt(M.tresoPro))}\${M.moisLiberte!=null?stat('Liberté',String(M.moisLiberte).replace('.',',')+' mois'):''}</div>
        <button class="btn btn-outline btn-sm" style="margin-top:18px;" onclick="navigate('patrimoine')">Voir mon patrimoine <i class="ti ti-arrow-right"></i></button>
      </div>
    </div>
  </div>\`;

  // à retenir
  const todo=[];
  if(d.retard&&d.retard.length)todo.push({lv:'r',ic:'ti-file-invoice',t:'Factures',s:d.retard.length+' en retard',nav:'factures'});
  if(d.devisRelance&&d.devisRelance.length)todo.push({lv:'n',ic:'ti-file-text',t:'Devis',s:d.devisRelance.length+' à relancer',nav:'devis'});
  if(d.urssafProchain&&d.urssafProchain.jours<=45)todo.push({lv:'n',ic:'ti-calendar',t:'URSSAF',s:'dans '+d.urssafProchain.jours+' j',nav:'charges-urssaf'});
  if(d.aRanger)todo.push({lv:'c',ic:'ti-inbox',t:'À ranger',s:d.aRanger+' opération'+(d.aRanger>1?'s':''),nav:'enveloppes'});
  const indic=t=>{var bg=t.lv==='r'?'var(--paille)':t.lv==='n'?'var(--bleu-bg)':'var(--surface-2)';var ib=t.lv==='r'?'background:var(--ambre);color:#fff;':t.lv==='n'?'background:var(--glycine);color:var(--bleu);':'background:var(--surface);color:var(--text-2);';return \`<button onclick="navigate('\${t.nav}')" style="display:flex;align-items:center;gap:12px;text-align:left;background:\${bg};border:none;border-radius:13px;padding:16px 18px;cursor:pointer;height:100%;font-family:inherit;"><span style="width:34px;height:34px;border-radius:9px;display:grid;place-items:center;flex:none;background:var(--card);color:var(--terre-600);"><i class="ti \${t.ic}"></i></span><span style="flex:1;min-width:0;"><b style="display:block;font-size:14px;color:var(--navy);">\${t.t}</b><small style="font-size:12px;color:var(--text-2);">\${t.s}</small></span><span style="font-size:12px;font-weight:700;border-radius:999px;padding:2px 9px;\${ib}">→</span></button>\`;};
  const aretenir=todo.length?\`<div style="padding-top:38px;">\${grpLbl('À faire · à surveiller')}
    <div class="card" style="padding:26px 28px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">\${todo.slice(0,4).map(indic).join('')}</div>
    </div>
  </div>\`:'';

  el.innerHTML=\`<div style="display:flex;flex-direction:column;gap:20px;">\${hero}\${soon}\${plan}\${pourquoi}\${activite}\${aretenir}
    <div style="text-align:center;padding-top:8px;"><span style="font-size:13.5px;color:var(--text-2);cursor:pointer;" onclick="var t=q('#dash-trends');if(t)t.scrollIntoView({behavior:'smooth'});">Voir mes tendances sur 12 mois <i class="ti ti-chevron-down"></i></span></div>
  </div>\`;
}

function loadDashboard(){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth()+1;
  const mKey=\`\${y}-\${String(m).padStart(2,'0')}\`;
  if(q('#dash-period'))q('#dash-period').textContent=\`\${MOIS_LONG[m-1]} \${y}\`;
  try{renderCockpit();}catch(e){}
  try{renderTrends();}catch(e){}
  // Historise le score de santé une fois par mois (pour l'évolution ↗/↘)
  try{
    const ii=computeIntel();
    const st=dbGetObj('settings'); st.scoreHist=st.scoreHist||{};
    const ymNow=y+'-'+String(m).padStart(2,'0');
    if(st.scoreHist[ymNow]==null){st.scoreHist[ymNow]=ii.score;api('PUT','/api/settings',st).then(r=>{if(r)_cache.settings=r;}).catch(()=>{});}
  }catch(e){}

  const factures    = dbGet('factures');
  const depenses    = dbGet('depenses');
  const abonnements = dbGet('abonnements');
  const transactions= dbGet('transactions');
  const settings    = dbGetObj('settings');
  const urssafObj   = dbGetObj('urssaf');

  const tauxU=(settings.tauxUrssaf||25.6)/100;
  const tauxC=(settings.tauxCfp||0.2)/100;
  const pas  =settings.pasFixe||40;

  // CA mois courant — base encaissements (datePaiement en priorité)
  const caMois=factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  // CA YTD
  const caYTD=factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(String(y))).reduce((s,f)=>s+(f.montant||0),0);
  const objectif=settings.objectifCA||60000;
  const progressionCA=objectif>0?Math.round(caYTD/objectif*100):0;

  // Charges mois courant
  const urssafM=Math.round(caMois*tauxU*100)/100;
  const cfpM   =Math.round(caMois*tauxC*100)/100;
  const depM   =depenses.filter(d=>(d.date||'').startsWith(mKey)&&d.categorie!=='Versement perso').reduce((s,d)=>s+(d.montant||0),0);
  const aboM   =abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const chargesTotal=urssafM+cfpM+pas+depM+aboM;
  const netMois=Math.max(0,caMois-chargesTotal);
  const versementEstime=Math.round(netMois*(settings.pctVersement||65)/100);

  // Trésorerie Qonto — solde calculé (sinon solde manuel)
  const tresoQonto=_qontoSoldeCalc!==null?_qontoSoldeCalc:dbGet('comptes').filter(c=>c.type==='courant'||c.type==='professionnel').reduce((s,c)=>s+(c.solde||0),0);

  // Prochaine échéance URSSAF
  const echeances={
    'T1':'2026-04-30','T2':'2026-07-31',
    'T3':'2026-11-02','T4':'2027-02-01'
  };
  const labels={'T1':'T1 (jan–mar)','T2':'T2 (avr–jun)','T3':'T3 (jul–sep)','T4':'T4 (oct–déc)'};
  let prochaineEcheance=null;
  ['T1','T2','T3','T4'].forEach(t=>{
    const cle=\`\${t}-\${y}\`;
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
  if(q('#kpi-objectif-pct'))q('#kpi-objectif-pct').textContent=\`\${progressionCA}%\`;
  if(q('#kpi-objectif-bar'))q('#kpi-objectif-bar').style.width=\`\${Math.min(progressionCA,100)}%\`;
  if(q('#kpi-treso-qonto'))q('#kpi-treso-qonto').textContent=fmt(tresoQonto);
  if(prochaineEcheance){
    if(q('#kpi-urssaf-next'))q('#kpi-urssaf-next').textContent=prochaineEcheance.joursRestants>0?\`\${prochaineEcheance.joursRestants} j\`:'Aujourd\\'hui';
    if(q('#kpi-urssaf-sub'))q('#kpi-urssaf-sub').textContent=\`\${prochaineEcheance.label} · \${fmtDate(prochaineEcheance.echeance)}\`;
  }

  // Graphique CA 12 mois
  const caParMois=MOIS_COURT.map((_,mi)=>{
    const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;
    return factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);
  });
  const netParMois=caParMois.map((ca,i)=>Math.max(0,ca));

  // Seuil de rentabilité : CA minimum pour couvrir charges fixes sans versement
  const abosMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const seuilMensuel=Math.round((abosMois+pas)/Math.max(0.01,1-tauxU-tauxC));
  const objectifMensuel=Math.round((settings.objectifCA||60000)/12);

  const c1=q('#chart-dash-bar');
  if(c1)drawBarChart(c1,MOIS_COURT,[{data:caParMois,color:COLORS.blue}],{targetLine:objectifMensuel,seuilLine:seuilMensuel});
  const leg=q('#chart-dash-bar-legend');
  if(leg)leg.innerHTML=
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#456039"></div>CA objectif atteint</div>\`+
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#a5502e"></div>CA proche</div>\`+
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#8d2b21"></div>CA insuffisant</div>\`+
    \`<div class="chart-legend-item"><div style="border-top:2px dashed #1A2E5A;width:16px;margin-top:4px;"></div>Objectif</div>\`+
    \`<div class="chart-legend-item"><div style="border-top:2px dashed #9e9e9e;width:16px;margin-top:4px;"></div>Seuil</div>\`;

  // Encart analyse
  const moisOk=caParMois.filter((v,i)=>v>0&&v>=objectifMensuel).length;
  const moisKo=caParMois.filter((v,i)=>v>0&&v<seuilMensuel).length;
  const moisVide=caParMois.filter(v=>v===0).length;
  const alertEl=q('#dash-analyse-ca');
  if(alertEl){
    alertEl.innerHTML=
      \`<div style="background:#F5F3EF;border-radius:10px;padding:14px 16px;margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">\`+
      \`<div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Objectif mensuel</div><div style="font-size:16px;font-weight:700;color:var(--navy);">\${fmt(objectifMensuel)}</div><div style="font-size:12px;color:var(--text-2);">pour \${settings.objectifCA||60000} €/an</div></div>\`+
      \`<div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Seuil minimum</div><div style="font-size:16px;font-weight:700;color:#a5502e;">\${fmt(seuilMensuel)}</div><div style="font-size:12px;color:var(--text-2);">juste pour couvrir les charges</div></div>\`+
      \`<div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Mois en vert</div><div style="font-size:16px;font-weight:700;color:#456039;">\${moisOk} / \${12-moisVide}</div><div style="font-size:12px;color:var(--text-2);">\${moisKo>0?moisKo+' mois sous le seuil':'Tous les mois couverts'}</div></div>\`+
      \`</div>\`;
  }

  const c2=q('#chart-dash-line');
  if(c2)drawLineChart(c2,MOIS_COURT,netParMois,COLORS.success);

  // Dernières transactions
  const tEl=q('#dash-transactions-list');
  if(tEl){
    const tx=[...transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    tEl.innerHTML=tx.length?tx.map(t=>\`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;">
        <div><div style="font-weight:500;">\${t.libelle||'—'}</div><div style="font-size:12px;color:var(--text-2);">\${fmtDate(t.date)}</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:17px;color:\${t.type==='credit'?'var(--success)':'var(--danger)'};">\${t.type==='credit'?'+':'−'}\${fmt(t.montant||0)}</span>
      </div>\`).join(''):'<p style="font-size:14px;color:var(--text-2);padding:12px 0;">Aucune transaction</p>';
  }

  // Prochains abonnements
  const aEl=q('#dash-abonnements-list');
  if(aEl){
    const todayD=now.getDate();
    const actifs=abonnements.filter(a=>a.statut==='actif').map(a=>{
      let j=(a.jour||1)-todayD;if(j<0)j+=31;
      return{...a,joursAvant:j};
    }).sort((a,b)=>a.joursAvant-b.joursAvant).slice(0,5);
    aEl.innerHTML=actifs.length?actifs.map(a=>\`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:14px;">
        <div><div style="font-weight:500;">\${a.nom}</div><div style="font-size:12px;color:var(--text-2);">Jour \${a.jour||'—'} · dans \${a.joursAvant} j</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:17px;color:var(--navy);">\${fmt(a.montant||0)}</span>
      </div>\`).join(''):'<p style="font-size:14px;color:var(--text-2);padding:12px 0;">Aucun abonnement actif</p>';
  }

  // Alerte URSSAF si ≤ 30 jours
  const alEl=q('#dash-urssaf-alert');
  if(alEl){
    if(prochaineEcheance&&prochaineEcheance.joursRestants<=30){
      alEl.innerHTML=\`<div class="alert danger"><i class="ti ti-alert-triangle"></i> URSSAF \${prochaineEcheance.label} à payer dans \${prochaineEcheance.joursRestants} jours (échéance \${fmtDate(prochaineEcheance.echeance)})</div>\`;
    }else alEl.innerHTML='';
  }
}

/* --- Qonto Sync ------------------------------------------------------- */
let _lastQontoSync=0;
const QONTO_SYNC_COOLDOWN=5*60*1000; // 5 minutes entre deux syncs automatiques

async function syncQonto(silent=false){
  // En mode silencieux, skip si sync trop récent
  if(silent&&Date.now()-_lastQontoSync<QONTO_SYNC_COOLDOWN)return;
  const btn=q('#btn-qonto-sync');
  if(!silent&&btn){btn.disabled=true;btn.innerHTML='<i class="ti ti-loader-2"></i> Sync...';}
  try{
    const res=await api('POST','/api/qonto/sync');
    if(res.error){
      if(!silent)toast('Erreur Qonto : '+res.error,'error');
      return;
    }
    // Met à jour le cache settings avec le vrai solde
    _lastQontoSync=Date.now();
    if(res.solde!==undefined){
      _cache.settings=_cache.settings||{};
      _cache.settings.qontoSoldeReel=res.solde;
      _cache.settings.qontoSyncAt=new Date().toISOString();
      _qontoSoldeCalc=res.solde;
    }
    if(!silent){
      toast(res.message||'Sync Qonto OK','success');
      // Bouton manuel : reload complet
      await loadAll();
      renderComptes();
      loadDashboard();
      loadEnveloppes();
    }
  }catch(e){if(!silent)toast('Erreur reseau : '+e.message,'error');}
  finally{
    if(!silent&&btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-refresh"></i> Sync Qonto';}
  }
}

/* --- Enveloppes ------------------------------------------------------- */
/* Enveloppes = lecture des vraies transactions Qonto, jamais de virement manuel.
   URSSAF & Charges se calculent seules ; Formation & Trésorerie = budgets que tu fixes. */
const ENV_DEF=[
  {id:'urssaf',       nom:'URSSAF + CFP',   icone:'ti-building-bank', couleur:'#8d2b21', auto:true },
  {id:'charges',      nom:'Charges fixes',  icone:'ti-receipt',       couleur:'#a5502e', auto:true },
  {id:'formation',    nom:'Formation',      icone:'ti-school',        couleur:'#7C3AED', auto:false},
  {id:'soustraitance',nom:'Sous-traitance', icone:'ti-users-group',   couleur:'#2AA9A0', auto:false},
  {id:'engagements',  nom:'Engagements à venir', icone:'ti-calendar-check', couleur:'#2c4a72', auto:false},
  {id:'tresorerie',   nom:'Trésorerie',     icone:'ti-safe',          couleur:'#456039', auto:false},
];
// Catégories assignables à une opération (dans l'ordre proposé au re-classement)
const ENV_CATS=['urssaf','charges','formation','soustraitance','versement','ignore'];
const ENV_LABELS={ca:'Entrée',urssaf:'URSSAF',charges:'Charges',formation:'Formation',soustraitance:'Sous-traitance',versement:'Versement perso',autre:'À ranger',ignore:'Ignorer'};

// Range une transaction Qonto : 'ca' (entrée), une enveloppe, 'versement', 'ignore', ou 'autre' (non reconnu)
function classifyTx(t,overrides){
  if(t.type==='credit')return 'ca';
  const key=t.qontoId||t.id;
  if(overrides&&overrides[key])return overrides[key];
  const lib=(t.libelle||'').toLowerCase();
  const cat=(t.categorie||'').toLowerCase();
  if(/urssaf|dgfip|impot|impôt|cotisation|net-entreprises|carsat|rsi/.test(lib)||cat==='tax')return 'urssaf';
  if(/formation|masterclass|bootcamp|webinaire|e-learning|certification/.test(lib))return 'formation';
  if(/prestation|prestataire|freelance|sous-trait|accompagnement|coaching|prospection|consultant|mentor/.test(lib))return 'soustraitance';
  if(cat==='subscription'||cat==='online_service'||/abonnement|adobe|google|microsoft|notion|canva|slack|zoom|figma|linkedin|ovh|hostinger|make\.com|zapier/.test(lib))return 'charges';
  if(/salaire|versement perso|virement perso/.test(lib))return 'versement';
  return 'autre';
}

let _envCtx=null;

async function loadEnveloppes(){
  try{await syncQonto(true);}catch(e){}
  renderEnveloppes();
}

function computeEnveloppes(){
  const settings=dbGetObj('settings');
  const transactions=dbGet('transactions')||[];
  const factures=dbGet('factures')||[];
  const abonnements=dbGet('abonnements')||[];
  const annee=new Date().getFullYear();
  const overrides=settings.envTx||{};

  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100;
  const tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const budgetFormation=parseFloat(settings.budgetFormations)||2000;
  const cibleTreso=parseFloat(settings.objectifTresorerie)||0;
  const horizonCharges=settings.chargesHorizonMois!=null?parseInt(settings.chargesHorizonMois):1;

  const soldeReel=settings.qontoSoldeReel!=null?parseFloat(settings.qontoSoldeReel):(typeof _qontoSoldeCalc!=='undefined'&&_qontoSoldeCalc!=null?_qontoSoldeCalc:0);

  // CA réellement encaissé (factures payées de l'année) → base URSSAF
  const caEncaisse=factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(String(annee))).reduce((s,f)=>s+(f.montant||0),0);

  // Dépenses réelles ventilées depuis les transactions Qonto
  const budgetSoustraitance=parseFloat(settings.budgetSoustraitance)||0;
  const paye={urssaf:0,charges:0,formation:0,soustraitance:0,versement:0};
  const listes={urssaf:[],charges:[],formation:[],soustraitance:[],versement:[],autre:[]};
  const debits=[]; // toutes les dépenses avec leur catégorie courante (pour re-classer)
  transactions.forEach(t=>{
    if(t.type!=='debit')return;
    const c=classifyTx(t,overrides);
    debits.push({...t,cat:c});
    if(c==='ignore')return;
    if(c==='autre'){listes.autre.push(t);return;}
    if(paye[c]!=null)paye[c]+=(t.montant||0);
    if(listes[c])listes[c].push(t);
  });

  const aboMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const urssafDu=Math.round(caEncaisse*(tauxU+tauxC)*100)/100;
  const chargesBudget=Math.round(aboMois*Math.max(0,horizonCharges)*100)/100;

  // Engagements à venir : réservations manuelles (total − acompte déjà payé)
  const engagements=Array.isArray(settings.engagements)?settings.engagements:[];
  const engTotal=engagements.reduce((s,e)=>s+(parseFloat(e.total)||0),0);
  const engPaye=engagements.reduce((s,e)=>s+(parseFloat(e.paye)||0),0);
  const engReste=engagements.reduce((s,e)=>s+Math.max(0,(parseFloat(e.total)||0)-(parseFloat(e.paye)||0)),0);

  const env={
    urssaf:      {budget:urssafDu,           paye:paye.urssaf,       reste:Math.max(0,urssafDu-paye.urssaf),                   liste:listes.urssaf},
    charges:     {budget:chargesBudget,      paye:paye.charges,      reste:chargesBudget,                                      liste:listes.charges},
    formation:   {budget:budgetFormation,    paye:paye.formation,    reste:Math.max(0,budgetFormation-paye.formation),         liste:listes.formation},
    soustraitance:{budget:budgetSoustraitance,paye:paye.soustraitance,reste:budgetSoustraitance>0?Math.max(0,budgetSoustraitance-paye.soustraitance):0,liste:listes.soustraitance},
    engagements: {budget:engTotal,           paye:engPaye,           reste:engReste,                                           liste:[], items:engagements},
    tresorerie:  {budget:cibleTreso,         paye:0,                 reste:cibleTreso,                                         liste:[]},
  };
  const totalReserve=env.urssaf.reste+env.charges.reste+env.formation.reste+env.soustraitance.reste+env.engagements.reste+env.tresorerie.reste;
  return {settings,soldeReel,caEncaisse,env,totalReserve,disponible:soldeReel-totalReserve,aranger:listes.autre,debits};
}

function renderEnveloppes(){
  const g=q('#enveloppes-grid');
  if(!g)return;
  const ctx=computeEnveloppes();
  _envCtx=ctx;
  const {soldeReel,totalReserve,disponible,env,aranger}=ctx;

  // Bandeau : Solde réel − Réservé = Disponible
  const banner=q('#enveloppes-banner');
  if(banner){
    const dispColor=disponible<0?'#F87171':'#b7d3ad';
    const col=(lab,val,hint,color)=>\`<div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.09em;opacity:.6;margin-bottom:5px;">\${lab}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:31px;font-weight:\${color?700:600};\${color?'color:'+color+';':''}">\${fmt(val)}</div>
      <div style="font-size:12px;opacity:.55;margin-top:4px;">\${hint}</div>
    </div>\`;
    banner.innerHTML=\`<div style="background:var(--navy);border-radius:14px;padding:20px 26px;color:#fff;">
      <div style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:14px;align-items:center;">
        \${col('Solde réel Qonto',soldeReel,'Synchronisé depuis ta banque')}
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;opacity:.4;text-align:center;">−</div>
        \${col('Total réservé',totalReserve,'Somme des enveloppes')}
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;opacity:.4;text-align:center;">=</div>
        \${col('Disponible à te verser',disponible,disponible<0?'Tes réserves dépassent ton solde':'Ce qui reste vraiment libre',dispColor)}
      </div>
    </div>\`;
  }

  // Cartes enveloppes
  g.innerHTML=ENV_DEF.map(def=>{
    const e=env[def.id];
    if(def.id==='engagements')return renderEngagementsCard(def,e);
    const pct=e.budget>0?Math.min(100,Math.round((e.paye/e.budget)*100)):0;
    const badge=def.auto
      ? '<span style="font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 8px;border-radius:999px;color:#456039;background:rgba(62,158,116,.13);">Automatique</span>'
      : '<span style="font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 8px;border-radius:999px;color:#7C3AED;background:rgba(124,58,237,.13);">'+(e.budget>0?'Budget défini':'À définir')+'</span>';
    const row=(k,v)=>\`<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-2);">\${k}</span><span style="font-family:'Cormorant Garamond',serif;">\${fmt(v)}</span></div>\`;
    let detail='';
    if(def.id==='urssaf')          detail=row('Dû sur ton CA encaissé',e.budget)+row('Déjà payé (Qonto)',e.paye);
    else if(def.id==='formation')  detail=row('Budget / an',e.budget)+row('Déjà payé (Qonto)',e.paye);
    else if(def.id==='charges')    detail=row('Abonnements couverts',e.budget);
    else if(def.id==='soustraitance')detail=(e.budget>0?row('Budget / an',e.budget):'')+row('Déjà payé (Qonto)',e.paye);
    const noBudget=(def.id==='tresorerie'||def.id==='soustraitance')&&e.budget===0;
    const bigVal=noBudget?(def.id==='soustraitance'?fmt(e.paye):'—'):fmt(e.reste);
    const bigLab=noBudget?(def.id==='soustraitance'?'dépensé cette année':'aucun montant défini'):'à garder de côté';
    const txHtml=e.liste.length
      ? e.liste.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,4).map(t=>\`<div style="display:flex;justify-content:space-between;gap:8px;font-size:12.5px;padding:4px 0;">
          <span style="color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${fmtDate(t.date)} · \${escHtml(t.libelle||'—')}</span>
          <span style="font-family:'Cormorant Garamond',serif;white-space:nowrap;">−\${fmt(t.montant)}</span>
        </div>\`).join('')
      : '';
    const footer=(def.id==='tresorerie'&&e.budget===0)
      ? '<button onclick="openEnvReglages()" style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px 12px;cursor:pointer;font-size:13px;font-weight:600;color:var(--navy);"><i class="ti ti-plus"></i> Définir un montant</button>'
      : (txHtml?\`<div style="border-top:1px dashed var(--border);padding-top:8px;">\${txHtml}</div>\`:'');

    return \`<div class="card" style="padding:18px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <i class="ti \${def.icone}" style="color:\${def.couleur};font-size:17px;"></i>
          <span style="font-size:14px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.04em;">\${def.nom}</span>
        </div>
        \${badge}
      </div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:37px;font-weight:600;color:\${def.couleur};">\${bigVal}</div>
      <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;">\${bigLab}</div>
      \${e.budget>0?\`<div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:10px;"><div style="height:100%;width:\${pct}%;background:\${def.couleur};border-radius:4px;transition:width .5s;"></div></div>\`:''}
      \${detail?\`<div style="display:flex;flex-direction:column;gap:4px;font-size:12.5px;margin-bottom:10px;">\${detail}</div>\`:''}
      \${footer}
    </div>\`;
  }).join('');

  renderAranger(ctx);
}

let _envShowAll=false;
function toggleEnvShowAll(){_envShowAll=!_envShowAll;renderEnveloppes();}

function renderEngagementsCard(def,e){
  const items=e.items||[];
  const rows=items.map(it=>{
    const total=parseFloat(it.total)||0,paye=parseFloat(it.paye)||0,reste=Math.max(0,total-paye);
    const pct=total>0?Math.min(100,Math.round(paye/total*100)):0;
    return \`<div style="padding:9px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">
        <span style="font-size:13.5px;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">\${escHtml(it.nom||'Engagement')}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:19px;white-space:nowrap;color:\${def.couleur};">\${fmt(reste)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:3px;">
        <span style="font-size:11.5px;color:var(--text-2);">\${it.date?fmtDate(it.date)+' · ':''}payé \${fmt(paye)} / \${fmt(total)}</span>
        <span style="display:flex;gap:8px;">
          <button onclick="openEngagementModal('\${it.id}')" title="Modifier" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:14px;"><i class="ti ti-pencil"></i></button>
          <button onclick="deleteEngagement('\${it.id}')" title="Supprimer" style="background:none;border:none;cursor:pointer;color:#8d2b21;font-size:14px;"><i class="ti ti-trash"></i></button>
        </span>
      </div>
      \${total>0?\`<div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden;margin-top:6px;"><div style="height:100%;width:\${pct}%;background:\${def.couleur};border-radius:4px;"></div></div>\`:''}
    </div>\`;
  }).join('');
  const badge='<span style="font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 8px;border-radius:999px;color:#2c4a72;background:#E8F1FF;">'+(items.length?items.length+' engagement'+(items.length>1?'s':''):'À définir')+'</span>';
  return \`<div class="card" style="padding:18px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <i class="ti \${def.icone}" style="color:\${def.couleur};font-size:17px;"></i>
        <span style="font-size:14px;font-weight:700;color:var(--navy);text-transform:uppercase;letter-spacing:.04em;">\${def.nom}</span>
      </div>
      \${badge}
    </div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:37px;font-weight:600;color:\${def.couleur};">\${fmt(e.reste)}</div>
    <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;">reste à réserver pour tes engagements</div>
    \${rows?\`<div style="margin-bottom:10px;">\${rows}</div>\`:'<div style="font-size:13px;color:var(--text-2);margin-bottom:12px;">Aucun engagement pour le moment. Ajoute une prestation ou un accompagnement dont une partie seulement est payée.</div>'}
    <button onclick="openEngagementModal()" style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px 12px;cursor:pointer;font-size:13px;font-weight:600;color:var(--navy);"><i class="ti ti-plus"></i> Ajouter un engagement</button>
  </div>\`;
}

function openEngagementModal(id){
  const s=dbGetObj('settings');
  const items=Array.isArray(s.engagements)?s.engagements:[];
  const it=id?items.find(x=>x.id===id):null;
  q('#engagement-id').value=it?it.id:'';
  q('#engagement-nom').value=it?(it.nom||''):'';
  q('#engagement-total').value=it&&it.total!=null?it.total:'';
  q('#engagement-paye').value=it&&it.paye!=null?it.paye:'';
  q('#engagement-date').value=it?(it.date||''):'';
  q('#engagement-modal-title').textContent=it?'Modifier l\\'engagement':'Nouvel engagement';
  q('#modal-engagement').style.display='flex';
}

async function saveEngagement(){
  try{
    const nom=q('#engagement-nom').value.trim();
    const total=parseFloat(q('#engagement-total').value);
    if(!nom){toast('Donne un intitulé','error');return;}
    if(isNaN(total)||total<0){toast('Montant total invalide','error');return;}
    let paye=parseFloat(q('#engagement-paye').value); if(isNaN(paye)||paye<0)paye=0;
    const date=q('#engagement-date').value||'';
    const settings=dbGetObj('settings');
    const items=Array.isArray(settings.engagements)?settings.engagements.slice():[];
    const id=q('#engagement-id').value;
    if(id){
      const i=items.findIndex(x=>x.id===id);
      if(i>=0)items[i]={...items[i],nom,total,paye,date};
    }else{
      items.push({id:'eng_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,total,paye,date});
    }
    settings.engagements=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-engagement').style.display='none';
    toast('Engagement enregistré','success');
    renderEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

async function deleteEngagement(id){
  if(!confirm('Supprimer cet engagement ?'))return;
  try{
    const settings=dbGetObj('settings');
    settings.engagements=(Array.isArray(settings.engagements)?settings.engagements:[]).filter(x=>x.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Engagement supprimé','success');
    renderEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function renderAranger(ctx){
  const el=q('#enveloppes-aranger');
  if(!el)return;
  const debits=(ctx.debits||[]).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(!debits.length){el.innerHTML='<div style="font-size:13.5px;color:var(--text-2);padding:8px 0;">Aucune dépense Qonto pour le moment. Clique « Sync Qonto ».</div>';return;}
  const aRanger=debits.filter(t=>t.cat==='autre');
  const list=(_envShowAll?debits:aRanger).slice(0,80);
  const projets=dbGet('projets')||[];
  const txProjet=(ctx.settings&&ctx.settings.txProjet)||{};
  const opt=(cur)=>ENV_CATS.map(c=>\`<option value="\${c}"\${c===cur?' selected':''}>\${ENV_LABELS[c]}</option>\`).join('');
  const header=\`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
    <span style="font-size:13px;color:var(--text-2);">\${aRanger.length?aRanger.length+' opération(s) à ranger':'<i class="ti ti-check"></i> Tout est rangé'}\${_envShowAll?' · toutes affichées':''}</span>
    <button onclick="toggleEnvShowAll()" style="background:none;border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;color:var(--text-2);">\${_envShowAll?'Voir seulement à ranger':'Voir toutes les opérations'}</button>
  </div>\`;
  if(!list.length){el.innerHTML=header+'<div style="font-size:13.5px;color:var(--text-2);padding:8px 0;"><i class="ti ti-check"></i> Rien à ranger. Clique « Voir toutes les opérations » pour re-catégoriser.</div>';return;}
  const selStyle='border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:13px;color:var(--text-1);background:var(--surface-2);cursor:pointer;';
  el.innerHTML=header+list.map(t=>{
    const key=t.qontoId||t.id;
    const isRanger=t.cat==='autre';
    const projSel=t.cat==='soustraitance'
      ? \`<select onchange="assignTxProjet('\${key}',this.value)" style="\${selStyle}max-width:150px;" title="Rattacher à un projet">
          <option value="">— Projet ? —</option>
          \${projets.map(p=>\`<option value="\${p.id}"\${txProjet[key]===p.id?' selected':''}>\${escHtml(p.nom)}</option>\`).join('')}
        </select>\`
      : '';
    return \`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:9px 6px;border-bottom:1px solid var(--border);flex-wrap:wrap;border-radius:6px;\${isRanger?'background:rgba(138,100,20,.08);':''}">
      <div style="min-width:150px;flex:1;">
        <div style="font-size:13.5px;font-weight:500;">\${escHtml(t.libelle||'—')}</div>
        <div style="font-size:12px;color:var(--text-2);">\${fmtDate(t.date)} · −\${fmt(t.montant)}</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
        \${projSel}
        <select onchange="assignTx('\${key}',this.value)" style="\${selStyle}">\${opt(t.cat)}</select>
      </div>
    </div>\`;
  }).join('');
}

async function assignTx(key,cat){
  try{
    const settings=dbGetObj('settings');
    settings.envTx=settings.envTx||{};
    settings.envTx[key]=cat;
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Rangé dans « '+(ENV_LABELS[cat]||cat)+' »','success');
    renderEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

async function assignTxProjet(key,projetId){
  try{
    const settings=dbGetObj('settings');
    settings.txProjet=settings.txProjet||{};
    if(projetId)settings.txProjet[key]=projetId; else delete settings.txProjet[key];
    _cache.settings=await api('PUT','/api/settings',settings);
    toast(projetId?'Rattaché au projet':'Détaché du projet','success');
    renderEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function openEnvReglages(){
  const s=dbGetObj('settings');
  q('#env-budget-formation').value=s.budgetFormations!=null?s.budgetFormations:2000;
  q('#env-budget-soustraitance').value=s.budgetSoustraitance!=null?s.budgetSoustraitance:'';
  q('#env-cible-treso').value=s.objectifTresorerie!=null?s.objectifTresorerie:'';
  q('#env-horizon-charges').value=s.chargesHorizonMois!=null?s.chargesHorizonMois:1;
  q('#modal-env-reglages').style.display='flex';
}
async function saveEnvReglages(){
  try{
    const settings=dbGetObj('settings');
    const bf=parseFloat(q('#env-budget-formation').value); if(!isNaN(bf))settings.budgetFormations=bf;
    const bst=parseFloat(q('#env-budget-soustraitance').value); settings.budgetSoustraitance=isNaN(bst)?0:bst;
    const tr=parseFloat(q('#env-cible-treso').value); settings.objectifTresorerie=isNaN(tr)?0:tr;
    const hc=parseInt(q('#env-horizon-charges').value); settings.chargesHorizonMois=isNaN(hc)?1:hc;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-env-reglages').style.display='none';
    toast('Réglages enregistrés','success');
    renderEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

/* --- Vie perso : budget, niveau de vie, projets ----------------------- */
const PERSO_CATS=[
  {id:'logement', nom:'Logement',        emoji:'<i class="ti ti-home"></i>', couleur:'#2c4a72'},
  {id:'transport',nom:'Transport',       emoji:'<i class="ti ti-car"></i>', couleur:'#a5502e'},
  {id:'quotidien',nom:'Vie quotidienne', emoji:'<i class="ti ti-shopping-cart"></i>', couleur:'#456039'},
  {id:'famille',  nom:'Famille',         emoji:'<i class="ti ti-users"></i>', couleur:'#8d2b21'},
  {id:'loisirs',  nom:'Loisirs',         emoji:'<i class="ti ti-confetti"></i>', couleur:'#7C3AED'},
];

function moisEnDate(n){const d=new Date();d.setMonth(d.getMonth()+n);return MOIS_LONG[d.getMonth()]+' '+d.getFullYear();}

function computePerso(){
  const settings=dbGetObj('settings');
  const charges=Array.isArray(settings.persoCharges)?settings.persoCharges:[];
  const cats=PERSO_CATS.map(c=>({...c,items:[],total:0}));
  const byId={}; cats.forEach(c=>byId[c.id]=c);
  let fixe=0,variable=0;
  charges.forEach(ch=>{
    const mt=parseFloat(ch.montant)||0;
    const c=byId[ch.cat]||byId.quotidien;
    c.items.push(ch); c.total+=mt;
    if(ch.type==='variable')variable+=mt; else fixe+=mt;
  });
  // Épargne mensuelle choisie (Livret, assurance vie…) — fait partie du besoin
  const epargne=Array.isArray(settings.persoEpargne)?settings.persoEpargne:[];
  const epargneMensuel=Math.round(epargne.reduce((s,e)=>s+(parseFloat(e.montant)||0),0)*100)/100;
  const epargneSolde=Math.round(epargne.reduce((s,e)=>s+(parseFloat(e.solde)||0),0)*100)/100;
  const besoin=Math.round((fixe+variable+epargneMensuel)*100)/100;
  // Revenus perso hors entreprise (CAF, prime d'activité, pension, conjoint…)
  const revenus=Array.isArray(settings.persoRevenus)?settings.persoRevenus:[];
  const revenusPerso=Math.round(revenus.reduce((s,r)=>s+(parseFloat(r.montant)||0),0)*100)/100;
  const besoinNet=Math.max(0,Math.round((besoin-revenusPerso)*100)/100); // ce que ton salaire doit couvrir
  const confort=parseFloat(settings.persoConfort)||0;
  const objectif=parseFloat(settings.persoObjectif)||0;
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100, tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const pas=parseFloat(settings.pasFixe)||40;
  const abonnements=dbGet('abonnements')||[];
  const aboMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  let revenuMoyen=0,disponible=0,soldeReel=0;
  try{const it=computeIntel();revenuMoyen=it.revenuMoyen||0;disponible=it.disponible||0;soldeReel=it.soldeReel||0;}catch(e){}
  const chargesProMensuel=Math.round((aboMois+pas)*100)/100;
  const capacite=Math.max(0,Math.round((revenuMoyen*(1-tauxU-tauxC)-chargesProMensuel)*100)/100);
  let salaireConseille=capacite;
  if(objectif>0)salaireConseille=Math.min(salaireConseille,objectif);
  // CA entreprise nécessaire pour couvrir la part NON couverte par tes aides
  const caRequis=besoinNet>0?Math.round((besoinNet+chargesProMensuel)/Math.max(0.01,1-tauxU-tauxC)):0;
  // Reste à vivre = salaire + revenus perso − besoin total
  const resteAVivre=Math.round((salaireConseille+revenusPerso-besoin)*100)/100;
  return {settings,charges,cats,fixe,variable,besoin,epargne,epargneMensuel,epargneSolde,revenus,revenusPerso,besoinNet,confort,objectif,revenuMoyen,capacite,salaireConseille,chargesProMensuel,caRequis,resteAVivre,disponible,soldeReel,tauxU,tauxC};
}

/* ═══════════════════════════════════════════════════════════════════
   MOTEUR FINANCIER UNIQUE — une seule vérité, vocabulaire strict.
   3 poches jamais mélangées : entreprise / personnel / patrimoine.
   L'épargne et les projets sont des missions de l'argent PERSONNEL,
   jamais des charges de l'entreprise.
   ═══════════════════════════════════════════════════════════════════ */
function computeMoney(){
  var P; try{P=computePerso();}catch(e){P={};}
  var I; try{I=computeIntel();}catch(e){I={};}
  var E=null; try{E=computeEnveloppes();}catch(e){}
  var s=dbGetObj('settings');
  var clamp=function(v){return Math.max(0,Math.min(100,Math.round(v)));};

  // ── Pièces PERSO séparées (l'épargne n'est PAS une dépense) ──
  var depensesPerso=Math.round(((P.fixe||0)+(P.variable||0))*100)/100;
  var epargnePrevue=P.epargneMensuel||0;
  var pvie=Array.isArray(s.projetsVie)?s.projetsVie:[];
  var projetsMensuel=Math.round(pvie.reduce(function(a,pr){return a+(parseFloat(pr.mensualite)||0);},0)*100)/100;
  var autresRevenus=P.revenusPerso||0;

  // ── Repères de salaire ──
  var besoinMin=depensesPerso;                                   // niveau de vie essentiel
  var confortCalc=Math.round((depensesPerso+epargnePrevue+projetsMensuel)*1.1);
  var confortable=Math.max(confortCalc,parseFloat(s.persoConfort)||0);

  // ── ENTREPRISE ──
  var soldeReel=(E?E.soldeReel:(I.soldeReel||0))||0;
  var reserveUrssaf=E?(E.totalReserve||0):0;                     // URSSAF/CFP provisionnés
  var chargesFixes=0;
  try{var abos=dbGet('abonnements')||[];chargesFixes=abos.filter(function(a){return a.statut==='actif'||!a.statut;}).reduce(function(x,a){return x+(a.montant||a.montantMensuel||0);},0);}catch(e){}
  chargesFixes=Math.round(chargesFixes*100)/100;
  var dispoEntreprise=E?Math.max(0,E.disponible):Math.max(0,soldeReel-reserveUrssaf); // après réserves obligatoires
  var reserveSecu=Math.round(chargesFixes*3);                    // cible = 3 mois de charges
  var maxPonctuel=Math.max(0,Math.round(dispoEntreprise-reserveSecu)); // versement max sans toucher aux réserves
  var soutenable=Math.max(0,Math.round(P.salaireConseille||P.capacite||0)); // ce que l'activité soutient
  var versement=Math.min(maxPonctuel,soutenable>0?soutenable:maxPonctuel);
  if(!soutenable)versement=Math.min(maxPonctuel,besoinMin||maxPonctuel);
  var tresoRestante=Math.max(0,Math.round(dispoEntreprise-versement));

  // ── PERSONNEL ──
  var revenusPersoTotal=Math.round((versement+autresRevenus)*100)/100;
  var argentLibre=Math.max(0,Math.round((revenusPersoTotal-depensesPerso-epargnePrevue-projetsMensuel)*100)/100);

  // ── PATRIMOINE (3 niveaux, jamais mélangés) ──
  var patriPerso=P.epargneSolde||0;
  var tresoPro=soldeReel;
  var patriTotal=Math.round((patriPerso+tresoPro)*100)/100;
  var moisLiberte=depensesPerso>0?Math.round(patriPerso/depensesPerso*10)/10:null; // PERSO uniquement
  var moisCouverts=chargesFixes>0?Math.round(dispoEntreprise/chargesFixes*10)/10:null;

  // ── SCORE : 5 piliers ──
  var pTreso=clamp(moisCouverts!=null?moisCouverts/3*100:50);
  var pReserve=clamp(reserveSecu>0?dispoEntreprise/reserveSecu*100:100);
  var pActivite=clamp(I.pctObjectif!=null?I.pctObjectif:50);
  var pPerso=clamp(besoinMin>0?revenusPersoTotal/besoinMin*100:70);
  var pPatri=clamp(moisLiberte!=null?moisLiberte/6*100:(epargnePrevue>0?60:30));
  var score=Math.round((pTreso+pReserve+pActivite+pPerso+pPatri)/5);

  var vLevel,verdict;
  if(besoinMin>0&&versement<besoinMin){vLevel='rouge';verdict='Prudence : ton activité ne couvre pas encore ton niveau de vie.';}
  else if(besoinMin>0&&argentLibre<=0){vLevel='ambre';verdict='Ça passe, mais ton argent libre est serré ce mois-ci.';}
  else{vLevel='vert';verdict='Tu peux vivre sereinement ce mois-ci.';}

  return {
    depensesPerso:depensesPerso,epargnePrevue:epargnePrevue,projetsMensuel:projetsMensuel,autresRevenus:autresRevenus,
    besoinMin:besoinMin,confortable:confortable,
    soldeReel:soldeReel,reserveUrssaf:reserveUrssaf,chargesFixes:chargesFixes,dispoEntreprise:dispoEntreprise,
    reserveSecu:reserveSecu,maxPonctuel:maxPonctuel,soutenable:soutenable,versement:versement,tresoRestante:tresoRestante,
    revenusPersoTotal:revenusPersoTotal,argentLibre:argentLibre,
    patriPerso:patriPerso,tresoPro:tresoPro,patriTotal:patriTotal,moisLiberte:moisLiberte,moisCouverts:moisCouverts,
    score:score,pillars:{treso:pTreso,reserve:pReserve,activite:pActivite,perso:pPerso,patri:pPatri},
    verdict:verdict,vLevel:vLevel,intel:I,perso:P
  };
}

function loadVersement(){
  const el=q('#versement-content'); if(!el)return;
  let M; try{M=computeMoney();}catch(e){el.innerHTML='';return;}
  if(M.besoinMin<=0){
    el.innerHTML=\`<div class="card" style="padding:30px;text-align:center;">
      <div style="font-size:17px;font-weight:600;color:var(--navy);margin-bottom:6px;">Renseigne d'abord ton budget perso</div>
      <div style="font-size:15px;color:var(--text-2);max-width:440px;margin:0 auto 16px;">Finance a besoin de ton niveau de vie pour calculer combien tu peux te verser.</div>
      <button class="btn btn-primary btn-sm" onclick="navigate('budget-perso')"><i class="ti ti-arrow-right"></i> Mon budget perso</button>
    </div>\`;return;
  }
  const min=M.besoinMin, conseille=M.versement, confort=M.confortable, maxP=M.maxPonctuel;
  const couvre=conseille>=confort, manque=Math.max(0,Math.round(confort-conseille));
  const lvl=(icon,ttl,sub,val,hl)=>\`<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;border-radius:14px;background:\${hl?'var(--glycine)':'var(--surface-2)'};">
    <div style="display:flex;align-items:center;gap:11px;"><span style="width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex:none;background:\${hl?'#fff':'var(--card)'};color:\${hl?'var(--bleu)':'var(--terre-600)'};"><i class="ti \${icon}" style="font-size:19px;"></i></span><div style="font-size:15px;font-weight:600;color:var(--navy);">\${ttl}<small style="display:block;font-weight:500;color:\${hl?'var(--bleu)':'var(--text-2)'};font-size:13px;">\${sub}</small></div></div>
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:30px;color:var(--navy);">\${fmt(val)}</div></div>\`;
  el.innerHTML=\`
  <div class="card" style="padding:28px 30px;margin-bottom:18px;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:18px;">Tes 4 repères de versement</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      \${lvl('ti-coins','Salaire minimum','ton niveau de vie essentiel',min,false)}
      \${lvl('ti-target','Versement conseillé','soutenable par ton activité',conseille,true)}
      \${lvl('ti-heart','Confortable','dépenses + épargne + projets + marge',confort,false)}
      \${lvl('ti-bolt','Maximum ponctuel','sans toucher à tes réserves',maxP,false)}
    </div>
    <div style="margin-top:18px;border-radius:14px;padding:15px 18px;background:\${couvre?'var(--vert-bg)':'var(--ambre-bg)'};color:\${couvre?'var(--vert)':'var(--ambre)'};font-size:15px;display:flex;gap:9px;align-items:flex-start;"><i class="ti \${couvre?'ti-circle-check':'ti-alert-triangle'}" style="margin-top:2px;"></i><span>\${couvre?'Ton activité soutient ton niveau de vie cible. Tu peux te verser sereinement.':'Tu couvres ton quotidien, mais pas encore ton niveau de vie cible ('+fmt(confort)+'). Il manque ~<strong>'+fmt(manque)+'/mois</strong> de CA soutenable.'}</span></div>
  </div>
  <div class="card" style="padding:28px 30px;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:14px;">Sur quel horizon ?</div>
    <div style="display:flex;justify-content:space-between;gap:10px;font-size:15px;padding:11px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-2);display:flex;align-items:center;gap:8px;"><i class="ti ti-bolt"></i> Ce mois-ci, exceptionnellement</span><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22px;">\${fmt(maxP)}</span></div>
    <div style="display:flex;justify-content:space-between;gap:10px;font-size:15px;padding:11px 0;"><span style="color:var(--text-2);display:flex;align-items:center;gap:8px;"><i class="ti ti-calendar-repeat"></i> Rythme soutenable (12 mois)</span><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:22px;">\${fmt(conseille)}</span></div>
    <p style="font-size:13.5px;color:var(--text-2);margin-top:10px;">Te verser le maximum chaque mois puiserait dans tes réserves. Le rythme soutenable, lui, tient sur la durée.</p>
  </div>\`;
}

function loadReserve(){
  const el=q('#reserve-content'); if(!el)return;
  let M; try{M=computeMoney();}catch(e){el.innerHTML='';return;}
  const actuelle=M.dispoEntreprise, cible=M.reserveSecu, charges=M.chargesFixes, couvre=M.moisCouverts;
  if(charges<=0){
    el.innerHTML=\`<div class="card" style="padding:30px;text-align:center;">
      <div style="font-size:17px;font-weight:600;color:var(--navy);margin-bottom:6px;">Renseigne tes charges fixes</div>
      <div style="font-size:15px;color:var(--text-2);max-width:440px;margin:0 auto 16px;">Ta réserve de sécurité cible = 3 mois de charges fixes. Ajoute tes abonnements pour la calculer.</div>
      <button class="btn btn-primary btn-sm" onclick="navigate('abonnements')"><i class="ti ti-arrow-right"></i> Mes charges fixes</button>
    </div>\`;return;
  }
  const ratio=cible>0?actuelle/cible:1;
  const L=ratio>=1?['var(--vert)','var(--vert-bg)','ti-circle-check','Confortable','Ta réserve dépasse ta cible — tu peux te verser sereinement.']
         :ratio>=0.66?['var(--ambre)','var(--ambre-bg)','ti-alert-triangle','Correct','Ta réserve approche la cible. Reconstitue-la avant de te verser au maximum.']
         :['var(--rouge)','var(--rouge-bg)','ti-alert-circle','Fragile','Ta réserve est sous la cible — prudence avant de te verser.'];
  const segFill=Math.max(0,Math.min(4,Math.round(ratio*3)));
  let seg='';for(let i=0;i<4;i++){seg+=\`<i style="flex:1;height:13px;border-radius:7px;background:\${i<segFill?L[0]:'var(--surface-2)'};"></i>\`;}
  const big=(k,v,col)=>\`<div><div style="font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--terre-400);">\${k}</div><div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:31px;color:\${col||'var(--navy)'};margin-top:3px;">\${v}</div></div>\`;
  el.innerHTML=\`
  <div class="card" style="padding:28px 30px;margin-bottom:18px;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:18px;display:flex;align-items:center;gap:10px;"><i class="ti ti-shield-half" style="font-style:normal;color:var(--terre-600);"></i> Réserve entreprise <span style="font-size:11px;font-weight:700;text-transform:uppercase;background:var(--surface-2);color:var(--terre-600);padding:3px 9px;border-radius:999px;margin-left:auto;">protéger demain</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:18px;">
      \${big('Réserve actuelle',fmt(actuelle))}
      \${big('Cible · 3 mois',fmt(cible))}
      \${big('Ça te couvre',couvre!=null?(String(couvre).replace('.',',')+' mois'):'—',L[0])}
    </div>
    <div style="display:flex;gap:7px;margin:18px 0;">\${seg}</div>
    <div style="border-radius:14px;padding:15px 18px;background:\${L[1]};color:\${L[0]};font-size:15px;display:flex;gap:9px;align-items:flex-start;"><i class="ti \${L[2]}" style="margin-top:2px;"></i><span><strong>\${L[3]}.</strong> \${L[4]}</span></div>
  </div>
  <div class="card" style="padding:28px 30px;">
    <div style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:25px;color:var(--navy);margin-bottom:14px;">Pourquoi cette cible ?</div>
    <div style="display:flex;justify-content:space-between;font-size:15px;padding:9px 0;color:var(--text-2);"><span>Charges fixes mensuelles</span><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;">\${fmt(charges)}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:15px;padding:9px 0;color:var(--text-2);"><span>× 3 mois de coussin (mois creux, retards)</span><span style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;">\${fmt(cible)}</span></div>
    <p style="font-size:14px;color:var(--text-2);margin-top:12px;">Cette réserve est <strong>déduite avant</strong> ton versement conseillé — elle appartient à l'entreprise, jamais à ton patrimoine.</p>
  </div>\`;
}

function loadBudgetPerso(){renderBudgetPerso();}
function renderBudgetPerso(){
  const ctx=computePerso();
  renderPersoHero(ctx);
  renderPersoReste(ctx);
  renderPersoBridge(ctx);
  renderPersoRevenus(ctx);
  renderPersoEpargne(ctx);
  renderPersoCharges(ctx);
  renderPersoSimulateur(ctx);
}

function renderPersoHero(ctx){
  const el=q('#perso-hero'); if(!el)return;
  const {besoin,confort,objectif,revenusPerso,besoinNet}=ctx;
  const aidesLine=revenusPerso>0
    ? \`<div style="font-size:13px;opacity:.85;margin-top:6px;padding-top:8px;border-top:1px solid rgba(255,255,255,.14);">Tes aides & revenus perso couvrent <strong>\${fmt(revenusPerso)}</strong> → ton entreprise n'a qu'à couvrir <strong>\${fmt(besoinNet)} / mois</strong>.</div>\`
    : '';
  if(besoin<=0){el.innerHTML=\`<div style="background:var(--navy);border-radius:14px;padding:22px 26px;color:#fff;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-bulb"></i> Ton minimum vital</div>
      <div style="font-size:15px;margin-top:8px;opacity:.85;">Renseigne tes dépenses perso ci-dessous pour découvrir de combien tu as besoin chaque mois pour vivre.</div>
    </div>\`;return;}
  const palier=(emoji,lab,val,color,hint)=>\`<div style="flex:1;min-width:150px;background:var(--surface-2);border-radius:12px;padding:16px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);">\${emoji} \${lab}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:35px;font-weight:600;color:\${color};margin-top:4px;">\${val>0?fmt(val):'—'}</div>
      <div style="font-size:12px;color:var(--text-2);">\${hint}</div>
    </div>\`;
  el.innerHTML=\`<div style="background:var(--navy);border-radius:14px;padding:22px 26px;color:#fff;margin-bottom:16px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-bulb"></i> Ton minimum vital</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:46px;font-weight:700;margin:6px 0;">\${fmt(besoin)}<span style="font-size:16px;opacity:.6;"> / mois</span></div>
      <div style="font-size:13.5px;opacity:.75;">Pour couvrir ton niveau de vie actuel, il te faut au moins \${fmt(besoin)} par mois.</div>
      \${aidesLine}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      \${palier('<i class="ti ti-circle-check"></i>','Minimum vital',besoin,'#456039','tes dépenses actuelles')}
      \${palier('<i class="ti ti-circle"></i>','Confort',confort,'#a5502e',confort>0?'ta cible de confort':'à définir')}
      \${palier('<i class="ti ti-circle-filled"></i>','Objectif',objectif,'#2c4a72',objectif>0?'ton objectif de vie':'à définir')}
    </div>\`;
}

function renderPersoReste(ctx){
  const el=q('#perso-reste'); if(!el)return;
  const {salaireConseille,besoin,resteAVivre,revenusPerso}=ctx;
  if(besoin<=0){el.innerHTML='';return;}
  const color=resteAVivre<200?'#8d2b21':resteAVivre<500?'#a5502e':'#456039';
  const emoji=resteAVivre<200?'<i class="ti ti-alert-circle"></i>':resteAVivre<500?'<i class="ti ti-alert-triangle"></i>':'<i class="ti ti-circle-check"></i>';
  const label=resteAVivre<200?'serré':resteAVivre<500?'correct':'confortable';
  const detail=revenusPerso>0
    ? \`Salaire conseillé \${fmt(salaireConseille)} + aides \${fmt(revenusPerso)} − besoin de vie \${fmt(besoin)}.\`
    : \`Salaire conseillé \${fmt(salaireConseille)} − ton besoin de vie \${fmt(besoin)}.\`;
  el.innerHTML=\`<div class="card" style="padding:18px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);">Ton reste à vivre estimé</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:39px;font-weight:700;color:\${color};">\${emoji} \${fmt(resteAVivre)}<span style="font-size:15px;color:var(--text-2);"> / mois · \${label}</span></div>
    <div style="font-size:12.5px;color:var(--text-2);margin-top:2px;">\${detail} Repères : <i class="ti ti-alert-circle"></i> sous 200 € · <i class="ti ti-alert-triangle"></i> 200–500 € · <i class="ti ti-circle-check"></i> au-delà.</div>
  </div>\`;
}

function renderPersoBridge(ctx){
  const el=q('#perso-bridge'); if(!el)return;
  const {besoin,besoinNet,capacite,caRequis,revenusPerso}=ctx;
  if(besoin<=0){el.innerHTML='';return;}
  const ressources=capacite+revenusPerso;
  const couvre=ressources>=besoin;
  const msg=couvre
    ? \`<i class="ti ti-circle-check"></i> Ton activité\${revenusPerso>0?' et tes aides couvrent':' couvre'} ton niveau de vie. Ton entreprise peut te verser environ <strong>\${fmt(capacite)} / mois</strong>\${ressources>besoin?', soit '+fmt(ressources-besoin)+' de marge au-dessus de ton besoin':''}.\`
    : \`<i class="ti ti-alert-triangle"></i> Tu ne couvres pas encore ton niveau de vie. Ton entreprise soutient ~<strong>\${fmt(capacite)} / mois</strong>\${revenusPerso>0?' (+ '+fmt(revenusPerso)+' d\\'aides)':''}, il manque <strong>\${fmt(besoin-ressources)}</strong>.\`;
  el.innerHTML=\`<div class="card" style="padding:18px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-arrows-exchange"></i> Le pont entreprise ↔ perso</div>
    <div style="font-size:15px;line-height:1.5;margin-bottom:10px;">\${msg}</div>
    <div style="font-size:13.5px;color:var(--text-2);">Pour maintenir ton niveau de vie, ton entreprise doit générer au moins <strong style="color:var(--navy);">\${fmt(caRequis)} de CA / mois</strong> (soit ~\${fmt(caRequis*12)} / an)\${revenusPerso>0?', tes aides couvrant déjà '+fmt(revenusPerso):''}.</div>
  </div>\`;
}

const SUP_TYPES=[
  {id:'livreta',nom:'Livret A',      emoji:'<i class="ti ti-building-bank"></i>',couleur:'#2c4a72'},
  {id:'ldds',   nom:'LDDS',          emoji:'<i class="ti ti-leaf"></i>',couleur:'#456039'},
  {id:'av',     nom:'Assurance vie', emoji:'<i class="ti ti-trending-up"></i>',couleur:'#2AA9A0'},
  {id:'pea',    nom:'PEA',           emoji:'<i class="ti ti-chart-bar"></i>',couleur:'#2c4a72'},
  {id:'cto',    nom:'CTO',           emoji:'<i class="ti ti-chart-line"></i>',couleur:'#7C3AED'},
  {id:'immo',   nom:'Immobilier',    emoji:'<i class="ti ti-home"></i>',couleur:'#a5502e'},
  {id:'crypto', nom:'Crypto',        emoji:'<i class="ti ti-coin"></i>',couleur:'#E0A3C0'},
  {id:'compte', nom:'Compte perso',  emoji:'<i class="ti ti-credit-card"></i>',couleur:'#744f30'},
  {id:'autre',  nom:'Autre placement',emoji:'<i class="ti ti-wallet"></i>',couleur:'#9AA4B5'},
];
const SUP_EMOJI={liquidites:'<i class="ti ti-building-bank"></i>',longterme:'<i class="ti ti-trending-up"></i>',immobilier:'<i class="ti ti-home"></i>'}; SUP_TYPES.forEach(t=>{SUP_EMOJI[t.id]=t.emoji;});
function supType(cat){return SUP_TYPES.find(t=>t.id===cat)||{id:'autre',nom:'Placement',emoji:SUP_EMOJI[cat]||'<i class="ti ti-wallet"></i>',couleur:'#2AA9A0'};}
function supEmoji(cat){return SUP_EMOJI[cat]||'<i class="ti ti-wallet"></i>';}
const PVIE_CATS=[
  {id:'voyage',   nom:'Voyages',    emoji:'<i class="ti ti-plane"></i>'},
  {id:'voiture',  nom:'Voiture',    emoji:'<i class="ti ti-car"></i>'},
  {id:'immo',     nom:'Immobilier', emoji:'<i class="ti ti-home"></i>'},
  {id:'mariage',  nom:'Mariage',    emoji:'<i class="ti ti-diamond"></i>'},
  {id:'formation',nom:'Formation',  emoji:'<i class="ti ti-school"></i>'},
  {id:'materiel', nom:'Matériel',   emoji:'<i class="ti ti-device-laptop"></i>'},
  {id:'plaisir',  nom:'Plaisir',    emoji:'<i class="ti ti-gift"></i>'},
  {id:'sante',    nom:'Santé',      emoji:'<i class="ti ti-heart"></i>'},
  {id:'autre',    nom:'Autre',      emoji:'<i class="ti ti-target"></i>'},
];
function pvieCat(cat){return PVIE_CATS.find(c=>c.id===cat)||PVIE_CATS[PVIE_CATS.length-1];}
function loadPatrimoine(){renderPatrimoine();renderPatriAlim();}
function renderPatrimoine(){
  const gEl=q('#patrimoine-global'), cEl=q('#patrimoine-content');
  if(!cEl)return;
  const s=dbGetObj('settings');
  const items=Array.isArray(s.persoEpargne)?s.persoEpargne:[];
  const totalSolde=items.reduce((a,e)=>a+(parseFloat(e.solde)||0),0);
  const totalMensuel=items.reduce((a,e)=>a+(parseFloat(e.montant)||0),0);
  const now=new Date(); const m=now.getMonth()+1;
  const misCetteAnnee=Math.round(totalMensuel*m);
  let besoin=0; try{besoin=computePerso().besoin;}catch(e){}
  const moisLib=besoin>0?(totalSolde/besoin):null;

  let chart='';
  if(totalSolde>0||totalMensuel>0){
    const base=Math.max(0,totalSolde-totalMensuel*m);
    const pts=[]; for(let i=0;i<12;i++)pts.push(base+totalMensuel*(i+1));
    const min=Math.min.apply(null,pts), max=Math.max.apply(null,pts.concat(min+1));
    const W=320,H=70;
    const X=i=>(i/11*W).toFixed(1);
    const Y=v=>(H-(max===min?H/2:((v-min)/(max-min))*(H-10)+5)).toFixed(1);
    const cur=Math.max(0,m-1);
    const solid=pts.slice(0,cur+1).map((v,i)=>X(i)+','+Y(v));
    const dash=pts.slice(cur).map((v,i)=>X(cur+i)+','+Y(v));
    const area='M'+X(0)+','+H+' L'+solid.join(' L')+' L'+X(cur)+','+H+' Z';
    chart=\`<svg viewBox="0 0 \${W} \${H}" preserveAspectRatio="none" style="width:100%;height:70px;margin-top:16px;overflow:visible;">
      <path d="\${area}" fill="rgba(123,224,174,.18)"/>
      <polyline points="\${solid.join(' ')}" fill="none" stroke="#b7d3ad" stroke-width="2.5"/>
      <polyline points="\${dash.join(' ')}" fill="none" stroke="#b7d3ad" stroke-width="2" stroke-dasharray="4 4" opacity=".55"/>
      <circle cx="\${X(cur)}" cy="\${Y(pts[cur])}" r="3.5" fill="#fff" stroke="#b7d3ad" stroke-width="2"/>
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:11px;opacity:.5;margin-top:2px;"><span>Jan</span><span>Avr</span><span>Juil</span><span>Oct</span><span>Déc</span></div>\`;
  }

  let M;try{M=computeMoney();}catch(e){M={};}
  if(gEl){
    gEl.innerHTML=\`<div style="background:var(--navy);border-radius:20px;padding:28px 32px;color:#fff;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-plant-2"></i> Ton patrimoine</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:700;margin:2px 0;">\${fmt(totalSolde)}</div>
      <div style="font-size:12px;opacity:.6;">Patrimoine personnel — ton argent, mobilisable</div>
      \${misCetteAnnee>0?\`<div style="font-size:14px;color:#b7d3ad;margin-top:4px;"><i class="ti ti-trending-up" style="vertical-align:-1px;"></i> +\${fmt(misCetteAnnee)} cette année</div>\`:''}
      \${chart}
      <div style="display:flex;gap:30px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.14);">
        <div><div style="font-size:12px;opacity:.6;"><i class="ti ti-briefcase"></i> Patrimoine total</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;">\${fmt(M.patriTotal!=null?M.patriTotal:totalSolde)}</div><div style="font-size:11.5px;opacity:.6;">perso + trésorerie pro</div></div>
        <div><div style="font-size:12px;opacity:.6;"><i class="ti ti-building"></i> Trésorerie pro</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;">\${fmt(M.tresoPro||0)}</div><div style="font-size:11.5px;opacity:.6;">séparée de ton patrimoine</div></div>
        \${totalMensuel>0?\`<div><div style="font-size:12px;opacity:.6;"><i class="ti ti-coins"></i> Tu investis</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;">\${fmt(totalMensuel)} / mois</div><div style="font-size:11.5px;opacity:.6;">≈ \${fmt(totalMensuel*12)} / an</div></div>\`:''}
        \${M.moisLiberte!=null?\`<div><div style="font-size:12px;opacity:.6;"><i class="ti ti-lifebuoy"></i> Liberté personnelle</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;">\${String(M.moisLiberte).replace('.',',')} mois</div><div style="font-size:11.5px;opacity:.6;">de tes dépenses couvertes</div></div>\`:''}
      </div>
    </div>\`;
  }

  if(!items.length){cEl.innerHTML=\`<div class="card" style="padding:32px;text-align:center;border:1.5px dashed var(--border);background:none;">
    <div style="font-size:34px;"><i class="ti ti-seeding"></i></div>
    <div style="font-size:17px;font-weight:600;color:var(--navy);margin:10px 0 6px;">Commence à construire ton patrimoine</div>
    <div style="font-size:14.5px;color:var(--text-2);max-width:440px;margin:0 auto 18px;line-height:1.55;">Ajoute ton Livret A, ton assurance vie ou tes autres placements pour suivre ta richesse grandir au fil du temps.</div>
    <button class="btn btn-primary" onclick="openPersoEpargneModal()"><i class="ti ti-plus"></i> Ajouter mon premier support</button>
  </div>\`;return;}

  cEl.innerHTML=\`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">\`+items.map(e=>{
    const t=supType(e.cat);
    const solde=parseFloat(e.solde)||0, obj=parseFloat(e.objectif)||0, mens=parseFloat(e.montant)||0;
    const pct=obj>0?Math.min(100,Math.round(solde/obj*100)):0;
    const reste=Math.max(0,obj-solde);
    const nom=escHtml(e.nom||t.nom);
    return \`<div class="card" style="padding:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span style="font-size:14px;font-weight:700;color:var(--navy);">\${t.emoji} \${nom}</span>
        <span style="display:flex;gap:6px;">
          <button onclick="openPersoEpargneModal('\${e.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:14px;"><i class="ti ti-pencil"></i></button>
          <button onclick="deletePersoEpargne('\${e.id}')" style="background:none;border:none;cursor:pointer;color:#8d2b21;font-size:14px;"><i class="ti ti-trash"></i></button>
        </span>
      </div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:35px;font-weight:600;color:var(--navy);margin:8px 0 2px;">\${fmt(solde)}</div>
      \${mens>0?\`<div style="font-size:13px;color:#456039;font-weight:600;">+\${fmt(mens)} / mois</div>\`:\`<div style="font-size:13px;color:var(--text-2);">pas de versement mensuel</div>\`}
      \${obj>0?\`<div style="margin-top:12px;"><div style="height:7px;background:var(--border);border-radius:5px;overflow:hidden;"><div style="height:100%;width:\${pct}%;background:\${t.couleur};border-radius:5px;transition:width .5s;"></div></div><div style="font-size:11.5px;color:var(--text-2);margin-top:5px;">\${pct}% de ton objectif (\${fmt(obj)})\${reste>0?' · encore '+fmt(reste):''}\${(mens>0&&reste>0)?' · ~'+Math.ceil(reste/mens)+' mois':''}</div></div>\`:''}
    </div>\`;
  }).join('')+\`</div>\`;
}

function _ymNow(){const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0');}
function renderPatriAlim(){
  const el=q('#patrimoine-alim'); if(!el)return;
  const s=dbGetObj('settings');
  const items=Array.isArray(s.persoEpargne)?s.persoEpargne:[];
  const ym=_ymNow();
  const pending=items.filter(e=>(parseFloat(e.montant)||0)>0 && e.lastVersement!==ym);
  if(!pending.length){el.innerHTML='';return;}
  const total=pending.reduce((a,e)=>a+(parseFloat(e.montant)||0),0);
  el.innerHTML=\`<div class="card" style="padding:20px;background:var(--card);">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
      <div><div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);"><i class="ti ti-bulb"></i> À alimenter ce mois-ci</div>
      <div style="font-size:14.5px;color:var(--navy);margin-top:3px;">Tu avais prévu <strong>\${fmt(total)}</strong> à virer vers tes supports. As-tu fait les virements&nbsp;?</div></div>
      <button class="btn btn-primary btn-sm" onclick="alimenterTout()"><i class="ti ti-check"></i> Tout alimenter</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;">
      \${pending.map(e=>{const t=supType(e.cat);return \`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid var(--border);">
        <span style="font-size:14px;">\${t.emoji} \${escHtml(e.nom||t.nom)} · <strong>\${fmt(parseFloat(e.montant)||0)}</strong></span>
        <button class="btn btn-outline btn-xs" onclick="alimenterSupport('\${e.id}')"><i class="ti ti-check"></i> Fait</button>
      </div>\`;}).join('')}
    </div>
  </div>\`;
}
async function alimenterSupport(id){
  try{
    const ym=_ymNow();
    const settings=dbGetObj('settings');
    const items=(Array.isArray(settings.persoEpargne)?settings.persoEpargne:[]).slice();
    const i=items.findIndex(x=>x.id===id); if(i<0)return;
    const mens=parseFloat(items[i].montant)||0;
    items[i]={...items[i],solde:(parseFloat(items[i].solde)||0)+mens,lastVersement:ym};
    settings.persoEpargne=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Patrimoine +'+fmt(mens)+'','success');
    renderPatrimoine(); renderPatriAlim();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function alimenterTout(){
  try{
    const ym=_ymNow();
    const settings=dbGetObj('settings');
    const items=(Array.isArray(settings.persoEpargne)?settings.persoEpargne:[]).slice();
    let tot=0;
    items.forEach((e,i)=>{const mens=parseFloat(e.montant)||0; if(mens>0&&e.lastVersement!==ym){items[i]={...e,solde:(parseFloat(e.solde)||0)+mens,lastVersement:ym}; tot+=mens;}});
    if(tot===0)return;
    settings.persoEpargne=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Patrimoine +'+fmt(tot)+'','success');
    renderPatrimoine(); renderPatriAlim();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function appliquerEpargneMois(){
  try{
    const ym=_ymNow();
    const settings=dbGetObj('settings');
    const sup=(Array.isArray(settings.persoEpargne)?settings.persoEpargne:[]).slice();
    const pv=(Array.isArray(settings.projetsVie)?settings.projetsVie:[]).slice();
    let touched=0;
    sup.forEach((e,i)=>{const mm=parseFloat(e.montant)||0;if(mm>0&&e.lastVersement!==ym){sup[i]={...e,solde:(parseFloat(e.solde)||0)+mm,lastVersement:ym};touched++;}});
    pv.forEach((pr,i)=>{const mm=parseFloat(pr.mensualite)||0;if(mm>0&&pr.lastVersement!==ym){pv[i]={...pr,epargne:(parseFloat(pr.epargne)||0)+mm,lastVersement:ym};touched++;}});
    if(!touched)return;
    settings.persoEpargne=sup; settings.projetsVie=pv;
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Répartition appliquée — patrimoine et projets ont avancé','success');
    try{renderCockpit();}catch(e){}
    try{renderPatrimoine();renderPatriAlim();}catch(e){}
    try{renderProjetsVie();}catch(e){}
  }catch(e){toast('Erreur : '+e.message,'error');}
}
function renderPersoEpargne(ctx){
  const el=q('#perso-epargne'); if(!el)return;
  const {epargne,epargneMensuel,epargneSolde}=ctx;
  const rows=(epargne||[]).map(e=>{
    const mt=parseFloat(e.montant)||0, sd=parseFloat(e.solde)||0;
    return \`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <span style="min-width:120px;flex:1;">
        <span style="font-size:13.5px;font-weight:500;"><i class="ti ti-coin"></i> \${escHtml(e.nom||'—')}</span>
        \${sd>0?\`<span style="font-size:12px;color:var(--text-2);"> · solde \${fmt(sd)}</span>\`:''}
      </span>
      <span style="display:flex;align-items:center;gap:8px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:17px;color:#2AA9A0;">\${fmt(mt)} / mois</span>
        <button onclick="openPersoEpargneModal('\${e.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;"><i class="ti ti-pencil"></i></button>
        <button onclick="deletePersoEpargne('\${e.id}')" style="background:none;border:none;cursor:pointer;color:#8d2b21;font-size:13px;"><i class="ti ti-trash"></i></button>
      </span>
    </div>\`;
  }).join('');
  const proj=epargneMensuel>0?\`<div style="font-size:13px;color:var(--navy);margin-top:10px;font-weight:500;"><i class="ti ti-trending-up"></i> À ce rythme, dans 12 mois tu auras mis <strong>\${fmt(epargneMensuel*12)}</strong> de côté\${epargneSolde>0?\` (total ~\${fmt(epargneSolde+epargneMensuel*12)})\`:''}.</div>\`:'';
  el.innerHTML=\`<div class="card" style="padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;font-weight:700;color:var(--navy);"><i class="ti ti-coin"></i> Mon épargne mensuelle</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:21px;color:#2AA9A0;">\${fmt(epargneMensuel)} / mois</span>
        <button class="btn btn-outline btn-xs" onclick="openPersoEpargneModal()"><i class="ti ti-plus"></i> Ajouter</button>
      </div>
    </div>
    \${rows||'<div style="font-size:13px;color:var(--text-2);padding:6px 0;">Livret A, assurance vie, PEA, retraite… définis combien tu veux mettre de côté chaque mois. Ce montant est compté dans ton besoin de vie.</div>'}
    \${proj}
  </div>\`;
}

function openPersoEpargneModal(id){
  const s=dbGetObj('settings');
  const items=Array.isArray(s.persoEpargne)?s.persoEpargne:[];
  const it=id?items.find(x=>x.id===id):null;
  q('#perso-epargne-id').value=it?it.id:'';
  q('#perso-epargne-nom').value=it?(it.nom||''):'';
  q('#perso-epargne-cat').value=it?(it.cat||'livreta'):'livreta';
  q('#perso-epargne-montant').value=it&&it.montant!=null?it.montant:'';
  q('#perso-epargne-solde').value=it&&it.solde!=null&&it.solde!==0?it.solde:'';
  q('#perso-epargne-objectif').value=it&&it.objectif!=null&&it.objectif!==0?it.objectif:'';
  q('#perso-epargne-title').textContent=it?'Modifier le support':'Nouveau support d\\'épargne';
  q('#modal-perso-epargne').style.display='flex';
}
async function savePersoEpargne(){
  try{
    const montant=parseFloat(q('#perso-epargne-montant').value);
    const cat=q('#perso-epargne-cat').value;
    let nom=q('#perso-epargne-nom').value.trim();
    if(!nom){nom=supType(cat).nom;}
    if(isNaN(montant)||montant<0){toast('Montant invalide','error');return;}
    let solde=parseFloat(q('#perso-epargne-solde').value); if(isNaN(solde)||solde<0)solde=0;
    let objectif=parseFloat(q('#perso-epargne-objectif').value); if(isNaN(objectif)||objectif<0)objectif=0;
    const settings=dbGetObj('settings');
    const items=Array.isArray(settings.persoEpargne)?settings.persoEpargne.slice():[];
    const id=q('#perso-epargne-id').value;
    if(id){const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]={...items[i],nom,cat,montant,solde,objectif};}
    else{items.push({id:'pe_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,cat,montant,solde,objectif,lastVersement:_ymNow()});}
    settings.persoEpargne=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-perso-epargne').style.display='none';
    toast('Épargne enregistrée','success');
    renderBudgetPerso();
    try{renderPatrimoine();renderPatriAlim();}catch(e){}
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function deletePersoEpargne(id){
  if(!confirm('Supprimer ce support ?'))return;
  try{
    const settings=dbGetObj('settings');
    settings.persoEpargne=(Array.isArray(settings.persoEpargne)?settings.persoEpargne:[]).filter(x=>x.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Supprimé','success');
    renderBudgetPerso();
    try{renderPatrimoine();renderPatriAlim();}catch(e){}
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function renderPersoRevenus(ctx){
  const el=q('#perso-revenus'); if(!el)return;
  const {revenus,revenusPerso}=ctx;
  const rows=(revenus||[]).map(r=>\`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:13.5px;"><i class="ti ti-heart-handshake"></i> \${escHtml(r.nom||'—')}</span>
      <span style="display:flex;align-items:center;gap:8px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:17px;color:#2AA9A0;">+\${fmt(parseFloat(r.montant)||0)}</span>
        <button onclick="openPersoRevenuModal('\${r.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;"><i class="ti ti-pencil"></i></button>
        <button onclick="deletePersoRevenu('\${r.id}')" style="background:none;border:none;cursor:pointer;color:#8d2b21;font-size:13px;"><i class="ti ti-trash"></i></button>
      </span>
    </div>\`).join('');
  el.innerHTML=\`<div class="card" style="padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:14px;font-weight:700;color:var(--navy);"><i class="ti ti-heart-handshake"></i> Mes revenus perso (hors entreprise)</span>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:21px;color:#2AA9A0;">+\${fmt(revenusPerso)} / mois</span>
        <button class="btn btn-outline btn-xs" onclick="openPersoRevenuModal()"><i class="ti ti-plus"></i> Ajouter</button>
      </div>
    </div>
    \${rows||'<div style="font-size:13px;color:var(--text-2);padding:6px 0;">CAF, prime d\\'activité, pension… ajoute ce qui rentre chaque mois en dehors de ton activité. Ces revenus réduisent ce que ton entreprise doit te verser.</div>'}
  </div>\`;
}

function openPersoRevenuModal(id){
  const s=dbGetObj('settings');
  const items=Array.isArray(s.persoRevenus)?s.persoRevenus:[];
  const it=id?items.find(x=>x.id===id):null;
  q('#perso-revenu-id').value=it?it.id:'';
  q('#perso-revenu-nom').value=it?(it.nom||''):'';
  q('#perso-revenu-montant').value=it&&it.montant!=null?it.montant:'';
  q('#perso-revenu-title').textContent=it?'Modifier le revenu':'Nouveau revenu perso';
  q('#modal-perso-revenu').style.display='flex';
}
async function savePersoRevenu(){
  try{
    const nom=q('#perso-revenu-nom').value.trim();
    const montant=parseFloat(q('#perso-revenu-montant').value);
    if(!nom){toast('Donne un intitulé','error');return;}
    if(isNaN(montant)||montant<0){toast('Montant invalide','error');return;}
    const settings=dbGetObj('settings');
    const items=Array.isArray(settings.persoRevenus)?settings.persoRevenus.slice():[];
    const id=q('#perso-revenu-id').value;
    if(id){const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]={...items[i],nom,montant};}
    else{items.push({id:'pr_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,montant});}
    settings.persoRevenus=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-perso-revenu').style.display='none';
    toast('Revenu enregistré','success');
    renderBudgetPerso();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function deletePersoRevenu(id){
  if(!confirm('Supprimer ce revenu ?'))return;
  try{
    const settings=dbGetObj('settings');
    settings.persoRevenus=(Array.isArray(settings.persoRevenus)?settings.persoRevenus:[]).filter(x=>x.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Supprimé','success');
    renderBudgetPerso();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function renderPersoCharges(ctx){
  const el=q('#perso-charges'); if(!el)return;
  const {cats,charges}=ctx;
  if(!charges.length){el.innerHTML=\`<div class="card" style="padding:24px;text-align:center;color:var(--text-2);">
    <div style="font-size:32px;"><i class="ti ti-home"></i></div>
    <div style="font-size:15px;margin:8px 0;">Commence par renseigner tes dépenses perso : loyer, courses, abonnements, transport…</div>
    <button class="btn btn-primary" onclick="openPersoChargeModal()"><i class="ti ti-plus"></i> Ajouter ma première dépense</button>
  </div>\`;return;}
  el.innerHTML=\`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">\`+cats.filter(c=>c.items.length).map(c=>{
    const rows=c.items.map(it=>\`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:13.5px;">\${it.type==='variable'?'<i class="ti ti-target"></i>':'<i class="ti ti-lock"></i>'} \${escHtml(it.nom||'—')}</span>
      <span style="display:flex;align-items:center;gap:8px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:17px;">\${fmt(parseFloat(it.montant)||0)}</span>
        <button onclick="openPersoChargeModal('\${it.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:13px;"><i class="ti ti-pencil"></i></button>
        <button onclick="deletePersoCharge('\${it.id}')" style="background:none;border:none;cursor:pointer;color:#8d2b21;font-size:13px;"><i class="ti ti-trash"></i></button>
      </span>
    </div>\`).join('');
    return \`<div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
        <span style="font-size:14px;font-weight:700;color:var(--navy);">\${c.emoji} \${c.nom}</span>
        <span style="font-family:'Cormorant Garamond',serif;font-size:21px;color:\${c.couleur};">\${fmt(c.total)}</span>
      </div>\${rows}
    </div>\`;
  }).join('')+\`</div>\`;
}

function renderPersoSimulateur(ctx){
  const el=q('#perso-simulateur'); if(!el)return;
  const def=ctx.objectif||ctx.confort||ctx.besoin||3000;
  el.innerHTML=\`<div class="card" style="padding:18px;">
    <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:4px;"><i class="ti ti-calculator"></i> Simulateur inversé</div>
    <div style="font-size:13px;color:var(--text-2);margin-bottom:12px;">Combien ton activité doit générer pour le salaire que tu veux te verser.</div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
      <label style="font-size:14px;">Je veux me verser</label>
      <input type="number" id="perso-sim-salaire" value="\${Math.round(def)}" min="0" step="100" oninput="renderPersoSimResult()" style="width:120px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:15px;"> <span style="font-size:14px;">€ / mois</span>
    </div>
    <div id="perso-sim-result"></div>
  </div>\`;
  renderPersoSimResult();
}
function renderPersoSimResult(){
  const el=q('#perso-sim-result'); if(!el)return;
  const ctx=computePerso();
  const inp=q('#perso-sim-salaire');
  const sal=inp?parseFloat(inp.value)||0:0;
  const caM=Math.round((sal+ctx.chargesProMensuel)/Math.max(0.01,1-ctx.tauxU-ctx.tauxC));
  const box=(lab,val,hint)=>\`<div style="flex:1;min-width:130px;background:var(--surface-2);border-radius:10px;padding:12px;">
    <div style="font-size:12px;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;">\${lab}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:600;color:var(--navy);">\${fmt(val)}</div>
    <div style="font-size:11.5px;color:var(--text-2);">\${hint}</div>
  </div>\`;
  el.innerHTML=\`<div style="display:flex;gap:10px;flex-wrap:wrap;">
    \${box('CA mensuel requis',caM,'CA à facturer / mois')}
    \${box('CA annuel requis',caM*12,'sur 12 mois')}
    \${box('URSSAF estimée',Math.round(caM*(ctx.tauxU+ctx.tauxC)),'cotisations / mois')}
  </div>\`;
}

function renderPersoDash(){
  const el=q('#dash-perso'); if(!el)return;
  const s=dbGetObj('settings');
  const charges=Array.isArray(s.persoCharges)?s.persoCharges:[];
  if(!charges.length){el.innerHTML='';return;}
  const ctx=computePerso();
  const {besoin,salaireConseille,resteAVivre,disponible}=ctx;
  const rColor=resteAVivre<200?'#F87171':resteAVivre<500?'#F6C453':'#b7d3ad';
  const cell=(emoji,lab,val,color)=>\`<div style="flex:1;min-width:140px;">
    <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:.06em;opacity:.6;">\${emoji} \${lab}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;\${color?'color:'+color+';':''}">\${fmt(val)}</div>
  </div>\`;
  el.innerHTML=\`<div style="background:var(--navy);border-radius:14px;padding:18px 24px;color:#fff;cursor:pointer;" onclick="navigate('budget-perso')">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.55;margin-bottom:10px;"><i class="ti ti-home"></i> Ta vie perso en un coup d'œil</div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-end;">
      \${cell('<i class="ti ti-coin"></i>','Dispo entreprise',disponible)}
      \${cell('<i class="ti ti-home"></i>','Besoin de vie',besoin)}
      \${cell('<i class="ti ti-cash"></i>','Salaire conseillé',salaireConseille,'#b7d3ad')}
      \${cell('<i class="ti ti-seeding"></i>','Reste à vivre',resteAVivre,rColor)}
    </div>
  </div>\`;
}

function openPersoChargeModal(id){
  const s=dbGetObj('settings');
  const items=Array.isArray(s.persoCharges)?s.persoCharges:[];
  const it=id?items.find(x=>x.id===id):null;
  q('#perso-charge-id').value=it?it.id:'';
  q('#perso-charge-nom').value=it?(it.nom||''):'';
  q('#perso-charge-cat').value=it?(it.cat||'logement'):'logement';
  q('#perso-charge-montant').value=it&&it.montant!=null?it.montant:'';
  q('#perso-charge-type').value=it?(it.type||'fixe'):'fixe';
  q('#perso-charge-title').textContent=it?'Modifier la dépense':'Nouvelle dépense perso';
  q('#modal-perso-charge').style.display='flex';
}
async function savePersoCharge(){
  try{
    const nom=q('#perso-charge-nom').value.trim();
    const montant=parseFloat(q('#perso-charge-montant').value);
    if(!nom){toast('Donne un intitulé','error');return;}
    if(isNaN(montant)||montant<0){toast('Montant invalide','error');return;}
    const cat=q('#perso-charge-cat').value, type=q('#perso-charge-type').value;
    const settings=dbGetObj('settings');
    const items=Array.isArray(settings.persoCharges)?settings.persoCharges.slice():[];
    const id=q('#perso-charge-id').value;
    if(id){const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]={...items[i],nom,cat,montant,type};}
    else{items.push({id:'pc_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,cat,montant,type});}
    settings.persoCharges=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-perso-charge').style.display='none';
    toast('Dépense enregistrée','success');
    renderBudgetPerso();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function deletePersoCharge(id){
  if(!confirm('Supprimer cette dépense ?'))return;
  try{
    const settings=dbGetObj('settings');
    settings.persoCharges=(Array.isArray(settings.persoCharges)?settings.persoCharges:[]).filter(x=>x.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Supprimée','success');
    renderBudgetPerso();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
function openPersoPaliersModal(){
  const s=dbGetObj('settings');
  q('#perso-palier-confort').value=s.persoConfort!=null&&s.persoConfort!==0?s.persoConfort:'';
  q('#perso-palier-objectif').value=s.persoObjectif!=null&&s.persoObjectif!==0?s.persoObjectif:'';
  q('#perso-palier-epargne').value=s.objectifEpargne!=null&&s.objectifEpargne!==0?s.objectifEpargne:'';
  q('#modal-perso-paliers').style.display='flex';
}
async function savePersoPaliers(){
  try{
    const settings=dbGetObj('settings');
    const c=parseFloat(q('#perso-palier-confort').value); settings.persoConfort=isNaN(c)?0:c;
    const o=parseFloat(q('#perso-palier-objectif').value); settings.persoObjectif=isNaN(o)?0:o;
    const ep=parseFloat(q('#perso-palier-epargne').value); settings.objectifEpargne=isNaN(ep)?0:ep;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-perso-paliers').style.display='none';
    toast('Paliers enregistrés','success');
    renderBudgetPerso();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function loadProjetsVie(){renderProjetsVie();}
function renderProjetsVie(){
  const el=q('#projets-vie-grid'); if(!el)return;
  const s=dbGetObj('settings');
  const projets=Array.isArray(s.projetsVie)?s.projetsVie.slice():[];
  if(!projets.length){el.innerHTML=\`<div class="card" style="padding:32px;text-align:center;border:1.5px dashed var(--border);background:none;">
    <div style="font-size:34px;"><i class="ti ti-target"></i></div>
    <div style="font-size:17px;font-weight:600;color:var(--navy);margin:10px 0 6px;">Donne une mission à ton épargne</div>
    <div style="font-size:14.5px;color:var(--text-2);max-width:440px;margin:0 auto 18px;line-height:1.55;">Vacances, nouvelle voiture, apport immo… crée un projet et on te dit quand il deviendra réalité.</div>
    <button class="btn btn-primary" onclick="openProjetVieModal()"><i class="ti ti-plus"></i> Créer mon premier projet</button>
  </div>\`;return;}
  const sup=Array.isArray(s.persoEpargne)?s.persoEpargne:[];
  const supName=id=>{const e=sup.find(x=>x.id===id);if(!e)return '';const t=supType(e.cat);return t.emoji+' '+(e.nom||t.nom);};
  const enrich=projets.map(p=>{
    const cible=parseFloat(p.cible)||0, epargne=parseFloat(p.epargne)||0, mens=parseFloat(p.mensualite)||0;
    const reste=Math.max(0,cible-epargne);
    const eta=mens>0?Math.ceil(reste/mens):null;
    return {...p,cible,epargne,mens,reste,eta,pct:cible>0?Math.min(100,Math.round(epargne/cible*100)):0,prio:parseInt(p.priorite)||2};
  });
  const totalReste=enrich.reduce((a,p)=>a+p.reste,0);
  const totalMens=enrich.reduce((a,p)=>a+p.mens,0);
  const etas=enrich.filter(p=>p.eta!=null&&p.reste>0).map(p=>p.eta);
  const premEta=etas.length?Math.min.apply(null,etas):null;
  const overview=\`<div style="background:var(--navy);border-radius:20px;padding:24px 30px;color:#fff;margin-bottom:18px;display:flex;gap:32px;flex-wrap:wrap;align-items:center;">
    <div><div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-target"></i> Mes projets de vie</div><div style="font-family:'Cormorant Garamond',serif;font-size:39px;font-weight:700;">\${enrich.length} projet\${enrich.length>1?'s':''}</div></div>
    <div><div style="font-size:12px;opacity:.6;">À épargner</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;">\${fmt(totalReste)}</div></div>
    <div><div style="font-size:12px;opacity:.6;">Épargne mensuelle</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;">\${fmt(totalMens)} / mois</div></div>
    \${premEta!=null?\`<div><div style="font-size:12px;opacity:.6;">Premier objectif</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;">\${moisEnDate(premEta)}</div></div>\`:''}
  </div>\`;
  enrich.sort((a,b)=>(b.prio-a.prio)||((a.eta==null?1e9:a.eta)-(b.eta==null?1e9:b.eta)));
  const cards=enrich.map(p=>{
    const c=pvieCat(p.cat);
    const stars='<i class="ti ti-star"></i>'.repeat(p.prio);
    let timeBlock;
    if(p.reste<=0){timeBlock=\`<div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;color:#456039;"><i class="ti ti-confetti"></i> Objectif atteint</div>\`;}
    else if(p.eta!=null){timeBlock=\`<div style="font-size:12px;color:var(--text-2);">Dans environ</div><div style="font-family:'Cormorant Garamond',serif;font-size:39px;font-weight:700;color:var(--navy);line-height:1.05;">\${p.eta} mois</div><div style="font-size:13px;color:var(--text-2);">\${moisEnDate(p.eta)}</div>\`;}
    else{timeBlock=\`<div style="font-size:14px;color:var(--text-2);">Ajoute une épargne mensuelle pour estimer la date <i class="ti ti-calendar"></i></div>\`;}
    let proj='';
    if(p.mens>0&&p.reste>0){
      const eta2=Math.ceil(p.reste/(p.mens*2));
      const gain=p.eta-eta2;
      if(gain>0)proj=\`<div style="margin-top:10px;padding:10px 12px;background:var(--surface-2);border-radius:10px;font-size:13px;color:var(--text-1);line-height:1.5;"><i class="ti ti-bulb"></i> En passant à <strong>\${fmt(p.mens*2)} / mois</strong>, objectif dès <strong>\${moisEnDate(eta2)}</strong> — <span style="color:#456039;font-weight:600;">tu gagnes \${gain} mois <i class="ti ti-flame"></i></span></div>\`;
    }
    const prioColor=p.prio>=3?'#8d2b21':p.prio===2?'#a5502e':'#8b98ad';
    return \`<div class="card" style="padding:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div><span style="font-size:15px;font-weight:700;color:var(--navy);">\${c.emoji} \${escHtml(p.nom||'Projet')}</span><div style="font-size:12px;color:#a5502e;margin-top:2px;">\${stars}</div></div>
        <button onclick="openProjetVieModal('\${p.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);"><i class="ti ti-pencil"></i></button>
      </div>
      <div style="margin-bottom:12px;">\${timeBlock}</div>
      <div style="height:8px;background:var(--border);border-radius:5px;overflow:hidden;"><div style="height:100%;width:\${p.pct}%;background:var(--violet-ink);border-radius:5px;transition:width .5s;"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--text-2);margin-top:6px;">
        <span>\${fmt(p.epargne)} / \${fmt(p.cible)} · \${p.pct}%</span><span>\${p.mens>0?fmt(p.mens)+' / mois':''}</span>
      </div>
      \${p.support?\`<div style="font-size:12px;color:var(--text-2);margin-top:6px;"><i class="ti ti-map-pin"></i> Placé sur \${escHtml(supName(p.support))}</div>\`:''}
      \${proj}
    </div>\`;
  }).join('');
  el.innerHTML=overview+\`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">\`+cards+\`</div>\`;
}

function openProjetVieModal(id){
  const s=dbGetObj('settings');
  const items=Array.isArray(s.projetsVie)?s.projetsVie:[];
  const it=id?items.find(x=>x.id===id):null;
  q('#projet-vie-id').value=it?it.id:'';
  q('#projet-vie-nom').value=it?(it.nom||''):'';
  q('#projet-vie-cat').value=it?(it.cat||'autre'):'autre';
  q('#projet-vie-priorite').value=it&&it.priorite!=null?it.priorite:2;
  q('#projet-vie-cible').value=it&&it.cible!=null?it.cible:'';
  q('#projet-vie-epargne').value=it&&it.epargne!=null?it.epargne:'';
  q('#projet-vie-mensualite').value=it&&it.mensualite!=null?it.mensualite:'';
  // Supports d'épargne pour le lien projet → support
  const sup=Array.isArray(s.persoEpargne)?s.persoEpargne:[];
  const sel=q('#projet-vie-support');
  sel.innerHTML='<option value="">— Où est placé cet argent ? —</option>'+sup.map(e=>{const t=supType(e.cat);return '<option value="'+e.id+'">'+t.emoji+' '+escHtml(e.nom||t.nom)+'</option>';}).join('');
  sel.value=it&&it.support?it.support:'';
  q('#projet-vie-title').textContent=it?'Modifier le projet':'Nouveau projet de vie';
  q('#modal-projet-vie').style.display='flex';
}
async function saveProjetVie(){
  try{
    const nom=q('#projet-vie-nom').value.trim();
    if(!nom){toast('Donne un nom','error');return;}
    const cible=parseFloat(q('#projet-vie-cible').value)||0;
    const epargne=parseFloat(q('#projet-vie-epargne').value)||0;
    const mensualite=parseFloat(q('#projet-vie-mensualite').value)||0;
    const cat=q('#projet-vie-cat').value;
    const priorite=parseInt(q('#projet-vie-priorite').value)||2;
    const support=q('#projet-vie-support').value||'';
    const settings=dbGetObj('settings');
    const items=Array.isArray(settings.projetsVie)?settings.projetsVie.slice():[];
    const id=q('#projet-vie-id').value;
    if(id){const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]={...items[i],nom,cat,priorite,cible,epargne,mensualite,support};}
    else{items.push({id:'pv_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,cat,priorite,cible,epargne,mensualite,support,lastVersement:_ymNow()});}
    settings.projetsVie=items;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-projet-vie').style.display='none';
    toast('Projet enregistré','success');
    renderProjetsVie();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function deleteProjetVie(id){
  if(!id){q('#modal-projet-vie').style.display='none';return;}
  if(!confirm('Supprimer ce projet ?'))return;
  try{
    const settings=dbGetObj('settings');
    settings.projetsVie=(Array.isArray(settings.projetsVie)?settings.projetsVie:[]).filter(x=>x.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-projet-vie').style.display='none';
    toast('Projet supprimé','success');
    renderProjetsVie();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

/* --- Comptes ---------------------------------------------------------- */
async function loadComptes(){
  renderDepensesPrevues();
  // Sync silencieux puis rendu (sans boucle)
  try{await syncQonto(true);}catch(e){}
  renderComptes();
}
function renderQontoCalc(){
  const s=dbGetObj('settings');
  const dateDebut=s.qontoDateDebut||'2026-01-01';
  const soldeInitial=parseFloat(s.qontoSoldeInitial)||0;
  if(q('#qonto-calc-depuis'))q('#qonto-calc-depuis').textContent=fmtDate(dateDebut);

  // Nb de mois depuis dateDebut
  const dDebut=new Date(dateDebut+'T00:00:00');
  const dAuj=new Date();
  const nbMois=Math.max(1,Math.round((dAuj-dDebut)/(1000*60*60*24*30.44)));

  // Toutes les factures depuis dateDebut (hors retard = toutes celles qui comptent)
  const factures=dbGet('factures').filter(f=>f.statut!=='retard'&&(f.date||'')>=dateDebut);
  const caTotal=factures.reduce((s,f)=>s+(f.montant||0),0);
  const facPayees=factures.filter(f=>f.statut==='payee');
  const caEncaisse=facPayees.reduce((s,f)=>s+(f.montant||0),0);
  const caAttente=caTotal-caEncaisse;

  // Dépenses depuis dateDebut
  const toutesDepenses=dbGet('depenses').filter(d=>(d.date||'')>=dateDebut);
  const versementsEffectues=toutesDepenses.filter(d=>d.categorie==='Versement perso');
  const totalVersements=versementsEffectues.reduce((s,d)=>s+(d.montant||0),0);
  const totalTout=toutesDepenses.reduce((s,d)=>s+(d.montant||0),0);

  // Solde réel Qonto si sync effectué, sinon calcul estimé
  const soldeQontoReel=s.qontoSoldeReel!=null?parseFloat(s.qontoSoldeReel):null;
  const soldeActuel=soldeQontoReel!==null?soldeQontoReel:(soldeInitial+caEncaisse-totalTout);
  _qontoSoldeCalc=soldeActuel;
  const suffixAttente=caAttente>0?' · '+fmt(caAttente)+' en attente':'';
  const suffixSource=soldeQontoReel!==null?' (Qonto réel)':' (estimé)';
  if(q('#qonto-solde-net'))q('#qonto-solde-net').textContent=fmt(soldeActuel)+suffixAttente+suffixSource;
  // Répercuter le solde calculé dans la carte compte manuelle
  renderComptes();

  // ── Provisions ────────────────────────────────────────────────────────
  const tauxU=(parseFloat(s.tauxUrssaf)||25.6)/100;
  const tauxC=(parseFloat(s.tauxCfp)||0.2)/100;
  const pas=parseFloat(s.pasFixe)||40;
  const cfe=parseFloat(s.cfeAnnuelle||s.cfe)||0;
  const provCharges=Math.round((caEncaisse*(tauxU+tauxC)+pas*nbMois+cfe*(nbMois/12))*100)/100;

  const abos=dbGet('abonnements').filter(a=>a.statut==='actif'||!a.statut);
  const totalAbosMois=abos.reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  // Provision sur 12 mois (budget annuel à conserver, pas × mois écoulés)
  const provChargesFixes=Math.round(totalAbosMois*12*100)/100;

  const netApresCharges=Math.max(0,caEncaisse-provCharges-provChargesFixes);
  const pctVers=(parseFloat(s.pctVersement)||65)/100;
  const pctTreso=(parseFloat(s.pctTresorerie)||20)/100;
  const pctFormation=(parseFloat(s.pctFormation)||10)/100;
  const pctEpargne=Math.max(0,1-pctVers-pctTreso-pctFormation);
  const provVers=Math.round(netApresCharges*pctVers*100)/100;
  const provTreso=Math.round(netApresCharges*pctTreso*100)/100;
  const provFormation=Math.round(netApresCharges*pctFormation*100)/100;
  const provEpargne=Math.round(netApresCharges*pctEpargne*100)/100;

  // ── Dépenses réelles par enveloppe (mapping catégories) ───────────────
  function depCat(...cats){
    return toutesDepenses.filter(d=>cats.includes(d.categorie)).reduce((s,d)=>s+(d.montant||0),0);
  }
  const depCharges   = depCat('Charges sociales');
  const depFixes     = depCat('Logiciels & abonnements','Matériel','Communication','Comptabilité','Déplacement','Autre');
  const depFormation = depCat('Formation');
  const depVers      = totalVersements;
  // Trésorerie : tout ce qui reste non catégorisé dans les enveloppes ci-dessus
  const depTreso     = Math.max(0, totalTout - depCharges - depFixes - depFormation - depVers);

  // ── Calculs disponible net ────────────────────────────────────────────
  const resteCharges   = Math.max(0, provCharges    - depCharges);
  const resteChargesFix= Math.max(0, provChargesFixes - depFixes);
  const resteFormation = Math.max(0, provFormation  - depFormation);
  const totalASecuriser= resteCharges + resteChargesFix + resteFormation;
  const disponibleBrut = soldeActuel - totalASecuriser;
  const versementPossible = Math.max(0, Math.round(disponibleBrut * pctVers * 100)/100 - depVers);
  const tresoLibre     = Math.max(0, Math.round(disponibleBrut * pctTreso * 100)/100);
  const vraimentLibre  = Math.max(0, disponibleBrut - Math.round(disponibleBrut*pctVers*100)/100 - tresoLibre - Math.round(disponibleBrut*(parseFloat(s.pctFormation||10)/100)*100)/100);

  // ── Listes dépenses par enveloppe ────────────────────────────────────
  function depLines(depList){
    if(!depList||!depList.length)return '<div style="font-size:12px;color:var(--text-2);margin-top:6px;font-style:italic;">Aucune dépense dans cette enveloppe</div>';
    return '<div style="margin-top:8px;border-top:1px solid #E0DDD8;padding-top:8px;">'+
      depList.map(d=>'<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-2);padding:2px 0;">'+
        '<span>'+fmtDate(d.date)+(d.description?' — '+d.description:'')+'</span>'+
        '<span style="font-weight:600;white-space:nowrap;margin-left:8px;color:var(--navy);">−'+fmt(d.montant||0)+'</span>'+
      '</div>').join('')+
    '</div>';
  }

  const listCharges  = toutesDepenses.filter(d=>d.categorie==='Charges sociales');
  const listFixes    = toutesDepenses.filter(d=>['Logiciels & abonnements','Matériel','Communication','Comptabilité','Déplacement','Autre'].includes(d.categorie));
  const listFormation= toutesDepenses.filter(d=>d.categorie==='Formation');
  const listVers     = versementsEffectues;

  // ── Rendu ──────────────────────────────────────────────────────────────
  const envEl=q('#qonto-enveloppes');
  if(!envEl)return;

  function provCard(icon,label,provision,depense,restant,couleur,depList){
    const pct=provision>0?Math.min(100,Math.round(depense/provision*100)):0;
    const overshot=restant<0;
    return '<div style="background:#F5F3EF;border-radius:10px;padding:14px 16px;border-left:4px solid '+(overshot?'#8d2b21':couleur)+';">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">'+
        '<div style="display:flex;align-items:center;gap:8px;">'+
          '<span style="font-size:18px;">'+icon+'</span>'+
          '<span style="font-size:13px;font-weight:700;color:var(--navy);">'+label+'</span>'+
        '</div>'+
        '<div style="text-align:right;">'+
          '<div style="font-size:11px;color:var(--text-2);">Provision</div>'+
          '<div style="font-size:14px;font-weight:600;color:var(--navy);">'+fmt(provision)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:12px;margin-bottom:8px;">'+
        '<div style="flex:1;background:'+(overshot?'#FEE':'#fff')+';border-radius:8px;padding:8px 10px;text-align:center;">'+
          '<div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">À garder de côté</div>'+
          '<div style="font-size:17px;font-weight:700;color:'+(overshot?'#8d2b21':restant===0?'#456039':couleur)+';">'+(restant===0?'<i class="ti ti-check"></i> Couvert':fmt(restant))+'</div>'+
        '</div>'+
        '<div style="flex:1;background:#fff;border-radius:8px;padding:8px 10px;text-align:center;">'+
          '<div style="font-size:11px;color:var(--text-2);margin-bottom:2px;">Déjà réglé</div>'+
          '<div style="font-size:17px;font-weight:700;color:var(--navy);">'+fmt(depense)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="height:5px;background:#ece3d4;border-radius:3px;margin-bottom:8px;">'+
        '<div style="height:100%;width:'+pct+'%;background:'+(overshot?'#8d2b21':pct>=100?'#456039':couleur)+';border-radius:3px;transition:width .5s;"></div></div>'+
      depLines(depList)+
    '</div>';
  }

  envEl.innerHTML =
    // ── Zone 1 : Synthèse ────────────────────────────────────────────────
    '<div style="grid-column:1/-1;background:var(--navy);border-radius:14px;padding:20px 24px;color:#fff;margin-bottom:4px;">'+
      '<div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;opacity:.7;margin-bottom:14px;">Synthèse · depuis '+fmtDate(dateDebut)+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">'+
        '<div>'+
          '<div style="font-size:12px;opacity:.6;margin-bottom:4px;">Solde Qonto</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;">'+fmt(soldeActuel)+'</div>'+
          (caAttente>0?'<div style="font-size:12px;opacity:.6;margin-top:4px;">+'+fmt(caAttente)+' en attente</div>':'')+
        '</div>'+
        '<div style="border-left:1px solid rgba(255,255,255,.2);padding-left:16px;">'+
          '<div style="font-size:12px;opacity:.6;margin-bottom:4px;"><i class="ti ti-lock"></i> À sécuriser</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:#F8B84E;">'+fmt(totalASecuriser)+'</div>'+
          '<div style="font-size:12px;opacity:.6;margin-top:4px;">charges + frais restants</div>'+
        '</div>'+
        '<div style="border-left:1px solid rgba(255,255,255,.2);padding-left:16px;">'+
          '<div style="font-size:12px;opacity:.6;margin-bottom:4px;"><i class="ti ti-circle-check"></i> Disponible net</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:'+(disponibleBrut<0?'#F87171':'#4ADE80')+';">'+fmt(disponibleBrut)+'</div>'+
          '<div style="font-size:12px;opacity:.6;margin-top:4px;">après provisions sécurisées</div>'+
        '</div>'+
      '</div>'+
      // Répartition du disponible
      (disponibleBrut>0?
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.15);">'+
        '<div style="font-size:12px;opacity:.6;margin-bottom:10px;">Répartition du disponible net</div>'+
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:11px;opacity:.6;margin-bottom:3px;"><i class="ti ti-cash"></i> Versement perso ('+Math.round(pctVers*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctVers*100)/100)+'</div>'+
            (depVers>0?'<div style="font-size:11px;opacity:.5;margin-top:2px;">Déjà versé : '+fmt(depVers)+'</div>':'')+
          '</div>'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:11px;opacity:.6;margin-bottom:3px;"><i class="ti ti-building-bank"></i> Trésorerie ('+Math.round(pctTreso*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctTreso*100)/100)+'</div>'+
          '</div>'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:11px;opacity:.6;margin-bottom:3px;"><i class="ti ti-books"></i> Formation ('+Math.round(pctFormation*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctFormation*100)/100)+'</div>'+
          '</div>'+
        '</div>'+
      '</div>':'')
    +'</div>'+
    // ── Zone 2 : Provisions ──────────────────────────────────────────────
    '<div style="grid-column:1/-1;font-size:13px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 4px;"><i class="ti ti-lock"></i> Provisions à sécuriser</div>'+
    provCard('<i class="ti ti-alert-circle"></i>','Charges sociales (URSSAF · CFE)',provCharges,depCharges,resteCharges,'#8d2b21',listCharges)+
    provCard('<i class="ti ti-clipboard-list"></i>','Charges fixes (abonnements · frais pro)',provChargesFixes,depFixes,resteChargesFix,'#a5502e',listFixes)+
    provCard('<i class="ti ti-books"></i>','Formation',provFormation,depFormation,resteFormation,'#7B4DD4',listFormation)+
    // ── Zone 3 : Versements perso ────────────────────────────────────────
    '<div style="grid-column:1/-1;font-size:13px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 4px;"><i class="ti ti-cash"></i> Versements perso effectués</div>'+
    '<div style="background:#F5F3EF;border-radius:10px;padding:14px 16px;border-left:4px solid #456039;">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'+
        '<span style="font-size:13px;font-weight:700;color:var(--navy);">Total versé depuis '+fmtDate(dateDebut)+'</span>'+
        '<span style="font-size:20px;font-weight:700;color:#456039;">'+fmt(depVers)+'</span>'+
      '</div>'+
      depLines(listVers)+
    '</div>';

  // ── Pots virtuels (grille en haut de la section) ──────────────────────
  const potsGrid=q('#qonto-pots-grid');
  if(potsGrid){
    function potCard(icon,nom,solde,couleur,sub,pct){
      const pctClamped=Math.min(100,Math.max(0,pct||0));
      return '<div class="pot-card">'+
        '<div class="pot-card-header">'+
          '<div>'+
            '<div class="pot-icon">'+icon+'</div>'+
            '<div class="pot-nom">'+nom+'</div>'+
          '</div>'+
          '<span class="badge" style="background:'+couleur+'22;color:'+couleur+';font-size:11px;">virtuel</span>'+
        '</div>'+
        '<div class="pot-solde" style="color:'+couleur+';">'+fmt(solde)+'</div>'+
        '<div class="pot-sub">'+sub+'</div>'+
        '<div class="pot-bar"><div class="pot-bar-fill" style="width:'+pctClamped+'%;background:'+couleur+';"></div></div>'+
      '</div>';
    }
    const pctUsedCharges  = provCharges>0 ? depCharges/provCharges*100 : 0;
    const pctUsedFixes    = provChargesFixes>0 ? depFixes/provChargesFixes*100 : 0;
    const pctUsedFormation= provFormation>0 ? depFormation/provFormation*100 : 0;
    const versementSolde  = Math.max(0,Math.round(disponibleBrut*pctVers*100)/100 - depVers);
    potsGrid.innerHTML=
      potCard('<i class="ti ti-alert-circle"></i>','URSSAF & Charges sociales', Math.max(0,resteCharges), '#8d2b21',
        depCharges>0?fmt(depCharges)+' deja regle · provision '+fmt(provCharges):'Provision sur CA encaisse',
        pctUsedCharges)+
      potCard('<i class="ti ti-clipboard-list"></i>','Charges fixes & abonnements', Math.max(0,resteChargesFix), '#a5502e',
        'Budget annuel '+fmt(provChargesFixes)+' · '+fmt(depFixes)+' dépensé',
        pctUsedFixes)+
      potCard('<i class="ti ti-books"></i>','Formation', Math.max(0,resteFormation), '#7B4DD4',
        'Provision '+fmt(provFormation)+' · '+fmt(depFormation)+' utilisé',
        pctUsedFormation)+
      potCard('<i class="ti ti-building-bank"></i>','Trésorerie buffer', Math.round(disponibleBrut*pctTreso*100)/100, '#2c4a72',
        Math.round(pctTreso*100)+'% du disponible net · sécurité',
        100)+
      potCard('<i class="ti ti-cash"></i>','Versement perso', versementSolde, '#456039',
        fmt(depVers)+' versé · reste à te virer',
        depVers>0?Math.min(100,depVers/(Math.round(disponibleBrut*pctVers*100)/100)*100):0)+
      (pctEpargne>0.001?potCard('<i class="ti ti-coin"></i>','Épargne', provEpargne, '#7c5cbf','Buffer long terme',0):'');
  }
}
function renderDepensesPrevues(){
  const list=dbGet('depenses_prevues');
  const el=q('#depenses-prevues-list');
  if(!el)return;
  if(!list.length){
    el.innerHTML='<p style="color:var(--text-2);font-size:14px;padding:8px 0;">Aucune dépense prévue. Clique sur "+ Ajouter" pour en planifier une.</p>';
    return;
  }
  const today=new Date().toISOString().slice(0,7);
  el.innerHTML='<div class="table-wrap"><table><thead><tr><th>Type</th><th>Description</th><th>Catégorie</th><th>Montant</th><th>Période / Date</th><th>Statut</th><th></th></tr></thead><tbody>'+
    list.map(d=>{
      const isMens=d.type==='mensuel';
      const badge=isMens
        ?'<span class="badge" style="background:#E8F1FF;color:#2c4a72;">Mensuelle</span>'
        :'<span class="badge" style="background:#f0e8fe;color:#7b4dd4;">Ponctuelle</span>';
      const periode=isMens
        ?(fmtDate(d.dateDebut||'')+(d.dateFin?' → '+fmtDate(d.dateFin):''))
        :fmtDate(d.dateDebut||'');
      const totMois=isMens&&d.dateDebut&&d.dateFin
        ?Math.ceil((new Date(d.dateFin)-new Date(d.dateDebut))/(1000*60*60*24*30.44)):null;
      const montantAff=isMens&&totMois?fmt(d.montant)+'/mois ('+fmt(d.montant*totMois)+' total)':fmt(d.montant||0);
      const sttBadge=d.statut==='terminee'?'<span class="badge badge-attente">Terminée</span>':'<span class="badge badge-payee">Active</span>';
      return '<tr>'+
        '<td>'+badge+'</td>'+
        '<td>'+escHtml(d.description||'—')+'</td>'+
        '<td class="td-muted">'+escHtml(d.categorie||'—')+'</td>'+
        '<td class="td-amount">'+montantAff+'</td>'+
        '<td>'+periode+'</td>'+
        '<td>'+sttBadge+'</td>'+
        '<td style="white-space:nowrap;">'+
          '<button class="btn btn-ghost btn-xs" data-dpid="'+d.id+'" onclick="editDepensePrevue(this.dataset.dpid)"><i class="ti ti-edit"></i></button>'+
          '<button class="btn btn-ghost btn-xs" data-dpid="'+d.id+'" onclick="deleteDepensePrevue(this.dataset.dpid)"><i class="ti ti-trash"></i></button>'+
        '</td></tr>';
    }).join('')+'</tbody></table></div>';
}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function openDepensePrevueModal(data={}){
  q('#modal-dp-title').textContent=data.id?'Modifier la dépense prévue':'Nouvelle dépense prévue';
  q('#dp-type').value=data.type||'ponctuel';
  q('#dp-description').value=data.description||'';
  q('#dp-categorie').value=data.categorie||'Autre';
  q('#dp-montant').value=data.montant||'';
  q('#dp-statut').value=data.statut||'active';
  q('#dp-datedebut').value=data.dateDebut||today();
  q('#dp-datefin').value=data.dateFin||'';
  q('#btn-save-depense-prevue').dataset.id=data.id||'';
  onDepensePrevueTypeChange();
  openModal('modal-depense-prevue');
}
function onDepensePrevueTypeChange(){
  const isMens=q('#dp-type')?.value==='mensuel';
  if(q('#dp-datefin-group'))q('#dp-datefin-group').style.display=isMens?'':'none';
  if(q('#dp-montant-label'))q('#dp-montant-label').textContent=isMens?'Montant mensuel *':'Montant *';
  if(q('#dp-datedebut-label'))q('#dp-datedebut-label').textContent=isMens?'Date de début *':'Date prévue *';
}
async function saveDepensePrevue(){
  const id=q('#btn-save-depense-prevue').dataset.id;
  const body={type:q('#dp-type').value,description:q('#dp-description').value.trim(),
    categorie:q('#dp-categorie').value,montant:parseFloat(q('#dp-montant').value)||0,
    dateDebut:q('#dp-datedebut').value||null,dateFin:q('#dp-datefin').value||null,
    statut:q('#dp-statut').value};
  if(!body.description){toast('Description requise','error');return;}
  if(!body.montant){toast('Montant requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('depenses_prevues',body);}else{await dbCreate('depenses_prevues',body);}
    closeModal('modal-depense-prevue');toast('Enregistrée','success');
    renderDepensesPrevues();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editDepensePrevue(id){const d=dbGet('depenses_prevues').find(x=>x.id===id);if(d)openDepensePrevueModal(d);}
function deleteDepensePrevue(id){
  confirmDialog('Supprimer','Irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('depenses_prevues',id);toast('Supprimée');renderDepensesPrevues();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}
function renderComptes(){
  const comptes=dbGet('comptes');
  const g=q('#comptes-grid');
  if(!g)return;
  g.innerHTML=comptes.length?comptes.map(c=>{
    const isCourant=c.type==='courant'||c.type==='professionnel';
    const soldeReel=dbGetObj('settings').qontoSoldeReel;
    const soldeAffiche=isCourant&&soldeReel!=null?parseFloat(soldeReel):(c.solde||0);
    const syncAt=dbGetObj('settings').qontoSyncAt;
    const soldeSuffix=isCourant&&soldeReel!=null?\` <span style="font-size:12px;color:var(--text-2);font-weight:400;">· Sync \${syncAt?fmtDate(syncAt.slice(0,10)):''}</span>\`:'';
    return \`
    <div class="compte-card">
      <div class="compte-card-header">
        <span class="compte-nom">\${c.nom}</span>
        <span class="badge badge-neutral">\${c.type}</span>
      </div>
      <div class="compte-solde">\${fmt(soldeAffiche)}\${soldeSuffix}</div>
      <div class="compte-upd">\${c.updatedAt?'Mis à jour '+fmtDate(c.updatedAt.slice(0,10)):''}</div>
      <div class="compte-historique">\${(c.historique||[]).slice(-5).reverse().map(h=>\`<div class="compte-historique-item"><span>\${fmtDate(h.date)} \${h.libelle||''}</span><span>\${fmt(h.montant||0)}</span></div>\`).join('')}</div>
      <div class="compte-actions">
        <button class="btn btn-secondary btn-sm" onclick="openCompteUpdateModal('\${c.id}')"><i class="ti ti-refresh"></i> Mettre à jour</button>
        <button class="btn btn-ghost btn-sm" onclick="openCompteModal('\${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCompte('\${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>\`;}).join(''):'<p style="color:var(--text-2);">Aucun compte</p>';
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
  if(q('#modal-compte-update-title'))q('#modal-compte-update-title').textContent=\`Mettre à jour — \${c?.nom}\`;
  q('#cu-solde').value=c?.solde||'';
  q('#cu-libelle').value='';
  openModal('modal-compte-update');
}
async function saveCompteUpdate(){
  const solde=parseFloat(q('#cu-solde').value);
  const libelle=q('#cu-libelle').value.trim();
  if(isNaN(solde)){toast('Solde invalide','error');return;}
  try{
    await api('PUT',\`/api/comptes/\${_compteUpdateId}\`,{solde});
    await api('POST',\`/api/comptes/\${_compteUpdateId}/historique\`,{date:today(),montant:solde,libelle});
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
  tbody.innerHTML=list.length?list.map(t=>\`<tr>
    <td>\${fmtDate(t.date)}</td><td>\${t.libelle||'—'}</td>
    <td>\${getN(t.compte)}</td>
    <td><span class="badge badge-\${t.type==='credit'?'success':t.type==='debit'?'danger':'neutral'}">\${t.type}</span></td>
    <td class="td-amount" style="color:\${t.type==='credit'?'var(--success)':'var(--danger)'};">\${t.type==='credit'?'+':'−'}\${fmt(t.montant||0)}</td>
    <td><button class="btn btn-ghost btn-xs" onclick="deleteTxn('\${t.id}')"><i class="ti ti-trash"></i></button></td>
  </tr>\`).join(''):'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-2);">Aucune transaction</td></tr>';
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
  if(q('#fac-kpi-taux'))q('#fac-kpi-taux').textContent=\`\${taux}%\`;
  // Les visages du CA — lever les confusions (facturé / encaissé / à encaisser / à facturer / prévisionnel)
  (function(){
    var _cav=q('#factures-ca-visages'); if(!_cav)return;
    var yy=String(new Date().getFullYear());
    var inY=function(f){return (f.date||'').startsWith(yy);};
    var caFacture=facturesData.filter(inY).reduce(function(s,f){return s+(f.montant||0);},0);
    var caEnc=facturesData.filter(function(f){return f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(yy);}).reduce(function(s,f){return s+(f.montant||0);},0);
    var caAEnc=facturesData.filter(function(f){return f.statut!=='payee'&&inY(f);}).reduce(function(s,f){return s+(f.montant||0);},0);
    var caAFac=0,caPrev=0; try{var PR=computePrevision();caAFac=PR.resteAFacturer||0;caPrev=PR.caProjete||0;}catch(e){}
    var rowV=function(icon,bg,col,nom,def,val){return \`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);"><div style="display:flex;align-items:center;gap:11px;"><div style="width:30px;height:30px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;background:\${bg};color:\${col};"><i class="ti \${icon}"></i></div><div style="font-size:14px;">\${nom}<small style="display:block;color:var(--text-2);font-size:11.5px;">\${def}</small></div></div><div style="font-family:'Cormorant Garamond',serif;font-size:22px;">\${fmt(val)}</div></div>\`;};
    _cav.innerHTML=\`<div class="card" style="padding:24px;"><div class="dash-sec-title"><i class="ti ti-versions"></i> Les visages de ton CA · \${yy}</div>\`
      +rowV('ti-file-invoice','var(--surface-2)','var(--terre)','CA facturé','tout ce que tu as facturé cette année',caFacture)
      +rowV('ti-check','var(--success-10)','#456039','CA encaissé','réellement entré sur ton compte',caEnc)
      +rowV('ti-clock','var(--warning-10)','#a5502e','CA à encaisser','facturé mais pas encore payé',caAEnc)
      +rowV('ti-calendar-plus','var(--glycine)','#2c4a72','CA à facturer','projets & récurrents à venir',caAFac)
      +rowV('ti-chart-line','var(--surface-2)','var(--terre)','CA prévisionnel','encaissé + à encaisser + à facturer',caPrev)
      +\`<p style="font-size:12px;color:var(--text-2);margin-top:10px;">Seul le <strong>CA encaissé</strong> est de l'argent réellement disponible — et il passe encore par tes réserves avant ton versement.</p></div>\`;
  })();

  renderFactures();
  // Graphiques
  const y=new Date().getFullYear();
  const payees=facturesData.filter(f=>f.statut==='payee');
  const byClient={};payees.forEach(f=>{byClient[f.client||'—']=(byClient[f.client||'—']||0)+(f.montant||0);});
  const topClients=Object.entries(byClient).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const c1=q('#chart-fac-client');
  if(c1&&topClients.length)drawDonutChart(c1,topClients.map(([k])=>k),topClients.map(([,v])=>v),PALETTE);
  const caMois=MOIS_COURT.map((_,mi)=>{const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;return payees.filter(f=>(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);});
  const c2=q('#chart-fac-mois');
  if(c2)drawBarChart(c2,MOIS_COURT,[{data:caMois,color:COLORS.blue}]);
}
function renderFactures(){
  const search=q('#factures-search')?.value.toLowerCase()||'';
  const statut=q('#factures-filter-statut')?.value||'';
  const projet=q('#factures-filter-projet')?.value||'';
  const client=q('#factures-filter-client')?.value||'';
  const annee=q('#factures-filter-annee')?.value||'';
  const mois=q('#factures-filter-mois')?.value||'';
  let list=[...facturesData];
  if(search)list=list.filter(f=>((f.numero||'')+(f.client||'')+(f.description||'')+(f.projet||'')).toLowerCase().includes(search));
  if(statut)list=list.filter(f=>f.statut===statut);
  if(projet)list=list.filter(f=>(f.projetId||f.projet||'')===projet);
  if(client)list=list.filter(f=>(f.client||'')===client);
  const tri=q('#factures-sort')?.value||'date-desc';
  const moisPaiement=q('#factures-filter-mois-paiement')?.value||'';
  if(annee)list=list.filter(f=>(f.date||'').startsWith(annee));
  if(mois)list=list.filter(f=>(f.date||'').slice(5,7)===mois);
  if(moisPaiement)list=list.filter(f=>(f.datePaiement||'').slice(5,7)===moisPaiement);
  list.sort((a,b)=>{
    if(tri==='date-asc')     return (a.date||'').localeCompare(b.date||'');
    if(tri==='paiement-desc')return (b.datePaiement||b.date||'').localeCompare(a.datePaiement||a.date||'');
    if(tri==='paiement-asc') return (a.datePaiement||a.date||'').localeCompare(b.datePaiement||b.date||'');
    if(tri==='montant-desc') return (b.montant||0)-(a.montant||0);
    if(tri==='montant-asc')  return (a.montant||0)-(b.montant||0);
    return (b.date||'').localeCompare(a.date||'');
  });
  // Mise à jour filtre années
  const selAnnee=q('#factures-filter-annee');
  if(selAnnee){
    const annees=[...new Set(facturesData.map(f=>(f.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
    const curA=selAnnee.value;
    selAnnee.innerHTML=\`<option value="">Toutes années</option>\`+annees.map(a=>\`<option value="\${a}" \${a===curA?'selected':''}>\${a}</option>\`).join('');
  }
  // Mise à jour filtre projets (via projetId ou nom texte)
  const selProjet=q('#factures-filter-projet');
  if(selProjet){
    const allProjets=dbGet('projets');
    const usedIds=new Set(facturesData.map(f=>f.projetId).filter(Boolean));
    const usedNames=new Set(facturesData.map(f=>f.projetId?null:f.projet).filter(Boolean));
    const cur=selProjet.value;
    const opts=allProjets.filter(p=>usedIds.has(p.id)).map(p=>\`<option value="\${p.id}" \${p.id===cur?'selected':''}>\${p.nom}</option>\`);
    usedNames.forEach(n=>opts.push(\`<option value="\${n}" \${n===cur?'selected':''}>\${n}</option>\`));
    selProjet.innerHTML=\`<option value="">Tous projets</option>\`+opts.join('');
  }
  // Mise à jour filtre clients
  const selClient=q('#factures-filter-client');
  if(selClient){
    const clients=[...new Set(facturesData.map(f=>f.client).filter(Boolean))].sort();
    const curC=selClient.value;
    selClient.innerHTML=\`<option value="">Tous clients</option>\`+clients.map(c=>\`<option value="\${c}" \${c===curC?'selected':''}>\${c}</option>\`).join('');
  }
  const tbody=q('#factures-tbody');
  if(!tbody)return;
  tbody.innerHTML=list.length?list.map(f=>{
    const proj=f.projetId?dbGet('projets').find(x=>x.id===f.projetId):null;
    const dv=proj?.devisId?dbGet('devis').find(x=>x.id===proj.devisId):null;
    const projetCell=proj?proj.nom:(f.description||'<span style="color:var(--text-2);">—</span>');
    const devisCell=dv
      ?\`<button class="btn btn-ghost btn-xs" style="color:#456039;font-weight:600;gap:4px;" title="Voir le devis \${dv.numero}" onclick="navigate('devis');setTimeout(()=>highlightDevis('\${dv.id}'),300)"><i class="ti ti-file-description"></i> \${dv.numero}</button>\`
      :'<span style="color:var(--text-2);font-size:13px;">—</span>';
    return\`<tr>
      <td>\${fmtDate(f.date)}</td>
      <td>\${f.dateEcheance?fmtDate(f.dateEcheance):'<span style="color:var(--text-2);">—</span>'}</td>
      <td>\${f.datePaiement?fmtDate(f.datePaiement):'<span style="color:var(--text-2);">—</span>'}</td>
      <td class="td-mono">\${f.numero||'—'}</td>
      <td>\${f.client||'—'}</td>
      <td class="td-muted">\${projetCell}</td>
      <td>\${devisCell}</td>
      <td class="td-amount">\${fmt(f.montant||0)}</td>
      <td><span class="badge badge-\${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}">\${f.statut==='payee'?'Payée':f.statut==='retard'?'En retard':'En attente'}</span></td>
      <td style="white-space:nowrap;">
        \${f.pdfKey?\`<button class="btn btn-sm" style="background:#C5DEFF;color:#2c4a72;border:none;gap:4px;" title="Voir PDF" onclick="previewPDF('\${f.id}','\${f.numero}')"><i class="ti ti-file-filled"></i> PDF</button>\`:\`<span style="font-size:12px;color:var(--text-2);padding:2px 6px;">—</span>\`}
        <button class="btn btn-ghost btn-xs" onclick="editFacture('\${f.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="deleteFacture('\${f.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>\`;
  }).join(''):'<tr><td colspan="10" style="text-align:center;padding:24px;color:var(--text-2);">Aucune facture</td></tr>';
}
function openFactureModal(data={}){
  q('#modal-facture-title').textContent=data.id?'Modifier la facture':'Nouvelle facture';
  q('#f-numero').value=data.numero||'';q('#f-statut').value=data.statut||'attente';
  refreshTiersDatalist();
  q('#f-client').value=data.client||'';
  // Projet : filtre par client puis restaure la valeur
  refreshProjetsSelect(data.client||'');
  q('#f-projet-id').value=data.projetId||'';
  // Contexte projet : si on édite une facture existante déjà liée
  if(data.projetId){onFactureProjetChange(true);}else{const ctx=q('#f-projet-context');if(ctx)ctx.style.display='none';}
  q('#f-type-facture').value=data.typeFacture||'standard';
  q('#f-description').value=data.description||'';
  q('#f-date').value=data.date||today();
  q('#f-date-echeance').value=data.dateEcheance||'';
  q('#f-date-paiement').value=data.datePaiement||'';
  const defDelai=parseInt(dbGetObj('settings').delaiPaiement)||30;
  if(q('#f-delai'))q('#f-delai').value=defDelai;
  if(!data.id&&!data.dateEcheance){q('#f-date-echeance').value='';_calcEcheance(true);}
  q('#f-montant').value=data.montant||'';
  q('#btn-save-facture').dataset.id=data.id||'';
  const btn=q('#f-pdf-btn'),nameEl=q('#f-pdf-name'),fileIn=q('#f-pdf-file');
  if(btn&&nameEl&&fileIn){
    fileIn.value='';
    if(data.pdfKey){
      btn.className='pdf-btn present';btn.innerHTML=\`<i class="ti ti-file-filled"></i> PDF attaché\`;
      nameEl.innerHTML=\`<a href="/api/factures/\${data.id}/pdf" target="_blank" style="color:var(--blue);">Voir le PDF</a>\`;
    }else{
      btn.className='pdf-btn vide';btn.innerHTML='<i class="ti ti-paperclip"></i> Attacher un PDF';
      nameEl.textContent='';
    }
  }
  openModal('modal-facture');
}
function _calcEcheance(forceOverwrite){
  const dateVal=q('#f-date')?.value;
  const echeanceEl=q('#f-date-echeance');
  if(!dateVal||!echeanceEl)return;
  if(!forceOverwrite&&echeanceEl.value)return;
  const delai=parseInt(q('#f-delai')?.value);
  const d=new Date(dateVal+'T00:00:00');
  d.setDate(d.getDate()+(delai>0?delai:(parseInt(dbGetObj('settings').delaiPaiement)||30)));
  echeanceEl.value=d.toISOString().slice(0,10);
}
function onFactureDateChange(){_calcEcheance(false);}
function onFactureDelaiChange(){_calcEcheance(true);}
function onDevisDateChange(){
  const dateVal=q('#dv-date')?.value;
  const expEl=q('#dv-date-expiration');
  if(dateVal&&expEl&&!expEl.value){
    const d=new Date(dateVal+'T00:00:00');
    d.setDate(d.getDate()+30);
    expEl.value=d.toISOString().slice(0,10);
  }
}
function onFactureClientChange(){
  const client=q('#f-client')?.value||'';
  refreshProjetsSelect(client);
  q('#f-projet-id').value='';
  const ctx=q('#f-projet-context');if(ctx)ctx.style.display='none';
}
function onFactureProjetChange(keepValues=false){
  const projetId=q('#f-projet-id')?.value;
  const ctx=q('#f-projet-context');
  if(!projetId){if(ctx)ctx.style.display='none';return;}
  const projet=dbGet('projets').find(x=>x.id===projetId);
  if(!projet){if(ctx)ctx.style.display='none';return;}
  // Auto-fill client if empty
  const clientSel=q('#f-client');
  if(clientSel&&!clientSel.value&&projet.client){clientSel.value=projet.client;}
  // Linked devis
  const devis=projet.devisId?dbGet('devis').find(x=>x.id===projet.devisId):null;
  // Compute what's already invoiced
  const linked=dbGet('factures').filter(f=>f.projetId===projetId);
  const montantFacture=linked.reduce((s,f)=>s+(f.montant||0),0);
  const reste=Math.max(0,(projet.montantTotal||0)-montantFacture);
  // Build context block
  const typeLabel={unique:'Facture unique',echelonne:'Échelonné',mensuel:'Mensuel'};
  let lines=[];
  if(devis)lines.push(\`<i class="ti ti-file"></i> Devis \${devis.numero} · signé · \${fmt(devis.montant)}\`);
  lines.push(\`<i class="ti ti-folder"></i> \${projet.nom} · \${typeLabel[projet.type]||projet.type}\${projet.type==='mensuel'?(projet.dureeIndeterminee?' · indéterminé':' · '+projet.nombreMois+' mois'):''}\`);
  lines.push(\`Facturé : \${fmt(montantFacture)}\${!projet.dureeIndeterminee?' / '+fmt(projet.montantTotal||0):''} · <strong style="color:\${reste>0?'#a5502e':'#456039'};">\${projet.dureeIndeterminee?(linked.length+' facture(s) émise(s)'):(reste>0?'Reste : '+fmt(reste):'<i class="ti ti-check"></i> Complet')}</strong>\`);
  // Suggest type & montant
  let sugType='standard',sugMontant=null,sugNote='';
  if(projet.type==='mensuel'&&projet.dureeIndeterminee){
    sugType='mensuel';
    sugMontant=projet.montantTotal||0;
    sugNote=\`Mois \${linked.length+1} suggéré · \${fmt(sugMontant)}/mois\`;
  }else if(projet.type==='mensuel'&&projet.nombreMois){
    sugType='mensuel';
    sugMontant=Math.round((projet.montantTotal||0)/projet.nombreMois*100)/100;
    const moisFact=linked.length;
    const resteMois=Math.max(0,projet.nombreMois-moisFact);
    sugNote=resteMois>0?\`Mois \${moisFact+1}/\${projet.nombreMois} suggéré · \${fmt(sugMontant)}\`:\`<i class="ti ti-check"></i> Tous les mois facturés\`;
  }else if(projet.type==='echelonne'){
    const hasA=linked.some(f=>f.typeFacture==='acompte');
    const hasS=linked.some(f=>f.typeFacture==='solde');
    if(!hasA){sugType='acompte';sugNote='<i class="ti ti-bulb"></i> Acompte suggéré (pas encore émis)';}
    else if(!hasS&&reste>0){sugType='solde';sugNote=\`<i class="ti ti-bulb"></i> Solde suggéré · \${fmt(reste)} restant\`;}
    else if(reste>0){sugType='intermediaire';sugNote=\`<i class="ti ti-bulb"></i> Intermédiaire suggéré · \${fmt(reste)} restant\`;}
  }
  if(sugNote)lines.push(sugNote);
  if(ctx){ctx.style.display='';ctx.innerHTML=lines.join('<br>');}
  // Sync hidden text field with project name
  if(q('#f-projet'))q('#f-projet').value=projet.nom;
  // Apply suggestions only on fresh selection (not when editing existing facture)
  if(!keepValues){
    q('#f-type-facture').value=sugType;
    if(sugMontant&&!q('#f-montant').value)q('#f-montant').value=sugMontant;
  }
}
async function saveFacture(){
  const id=q('#btn-save-facture').dataset.id;
  const body={numero:q('#f-numero').value.trim(),statut:q('#f-statut').value,client:q('#f-client').value.trim(),
    projet:q('#f-projet').value.trim(),description:q('#f-description').value.trim(),
    date:q('#f-date').value,dateEcheance:q('#f-date-echeance').value||null,datePaiement:q('#f-date-paiement').value||null,
    montant:parseFloat(q('#f-montant').value)||0,
    typeFacture:q('#f-type-facture').value||'standard',
    projetId:q('#f-projet-id').value||null};
  if(!body.client||!body.montant){toast('Client et montant requis','error');return;}
  try{
    let saved;
    if(id){body.id=id;saved=await dbUpdate('factures',body);}else{saved=await dbCreate('factures',body);}
    // Upload PDF si sélectionné
    const fileIn=q('#f-pdf-file');
    if(fileIn?.files?.length){
      const fid=saved?.id||id;
      const fd=new FormData();fd.append('file',fileIn.files[0]);
      const res=await fetch(\`/api/factures/\${fid}/pdf\`,{method:'POST',body:fileIn.files[0],headers:{'Content-Type':'application/pdf'}});
      if(!res.ok)toast('PDF non sauvegardé : '+((await res.json().catch(()=>({}))).error||'erreur'),'warning');
      else{ const updated=await res.json(); saved={...saved,...updated}; }
    }
    facturesData=dbGet('factures');
    closeModal('modal-facture');toast('Facture enregistrée','success');loadFactures();
  }catch(e){toast(e.message||'Erreur','error');}
}

/* --- Tiers ------------------------------------------------------------ */
let tiersData=[];
function loadTiers(){
  tiersData=dbGet('tiers');
  const clients=tiersData.filter(t=>t.type==='client');
  const factures=dbGet('factures');
  const payees=factures.filter(f=>f.statut==='payee');
  const caParNom={};
  payees.forEach(f=>{caParNom[f.client]=(caParNom[f.client]||0)+(f.montant||0);});
  const caTotal=clients.reduce((s,t)=>s+(caParNom[t.nom]||0),0);
  const top=clients.reduce((best,t)=>(caParNom[t.nom]||0)>(caParNom[best?.nom]||0)?t:best,null);
  if(q('#tiers-kpi-clients'))q('#tiers-kpi-clients').textContent=clients.length;
  if(q('#tiers-kpi-ca'))q('#tiers-kpi-ca').textContent=fmt(caTotal);
  if(q('#tiers-kpi-top'))q('#tiers-kpi-top').textContent=top?.nom||'—';
  renderTiers();
}
function renderTiers(){
  const search=q('#tiers-search')?.value.toLowerCase()||'';
  const type=q('#tiers-filter-type')?.value||'';
  const factures=dbGet('factures');
  const payees=factures.filter(f=>f.statut==='payee');
  let list=[...tiersData];
  if(search)list=list.filter(t=>((t.nom||'')+(t.email||'')+(t.notes||'')).toLowerCase().includes(search));
  if(type)list=list.filter(t=>t.type===type);
  // Trier par CA décroissant pour les clients
  const caParNom={};payees.forEach(f=>{caParNom[f.client]=(caParNom[f.client]||0)+(f.montant||0);});
  list.sort((a,b)=>(caParNom[b.nom]||0)-(caParNom[a.nom]||0)||(a.nom||'').localeCompare(b.nom||''));
  const tbody=q('#tiers-tbody');
  if(!tbody)return;
  const typeLabel={client:'Client',fournisseur:'Fournisseur',prestataire:'Prestataire'};
  const typeBadge={client:'payee',fournisseur:'attente',prestataire:'retard'};
  tbody.innerHTML=list.length?list.map(t=>{
    const facs=factures.filter(f=>f.client===t.nom);
    const ca=payees.filter(f=>f.client===t.nom).reduce((s,f)=>s+(f.montant||0),0);
    const derniere=facs.sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
    return\`<tr>
      <td><strong>\${t.nom}</strong></td>
      <td><span class="badge badge-\${typeBadge[t.type]||'attente'}">\${typeLabel[t.type]||t.type}</span></td>
      <td class="td-muted">\${t.email||'—'}</td>
      <td class="td-amount">\${ca>0?fmt(ca):'—'}</td>
      <td style="text-align:center;">\${facs.length||'—'}</td>
      <td>\${derniere?fmtDate(derniere.date):'—'}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-xs" onclick="editTiers('\${t.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="deleteTiers('\${t.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>\`;
  }).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">Aucun tiers enregistré</td></tr>';
}
function openModalTiers(data={}){
  q('#modal-tiers-title').textContent=data.id?'Modifier le tiers':'Nouveau tiers';
  q('#ti-nom').value=data.nom||'';q('#ti-type').value=data.type||'client';
  q('#ti-email').value=data.email||'';q('#ti-siret').value=data.siret||'';
  q('#ti-adresse').value=data.adresse||'';q('#ti-notes').value=data.notes||'';
  q('#btn-save-tiers').dataset.id=data.id||'';
  openModal('modal-tiers');
}
async function saveModalTiers(){
  const id=q('#btn-save-tiers').dataset.id;
  const body={nom:q('#ti-nom').value.trim(),type:q('#ti-type').value,
    email:q('#ti-email').value.trim(),siret:q('#ti-siret').value.trim(),
    adresse:q('#ti-adresse').value.trim(),notes:q('#ti-notes').value.trim()};
  if(!body.nom){toast('Nom requis','error');return;}
  try{
    if(id){body.id=id;await dbUpdate('tiers',body);}else{await dbCreate('tiers',body);}
    tiersData=dbGet('tiers');
    closeModal('modal-tiers');toast('Tiers enregistré','success');
    loadTiers();refreshTiersDatalist();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editTiers(id){const t=tiersData.find(x=>x.id===id);if(t)openModalTiers(t);}
function deleteTiers(id){
  confirmDialog('Supprimer ce tiers','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{
      await dbDelete('tiers',id);tiersData=dbGet('tiers');
      toast('Tiers supprimé');loadTiers();refreshTiersDatalist();
    }catch(e){toast(e.message||'Erreur','error');}
  });
}
/* ─── CRM PROSPECTION ──────────────────────────────────────────────── */
let _prospectsCache=[];

const CRM_STATUTS={
  contact:{label:'Premier contact',color:'#E4F0FF',cls:'attente'},
  en_attente:{label:'En attente',color:'#a5502e',cls:'retard'},
  positif:{label:'Positif',color:'#456039',cls:'payee'},
  negatif:{label:'Négatif',color:'#8d2b21',cls:'annule'},
  proposition:{label:'Proposition',color:'#C5DEFF',cls:'brouillon'},
  converti:{label:'Converti',color:'#456039',cls:'payee'},
  sans_suite:{label:'Sans suite',color:'#6b533b',cls:'annule'},
};

const CRM_PROBA={contact:15,en_attente:25,positif:55,proposition:65,converti:100,negatif:0,sans_suite:0};
const CRM_OPEN=['contact','en_attente','positif','proposition'];
const CRM_COLS=[{id:'contact',lab:'À contacter'},{id:'en_attente',lab:'Relancé / en attente'},{id:'positif',lab:'Intéressé'},{id:'proposition',lab:'Devis envoyé'},{id:'converti',lab:'Gagné'},{id:'perdu',lab:'Perdu'}];
function openProspectById(id){const p=_prospectsCache.find(x=>x.id===id);if(p)openProspectModal(p);}

async function loadCrm(){
  try{const res=await api('GET','/api/prospects');_prospectsCache=Array.isArray(res)?res:[];}catch(e){_prospectsCache=[];}
  try{crmPipeline();}catch(e){}
  try{crmKpis();}catch(e){}
  try{crmToday();}catch(e){}
  try{crmObjectif();}catch(e){}
  try{crmKanban();}catch(e){}
  try{crmRelations();}catch(e){}
  const btnNew=q('#btn-new-prospect'); if(btnNew)btnNew.onclick=()=>openProspectModal();
  const btnSave=q('#btn-save-prospect'); if(btnSave)btnSave.onclick=saveProspectModal;
  const searchEl=q('#crm-search'); if(searchEl)searchEl.oninput=()=>{try{crmKanban();}catch(e){}};
  try{refreshCrmSecteurFilter();}catch(e){}
}

function crmPipeline(){
  const el=q('#crm-pipeline'); if(!el)return;
  const ps=_prospectsCache;
  const open=ps.filter(p=>CRM_OPEN.includes(p.statut));
  const caPot=open.reduce((s,p)=>s+(parseFloat(p.valeur)||0),0);
  const todayStr=today();
  const relances=ps.filter(p=>!['negatif','converti','sans_suite'].includes(p.statut)&&((p.relance1&&!p.dateRelance1&&p.relance1<=todayStr)||(p.relance2&&!p.dateRelance2&&p.relance2<=todayStr)||(p.relanceFinale&&!p.dateRelanceFinale&&p.relanceFinale<=todayStr))).length;
  const devis=ps.filter(p=>p.statut==='proposition').length;
  const cell=(lab,val)=>\`<div><div style="font-size:12px;opacity:.6;">\${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;">\${val}</div></div>\`;
  el.innerHTML=\`<div style="background:var(--navy);border-radius:18px;padding:26px 30px;color:#fff;display:flex;gap:38px;flex-wrap:wrap;align-items:center;">
    <div style="min-width:150px;"><div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-target"></i> Mon pipeline</div><div style="font-family:'Cormorant Garamond',serif;font-size:39px;font-weight:700;">\${open.length} prospect\${open.length>1?'s':''} actif\${open.length>1?'s':''}</div></div>
    \${cell('CA potentiel',fmt(caPot))}
    \${cell('Relances à faire',relances)}
    \${cell('Devis en cours',devis)}
  </div>\`;
}

function crmKpis(){
  const el=q('#crm-kpis'); if(!el)return;
  const open=_prospectsCache.filter(p=>CRM_OPEN.includes(p.statut));
  const caPot=open.reduce((s,p)=>s+(parseFloat(p.valeur)||0),0);
  const caAtt=open.reduce((s,p)=>s+(parseFloat(p.valeur)||0)*(CRM_PROBA[p.statut]||0)/100,0);
  const proba=caPot>0?Math.round(caAtt/caPot*100):0;
  const k=(lab,val,hint)=>\`<div class="card" style="padding:18px;"><div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);">\${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;color:var(--navy);">\${val}</div>\${hint?\`<div style="font-size:11.5px;color:var(--text-2);">\${hint}</div>\`:''}</div>\`;
  el.innerHTML=\`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;">
    \${k('CA potentiel',fmt(caPot))}
    \${k('Opportunités',open.length)}
    \${k('Proba de signature',proba+'%','pondérée par étape')}
    \${k('CA attendu',fmt(Math.round(caAtt)),'potentiel × probabilité')}
  </div>\`;
}

function crmToday(){
  const el=q('#crm-today'); if(!el)return;
  const todayStr=today();
  const items=[];
  _prospectsCache.forEach(p=>{
    if(['negatif','converti','sans_suite'].includes(p.statut))return;
    const nom=escHtml(p.nom||'Prospect')+(p.entreprise?' · '+escHtml(p.entreprise):'');
    if(p.relance1&&!p.dateRelance1&&p.relance1<=todayStr)items.push({txt:'<i class="ti ti-mail"></i> Relancer '+nom,sub:'relance prévue le '+fmtDate(p.relance1),id:p.id});
    else if(p.relance2&&!p.dateRelance2&&p.relance2<=todayStr)items.push({txt:'<i class="ti ti-phone"></i> Recontacter '+nom,sub:'2e relance',id:p.id});
    else if(p.relanceFinale&&!p.dateRelanceFinale&&p.relanceFinale<=todayStr)items.push({txt:'<i class="ti ti-file"></i> Dernière relance '+nom,sub:'relance finale',id:p.id});
  });
  el.innerHTML=\`<div class="card" style="padding:22px;height:100%;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:12px;"><i class="ti ti-clipboard-list"></i> À faire aujourd'hui</div>
    \${items.length?\`<div style="display:flex;flex-direction:column;gap:2px;">\${items.slice(0,6).map(it=>\`<div onclick="openProspectById('\${it.id}')" style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 4px;border-bottom:1px solid var(--border);cursor:pointer;" onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='none'"><span style="font-size:14.5px;">\${it.txt}<div style="font-size:12px;color:var(--text-2);">\${it.sub}</div></span><span style="color:var(--navy);">→</span></div>\`).join('')}</div>\`:\`<div style="font-size:14px;color:#456039;padding:6px 0;"><i class="ti ti-confetti"></i> Aucune relance urgente aujourd'hui.</div>\`}
  </div>\`;
}

function crmObjectif(){
  const el=q('#crm-objectif'); if(!el)return;
  let d={}; try{d=computeIntel();}catch(e){}
  const settings=dbGetObj('settings');
  const objCA=parseFloat(settings.objectifCA)||0;
  if(objCA<=0){el.innerHTML=\`<div class="card" style="padding:22px;height:100%;"><div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-target"></i> Objectif CA</div><div style="font-size:14px;color:var(--text-2);">Définis un objectif de CA (dans Objectifs) pour que Finance te dise combien signer.</div></div>\`;return;}
  const now=new Date(); const rem=Math.max(0,12-(now.getMonth()+1));
  const manque=Math.max(0,objCA-(d.caYTD||0)-(d.recMensuel||0)*rem);
  if(manque<=0){el.innerHTML=\`<div class="card" style="padding:22px;height:100%;"><div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-target"></i> Objectif CA</div><div style="font-size:15px;color:#456039;font-weight:600;margin-top:6px;"><i class="ti ti-confetti"></i> Ton objectif annuel est déjà sécurisé.</div></div>\`;return;}
  const opt=n=>\`<div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;border-bottom:1px solid var(--border);"><span>\${n} mission\${n>1?'s':''}</span><span style="font-family:'Cormorant Garamond',serif;">\${fmt(Math.round(manque/n))} chacune</span></div>\`;
  el.innerHTML=\`<div class="card" style="padding:22px;height:100%;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-target"></i> Objectif CA</div>
    <div style="font-size:14px;color:var(--text-2);">Il te manque</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:37px;font-weight:700;color:var(--navy);">\${fmt(manque)}</div>
    <div style="font-size:13.5px;color:var(--text-2);margin:10px 0 2px;">Finance estime qu'il te faudrait signer :</div>
    \${opt(1)}\${opt(2)}\${opt(5)}
  </div>\`;
}

function crmKanban(){
  const el=q('#crm-kanban'); if(!el)return;
  const search=(q('#crm-search')&&q('#crm-search').value||'').toLowerCase();
  const colOf=p=>['negatif','sans_suite'].includes(p.statut)?'perdu':p.statut;
  const list=_prospectsCache.filter(p=>!search||((p.nom||'')+(p.entreprise||'')).toLowerCase().includes(search));
  el.innerHTML=\`<div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:12px;"><i class="ti ti-folders"></i> Pipeline commercial</div>
  <div style="display:grid;grid-template-columns:repeat(\${CRM_COLS.length},minmax(180px,1fr));gap:12px;overflow-x:auto;padding-bottom:4px;">
  \${CRM_COLS.map(c=>{
    const items=list.filter(p=>colOf(p)===c.id);
    return \`<div style="background:var(--surface-2);border-radius:12px;padding:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;"><span style="font-size:12.5px;font-weight:700;color:var(--navy);">\${c.lab}</span><span style="font-size:12px;color:var(--text-2);">\${items.length}</span></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        \${items.map(p=>\`<div onclick="openProspectById('\${p.id}')" class="card" style="padding:11px;cursor:pointer;">
          <div style="font-size:13.5px;font-weight:600;color:var(--navy);">\${escHtml(p.nom||'—')}</div>
          \${p.entreprise?\`<div style="font-size:12px;color:var(--text-2);">\${escHtml(p.entreprise)}</div>\`:''}
          \${(parseFloat(p.valeur)||0)>0?\`<div style="font-family:'Cormorant Garamond',serif;font-size:17px;color:var(--navy);margin-top:4px;">\${fmt(parseFloat(p.valeur)||0)}</div>\`:''}
        </div>\`).join('')||'<div style="font-size:12px;color:var(--text-2);opacity:.55;padding:4px 0;">—</div>'}
      </div>
    </div>\`;
  }).join('')}
  </div>\`;
}

function crmRelations(){
  const el=q('#crm-relations'); if(!el)return;
  const projets=dbGet('projets')||[]; const factures=dbGet('factures')||[];
  const byClient={};
  const ensure=c=>{byClient[c]=byClient[c]||{missions:0,ca:0,last:''};return byClient[c];};
  projets.forEach(p=>{if(p.client)ensure(p.client).missions++;});
  factures.forEach(f=>{if(!f.client)return;const o=ensure(f.client);if(f.statut==='payee')o.ca+=(f.montant||0);const dt=f.datePaiement||f.date||'';if(dt>o.last)o.last=dt;});
  const arr=Object.keys(byClient).map(nom=>({nom,...byClient[nom]}));
  if(!arr.length){el.innerHTML='';return;}
  const fideles=arr.slice().sort((a,b)=>b.ca-a.ca).slice(0,3);
  const todayStr=today();
  const moisDepuis=ds=>ds?Math.round((new Date(todayStr)-new Date(ds))/(86400000*30.44)):null;
  const inactifs=arr.filter(c=>c.last&&moisDepuis(c.last)>=5).sort((a,b)=>(a.last||'').localeCompare(b.last||'')).slice(0,3);
  el.innerHTML=\`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;">
    <div class="card" style="padding:22px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:12px;"><i class="ti ti-heart"></i> Clients fidèles</div>
      \${fideles.map(c=>\`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);"><span style="font-size:14px;font-weight:500;">\${escHtml(c.nom)}<div style="font-size:12px;color:var(--text-2);">\${c.missions} mission\${c.missions>1?'s':''}</div></span><span style="font-family:'Cormorant Garamond',serif;">\${fmt(c.ca)}</span></div>\`).join('')||'<div style="font-size:13px;color:var(--text-2);">—</div>'}
    </div>
    <div class="card" style="padding:22px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:12px;"><i class="ti ti-alert-triangle"></i> Clients à réactiver</div>
      \${inactifs.length?inactifs.map(c=>\`<div style="padding:8px 0;border-bottom:1px solid var(--border);"><div style="font-size:14px;font-weight:500;">\${escHtml(c.nom)}</div><div style="font-size:12px;color:var(--text-2);">Dernière mission il y a \${moisDepuis(c.last)} mois — pourquoi ne pas reprendre contact ?</div></div>\`).join(''):'<div style="font-size:13px;color:#456039;">Tous tes clients sont actifs <i class="ti ti-thumb-up"></i></div>'}
    </div>
  </div>\`;
}

function renderCrmKpis(){
  const p=_prospectsCache;
  const total=p.length;
  const repondus=p.filter(x=>['positif','negatif','proposition','converti','sans_suite'].includes(x.statut)).length;
  const convertis=p.filter(x=>x.statut==='converti').length;
  const attente=p.filter(x=>['contact','en_attente','proposition'].includes(x.statut)).length;
  const tauxRep=total>0?Math.round(repondus/total*100):0;
  const tauxConv=total>0?Math.round(convertis/total*100):0;
  if(q('#crm-kpi-total'))q('#crm-kpi-total').textContent=total;
  if(q('#crm-kpi-reponse'))q('#crm-kpi-reponse').textContent=total?tauxRep+'%':'—';
  if(q('#crm-kpi-conversion'))q('#crm-kpi-conversion').textContent=total?tauxConv+'%':'—';
  if(q('#crm-kpi-attente'))q('#crm-kpi-attente').textContent=attente;
}

function renderCrmBanner(){
  const todayStr=today();
  const aRelancer=_prospectsCache.filter(p=>{
    if(['negatif','converti','sans_suite'].includes(p.statut))return false;
    const r1=p.relance1&&!p.dateRelance1&&p.relance1<=todayStr;
    const r2=p.relance2&&!p.dateRelance2&&p.relance2<=todayStr;
    const rf=p.relanceFinale&&!p.dateRelanceFinale&&p.relanceFinale<=todayStr;
    return r1||r2||rf;
  });
  const banner=q('#crm-relances-banner');
  const bannerTxt=q('#crm-relances-banner-text');
  if(!banner||!bannerTxt)return;
  if(aRelancer.length>0){
    const noms=aRelancer.slice(0,3).map(p=>p.nom+(p.entreprise?" ("+p.entreprise+")":"")).join(", ");
    bannerTxt.innerHTML="<strong>"+aRelancer.length+" relance(s) à effectuer</strong> : "+noms+(aRelancer.length>3?" et "+(aRelancer.length-3)+" autres":"");
    banner.style.display='';
  }else{
    banner.style.display='none';
  }
}

function renderCrmCharts(){
  const statutCanvas=q('#crm-chart-statuts');
  const secteurCanvas=q('#crm-chart-secteurs');
  if(statutCanvas){
    const counts={};
    _prospectsCache.forEach(p=>{counts[p.statut]=(counts[p.statut]||0)+1;});
    const labels=Object.keys(counts).map(k=>CRM_STATUTS[k]?.label||k);
    const vals=Object.values(counts);
    const colors=Object.keys(counts).map(k=>CRM_STATUTS[k]?.color||'#ccc');
    _drawDonutChart(statutCanvas,labels,vals,colors);
  }
  if(secteurCanvas){
    const counts={};
    _prospectsCache.forEach(p=>{const s=p.secteur||"Non précisé";counts[s]=(counts[s]||0)+1;});
    const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const labels=sorted.map(x=>x[0]);
    const vals=sorted.map(x=>x[1]);
    const colors=PALETTE;
    _drawBarChartCRM(secteurCanvas,labels,vals,colors);
  }
}

function _drawDonutChart(canvas,labels,vals,colors){
  const {ctx,W,H}=setupCanvas(canvas);
  if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  const total=vals.reduce((s,v)=>s+v,0);
  if(total===0){ctx.fillStyle='#c8b29a';ctx.font="14px Inter Tight";ctx.textAlign="center";ctx.fillText("Aucune donnée",W/2,H/2);return;}
  drawDonutChart(canvas,labels,vals,colors);
}

function _drawBarChartCRM(canvas,labels,vals,colors){
  const {ctx,W,H}=setupCanvas(canvas);
  if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  if(vals.length===0){ctx.fillStyle='#c8b29a';ctx.font="14px Inter Tight";ctx.textAlign="center";ctx.fillText("Aucune donnée",W/2,H/2);return;}
  const maxV=Math.max(...vals)||1;
  const pad={l:10,r:10,t:10,b:50};
  const bw=Math.max(16,Math.floor((W-pad.l-pad.r)/labels.length*0.6));
  const gap=Math.floor((W-pad.l-pad.r)/labels.length);
  const chartH=H-pad.t-pad.b;
  labels.forEach((label,i)=>{
    const x=pad.l+i*gap+gap/2-bw/2;
    const bh=Math.round(vals[i]/maxV*chartH);
    const y=pad.t+chartH-bh;
    ctx.fillStyle=colors[i%colors.length];
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,4);ctx.fill();
    ctx.fillStyle='#110704';ctx.font="bold 12px Inter Tight";ctx.textAlign="center";
    ctx.fillText(vals[i],x+bw/2,y-4);
    ctx.fillStyle='#6b533b';ctx.font="11px Inter Tight";
    const short=label.length>10?label.slice(0,9)+"…":label;
    ctx.fillText(short,x+bw/2,H-pad.b+14);
  });
}

function renderCrmTable(){
  const search=(q('#crm-search')?.value||'').toLowerCase();
  const filtStatut=q('#crm-filter-statut')?.value||'';
  const filtSecteur=q('#crm-filter-secteur')?.value||'';
  const todayStr=today();
  let list=[..._prospectsCache];
  if(search)list=list.filter(p=>((p.nom||'')+(p.entreprise||'')+(p.secteur||'')+(p.email||'')+(p.notes||'')).toLowerCase().includes(search));
  if(filtStatut)list=list.filter(p=>p.statut===filtStatut);
  if(filtSecteur)list=list.filter(p=>(p.secteur||'')=== filtSecteur);
  list.sort((a,b)=>(b.dateContact||'').localeCompare(a.dateContact||''));
  const tbody=q('#crm-tbody');
  if(!tbody)return;
  function relanceCell(prevue,faite){
    if(faite)return"<span style='color:var(--success);font-size:13px;'>"+fmtDate(faite)+"<br><small>faite</small></span>";
    if(!prevue)return"<span style='color:var(--text-2);'>—</span>";
    const en_retard=prevue<=todayStr&&!faite;
    const style=en_retard?"color:var(--danger);font-weight:600;":"";
    return"<span style='font-size:13px;"+style+"'>"+fmtDate(prevue)+(en_retard?"<br><small>En retard</small>":"")+"</span>";
  }
  tbody.innerHTML=list.length?list.map(p=>{
    const st=CRM_STATUTS[p.statut]||{label:p.statut,cls:'attente'};
    return\`<tr>
      <td><strong>\${p.nom}</strong>\${p.email?"<br><small style='color:var(--text-2);'>"+p.email+"</small>":""}</td>
      <td>\${p.entreprise||"—"}</td>
      <td><span style="font-size:13px;">\${p.secteur||"—"}</span></td>
      <td>\${p.dateContact?fmtDate(p.dateContact):"—"}\${p.telephone?"<br><small style='color:var(--text-2);'>"+p.telephone+"</small>":""}</td>
      <td><span class="badge badge-\${st.cls}">\${st.label}</span></td>
      <td>\${relanceCell(p.relance1,p.dateRelance1)}</td>
      <td>\${relanceCell(p.relance2,p.dateRelance2)}</td>
      <td>\${relanceCell(p.relanceFinale,p.dateRelanceFinale)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-xs" onclick="editProspect('\${p.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="deleteProspect('\${p.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>\`;
  }).join(''):'<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-2);">Aucun prospect — ajoutez votre premier contact.</td></tr>';
}

function refreshCrmSecteurFilter(){
  const sel=q('#crm-filter-secteur');
  if(!sel)return;
  const secteurs=[...new Set(_prospectsCache.map(p=>p.secteur||'').filter(Boolean))].sort();
  const cur=sel.value;
  sel.innerHTML='<option value="">Tous secteurs</option>'+secteurs.map(s=>\`<option value="\${s}">\${s}</option>\`).join('');
  sel.value=cur;
  const dl=q('#crm-secteur-list');
  if(dl)dl.innerHTML=secteurs.map(s=>\`<option value="\${s}">\`).join('');
}

function openProspectModal(data={}){
  q('#modal-prospect-title').textContent=data.id?"Modifier le prospect":"Nouveau prospect";
  q('#prospect-id').value=data.id||'';
  q('#prospect-nom').value=data.nom||'';
  q('#prospect-entreprise').value=data.entreprise||'';
  q('#prospect-secteur').value=data.secteur||'';
  q('#prospect-email').value=data.email||'';
  q('#prospect-telephone').value=data.telephone||'';
  q('#prospect-siteweb').value=data.siteWeb||'';
  q('#prospect-statut').value=data.statut||'contact';
  q('#prospect-valeur').value=data.valeur!=null&&data.valeur!==0?data.valeur:'';
  const dc=data.dateContact||today();
  q('#prospect-datecontact').value=dc;
  // Auto-calcul relances si nouveau
  const addDays=(d,n)=>{const dt=new Date(d);dt.setDate(dt.getDate()+n);return dt.toISOString().slice(0,10);};
  q('#prospect-relance1').value=data.relance1||(data.id?'':addDays(dc,7));
  q('#prospect-relance2').value=data.relance2||(data.id?'':addDays(dc,21));
  q('#prospect-relancefinale').value=data.relanceFinale||(data.id?'':addDays(dc,45));
  q('#prospect-daterelance1').value=data.dateRelance1||'';
  q('#prospect-daterelance2').value=data.dateRelance2||'';
  q('#prospect-daterelancefinale').value=data.dateRelanceFinale||'';
  q('#prospect-notes').value=data.notes||'';
  // Recalcul relances si date contact change
  const dcInput=q('#prospect-datecontact');
  dcInput.onchange=()=>{
    const nd=dcInput.value;
    if(!nd)return;
    const addD=(d,n)=>{const dt=new Date(d);dt.setDate(dt.getDate()+n);return dt.toISOString().slice(0,10);};
    if(!q('#prospect-relance1').value)q('#prospect-relance1').value=addD(nd,7);
    if(!q('#prospect-relance2').value)q('#prospect-relance2').value=addD(nd,21);
    if(!q('#prospect-relancefinale').value)q('#prospect-relancefinale').value=addD(nd,45);
  };
  openModal('modal-prospect');
}

async function saveProspectModal(){
  const id=q('#prospect-id').value;
  const body={
    nom:q('#prospect-nom').value.trim(),
    entreprise:q('#prospect-entreprise').value.trim(),
    secteur:q('#prospect-secteur').value.trim(),
    email:q('#prospect-email').value.trim(),
    telephone:q('#prospect-telephone').value.trim(),
    siteWeb:q('#prospect-siteweb').value.trim(),
    statut:q('#prospect-statut').value,
    valeur:parseFloat(q('#prospect-valeur').value)||0,
    dateContact:q('#prospect-datecontact').value,
    relance1:q('#prospect-relance1').value,
    relance2:q('#prospect-relance2').value,
    relanceFinale:q('#prospect-relancefinale').value,
    dateRelance1:q('#prospect-daterelance1').value,
    dateRelance2:q('#prospect-daterelance2').value,
    dateRelanceFinale:q('#prospect-daterelancefinale').value,
    notes:q('#prospect-notes').value.trim(),
  };
  if(!body.nom){toast('Nom requis','error');return;}
  try{
    if(id){
      body.id=id;
      const res=await api('PUT',\`/api/prospects/\${id}\`,body);
      const idx=_prospectsCache.findIndex(p=>p.id===id);
      if(idx>=0)_prospectsCache[idx]=res;else _prospectsCache.push(res);
    }else{
      const res=await api('POST','/api/prospects',body);
      _prospectsCache.push(res);
    }
    closeModal('modal-prospect');
    toast('Prospect enregistré','success');
    renderCrmKpis();renderCrmBanner();renderCrmCharts();renderCrmTable();refreshCrmSecteurFilter();
  }catch(e){toast(e.message||'Erreur','error');}
}

function editProspect(id){const p=_prospectsCache.find(x=>x.id===id);if(p)openProspectModal(p);}
function deleteProspect(id){
  confirmDialog('Supprimer ce prospect','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{
      await api('DELETE',\`/api/prospects/\${id}\`);
      _prospectsCache=_prospectsCache.filter(p=>p.id!==id);
      toast('Prospect supprimé','success');
      renderCrmKpis();renderCrmBanner();renderCrmCharts();renderCrmTable();refreshCrmSecteurFilter();
    }catch(e){toast(e.message||'Erreur','error');}
  });
}

function refreshTiersDatalist(){
  const sel=q('#f-client');if(!sel||sel.tagName!=='SELECT')return;
  const tiers=dbGet('tiers').sort((a,b)=>a.nom.localeCompare(b.nom));
  const cur=sel.value;
  sel.innerHTML=\`<option value="">— Sélectionner un client —</option>\`+tiers.map(t=>\`<option value="\${t.nom}">\${t.nom}</option>\`).join('');
  if(cur)sel.value=cur;
}
function refreshProjetsSelect(filterClient=''){
  const sel=q('#f-projet-id');if(!sel)return;
  let projets=dbGet('projets');
  if(filterClient)projets=projets.filter(p=>!p.client||p.client===filterClient);
  projets=projets.sort((a,b)=>a.nom.localeCompare(b.nom));
  const cur=sel.value;
  sel.innerHTML=\`<option value="">— Aucun projet —</option>\`+projets.map(p=>\`<option value="\${p.id}">\${p.nom}\${!filterClient&&p.client?' · '+p.client:''}</option>\`).join('');
  if(cur)sel.value=cur;
}

/* --- Projets ---------------------------------------------------------- */
/* --- Devis ------------------------------------------------------------ */
function highlightDevis(id){
  const tbody=q('#devis-tbody');if(!tbody)return;
  const rows=[...tbody.querySelectorAll('tr')];
  const all=dbGet('devis');
  const idx=all.findIndex(x=>x.id===id);
  if(idx<0)return;
  const row=rows[idx];
  if(!row)return;
  row.scrollIntoView({behavior:'smooth',block:'center'});
  row.style.transition='background .2s';
  row.style.background='#e8f5ee';
  setTimeout(()=>{row.style.background='';},1800);
}
function loadDevis(){renderDevis();}
function renderDevis(){
  const search=q('#devis-search')?.value.toLowerCase()||'';
  const statut=q('#devis-filter-statut')?.value||'';
  const annee=q('#devis-filter-annee')?.value||'';
  const mois=q('#devis-filter-mois')?.value||'';
  let list=[...dbGet('devis')];
  // KPIs: filtered by year+month only (not statut/search)
  let kpiBase=[...list];
  if(annee)kpiBase=kpiBase.filter(d=>(d.date||'').startsWith(annee));
  if(mois)kpiBase=kpiBase.filter(d=>(d.date||'').slice(5,7)===mois);
  const signes=kpiBase.filter(d=>d.statut==='signe');
  const envoyes=kpiBase.filter(d=>d.statut==='envoye');
  const total=kpiBase.filter(d=>d.statut!=='refuse').length;
  const taux=total>0?Math.round(signes.length/total*100):0;
  const caSign=signes.reduce((s,d)=>s+(d.montant||0),0);
  if(q('#dv-kpi-signes'))q('#dv-kpi-signes').textContent=signes.length;
  if(q('#dv-kpi-envoyes'))q('#dv-kpi-envoyes').textContent=envoyes.length;
  if(q('#dv-kpi-ca'))q('#dv-kpi-ca').textContent=fmt(caSign);
  if(q('#dv-kpi-taux'))q('#dv-kpi-taux').textContent=taux+'%';
  if(q('#dv-kpi-ca-label'))q('#dv-kpi-ca-label').textContent=annee?('CA signé '+annee):'CA signé total';
  if(search)list=list.filter(d=>((d.numero||'')+(d.client||'')+(d.description||'')).toLowerCase().includes(search));
  if(statut)list=list.filter(d=>d.statut===statut);
  if(annee)list=list.filter(d=>(d.date||'').startsWith(annee));
  if(mois)list=list.filter(d=>(d.date||'').slice(5,7)===mois);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  // Mise à jour filtre années
  const selAnnee=q('#devis-filter-annee');
  if(selAnnee){
    const all=dbGet('devis');
    const annees=[...new Set(all.map(d=>(d.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
    const curA=selAnnee.value;
    selAnnee.innerHTML=\`<option value="">Toutes années</option>\`+annees.map(a=>\`<option value="\${a}" \${a===curA?'selected':''}>\${a}</option>\`).join('');
  }
  const tbody=q('#devis-tbody');if(!tbody)return;
  const sttBadge={brouillon:'attente',envoye:'attente',signe:'payee',refuse:'retard'};
  const sttLabel={brouillon:'Brouillon',envoye:'Envoyé',signe:'Signé',refuse:'Refusé'};
  const today=new Date().toISOString().slice(0,10);
  tbody.innerHTML=list.length?list.map(d=>{
    const expire=d.dateExpiration&&d.dateExpiration<today&&d.statut==='envoye';
    return\`<tr>
      <td>\${fmtDate(d.date)}</td>
      <td class="td-mono">\${d.numero||'—'}</td>
      <td>\${d.client||'—'}</td>
      <td class="td-muted">\${d.description||'—'}</td>
      <td class="td-amount">\${fmt(d.montant||0)}</td>
      <td>\${d.dateExpiration?fmtDate(d.dateExpiration)+(expire?' <span style="color:var(--danger);font-size:12px;">expiré</span>':''):'<span style="color:var(--text-2);">—</span>'}</td>
      <td><span class="badge badge-\${sttBadge[d.statut]||'attente'}">\${sttLabel[d.statut]||d.statut}</span></td>
      <td style="white-space:nowrap;">
        \${d.pdfKey?\`<button class="btn btn-sm" style="background:#C5DEFF;color:#2c4a72;border:none;gap:4px;" title="Voir PDF" onclick="previewDevisPDF('\${d.id}','\${d.numero}')"><i class="ti ti-file-filled"></i> PDF</button>\`:\`<span style="font-size:12px;color:var(--text-2);padding:2px 6px;">—</span>\`}
        \${d.statut==='signe'?\`<button class="btn btn-sm" style="background:#e8f5ee;color:#456039;border:1px solid #456039;" title="Créer un projet depuis ce devis" onclick="creerProjetDepuisDevis('\${d.id}')"><i class="ti ti-folder-plus"></i></button>\`:''}
        <button class="btn btn-ghost btn-xs" onclick="editDevis('\${d.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="deleteDevis('\${d.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>\`;
  }).join(''):'<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--text-2);">Aucun devis</td></tr>';
}
function openDevisModal(data={}){
  q('#modal-devis-title').textContent=data.id?'Modifier le devis':'Nouveau devis';
  q('#dv-numero').value=data.numero||prochNumDevis();
  q('#dv-statut').value=data.statut||'brouillon';
  const sel=q('#dv-client');
  const tiers=dbGet('tiers').sort((a,b)=>a.nom.localeCompare(b.nom));
  sel.innerHTML=\`<option value="">— Sélectionner un client —</option>\`+tiers.map(t=>\`<option value="\${t.nom}">\${t.nom}</option>\`).join('');
  sel.value=data.client||'';
  q('#dv-description').value=data.description||'';
  q('#dv-date').value=data.date||today();
  q('#dv-date-expiration').value=data.dateExpiration||'';
  if(!data.id&&!data.dateExpiration)onDevisDateChange();
  q('#dv-montant').value=data.montant||'';
  q('#dv-notes').value=data.notes||'';
  q('#btn-save-devis').dataset.id=data.id||'';
  const btn=q('#dv-pdf-btn'),nameEl=q('#dv-pdf-name'),fileIn=q('#dv-pdf-file');
  if(btn&&nameEl&&fileIn){
    fileIn.value='';
    if(data.pdfKey){btn.className='pdf-btn present';btn.innerHTML=\`<i class="ti ti-file-filled"></i> PDF attaché\`;nameEl.innerHTML=\`<a href="/api/devis/\${data.id}/pdf" target="_blank" style="color:var(--blue);">Voir le PDF</a>\`;}
    else{btn.className='pdf-btn vide';btn.innerHTML='<i class="ti ti-paperclip"></i> Attacher un PDF';nameEl.textContent='';}
  }
  openModal('modal-devis');
}
function prochNumDevis(){
  const list=dbGet('devis');
  const nums=list.map(d=>parseInt((d.numero||'').split('-')[1])||0).filter(n=>!isNaN(n));
  return\`D\${new Date().getFullYear()}-\${String((nums.length?Math.max(...nums):0)+1).padStart(3,'0')}\`;
}
async function saveDevis(){
  const id=q('#btn-save-devis').dataset.id;
  const body={numero:q('#dv-numero').value.trim(),statut:q('#dv-statut').value,
    client:q('#dv-client').value.trim(),description:q('#dv-description').value.trim(),
    date:q('#dv-date').value,dateExpiration:q('#dv-date-expiration').value||null,
    montant:parseFloat(q('#dv-montant').value)||0,notes:q('#dv-notes').value.trim()};
  if(!body.client||!body.montant){toast('Client et montant requis','error');return;}
  try{
    let saved;
    if(id){body.id=id;saved=await dbUpdate('devis',body);}else{saved=await dbCreate('devis',body);}
    const fileIn=q('#dv-pdf-file');
    if(fileIn?.files?.length){
      const res=await fetch(\`/api/devis/\${saved?.id||id}/pdf\`,{method:'POST',body:fileIn.files[0],headers:{'Content-Type':'application/pdf'}});
      if(!res.ok)toast('PDF non sauvegardé','warning');
      else{const updated=await res.json();saved={...saved,...updated};}
    }
    closeModal('modal-devis');toast('Devis enregistré','success');loadDevis();refreshDevisSelect();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editDevis(id){const d=dbGet('devis').find(x=>x.id===id);if(d)openDevisModal(d);}
function deleteDevis(id){
  confirmDialog('Supprimer ce devis','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('devis',id);toast('Devis supprimé');loadDevis();refreshDevisSelect();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}
function previewDevisPDF(id,numero){
  const url=\`/api/devis/\${id}/pdf\`;
  const frame=q('#modal-pdf-frame'),title=q('#modal-pdf-title'),dl=q('#modal-pdf-download');
  if(frame)frame.src=url;
  if(title)title.textContent=\`Devis \${numero}\`;
  if(dl){dl.href=url;dl.download=\`\${numero}.pdf\`;}
  openModal('modal-pdf-preview');
}
function creerProjetDepuisDevis(devisId){
  const d=dbGet('devis').find(x=>x.id===devisId);if(!d)return;
  openProjetModal({client:d.client,montantTotal:d.montant,devisId:d.id,nom:d.description||d.client});
  toast('Projet pré-rempli depuis le devis '+d.numero,'info');
}
function refreshDevisSelect(){
  const sel=q('#pr-devis-id');if(!sel)return;
  const devisData=dbGet('devis').filter(d=>d.statut==='signe').sort((a,b)=>b.date.localeCompare(a.date));
  const cur=sel.value;
  sel.innerHTML=\`<option value="">— Aucun devis lié —</option>\`+devisData.map(d=>\`<option value="\${d.id}">\${d.numero} · \${d.client} · \${fmt(d.montant)}</option>\`).join('');
  if(cur)sel.value=cur;
}

function loadProjets(){
  const projets=dbGet('projets');
  const factures=dbGet('factures');
  const now=new Date();
  const enCours=projets.filter(p=>p.statut==='en_cours');
  const termines=projets.filter(p=>p.statut==='termine');
  const totalContrat=enCours.reduce((s,p)=>s+(p.montantTotal||0),0);
  let totalFacture=0, attente=0, aEmettre=0;
  projets.forEach(p=>{const linked=factures.filter(f=>f.projetId===p.id);totalFacture+=linked.reduce((s,f)=>s+(f.montant||0),0);});
  factures.forEach(f=>{if(f.statut!=='payee'&&f.projetId)attente+=(f.montant||0);});
  const ymNow=now.toISOString().slice(0,7);
  enCours.forEach(p=>{
    const linked=factures.filter(f=>f.projetId===p.id);
    if(p.type==='mensuel'){
      if(p.dureeIndeterminee){ if(!linked.some(f=>(f.date||'').slice(0,7)===ymNow))aEmettre+=1; }
      else if(p.nombreMois){ aEmettre+=Math.max(0,p.nombreMois-linked.length); }
    }else{
      const facd=linked.reduce((s,f)=>s+(f.montant||0),0);
      if((p.montantTotal||0)-facd>0.5)aEmettre+=1;
    }
  });
  const totalReste=Math.max(0,totalContrat-totalFacture);
  const pctSecu=totalContrat>0?Math.round(totalFacture/totalContrat*100):0;
  if(q('#proj-kpi-actifs'))q('#proj-kpi-actifs').textContent=fmt(totalFacture);
  if(q('#proj-kpi-contrat'))q('#proj-kpi-contrat').textContent=fmt(totalReste);
  if(q('#proj-kpi-facture'))q('#proj-kpi-facture').textContent=aEmettre;
  if(q('#proj-kpi-reste'))q('#proj-kpi-reste').textContent=fmt(attente);
  if(q('#proj-portefeuille'))q('#proj-portefeuille').textContent=projets.length+' projets · '+enCours.length+' actifs · '+termines.length+' terminés'+(totalContrat>0?' · '+pctSecu+'% du CA contractualisé déjà facturé':'');
  renderProjetsForecast();
  renderProjets();
}
function renderProjetsForecast(){
  const el=q('#proj-forecast'); if(!el)return;
  const projets=dbGet('projets').filter(p=>p.statut==='en_cours');
  const factures=dbGet('factures');
  const now=new Date();
  const months=[];
  for(let k=0;k<4;k++){const dt=new Date(now.getFullYear(),now.getMonth()+k,1);months.push({y:dt.getFullYear(),m:dt.getMonth(),label:MOIS_COURT[dt.getMonth()]+' '+dt.getFullYear(),total:0});}
  let recMens=0;
  projets.forEach(p=>{
    if(p.type==='mensuel'){
      const mensuel=p.dureeIndeterminee?(p.montantTotal||0):((p.montantTotal||0)/Math.max(1,p.nombreMois||1));
      if(p.dureeIndeterminee)recMens+=mensuel;
      months.forEach(mo=>{
        let actif=true;
        if(!p.dureeIndeterminee&&p.dateDebut){const start=new Date(p.dateDebut+'T00:00:00');const idx=(mo.y-start.getFullYear())*12+(mo.m-start.getMonth());actif=idx>=0&&idx<(p.nombreMois||0);}
        if(actif)mo.total+=mensuel;
      });
    }else{
      const linked=factures.filter(f=>f.projetId===p.id);
      const facd=linked.reduce((s,f)=>s+(f.montant||0),0);
      const reste=Math.max(0,(p.montantTotal||0)-facd);
      if(reste>0)months[0].total+=reste;
    }
  });
  const max=Math.max(1,months[0].total,months[1].total,months[2].total,months[3].total);
  el.innerHTML=\`<div class="card" style="padding:22px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
      <span style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);"><i class="ti ti-calendar"></i> Revenus attendus · prochains mois</span>
      \${recMens>0?\`<span style="font-size:13px;color:var(--text-2);"><i class="ti ti-repeat"></i> Récurrent sécurisé : <strong style="color:#456039;">\${fmt(recMens)} / mois</strong></span>\`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(\${months.length},1fr);gap:14px;align-items:end;">
      \${months.map(mo=>\`<div style="text-align:center;">
        <div style="font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;color:var(--navy);">\${fmt(Math.round(mo.total))}</div>
        <div style="height:\${Math.round(mo.total/max*90)+4}px;background:var(--navy);border-radius:6px 6px 0 0;margin:8px auto 6px;width:56%;opacity:.85;"></div>
        <div style="font-size:12px;color:var(--text-2);">\${mo.label}</div>
      </div>\`).join('')}
    </div>
    <div style="font-size:12.5px;color:var(--text-2);margin-top:14px;">Basé sur tes projets mensuels et le reste à facturer. Un mois creux = le bon moment pour prospecter.</div>
  </div>\`;
}

function renderProjets(){
  const search=q('#projets-search')?.value.toLowerCase()||'';
  const statut=q('#projets-filter-statut')?.value||'';
  const client=q('#projets-filter-client')?.value||'';
  const annee=q('#projets-filter-annee')?.value||'';
  const mois=q('#projets-filter-mois')?.value||'';
  const factures=dbGet('factures');
  const transactions=dbGet('transactions');
  const txProjet=dbGetObj('settings').txProjet||{};
  let list=[...dbGet('projets')];
  if(search)list=list.filter(p=>((p.nom||'')+(p.client||'')).toLowerCase().includes(search));
  if(statut)list=list.filter(p=>p.statut===statut);
  if(client)list=list.filter(p=>p.client===client);
  if(annee)list=list.filter(p=>(p.dateDebut||'').startsWith(annee));
  if(mois)list=list.filter(p=>(p.dateDebut||'').slice(5,7)===mois);
  list.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  // Mise à jour filtre années
  const selAnnee=q('#projets-filter-annee');
  if(selAnnee){
    const all=dbGet('projets');
    const annees=[...new Set(all.map(p=>(p.dateDebut||'').slice(0,4)).filter(Boolean))].sort().reverse();
    const curA=selAnnee.value;
    selAnnee.innerHTML=\`<option value="">Toutes années</option>\`+annees.map(a=>\`<option value="\${a}" \${a===curA?'selected':''}>\${a}</option>\`).join('');
  }
  // Mise à jour filtre clients
  const selClient=q('#projets-filter-client');
  if(selClient){
    const all=dbGet('projets');
    const clients=[...new Set(all.map(p=>p.client).filter(Boolean))].sort();
    const curC=selClient.value;
    selClient.innerHTML=\`<option value="">Tous clients</option>\`+clients.map(c=>\`<option value="\${c}" \${c===curC?'selected':''}>\${c}</option>\`).join('');
  }
  const container=q('#projets-list');if(!container)return;
  if(!list.length){
    container.innerHTML='<div class="card" style="text-align:center;padding:32px;color:var(--text-2);">Aucun projet. Crée ton premier projet pour suivre ta facturation.</div>';
    return;
  }
  const typeLabel={unique:'Unique',echelonne:'Échelonné',mensuel:'Mensuel'};
  const typeIcon={unique:'ti-file-invoice',echelonne:'ti-stairs',mensuel:'ti-calendar-repeat'};
  const sttBadge={en_cours:'payee',termine:'attente',pause:'retard'};
  const sttLabel={en_cours:'En cours',termine:'Terminé',pause:'En pause'};
  const typeFacLabel={standard:'Standard',acompte:'Acompte',intermediaire:'Intermédiaire',solde:'Solde',mensuel:'Mensuel'};
  const statIcon={payee:'<i class="ti ti-circle-check"></i>',attente:'⏳',retard:'<i class="ti ti-alert-circle"></i>'};
  function facRow(f,extra=''){
    const badge=f.typeFacture&&f.typeFacture!=='standard'?\`<span style="font-size:11px;background:#ece3d4;padding:1px 5px;border-radius:4px;margin-left:4px;">\${typeFacLabel[f.typeFacture]||f.typeFacture}</span>\`:'';
    return\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #ece3d4;">
      <span>\${statIcon[f.statut]||'⏳'}</span>
      <span style="font-size:13px;color:#6b533b;min-width:80px;">\${fmtDate(f.date)}</span>
      <span style="font-size:13px;flex:1;">\${f.numero||'—'}\${badge}</span>
      <span style="font-size:13px;font-weight:500;">\${fmt(f.montant||0)}</span>
      <span class="badge badge-\${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}" style="font-size:11px;">\${f.statut==='payee'?'Payée':f.statut==='retard'?'Retard':'Attente'}</span>
      \${extra}
    </div>\`;
  }
  function emptyRow(label,montant){
    return\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #ece3d4;opacity:0.6;">
      <span><i class="ti ti-clipboard-list"></i></span>
      <span style="font-size:13px;color:#6b533b;min-width:80px;">\${label}</span>
      <span style="font-size:13px;flex:1;font-style:italic;">À émettre</span>
      \${montant?'<span style="font-size:13px;font-weight:500;">'+fmt(montant)+'</span>':''}
      <span></span>
    </div>\`;
  }
  container.innerHTML=list.map(p=>{
    const linked=factures.filter(f=>f.projetId===p.id);
    const montantFacture=linked.reduce((s,f)=>s+(f.montant||0),0);
    const pct=p.montantTotal>0?Math.min(100,Math.round(montantFacture/p.montantTotal*100)):0;
    const reste=Math.max(0,(p.montantTotal||0)-montantFacture);
    // Sous-traitance rattachée à ce projet (transactions Qonto liées) → marge
    const stLiee=transactions.filter(t=>t.type==='debit'&&txProjet[t.qontoId||t.id]===p.id).reduce((s,t)=>s+(t.montant||0),0);
    const marge=montantFacture-stLiee;
    let facsHtml='';
    if(p.type==='mensuel'&&p.dureeIndeterminee){
      // Durée indéterminée : on affiche toutes les factures liées + 1 slot vide pour le prochain mois
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      const mm=p.montantTotal||0;
      facsHtml+=emptyRow('Prochain mois',mm);
    }else if(p.type==='mensuel'&&p.nombreMois&&p.dateDebut){
      const montantMensuel=Math.round((p.montantTotal||0)/p.nombreMois*100)/100;
      for(let i=0;i<p.nombreMois;i++){
        const slotDate=new Date(p.dateDebut+'T00:00:00');
        slotDate.setMonth(slotDate.getMonth()+i);
        const slotYM=slotDate.toISOString().slice(0,7);
        const slotFacs=linked.filter(f=>(f.date||'').slice(0,7)===slotYM);
        const dateLabel=MOIS_COURT[slotDate.getMonth()]+' '+slotDate.getFullYear();
        if(slotFacs.length===0){
          facsHtml+=emptyRow(dateLabel,montantMensuel);
        }else if(slotFacs.length===1){
          facsHtml+=facRow(slotFacs[0]);
        }else{
          // Doublon détecté
          facsHtml+=\`<div style="background:#FFF3CD;border-radius:4px;padding:4px 8px;margin:2px 0;font-size:12px;color:#a5502e;"><i class="ti ti-alert-triangle"></i> <i class="ti ti-alert-triangle"></i> \${slotFacs.length} factures sur \${dateLabel} — doublon probable</div>\`;
          slotFacs.forEach(f=>facsHtml+=facRow(f));
        }
      }
      // Factures hors-calendrier (date ne correspond à aucun slot)
      linked.forEach(f=>{
        const ym=(f.date||'').slice(0,7);
        let inSlot=false;
        for(let i=0;i<p.nombreMois;i++){
          const sd=new Date(p.dateDebut+'T00:00:00');
          sd.setMonth(sd.getMonth()+i);
          if(sd.toISOString().slice(0,7)===ym){inSlot=true;break;}
        }
        if(!inSlot)facsHtml+=facRow(f);
      });
    }else if(p.type==='mensuel'&&p.nombreMois){
      // Pas de dateDebut : affichage séquentiel
      const mm=Math.round((p.montantTotal||0)/p.nombreMois*100)/100;
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      const restantMois=Math.max(0,p.nombreMois-sorted.length);
      for(let i=0;i<restantMois;i++)facsHtml+=emptyRow('—',mm);
    }else if(p.type==='echelonne'){
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      const hasAcompte=linked.some(f=>f.typeFacture==='acompte');
      const hasSolde=linked.some(f=>f.typeFacture==='solde');
      if(!hasAcompte)facsHtml+=\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #ece3d4;opacity:0.6;"><span><i class="ti ti-clipboard-list"></i></span><span style="font-size:11px;background:#ece3d4;padding:1px 5px;border-radius:4px;">Acompte</span><span style="font-size:13px;flex:1;font-style:italic;">À émettre</span><span></span></div>\`;
      if(!hasSolde)facsHtml+=\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #ece3d4;opacity:0.6;"><span><i class="ti ti-clipboard-list"></i></span><span style="font-size:11px;background:#ece3d4;padding:1px 5px;border-radius:4px;">Solde</span><span style="font-size:13px;flex:1;font-style:italic;">À émettre</span><span></span></div>\`;
    }else{
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      if(!sorted.length)facsHtml=emptyRow('—',p.montantTotal);
    }
    return\`<div class="card mb-16" style="padding:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #ece3d4;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="kpi-icon blue" style="width:36px;height:36px;font-size:16px;flex-shrink:0;"><i class="ti \${typeIcon[p.type]||'ti-folder'}"></i></div>
          <div>
            <div style="font-weight:600;font-size:15px;">\${p.nom}</div>
            <div style="font-size:13px;color:#6b533b;">\${p.client||'—'} · \${typeLabel[p.type]||p.type}\${p.type==='mensuel'?(p.dureeIndeterminee?' · indéterminé':' · '+p.nombreMois+' mois'):''}\${p.devisId?(' · <span style="color:#456039;"><i class="ti ti-file"></i> '+((dbGet("devis").find(x=>x.id===p.devisId))||{}).numero+'</span>'):''}
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="badge badge-\${sttBadge[p.statut]||'attente'}">\${sttLabel[p.statut]||p.statut}</span>
          <button class="btn btn-ghost btn-xs" onclick="editProjet('\${p.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-ghost btn-xs" onclick="deleteProjet('\${p.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div style="padding:16px 20px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#6b533b;margin-bottom:6px;">
          <span>\${fmt(montantFacture)} facturé</span>
          <span style="font-weight:500;">\${fmt(p.montantTotal||0)} total · <span style="color:\${reste>0?'var(--warning)':'var(--success)'};">\${reste>0?fmt(reste)+' restant':'<i class="ti ti-check"></i> Complet'}</span></span>
        </div>
        <div style="background:#ece3d4;border-radius:4px;height:8px;overflow:hidden;margin-bottom:\${facsHtml?16:4}px;">
          <div style="background:\${pct>=100?'var(--success)':'#E4F0FF'};height:100%;width:\${pct}%;border-radius:4px;"></div>
        </div>
        \${stLiee>0?\`<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-bottom:\${facsHtml?16:4}px;">
          <span style="color:var(--text-2);">\${fmt(montantFacture)} facturé <span style="color:#2AA9A0;">− \${fmt(stLiee)} sous-traitance</span></span>
          <span style="font-weight:700;color:\${marge>=0?'var(--success)':'var(--danger)'};">Marge \${fmt(marge)}</span>
        </div>\`:''}
        \${facsHtml?'<div>'+facsHtml+'</div>':''}
        \${p.notes?'<div style="margin-top:10px;font-size:13px;color:#6b533b;font-style:italic;">'+p.notes+'</div>':''}
      </div>
    </div>\`;
  }).join('');
}
function openProjetModal(data={}){
  q('#modal-projet-title').textContent=data.id?'Modifier le projet':'Nouveau projet';
  refreshDevisSelect();
  q('#pr-devis-id').value=data.devisId||'';
  q('#pr-nom').value=data.nom||'';
  const sel=q('#pr-client');
  const tiers=dbGet('tiers').sort((a,b)=>a.nom.localeCompare(b.nom));
  sel.innerHTML=\`<option value="">— Sélectionner —</option>\`+tiers.map(t=>\`<option value="\${t.nom}">\${t.nom}</option>\`).join('');
  sel.value=data.client||'';
  q('#pr-statut').value=data.statut||'en_cours';
  q('#pr-type').value=data.type||'unique';
  q('#pr-indetermine').checked=!!(data.dureeIndeterminee);
  q('#pr-nb-mois').value=data.nombreMois||6;
  q('#pr-montant').value=data.montantTotal||'';
  q('#pr-date-debut').value=data.dateDebut||'';
  q('#pr-date-fin').value=data.dateFin||'';
  q('#pr-notes').value=data.notes||'';
  q('#btn-save-projet').dataset.id=data.id||'';
  onProjetTypeChange();
  openModal('modal-projet');
}
function onProjetDevisChange(){
  const devisId=q('#pr-devis-id')?.value;
  if(!devisId)return;
  const d=dbGet('devis').find(x=>x.id===devisId);
  if(!d)return;
  if(d.client&&!q('#pr-client').value)q('#pr-client').value=d.client;
  if(d.montant)q('#pr-montant').value=d.montant;
  if(d.description&&!q('#pr-nom').value)q('#pr-nom').value=d.description;
  onProjetMontantChange();
}
function onProjetTypeChange(){
  const type=q('#pr-type')?.value;
  const nbG=q('#pr-nb-mois-group'),mmG=q('#pr-montant-mois-group');
  if(nbG)nbG.style.display=type==='mensuel'?'':'none';
  if(mmG)mmG.style.display=type==='mensuel'?'':'none';
  onProjetIndetermineChange();
  onProjetMontantChange();
}
function onProjetIndetermineChange(){
  const indet=q('#pr-indetermine')?.checked;
  const nbInput=q('#pr-nb-mois');
  const finEl=q('#pr-date-fin');
  if(nbInput)nbInput.disabled=!!indet;
  if(indet&&finEl)finEl.value='';
  onProjetMontantChange();
}
function onProjetMontantChange(){
  const type=q('#pr-type')?.value;
  const indet=q('#pr-indetermine')?.checked;
  const montant=parseFloat(q('#pr-montant')?.value)||0;
  const nbMois=parseInt(q('#pr-nb-mois')?.value)||1;
  const moisEl=q('#pr-montant-mois');
  if(moisEl)moisEl.value=type==='mensuel'&&montant&&(indet||nbMois)?
    (indet?fmt(montant)+'/mois':fmt(montant/nbMois)+'/mois'):'—';
  // Auto-calcul date de fin pour projet mensuel (sauf durée indéterminée)
  if(type==='mensuel'&&!indet){
    const debut=q('#pr-date-debut')?.value;
    const finEl=q('#pr-date-fin');
    if(debut&&finEl&&nbMois){
      const d=new Date(debut+'T00:00:00');
      d.setMonth(d.getMonth()+nbMois);
      d.setDate(d.getDate()-1);
      finEl.value=d.toISOString().slice(0,10);
    }
  }
}
async function saveProjet(){
  const id=q('#btn-save-projet').dataset.id;
  const type=q('#pr-type').value;
  const indet=type==='mensuel'&&!!(q('#pr-indetermine')?.checked);
  const body={nom:q('#pr-nom').value.trim(),client:q('#pr-client').value,type,statut:q('#pr-statut').value,
    montantTotal:parseFloat(q('#pr-montant').value)||0,
    nombreMois:type==='mensuel'&&!indet?parseInt(q('#pr-nb-mois').value)||1:null,
    dureeIndeterminee:indet||false,
    devisId:q('#pr-devis-id').value||null,
    dateDebut:q('#pr-date-debut').value||null,dateFin:q('#pr-date-fin').value||null,
    notes:q('#pr-notes').value.trim()};
  if(!body.nom){toast('Nom du projet requis','error');return;}
  if(!body.montantTotal){toast('Montant requis','error');return;}
  if(body.statut==='termine'&&id){
    const facsPending=dbGet('factures').filter(f=>f.projetId===id&&f.statut!=='payee');
    if(facsPending.length){
      toast('Ce projet a '+facsPending.length+' facture'+(facsPending.length>1?'s':'')+' non payée'+(facsPending.length>1?'s':'')+' — il ne peut pas être terminé.','error');
      return;
    }
  }
  try{
    if(id){body.id=id;await dbUpdate('projets',body);}else{await dbCreate('projets',body);}
    closeModal('modal-projet');toast('Projet enregistré','success');
    loadProjets();refreshProjetsSelect();
  }catch(e){toast(e.message||'Erreur','error');}
}
function editProjet(id){const p=dbGet('projets').find(x=>x.id===id);if(p)openProjetModal(p);}
function deleteProjet(id){
  confirmDialog('Supprimer ce projet','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('projets',id);toast('Projet supprimé');loadProjets();refreshProjetsSelect();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

function editFacture(id){const f=facturesData.find(x=>x.id===id);if(f)openFactureModal(f);}
function previewPDF(id,numero){
  const url=\`/api/factures/\${id}/pdf\`;
  const frame=q('#modal-pdf-frame'),title=q('#modal-pdf-title'),dl=q('#modal-pdf-download');
  if(frame)frame.src=url;
  if(title)title.textContent=\`Facture \${numero}\`;
  if(dl){dl.href=url;dl.download=\`\${numero}.pdf\`;}
  openModal('modal-pdf-preview');
}
function deleteFacture(id){
  confirmDialog('Supprimer la facture','Cette action est irréversible.').then(async ok=>{
    if(!ok)return;
    try{await dbDelete('factures',id);facturesData=dbGet('factures');toast('Facture supprimée');loadFactures();}
    catch(e){toast(e.message||'Erreur','error');}
  });
}

/* --- Dépenses --------------------------------------------------------- */
let depensesData=[];
function loadDepenses(){
  depensesData=dbGet('depenses');
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=\`\${y}-\${String(m).padStart(2,'0')}\`;
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
  const caMois=MOIS_COURT.map((_,mi)=>{const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;return depensesData.filter(d=>(d.date||'').startsWith(k)).reduce((s,d)=>s+(d.montant||0),0);});
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
  tbody.innerHTML=list.length?list.map(d=>\`<tr>
    <td>\${fmtDate(d.date)}</td>
    <td>\${d.description||d.libelle||'—'}</td>
    <td><span class="badge badge-neutral">\${d.categorie||'—'}</span></td>
    <td class="td-amount">\${fmt(d.montant||0)}</td>
    <td>
      <button class="btn btn-ghost btn-xs" onclick="editDepense('\${d.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteDepense('\${d.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>\`).join(''):'<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-2);">Aucune dépense</td></tr>';
}
function onDepenseTypeChange(type){
  const isMens=type==='mensuel';
  q('#d-zone-ponctuel').style.display=isMens?'none':'';
  q('#d-zone-mensuel').style.display=isMens?'':'none';
  q('#d-type-ponctuel').className='btn btn-sm '+(isMens?'btn-secondary':'btn-primary');
  q('#d-type-mensuel').className='btn btn-sm '+(isMens?'btn-primary':'btn-secondary');
  q('#d-montant-label').textContent=isMens?'Montant mensuel (€) *':'Montant (€) *';
  q('#btn-save-depense').dataset.type=type;
}
function openDepenseModal(data={}){
  q('#modal-depense-title').textContent=data.id?'Modifier la dépense':'Nouvelle dépense';
  onDepenseTypeChange('ponctuel');
  q('#d-date').value=data.date||today();
  q('#d-date-debut').value=data.date||today();
  q('#d-date-fin').value=data.date||today();
  q('#d-categorie').value=data.categorie||'Logiciels & abonnements';
  q('#d-description').value=data.description||data.libelle||'';
  q('#d-montant').value=data.montant||'';
  q('#btn-save-depense').dataset.id=data.id||'';
  openModal('modal-depense');
}
async function saveDepense(){
  const id=q('#btn-save-depense').dataset.id;
  const type=q('#btn-save-depense').dataset.type||'ponctuel';
  const categorie=q('#d-categorie').value;
  const description=q('#d-description').value.trim();
  const montant=parseFloat(q('#d-montant').value)||0;
  if(!description){toast('Description requise','error');return;}
  if(!montant){toast('Montant requis','error');return;}
  try{
    if(type==='mensuel'&&!id){
      // Créer une entrée par mois
      const debut=new Date(q('#d-date-debut').value+'T00:00:00');
      const fin=new Date(q('#d-date-fin').value+'T00:00:00');
      if(fin<debut){toast('La date de fin doit être après le début','error');return;}
      let created=0;
      const cur=new Date(debut);
      while(cur<=fin){
        const dateStr=cur.toISOString().slice(0,7)+'-01';
        await dbCreate('depenses',{date:dateStr,categorie,description,montant});
        cur.setMonth(cur.getMonth()+1);
        created++;
      }
      depensesData=dbGet('depenses');
      closeModal('modal-depense');toast(created+' dépenses créées','success');loadDepenses();
    }else{
      const body={date:q('#d-date').value,categorie,description,montant};
      if(id){body.id=id;await dbUpdate('depenses',body);}else{await dbCreate('depenses',body);}
      depensesData=dbGet('depenses');
      closeModal('modal-depense');toast('Dépense enregistrée','success');loadDepenses();
    }
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
  if(q('#abo-kpi-prochain'))q('#abo-kpi-prochain').textContent=next?\`\${next.joursAvant} j\`:'—';
  if(next&&q('#abo-kpi-prochain-sub'))q('#abo-kpi-prochain-sub').textContent=next.nom;
  renderAbonnements();
  drawAboTimeline();
}
function renderAbonnements(){
  const tbody=q('#abonnements-tbody');
  if(!tbody)return;
  tbody.innerHTML=aboData.length?aboData.map(a=>\`<tr>
    <td style="font-weight:500;">\${a.nom}</td>
    <td><span class="badge badge-neutral">\${a.categorie||'—'}</span></td>
    <td class="td-amount">\${fmt(a.montant||0)}</td>
    <td class="td-amount" style="color:var(--text-2);">\${fmt((a.montant||0)*12)}</td>
    <td>Jour \${a.jour||'—'}</td>
    <td><span class="badge badge-\${a.statut==='actif'?'actif':a.statut==='pause'?'pause':'annule'}">\${a.statut==='actif'?'Actif':a.statut==='pause'?'Pausé':'Annulé'}</span></td>
    <td>
      <button class="btn btn-ghost btn-xs" onclick="editAbonnement('\${a.id}')"><i class="ti ti-edit"></i></button>
      <button class="btn btn-ghost btn-xs" onclick="deleteAbonnement('\${a.id}')"><i class="ti ti-trash"></i></button>
    </td>
  </tr>\`).join(''):'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-2);">Aucun abonnement</td></tr>';
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
  ctx.fillStyle=COLORS.text2;ctx.font='10px Inter Tight,sans-serif';ctx.textAlign='center';
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
    ctx.fillStyle='#fff';ctx.font='bold 8px Inter Tight,sans-serif';ctx.textAlign='center';
    ctx.fillText(a.nom.slice(0,2).toUpperCase(),x,trackY+3);
    ctx.fillStyle=COLORS.text2;ctx.font='9px Inter Tight,sans-serif';
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
  const mKey=\`\${y}-\${String(m).padStart(2,'0')}\`;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40;
  const cfe=(settings.cfe||0)/12;

  // Calendrier URSSAF trimestriel réel micro-BNC
  // Déclaration du CA du trimestre précédent, échéance fin du mois suivant
  const moisQ={T1:[1,2,3],T2:[4,5,6],T3:[7,8,9],T4:[10,11,12]};
  // Vraies dates d'exigibilité URSSAF (micro, mensuel ou trimestriel)
  const echeances={
    T1:'2026-04-30',  // T1 2026 → exigible 30/04/2026
    T2:'2026-07-31',  // T2 2026 → exigible 31/07/2026
    T3:'2026-11-02',  // T3 2026 → exigible 02/11/2026
    T4:'2027-02-01',  // T4 2026 → exigible 01/02/2027
  };
  const labelsQ={T1:'T1 (jan–mar)',T2:'T2 (avr–jun)',T3:'T3 (jul–sep)',T4:'T4 (oct–déc)'};
  const quarters=['T1','T2','T3','T4'];
  // Dates d'ouverture de saisie (dès ce jour on peut déclarer)
  const saisieOuverture={T1:'2026-04-01',T2:'2026-07-01',T3:'2026-10-01',T4:'2027-01-01'};

  const grid=q('#urssaf-cards-grid');
  if(grid){
    grid.innerHTML=quarters.map(t=>{
      const cle=t+'-'+y;
      const d=urssafObj[cle]||{};
      const moisTrim=moisQ[t];
      // URSSAF micro-BNC : base = encaissements (date de paiement reçu, pas d'émission)
      const caT=moisTrim.reduce((s,mi)=>{
        const k=y+'-'+String(mi).padStart(2,'0');
        return s+factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(k)).reduce((ss,f)=>ss+(f.montant||0),0);
      },0);
      const urssafDue=Math.round(caT*tauxU*100)/100;
      const cfpDue   =Math.round(caT*tauxC*100)/100;
      const total    =urssafDue+cfpDue;
      const ech=echeances[t];
      const echDate=new Date(ech+'T23:59:00');
      const ouvertDate=new Date(saisieOuverture[t]+'T00:00:00');
      const jours=Math.ceil((echDate-now)/86400000);
      const isOuvert=now>=ouvertDate;
      const statut=d.statut==='paye'?'paye':jours<0?'echu':isOuvert?'a_payer':'a_venir';
      const pct=total>0?Math.min(100,Math.round((d.montantPaye||0)/total*100)):0;
      let countdown='';
      if(statut==='paye') countdown='<span style="color:var(--success);">Payé le '+fmtDate(d.datePaye)+' — '+fmt(d.montantPaye||0)+'</span>';
      else if(statut==='echu') countdown='<span class="urssaf-countdown rouge">Échu depuis '+Math.abs(jours)+' j</span>';
      else countdown='<span class="urssaf-countdown '+(jours<=30?'rouge':jours<=60?'orange':'')+'">Échéance dans '+jours+' j'+(isOuvert?' · Saisie ouverte':'')+'</span>';
      return '<div class="urssaf-card '+(jours<=30&&statut!=='paye'?'alerte-rouge':jours<=60&&statut!=='paye'?'alerte-orange':'')+'">'+
        '<div class="urssaf-header">'+
          '<div><div class="urssaf-titre">'+labelsQ[t]+' '+y+'</div><div class="urssaf-echeance">Échéance '+fmtDate(ech)+(isOuvert&&statut!=='paye'?' · Saisie ouverte sur net-entreprises.fr':'')+'</div></div>'+
          '<span class="badge badge-'+(statut==='paye'?'paye':statut==='a_payer'?'a-payer':statut==='echu'?'retard':'a-venir')+'">'+(statut==='paye'?'Payé':statut==='a_payer'?'À déclarer':statut==='echu'?'Échu':'À venir')+'</span>'+
        '</div>'+
        '<div class="urssaf-montant">'+fmt(total)+'</div>'+
        '<div class="urssaf-detail">CA encaissé '+fmt(caT)+' · URSSAF '+fmt(urssafDue)+' · CFP '+fmt(cfpDue)+'</div>'+
        countdown+
        '<div class="progress-bar" style="margin:8px 0;"><div class="fill '+(pct>=100?'green':'')+'" style="width:'+pct+'%"></div></div>'+
        (statut!=='paye'?'<button class="btn btn-sm btn-secondary" style="margin-top:8px;" data-cle="'+cle+'" onclick="openURSSAFPaiement(this.dataset.cle)"><i class="ti ti-check"></i> Marquer payé</button>':'')+
      '</div>';
    }).join('');
  }

  // Charges mensuelles — base encaissements (datePaiement)
  const caMois=factures.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const urssafM=Math.round(caMois*tauxU*100)/100;
  const cfpM   =Math.round(caMois*tauxC*100)/100;
  const aboM   =abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const depM   =depenses.filter(d=>(d.date||'').startsWith(mKey)).reduce((s,d)=>s+(d.montant||0),0);
  const totalCharges=urssafM+cfpM+pas+cfe+aboM;
  const net=Math.max(0,caMois-totalCharges-depM);

  const rl=q('#charges-recap-list');
  if(rl)rl.innerHTML=\`
    <div class="charges-recap-line"><span class="charges-recap-label">URSSAF provision (\${settings.tauxUrssaf||25.6}%)</span><span class="charges-recap-amount">\${fmt(urssafM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFP provision (\${settings.tauxCfp||0.2}%)</span><span class="charges-recap-amount">\${fmt(cfpM)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">PAS fixe</span><span class="charges-recap-amount">\${fmt(pas)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">CFE mensuelle</span><span class="charges-recap-amount">\${fmt(cfe)}</span></div>
    <div class="charges-recap-line"><span class="charges-recap-label">Abonnements actifs</span><span class="charges-recap-amount">\${fmt(aboM)}</span></div>
    <div class="charges-recap-total"><span class="label">Total charges</span><span class="amount">\${fmt(totalCharges)}</span></div>
    <div style="font-size:13px;color:var(--text-2);margin-top:8px;">Ratio charges/CA : \${caMois>0?Math.round(totalCharges/caMois*100):0}%</div>\`;
  const dm=q('#charges-depenses-mois');
  if(dm)dm.innerHTML=\`
    <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro ce mois</span><span class="charges-recap-amount">\${fmt(depM)}</span></div>
    <div style="font-size:13px;color:var(--text-2);margin-top:8px;"><a style="cursor:pointer;color:var(--navy);" onclick="navigate('depenses')">Voir les dépenses →</a></div>\`;
  if(q('#cru-ca'))q('#cru-ca').textContent=fmt(caMois);
  if(q('#cru-charges'))q('#cru-charges').textContent=fmt(totalCharges+depM);
  if(q('#cru-net'))q('#cru-net').textContent=fmt(net);
  if(q('#cru-versement'))q('#cru-versement').textContent=fmt(net*(settings.pctVersement||65)/100);
}
function openURSSAFPaiement(cle){
  urssafCurrentCle=cle;
  if(q('#modal-urssaf-title'))q('#modal-urssaf-title').textContent=\`Paiement \${cle}\`;
  if(q('#modal-urssaf-detail'))q('#modal-urssaf-detail').textContent='Saisissez le montant réellement payé à l\\'URSSAF.';
  q('#urs-date-paye').value=today();q('#urs-montant-paye').value='';
  openModal('modal-urssaf');
}
async function saveURSSAFPaiement(){
  const montantPaye=parseFloat(q('#urs-montant-paye').value)||0;
  const datePaye=q('#urs-date-paye').value;
  try{
    await api('PUT',\`/api/urssaf/\${urssafCurrentCle}\`,{statut:'paye',montantPaye,datePaye});
    _cache.urssaf = await api('GET','/api/urssaf');
    closeModal('modal-urssaf');toast('Paiement enregistré','success');loadChargesURSSAF();
  }catch(e){toast(e.message||'Erreur','error');}
}

/* --- Objectifs de pilotage (jauges) ----------------------------------- */
function ringGauge(pct,color){
  const p=Math.max(0,Math.min(100,pct||0));
  const r=32,c=2*Math.PI*r,off=c*(1-p/100);
  return \`<svg viewBox="0 0 80 80" style="width:82px;height:82px;">
    <circle cx="40" cy="40" r="\${r}" fill="none" stroke="var(--border)" stroke-width="7"/>
    <circle cx="40" cy="40" r="\${r}" fill="none" stroke="\${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="\${c.toFixed(1)}" stroke-dashoffset="\${off.toFixed(1)}" transform="rotate(-90 40 40)"/>
    <text x="40" y="46" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-size="19" font-weight="600" fill="var(--navy)">\${Math.round(p)}%</text>
  </svg>\`;
}
function renderObjectifsPilotage(){
  const el=q('#objectifs-pilotage'); if(!el)return;
  const s=dbGetObj('settings');
  let d={}; try{d=computeIntel();}catch(e){}
  const objCA=parseFloat(s.objectifCA)||0;
  const objTreso=parseFloat(s.objectifTresorerie)||0;
  const objMois=parseFloat(s.objectifMoisSecu)||3;
  const objRec=parseFloat(s.objectifRecurrent)||0;
  const caYTD=d.caYTD||0, soldeReel=d.soldeReel||0, moisSecu=d.moisSecurite||0, rec=d.recMensuel||0;
  const tiles=[
    {lab:'CA annuel',      color:'#2c4a72',cur:caYTD,   cible:objCA,   txt:objCA>0?fmt(caYTD)+' / '+fmt(objCA):'objectif non défini',                    pct:objCA>0?caYTD/objCA*100:0},
    {lab:'Matelas trésorerie',color:'#456039',cur:soldeReel,cible:objTreso,txt:objTreso>0?fmt(soldeReel)+' / '+fmt(objTreso):'objectif non défini',        pct:objTreso>0?soldeReel/objTreso*100:0},
    {lab:'Mois de sécurité',color:'#a5502e',cur:moisSecu,cible:objMois,txt:moisSecu.toFixed(1)+' / '+objMois+' mois',                                       pct:objMois>0?moisSecu/objMois*100:0},
    {lab:'Revenus récurrents',color:'#7C3AED',cur:rec,   cible:objRec,  txt:objRec>0?fmt(rec)+' / '+fmt(objRec)+'/mois':'objectif non défini',              pct:objRec>0?rec/objRec*100:0},
  ];
  el.innerHTML=\`<div class="card" style="padding:20px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;">
    \${tiles.map(t=>{
      const atteint=t.cible>0&&t.cur>=t.cible;
      return \`<div style="display:flex;align-items:center;gap:14px;">
        <div style="flex:none;">\${ringGauge(t.pct,atteint?'#456039':t.color)}</div>
        <div>
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--text-2);margin-bottom:3px;">\${t.lab}</div>
          <div style="font-size:13.5px;color:var(--text-1);">\${t.txt}</div>
          \${atteint?'<div style="font-size:12px;color:#456039;font-weight:600;margin-top:2px;"><i class="ti ti-circle-check"></i> Atteint</div>':''}
        </div>
      </div>\`;
    }).join('')}
    </div>
  </div>\`;
}
function openObjectifsPilotage(){
  const s=dbGetObj('settings');
  q('#obj-ca').value=s.objectifCA||'';
  q('#obj-treso').value=s.objectifTresorerie||'';
  q('#obj-mois-secu').value=s.objectifMoisSecu!=null?s.objectifMoisSecu:3;
  q('#obj-recurrent').value=s.objectifRecurrent||'';
  q('#modal-objectifs-pilotage').style.display='flex';
}
async function saveObjectifsPilotage(){
  try{
    const settings=dbGetObj('settings');
    const ca=parseFloat(q('#obj-ca').value); if(!isNaN(ca))settings.objectifCA=ca;
    const tr=parseFloat(q('#obj-treso').value); settings.objectifTresorerie=isNaN(tr)?0:tr;
    const ms=parseFloat(q('#obj-mois-secu').value); settings.objectifMoisSecu=isNaN(ms)?3:ms;
    const re=parseFloat(q('#obj-recurrent').value); settings.objectifRecurrent=isNaN(re)?0:re;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-objectifs-pilotage').style.display='none';
    toast('Objectifs enregistrés','success');
    renderObjectifsPilotage();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

/* --- Objectifs épargne ------------------------------------------------ */
let epargneGoals=[];
function loadObjectifsEpargne(){
  try{renderObjectifsPilotage();}catch(e){}
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
    return\`<div class="goal-card">
      <div class="goal-card-header">
        <div class="goal-card-name">\${obj.nom}</div>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="editEpargneGoal('\${obj.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-ghost btn-xs" onclick="deleteEpargneGoal('\${obj.id}')"><i class="ti ti-trash"></i></button>
        </div>
      </div>
      <div class="goal-amounts"><div class="goal-current">\${fmt(actuel)}</div><div class="goal-target">sur \${fmt(cible)}</div></div>
      <div class="goal-bar-wrap"><div class="goal-bar" style="width:\${pct}%"></div></div>
      <div class="goal-pct">\${pct}%</div>
      \${obj.dateCible?\`<div class="goal-date"><i class="ti ti-calendar"></i> Cible \${fmtDate(obj.dateCible)}</div>\`:''}
    </div>\`;
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
  const mKey=\`\${annee}-\${String(mois).padStart(2,'0')}\`;
  const prevM=mois===1?12:mois-1;
  const prevY=mois===1?annee-1:annee;
  const prevKey=\`\${prevY}-\${String(prevM).padStart(2,'0')}\`;

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
  const phrase=\`Ce mois (\${MOIS_LONG[mois-1]} \${annee}), tu as encaissé \${fmt(ca)}, soit \${delta!==null?\`\${delta>=0?'+':''}\${delta}% vs le mois précédent\`:'(premier mois)'}. Ton résultat net est de \${fmt(net)}, tu peux te verser \${fmt(versement)}.\`;

  const container=q('#rapport-mensuel-content');
  if(!container)return;
  container.innerHTML=\`
    <div class="rapport-phrase">\${phrase}</div>
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA encaissé</span><span class="kpi-value">\${fmt(ca)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges</span><span class="kpi-value danger">\${fmt(charges)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">\${fmt(net)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Versement (\${pctVersement}%)</span><span class="kpi-value">\${fmt(versement)}</span></div>
    </div>
    <div class="card">
      <div class="card-title">Détail des charges</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">URSSAF</span><span class="charges-recap-amount">\${fmt(urssaf)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">CFP</span><span class="charges-recap-amount">\${fmt(cfp)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro</span><span class="charges-recap-amount">\${fmt(dep)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Abonnements</span><span class="charges-recap-amount">\${fmt(abo)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">PAS</span><span class="charges-recap-amount">\${fmt(pas)}</span></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px;">
      <div class="card-title">Comparaison mois précédent</div>
      <div style="display:flex;gap:24px;font-size:14.5px;">
        <div>CA : \${fmt(caPrev)}</div>
        <div style="color:\${delta>=0?'var(--success)':'var(--danger)'};">Δ CA : \${delta!==null?(delta>=0?'+':'')+delta+'%':'—'}</div>
      </div>
    </div>\`;
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
    const k=\`\${annee}-\${String(mi+1).padStart(2,'0')}\`;
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
  container.innerHTML=\`
    <div class="kpi-grid kpi-grid-3 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel</span><span class="kpi-value">\${fmt(totCA)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges totales</span><span class="kpi-value danger">\${fmt(totCharges)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">\${fmt(totNet)}</span></div>
    </div>
    \${meilleur&&meilleur.ca>0?\`<div class="alert info" style="margin-bottom:16px;"><i class="ti ti-trophy"></i> Meilleur mois : \${MOIS_LONG[meilleur.mois-1]} · \${fmt(meilleur.ca)}</div>\`:''}
    <div class="card mb-16">
      <div class="card-title">Tableau mensuel</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Mois</th><th>CA</th><th>Charges</th><th>Résultat</th><th>Versement</th></tr></thead>
        <tbody>\${moisData.map(m=>\`<tr>
          <td>\${MOIS_COURT[m.mois-1]}</td>
          <td class="td-amount">\${fmt(m.ca)}</td>
          <td class="td-amount" style="color:var(--danger);">\${fmt(m.charges)}</td>
          <td class="td-amount" style="color:var(--success);">\${fmt(m.net)}</td>
          <td class="td-amount">\${fmt(m.versement)}</td>
        </tr>\`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card"><div class="card-title">Évolution annuelle</div><div class="chart-wrap"><canvas id="chart-ra" height="200"></canvas></div></div>\`;
  setTimeout(()=>{
    const c=q('#chart-ra');
    if(c)drawBarChart(c,MOIS_COURT,[{data:moisData.map(m=>m.ca),color:COLORS.blue},{data:moisData.map(m=>m.charges),color:COLORS.violet}]);
  },50);
}

/* --- Prévision fin d'année --------------------------------------------- */
function loadRapportPrevision(){ renderRapportPrevision(); }

function computePrevision(){
  const factures=dbGet('factures')||[];
  const projets=dbGet('projets')||[];
  const abonnements=dbGet('abonnements')||[];
  const settings=dbGetObj('settings');
  const now=new Date();
  const annee=now.getFullYear();
  const moisCourant=now.getMonth()+1;      // 1..12
  const moisRestants=12-moisCourant;        // mois pleins après le mois courant
  const inY=ds=>((ds||'')+'').startsWith(String(annee));
  const curYM=annee+'-'+String(moisCourant).padStart(2,'0');

  // 1. Déjà encaissé (factures payées de l'année)
  const encaisse=factures.filter(f=>f.statut==='payee'&&inY(f.datePaiement||f.date)).reduce((s,f)=>s+(f.montant||0),0);
  // 2. Déjà facturé, en attente de paiement (émis, pas encore payé)
  const enAttente=factures.filter(f=>f.statut!=='payee'&&inY(f.date)).reduce((s,f)=>s+(f.montant||0),0);

  // 3. Reste à facturer (projets, mois restants de l'année)
  let resteAFacturer=0;
  const detailProjets=[];
  projets.forEach(p=>{
    const linked=factures.filter(f=>f.projetId===p.id);
    let reste=0;
    if(p.type==='mensuel'&&p.dureeIndeterminee){
      const mm=p.montantTotal||0;
      const curDone=linked.some(f=>(f.date||'').slice(0,7)===curYM);
      reste=mm*(moisRestants+(curDone?0:1));
    }else if(p.type==='mensuel'&&p.nombreMois&&p.dateDebut){
      const mm=Math.round((p.montantTotal||0)/p.nombreMois*100)/100;
      for(let i=0;i<p.nombreMois;i++){
        const sd=new Date(p.dateDebut+'T00:00:00'); sd.setMonth(sd.getMonth()+i);
        if(sd.getFullYear()!==annee)continue;
        const ym=sd.toISOString().slice(0,7);
        const done=linked.some(f=>(f.date||'').slice(0,7)===ym);
        const passe=(sd.getMonth()+1)<moisCourant;
        if(!done&&!passe)reste+=mm;
      }
    }else if(p.type==='mensuel'&&p.nombreMois){
      const mm=Math.round((p.montantTotal||0)/p.nombreMois*100)/100;
      const restantMois=Math.max(0,p.nombreMois-linked.length);
      reste=mm*Math.min(restantMois,moisRestants+1);
    }else{
      const facture=linked.reduce((s,f)=>s+(f.montant||0),0);
      reste=Math.max(0,(p.montantTotal||0)-facture);
    }
    if(reste>0){resteAFacturer+=reste;detailProjets.push({nom:p.nom,client:p.client||'',reste});}
  });
  // Revenus récurrents déclarés (facturés chaque mois, sans date de fin) → projetés sur les mois restants
  const revenusRec=(settings.revenusRecurrents||[]);
  let recMensuel=0, recRestant=0;
  revenusRec.forEach(r=>{
    const m=parseFloat(r.montant)||0; recMensuel+=m;
    const rr=Math.round(m*moisRestants*100)/100;
    if(rr>0){recRestant+=rr;detailProjets.push({nom:(r.nom||'Revenu récurrent')+' · '+fmt(m)+'/mois',client:'récurrent',reste:rr});}
  });
  resteAFacturer+=recRestant;
  detailProjets.sort((a,b)=>b.reste-a.reste);

  const caProjete=encaisse+enAttente+resteAFacturer;

  // Charges projetées sur l'année complète
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100;
  const tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const pas=parseFloat(settings.pasFixe)||40;
  const aboMois=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const cotisations=Math.round(caProjete*(tauxU+tauxC)*100)/100;
  const abosAnnee=Math.round(aboMois*12*100)/100;
  const pasAnnee=Math.round(pas*12*100)/100;
  const chargesProjetees=cotisations+abosAnnee+pasAnnee;
  const netProjete=Math.max(0,caProjete-chargesProjetees);

  // Net déjà réalisé (sur l'encaissé) pour montrer « ce qu'il reste à gagner »
  const netEncaisse=Math.max(0,encaisse-Math.round(encaisse*(tauxU+tauxC)*100)/100-Math.round(aboMois*moisCourant*100)/100-pas*moisCourant);
  const resteAGagner=Math.max(0,netProjete-netEncaisse);

  const objectifCA=parseFloat(settings.objectifCA)||0;
  const pctObj=objectifCA>0?Math.round(caProjete/objectifCA*100):null;

  return {annee,moisRestants,encaisse,enAttente,resteAFacturer,caProjete,cotisations,abosAnnee,pasAnnee,chargesProjetees,netProjete,netEncaisse,resteAGagner,objectifCA,pctObj,detailProjets,revenusRec,recMensuel,recRestant};
}

function renderRapportPrevision(){
  const el=q('#rapport-prevision-content'); if(!el)return;
  const P=computePrevision();
  const settings=dbGetObj('settings');
  let perso={besoin:0,confort:0}; try{perso=computePerso();}catch(e){}
  const confort=parseFloat(settings.persoConfort)||parseFloat(settings.persoObjectif)||perso.besoin||0;
  const now=new Date(); const annee=P.annee; const moisCourant=now.getMonth()+1;
  const salaireMois=Math.round(P.netProjete/12);
  const manque=P.objectifCA>0?Math.max(0,P.objectifCA-P.caProjete):0;

  // Frise des mois restants (revenus déjà sécurisés : projets mensuels + récurrents)
  const projets=dbGet('projets')||[];
  const months=[]; for(let mo=moisCourant;mo<=12;mo++)months.push({m:mo,label:MOIS_COURT[mo-1],secure:0});
  projets.filter(p=>p.statut==='en_cours'&&p.type==='mensuel').forEach(p=>{
    const mm=p.dureeIndeterminee?(p.montantTotal||0):((p.montantTotal||0)/Math.max(1,p.nombreMois||1));
    months.forEach(mo=>{let actif=true;if(!p.dureeIndeterminee&&p.dateDebut){const st=new Date(p.dateDebut+'T00:00:00');const idx=(annee-st.getFullYear())*12+(mo.m-1-st.getMonth());actif=idx>=0&&idx<(p.nombreMois||0);}if(actif)mo.secure+=mm;});
  });
  (settings.revenusRecurrents||[]).forEach(r=>{const m=parseFloat(r.montant)||0;months.forEach(mo=>{mo.secure+=m;});});
  const totalSecure=months.reduce((s,mo)=>s+mo.secure,0);
  const maxSec=Math.max(1,...months.map(mo=>mo.secure));
  const trou=months.find(mo=>mo.secure<maxSec*0.35);

  // Patrimoine fin d'année
  const supAll=Array.isArray(settings.persoEpargne)?settings.persoEpargne:[];
  const patriSolde=supAll.reduce((s,e)=>s+(parseFloat(e.solde)||0),0);
  const patriMensuel=supAll.reduce((s,e)=>s+(parseFloat(e.montant)||0),0);
  const patriFin=patriSolde+patriMensuel*(12-moisCourant+1);
  const misAnnee=patriMensuel*12;
  const liberte=perso.besoin>0?(patriFin/perso.besoin):null;

  const big=(emoji,lab,val,hint,color)=>\`<div style="flex:1;min-width:150px;"><div style="font-size:12px;opacity:.6;">\${emoji} \${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:35px;font-weight:700;\${color?'color:'+color+';':''}">\${val}</div>\${hint?\`<div style="font-size:12px;opacity:.6;">\${hint}</div>\`:''}</div>\`;
  const missions=n=>\`<div style="display:flex;justify-content:space-between;font-size:14px;padding:6px 0;border-bottom:1px solid var(--border);"><span>\${n} mission\${n>1?'s':''}</span><span style="font-family:'Cormorant Garamond',serif;">\${fmt(Math.round(manque/n))} chacune</span></div>\`;

  let html='';

  // <i class="ti ti-target"></i> Que dois-je signer ?
  if(P.objectifCA>0&&manque>0){
    html+=\`<div style="background:var(--navy);border-radius:18px;padding:26px 30px;color:#fff;margin-bottom:18px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-target"></i> Que dois-je signer d'ici décembre ?</div>
      <div style="font-size:15px;opacity:.85;margin:6px 0 4px;">Pour atteindre ton objectif, il te faudrait encore sécuriser</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:46px;font-weight:700;">\${fmt(manque)}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px;">
        <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px 14px;"><div style="font-size:23px;font-family:'Cormorant Garamond',serif;">\${Math.max(1,Math.round(manque/4500))} mission(s)</div><div style="font-size:12px;opacity:.6;">à ~4 500 €</div></div>
        <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px 14px;"><div style="font-size:23px;font-family:'Cormorant Garamond',serif;">\${Math.max(1,Math.round(manque/2300))} mission(s)</div><div style="font-size:12px;opacity:.6;">à ~2 300 €</div></div>
        <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:12px 14px;"><div style="font-size:23px;font-family:'Cormorant Garamond',serif;">\${Math.max(1,Math.round(manque/500))} client(s)</div><div style="font-size:12px;opacity:.6;">récurrents à 500 €/mois</div></div>
      </div>
    </div>\`;
  }

  // <i class="ti ti-sparkles"></i> Si rien ne change
  html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:14px;"><i class="ti ti-sparkles"></i> Si rien ne change · fin \${annee}</div>
    <div style="display:flex;gap:24px;flex-wrap:wrap;">
      \${big('<i class="ti ti-coin"></i>','CA estimé',fmt(P.caProjete),P.pctObj!=null?P.pctObj+'% de ton objectif':'objectif non défini','var(--navy)')}
      \${big('<i class="ti ti-receipt"></i>','Disponible après charges & cotisations',fmt(P.netProjete),'ce que l\\'activité dégage — avant versement','var(--navy)')}
      \${big('<i class="ti ti-home"></i>','Versement moyen',fmt(salaireMois)+' /mois',"jusqu'à décembre",'var(--navy)')}
    </div>
    \${manque>0?\`<div style="background:rgba(138,100,20,.12);border-radius:10px;padding:12px 14px;font-size:14.5px;color:#a5502e;margin-top:14px;">Il te manquerait environ <strong>\${fmt(manque)}</strong> pour atteindre ton objectif annuel de \${fmt(P.objectifCA)}.</div>\`:(P.objectifCA>0?\`<div style="background:rgba(62,158,116,.1);border-radius:10px;padding:12px 14px;font-size:14.5px;color:#456039;margin-top:14px;"><i class="ti ti-confetti"></i> À ce rythme, tu atteins ton objectif annuel.</div>\`:'')}
  </div>\`;
  // Puis-je continuer à me verser ?
  try{ var MM=computeMoney();
  html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
    <div class="dash-sec-title"><i class="ti ti-wallet"></i> Puis-je continuer à me verser ?</div>
    <div style="display:flex;justify-content:space-between;gap:10px;font-size:14px;padding:8px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-2);display:flex;align-items:center;gap:7px;"><i class="ti ti-target"></i> Versement mensuel soutenable</span><span style="font-family:'Cormorant Garamond',serif;font-size:19px;">\${fmt(MM.versement)}</span></div>
    <div style="display:flex;justify-content:space-between;gap:10px;font-size:14px;padding:8px 0;"><span style="color:var(--text-2);display:flex;align-items:center;gap:7px;"><i class="ti ti-heart"></i> Niveau de vie confortable visé</span><span style="font-family:'Cormorant Garamond',serif;font-size:19px;">\${fmt(MM.confortable)}</span></div>
    \${MM.versement>=MM.confortable
      ? \`<div style="background:var(--success-10);color:#456039;border-radius:10px;padding:12px 14px;font-size:14px;margin-top:10px;display:flex;gap:8px;align-items:flex-start;"><i class="ti ti-circle-check" style="margin-top:1px;"></i><span>À ce rythme, ton activité soutient ton niveau de vie confortable. Tu peux te verser \${fmt(MM.versement)} sans fragiliser l'entreprise.</span></div>\`
      : \`<div style="background:var(--warning-10);color:#a5502e;border-radius:10px;padding:12px 14px;font-size:14px;margin-top:10px;display:flex;gap:8px;align-items:flex-start;"><i class="ti ti-alert-triangle" style="margin-top:1px;"></i><span>Ton versement soutenable (\${fmt(MM.versement)}) reste sous ton niveau confortable. Il manque ~<strong>\${fmt(MM.confortable-MM.versement)}/mois</strong> — vise environ <strong>+\${fmt(Math.round((MM.confortable-MM.versement)/0.72))}/mois</strong> de CA récurrent pour tenir ce niveau sur 12 mois.</span></div>\`}
  </div>\`;
  }catch(e){}

  // ② Pourquoi cette prévision (flux)
  const flowLine=(lab,val,strong)=>\`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;"><span style="font-size:14px;\${strong?'font-weight:600;color:var(--navy);':'color:var(--text-2);'}">\${lab}</span><span style="font-family:'Cormorant Garamond',serif;font-size:\${strong?'18px':'15px'};">\${fmt(val)}</span></div>\`;
  const fd='<div style="text-align:center;color:var(--text-2);opacity:.4;font-size:13px;line-height:.7;">+</div>';
  html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-chart-bar"></i> D'où vient cette estimation</div>
    \${flowLine('CA déjà encaissé',P.encaisse)}\${fd}\${flowLine('Factures en attente',P.enAttente)}\${fd}\${flowLine('Projets & récurrents à venir',P.resteAFacturer)}
    <div style="border-top:1px solid var(--border);margin-top:6px;">\${flowLine('CA estimé fin d\\'année',P.caProjete,true)}</div>
  </div>\`;

  // <i class="ti ti-calendar"></i> Les prochains mois (frise sécurisée)
  html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
      <span style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);"><i class="ti ti-calendar"></i> Revenus déjà sécurisés · prochains mois</span>
      <span style="font-size:13px;color:var(--text-2);">Total sécurisé : <strong style="color:#456039;">\${fmt(totalSecure)}</strong></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(\${months.length},1fr);gap:8px;align-items:end;">
      \${months.map(mo=>\`<div style="text-align:center;"><div style="font-size:12px;color:var(--navy);font-family:'Cormorant Garamond',serif;">\${fmt(Math.round(mo.secure))}</div><div style="height:\${Math.round(mo.secure/maxSec*80)+3}px;background:\${mo.secure<maxSec*0.35?'#a5502e':'#456039'};border-radius:5px 5px 0 0;margin:6px auto 5px;width:58%;"></div><div style="font-size:11.5px;color:var(--text-2);">\${mo.label}</div></div>\`).join('')}
    </div>
    \${trou?\`<div style="font-size:13px;color:#a5502e;margin-top:12px;"><i class="ti ti-alert-triangle"></i> \${MOIS_LONG[trou.m-1]} est creux (\${fmt(Math.round(trou.secure))} sécurisés) — un bon moment pour prospecter dès maintenant.</div>\`:''}
  </div>\`;

  // <i class="ti ti-briefcase"></i> Fin d'année tu auras probablement
  html+=\`<div style="background:var(--navy);border-radius:18px;padding:26px 30px;color:#fff;margin-bottom:18px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;margin-bottom:12px;"><i class="ti ti-target"></i> Fin \${annee}, tu auras probablement</div>
    <div style="display:flex;gap:28px;flex-wrap:wrap;">
      \${big('<i class="ti ti-coin"></i>','Revenu net',fmt(P.netProjete))}
      \${big('<i class="ti ti-home"></i>','Salaire',fmt(salaireMois)+' /mois')}
      \${(patriSolde>0||patriMensuel>0)?big('<i class="ti ti-briefcase"></i>','Patrimoine',fmt(patriFin),misAnnee>0?'+ '+fmt(misAnnee)+' cette année':''):''}
      \${liberte!=null?big('<i class="ti ti-flame"></i>','Liberté',liberte.toFixed(1).replace('.',',')+' mois','sans nouveau revenu'):''}
    </div>
  </div>\`;

  // <i class="ti ti-home"></i> Salaire vs confort
  if(perso.besoin>0){
    const ecart=confort-salaireMois;
    html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:10px;"><i class="ti ti-home"></i> Ton salaire vs ton niveau de vie</div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        \${big('<i class="ti ti-cash"></i>','Salaire possible',fmt(salaireMois)+' /mois','','var(--navy)')}
        \${confort>0?big('<i class="ti ti-target"></i>','Niveau confortable',fmt(confort)+' /mois','','var(--navy)'):''}
      </div>
      \${(confort>0&&ecart>0)?\`<div style="font-size:14.5px;color:#a5502e;margin-top:12px;">Il te manquerait environ <strong>\${fmt(ecart)} / mois</strong> pour vivre confortablement — d'où l'intérêt de signer davantage.</div>\`:(confort>0?\`<div style="font-size:14.5px;color:#456039;margin-top:12px;"><i class="ti ti-confetti"></i> Tu peux te verser de quoi vivre confortablement.</div>\`:'')}
    </div>\`;
  }

  // <i class="ti ti-alert-triangle"></i> Les risques
  if(P.enAttente>0){
    html+=\`<div class="card" style="padding:24px;margin-bottom:18px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);margin-bottom:10px;"><i class="ti ti-alert-triangle"></i> À surveiller</div>
      <div style="font-size:14.5px;line-height:1.6;"><strong>\${fmt(P.enAttente)}</strong> de factures sont émises mais <strong>pas encore payées</strong>. Si elles n'étaient jamais réglées, ton CA estimé tomberait à <strong style="color:var(--navy);">\${fmt(P.caProjete-P.enAttente)}</strong>.</div>
      <div style="font-size:13.5px;color:var(--text-2);margin-top:8px;"><i class="ti ti-arrow-right"></i> Priorité : relancer ces factures.</div>
    </div>\`;
  }

  // <i class="ti ti-rocket"></i> Scénarios
  const prudent=Math.max(0,P.caProjete-P.enAttente);
  const realiste=P.caProjete;
  const optimiste=(P.objectifCA>realiste)?P.objectifCA:Math.round(realiste*1.15);
  const scen=(emoji,lab,val,desc)=>\`<div class="card" style="padding:20px;flex:1;min-width:180px;"><div style="font-size:13px;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;">\${emoji} \${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:700;color:var(--navy);">\${fmt(val)}</div><div style="font-size:12.5px;color:var(--text-2);">\${desc}</div></div>\`;
  html+=\`<div style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--text-2);font-weight:700;margin:6px 2px 8px;"><i class="ti ti-rocket"></i> Scénarios de fin d'année</div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
    \${scen('<i class="ti ti-shield"></i>','Prudent',prudent,'si les factures en attente ne sont pas payées')}
    \${scen('<i class="ti ti-target"></i>','Réaliste',realiste,'tout ce qui est signé se réalise')}
    \${scen('<i class="ti ti-rocket"></i>','Optimiste',optimiste,P.objectifCA>realiste?'tu atteins ton objectif':'+15% de signatures')}
  </div>\`;

  // <i class="ti ti-compass"></i> Ton plan jusqu'à décembre
  const actions=[];
  if(manque>0)actions.push('Sécuriser <strong>'+fmt(manque)+'</strong> de chiffre d\\'affaires supplémentaire.');
  if(P.enAttente>0)actions.push('Relancer <strong>'+fmt(P.enAttente)+'</strong> de factures en attente.');
  if(trou)actions.push('Prospecter dès <strong>'+MOIS_LONG[trou.m-1]+'</strong>, où seulement '+fmt(Math.round(trou.secure))+' sont sécurisés.');
  actions.push('En l\\'état, tu pourras te verser environ <strong>'+fmt(salaireMois)+' / mois</strong> jusqu\\'à la fin de l\\'année.');
  html+=\`<div class="card" style="padding:24px;margin-bottom:18px;background:var(--surface-2);">
    <div style="font-size:14px;font-weight:700;color:var(--navy);margin-bottom:12px;"><i class="ti ti-compass"></i> Ton plan jusqu'à décembre</div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      \${actions.map(a=>\`<div style="display:flex;gap:9px;align-items:flex-start;font-size:14.5px;line-height:1.5;"><span style="color:#456039;flex:none;"><i class="ti ti-check"></i></span><span>\${a}</span></div>\`).join('')}
    </div>
  </div>\`;

  // Revenus récurrents (gestion compacte)
  const rec=(settings.revenusRecurrents||[]);
  html+=\`<div class="card" style="padding:20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <span style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-2);"><i class="ti ti-repeat"></i> Revenus récurrents déclarés</span>
      <button class="btn btn-outline btn-xs" onclick="addRevenuRecurrent()"><i class="ti ti-plus"></i> Ajouter</button>
    </div>
    \${rec.length?rec.map(r=>\`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);"><span style="font-size:14px;">\${escHtml(r.nom||'Revenu')}</span><span style="display:flex;align-items:center;gap:10px;"><span style="font-family:'Cormorant Garamond',serif;">\${fmt(parseFloat(r.montant)||0)} /mois</span><button onclick="deleteRevenuRecurrent('\${r.id}')" style="background:none;border:none;color:#8d2b21;cursor:pointer;"><i class="ti ti-trash"></i></button></span></div>\`).join(''):'<div style="font-size:13.5px;color:var(--text-2);">Un revenu mensuel que tu factures régulièrement mais qui n\\'est pas dans tes projets ? Ajoute-le pour affiner la prévision.</div>'}
  </div>\`;

  el.innerHTML=html;
}

async function addRevenuRecurrent(){
  const nom=(q('#rec-nom')?.value||'').trim();
  const montant=parseFloat(q('#rec-montant')?.value);
  if(!nom||isNaN(montant)||montant<=0){toast('Indique un nom et un montant','error');return;}
  try{
    const settings=dbGetObj('settings');
    settings.revenusRecurrents=settings.revenusRecurrents||[];
    settings.revenusRecurrents.push({id:'r'+Date.now(),nom,montant});
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Revenu récurrent ajouté','success');
    renderRapportPrevision();
  }catch(e){toast('Erreur : '+e.message,'error');}
}
async function deleteRevenuRecurrent(id){
  try{
    const settings=dbGetObj('settings');
    settings.revenusRecurrents=(settings.revenusRecurrents||[]).filter(r=>r.id!==id);
    _cache.settings=await api('PUT','/api/settings',settings);
    toast('Supprimé','success');
    renderRapportPrevision();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

/* --- Rapport trimestriel ---------------------------------------------- */
function loadRapportTrimestriel(){
  const y=new Date().getFullYear();
  const sel=q('#rt-annee');
  if(sel&&!sel.options.length){for(let i=y;i>=y-3;i--)sel.add(new Option(i,i));sel.value=y;}
  renderRapportTrimestriel();
}
function renderRapportTrimestriel(){
  const annee=parseInt(q('#rt-annee')?.value||new Date().getFullYear());
  const factures =dbGet('factures');
  const depenses =dbGet('depenses');
  const abonnements=dbGet('abonnements');
  const settings =dbGetObj('settings');
  const urssafObj=dbGetObj('urssaf');
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;
  const pas=settings.pasFixe||40,pctV=settings.pctVersement||65;
  const aboMois=abonnements.filter(a=>a.statut==='actif').reduce((s,a)=>s+(a.montant||0),0);
  const now=new Date();

  const defs=[
    {lib:'T1',periode:'jan–mar',ms:[1,2,3],ech:annee+'-04-30'},
    {lib:'T2',periode:'avr–jun',ms:[4,5,6],ech:annee+'-07-31'},
    {lib:'T3',periode:'jul–sep',ms:[7,8,9],ech:annee+'-10-31'},
    {lib:'T4',periode:'oct–déc',ms:[10,11,12],ech:(annee+1)+'-01-31'},
  ];
  // Base URSSAF = CA encaissé (datePaiement en priorité), cohérent avec « Charges & URSSAF »
  const inTrim=(ds,ms)=>{const s=(ds||'')+'';return s.slice(0,4)==String(annee)&&ms.includes(parseInt(s.slice(5,7)));};
  const trims=defs.map((def,i)=>{
    const ca=factures.filter(f=>f.statut==='payee'&&inTrim(f.datePaiement||f.date,def.ms)).reduce((s,f)=>s+(f.montant||0),0);
    const dep=depenses.filter(d=>d.categorie!=='Versement perso'&&inTrim(d.date,def.ms)).reduce((s,d)=>s+(d.montant||0),0);
    const abo=aboMois*3,pasT=pas*3;
    const urssaf=Math.round(ca*tauxU*100)/100,cfp=Math.round(ca*tauxC*100)/100;
    const cotis=urssaf+cfp;
    const charges=cotis+dep+abo+pasT;
    const net=Math.max(0,ca-charges);
    const u=urssafObj[def.lib+'-'+annee]||{};
    const echDate=new Date(def.ech+'T23:59:00');
    const jours=Math.ceil((echDate-now)/86400000);
    const statut=u.statut==='paye'?'paye':jours<0?'echu':'a_venir';
    return{...def,num:i+1,ca,dep,abo,pasT,urssaf,cfp,cotis,charges,net,versement:Math.round(net*pctV/100),statut,jours,montantPaye:u.montantPaye||0,datePaye:u.datePaye};
  });

  const totCA=trims.reduce((s,t)=>s+t.ca,0);
  const totDep=trims.reduce((s,t)=>s+t.dep,0);
  const totCotis=trims.reduce((s,t)=>s+t.cotis,0);
  const totCharges=trims.reduce((s,t)=>s+t.charges,0);
  const totNet=trims.reduce((s,t)=>s+t.net,0);
  const totVers=trims.reduce((s,t)=>s+t.versement,0);
  const meilleur=trims.reduce((b,t)=>t.ca>b.ca?t:b,trims[0]);
  const badge=(t)=>t.statut==='paye'?'<span class="badge badge-paye">Payé</span>':t.statut==='echu'?'<span class="badge badge-retard">Échu</span>':'<span class="badge badge-a-venir">À venir</span>';

  // Détail de chaque poste de charge, réparti par trimestre
  const chargeLignes=[
    {lib:'URSSAF ('+(tauxU*100).toFixed(1)+' %)',get:t=>t.urssaf},
    {lib:'CFP ('+(tauxC*100).toFixed(1)+' %)',get:t=>t.cfp},
    {lib:'Dépenses pro',get:t=>t.dep},
    {lib:'Abonnements',get:t=>t.abo},
    {lib:'PAS',get:t=>t.pasT},
  ];

  const container=q('#rapport-trimestriel-content');
  if(!container)return;
  container.innerHTML=\`
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA encaissé \${annee}</span><span class="kpi-value">\${fmt(totCA)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Charges totales</span><span class="kpi-value danger">\${fmt(totCharges)}</span></div>
      <div class="kpi-card"><span class="kpi-label">URSSAF + CFP</span><span class="kpi-value danger">\${fmt(totCotis)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Résultat net</span><span class="kpi-value green">\${fmt(totNet)}</span></div>
    </div>
    \${meilleur&&meilleur.ca>0?\`<div class="alert info" style="margin-bottom:16px;"><i class="ti ti-trophy"></i> Meilleur trimestre : \${meilleur.lib} (\${meilleur.periode}) · \${fmt(meilleur.ca)}</div>\`:''}
    <div class="card mb-16">
      <div class="card-title">Détail par trimestre</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Trimestre</th><th>CA encaissé</th><th>Dépenses</th><th>URSSAF + CFP</th><th>Charges</th><th>Résultat</th><th>Versement</th></tr></thead>
        <tbody>\${trims.map(t=>\`<tr>
          <td><strong>\${t.lib}</strong> <span style="color:var(--text-2);font-size:12px;">\${t.periode}</span></td>
          <td class="td-amount">\${fmt(t.ca)}</td>
          <td class="td-amount">\${fmt(t.dep)}</td>
          <td class="td-amount" style="color:var(--danger);">\${fmt(t.cotis)}</td>
          <td class="td-amount" style="color:var(--danger);">\${fmt(t.charges)}</td>
          <td class="td-amount" style="color:var(--success);">\${fmt(t.net)}</td>
          <td class="td-amount">\${fmt(t.versement)}</td>
        </tr>\`).join('')}</tbody>
        <tfoot><tr style="font-weight:600;border-top:2px solid var(--border);">
          <td>Année \${annee}</td>
          <td class="td-amount">\${fmt(totCA)}</td>
          <td class="td-amount">\${fmt(totDep)}</td>
          <td class="td-amount" style="color:var(--danger);">\${fmt(totCotis)}</td>
          <td class="td-amount" style="color:var(--danger);">\${fmt(totCharges)}</td>
          <td class="td-amount" style="color:var(--success);">\${fmt(totNet)}</td>
          <td class="td-amount">\${fmt(totVers)}</td>
        </tr></tfoot>
      </table></div>
    </div>
    <div class="card mb-16">
      <div class="card-title">Détail des charges par trimestre</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Charge</th>\${trims.map(t=>\`<th>\${t.lib}</th>\`).join('')}<th>Année</th></tr></thead>
        <tbody>\${chargeLignes.map(l=>\`<tr>
          <td>\${l.lib}</td>
          \${trims.map(t=>\`<td class="td-amount">\${fmt(l.get(t))}</td>\`).join('')}
          <td class="td-amount"><strong>\${fmt(trims.reduce((s,t)=>s+l.get(t),0))}</strong></td>
        </tr>\`).join('')}</tbody>
        <tfoot><tr style="font-weight:600;border-top:2px solid var(--border);">
          <td>Total charges</td>
          \${trims.map(t=>\`<td class="td-amount" style="color:var(--danger);">\${fmt(t.charges)}</td>\`).join('')}
          <td class="td-amount" style="color:var(--danger);">\${fmt(totCharges)}</td>
        </tr></tfoot>
      </table></div>
    </div>
    <div class="card mb-16">
      <div class="card-title">URSSAF par trimestre — échéances</div>
      <div class="table-wrap"><table>
        <thead><tr><th>Trimestre</th><th>Montant dû</th><th>Échéance</th><th>Statut</th></tr></thead>
        <tbody>\${trims.map(t=>\`<tr>
          <td><strong>\${t.lib}</strong></td>
          <td class="td-amount">\${fmt(t.cotis)}</td>
          <td>\${fmtDate(t.ech)}\${t.statut!=='paye'&&t.jours>=0?\` <span style="color:var(--text-2);font-size:12px;">· dans \${t.jours} j</span>\`:''}</td>
          <td>\${badge(t)}\${t.statut==='paye'&&t.datePaye?\` <span style="color:var(--text-2);font-size:12px;">le \${fmtDate(t.datePaye)}</span>\`:''}</td>
        </tr>\`).join('')}</tbody>
      </table></div>
      <div style="font-size:12px;color:var(--text-2);margin-top:8px;">Base : CA encaissé du trimestre × \${(tauxU*100).toFixed(1)} % (URSSAF) + \${(tauxC*100).toFixed(1)} % (CFP). Les paiements se gèrent dans « Charges &amp; URSSAF ».</div>
    </div>
    <div class="card"><div class="card-title">CA vs charges par trimestre</div><div class="chart-wrap"><canvas id="chart-rt" height="200"></canvas></div></div>\`;
  setTimeout(()=>{
    const c=q('#chart-rt');
    if(c)drawBarChart(c,trims.map(t=>t.lib),[{data:trims.map(t=>t.ca),color:COLORS.blue},{data:trims.map(t=>t.charges),color:COLORS.violet}]);
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
  container.innerHTML=\`
    <div class="kpi-grid kpi-grid-4 mb-16">
      <div class="kpi-card"><span class="kpi-label">CA annuel brut</span><span class="kpi-value">\${fmt(caAnnuel)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Abattement 34%</span><span class="kpi-value">\${fmt(abattement)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Revenu imposable</span><span class="kpi-value">\${fmt(revenuImposable)}</span></div>
      <div class="kpi-card"><span class="kpi-label">Cotisations sociales</span><span class="kpi-value danger">\${fmt(cotisations)}</span></div>
    </div>
    <div class="card mb-16">
      <div class="card-title">Plafond micro-BNC · \${fmtN(PLAFOND_BNC)} €</div>
      <div class="fiscal-plafond-wrap">
        <div class="fiscal-plafond-bar"><div class="fiscal-plafond-fill \${pctPlafond>=90?'danger':pctPlafond>=80?'warning':''}" style="width:\${Math.min(100,pctPlafond)}%;background:\${barColor}"></div></div>
        <div class="fiscal-plafond-pct">\${pctPlafond}%</div>
      </div>
      \${pctPlafond>=80?\`<div class="alert danger" style="margin-top:8px;"><i class="ti ti-alert-triangle"></i> Vous avez dépassé 80% du plafond micro-BNC. Préparez un potentiel passage au régime réel.</div>\`:''}
    </div>
    <div class="card mb-16">
      <div class="card-title">Estimation impôt sur le revenu \${annee}</div>
      <div class="charges-recap">
        <div class="charges-recap-line"><span class="charges-recap-label">Revenu imposable (après abattement)</span><span class="charges-recap-amount">\${fmt(revenuImposable)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Cotisations sociales</span><span class="charges-recap-amount">\${fmt(cotisations)}</span></div>
        <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro YTD</span><span class="charges-recap-amount">\${fmt(depAnnuel)}</span></div>
        <div class="charges-recap-total"><span class="label">Estimation impôt</span><span class="amount">\${fmt(impotEstime)}</span></div>
      </div>
      <p style="font-size:12px;color:var(--text-2);margin-top:10px;">Estimation indicative basée sur les tranches \${annee}. Consultez un comptable pour votre déclaration.</p>
    </div>\`;
}

/* --- Simulateur ------------------------------------------------------- */
function renderTJM(){
  const el=q('#sim-tjm-result'); if(!el)return;
  const settings=dbGetObj('settings');
  let perso={besoin:0,revenusPerso:0,salaireConseille:0,capacite:0,epargneMensuel:0}; try{perso=computePerso();}catch(e){}
  let intel={revenuMoyen:0}; try{intel=computeIntel();}catch(e){}
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100, tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const pas=parseFloat(settings.pasFixe)||40;
  const abos=dbGet('abonnements')||[];
  const aboMois=abos.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const chargesEnt=Math.round(aboMois+pas);

  // Valeurs par défaut à partir des vraies données
  const salIn=q('#tjm-salaire'), epIn=q('#tjm-epargne'), jrIn=q('#tjm-jours');
  const salaire=salIn&&salIn.value!==''?parseFloat(salIn.value)||0:Math.round(perso.besoin||perso.salaireConseille||0);
  const epargne=epIn&&epIn.value!==''?parseFloat(epIn.value)||0:Math.round(perso.epargneMensuel||0);
  const jours=Math.max(1,jrIn&&jrIn.value!==''?parseInt(jrIn.value)||145:145);
  if(salIn&&salIn.value==='')salIn.value=salaire;
  if(epIn&&epIn.value==='')epIn.value=epargne;

  // CA nécessaire : ce qu'il faut sortir net (salaire + épargne) + charges entreprise, brut d'URSSAF
  const netSortir=salaire+epargne;
  const caMois=Math.round((netSortir+chargesEnt)/Math.max(0.01,1-tauxU-tauxC));
  const caAn=caMois*12;
  const tjm=Math.round(caAn/jours);
  // TJM actuel implicite (à partir du CA moyen réel)
  const caActuelAn=Math.round((intel.revenuMoyen||0)*12);
  const tjmActuel=caActuelAn>0?Math.round(caActuelAn/jours):0;
  const ecart=tjm-tjmActuel;
  // Durabilité : l'entreprise soutient-elle déjà ce salaire ?
  const capacite=perso.capacite||0;
  const durable=capacite>=salaire;
  const haussePct=capacite>0&&!durable?Math.round((salaire/capacite-1)*100):null;

  const stat=(lab,val,hint,color,big)=>\`<div style="\${big?'':'flex:1;min-width:150px;'}"><div style="font-size:12px;color:var(--text-2);text-transform:uppercase;letter-spacing:.04em;">\${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:\${big?'40px':'26px'};font-weight:700;color:\${color||'var(--navy)'};line-height:1.05;">\${val}</div>\${hint?\`<div style="font-size:12px;color:var(--text-2);">\${hint}</div>\`:''}</div>\`;

  const ecartBlock=tjmActuel>0?\`<div class="card" style="padding:20px;">
    <div style="display:flex;gap:20px;flex-wrap:wrap;">
      \${stat('TJM actuel estimé',fmt(tjmActuel)+' /j','sur '+jours+' jours facturés')}
      \${stat('TJM recommandé',fmt(tjm)+' /j','','#456039')}
      \${stat('Écart',(ecart>=0?'+':'')+fmt(ecart)+' /j','',ecart>0?'#8d2b21':'#456039')}
    </div>
    \${ecart>0?\`<div style="font-size:13.5px;color:#a5502e;margin-top:10px;">Sur un projet de 10 jours, un tarif trop bas te coûte environ <strong>\${fmt(ecart*10)}</strong> de manque à gagner.</div>\`:''}
  </div>\`:'';

  const duraBlock=(salaire>0)?\`<div class="card" style="padding:20px;">
    <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-stethoscope"></i> Cohérence</div>
    \${durable?\`<div style="font-size:14.5px;color:#456039;"><i class="ti ti-circle-check"></i> Ton activité soutient déjà ce salaire (capacité ~\${fmt(capacite)} / mois).</div>\`:(capacite>0?\`<div style="font-size:14.5px;color:#C43030;"><i class="ti ti-alert-triangle"></i> Ton activité génère aujourd'hui de quoi te verser ~\${fmt(capacite)} / mois. Pour tenir \${fmt(salaire)} / mois durablement, il faudrait augmenter ton CA d'environ <strong>\${haussePct}%</strong>.</div>\`:\`<div style="font-size:14px;color:var(--text-2);">Ajoute des factures pour que Finance estime ta capacité actuelle.</div>\`)}
  </div>\`:'';

  el.innerHTML=\`<div style="display:flex;flex-direction:column;gap:16px;">
    <div style="background:var(--navy);border-radius:18px;padding:26px 30px;color:#fff;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-briefcase"></i> Ton tarif recommandé</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:700;">\${fmt(tjm)} <span style="font-size:18px;opacity:.6;">/ jour</span></div>
      <div style="font-size:14px;opacity:.85;margin-top:4px;">Pour te verser <strong>\${fmt(salaire)}</strong> et épargner <strong>\${fmt(epargne)}</strong> par mois, ton activité doit générer <strong>\${fmt(caAn)} / an</strong> (\${fmt(caMois)} / mois), sur \${jours} jours facturés.</div>
    </div>
    <div class="card" style="padding:20px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:10px;">Ton modèle économique</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        \${stat('CA nécessaire',fmt(caAn)+' /an',fmt(caMois)+' /mois')}
        \${stat('Dont URSSAF',fmt(Math.round(caAn*(tauxU+tauxC)))+' /an','cotisations')}
        \${stat('Charges entreprise',fmt(chargesEnt*12)+' /an','abonnements + PAS')}
      </div>
    </div>
    \${ecartBlock}
    \${duraBlock}
    <div style="font-size:13px;color:var(--text-2);font-style:italic;">Ton activité est calibrée pour te verser \${fmt(salaire)} / mois, épargner \${fmt(epargne)} / mois et couvrir tes charges. Change les curseurs à gauche pour voir comment ton tarif doit évoluer.</div>
  </div>\`;
}
function renderRentaProjet(){
  const el=q('#sim-renta-result'); if(!el)return;
  const settings=dbGetObj('settings');
  let perso={besoin:0,epargneMensuel:0,salaireConseille:0}; try{perso=computePerso();}catch(e){}
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100, tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const taux=tauxU+tauxC;
  const pas=parseFloat(settings.pasFixe)||40;
  const abos=dbGet('abonnements')||[];
  const aboMois=abos.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const chargesEnt=aboMois+pas;
  const jrIn=q('#tjm-jours');
  const joursAn=Math.max(1,jrIn&&jrIn.value!==''?parseInt(jrIn.value)||145:145);
  const salaireCible=Math.round(perso.besoin||perso.salaireConseille||0);
  const epargneCible=Math.round(perso.epargneMensuel||0);
  const caAnReco=Math.round((salaireCible+epargneCible+chargesEnt)/Math.max(0.01,1-taux)*12);
  const tjmReco=Math.round(caAnReco/joursAn);

  const prix=parseFloat(q('#renta-prix')&&q('#renta-prix').value)||0;
  const jours=parseFloat(q('#renta-jours')&&q('#renta-jours').value)||0;
  const st=parseFloat(q('#renta-st')&&q('#renta-st').value)||0;
  const frais=parseFloat(q('#renta-frais')&&q('#renta-frais').value)||0;
  const nom=(q('#renta-nom')&&q('#renta-nom').value||'').trim();

  if(prix<=0){el.innerHTML=\`<div class="card" style="padding:28px;text-align:center;color:var(--text-2);"><div style="font-size:30px;"><i class="ti ti-calculator"></i></div><div style="font-size:15px;margin-top:8px;">Saisis le prix et le temps estimé du projet — Finance te dit tout de suite s'il est rentable pour toi.</div></div>\`;return;}

  const urssaf=Math.round(prix*taux);
  const chargesProjet=jours>0?Math.round(chargesEnt*12/joursAn*jours):0;
  const netEnt=Math.round(prix-urssaf-chargesProjet-st-frais);
  const revJour=jours>0?Math.round(prix/jours):0;
  const moisVie=perso.besoin>0?(netEnt/perso.besoin):null;
  const ratioTjm=(tjmReco>0&&jours>0)?revJour/tjmReco:1;
  const ecartPct=(tjmReco>0&&revJour>0)?Math.round((revJour/tjmReco-1)*100):null;
  const prixReco=jours>0?Math.round(tjmReco*jours):0;
  const maxJours=tjmReco>0?(prix/tjmReco):null; // au-delà, on passe sous l'objectif

  let verdict,vColor,vLabel,vTxt;
  if(netEnt<=0){verdict='<i class="ti ti-alert-circle"></i>';vColor='#C43030';vLabel='Non rentable';vTxt='À ce prix, ce projet ne dégage quasiment rien pour toi.';}
  else if(jours>0&&ratioTjm>=0.95){verdict='<i class="ti ti-circle-check"></i>';vColor='#456039';vLabel='Excellente';vTxt='Tu peux accepter ce projet sereinement — il est cohérent avec tes objectifs financiers.';}
  else if(moisVie!=null&&moisVie>=0.5){verdict='<i class="ti ti-alert-triangle"></i>';vColor='#a5502e';vLabel='Correcte';vTxt='Tu couvriras une partie de tes besoins, mais tu épargneras peu à ce tarif.';}
  else{verdict='<i class="ti ti-alert-circle"></i>';vColor='#C43030';vLabel='Faible';vTxt='À ce prix, tu risques de puiser dans ta trésorerie.';}

  const line=(lab,val,neg,strong)=>\`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;\${strong?'border-top:1px solid var(--border);margin-top:4px;':''}"><span style="font-size:14px;\${strong?'font-weight:600;color:var(--navy);':'color:var(--text-2);'}">\${lab}</span><span style="font-family:'Cormorant Garamond',serif;font-size:\${strong?'18px':'15px'};\${neg?'color:#8d2b21;':''}">\${neg?'−'+fmt(val):fmt(val)}</span></div>\`;
  const finance=[];
  if(perso.besoin>0&&moisVie!=null)finance.push('<i class="ti ti-circle-check"></i> '+(moisVie>=1?moisVie.toFixed(1).replace('.',',')+' mois de tes dépenses personnelles':Math.round(moisVie*100)+'% d\\'un mois de dépenses'));

  el.innerHTML=\`<div style="display:flex;flex-direction:column;gap:16px;">
    <div style="background:var(--navy);border-radius:18px;padding:24px 28px;color:#fff;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;">Rentabilité\${nom?' · '+escHtml(nom):''}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:39px;font-weight:700;color:\${verdict==='<i class="ti ti-circle-check"></i>'?'#b7d3ad':verdict==='<i class="ti ti-alert-triangle"></i>'?'#F6C453':'#F8A9A9'};">\${verdict} \${vLabel}</div>
      <div style="font-size:14.5px;opacity:.9;margin-top:4px;">\${vTxt}</div>
    </div>
    <div class="card" style="padding:20px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-coin"></i> Ce qu'il te restera</div>
      \${line('Prix vendu',prix)}
      \${line('URSSAF',urssaf,true)}
      \${chargesProjet>0?line('Charges entreprise (quote-part)',chargesProjet,true):''}
      \${st>0?line('Sous-traitance',st,true):''}
      \${frais>0?line('Frais / achats',frais,true):''}
      \${line('Net pour ton entreprise',netEnt,false,true)}
      \${revJour>0?\`<div style="font-size:13px;color:var(--text-2);margin-top:8px;">Soit environ <strong style="color:var(--navy);">\${fmt(revJour)} / jour</strong> sur \${jours} jour\${jours>1?'s':''}.</div>\`:''}
      \${finance.length?\`<div style="background:rgba(62,158,116,.1);border-radius:10px;padding:10px 12px;font-size:14px;color:#456039;margin-top:10px;">Ce projet finance \${finance.join(' · ')}.</div>\`:''}
    </div>
    \${(jours>0&&tjmReco>0)?\`<div class="card" style="padding:20px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:10px;"><i class="ti ti-target"></i> Face à ton tarif recommandé</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:130px;"><div style="font-size:12px;color:var(--text-2);">Ce projet</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:var(--navy);">\${fmt(revJour)} /j</div></div>
        <div style="flex:1;min-width:130px;"><div style="font-size:12px;color:var(--text-2);">Recommandé</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#456039;">\${fmt(tjmReco)} /j</div></div>
        \${ecartPct!=null?\`<div style="flex:1;min-width:130px;"><div style="font-size:12px;color:var(--text-2);">Écart</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:\${ecartPct<0?'#8d2b21':'#456039'};">\${ecartPct>=0?'+':''}\${ecartPct}%</div></div>\`:''}
      </div>
      \${(ecartPct!=null&&ecartPct<-5)?\`<div style="font-size:14px;color:#a5502e;margin-top:12px;">Pour atteindre tes objectifs, ce projet devrait plutôt être vendu autour de <strong>\${fmt(prixReco)}</strong> (entre \${fmt(prixReco)} et \${fmt(Math.round(prixReco*1.1))}).</div>\`:''}
      \${maxJours!=null?\`<div style="font-size:14px;color:var(--text-1);margin-top:12px;background:var(--surface-2);border-radius:10px;padding:10px 12px;">⏳ À ce prix, ce projet reste rentable jusqu'à <strong>\${maxJours.toFixed(1).replace('.',',')} jours</strong> de travail. Au-delà, ton revenu passe sous ton objectif.</div>\`:''}
    </div>\`:''}
  </div>\`;
}
let _chState=null;
const CH_HPD=7;
function chDefault(){
  return {bricks:[
    {id:'b1',nom:'Découverte client',h:2,on:true},
    {id:'b2',nom:'Atelier / brief',h:1,on:true},
    {id:'b3',nom:'Recherche',h:2,on:false},
    {id:'b4',nom:'Arborescence',h:1,on:false},
    {id:'b5',nom:'Wireframes',h:2,on:false},
    {id:'b6',nom:'Maquettes Figma',h:6,on:false},
    {id:'b7',nom:'Direction artistique',h:2,on:false},
    {id:'b8',nom:'Intégration WordPress',h:18,on:true},
    {id:'b9',nom:'Responsive',h:3,on:true},
    {id:'b10',nom:'Développement sur-mesure',h:0,on:false},
    {id:'b11',nom:'Optimisations',h:2,on:true},
    {id:'b12',nom:'Tests',h:2,on:true},
    {id:'b13',nom:'Livraison / mise en ligne',h:1,on:true},
    {id:'b14',nom:'Formation client',h:2,on:false},
    {id:'b15',nom:'Administration',h:1,on:true},
  ], salaire:'', epargne:'', arCount:2, arH:1.5, arPrix:0, marge:10, st:0, frais:0};
}
function chInit(){ if(!_chState)_chState=chDefault(); }
function chToggle(id){chInit();const b=_chState.bricks.find(x=>x.id===id);if(b)b.on=!b.on;renderChiffrage();}
function chH(id,v){chInit();const b=_chState.bricks.find(x=>x.id===id);if(b)b.h=parseFloat(v)||0;chResult();}
function chAdd(){chInit();const ni=q('#ch-new-nom');const hi=q('#ch-new-h');const nom=(ni&&ni.value||'').trim();const h=parseFloat(hi&&hi.value)||0;if(!nom)return;_chState.bricks.push({id:'bx'+Date.now().toString(36),nom,h,on:true});renderChiffrage();}
function chDel(id){chInit();_chState.bricks=_chState.bricks.filter(x=>x.id!==id);renderChiffrage();}
function chAR(f,v){chInit();_chState[f]=parseFloat(v)||0;chResult();}
function chMarge(v){chInit();_chState.marge=parseFloat(v)||0;chResult();}
function chExtra(f,v){chInit();_chState[f]=parseFloat(v)||0;chResult();}
function chObjectif(f,v){chInit();_chState[f]=v;chResult();}
function chReset(){_chState=chDefault();renderChiffrage();}

function renderChiffrage(){
  chInit();
  const el=q('#ch-builder'); if(!el)return;
  const S=_chState;
  let perso={besoin:0,epargneMensuel:0}; try{perso=computePerso();}catch(e){}
  const row=b=>\`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);\${b.on?'':'opacity:.45;'}">
    <input type="checkbox" \${b.on?'checked':''} onchange="chToggle('\${b.id}')" style="width:16px;height:16px;cursor:pointer;flex:none;">
    <span style="flex:1;font-size:14px;">\${escHtml(b.nom)}</span>
    <input type="number" value="\${b.h}" min="0" step="0.5" \${b.on?'':'disabled'} oninput="chH('\${b.id}',this.value)" style="width:62px;padding:4px 6px;border:1px solid var(--border);border-radius:6px;font-size:13px;text-align:right;">
    <span style="font-size:12px;color:var(--text-2);">h</span>
    <button onclick="chDel('\${b.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-2);font-size:14px;flex:none;" title="Supprimer"></button>
  </div>\`;
  el.innerHTML=\`<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <div class="card-title" style="margin:0;"><i class="ti ti-wall"></i> Construis ton projet</div>
      <button class="btn btn-ghost btn-xs" onclick="chReset()">Réinitialiser</button>
    </div>
    <div style="font-size:13px;color:var(--text-2);margin-bottom:10px;">Active / désactive chaque brique, ajuste les heures. Décoche ou mets 0 h ce que tu ne fais pas.</div>
    <div style="background:var(--surface-2);border-radius:10px;padding:12px;margin-bottom:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:8px;"><i class="ti ti-target"></i> Tes objectifs pour ce tarif</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div><label class="form-label">Salaire visé (€ / mois)</label><input type="number" value="\${S.salaire}" min="0" step="50" oninput="chObjectif('salaire',this.value)" class="form-input" placeholder="auto : \${Math.round(perso.besoin||0)}"></div>
        <div><label class="form-label">Épargne visée (€ / mois)</label><input type="number" value="\${S.epargne}" min="0" step="50" oninput="chObjectif('epargne',this.value)" class="form-input" placeholder="auto : \${Math.round(perso.epargneMensuel||0)}"></div>
      </div>
    </div>
    \${S.bricks.map(row).join('')}
    <div style="display:flex;gap:6px;margin-top:10px;">
      <input id="ch-new-nom" class="form-input" placeholder="Ajouter une tâche (ex: Migration ACF)" style="flex:1;">
      <input id="ch-new-h" class="form-input" type="number" min="0" step="0.5" placeholder="h" style="width:66px;">
      <button class="btn btn-secondary btn-sm" onclick="chAdd()">+</button>
    </div>
    <div class="card-title" style="margin-top:16px;">Révisions & marge</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="form-label">Allers-retours inclus</label><input type="number" value="\${S.arCount}" min="0" step="1" oninput="chAR('arCount',this.value)" class="form-input"></div>
      <div><label class="form-label">Temps / A-R (h)</label><input type="number" value="\${S.arH}" min="0" step="0.5" oninput="chAR('arH',this.value)" class="form-input"></div>
    </div>
    <div class="form-group"><label class="form-label">Prix d'un A-R supplémentaire (€)</label><input type="number" value="\${S.arPrix||''}" min="0" step="10" oninput="chExtra('arPrix',this.value)" class="form-input" placeholder="Auto d'après ton tarif si vide"></div>
    <div class="form-group"><label class="form-label">Marge de sécurité</label>
      <select class="form-select" onchange="chMarge(this.value)">
        <option value="0" \${S.marge==0?'selected':''}>0 %</option>
        <option value="5" \${S.marge==5?'selected':''}>5 %</option>
        <option value="10" \${S.marge==10?'selected':''}>10 %</option>
        <option value="15" \${S.marge==15?'selected':''}>15 %</option>
        <option value="20" \${S.marge==20?'selected':''}>20 %</option>
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="form-label">Sous-traitance (€)</label><input type="number" value="\${S.st}" min="0" step="50" oninput="chExtra('st',this.value)" class="form-input"></div>
      <div><label class="form-label">Frais (€)</label><input type="number" value="\${S.frais}" min="0" step="10" oninput="chExtra('frais',this.value)" class="form-input"></div>
    </div>
  </div>\`;
  chResult();
}

function chResult(){
  chInit();
  const el=q('#sim-chiffrage-result'); if(!el)return;
  const S=_chState;
  const settings=dbGetObj('settings');
  let perso={besoin:0,epargneMensuel:0,salaireConseille:0}; try{perso=computePerso();}catch(e){}
  const tauxU=(parseFloat(settings.tauxUrssaf)||25.6)/100, tauxC=(parseFloat(settings.tauxCfp)||0.2)/100;
  const taux=tauxU+tauxC;
  const pas=parseFloat(settings.pasFixe)||40;
  const abos=dbGet('abonnements')||[];
  const aboMois=abos.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montant||a.montantMensuel||0),0);
  const chargesEnt=aboMois+pas;
  const joursAn=Math.max(1,parseInt(q('#tjm-jours')&&q('#tjm-jours').value)||145);

  const brickH=S.bricks.filter(b=>b.on).reduce((s,b)=>s+(parseFloat(b.h)||0),0);
  const arH=(parseFloat(S.arCount)||0)*(parseFloat(S.arH)||0);
  const workH=brickH+arH;
  const totalH=Math.round(workH*(1+(parseFloat(S.marge)||0)/100)*10)/10;
  const jours=totalH/CH_HPD;
  const add=(parseFloat(S.st)||0)+(parseFloat(S.frais)||0);

  if(totalH<=0){el.innerHTML=\`<div class="card" style="padding:28px;text-align:center;color:var(--text-2);"><div style="font-size:30px;"><i class="ti ti-wall"></i></div><div style="font-size:15px;margin-top:8px;">Assemble les briques de ton projet à gauche — Finance calcule le prix à vendre, d'après tes objectifs.</div></div>\`;return;}

  const salaireVital=(S.salaire!==''&&S.salaire!=null)?(parseFloat(S.salaire)||0):Math.round(perso.besoin||perso.salaireConseille||0);
  const epargne=(S.epargne!==''&&S.epargne!=null)?(parseFloat(S.epargne)||0):Math.round(perso.epargneMensuel||0);
  const confort=Math.round(parseFloat(settings.persoConfort)||salaireVital*1.2||0);
  const tjmFor=(sal,ep)=>((sal+ep+chargesEnt)/Math.max(0.01,1-taux)*12)/joursAn;
  const tjmMin=tjmFor(salaireVital,0), tjmCons=tjmFor(salaireVital,epargne), tjmConf=tjmFor(confort,epargne);
  const prixMin=Math.round(tjmMin*jours+add);
  const prixCons=Math.round(tjmCons*jours+add);
  const prixConf=Math.round(tjmConf*jours+add);
  const maxH=tjmMin>0?Math.round((prixCons-add)/tjmMin*CH_HPD):null; // au-delà, sous le minimum vital
  const coutAR=(parseFloat(S.arPrix)||0)>0?Math.round(parseFloat(S.arPrix)):Math.round((parseFloat(S.arH)||1.5)*tjmCons/CH_HPD);
  const arManuel=(parseFloat(S.arPrix)||0)>0;

  const priceCard=(lab,val,emph)=>\`<div style="flex:1;min-width:130px;\${emph?'':'opacity:.9;'}"><div style="font-size:12px;opacity:.6;">\${lab}</div><div style="font-family:'Cormorant Garamond',serif;font-size:\${emph?'40px':'26px'};font-weight:700;\${emph?'color:#b7d3ad;':''}">\${fmt(val)}</div></div>\`;
  const justif=(lab,val)=>\`<div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0;border-bottom:1px solid var(--border);"><span style="color:var(--text-2);">\${lab}</span><span style="font-family:'Cormorant Garamond',serif;">\${val}</span></div>\`;

  el.innerHTML=\`<div style="display:flex;flex-direction:column;gap:16px;">
    <div style="background:var(--navy);border-radius:18px;padding:24px 28px;color:#fff;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;"><i class="ti ti-coin"></i> Combien vendre ce projet ?</div>
      <div style="font-size:13.5px;opacity:.7;margin:2px 0 12px;">\${totalH} h (\${(Math.round(jours*10)/10)} j)\${(parseFloat(S.marge)||0)>0?' · marge '+S.marge+'% incluse':''}</div>
      <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-end;">
        \${priceCard('Prix minimum',prixMin,false)}
        \${priceCard('Prix conseillé',prixCons,true)}
        \${priceCard('Prix premium',prixConf,false)}
      </div>
    </div>
    <div class="card" style="padding:20px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:8px;">Pourquoi \${fmt(prixCons)} ?</div>
      <div style="font-size:13.5px;color:var(--text-2);margin-bottom:8px;">Ton tarif intègre tes objectifs financiers réels :</div>
      \${justif('Salaire visé',fmt(salaireVital)+' /mois')}
      \${epargne>0?justif('Épargne',fmt(epargne)+' /mois'):''}
      \${justif('Charges entreprise',fmt(chargesEnt)+' /mois')}
      \${justif('URSSAF',Math.round(taux*100)+'%')}
      \${justif('Rythme de travail',joursAn+' jours facturés / an')}
      \${add>0?justif('Sous-traitance + frais refacturés',fmt(add)):''}
    </div>
    <div class="card" style="padding:20px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-2);margin-bottom:10px;">⏱ Ton budget-temps</div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:110px;"><div style="font-size:12px;color:var(--text-2);">Temps prévu</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:var(--navy);">\${totalH} h</div></div>
        \${maxH!=null?\`<div style="flex:1;min-width:110px;"><div style="font-size:12px;color:var(--text-2);">Max avant de perdre</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#456039;">\${maxH} h</div></div>\`:''}
        \${maxH!=null?\`<div style="flex:1;min-width:110px;"><div style="font-size:12px;color:var(--text-2);">Marge</div><div style="font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:\${(maxH-totalH)>=0?'#456039':'#8d2b21'};">\${Math.round((maxH-totalH)*10)/10} h</div></div>\`:''}
      </div>
      \${(parseFloat(S.arCount)||0)>0?\`<div style="font-size:13.5px;color:var(--text-2);margin-top:10px;">Tu inclus <strong>\${S.arCount} aller\${S.arCount>1?'s':''}-retour\${S.arCount>1?'s':''}</strong> (~\${Math.round(arH*10)/10} h). \${arManuel?'Au-delà, facture <strong style=\"color:var(--navy);\">'+fmt(coutAR)+'</strong> par aller-retour supplémentaire.':'Chaque A-R supplémentaire réduit ton bénéfice d\\'environ <strong style=\"color:#8d2b21;\">'+fmt(coutAR)+'</strong> — pense à le facturer.'}</div>\`:''}
      \${maxH!=null?\`<div style="font-size:13px;color:var(--text-2);margin-top:6px;">Au-delà de \${maxH} h, ce projet passe sous ton minimum vital.</div>\`:''}
    </div>
  </div>\`;
}

function loadSimulateur(){
  const s=dbGetObj('settings');
  if(q('#sim-versement-slider'))q('#sim-versement-slider').value=s.pctVersement||65;
  if(q('#sim-slider-val'))q('#sim-slider-val').textContent=\`\${s.pctVersement||65}%\`;
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
  if(q('#sr-urssaf-label'))q('#sr-urssaf-label').textContent=\`— URSSAF (\${s.tauxUrssaf||25.6}%)\`;
  if(q('#sr-cfp-label'))q('#sr-cfp-label').textContent=\`— CFP (\${s.tauxCfp||0.2}%)\`;
  if(q('#sr-pas-label'))q('#sr-pas-label').textContent=\`— PAS mensuel (\${pas}€ · impôt prélevé à la source)\`;
  if(q('#sr-ca'))q('#sr-ca').textContent=fmt(ca);
  if(q('#sr-urssaf'))q('#sr-urssaf').textContent=\`− \${fmt(urssaf)}\`;
  if(q('#sr-cfp'))q('#sr-cfp').textContent=\`− \${fmt(cfp)}\`;
  if(q('#sr-pas'))q('#sr-pas').textContent=\`− \${fmt(pas)}\`;
  if(q('#sr-dep'))q('#sr-dep').textContent=\`− \${fmt(dep)}\`;
  if(q('#sr-cfe'))q('#sr-cfe').textContent=\`− \${fmt(cfe)}\`;
  if(q('#sr-net'))q('#sr-net').textContent=fmt(net);
  if(q('#sr-vers-label'))q('#sr-vers-label').textContent=\`Je me verse (\${pctV}%)\`;
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
      if(q('#sr-bg-depenses'))q('#sr-bg-depenses').textContent=\`− \${fmt(depPerso)}\`;
      const reste=entrees-depPerso;
      if(q('#sr-bg-reste')){q('#sr-bg-reste').textContent=fmt(reste);q('#sr-bg-reste').className=\`sim-line-amount \${reste>=0?'pos':'neg'}\`;}
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
  if(q('#srt-cotis'))q('#srt-cotis').textContent=\`− \${fmt(cotis)}\`;
  if(q('#srt-dep'))q('#srt-dep').textContent=\`− \${fmt(dep)}\`;
  if(q('#srt-pas'))q('#srt-pas').textContent=\`− \${fmt(pasT)}\`;
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
    return\`<div class="scenario-card \${sc.cls}">
      <div class="scenario-label">\${sc.label} (×\${sc.mult})</div>
      <div class="scenario-ca">\${fmt(ca)}</div>
      <div class="scenario-sub">Net : \${fmt(net)} · Versement : \${fmt(Math.round(net*pctV/100))}</div>
      \${ca>PLAFOND_BNC?\`<div style="font-size:12px;color:var(--danger);margin-top:6px;"><i class="ti ti-alert-triangle"></i> Dépasse le plafond micro-BNC</div>\`:''}
    </div>\`;
  }).join('');
  const sr=q('#sim-result-annuel');if(sr)sr.innerHTML=\`<div class="scenarios-grid">\${html}</div>\`;
}

/* --- Import / Export -------------------------------------------------- */
let importFacturesParsed=null,importDepensesParsed=null;
function initImportExport(){
  qa('[data-ie-tab]').forEach(btn=>btn.onclick=()=>{
    qa('[data-ie-tab]').forEach(b=>b.classList.remove('active'));
    qa('.ie-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    q(\`#ie-panel-\${btn.dataset.ieTab}\`)?.classList.add('active');
  });
  setupFileDrop('drop-factures','file-factures-csv',data=>{importFacturesParsed=data;previewImport('factures',data);});
  setupFileDrop('drop-depenses','file-depenses-csv',data=>{importDepensesParsed=data;previewImport('depenses',data);});
  qa('[data-export]').forEach(btn=>btn.onclick=()=>exportCSV(btn.dataset.export));
}
function setupFileDrop(dropId,inputId,cb){
  const drop=q(\`#\${dropId}\`),inp=q(\`#\${inputId}\`);
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
    const text=e.target.result;
    const lines=text.split(/\\r?\\n/).filter(l=>l.trim());
    if(!lines.length)return;
    // Détecte le séparateur (;  ou ,)
    const sep=lines[0].includes(';')?';':',';
    // Parse une ligne CSV en gérant les champs entre guillemets
    const parseLine=line=>{
      const res=[];let cur='',inQ=false;
      for(let i=0;i<line.length;i++){
        const c=line[i];
        if(c==='"'){inQ=!inQ;}
        else if(c===sep&&!inQ){res.push(cur.trim());cur='';}
        else cur+=c;
      }
      res.push(cur.trim());
      return res;
    };
    const headers=parseLine(lines[0]).map(h=>h.replace(/"/g,'').toLowerCase().trim());
    const rows=lines.slice(1).map(line=>{
      const vals=parseLine(line).map(v=>v.replace(/^"|"$/g,'').trim());
      return Object.fromEntries(headers.map((h,i)=>[h,vals[i]||'']));
    }).filter(r=>Object.values(r).some(v=>v));
    cb(rows);
  };
  reader.readAsText(file,'UTF-8');
}
function previewImport(type,rows){
  const prev=q(\`#import-\${type}-preview\`),btn=q(\`#btn-import-\${type}\`);
  if(!prev||!rows.length)return;
  const existingNums=type==='factures'?dbGet('factures').map(f=>f.numero):[];
  prev.style.display='block';
  prev.innerHTML=\`<div class="import-row header"><span>Statut</span><span>Date</span><span>Référence</span><span>Montant</span></div>\`+
    rows.slice(0,20).map(r=>{
      const isDoublon=type==='factures'&&existingNums.includes(r.numero||r['n° facture']||r.number);
      return\`<div class="import-row \${isDoublon?'doublon':'new'}"><span>\${isDoublon?'Doublon':'Nouveau'}</span><span>\${r.date||'—'}</span><span>\${r.numero||r.client||r.description||'—'}</span><span>\${r.montant||'—'}</span></div>\`;
    }).join('');
  if(btn)btn.style.display='inline-flex';
}
function deaccent(s){var r=(s||'').toLowerCase();r=r.replace(/[\u00e0\u00e2\u00e4]/g,'a');r=r.replace(/[\u00e9\u00e8\u00ea\u00eb]/g,'e');r=r.replace(/[\u00ee\u00ef]/g,'i');r=r.replace(/[\u00f4\u00f6]/g,'o');r=r.replace(/[\u00f9\u00fb\u00fc]/g,'u');r=r.replace(/\u00e7/g,'c');return r;}
function indyStatut(v){
  const s=deaccent(v||'');
  if(s.includes('pay'))return'payee';
  if(s.includes('retard'))return'retard';
  return'attente';
}
function indyDate(v){
  if(!v)return'';
  // Formats : DD/MM/YYYY ou YYYY-MM-DD
  const m=v.match(/^([0-9]{2})[/]([0-9]{2})[/]([0-9]{4})$/);
  return m?\`\${m[3]}-\${m[2]}-\${m[1]}\`:v.slice(0,10);
}
function indyMontant(v){
  if(!v)return 0;
  // Enlève espaces, remplace virgule par point
  return parseFloat(v.replace(/[ \u00a0]/g,'').replace(',','.'))||0;
}
function indyGet(r,...keys){
  for(const k of keys){
    const found=Object.keys(r).find(h=>deaccent(h).includes(k));
    if(found&&r[found])return r[found];
  }
  return'';
}
async function doImportFactures(){
  if(!importFacturesParsed)return;
  const lignes=importFacturesParsed.map(r=>({
    numero:     indyGet(r,'numero','n°','reference','ref','number'),
    client:     indyGet(r,'client','tiers','nom client','customer'),
    description:indyGet(r,'objet','description','libelle','designation'),
    date:       indyDate(indyGet(r,'emission','date facture','date creation','date','issued')),
    datePaiement:indyDate(indyGet(r,'paiement','paid','reglement','encaissement'))||undefined,
    montant:    indyMontant(indyGet(r,'ttc','montant','total','amount','ht')),
    statut:     indyStatut(indyGet(r,'statut','status','etat')),
  })).map(l=>({...l,datePaiement:l.datePaiement||undefined}));
  try{
    const res=await api('POST','/api/import/factures',{lignes});
    _cache.factures=await api('GET','/api/factures');
    toast(\`Importées : \${res.importees} · Doublons ignorés : \${res.doublons}\`,'success');
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
    toast(\`Importées : \${res.importees}\`,'success');
    importDepensesParsed=null;
    const prev=q('#import-depenses-preview');if(prev)prev.style.display='none';
    const btn=q('#btn-import-depenses');if(btn)btn.style.display='none';
  }catch(e){toast(e.message||'Erreur','error');}
}
async function exportCSV(type){
  try{
    const r=await fetch(\`/api/export/\${type}\`);
    if(r.status===401){showLogin();return;}
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=\`\${type}-\${today()}.csv\`;a.click();
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
  if(q('#opt-delai-paiement'))q('#opt-delai-paiement').value=s.delaiPaiement||30;
  if(q('#opt-qonto-solde-initial'))q('#opt-qonto-solde-initial').value=s.qontoSoldeInitial||0;
  if(q('#opt-qonto-date-debut'))q('#opt-qonto-date-debut').value=s.qontoDateDebut||'2026-01-01';
  if(q('#opt-pct-formation'))q('#opt-pct-formation').value=s.pctFormation||10;
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
  if(alEl)alEl.innerHTML=total===100?\`<span style="color:var(--success);"><i class="ti ti-check"></i> Total : 100%</span>\`:\`<span style="color:var(--danger);">Total : \${total}% (doit être égal à 100%)</span>\`;
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
    delaiPaiement:parseInt(q('#opt-delai-paiement').value)||30,
    qontoSoldeInitial:parseFloat(q('#opt-qonto-solde-initial')?.value)||0,
    qontoDateDebut:q('#opt-qonto-date-debut')?.value||'2026-01-01',
    pctFormation:parseFloat(q('#opt-pct-formation')?.value)||10,
    cfe:parseFloat(q('#opt-cfe').value)||0,
    pctVersement:v,pctEpargne:e,pctTresorerie:t
  };
  try{
    await dbSet('settings',body);
    toast('Options enregistrées','success');
    renderQontoCalc();
  }catch(e){toast(e.message||'Erreur','error');}
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
  q('#factures-filter-annee')?.addEventListener('change',renderFactures);
  q('#factures-filter-mois')?.addEventListener('change',renderFactures);
  q('#factures-filter-statut')?.addEventListener('change',renderFactures);
  q('#factures-filter-projet')?.addEventListener('change',renderFactures);
  q('#factures-filter-client')?.addEventListener('change',renderFactures);
  q('#factures-sort')?.addEventListener('change',renderFactures);
  q('#factures-filter-mois-paiement')?.addEventListener('change',renderFactures);
  // PDF : bouton → ouvre le file picker
  q('#f-pdf-btn')?.addEventListener('click',()=>q('#f-pdf-file')?.click());
  q('#f-pdf-file')?.addEventListener('change',function(){
    const nameEl=q('#f-pdf-name'),btn=q('#f-pdf-btn');
    if(this.files?.length){
      btn.className='pdf-btn present';btn.innerHTML='<i class="ti ti-file-filled"></i> '+this.files[0].name;
      if(nameEl)nameEl.textContent='';
    }
  });

  // Devis
  q('#btn-new-devis')?.addEventListener('click',()=>openDevisModal());
  q('#btn-save-devis')?.addEventListener('click',saveDevis);
  q('#devis-search')?.addEventListener('input',renderDevis);
  q('#devis-filter-annee')?.addEventListener('change',renderDevis);
  q('#devis-filter-mois')?.addEventListener('change',renderDevis);
  q('#devis-filter-statut')?.addEventListener('change',renderDevis);
  q('#dv-pdf-btn')?.addEventListener('click',()=>q('#dv-pdf-file')?.click());
  q('#dv-pdf-file')?.addEventListener('change',function(){
    const btn=q('#dv-pdf-btn');
    if(this.files?.length){btn.className='pdf-btn present';btn.innerHTML='<i class="ti ti-file-filled"></i> '+this.files[0].name;}
  });

  // Projets
  q('#btn-new-projet')?.addEventListener('click',()=>openProjetModal());
  q('#btn-save-projet')?.addEventListener('click',saveProjet);
  q('#projets-search')?.addEventListener('input',renderProjets);
  q('#projets-filter-client')?.addEventListener('change',renderProjets);
  q('#projets-filter-annee')?.addEventListener('change',renderProjets);
  q('#projets-filter-mois')?.addEventListener('change',renderProjets);
  q('#projets-filter-statut')?.addEventListener('change',renderProjets);

  // Tiers
  q('#btn-new-tiers')?.addEventListener('click',()=>openModalTiers());
  q('#btn-save-tiers')?.addEventListener('click',saveModalTiers);
  q('#tiers-search')?.addEventListener('input',renderTiers);
  q('#tiers-filter-type')?.addEventListener('change',renderTiers);

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
  q('#btn-save-depense-prevue')?.addEventListener('click',saveDepensePrevue);

  // Transactions
  q('#btn-new-txn')?.addEventListener('click',openTxnModal);
  q('#btn-save-txn')?.addEventListener('click',saveTxn);
  q('#txn-search')?.addEventListener('input',renderTransactions);
  q('#txn-filter-compte')?.addEventListener('change',renderTransactions);
  q('#txn-filter-type')?.addEventListener('change',renderTransactions);

  // URSSAF
  q('#btn-save-urssaf')?.addEventListener('click',saveURSSAFPaiement);


  // Objectifs épargne
  q('#btn-new-objectif-epargne')?.addEventListener('click',()=>openEpargneGoalModal());
  q('#btn-save-obj-epargne')?.addEventListener('click',saveEpargneGoal);


  // Rapports
  q('#btn-rm-gen')?.addEventListener('click',renderRapportMensuel);
  q('#btn-prev-gen')?.addEventListener('click',renderRapportPrevision);
  q('#btn-rt-gen')?.addEventListener('click',renderRapportTrimestriel);
  q('#btn-ra-gen')?.addEventListener('click',renderRapportAnnuel);
  q('#btn-rf-gen')?.addEventListener('click',renderRapportFiscal);

  // Simulateur
  q('#sim-versement-slider')?.addEventListener('input',function(){
    if(q('#sim-slider-val'))q('#sim-slider-val').textContent=\`\${this.value}%\`;
  });
  q('#btn-sim-calculer')?.addEventListener('click',calcSimMensuel);
  q('#btn-sim-trim')?.addEventListener('click',calcSimTrimestriel);
  q('#btn-sim-annuel')?.addEventListener('click',calcSimAnnuel);
  qa('.sim-tab').forEach(btn=>btn.addEventListener('click',function(){
    const panel=this.dataset.sim;
    qa('.sim-tab').forEach(b=>b.classList.remove('active'));
    qa('.sim-panel').forEach(p=>p.classList.remove('active'));
    this.classList.add('active');
    q(\`#sim-panel-\${panel}\`)?.classList.add('active');
    if(panel==='tjm')renderTJM();
    if(panel==='renta')renderRentaProjet();
    if(panel==='chiffrage')renderChiffrage();
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
    if (r.status === 401) { showLogin(); } else { hideLogin(); await startApp(); }
  } catch { showLogin(); }
}

document.addEventListener('DOMContentLoaded',init);
`;

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    // Assets statiques
    if (path === '/style.css') return new Response(CSS,  { headers: { 'Content-Type': 'text/css; charset=utf-8',         'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    if (path === '/app.js')    return new Response(JS,   { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    if (path === '/favicon.ico') return new Response(null, { status: 204 });

    // Auth
    if (path === '/api/auth/login'  && request.method === 'POST') return handleLogin(request, env);
    if (path === '/api/auth/logout' && request.method === 'POST') return handleLogout(request, env);
    if (path === '/api/auth/debug') return handleDebug(request, env);

    // Routes API → proxy vers le back (avec vérification auth)
    if (path.startsWith('/api/')) {
      const ok = await checkAuth(request, env);
      if (!ok) return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      try {
        return await env.STB_BACK.fetch(request);
      } catch(e) {
        return new Response(JSON.stringify({ error: 'Erreur back-end : ' + e.message }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // SPA fallback
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache, no-store' } });
  }
};

async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (!password) return jsonResp(400, 'Mot de passe requis.');

  let entry;
  try { entry = await env.KV_AUTH.get(password, 'json'); } catch { return jsonResp(500, 'Erreur KV'); }
  if (!entry)           return jsonResp(401, 'Mot de passe incorrect.');
  if (!entry.isActive)  return jsonResp(401, 'Compte désactivé.');
  if (entry.expireAt && new Date(entry.expireAt) < new Date()) return jsonResp(401, 'Compte expiré.');

  // Session token : UUID aléatoire stocké dans KV, jamais le mot de passe dans le cookie
  const sessionId = crypto.randomUUID();
  const SESSION_TTL = 30 * 24 * 3600; // 30 jours en secondes
  await env.KV_AUTH.put(`sess:${sessionId}`, JSON.stringify({ active: true, createdAt: new Date().toISOString() }), { expirationTtl: SESSION_TTL });

  const cookie = `${COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${SESSION_TTL}`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
  });
}

async function handleLogout(request, env) {
  // Supprime la session côté KV
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (match) await env.KV_AUTH.delete(`sess:${match[1]}`);
  } catch {}
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie }
  });
}

async function checkAuth(request, env) {
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
    if (!match || !match[1]) return false;
    const sessionId = match[1];
    const session = await env.KV_AUTH.get(`sess:${sessionId}`, 'json');
    return !!(session?.active);
  } catch {
    return false;
  }
}

async function handleDebug(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const sessionId = match ? match[1] : null;
  let kvResult = null, kvError = null;
  if (sessionId) {
    try { kvResult = await env.KV_AUTH.get(`sess:${sessionId}`, 'json'); }
    catch(e) { kvError = e.message; }
  }
  // Test proxy vers wBack
  let backStatus = null, backBody = null, backError = null;
  try {
    const backReq = new Request(new URL('/api/settings', request.url).href, { headers: request.headers });
    const backResp = await env.STB_BACK.fetch(backReq);
    backStatus = backResp.status;
    backBody = await backResp.json().catch(() => '(non JSON)');
  } catch(e) { backError = e.message; }

  return new Response(JSON.stringify({
    cookieHeader: cookieHeader || '(vide)',
    sessionId: sessionId || '(non trouvé)',
    authOk: !!(kvResult?.active),
    kvResult, kvError,
    wBack: { status: backStatus, body: backBody, error: backError },
    bindings: { KV_AUTH: typeof env.KV_AUTH, STB_BACK: typeof env.STB_BACK },
  }, null, 2), { headers: { 'Content-Type': 'application/json' } });
}

function jsonResp(status, error) {
  return new Response(JSON.stringify({ error }), { status, headers: { 'Content-Type': 'application/json' } });
}
