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
        setError("New account detected! Please set up your 4-digit security PIN below to finalize.");
      } else {
        setError(err.response?.data?.message || "Google Sign-In verification failed. Please try again.");
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
    <div className="modal-overlay" onClick={(e) => { if (!loading && e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 400, padding: "32px 28px", background: "#ffffff", border: "1px solid #ebebeb", borderRadius: 16, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>

        <h3 style={{ fontSize: 19, fontWeight: 700, color: "#171717", margin: "0 0 6px", letterSpacing: "-0.4px" }}>Google Authentication</h3>
        <p style={{ fontSize: 13.5, color: "#667085", margin: "0 0 22px" }}>
          Instant and secure zero-password onboarding for <strong style={{ color: "#171717", fontWeight: 600 }}>ShivamPay</strong>
        </p>

        {!clientIdSet ? (
          <div className="alert alert-error" style={{ textAlign: "left", fontSize: 13, background: "#fff5f5", borderColor: "#ffc9c9", color: "#c92a2a" }}>
            ⚠️ <strong>Configuration Missing:</strong> <code>VITE_GOOGLE_CLIENT_ID</code> is not configured in frontend <code>.env</code>. Please set it to enable live Google SSO.
          </div>
        ) : loading ? (
          <div style={{ padding: "24px 16px", background: "#fafafa", borderRadius: 12, border: "1px solid #ebebeb" }}>
            <div style={{ width: 28, height: 28, border: "3px solid #ebebeb", borderTopColor: "#171717", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: "#171717", marginBottom: 4 }}>Verifying security credentials...</div>
            <div style={{ fontSize: 12, color: "#667085" }}>Please wait while our cloud deployment initializes and authenticates your token.</div>
          </div>
        ) : requirePin ? (
          <form onSubmit={handlePinSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "12px 14px", background: "#fafafa", border: "1px solid #e4e7ec", borderRadius: 10, fontSize: 12.5, textAlign: "left", color: "#475467" }}>
              🔒 To secure your wallet money transfers, please choose a 4-digit onboarding PIN.
            </div>
            <div>
              <label className="label" style={{ fontSize: 12, color: "#475467", display: "block", marginBottom: 6, fontWeight: 600 }}>Select 4-Digit Security PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                placeholder="••••"
                required
                autoFocus
                style={{ width: 140, textAlign: "center", fontSize: 22, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8, margin: "0 auto", display: "block" }}
                value={upiPin}
                onChange={(e) => setUpiPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <div className="alert alert-error" style={{ fontSize: 12 }}>{error}</div>}
            <button type="submit" className="btn" disabled={loading || upiPin.length !== 4} style={{ width: "100%", background: "#171717", color: "#fff", borderRadius: 9999, padding: "11px" }}>
              {loading ? "Creating Wallet..." : "Complete Setup & Sign In →"}
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              {/* Notice: removed useOneTap to eliminate repeated account redirection loops and popup conflicts! */}
              <GoogleLogin
                onSuccess={(credentialResponse) => handleIdTokenSubmission(credentialResponse.credential)}
                onError={() => setError("Google sign-in popup was closed or authentication was rejected.")}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="280"
              />
            </div>
            {error && <div className="alert alert-error" style={{ fontSize: 12, width: "100%", textAlign: "left" }}>{error}</div>}
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: 24, borderTop: "1px solid #ebebeb", paddingTop: 16 }}>
            <button type="button" onClick={onClose} style={{ width: "100%", padding: "9px", background: "transparent", border: "1px solid #ebebeb", borderRadius: 9999, fontSize: 13, fontWeight: 600, color: "#475467", cursor: "pointer", transition: "all 0.15s" }}>
              Cancel & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
