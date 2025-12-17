"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

export const LiveAvatarDemo = ({ persona }: { persona?: string }) => {
  const [sessionToken, setSessionToken] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Auto-start if persona provided
  useEffect(() => {
    if (persona && !sessionToken && !isLoading && !error) {
      startInteraction(persona);
    }
  }, [persona]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔥 SESSION TOKEN + SESSION ID BURADA GELİYOR
  const startInteraction = async (persona?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/start-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
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

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const subject = `Weya Contact: Message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    window.location.href = `mailto:gulfem@lighteagle.org?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
              {persona === "weya_live" ? "Weya Live" : "Weya Startup"}...
            </div>
          )}
        </div>
      ) : (
        <>
          <nav className="weya-navbar">
            <a href="#" className="weya-brand">
              WEYA
            </a>

            <button
              className="weya-mobile-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span
                className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
              ></span>
            </button>

            <div
              className={`weya-nav-menu ${isMobileMenuOpen ? "active" : ""}`}
            >
              <a
                href="#home"
                className="weya-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Companion
              </a>
              <a
                href="#about"
                className="weya-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="weya-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
            </div>
          </nav>

          <section id="home" className="weya-section">
            <div className="weya-hero-container">
              <div className="weya-hero-text-side">
                <h1 className="weya-hero-title">
                  Meet <span>Weya</span>
                </h1>
                <p className="weya-hero-text">
                  Your intelligent guide to impact investing and systemic
                  change. Experience the digital embodiment of Light
                  Eagle&apos;s vision.
                </p>

                {error && (
                  <div style={{ color: "#ef4444", marginBottom: "1rem" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href="/talk/weya-live" className="weya-btn-aurora">
                    Talk to Weya
                  </Link>
                  <Link href="/talk/weya-startup" className="weya-btn-aurora">
                    Talk to Weya 2
                  </Link>
                </div>
              </div>

              <div className="weya-hero-visual-side">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/weya.jpeg"
                  alt="Weya AI Avatar"
                  className="weya-avatar-img"
                />
              </div>
            </div>
          </section>

          <section id="about" className="weya-section">
            <h2 className="weya-hero-title" style={{ fontSize: "3rem" }}>
              Redefining Impact
            </h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>Invest</h3>
                <p>
                  We invest directly in impact startups and funds to support
                  leaders transforming the world.
                </p>
              </div>
              <div className="weya-card">
                <h3>Co-Create</h3>
                <p>
                  We move as a community, transparently collaborating with
                  partners to improve efficiency.
                </p>
              </div>
              <div className="weya-card">
                <h3>Build</h3>
                <p>
                  We build and scale technical and operational teams where
                  capacity is lacking.
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="weya-section">
            <h2 className="weya-hero-title" style={{ fontSize: "3rem" }}>
              Get In Touch
            </h2>

            <form className="weya-form-box" onSubmit={handleContactSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="weya-input"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email (example@domain.com)"
                className="weya-input"
                pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                title="Please enter a valid email address (e.g. user@example.com)"
                required
              />

              <textarea
                name="message"
                placeholder="Message..."
                className="weya-input"
                rows={4}
                style={{ resize: "vertical" }}
                required
              />
              <button
                type="submit"
                className="weya-btn-aurora"
                style={{ width: "100%", padding: "1rem" }}
              >
                Send Message
              </button>
            </form>

            <footer
              style={{
                marginTop: "3rem",
                opacity: 0.5,
                fontSize: "0.8rem",
                color: "#94a3b8",
              }}
            >
              © 2025 Light Eagle AG. All rights reserved.
            </footer>
          </section>
        </>
      )}
    </div>
  );
};
