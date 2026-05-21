# Guide de configuration SORANI

Ce guide detaille toutes les etapes pour configurer le site SORANI de zero.

---

## Prerequis installes

- **Homebrew** : `/opt/homebrew/bin/brew`
- **Node.js 26** : `/opt/homebrew/bin/node`
- **npm 11** : `/opt/homebrew/bin/npm`
- **GitHub CLI** : `/opt/homebrew/bin/gh`
- **Compte GitHub** : outsalomonfr-svg
- **Compte Supabase** : connecte
- **Compte Vercel** : Sorani's projects (Hobby)

---

## 1. Supabase - Base de donnees

### Executer le schema SQL

C'est l'etape la plus importante. Sans ca, rien ne fonctionne.

1. Aller sur https://supabase.com
2. Ouvrir le projet `sorani-shop`
3. Menu gauche > **SQL Editor**
4. Coller tout le contenu du fichier `supabase-schema.sql`
5. Cliquer **Run**

Cela cree les tables :
- `categories` : Colliers, Bracelets, Boucles d'oreilles, Bagues
- `products` : tous les bijoux
- `orders` : les commandes clients
- `order_items` : les articles de chaque commande
- `subscribers` : les inscrits a la newsletter

### Verifier les cles API

Dans Supabase > **Settings > API** :
- **Project URL** : `https://fgrtiflnuntqyblvcjkg.supabase.co` (SANS /rest/v1/)
- **anon public key** : commence par eyJ...
- **service_role key** : commence par eyJ... (DIFFERENTE de l'anon key)

IMPORTANT : l'URL dans `.env.local` doit etre `https://fgrtiflnuntqyblvcjkg.supabase.co` sans rien apres `.co`

---

## 2. Stripe - Paiements

### Mode test (pour commencer)

1. Aller sur https://dashboard.stripe.com
2. S'assurer d'etre en **mode test** (toggle en haut a droite)
3. Aller sur **Developers > API keys**
4. Copier :
   - Publishable key : `pk_test_...`
   - Secret key : `sk_test_...`

### Configurer le webhook

1. Aller sur **Developers > Webhooks**
2. Ajouter un endpoint :
   - URL : `https://sorani-shop-4qp5lnnyr-sorani-s-projects.vercel.app/api/webhooks/stripe`
   - Evenements : cocher `checkout.session.completed`
3. Copier le **Signing secret** : `whsec_...`

### Mettre les cles dans .env.local

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Passer en production

Quand tu es prete a recevoir de vrais paiements :
1. Activer le compte Stripe (verifier identite)
2. Remplacer les cles `pk_test_` par `pk_live_` et `sk_test_` par `sk_live_`
3. Creer un nouveau webhook avec l'URL de production

---

## 3. Meta Pixel - Tracking

### Creer un pixel

1. Aller sur https://business.facebook.com
2. Gestionnaire d'evenements > Connecter des sources de donnees > Web
3. Nommer le pixel "SORANI"
4. Copier l'ID du pixel (nombre)

### Ajouter dans .env.local

```
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

### Evenements trackes

| Evenement | Quand |
|-----------|-------|
| PageView | Chaque changement de page |
| ViewContent | Visite d'une page produit |
| AddToCart | Clic "Ajouter au panier" |
| InitiateCheckout | Page de checkout |
| Purchase | Paiement reussi |

---

## 4. Vercel - Variables d'environnement

Toutes les variables de `.env.local` doivent aussi etre dans Vercel :

1. Aller sur https://vercel.com > projet sorani-shop
2. **Settings > Environment Variables**
3. Ajouter chaque variable

Variables requises :
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_META_PIXEL_ID
NEXT_PUBLIC_APP_URL
```

Apres avoir modifie les variables, re-deployer :
- Vercel > Deployments > cliquer "Redeploy" sur le dernier

---

## 5. Premier compte admin

1. Aller sur `/register`
2. Creer un compte avec ton email
3. Te connecter sur `/login`
4. Tu arrives sur le dashboard `/admin`

---

## 6. Ajouter des produits

1. Dashboard > Produits > "Ajouter un produit"
2. Remplir les infos :
   - Nom, description, prix
   - Stock disponible
   - Categorie
   - URL des images (heberger sur Supabase Storage ou autre)
3. Activer le produit
4. Il apparait dans la boutique

### Heberger les images sur Supabase Storage

1. Supabase > Storage > Creer un bucket "products" (public)
2. Uploader les images
3. Copier l'URL publique
4. Coller dans le champ image du produit

---

## Depannage

### Le site affiche un fond noir
- Verifier que le dernier deploy sur Vercel est bien passe
- Le dark mode a ete supprime, tout est blanc + bleu

### "Aucun produit" dans la boutique
- Verifier que le schema SQL a ete execute dans Supabase
- Ajouter des produits depuis /admin/products

### Erreur de connexion au dashboard
- Verifier que les cles Supabase sont correctes dans .env.local ET Vercel
- L'URL Supabase doit etre sans /rest/v1/

### Le paiement ne marche pas
- Verifier les cles Stripe dans .env.local ET Vercel
- En mode test, utiliser la carte : 4242 4242 4242 4242

### Les images ne s'affichent pas
- Verifier que les images sont dans public/images/
- Si images externes, ajouter le domaine dans next.config.ts
