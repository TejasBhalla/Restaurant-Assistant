export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  text: string
  timestamp: number
}
