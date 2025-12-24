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
          {/* NAV */}
          <nav className="weya-navbar">
            <a href="#" className="weya-brand">WEYA</a>
            <div className="weya-nav-menu">
              <a href="#home" className="weya-nav-link">Interview</a>
              <a href="#process" className="weya-nav-link">Process</a>
              <a href="#who" className="weya-nav-link">Who it’s for</a>
            </div>
          </nav>

          {/* HERO */}
          <section id="home" className="weya-section">
            <div className="weya-hero-grid">
              <div className="weya-hero-left">
                <h1 className="weya-hero-title">
                  Participate in a foundational interview
                </h1>

                <p className="weya-hero-text">
                  A short, reflective conversation designed to surface how you
                  think about capital, trust, and coordination.
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
                      Family offices & LPs
                    </option>
                    <option value="fund_builders">
                      Fund builders & conveners
                    </option>
                    <option value="impact_startups">
                      Impact startups
                    </option>
                    <option value="light_eagle">
                      Learn about Light Eagle
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

              <div className="weya-hero-right">
                <h2 className="weya-hero-subtitle">
                  Weya
                  <br />
                  A system-intelligence layer
                </h2>

                <p className="weya-hero-text">
                  Weya listens across conversations and contexts — transforming
                  fragmented signals into shared intelligence.
                </p>
              </div>
            </div>
          </section>

          {/* PROCESS */}
          <section id="process" className="weya-section">
            <h2 className="weya-section-title">How the interview works</h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>1. Guided conversation</h3>
                <p>
                  You speak freely with Weya in a structured but open-ended
                  interview.
                </p>
              </div>
              <div className="weya-card">
                <h3>2. Signal extraction</h3>
                <p>
                  Weya identifies patterns around incentives, alignment, and
                  systemic constraints.
                </p>
              </div>
              <div className="weya-card">
                <h3>3. System learning</h3>
                <p>
                  Your conversation contributes to a broader intelligence
                  layer shaping future coordination.
                </p>
              </div>
            </div>
          </section>

          {/* WHO */}
          <section id="who" className="weya-section">
            <h2 className="weya-section-title">Who this is for</h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>Capital allocators</h3>
                <p>
                  Navigating complexity, timing, and long-term impact.
                </p>
              </div>
              <div className="weya-card">
                <h3>Fund builders</h3>
                <p>
                  Coordinating trust, governance, and capital flows.
                </p>
              </div>
              <div className="weya-card">
                <h3>Impact founders</h3>
                <p>
                  Seeking capital that understands real-world context.
                </p>
              </div>
            </div>
          </section>

          {/* FOOT */}
          <section className="weya-section">
            <p className="weya-hero-text" style={{ maxWidth: 720 }}>
              These interviews are part of an early research phase. Selected
              participants may be invited into deeper collaboration as Weya
              evolves.
            </p>
          </section>
        </>
      )}
    </div>
  );
};
