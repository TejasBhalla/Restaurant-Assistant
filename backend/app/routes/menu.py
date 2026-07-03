import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

MENU_PATH = Path("app/data/menu.json")


@router.get("/menu")
def get_menu():
    with open(MENU_PATH, "r") as f:
        menu = json.load(f)

    return {"items": menu}