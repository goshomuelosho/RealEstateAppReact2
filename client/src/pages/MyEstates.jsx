import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import useViewportWidth from "../hooks/useViewportWidth";

/* ✅ Dropdown options (same as AddEstate) */
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

/* 🎨 Styles */
const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const pageContainer = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  position: "relative",
  overflow: "hidden",
  color: "#E2E8F0",
  transition: "opacity 0.4s ease",
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
  padding: "3rem 2rem",
  animation: "fadeInUp 0.8s ease",
};

const contentWrapper = { maxWidth: "1400px", margin: "0 auto" };

const titleBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "2rem",
};

const pageTitle = {
  fontSize: "2.25rem",
  fontWeight: "800",
  background: "linear-gradient(135deg, #ffffff, #94a3b8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const addButton = {
  padding: "0.9rem 1.5rem",
  background: "linear-gradient(135deg, #10b981, #059669)",
  border: "none",
  borderRadius: "12px",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(16,185,129,0.4)",
};

/* ✅ Marketplace-like filter layout (compact) */
const filterBar = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(180px, 1fr))",
  gap: "0.75rem",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16,
  padding: "1rem",
  marginBottom: "2rem",
};

const filterInput = {
  padding: "0.8rem 1rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  outline: "none",
  width: "100%",
};

const filterSelect = {
  ...filterInput,
  appearance: "none",
  cursor: "pointer",
  backgroundColor: "#1e293b",
  color: "#f1f5f9",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "2rem",
};

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "20px",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
  display: "flex",
  flexDirection: "column",
};

const priceBadge = {
  display: "inline-block",
  padding: "0.5rem 1.25rem",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  borderRadius: "10px",
  color: "white",
  fontWeight: "700",
  fontSize: "1.25rem",
};

const visibilityPill = (isPublic) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0.35rem 0.6rem",
  borderRadius: 999,
  marginTop: 8,
  fontSize: "0.8rem",
  fontWeight: 700,
  color: isPublic ? "#065f46" : "#991b1b",
  background: isPublic ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
  border: `1px solid ${
    isPublic ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"
  }`,
});

/* ✅ meta pills */
const metaRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 12,
};

const pill = (variant = "neutral") => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0.28rem 0.55rem",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  border: "1px solid rgba(0,0,0,0.08)",
  background:
    variant === "type"
      ? "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(37,99,235,0.16))"
      : variant === "act16"
      ? "linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))"
      : variant === "floor"
      ? "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(124,58,237,0.16))"
      : "rgba(15,23,42,0.06)",
  color:
    variant === "type"
      ? "#1d4ed8"
      : variant === "act16"
      ? "#065f46"
      : variant === "floor"
      ? "#5b21b6"
      : "#334155",
});

const cardActions = {
  padding: "1rem 1.5rem",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "0.75rem",
  background: "rgba(241,245,249,0.5)",
};

const actionBtn = (type) => ({
  width: "100%",
  background:
    type === "green"
      ? "linear-gradient(135deg, #10b981, #059669)"
      : type === "blue"
      ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
      : "linear-gradient(135deg, #ef4444, #dc2626)",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  padding: "0.8rem",
});

const loaderContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
};

const loaderSpinner = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(255,255,255,0.3)",
  borderTop: "4px solid #3b82f6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const emptyState = { color: "#94a3b8", textAlign: "center", marginTop: "2rem" };

/* 🧭 Component */
export default function MyEstates() {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth <= 1200;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [estates, setEstates] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // filters
  const [titleSearch, setTitleSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [propertyType, setPropertyType] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [floor, setFloor] = useState("");
  const [act16, setAct16] = useState("all"); // all | yes | no

  const navigate = useNavigate();

  const fetchEstates = useCallback(
    async (userId, overrides = {}) => {
      const {
        title = titleSearch,
        location = locationSearch,
        sort = sortOrder,
        pType = propertyType,
        bType = buildingType,
        fl = floor,
        a16 = act16,
      } = overrides;

      setLoading(true);
      let query = supabase.from("estates").select("*").eq("user_id", userId);

      if (title.trim()) query = query.ilike("title", `%${title}%`);
      if (location.trim()) query = query.ilike("location", `%${location}%`);

      if (pType) query = query.eq("property_type", pType);
      if (bType) query = query.eq("building_type", bType);
      if (fl) query = query.eq("floor", fl);
      if (a16 === "yes") query = query.eq("has_act16", true);
      if (a16 === "no") query = query.eq("has_act16", false);

      if (sort === "low-high") query = query.order("price", { ascending: true });
      else if (sort === "high-low") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (!error) setEstates(data || []);
      setLoading(false);
      setTimeout(() => setIsLoaded(true), 150);
    },
    [titleSearch, locationSearch, sortOrder, propertyType, buildingType, floor, act16]
  );

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, is_admin")
        .eq("id", userData.user.id)
        .single();

      setProfile(profileData || {});
      fetchEstates(userData.user.id);
    };
    init();
  }, [navigate, fetchEstates]);

  /* ✅ AUTO-REFRESH on filter change (like Marketplace) */
  useEffect(() => {
    if (!profile?.id) return;

    const t = setTimeout(() => {
      fetchEstates(profile.id, {
        title: titleSearch,
        location: locationSearch,
        sort: sortOrder,
        pType: propertyType,
        bType: buildingType,
        fl: floor,
        a16: act16,
      });
    }, 400);

    return () => clearTimeout(t);
  }, [
    profile,
    titleSearch,
    locationSearch,
    sortOrder,
    propertyType,
    buildingType,
    floor,
    act16,
    fetchEstates,
  ]);

  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете този имот?")) return;
    const { error } = await supabase.from("estates").delete().eq("id", id);
    if (!error) setEstates((prev) => prev.filter((e) => e.id !== id));
  };

  const handleTogglePublic = async (estate) => {
    const next = !estate.is_public;
    const { error } = await supabase
      .from("estates")
      .update({ is_public: next })
      .eq("id", estate.id);

    if (!error) {
      setEstates((prev) =>
        prev.map((e) => (e.id === estate.id ? { ...e, is_public: next } : e))
      );
    } else {
      alert("Неуспешна промяна на видимостта в пазара.");
    }
  };

  return (
    <div style={{ ...pageContainer, opacity: isLoaded ? 1 : 0 }}>
      <div style={bgLight("#3b82f6", "10%", "5%", 300)} />
      <div style={bgLight("#8b5cf6", "80%", "85%", 400)} />

      <style>{`
        ${keyframes}
        select option { background: #0f172a; color: #f1f5f9; }
      `}</style>

      <NavBar profile={profile} />

      <main
        style={{
          ...mainStyle,
          padding: isMobile ? "1rem 0.85rem 1.4rem" : isTablet ? "2rem 1.25rem" : mainStyle.padding,
        }}
      >
        <div style={contentWrapper}>
          <div style={{ ...titleBar, alignItems: isMobile ? "stretch" : titleBar.alignItems }}>
            <h1 style={{ ...pageTitle, fontSize: isMobile ? "1.75rem" : pageTitle.fontSize }}>
              Моите имоти
            </h1>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <Link to="/marketplace">
                <button
                  style={{
                    ...addButton,
                    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  }}
                >
                  🛒
                </button>
              </Link>
              <Link to="/add-estate">
                <button style={addButton}>➕</button>
              </Link>
            </div>
          </div>

          {/* Filters (Marketplace-like grid) */}
          <div
            style={{
              ...filterBar,
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2, minmax(180px, 1fr))"
                : filterBar.gridTemplateColumns,
            }}
          >
            <input
              type="text"
              placeholder="Търсене по заглавие..."
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              style={filterInput}
            />

            <input
              type="text"
              placeholder="Търсене по локация..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              style={filterInput}
            />

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={filterSelect}
            >
              <option value="">Вид на имота (всички)</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select value={act16} onChange={(e) => setAct16(e.target.value)} style={filterSelect}>
              <option value="all">Акт 16 (всички)</option>
              <option value="yes">Само с Акт 16</option>
              <option value="no">Само без Акт 16</option>
            </select>

            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={filterSelect}
            >
              <option value="">Вид на сградата (всички)</option>
              {BUILDING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select value={floor} onChange={(e) => setFloor(e.target.value)} style={filterSelect}>
              <option value="">Етаж (всички)</option>
              {FLOORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={filterSelect}>
              <option value="newest">Най-нови първо</option>
              <option value="low-high">Цена: ниска → висока</option>
              <option value="high-low">Цена: висока → ниска</option>
            </select>

            {/* Reset row full width */}
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setTitleSearch("");
                  setLocationSearch("");
                  setPropertyType("");
                  setBuildingType("");
                  setFloor("");
                  setAct16("all");
                  setSortOrder("newest");

                  if (profile?.id) {
                    fetchEstates(profile.id, {
                      title: "",
                      location: "",
                      sort: "newest",
                      pType: "",
                      bType: "",
                      fl: "",
                      a16: "all",
                    });
                  }
                }}
                style={{
                  padding: "0.7rem 1rem",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Нулирай
              </button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={loaderContainer}>
              <div style={loaderSpinner} />
            </div>
          ) : estates.length > 0 ? (
            <div
              style={{
                ...grid,
                gridTemplateColumns: isMobile ? "1fr" : grid.gridTemplateColumns,
                gap: isMobile ? "1rem" : grid.gap,
              }}
            >
              {estates.map((estate) => (
                <EstateCard
                  key={estate.id}
                  estate={estate}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  handleDelete={handleDelete}
                  handleTogglePublic={handleTogglePublic}
                  navigate={navigate}
                />
              ))}
            </div>
          ) : (
            <p style={emptyState}>Няма намерени имоти.</p>
          )}
        </div>
      </main>

    </div>
  );
}

/* 🔹 Estate Card */
function EstateCard({
  estate,
  hoveredCard,
  setHoveredCard,
  handleDelete,
  handleTogglePublic,
  navigate,
}) {
  const isPublic = !!estate.is_public;

  const showFloor =
    estate.floor && String(estate.floor).trim() !== "" && estate.floor !== "Не е приложимо";
  const showAct16 = estate.has_act16 === true;

  return (
    <div
      style={{
        ...cardStyle,
        boxShadow:
          hoveredCard === estate.id
            ? "0 20px 60px rgba(59,130,246,0.4)"
            : "0 10px 40px rgba(0,0,0,0.3)",
        transform: hoveredCard === estate.id ? "translateY(-8px) scale(1.02)" : "translateY(0)",
      }}
      onMouseEnter={() => setHoveredCard(estate.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {estate.image_url && (
        <img
          src={estate.image_url}
          alt={estate.title}
          style={{
            width: "100%",
            height: "220px",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hoveredCard === estate.id ? "scale(1.05)" : "scale(1)",
          }}
        />
      )}

      <div style={{ padding: "1.5rem", flex: 1 }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
          {estate.title}
        </h3>

        <p style={{ color: "#64748b", margin: "0.5rem 0 0.75rem" }}>📍 {estate.location}</p>

        <div style={visibilityPill(isPublic)}>{isPublic ? "Публично в пазара" : "Частно"}</div>

        {/* meta pills */}
        <div style={metaRow}>
          {estate.property_type ? <span style={pill("type")}>🏠 {estate.property_type}</span> : null}
          {showAct16 ? <span style={pill("act16")}>✅ Акт 16</span> : null}
          {showFloor ? <span style={pill("floor")}>🧱 Етаж: {estate.floor}</span> : null}
          {estate.building_type ? <span style={pill("neutral")}>🏢 {estate.building_type}</span> : null}
        </div>

        <div style={{ marginTop: "0.9rem" }}>
          <span style={priceBadge}>€{Number(estate.price || 0).toLocaleString()}</span>
        </div>
      </div>

      <div style={cardActions}>
        <button
          style={actionBtn("blue")}
          onClick={() => handleTogglePublic(estate)}
          title={isPublic ? "Премахни от пазара" : "Публикувай в пазара"}
        >
          {isPublic ? "🙈" : "🌐"}
        </button>
        <button style={actionBtn("green")} onClick={() => navigate(`/edit-estate/${estate.id}`)}>
          ✏️
        </button>
        <button style={actionBtn()} onClick={() => handleDelete(estate.id)}>
          🗑️
        </button>
      </div>
    </div>
  );
}
