type MessageHandler = (data: string | Blob) => void
type StatusHandler = (status: "connected" | "disconnected" | "error") => void

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private messageHandlers: Set<MessageHandler> = new Set()
  private statusHandlers: Set<StatusHandler> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000

  constructor() {
    this.url =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws"
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.notifyStatus("connected")
    }

    this.ws.onmessage = (event) => {
      this.messageHandlers.forEach((handler) => {
        handler(event.data)
      })
    }

    this.ws.onclose = () => {
      this.notifyStatus("disconnected")
      this.tryReconnect()
    }

    this.ws.onerror = () => {
      this.notifyStatus("error")
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  sendText(text: string) {
    this.send(JSON.stringify({ type: "text", text }))
  }

  sendAudio(audio: Blob) {
    this.send(audio)
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler)
    return () => this.statusHandlers.delete(handler)
  }

  private notifyStatus(status: "connected" | "disconnected" | "error") {
    this.statusHandlers.forEach((handler) => handler(status))
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return
    this.reconnectAttempts++
    setTimeout(() => this.connect(), this.reconnectDelay)
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsService = new WebSocketService()
