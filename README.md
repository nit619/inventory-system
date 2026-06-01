# Inventory & Order Management System

A production-ready full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11) |
| Frontend | React 18 + Vite |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |

## Features

- **Products** — Full CRUD with unique SKU enforcement, stock tracking, low-stock alerts
- **Customers** — Full CRUD with unique email enforcement
- **Orders** — Create orders with multiple items, automatic stock deduction, status management
- **Inventory Validation** — Orders blocked when stock is insufficient
- **Stock Restoration** — Cancelling or deleting an order restores stock
- **Dashboard** — Real-time stats, low-stock alerts, recent orders

## Business Rules Implemented

1. Product SKUs must be unique across the system
2. Customer emails must be unique
3. Orders cannot be created if product stock is insufficient
4. Stock is automatically reduced when an order is placed
5. Stock is restored when an order is cancelled or deleted
6. Each order must have at least one item

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products/` | List all products |
| POST | `/api/v1/products/` | Create product |
| GET | `/api/v1/products/{id}` | Get product |
| PUT | `/api/v1/products/{id}` | Update product |
| DELETE | `/api/v1/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers/` | List all customers |
| POST | `/api/v1/customers/` | Create customer |
| GET | `/api/v1/customers/{id}` | Get customer |
| PUT | `/api/v1/customers/{id}` | Update customer |
| DELETE | `/api/v1/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders/` | List all orders |
| POST | `/api/v1/orders/` | Create order (validates stock) |
| GET | `/api/v1/orders/{id}` | Get order with items |
| PUT | `/api/v1/orders/{id}` | Update order status |
| DELETE | `/api/v1/orders/{id}` | Delete order (restores stock) |

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventory-system

# 2. Copy environment file
cp .env.example .env
# Edit .env with your preferred values

# 3. Start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL env var pointing to your Postgres instance
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Set VITE_API_URL=http://localhost:8000 in .env
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `inventory_db` |
| `POSTGRES_USER` | DB username | `postgres` |
| `POSTGRES_PASSWORD` | DB password | `postgres` |
| `DATABASE_URL` | Full DB connection string | Built from above |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `VITE_API_URL` | Backend URL for frontend | `http://localhost:8000` |

## Deployment

### Backend (Render)
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable `DATABASE_URL` pointing to a Postgres instance
6. Create a **PostgreSQL** database on Render and link it

### Frontend (Vercel)
1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable `VITE_API_URL` = your Render backend URL
4. Deploy

### Docker Hub
```bash
# Build and push backend
docker build -t yourdockerid/inventory-backend:latest ./backend
docker push yourdockerid/inventory-backend:latest

# Build and push frontend
docker build -t yourdockerid/inventory-frontend:latest ./frontend
docker push yourdockerid/inventory-frontend:latest
```

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── database.py       # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── models.py         # ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas/
│   │   │   └── schemas.py        # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── products.py       # Product CRUD endpoints
│   │   │   ├── customers.py      # Customer CRUD endpoints
│   │   │   └── orders.py         # Order endpoints with stock logic
│   │   └── main.py               # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios API client
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Stats & overview
│   │   │   ├── Products.jsx      # Products management
│   │   │   ├── Customers.jsx     # Customers management
│   │   │   └── Orders.jsx        # Orders management
│   │   ├── App.jsx               # Root with routing & sidebar
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```
