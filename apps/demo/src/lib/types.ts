export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type ChatStatus = "idle" | "listening" | "processing" | "speaking"

export interface InterviewData {
  firstName: string
  lastName: string
  email: string
  personaId: string
}
