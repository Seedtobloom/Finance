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
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>

<!-- APP SHELL -->
<div id="app">

  <!-- SIDEBAR -->
  <aside id="sidebar">
    <div class="sidebar-logo">
      <span class="logo-name">Seed to Bloom</span>
      <span class="logo-sub">finance</span>
    </div>

    <nav id="sidebar-nav">

      <!-- TABLEAU DE BORD -->
      <div class="nav-group">
        <a class="nav-item" data-section="dashboard">
          <i class="ti ti-layout-dashboard"></i> Tableau de bord
        </a>
      </div>

      <!-- MES FINANCES -->
      <div class="nav-group">
        <span class="nav-group-label">Mes finances</span>
        <a class="nav-item" data-section="vue-ensemble">
          <i class="ti ti-chart-area"></i> Vue d'ensemble
        </a>
        <a class="nav-item" data-section="comptes">
          <i class="ti ti-building-bank"></i> Comptes
        </a>
        <a class="nav-item" data-section="transactions">
          <i class="ti ti-arrows-exchange"></i> Transactions
        </a>
      </div>

      <!-- REVENUS -->
      <div class="nav-group">
        <span class="nav-group-label">Revenus</span>
        <a class="nav-item" data-section="factures">
          <i class="ti ti-file-invoice"></i> CA &amp; Factures
        </a>
        <a class="nav-item" data-section="devis">
          <i class="ti ti-file-description"></i> Devis
        </a>
        <a class="nav-item" data-section="projets">
          <i class="ti ti-folders"></i> Projets
        </a>
        <a class="nav-item" data-section="tiers">
          <i class="ti ti-users"></i> Clients &amp; tiers
        </a>
        <a class="nav-item" data-section="objectifs-ca">
          <i class="ti ti-target"></i> Objectifs de CA
        </a>
      </div>

      <!-- DÉPENSES -->
      <div class="nav-group">
        <span class="nav-group-label">Dépenses</span>
        <a class="nav-item" data-section="depenses">
          <i class="ti ti-receipt"></i> Dépenses pro
        </a>
        <a class="nav-item" data-section="abonnements">
          <i class="ti ti-repeat"></i> Charges fixes
        </a>
        <a class="nav-item" data-section="charges-urssaf">
          <i class="ti ti-calendar-due"></i> Charges &amp; URSSAF
        </a>
      </div>

      <!-- ÉPARGNE & INVESTISSEMENT -->
      <div class="nav-group">
        <span class="nav-group-label">Épargne &amp; Investissement</span>
        <a class="nav-item" data-section="repartition">
          <i class="ti ti-chart-pie"></i> Répartition
        </a>
        <a class="nav-item" data-section="objectifs-epargne">
          <i class="ti ti-piggy-bank"></i> Objectifs
        </a>
      </div>

      <!-- RAPPORTS -->
      <div class="nav-group">
        <span class="nav-group-label">Rapports</span>
        <a class="nav-item" data-section="rapport-mensuel">
          <i class="ti ti-report"></i> Mensuel
        </a>
        <a class="nav-item" data-section="rapport-annuel">
          <i class="ti ti-report-analytics"></i> Annuel
        </a>
        <a class="nav-item" data-section="rapport-fiscal">
          <i class="ti ti-report-money"></i> Fiscal BNC
        </a>
      </div>

      <!-- OUTILS -->
      <div class="nav-group">
        <span class="nav-group-label">Outils</span>
        <a class="nav-item" data-section="simulateur">
          <i class="ti ti-calculator"></i> Simulateur de versement
        </a>
        <a class="nav-item" data-section="import-export">
          <i class="ti ti-database-import"></i> Import / Export
        </a>
      </div>

      <!-- OPTIONS -->
      <div class="nav-group">
        <a class="nav-item" data-section="options">
          <i class="ti ti-settings"></i> Options
        </a>
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

  <!-- MAIN CONTENT -->
  <main id="main">

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

      <!-- Ligne 1 KPIs -->
      <div class="kpi-grid kpi-grid-4 mb-16">
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-trending-up"></i></div>
          <span class="kpi-label">CA encaissé ce mois</span>
          <span class="kpi-value" id="kpi-ca-mois">—</span>
          <span class="kpi-sub" id="kpi-ca-mois-sub"></span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon red"><i class="ti ti-receipt"></i></div>
          <span class="kpi-label">Charges totales ce mois</span>
          <span class="kpi-value danger" id="kpi-charges-mois">—</span>
          <span class="kpi-sub" id="kpi-charges-mois-sub"></span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-wallet"></i></div>
          <span class="kpi-label">Résultat net ce mois</span>
          <span class="kpi-value green" id="kpi-net-mois">—</span>
          <span class="kpi-sub" id="kpi-net-mois-sub"></span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon violet"><i class="ti ti-arrow-right"></i></div>
          <span class="kpi-label">Versement estimé (65%)</span>
          <span class="kpi-value violet" id="kpi-versement">—</span>
          <span class="kpi-sub">du résultat net</span>
        </div>
      </div>

      <!-- Ligne 2 KPIs -->
      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-chart-bar"></i></div>
          <span class="kpi-label">CA YTD</span>
          <span class="kpi-value" id="kpi-ca-ytd">—</span>
          <span class="kpi-sub">depuis le 1er janvier</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-target"></i></div>
          <span class="kpi-label">Progression objectif annuel</span>
          <span class="kpi-value" id="kpi-objectif-pct">—</span>
          <div class="kpi-progress"><div class="kpi-progress-fill" id="kpi-objectif-bar" style="width:0%"></div></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon cream"><i class="ti ti-building-bank"></i></div>
          <span class="kpi-label">Trésorerie Qonto</span>
          <span class="kpi-value" id="kpi-treso-qonto">—</span>
          <span class="kpi-sub" id="kpi-treso-upd"></span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-calendar-due"></i></div>
          <span class="kpi-label">Prochain URSSAF</span>
          <span class="kpi-value warning" id="kpi-urssaf-next">—</span>
          <span class="kpi-sub" id="kpi-urssaf-sub"></span>
        </div>
      </div>

      <!-- 2 colonnes -->
      <div class="grid-65-35">
        <!-- Gauche : graphiques -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-title"><i class="ti ti-chart-bar"></i> Revenus vs charges (12 mois)</div>
            <div class="chart-wrap"><canvas id="chart-dash-bar" height="200"></canvas></div>
            <div class="chart-legend" id="chart-dash-bar-legend"></div>
          </div>
          <div class="card">
            <div class="card-title"><i class="ti ti-chart-line"></i> Résultat net (12 mois)</div>
            <div class="chart-wrap"><canvas id="chart-dash-line" height="140"></canvas></div>
          </div>
        </div>
        <!-- Droite : widgets -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-title" style="justify-content:space-between;">
              <span><i class="ti ti-arrows-exchange"></i> Dernières transactions</span>
              <button class="btn btn-ghost btn-xs" data-section="transactions">Voir tout</button>
            </div>
            <div id="dash-transactions-list"></div>
          </div>
          <div class="card">
            <div class="card-title" style="justify-content:space-between;">
              <span><i class="ti ti-repeat"></i> Prochains abonnements</span>
              <button class="btn btn-ghost btn-xs" data-section="abonnements">Voir tout</button>
            </div>
            <div id="dash-abonnements-list"></div>
          </div>
          <div id="dash-urssaf-alert"></div>
        </div>
      </div>
    </section><!-- /dashboard -->


    <!-- ═══════════════════════════
         VUE D'ENSEMBLE
         ═══════════════════════════ -->
    <section id="section-vue-ensemble" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Vue d'ensemble</h1>
          <div class="page-subtitle">Évolution de votre activité</div>
        </div>
      </div>

      <div class="card mb-16">
        <div class="card-title"><i class="ti ti-chart-line"></i> Solde Qonto dans le temps</div>
        <div class="chart-wrap"><canvas id="chart-ve-solde" height="180"></canvas></div>
      </div>

      <div class="card mb-16">
        <div class="card-title"><i class="ti ti-table"></i> Récapitulatif mensuel</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mois</th>
                <th>CA</th>
                <th>Charges</th>
                <th>Résultat</th>
                <th>Versement</th>
              </tr>
            </thead>
            <tbody id="ve-recap-tbody"></tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><i class="ti ti-trending-up"></i> Projection fin d'année</div>
        <div id="ve-projection"></div>
      </div>
    </section><!-- /vue-ensemble -->


    <!-- ═══════════════════════════
         COMPTES
         ═══════════════════════════ -->
    <section id="section-comptes" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Comptes</h1>
          <div class="page-subtitle">Soldes saisis manuellement</div>
        </div>
        <div class="page-header-right">
          <button class="btn btn-primary" id="btn-new-compte"><i class="ti ti-plus"></i> Ajouter un compte</button>
        </div>
      </div>
      <div class="comptes-grid" id="comptes-grid"></div>
    </section><!-- /comptes -->


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
          <select id="factures-filter-mois" class="form-select" style="width:120px;">
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
          <select id="factures-filter-statut" class="form-select" style="width:140px;">
            <option value="">Tous statuts</option>
            <option value="payee">Payée</option>
            <option value="attente">En attente</option>
            <option value="retard">En retard</option>
          </select>
          <select id="factures-filter-projet" class="form-select" style="width:170px;">
            <option value="">Tous projets</option>
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

      <!-- Tableau -->
      <div class="card mb-16">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Émission</th>
                <th>Paiement</th>
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
         OBJECTIFS CA
         ═══════════════════════════ -->
    <section id="section-objectifs-ca" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Objectifs de CA</h1>
        </div>
        <div class="page-header-right">
          <button class="btn btn-secondary" id="btn-edit-objectif-ca"><i class="ti ti-edit"></i> Modifier l'objectif</button>
        </div>
      </div>

      <div class="kpi-grid kpi-grid-4 mb-24">
        <div class="kpi-card">
          <div class="kpi-icon navy"><i class="ti ti-target"></i></div>
          <span class="kpi-label">Objectif annuel</span>
          <span class="kpi-value" id="objca-kpi-objectif">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="ti ti-trending-up"></i></div>
          <span class="kpi-label">CA YTD atteint</span>
          <span class="kpi-value" id="objca-kpi-atteint">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="ti ti-chart-bar"></i></div>
          <span class="kpi-label">CA mensuel moyen actuel</span>
          <span class="kpi-value green" id="objca-kpi-moyen-actuel">—</span>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon orange"><i class="ti ti-arrow-up"></i></div>
          <span class="kpi-label">Nécessaire / mois restant</span>
          <span class="kpi-value warning" id="objca-kpi-necessaire">—</span>
        </div>
      </div>

      <!-- Grande jauge -->
      <div class="card mb-16" style="text-align:center;padding:32px;">
        <div class="card-title" style="justify-content:center;">Progression YTD</div>
        <div id="objca-gauge-wrap" style="display:flex;flex-direction:column;align-items:center;gap:10px;">
          <div style="font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:500;color:var(--navy);" id="objca-gauge-pct">0%</div>
          <div style="width:100%;max-width:600px;height:12px;background:var(--surface-2);border-radius:6px;overflow:hidden;">
            <div id="objca-gauge-fill" style="height:100%;background:var(--blue);border-radius:6px;transition:width 0.6s ease;width:0%"></div>
          </div>
          <div style="font-size:13px;color:var(--text-2);" id="objca-gauge-label"></div>
        </div>
      </div>

      <div class="card mb-16">
        <div class="card-title"><i class="ti ti-chart-bar"></i> Objectif mensuel (pointillé) vs réel</div>
        <div class="chart-wrap"><canvas id="chart-objca" height="200"></canvas></div>
      </div>

      <div id="objca-alert"></div>
      <div class="card">
        <div class="card-title"><i class="ti ti-trending-up"></i> Projection fin d'année</div>
        <div id="objca-projection"></div>
      </div>
    </section><!-- /objectifs-ca -->


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
          <span class="kpi-label">CA signé total</span>
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
          <p style="margin:4px 0 0;font-size:13px;color:var(--text-2);">Suivi de facturation par projet — acomptes, jalons, mensuel.</p>
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
            <option value="Logiciels & abonnements">Logiciels &amp; abonnements</option>
            <option value="Matériel">Matériel</option>
            <option value="Formation">Formation</option>
            <option value="Communication">Communication</option>
            <option value="Déplacement">Déplacement</option>
            <option value="Comptabilité">Comptabilité</option>
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
         RÉPARTITION
         ═══════════════════════════ -->
    <section id="section-repartition" class="section">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Répartition</h1>
          <div class="page-subtitle">Recommandé : 65% versement · 15% épargne · 20% trésorerie</div>
        </div>
      </div>

      <div class="repartition-grid mb-24">
        <!-- Versement -->
        <div class="rep-card">
          <div class="rep-card-title"><i class="ti ti-cash" style="margin-right:5px;"></i>Versement (65%)</div>
          <div class="rep-recommande">Recommandé : <span id="rep-recomm-versement">—</span></div>
          <div class="rep-actuel-label">Montant réellement alloué</div>
          <input type="number" id="rep-input-versement" class="form-input" placeholder="0.00" step="1" />
          <div class="rep-ecart" id="rep-ecart-versement"></div>
          <div class="progress-bar" style="margin-top:10px;">
            <div class="fill" id="rep-bar-versement" style="width:0%"></div>
          </div>
        </div>
        <!-- Épargne -->
        <div class="rep-card">
          <div class="rep-card-title"><i class="ti ti-piggy-bank" style="margin-right:5px;"></i>Épargne (15%)</div>
          <div class="rep-recommande">Recommandé : <span id="rep-recomm-epargne">—</span></div>
          <div class="rep-actuel-label">Montant réellement alloué</div>
          <input type="number" id="rep-input-epargne" class="form-input" placeholder="0.00" step="1" />
          <div class="rep-ecart" id="rep-ecart-epargne"></div>
          <div class="progress-bar" style="margin-top:10px;">
            <div class="fill green" id="rep-bar-epargne" style="width:0%"></div>
          </div>
        </div>
        <!-- Trésorerie -->
        <div class="rep-card">
          <div class="rep-card-title"><i class="ti ti-wallet" style="margin-right:5px;"></i>Trésorerie tampon (20%)</div>
          <div class="rep-recommande">Recommandé : <span id="rep-recomm-tresorerie">—</span></div>
          <div class="rep-actuel-label">Montant réellement alloué</div>
          <input type="number" id="rep-input-tresorerie" class="form-input" placeholder="0.00" step="1" />
          <div class="rep-ecart" id="rep-ecart-tresorerie"></div>
          <div class="progress-bar" style="margin-top:10px;">
            <div class="fill violet" id="rep-bar-tresorerie" style="width:0%"></div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:24px;">
        <button class="btn btn-primary" id="btn-save-repartition"><i class="ti ti-check"></i> Enregistrer</button>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-donut"></i> Répartition recommandée vs réelle</div>
          <div class="chart-wrap"><canvas id="chart-rep-donut" height="220"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title"><i class="ti ti-chart-bar"></i> Comparaison montants</div>
          <div class="chart-wrap"><canvas id="chart-rep-bar" height="220"></canvas></div>
        </div>
      </div>
    </section><!-- /repartition -->


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
        <label class="form-label">Date d'échéance / paiement</label>
        <input type="date" id="f-date-paiement" class="form-input" />
        <span style="font-size:11px;color:var(--text-2);">Pré-remplie à J+30 · utilisée pour le calcul URSSAF</span>
      </div>
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
        <input type="number" id="pr-nb-mois" class="form-input" min="1" max="60" value="6" oninput="onProjetMontantChange()" />
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
        <input type="date" id="dv-date" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">Date d'expiration</label>
        <input type="date" id="dv-date-expiration" class="form-input" />
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
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input type="date" id="d-date" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">Catégorie</label>
        <select id="d-categorie" class="form-select">
          <option>Logiciels &amp; abonnements</option>
          <option>Matériel</option>
          <option>Formation</option>
          <option>Communication</option>
          <option>Déplacement</option>
          <option>Comptabilité</option>
          <option>Autre</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description *</label>
      <input type="text" id="d-description" class="form-input" placeholder="Achat Adobe CC…" />
    </div>
    <div class="form-group">
      <label class="form-label">Montant (€) *</label>
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

<!-- Modal Objectif CA -->
<div id="modal-objectif-ca" class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <span class="modal-title">Modifier l'objectif CA</span>
      <button class="modal-close" data-close-modal="modal-objectif-ca"><i class="ti ti-x"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Objectif CA annuel (€) *</label>
      <input type="number" id="obj-ca-val" class="form-input" step="500" min="0" placeholder="60000" />
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-close-modal="modal-objectif-ca">Annuler</button>
      <button class="btn btn-primary" id="btn-save-objectif-ca">Enregistrer</button>
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
  comptes:[], objectifs_epargne:[], urssaf:{}, repartition:{}, objectif_ca:{}, tiers:[], projets:[], devis:[]
};

async function loadAll() {
  const [settings, factures, depenses, abonnements, comptes, oe, urssaf, repartition, objCA, tiers, projets, devis] = await Promise.all([
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
  tiers:'/api/tiers', projets:'/api/projets', devis:'/api/devis'
};
const _pathUpdate = id=>({
  factures:\`/api/factures/\${id}\`, abonnements:\`/api/abonnements/\${id}\`,
  comptes:\`/api/comptes/\${id}\`, objectifs_epargne:\`/api/objectifs/epargne/\${id}\`,
  tiers:\`/api/tiers/\${id}\`, projets:\`/api/projets/\${id}\`, devis:\`/api/devis/\${id}\`
});
const _pathDelete = id=>({
  factures:\`/api/factures/\${id}\`, depenses:\`/api/depenses/\${id}\`,
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
  loadSection(section);
}
function loadSection(s){
  const map={
    'dashboard':loadDashboard,'vue-ensemble':loadVueEnsemble,
    'comptes':loadComptes,'transactions':loadTransactions,
    'factures':loadFactures,'devis':loadDevis,'projets':loadProjets,'tiers':loadTiers,'objectifs-ca':loadObjectifsCA,
    'depenses':loadDepenses,'abonnements':loadAbonnements,
    'charges-urssaf':loadChargesURSSAF,'repartition':loadRepartition,
    'objectifs-epargne':loadObjectifsEpargne,'rapport-mensuel':loadRapportMensuel,
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
    'T1':\`\${y}-04-30\`,'T2':\`\${y}-07-31\`,
    'T3':\`\${y}-10-31\`,'T4':\`\${y+1}-01-31\`
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

  // Graphique barres groupées 12 mois
  const caParMois=MOIS_COURT.map((_,mi)=>{
    const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;
    return factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);
  });
  const chParMois=MOIS_COURT.map((_,mi)=>{
    const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;
    const ca=caParMois[mi];
    const dep=depenses.filter(d=>(d.date||'').startsWith(k)).reduce((s,d)=>s+(d.montant||0),0);
    return Math.round(ca*(tauxU+tauxC)*100)/100+pas+dep;
  });
  const netParMois=caParMois.map((ca,i)=>Math.max(0,ca-chParMois[i]));

  const c1=q('#chart-dash-bar');
  if(c1)drawBarChart(c1,MOIS_COURT,[{data:caParMois,color:COLORS.blue},{data:chParMois,color:COLORS.violet}]);
  const leg=q('#chart-dash-bar-legend');
  if(leg)leg.innerHTML=\`<div class="chart-legend-item"><div class="chart-legend-dot" style="background:\${COLORS.blue}"></div>CA</div><div class="chart-legend-item"><div class="chart-legend-dot" style="background:\${COLORS.violet}"></div>Charges</div>\`;
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

/* --- Vue d'ensemble --------------------------------------------------- */
function loadVueEnsemble(){
  const factures =dbGet('factures');
  const settings =dbGetObj('settings');
  const y=new Date().getFullYear();
  const moisActuels=new Date().getMonth()+1;
  const tauxU=(settings.tauxUrssaf||25.6)/100,tauxC=(settings.tauxCfp||0.2)/100;

  const caParMois=MOIS_COURT.map((_,mi)=>{
    const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;
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
      return\`<tr><td>\${mLabel}</td><td class="td-amount">\${ca?fmt(ca):'—'}</td><td class="td-amount">\${ca?fmt(charges):'—'}</td><td class="td-amount">\${ca?fmt(net):'—'}</td><td class="td-amount">\${ca?fmt(vers):'—'}</td></tr>\`;
    }).join('');
  }

  const caYTD=caParMois.slice(0,moisActuels).reduce((a,b)=>a+b,0);
  const moyenne=moisActuels>0?caYTD/moisActuels:0;
  const projection=moyenne*12;
  const vp=q('#ve-projection');
  if(vp)vp.innerHTML=\`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">CA YTD</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">\${fmt(caYTD)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Moyenne mensuelle</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">\${fmt(moyenne)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);margin-bottom:4px;">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:24px;color:var(--navy);">\${fmt(projection)}</div></div>
    </div>\`;
}

/* --- Comptes ---------------------------------------------------------- */
function loadComptes(){
  renderComptes();
}
function renderComptes(){
  const comptes=dbGet('comptes');
  const g=q('#comptes-grid');
  if(!g)return;
  g.innerHTML=comptes.length?comptes.map(c=>\`
    <div class="compte-card">
      <div class="compte-card-header">
        <span class="compte-nom">\${c.nom}</span>
        <span class="badge badge-neutral">\${c.type}</span>
      </div>
      <div class="compte-solde">\${fmt(c.solde||0)}</div>
      <div class="compte-upd">\${c.updatedAt?'Mis à jour '+fmtDate(c.updatedAt.slice(0,10)):''}</div>
      <div class="compte-historique">\${(c.historique||[]).slice(-5).reverse().map(h=>\`<div class="compte-historique-item"><span>\${fmtDate(h.date)} \${h.libelle||''}</span><span>\${fmt(h.montant||0)}</span></div>\`).join('')}</div>
      <div class="compte-actions">
        <button class="btn btn-secondary btn-sm" onclick="openCompteUpdateModal('\${c.id}')"><i class="ti ti-refresh"></i> Mettre à jour</button>
        <button class="btn btn-ghost btn-sm" onclick="openCompteModal('\${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-sm" onclick="deleteCompte('\${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>\`).join(''):'<p style="color:var(--text-2);">Aucun compte</p>';
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
  const annee=q('#factures-filter-annee')?.value||'';
  const mois=q('#factures-filter-mois')?.value||'';
  let list=[...facturesData];
  if(search)list=list.filter(f=>((f.numero||'')+(f.client||'')+(f.description||'')+(f.projet||'')).toLowerCase().includes(search));
  if(statut)list=list.filter(f=>f.statut===statut);
  if(projet)list=list.filter(f=>(f.projet||'')=== projet);
  if(annee)list=list.filter(f=>(f.date||'').startsWith(annee));
  if(mois)list=list.filter(f=>(f.date||'').slice(5,7)===mois);
  list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  // Mise à jour filtre années
  const selAnnee=q('#factures-filter-annee');
  if(selAnnee){
    const annees=[...new Set(facturesData.map(f=>(f.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
    const curA=selAnnee.value;
    selAnnee.innerHTML=\`<option value="">Toutes années</option>\`+annees.map(a=>\`<option value="\${a}" \${a===curA?'selected':''}>\${a}</option>\`).join('');
  }
  // Mise à jour filtre projets
  const selProjet=q('#factures-filter-projet');
  if(selProjet){
    const projets=[...new Set(facturesData.map(f=>f.projet).filter(Boolean))].sort();
    const cur=selProjet.value;
    selProjet.innerHTML=\`<option value="">Tous projets</option>\`+projets.map(p=>\`<option value="\${p}" \${p===cur?'selected':''}>\${p}</option>\`).join('');
  }
  const tbody=q('#factures-tbody');
  if(!tbody)return;
  tbody.innerHTML=list.length?list.map(f=>{
    const proj=f.projetId?dbGet('projets').find(x=>x.id===f.projetId):null;
    const dv=proj?.devisId?dbGet('devis').find(x=>x.id===proj.devisId):null;
    const projetCell=proj?proj.nom:(f.description||'<span style="color:var(--text-2);">—</span>');
    const devisCell=dv
      ?\`<button class="btn btn-ghost btn-xs" style="color:#4CAF82;font-weight:600;gap:4px;" title="Voir le devis \${dv.numero}" onclick="navigate('devis');setTimeout(()=>highlightDevis('\${dv.id}'),300)"><i class="ti ti-file-description"></i> \${dv.numero}</button>\`
      :'<span style="color:var(--text-2);font-size:12px;">—</span>';
    return\`<tr>
      <td>\${fmtDate(f.date)}</td>
      <td>\${f.datePaiement?fmtDate(f.datePaiement):'<span style="color:var(--text-2);">—</span>'}</td>
      <td class="td-mono">\${f.numero||'—'}</td>
      <td>\${f.client||'—'}</td>
      <td class="td-muted">\${projetCell}</td>
      <td>\${devisCell}</td>
      <td class="td-amount">\${fmt(f.montant||0)}</td>
      <td><span class="badge badge-\${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}">\${f.statut==='payee'?'Payée':f.statut==='retard'?'En retard':'En attente'}</span></td>
      <td style="white-space:nowrap;">
        \${f.pdfKey?\`<button class="btn btn-sm" style="background:#e8f0fe;color:#3b6dd4;border:1px solid #bad1fd;gap:4px;" title="Voir PDF" onclick="previewPDF('\${f.id}','\${f.numero}')"><i class="ti ti-file-filled"></i> PDF</button>\`:\`<span style="font-size:11px;color:var(--text-2);padding:2px 6px;">—</span>\`}
        <button class="btn btn-ghost btn-xs" onclick="editFacture('\${f.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-ghost btn-xs" onclick="deleteFacture('\${f.id}')"><i class="ti ti-trash"></i></button>
      </td>
    </tr>\`;
  }).join(''):'<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-2);">Aucune facture</td></tr>';
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
  q('#f-date-paiement').value=data.datePaiement||'';
  if(!data.id&&!data.datePaiement)onFactureDateChange();
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
function onFactureDateChange(){
  const dateVal=q('#f-date')?.value;
  const paiementEl=q('#f-date-paiement');
  if(dateVal&&paiementEl&&!paiementEl.value){
    const d=new Date(dateVal+'T00:00:00');
    d.setDate(d.getDate()+30);
    paiementEl.value=d.toISOString().slice(0,10);
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
  lines.push(\`📁 \${projet.nom} · \${typeLabel[projet.type]||projet.type}\${projet.type==='mensuel'?' · '+projet.nombreMois+' mois':''}\`);
  lines.push(\`Facturé : \${fmt(montantFacture)} / \${fmt(projet.montantTotal||0)} · <strong style="color:\${reste>0?'#E8A838':'#4CAF82'};">\${reste>0?'Reste : '+fmt(reste):'✓ Complet'}</strong>\`);
  // Suggest type & montant
  let sugType='standard',sugMontant=null,sugNote='';
  if(projet.type==='mensuel'&&projet.nombreMois){
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
    date:q('#f-date').value,datePaiement:q('#f-date-paiement').value||null,
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
function loadDevis(){
  const devisData=dbGet('devis');
  const signes=devisData.filter(d=>d.statut==='signe');
  const envoyes=devisData.filter(d=>d.statut==='envoye');
  const total=devisData.filter(d=>d.statut!=='refuse').length;
  const taux=total>0?Math.round(signes.length/total*100):0;
  const caSign=signes.reduce((s,d)=>s+(d.montant||0),0);
  if(q('#dv-kpi-signes'))q('#dv-kpi-signes').textContent=signes.length;
  if(q('#dv-kpi-envoyes'))q('#dv-kpi-envoyes').textContent=envoyes.length;
  if(q('#dv-kpi-ca'))q('#dv-kpi-ca').textContent=fmt(caSign);
  if(q('#dv-kpi-taux'))q('#dv-kpi-taux').textContent=taux+'%';
  renderDevis();
}
function renderDevis(){
  const search=q('#devis-search')?.value.toLowerCase()||'';
  const statut=q('#devis-filter-statut')?.value||'';
  const annee=q('#devis-filter-annee')?.value||'';
  const mois=q('#devis-filter-mois')?.value||'';
  let list=[...dbGet('devis')];
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
      <td>\${d.dateExpiration?fmtDate(d.dateExpiration)+(expire?' <span style="color:var(--danger);font-size:11px;">expiré</span>':''):'<span style="color:var(--text-2);">—</span>'}</td>
      <td><span class="badge badge-\${sttBadge[d.statut]||'attente'}">\${sttLabel[d.statut]||d.statut}</span></td>
      <td style="white-space:nowrap;">
        \${d.pdfKey?\`<button class="btn btn-sm" style="background:#e8f0fe;color:#3b6dd4;border:1px solid #bad1fd;gap:4px;" title="Voir PDF" onclick="previewDevisPDF('\${d.id}','\${d.numero}')"><i class="ti ti-file-filled"></i> PDF</button>\`:\`<span style="font-size:11px;color:var(--text-2);padding:2px 6px;">—</span>\`}
        \${d.statut==='signe'?\`<button class="btn btn-sm" style="background:#e8f5ee;color:#4CAF82;border:1px solid #4CAF82;" title="Créer un projet depuis ce devis" onclick="creerProjetDepuisDevis('\${d.id}')"><i class="ti ti-folder-plus"></i></button>\`:''}
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
function renderProjets(){
  const search=q('#projets-search')?.value.toLowerCase()||'';
  const statut=q('#projets-filter-statut')?.value||'';
  const client=q('#projets-filter-client')?.value||'';
  const annee=q('#projets-filter-annee')?.value||'';
  const mois=q('#projets-filter-mois')?.value||'';
  const factures=dbGet('factures');
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
  const statIcon={payee:'✅',attente:'⏳',retard:'🔴'};
  function facRow(f,extra=''){
    const badge=f.typeFacture&&f.typeFacture!=='standard'?\`<span style="font-size:10px;background:#E8E8E4;padding:1px 5px;border-radius:4px;margin-left:4px;">\${typeFacLabel[f.typeFacture]||f.typeFacture}</span>\`:'';
    return\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #E8E8E4;">
      <span>\${statIcon[f.statut]||'⏳'}</span>
      <span style="font-size:12px;color:#6B6B6B;min-width:80px;">\${fmtDate(f.date)}</span>
      <span style="font-size:12px;flex:1;">\${f.numero||'—'}\${badge}</span>
      <span style="font-size:12px;font-weight:500;">\${fmt(f.montant||0)}</span>
      <span class="badge badge-\${f.statut==='payee'?'payee':f.statut==='retard'?'retard':'attente'}" style="font-size:10px;">\${f.statut==='payee'?'Payée':f.statut==='retard'?'Retard':'Attente'}</span>
      \${extra}
    </div>\`;
  }
  function emptyRow(label,montant){
    return\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #E8E8E4;opacity:0.6;">
      <span>📋</span>
      <span style="font-size:12px;color:#6B6B6B;min-width:80px;">\${label}</span>
      <span style="font-size:12px;flex:1;font-style:italic;">À émettre</span>
      \${montant?'<span style="font-size:12px;font-weight:500;">'+fmt(montant)+'</span>':''}
      <span></span>
    </div>\`;
  }
  container.innerHTML=list.map(p=>{
    const linked=factures.filter(f=>f.projetId===p.id);
    const montantFacture=linked.reduce((s,f)=>s+(f.montant||0),0);
    const pct=p.montantTotal>0?Math.min(100,Math.round(montantFacture/p.montantTotal*100)):0;
    const reste=Math.max(0,(p.montantTotal||0)-montantFacture);
    let facsHtml='';
    if(p.type==='mensuel'&&p.nombreMois){
      const montantMensuel=(p.montantTotal||0)/p.nombreMois;
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      const restantMois=Math.max(0,p.nombreMois-sorted.length);
      for(let i=0;i<restantMois;i++){
        let dateLabel='—';
        if(p.dateDebut){
          const base=new Date(p.dateDebut+'T00:00:00');
          base.setMonth(base.getMonth()+sorted.length+i);
          dateLabel=MOIS_COURT[base.getMonth()]+' '+base.getFullYear();
        }
        facsHtml+=emptyRow(dateLabel,montantMensuel);
      }
    }else if(p.type==='echelonne'){
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      const hasAcompte=linked.some(f=>f.typeFacture==='acompte');
      const hasSolde=linked.some(f=>f.typeFacture==='solde');
      if(!hasAcompte)facsHtml+=\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #E8E8E4;opacity:0.6;"><span>📋</span><span style="font-size:10px;background:#E8E8E4;padding:1px 5px;border-radius:4px;">Acompte</span><span style="font-size:12px;flex:1;font-style:italic;">À émettre</span><span></span></div>\`;
      if(!hasSolde)facsHtml+=\`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #E8E8E4;opacity:0.6;"><span>📋</span><span style="font-size:10px;background:#E8E8E4;padding:1px 5px;border-radius:4px;">Solde</span><span style="font-size:12px;flex:1;font-style:italic;">À émettre</span><span></span></div>\`;
    }else{
      const sorted=linked.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
      facsHtml=sorted.map(f=>facRow(f)).join('');
      if(!sorted.length)facsHtml=emptyRow('—',p.montantTotal);
    }
    return\`<div class="card mb-16" style="padding:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #E8E8E4;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="kpi-icon blue" style="width:36px;height:36px;font-size:16px;flex-shrink:0;"><i class="ti \${typeIcon[p.type]||'ti-folder'}"></i></div>
          <div>
            <div style="font-weight:600;font-size:15px;">\${p.nom}</div>
            <div style="font-size:12px;color:#6B6B6B;">\${p.client||'—'} · \${typeLabel[p.type]||p.type}\${p.type==='mensuel'?' · '+p.nombreMois+' mois':''}\${p.devisId?(' · <span style="color:#4CAF82;">📄 '+((dbGet(\'devis\').find(x=>x.id===p.devisId))||{}).numero+'</span>'):''}
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
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#6B6B6B;margin-bottom:6px;">
          <span>\${fmt(montantFacture)} facturé</span>
          <span style="font-weight:500;">\${fmt(p.montantTotal||0)} total · <span style="color:\${reste>0?'var(--warning)':'var(--success)'};">\${reste>0?fmt(reste)+' restant':'✓ Complet'}</span></span>
        </div>
        <div style="background:#E8E8E4;border-radius:4px;height:8px;overflow:hidden;margin-bottom:\${facsHtml?16:4}px;">
          <div style="background:\${pct>=100?'var(--success)':'#BAD1FD'};height:100%;width:\${pct}%;border-radius:4px;"></div>
        </div>
        \${facsHtml?'<div>'+facsHtml+'</div>':''}
        \${p.notes?'<div style="margin-top:10px;font-size:12px;color:#6B6B6B;font-style:italic;">'+p.notes+'</div>':''}
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
  onProjetMontantChange();
}
function onProjetMontantChange(){
  const type=q('#pr-type')?.value;
  const montant=parseFloat(q('#pr-montant')?.value)||0;
  const nbMois=parseInt(q('#pr-nb-mois')?.value)||1;
  const moisEl=q('#pr-montant-mois');
  if(moisEl)moisEl.value=type==='mensuel'&&montant&&nbMois?fmt(montant/nbMois)+'/mois':'—';
  // Auto-calcul date de fin pour projet mensuel
  if(type==='mensuel'){
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
  const body={nom:q('#pr-nom').value.trim(),client:q('#pr-client').value,type,statut:q('#pr-statut').value,
    montantTotal:parseFloat(q('#pr-montant').value)||0,
    nombreMois:type==='mensuel'?parseInt(q('#pr-nb-mois').value)||1:null,
    devisId:q('#pr-devis-id').value||null,
    dateDebut:q('#pr-date-debut').value||null,dateFin:q('#pr-date-fin').value||null,
    notes:q('#pr-notes').value.trim()};
  if(!body.nom){toast('Nom du projet requis','error');return;}
  if(!body.montantTotal){toast('Montant requis','error');return;}
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
  if(q('#objca-gauge-pct'))q('#objca-gauge-pct').textContent=\`\${pct}%\`;
  if(q('#objca-gauge-fill')){q('#objca-gauge-fill').style.width=\`\${pct}%\`;q('#objca-gauge-fill').style.background=pct>=100?COLORS.success:pct>=80?COLORS.warning:COLORS.blue;}
  if(q('#objca-gauge-label'))q('#objca-gauge-label').textContent=\`\${fmt(atteint)} sur \${fmt(objectif)}\`;

  const al=q('#objca-alert');
  if(al)al.innerHTML=projFin<objectif?\`<div class="alert warning"><i class="ti ti-alert-triangle"></i> Projection fin d'année : \${fmt(projFin)} — en dessous de l'objectif de \${fmt(objectif)}</div>\`:'';

  const pr=q('#objca-projection');
  if(pr)pr.innerHTML=\`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Projection fin d'année</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">\${fmt(projFin)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Objectif</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--navy);">\${fmt(objectif)}</div></div>
      <div><div style="font-size:11px;text-transform:uppercase;color:var(--text-2);">Écart projeté</div><div style="font-family:'Cormorant Garamond',serif;font-size:26px;color:\${projFin>=objectif?'var(--success)':'var(--danger)'};">\${fmt(projFin-objectif)}</div></div>
    </div>\`;

  const caMois=MOIS_COURT.map((_,mi)=>{const k=\`\${y}-\${String(mi+1).padStart(2,'0')}\`;return factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((s,f)=>s+(f.montant||0),0);});
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

  // Calcul CA par trimestre
  const moisQ={T1:[1,2,3],T2:[4,5,6],T3:[7,8,9],T4:[10,11,12]};
  const echeances={T1:\`\${y}-04-30\`,T2:\`\${y}-07-31\`,T3:\`\${y}-10-31\`,T4:\`\${y+1}-01-31\`};
  const labelsQ={T1:'T1 (jan–mar)',T2:'T2 (avr–jun)',T3:'T3 (jul–sep)',T4:'T4 (oct–déc)'};
  const quarters=['T1','T2','T3','T4'];
  const grid=q('#urssaf-cards-grid');
  if(grid){
    grid.innerHTML=quarters.map(t=>{
      const cle=\`\${t}-\${y}\`;
      const d=urssafObj[cle]||{};
      const moisTrim=moisQ[t];
      const caT=moisTrim.reduce((s,mi)=>{
        const k=\`\${y}-\${String(mi).padStart(2,'0')}\`;
        return s+factures.filter(f=>f.statut==='payee'&&(f.date||'').startsWith(k)).reduce((ss,f)=>ss+(f.montant||0),0);
      },0);
      const urssafDue=Math.round(caT*tauxU*100)/100;
      const cfpDue   =Math.round(caT*tauxC*100)/100;
      const total    =urssafDue+cfpDue;
      const ech=echeances[t];
      const jours=Math.ceil((new Date(ech)-now)/86400000);
      const statut=d.statut==='paye'?'paye':jours<0?'a_payer':'a_venir';
      const pct=total>0?Math.min(100,Math.round((d.montantPaye||0)/total*100)):0;
      const countdown=statut==='paye'?\`<span style="color:var(--success);">Payé le \${fmtDate(d.datePaye)} — \${fmt(d.montantPaye||0)}</span>\`:jours<=0?\`<span class="urssaf-countdown rouge">Échu</span>\`:\`<span class="urssaf-countdown \${jours<=30?'rouge':jours<=60?'orange':''}">\${jours} jours restants</span>\`;
      return\`<div class="urssaf-card \${jours<=30&&statut!=='paye'?'alerte-rouge':jours<=60&&statut!=='paye'?'alerte-orange':''}">
        <div class="urssaf-header">
          <div><div class="urssaf-titre">\${labelsQ[t]}</div><div class="urssaf-echeance">Échéance \${fmtDate(ech)}</div></div>
          <span class="badge badge-\${statut==='paye'?'paye':statut==='a_payer'?'a-payer':'a-venir'}">\${statut==='paye'?'Payé':statut==='a_payer'?'À payer':'À venir'}</span>
        </div>
        <div class="urssaf-montant">\${fmt(total)}</div>
        <div class="urssaf-detail">CA \${fmt(caT)} · URSSAF \${fmt(urssafDue)} · CFP \${fmt(cfpDue)}</div>
        \${countdown}
        <div class="progress-bar" style="margin:8px 0;"><div class="fill \${pct>=100?'green':''}" style="width:\${pct}%"></div></div>
        \${statut!=='paye'?\`<button class="btn btn-sm btn-secondary" style="margin-top:8px;" onclick="openURSSAFPaiement('\${cle}')"><i class="ti ti-check"></i> Marquer payé</button>\`:''}
      </div>\`;
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

/* --- Répartition ------------------------------------------------------ */
function loadRepartition(){
  const settings   =dbGetObj('settings');
  const factures   =dbGet('factures');
  const repartition=dbGetObj('repartition');
  const y=new Date().getFullYear(),m=new Date().getMonth()+1;
  const mKey=\`\${y}-\${String(m).padStart(2,'0')}\`;
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
  const setEcart=(el,reel,recomm)=>{if(!el)return;const e=reel-recomm;el.innerHTML=e>=0?\`<span class="ok">+\${fmt(e)} vs recommandé</span>\`:\`<span class="ko">\${fmt(e)} vs recommandé</span>\`;};
  setEcart(q('#rep-ecart-versement'),rv,recommV);
  setEcart(q('#rep-ecart-epargne'),re,recommE);
  setEcart(q('#rep-ecart-tresorerie'),rt,recommT);
  if(q('#rep-bar-versement'))q('#rep-bar-versement').style.width=\`\${recommV>0?Math.min(100,Math.round(rv/recommV*100)):0}%\`;
  if(q('#rep-bar-epargne'))q('#rep-bar-epargne').style.width=\`\${recommE>0?Math.min(100,Math.round(re/recommE*100)):0}%\`;
  if(q('#rep-bar-tresorerie'))q('#rep-bar-tresorerie').style.width=\`\${recommT>0?Math.min(100,Math.round(rt/recommT*100)):0}%\`;
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
    const lines=e.target.result.split('\\n').filter(l=>l.trim());
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
  if(alEl)alEl.innerHTML=total===100?\`<span style="color:var(--success);">✓ Total : 100%</span>\`:\`<span style="color:var(--danger);">Total : \${total}% (doit être égal à 100%)</span>\`;
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
  q('#factures-filter-annee')?.addEventListener('change',renderFactures);
  q('#factures-filter-mois')?.addEventListener('change',renderFactures);
  q('#factures-filter-statut')?.addEventListener('change',renderFactures);
  q('#factures-filter-projet')?.addEventListener('change',renderFactures);
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
    if (path === '/style.css') return new Response(CSS,  { headers: { 'Content-Type': 'text/css; charset=utf-8',         'Cache-Control': 'public, max-age=3600' } });
    if (path === '/app.js')    return new Response(JS,   { headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
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
