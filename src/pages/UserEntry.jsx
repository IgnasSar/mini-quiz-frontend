import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function UserEntry() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post("/User", { name, email});
      const user = res?.data || { id: null, name, email};
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/quiz");
    } catch (err) {
      console.error(err);
      const fallbackUser = { id: null, name, email};
      localStorage.setItem("user", JSON.stringify(fallbackUser));
      setError("Server connection failed — using local fallback. Proceeding to quiz.");
      setTimeout(() => navigate("/quiz"), 900);
    }
  };

  return (
    <div className="entry-container">
      <div className="entry-card">
        <h1 className="entry-title">Mini Quiz</h1>
        <p className="entry-subtitle">Enter your details to begin</p>

        {error && <div className="entry-error">{error}</div>}

        <form onSubmit={handleSubmit} className="entry-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
          <button type="submit" className="entry-btn">
            Start Quiz
          </button>
        </form>
      </div>
    </div>
  );
}
