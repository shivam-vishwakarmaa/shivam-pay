import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setFormdata] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        setIsLoading(true);
        setResponse("");

        const res = await axios.post(
          "http://localhost:3000/pytm/register/enter",
          form
        );
        
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", form.username);
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        setResponse(`🎉 Account created! Assigned UPI: ${form.username.toLowerCase()}@shivampay`);
        setIsLoading(false);
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 1500);
        
    } catch (err) {
        setIsLoading(false);
        setResponse(err.response?.data?.message || "Registration failed, please verify values.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1117] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-md bg-[#161922]/90 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in duration-500">
        
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#00D1FF] to-[#E1AAFF] rounded-full blur-[80px] pointer-events-none opacity-30" />

        <div className="mb-8 text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#00D1FF] via-[#BD88FF] to-[#E1AAFF] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#00D1FF]/20">
            <Sparkles className="w-8 h-8 text-[#1a0b36]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Get free UPI Payments & Instant P2P Friend Loan capability</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E1AAFF]" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              required
              value={form.name}
              onChange={(e) => setFormdata({ ...form, name: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#E1AAFF] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00D1FF]" /> Username (Auto UPI ID)
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="alex"
                required
                value={form.username}
                onChange={(e) => setFormdata({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                className="w-full pl-5 pr-32 py-3.5 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#00D1FF] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
              />
              <span className="absolute right-4 text-xs font-mono font-bold text-[#E1AAFF]">@shivampay</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#BD88FF]" /> Email (For Auto EMI Alerts)
            </label>
            <input
              type="email"
              placeholder="alex@example.com (Optional)"
              value={form.email}
              onChange={(e) => setFormdata({ ...form, email: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#BD88FF] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-pink-400" /> Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setFormdata({ ...form, password: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#00D1FF] via-[#BD88FF] to-[#E1AAFF] hover:opacity-95 text-[#1a0b36] font-extrabold py-4 rounded-2xl transition-all duration-300 mt-4 shadow-xl shadow-cyan-500/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1a0b36] border-t-transparent rounded-full animate-spin mr-2" />
                Creating Account...
              </span>
            ) : (
              <>
                <span>Join ShivamPay Free</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>

          {response && (
            <div className={`p-4 rounded-2xl text-sm text-center font-medium animate-in slide-in-from-top-2 duration-300 ${response.includes("🎉") ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
              {response}
            </div>
          )}

          <div className="text-center pt-3 border-t border-white/5">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#00D1FF] font-bold hover:text-white transition underline-offset-4 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-500 relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#E1AAFF]" />
          <span>Includes free $10,000 Sandbox Balance for instant simulation</span>
        </div>
      </div>
    </div>
  );
}