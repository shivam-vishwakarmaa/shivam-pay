import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-bg" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1c1c27" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>SP</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>ShivamPay</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 13, color: "#6b6b7b", fontWeight: 500, display: "none" }}>Features</span>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "1px solid #2a2a38", color: "#c8c8d4", padding: "8px 20px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#6366f1"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a38"; e.target.style.color = "#c8c8d4"; }}>
            Sign In
          </button>
          <button onClick={() => navigate("/register")} style={{ background: "#6366f1", border: "none", color: "#fff", padding: "9px 22px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "background 0.15s" }}
            onMouseEnter={e => e.target.style.background = "#4f46e5"}
            onMouseLeave={e => e.target.style.background = "#6366f1"}>
            Get Started — Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", padding: "80px 32px 60px" }}>
        <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 24, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          India's Smart UPI + P2P Lending Platform
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.03em" }}>
          Send money, pay bills &<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            lend to trusted friends.
          </span>
        </h1>
        <p style={{ fontSize: 17, color: "#9898a8", lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: "0 auto 36px" }}>
          Free UPI payments, automated P2P loans with scheduled EMI deductions, and real money top-ups via Razorpay — all in one secure platform.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/register")} style={{ background: "#6366f1", border: "none", color: "#fff", padding: "14px 32px", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}
            onMouseEnter={e => e.target.style.background = "#4f46e5"} onMouseLeave={e => e.target.style.background = "#6366f1"}>
            Create Free Account →
          </button>
          <button onClick={() => navigate("/login")} style={{ background: "transparent", border: "1px solid #2a2a38", color: "#c8c8d4", padding: "14px 32px", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
            Sign In
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: "#4a4a5a" }}>✓ Free to join · ✓ ₹10,000 sandbox balance · ✓ No hidden fees</p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { icon: "💳", title: "Free UPI Payments", desc: "Every user gets a personal UPI ID (@shivampay). Send, receive and scan QR codes instantly with zero platform fees.", tag: "Free" },
          { icon: "🤝", title: "P2P Friend Loans + Auto EMI", desc: "Lend money with customizable interest rates. Our automated cron engine withdraws EMIs on your chosen date every month.", tag: "Core Feature", highlight: true },
          { icon: "⚡", title: "Zero-Fee Foreclosure", desc: "Borrowers can settle the full loan amount at any time with absolutely zero prepayment or closure penalties.", tag: "₹0 Fee" },
          { icon: "✉️", title: "Smart Email Alerts", desc: "If EMI can't be deducted due to low balance, an automatic email alert is sent so borrowers can top up in time.", tag: "Automated" },
          { icon: "🔒", title: "HMAC-Secured Payments", desc: "Real Razorpay payments use SHA-256 signature verification. Your database never stores card or bank credentials.", tag: "Bank-Grade" },
          { icon: "📊", title: "Complete Audit Ledger", desc: "Every transaction — UPI transfer, bill payment, loan disbursement, and EMI — is logged with printable invoices.", tag: "Immutable" },
        ].map(f => (
          <div key={f.title} style={{ background: f.highlight ? "rgba(99,102,241,0.08)" : "#111118", border: `1px solid ${f.highlight ? "rgba(99,102,241,0.3)" : "#1c1c27"}`, borderRadius: 16, padding: "24px", transition: "transform 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>{f.title}</h3>
              <span style={{ fontSize: 10, fontWeight: 700, background: f.highlight ? "#6366f1" : "#1c1c27", color: f.highlight ? "#fff" : "#6b6b7b", borderRadius: 20, padding: "2px 8px", letterSpacing: "0.04em" }}>{f.tag}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#6b6b7b", lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
