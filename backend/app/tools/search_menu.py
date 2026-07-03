import json
from pathlib import Path

MENU_PATH = Path(__file__).parent.parent / "data" / "menu.json"


def search_menu(query: str):
    """
    Search menu items by name or category.
    """

    with open(MENU_PATH, "r", encoding="utf-8") as f:
        menu = json.load(f)

    query = query.lower()

    results = []

    for item in menu:

        if (
            query in item["name"].lower()
            or query in item["category"].lower()
        ):
            results.append(item)

    return {
        "success": True,
        "items": results
    }