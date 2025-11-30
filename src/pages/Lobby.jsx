import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import "../styles/Lobby.css";

export default function Lobby() {
  const { roomCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [players, setPlayers] = useState([]);
  
  const [actualCode, setActualCode] = useState(roomCode === "new" ? "..." : roomCode);
  const [isHost, setIsHost] = useState(roomCode === "new");

  const codeRef = useRef(roomCode === "new" ? null : roomCode);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;
    
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) { navigate("/login"); return; }

    const newConn = new HubConnectionBuilder()
      .withUrl("http://localhost:5198/gameHub", { accessTokenFactory: () => user.token })
      .withAutomaticReconnect()
      .build();

    setConnection(newConn);
  }, []);

  useEffect(() => {
    if (connection && connection.state === "Disconnected") {
      connection.start().then(async () => {
          const name = sessionStorage.getItem("currentName") || "Player";
          const avatar = sessionStorage.getItem("currentAvatar");
                    
          connection.on("UpdateLobby", (updatedPlayers) => {
              setPlayers(updatedPlayers);
          });
          
          connection.on("ReceiveQuestion", (data) => {
             const activeCode = codeRef.current;
             const path = roomCode === "new" ? `/host/${activeCode}` : `/play/${activeCode}`;
             
             navigate(path, { state: { qData: data } });
          });

          if (roomCode === "new") {
            const quizIdParam = searchParams.get("quizId");
            try {
                const code = await connection.invoke("CreateRoom", parseInt(quizIdParam), name);
                if (code === "NO_QUESTIONS") { 
                    alert("No questions found in this quiz!"); 
                    navigate("/my-quizzes"); 
                }
                else { 
                    setActualCode(code); 
                    setIsHost(true);
                    codeRef.current = code;
                }
            } catch (err) { 
                console.error(err);
                alert("Error creating room"); 
                navigate("/dashboard"); 
            }
          } else {
            const success = await connection.invoke("JoinRoom", roomCode, name, avatar);
            if (!success) { 
                alert("Room not found"); 
                navigate("/dashboard"); 
            }
            else { 
                setActualCode(roomCode);
                codeRef.current = roomCode;
            }
          }

      }).catch(console.error);
    }
  }, [connection, roomCode, searchParams, navigate]);

  const start = async () => { 
      if (connection && codeRef.current) {
          await connection.invoke("StartGame", codeRef.current); 
      }
  };

  return (
    <div className="page-wrapper lobby-bg">
      <div className="container" style={{display:'flex', justifyContent:'center'}}>
        <div className="lobby-card">
            <h2 className="lobby-title">{isHost ? "HOST LOBBY" : "GAME LOBBY"}</h2>
            
            <div className="code-display">
                <span className="code-label">GAME PIN</span>
                <h1 className="code-value">{actualCode}</h1>
            </div>

            <div className="players-section">
                <p className="players-count">{players.length} Players Joined</p>
                <div className="player-grid">
                    {players.length === 0 ? <p className="waiting-text">Waiting for players...</p> : 
                    players.map((p, i) => (
                        <div key={i} className="lobby-player">
                            <img src={p.avatarUrl} alt="" className="lobby-avatar" />
                            <span className="lobby-name">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isHost && (
                <button className="start-btn" onClick={start} disabled={players.length === 0}>
                    {players.length === 0 ? "Waiting..." : "START GAME"}
                </button>
            )}
            {!isHost && <div className="waiting-pulse">Waiting for host to start...</div>}
        </div>
      </div>
    </div>
  );
}
