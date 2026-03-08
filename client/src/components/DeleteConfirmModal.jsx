import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({
  open,
  title = "Изтриване на имот",
  message = "Сигурни ли сте, че искате да изтриете този имот? Това действие е необратимо.",
  confirmLabel = "Изтрий",
  cancelLabel = "Отказ",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
      <div style={card}>
        <div style={iconWrap}>
          <Trash2 size={30} aria-hidden="true" />
        </div>

        <h3 id="delete-confirm-title" style={titleStyle}>
          {title}
        </h3>
        <p style={messageStyle}>{message}</p>

        <div style={actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              ...cancelButton,
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...confirmButton,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Изтриване..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const card = {
  width: "min(92vw, 500px)",
  background: "rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "2.3rem 2rem",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};

const iconWrap = {
  width: "80px",
  height: "80px",
  margin: "0 auto 1.2rem",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px rgba(239,68,68,0.35)",
};

const titleStyle = {
  fontSize: "1.65rem",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "0.75rem",
};

const messageStyle = {
  color: "#475569",
  fontSize: "1rem",
  lineHeight: 1.5,
  margin: "0 0 1.5rem",
};

const actions = {
  display: "flex",
  justifyContent: "center",
  gap: "0.7rem",
  flexWrap: "wrap",
};

const baseButton = {
  border: "none",
  borderRadius: "12px",
  padding: "0.65rem 1rem",
  fontWeight: 700,
  minWidth: "120px",
};

const cancelButton = {
  ...baseButton,
  background: "rgba(15,23,42,0.08)",
  color: "#0f172a",
  border: "1px solid rgba(15,23,42,0.16)",
};

const confirmButton = {
  ...baseButton,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  boxShadow: "0 8px 18px rgba(239,68,68,0.28)",
};
