import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { LOGIN_REDIRECT_URL } from "../utils/authRedirects";
import {
  createRandomUsername,
  isUsernameTaken,
  normalizeUsername,
  validateUsername,
} from "../utils/username";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => createRandomUsername());
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

    const normalizedUsername = normalizeUsername(username);
    const usernameValidationError = validateUsername(normalizedUsername);
    if (usernameValidationError) {
      setError(usernameValidationError);
      setLoading(false);
      return;
    }

    try {
      const taken = await isUsernameTaken(supabase, normalizedUsername);
      if (taken) {
        setError("Това потребителско име вече е заето.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Не успяхме да проверим потребителското име. Опитай отново.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: LOGIN_REDIRECT_URL,
        data: {
          name: normalizedUsername,
          username: normalizedUsername,
        },
      },
    });

    if (!error && data?.session?.user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.session.user.id,
        name: normalizedUsername,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        if (profileError.code === "23505") {
          setError("Това потребителско име вече е заето.");
        } else {
          setError("Акаунтът е създаден, но името не можа да се запази. Опитай от профила.");
        }
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    if (error) {
      setError(error.message); // (auth error from Supabase - keep as is)
    } else {
      setMessage("✅ Провери имейла си, за да потвърдиш акаунта!");
      setTimeout(() => navigate("/login"), 2500);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        padding: "clamp(0.85rem, 3vh, 2rem) clamp(0.85rem, 3vw, 2rem)",
      }}
    >
      {/* 🌌 Animated background elements */}
      <div
        className="auth-orb"
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "clamp(180px, 34vw, 400px)",
          height: "clamp(180px, 34vw, 400px)",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        className="auth-orb"
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          width: "clamp(160px, 30vw, 350px)",
          height: "clamp(160px, 30vw, 350px)",
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.25), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 10s ease-in-out infinite reverse",
          pointerEvents: "none",
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
        .auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          scrollbar-gutter: stable;
        }
        .auth-card {
          width: min(100%, 460px);
        }
        @media (max-height: 760px) {
          .auth-page {
            align-items: flex-start !important;
          }
        }
        @media (max-width: 520px) {
          .auth-card {
            padding: 1.15rem 1rem !important;
            border-radius: 18px !important;
          }
          .auth-copy {
            margin-bottom: 1.5rem !important;
          }
          .auth-orb {
            filter: blur(65px) !important;
            opacity: 0.6;
          }
        }
      `}</style>

      {/* 🔹 Glassy Card */}
      <div
        className="auth-card"
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "clamp(1.25rem, 3.2vw, 3rem) clamp(1rem, 3vw, 2.5rem)",
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
            width: "clamp(56px, 11vw, 80px)",
            height: "clamp(56px, 11vw, 80px)",
            margin: "0 auto clamp(0.9rem, 2vh, 1.5rem)",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "clamp(1.7rem, 5vw, 2.5rem)" }}>🏠</span>
        </div>

        <h2
          style={{
            marginBottom: "0.5rem",
            color: "#f1f5f9",
            fontWeight: "800",
            fontSize: "clamp(1.45rem, 5vw, 2rem)",
            background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Създай акаунт
        </h2>
        <p
          className="auth-copy"
          style={{
            marginBottom: "clamp(1.25rem, 3vh, 2.5rem)",
            color: "#94a3b8",
            fontSize: "clamp(0.86rem, 2.5vw, 0.95rem)",
          }}
        >
          Присъедини се, за да публикуваш имотите си
        </p>

        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.9rem, 2.2vh, 1.5rem)",
            textAlign: "left",
          }}
        >
          {/* 👤 Username */}
          <div>
            <label style={labelStyle}>Потребителско име</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={iconStyle} aria-hidden="true">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                onClick={() => setUsername(createRandomUsername())}
                style={randomButtonStyle}
              >
                Рандъм
              </button>
            </div>
          </div>

          {/* ✉️ Email */}
          <div>
            <label style={labelStyle}>Имейл адрес</label>
            <div style={{ position: "relative" }}>
              <span style={iconStyle} aria-hidden="true">
                <Mail size={18} />
              </span>
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
            <label style={labelStyle}>Парола</label>
            <div style={{ position: "relative" }}>
              <span style={iconStyle} aria-hidden="true">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Минимум 6 символа"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, padding: "1rem 3rem 1rem 3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
                aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "0.5rem",
              }}
            >
              Трябва да е поне 6 символа
            </p>
          </div>

          {/* 🚀 Register Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "clamp(0.85rem, 2vh, 1.1rem)",
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
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
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
                Създаване...
              </span>
            ) : (
              "Създай акаунт"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={errorStyle}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div style={successStyle}>
            <span>✅</span> {message}
          </div>
        )}

        {/* Login Link */}
        <div
          style={{
            marginTop: "clamp(1.15rem, 2.5vh, 2rem)",
            paddingTop: "clamp(0.9rem, 2vh, 1.5rem)",
            borderTop: "1px solid #334155",
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Вече имаш акаунт?{" "}
            <Link
              to="/login"
              style={{
                color: "#3b82f6",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Вход
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#94a3b8",
};

const randomButtonStyle = {
  border: "1px solid #334155",
  borderRadius: "12px",
  background: "rgba(148,163,184,0.12)",
  color: "#e2e8f0",
  padding: "0 0.85rem",
  fontSize: "0.82rem",
  fontWeight: 700,
  cursor: "pointer",
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
