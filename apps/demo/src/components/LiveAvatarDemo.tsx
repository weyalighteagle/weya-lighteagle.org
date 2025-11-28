"use client";

import { useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";

export const LiveAvatarDemo = () => {
  const [sessionToken, setSessionToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInteraction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/start-session", { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error);
        return;
      }
      const { session_token } = await res.json();
      setSessionToken(session_token);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GÜNCELLENEN MAİL FONKSİYONU ---
  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Sayfa yenilenmesin

    // Formdaki verileri al
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Mailin konusunu ve içeriğini hazırla
    const subject = `Weya Contact: Message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    window.location.href = `mailto:gulfem@lighteagle.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className={`weya-app ${sessionToken ? "mode-chat" : "mode-landing"}`}>
      
      {/* --- CHAT MOD --- */}
      {sessionToken ? (
        <div className="weya-session-container">
          <LiveAvatarSession
            sessionAccessToken={sessionToken}
            onSessionStopped={() => setSessionToken("")}
          />
        </div>
      ) : (
        /* --- LANDING MOD --- */
        <>
          <nav className="weya-navbar">
            <a href="#" className="weya-brand">WEYA</a>
            <div className="weya-nav-menu">
              <a href="#home" className="weya-nav-link">AI Companion</a>
              <a href="#about" className="weya-nav-link">About</a>
              <a href="#contact" className="weya-nav-link">Contact</a>
            </div>
          </nav>

          {/* Section 1: Hero */}
          <section id="home" className="weya-section">
            <h1 className="weya-hero-title">
              Meet <span>Weya</span>
            </h1>
            <p className="weya-hero-text">
              Your intelligent guide to impact investing and systemic change. 
              Experience the digital embodiment of Light Eagle's vision.
            </p>
            
            {error && <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</div>}
            
            <button className="weya-btn-aurora" onClick={startInteraction} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Talk to Weya"}
            </button>
          </section>

          {/* Section 2: Cards */}
          <section id="about" className="weya-section">
            <h2 className="weya-hero-title" style={{ fontSize: '3rem' }}>Redefining Impact</h2>
            <div className="weya-card-grid">
              <div className="weya-card">
                <h3>Invest</h3>
                <p>We invest directly in impact startups and funds to support leaders transforming the world.</p>
              </div>
              <div className="weya-card">
                <h3>Co-Create</h3>
                <p>We move as a community, transparently collaborating with partners to improve efficiency.</p>
              </div>
              <div className="weya-card">
                <h3>Build</h3>
                <p>We build and scale technical and operational teams where capacity is lacking.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Contact */}
          <section id="contact" className="weya-section">
            <h2 className="weya-hero-title" style={{ fontSize: '3rem' }}>Get In Touch</h2>
            
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
                style={{ resize: 'vertical' }} 
                required 
              />
              <button type="submit" className="weya-btn-aurora" style={{ width: '100%', padding: '1rem' }}>
                Send Message
              </button>
            </form>
            
            <footer style={{ marginTop: '3rem', opacity: 0.5, fontSize: '0.8rem', color: '#94a3b8' }}>
              © 2025 Light Eagle AG. All rights reserved.
            </footer>
          </section>
        </>
      )}
    </div>
  );
};