"use client"

import { useCallback, useRef, useState } from "react"
import { wsService } from "@/services/websocket"
import { useRecorder } from "./useRecorder"
import { useVoiceStore } from "@/stores/voiceStore"

export function useVoice() {
  const [analyserNode, setAnalyserNode] =
    useState<AnalyserNode | null>(null)
  const isListening = useVoiceStore((s) => s.isListening)
  const { startRecording, stopRecording } = useRecorder()
  const analyserRef = useRef<AnalyserNode | null>(null)

  const handleChunk = useCallback((chunk: Blob) => {
    wsService.sendAudio(chunk)
  }, [])

  const handleAnalyser = useCallback((analyser: AnalyserNode) => {
    analyserRef.current = analyser
    setAnalyserNode(analyser)
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopRecording()
      setAnalyserNode(null)
    } else {
      startRecording(handleChunk, handleAnalyser)
    }
  }, [isListening, startRecording, stopRecording, handleChunk, handleAnalyser])

  return {
    isListening,
    toggleListening,
    analyserNode,
  }
}
