# pyright: reportMissingImports=false
import asyncio
import base64
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from google.genai.live import ConnectionClosed
from app.config.settings import settings
from app.services.tool_dispatcher import tool_dispatcher

router = APIRouter()

MODEL = "gemini-2.5-flash-native-audio-latest"  # Updated to the standard, stable Multimodal Live API model
SYSTEM_PROMPT = """
You are an AI restaurant ordering assistant.
Rules:
- Always use tools.
- Never hallucinate menu items.
- If user asks for food, search menu first.
- If item exists, call the correct function.
- Maintain friendly conversation.
- Help user build an order.
"""

def create_live_client_and_config():
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    try:
        from google import genai
        from google.genai import types
    except Exception as exc:
        raise RuntimeError(
            "Missing dependency google-genai. Install it with: pip install google-genai"
        ) from exc

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        system_instruction=types.Content(
            parts=[types.Part.from_text(text=SYSTEM_PROMPT)]
        ),
        tools=[
            types.Tool(
                function_declarations=[
                    types.FunctionDeclaration(
                        name="search_menu",
                        description="Search menu items by name or category",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "query": types.Schema(
                                    type=types.Type.STRING,
                                    description="The search query for menu items",
                                ),
                            },
                            required=["query"],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="add_to_cart",
                        description="Add an item to the shopping cart",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "item_id": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="The ID of the menu item",
                                ),
                                "quantity": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="Quantity to add (default 1)",
                                ),
                                "size": types.Schema(
                                    type=types.Type.STRING,
                                    description="Size option if applicable",
                                ),
                                "special_instructions": types.Schema(
                                    type=types.Type.STRING,
                                    description="Special instructions for the order",
                                ),
                            },
                            required=["item_id"],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="remove_item",
                        description="Remove an item from the shopping cart",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "item_id": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="The ID of the item to remove",
                                ),
                            },
                            required=["item_id"],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="update_quantity",
                        description="Update the quantity of an item in the cart",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "item_id": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="The ID of the item",
                                ),
                                "quantity": types.Schema(
                                    type=types.Type.INTEGER,
                                    description="New quantity value",
                                ),
                            },
                            required=["item_id", "quantity"],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="calculate_total",
                        description="Calculate the total price of items in the cart",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={},
                            required=[],
                        ),
                    ),
                    types.FunctionDeclaration(
                        name="checkout",
                        description="Complete the order and checkout",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "cart": types.Schema(
                                    type=types.Type.OBJECT,
                                    description="The cart data",
                                ),
                            },
                            required=["cart"],
                        ),
                    ),
                ],
            ),
        ],
    )
    return client, types, config

async def receive_from_browser(websocket: WebSocket, session, types_module: Any):
    """
    Browser -> Gemini
    """
    try:
        while True:
            message = await websocket.receive()

            if message.get("type") == "websocket.disconnect":
                break
            
            # Handle incoming binary audio chunks from browser
            audio = message.get("bytes")
            if audio:
                await session.send_realtime_input(
                    media=types_module.Blob(
                        data=audio,
                        mime_type="audio/pcm;rate=16000",
                    )
                )
            
            # Handle incoming text messages from browser
            text_payload = message.get("text")
            if text_payload:
                try:
                    data = json.loads(text_payload)
                except json.JSONDecodeError:
                    data = {"type": "text", "text": text_payload}

                if data.get("type") == "text" and data.get("text"):
                    await session.send_realtime_input(
                        text=data["text"]
                    )
    except asyncio.CancelledError:
        pass
    except Exception as e:
        print(f"Error in receive_from_browser: {e}")

async def send_to_browser(websocket: WebSocket, session, types_module: Any):
    """
    Gemini -> Browser
    """
    try:
        while True:
            async for response in session.receive():
                # Handle tool calls at the top level
                tool_call = getattr(response, "tool_call", None)
                if tool_call:
                    function_calls = getattr(tool_call, "function_calls") or []
                    for fc in function_calls:
                        func_name = fc.name
                        func_args = dict(fc.args) if fc.args else {}
                        result = tool_dispatcher.execute(func_name, func_args)
                        await session.send_tool_response(
                            function_responses=[
                                types_module.FunctionResponse(
                                    name=func_name,
                                    response=result,
                                    id=fc.id,
                                )
                            ]
                        )
                    continue

                server_content = getattr(response, "server_content", None)
                if server_content is None:
                    continue

                model_turn = getattr(server_content, "model_turn", None)
                if model_turn:
                    for part in getattr(model_turn, "parts", []):
                        # Handle Text/Transcript Chunks
                        text = getattr(part, "text", None)
                        if text:
                            await websocket.send_json(
                                {
                                    "type": "text",
                                    "text": text,
                                }
                            )

                        # Handle Audio Output Chunks
                        inline_data: Any = getattr(part, "inline_data", None)
                        if inline_data and getattr(inline_data, "data", None):
                            await websocket.send_json(
                                {
                                    "type": "audio",
                                    "mime_type": getattr(inline_data, "mime_type", "audio/pcm;rate=24000"),
                                    "data": base64.b64encode(inline_data.data).decode("ascii"),
                                }
                            )

                        # Handle Tool Calls nested in parts
                        function_call = getattr(part, "function_call", None)
                        if function_call:
                            func_name = function_call.name
                            func_args = dict(function_call.args) if function_call.args else {}
                            result = tool_dispatcher.execute(func_name, func_args)
                            await session.send_tool_response(
                                function_responses=[
                                    types_module.FunctionResponse(
                                        name=func_name,
                                        response=result,
                                        id=function_call.id,
                                    )
                                ]
                            )

                # Handle turn completion signals
                if getattr(server_content, "turn_complete", False):
                    await websocket.send_json({"type": "turn_complete"})

    except asyncio.CancelledError:
        pass
    except ConnectionClosed:
        pass
    except Exception as e:
        print(f"Error in send_to_browser: {e}")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        client, types_module, config = create_live_client_and_config()

        # Utilizing client.aio.live.connect for async context tracking
        async with client.aio.live.connect(model=MODEL, config=config) as session:
            receive_task = asyncio.create_task(
                receive_from_browser(websocket, session, types_module)
            )
            send_task = asyncio.create_task(
                send_to_browser(websocket, session, types_module)
            )
            
            await asyncio.gather(receive_task, send_task)

    except RuntimeError as e:
        await websocket.send_json({"type": "error", "text": str(e)})
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass  # Already closed