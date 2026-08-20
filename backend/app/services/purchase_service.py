from sqlalchemy.orm import Session

from app.models.purchase import Purchase, PurchaseItem
from app.models.inventory import StockTransactionType
from app.repositories import purchase_repository
from app.schemas.purchase import PurchaseCreate
from app.schemas.inventory import StockTransactionCreate
from app.services import inventory_service


def create_purchase(db: Session, payload: PurchaseCreate, created_by) -> Purchase:
    total = sum(item.quantity * item.unit_price for item in payload.items)

    purchase = Purchase(
        supplier_id=payload.supplier_id,
        invoice_number=payload.invoice_number,
        purchase_date=payload.purchase_date,
        payment_status=payload.payment_status,
        total_amount=total,
        created_by=created_by,
    )
    items = [
        PurchaseItem(item_id=i.item_id, quantity=i.quantity, unit_price=i.unit_price)
        for i in payload.items
    ]

    purchase = purchase_repository.create_purchase(db, purchase, items)

    # Purchase increases stock — positive quantity on the ledger.
    for i in payload.items:
        inventory_service.record_transaction(
            db,
            item_id=i.item_id,
            payload=StockTransactionCreate(
                quantity=i.quantity,
                transaction_type=StockTransactionType.PURCHASE,
                reference_type="purchase",
                reference_id=purchase.id,
            ),
            user_id=created_by,
        )

    return purchase
