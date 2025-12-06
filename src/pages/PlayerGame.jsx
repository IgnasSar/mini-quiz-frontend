import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import api from "../api";
import GameProgress from "../components/GameProgress";
import "../styles/Game.css";

export default function PlayerGame() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(state?.qData);
  const [connection, setConnection] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [playersProgress, setPlayersProgress] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [isReviewing, setIsReviewing] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) { navigate("/login"); return; }

    const conn = new HubConnectionBuilder()
        .withUrl("http://localhost:5198/gameHub", { accessTokenFactory: () => user.token })
        .withAutomaticReconnect()
        .build();

    conn.start().then(async () => {
        await conn.invoke("JoinRoom", roomCode, user.name, sessionStorage.getItem("currentAvatar"));
    }).catch(console.error);
    
    conn.on("ReceiveQuestion", (data) => {
        setQuestion(data);
        setHasAnswered(false);
        setGameResult(null);
        setIsReviewing(false);
        setCorrectAnswer(null);
        setMyAnswer(null);
        setTimeLeft(Math.floor(data.timeLimit));
    });
    
    conn.on("UpdateProgress", (players) => {
        setPlayersProgress(players);
    });
    
    conn.on("AnswerAccepted", () => setHasAnswered(true));

    conn.on("ShowAnswers", (ans) => {
        setTimeLeft(0);
        setCorrectAnswer(ans);
        setIsReviewing(true);
    });
    
    conn.on("GameOver", (res) => setGameResult(res));
    conn.on("SessionEnded", () => navigate("/dashboard"));
    
    setConnection(conn);
    return () => conn.stop();
  }, []);

  useEffect(() => {
      if(timeLeft > 0 && !isReviewing) {
          const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
          return () => clearInterval(t);
      }
  }, [timeLeft, isReviewing]);

  const submit = async (idx) => {
    if (hasAnswered || !connection || isReviewing) return;
    setMyAnswer(idx + 1); 
    await connection.invoke("SubmitAnswer", roomCode, idx);
  };

  const sendResultsEmail = async () => {
      try {
          const user = JSON.parse(sessionStorage.getItem("user"));
          await api.post("/Game/send-results", { roomCode, email: user.email });
          setEmailSent(true);
      } catch (err) { alert("Failed"); }
  };

  if (gameResult) {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const myResult = gameResult.leaderboard.find(p => p.name === user.name);

      return (
        <div className="page-wrapper">
          <div className="winner-card">
              <h2>Session Complete!</h2>
              <div style={{fontSize:'3rem', fontWeight:'bold', margin:'1rem 0'}}>#{myResult?.rank || '-'}</div>
              <div style={{fontSize:'1.5rem', color:'var(--primary)'}}>{myResult?.score || 0} Points</div>
              {!emailSent ? <button className="btn-outline" onClick={sendResultsEmail} style={{marginTop:'2rem'}}>📧 Email Results</button> : <p style={{color:'var(--success)', marginTop:'2rem'}}>Sent!</p>}
              <button className="btn-main" onClick={() => navigate("/dashboard")} style={{marginTop:'1rem'}}>Exit</button>
          </div>
        </div>
      );
  }

  if (!question) return <div className="page-wrapper"><h2 style={{marginTop:'100px'}}>Waiting...</h2></div>;

  return (
    <div className="page-wrapper">
      <div className="game-layout">
        <div className="game-header">
            <div className="header-stat"><span className="label">QUESTION</span><span className="value">{question.current} / {question.total}</span></div>
            <div className={`timer-circle ${timeLeft < 5 ? 'critical' : ''}`}>{timeLeft}</div>
            <div className="header-stat"><span className="label">CODE</span><span className="value">{roomCode}</span></div>
        </div>

        <GameProgress players={playersProgress} />

        <div className="game-content">
            <h1 className="question-text">{question.questionDescription}</h1>
            {question.imageName && <img src={`http://localhost:5198/static/images/${question.imageName}`} className="game-image" alt=""/>}
            <div className="options-list">
                {[1,2,3,4].map((n, idx) => {
                    let btnClass = "option-item clickable";
                    const isSelected = myAnswer === n;
                    if(isReviewing) {
                        btnClass = "option-item"; 
                        if(n === correctAnswer) btnClass += " correct-reveal";
                        else if(isSelected && n !== correctAnswer) btnClass += " wrong-reveal";
                        else btnClass += " dim-reveal";
                    } else if(hasAnswered) {
                        btnClass = "option-item"; 
                        if(isSelected) btnClass += " selected-wait";
                        else btnClass += " dim-reveal";
                    }
                    return (
                        <div key={n} className={btnClass} onClick={() => submit(idx)}>
                            <div className="option-idx">{n}</div>
                            <span>{question[`option${n}`]}</span>
                        </div>
                    )
                })}
            </div>
            {hasAnswered && !isReviewing && <div style={{marginTop:'0.5rem', color:'var(--text-muted)'}}>Answer submitted...</div>}
        </div>
      </div>
    </div>
  );
}
