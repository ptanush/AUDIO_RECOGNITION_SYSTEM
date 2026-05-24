import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./views/pages/LandingPage";
import LoginPage from "./views/pages/LoginPage";
import SignupPage from "./views/pages/SignupPage";
import HomePage from "./views/pages/HomePage";
import ResultPage from "./views/pages/ResultPage";
import HistoryPage from "./views/pages/HistoryPage";
import AboutPage from "./views/pages/AboutPage";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("ars_session");
    if (session) setUser(JSON.parse(session));
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Session (including JWT token) is already saved in localStorage by the api service
    localStorage.setItem("ars_session", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ars_session");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/login" element={!user ? <LoginPage onLogin={login} /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!user ? <SignupPage onLogin={login} /> : <Navigate to="/home" />} />

        {/* Protected routes */}
        <Route path="/home" element={user ? <HomePage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/result" element={user ? <ResultPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <HistoryPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/about" element={user ? <AboutPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}