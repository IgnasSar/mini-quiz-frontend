import React from "react";
import "../styles/Game.css";

export default function GameProgress({ players }) {
  const maxScore = Math.max(1000, ...players.map(p => p.score));

  return (
    <div className="race-container">
      <div className="race-track">
        <div style={{position:'absolute', left:'5px', height:'100%', width:'2px', background:'#334155'}}></div>
        <div style={{position:'absolute', right:'5px', height:'100%', width:'10px', background: '#334155', opacity:0.3}}></div>

        {players.map((p, i) => {
            const percent = Math.min(98, (p.score / (maxScore || 1)) * 95);
            return (
                <div key={i} className="racer-icon" style={{ left: `${percent}%` }} title={`${p.name}: ${p.score}`}>
                    <img src={p.avatarUrl} alt={p.name} className="racer-img" />
                </div>
            );
        })}
      </div>
    </div>
  );
}
