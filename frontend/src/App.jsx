import { useState, useEffect } from 'react';
import Register from './components/register';
import Login from './components/login';
import Transiction from './components/transictions';

function App() {
  const [page, setPage] = useState('landing');
  
  // Check if token exists on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setPage('transiction');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setPage('login');
  };

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {page === 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] animate-blob"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px] animate-blob animation-delay-2000"></div>
           
           <div className="relative z-10 text-center space-y-8 max-w-lg">
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 via-indigo-600 to-indigo-800 rounded-[32px] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4 animate-in zoom-in duration-700">
                <span className="text-white text-4xl font-black tracking-tighter">SP</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  ShivamPay.
                </h1>
                <p className="text-gray-400 text-lg sm:text-xl px-4 font-medium leading-relaxed">
                  The future of payments is here. Fast, secure, and beautiful commerce for everyone.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8 animate-in slide-in-from-bottom-8 duration-1000">
                <button 
                  onClick={() => setPage('register')}
                  className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => setPage('login')}
                  className="px-10 py-4 bg-gray-800/50 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all border border-white/10 active:scale-95 backdrop-blur-md"
                >
                  Existing User
                </button>
              </div>
           </div>
        </div>
      )}

      {page === 'register' && (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
          <Register 
            gotoTransictoin={() => setPage('transiction')} 
            onGoToLogin={() => setPage('login')}
          />
        </div>
      )}

      {page === 'login' && (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
          <Login 
            gotoTransictoin={() => setPage('transiction')} 
            onGoToRegister={() => setPage('register')}
          />
        </div>
      )}

      {page === 'transiction' && <Transiction onLogout={handleLogout} />}
    </div>
  );
}

export default App;