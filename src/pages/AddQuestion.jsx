import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/AddQuestion.css";

export default function AddQuestion() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ questionDescription: "", option1: "", option2: "", option3: "", option4: "", answer: 1 });
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(k => formData.append(k, form[k]));
    if (image) formData.append("imageFile", image);
    try {
      await api.post("/Question", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Added!"); navigate("/admin");
    } catch { alert("Error"); }
  };

  return (
    <div className="add-container">
      <div className="add-card">
        <div className="add-header">
            <h2 className="add-title">Add Question</h2>
            <button className="close-btn" onClick={() => navigate("/admin")}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
            <input className="add-input" placeholder="Question" value={form.questionDescription} onChange={e => setForm({...form, questionDescription: e.target.value})} required />
            <div className="file-zone">
                <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" style={{display:'none'}} id="f" />
                <label htmlFor="f" style={{cursor:'pointer'}}>{image ? image.name : "Upload Image"}</label>
            </div>
            <div className="opt-grid">
                {[1,2,3,4].map(n => <input key={n} className="add-input" placeholder={`Option ${n}`} value={form[`option${n}`]} onChange={e => setForm({...form, [`option${n}`]: e.target.value})} required />)}
            </div>
            <label>Correct Answer:</label>
            <select className="add-input" value={form.answer} onChange={e => setForm({...form, answer: Number(e.target.value)})}>
                {[1,2,3,4].map(n => <option key={n} value={n}>Option {n}</option>)}
            </select>
            <button className="save-btn">Save</button>
        </form>
      </div>
    </div>
  );
}
