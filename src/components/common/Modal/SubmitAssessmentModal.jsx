import "./SubmitAssessmentModal.css";

const SubmitAssessmentModal = ({ isOpen, onClose, onConfirm, hasUnanswered }) => {
  if (!isOpen) return null;

  return (
    <div className="submit-assessment-backdrop" onClick={onClose}>
      <div className="submit-assessment-card" onClick={(e) => e.stopPropagation()}>
        <button className="submit-assessment-close" onClick={onClose}>✕</button>

        <h2 className="submit-assessment-title">
          Are You Sure You Want to Submit Assessment?
        </h2>

        <p className={`submit-assessment-warning ${hasUnanswered ? "submit-assessment-warning--unanswered" : "submit-assessment-warning--complete"}`}>
          {hasUnanswered ? "YOU HAVE UNANSWERED QUESTIONS" : "YOU HAVE ANSWERED ALL QUESTIONS"}
        </p>

        <p className="submit-assessment-desc">
          Submitting this form will count as an attempt, do you still want to proceed?
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
