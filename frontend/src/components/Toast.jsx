import { useEffect } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { type = "info", message = "" } = toast;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="fs-5" />;
      case "danger":
      case "error":
        return <FaTimesCircle className="fs-5" />;
      case "warning":
        return <FaExclamationTriangle className="fs-5" />;
      default:
        return <FaInfoCircle className="fs-5" />;
    }
  };

  return (
    <div className={`app-toast toast-${type}`}>
      <div className="d-flex align-items-center gap-2">
        {getIcon()}
        <span>{message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="إغلاق">
        <FaTimes />
      </button>
    </div>
  );
}
