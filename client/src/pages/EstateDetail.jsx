import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";
import LocationPinMap from "../components/LocationPinMap";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { toBgErrorMessage } from "../utils/errorMessages";

export default function EstateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [estate, setEstate] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const currentUserId = userData.user.id;

      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", currentUserId)
        .single();

      if (profileErr) console.error("Error loading profile:", profileErr);

      const currentProfile = profileData || { id: currentUserId, is_admin: false };
      setProfile(currentProfile);
      setIsAdmin(!!currentProfile.is_admin);

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
  const fallbackBackRoute = isOwner ? "/my-estates" : "/marketplace";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackBackRoute);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    const { error } = await supabase.from("estates").delete().eq("id", id);

    if (error) {
      setIsDeleting(false);
      alert(toBgErrorMessage(error, "Неуспешно изтриване на имота. Опитайте отново."));
      return;
    }

    setShowDeleteModal(false);
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
          <button type="button" style={backButton} onClick={handleBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            Назад
          </button>

          {estate.image_url && <img src={estate.image_url} alt={estate.title} style={estateImage} />}

          <h1 style={estateTitle}>{estate.title}</h1>

          <div style={metaRow}>
            <p style={estateLocation}>
              <MapPin size={16} aria-hidden="true" />
              {estate.location}
            </p>
            <p style={estatePrice}>€{Number(estate.price || 0).toLocaleString()}</p>
          </div>

          <LocationPinMap location={estate.location} />

          
          <div style={detailsWrap}>
            <h3 style={detailsTitle}>Детайли</h3>

            <div style={detailsGrid}>
              <div style={detailItem}>
                <span style={detailLabel}>Вид на имота</span>
                <span style={detailValue}>{estate.property_type || "—"}</span>
              </div>

              <div style={detailItem}>
                <span style={detailLabel}>Площ</span>
                <span style={detailValue}>
                  {Number(estate.area) > 0 ? `${Number(estate.area).toLocaleString()} кв.м` : "—"}
                </span>
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
                  {estate.has_act16 ? (
                    <>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      Има
                    </>
                  ) : (
                    <>
                      <XCircle size={14} aria-hidden="true" />
                      Няма
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <p style={estateDescription}>{estate.description}</p>

          
          {canManage && (
            <div style={buttonGroup}>
              <button
                onClick={() => navigate(`/edit-estate/${estate.id}`)}
                style={editButton}
                aria-label="Редактирай имота"
              >
                <Pencil size={17} aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  ...deleteButton,
                  opacity: isDeleting ? 0.75 : 1,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                }}
                aria-label="Изтрий имота"
                disabled={isDeleting}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </main>

      <DeleteConfirmModal
        open={showDeleteModal}
        loading={isDeleting}
        title="Изтриване на имот"
        message={`Сигурни ли сте, че искате да изтриете "${estate.title}"? Това действие е необратимо.`}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
      />
    </div>
  );
}


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

const estateLocation = {
  fontSize: "1.1rem",
  color: "#475569",
  margin: 0,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
};

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
  gap: "0.35rem",
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

const backButton = {
  marginBottom: "1rem",
  padding: "0.7rem 1rem",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.45rem",
  borderRadius: "10px",
  border: "1px solid rgba(15,23,42,0.14)",
  background: "rgba(15,23,42,0.04)",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "none",
};

const editButton = {
  width: 46,
  height: 42,
  padding: 0,
  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(59,130,246,0.28)",
  transition: "transform 0.15s ease, filter 0.2s ease",
};

const deleteButton = {
  ...editButton,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
};


