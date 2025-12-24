"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import "./avatar-styles.css";

// 💬 Bileşen: Chat + Video + State
const LiveAvatarSessionComponent: React.FC<{
  onSessionStopped: () => void;
}> = ({ onSessionStopped }) => {
  const [message, setMessage] = useState("");
  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    attachElement,
  } = useSession();
  const { sendMessage } = useTextChat("FULL");
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSending = useRef(false);

  // 🔒 onSessionStopped sadece 1 kez çağrılsın
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED && !stoppedRef.current) {
      stoppedRef.current = true;
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [isStreamReady, attachElement]);

  useEffect(() => {
    if (sessionState === SessionState.INACTIVE && videoRef.current) {
      const t = setTimeout(() => startSession(), 150);
      return () => clearTimeout(t);
    }
  }, [sessionState, startSession]);

  // ✅ Mesaj gönder
  const sendAndLog = async () => {
    if (!message.trim() || isSending.current) return;

    isSending.current = true;
    try {
      await sendMessage(message);
      setMessage("");
    } finally {
      isSending.current = false;
    }
  };

  return (
    <div className="weya-session-wrapper">
      {/* Video Area */}
      <div className="weya-video-frame">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          className="weya-video-element"
        />
        <button
          className="weya-stop-btn"
          onClick={() => {
            // ❗ Parent'i burada kapatma. Sadece SDK'yi durdur.
            // onSessionStopped() DISCONNECTED olunca effect'ten gelecek.
            stopSession();
          }}
        >
          End Session
        </button>
      </div>

      {/* Chat Controls */}
      <div className="weya-chat-controls">
        <input
          type="text"
          className="weya-input-field"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.repeat) {
              e.preventDefault();
              sendAndLog();
            }
          }}
        />
        <button className="weya-send-btn" onClick={sendAndLog}>
          Send
        </button>
      </div>
    </div>
  );
};

// ✅ ANA EXPORT — Context Provider'a session_id geçirildi
export const LiveAvatarSession: React.FC<{
  sessionAccessToken: string;
  session_id: string | null;
  onSessionStopped: () => void;
}> = ({ sessionAccessToken, session_id, onSessionStopped }) => {
  return (
    <LiveAvatarContextProvider
      sessionAccessToken={sessionAccessToken}
      session_id={session_id}
    >
      <LiveAvatarSessionComponent onSessionStopped={onSessionStopped} />
    </LiveAvatarContextProvider>
  );
};
