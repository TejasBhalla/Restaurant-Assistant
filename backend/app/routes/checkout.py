from fastapi import APIRouter

from app.models.schemas import CheckoutRequest
from app.services.supabase import supabase

router = APIRouter()


@router.post("/checkout")
def checkout(order: CheckoutRequest):

    subtotal = sum(
        item.price * item.quantity
        for item in order.items
    )

    tax = round(subtotal * 0.05, 2)

    total = subtotal + tax

    response = (
        supabase.table("orders")
        .insert(
            {
                "customer_name": order.customer_name,
                "items": [
                    item.model_dump()
                    for item in order.items
                ],
                "subtotal": subtotal,
                "tax": tax,
                "total": total,
            }
        )
        .execute()
    )

    return {
        "success": True,
        "order": response.data[0],
    }