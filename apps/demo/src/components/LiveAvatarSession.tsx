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
            if (e.key === "Enter") {
              sendMessage(message);
              setMessage("");
            }
          }}
        />
        <button
          className="weya-send-btn"
          onClick={() => {
            sendMessage(message);
            setMessage("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export const LiveAvatarSession: React.FC<{
  sessionAccessToken: string;
  onSessionStopped: () => void;
}> = ({ sessionAccessToken, onSessionStopped }) => {
  return (
    <LiveAvatarContextProvider sessionAccessToken={sessionAccessToken}>
      <LiveAvatarSessionComponent onSessionStopped={onSessionStopped} />
    </LiveAvatarContextProvider>
  );
};
