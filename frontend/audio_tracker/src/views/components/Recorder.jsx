import { useState, useRef, useEffect } from "react";

export default function Recorder({ onRecordingComplete }) {
  const [state, setState] = useState("idle"); // idle | recording | done
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: "audio/webm" });
        onRecordingComplete(file);
        setState("done");
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 9) { stop(); return s; }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow mic access.");
    }
  };

  const stop = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    clearInterval(timerRef.current);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const bars = [4, 7, 5, 9, 6, 8, 4, 7, 5, 6, 8, 5];

  return (
    <div style={{ textAlign: "center" }}>
      {state === "recording" && (
        <div className="flex justify-center items-end gap-1 mb-4" style={{ height: 40 }}>
          {bars.map((h, i) => (
            <div key={i} className="animate-waveform" style={{
              width: 3, background: "#ef4444", borderRadius: 2,
              height: `${h * 4}px`,
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      )}

      <button
        onClick={state === "recording" ? stop : start}
        style={{
          width: 72, height: 72, borderRadius: "50%",
          background: state === "recording"
            ? "rgba(239,68,68,0.15)"
            : state === "done"
            ? "rgba(16,185,129,0.15)"
            : "rgba(149,132,192,0.1)",
          border: `2px solid ${state === "recording" ? "#ef4444" : state === "done" ? "#10b981" : "#9584c0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", margin: "0 auto", position: "relative",
          transition: "all 0.25s",
        }}>
        {state === "recording" && (
          <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid #ef4444", animation: "pulse-ring 1.5s ease-out infinite", opacity: 0.5 }} />
        )}
        {state === "idle" && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="#9584c0" strokeWidth="2"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="#9584c0" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
        {state === "recording" && (
          <div style={{ width: 16, height: 16, background: "#ef4444", borderRadius: 3 }} />
        )}
        {state === "done" && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2"/>
          </svg>
        )}
      </button>

      <p style={{ marginTop: 10, fontSize: 13, color: state === "recording" ? "#ef4444" : "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 500 }}>
        {state === "idle" && "Click to record (max 10s)"}
        {state === "recording" && `Recording... ${seconds}s / 10s`}
        {state === "done" && "Recording saved ✓"}
      </p>
    </div>
  );
}