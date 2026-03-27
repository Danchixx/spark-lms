import { Timer } from "lucide-react";
import "./TimeUpModal.css";

const TimeUpModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="timeup-backdrop" onClick={onClose}>
      <div className="timeup-card" onClick={(e) => e.stopPropagation()}>
        <button className="timeup-close" onClick={onClose}>✕</button>

        <h2 className="timeup-title">
          <Timer size={28} color="#e74c3c" /> Time is up!
        </h2>

        <p className="timeup-warning">YOU DON'T HAVE ANY TIME LEFT</p>

        <p className="timeup-desc">
          Sorry, this form will now auto-submit.
        </p>

        <button className="timeup-btn" onClick={onClose}>
          OKAY
        </button>
      </div>
    </div>
  );
};

export default TimeUpModal;
