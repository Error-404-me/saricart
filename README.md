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

## Post-roadmap: navigation & onboarding

- **One shared layout** — `AppLayout` (replacing the old separate
  `MainLayout`/`DashboardLayout`) now renders Navbar + Sidebar for both
  customers and owners. The Sidebar's item list differs by role (customer:
  Home, Browse, Cart, My orders, Settings · owner: Dashboard, Products,
  Inventory, Orders, Analytics, Settings), but the Navbar itself is now
  identical for every session — logo, theme toggle, greeting, logout, full
  stop
- **Collapsible sidebar** — a toggle at the bottom collapses it to
  icon-only (with a `title` tooltip per item) on desktop; the choice
  persists to `localStorage`. On mobile the sidebar is already a compact
  horizontal scroll strip, so collapsing doesn't apply there
- **Onboarding for guests** — visiting `/` while logged out no longer just
  silently bounces to a bare login form. `Landing` branches three ways:
  logged out → `Onboarding` (a proper welcome screen with feature
  highlights and Log in / Create account buttons), logged-in owner →
  redirect to their dashboard, logged-in customer → the real Home page
  inside `AppLayout`
- **Settings, fleshed out** — now shows real account info (username,
  email, account type), the dark mode toggle, and a log-out action, at a
  single shared `/settings` route for both roles (previously owner-only)

## Post-roadmap: Community Store Discovery

Customers can find nearby participating stores, see their status and
rating at a glance, and jump straight into that store's product list.

**Backend**
- `Store` model — a 1:1 profile per owner (name, latitude/longitude,
  `is_open` toggle, optional `closes_at`). Auto-created at registration for
  any owner account, so every store shows up in discovery from day one
  (even before the owner fills in details)
- `Review` model — one review per **completed** order (unique on
  `order_id`), 1-5 stars + an optional comment. You can't review your own
  order twice, someone else's order, or an order that isn't completed yet
- Store status is computed server-side, not stored: `closed` if the manual
  toggle is off, `closing_soon` if within 30 minutes of `closes_at`,
  otherwise `open`
- `GET /api/stores/nearby?lat=&lng=&radius_km=` — haversine distance from
  every store with a location set, filtered to the radius and sorted
  nearest-first
- `GET/PATCH /api/stores/mine` — owner's own store profile
- `GET /api/stores/{id}` and `/{id}/reviews` — public store detail and
  review list, both include a live `rating_average`/`rating_count`
- `POST /api/reviews` — submit a review; `GET /api/orders/mine` now
  includes `review_id` so the frontend knows whether an order's already
  been reviewed without an extra request
- `/api/products` already supported an `owner_id` filter from Phase 4/5 —
  reused as-is to power "view this store's products" from a discovery card

**Frontend**
- `StoresNearby` page (`/stores`) — requests browser geolocation, lets the
  customer pick a search radius (2/5/10/25km), and lists results via
  `StoreCard` (distance, name, `StoreStatusBadge`, `StarRating`, and a
  Products shortcut) in one row
- `Products` page now accepts `?owner=<id>` and shows a dismissible "Showing
  products from X's store" banner when browsing that way
- `ReviewModal` — customers can rate a completed order from their Order
  History; `OrderCard` shows "Leave a review" until they do, then "You
  reviewed this order" afterward
- `StoreProfileSection` (in Settings, owners only) — set store name, grab
  the current location with one tap (`navigator.geolocation`), set a
  closing time, and flip the open/closed toggle; shows the live computed
  status badge as a preview of what customers will see

## Post-roadmap: map view for store discovery

`StoresNearby` now renders an actual map (`StoreMap`, via Leaflet +
OpenStreetMap — no API key needed) above the list, so a customer can see
*where* a store is relative to them, not just how far away a number says
it is.

- A distinct marker for "you are here," plus one per nearby store, colored
  by status (open / closing soon / closed) so it's readable at a glance
  without opening every popup
- Each store's popup repeats the essentials (name, status, rating) and
  gives two exits: **View products** (into the filtered catalog) and
  **Directions** (a universal Google Maps deep link — opens the native
  Maps app on mobile, google.com/maps in a browser on desktop; no API key
  or embedded routing needed for this)
- The same **Directions** shortcut is on every `StoreCard` in the list
  view and in `StoreMap`'s popups, so it's available whichever way someone
  is browsing

## Post-roadmap: Barcode Scanner

Most sari-sari stores sell over a counter, not a keyboard — this adds a
camera-based scanner (`/owner/scanner`) that finds a product, updates its
stock, jumps to editing it, or rings up a sale, all from one scan.

**Backend**
- `Product.barcode` — optional, unique **per owner** (`UniqueConstraint(owner_id, barcode)`)
  rather than globally, since two different stores can legitimately stock
  the same UPC-labeled product
- `GET /api/products/barcode/{code}` — looks up within the scanning
  owner's own catalog only; 404 (not another owner's product) if it's not
  there, so the frontend can offer "add this product" instead
- `POST /api/orders/walk-in` — rings up an in-person sale. Reuses the same
  validation as online checkout (same-store items, stock limits,
  server-computed total) via a shared `_validate_and_price_items` helper,
  but creates the order **already `completed`** — there's no pickup to
  wait for, the item just left the shelf. Modeled as an `Order` where the
  store is both `owner_id` and `customer_id`, so it counts toward
  analytics revenue and shows up in the order queue like anything else,
  and still logs a `SALE` stock-history entry the same way an online order
  does

**Frontend**
- `BarcodeScanner` — wraps `html5-qrcode` (supports EAN/UPC/Code128 and
  more, not just QR) with a live camera view; a manual text-entry fallback
  is always available underneath, since not every device has a working
  camera or grants permission. A 1.5s per-code cooldown stops one item
  sitting in frame from firing dozens of duplicate scans
- `/owner/scanner` — scan (or type) a code and get one of two outcomes:
  - **Found**: a card with the product's photo, price, and stock, plus
    three actions — add it to the sale in progress, jump to editing it, or
    adjust stock right there with the same `StockAdjuster` used in
    Inventory
  - **Not found**: a prompt to add it, linking to
    `/owner/products/add?barcode=<code>` with the scanned code pre-filled
  - Scanned items accumulate in a running `SaleCart` (quantity steppers,
    remove, live total) so one scanning session can ring up a full
    multi-item transaction before completing it
- `ProductForm` also gained a barcode field with its own **Scan** button
  (opens the same `BarcodeScanner` in a modal) — so a barcode can be
  attached to a product while adding or editing it, not just from the
  dedicated scanner page

**A note on bundle size:** Leaflet and html5-qrcode are both sizeable
libraries, and together they push the production JS bundle past Vite's
500KB warning threshold (harmless today, but the app would benefit from
route-level code-splitting — `React.lazy()` on `StoresNearby`, `Scanner`,
and `Analytics` in particular — before this goes much further).

## Fix: scanner crash under React StrictMode

The scanner page was crashing to the global error boundary even with the
camera visibly on. Root cause: `html5-qrcode`'s `start()`/`stop()` are both
async, and React 18 `StrictMode` intentionally double-invokes effects in
development (mount → cleanup → mount again) to catch exactly this class of
bug — a second `start()` was firing before the first `stop()` had actually
released the camera, and the library threw.

Fixed by serializing every start/stop through one promise chain stored in
a ref (`operationChainRef`) that persists across that double-invoke, so a
new start always waits for the previous stop to fully finish first, plus a
`cancelled` flag so a start that resolves *after* cleanup already fired
shuts the camera back down immediately instead of leaving it running.
Also memoized `ProductForm`'s `onScan` callback with `useCallback` — it
wasn't stable before, which would have restarted the camera on every
unrelated keystroke while the scan-barcode modal was open.

## Navigation: sidebar-only, fixed position

Removed the separate top `Navbar` — its content (logo, theme toggle, user
greeting, logout) now lives in the `Sidebar`, which is the app's only
navigation surface.

- **Desktop:** the sidebar is `fixed` to the viewport (`md:fixed
  md:inset-y-0`), not part of the scrolling page — it stays in place the
  same way Claude's own sidebar does, while `<main>` scrolls independently
  with a matching `margin-left` offset (`md:ml-56`, or `md:ml-16` when
  collapsed) so content never sits underneath it
- **Mobile:** there's no room for a fixed column, so the sidebar instead
  renders a compact `sticky top-0` header (logo + theme toggle + logout)
  with the same nav items as a horizontally scrollable strip beneath it —
  sticky rather than fixed so it stays in normal document flow and doesn't
  need a manual content offset
- Logo, theme toggle, and logout are now defined once, in `Sidebar`,
  instead of duplicated between a Navbar and a Sidebar

## Post-roadmap: PWA & offline support

Sari-sari stores often have unstable internet, so the app now works as an
installable PWA that keeps functioning — meaningfully, not just "the page
loads" — when the connection drops.

**App shell & installability** (`vite-plugin-pwa`, Workbox under the hood)
- A real manifest (name, icons, `theme_color`/`background_color` matching
  the app's own palette, `display: standalone`) — installable to a home
  screen on mobile or as a desktop app
- The service worker is auto-registered at build time
  (`injectRegister: 'auto'` injects the registration script into the built
  HTML — no manual bootstrapping needed) and updates itself silently
  (`registerType: 'autoUpdate'`)
- Three runtime caching strategies, chosen per data type rather than one
  blanket rule:
  - Product images (`/uploads/*`) — `CacheFirst`: they rarely change once
    uploaded, so don't re-fetch them every time
  - Catalog/store browsing (`/api/products*`, `/api/stores*`) —
    `StaleWhileRevalidate`: show the cached list instantly, refresh it
    quietly in the background
  - Orders/account/analytics (`/api/orders*`, `/api/users*`,
    `/api/analytics*`) — `NetworkFirst` with a 4s timeout: prefer a fresh
    answer since status changes matter, but fall back to the last known
    state instead of failing outright

**Actual offline capability, not just a cached shell** — scoped
deliberately to the barcode scanner's two write actions (walk-in sales,
stock adjustments), since those have safe, unambiguous replay semantics; a
general offline-everything layer would need real conflict resolution this
doesn't attempt:
- `Scanner` warms a per-owner product cache (`offlineStore.js`,
  `localStorage`-backed) on load and whenever connectivity returns, so a
  barcode lookup works from the last-synced catalog the instant the signal
  drops — no dead end mid-sale
- Ringing up a sale or adjusting stock while offline queues the action
  (`enqueueAction`) instead of failing, and immediately applies the change
  locally (`applyLocalStockDelta`) so the displayed stock stays accurate
  for the rest of that scanning session
- `useOfflineSync` replays the queue automatically the moment `navigator
  onLine` flips back to true; `SyncStatusBanner` shows what's pending (and
  a manual "Sync now") on the scanner page
- `ScanResultCard` and `SaleCart` are honest about offline state rather
  than pretending nothing changed — "Not in your last-synced catalog"
  instead of a confident "not found," editing/adding disabled with a
  reason instead of silently failing, "Save sale (syncs when online)"
  instead of "Complete sale"
- `OfflineBanner` (in `AppLayout`, so it's visible everywhere) and a
  generic axios interceptor fix mean any other write action in the app
  that fails while offline gets a friendly "You're offline" message
  instead of a raw network error — even outside the scanner's explicit
  offline support

## Fix: switched barcode scanning libraries

`html5-qrcode` still wasn't reliable even after serializing its lifecycle,
so `BarcodeScanner` was rebuilt on **`@zxing/browser`** instead — the same
underlying ZXing decoding engine, but used directly rather than through
html5-qrcode's higher-level wrapper.

The concrete win: `IScannerControls.stop()` in `@zxing/browser` is
**synchronous**, where html5-qrcode's `stop()` is async. That's exactly
what caused the earlier crash — React 18 `StrictMode`'s double-invoked
effects need cleanup to fully finish before the next setup runs, and an
async stop leaves a window for two camera sessions to overlap. A
synchronous stop closes that window entirely rather than requiring careful
promise-chain sequencing to work around it.

Also switched from html5-qrcode's div-based approach (it injects and
manages its own `<video>` element inside a container div) to owning a
`<video ref>` directly via `decodeFromConstraints` — simpler styling (plain
`object-cover` instead of an arbitrary `[&_video]:` selector reaching into
someone else's injected markup) and one less layer that can get out of
sync with React's render cycle. Same public API (`<BarcodeScanner
onScan={...} />`), same manual-entry fallback, same per-code rescan
cooldown — nothing downstream (`Scanner`, `ProductForm`'s scan-to-fill
modal) needed to change.

## Fix: dropped scanning libraries entirely, native BarcodeDetector instead

`@zxing/browser` still wasn't reliable in practice — camera access worked,
but `video.play()` was throwing `AbortError: The play() request was
interrupted by a new load request`, and the console filled with
`MultiFormatReader: non-ReaderException` on every frame (expected — ZXing
tries every barcode format each frame and logs each miss — but noisy
enough to look broken, and did coincide with scans never actually
resolving).

Two library-based attempts hitting the same class of problem pointed at
the pattern, not the library: any continuous-decode library manages its
own video lifecycle internally, and React 18 StrictMode's double-invoked
effects (mount → cleanup → mount again, in dev) can trigger two of those
lifecycles overlapping on the same `<video>` element. So `BarcodeScanner`
now uses the browser's **native `BarcodeDetector` API** instead of a third
scanning library:

- One `getUserMedia()` call, a `setInterval` that grabs a frame to an
  offscreen canvas and calls `detector.detect()`, and cleanup that's just
  `clearInterval` + stopping `MediaStream` tracks — no third-party
  decode-loop state machine involved at all
- The fix is structural rather than another workaround: the effect checks
  its `cancelled` flag **before** ever touching the video element, so a
  StrictMode-cancelled instance releases its camera stream and returns
  without calling `srcObject`/`play()` — there's only ever one real
  `play()` call on the live instance, never two racing each other
- **Coverage tradeoff, stated plainly:** `BarcodeDetector` ships in
  Chrome/Edge/Samsung Internet (desktop and Android) but not in Safari or
  Firefox. Where it's unavailable, manual entry is the primary path (shown
  by default, not offered as a fallback link) rather than reaching for a
  fourth library to paper over a browser support gap
- Net effect: `@zxing/browser` + `@zxing/library` removed entirely,
  dropping the production bundle from ~1.39MB back down to ~916KB
