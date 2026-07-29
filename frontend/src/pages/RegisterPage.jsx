import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import GoogleSignInModal from "../components/GoogleSignInModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", upiPin: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email) { setStatus({ type: "error", msg: "Email is required for loan alerts and PIN/password recovery." }); return; }
    if (!/^\d{4}$/.test(form.upiPin)) { setStatus({ type: "error", msg: "Security PIN must be exactly 4 digits." }); return; }

    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.post(`${API}/register/enter`, form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Account created! Initializing digital ledger..." });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Registration failed." });
    }
  };

  const handleGoogleSuccess = (user) => {
    setStatus({ type: "success", msg: `Welcome, ${user.name}! Opening your wallet...` });
    setTimeout(() => navigate("/dashboard"), 500);
  };

  return (
    <div className="auth-wrapper" style={{ background: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 430 }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#171717", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: -0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>SP</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#171717", letterSpacing: -0.6 }}>ShivamPay</span>
        </div>

        <div className="auth-card" style={{ background: "#ffffff", border: "1px solid #ebebeb", borderRadius: 16, padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#171717", margin: "0 0 6px", letterSpacing: -0.5 }}>Create your digital account</h1>
          <p style={{ fontSize: 13.5, color: "#667085", margin: "0 0 22px" }}>Instant peer-to-peer payments & smart EMI credit</p>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => setShowGoogle(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "11px 16px",
              background: "#ffffff",
              border: "1px solid #d0d5dd",
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 600,
              color: "#171717",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              transition: "all 0.15s",
              marginBottom: 18
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fafafa"; e.currentTarget.style.borderColor = "#171717"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.borderColor = "#d0d5dd"; }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up in 1 second with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
            <span style={{ padding: "0 12px", fontSize: 11, color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 5 }}>Full Name</label>
              <input className="input" type="text" placeholder="Your full name" required
                style={{ width: "100%", padding: "9px 13px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none" }}
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#171717"} onBlur={e => e.target.style.borderColor = "#ebebeb"} />
            </div>
            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 5 }}>Username</label>
              <input className="input" type="text" placeholder="Choose a unique username" required
                style={{ width: "100%", padding: "9px 13px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none" }}
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })}
                onFocus={e => e.target.style.borderColor = "#171717"} onBlur={e => e.target.style.borderColor = "#ebebeb"} />
            </div>
            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 5 }}>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" required
                style={{ width: "100%", padding: "9px 13px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none" }}
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#171717"} onBlur={e => e.target.style.borderColor = "#ebebeb"} />
              <p style={{ fontSize: 11.5, color: "#888888", margin: "4px 0 0" }}>Used for security OTP verification and EMI receipt notices</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 5 }}>Password</label>
                <input className="input" type="password" placeholder="Min 6 chars" required minLength={6}
                  style={{ width: "100%", padding: "9px 13px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none" }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "#171717"} onBlur={e => e.target.style.borderColor = "#ebebeb"} />
              </div>
              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 5 }}>Security PIN</label>
                <input className="input" type="password" maxLength={4} placeholder="••••" required
                  style={{ width: "100%", padding: "9px 13px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 16, outline: "none", textAlign: "center", fontFamily: "JetBrains Mono, monospace", letterSpacing: 4, fontWeight: 700 }}
                  value={form.upiPin} onChange={e => setForm({ ...form, upiPin: e.target.value.replace(/\D/g, "") })}
                  onFocus={e => e.target.style.borderColor = "#171717"} onBlur={e => e.target.style.borderColor = "#ebebeb"} />
              </div>
            </div>

            {status.msg && (
              <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, background: status.type === "error" ? "#fff5f5" : "#ebfbee", color: status.type === "error" ? "#c92a2a" : "#2b8a3e", border: `1px solid ${status.type === "error" ? "#ffc9c9" : "#b2f2bb"}` }}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px 18px", background: "#171717", color: "#ffffff", borderRadius: 9999, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.15s", marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: "#667085", borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} style={{ color: "#171717", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={showGoogle}
        onClose={() => setShowGoogle(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
}