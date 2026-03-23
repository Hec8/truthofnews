# 🇧🇯 Blog Tonton – Actualités Politiques Bénin

Blog professionnel d'actualités politiques pour le Bénin, développé avec **Next.js 15**, **TypeScript**, **Tailwind CSS** et **Firebase**.

---

## 🚀 Démarrage rapide

### 1. Cloner et installer les dépendances

```bash
cd blog-tonton
npm install
```

### 2. Configurer Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Authentication** → Email/Password
3. Créez une base de données **Firestore**
4. Activez **Firebase Storage**
5. Copiez `.env.local.example` en `.env.local` :

```bash
cp .env.local.example .env.local
```

6. Remplissez vos clés Firebase dans `.env.local`

### 3. Créer le compte administrateur

1. Allez dans Firebase Authentication
2. Créez manuellement un utilisateur avec l'email de l'administrateur
3. Copiez son **UID** (visible dans Authentication > Users)
4. Ajoutez cet UID dans `.env.local` :

```env
NEXT_PUBLIC_ADMIN_UID=uid_de_ladmin
```

### 4. Configurer les règles Firestore

Copiez le contenu de `firestore.rules` dans :
**Firebase Console → Firestore → Règles**

### 5. Configurer les règles Storage

Copiez le contenu de `storage.rules` dans :
**Firebase Console → Storage → Règles**

### 6. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
src/
├── app/
│   ├── (public)/              # Pages publiques avec Header/Footer
│   │   ├── page.tsx           # 🏠 Accueil
│   │   ├── article/[slug]/    # 📄 Page article
│   │   ├── categorie/[slug]/  # 📚 Page catégorie
│   │   ├── recherche/         # 🔍 Recherche
│   │   ├── login/             # 🔐 Connexion
│   │   └── register/          # 📝 Inscription
│   ├── admin/                 # 🔒 Dashboard admin (protégé)
│   │   ├── page.tsx           # Dashboard principal
│   │   ├── articles/
│   │   │   ├── page.tsx       # Liste des articles
│   │   │   ├── nouveau/       # Créer un article
│   │   │   └── [id]/modifier/ # Modifier un article
│   │   └── layout.tsx         # Layout admin avec sidebar
│   ├── layout.tsx             # Layout racine
│   └── sitemap.ts             # Sitemap SEO
│
├── components/
│   ├── layout/                # Header, Footer, Sidebar
│   ├── home/                  # Hero, ArticleGrid, CategorySection
│   ├── common/                # ArticleCard, SearchBar, Pagination, Skeleton
│   ├── article/               # CommentSection
│   ├── admin/                 # ArticleEditor, RichTextEditor, ImageUpload, StatsCards, ArticleList
│   └── ui/                    # Button, Input, Card, Badge, Select, Dialog, Skeleton
│
├── contexts/
│   └── AuthContext.tsx        # Contexte d'authentification global
│
├── hooks/
│   ├── useArticles.ts         # Hook gestion articles
│   └── useComments.ts         # Hook commentaires temps réel
│
├── services/
│   ├── authService.ts         # Authentification Firebase
│   ├── articleService.ts      # CRUD articles Firestore
│   ├── commentService.ts      # CRUD commentaires Firestore
│   └── storageService.ts      # Upload Firebase Storage
│
├── lib/
│   ├── firebase.ts            # Configuration Firebase
│   ├── utils.ts               # Utilitaires (formatDate, cn, etc.)
│   └── slugify.ts             # Génération de slugs français
│
└── types/
    └── index.ts               # Types TypeScript + catégories
```

---

## 🔥 Structure Firestore

### Collection `articles`
```
articles/{articleId}
├── title: string
├── slug: string (unique)
├── excerpt: string
├── content: string (HTML)
├── imageUrl: string
├── imageAlt: string
├── category: "politique" | "gouvernement" | "elections" | "economie" | "societe" | "international" | "securite" | "culture"
├── status: "draft" | "published"
├── authorId: string (UID Firebase)
├── authorName: string
├── viewCount: number
├── commentCount: number
├── tags: string[]
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── publishedAt: Timestamp | null
```

### Collection `comments`
```
comments/{commentId}
├── articleId: string
├── userId: string
├── userName: string
├── userPhotoURL: string
├── content: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Collection `users`
```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
├── role: "admin" | "user"
└── createdAt: Timestamp
```

---

## 🎨 Design

- **Couleurs** : Bleu marine (`#1a3a6b`), blanc, gris ardoise
- **Accents Bénin** : Vert (`#008751`), Jaune (`#fcd116`), Rouge (`#e8112d`)
- **Typographies** : Inter (texte) + Playfair Display (titres)
- **Dark mode** : Complet via `next-themes`
- **Mobile-first** : Responsive 100%

---

## ⚡ Fonctionnalités

| Fonctionnalité | Statut |
|---|---|
| Authentification Email/Password | ✅ |
| Dashboard Admin protégé | ✅ |
| CRUD Articles avec éditeur rich text | ✅ |
| Upload images Firebase Storage | ✅ |
| Commentaires temps réel | ✅ |
| Dark mode | ✅ |
| SEO (metadata dynamique, OpenGraph) | ✅ |
| Sitemap automatique | ✅ |
| Recherche d'articles | ✅ |
| Pagination | ✅ |
| Skeleton loading | ✅ |
| Responsive mobile | ✅ |
| Toast notifications | ✅ |
| Règles Firestore sécurisées | ✅ |

---

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer en production
npm start

# Linter
npm run lint
```

---

## 🌐 Déploiement (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Ajoutez vos variables d'environnement dans **Vercel Dashboard → Settings → Environment Variables**.

---

## 📄 Licence

Projet privé – Blog Tonton © 2026
