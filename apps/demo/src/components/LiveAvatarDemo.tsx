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
              {persona === "family_offices"
                ? "Family Offices & LPs"
                : persona === "fund_builders"
                ? "Fund Builders"
                : persona === "impact_startups"
                ? "Impact Startups"
                : persona === "light_eagle"
                ? "Light Eagle"
                : "Weya"}
              …
            </div>
          )}
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
                          url = "/interview/knowledgebase1";
                          break;
                        case "fund_builders":
                          url = "/interview/knowledgebase2";
                          break;
                        case "impact_startups":
                          url = "/interview/knowledgebase3";
                          break;
                        case "light_eagle":
                          url = "/interview/knowledgebase4";
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

          <section id="about" className="weya-section">
            <div className="weya-content-narrow">
              <h2 className="weya-section-title">
                Why these interviews matter
              </h2>

              <p className="weya-hero-text">
                Conversations about capital and impact are usually fragmented —
                spread across private rooms, decks, and informal networks.
              </p>

              <p className="weya-hero-text">
                These interviews are an attempt to listen across roles and
                contexts, and surface how people actually reason and decide.
              </p>

              <p className="weya-hero-text">
                Not pitches. Not surveys.
                <br />
                Just structured listening.
              </p>
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
