# AI Restaurant Assistant 🍽️✨

> An intelligent, voice-powered restaurant ordering system built with **FastAPI**, **Next.js**, and **Google Gemini Live API**.

---

https://github.com/user-attachments/assets/91ccf206-4f2a-4564-aaba-6a08e22a20dd

---

## Overview

AI Restaurant Assistant lets customers browse a menu, build an order, and check out — all through natural conversation. Speak your order, ask about the menu, or type it out. The AI understands context, remembers your cart, and responds with both text and speech.

### Built With

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | FastAPI, Python 3.12+, Uvicorn |
| **AI Engine** | Google Gemini 2.5 Flash Native Audio (Live API) |
| **State** | Zustand (client), tool dispatcher (server) |
| **Database** | Supabase (checkout persistence) |
| **Audio** | Web Audio API, ScriptProcessor, PCM16 streaming |

---

## Features

### 🎤 Voice Ordering
Click the mic and speak naturally. "I'd like a veggie burger and a Coke" — the AI understands, searches the menu, and adds items to your cart.

### 🔄 Real-time Conversation
Bidirectional streaming keeps the conversation flowing. The AI can ask clarifying questions ("What size?") and you can respond without missing a beat.

### 🛒 Smart Cart Management
- Add, remove, and update quantities via voice or click
- Automatic price calculation with 5% tax
- Live cart sidebar with animated transitions

### 🧠 Persistent Memory
The AI remembers your entire conversation and cart state throughout your session — no more repeating yourself after every turn.

### 📋 Menu Dashboard
Click-based browsing with a clean, responsive grid. Skeleton loading states, category badges, and smooth animations.

### 🎨 Beautiful UI
- Dark/light mode support
- Animated message bubbles
- Live audio waveform visualization
- Responsive design (mobile-first)
- Framer Motion animations throughout

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Next.js)                  │
│  ┌─────────┐  ┌──────┐  ┌─────────┐  ┌───────────┐ │
│  │ Menu    │  │ Chat │  │ Voice   │  │ Cart      │ │
│  │ Grid    │  │ UI   │  │ UI      │  │ Sidebar   │ │
│  └────┬────┘  └──┬───┘  └────┬────┘  └─────┬─────┘ │
│       │          │           │              │        │
│  ┌────┴──────────┴───────────┴──────────────┴─────┐ │
│  │              Zustand Stores                     │ │
│  │   (cartStore, chatStore, voiceStore, uiStore)   │ │
│  └──────────────────────┬─────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────┴─────────────────────────┐ │
│  │           WebSocket Service                     │ │
│  │    (auto-reconnect, binary audio, JSON msgs)   │ │
│  └──────────────────────┬─────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ WebSocket (ws://)
                          ▼
┌──────────────────────────────────────────────────────┐
│              FastAPI Backend (Uvicorn)                │
│  ┌──────────────────────────────────────────────┐   │
│  │           WebSocket Endpoint (/ws)            │   │
│  │  ┌────────────────┐  ┌────────────────────┐  │   │
│  │  │ receive_from_   │  │   send_to_browser  │  │   │
│  │  │ browser()       │  │   (while True loop)│  │   │
│  │  │ (audio + text)  │  │ (text + audio +   │  │   │
│  │  │  → Gemini)      │  │  tool_calls → WS) │  │   │
│  │  └────────┬───────┘  └─────────┬──────────┘  │   │
│  └───────────┼─────────────────────┼────────────┘   │
│              │                     │                  │
│  ┌───────────┴─────────────────────┴────────────┐   │
│  │         Gemini Live API Session              │   │
│  │  (bidirectional streaming, tool execution)   │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │                              │
│  ┌────────────────────┴─────────────────────────┐   │
│  │            Tool Dispatcher                    │   │
│  │  search_menu → add_to_cart → remove_item     │   │
│  │  update_quantity → calculate_total → checkout│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌────────────────────┐  ┌──────────────────────┐   │
│  │  REST APIs         │  │  Supabase Client     │   │
│  │  GET /menu         │  │  (order persistence) │   │
│  │  POST /checkout    │  └──────────────────────┘   │
│  └────────────────────┘                              │
└──────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- A Google Gemini API key (with Live API access)
- A Supabase project (optional, for checkout persistence)

### 1. Clone & Install

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate    # Windows
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**backend/.env**
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:3000** and start ordering.

---

## Project Structure

```
restaraunt-AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── config/settings.py       # Environment configuration
│   │   ├── data/menu.json           # Menu items
│   │   ├── models/schemas.py        # Pydantic models
│   │   ├── routes/
│   │   │   ├── menu.py              # GET /menu
│   │   │   ├── checkout.py          # POST /checkout
│   │   │   └── websocket.py         # WS /ws (Gemini Live)
│   │   ├── services/
│   │   │   ├── tool_dispatcher.py   # Tool routing
│   │   │   └── supabase.py          # Database client
│   │   └── tools/
│   │       ├── search_menu.py       # Menu search
│   │       ├── add_to_cart.py       # Cart management
│   │       ├── remove_item.py
│   │       ├── update_quantity.py
│   │       ├── calculate_total.py   # Pricing
│   │       └── checkout.py          # Order placement
│   ├── requirements.txt
│   └── test_client.py               # WS test harness
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Main ordering page
│   │   │   ├── dashboard/page.tsx   # Menu dashboard
│   │   │   ├── success/page.tsx     # Order confirmation
│   │   │   └── globals.css          # Tailwind + themes
│   │   ├── components/
│   │   │   ├── cart/                # CartItem, CartSidebar, OrderSummary
│   │   │   ├── chat/                # Chat, ChatBubble, TypingIndicator
│   │   │   ├── menu/                # MenuCard, MenuGrid
│   │   │   ├── ui/                  # Header
│   │   │   └── voice/               # MicButton, VoiceVisualizer, Waveform
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts      # WebSocket + audio playback
│   │   │   ├── useVoice.ts          # Voice orchestration
│   │   │   └── useRecorder.ts       # Microphone capture
│   │   ├── services/
│   │   │   ├── websocket.ts         # WS client with reconnection
│   │   │   └── api.ts               # REST API client
│   │   ├── stores/
│   │   │   ├── cartStore.ts         # Cart state (Zustand)
│   │   │   ├── chatStore.ts         # Message history
│   │   │   ├── voiceStore.ts        # Voice UI state
│   │   │   └── uiStore.ts           # UI state (sidebar, dark mode)
│   │   └── types/
│   │       ├── cart.ts
│   │       ├── chat.ts
│   │       └── menu.ts
│   ├── package.json
│   └── next.config.ts
│
└── README.md
```

---

## API Reference

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check (root) |
| `GET` | `/health` | Health check |
| `GET` | `/menu` | Fetch all menu items |
| `POST` | `/checkout` | Submit an order |

### WebSocket

| Path | Description |
|------|-------------|
| `ws://localhost:8000/ws` | Bidirectional AI conversation |

**Client → Server Messages:**
- **Binary audio**: PCM16 16kHz mono audio chunks
- **Text JSON**: `{ "type": "text", "text": "..." }`

**Server → Client Messages:**
- **Text**: `{ "type": "text", "text": "..." }`
- **Audio**: `{ "type": "audio", "mime_type": "...", "data": "<base64>" }`
- **Turn complete**: `{ "type": "turn_complete" }`
- **Error**: `{ "type": "error", "text": "..." }`

---

## How It Works

### The Conversation Loop

1. **User speaks/types** an order request
2. **Browser** streams audio/text to the backend via WebSocket
3. **Backend** forwards it to Gemini Live API
4. **Gemini** processes the input and may:
   - Call a tool (search menu, add to cart, etc.)
   - Respond with text and/or audio
5. **Backend** executes tool calls, sends results back to Gemini
6. **Gemini** continues the turn (e.g., "I've added a Veggie Burger to your cart")
7. **Backend** streams text/audio responses to the browser
8. **Browser** displays text in chat, plays audio, updates cart
9. Connection stays open for the next request

### Tool System

The AI has access to 6 tools that it can invoke during conversation:

- `search_menu(query)` — Finds menu items by name/category
- `add_to_cart(item_id, quantity, size, special_instructions)` — Adds items
- `remove_item(item_id)` — Removes items from cart
- `update_quantity(item_id, quantity)` — Changes quantities
- `calculate_total()` — Shows the running total
- `checkout(cart)` — Completes the order

Tools are registered as Gemini function declarations. The model decides when to call them based on user intent.

---

## Development

### Adding a New Menu Item

Edit `backend/app/data/menu.json`:

```json
{
  "id": 6,
  "name": "Margherita Pizza",
  "category": "Pizza",
  "price": 249,
  "available": true,
  "image": "",
  "description": "Classic cheese and tomato pizza"
}
```

### Adding a New Tool

1. Create `backend/app/tools/your_tool.py` with a function
2. Register it in `backend/app/services/tool_dispatcher.py`
3. Add a `FunctionDeclaration` in `backend/app/routes/websocket.py`

### Testing the WebSocket

```bash
cd backend
.\venv\Scripts\activate
python test_client.py
```

Type messages in the terminal and see the AI respond.

---

## License

MIT
