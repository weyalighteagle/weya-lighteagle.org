"use client"

import { useEffect, useRef } from "react"
import type { Message } from "@/lib/types"

interface ChatTranscriptProps {
  messages: Message[]
}

export function ChatTranscript({ messages }: ChatTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
              <p>Your conversation will appear here</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-1.5 ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500 ml-1">
                    {message.role === "user" ? "You" : "Assistant"}
                  </p>
                  <div
                    className={`rounded-2xl px-5 py-3.5 shadow-sm text-base leading-relaxed ${message.role === "user"
                      ? "bg-[#B69DF8] text-white rounded-br-none"
                      : "bg-white/90 text-gray-800 backdrop-blur-sm rounded-bl-none border border-gray-100"
                      }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>
    </div>
  )
}
