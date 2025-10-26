import React, { useState, useEffect } from "react";

export default function QuestionCard({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    setSelected(null);
    setLocked(false);
  }, [question]);

  const handleSelect = (optionIndex) => {
    if (locked) return;
    setSelected(optionIndex);
    setLocked(true);

    const isCorrect = optionIndex + 1 === question.answer;
    onAnswer(isCorrect);
  };

  const options = [
    question.option1,
    question.option2,
    question.option3,
    question.option4,
  ];

  return (
    <div className="question-card">
      <h2 className="question-title">
        Question {index + 1} / {total}
      </h2>

      <p className="question-text">{question.questionDescription}</p>

      <div className="options-grid">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`option-btn ${
              selected === i
                ? i + 1 === question.answer
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            disabled={locked}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
