import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HistoryItem from "../components/HistoryItem";

export default function HistoryPage({ user, onLogout }) {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const key = `ars_history_${user.email}`;
    setHistory(JSON.parse(localStorage.getItem(key) || "[]"));
  }, [user]);

  const clearHistory = () => {
    const key = `ars_history_${user.email}`;
    localStorage.removeItem(key);
    setHistory([]);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fadeUp flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>History</h1>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{history.length} identification{history.length !== 1 ? "s" : ""}</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory}
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "8px 16px", color: "#ef4444", fontSize: 13, cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600 }}>
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="card animate-fadeUp" style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(149,132,192,0.08)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2"/>
                <path d="M12 8v4l2 2" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>No history yet</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Identify some songs and save the results here.</p>
            <button className="btn-primary" onClick={() => navigate("/home")}>Start Identifying</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((item, i) => <HistoryItem key={i} item={item} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}