# Buy-01 Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Angular frontend (auth client/seller, seller product & media management, public product listing) for the Buy-01 e-commerce platform.

**Architecture:** Standalone Angular 21 app organized as `core/` (auth, guards, interceptors, models, services, validators), `features/` (auth, products, seller, account — all lazy-loaded), and `shared/` (media-upload, avatar, confirm dialog). State lives in signals on an `AuthService` singleton; HTTP goes through `/api/*`, proxied in dev to `http://localhost:9000`. Angular Material for UI components, Tailwind 4 for layout.

**Tech Stack:** Angular 21, Angular Material 21, Tailwind CSS 4, Signals, Reactive Forms, RxJS, Vitest (`ng test`), TypeScript strict.

## Global Constraints

- Angular 21 standalone components; **never** write `standalone: true` (it is the default)
- Strict mode; never use `any` (use `unknown`)
- `changeDetection: ChangeDetectionStrategy.OnPush` on every component
- State via signals; derived state via `computed()`; never `mutate` — use `set`/`update`
- Native control flow `@if`/`@for`/`@switch` only — no `*ngIf`/`*ngFor`/`*ngSwitch`
- No `ngClass`/`ngStyle` — use `class`/`style` bindings
- Reactive forms only; `input()`/`output()` functions, never decorators
- No `@HostBinding`/`@HostListener` (use the `host` object); no NgModules
- No code comments unless asked
- UI copy in **French**
- API base path is `/api` (dev proxy → `http://localhost:9000`)
- Tests: Vitest via `ng test --watch=false`; tests live next to the code as `*.spec.ts`
- Commit messages use `feat:` / `test:` / `fix:` prefixes

---

### Task 1: Angular Material setup, dev proxy, app shell

**Files:**
- Modify: `package.json` (via `ng add`)
- Create: `proxy.conf.json`
- Modify: `angular.json` (serve options + `styles` added by `ng add`)
- Modify: `src/app/app.config.ts`
- Modify: `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`
- Modify: `src/app/app.spec.ts`
- Modify: `src/index.html` (title)
- Create: `src/theme.scss`

**Interfaces:**
- Consumes: nothing
- Produces: `appConfig` wiring — `provideAnimationsAsync()`, `provideHttpClient(withInterceptors([jwtInterceptor, httpErrorInterceptor]))`, `provideAppInitializer(() => inject(AuthService).loadStoredSession())`. The interceptors and `AuthService` do not exist yet; stub files are created in this task and filled in Tasks 3 and 5.

- [ ] **Step 1: Add Angular Material**

Run:
```bash
npm i -D sass
npx ng add @angular/material --theme custom --animations enabled --skip-confirmation
```
Expected: `@angular/material` and `@angular/cdk` added to `package.json`; `src/theme.scss` created and added to `angular.json` `styles`; `provideAnimationsAsync()` added to `app.config.ts`.

- [ ] **Step 2: Set the Material theme**

Overwrite `src/theme.scss`:
```scss
@use '@angular/material' as mat;

html {
  color-scheme: light;
  @include mat.theme(
    (
      color: (
        primary: mat.$azure-palette,
        tertiary: mat.$blue-palette,
      ),
    )
  );
}
```
If the generated theme used `mat.define-theme(...)`, delete that and use the above.

- [ ] **Step 3: Add the dev proxy**

Create `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:9000",
    "secure": false,
    "changeOrigin": true
  }
}
```
Add `"proxyConfig": "proxy.conf.json"` to the `serve` architect options in `angular.json`:
```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  },
```

- [ ] **Step 4: Rewrite the app shell**

`src/app/app.ts`:
```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
```

`src/app/app.html`:
```html
<router-outlet />
```

`src/app/app.css`: empty file.

`src/app/app.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

`src/index.html` — change `<title>Buy01Front</title>` to `<title>Buy-01</title>`.

- [ ] **Step 5: Update app.config.ts**

`src/app/app.config.ts`:
```ts
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { httpErrorInterceptor } from './core/auth/http-error.interceptor';
import { jwtInterceptor } from './core/auth/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptor, httpErrorInterceptor])),
    provideAppInitializer(() => inject(AuthService).loadStoredSession()),
  ],
};
```
The imported symbols do not exist yet — that is expected. Create stub files now (filled in later tasks):
- `src/app/core/auth/auth.service.ts`: `@Injectable({ providedIn: 'root' }) class AuthService {}` with the required imports.
- `src/app/core/auth/jwt.interceptor.ts`: `export const jwtInterceptor: HttpInterceptorFn = (req, next) => next(req);`
- `src/app/core/auth/http-error.interceptor.ts`: `export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => next(req);`
- `src/app/app.routes.ts`: keep `export const routes: Routes = [];`

- [ ] **Step 6: Verify build and tests**

Run: `ng build`
Expected: build succeeds (no errors, no budget violations).

Run: `ng test --watch=false`
Expected: App test passes.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: set up Angular Material, dev proxy and app shell"
```

---

### Task 2: Core models and media validation

**Files:**
- Create: `src/app/core/models/user.model.ts`
- Create: `src/app/core/models/product.model.ts`
- Create: `src/app/core/models/media.model.ts`
- Create: `src/app/core/models/auth.model.ts`
- Create: `src/app/core/models/api-error.model.ts`
- Create: `src/app/core/validation/media.validators.ts`
- Create: `src/app/core/validation/media.validators.spec.ts`
- Create: `src/app/core/validation/password.validators.ts`
- Create: `src/app/core/validation/password.validators.spec.ts`

**Interfaces:**
- Produces (used by all later tasks):
  - `type Role = 'CLIENT' | 'SELLER'`
  - `interface User { id: string; email: string; firstName: string; lastName: string; role: Role; avatar: string | null; createdAt: string; updatedAt: string }`
  - `interface Product { id: string; name: string; description: string; price: number; sellerId: string; mediaIds: string[]; createdAt: string; updatedAt: string }`
  - `interface ProductPayload { name: string; description: string; price: number; mediaIds?: string[] }`
  - `interface Media { id: string; filename: string; originalName: string; contentType: string; size: number; productId: string | null; sellerId: string; createdAt: string }`
  - `interface LoginRequest { email: string; password: string }`
  - `interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; role: Role }`
  - `interface LoginResponse { token: string }`
  - `interface ApiError { error: string; message: string; timestamp: string }`
  - `const MAX_MEDIA_SIZE_BYTES: number` (= 2 097 152)
  - `const ALLOWED_MEDIA_TYPES: readonly string[]` (= jpeg, png, gif, webp)
  - `function validateMediaFile(file: File): string | null` — French error message or `null`
  - `function passwordMatchValidator(control: AbstractControl): ValidationErrors | null`

- [ ] **Step 1: Write the failing validator tests**

`src/app/core/validation/media.validators.spec.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE_BYTES, validateMediaFile } from './media.validators';

describe('validateMediaFile', () => {
  it('accepts allowed image types under 2 MB', () => {
    for (const type of ALLOWED_MEDIA_TYPES) {
      const file = new File(['x'.repeat(1024)], 'photo', { type });
      expect(validateMediaFile(file)).toBeNull();
    }
  });

  it('accepts a file exactly at the 2 MB limit', () => {
    const file = new File(['x'.repeat(MAX_MEDIA_SIZE_BYTES)], 'ok.png', { type: 'image/png' });
    expect(validateMediaFile(file)).toBeNull();
  });

  it('rejects files larger than 2 MB', () => {
    const file = new File(['x'.repeat(MAX_MEDIA_SIZE_BYTES + 1)], 'big.png', { type: 'image/png' });
    expect(validateMediaFile(file)).toContain('2 Mo');
  });

  it('rejects disallowed file types', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateMediaFile(file)).toContain('Format non autorisé');
  });

  it('rejects files without a MIME type', () => {
    const file = new File(['x'], 'photo');
    expect(validateMediaFile(file)).toContain('Format non autorisé');
  });
});
```

`src/app/core/validation/password.validators.spec.ts`:
```ts
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { passwordMatchValidator } from './password.validators';

describe('passwordMatchValidator', () => {
  it('returns null when passwords match', () => {
    const form = new FormGroup({
      password: new FormControl('secret123'),
      confirmPassword: new FormControl('secret123'),
    });
    expect(passwordMatchValidator(form)).toBeNull();
  });

  it('returns passwordMismatch when passwords differ', () => {
    const form = new FormGroup({
      password: new FormControl('secret123'),
      confirmPassword: new FormControl('different'),
    });
    expect(passwordMatchValidator(form)).toEqual({ passwordMismatch: true });
  });

  it('returns null when controls are missing', () => {
    expect(passwordMatchValidator(new FormControl('x'))).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — `media.validators` and `password.validators` modules do not exist.

- [ ] **Step 3: Implement models and validators**

`src/app/core/models/user.model.ts`:
```ts
export type Role = 'CLIENT' | 'SELLER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}
```

`src/app/core/models/product.model.ts`:
```ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  mediaIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  mediaIds?: string[];
}
```

`src/app/core/models/media.model.ts`:
```ts
export interface Media {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  productId: string | null;
  sellerId: string;
  createdAt: string;
}
```

`src/app/core/models/auth.model.ts`:
```ts
import type { Role } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
}
```

`src/app/core/models/api-error.model.ts`:
```ts
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
}
```

`src/app/core/validation/media.validators.ts`:
```ts
export const MAX_MEDIA_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export function validateMediaFile(file: File): string | null {
  const allowed = ALLOWED_MEDIA_TYPES as readonly string[];
  if (!allowed.includes(file.type)) {
    return 'Format non autorisé. Utilisez un fichier JPEG, PNG, GIF ou WebP.';
  }
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return 'Fichier trop volumineux (maximum 2 Mo).';
  }
  return null;
}
```

`src/app/core/validation/password.validators.ts`:
```ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) {
    return null;
  }
  return password.value === confirm.value ? null : { passwordMismatch: true };
}
```
(`passwordMatchValidator` is used as the `FormGroup`-level validator in Task 8.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — 5 media validator tests + 3 password validator tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/models src/app/core/validation
git commit -m "feat: add core models and media validation"
```

---

### Task 3: Token storage and AuthService

**Files:**
- Create: `src/app/core/auth/token-storage.ts`
- Create: `src/app/core/auth/token-storage.spec.ts`
- Create: `src/app/core/auth/auth.service.ts` (replaces the Task 1 stub)
- Create: `src/app/core/auth/auth.service.spec.ts`

**Interfaces:**
- Consumes: `User`, `LoginResponse`, `RegisterRequest` (Task 2)
- Produces:
  - `TokenStorage` (`providedIn: 'root'`): `get(): string | null`, `set(token: string): void`, `clear(): void`
  - `AuthService` (`providedIn: 'root'`):
    - readonly signals: `currentUser: Signal<User | null>`, `isAuthenticated: Signal<boolean>`, `role: Signal<Role | null>`, `isSeller: Signal<boolean>`
    - getter `token: string | null`
    - `login(email: string, password: string): Observable<void>` — POST `/api/auth/login` → save token → GET `/api/users/me` → set `currentUser`
    - `register(payload: RegisterRequest): Observable<void>` — POST `/api/auth/register` then `login(payload.email, payload.password)`
    - `logout(): void`
    - `setCurrentUser(user: User | null): void`
    - `loadStoredSession(): Promise<void>` — no token: clear user, resolve; token: GET `/api/users/me`, on failure `logout()`

- [ ] **Step 1: Write the failing tests**

`src/app/core/auth/token-storage.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { TokenStorage } from './token-storage';

describe('TokenStorage', () => {
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(TokenStorage);
  });

  it('returns null when no token is stored', () => {
    expect(storage.get()).toBeNull();
  });

  it('persists a token', () => {
    storage.set('abc');
    expect(storage.get()).toBe('abc');
  });

  it('clears the token', () => {
    storage.set('abc');
    storage.clear();
    expect(storage.get()).toBeNull();
  });
});
```

`src/app/core/auth/auth.service.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { TokenStorage } from './token-storage';

const seller: User = {
  id: 'u1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'SELLER',
  avatar: null,
  createdAt: '2025-07-29T10:00:00',
  updatedAt: '2025-07-29T10:00:00',
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorage);
  });

  afterEach(() => {
    http.verify();
  });

  it('is unauthenticated initially', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
    expect(service.currentUser()).toBeNull();
  });

  it('saves the token and loads the profile on login', async () => {
    const promise = firstValueFrom(service.login('john@example.com', 'secret123'));

    const loginReq = http.expectOne('/api/auth/login');
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ token: 'abc' });
    expect(storage.get()).toBe('abc');

    const meReq = http.expectOne('/api/users/me');
    meReq.flush(seller);

    await promise;
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('SELLER');
    expect(service.isSeller()).toBe(true);
    expect(service.currentUser()).toEqual(seller);
  });

  it('registers then logs in', async () => {
    const promise = firstValueFrom(
      service.register({ email: 'jane@example.com', password: 'secret123', firstName: 'Jane', lastName: 'Doe', role: 'CLIENT' }),
    );

    http.expectOne('/api/auth/register').flush({ ...seller, id: 'u2', email: 'jane@example.com', role: 'CLIENT' });
    http.expectOne('/api/auth/login').flush({ token: 'xyz' });
    http.expectOne('/api/users/me').flush({ ...seller, id: 'u2', email: 'jane@example.com', role: 'CLIENT' });

    await promise;
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('CLIENT');
  });

  it('logs out and clears token and user', () => {
    storage.set('abc');
    service.setCurrentUser(seller);
    service.logout();
    expect(storage.get()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('loads the stored session when a token exists', async () => {
    storage.set('abc');
    const promise = service.loadStoredSession();
    http.expectOne('/api/users/me').flush(seller);
    await promise;
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears the session when the token is rejected', async () => {
    storage.set('expired');
    const promise = service.loadStoredSession();
    http
      .expectOne('/api/users/me')
      .flush({ error: 'UNAUTHORIZED', message: 'expired', timestamp: 'now' }, { status: 401, statusText: 'Unauthorized' });
    await promise;
    expect(storage.get()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('resolves immediately without a token', async () => {
    await service.loadStoredSession();
    expect(service.isAuthenticated()).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — `token-storage` and the real `auth.service` don't exist yet.

- [ ] **Step 3: Implement TokenStorage and AuthService**

`src/app/core/auth/token-storage.ts`:
```ts
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'buy01.token';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
```

`src/app/core/auth/auth.service.ts` (replaces the stub):
```ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import type { LoginResponse, RegisterRequest } from '../models/auth.model';
import type { Role, User } from '../models/user.model';
import { TokenStorage } from './token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorage);
  private readonly apiUrl = '/api';

  private readonly userSignal = signal<User | null>(null);

  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly role = computed<Role | null>(() => this.userSignal()?.role ?? null);
  readonly isSeller = computed(() => this.role() === 'SELLER');

  get token(): string | null {
    return this.tokenStorage.get();
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => this.tokenStorage.set(res.token)),
      switchMap(() => this.http.get<User>(`${this.apiUrl}/users/me`)),
      tap((user) => this.userSignal.set(user)),
    );
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<User>(`${this.apiUrl}/auth/register`, payload)
      .pipe(switchMap(() => this.login(payload.email, payload.password)));
  }

  logout(): void {
    this.tokenStorage.clear();
    this.userSignal.set(null);
  }

  setCurrentUser(user: User | null): void {
    this.userSignal.set(user);
  }

  async loadStoredSession(): Promise<void> {
    if (!this.token) {
      this.userSignal.set(null);
      return;
    }
    try {
      const user = await firstValueFrom(this.http.get<User>(`${this.apiUrl}/users/me`));
      this.userSignal.set(user);
    } catch {
      this.logout();
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — token-storage (3) + auth.service (7) tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/auth
git commit -m "feat: add auth service with token storage"
```

---

### Task 4: User, Product and Media services

**Files:**
- Create: `src/app/core/services/user.service.ts`
- Create: `src/app/core/services/user.service.spec.ts`
- Create: `src/app/core/services/product.service.ts`
- Create: `src/app/core/services/product.service.spec.ts`
- Create: `src/app/core/services/media.service.ts`
- Create: `src/app/core/services/media.service.spec.ts`

**Interfaces:**
- Consumes: `User`, `Product`, `ProductPayload`, `Media` (Task 2)
- Produces:
  - `UserService` (`providedIn: 'root'`):
    - `me(): Observable<User>` — GET `/api/users/me`
    - `updateProfile(body: { firstName?: string; avatar?: string }): Observable<User>` — PUT `/api/users/me`
    - `uploadAvatar(file: File): Observable<User>` — POST `/api/media/upload` (FormData `file`, no `productId`), then `updateProfile({ avatar: '/api/media/{media.id}' })`
  - `ProductService` (`providedIn: 'root'`):
    - `list(): Observable<Product[]>` — GET `/api/products`
    - `get(id: string): Observable<Product>` — GET `/api/products/{id}`
    - `create(payload: ProductPayload): Observable<Product>` — POST `/api/products`
    - `update(id: string, payload: Partial<ProductPayload>): Observable<Product>` — PUT `/api/products/{id}`
    - `delete(id: string): Observable<void>` — DELETE `/api/products/{id}`
  - `MediaService` (`providedIn: 'root'`):
    - `upload(file: File, productId?: string): Observable<Media>` — POST `/api/media/upload`, FormData field `file`, query param `productId` only when provided
    - `listByProduct(productId: string): Observable<Media[]>` — GET `/api/media/product/{productId}`
    - `get(id: string): Observable<Media>` — GET `/api/media/{id}`
    - `delete(id: string): Observable<void>` — DELETE `/api/media/{id}`
    - `url(id: string): string` — returns `/api/media/{id}`

- [ ] **Step 1: Write the failing service tests**

`src/app/core/services/user.service.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { User } from '../models/user.model';
import { UserService } from './user.service';

const user: User = {
  id: 'u1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'SELLER',
  avatar: null,
  createdAt: '2025-07-29T10:00:00',
  updatedAt: '2025-07-29T10:00:00',
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the profile', async () => {
    const promise = firstValueFrom(service.me());
    const req = http.expectOne('/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush(user);
    await expect(promise).resolves.toEqual(user);
  });

  it('updates the profile', async () => {
    const promise = firstValueFrom(service.updateProfile({ firstName: 'Johnny' }));
    const req = http.expectOne('/api/users/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ firstName: 'Johnny' });
    req.flush({ ...user, firstName: 'Johnny' });
    await expect(promise).resolves.toMatchObject({ firstName: 'Johnny' });
  });

  it('uploads an avatar and stores its URL', async () => {
    const file = new File(['x'], 'me.png', { type: 'image/png' });
    const promise = firstValueFrom(service.uploadAvatar(file));

    const uploadReq = http.expectOne((r) => r.url === '/api/media/upload' && r.method === 'POST');
    expect(uploadReq.request.body).toBeInstanceOf(FormData);
    expect((uploadReq.request.body as FormData).get('file')).toBe(file);
    expect(uploadReq.request.params.has('productId')).toBe(false);
    uploadReq.flush({
      id: 'm1',
      filename: 'me.png',
      originalName: 'me.png',
      contentType: 'image/png',
      size: 1,
      productId: null,
      sellerId: 'u1',
      createdAt: '2025-07-29T12:00:00',
    });

    const updateReq = http.expectOne('/api/users/me');
    expect(updateReq.request.body).toEqual({ avatar: '/api/media/m1' });
    updateReq.flush({ ...user, avatar: '/api/media/m1' });

    await expect(promise).resolves.toMatchObject({ avatar: '/api/media/m1' });
  });
});
```

`src/app/core/services/product.service.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists products', async () => {
    const promise = firstValueFrom(service.list());
    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    await expect(promise).resolves.toEqual([]);
  });

  it('creates a product', async () => {
    const payload = { name: 'MacBook Pro', description: '16 pouces', price: 2499.99 };
    const promise = firstValueFrom(service.create(payload));
    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'p1', ...payload, sellerId: 'u1', mediaIds: [], createdAt: 'now', updatedAt: 'now' });
    await expect(promise).resolves.toMatchObject({ id: 'p1', price: 2499.99 });
  });

  it('updates a product', async () => {
    const promise = firstValueFrom(service.update('p1', { price: 2299.99 }));
    const req = http.expectOne('/api/products/p1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ price: 2299.99 });
    req.flush({ id: 'p1', name: 'MacBook Pro', description: '16 pouces', price: 2299.99, sellerId: 'u1', mediaIds: [], createdAt: 'now', updatedAt: 'now' });
    await promise;
  });

  it('deletes a product', async () => {
    const promise = firstValueFrom(service.delete('p1'));
    const req = http.expectOne('/api/products/p1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await promise;
  });
});
```

`src/app/core/services/media.service.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MediaService } from './media.service';

const media = {
  id: 'm1',
  filename: 'abc.jpg',
  originalName: 'photo.jpg',
  contentType: 'image/jpeg',
  size: 123456,
  productId: 'p1',
  sellerId: 'u1',
  createdAt: '2025-07-29T12:00:00',
};

describe('MediaService', () => {
  let service: MediaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MediaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uploads a file with a productId', async () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const promise = firstValueFrom(service.upload(file, 'p1'));
    const req = http.expectOne((r) => r.url === '/api/media/upload' && r.method === 'POST');
    expect((req.request.body as FormData).get('file')).toBe(file);
    expect(req.request.params.get('productId')).toBe('p1');
    req.flush(media);
    await expect(promise).resolves.toEqual(media);
  });

  it('uploads a file without a productId', async () => {
    const file = new File(['x'], 'me.png', { type: 'image/png' });
    const promise = firstValueFrom(service.upload(file));
    const req = http.expectOne((r) => r.url === '/api/media/upload' && r.method === 'POST');
    expect(req.request.params.has('productId')).toBe(false);
    req.flush({ ...media, productId: null });
    await promise;
  });

  it('lists media by product', async () => {
    const promise = firstValueFrom(service.listByProduct('p1'));
    const req = http.expectOne('/api/media/product/p1');
    expect(req.request.method).toBe('GET');
    req.flush([media]);
    await expect(promise).resolves.toEqual([media]);
  });

  it('deletes a media', async () => {
    const promise = firstValueFrom(service.delete('m1'));
    const req = http.expectOne('/api/media/m1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await promise;
  });

  it('builds the image URL', () => {
    expect(service.url('m1')).toBe('/api/media/m1');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — services don't exist.

- [ ] **Step 3: Implement the services**

`src/app/core/services/user.service.ts`:
```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import type { Media } from '../models/media.model';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  updateProfile(body: { firstName?: string; avatar?: string }): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, body);
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Media>(`${this.apiUrl}/media/upload`, formData).pipe(
      switchMap((media) => this.updateProfile({ avatar: `${this.apiUrl}/media/${media.id}` })),
    );
  }
}
```

`src/app/core/services/product.service.ts`:
```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Product, ProductPayload } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  get(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  create(payload: ProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, payload);
  }

  update(id: string, payload: Partial<ProductPayload>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
```

`src/app/core/services/media.service.ts`:
```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Media } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  upload(file: File, productId?: string): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    const params = productId ? { productId } : {};
    return this.http.post<Media>(`${this.apiUrl}/media/upload`, formData, { params });
  }

  listByProduct(productId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${this.apiUrl}/media/product/${productId}`);
  }

  get(id: string): Observable<Media> {
    return this.http.get<Media>(`${this.apiUrl}/media/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/${id}`);
  }

  url(id: string): string {
    return `${this.apiUrl}/media/${id}`;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — user (3) + product (4) + media (5) service tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/core/services
git commit -m "feat: add user, product and media services"
```

---

### Task 5: Guards and HTTP interceptors

**Files:**
- Create: `src/app/core/auth/auth.guard.ts`
- Create: `src/app/core/auth/auth.guard.spec.ts`
- Create: `src/app/core/auth/seller.guard.ts`
- Create: `src/app/core/auth/seller.guard.spec.ts`
- Create: `src/app/core/auth/jwt.interceptor.ts` (replaces the Task 1 stub)
- Create: `src/app/core/auth/jwt.interceptor.spec.ts`
- Create: `src/app/core/auth/http-error.interceptor.ts` (replaces the Task 1 stub)
- Create: `src/app/core/auth/http-error.interceptor.spec.ts`

**Interfaces:**
- Consumes: `AuthService`, `TokenStorage` (Task 3)
- Produces:
  - `authGuard: CanActivateFn` — `true` when `auth.token` is set, else `UrlTree('/login')`
  - `sellerGuard: CanActivateFn` — `true` when `auth.isSeller()`, else `UrlTree('/products')`
  - `jwtInterceptor: HttpInterceptorFn` — clones request with `Authorization: Bearer <token>` when a token exists
  - `httpErrorInterceptor: HttpInterceptorFn` — on error: if 401 and the request URL is **not** `/auth/login` or `/auth/register`, calls `auth.logout()` + `router.navigate(['/login'])`; if the request URL is not an auth path, shows a French `MatSnackBar` message; rethrows the original error

- [ ] **Step 1: Write the failing tests**

`src/app/core/auth/auth.guard.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStorage } from './token-storage';

describe('authGuard', () => {
  function setup(withToken: boolean) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const storage = TestBed.inject(TokenStorage);
    storage.clear();
    if (withToken) {
      storage.set('abc');
    }
    const router = TestBed.inject(Router);
    return { storage, router };
  }

  it('allows access when a token is present', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects to /login when no token is present', () => {
    const { router } = setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
```

`src/app/core/auth/seller.guard.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import type { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { sellerGuard } from './seller.guard';

const user = (role: User['role']): User => ({
  id: 'u1',
  email: 'a@b.com',
  firstName: 'A',
  lastName: 'B',
  role,
  avatar: null,
  createdAt: 'now',
  updatedAt: 'now',
});

describe('sellerGuard', () => {
  function setup(role: User['role'] | null) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const auth = TestBed.inject(AuthService);
    if (role) {
      auth.setCurrentUser(user(role));
    }
    const router = TestBed.inject(Router);
    return { auth, router };
  }

  it('allows sellers', () => {
    setup('SELLER');
    const result = TestBed.runInInjectionContext(() => sellerGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects clients to /products', () => {
    const { router } = setup('CLIENT');
    const result = TestBed.runInInjectionContext(() => sellerGuard({} as never, {} as never));
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/products');
  });

  it('redirects anonymous users to /products', () => {
    const { router } = setup(null);
    const result = TestBed.runInInjectionContext(() => sellerGuard({} as never, {} as never));
    expect(router.serializeUrl(result as UrlTree)).toBe('/products');
  });
});
```

`src/app/core/auth/jwt.interceptor.spec.ts`:
```ts
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenStorage } from './token-storage';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([jwtInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(TokenStorage);
  });

  afterEach(() => httpMock.verify());

  it('adds the Bearer header when a token exists', async () => {
    storage.set('abc');
    const promise = firstValueFrom(http.get('/api/test'));
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush(null);
    await promise;
  });

  it('does not add the header without a token', async () => {
    const promise = firstValueFrom(http.get('/api/test'));
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush(null);
    await promise;
  });
});
```

`src/app/core/auth/http-error.interceptor.spec.ts`:
```ts
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { httpErrorInterceptor } from './http-error.interceptor';
import { TokenStorage } from './token-storage';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackbar: { open: ReturnType<typeof vi.fn> };
  let storage: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    snackbar = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackbar },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    storage = TestBed.inject(TokenStorage);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  it('logs out and redirects to /login on a non-auth 401', async () => {
    storage.set('abc');
    const promise = firstValueFrom(http.get('/api/users/me'));
    const req = httpMock.expectOne('/api/users/me');
    req.flush({ error: 'UNAUTHORIZED', message: 'expired', timestamp: 'now' }, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).rejects.toMatchObject({ status: 401 });
    expect(storage.get()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(snackbar.open).toHaveBeenCalled();
  });

  it('does not redirect or snackbar on a 401 from /auth/login', async () => {
    const promise = firstValueFrom(http.post('/api/auth/login', {}));
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ error: 'BAD_CREDENTIALS', message: 'bad', timestamp: 'now' }, { status: 401, statusText: 'Unauthorized' });

    await expect(promise).rejects.toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(snackbar.open).not.toHaveBeenCalled();
  });

  it('does not snackbar errors from /auth/register', async () => {
    const promise = firstValueFrom(http.post('/api/auth/register', {}));
    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ error: 'EMAIL_ALREADY_EXISTS', message: 'exists', timestamp: 'now' }, { status: 409, statusText: 'Conflict' });

    await expect(promise).rejects.toBeTruthy();
    expect(snackbar.open).not.toHaveBeenCalled();
  });

  it('shows a French message for a non-auth 409', async () => {
    const promise = firstValueFrom(http.post('/api/products', {}));
    const req = httpMock.expectOne('/api/products');
    req.flush({ error: 'X', message: 'y', timestamp: 'now' }, { status: 409, statusText: 'Conflict' });

    await expect(promise).rejects.toBeTruthy();
    expect(snackbar.open).toHaveBeenCalledWith('Un compte existe déjà avec cet email.', 'Fermer', expect.any(Object));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — guards/interceptors don't exist yet.

- [ ] **Step 3: Implement guards and interceptors**

`src/app/core/auth/auth.guard.ts`:
```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.token) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
```

`src/app/core/auth/seller.guard.ts`:
```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isSeller()) {
    return true;
  }
  return router.createUrlTree(['/products']);
};
```

`src/app/core/auth/jwt.interceptor.ts`:
```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

`src/app/core/auth/http-error.interceptor.ts`:
```ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import type { ApiError } from '../models/api-error.model';
import { AuthService } from './auth.service';

const AUTH_PATHS = ['/auth/login', '/auth/register'];

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

function toFrenchMessage(status: number, apiError: ApiError | null): string {
  if (status === 409) return 'Un compte existe déjà avec cet email.';
  if (status === 403) return 'Accès refusé.';
  if (status === 401) return 'Votre session a expiré, veuillez vous reconnecter.';
  if (status === 404) return 'Ressource introuvable.';
  if (status === 400) return apiError?.message ?? 'Requête invalide.';
  if (status >= 500) return 'Erreur serveur. Veuillez réessayer plus tard.';
  return apiError?.message ?? 'Une erreur est survenue.';
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError | null = error.error as ApiError;
      if (error.status === 401 && !isAuthPath(req.url)) {
        auth.logout();
        void router.navigate(['/login']);
      }
      if (!isAuthPath(req.url)) {
        snackbar.open(toFrenchMessage(error.status, apiError), 'Fermer', { duration: 5000 });
      }
      return throwError(() => error);
    }),
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — guards (5) + interceptors (6) tests green.

- [ ] **Step 5: Verify the full app still builds**

Run: `ng build`
Expected: success — `app.config.ts` now resolves the real `AuthService` and interceptors.

- [ ] **Step 6: Commit**

```bash
git add src/app/core/auth
git commit -m "feat: add auth and seller guards with HTTP interceptors"
```

---

### Task 6: Shared components — media-upload, avatar, confirm dialog

**Files:**
- Create: `src/app/shared/media-upload/media-upload.ts`
- Create: `src/app/shared/media-upload/media-upload.html`
- Create: `src/app/shared/media-upload/media-upload.spec.ts`
- Create: `src/app/shared/avatar/avatar.ts`
- Create: `src/app/shared/avatar/avatar.spec.ts`
- Create: `src/app/shared/confirm-dialog/confirm-dialog.ts`

**Interfaces:**
- Consumes: `validateMediaFile`, `ALLOWED_MEDIA_TYPES` (Task 2)
- Produces:
  - `MediaUpload` component: `label = input('Choisir un fichier')`, `selected = output<File>()`, internal `error` signal; emits the validated `File`, otherwise sets a French inline error
  - `Avatar` component: `src = input<string | null>(null)`, `name = input('')`, `size = input(40)`; renders `img` when `src` is set, else initials circle
  - `ConfirmDialogData { title: string; message: string; confirmLabel?: string; cancelLabel?: string }`
  - `ConfirmDialog` component (Material dialog)
  - `ConfirmDialogService` (`providedIn: 'root'`): `confirm(data: ConfirmDialogData): Observable<boolean>` — opens the dialog, returns `afterClosed`

- [ ] **Step 1: Write the failing tests**

`src/app/shared/media-upload/media-upload.spec.ts`:
```ts
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed } from '@angular/core/testing';
import { MediaUpload } from './media-upload';

describe('MediaUpload', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [MediaUpload],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    const fixture = TestBed.createComponent(MediaUpload);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  function triggerChange(fixture: { nativeElement: HTMLElement }, file: File) {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
  }

  it('emits a valid file and clears the error', async () => {
    const { fixture, component } = await setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    triggerChange(fixture, file);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(file);
  });

  it('shows a size error for oversized files and does not emit', async () => {
    const { fixture, component } = await setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    const big = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    triggerChange(fixture, big);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('2 Mo');
  });

  it('shows a type error for disallowed files and does not emit', async () => {
    const { fixture, component } = await setup();
    const spy = vi.fn();
    component.selected.subscribe(spy);

    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    triggerChange(fixture, pdf);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Format non autorisé');
  });
});
```

`src/app/shared/avatar/avatar.spec.ts`:
```ts
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Avatar } from './avatar';

@Component({
  selector: 'app-host',
  imports: [Avatar],
  template: `<app-avatar [src]="src()" [name]="name()" />`,
})
class Host {
  readonly src = input<string | null>(null);
  readonly name = input('');
}

describe('Avatar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  });

  it('renders the image when src is set', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('src', '/api/media/m1');
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('/api/media/m1');
  });

  it('renders initials when src is null', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentRef.setInput('src', null);
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('JD');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — components don't exist yet.

- [ ] **Step 3: Implement the components**

`src/app/shared/media-upload/media-upload.ts`:
```ts
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { validateMediaFile } from '../../core/validation/media.validators';

@Component({
  selector: 'app-media-upload',
  imports: [MatButton, MatIcon],
  templateUrl: './media-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaUpload {
  readonly label = input('Choisir un fichier');
  readonly selected = output<File>();

  protected readonly error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const validationError = validateMediaFile(file);
    if (validationError) {
      this.error.set(validationError);
      return;
    }
    this.error.set(null);
    this.selected.emit(file);
  }
}
```

`src/app/shared/media-upload/media-upload.html`:
```html
<input
  #fileInput
  type="file"
  accept="image/jpeg,image/png,image/gif,image/webp"
  class="hidden"
  (change)="onFileSelected($event)"
/>
<button mat-raised-button color="primary" type="button" (click)="fileInput.click()">
  <mat-icon>upload</mat-icon>
  <span>{{ label() }}</span>
</button>
@if (error(); as message) {
  <p class="mt-2 text-sm text-red-600" role="alert">{{ message }}</p>
}
```

`src/app/shared/avatar/avatar.ts`:
```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  template: `
    @if (src(); as imageSrc) {
      <img
        [src]="imageSrc"
        [style.width.px]="size()"
        [style.height.px]="size()"
        [alt]="'Avatar de ' + name()"
        class="rounded-full object-cover"
      />
    } @else {
      <div
        [style.width.px]="size()"
        [style.height.px]="size()"
        class="flex items-center justify-center rounded-full bg-indigo-500 font-medium text-white"
        aria-hidden="true"
      >
        {{ initials() }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  readonly src = input<string | null>(null);
  readonly name = input('');
  readonly size = input(40);

  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });
}
```

`src/app/shared/confirm-dialog/confirm-dialog.ts`:
```ts
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelLabel ?? 'Annuler' }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ data.confirmLabel ?? 'Confirmer' }}</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialog, { data, width: '420px' });
    return ref.afterClosed();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — media-upload (3) + avatar (2) tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/shared
git commit -m "feat: add shared media-upload, avatar and confirm dialog components"
```

---

### Task 7: Login page and route

**Files:**
- Create: `src/app/features/auth/login/login.page.ts`
- Create: `src/app/features/auth/login/login.page.html`
- Create: `src/app/features/auth/login/login.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService` (Task 3)
- Produces:
  - `LoginPage` lazy-loaded component at route `login`
  - Route table `app.routes.ts` now contains the `login` route

- [ ] **Step 1: Write the failing test**

`src/app/features/auth/login/login.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import type { User } from '../../../core/models/user.model';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function setup(role: User['role']) {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'john@example.com', password: 'secret123' });
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const loginReq = http.expectOne('/api/auth/login');
    loginReq.flush({ token: 'abc' });
    const meReq = http.expectOne('/api/users/me');
    meReq.flush({
      id: 'u1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role,
      avatar: null,
      createdAt: 'now',
      updatedAt: 'now',
    });

    await fixture.whenStable();
    return { router, navigateSpy, fixture };
  }

  it('redirects a seller to /seller/products after login', async () => {
    const { navigateSpy } = await setup('SELLER');
    expect(navigateSpy).toHaveBeenCalledWith(['/seller/products']);
  });

  it('redirects a client to /products after login', async () => {
    const { navigateSpy } = await setup('CLIENT');
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('shows an error message on invalid credentials', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ email: 'john@example.com', password: 'wrong' });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectOne('/api/auth/login').flush(
      { error: 'BAD_CREDENTIALS', message: 'bad', timestamp: 'now' },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Email ou mot de passe incorrect.');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ng test --watch=false`
Expected: FAIL — `LoginPage` doesn't exist.

- [ ] **Step 3: Implement the login page**

`src/app/features/auth/login/login.page.ts`:
```ts
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCard, MatCardContent, MatFormField, MatLabel, MatInput, MatError, MatButton, RouterLink],
  templateUrl: './login.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  protected readonly errorMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    try {
      await firstValueFrom(this.auth.login(email!, password!));
      await this.router.navigate([this.auth.isSeller() ? '/seller/products' : '/products']);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.errorMessage.set('Email ou mot de passe incorrect.');
      } else {
        this.errorMessage.set('Connexion impossible. Veuillez réessayer.');
      }
    }
  }
}
```

`src/app/features/auth/login/login.page.html`:
```html
<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
  <mat-card class="w-full max-w-md">
    <mat-card-content class="flex flex-col gap-6 p-8">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Connexion</h1>
        <p class="mt-1 text-gray-600">Accédez à votre compte Buy-01</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.touched && form.controls.email.hasError('required')) {
            <mat-error>L'email est requis.</mat-error>
          } @else if (form.controls.email.touched && form.controls.email.hasError('email')) {
            <mat-error>Adresse email invalide.</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Mot de passe</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="current-password" />
          @if (form.controls.password.touched && form.controls.password.hasError('required')) {
            <mat-error>Le mot de passe est requis.</mat-error>
          }
        </mat-form-field>
        @if (errorMessage(); as message) {
          <p class="text-sm text-red-600" role="alert">{{ message }}</p>
        }
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Se connecter
        </button>
      </form>
      <p class="text-center text-sm text-gray-600">
        Pas encore de compte ?
        <a routerLink="/register" class="font-medium text-indigo-600 hover:underline">S'inscrire</a>
      </p>
    </mat-card-content>
  </mat-card>
</div>
```

`src/app/app.routes.ts`:
```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — login page tests (3) green.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/auth/login src/app/app.routes.ts
git commit -m "feat: add login page"
```

---

### Task 8: Register page and route

**Files:**
- Create: `src/app/features/auth/register/register.page.ts`
- Create: `src/app/features/auth/register/register.page.html`
- Create: `src/app/features/auth/register/register.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService`, `UserService` (Tasks 3–4), `passwordMatchValidator` (Task 2), `MediaUpload` (Task 6)
- Produces:
  - `RegisterPage` lazy-loaded component at route `register`
  - Route table gains the `register` route

Flow: submit → `auth.register(payload)` (register then auto-login) → if SELLER and avatar selected: `userService.uploadAvatar(file)` then `auth.setCurrentUser(updated)` (on failure show a warning snackbar, still navigate) → navigate to `/seller/products` (seller) or `/products` (client). On 409: inline error « Un compte existe déjà avec cet email. ».

- [ ] **Step 1: Write the failing test**

`src/app/features/auth/register/register.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  it('registers a seller and redirects to the seller dashboard', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    fixture.componentInstance.role.set('SELLER');
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectOne('/api/auth/register').flush({ id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'SELLER', avatar: null, createdAt: 'now', updatedAt: 'now' });
    http.expectOne('/api/auth/login').flush({ token: 'abc' });
    http.expectOne('/api/users/me').flush({ id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'SELLER', avatar: null, createdAt: 'now', updatedAt: 'now' });
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/seller/products']);
  });

  it('shows an inline error when the email is already used', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'taken@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http
      .expectOne('/api/auth/register')
      .flush({ error: 'EMAIL_ALREADY_EXISTS', message: 'exists', timestamp: 'now' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Un compte existe déjà avec cet email.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not submit when passwords do not match', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    http.expectNone('/api/auth/register');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ng test --watch=false`
Expected: FAIL — `RegisterPage` doesn't exist.

- [ ] **Step 3: Implement the register page**

`src/app/features/auth/register/register.page.ts`:
```ts
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { Role } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { passwordMatchValidator } from '../../../core/validation/password.validators';
import { MediaUpload } from '../../../shared/media-upload/media-upload';
import { Avatar } from '../../../shared/avatar/avatar';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    RouterLink,
    MediaUpload,
    Avatar,
  ],
  templateUrl: './register.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly snackbar = inject(MatSnackBar);

  readonly form = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: [passwordMatchValidator] },
  );

  readonly role = signal<Role>('CLIENT');
  protected readonly avatarFile = signal<File | null>(null);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    try {
      await firstValueFrom(
        this.auth.register({
          email: value.email!,
          password: value.password!,
          firstName: value.firstName!,
          lastName: value.lastName!,
          role: this.role(),
        }),
      );
      const file = this.avatarFile();
      if (file) {
        try {
          const updated = await firstValueFrom(this.userService.uploadAvatar(file));
          this.auth.setCurrentUser(updated);
        } catch {
          this.snackbar.open('Compte créé, mais l'avatar n'a pas pu être enregistré.', 'Fermer', { duration: 5000 });
        }
      }
      await this.router.navigate([this.auth.isSeller() ? '/seller/products' : '/products']);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.errorMessage.set('Un compte existe déjà avec cet email.');
      } else {
        this.errorMessage.set('Inscription impossible. Veuillez réessayer.');
      }
    } finally {
      this.submitting.set(false);
    }
  }

  setRole(role: Role): void {
    this.role.set(role);
  }

  onAvatarSelected(file: File): void {
    this.avatarFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
```

`src/app/features/auth/register/register.page.html`:
```html
<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
  <mat-card class="w-full max-w-md">
    <mat-card-content class="flex flex-col gap-6 p-8">
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Créer un compte</h1>
        <p class="mt-1 text-gray-600">Rejoignez Buy-01</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName" autocomplete="given-name" />
            @if (form.controls.firstName.touched && form.controls.firstName.hasError('required')) {
              <mat-error>Le prénom est requis.</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lastName" autocomplete="family-name" />
            @if (form.controls.lastName.touched && form.controls.lastName.hasError('required')) {
              <mat-error>Le nom est requis.</mat-error>
            }
          </mat-form-field>
        </div>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          @if (form.controls.email.touched && form.controls.email.hasError('required')) {
            <mat-error>L'email est requis.</mat-error>
          } @else if (form.controls.email.touched && form.controls.email.hasError('email')) {
            <mat-error>Adresse email invalide.</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Mot de passe</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password" />
          @if (form.controls.password.touched && form.controls.password.hasError('required')) {
            <mat-error>Le mot de passe est requis.</mat-error>
          } @else if (form.controls.password.touched && form.controls.password.hasError('minlength')) {
            <mat-error>Le mot de passe doit contenir au moins 8 caractères.</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Confirmer le mot de passe</mat-label>
          <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
          @if (form.controls.confirmPassword.touched && form.controls.confirmPassword.hasError('required')) {
            <mat-error>La confirmation est requise.</mat-error>
          } @else if (form.touched && form.hasError('passwordMismatch')) {
            <mat-error>Les mots de passe ne correspondent pas.</mat-error>
          }
        </mat-form-field>

        <mat-button-toggle-group
          [value]="role()"
          (valueChange)="setRole($event)"
          aria-label="Type de compte"
          class="justify-center"
        >
          <mat-button-toggle value="CLIENT">Acheteur</mat-button-toggle>
          <mat-button-toggle value="SELLER">Vendeur</mat-button-toggle>
        </mat-button-toggle-group>

        @if (role() === 'SELLER') {
          <div class="flex flex-col items-center gap-3">
            @if (avatarPreview(); as preview) {
              <img [src]="preview" alt="Aperçu de votre avatar" class="h-20 w-20 rounded-full object-cover" />
            } @else {
              <app-avatar [src]="null" [name]="firstNamePreview()" [size]="80" />
            }
            <app-media-upload label="Choisir un avatar" (selected)="onAvatarSelected($event)" />
            <p class="text-xs text-gray-500">Optionnel — JPEG, PNG, GIF ou WebP, 2 Mo maximum.</p>
          </div>
        }

        @if (errorMessage(); as message) {
          <p class="text-sm text-red-600" role="alert">{{ message }}</p>
        }
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
          Créer le compte
        </button>
      </form>
      <p class="text-center text-sm text-gray-600">
        Déjà un compte ?
        <a routerLink="/login" class="font-medium text-indigo-600 hover:underline">Se connecter</a>
      </p>
    </mat-card-content>
  </mat-card>
</div>
```

`src/app/features/auth/register/register.page.ts` needs a `firstNamePreview()` helper for the avatar placeholder; add it:
```ts
  protected readonly firstNamePreview = () => this.form.controls.firstName.value ?? '';
```

`src/app/app.routes.ts` — add after the `login` route:
```ts
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then((m) => m.RegisterPage),
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — register page tests (3) green.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/auth/register src/app/app.routes.ts
git commit -m "feat: add register page"
```

---

### Task 9: Public product listing and route

**Files:**
- Create: `src/app/features/products/product-list/product-list.page.ts`
- Create: `src/app/features/products/product-list/product-list.page.html`
- Create: `src/app/features/products/product-list/product-list.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `ProductService`, `MediaService` (Task 4), `AuthService` (Task 3)
- Produces:
  - `ProductListPage` lazy-loaded component at route `products` (also the default redirect target)
  - Route table gains `products` route and the catch-all redirect

Behavior: header with app name; when authenticated show "Espace vendeur" (sellers only), user first name and a logout button; when anonymous show "Connexion" / "S'inscrire". Grid of product cards (first image via `mediaService.url(mediaIds[0])`, name, description, price with `currency: 'EUR'`). Loading spinner, empty state, error state.

- [ ] **Step 1: Write the failing test**

`src/app/features/products/product-list/product-list.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import type { Product } from '../../../core/models/product.model';
import { ProductListPage } from './product-list.page';

const products: Product[] = [
  {
    id: 'p1',
    name: 'MacBook Pro',
    description: '16 pouces',
    price: 2499.99,
    sellerId: 'u1',
    mediaIds: ['m1'],
    createdAt: 'now',
    updatedAt: 'now',
  },
];

describe('ProductListPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductListPage, CurrencyPipe],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNoopAnimations(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders the products returned by the API', async () => {
    const fixture = TestBed.createComponent(ProductListPage);
    fixture.detectChanges();

    const req = http.expectOne('/api/products');
    req.flush(products);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('MacBook Pro');
    const img = fixture.nativeElement.querySelector('img[alt="MacBook Pro"]') as HTMLImageElement;
    expect(img?.getAttribute('src')).toBe('/api/media/m1');
  });

  it('shows the empty state when there are no products', async () => {
    const fixture = TestBed.createComponent(ProductListPage);
    fixture.detectChanges();
    http.expectOne('/api/products').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aucun produit');
  });

  it('shows a login link for anonymous visitors', async () => {
    const fixture = TestBed.createComponent(ProductListPage);
    fixture.detectChanges();
    http.expectOne('/api/products').flush(products);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Connexion');
  });
});
```
Note: the page loads products in its constructor; the test must flush the request before `whenStable()` resolves.

- [ ] **Step 2: Run test to verify it fails**

Run: `ng test --watch=false`
Expected: FAIL — `ProductListPage` doesn't exist.

- [ ] **Step 3: Implement the product listing**

`src/app/features/products/product-list/product-list.page.ts`:
```ts
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { Product } from '../../../core/models/product.model';
import { MediaService } from '../../../core/services/media.service';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [MatCard, MatCardContent, MatButton, MatProgressSpinner, CurrencyPipe, RouterLink],
  templateUrl: './product-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage {
  private readonly productService = inject(ProductService);
  private readonly mediaService = inject(MediaService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  mediaUrl(mediaId: string): string {
    return this.mediaService.url(mediaId);
  }

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.products.set(await firstValueFrom(this.productService.list()));
    } catch {
      this.error.set('Impossible de charger les produits.');
    } finally {
      this.loading.set(false);
    }
  }
}
```

`src/app/features/products/product-list/product-list.page.html`:
```html
<div class="min-h-screen bg-gray-50">
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <span class="text-xl font-semibold text-indigo-600">Buy-01</span>
      <nav class="flex items-center gap-4">
        @if (auth.isAuthenticated()) {
          @if (auth.isSeller()) {
            <a routerLink="/seller/products" class="text-sm font-medium text-gray-700 hover:text-indigo-600">
              Espace vendeur
            </a>
          }
          <span class="text-sm text-gray-600">{{ auth.currentUser()?.firstName }}</span>
          <button mat-button type="button" (click)="logout()">Déconnexion</button>
        } @else {
          <a routerLink="/login" class="text-sm font-medium text-gray-700 hover:text-indigo-600">Connexion</a>
          <a routerLink="/register"><button mat-flat-button color="primary" type="button">S'inscrire</button></a>
        }
      </nav>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-semibold text-gray-900">Tous les produits</h1>

    @if (loading()) {
      <div class="flex justify-center py-16">
        <mat-progress-spinner diameter="40" />
      </div>
    } @else if (error(); as message) {
      <p class="text-red-600" role="alert">{{ message }}</p>
    } @else if (products().length === 0) {
      <p class="text-gray-600">Aucun produit disponible pour le moment.</p>
    } @else {
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (product of products(); track product.id) {
          <mat-card class="overflow-hidden">
            <div class="aspect-square bg-gray-100">
              @if (product.mediaIds.length > 0) {
                <img [src]="mediaUrl(product.mediaIds[0])" [alt]="product.name" class="h-full w-full object-cover" />
              } @else {
                <div class="flex h-full w-full items-center justify-center text-gray-400" aria-hidden="true">
                  Aucune image
                </div>
              </div>
            }
            <mat-card-content class="flex flex-col gap-1 p-4">
              <h2 class="font-medium text-gray-900">{{ product.name }}</h2>
              <p class="text-sm text-gray-600">{{ product.description }}</p>
              <p class="mt-1 text-lg font-semibold text-indigo-600">{{ product.price | currency: 'EUR' }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  </main>
</div>
```

`src/app/app.routes.ts` — add after the `register` route:
```ts
  { path: 'products', loadComponent: () => import('./features/products/product-list/product-list.page').then((m) => m.ProductListPage) },
```
And add the catch-all last:
```ts
  { path: '**', redirectTo: '/products' },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — product-list tests (3) green.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/products src/app/app.routes.ts
git commit -m "feat: add public product listing"
```

---

### Task 10: Seller layout, product dashboard and product form

**Files:**
- Create: `src/app/features/seller/seller-layout/seller-layout.ts`
- Create: `src/app/features/seller/seller-layout/seller-layout.html`
- Create: `src/app/features/seller/seller-layout/seller-layout.spec.ts`
- Create: `src/app/features/seller/product-form/product-form.ts`
- Create: `src/app/features/seller/product-form/product-form.html`
- Create: `src/app/features/seller/product-form/product-form.spec.ts`
- Create: `src/app/features/seller/my-products/my-products.page.ts`
- Create: `src/app/features/seller/my-products/my-products.page.html`
- Create: `src/app/features/seller/my-products/my-products.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService`, `ProductService`, `MediaService` (Tasks 3–4), `ConfirmDialogService` (Task 6)
- Produces:
  - `SellerLayout` lazy-loaded component at route `seller` (guarded by `sellerGuard`, has child routes `products` and `media`)
  - `ProductForm` dialog component; `ProductFormData { product?: Product }`; opens via `MatDialog`, closes with `true` after successful save
  - `MyProductsPage` (child route `seller/products`): lists the current seller's products (filtered client-side on `sellerId`), with create/edit/delete actions
  - Route table gains the `seller` parent route with `sellerGuard` and children

- [ ] **Step 1: Write the failing tests**

`src/app/features/seller/seller-layout/seller-layout.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import type { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { SellerLayout } from './seller-layout';

describe('SellerLayout', () => {
  it('shows navigation links and the user menu', async () => {
    TestBed.configureTestingModule({
      imports: [SellerLayout],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([{ path: 'seller/products', component: SellerLayout }]),
      ],
    });
    const auth = TestBed.inject(AuthService);
    const user: User = {
      id: 'u1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'SELLER',
      avatar: null,
      createdAt: 'now',
      updatedAt: 'now',
    };
    auth.setCurrentUser(user);

    const fixture = TestBed.createComponent(SellerLayout);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Mes produits');
    expect(fixture.nativeElement.textContent).toContain('Mes médias');
  });
});
```
Note: `SellerLayout` needs `RouterOutlet`; provide a route so the outlet renders. If the template render complains about missing router outlet config, keep the simple route above.

`src/app/features/seller/product-form/product-form.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductForm, ProductFormData } from './product-form';

describe('ProductForm', () => {
  function createFixture(data: ProductFormData) {
    const closeSpy = vi.fn();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProductForm);
    fixture.detectChanges();
    return { fixture, http, closeSpy };
  }

  afterEach(() => {
    const http = TestBed.inject(HttpTestingController);
    http.verify();
  });

  it('creates a product on save', async () => {
    const { fixture, http, closeSpy } = createFixture({});
    fixture.componentInstance.form.setValue({ name: 'Casque', description: 'Audio', price: 89.9 });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const req = http.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Casque', description: 'Audio', price: 89.9 });
    req.flush({ id: 'p1', name: 'Casque', description: 'Audio', price: 89.9, sellerId: 'u1', mediaIds: [], createdAt: 'now', updatedAt: 'now' });
    await fixture.whenStable();

    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('updates a product on save when editing', async () => {
    const existing = { id: 'p1', name: 'Casque', description: 'Audio', price: 89.9, sellerId: 'u1', mediaIds: [], createdAt: 'now', updatedAt: 'now' };
    const { fixture, http, closeSpy } = createFixture({ product: existing });
    fixture.componentInstance.form.setValue({ name: 'Casque Pro', description: 'Audio', price: 99.9 });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const req = http.expectOne('/api/products/p1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Casque Pro', description: 'Audio', price: 99.9 });
    req.flush({ ...existing, name: 'Casque Pro', price: 99.9 });
    await fixture.whenStable();

    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('marks fields invalid when empty', () => {
    const { fixture } = createFixture({});
    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
});
```

`src/app/features/seller/my-products/my-products.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Product } from '../../../core/models/product.model';
import type { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/auth/auth.service';
import { MyProductsPage } from './my-products.page';

const user: User = { id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'SELLER', avatar: null, createdAt: 'now', updatedAt: 'now' };

const allProducts: Product[] = [
  { id: 'p1', name: 'Mien', description: 'a', price: 10, sellerId: 'u1', mediaIds: ['m1'], createdAt: 'now', updatedAt: 'now' },
  { id: 'p2', name: 'Ailleurs', description: 'b', price: 20, sellerId: 'u2', mediaIds: [], createdAt: 'now', updatedAt: 'now' },
];

describe('MyProductsPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyProductsPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows only the current seller products', async () => {
    const auth = TestBed.inject(AuthService);
    auth.setCurrentUser(user);

    const fixture = TestBed.createComponent(MyProductsPage);
    fixture.detectChanges();
    http.expectOne('/api/products').flush(allProducts);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mien');
    expect(fixture.nativeElement.textContent).not.toContain('Ailleurs');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `ng test --watch=false`
Expected: FAIL — components don't exist yet.

- [ ] **Step 3: Implement the seller layout**

`src/app/features/seller/seller-layout/seller-layout.ts`:
```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Avatar } from '../../../shared/avatar/avatar';

@Component({
  selector: 'app-seller-layout',
  imports: [
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatToolbar,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Avatar,
  ],
  templateUrl: './seller-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerLayout {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
```

`src/app/features/seller/seller-layout/seller-layout.html`:
```html
<mat-sidenav-container class="h-screen">
  <mat-sidenav mode="side" opened class="w-64">
    <div class="p-6">
      <span class="text-xl font-semibold text-indigo-600">Buy-01</span>
    </div>
    <nav class="flex flex-col gap-1 px-3">
      <a mat-button routerLink="/seller/products" routerLinkActive="bg-indigo-50 text-indigo-700">Mes produits</a>
      <a mat-button routerLink="/seller/media" routerLinkActive="bg-indigo-50 text-indigo-700">Mes médias</a>
    </nav>
  </mat-sidenav>
  <mat-sidenav-content>
    <mat-toolbar color="primary">
      <span class="flex-1">Espace vendeur</span>
      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="Menu utilisateur">
        <app-avatar [src]="auth.currentUser()?.avatar" [name]="auth.currentUser()?.firstName ?? ''" [size]="32" />
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item routerLink="/account">Mon compte</button>
        <button mat-menu-item (click)="logout()">Déconnexion</button>
      </mat-menu>
    </mat-toolbar>
    <main class="p-6">
      <router-outlet />
    </main>
  </mat-sidenav-content>
</mat-sidenav-container>
```

- [ ] **Step 4: Implement the product form dialog**

`src/app/features/seller/product-form/product-form.ts`:
```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import type { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

export interface ProductFormData {
  product?: Product;
}

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, MatFormField, MatLabel, MatInput, MatError],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductForm {
  private readonly dialogRef = inject(MatDialogRef<ProductForm>);
  private readonly data = inject<ProductFormData>(MAT_DIALOG_DATA);
  private readonly productService = inject(ProductService);
  private readonly snackbar = inject(MatSnackBar);

  protected readonly isEdit = this.data.product !== undefined;

  readonly form = new FormGroup({
    name: new FormControl(this.data.product?.name ?? '', [Validators.required]),
    description: new FormControl(this.data.product?.description ?? '', [Validators.required]),
    price: new FormControl<number | null>(this.data.product?.price ?? null, [Validators.required, Validators.min(0.01)]),
  });

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = { name: value.name!, description: value.description!, price: value.price! };
    try {
      if (this.isEdit) {
        await firstValueFrom(this.productService.update(this.data.product!.id, payload));
      } else {
        await firstValueFrom(this.productService.create(payload));
      }
      this.dialogRef.close(true);
    } catch {
      this.snackbar.open('Enregistrement impossible.', 'Fermer', { duration: 4000 });
    }
  }
}
```
Note: the template uses `[mat-dialog-close]`, hence `MatDialogClose` in the imports above. `product-form.html`:
```html
<h2 mat-dialog-title>{{ isEdit ? 'Modifier le produit' : 'Nouveau produit' }}</h2>
<mat-dialog-content>
  <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4 pt-2">
    <mat-form-field appearance="outline">
      <mat-label>Nom</mat-label>
      <input matInput formControlName="name" />
      @if (form.controls.name.touched && form.controls.name.hasError('required')) {
        <mat-error>Le nom est requis.</mat-error>
      }
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Description</mat-label>
      <textarea matInput rows="3" formControlName="description"></textarea>
      @if (form.controls.description.touched && form.controls.description.hasError('required')) {
        <mat-error>La description est requise.</mat-error>
      }
    </mat-form-field>
    <mat-form-field appearance="outline">
      <mat-label>Prix (EUR)</mat-label>
      <input matInput type="number" step="0.01" min="0.01" formControlName="price" />
      @if (form.controls.price.touched && form.controls.price.hasError('required')) {
        <mat-error>Le prix est requis.</mat-error>
      } @else if (form.controls.price.touched && form.controls.price.hasError('min')) {
        <mat-error>Le prix doit être supérieur à 0.</mat-error>
      }
    </mat-form-field>
  </form>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button [mat-dialog-close]="false">Annuler</button>
  <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" (click)="save()">Enregistrer</button>
</mat-dialog-actions>
```
(Import `MatDialogClose` from `@angular/material/dialog` if `[mat-dialog-close]` needs it — Angular 21 exports it via the dialog imports already used.)

- [ ] **Step 5: Implement the my-products page**

`src/app/features/seller/my-products/my-products.page.ts`:
```ts
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { Product } from '../../../core/models/product.model';
import { MediaService } from '../../../core/services/media.service';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-my-products',
  imports: [MatCard, MatCardContent, MatButton, MatIconButton, MatIcon, MatProgressSpinner, CurrencyPipe],
  templateUrl: './my-products.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProductsPage {
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly mediaService = inject(MediaService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly snackbar = inject(MatSnackBar);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  mediaUrl(mediaId: string): string {
    return this.mediaService.url(mediaId);
  }

  openForm(product?: Product): void {
    const ref = this.dialog.open(ProductForm, { data: { product }, width: '560px' });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) {
        void this.load();
      }
    });
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirm.confirm({
        title: 'Supprimer le produit',
        message: `Voulez-vous vraiment supprimer « ${product.name} » ?`,
        confirmLabel: 'Supprimer',
      }),
    );
    if (!confirmed) {
      return;
    }
    try {
      await firstValueFrom(this.productService.delete(product.id));
      this.snackbar.open('Produit supprimé.', 'Fermer', { duration: 3000 });
      await this.load();
    } catch {
      this.snackbar.open('Suppression impossible.', 'Fermer', { duration: 4000 });
    }
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const all = await firstValueFrom(this.productService.list());
      const sellerId = this.auth.currentUser()?.id;
      this.products.set(all.filter((p) => p.sellerId === sellerId));
    } catch {
      this.snackbar.open('Impossible de charger vos produits.', 'Fermer', { duration: 4000 });
    } finally {
      this.loading.set(false);
    }
  }
}
```

`src/app/features/seller/my-products/my-products.page.html`:
```html
<div class="flex items-center justify-between">
  <h1 class="text-2xl font-semibold text-gray-900">Mes produits</h1>
  <button mat-flat-button color="primary" type="button" (click)="openForm()">
    <mat-icon>add</mat-icon>
    <span>Nouveau produit</span>
  </button>
</div>

@if (loading()) {
  <div class="flex justify-center py-16">
    <mat-progress-spinner diameter="40" />
  </div>
} @else if (products().length === 0) {
  <div class="mt-12 text-center text-gray-600">
    <p>Vous n'avez pas encore de produit.</p>
    <button mat-raised-button color="primary" class="mt-4" type="button" (click)="openForm()">Créer votre premier produit</button>
  </div>
} @else {
  <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    @for (product of products(); track product.id) {
      <mat-card class="overflow-hidden">
        <div class="aspect-square bg-gray-100">
          @if (product.mediaIds.length > 0) {
            <img [src]="mediaUrl(product.mediaIds[0])" [alt]="product.name" class="h-full w-full object-cover" />
          } @else {
            <div class="flex h-full w-full items-center justify-center text-gray-400" aria-hidden="true">Aucune image</div>
          }
        </div>
        <mat-card-content class="flex items-center justify-between p-4">
          <div>
            <h2 class="font-medium text-gray-900">{{ product.name }}</h2>
            <p class="text-sm text-gray-600">{{ product.price | currency: 'EUR' }}</p>
          </div>
          <div class="flex gap-1">
            <button mat-icon-button type="button" (click)="openForm(product)" [attr.aria-label]="'Modifier ' + product.name">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button type="button" (click)="deleteProduct(product)" [attr.aria-label]="'Supprimer ' + product.name">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    }
  </div>
}
```
Note: the template uses `currency` — add `CurrencyPipe` to the `imports` of `MyProductsPage`.

- [ ] **Step 6: Add the routes**

`src/app/app.routes.ts` — add after the `products` route:
```ts
  {
    path: 'seller',
    canActivate: [sellerGuard],
    loadComponent: () => import('./features/seller/seller-layout/seller-layout').then((m) => m.SellerLayout),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', loadComponent: () => import('./features/seller/my-products/my-products.page').then((m) => m.MyProductsPage) },
    ],
  },
```
Import `sellerGuard` from `./core/auth/seller.guard` at the top of `app.routes.ts`.

- [ ] **Step 7: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — seller-layout (1) + product-form (3) + my-products (1) tests green.

- [ ] **Step 8: Commit**

```bash
git add src/app/features/seller src/app/app.routes.ts
git commit -m "feat: add seller dashboard with product management"
```

---

### Task 11: Seller media manager

**Files:**
- Create: `src/app/features/seller/media-manager/media-manager.page.ts`
- Create: `src/app/features/seller/media-manager/media-manager.page.html`
- Create: `src/app/features/seller/media-manager/media-manager.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService`, `ProductService`, `MediaService` (Tasks 3–4), `ConfirmDialogService`, `MediaUpload` (Task 6)
- Produces:
  - `MediaManagerPage` (child route `seller/media`): product selector (mat-select), grid of the product's media with image previews, validated upload, delete with confirmation
  - Route table gains the `media` child route under `seller`

- [ ] **Step 1: Write the failing test**

`src/app/features/seller/media-manager/media-manager.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { User } from '../../../core/models/user.model';
import type { Product } from '../../../core/models/product.model';
import { AuthService } from '../../../core/auth/auth.service';
import { MediaManagerPage } from './media-manager.page';

const user: User = { id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'SELLER', avatar: null, createdAt: 'now', updatedAt: 'now' };

const product: Product = { id: 'p1', name: 'MacBook Pro', description: '16 pouces', price: 2499.99, sellerId: 'u1', mediaIds: ['m1'], createdAt: 'now', updatedAt: 'now' };

describe('MediaManagerPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MediaManagerPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the seller products and shows the media of the first one', async () => {
    const auth = TestBed.inject(AuthService);
    auth.setCurrentUser(user);

    const fixture = TestBed.createComponent(MediaManagerPage);
    fixture.detectChanges();

    http.expectOne('/api/products').flush([product]);
    await fixture.whenStable();
    fixture.detectChanges();

    const mediaReq = http.expectOne('/api/media/product/p1');
    mediaReq.flush([
      { id: 'm1', filename: 'abc.jpg', originalName: 'photo.jpg', contentType: 'image/jpeg', size: 123456, productId: 'p1', sellerId: 'u1', createdAt: 'now' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('photo.jpg');
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img?.getAttribute('src')).toBe('/api/media/m1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ng test --watch=false`
Expected: FAIL — `MediaManagerPage` doesn't exist.

- [ ] **Step 3: Implement the media manager**

`src/app/features/seller/media-manager/media-manager.page.ts`:
```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { Media } from '../../../core/models/media.model';
import type { Product } from '../../../core/models/product.model';
import { MediaService } from '../../../core/services/media.service';
import { ProductService } from '../../../core/services/product.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog';
import { MediaUpload } from '../../../shared/media-upload/media-upload';

@Component({
  selector: 'app-media-manager',
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatCard,
    MatCardContent,
    MediaUpload,
  ],
  templateUrl: './media-manager.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaManagerPage {
  private readonly auth = inject(AuthService);
  private readonly productService = inject(ProductService);
  private readonly mediaService = inject(MediaService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly snackbar = inject(MatSnackBar);

  protected readonly products = signal<Product[]>([]);
  protected readonly selectedProductId = signal<string | null>(null);
  protected readonly media = signal<Media[]>([]);
  protected readonly loadingProducts = signal(true);
  protected readonly loadingMedia = signal(false);

  protected readonly selectedProduct = computed(() =>
    this.products().find((p) => p.id === this.selectedProductId()) ?? null,
  );

  constructor() {
    void this.loadProducts();
  }

  mediaUrl(mediaId: string): string {
    return this.mediaService.url(mediaId);
  }

  async onProductChange(productId: string): Promise<void> {
    this.selectedProductId.set(productId);
    await this.loadMedia(productId);
  }

  onUpload(file: File): void {
    const productId = this.selectedProductId();
    if (!productId) {
      return;
    }
    firstValueFrom(this.mediaService.upload(file, productId))
      .then(async () => {
        this.snackbar.open('Média ajouté.', 'Fermer', { duration: 3000 });
        await this.loadMedia(productId);
      })
      .catch(() => {
        this.snackbar.open('Upload impossible.', 'Fermer', { duration: 4000 });
      });
  }

  async deleteMedia(media: Media): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirm.confirm({
        title: 'Supprimer le média',
        message: `Voulez-vous vraiment supprimer « ${media.originalName} » ?`,
        confirmLabel: 'Supprimer',
      }),
    );
    if (!confirmed) {
      return;
    }
    const productId = this.selectedProductId();
    try {
      await firstValueFrom(this.mediaService.delete(media.id));
      this.snackbar.open('Média supprimé.', 'Fermer', { duration: 3000 });
      if (productId) {
        await this.loadMedia(productId);
      }
    } catch {
      this.snackbar.open('Suppression impossible.', 'Fermer', { duration: 4000 });
    }
  }

  private async loadProducts(): Promise<void> {
    this.loadingProducts.set(true);
    try {
      const all = await firstValueFrom(this.productService.list());
      const sellerId = this.auth.currentUser()?.id;
      const mine = all.filter((p) => p.sellerId === sellerId);
      this.products.set(mine);
      if (mine.length > 0) {
        this.selectedProductId.set(mine[0].id);
        await this.loadMedia(mine[0].id);
      }
    } catch {
      this.snackbar.open('Impossible de charger vos produits.', 'Fermer', { duration: 4000 });
    } finally {
      this.loadingProducts.set(false);
    }
  }

  private async loadMedia(productId: string): Promise<void> {
    this.loadingMedia.set(true);
    try {
      this.media.set(await firstValueFrom(this.mediaService.listByProduct(productId)));
    } catch {
      this.snackbar.open('Impossible de charger les médias.', 'Fermer', { duration: 4000 });
    } finally {
      this.loadingMedia.set(false);
    }
  }
}
```

`src/app/features/seller/media-manager/media-manager.page.html`:
```html
<h1 class="text-2xl font-semibold text-gray-900">Mes médias</h1>

<div class="mt-6 flex flex-col gap-6">
  @if (loadingProducts()) {
    <div class="flex justify-center py-16">
      <mat-progress-spinner diameter="40" />
    </div>
  } @else if (products().length === 0) {
    <p class="text-gray-600">
      Vous n'avez pas encore de produit. Créez d'abord un produit pour pouvoir y associer des images.
    </p>
  } @else {
    <mat-form-field appearance="outline" class="max-w-md">
      <mat-label>Produit</mat-label>
      <mat-select [value]="selectedProductId()" (selectionChange)="onProductChange($event.value)">
        @for (product of products(); track product.id) {
          <mat-option [value]="product.id">{{ product.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <div>
      <app-media-upload label="Ajouter une image" (selected)="onUpload($event)" />
      <p class="mt-2 text-xs text-gray-500">JPEG, PNG, GIF ou WebP — 2 Mo maximum par fichier.</p>
    </div>

    @if (selectedProduct(); as product) {
      @if (loadingMedia()) {
        <div class="flex justify-center py-8">
          <mat-progress-spinner diameter="32" />
        </div>
      } @else if (media().length === 0) {
        <p class="text-gray-600">Aucune image pour « {{ product.name }} ».</p>
      } @else {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (item of media(); track item.id) {
            <mat-card class="overflow-hidden">
              <div class="aspect-square bg-gray-100">
                <img [src]="mediaUrl(item.id)" [alt]="item.originalName" class="h-full w-full object-cover" />
              </div>
              <mat-card-content class="flex items-center justify-between p-3">
                <span class="truncate text-sm text-gray-700" [title]="item.originalName">{{ item.originalName }}</span>
                <button mat-icon-button type="button" (click)="deleteMedia(item)" [attr.aria-label]="'Supprimer ' + item.originalName">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    }
  }
</div>
```
Note: `mat-card` / `mat-card-content` require `MatCard`, `MatCardContent` in the component imports — add them to the `imports` array.

`src/app/app.routes.ts` — add under the `seller` children:
```ts
      { path: 'media', loadComponent: () => import('./features/seller/media-manager/media-manager.page').then((m) => m.MediaManagerPage) },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — media-manager test (1) green.

- [ ] **Step 5: Commit**

```bash
git add src/app/features/seller/media-manager src/app/app.routes.ts
git commit -m "feat: add seller media manager"
```

---

### Task 12: Account page and final verification

**Files:**
- Create: `src/app/features/account/account.page.ts`
- Create: `src/app/features/account/account.page.html`
- Create: `src/app/features/account/account.page.spec.ts`
- Modify: `src/app/app.routes.ts`

**Interfaces:**
- Consumes: `AuthService`, `UserService` (Tasks 3–4), `MediaUpload`, `Avatar` (Task 6)
- Produces:
  - `AccountPage` (route `account`, guarded by `authGuard`): edit first name, update avatar (validated upload), save via `userService.updateProfile` + optional `userService.uploadAvatar`, then `auth.setCurrentUser(user)`
  - Route table gains the `account` route with `authGuard`

- [ ] **Step 1: Write the failing test**

`src/app/features/account/account.page.spec.ts`:
```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { User } from '../../core/models/user.model';
import { AuthService } from '../../core/auth/auth.service';
import { AccountPage } from './account.page';

const user: User = { id: 'u1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'SELLER', avatar: null, createdAt: 'now', updatedAt: 'now' };

describe('AccountPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AccountPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updates the first name and the stored user signal', async () => {
    const auth = TestBed.inject(AuthService);
    auth.setCurrentUser(user);

    const fixture = TestBed.createComponent(AccountPage);
    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ firstName: 'Johnny' });
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const req = http.expectOne('/api/users/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ firstName: 'Johnny' });
    req.flush({ ...user, firstName: 'Johnny' });
    await fixture.whenStable();

    expect(auth.currentUser()?.firstName).toBe('Johnny');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `ng test --watch=false`
Expected: FAIL — `AccountPage` doesn't exist.

- [ ] **Step 3: Implement the account page**

`src/app/features/account/account.page.ts`:
```ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { Avatar } from '../../shared/avatar/avatar';
import { MediaUpload } from '../../shared/media-upload/media-upload';

@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, MatCard, MatCardContent, MatFormField, MatLabel, MatInput, MatError, MatButton, Avatar, MediaUpload],
  templateUrl: './account.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly snackbar = inject(MatSnackBar);

  readonly form = new FormGroup({
    firstName: new FormControl(this.auth.currentUser()?.firstName ?? '', [Validators.required]),
  });

  protected readonly avatarFile = signal<File | null>(null);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly saving = signal(false);

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      let user = await firstValueFrom(this.userService.updateProfile({ firstName: this.form.controls.firstName.value! }));
      const file = this.avatarFile();
      if (file) {
        user = await firstValueFrom(this.userService.uploadAvatar(file));
      }
      this.auth.setCurrentUser(user);
      this.avatarFile.set(null);
      this.avatarPreview.set(null);
      this.snackbar.open('Profil mis à jour.', 'Fermer', { duration: 3000 });
    } catch {
      this.snackbar.open('Enregistrement impossible.', 'Fermer', { duration: 4000 });
    } finally {
      this.saving.set(false);
    }
  }

  onAvatarSelected(file: File): void {
    this.avatarFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
```

`src/app/features/account/account.page.html`:
```html
<div class="mx-auto max-w-lg">
  <h1 class="text-2xl font-semibold text-gray-900">Mon compte</h1>
  <mat-card class="mt-6">
    <mat-card-content class="flex flex-col items-center gap-6 p-8">
      @if (avatarPreview(); as preview) {
        <img [src]="preview" alt="Aperçu du nouvel avatar" class="h-24 w-24 rounded-full object-cover" />
      } @else {
        <app-avatar [src]="auth.currentUser()?.avatar" [name]="auth.currentUser()?.firstName ?? ''" [size]="96" />
      }
      <app-media-upload label="Changer l'avatar" (selected)="onAvatarSelected($event)" />
      <p class="-mt-4 text-xs text-gray-500">JPEG, PNG, GIF ou WebP — 2 Mo maximum.</p>

      <form [formGroup]="form" (ngSubmit)="save()" class="flex w-full flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Prénom</mat-label>
          <input matInput formControlName="firstName" autocomplete="given-name" />
          @if (form.controls.firstName.touched && form.controls.firstName.hasError('required')) {
            <mat-error>Le prénom est requis.</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" [value]="auth.currentUser()?.email" disabled />
        </mat-form-field>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
          Enregistrer
        </button>
      </form>
    </mat-card-content>
  </mat-card>
</div>
```

`src/app/app.routes.ts` — add after the `products` route:
```ts
  { path: 'account', canActivate: [authGuard], loadComponent: () => import('./features/account/account.page').then((m) => m.AccountPage) },
```
Import `authGuard` from `./core/auth/auth.guard` at the top of `app.routes.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `ng test --watch=false`
Expected: PASS — account test (1) green.

- [ ] **Step 5: Final verification**

Run: `ng test --watch=false`
Expected: ALL tests pass (validator, storage, auth, services, guards, interceptors, shared components, pages).

Run: `ng build`
Expected: production build succeeds with no errors and no budget violations.

Run: `npm run start` and manually check against the running gateway (`http://localhost:9000`):
- `/` redirects to `/products`; grid renders product images via `/api/media/{id}`
- `/register` as SELLER with an avatar, `/login`, logout
- `/seller/products` create/edit/delete; `/seller/media` upload valid/invalid files (type + size feedback)
- A CLIENT hitting `/seller/*` is redirected to `/products`

- [ ] **Step 6: Commit**

```bash
git add src/app/features/account src/app/app.routes.ts
git commit -m "feat: add account page"
```

---

## Self-Review Checklist

Run these checks against the plan before execution:

1. **Spec coverage** — every spec section maps to a task: Material/proxy/app-shell (1), models/validators (2), auth/token (3), API services (4), guards/interceptors/401 (5), shared components (6), login (7), register+avatar (8), public listing (9), seller dashboard CRUD (10), media manager upload/delete (11), account avatar/first name (12). No gaps.
2. **Type consistency** — `AuthService.login/register/logout/setCurrentUser/loadStoredSession`, `UserService.updateProfile/uploadAvatar`, `ProductService.list/create/update/delete`, `MediaService.upload/listByProduct/delete/url`, guards `authGuard`/`sellerGuard`, `validateMediaFile`, `passwordMatchValidator`, `MediaUpload.selected`, `ConfirmDialogService.confirm` are defined once and referenced consistently in later tasks.
3. **Placeholder scan** — every step contains concrete code or an exact command; no "TBD"/"add error handling" style placeholders.








