import React, { useState } from "react";

export default function QuestionFormModal({ onClose }) {
  const [form, setForm] = useState({
    questionDescription: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5198/api/Question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionDescription: form.questionDescription,
          option1: form.option1,
          option2: form.option2,
          option3: form.option3,
          option4: form.option4,
          answer: Number(form.answer),
        }),
      });

      if (response.ok) {
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
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>
        <h2 className="text-indigo-400 text-2xl font-semibold mb-4">
          Create a New Question
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="questionDescription"
            placeholder="Question description"
            value={form.questionDescription}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="option1"
            placeholder="Option 1"
            value={form.option1}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="option2"
            placeholder="Option 2"
            value={form.option2}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="option3"
            placeholder="Option 3"
            value={form.option3}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="option4"
            placeholder="Option 4"
            value={form.option4}
            onChange={handleChange}
            required
          />

          <select
            name="answer"
            value={form.answer}
            onChange={handleChange}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
          >
            <option value={1}>Answer 1</option>
            <option value={2}>Answer 2</option>
            <option value={3}>Answer 3</option>
            <option value={4}>Answer 4</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Saving..." : "Save Question"}
          </button>

          {message && (
            <p className="text-center text-slate-300 text-sm mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
