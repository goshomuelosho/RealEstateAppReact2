import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function AddEstate() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  // 🧠 Get Current User
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate("/login");
      else setUser(data.user);
    };
    getUser();
  }, [navigate]);

  // ✏️ Handle Input Change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 📸 Handle Image Upload + Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🚀 Submit Estate
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let imageUrl = null;

    if (image) {
      const fileName = `${user.id}-${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("estate-images")
        .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      imageUrl = supabase.storage.from("estate-images").getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from("estates").insert([
      {
        user_id: user.id,
        ...form,
        image_url: imageUrl,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/my-estates");
      }, 2500);
    }
  };

  // 🔒 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
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
      {/* 🌌 Floating Background Lights */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent)",
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
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15), transparent)",
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes checkmark {
          0% { transform: scale(0) rotate(45deg); }
          50% { transform: scale(1.2) rotate(45deg); }
          100% { transform: scale(1) rotate(45deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideWidth {
          from { width: 0; }
          to { width: 60px; }
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
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 10,
        }}
      >
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

        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

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
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* 🏡 Add Estate Form */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "3rem 1.5rem",
          zIndex: 1,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: "24px",
            padding: "3rem 2.5rem",
            width: "100%",
            maxWidth: "600px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            animation: "fadeIn 0.8s ease",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", animation: "float 3s infinite" }}>🏡</div>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #0f172a, #475569)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Add New Estate
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              Fill in the details to list your property
            </p>
          </div>

          {/* Inputs */}
          <Input label="Property Title" name="title" placeholder="e.g. Luxury Beachfront Villa" value={form.title} onChange={handleChange} />
          <Textarea label="Description" name="description" placeholder="Describe your property..." value={form.description} onChange={handleChange} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <Input label="Price ($)" name="price" type="number" placeholder="1,500,000" value={form.price} onChange={handleChange} />
            <Input label="Location" name="location" placeholder="Miami, FL" value={form.location} onChange={handleChange} />
          </div>

          {/* Image Upload */}
          <ImageUpload imagePreview={imagePreview} onChange={handleImageChange} onRemove={() => { setImage(null); setImagePreview(null); }} />

          {/* Submit */}
          <SubmitButton loading={loading} />
        </form>
      </main>

      {/* ✅ Success Modal */}
      {showModal && <SuccessModal />}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle} required />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea {...props} style={{ ...inputStyle, height: "120px", resize: "vertical" }} required />
    </div>
  );
}

function ImageUpload({ imagePreview, onChange, onRemove }) {
  return (
    <div>
      <label style={labelStyle}>Property Image</label>
      <div style={uploadBoxStyle(imagePreview)}>
        {imagePreview ? (
          <div style={{ position: "relative" }}>
            <img src={imagePreview} alt="Preview" style={previewImageStyle} />
            <button onClick={onRemove} style={removeBtnStyle}>✕</button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem" }}>📸</div>
            <p style={{ color: "#64748b", fontWeight: "500" }}>Click to upload image</p>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} style={fileInputStyle} />
      </div>
    </div>
  );
}

function SubmitButton({ loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        marginTop: "1rem",
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
        transition: "all 0.3s ease",
      }}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <div style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          Adding Estate...
        </span>
      ) : (
        "✨ Add Estate"
      )}
    </button>
  );
}

function SuccessModal() {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <div style={checkContainerStyle}>
          <div style={checkMarkStyle} />
        </div>
        <h3 style={modalTitleStyle}>Estate Added Successfully!</h3>
        <p style={modalTextStyle}>Redirecting you to My Estates...</p>
        <div style={progressBarStyle} />
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "0.5rem",
};

const inputStyle = {
  width: "100%",
  padding: "1rem 1.25rem",
  borderRadius: "12px",
  border: "2px solid #e2e8f0",
  background: "#f8fafc",
  fontSize: "1rem",
  transition: "all 0.3s ease",
  outline: "none",
};

const uploadBoxStyle = (hasImage) => ({
  border: "2px dashed #cbd5e1",
  borderRadius: "12px",
  padding: hasImage ? 0 : "2rem",
  background: "#f8fafc",
  position: "relative",
  overflow: "hidden",
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

const modalOverlayStyle = {
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

const modalCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f8fafc)",
  borderRadius: "24px",
  padding: "3rem 2.5rem",
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
  animation: "modalFadeIn 0.5s ease",
  maxWidth: "400px",
};

const checkContainerStyle = {
  width: "80px",
  height: "80px",
  margin: "0 auto 1.5rem",
  background: "linear-gradient(135deg, #10b981, #059669)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const checkMarkStyle = {
  width: "24px",
  height: "40px",
  borderRight: "5px solid white",
  borderBottom: "5px solid white",
  transform: "rotate(45deg)",
  animation: "checkmark 0.6s ease 0.2s backwards",
};

const modalTitleStyle = {
  fontSize: "1.75rem",
  fontWeight: "800",
  color: "#0f172a",
  marginBottom: "0.75rem",
};

const modalTextStyle = {
  color: "#64748b",
  fontSize: "1rem",
  marginBottom: "1.5rem",
};

const progressBarStyle = {
  width: "60px",
  height: "4px",
  background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  borderRadius: "2px",
  margin: "0 auto",
  animation: "slideWidth 2.5s ease",
};
