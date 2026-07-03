def checkout(cart):
    return {
        "success": True,
        "action": "checkout",
        "cart": cart,
    }