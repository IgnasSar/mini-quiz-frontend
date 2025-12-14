import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/MyQuizzes.css";

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => api.get("/Quiz").then(res => setQuizzes(res.data)).catch(console.error);
  
  const create = async () => {
    if(!newTitle) return;
    try {
        const res = await api.post("/Quiz", { title: newTitle, description: "New Quiz", questionCount: 0, isPublic: false, timesPlayed: 0, creatorName: "" });
        navigate(`/edit-quiz/${res.data.id}`);
    } catch (e) { console.error(e); }
  };

  const handleAiCreate = async () => {
      if(!aiPrompt.trim()) return;
      setAiLoading(true);
      try {
          const res = await api.post("/Quiz/generate-quiz-ai", { topic: aiPrompt });
          setAiPrompt("");
          setShowAiModal(false);
          navigate(`/edit-quiz/${res.data.id}`);
      } catch (err) {
          alert("AI Generation failed. Please try again.");
      } finally {
          setAiLoading(false);
      }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        
        <div className="create-header-card">
            <h2 className="dash-title">Create New Quiz</h2>
            <div className="create-actions-row">
                <div className="manual-create">
                    <input 
                        className="dash-input" 
                        placeholder="Quiz Title" 
                        value={newTitle} 
                        onChange={e => setNewTitle(e.target.value)} 
                    />
                    <button className="btn-main" style={{width:'auto', padding:'0 1.5rem', borderRadius:'8px'}} onClick={create}>CREATE</button>
                </div>
                
                <button className="btn-ai-standard" onClick={() => setShowAiModal(true)}>
                    <span>✨</span> Generate with AI
                </button>
            </div>
        </div>

        <div className="dash-card" style={{width: '100%', maxWidth:'100%'}}>
            <h2 className="dash-title" style={{marginBottom:'2rem', textAlign:'left', paddingLeft:'0.5rem'}}>Your Library</h2>
            {quizzes.length === 0 && <p style={{color:'var(--text-muted)', textAlign:'center', padding:'2rem'}}>No quizzes created yet.</p>}
            
            <div className="quiz-grid">
                {quizzes.map(q => (
                    <div key={q.id} className="quiz-card">
                        <div className="quiz-card-header">
                            <div className="quiz-card-title">{q.title}</div>
                            <span className="quiz-status-badge">{q.isPublic ? "Public" : "Private"}</span>
                        </div>
                        <div className="quiz-card-stats">
                            <span>{q.questionCount} Questions</span>
                            <span>{q.timesPlayed} Plays</span>
                        </div>
                        <div className="quiz-card-actions">
                            <button className="edit-btn-card" onClick={() => navigate(`/edit-quiz/${q.id}`)}>
                                Edit Quiz
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {showAiModal && (
            <div className="modal-overlay">
                <div className="ai-modal">
                    <div className="ai-header">
                        <h2>AI Quiz Creator</h2>
                        <button className="close-btn-modal" onClick={() => setShowAiModal(false)}>✕</button>
                    </div>
                    <div className="ai-body">
                        <p>Describe your quiz topic:</p>
                        <textarea 
                            className="input-styled" 
                            rows="4"
                            placeholder="e.g. A difficult quiz about 80s rock bands..." 
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            autoFocus
                        />
                        <button className="btn-main ai-submit" onClick={handleAiCreate} disabled={aiLoading}>
                            {aiLoading ? "Generating..." : "Generate Quiz"}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
