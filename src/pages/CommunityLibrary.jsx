import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Community.css";

export default function CommunityLibrary() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
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
        
        if(!term) {
            const recRes = await api.get("/Recommendation/feed");
            setRecommendations(recRes.data);
            const leadRes = await api.get("/Leaderboard/weekly");
            setLeaderboard(leadRes.data);
        }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { setSearch(e.target.value); load(e.target.value); };

  const openPreview = async (quiz) => {
      setSelectedQuiz(quiz);
      setLoadingPreview(true);
      try {
          const res = await api.get(`/Library/public/${quiz.id}`);
          setPreviewQuestions(res.data.questions);
      } catch (e) { console.error(e); setPreviewQuestions([]); } 
      finally { setLoadingPreview(false); }
  };

  const closePreview = () => { setSelectedQuiz(null); setPreviewQuestions([]); };

  const handleClone = async () => {
      if(!selectedQuiz) return;
      if(!window.confirm(`Clone "${selectedQuiz.title}" to your library?`)) return;
      try { await api.post(`/Library/clone/${selectedQuiz.id}`); navigate("/my-quizzes"); } catch (e) { alert("Failed to clone"); }
  };

  const parseQuestionContent = (desc) => {
      const imgRegex = /<img\s+src=['"](.*?)['"]\s*\/?>/i;
      const match = desc.match(imgRegex);
      
      if (match) {
          const textPart = desc.replace(match[0], '').trim();
          return (
              <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
                  <span>{textPart}</span>
                  <img src={match[1]} className="q-parsed-image" alt="Question" onError={(e) => e.target.style.display='none'} />
              </div>
          );
      }
      return <span>{desc}</span>;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="community-header">Community Library</h1>
        <input className="search-bar" placeholder="Search for quizzes..." value={search} onChange={handleSearch} />

        <div className="community-layout">
            <div className="community-main">
                {loading ? <div className="loader">Loading...</div> : (
                    <>
                        {recommendations.length > 0 && !search && (
                            <>
                                <h2 className="section-title">Recommended For You</h2>
                                <div className="rec-scroll-container">
                                    <div className="rec-track">
                                        {[...recommendations, ...recommendations].map((q, i) => (
                                            <div key={`${q.id}-${i}`} className="lib-card featured" onClick={() => openPreview(q)}>
                                                <div className="top-pick-label">Top Pick</div>
                                                <div className="lib-content">
                                                    <h3 className="lib-title">{q.title}</h3>
                                                    <p className="lib-creator">By {q.creatorName}</p>
                                                    <p className="lib-desc">{q.description || "Curated based on your play style."}</p>
                                                    <div className="lib-stats">
                                                        <span className="lib-badge">{q.questionCount} Qs</span>
                                                        <span className="lib-play-count">▶ {q.timesPlayed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <h2 className="section-title">All Quizzes</h2>
                        <div className="library-grid">
                            {quizzes.length === 0 && <p className="no-results">No public quizzes found.</p>}
                            {quizzes.map(q => (
                                <div key={q.id} className="lib-card" onClick={() => openPreview(q)}>
                                    <div className="lib-content">
                                        <h3 className="lib-title">{q.title}</h3>
                                        <p className="lib-creator">By {q.creatorName}</p>
                                        <p className="lib-desc">{q.description || "No description provided."}</p>
                                        <div className="lib-stats">
                                            <span className="lib-badge">{q.questionCount} Qs</span>
                                            <span className="lib-play-count">▶ {q.timesPlayed} plays</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <aside className="community-sidebar">
                <h3 className="sidebar-title">Weekly Champions 🏆</h3>
                <div className="leaderboard-list">
                    {leaderboard.length === 0 ? <p style={{color:'#94a3b8', textAlign:'center'}}>No scores yet this week.</p> : leaderboard.map((p, i) => (
                        <div key={i} className={`leaderboard-item rank-${i+1}`}>
                            <div className="rank-badge">{i+1}</div>
                            <img src={p.avatarUrl} className="rank-avatar" alt=""/>
                            <div className="rank-name">{p.name}</div>
                            <div className="rank-score">{p.score}</div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>

        {selectedQuiz && (
            <div className="modal-overlay" onClick={closePreview}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={closePreview}>✕</button>
                    <div className="modal-header">
                        <h2>{selectedQuiz.title}</h2>
                        <p style={{color:'var(--primary)'}}>Created by {selectedQuiz.creatorName}</p>
                        <p style={{color:'#94a3b8', fontSize:'0.9rem'}}>{selectedQuiz.description}</p>
                    </div>
                    <div className="modal-body">
                        <h3 style={{color:'white', marginBottom:'1rem'}}>Questions Preview</h3>
                        {loadingPreview ? <p style={{color:'white'}}>Loading...</p> : (
                            <div className="modal-q-list">
                                {previewQuestions.map((q, i) => (
                                    <div key={i} className="modal-q-item">
                                        <div className="q-text-row">
                                            <span style={{color:'var(--primary)', fontWeight:'bold'}}>{i+1}.</span>
                                            {parseQuestionContent(q.questionDescription)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn-main" onClick={() => navigate(`/lobby/new?quizId=${selectedQuiz.id}`)}>Play Now</button>
                        <button className="btn-outline" onClick={handleClone}>Clone & Edit</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
