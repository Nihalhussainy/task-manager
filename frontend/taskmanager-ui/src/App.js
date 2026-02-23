import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState("LOGIN");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("theme");
    
    console.log("=== APP INIT ===");
    console.log("Token found:", !!token);
    console.log("User found:", !!storedUser);
    
    // Initialize theme
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(false);
      localStorage.setItem("theme", "light");
    }
    
    if (token && storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ User parsed:", parsedUser.name);
        
        // Decode and check token
        const decoded = decodeToken(token);
        console.log("Token decoded:", decoded);
        
        if (decoded && !isTokenExpired(token)) {
          console.log("✅ Token is valid - RESTORING SESSION");
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          console.log("❌ Token is expired or invalid - CLEARING SESSION");
          clearSession();
          setView("LOGIN");
        }
      } catch (err) {
        console.error("❌ Error:", err.message);
        clearSession();
        setView("LOGIN");
      }
    } else {
      console.log("No token/user found - showing login");
      setIsLoggedIn(false);
      setView("LOGIN");
    }
  }, []);

  // Decode JWT without validation
  const decodeToken = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.log("Invalid token format (not 3 parts)");
        return null;
      }

      let payload = parts[1];
      // Add padding if needed
      payload += '='.repeat((4 - payload.length % 4) % 4);
      
      const decoded = JSON.parse(atob(payload));
      console.log("Decoded payload:", {
        sub: decoded.sub,
        iat: new Date(decoded.iat * 1000),
        exp: new Date(decoded.exp * 1000),
        expiresIn: Math.round((decoded.exp - Math.floor(Date.now() / 1000)) / 60) + " minutes"
      });
      
      return decoded;
    } catch (err) {
      console.error("Failed to decode token:", err.message);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      let payload = parts[1];
      payload += '='.repeat((4 - payload.length % 4) % 4);
      
      const decoded = JSON.parse(atob(payload));
      const currentTime = Math.floor(Date.now() / 1000);
      const expired = decoded.exp < currentTime;
      
      console.log("Expiration check:", {
        currentTime: new Date(currentTime * 1000),
        expiresAt: new Date(decoded.exp * 1000),
        isExpired: expired
      });
      
      return expired;
    } catch (err) {
      console.error("Error checking expiration:", err.message);
      return true;
    }
  };

  const clearSession = () => {
    console.log("Clearing session...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = (userData, token) => {
    console.log("=== LOGIN SUCCESS ===");
    
    // Validate required fields to prevent undefined errors
    if (!userData || !userData.name || !userData.email || !token) {
      console.error("Invalid login data - missing fields:", { userData, token });
      return;
    }
    
    console.log("User:", userData.name);
    console.log("Token received: Yes");
    
    const decoded = decodeToken(token);
    if (decoded) {
      console.log("Token expires in:", Math.round((decoded.exp - Math.floor(Date.now() / 1000)) / 60) + " minutes");
    }
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("=== LOGOUT CALLED ===");
    clearSession();
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