import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Community.css";

export default function CommunityLibrary() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (term = "") => {
    setLoading(true);
    try {
        const res = await api.get(`/Library/public?search=${term}`);
        setQuizzes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
      setSearch(e.target.value);
      load(e.target.value);
  };

  const openPreview = async (quiz) => {
      setSelectedQuiz(quiz);
      setLoadingPreview(true);
      try {
          const res = await api.get(`/Library/public/${quiz.id}`);
          setPreviewQuestions(res.data.questions);
      } catch (e) {
          console.error(e);
          setPreviewQuestions([]);
      } finally {
          setLoadingPreview(false);
      }
  };

  const closePreview = () => {
      setSelectedQuiz(null);
      setPreviewQuestions([]);
  };

  const handleClone = async () => {
      if(!selectedQuiz) return;
      if(!window.confirm(`Clone "${selectedQuiz.title}" to your library?`)) return;
      try {
          await api.post(`/Library/clone/${selectedQuiz.id}`);
          navigate("/my-quizzes");
      } catch (e) { alert("Failed to clone"); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="community-header">Community Library</h1>
        
        <input 
            className="search-bar" 
            placeholder="Search for quizzes..." 
            value={search} 
            onChange={handleSearch} 
        />

        {loading ? <div className="loader">Loading...</div> : (
            <div className="library-grid">
                {quizzes.length === 0 && <p className="no-results">No public quizzes found.</p>}
                {quizzes.map(q => (
                    <div key={q.id} className="lib-card" onClick={() => openPreview(q)}>
                        <div className="lib-content">
                            <h3 className="lib-title">{q.title}</h3>
                            <p className="lib-creator">By {q.creatorName}</p>
                            <p className="lib-desc">{q.description || "No description"}</p>
                            <div className="lib-stats">
                                <span className="lib-badge">{q.questionCount} Qs</span>
                                <span className="lib-play-count">▶ {q.timesPlayed} plays</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {selectedQuiz && (
            <div className="modal-overlay" onClick={closePreview}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={closePreview}>✕</button>
                    
                    <div className="modal-header">
                        <h2>{selectedQuiz.title}</h2>
                        <p className="modal-creator">Created by {selectedQuiz.creatorName}</p>
                        <p className="modal-desc">{selectedQuiz.description}</p>
                    </div>

                    <div className="modal-body">
                        <h3>Questions Preview</h3>
                        {loadingPreview ? <p>Loading questions...</p> : (
                            <div className="modal-q-list">
                                {previewQuestions.map((q, i) => (
                                    <div key={i} className="modal-q-item">
                                        <span className="mq-num">{i+1}.</span>
                                        <span className="mq-text">{q.questionDescription}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn-main" onClick={() => navigate(`/lobby/new?quizId=${selectedQuiz.id}`)}>
                            Play Now
                        </button>
                        <button className="btn-outline" onClick={handleClone}>
                            Clone & Edit
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
