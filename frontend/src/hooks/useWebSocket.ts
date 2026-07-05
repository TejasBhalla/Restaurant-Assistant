"use client"

import { useEffect } from "react"
import { wsService } from "@/services/websocket"
import { useChatStore } from "@/stores/chatStore"
import { useVoiceStore } from "@/stores/voiceStore"
import { useCartStore } from "@/stores/cartStore"
import { submitCheckout } from "@/services/api"

function parseSampleRate(mimeType?: string) {
  const match = mimeType?.match(/rate=(\d+)/)
  return match ? Number(match[1]) : 24000
}

function decodeBase64ToArrayBuffer(base64: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function pcm16ToAudioBuffer(
  context: AudioContext,
  pcmData: ArrayBuffer,
  sampleRate: number
) {
  const samples = new Int16Array(pcmData)
  const audioBuffer = context.createBuffer(1, samples.length, sampleRate)
  const channel = audioBuffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) {
    channel[i] = samples[i] / 0x8000
  }
  return audioBuffer
}

interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext
}

export function useWebSocket() {
  const addMessage = useChatStore((s) => s.addMessage)
  const setConnected = useVoiceStore((s) => s.setConnected)
  const setTranscript = useVoiceStore((s) => s.setTranscript)
  const setSpeaking = useVoiceStore((s) => s.setSpeaking)

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as WindowWithWebkitAudioContext).webkitAudioContext
    const audioContext = AudioCtx ? new AudioCtx() : null
    let nextStartTime = 0
    let speakingTimer: number | null = null

    const enqueueAudio = (pcmData: ArrayBuffer, sampleRate: number) => {
      if (!audioContext) return

      void audioContext.resume()

      const buffer = pcm16ToAudioBuffer(audioContext, pcmData, sampleRate)
      const source = audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(audioContext.destination)

      const startAt = Math.max(audioContext.currentTime, nextStartTime)
      source.start(startAt)
      nextStartTime = startAt + buffer.duration

      setSpeaking(true)
      if (speakingTimer) {
        window.clearTimeout(speakingTimer)
      }
      const remainingMs = Math.max(0, (nextStartTime - audioContext.currentTime) * 1000)
      speakingTimer = window.setTimeout(() => {
        setSpeaking(false)
      }, remainingMs + 50)
    }

    const unsubMessage = wsService.onMessage((data) => {
      if (typeof data === "string") {
        try {
          const json = JSON.parse(data)
          if (json.type === "text") {
            addMessage({ role: "assistant", text: json.text })
            setTranscript(json.text)
          } else if (json.type === "audio" && json.data) {
            const pcm = decodeBase64ToArrayBuffer(json.data)
            enqueueAudio(pcm, parseSampleRate(json.mime_type))
          } else if (json.type === "turn_complete") {
            setTranscript("")
            setSpeaking(false)
          } else if (json.type === "error") {
            addMessage({ role: "system", text: json.text })
          } else if (json.type === "tool_result") {
            const cartStore = useCartStore.getState()
            switch (json.tool) {
              case "add_to_cart":
                cartStore.addItem(json.result.item, json.result.quantity)
                addMessage({
                  role: "system",
                  text: `Added ${json.result.quantity}x ${json.result.item.name} to cart`,
                })
                break
              case "remove_item":
                cartStore.removeItem(json.result.item.id)
                break
              case "update_quantity":
                cartStore.updateQuantity(json.result.item.id, json.result.quantity)
                break
              case "checkout":
                const { items, subtotal, tax, total, clearCart } = useCartStore.getState()
                submitCheckout({
                  customer_name: json.result.customer_name,
                  items: items.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
                }).then(() => {
                  clearCart()
                  window.location.href = "/success"
                })
                break
            }
          }
        } catch {
          addMessage({ role: "assistant", text: data })
        }
      } else if (data instanceof Blob) {
        data.arrayBuffer().then((pcm) => enqueueAudio(pcm, 24000))
      }
    })

    const unsubStatus = wsService.onStatus((status) => {
      setConnected(status === "connected")
    })

    wsService.connect()

    return () => {
      unsubMessage()
      unsubStatus()
      if (speakingTimer) {
        window.clearTimeout(speakingTimer)
      }
      if (audioContext) {
        void audioContext.close()
      }
    }
  }, [addMessage, setConnected, setTranscript, setSpeaking])
}
