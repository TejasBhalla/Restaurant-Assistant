import { create } from "zustand"

interface VoiceStore {
  connected: boolean
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  setConnected: (connected: boolean) => void
  setListening: (listening: boolean) => void
  setSpeaking: (speaking: boolean) => void
  setTranscript: (transcript: string) => void
  reset: () => void
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  connected: false,
  isListening: false,
  isSpeaking: false,
  transcript: "",
  setConnected: (connected) => set({ connected }),
  setListening: (isListening) => set({ isListening }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setTranscript: (transcript) => set({ transcript }),
  reset: () =>
    set({
      connected: false,
      isListening: false,
      isSpeaking: false,
      transcript: "",
    }),
}))
