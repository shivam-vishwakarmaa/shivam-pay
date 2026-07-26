import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>SP</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>ShivamPay</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", border: "1px solid #d0d5dd", color: "#344054", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Sign In</button>
          <button onClick={() => navigate("/register")} style={{ background: "#3b5bdb", border: "none", color: "#fff", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "60px 28px 50px" }}>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.15, margin: "0 0 16px" }}>
          Send money & lend to<br />
          <span style={{ color: "#3b5bdb" }}>friends you trust.</span>
        </h1>
        <p style={{ fontSize: 16, color: "#667085", lineHeight: 1.7, marginBottom: 28, maxWidth: 500, margin: "0 auto 28px" }}>
          Add real money via Razorpay, transfer instantly to peers, and create P2P loans with automated monthly EMI deductions. Zero closure fees.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => navigate("/register")} style={{ background: "#3b5bdb", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Create Free Account →</button>
          <button onClick={() => navigate("/login")} style={{ background: "#fff", border: "1px solid #d0d5dd", color: "#344054", padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Sign In</button>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {[
          { icon: "💳", title: "Real Payments", desc: "Add money via Razorpay using any UPI, card, or net banking. Secured with HMAC-SHA256 verification." },
          { icon: "🤝", title: "P2P Friend Loans", desc: "Lend money to friends with custom interest rates. Automated EMI deductions every month on your chosen date." },
          { icon: "⚡", title: "Zero-Fee Settlement", desc: "Borrowers can settle their full loan at any time with absolutely zero prepayment or closure fees." },
          { icon: "✉️", title: "Smart Alerts", desc: "Automated email notifications when EMI can't be deducted due to low balance. Never miss a payment." },
          { icon: "🔒", title: "Bank-Grade Security", desc: "We never store your card numbers, bank passwords, or UPI PINs. All payment data stays with Razorpay." },
          { icon: "📊", title: "Full Audit Trail", desc: "Every transaction is logged with timestamps, reference IDs, and printable receipts for complete transparency." },
        ].map(f => (
          <div key={f.title} style={{ background: "#fff", border: "1px solid #eaecf0", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#667085", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
