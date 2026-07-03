"use client"

import { useRef, useCallback } from "react"
import { useVoiceStore } from "@/stores/voiceStore"

const TARGET_SAMPLE_RATE = 16000
const CHUNK_MS = 100

function downsampleTo16k(input: Float32Array, inputSampleRate: number) {
  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return input
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE
  const outputLength = Math.max(1, Math.round(input.length / ratio))
  const output = new Float32Array(outputLength)

  for (let i = 0; i < outputLength; i++) {
    const idx = i * ratio
    const idxLow = Math.floor(idx)
    const idxHigh = Math.min(idxLow + 1, input.length - 1)
    const weightHigh = idx - idxLow
    output[i] = input[idxLow] * (1 - weightHigh) + input[idxHigh] * weightHigh
  }

  return output
}

function floatToInt16(input: Float32Array) {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

export function useRecorder() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)
  const silentGainRef = useRef<GainNode | null>(null)
  const pendingSamplesRef = useRef<Int16Array>(new Int16Array(0))
  const setListening = useVoiceStore((s) => s.setListening)

  const startRecording = useCallback(
    (
      onChunk: (chunk: Blob) => void,
      onAnalyser?: (analyser: AnalyserNode) => void
    ): Promise<void> => {
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          streamRef.current = stream
          const audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
          audioContextRef.current = audioContext

          const source = audioContext.createMediaStreamSource(stream)
          sourceNodeRef.current = source

          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)
          if (onAnalyser) onAnalyser(analyser)

          const processor = audioContext.createScriptProcessor(4096, 1, 1)
          processorNodeRef.current = processor

          const silentGain = audioContext.createGain()
          silentGain.gain.value = 0
          silentGainRef.current = silentGain

          source.connect(processor)
          processor.connect(silentGain)
          silentGain.connect(audioContext.destination)

          processor.onaudioprocess = (event) => {
            const input = event.inputBuffer.getChannelData(0)
            const downsampled = downsampleTo16k(input, audioContext.sampleRate)
            const int16 = floatToInt16(downsampled)

            const pending = pendingSamplesRef.current
            const merged = new Int16Array(pending.length + int16.length)
            merged.set(pending, 0)
            merged.set(int16, pending.length)
            pendingSamplesRef.current = merged

            const samplesPerChunk = (TARGET_SAMPLE_RATE * CHUNK_MS) / 1000
            while (pendingSamplesRef.current.length >= samplesPerChunk) {
              const chunkSamples = pendingSamplesRef.current.slice(0, samplesPerChunk)
              pendingSamplesRef.current = pendingSamplesRef.current.slice(samplesPerChunk)
              onChunk(new Blob([chunkSamples.buffer], { type: "audio/pcm" }))
            }
          }

          audioContext.resume()
          setListening(true)
        })
    },
    [setListening]
  )

  const stopRecording = useCallback(() => {
    if (pendingSamplesRef.current.length > 0) {
      pendingSamplesRef.current = new Int16Array(0)
    }

    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect()
      processorNodeRef.current.onaudioprocess = null
      processorNodeRef.current = null
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
    }
    if (silentGainRef.current) {
      silentGainRef.current.disconnect()
      silentGainRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setListening(false)
  }, [setListening])

  return { startRecording, stopRecording }
}
