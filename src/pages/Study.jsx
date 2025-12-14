import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/Study.css";

export default function Study() {
    const [heatmap, setHeatmap] = useState({});
    const [history, setHistory] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const heatRes = await api.get("/Study/heatmap");
            setHeatmap(heatRes.data);
            
            const histRes = await api.get("/Study/history");
            setHistory(histRes.data);
        } catch (e) {
            console.error("Failed to load study data", e);
        }
    };

    const startStudy = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/Study/flashcards");
            if (res.data && res.data.length > 0) {
                setFlashcards(res.data);
                setCurrentCard(0);
                setIsFlipped(false);
            } else {
                alert("Not enough play history to generate flashcards. Play some quizzes first!");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load flashcards.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextCard = () => {
        if (flashcards.length === 0) return;
        setIsFlipped(false);
        setTimeout(() => setCurrentCard(p => (p + 1) % flashcards.length), 300);
    };

    const renderHeatmap = () => {
        const days = [];
        const today = new Date();
        for (let i = 167; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const count = heatmap[dateStr] || 0;
            
            let intensityClass = "level-0";
            if (count > 8) intensityClass = "level-4";
            else if (count > 5) intensityClass = "level-3";
            else if (count > 2) intensityClass = "level-2";
            else if (count > 0) intensityClass = "level-1";

            days.push(
                <div 
                    key={dateStr} 
                    className={`heatmap-day ${intensityClass}`} 
                    title={`${dateStr}: ${count} games`}
                ></div>
            );
        }
        return <div className="heatmap-grid">{days}</div>;
    };
    
    return (
        <div className="page-wrapper">
            <div className="study-layout">
                
                <div className="study-main">
                    <div className="study-card flashcard-section">
                        <div className="card-header">
                            <h2 className="card-title">Active Recall</h2>
                            <span className="card-subtitle">Review missed questions</span>
                        </div>
                        
                        <div className="flashcard-area">
                            {flashcards.length > 0 ? (
                                <div className="flashcard-wrapper">
                                    <div 
                                        className={`flashcard-item ${isFlipped ? 'flipped' : ''}`} 
                                        onClick={() => setIsFlipped(!isFlipped)}
                                    >
                                        <div className="flashcard-face front">
                                            <span className="fc-label">QUESTION</span>
                                            <p>{flashcards[currentCard].questionDescription}</p>
                                        </div>
                                        <div className="flashcard-face back">
                                            <span className="fc-label">ANSWER</span>
                                            <p>{flashcards[currentCard][`option${flashcards[currentCard].answer}`]}</p>
                                        </div>
                                    </div>
                                    <div className="flashcard-controls">
                                        <span className="fc-counter">{currentCard + 1} / {flashcards.length}</span>
                                        <button className="btn-next" onClick={nextCard}>Next Card →</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flashcard-empty">
                                    <div className="empty-icon">🧠</div>
                                    <h3>Train Your Brain</h3>
                                    <p>Generate personalized flashcards based on questions you've answered incorrectly in games.</p>
                                    <button className="btn-start-study" onClick={startStudy} disabled={isLoading}>
                                        {isLoading ? "Analyzing History..." : "Generate Flashcards"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="study-sidebar">
                    <div className="study-card heatmap-section">
                        <div className="card-header">
                            <h3 className="card-title">Consistency</h3>
                            <span className="card-subtitle">Last 6 Months</span>
                        </div>
                        {renderHeatmap()}
                    </div>

                    <div className="study-card history-section">
                        <div className="card-header">
                            <h3 className="card-title">Recent Activity</h3>
                        </div>
                        <div className="history-list">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className="history-row">
                                    <div className="history-icon">🎮</div>
                                    <div className="history-info">
                                        <span className="history-name">{h.entityName}</span>
                                        <span className="history-date">{new Date(h.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="history-empty">No games played yet.</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
