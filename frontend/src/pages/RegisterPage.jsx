import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import GoogleSignInModal from "../components/GoogleSignInModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email) { setStatus({ type: "error", msg: "Email is required for notifications and alerts." }); return; }
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.post(`${API}/register/enter`, form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Account created! Redirecting to dashboard..." });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Registration failed." });
    }
  };

  const handleGoogleSuccess = (user) => {
    setStatus({ type: "success", msg: `Welcome, ${user.name}! Opening your dashboard...` });
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
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "0 0 20px" }}>Start sending and receiving money instantly</p>

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
            Sign up in 1 second with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
            <span style={{ padding: "0 12px", fontSize: 12, color: "#98a2b3", fontWeight: 600, textTransform: "uppercase" }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Full Name</label>
              <input className="input" type="text" placeholder="Your full name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Username</label>
              <input className="input" type="text" placeholder="Choose a username" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <p style={{ fontSize: 11, color: "#98a2b3", marginTop: 4 }}>Used for loan EMI alerts and payment notices</p>
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" required minLength={6}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {status.msg && <div className={`alert alert-${status.type === "error" ? "error" : "success"}`}>{status.msg}</div>}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#667085", borderTop: "1px solid #f2f4f7", paddingTop: 16 }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} style={{ color: "#3b5bdb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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