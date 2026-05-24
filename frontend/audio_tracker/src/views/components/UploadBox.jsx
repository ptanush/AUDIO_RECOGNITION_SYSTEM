import { useState, useRef } from "react";

export default function UploadBox({ onFileSelect, selectedFile }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) onFileSelect(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{
        border: `2px dashed ${drag ? "#9584c0" : selectedFile ? "#10b981" : "var(--border)"}`,
        borderRadius: 16,
        padding: "40px 24px",
        textAlign: "center",
        cursor: "pointer",
        background: drag ? "rgba(149,132,192,0.06)" : selectedFile ? "rgba(16,185,129,0.05)" : "var(--surface2)",
        transition: "all 0.25s",
        position: "relative",
        overflow: "hidden",
      }}>
      <input ref={inputRef} type="file" accept="audio/*" onChange={handleChange} style={{ display: "none" }} />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#10b981", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14 }}>{selectedFile.name}</p>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(149,132,192,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#9584c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "var(--text)", fontFamily: "Syne,sans-serif", fontWeight: 600, fontSize: 14 }}>
              {drag ? "Drop it here!" : "Drag & drop audio file"}
            </p>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>MP3, WAV, M4A, FLAC supported</p>
          </div>
          <button style={{ marginTop: 4, background: "rgba(149,132,192,0.1)", border: "1px solid rgba(149,132,192,0.3)", borderRadius: 8, padding: "8px 20px", color: "#9584c0", fontSize: 13, cursor: "pointer", fontFamily: "Syne,sans-serif", fontWeight: 600 }}>
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
}