import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import LocationPicker from "../components/LocationPicker";
import InsetScrollbarOverlay from "../components/InsetScrollbarOverlay";
import { toBgErrorMessage } from "../utils/errorMessages";


const pageContainer = (isLoaded) => ({
  minHeight: "100vh",
  height: "100dvh",
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
  minHeight: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "clamp(0.9rem, 2vh, 1.6rem) 1.5rem",
  overflow: "hidden",
  zIndex: 1,
  animation: "fadeIn 0.8s ease",
};


const formCard = {
  background:
    "linear-gradient(155deg, rgba(30,41,59,0.62), rgba(51,65,85,0.56) 55%, rgba(100,116,139,0.5) 100%)",
  backdropFilter: "blur(24px) saturate(130%)",
  border: "1px solid rgba(191,219,254,0.24)",
  borderRadius: "24px",
  width: "100%",
  maxWidth: "960px",
  maxHeight: "calc(100dvh - 8.4rem)",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
  position: "relative",
  boxShadow:
    "0 20px 50px rgba(15,23,42,0.38), inset 0 1px 0 rgba(255,255,255,0.22)",
  color: "#f8fafc",
};

const formScrollViewport = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  overscrollBehavior: "contain",
  padding: "2.4rem clamp(1.2rem, 2.8vw, 2.8rem)",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const formHeader = { textAlign: "center", marginBottom: "2.2rem" };
const formIcon = { fontSize: "3.5rem", marginBottom: "1rem" };
const formTitle = {
  fontSize: "clamp(1.7rem, 3.6vw, 2.2rem)",
  fontWeight: "800",
  lineHeight: 1.2,
  background: "linear-gradient(135deg, #f8fafc 0%, #bfdbfe 55%, #a5b4fc 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};
const formSubtitle = { color: "#cbd5e1", fontSize: "0.95rem", marginTop: "0.5rem" };

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
  border: "1px solid rgba(191,219,254,0.35)",
  background: "rgba(248,250,252,0.14)",
  color: "#f8fafc",
  fontSize: "1rem",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
};


const selectStyle = {
  padding: "1rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid rgba(191,219,254,0.35)",
  backgroundColor: "rgba(248,250,252,0.12)",
  color: "#f1f5f9",
  fontSize: "1rem",
  outline: "none",
  cursor: "pointer",
  width: "100%",
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


const toggleWrapper = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: "1rem",
  userSelect: "none",
  cursor: "pointer",
};

const toggleTrack = (on) => ({
  width: 44,
  height: 24,
  borderRadius: 999,
  background: on
    ? "linear-gradient(135deg,#10b981,#059669)"
    : "rgba(148,163,184,0.5)",
  position: "relative",
  transition: "background 0.2s ease",
  flexShrink: 0,
});

const toggleThumb = (on) => ({
  position: "absolute",
  top: 3,
  left: on ? 22 : 4,
  width: 18,
  height: 18,
  borderRadius: "50%",
  background: "#f9fafb",
  boxShadow: "0 1px 4px rgba(15,23,42,0.35)",
  transition: "left 0.2s ease",
});


const checkRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  marginTop: "1rem",
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
};

const hint = { color: "#cbd5e1", fontSize: "0.9rem", marginTop: 4 };


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

  .add-estate-form-card {
    position: relative;
  }

  .add-estate-form-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .add-estate-form-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  @media (max-width: 768px) {
    .add-estate-form-card {
      max-height: calc(100dvh - 7.6rem);
      border-radius: 18px;
    }

    .add-estate-form-scroll {
      padding: 1.35rem 1.45rem 1.5rem 1rem !important;
    }
  }
`;


const PROPERTY_TYPES = [
  "1-СТАЕН",
  "2-СТАЕН",
  "3-СТАЕН",
  "4-СТАЕН",
  "МНОГОСТАЕН",
  "МЕЗОНЕТ",
  "ОФИС",
  "АТЕЛИЕ, ТАВАН",
  "ЕТАЖ ОТ КЪЩА",
  "КЪЩА",
  "ВИЛА",
  "МАГАЗИН",
  "ЗАВЕДЕНИЕ",
  "СКЛАД",
  "ГАРАЖ, ПАРКОМЯСТО",
  "ПРОМ. ПОМЕЩЕНИЕ",
  "ХОТЕЛ",
  "ПАРЦЕЛ",
];

const BUILDING_TYPES = [
  "Тухла",
  "Панел",
  "ЕПК",
  "ПК",
  "Гредоред",
  "Метална конструкция",
  "Сглобяема",
  "Друго",
];

const FLOORS = [
  "Сутерен",
  "Партер",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10+",
  "Последен",
  "Не е приложимо",
];


export default function AddEstate() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [profile, setProfile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const formScrollRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    area: "",
    location: "",
    is_public: false, 

    property_type: "",
    has_act16: false,
    building_type: "",
    floor: "",
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
        .select("id, name, avatar_url, is_admin")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData || { id: userData.user.id });

      if (location.state?.listOnMarketplace) {
        setForm((f) => ({ ...f, is_public: true }));
      }
      setTimeout(() => setIsLoaded(true), 150);
    };
    getProfile();
  }, [navigate, location.state]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      if (uploadError) {
        alert(toBgErrorMessage(uploadError, "Неуспешно качване на снимката. Опитайте отново."));
        setLoading(false);
        return;
      }
      imageUrl = supabase.storage
        .from("estate-images")
        .getPublicUrl(fileName).data.publicUrl;
    }

    const payload = {
      user_id: profile.id,
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      area: Number(form.area) || null,
      location: form.location,
      is_public: !!form.is_public,
      property_type: form.property_type || null,
      has_act16: !!form.has_act16,
      building_type: form.building_type || null,
      floor: form.floor || null,
      image_url: imageUrl,
    };

    const { error } = await supabase.from("estates").insert([payload]);

    setLoading(false);
    if (error) alert(toBgErrorMessage(error, "Неуспешно добавяне на имота. Опитайте отново."));
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

      <NavBar profile={profile} />

      <main style={mainStyle}>
        <form onSubmit={handleSubmit} className="add-estate-form-card" style={formCard}>
          <div ref={formScrollRef} className="add-estate-form-scroll" style={formScrollViewport}>
            <div style={formHeader}>
              <div style={formIcon}>🏡</div>
              <h2 style={formTitle}>Добави нов имот</h2>
              <p style={formSubtitle}>Попълни детайли, за да публикуваш имота</p>
            </div>

            
            <div>
              <label style={labelStyle}>Вид на имота</label>
              <select
                name="property_type"
                value={form.property_type}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="" disabled>
                  Избери…
                </option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Заглавие на имота</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Луксозна вила"
                style={inputStyle}
                required
              />
            </div>

            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>Вид на сградата</label>
                <select
                  name="building_type"
                  value={form.building_type}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">Избери…</option>
                  {BUILDING_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Етаж</label>
                <select
                  name="floor"
                  value={form.floor}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">Избери…</option>
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            
            <div style={checkRow}>
              <div>
                <div style={{ fontWeight: 700 }}>Има Акт 16</div>
                <div style={hint}>
                  Маркирай, ако сградата е с въведена в експлоатация.
                </div>
              </div>
              <input
                type="checkbox"
                checked={!!form.has_act16}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, has_act16: e.target.checked }))
                }
                style={{ width: 18, height: 18, accentColor: "#10b981" }}
              />
            </div>

            
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Описание</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Опиши имота..."
                style={{ ...inputStyle, height: "120px" }}
                required
              />
            </div>

            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>
                <label style={labelStyle}>Цена (€)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="500000"
                  style={inputStyle}
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Площ (кв.м)</label>
                <input
                  type="number"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="120"
                  style={inputStyle}
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            
            <div style={{ marginTop: "1rem" }}>
              <LocationPicker
                value={form.location}
                onChange={(nextLocation) =>
                  setForm((prev) => ({ ...prev, location: nextLocation }))
                }
                required
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
            </div>

            
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Снимка на имота</label>
              <div style={uploadBoxStyle(imagePreview)}>
                {imagePreview ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={imagePreview}
                      alt="Преглед"
                      style={previewImageStyle}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
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
                    <p style={{ color: "#94a3b8" }}>Кликни, за да качиш снимка</p>
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

            
            <div
              style={toggleWrapper}
              onClick={() => setForm((f) => ({ ...f, is_public: !f.is_public }))}
            >
              <div style={toggleTrack(!!form.is_public)}>
                <div style={toggleThumb(!!form.is_public)} />
              </div>
              <span>Публикувай в Пазара</span>

              <input
                type="checkbox"
                checked={!!form.is_public}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_public: e.target.checked }))
                }
                style={{ display: "none" }}
              />
            </div>

            
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
                  <div style={spinner} /> Добавяне...
                </span>
              ) : (
                "Добави имот"
              )}
            </button>
          </div>
          <InsetScrollbarOverlay
            scrollRef={formScrollRef}
            topInset={30}
            bottomInset={30}
            rightInset={8}
            width={6}
          />
        </form>
      </main>

      
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={checkContainer}>
              <div style={checkMark} />
            </div>
            <h3 style={modalTitle}>Имотът е добавен успешно!</h3>
            <p style={modalText}>Пренасочване...</p>
            <div style={progressBar} />
          </div>
        </div>
      )}
    </div>
  );
}

