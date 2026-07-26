import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  Wallet,
  QrCode,
  Send,
  HandCoins,
  ReceiptText,
  Bell,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Sparkles,
  Search,
  Building2,
  Lock,
  RefreshCw,
  Mail,
  ExternalLink,
  CreditCard,
  DollarSign
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // State for user & core balances
  const [userInfo, setUserInfo] = useState({
    bankbalance: 0,
    name: "User",
    username: "username",
    email: "",
    upiId: "user@shivampay",
    linkedBank: "HDFC Bank - **** 8824"
  });
  
  // Tab control: 'HOME' | 'LOANS' | 'HISTORY' | 'NOTIFICATIONS'
  const [activeTab, setActiveTab] = useState("HOME");

  // Data arrays
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showSendModal, setShowSendModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanPayModal, setShowScanPayModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showForecloseModal, setShowForecloseModal] = useState(null); // loan object
  const [showAcceptModal, setShowAcceptModal] = useState(null); // loan object
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Send Money Forms
  const [sendForm, setSendForm] = useState({ receiverIdentifier: "", amount: "", pin: "", description: "" });
  const [txnStatus, setTxnStatus] = useState({ state: "IDLE", msg: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Bill Pay Forms
  const [billForm, setBillForm] = useState({ billerName: "Electricity Board", category: "Electricity", amount: "150.00", pin: "", consumerNumber: "ENG-899214" });

  // Loan Proposal Forms
  const [loanForm, setLoanForm] = useState({
    partnerUsername: "",
    role: "LENDER", // LENDER (Give loan) or BORROWER (Take loan)
    principalAmount: "500",
    interestRate: "5",
    durationMonths: "6",
    deductionDayOfMonth: "5",
    remarks: ""
  });

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: "Bearer " + token } };

  // Initial loads
  const loadAllData = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setRefreshing(true);
    try {
      const [balRes, usersRes, txnsRes, loansRes, notifRes] = await Promise.all([
        axios.get("http://localhost:3000/pytm/balance", authHeader).catch(() => ({ data: userInfo })),
        axios.get("http://localhost:3000/pytm/all/allusers", authHeader).catch(() => ({ data: [] })),
        axios.get("http://localhost:3000/pytm/trasiction/history", authHeader).catch(() => ({ data: { transactions: [] } })),
        axios.get("http://localhost:3000/pytm/loans/my-loans", authHeader).catch(() => ({ data: { loans: [] } })),
        axios.get("http://localhost:3000/pytm/notifications/my-notifications", authHeader).catch(() => ({ data: { notifications: [] } })),
      ]);

      setUserInfo(balRes.data);
      setUsers((usersRes.data || []).filter(u => u.username !== balRes.data.username));
      setTransactions(txnsRes.data.transactions || []);
      setLoans(loansRes.data.loans || []);
      setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      console.error("Failed to sync dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E1AAFF", "#00D1FF", "#BD88FF", "#8050FF"]
    });
  };

  // UPI Transfer Handler
  const handleSendMoney = async (e) => {
    e.preventDefault();
    setTxnStatus({ state: "PROCESSING", msg: "Verifying UPI PIN & Securing Transaction..." });
    try {
      const res = await axios.post("http://localhost:3000/pytm/trasiction/payment", sendForm, authHeader);
      setTxnStatus({ state: "SUCCESS", msg: `Transferred $${sendForm.amount} instantly via UPI!` });
      triggerConfetti();
      loadAllData();
      setTimeout(() => {
        setShowSendModal(false);
        setShowScanPayModal(false);
        setTxnStatus({ state: "IDLE", msg: "" });
        setSendForm({ receiverIdentifier: "", amount: "", pin: "", description: "" });
      }, 1800);
    } catch (err) {
      setTxnStatus({ state: "ERROR", msg: err.response?.data?.message || "Transfer failed. Check balance or PIN." });
    }
  };

  // Bill Pay Handler
  const handlePayBill = async (e) => {
    e.preventDefault();
    setTxnStatus({ state: "PROCESSING", msg: "Processing instant bill deduction..." });
    try {
      const res = await axios.post("http://localhost:3000/pytm/trasiction/bills/pay", billForm, authHeader);
      setTxnStatus({ state: "SUCCESS", msg: `Paid ${billForm.billerName} bill of $${billForm.amount}!` });
      triggerConfetti();
      loadAllData();
      setTimeout(() => {
        setShowBillModal(false);
        setTxnStatus({ state: "IDLE", msg: "" });
      }, 1800);
    } catch (err) {
      setTxnStatus({ state: "ERROR", msg: err.response?.data?.message || "Bill payment failed." });
    }
  };

  // Loan Proposal Handler
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setTxnStatus({ state: "PROCESSING", msg: "Submitting financial agreement..." });
    try {
      await axios.post("http://localhost:3000/pytm/loans/propose", loanForm, authHeader);
      setTxnStatus({ state: "SUCCESS", msg: "Loan proposal created and sent to partner!" });
      loadAllData();
      setTimeout(() => {
        setShowLoanModal(false);
        setTxnStatus({ state: "IDLE", msg: "" });
      }, 1500);
    } catch (err) {
      setTxnStatus({ state: "ERROR", msg: err.response?.data?.message || "Failed to initiate loan." });
    }
  };

  // Loan Acceptance & Dispersal
  const handleAcceptLoan = async (pin) => {
    setTxnStatus({ state: "PROCESSING", msg: "Verifying atomic balance transfer..." });
    try {
      await axios.post(`http://localhost:3000/pytm/loans/accept/${showAcceptModal._id}`, { pin }, authHeader);
      setTxnStatus({ state: "SUCCESS", msg: "Loan active! Principal funds atomically credited." });
      triggerConfetti();
      loadAllData();
      setTimeout(() => {
        setShowAcceptModal(null);
        setTxnStatus({ state: "IDLE", msg: "" });
      }, 1600);
    } catch (err) {
      setTxnStatus({ state: "ERROR", msg: err.response?.data?.message || "Failed to accept loan." });
    }
  };

  // Foreclosure (Zero fee prepayment of full dues at once)
  const handleForeclose = async (pin) => {
    setTxnStatus({ state: "PROCESSING", msg: "Calculating total dues & processing zero-fee foreclosure..." });
    try {
      await axios.post(`http://localhost:3000/pytm/loans/foreclose/${showForecloseModal._id}`, { pin }, authHeader);
      setTxnStatus({ state: "SUCCESS", msg: "🎉 Foreclosure Complete! All debt settled with $0 extra fees!" });
      triggerConfetti();
      loadAllData();
      setTimeout(() => {
        setShowForecloseModal(null);
        setTxnStatus({ state: "IDLE", msg: "" });
      }, 2000);
    } catch (err) {
      setTxnStatus({ state: "ERROR", msg: err.response?.data?.message || "Foreclosure transfer failed." });
    }
  };

  // Test Run Auto EMI Cron Engine Now!
  const handleSimulateEmiCron = async () => {
    setTxnStatus({ state: "PROCESSING", msg: "Simulating automated daily midnight EMI withdrawal engine..." });
    try {
      const res = await axios.post("http://localhost:3000/pytm/loans/trigger-cron", {}, authHeader);
      const report = res.data.result.results.map(r => r.message).join("\n") || "No active loans due or processed.";
      alert(`🕒 Automated EMI Engine Report:\n\n${report}\n\nCheck Notifications tab for dispatched emails if any balance was insufficient!`);
      loadAllData();
      setTxnStatus({ state: "IDLE", msg: "" });
    } catch (err) {
      alert("Failed to run EMI engine: " + (err.response?.data?.message || err.message));
      setTxnStatus({ state: "IDLE", msg: "" });
    }
  };

  // EMI Math Preview calculation for loan form
  const calcPrincipal = Number(loanForm.principalAmount) || 0;
  const calcRate = Number(loanForm.interestRate) || 0;
  const calcMonths = Number(loanForm.durationMonths) || 1;
  const calcInterest = (calcPrincipal * calcRate) / 100;
  const calcTotalPayable = calcPrincipal + calcInterest;
  const calcEmi = calcTotalPayable / calcMonths;

  // Filtered users for quick send
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.upiId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0E1117] text-white pb-32 font-sans antialiased selection:bg-purple-500">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0E1117]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] to-[#00D1FF] p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#161922] rounded-2xl flex items-center justify-center font-extrabold text-[#E1AAFF] text-lg">
              SP
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#E1AAFF] to-[#00D1FF]">
              ShivamPay <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/10 text-cyan-300 rounded-full border border-white/10 ml-1.5">Pro</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
              <span>{userInfo.upiId || `${userInfo.username}@shivampay`}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadAllData} 
            title="Refresh Account Data"
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition active:scale-95 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00D1FF]' : ''}`} />
          </button>
          
          <button
            onClick={() => setActiveTab("NOTIFICATIONS")}
            className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition active:scale-95 text-gray-300"
          >
            <Bell className="w-4 h-4 text-[#E1AAFF]" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            )}
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#1B1E29] border border-white/10 rounded-2xl text-xs font-mono text-gray-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{userInfo.linkedBank}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl transition active:scale-95 flex items-center gap-1.5 text-xs font-bold px-3"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Navigation Bar */}
        <div className="flex bg-[#161922] p-1.5 rounded-3xl border border-white/10 mb-8 max-w-2xl mx-auto shadow-xl overflow-x-auto scrollbar-hide">
          {[
            { id: 'HOME', label: 'UPI & Quick Pay', icon: Wallet },
            { id: 'LOANS', label: 'P2P Friend Loans & EMI', icon: HandCoins, badge: loans.filter(l => l.status === 'PENDING').length },
            { id: 'HISTORY', label: 'Audit Ledger', icon: ReceiptText },
            { id: 'NOTIFICATIONS', label: 'Alerts & Email Inbox', icon: Mail, badge: notifications.filter(n => n.type === 'EMAIL_ALERT').length },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                  active 
                    ? "bg-gradient-to-r from-[#E1AAFF] to-[#BD88FF] text-[#1a0b36] shadow-lg shadow-purple-500/25 scale-[1.02]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-[#1a0b36] text-white' : 'bg-pink-500 text-white'}`}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* TAB 1: UPI & QUICK PAY HOME */}
        {activeTab === "HOME" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Hero Balance Card */}
            <div className="w-full bg-gradient-to-tr from-[#1B0A36] via-[#2F145C] to-[#4B2292] border border-[#BD88FF]/30 rounded-[40px] p-6 md:p-10 shadow-[0_20px_60px_rgba(100,50,200,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00D1FF] to-[#E1AAFF] rounded-full blur-[110px] opacity-20 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-300 text-xs font-extrabold uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      Total Available Balance
                    </span>
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Active
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight my-2 drop-shadow-md">
                    ${userInfo.bankbalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>
                  <p className="text-gray-300 text-sm flex items-center gap-2 font-medium">
                    <Building2 className="w-4 h-4 text-[#E1AAFF]" />
                    <span>Linked: {userInfo.linkedBank}</span>
                    <span className="text-xs font-mono text-gray-400">(Default UPI PIN: <strong className="text-white">1234</strong>)</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex-1 md:flex-none py-3.5 px-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 backdrop-blur-md transition shadow-lg active:scale-95"
                  >
                    <QrCode className="w-5 h-5 text-[#E1AAFF]" />
                    <span>Receive / QR</span>
                  </button>
                  <button
                    onClick={() => setShowScanPayModal(true)}
                    className="flex-1 md:flex-none py-3.5 px-6 bg-gradient-to-r from-[#00D1FF] via-[#BD88FF] to-[#E1AAFF] hover:opacity-95 rounded-2xl font-black text-sm text-[#1a0b36] flex items-center justify-center gap-2 transition shadow-xl shadow-cyan-500/20 active:scale-95"
                  >
                    <Send className="w-5 h-5 text-[#1a0b36] fill-[#1a0b36]" />
                    <span>Scan & Pay</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
                {[
                  { label: "Direct UPI Transfer", desc: "Pay via UPI ID or Phone", icon: Send, color: "text-[#00D1FF]", onClick: () => setShowSendModal(true) },
                  { label: "Scan User QR", desc: "Instant contactless pay", icon: QrCode, color: "text-[#E1AAFF]", onClick: () => setShowScanPayModal(true) },
                  { label: "Pay Utility Bills", desc: "Electricity, DTH & Recharge", icon: ReceiptText, color: "text-emerald-400", onClick: () => setShowBillModal(true) },
                  { label: "P2P Friend Loan", desc: "Automated EMI & 0% Foreclose", icon: HandCoins, color: "text-amber-400", onClick: () => setActiveTab("LOANS") },
                ].map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div 
                      key={i} 
                      onClick={act.onClick}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 hover:border-white/20 transition cursor-pointer group flex items-center gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#161922] flex items-center justify-center border border-white/10 shadow-md group-hover:scale-110 transition">
                        <Icon className={`w-6 h-6 ${act.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-[#E1AAFF] transition">{act.label}</h4>
                        <p className="text-[11px] text-gray-400">{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Pay Contacts & Peer Directory */}
            <div className="bg-[#161922] p-6 md:p-8 rounded-[32px] border border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#E1AAFF]" />
                    <span>Quick Pay Peer Directory</span>
                  </h3>
                  <p className="text-xs text-gray-400">Click any user to initiate an instant, PIN-protected UPI transfer or lend funds</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name or UPI ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1E222F] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#E1AAFF] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                    No other users registered in this environment yet. Open a private tab and register another account to simulate peer payments!
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={u._id}
                      className="p-4 bg-[#1B1E2B] hover:bg-[#232738] border border-white/5 hover:border-white/20 rounded-3xl transition group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] to-[#00D1FF] flex items-center justify-center text-[#1a0b36] font-black text-lg shadow-md">
                          {u.name?.charAt(0) || "U"}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-extrabold text-white truncate">{u.name}</h4>
                          <p className="text-xs text-cyan-400 font-mono truncate">@{u.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSendForm({ ...sendForm, receiverIdentifier: u.upiId || `${u.username}@shivampay`, amount: "" });
                            setShowSendModal(true);
                          }}
                          className="flex-1 py-2 bg-white/10 hover:bg-[#E1AAFF] hover:text-[#1a0b36] rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Pay
                        </button>
                        <button
                          onClick={() => {
                            setLoanForm({ ...loanForm, partnerUsername: u.username });
                            setShowLoanModal(true);
                          }}
                          className="flex-1 py-2 bg-[#BD88FF]/20 hover:bg-[#BD88FF] hover:text-[#1a0b36] rounded-xl text-xs font-bold text-[#BD88FF] transition flex items-center justify-center gap-1"
                        >
                          <HandCoins className="w-3 h-3" /> Loan
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Transactions Showcase */}
            <div className="bg-[#161922] p-6 md:p-8 rounded-[32px] border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <button 
                  onClick={() => setActiveTab("HISTORY")}
                  className="text-xs font-bold text-[#E1AAFF] hover:underline flex items-center gap-1"
                >
                  <span>View All Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 4).length === 0 ? (
                  <p className="text-gray-500 text-sm py-6 text-center">No transactions recorded yet.</p>
                ) : (
                  transactions.slice(0, 4).map(t => {
                    const isOutgoing = t.senderName === userInfo.name || t.senderName === userInfo.username || t.senderId?.toString() === userInfo._id?.toString();
                    return (
                      <div 
                        key={t._id} 
                        onClick={() => setSelectedReceipt(t)}
                        className="p-4 bg-[#1B1E2B] hover:bg-[#202434] rounded-2xl flex items-center justify-between cursor-pointer transition border border-transparent hover:border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isOutgoing ? 'bg-pink-500/20 text-pink-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {isOutgoing ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-white">{t.description || t.type}</h4>
                            <p className="text-[11px] text-gray-400 font-mono">{new Date(t.createdAt).toLocaleString()} • Ref: {t.referenceId}</p>
                          </div>
                        </div>
                        <span className={`font-mono font-extrabold text-base ${isOutgoing ? 'text-pink-400' : 'text-emerald-400'}`}>
                          {isOutgoing ? '-' : '+'}${t.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: P2P FRIEND LOANS & EMI HUB (THE CORE EXTRA FEATURE) */}
        {activeTab === "LOANS" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Loan Hub Header Banner */}
            <div className="w-full bg-gradient-to-r from-[#21173D] via-[#2D1B54] to-[#1C1F33] p-8 rounded-[40px] border border-[#E1AAFF]/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-[#E1AAFF] text-[#1a0b36] rounded-full uppercase tracking-wider">
                    P2P Lending Engine
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">✓ Automated EMI Cron Ready</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                  Friend & Known-Person Loan Hub
                </h2>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed font-medium">
                  Provide or take loans with customizable interest rates and specific monthly due dates. Our automated EMI cron engine daily checks and transfers funds. Need early settlement? Borrowers can execute a **Zero-Cost One-Click Foreclosure** anytime to pay all remaining dues instantly with $0 extra fees!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowLoanModal(true)}
                  className="py-4 px-6 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] hover:opacity-95 text-[#1a0b36] font-extrabold text-sm rounded-2xl transition shadow-xl shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <HandCoins className="w-5 h-5 stroke-[2.5]" />
                  <span>New Loan Agreement</span>
                </button>

                <button
                  onClick={handleSimulateEmiCron}
                  title="Test run the daily scheduled automated EMI deduction and trigger email notifications right now!"
                  className="py-4 px-6 bg-[#2B2342] hover:bg-[#382E55] text-amber-300 border border-amber-400/30 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
                  <span>⚡ Simulate Auto EMI Cron Now</span>
                </button>
              </div>
            </div>

            {/* Active & Pending Loans Ledger */}
            <div className="bg-[#161922] p-6 md:p-8 rounded-[32px] border border-white/10">
              <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <span>Active & Pending Loan Agreements</span>
              </h3>

              {loans.length === 0 ? (
                <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center">
                  <HandCoins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-gray-400">No loans active in your profile</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-4">Start by offering a friendly loan or requesting assistance from a known peer.</p>
                  <button
                    onClick={() => setShowLoanModal(true)}
                    className="py-2.5 px-6 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition inline-flex items-center gap-2"
                  >
                    <span>+ Create First Proposal</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {loans.map(loan => {
                    const isLender = loan.lenderName === userInfo.name || loan.lenderName === userInfo.username || loan.lenderId === userInfo._id;
                    const isBorrower = !isLender;
                    const progressPercent = Math.max(0, Math.min(100, Math.round(((loan.totalPayableAmount - loan.remainingAmount) / loan.totalPayableAmount) * 100)));
                    
                    return (
                      <div 
                        key={loan._id} 
                        className={`p-6 rounded-3xl border transition relative overflow-hidden ${
                          loan.status === 'ACTIVE' 
                            ? 'bg-[#1B1E2B] border-[#00D1FF]/30 shadow-lg' 
                            : loan.status === 'OVERDUE'
                            ? 'bg-[#291B22] border-pink-500/50 shadow-pink-500/10'
                            : loan.status === 'FORECLOSED' || loan.status === 'COMPLETED'
                            ? 'bg-[#181C25] border-emerald-500/30 opacity-80'
                            : 'bg-[#1B1E2B] border-amber-400/30'
                        }`}
                      >
                        {/* Top info row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full border ${
                                loan.status === 'ACTIVE' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                                loan.status === 'OVERDUE' ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 animate-pulse' :
                                loan.status === 'FORECLOSED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                                loan.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                {loan.status === 'OVERDUE' ? '⚠️ OVERDUE (Email Dispatched)' : loan.status}
                              </span>
                              <span className="text-xs font-bold text-gray-400">
                                • {isLender ? `You are lending to @${loan.borrowerName}` : `You borrowed from @${loan.lenderName}`}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white">{loan.remarks}</h4>
                          </div>

                          <div className="text-right sm:text-right">
                            <span className="text-xs text-gray-400 font-medium block">Total Payable</span>
                            <span className="text-2xl font-mono font-extrabold text-white">${loan.totalPayableAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Middle financial statistics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-[#151722] p-4 rounded-2xl border border-white/5 text-xs">
                          <div>
                            <span className="text-gray-500 block">Principal Amount</span>
                            <span className="font-bold text-white text-sm font-mono">${loan.principalAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Interest & EMI</span>
                            <span className="font-bold text-[#E1AAFF] text-sm font-mono">{loan.interestRate}% (${loan.emiAmount}/mo)</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Remaining Dues</span>
                            <span className="font-bold text-pink-400 text-sm font-mono">${loan.remainingAmount.toFixed(2)} ({loan.remainingInstallments} EMIs)</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Auto EMI Schedule</span>
                            <span className="font-bold text-cyan-400 text-sm font-mono">Day {loan.deductionDayOfMonth} of every month</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE' || loan.status === 'COMPLETED' || loan.status === 'FORECLOSED') && (
                          <div className="mb-6">
                            <div className="flex justify-between text-xs mb-1.5 font-bold">
                              <span className="text-gray-400">Repayment Progress</span>
                              <span className="text-emerald-400 font-mono">{progressPercent}% Settled</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#151722] rounded-full overflow-hidden border border-white/5">
                              <div 
                                className="h-full bg-gradient-to-r from-[#00D1FF] via-[#BD88FF] to-emerald-400 transition-all duration-1000" 
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions footer */}
                        <div className="flex flex-wrap justify-end items-center gap-3 pt-2">
                          
                          {/* PENDING LOAN ACCEPTANCE BUTTONS */}
                          {loan.status === 'PENDING' && isBorrower && (
                            <button
                              onClick={() => setShowAcceptModal(loan)}
                              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Accept & Receive ${loan.principalAmount} Principal</span>
                            </button>
                          )}
                          {loan.status === 'PENDING' && isLender && (
                            <button
                              onClick={() => setShowAcceptModal(loan)}
                              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve & Disperse ${loan.principalAmount}</span>
                            </button>
                          )}

                          {/* FORECLOSURE KILLER FEATURE BUTTON (Borrower Only when Active/Overdue) */}
                          {['ACTIVE', 'OVERDUE'].includes(loan.status) && isBorrower && (
                            <button
                              onClick={() => setShowForecloseModal(loan)}
                              className="py-3 px-6 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 flex items-center gap-2 animate-pulse"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>Pay Full Amount / Foreclose ($0 Fees)</span>
                            </button>
                          )}

                          {['ACTIVE', 'OVERDUE'].includes(loan.status) && isLender && (
                            <span className="text-xs text-gray-400 italic">
                              Automated withdrawal runs on day {loan.deductionDayOfMonth} (or click Test Simulate EMI Cron).
                            </span>
                          )}

                          {(loan.status === 'FORECLOSED' || loan.status === 'COMPLETED') && (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Agreement Settle & Terminated
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION AUDIT LEDGER */}
        {activeTab === "HISTORY" && (
          <div className="bg-[#161922] p-6 md:p-8 rounded-[32px] border border-white/10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-white">Immutable Audit Ledger</h3>
                <p className="text-xs text-gray-400">All UPI transfers, P2P loans, EMIs, and foreclosures recorded with ACID consistency</p>
              </div>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-300">
                {transactions.length} Records
              </span>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center py-12 text-gray-500 text-sm">No recorded transactions in your ledger.</p>
              ) : (
                transactions.map(t => {
                  const isOutgoing = t.senderName === userInfo.name || t.senderName === userInfo.username;
                  return (
                    <div
                      key={t._id}
                      onClick={() => setSelectedReceipt(t)}
                      className="p-4 bg-[#1B1E2B] hover:bg-[#232738] rounded-2xl border border-white/5 hover:border-white/20 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                          t.type === 'LOAN_FORECLOSURE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          t.type === 'EMI_DEDUCTION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          isOutgoing ? 'bg-pink-500/20 text-pink-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isOutgoing ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-white/5 rounded text-gray-300 border border-white/10">
                              {t.type}
                            </span>
                            <span className="text-xs font-bold text-gray-400">Ref: {t.referenceId}</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-white">{t.description || t.category}</h4>
                          <p className="text-xs text-gray-500 font-mono">
                            {isOutgoing ? `To: ${t.receiverName} (${t.receiverUpiId})` : `From: ${t.senderName} (${t.senderUpiId})`} • {new Date(t.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-end items-center sm:items-end">
                        <span className="text-xs text-gray-500 sm:hidden">Amount</span>
                        <span className={`font-mono font-extrabold text-lg ${isOutgoing ? 'text-pink-400' : 'text-emerald-400'}`}>
                          {isOutgoing ? '-' : '+'}${t.amount.toFixed(2)}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                          ● {t.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATION & EMAIL INBOX (SEE INSUFFICIENT BALANCE ALERT EMAILS) */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="bg-[#161922] p-6 md:p-8 rounded-[32px] border border-white/10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#BD88FF]" />
                  <span>Alerts & Dispatched Email Inbox</span>
                </h3>
                <p className="text-xs text-gray-400">Real-time log of all automatic EMI deduction notifications and simulated Ethereal emails</p>
              </div>
              <button
                onClick={async () => {
                  await axios.put("http://localhost:3000/pytm/notifications/mark-read", {}, authHeader);
                  loadAllData();
                }}
                className="text-xs font-bold text-[#E1AAFF] hover:underline"
              >
                Mark All Read
              </button>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-center py-12 text-gray-500 text-sm">Your alert inbox is completely clear!</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n._id}
                    className={`p-5 rounded-3xl border transition flex items-start gap-4 ${
                      n.type === 'EMAIL_ALERT' 
                        ? 'bg-[#281825] border-pink-500/40 shadow-lg shadow-pink-500/5' 
                        : 'bg-[#1B1E2B] border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.type === 'EMAIL_ALERT' ? 'bg-pink-500 text-white animate-pulse' : 'bg-white/10 text-[#00D1FF]'}`}>
                      {n.type === 'EMAIL_ALERT' ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <span>{n.title}</span>
                          {n.emailStatus && n.emailStatus !== 'N/A' && (
                            <span className="text-[10px] px-2 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full">
                              ✉️ EMAIL {n.emailStatus}
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-mono">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      
                      <p className="text-xs text-gray-300 font-medium leading-relaxed mb-3">{n.message}</p>

                      {n.previewUrl && (
                        <a 
                          href={n.previewUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-black text-[#00D1FF] bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/20 transition"
                        >
                          <span>Open Dispatched Ethereal Email Web Preview</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL 1: SEND MONEY / UPI TRANSFER --- */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-md rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#00D1FF]" />
                <span>Instant UPI Pay</span>
              </h3>
              <button onClick={() => setShowSendModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendMoney} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Receiver UPI ID or Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex@shivampay or alex"
                  value={sendForm.receiverIdentifier}
                  onChange={(e) => setSendForm({ ...sendForm, receiverIdentifier: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 outline-none focus:border-[#E1AAFF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-2xl font-black font-mono text-white placeholder-gray-600 outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Remarks / Description</label>
                <input
                  type="text"
                  placeholder="Dinner, rent, gift..."
                  value={sendForm.description}
                  onChange={(e) => setSendForm({ ...sendForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Lock className="w-3.5 h-3.5" /> 4-Digit UPI PIN (Default: 1234)
                </label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  placeholder="••••"
                  value={sendForm.pin}
                  onChange={(e) => setSendForm({ ...sendForm, pin: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-amber-400/30 rounded-2xl text-center text-xl font-black font-mono text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {txnStatus.state !== "IDLE" && (
                <div className={`p-3 rounded-xl text-center text-xs font-extrabold ${txnStatus.state === 'ERROR' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'}`}>
                  {txnStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={txnStatus.state === "PROCESSING"}
                className="w-full py-4 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] text-[#1a0b36] font-extrabold rounded-2xl transition shadow-xl active:scale-95 text-sm"
              >
                {txnStatus.state === "PROCESSING" ? "Securing Transfer..." : "Authorize Pay With PIN"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RECEIVE / MY QR CODE --- */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-sm rounded-[32px] border border-white/10 p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowQrModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#E1AAFF] to-[#00D1FF] mx-auto mb-3 flex items-center justify-center text-[#1a0b36] font-extrabold text-2xl shadow-md">
              {userInfo.name?.charAt(0) || "U"}
            </div>
            <h3 className="text-lg font-extrabold text-white">{userInfo.name || userInfo.username}</h3>
            <p className="text-xs font-mono text-[#00D1FF] font-bold mb-6">@{userInfo.upiId || `${userInfo.username}@shivampay`}</p>
            
            <div className="p-6 bg-white rounded-3xl inline-block shadow-2xl mb-6">
              <QRCodeSVG
                value={`shivampay://upi/pay?pa=${userInfo.upiId}&pn=${encodeURIComponent(userInfo.name || '')}`}
                size={180}
                bgColor={"#FFFFFF"}
                fgColor={"#161922"}
                level={"H"}
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-gray-400 font-medium">
              Scan this interoperable QR code with any camera or PhonePe/GPay simulation scanner to receive funds instantly!
            </p>
          </div>
        </div>
      )}

      {/* --- MODAL 3: SCAN & PAY (SIMULATED CAMERA QR SCANNER) --- */}
      {showScanPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-md rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#E1AAFF]" />
                <span>QR Scanner & Instant Pay</span>
              </h3>
              <button onClick={() => setShowScanPayModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400">
                ✕
              </button>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="w-full h-52 bg-black/60 rounded-3xl border-2 border-dashed border-[#00D1FF]/50 relative flex flex-col items-center justify-center overflow-hidden mb-6 group">
              <div className="w-40 h-40 border-2 border-[#00D1FF] rounded-2xl relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-[#E1AAFF] absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_#E1AAFF] animate-pulse" />
                <span className="text-xs text-gray-400 bg-black/80 px-3 py-1 rounded-full border border-white/10">
                  Camera Viewfinder Active
                </span>
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="text-xs font-bold text-gray-400">Or Select a User QR below to simulate scanning:</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide mb-6">
              {users.map(u => (
                <div
                  key={u._id}
                  onClick={() => {
                    setSendForm({ ...sendForm, receiverIdentifier: u.upiId || `${u.username}@shivampay`, amount: "50" });
                    setShowScanPayModal(false);
                    setShowSendModal(true);
                  }}
                  className="p-3 bg-[#161822] hover:bg-[#202434] rounded-2xl border border-white/5 cursor-pointer flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-[#E1AAFF]" />
                    <span className="text-xs font-extrabold text-white">{u.name} (QR: @{u.username})</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">Tap to Scan ➔</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: PAY BILLS --- */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-md rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-400" />
                <span>Utility Bill Payment</span>
              </h3>
              <button onClick={() => setShowBillModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400">✕</button>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Select Category</label>
                <select 
                  value={billForm.category}
                  onChange={(e) => setBillForm({ ...billForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-sm text-white outline-none"
                >
                  <option value="Electricity">Electricity Board</option>
                  <option value="Recharge">Mobile Recharge (5G Unlimited)</option>
                  <option value="DTH">DTH / Tata Sky TV</option>
                  <option value="Water">Municipal Water Supply</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Biller Name</label>
                <input
                  type="text"
                  required
                  value={billForm.billerName}
                  onChange={(e) => setBillForm({ ...billForm, billerName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Bill Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-xl font-black font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1 mb-1">
                  <Lock className="w-3.5 h-3.5" /> Confirm UPI PIN
                </label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  placeholder="••••"
                  value={billForm.pin}
                  onChange={(e) => setBillForm({ ...billForm, pin: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-amber-400/30 rounded-2xl text-center text-xl font-black font-mono text-white outline-none"
                />
              </div>

              {txnStatus.state !== "IDLE" && (
                <div className={`p-3 rounded-xl text-center text-xs font-extrabold ${txnStatus.state === 'ERROR' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'}`}>
                  {txnStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={txnStatus.state === "PROCESSING"}
                className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold rounded-2xl transition shadow-xl active:scale-95 text-sm"
              >
                {txnStatus.state === "PROCESSING" ? "Paying Bill..." : "Pay Bill Instantly"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: NEW LOAN AGREEMENT --- */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-lg rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <HandCoins className="w-5 h-5 text-[#E1AAFF]" />
                  <span>P2P Friend Loan Agreement</span>
                </h3>
                <p className="text-xs text-gray-400">Define principal, interest rate, and automated monthly withdrawal date</p>
              </div>
              <button onClick={() => setShowLoanModal(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#161822] rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLoanForm({ ...loanForm, role: "LENDER" })}
                  className={`py-2 rounded-xl text-xs font-black transition ${loanForm.role === 'LENDER' ? 'bg-[#E1AAFF] text-[#1a0b36] shadow' : 'text-gray-400'}`}
                >
                  🤝 I want to Lend Money
                </button>
                <button
                  type="button"
                  onClick={() => setLoanForm({ ...loanForm, role: "BORROWER" })}
                  className={`py-2 rounded-xl text-xs font-black transition ${loanForm.role === 'BORROWER' ? 'bg-[#00D1FF] text-[#1a0b36] shadow' : 'text-gray-400'}`}
                >
                  🙏 I want to Request Loan
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Partner Username or UPI ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bob or bob@shivampay"
                  value={loanForm.partnerUsername}
                  onChange={(e) => setLoanForm({ ...loanForm, partnerUsername: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Principal ($)</label>
                  <input
                    type="number"
                    required
                    value={loanForm.principalAmount}
                    onChange={(e) => setLoanForm({ ...loanForm, principalAmount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#161822] border border-white/10 rounded-2xl font-mono text-base font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#161822] border border-white/10 rounded-2xl font-mono text-base font-bold text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Tenure (Months/EMIs)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={loanForm.durationMonths}
                    onChange={(e) => setLoanForm({ ...loanForm, durationMonths: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#161822] border border-white/10 rounded-2xl font-mono text-base font-bold text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-300 uppercase block mb-1">EMI Auto Deduction Day</label>
                  <select
                    value={loanForm.deductionDayOfMonth}
                    onChange={(e) => setLoanForm({ ...loanForm, deductionDayOfMonth: e.target.value })}
                    className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-sm text-white outline-none"
                  >
                    {[1, 5, 10, 15, 20, 25, 28].map(d => (
                      <option key={d} value={d}>{d}th of every month</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instant Automated EMI Math Showcase Card */}
              <div className="p-4 bg-[#141620] rounded-2xl border border-[#BD88FF]/30 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interest Payable:</span>
                  <span className="font-mono font-bold text-amber-300">${calcInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Payable Dues:</span>
                  <span className="font-mono font-bold text-white">${calcTotalPayable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10 text-sm font-extrabold text-[#00D1FF]">
                  <span>Estimated Monthly Automated EMI:</span>
                  <span className="font-mono">${calcEmi.toFixed(2)}/mo</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase block mb-1">Agreement Remarks / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Startup Seed Funding / Macbook purchase"
                  value={loanForm.remarks}
                  onChange={(e) => setLoanForm({ ...loanForm, remarks: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161822] border border-white/10 rounded-2xl text-xs text-white outline-none"
                />
              </div>

              {txnStatus.state !== "IDLE" && (
                <div className={`p-3 rounded-xl text-center text-xs font-extrabold ${txnStatus.state === 'ERROR' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'}`}>
                  {txnStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={txnStatus.state === "PROCESSING"}
                className="w-full py-4 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] text-[#1a0b36] font-extrabold rounded-2xl transition shadow-xl active:scale-95 text-sm"
              >
                {txnStatus.state === "PROCESSING" ? "Submitting Proposal..." : "Submit Loan Proposal"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: FORECLOSURE CONFIRMATION (ONE CLICK ZERO FEE PREPAYMENT) --- */}
      {showForecloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-md rounded-[32px] border border-pink-500/40 p-6 md:p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-pink-500/20 text-pink-400 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-pink-500/40 shadow-lg">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-white mb-1">One-Click Foreclosure</h3>
            <p className="text-xs text-gray-300 mb-6 font-medium leading-relaxed">
              You are about to settle and terminate Loan #{showForecloseModal._id.toString().slice(-6)} completely at a time. All scheduled future EMIs will stop instantly.
            </p>

            <div className="bg-[#161822] p-6 rounded-3xl border border-white/10 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Remaining Principal + Interest:</span>
                <span className="font-mono font-bold text-white">${showForecloseModal.remainingAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Early Closure & Penalty Fees:</span>
                <span className="font-mono font-extrabold text-emerald-400">$0.00 (100% Free!)</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#00D1FF] pt-2 border-t border-white/10">
                <span>Final Settlement Pay:</span>
                <span className="font-mono">${showForecloseModal.remainingAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1 mb-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm UPI PIN to Execute Foreclosure
              </label>
              <input
                type="password"
                maxLength="4"
                id="foreclosePinInput"
                placeholder="••••"
                defaultValue=""
                className="w-full px-4 py-3 bg-[#161822] border border-amber-400/40 rounded-2xl text-center text-2xl font-black font-mono text-white outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {txnStatus.state !== "IDLE" && (
              <div className={`p-3 rounded-xl text-center text-xs font-extrabold mb-4 ${txnStatus.state === 'ERROR' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'}`}>
                {txnStatus.msg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForecloseModal(null)}
                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const pinVal = document.getElementById("foreclosePinInput").value;
                  handleForeclose(pinVal);
                }}
                disabled={txnStatus.state === "PROCESSING"}
                className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl transition active:scale-95 text-sm"
              >
                {txnStatus.state === "PROCESSING" ? "Processing..." : "Confirm & Settle Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 7: ACCEPT & DISBURSE LOAN --- */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C1F2D] w-full max-w-md rounded-[32px] border border-emerald-500/40 p-6 md:p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-1">Confirm Loan Dispersal</h3>
            <p className="text-xs text-gray-300 mb-6 font-medium">
              By confirming, ${showAcceptModal.principalAmount} will be atomically dispersed. Automated EMI of ${showAcceptModal.emiAmount} will run on day {showAcceptModal.deductionDayOfMonth} of every month.
            </p>

            <div className="mb-6 text-left">
              <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1 mb-1">
                <Lock className="w-3.5 h-3.5" /> Enter UPI PIN to Authorize
              </label>
              <input
                type="password"
                maxLength="4"
                id="acceptPinInput"
                placeholder="••••"
                className="w-full px-4 py-3 bg-[#161822] border border-amber-400/30 rounded-2xl text-center text-2xl font-black font-mono text-white outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {txnStatus.state !== "IDLE" && (
              <div className={`p-3 rounded-xl text-center text-xs font-extrabold mb-4 ${txnStatus.state === 'ERROR' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300 animate-pulse'}`}>
                {txnStatus.msg}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowAcceptModal(null)} className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm transition">
                Cancel
              </button>
              <button
                onClick={() => {
                  const pinVal = document.getElementById("acceptPinInput").value;
                  handleAcceptLoan(pinVal);
                }}
                disabled={txnStatus.state === "PROCESSING"}
                className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-black font-black rounded-2xl shadow-xl transition active:scale-95 text-sm"
              >
                {txnStatus.state === "PROCESSING" ? "Dispersing..." : "Authorize Agreement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 8: TRANSACTION INVOICE / RECEIPT VIEW --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#181B26] w-full max-w-sm rounded-[32px] border border-white/10 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-mono uppercase font-black px-3 py-1 bg-white/10 rounded-full text-[#00D1FF]">
                Verified Invoice
              </span>
              <button onClick={() => setSelectedReceipt(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400">✕</button>
            </div>

            <div className="text-center mb-6 border-b border-white/10 pb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto mb-2 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Transaction Amount</p>
              <h2 className="text-4xl font-mono font-extrabold text-white">${selectedReceipt.amount.toFixed(2)}</h2>
              <p className="text-xs text-emerald-400 font-bold mt-1">● COMPLETED WITH ACID ATOMICITY</p>
            </div>

            <div className="space-y-3 text-xs mb-6 font-medium">
              <div className="flex justify-between">
                <span className="text-gray-400">Reference Number:</span>
                <span className="text-white font-mono">{selectedReceipt.referenceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Type:</span>
                <span className="text-white font-bold">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sender / From:</span>
                <span className="text-white">{selectedReceipt.senderName} ({selectedReceipt.senderUpiId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Receiver / To:</span>
                <span className="text-white">{selectedReceipt.receiverName} ({selectedReceipt.receiverUpiId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition text-xs"
            >
              🖨️ Print / Save PDF Invoice
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
