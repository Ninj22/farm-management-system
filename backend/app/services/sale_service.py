from sqlalchemy.orm import Session

from app.models.sale import Sale, SaleItem, SaleItemType
from app.models.inventory import MovementType
from app.repositories import sale_repository
from app.schemas.sale import SaleCreate
from app.schemas.inventory import StockAdjustment
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

    # This is the "sale updates livestock or inventory" rule from the spec.
    for i in payload.items:
        if i.item_type == SaleItemType.LIVESTOCK and i.livestock_id:
            livestock_service.mark_sold(db, i.livestock_id)
        elif i.item_type == SaleItemType.PRODUCT and i.inventory_item_id:
            inventory_service.adjust_stock(
                db,
                item_id=i.inventory_item_id,
                adjustment=StockAdjustment(
                    quantity=i.quantity,
                    movement_type=MovementType.SALE_OUT,
                    reference=f"sale:{sale.id}",
                ),
            )

    return sale
