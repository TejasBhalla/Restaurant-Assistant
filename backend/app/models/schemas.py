from pydantic import BaseModel
from typing import List, Optional


class CartItem(BaseModel):
    id: int
    name: str
    quantity: int
    price: float


class CartItemInput(BaseModel):
    name: str
    quantity: int
    price: float


class Cart(BaseModel):
    items: List[CartItemInput]
    subtotal: float
    tax: float
    total: float


class CheckoutRequest(BaseModel):
    customer_name: str
    items: List[CartItem]


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    cart: Optional[Cart] = None
    history: Optional[List[ChatMessage]] = None


class ToolCallResult(BaseModel):
    tool: str
    result: dict


class ChatResponse(BaseModel):
    response: str
    cart: Optional[Cart] = None
    tool_calls: List[ToolCallResult]