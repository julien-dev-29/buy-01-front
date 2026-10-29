# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary audience:** 01edu instructors evaluating the project against the Buy-01 brief.
- **CLIENT:** browses the public product grid; no selling tools.
- **SELLER:** creates and edits their own products, manages their media library, and updates their account (first name, avatar).

## Product Purpose

An Angular frontend for the Buy-01 e-commerce platform, backed by a fixed Spring Boot API Gateway. It exists to demonstrate a working two-role marketplace end-to-end against the real backend, not a mocked prototype.

## Positioning

A two-role marketplace where each seller owns and maintains their own catalog and media library through one French-language interface, on top of a fixed, already-decided API contract.

## Operating Context

- Development runs with `ng serve` on port 4200; `/api` is proxied to the API Gateway at `localhost:9000`.
- Authentication is JWT-based; the token is kept in `localStorage` and sent as `Authorization: Bearer`.
- Roles are `CLIENT` and `SELLER`; `/seller/*` is protected by a seller guard, `/account` by an auth guard.
- Product images are served as binary from `/api/media/{id}` and referenced through `ProductDTO.mediaIds`.
- The interface and all error messaging are in French.

## Capabilities and Constraints

- Auth: register (auto-login), login, logout, session restore; role-based redirects.
- Products: public listing, seller-owned listing, create/edit/delete with owner enforcement on the backend.
- Media: upload per product (`image/jpeg`, `image/png`, `image/gif`, `image/webp`, max 2 MB), list by product, delete.
- Account: editable first name and avatar.
- Explicitly out of scope: search and filters, product detail page, cart, orders, i18n beyond French, dark mode.
- The API contract is fixed and considered authoritative; the frontend adapts to it.

## Brand Commitments

- The product/brief is named **Buy-01**; the in-product header name is **"Buy It"** — keep that split unless the user changes it.
- French is the only interface language, including validation and server-error messages.
- No logo or brand identity assets exist; visuals are not yet a committed brand decision.

## Evidence on Hand

- Functional and API specs: `docs/superpowers/specs/2026-07-31-buy-01-frontend-design.md` and `docs/superpowers/specs/2026-10-28-buy-01-remaining-pages-design.md`.
- Implementation plan: `docs/superpowers/plans/2026-07-31-buy-01-frontend.md`.
- Absent and not to be fabricated: real product photography, customer testimonials, sales figures, press, or partner logos.

## Product Principles

1. Every flow must work end-to-end against the real API Gateway; no mocked or placeholder data presented as real.
2. The fixed API contract wins over frontend convenience; adapt the client, never invent endpoints.
3. Sellers see and act only on their own data; clients never reach seller tools.
4. Keep the French-language experience consistent in labels, validation, and error copy.
5. Respect the YAGNI boundary: no search, detail pages, cart, or orders until the contract supports them.

## Accessibility & Inclusion

- Must pass AXE checks and WCAG AA minimums, including focus management, color contrast, and ARIA attributes (per the repository's `AGENTS.md`).
- Icon-only controls (header actions, menu, avatar) require French `aria-label`s.
