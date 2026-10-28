# Buy-01 — Pages restantes & correction de la dérive

Date : 2026-10-28
Statut : Validé
Précède : `2026-07-31-buy-01-frontend-design.md` (spec initial, toujours valide pour le contrat d'API)

## Contexte

Le frontend Buy-01 est partiellement implémenté (shell, modèles, login, création de produit, product-form). Ce spec couvre :

1. **La correction de la dérive** entre le code committé et le spec initial ;
2. **Les pages restantes** : register, compte, gestion des médias, section seller protégée, grille publique, header fonctionnel.

Décisions prises avec le propriétaire :

- **Périmètre** : corriger la dérive + construire les pages (l'auth corrigée est un prérequis des pages).
- **Structure** : suivre le layout existant (`components/` + `core/`), pas de migration vers `features/`.
- **Grille produits** : publique sur `/` (Home réécrit), pas de route `/products` séparée.
- **`GET /api/products/me`** : existe côté backend (contrat plus riche que le spec initial) — utilisé pour « Mes produits ».
- **Routes** : restructurées en `/seller/*` avec guards (plus de routes plates).
- **Formulaires** : Signal Forms (`form()` de `@angular/forms/signals`), cohérent avec login et product-form existants.

## Contrat d'API

Celui du spec initial, avec un ajout : `GET /api/products/me` (auth, SELLER) → `ProductDTO[]` des produits du seller courant.

### Point à vérifier (étape 0)

`GET /api/media/{id}` doit servir le **binaire de l'image** (utilisable comme `src`). À confirmer par `curl` avant le premier commit de code. Si l'endpoint renvoie du JSON MediaDTO : adapter `MediaService.url()` / ajout d'un endpoint dédié — décision consignée dans le plan d'implémentation.

## Architecture

```
src/app/
  core/
    auth/
      auth.service.ts        # réécrit : user = signal<User|null>, isAuthenticated, role
                             # login (token + GET /users/me), register (+ auto-login),
                             # logout, loadSession (app initializer)
      token-storage.ts       # inchangé
      auth.gard.ts           # authGuard : token + user présents, sinon /login
      seller.gard.ts         # sellerGuard : role === 'SELLER', sinon /
      jwt.interceptor.ts     # inchangé
      http-error.interceptor.ts  # nouveau : parse {error, message, timestamp}
                                 # → message FR ; 401 → purge session + /login
    models/
      product.model.ts       # Product.mediasId → mediaIds (alignement DTO)
      user.model.ts, media.model.ts, auth.model.ts, api-error.model.ts  # inchangés
    services/
      product.service.ts     # list(), mine(), get(id), create(), update(id), delete(id)
                             # URLs relatives /api, plus de localhost:9000 ni console.log
      media.service.ts       # nouveau : upload(file, productId?), listByProduct(id),
                             # delete(id), url(id) → /api/media/{id}
      user.service.ts        # nouveau : me(), updateMe({firstName?, avatar?})
  components/
    header/                  # réécrit : toolbar auth-aware (voir Shell)
    home/                    # réécrit : grille publique des produits
    auth/
      login/                 # corrigé : navigation post-login par rôle + erreurs
      register/              # nouveau
    products/
      my-products/           # corrigé : GET /api/products/me, liste + actions
      product-create/        # wrapper → /seller/products/new
      product-form/          # réutilisé tel quel (création + édition)
      product-edit/          # nouveau wrapper → /seller/products/:id/edit
    seller/
    seller/
      seller-layout/         # nouveau : section /seller (redirige vers /seller/products)
      media-manager/         # nouveau : sélection produit + grille médias + upload
    account/                 # nouveau : /account
    shared/
      media-upload/          # nouveau : input fichier validé + aperçu, output File
      avatar/                # nouveau : image ou initiales
      confirm-dialog/        # nouveau : boîte de confirmation (produit/média)
```

## Routes

```
/                          → Home (grille publique, loadComponent)
/login                     → Login (redirige vers l'accueil du rôle si déjà authentifié)
/register                  → Register
/seller                    → SellerLayout (authGuard + sellerGuard, enfants lazy)
/seller/products           → MyProducts
/seller/products/new       → ProductCreate
/seller/products/:id/edit  → ProductEdit
/seller/media              → MediaManager
/account                   → Account (authGuard)
/**                        → NotFound
```

## Shell & navigation

**Header unique** auth-aware (pas de shell séparé par rôle), `@switch` sur l'état :

- **Déconnecté** : « Buy It » à gauche ; à droite « Connexion », « Inscription ».
- **CLIENT** : « Buy It » ; à droite avatar ouvrant un menu (« Mon compte », « Déconnexion »).
- **SELLER** : « Buy It » ; nav « Mes produits », « Mes médias » ; à droite avatar ouvrant le même menu (« Mon compte », « Déconnexion »).

- Avatar : image si `avatar` est défini, sinon initiales ; 32 px dans la toolbar.
- Mobile (< 600 px) : les liens nav seller se replient dans un MatMenu derrière un bouton hamburger dans le header (pas de sidenav inter-composants).
- Libellés français uniquement ; icônes `aria-label`.

## Pages

### Register (`/register`)
- Signal form : prénom, nom, email, mot de passe (≥ 8), confirmation (validateur de groupe « Les mots de passe ne correspondent pas »), toggle de rôle MatButtonToggle CLIENT/SELLER.
- Si SELLER : avatar optionnel — composant MediaUpload (type jpeg/png/gif/webp, ≤ 2 Mo, aperçu).
- Succès : `POST /api/auth/register` → auto-login → si avatar : `POST /api/media/upload` (sans productId) puis `PUT /api/users/me {avatar}` → redirection selon le rôle.
- 409 « Cet email est déjà utilisé » inline au-dessus du formulaire ; bouton désactivé pendant l'envoi, libellé « Créer mon compte ».

### Mes produits (`/seller/products`)
- `productService.mine()` → lignes : miniature (1re média), nom, prix EUR fr-FR, date de mise à jour, actions « Modifier » / « Supprimer » (dialog de confirmation).
- Bouton « Ajouter un produit » en haut à droite → `/seller/products/new`.
- Spinner de chargement ; vide : « Vous n'avez pas encore de produit ».

### ProductCreate / ProductEdit
- Wrappers fins autour de `ProductForm` existant. Création → `POST` ; édition : chargement par id → préremplissage → `PUT`.
- Succès : snackbar « Produit enregistré » + retour `/seller/products`.

### Mes médias (`/seller/media`)
- Sélecteur de produit (MatSelect sur `mine()`), grille des médias du produit : aperçu image, nom de fichier, taille ; « Supprimer » au survol (dialog de confirmation).
- Upload via MediaUpload → `POST /api/media/upload?productId=...` ; après upload/suppression : rafraîchissement + snackbar.
- Conformément au spec initial : le formulaire produit ne gère pas les uploads ; les médias sont gérés ici.

### Mon compte (`/account`)
- Email (lecture seule) et rôle affichés ; prénom éditable ; avatar modifiable (MediaUpload + aperçu).
- « Enregistrer » → `PUT /api/users/me`, snackbar « Compte mis à jour ».

### Home (`/`, grille publique)
- CSS grid responsive (4 colonnes desktop, 2 tablette, 1 mobile), pas de `mat-grid-list`.
- Cards : 1re image via `mediaService.url(mediaIds[0])` (placeholder si aucun média), nom, prix `Intl.NumberFormat('fr-FR', EUR)`, description clampée à 3 lignes.
- Vide : « Aucun produit pour le moment ».

## Corrections de dérive (récapitulatif)

| Fichier | Problème | Correction |
|---|---|---|
| `auth.service.ts` | `isAuthenticated` inversé ; pas de `/users/me`, logout, restore | Réécrit (signal `user`, computeds, loadSession) |
| `auth.service.ts`, `home.ts`, `my-products.ts`, `product.service.ts` | `http://localhost:9000` en dur | URLs relatives `/api` (proxy dev) |
| `login.ts` | navigation `'user'`/`'register'` inexistante, pas d'attente ni d'erreur | Redirection par rôle, erreurs affichées |
| `my-products.ts` | réponse jamais consommée | charge `/api/products/me` et rend la liste |
| `home.html` | `[src]="item.mediaIds"` (tableau) | `mediaService.url(premier média)` |
| `header.html` | toolbar démo anglaise | Header auth-aware français |
| `product.service.ts` | `console.log('yola')` | Supprimé |
| `product.model.ts` | `mediasId` vs `mediaIds` | Unifié en `mediaIds` |
| `home.ts` | snackbar inutilisé, subscription dans un champ | Nettoyé |

## Validation & erreurs

- Formulaires : messages inline français (requis, email, ≥ 8 car., correspondance, prix > 0).
- Uploads : double contrôle (validators client existants) puis erreurs serveur en snackbar.
- `http-error.interceptor` : parse `{error, message, timestamp}` ; 401 → purge + `/login` ; 403, 409, 400, 500 → messages français.
- Vocabulaire cohérent : « Produit enregistré », « Supprimer », « Compte mis à jour ».

## Sécurité

- Token en localStorage (clé dédiée existante), jamais loggé ni affiché.
- Passwords jamais stockés côté front.
- Guards : CLIENT bloqué sur `/seller/*` (redirection `/`), anonyme redirigé vers `/login`.

## Tests (Vitest, `ng test --watch=false`)

- **AuthService** : login (token + user chargés), register → auto-login, logout purge, loadSession restaure, 401 purge.
- **Guards** : anonyme → `/login` ; CLIENT sur `/seller/*` → `/` ; SELLER passe.
- **Services** : URLs/méthodes/bodies corrects via `HttpTestingController`, chemins `/api` relatifs.
- **Interceptors** : header Bearer ajouté ; mapping des codes ; purge sur 401.
- **Composants** : register (validation, toggle rôle, validation avatar), my-products (rendu, actions), media-manager (upload/suppression), account (mise à jour), home (rendu produits), header (états par rôle).

## Hors périmètre (YAGNI)

Pas de recherche/filtres, pas de page détail produit, pas de panier/commandes (hors contrat d'API), pas d'i18n (français seul), pas de mode sombre.
