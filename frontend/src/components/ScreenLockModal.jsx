import { useState } from "react";
import axios from "axios";
import { API } from "../config/api";

export default function ScreenLockModal({ isLocked, onUnlock, onSignOut }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!isLocked) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/auth/verify-pin`, { pin }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLoading(false);
        setPin("");
        onUnlock();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Incorrect security PIN. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" style={{ background: "rgba(10, 15, 30, 0.85)", backdropFilter: "blur(8px)", zIndex: 9999 }}>
      <div className="modal" style={{ textAlign: "center", maxWidth: 360, padding: "32px 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#3b5bdb" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>
          Welcome back, {user.name?.split(" ")[0] || "User"}
        </h3>
        <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>
          Enter your 4-digit security PIN to unlock your wallet
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <input
            className="input"
            type="password"
            maxLength={4}
            autoFocus
            placeholder="••••"
            style={{ width: 150, textAlign: "center", fontSize: 24, fontFamily: "JetBrains Mono, monospace", letterSpacing: 12, padding: "10px 14px", borderRadius: 12 }}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />

          {error && <div className="alert alert-error" style={{ fontSize: 12, width: "100%" }}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading || pin.length < 4}>
            {loading ? "Verifying..." : "Unlock Wallet 🔓"}
          </button>
        </form>

        <div style={{ marginTop: 22, borderTop: "1px solid #eaecf0", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
          <span style={{ color: "#98a2b3" }}>Not {user.username}?</span>
          <button
            onClick={onSignOut}
            style={{ background: "none", border: "none", color: "#e03131", fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            Sign out entirely →
          </button>
        </div>
      </div>
    </div>
  );
}
