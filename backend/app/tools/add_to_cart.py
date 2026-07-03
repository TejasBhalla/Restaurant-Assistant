def add_to_cart(
    item_id: int,
    quantity: int = 1,
    size: str | None = None,
    special_instructions: str | None = None,
):
    return {
        "success": True,
        "action": "add_to_cart",
        "item_id": item_id,
        "quantity": quantity,
        "size": size,
        "special_instructions": special_instructions,
    }