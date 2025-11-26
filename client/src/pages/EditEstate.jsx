import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

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

const switchRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
};

const hint = { color: "#cbd5e1", fontSize: "0.9rem" };

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
    is_public: false, // 👈 marketplace visibility
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

      if (!error && data) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price ?? "",
          location: data.location || "",
          image_url: data.image_url || "",
          is_public: !!data.is_public,
        });
      }

      setTimeout(() => setIsLoaded(true), 150);
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleTogglePublic = (e) =>
    setForm((prev) => ({ ...prev, is_public: e.target.checked }));

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

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      location: form.location,
      image_url: imageUrl,
      is_public: !!form.is_public, // 👈 save flag
    };

    const { error } = await supabase.from("estates").update(payload).eq("id", id);

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

      {/* 🧭 Global NavBar with Marketplace link */}
      <NavBar profile={profile} />

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

          {/* Marketplace visibility badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.4rem 0.7rem",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: form.is_public
                ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))"
                : "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(220,38,38,0.18))",
              marginBottom: "1rem",
              fontWeight: 700,
              color: form.is_public ? "#bbf7d0" : "#fecaca",
            }}
          >
            {form.is_public ? "Visible on Marketplace" : "Hidden from Marketplace"}
          </div>

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

            {/* Image input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={inputStyle}
            />

            {/* is_public toggle */}
            <div style={switchRow}>
              <div>
                <div style={{ fontWeight: 700 }}>Show on Marketplace</div>
                <div style={hint}>
                  If enabled, this listing will appear publicly in Marketplace.
                </div>
              </div>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!form.is_public}
                  onChange={handleTogglePublic}
                  style={{ width: 18, height: 18, accentColor: "#10b981" }}
                />
                <span>{form.is_public ? "Enabled" : "Disabled"}</span>
              </label>
            </div>

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
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                marginBottom: "0.75rem",
              }}
            >
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
