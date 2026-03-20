import { Timer } from "lucide-react";
import "./SessionExpiredModal.css";

const SessionExpiredModal = ({ isOpen, onLoginAgain }) => {
  if (!isOpen) return null;

  return (
    <div className="session-expired-backdrop">
      <div className="session-expired-card">
        <div className="session-expired-icon">
          <Timer size={26} color="#FF6B00" />
        </div>

        <h2 className="session-expired-title">Session Expired</h2>
        <p className="session-expired-desc">
          Your session has expired due to inactivity. Please sign in again to
          continue.
        </p>

        <button className="session-expired-btn" onClick={onLoginAgain}>
          Login Again
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
