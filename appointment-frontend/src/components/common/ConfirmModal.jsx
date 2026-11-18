import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-overlay"
      onClick={loading ? undefined : onClose}
    >
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal__header">
          <h2 className="confirm-modal__title">Cancel Appointment</h2>
          <button
            type="button"
            className="confirm-modal__close"
            onClick={onClose}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <div className="confirm-modal__body">
          <p className="confirm-modal__message">
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </p>

          {error && <div className="confirm-modal__error">{error}</div>}
        </div>

        <div className="confirm-modal__footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Keep Appointment
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
