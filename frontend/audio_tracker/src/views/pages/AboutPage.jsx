import Navbar from "../components/Navbar";

const steps = [
  { num: "01", title: "Audio Input", desc: "Upload a file or record directly from your microphone. Supports MP3, WAV, M4A, FLAC." },
  { num: "02", title: "Fingerprinting", desc: "The audio is converted into a spectrogram and a unique acoustic fingerprint is extracted." },
  { num: "03", title: "Database Matching", desc: "The fingerprint is matched against 50M+ indexed tracks using our proprietary algorithm." },
  { num: "04", title: "Result", desc: "The best match is returned with a confidence score and metadata within seconds." },
];

const techStack = [
  ["React", "Frontend framework"],
  ["Vite", "Build tooling"],
  ["Web Audio API", "Audio recording"],
  ["localStorage", "Session & history"],
  ["Tailwind CSS", "Styling"],
];

export default function AboutPage({ user, onLogout }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div className="animate-fadeUp" style={{ marginBottom: 52, textAlign: "center" }}>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 36, color: "var(--text)", marginBottom: 12 }}>
            About <span style={{ background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AUDIO RECOGNITION SYSTEM</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            A hackathon project exploring audio fingerprinting and real-time song identification using modern web technologies.
          </p>
        </div>

        {/* How it works */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.1s", opacity: 0, marginBottom: 32 }}>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 16 }}>How It Works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ display: "flex", gap: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
                <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, background: "linear-gradient(135deg,#7c6aad,#9584c0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", flexShrink: 0 }}>{s.num}</span>
                <div>
                  <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{s.title}</p>
                  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="card animate-fadeUp" style={{ animationDelay: "0.2s", opacity: 0 }}>
          <h2 style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 16 }}>Tech Stack</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {techStack.map(([name, role]) => (
              <div key={name} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px" }}>
                <p style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 14, color: "#9584c0" }}>{name}</p>
                <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{role}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
              Built for hackathon purposes. The matching is simulated with mock data — a real implementation would integrate with the ACRCloud or AudD API for actual fingerprint matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}