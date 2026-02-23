import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState("LOGIN");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Default to light mode (false)

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("theme");
    
    // Initialize theme: use saved theme if available, otherwise default to light (false)
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(false); // Light mode is default
      localStorage.setItem("theme", "light");
    }
    
    if (token && storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (err) {
        // If parsing fails, clear invalid data
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setView("LOGIN");
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} darkMode={darkMode} onToggleTheme={toggleTheme} />;
  }

  return (
    <>
      {view === "LOGIN" ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setView("REGISTER")}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Register 
          onSuccess={() => setView("LOGIN")} 
          onSwitchToLogin={() => setView("LOGIN")}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />
      )}
    </>
  );
}

export default App;