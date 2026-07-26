import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [res, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse("");

    try {
      const fetchLogin = await axios.put(
        "http://localhost:3000/pytm/login/enter",
        form,
      );

      localStorage.setItem("token", fetchLogin.data.token);
      localStorage.setItem("username", form.username);
      if (fetchLogin.data.user) {
        localStorage.setItem("user", JSON.stringify(fetchLogin.data.user));
      }
      setResponse(`Welcome back to ShivamPay!`);
      setIsLoading(false);

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      setIsLoading(false);
      setResponse(
        err.response?.data?.message || "Invalid credentials, please try again",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1117] text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-md bg-[#161922]/90 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in duration-500">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-tr from-[#E1AAFF] to-[#00D1FF] rounded-full blur-[80px] pointer-events-none opacity-30" />

        <div className="mb-8 text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#E1AAFF] via-[#BD88FF] to-[#8050FF] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-8 h-8 text-[#1a0b36] fill-[#1a0b36]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to experience high-speed UPI & P2P Lending</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#E1AAFF]" /> Username or UPI ID
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-5 py-4 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#E1AAFF] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00D1FF]" /> Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-5 py-4 bg-[#1F222E]/80 border border-white/10 rounded-2xl focus:ring-2 focus:ring-[#00D1FF] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#8050FF] hover:opacity-95 text-[#1a0b36] font-extrabold py-4 rounded-2xl transition-all duration-300 mt-4 shadow-xl shadow-purple-500/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#1a0b36] border-t-transparent rounded-full animate-spin mr-2" />
                Securing Session...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>

          {res && (
            <div
              className={`p-4 rounded-2xl text-sm text-center font-medium animate-in slide-in-from-top-2 duration-300 ${res.includes("Welcome") ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}
            >
              {res}
            </div>
          )}

          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-sm text-gray-400">
              Don't have an account yet?{" "}
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="text-[#E1AAFF] font-bold hover:text-white transition underline-offset-4 hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500 relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#00D1FF]" />
          <span>256-Bit Bank-Grade ACID Monitored Encryption</span>
        </div>
      </div>
    </div>
  );
}
