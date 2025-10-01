import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: "hidden",
        color: "#E2E8F0",
      }}
    >
      {/* 🌌 Floating Gradient Lights */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent)",
          borderRadius: "50%",
          filter: "blur(80px)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      {/* ✨ Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 🧭 Header */}
      <header
        style={{
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 10,
          position: "sticky",
          top: 0,
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          }}
        >
          🏠 Real Estate
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

        {/* User Info */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                fontSize: "0.9rem",
                color: "#94a3b8",
                padding: "0.5rem 1rem",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.6rem 1.5rem",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* 🏡 Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
          animation: "fadeInUp 0.8s ease",
        }}
      >
        <div style={{ maxWidth: "750px" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #ffffff, #94a3b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to Your Real Estate Dashboard 👋
          </h1>
          <p
            style={{
              color: "#cbd5e1",
              fontSize: "1.15rem",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            Manage your property listings with ease. Add, edit, and keep track
            of your real estate portfolio — all in one place.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link to="/add-estate">
              <button
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
                }}
              >
                ➕ Add New Estate
              </button>
            </Link>

            <Link to="/my-estates">
              <button
                style={{
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
                }}
              >
                🏡 View My Estates
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* 📜 Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          color: "#94a3b8",
          fontSize: "0.9rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          background: "rgba(15,23,42,0.5)",
        }}
      >
        © {new Date().getFullYear()} Real Estate Management | Built with ❤️
      </footer>
    </div>
  );
}
