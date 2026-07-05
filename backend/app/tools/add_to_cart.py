import json
from pathlib import Path

MENU_PATH = Path(__file__).parent.parent / "data" / "menu.json"


def add_to_cart(
    item_id: int,
    quantity: int = 1,
    size: str | None = None,
    special_instructions: str | None = None,
):
    with open(MENU_PATH, "r") as f:
        menu = json.load(f)

    item = next((i for i in menu if i["id"] == item_id), None)
    if not item:
        return {"success": False, "error": f"Item with id {item_id} not found"}

    return {
        "success": True,
        "action": "add_to_cart",
        "item": {
            "id": item["id"],
            "name": item["name"],
            "price": item["price"],
        },
        "quantity": quantity,
        "size": size,
        "special_instructions": special_instructions,
    }
