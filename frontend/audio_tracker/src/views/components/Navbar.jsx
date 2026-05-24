import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const links = [
    { to: "/home", label: "Home" },
    { to: "/history", label: "History" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
      className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/home" className="flex items-center gap-2 no-underline">
        <div style={{ background: "linear-gradient(135deg,#7c6aad,#9584c0)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
          AUDIO RECOGNITION <span style={{ color: "#9584c0" }}>SYSTEM</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            style={{
              fontFamily: "Syne,sans-serif", fontWeight: 500, fontSize: 14,
              color: location.pathname === l.to ? "#9584c0" : "var(--muted)",
              textDecoration: "none", transition: "color 0.2s",
            }}>
            {l.label}
          </Link>
        ))}
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{user?.name}</span>
          <button onClick={onLogout}
            style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "DM Sans,sans-serif", transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--muted)"; }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}