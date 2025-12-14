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

  useEffect(() => {
    const u = JSON.parse(sessionStorage.getItem("user"));
    if (u) {
      setUser(u);
      setSelectedAvatar(sessionStorage.getItem("currentAvatar") || u.avatarUrl || AVATARS[0]);
      setNickname(sessionStorage.getItem("currentName") || u.name);

      api.get("/Recommendation/radar")
        .then(res => setRadarData(res.data))
        .catch(console.error);
    }

    api.get("/Quiz").then(res => {
      setQuizzes(res.data);
      if (res.data.length > 0) setSelectedQuiz(res.data[0].id);
    }).catch(e => console.error(e));
  }, []);

  const handleUpdateProfile = () => {
    sessionStorage.setItem("currentAvatar", selectedAvatar);
    sessionStorage.setItem("currentName", nickname);
  };

  const handleJoin = () => { if (roomCode) { handleUpdateProfile(); navigate(`/lobby/${roomCode}`); } };
  const handleHost = () => { if (selectedQuiz) { handleUpdateProfile(); navigate(`/lobby/new?quizId=${selectedQuiz}`); } else { alert("Please create or select a quiz first!"); } };

  const renderRadar = () => {
    if (!radarData.length) return null;

    const size = 320;
    const center = size / 2;
    const radius = 90;
    const labelOffset = 30;
    const angleStep = (Math.PI * 2) / radarData.length;

    const points = radarData.map((d, i) => {
      const val = d.a / 100;
      const x = center + radius * val * Math.cos(i * angleStep - Math.PI / 2);
      const y = center + radius * val * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    }).join(" ");

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeDasharray="4 4" />
          <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#334155" strokeOpacity="0.5" />

          <polygon points={radarData.map((_, i) => {
            const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
            const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
            return `${x},${y}`;
          }).join(" ")} fill="rgba(15, 23, 42, 0.5)" stroke="#334155" />

          <polygon points={points} fill="rgba(99, 102, 241, 0.5)" stroke="#6366f1" strokeWidth="2" />

          {radarData.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + (radius + labelOffset) * Math.cos(angle);
            const y = center + (radius + labelOffset) * Math.sin(angle);

            let anchor = "middle";
            if (x > center + 10) anchor = "start";
            else if (x < center - 10) anchor = "end";

            return (
              <text key={i} x={x} y={y} textAnchor={anchor} fill="#cbd5e1" fontSize="12" fontWeight="600" style={{ textTransform: 'uppercase' }}>
                {d.subject}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1400px' }}>
        <div className="dashboard-grid">

          <div className="dash-card">
            <h2 className="dash-title">Player Profile</h2>
            <div className="profile-section">
              <img src={selectedAvatar} alt="Current" className="current-avatar" />
              <input className="dash-input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Nickname" style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }} />
            </div>
            <div className="avatar-scroll">{AVATARS.map((av, i) => <img key={i} src={av} className={`avatar-choice ${selectedAvatar === av ? 'active' : ''}`} onClick={() => setSelectedAvatar(av)} alt="avatar" />)}</div>
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <input className="dash-input" placeholder="GAME CODE" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} maxLength={5} style={{ letterSpacing: '4px' }} />
              <button className="btn-main" style={{ background: 'var(--success)' }} onClick={handleJoin}>JOIN GAME</button>
            </div>
          </div>

          <div className="dash-card">
            <h2 className="dash-title">Knowledge Graph</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: 'auto' }}>Your Skill Breakdown</p>
            {radarData.length > 0 ? renderRadar() : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Play games to generate data.</div>}
          </div>

          <div className="dash-card">
            <h2 className="dash-title">Host a Session</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>Select a quiz from your library to launch a live room.</p>
            <div style={{ marginBottom: 'auto' }}>
              {quizzes.length > 0 ? (
                <>
                  <select className="dash-select" value={selectedQuiz} onChange={e => setSelectedQuiz(e.target.value)}>{quizzes.map(q => <option key={q.id} value={q.id}>{q.title} ({q.questionCount} Qs)</option>)}</select>
                  <button className="btn-main" onClick={handleHost}>CREATE ROOM</button>
                </>
              ) : <p style={{ color: 'var(--danger)', textAlign: 'center' }}>No quizzes found. Create one first.</p>}
            </div>
            <button className="btn-outline" onClick={() => navigate("/my-quizzes")}>Manage My Quizzes</button>
          </div>

        </div>
      </div>
    </div>
  );
}
