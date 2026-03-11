import { useState } from 'react';

export default function Login({ gotoTransictoin }) {
  // Keep your existing state logic!
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Your existing backend API call (axios/fetch) goes here
    console.log("Logging in...", { username, password });
    
    // On success:
    // gotoTransictoin();
  };

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
            placeholder="••••••••"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-4 shadow-md"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}