import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Dashboard.css";

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cal",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Dora",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Elmo",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user"));
    if (u) {
      setUser(u);
      setSelectedAvatar(sessionStorage.getItem("currentAvatar") || u.avatarUrl || AVATARS[0]);
      setNickname(sessionStorage.getItem("currentName") || u.name);
    }
    
    api.get("/Quiz").then(res => {
        setQuizzes(res.data);
        if(res.data.length > 0) setSelectedQuiz(res.data[0].id);
    }).catch(e => console.error(e));
  }, []);

  const handleUpdateProfile = () => {
    sessionStorage.setItem("currentAvatar", selectedAvatar);
    sessionStorage.setItem("currentName", nickname);
  };

  const handleJoin = () => { 
    if(roomCode) {
        handleUpdateProfile();
        navigate(`/lobby/${roomCode}`); 
    }
  };
  
  const handleHost = () => { 
    if(selectedQuiz) {
        handleUpdateProfile();
        navigate(`/lobby/new?quizId=${selectedQuiz}`); 
    } else {
        alert("Please create or select a quiz first!");
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="container dashboard-grid">
        
        <div className="dash-card">
            <h2 className="dash-title">Player Profile</h2>
            <div className="profile-section">
                <img src={selectedAvatar} alt="Current" className="current-avatar" />
                <input 
                    className="dash-input" 
                    value={nickname} 
                    onChange={e => setNickname(e.target.value)} 
                    placeholder="Nickname" 
                    style={{marginBottom:'1rem', textAlign:'center', fontWeight:'bold'}}
                />
            </div>
            
            <div className="avatar-scroll">
                {AVATARS.map((av, i) => (
                    <img key={i} src={av} className={`avatar-choice ${selectedAvatar === av ? 'active' : ''}`} onClick={() => setSelectedAvatar(av)} alt="avatar" />
                ))}
            </div>

            <div style={{marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
                <input className="dash-input" placeholder="GAME CODE" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={5} style={{letterSpacing:'4px'}} />
                <button className="btn-main" style={{background:'var(--success)'}} onClick={handleJoin}>JOIN GAME</button>
            </div>
        </div>

        <div className="dash-card">
            <h2 className="dash-title">Host a Session</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center'}}>Select a quiz from your library to launch a live room.</p>
            
            {quizzes.length > 0 ? (
                <>
                    <select className="dash-select" value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>
                        {quizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.questionCount} Qs)</option>)}
                    </select>
                    <button className="btn-main" onClick={handleHost}>CREATE ROOM</button>
                </>
            ) : <p style={{color:'var(--danger)', textAlign:'center'}}>No quizzes found. Create one first.</p>}

            <button className="btn-outline" onClick={() => navigate("/my-quizzes")}>Manage My Quizzes</button>
        </div>

      </div>
    </div>
  );
}
