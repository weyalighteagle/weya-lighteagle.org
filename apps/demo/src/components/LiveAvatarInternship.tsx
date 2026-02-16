"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";
import { useRouter } from "next/navigation";

type Props = {
    persona?: string;
};

export const LiveAvatarInternship = ({ persona }: Props) => {
    const [sessionToken, setSessionToken] = useState("");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sessionEndedRef = useRef(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const router = useRouter();
    const LANGUAGE = "en";

    // Auto-start when persona is provided
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
        const finalPersona = forcedPersona || "weya_internship";

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
                    language: LANGUAGE,
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
                        saveMessageEndpoint="/api/save-internship-message"
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
                            router.push("/internship");
                        }}
                    />
                </div>
            ) : persona ? (
                <div className="weya-loading-screen">
                    {error ? (
                        <div className="weya-error">{error}</div>
                    ) : (
                        <div className="weya-loading">Connecting to Weya…</div>
                    )}
                </div>
            ) : (
                <>
                    <nav className="weya-navbar">
                        <a href="/" className="weya-brand">
                            WEYA
                        </a>

                        <div className="weya-nav-menu">
                            <a href="#home" className="weya-nav-link">
                                AI Weya
                            </a>
                            <a href="#contact" className="weya-nav-link">
                                CONTACT
                            </a>
                        </div>
                    </nav>

                    <section id="home" className="weya-section">
                        <div className="weya-hero-grid">
                            <div className="weya-hero-left" style={{ textAlign: "left" }}>
                                <h1 className="weya-hero-title" style={{ textAlign: "left" }}>
                                    Internship Application – Pre-Interview with Weya
                                </h1>

                                <p className="weya-hero-text" style={{ textAlign: "left" }}>Fill in the form and get started.</p>

                                {error && <div className="weya-error">{error}</div>}

                                <div className="weya-form-box">
                                    <div className="weya-form-row">
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

                                            router.push("/talk/weya-internship");
                                        }}
                                    >
                                        START INTERVIEW
                                    </button>
                                </div>
                            </div>

                            <div className="weya-hero-right">
                                <p className="weya-hero-text">
                                    We invite internship candidates to have a brief preparatory conversation with <strong>Weya</strong> before
                                    the face-to-face interview. <strong>Weya</strong> is an AI-powered system that listens, learns, and builds
                                    connections. It helps candidates articulate their strengths and refine their impact-focused narratives
                                    in line with the evaluation criteria.
                                </p>

                                <p className="weya-hero-text">
                                    This conversation will take approximately <strong>15 minutes</strong>; Weya will ask you questions based on
                                    the application evaluation criteria. The aim is to help you prepare more effectively for the in-person
                                    assessment meeting. After the conversation, a <strong>brief evaluation and feedback report</strong> will
                                    be prepared based on the information shared. This report aims to summarize your project&apos;s strengths
                                    and areas for improvement within the framework of the <strong>evaluation criteria</strong>, and will
                                    serve as a supportive tool in your preparation for the face-to-face interview.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="weya-section">
                        <div className="weya-content-narrow">
                            <h2 className="weya-section-title">Contact</h2>

                            <p className="weya-hero-text">
                                For more information or to participate outside of the interview, please reach out to us at:
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
