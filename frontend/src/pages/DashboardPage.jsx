import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { API } from "../config/api";
import ScreenLockModal from "../components/ScreenLockModal";

const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", sw = "1.8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ic = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  send: "M22 2L11 13 M22 2L15 22 8 13 2 9z",
  loan: ["M12 2v20","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  history: ["M3 3h18v4H3z","M3 10h18v4H3z","M3 17h18v4H3z"],
  bell: ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  lock: ["M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"],
  plus: "M12 5v14M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  up: "M12 19V5M5 12l7-7 7 7",
  down: "M12 5v14M5 12l7 7 7-7",
  search: ["M21 21l-4.35-4.35","M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0"],
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [tab, setTab] = useState("HOME");
  const [user, setUser] = useState({ bankbalance: 0, name: "", username: "", email: "" });
  const [users, setUsers] = useState([]);
  const [transactions, setTxns] = useState([]);
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifs] = useState([]);
  const [rzpCfg, setRzpCfg] = useState({ isConfigured: false, keyId: null });
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [sendForm, setSend] = useState({ receiverIdentifier: "", amount: "", pin: "", description: "" });
  const [loanForm, setLoan] = useState({ partnerUsername: "", role: "LENDER", principalAmount: "", interestRate: "5", durationMonths: "6", deductionDayOfMonth: "5", remarks: "" });
  const [topupAmt, setTopup] = useState("");
  const [pinInput, setPin] = useState("");
  const [txnState, setTxn] = useState({ s: "idle", m: "" });
  const [searchQ, setSearch] = useState("");

  const fire = () => confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ["#3b5bdb","#2f9e44","#e67700"] });

  const loadAll = useCallback(async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const [b, u, t, l, n, r] = await Promise.allSettled([
        axios.get(`${API}/balance`, auth),
        axios.get(`${API}/all/allusers`, auth),
        axios.get(`${API}/trasiction/history`, auth),
        axios.get(`${API}/loans/my-loans`, auth),
        axios.get(`${API}/notifications/my-notifications`, auth),
        axios.get(`${API}/razorpay/config`, auth),
      ]);
      if (b.status === "fulfilled") {
        setUser(b.value.data);
        localStorage.setItem("user", JSON.stringify(b.value.data));
      } else if (b.status === "rejected" && b.reason?.response?.status === 401) {
        // Only if actual token expiry happens, boot to login
        localStorage.clear();
        navigate("/login");
        return;
      }
      if (u.status === "fulfilled") setUsers((u.value.data || []).filter(x => x.username !== b.value?.data?.username));
      if (t.status === "fulfilled") setTxns(t.value.data.transactions || []);
      if (l.status === "fulfilled") setLoans(l.value.data.loans || []);
      if (n.status === "fulfilled") setNotifs(n.value.data.notifications || []);
      if (r.status === "fulfilled") setRzpCfg(r.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, navigate]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const close = () => { setModal(null); setModalData(null); setTxn({ s: "idle", m: "" }); setPin(""); };
  const open = (name, data) => { setModal(name); setModalData(data || null); setTxn({ s: "idle", m: "" }); setPin(""); };
  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Handlers ──
  const handleSend = async (e) => {
    e.preventDefault();
    setTxn({ s: "loading", m: "Processing transfer..." });
    try {
      await axios.post(`${API}/trasiction/payment`, sendForm, auth);
      setTxn({ s: "ok", m: `${fmt(sendForm.amount)} sent successfully!` });
      fire(); loadAll();
      setTimeout(() => { close(); setSend({ receiverIdentifier: "", amount: "", pin: "", description: "" }); }, 1500);
    } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Transfer failed." }); }
  };

  const handleLoan = async (e) => {
    e.preventDefault();
    setTxn({ s: "loading", m: "Submitting proposal..." });
    try {
      await axios.post(`${API}/loans/propose`, loanForm, auth);
      setTxn({ s: "ok", m: "Loan proposal sent!" });
      loadAll(); setTimeout(close, 1200);
    } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Failed." }); }
  };

  const handleAccept = async () => {
    setTxn({ s: "loading", m: "Disbursing funds..." });
    try {
      await axios.post(`${API}/loans/accept/${modalData._id}`, { pin: pinInput }, auth);
      setTxn({ s: "ok", m: "Loan active! Funds transferred to your wallet." });
      fire(); loadAll(); setTimeout(close, 1500);
    } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Failed." }); }
  };

  const handleForeclose = async () => {
    setTxn({ s: "loading", m: "Settling loan..." });
    try {
      await axios.post(`${API}/loans/foreclose/${modalData._id}`, { pin: pinInput }, auth);
      setTxn({ s: "ok", m: "Loan settled — ₹0 closure fee!" });
      fire(); loadAll(); setTimeout(close, 1500);
    } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Failed." }); }
  };

  const handleTopup = async () => {
    const amount = Number(topupAmt);
    if (!amount || amount < 1) { setTxn({ s: "err", m: "Please enter a valid amount (minimum ₹1)." }); return; }
    if (!rzpCfg.isConfigured) { setTxn({ s: "err", m: "Payment gateway keys are currently being verified in .env. Try again soon." }); return; }
    setTxn({ s: "loading", m: "Preparing secure Razorpay checkout..." });
    try {
      const r = await axios.post(`${API}/razorpay/create-order`, { amount }, auth);
      const { orderId, amount: amt, currency } = r.data;
      const options = {
        key: rzpCfg.keyId, amount: amt, currency, name: "ShivamPay", description: "Add Real Money to Wallet",
        order_id: orderId,
        handler: async (res) => {
          setTxn({ s: "loading", m: "Verifying payment signature..." });
          try {
            const v = await axios.post(`${API}/razorpay/verify`, { razorpay_order_id: res.razorpay_order_id, razorpay_payment_id: res.razorpay_payment_id, razorpay_signature: res.razorpay_signature, amount: amt }, auth);
            setTxn({ s: "ok", m: v.data.message });
            fire(); loadAll(); setTimeout(close, 1800);
          } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Verification failed." }); }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#3b5bdb" },
        modal: { ondismiss: () => setTxn({ s: "idle", m: "" }) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setTxn({ s: "idle", m: "" });
    } catch (err) { setTxn({ s: "err", m: err.response?.data?.message || "Could not start checkout." }); }
  };

  const unreadN = notifications.filter(n => !n.isRead).length;
  const activeLoans = loans.filter(l => ["ACTIVE","OVERDUE","PENDING"].includes(l.status));
  const fUsers = users.filter(u => !searchQ || u.name?.toLowerCase().includes(searchQ.toLowerCase()) || u.username?.toLowerCase().includes(searchQ.toLowerCase()));

  const loanCalc = {
    total: Number(loanForm.principalAmount) * (1 + Number(loanForm.interestRate) / 100),
    emi: (Number(loanForm.principalAmount) * (1 + Number(loanForm.interestRate) / 100)) / Math.max(1, Number(loanForm.durationMonths)),
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>SP</div>
      <p style={{ color: "#667085", fontSize: 14 }}>Loading your secure wallet...</p>
    </div>
  );

  const StatusBar = () => txnState.s !== "idle" ? (
    <div className={`alert alert-${txnState.s === "err" ? "error" : txnState.s === "ok" ? "success" : "info"}`} style={{ marginTop: 12 }}>
      {txnState.m}
    </div>
  ) : null;

  const navItems = [
    { id: "HOME", label: "Home", icon: "home" },
    { id: "SEND", label: "Send Money", icon: "send" },
    { id: "LOANS", label: "Loans & EMI", icon: "loan", badge: activeLoans.length || null },
    { id: "HISTORY", label: "History", icon: "history" },
    { id: "NOTIFS", label: "Notifications", icon: "bell", badge: unreadN || null },
  ];

  return (
    <>
      <ScreenLockModal
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        onSignOut={() => { localStorage.clear(); navigate("/login"); }}
      />

      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #eaecf0" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#3b5bdb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>SP</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>ShivamPay</span>
          </div>

          <div style={{ margin: "12px 10px 8px", background: "#f8f9fb", borderRadius: 10, padding: "10px 12px", border: "1px solid #eaecf0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", display: "flex", alignItems: "center", gap: 6 }}>
              {user.name || user.username}
              {user.authProvider === "google" && <span title="Verified by Google" style={{ fontSize: 11, background: "#e8f0fe", color: "#1a73e8", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>Google SSO</span>}
            </div>
            <div style={{ fontSize: 11, color: "#98a2b3" }}>@{user.username}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#3b5bdb", marginTop: 6 }}>{fmt(user.bankbalance)}</div>
          </div>

          <nav style={{ flex: 1, padding: "6px 0" }}>
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <Icon d={ic[n.icon]} size={16} />
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge ? <span style={{ background: tab === n.id ? "#3b5bdb" : "#eaecf0", color: tab === n.id ? "#fff" : "#667085", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{n.badge}</span> : null}
              </div>
            ))}
          </nav>

          <div style={{ padding: "10px", borderTop: "1px solid #eaecf0", display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Fintech Screen Lock - Prevents repeated logins! */}
            <div className="nav-item" onClick={() => setIsLocked(true)} style={{ color: "#3b5bdb" }}>
              <Icon d={ic.lock} size={16} /><span>Lock Wallet 🔒</span>
            </div>
            <div className="nav-item" onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ color: "#e03131" }}>
              <Icon d={ic.logout} size={16} /><span>Sign Out</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main-area">
          <header className="top-bar">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e", flex: 1 }}>
              {navItems.find(n => n.id === tab)?.label || "Home"}
            </h2>
            <button className="btn btn-ghost btn-sm" title="Lock Wallet" onClick={() => setIsLocked(true)}>
              <Icon d={ic.lock} size={15} />
            </button>
            <button className="btn btn-ghost btn-sm" title="Refresh Data" onClick={loadAll}>
              <Icon d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" style={{ position: "relative" }} onClick={() => setTab("NOTIFS")}>
              <Icon d={ic.bell} size={15} />
              {unreadN > 0 && <span style={{ position: "absolute", top: 4, right: 5, width: 7, height: 7, background: "#e03131", borderRadius: "50%", border: "2px solid #fff" }} />}
            </button>
          </header>

          <main className="page-content">

            {/* ── HOME ────────────────────────────────── */}
            {tab === "HOME" && (
              <div style={{ maxWidth: 850, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div className="stat-card" style={{ background: "#3b5bdb", border: "none" }}>
                    <div className="stat-label" style={{ color: "rgba(255,255,255,0.7)" }}>Available Balance</div>
                    <div className="stat-value" style={{ color: "#fff", fontSize: 30 }}>{fmt(user.bankbalance)}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>@{user.username}</div>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6 }}
                    onClick={() => { setTopup(""); open("topup"); }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={ic.plus} size={18} stroke="#3b5bdb" sw="2.5" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#3b5bdb" }}>Add Money</div>
                    <div style={{ fontSize: 11, color: "#98a2b3" }}>via Razorpay</div>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div className="card" style={{ cursor: "pointer", padding: 16, display: "flex", alignItems: "center", gap: 14 }}
                    onClick={() => open("send")}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#3b5bdb"} onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={ic.send} size={18} stroke="#3b5bdb" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Send Money</div>
                      <div style={{ fontSize: 11, color: "#98a2b3" }}>Transfer to any user instantly</div>
                    </div>
                  </div>
                  <div className="card" style={{ cursor: "pointer", padding: 16, display: "flex", alignItems: "center", gap: 14 }}
                    onClick={() => open("loan")}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2f9e44"} onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={ic.loan} size={18} stroke="#2f9e44" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>Create Loan</div>
                      <div style={{ fontSize: 11, color: "#98a2b3" }}>Lend or borrow from peers</div>
                    </div>
                  </div>
                </div>

                {/* Recent txns */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Recent Transactions</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("HISTORY")}>View All</button>
                  </div>
                  {transactions.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#98a2b3", fontSize: 13 }}>
                      No transactions yet. Add money to get started!
                    </div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Details</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
                      <tbody>
                        {transactions.slice(0, 5).map(t => {
                          const out = t.senderName === user.name || t.senderName === user.username;
                          return (
                            <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: 8, background: out ? "#fff5f5" : "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon d={out ? ic.up : ic.down} size={13} stroke={out ? "#e03131" : "#2f9e44"} sw="2.5" />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description || t.type}</div>
                                    <div style={{ fontSize: 11, color: "#98a2b3" }}>{out ? `To ${t.receiverName}` : `From ${t.senderName}`}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: 12, color: "#98a2b3" }}>{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                              <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: out ? "#e03131" : "#2f9e44" }}>
                                {out ? "-" : "+"}{fmt(t.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── SEND MONEY ────────────────────────────── */}
            {tab === "SEND" && (
              <div style={{ maxWidth: 850, margin: "0 auto" }}>
                <div className="card" style={{ marginBottom: 20, padding: 20 }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Transfer Money</h3>
                  <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 400 }}>
                    <div><label className="label">Recipient Username</label>
                      <input className="input" required placeholder="Enter username" value={sendForm.receiverIdentifier} onChange={e => setSend({ ...sendForm, receiverIdentifier: e.target.value })} /></div>
                    <div><label className="label">Amount (₹)</label>
                      <input className="input" type="number" step="0.01" min="1" required placeholder="0.00"
                        style={{ fontSize: 18, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}
                        value={sendForm.amount} onChange={e => setSend({ ...sendForm, amount: e.target.value })} /></div>
                    <div><label className="label">Note (optional)</label>
                      <input className="input" placeholder="What's this for?" value={sendForm.description} onChange={e => setSend({ ...sendForm, description: e.target.value })} /></div>
                    <div><label className="label">PIN</label>
                      <input className="input" type="password" maxLength={4} required placeholder="••••"
                        style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                        value={sendForm.pin} onChange={e => setSend({ ...sendForm, pin: e.target.value })} /></div>
                    <StatusBar />
                    <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ alignSelf: "flex-start" }}>
                      {txnState.s === "loading" ? "Sending..." : "Send Money"}
                    </button>
                  </form>
                </div>

                {/* User directory */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>ShivamPay Users</h3>
                    <input className="input" style={{ width: 180, fontSize: 12 }} placeholder="Search users..." value={searchQ} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <table className="table">
                    <thead><tr><th>User</th><th>Username</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
                    <tbody>
                      {fUsers.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: "center", color: "#98a2b3", padding: 30 }}>{users.length === 0 ? "No other users yet." : "No results."}</td></tr>
                      ) : fUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#3b5bdb" }}>{u.name?.charAt(0) || "U"}</div>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13, color: "#667085" }}>@{u.username}</td>
                          <td style={{ textAlign: "right" }}>
                            <button className="btn btn-sm btn-outline" onClick={() => { setSend({ ...sendForm, receiverIdentifier: u.username }); window.scrollTo(0, 0); }}>Send</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── LOANS ────────────────────────────── */}
            {tab === "LOANS" && (
              <div style={{ maxWidth: 850, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#667085" }}>Lend or borrow with automated monthly EMI deductions</p>
                  <button className="btn btn-primary btn-sm" onClick={() => open("loan")}><Icon d={ic.plus} size={14} /> New Loan</button>
                </div>

                {loans.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
                    <Icon d={ic.loan} size={36} stroke="#d0d5dd" />
                    <h3 style={{ marginTop: 10, color: "#667085", fontWeight: 600 }}>No loan agreements yet</h3>
                    <p style={{ color: "#98a2b3", fontSize: 13 }}>Create a P2P loan with another user.</p>
                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => open("loan")}>Create Loan</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {loans.map(loan => {
                      const isLender = loan.lenderName === user.name || loan.lenderName === user.username;
                      const pct = Math.min(100, Math.round(((loan.totalPayableAmount - loan.remainingAmount) / loan.totalPayableAmount) * 100));
                      const sc = { PENDING: { c: "#e67700", b: "#fff9db", l: "Pending" }, ACTIVE: { c: "#2b8a3e", b: "#ebfbee", l: "Active" }, OVERDUE: { c: "#c92a2a", b: "#fff5f5", l: "Overdue" }, COMPLETED: { c: "#495057", b: "#f1f3f5", l: "Completed" }, FORECLOSED: { c: "#495057", b: "#f1f3f5", l: "Settled" } }[loan.status] || { c: "#495057", b: "#f1f3f5", l: loan.status };

                      return (
                        <div key={loan._id} className="card" style={{ padding: 18 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span className="badge" style={{ background: sc.b, color: sc.c }}>{sc.l}</span>
                                <span style={{ fontSize: 12, color: "#98a2b3" }}>{isLender ? `Lending to @${loan.borrowerName}` : `Borrowed from @${loan.lenderName}`}</span>
                              </div>
                              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{loan.remarks || "Loan Agreement"}</h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 11, color: "#98a2b3" }}>Total Payable</div>
                              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>{fmt(loan.totalPayableAmount)}</div>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14, background: "#f8f9fb", borderRadius: 10, padding: "10px 14px" }}>
                            {[["Principal", fmt(loan.principalAmount)], ["Interest", `${loan.interestRate}%`], ["EMI/Month", fmt(loan.emiAmount)], ["Remaining", fmt(loan.remainingAmount)]].map(([l, v]) => (
                              <div key={l}><div style={{ fontSize: 11, color: "#98a2b3", fontWeight: 600, marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div></div>
                            ))}
                          </div>

                          {["ACTIVE","OVERDUE","COMPLETED","FORECLOSED"].includes(loan.status) && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#98a2b3", marginBottom: 5 }}>
                                <span>Repayment Progress</span><span style={{ fontWeight: 700, color: "#2f9e44" }}>{pct}%</span>
                              </div>
                              <div style={{ height: 5, background: "#eaecf0", borderRadius: 5, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: "#3b5bdb", borderRadius: 5, transition: "width 0.5s" }} />
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            {loan.status === "PENDING" && <button className="btn btn-green btn-sm" onClick={() => open("accept", loan)}>Accept & Receive {fmt(loan.principalAmount)}</button>}
                            {["ACTIVE","OVERDUE"].includes(loan.status) && !isLender && (
                              <button className="btn btn-sm btn-outline" style={{ color: "#3b5bdb", borderColor: "#bac8ff" }} onClick={() => open("foreclose", loan)}>Pay Full — ₹0 Fee</button>
                            )}
                            {["COMPLETED","FORECLOSED"].includes(loan.status) && <span className="badge badge-green">Settled</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── HISTORY ────────────────────────────── */}
            {tab === "HISTORY" && (
              <div style={{ maxWidth: 850, margin: "0 auto" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #eaecf0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Transaction History</h3>
                    <span className="badge badge-gray">{transactions.length} records</span>
                  </div>
                  {transactions.length === 0 ? (
                    <div style={{ padding: "50px 20px", textAlign: "center", color: "#98a2b3" }}>No transactions yet.</div>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Details</th><th>Type</th><th>Reference</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {transactions.map(t => {
                          const out = t.senderName === user.name || t.senderName === user.username;
                          return (
                            <tr key={t._id} onClick={() => open("receipt", t)} style={{ cursor: "pointer" }}>
                              <td>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.description || t.type}</div>
                                <div style={{ fontSize: 11, color: "#98a2b3" }}>{out ? `To ${t.receiverName}` : `From ${t.senderName}`}</div>
                              </td>
                              <td><span className="badge badge-gray" style={{ fontSize: 10 }}>{t.type}</span></td>
                              <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#98a2b3" }}>{t.referenceId}</td>
                              <td style={{ fontSize: 12, color: "#98a2b3" }}>{new Date(t.createdAt).toLocaleString("en-IN")}</td>
                              <td style={{ textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: out ? "#e03131" : "#2f9e44" }}>{out ? "-" : "+"}{fmt(t.amount)}</td>
                              <td><span className={`badge badge-${t.status === "SUCCESS" ? "green" : "red"}`}>{t.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ────────────────────────────── */}
            {tab === "NOTIFS" && (
              <div style={{ maxWidth: 650, margin: "0 auto" }}>
                {unreadN > 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                    <button className="btn btn-ghost btn-sm" onClick={async () => { await axios.put(`${API}/notifications/mark-read`, {}, auth); loadAll(); }}>Mark all read</button>
                  </div>
                )}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "50px 20px", textAlign: "center", color: "#98a2b3" }}>
                      <Icon d={ic.bell} size={30} stroke="#d0d5dd" />
                      <p style={{ marginTop: 10 }}>No notifications yet.</p>
                    </div>
                  ) : notifications.map((n, i) => (
                    <div key={n._id} style={{ padding: "14px 18px", borderBottom: i < notifications.length - 1 ? "1px solid #f2f4f7" : "none", display: "flex", gap: 12, background: !n.isRead ? "#fafbff" : "#fff" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={ic.bell} size={14} stroke="#3b5bdb" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: "#98a2b3", whiteSpace: "nowrap" }}>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                        </div>
                        <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.5 }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────── */}

      {/* Add Money */}
      {modal === "topup" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Add Money</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            {!rzpCfg.isConfigured ? (
              <div>
                <div className="alert alert-info" style={{ marginBottom: 14 }}>Payment service is currently being set up. Please check back soon.</div>
                <button className="btn btn-outline" style={{ width: "100%" }} onClick={close}>OK</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input className="input" type="number" min="1" placeholder="Enter amount"
                    style={{ fontSize: 22, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}
                    value={topupAmt} onChange={e => setTopup(e.target.value)} />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[500, 1000, 2000, 5000].map(a => <button key={a} className="btn btn-outline btn-sm" onClick={() => setTopup(String(a))}>₹{a.toLocaleString()}</button>)}
                  </div>
                </div>
                <StatusBar />
                <button className="btn btn-primary btn-lg" onClick={handleTopup} disabled={txnState.s === "loading" || !topupAmt} style={{ width: "100%" }}>
                  {txnState.s === "loading" ? "Please wait..." : `Pay ${topupAmt ? fmt(topupAmt) : "₹0"}`}
                </button>
                <p style={{ fontSize: 11, color: "#98a2b3", textAlign: "center", margin: 0 }}>Secured by Razorpay. We never store your card or bank details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan modal */}
      {modal === "loan" && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal" style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>New Loan</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <form onSubmit={handleLoan} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#f2f4f7", borderRadius: 8, padding: 3 }}>
                {["LENDER","BORROWER"].map(r => (
                  <button key={r} type="button" onClick={() => setLoan({ ...loanForm, role: r })}
                    style={{ padding: 7, borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: loanForm.role === r ? "#fff" : "transparent", color: loanForm.role === r ? "#3b5bdb" : "#667085", boxShadow: loanForm.role === r ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>
                    {r === "LENDER" ? "I'm Lending" : "I'm Borrowing"}
                  </button>
                ))}
              </div>
              <div><label className="label">Partner's Username</label>
                <input className="input" required placeholder="Username" value={loanForm.partnerUsername} onChange={e => setLoan({ ...loanForm, partnerUsername: e.target.value })} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label className="label">Amount (₹)</label>
                  <input className="input" type="number" required value={loanForm.principalAmount} onChange={e => setLoan({ ...loanForm, principalAmount: e.target.value })} /></div>
                <div><label className="label">Interest (%)</label>
                  <input className="input" type="number" step="0.1" required value={loanForm.interestRate} onChange={e => setLoan({ ...loanForm, interestRate: e.target.value })} /></div>
                <div><label className="label">Duration (Months)</label>
                  <input className="input" type="number" min="1" max="60" required value={loanForm.durationMonths} onChange={e => setLoan({ ...loanForm, durationMonths: e.target.value })} /></div>
                <div><label className="label">EMI Day</label>
                  <select className="input" value={loanForm.deductionDayOfMonth} onChange={e => setLoan({ ...loanForm, deductionDayOfMonth: e.target.value })}>
                    {[1,5,10,15,20,25,28].map(d => <option key={d} value={d}>{d}th of month</option>)}
                  </select></div>
              </div>
              {loanForm.principalAmount && (
                <div style={{ background: "#eff4ff", borderRadius: 8, padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Total Payable", fmt(loanCalc.total)], ["Monthly EMI", fmt(loanCalc.emi)]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 11, color: "#3b5bdb", fontWeight: 600 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 800, color: "#364fc7" }}>{v}</div></div>
                  ))}
                </div>
              )}
              <div><label className="label">Title (optional)</label>
                <input className="input" placeholder="e.g. Laptop purchase" value={loanForm.remarks} onChange={e => setLoan({ ...loanForm, remarks: e.target.value })} /></div>
              <StatusBar />
              <button className="btn btn-primary btn-lg" type="submit" disabled={txnState.s === "loading"} style={{ width: "100%" }}>
                {txnState.s === "loading" ? "Submitting..." : "Submit Proposal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accept loan */}
      {modal === "accept" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Accept Loan</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              {fmt(modalData.principalAmount)} will be credited to your account. Monthly EMI of {fmt(modalData.emiAmount)} will auto-deduct on day {modalData.deductionDayOfMonth}.
            </div>
            <div><label className="label">Enter PIN to authorize</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                value={pinInput} onChange={e => setPin(e.target.value)} /></div>
            <StatusBar />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={close}>Cancel</button>
              <button className="btn btn-green" style={{ flex: 2 }} onClick={handleAccept} disabled={txnState.s === "loading"}>
                {txnState.s === "loading" ? "Processing..." : "Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foreclose */}
      {modal === "foreclose" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Settle Loan Early</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              {[["Remaining", fmt(modalData.remainingAmount)], ["Closure Fee", "₹0.00"], ["You Pay", fmt(modalData.remainingAmount)]].map(([l, v], i) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #eaecf0" : "none", fontWeight: i === 2 ? 800 : 500, color: i === 2 ? "#1a1a2e" : "#667085", fontSize: i === 2 ? 14 : 13 }}>
                  <span>{l}</span><span style={{ fontFamily: "JetBrains Mono, monospace", color: i === 1 ? "#2f9e44" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
            <div><label className="label">PIN</label>
              <input className="input" type="password" maxLength={4} placeholder="••••" style={{ maxWidth: 120, textAlign: "center", fontSize: 18, fontFamily: "JetBrains Mono, monospace", letterSpacing: 8 }}
                value={pinInput} onChange={e => setPin(e.target.value)} /></div>
            <StatusBar />
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={close}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleForeclose} disabled={txnState.s === "loading"}>
                {txnState.s === "loading" ? "Settling..." : "Confirm — ₹0 Fee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {modal === "receipt" && modalData && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Receipt</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon d={ic.x} size={16} /></button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ebfbee", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon d={ic.check} size={22} stroke="#2f9e44" sw="2.5" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>{fmt(modalData.amount)}</div>
              <span className={`badge badge-${modalData.status === "SUCCESS" ? "green" : "red"}`} style={{ marginTop: 6 }}>{modalData.status}</span>
            </div>
            <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px" }}>
              {[["Reference", modalData.referenceId], ["Type", modalData.type], ["From", modalData.senderName || "Razorpay"], ["To", modalData.receiverName], ["Date", new Date(modalData.createdAt).toLocaleString("en-IN")], ["Note", modalData.description || "—"]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eaecf0", fontSize: 13, gap: 10 }}>
                  <span style={{ color: "#98a2b3", fontWeight: 600, flexShrink: 0 }}>{l}</span>
                  <span style={{ color: "#1a1a2e", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
