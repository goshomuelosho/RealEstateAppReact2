import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

/* 🎨 Styles (moved to top for ESLint + clarity) */
const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const pageContainer = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  color: "#E2E8F0",
  transition: "opacity 0.4s ease",
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
  padding: "1.25rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15,23,42,0.6)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  position: "sticky",
  top: 0,
  zIndex: 10,
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
  transition: "all 0.3s ease",
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.2)",
};

const profileName = { fontSize: "0.95rem", fontWeight: "600", color: "#E2E8F0" };

const mainStyle = { flex: 1, padding: "3rem 2rem", animation: "fadeInUp 0.8s ease" };

const contentWrapper = { maxWidth: "1400px", margin: "0 auto" };

const titleBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "2rem",
};

const pageTitle = {
  fontSize: "2.25rem",
  fontWeight: "800",
  background: "linear-gradient(135deg, #ffffff, #94a3b8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const addButton = {
  padding: "0.9rem 1.5rem",
  background: "linear-gradient(135deg, #10b981, #059669)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(16,185,129,0.4)",
};

const filterBar = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  padding: "1rem 1.25rem",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.1)",
  marginBottom: "2rem",
};

const filterInput = (extra) => ({
  padding: "0.7rem 1rem",
  borderRadius: "9999px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  ...extra,
});

const filterSelect = {
  padding: "0.7rem 1rem",
  borderRadius: "9999px",
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "#1e293b",
  color: "#f1f5f9",
  fontSize: "0.9rem",
  outline: "none",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "2rem",
};

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "20px",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
  display: "flex",
  flexDirection: "column",
};

const priceBadge = {
  display: "inline-block",
  padding: "0.5rem 1.25rem",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  borderRadius: "10px",
  color: "white",
  fontWeight: "700",
  fontSize: "1.25rem",
};

const cardActions = {
  padding: "1rem 1.5rem",
  display: "flex",
  gap: "0.75rem",
  background: "rgba(241,245,249,0.5)",
};

const actionBtn = (type) => ({
  flex: 1,
  background:
    type === "green"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : "linear-gradient(135deg, #ef4444, #dc2626)",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  padding: "0.8rem",
});

const loaderContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
};

const loaderSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255,255,255,0.3)",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const emptyState = { color: "#94a3b8", textAlign: "center", marginTop: "2rem" };

const footerStyle = {
  textAlign: "center",
  padding: "1rem",
  color: "#94a3b8",
  fontSize: "0.9rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  background: "rgba(15,23,42,0.5)",
};

/* 🧭 Component */
export default function MyEstates() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [estates, setEstates] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const [titleSearch, setTitleSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const navigate = useNavigate();

  const fetchEstates = useCallback(
    async (userId) => {
      setLoading(true);
      let query = supabase.from("estates").select("*").eq("user_id", userId);

      if (titleSearch.trim()) query = query.ilike("title", `%${titleSearch}%`);
      if (locationSearch.trim()) query = query.ilike("location", `%${locationSearch}%`);

      if (sortOrder === "low-high") query = query.order("price", { ascending: true });
      else if (sortOrder === "high-low") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (!error) setEstates(data || []);
      setLoading(false);
      setTimeout(() => setIsLoaded(true), 150);
    },
    [titleSearch, locationSearch, sortOrder]
  );

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData || {});
      fetchEstates(userData.user.id);
    };
    init();
  }, [navigate, fetchEstates]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this estate?")) return;
    const { error } = await supabase.from("estates").delete().eq("id", id);
    if (!error) setEstates((prev) => prev.filter((e) => e.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && profile?.id) {
      fetchEstates(profile.id);
    }
  };

  useEffect(() => {
    if (profile?.id) fetchEstates(profile.id);
  }, [sortOrder, profile, fetchEstates]);

  return (
    <div style={{ ...pageContainer, opacity: isLoaded ? 1 : 0 }}>
      {/* 🌌 Floating Gradient Lights */}
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />
      <style>{keyframes}</style>

      <Header profile={profile} navigate={navigate} />

      <main style={mainStyle}>
        <div style={contentWrapper}>
          {/* Title */}
          <div style={titleBar}>
            <h1 style={pageTitle}>My Estates</h1>
            <Link to="/add-estate">
              <button style={addButton}>➕ Add Estate</button>
            </Link>
          </div>

          {/* Filters */}
          <div style={filterBar}>
            <input
              type="text"
              placeholder="Search Title..."
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              style={filterInput({ flex: "1 1 220px" })}
            />
            <input
              type="text"
              placeholder="Search Location..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              style={filterInput({ flex: "1 1 220px" })}
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={filterSelect}
            >
              <option value="newest">🕒 Newest First</option>
              <option value="low-high">💲 Price: Low → High</option>
              <option value="high-low">💰 Price: High → Low</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={loaderContainer}>
              <div style={loaderSpinner} />
            </div>
          ) : estates.length > 0 ? (
            <div style={grid}>
              {estates.map((estate) => (
                <EstateCard
                  key={estate.id}
                  estate={estate}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  handleDelete={handleDelete}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <p style={emptyState}>No estates found.</p>
          )}
        </div>
      </main>

      <footer style={footerStyle}>
        © {new Date().getFullYear()} Real Estate Management | Built with ❤️
      </footer>
    </div>
  );
}

/* 🔹 Header */
function Header({ profile, navigate }) {
  return (
    <header style={headerStyle}>
      <Link to="/dashboard" style={logoStyle}>
        🏠 Real Estate
      </Link>

      <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link to="/my-estates" style={{ color: "#3b82f6", fontWeight: "600" }}>
          My Estates
        </Link>
      </nav>

      {profile && (
        <div onClick={() => navigate("/profile")} style={profileBox}>
          <img
            src={profile.avatar_url || "https://via.placeholder.com/40"}
            alt="Avatar"
            style={avatarStyle}
          />
          <span style={profileName}>{profile.name || "My Profile"}</span>
        </div>
      )}
    </header>
  );
}

/* 🔹 Estate Card */
function EstateCard({ estate, hoveredCard, setHoveredCard, handleDelete, navigate }) {
  return (
    <div
      style={{
        ...cardStyle,
        boxShadow:
          hoveredCard === estate.id
            ? "0 20px 60px rgba(59,130,246,0.4)"
            : "0 10px 40px rgba(0,0,0,0.3)",
        transform:
          hoveredCard === estate.id ? "translateY(-8px) scale(1.02)" : "translateY(0)",
      }}
      onMouseEnter={() => setHoveredCard(estate.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {estate.image_url && (
        <img
          src={estate.image_url}
          alt={estate.title}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hoveredCard === estate.id ? "scale(1.05)" : "scale(1)",
          }}
        />
      )}
      <div style={{ padding: "1.5rem", flex: 1 }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a" }}>
          {estate.title}
        </h3>
        <p style={{ color: "#64748b", margin: "0.75rem 0" }}>📍 {estate.location}</p>
        <div style={priceBadge}>${estate.price.toLocaleString()}</div>
      </div>
      <div style={cardActions}>
        <button style={actionBtn("green")} onClick={() => navigate(`/edit-estate/${estate.id}`)}>
          ✏️ Edit
        </button>
        <button style={actionBtn("red")} onClick={() => handleDelete(estate.id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
