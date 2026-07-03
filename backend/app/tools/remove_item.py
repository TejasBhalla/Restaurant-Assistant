def remove_item(
    item_id: int,
):
    return {
        "success": True,
        "action": "remove_item",
        "item_id": item_id,
    }