import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setFormdata] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegiester = async (e) => {
    e.preventDefault();
    try {
        setIsLoading(true);
        setResponse("");

        const Registercall = await axios.post(
          "http://localhost:3000/pytm/register/enter",
          form
        );
        
        setResponse(`Welcome, ${Registercall.data.user.name}!`);
        setIsLoading(false);
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 1200);
        
    } catch (err) {
        setIsLoading(false);
        setResponse(err.response?.data?.message || "Registration failed, try again");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in duration-700">
      <div className="mb-8 text-center px-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-2">Create Account</h1>
        <p className="text-gray-400">Join ShivamPay and manage your finances with ease.</p>
      </div>
      
      <form onSubmit={handleRegiester} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={(e) => setFormdata({ ...form, name: e.target.value })}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
          <input
            type="text"
            placeholder="johndoe123"
            required
            value={form.username}
            onChange={(e) => setFormdata({ ...form, username: e.target.value })}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setFormdata({ ...form, password: e.target.value })}
            className="w-full px-5 py-3.5 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 mt-4 shadow-xl shadow-indigo-500/10 disabled:opacity-50 active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : 'Register Now'}
        </button>

        {response && (
            <div className={`p-4 rounded-2xl text-sm text-center font-medium animate-in slide-in-from-top-2 duration-300 ${response.includes("Welcome") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {response}
            </div>
        )}

        <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-purple-400 font-semibold hover:text-purple-300 decoration-purple-400/30 underline-offset-4 hover:underline"
                >
                  Log In
                </button>
            </p>
        </div>
      </form>
    </div>
  );
}