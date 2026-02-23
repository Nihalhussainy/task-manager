import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader,
  Moon,
  Sun,
  CheckSquare
} from "lucide-react";

function Login({ onLoginSuccess, onSwitchToRegister, darkMode = true, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        transition: background-color 0.3s ease, border-color 0.3s ease,
                    color 0.3s ease, box-shadow 0.3s ease;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      );

      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        const userData = {
          name: data.name,
          email: data.email
        };

        onLoginSuccess(userData, data.token);
      } else {
        setError(typeof data === "string" ? data : data.message || "Login failed");
      }
    } catch (err) {
      setError("Server is unreachable. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-lg ${
          darkMode
            ? "bg-slate-800 text-slate-400 hover:text-indigo-400"
            : "bg-slate-200 text-slate-600 hover:text-indigo-600"
        }`}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border transition-all ${
          darkMode
            ? "bg-black/80 border-slate-800"
            : "bg-white border-slate-300"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <CheckSquare size={26} className="text-indigo-500" />
          <h2 className="text-2xl font-bold">TaskFlow Login</h2>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 border ${
              darkMode
                ? "bg-red-500/15 border-red-500/40 text-red-400"
                : "bg-red-50 border-red-300 text-red-600"
            }`}
          >
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none bg-transparent"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none bg-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center">
          Don’t have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-500 font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;