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
  session_id: string | null;
  onSessionStopped: () => void;
}> = ({ session_id, onSessionStopped }) => {
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

  // ✅ FORM LEAD + SESSION_ID (SADECE 1 KEZ)
  useEffect(() => {
    if (!session_id) return;

    const raw = sessionStorage.getItem("form_lead");
    if (!raw) return;

    try {
      const { firstName, lastName, email } = JSON.parse(raw);

      fetch("/api/form-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          session_id, // ✅ EKLENDİ
        }),
      }).catch(() => { });
    } finally {
      sessionStorage.removeItem("form_lead");
    }
  }, [session_id]);

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

export const LiveAvatarSession: React.FC<{
  sessionAccessToken: string;
  session_id: string | null;
  onSessionStopped: () => void;
  saveMessageEndpoint?: string;
}> = ({ sessionAccessToken, session_id, onSessionStopped, saveMessageEndpoint }) => {
  return (
    <LiveAvatarContextProvider
      sessionAccessToken={sessionAccessToken}
      session_id={session_id}
      saveMessageEndpoint={saveMessageEndpoint}
    >
      <LiveAvatarSessionComponent
        session_id={session_id}
        onSessionStopped={onSessionStopped}
      />
    </LiveAvatarContextProvider>
  );
};
