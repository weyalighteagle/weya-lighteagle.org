"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";
import { useRouter } from "next/navigation";

type Props = {
  persona?: string;
};

export const LiveAvatarDemo = ({ persona }: Props) => {
  // 🔒 DEFAULT PERSONA (fallback)
  const FIXED_PERSONA = "weya_live";

  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionEndedRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // ✅ TEK KRİTİK DÜZELTME (SATIR SİLİNMEDİ)
  const selectedPersona = persona || FIXED_PERSONA;

  const router = useRouter();

  useEffect(() => {
    if (
      persona &&
      !sessionToken &&
      !isLoading &&
      !error &&
      !sessionEndedRef.current
    ) {
      startInteraction(persona);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);

  const startInteraction = async (forcedPersona?: string) => {
    const finalPersona = forcedPersona || selectedPersona;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: finalPersona,
          firstName,
          lastName,
          email,
        }),
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
              router.push("/");
            }}
          />
        </div>
      ) : (
        <>
          <nav className="weya-navbar">
            <a href="#" className="weya-brand">
              WEYA
            </a>

            <div className="weya-nav-menu">
              <a href="#home" className="weya-nav-link">
                AI Companion
              </a>
              <a href="#about" className="weya-nav-link">
                About
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

                <p className="weya-hero-text">Fill out the form to start.</p>

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

                  {/* 👻 SELECT AYNI, KİLİTLİ */}
                  <select
                    className="weya-input"
                    value={selectedPersona}
                    disabled
                    aria-hidden="true"
                    style={{ display: "none" }}
                  >
                    <option value="weya_live">Weya Live</option>
                  </select>

                  <button
                    className="weya-btn-aurora"
                    disabled={isLoading}
                    onClick={() => {
                      if (!firstName || !lastName || !email) {
                        setError("Please fill in all fields.");
                        return;
                      }

                      sessionStorage.setItem(
                        "form_lead",
                        JSON.stringify({
                          firstName,
                          lastName,
                          email,
                        })
                      );

                      window.location.href = "/interview/weya-live";
                    }}
                  >
                    Start interview
                  </button>
                </div>
              </div>

              <div className="weya-hero-right">
                <h2 className="weya-hero-subtitle">
                  Weya
                  <br />
                  A system-intelligence layer for capital, trust, and
                  coordination.
                </h2>

                <p className="weya-hero-text">
                  Weya is an AI-enabled system that listens, learns, and connects
                  — transforming conversations into shared intelligence for
                  impact-driven capital.
                </p>

                <p className="weya-hero-text">
                  We are inviting a small group of capital allocators and
                  ecosystem builders to participate in foundational interviews
                  shaping Weya’s next phase.
                </p>
              </div>
            </div>
          </section>

          <section className="weya-section">
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>1. Guided conversation</h3>
                <p>
                  You speak with Weya in a reflective, open-ended interview
                  tailored to your role.
                </p>
              </div>
              <div className="weya-card">
                <h3>2. Pattern recognition</h3>
                <p>
                  Weya identifies recurring themes around incentives, timing, and
                  coordination.
                </p>
              </div>
              <div className="weya-card">
                <h3>3. Shared intelligence</h3>
                <p>
                  Insights contribute to a growing system-level understanding of
                  impact capital.
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="weya-section">
            <div className="weya-content-narrow">
              <h2 className="weya-section-title">Contact</h2>

              <p className="weya-hero-text">
                If you’re interested in learning more or participating beyond
                the interview, you can reach us at:
              </p>

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
