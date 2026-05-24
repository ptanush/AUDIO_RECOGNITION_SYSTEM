import ConfidenceBar from "./ConfidenceBar";

export default function ResultCard({ result }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(149,132,192,0.12), transparent 70%)", borderRadius: "50%" }} />
      <div className="flex items-start gap-4 mb-6">
        <div style={{ width: 60, height: 60, borderRadius: 12, background: "linear-gradient(135deg,#7c6aad,#9584c0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <p style={{ color: "var(--muted)", fontSize: 12, fontFamily: "Syne,sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Best Match</p>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 24, color: "var(--text)", lineHeight: 1.2 }}>{result.song}</h2>
          <p style={{ color: "#9584c0", fontSize: 15, marginTop: 4, fontWeight: 500 }}>{result.artist}</p>
        </div>
      </div>
      <ConfidenceBar value={result.confidence} />
      {result.album && (
        <div className="flex gap-3 mt-4" style={{ flexWrap: "wrap" }}>
          {[["Album", result.album], ["Year", result.year], ["Genre", result.genre]].map(([k, v]) => v && (
            <div key={k} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px" }}>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{k} · </span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}