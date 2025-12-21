"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

export const LiveAvatarDemo = ({ persona }: { persona?: string }) => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-chat form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");

  const router = useRouter();

  // AUTO START (persona page)
  useEffect(() => {
    if (persona && !sessionToken && !isLoading && !error) {
      startInteraction(persona);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona]);

  /**
   * 1️⃣ FORM VERİSİNİ save-message'e YAZ
   * (API validation ile birebir uyumlu)
   */
  const saveFormMessage = async (finalPersona: string) => {
    try {
      await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 🔒 save-message'in zorunlu alanları
          sender: "user",
          message: "pre-chat form submitted",
          session_id: "pre-session",

          // 🔥 FORM DATASI
          input_type: "form",
          user_name: `${firstName} ${lastName}`.trim(),
          user_email: email,
          persona: finalPersona,
        }),
      });
    } catch (err) {
      console.error("❌ save-message form error:", err);
      // intentionally silent
    }
  };

  /**
   * 2️⃣ LIVE SESSION BAŞLAT
   */
  const startInteraction = async (forcedPersona?: string) => {
    const finalPersona = forcedPersona || selectedPersona;

    if (!finalPersona) {
      setError("Please select a Weya experience.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 🔥 ÖNCE FORMU KAYDET
      await saveFormMessage(finalPersona);

      // 🔥 SONRA SESSION BAŞLAT
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
              setSessionToken("");
              setSessionId(null);
              router.push("/");
            }}
          />
        </div>
      ) : persona ? (
        <div
          className="weya-session-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          {error ? (
            <div style={{ color: "#ef4444", marginBottom: "1rem" }}>
              {error}
            </div>
          ) : (
            <div className="weya-loading">
              Connecting to{" "}
              {persona === "weya_live" ? "Weya Live" : "Weya Startup"}…
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
            <div className="weya-hero-container">
              <div className="weya-hero-text-side">
                <h1 className="weya-hero-title">
                  Start a conversation with <span>Weya</span>
                </h1>

                <p className="weya-hero-text">
                  Experience a live AI companion designed for impact investing
                  and systemic change. Fill out the form to begin.
                </p>

                {error && (
                  <div style={{ color: "#ef4444", marginBottom: "0.75rem" }}>
                    {error}
                  </div>
                )}

                <div className="weya-form-box" style={{ maxWidth: 420 }}>
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

                  <input
                    className="weya-input"
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <select
                    className="weya-input"
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                  >
                    <option value="">Select a Weya experience</option>
                    <option value="weya_live">Weya Live</option>
                    <option value="weya_startup">Weya Startup</option>
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
                        setError("Please select a Weya experience.");
                        return;
                      }

                      startInteraction(selectedPersona);
                    }}
                  >
                    {isLoading ? "Starting…" : "Start live session"}
                  </button>
                </div>
              </div>

              <div className="weya-hero-visual-side">
                <img
                  src="/weya.jpeg"
                  alt="Weya AI Avatar"
                  className="weya-avatar-img"
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
