import { LogOut } from "lucide-react";
import "./LogoutModal.css";

const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-backdrop" onClick={onCancel}>
      <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">
          <LogOut size={26} color="#e74c3c" />
        </div>

        <h2 className="logout-modal-title">Log Out?</h2>
        <p className="logout-modal-desc">
          Are you sure you want to log out? You will need to sign in again to
          access your account.
        </p>

        <div className="logout-modal-actions">
          <button
            className="logout-modal-btn logout-modal-btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="logout-modal-btn logout-modal-btn--confirm"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
