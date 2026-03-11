import { useState } from "react";
import axios from "axios";

export default function Login({ gotoTransictoin }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [res, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on form submit
    setIsLoading(true);
    setResponse("Logging in...");

    try {
      const fecthLogin = await axios.put(
        "http://localhost:3000/pytm/login/enter",
        form,
      );

      setResponse(`Welcome back!`);
      localStorage.setItem("token", fecthLogin.data.token);
      setIsLoading(false);

      // Add a tiny delay so the user sees the success message
      setTimeout(() => {
        gotoTransictoin();
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setResponse(
        err.response?.data?.message || "Something went wrong, try again",
      );
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Welcome Back
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-800"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-4 shadow-md disabled:opacity-70"
        >
          {isLoading ? "Processing..." : "Sign In"}
        </button>

        {/* Display Success or Error Messages */}
        {res && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${res.includes("Welcome") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {res}
          </div>
        )}
      </form>
    </div>
  );
}
