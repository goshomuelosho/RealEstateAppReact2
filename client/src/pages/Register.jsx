import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("✅ Check your email to confirm your account!");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))",
        color: "var(--text-color)",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          padding: "2.5rem 2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          animation: "fadeIn 0.5s ease forwards",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            color: "#0F172A",
            fontWeight: 600,
            fontSize: "1.75rem",
          }}
        >
          Create Your Account
        </h2>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "1rem",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "1rem",
              background: "#F8FAFC",
              color: "#0F172A",
            }}
          />

          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, var(--primary-color), #3b82f6)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.8rem 1.2rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(30, 64, 175, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.25)";
            }}
          >
            Register
          </button>
        </form>

        {/* ✅ Styled feedback messages */}
        {error && (
          <p style={{ marginTop: "1rem", color: "var(--error-color)", fontSize: "0.9rem" }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ marginTop: "1rem", color: "var(--success-color)", fontSize: "0.9rem" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "1.5rem", color: "var(--text-light)" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{
              color: "var(--primary-color)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
