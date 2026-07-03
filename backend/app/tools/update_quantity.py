def update_quantity(item_id: int, quantity: int):
    return {
        "success": True,
        "action": "update_quantity",
        "item_id": item_id,
        "quantity": quantity,
    }
