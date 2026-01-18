import { useEffect } from "react";

/**
 * ✅ SuccessModal Component
 * Props:
 * - message (string): text to display
 * - onClose (function): called when modal closes
 * - duration (number): auto-close after ms (default 2500)
 */
export default function SuccessModal({
  message = "Action completed successfully!",
  onClose,
  duration = 2500,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: "fadeIn 0.3s ease",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          color: "#0f172a",
          padding: "2rem 2.5rem",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          transform: "scale(1)",
          animation: "popIn 0.3s ease",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>✅ Успешно!</h3>
        <p style={{ fontSize: "1rem", color: "#475569" }}>{message}</p>
      </div>
    </div>
  );
}
