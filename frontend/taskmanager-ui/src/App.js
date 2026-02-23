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
    
    console.log("App init - Token:", token ? "✓ Found" : "✗ Not found");
    console.log("App init - User:", storedUser ? "✓ Found" : "✗ Not found");
    
    // Initialize theme: use saved theme if available, otherwise default to light (false)
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(false); // Light mode is default
      localStorage.setItem("theme", "light");
    }
    
    if (token && storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("App init - User parsed successfully:", parsedUser.name);
        
        // Check if token is expired before restoring session
        if (isTokenExpired(token)) {
          console.log("Token is expired - clearing session");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setView("LOGIN");
        } else {
          console.log("Token is valid - restoring session");
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (err) {
        // If parsing fails, clear invalid data
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setView("LOGIN");
      }
    } else {
      // No valid token/user, stay on login
      console.log("App init - No valid session, showing login");
      setIsLoggedIn(false);
      setView("LOGIN");
    }
  }, []);

  // Decode JWT and check if it's expired
  const isTokenExpired = (token) => {
    try {
      // JWT format: header.payload.signature
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid token format");
        return true;
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      console.log("Token payload:", payload);

      // Check expiration time (exp is in seconds, Date.now() is in milliseconds)
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < currentTime;

      if (isExpired) {
        console.log("Token expired at:", new Date(payload.exp * 1000));
        console.log("Current time:", new Date(currentTime * 1000));
      }

      return isExpired;
    } catch (err) {
      console.error("Error decoding token:", err);
      return true; // Treat invalid tokens as expired
    }
  };

  const handleLoginSuccess = (userData, token) => {
    console.log("Login success - Storing token:", token ? "✓ Token received" : "✗ No token");
    console.log("Login success - User data:", userData?.name || "No user name");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("Login success - Stored in localStorage");
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("LOGOUT called - clearing session");
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