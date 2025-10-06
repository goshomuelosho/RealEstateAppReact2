import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams, Link } from "react-router-dom";

/* 🎨 Reusable styles */
const pageContainer = (isLoaded) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  transition: "opacity 0.4s ease",
  opacity: isLoaded ? 1 : 0,
});

const bgLight = (color, top, left, size) => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  background: `radial-gradient(circle, ${color}33, transparent)`,
  borderRadius: "50%",
  filter: "blur(60px)",
});

const headerStyle = {
  flexShrink: 0,
  padding: "1.25rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
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
  transition: "all 0.3s ease",
};

const avatarStyle = (isLoaded) => ({
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(255,255,255,0.2)",
  opacity: isLoaded ? 1 : 0,
  transition: "opacity 0.4s ease",
});

const avatarSkeleton = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background:
    "linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)",
  backgroundSize: "200px 100%",
  animation: "shimmer 1.5s infinite",
};

const profileName = (isLoaded) => ({
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#E2E8F0",
  opacity: isLoaded ? 1 : 0.5,
  transition: "opacity 0.4s ease",
});

const mainStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "3rem 1.5rem",
  zIndex: 1,
  animation: "fadeIn 0.8s ease",
};

const cardStyle = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "24px",
  padding: "3rem 2.5rem",
  width: "100%",
  maxWidth: "700px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "#f8fafc",
  animation: "fadeIn 0.8s ease",
};

const inputStyle = {
  width: "100%",
  padding: "1rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "#f8fafc",
  fontSize: "1rem",
  outline: "none",
};

const submitButton = (saving) => ({
  marginTop: "1.5rem",
  padding: "1.1rem",
  background: saving
    ? "linear-gradient(135deg, #94a3b8, #64748b)"
    : "linear-gradient(135deg, #10b981, #059669)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  fontSize: "1.05rem",
  cursor: saving ? "not-allowed" : "pointer",
  boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
});

const spinner = {
  width: "20px",
  height: "20px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderTop: "3px solid white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

/* ✅ Modal Styles */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(8px)",
  zIndex: 9999,
};
const modalCard = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "24px",
  padding: "3rem 2.5rem",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};
const checkContainer = {
  width: "80px",
  height: "80px",
  margin: "0 auto 1.5rem",
  background: "linear-gradient(135deg, #10b981, #059669)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const checkMark = {
  width: "24px",
  height: "40px",
  borderRight: "5px solid white",
  borderBottom: "5px solid white",
  transform: "rotate(45deg)",
};
const progressBar = {
  width: "60px",
  height: "4px",
  background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  borderRadius: "2px",
  margin: "0 auto",
};

const keyframes = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
`;

export default function EditEstate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    image_url: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate("/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", userData.user.id)
        .single();
      setProfile(profileData || { id: userData.user.id });

      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setForm(data);

      setTimeout(() => setIsLoaded(true), 150);
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let imageUrl = form.image_url;
    if (image) {
      const fileName = `${profile.id}-${Date.now()}-${image.name}`;
      const { error: imgError } = await supabase.storage
        .from("estate-images")
        .upload(fileName, image, { upsert: true });
      if (imgError) {
        alert(imgError.message);
        setSaving(false);
        return;
      }
      imageUrl = supabase.storage.from("estate-images").getPublicUrl(fileName)
        .data.publicUrl;
    }

    const { error } = await supabase
      .from("estates")
      .update({ ...form, image_url: imageUrl })
      .eq("id", id);

    setSaving(false);
    if (error) alert(error.message);
    else {
      setShowModal(true);
      setTimeout(() => navigate("/my-estates"), 2500);
    }
  };

  const currentImageUrl = imagePreview || form.image_url;

  return (
    <div style={pageContainer(isLoaded)}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />
      <style>{keyframes}</style>

      {/* 🧭 Header */}
      <header style={headerStyle}>
        <Link to="/dashboard" style={logoStyle}>
          🏠 Real Estate
        </Link>

        <nav>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

        <div style={profileBox} onClick={() => navigate("/profile")}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={avatarStyle(isLoaded)}
            />
          ) : (
            <div style={avatarSkeleton} />
          )}
          <span style={profileName(isLoaded)}>
            {profile?.name || "Loading..."}
          </span>
        </div>
      </header>

      {/* ✏️ Edit Form */}
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg,#fff,#cbd5e1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ✏️ Edit Estate
          </h2>

          {currentImageUrl && (
            <div
              style={{
                marginBottom: "2rem",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <img
                src={currentImageUrl}
                alt="estate"
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
              style={{ ...inputStyle, height: "120px", resize: "vertical" }}
            />
            <input
              name="price"
              type="number"
              placeholder="Price ($)"
              value={form.price}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={inputStyle}
            />

            <button type="submit" disabled={saving} style={submitButton(saving)}>
              {saving ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div style={spinner} /> Updating...
                </span>
              ) : (
                "💾 Update Estate"
              )}
            </button>
          </form>
        </div>
      </main>

      {/* ✅ Success Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={checkContainer}>
              <div style={checkMark} />
            </div>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Estate Updated Successfully!
            </h3>
            <p style={{ color: "#64748b" }}>Redirecting...</p>
            <div style={progressBar} />
          </div>
        </div>
      )}
    </div>
  );
}
