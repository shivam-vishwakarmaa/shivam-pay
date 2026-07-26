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
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>SP</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>ShivamPay</span>
        </div>

        <div className="auth-card">
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "0 0 24px" }}>Sign in to your account</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Username</label>
              <input className="input" type="text" placeholder="Enter your username" required
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>

            {status.msg && <div className={`alert alert-${status.type === "error" ? "error" : "success"}`}>{status.msg}</div>}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: "center", fontSize: 14, color: "#667085" }}>
            Don't have an account?{" "}
            <button onClick={() => navigate("/register")} style={{ color: "#3b5bdb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
