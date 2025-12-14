import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/EditQuiz.css";

export default function EditQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState({ title: "", description: "", isPublic: false });
  const [questions, setQuestions] = useState([]);
  
  const [form, setForm] = useState({ 
    id: null, questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadAllData(); }, [quizId]);

  const loadAllData = async () => {
      try {
          const res = await api.get(`/Quiz/${quizId}`);
          setQuizData({
              title: res.data.title,
              description: res.data.description,
              isPublic: res.data.isPublic
          });
          setQuestions(res.data.questions);
      } catch (err) {
          console.error(err);
          navigate("/my-quizzes");
      } finally {
          setLoading(false);
      }
  };

  const saveSettings = async () => {
      try {
          await api.put(`/Quiz/${quizId}`, quizData);
          alert("Settings saved.");
      } catch (err) { alert("Failed to save settings"); }
  };

  const deleteQuiz = async () => {
      if(window.confirm("Are you sure?")) {
          await api.delete(`/Quiz/${quizId}`);
          navigate("/my-quizzes");
      }
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
      if(file) setPreviewImage(URL.createObjectURL(file));
  };

  const startEdit = (q) => {
      setIsEditing(true);
      setForm({
          id: q.id,
          questionDescription: q.questionDescription,
          option1: q.option1, option2: q.option2, option3: q.option3, option4: q.option4,
          answer: q.answer
      });
      
      if(q.imageName) {
          if(q.imageName.startsWith('http')) setPreviewImage(q.imageName);
          else setPreviewImage(`http://localhost:5198/static/images/${q.imageName}`);
      } else {
          setPreviewImage(null);
      }
      setImage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setForm({ id: null, questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 });
      setImage(null);
      setPreviewImage(null);
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("QuizId", quizId);
    fd.append("QuestionDescription", form.questionDescription);
    fd.append("Option1", form.option1);
    fd.append("Option2", form.option2);
    fd.append("Option3", form.option3);
    fd.append("Option4", form.option4);
    fd.append("Answer", form.answer);
    if(image) fd.append("ImageFile", image);
    
    try {
        if(isEditing) {
            await api.put(`/Quiz/question/${form.id}`, fd);
        } else {
            await api.post("/Quiz/add-question", fd);
        }
        cancelEdit();
        loadAllData();
    } catch (err) {
        alert("Failed to save question.");
    }
  };

  const deleteQuestion = async (id) => {
      if(window.confirm("Delete this question?")) {
          await api.delete(`/Quiz/question/${id}`);
          loadAllData();
      }
  };

  const handleAiGenerate = async () => {
      if(!aiTopic.trim()) return;
      setAiLoading(true);
      try {
          await api.post("/Quiz/generate-questions-ai", {
              quizId: parseInt(quizId),
              topic: aiTopic,
              count: 5
          });
          setAiTopic("");
          setShowAiModal(false);
          loadAllData();
      } catch (err) {
          alert("AI Generation failed.");
      } finally {
          setAiLoading(false);
      }
  };

  if (loading) return <div className="page-wrapper" style={{paddingTop:'100px', textAlign:'center'}}>Loading...</div>;

  return (
    <div className="page-wrapper">
      <div className="container edit-container">
        
        <div className="edit-header">
            <button onClick={() => navigate("/my-quizzes")} className="back-link">← Back</button>
            <h1 className="page-title">Edit Quiz</h1>
        </div>

        <div className="editor-layout">
            <div className="panel-left">
                <div className="dash-card">
                    <h3 className="section-title">Settings</h3>
                    <label className="label">Title</label>
                    <input className="input-styled" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} />
                    <label className="label">Description</label>
                    <textarea className="input-styled" rows="3" value={quizData.description} onChange={e => setQuizData({...quizData, description: e.target.value})} />
                    <div className="visibility-box">
                        <label className="label">Visibility</label>
                        <div className={`toggle-switch ${quizData.isPublic ? 'on' : 'off'}`} onClick={() => setQuizData({...quizData, isPublic: !quizData.isPublic})}>
                            <div className="toggle-knob"></div>
                        </div>
                        <span className="vis-status">{quizData.isPublic ? "Public" : "Private"}</span>
                    </div>
                    <div className="btn-group">
                        <button className="btn-main" onClick={saveSettings}>Save</button>
                        <button className="btn-outline danger" onClick={deleteQuiz}>Delete</button>
                    </div>
                </div>
            </div>

            <div className="panel-center">
                <div className="dash-card">
                    <div className="q-add-header">
                        <h3 className="section-title" style={{marginBottom:0}}>
                            {isEditing ? "Edit Question" : "Add Question"}
                        </h3>
                        {!isEditing && <button className="ai-btn" onClick={() => setShowAiModal(true)}>AI Add Questions</button>}
                    </div>
                    <form onSubmit={submitQuestion}>
                        <input className="input-styled" placeholder="Question Text" value={form.questionDescription} onChange={e => setForm({...form, questionDescription: e.target.value})} required />
                        <div className="options-grid-mini">
                            {[1,2,3,4].map(n => (
                                <input key={n} className="input-styled" placeholder={`Option ${n}`} value={form[`option${n}`]} onChange={e => setForm({...form, [`option${n}`]: e.target.value})} required />
                            ))}
                        </div>
                        <div className="form-row">
                            <div style={{flex:1}}>
                                <select className="input-styled" value={form.answer} onChange={e => setForm({...form, answer: Number(e.target.value)})}>
                                    {[1,2,3,4].map(n => <option key={n} value={n}>Option {n} is correct</option>)}
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label className="custom-file-upload">
                                    <input type="file" onChange={handleImageChange} accept="image/*" />
                                    {image ? "Image Selected" : "Upload Image"}
                                </label>
                            </div>
                        </div>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button className="btn-main" type="submit">{isEditing ? "Update Question" : "Add Manually"}</button>
                            {isEditing && <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>}
                        </div>
                    </form>
                </div>

                <div className="questions-list-section">
                    <h3 className="list-title">Questions ({questions.length})</h3>
                    {questions.map((q, i) => (
                        <div key={q.id} className="q-list-item">
                            <div className="q-content">
                                <span className="q-number">#{i+1}</span>
                                <div>
                                    <span className="q-text">{q.questionDescription}</span>
                                    {q.imageName && <span style={{fontSize:'0.7rem', color:'#6366f1', marginLeft:'10px'}}>(Has Image)</span>}
                                </div>
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button className="btn-icon-edit" onClick={() => startEdit(q)}>✎</button>
                                <button className="btn-icon-del" onClick={() => deleteQuestion(q.id)}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="panel-right">
                <div className="dash-card preview-card">
                    <h3 className="section-title" style={{textAlign:'center'}}>Live Preview</h3>
                    <div className="preview-content">
                        {previewImage ? <img src={previewImage} className="preview-img-real" alt="" /> : <div className="preview-placeholder">Image Preview</div>}
                        <h4 className="preview-q-text">{form.questionDescription || "Question text will appear here..."}</h4>
                        <div className="preview-opts">
                            {[1,2,3,4].map(n => (
                                <div key={n} className={`preview-opt-row ${form.answer === n ? 'correct' : ''}`}>
                                    <div className="p-badge">{n}</div>
                                    <span className="p-text">{form[`option${n}`] || `Option ${n}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showAiModal && (
            <div className="modal-overlay">
                <div className="ai-modal">
                    <div className="ai-header">
                        <h2>AI Question Generator</h2>
                        <button className="close-btn-modal" onClick={() => setShowAiModal(false)}>✕</button>
                    </div>
                    <div className="ai-body">
                        <p>Topic to add questions for:</p>
                        <input 
                            className="input-styled" 
                            placeholder="e.g. Physics, Pop Culture..." 
                            value={aiTopic}
                            onChange={e => setAiTopic(e.target.value)}
                            autoFocus
                        />
                        <button className="btn-main ai-submit" onClick={handleAiGenerate} disabled={aiLoading}>
                            {aiLoading ? "Generating..." : "Generate 5 Questions"}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
