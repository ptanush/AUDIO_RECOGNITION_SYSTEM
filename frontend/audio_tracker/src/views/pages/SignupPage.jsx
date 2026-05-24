import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from '../../models/api';

export default function SignupPage({ onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      // Calls backend POST /api/auth/register — user is persisted in data/user-db.json
      // JWT token is saved to localStorage inside apiRegister()
      const session = await apiRegister(form);
      if (onLogin) onLogin(session);   // auto-login after register
      navigate("/home");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#7c6aad,#9584c0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>Create Account</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>Join AUDIO RECOGNITION SYSTEM today</p>
        </div>

        <div className="card animate-fadeUp" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["Name", "name", "text", "Jane Smith"], ["Email", "email", "email", "you@example.com"], ["Password", "password", "password", "Min. 6 characters"]].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Syne,sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                <input className="input-field" style={{ marginTop: 6 }} type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            ))}
            {error && <p style={{ color: "#ef4444", fontSize: 13, background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, width: "100%", padding: "14px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#9584c0", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}