import { useState, useEffect } from "react";
import axios from "axios";

export default function Transiction() {
  const [users, setUsers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [txnStatus, setTxnStatus] = useState(null);

  const fetchBalance = async () => {
    try {
      const response = await axios.get("http://localhost:3000/pytm/balance", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setBalance(response.data.bankbalance);
    } catch (error) {
      console.error("Failed to fetch balance", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/pytm/all/allusers", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setUsers(response.data.filter(u => u.username !== localStorage.getItem("username")));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchUsers();
  }, []);

  const handleSend = async () => {
    if (!amount || isNaN(amount) || amount <= 0) return;
    setTxnStatus("processing");
    try {
      await axios.post("http://localhost:3000/pytm/trasiction/payment", {
        receiverId: selectedUser._id,
        amount: Number(amount)
      }, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      setTxnStatus("success");
      fetchBalance();
      setTimeout(() => {
        setShowSendModal(false);
        setTxnStatus(null);
        setAmount("");
      }, 2000);
    } catch (error) {
      setTxnStatus("error");
      console.error("Transaction failed", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0E1117] text-white pb-24 font-sans antialiased overflow-x-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden border border-white/10 flex items-center justify-center">
             <span className="text-orange-800 font-bold text-lg">S</span>
          </div>
          <h1 className="text-lg font-bold tracking-wide text-[#E1AAFF]">
            ShivamPay
          </h1>
        </div>
        <button className="text-[#E1AAFF] hover:text-white transition group relative focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#0E1117]"></span>
        </button>
      </header>

      {/* Balance Card */}
      <div className="px-6 relative z-10">
        <div className="w-full bg-gradient-to-tr from-[#E1AAFF] via-[#BD88FF] to-[#8050FF] rounded-[40px] p-8 shadow-[0_10px_40px_rgba(150,100,255,0.2)]">
          <p className="text-[#3a206b] text-[11px] font-bold uppercase tracking-widest mb-1 opacity-90">Total Balance</p>
          <h2 className="text-5xl font-extrabold text-[#1a0b36] tracking-tight">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="flex justify-between items-end mt-10">
            <div className="flex -space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#1a0b36] flex items-center justify-center text-[10px] text-white font-bold z-10 border-2 border-transparent">
                SP
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00D1FF] flex items-center justify-center text-[10px] text-[#1a0b36] font-bold z-0 border-2 border-[#BD88FF]">
                VC
              </div>
            </div>
            <p className="text-[#3a206b] font-semi text-sm tracking-widest">**** 8824</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-6 mt-8">
        {[
          { 
            id: 'send', 
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />,
            label: 'Send',
            onClick: () => setShowSendModal(true)
          },
          { 
            id: 'request', 
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
            label: 'Request',
            style: 'transform rotate-45 scale-75'
          },
          { 
            id: 'pay', 
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
            label: 'Pay Bills' 
          },
          { 
            id: 'scan', 
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />,
            label: 'Scan' 
          },
        ].map(action => (
          <button 
            key={action.id} 
            onClick={action.onClick}
            className="flex flex-col items-center gap-3 group focus:outline-none"
          >
            <div className="w-[60px] h-[60px] bg-[#1C1C24] rounded-full flex items-center justify-center group-hover:bg-[#252530] transition shadow-lg border border-white/5 active:scale-95">
               <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-[#E1AAFF] ${action.style || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 {action.icon}
               </svg>
            </div>
            <span className="text-[11px] text-gray-400 font-medium group-hover:text-white transition">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Pay */}
      <div className="mt-8 px-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[17px] font-bold text-white tracking-wide">Quick Pay</h3>
          <button className="text-[#E1AAFF] text-xs font-bold tracking-wide hover:text-white transition">View All</button>
        </div>
        <div className="flex space-x-5 overflow-x-auto scrollbar-hide pb-2">
          {/* Static design list for showcase */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0">
             <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#00D1FF] to-[#BD88FF]">
                <div className="w-full h-full rounded-full bg-[#1C1C24] border-2 border-[#1C1C24] overflow-hidden flex items-center justify-center relative">
                   {/* Fallback avatar */}
                   <svg className="w-full h-full text-gray-400 opacity-50 absolute bottom-[-10px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c2.66 0 8 1.34 8 4v2H4v-2c0-2.66 5.34-4 8-4zm0-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                </div>
             </div>
             <span className="text-xs text-white font-medium">James</span>
          </div>

          {[
            { name: 'Alice', color: 'bg-orange-200' },
            { name: 'Rahul', color: 'bg-[#d8b48f]' },
            { name: 'Emma', color: 'bg-orange-300' },
          ].map(contact => (
            <div key={contact.name} className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0 opacity-80 hover:opacity-100 transition">
               <div className={`w-16 h-16 rounded-full ${contact.color} p-[2px] border-2 border-transparent hover:border-white/20 transition overflow-hidden flex items-center justify-center relative`}>
                  <svg className="w-full h-full text-black opacity-30 absolute bottom-[-10px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c2.66 0 8 1.34 8 4v2H4v-2c0-2.66 5.34-4 8-4zm0-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
               </div>
               <span className="text-xs text-gray-300 font-medium group-hover:text-white">{contact.name}</span>
            </div>
          ))}

          {/* Dotted standard add button */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0 opacity-60 hover:opacity-100 transition">
             <div className="w-16 h-16 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-400 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 px-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[17px] font-bold text-white tracking-wide">Recent Activity</h3>
          <span className="text-gray-400 text-[11px] font-bold tracking-widest uppercase">October</span>
        </div>
        <div className="space-y-3">
          {[
            { id: 1, title: 'Starbucks', sub: 'Completed • Today', amount: '-$4.50', icon: 'M13 3H7v1.5h6V3zm-2.4 9H8.6l-.3-1.5h2.6l-.3 1.5zm3.9-3l-.4 1.5H5.1C4.5 10.5 4 10 4 9.4V6c0-.6.5-1 1-1h10c.6 0 1 .5 1 1v3.4c0 .6-.5 1-1 1h-.8l.8 1.5z' },
            { id: 2, title: 'Apple Store', sub: 'Processing • Yesterday', amount: '-$1,299.00', icon: 'M9.75 3C8.5 3 7.5 4.12 7.5 5.5v1h5V5.5C12.5 4.12 11.5 3 9.75 3zm3.75 3.5h3C17.33 6.5 18 7.17 18 8v10c0 .83-.67 1.5-1.5 1.5h-11C4.67 19.5 4 18.83 4 18V8c0-.83.67-1.5 1.5-1.5h3V5.5C8.5 3.57 9.57 2.5 11 2.5s2.5 1.07 2.5 2.5v1.5z' },
            { id: 3, title: 'Rent Payment', sub: 'Completed • Oct 28', amount: '-$1,800.00', icon: 'M3 13h1v7c0 1.1.9 2 2 2h4v-7h4v7h4c1.1 0 2-.9 2-2v-7h1a1 1 0 00.7-1.7L12 2.7l-9.7 8.6A1 1 0 003 13zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z' },
            { id: 4, title: 'Uber', sub: 'Refunded • Oct 27', amount: '+$18.20', isPositive: true, icon: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM7.5 17A1.5 1.5 0 117.5 14a1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z' },
          ].map(txn => (
            <div key={txn.id} className="flex items-center justify-between p-4 bg-[#14151B] hover:bg-[#1A1C23] rounded-[24px] cursor-pointer transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                     <path d={txn.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-white mb-0.5">{txn.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{txn.sub}</p>
                </div>
              </div>
              <span className={`text-[15px] font-bold ${txn.isPositive ? 'text-[#00D1FF]' : 'text-[#FF4A6B]'}`}>
                {txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Modal Logic -> Keep it functional if needed */}
      {showSendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1C1C24] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-white">Send Money</h3>
                <button 
                  onClick={() => setShowSendModal(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Keep user selection simple for now or fetch live users */}
              <div className="space-y-4 mb-8 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                 {users.map((u) => (
                    <div 
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition border ${selectedUser?._id === u._id ? 'border-[#E1AAFF] bg-[#14151B]' : 'border-transparent hover:bg-[#14151B]'}`}
                    >
                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#BD88FF] flex items-center justify-center font-bold text-[#1C1C24]">
                          {u.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                       </div>
                    </div>
                 ))}
                 {users.length === 0 && <p className="text-sm text-gray-500 text-center">No other users found.</p>}
              </div>

              {selectedUser && (
                <div className="space-y-6">
                  <div className="text-center bg-[#14151B] p-6 rounded-3xl">
                    <div className="flex items-center justify-center group relative">
                      <span className="text-2xl font-bold text-gray-500 absolute left-8">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent text-center text-5xl font-extrabold outline-none text-white placeholder-gray-700"
                        autoFocus
                      />
                    </div>
                  </div>

                  {txnStatus === "processing" ? (
                     <div className="py-2 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1AAFF] mx-auto"></div>
                     </div>
                  ) : txnStatus === "success" ? (
                     <div className="py-2 text-center">
                        <div className="text-[#00D1FF] font-bold text-lg uppercase tracking-wider">Sent!</div>
                     </div>
                  ) : (
                    <button 
                      onClick={handleSend}
                      className="w-full py-4 bg-[#E1AAFF] text-[#1a0b36] rounded-full font-bold text-[15px] hover:bg-white transition-all shadow-lg shadow-[#E1AAFF]/20 active:scale-95"
                    >
                      Send 
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer (Mobile) */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#0E1117] via-[#0E1117]/95 to-transparent pt-10 pb-6 px-6 z-40 hidden sm:block md:hidden lg:hidden" />
      <nav className="fixed bottom-0 left-0 w-full bg-[#0E1117] border-t border-[#1C1C24] pt-3 pb-safe z-50">
         <div className="flex justify-between items-center max-w-sm mx-auto px-6 pb-6">
            <button className="flex flex-col items-center justify-center p-3 px-5 bg-[#D9A7FF] rounded-[24px] shadow-[0_0_20px_rgba(217,167,255,0.2)]">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1a0b36]" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
               </svg>
            </button>
            <button className="flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition p-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <span className="text-[9px] font-bold text-white tracking-widest uppercase">History</span>
            </button>
            <button className="flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition p-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
               </svg>
               <span className="text-[9px] font-bold text-white tracking-widest uppercase">Profile</span>
            </button>
            <button className="flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition p-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               </svg>
               <span className="text-[9px] font-bold text-white tracking-widest uppercase">Settings</span>
            </button>
         </div>
      </nav>
    </div>
  );
}

