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
    questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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
          alert("Quiz settings saved successfully!");
      } catch (err) { alert("Failed to save settings"); }
  };

  const deleteQuiz = async () => {
      if(window.confirm("Are you sure? This cannot be undone.")) {
          await api.delete(`/Quiz/${quizId}`);
          navigate("/my-quizzes");
      }
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
      if(file) setPreviewImage(URL.createObjectURL(file));
      else setPreviewImage(null);
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    
    const fd = new FormData();
    fd.append("QuizId", quizId);
    fd.append("QuestionDescription", form.questionDescription);
    fd.append("Option1", form.option1);
    fd.append("Option2", form.option2);
    fd.append("Option3", form.option3);
    fd.append("Option4", form.option4);
    fd.append("Answer", form.answer);
    
    if(image) {
        fd.append("ImageFile", image);
    }
    
    try {
        await api.post("/Quiz/add-question", fd);
        setForm({ questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 });
        setImage(null);
        setPreviewImage(null);
        loadAllData();
    } catch (err) {
        console.error(err);
        alert("Failed to add question. Please check all fields.");
    }
  };

  const deleteQuestion = async (id) => {
      if(window.confirm("Delete this question?")) {
          await api.delete(`/Quiz/question/${id}`);
          loadAllData();
      }
  };

  if (loading) return <div className="page-wrapper" style={{paddingTop:'100px', textAlign:'center'}}>Loading Quiz Data...</div>;

  return (
    <div className="page-wrapper">
      <div className="container edit-container">
        
        <div className="edit-header">
            <button onClick={() => navigate("/my-quizzes")} className="back-link">
                <span>← Back to Library</span>
            </button>
            <h1 className="page-title">Edit Quiz</h1>
        </div>

        <div className="editor-layout">
            
            <div className="panel-left">
                <div className="dash-card">
                    <h3 className="section-title">General Settings</h3>
                    <label className="label">Quiz Title</label>
                    <input className="input-styled" value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})} />
                    
                    <label className="label">Description</label>
                    <textarea className="input-styled" rows="3" value={quizData.description} onChange={e => setQuizData({...quizData, description: e.target.value})} />
                    
                    <div className="visibility-box">
                        <label className="label">Visibility</label>
                        <div 
                            className={`toggle-switch ${quizData.isPublic ? 'on' : 'off'}`} 
                            onClick={() => setQuizData({...quizData, isPublic: !quizData.isPublic})}
                        >
                            <div className="toggle-knob"></div>
                        </div>
                        <span className="vis-status">{quizData.isPublic ? "Public (In Community)" : "Private (Only You)"}</span>
                    </div>

                    <div className="btn-group">
                        <button className="btn-main" onClick={saveSettings}>Save Changes</button>
                        <button className="btn-outline danger" onClick={deleteQuiz}>Delete Quiz</button>
                    </div>
                </div>
            </div>

            <div className="panel-center">
                <div className="dash-card">
                    <h3 className="section-title">Add Question</h3>
                    <form onSubmit={addQuestion}>
                        <label className="label">Question Text</label>
                        <input className="input-styled" placeholder="e.g. Which planet is red?" value={form.questionDescription} onChange={e => setForm({...form, questionDescription: e.target.value})} required />
                        
                        <label className="label">Options</label>
                        <div className="options-grid-mini">
                            {[1,2,3,4].map(n => (
                                <input key={n} className="input-styled" placeholder={`Option ${n}`} value={form[`option${n}`]} onChange={e => setForm({...form, [`option${n}`]: e.target.value})} required />
                            ))}
                        </div>
                        
                        <div className="form-row">
                            <div style={{flex:1}}>
                                <label className="label">Correct Answer</label>
                                <select className="input-styled" value={form.answer} onChange={e => setForm({...form, answer: Number(e.target.value)})}>
                                    {[1,2,3,4].map(n => <option key={n} value={n}>Option {n}</option>)}
                                </select>
                            </div>
                            <div style={{flex:1}}>
                                <label className="label">Image (Optional)</label>
                                <label className="custom-file-upload">
                                    <input type="file" onChange={handleImageChange} accept="image/*" />
                                    {image ? "Change File" : "Choose File"}
                                </label>
                                {image && <span style={{fontSize:'0.8rem', color:'var(--success)', display:'block', marginTop:'5px'}}>✓ {image.name}</span>}
                            </div>
                        </div>

                        <button className="btn-main" type="submit">+ Add Question</button>
                    </form>
                </div>

                <div className="questions-list-section">
                    <h3 className="list-title">Questions ({questions.length})</h3>
                    <div className="questions-grid-row">
                        {questions.length === 0 && <p className="empty-text">No questions yet.</p>}
                        {questions.map((q, i) => (
                            <div key={q.id} className="q-list-item">
                                <div className="q-content">
                                    <span className="q-number">#{i+1}</span>
                                    <span className="q-text">{q.questionDescription}</span>
                                </div>
                                <button className="btn-icon-del" onClick={() => deleteQuestion(q.id)} title="Delete">
                                    🗑
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="panel-right">
                <div className="dash-card preview-card">
                    <h3 className="section-title" style={{textAlign:'center', fontSize:'0.9rem'}}>Card Preview</h3>
                    <div className="preview-content">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="preview-img-real" />
                        ) : (
                            <div className="preview-placeholder">No Image</div>
                        )}
                        <h4 className="preview-q-text">{form.questionDescription || "Question text..."}</h4>
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
    </div>
  );
}
