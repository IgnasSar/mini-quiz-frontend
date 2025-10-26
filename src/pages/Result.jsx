import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (state?.score != null && state?.total != null) {
      setScore(state.score);
      setTotal(state.total);
      localStorage.setItem("quizResult", JSON.stringify(state));
    } else {
      const saved = JSON.parse(localStorage.getItem("quizResult") || "{}");
      if (saved.score != null && saved.total != null) {
        setScore(saved.score);
        setTotal(saved.total);
      } else {
        navigate("/quiz");
      }
    }
  }, [state, navigate]);

  const handleSendEmail = () => {
    alert(`Answers sent to ${user.email || "unknown email"}`);
  };

  const handleRestart = () => {
    localStorage.removeItem("quizResult");
    navigate("/quiz");
  };

  return (
    <div className="result-container">
      <div className="result-card">
        <h2 className="result-title">🎉 Congratulations, {user.name || "User"}!</h2>

        <p className="result-score">
          You scored <strong>{score}</strong> out of <strong>{total}</strong>.
        </p>

        <p className="result-email">
          Would you like to receive your answers by email?
          <br />
          <span>{user.email || "No email found"}</span>
        </p>

        <div className="result-actions">
          <button onClick={handleSendEmail} className="btn-primary">
            Yes, send me
          </button>
          <button onClick={handleRestart} className="btn-secondary">
            Restart Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
