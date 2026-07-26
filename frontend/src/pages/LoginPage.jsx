import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.put("http://localhost:3000/pytm/login/enter", form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Signed in! Redirecting..." });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Invalid credentials." });
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, justifyContent: "center" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 16
          }}>SP</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#111118", letterSpacing: "-0.02em" }}>ShivamPay</span>
        </div>

        <div className="auth-card">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111118", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "#6b6b7b", margin: 0 }}>Sign in to your ShivamPay account</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {status.msg && (
              <div className={`alert alert-${status.type === "error" ? "error" : "success"}`}>
                {status.msg}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#6b6b7b" }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              style={{ color: "#6366f1", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Create account
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9898a8", marginTop: 16 }}>
          🔒 256-bit encrypted · Bank-grade security
        </p>
      </div>
    </div>
  );
}
