"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";
import { useRouter } from "next/navigation";

type Props = {
  persona?: string;
};

export const LiveAvatarDemo = ({ persona }: Props) => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionEndedRef = useRef(false);
  const router = useRouter();

  // persona varsa otomatik başlat
  useEffect(() => {
    if (
      persona &&
      !sessionToken &&
      !isLoading &&
      !error &&
      !sessionEndedRef.current
    ) {
      startInteraction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);

  const startInteraction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error);
        return;
      }

      const { session_token, session_id } = await res.json();
      setSessionToken(session_token);
      setSessionId(session_id);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`weya-app ${sessionToken ? "mode-chat" : "mode-landing"}`}>
      {sessionToken ? (
        <div className="weya-session-container">
          <LiveAvatarSession
            sessionAccessToken={sessionToken}
            session_id={sessionId}
            onSessionStopped={() => {
              sessionEndedRef.current = true;
              setSessionToken("");
              setSessionId(null);
              router.push("/");
            }}
          />
        </div>
      ) : persona ? (
        <div className="weya-loading-screen">
          {error ? (
            <div className="weya-error">{error}</div>
          ) : (
            <div className="weya-loading">Connecting to Weya…</div>
          )}
        </div>
      ) : (
        <>
          <nav className="weya-navbar">
            <a href="/" className="weya-brand">
              WEYA
            </a>
          </nav>

          <section id="home" className="weya-section">
            <div className="weya-hero-grid">
              <div className="weya-hero-left">
                <h1 className="weya-hero-title">
                  Participate in a foundational interview
                </h1>

                {error && <div className="weya-error">{error}</div>}

                <button
                  className="weya-btn-aurora"
                  disabled={isLoading}
                  onClick={() => router.push("/talk/weya-live")}
                >
                  Start interview
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
