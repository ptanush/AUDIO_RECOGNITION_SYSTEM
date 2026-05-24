import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ResultCard from "../components/ResultCard";
import ConfidenceBar from "../components/ConfidenceBar";
import { saveToHistory } from '../../models/api';

export default function ResultPage({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { result, fileName, topMatches = [], noMatch } = location.state || {};

  useEffect(() => {
    if (!result && !noMatch) { navigate("/home"); return; }
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, [result, noMatch, navigate]);

  const saveResult = () => {
    if (saved) return;
    // Save to browser localStorage (no database)
    saveToHistory(user.email, { ...result, fileName });
    setSaved(true);
  };

  if (!result && !noMatch) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        {loading ? (
          <div className="card">
            <Loader />
            {fileName && <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: -16, marginBottom: 16 }}>File: {fileName}</p>}
          </div>
        ) : (
          <div>
            {/* No match banner */}
            {noMatch || !result ? (
              <div className="card animate-fadeUp" style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <span style={{ fontSize: 28 }}>🎵</span>
                </div>
                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>No Match Found</p>
                <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
                  The audio clip didn't match any song in the database. Try uploading reference songs first.
                </p>
                <button className="btn-primary" onClick={() => navigate("/home")}>← Try Again</button>
              </div>
            ) : (
              <div>
                <div className="animate-fadeUp" style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                    <span style={{ fontFamily: "Syne,sans-serif", fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Match Found</span>
                  </div>
                  <ResultCard result={result} />
                </div>

                {/* Top matches from backend */}
                {topMatches.length > 0 && (
                  <div className="animate-fadeUp" style={{ animationDelay: "0.1s", opacity: 0, marginTop: 20 }}>
                    <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                      Other Possible Matches
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topMatches.slice(1).map((m, i) => (
                        <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{m.title || "Unknown Song"}</p>
                              <p style={{ color: "var(--muted)", fontSize: 12 }}>{m.description || "—"}</p>
                            </div>
                          </div>
                          <ConfidenceBar value={(m.similarity || 0) / 100} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="animate-fadeUp" style={{ animationDelay: "0.2s", opacity: 0, display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => navigate("/home")}
                    style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => e.target.style.borderColor = "#9584c0"}
                    onMouseLeave={e => e.target.style.borderColor = "var(--border)"}>
                    ← Try Another
                  </button>
                  <button className="btn-primary" onClick={saveResult} disabled={saved} style={{ flex: 1, padding: "14px" }}>
                    {saved ? "✓ Saved to History" : "Save Result"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}