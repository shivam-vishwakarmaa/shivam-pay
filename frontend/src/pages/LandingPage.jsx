import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, HandCoins, QrCode, ArrowRight, Sparkles, ReceiptText, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0A0D14] min-h-screen text-slate-100 font-sans overflow-x-hidden pb-24 relative selection:bg-purple-500 selection:text-white">
            
            {/* Background Kinetic Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
               <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
               <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />
               <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />
            </div>

            {/* Top Glassmorphic Navbar */}
            <header className="sticky top-0 z-40 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] p-[2px] shadow-lg shadow-purple-500/20">
                     <div className="w-full h-full bg-[#121520] rounded-[14px] flex items-center justify-center font-black text-[#E1AAFF] text-base tracking-tight">
                        SP
                     </div>
                  </div>
                  <span className="text-xl md:text-2xl font-black tracking-tight text-white">
                      ShivamPay<span className="text-[#00D1FF] font-bold">.</span>
                  </span>
                </div>

                <div className="hidden lg:flex items-center gap-8 font-bold text-xs uppercase tracking-wider text-slate-400">
                    <span className="text-[#E1AAFF] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Free UPI Service</span>
                    <span className="hover:text-white transition">P2P Friend Loans</span>
                    <span className="hover:text-white transition">Auto EMI Engine</span>
                    <span className="text-emerald-400 font-extrabold">0% Fee Foreclosure</span>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-4 py-2.5 text-xs md:text-sm font-bold text-slate-300 hover:text-white transition active:scale-95"
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="px-5 py-2.5 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] text-[#140C28] font-black text-xs md:text-sm rounded-xl hover:opacity-95 transition shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5"
                    >
                        <span>Launch App</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <main className="max-w-5xl mx-auto px-4 pt-16 md:pt-24 text-center relative z-10">
                <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-xs font-extrabold text-[#E1AAFF] shadow-inner">
                    <Sparkles className="w-4 h-4 text-[#00D1FF] animate-spin" />
                    <span>Next-Generation Automated P2P Lending & Free UPI Ecosystem</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.08] max-w-4xl mx-auto text-white">
                    Instant UPI Payments & <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF]">
                        Automated Friend Loans.
                    </span>
                </h1>
                
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Generate instant personal QR codes, execute atomic PIN-protected transfers, and lend funds to trusted peers with automated monthly EMI withdrawals. Want early settlement? Foreclose anytime with $0 charges!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <button 
                        onClick={() => navigate('/register')} 
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#E1AAFF] via-[#BD88FF] to-[#00D1FF] rounded-2xl font-extrabold text-[#140C28] text-sm sm:text-base hover:opacity-95 transition shadow-[0_0_35px_rgba(150,100,255,0.35)] transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Create Free Account ($10k Sandbox Balance)</span>
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="w-full sm:w-auto px-8 py-4 bg-[#181C26] hover:bg-[#202533] border border-white/10 rounded-2xl font-bold text-white text-sm sm:text-base transition shadow-lg active:scale-95"
                    >
                        Sign In to Command Center
                    </button>
                </div>

                {/* Live Architecture Badge Box */}
                <div className="p-6 bg-[#121622] rounded-[28px] border border-white/10 shadow-2xl mb-20 max-w-4xl mx-auto text-left flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 inline" /> Production ACID Atomicity Active
                    </span>
                    <p className="text-xs text-slate-400 font-medium">
                      Built on Express, MongoDB Atlas & Vite React with real-time zero-fee early loan settlement.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold">
                    <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Automated EMI Cron
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
                      <ReceiptText className="w-3.5 h-3.5" /> Insufficient Balance Email Alerts
                    </span>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-5xl mx-auto">
                    <div className="p-8 bg-[#131722] rounded-[32px] border border-white/10 hover:border-[#E1AAFF]/40 transition duration-300 shadow-xl flex flex-col justify-between group">
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E1AAFF] to-[#BD88FF] flex items-center justify-center mb-6 text-[#140C28] shadow-lg shadow-purple-500/20 group-hover:scale-110 transition">
                             <QrCode className="w-6 h-6 stroke-[2.3]" />
                          </div>
                          <h3 className="text-lg font-black text-white mb-2">Free UPI QR & Scan</h3>
                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                              Every account gets a dedicated `@shivampay` ID and interactive SVG QR code. Receive money instantly without hidden fees.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-[#E1AAFF] font-bold">
                          ● Contactless Pay Directory Included
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-b from-[#181D2D] via-[#141825] to-[#141825] rounded-[32px] border border-[#00D1FF]/40 hover:border-[#00D1FF] transition duration-300 shadow-2xl flex flex-col justify-between group relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-[#00D1FF]/20 text-[#00D1FF] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#00D1FF]/30">
                            Core Feature
                        </div>
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#BD88FF] flex items-center justify-center mb-6 text-[#140C28] shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition">
                             <HandCoins className="w-6 h-6 stroke-[2.3]" />
                          </div>
                          <h3 className="text-lg font-black text-white mb-2">P2P Loans & Auto EMI</h3>
                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                              Lend money to friends with custom interest rates and specific monthly due dates. Our automated midnight cron engine withdraws EMIs precisely on schedule!
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-cyan-300 font-bold">
                          ● Automated Ethereal Email Warnings
                        </div>
                    </div>

                    <div className="p-8 bg-[#131722] rounded-[32px] border border-white/10 hover:border-pink-500/40 transition duration-300 shadow-xl flex flex-col justify-between group">
                        <div>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-[#E1AAFF] flex items-center justify-center mb-6 text-[#140C28] shadow-lg shadow-pink-500/20 group-hover:scale-110 transition">
                             <Zap className="w-6 h-6 stroke-[2.3] fill-[#140C28]" />
                          </div>
                          <h3 className="text-lg font-black text-white mb-2">Zero-Fee Foreclosure</h3>
                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                              Borrowers can clear their entire remaining balance at any time with a single click. Absolutely $0 early closure penalties or penalty interest.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-emerald-400 font-bold">
                          ● 100% Fee-Free Prepayment
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
