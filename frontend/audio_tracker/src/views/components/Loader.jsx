export default function Loader({ text = "Analyzing audio..." }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
        <div className="animate-spin-slow" style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "#9584c0", position: "absolute" }} />
        <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "rgba(149,132,192,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="#9584c0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="6" cy="18" r="3" stroke="#9584c0" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="#9584c0" strokeWidth="2"/>
          </svg>
        </div>
      </div>
      <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 18, color: "var(--text)" }}>{text}</p>
      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Matching fingerprints across 50M+ tracks</p>
    </div>
  );
}