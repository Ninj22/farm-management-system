from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import (
    auth, farms, stores, inventory, suppliers, purchases, livestock, veterinary, customers, sales, expenses, dashboard, equipment, reports, audit,
)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(farms.router, prefix="/api/v1/farms", tags=["farms"])
app.include_router(stores.router, prefix="/api/v1/stores", tags=["stores"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["inventory"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["suppliers"])
app.include_router(purchases.router, prefix="/api/v1/purchases", tags=["purchases"])
app.include_router(livestock.router, prefix="/api/v1/livestock", tags=["livestock"])
app.include_router(veterinary.router, prefix="/api/v1/veterinary", tags=["veterinary"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["sales"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["expenses"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(equipment.router, prefix="/api/v1/equipment", tags=["equipment"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(audit.router, prefix="/api/v1/audit-logs", tags=["audit"])


@app.get("/health")
def health_check():
    return {"status": "ok"}

