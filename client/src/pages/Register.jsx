import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const {error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("✅ Check your email to confirm your account!");
      setTimeout(() => navigate("/login"), 2500);
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
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      {/* 🌌 Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes success {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* 🔹 Glassy Card */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "3rem 2.5rem",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
          animation: "fadeIn 0.8s ease",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 🏠 Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 1.5rem",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "2.5rem" }}>🏠</span>
        </div>

        <h2
          style={{
            marginBottom: "0.5rem",
            color: "#f1f5f9",
            fontWeight: "800",
            fontSize: "2rem",
            background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create Account
        </h2>
        <p
          style={{
            marginBottom: "2.5rem",
            color: "#94a3b8",
            fontSize: "0.95rem",
          }}
        >
          Join Real Estate to list your properties
        </p>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            textAlign: "left",
          }}
        >
          {/* ✉️ Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={iconStyle}>📧</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* 🔒 Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <span style={iconStyle}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, padding: "1rem 3rem 1rem 3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? "🙈" : "👁️‍🗨️"}
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              Must be at least 6 characters long
            </p>
          </div>

          {/* 🚀 Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "1.1rem",
              background: loading
                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "1.05rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTop: "3px solid white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Creating Account...
              </span>
            ) : (
              "🚀 Create Account"
            )}
          </button>
        </form>

        {/* ⚠️ Error */}
        {error && (
          <div style={errorStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ✅ Success */}
        {message && (
          <div style={successStyle}>
            <span>✅</span> {message}
          </div>
        )}

        {/* 🔗 Login Link */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #334155",
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "1rem 1rem 1rem 3rem",
  border: "2px solid #334155",
  borderRadius: "12px",
  fontSize: "1rem",
  background: "#1e293b",
  color: "#f1f5f9",
  transition: "all 0.3s ease",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "#cbd5e1",
  marginBottom: "0.5rem",
};

const iconStyle = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "1.2rem",
  color: "#64748b",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8",
};

const errorStyle = {
  marginTop: "1.5rem",
  padding: "1rem",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "10px",
  color: "#dc2626",
  fontSize: "0.9rem",
  fontWeight: "500",
  animation: "shake 0.5s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
};

const successStyle = {
  marginTop: "1.5rem",
  padding: "1rem",
  background: "rgba(16,185,129,0.1)",
  border: "1px solid rgba(16,185,129,0.3)",
  borderRadius: "10px",
  color: "#059669",
  fontSize: "0.9rem",
  fontWeight: "500",
  animation: "success 0.5s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
};
