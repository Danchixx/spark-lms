import Button from "../../ui/Button/Button";
import "./AssessmentCard.css";

interface AssessmentCardProps {
  moduleName: string;
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: any;
  onAnswerChange: (value: any) => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onDotClick: (idx: number) => void;
  answers: Record<number, any>;
  isLastQuestion: boolean;
}

const AssessmentCard = ({
  moduleName,
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  onBack,
  onNext,
  onSubmit,
  onDotClick,
  answers,
  isLastQuestion
}: AssessmentCardProps) => {
  if (!currentQuestion) return null;

  return (
    <div className="assessment-card-wrapper">
      <div className="assessment-card-header">
        <h2>{moduleName}</h2>
        <p>Answer all questions. Passing score is 70%</p>
      </div>

      <div className="assessment-question-label">
        QUESTION {currentIndex + 1} OF {totalQuestions}
      </div>

      <div className="assessment-question-text">
        {currentQuestion.question}
      </div>

      <div className="assessment-choices">
        {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && (
          currentQuestion.choices.map((choice: string, idx: number) => (
            <div
              key={idx}
              className={`assessment-choice ${selectedAnswer === idx ? "assessment-choice--selected" : ""}`}
              onClick={() => onAnswerChange(idx)}
            >
              <div className="assessment-choice-radio">
                <div className="assessment-choice-radio-inner" />
              </div>
              {choice}
            </div>
          ))
        )}

        {currentQuestion.type === 'identification' && (
          <input
            className="assessment-text-input"
            type="text"
            placeholder="Type your answer here..."
            value={(selectedAnswer as string) || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
          />
        )}

        {currentQuestion.type === 'enumeration' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQuestion.correct_answers?.map((_: any, idx: number) => (
              <input
                key={idx}
                className="assessment-text-input"
                type="text"
                placeholder={`Answer ${idx + 1}...`}
                value={(selectedAnswer && selectedAnswer[idx]) || ""}
                onChange={(e) => {
                  const newAnswers = [...(selectedAnswer || Array(currentQuestion.correct_answers.length).fill(""))];
                  newAnswers[idx] = e.target.value;
                  onAnswerChange(newAnswers);
                }}
              />
            ))}
          </div>
        )}

        {currentQuestion.type === 'essay' && (
          <textarea
            className="assessment-text-input"
            rows={6}
            placeholder="Write your essay answer here..."
            value={(selectedAnswer as string) || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            style={{ resize: "vertical" }}
          />
        )}
      </div>

      <div className="assessment-card-footer">
        <div className="assessment-dots">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`assessment-dot ${answers[i] !== undefined ? "assessment-dot--answered" : ""} ${i === currentIndex ? "assessment-dot--current" : ""}`}
              onClick={() => onDotClick(i)}
            />
          ))}
        </div>

        <div className="assessment-footer-buttons">
          <Button
            variant="outline"
            rounded="pill"
            onClick={onBack}
            disabled={currentIndex === 0}
            style={{ width: 90, justifyContent: "center" }}
          >
            Back
          </Button>

          {isLastQuestion ? (
            <Button
              variant="primary"
              rounded="pill"
              onClick={onSubmit}
              style={{ width: 90, justifyContent: "center" }}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="primary"
              rounded="pill"
              onClick={onNext}
              style={{ width: 90, justifyContent: "center" }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentCard;
