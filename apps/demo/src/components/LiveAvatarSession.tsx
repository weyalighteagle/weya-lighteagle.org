"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LiveAvatarContextProvider,
  useSession,
  useTextChat,
} from "../liveavatar";
import { SessionState } from "@heygen/liveavatar-web-sdk";
import "./avatar-styles.css";

const LiveAvatarSessionComponent: React.FC<{
  session_id: string | null;
  onSessionStopped: () => void;
}> = ({ session_id, onSessionStopped }) => {
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    attachElement,
  } = useSession();

  const { sendMessage } = useTextChat("FULL");

  const stoppedRef = useRef(false);
  const isSendingRef = useRef(false);
  const leadSentRef = useRef(false);

  /* ===============================
     Session lifecycle
     =============================== */

  useEffect(() => {
    if (
      sessionState === SessionState.DISCONNECTED &&
      !stoppedRef.current
    ) {
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
    if (sessionState === SessionState.INACTIVE) {
      const t = setTimeout(() => startSession(), 150);
      return () => clearTimeout(t);
    }
  }, [sessionState, startSession]);

  /* ===============================
     Form lead → backend (1 kez)
     =============================== */

  useEffect(() => {
    if (
      leadSentRef.current ||
      !session_id ||
      sessionState !== SessionState.ACTIVE
    ) {
      return;
    }

    if (typeof window === "undefined") return;

    const raw = sessionStorage.getItem("form_lead");
    if (!raw) {
      leadSentRef.current = true;
      return;
    }

    try {
      const { firstName, lastName, email } = JSON.parse(raw);

      fetch("/api/form-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          session_id,
        }),
      }).catch(() => {});
    } finally {
      leadSentRef.current = true;
      sessionStorage.removeItem("form_lead");
    }
  }, [session_id, sessionState]);

  /* ===============================
     Chat
     =============================== */

  const sendAndClear = async () => {
    if (!message.trim() || isSendingRef.current) return;

    isSendingRef.current = true;
    try {
      await sendMessage(message);
      setMessage("");
    } finally {
      isSendingRef.current = false;
    }
  };

  return (
    <div className="weya-session-wrapper">
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
            if (!stoppedRef.current) {
              stoppedRef.current = true;
              stopSession();
            }
          }}
        >
          End Session
        </button>
      </div>

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
              sendAndClear();
            }
          }}
        />
        <button
          className="weya-send-btn"
          onClick={sendAndClear}
        >
          Send
        </button>
      </div>
    </div>
  );
};

/* ===============================
   Provider Wrapper
   =============================== */

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
      <LiveAvatarSessionComponent
        session_id={session_id}
        onSessionStopped={onSessionStopped}
      />
    </LiveAvatarContextProvider>
  );
};
