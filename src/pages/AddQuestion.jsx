import React, { useState } from "react";
import api from "../api";

export default function AddQuestion() {
  const [form, setForm] = useState({
    questionDescription: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: 1,
    imageName: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        questionDescription: form.questionDescription,
        option1: form.option1,
        option2: form.option2,
        option3: form.option3,
        option4: form.option4,
        answer: Number(form.answer),
        imageName: form.imageName || null,
      };

      const res = await api.post("/Question", payload);
      if (res.status >= 200 && res.status < 300) {
        setMessage("Question added successfully!");
        setForm({
          questionDescription: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          answer: 1,
        });
      } else {
        setMessage("Failed to add question.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-container">
      <div className="add-card">
        <h2 className="add-title">Add a New Question</h2>

        <form onSubmit={handleSubmit} className="add-form">
          <input
            type="text"
            name="questionDescription"
            placeholder="Question description"
            value={form.questionDescription}
            onChange={handleChange}
            required
          />
          <input name="option1" placeholder="Option 1" value={form.option1} onChange={handleChange} required />
          <input name="option2" placeholder="Option 2" value={form.option2} onChange={handleChange} required />
          <input name="option3" placeholder="Option 3" value={form.option3} onChange={handleChange} required />
          <input name="option4" placeholder="Option 4" value={form.option4} onChange={handleChange} required />

          <select name="answer" value={form.answer} onChange={handleChange}>
            <option value={1}>Answer 1</option>
            <option value={2}>Answer 2</option>
            <option value={3}>Answer 3</option>
            <option value={4}>Answer 4</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Question"}
          </button>

          {message && <p className="add-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
