import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function MyEstates() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [estates, setEstates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }
      setUser(userData.user);

      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (!error) setEstates(data || []);
      setLoading(false);
    };
    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this estate?")) return;
    const { error } = await supabase.from("estates").delete().eq("id", id);
    if (!error) setEstates(estates.filter((e) => e.id !== id));
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
      }}
    >
      {/* 🌌 Floating Gradient Lights */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)",
          borderRadius: "50%",
          filter: "blur(60px)",
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
          flexShrink: 0,
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
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
          <Link to="/my-estates" style={{ color: "#3b82f6", fontWeight: 600 }}>
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

      {/* 🏡 Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "3rem 2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            animation: "fadeInUp 0.8s ease",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #ffffff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              My Estates
            </h1>
            <Link to="/add-estate">
              <button
                style={{
                  padding: "0.9rem 2rem",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                + Add New Estate
              </button>
            </Link>
          </div>

          {/* Estates Grid */}
          {loading ? (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>Loading...</p>
          ) : estates.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "2rem",
              }}
            >
              {estates.map((estate) => (
                <div
                  key={estate.id}
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow:
                      hoveredCard === estate.id
                        ? "0 20px 60px rgba(59,130,246,0.4)"
                        : "0 10px 40px rgba(0,0,0,0.3)",
                    transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
                    display: "flex",
                    flexDirection: "column",
                    transform:
                      hoveredCard === estate.id
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                  }}
                  onMouseEnter={() => setHoveredCard(estate.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image */}
                  {estate.image_url && (
                    <div style={{ position: "relative", height: "220px" }}>
                      <img
                        src={estate.image_url}
                        alt={estate.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                          transform:
                            hoveredCard === estate.id ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ padding: "1.5rem", flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                    >
                      {estate.title}
                    </h3>
                    <p style={{ color: "#64748b", margin: "0.75rem 0" }}>
                      📍 {estate.location}
                    </p>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1.25rem",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        borderRadius: "10px",
                        color: "white",
                        fontWeight: "700",
                        fontSize: "1.25rem",
                      }}
                    >
                      ${estate.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      display: "flex",
                      gap: "0.75rem",
                      background: "rgba(241,245,249,0.5)",
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        padding: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/edit-estate/${estate.id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        padding: "0.75rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDelete(estate.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>
              No estates found. Click “Add New Estate” to start.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
