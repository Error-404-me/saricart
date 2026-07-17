# SariCart

A web app for sari-sari store owners to list products, and for customers to
browse, pre-order, and pick up in store.

This build covers **all 10 phases** of the roadmap — register/login with
JWT, role-based access, an owner dashboard with full product CRUD, a
customer-facing catalog, a persistent shopping cart, a complete
checkout-to-pickup order flow, inventory tracking with a full stock
history, a revenue analytics dashboard, and dark mode.

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4, React Router, Axios,
  lucide-react, Recharts
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
- Products include the seller's username (`owner_username`) so a customer
  browsing across stores can see who they'd be buying from

**Frontend**
- `AuthContext` — holds the logged-in user, exposes `login`, `register`, `logout`
- Token persisted in `localStorage`; session restored automatically on refresh
- `ProtectedRoute` — redirects to `/login` if not authenticated, or
  `/unauthorized` if the role doesn't match
- `PublicRoute` — bounces already-logged-in users away from `/login` and `/register`
- Login and Register pages with client-side validation and inline error states

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

**Customer pages (Phase 5)**
- `Home` — search bar, category shortcuts, and a "fresh in stock" preview
  grid across every store on the platform
- `Products` — the full catalog: debounced search + category filter chips,
  synced to the URL (`?search=&category=`) so links are shareable
- `ProductDetails` — image, price, stock status (in stock / low / out),
  description, and seller name; "Add to cart" is present but disabled until
  Phase 6
- `ProductCard` / `ProductGrid` / `CategoryFilter` — reusable components
  shared between Home and Products

**Shopping cart (Phase 6)**
- `CartContext` — add/update/remove items, item count, and subtotal;
  persisted to `localStorage` per user via `cartService`, restored on login
- Because pickup happens at one physical store, a cart can only hold items
  from a single seller at a time — adding a product from a different store
  surfaces a confirmation modal ("Replace cart?") instead of silently mixing
  stores
- Quantities are clamped to the stock captured when the item was added
- `Cart` page — line items with quantity steppers and remove buttons, plus
  `CartSummary` with subtotal/total; "Proceed to checkout" is present but
  disabled until Phase 7
- Cart icon with a live item-count badge in the Navbar (customers only)

**Orders (Phase 7)**
- `Order` / `OrderItem` models — an order belongs to one customer and one
  store; each item snapshots its product's name, image, and price at order
  time, so editing or deleting a product later never breaks past order
  history (the FK is nullable and gets detached rather than blocked)
- `POST /api/orders` — validates all items belong to the same store, checks
  stock, decrements it, and computes the total server-side (never trusts a
  client-supplied price)
- Status machine: `pending → accepted → preparing → ready → completed`,
  with `cancelled` reachable from any non-terminal state; illegal jumps
  (e.g. pending straight to completed) are rejected with a 400. Cancelling
  restocks every item automatically
- Access control: only the customer who placed an order or the store that
  received it can view it; only that store's owner can change its status
- `Checkout` page turns the cart into a real order, then clears the cart
- `Orders` (customer) — order history via `OrderCard`, newest first
- `ManageOrders` (owner) — a status-filterable queue (`OrderTable`) with
  context-appropriate action buttons (Accept/Reject while pending, Start
  preparing, Ready for pickup, Mark completed)
- Dashboard's "Pending orders" and "Today's sales" stat cards, and its
  "Recent orders" list, are now wired to real data

**Inventory (Phase 8)**
- `StockHistory` model — every stock change is logged with a reason
  (`adjustment`, `sale`, `cancelled`), plus a before/after snapshot; it's the
  single source of truth stock ever changes through (order placement,
  cancellation restocks, and manual edits all route through the same
  `record_stock_change` helper, so nothing can drift out of sync)
- `PATCH /api/products/{id}/stock` — add or remove stock by a signed delta;
  rejects a zero delta and rejects removing more than is on hand
- `GET /api/products/stock-history` — an owner's full ledger, optionally
  filtered to one product
- `Inventory` page — a low-stock banner, an "update stock" row per product
  (`StockAdjuster`), and a recent-activity feed (`StockHistoryList`)
  showing every sale, cancellation, and manual change with its before/after
  counts
- Editing a product's stock through the regular product form now logs an
  `adjustment` entry too, so there's one consistent history regardless of
  which screen changed it

**Analytics (Phase 9)**
- Revenue is computed exclusively from **completed** orders — pending,
  accepted, preparing, ready, and cancelled orders never count, so the
  numbers reflect what actually got picked up and paid for
- `GET /api/analytics/summary` — all-time revenue, completed order count,
  items sold, and average order value
- `GET /api/analytics/daily-sales` / `monthly-sales` — zero-filled buckets
  (every day/month in the window appears even with no sales) so charts
  never have misleading gaps
- `GET /api/analytics/best-sellers` — top products by quantity sold,
  grouped by the order item's snapshot name so it stays accurate even if a
  product was later edited or deleted
- `Analytics` page (Revenue Dashboard) — summary stat cards, a 14-day daily
  sales bar chart, a 6-month trend, and a ranked best-sellers list, all
  built with Recharts and the app's storefront color palette

**Polish (Phase 10)**
- **Dark mode** — every card, border, and hover state now goes through
  semantic tokens (`--color-surface`, `--color-border`, `--color-border-subtle`,
  `--color-overlay`) instead of literal `bg-white` / `border-black`, so a
  single `.dark` class swap re-themes the entire app; brand colors are
  brightened slightly in dark mode so they still pop against a dark
  background. `ThemeContext` persists the choice to `localStorage` and
  falls back to the OS preference (`prefers-color-scheme`) on first visit.
  Toggle lives in the Navbar (sun/moon icon) and as a real switch on the
  Settings page
- **Error handling** — a top-level `ErrorBoundary` catches unexpected
  render errors app-wide with a recoverable fallback screen instead of a
  blank page
- **Loading states audit** — fixed one gap where the Dashboard's "Recent
  orders" panel could flash an empty state before data arrived; every
  other data-fetching page already showed a `Spinner` correctly
- **Responsive design, empty states, and the 404 page** were already
  handled incrementally in earlier phases — this was an audit pass rather
  than new work, and no other gaps turned up

## Roadmap status

All 10 phases are built. From here, natural extensions beyond the original
roadmap would be: pagination for large catalogs/order histories, real
payment integration, push/email notifications on order status changes, and
splitting the frontend bundle (Recharts pushed the production JS bundle
over Vite's 500KB chunk-size warning threshold — harmless today, but worth
a `dynamic import()` split if the app grows further).
