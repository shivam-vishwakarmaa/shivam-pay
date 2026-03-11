import { useState } from 'react';
import Register from './components/register';
import Login from './components/login';
import Transiction from './components/transictions';

function App() {
  const [page, setPage] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold tracking-tight">ShivamPay</h1>
          <p className="text-blue-100 mt-2 text-sm">Secure. Fast. Reliable.</p>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-8">
          {page === null && (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setPage('register')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out shadow-md"
              >
                Create Account
              </button>
              <button 
                onClick={() => setPage('login')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out border border-gray-300"
              >
                Log In
              </button>
              
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-500 text-center mb-4">Quick Send</p>
                <div className="flex items-center justify-center space-x-4">
                  {/* Mockup Quick Contact */}
                  <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition">
                    <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg mb-1">
                      G
                    </div>
                    <span className="text-xs font-medium text-gray-600">Gargi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Components */}
          {page === 'register' && <Register gotoTransictoin={() => setPage('transiction')}/>}
          {page === 'login' && <Login gotoTransictoin={() => setPage('transiction')}/>}
          {page === 'transiction' && <Transiction />}
        </div>
      </div>
    </div>
  );
}

export default App;