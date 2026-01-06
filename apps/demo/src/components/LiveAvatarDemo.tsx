"use client";

import { useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionEndedRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const startInteraction = async () => {
    if (!firstName || !lastName || !email) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: "weya_live",
          firstName,
          lastName,
          email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to start session");
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
      {/* ================= SESSION ================= */}
      {sessionToken && (
        <div className="weya-session-container">
          <LiveAvatarSession
            sessionAccessToken={sessionToken}
            session_id={sessionId}
            onSessionStopped={async () => {
              sessionEndedRef.current = true;

              try {
                await fetch("/api/stop-session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    session_token: sessionToken,
                  }),
                });
              } catch (e) {
                console.error("Failed to stop remote session", e);
              }

              setSessionToken("");
              setSessionId(null);
            }}
          />
        </div>
      )}

      {/* ================= LOADING ================= */}
      {!sessionToken && isLoading && (
        <div className="weya-loading-screen">
          <div className="weya-loading">Connecting to Weya…</div>
        </div>
      )}

      {/* ================= LANDING ================= */}
      {!sessionToken && !isLoading && (
        <>
          <nav className="weya-navbar">
            <span className="weya-brand">WEYA</span>

            <div className="weya-nav-menu">
              <a href="#home" className="weya-nav-link">
                AI Companion
              </a>
              <a href="#contact" className="weya-nav-link">
                Contact
              </a>
            </div>
          </nav>

          <section id="home" className="weya-section">
            <div className="weya-hero-grid">
              <div className="weya-hero-left">
                <h1 className="weya-hero-title">
                  Participate in a foundational interview
                </h1>

                <p className="weya-hero-text">
                  Fill out the form to start.
                </p>

                {error && <div className="weya-error">{error}</div>}

                <div className="weya-form-box">
                  <div className="weya-form-row">
                    <input
                      className="weya-input"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      className="weya-input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <input
                    className="weya-input"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button
                    className="weya-btn-aurora"
                    onClick={startInteraction}
                  >
                    Start interview
                  </button>
                </div>
              </div>

              <div className="weya-hero-right">
                <h2 className="weya-hero-subtitle">
                  Weya
                  <br />
                  A system-intelligence layer for capital, trust, and coordination.
                </h2>

                <p className="weya-hero-text">
                  Weya is an AI-enabled system that listens, learns, and connects —
                  transforming conversations into shared intelligence for
                  impact-driven capital.
                </p>

                <p className="weya-hero-text">
                  We are inviting a small group of capital allocators and ecosystem
                  builders to participate in foundational interviews shaping
                  Weya’s next phase.
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="weya-section">
            <div className="weya-content-narrow">
              <h2 className="weya-section-title">Contact</h2>

              <p className="weya-hero-text">
                <strong>weya@lighteagle.org</strong>
              </p>

              <p className="weya-hero-text" style={{ opacity: 0.6 }}>
                © 2025 Light Eagle. All rights reserved.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
