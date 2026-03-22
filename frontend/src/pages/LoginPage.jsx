import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      setResponse(`Welcome back!`);
      setIsLoading(false);

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      setIsLoading(false);
      setResponse(
        err.response?.data?.message || "Invalid credentials, please try again",
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in duration-700">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="text-white text-3xl font-extrabold tracking-tighter">SP</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400">Securely sign in to your ShivamPay account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500" />
            <label htmlFor="remember" className="ml-2 text-xs text-gray-400">Remember me</label>
          </div>
          <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 mt-2 shadow-xl shadow-indigo-500/10 disabled:opacity-50 active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : "Sign In"}
        </button>

        {res && (
          <div
            className={`p-4 rounded-2xl text-sm text-center font-medium animate-in slide-in-from-top-2 duration-300 ${res.includes("Welcome") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            {res}
          </div>
        )}

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="text-purple-400 font-semibold hover:text-purple-300 decoration-purple-400/30 underline-offset-4 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
