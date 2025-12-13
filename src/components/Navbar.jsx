import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (!user) return null;

  const currentAvatar = sessionStorage.getItem("currentAvatar") || user.avatarUrl;
  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  return (
    <nav className="navbar">
      <div className="nav-left">
          <Link to="/dashboard" className="nav-logo">MiniQuiz</Link>
          <Link to="/my-quizzes" className="nav-link">My Quizzes</Link>
          <Link to="/community" className="nav-link">Community Library</Link>
      </div>
      <div className="nav-user">
        <div className="nav-info">
            <span className="nav-name">{user.name}</span>
        </div>
        <img 
            src={currentAvatar} 
            alt="Profile" 
            className="nav-avatar"
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
        />
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}
