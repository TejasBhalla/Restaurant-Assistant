def checkout(customer_name: str):
    return {
        "success": True,
        "action": "checkout",
        "customer_name": customer_name,
    }