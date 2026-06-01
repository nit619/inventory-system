from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.db.database import engine, Base
from app.routers import products, customers, orders

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System",
    description="A production-ready API for managing products, customers, orders and inventory",
    version="1.0.0"
)

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(products.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Inventory & Order Management System API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
