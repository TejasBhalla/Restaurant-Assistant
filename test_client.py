import asyncio
import json
import sys
import websockets


async def receive_messages(websocket):
    """Listens for responses from your FastAPI server."""
    try:
        async for message in websocket:
            if isinstance(message, str):
                # Handle text frames (Transcripts or Status)
                try:
                    data = json.loads(message)
                    if data.get("type") == "text":
                        print(f"\n[Gemini]: {data.get('text')}")
                    elif data.get("type") == "turn_complete":
                        print("\n[System]: Gemini finished speaking/responding.")
                    elif data.get("type") == "error":
                        print(f"\n[Error from Server]: {data.get('text')}")
                except json.JSONDecodeError:
                    print(f"\n[Raw Text Message]: {message}")

            elif isinstance(message, bytes):
                # Handle binary audio frames
                # In a real frontend, you'd feed this to an audio player.
                # For testing, we just log that we received audio data.
                print(".", end="", flush=True)  # Prints a dot for each incoming audio chunk

    except websockets.exceptions.ConnectionClosed:
        print("\n[System]: Connection closed by server.")


async def send_messages(websocket):
    """Allows you to type messages in the terminal and send them."""
    print(
        "Connected! Type your message and hit Enter. (Type 'exit' to quit)\n"
    )
    # Give the receiver a moment to clear lines
    await asyncio.sleep(0.5)

    while True:
        # Using loop.run_in_executor to avoid blocking the async event loop with input()
        loop = asyncio.get_event_loop()
        user_input = await loop.run_in_executor(
            None, input, "You: "
        )

        if user_input.strip().lower() == "exit":
            break

        if not user_input.strip():
            continue

        # Format match the JSON parsing logic in your `receive_from_browser` function
        payload = {"type": "text", "text": user_input}

        await websocket.send(json.dumps(payload))
        # Yield control briefly to let text print cleanly
        await asyncio.sleep(0.1)


async def main():
    uri = "ws://localhost:8000/ws"  # Adjust port to match your FastAPI server
    try:
        async with websockets.connect(uri) as websocket:
            # Run both sending and receiving loops concurrently
            await asyncio.gather(
                receive_messages(websocket), send_messages(websocket)
            )
    except Exception as e:
        print(f"Failed to connect or error occurred: {e}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())