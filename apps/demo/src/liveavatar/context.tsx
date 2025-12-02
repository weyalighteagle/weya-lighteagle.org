import { createContext, useContext, useEffect, useRef, useState } from "react";
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
};

// 🔌 Varsayılan context objesi
export const LiveAvatarContext = createContext<LiveAvatarContextProps>({
  sessionRef: { current: null } as any,
  sessionId: null,
  connectionQuality: ConnectionQuality.UNKNOWN,
  isMuted: true,
  voiceChatState: VoiceChatState.INACTIVE,
  sessionState: SessionState.DISCONNECTED,
  isStreamReady: false,
  isUserTalking: false,
  isAvatarTalking: false,
  messages: [],
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

  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    const saveToFile = async (sender: "user" | "avatar", message: string) => {
      await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          message,
          timestamp: Date.now(),
          session_id: sessionId,
        }),
      });
    };

    session.on(AgentEventsEnum.USER_TRANSCRIPTION, (event: any) => {
      if (!event?.text) return;
      const userMessage = {
        sender: MessageSender.USER,
        message: event.text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      saveToFile("user", event.text);
    });

    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (event: any) => {
      if (!event?.text) return;
      const avatarMessage = {
        sender: MessageSender.AVATAR,
        message: event.text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, avatarMessage]);
      saveToFile("avatar", event.text);
    });
  }, [sessionId]);

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
      }}
    >
      {children}
    </LiveAvatarContext.Provider>
  );
};

// 🎯 Hook
export const useLiveAvatarContext = () => useContext(LiveAvatarContext);
