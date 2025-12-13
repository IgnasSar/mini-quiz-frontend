import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/MyQuizzes.css";

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => { load(); }, []);
  const load = () => api.get("/Quiz").then(res => setQuizzes(res.data)).catch(console.error);
  
  const create = async () => {
    if(!newTitle) return;
    try {
        const res = await api.post("/Quiz", { title: newTitle, description: "New Quiz" });
        navigate(`/edit-quiz/${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        
        <div className="dash-card" style={{marginBottom:'2rem', width: '100%', maxWidth:'600px'}}>
            <h2 className="dash-title">Create Quiz</h2>
            <div className="quiz-create-row">
                <input className="dash-input" style={{marginBottom:0}} placeholder="New Quiz Name" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <button className="btn-main" style={{width:'auto', marginLeft:'10px'}} onClick={create}>Create & Edit</button>
            </div>
        </div>

        <div className="dash-card" style={{width: '100%', maxWidth:'800px'}}>
            <h2 className="dash-title">Your Quizzes</h2>
            {quizzes.length === 0 && <p style={{color:'var(--text-muted)', textAlign:'center'}}>No quizzes created yet.</p>}
            {quizzes.map(q => (
                <div key={q.id} className="quiz-item">
                    <div>
                        <div className="quiz-item-title">{q.title}</div>
                        <div className="quiz-item-meta">
                            {q.questionCount} Questions • {q.isPublic ? "Public" : "Private"}
                        </div>
                    </div>
                    <button className="btn-outline" style={{width:'auto', marginTop:0, padding:'0.5rem 1.5rem'}}
                        onClick={() => navigate(`/edit-quiz/${q.id}`)}>
                        Edit Quiz
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
