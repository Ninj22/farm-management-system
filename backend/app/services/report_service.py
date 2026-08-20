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


def farm_summary_pdf(db: Session) -> io.BytesIO:
    """One-page farm overview: livestock, inventory, financials, alerts.
    Kept in this file alongside the CSV builders so all report logic lives in one place."""
    from datetime import date
    from decimal import Decimal
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet

    from app.models.livestock import LivestockStatus
    from app.models.inventory import InventoryItem
    from app.models.expense import Expense
    from app.models.sale import Sale
    from sqlalchemy import func

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Farm Management System — Summary Report", styles["Title"]))
    elements.append(Paragraph(f"Generated: {date.today().isoformat()}", styles["Normal"]))
    elements.append(Spacer(1, 0.6 * cm))

    total_livestock = db.query(Livestock).filter(Livestock.status == LivestockStatus.ACTIVE).count()
    low_stock = db.query(InventoryItem).filter(
        InventoryItem.is_archived.is_(False),
        InventoryItem.quantity_on_hand <= InventoryItem.reorder_level,
    ).count()
    inventory_value = db.query(func.sum(InventoryItem.quantity_on_hand * InventoryItem.purchase_price)).filter(
        InventoryItem.is_archived.is_(False)
    ).scalar() or Decimal("0")
    total_revenue = db.query(func.sum(Sale.total_amount)).scalar() or Decimal("0")
    total_expenses = db.query(func.sum(Expense.amount)).scalar() or Decimal("0")

    summary_data = [
        ["Metric", "Value"],
        ["Total active livestock", str(total_livestock)],
        ["Low stock items", str(low_stock)],
        ["Inventory value (KES)", f"{inventory_value:,.2f}"],
        ["Total revenue (KES)", f"{total_revenue:,.2f}"],
        ["Total expenses (KES)", f"{total_expenses:,.2f}"],
        ["Net result (KES)", f"{(total_revenue - total_expenses):,.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[9 * cm, 6 * cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#166534")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.8 * cm))

    elements.append(Paragraph("Expenses by category", styles["Heading2"]))
    expense_rows = db.query(Expense.category, func.sum(Expense.amount).label("total")).group_by(Expense.category).all()
    if expense_rows:
        exp_data = [["Category", "Total (KES)"]] + [[r.category.value, f"{r.total:,.2f}"] for r in expense_rows]
        exp_table = Table(exp_data, colWidths=[9 * cm, 6 * cm])
        exp_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#166534")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(exp_table)
    else:
        elements.append(Paragraph("No expenses recorded yet.", styles["Normal"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer
