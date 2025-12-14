import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Dashboard.css";

const AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Bob",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Cal",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Dora",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Elmo",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [nickname, setNickname] = useState("");
  const [radarData, setRadarData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user"));
    if (u) {
      setUser(u);
      setSelectedAvatar(sessionStorage.getItem("currentAvatar") || u.avatarUrl || AVATARS[0]);
      setNickname(sessionStorage.getItem("currentName") || u.name);
      
      api.get("/Recommendation/radar").then(res => setRadarData(res.data)).catch(console.error);
      api.get("/Leaderboard/weekly").then(res => setLeaderboard(res.data)).catch(console.error);
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

  const handleJoin = () => { if(roomCode) { handleUpdateProfile(); navigate(`/lobby/${roomCode}`); } };
  const handleHost = () => { if(selectedQuiz) { handleUpdateProfile(); navigate(`/lobby/new?quizId=${selectedQuiz}`); } else { alert("Please create or select a quiz first!"); } };

  const renderRadar = () => {
      if(!radarData.length) return null;
      
      const size = 220; 
      const center = size / 2;
      const radius = 70; 
      const labelOffset = 20;
      const angleStep = (Math.PI * 2) / radarData.length;
      
      const points = radarData.map((d, i) => {
          const val = d.a / 100;
          const x = center + radius * val * Math.cos(i * angleStep - Math.PI/2);
          const y = center + radius * val * Math.sin(i * angleStep - Math.PI/2);
          return `${x},${y}`;
      }).join(" ");
      
      return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeDasharray="4 4" />
              <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#334155" strokeOpacity="0.5" />
              <polygon points={radarData.map((_, i) => {
                  const x = center + radius * Math.cos(i * angleStep - Math.PI/2);
                  const y = center + radius * Math.sin(i * angleStep - Math.PI/2);
                  return `${x},${y}`;
              }).join(" ")} fill="rgba(15, 23, 42, 0.5)" stroke="#334155" />
              <polygon points={points} fill="rgba(99, 102, 241, 0.5)" stroke="#6366f1" strokeWidth="2" />
              {radarData.map((d, i) => {
                  const angle = i * angleStep - Math.PI/2;
                  const x = center + (radius + labelOffset) * Math.cos(angle);
                  const y = center + (radius + labelOffset) * Math.sin(angle);
                  let anchor = "middle";
                  if (x > center + 10) anchor = "start";
                  else if (x < center - 10) anchor = "end";
                  return (
                    <text key={i} x={x} y={y} textAnchor={anchor} fill="#94a3b8" fontSize="9" fontWeight="600" style={{textTransform:'uppercase'}}>{d.subject}</text>
                  );
                  })}
          </svg>
      );
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-grid">  
            <div className="dash-card card-profile">
                <div>
                    <h2 className="dash-title" style={{textAlign:'center'}}>Profile</h2>
                    <div className="profile-header">
                        <img src={selectedAvatar} alt="Current" className="current-avatar" />
                        <input className="profile-name-input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Nickname" />
                        <div className="avatar-scroll">
                            {AVATARS.map((av, i) => (
                                <img key={i} src={av} className={`avatar-choice ${selectedAvatar === av ? 'active' : ''}`} onClick={() => setSelectedAvatar(av)} alt="avatar" />
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="join-section">
                    <input className="join-input" placeholder="GAME CODE" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={5} />
                    <button className="btn-join" onClick={handleJoin}>JOIN GAME</button>
                </div>
            </div>

            <div className="dash-card card-host">
                <button className="btn-manage" onClick={() => navigate("/my-quizzes")}>Manage Library →</button>
                <div className="host-content">
                    <h1 className="host-headline">Host a Session</h1>
                    <p className="host-sub">Select a quiz from your library to start a live room for your friends.</p>
                    
                    <div className="host-controls">
                        {quizzes.length > 0 ? (
                            <>
                                <select className="dash-select" value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>
                                    {quizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.questionCount} Qs)</option>)}
                                </select>
                                <button className="btn-host-action" onClick={handleHost}>START</button>
                            </>
                        ) : (
                            <div style={{color:'var(--danger)', fontWeight:'bold'}}>No quizzes found. Create one first.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dash-card card-graph">
                <h2 className="dash-title" style={{fontSize:'1rem', marginBottom:'0.5rem'}}>Stats</h2>
                <div className="graph-container">
                    {radarData.length > 0 ? renderRadar() : <div style={{color:'#64748b', fontSize:'0.9rem'}}>Play games to see data.</div>}
                </div>
            </div>

            <div className="dash-card card-leaderboard">
                <h2 className="dash-title" style={{fontSize:'1rem', marginBottom:'1rem'}}>Weekly Top</h2>
                <div className="leaderboard-list">
                    {leaderboard.length === 0 ? <p className="empty-state" style={{fontSize:'0.9rem'}}>No scores yet.</p> : leaderboard.map((p, i) => (
                        <div key={i} className={`leaderboard-item rank-${i+1}`}>
                            <div className="rank-badge">{i+1}</div>
                            <img src={p.avatarUrl} className="rank-avatar" alt=""/>
                            <div className="rank-name">{p.name}</div>
                            <div className="rank-score">{p.score}</div>
                        </div>
                    ))}
                </div>
                <div className="reset-info">Resets Sunday</div>
            </div>

        </div>
      </div>
    </div>
  );
}
