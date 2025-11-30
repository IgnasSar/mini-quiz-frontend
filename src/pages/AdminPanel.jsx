import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Admin") navigate("/dashboard");
    else fetchQuestions();
  }, [navigate]);

  const fetchQuestions = async () => {
    try { const res = await api.get("/Question"); setQuestions(res.data); } catch {}
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete?")) { await api.delete(`/Question/${id}`); fetchQuestions(); }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Questions</h1>
        <button className="add-btn-main" onClick={() => navigate("/add-question")}>+ Add</button>
      </div>
      <div>
        {questions.map(q => (
            <div key={q.id} className="q-item">
                <div className="q-info">
                    {q.imageName && <img src={`http://localhost:5198/static/images/${q.imageName}`} className="q-thumb" alt="" />}
                    <div><strong>{q.questionDescription}</strong><br/><small style={{color:'#94a3b8'}}>Ans: {q.answer}</small></div>
                </div>
                <button className="del-btn" onClick={() => handleDelete(q.id)}>Delete</button>
            </div>
        ))}
      </div>
    </div>
  );
}
