import "./AssessmentSuccessModal.css";

const AssessmentSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="assessment-success-backdrop" onClick={onClose}>
      <div className="assessment-success-card" onClick={(e) => e.stopPropagation()}>
        <button className="assessment-success-close" onClick={onClose}>✕</button>

        <h2 className="assessment-success-title">
          Assessment Submitted Successfully!
        </h2>

        <p className="assessment-success-label">WELL DONE</p>

        <p className="assessment-success-desc">
          Go to Attempts to see your result
        </p>

        <button className="assessment-success-btn" onClick={onClose}>
          OKAY
        </button>
      </div>
    </div>
  );
};

export default AssessmentSuccessModal;
