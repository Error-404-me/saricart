# SariCart

A web app for sari-sari store owners to list products, and for customers to
browse, pre-order, and pick up in store.

This build covers **Phase 1 (project setup)**, **Phase 2 (authentication)**,
**Phase 3 (owner dashboard)**, and **Phase 4 (product management)** from the
roadmap — register/login with JWT, role-based access, an owner dashboard
shell, and full CRUD for products including image uploads.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4, React Router, Axios, lucide-react
- **Backend:** FastAPI + SQLAlchemy + SQLite (swap to Postgres later by
  changing one env var)
- **Auth:** JWT bearer tokens, bcrypt password hashing

## Project layout

```
saricart/
├── backend/      FastAPI app (see backend/README below for structure)
└── frontend/     React + Vite app
```

## Running it locally

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults are fine for local dev
uvicorn app.main:app --reload   # runs on http://localhost:8000
```

Interactive API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

The dev server proxies `/api/*` requests to `http://localhost:8000`, so make
sure the backend is running first (see `frontend/vite.config.js`).

Open http://localhost:5173 — you'll land on `/login`. Register an account
(pick "customer" or "store owner"), and you'll be logged in and redirected
to the right home page for that role.

## What's implemented

**Backend**

- `POST /api/auth/register` — create a user (customer or owner), bcrypt-hashed password
- `POST /api/auth/login` — verify credentials, issue a JWT
- `GET /api/users/me` — return the current user (requires a valid token)
- Role stored on the user (`customer` / `owner`); a `require_owner` dependency
  is ready for owner-only routes in later phases
- Full product CRUD (`/api/products`) — public browsing/search, plus
  owner-only create/update/delete with ownership enforcement (an owner can't
  edit another owner's product) and image upload (`/api/products/{id}/image`,
  served back from `/uploads/...`)

**Frontend**

- `AuthContext` — holds the logged-in user, exposes `login`, `register`, `logout`
- Token persisted in `localStorage`; session restored automatically on refresh
- `ProtectedRoute` — redirects to `/login` if not authenticated, or
  `/unauthorized` if the role doesn't match
- `PublicRoute` — bounces already-logged-in users away from `/login` and `/register`
- Login and Register pages with client-side validation and inline error states
- Placeholder Home (customer) page — Phase 5 fills this in with real browsing

**Owner dashboard (Phase 3)**

- `DashboardLayout` — Navbar + `Sidebar`, used only for `/owner/*` routes
- `Sidebar` — links to Dashboard, Products, Inventory, Orders, Settings
  (responsive: a left column on desktop, a horizontal scroll bar on mobile)
- Dashboard stat cards (`StatCard`) — total products and low-stock alerts
  are now real numbers pulled from the product API; pending orders and
  today's sales stay as placeholders until Phase 7/9
- `Inventory`, `ManageOrders` — stub pages (via a shared `ComingSoon`
  component), each labeled with the phase that will build them out
- `Settings` — a shared page (not owner-specific) reachable from the sidebar

**Product management (Phase 4)**

- `ManageProducts` — the real product list: debounced search, delete with a
  confirmation modal, empty states for "no products yet" vs. "no matches"
- `AddProduct` / `EditProduct` — share a `ProductForm` component (name,
  description, category, price, stock, photo); edit redirects non-owners to
  `/unauthorized`
- Image upload with client-side preview; the backend validates file type
  (JPEG/PNG/WEBP) and a 5MB size cap, and cleans up the old file when an
  image is replaced or a product is deleted
- `formatCurrency` util for consistent ₱ formatting across the app

## Next steps (per the roadmap)

Phase 5 (customer pages) is the natural next step — it reuses the same
`/api/products` browsing endpoint (already public, already supports search
and category filters) to build out the customer-facing Home, Products, and
ProductDetails pages.
