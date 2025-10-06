import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function EstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estate, setEstate] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate("/login");

      // 👤 Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", userData.user.id)
        .single();
      setProfile(profileData || {});

      // 🏡 Fetch estate
      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Estate not found!");
        return navigate("/my-estates");
      }

      setEstate(data);
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this estate?")) return;
    const { error } = await supabase.from("estates").delete().eq("id", id);
    if (error) alert(error.message);
    else navigate("/my-estates");
  };

  if (loading) {
    return (
      <div style={loaderContainer}>
        <div style={loaderSpinner} />
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      {/* 🌌 Floating Gradient Lights */}
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />
      <style>{keyframes}</style>

      {/* 🧭 Header */}
      <header style={headerStyle}>
        <Link to="/dashboard" style={logoStyle}>
          🏠 Real Estate
        </Link>

        <nav style={{ display: "flex", gap: "2rem" }}>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

        {/* 👤 Profile Shortcut */}
        {profile && (
          <div style={profileBox} onClick={() => navigate("/profile")}>
            <img
              src={profile.avatar_url || "https://via.placeholder.com/40"}
              alt="Avatar"
              style={avatarStyle}
            />
            <span style={profileName}>{profile.name || "My Profile"}</span>
          </div>
        )}
      </header>

      {/* 🏡 Estate Details Card */}
      <main style={mainStyle}>
        <div style={estateCard}>
          {estate.image_url && (
            <img
              src={estate.image_url}
              alt={estate.title}
              style={estateImage}
            />
          )}
          <h1 style={estateTitle}>{estate.title}</h1>
          <p style={estateLocation}>📍 {estate.location}</p>
          <p style={estatePrice}>${estate.price.toLocaleString()}</p>
          <p style={estateDescription}>{estate.description}</p>

          <div style={buttonGroup}>
            <button
              onClick={() => navigate(`/edit-estate/${estate.id}`)}
              style={editButton}
            >
              ✏️ Edit
            </button>
            <button onClick={handleDelete} style={deleteButton}>
              🗑️ Delete
            </button>
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
const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
const loaderContainer = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
};
const loaderSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255,255,255,0.3)",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
const pageContainer = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  color: "#E2E8F0",
};
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
const profileBox = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  cursor: "pointer",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "50px",
  padding: "0.4rem 0.9rem",
};
const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.2)",
};
const profileName = {
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#E2E8F0",
};
const mainStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "3rem 1.5rem",
  zIndex: 1,
  animation: "fadeInUp 0.8s ease",
};
const estateCard = {
  background: "rgba(255,255,255,0.95)",
  color: "#0f172a",
  borderRadius: "24px",
  padding: "2.5rem",
  width: "100%",
  maxWidth: "800px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};
const estateImage = {
  width: "100%",
  height: "350px",
  objectFit: "cover",
  borderRadius: "16px",
  marginBottom: "2rem",
};
const estateTitle = { fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" };
const estateLocation = { fontSize: "1.1rem", color: "#475569", marginBottom: "0.5rem" };
const estatePrice = { fontSize: "1.6rem", fontWeight: 700, color: "#3b82f6", margin: "1rem 0" };
const estateDescription = { fontSize: "1rem", lineHeight: 1.7, color: "#334155", marginBottom: "2rem" };
const buttonGroup = { display: "flex", justifyContent: "flex-end", gap: "1rem" };
const editButton = {
  padding: "0.9rem 1.5rem",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
};
const deleteButton = {
  ...editButton,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
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
