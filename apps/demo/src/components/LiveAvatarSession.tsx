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

  const {
    sessionState,
    isStreamReady,
    startSession,
    stopSession,
    attachElement,
  } = useSession();

  const { sendMessage } = useTextChat("FULL");

  const videoRef = useRef<HTMLVideoElement>(null);
  const isSendingRef = useRef(false);
  const stoppedRef = useRef(false);
  const startedRef = useRef(false);

  /* ---------------- SESSION STOP (TEK KEZ) ---------------- */
  useEffect(() => {
    if (
      sessionState === SessionState.DISCONNECTED &&
      !stoppedRef.current
    ) {
      stoppedRef.current = true;
      onSessionStopped();
    }
  }, [sessionState, onSessionStopped]);

  /* ---------------- STREAM ATTACH ---------------- */
  useEffect(() => {
    if (isStreamReady && videoRef.current) {
      attachElement(videoRef.current);
    }
  }, [isStreamReady, attachElement]);

  /* ---------------- SESSION START (GUARDED) ---------------- */
  useEffect(() => {
    if (
      sessionState === SessionState.INACTIVE &&
      !startedRef.current
    ) {
      startedRef.current = true;
      const t = setTimeout(() => startSession(), 150);
      return () => clearTimeout(t);
    }
  }, [sessionState, startSession]);

  /* ---------------- FORM LEAD (SADECE 1 KEZ) ---------------- */
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
          session_id,
        }),
      }).catch(() => {});
    } finally {
      sessionStorage.removeItem("form_lead");
    }
  }, [session_id]);

  /* ---------------- MESSAGE SEND (RACE SAFE) ---------------- */
  const sendAndLog = async () => {
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
      {/* VIDEO */}
      <div className="weya-video-frame">
        <video
          ref={videoRef}
          autoPlay
          playsInline
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

      {/* CHAT */}
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
