export default function WaveformPreview({ active }) {
  const bars = [3, 6, 9, 5, 8, 4, 7, 10, 6, 4, 8, 5, 9, 3, 6, 7, 5, 8, 4, 6, 9, 5, 7, 4, 8];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 48, padding: "0 16px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3,
          borderRadius: 2,
          background: active ? "linear-gradient(to top, #7c6aad, #9584c0)" : "var(--border)",
          height: `${h * 4}px`,
          animation: active ? `waveform ${0.5 + (i % 5) * 0.1}s ease-in-out infinite` : "none",
          animationDelay: `${i * 0.04}s`,
          transition: "background 0.5s, height 0.5s",
        }} />
      ))}
    </div>
  );
}