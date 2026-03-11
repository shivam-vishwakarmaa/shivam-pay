import { useState, useEffect } from "react";
import axios from "axios";

export default function Transiction() {
  const [users, setUsers] = useState([]);
  const [balance, setBalance] = useState(1250.0); // Mock balance for now

  // We will use this later to fetch real users from your database
  const fetchUsers = async () => {
    try {
      // const response = await axios.get("YOUR_API_URL", { headers: { ... } });
      // setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-[500px] w-full animate-fade-in bg-gray-900 text-white p-6 rounded-3xl relative overflow-hidden">
      {/* Background glowing effects for the Gen Z vibe */}
      <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <p className="text-gray-400 text-sm">Total Balance</p>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            ₹{balance.toFixed(2)}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold border-2 border-gray-800 shadow-lg">
          S
        </div>
      </div>

      {/* Quick Actions (Glassmorphism effect) */}
      <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
        <button className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition duration-300">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
            <span className="text-purple-400 text-xl">↑</span>
          </div>
          <span className="text-xs font-medium">Send</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition duration-300">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mb-2">
            <span className="text-pink-400 text-xl">↓</span>
          </div>
          <span className="text-xs font-medium">Request</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 hover:opacity-90 transition duration-300 shadow-lg shadow-purple-500/30">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <span className="text-white text-xl">⚡</span>
          </div>
          <span className="text-xs font-bold">Loan</span>
        </button>
      </div>

      {/* Quick Send Section */}
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Quick Send
        </h3>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {/* Mock Contacts */}
          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 p-[2px] mb-2 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center border-2 border-gray-900">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-orange-400 to-pink-500">
                  G
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-300">Gargi</span>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-2 group-hover:bg-gray-700 transition-colors">
              <span className="text-gray-400">+</span>
            </div>
            <span className="text-xs font-medium text-gray-500">Add</span>
          </div>
        </div>
      </div>
    </div>
  );
}
