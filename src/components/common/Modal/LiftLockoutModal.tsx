import React from "react";
import { Unlock, X, AlertCircle } from "lucide-react";
import "./LiftLockoutModal.css";

export interface LockedOutLearnerData {
  user_id: string | number;
  assessment_id: number;
  name: string;
  email: string;
  course: string;
  module: string;
  assessmentTitle?: string;
  bestScore?: number;
  attempts?: number;
}

interface LiftLockoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  learner: LockedOutLearnerData | null;
  isLoading?: boolean;
}

const LiftLockoutModal: React.FC<LiftLockoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  learner,
  isLoading = false,
}) => {
  if (!isOpen || !learner) return null;

  return (
    <div className="lift-lockout-backdrop" onClick={() => !isLoading && onClose()}>
      <div className="lift-lockout-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="lift-lockout-close"
          onClick={() => !isLoading && onClose()}
          aria-label="Close"
          disabled={isLoading}
        >
          <X size={18} />
        </button>

        <div className="lift-lockout-header">
          <div className="lift-lockout-icon">
            <Unlock size={26} strokeWidth={2.4} />
          </div>
          <h2 className="lift-lockout-title">Lift Assessment Lockout</h2>
          <p className="lift-lockout-subtitle">
            Are you sure you want to lift the lockout for this learner?
          </p>
        </div>

        <div className="lift-lockout-details">
          <div className="lift-lockout-detail-row">
            <span className="lift-lockout-detail-label">Learner:</span>
            <span className="lift-lockout-detail-val" title={learner.name}>
              {learner.name}
            </span>
          </div>
          <div className="lift-lockout-detail-row">
            <span className="lift-lockout-detail-label">Email:</span>
            <span className="lift-lockout-detail-val" title={learner.email}>
              {learner.email}
            </span>
          </div>
          <div className="lift-lockout-detail-row">
            <span className="lift-lockout-detail-label">Course:</span>
            <span className="lift-lockout-detail-val" title={learner.course}>
              {learner.course}
            </span>
          </div>
          <div className="lift-lockout-detail-row">
            <span className="lift-lockout-detail-label">Assessment:</span>
            <span className="lift-lockout-detail-val" title={learner.assessmentTitle || learner.module}>
              {learner.assessmentTitle || learner.module}
            </span>
          </div>
          <div className="lift-lockout-detail-row">
            <span className="lift-lockout-detail-label">Attempts Used:</span>
            <span className="lift-lockout-detail-val" style={{ color: "#dc2626" }}>
              {learner.attempts ?? 3} / 3 (Best: {learner.bestScore ?? 0}%)
            </span>
          </div>
        </div>

        <div className="lift-lockout-notice">
          <AlertCircle size={16} color="#c2410c" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            This action will reset the learner's active attempts for this assessment, allowing them to retake the exam up to 3 more times.
          </div>
        </div>

        <div className="lift-lockout-actions">
          <button
            type="button"
            className="lift-lockout-btn lift-lockout-btn--cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="lift-lockout-btn lift-lockout-btn--confirm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            <Unlock size={15} />
            {isLoading ? "Lifting..." : "Confirm & Lift"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiftLockoutModal;
