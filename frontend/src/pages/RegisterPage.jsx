import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email) { setStatus({ type: "error", msg: "Email is required for notifications and alerts." }); return; }
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.post("http://localhost:3000/pytm/register/enter", form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: "Account created! Redirecting to dashboard..." });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Registration failed." });
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
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "0 0 24px" }}>Start sending and receiving money instantly</p>

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
              <p style={{ fontSize: 11, color: "#98a2b3", marginTop: 4 }}>Used for loan EMI alerts and notifications</p>
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

          <div style={{ marginTop: 18, textAlign: "center", fontSize: 14, color: "#667085" }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} style={{ color: "#3b5bdb", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}