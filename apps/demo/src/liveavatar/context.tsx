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

type LiveAvatarContextProps = {
  sessionRef: React.RefObject<LiveAvatarSession>;

  isMuted: boolean;
  voiceChatState: VoiceChatState;

  sessionState: SessionState;
  isStreamReady: boolean;
  connectionQuality: ConnectionQuality;

  isUserTalking: boolean;
  isAvatarTalking: boolean;

  messages: LiveAvatarSessionMessage[];
};

export const LiveAvatarContext = createContext<LiveAvatarContextProps>({
  sessionRef: {
    current: null,
  } as unknown as React.RefObject<LiveAvatarSession>,
  connectionQuality: ConnectionQuality.UNKNOWN,
  isMuted: true,
  voiceChatState: VoiceChatState.INACTIVE,
  sessionState: SessionState.DISCONNECTED,
  isStreamReady: false,
  isUserTalking: false,
  isAvatarTalking: false,
  messages: [],
});

type LiveAvatarContextProviderProps = {
  children: React.ReactNode;
  sessionAccessToken: string;
};

const useSessionState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [sessionState, setSessionState] = useState<SessionState>(
    sessionRef.current?.state || SessionState.INACTIVE,
  );
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
    sessionRef.current?.connectionQuality || ConnectionQuality.UNKNOWN,
  );
  const [isStreamReady, setIsStreamReady] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionRef.current) return;

    sessionRef.current.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
      setSessionState(state);
      if (state === SessionState.DISCONNECTED) {
        sessionRef.current?.removeAllListeners();
        sessionRef.current?.voiceChat.removeAllListeners();
        setIsStreamReady(false);
      }
    });

    sessionRef.current.on(SessionEvent.SESSION_STREAM_READY, () => {
      setIsStreamReady(true);
    });

    sessionRef.current.on(
      SessionEvent.SESSION_CONNECTION_QUALITY_CHANGED,
      setConnectionQuality,
    );
  }, [sessionRef]);

  return { sessionState, isStreamReady, connectionQuality };
};

const useVoiceChatState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isMuted, setIsMuted] = useState(true);
  const [voiceChatState, setVoiceChatState] = useState<VoiceChatState>(
    sessionRef.current?.voiceChat.state || VoiceChatState.INACTIVE,
  );

  useEffect(() => {
    if (!sessionRef.current) return;

    sessionRef.current.voiceChat.on(VoiceChatEvent.MUTED, () => {
      setIsMuted(true);
    });

    sessionRef.current.voiceChat.on(VoiceChatEvent.UNMUTED, () => {
      setIsMuted(false);
    });

    sessionRef.current.voiceChat.on(
      VoiceChatEvent.STATE_CHANGED,
      setVoiceChatState,
    );
  }, [sessionRef]);

  return { isMuted, voiceChatState };
};

const useTalkingState = (sessionRef: React.RefObject<LiveAvatarSession>) => {
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);

  useEffect(() => {
    if (!sessionRef.current) return;

    sessionRef.current.on(AgentEventsEnum.USER_SPEAK_STARTED, () => {
      setIsUserTalking(true);
    });

    sessionRef.current.on(AgentEventsEnum.USER_SPEAK_ENDED, () => {
      setIsUserTalking(false);
    });

    sessionRef.current.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
      setIsAvatarTalking(true);
    });

    sessionRef.current.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
      setIsAvatarTalking(false);
    });
  }, [sessionRef]);

  return { isUserTalking, isAvatarTalking };
};

export const LiveAvatarContextProvider = ({
  children,
  sessionAccessToken,
}: LiveAvatarContextProviderProps) => {
  const config = {
    voiceChat: true,
    apiUrl: API_URL,
  };

  const sessionRef = useRef<LiveAvatarSession>(
    new LiveAvatarSession(sessionAccessToken, config),
  );

  const { sessionState, isStreamReady, connectionQuality } =
    useSessionState(sessionRef);
  const { isMuted, voiceChatState } = useVoiceChatState(sessionRef);
  const { isUserTalking, isAvatarTalking } = useTalkingState(sessionRef);

  const [messages, setMessages] = useState<LiveAvatarSessionMessage[]>([]);

  // 🔥 FULL TRANSCRIPT AUTO LOGGING
  useEffect(() => {
    const session = sessionRef.current;
    if (!session) return;

    const saveToFile = async (sender: "user" | "avatar", message: string) => {
      await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, message, timestamp: Date.now() }),
      });
    };

    const handleUserTranscription = (event: { text: string }) => {
      if (!event?.text) return;
      setMessages((prev) => [
        ...prev,
        {
          sender: MessageSender.USER,
          message: event.text,
          timestamp: Date.now(),
        },
      ]);
      saveToFile("user", event.text);
    };

    const handleAvatarTranscription = (event: { text: string }) => {
      if (!event?.text) return;
      setMessages((prev) => [
        ...prev,
        {
          sender: MessageSender.AVATAR,
          message: event.text,
          timestamp: Date.now(),
        },
      ]);
      saveToFile("avatar", event.text);
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
  }, [sessionRef]);

  return (
    <LiveAvatarContext.Provider
      value={{
        sessionRef,
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

export const useLiveAvatarContext = () => useContext(LiveAvatarContext);
