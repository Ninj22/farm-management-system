from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.services import report_service

router = APIRouter()


def _stream(buffer, filename: str) -> StreamingResponse:
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/inventory.csv", dependencies=[Depends(get_current_user)])
def export_inventory_csv(db: Session = Depends(get_db)):
    return _stream(report_service.inventory_csv(db), "inventory_report.csv")


@router.get("/livestock.csv", dependencies=[Depends(get_current_user)])
def export_livestock_csv(db: Session = Depends(get_db)):
    return _stream(report_service.livestock_csv(db), "livestock_report.csv")


@router.get("/purchases.csv", dependencies=[Depends(get_current_user)])
def export_purchases_csv(db: Session = Depends(get_db)):
    return _stream(report_service.purchases_csv(db), "purchases_report.csv")


@router.get("/sales.csv", dependencies=[Depends(get_current_user)])
def export_sales_csv(db: Session = Depends(get_db)):
    return _stream(report_service.sales_csv(db), "sales_report.csv")


@router.get("/expenses.csv", dependencies=[Depends(get_current_user)])
def export_expenses_csv(db: Session = Depends(get_db)):
    return _stream(report_service.expenses_csv(db), "expenses_report.csv")


@router.get("/stock-transactions.csv", dependencies=[Depends(get_current_user)])
def export_stock_transactions_csv(db: Session = Depends(get_db)):
    return _stream(report_service.stock_transactions_csv(db), "stock_transactions_report.csv")
