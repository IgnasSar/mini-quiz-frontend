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
      <div className="edit-container">
        
        <div className="edit-header">
            <button onClick={() => navigate("/my-quizzes")} className="back-link">← Back</button>
            <h1 className="page-title">Edit Quiz</h1>
        </div>

        <div className="editor-layout">
            
            {/* LEFT: Settings */}
            <div className="panel-left">
                <div className="dash-card settings-card">
                    <h3 className="section-title">Settings</h3>
                    
                    <label className="label">Title</label>
                    <input className="input-styled" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} />
                    
                    <label className="label">Description</label>
                    <textarea className="input-styled" rows="4" value={quizData.description} onChange={e => setQuizData({...quizData, description: e.target.value})} />
                    
                    <div className="visibility-box">
                        <span className="vis-status">{quizData.isPublic ? "Public Quiz" : "Private Quiz"}</span>
                        <div className={`toggle-switch ${quizData.isPublic ? 'on' : 'off'}`} onClick={() => setQuizData({...quizData, isPublic: !quizData.isPublic})}>
                            <div className="toggle-knob"></div>
                        </div>
                    </div>
                    
                    <div className="btn-group">
                        <button className="btn-main" onClick={saveSettings}>Save Changes</button>
                        <button className="btn-outline danger" onClick={deleteQuiz}>Delete Quiz</button>
                    </div>
                </div>
            </div>

            {/* CENTER: Editor Form & List */}
            <div className="panel-center">
                
                {/* Form Card */}
                <div className="dash-card editor-form-card">
                    <div className="section-title">
                        {isEditing ? "Edit Question" : "New Question"}
                        {!isEditing && <button className="ai-btn" onClick={() => setShowAiModal(true)}>✨ AI Generate</button>}
                    </div>
                    
                    <form onSubmit={submitQuestion}>
                        <input className="input-styled" placeholder="Question Text" value={form.questionDescription} onChange={e => setForm({...form, questionDescription: e.target.value})} required />
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                            <input className="input-styled" placeholder="Option 1" value={form.option1} onChange={e => setForm({...form, option1: e.target.value})} required />
                            <input className="input-styled" placeholder="Option 2" value={form.option2} onChange={e => setForm({...form, option2: e.target.value})} required />
                            <input className="input-styled" placeholder="Option 3" value={form.option3} onChange={e => setForm({...form, option3: e.target.value})} required />
                            <input className="input-styled" placeholder="Option 4" value={form.option4} onChange={e => setForm({...form, option4: e.target.value})} required />
                        </div>

                        <div style={{display:'flex', gap:'10px', alignItems:'center', marginBottom:'1rem'}}>
                            <select className="input-styled" style={{marginBottom:0, flex:1}} value={form.answer} onChange={e => setForm({...form, answer: Number(e.target.value)})}>
                                <option value={1}>Option 1 is Correct</option>
                                <option value={2}>Option 2 is Correct</option>
                                <option value={3}>Option 3 is Correct</option>
                                <option value={4}>Option 4 is Correct</option>
                            </select>
                            <label className="btn-outline" style={{padding:'0.8rem', flex:1, textAlign:'center', marginBottom:0, fontSize:'0.9rem'}}>
                                <input type="file" onChange={handleImageChange} accept="image/*" style={{display:'none'}} />
                                {image ? "Image Selected" : "Upload Image"}
                            </label>
                        </div>

                        <div style={{display:'flex', gap:'10px'}}>
                            <button className="btn-main" type="submit">{isEditing ? "Update" : "Add Question"}</button>
                            {isEditing && <button type="button" className="btn-outline" onClick={cancelEdit}>Cancel</button>}
                        </div>
                    </form>
                </div>

                {/* Questions List Card */}
                <div className="dash-card questions-list-card">
                    <div className="list-header">
                        <h3 className="section-title" style={{marginBottom:0}}>Questions ({questions.length})</h3>
                    </div>
                    <div className="questions-scroll-area">
                        {questions.length === 0 ? <p style={{color:'#64748b', textAlign:'center', marginTop:'2rem'}}>No questions added yet.</p> :
                        questions.map((q, i) => (
                            <div key={q.id} className="q-list-item" onClick={() => startEdit(q)}>
                                <div className="q-content">
                                    <span className="q-number">#{i+1}</span>
                                    <div style={{display:'flex', flexDirection:'column', width:'100%'}}>
                                        <span className="q-text">{q.questionDescription}</span>
                                        {q.imageName && <span className="has-image-badge">IMG</span>}
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'8px', alignItems:'flex-start'}}>
                                    <button className="btn-icon-edit" onClick={(e) => {e.stopPropagation(); startEdit(q);}}>✎</button>
                                    <button className="btn-icon-del" onClick={(e) => {e.stopPropagation(); deleteQuestion(q.id);}}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: Live Preview */}
            <div className="panel-right">
                <div className="dash-card preview-card">
                    <div style={{padding:'1.5rem', flexShrink:0, borderBottom:'1px solid #334155'}}>
                        <h3 className="section-title" style={{textAlign:'center', marginBottom:0}}>Live Preview</h3>
                    </div>
                    
                    <div className="preview-content">
                        <div style={{padding:'1.5rem', flex:1, display:'flex', flexDirection:'column'}}>
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
