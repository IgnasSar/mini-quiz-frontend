// src/pages/Quiz.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import QuestionCard from "../components/QuestionCard";
import { useNavigate } from "react-router-dom";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchQuestions = async () => {
      try {
        const res = await api.get("/Question");
        if (Array.isArray(res.data) && res.data.length > 0) {
          if (mounted) setQuestions(res.data);
        } else {
          setError("⚠️ No questions found in the database.");
        }
      } catch (err) {
        console.error(err);
        setError("❌ Failed to load questions from the server.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchQuestions();
    return () => (mounted = false);
  }, []);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (loading) return <div className="quiz-loading">Loading questions...</div>;

  if (error || questions.length === 0) {
    return (
      <div className="quiz-error">
        <h2>{error || "⚠️ No questions available."}</h2>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (finished) {
    // store into localStorage so Result page can read after reload
    const state = { score, total: questions.length };
    localStorage.setItem("quizResult", JSON.stringify(state));
    navigate("/result", { state });
    return null;
  }

  return (
    <div className="quiz-container">
      <QuestionCard
        question={questions[current]}
        index={current}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
