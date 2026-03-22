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
    <div className="min-h-screen bg-[#0b0e14] text-white p-4 sm:p-6 md:p-8 font-sans animate-in fade-in duration-1000">
      {/* Background blobs for premium feel */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
              ShivamPay
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">
              S
            </div>
          </div>
        </header>

        {/* Balance Card Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-purple-600/90 to-indigo-700/90 rounded-[32px] p-8 shadow-2xl shadow-indigo-500/20 border border-white/10 group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 fill-white">
                  <path d="M44.7,-76.4C58.3,-69.2,70.1,-59,79.5,-46.1C88.9,-33.2,95.8,-17.7,94.9,-2.4C94,12.9,85.2,27.9,74.8,40.5C64.4,53,52.3,63.1,39,70.1C25.6,77,10.9,80.7,-2.9,85.1C-16.8,89.5,-29.8,94.5,-42.1,89.4C-54.4,84.4,-65.9,69.2,-73.4,54.7C-81,40.2,-84.6,26.4,-86.3,12.5C-88,-1.4,-87.8,-15.5,-82.5,-28C-77.2,-40.5,-66.8,-51.5,-54.8,-59.5C-42.8,-67.5,-29.3,-72.6,-15.2,-75.4C-1.1,-78.3,14.2,-78.9,29.9,-83.1C34.9,-84.4,40.1,-86.4,44.7,-76.4Z" transform="translate(100 100)" />
               </svg>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 text-sm font-medium tracking-wider uppercase">Total Balance</p>
                  <h2 className="text-5xl font-extrabold mt-1 tracking-tight">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 px-3 text-xs font-bold border border-white/20">
                  DEBIT CARD
                </div>
              </div>
              <div className="flex space-x-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Card Holder</span>
                  <span className="font-semibold text-lg tracking-wide uppercase">Shivam Vishwakarma</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Expires</span>
                  <span className="font-semibold text-lg tracking-wide uppercase">12 / 28</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="flex-1 bg-gray-800/40 hover:bg-gray-800/60 transition-all rounded-3xl p-6 border border-white/5 flex flex-col items-center justify-center group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-bold">Add Money</span>
            </button>
            <button className="flex-1 bg-white hover:bg-gray-100 transition-all rounded-3xl p-6 flex flex-col items-center justify-center group shadow-xl shadow-white/5">
              <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-lg shadow-purple-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 003 11c0-2.778 1.123-5.288 2.945-7.111m9.055 9.055a9.968 9.968 0 01-2.945 7.111M21 11a10.003 10.003 0 00-2.945-7.111m-9.055 9.055a9.968 9.968 0 002.945-7.111M12 7a4 4 0 110 8 4 4 0 010-8z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Scan & Pay</span>
            </button>
          </div>
        </section>

        {/* Main Content Area */}
        <section className="bg-[#161a21]/50 backdrop-blur-xl rounded-[32px] border border-white/5 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
            <h3 className="text-xl font-bold">Quick Send</h3>
            <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Search contact or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0b0e14]/50 border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm transition"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div 
                      key={user._id}
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all cursor-pointer hover:scale-[1.02]"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowSendModal(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-purple-300 transition">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-gray-500">No users found matching "{search}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Transaction Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1c2028] w-full max-w-md rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Transfer Money</h3>
                <button 
                  onClick={() => setShowSendModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center mb-8 space-y-3">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-xl shadow-purple-500/20">
                    {selectedUser?.name.charAt(0)}
                 </div>
                 <div className="text-center">
                    <h4 className="text-xl font-bold">{selectedUser?.name}</h4>
                    <p className="text-sm text-gray-500">@{selectedUser?.username}</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-widest">Amount to send</span>
                  <div className="flex items-center justify-center mt-2 group relative">
                    <span className="text-4xl font-bold text-gray-400 absolute left-4">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-transparent text-center text-6xl font-extrabold outline-none placeholder-gray-800"
                      autoFocus
                    />
                  </div>
                </div>

                {txnStatus === "processing" ? (
                   <div className="py-4 text-center space-y-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-purple-400 font-medium">Securing transaction...</p>
                   </div>
                ) : txnStatus === "success" ? (
                   <div className="py-4 text-center animate-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-green-400 font-bold text-xl uppercase tracking-wider">Payment Sent!</p>
                   </div>
                ) : (
                  <button 
                    onClick={handleSend}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                  >
                    Confirm & Send
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer (Mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#161a21]/80 backdrop-blur-2xl border border-white/10 p-3 flex justify-between items-center rounded-3xl shadow-2xl z-40">
         <button className="flex flex-col items-center justify-center flex-1 text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">Home</span>
         </button>
         <button className="flex flex-col items-center justify-center flex-1 text-gray-500 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">Stats</span>
         </button>
         <button className="flex flex-col items-center justify-center flex-1 text-gray-500 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">Profile</span>
         </button>
         <button className="flex flex-col items-center justify-center flex-1 text-gray-500 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-bold mt-1 uppercase">Menu</span>
         </button>
      </div>
    </div>
  );
}
