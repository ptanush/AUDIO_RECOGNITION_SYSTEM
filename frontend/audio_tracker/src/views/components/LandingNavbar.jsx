import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(30,45,69,0.5)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 no-underline group">
        <div
          className="landing-logo-glow"
          style={{
            background: "linear-gradient(135deg,#7c6aad,#9584c0)",
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "box-shadow 0.3s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#e2e8f0",
            letterSpacing: "-0.3px",
          }}
        >
          AUDIO RECOGNITION{" "}
          <span style={{ color: "#9584c0" }}>SYSTEM</span>
        </span>
      </Link>

      {/* Nav actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="landing-nav-link"
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "#94a3b8",
            textDecoration: "none",
            padding: "8px 18px",
            borderRadius: 10,
            transition: "all 0.25s",
          }}
        >
          Sign In
        </Link>
        <Link
          to="/signup"
          className="btn-primary"
          style={{
            textDecoration: "none",
            fontSize: 14,
            padding: "10px 22px",
            borderRadius: 10,
          }}
        >
          Create Account
        </Link>
      </div>
    </nav>
  );
}
