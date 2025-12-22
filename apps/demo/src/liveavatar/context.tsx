import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  ConnectionQuality,
  LiveAvatarSession,
  SessionState,
  SessionEvent,
  VoiceChatEvent,
  VoiceChatState,
  AgentEventsEnum,
} from "@heygen/liveavatar-web-sdk";
import { LiveAvatarSessionMessage, MessageSender } from "./types";
import { API_URL } from "../../app/api/secrets";

// 🧠 Context tipi
type LiveAvatarContextProps = {
  sessionRef: React.RefObject<LiveAvatarSession>;
  sessionId: string | null;

  isMuted: boolean;
  voiceChatState: VoiceChatState;

  sessionState: SessionState;
  isStreamReady: boolean;
  connectionQuality: ConnectionQuality;

  isUserTalking: boolean;
  isAvatarTalking: boolean;

  messages: LiveAvatarSessionMessage[];
  addMessage: (
    sender: MessageSender,
    text: string,
    inputType?: "text" | "voice",
  ) => void;
};

// 🔌 Varsayılan context objesi
export const LiveAvatarContext = createContext<LiveAvatarContextProps>({
  sessionRef: {
    current: null,
  } as unknown as React.RefObject<LiveAvatarSession>,
  sessionId: null,
  connectionQuality: ConnectionQuality.UNKNOWN,
  isMuted: true,
  voiceChatState: VoiceChatState.INACTIVE,
  sessionState: SessionState.DISCONNECTED,
  isStreamReady: false,
  isUserTalking: false,
  isAvatarTalking: false,
  messages: [],
  addMessage: () => {},
});

// 🎯 GÜNCELLENEN: `session_id` prop olarak alınıyor
type LiveAvatarContextProviderProps = {
  children: React.ReactNode;
  sessionAccessToken: string;
  session_id?: string | null;
};

export const LiveAvatarContextProvider = ({
  children,
  sessionAccessToken,
  session_id,
}: LiveAvatarContextProviderProps) => {
  const config = {
    voiceChat: true,
    apiUrl: API_URL,
  };

  const sessionRef = useRef<LiveAvatarSession>(
    new LiveAvatarSession(sessionAccessToken, config),
  );

  // ✅ Artık state ile uğraşmadan doğrudan kullan
  const sessionId = session_id ?? null;

  // ----- session state -----
  const [sessionState, setSessionState] = useState<SessionState>(
    SessionState.INACTIVE,
  );
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    ConnectionQuality.UNKNOWN,
  );
  const [isStreamReady, setIsStreamReady] = useState(false);

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
      setSessionState(state);
      if (state === SessionState.DISCONNECTED) {
        session.removeAllListeners();
        session.voiceChat.removeAllListeners();
        setIsStreamReady(false);
      }
    });

    session.on(SessionEvent.SESSION_STREAM_READY, () => {
      setIsStreamReady(true);
    });

    session.on(
      SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
      setConnectionQuality,
    );
  }, []);

  // ----- voice chat -----
  const [isMuted, setIsMuted] = useState(true);
  const [voiceChatState, setVoiceChatState] = useState<VoiceChatState>(
    VoiceChatState.INACTIVE,
  );

  useEffect(() => {
    const voiceChat = sessionRef.current.voiceChat;
    voiceChat.on(VoiceChatEvent.MUTED, () => setIsMuted(true));
    voiceChat.on(VoiceChatEvent.UNMUTED, () => setIsMuted(false));
    voiceChat.on(VoiceChatEvent.STATE_CHANGED, setVoiceChatState);
  }, []);

  // ----- talking -----
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  useEffect(() => {
    const session = sessionRef.current;

    session.on(AgentEventsEnum.USER_SPEAK_STARTED, () =>
      setIsUserTalking(true),
    );
    session.on(AgentEventsEnum.USER_SPEAK_ENDED, () => setIsUserTalking(false));

    session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () =>
      setIsAvatarTalking(true),
    );
    session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () =>
      setIsAvatarTalking(false),
    );
  }, []);

  // ---- messages ----
  const [messages, setMessages] = useState<LiveAvatarSessionMessage[]>([]);
  const lastUserMessageRef = useRef<string | null>(null);

  // 🔄 DEDUP: Track last saved message to prevent Text vs Voice duplication
  const lastSavedMessage = useRef<{
    sender: MessageSender;
    text: string;
    // We intentionally store inputType but might ignore it for loose matching
    inputType: "text" | "voice";
    timestamp: number;
  } | null>(null);

  const addMessage = useCallback(
    async (
      sender: MessageSender,
      text: string,
      inputType: "text" | "voice" = "text",
    ) => {
      console.log("🚀 addMessage called", { sender, text, inputType });

      // --- DEDUPLICATION START ---
      const now = Date.now();
      const duplicateWindow = 2000; // 2 seconds window

      if (lastSavedMessage.current) {
        const last = lastSavedMessage.current;
        const isSameSender = last.sender === sender;
        const isSameText = last.text.trim() === text.trim();
        const isRecent = now - last.timestamp < duplicateWindow;

        // CRITICAL FIX: We ignore 'inputType' here.
        // If the user sends "Hello" (text), and then we get "Hello" (voice) from the echo,
        // we want to treat them as the same message and SKIP saving the second one.
        if (isSameSender && isSameText && isRecent) {
          console.warn(
            "🚫 Skipping duplicate message log (Text+Voice overlap):",
            {
              text,
              sender,
              inputType,
              lastInputType: last.inputType,
            },
          );
          return;
        }
      }

      // Update the last saved message ref
      lastSavedMessage.current = {
        sender,
        text: text.trim(),
        inputType,
        timestamp: now,
      };
      // --- DEDUPLICATION END ---

      if (sender === MessageSender.USER) {
        lastUserMessageRef.current = text;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender,
          message: text,
          timestamp: now,
        },
      ]);

      // Map MessageSender to "user" | "avatar" for the API
      const apiSender = sender === MessageSender.USER ? "user" : "avatar";

      try {
        await fetch("/api/save-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: apiSender,
            message: text,
            timestamp: now,
            session_id: sessionId,
            input_type: inputType,
            request_id: Math.random().toString(36).substring(7), // Trace duplicates
          }),
        });
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    },
    [sessionId],
  );

  // 🔥 FULL TRANSCRIPT AUTO LOGGING
  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    const handleUserTranscription = (event: { text: string }) => {
      if (!event?.text) return;

      // 🔍 DEDUP: Ignore if matches last sent text
      const normalizedEvent = event.text.trim().toLowerCase();
      const normalizedLast =
        lastUserMessageRef.current?.trim().toLowerCase() || "";

      // Check if the transcription is contained in the last message or vice versa (fuzzy match)
      if (
        normalizedLast &&
        (normalizedEvent.includes(normalizedLast) ||
          normalizedLast.includes(normalizedEvent))
      ) {
        console.log("🚫 Ignoring duplicate voice transcription:", event.text);
        return;
      }

      addMessage(MessageSender.USER, event.text, "voice");
    };

    const handleAvatarTranscription = (event: { text: string }) => {
      if (!event?.text) return;
      addMessage(MessageSender.AVATAR, event.text, "voice");
    };

    session.on(AgentEventsEnum.USER_TRANSCRIPTION, handleUserTranscription);
    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, handleAvatarTranscription);

    return () => {
      session.off(AgentEventsEnum.USER_TRANSCRIPTION, handleUserTranscription);
      session.off(
        AgentEventsEnum.AVATAR_TRANSCRIPTION,
        handleAvatarTranscription,
      );
    };
  }, [sessionRef, sessionId, addMessage]);

  return (
    <LiveAvatarContext.Provider
      value={{
        sessionRef,
        sessionId,
        sessionState,
        isStreamReady,
        connectionQuality,
        isMuted,
        voiceChatState,
        isUserTalking,
        isAvatarTalking,
        messages,
        addMessage,
      }}
    >
      {children}
    </LiveAvatarContext.Provider>
  );
};

// 🎯 Hook
export const useLiveAvatarContext = () => useContext(LiveAvatarContext);
