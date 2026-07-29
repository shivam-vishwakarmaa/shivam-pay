import { useState } from "react";
import axios from "axios";
import { API } from "../../config/api";

export default function SettingsSection({ user, auth, loadAll }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState({ type: "", msg: "" });
  
  // OTP Reset section state
  const [otpStep, setOtpStep] = useState("IDLE"); // IDLE | SENT
  const [otpMode, setOtpMode] = useState("PASSWORD"); // PASSWORD | PIN
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [otpStatus, setOtpStatus] = useState({ type: "", msg: "", demoOtp: null });
  const [otpLoading, setOtpLoading] = useState(false);

  // 1. Authenticated Change PIN (Knowing current PIN)
  const handleChangePin = async (e) => {
    e.preventDefault();
    setPinStatus({ type: "", msg: "" });

    if (!/^\d{4}$/.test(newPin) || !/^\d{4}$/.test(currentPin)) {
      setPinStatus({ type: "error", msg: "Both current and new PIN must be exactly 4 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setPinStatus({ type: "error", msg: "New PIN and confirm PIN do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/change-pin`, { currentPin, newPin }, auth);
      setLoading(false);
      setPinStatus({ type: "success", msg: res.data.message || "PIN successfully updated!" });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      if (loadAll) loadAll();
    } catch (err) {
      setLoading(false);
      setPinStatus({ type: "error", msg: err.response?.data?.message || "Failed to update security PIN." });
    }
  };

  // 2. Send OTP via registered Email for Password/PIN Reset
  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpStatus({ type: "", msg: "", demoOtp: null });
    try {
      const res = await axios.post(`${API}/auth/send-otp`, { identifier: user?.email || user?.username });
      setOtpLoading(false);
      setOtpStep("SENT");
      setOtpStatus({ 
        type: "success", 
        msg: res.data.message || `Verification code sent to your registered email (${user?.email}).`,
        demoOtp: res.data.demoOtp || null
      });
    } catch (err) {
      setOtpLoading(false);
      setOtpStatus({ type: "error", msg: err.response?.data?.message || "Failed to generate verification code." });
    }
  };

  // 3. Verify OTP and update Password or PIN
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setOtpStatus({ type: "error", msg: "Please enter the 6-digit verification code." });
      return;
    }

    if (otpMode === "PASSWORD" && newPassword.length < 6) {
      setOtpStatus({ type: "error", msg: "New password must be at least 6 characters." });
      return;
    }
    if (otpMode === "PIN" && !/^\d{4}$/.test(resetNewPin)) {
      setOtpStatus({ type: "error", msg: "New security PIN must be exactly 4 digits." });
      return;
    }

    setOtpLoading(true);
    const endpoint = otpMode === "PASSWORD" ? "/auth/verify-otp-reset-password" : "/auth/verify-otp-reset-pin";
    const payload = otpMode === "PASSWORD" 
      ? { identifier: user?.username, otp: otpCode, newPassword } 
      : { identifier: user?.username, otp: otpCode, newPin: resetNewPin };

    try {
      const res = await axios.post(`${API}${endpoint}`, payload);
      setOtpLoading(false);
      setOtpStatus({ type: "success", msg: res.data.message || "Security credentials reset successfully!" });
      setOtpCode("");
      setNewPassword("");
      setResetNewPin("");
      setOtpStep("IDLE");
      if (loadAll) loadAll();
    } catch (err) {
      setOtpLoading(false);
      setOtpStatus(s => ({ ...s, type: "error", msg: err.response?.data?.message || "Verification failed." }));
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Page header */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#171717", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Security & Account Settings</h2>
        <p style={{ fontSize: 14, color: "#667085", margin: 0 }}>Manage your digital wallet credentials, security PIN, and account recovery options.</p>
      </div>

      {/* Profile Info Card */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 16, borderBottom: "1px solid #ebebeb" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#171717", margin: "0 0 4px" }}>Account Profile</h3>
            <p style={{ fontSize: 13, color: "#888888", margin: 0 }}>Verified digital account and payment gateway link</p>
          </div>
          <span className={`badge ${user?.authProvider === "google" ? "badge-green" : "badge-gray"}`}>
            {user?.authProvider === "google" ? "⚡ Google OAuth SSO Verified" : "📧 Password Verified Account"}
          </span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 20 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#888888", textTransform: "uppercase", marginBottom: 4 }}>Full Name</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>{user?.name || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#888888", textTransform: "uppercase", marginBottom: 4 }}>Username</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#171717", fontFamily: "'JetBrains Mono', monospace" }}>@{user?.username || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#888888", textTransform: "uppercase", marginBottom: 4 }}>Registered Email</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>{user?.email || "No email linked"}</div>
          </div>
        </div>
      </div>

      {/* Change PIN Card */}
      <div className="card">
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#171717", margin: "0 0 4px" }}>Change Security PIN</h3>
        <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Update your 4-digit onboarding PIN required for transfers and loan settlements.</p>

        <form onSubmit={handleChangePin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <div>
              <label className="label">Current PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                placeholder="••••"
                required
                style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", letterSpacing: 6, fontWeight: 700 }}
                value={currentPin}
                onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div>
              <label className="label">New 4-Digit PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                placeholder="••••"
                required
                style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", letterSpacing: 6, fontWeight: 700 }}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div>
              <label className="label">Confirm New PIN</label>
              <input
                className="input"
                type="password"
                maxLength={4}
                placeholder="••••"
                required
                style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", letterSpacing: 6, fontWeight: 700 }}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          {pinStatus.msg && (
            <div className={`alert alert-${pinStatus.type}`} style={{ fontSize: 13 }}>
              {pinStatus.msg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" disabled={loading || !currentPin || !newPin || !confirmPin} className="btn btn-primary">
              {loading ? "Updating PIN..." : "Save New Security PIN →"}
            </button>
          </div>
        </form>
      </div>

      {/* Forgot PIN / Change Password via Email OTP Card */}
      <div className="card" style={{ background: "#fafafa", border: "1px solid #ebebeb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#171717", margin: "0 0 4px" }}>Email OTP Security Recovery</h3>
            <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>Forgot your PIN or want to reset your account password? Verify identity using an OTP sent to your registered email.</p>
          </div>
          
          {otpStep === "IDLE" && (
            <div style={{ display: "flex", gap: 8, background: "#ffffff", padding: 4, borderRadius: 9999, border: "1px solid #ebebeb" }}>
              <button
                type="button"
                onClick={() => setOtpMode("PASSWORD")}
                style={{ padding: "6px 12px", borderRadius: 9999, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: otpMode === "PASSWORD" ? "#171717" : "transparent", color: otpMode === "PASSWORD" ? "#ffffff" : "#667085", transition: "all 0.15s" }}
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => setOtpMode("PIN")}
                style={{ padding: "6px 12px", borderRadius: 9999, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: otpMode === "PIN" ? "#171717" : "transparent", color: otpMode === "PIN" ? "#ffffff" : "#667085", transition: "all 0.15s" }}
              >
                Reset PIN
              </button>
            </div>
          )}
        </div>

        {otpStatus.msg && (
          <div className={`alert alert-${otpStatus.type}`} style={{ marginBottom: 16, fontSize: 13, background: "#ffffff" }}>
            <div style={{ flex: 1 }}>
              {otpStatus.msg}
              {otpStatus.demoOtp && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff9db", border: "1px solid #ffe066", borderRadius: 8, color: "#ab570a", fontWeight: 600 }}>
                  ⚡ Demo/Test Mode Active: Your verification code is <code style={{ fontSize: 15 }}>{otpStatus.demoOtp}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {otpStep === "IDLE" ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={otpLoading}
            className="btn"
            style={{ background: "#ffffff", border: "1px solid #171717", color: "#171717", borderRadius: 9999, padding: "10px 20px", fontWeight: 600 }}
          >
            {otpLoading ? "Generating OTP..." : `Send OTP to Email (${user?.email || user?.username}) →`}
          </button>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16, background: "#ffffff", padding: 20, borderRadius: 12, border: "1px solid #ebebeb" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              <div>
                <label className="label">6-Digit Verification Code</label>
                <input
                  className="input"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  style={{ textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 6, fontWeight: 700 }}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              
              {otpMode === "PASSWORD" ? (
                <div>
                  <label className="label">New Account Password</label>
                  <input
                    className="input"
                    type="password"
                    minLength={6}
                    placeholder="Min 6 characters"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="label">New 4-Digit Security PIN</label>
                  <input
                    className="input"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    required
                    style={{ textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 6, fontWeight: 700 }}
                    value={resetNewPin}
                    onChange={e => setResetNewPin(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
              <button type="button" onClick={() => setOtpStep("IDLE")} style={{ background: "none", border: "none", color: "#667085", fontSize: 13, cursor: "pointer", fontWeight: 500, padding: 0 }}>
                ← Choose another security mode or resend code
              </button>
              
              <button type="submit" disabled={otpLoading || !otpCode} className="btn btn-primary">
                {otpLoading ? "Verifying..." : `Confirm & Reset ${otpMode === "PASSWORD" ? "Password" : "PIN"}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
