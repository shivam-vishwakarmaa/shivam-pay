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
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await axios.post("http://localhost:3000/pytm/register/enter", form);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      setStatus({ type: "success", msg: `Account created! UPI ID: ${form.username.toLowerCase()}@shivampay` });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Registration failed. Try again." });
    }
  };

  const upiPreview = form.username ? `${form.username.toLowerCase().replace(/[^a-z0-9]/g, "")}@shivampay` : "yourname@shivampay";

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
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: "#6b6b7b", margin: 0 }}>
              Get your free UPI ID and ₹10,000 sandbox balance
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                placeholder="alex"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })}
                required
              />
              <div style={{ marginTop: 6, fontSize: 12, color: "#6366f1", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>
                UPI ID: {upiPreview}
              </div>
            </div>

            <div>
              <label className="label">Email <span style={{ color: "#9898a8", fontWeight: 400, textTransform: "none" }}>(for EMI alerts)</span></label>
              <input
                className="input"
                type="email"
                placeholder="alex@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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
              {loading ? "Creating account..." : "Create Account — Free"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#6b6b7b" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{ color: "#6366f1", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9898a8", marginTop: 16 }}>
          🔒 We never store bank details or UPI PINs
        </p>
      </div>
    </div>
  );
}