import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, HandCoins, QrCode, ArrowRight, Sparkles, ReceiptText } from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0E1117] min-h-screen text-white font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white pb-32">
            
            {/* Background Kinetic Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
               <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#E1AAFF]/20 to-[#00D1FF]/20 rounded-full blur-[140px] animate-pulse" />
               <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-[#BD88FF]/20 to-[#8050FF]/20 rounded-full blur-[160px] animate-pulse" />
            </div>

            <nav className="flex justify-between items-center p-6 md:px-12 relative z-20 max-w-7xl mx-auto border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] p-[2px] shadow-lg shadow-purple-500/30">
                     <div className="w-full h-full bg-[#161922] rounded-2xl flex items-center justify-center font-extrabold text-[#E1AAFF] text-lg">
                        SP
                     </div>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white">
                      ShivamPay<span className="text-[#00D1FF]">.</span>
                  </span>
                </div>

                <div className="hidden md:flex items-center gap-8 font-extrabold text-xs tracking-wider uppercase text-gray-400">
                    <span className="text-[#E1AAFF]">Free UPI Service</span>
                    <span>P2P Friend Loans</span>
                    <span>Auto EMI Cron</span>
                    <span>Zero-Fee Foreclosure</span>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-5 py-2.5 text-xs md:text-sm font-extrabold text-gray-300 hover:text-white transition"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="px-6 py-3 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] text-[#1a0b36] font-black text-xs md:text-sm rounded-2xl hover:opacity-95 transition shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
                    >
                        <span>Launch Pro App</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center pt-20 px-4 relative z-10 max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/10 bg-[#1B1E2B]/80 backdrop-blur-md text-xs font-bold text-[#E1AAFF] shadow-xl">
                    <Sparkles className="w-4 h-4 text-[#00D1FF]" />
                    <span>Introducing Automated P2P Friend Lending & 100% Free UPI QR Service</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.08]">
                    Next-Gen UPI Payments & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF]">
                        Automated P2P Friend Loans.
                    </span>
                </h1>
                
                <p className="text-gray-300 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-medium">
                    Generate instant personal QR codes, execute atomic ACID PIN-protected transfers, and lend money to peers with automated scheduled EMI deductions. Want to settle early? Foreclose anytime with $0 charges!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-20">
                    <button 
                        onClick={() => navigate('/register')} 
                        className="px-8 py-4 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] rounded-2xl font-extrabold text-[#1a0b36] text-base hover:opacity-95 transition shadow-[0_0_40px_rgba(150,100,255,0.4)] transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Create Free Account + Get $10k Sandbox Balance</span>
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-8 py-4 bg-[#1B1E2B] hover:bg-[#222738] border border-white/10 rounded-2xl font-extrabold text-white text-base transition shadow-lg active:scale-95"
                    >
                        Sign In to Command Center
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-6xl">
                    <div className="p-8 bg-[#161922] rounded-[32px] border border-white/10 relative overflow-hidden group hover:border-[#E1AAFF]/40 transition">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] to-[#BD88FF] flex items-center justify-center mb-6 text-[#1a0b36] shadow-lg shadow-purple-500/20 group-hover:scale-110 transition">
                           <QrCode className="w-7 h-7 stroke-[2.2]" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">Free UPI QR & Scan</h3>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">
                            Every user gets a dedicated interoperable `@shivampay` UPI ID and QR code. Receive money instantly with zero platform fees.
                        </p>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-[#1C1F2E] via-[#161922] to-[#1C1F2E] rounded-[32px] border border-[#BD88FF]/40 relative overflow-hidden group hover:border-[#00D1FF]/60 transition shadow-2xl">
                        <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-500/30">
                            Core Extra Feature
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#BD88FF] flex items-center justify-center mb-6 text-[#1a0b36] shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition">
                           <HandCoins className="w-7 h-7 stroke-[2.2]" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">P2P Loans & Auto EMI</h3>
                        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-medium">
                            Lend money to friends with custom interest rates and specific monthly deduction dates. Our automated cron engine withdraws EMIs directly on time!
                        </p>
                    </div>

                    <div className="p-8 bg-[#161922] rounded-[32px] border border-white/10 relative overflow-hidden group hover:border-pink-500/40 transition">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-[#E1AAFF] flex items-center justify-center mb-6 text-[#1a0b36] shadow-lg shadow-pink-500/20 group-hover:scale-110 transition">
                           <Zap className="w-7 h-7 stroke-[2.2] fill-[#1a0b36]" />
                        </div>
                        <h3 className="text-xl font-extrabold text-white mb-2">Zero-Fee Foreclosure</h3>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-medium">
                            Borrowers can pay off the total remaining loan amount at any time with a single click. Absolutely zero early settlement penalties or hidden charges.
                        </p>
                    </div>
                </div>

                {/* Additional Highlights Footer Banner */}
                <div className="mt-12 w-full p-6 bg-[#161822] rounded-[28px] border border-white/5 flex flex-col md:flex-row items-center justify-between text-xs font-bold text-gray-400 gap-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span>ACID-Compliant MongoDB Atomicity & 256-Bit JWT Architecture</span>
                  </div>
                  <div className="flex items-center gap-2 text-pink-400">
                    <ReceiptText className="w-5 h-5" />
                    <span>Insufficent Balance Email Alerts via Nodemailer & Ethereal Mail</span>
                  </div>
                </div>
            </main>
        </div>
    );
}
