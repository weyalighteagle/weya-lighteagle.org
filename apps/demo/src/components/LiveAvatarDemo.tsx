"use client";

import { useState, useEffect, useRef } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

export const LiveAvatarDemo = ({ persona }: { persona?: string }) => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 session manuel kapandı mı?
  const sessionEndedRef = useRef(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");

  // AUTO START (persona page)
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
    if (!finalPersona) return;

    setIsLoading(true);
    setError(null);
    sessionEndedRef.current = false;

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
            onSessionStopped={() => {
              sessionEndedRef.current = true;
              setSessionToken("");
              setSessionId(null);
            }}
          />
        </div>
      ) : persona ? (
        <div className="weya-session-container" style={{ height: "100vh" }}>
          <div className="weya-loading">Connecting to interview…</div>
        </div>
      ) : (
        <>
          <section className="weya-section">
            <div className="weya-hero-container">
              {/* SOL TARAF */}
              <div
                className="weya-hero-text-side"
                style={{ textAlign: "left", alignItems: "flex-start" }}
              >
                <h1 className="weya-hero-title">
                  Participate in a foundational interview
                </h1>

                <p className="weya-hero-text">
                  Fill out the form to start.
                </p>

                {error && (
                  <div style={{ color: "#ef4444", marginBottom: "0.75rem" }}>
                    {error}
                  </div>
                )}

                <div className="weya-form-box" style={{ maxWidth: 420 }}>
                  <input
                    className="weya-input"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />

                  <input
                    className="weya-input"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />

                  <input
                    className="weya-input"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <select
                    className="weya-input"
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                  >
                    <option value="">Select the model for your interview</option>
                    <option value="family-offices">
                      (1) Family offices and LPs – seeking to place capital with clarity, timing, and systemic leverage
                    </option>
                    <option value="fund-builders">
                      (2) Fund builders and conveners – seeking to scale trust, alignment, and momentum
                    </option>
                    <option value="impact-startups">
                      (3) Impact startups – seeking capital that understands their context
                    </option>
                    <option value="learn-more">
                      (4) Learn more about Light Eagle
                    </option>
                  </select>

                  <button
                    className="weya-btn-aurora"
                    onClick={() => {
                      if (!firstName || !lastName || !email) {
                        setError("Please fill in all fields.");
                        return;
                      }

                      if (!selectedPersona) {
                        setError("Please select an interview type.");
                        return;
                      }

                      const urlMap: Record<string, string> = {
                        "family-offices": "/interview/family-offices",
                        "fund-builders": "/interview/fund-builders",
                        "impact-startups": "/interview/impact-startups",
                        "learn-more": "/about/light-eagle",
                      };

                      window.location.href = urlMap[selectedPersona];
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>

              {/* SAĞ TARAF */}
              <div
                className="weya-hero-visual-side"
                style={{ textAlign: "left" }}
              >
                <h2>
                  <strong>Weya</strong> <br />
                  A system-intelligence layer for capital, trust, and coordination.
                </h2>

                <p>
                  Weya is an AI-enabled system that listens, learns, and connects —
                  transforming conversations into shared intelligence for
                  impact-driven capital.
                </p>

                <p>
                  We are inviting a small group of capital allocators and ecosystem
                  builders to participate in foundational interviews shaping
                  Weya’s next phase.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
