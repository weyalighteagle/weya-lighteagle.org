"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

type Props = {
  persona?: string;
};

export const LiveAvatarDemo = ({ persona }: Props) => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionEndedRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");

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

    if (!finalPersona) {
      setError("Please select an interview type.");
      return;
    }

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
        <div className="weya-loading-screen">
          {error ? (
            <div className="weya-error">{error}</div>
          ) : (
            <div className="weya-loading">
              Connecting to{" "}
              {persona === "weya_live" ? "Weya Live" : "Weya Startup"}…
            </div>
          )}
        </div>
      ) : (
        <>
          {/* NAVBAR */}
          <nav className="weya-navbar">
            <a href="#" className="weya-brand">WEYA</a>

            <div className="weya-nav-menu">
              <a href="#home" className="weya-nav-link">AI Companion</a>
            </div>
          </nav>

          {/* HERO */}
          <section id="home" className="weya-section">
            <div className="weya-hero-grid">
              {/* LEFT */}
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

                  <select
                    className="weya-input"
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                  >
                    <option value="">
                      Select the model for your interview
                    </option>
                    <option value="family_offices">
                      Family offices and LPs — seeking to place capital with
                      clarity, timing, and systemic leverage
                    </option>
                    <option value="fund_builders">
                      Fund builders and conveners — seeking to scale trust,
                      alignment, and momentum
                    </option>
                    <option value="impact_startups">
                      Impact startups — seeking capital that understands their
                      context
                    </option>
                    <option value="light_eagle">
                      Learn more about Light Eagle
                    </option>
                  </select>

                  <button
                    className="weya-btn-aurora"
                    disabled={isLoading}
                    onClick={() => {
                      if (!firstName || !lastName || !email) {
                        setError("Please fill in all fields.");
                        return;
                      }

                      if (!selectedPersona) {
                        setError("Please select an interview type.");
                        return;
                      }

                      let url = "";

                      switch (selectedPersona) {
                        case "family_offices":
                          url = "/interview/family-offices-lps";
                          break;
                        case "fund_builders":
                          url = "/interview/fund-builders";
                          break;
                        case "impact_startups":
                          url = "/interview/impact-startups";
                          break;
                        case "light_eagle":
                          url = "/light-eagle";
                          break;
                        default:
                          return;
                      }

                      window.location.href = url;
                    }}
                  >
                    Start interview
                  </button>
                </div>
              </div>

              {/* RIGHT */}
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
                  We are inviting a small group of capital allocators and
                  ecosystem builders to participate in foundational interviews
                  shaping Weya’s next phase.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="weya-footer">
            <a href="#about" className="weya-footer-link">About</a>
            <a href="#contact" className="weya-footer-link">Contact</a>
          </footer>
        </>
      )}
    </div>
  );
};
