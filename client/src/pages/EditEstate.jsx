import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function EditEstate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    image_url: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Fetch user & estate
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }
      setUser(userData.user);

      const { data, error } = await supabase.from("estates").select("*").eq("id", id).single();
      if (!error && data) setForm(data);
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  // 🔹 Handle changes
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 🔹 Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let imageUrl = form.image_url;

    // Upload new image if selected
    if (image) {
      const fileName = `${user.id}-${Date.now()}-${image.name}`;
      const { error: imgError } = await supabase.storage
        .from("estate-images")
        .upload(fileName, image, { upsert: true });
      if (imgError) {
        alert(imgError.message);
        setSaving(false);
        return;
      }
      const { data } = supabase.storage.from("estate-images").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
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

  // 🔹 Logout
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
          color: "#94a3b8",
        }}
      >
        Loading estate...
      </div>
    );
  }

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
      {/* 🌌 Floating Lights */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent)",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(168,85,247,0.2), transparent)",
          borderRadius: "50%",
          filter: "blur(90px)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float {
          0%,100%{transform:translate(0,0)scale(1);}
          50%{transform:translate(30px,-30px)scale(1.1);}
        }
        @keyframes fadeIn {
          from{opacity:0;transform:translateY(30px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-100px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes modalFadeIn {
          from{opacity:0;transform:scale(0.8);}
          to{opacity:1;transform:scale(1);}
        }
        @keyframes checkmark {
          0%{transform:scale(0)rotate(45deg);}
          50%{transform:scale(1.2)rotate(45deg);}
          100%{transform:scale(1)rotate(45deg);}
        }
        @keyframes spin {to{transform:rotate(360deg);}}
        @keyframes slideWidth {from{width:0;}to{width:60px;}}
      `}</style>

      {/* 🧭 Header */}
      <header
        style={{
          width: "100%",
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
          animation: "slideDown 0.6s ease",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none",
          }}
        >
          🏠 Real Estate
        </Link>

        <nav style={{ display: "flex", gap: "2rem" }}>
          <Link to="/my-estates" style={{ color: "#e2e8f0" }}>
            My Estates
          </Link>
        </nav>

        {user && (
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239,68,68,0.4)",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ✏️ Edit Form */}
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
        <div
          style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: "24px",
            padding: "3rem 2.5rem",
            width: "100%",
            maxWidth: "700px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            animation: "fadeIn 0.8s ease",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "2rem",
              fontWeight: 800,
              background: "linear-gradient(135deg,#0f172a,#475569)",
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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

            <input type="file" accept="image/*" onChange={handleImageChange} style={inputStyle} />

            <button
              type="submit"
              disabled={saving}
              style={{
                background: saving
                  ? "linear-gradient(135deg,#94a3b8,#64748b)"
                  : "linear-gradient(135deg,#10b981,#059669)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "1rem",
                fontWeight: 700,
                fontSize: "1.05rem",
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
              }}
            >
              {saving ? "Updating..." : "💾 Update Estate"}
            </button>
          </form>
        </div>
      </main>

      {/* ✅ Success Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            animation: "fadeIn 0.3s ease",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#ffffff,#f8fafc)",
              borderRadius: "24px",
              padding: "3rem 2.5rem",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              animation: "modalFadeIn 0.5s ease",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 1.5rem",
                background: "linear-gradient(135deg,#10b981,#059669)",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "40px",
                  borderRight: "5px solid white",
                  borderBottom: "5px solid white",
                  transform: "rotate(45deg)",
                  animation: "checkmark 0.6s ease",
                }}
              />
            </div>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Estate Updated Successfully!
            </h3>
            <p style={{ color: "#64748b" }}>Redirecting you to My Estates...</p>
          </div>
        </div>
      )}
    </div>
  );
}

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
