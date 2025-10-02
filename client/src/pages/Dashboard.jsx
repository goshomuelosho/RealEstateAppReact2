import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/login");
        return;
      }

      // 🧠 Fetch profile data (name + avatar)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData || {});
    };

    fetchProfile();
  }, [navigate]);

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
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

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
      <header style={headerStyle}>
        {/* Logo */}
        <Link to="/dashboard" style={logoStyle}>
          🏠 Real Estate
        </Link>

        {/* Navigation */}
        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

        {/* Profile Shortcut */}
        {profile && (
          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50px",
              padding: "0.4rem 0.9rem",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={profile.avatar_url || "https://via.placeholder.com/40"}
              alt="Avatar"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
            <span
              style={{
                fontSize: "0.95rem",
                fontWeight: "600",
                color: "#E2E8F0",
              }}
            >
              {profile.name || "My Profile"}
            </span>
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
              <button style={btnPrimary}>➕ Add New Estate</button>
            </Link>

            <Link to="/my-estates">
              <button style={btnSecondary}>🏡 View My Estates</button>
            </Link>
          </div>
        </div>
      </main>

      {/* 📜 Footer */}
      <footer style={footerStyle}>
        © {new Date().getFullYear()} Real Estate Management | Built with ❤️
      </footer>
    </div>
  );
}

/* 🎨 Styles */
const bgLight = (color, top, left, size) => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  background: `radial-gradient(circle, ${color}33, transparent)`,
  borderRadius: "50%",
  filter: "blur(60px)",
  opacity: 0.8,
});

const headerStyle = {
  flexShrink: 0,
  padding: "1.25rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  zIndex: 10,
  position: "sticky",
  top: 0,
};

const logoStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textDecoration: "none",
};

const btnPrimary = {
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
};

const btnSecondary = {
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
};

const footerStyle = {
  textAlign: "center",
  padding: "1rem",
  color: "#94a3b8",
  fontSize: "0.9rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  background: "rgba(15,23,42,0.5)",
};
