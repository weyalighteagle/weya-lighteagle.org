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
        setError(errorData.error || "Failed to start session");
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
              <a href="#how" className="weya-nav-link">How it works</a>
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
                  A 1:1 conversation designed to surface how you think about
                  capital, trust, and systemic change.
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
                    <option value="">Select interview type</option>
                    <option value="family_offices">Family offices & LPs</option>
                    <option value="fund_builders">Fund builders & conveners</option>
                    <option value="impact_startups">Impact startups</option>
                    <option value="light_eagle">Learn about Light Eagle</option>
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

                      const routes: Record<string, string> = {
                        family_offices: "/interview/family-offices-lps",
                        fund_builders: "/interview/fund-builders",
                        impact_startups: "/interview/impact-startups",
                        light_eagle: "/light-eagle",
                      };

                      window.location.href = routes[selectedPersona];
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
                  System intelligence for capital & coordination
                </h2>

                <p className="weya-hero-text">
                  Weya listens across conversations and contexts — turning
                  fragmented signals into shared intelligence.
                </p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" className="weya-section">
            <h2 className="weya-section-title">How this works</h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>1. Conversation</h3>
                <p>
                  You speak with Weya in a guided, reflective interview tailored
                  to your role in the ecosystem.
                </p>
              </div>
              <div className="weya-card">
                <h3>2. Signal extraction</h3>
                <p>
                  Weya identifies patterns around incentives, trust, timing,
                  and decision-making.
                </p>
              </div>
              <div className="weya-card">
                <h3>3. Shared intelligence</h3>
                <p>
                  Insights contribute to a growing system-level understanding
                  of impact capital flows.
                </p>
              </div>
            </div>
          </section>

          {/* WHO IT’S FOR */}
          <section id="who" className="weya-section">
            <h2 className="weya-section-title">Who this is for</h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>Capital allocators</h3>
                <p>
                  Family offices and LPs navigating complexity, timing, and
                  long-term alignment.
                </p>
              </div>
              <div className="weya-card">
                <h3>Fund builders</h3>
                <p>
                  People convening capital and trust across fragmented systems.
                </p>
              </div>
              <div className="weya-card">
                <h3>Founders</h3>
                <p>
                  Impact-driven teams seeking capital that understands context,
                  not just metrics.
                </p>
              </div>
            </div>
          </section>

          {/* WHAT NEXT */}
          <section className="weya-section">
            <h2 className="weya-section-title">What happens next</h2>
            <p className="weya-hero-text" style={{ maxWidth: 720 }}>
              These interviews shape Weya’s evolution and inform future
              collaborations, research, and capital alignment initiatives.
              Selected participants may be invited into deeper conversations.
            </p>
          </section>
        </>
      )}
    </div>
  );
};
