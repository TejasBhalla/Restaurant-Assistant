from app.tools.search_menu import search_menu
from app.tools.add_to_cart import add_to_cart
from app.tools.remove_item import remove_item
from app.tools.update_quantity import update_quantity
from app.tools.calculate_total import calculate_total
from app.tools.checkout import checkout


TOOLS = {
    "search_menu": search_menu,
    "add_to_cart": add_to_cart,
    "remove_item": remove_item,
    "update_quantity": update_quantity,
    "calculate_total": calculate_total,
    "checkout": checkout,
}


class ToolDispatcher:

    def execute(self, name: str, args: dict):
        tool = TOOLS.get(name)
        if tool is None:
            return {
                "success": False,
                "error": f"Unknown tool '{name}'",
            }
        try:
            return tool(**args)
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }


tool_dispatcher = ToolDispatcher()