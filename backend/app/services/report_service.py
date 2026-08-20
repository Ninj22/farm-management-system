import csv
import io

from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem, StockTransaction
from app.models.livestock import Livestock
from app.models.purchase import Purchase
from app.models.sale import Sale
from app.models.expense import Expense


def _csv_response(rows: list[dict]) -> io.StringIO:
    output = io.StringIO()
    if not rows:
        return output
    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return output


def inventory_csv(db: Session) -> io.StringIO:
    items = db.query(InventoryItem).filter(InventoryItem.is_archived.is_(False)).all()
    rows = [{
        "Name": i.name,
        "Category": i.category.value,
        "Unit": i.unit,
        "Quantity on hand": str(i.quantity_on_hand),
        "Reorder level": str(i.reorder_level),
        "Purchase price": str(i.purchase_price),
        "Expiry date": i.expiry_date.isoformat() if i.expiry_date else "",
    } for i in items]
    return _csv_response(rows)


def livestock_csv(db: Session) -> io.StringIO:
    animals = db.query(Livestock).all()
    rows = [{
        "Tag number": a.tag_number,
        "Species": a.species,
        "Breed": a.breed or "",
        "Sex": a.sex.value,
        "Status": a.status.value,
        "Location": a.location or "",
        "Date of birth": a.date_of_birth.isoformat() if a.date_of_birth else "",
    } for a in animals]
    return _csv_response(rows)


def purchases_csv(db: Session) -> io.StringIO:
    purchases = db.query(Purchase).all()
    rows = [{
        "Date": p.purchase_date.isoformat(),
        "Invoice": p.invoice_number or "",
        "Payment status": p.payment_status.value,
        "Total amount": str(p.total_amount),
    } for p in purchases]
    return _csv_response(rows)


def sales_csv(db: Session) -> io.StringIO:
    sales = db.query(Sale).all()
    rows = [{
        "Date": s.sale_date.isoformat(),
        "Payment status": s.payment_status.value,
        "Payment method": s.payment_method or "",
        "Total amount": str(s.total_amount),
    } for s in sales]
    return _csv_response(rows)


def expenses_csv(db: Session) -> io.StringIO:
    expenses = db.query(Expense).all()
    rows = [{
        "Date": e.expense_date.isoformat(),
        "Category": e.category.value,
        "Description": e.description or "",
        "Amount": str(e.amount),
    } for e in expenses]
    return _csv_response(rows)


def stock_transactions_csv(db: Session) -> io.StringIO:
    txns = db.query(StockTransaction).order_by(StockTransaction.created_at.desc()).all()
    rows = [{
        "Date": t.created_at.isoformat(),
        "Item ID": str(t.item_id),
        "Type": t.transaction_type.value,
        "Quantity": str(t.quantity),
        "Reference": f"{t.reference_type or ''}:{t.reference_id or ''}",
        "Notes": t.notes or "",
    } for t in txns]
    return _csv_response(rows)
