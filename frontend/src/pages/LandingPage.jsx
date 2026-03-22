import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0b0e14] min-h-screen text-white font-sans overflow-hidden font-sans pb-24 h-full relative">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
               <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <nav className="flex justify-between items-center p-6 sm:p-8 relative z-10 max-w-7xl mx-auto">
                <div className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    ShivamPay<span className="text-purple-500">.</span>
                </div>
                <div className="hidden md:flex space-x-8 font-medium text-gray-400">
                    <a href="#" className="hover:text-white transition">Features</a>
                    <a href="#" className="hover:text-white transition">Security</a>
                    <a href="#" className="hover:text-white transition">Pricing</a>
                </div>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="hidden sm:block px-5 py-2.5 font-semibold text-white hover:text-purple-400 transition"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="px-5 py-2.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <main className="flex flex-col items-center justify-center pt-20 pb-32 px-4 sm:px-6 relative z-10 max-w-5xl mx-auto text-center">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-purple-300">
                    ✨ The future of digital payments is here
                </div>
                
                <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                    Seamless transfers,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
                        zero boundaries.
                    </span>
                </h1>
                
                <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-12 leading-relaxed">
                    Join millions of users who trust ShivamPay for secure, instant, and fee-free money transfers worldwide. Experience finance reimagined.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button 
                        onClick={() => navigate('/register')} 
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-bold text-lg hover:opacity-90 transition shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] transform hover:scale-105"
                    >
                        Create Free Account
                    </button>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition backdrop-blur-sm"
                    >
                        Log In to Existing
                    </button>
                </div>
            </main>

            <div className="relative max-w-6xl mx-auto px-6 mt-10">
                <div className="h-[400px] w-full rounded-[40px] border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-3xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                       <div className="w-full max-w-3xl h-full border border-white/10 rounded-3xl bg-[#161a21]/80 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center group-hover:scale-[1.02] transition-transform duration-700">
                           <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#E1AAFF] to-[#8050FF] flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
                              <span className="text-white font-bold text-3xl">S</span>
                           </div>
                           <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Pristine Dashboard UI</h3>
                           <p className="text-gray-500 text-lg">Next-generation aesthetics across all devices.</p>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
