import React from "react";
import { Link } from "react-router-dom";

export default function TopNav() {
  return (
    <nav className="topnav">
      <Link to="/quiz" className="logo">
        Mini Quiz
      </Link>

      <div className="nav-actions">
        <Link to="/quiz" className="btn">
          Start Quiz
        </Link>
        <Link to="/add" className="btn-primary">
          + Add Question
        </Link>
        <Link to="/delete" className="btn">
          🗑 Delete Question
        </Link>
      </div>
    </nav>
  );
}
