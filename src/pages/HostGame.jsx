import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import GameProgress from "../components/GameProgress";
import "../styles/Game.css";

export default function HostGame() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState(state?.qData);
  const [connection, setConnection] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(20);
  const [isReviewing, setIsReviewing] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playersProgress, setPlayersProgress] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  const timerRef = useRef(null);
  const reviewTimerRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5198/gameHub", { accessTokenFactory: () => user.token })
      .withAutomaticReconnect()
      .build();
    
    conn.start().then(() => {});
    
    conn.on("ReceiveQuestion", (data) => {
        setQuestion(data);
        setTimeLeft(Math.floor(data.timeLimit)); 
        setIsReviewing(false);
        setCorrectAnswer(null);
        setGameResult(null);
    });

    conn.on("UpdateProgress", (players) => {
        setPlayersProgress(players);
    });

    conn.on("ShowAnswers", (ans) => {
        setIsReviewing(true);
        setCorrectAnswer(ans);
        setTimeLeft(0);
    });

    conn.on("GameOver", (finalResult) => {
        setGameResult(finalResult);
    });
    
    conn.on("SessionEnded", () => {
        alert("Session ended.");
        navigate("/dashboard");
    });

    setConnection(conn);
    return () => {
        conn.stop();
        clearInterval(timerRef.current);
        clearTimeout(reviewTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (reviewTimerRef.current) clearTimeout(reviewTimerRef.current);

    if (gameResult) return;

    if (isReviewing) {
        reviewTimerRef.current = setTimeout(() => {
             if (connection) {
                 connection.invoke("RequestNextQuestion", roomCode).catch(console.error);
             }
        }, 6000);
    } 
    else {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        if (connection) connection.invoke("TriggerShowAnswers", roomCode);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft <= 0 && connection) {
            connection.invoke("TriggerShowAnswers", roomCode);
        }
    }

    return () => {
        clearInterval(timerRef.current);
        clearTimeout(reviewTimerRef.current);
    };
  }, [timeLeft, isReviewing, connection, gameResult, roomCode]);

  const handleEnd = () => navigate("/dashboard");

  if (gameResult) {
      return (
        <div className="page-wrapper">
          <div className="winner-card">
              <h1>🏆 WINNER 🏆</h1>
              <img src={gameResult.winnerAvatar} className="winner-avatar" alt="Winner"/>
              <h2>{gameResult.winnerName}</h2>
              <h3 style={{color:'var(--success)'}}>{gameResult.winnerScore} Points</h3>
              <div style={{marginTop:'2rem', textAlign:'left'}}>
                  {gameResult.leaderboard.map((p, i) => (
                      <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'0.5rem', borderBottom:'1px solid var(--border)'}}>
                          <span>#{i+1} {p.name}</span><span>{p.score}</span>
                      </div>
                  ))}
              </div>
              <button className="btn-main" onClick={handleEnd} style={{marginTop:'2rem'}}>Dashboard</button>
          </div>
        </div>
      );
  }

  if (!question) return <div className="page-wrapper"><h2 style={{marginTop:'100px'}}>Loading...</h2></div>;

  return (
    <div className="page-wrapper">
      <div className="game-layout">
        <div className="game-header">
            <div className="header-stat">
                <span className="label">QUESTION</span>
                <span className="value">{question.current} / {question.total}</span>
            </div>
            <div className={`timer-circle ${timeLeft < 5 ? 'critical' : ''}`}>
                {isReviewing ? "0" : timeLeft}
            </div>
            <div className="header-stat">
                <span className="label">CODE</span>
                <span className="value">{roomCode}</span>
            </div>
        </div>

        <GameProgress players={playersProgress} />

        <div className="game-content">
            <h1 className="question-text">{question.questionDescription}</h1>
            {question.imageName && (
                <img src={`http://localhost:5198/static/images/${question.imageName}`} className="game-image" alt=""/>
            )}

            <div className="options-list">
                {[1,2,3,4].map(i => {
                    const isCorrect = correctAnswer === i;
                    const stateClass = isReviewing 
                        ? (isCorrect ? 'correct-reveal' : 'dim-reveal') 
                        : '';

                    return (
                        <div key={i} className={`option-item ${stateClass}`}>
                            <div className="option-idx">{i}</div>
                            <span>{question[`option${i}`]}</span>
                            {isReviewing && isCorrect && <span style={{marginLeft:'auto'}}></span>}
                        </div>
                    );
                })}
            </div>
            
            {isReviewing && <p style={{marginTop:'1rem', color:'var(--primary)', fontWeight:'bold'}}>Next question in 6s...</p>}
        </div>
      </div>
    </div>
  );
}
