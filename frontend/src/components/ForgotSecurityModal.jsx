import { useState } from "react";
import axios from "axios";
import { API } from "../config/api";

export default function ForgotSecurityModal({ isOpen, onClose }) {
  const [step, setStep] = useState("IDENTIFIER"); // IDENTIFIER | VERIFY
  const [mode, setMode] = useState("PASSWORD"); // PASSWORD | PIN
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "", demoOtp: null, emailHint: "" });

  if (!isOpen) return null;

  const resetState = () => {
    setStep("IDENTIFIER");
    setIdentifier("");
    setOtp("");
    setNewPassword("");
    setNewPin("");
    setStatus({ type: "", msg: "", demoOtp: null, emailHint: "" });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setStatus({ type: "", msg: "", demoOtp: null, emailHint: "" });

    try {
      const res = await axios.post(`${API}/auth/send-otp`, { identifier });
      setLoading(false);
      setStatus({ 
        type: "success", 
        msg: res.data.message, 
        demoOtp: res.data.demoOtp || null, 
        emailHint: res.data.emailHint || "" 
      });
      setStep("VERIFY");
    } catch (err) {
      setLoading(false);
      setStatus({ type: "error", msg: err.response?.data?.message || "Failed to send verification code." });
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setStatus({ type: "error", msg: "Please enter the 6-digit verification code." });
      return;
    }

    if (mode === "PASSWORD" && newPassword.length < 6) {
      setStatus({ type: "error", msg: "New password must be at least 6 characters." });
      return;
    }
    if (mode === "PIN" && !/^\d{4}$/.test(newPin)) {
      setStatus({ type: "error", msg: "New security PIN must be exactly 4 digits." });
      return;
    }

    setLoading(true);
    setStatus(s => ({ ...s, type: "", msg: "" }));

    const endpoint = mode === "PASSWORD" ? "/auth/verify-otp-reset-password" : "/auth/verify-otp-reset-pin";
    const payload = mode === "PASSWORD" 
      ? { identifier, otp, newPassword } 
      : { identifier, otp, newPin };

    try {
      const res = await axios.post(`${API}${endpoint}`, payload);
      setLoading(false);
      setStatus({ type: "success", msg: res.data.message || "Reset successful!" });
      setTimeout(() => {
        resetState();
        onClose();
      }, 2000);
    } catch (err) {
      setLoading(false);
      setStatus(s => ({ ...s, type: "error", msg: err.response?.data?.message || "Verification failed." }));
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (!loading && e.target === e.currentTarget) { resetState(); onClose(); } }}>
      <div className="modal" style={{ maxWidth: 430, padding: "32px 28px", background: "#ffffff", border: "1px solid #ebebeb", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171717", margin: 0, letterSpacing: "-0.3px" }}>
            {mode === "PASSWORD" ? "Reset Account Password" : "Reset Security PIN"}
          </h3>
          <button type="button" onClick={() => { resetState(); onClose(); }} style={{ background: "transparent", border: "none", color: "#98a2b3", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        {/* Tab selection */}
        {step === "IDENTIFIER" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#fafafa", padding: 6, borderRadius: 12, border: "1px solid #ebebeb", marginBottom: 22 }}>
            <button
              type="button"
              onClick={() => { setMode("PASSWORD"); setStatus({ type: "", msg: "" }); }}
              style={{ padding: "8px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s", background: mode === "PASSWORD" ? "#171717" : "transparent", color: mode === "PASSWORD" ? "#fff" : "#667085" }}
            >
              Password Reset
            </button>
            <button
              type="button"
              onClick={() => { setMode("PIN"); setStatus({ type: "", msg: "" }); }}
              style={{ padding: "8px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s", background: mode === "PIN" ? "#171717" : "transparent", color: mode === "PIN" ? "#fff" : "#667085" }}
            >
              PIN Reset
            </button>
          </div>
        )}

        {step === "IDENTIFIER" ? (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>
              Enter your registered username or email address. We will generate an instant verification code (OTP) to your registered email.
            </p>
            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>Username or Registered Email</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. alex_miller or alex@example.com"
                required
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            {status.msg && (
              <div className={`alert alert-${status.type}`} style={{ fontSize: 12.5, borderRadius: 8 }}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading || !identifier.trim()} className="btn" style={{ background: "#171717", color: "#fff", padding: "11px", borderRadius: 9999, fontWeight: 600, width: "100%", cursor: "pointer" }}>
              {loading ? "Sending Code..." : "Send Verification OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "12px 14px", background: "#f8f9fa", border: "1px solid #ebebeb", borderRadius: 10, fontSize: 12.5, color: "#475467" }}>
              ✉️ Verification code sent for account matching <b>{identifier}</b> {status.emailHint && `(${status.emailHint})`}.
              {status.demoOtp && (
                <div style={{ marginTop: 8, padding: "6px 10px", background: "#fff9db", border: "1px solid #ffe066", borderRadius: 6, color: "#ab570a", fontWeight: 600 }}>
                  ⚡ Demo/Test Mode Active: Your OTP is <code>{status.demoOtp}</code>
                </div>
              )}
            </div>

            <div>
              <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>6-Digit Verification Code</label>
              <input
                className="input"
                type="text"
                maxLength={6}
                placeholder="123456"
                required
                autoFocus
                style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8, fontWeight: 700 }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            {mode === "PASSWORD" ? (
              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>New Secure Password</label>
                <input
                  className="input"
                  type="password"
                  minLength={6}
                  placeholder="At least 6 characters"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="label" style={{ fontSize: 13, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}>New 4-Digit Security PIN</label>
                <input
                  className="input"
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  required
                  style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8, fontWeight: 700 }}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            )}

            {status.msg && (
              <div className={`alert alert-${status.type}`} style={{ fontSize: 12.5, borderRadius: 8 }}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading || !otp.trim()} className="btn" style={{ background: "#171717", color: "#fff", padding: "11px", borderRadius: 9999, fontWeight: 600, width: "100%", cursor: "pointer" }}>
              {loading ? "Verifying & Updating..." : `Confirm New ${mode === "PASSWORD" ? "Password" : "PIN"}`}
            </button>
            
            <button type="button" onClick={() => setStep("IDENTIFIER")} style={{ background: "transparent", border: "none", color: "#667085", fontSize: 12.5, cursor: "pointer", fontWeight: 500, marginTop: 4 }}>
              ← Resend or choose another identifier
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
