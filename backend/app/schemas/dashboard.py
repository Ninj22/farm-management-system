from decimal import Decimal
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_livestock: int
    low_stock_count: int
    upcoming_treatments_count: int
    inventory_value: Decimal
