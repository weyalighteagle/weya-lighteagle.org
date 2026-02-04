"use client";

import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession } from "./LiveAvatarSession";
import "./avatar-styles.css";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  const LANGUAGE = "tr";
  // Persona gelince otomatik başlat
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
    const finalPersona = forcedPersona || "weya_live";

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
          language: LANGUAGE, // ← SADECE BURASI NETLEŞTİ
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
              router.push("/");
            }}
          />
        </div>
      ) : persona ? (
        <div className="weya-loading-screen">
          {error ? (
            <div className="weya-error">{error}</div>
          ) : (
            <div className="weya-loading">Weya'ya bağlanılıyor…</div>
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
                İLETİŞİM
              </a>
            </div>
          </nav>

          <section id="home" className="weya-section">
            <div className="weya-hero-grid">
              <div className="weya-hero-left" style={{ textAlign: "left" }}>
                <h1 className="weya-hero-title" style={{ textAlign: "left" }}>
                  Yüz Yüze Görüşme Öncesi Weya ile Hazırlık Görüşmesi
                </h1>

                <p className="weya-hero-text" style={{ textAlign: "left" }}>Formu doldurun ve başlayın.</p>

                {error && <div className="weya-error">{error}</div>}

                <div className="weya-form-box">
                  <div className="weya-form-row">
                    <input
                      className="weya-input"
                      placeholder="Ad"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      className="weya-input"
                      placeholder="Soyad"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <input
                    className="weya-input"
                    placeholder="E-posta"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button
                    className="weya-btn-aurora"
                    disabled={isLoading}
                    onClick={() => {
                      if (!firstName || !lastName || !email) {
                        setError("Lütfen tüm alanları doldurun.");
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

                      router.push("/talk/weya-live");
                    }}
                  >
                    GÖRÜŞMEYİ BAŞLAT
                  </button>
                </div>
              </div>

              <div className="weya-hero-right">
                <p className="weya-hero-text">
                  Başvurusu değerlendirilen projeleri, yüz yüze görüşmeler öncesinde <strong>Weya</strong> ile kısa bir hazırlık görüşmesi yapmaya davet ediyoruz. <strong>Weya</strong>, dinleyen, öğrenen ve bağlantılar kuran yapay zekâ destekli bir sistemdir. Başvuruları değerlendirme kriterleri doğrultusunda ele alarak, projelerin güçlü yönlerini daha net ifade etmelerine ve etki odaklı anlatılarını güçlendirmelerine yardımcı olur.
                </p>

                <p className="weya-hero-text">
                  Bu görüşme yaklaşık <strong>15 dakika</strong> sürecek; Weya, başvuru değerlendirme kriterleri doğrultusunda size sorular yöneltecektir. Görüşmenin amacı, yüz yüze yapılacak değerlendirme toplantısına daha hazırlıklı girmenizi desteklemektir. Görüşme sonrasında, paylaşılan bilgiler doğrultusunda <strong>kısa bir değerlendirme ve geri bildirim raporu</strong> hazırlanacaktır. Bu rapor, projenizin <strong>değerlendirme kriterleri</strong> çerçevesinde güçlü yönlerini ve geliştirmeye açık alanlarını özetlemeyi amaçlar ve yüz yüze görüşmeye hazırlık sürecinizi destekleyici bir araç olarak kullanılacaktır.
                </p>
              </div>
            </div>
          </section>

          <section id="contact" className="weya-section">
            <div className="weya-content-narrow">
              <h2 className="weya-section-title">İletişim</h2>

              <p className="weya-hero-text">
                Daha fazla bilgi almak veya görüşme dışında katılım sağlamak isterseniz bize şuradan ulaşabilirsiniz:
              </p>

              <p className="weya-hero-text">
                <strong>weya@lighteagle.org</strong>
              </p>

              <p className="weya-hero-text" style={{ opacity: 0.6 }}>
                © 2025 Light Eagle. Tüm hakları saklıdır.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
