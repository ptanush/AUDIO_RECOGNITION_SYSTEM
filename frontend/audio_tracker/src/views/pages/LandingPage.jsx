import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import useTypewriter from "../../controllers/hooks/useTypewriter";

/* ───── data ───── */
const TYPEWRITER_PHRASES = [
  "AI-powered audio fingerprinting",
  "Match songs from 3-second clips",
  "Robust to noise and distortion",
  "Scalable to millions of tracks",
];

const WHY_CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#9584c0" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    title: "Detect Copyrighted Content",
    desc: "Protect creators by automatically detecting unauthorized use of copyrighted audio in uploads and streams.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#b4a5d8" strokeWidth="2" />
        <path d="M21 21l-4.35-4.35" stroke="#b4a5d8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Identify Songs Instantly",
    desc: "Upload any clip — even a noisy recording from a concert — and get results in under 3 seconds.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V5l12-2v13" stroke="#7c6aad" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3" stroke="#7c6aad" strokeWidth="2" />
        <circle cx="18" cy="16" r="3" stroke="#7c6aad" strokeWidth="2" />
      </svg>
    ),
    title: "Handle Noisy Audio Clips",
    desc: "Our noise-robust algorithm works with real-world audio: background chatter, low bitrate, and distortion.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#a594d0" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#a594d0" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#a594d0" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="#a594d0" strokeWidth="2" />
      </svg>
    ),
    title: "Scalable Architecture",
    desc: "Built to handle thousands of concurrent identification requests across a database of 50 M+ tracks.",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Upload Audio",
    desc: "Drag & drop or record a short clip directly from your browser.",
    color: "#9584c0",
  },
  {
    num: "02",
    title: "Generate Fingerprint",
    desc: "The audio is converted into a unique spectral fingerprint.",
    color: "#7c6aad",
  },
  {
    num: "03",
    title: "Match Against Database",
    desc: "The fingerprint is compared against 50 M+ indexed tracks in real-time.",
    color: "#b4a5d8",
  },
  {
    num: "04",
    title: "Detect Song",
    desc: "Our AI identifies the best match with a confidence score.",
    color: "#a594d0",
  },
  {
    num: "05",
    title: "Show Results",
    desc: "Get instant results — song, artist, album, and match confidence.",
    color: "#c4b5e3",
  },
];

const FEATURES = [
  {
    title: "Audio Fingerprinting",
    desc: "Spectral analysis converts any audio into a compact, searchable fingerprint.",
    icon: "🎵",
    accent: "#9584c0",
  },
  {
    title: "Noise Robust Matching",
    desc: "Works with concert recordings, low-quality clips, and background noise.",
    icon: "🔊",
    accent: "#7c6aad",
  },
  {
    title: "Real-time Processing",
    desc: "Get results in under 3 seconds — no waiting around.",
    icon: "⚡",
    accent: "#b4a5d8",
  },
  {
    title: "Multi-format Support",
    desc: "Upload MP3, WAV, M4A, FLAC, OGG, and more.",
    icon: "📁",
    accent: "#a594d0",
  },
  {
    title: "Scalable Architecture",
    desc: "Designed for massive parallel identification at scale.",
    icon: "🚀",
    accent: "#c4b5e3",
  },
  {
    title: "Confidence Scoring",
    desc: "Every match comes with a percentage confidence score and alternatives.",
    icon: "📊",
    accent: "#8b7bb8",
  },
];

/* ───── intersection-observer fade-in ───── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("section-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = "", style = {} }) {
  const ref = useFadeIn();
  return (
    <section ref={ref} className={`section-hidden ${className}`} style={style}>
      {children}
    </section>
  );
}

/* ───── page ───── */
export default function LandingPage() {
  const typed = useTypewriter(TYPEWRITER_PHRASES, {
    typeSpeed: 50,
    deleteSpeed: 28,
    pauseMs: 2200,
  });

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden" }}>
      <LandingNavbar />

      {/* ===== HERO ===== */}
      <section
        className="relative flex flex-col items-center justify-center text-center"
        style={{ minHeight: "100vh", padding: "120px 24px 80px" }}
      >
        {/* Glowing orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        {/* Badge */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
          <div
            className="landing-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(149,132,192,0.08)",
              border: "1px solid rgba(149,132,192,0.2)",
              borderRadius: 99,
              padding: "7px 18px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 10px #10b981",
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: "#9584c0",
                fontFamily: "Syne, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Powered by AI · 50M+ Tracks
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="animate-fadeUp"
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 72px)",
            lineHeight: 1.08,
            color: "#f1f5f9",
            letterSpacing: "-2px",
            maxWidth: 820,
            marginBottom: 24,
            animationDelay: "0.2s",
          }}
        >
          Identify Any Song{" "}
          <br className="hidden md:block" />
          <span
            style={{
              background: "linear-gradient(135deg, #9584c0, #b4a5d8, #c8bae6)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            in Seconds
          </span>
        </h1>

        {/* Typewriter */}
        <div
          className="animate-fadeUp"
          style={{
            minHeight: 32,
            marginBottom: 40,
            animationDelay: "0.35s",
          }}
        >
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "clamp(16px, 2.2vw, 20px)",
              color: "#64748b",
            }}
          >
            {typed}
          </span>
          <span className="typewriter-cursor">|</span>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fadeUp flex flex-wrap justify-center gap-4"
          style={{ animationDelay: "0.45s" }}
        >
          <Link
            to="/signup"
            className="btn-primary btn-glow"
            style={{
              textDecoration: "none",
              fontSize: 16,
              padding: "14px 36px",
              borderRadius: 14,
            }}
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
            style={{
              textDecoration: "none",
              fontSize: 16,
              padding: "14px 36px",
              borderRadius: 14,
            }}
          >
            Sign In
          </Link>
        </div>

        {/* Scroll hint */}
        <div
          className="animate-fadeUp"
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            animationDelay: "0.7s",
          }}
        >
          <div className="scroll-indicator" />
        </div>
      </section>

      {/* ===== WHY THIS MATTERS ===== */}
      <Section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="section-label">Why It Matters</span>
          <h2 className="section-heading">
            Why Audio Identification Matters
          </h2>
          <p className="section-subtitle">
            From copyright protection to music discovery — audio identification
            is transforming how we interact with sound.
          </p>
        </div>

        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {WHY_CARDS.map((c, i) => (
            <div key={i} className="landing-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="landing-card-icon">{c.icon}</div>
              <h3 className="landing-card-title">{c.title}</h3>
              <p className="landing-card-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== HOW IT WORKS ===== */}
      <Section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="section-label">Process</span>
          <h2 className="section-heading">How It Works</h2>
          <p className="section-subtitle">
            Five simple steps from audio clip to identified song.
          </p>
        </div>

        <div className="process-grid">
          {PROCESS_STEPS.map((s, i) => (
            <div key={i} className="process-step">
              <div
                className="process-num"
                style={{ color: s.color, borderColor: `${s.color}33` }}
              >
                {s.num}
              </div>
              <div className="process-line" style={{ background: i < PROCESS_STEPS.length - 1 ? `${s.color}22` : "transparent" }} />
              <h4 className="process-title">{s.title}</h4>
              <p className="process-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== FEATURES ===== */}
      <Section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="section-label">Features</span>
          <h2 className="section-heading">
            Built for Precision & Speed
          </h2>
          <p className="section-subtitle">
            Everything you need for reliable, real-time audio identification.
          </p>
        </div>

        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="feature-icon" style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}30` }}>
                <span style={{ fontSize: 24 }}>{f.icon}</span>
              </div>
              <h3 className="landing-card-title">{f.title}</h3>
              <p className="landing-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ===== CTA ===== */}
      <Section style={{ padding: "80px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
        <div className="cta-card">
          <div className="cta-glow" />
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 40px)",
              lineHeight: 1.15,
              color: "#f1f5f9",
              marginBottom: 16,
              position: "relative",
            }}
          >
            Ready to Identify Songs{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #9584c0, #b4a5d8, #c8bae6)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Instantly?
            </span>
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: 16,
              maxWidth: 480,
              margin: "0 auto 32px",
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Create a free account and start identifying songs from any audio clip in seconds.
          </p>
          <Link
            to="/signup"
            className="btn-primary btn-glow"
            style={{
              textDecoration: "none",
              fontSize: 16,
              padding: "16px 44px",
              borderRadius: 14,
              position: "relative",
            }}
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </Section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="flex items-center gap-3">
            <div
              style={{
                background: "linear-gradient(135deg,#7c6aad,#9584c0)",
                borderRadius: 8,
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2.5" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#94a3b8",
              }}
            >
              AUDIO RECOGNITION SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-6">
            {["About", "GitHub", "Contact"].map((label) => (
              <a
                key={label}
                href="#"
                style={{
                  color: "#475569",
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#94a3b8")}
                onMouseLeave={(e) => (e.target.style.color = "#475569")}
              >
                {label}
              </a>
            ))}
          </div>

          <p style={{ color: "#334155", fontSize: 12 }}>
            © {new Date().getFullYear()} AUDIO RECOGNITION SYSTEM. Hackathon Project.
          </p>
        </div>
      </footer>
    </div>
  );
}
