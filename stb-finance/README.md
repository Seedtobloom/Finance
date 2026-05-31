# STB Finance

Application de gestion financière freelance (BNC, micro-entreprise).  
Stack : Cloudflare Workers + KV + R2.

---

## Prérequis

- Compte [Cloudflare](https://dash.cloudflare.com) (gratuit)
- [Node.js](https://nodejs.org) ≥ 18
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) : `npm install -g wrangler`

---

## Installation

### 1. Créer un compte Cloudflare

Connectez-vous sur [dash.cloudflare.com](https://dash.cloudflare.com) et relevez votre **Account ID** (visible dans la barre latérale droite).

### 2. Créer les namespaces KV

Dans **Workers & Pages → KV**, créez les 3 namespaces suivants et notez leurs IDs :

| Nom           | Variable dans wrangler.toml |
|---------------|-----------------------------|
| `STB_AUTH`    | `KV_AUTH`                   |
| `STB_DATA`    | `KV_DATA`                   |

```bash
wrangler kv namespace create STB_AUTH
wrangler kv namespace create STB_DATA
```

### 3. Créer le bucket R2

Dans **R2 → Créer un bucket**, nommez-le `stb-finance-pdfs`.

```bash
wrangler r2 bucket create stb-finance-pdfs
```

### 4. Remplir les IDs dans wrangler.toml

Ouvrez `wrangler.toml` et remplacez les placeholders en MAJUSCULES :

```toml
account_id = "VOTRE_ACCOUNT_ID"

# Worker API
[[kv_namespaces]]
binding = "KV_AUTH"
id = "ID_KV_AUTH"

[[kv_namespaces]]
binding = "KV_DATA"
id = "ID_KV_DATA"

[[r2_buckets]]
binding = "R2_FINANCE"
bucket_name = "stb-finance-pdfs"
```

### 5. Configurer les secrets

Ces valeurs ne doivent **jamais** apparaître dans le code :

```bash
# Secret JWT (chaîne aléatoire longue, ex. openssl rand -hex 32)
wrangler secret put JWT_SECRET --name stb-finance-api

# Mot de passe admin
wrangler secret put ADMIN_PASSWORD --name stb-finance-api
```

### 6. Déployer

```bash
cd stb-finance
wrangler deploy
```

Les deux workers seront déployés : `stb-finance-api` et `stb-finance-front`.

### 7. Configurer le DNS

Dans Cloudflare Dashboard → **DNS** de votre domaine, ajoutez un enregistrement CNAME :

| Type  | Nom       | Cible                                              |
|-------|-----------|---------------------------------------------------|
| CNAME | `finance` | `stb-finance-front.<votre-sous-domaine>.workers.dev` |

Activez le proxy Cloudflare (icône orange).

### 8. Accéder à l'application

Ouvrez `https://finance.seedtobloom.fr` et connectez-vous avec le mot de passe défini à l'étape 5.

---

## Structure du projet

```
stb-finance/
├── wrangler.toml          # Configuration Cloudflare Workers
├── back/
│   └── worker.js          # API REST (auth, CRUD, URSSAF, rapports, import/export)
└── front/
    ├── worker.js          # Serveur de fichiers statiques
    ├── index.html         # Shell SPA (16 sections)
    ├── app.js             # Logique JavaScript complète
    └── style.css          # Design system (thème clair, Linear/Notion inspired)
```

## Données métier

- **Régime** : micro-BNC
- **Plafond** : 77 700 €/an
- **URSSAF** : 25,6 % (modifiable dans Options)
- **CFP** : 0,2 % (modifiable dans Options)
- **PAS** : 40 €/mois fixe (modifiable dans Options)
- **URSSAF trimestrielle** : T1 → 30 avril, T2 → 31 juillet, T3 → 31 octobre, T4 → 31 janvier

## PDFs

Les PDFs de factures sont fournis manuellement depuis Indy.  
Aucune génération PDF n'est effectuée par l'application.  
Les fichiers sont stockés dans R2 sous la clé `{userId}/factures/pdf/{numero}.pdf`.
