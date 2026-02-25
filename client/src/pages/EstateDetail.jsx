import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function EstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estate, setEstate] = useState(null);
  const [profile, setProfile] = useState(null); // current user profile for NavBar
  const [loading, setLoading] = useState(true);

  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const currentUserId = userData.user.id;

      // 👤 Fetch profile (for NavBar + admin check)
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", currentUserId)
        .single();

      if (profileErr) console.error("Error loading profile:", profileErr);

      const currentProfile = profileData || { id: currentUserId, is_admin: false };
      setProfile(currentProfile);
      setIsAdmin(!!currentProfile.is_admin);

      // 🏡 Fetch estate
      const { data, error } = await supabase.from("estates").select("*").eq("id", id).single();

      if (error || !data) {
        alert("Имотът не е намерен!");
        navigate("/marketplace");
        return;
      }

      setEstate(data);
      setIsOwner(data.user_id === currentUserId);
      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const canManage = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете този имот?")) return;

    const { error } = await supabase.from("estates").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ if admin deletes from marketplace / details, send back to marketplace
    if (isAdmin) navigate("/marketplace");
    else navigate("/my-estates");
  };

  if (loading) {
    return (
      <div style={loaderContainer}>
        <style>{keyframes}</style>
        <div style={loaderSpinner} />
      </div>
    );
  }

  if (!estate) return null;

  return (
    <div style={pageContainer}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />
      <style>{keyframes}</style>

      <NavBar profile={profile} />

      <main style={mainStyle}>
        <div style={estateCard}>
          {estate.image_url && <img src={estate.image_url} alt={estate.title} style={estateImage} />}

          <h1 style={estateTitle}>{estate.title}</h1>

          <div style={metaRow}>
            <p style={estateLocation}>📍 {estate.location}</p>
            <p style={estatePrice}>${Number(estate.price || 0).toLocaleString()}</p>
          </div>

          {/* ✅ Extra details */}
          <div style={detailsWrap}>
            <h3 style={detailsTitle}>Детайли</h3>

            <div style={detailsGrid}>
              <div style={detailItem}>
                <span style={detailLabel}>Вид на имота</span>
                <span style={detailValue}>{estate.property_type || "—"}</span>
              </div>

              <div style={detailItem}>
                <span style={detailLabel}>Вид на сградата</span>
                <span style={detailValue}>{estate.building_type || "—"}</span>
              </div>

              <div style={detailItem}>
                <span style={detailLabel}>Етаж</span>
                <span style={detailValue}>{estate.floor || "—"}</span>
              </div>

              <div style={detailItem}>
                <span style={detailLabel}>Акт 16</span>
                <span style={actBadge(!!estate.has_act16)}>
                  {estate.has_act16 ? "✅ Има" : "❌ Няма"}
                </span>
              </div>
            </div>
          </div>

          <p style={estateDescription}>{estate.description}</p>

          {/* ✅ Owner OR Admin */}
          {canManage && (
            <div style={buttonGroup}>
              <button onClick={() => navigate(`/edit-estate/${estate.id}`)} style={editButton}>
                 ✏️  
              </button>
              <button onClick={handleDelete} style={deleteButton}>
                🗑️ 
              </button>
            </div>
          )}
        </div>
      </main>

      <footer style={footerStyle}>
        © {new Date().getFullYear()} RealEstate | Създадено с ❤️
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
  @keyframes spin { to { transform: rotate(360deg); } }
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
  pointerEvents: "none",
});

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
  maxWidth: "900px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const estateImage = {
  width: "100%",
  height: "350px",
  objectFit: "cover",
  borderRadius: "16px",
  marginBottom: "2rem",
};

const estateTitle = {
  fontSize: "2rem",
  fontWeight: 800,
  marginBottom: "0.75rem",
  color: "#0f172a",
};

const metaRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap",
  marginBottom: "1.25rem",
};

const estateLocation = { fontSize: "1.1rem", color: "#475569", margin: 0 };

const estatePrice = { fontSize: "1.6rem", fontWeight: 800, color: "#3b82f6", margin: 0 };

const detailsWrap = {
  borderRadius: "16px",
  border: "1px solid rgba(15,23,42,0.08)",
  background: "rgba(241,245,249,0.6)",
  padding: "1.25rem",
  marginBottom: "1.5rem",
};

const detailsTitle = {
  margin: "0 0 0.9rem",
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "#0f172a",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "0.9rem",
};

const detailItem = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "12px",
  padding: "0.85rem 0.95rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const detailLabel = { fontSize: "0.8rem", color: "#64748b", fontWeight: 700 };

const detailValue = { fontSize: "1rem", color: "#0f172a", fontWeight: 800 };

const actBadge = (has) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "0.25rem 0.6rem",
  borderRadius: 999,
  fontSize: "0.85rem",
  fontWeight: 800,
  color: has ? "#065f46" : "#991b1b",
  background: has ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)",
  border: `1px solid ${has ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
});

const estateDescription = {
  fontSize: "1rem",
  lineHeight: 1.7,
  color: "#334155",
  marginBottom: "2rem",
};

const buttonGroup = { display: "flex", justifyContent: "flex-end", gap: "1rem" };

const editButton = {
  padding: "0.9rem 1.5rem",
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: 700,
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
