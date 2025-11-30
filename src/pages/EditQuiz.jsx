import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/EditQuiz.css";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ 
    questionDescription: "", 
    option1: "", option2: "", option3: "", option4: "", 
    answer: 1 
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = () => api.get(`/Quiz/${quizId}/questions`).then(res => setQuestions(res.data));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
        setPreviewUrl(URL.createObjectURL(file));
    } else {
        setPreviewUrl(null);
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("QuizId", quizId);
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    if(image) fd.append("ImageFile", image);
    
    await api.post("/Quiz/add-question", fd, { headers: { "Content-Type": "multipart/form-data" } });
    
    setForm({ questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 });
    setImage(null);
    setPreviewUrl(null);
    loadQuestions();
  };

  const deleteQuestion = async (id) => {
    if(window.confirm("Delete this question?")) {
        await api.delete(`/Quiz/question/${id}`);
        loadQuestions();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container edit-container">
        <button onClick={() => navigate("/my-quizzes")} className="back-link">← Back to My Quizzes</button>
        
        <div className="editor-grid">
            <div className="edit-card form-section">
                <h2 className="title">Add Question</h2>
                <form onSubmit={addQuestion}>
                    <label className="label">Question Text</label>
                    <input 
                        className="input-styled" 
                        placeholder="e.g. What is the capital of France?" 
                        value={form.questionDescription} 
                        onChange={e => setForm({...form, questionDescription: e.target.value})} 
                        required 
                    />
                    
                    <label className="label">Image (Optional)</label>
                    <div className="file-upload-wrapper">
                        <input type="file" onChange={handleImageChange} accept="image/*" />
                    </div>
                    
                    <label className="label">Options</label>
                    <div className="options-input-grid">
                        {[1,2,3,4].map(n => (
                            <input 
                                key={n} 
                                className="input-styled" 
                                placeholder={`Option ${n}`} 
                                value={form[`option${n}`]} 
                                onChange={e => setForm({...form, [`option${n}`]: e.target.value})} 
                                required 
                            />
                        ))}
                    </div>
                    
                    <label className="label">Correct Answer</label>
                    <select className="input-styled" value={form.answer} onChange={e => setForm({...form, answer: Number(e.target.value)})}>
                        {[1,2,3,4].map(n => <option key={n} value={n}>Option {n}</option>)}
                    </select>
                    
                    <button className="btn-save">Add to Quiz</button>
                </form>
            </div>

            <div className="edit-card preview-section">
                <h3 className="preview-label">LIVE PREVIEW</h3>
                <div className="preview-box">
                    <h2 className="preview-question">
                        {form.questionDescription || "Your question will appear here..."}
                    </h2>
                    
                    <div className="preview-image-box">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="preview-img" />
                        ) : (
                            <span style={{color:'var(--text-muted)'}}>No image selected</span>
                        )}
                    </div>

                    <div className="preview-options">
                        {[1,2,3,4].map(n => (
                            <div key={n} className={`preview-opt ${form.answer === n ? 'preview-correct' : ''}`}>
                                <div className="preview-badge">{n}</div>
                                <span>{form[`option${n}`] || `Option ${n}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="edit-card list-section">
            <h2 className="title">Existing Questions ({questions.length})</h2>
            {questions.length === 0 ? <p className="text-muted" style={{color: 'var(--text-muted)'}}>No questions added yet.</p> : null}
            {questions.map(q => (
                <div key={q.id} className="question-row">
                    <div className="q-row-left">
                        {q.imageName && <img src={`http://localhost:5198/static/images/${q.imageName}`} className="q-thumb" alt="" />}
                        <span className="q-text">{q.questionDescription}</span>
                    </div>
                    <button className="btn-delete" onClick={() => deleteQuestion(q.id)}>Delete</button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
