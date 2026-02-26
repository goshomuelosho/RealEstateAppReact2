import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setHasRecoverySession(!!data.session);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasRecoverySession(!!session);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Паролата трябва да е поне 6 символа.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Паролите не съвпадат.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("✅ Паролата е обновена успешно. Пренасочваме те към вход...");
    setTimeout(() => navigate("/login"), 1600);
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Нова парола</h1>

        {!hasRecoverySession && (
          <p style={hint}>
            Отвори линка от имейла за reset password, за да активираш тази страница.
          </p>
        )}

        <form onSubmit={handleSubmit} style={form}>
          <input
            type="password"
            placeholder="Нова парола"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={input}
            required
          />
          <input
            type="password"
            placeholder="Потвърди новата парола"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={input}
            required
          />
          <button type="submit" style={button(loading || !hasRecoverySession)} disabled={loading || !hasRecoverySession}>
            {loading ? "Обновяване..." : "Запази новата парола"}
          </button>
        </form>

        {error ? <p style={errorText}>⚠️ {error}</p> : null}
        {message ? <p style={successText}>{message}</p> : null}
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
};

const card = {
  width: "100%",
  maxWidth: 480,
  borderRadius: 18,
  padding: "2rem 1.2rem",
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e2e8f0",
};

const title = {
  margin: 0,
  marginBottom: "1rem",
  textAlign: "center",
  color: "#f8fafc",
};

const hint = {
  marginTop: 0,
  marginBottom: "1rem",
  fontSize: "0.95rem",
  color: "#cbd5e1",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
};

const input = {
  width: "100%",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.1)",
  color: "#f8fafc",
  padding: "0.9rem 1rem",
};

const button = (disabled) => ({
  marginTop: "0.3rem",
  borderRadius: 12,
  padding: "0.9rem 1rem",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  background: disabled
    ? "linear-gradient(135deg, #94a3b8, #64748b)"
    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "#fff",
  fontWeight: 700,
});

const errorText = {
  marginTop: "0.9rem",
  marginBottom: 0,
  color: "#f87171",
  fontWeight: 600,
};

const successText = {
  marginTop: "0.9rem",
  marginBottom: 0,
  color: "#34d399",
  fontWeight: 600,
};
