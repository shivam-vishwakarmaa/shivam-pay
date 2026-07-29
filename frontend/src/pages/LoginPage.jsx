import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import GoogleSignInModal from "../components/GoogleSignInModal";
import ForgotSecurityModal from "../components/ForgotSecurityModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.put(`${API}/login/enter`, form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Signed in successfully! Launching your dashboard..." });
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Invalid account credentials." });
    }
  };

  const handleGoogleSuccess = (user) => {
    setStatus({ type: "success", msg: `Authenticated as ${user.name}! Opening dashboard...` });
    setTimeout(() => navigate("/dashboard"), 500);
  };

  return (
    <div className="auth-wrapper" style={{ background: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 410 }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#171717", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: -0.5, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>SP</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#171717", letterSpacing: -0.6 }}>ShivamPay</span>
        </div>

        <div className="auth-card" style={{ background: "#ffffff", border: "1px solid #ebebeb", borderRadius: 16, padding: "34px 32px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#171717", margin: "0 0 6px", letterSpacing: -0.5 }}>Welcome to ShivamPay</h1>
          <p style={{ fontSize: 13.5, color: "#667085", margin: "0 0 22px" }}>Sign in to your secure digital ledger & wallet</p>

          {/* Vercel-Style Google SSO Button */}
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
              marginBottom: 20
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
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
            <span style={{ padding: "0 14px", fontSize: 11, color: "#888888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>or sign in with password</span>
            <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", display: "block", marginBottom: 6 }}>Username or Email</label>
              <input className="input" type="text" placeholder="Enter username or email" required
                style={{ width: "100%", padding: "10px 14px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color 0.15s" }}
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} 
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = "#ebebeb"} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#171717", margin: 0 }}>Password</label>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: "#667085", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                  Forgot Password / PIN?
                </button>
              </div>
              <input className="input" type="password" placeholder="••••••••" required
                style={{ width: "100%", padding: "10px 14px", background: "#ffffff", border: "1.5px solid #ebebeb", borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color 0.15s" }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#171717"}
                onBlur={e => e.target.style.borderColor = "#ebebeb"} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#667085" }}>
              <input type="checkbox" id="remember" defaultChecked style={{ width: 16, height: 16, accentColor: "#171717", cursor: "pointer" }} />
              <label htmlFor="remember" style={{ cursor: "pointer", userSelect: "none" }}>Stay logged in for 30 days (with security lock)</label>
            </div>

            {status.msg && (
              <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, background: status.type === "error" ? "#fff5f5" : "#ebfbee", color: status.type === "error" ? "#c92a2a" : "#2b8a3e", border: `1px solid ${status.type === "error" ? "#ffc9c9" : "#b2f2bb"}` }}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px 18px", background: "#171717", color: "#ffffff", borderRadius: 9999, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.15s", marginTop: 4 }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 22, textAlign: "center", fontSize: 13.5, color: "#667085", borderTop: "1px solid #ebebeb", paddingTop: 18 }}>
            New to ShivamPay?{" "}
            <button onClick={() => navigate("/register")} style={{ color: "#171717", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              Create an account
            </button>
          </div>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={showGoogle}
        onClose={() => setShowGoogle(false)}
        onSuccess={handleGoogleSuccess}
      />

      <ForgotSecurityModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
      />
    </div>
  );
}
