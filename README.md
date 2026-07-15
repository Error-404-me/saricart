# SariCart

A web app for sari-sari store owners to list products, and for customers to
browse, pre-order, and pick up in store.

This build covers **Phase 1 (project setup)** and **Phase 2 (authentication)**
from the roadmap — a working register/login system with JWT, role-based
access (customer vs. store owner), and protected routes on both ends. It's
the foundation the rest of the roadmap (product management, cart, orders,
etc.) builds on top of.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4, React Router, Axios
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

**Frontend**
- `AuthContext` — holds the logged-in user, exposes `login`, `register`, `logout`
- Token persisted in `localStorage`; session restored automatically on refresh
- `ProtectedRoute` — redirects to `/login` if not authenticated, or
  `/unauthorized` if the role doesn't match
- `PublicRoute` — bounces already-logged-in users away from `/login` and `/register`
- Login and Register pages with client-side validation and inline error states
- Placeholder Home (customer) and Dashboard (owner) pages that prove the
  full flow works end to end

## Next steps (per the roadmap)

Phase 3 (owner dashboard shell), Phase 4 (product management), and onward —
the folder structure for these already exists as empty directories
(`components/product`, `components/cart`, `components/order`, etc.) so they
slot in without restructuring anything.
