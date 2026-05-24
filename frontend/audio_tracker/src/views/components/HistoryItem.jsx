export default function HistoryItem({ item, index }) {
  const color = item.confidence >= 0.85 ? "#10b981" : item.confidence >= 0.65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="animate-fadeUp" style={{ animationDelay: `${index * 0.07}s`, opacity: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(149,132,192,0.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg,#7c6aad,#9584c0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.song}</p>
        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{item.artist}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 16, color }}>{Math.round(item.confidence * 100)}%</p>
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{new Date(item.timestamp).toLocaleDateString()}</p>
      </div>
    </div>
  );
}