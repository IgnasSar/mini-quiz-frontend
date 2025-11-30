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

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-logo">MiniQuiz</Link>
      <div className="nav-user">
        <div className="nav-info">
            <span className="nav-name">{user.name}</span>
            <span className="nav-email">{user.email}</span>
        </div>
        <img src={sessionStorage.getItem("currentAvatar") || user.avatarUrl} alt="Profile" className="nav-avatar"/>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}
