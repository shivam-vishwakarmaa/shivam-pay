import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import GoogleSignInModal from "../components/GoogleSignInModal";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.put(`${API}/login/enter`, form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Signed in! Redirecting to your dashboard..." });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Invalid credentials." });
    }
  };

  const handleGoogleSuccess = (user) => {
    setStatus({ type: "success", msg: `Authenticated as ${user.name}! Opening dashboard...` });
    setTimeout(() => navigate("/dashboard"), 500);
  };

  return (
    <div className="auth-wrapper">
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>SP</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>ShivamPay</span>
        </div>

        <div className="auth-card">
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "0 0 20px" }}>Sign in to your account securely</p>

          {/* 1. Production Google One-Click SSO Button */}
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
              background: "#fff",
              border: "1px solid #ced4da",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#344054",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              transition: "all 0.2s",
              marginBottom: 18
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
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
            <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
            <span style={{ padding: "0 12px", fontSize: 12, color: "#98a2b3", fontWeight: 600, textTransform: "uppercase" }}>or sign in with password</span>
            <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Username or Email</label>
              <input className="input" type="text" placeholder="Enter your username or email" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#667085" }}>
              <input type="checkbox" id="remember" defaultChecked style={{ width: 16, height: 16, accentColor: "#3b5bdb" }} />
              <label htmlFor="remember" style={{ cursor: "pointer", userSelect: "none" }}>Stay signed in for 30 days (with quick App PIN lock)</label>
            </div>

            {status.msg && <div className={`alert alert-${status.type === "error" ? "error" : "success"}`}>{status.msg}</div>}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#667085", borderTop: "1px solid #f2f4f7", paddingTop: 16 }}>
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} style={{ color: "#3b5bdb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Create account
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
