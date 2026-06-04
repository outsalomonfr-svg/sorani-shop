# Setup ce que tu dois faire toi-meme

Tout le code est prêt. Voici les 5 étapes manuelles à faire **une seule fois** pour activer OAuth Google + le customizer + les pages CMS.

---

## 1. Lancer les 3 migrations SQL

Les 3 fichiers SQL sont déjà combinés dans ton presse-papier (`Cmd+V` pour coller).

1. Ouvre https://supabase.com/dashboard/project/_/sql/new
2. **Cmd+V** pour coller le SQL
3. Clique **Run**

Si jamais le presse-papier a changé, refais la commande :
```bash
cat supabase-migration-0*.sql | pbcopy
```

Ça crée :
- `profiles` (utilisateurs + role admin)
- `site_settings` (theme du site)
- `pages` (pages CMS)

---

## 2. Créer un OAuth client Google

1. https://console.cloud.google.com/
2. **APIs & Services** > **OAuth consent screen** :
   - User Type : **External**
   - App name : `SORANI`
   - Tes emails
3. **APIs & Services** > **Credentials** > **+ Create Credentials** > **OAuth client ID**
   - Application type : **Web application**
   - Name : `SORANI Web`
   - **Authorized redirect URIs** :
     ```
     https://<TON-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
     (le Project Ref est visible dans Supabase > Settings > API)
4. Récupère **Client ID** + **Client secret**

---

## 3. Activer Google dans Supabase

1. Supabase > **Authentication** > **Providers** > **Google**
2. Toggle ON
3. Coller Client ID + Client Secret > **Save**

---

## 4. URLs de redirection

Supabase > **Authentication** > **URL Configuration**

- **Site URL** : `https://sorani-shop-4qp5lnnyr-sorani-s-projects.vercel.app`
- **Redirect URLs** (ajouter) :
  ```
  http://localhost:3000/auth/callback
  https://sorani-shop-4qp5lnnyr-sorani-s-projects.vercel.app/auth/callback
  ```

---

## 5. Te passer en admin

Une fois connectée avec Google sur le site, retourne dans Supabase **SQL Editor** :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'nacera.zahi92@gmail.com';
```

---

## Tester en local

```bash
cd /Users/sofia/Desktop/SORANI/sorani-shop
npx next dev
```

Puis http://localhost:3000/login > **Se connecter avec Google**.

Tu arrives sur `/admin` avec :
- **Dashboard** : KPI + commandes récentes
- **Produits / Commandes / Clients** : gestion catalogue
- **Pages** : CMS pages libres (À propos, Contact, FAQ…)
- **Apparence** : customizer style Shopify avec preview live
- **Paramètres** : config Stripe / Meta Pixel / livraison

---

## Une fois publié sur Vercel

Les variables d’environnement Supabase sont déjà OK sur Vercel (mêmes que `.env.local`). Aucun changement nécessaire — un simple `git push` redéploie tout.
