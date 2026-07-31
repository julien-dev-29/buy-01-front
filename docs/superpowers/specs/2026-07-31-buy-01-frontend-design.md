# Buy-01 — Frontend Angular Design

Date : 2026-07-31
Statut : Validé

## Contexte

Frontend Angular de la plateforme e-commerce « Buy-01 », alimentée par une API Gateway Spring Boot (port 9000, tous les appels passent par `/api`). Le périmètre de ce spec est **uniquement le frontend** : le contrat d'API est fourni et considéré comme fixe.

## Stack

- Angular 21, composants **standalone** (pas de NgModules), `standalone` est la valeur par défaut
- **Angular Material** (à ajouter via `ng add @angular/material`) pour les composants UI
- **Tailwind CSS 4** (déjà configuré) pour le layout et l'espacement
- Signals pour l'état, `computed()` pour l'état dérivé, `changeDetection: OnPush`
- Reactive forms, control flow natif (`@if`, `@for`, `@switch`)
- Routes lazy-loadées (`loadComponent`)
- Tests unitaires **Vitest** (runner déjà configuré, builder `@angular/build:unit-test`)
- UI en **français**

## Contrat d'API (fourni, considéré fixe)

Base : `http://localhost:9000` (API Gateway). En dev, le serveur Angular proxie `/api` vers la gateway.

- `POST /api/auth/register` — body `{email, password, firstName, lastName, role}` (rôles `CLIENT`/`SELLER`, défaut CLIENT) → 201 UserDTO
- `POST /api/auth/login` — body `{email, password}` → 200 `{token}`
- `GET /api/users/me` (auth) → UserDTO
- `PUT /api/users/me` (auth) — body optionnel `{firstName?, avatar?}` (avatar = URL) → UserDTO
- `GET /api/products` (public) → ProductDTO[]
- `GET /api/products/{id}` (public) → ProductDTO
- `POST /api/products` (auth) → 201 ProductDTO
- `PUT /api/products/{id}` (auth, propriétaire) → ProductDTO
- `DELETE /api/products/{id}` (auth, propriétaire) → 204
- `POST /api/media/upload?productId=...` (auth) — multipart `file`, `productId` optionnel → 201 MediaDTO ; formats `image/jpeg, image/png, image/gif, image/webp`, **taille max 2 Mo**
- `GET /api/media/{id}` (public) → MediaDTO
- `GET /api/media/product/{productId}` (public) → MediaDTO[]
- `DELETE /api/media/{id}` (auth, propriétaire) → 204
- Erreurs uniformes : `{error, message, timestamp}` (400/401/403/404/409/500)

DTO :
- UserDTO : `{id, email, firstName, lastName, role, avatar, createdAt, updatedAt}`
- ProductDTO : `{id, name, description, price, sellerId, mediaIds[], createdAt, updatedAt}`
- MediaDTO : `{id, filename, originalName, contentType, size, productId, sellerId, createdAt}`
- LoginResponse : `{token}`

### Point d'assomption

L'affichage des images repose sur `GET /api/media/{id}` **servant le binaire de l'image** (utilisé comme `src` d'un `<img>`). Si l'endpoint renvoie un JSON MediaDTO, une URL de servation dédiée sera nécessaire.

### Dépendance backend (à confirmer par le propriétaire de l'API)

Le front affiche la 1re image d'un produit depuis `ProductDTO.mediaIds`, mais liste les médias du manager depuis `GET /api/media/product/{productId}`. Le front suppose que l'upload d'un média avec `productId` est reflété dans `mediaIds` du produit (via `GET /api/products`) ou qu'il sera fait un `PUT` du produit pour synchroniser `mediaIds`. Le front revalidera la liste produits après les actions (upload/suppression de média).

## Architecture

```
src/app/
  core/
    auth/
      auth.service.ts          # signaux (currentUser, isAuthenticated, role), login/register/logout
      token-storage.ts         # wrapper localStorage (clé dédiée)
      auth.guard.ts            # exige un token
      seller.guard.ts          # exige le rôle SELLER
      jwt.interceptor.ts       # ajoute Authorization: Bearer <token>
      http-error.interceptor.ts# parse ApiError, 401 → déconnexion, messages français
    models/
      user.model.ts            # User, Role ('CLIENT' | 'SELLER')
      product.model.ts
      media.model.ts
      auth.model.ts            # LoginResponse, RegisterRequest
      api-error.model.ts       # ApiError
    services/
      user.service.ts          # GET/PUT /users/me
      product.service.ts       # CRUD produits
      media.service.ts         # upload, liste par produit, suppression
    validation/
      media.validators.ts      # type image/jpeg|png|gif|webp + taille ≤ 2 Mo
  features/
    auth/
      login/login.page.ts
      register/register.page.ts        # toggle rôle, avatar picker si SELLER
    products/
      product-list/product-list.page.ts # grille publique
    seller/
      seller-layout/seller-layout.ts   # toolbar + sidenav
      my-products/my-products.page.ts  # CRUD produits du seller
      product-form/                    # formulaire nom/description/prix (create + edit)
      media-manager/media-manager.page.ts
    account/
      account/account.page.ts          # prénom + avatar
  shared/
    media-upload/                      # input fichier validé (type + taille), réutilisable
    avatar/                            # affichage avatar + bouton upload
    confirm-dialog/                    # boîte de confirmation suppression
```

## Authentification

- **Token** stocké en `localStorage` (clé dédiée type `buy01.token`), jamais exposé dans l'UI.
- **Login** : `POST /api/auth/login` → sauvegarde token → `GET /api/users/me` → signaux `currentUser`/`isAuthenticated`/`role`. Redirection : SELLER → `/seller/products`, CLIENT → `/products`.
- **Register** : `POST /api/auth/register` → **auto-login** (l'inscription ne renvoie pas de token) → si seller et avatar sélectionné : upload de l'avatar via media-service (sans `productId`), puis `PUT /api/users/me` avec l'URL de l'avatar.
- **Logout** : purge token + signal, redirection `/login`.
- **JWT interceptor** : ajoute le header `Authorization: Bearer` sur les requêtes sortantes ; sur **401** → purge session + redirection `/login`.
- **Guards** : `authGuard` (token présent), `sellerGuard` (rôle SELLER). Les routes `/seller/*` sont protégées par sellerGuard ; `/account` par authGuard.

## Pages

### Login (`/login`)
- Email + mot de passe (reactive form, validation : requis, format email, mot de passe requis)
- Erreurs serveur (401 « email ou mot de passe incorrect », 400) affichées en français
- Lien vers `/register`

### Register (`/register`)
- Prénom, nom, email, mot de passe (≥ 8 car.), confirmation de mot de passe (doit correspondre)
- Toggle de rôle CLIENT / SELLER
- Si SELLER : avatar optionnel (picker validé : type image, ≤ 2 Mo, aperçu)
- Après succès : auto-login puis redirection selon le rôle

### Produits (`/products`, public)
- Grille de cards Material : 1re image (via `/api/media/{mediaId}`), nom, prix formaté (EUR), vendeur
- Aucun filtre ni recherche

### Seller (`/seller`, sellerGuard)
- Layout : toolbar (nom de l'app, menu utilisateur avec avatar, déconnexion) + sidenav (« Mes produits », « Mes médias »)

### Mes produits (`/seller/products`)
- Liste des produits du seller courant (filtre côté client sur `sellerId` depuis `GET /api/products` — pas d'endpoint dédié)
- Actions : créer, modifier, supprimer (avec dialog de confirmation)
- **Product form** (création/édition) : nom (requis), description (requis), prix (requis, > 0)
- Miniature de la 1re image sur chaque ligne/card
- Les images sont gérées dans « Mes médias » ; le formulaire produit ne gère pas les uploads

### Mes médias (`/seller/media`)
- Sélecteur de produit (liste des produits du seller)
- Grille des médias du produit via `GET /api/media/product/{productId}` avec aperçu image
- Bouton upload : contrôle client (type image/jpeg|png|gif|webp, ≤ 2 Mo) puis `POST /api/media/upload?productId=...`
- Suppression d'un média (dialog de confirmation)
- Messages d'erreur du serveur (`INVALID_FILE_TYPE`, etc.) affichés en français

### Mon compte (`/account`, authGuard)
- Édition du prénom + mise à jour de l'avatar (upload validé, même flux que le register)
- Enregistrement via `PUT /api/users/me`

## Validation & gestion d'erreurs

- **Uploads** : double contrôle — côté client (type + taille avant envoi) puis erreurs serveur affichées via Snackbar en français
- **Formulaires** : messages inline en français (requis, format email, longueur min., correspondance, prix > 0)
- **Erreurs HTTP** : interceptor parse `{error, message, timestamp}`, mappe vers un message français, affiche via `MatSnackBar` ; **401 → déconnexion**
- Messages français cohérents pour les codes backend (409 = email déjà utilisé, 403 = accès refusé, 400 = requête invalide)

## Sécurité

- Token en localStorage, jamais loggé, jamais affiché
- Mots de passe jamais stockés/loggés côté front
- En prod : HTTPS uniquement (configuration hors scope de ce spec)

## Tests (Vitest)

- **AuthService** : login/register/logout, persistance du token, mise à jour des signaux (`HttpTestingController`)
- **Guards** : authGuard redirige sans token ; sellerGuard bloque les non-sellers
- **Media validators** : rejette > 2 Mo et les types non autorisés, accepte les fichiers valides
- **Services** produit/média/utilisateur : appels HTTP, mapping des erreurs
- **Composants** : validation des formulaires login/register, toggle de rôle, upload validé, rendu de la liste produits, filtrage des produits du seller
- **Interceptors** : header Bearer ajouté, comportement sur 401

## Critères de succès

- Inscription en CLIENT ou SELLER avec avatar optionnel pour les sellers
- Connexion, déconnexion, restauration de session au rechargement
- Un CLIENT ne peut pas accéder aux routes `/seller/*`
- Un seller ne peut gérer que ses propres produits et médias (backend enforce, front masque les actions non autorisées)
- Uploads limités à image/jpeg|png|gif|webp ≤ 2 Mo avec retours d'erreur clairs en français
- Listing public des produits sans filtre ni recherche
- Tests Vitest verts (`ng test`)
