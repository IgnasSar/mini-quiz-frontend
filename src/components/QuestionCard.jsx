import React, { useState } from "react";

export default function QuestionCard({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const options = [question.option1, question.option2, question.option3, question.option4];

  const correctIndex = (() => {
    if (typeof question.answer === "number") {
      if (question.answer >= 1 && question.answer <= 4) return question.answer - 1;
      return question.answer; 
    }
    return 0;
  })();

  const handleSelect = (i) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const isCorrect = i === correctIndex;

    setTimeout(() => {
      onAnswer(isCorrect);
    }, 700);
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div>Question {index + 1} / {total}</div>
      </div>

      <div className="question-body">
        <p className="question-text">{question.questionDescription}</p>
        {question.imageName && (
          <img
            src={`${process.env.REACT_APP_API_STATIC_BASE || ""}/images/${question.imageName}`}
            alt="question"
            className="question-image"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
        <div className="options">
          {options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === correctIndex;
            let cls = "option-btn";
            if (locked) {
              if (isSelected && isCorrect) cls += " correct";
              else if (isSelected && !isCorrect) cls += " wrong";
              else if (isCorrect) cls += " reveal";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={locked}
                className={cls}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
