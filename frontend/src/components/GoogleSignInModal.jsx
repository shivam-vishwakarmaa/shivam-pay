import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { API } from "../config/api";

export default function GoogleSignInModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requirePin, setRequirePin] = useState(false);
  const [cachedIdToken, setCachedIdToken] = useState(null);
  const [upiPin, setUpiPin] = useState("");

  if (!isOpen) return null;

  const handleIdTokenSubmission = async (idToken, pinToSubmit = null) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/auth/google-login`, {
        idToken,
        upiPin: pinToSubmit
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setLoading(false);
      onSuccess(res.data.user);
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 400 && err.response?.data?.requirePin) {
        setRequirePin(true);
        setCachedIdToken(idToken);
        setError("New account detected. Please create a 4-digit security PIN to complete setup.");
      } else {
        setError(err.response?.data?.message || "Google Sign-In verification failed.");
      }
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(upiPin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    handleIdTokenSubmission(cachedIdToken, upiPin);
  };

  const clientIdSet = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400, padding: "28px 24px", textAlign: "center" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: "0 0 6px" }}>Sign in with Google</h3>
        <p style={{ fontSize: 13, color: "#5f6368", margin: "0 0 20px" }}>
          Secure authentication for <strong style={{ color: "#1a1a2e" }}>ShivamPay</strong>
        </p>

        {!clientIdSet ? (
          <div className="alert alert-error" style={{ textAlign: "left", fontSize: 13 }}>
            ⚠️ <strong>Configuration Error:</strong> <code>VITE_GOOGLE_CLIENT_ID</code> is not set in environment variables. Please configure your Google Client ID in frontend `.env` to enable OAuth Sign-In.
          </div>
        ) : requirePin ? (
          <form onSubmit={handlePinSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="alert alert-info" style={{ fontSize: 12, textAlign: "left" }}>
              🔒 To protect your wallet transactions, create a 4-digit security PIN.
            </div>
            <div>
              <label className="label" style={{ fontSize: 12, color: "#5f6368", display: "block", marginBottom: 6 }}>Create 4-Digit Security PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                placeholder="••••"
                required
                autoFocus
                style={{ width: 140, textAlign: "center", fontSize: 22, fontFamily: "JetBrains Mono, monospace", letterSpacing: 10, margin: "0 auto", display: "block" }}
                value={upiPin}
                onChange={(e) => setUpiPin(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-error" style={{ fontSize: 12 }}>{error}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || upiPin.length !== 4} style={{ width: "100%" }}>
              {loading ? "Creating Account..." : "Confirm & Sign In →"}
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <GoogleLogin
                onSuccess={(credentialResponse) => handleIdTokenSubmission(credentialResponse.credential)}
                onError={() => setError("Google OAuth pop-up was closed or authentication failed.")}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
              />
            </div>
            {error && <div className="alert alert-error" style={{ fontSize: 12, width: "100%", textAlign: "left" }}>{error}</div>}
          </div>
        )}

        <div style={{ marginTop: 22, borderTop: "1px solid #eaecf0", paddingTop: 14 }}>
          <button type="button" className="btn btn-outline" onClick={onClose} style={{ width: "100%" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
