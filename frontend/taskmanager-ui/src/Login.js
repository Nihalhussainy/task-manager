import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock, CheckCircle2, AlertCircle, Loader, Moon, Sun, Shield, Zap, BarChart3, CheckSquare } from "lucide-react";

function Login({ onLoginSuccess, onSwitchToRegister, darkMode = true, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
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
      const response = await fetch(process.env.REACT_APP_API_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      console.log("Login response status:", response.status);
      console.log("Login response data:", data);
      
      if (response.ok) {
        // Backend returns { token, user: { id, name, email } }
        if (data.user && data.user.name && data.user.email && data.token) {
          setIsSuccess(true);
          setTimeout(() => onLoginSuccess(data.user, data.token), 600);
        } else {
          setError("Invalid response format from server");
          console.error("Missing required fields in response:", data);
        }
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server is unreachable. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 flex items-center justify-center relative overflow-hidden ${
      darkMode 
        ? 'bg-black' 
        : 'bg-white'
    }`}>
      {/* Premium Dot Pattern Background - More Visible */}
      <svg className="absolute inset-0 w-full h-full transition-opacity duration-300" style={{opacity: darkMode ? 0.08 : 0.12}}>
        <defs>
          <pattern id="dots-dark" x="24" y="24" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill={darkMode ? "#ffffff" : "#000000"} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-dark)`} />
      </svg>

      {/* Animated gradient orbs */}
      {darkMode && (
        <>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}

      {!darkMode && (
        <>
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-0 relative z-10 h-screen lg:h-auto lg:rounded-3xl overflow-hidden lg:shadow-2xl">
        {/* Welcome Panel - Left Side */}
        <div className={`w-full lg:w-5/12 hidden lg:flex flex-col items-center justify-center px-12 py-16 relative overflow-hidden transition-all duration-300 ${
          darkMode
            ? 'bg-black/80 backdrop-blur-sm border border-slate-800/50'
            : 'bg-white/80 backdrop-blur-sm border border-slate-300/50'
        }`}>
          <div className="relative z-10 text-center space-y-10 max-w-md">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <CheckSquare size={28} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
              </div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>TaskFlow</h1>
            </div>

            <div className="space-y-3">
              <h2 className={`text-4xl font-bold tracking-tight leading-tight transition-colors duration-300 ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Welcome<br/>Back
              </h2>
              <p className={`text-base leading-relaxed transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Sign in to manage your tasks and boost productivity
              </p>
            </div>

            <div className="space-y-4 pt-6">
              {[
                { icon: Shield, text: "Secure authentication" },
                { icon: Zap, text: "Fast and responsive" },
                { icon: BarChart3, text: "Track your progress" }
              ].map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div key={idx} className={`flex items-center gap-4 text-left transition-colors duration-300 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    <IconComponent size={24} className="text-indigo-500 shrink-0" />
                    <span className="font-medium text-sm">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Panel - Right Side */}
        <div className={`w-full lg:w-7/12 flex flex-col items-center justify-center p-8 lg:p-12 relative transition-all duration-300 ${
          darkMode
            ? 'bg-black/60 backdrop-blur-sm'
            : 'bg-white/60 backdrop-blur-sm'
        }`}>
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className={`text-center lg:hidden mb-10 space-y-4`}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <CheckSquare size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                </div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>TaskFlow</h1>
              </div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Welcome Back</h2>
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Sign in to your dashboard</p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`absolute top-6 right-6 p-2.5 rounded-lg transition-all duration-300 ${
                darkMode
                  ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-indigo-400'
                  : 'bg-slate-300/50 hover:bg-slate-400/50 text-slate-600 hover:text-indigo-600'
              }`}
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Form Card */}
            <div className={`relative transition-all duration-500 transform ${isSuccess ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
              <form 
                onSubmit={handleSubmit} 
                className={`relative border rounded-2xl p-8 shadow-2xl transition-all space-y-6 ${
                  darkMode
                    ? 'bg-black/80 backdrop-blur-md border-slate-800/60'
                    : 'bg-white/90 backdrop-blur-md border-slate-300/60'
                }`}
              >
                {/* Error Message */}
                {error && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 animate-shake border transition-all duration-300 ${
                    darkMode
                      ? 'bg-red-500/15 border-red-500/40'
                      : 'bg-red-50/80 border-red-300/60'
                  }`}>
                    <AlertCircle size={18} className={`shrink-0 mt-0.5 transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <div>
                      <p className={`text-sm font-semibold transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Login Error</p>
                      <p className={`text-xs mt-0.5 transition-colors duration-300 ${darkMode ? 'text-red-300/80' : 'text-red-600/80'}`}>{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Email</label>
                    <div className="relative group">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={18} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        className={`w-full py-3 pl-10 pr-4 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          darkMode
                            ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20 placeholder-slate-600'
                            : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20 placeholder-slate-500'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Password</label>
                    <div className="relative group">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className={`w-full py-3 pl-10 pr-11 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          darkMode
                            ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20 placeholder-slate-600'
                            : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20 placeholder-slate-500'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          darkMode
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button 
                    type="submit"
                    disabled={loading || isSuccess || !email || !password}
                    className={`w-full mt-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm uppercase tracking-wide ${
                      darkMode
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 disabled:from-indigo-500/40 disabled:to-indigo-700/40 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:shadow-none'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-400/40 disabled:to-indigo-500/40 text-white shadow-indigo-400/30 hover:shadow-indigo-500/40 disabled:shadow-none'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Success!</span>
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center space-y-2">
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                Don't have an account?{" "}
                <button 
                  onClick={onSwitchToRegister}
                  disabled={loading}
                  className={`font-semibold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;