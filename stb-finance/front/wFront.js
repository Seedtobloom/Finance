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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>

<!-- APP SHELL -->
<div id="app">

  <!-- SIDEBAR -->
  <aside id="sidebar">
    <div class="sidebar-logo">
      <span class="logo-name">Seed to bloom</span>
      <span class="logo-sub">Les finances de Cindy</span>
    </div>

    <nav id="sidebar-nav">
      <div class="nav-group">
        <span class="nav-group-label">Mon argent</span>
        <a class="nav-item" data-section="dashboard" data-groupe="aujourdhui">Aujourd’hui</a>
        <a class="nav-item" data-section="enveloppes" data-groupe="tresorerie">Trésorerie</a>
        <a class="nav-item" data-section="factures" data-groupe="factures">Factures et devis<span class="nav-pastille" id="nav-pastille-factures"></span></a>
        <a class="nav-item" data-section="abonnements" data-groupe="charges">Charges et URSSAF</a>
        <a class="nav-item" data-section="rapport-annuel" data-groupe="bilans">Bilans</a>
      </div>
    </nav><!-- /nav -->

    <div class="sidebar-footer">
      <a class="nav-item nav-item--bas" data-section="options" data-groupe="reglages">Réglages</a>
      <div class="sidebar-synchro" id="sidebar-synchro"></div>
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main id="main">

    <!-- ═══════════════════════════
         TABLEAU DE BORD
         ═══════════════════════════ -->
    <section id="section-dashboard" class="section">
      <div class="fa-tete">
        <h1 class="fa-titre">Bonjour Cindy</h1>
        <p class="fa-sous" id="fa-sous"></p>
      </div>
      <div class="fc-bandeau" id="fa-cloture" style="display:none"></div>
      <div class="fa-cartes" id="fa-cartes"></div>
      <div class="fa-deux">
        <div class="fa-blanc" id="fa-seuils"></div>
        <div class="fa-pile"><div class="fa-blanc" id="fa-etsi"></div><div class="fa-blanc" id="fa-mois"></div></div>
      </div>
      <div class="fa-onglets" id="fa-onglets"></div>
      <div class="fa-blanc fa-liste" id="fa-liste"></div>
    </section>

    <section id="section-apayer" class="section">
      <div class="fin-barre">
        <div class="fin-pills" id="ap-pills"></div>
        <button class="fa-btn" onclick="apOuvrir()">Ajouter un paiement prévu</button>
      </div>
      <div id="ap-liste"></div>
    </section>

    <section id="section-cloture" class="section">
      <div id="fc-zone"></div>
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

    </section><!-- /comptes -->


    <!-- ═══════════════════════════
         ENVELOPPES
         ═══════════════════════════ -->
    <section id="section-enveloppes" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Enveloppes</h1>
          <div class="page-subtitle">Répartition réelle de ton argent entre tes comptes virtuels</div>
        </div>
        <div class="page-header-right" style="display:flex;gap:8px;">
          <button class="btn btn-outline" onclick="syncQonto()"><i class="ti ti-refresh"></i> Sync Qonto</button>
          <button class="btn btn-primary" onclick="openVirementModal()"><i class="ti ti-arrows-transfer-up"></i> Nouveau virement</button>
        </div>
      </div>

      <div id="enveloppes-banner" style="margin-bottom:20px;"></div>
      <div id="fq-salaire" class="fa-creme fq-salaire"></div>
      <div id="enveloppes-grid" class="fa-blanc fin-liste"></div>

      <div class="card" style="margin-top:24px;">
        <div class="card-title"><i class="ti ti-history"></i> Historique des virements</div>
        <div id="virements-list"></div>
      </div>
    </section><!-- /enveloppes -->

    <!-- Modal objectif enveloppe -->
    <div class="modal-overlay" id="modal-objectif-env" style="display:none;">
      <div class="modal" style="max-width:380px;">
        <div class="modal-header">
          <div class="modal-title" id="modal-objectif-env-title">Fixer l'objectif</div>
          <button class="modal-close" onclick="q('#modal-objectif-env').style.display='none'"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="form-label">Objectif (€)</label>
            <input class="form-control" type="number" id="objectif-env-montant" min="0" step="1" placeholder="Ex: 1500">
          </div>
          <div style="font-size:12px;color:var(--text-2);background:var(--surface-2);border-radius:8px;padding:10px 12px;" id="objectif-env-hint"></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="q('#modal-objectif-env').style.display='none'">Annuler</button>
            <button class="btn btn-primary" id="btn-save-objectif-env" onclick="saveObjectifEnv()"><i class="ti ti-check"></i> Enregistrer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal virement -->
    <div class="modal-overlay" id="modal-virement" style="display:none;">
      <div class="modal" style="max-width:440px;">
        <div class="modal-header">
          <div class="modal-title">Nouveau virement</div>
          <button class="modal-close" onclick="closeVirementModal()"><i class="ti ti-x"></i></button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label class="form-label">De</label>
            <select class="form-control" id="virement-de"></select>
          </div>
          <div>
            <label class="form-label">Vers</label>
            <select class="form-control" id="virement-vers"></select>
          </div>
          <div>
            <label class="form-label">Montant (€)</label>
            <input class="form-control" type="number" id="virement-montant" min="0.01" step="0.01" placeholder="0,00">
          </div>
          <div>
            <label class="form-label">Date</label>
            <input class="form-control" type="date" id="virement-date">
          </div>
          <div>
            <label class="form-label">Motif</label>
            <input class="form-control" type="text" id="virement-motif" placeholder="Ex: Versement salaire juin">
          </div>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
            <button class="btn btn-outline" onclick="closeVirementModal()">Annuler</button>
            <button class="btn btn-primary" onclick="saveVirement()"><i class="ti ti-check"></i> Valider</button>
          </div>
        </div>
      </div>
    </div>


    <!-- ═══════════════════════════
         TRANSACTIONS
         ═══════════════════════════ -->
    <section id="section-transactions" class="section">
      <div id="fq-zone"></div>
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
          <select id="factures-filter-annee" class="form-select" style="width:auto;min-width:100px;">
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

      <div class="fin-barre">
        <div class="fin-pills" id="fac-pills">
          <button class="fin-onglet on" data-s="" onclick="finFactFiltre(this.dataset.s)">Toutes</button>
          <button class="fin-onglet" data-s="attente" onclick="finFactFiltre(this.dataset.s)">En attente</button>
          <button class="fin-onglet" data-s="retard" onclick="finFactFiltre(this.dataset.s)">En retard</button>
          <button class="fin-onglet" data-s="payee" onclick="finFactFiltre(this.dataset.s)">Payées</button>
        </div>
        <button class="fin-lien" id="fac-plus" onclick="finFactPlus()">Plus de filtres</button>
        <button class="fa-btn" onclick="openFactureModal()">Nouvelle facture</button>
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

      <!-- Tableau -->
      <div class="card mb-16">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Facture</th>
                <th>Client</th>
                <th>Émise</th>
                <th>Échéance</th>
                <th class="fin-droite">Montant HT</th>
                <th>État</th>
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
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Clients, fournisseurs, prestataires — avec CA encaissé par client.</p>
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

      <div class="fin-barre">
        <div class="fin-pills" id="tiers-pills">
          <button class="fin-onglet on" data-s="" onclick="fvFiltre(&quot;tiers&quot;,this.dataset.s)">Tous</button>
          <button class="fin-onglet" data-s="devis" onclick="fvFiltre(&quot;tiers&quot;,this.dataset.s)">Avec un devis en cours</button>
          <button class="fin-onglet" data-s="retard" onclick="fvFiltre(&quot;tiers&quot;,this.dataset.s)">En retard</button>
        </div>
        <button class="fa-btn" onclick="q(&quot;#btn-new-tiers&quot;).click()">Nouveau client</button>
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

      <div class="fa-blanc fin-liste" id="fv-clients"></div>
    </section><!-- /tiers -->


    <!-- ═══════════════════════════
         CRM PROSPECTION
         ═══════════════════════════ -->
    <section id="section-crm" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Prospection CRM</h1>
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Suivi de la prospection commerciale — contacts, relances et conversion.</p>
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

      <!-- KPIs -->
      <div class="kpi-grid kpi-grid-4 mb-16">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-users"></i></div>
          <span class="kpi-label">Contacts total</span>
          <span class="kpi-value" id="crm-kpi-total">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-thumb-up"></i></div>
          <span class="kpi-label">Taux de réponse</span>
          <span class="kpi-value" id="crm-kpi-reponse">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon violet"><i class="ti ti-trophy"></i></div>
          <span class="kpi-label">Taux de conversion</span>
          <span class="kpi-value" id="crm-kpi-conversion">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-clock"></i></div>
          <span class="kpi-label">En attente / relance</span>
          <span class="kpi-value" id="crm-kpi-attente">—</span>
        </div>
      </div>

      <!-- Relances à faire -->
      <div id="crm-relances-banner" class="card mb-16" style="display:none;border-left:4px solid var(--warning);">
        <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
          <i class="ti ti-bell" style="font-size:20px;color:var(--warning);"></i>
          <div id="crm-relances-banner-text" style="font-size:14px;"></div>
        </div>
      </div>

      <!-- Charts -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-title">Répartition par statut</div>
          <div style="position:relative;height:200px;">
            <canvas id="crm-chart-statuts" height="200"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-title">Contacts par secteur</div>
          <div style="position:relative;height:200px;">
            <canvas id="crm-chart-secteurs" height="200"></canvas>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Entreprise</th>
                <th>Secteur</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>1re relance</th>
                <th>2e relance</th>
                <th>Finale</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="crm-tbody"></tbody>
          </table>
        </div>
      </div>
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
            <div style="font-size:12px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Planning de relance</div>
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
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Devis signés = base contractuelle de tes projets et factures.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="devis-search" class="form-input" style="width:160px;" placeholder="Rechercher…" />
          <select id="devis-filter-annee" class="form-select" style="width:auto;min-width:100px;">
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
      <div class="fin-barre">
        <div class="fin-pills" id="devis-pills">
          <button class="fin-onglet on" data-s="" onclick="fvFiltre(&quot;devis&quot;,this.dataset.s)">Tous</button>
          <button class="fin-onglet" data-s="envoye" onclick="fvFiltre(&quot;devis&quot;,this.dataset.s)">Envoyés</button>
          <button class="fin-onglet" data-s="signe" onclick="fvFiltre(&quot;devis&quot;,this.dataset.s)">Signés</button>
          <button class="fin-onglet" data-s="refuse" onclick="fvFiltre(&quot;devis&quot;,this.dataset.s)">Refusés</button>
        </div>
        <button class="fa-btn" onclick="q(&quot;#btn-new-devis&quot;).click()">Nouveau devis</button>
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
                <th>Devis</th>
                <th>Client</th>
                <th>Envoyé</th>
                <th>Expire</th>
                <th class="fin-droite">Montant HT</th>
                <th>Où ça en est</th>
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
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Suivi de facturation par projet — acomptes, jalons, mensuel.</p>
        </div>
        <div class="page-header-right">
          <input type="text" id="projets-search" class="form-input" style="width:140px;" placeholder="Rechercher…" />
          <select id="projets-filter-client" class="form-select" style="width:160px;">
            <option value="">Tous clients</option>
          </select>
          <select id="projets-filter-annee" class="form-select" style="width:auto;min-width:100px;">
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
      <div id="fv-guide"></div>
      <div class="fin-barre">
        <div class="fin-pills" id="projets-pills">
          <button class="fin-onglet on" data-s="" onclick="fvFiltre(&quot;projets&quot;,this.dataset.s)">En cours</button>
          <button class="fin-onglet" data-s="termine" onclick="fvFiltre(&quot;projets&quot;,this.dataset.s)">Terminés</button>
        </div>
        <button class="fa-btn" onclick="q(&quot;#btn-new-projet&quot;).click()">Nouveau projet</button>
      </div>
      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-folders"></i></div>
          <span class="kpi-label">Projets en cours</span>
          <span class="kpi-value" id="proj-kpi-actifs">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-file-invoice"></i></div>
          <span class="kpi-label">CA contractualisé</span>
          <span class="kpi-value" id="proj-kpi-contrat">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-check"></i></div>
          <span class="kpi-label">CA facturé</span>
          <span class="kpi-value green" id="proj-kpi-facture">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-clock"></i></div>
          <span class="kpi-label">Reste à facturer</span>
          <span class="kpi-value warning" id="proj-kpi-reste">—</span>
        </div>
      </div>
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
            <option value="Prestataires">Prestataires</option>
            <option value="Impôts et taxes">Impôts et taxes</option>
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
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Logiciels, mutuelle, loyer bureau, abonnements récurrents — tout ce qui est prélevé chaque mois.</p>
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
      <div class="fa-blanc fin-liste" id="abonnements-liste"></div>
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
          <h1>Objectifs d'épargne</h1>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" id="btn-new-objectif-epargne"><i class="ti ti-plus"></i> Nouvel objectif</button>
        </div>
      </div>
      <div class="goals-grid" id="epargne-goals-grid"></div>
    </section><!-- /objectifs-epargne -->


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
          <h1>Simulateur de versement</h1>
          <div class="page-subtitle">Calcul net après cotisations et charges</div>
        </div>
      </div>

      <div class="sim-tabs">
        <button class="sim-tab active" data-sim="mensuel">Mensuel</button>
        <button class="sim-tab" data-sim="trimestriel">Trimestriel</button>
        <button class="sim-tab" data-sim="annuel">Annuel</button>
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
              <p style="font-size:11px;margin-top:6px;opacity:0.6;">Colonnes : date, numero, client, description, montant, statut</p>
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
              <p style="font-size:11px;margin-top:6px;opacity:0.6;">Colonnes : date, description, categorie, montant</p>
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
          <p style="font-size:13px;color:var(--text-2);margin-bottom:16px;">Télécharger vos données en CSV.</p>
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
      <div class="fa-blanc fq-regles" id="fq-regles"></div>

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
            <span style="font-size:12px;color:var(--text-2);">Cotisations sociales micro-BNC (25,6% par défaut 2026)</span>
          </div>
          <div class="form-group">
            <label class="form-label">Taux CFP (%)</label>
            <input type="number" id="opt-cfp" class="form-input" value="0.2" step="0.01" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Contribution à la Formation Professionnelle (0,2%)</span>
          </div>
          <div class="form-group">
            <label class="form-label">PAS mensuel (€)</label>
            <input type="number" id="opt-pas" class="form-input" value="40" step="1" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Prélèvement à la Source — impôt prélevé automatiquement chaque mois par les impôts (montant sur ton avis d'imposition)</span>
          </div>
          <div class="form-group">
            <label class="form-label">CFE annuelle (€)</label>
            <input type="number" id="opt-cfe" class="form-input" value="0" step="10" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Cotisation Foncière des Entreprises — prélevée en décembre, répartie sur 12 mois dans les calculs</span>
          </div>
          <div class="form-group">
            <label class="form-label">Délai de paiement factures (jours)</label>
            <input type="number" id="opt-delai-paiement" class="form-input" value="30" step="1" min="1" />
            <span style="font-size:12px;color:var(--text-2);">Pré-remplit automatiquement la date d'échéance à J+ ce délai lors de la création d'une facture</span>
          </div>
          <div class="form-group">
            <label class="form-label">Solde Qonto initial (€)</label>
            <input type="number" id="opt-qonto-solde-initial" class="form-input" value="0" step="0.01" />
            <span style="font-size:12px;color:var(--text-2);">Solde du compte Qonto Pro à la date de départ ci-dessous</span>
          </div>
          <div class="form-group">
            <label class="form-label">Date de départ du calcul Qonto</label>
            <input type="date" id="opt-qonto-date-debut" class="form-input" value="2026-01-01" />
          </div>
          <div class="form-group">
            <label class="form-label">Enveloppe Formation (% du net après charges)</label>
            <input type="number" id="opt-pct-formation" class="form-input" value="10" min="0" max="100" step="1" />
            <span style="font-size:12px;color:var(--text-2);">Le reste est réparti entre trésorerie, versement et épargne selon tes pourcentages ci-dessous</span>
          </div>
        </div>

        <!-- Seuils : rien en dur, valeurs légales à confirmer avec la comptable -->
        <div class="card">
          <div class="card-title">Seuils et objectifs</div>
          <div class="form-group">
            <label class="form-label">Seuil de franchise de TVA (€)</label>
            <input type="number" id="opt-seuil-tva" class="form-input" value="37500" step="100" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Alerte si la projection de l’année le dépasse. Valeur à confirmer avec ta comptable.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Plafond micro-entreprise (€)</label>
            <input type="number" id="opt-plafond-micro" class="form-input" value="77700" step="100" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Valeur à confirmer avec ta comptable.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Seuil du coussin (mois de charges fixes)</label>
            <input type="number" id="opt-seuil-coussin" class="form-input" value="3" step="0.5" min="0" />
            <span style="font-size:12px;color:var(--text-2);">Alerte si l’enveloppe Trésorerie couvre moins de mois que ce seuil.</span>
          </div>
          <p style="font-size:13px;color:var(--text-2);margin:0;">L’objectif annuel se règle dans Profil, la part trésorerie en % dans la répartition.</p>
        </div>

        <!-- Charges fixes -->
        <div class="card">
          <div class="card-title"><i class="ti ti-repeat"></i> Charges fixes mensuelles</div>
          <p style="font-size:13px;color:var(--text-2);margin:0 0 12px;">Logiciels, mutuelle, loyer bureau, abonnements récurrents… Gère-les dans l'onglet dédié pour qu'ils soient inclus dans tes calculs.</p>
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
          <div id="opt-total-alerte" style="font-size:13px;"></div>
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
      <span style="font-size:12px;color:var(--text-2);">Client non listé ? <a href="#" onclick="navigate('tiers');closeModal('modal-facture');return false;">Ajouter un tiers</a></span>
    </div>
    <div class="form-group">
      <label class="form-label">Projet lié <span style="font-weight:400;color:var(--text-2);">(optionnel)</span></label>
      <select id="f-projet-id" class="form-select" oninput="onFactureProjetChange()">
        <option value="">— Aucun projet —</option>
      </select>
      <!-- Bloc contextuel devis + avancement -->
      <div id="f-projet-context" style="display:none;margin-top:8px;padding:10px 12px;background:#f5f3ef;border-radius:8px;border-left:3px solid #BAD1FD;font-size:12px;line-height:1.7;"></div>
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
          <span style="font-size:12px;color:var(--text-2);white-space:nowrap;">jours après émission</span>
        </div>
        <input type="date" id="f-date-echeance" class="form-input" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Date de paiement réel</label>
      <input type="date" id="f-date-paiement" class="form-input" />
      <span style="font-size:11px;color:var(--text-2);">À remplir quand tu reçois le virement · utilisée pour le calcul URSSAF</span>
    </div>
    <div class="form-group">
      <label class="form-label">PDF (facture Indy)</label>
      <div style="display:flex;align-items:center;gap:10px;">
        <button type="button" class="pdf-btn vide" id="f-pdf-btn">
          <i class="ti ti-paperclip"></i> Attacher un PDF
        </button>
        <span id="f-pdf-name" style="font-size:12px;color:var(--text-2);"></span>
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
      <span style="font-size:12px;color:var(--text-2);">Sélectionne un devis signé pour pré-remplir le montant.</span>
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
          <label style="display:flex;align-items:center;gap:6px;white-space:nowrap;font-size:13px;cursor:pointer;">
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
        <input type="text" id="pr-montant-mois" class="form-input" readonly style="background:#f5f3ef;color:#6B6B6B;" placeholder="—" />
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
          <option value="signe">Signé ✓</option>
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
        <span style="font-size:11px;color:var(--text-2);">Pré-remplie à J+30</span>
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
        <span id="dv-pdf-name" style="font-size:12px;color:var(--text-2);"></span>
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
      <p style="font-size:12px;color:var(--text-2);margin-bottom:12px;">Une entrée sera créée par mois entre ces deux dates.</p>
    </div>
    <div class="form-group">
      <label class="form-label">Catégorie</label>
      <select id="d-categorie" class="form-select">
        <option>Charges sociales</option>
        <option>Logiciels &amp; abonnements</option>
        <option>Matériel</option>
        <option>Formation</option>
        <option>Communication</option>
        <option>Déplacement</option>
        <option>Comptabilité</option>
        <option>Prestataires</option>
        <option>Impôts et taxes</option>
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
<div id="modal-apayer" class="modal-overlay">
  <div class="modal ap-modal">
    <div class="modal-header">
      <span class="modal-title" id="ap-titre">Nouveau paiement prévu</span>
      <button class="modal-close" data-close-modal="modal-apayer" aria-label="Fermer"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label" for="ap-desc">C’est quoi</label>
      <input type="text" id="ap-desc" class="form-input" placeholder="Photos pour Maison Verte, écran, formation…" />
    </div>
    <div class="form-group">
      <span class="form-label">Type</span>
      <div class="ap-seg" id="ap-genre">
        <button type="button" data-v="prestataire" onclick="apSeg(&quot;ap-genre&quot;,this.dataset.v)">Prestataire</button>
        <button type="button" data-v="materiel" onclick="apSeg(&quot;ap-genre&quot;,this.dataset.v)">Matériel</button>
        <button type="button" data-v="outil" onclick="apSeg(&quot;ap-genre&quot;,this.dataset.v)">Outil</button>
        <button type="button" data-v="charge" onclick="apSeg(&quot;ap-genre&quot;,this.dataset.v)">Charge</button>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group"><label class="form-label" for="ap-total">Montant total</label><input type="number" id="ap-total" class="form-input" step="0.01" min="0" placeholder="1200" oninput="apApercu()" /></div>
      <div class="form-group"><label class="form-label" for="ap-date">Premier paiement le</label><input type="date" id="ap-date" class="form-input" oninput="apApercu()" /></div>
    </div>
    <div class="form-group">
      <span class="form-label">Acompte</span>
      <div class="ap-seg" id="ap-acompte">
        <button type="button" data-v="aucun" onclick="apAcompte(this.dataset.v)">Aucun</button>
        <button type="button" data-v="30" onclick="apAcompte(this.dataset.v)">30 %</button>
        <button type="button" data-v="50" onclick="apAcompte(this.dataset.v)">50 %</button>
        <button type="button" data-v="autre" onclick="apAcompte(this.dataset.v)">Autre</button>
      </div>
      <div id="ap-acompte-autre" class="ap-mt" style="display:none"><input type="number" id="ap-acompte-m" class="form-input ap-court" step="0.01" min="0" placeholder="Montant de l’acompte" aria-label="Montant de l’acompte" oninput="apApercu()" /></div>
    </div>
    <div class="form-group">
      <label class="form-label" for="ap-mois">Le reste en combien de mois</label>
      <input type="number" id="ap-mois" class="form-input ap-court" min="1" max="36" step="1" value="1" oninput="apApercu()" />
      <span class="fin-cl__s">un paiement par mois, le même jour que le premier</span>
    </div>
    <div class="ap-apercu" id="ap-apercu"></div>
    <div class="form-group">
      <label class="form-label" for="ap-fichier">Facture du prestataire</label>
      <input type="file" id="ap-fichier" class="form-input" accept="application/pdf,image/*" />
      <span class="fin-cl__s" id="ap-fichier-nom"></span>
      <span class="fin-cl__s">Tu n’as qu’un devis pour l’instant ? Joins-le, tu mettras chaque facture sur sa ligne quand elle arrive.</span>
    </div>
    <div class="form-group" id="ap-res-bloc">
      <span class="form-label">Réserver l’argent</span>
      <label class="ap-opt"><input type="radio" name="ap-res" id="ap-res-now" /><span><b>Tout de suite, depuis Qonto</b><span class="fin-cl__s" id="ap-res-txt"></span></span></label>
      <label class="ap-opt"><input type="radio" name="ap-res" id="ap-res-fil" /><span><b>Au fil de mes paiements clients</b><span class="fin-cl__s">à chaque paiement, la Trésorerie te propose d’en réserver une part</span></span></label>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="ap-suppr" onclick="apSupprimer()">Supprimer</button>
      <button class="btn btn-ghost" data-close-modal="modal-apayer">Annuler</button>
      <button class="btn btn-primary" onclick="apEnregistrer()">Enregistrer</button>
    </div>
  </div>
</div>
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
    <p id="modal-urssaf-detail" style="font-size:13px;color:var(--text-2);margin-bottom:16px;"></p>
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
    <p id="confirm-msg" style="font-size:13.5px;color:var(--text-2);margin-bottom:8px;"></p>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="confirm-cancel">Annuler</button>
      <button class="btn btn-danger" id="confirm-ok">Supprimer</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="toast"></div>

<script src="/app.js"></script>
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
  --bg:         #F8F8F6;
  --surface:    #FFFFFF;
  --surface-2:  #F2F2EF;
  --cream:      #EFE1B0;
  --navy:       #051833;
  --blue:       #BAD1FD;
  --violet:     #E4D1FE;
  --brown:      #412F21;
  --success:    #4CAF82;
  --warning:    #E8A838;
  --danger:     #E85454;
  --text:       #1A1A1A;
  --text-2:     #6B6B6B;
  --border:     #E8E8E4;

  --blue-10:    rgba(186,209,253,0.15);
  --violet-10:  rgba(228,209,254,0.15);
  --success-10: rgba(76,175,130,0.12);
  --warning-10: rgba(232,168,56,0.12);
  --danger-10:  rgba(232,84,84,0.10);
  --navy-10:    rgba(5,24,51,0.08);
  --cream-10:   rgba(239,225,176,0.25);
}

/* ===========================
   RESET
   =========================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Scrollbar fine */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #d0d0cc; }

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
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-2);
  margin-top: 2px;
  display: block;
}

.login-error {
  background: var(--danger-10);
  border: 1px solid rgba(232,84,84,0.25);
  border-radius: 8px;
  color: var(--danger);
  font-size: 13px;
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
  width: 240px;
  min-width: 240px;
  background: var(--bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-logo {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
}
.sidebar-logo .logo-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--navy);
  display: block;
  line-height: 1.2;
}
.sidebar-logo .logo-sub {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-2);
  margin-top: 2px;
  display: block;
}

/* Groupes de navigation */
.nav-group {
  padding: 12px 0 2px;
}
.nav-group-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-2);
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
  color: var(--text-2);
  font-size: 13px;
  font-weight: 400;
  border-left: 2px solid transparent;
  transition: all 0.12s ease;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}
.nav-item:hover {
  color: var(--text);
  background: var(--surface-2);
}
.nav-item.active {
  color: var(--navy);
  font-weight: 500;
  border-left-color: var(--blue);
  background: rgba(186,209,253,0.15);
}
.nav-item .ti {
  font-size: 15px;
  flex-shrink: 0;
  opacity: 0.65;
}
.nav-item.active .ti {
  opacity: 1;
  color: var(--navy);
}

/* Bas de sidebar — profil */
.sidebar-footer {
  margin-top: auto;
  padding: 14px 20px 16px;
  border-top: 1px solid var(--border);
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
  background: var(--navy);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.user-info .user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.2;
}
.user-info .user-company {
  font-size: 11px;
  color: var(--text-2);
}
.btn-logout {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 12px;
  color: var(--text-2);
  background: transparent;
  border: 1px solid var(--border);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.12s;
  width: 100%;
}
.btn-logout:hover {
  color: var(--danger);
  border-color: rgba(232,84,84,0.3);
  background: var(--danger-10);
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
  font-size: 13px;
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
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}
.card-cream {
  background: var(--cream-10);
  border-color: rgba(239,225,176,0.5);
}
.card-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.card-title .ti { font-size: 14px; }

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
.kpi-icon.blue   { background: var(--blue-10);    color: #4a78d9; }
.kpi-icon.violet { background: var(--violet-10);  color: #8e68d5; }
.kpi-icon.green  { background: var(--success-10); color: var(--success); }
.kpi-icon.orange { background: var(--warning-10); color: var(--warning); }
.kpi-icon.red    { background: var(--danger-10);  color: var(--danger); }
.kpi-icon.navy   { background: var(--navy-10);    color: var(--navy); }
.kpi-icon.cream  { background: var(--cream-10);   color: var(--brown); }

.kpi-label {
  font-size: 11px;
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
  font-size: 32px;
  font-weight: 500;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 4px;
  display: block;
}
.kpi-value.blue    { color: #3b6dd4; }
.kpi-value.green   { color: var(--success); }
.kpi-value.danger  { color: var(--danger); }
.kpi-value.violet  { color: #7c5cbf; }
.kpi-value.warning { color: var(--warning); }

.kpi-sub {
  font-size: 12px;
  color: var(--text-2);
  display: block;
}
.kpi-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 20px;
  font-size: 11px;
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
  font-size: 11px;
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
  font-size: 13.5px;
  vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--surface-2); }

.td-mono {
  font-size: 12px;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}
.td-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--navy);
  white-space: nowrap;
}
.td-muted {
  color: var(--text-2);
  font-size: 13px;
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
  font-size: 11.5px;
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
.badge-payee     { background: var(--success-10); color: #2d8b5e; }
.badge-attente   { background: var(--warning-10); color: #9a6010; }
.badge-en-attente { background: var(--warning-10); color: #9a6010; }
.badge-retard    { background: var(--danger-10);  color: #c43030; }
.badge-en-retard { background: var(--danger-10);  color: #c43030; }
/* Abonnements */
.badge-actif     { background: var(--success-10); color: #2d8b5e; }
.badge-pause     { background: var(--warning-10); color: #9a6010; }
.badge-annule    { background: var(--surface-2);  color: var(--text-2); border: 1px solid var(--border); }
/* URSSAF */
.badge-a-venir   { background: var(--blue-10);    color: #3b6dd4; }
.badge-a-payer   { background: var(--warning-10); color: #9a6010; }
.badge-paye      { background: var(--success-10); color: #2d8b5e; }
/* Génériques */
.badge-neutral   { background: var(--surface-2);  color: var(--text-2); border: 1px solid var(--border); }
.badge-blue      { background: var(--blue-10);    color: #3b6dd4; }
.badge-violet    { background: var(--violet-10);  color: #7c5cbf; }
.badge-success   { background: var(--success-10); color: #2d8b5e; }
.badge-warning   { background: var(--warning-10); color: #9a6010; }
.badge-danger    { background: var(--danger-10);  color: #c43030; }

/* ===========================
   BOUTONS
   =========================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.12s ease;
  white-space: nowrap;
  text-decoration: none;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(186,209,253,0.4);
}

.btn-primary { background: var(--navy); color: #fff; }
.btn-primary:hover { background: #0b2d53; }

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
  border: 1px solid rgba(232,84,84,0.2);
}
.btn-danger:hover { background: rgba(232,84,84,0.18); }

.btn-success {
  background: var(--success-10);
  color: #2d8b5e;
  border: 1px solid rgba(76,175,130,0.2);
}

.btn-sm  { padding: 6px 12px; font-size: 12px; border-radius: 7px; }
.btn-xs  { padding: 4px 9px;  font-size: 11px; border-radius: 6px; }
.btn-icon { padding: 6px; border-radius: 6px; }

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
  font-size: 11px;
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
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;
  width: 100%;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(186,209,253,0.2);
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
  font-size: 12px;
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
  font-size: 13px;
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
  font-size: 12px;
  color: var(--text-2);
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.progress-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
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
  border-color: rgba(232,84,84,0.4);
  background: rgba(232,84,84,0.04);
}
.urssaf-card.alerte-orange {
  border-color: rgba(232,168,56,0.4);
  background: rgba(232,168,56,0.05);
}
.urssaf-card.paye {
  border-color: rgba(76,175,130,0.35);
  background: rgba(76,175,130,0.04);
}

.urssaf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.urssaf-titre {
  font-size: 14px;
  font-weight: 600;
  color: var(--navy);
}
.urssaf-echeance {
  font-size: 11px;
  color: var(--text-2);
  margin-top: 2px;
}
.urssaf-montant {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
  font-weight: 500;
  color: var(--navy);
  margin: 6px 0 4px;
}
.urssaf-detail {
  font-size: 12px;
  color: var(--text-2);
  margin-bottom: 10px;
}
.urssaf-countdown {
  font-size: 12px;
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
  font-size: 14px;
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
  font-size: 22px;
  font-weight: 500;
  color: var(--navy);
}
.goal-target { font-size: 12px; color: var(--text-2); }
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
.goal-pct { font-size: 11px; color: var(--text-2); }
.goal-date { font-size: 11px; color: var(--text-2); margin-top: 4px; }

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
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-2);
  background: transparent;
  border: none;
  font-family: 'DM Sans', sans-serif;
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
  font-size: 13.5px;
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
.sim-total { background: rgba(5,24,51,0.03); }
.sim-total .sim-line-label { color: var(--navy); font-weight: 600; }
.sim-total .sim-line-amount { font-size: 24px; color: var(--navy); }
.sim-section-label {
  font-size: 10px;
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
.slider-label { font-size: 13px; color: var(--text-2); }
.slider-value { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: var(--navy); }

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
.scenario-card.optimiste { border-color: rgba(76,175,130,0.3); background: var(--success-10); }
.scenario-card.realiste  { border-color: rgba(5,24,51,0.2);   background: var(--blue-10); }
.scenario-card.pessimiste{ border-color: rgba(232,168,56,0.3); background: var(--warning-10); }
.scenario-label { font-size: 12px; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
.scenario-ca    { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: var(--navy); }
.scenario-sub   { font-size: 12px; color: var(--text-2); margin-top: 2px; }

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
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2);
  margin-bottom: 10px;
}
.rep-recommande {
  font-size: 12px;
  color: var(--text-2);
  margin-bottom: 4px;
}
.rep-recommande span {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  color: var(--navy);
  font-weight: 500;
}
.rep-actuel-label { font-size: 11px; color: var(--text-2); margin-top: 10px; margin-bottom: 4px; }
.rep-ecart { font-size: 12px; margin-top: 6px; }
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
.file-drop p { font-size: 13px; }
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
  font-size: 12px;
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
  font-size: 13px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
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
  font-size: 11px;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: all 0.12s;
  font-family: 'DM Sans', sans-serif;
}
.pdf-btn.vide    { color: var(--text-2); background: var(--surface-2); border: 1px solid var(--border); }
.pdf-btn.present { color: #3b6dd4;       background: var(--blue-10);   border: 1px solid rgba(186,209,253,0.4); }
.pdf-btn.vide:hover    { background: var(--border); }
.pdf-btn.present:hover { background: rgba(186,209,253,0.3); }

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
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
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
.pot-nom { font-size: 13px; font-weight: 600; color: var(--navy); }
.pot-icon { font-size: 22px; margin-bottom: 6px; }
.pot-solde {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 500;
  margin: 2px 0 4px;
}
.pot-sub { font-size: 11px; color: var(--text-2); margin-bottom: 10px; }
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
.compte-nom { font-size: 14px; font-weight: 600; color: var(--navy); }
.compte-solde {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px;
  font-weight: 500;
  color: var(--navy);
  margin: 4px 0 6px;
}
.compte-upd { font-size: 11px; color: var(--text-2); }
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
  font-size: 12px;
  color: var(--text-2);
}
.compte-historique-item:last-child { border-bottom: none; }

/* ===========================
   RAPPORT MENSUEL — phrase auto
   =========================== */
.rapport-phrase {
  background: var(--cream-10);
  border: 1px solid rgba(239,225,176,0.6);
  border-radius: 10px;
  padding: 16px 20px;
  font-size: 14px;
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
  font-size: 13px;
  margin-bottom: 16px;
}
.alert.danger  { background: var(--danger-10);  color: #c43030; border: 1px solid rgba(232,84,84,0.2); }
.alert.warning { background: var(--warning-10); color: #9a6010; border: 1px solid rgba(232,168,56,0.2); }
.alert.success { background: var(--success-10); color: #2d8b5e; border: 1px solid rgba(76,175,130,0.2); }
.alert.info    { background: var(--blue-10);    color: #2c5aad; border: 1px solid rgba(186,209,253,0.4); }

/* ===========================
   SKELETON LOADERS
   =========================== */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--surface-2) 25%, #e8e8e3 50%, var(--surface-2) 75%);
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
  font-size: 13px;
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
.empty-state p  { font-size: 13px; }

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
  font-size: 20px;
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
  font-size: 13.5px;
}
.charges-recap-line:last-child { border-bottom: none; }
.charges-recap-label { color: var(--text-2); }
.charges-recap-amount {
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
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
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 6px;
}
.result-card-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 26px;
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
/* =============================================
   REFONTE : la direction artistique de l'espace client du dashboard
   (charte-dashboard-stb). Les jetons historiques sont remappés sur la
   palette ; pas de rouge ni de vert, le Mandarine seulement pour alerter.
   ============================================= */
:root {
  --bg:#F8F6F2; --surface:#FFFFFF; --surface-2:#F0EBE2; --cream:#F0E9D6;
  --navy:#110704; --blue:#C5DEFF; --violet:#F0E9D6; --brown:#5A2A11;
  --success:#110704; --warning:#CD8F6E; --danger:#5A2A11;
  --text:#110704; --text-2:rgba(17,7,4,.62); --border:#e9e5dc;
  --blue-10:rgba(197,222,255,.35); --violet-10:rgba(240,233,214,.6); --success-10:rgba(17,7,4,.06);
  --warning-10:rgba(205,143,110,.16); --danger-10:rgba(205,143,110,.16); --navy-10:rgba(17,7,4,.06); --cream-10:rgba(240,233,214,.5);
}
html, body { font-family:'Inter Tight', ui-sans-serif, system-ui, sans-serif; font-size:15px; }
#main [class*="label"], #main .card-title, #main th, #main .page-subtitle { text-transform:none !important; letter-spacing:0 !important; }
.page-header h1 { font-family:'Cormorant Garamond', serif; font-weight:400; font-size:48px; line-height:1.05; letter-spacing:-.01em; }
.card { border:none; border-radius:18px; box-shadow:0 0 0 1px rgba(17,7,4,.07), 0 2px 6px rgba(17,7,4,.08); }

/* Menu */
#sidebar { width:248px; min-width:248px; background:#110704; border-right:none; padding:28px 12px 20px; }
.sidebar-logo { padding:0 14px 26px; border-bottom:none; }
.sidebar-logo .logo-name { font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:400; font-size:34px; line-height:.95; color:#F8F6F2; }
.sidebar-logo .logo-sub { font-size:15px; letter-spacing:0; text-transform:none; color:rgba(248,246,242,.72); margin-top:8px; }
.nav-group { padding:0; display:flex; flex-direction:column; gap:2px; }
.nav-group-label { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:22px; font-weight:400; letter-spacing:0; text-transform:none; color:#E6E5B2; padding:0 14px 6px; }
.nav-item { justify-content:space-between; padding:9px 14px; border-left:none; border-radius:10px; color:rgba(248,246,242,.82); font-size:15px; }
.nav-item:hover { background:rgba(248,246,242,.08); color:#F8F6F2; }
.nav-item.active { background:rgba(248,246,242,.12); color:#F8F6F2; font-weight:600; }
.nav-pastille:empty { display:none; }
.nav-pastille { min-width:20px; height:20px; padding:0 6px; border-radius:999px; background:#CD8F6E; color:#3d1c0b; font-size:12px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; }
.sidebar-footer { border-top:none; padding:0; display:flex; flex-direction:column; gap:10px; }
.nav-item--bas { font-size:15px; }
.sidebar-synchro { padding:0 14px; font-size:14px; color:rgba(248,246,242,.6); line-height:1.5; }

/* Onglets en pilules, en haut des écrans regroupés */
.fin-onglets { display:flex; flex-wrap:wrap; gap:10px; margin:0 0 26px; }
.fin-onglet { border:none; cursor:pointer; padding:9px 18px; border-radius:999px; font-family:'Inter Tight', sans-serif; font-size:15px; font-weight:500; background:#fff; color:#110704; box-shadow:inset 0 0 0 1px #e3ded3; }
.fin-onglet:hover { box-shadow:inset 0 0 0 1px #110704; }
.fin-onglet.on { background:#110704; color:#F8F6F2; font-weight:600; box-shadow:none; }
.fin-onglet:focus-visible, .fa-btn:focus-visible { outline:2px solid #110704; outline-offset:2px; }

/* Aujourd'hui */
.section { padding:44px 56px 60px; }
.fa-titre { font-family:'Cormorant Garamond', serif; font-weight:400; font-size:58px; line-height:1; letter-spacing:-.01em; margin:0; }
.fa-sous { margin:10px 0 0; font-size:17px; }
.fa-cartes { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:20px; margin-top:30px; }
.fa-creme { background:#F0E9D6; border-radius:18px; padding:24px 26px; display:flex; flex-direction:column; justify-content:space-between; gap:22px; min-width:0; }
.fa-creme b { display:block; margin-top:4px; font-family:'Cormorant Garamond', serif; font-weight:400; font-size:32px; line-height:1.15; }
.fa-creme b.fa-gros { font-size:44px; }
.fa-k { display:block; font-size:14px; color:#5A2A11; }
.fa-k--f { margin-top:6px; color:#3b2a20; }
.fa-btn { align-self:flex-start; border:none; cursor:pointer; background:#110704; color:#F8F6F2; border-radius:999px; padding:10px 20px; font-family:'Inter Tight', sans-serif; font-size:14px; font-weight:600; white-space:nowrap; }
.fa-btn--c { background:transparent; color:#110704; box-shadow:inset 0 0 0 1px #110704; }
.fa-btn--c:hover { background:#110704; color:#F8F6F2; }
.fa-blanc { background:#fff; border-radius:18px; box-shadow:0 0 0 1px rgba(17,7,4,.07), 0 2px 6px rgba(17,7,4,.08); padding:24px 26px; min-width:0; }
.fa-k2 { font-size:14px; color:#7a5540; }
.fa-gros2 { font-family:'Cormorant Garamond', serif; font-size:44px; line-height:1; margin-top:6px; }
.fa-gros2 em { font-style:normal; font-size:19px; color:#7a5540; }
.fa-tirets { display:flex; gap:4px; margin:12px 0 10px; }
.fa-tirets i { flex:1; height:6px; border-radius:99px; background:#e6e0d4; }
.fa-tirets i.on { background:#110704; } .fa-tirets i.on.r { background:#CD8F6E; }
.fa-p { margin:0; font-size:14px; color:#3b2a20; }
.fa-deux { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); gap:20px; margin-top:22px; align-items:start; }
.fa-h2 { margin:0 0 6px; font-family:'Cormorant Garamond', serif; font-weight:400; font-size:28px; }
.fa-seuil { padding:14px 0; border-top:1px solid #efeae1; }
.fa-seuil__h { display:flex; justify-content:space-between; gap:12px; font-size:15px; }
.fa-seuil__h > span:first-child { font-weight:500; }
.fa-n { font-variant-numeric:lining-nums tabular-nums; }
.fa-mut { color:rgba(17,7,4,.55); }
.fa-barre { height:8px; border-radius:99px; background:#efeae1; margin:10px 0 8px; overflow:hidden; }
.fa-barre i { display:block; height:8px; border-radius:99px; background:#110704; } .fa-barre i.r { background:#CD8F6E; }
.fa-seuil__t { font-size:14px; color:rgba(17,7,4,.64); } .fa-seuil__t.r { color:#5A2A11; font-weight:600; }
.fa-note { margin:8px 0 0; font-size:13px; color:rgba(17,7,4,.5); }
.fa-l { display:flex; justify-content:space-between; gap:12px; padding:11px 0; border-top:1px solid #efeae1; font-size:15px; }
.fa-l--f { font-weight:600; }
.fa-onglets { display:flex; gap:10px; margin-top:34px; }
.fa-liste { margin-top:18px; padding:6px 30px; }
.fa-ligne { display:grid; grid-template-columns:minmax(0,1fr) 130px 110px 150px; gap:18px; align-items:center; padding:16px 0; border-top:1px solid #efeae1; }
.fa-ligne:first-child { border-top:none; }
.fa-ligne__t { font-family:'Cormorant Garamond', serif; font-size:23px; line-height:1.2; }
.fa-ligne__s { font-size:14px; color:rgba(17,7,4,.58); margin-top:2px; }
.fa-ligne__m { text-align:right; font-size:16px; }
.fa-ligne__a { text-align:right; }
.fa-pas { display:inline-block; padding:4px 11px; border-radius:999px; font-size:13px; font-weight:600; white-space:nowrap; }
.fa-p-r { background:#CD8F6E; color:#3d1c0b; } .fa-p-m { background:#110704; color:#E6E5B2; } .fa-p-a { background:#C5DEFF; color:#3f5f8c; }
.fa-vide { margin:18px 0; font-size:15px; color:rgba(17,7,4,.58); }
@media (max-width: 900px) {
  .section { padding:26px 18px 40px; }
  .fa-titre { font-size:42px; }
  .fa-cartes, .fa-deux { grid-template-columns:1fr; }
  .fa-creme .fa-btn { align-self:stretch; padding:14px; }
  .fa-liste { padding:6px 20px; }
  .fa-ligne { grid-template-columns:minmax(0,1fr) auto; }
  .fa-ligne__m, .fa-ligne__a { display:none; }
}

/* Étape 2 : en-têtes de groupe, listes en lignes, tableaux dans une carte blanche */
.section.fin-h .page-header-left { display:none; }
.section.fin-h .page-header { margin:0 0 16px; justify-content:flex-end; }
.section.fin-h .page-header-right:empty { display:none; }
.fin-hero { margin-bottom:34px; }
.fin-hero .fa-cartes { margin-top:30px; }
.fa-cartes--2 { grid-template-columns:minmax(0,2fr) minmax(0,1fr); }
.fa-pile { display:flex; flex-direction:column; gap:20px; min-width:0; }
.fa-etsi__n { margin:0 0 16px; }
.fa-etsi__c { display:flex; flex-direction:column; align-items:flex-start; gap:10px; }
.fa-etsi__r { margin:18px 0 0; padding-top:18px; border-top:1px solid #efeae1; font-size:15px; line-height:1.55; }
.fin-bt { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; }
.fin-bt > div:first-child { flex:1 1 420px; min-width:0; }
#section-rapport-annuel.fin-h .page-header::before { content:'Le détail, mois par mois'; font:400 28px 'Cormorant Garamond', serif; margin-right:auto; }
#section-rapport-mensuel.fin-h .page-header::before { content:'Le détail d’un autre mois'; font:400 28px 'Cormorant Garamond', serif; margin-right:auto; }
.fin-bt__d { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.fin-bt__d .fa-btn { margin-left:14px; }
#section-rapport-annuel .fin-onglets, #section-rapport-mensuel .fin-onglets { display:none; }
.fin-b3 { grid-template-columns:repeat(3, minmax(0,1fr)); }
.fin-bp { margin-top:10px; }
.fin-bg { margin-top:22px; padding:28px 34px; }
.fin-bg__h { display:flex; justify-content:space-between; align-items:baseline; gap:16px; flex-wrap:wrap; }
.fin-bg__h .fa-mut { font-size:14px; }
.fin-bars { position:relative; display:flex; align-items:flex-end; gap:12px; height:330px; margin-top:18px; }
.fin-bars::before { content:''; position:absolute; left:0; right:0; bottom:calc(28px + var(--obj)); border-top:1px dashed #CD8F6E; }
.fin-bc { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; position:relative; height:100%; }
.fin-bc i { display:block; width:min(48px, 70%); border-radius:8px 8px 3px 3px; background:#DCD1C9; position:relative; z-index:1; }
.fin-bc i.n { background:#110704; } .fin-bc i.c { background:#C5DEFF; }
.fin-bc__v { font-size:12px; color:rgba(17,7,4,.6); margin-bottom:6px; min-height:15px; white-space:nowrap; }
.fin-bc__m { font-size:12px; color:rgba(17,7,4,.6); margin-top:8px; height:20px; white-space:nowrap; }
.fin-bc--c .fin-bc__m { color:#110704; font-weight:600; }
.fin-bl { display:grid; grid-template-columns:minmax(0,1fr) auto 120px; gap:24px; align-items:baseline; padding:14px 0; border-top:1px solid #efeae1; font-size:16px; }
.fin-bl .fa-n { text-align:right; }
.fa-h2 + .fin-bl { border-top:none; }
#section-rapport-annuel.fin-h .page-header, #section-rapport-mensuel.fin-h .page-header { justify-content:flex-start; }
@media (max-width: 900px) {
  .fin-b3 { grid-template-columns:1fr; }
  .fin-bg { padding:22px 20px; }
  .fin-bars { gap:6px; height:260px; }
  .fin-bc__v { font-size:10px; }
  .fin-bl { grid-template-columns:minmax(0,1fr) auto; }
  .fin-bl .fa-mut { display:none; }
}
.fa-sous .fin-lien { font-size:17px; }
.fin-btns { display:flex; gap:10px; flex-wrap:wrap; }
.fin-lien { border:none; background:none; padding:0; cursor:pointer; font:500 14px 'Inter Tight',sans-serif; color:#110704; text-decoration:underline; text-underline-offset:3px; text-decoration-color:rgba(17,7,4,.35); }
.fin-lien:hover { text-decoration-color:#110704; }
.fin-lien:focus-visible { outline:2px solid #110704; outline-offset:2px; border-radius:4px; }
.fin-liens { display:flex; gap:16px; margin-top:10px; }
.fa-p-n { background:#fff; color:rgba(17,7,4,.64); box-shadow:inset 0 0 0 1px #e3ded3; }
.fin-retard { color:#5A2A11; font-weight:600; }
#section-factures > .kpi-grid, #section-devis > .kpi-grid, #section-abonnements > .kpi-grid, #section-depenses > .kpi-grid { display:none; }
#section-factures .page-header { display:none; }
#section-factures.fin-plus .page-header { display:flex; }
#section-factures.fin-plus .page-header-right { flex-wrap:wrap; justify-content:flex-end; }
#enveloppes-banner { display:none; }
.fin-barre { display:flex; align-items:center; gap:18px; margin:0 0 18px; }
.fin-pills { display:flex; gap:8px; flex-wrap:wrap; margin-right:auto; }
.fin-pills .fin-onglet { padding:7px 15px; font-size:14px; }

/* Tableaux */
#main .card { background:#fff; border-radius:18px; box-shadow:0 0 0 1px rgba(17,7,4,.07), 0 2px 6px rgba(17,7,4,.08); }
#main .card-title { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:400; color:#110704; }
#main .card-title .ti { display:none; }
#main table th { font:500 13.5px 'Inter Tight',sans-serif; color:rgba(17,7,4,.58); background:none; border-bottom:1px solid #efeae1; padding:14px 10px; text-align:left; }
#main table td { font-size:15px; padding:15px 10px; border-bottom:1px solid #efeae1; vertical-align:middle; color:#110704; }
#main table tr:last-child td { border-bottom:none; }
#main table tbody tr:hover td { background:#FBFAF6; }
#main .td-amount, #main .fin-droite { text-align:right; font-variant-numeric:lining-nums tabular-nums; font-weight:500; }
#main .td-mono { font-family:'Inter Tight',sans-serif; font-variant-numeric:lining-nums tabular-nums; }
#main .td-muted { color:rgba(17,7,4,.58); }
.fin-cl { display:block; font-weight:500; }
.fin-cl__s { display:block; margin-top:2px; font-size:13.5px; color:rgba(17,7,4,.58); }
.fin-cl__s .fin-lien { font-size:13.5px; color:rgba(17,7,4,.7); }
.fin-act { white-space:nowrap; text-align:right; }
.fin-act .fin-lien { margin-left:14px; font-size:13.5px; color:rgba(17,7,4,.7); }
.fin-vide { text-align:center; padding:28px; color:rgba(17,7,4,.58); }

/* Listes en lignes : enveloppes, charges fixes */
.fin-liste { padding:8px 30px; }
.fin-env { display:grid; grid-template-columns:200px 140px minmax(0,1fr) 230px; gap:26px; align-items:center; padding:18px 0; border-top:1px solid #efeae1; }
.fin-env:first-child, .fin-ch:first-child { border-top:none; }
.fin-env__n { display:block; font-family:'Cormorant Garamond',serif; font-size:25px; line-height:1.15; }
.fin-env__l { display:flex; gap:14px; margin-top:4px; }
.fin-env__l .fin-lien { font-size:13.5px; color:rgba(17,7,4,.7); }
.fin-env__m { font-family:'Cormorant Garamond',serif; font-size:28px; }
.fin-env__s { font-size:13.5px; color:rgba(17,7,4,.58); }
.fin-env .fa-tirets { margin:0 0 8px; }
.fin-env__a { text-align:right; }
.fin-ch { display:grid; grid-template-columns:minmax(0,1fr) 180px 110px 170px; gap:16px; align-items:center; padding:15px 0; border-top:1px solid #efeae1; font-size:15px; }
.fin-ch__n { font-family:'Cormorant Garamond',serif; font-size:22px; }
.fin-ch__j { color:rgba(17,7,4,.58); }
.fin-ch__m { text-align:right; font-weight:500; }
.fin-ch--off { opacity:.55; }
.fin-ch__pied { display:flex; justify-content:space-between; padding:16px 0; border-top:1px solid #e3ded3; font-size:15px; }
@media (max-width: 1100px) {
  .fin-env { grid-template-columns:minmax(0,1fr) auto; gap:10px 18px; }
  .fin-env > div:nth-child(3) { grid-column:1 / -1; }
  .fin-ch { grid-template-columns:minmax(0,1fr) auto; }
  .fin-ch__j, .fin-ch .fin-act { grid-column:1 / -1; text-align:left; }
  .fin-ch .fin-act .fin-lien:first-child { margin-left:0; }
  .fa-cartes--2 { grid-template-columns:1fr; }
}

#main thead { background:none; }
#main thead th:first-child, #main thead th:last-child { border-radius:0; }
#main .td-amount { font-family:'Inter Tight',sans-serif; font-size:15px; color:#110704; }
#main .btn { font-family:'Inter Tight',sans-serif; font-size:14px; font-weight:600; border-radius:999px; padding:10px 20px; }
#main .btn .ti { display:none; }
#main .btn-primary { background:#110704; color:#F8F6F2; }
#main .btn-primary:hover { background:#2a1a14; }
#main .btn-outline, #main .btn-secondary { background:transparent; color:#110704; border:none; box-shadow:inset 0 0 0 1px #110704; }
#main .btn:focus-visible { box-shadow:0 0 0 2px #F8F6F2, 0 0 0 4px #110704; }
#main .btn-ghost, #main .btn-xs, #main .btn-sm { border-radius:999px; }
#section-enveloppes.fin-h .page-header, #section-abonnements.fin-h .page-header { display:none; }

/* Pastilles : quatre sens, pas plus (ciel avance, mandarine réclame, ébène à toi, neutre posé) */
#main .badge { border-radius:999px; padding:4px 11px; font-size:13px; font-weight:600; text-transform:none; letter-spacing:0; }
#main .badge::before { display:none; }
#main .badge-payee, #main .badge-paye, #main .badge-actif, #main .badge-success, #main .badge-neutral, #main .badge-violet, #main .badge-pause, #main .badge-annule { background:#fff; color:rgba(17,7,4,.64); box-shadow:inset 0 0 0 1px #e3ded3; }
#main .badge-attente, #main .badge-en-attente, #main .badge-a-venir, #main .badge-blue { background:#C5DEFF; color:#3f5f8c; }
#main .badge-retard, #main .badge-en-retard, #main .badge-danger, #main .badge-a-payer, #main .badge-warning { background:#CD8F6E; color:#3d1c0b; }
#main .urssaf-card, #main .urssaf-card.alerte-rouge, #main .urssaf-card.alerte-orange { background:#fff; border:none; border-radius:18px; box-shadow:0 0 0 1px rgba(17,7,4,.07), 0 2px 6px rgba(17,7,4,.08); }
#main .urssaf-countdown, #main .urssaf-countdown.rouge, #main .urssaf-countdown.orange { color:#5A2A11; }

/* Qonto relié partout */
#section-transactions .page-header, #section-transactions > .card { display:none; }
.fq-tete { flex-direction:row; align-items:center; }
.fq-bloc { margin-top:14px; }
.fq-h { display:flex; justify-content:space-between; align-items:baseline; margin-top:34px; }
.fq-l { display:grid; grid-template-columns:64px minmax(0,1fr) 120px minmax(0,1.25fr); gap:20px; align-items:center; padding:16px 0; border-top:1px solid #efeae1; font-size:15px; }
.fq-l:first-child { border-top:none; }
.fq-d { font-size:13.5px; color:rgba(17,7,4,.58); }
.fq-n { font-weight:500; overflow-wrap:anywhere; }
.fq-s { font-size:13.5px; color:rgba(17,7,4,.58); }
.fq-s .fin-lien { font-size:13.5px; }
.fq-m { text-align:right; font-weight:500; }
.fq-ch { display:flex; gap:8px; flex-wrap:wrap; }
.fq-ch .fin-onglet { padding:7px 13px; font-size:14px; }
.fq-q { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.fq-chg { margin-left:auto; font-size:13px; color:rgba(17,7,4,.6); }
.fq-l2 { font-size:14px; border-top-color:rgba(90,42,17,.15); padding:9px 0; }
.fq-regles { margin-bottom:24px; }
.fq-r { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto; gap:16px; align-items:center; padding:12px 0; border-top:1px solid #efeae1; font-size:15px; }
.fq-modale { position:fixed; inset:0; z-index:9000; background:rgba(17,7,4,.45); display:none; align-items:center; justify-content:center; padding:20px; }
.fq-fen { background:#fff; border-radius:20px; padding:28px 30px; width:100%; max-width:460px; display:flex; flex-direction:column; gap:12px; }
.fq-champs { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.fq-champs label { display:flex; flex-direction:column; gap:6px; font-size:13.5px; }
.fq-bas { display:flex; justify-content:flex-end; gap:10px; margin-top:6px; }
@media (max-width: 1100px) { .fq-l { grid-template-columns:56px minmax(0,1fr) auto; } .fq-ch, .fq-q { grid-column:1 / -1; } }

.fq-gr { display:flex; flex-direction:column; gap:8px; }
.fq-g { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.fq-gl { font-size:13px; color:rgba(17,7,4,.58); min-width:84px; }
.fq-sel { max-width:320px; border-radius:999px; font-size:14px; padding:7px 13px; }
.fq-l { grid-template-columns:64px minmax(0,1fr) 120px minmax(0,1.6fr); }

.fq-l.fq-ar { grid-template-columns:64px minmax(0,1fr) 140px; row-gap:12px; }
.fq-ar .fq-gr { grid-column:2 / -1; flex-direction:row; flex-wrap:wrap; gap:10px 26px; }
.fq-ar .fq-g { gap:8px; }
.fq-ar .fq-gl { min-width:0; }

.fq-ouv { grid-column:2 / -1; display:flex; flex-direction:column; gap:8px; }
.fq-opt { display:grid; grid-template-columns:minmax(0,1fr) 150px auto; gap:18px; align-items:center; padding:12px 16px; border-radius:14px; box-shadow:inset 0 0 0 1px #e3ded3; }
.fq-opt.fq-best { box-shadow:inset 0 0 0 1.5px #110704; }

.fq-salaire { flex-direction:row; align-items:center; gap:30px; margin-bottom:16px; }
.fq-salaire > div:first-child { flex:1; }
@media (max-width: 900px) { .fq-salaire { flex-direction:column; align-items:stretch; } }

/* Clôturer le mois */
.fc-fil { margin:0 0 6px; font-size:15px; }
.fc-grille { display:grid; grid-template-columns:300px minmax(0,1fr); gap:40px; margin-top:30px; align-items:start; }
.fc-etapes { display:flex; flex-direction:column; gap:4px; }
.fc-e { display:flex; gap:12px; align-items:center; padding:14px 16px; border-radius:14px; border:none; background:none; text-align:left; cursor:pointer; font-family:'Inter Tight',sans-serif; color:#110704; }
.fc-e:hover { background:rgba(17,7,4,.04); }
.fc-e.on { background:#110704; color:#F8F6F2; }
.fc-n { width:30px; height:30px; flex:none; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:600; background:#fff; box-shadow:inset 0 0 0 1px #e3ded3; }
.fc-e.fait .fc-n { background:#110704; color:#F8F6F2; box-shadow:none; }
.fc-e.on .fc-n { background:#E6E5B2; color:#110704; box-shadow:none; }
.fc-t { display:block; font-size:15.5px; font-weight:500; }
.fc-e.on .fc-t { font-weight:600; }
.fc-s { display:block; font-size:13.5px; color:rgba(17,7,4,.58); }
.fc-e.on .fc-s { color:rgba(248,246,242,.7); }
.fc-corps { padding:36px 40px; }
.fc-h { font-size:36px; margin:4px 0 18px; }
.fc-l { display:flex; justify-content:space-between; gap:16px; padding:13px 0; border-top:1px solid #efeae1; font-size:16px; }
.fc-note { margin:-4px 0 12px; }
.fc-total { display:flex; justify-content:space-between; align-items:baseline; padding:18px 0 0; margin-top:4px; border-top:1.5px solid #110704; }
.fc-tt { font-family:'Cormorant Garamond',serif; font-size:26px; }
.fc-r { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:16px 0; border-top:1px solid #efeae1; }
.fc-bas { margin-top:26px; flex-direction:row; align-items:center; gap:20px; }
.fc-bas > div:first-child { flex:1; }
.fc-actions { display:flex; gap:10px; margin-top:16px; }
.fc-nav { display:flex; justify-content:space-between; margin-top:28px; }
.fc-bandeau { margin-top:22px; display:flex; align-items:center; gap:24px; background:#110704; color:#E6E5B2; border-radius:18px; padding:22px 26px; }
.fc-bandeau > div:first-child { flex:1; }
.fc-bk { font-size:14px; color:rgba(230,229,178,.65); }
.fc-bt { font-family:'Cormorant Garamond',serif; font-size:28px; line-height:1.15; color:#F8F6F2; margin-top:2px; }
.fc-bpas { display:flex; gap:8px; flex-wrap:wrap; font-size:14px; }
.fc-bpas span { padding:7px 13px; border-radius:999px; background:rgba(230,229,178,.1); color:#E6E5B2; }
.fc-bpas span.fait { background:#E6E5B2; color:#110704; }
.fc-bgo { background:#C5DEFF; color:#110704; }
@media (max-width: 1100px) { .fc-grille { grid-template-columns:1fr; } .fc-bandeau { flex-direction:column; align-items:stretch; } .fc-bas { flex-direction:column; align-items:stretch; } }

/* Formulaires et fenêtres, dans la DA */
.form-label { font-family:'Inter Tight',sans-serif; font-size:13.5px; font-weight:500; letter-spacing:0; text-transform:none; color:rgba(17,7,4,.64); display:block; margin-bottom:6px; }
.form-input, .form-select, .form-textarea, .form-control { width:100%; box-sizing:border-box; background:#fff; border:none; box-shadow:inset 0 0 0 1px #e3ded3; border-radius:10px; color:#110704; font-family:'Inter Tight',sans-serif; font-size:15px; padding:11px 14px; outline:none; }
.form-input:focus, .form-select:focus, .form-textarea:focus, .form-control:focus { box-shadow:inset 0 0 0 1.5px #110704; }
.modal { border-radius:20px; font-family:'Inter Tight',sans-serif; }
.modal-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:400; color:#110704; }
.modal .btn { font-family:'Inter Tight',sans-serif; font-size:14px; font-weight:600; border-radius:999px; padding:10px 20px; }
.modal .btn .ti { display:none; }
.modal .btn-primary { background:#110704; color:#F8F6F2; }
.modal .btn-outline, .modal .btn-secondary { background:transparent; color:#110704; border:none; box-shadow:inset 0 0 0 1px #110704; }

.fc-clos { margin-top:18px; display:flex; gap:18px; align-items:baseline; flex-wrap:wrap; font-size:15px; color:rgba(17,7,4,.7); }

/* Devis, Projets, Clients */
#section-devis .page-header, #section-projets .page-header, #section-tiers .page-header { display:none; }
#section-projets > .kpi-grid, #section-tiers > .kpi-grid { display:none; }
.fv-mini { display:flex; gap:3px; margin-top:6px; }
.fv-mini i { width:14px; height:5px; border-radius:9px; background:#e6e0d4; }
.fv-mini i.on { background:#110704; }
.fv-ou .fin-cl__s { margin-top:4px; }
.fv-p { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.3fr) 200px; gap:18px; align-items:center; padding:16px 0; border-top:1px solid #efeae1; font-size:15px; }
.fv-c { display:grid; grid-template-columns:minmax(0,1.3fr) 130px 90px 140px minmax(0,1.5fr) 90px; gap:18px; align-items:center; padding:16px 0; border-top:1px solid #efeae1; font-size:15px; }
.fv-h { font-size:13.5px; color:rgba(17,7,4,.58); border-top:none; padding:12px 0; }
.fv-h + div { border-top:none; }
.fv-pn { display:block; font-family:'Cormorant Garamond',serif; font-size:23px; line-height:1.2; }
.fv-r { text-align:right; white-space:nowrap; }
.fv-notes { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.fv-p .fin-act { display:flex; justify-content:flex-end; align-items:center; gap:4px; }

.fv-nom { border:none; background:none; padding:0; text-align:left; color:#110704; cursor:pointer; }
.fv-nom:hover { text-decoration:underline; text-underline-offset:3px; }
.fv-et { display:block; font-weight:500; }
.fv-g { display:flex; align-items:baseline; gap:12px; padding:22px 0 6px; }
.fv-g__t { font-family:'Cormorant Garamond',serif; font-size:28px; }
.fv-g__e { margin-left:auto; }
.fv-g + .fv-p { border-top:none; }
.fv-pl { margin-top:18px; }
.fv-guide { display:flex; align-items:center; gap:28px; margin:4px 0 22px; padding:20px 26px; }
.fv-guide__g { flex:1; }
.fv-guide__g b { display:block; margin-top:4px; font-family:'Cormorant Garamond',serif; font-weight:400; font-size:34px; line-height:1.1; }
.fv-guide p { margin:0; max-width:360px; font-size:15px; line-height:1.5; }
.fv-dash { display:flex; gap:4px; margin-top:12px; }
.fv-dash i { flex:1; height:6px; border-radius:99px; background:#e6e0d4; }
.fv-dash i.on { background:#110704; }

/* À payer */
.ap-cartes { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(0,1fr); gap:20px; margin-top:30px; }
.ap-creme { display:grid !important; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:34px; align-items:start; }
.ap-creme__g { display:flex; flex-direction:column; justify-content:space-between; gap:22px; height:100%; }
.ap-btns { display:flex; gap:10px; flex-wrap:wrap; }
.ap-calc { font-size:14.5px; color:#3b2a20; }
.ap-calc__l { display:flex; justify-content:space-between; gap:20px; padding:5px 0; }
.ap-calc__l--f { border-top:1px solid rgba(90,42,17,.25); margin-top:4px; padding-top:9px; font-weight:600; }
.ap-r { display:grid; grid-template-columns:minmax(0,1.4fr) 140px 100px minmax(0,1fr) 150px 170px; gap:16px; align-items:center; padding:15px 0; border-top:1px solid #efeae1; font-size:15px; }
.ap-h { font-size:13.5px; color:rgba(17,7,4,.58); border-top:none; padding:14px 0; }
.fv-g + .ap-r { border-top:none; }
.ap-r .fin-act { display:flex; justify-content:flex-end; }
.ap-pied { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:18px 0 6px; border-top:1px solid #efeae1; margin-top:10px; }
.ap-modal { max-width:640px; }
.ap-seg { display:inline-flex; align-self:flex-start; width:fit-content; background:#fff; border-radius:999px; padding:4px; box-shadow:inset 0 0 0 1px #e3ded3; }
.ap-seg button { border:none; background:none; padding:7px 15px; border-radius:999px; font:inherit; font-size:14.5px; color:rgba(17,7,4,.64); cursor:pointer; }
.ap-seg button.on { background:#110704; color:#F8F6F2; font-weight:600; }
.ap-mt { margin-top:10px; }
.ap-ech { display:grid; grid-template-columns:1fr 1fr auto; gap:12px; align-items:center; margin-bottom:8px; }
.ap-opt { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; border-radius:12px; border:1px solid #e3ded3; margin-top:8px; cursor:pointer; font-weight:400; }
.ap-opt:has(input:checked) { border-color:#110704; }
.ap-opt input { margin-top:4px; accent-color:#110704; }
.ap-opt b { display:block; font-weight:600; }

.ap-court { max-width:200px; }
.ap-apercu { background:#F8F6F2; border-radius:12px; padding:12px 16px; margin-bottom:16px; font-size:15px; }
.ap-apercu__l { display:grid; grid-template-columns:1fr 1fr auto; gap:16px; padding:7px 0; border-top:1px solid #efeae1; }
.ap-apercu__l:first-of-type { margin-top:6px; }
.ap-sous { display:block; margin-top:4px; }

`;
const JS   = `/* ─── STB Finance — app.js — Cookie auth + service binding ──────────── */

/* ─── 0. LOGIN OVERLAY ───────────────────────────────────────────────── */
function injectLoginOverlay() {
  if (q('#login-overlay')) return;
  const div = document.createElement('div');
  div.id = 'login-overlay';
  div.style.cssText = 'position:fixed;inset:0;background:#f5f3ef;display:none;align-items:center;justify-content:center;z-index:9999;';
  div.innerHTML = \`
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


/* ─── REFONTE : menu en 5 entrées + onglets, page Aujourd'hui ─────────────
   Chaque entrée du menu regroupe des écrans existants ; on passe de l'un
   à l'autre par des onglets en pilules en haut de l'écran. Aucun écran ni
   aucune donnée n'est supprimé. */
const FIN_GROUPES={
  aujourdhui:[['dashboard','Aujourd’hui']],
  tresorerie:[['enveloppes','Enveloppes'],['apayer','À payer'],['transactions','Mouvements']],
  factures:[['factures','Factures'],['devis','Devis'],['projets','Projets'],['tiers','Clients']],
  charges:[['abonnements','Charges fixes'],['depenses','Dépenses du mois'],['charges-urssaf','Déclarations']],
  bilans:[['rapport-annuel','L’année'],['rapport-mensuel','Le mois'],['rapport-fiscal','Fiscal'],['simulateur','Simulateur']],
  reglages:[['options','Réglages'],['import-export','Import et export']]
};
function finGroupeDe(sec){for(const g in FIN_GROUPES){if(FIN_GROUPES[g].some(x=>x[0]===sec))return g;}return null;}
function finOnglets(sec){
  qa('.fin-onglets,.fin-hero').forEach(el=>el.remove());
  qa('.section.fin-h').forEach(x=>x.classList.remove('fin-h'));
  const g=finGroupeDe(sec)||(sec==='cloture'?'aujourdhui':null);const liste=g?FIN_GROUPES[g]:[];
  qa('.nav-item[data-groupe]').forEach(n=>n.classList.toggle('active',n.dataset.groupe===g));
  if(liste.length<2)return;
  const el=q('#section-'+sec);if(!el)return;
  const d=document.createElement('div');d.className='fin-onglets';d.setAttribute('role','tablist');
  liste.forEach(x=>{const b=document.createElement('button');const n=finCompte(x[0]);b.className='fin-onglet'+(x[0]===sec?' on':'');b.textContent=x[1]+(n?' · '+n:'');b.setAttribute('role','tab');b.setAttribute('aria-selected',x[0]===sec?'true':'false');b.addEventListener('click',()=>navigate(x[0]));d.appendChild(b);});
  el.insertBefore(d,el.firstChild);
  if(FIN_TITRES[g]){const h=document.createElement('div');h.className='fin-hero';h.dataset.groupe=g;el.insertBefore(h,d);el.classList.add('fin-h');finHeroMaj(g);}
}
/* En-têtes des groupes : titre, une phrase, les cartes (maquettes Factures, Trésorerie, Dépenses) */
const FIN_TITRES={
  factures:['Factures et devis',''],
  tresorerie:['Trésorerie','Ton argent Qonto, rangé en enveloppes.'],
  bilans:['Bilans','Ce que l’année raconte, et ce qu’il faut à ta comptable.'],
  charges:['Charges et URSSAF','Ce qui sort chaque mois, abonnements compris, et ce que tu dois déclarer.']
};
function finAuj(){return new Date().toISOString().slice(0,10);}
function finEnRetard(f){const a=finAuj();return f.statut==='retard'||(f.statut==='attente'&&f.dateEcheance&&f.dateEcheance<a);}
function finJours(d){return Math.max(0,Math.round((new Date()-new Date(d))/86400000));}
function finCompte(sec){
  if(sec==='factures')return dbGet('factures').length;
  if(sec==='devis')return dbGet('devis').length;
  if(sec==='projets')return dbGet('projets').filter(p=>p.statut!=='termine').length;
  if(sec==='tiers')return fvClients().length;
  if(sec==='apayer')return apLignes(apEtat()).length;
  if(sec==='enveloppes')return (_enveloppes||[]).filter(e=>e.id!=='qonto'&&e.id!=='salaire').length;
  if(sec==='abonnements')return dbGet('abonnements').filter(a=>a.statut==='actif'||!a.statut).length;
  if(sec==='depenses'){const k=finAuj().slice(0,7);return dbGet('depenses').filter(d=>(d.date||'').startsWith(k)).length;}
  return 0;
}
function finTete(g,sous){const t=FIN_TITRES[g];return '<h1 class="fa-titre">'+t[0]+'</h1><p class="fa-sous">'+(sous||t[1])+'</p>';}
let FIN_ENV_CHARGE=false;
function finHeroMaj(g){
  const h=q('.fin-hero[data-groupe="'+g+'"]');if(!h)return;
  if(g==='factures')h.innerHTML=finHeroFactures();
  else if(g==='charges')h.innerHTML=finHeroCharges();
  else if(g==='bilans')h.innerHTML=finHeroBilans((h.closest('.section')||{}).id.replace('section-',''));
  else if(g==='tresorerie'&&h.closest('#section-apayer'))h.innerHTML=apHero();
  else if(g==='tresorerie'){
    if((_enveloppes||[]).length||FIN_ENV_CHARGE)h.innerHTML=finHeroTreso();
    else{h.innerHTML=finTete(g);FIN_ENV_CHARGE=true;api('GET','/api/enveloppes').then(r=>{_enveloppes=r.enveloppes||[];finHeroMaj('tresorerie');}).catch(()=>{});}
  }
}
function finGo(el){navigate(el.dataset.s);}
function finHeroFactures(){
  const F=dbGet('factures'),y=new Date().getFullYear(),auj=finAuj();
  const retard=F.filter(finEnRetard).sort((a,b)=>(a.dateEcheance||a.date||'').localeCompare(b.dateEcheance||b.date||''));
  const attente=F.filter(f=>f.statut==='attente'&&!finEnRetard(f)).sort((a,b)=>(a.dateEcheance||'9').localeCompare(b.dateEcheance||'9'));
  const dp=f=>f.datePaiement||f.date||'';
  const payY=F.filter(f=>f.statut==='payee'&&dp(f).startsWith(String(y)));
  const caY=payY.reduce((s,f)=>s+(f.montant||0),0);
  const caPrev=F.filter(f=>f.statut==='payee'&&dp(f).startsWith(String(y-1))&&dp(f).slice(4)<=auj.slice(4)).reduce((s,f)=>s+(f.montant||0),0);
  const obj=dbGetObj('settings').objectifCA||60000;
  const r0=retard[0],a0=attente[0];
  const sous=F.length+' facture'+(F.length>1?'s':'')+' importée'+(F.length>1?'s':'')+' depuis Indy. <button class="fin-lien" data-s="import-export" onclick="finGo(this)">Importer un CSV</button>';
  const cR=r0
    ?'<div class="fa-creme"><div><span class="fa-k">en retard, depuis '+finJours(r0.dateEcheance||r0.date)+' jours</span><b>'+faEsc(r0.client)+', '+fmt0(r0.montant)+'</b>'+(retard.length>1?'<span class="fa-k fa-k--f">et '+(retard.length-1)+' autre'+(retard.length>2?'s':'')+' en retard</span>':'')+'</div><button class="fa-btn" data-s="retard" onclick="finFactFiltre(this.dataset.s)">Voir les retards</button></div>'
    :'<div class="fa-creme"><div><span class="fa-k">en retard</span><b>Aucune facture</b><span class="fa-k fa-k--f">Tout est réglé à temps.</span></div></div>';
  const cA=a0
    ?'<div class="fa-creme"><div><span class="fa-k">en attente'+(a0.dateEcheance?', échéance le '+new Date(a0.dateEcheance+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'')+'</span><b>'+faEsc(a0.client)+', '+fmt0(a0.montant)+'</b>'+(attente.length>1?'<span class="fa-k fa-k--f">et '+(attente.length-1)+' autre'+(attente.length>2?'s':'')+' en attente</span>':'')+'</div><button class="fa-btn fa-btn--c" data-id="'+a0.id+'" onclick="editFacture(this.dataset.id)">Voir la facture</button></div>'
    :'<div class="fa-creme"><div><span class="fa-k">en attente</span><b>Rien en attente</b><span class="fa-k fa-k--f">Toutes tes factures envoyées sont payées.</span></div></div>';
  const diff=caY-caPrev;
  const cE='<div class="fa-blanc"><div class="fa-k2">Encaissé en '+y+'</div><div class="fa-gros2">'+fmt0(caY)+' <em>'+payY.length+' facture'+(payY.length>1?'s':'')+'</em></div>'+faTirets(Math.min(12,Math.round(caY/obj*12)),12)+'<p class="fa-p">'+(caPrev?fmt0(Math.abs(diff))+(diff>=0?' de plus':' de moins')+' qu’en '+(y-1)+' à la même date':'sur un objectif de '+fmt0(obj))+'</p></div>';
  return finTete('factures',sous)+'<div class="fa-cartes">'+cR+cA+cE+'</div>';
}
function finHeroCharges(){
  const F=dbGet('factures'),S=dbGetObj('settings'),U=dbGetObj('urssaf'),now=new Date(),y=now.getFullYear(),auj=finAuj();
  const tU=(S.tauxUrssaf||25.6)/100,tC=(S.tauxCfp||0.2)/100;
  const Q={T1:[[1,2,3],y+'-04-30','1er trimestre'],T2:[[4,5,6],y+'-07-31','2e trimestre'],T3:[[7,8,9],y+'-11-02','3e trimestre'],T4:[[10,11,12],(y+1)+'-02-01','4e trimestre']};
  let t=null;['T1','T2','T3','T4'].forEach(k=>{const d=U[k+'-'+y]||{};if(!t&&d.statut!=='paye'&&Q[k][1]>=auj)t=k;});
  const dp=f=>f.datePaiement||f.date||'';
  let carte='';
  if(t){
    const ca=Q[t][0].reduce((s,mi)=>{const k=y+'-'+String(mi).padStart(2,'0');return s+F.filter(f=>f.statut==='payee'&&dp(f).startsWith(k)).reduce((x,f)=>x+(f.montant||0),0);},0);
    const enCours=Q[t][0].indexOf(now.getMonth()+1)>=0;
    const quand=new Date(Q[t][1]+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'});
    carte='<div class="fa-creme"><div><span class="fa-k">prochaine déclaration URSSAF</span><b>Le '+Q[t][2]+', avant le '+quand+'</b><span class="fa-k fa-k--f">'+fmt0(ca)+' de chiffre d’affaires '+(enCours?'encaissé jusqu’ici':'à déclarer')+' : '+fmt0(ca*tU)+' de cotisations, '+fmt0(ca*tC)+' de formation.</span></div><button class="fa-btn" data-s="charges-urssaf" onclick="finGo(this)">Préparer la déclaration</button></div>';
  }else{
    carte='<div class="fa-creme"><div><span class="fa-k">déclarations URSSAF</span><b>Tout est déclaré pour '+y+'</b></div><button class="fa-btn fa-btn--c" data-s="charges-urssaf" onclick="finGo(this)">Voir les déclarations</button></div>';
  }
  const payes=['T1','T2','T3','T4'].filter(k=>(U[k+'-'+y]||{}).statut==='paye');
  const tot=payes.reduce((s,k)=>s+((U[k+'-'+y]||{}).montantPaye||0),0);
  const blanc='<div class="fa-blanc"><div class="fa-k2">Déclarations '+y+'</div><div class="fa-gros2">'+payes.length+' <em>sur 4 payées</em></div>'+faTirets(payes.length,4)+'<p class="fa-p">'+(tot?fmt0(tot)+' versés à l’URSSAF cette année.':'Rien de payé pour l’instant cette année.')+'</p></div>';
  return finTete('charges')+'<div class="fa-cartes fa-cartes--2">'+carte+blanc+'</div>';
}
/* Bilans (maquette p6) : quatre chiffres, les mois en barres, les clients */
function finExportCompta(){exportCSV('factures');setTimeout(()=>exportCSV('depenses'),500);toast('Factures et dépenses exportées en CSV','success');}
function finHeroBilans(sec){
  const S=dbGetObj('settings'),U=dbGetObj('urssaf'),F=dbGet('factures'),now=new Date(),y=now.getFullYear(),mc=now.getMonth()+1,mois=sec==='rapport-mensuel';
  const aussi=' Voir aussi <button class="fin-lien" data-s="rapport-fiscal" onclick="finGo(this)">le bilan fiscal</button> et <button class="fin-lien" data-s="simulateur" onclick="finGo(this)">le simulateur</button>.';
  const pil=(s2,t)=>'<button class="fin-onglet'+(sec===s2?' on':'')+'" data-s="'+s2+'" onclick="finGo(this)">'+t+'</button>';
  const tete='<div class="fin-bt"><div>'+finTete('bilans',(mois?'Ce que le mois raconte':'Ce que l’année raconte')+', et ce qu’il faut à ta comptable.'+aussi)+'</div><div class="fin-bt__d">'+pil('rapport-mensuel',MOIS_LONG[mc-1])+pil('rapport-annuel',String(y))+'<button class="fa-btn" onclick="finExportCompta()">Export pour la comptable</button></div></div>';
  if(sec!=='rapport-annuel'&&!mois)return tete;
  const dp=f=>f.datePaiement||f.date||'';
  const cle=m=>y+'-'+String(m).padStart(2,'0');
  const pref=mois?cle(mc):String(y);
  const somme=(l,v)=>l.reduce((s,x)=>s+(v(x)||0),0);
  const payees=F.filter(f=>f.statut==='payee'&&dp(f).startsWith(String(y)));
  const parMois=[];for(let m=1;m<=mc;m++)parMois.push(somme(payees.filter(f=>dp(f).startsWith(cle(m))),f=>f.montant));
  const obj=S.objectifCA||60000,objM=Math.round(obj/12);
  const periode=payees.filter(f=>dp(f).startsWith(pref));
  const enc=somme(periode,f=>f.montant);
  const au=parMois.filter(v=>v>=objM).length;
  const verse=somme(fqVersements(pref),d=>d.montant);
  const decl=['T1','T2','T3','T4'].map(k=>U[k+'-'+y]||{}).filter(d=>d.statut==='paye'&&(!mois||(d.datePaye||'').startsWith(pref)));
  const urs=somme(decl,d=>d.montantPaye);
  const carte=(k,v,p)=>'<div class="fa-blanc"><div class="fa-k2">'+k+'</div><div class="fa-gros2 fa-n">'+v+'</div><p class="fa-p fin-bp">'+p+'</p></div>';
  const cartes='<div class="fa-cartes fin-b3">'+
    carte('Encaissé',fmt0(enc),mois?(enc>=objM?'objectif du mois atteint, '+fmt0(objM):'objectif du mois '+fmt0(objM)+', il manque '+fmt0(objM-enc)):mc+' mois, '+(au?au+' mois au-dessus de l’objectif':'aucun mois au-dessus de l’objectif'))+
    carte('Versé à toi',fmt0(verse),mois?'tes versements du mois':fmt0(verse/mc)+' par mois en moyenne')+
    carte('URSSAF payée',fmt0(urs),mois?(decl.length?decl.length+' déclaration payée ce mois-ci':'rien de payé ce mois-ci'):decl.length+' déclaration'+(decl.length>1?'s':'')+' sur 4')+
  '</div>';
  const max=Math.max(objM,...parMois)||1,H=250;
  let barres='';
  parMois.forEach((v,i)=>{
    const m=i+1,cour=m===mc,noir=v>=objM,h=Math.max(v>0?4:0,Math.round(v/max*H));
    barres+='<div class="fin-bc'+(cour?' fin-bc--c':'')+'" title="'+MOIS_LONG[i]+' : '+fmt0(v)+'"><span class="fin-bc__v fa-n">'+(noir||cour?fmt0(v).replace(/\s?€/,''):'')+'</span><i class="'+(cour?'c':noir?'n':'')+'" style="height:'+h+'px"></i><span class="fin-bc__m">'+new Date(y,i,1).toLocaleDateString('fr-FR',{month:'short'})+'</span></div>';
  });
  const graph='<div class="fa-blanc fin-bg"><div class="fin-bg__h"><h2 class="fa-h2">Encaissé chaque mois</h2><span class="fa-mut">en noir, les mois où l’objectif de '+fmt0(objM)+' est atteint</span></div>'+
    '<div class="fin-bars" style="--obj:'+Math.round(objM/max*H)+'px">'+barres+'</div></div>';
  const cl={};periode.forEach(f=>{const n=f.client||'Sans client';cl[n]=cl[n]||{m:0,n:0};cl[n].m+=f.montant||0;cl[n].n++;});
  const lignes=Object.keys(cl).sort((a,b)=>cl[b].m-cl[a].m).map(n=>'<div class="fin-bl"><span class="fa-ligne__t">'+faEsc(n)+'</span><span class="fa-mut">'+cl[n].n+' facture'+(cl[n].n>1?'s':'')+'</span><span class="fa-n">'+fmt0(cl[n].m)+'</span></div>').join('');
  const clients='<div class="fa-blanc fin-bg"><h2 class="fa-h2">Par client</h2>'+(lignes||'<p class="fa-vide">Aucune facture encaissée '+(mois?'ce mois-ci':'cette année')+'.</p>')+'</div>';
  return tete+cartes+graph+clients;
}
function finProposition(){
  const E=_enveloppes||[],qo=E.find(e=>e.id==='qonto');let reste=qo?Math.floor(qo.solde||0):0;const out=[];
  ['charges','tresorerie','formations'].forEach(id=>{
    const e=E.find(x=>x.id===id);if(!e||reste<1||e.objectif==null)return;
    const manque=Math.max(0,e.objectif-Math.max(0,e.solde||0));if(manque<1)return;
    const m=Math.round(Math.min(reste,manque,e.virer||manque));
    if(m>=1){out.push({id:id,nom:e.nom,m:m});reste-=m;}
  });
  out.reste=reste;return out;
}
function finHeroTreso(){
  const E=_enveloppes||[],qo=E.find(e=>e.id==='qonto');
  const range=E.filter(e=>e.id!=='qonto').reduce((s,e)=>s+Math.max(0,e.solde||0),0);
  const reel=qo&&qo.soldeQontoReel!=null?qo.soldeQontoReel:null;
  const dispo=qo?Math.round(qo.solde||0):0;
  const prop=finProposition();
  let carte;
  if(dispo>0){
    const txt=prop.length?'Proposition : '+prop.map(x=>fmt0(x.m)+' vers '+x.nom).join(', ')+(prop.reste>0?', le reste en attente.':'.'):'Toutes tes enveloppes ont atteint leur objectif.';
    carte='<div class="fa-creme"><div><span class="fa-k">à répartir entre tes enveloppes</span><b class="fa-gros">'+fmt0(dispo)+'</b><span class="fa-k fa-k--f">'+txt+'</span></div><div class="fin-btns">'+(prop.length?'<button class="fa-btn" onclick="finAppliquer()">Appliquer la proposition</button>':'')+'<button class="fa-btn fa-btn--c" onclick="openVirementModal()">Répartir moi-même</button></div></div>';
  }else if(dispo<0){
    carte='<div class="fa-creme"><div><span class="fa-k">tes enveloppes dépassent ton solde</span><b class="fa-gros">'+fmt0(-dispo)+' de trop</b><span class="fa-k fa-k--f">Retire un virement ou attends un encaissement.</span></div><button class="fa-btn fa-btn--c" onclick="q(&quot;#virements-list&quot;).scrollIntoView({behavior:&quot;smooth&quot;})">Voir les virements</button></div>';
  }else{
    carte='<div class="fa-creme"><div><span class="fa-k">à répartir</span><b>Tout est rangé</b><span class="fa-k fa-k--f">Rien n’attend sur ton compte.</span></div><button class="fa-btn fa-btn--c" onclick="openVirementModal()">Nouveau virement</button></div>';
  }
  const blanc='<div class="fa-blanc"><div class="fa-k2">Sur ton compte Qonto</div><div class="fa-gros2">'+(reel!=null?fmt0(reel):'—')+'</div><p class="fa-p" style="margin-top:12px">'+(reel!=null?'dont '+fmt0(range)+' déjà rangés dans tes enveloppes':'Pas encore synchronisé.')+'</p><p class="fa-p fin-liens"><button class="fin-lien" data-s="transactions" onclick="finGo(this)">Voir les mouvements</button><button class="fin-lien" onclick="syncQonto()">Synchroniser</button></p></div>';
  return finTete('tresorerie')+'<div class="fa-cartes fa-cartes--2">'+carte+blanc+'</div>';
}
async function finAppliquer(){
  const p=finProposition();if(!p.length)return;
  if(!await confirmDialog('Appliquer la proposition ?',p.map(x=>fmt0(x.m)+' vers '+x.nom).join(', ')+'.'))return;
  const date=finAuj();
  try{for(const x of p){await api('POST','/api/virements',{de:'qonto',vers:x.id,montant:x.m,date:date,motif:'Répartition'});}toast('Répartition enregistrée','success');await loadEnveloppes();}
  catch(e){toast('Erreur : '+e.message,'error');}
}
async function finVirerVers(id,m,de){
  if(!(_enveloppes||[]).length){try{const r=await api('GET','/api/enveloppes');_enveloppes=r.enveloppes||[];}catch(e){toast('Enveloppes introuvables, réessaie','error');return;}}
  openVirementModal(de||'qonto');q('#virement-vers').value=id;if(m)q('#virement-montant').value=m;
  if(id==='tresorerie'&&!q('#virement-motif').value)q('#virement-motif').value='Trésorerie';
}
function finFactFiltre(st){
  const sel=q('#factures-filter-statut');
  if(!q('#section-factures.active'))navigate('factures');
  if(sel)sel.value=st;
  qa('#fac-pills .fin-onglet').forEach(b=>b.classList.toggle('on',b.dataset.s===st));
  renderFactures();
}
function finFactPlus(){const s=q('#section-factures');const on=s.classList.toggle('fin-plus');q('#fac-plus').textContent=on?'Moins de filtres':'Plus de filtres';}
/* ─── Qonto relié partout : chaque mouvement est rattaché à ce qu'il représente ───
   Les liens (mouvement → facture, trimestre URSSAF, charge fixe, dépense, versement)
   et les règles apprises vivent dans les réglages : qontoLiens, qontoRegles. */
const FQ_TYPES={facture:['facture','fa-p-a'],devis:['devis','fa-p-a'],client:['paiement client','fa-p-a'],urssaf:['URSSAF','fa-p-n'],charge:['abonnement','fa-p-n'],depense:['dépense','fa-p-n'],versement:['mon salaire','fa-p-m'],epargne:['mis de côté','fa-p-n'],remboursement:['remboursement','fa-p-n'],apport:['apport perso','fa-p-n'],entree:['entrée','fa-p-n'],ignore:['pas pro','fa-p-n']};
const FQ_DIACR=new RegExp('['+String.fromCharCode(768)+'-'+String.fromCharCode(879)+']','g');
let FQ_MOUV=null,FQ_EN_COURS=false,FQ_DERNIER=0,FQ_CREE=false,FQ_FACT=null;
function fqNorm(s){return String(s||'').toLowerCase().normalize('NFD').replace(FQ_DIACR,'').split(' ').filter(Boolean).join(' ');}
function fqLiens(){const s=dbGetObj('settings');return s.qontoLiens&&typeof s.qontoLiens==='object'?s.qontoLiens:{};}
function fqRegles(){const s=dbGetObj('settings');return Array.isArray(s.qontoRegles)?s.qontoRegles:[];}
async function fqEnregistrer(liens,regles){await dbSet('settings',Object.assign({},dbGetObj('settings'),{qontoLiens:liens,qontoRegles:regles}));}
function fqMouvements(){return (FQ_MOUV||[]).filter(t=>t&&t.qontoId&&t.date).sort((a,b)=>b.date.localeCompare(a.date));}
function fqDm(d){return d?d.slice(8,10)+'/'+d.slice(5,7):'';}
function fqJour(d){return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'});}
function fqEch(k){const t=k.slice(0,2),y=+k.slice(3);return {T1:y+'-04-30',T2:y+'-07-31',T3:y+'-11-02',T4:(y+1)+'-02-01'}[t];}
function fqNomT(k){return {T1:'1er trimestre',T2:'2e trimestre',T3:'3e trimestre',T4:'4e trimestre'}[k.slice(0,2)]+' '+k.slice(3);}
function fqRegle(tx){const l=fqNorm(tx.libelle);return fqRegles().find(r=>r.t!=='alias'&&r.m&&l.indexOf(r.m)>=0&&(!r.sens||r.sens===tx.type));}
const FQ_COMMUNS=['sarl','sasu','s.a.s.','eurl','societe','atelier','studio','maison','agence','cabinet','boutique','groupe','france','services','service','conseil','conseils','association','entreprise','virement','sepa','prlv'];
function fqMots(s){return fqNorm(s).split(' ').map(w=>w.replace(/[.,()]/g,'')).filter(w=>w.length>=4&&FQ_COMMUNS.indexOf(w)<0);}
/* Ce qui a déjà été reçu sur une facture ou un devis, d'après les mouvements reliés */
function fqRecu(t,id){return Object.values(fqLiens()).filter(x=>x.t===t&&x.id===id).reduce((s,x)=>s+(x.m||0),0);}
function fqReste(f){return Math.max(0,(f.montant||0)-fqRecu('facture',f.id));}
function fqRelieeFacture(id){return Object.values(fqLiens()).some(x=>(x.t==='facture'||x.t==='client')&&x.id===id);}
function fqPayeesLibres(){return dbGet('factures').filter(f=>f.statut==='payee'&&f.typeFacture!=='qonto'&&!fqRelieeFacture(f.id));}
function fqMemeClient(a,b){const nb=fqNorm(b);return !!a&&!!b&&(fqNorm(a)===nb||fqMots(a).some(w=>nb.indexOf(w)>=0));}
function fqFactures(tx){
  const l=fqNorm(tx.libelle);
  const c=dbGet('factures').filter(f=>f.statut!=='payee'&&Math.abs(fqReste(f)-tx.montant)<0.5);
  const nom=c.filter(f=>fqMots(f.client).some(w=>l.indexOf(w)>=0));
  // Déjà payée dans Indy, au même montant et au nom du client, pas encore reliée : le virement est sa trace
  const payees=fqPayeesLibres().filter(f=>Math.abs((f.montant||0)-tx.montant)<0.5&&fqMots(f.client).some(w=>l.indexOf(w)>=0));
  const memeMontant=c.concat(fqPayeesLibres().filter(f=>Math.abs((f.montant||0)-tx.montant)<0.5));
  return {toutes:c,parNom:nom,payees:payees,memeMontant:memeMontant};
}
/* Tout ce qui est ouvert chez le client reconnu : factures en attente, devis signés. Le plus probable d'abord. */
function fqOuvert(tx){
  if(tx.type!=='credit')return [];
  const client=fqClientNom(tx),out=[],m=tx.montant;
  if(!fqAlias(tx)&&!dbGet('factures').concat(dbGet('devis')).some(x=>fqMemeClient(x.client,tx.libelle)))return [];
  dbGet('factures').filter(f=>f.statut!=='payee'&&fqMemeClient(f.client,client)).forEach(f=>{
    const r=fqReste(f),recu=(f.montant||0)-r;if(r<0.5)return;
    const pile=Math.abs(r-m)<0.5;
    out.push({t:'facture',id:f.id,titre:'Facture '+(f.numero||'')+(f.description?', '+f.description:''),sous:'en attente'+(f.date?' depuis le '+fqJour(f.date):'')+(recu>0.5?', '+fmt0(recu)+' déjà reçus':''),mt:fmt0(r),btn:pile?'C’est ça':(m<r?'Payée en partie':'C’est ça'),score:pile?0:2});
  });
  dbGet('devis').filter(d=>d.statut==='signe'&&fqMemeClient(d.client,client)).forEach(d=>{
    const recu=fqRecu('devis',d.id),r=(d.montant||0)-recu;if(r<0.5)return;
    const pile=Math.abs(r-m)<0.5,pct=Math.round(m/(d.montant||1)*100),acompte=!recu&&[20,25,30,33,40,50].indexOf(pct)>=0;
    const quoi=pile?(recu?'Solde du devis ':'Paiement du devis '):(acompte?'Acompte du devis ':'Paiement du devis ');
    out.push({t:'devis',id:d.id,titre:quoi+(d.numero||'')+(d.description?', '+d.description:''),sous:'devis signé'+(d.date?' le '+fqJour(d.date):'')+(acompte?', '+pct+' % de '+fmt0(d.montant):'')+(recu?', '+fmt0(recu)+' déjà reçus':''),mt:recu?'reste '+fmt0(r):fmt0(d.montant),btn:'C’est ça',score:pile?0:acompte?1:2});
  });
  fqPayeesLibres().filter(f=>fqMemeClient(f.client,client)).forEach(f=>{
    const pile=Math.abs((f.montant||0)-m)<0.5,proche=f.datePaiement&&Math.abs(new Date(f.datePaiement)-new Date(tx.date))<=20*86400000;
    out.push({t:'facture',id:f.id,titre:'Facture '+(f.numero||'')+(f.description?', '+f.description:''),sous:'déjà payée'+(f.datePaiement?' le '+fqJour(f.datePaiement):'')+', pas encore reliée à un virement',mt:fmt0(f.montant),btn:'C’est ça',score:pile?(proche?0:1):3});
  });
  return out.sort((a,b)=>a.score-b.score);
}
function fqUrssaf(tx){
  const U=dbGetObj('urssaf'),y=+tx.date.slice(0,4),cles=[];
  ['T1','T2','T3','T4'].forEach(t=>{cles.push(t+'-'+y);});cles.push('T4-'+(y-1));
  const libres=cles.filter(k=>(U[k]||{}).statut!=='paye');
  libres.sort((a,b)=>Math.abs(new Date(fqEch(a))-new Date(tx.date))-Math.abs(new Date(fqEch(b))-new Date(tx.date)));
  return libres[0]||null;
}
function fqAbo(tx){
  const l=fqNorm(tx.libelle);
  return dbGet('abonnements').find(a=>(a.statut==='actif'||!a.statut)&&fqMots(a.nom).some(w=>l.indexOf(w)>=0)&&Math.abs((a.montant||0)-tx.montant)<=Math.max(2,(a.montant||0)*0.15));
}
/* Ce que l'outil propose pour un mouvement qu'il ne sait pas relier seul, par groupes */
function fqChoix(tx){
  if(tx.type==='credit'){
    const g=[];
    const dejaVus=fqOuvert(tx).map(o=>o.id);
    const f=fqFactures(tx).memeMontant.filter(x=>dejaVus.indexOf(x.id)<0).slice(0,3).map(x=>({t:'facture',id:x.id,l:(x.numero||'Facture')+', '+(x.client||'')+', '+fmt0(x.montant)}));if(f.length)g.push(['Au même montant',f]);
    g.push([g.length||fqOuvert(tx).length?'Sinon':'',[{t:'client',l:'Paiement sans facture'},{t:'remboursement',l:'Remboursement'},{t:'apport',l:'Apport perso'},{t:'entree',l:'Autre entrée'}]]);
    return g;
  }
  return [['Pour toi',[{t:'versement',l:'Mon salaire'},{t:'epargne',l:'Mis de côté'}]],
    ['Pour ta boîte',[{t:'charge',l:'Abonnement'},{t:'depense',id:'Prestataires',l:'Prestataire'},{t:'depense',id:'Impôts et taxes',l:'Impôts'},{t:'urssaf',l:'URSSAF'},{t:'depense',id:'Matériel',l:'Achat'},{t:'depense',id:'Autre',l:'Autre dépense'}]],
    ['',[{t:'ignore',l:'Pas pro'}]]];
}
/* Le nom du client : celui d'une facture ou d'un tiers qui partage un mot avec le libellé, sinon le libellé */
function fqAlias(tx){const l=fqNorm(tx.libelle);const a=fqRegles().find(r=>r.t==='alias'&&r.m&&l.indexOf(r.m)>=0);return a?a.client:null;}
function fqClientNom(tx){
  const al=fqAlias(tx);if(al)return al;
  const l=fqNorm(tx.libelle);
  // Les noms des devis, des tiers et des vraies factures d'abord : ceux des encaissements sans facture viennent du libellé de la banque
  const connus=[...new Set(dbGet('devis').map(d=>d.client).concat(dbGet('tiers').map(t=>t.nom),dbGet('factures').filter(f=>f.typeFacture!=='qonto').map(f=>f.client),dbGet('factures').map(f=>f.client)).filter(Boolean))];
  const c=connus.find(n=>fqMots(n).some(w=>l.indexOf(w)>=0));
  if(c)return c;
  return String(tx.libelle||'Client').toLowerCase().split(' ').filter(Boolean).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
}
function fqAutresFactures(tx){
  return dbGet('factures').filter(f=>f.typeFacture!=='qonto'&&(f.statut!=='payee'?fqReste(f)>=0.5:!fqRelieeFacture(f.id))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
}
function fqQuestion(tx){
  if(tx.type==='credit'&&fqOuvert(tx).length)return 'Reconnu : '+faEsc(fqClientNom(tx));
  if(tx.type==='credit'){const n=fqFactures(tx).memeMontant.length;return n>1?n+' factures à ce montant':n?'Une facture à ce montant':'Aucune facture à ce montant';}
  return 'C’est quoi ?';
}
/* Les effets d'un lien sur le reste de l'outil. Renvoie la cible reliée. */
async function fqAppliquer(tx,t,id){
  FQ_CREE=false;FQ_FACT=null;
  if(t==='client'){const f=await dbCreate('factures',{client:id||fqClientNom(tx),montant:tx.montant,date:tx.date,datePaiement:tx.date,statut:'payee',typeFacture:'qonto',description:'Encaissé sur Qonto'});FQ_CREE=true;return f.id;}
  if(t==='facture'){const f=dbGet('factures').find(x=>x.id===id);if(f&&f.statut!=='payee'&&fqReste(f)-tx.montant<0.5){await dbUpdate('factures',Object.assign({},f,{statut:'payee',datePaiement:tx.date}));FQ_CREE=true;}return id;}
  if(t==='devis'){
    const d=dbGet('devis').find(x=>x.id===id);if(!d)return null;
    const recu=fqRecu('devis',d.id),solde=Math.abs((d.montant||0)-recu-tx.montant)<0.5;
    const f=await dbCreate('factures',{client:d.client,montant:tx.montant,date:tx.date,datePaiement:tx.date,statut:'payee',typeFacture:'qonto',description:(solde&&recu?'Solde':recu?'Paiement':'Acompte')+' du devis '+(d.numero||'')});
    FQ_FACT=f.id;return id;
  }
  if(t==='urssaf'){const k=id||fqUrssaf(tx);if(!k)return null;await api('PUT','/api/urssaf/'+k,{statut:'paye',montantPaye:tx.montant,datePaye:tx.date});_cache.urssaf=await api('GET','/api/urssaf');return k;}
  if(t==='versement'){
    const pris={};Object.values(fqLiens()).forEach(x=>{if(x.t==='versement')pris[x.id]=1;});
    const manuel=dbGet('depenses').find(d=>d.categorie==='Versement perso'&&!pris[d.id]&&Math.abs((d.montant||0)-tx.montant)<0.5&&Math.abs(new Date(d.date)-new Date(tx.date))<=7*86400000);
    if(manuel)return manuel.id;
    const d=await dbCreate('depenses',{date:tx.date,description:'Versement perso',categorie:'Versement perso',montant:tx.montant});FQ_CREE=true;return d.id;
  }
  if(t==='depense'){const d=await dbCreate('depenses',{date:tx.date,description:tx.libelle||'Dépense',categorie:id||'Autre',montant:tx.montant});FQ_CREE=true;return d.id;}
  if(t==='charge'){
    if(id)return id;
    const a=fqAbo(tx);if(a)return a.id;
    const n=await dbCreate('abonnements',{nom:tx.libelle||'Charge fixe',montantMensuel:tx.montant,jourPrelevement:+tx.date.slice(8,10)||1,statut:'actif'});return n.id;
  }
  return id||null;
}
function fqLien(tx,t,id,auto){const c=FQ_CREE,f=FQ_FACT;FQ_CREE=false;FQ_FACT=null;return {t:t,id:id||null,d:tx.date,m:tx.montant,l:tx.libelle||'',s:tx.type,a:auto?1:0,c:c?1:0,f:f||null};}
/* Récupère les mouvements Qonto et relie tout seul ce qui est sûr */
async function fqRelier(force){
  if(FQ_EN_COURS)return false;
  if(!force&&FQ_MOUV&&Date.now()-FQ_DERNIER<60000)return false;
  FQ_EN_COURS=true;let change=false;
  try{
    try{await syncQonto(true);}catch(e){}
    try{const r=await api('GET','/api/qonto/mouvements');FQ_MOUV=Array.isArray(r)?r:[];}catch(e){FQ_MOUV=FQ_MOUV||[];}
    FQ_DERNIER=Date.now();
    const liens=Object.assign({},fqLiens()),limite=new Date(Date.now()-120*86400000).toISOString().slice(0,10);
    for(const tx of fqMouvements()){
      if(liens[tx.qontoId]||tx.date<limite)continue;
      const r=fqRegle(tx);let t=null,id=null;
      if(r&&r.t==='client'&&fqOuvert(tx).length)continue;
      if(r){t=r.t;id=r.t==='charge'?r.id:r.t==='depense'?(r.cat||'Autre'):r.t==='client'?(r.client||null):null;}
      else if(tx.type==='credit'){const f=fqFactures(tx);if(f.parNom.length===1){t='facture';id=f.parNom[0].id;}else if(!f.parNom.length&&f.payees.length===1){t='facture';id=f.payees[0].id;}else if(f.toutes.length===1&&f.parNom.length===0&&fqNorm(tx.libelle).length<3){t='facture';id=f.toutes[0].id;}}
      else if(fqNorm(tx.libelle).indexOf('urssaf')>=0){t='urssaf';}
      else{const a=fqAbo(tx);if(a){t='charge';id=a.id;}}
      if(!t)continue;
      try{const cible=await fqAppliquer(tx,t,id);liens[tx.qontoId]=fqLien(tx,t,cible,true);change=true;}catch(e){}
    }
    if(change)await fqEnregistrer(liens,fqRegles());
  }finally{FQ_EN_COURS=false;}
  return change;
}
function fqARanger(){
  const liens=fqLiens(),limite=new Date(Date.now()-60*86400000).toISOString().slice(0,10);
  return fqMouvements().filter(t=>!liens[t.qontoId]&&t.date>=limite);
}
async function fqRanger(qid,t,id){
  const tx=fqMouvements().find(x=>x.qontoId===qid);if(!tx)return;
  try{
    const cible=await fqAppliquer(tx,t,id);
    const liens=Object.assign({},fqLiens());liens[qid]=fqLien(tx,t,cible,false);
    let regles=fqRegles();
    if(t==='facture'||t==='devis'){
      const cible2=t==='facture'?dbGet('factures').find(f=>f.id===id):dbGet('devis').find(d=>d.id===id);const m=fqNorm(tx.libelle);
      if(cible2&&cible2.client&&m.length>=3&&!fqMemeClient(cible2.client,tx.libelle)){regles=regles.filter(r=>!(r.t==='alias'&&r.m===m));regles.push({m:m,t:'alias',client:cible2.client});}
    }
    if(t!=='facture'&&t!=='devis'&&t!=='entree'&&t!=='remboursement'&&t!=='apport'){const m=fqNorm(tx.libelle);if(m.length>=3){regles=regles.filter(r=>r.m!==m);const fc=t==='client'?dbGet('factures').find(f=>f.id===cible):null;regles.push({m:m,t:t,id:t==='charge'?cible:null,cat:t==='depense'?(id||'Autre'):null,client:fc?fc.client:null,sens:tx.type});}}
    await fqEnregistrer(liens,regles);
    // La règle apprise range aussitôt les mouvements du même nom
    await fqRelier(true);
    toast('Mouvement rangé','success');
  }catch(e){toast('Erreur : '+e.message,'error');}
  fqRafraichir();
}
async function fqDelier(qid){
  const liens=Object.assign({},fqLiens()),x=liens[qid];if(!x)return;
  if(!await confirmDialog('Changer ce mouvement ?','Il repasse dans « à ranger ».'))return;
  try{
    if(x.c&&(x.t==='depense'||x.t==='versement')&&x.id&&dbGet('depenses').some(v=>v.id===x.id))await dbDelete('depenses',x.id);
    if(x.c&&x.t==='client'&&x.id&&dbGet('factures').some(v=>v.id===x.id))await dbDelete('factures',x.id);
    if(x.t==='devis'&&x.f&&dbGet('factures').some(v=>v.id===x.f))await dbDelete('factures',x.f);
    if(x.t==='facture'&&x.id){const f=dbGet('factures').find(v=>v.id===x.id);if(f&&x.c&&f.statut==='payee'&&f.datePaiement===x.d)await dbUpdate('factures',Object.assign({},f,{statut:'attente',datePaiement:''}));}
    delete liens[qid];await fqEnregistrer(liens,fqRegles());
  }catch(e){toast('Erreur : '+e.message,'error');}
  fqRafraichir();
}
async function fqOublier(i){
  const r=fqRegles().slice();r.splice(i,1);await fqEnregistrer(fqLiens(),r);toast('Règle oubliée');fqRenderRegles();
}
function fqRafraichir(){
  const s=q('.section.active');const id=s?s.id.replace('section-',''):'';
  if(id==='transactions')fqRender();
  else if(id==='dashboard')loadAujourdhui();
  else if(id==='factures')loadFactures();
  else if(id==='abonnements')loadAbonnements();
  else if(id==='options')fqRenderRegles();
}
/* Ce que dit un lien, en une phrase, avec un lien vers l'écran concerné */
function fqQuoi(x){
  if(x.t==='facture'){const f=dbGet('factures').find(v=>v.id===x.id);const lien='<button class="fin-lien" data-s="factures" onclick="finGo(this)">'+faEsc(f?(f.numero||'La facture'):'La facture')+'</button>';return f&&f.statut!=='payee'?lien+' payée en partie, reste '+fmt0(fqReste(f)):f&&f.datePaiement&&f.datePaiement!==x.d?lien+', le virement de son paiement':lien+' passée en payée';}
  if(x.t==='devis'){const d=dbGet('devis').find(v=>v.id===x.id);return d?'<button class="fin-lien" data-s="devis" onclick="finGo(this)">Devis '+faEsc(d.numero||'')+'</button>, '+fmt0(fqRecu('devis',d.id))+' reçus sur '+fmt0(d.montant):'devis';}
  if(x.t==='urssaf')return x.id?'<button class="fin-lien" data-s="charges-urssaf" onclick="finGo(this)">'+fqNomT(x.id)+'</button> marqué payé':'URSSAF';
  if(x.t==='charge'){const a=dbGet('abonnements').find(v=>v.id===x.id);return '<button class="fin-lien" data-s="abonnements" onclick="finGo(this)">Abonnements</button>'+(a?', '+faEsc(a.nom):'');}
  if(x.t==='versement')return 'ton salaire, compté dans <button class="fin-lien" data-s="dashboard" onclick="finGo(this)">à te verser</button>';
  if(x.t==='depense'){const d=dbGet('depenses').find(v=>v.id===x.id);return '<button class="fin-lien" data-s="depenses" onclick="finGo(this)">Dépenses du mois</button>'+(d?', '+faEsc(d.categorie):'');}
  if(x.t==='client'){const f=dbGet('factures').find(v=>v.id===x.id);return (f?faEsc(f.client)+', ':'')+'compté dans ton <button class="fin-lien" data-s="factures" onclick="finGo(this)">chiffre d’affaires</button>';}
  if(x.t==='remboursement')return 'remboursement';
  if(x.t==='apport')return 'apport perso';
  if(x.t==='epargne')return 'gardé de côté';
  if(x.t==='ignore')return 'hors activité';
  return 'entrée hors facture';
}
function fqRender(){
  const el=q('#fq-zone');if(!el)return;
  if(!FQ_MOUV){el.innerHTML='<p class="fa-vide">Lecture de tes mouvements Qonto…</p>';fqRelier(true).then(()=>fqRender());return;}
  const liens=fqLiens(),ranger=fqARanger();
  const bouton=(tx,c)=>'<button class="fin-onglet" data-q="'+faEsc(tx.qontoId)+'" data-t="'+c.t+'" data-id="'+faEsc(c.id||'')+'" onclick="fqRanger(this.dataset.q,this.dataset.t,this.dataset.id)">'+faEsc(c.l)+'</button>';
  const autres=tx=>{const l=fqAutresFactures(tx);return l.length?'<select class="form-select fq-sel" aria-label="Une autre facture" data-q="'+faEsc(tx.qontoId)+'" onchange="if(this.value)fqRanger(this.dataset.q,&quot;facture&quot;,this.value)"><option value="">Une autre facture…</option>'+[['En attente',l.filter(f=>f.statut!=='payee')],['Déjà payées, pas encore reliées',l.filter(f=>f.statut==='payee')]].filter(g=>g[1].length).map(g=>'<optgroup label="'+g[0]+'">'+g[1].map(f=>'<option value="'+faEsc(f.id)+'">'+faEsc((f.numero||'Facture')+', '+(f.client||'')+', '+fmt0(f.montant))+'</option>').join('')+'</optgroup>').join('')+'</select>':'';};
  const ouvertHtml=tx=>{const o=fqOuvert(tx);if(!o.length)return '';return '<div class="fq-ouv"><p class="fq-gl">Ouvert chez '+faEsc(fqClientNom(tx))+'</p>'+o.slice(0,4).map((c,i)=>'<div class="fq-opt'+(i===0&&c.score<2?' fq-best':'')+'"><div><div class="fq-n">'+faEsc(c.titre)+'</div><div class="fq-s">'+faEsc(c.sous)+'</div></div><span class="fa-n fq-m">'+c.mt+'</span><button class="fa-btn'+(i===0&&c.score<2?'':' fa-btn--c')+'" data-q="'+faEsc(tx.qontoId)+'" data-t="'+c.t+'" data-id="'+faEsc(c.id)+'" onclick="fqRanger(this.dataset.q,this.dataset.t,this.dataset.id)">'+c.btn+'</button></div>').join('')+'</div>';};
  const ligneR=tx=>'<div class="fq-l fq-ar"><span class="fq-d fa-n">'+fqDm(tx.date)+'</span><div><div class="fq-n">'+faEsc(tx.libelle||'Mouvement')+'</div><div class="fq-s">'+fqQuestion(tx)+'</div></div><span class="fq-m fa-n">'+(tx.type==='credit'?'+ ':'− ')+fmt(tx.montant)+'</span>'+ouvertHtml(tx)+'<div class="fq-gr">'+
    fqChoix(tx).map(g=>'<div class="fq-g">'+(g[0]?'<span class="fq-gl">'+g[0]+'</span>':'')+'<div class="fq-ch">'+g[1].map(c=>bouton(tx,c)).join('')+'</div></div>').join('')+
    (tx.type==='credit'?'<div class="fq-g">'+autres(tx)+'</div>':'')+'</div></div>';
  const relies=fqMouvements().filter(t=>liens[t.qontoId]).slice(0,40);
  const ligneL=tx=>{const x=liens[tx.qontoId],ty=FQ_TYPES[x.t]||FQ_TYPES.entree;return '<div class="fq-l"><span class="fq-d fa-n">'+fqDm(tx.date)+'</span><div class="fq-n">'+faEsc(tx.libelle||'Mouvement')+'</div><span class="fq-m fa-n">'+(tx.type==='credit'?'+ ':'− ')+fmt(tx.montant)+'</span><div class="fq-q"><span class="fa-pas '+ty[1]+'">'+ty[0]+'</span><span class="fq-s">'+fqQuoi(x)+'</span><button class="fin-lien fq-chg" data-q="'+faEsc(tx.qontoId)+'" onclick="fqDelier(this.dataset.q)">Changer</button></div></div>';};
  const sync=dbGetObj('settings').qontoSyncAt;
  el.innerHTML=
    (ranger.length?'<div class="fa-creme fq-tete"><div><span class="fa-k">à ranger</span><b>'+ranger.length+' mouvement'+(ranger.length>1?'s':'')+' que l’outil ne connaît pas encore</b><span class="fa-k fa-k--f">Un clic chacun. Ta réponse sert aussi pour les suivants du même nom.</span></div></div><div class="fa-blanc fin-liste fq-bloc">'+ranger.map(ligneR).join('')+'</div>'
      :'<div class="fa-creme fq-tete"><div><span class="fa-k">à ranger</span><b>Tout est rangé</b><span class="fa-k fa-k--f">Chaque mouvement Qonto des deux derniers mois est relié.</span></div></div>')+
    '<div class="fq-h"><h2 class="fa-h2">Reliés</h2><span class="fq-s">'+(sync?'synchronisé le '+fqDm(sync.slice(0,10))+' à '+sync.slice(11,16).replace(':',' h '):'')+'</span></div>'+
    '<div class="fa-blanc fin-liste fq-bloc">'+(relies.length?relies.map(ligneL).join(''):'<p class="fa-vide">Aucun mouvement relié pour l’instant.</p>')+'</div>';
}
function fqRenderRegles(){
  const el=q('#fq-regles');if(!el)return;
  const r=fqRegles();
  el.innerHTML='<h2 class="fa-h2">Ce que l’outil a appris</h2><p class="fq-s" style="margin:0 0 8px">Tes réponses aux mouvements Qonto. Les suivants du même nom sont rangés tout seuls.</p>'+
    (r.length?r.map((x,i)=>'<div class="fq-r"><span class="fq-n">'+faEsc(x.m)+'</span><span class="fq-s">'+(x.t==='alias'?'paie pour '+faEsc(x.client):(FQ_TYPES[x.t]||FQ_TYPES.entree)[0])+'</span><button class="fin-lien" data-i="'+i+'" onclick="fqOublier(+this.dataset.i)">Oublier</button></div>').join(''):'<p class="fa-vide">Rien pour l’instant.</p>');
}
/* À te verser : un plafond, pas une obligation */
function fqPlafond(k){
  const now=new Date(),mKey=k||now.toISOString().slice(0,7),S=dbGetObj('settings');
  const tU=(S.tauxUrssaf||25.6)/100,tC=(S.tauxCfp||0.2)/100,pas=S.pasFixe||40,pct=S.pctVersement||65;
  const ca=dbGet('factures').filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const dep=dbGet('depenses').filter(d=>(d.date||'').startsWith(mKey)&&d.categorie!=='Versement perso').reduce((s,d)=>s+(d.montant||0),0);
  const abo=dbGet('abonnements').filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montantMensuel||a.montant||0),0);
  const cot=ca*(tU+tC),net=Math.max(0,ca-cot-pas-dep-abo),plafond=Math.round(net*pct/100);
  const deja=fqVersements(mKey).reduce((s,d)=>s+(d.montant||0),0);
  return {mKey:mKey,ca:ca,cot:cot,pas:pas,charges:dep+abo,net:net,pct:pct,plafond:plafond,deja:deja,reste:Math.max(0,plafond-deja),clos:!!(S.versementClos||{})[mKey],nomMois:new Date(mKey+'-15T12:00:00').toLocaleDateString('fr-FR',{month:'long'})};
}
function fqRafraichirVerser(){if(q('#section-enveloppes.active'))fqCarteSalaire();else if(q('#section-cloture.active'))loadCloture();else loadAujourdhui();}
/* Trésorerie : ton salaire en carte à part, sans objectif */
function fqCarteSalaire(){
  const el=q('#fq-salaire');if(!el)return;
  const e=(_enveloppes||[]).find(x=>x.id==='salaire'),P=fqPlafond();FQ_VERSER={reste:P.reste};
  const cote=e?Math.round(e.solde||0):0;
  const fini=fcEtat(P.mKey).fini,NomM=P.nomMois.charAt(0).toUpperCase()+P.nomMois.slice(1);
  const phrase=fini?NomM+' clôturé, '+fmt0(P.reste)+' gardés de côté.'
    :P.clos?'En '+P.nomMois+', '+fmt0(P.deja)+' pour toi et '+fmt0(P.reste)+' gardés de côté.'+fqOuGarde(P.mKey)
    :P.deja>P.plafond&&P.deja>0?fmt0(P.deja)+' versés ce mois-ci, '+fmt0(P.deja-P.plafond)+' de plus que prévu.'
    :(P.deja>0?'Ce mois-ci, tu peux encore te verser jusqu’à '+fmt0(P.reste)+' ('+fmt0(P.deja)+' déjà versés).':'Ce mois-ci, tu peux te verser jusqu’à '+fmt0(P.plafond)+'.')+' Ce que tu ne prends pas reste dans ta trésorerie.';
  el.innerHTML='<div><span class="fa-k">ton salaire</span><b class="fa-gros">'+fmt0(cote)+' de côté</b><span class="fa-k fa-k--f">'+phrase+'</span></div>'+
    (fini?'<div class="fin-liens"><button class="fin-lien" onclick="fcOuvrir()">Revoir</button><button class="fin-lien" data-k="'+P.mKey+'" onclick="fcRouvrir(this.dataset.k)">Rouvrir</button></div>'
      :P.clos?'<button class="fin-lien" data-m="'+P.mKey+'" onclick="fqGarder(this.dataset.m,false)">Changer d’avis</button>'
      :'<div class="fin-btns"><button class="fa-btn" onclick="fqVerserOuvrir()">Me verser</button><button class="fa-btn fa-btn--c" data-m="'+P.mKey+'" onclick="fqGarder(this.dataset.m,true)">Garder de côté</button></div>');
}
let FQ_VERSER=null;
function fqVersements(mKey){return dbGet('depenses').filter(d=>d.categorie==='Versement perso'&&(d.date||'').startsWith(mKey)).sort((a,b)=>(a.date||'').localeCompare(b.date||''));}
function fqDeQonto(depId){return Object.values(fqLiens()).some(x=>x.t==='versement'&&x.id===depId);}
function fqVerserOuvrir(){
  const r=FQ_VERSER||{reste:0};
  let m=q('#fq-verser');
  if(!m){m=document.createElement('div');m.id='fq-verser';m.className='fq-modale';document.body.appendChild(m);}
  m.innerHTML='<div class="fq-fen" role="dialog" aria-modal="true" aria-labelledby="fq-verser-t"><h2 class="fa-h2" id="fq-verser-t">Combien tu te verses ?</h2>'+
    '<p class="fq-s">Jusqu’à '+fmt0(r.reste)+' ce mois-ci. Moins, c’est très bien aussi : le reste part en trésorerie.</p>'+
    '<div class="fq-champs"><label>Montant<input type="number" min="0" step="1" id="fq-v-m" class="form-input" value="'+Math.round(r.reste)+'" oninput="fqVerserCalc()"></label><label>Date<input type="date" id="fq-v-d" class="form-input" value="'+(r.date||finAuj())+'"></label></div>'+
    '<div class="fa-l"><span>Gardé de côté</span><span class="fa-n" id="fq-v-c">'+fmt0(0)+'</span></div>'+
    '<p class="fq-s">Fait depuis Qonto, le virement est reconnu tout seul. Depuis une autre banque, enregistre-le ici.</p>'+
    '<div class="fq-bas"><button class="fa-btn fa-btn--c" onclick="fqVerserFermer()">Annuler</button><button class="fa-btn" onclick="fqVerserOk()">Enregistrer</button></div></div>';
  m.onclick=e=>{if(e.target===m)fqVerserFermer();};m.onkeydown=e=>{if(e.key==='Escape')fqVerserFermer();};
  m.style.display='flex';fqVerserCalc();q('#fq-v-m').focus();
}
function fqVerserCalc(){const r=FQ_VERSER||{reste:0},v=parseFloat(q('#fq-v-m').value)||0;q('#fq-v-c').textContent=fmt0(Math.max(0,r.reste-v));}
function fqVerserFermer(){const m=q('#fq-verser');if(m)m.style.display='none';}
async function fqVerserOk(){
  const v=parseFloat(q('#fq-v-m').value)||0,d=q('#fq-v-d').value||finAuj();
  if(v<=0){toast('Indique un montant','error');return;}
  try{await dbCreate('depenses',{date:d,description:'Versement perso',categorie:'Versement perso',montant:v});fqVerserFermer();toast('Versement enregistré','success');fqRafraichirVerser();}
  catch(e){toast('Erreur : '+e.message,'error');}
}
/* Garder de côté : propose d'abord de virer le solde de l'enveloppe salaire vers Trésorerie, puis clôt le mois.
   versementClos[mois] vaut 'tresorerie' (viré) ou 'salaire' (resté dans l'enveloppe salaire). */
async function fqGarder(mKey,oui){
  if(!oui){await fqClore(mKey,null);return;}
  if(!(_enveloppes||[]).length){try{const r=await api('GET','/api/enveloppes');_enveloppes=r.enveloppes||[];}catch(e){}}
  const sal=(_enveloppes||[]).find(x=>x.id==='salaire'),solde=Math.floor(sal?sal.solde||0:0);
  if(solde<1){await fqClore(mKey,'salaire');return;}
  let m=q('#fq-garder');
  if(!m){m=document.createElement('div');m.id='fq-garder';m.className='fq-modale';document.body.appendChild(m);}
  m.innerHTML='<div class="fq-fen" role="dialog" aria-modal="true" aria-labelledby="fq-garder-t"><h2 class="fa-h2" id="fq-garder-t">Virer '+fmt0(solde)+' vers ta trésorerie ?</h2>'+
    '<p class="fq-s">C’est ce qui reste dans ton enveloppe salaire. Dans Trésorerie, il compte pour ton coussin.</p>'+
    '<div class="fq-bas"><button class="fa-btn fa-btn--c" data-m="'+mKey+'" onclick="fqGarderFin(this.dataset.m,0)">Pas maintenant</button><button class="fa-btn" data-m="'+mKey+'" data-v="'+solde+'" onclick="fqGarderFin(this.dataset.m,+this.dataset.v)">Oui</button></div></div>';
  m.onclick=e=>{if(e.target===m)m.style.display='none';};m.onkeydown=e=>{if(e.key==='Escape')m.style.display='none';};
  m.style.display='flex';m.querySelector('.fa-btn:last-child').focus();
}
async function fqGarderFin(mKey,montant){
  const m=q('#fq-garder');if(m)m.style.display='none';
  if(montant>0){
    try{await api('POST','/api/virements',{de:'salaire',vers:'tresorerie',montant:montant,date:finAuj(),motif:'Salaire gardé de côté'});toast(fmt0(montant)+' virés vers ta trésorerie','success');}
    catch(e){toast(e.message||'Virement impossible','error');return;}
    try{const r=await api('GET','/api/enveloppes');_enveloppes=r.enveloppes||[];}catch(e){}
  }
  await fqClore(mKey,montant>0?'tresorerie':'salaire');
}
async function fqClore(mKey,ou){
  const s=Object.assign({},dbGetObj('settings'));const c=Object.assign({},s.versementClos||{});
  if(ou)c[mKey]=ou;else delete c[mKey];
  await dbSet('settings',Object.assign(s,{versementClos:c}));
  if(q('#section-enveloppes.active'))loadEnveloppes();else fqRafraichirVerser();
}
/* ─── Clôturer le mois : 4 étapes, une à la fois ───
   Le mois à clôturer : le mois en cours, ou le précédent pendant les 10 premiers jours.
   Ce qui est fait vit dans les réglages (cloture[mois] = {importe, fini}). */
let FC_ETAPE=null;
function fcMois(){const d=new Date();if(d.getDate()<=10)d.setMonth(d.getMonth()-1,1);return d.toISOString().slice(0,7);}
function fcNom(k){return new Date(k+'-15T12:00:00').toLocaleDateString('fr-FR',{month:'long'});}
function fcEtat(k){return (dbGetObj('settings').cloture||{})[k]||{};}
async function fcNoter(k,champs){const S=Object.assign({},dbGetObj('settings'));const c=Object.assign({},S.cloture||{});c[k]=Object.assign({},c[k]||{},champs);await dbSet('settings',Object.assign(S,{cloture:c}));}
function fcARanger(k){return FQ_MOUV?fqARanger().filter(t=>t.date.startsWith(k)):[];}
function fcFaits(k){const e=fcEtat(k),P=fqPlafond(k);return [!!e.importe,!!FQ_MOUV&&fcARanger(k).length===0,P.clos||P.deja>0,!!e.fini];}
function fcOuvrir(){FC_ETAPE=null;navigate('cloture');}
function fcAller(i){FC_ETAPE=i;loadCloture();}
function loadCloture(){
  if(!FQ_MOUV&&!FQ_EN_COURS)fqRelier().then(()=>{if(q('#section-cloture.active'))loadCloture();});
  const k=fcMois(),nom=fcNom(k),f=fcFaits(k),n=fcARanger(k).length;
  if(FC_ETAPE==null){FC_ETAPE=f.indexOf(false);if(FC_ETAPE<0)FC_ETAPE=3;}
  const titres=['Importer','Vérifier','Te verser','Mettre de côté'];
  const sous=[f[0]?'Indy et Qonto, fait':'Indy et Qonto',!FQ_MOUV?'lecture de Qonto…':n?n+' mouvement'+(n>1?'s':'')+' à ranger':'tout est rangé',f[2]?'fait':'ce que tu peux te verser',f[3]?'mois clôturé':'URSSAF et trésorerie'];
  const etapes=titres.map((t,i)=>'<button class="fc-e'+(i===FC_ETAPE?' on':'')+(f[i]?' fait':'')+'" data-i="'+i+'" onclick="fcAller(+this.dataset.i)"'+(i===FC_ETAPE?' aria-current="step"':'')+'><span class="fc-n fa-n">'+(i+1)+'</span><span><span class="fc-t">'+t+'</span><span class="fc-s">'+sous[i]+'</span></span></button>').join('');
  const nav=(FC_ETAPE>0?'<button class="fin-lien" data-i="'+(FC_ETAPE-1)+'" onclick="fcAller(+this.dataset.i)">Étape '+FC_ETAPE+', '+titres[FC_ETAPE-1]+'</button>':'<span></span>')+(FC_ETAPE<3?'<button class="fin-lien" data-i="'+(FC_ETAPE+1)+'" onclick="fcAller(+this.dataset.i)">Étape '+(FC_ETAPE+2)+', '+titres[FC_ETAPE+1]+'</button>':'');
  q('#fc-zone').innerHTML='<p class="fc-fil"><button class="fin-lien" data-s="dashboard" onclick="finGo(this)">Aujourd’hui</button> <span class="fq-s">· Clôturer '+nom+'</span></p>'+
    '<h1 class="fa-titre">Clôturer '+nom+'</h1><p class="fa-sous">'+(f[3]?'C’est fait pour '+nom+'.':'Une fois par mois, dans l’ordre, et c’est réglé.')+'</p>'+
    '<div class="fc-grille"><nav class="fc-etapes" aria-label="Étapes">'+etapes+'</nav><section class="fa-blanc fc-corps"><div class="fa-k2">Étape '+(FC_ETAPE+1)+' sur 4</div>'+fcCorps(k,FC_ETAPE)+'<div class="fc-nav">'+nav+'</div></section></div>';
}
function fcLigne(l,v,cls){return '<div class="fc-l'+(cls?' '+cls:'')+'"><span>'+l+'</span><span class="fa-n">'+v+'</span></div>';}
function fcCorps(k,i){
  const nom=fcNom(k),S=dbGetObj('settings');
  if(i===0){
    const nf=dbGet('factures').filter(f=>(f.date||'').startsWith(k)||(f.datePaiement||'').startsWith(k)).length,sync=S.qontoSyncAt;
    return '<h2 class="fa-h2 fc-h">Tes données de '+nom+'</h2>'+
      '<div class="fc-r"><div><div class="fq-n">Tes factures et devis Indy</div><div class="fq-s">'+nf+' facture'+(nf>1?'s':'')+' de '+nom+' dans l’outil</div></div><button class="fa-btn fa-btn--c" data-s="import-export" onclick="finGo(this)">Importer un CSV</button></div>'+
      '<div class="fc-r"><div><div class="fq-n">Ton compte Qonto</div><div class="fq-s">'+(sync?'synchronisé le '+fqDm(sync.slice(0,10))+' à '+sync.slice(11,16).replace(':',' h '):'pas encore synchronisé')+'</div></div><button class="fa-btn fa-btn--c" onclick="fcSynchro()">Synchroniser</button></div>'+
      '<div class="fa-creme fc-bas"><div><span class="fa-k">tout est à jour ?</span><span class="fa-k fa-k--f">Importe les factures de '+nom+' depuis Indy si ce n’est pas déjà fait.</span></div><button class="fa-btn" data-k="'+k+'" onclick="fcImporte(this.dataset.k)">Oui, étape suivante</button></div>';
  }
  if(i===1){
    const l=fcARanger(k);
    if(!FQ_MOUV)return '<h2 class="fa-h2 fc-h">Ranger les mouvements de '+nom+'</h2><p class="fa-vide">Lecture de tes mouvements Qonto…</p>';
    if(!l.length)return '<h2 class="fa-h2 fc-h">Ranger les mouvements de '+nom+'</h2><div class="fa-creme fc-bas"><div><b>Tout est rangé</b><span class="fa-k fa-k--f">Chaque mouvement Qonto de '+nom+' est relié à ce qu’il représente.</span></div><button class="fa-btn" onclick="fcAller(2)">Étape suivante</button></div>';
    return '<h2 class="fa-h2 fc-h">Ranger les mouvements de '+nom+'</h2><p class="fq-s">L’outil ne sait pas encore à quoi correspondent ces mouvements. Un clic chacun, dans Mouvements.</p>'+
      l.slice(0,6).map(t=>fcLigne(fqDm(t.date)+' · '+faEsc(t.libelle||'Mouvement'),(t.type==='credit'?'+ ':'− ')+fmt(t.montant))).join('')+(l.length>6?'<p class="fq-s">et '+(l.length-6)+' autres</p>':'')+
      '<div class="fc-actions"><button class="fa-btn" data-s="transactions" onclick="finGo(this)">Ranger maintenant</button></div>';
  }
  const P=fqPlafond(k);
  FQ_VERSER={reste:P.reste,date:k===finAuj().slice(0,7)?finAuj():k+'-'+String(new Date(+k.slice(0,4),+k.slice(5,7),0).getDate()).padStart(2,'0')};
  if(i===2){
    const tx=Math.round(((S.tauxUrssaf||25.6)+(S.tauxCfp||0.2))*10)/10;
    return '<h2 class="fa-h2 fc-h">Ce que tu peux te verser</h2>'+
      fcLigne('Encaissé en '+nom,fmt0(P.ca))+fcLigne('URSSAF et formation, '+String(tx).replace('.',',')+' %','− '+fmt0(P.cot))+fcLigne('Prélèvement à la source','− '+fmt0(P.pas))+fcLigne('Charges fixes et dépenses','− '+fmt0(P.charges))+fcLigne('Il reste',fmt0(P.net))+
      '<div class="fc-total"><span class="fc-tt">Jusqu’à '+P.pct+' % pour toi</span><span class="fa-gros2 fa-n">'+fmt0(P.plafond)+'</span></div>'+
      (P.clos?'<div class="fa-creme fc-bas"><div><b>'+fmt0(P.deja)+' pour toi, '+fmt0(P.reste)+' de côté</b><span class="fa-k fa-k--f">C’est noté pour '+nom+'.</span></div><button class="fa-btn" onclick="fcAller(3)">Étape suivante</button></div>'
      :'<div class="fa-creme fc-bas"><div><span class="fa-k">'+(P.deja?'déjà versé : '+fmt0(P.deja)+', tu peux encore te verser jusqu’à':'combien veux-tu te verser ?')+'</span><b class="fa-n">'+fmt0(P.reste)+'</b><span class="fa-k fa-k--f">Tu peux te verser moins et garder le reste de côté.</span></div><div class="fin-btns"><button class="fa-btn" onclick="fqVerserOuvrir()">Me verser</button><button class="fa-btn fa-btn--c" data-m="'+k+'" onclick="fqGarder(this.dataset.m,true)">Garder de côté</button></div></div>');
  }
  const t=['T1','T1','T1','T2','T2','T2','T3','T3','T3','T4','T4','T4'][+k.slice(5,7)-1]+'-'+k.slice(0,4);
  const reste=Math.max(0,Math.round(P.net-P.deja));
  // D'où virer : Qonto non rangé s'il a assez, sinon l'enveloppe salaire, sans jamais dépasser ce qui est disponible
  if(!(_enveloppes||[]).length&&!fcCorps._env){fcCorps._env=1;api('GET','/api/enveloppes').then(r=>{_enveloppes=r.enveloppes||[];if(q('#section-cloture.active'))loadCloture();}).catch(()=>{});}
  const dispo=id=>{const e=(_enveloppes||[]).find(x=>x.id===id);return e?Math.max(0,Math.floor(e.solde||0)):0;};
  // Qonto : seulement l'argent vraiment libre (solde moins abonnements restants, impôts, URSSAF, enveloppes et paiements réservés)
  const dQ=(_enveloppes||[]).length?apEtat().libre:0,dS=dispo('salaire'),plaf=Math.max(0,Math.round(P.reste));
  const src=!(_enveloppes||[]).length?null:dQ>=reste?['qonto',reste,'ton compte Qonto']:dS>=1?['salaire',Math.min(reste,dS),'ton enveloppe salaire',dS<reste]:Math.min(dQ,plaf)>=1?['qonto',Math.min(dQ,plaf),'ce qui est libre sur ton compte Qonto',dQ<plaf]:null;
  if(fcEtat(k).fini)return '<h2 class="fa-h2 fc-h">Mettre de côté</h2><div class="fa-creme fc-bas"><div><b>'+nom.charAt(0).toUpperCase()+nom.slice(1)+' est clôturé</b><span class="fa-k fa-k--f">Tout est réglé pour ce mois-ci.</span></div><button class="fin-lien" data-k="'+k+'" onclick="fcRouvrir(this.dataset.k)">Rouvrir le mois</button></div>';
  return '<h2 class="fa-h2 fc-h">Mettre de côté</h2>'+
    fcLigne('Provision URSSAF pour '+nom,fmt0(P.cot))+'<p class="fq-s fc-note">À déclarer avec le '+fqNomT(t)+', avant le '+fqJour(fqEch(t))+'. Laisse-la sur ton compte Qonto : elle n’est pas à toi.</p>'+
    fcLigne('Ce qui reste pour ta trésorerie',fmt0(reste))+'<p class="fq-s fc-note">Ce que tu ne t’es pas versé. Le virer vers l’enveloppe Trésorerie remplit ton coussin.</p>'+
    (reste>0?(!(_enveloppes||[]).length?'<p class="fq-s">Lecture de tes enveloppes…</p>':src?'<div class="fc-actions"><button class="fa-btn fa-btn--c" data-m="'+src[1]+'" data-de="'+src[0]+'" onclick="finVirerVers(&quot;tresorerie&quot;,this.dataset.m,this.dataset.de)">Virer '+fmt0(src[1])+' vers Trésorerie</button></div><p class="fq-s fc-note">Depuis '+src[2]+(src[3]?', tout ce qui y reste':'')+'.</p>':'<p class="fq-s fc-note">Rien à virer ce mois-ci : ton argent est déjà rangé ou réservé.</p>'):'')+
    '<div class="fa-creme fc-bas"><div><span class="fa-k">c’est tout pour '+nom+'</span><span class="fa-k fa-k--f">Le mois passe en clôturé. Tu peux le rouvrir à tout moment.</span></div><button class="fa-btn" data-k="'+k+'" onclick="fcFinir(this.dataset.k)">Clôturer '+nom+'</button></div>';
}
async function fcSynchro(){try{await syncQonto(false);}catch(e){}FQ_DERNIER=0;await fqRelier(true);loadCloture();}
async function fcImporte(k){await fcNoter(k,{importe:true});fcAller(1);}
async function fcFinir(k){await fcNoter(k,{fini:true,le:finAuj()});toast(fcNom(k).charAt(0).toUpperCase()+fcNom(k).slice(1)+' est clôturé','success');FC_ETAPE=null;navigate('dashboard');}
async function fcRouvrir(k){await fcNoter(k,{fini:false});toast(fcNom(k).charAt(0).toUpperCase()+fcNom(k).slice(1)+' est rouvert','success');if(q('#section-cloture.active'))loadCloture();else{FC_ETAPE=3;navigate('cloture');}}
/* Le bandeau d'Aujourd'hui : en fin de mois, et jusqu'au 10 du mois suivant */
function fcBandeau(){
  const el=q('#fa-cloture');if(!el)return;
  const k=fcMois(),j=new Date().getDate();
  if(j<25&&j>10){el.innerHTML='';el.style.display='none';el.className='fc-bandeau';return;}
  // Mois déjà clôturé : une ligne discrète pour le revoir ou le rouvrir
  if(fcEtat(k).fini){const e=fcEtat(k);el.style.display='';el.className='fc-clos';
    el.innerHTML='<span>'+fcNom(k).charAt(0).toUpperCase()+fcNom(k).slice(1)+' est clôturé'+(e.le?' depuis le '+fqJour(e.le):'')+'.</span><button class="fin-lien" onclick="fcOuvrir()">Revoir la clôture</button><button class="fin-lien" data-k="'+k+'" onclick="fcRouvrir(this.dataset.k)">Rouvrir '+fcNom(k)+'</button>';return;}
  el.className='fc-bandeau';
  const f=fcFaits(k),titres=['Importer','Vérifier','Te verser','Mettre de côté'];
  el.style.display='';
  el.innerHTML='<div><div class="fc-bk">Fin '+fcNom(k)+'</div><div class="fc-bt">Clôture ton mois en 4 étapes, environ 10 minutes</div></div>'+
    '<div class="fc-bpas">'+titres.map((t,i)=>'<span class="'+(f[i]?'fait':'')+'">'+(i+1)+' '+t+'</span>').join('')+'</div>'+
    '<button class="fa-btn fc-bgo" onclick="fcOuvrir()">'+(f.some(x=>x)?'Continuer':'Commencer')+'</button>';
}
function fqOuGarde(mKey){const v=(dbGetObj('settings').versementClos||{})[mKey];return v==='salaire'?' Ce que tu ne prends pas reste de côté dans ton salaire.':v==='tresorerie'?' Le reste est parti dans ta trésorerie.':'';}
/* ─── Factures et devis : Devis, Projets, Clients (maquettes validées) ─── */
let FV_CLIENTS='';
function fvMini(n,tot){let h='<span class="fv-mini">';for(let i=0;i<tot;i++)h+='<i class="'+(i<n?'on':'')+'"></i>';return h+'</span>';}
/* Reçu sur un devis : les factures payées de ses projets, ou les virements Qonto reliés au devis */
function fvRecuDevis(d){
  const p=dbGet('projets').filter(x=>x.devisId===d.id).map(x=>x.id);
  const viaProjet=dbGet('factures').filter(f=>f.statut==='payee'&&p.indexOf(f.projetId)>=0).reduce((s,f)=>s+(f.montant||0),0);
  return Math.max(viaProjet,fqRecu('devis',d.id));
}
function fvFiltre(sec,st){
  if(sec==='tiers')FV_CLIENTS=st;else if(sec==='projets')FV_PROJETS=st;else{const sel=q('#'+sec+'-filter-statut');if(sel)sel.value=st;}
  qa('#'+sec+'-pills .fin-onglet').forEach(b=>b.classList.toggle('on',b.dataset.s===st));
  ({devis:renderDevis,projets:renderProjets,tiers:renderTiers})[sec]();
}
function fvLignesDevis(list){
  const auj=finAuj(),dm=x=>x?fmtDate(x).slice(0,5):'—';
  return list.length?list.map(d=>{
    const recu=d.statut==='signe'?fvRecuDevis(d):0,reste=Math.max(0,(d.montant||0)-recu);
    const expire=d.statut==='envoye'&&d.dateExpiration&&d.dateExpiration<auj;
    let ou;
    if(d.statut==='signe')ou='<span class="fa-pas fa-p-m">signé</span><span class="fin-cl__s">'+(recu?(reste<0.5?'tout est reçu':fmt0(recu)+' reçus, reste '+fmt0(reste)):'rien reçu pour l’instant')+'</span>'+fvMini(Math.min(12,Math.round(recu/(d.montant||1)*12)),12);
    else if(expire)ou='<span class="fa-pas fa-p-n">expiré</span>';
    else if(d.statut==='envoye')ou='<span class="fa-pas fa-p-a">envoyé</span>'+(d.date?'<span class="fin-cl__s">sans réponse depuis '+finJours(d.date)+' jours</span>':'');
    else if(d.statut==='refuse')ou='<span class="fa-pas fa-p-n">refusé</span>';
    else ou='<span class="fa-pas fa-p-n">brouillon</span>';
    return '<tr><td class="td-mono">'+faEsc(d.numero||'—')+'</td><td><span class="fin-cl">'+faEsc(d.client||'—')+'</span>'+(d.description?'<span class="fin-cl__s">'+faEsc(d.description)+'</span>':'')+'</td><td>'+dm(d.date)+'</td><td>'+dm(d.dateExpiration)+'</td><td class="td-amount">'+fmt(d.montant||0)+'</td><td class="fv-ou">'+ou+'</td><td class="fin-act">'+
      (d.pdfKey?'<button class="fin-lien" data-id="'+d.id+'" data-n="'+faEsc(d.numero||'')+'" onclick="previewDevisPDF(this.dataset.id,this.dataset.n)">PDF</button>':'')+
      (d.statut==='signe'&&!dbGet('projets').some(p=>p.devisId===d.id)?'<button class="fin-lien" data-id="'+d.id+'" onclick="creerProjetDepuisDevis(this.dataset.id)">Créer le projet</button>':'')+
      '<button class="fin-lien" data-id="'+d.id+'" onclick="editDevis(this.dataset.id)">Modifier</button><button class="fin-lien" data-id="'+d.id+'" onclick="deleteDevis(this.dataset.id)">Supprimer</button></td></tr>';
  }).join(''):'<tr><td colspan="7" class="fin-vide">Aucun devis</td></tr>';
}
/* Projets rangés par étape de paiement : à relancer, à facturer, en attente, réglés */
let FV_PROJETS='';
const FV_ETAPES=[['facturer','À facturer','le travail est fait ou le mois a commencé, la facture n’est pas partie'],['relancer','À relancer','la date de paiement est passée'],['attente','En attente de paiement','la facture est partie, rien à faire pour l’instant'],['regle','Réglés','tout est payé, tu peux les passer en terminés']];
function fvEtape(p,factures,mk,nomMois){
  const lies=factures.filter(f=>f.projetId===p.id),facture=lies.reduce((s,f)=>s+(f.montant||0),0),payees=lies.filter(f=>f.statut==='payee');
  const dv=p.devisId&&dbGet('devis').find(d=>d.id===p.devisId),encaisse=Math.max(payees.reduce((s,f)=>s+(f.montant||0),0),dv?fvRecuDevis(dv):0);
  const total=p.montantTotal||0,mensuel=p.type==='mensuel',ouvertes=lies.filter(f=>f.statut!=='payee');
  const r={p,mensuel,total,encaisse,payees};
  if(mensuel){r.enc=fmt0(encaisse)+' encaissés';r.n=Math.min(12,payees.length);}
  else{r.enc=fmt0(encaisse)+' sur '+fmt0(total);r.n=total>0?Math.min(12,Math.round(encaisse/total*12)):0;}
  if(p.statut==='termine'){r.e='termine';r.t='Terminé';r.s=encaisse>=total-0.5||mensuel?'tout est réglé':'reste '+fmt0(total-encaisse)+' non encaissés';return r;}
  const retard=ouvertes.filter(finEnRetard).sort((a,b)=>(a.dateEcheance||a.date||'').localeCompare(b.dateEcheance||b.date||''))[0];
  if(retard){r.e='relancer';r.f=retard;r.t='Relancer '+(p.client||'le client');r.s='facture '+(retard.numero||'')+', en retard depuis '+finJours(retard.dateEcheance||retard.date)+' jours';return r;}
  if(mensuel){
    const parMois=p.dureeIndeterminee?total:(p.nombreMois?Math.round(total/p.nombreMois*100)/100:total);
    if(!lies.some(f=>(f.date||'').startsWith(mk))){r.e='facturer';r.m=parMois;r.ft='mensuel';r.t='Facturer '+nomMois;r.s=fmt0(parMois)+', comme chaque mois';r.b='Facturer '+nomMois;return r;}
  }else{
    const reste=Math.max(0,total-Math.max(facture,encaisse));
    if(reste>=0.5&&!ouvertes.length){
      const ech=p.type==='echelonne',acompte=ech&&!lies.some(f=>f.typeFacture==='acompte')&&encaisse<0.5;
      r.e='facturer';r.m=acompte?Math.round(total*0.3):reste;r.ft=ech?(acompte?'acompte':'solde'):'standard';
      r.t=ech?(acompte?'Facturer l’acompte':'Facturer le solde'):'Facturer';r.s=fmt0(r.m)+(acompte?', 30 % du projet':encaisse>=0.5?', le reste du projet':', tout le projet');r.b=r.t;return r;
    }
  }
  if(ouvertes.length){
    const f=ouvertes.sort((a,b)=>(a.dateEcheance||'9').localeCompare(b.dateEcheance||'9'))[0];
    r.e='attente';r.f=f;r.t='Attendre le paiement';r.s='facture '+(f.numero||'')+(f.dateEcheance?', échéance le '+new Date(f.dateEcheance+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'');return r;
  }
  const der=payees.map(f=>f.datePaiement||f.date||'').sort().pop();
  r.e='regle';
  if(mensuel){r.t=nomMois.charAt(0).toUpperCase()+nomMois.slice(1)+' est réglé';r.s='la prochaine facture le mois prochain';}
  else{r.t='Tout est réglé';r.s=der?'dernier paiement le '+new Date(der+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'rien à facturer';r.b='Terminer';}
  return r;
}
function fvLigneProjet(r){
  let bt='';
  if(r.e==='relancer')bt='<button class="fa-btn" data-id="'+r.f.id+'" onclick="fvRelancer(this.dataset.id)">Relancer</button>';
  else if(r.e==='facturer')bt='<button class="fa-btn" data-id="'+r.p.id+'" data-m="'+Math.round(r.m)+'" data-t="'+r.ft+'" onclick="fvFacturer(this.dataset.id,this.dataset.m,this.dataset.t)">'+r.b+'</button>';
  else if(r.e==='attente')bt='<button class="fa-btn fa-btn--c" data-id="'+r.f.id+'" onclick="editFacture(this.dataset.id)">Voir la facture</button>';
  else if(r.b)bt='<button class="fa-btn fa-btn--c" data-id="'+r.p.id+'" onclick="fvTerminer(this.dataset.id)">Terminer</button>';
  return '<div class="fv-p"><span><button class="fv-pn fv-nom" data-id="'+r.p.id+'" onclick="editProjet(this.dataset.id)">'+faEsc(r.p.nom||'Projet')+'</button><span class="fin-cl__s">'+faEsc(r.p.client||'')+'</span></span><span><span class="fa-n">'+r.enc+'</span>'+fvMini(r.n,12)+'</span><span><span class="fv-et">'+r.t+'</span><span class="fin-cl__s">'+r.s+'</span></span><span class="fin-act">'+bt+'</span></div>';
}
function renderProjets(){
  const el=q('#projets-list');if(!el)return;
  const factures=dbGet('factures'),mk=finAuj().slice(0,7),nomMois=new Date().toLocaleDateString('fr-FR',{month:'long'});
  const tous=dbGet('projets').slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).map(p=>fvEtape(p,factures,mk,nomMois));
  const actifs=tous.filter(r=>r.e!=='termine'),nb=k=>actifs.filter(r=>r.e===k).length;
  const pills=q('#projets-pills');
  if(pills)pills.innerHTML=[['','Tous',actifs.length]].concat(FV_ETAPES.map(x=>[x[0],x[1]==='En attente de paiement'?'En attente':x[1],nb(x[0])]),[['termine','Terminés',0]]).map(x=>'<button class="fin-onglet'+(FV_PROJETS===x[0]?' on':'')+'" data-s="'+x[0]+'" onclick="fvFiltre(&quot;projets&quot;,this.dataset.s)">'+x[1]+(x[0]!=='termine'?' · '+x[2]:'')+'</button>').join('');
  const aJour=nb('attente')+nb('regle'),nf=nb('facturer'),nr=nb('relancer');
  const reste=[nf?nf+' facture'+(nf>1?'s':'')+' à faire':'',nr?nr+' relance'+(nr>1?'s':''):''].filter(Boolean).join(' et ');
  const guide=actifs.length?'<div class="fa-blanc fv-guide"><div class="fv-guide__g"><span class="fa-k">Tes paiements en '+nomMois+'</span><b class="fa-n">'+aJour+' projet'+(aJour>1?'s':'')+' sur '+actifs.length+(aJour>1?' sont':' est')+' à jour</b><div class="fv-dash">'+actifs.map((r,i)=>'<i'+(i<aJour?' class="on"':'')+'></i>').join('')+'</div></div><p>'+(reste?'Il te reste '+reste+'. Commence par le haut, la liste se met à jour à chaque étape.':'Tout est à jour, rien à faire pour tes paiements.')+'</p></div>':'';
  let corps;
  if(FV_PROJETS==='termine'){const t=tous.filter(r=>r.e==='termine');corps=t.length?t.map(fvLigneProjet).join(''):'<p class="fa-vide">Aucun projet terminé.</p>';}
  else if(!actifs.length)corps='<p class="fa-vide">Aucun projet en cours. Crée ton premier projet, ou pars d’un devis signé.</p>';
  else corps=FV_ETAPES.filter(x=>!FV_PROJETS||FV_PROJETS===x[0]).map(x=>{const l=actifs.filter(r=>r.e===x[0]);return l.length?'<div class="fv-g"><span class="fv-g__t">'+x[1]+'</span><span class="fin-cl__s fa-n">'+l.length+'</span><span class="fin-cl__s fv-g__e">'+x[2]+'</span></div>'+l.map(fvLigneProjet).join(''):'';}).join('')||'<p class="fa-vide">Rien à cette étape.</p>';
  const g=q('#fv-guide');if(g)g.innerHTML=guide;
  el.innerHTML='<div class="fa-blanc fin-liste fv-pl">'+corps+'</div>';
}
function fvRelancer(id){
  const f=dbGet('factures').find(x=>x.id===id);if(!f)return;
  const t=dbGet('tiers').find(x=>(x.nom||'').trim().toLowerCase()===(f.client||'').trim().toLowerCase());
  if(t&&t.email)window.location.href='mailto:'+t.email+'?subject='+encodeURIComponent('Facture '+(f.numero||'')+' en attente de paiement');
  else editFacture(id);
}
async function fvTerminer(id){
  const p=dbGet('projets').find(x=>x.id===id);if(!p)return;
  try{await dbUpdate('projets',Object.assign({},p,{statut:'termine'}));toast('Projet terminé','success');}catch(e){toast(e.message,'error');}
  renderProjets();finOnglets('projets');
}
function fvBtnFacturer(p,m,type,l){return '<button class="fa-btn fa-btn--c" data-id="'+p.id+'" data-m="'+Math.round(m)+'" data-t="'+type+'" onclick="fvFacturer(this.dataset.id,this.dataset.m,this.dataset.t)">'+l+'</button>';}
function fvFacturer(id,m,t){const p=dbGet('projets').find(x=>x.id===id);if(!p)return;openFactureModal({client:p.client,projetId:p.id,montant:+m,typeFacture:t,statut:'attente'});}
/* Clients : tous ceux des factures, des devis et des tiers, par encaissé de l'année */
function fvClients(){
  const noms={};const add=n=>{if(n&&String(n).trim())noms[String(n).trim()]=1;};
  dbGet('factures').forEach(f=>add(f.client));dbGet('devis').forEach(d=>add(d.client));dbGet('tiers').filter(t=>!t.type||t.type==='client').forEach(t=>add(t.nom));
  return Object.keys(noms);
}
function renderTiers(){
  const el=q('#fv-clients');if(!el)return;
  const y=String(new Date().getFullYear()),F=dbGet('factures'),Dv=dbGet('devis'),T=dbGet('tiers');
  let rows=fvClients().map(nom=>{
    const fs=F.filter(f=>f.client===nom),enc=fs.filter(f=>f.statut==='payee'&&(f.datePaiement||f.date||'').startsWith(y)).reduce((s,f)=>s+(f.montant||0),0);
    const der=fs.map(f=>f.date||'').filter(Boolean).sort().pop();
    const retard=fs.filter(finEnRetard).reduce((s,f)=>s+(f.montant||0),0);
    const envoyes=Dv.filter(d=>d.client===nom&&d.statut==='envoye'),signes=Dv.filter(d=>d.client===nom&&d.statut==='signe'&&fvRecuDevis(d)<(d.montant||0)-0.5);
    const alias=fqRegles().filter(r=>r.t==='alias'&&r.client===nom).map(r=>r.m.toUpperCase());
    const notes=[];
    if(retard)notes.push('<span class="fa-pas fa-p-r">'+fmt0(retard)+' en retard</span>');
    envoyes.forEach(d=>notes.push('<span class="fa-pas fa-p-a">devis envoyé, '+fmt0(d.montant)+'</span>'));
    signes.forEach(d=>notes.push('<span class="fin-cl__s">devis '+faEsc(d.numero||'')+' en cours</span>'));
    if(alias.length)notes.push('<span class="fin-cl__s">payé par '+faEsc(alias.join(', '))+'</span>');
    const t=T.find(x=>x.nom===nom);
    return {nom:nom,enc:enc,retard:retard,devis:envoyes.length+signes.length,html:'<div class="fv-c"><span class="fv-pn">'+faEsc(nom)+'</span><span class="fa-n fv-r">'+(enc?fmt0(enc):'—')+'</span><span class="fa-n fv-r">'+(fs.length||'—')+'</span><span class="fa-n">'+(der?fmtDate(der):'—')+'</span><span class="fv-notes">'+notes.join('')+'</span><span class="fin-act">'+(t?'<button class="fin-lien" data-id="'+t.id+'" onclick="editTiers(this.dataset.id)">Modifier</button>':'')+'</span></div>'};
  });
  if(FV_CLIENTS==='devis')rows=rows.filter(r=>r.devis);
  if(FV_CLIENTS==='retard')rows=rows.filter(r=>r.retard);
  rows.sort((a,b)=>b.enc-a.enc||a.nom.localeCompare(b.nom));
  el.innerHTML='<div class="fv-c fv-h"><span>Client</span><span class="fv-r">Encaissé '+y+'</span><span class="fv-r">Factures</span><span>Dernière facture</span><span>À savoir</span><span></span></div>'+(rows.length?rows.map(r=>r.html).join(''):'<p class="fa-vide">Aucun client ici.</p>');
}
/* À payer : tes charges d'abord (abonnements, impôts, URSSAF), puis ce que tu dois payer,
   avec ce qui est réservé, ce qui manque et ce qui est vraiment libre sur Qonto */
let AP_FILTRE='',AP_ENV=false,AP_ID=null;
const AP_GENRES={prestataire:'prestataire',materiel:'matériel',outil:'outil',charge:'charge',autre:'dépense'};
function apDateFr(d){return new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'});}
function apNomMois(k){return new Date(k+'-15T12:00:00').toLocaleDateString('fr-FR',{month:'long'});}
function apGenre(p){if(p.genre)return p.genre;const c=(p.categorie||'').toLowerCase();if(c.indexOf('matériel')>=0)return 'materiel';if(c.indexOf('logiciel')>=0||c.indexOf('formation')>=0)return 'outil';if(c.indexOf('charges')>=0)return 'charge';return 'autre';}
function apEcheances(p){
  if(Array.isArray(p.echeances)&&p.echeances.length)return p.echeances.map((e,i)=>({i:i,montant:+e.montant||0,date:e.date||finAuj(),payeLe:e.payeLe||null,fichierNom:e.fichierNom||null}));
  const d0=p.dateDebut||finAuj(),debutMois=finAuj().slice(0,7)+'-01';
  if(p.type==='mensuel'){
    const out=[],d=new Date(d0+'T12:00:00'),fin=p.dateFin?p.dateFin:new Date(new Date().getFullYear(),new Date().getMonth()+5,28).toISOString().slice(0,10);
    for(let i=0;i<36;i++){const x=new Date(d.getFullYear(),d.getMonth()+i,Math.min(d.getDate(),28),12).toISOString().slice(0,10);if(x>fin)break;if(x>=debutMois)out.push({i:i,montant:+p.montant||0,date:x,payeLe:null});}
    return out;
  }
  return [{i:0,montant:+p.montant||0,date:d0,payeLe:p.payeLe||null}];
}
/* Les échéances retrouvées dans Qonto (même montant, à un mois près) sont payées */
function apEtat(){
  const liens=fqLiens(),autres=['versement','epargne','urssaf','facture','client','devis','remboursement','apport','ignore'],projets=dbGet('projets'),pris={};
  const tx=fqMouvements().filter(t=>t.type==='debit'&&!(liens[t.qontoId]&&autres.indexOf(liens[t.qontoId].t)>=0));
  const list=dbGet('depenses_prevues').filter(p=>p.statut!=='terminee').map(p=>{
    const ech=apEcheances(p),cree=new Date(new Date((p.createdAt||'2000-01-01').slice(0,10)+'T12:00:00')-7*86400000).toISOString().slice(0,10);
    ech.forEach(e=>{if(e.payeLe)return;const d0=new Date(e.date+'T12:00:00');
      const t=tx.find(t=>!pris[t.qontoId]&&t.date>=cree&&Math.abs(Math.abs(t.montant)-e.montant)<0.5&&Math.abs(new Date(t.date+'T12:00:00')-d0)<=31*86400000);
      if(t){pris[t.qontoId]=1;e.payeLe=t.date;e.qonto=true;}});
    const paye=ech.filter(e=>e.payeLe).reduce((s,e)=>s+e.montant,0),apayer=ech.filter(e=>!e.payeLe);
    let r=Math.max(0,(+p.reserve||0)-paye);const resteReserve=r;
    apayer.sort((a,b)=>a.date.localeCompare(b.date)).forEach(e=>{e.res=Math.min(e.montant,r);r-=e.res;});
    const pj=p.projetId&&projets.find(x=>x.id===p.projetId);
    return {p:p,genre:apGenre(p),ech:ech,apayer:apayer,paye:paye,resteReserve:resteReserve,manque:apayer.reduce((s,e)=>s+e.montant-e.res,0),projet:pj?(pj.nom||'')+(pj.client?', '+pj.client:''):''};
  });
  const charges=apCharges(),E=_enveloppes||[],qo=E.find(e=>e.id==='qonto'),solde=qo?(+qo.soldeQontoReel||0):0;
  let dispo=solde;charges.forEach(c=>{c.res=Math.max(0,Math.min(c.montant,dispo));dispo-=c.res;});
  const env=E.filter(e=>['tresorerie','salaire','formations'].indexOf(e.id)>=0).reduce((s,e)=>s+Math.max(0,e.solde||0),0);
  const reserve=list.reduce((s,x)=>s+x.resteReserve,0);
  const libre=Math.max(0,Math.floor(solde-charges.reduce((s,c)=>s+c.montant,0)-env-reserve));
  return {list:list,charges:charges,solde:solde,env:env,reserve:reserve,libre:libre,manque:list.reduce((s,x)=>s+x.manque,0)};
}
function apCharges(){
  const S=dbGetObj('settings'),U=dbGetObj('urssaf'),F=dbGet('factures'),now=new Date(),y=now.getFullYear(),auj=finAuj(),mk=auj.slice(0,7),out=[];
  const abos=dbGet('abonnements').filter(a=>a.statut==='actif'||!a.statut),aboM=Math.round(abos.reduce((s,a)=>s+(a.montantMensuel||a.montant||0),0));
  const liens=fqLiens(),mv=fqMouvements().filter(t=>t.type==='debit');
  const aboFait=Math.round(mv.filter(t=>t.date.startsWith(mk)&&liens[t.qontoId]&&liens[t.qontoId].t==='charge').reduce((s,t)=>s+Math.abs(t.montant),0));
  const aboReste=Math.max(0,aboM-aboFait);
  if(aboReste>0)out.push({k:'abos',nom:'Abonnements du mois',sous:'charge, '+(aboFait?fmt0(aboFait)+' déjà prélevés ce mois':abos.slice(0,3).map(a=>a.nom||a.description||'').join(', ')+(abos.length>3?' et '+(abos.length-3)+' autre'+(abos.length>4?'s':''):'')),date:mk+'-01',quand:'ce mois-ci',montant:aboReste,doc:abos.length+' abonnement'+(abos.length>1?'s':'')});
  const estImpot=t=>/dgfip|imp[oô]t|finances publiques/i.test(t.libelle||'')||(liens[t.qontoId]&&liens[t.qontoId].t==='impots');
  const imp=mv.filter(estImpot),impMois=imp.some(t=>t.date.startsWith(mk));
  const pas=Math.round(imp.length?Math.abs(imp[0].montant):(parseFloat(S.pasFixe)||0));
  if(pas>0&&!impMois)out.push({k:'impots',nom:'Impôts',sous:'charge, prélèvement à la source'+(imp.length?', d’après ton dernier prélèvement Qonto':''),date:mk+'-15',quand:'ce mois-ci',montant:pas,doc:imp.length?'depuis Qonto':'depuis Réglages'});
  const tU=(S.tauxUrssaf||25.6)/100,tC=(S.tauxCfp||0.2)/100,dp=f=>f.datePaiement||f.date||'';
  const Q={T1:[[1,2,3],y+'-04-30','1er trimestre'],T2:[[4,5,6],y+'-07-31','2e trimestre'],T3:[[7,8,9],y+'-11-02','3e trimestre'],T4:[[10,11,12],(y+1)+'-02-01','4e trimestre']};
  ['T1','T2','T3','T4'].forEach(t=>{
    if((U[t+'-'+y]||{}).statut==='paye'||Q[t][1]<auj)return;
    const ca=Q[t][0].reduce((s,mi)=>{const k=y+'-'+String(mi).padStart(2,'0');return s+F.filter(f=>f.statut==='payee'&&dp(f).startsWith(k)).reduce((x,f)=>x+(f.montant||0),0);},0);
    if(ca>0)out.push({k:'urssaf',nom:'URSSAF du '+Q[t][2],sous:'charge, à déclarer avant le '+apDateFr(Q[t][1]),date:Q[t][1],quand:'le '+apDateFr(Q[t][1]),montant:Math.round(ca*(tU+tC)),doc:'après la déclaration'});
  });
  return out;
}
function apLignes(st){
  const L=[];
  st.charges.forEach(c=>L.push({charge:true,genre:'charge',nom:c.nom,sous:c.sous,date:c.date,quand:c.quand,montant:c.montant,res:c.res,doc:'<span class="fin-cl__s">'+c.doc+'</span>',act:c.res>=c.montant-0.5?'<span class="fa-pas fa-p-n">réservé</span>':'<span class="fin-cl__s">il manque '+fmt0(c.montant-c.res)+'</span>'}));
  const k1=finAuj().slice(0,7),d=new Date(),k2=new Date(d.getFullYear(),d.getMonth()+1,15).toISOString().slice(0,7);
  st.list.forEach(x=>x.apayer.forEach(e=>{
    const n=x.ech.length,rang=n>1?', '+(e.i+1)+(e.i===0?'re':'e')+' échéance sur '+n:'';
    let plus='';const ek=e.date.slice(0,7);
    if(ek>k2&&e.montant-e.res>0.5){const mois=Math.max(1,(+ek.slice(0,4)-d.getFullYear())*12+(+ek.slice(5,7))-(d.getMonth()+1));if(mois>=3)plus=', '+fmt0(Math.ceil((e.montant-e.res)/mois))+' par mois d’ici '+apNomMois(ek);}
    const manque=e.montant-e.res;
    L.push({x:x,genre:x.genre,nom:x.p.description||'Paiement',id:x.p.id,sous:AP_GENRES[x.genre]+rang+plus,date:e.date,quand:(e.date<finAuj()?'depuis le ':'le ')+apDateFr(e.date),montant:e.montant,res:e.res,
      doc:apDoc(x,e),
      act:manque<0.5?'<span class="fa-pas fa-p-n">réservé</span>':(st.libre>=1?'<button class="fa-btn fa-btn--c" data-id="'+x.p.id+'" onclick="apReserver(this.dataset.id)">Réserver</button>':'<span class="fin-cl__s">au prochain paiement client</span>'),
      manque:manque});
  }));
  return L;
}
function apDoc(x,e){
  const id=x.p.id,parEch=x.ech.length>1&&Array.isArray(x.p.echeances);
  if(e&&e.fichierNom)return '<button class="fin-lien" data-id="'+id+'" data-e="'+e.i+'" onclick="apVoirFichier(this.dataset.id,this.dataset.e)">facture</button>';
  if(parEch)return '<button class="fin-lien" data-id="'+id+'" data-e="'+e.i+'" onclick="apJoindre(this.dataset.id,this.dataset.e)">Ajouter la facture</button>'+(x.p.fichierNom?'<button class="fin-lien ap-sous" data-id="'+id+'" onclick="apVoirFichier(this.dataset.id)">'+faEsc(x.p.fichierType||'devis')+'</button>':'');
  if(x.p.fichierNom)return '<button class="fin-lien" data-id="'+id+'" onclick="apVoirFichier(this.dataset.id)">'+faEsc(x.p.fichierType||'facture')+'</button>';
  return '<button class="fin-lien" data-id="'+id+'" onclick="apJoindre(this.dataset.id)">Ajouter</button>';
}
function apResTxt(l){return fmt0(l.res)+' sur '+fmt0(l.montant)+(l.montant-l.res>=0.5&&l.res>0?', il manque '+fmt0(l.montant-l.res):'');}
function apLigneHtml(l){
  return '<div class="ap-r"><span>'+(l.id?'<button class="fv-pn fv-nom" data-id="'+l.id+'" onclick="apOuvrir(this.dataset.id)">'+faEsc(l.nom)+'</button>':'<span class="fv-pn">'+faEsc(l.nom)+'</span>')+'<span class="fin-cl__s">'+faEsc(l.sous)+'</span></span><span>'+l.quand+'</span><span class="fa-n fv-r">'+fmt0(l.montant)+'</span><span><span class="fa-n fin-cl__s">'+(l.paye?'payé le '+apDateFr(l.paye):apResTxt(l))+'</span>'+fvMini(l.paye?12:Math.round(Math.min(1,l.res/(l.montant||1))*12),12)+'</span><span>'+l.doc+'</span><span class="fin-act">'+l.act+'</span></div>';
}
function apHero(){
  const st=apEtat(),L=apLignes(st),tot=L.reduce((s,l)=>s+l.montant,0),res=L.reduce((s,l)=>s+l.res,0);
  const der=L.map(l=>l.date).sort().pop(),aRes=Math.min(st.libre,Math.ceil(st.manque)),apres=Math.max(0,Math.ceil(st.manque)-aRes);
  const ligne=(a,b,f)=>'<div class="ap-calc__l'+(f?' ap-calc__l--f':'')+'"><span>'+a+'</span><span class="fa-n">'+b+'</span></div>';
  const txt=st.manque<0.5?'Tout ce que tu dois payer est réservé. Tes charges passent d’abord, le reste est à toi.':st.libre>=1?'Tes charges passent d’abord. Ce qui reste peut être réservé pour ce que tu dois payer. '+(apres?'Il manquera ensuite '+fmt0(apres)+', à réserver au prochain paiement client.':'Tout sera alors réservé.'):'Rien n’est libre pour l’instant, tes charges passent d’abord. Il manque '+fmt0(st.manque)+', à réserver au prochain paiement client.';
  const calc=ligne('Sur Qonto',fmt0(st.solde))+st.charges.map(c=>ligne('moins '+(c.k==='abos'?'les abonnements qui restent ce mois':c.k==='impots'?'les impôts du mois':'l’'+c.nom),fmt0(c.montant))).join('')+(st.env>0?ligne('moins tes enveloppes (coussin, salaire, formations)',fmt0(st.env)):'')+ligne('moins ce qui est déjà réservé',fmt0(st.reserve))+ligne('libre',fmt0(st.libre),true);
  return finTete('tresorerie')+'<div class="ap-cartes"><div class="fa-creme ap-creme"><div class="ap-creme__g"><div><span class="fa-k">vraiment libre sur Qonto</span><b>'+fmt0(st.libre)+'</b><span class="fa-k fa-k--f">'+txt+'</span></div><div class="ap-btns">'+(st.libre>=1&&st.manque>=0.5?'<button class="fa-btn" onclick="apReserverTout()">Réserver '+fmt0(aRes)+'</button>':'')+'<button class="fa-btn fa-btn--c" onclick="apOuvrir()">Ajouter un paiement prévu</button></div></div><div class="ap-calc">'+calc+'</div></div>'+
    '<div class="fa-blanc"><div class="fa-k2">À payer'+(der?' d’ici '+apNomMois(der.slice(0,7)):'')+'</div><div class="fa-gros2">'+fmt0(tot)+' <em>'+L.length+' paiement'+(L.length>1?'s':'')+'</em></div>'+faTirets(tot?Math.round(res/tot*12):0,12)+'<p class="fa-p">'+fmt0(res)+' déjà réservés, charges comprises</p></div></div>';
}
function renderAPayer(){
  const el=q('#ap-liste');if(!el)return;
  const st=apEtat(),toutes=apLignes(st);
  const pills=q('#ap-pills');
  if(pills)pills.innerHTML=[['','Tout'],['prestataire','Prestataires'],['materiel','Matériel'],['outil','Outils'],['charge','Charges'],['paye','Payés']].map(x=>'<button class="fin-onglet'+(AP_FILTRE===x[0]?' on':'')+'" data-s="'+x[0]+'" onclick="apFiltre(this.dataset.s)">'+x[1]+'</button>').join('');
  const payes=[];st.list.forEach(x=>x.ech.filter(e=>e.payeLe).forEach(e=>payes.push({x:x,e:e})));payes.sort((a,b)=>b.e.payeLe.localeCompare(a.e.payeLe));
  const tete='<div class="ap-r ap-h"><span>Quoi</span><span>Quand</span><span class="fv-r">Montant</span><span>Réservé</span><span>Facture</span><span></span></div>';
  if(AP_FILTRE==='paye'){
    el.innerHTML='<div class="fa-blanc fin-liste">'+(payes.length?tete+payes.map(y=>apLigneHtml({id:y.x.p.id,nom:y.x.p.description||'Paiement',sous:AP_GENRES[y.x.genre]+(y.e.qonto?', retrouvé dans Qonto':''),quand:'le '+apDateFr(y.e.date),montant:y.e.montant,res:y.e.montant,paye:y.e.payeLe,doc:apDoc(y.x,y.e),act:'<span class="fa-pas fa-p-n">payé</span>'})).join(''):'<p class="fa-vide">Rien de payé pour l’instant.</p>')+'</div>';return;
  }
  const L=toutes.filter(l=>!AP_FILTRE||l.genre===AP_FILTRE);
  if(!L.length){el.innerHTML='<div class="fa-blanc fin-liste"><p class="fa-vide">'+(AP_FILTRE?'Rien à payer de ce côté.':'Rien à payer pour l’instant. Ajoute un paiement prévu dès que tu signes avec un prestataire ou que tu prévois un achat.')+'</p></div>';return;}
  const d=new Date(),k1=finAuj().slice(0,7),k2=new Date(d.getFullYear(),d.getMonth()+1,15).toISOString().slice(0,7);
  const grp=[[k1,'En '+apNomMois(k1)],[k2,'En '+apNomMois(k2)],['plus','Plus tard']];
  const cle=l=>{const k=l.date.slice(0,7);return k<=k1?k1:k===k2?k2:'plus';};
  const corps=grp.map(g=>{const l=L.filter(x=>cle(x)===g[0]).sort((a,b)=>(b.charge?1:0)-(a.charge?1:0)||a.date.localeCompare(b.date));if(!l.length)return '';
    return '<div class="fv-g"><span class="fv-g__t">'+g[1]+'</span>'+(l[0].charge?'<span class="fin-cl__s">tes charges d’abord</span>':'')+'<span class="fin-cl__s fa-n fv-g__e">'+fmt0(l.reduce((s,x)=>s+x.montant,0))+'</span></div>'+l.map(apLigneHtml).join('');}).join('');
  const ceMois=payes.filter(y=>y.e.payeLe.slice(0,7)===k1);
  const pied=ceMois.length?'<div class="ap-pied"><span class="fin-cl__s">Payé ce mois : '+ceMois.map(y=>faEsc(y.x.p.description||'')+', '+fmt0(y.e.montant)+(y.e.qonto?', retrouvé dans Qonto le '+apDateFr(y.e.payeLe):'')).join(' ; ')+'</span><button class="fin-lien" data-s="paye" onclick="apFiltre(this.dataset.s)">Voir les payés</button></div>':'';
  el.innerHTML='<div class="fa-blanc fin-liste">'+tete+corps+pied+'</div>';
}
function apFiltre(s){AP_FILTRE=s;renderAPayer();}
async function loadAPayer(){
  const el=q('#ap-liste');if(el&&!el.innerHTML)el.innerHTML='<div class="fa-blanc fin-liste"><p class="fa-vide">Lecture de ton compte Qonto…</p></div>';
  if(!(_enveloppes||[]).length){try{const r=await api('GET','/api/enveloppes');_enveloppes=r.enveloppes||[];}catch(e){}}
  if(!FQ_MOUV){try{await fqRelier(false);}catch(e){}}
  renderAPayer();finHeroMaj('tresorerie');
}
function apMaj(){renderAPayer();finHeroMaj('tresorerie');finOnglets('apayer');}
async function apAjouterReserve(p,add){
  if(add<0.5)return;
  await dbUpdate('depenses_prevues',Object.assign({},p,{reserve:Math.round(((+p.reserve||0)+add)*100)/100}));
}
async function apReserver(id){
  const st=apEtat(),x=st.list.find(y=>y.p.id===id);if(!x)return;
  const add=Math.min(st.libre,x.manque);
  if(add<0.5){toast('Rien de libre sur Qonto pour l’instant','info');return;}
  try{await apAjouterReserve(x.p,add);toast(fmt0(add)+' réservés','success');}catch(e){toast(e.message,'error');}
  apMaj();
}
async function apReserverTout(){
  const st=apEtat();let libre=st.libre;
  const parDate=st.list.filter(x=>x.manque>=0.5).sort((a,b)=>(a.apayer[0]?a.apayer[0].date:'9').localeCompare(b.apayer[0]?b.apayer[0].date:'9'));
  try{for(const x of parDate){if(libre<1)break;const add=Math.min(libre,x.manque);await apAjouterReserve(x.p,add);libre-=add;}toast('C’est réservé','success');}catch(e){toast(e.message,'error');}
  apMaj();
}
/* La fenêtre : nouveau paiement prévu, ou modifier */
function apSeg(id,v){qa('#'+id+' button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));}
function apSegVal(id){const b=q('#'+id+' button.on');return b?b.dataset.v:'';}
function apAcompte(v){apSeg('ap-acompte',v);q('#ap-acompte-autre').style.display=v==='autre'?'':'none';apApercu();}
function apPlusMois(d,n){const x=new Date(d+'T12:00:00'),j=x.getDate(),y=new Date(x.getFullYear(),x.getMonth()+n,1,12),dern=new Date(y.getFullYear(),y.getMonth()+1,0).getDate();y.setDate(Math.min(j,dern));return y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');}
/* Les échéances se calculent toutes seules : l'acompte le premier jour, puis le reste en autant de mois */
function apCalcul(){
  const total=parseFloat(q('#ap-total').value)||0,d=q('#ap-date').value,mois=Math.max(1,Math.min(36,parseInt(q('#ap-mois').value)||1)),a=apSegVal('ap-acompte')||'aucun';
  if(!(total>0)||!d)return null;
  let ac=a==='30'?total*0.3:a==='50'?total*0.5:a==='autre'?Math.min(total,parseFloat(q('#ap-acompte-m').value)||0):0;
  ac=Math.round(ac*100)/100;
  const ech=[],k=ac>0?1:0,reste=Math.round((total-ac)*100)/100;
  if(ac>0)ech.push({montant:ac,date:d,nom:'Acompte'});
  if(reste>=0.01){const base=Math.floor(reste/mois*100)/100;for(let i=0;i<mois;i++){const m=i===mois-1?Math.round((reste-base*(mois-1))*100)/100:base;ech.push({montant:m,date:apPlusMois(d,i+k),nom:mois===1?(ac>0?'Solde':'Paiement'):(i+1)+(i===0?'re':'e')+' mensualité'});}}
  return {total:total,date:d,acompte:a,acompteMontant:ac,mois:mois,ech:ech};
}
function apApercu(){
  const c=apCalcul(),el=q('#ap-apercu');if(!el)return;
  if(!c){el.innerHTML='<span class="fin-cl__s">Mets le montant total et la date du premier paiement, les échéances se calculent toutes seules.</span>';return;}
  el.innerHTML='<span class="fin-cl__s">Ce que ça donne</span>'+c.ech.map(e=>'<div class="ap-apercu__l"><span>'+e.nom+'</span><span class="fin-cl__s">le '+apDateFr(e.date)+'</span><span class="fa-n">'+fmt(e.montant)+'</span></div>').join('');
}
function apOuvrir(id){
  AP_ID=id||null;const p=id?dbGet('depenses_prevues').find(x=>x.id===id):null;
  q('#ap-titre').textContent=p?'Modifier le paiement prévu':'Nouveau paiement prévu';
  q('#ap-desc').value=p?p.description||'':'';
  apSeg('ap-genre',p?apGenre(p):'prestataire');
  const ech=p?apEcheances(p):[],c=p&&p.calc?p.calc:null;
  q('#ap-total').value=p?(c?c.total:(ech.reduce((s,e)=>s+e.montant,0)||p.montant||'')):'';
  q('#ap-date').value=c?c.date:(ech[0]?ech[0].date:'');
  q('#ap-mois').value=c?c.mois:Math.max(1,ech.length);
  q('#ap-acompte-m').value=c&&c.acompte==='autre'?c.acompteMontant:'';
  apAcompte(c?c.acompte:'aucun');
  q('#ap-fichier').value='';q('#ap-fichier-nom').textContent=p&&p.fichierNom?'Joint : '+p.fichierNom:'';
  const st=apEtat();
  q('#ap-res-bloc').style.display=p?'none':'';
  q('#ap-res-txt').textContent=st.libre>=1?fmt0(st.libre)+' sont libres une fois tes abonnements, l’URSSAF, les impôts et tes enveloppes mis de côté.':'Rien n’est libre pour l’instant, tes charges passent d’abord.';
  q('#ap-res-now').disabled=st.libre<1;q(st.libre>=1?'#ap-res-now':'#ap-res-fil').checked=true;
  q('#ap-suppr').style.display=p?'':'none';
  openModal('modal-apayer');
}
async function apEnregistrer(){
  const desc=q('#ap-desc').value.trim();if(!desc){toast('Dis ce que c’est','error');return;}
  const c=apCalcul();if(!c||!c.ech.length){toast('Montant total et date du premier paiement requis','error');return;}
  const ech=c.ech.map(e=>({montant:e.montant,date:e.date}));
  const vieux=AP_ID?dbGet('depenses_prevues').find(x=>x.id===AP_ID):null;
  if(vieux){const avant=Array.isArray(vieux.echeances)?vieux.echeances:apEcheances(vieux);ech.forEach(e=>{const a=avant.find(x=>x.date===e.date);if(a)['payeLe','fichierKey','fichierNom','fichierMime'].forEach(k=>{if(a[k])e[k]=a[k];});});}
  const genre=apSegVal('ap-genre');
  const data={description:desc,genre:genre,categorie:{prestataire:'Prestataire',materiel:'Matériel & équipement',outil:'Logiciels & abonnements',charge:'Charges sociales'}[genre]||'Autre',montant:c.total,type:'ponctuel',dateDebut:ech[0].date,dateFin:ech[ech.length-1].date,echeances:ech,calc:{total:c.total,date:c.date,acompte:c.acompte,acompteMontant:c.acompteMontant,mois:c.mois},statut:'active'};
  try{
    let p;
    if(vieux)p=await dbUpdate('depenses_prevues',Object.assign({},vieux,data));
    else{const st=apEtat();data.reserve=q('#ap-res-now').checked?Math.min(st.libre,c.total):0;p=await dbCreate('depenses_prevues',data);}
    const f=q('#ap-fichier').files[0];if(f&&p&&p.id)await apEnvoyerFichier(p.id,f);
    closeModal('modal-apayer');toast(vieux?'Enregistré':(data.reserve?fmt0(data.reserve)+' réservés':'Enregistré'),'success');
  }catch(e){toast(e.message,'error');}
  apMaj();
}
async function apSupprimer(){
  if(!AP_ID)return;const ok=await confirmDialog('Supprimer ce paiement prévu ?','L’argent réservé redevient libre.');if(!ok)return;
  try{await dbDelete('depenses_prevues',AP_ID);closeModal('modal-apayer');toast('Supprimé','success');}catch(e){toast(e.message,'error');}
  apMaj();
}
function apQs(e){return e!==undefined&&e!==null&&e!==''?'e='+e:'';}
async function apEnvoyerFichier(id,f,e){
  const r=await fetch('/api/depenses-prevues/'+id+'/fichier?nom='+encodeURIComponent(f.name)+(apQs(e)?'&'+apQs(e):''),{method:'POST',body:f,headers:{'Content-Type':f.type||'application/octet-stream'}});
  if(!r.ok)throw new Error('Le fichier n’a pas pu être envoyé');
  const p=await r.json(),list=dbGet('depenses_prevues'),i=list.findIndex(x=>x.id===id);if(i>=0){list[i]=p;dbSet('depenses_prevues',list.slice());}
}
function apJoindre(id,e){
  const inp=document.createElement('input');inp.type='file';inp.accept='application/pdf,image/*';
  inp.onchange=async()=>{const f=inp.files[0];if(!f)return;try{await apEnvoyerFichier(id,f,e);toast('Facture jointe','success');}catch(x){toast(x.message,'error');}renderAPayer();};
  inp.click();
}
function apVoirFichier(id,e){window.open('/api/depenses-prevues/'+id+'/fichier'+(apQs(e)?'?'+apQs(e):''),'_blank');}
const fmt0=v=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.round(v||0));
function faEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function faTirets(n,sur,cls){let h='<div class="fa-tirets">';for(let i=0;i<sur;i++)h+='<i class="'+(i<n?'on'+(cls?' '+cls:''):'')+'"></i>';return h+'</div>';}
let FA_ONGLET='afaire';
function faOnglet(o){FA_ONGLET=o;loadAujourdhui();}
function loadAujourdhui(){
  if(!FQ_MOUV&&!FQ_EN_COURS)fqRelier().then(()=>{if(q('#section-dashboard.active'))loadAujourdhui();});
  const now=new Date(),y=now.getFullYear(),m=now.getMonth()+1;
  const mKey=y+'-'+String(m).padStart(2,'0');
  const auj=now.toISOString().slice(0,10);
  const factures=dbGet('factures'),depenses=dbGet('depenses'),abonnements=dbGet('abonnements'),devis=dbGet('devis');
  const settings=dbGetObj('settings'),urssafObj=dbGetObj('urssaf');
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100,pas=settings.pasFixe||40;
  const encaisse=f=>f.statut==='payee';
  const datePay=f=>(f.datePaiement||f.date||'');
  const caMois=factures.filter(f=>encaisse(f)&&datePay(f).startsWith(mKey)).reduce((s,f)=>s+(f.montant||0),0);
  const caYTD=factures.filter(f=>encaisse(f)&&datePay(f).startsWith(String(y))).reduce((s,f)=>s+(f.montant||0),0);
  const depM=depenses.filter(d=>(d.date||'').startsWith(mKey)&&d.categorie!=='Versement perso').reduce((s,d)=>s+(d.montant||0),0);
  const aboM=abonnements.filter(a=>a.statut==='actif'||!a.statut).reduce((s,a)=>s+(a.montantMensuel||a.montant||0),0);
  const urssafM=caMois*(tauxU+tauxC);
  const net=Math.max(0,caMois-urssafM-pas-depM-aboM);
  const pct=settings.pctVersement||65;
  const verser=Math.round(net*pct/100);
  // Moyenne mensuelle d'encaissement depuis janvier, pour les projections
  const moisEcoules=Math.max(1,(m-1)+now.getDate()/new Date(y,m,0).getDate());
  const projection=caYTD/moisEcoules*12;
  // Coussin : trésorerie ÷ charges fixes du mois
  const treso=_qontoSoldeCalc!==null?_qontoSoldeCalc:dbGet('comptes').filter(c=>c.type==='courant'||c.type==='professionnel').reduce((s,c)=>s+(c.solde||0),0);
  const chargesFixes=Math.max(1,aboM+pas);
  const coussin=Math.round(treso/chargesFixes*10)/10;
  const seuilCoussin=settings.seuilCoussin||3;
  // Factures en retard : statut retard, ou en attente et échéance passée
  const retard=factures.filter(f=>f.statut==='retard'||(f.statut==='attente'&&f.dateEcheance&&f.dateEcheance<auj));
  const joursDe=d=>Math.max(0,Math.round((now-new Date(d))/86400000));
  retard.sort((a,b)=>(b.montant||0)-(a.montant||0));
  const attente=factures.filter(f=>f.statut==='attente'&&!(f.dateEcheance&&f.dateEcheance<auj));
  const devisEnvoyes=devis.filter(d=>d.statut==='envoye');
  // Prochaine déclaration URSSAF à venir (les trimestres passés non marqués payés ne comptent pas)
  const ech={T1:y+'-04-30',T2:y+'-07-31',T3:y+'-11-02',T4:(y+1)+'-02-01'};
  const noms={T1:'1er trimestre',T2:'2e trimestre',T3:'3e trimestre',T4:'4e trimestre'};
  let urs=null;
  ['T1','T2','T3','T4'].forEach(t=>{const d=urssafObj[t+'-'+y]||{};if(d.statut==='paye'||ech[t]<auj)return;const j=Math.ceil((new Date(ech[t])-now)/86400000);if(!urs||j<urs.jours)urs={t:t,nom:noms[t],ech:ech[t],jours:j};});
  // À faire, trié par urgence
  const afaire=[];
  retard.forEach(f=>afaire.push({t:'Relancer '+f.client,s:(f.numero||'')+', '+joursDe(f.dateEcheance||f.date)+' jours de retard',m:f.montant,p:['fa-p-r','en retard'],b:['Relancer','factures'],o:0}));
  if(urs&&urs.jours<=45)afaire.push({t:'Déclarer l’URSSAF du '+urs.nom,s:'avant le '+fmtDate(urs.ech)+', dans '+urs.jours+' jours',m:null,p:['fa-p-m','à toi'],b:['Déclarer','charges-urssaf'],o:1});
  devisEnvoyes.filter(d=>d.date&&joursDe(d.date)>=10).forEach(d=>afaire.push({t:'Relancer '+d.client+' pour son devis',s:(d.numero||'')+', envoyé il y a '+joursDe(d.date)+' jours',m:d.montant,p:['fa-p-r','sans réponse'],b:['Voir le devis','devis'],o:2}));
  if(coussin<seuilCoussin)afaire.push({t:'Renforcer ta trésorerie',s:'le coussin est à '+coussin+' mois de charges',m:null,p:['fa-p-m','à toi'],b:['Voir','enveloppes'],o:3});
  const nRanger=FQ_MOUV?fqARanger().length:0;
  if(nRanger)afaire.push({t:'Ranger '+nRanger+' mouvement'+(nRanger>1?'s':'')+' Qonto',s:'un clic chacun',m:null,p:['fa-p-m','à toi'],b:['Ranger','transactions'],o:0.5});
  afaire.sort((a,b)=>a.o-b.o);
  const encours=[];
  attente.forEach(f=>encours.push({t:f.client+' doit régler '+(f.numero||'sa facture'),s:f.dateEcheance?'échéance le '+fmtDate(f.dateEcheance):'sans échéance',m:f.montant,p:['fa-p-a','en attente'],b:['Voir','factures']}));
  devisEnvoyes.filter(d=>!(d.date&&joursDe(d.date)>=10)).forEach(d=>encours.push({t:'Devis envoyé à '+d.client,s:(d.numero||'')+(d.date?', le '+fmtDate(d.date):''),m:d.montant,p:['fa-p-a','envoyé'],b:['Voir','devis']}));
  // En-tête
  const n=afaire.length;
  q('#fa-sous').textContent=n?(n===1?'Une chose t’attend.':n+' choses t’attendent.'):'Rien ne t’attend, tout est à jour.';
  // Cartes
  const r0=retard[0];
  // À te verser : un plafond. On retire ce qui est déjà versé ce mois (dépenses « Versement perso », virements Qonto compris).
  const nomMois=now.toLocaleDateString('fr-FR',{month:'long'});
  const vers=fqVersements(mKey),deja=vers.reduce((s,d)=>s+(d.montant||0),0),reste=Math.max(0,verser-deja);
  const clos=!!(settings.versementClos||{})[mKey];
  FQ_VERSER={reste:reste};
  fcBandeau();
  const dernier=vers[vers.length-1];
  const btnsV='<div class="fin-btns"><button class="fa-btn" onclick="fqVerserOuvrir()">Me verser</button><button class="fa-btn fa-btn--c" data-m="'+mKey+'" onclick="fqGarder(this.dataset.m,true)">Garder de côté</button></div>';
  let carteVerser;
  const fcFini=fcEtat(mKey).fini,NomM=nomMois.charAt(0).toUpperCase()+nomMois.slice(1);
  if(fcFini)carteVerser='<div class="fa-creme"><div><span class="fa-k">'+nomMois+'</span><b>'+NomM+' clôturé, '+fmt0(reste)+' gardés de côté</b><span class="fa-k fa-k--f">'+(deja?fmt0(deja)+' versés pour toi.':'Rien versé pour toi ce mois-ci.')+'</span></div><div class="fin-liens"><button class="fin-lien" onclick="fcOuvrir()">Revoir</button><button class="fin-lien" data-k="'+mKey+'" onclick="fcRouvrir(this.dataset.k)">Rouvrir</button></div></div>';
  else if(clos)carteVerser='<div class="fa-creme"><div><span class="fa-k">'+nomMois+'</span><b>'+fmt0(deja)+' pour toi, '+fmt0(reste)+' de côté</b>'+faTirets(verser>0?Math.min(12,Math.round(deja/verser*12)):0,12)+'<span class="fa-k fa-k--f">'+(fqOuGarde(mKey).trim()||'Ce que tu ne t’es pas versé reste dans ta trésorerie.')+'</span></div><button class="fin-lien" data-m="'+mKey+'" onclick="fqGarder(this.dataset.m,false)">Changer d’avis</button></div>';
  else if(deja>verser&&deja>0)carteVerser='<div class="fa-creme"><div><span class="fa-k">ce mois-ci, versé</span><b class="fa-gros">'+fmt0(deja)+'</b><span class="fa-k fa-k--f">'+fmt0(deja-verser)+' de plus que prévu ce mois-ci.</span></div><button class="fin-lien" data-s="depenses" onclick="finGo(this)">Voir mes versements</button></div>';
  else if(deja>0)carteVerser='<div class="fa-creme"><div><span class="fa-k">ce mois-ci, tu peux encore te verser jusqu’à</span><b class="fa-gros">'+fmt0(reste)+'</b>'+faTirets(Math.min(12,Math.round(deja/Math.max(1,verser)*12)),12)+
    '<div class="fa-l fq-l2"><span>Possible en '+nomMois+'</span><span class="fa-n">'+fmt0(verser)+'</span></div>'+
    '<div class="fa-l fq-l2"><span>Déjà versé'+(dernier?(fqDeQonto(dernier.id)?', virement Qonto du ':', le ')+fqJour(dernier.date):'')+'</span><span class="fa-n">'+fmt0(deja)+'</span></div></div>'+btnsV+'</div>';
  else carteVerser='<div class="fa-creme"><div><span class="fa-k">ce mois-ci, tu peux te verser jusqu’à</span><b class="fa-gros">'+fmt0(verser)+'</b><span class="fa-k fa-k--f">'+pct+' % de ce qui reste sur '+fmt0(caMois)+' encaissés. Ce que tu ne te verses pas reste dans ta trésorerie.</span></div>'+btnsV+'</div>';
  q('#fa-cartes').innerHTML=
    carteVerser+
    (r0?'<div class="fa-creme"><div><span class="fa-k">à relancer</span><b>'+faEsc(r0.client)+', '+fmt0(r0.montant)+'</b><span class="fa-k fa-k--f">'+joursDe(r0.dateEcheance||r0.date)+' jours de retard'+(retard.length>1?', et '+(retard.length-1)+' autre'+(retard.length>2?'s':''):'')+'</span></div><button class="fa-btn" onclick="navigate(\\'factures\\')">Relancer</button></div>'
       :'<div class="fa-creme"><div><span class="fa-k">tes factures</span><b>Rien à relancer</b><span class="fa-k fa-k--f">Tout est payé à temps.</span></div><button class="fa-btn fa-btn--c" onclick="navigate(\\'factures\\')">Voir les factures</button></div>')+
    '<div class="fa-blanc"><div class="fa-k2">Ton coussin</div><div class="fa-gros2">'+String(coussin).replace('.',',')+' <em>mois de charges</em></div>'+faTirets(Math.min(6,Math.round(coussin)),6,coussin<seuilCoussin?'r':'')+'<p class="fa-p">'+(coussin<seuilCoussin?'Sous '+seuilCoussin+' mois : à renforcer.':'Au-dessus de '+seuilCoussin+' mois : tout va bien.')+'</p></div>';
  // Seuils de l'année
  const objectif=settings.objectifCA||60000,tva=settings.seuilTva||37500,plafond=settings.plafondMicro||77700;
  const rythme=objectif*moisEcoules/12,ecart=Math.round(rythme-caYTD);
  const ligne=(nom,seuil,txt,alerte)=>{const p=Math.min(100,Math.round(caYTD/seuil*100));return '<div class="fa-seuil"><div class="fa-seuil__h"><span>'+nom+'</span><span class="fa-n">'+fmt0(caYTD)+' <span class="fa-mut">sur '+fmt0(seuil)+'</span></span></div><div class="fa-barre"><i style="width:'+p+'%"'+(alerte?' class="r"':'')+'></i></div><div class="fa-seuil__t'+(alerte?' r':'')+'">'+txt+'</div></div>';};
  q('#fa-seuils').innerHTML='<h2 class="fa-h2">L’année et ses seuils</h2>'+
    ligne('Ton objectif',objectif,ecart>0?fmt0(ecart)+' de retard sur le rythme':'En avance de '+fmt0(-ecart)+' sur le rythme',false)+
    ligne('Seuil de franchise de TVA',tva,projection>tva?'À ce rythme, tu le dépasses avant la fin de l’année. À surveiller.':'À ce rythme, tu restes en dessous ('+fmt0(projection)+' prévus).',projection>tva)+
    ligne('Plafond de la micro-entreprise',plafond,projection>plafond?'À ce rythme, tu le dépasses cette année.':'Large marge',projection>plafond)+
    '<p class="fa-note">Seuils modifiables dans les Réglages. Vérifie-les chaque année avec ta comptable.</p>';
  // Le mois en détail
  const l=(a,b,fort)=>'<div class="fa-l'+(fort?' fa-l--f':'')+'"><span>'+a+'</span><span class="fa-n">'+b+'</span></div>';
  q('#fa-mois').innerHTML='<h2 class="fa-h2">'+MOIS_LONG[m-1]+', le calcul</h2>'+
    l('Encaissé',fmt0(caMois))+l('URSSAF et formation','− '+fmt0(urssafM))+l('Prélèvement à la source','− '+fmt0(pas))+l('Charges fixes et dépenses','− '+fmt0(aboM+depM))+l('Il reste',fmt0(net),true)+l('Part que tu te verses, '+pct+' %',fmt0(verser),true);
  // Et si… et bandeau de clôture
  FA_CTX={caYTD:caYTD,moisEcoules:moisEcoules,projection:projection,objectif:objectif,tva:tva,treso:treso,chargesFixes:chargesFixes,verser:verser,reste:reste,devis:devisEnvoyes};
  faEtSiRender();
  // Onglets et liste
  const liste=FA_ONGLET==='encours'?encours:afaire;
  q('#fa-onglets').innerHTML='<button class="fin-onglet'+(FA_ONGLET==='afaire'?' on':'')+'" onclick="faOnglet(\\'afaire\\')">À faire · '+afaire.length+'</button><button class="fin-onglet'+(FA_ONGLET==='encours'?' on':'')+'" onclick="faOnglet(\\'encours\\')">En cours · '+encours.length+'</button>';
  q('#fa-liste').innerHTML=liste.length?liste.map(x=>'<div class="fa-ligne"><div><div class="fa-ligne__t">'+faEsc(x.t)+'</div><div class="fa-ligne__s">'+faEsc(x.s)+'</div></div><span><span class="fa-pas '+x.p[0]+'">'+x.p[1]+'</span></span><span class="fa-n fa-ligne__m">'+(x.m!=null?fmt0(x.m):'')+'</span><span class="fa-ligne__a"><button class="fa-btn fa-btn--c" onclick="navigate(\\''+x.b[1]+'\\')">'+x.b[0]+'</button></span></div>').join('')
    :'<p class="fa-vide">'+(FA_ONGLET==='encours'?'Rien en cours.':'Rien à faire pour l’instant.')+'</p>';
  const pastille=q('#nav-pastille-factures');if(pastille)pastille.textContent=retard.length?String(retard.length):'';
}

/* ─── Et si… : trois scénarios à cliquer, rien n'est enregistré ─── */
let FA_ETSI=0,FA_CTX=null;
function faEtSi(i){FA_ETSI=+i;faEtSiRender();}
function faEtSiRender(){
  const el=q('#fa-etsi'),c=FA_CTX;if(!el||!c)return;
  const moy=c.caYTD/c.moisEcoules,n=new Date(),S=dbGetObj('settings'),seuilC=S.seuilCoussin||3;
  const coussin=v=>String(Math.round(v/c.chargesFixes*10)/10).replace('.',',');
  const tvaQuand=ca=>{if(ca>=c.tva)return 'tu dépasses déjà le seuil de TVA';if(moy<=0)return 'tu restes sous le seuil de TVA';const i=n.getMonth()+Math.ceil((c.tva-ca)/moy);return i<=11?'tu passes le seuil de TVA vers <b>'+MOIS_LONG[i].toLowerCase()+'</b>':'tu restes sous le seuil de TVA cette année';};
  const sc=[];
  const d=c.devis.slice().sort((a,b)=>(b.montant||0)-(a.montant||0))[0];
  if(d)sc.push(['je signe le devis '+d.client,()=>{const caN=c.caYTD+(d.montant||0),ec=Math.round(c.objectif*c.moisEcoules/12-caN);
    return 'Avec '+faEsc(d.client)+' : <b>'+fmt0(caN)+'</b> encaissés, '+(ec>0?'ton retard tombe à <b>'+fmt0(ec)+'</b>':'tu passes en avance de <b>'+fmt0(-ec)+'</b>')+', et '+tvaQuand(caN)+'.';}]);
  const x=Math.max(500,Math.ceil((c.verser+1)/500)*500);
  sc.push(['je me verse '+fmt0(x)+' ce mois-ci',()=>{if(x<=c.reste)return 'Te verser <b>'+fmt0(x)+'</b> reste dans ce que permet le mois : il te resterait '+fmt0(c.reste-x)+' possibles.';
    const plus=x-c.reste,tN=c.treso-plus,cN=coussin(tN);
    return 'C’est <b>'+fmt0(plus)+'</b> de plus que ce que permet le mois. Pris sur ta trésorerie, ton coussin passerait à <b>'+cN+' mois</b> de charges'+(tN/c.chargesFixes<seuilC?', sous ton seuil de '+seuilC+' mois.':'.');}]);
  sc.push(['je prends deux semaines de congés',()=>{const perte=Math.round(moy/2),pN=Math.max(0,c.projection-perte);
    return 'Deux semaines sans facturer, c’est environ <b>'+fmt0(perte)+'</b> de moins d’ici décembre : tu finirais l’année vers '+fmt0(pN)+', soit <b>'+Math.round(pN/c.objectif*100)+' %</b> de ton objectif. Tes charges fixes, elles, continuent : '+fmt0(c.chargesFixes/2)+' sur ces deux semaines.';}]);
  if(FA_ETSI>=sc.length)FA_ETSI=0;
  el.innerHTML='<h2 class="fa-h2">Et si…</h2><p class="fa-note fa-etsi__n">Essaie un scénario, rien n’est enregistré.</p>'+
    '<div class="fa-etsi__c">'+sc.map((s,i)=>'<button class="fin-onglet'+(i===FA_ETSI?' on':'')+'" data-i="'+i+'" aria-pressed="'+(i===FA_ETSI)+'" onclick="faEtSi(this.dataset.i)">'+faEsc(s[0])+'</button>').join('')+'</div>'+
    '<p class="fa-etsi__r" aria-live="polite">'+sc[FA_ETSI][1]()+'</p>';
}

/* ─── 6. ROUTER ──────────────────────────────────────────────────────── */
let currentSection='dashboard';
function navigate(section){
  qa('.section').forEach(s=>s.classList.remove('active'));
  qa('.nav-item').forEach(n=>n.classList.remove('active'));
  const sec=q(\`#section-\${section}\`);
  if(!sec)return;
  sec.classList.add('active');
  currentSection=section;
  finOnglets(section);
  loadSection(section);
}
function loadSection(s){
  const map={
    'dashboard':loadAujourdhui,'cloture':loadCloture,'apayer':loadAPayer,
    'comptes':loadComptes,'enveloppes':loadEnveloppes,'transactions':()=>{loadTransactions();fqRender();},
    'crm':loadCrm,
    'factures':loadFactures,'devis':loadDevis,'projets':loadProjets,'tiers':loadTiers,
    'depenses':loadDepenses,'abonnements':loadAbonnements,
    'charges-urssaf':loadChargesURSSAF,
    'objectifs-epargne':loadObjectifsEpargne,'rapport-mensuel':loadRapportMensuel,
    'rapport-annuel':loadRapportAnnuel,'rapport-fiscal':loadRapportFiscal,
    'simulateur':loadSimulateur,'import-export':initImportExport,'options':()=>{loadOptions();fqRenderRegles();},
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
  // Reserve right space for target label if needed
  const pad={top:16,right:opts.targetLine?56:12,bottom:36,left:52};
  const cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom;
  const allVals=datasets.flatMap(d=>d.data);
  const maxVal=Math.max(...allVals,opts.targetLine||0,opts.seuilLine||0,1);
  const step=niceStep(maxVal);
  const yMax=Math.ceil(maxVal/step)*step;
  drawGrid(ctx,pad,cW,cH,yMax,step);
  const groupW=cW/labels.length;
  const bc=datasets.length,gap=3;
  const bw=Math.max(4,(groupW-gap*(bc+1))/bc);
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
        color=ratio>=1?'#4CAF82':ratio>=0.8?'#E8A838':'#E05252';
      }
      ctx.fillStyle=color;
      ctx.beginPath();
      if(ctx.roundRect)ctx.roundRect(x,y,bw,bH,2);else ctx.rect(x,y,bw,bH);
      ctx.fill();
    });
  });
  // Seuil de rentabilité (ligne pointillée grise)
  if(opts.seuilLine&&opts.seuilLine>0&&opts.seuilLine<=yMax){
    const sy=pad.top+cH-(opts.seuilLine/yMax)*cH;
    ctx.save();ctx.setLineDash([4,4]);ctx.strokeStyle='#9CA3AF';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(pad.left,sy);ctx.lineTo(pad.left+cW,sy);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    ctx.fillStyle='#9CA3AF';ctx.font='10px DM Sans,sans-serif';ctx.textAlign='left';
    ctx.fillText('Seuil',pad.left+cW+4,sy+4);
  }
  // Ligne objectif (pointillé bleu)
  if(opts.targetLine&&opts.targetLine>0&&opts.targetLine<=yMax){
    const ty=pad.top+cH-(opts.targetLine/yMax)*cH;
    ctx.save();ctx.setLineDash([6,3]);ctx.strokeStyle=COLORS.blue;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(pad.left,ty);ctx.lineTo(pad.left+cW,ty);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
    ctx.fillStyle=COLORS.blue;ctx.font='bold 10px DM Sans,sans-serif';ctx.textAlign='left';
    ctx.fillText('Objectif',pad.left+cW+4,ty+4);
  }
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
  const mKey=\`\${y}-\${String(m).padStart(2,'0')}\`;
  if(q('#dash-period'))q('#dash-period').textContent=\`\${MOIS_LONG[m-1]} \${y}\`;

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
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#4CAF82"></div>CA objectif atteint</div>\`+
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#E8A838"></div>CA proche</div>\`+
    \`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:#E05252"></div>CA insuffisant</div>\`+
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
      \`<div><div style="font-size:10px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Objectif mensuel</div><div style="font-size:16px;font-weight:700;color:var(--navy);">\${fmt(objectifMensuel)}</div><div style="font-size:11px;color:var(--text-2);">pour \${settings.objectifCA||60000} €/an</div></div>\`+
      \`<div><div style="font-size:10px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Seuil minimum</div><div style="font-size:16px;font-weight:700;color:#E8A838;">\${fmt(seuilMensuel)}</div><div style="font-size:11px;color:var(--text-2);">juste pour couvrir les charges</div></div>\`+
      \`<div><div style="font-size:10px;text-transform:uppercase;color:var(--text-2);margin-bottom:3px;">Mois en vert</div><div style="font-size:16px;font-weight:700;color:#4CAF82;">\${moisOk} / \${12-moisVide}</div><div style="font-size:11px;color:var(--text-2);">\${moisKo>0?moisKo+' mois sous le seuil':'Tous les mois couverts'}</div></div>\`+
      \`</div>\`;
  }

  const c2=q('#chart-dash-line');
  if(c2)drawLineChart(c2,MOIS_COURT,netParMois,COLORS.success);

  // Dernières transactions
  const tEl=q('#dash-transactions-list');
  if(tEl){
    const tx=[...transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
    tEl.innerHTML=tx.length?tx.map(t=>\`
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <div><div style="font-weight:500;">\${t.libelle||'—'}</div><div style="font-size:11px;color:var(--text-2);">\${fmtDate(t.date)}</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:\${t.type==='credit'?'var(--success)':'var(--danger)'};">\${t.type==='credit'?'+':'−'}\${fmt(t.montant||0)}</span>
      </div>\`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucune transaction</p>';
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
      <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;">
        <div><div style="font-weight:500;">\${a.nom}</div><div style="font-size:11px;color:var(--text-2);">Jour \${a.jour||'—'} · dans \${a.joursAvant} j</div></div>
        <span style="font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--navy);">\${fmt(a.montant||0)}</span>
      </div>\`).join(''):'<p style="font-size:13px;color:var(--text-2);padding:12px 0;">Aucun abonnement actif</p>';
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
const ENVELOPPES_COULEURS={qonto:'#1A2E5A',charges:'#E8A838',formations:'#7C3AED',tresorerie:'#4CAF82',salaire:'#E05252'};
const ENVELOPPES_ICONES={qonto:'ti-building-bank',charges:'ti-receipt',formations:'ti-school',tresorerie:'ti-safe',salaire:'ti-user'};
let _enveloppes=[];

async function loadEnveloppes(){
  // Sync silencieux puis chargement des enveloppes
  try{await syncQonto(true);}catch(e){}
  try{
    const res=await api('GET','/api/enveloppes');
    _enveloppes=res.enveloppes||[];
    renderEnveloppes();
    renderVirements();
    finHeroMaj('tresorerie');
    const o=q('.fin-onglets .fin-onglet.on');if(o&&q('#section-enveloppes.active'))o.textContent='Enveloppes · '+_enveloppes.filter(e=>e.id!=='qonto'&&e.id!=='salaire').length;
  }catch(e){toast('Erreur chargement enveloppes','error');}
}

function renderEnveloppes(){
  const g=q('#enveloppes-grid');
  if(!g)return;

  // Bandeau récap
  const qonto=_enveloppes.find(e=>e.id==='qonto');
  const banner=q('#enveloppes-banner');
  if(banner&&qonto){
    const soldeReel=qonto.soldeQontoReel??0;
    const totalAlloue=_enveloppes.filter(e=>e.id!=='qonto').reduce((s,e)=>s+Math.max(0,e.solde),0);
    const restant=soldeReel-totalAlloue;
    const surplusColor=restant<0?'#E05252':restant===0?'#E8A838':'#4CAF82';
    banner.innerHTML=\`<div style="background:var(--navy);border-radius:12px;padding:16px 24px;display:flex;gap:32px;flex-wrap:wrap;align-items:center;">
      <div style="color:#fff;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;margin-bottom:3px;">Solde reel Qonto</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500;">\${fmt(soldeReel)}</div>
      </div>
      <div style="color:#fff;opacity:.4;font-size:20px;">−</div>
      <div style="color:#fff;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.6;margin-bottom:3px;">Total alloue</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500;">\${fmt(totalAlloue)}</div>
      </div>
      <div style="color:#fff;opacity:.4;font-size:20px;">=</div>
      <div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.6);margin-bottom:3px;">\${restant<0?'Deficit':'Disponible a repartir'}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:\${surplusColor};">\${fmt(Math.abs(restant))}\${restant<0?' ⚠':''}</div>
      </div>
    </div>\`;
  }

  const liste=_enveloppes.filter(e=>e.id!=='qonto'&&e.id!=='salaire');
  fqCarteSalaire();
  g.innerHTML=liste.length?liste.map(e=>{
    const obj=e.objectif,solde=e.solde||0;
    const atteint=obj!=null&&solde>=obj,manque=obj!=null?Math.max(0,obj-Math.max(0,solde)):0;
    const n=obj>0?Math.min(12,Math.round(Math.max(0,solde)/obj*12)):(solde>0?12:0);
    const sous=(e.id==='tresorerie'?'ton coussin : ':'')+(obj==null?'sans objectif':(atteint?'objectif '+fmt0(obj):'objectif '+fmt0(obj)+', il manque '+fmt0(manque)));
    const act=atteint?'<span class="fa-pas fa-p-n">atteint</span>':(e.virer?'<button class="fa-btn fa-btn--c" data-id="'+e.id+'" data-m="'+Math.round(Math.min(e.virer,manque||e.virer))+'" onclick="finVirerVers(this.dataset.id,this.dataset.m)">Virer '+fmt0(Math.min(e.virer,manque||e.virer))+' par mois</button>':'');
    return '<div class="fin-env">'+
      '<div><span class="fin-env__n">'+faEsc(e.nom)+'</span><span class="fin-env__l"><button class="fin-lien" data-id="'+e.id+'" onclick="openVirementModal(this.dataset.id)">Virer</button><button class="fin-lien" data-id="'+e.id+'" data-o="'+(obj==null?'':obj)+'" onclick="openObjectifModal(this.dataset.id,this.dataset.o?Number(this.dataset.o):null)">Objectif</button></span></div>'+
      '<span class="fin-env__m fa-n'+(solde<0?' fin-retard':'')+'">'+fmt0(solde)+'</span>'+
      '<div>'+faTirets(n,12,atteint?'':'r')+'<div class="fin-env__s">'+sous+'</div></div>'+
      '<span class="fin-env__a">'+act+'</span></div>';
  }).join(''):'<p class="fa-vide">Aucune enveloppe pour l’instant.</p>';
}

function renderVirements(){
  const el=q('#virements-list');
  if(!el)return;
  const tous=_enveloppes.flatMap(e=>e.transactions.filter(t=>t.type==='debit').map(t=>({
    ...t,de:e.id,deNom:e.nom
  }))).sort((a,b)=>b.date.localeCompare(a.date));
  el.innerHTML=tous.length?tous.map(t=>\`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
      <div>
        <div style="font-size:13px;font-weight:500;">\${t.motif||'Virement'}</div>
        <div style="font-size:11px;color:var(--text-2);">\${fmtDate(t.date)} · \${t.deNom} <i class="ti ti-arrow-right" style="font-size:10px;"></i> \${t.contrepartie}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-family:'Cormorant Garamond',serif;font-size:16px;">\${fmt(t.montant)}</span>
        <button class="fin-lien" onclick="deleteVirement('\${t.id}')">Supprimer</button>
      </div>
    </div>\`).join(''):'<p style="color:var(--text-2);font-size:13px;padding:16px 0;">Aucun virement pour le moment</p>';
}

const OBJECTIF_HINTS={
  charges:"Recommande : 3 mois de tes abonnements actifs. Un matelas pour couvrir tes charges fixes sans stress.",
  formations:"Recommande : ton budget annuel de formation. Vise 500 a 2000 par an selon tes projets.",
  tresorerie:"Recommande : 2 a 3 mois de seuil de rentabilite. Ton filet de securite si un mois est creux.",
  salaire:"Recommande : 2 a 3 mois de ton versement mensuel objectif. Pour te payer meme si une facture est en retard.",
};
const OBJECTIF_KEYS={charges:'objectifCharges',formations:'objectifFormations',tresorerie:'objectifTresorerie',salaire:'objectifSalaire'};
let _objectifEnvId=null;

function openObjectifModal(id,valActuelle){
  _objectifEnvId=id;
  const env=_enveloppes.find(e=>e.id===id);
  if(q('#modal-objectif-env-title'))q('#modal-objectif-env-title').textContent='Objectif — '+(env?.nom||id);
  if(q('#objectif-env-montant'))q('#objectif-env-montant').value=valActuelle||'';
  if(q('#objectif-env-hint'))q('#objectif-env-hint').textContent=OBJECTIF_HINTS[id]||'';
  q('#modal-objectif-env').style.display='flex';
}

async function saveObjectifEnv(){
  const montant=parseFloat(q('#objectif-env-montant').value);
  if(isNaN(montant)||montant<0){toast('Montant invalide','error');return;}
  const key=OBJECTIF_KEYS[_objectifEnvId];
  if(!key){toast('Enveloppe inconnue','error');return;}
  try{
    const settings=dbGetObj('settings');
    settings[key]=montant;
    _cache.settings=await api('PUT','/api/settings',settings);
    q('#modal-objectif-env').style.display='none';
    toast('Objectif mis à jour','success');
    await loadEnveloppes();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

function openVirementModal(defaultDe='qonto'){
  const opts=_enveloppes.map(e=>\`<option value="\${e.id}">\${e.nom} (\${fmt(e.solde)})</option>\`).join('');
  q('#virement-de').innerHTML=opts;
  q('#virement-vers').innerHTML=opts;
  q('#virement-de').value=defaultDe;
  q('#virement-vers').value=defaultDe==='qonto'?'salaire':'qonto';
  q('#virement-date').value=new Date().toISOString().slice(0,10);
  q('#virement-montant').value='';
  q('#virement-motif').value='';
  q('#modal-virement').style.display='flex';
}

function closeVirementModal(){q('#modal-virement').style.display='none';}

async function saveVirement(){
  const de=q('#virement-de').value;
  const vers=q('#virement-vers').value;
  const montant=parseFloat(q('#virement-montant').value);
  const date=q('#virement-date').value;
  const motif=q('#virement-motif').value.trim();
  if(!de||!vers||!date||isNaN(montant)||montant<=0){toast('Remplis tous les champs','error');return;}
  if(de===vers){toast('Choisis deux comptes différents','error');return;}
  try{
    await api('POST','/api/virements',{de,vers,montant,date,motif});
    closeVirementModal();
    toast('Virement enregistré','success');
    await loadEnveloppes();
    if(q('#section-cloture.active'))loadCloture();
  }catch(e){toast('Erreur : '+e.message,'error');}
}

async function deleteVirement(id){
  if(!await confirmDialog('Supprimer ce virement ?','Cette action est irréversible.'))return;
  try{
    await api('DELETE',\`/api/virements/\${id}\`);
    toast('Virement supprimé','success');
    await loadEnveloppes();
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
    if(!depList||!depList.length)return '<div style="font-size:11px;color:var(--text-2);margin-top:6px;font-style:italic;">Aucune dépense dans cette enveloppe</div>';
    return '<div style="margin-top:8px;border-top:1px solid #E0DDD8;padding-top:8px;">'+
      depList.map(d=>'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-2);padding:2px 0;">'+
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
    return '<div style="background:#F5F3EF;border-radius:10px;padding:14px 16px;border-left:4px solid '+(overshot?'#E05252':couleur)+';">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">'+
        '<div style="display:flex;align-items:center;gap:8px;">'+
          '<span style="font-size:18px;">'+icon+'</span>'+
          '<span style="font-size:12px;font-weight:700;color:var(--navy);">'+label+'</span>'+
        '</div>'+
        '<div style="text-align:right;">'+
          '<div style="font-size:10px;color:var(--text-2);">Provision</div>'+
          '<div style="font-size:13px;font-weight:600;color:var(--navy);">'+fmt(provision)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;gap:12px;margin-bottom:8px;">'+
        '<div style="flex:1;background:'+(overshot?'#FEE':'#fff')+';border-radius:8px;padding:8px 10px;text-align:center;">'+
          '<div style="font-size:10px;color:var(--text-2);margin-bottom:2px;">À garder de côté</div>'+
          '<div style="font-size:17px;font-weight:700;color:'+(overshot?'#E05252':restant===0?'#4CAF82':couleur)+';">'+(restant===0?'✓ Couvert':fmt(restant))+'</div>'+
        '</div>'+
        '<div style="flex:1;background:#fff;border-radius:8px;padding:8px 10px;text-align:center;">'+
          '<div style="font-size:10px;color:var(--text-2);margin-bottom:2px;">Déjà réglé</div>'+
          '<div style="font-size:17px;font-weight:700;color:var(--navy);">'+fmt(depense)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="height:5px;background:#E8E8E4;border-radius:3px;margin-bottom:8px;">'+
        '<div style="height:100%;width:'+pct+'%;background:'+(overshot?'#E05252':pct>=100?'#4CAF82':couleur)+';border-radius:3px;transition:width .5s;"></div></div>'+
      depLines(depList)+
    '</div>';
  }

  envEl.innerHTML =
    // ── Zone 1 : Synthèse ────────────────────────────────────────────────
    '<div style="grid-column:1/-1;background:var(--navy);border-radius:14px;padding:20px 24px;color:#fff;margin-bottom:4px;">'+
      '<div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.7;margin-bottom:14px;">Synthèse · depuis '+fmtDate(dateDebut)+'</div>'+
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">'+
        '<div>'+
          '<div style="font-size:11px;opacity:.6;margin-bottom:4px;">Solde Qonto</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;">'+fmt(soldeActuel)+'</div>'+
          (caAttente>0?'<div style="font-size:11px;opacity:.6;margin-top:4px;">+'+fmt(caAttente)+' en attente</div>':'')+
        '</div>'+
        '<div style="border-left:1px solid rgba(255,255,255,.2);padding-left:16px;">'+
          '<div style="font-size:11px;opacity:.6;margin-bottom:4px;">🔒 À sécuriser</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:#F8B84E;">'+fmt(totalASecuriser)+'</div>'+
          '<div style="font-size:11px;opacity:.6;margin-top:4px;">charges + frais restants</div>'+
        '</div>'+
        '<div style="border-left:1px solid rgba(255,255,255,.2);padding-left:16px;">'+
          '<div style="font-size:11px;opacity:.6;margin-bottom:4px;">✅ Disponible net</div>'+
          '<div style="font-size:28px;font-weight:700;letter-spacing:-.5px;color:'+(disponibleBrut<0?'#F87171':'#4ADE80')+';">'+fmt(disponibleBrut)+'</div>'+
          '<div style="font-size:11px;opacity:.6;margin-top:4px;">après provisions sécurisées</div>'+
        '</div>'+
      '</div>'+
      // Répartition du disponible
      (disponibleBrut>0?
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.15);">'+
        '<div style="font-size:11px;opacity:.6;margin-bottom:10px;">Répartition du disponible net</div>'+
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">💸 Versement perso ('+Math.round(pctVers*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctVers*100)/100)+'</div>'+
            (depVers>0?'<div style="font-size:10px;opacity:.5;margin-top:2px;">Déjà versé : '+fmt(depVers)+'</div>':'')+
          '</div>'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">🏦 Trésorerie ('+Math.round(pctTreso*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctTreso*100)/100)+'</div>'+
          '</div>'+
          '<div style="background:rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;">'+
            '<div style="font-size:10px;opacity:.6;margin-bottom:3px;">📚 Formation ('+Math.round(pctFormation*100)+'%)</div>'+
            '<div style="font-size:18px;font-weight:700;">'+fmt(Math.round(disponibleBrut*pctFormation*100)/100)+'</div>'+
          '</div>'+
        '</div>'+
      '</div>':'')
    +'</div>'+
    // ── Zone 2 : Provisions ──────────────────────────────────────────────
    '<div style="grid-column:1/-1;font-size:12px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 4px;">🔒 Provisions à sécuriser</div>'+
    provCard('🔴','Charges sociales (URSSAF · CFE)',provCharges,depCharges,resteCharges,'#E05252',listCharges)+
    provCard('📋','Charges fixes (abonnements · frais pro)',provChargesFixes,depFixes,resteChargesFix,'#E8A838',listFixes)+
    provCard('📚','Formation',provFormation,depFormation,resteFormation,'#7B4DD4',listFormation)+
    // ── Zone 3 : Versements perso ────────────────────────────────────────
    '<div style="grid-column:1/-1;font-size:12px;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 4px;">💸 Versements perso effectués</div>'+
    '<div style="background:#F5F3EF;border-radius:10px;padding:14px 16px;border-left:4px solid #4CAF82;">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'+
        '<span style="font-size:12px;font-weight:700;color:var(--navy);">Total versé depuis '+fmtDate(dateDebut)+'</span>'+
        '<span style="font-size:20px;font-weight:700;color:#4CAF82;">'+fmt(depVers)+'</span>'+
      '</div>'+
      depLines(listVers)+
    '</div>';

  // ── Pots virtuels (grille en haut de la section) ──────────────────────
  const potsGrid=q('#qonto-pots-grid');
  if(potsGrid){
    function potCard(icon,nom,solde,couleur,sub,pct){
      const pctClamped=Math.min(100,Math.max(0,pct||0));
      return '<div class="pot-card" style="border-top:3px solid '+couleur+';">'+
        '<div class="pot-card-header">'+
          '<div>'+
            '<div class="pot-icon">'+icon+'</div>'+
            '<div class="pot-nom">'+nom+'</div>'+
          '</div>'+
          '<span class="badge" style="background:'+couleur+'22;color:'+couleur+';font-size:10px;">virtuel</span>'+
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
      potCard('🔴','URSSAF & Charges sociales', Math.max(0,resteCharges), '#E05252',
        depCharges>0?fmt(depCharges)+' deja regle · provision '+fmt(provCharges):'Provision sur CA encaisse',
        pctUsedCharges)+
      potCard('📋','Charges fixes & abonnements', Math.max(0,resteChargesFix), '#E8A838',
        'Budget annuel '+fmt(provChargesFixes)+' · '+fmt(depFixes)+' dépensé',
        pctUsedFixes)+
      potCard('📚','Formation', Math.max(0,resteFormation), '#7B4DD4',
        'Provision '+fmt(provFormation)+' · '+fmt(depFormation)+' utilisé',
        pctUsedFormation)+
      potCard('🏦','Trésorerie buffer', Math.round(disponibleBrut*pctTreso*100)/100, '#3b6dd4',
        Math.round(pctTreso*100)+'% du disponible net · sécurité',
        100)+
      potCard('💸','Versement perso', versementSolde, '#4CAF82',
        fmt(depVers)+' versé · reste à te virer',
        depVers>0?Math.min(100,depVers/(Math.round(disponibleBrut*pctVers*100)/100)*100):0)+
      (pctEpargne>0.001?potCard('💰','Épargne', provEpargne, '#6B8DD4','Buffer long terme',0):'');
  }
}
function renderDepensesPrevues(){
  const list=dbGet('depenses_prevues');
  const el=q('#depenses-prevues-list');
  if(!el)return;
  if(!list.length){
    el.innerHTML='<p style="color:var(--text-2);font-size:13px;padding:8px 0;">Aucune dépense prévue. Clique sur "+ Ajouter" pour en planifier une.</p>';
    return;
  }
  const today=new Date().toISOString().slice(0,7);
  el.innerHTML='<div class="table-wrap"><table><thead><tr><th>Type</th><th>Description</th><th>Catégorie</th><th>Montant</th><th>Période / Date</th><th>Statut</th><th></th></tr></thead><tbody>'+
    list.map(d=>{
      const isMens=d.type==='mensuel';
      const badge=isMens
        ?'<span class="badge" style="background:#e8f0fe;color:#3b6dd4;">Mensuelle</span>'
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
          '<button class="btn btn-ghost btn-xs" data-dpid="'+d.id+'" onclick="editDepensePrevue(this.dataset.dpid)">Modifier</button>'+
          '<button class="btn btn-ghost btn-xs" data-dpid="'+d.id+'" onclick="deleteDepensePrevue(this.dataset.dpid)">Supprimer</button>'+
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
    const soldeSuffix=isCourant&&soldeReel!=null?\` <span style="font-size:11px;color:var(--text-2);font-weight:400;">· Sync \${syncAt?fmtDate(syncAt.slice(0,10)):''}</span>\`:'';
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
        <button class="btn btn-ghost btn-sm" onclick="openCompteModal('\${c.id}')">Modifier</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCompte('\${c.id}')">Supprimer</button>
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
    <td><button class="btn btn-ghost btn-xs" onclick="deleteTxn('\${t.id}')">Supprimer</button></td>
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
  renderFactures();
  finHeroMaj('factures');
  if(!FQ_MOUV&&!FQ_EN_COURS)fqRelier().then(c=>{if(c){facturesData=dbGet('factures');renderFactures();finHeroMaj('factures');}});
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
  if(statut==='retard')list=list.filter(finEnRetard);
  else if(statut==='attente')list=list.filter(f=>f.statut==='attente'&&!finEnRetard(f));
  else if(statut)list=list.filter(f=>f.statut===statut);
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
  const dm=d=>d?fmtDate(d).slice(0,5):'';
  const vuesQonto={};Object.values(fqLiens()).forEach(x=>{if(x.t==='facture'||x.t==='client')vuesQonto[x.id]=1;});
  tbody.innerHTML=list.length?list.map(f=>{
    const proj=f.projetId?dbGet('projets').find(x=>x.id===f.projetId):null;
    const dv=proj&&proj.devisId?dbGet('devis').find(x=>x.id===proj.devisId):null;
    const sousTitre=proj?proj.nom:(f.description||'');
    const enR=finEnRetard(f);
    let ech='<span class="td-muted">—</span>';
    if(f.dateEcheance){
      const j=Math.round((new Date(f.dateEcheance)-new Date(finAuj()))/86400000);
      ech=enR?'<span class="fin-retard">'+dm(f.dateEcheance)+', '+finJours(f.dateEcheance)+' jours de retard</span>':dm(f.dateEcheance)+(f.statut==='attente'?(j===0?', aujourd’hui':', dans '+j+' jour'+(j>1?'s':'')):'');
    }
    const etat=f.statut==='payee'?'<span class="fa-pas fa-p-n">payée'+(f.datePaiement?' le '+dm(f.datePaiement):'')+'</span>'+(vuesQonto[f.id]?'<span class="fin-cl__s">vue sur Qonto</span>':''):fqRecu('facture',f.id)>0.5?'<span class="fa-pas fa-p-a">payée en partie</span><span class="fin-cl__s">reste '+fmt0(fqReste(f))+'</span>':enR?'<span class="fa-pas fa-p-r">en retard</span>':'<span class="fa-pas fa-p-a">en attente</span>';
    return '<tr>'+
      '<td class="td-mono">'+(f.typeFacture==='qonto'?'<span class="fin-cl__s">sans facture</span>':faEsc(f.numero||'—'))+'</td>'+
      '<td><span class="fin-cl">'+faEsc(f.client||'—')+'</span>'+(sousTitre||dv?'<span class="fin-cl__s">'+faEsc(sousTitre)+(dv?(sousTitre?' · ':'')+'<button class="fin-lien" data-id="'+dv.id+'" onclick="finVoirDevis(this.dataset.id)">devis '+faEsc(dv.numero)+'</button>':'')+'</span>':'')+'</td>'+
      '<td>'+dm(f.date)+'</td>'+
      '<td>'+ech+'</td>'+
      '<td class="td-amount">'+fmt(f.montant||0)+'</td>'+
      '<td>'+etat+'</td>'+
      '<td class="fin-act">'+(f.pdfKey?'<button class="fin-lien" data-id="'+f.id+'" data-n="'+faEsc(f.numero||'')+'" onclick="previewPDF(this.dataset.id,this.dataset.n)">PDF</button>':'')+
        '<button class="fin-lien" data-id="'+f.id+'" onclick="editFacture(this.dataset.id)">Modifier</button>'+
        '<button class="fin-lien" data-id="'+f.id+'" onclick="deleteFacture(this.dataset.id)">Supprimer</button></td>'+
    '</tr>';
  }).join(''):'<tr><td colspan="7" class="fin-vide">Aucune facture</td></tr>';
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
  if(devis)lines.push(\`📄 Devis \${devis.numero} · signé · \${fmt(devis.montant)}\`);
  lines.push(\`📁 \${projet.nom} · \${typeLabel[projet.type]||projet.type}\${projet.type==='mensuel'?(projet.dureeIndeterminee?' · indéterminé':' · '+projet.nombreMois+' mois'):''}\`);
  lines.push(\`Facturé : \${fmt(montantFacture)}\${!projet.dureeIndeterminee?' / '+fmt(projet.montantTotal||0):''} · <strong style="color:\${reste>0?'#E8A838':'#4CAF82'};">\${projet.dureeIndeterminee?(linked.length+' facture(s) émise(s)'):(reste>0?'Reste : '+fmt(reste):'✓ Complet')}</strong>\`);
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
    sugNote=resteMois>0?\`Mois \${moisFact+1}/\${projet.nombreMois} suggéré · \${fmt(sugMontant)}\`:\`✓ Tous les mois facturés\`;
  }else if(projet.type==='echelonne'){
    const hasA=linked.some(f=>f.typeFacture==='acompte');
    const hasS=linked.some(f=>f.typeFacture==='solde');
    if(!hasA){sugType='acompte';sugNote='💡 Acompte suggéré (pas encore émis)';}
    else if(!hasS&&reste>0){sugType='solde';sugNote=\`💡 Solde suggéré · \${fmt(reste)} restant\`;}
    else if(reste>0){sugType='intermediaire';sugNote=\`💡 Intermédiaire suggéré · \${fmt(reste)} restant\`;}
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
  contact:{label:'Premier contact',color:'#BAD1FD',cls:'attente'},
  en_attente:{label:'En attente',color:'#E8A838',cls:'retard'},
  positif:{label:'Positif',color:'#4CAF82',cls:'payee'},
  negatif:{label:'Négatif',color:'#E85454',cls:'annule'},
  proposition:{label:'Proposition',color:'#E4D1FE',cls:'brouillon'},
  converti:{label:'Converti',color:'#4CAF82',cls:'payee'},
  sans_suite:{label:'Sans suite',color:'#6B6B6B',cls:'annule'},
};

async function loadCrm(){
  try{
    const res=await api('GET','/api/prospects');
    _prospectsCache=Array.isArray(res)?res:[];
  }catch(e){_prospectsCache=[];}
  renderCrmKpis();
  renderCrmBanner();
  renderCrmCharts();
  renderCrmTable();
  refreshCrmSecteurFilter();
  const btnNew=q('#btn-new-prospect');
  if(btnNew)btnNew.onclick=()=>openProspectModal();
  const btnSave=q('#btn-save-prospect');
  if(btnSave)btnSave.onclick=saveProspectModal;
  const searchEl=q('#crm-search');
  if(searchEl)searchEl.oninput=renderCrmTable;
  const filtStatut=q('#crm-filter-statut');
  if(filtStatut)filtStatut.onchange=renderCrmTable;
  const filtSecteur=q('#crm-filter-secteur');
  if(filtSecteur)filtSecteur.onchange=renderCrmTable;
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
  if(total===0){ctx.fillStyle='#ccc';ctx.font="14px DM Sans";ctx.textAlign="center";ctx.fillText("Aucune donnée",W/2,H/2);return;}
  const cx=W*0.38,cy=H/2,r=Math.min(cx,cy)-20,ri=r*0.55;
  let angle=-Math.PI/2;
  vals.forEach((v,i)=>{
    const slice=v/total*2*Math.PI;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+slice);ctx.closePath();
    ctx.fillStyle=colors[i%colors.length];ctx.fill();
    angle+=slice;
  });
  ctx.beginPath();ctx.arc(cx,cy,ri,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();
  // Légende
  const legendX=W*0.72,legendStep=18,legendY0=Math.max(12,cy-vals.length*legendStep/2);
  labels.forEach((l,i)=>{
    const y=legendY0+i*legendStep;
    ctx.fillStyle=colors[i%colors.length];
    ctx.fillRect(legendX-20,y-8,12,12);
    ctx.fillStyle='#222';ctx.font="12px DM Sans";ctx.textAlign="left";
    ctx.fillText(l+" ("+vals[i]+")",legendX-4,y+2);
  });
}

function _drawBarChartCRM(canvas,labels,vals,colors){
  const {ctx,W,H}=setupCanvas(canvas);
  if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  if(vals.length===0){ctx.fillStyle='#ccc';ctx.font="14px DM Sans";ctx.textAlign="center";ctx.fillText("Aucune donnée",W/2,H/2);return;}
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
    ctx.fillStyle='#222';ctx.font="bold 12px DM Sans";ctx.textAlign="center";
    ctx.fillText(vals[i],x+bw/2,y-4);
    ctx.fillStyle='#555';ctx.font="11px DM Sans";
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
    if(faite)return"<span style='color:var(--success);font-size:12px;'>"+fmtDate(faite)+"<br><small>faite</small></span>";
    if(!prevue)return"<span style='color:var(--text-2);'>—</span>";
    const en_retard=prevue<=todayStr&&!faite;
    const style=en_retard?"color:var(--danger);font-weight:600;":"";
    return"<span style='font-size:12px;"+style+"'>"+fmtDate(prevue)+(en_retard?"<br><small>En retard</small>":"")+"</span>";
  }
  tbody.innerHTML=list.length?list.map(p=>{
    const st=CRM_STATUTS[p.statut]||{label:p.statut,cls:'attente'};
    return\`<tr>
      <td><strong>\${p.nom}</strong>\${p.email?"<br><small style='color:var(--text-2);'>"+p.email+"</small>":""}</td>
      <td>\${p.entreprise||"—"}</td>
      <td><span style="font-size:12px;">\${p.secteur||"—"}</span></td>
      <td>\${p.dateContact?fmtDate(p.dateContact):"—"}\${p.telephone?"<br><small style='color:var(--text-2);'>"+p.telephone+"</small>":""}</td>
      <td><span class="badge badge-\${st.cls}">\${st.label}</span></td>
      <td>\${relanceCell(p.relance1,p.dateRelance1)}</td>
      <td>\${relanceCell(p.relance2,p.dateRelance2)}</td>
      <td>\${relanceCell(p.relanceFinale,p.dateRelanceFinale)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-xs" onclick="editProspect('\${p.id}')">Modifier</button>
        <button class="btn btn-ghost btn-xs" onclick="deleteProspect('\${p.id}')">Supprimer</button>
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
function finVoirDevis(id){navigate('devis');setTimeout(()=>highlightDevis(id),300);}
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
  tbody.innerHTML=fvLignesDevis(list);
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
  const enCours=projets.filter(p=>p.statut==='en_cours');
  const totalContrat=enCours.reduce((s,p)=>s+(p.montantTotal||0),0);
  let totalFacture=0;
  projets.forEach(p=>{
    const linked=factures.filter(f=>f.projetId===p.id);
    totalFacture+=linked.reduce((s,f)=>s+(f.montant||0),0);
  });
  const totalReste=Math.max(0,totalContrat-totalFacture);
  if(q('#proj-kpi-actifs'))q('#proj-kpi-actifs').textContent=enCours.length;
  if(q('#proj-kpi-contrat'))q('#proj-kpi-contrat').textContent=fmt(totalContrat);
  if(q('#proj-kpi-facture'))q('#proj-kpi-facture').textContent=fmt(totalFacture);
  if(q('#proj-kpi-reste'))q('#proj-kpi-reste').textContent=fmt(totalReste);
  renderProjets();
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
      <button class="btn btn-ghost btn-xs" onclick="editDepense('\${d.id}')">Modifier</button>
      <button class="btn btn-ghost btn-xs" onclick="deleteDepense('\${d.id}')">Supprimer</button>
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
  finHeroMaj('charges');
  if(!FQ_MOUV&&!FQ_EN_COURS)fqRelier().then(()=>renderAbonnements());
}
function renderAbonnements(){
  const el=q('#abonnements-liste');if(!el)return;
  const actif=a=>a.statut==='actif'||!a.statut;
  const mt=a=>a.montant||a.montantMensuel||0;
  const liste=aboData.filter(actif).concat(aboData.filter(a=>!actif(a)));
  const total=aboData.filter(actif).reduce((s,a)=>s+mt(a),0);
  // Prélèvements vus sur Qonto ce mois-ci
  const mk=finAuj().slice(0,7),jourAuj=+finAuj().slice(8,10),vus={};
  Object.values(fqLiens()).forEach(x=>{if(x.t==='charge'&&x.id&&(x.d||'').startsWith(mk))vus[x.id]=x.d;});
  const quand=a=>a.statut==='pause'?'en pause':a.statut&&!actif(a)?'arrêtée':vus[a.id]?'prélevée le '+fqJour(vus[a.id]):(FQ_MOUV&&(+a.jour||1)<jourAuj-2)?'<span class="fin-retard">pas encore vue ce mois</span>':'chaque mois, le '+(Number(a.jour)===1?'1er':(a.jour||'1er'));
  el.innerHTML=(liste.length?liste.map(a=>'<div class="fin-ch'+(actif(a)?'':' fin-ch--off')+'">'+
      '<span class="fin-ch__n">'+faEsc(a.nom)+'</span>'+
      '<span class="fin-ch__j">'+quand(a)+'</span>'+
      '<span class="fin-ch__m fa-n">'+fmt(mt(a))+'</span>'+
      '<span class="fin-act"><button class="fin-lien" data-id="'+a.id+'" onclick="editAbonnement(this.dataset.id)">Modifier</button><button class="fin-lien" data-id="'+a.id+'" onclick="deleteAbonnement(this.dataset.id)">Supprimer</button></span></div>').join('')
    :'<p class="fa-vide">Aucune charge fixe pour l’instant.</p>')+
    '<div class="fin-ch__pied"><button class="fin-lien" onclick="openAbonnementModal()">Ajouter une charge</button><span class="fa-n">'+fmt(total)+' par mois</span></div>';
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
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;">Ratio charges/CA : \${caMois>0?Math.round(totalCharges/caMois*100):0}%</div>\`;
  const dm=q('#charges-depenses-mois');
  if(dm)dm.innerHTML=\`
    <div class="charges-recap-line"><span class="charges-recap-label">Dépenses pro ce mois</span><span class="charges-recap-amount">\${fmt(depM)}</span></div>
    <div style="font-size:12px;color:var(--text-2);margin-top:8px;"><a style="cursor:pointer;color:var(--navy);" onclick="navigate('depenses')">Voir les dépenses →</a></div>\`;
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
    return\`<div class="goal-card">
      <div class="goal-card-header">
        <div class="goal-card-name">\${obj.nom}</div>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-xs" onclick="editEpargneGoal('\${obj.id}')">Modifier</button>
          <button class="btn btn-ghost btn-xs" onclick="deleteEpargneGoal('\${obj.id}')">Supprimer</button>
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
      <div style="display:flex;gap:24px;font-size:13.5px;">
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
      <p style="font-size:11px;color:var(--text-2);margin-top:10px;">Estimation indicative basée sur les tranches \${annee}. Consultez un comptable pour votre déclaration.</p>
    </div>\`;
}

/* --- Simulateur ------------------------------------------------------- */
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
      \${ca>PLAFOND_BNC?\`<div style="font-size:11px;color:var(--danger);margin-top:6px;"><i class="ti ti-alert-triangle"></i> Dépasse le plafond micro-BNC</div>\`:''}
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
  if(q('#opt-seuil-tva'))q('#opt-seuil-tva').value=s.seuilTva||37500;
  if(q('#opt-plafond-micro'))q('#opt-plafond-micro').value=s.plafondMicro||77700;
  if(q('#opt-seuil-coussin'))q('#opt-seuil-coussin').value=s.seuilCoussin||3;
  updateOptTotal();
}
function updateOptTotal(){
  const v=parseFloat(q('#opt-versement')?.value)||0;
  const e=parseFloat(q('#opt-epargne-pct')?.value)||0;
  const t=parseFloat(q('#opt-tresorerie-pct')?.value)||0;
  const total=v+e+t;
  const alEl=q('#opt-total-alerte');
  if(alEl)alEl.innerHTML=total===100?\`<span style="color:var(--success);">✓ Total : 100%</span>\`:\`<span style="color:var(--danger);">Total : \${total}% (doit être égal à 100%)</span>\`;
}
async function saveOptions(){
  const v=parseFloat(q('#opt-versement')?.value)||65;
  const e=parseFloat(q('#opt-epargne-pct')?.value)||15;
  const t=parseFloat(q('#opt-tresorerie-pct')?.value)||20;
  if(v+e+t!==100){toast('Versement + Épargne + Trésorerie doit être égal à 100%','error');return;}
  const body={
    ...dbGetObj('settings'),
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
    pctVersement:v,pctEpargne:e,pctTresorerie:t,
    seuilTva:parseFloat(q('#opt-seuil-tva')?.value)||37500,
    plafondMicro:parseFloat(q('#opt-plafond-micro')?.value)||77700,
    seuilCoussin:parseFloat(q('#opt-seuil-coussin')?.value)||3
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
    if (path === '/style.css') return new Response(CSS,  { headers: { 'Content-Type': 'text/css; charset=utf-8',         'Cache-Control': 'no-cache' } });
    if (path === '/app.js')    return new Response(JS,   { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' } });
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
