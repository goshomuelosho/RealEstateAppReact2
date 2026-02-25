import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

/* ✅ Dropdown options */
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
  pointerEvents: "none",
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

const selectStyle = {
  padding: "0.7rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  backgroundColor: "#1e293b",
  color: "#f1f5f9",
  fontSize: "1rem",
  outline: "none",
  cursor: "pointer",
  width: "100%",
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

const checkRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  marginTop: "0.25rem",
  padding: "0.9rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
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

/* ✅ Access denied card style */
const deniedCard = {
  ...cardStyle,
  maxWidth: "650px",
  textAlign: "center",
  padding: "2.5rem 2rem",
};

const deniedTitle = {
  fontSize: "1.6rem",
  fontWeight: 900,
  margin: "0 0 0.75rem",
};

const deniedText = { color: "rgba(226,232,240,0.86)", margin: 0, lineHeight: 1.6 };

const backBtn = {
  marginTop: "1.25rem",
  padding: "0.95rem 1.15rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

export default function EditEstate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingEstate, setLoadingEstate] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    image_url: "",
    is_public: false,

    property_type: "",
    has_act16: false,
    building_type: "",
    floor: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate("/login");

      const currentUserId = userData.user.id;

      // ✅ profile + is_admin
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", currentUserId)
        .single();

      if (profileErr) console.error("Error loading profile in EditEstate:", profileErr);

      const currentProfile = profileData || { id: currentUserId, is_admin: false };
      setProfile(currentProfile);
      setIsAdmin(!!currentProfile.is_admin);

      // ✅ load estate
      setLoadingEstate(true);
      const { data, error } = await supabase.from("estates").select("*").eq("id", id).single();

      if (error || !data) {
        alert("Имотът не е намерен!");
        navigate("/marketplace");
        return;
      }

      const owner = data.user_id === currentUserId;
      const admin = !!currentProfile.is_admin;

      setIsOwner(owner);
      setCanEdit(owner || admin);

      if (owner || admin) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price ?? "",
          location: data.location || "",
          image_url: data.image_url || "",
          is_public: !!data.is_public,

          property_type: data.property_type || "",
          has_act16: !!data.has_act16,
          building_type: data.building_type || "",
          floor: data.floor || "",
        });
      }

      setLoadingEstate(false);
      setTimeout(() => setIsLoaded(true), 150);
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTogglePublic = (e) => setForm((prev) => ({ ...prev, is_public: e.target.checked }));

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
    if (!canEdit) return;

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

      imageUrl = supabase.storage.from("estate-images").getPublicUrl(fileName).data.publicUrl;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price) || 0,
      location: form.location,
      image_url: imageUrl,
      is_public: !!form.is_public,

      property_type: form.property_type || null,
      has_act16: !!form.has_act16,
      building_type: form.building_type || null,
      floor: form.floor || null,
    };

    const { error } = await supabase.from("estates").update(payload).eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setShowModal(true);

    // ✅ After save: admin -> marketplace (for now), user -> my-estates
    setTimeout(() => {
      if (isAdmin && !isOwner) navigate("/marketplace");
      else navigate("/my-estates");
    }, 1800);
  };

  const currentImageUrl = imagePreview || form.image_url;

  return (
    <div style={pageContainer(isLoaded)}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />
      <style>{keyframes}</style>

      <NavBar profile={profile} />

      <main style={mainStyle}>
        {loadingEstate ? (
          <div style={cardStyle}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
              <div style={spinner} />
              <div style={{ fontWeight: 800 }}>Зареждане…</div>
            </div>
          </div>
        ) : !canEdit ? (
          <div style={deniedCard}>
            <div style={deniedTitle}>⛔ Нямаш достъп</div>
            <p style={deniedText}>
              Нямаш права да редактираш този имот.
              <br />
              Само собственикът или администратор може да прави промени.
            </p>
            <button style={backBtn} onClick={() => navigate("/marketplace")}>
              ⬅ Назад към Пазара
            </button>
          </div>
        ) : (
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
              ✏️ Редактирай имот
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
              {form.is_public ? "Видимо в Пазара" : "Скрито от Пазара"}
              {isAdmin && !isOwner ? (
                <span style={{ marginLeft: 10, opacity: 0.9 }}>🛡️ Админ режим</span>
              ) : null}
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* ✅ Вид на имота */}
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

              {/* ✅ Вид на сградата + Етаж */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Вид на сградата</label>
                  <select name="building_type" value={form.building_type} onChange={handleChange} style={selectStyle}>
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
                  <select name="floor" value={form.floor} onChange={handleChange} style={selectStyle}>
                    <option value="">Избери…</option>
                    {FLOORS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Акт 16 */}
              <div style={checkRow}>
                <div>
                  <div style={{ fontWeight: 700 }}>Има Акт 16</div>
                  <div style={{ ...hint, marginTop: 4 }}>
                    Маркирай, ако сградата е с въведена в експлоатация.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.has_act16}
                  onChange={(e) => setForm((prev) => ({ ...prev, has_act16: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "#10b981" }}
                />
              </div>

              {/* Existing fields */}
              <input
                name="title"
                placeholder="Заглавие"
                value={form.title}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <textarea
                name="description"
                placeholder="Описание"
                value={form.description}
                onChange={handleChange}
                required
                style={{ ...inputStyle, height: "120px", resize: "vertical" }}
              />
              <input
                name="price"
                type="number"
                placeholder="Цена ($)"
                value={form.price}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                name="location"
                placeholder="Локация"
                value={form.location}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              {/* Image input */}
              <input type="file" accept="image/*" onChange={handleImageChange} style={inputStyle} />

              {/* is_public toggle */}
              <div style={switchRow}>
                <div>
                  <div style={{ fontWeight: 700 }}>Покажи в Пазара</div>
                  <div style={hint}>Ако е включено, обявата ще се вижда публично в „Пазар“.</div>
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!form.is_public}
                    onChange={handleTogglePublic}
                    style={{ width: 18, height: 18, accentColor: "#10b981" }}
                  />
                  <span>{form.is_public ? "Включено" : "Изключено"}</span>
                </label>
              </div>

              <button type="submit" disabled={saving} style={submitButton(saving)}>
                {saving ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <div style={spinner} /> Обновяване...
                  </span>
                ) : (
                  "Обнови имота"
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ✅ Success Modal */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={checkContainer}>
              <div style={checkMark} />
            </div>
            <h3 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Имотът е обновен успешно!
            </h3>
            <p style={{ color: "#64748b" }}>Пренасочване...</p>
            <div style={progressBar} />
          </div>
        </div>
      )}
    </div>
  );
}
