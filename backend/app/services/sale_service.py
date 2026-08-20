from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleItem, SaleItemType
from app.models.inventory import StockTransactionType
from app.repositories import sale_repository
from app.schemas.sale import SaleCreate
from app.schemas.inventory import StockTransactionCreate
from app.services import inventory_service, livestock_service


def create_sale(db: Session, payload: SaleCreate, created_by) -> Sale:
    total = sum(item.quantity * item.unit_price for item in payload.items)

    sale = Sale(
        customer_id=payload.customer_id,
        sale_date=payload.sale_date,
        payment_status=payload.payment_status,
        payment_method=payload.payment_method,
        total_amount=total,
        created_by=created_by,
    )
    items = [
        SaleItem(
            item_type=i.item_type,
            livestock_id=i.livestock_id,
            inventory_item_id=i.inventory_item_id,
            quantity=i.quantity,
            unit_price=i.unit_price,
        )
        for i in payload.items
    ]

    sale = sale_repository.create_sale(db, sale, items)

    for i in payload.items:
        if i.item_type == SaleItemType.LIVESTOCK and i.livestock_id:
            livestock_service.mark_sold(db, i.livestock_id)
        elif i.item_type == SaleItemType.PRODUCT and i.inventory_item_id:
            inventory_service.record_transaction(
                db,
                item_id=i.inventory_item_id,
                payload=StockTransactionCreate(
                    quantity=-i.quantity,
                    transaction_type=StockTransactionType.SALE,
                    reference_type="sale",
                    reference_id=sale.id,
                ),
                user_id=created_by,
            )

    return sale
