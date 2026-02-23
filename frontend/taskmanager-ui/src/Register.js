import React, { useState, useEffect } from "react";
import { UserPlus, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle2, Loader, Moon, Sun, Eye, EyeOff, Target, Sparkles, Clock, CheckSquare } from "lucide-react"; // Removed unused Shield import

function Register({ onSuccess, onSwitchToLogin, darkMode = true, onToggleTheme }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [validations, setValidations] = useState({ name: false, email: false, password: false, confirmPassword: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  const validateForm = (data) => {
    const passwordsMatch = data.password === data.confirmPassword && data.password.length > 0;
    const strength = calculatePasswordStrength(data.password);
    
    const newValidations = {
      name: data.name.trim().length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
      password: data.password.length >= 6,
      confirmPassword: passwordsMatch
    };
    setValidations(newValidations);
    setPasswordStrength(strength);
    return newValidations;
  };

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = () => {
    const strengths = ['Weak', 'Fair', 'Good', 'Strong'];
    return strengths[passwordStrength] || 'Weak';
  };

  const getPasswordStrengthColor = () => {
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-emerald-500'];
    return colors[passwordStrength] || 'text-red-500';
  };

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    validateForm(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentValidations = validateForm(formData);
    
    if (!currentValidations.name) {
      setError("Please enter your full name");
      return;
    }
    if (!currentValidations.email) {
      setError("Please enter a valid email address");
      return;
    }
    if (!currentValidations.password) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!currentValidations.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });
      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => onSuccess(), 600);
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Connection failed. Please check your internet and try again.");
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
          <pattern id="dots-reg" x="24" y="24" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill={darkMode ? "#ffffff" : "#000000"} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-reg)`} />
      </svg>

      {/* Animated gradient orbs */}
      {darkMode && (
        <>
          <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}

      {!darkMode && (
        <>
          <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-100/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch gap-0 relative z-10 h-screen lg:h-auto lg:rounded-3xl overflow-hidden lg:shadow-2xl">
        {/* Welcome Panel - Left Side */}
        <div className={`w-full lg:w-5/12 hidden lg:flex flex-col items-center justify-center px-12 py-16 relative overflow-hidden transition-all duration-300 ${
          darkMode
            ? 'bg-black/80 backdrop-blur-sm border border-slate-800/50'
            : 'bg-white/80 backdrop-blur-sm border border-slate-300/50'
        }`}>
          <div className="relative z-10 text-center space-y-8 max-w-md">
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
                Create<br/>Account
              </h2>
              <p className={`text-base leading-relaxed transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Join TaskFlow and start organizing your tasks efficiently
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { icon: Target, text: "Organize tasks" },
                { icon: Clock, text: "Track deadlines" },
                { icon: Sparkles, text: "Boost productivity" }
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
            <div className={`text-center lg:hidden mb-8 space-y-3`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <CheckSquare size={22} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                </div>
                <h1 className={`text-xl font-bold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>TaskFlow</h1>
              </div>
              <h2 className={`text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Create Account</h2>
              <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Join TaskFlow to get started</p>
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
                className={`relative border rounded-2xl p-8 shadow-2xl transition-all space-y-5 ${
                  darkMode
                    ? 'bg-black/80 backdrop-blur-md border-slate-800/60'
                    : 'bg-white/90 backdrop-blur-md border-slate-300/60'
                }`}
              >
                {/* Error Message */}
                {error && (
                  <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 animate-shake border transition-all duration-300 ${
                    darkMode
                      ? 'bg-red-500/15 border-red-500/40'
                      : 'bg-red-50/80 border-red-300/60'
                  }`}>
                    <AlertCircle size={16} className={`shrink-0 mt-0.5 transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                    <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Name</label>
                      {formData.name && (
                        <span className={`text-xs font-semibold transition-colors duration-300 ${validations.name ? 'text-emerald-500' : 'text-red-500'}`}>
                          {validations.name ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={16} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        disabled={loading}
                        className={`w-full py-2.5 pl-10 pr-3 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          formData.name && !validations.name
                            ? darkMode
                              ? 'bg-slate-800/50 border-2 border-red-500/60 text-slate-100 focus:border-red-500 focus:ring-red-500/20'
                              : 'bg-slate-100/80 border-2 border-red-400/60 text-slate-900 focus:border-red-400 focus:ring-red-400/20'
                            : darkMode
                              ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20'
                              : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Email</label>
                      {formData.email && (
                        <span className={`text-xs font-semibold transition-colors duration-300 ${validations.email ? 'text-emerald-500' : 'text-red-500'}`}>
                          {validations.email ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={16} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => handleChange('email', e.target.value)}
                        disabled={loading}
                        className={`w-full py-2.5 pl-10 pr-3 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          formData.email && !validations.email
                            ? darkMode
                              ? 'bg-slate-800/50 border-2 border-red-500/60 text-slate-100 focus:border-red-500 focus:ring-red-500/20'
                              : 'bg-slate-100/80 border-2 border-red-400/60 text-slate-900 focus:border-red-400 focus:ring-red-400/20'
                            : darkMode
                              ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20'
                              : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Password</label>
                      {formData.password && (
                        <span className={`text-xs font-semibold transition-colors duration-300 ${getPasswordStrengthColor()}`}>
                          {getPasswordStrengthText()}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={e => handleChange('password', e.target.value)}
                        disabled={loading}
                        className={`w-full py-2.5 pl-10 pr-10 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          formData.password && !validations.password
                            ? darkMode
                              ? 'bg-slate-800/50 border-2 border-red-500/60 text-slate-100 focus:border-red-500 focus:ring-red-500/20'
                              : 'bg-slate-100/80 border-2 border-red-400/60 text-slate-900 focus:border-red-400 focus:ring-red-400/20'
                            : darkMode
                              ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20'
                              : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20'
                        }`}
                        placeholder="Create a password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 disabled:opacity-50 ${
                          darkMode
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Confirm</label>
                      {formData.confirmPassword && (
                        <span className={`text-xs font-semibold transition-colors duration-300 ${validations.confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                          {validations.confirmPassword ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                        darkMode
                          ? 'text-slate-500 group-focus-within:text-indigo-400'
                          : 'text-slate-400 group-focus-within:text-indigo-600'
                      }`} size={16} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={e => handleChange('confirmPassword', e.target.value)}
                        disabled={loading}
                        className={`w-full py-2.5 pl-10 pr-10 rounded-lg outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm ${
                          formData.confirmPassword && !validations.confirmPassword
                            ? darkMode
                              ? 'bg-slate-800/50 border-2 border-red-500/60 text-slate-100 focus:border-red-500 focus:ring-red-500/20'
                              : 'bg-slate-100/80 border-2 border-red-400/60 text-slate-900 focus:border-red-400 focus:ring-red-400/20'
                            : darkMode
                              ? 'bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:border-indigo-500/80 focus:ring-indigo-500/20'
                              : 'bg-slate-100/80 border border-slate-300/50 text-slate-900 focus:border-indigo-400/80 focus:ring-indigo-400/20'
                        }`}
                        placeholder="Confirm password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 disabled:opacity-50 ${
                          darkMode
                            ? 'text-slate-500 hover:text-slate-300'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || isSuccess || !validations.name || !validations.email || !validations.password || !validations.confirmPassword}
                    className={`w-full py-3 mt-4 font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-95 text-sm uppercase tracking-wide ${
                      darkMode
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 disabled:from-indigo-500/40 disabled:to-indigo-700/40 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:shadow-none'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-indigo-400/40 disabled:to-indigo-500/40 text-white shadow-indigo-400/30 hover:shadow-indigo-500/40 disabled:shadow-none'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Created!</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Back to Login */}
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              className={`w-full mt-6 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg ${
                darkMode
                  ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800/30'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200/30'
              }`}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;