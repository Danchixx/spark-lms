import Button from "../../ui/Button/Button";
import "./AssessmentCard.css";

const AssessmentCard = ({
  moduleName,
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onBack,
  onNext,
  onSubmit,
  onDotClick,
  answers,
  isLastQuestion
}) => {
  if (!currentQuestion) return null;

  return (
    <div className="assessment-card-wrapper">
      <div className="assessment-card-header">
        <h2>{moduleName}</h2>
        <p>Answer all questions. Passing score is 80%</p>
      </div>

      <div className="assessment-question-label">
        QUESTION {currentIndex + 1} OF {totalQuestions}
      </div>

      <div className="assessment-question-text">
        {currentQuestion.question}
      </div>

      <div className="assessment-choices">
        {currentQuestion.choices.map((choice, idx) => (
          <div
            key={idx}
            className={`assessment-choice ${selectedAnswer === idx ? "assessment-choice--selected" : ""}`}
            onClick={() => onSelectAnswer(idx)}
          >
            <div className="assessment-choice-radio">
              <div className="assessment-choice-radio-inner" />
            </div>
            {choice}
          </div>
        ))}
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
