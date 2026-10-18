import "./SubmitAssessmentModal.css";

type SubmitAssessmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasUnanswered: boolean;
  isEvaluation?: boolean;
};

const SubmitAssessmentModal = ({ isOpen, onClose, onConfirm, hasUnanswered, isEvaluation }: SubmitAssessmentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="submit-assessment-backdrop" onClick={onClose}>
      <div className="submit-assessment-card" onClick={(e) => e.stopPropagation()}>
        <button className="submit-assessment-close" onClick={onClose}>✕</button>

        <h2 className="submit-assessment-title">
          {isEvaluation ? "Are You Sure You Want to Submit Evaluation?" : "Are You Sure You Want to Submit Assessment?"}
        </h2>

        <p className={`submit-assessment-warning ${hasUnanswered ? "submit-assessment-warning--unanswered" : "submit-assessment-warning--complete"}`}>
          {isEvaluation
            ? (hasUnanswered ? "YOU HAVE UNANSWERED SECTIONS" : "YOU HAVE COMPLETED ALL SECTIONS")
            : (hasUnanswered ? "YOU HAVE UNANSWERED QUESTIONS" : "YOU HAVE ANSWERED ALL QUESTIONS")}
        </p>

        <p className="submit-assessment-desc">
          {isEvaluation
            ? "Your responses and feedback will be submitted for this course."
            : "Submitting this form will count as an attempt, do you still want to proceed?"}
        </p>

        <div className="submit-assessment-actions">
          <button className="submit-assessment-btn submit-assessment-btn--yes" onClick={onConfirm}>
            YES
          </button>
          <button className="submit-assessment-btn submit-assessment-btn--no" onClick={onClose}>
            NO
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssessmentModal;
