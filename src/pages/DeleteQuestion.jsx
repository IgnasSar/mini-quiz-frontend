import React, { useEffect, useState } from "react";
import api from "../api";

export default function DeleteQuestion() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchQuestions = async () => {
    try {
      const res = await api.get("/Question");
      setQuestions(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      await api.delete(`/Question/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setMessage("Question deleted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete question.");
    }
  };

  if (loading) return <div className="quiz-loading">Loading questions...</div>;

  return (
    <div className="add-container">
      <div className="add-card">
        <h2
          className="add-title"
          style={{ color: "#7c3aed", marginBottom: "16px" }}
        >
          Delete Questions
        </h2>

        {message && (
          <p className="text-slate-300 mb-4 font-medium text-sm">{message}</p>
        )}

        {questions.length === 0 ? (
          <p className="text-slate-400">No questions available.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {questions.map((q) => (
              <li
                key={q.id}
                className="flex items-center justify-between border border-slate-700 rounded-lg p-4 bg-[#0f172a] hover:bg-[#1e293b] transition-colors"
              >
                <div className="flex flex-col flex-grow pr-4">
                  <span className="text-slate-100 font-medium text-base">
                    {q.questionDescription}
                  </span>
                  <div className="text-slate-400 text-sm mt-1">
                    Options: {q.option1}, {q.option2}, {q.option3}, {q.option4}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="btn-secondary"
                    style={{
                      padding: "8px 16px",
                      fontWeight: "500",
                      border: "1px solid #475569",
                      minWidth: "90px",
                      textAlign: "center",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
