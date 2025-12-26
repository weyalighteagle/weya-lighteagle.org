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

export default function VoiceChatPage() {
    const router = useRouter()
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
    const [formData, setFormData] = useState<InterviewData>({
        firstName: "",
        lastName: "",
        email: "",
        personaId: "",
    })

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

    const mediaRecorderRef = useRef<any>(null)
    const audioChunksRef = useRef<any[]>([])

    const [sessionId, setSessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    const recognitionRef = useRef<any>(null)
    const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const hasGreetedRef = useRef(false)

    // Sync ref
    useEffect(() => {
        statusRef.current = status
    }, [status])

    useEffect(() => {
        // PREVIOUSLY: We defaulted to Guest.
        // NOW: We check session, if empty we show form (interviewData remains null).
        const stored = sessionStorage.getItem("interviewData")
        if (stored) {
            setInterviewData(JSON.parse(stored))
        }
        // If not stored, we stay at null => render form
    }, [])

    useEffect(() => {
        // Only start greeting if we have data (joined chat)
        if (interviewData && messages.length === 0) {
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
    }, [interviewData])

    const selectedPersona = personas.find((p) => p.id === interviewData?.personaId) || personas[0]

    const isFormValid = formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.personaId

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isFormValid) {
            // Save to session for consistency (optional but good)
            sessionStorage.setItem("interviewData", JSON.stringify(formData))
            // Generate a FRESH session ID for this new interview
            setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
            setInterviewData(formData)
        }
    }

    function stopListening() {
        setIsListening(false)
        if (recognitionRef.current) {
            try { recognitionRef.current.abort() } catch (e) { }
        }
        if (mediaRecorderRef.current) {
            if (mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
            }
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
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])
        setLiveCaption("")
        setStatus("processing")

        const ac = new AbortController()
        abortControllerRef.current = ac

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personaId: interviewData?.personaId || selectedPersona?.id,
                    sessionId: sessionId,
                    userMessage: content,
                    mode: mode,
                    userData: {
                        firstName: interviewData?.firstName,
                        lastName: interviewData?.lastName,
                        email: interviewData?.email
                    }
                }),
                signal: ac.signal,
            })

            if (!response.ok) throw new Error("Failed to get response")

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.assistantText || "I could not generate a response.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])

            if (data.assistantText) {
                stopListening()
                setStatus("speaking")
                try {
                    const ttsResponse = await fetch("/api/tts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: data.assistantText,
                            personaId: interviewData?.personaId || selectedPersona?.id
                        }),
                        signal: ac.signal,
                    })

                    if (ttsResponse.ok) {
                        const audioBlob = await ttsResponse.blob()
                        const audioUrl = URL.createObjectURL(audioBlob)
                        const audio = new Audio(audioUrl)
                        audioRef.current = audio
                        stopListening()

                        audio.onended = () => {
                            URL.revokeObjectURL(audioUrl)
                            if (audioRef.current === audio) {
                                audioRef.current = null
                                shouldListenRef.current = true
                                startListening()
                            }
                        }
                        audio.onerror = () => {
                            shouldListenRef.current = true
                            startListening()
                        }
                        await audio.play()
                    } else {
                        shouldListenRef.current = true
                        startListening()
                    }
                } catch (ttsError: any) {
                    if (ttsError.name !== 'AbortError') setStatus("listening")
                }
            } else {
                setStatus("listening")
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') setStatus("idle")
        }
    }

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
                    personaId: interviewData?.personaId || selectedPersona?.id
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
                    }
                }
                await audio.play()
            } else {
                shouldListenRef.current = true
                startListening()
            }
        } catch (err) {
            shouldListenRef.current = true
            startListening()
        }
    }

    async function handleEnableMicrophone() {
        try {
            // Just check permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop())

            setMicPermissionGranted(true)
            shouldListenRef.current = true
            if (!hasGreetedRef.current) playGreeting()
            else startListening()
        } catch (error: any) {
            alert("Microphone access failed: " + error.message)
            setMicPermissionGranted(true)
            shouldListenRef.current = true
            // Proceed even if mic fails, maybe text only?
        }
    }

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

        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            // alert("Speech recognition is not supported.")
            return
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
            setIsListening(true)
            if (statusRef.current === 'idle') setStatus("listening")

            // Whisper recording
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
            }).catch(console.error)
        }

        let lastTranscript = ""

        recognition.onresult = (event: any) => {
            let interim = ""
            let final = ""
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript
                    recognition.stop()
                } else {
                    interim += event.results[i][0].transcript
                }
            }
            if (interim) setLiveCaption(interim)
            if (final) {
                setLiveCaption(final)
                lastTranscript = final
            }
        }

        recognition.onend = async () => {
            setIsListening(false)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
                await new Promise<void>(resolve => {
                    if (mediaRecorderRef.current) mediaRecorderRef.current.onstop = () => resolve()
                    else resolve()
                })
                if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

                if (audioBlob.size > 500 && shouldListenRef.current) {
                    setLiveCaption("Processing speech...")
                    // Attempt Whisper
                    try {
                        const formData = new FormData()
                        formData.append("file", audioBlob)
                        const res = await fetch("/api/stt", { method: "POST", body: formData })
                        const data = await res.json()
                        if (data.text && data.text.trim()) {
                            addUserMessage(data.text, "voice")
                        } else if (lastTranscript && lastTranscript.trim()) {
                            addUserMessage(lastTranscript, "voice")
                        } else if (shouldListenRef.current) {
                            scheduleRestart(500)
                        }
                    } catch (e) {
                        if (lastTranscript && lastTranscript.trim()) {
                            addUserMessage(lastTranscript, "voice")
                        } else if (shouldListenRef.current) {
                            scheduleRestart(500)
                        }
                    }
                } else if (lastTranscript && lastTranscript.trim() && shouldListenRef.current) {
                    addUserMessage(lastTranscript, "voice")
                } else if (shouldListenRef.current) {
                    scheduleRestart(500)
                }
            } else {
                if (shouldListenRef.current) scheduleRestart(500)
                else if (statusRef.current === "listening") setStatus("idle")
            }
        }

        recognition.onerror = (e: any) => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                if (shouldListenRef.current) scheduleRestart(1000)
                else {
                    setIsListening(false)
                    setStatus("idle")
                }
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
        // Clear session and go back to form
        try {
            if (sessionStorage) sessionStorage.removeItem("interviewData")
        } catch (e) { }
        setInterviewData(null)
        setMessages([])
        // Also cleanup media state
        setMicPermissionGranted(false)
        hasGreetedRef.current = false
    }

    if (!interviewData) {
        return (
            <div className="min-h-screen bg-[#F3E8F0]">
                <div className="flex min-h-screen items-center justify-center p-6 lg:p-12">
                    <div className="grid w-full max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
                        {/* Left Column: Form */}
                        <div className="w-full rounded-3xl bg-white p-8 shadow-xl md:p-12">
                            <h1 className="mb-3 text-3xl font-medium tracking-tight text-gray-900">
                                Participate in a foundational interview
                            </h1>
                            <p className="mb-10 text-base text-gray-500">Fill out the form to start.</p>

                            <form onSubmit={handleFormSubmit} className="space-y-8">
                                <div className="grid gap-8 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                                            First name*
                                        </label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full border-b border-gray-300 bg-transparent py-2 text-gray-900 outline-none transition-colors focus:border-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                                            Last name*
                                        </label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full border-b border-gray-300 bg-transparent py-2 text-gray-900 outline-none transition-colors focus:border-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                                        Email*
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full border-b border-gray-300 bg-transparent py-2 text-gray-900 outline-none transition-colors focus:border-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="personaSelect" className="mb-3 block text-base font-medium text-gray-800">
                                        Select the model for your interview
                                    </label>
                                    <select
                                        id="personaSelect"
                                        value={formData.personaId}
                                        onChange={(e) => setFormData({ ...formData, personaId: e.target.value })}
                                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-5 py-4 text-base text-gray-600 shadow-sm outline-none transition-all focus:border-[#7B8FD8] focus:ring-2 focus:ring-[#7B8FD8]/20"
                                        required
                                    >
                                        <option value="">Choose a model...</option>
                                        {personas.map((persona) => (
                                            <option key={persona.id} value={persona.id}>
                                                {persona.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {formData.personaId && (
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={!isFormValid}
                                            className="w-full rounded-xl bg-[#7B8FD8] px-6 py-4 text-base font-medium text-white shadow-lg transition-all hover:bg-[#6B7FC8] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#7B8FD8] disabled:hover:shadow-lg"
                                        >
                                            Start Voice Chat
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Right Column: Text Content */}
                        <div className="flex flex-col justify-center text-center">
                            <h2 className="mb-8 text-6xl font-medium tracking-tight text-[#1A1A2E]">Weya</h2>
                            <p className="mb-12 text-2xl font-medium leading-relaxed text-[#4A4A6A]">
                                A system-intelligence layer for capital, trust, and coordination.
                            </p>
                            <div className="space-y-10 text-lg leading-relaxed text-[#5A5A7A]">
                                <p>
                                    Weya is an AI-enabled system that listens, learns, and connects —
                                </p>
                                <p>
                                    transforming conversations into shared intelligence for impact-driven capital.
                                </p>
                                <p className="mx-auto max-w-lg">
                                    We are inviting a small group of capital allocators and ecosystem builders
                                    to participate in foundational interviews shaping Weya's next phase.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }

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
                        <p className="text-xs text-gray-500">Weya Voice Chat</p>
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
