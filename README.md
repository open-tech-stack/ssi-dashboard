<div align="center">

# 🏛️ SSI Dashboard

**Panneau d'administration — SIM SOMGANDE Information**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

Plateforme web d'administration pour la gestion des programmes, événements,
informations et utilisateurs de l'église SIM SOMGANDE.

[🌐 Production](https://ssi-dashboard.vercel.app) · [📘 API Docs](https://ssi-backend-two.vercel.app/docs) · [📱 Mobile App](#-écosystème)

</div>

---

## 📖 Sommaire

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture](#️-architecture)
- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🔧 Configuration](#-configuration)
- [📁 Structure du projet](#-structure-du-projet)
- [🔐 Authentification](#-authentification)
- [🎨 Thèmes](#-thèmes)
- [📦 Modules disponibles](#-modules-disponibles)
- [🌐 Déploiement](#-déploiement)
- [🧪 Scripts disponibles](#-scripts-disponibles)
- [📱 Écosystème](#-écosystème)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 🎯 Modules de gestion
- **📅 Programmes** — Cultes du dimanche et prières du vendredi, avec sections ordonnées (accueil, louange, prédication, etc.)
- **🎉 Événements** — Mariages, camps, sorties, conférences, formations avec champs adaptés à chaque type
- **📢 Infos** — Canal libre pour les annonces et communications
- **🙏 Prières** — Sujets de prière et veillées
- **🔔 Rappels** — Listes d'éléments à retenir
- **👥 Personnes** — Répertoire des membres, intervenants et invités
- **🎵 Groupes** — Groupes assignables aux sections de programme
- **👤 Utilisateurs** — Gestion des comptes admin et membres (génération de codes d'accès)
- **📬 Notifications** — Système de notifications push pour le mobile

### 🎨 Expérience utilisateur
- **4 thèmes** commutable (Nuit bleue, Orange feu, Clair, Bleu océan)
- **Design responsive** — Mobile, tablette, desktop
- **Toast système** — 6 positions, 4 variantes (succès, erreur, warning, info)
- **Confirm modal** — Actions destructives avec input de sécurité
- **Soft delete / Restore** — Corbeille pour tous les modules
- **Bulk actions** — Sélection multiple sur les notifications
- **Recherche & filtres** — Par type, statut, priorité, date
- **Animations** — Transitions fluides, feedback immédiat

### 🔒 Sécurité
- **Cookies httpOnly** — Les tokens ne sont jamais exposés au JS
- **Refresh silencieux** — Renouvellement automatique des tokens
- **Refresh token isolé** — Cookie limité à `Path=/api/auth`
- **Codes masqués** — Visibles uniquement sur action admin
- **Exclusion du compte connecté** — Impossible de se modifier soi-même
- **Confirm renforcé** — Sur changement de rôle, suppression définitive

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│ NAVIGATEUR │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Next.js 16 (App Router) │ │
│ │ ┌─────────────────┐ ┌───────────────────────────┐ │ │
│ │ │ Server Comps │ │ Client Components │ │ │
│ │ │ (proxy.ts) │ │ (React 19 + hooks) │ │ │
│ │ └─────────────────┘ └───────────────────────────┘ │ │
│ │ │ │ │ │
│ │ ▼ ▼ │ │
│ │ ┌─────────────────┐ ┌───────────────────────────┐ │ │
│ │ │ Edge Proxy │ │ Axios + interceptors │ │ │
│ │ │ (auth guard) │ │ (refresh, X-Client) │ │ │
│ │ └─────────────────┘ └───────────────────────────┘ │ │
│ └───────────────────────────────────────────────────────┘ │
│ │ │
│ ▼ │
│ /api/* (rewrite Vercel) │
└──────────────────────────────┬──────────────────────────────┘
│
▼
┌────────────────────────────────┐
│ Backend NestJS (Vercel) │
│ https://ssi-backend-two... │
│ │
│ - Auth (JWT + refresh) │
│ - 9 modules CRUD │
│ - Push notifications (Expo) │
│ - PostgreSQL (Prisma) │
└────────────────────────────────┘

### Stack technique

| Couche | Technologie |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Langage** | TypeScript 5 (strict) |
| **UI** | React 19, Tailwind CSS 4 |
| **Icônes** | Lucide React |
| **HTTP** | Axios (interceptors + refresh auto) |
| **State** | React Context (Auth, Theme, Toast, Confirm) |
| **Cache** | Aucun (Server Components + fetch direct) |
| **Auth** | Cookies httpOnly (web) · Bearer (mobile) |
| **Déploiement** | Vercel (Edge + Serverless) |

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10 (ou `pnpm`, `yarn`, `bun`)
- **Backend SSI** accessible (dev local ou prod)

### Installation

```bash
# 1. Clone le projet
git clone https://github.com/<ton-compte>/ssi-dashboard.git
cd ssi-dashboard

# 2. Installe les dépendances
npm install

# 3. Configure l'environnement
cp .env.example .env.local
# Édite .env.local avec tes valeurs (voir section Configuration)

# 4. Lance le serveur de développement
npm run dev

L'application est accessible sur http://localhost:3000.

### Configuration

Variables d'environnement
Crée un fichier .env.local à la racine du projet :

# ==========================================
# API — développement local
# ==========================================
NEXT_PUBLIC_API_URL=http://localhost:5000/api
BACKEND_URL=http://localhost:5000


ssi-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Page de connexion
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout dashboard (sidebar + header)
│   │   ├── dashboard/page.tsx    # Tableau de bord
│   │   ├── programmes/page.tsx   # Gestion des programmes
│   │   ├── evenements/page.tsx   # Gestion des événements
│   │   ├── infos/page.tsx        # Gestion des infos
│   │   ├── prieres/page.tsx      # Gestion des prières
│   │   ├── rappels/page.tsx      # Gestion des rappels
│   │   ├── people/page.tsx       # Gestion des personnes
│   │   ├── groups/page.tsx       # Gestion des groupes
│   │   ├── users/page.tsx        # Gestion des utilisateurs
│   │   └── notifications/page.tsx # Notifications
│   ├── globals.css               # Styles Tailwind + keyframes
│   ├── layout.tsx                # Layout racine
│   └── page.tsx                  # Redirect racine
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Header global
│   │   └── Sidebar.tsx           # Navigation latérale
│   ├── providers/
│   │   ├── AppProviders.tsx      # Wrapper des providers
│   │   └── ThemeProvider.tsx     # Gestion des 4 thèmes
│   ├── ui/
│   │   ├── AnimatedBackground.tsx # Fond animé login
│   │   ├── ConfirmDialog.tsx     # Modal de confirmation
│   │   ├── DataTable.tsx         # Tableau générique
│   │   ├── Toast.tsx             # Système de toasts
│   │   └── ...
│   ├── programmes/               # Composants spécifiques programmes
│   ├── evenements/               # Composants spécifiques événements
│   ├── infos/                    # ...
│   ├── users/                    # ...
│   └── notifications/            # ...
│
├── config/
│   ├── env.ts                    # Variables d'environnement
│   └── themes.ts                 # Définition des 4 thèmes
│
├── contexts/
│   └── AuthContext.tsx           # Contexte d'authentification
│
├── endpoints/                    # URLs des endpoints API
├── hooks/
│   ├── useConfirm.tsx            # Hook de confirmation
│   └── useUnreadCount.ts         # Compteur notifs non lues
│
├── lib/
│   └── jwt.ts                    # Décodage JWT (Edge compatible)
│
├── services/
│   ├── auth/                     # Service auth
│   ├── core/
│   │   ├── cookies.service.ts    # Gestion cookies (user uniquement)
│   │   └── http.service.ts       # Client Axios + refresh auto
│   ├── programmes/               # ...
│   ├── evenements/               # ...
│   └── ...
│
├── types/                        # Types TypeScript
├── proxy.ts                      # Middleware Edge (auth guard)
├── next.config.ts                # Config Next.js (rewrites)
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── package.json

┌─────────────┐                                ┌─────────────┐
│ Utilisateur │                                │  Next.js    │
└──────┬──────┘                                └──────┬──────┘
       │                                              │
       │  1. POST /auth/login { code }                │
       │  + X-Client: web                             │
       ├─────────────────────────────────────────────▶
       │                                              │
       │                                              │  Proxy → Backend
       │                                              │
       │  2. Set-Cookie: ssi.accessToken (httpOnly)   │
       │     Set-Cookie: ssi.refreshToken (httpOnly)  │
       │     Set-Cookie: ssi.user                     │
       │◀─────────────────────────────────────────────┤
       │                                              │
       │  3. Redirect /dashboard                      │
       │◀─────────────────────────────────────────────┤
       │                                              │
       │  4. GET /api/programmes (cookies auto)       │
       ├─────────────────────────────────────────────▶
       │                                              │
       │  5. 200 { items }                            │
       │◀─────────────────────────────────────────────┤
       │                                              │
       # 1. Install Vercel CLI (une fois)
npm i -g vercel

# 2. Déploie
vercel --prod

npm run dev      # Dev server (http://localhost:3000)
npm run build    # Build production
npm run start    # Lance le build production
npm run lint     # ESLint

feat(programmes): ajout du filtre par statut
fix(auth): corrige le refresh silencieux
docs(readme): mise à jour de la section thèmes
chore(deps): bump next à 16.4

### Stack technique

| Couche | Technologie |
|---|---|
| **Runtime** | Expo SDK 57 |
| **Framework** | React Native 0.86 + Expo Router |
| **Langage** | TypeScript 5 (strict) |
| **UI** | React 19, composants custom |
| **Icônes** | Lucide React Native |
| **HTTP** | Axios (Bearer + refresh auto) |
| **State serveur** | React Query v5 + persister |
| **State global** | React Context (Auth, Theme, ...) |
| **Stockage** | AsyncStorage + `expo-secure-store` (tokens) |
| **Notifications** | Expo Notifications (FCM / APNs) |
| **Build** | EAS Build |
| **Updates** | EAS Update (OTA) |

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **npm** ≥ 10
- **Expo Go** OU **Dev Client** installé sur ton téléphone
- Un compte **Expo** (pour EAS Build)
- **Backend SSI** accessible

### Installation

```bash
# 1. Clone le projet
git clone https://github.com/<ton-compte>/sim-somgande.git
cd sim-somgande

# 2. Installe les dépendances
npm install

# 3. Configure l'environnement
cp .env.example .env
# Édite .env avec tes valeurs

# 4. Lance l'app en dev
npx expo start --dev-client
# OU pour un test rapide sans dev build :
npx expo start