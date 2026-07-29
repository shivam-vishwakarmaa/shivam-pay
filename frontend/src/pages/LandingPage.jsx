import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', -apple-system, sans-serif", color: "#171717" }}>
      {/* Vercel Style Navigation */}
      <nav style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "#171717", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 800, fontSize: 14, letterSpacing: -0.5 }}>SP</div>
          <span style={{ fontSize: 19, fontWeight: 800, color: "#171717", letterSpacing: "-0.5px" }}>ShivamPay</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "#ffffff", border: "1px solid #ebebeb", color: "#171717", padding: "8px 20px", borderRadius: 9999, cursor: "pointer", fontSize: 13.5, fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#171717"; e.currentTarget.style.background = "#fafafa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.background = "#ffffff"; }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{ background: "#171717", border: "none", color: "#ffffff", padding: "8.5px 22px", borderRadius: 9999, cursor: "pointer", fontSize: 13.5, fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#000000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#171717"; }}
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* Vercel Hero Section */}
      <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center", padding: "70px 24px 60px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 9999, background: "#ffffff", border: "1px solid #ebebeb", fontSize: 12.5, fontWeight: 600, color: "#171717", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0070f3" }} /> Next-Gen P2P Financial Platform & Wallet
        </div>

        <h1 style={{ fontSize: "clamp(34px, 5.5vw, 54px)", fontWeight: 900, color: "#171717", lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-1.5px" }}>
          Send money & lend to<br />
          <span style={{ background: "linear-gradient(180deg, #171717 0%, #444444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            friends you trust.
          </span>
        </h1>
        
        <p style={{ fontSize: 16.5, color: "#667085", lineHeight: 1.7, marginBottom: 32, maxWidth: 540, margin: "0 auto 32px" }}>
          Add real money via Razorpay, transfer instantly to peers with a 4-digit PIN, and create P2P loans with automated monthly EMI deductions.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/register")}
            style={{ background: "#171717", border: "none", color: "#ffffff", padding: "13px 32px", borderRadius: 9999, cursor: "pointer", fontSize: 14.5, fontWeight: 600, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#000000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#171717"; }}
          >
            Create Free Account →
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "#ffffff", border: "1px solid #ebebeb", color: "#171717", padding: "13px 32px", borderRadius: 9999, cursor: "pointer", fontSize: 14.5, fontWeight: 600, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#171717"; e.currentTarget.style.background = "#fafafa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.background = "#ffffff"; }}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {[
          { icon: "💳", title: "Real Payments", desc: "Add money via Razorpay using any UPI, card, or net banking. Secured with HMAC-SHA256 verification." },
          { icon: "🤝", title: "P2P Friend Loans", desc: "Lend money to friends with custom interest rates. Automated EMI deductions every month on your chosen date." },
          { icon: "⚡", title: "Zero-Fee Settlement", desc: "Borrowers can settle their full loan at any time with absolutely zero prepayment or closure fees." },
          { icon: "✉️", title: "Smart Email Alerts", desc: "Automated email notifications when EMI can't be deducted due to low balance. Never miss a payment." },
          { icon: "🔒", title: "Bank-Grade Security", desc: "We never store your card numbers, bank passwords, or UPI PINs. All payment data stays with Razorpay." },
          { icon: "📊", title: "Full Audit Trail", desc: "Every transaction is logged with timestamps, reference IDs, and printable receipts for complete transparency." },
        ].map(f => (
          <div key={f.title} className="card" style={{ background: "#ffffff", border: "1px solid #ebebeb", borderRadius: 16, padding: 26, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", transition: "all 0.15s" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fafafa", border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
              {f.icon}
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#171717", letterSpacing: "-0.3px" }}>{f.title}</h3>
            <p style={{ margin: 0, fontSize: 13.5, color: "#667085", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Vercel Footer */}
      <footer style={{ borderTop: "1px solid #ebebeb", padding: "28px 24px", textAlign: "center", fontSize: 13, color: "#888888" }}>
        © {new Date().getFullYear()} ShivamPay. Built with React & Node.js. Designed with Vercel aesthetic.
      </footer>
    </div>
  );
}
