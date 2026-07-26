import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";

// ─── Icons (inline SVG components for zero extra deps) ─────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", sw = "1.8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  home:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  send:     "M22 2L11 13 M22 2L15 22 8 13 2 9z",
  loan:     ["M12 2v20","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  history:  ["M3 3h18v4H3z","M3 10h18v4H3z","M3 17h18v4H3z"],
  bell:     ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  logout:   ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  qr:       ["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h1v1h-1z","M18 14h3","M14 18h1v3h-1z","M18 18h3v3h-3z","M18 21v-3"],
  wallet:   ["M21 12V7H5a2 2 0 0 1 0-4h14v4","M3 5v14a2 2 0 0 0 2 2h16v-5","M18 12a2 2 0 0 0 0 4h4v-4z"],
  plus:     "M12 5v14M5 12h14",
  check:    "M20 6L9 17l-5-5",
  x:        "M18 6L6 18M6 6l12 12",
  arrow_up: "M12 19V5M5 12l7-7 7 7",
  arrow_dn: "M12 5v14M5 12l7 7 7-7",
  search:   ["M21 21l-4.35-4.35","M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0"],
  alert:    ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  eye:      ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  bank:     ["M3 22h18","M6 18V11","M10 18V11","M14 18V11","M18 18V11","M12 2L2 7h20L12 2z"],
  copy:     ["M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2","M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  receipt:  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
};

const API = "http://localhost:3000/pytm";

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [tab, setTab] = useState("HOME");
  const [user, setUser] = useState({ bankbalance: 0, name: "", username: "", upiId: "", linkedBank: "", email: "" });
  const [users, setUsers]             = useState([]);
  const [transactions, setTxns]       = useState([]);
  const [loans, setLoans]             = useState([]);
  const [notifications, setNotifs]    = useState([]);
  const [razorpayConfig, setRzpCfg]   = useState({ isConfigured: false, keyId: null });
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  // Modals
  const [modal, setModal]             = useState(null); // 'send'|'qr'|'scan'|'bill'|'loan'|'topup'|'receipt'|'accept'|'foreclose'|'settings'
  const [modalData, setModalData]     = useState(null);

  // Form states
  const [sendForm, setSend]           = useState({ receiverIdentifier: "", amount: "", pin: "", description: "" });
  const [billForm, setBill]           = useState({ billerName: "Electricity Board", category: "Electricity", amount: "", pin: "", consumerNumber: "" });
  const [loanForm, setLoan]           = useState({ partnerUsername: "", role: "LENDER", principalAmount: "", interestRate: "5", durationMonths: "6", deductionDayOfMonth: "5", remarks: "" });
  const [topupAmount, setTopup]       = useState("");
  const [pinInput, setPin]            = useState("");
  const [txnState, setTxnState]       = useState({ status: "idle", msg: "" }); // idle|loading|success|error
  const [searchQ, setSearch]          = useState("");
  const [copiedUpi, setCopied]        = useState(false);

  const confettiFire = () => confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 }, colors: ["#6366f1","#10b981","#f59e0b"] });

  const loadAll = useCallback(async () => {
    if (!token) { navigate("/login"); return; }
    setRefreshing(true);
    try {
      const [balR, usersR, txnR, loanR, notifR, rzpR] = await Promise.allSettled([
        axios.get(`${API}/balance`, auth),
        axios.get(`${API}/all/allusers`, auth),
        axios.get(`${API}/trasiction/history`, auth),
        axios.get(`${API}/loans/my-loans`, auth),
        axios.get(`${API}/notifications/my-notifications`, auth),
        axios.get(`${API}/razorpay/config`, auth),
      ]);
      if (balR.status === "fulfilled") setUser(balR.value.data);
      if (usersR.status === "fulfilled") setUsers((usersR.value.data || []).filter(u => u.username !== balR.value?.data?.username));
      if (txnR.status === "fulfilled") setTxns(txnR.value.data.transactions || []);
      if (loanR.status === "fulfilled") setLoans(loanR.value.data.loans || []);
      if (notifR.status === "fulfilled") setNotifs(notifR.value.data.notifications || []);
      if (rzpR.status === "fulfilled") setRzpCfg(rzpR.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const closeModal = () => { setModal(null); setModalData(null); setTxnState({ status: "idle", msg: "" }); setPin(""); };
  const openModal = (name, data = null) => { setModal(name); setModalData(data); setTxnState({ status: "idle", msg: "" }); setPin(""); };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    setTxnState({ status: "loading", msg: "Verifying UPI PIN & initiating transfer..." });
    try {
      await axios.post(`${API}/trasiction/payment`, sendForm, auth);
      setTxnState({ status: "success", msg: `${fmt(sendForm.amount)} sent successfully!` });
      confettiFire(); loadAll();
      setTimeout(() => { closeModal(); setSend({ receiverIdentifier: "", amount: "", pin: "", description: "" }); }, 1800);
    } catch (err) { setTxnState({ status: "error", msg: err.response?.data?.message || "Transfer failed." }); }
  };

  const handleBill = async (e) => {
    e.preventDefault();
    setTxnState({ status: "loading", msg: "Processing bill payment..." });
    try {
      await axios.post(`${API}/trasiction/bills/pay`, billForm, auth);
      setTxnState({ status: "success", msg: `${billForm.billerName} bill paid — ${fmt(billForm.amount)}!` });
      confettiFire(); loadAll();
      setTimeout(closeModal, 1800);
    } catch (err) { setTxnState({ status: "error", msg: err.response?.data?.message || "Bill payment failed." }); }
  };

  const handleLoan = async (e) => {
    e.preventDefault();
    setTxnState({ status: "loading", msg: "Submitting loan agreement..." });
    try {
      await axios.post(`${API}/loans/propose`, loanForm, auth);
      setTxnState({ status: "success", msg: "Loan proposal sent to partner!" });
      loadAll(); setTimeout(closeModal, 1600);
    } catch (err) { setTxnState({ status: "error", msg: err.response?.data?.message || "Failed to create loan." }); }
  };

  const handleAccept = async () => {
    setTxnState({ status: "loading", msg: "Verifying PIN and dispersing funds..." });
    try {
      await axios.post(`${API}/loans/accept/${modalData._id}`, { pin: pinInput }, auth);
      setTxnState({ status: "success", msg: "Loan active! Funds atomically transferred." });
      confettiFire(); loadAll(); setTimeout(closeModal, 1800);
    } catch (err) { setTxnState({ status: "error", msg: err.response?.data?.message || "Acceptance failed." }); }
  };

  const handleForeclose = async () => {
    setTxnState({ status: "loading", msg: "Calculating dues and settling loan..." });
    try {
      await axios.post(`${API}/loans/foreclose/${modalData._id}`, { pin: pinInput }, auth);
      setTxnState({ status: "success", msg: "🎉 Loan fully settled — ₹0 closure fees!" });
      confettiFire(); loadAll(); setTimeout(closeModal, 2000);
    } catch (err) { setTxnState({ status: "error", msg: err.response?.data?.message || "Foreclosure failed." }); }
  };

  const handleEmiCron = async () => {
    setTxnState({ status: "loading", msg: "" });
    try {
      const res = await axios.post(`${API}/loans/trigger-cron`, {}, auth);
      const msgs = (res.data.result?.results || []).map(r => r.message).join("\n") || "No EMIs were due today.";
      alert(`⚡ EMI Engine Report:\n\n${msgs}\n\nCheck Notifications for dispatched alerts.`);
      loadAll(); setTxnState({ status: "idle", msg: "" });
    } catch (e) { alert("EMI Engine error: " + (e.response?.data?.message || e.message)); setTxnState({ status: "idle", msg: "" }); }
  };

  const handleTopup = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount < 1) { setTxnState({ status: "error", msg: "Enter a valid amount (min ₹1)." }); return; }
    if (!razorpayConfig.isConfigured || !razorpayConfig.keyId) {
      setTxnState({ status: "error", msg: "Razorpay is not configured yet. Add your API keys to backend/.env to enable real payments." });
      return;
    }
    setTxnState({ status: "loading", msg: "Creating secure payment order..." });
    try {
      const orderRes = await axios.post(`${API}/razorpay/create-order`, { amount }, auth);
      const { orderId, amount: orderAmount, currency } = orderRes.data;
      const options = {
        key: razorpayConfig.keyId,
        amount: orderAmount,
        currency,
        name: "ShivamPay",
        description: "Wallet Top-Up",
        order_id: orderId,
        handler: async (response) => {
          setTxnState({ status: "loading", msg: "Verifying payment..." });
          try {
            const verifyRes = await axios.post(`${API}/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderAmount,
            }, auth);
            setTxnState({ status: "success", msg: verifyRes.data.message });
            confettiFire(); loadAll();
            setTimeout(closeModal, 2000);
          } catch (err) {
            setTxnState({ status: "error", msg: err.response?.data?.message || "Payment verification failed." });
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setTxnState({ status: "idle", msg: "" }) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setTxnState({ status: "idle", msg: "" });
    } catch (err) {
      setTxnState({ status: "error", msg: err.response?.data?.message || "Failed to initiate payment." });
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(user.upiId || `${user.username}@shivampay`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const activeLoans  = loans.filter(l => ["ACTIVE","OVERDUE","PENDING"].includes(l.status));
  const filteredUsers = users.filter(u =>
    !searchQ || u.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const loanCalc = {
    interest: (Number(loanForm.principalAmount) * Number(loanForm.interestRate)) / 100,
    total: Number(loanForm.principalAmount) * (1 + Number(loanForm.interestRate) / 100),
    emi: (Number(loanForm.principalAmount) * (1 + Number(loanForm.interestRate) / 100)) / Math.max(1, Number(loanForm.durationMonths)),
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>SP</div>
      <p style={{ color: "#6b6b7b", fontSize: 14 }}>Loading your account...</p>
    </div>
  );

  // ── Sidebar items ─────────────────────────────────────────────────────────
  const navItems = [
    { id: "HOME",      label: "Home",        icon: "home"    },
    { id: "PAYMENTS",  label: "Payments",    icon: "send"    },
    { id: "LOANS",     label: "Loans & EMI", icon: "loan", badge: activeLoans.length || null },
    { id: "HISTORY",   label: "History",     icon: "history" },
    { id: "NOTIFS",    label: "Notifications", icon: "bell", badge: unreadNotifs || null },
    { id: "SETTINGS",  label: "Settings",    icon: "settings" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Razorpay script */}
      {razorpayConfig.isConfigured && !window.Razorpay && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      )}

      <div className="app-shell">
        {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
        <aside className="sidebar">
          {/* Logo */}
          <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1c1c27" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>SP</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>ShivamPay</div>
              <div style={{ fontSize: 11, color: "#4a4a5a", fontWeight: 500 }}>Financial Suite</div>
            </div>
          </div>

          {/* User mini-profile */}
          <div style={{ margin: "12px 12px 8px", background: "#1c1c27", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e5ef", marginBottom: 2 }}>{user.name || user.username}</div>
            <div style={{ fontSize: 11, color: "#4a4a5a", fontFamily: "JetBrains Mono, monospace" }}>
              {user.upiId || `${user.username}@shivampay`}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#6366f1", marginTop: 8 }}>{fmt(user.bankbalance)}</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "8px 0" }}>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${tab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <Icon d={icons[item.icon]} size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? (
                  <span style={{ background: tab === item.id ? "rgba(255,255,255,0.2)" : "#6366f1", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: "12px 12px 20px", borderTop: "1px solid #1c1c27" }}>
            <div
              className="nav-item"
              onClick={() => { localStorage.clear(); navigate("/login"); }}
              style={{ color: "#ef4444" }}
            >
              <Icon d={icons.logout} size={16} />
              <span>Sign Out</span>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ─────────────────────────────────────────────────── */}
        <div className="main-area">
          {/* Top bar */}
          <header className="top-bar">
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111118" }}>
                {navItems.find(n => n.id === tab)?.label}
              </h2>
            </div>

            {/* Refresh */}
            <button className="btn btn-ghost btn-sm" onClick={loadAll} title="Refresh" disabled={refreshing}>
              <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" size={15} />
              {refreshing ? " Syncing..." : ""}
            </button>

            {/* Notification bell */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ position: "relative" }}
              onClick={() => setTab("NOTIFS")}
            >
              <Icon d={icons.bell} size={16} />
              {unreadNotifs > 0 && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
              )}
            </button>
          </header>

          {/* Page content */}
          <main className="page-content">

            {/* ╔═ HOME ══════════════════════════════════════════════════════ */}
            {tab === "HOME" && (
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Balance + Add Money */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div className="stat-card" style={{ gridColumn: "1 / 3", background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", border: "none" }}>
                    <div className="stat-label" style={{ color: "rgba(255,255,255,0.7)" }}>Available Balance</div>
                    <div className="stat-value" style={{ color: "#fff", fontSize: 34 }}>{fmt(user.bankbalance)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <div className="stat-sub" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
                        {user.upiId || `${user.username}@shivampay`}
                      </div>
                      <button onClick={copyUpi} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "3px 8px", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                        {copiedUpi ? "Copied!" : "Copy UPI"}
                      </button>
                    </div>
                  </div>

                  <div className="stat-card" style={{ cursor: "pointer", border: "2px dashed #e0e7ff", background: "#eef2ff" }}
                    onClick={() => { setTopup(""); openModal("topup"); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <Icon d={icons.plus} size={18} sw="2.5" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#3730a3" }}>Add Money</div>
                        <div style={{ fontSize: 11, color: "#6366f1" }}>via Razorpay · Any UPI/Card</div>
                      </div>
                    </div>
                    <div className="stat-sub" style={{ fontSize: 11, color: "#6b6b7b" }}>
                      {razorpayConfig.isConfigured ? "Real payments enabled ✓" : "Configure API keys to enable"}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
                  {[
                    { label: "Send Money", desc: "UPI Transfer", icon: "send", color: "#6366f1", bg: "#eef2ff", action: () => openModal("send") },
                    { label: "Scan & Pay", desc: "QR Code", icon: "qr", color: "#10b981", bg: "#d1fae5", action: () => openModal("scan") },
                    { label: "Pay Bills", desc: "Electricity · DTH", icon: "receipt", color: "#f59e0b", bg: "#fef3c7", action: () => openModal("bill") },
                    { label: "My QR Code", desc: "Receive money", icon: "bank", color: "#06b6d4", bg: "#cffafe", action: () => openModal("qr") },
                  ].map(a => (
                    <div key={a.label}
                      onClick={a.action}
                      className="card"
                      style={{ cursor: "pointer", padding: "16px", transition: "transform 0.15s, box-shadow 0.15s", border: `1px solid ${a.bg}` }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        <Icon d={icons[a.icon]} size={20} stroke={a.color} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111118" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "#9898a8", marginTop: 2 }}>{a.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Transactions */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5ef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111118" }}>Recent Transactions</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("HISTORY")}>View All</button>
                  </div>
                  <table className="table">
                    <thead><tr>
                      <th>Description</th><th>Reference</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th>
                    </tr></thead>
                    <tbody>
                      {transactions.slice(0, 6).length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: "center", color: "#9898a8", padding: 32 }}>No transactions yet. Send money to get started!</td></tr>
                      ) : transactions.slice(0, 6).map(t => {
                        const out = t.senderName === user.name || t.senderName === user.username;
                        return (
                          <tr key={t._id} style={{ cursor: "pointer" }} onClick={() => openModal("receipt", t)}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: out ? "#fee2e2" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Icon d={out ? icons.arrow_up : icons.arrow_dn} size={14} stroke={out ? "#ef4444" : "#10b981"} sw="2.5" />
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111118" }}>{t.description || t.type}</div>
                                  <div style={{ fontSize: 11, color: "#9898a8" }}>{out ? `To ${t.receiverName}` : `From ${t.senderName}`}</div>
                                </div>
                              </div>
                            </td>
                            <td><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#6b6b7b" }}>{t.referenceId?.slice(-10)}</span></td>
                            <td style={{ fontSize: 12, color: "#9898a8" }}>{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                            <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: out ? "#ef4444" : "#10b981" }}>
                              {out ? "-" : "+"}{fmt(t.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ╔═ PAYMENTS ═══════════════════════════════════════════════════ */}
            {tab === "PAYMENTS" && (
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Action cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Send Money", desc: "Transfer to any UPI ID or ShivamPay username", icon: "send", color: "#6366f1", bg: "#eef2ff", action: () => openModal("send") },
                    { label: "Scan & Pay", desc: "Scan a peer's QR code for instant payment", icon: "qr", color: "#10b981", bg: "#d1fae5", action: () => openModal("scan") },
                    { label: "Pay Bills", desc: "Electricity, Mobile Recharge, DTH, Water", icon: "receipt", color: "#f59e0b", bg: "#fef3c7", action: () => openModal("bill") },
                  ].map(a => (
                    <div key={a.label} onClick={a.action} className="card" style={{ cursor: "pointer", padding: 20 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Icon d={icons[a.icon]} size={22} stroke={a.color} />
                      </div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>{a.label}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "#6b6b7b" }}>{a.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Peer directory */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5ef", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Peer Directory</h3>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Icon d={icons.search} size={14} stroke="#9898a8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        className="input"
                        style={{ paddingLeft: 32, width: 220, fontSize: 13 }}
                        placeholder="Search users..."
                        value={searchQ}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="table">
                    <thead><tr><th>User</th><th>UPI ID</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: "center", color: "#9898a8", padding: 32 }}>
                          {users.length === 0 ? "No other users registered yet." : "No users match your search."}
                        </td></tr>
                      ) : filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#6366f1" }}>
                                {u.name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#111118" }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: "#9898a8" }}>@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#6366f1" }}>{u.upiId || `${u.username}@shivampay`}</span></td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button className="btn btn-sm btn-outline" onClick={() => { setSend({ ...sendForm, receiverIdentifier: u.upiId || `${u.username}@shivampay` }); openModal("send"); }}>
                                Pay
                              </button>
                              <button className="btn btn-sm btn-outline" style={{ color: "#6366f1", borderColor: "#c7d2fe" }}
                                onClick={() => { setLoan({ ...loanForm, partnerUsername: u.username }); openModal("loan"); }}>
                                Loan
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ╔═ LOANS ══════════════════════════════════════════════════════ */}
            {tab === "LOANS" && (
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b6b7b" }}>
                      Lend or borrow with auto EMI deductions — zero fees to settle early
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={handleEmiCron} style={{ color: "#f59e0b", borderColor: "#fde68a" }}>
                      <Icon d={icons.zap} size={14} stroke="#f59e0b" />
                      Simulate EMI Run
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => openModal("loan")}>
                      <Icon d={icons.plus} size={14} />
                      New Loan
                    </button>
                  </div>
                </div>

                {loans.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <Icon d={icons.loan} size={40} stroke="#c8c8d4" />
                    <h3 style={{ marginTop: 12, color: "#9898a8", fontWeight: 600 }}>No loan agreements yet</h3>
                    <p style={{ color: "#c8c8d4", fontSize: 14 }}>Create a P2P loan with a friend or peer.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => openModal("loan")}>Create Loan Proposal</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {loans.map(loan => {
                      const isLender = loan.lenderName === user.name || loan.lenderName === user.username;
                      const pct = Math.min(100, Math.round(((loan.totalPayableAmount - loan.remainingAmount) / loan.totalPayableAmount) * 100));
                      const statusColors = {
                        PENDING: { color: "#92400e", bg: "#fef3c7", label: "Pending" },
                        ACTIVE:  { color: "#065f46", bg: "#d1fae5", label: "Active" },
                        OVERDUE: { color: "#991b1b", bg: "#fee2e2", label: "⚠ Overdue" },
                        COMPLETED:  { color: "#6b6b7b", bg: "#f3f3f8", label: "Completed" },
                        FORECLOSED: { color: "#6b6b7b", bg: "#f3f3f8", label: "Foreclosed" },
                      };
                      const sc = statusColors[loan.status] || statusColors.COMPLETED;

                      return (
                        <div key={loan._id} className="card" style={{ padding: 20 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span className="badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                                <span style={{ fontSize: 12, color: "#9898a8" }}>
                                  {isLender ? `Lending to @${loan.borrowerName}` : `Borrowed from @${loan.lenderName}`}
                                </span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111118" }}>{loan.remarks || "Loan Agreement"}</h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 11, color: "#9898a8", marginBottom: 2 }}>Total Payable</div>
                              <div style={{ fontSize: 22, fontWeight: 800, color: "#111118", fontFamily: "JetBrains Mono, monospace" }}>{fmt(loan.totalPayableAmount)}</div>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16, background: "#f9f9fc", borderRadius: 12, padding: "12px 16px" }}>
                            {[
                              ["Principal", fmt(loan.principalAmount)],
                              ["Interest", `${loan.interestRate}% · ${fmt(loan.emiAmount)}/mo`],
                              ["Remaining", fmt(loan.remainingAmount)],
                              ["EMI Day", `${loan.deductionDayOfMonth}th of month`],
                            ].map(([l, v]) => (
                              <div key={l}>
                                <div style={{ fontSize: 11, color: "#9898a8", fontWeight: 600, marginBottom: 2 }}>{l}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#111118" }}>{v}</div>
                              </div>
                            ))}
                          </div>

                          {/* Progress */}
                          {["ACTIVE","OVERDUE","COMPLETED","FORECLOSED"].includes(loan.status) && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9898a8", marginBottom: 6 }}>
                                <span>Repayment Progress</span>
                                <span style={{ fontWeight: 700, color: "#10b981" }}>{pct}% settled</span>
                              </div>
                              <div style={{ height: 6, background: "#e5e5ef", borderRadius: 6, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #10b981)", borderRadius: 6, transition: "width 0.6s ease" }} />
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                            {loan.status === "PENDING" && (
                              <button className="btn btn-green btn-sm" onClick={() => openModal("accept", loan)}>
                                <Icon d={icons.check} size={14} /> Accept & Disburse {fmt(loan.principalAmount)}
                              </button>
                            )}
                            {["ACTIVE","OVERDUE"].includes(loan.status) && !isLender && (
                              <button className="btn btn-sm" style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }}
                                onClick={() => openModal("foreclose", loan)}>
                                Pay Full Amount — ₹0 Closure Fee
                              </button>
                            )}
                            {["ACTIVE","OVERDUE"].includes(loan.status) && isLender && (
                              <span style={{ fontSize: 12, color: "#9898a8", alignSelf: "center" }}>EMI auto-deducts on day {loan.deductionDayOfMonth}</span>
                            )}
                            {["COMPLETED","FORECLOSED"].includes(loan.status) && (
                              <span className="badge badge-green"><Icon d={icons.check} size={12} /> Settled & Closed</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ╔═ HISTORY ════════════════════════════════════════════════════ */}
            {tab === "HISTORY" && (
              <div style={{ maxWidth: 900, margin: "0 auto" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5ef", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Transaction Ledger</h3>
                    <span className="badge badge-gray">{transactions.length} records</span>
                  </div>
                  <table className="table">
                    <thead><tr>
                      <th>Description</th><th>Type</th><th>Reference</th><th>Date & Time</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", color: "#9898a8", padding: 40 }}>No transactions recorded yet.</td></tr>
                      ) : transactions.map(t => {
                        const out = t.senderName === user.name || t.senderName === user.username;
                        return (
                          <tr key={t._id} onClick={() => openModal("receipt", t)} style={{ cursor: "pointer" }}>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#111118" }}>{t.description || t.type}</div>
                              <div style={{ fontSize: 11, color: "#9898a8" }}>{out ? `→ ${t.receiverName}` : `← ${t.senderName}`}</div>
                            </td>
                            <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{t.type}</span></td>
                            <td><span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#9898a8" }}>{t.referenceId}</span></td>
                            <td style={{ fontSize: 12, color: "#9898a8" }}>{new Date(t.createdAt).toLocaleString("en-IN")}</td>
                            <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: out ? "#ef4444" : "#10b981" }}>
                              {out ? "-" : "+"}{fmt(t.amount)}
                            </td>
                            <td><span className={`badge badge-${t.status === "SUCCESS" ? "green" : "red"}`}>{t.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ╔═ NOTIFICATIONS ══════════════════════════════════════════════ */}
            {tab === "NOTIFS" && (
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b6b7b" }}>Email alerts & activity log</p>
                  {unreadNotifs > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={async () => { await axios.put(`${API}/notifications/mark-read`, {}, auth); loadAll(); }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#9898a8" }}>
                      <Icon d={icons.bell} size={36} stroke="#c8c8d4" />
                      <p style={{ marginTop: 12 }}>You're all caught up!</p>
                    </div>
                  ) : notifications.map((n, i) => (
                    <div key={n._id} style={{ padding: "16px 20px", borderBottom: i < notifications.length - 1 ? "1px solid #f3f3f8" : "none", display: "flex", gap: 14, alignItems: "flex-start", background: !n.isRead ? "#fafbff" : "transparent" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: n.type === "EMAIL_ALERT" ? "#fee2e2" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={n.type === "EMAIL_ALERT" ? icons.alert : icons.bell} size={16} stroke={n.type === "EMAIL_ALERT" ? "#ef4444" : "#6366f1"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111118" }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: "#9898a8", whiteSpace: "nowrap" }}>{new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <div style={{ fontSize: 13, color: "#6b6b7b", lineHeight: 1.5 }}>{n.message}</div>
                        {n.previewUrl && (
                          <a href={n.previewUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, fontWeight: 600, color: "#6366f1", textDecoration: "none" }}>
                            Open Email Preview →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ╔═ SETTINGS ══════════════════════════════════════════════════ */}
            {tab === "SETTINGS" && (
              <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* My QR Code */}
                <div className="card">
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>My QR Code & UPI ID</h3>
                  <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ background: "#fff", padding: 12, border: "1px solid #e5e5ef", borderRadius: 12, display: "inline-block" }}>
                      <QRCodeSVG
                        value={`upi://pay?pa=${user.upiId || `${user.username}@shivampay`}&pn=${encodeURIComponent(user.name || "")}&cu=INR`}
                        size={140} bgColor="#fff" fgColor="#111118" level="H"
                      />
                    </div>
                    <div>
                      <div className="label">Your UPI ID</div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: "#6366f1", marginBottom: 10 }}>
                        {user.upiId || `${user.username}@shivampay`}
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={copyUpi}>
                        <Icon d={icons.copy} size={13} /> {copiedUpi ? "Copied!" : "Copy UPI ID"}
                      </button>
                      <p style={{ fontSize: 12, color: "#9898a8", marginTop: 10 }}>Share this QR or UPI ID to receive money from any UPI app.</p>
                    </div>
                  </div>
                </div>

                {/* Razorpay Status */}
                <div className="card">
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Real Payment Gateway</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b6b7b" }}>Razorpay integration for real money top-ups</p>
                  {razorpayConfig.isConfigured ? (
                    <div className="alert alert-success"><Icon d={icons.check} size={16} /> Razorpay is active. Real payments enabled.</div>
                  ) : (
                    <div>
                      <div className="alert alert-warn" style={{ marginBottom: 16 }}>
                        <Icon d={icons.alert} size={16} />
                        <div>
                          <strong>Razorpay not configured.</strong> Add your API keys to enable real payments.
                          <ol style={{ margin: "8px 0 0 16px", padding: 0, fontSize: 12, lineHeight: 2 }}>
                            <li>Create a free account at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" style={{ color: "#92400e", fontWeight: 600 }}>dashboard.razorpay.com</a></li>
                            <li>Go to Settings → API Keys → Generate Test Key</li>
                            <li>Add keys to <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4 }}>backend/.env</code></li>
                            <li>Restart your backend server</li>
                          </ol>
                        </div>
                      </div>
                      <div style={{ background: "#f9f9fc", borderRadius: 10, padding: 14, border: "1px solid #e5e5ef" }}>
                        <div style={{ fontSize: 12, color: "#9898a8", marginBottom: 6, fontWeight: 600 }}>backend/.env</div>
                        <pre style={{ margin: 0, fontSize: 12, color: "#6366f1", fontFamily: "JetBrains Mono, monospace", lineHeight: 1.8 }}>
{`RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account info */}
                <div className="card">
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Account Information</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      ["Full Name", user.name],
                      ["Username", `@${user.username}`],
                      ["Email", user.email || "Not set"],
                      ["Linked Bank", user.linkedBank || "HDFC Bank - **** 8824"],
                      ["Default UPI PIN", "****  (Change via API)"],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div className="label">{l}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111118" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Status bar inside modal (reusable) */}
      {modal && (() => {
        const StatusBar = () => txnState.status !== "idle" && (
          <div className={`alert alert-${txnState.status === "error" ? "error" : txnState.status === "success" ? "success" : "info"}`}
            style={{ marginTop: 16 }}>
            {txnState.status === "loading" && <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
            {txnState.msg}
          </div>
        );

        // SEND MONEY
        if (modal === "send") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Send Money</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label className="label">Recipient UPI ID or Username</label>
                  <input className="input" required placeholder="e.g. alex@shivampay or alex"
                    value={sendForm.receiverIdentifier} onChange={e => setSend({ ...sendForm, receiverIdentifier: e.target.value })} /></div>
                <div><label className="label">Amount (₹)</label>
                  <input className="input" type="number" step="0.01" required placeholder="0.00"
                    style={{ fontSize: 20, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}
                    value={sendForm.amount} onChange={e => setSend({ ...sendForm, amount: e.target.value })} /></div>
                <div><label className="label">Remarks</label>
                  <input className="input" placeholder="Dinner, rent, gift..." value={sendForm.description} onChange={e => setSend({ ...sendForm, description: e.target.value })} /></div>
                <div><label className="label">UPI PIN <span style={{ color: "#9898a8", fontWeight: 400, textTransform: "none" }}>(Default: 1234)</span></label>
                  <input className="input" type="password" maxLength={4} required placeholder="••••"
                    style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                    value={sendForm.pin} onChange={e => setSend({ ...sendForm, pin: e.target.value })} /></div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.status === "loading"} style={{ marginTop: 4 }}>
                  {txnState.status === "loading" ? "Sending..." : "Send Money"}
                </button>
              </form>
            </div>
          </div>
        );

        // QR CODE
        if (modal === "qr") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, margin: "0 auto 12px" }}>
                {user.name?.charAt(0) || "U"}
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>{user.name}</h3>
              <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#6366f1", fontSize: 13, marginBottom: 20 }}>{user.upiId || `${user.username}@shivampay`}</div>
              <div style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #e5e5ef", display: "inline-block", marginBottom: 16 }}>
                <QRCodeSVG value={`upi://pay?pa=${user.upiId || `${user.username}@shivampay`}&pn=${encodeURIComponent(user.name || "")}&cu=INR`}
                  size={200} bgColor="#fff" fgColor="#111118" level="H" />
              </div>
              <p style={{ fontSize: 12, color: "#9898a8" }}>Scan with any UPI app (GPay, PhonePe, Paytm) to pay</p>
            </div>
          </div>
        );

        // SCAN & PAY
        if (modal === "scan") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Scan & Pay</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <div style={{ height: 160, background: "#0a0a0f", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "2px dashed #2a2a38", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 120, height: 120, border: "2px solid #6366f1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ height: 2, width: "100%", background: "#6366f1", animation: "scan 1.5s ease-in-out infinite" }} />
                </div>
                <div style={{ position: "absolute", bottom: 10, fontSize: 11, color: "#4a4a5a" }}>Camera viewfinder — select a peer below to simulate</div>
              </div>
              <div style={{ fontSize: 12, color: "#9898a8", marginBottom: 10, fontWeight: 600 }}>Or tap a user to load their QR:</div>
              <div style={{ maxHeight: 200, overflowY: "auto" }} className="scrollbar-hide">
                {users.map(u => (
                  <div key={u._id} onClick={() => { setSend({ ...sendForm, receiverIdentifier: u.upiId || `${u.username}@shivampay`, amount: "" }); closeModal(); setTimeout(() => openModal("send"), 50); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f3f3f8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <Icon d={icons.qr} size={16} stroke="#6366f1" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name} <span style={{ color: "#9898a8", fontWeight: 400 }}>({u.upiId || `${u.username}@shivampay`})</span></span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>Select →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

        // PAY BILL
        if (modal === "bill") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Pay Utility Bill</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <form onSubmit={handleBill} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label className="label">Category</label>
                  <select className="input" value={billForm.category} onChange={e => setBill({ ...billForm, category: e.target.value })}>
                    <option>Electricity</option><option>Mobile Recharge</option><option>DTH</option><option>Water</option>
                  </select></div>
                <div><label className="label">Biller Name</label>
                  <input className="input" required value={billForm.billerName} onChange={e => setBill({ ...billForm, billerName: e.target.value })} /></div>
                <div><label className="label">Amount (₹)</label>
                  <input className="input" type="number" step="0.01" required placeholder="0.00"
                    style={{ fontSize: 20, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}
                    value={billForm.amount} onChange={e => setBill({ ...billForm, amount: e.target.value })} /></div>
                <div><label className="label">UPI PIN</label>
                  <input className="input" type="password" maxLength={4} required placeholder="••••"
                    style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                    value={billForm.pin} onChange={e => setBill({ ...billForm, pin: e.target.value })} /></div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.status === "loading"}>
                  {txnState.status === "loading" ? "Paying..." : "Pay Bill"}
                </button>
              </form>
            </div>
          </div>
        );

        // LOAN
        if (modal === "loan") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal modal-lg" style={{ maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>New Loan Agreement</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <form onSubmit={handleLoan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#f3f3f8", borderRadius: 10, padding: 4 }}>
                  {["LENDER","BORROWER"].map(role => (
                    <button key={role} type="button" onClick={() => setLoan({ ...loanForm, role })}
                      style={{ padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: loanForm.role === role ? "#fff" : "transparent", color: loanForm.role === role ? "#6366f1" : "#6b6b7b", boxShadow: loanForm.role === role ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                      {role === "LENDER" ? "🤝 I'm Lending" : "🙏 I'm Borrowing"}
                    </button>
                  ))}
                </div>
                <div><label className="label">Partner's Username</label>
                  <input className="input" required placeholder="username (not UPI ID)" value={loanForm.partnerUsername} onChange={e => setLoan({ ...loanForm, partnerUsername: e.target.value })} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Principal (₹)</label>
                    <input className="input" type="number" required value={loanForm.principalAmount} onChange={e => setLoan({ ...loanForm, principalAmount: e.target.value })} /></div>
                  <div><label className="label">Interest Rate (%)</label>
                    <input className="input" type="number" step="0.1" required value={loanForm.interestRate} onChange={e => setLoan({ ...loanForm, interestRate: e.target.value })} /></div>
                  <div><label className="label">Duration (Months)</label>
                    <input className="input" type="number" min="1" max="60" required value={loanForm.durationMonths} onChange={e => setLoan({ ...loanForm, durationMonths: e.target.value })} /></div>
                  <div><label className="label">EMI Deduction Day</label>
                    <select className="input" value={loanForm.deductionDayOfMonth} onChange={e => setLoan({ ...loanForm, deductionDayOfMonth: e.target.value })}>
                      {[1,5,10,15,20,25,28].map(d => <option key={d} value={d}>{d}th of month</option>)}
                    </select></div>
                </div>
                {/* EMI preview */}
                {loanForm.principalAmount && (
                  <div style={{ background: "#eef2ff", borderRadius: 10, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[["Interest", fmt(loanCalc.interest)], ["Total Payable", fmt(loanCalc.total)], ["Monthly EMI", fmt(loanCalc.emi)]].map(([l, v]) => (
                      <div key={l}><div style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 800, color: "#3730a3" }}>{v}</div></div>
                    ))}
                  </div>
                )}
                <div><label className="label">Agreement Title</label>
                  <input className="input" placeholder="e.g. Laptop purchase, Business startup..." value={loanForm.remarks} onChange={e => setLoan({ ...loanForm, remarks: e.target.value })} /></div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.status === "loading"}>
                  {txnState.status === "loading" ? "Submitting..." : "Submit Proposal"}
                </button>
              </form>
            </div>
          </div>
        );

        // TOP UP (Razorpay)
        if (modal === "topup") return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Add Money to Wallet</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              {!razorpayConfig.isConfigured ? (
                <div>
                  <div className="alert alert-warn" style={{ marginBottom: 16 }}>
                    <Icon d={icons.alert} size={16} />
                    <div><strong>Razorpay not configured yet.</strong><br />Add your API keys to <code style={{ background: "#fef3c7", padding: "1px 4px", borderRadius: 3 }}>backend/.env</code> to enable real payments.</div>
                  </div>
                  <ol style={{ fontSize: 13, color: "#6b6b7b", lineHeight: 2, paddingLeft: 20, margin: 0 }}>
                    <li>Sign up free at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" style={{ color: "#6366f1", fontWeight: 600 }}>dashboard.razorpay.com</a></li>
                    <li>Get your Test Key ID & Secret</li>
                    <li>Add them to <code>backend/.env</code></li>
                    <li>Restart your backend with <code>npm start</code></li>
                  </ol>
                  <button className="btn btn-outline" style={{ width: "100%", marginTop: 16 }} onClick={closeModal}>Got it</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="alert alert-info">
                    <Icon d={icons.check} size={16} />
                    <span>Payments are processed securely by Razorpay. We never see your card or bank details.</span>
                  </div>
                  <div>
                    <label className="label">Amount to Add (₹)</label>
                    <input className="input" type="number" min="1" max="500000" placeholder="e.g. 1000"
                      style={{ fontSize: 24, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}
                      value={topupAmount} onChange={e => setTopup(e.target.value)} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[500, 1000, 2000, 5000].map(a => (
                        <button key={a} className="btn btn-outline btn-sm" onClick={() => setTopup(String(a))}>₹{a.toLocaleString()}</button>
                      ))}
                    </div>
                  </div>
                  <StatusBar />
                  <button className="btn btn-primary btn-lg" onClick={handleTopup} disabled={txnState.status === "loading" || !topupAmount}>
                    {txnState.status === "loading" ? "Please wait..." : `Pay ${topupAmount ? fmt(topupAmount) : "₹0"} via Razorpay`}
                  </button>
                </div>
              )}
            </div>
          </div>
        );

        // ACCEPT LOAN
        if (modal === "accept" && modalData) return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Accept Loan & Receive Funds</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                {fmt(modalData.principalAmount)} will be instantly credited to your wallet. Monthly EMI of {fmt(modalData.emiAmount)} will auto-deduct on day {modalData.deductionDayOfMonth}.
              </div>
              <div><label className="label">UPI PIN to Authorize</label>
                <input className="input" type="password" maxLength={4} placeholder="••••"
                  style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                  value={pinInput} onChange={e => setPin(e.target.value)} /></div>
              <StatusBar />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button className="btn btn-green" style={{ flex: 2 }} onClick={handleAccept} disabled={txnState.status === "loading"}>
                  {txnState.status === "loading" ? "Processing..." : `Accept & Receive ${fmt(modalData.principalAmount)}`}
                </button>
              </div>
            </div>
          </div>
        );

        // FORECLOSE
        if (modal === "foreclose" && modalData) return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Settle Loan Early</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <div style={{ background: "#f9f9fc", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                {[["Remaining Balance", fmt(modalData.remainingAmount)], ["Early Closure Fee", "₹0.00"], ["You Pay", fmt(modalData.remainingAmount)]].map(([l, v], i) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid #e5e5ef" : "none", fontWeight: i === 2 ? 800 : 500, color: i === 2 ? "#111118" : "#6b6b7b", fontSize: i === 2 ? 15 : 13 }}>
                    <span>{l}</span><span style={{ fontFamily: "JetBrains Mono, monospace", color: i === 1 ? "#10b981" : "inherit" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">UPI PIN to Confirm</label>
                <input className="input" type="password" maxLength={4} placeholder="••••"
                  style={{ textAlign: "center", fontSize: 20, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                  value={pinInput} onChange={e => setPin(e.target.value)} />
              </div>
              <StatusBar />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleForeclose} disabled={txnState.status === "loading"}>
                  {txnState.status === "loading" ? "Settling..." : "Confirm & Settle — ₹0 Fee"}
                </button>
              </div>
            </div>
          </div>
        );

        // RECEIPT / INVOICE
        if (modal === "receipt" && modalData) return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Transaction Receipt</h3>
                <button className="btn btn-ghost btn-sm" onClick={closeModal}><Icon d={icons.x} size={16} /></button>
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <Icon d={icons.check} size={24} stroke="#10b981" sw="2.5" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "JetBrains Mono, monospace", color: "#111118" }}>{fmt(modalData.amount)}</div>
                <span className={`badge badge-${modalData.status === "SUCCESS" ? "green" : "red"}`} style={{ marginTop: 6 }}>{modalData.status}</span>
              </div>
              <div style={{ background: "#f9f9fc", borderRadius: 12, padding: "14px 16px" }}>
                {[
                  ["Reference", modalData.referenceId],
                  ["Type", modalData.type],
                  ["From", `${modalData.senderName} (${modalData.senderUpiId})`],
                  ["To", `${modalData.receiverName} (${modalData.receiverUpiId})`],
                  ["Date & Time", new Date(modalData.createdAt).toLocaleString("en-IN")],
                  ["Description", modalData.description || "—"],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #e5e5ef", fontSize: 13, gap: 12 }}>
                    <span style={{ color: "#9898a8", fontWeight: 600, flexShrink: 0 }}>{l}</span>
                    <span style={{ color: "#111118", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: "100%", marginTop: 14 }} onClick={() => window.print()}>
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
        );

        return null;
      })()}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scan { 0%, 100% { transform: translateY(-40px); } 50% { transform: translateY(40px); } }
      `}</style>
    </>
  );
}
