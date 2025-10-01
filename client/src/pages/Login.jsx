import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const {error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
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
        background:
          "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 🔹 Floating Glow Backgrounds */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 10s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "350px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(100px)",
          animation: "float 12s ease-in-out infinite reverse",
        }}
      />

      {/* 🔹 Auth Card */}
      <div
        className="fadeInUp"
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(16px) saturate(180%)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          padding: "3rem 2.5rem",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          color: "var(--text-color)",
          animation: "fadeInUp 0.6s ease",
        }}
      >
        <h2
          style={{
            fontSize: "1.8rem",
            marginBottom: "1.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome Back
        </h2>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
          }}
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            style={{
              width: "100%",
            }}
          >
            Sign In
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: "var(--error-color)",
              marginTop: "1rem",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <p
          style={{
            marginTop: "1.5rem",
            color: "var(--text-light)",
            fontSize: "0.95rem",
          }}
        >
          Don’t have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--primary-color)",
              fontWeight: "600",
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* 🔹 Floating Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
