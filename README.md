# SORANI - Bijoux faits avec amour

Site e-commerce pour la marque SORANI, bijoux artisanaux.

**URL du site** : https://sorani-shop-4qp5lnnyr-sorani-s-projects.vercel.app
**GitHub** : https://github.com/outsalomonfr-svg/sorani-shop

---

## Stack technique

| Technologie | Usage |
|-------------|-------|
| Next.js 16 | Framework React (App Router) |
| TypeScript | Typage |
| Tailwind CSS | Styles |
| Supabase | Base de donnees, authentification, storage |
| Stripe | Paiements |
| Zustand | Gestion du panier (state) |
| Meta Pixel | Tracking Facebook/Instagram |
| Vercel | Hebergement et deploiement |

---

## Structure du projet

```
sorani-shop/
├── public/images/          # Logos et photos SORANI
├── src/
│   ├── app/
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── layout.tsx            # Layout global (Navbar, Footer, Cart)
│   │   ├── globals.css           # Styles globaux + animations
│   │   ├── shop/
│   │   │   ├── page.tsx          # Page boutique (catalogue)
│   │   │   └── product/[slug]/   # Page produit individuel
│   │   ├── checkout/
│   │   │   ├── page.tsx          # Recapitulatif avant paiement
│   │   │   ├── success/          # Page apres paiement reussi
│   │   │   └── cancel/           # Page si paiement annule
│   │   ├── (auth)/
│   │   │   ├── login/            # Page de connexion
│   │   │   └── register/         # Page d'inscription
│   │   ├── admin/
│   │   │   ├── page.tsx          # Dashboard (KPIs, commandes recentes)
│   │   │   ├── products/         # Gestion produits (liste + creation)
│   │   │   ├── orders/           # Gestion commandes
│   │   │   ├── customers/        # Liste clients
│   │   │   └── settings/         # Parametres
│   │   └── api/
│   │       ├── checkout/         # API Stripe checkout session
│   │       └── webhooks/stripe/  # Webhook Stripe (post-paiement)
│   ├── components/
│   │   ├── layout/               # Navbar, Footer, MetaPixel
│   │   ├── product/              # ProductCard
│   │   └── cart/                 # CartDrawer
│   ├── hooks/
│   │   └── useCart.ts            # State du panier (Zustand)
│   ├── lib/
│   │   ├── supabase/client.ts    # Supabase client (navigateur)
│   │   ├── supabase/server.ts    # Supabase client (serveur)
│   │   ├── stripe.ts             # Instance Stripe
│   │   └── meta-pixel.ts        # Fonctions Meta Pixel
│   └── types/
│       └── index.ts              # Types TypeScript
├── supabase-schema.sql           # Schema SQL a executer dans Supabase
├── SETUP.md                      # Guide de configuration detaille
├── .env.local                    # Variables d'environnement (NE PAS COMMITER)
└── README.md                     # Ce fichier
```

---

## Demarrage rapide

### 1. Installer les dependances

```bash
cd /Users/sofia/Desktop/SORANI/sorani-shop
npm install
```

### 2. Lancer en local

```bash
npx next dev
```

Le site est accessible sur http://localhost:3000

### 3. Deployer

Chaque `git push` sur la branche `main` declenche un deploiement automatique sur Vercel.

```bash
git add -A
git commit -m "description du changement"
git push
```

---

## Configuration des services

### Supabase (base de donnees)

1. Aller sur https://supabase.com > projet sorani-shop
2. **SQL Editor** > coller le contenu de `supabase-schema.sql` > Run
3. **Settings > API** > copier les cles dans `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL (sans /rest/v1/)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key

### Stripe (paiements)

1. Aller sur https://dashboard.stripe.com/apikeys
2. Copier les cles dans `.env.local`
3. Configurer le webhook (voir SETUP.md)

### Meta Pixel

1. Aller sur https://business.facebook.com > Gestionnaire d'evenements
2. Creer un pixel, copier l'ID dans `NEXT_PUBLIC_META_PIXEL_ID`

Voir **SETUP.md** pour le guide complet de chaque service.

---

## Compte admin

1. Aller sur `/register` pour creer un compte
2. Se connecter sur `/login`
3. Acceder au dashboard sur `/admin`

---

## Couleurs de la marque

| Couleur | Code | Usage |
|---------|------|-------|
| Bleu SORANI | `#1B4965` | Couleur principale |
| Bleu clair | `#BEE9E8` | Accents, boutons secondaires |
| Blanc | `#FFFFFF` | Fond principal |

---

## Commandes utiles

```bash
# Lancer en local
npx next dev

# Build de production
npx next build

# Push sur GitHub (+ deploy Vercel auto)
git add -A && git commit -m "message" && git push
```
