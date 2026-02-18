"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";
import { useRouter } from "next/navigation";

type Props = {
    persona?: string;
};

export const LiveAvatarFbnImpact = ({ persona }: Props) => {
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
        const finalPersona = forcedPersona || "fbn_impact";

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
                        saveMessageEndpoint="/api/save-fbn-impact-message"
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
                            router.push("/fbn-impact");
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

                    <section id="home" className="weya-section" style={{ alignItems: "stretch", paddingTop: "2rem", paddingBottom: "2rem" }}>
                        <div className="weya-hero-grid" style={{ alignItems: "stretch" }}>
                            <div className="weya-hero-left" style={{ textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <h1 className="weya-hero-title" style={{ textAlign: "left", fontSize: "1.6rem" }}>
                                    FBN Impact Open Spaces Mapping Interview
                                </h1>

                                <p className="weya-hero-text" style={{ textAlign: "left", marginBottom: "16px" }}>Fill in the form and start.</p>

                                {error && <div className="weya-error">{error}</div>}

                                <div className="weya-form-box" style={{ padding: "2.5rem 2rem", gap: "1.5rem", flex: "none" }}>
                                    <div className="weya-form-row">
                                        <input
                                            className="weya-input"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            style={{ height: "52px" }}
                                        />
                                        <input
                                            className="weya-input"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            style={{ height: "52px" }}
                                        />
                                    </div>

                                    <input
                                        className="weya-input"
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ height: "52px" }}
                                    />

                                    <button
                                        className="weya-btn-aurora"
                                        disabled={isLoading}
                                        style={{ height: "52px", marginTop: "0.5rem" }}
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

                                            router.push("/talk/fbn-impact");
                                        }}
                                    >
                                        START INTERVIEW
                                    </button>
                                </div>
                            </div>

                            <div className="weya-hero-right" style={{ maxWidth: "none" }}>
                                <p className="weya-hero-text" style={{ marginBottom: "10px" }}>
                                    <strong>FBN Impact</strong> is the impact arm of the Family Business Network (FBN) International, dedicated to enabling systems change through family business collaboration. FBN Impact works across a framework of <strong>Four Drivers of Change</strong> — the ways family businesses can advance systems-level impact:
                                </p>

                                <ul className="weya-hero-text" style={{ paddingLeft: "1.2rem", marginBottom: "10px", lineHeight: 1.5 }}>
                                    <li style={{ marginBottom: "4px" }}><strong>Business</strong> — Innovation, sustainable alternatives, solving supply-chain challenges</li>
                                    <li style={{ marginBottom: "4px" }}><strong>Investment</strong> — Co-investment opportunities, access to customers/markets, mentorship</li>
                                    <li style={{ marginBottom: "4px" }}><strong>Philanthropy</strong> — Co-funding opportunities, new solutions, catalytic grants</li>
                                    <li><strong>Advocacy</strong> — Access to collaborative networks, policy influencers, social/political capital</li>
                                </ul>

                                <p className="weya-hero-text" style={{ marginBottom: "10px" }}>
                                    <strong>FBN Impact Open Spaces</strong><br />
                                    The Open Space is a connection point for FBN members to openly discuss collaboration opportunities for the sole purpose of creating impact. It was approved by the FBN Board in January 2023 and has been piloted at events in Lausanne, Istanbul, and the Impact Forum.
                                </p>

                                <p className="weya-hero-text" style={{ marginBottom: "10px" }}>
                                    FBN Impact has identified seven focus areas where family businesses can drive systems change: Biodiversity &amp; Nature Restoration, Circular Economy, Decent Work &amp; Economic Growth, Energy Transition, Food Systems, Health Access &amp; Innovation, and Oceans &amp; the Blue Economy.
                                </p>

                                <p className="weya-hero-text" style={{ marginBottom: "0" }}>
                                    As part of the <strong>Legacy Mapping</strong> initiative, FBN Impact is identifying members worldwide who are working on systems change across these seven themes. The purpose of this interview is to gather information about your family&apos;s relation to impact, so that we can connect you with other families and stakeholders working toward the same or similar purpose within the Open Space framework.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="weya-section">
                        <div className="weya-content-narrow">
                            <h2 className="weya-section-title">Contact</h2>

                            <p className="weya-hero-text">
                                For more information or to participate outside of the interview, you can reach us at:
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
