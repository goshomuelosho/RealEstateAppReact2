import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function EstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estate, setEstate] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Estate not found!");
        navigate("/my-estates");
        return;
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))",
          color: "#E2E8F0",
        }}
      >
        <p>Loading estate details...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end))",
        color: "#E2E8F0",
      }}
    >
      {/* 🔹 Header */}
      <header
        style={{
          width: "100%",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          gap: "1rem",
          boxSizing: "border-box",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#E2E8F0",
            textDecoration: "none",
          }}
        >
          🏠 Real Estate
        </Link>

        <nav
          style={{
            display: "flex",
            gap: "1.25rem",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link to="/my-estates" style={{ color: "#E2E8F0" }}>
            My Estates
          </Link>
        </nav>

        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.9rem", color: "#94A3B8" }}>
              {user.email}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      {/* 🔹 Main Estate Card */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "2rem",
          overflowY: "auto",
          animation: "fadeIn 0.5s ease",
        }}
      >
        <div
          style={{
            background: "#fff",
            color: "#0f172a",
            borderRadius: "16px",
            padding: "2rem",
            width: "100%",
            maxWidth: "800px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {estate.image_url && (
            <img
              src={estate.image_url}
              alt={estate.title}
              style={{
                width: "100%",
                height: "350px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "1.5rem",
              }}
            />
          )}
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            {estate.title}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#475569" }}>
            📍 {estate.location}
          </p>
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2563EB",
              margin: "1rem 0",
            }}
          >
            ${estate.price.toLocaleString()}
          </p>

          <p
            style={{
              color: "#334155",
              lineHeight: "1.6",
              fontSize: "1rem",
              marginBottom: "2rem",
            }}
          >
            {estate.description}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
            }}
          >
            <button
              style={{
                background: "var(--primary-color)",
              }}
              onClick={() => navigate(`/edit-estate/${estate.id}`)}
            >
              ✏️ Edit
            </button>
            <button
              style={{
                background: "#ef4444",
              }}
              onClick={handleDelete}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </main>

      {/* 🔹 Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          color: "#94A3B8",
          fontSize: "0.9rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        © {new Date().getFullYear()} Real Estate Management | Built with ❤️
      </footer>
    </div>
  );
}
