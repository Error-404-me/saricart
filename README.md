<p align="center">
  <img src="frontend/public/favicon.svg" alt="SariCart" width="96" />
</p>

<h1 align="center">SariCart</h1>

<p align="center">
  Your neighborhood sari-sari store, online.
</p>

<p align="center">
  A web app that lets store owners list products and manage their shop from
  their phone, and lets customers browse what's in stock, pre-order, and
  pick up in person — no more showing up to an empty shelf.
</p>

---

## What is SariCart?

Sari-sari stores are the small neighborhood convenience stores found on
almost every street corner in the Philippines — but most run entirely on
paper and memory. SariCart gives them a simple digital storefront and
back office, and gives their customers an easy way to check what's
available before walking over.

**For customers:**
- Browse nearby stores on a map, see who's open, closing soon, or closed
- Search and filter a store's full catalog, including items sold by
  sub-unit (e.g. buy 1kg out of a 25kg sack)
- Add to cart and place a pre-order for pickup — no online payment needed
- Track an order from placed → accepted → preparing → ready → completed
- Save favorite stores, reorder past purchases in one tap, and get
  personalized "you usually buy…" suggestions
- Rate and review completed orders
- Get notified (in-app and push) when an order status changes

**For store owners:**
- Full product catalog management with photos, categories, and barcodes
- A barcode scanner for ringing up in-person sales and adjusting stock
  right from a phone camera
- Inventory tracking with a complete stock history, low-stock alerts,
  and smart restock suggestions based on recent sales
- A revenue analytics dashboard — daily/monthly sales trends, best
  sellers, and a sales heatmap by day and hour
- An order queue to accept, prepare, and complete customer pre-orders
- A store profile (location, hours, open/closed toggle) plus a printable
  QR code linking straight to their storefront

**Built for real-world use:**
- Installable as a PWA, with offline support for the scanner so a sale
  can still be rung up when the connection drops (and synced later)
- English and Filipino language toggle
- Light and dark mode

## Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 19 + Vite, Tailwind CSS v4, React Router, Recharts, Leaflet |
| Backend   | FastAPI, SQLAlchemy, Alembic migrations |
| Database  | SQLite for local dev, PostgreSQL in production |
| Auth      | JWT bearer tokens, bcrypt password hashing |
| Storage   | Local disk in dev, Cloudinary in production |
| PWA       | vite-plugin-pwa / Workbox, with per-route caching strategies |

## Project structure

```
saricart/
├── backend/      FastAPI app — routes, services, models, Alembic migrations
└── frontend/     React + Vite app
```

## Getting started

### Prerequisites

- Python 3.12+
- Node.js 20+

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # defaults are fine for local dev
alembic upgrade head            # create/update the database schema
uvicorn app.main:app --reload   # runs on http://localhost:8000
```

Interactive API docs are available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

The dev server proxies `/api/*` requests to `http://localhost:8000`, so
make sure the backend is running first.

Open `http://localhost:5173` — you'll land on an onboarding screen.
Register an account as either a **customer** or a **store owner** and
you'll be dropped into the right home screen for that role.

## License

This project is provided as-is for demonstration and educational purposes.