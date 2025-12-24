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

  useEffect(() => {
    if (sessionState === SessionState.DISCONNECTED) {
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

  // ✅ Mesaj gönderildiğinde hem avatar'a hem log'a git
  const sendAndLog = async () => {
    console.log("🚀 sendAndLog called", {
      message,
      isSending: isSending.current,
    });
    if (!message.trim() || isSending.current) return;

    isSending.current = true;
    try {
      console.log("🚀 calling sendMessage");
      await sendMessage(message);
      // logMessage removed to prevent duplicate logging (handled in context)
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
        <button className="weya-stop-btn" onClick={stopSession}>
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

// ✅ ANA EXPORT — Context Provider'a session_id geçirildi (kritik düzeltme)
export const LiveAvatarSession: React.FC<{
  sessionAccessToken: string;
  session_id: string | null; // <-- eklendi
  onSessionStopped: () => void;
}> = ({ sessionAccessToken, session_id, onSessionStopped }) => {
  return (
    <LiveAvatarContextProvider
      sessionAccessToken={sessionAccessToken}
      session_id={session_id} // <-- 🔥 Artık context'e bu gidiyor
    >
      <LiveAvatarSessionComponent onSessionStopped={onSessionStopped} />
    </LiveAvatarContextProvider>
  );
};
