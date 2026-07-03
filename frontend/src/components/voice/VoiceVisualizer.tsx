"use client"

import { useVoice } from "@/hooks/useVoice"
import { MicButton } from "./MicButton"
import { Waveform } from "./Waveform"
import { useVoiceStore } from "@/stores/voiceStore"

export function VoiceVisualizer() {
  const { isListening, toggleListening, analyserNode } = useVoice()
  const connected = useVoiceStore((s) => s.connected)

  return (
    <div className="flex flex-col items-center gap-3">
      <Waveform analyserNode={analyserNode} isActive={isListening} />
      <MicButton
        isListening={isListening}
        onClick={toggleListening}
        disabled={!connected}
      />
    </div>
  )
}
