import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import api from "../api";
import "../styles/Social.css";

export default function Social() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  
  const connectionRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const chatBodyRef = useRef(null);

  useEffect(() => { 
      loadData(); 
      setupSignalR();
      return () => {
          if(connectionRef.current) connectionRef.current.stop();
      };
  }, []);

  useEffect(() => {
      if(activeChat) {
          api.get(`/Social/chat/${activeChat}`).then(res => {
              setMessages(res.data);
              setTimeout(scrollToBottom, 100);
          });
      }
  }, [activeChat]);

  const scrollToBottom = () => {
      if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
  };

  const setupSignalR = async () => {
      const conn = new HubConnectionBuilder()
          .withUrl("http://localhost:5198/socialHub", { accessTokenFactory: () => user.token })
          .withAutomaticReconnect()
          .build();

      conn.on("UserStatusChange", (userId, status) => {
          setFriends(prev => prev.map(f => f.userId === userId ? { ...f, status } : f));
      });

      conn.on("ReceiveMessage", (msg) => {
          const myId = user.id;
          
          setActiveChat(currentChat => {
              if (!currentChat && msg.receiverId == myId) {
                  return msg.senderId; 
              }

              const isRelevant = (currentChat == msg.senderId || currentChat == msg.receiverId);
              
              if (isRelevant) {
                  setMessages(prev => {
                      if (prev.some(m => m.id === msg.id)) return prev;
                      return [...prev, msg];
                  });
                  setTimeout(scrollToBottom, 100);
                  return currentChat;
              }

              return currentChat; 
          });
      });

      try {
          await conn.start();
          connectionRef.current = conn;
          console.log("SocialHub Connected");
      } catch (err) {
          console.error("SignalR Connection Error", err);
      }
  };

  const loadData = async () => {
      try {
          const fRes = await api.get("/Social/friends");
          setFriends(fRes.data.friends);
          setRequests(fRes.data.requests);
          const aRes = await api.get("/Social/activity");
          setActivity(aRes.data);
      } catch(e) { console.error(e); }
  };

  const handleSearch = async (e) => {
      setQuery(e.target.value);
      if(e.target.value.length > 2) {
          const res = await api.get(`/Social/search?q=${e.target.value}`);
          setSearchResults(res.data);
      } else { setSearchResults([]); }
  };

  const sendRequest = async (id) => { await api.post(`/Social/request/${id}`); setSearchResults(prev => prev.filter(u => u.id !== id)); alert("Sent!"); };
  const acceptRequest = async (id) => { await api.post(`/Social/accept/${id}`); loadData(); };
  const declineRequest = async (id) => { await api.post(`/Social/decline/${id}`); loadData(); };

  const openChat = (friendId) => {
      setActiveChat(friendId);
  };
  
  const sendMessage = async (e) => {
      e.preventDefault();
      if(!msgText.trim() || !connectionRef.current) return;
      try {
          await connectionRef.current.invoke("SendMessage", activeChat, msgText);
          setMsgText("");
      } catch(err) {
          console.error("Send failed", err);
      }
  };

  const formatTime = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMins = Math.floor((now - date) / 60000);
      if(diffMins < 60) return `${diffMins}m ago`;
      if(diffMins < 1440) return `${Math.floor(diffMins/60)}h ago`;
      return `${Math.floor(diffMins/1440)}d ago`;
  };

  return (
    <div className="page-wrapper">
      <div className="social-container">
        <h1 style={{color:'white', marginBottom:'1.5rem', fontWeight:'800'}}>Social Hub</h1>
        
        <div className="social-grid">
            <div className="social-sidebar-col">
                <div className="social-card card-search">
                    <div className="social-header"><span className="social-title">Find Players</span></div>
                    <div className="search-container"><input className="search-input" placeholder="Search..." value={query} onChange={handleSearch} /></div>
                    <div className="scroll-area">
                        {searchResults.map(u => (
                            <div key={u.id} className="user-row">
                                <img src={u.avatarUrl} className="user-row-avatar" alt=""/>
                                <div className="user-row-info"><span className="user-row-name">{u.name}</span></div>
                                <button className="btn-icon success" onClick={() => sendRequest(u.id)}>+</button>
                            </div>
                        ))}
                        {requests.length > 0 && requests.map(r => (
                            <div key={r.id} className="user-row">
                                <img src={r.avatarUrl} className="user-row-avatar" alt=""/>
                                <div className="user-row-info"><span className="user-row-name">{r.name}</span></div>
                                <button className="btn-icon success" onClick={() => acceptRequest(r.id)}>✓</button>
                                <button className="btn-icon danger" onClick={() => declineRequest(r.id)}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="social-card card-friends">
                    <div className="social-header"><span className="social-title">My Friends</span><span className="badge-count">{friends.length}</span></div>
                    <div className="scroll-area">
                        {friends.map(f => (
                            <div key={f.id} className="user-row" onClick={() => openChat(f.userId)} style={{cursor:'pointer', background: activeChat === f.userId ? 'rgba(99, 102, 241, 0.2)' : ''}}>
                                <img src={f.avatarUrl} className="user-row-avatar" alt=""/>
                                <div className="user-row-info">
                                    <span className="user-row-name">{f.name}</span>
                                    <span className="user-row-sub" style={{color: f.status === 'Online' ? '#22c55e' : 'gray', fontWeight: f.status === 'Online' ? 'bold' : 'normal'}}>
                                        <span className={`status-dot ${f.status === 'Online' ? 'online' : ''}`}></span> {f.status}
                                    </span>
                                </div>
                                <button className="btn-icon">💬</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="social-card card-feed">
                <div className="social-header"><span className="social-title">Activity Feed</span></div>
                <div className="scroll-area">
                    {activity.length === 0 ? <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)'}}>No recent activity from your circle.</div> : 
                    activity.map(act => (
                        <div key={act.id} className="feed-item">
                            <img src={act.userAvatar} className="feed-avatar" alt=""/>
                            <div className="feed-content">
                                <div className="feed-text">
                                    <span className="feed-user">{act.userName}</span>
                                    {act.actionType === "PlayedGame" && <span> played <span className="feed-highlight">{act.entityName}</span></span>}
                                    {act.actionType === "CreatedQuiz" && <span> created a new quiz: <span className="feed-highlight">{act.entityName}</span></span>}
                                    {act.actionType === "HighScore" && <span> got a <span className="feed-highlight">High Score</span> of {act.entityName.replace('Score: ', '')} points!</span>}
                                    {act.actionType === "NewFriend" && <span> made a new connection</span>}
                                </div>
                                <div className="feed-time">{formatTime(act.timestamp)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {activeChat && (
            <div className="chat-window">
                <div className="chat-header">
                    <span>{friends.find(f => f.userId === activeChat)?.name || 'Chat'}</span>
                    <span onClick={() => setActiveChat(null)} style={{cursor:'pointer'}}>✕</span>
                </div>
                <div className="chat-body" ref={chatBodyRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.senderId == user.id ? 'msg-out' : 'msg-in'}`}>
                            {m.content}
                        </div>
                    ))}
                </div>
                <form className="chat-input-area" onSubmit={sendMessage}>
                    <input className="chat-input" value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type a message..." autoFocus />
                    <button className="btn-send">➤</button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}
