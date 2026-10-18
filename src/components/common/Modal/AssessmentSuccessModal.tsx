import "./AssessmentSuccessModal.css";

const AssessmentSuccessModal = ({ isOpen, onClose, isEvaluation }: { isOpen: boolean; onClose: () => void; isEvaluation?: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="assessment-success-backdrop" onClick={onClose}>
      <div className="assessment-success-card" onClick={(e) => e.stopPropagation()}>
        <button className="assessment-success-close" onClick={onClose}>✕</button>

        <h2 className="assessment-success-title">
          {isEvaluation ? "Evaluation Submitted Successfully!" : "Assessment Submitted Successfully!"}
        </h2>

        <p className="assessment-success-label">
          {isEvaluation ? "THANK YOU" : "WELL DONE"}
        </p>

        <p className="assessment-success-desc">
          {isEvaluation
            ? "Your evaluation and feedback have been recorded."
            : "Go to Attempts to see your result"}
        </p>

        <button className="assessment-success-btn" onClick={onClose}>
          OKAY
        </button>
      </div>
    </div>
  );
};

export default AssessmentSuccessModal;
