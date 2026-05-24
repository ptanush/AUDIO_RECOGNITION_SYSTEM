import { useEffect, useState } from "react";

export default function ConfidenceBar({ value }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value * 100), 200);
    return () => clearTimeout(t);
  }, [value]);

  const color = value >= 0.85 ? "#10b981" : value >= 0.65 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "Syne,sans-serif" }}>Confidence</span>
        <span style={{ fontSize: 20, fontFamily: "Syne,sans-serif", fontWeight: 700, color }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: 8, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 12px ${color}66`,
        }} />
      </div>
    </div>
  );
}