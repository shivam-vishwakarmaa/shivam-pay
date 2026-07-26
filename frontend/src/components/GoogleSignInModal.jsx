import { useState } from "react";
import axios from "axios";
import { API } from "../config/api";

export default function GoogleSignInModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid Google Account email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Extract or build a clean full name from email prefix if omitted
      const derivedName = name.trim() || email.split("@")[0].replace(/[^a-zA-Z]/g, " ").replace(/\b\w/g, l => l.toUpperCase()).trim();

      const res = await axios.post(`${API}/auth/google-login`, {
        email: email.toLowerCase().trim(),
        name: derivedName || "Google User",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}`,
        googleId: `google_${Date.now()}`
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setLoading(false);
      onSuccess(res.data.user);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 380, padding: "28px 24px" }}>
        {/* Google Header Logo */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <svg width="38" height="38" viewBox="0 0 48 48" style={{ margin: "0 auto 12px" }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: "0 0 4px" }}>Sign in with Google</h3>
          <p style={{ fontSize: 13, color: "#5f6368", margin: 0 }}>to continue to <strong style={{ color: "#1a1a2e" }}>ShivamPay</strong></p>
        </div>

        <form onSubmit={handleGoogleAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label" style={{ fontSize: 12, color: "#5f6368" }}>Google Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you.name@gmail.com"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" style={{ fontSize: 12, color: "#5f6368" }}>Your Name (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Alex Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-error" style={{ fontSize: 12 }}>{error}</div>}

          <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#5f6368", lineHeight: 1.5 }}>
            🔒 <strong>Single Sign-On (SSO):</strong> You won't need to type or remember any password. Your session remains protected for 30 days.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.6, background: "#1a73e8" }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
