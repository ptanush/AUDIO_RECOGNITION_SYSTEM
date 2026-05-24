import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import Recorder from "../components/Recorder";
import WaveformPreview from "../components/WaveformPreview";
import { matchSong } from '../../models/api';

export default function HomePage({ user, onLogout }) {
  const [file, setFile] = useState(null);
  const [inputMode, setInputMode] = useState("upload"); // upload | record
  const [noiseReduction, setNoiseReduction] = useState(false);
  const [duration, setDuration] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleIdentify = async () => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      // Call real backend  POST /api/songs/match
      const data = await matchSong(file, 5);

      // Map backend response to the shape expected by ResultPage
      const bestMatch = data.bestMatch;
      const result = bestMatch
        ? {
            song: bestMatch.title || "Unknown Song",
            artist: bestMatch.uploadedBy ? `Uploaded by ${bestMatch.uploadedBy}` : "Unknown Artist",
            confidence: (data.confidence || 0) / 100,
            album: bestMatch.description || "—",
            year: bestMatch.createdAt ? new Date(bestMatch.createdAt).getFullYear().toString() : "—",
            genre: bestMatch.metadata?.codec || "—",
            // Pass full API response for the result page
            _raw: data,
          }
        : null;

      navigate("/result", {
        state: {
          result,
          fileName: file?.name,
          topMatches: data.topMatches || [],
          matchingFeatures: data.matchingFeatures || {},
          noMatch: !bestMatch,
        },
      });
    } catch (err) {
      setError(err.message || "Identification failed. Make sure the backend is running and songs are uploaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
        {/* Hero */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(149,132,192,0.1)", border: "1px solid rgba(149,132,192,0.2)", borderRadius: 99, padding: "6px 16px", marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 12, color: "#9584c0", fontFamily: "Syne,sans-serif", fontWeight: 600 }}>LIVE · Backend-Powered Audio Matching</span>
          </div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 42, lineHeight: 1.15, color: "var(--text)", marginBottom: 12 }}>
            Identify Any Song<br />
            <span style={{ background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Instantly
            </span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 400, margin: "0 auto" }}>
            Upload an audio clip or record a snippet — AUDIO RECOGNITION SYSTEM does the rest.
          </p>
        </div>

        {/* Main card */}
        <div className="card animate-fadeUp" style={{ animationDelay: "0.15s", opacity: 0 }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 4, background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[["upload", "Upload File", "↑"], ["record", "Record Audio", "⏺"]].map(([mode, label, icon]) => (
              <button key={mode} onClick={() => { setInputMode(mode); setFile(null); setError(""); }}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                  background: inputMode === mode ? "var(--surface)" : "transparent",
                  color: inputMode === mode ? "var(--text)" : "var(--muted)",
                  boxShadow: inputMode === mode ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                }}>
                <span style={{ marginRight: 6 }}>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* Input area */}
          {inputMode === "upload" ? (
            <UploadBox onFileSelect={setFile} selectedFile={file} />
          ) : (
            <div style={{ background: "var(--surface2)", borderRadius: 16, padding: "32px 24px", border: "1px solid var(--border)", textAlign: "center" }}>
              <Recorder onRecordingComplete={setFile} />
            </div>
          )}

          {/* Waveform preview */}
          {file && (
            <div style={{ marginTop: 16, background: "var(--surface2)", borderRadius: 12, padding: "12px 16px", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif" }}>PREVIEW</span>
                <span style={{ fontSize: 12, color: "#10b981" }}>Ready</span>
              </div>
              <WaveformPreview active={!!file} />
            </div>
          )}

          {/* Controls */}
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif", whiteSpace: "nowrap" }}>Clip Duration</span>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer", fontFamily: "DM Sans,sans-serif", flex: 1 }}>
                {["5", "10", "15", "30"].map(s => <option key={s} value={s} style={{ background: "var(--surface)" }}>{s}s</option>)}
              </select>
            </div>
            <button onClick={() => setNoiseReduction(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: `1px solid ${noiseReduction ? "rgba(149,132,192,0.4)" : "var(--border)"}`, borderRadius: 10, padding: "10px 16px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: noiseReduction ? "linear-gradient(135deg,#7c6aad,#9584c0)" : "var(--border)", position: "relative", transition: "background 0.3s" }}>
                <div style={{ position: "absolute", top: 2, left: noiseReduction ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </div>
              <span style={{ fontSize: 12, color: noiseReduction ? "#9584c0" : "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>Noise Reduction</span>
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div style={{ marginTop: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>⚠ {error}</p>
              <p style={{ color: "var(--muted)", fontSize: 12, margin: "6px 0 0" }}>
                Make sure the backend server is running (<code>npm run dev</code> in the <code>backend/</code> folder) and that you have uploaded reference songs via POST /api/songs/upload.
              </p>
            </div>
          )}

          <button className="btn-primary" disabled={!file || loading} onClick={handleIdentify}
            style={{ marginTop: 20, width: "100%", padding: 16, fontSize: 16, opacity: (!file || loading) ? 0.7 : 1 }}>
            {loading ? "🔍 Identifying…" : file ? "⚡ Identify Song" : "Select audio to continue"}
          </button>
        </div>

        {/* Stats row */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.25s", opacity: 0, display: "flex", gap: 16, marginTop: 24 }}>
          {[["File-based", "Local JSON storage"], ["< 3s", "Match speed"], ["98%", "Accuracy rate"]].map(([val, label]) => (
            <div key={label} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}