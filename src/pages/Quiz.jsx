import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import QuestionCard from "../components/QuestionCard";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get("/Question");
        setQuestions(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (isCorrect) => {
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        navigate("/result", { state: { score: nextScore, total: questions.length } });
      }
    }, 400);
  };

  if (loading)
    return <div className="quiz-loading">Loading questions...</div>;

  if (error)
    return (
      <div className="quiz-error">
        {error}
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );

  if (!questions || questions.length === 0)
    return <div className="quiz-loading">No questions available.</div>;

  if (currentIndex >= questions.length) return null;

  return (
    <div className="quiz-container">
      <QuestionCard
        question={questions[currentIndex]}
        index={currentIndex}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
