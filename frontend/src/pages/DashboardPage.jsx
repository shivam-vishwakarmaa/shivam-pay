import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { API } from "../config/api";
import ScreenLockModal from "../components/ScreenLockModal";
import WalletSummary from "../components/dashboard/WalletSummary";
import SendMoneyForm from "../components/dashboard/SendMoneyForm";
import LoansSection from "../components/dashboard/LoansSection";
import HistorySection from "../components/dashboard/HistorySection";
import NotificationsSection from "../components/dashboard/NotificationsSection";
import DashboardModals from "../components/dashboard/DashboardModals";

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
      // Items 11 & 13: Renamed to /allusers and /transaction
      const [b, u, t, l, n, r] = await Promise.allSettled([
        axios.get(`${API}/balance`, auth),
        axios.get(`${API}/allusers`, auth),
        axios.get(`${API}/transaction/history`, auth),
        axios.get(`${API}/loans/my-loans`, auth),
        axios.get(`${API}/notifications/my-notifications`, auth),
        axios.get(`${API}/razorpay/config`, auth),
      ]);
      if (b.status === "fulfilled") {
        setUser(b.value.data);
        localStorage.setItem("user", JSON.stringify(b.value.data));
      } else if (b.status === "rejected" && b.reason?.response?.status === 401) {
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

  const handleSend = async (e) => {
    e.preventDefault();
    setTxn({ s: "loading", m: "Processing transfer..." });
    try {
      // Item 11: Route renamed to /transaction/payment
      await axios.post(`${API}/transaction/payment`, sendForm, auth);
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
            <div className="nav-item" onClick={() => setIsLocked(true)} style={{ color: "#3b5bdb" }}>
              <Icon d={ic.lock} size={16} /><span>Lock Wallet 🔒</span>
            </div>
            <div className="nav-item" onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ color: "#e03131" }}>
              <Icon d={ic.logout} size={16} /><span>Sign Out</span>
            </div>
          </div>
        </aside>
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
            {tab === "HOME" && <WalletSummary user={user} transactions={transactions} open={open} setTopup={setTopup} setTab={setTab} fmt={fmt} Icon={Icon} ic={ic} />}
            {tab === "SEND" && <SendMoneyForm sendForm={sendForm} setSend={setSend} handleSend={handleSend} txnState={txnState} StatusBar={StatusBar} users={users} searchQ={searchQ} setSearch={setSearch} />}
            {tab === "LOANS" && <LoansSection loans={loans} user={user} open={open} fmt={fmt} Icon={Icon} ic={ic} />}
            {tab === "HISTORY" && <HistorySection transactions={transactions} user={user} open={open} fmt={fmt} />}
            {tab === "NOTIFS" && <NotificationsSection notifications={notifications} unreadN={unreadN} auth={auth} loadAll={loadAll} Icon={Icon} ic={ic} />}
          </main>
        </div>
      </div>

      <DashboardModals
        modal={modal} modalData={modalData} close={close} rzpCfg={rzpCfg}
        topupAmt={topupAmt} setTopup={setTopup} handleTopup={handleTopup}
        handleLoan={handleLoan} handleAccept={handleAccept} handleForeclose={handleForeclose}
        loanForm={loanForm} setLoan={setLoan} loanCalc={loanCalc} pinInput={pinInput} setPin={setPin}
        txnState={txnState} StatusBar={StatusBar} fmt={fmt} Icon={Icon} ic={ic}
      />
    </>
  );
}
