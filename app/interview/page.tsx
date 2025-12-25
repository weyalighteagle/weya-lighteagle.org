"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mic, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { personas } from "@/lib/personas"
import type { ChatStatus, Message, InterviewData } from "@/lib/types"
import { VoiceOrb } from "@/components/voice-orb"
import { ChatTranscript } from "@/components/chat-transcript"
import { StatusBadge } from "@/components/status-badge"

export default function InterviewPage() {
  const router = useRouter()
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [status, setStatus] = useState<ChatStatus>("idle")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [liveCaption, setLiveCaption] = useState("")

  const statusRef = useRef<ChatStatus>(status)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const shouldListenRef = useRef(false)

  // Audio recording refs
  const mediaRecorderRef = useRef<any>(null)
  const audioChunksRef = useRef<any[]>([])

  // Stable session ID
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  // Keep ref in sync
  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const stored = sessionStorage.getItem("interviewData")
    if (stored) {
      setInterviewData(JSON.parse(stored))
    } else {
      router.push("/")
    }

    // Initial Greeting
    if (messages.length === 0) {
      const initialGreeting: Message = {
        id: "init-greeting",
        role: "assistant",
        content: "Hi! I am Weya the digital member of Light Eagle. How can I assist you?",
        timestamp: new Date(),
      }
      setMessages([initialGreeting])
    }

    return () => {
      stopEverything()
    }
  }, [router])

  const selectedPersona = personas.find((p) => p.id === interviewData?.personaId)

  function stopListening() {
    setIsListening(false)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        // ignore
      }
    }
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      // CRITICAL: Stop the actual media tracks to release the microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
    }
  }

  function stopEverything() {
    shouldListenRef.current = false
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
    stopListening()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  async function addUserMessage(content: string, mode: "voice" | "text" = "text") {
    // 1. Stop any current audio or pending requests (Interruption logic)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 2. Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setLiveCaption("")
    setStatus("processing")

    // 3. Create new AbortController for this request
    const ac = new AbortController()
    abortControllerRef.current = ac

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personaId: interviewData?.personaId,
          sessionId: sessionId,
          userMessage: content,
          mode: mode, // Pass the input mode
          userData: {
            firstName: interviewData?.firstName,
            lastName: interviewData?.lastName,
            email: interviewData?.email
          }
        }),
        signal: ac.signal,
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.assistantText || "I could not generate a response.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Attempt TTS if we have text
      if (data.assistantText) {
        stopListening()
        setStatus("speaking")
        console.log("Requesting TTS for:", data.assistantText.substring(0, 50) + "...")
        try {
          const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: data.assistantText,
              personaId: interviewData?.personaId
            }),
            signal: ac.signal,
          })

          if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.blob()
            if (audioBlob.size < 100) {
              console.error("TTS blob too small, likely error", audioBlob.size)
            }
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            audioRef.current = audio

            // Stop listening while speaking
            stopListening()

            audio.onended = () => {
              console.log("Audio ended naturally")
              URL.revokeObjectURL(audioUrl)
              if (audioRef.current === audio) {
                audioRef.current = null
                // Resume listening
                shouldListenRef.current = true
                startListening()
              }
            }

            audio.onerror = (e) => {
              console.error("Audio playback error", e)
              shouldListenRef.current = true
              startListening()
            }

            console.log("Playing audio...")
            await audio.play()
          } else {
            console.error("TTS failed:", ttsResponse.status, await ttsResponse.text())
            shouldListenRef.current = true
            startListening()
          }
        } catch (ttsError: any) {
          if (ttsError.name !== 'AbortError') {
            console.error("TTS playback error:", ttsError)
          }
          setStatus("listening")
        }
      } else {
        setStatus("listening")
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Chat error:", error)
        setStatus("idle")
      }
    }
  }

  const hasGreetedRef = useRef(false)

  async function playGreeting() {
    if (hasGreetedRef.current) return
    const greetingText = "Hi! I am Weya the digital member of Light Eagle. How can I assist you?"
    hasGreetedRef.current = true

    stopListening()
    setStatus("speaking")

    try {
      const ttsResponse = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: greetingText,
          personaId: interviewData?.personaId
        }),
      })

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          if (audioRef.current === audio) {
            audioRef.current = null
            shouldListenRef.current = true
            startListening()
            // Ensure we kick off speech recognition again effectively
            if (!isListening) startListening()
          }
        }
        await audio.play()
      } else {
        const errText = await ttsResponse.text()
        console.error("Greeting TTS failed:", ttsResponse.status, errText)
        shouldListenRef.current = true
        startListening()
      }
    } catch (err) {
      console.error("Greeting Error", err)
      shouldListenRef.current = true
      startListening()
    }
  }

  async function handleEnableMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop())

      setMicPermissionGranted(true)
      shouldListenRef.current = true

      if (!hasGreetedRef.current) {
        playGreeting()
      } else {
        startListening()
      }
    } catch (error: any) {
      alert("Microphone access failed: " + error.message)
      setMicPermissionGranted(true)
      shouldListenRef.current = true
      if (!hasGreetedRef.current) playGreeting()
      else startListening()
    }
  }

  const recognitionRef = useRef<any>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  function scheduleRestart(delay: number) {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current)
    restartTimeoutRef.current = setTimeout(() => {
      startListening()
    }, delay)
  }

  function startListening() {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (e) { }
      recognitionRef.current = null
    }

    // Cleanup potential leftover streams
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      mediaRecorderRef.current = null
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false // Stop after one sentence
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      console.log("Recognition started")
      setIsListening(true)
      if (statusRef.current === 'idle') setStatus("listening")

      // --- WHISPER INTEGRATION: START RECORDING ---
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        if (!shouldListenRef.current) {
          // Cleanup immediately if we stopped listening while waiting for permission
          stream.getTracks().forEach(track => track.stop())
          return
        }
        const mimeType = 'audio/webm;codecs=opus'
        const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType, bitsPerSecond: 32000 } : undefined

        const mediaRecorder = new MediaRecorder(stream, options)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data)
        }
        mediaRecorder.start(1000)
      }).catch(err => console.error("Error starting media recorder:", err))
    }

    let lastTranscript = ""

    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
          // If we get a final result from VAD, stop explicitly (redundant with continuous=false but safe)
          recognition.stop()
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (interim) setLiveCaption(interim)
      if (final) {
        setLiveCaption(final)
        lastTranscript = final // Store for fallback
      }
    }

    recognition.onend = async () => {
      console.log("Recognition ended")
      setIsListening(false)

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()

        await new Promise<void>(resolve => {
          if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = () => resolve()
          else resolve()
        })

        // STOP TRACKS TO RELEASE MIC
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

        // 1. Try Whisper API first (Best quality)
        if (audioBlob.size > 500 && shouldListenRef.current) {
          setLiveCaption("Processing speech...")
          try {
            const formData = new FormData()
            formData.append("file", audioBlob)

            const res = await fetch("/api/stt", { method: "POST", body: formData })
            const data = await res.json()

            if (data.text && data.text.trim()) {
              addUserMessage(data.text, "voice")
            } else if (lastTranscript && lastTranscript.trim()) {
              // Fallback to local transcript if Whisper returns empty
              console.log("Whisper empty, using fallback:", lastTranscript)
              addUserMessage(lastTranscript, "voice")
            } else {
              if (shouldListenRef.current) scheduleRestart(500)
            }
          } catch (e) {
            // Fallback to local transcript if Whisper errors
            if (lastTranscript && lastTranscript.trim()) {
              console.log("Whisper failed, using fallback:", lastTranscript)
              addUserMessage(lastTranscript, "voice")
            } else {
              if (shouldListenRef.current) scheduleRestart(500)
            }
          }
        }
        // 2. If blob is too small but we have local text, use it!
        else if (lastTranscript && lastTranscript.trim() && shouldListenRef.current) {
          console.log("Audio small, using fallback:", lastTranscript)
          addUserMessage(lastTranscript, "voice")
        }
        else {
          if (shouldListenRef.current) scheduleRestart(500)
        }
      } else {
        if (shouldListenRef.current) scheduleRestart(500)
        else if (statusRef.current === "listening") setStatus("idle")
      }
    }

    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        console.error("Speech permission error:", e.error)
        if (shouldListenRef.current) {
          scheduleRestart(1000)
        } else {
          setIsListening(false)
          setStatus("idle")
          alert("Microphone access blocked. Please re-enable permissions in your browser.")
        }
      } else if (e.error !== 'no-speech') {
        console.error("Speech error", e.error)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue)
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEndInterview = () => {
    stopEverything()
    try {
      if (sessionStorage) sessionStorage.removeItem("interviewData")
    } catch (e) { }
    // Hard reload to ensure all media tracks are definitely released
    window.location.href = "/"
  }

  if (!interviewData) return null

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#E8E5F5] via-[#F3E8F0] to-[#F5E8EB]">
      <header className="flex items-center justify-between border-b border-white/40 bg-white/30 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleEndInterview} className="group flex items-center gap-2 rounded-full px-4 hover:bg-white/50">
            <ArrowLeft className="h-5 w-5 text-gray-700 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium text-gray-700">Go Back</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{selectedPersona?.label}</h1>
            <p className="text-xs text-gray-500">Weya Interview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleEndInterview}
            className="rounded-full bg-red-500 px-6 font-medium text-white hover:bg-red-600 shadow-md transition-all hover:scale-105"
          >
            End Interview
          </Button>
          <StatusBadge status={status} />
        </div>
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute inset-0 z-0 pb-32">
          <ChatTranscript messages={messages} />
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-[#F5E8EB] via-[#F5E8EB]/80 to-transparent pb-12 pt-24">
          <div className="mb-4">
            {liveCaption && (
              <div className="rounded-lg bg-black/5 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm">
                {liveCaption}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-32 left-0 right-0 z-0 mx-auto flex justify-center">
            <VoiceOrb status={status} />
          </div>

          <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-4 px-4">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="h-14 rounded-2xl border-white/50 bg-white/50 pl-6 pr-14 text-base shadow-sm backdrop-blur-sm transition-all focus:bg-white focus:ring-2 focus:ring-[#7B8FD8]/20"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-[#7B8FD8] hover:bg-[#6B7FC8] disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>

            {!micPermissionGranted ? (
              <Button size="lg" onClick={handleEnableMicrophone} className="h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-gray-50">
                <Mic className="h-6 w-6 text-gray-700" />
              </Button>
            ) : (
              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="lg"
                onClick={() => {
                  if (isListening) {
                    shouldListenRef.current = false
                    if (recognitionRef.current) recognitionRef.current.stop()
                    setIsListening(false)
                  } else {
                    shouldListenRef.current = true
                    startListening()
                  }
                }}
                className={`h-14 w-14 rounded-2xl shadow-sm transition-all ${isListening ? "bg-red-50 text-red-600 hover:bg-red-100 ring-2 ring-red-100" : "bg-white text-gray-700 hover:bg-gray-50"}`}
              >
                {isListening ? (
                  <div className="h-3 w-3 rounded-sm bg-current" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
