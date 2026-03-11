import axios from 'axios';
import { useState } from "react";

export default function Register({ gotoTransictoin }) {
  const [form, setFormdata] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegiester = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    try {
        setIsLoading(true);
        setResponse("Creating your account...");

        const Registercall = await axios.post(
          "http://localhost:3000/pytm/register/enter",
          form
        );
        
        setResponse(`Welcome, ${Registercall.data.user.name}!`);
        setIsLoading(false);
        
        // Add a tiny delay so the user sees the success message before jumping
        setTimeout(() => {
            gotoTransictoin();
        }, 1000);
        
    } catch (err) {
        setIsLoading(false);
        setResponse(err.response?.data?.message || "Something went wrong, try again");
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Join ShivamPay</h2>
      
      <form onSubmit={handleRegiester} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={(e) => setFormdata({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            placeholder="johndoe123"
            required
            value={form.username}
            onChange={(e) => setFormdata({ ...form, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setFormdata({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-gray-800"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-4 shadow-md disabled:opacity-70"
        >
          {isLoading ? 'Processing...' : 'Register'}
        </button>

        {/* Display Success or Error Messages */}
        {response && (
            <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${response.includes("Welcome") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {response}
            </div>
        )}
      </form>
    </div>
  );
}