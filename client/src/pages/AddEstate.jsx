import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

/* 🎨 Styles (defined first) */
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

/* Card + Form Styles */
const formCard = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "24px",
  padding: "3rem 2.5rem",
  width: "100%",
  maxWidth: "600px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "#f8fafc",
};

const formHeader = { textAlign: "center", marginBottom: "2.5rem" };
const formIcon = { fontSize: "3.5rem", marginBottom: "1rem" };
const formTitle = { fontSize: "2rem", fontWeight: "800" };
const formSubtitle = { color: "#cbd5e1", fontSize: "0.95rem" };

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "#e2e8f0",
  marginBottom: "0.5rem",
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

const uploadBoxStyle = (hasImage) => ({
  border: "2px dashed rgba(255,255,255,0.3)",
  borderRadius: "12px",
  padding: hasImage ? 0 : "2rem",
  background: "rgba(255,255,255,0.05)",
  position: "relative",
  overflow: "hidden",
  marginTop: "1rem",
});

const previewImageStyle = {
  width: "100%",
  height: "200px",
  objectFit: "cover",
  borderRadius: "10px",
};

const removeBtnStyle = {
  position: "absolute",
  top: "0.75rem",
  right: "0.75rem",
  padding: "0.4rem 0.6rem",
  background: "rgba(239,68,68,0.95)",
  border: "none",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
};

const fileInputStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

const submitButton = (loading) => ({
  marginTop: "1.5rem",
  padding: "1.1rem",
  background: loading
    ? "linear-gradient(135deg, #94a3b8, #64748b)"
    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  fontSize: "1.05rem",
  cursor: loading ? "not-allowed" : "pointer",
});

const spinner = {
  width: "20px",
  height: "20px",
  border: "3px solid rgba(255,255,255,0.3)",
  borderTop: "3px solid white",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

/* Modal Styles */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
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
const modalTitle = {
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "#0f172a",
  marginBottom: "0.75rem",
};
const modalText = {
  color: "#64748b",
  fontSize: "1rem",
  marginBottom: "1.5rem",
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

/* 🚀 Component */
export default function AddEstate() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate("/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData || { id: userData.user.id });
      setTimeout(() => setIsLoaded(true), 150);
    };
    getProfile();
  }, [navigate]);

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
    if (!profile?.id) return;
    setLoading(true);

    let imageUrl = null;
    if (image) {
      const fileName = `${profile.id}-${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("estate-images")
        .upload(fileName, image);
      if (uploadError) return alert(uploadError.message);
      imageUrl = supabase.storage.from("estate-images").getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from("estates").insert([
      { user_id: profile.id, ...form, image_url: imageUrl },
    ]);

    setLoading(false);
    if (error) alert(error.message);
    else {
      setShowModal(true);
      setTimeout(() => navigate("/my-estates"), 2500);
    }
  };

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

        {/* 👤 Profile */}
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

      {/* 📋 Form */}
      <main style={mainStyle}>
        <form onSubmit={handleSubmit} style={formCard}>
          <div style={formHeader}>
            <div style={formIcon}>🏡</div>
            <h2 style={formTitle}>Add New Estate</h2>
            <p style={formSubtitle}>Fill in details to list your property</p>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Property Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Luxury Villa"
              style={inputStyle}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              style={{ ...inputStyle, height: "120px" }}
              required
            />
          </div>

          {/* Price + Location */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="500000"
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Miami, FL"
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Upload */}
          <div>
            <label style={labelStyle}>Property Image</label>
            <div style={uploadBoxStyle(imagePreview)}>
              {imagePreview ? (
                <div style={{ position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={previewImageStyle}
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    style={removeBtnStyle}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem" }}>📸</div>
                  <p style={{ color: "#94a3b8" }}>Click to upload image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={fileInputStyle}
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={submitButton(loading)}>
            {loading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <div style={spinner} /> Adding Estate...
              </span>
            ) : (
              "✨ Add Estate"
            )}
          </button>
        </form>
      </main>

      {/* ✅ Success Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={checkContainer}>
              <div style={checkMark} />
            </div>
            <h3 style={modalTitle}>Estate Added Successfully!</h3>
            <p style={modalText}>Redirecting...</p>
            <div style={progressBar} />
          </div>
        </div>
      )}
    </div>
  );
}
